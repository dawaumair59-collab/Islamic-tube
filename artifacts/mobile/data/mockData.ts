export interface Video {
  id: string;
  title: string;
  description: string;
  scholar: string;
  scholarId: string;
  scholarAvatar: string;
  views: string;
  likes: number;
  thumbnail: string;
  videoUrl: string;
  category: string;
  type: "long" | "short";
  duration: string;
  createdAt: string;
  subscribers?: string;
}

export interface Scholar {
  id: string;
  name: string;
  bio: string;
  avatar: string;
  subscribers: string;
  totalVideos: number;
  location: string;
  verified: boolean;
}

export interface Playlist {
  id: string;
  title: string;
  thumbnail: string;
  videoCount: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  time: string;
  likes: number;
}

export interface Notification {
  id: string;
  type: "upload" | "live" | "subscription";
  scholar: string;
  scholarAvatar: string;
  message: string;
  time: string;
  read: boolean;
  thumbnail?: string;
}

export interface LiveStream {
  id: string;
  title: string;
  scholar: string;
  scholarAvatar: string;
  thumbnail: string;
  viewers: string;
  scheduledAt?: string;
  isLive: boolean;
}

const THUMBNAIL = require("../assets/images/placeholder-thumbnail.png");
const SCHOLAR_AVATAR = require("../assets/images/placeholder-scholar.png");
const HERO = require("../assets/images/hero-banner.png");

export const SCHOLARS: Scholar[] = [
  {
    id: "s1",
    name: "Sheikh Omar Suleiman",
    bio: "Founder & President of Yaqeen Institute for Islamic Research. Author and activist focused on spiritual development.",
    avatar: SCHOLAR_AVATAR,
    subscribers: "2.1M",
    totalVideos: 847,
    location: "Dallas, TX",
    verified: true,
  },
  {
    id: "s2",
    name: "Mufti Menk",
    bio: "A motivational speaker and scholar from Zimbabwe. Known for his authentic and relatable teaching style.",
    avatar: SCHOLAR_AVATAR,
    subscribers: "3.4M",
    totalVideos: 1203,
    location: "Harare, Zimbabwe",
    verified: true,
  },
  {
    id: "s3",
    name: "Sheikh Yasir Qadhi",
    bio: "Islamic scholar and theologian. Dean of Academic Affairs at Al-Maghrib Institute.",
    avatar: SCHOLAR_AVATAR,
    subscribers: "1.8M",
    totalVideos: 624,
    location: "Memphis, TN",
    verified: true,
  },
  {
    id: "s4",
    name: "Sheikh Nouman Ali Khan",
    bio: "Founder and CEO of Bayyinah Institute. Renowned for Quran study and Arabic linguistics.",
    avatar: SCHOLAR_AVATAR,
    subscribers: "2.7M",
    totalVideos: 935,
    location: "Dallas, TX",
    verified: true,
  },
];

export const VIDEOS: Video[] = [
  {
    id: "v1",
    title: "The Power of Gratitude in Islam — A Deep Dive",
    description:
      "Exploring the profound concept of shukr (gratitude) in the Quran and Sunnah. Learn how gratitude transforms your relationship with Allah and brings barakah into your life.",
    scholar: "Sheikh Omar Suleiman",
    scholarId: "s1",
    scholarAvatar: SCHOLAR_AVATAR,
    views: "1.2M",
    likes: 48000,
    thumbnail: THUMBNAIL,
    videoUrl: "",
    category: "Spirituality",
    type: "long",
    duration: "42:18",
    createdAt: "2 days ago",
    subscribers: "2.1M",
  },
  {
    id: "v2",
    title: "Understanding Surah Al-Fatiha — Complete Tafsir",
    description:
      "A comprehensive explanation of the opening chapter of the Quran. Every Muslim recites this in every prayer — do you truly understand what you're saying?",
    scholar: "Sheikh Nouman Ali Khan",
    scholarId: "s4",
    scholarAvatar: SCHOLAR_AVATAR,
    views: "3.8M",
    likes: 127000,
    thumbnail: THUMBNAIL,
    videoUrl: "",
    category: "Quran",
    type: "long",
    duration: "1:12:44",
    createdAt: "1 week ago",
    subscribers: "2.7M",
  },
  {
    id: "v3",
    title: "How to Perform the Perfect Salah",
    description:
      "Step-by-step guide to performing the five daily prayers with proper form, concentration, and khushoo (humility).",
    scholar: "Mufti Menk",
    scholarId: "s2",
    scholarAvatar: SCHOLAR_AVATAR,
    views: "5.1M",
    likes: 203000,
    thumbnail: THUMBNAIL,
    videoUrl: "",
    category: "Fiqh",
    type: "long",
    duration: "38:22",
    createdAt: "3 weeks ago",
    subscribers: "3.4M",
  },
  {
    id: "v4",
    title: "The Story of Prophet Ibrahim (AS) — Full Series",
    description:
      "The remarkable life of Prophet Ibrahim, from his early opposition to idolatry to his covenant with Allah.",
    scholar: "Sheikh Yasir Qadhi",
    scholarId: "s3",
    scholarAvatar: SCHOLAR_AVATAR,
    views: "2.3M",
    likes: 89000,
    thumbnail: THUMBNAIL,
    videoUrl: "",
    category: "Seerah",
    type: "long",
    duration: "58:07",
    createdAt: "5 days ago",
    subscribers: "1.8M",
  },
  {
    id: "v5",
    title: "Ramadan Preparation Guide — Complete Checklist",
    description:
      "Everything you need to spiritually, physically, and mentally prepare for the blessed month of Ramadan.",
    scholar: "Sheikh Omar Suleiman",
    scholarId: "s1",
    scholarAvatar: SCHOLAR_AVATAR,
    views: "892K",
    likes: 34000,
    thumbnail: THUMBNAIL,
    videoUrl: "",
    category: "Ramadan",
    type: "long",
    duration: "24:51",
    createdAt: "1 month ago",
    subscribers: "2.1M",
  },
  {
    id: "v6",
    title: "Marriage in Islam — Rights and Responsibilities",
    description:
      "A balanced discussion on the Islamic perspective on marriage, mutual rights, and building a strong Muslim family.",
    scholar: "Mufti Menk",
    scholarId: "s2",
    scholarAvatar: SCHOLAR_AVATAR,
    views: "1.7M",
    likes: 67000,
    thumbnail: THUMBNAIL,
    videoUrl: "",
    category: "Family",
    type: "long",
    duration: "51:33",
    createdAt: "2 weeks ago",
    subscribers: "3.4M",
  },
];

