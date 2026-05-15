import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
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
import { VIDEOS } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

export default function WatchScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const video = VIDEOS.find((v) => v.id === id) ?? VIDEOS[0];
  const related = VIDEOS.filter((v) => v.id !== video.id);

  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(video.likes);
  const [subscribed, setSubscribed] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleLike = () => {
    setLiked((prev) => {
      setLikes((l) => (prev ? l - 1 : l + 1));
      return !prev;
    });
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Video Player */}
        <View style={styles.playerWrapper}>
          <Image
            source={video.thumbnail}
            style={styles.playerThumb}
            contentFit="cover"
          />
          <LinearGradient
            colors={["rgba(0,0,0,0.4)", "transparent", "rgba(0,0,0,0.6)"]}
            style={StyleSheet.absoluteFill}
          />

          {/* Top controls */}
          <View style={[styles.playerTop, { paddingTop: topPad + 4 }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="chevron-down" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.playerTopRight}>
              <TouchableOpacity style={styles.playerIconBtn}>
                <Feather name="cast" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.playerIconBtn}>
                <MaterialCommunityIcons name="dots-vertical" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Center play */}
          <TouchableOpacity
            style={styles.playCenter}
            onPress={() => setIsPlaying((p) => !p)}
          >
            <View style={styles.playCircle}>
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={32}
                color="#fff"
                style={{ marginLeft: isPlaying ? 0 : 3 }}
              />
            </View>
          </TouchableOpacity>

          {/* Bottom controls */}
          <View style={styles.playerBottom}>
            <View style={[styles.progressBar, { backgroundColor: "rgba(255,255,255,0.3)" }]}>
              <View style={[styles.progressFill, { backgroundColor: colors.primary, width: "35%" }]} />
            </View>
            <View style={styles.playerControls}>
              <Text style={styles.timeText}>15:42 / {video.duration}</Text>
              <View style={styles.rightControls}>
                <TouchableOpacity style={styles.playerIconBtn}>
                  <Feather name="settings" size={18} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.playerIconBtn}>
                  <MaterialCommunityIcons name="fullscreen" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          {/* Title */}
          <Text style={[styles.title, { color: colors.foreground }]}>{video.title}</Text>

          {/* Stats */}
          <View style={styles.statsRow}>
            <Text style={[styles.statsText, { color: colors.mutedForeground }]}>
              {video.views} views · {video.createdAt}
            </Text>
          </View>

          {/* Action buttons */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: liked ? colors.accent : colors.secondary }]}
              onPress={handleLike}
            >
              <Ionicons name={liked ? "thumbs-up" : "thumbs-up-outline"} size={18} color={liked ? colors.primary : colors.foreground} />
              <Text style={[styles.actionLabel, { color: liked ? colors.primary : colors.foreground }]}>
                {likes >= 1000 ? `${(likes / 1000).toFixed(0)}K` : likes}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.secondary }]}>
              <Ionicons name="chatbubble-outline" size={18} color={colors.foreground} />
              <Text style={[styles.actionLabel, { color: colors.foreground }]}>Comment</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.secondary }]}>
              <Feather name="share-2" size={18} color={colors.foreground} />
              <Text style={[styles.actionLabel, { color: colors.foreground }]}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.secondary }]}>
              <Feather name="bookmark" size={18} color={colors.foreground} />
              <Text style={[styles.actionLabel, { color: colors.foreground }]}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.secondary }]}>
              <MaterialCommunityIcons name="download-outline" size={18} color={colors.foreground} />
              <Text style={[styles.actionLabel, { color: colors.foreground }]}>Download</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Scholar card */}
          <TouchableOpacity
            style={[styles.scholarCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push(`/channel/${video.scholarId}`)}
          >
            <Image source={video.scholarAvatar} style={styles.scholarAvatar} contentFit="cover" />
            <View style={styles.scholarInfo}>
              <View style={styles.scholarNameRow}>
                <Text style={[styles.scholarName, { color: colors.foreground }]}>{video.scholar}</Text>
                <Ionicons name="checkmark-circle" size={15} color={colors.primary} />
              </View>
              <Text style={[styles.subscriberCount, { color: colors.mutedForeground }]}>
                {video.subscribers} subscribers
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.subscribeBtn,
                { backgroundColor: subscribed ? colors.secondary : colors.primary },
              ]}
              onPress={() => setSubscribed((s) => !s)}
            >
              <Text style={[styles.subscribeBtnText, { color: subscribed ? colors.foreground : "#fff" }]}>
                {subscribed ? "Subscribed" : "Subscribe"}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>

          {/* Description */}
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

          {/* Comments toggle */}
          <TouchableOpacity
            style={[styles.commentsToggle, { borderColor: colors.border }]}
            onPress={() => setShowComments((s) => !s)}
          >
            <Text style={[styles.commentsToggleText, { color: colors.foreground }]}>
              Comments (892)
            </Text>
            <Ionicons
              name={showComments ? "chevron-up" : "chevron-down"}
              size={20}
              color={colors.mutedForeground}
            />
          </TouchableOpacity>

          {showComments && <CommentSection />}

          {/* Related videos */}
          <Text style={[styles.relatedTitle, { color: colors.foreground }]}>Related Videos</Text>
          {related.map((v) => (
            <VideoCard key={v.id} video={v} horizontal />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  playerWrapper: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
    position: "relative",
  },
  playerThumb: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
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
  backBtn: {
    padding: 4,
  },
  playerTopRight: {
    flexDirection: "row",
    gap: 8,
  },
  playerIconBtn: {
    padding: 6,
  },
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
  progressBar: {
    height: 3,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  playerControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timeText: {
    color: "#fff",
    fontSize: 12,
  },
  rightControls: {
    flexDirection: "row",
    gap: 4,
  },
  content: {
    padding: 16,
    gap: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statsText: {
    fontSize: 13,
  },
  actions: {
    gap: 8,
    paddingVertical: 2,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  scholarCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  scholarAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  scholarInfo: {
    flex: 1,
    gap: 2,
  },
  scholarNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  scholarName: {
    fontSize: 14,
    fontWeight: "700",
  },
  subscriberCount: {
    fontSize: 12,
  },
  subscribeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  subscribeBtnText: {
    fontSize: 13,
    fontWeight: "700",
  },
  descCard: {
    padding: 12,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  descText: {
    fontSize: 13,
    lineHeight: 19,
  },
  descToggle: {
    fontSize: 13,
    fontWeight: "600",
  },
  commentsToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  commentsToggleText: {
    fontSize: 15,
    fontWeight: "700",
  },
  relatedTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: 4,
  },
});
