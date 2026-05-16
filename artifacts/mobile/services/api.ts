import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Platform } from "react-native";

import type { Video, Scholar, Comment } from "@/data/mockData";

const PLACEHOLDER_THUMB = require("../assets/images/placeholder-thumbnail.png");
const PLACEHOLDER_AVATAR = require("../assets/images/placeholder-scholar.png");

const BASE_URL = (() => {
  if (Platform.OS === "web") {
    return "http://localhost:5000/api";
  }
  return process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000/api";
})();
const ACCESS_KEY = "islamictube_access_token";
const REFRESH_KEY = "islamictube_refresh_token";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 12000,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(ACCESS_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

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
  };
}

function paginatedList(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (data?.results) return data.results;
  return [];
}

export const videosApi = {
  list: async (params?: { category?: string; type?: string }): Promise<Video[]> => {
    const res = await apiClient.get("/videos/", { params });
    return paginatedList(res.data).map(normalizeVideo);
  },

  shorts: async (): Promise<Video[]> => {
    const res = await apiClient.get("/videos/", { params: { type: "short" } });
    return paginatedList(res.data)
      .filter((v: any) => v.video_type === "short")
      .map(normalizeVideo);
  },

  detail: async (id: string): Promise<Video> => {
    const res = await apiClient.get(`/videos/${id}/`);
    return normalizeVideo(res.data);
  },

  like: async (id: string): Promise<void> => {
    await apiClient.post(`/videos/${id}/like/`);
  },

  unlike: async (id: string): Promise<void> => {
    await apiClient.delete(`/videos/${id}/unlike/`);
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
    return normalizeComment(res.data);
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
