import {
  BadgeCheck,
  Bookmark,
  Cast,
  ChevronDown,
  ChevronUp,
  Download,
  Maximize,
  MessageCircle,
  MoreVertical,
  Pause,
  Play,
  Settings,
  Share2,
  ThumbsUp,
} from "lucide-react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CommentSection } from "@/components/CommentSection";
import { VideoCard } from "@/components/VideoCard";
import type { Video } from "@/data/mockData";
import { videosApi, subscriptionsApi } from "@/services/api";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

export default function WatchScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [video, setVideo] = useState<Video | null>(null);
  const [related, setRelated] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [subscribed, setSubscribed] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      videosApi.detail(id),
      videosApi.list(),
    ])
      .then(([detail, all]) => {
        setVideo(detail);
        setLikes(detail.likes);
        setRelated(all.filter((v) => v.id !== String(id)).slice(0, 10));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleLike = async () => {
    if (!video) return;
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikes((l) => (wasLiked ? l - 1 : l + 1));
    try {
      if (wasLiked) {
        await videosApi.unlike(video.id);
      } else {
        await videosApi.like(video.id);
      }
    } catch {
      setLiked(wasLiked);
      setLikes((l) => (wasLiked ? l + 1 : l - 1));
    }
  };

  const handleSubscribe = async () => {
    if (!video?.scholarId) return;
    const wasSubscribed = subscribed;
    setSubscribed(!wasSubscribed);
    try {
      if (wasSubscribed) {
        await subscriptionsApi.unfollow(video.scholarId);
      } else {
        await subscriptionsApi.follow(video.scholarId);
      }
    } catch {
      setSubscribed(wasSubscribed);
    }
  };

  if (loading) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!video) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }]}>
        <Text style={{ color: colors.mutedForeground }}>Video not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.playerWrapper}>
          <Image source={video.thumbnail} style={styles.playerThumb} contentFit="cover" />
          <LinearGradient
            colors={["rgba(0,0,0,0.4)", "transparent", "rgba(0,0,0,0.6)"]}
            style={StyleSheet.absoluteFill}
          />

          <View style={[styles.playerTop, { paddingTop: topPad + 4 }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ChevronDown size={24} color="#fff" strokeWidth={2} />
            </TouchableOpacity>
            <View style={styles.playerTopRight}>
              <TouchableOpacity style={styles.playerIconBtn}>
                <Cast size={20} color="#fff" strokeWidth={1.8} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.playerIconBtn}>
                <MoreVertical size={20} color="#fff" strokeWidth={1.8} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.playCenter} onPress={() => setIsPlaying((p) => !p)}>
            <View style={styles.playCircle}>
              {isPlaying ? (
                <Pause size={32} color="#fff" fill="#fff" strokeWidth={0} />
              ) : (
                <Play size={32} color="#fff" fill="#fff" strokeWidth={0} style={{ marginLeft: 3 }} />
              )}
            </View>
          </TouchableOpacity>

          <View style={styles.playerBottom}>
            <View style={[styles.progressBar, { backgroundColor: "rgba(255,255,255,0.3)" }]}>
              <View style={[styles.progressFill, { backgroundColor: colors.primary, width: "35%" }]} />
            </View>
            <View style={styles.playerControls}>
              <Text style={styles.timeText}>0:00 / {video.duration}</Text>
              <View style={styles.rightControls}>
                <TouchableOpacity style={styles.playerIconBtn}>
                  <Settings size={18} color="#fff" strokeWidth={1.8} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.playerIconBtn}>
                  <Maximize size={20} color="#fff" strokeWidth={1.8} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.foreground }]}>{video.title}</Text>

          <Text style={[styles.statsText, { color: colors.mutedForeground }]}>
            {video.views} views · {video.createdAt}
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: liked ? colors.accent : colors.secondary }]}
              onPress={handleLike}
            >
              <ThumbsUp
                size={18}
                color={liked ? colors.primary : colors.foreground}
                fill={liked ? colors.primary : "transparent"}
                strokeWidth={1.8}
              />
              <Text style={[styles.actionLabel, { color: liked ? colors.primary : colors.foreground }]}>
                {likes >= 1000 ? `${(likes / 1000).toFixed(0)}K` : likes}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.secondary }]}
              onPress={() => setShowComments((s) => !s)}
            >
              <MessageCircle size={18} color={colors.foreground} strokeWidth={1.8} />
              <Text style={[styles.actionLabel, { color: colors.foreground }]}>Comment</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.secondary }]}>
              <Share2 size={18} color={colors.foreground} strokeWidth={1.8} />
              <Text style={[styles.actionLabel, { color: colors.foreground }]}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.secondary }]}>
              <Bookmark size={18} color={colors.foreground} strokeWidth={1.8} />
              <Text style={[styles.actionLabel, { color: colors.foreground }]}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.secondary }]}>
              <Download size={18} color={colors.foreground} strokeWidth={1.8} />
              <Text style={[styles.actionLabel, { color: colors.foreground }]}>Download</Text>
            </TouchableOpacity>
          </ScrollView>

          <TouchableOpacity
            style={[styles.scholarCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push(`/channel/${video.scholarId}`)}
          >
            <Image source={video.scholarAvatar} style={styles.scholarAvatar} contentFit="cover" />
            <View style={styles.scholarInfo}>
              <View style={styles.scholarNameRow}>
                <Text style={[styles.scholarName, { color: colors.foreground }]}>{video.scholar}</Text>
                <BadgeCheck size={15} color={colors.primary} fill={colors.primary} strokeWidth={0} />
              </View>
              {video.subscribers && (
                <Text style={[styles.subscriberCount, { color: colors.mutedForeground }]}>
                  {video.subscribers} subscribers
                </Text>
              )}
            </View>
            <TouchableOpacity
              style={[
                styles.subscribeBtn,
                { backgroundColor: subscribed ? colors.secondary : colors.primary },
              ]}
              onPress={handleSubscribe}
            >
              <Text style={[styles.subscribeBtnText, { color: subscribed ? colors.foreground : "#fff" }]}>
                {subscribed ? "Subscribed" : "Subscribe"}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>

          {video.description ? (
            <TouchableOpacity
              style={[styles.descCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => setShowFullDesc((s) => !s)}
            >
              <Text style={[styles.descText, { color: colors.foreground }]} numberOfLines={showFullDesc ? undefined : 3}>
                {video.description}
              </Text>
              <Text style={[styles.descToggle, { color: colors.primary }]}>
                {showFullDesc ? "Show less" : "Show more"}
              </Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={[styles.commentsToggle, { borderColor: colors.border }]}
            onPress={() => setShowComments((s) => !s)}
          >
            <Text style={[styles.commentsToggleText, { color: colors.foreground }]}>Comments</Text>
            {showComments ? (
              <ChevronUp size={20} color={colors.mutedForeground} strokeWidth={1.8} />
            ) : (
              <ChevronDown size={20} color={colors.mutedForeground} strokeWidth={1.8} />
            )}
          </TouchableOpacity>

          {showComments && <CommentSection videoId={video.id} />}
        </View>

        {related.length > 0 && (
          <View style={styles.relatedSection}>
            <Text style={[styles.relatedTitle, { color: colors.foreground }]}>Related Videos</Text>
            {related.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  playerWrapper: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
    position: "relative",
  },
  playerThumb: { width: "100%", height: "100%", position: "absolute" },
  playerTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  backBtn: { padding: 4 },
  playerTopRight: { flexDirection: "row", gap: 8 },
  playerIconBtn: { padding: 6 },
  playCenter: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  playCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  playerBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    gap: 6,
  },
  progressBar: { height: 3, borderRadius: 2, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 2 },
  playerControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timeText: { color: "#fff", fontSize: 12 },
  rightControls: { flexDirection: "row", gap: 4 },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4, gap: 14 },
  relatedSection: { paddingBottom: 8 },
  title: { fontSize: 16, fontWeight: "700", lineHeight: 22 },
  statsText: { fontSize: 13 },
  actions: { gap: 8, paddingVertical: 2 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
  },
  actionLabel: { fontSize: 13, fontWeight: "500" },
  scholarCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  scholarAvatar: { width: 44, height: 44, borderRadius: 22 },
  scholarInfo: { flex: 1, gap: 2 },
  scholarNameRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  scholarName: { fontSize: 14, fontWeight: "700" },
  subscriberCount: { fontSize: 12 },
  subscribeBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  subscribeBtnText: { fontSize: 13, fontWeight: "700" },
  descCard: {
    padding: 12,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  descText: { fontSize: 13, lineHeight: 19 },
  descToggle: { fontSize: 13, fontWeight: "600" },
  commentsToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  commentsToggleText: { fontSize: 15, fontWeight: "700" },
  relatedTitle: { fontSize: 15, fontWeight: "700", paddingHorizontal: 12, paddingTop: 12, paddingBottom: 6 },
});