export const SHORTS: Video[] = [
  {
    id: "sh1",
    title: "Daily Dhikr to Start Your Morning",
    description: "3 powerful dhikrs to begin every morning with peace and barakah.",
    scholar: "Mufti Menk",
    scholarId: "s2",
    scholarAvatar: SCHOLAR_AVATAR,
    views: "4.2M",
    likes: 312000,
    thumbnail: THUMBNAIL,
    videoUrl: "",
    category: "Dhikr",
    type: "short",
    duration: "0:58",
    createdAt: "1 day ago",
  },
  {
    id: "sh2",
    title: "The Best Dua for Anxiety",
    description: "A short but powerful supplication when you feel overwhelmed.",
    scholar: "Sheikh Omar Suleiman",
    scholarId: "s1",
    scholarAvatar: SCHOLAR_AVATAR,
    views: "8.1M",
    likes: 521000,
    thumbnail: THUMBNAIL,
    videoUrl: "",
    category: "Dua",
    type: "short",
    duration: "1:12",
    createdAt: "3 hours ago",
  },
  {
    id: "sh3",
    title: "Why We Face Hardship — 60 Seconds",
    description: "A reminder that every hardship is a test and an opportunity.",
    scholar: "Sheikh Nouman Ali Khan",
    scholarId: "s4",
    scholarAvatar: SCHOLAR_AVATAR,
    views: "6.3M",
    likes: 445000,
    thumbnail: THUMBNAIL,
    videoUrl: "",
    category: "Spirituality",
    type: "short",
    duration: "0:47",
    createdAt: "5 hours ago",
  },
  {
    id: "sh4",
    title: "Powerful Reminder: Your Time is Limited",
    description: "Reflect on the fleeting nature of this world.",
    scholar: "Sheikh Yasir Qadhi",
    scholarId: "s3",
    scholarAvatar: SCHOLAR_AVATAR,
    views: "3.7M",
    likes: 289000,
    thumbnail: THUMBNAIL,
    videoUrl: "",
    category: "Reminder",
    type: "short",
    duration: "0:55",
    createdAt: "2 days ago",
  },
  {
    id: "sh5",
    title: "Istighfar — Seek Forgiveness Daily",
    description: "The immense reward of seeking forgiveness from Allah.",
    scholar: "Mufti Menk",
    scholarId: "s2",
    scholarAvatar: SCHOLAR_AVATAR,
    views: "9.2M",
    likes: 612000,
    thumbnail: THUMBNAIL,
    videoUrl: "",
    category: "Dhikr",
    type: "short",
    duration: "1:03",
    createdAt: "6 hours ago",
  },
];

export const PLAYLISTS: Playlist[] = [
  {
    id: "p1",
    title: "Seerah Series — Life of the Prophet",
    thumbnail: THUMBNAIL,
    videoCount: 24,
    createdAt: "3 months ago",
  },
  {
    id: "p2",
    title: "Quran Tafsir — Juz Amma",
    thumbnail: THUMBNAIL,
    videoCount: 37,
    createdAt: "6 months ago",
  },
  {
    id: "p3",
    title: "Islamic Finance Principles",
    thumbnail: THUMBNAIL,
    videoCount: 12,
    createdAt: "1 month ago",
  },
  {
    id: "p4",
    title: "Friday Khutbahs Collection",
    thumbnail: THUMBNAIL,
    videoCount: 52,
    createdAt: "1 year ago",
  },
];

