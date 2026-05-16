import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Platform } from "react-native";

import type { Video, Scholar, Comment, Notification, NotificationType } from "@/data/mockData";
import { VIDEOS, SHORTS } from "@/data/mockData";

const PLACEHOLDER_THUMB = require("../assets/images/placeholder-thumbnail.png");
const PLACEHOLDER_AVATAR = require("../assets/images/placeholder-scholar.png");

const BASE_URL = (() => {
  if (Platform.OS === "web") {
    return "http://localhost:5000/api";
  }
  return process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000/api";
})();

export const ACCESS_KEY = "islamictube_access_token";
export const REFRESH_KEY = "islamictube_refresh_token";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 12000,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor: attach access token ──────────────────────
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(ACCESS_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor: refresh token on 401 ───────────────────
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

function processQueue(error: any, token: string | null) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return apiClient(original);
        });
      }
      original._retry = true;
      isRefreshing = true;
      try {
        const refresh = await AsyncStorage.getItem(REFRESH_KEY);
        if (!refresh) throw new Error("No refresh token");
        const res = await axios.post(`${BASE_URL}/auth/token/refresh/`, { refresh });
        const { access } = res.data;
        await AsyncStorage.setItem(ACCESS_KEY, access);
        apiClient.defaults.headers.common.Authorization = `Bearer ${access}`;
        processQueue(null, access);
        original.headers.Authorization = `Bearer ${access}`;
        return apiClient(original);
      } catch (err) {
        processQueue(err, null);
        await clearTokens();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export async function saveTokens(access: string, refresh: string) {
  await AsyncStorage.setItem(ACCESS_KEY, access);
  await AsyncStorage.setItem(REFRESH_KEY, refresh);
}

export async function clearTokens() {
  await AsyncStorage.removeItem(ACCESS_KEY);
  await AsyncStorage.removeItem(REFRESH_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return AsyncStorage.getItem(REFRESH_KEY);
}

function imageSource(url: string | null | undefined, fallback: any) {
  if (!url) return fallback;
  return Platform.OS === "web" ? url : { uri: url };
}

function formatViews(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return String(count);
}

function capitalizeCategory(cat: string | null | undefined): string {
  if (!cat) return "General";
  return cat.charAt(0).toUpperCase() + cat.slice(1);
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

export function normalizeVideo(raw: any): Video {
  const scholarUser = typeof raw.scholar === "object" ? raw.scholar : null;
  return {
    id: String(raw.id),
    title: raw.title ?? "",
    description: raw.description ?? "",
    scholar: raw.scholar_name ?? scholarUser?.full_name ?? "",
    scholarId: raw.scholar_username ?? scholarUser?.username ?? "",
    scholarAvatar: imageSource(scholarUser?.avatar_url, PLACEHOLDER_AVATAR),
    views: formatViews(raw.view_count ?? 0),
    likes: raw.like_count ?? 0,
    thumbnail: imageSource(raw.thumbnail_url, PLACEHOLDER_THUMB),
    videoUrl: raw.video_url ?? "",
    category: capitalizeCategory(raw.category),
    type: raw.video_type === "short" ? "short" : "long",
    duration: raw.duration_display ?? formatDuration(raw.duration ?? 0),
    createdAt: raw.created_at ? formatRelativeTime(raw.created_at) : "",
    subscribers: scholarUser?.scholar_profile?.subscriber_count != null
      ? String(scholarUser.scholar_profile.subscriber_count)
      : undefined,
  };
}

export function normalizeScholar(raw: any): Scholar {
  return {
    id: raw.user?.username ?? String(raw.id),
    name: raw.user?.full_name ?? "",
    bio: raw.bio ?? raw.user?.bio ?? "",
    avatar: imageSource(raw.user?.avatar_url, PLACEHOLDER_AVATAR),
    subscribers: String(raw.subscriber_count ?? 0),
    totalVideos: raw.video_count ?? 0,
    location: raw.institution ?? "",
    verified: raw.verified ?? false,
  };
}

export function normalizeComment(raw: any): Comment {
  return {
    id: String(raw.id),
    author: raw.full_name ?? raw.username ?? "Anonymous",
    avatar: imageSource(raw.avatar_url, PLACEHOLDER_AVATAR),
    text: raw.text ?? "",
    time: raw.created_at ? formatRelativeTime(raw.created_at) : "",
    likes: 0,
    userId: raw.user_id ? String(raw.user_id) : undefined,
  };
}

function paginatedList(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (data?.results) return data.results;
  return [];
}

export const videosApi = {
  list: async (params?: { category?: string; type?: string }): Promise<Video[]> => {
    try {
      const res = await apiClient.get("/videos/", {
        params: {
          category: params?.category?.toLowerCase(),
          type: params?.type,
        },
      });
      const videos = paginatedList(res.data).map(normalizeVideo);
      if (videos.length > 0) return videos;
    } catch {
      // fall through to mock
    }
    if (params?.type === "short") return SHORTS;
    if (params?.category) return VIDEOS.filter((v) => v.category === params.category);
    return VIDEOS;
  },

  shorts: async (): Promise<Video[]> => {
    try {
      const res = await apiClient.get("/videos/", { params: { type: "short" } });
      const videos = paginatedList(res.data).map(normalizeVideo);
      if (videos.length > 0) return videos;
    } catch {
      // fall through to mock
    }
    return SHORTS;
  },

  detail: async (id: string): Promise<Video> => {
    const res = await apiClient.get(`/videos/${id}/`);
    const data = res.data?.video ?? res.data;
    return normalizeVideo(data);
  },

  upload: async (payload: {
    title: string;
    description: string;
    category: string;
    video_type: string;
    video_url: string;
    thumbnail_url: string;
    duration: number;
    visibility: string;
    tags: string;
  }): Promise<any> => {
    const res = await apiClient.post("/videos/upload/", payload);
    return res.data;
  },

  myVideos: async (): Promise<Video[]> => {
    const res = await apiClient.get("/videos/my-videos/");
    return paginatedList(res.data).map(normalizeVideo);
  },

  report: async (id: string, reason: string, description: string): Promise<void> => {
    await apiClient.post(`/videos/${id}/report/`, { reason, description });
  },

  like: async (id: string): Promise<void> => {
    await apiClient.post(`/videos/${id}/like/`);
  },

  unlike: async (id: string): Promise<void> => {
    await apiClient.delete(`/videos/${id}/unlike/`);
  },
};

export const adminApi = {
  stats: async () => {
    const res = await apiClient.get("/auth/admin/stats/");
    return res.data.stats as {
      total_videos: number;
      total_users: number;
      total_scholars: number;
      pending_videos: number;
      pending_scholars: number;
      total_reports: number;
      approved_videos: number;
      rejected_videos: number;
    };
  },

  pendingVideos: async (): Promise<any[]> => {
    const res = await apiClient.get("/videos/pending/");
    return paginatedList(res.data);
  },

  approveVideo: async (id: string | number): Promise<void> => {
    await apiClient.patch(`/videos/${id}/approve/`);
  },

  rejectVideo: async (id: string | number, reason: string): Promise<void> => {
    await apiClient.patch(`/videos/${id}/reject/`, { rejection_reason: reason });
  },

  listUsers: async (): Promise<any[]> => {
    const res = await apiClient.get("/auth/admin/users/");
    return paginatedList(res.data);
  },

  banUser: async (id: number): Promise<boolean> => {
    const res = await apiClient.patch(`/auth/admin/users/${id}/ban/`);
    return res.data.is_active;
  },

  listScholarsPending: async (): Promise<any[]> => {
    const res = await apiClient.get("/auth/admin/scholars/?verified=false");
    return paginatedList(res.data);
  },

  verifyScholar: async (id: number): Promise<void> => {
    await apiClient.patch(`/auth/admin/scholars/${id}/verify/`);
  },

  rejectScholar: async (id: number): Promise<void> => {
    await apiClient.patch(`/auth/admin/scholars/${id}/reject/`);
  },

  listReports: async (): Promise<any[]> => {
    const res = await apiClient.get("/auth/admin/reports/");
    return paginatedList(res.data);
  },

  removeVideo: async (id: number): Promise<void> => {
    await apiClient.delete(`/auth/admin/videos/${id}/remove/`);
  },
};

export const searchApi = {
  search: async (query: string): Promise<{ videos: Video[]; scholars: Scholar[] }> => {
    const res = await apiClient.get("/search/", { params: { q: query } });
    const data = res.data;
    const videos = paginatedList(data?.results?.videos ?? data?.videos ?? []).map(normalizeVideo);
    const scholars = paginatedList(data?.results?.scholars ?? data?.scholars ?? []).map(normalizeScholar);
    return { videos, scholars };
  },

  trending: async (): Promise<string[]> => {
    const res = await apiClient.get("/search/trending/");
    const data = res.data;
    if (Array.isArray(data)) return data.map((t: any) => t.query ?? t);
    if (Array.isArray(data?.trending)) return data.trending.map((t: any) => t.query ?? t);
    return [];
  },
};

export const commentsApi = {
  list: async (videoId: string): Promise<Comment[]> => {
    const res = await apiClient.get(`/videos/${videoId}/comments/`);
    return paginatedList(res.data).map(normalizeComment);
  },

  create: async (videoId: string, text: string): Promise<Comment> => {
    const res = await apiClient.post(`/videos/${videoId}/comments/`, { text });
    const data = res.data?.comment ?? res.data;
    return normalizeComment(data);
  },

  delete: async (commentId: string): Promise<void> => {
    await apiClient.delete(`/comments/${commentId}/`);
  },
};

export const authApi = {
  login: async (email: string, password: string) => {
    const res = await apiClient.post("/auth/login/", { email, password });
    return res.data as { success: boolean; user: any; tokens: { access: string; refresh: string } };
  },

  register: async (
    full_name: string,
    username: string,
    email: string,
    password: string
  ) => {
    const res = await apiClient.post("/auth/register/", {
      full_name,
      username,
      email,
      password,
      confirm_password: password,
    });
    return res.data as { success: boolean; user: any; tokens: { access: string; refresh: string } };
  },

  logout: async () => {
    const refresh = await getRefreshToken();
    if (refresh) {
      await apiClient.post("/auth/logout/", { refresh }).catch(() => {});
    }
  },

  me: async () => {
    const res = await apiClient.get("/auth/me/");
    return res.data;
  },

  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post("/auth/forgot-password/", { email });
  },
};

export const scholarsApi = {
  list: async (): Promise<Scholar[]> => {
    const res = await apiClient.get("/auth/scholars/");
    const data = res.data;
    const scholars = Array.isArray(data) ? data
      : Array.isArray(data?.scholars) ? data.scholars
      : Array.isArray(data?.results) ? data.results
      : [];
    return scholars.map(normalizeScholar);
  },

  getByUsername: async (username: string): Promise<Scholar | null> => {
    const all = await scholarsApi.list();
    return all.find((s) => s.id === username) ?? null;
  },
};

export const subscriptionsApi = {
  follow: async (username: string): Promise<void> => {
    await apiClient.post(`/subscriptions/follow/${username}/`);
  },

  unfollow: async (username: string): Promise<void> => {
    await apiClient.delete(`/subscriptions/unfollow/${username}/`);
  },

  feed: async (): Promise<Video[]> => {
    const res = await apiClient.get("/subscriptions/feed/");
    return paginatedList(res.data).map(normalizeVideo);
  },
};

export const likesApi = {
  myLikes: async (): Promise<Video[]> => {
    const res = await apiClient.get("/likes/my-likes/");
    return paginatedList(res.data).map((item: any) => normalizeVideo(item.video ?? item));
  },
};

export const savedVideosApi = {
  list: async (): Promise<Video[]> => {
    const res = await apiClient.get("/saved/");
    return paginatedList(res.data).map((item: any) => normalizeVideo(item.video ?? item));
  },

  save: async (videoId: string): Promise<void> => {
    await apiClient.post(`/saved/${videoId}/`);
  },

  unsave: async (videoId: string): Promise<void> => {
    await apiClient.delete(`/saved/${videoId}/`);
  },

  isSaved: async (videoId: string): Promise<boolean> => {
    try {
      const res = await apiClient.get(`/saved/${videoId}/status/`);
      return res.data?.saved ?? false;
    } catch {
      return false;
    }
  },
};

export const watchHistoryApi = {
  list: async (): Promise<Video[]> => {
    try {
      const res = await apiClient.get("/watch-history/");
      return paginatedList(res.data).map((item: any) => normalizeVideo(item.video ?? item));
    } catch {
      return [];
    }
  },

  add: async (videoId: string): Promise<void> => {
    try {
      await apiClient.post(`/watch-history/${videoId}/`);
    } catch {
      // non-critical
    }
  },

  clear: async (): Promise<void> => {
    await apiClient.delete("/watch-history/");
  },
};

function normalizeApiNotification(raw: any): Notification {
  return {
    id: String(raw.id),
    type: (raw.notification_type ?? "new_video") as NotificationType,
    scholar: raw.sender_name ?? "IslamicTube",
    scholarAvatar: raw.sender_avatar
      ? imageSource(raw.sender_avatar, PLACEHOLDER_AVATAR)
      : PLACEHOLDER_AVATAR,
    message: raw.message ?? "",
    time: raw.created_at ? formatRelativeTime(raw.created_at) : "",
    read: raw.is_read ?? false,
    thumbnail: raw.video_thumbnail
      ? imageSource(raw.video_thumbnail, undefined)
      : undefined,
    videoId: raw.video ? String(raw.video) : undefined,
  };
}

export const notificationsApi = {
  list: async (): Promise<{ notifications: Notification[]; unreadCount: number }> => {
    const res = await apiClient.get("/notifications/");
    const data = res.data;
    const notifications = (data.notifications ?? []).map(normalizeApiNotification);
    return { notifications, unreadCount: data.unread_count ?? 0 };
  },

  unreadCount: async (): Promise<number> => {
    const res = await apiClient.get("/notifications/unread-count/");
    return res.data.unread_count ?? 0;
  },

  markRead: async (id: string): Promise<Notification> => {
    const res = await apiClient.patch(`/notifications/${id}/read/`);
    return normalizeApiNotification(res.data);
  },

  markAllRead: async (): Promise<void> => {
    await apiClient.patch("/notifications/read-all/");
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/notifications/${id}/`);
  },
};