export const COMMENTS: Comment[] = [
  {
    id: "c1",
    author: "Abdullah Hassan",
    avatar: SCHOLAR_AVATAR,
    text: "SubhanAllah, this lecture changed my perspective completely. May Allah reward the Sheikh.",
    time: "2 hours ago",
    likes: 247,
  },
  {
    id: "c2",
    author: "Fatima Al-Rashid",
    avatar: SCHOLAR_AVATAR,
    text: "I've watched this 3 times already. Every time I find something new. JazakAllah khair.",
    time: "5 hours ago",
    likes: 189,
  },
  {
    id: "c3",
    author: "Ibrahim Malik",
    avatar: SCHOLAR_AVATAR,
    text: "This is exactly what I needed to hear today. The explanation at 18:42 was profound.",
    time: "1 day ago",
    likes: 312,
  },
  {
    id: "c4",
    author: "Aisha Khalid",
    avatar: SCHOLAR_AVATAR,
    text: "Please make more content like this. This is the kind of Islamic education the world needs.",
    time: "1 day ago",
    likes: 156,
  },
  {
    id: "c5",
    author: "Yusuf Al-Amin",
    avatar: SCHOLAR_AVATAR,
    text: "Alhamdulillah, sharing this with my whole family. Barakallahu feek Sheikh.",
    time: "2 days ago",
    likes: 421,
  },
];

export const NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    type: "upload",
    scholar: "Mufti Menk",
    scholarAvatar: SCHOLAR_AVATAR,
    message: "uploaded a new video: 'The Power of Tawakkul in Difficult Times'",
    time: "30 minutes ago",
    read: false,
    thumbnail: THUMBNAIL,
  },
  {
    id: "n2",
    type: "live",
    scholar: "Sheikh Omar Suleiman",
    scholarAvatar: SCHOLAR_AVATAR,
    message: "is going LIVE in 1 hour — 'Friday Night Reflections'",
    time: "1 hour ago",
    read: false,
  },
  {
    id: "n3",
    type: "subscription",
    scholar: "Sheikh Nouman Ali Khan",
    scholarAvatar: SCHOLAR_AVATAR,
    message: "uploaded a new video: 'Arabic Roots in Surah Al-Baqarah'",
    time: "3 hours ago",
    read: true,
    thumbnail: THUMBNAIL,
  },
  {
    id: "n4",
    type: "upload",
    scholar: "Sheikh Yasir Qadhi",
    scholarAvatar: SCHOLAR_AVATAR,
    message: "uploaded a new video: 'Islamic History — The Golden Age'",
    time: "5 hours ago",
    read: true,
    thumbnail: THUMBNAIL,
  },
  {
    id: "n5",
    type: "live",
    scholar: "Mufti Menk",
    scholarAvatar: SCHOLAR_AVATAR,
    message: "went LIVE — watch the recording now",
    time: "Yesterday",
    read: true,
  },
];

export const LIVE_STREAMS: LiveStream[] = [
  {
    id: "l1",
    title: "Friday Night Reflections — Live Halaqa",
    scholar: "Sheikh Omar Suleiman",
    scholarAvatar: SCHOLAR_AVATAR,
    thumbnail: THUMBNAIL,
    viewers: "12.4K",
    isLive: true,
  },
  {
    id: "l2",
    title: "Quran Recitation & Tafsir — Evening Session",
    scholar: "Sheikh Nouman Ali Khan",
    scholarAvatar: SCHOLAR_AVATAR,
    thumbnail: THUMBNAIL,
    viewers: "8.7K",
    isLive: true,
  },
  {
    id: "l3",
    title: "Ask the Scholar — Monthly Q&A",
    scholar: "Sheikh Yasir Qadhi",
    scholarAvatar: SCHOLAR_AVATAR,
    thumbnail: THUMBNAIL,
    viewers: "0",
    scheduledAt: "Tomorrow, 8:00 PM EST",
    isLive: false,
  },
];

export interface WatchProgress {
  videoId: string;
  progress: number; // 0.0 – 1.0
  watchedAt: string;
}

export const CONTINUE_WATCHING: WatchProgress[] = [
  { videoId: "v2", progress: 0.35, watchedAt: "Today" },
  { videoId: "v4", progress: 0.72, watchedAt: "Yesterday" },
  { videoId: "v1", progress: 0.18, watchedAt: "2 days ago" },
  { videoId: "v6", progress: 0.55, watchedAt: "2 days ago" },
  { videoId: "v5", progress: 0.91, watchedAt: "3 days ago" },
];

export const CATEGORIES = [
  "All",
  "Quran",
  "Hadith",
  "Lectures",
  "Dua",
  "Shorts",
  "Live",
  "Trending",
  "Fiqh",
  "Seerah",
  "Spirituality",
  "Ramadan",
];

export const HERO_BANNERS = [
  {
    id: "h1",
    image: HERO,
    title: "Ramadan 2025 Special Series",
    subtitle: "30 nights, 30 powerful reflections",
  },
  {
    id: "h2",
    image: HERO,
    title: "New: Seerah Masterclass",
    subtitle: "The complete life of the Prophet",
  },
  {
    id: "h3",
    image: HERO,
    title: "Friday Khutbah Collection",
    subtitle: "Over 500 sermons from top scholars",
  },
];
