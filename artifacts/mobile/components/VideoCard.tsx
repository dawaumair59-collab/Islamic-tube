import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Video } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

interface VideoCardProps {
  video: Video;
  horizontal?: boolean;
}

export function VideoCard({ video, horizontal = false }: VideoCardProps) {
  const colors = useColors();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        horizontal && styles.horizontal,
        { backgroundColor: colors.background },
      ]}
      activeOpacity={0.85}
      onPress={() => router.push(`/watch/${video.id}`)}
    >
      <View style={[styles.thumbnailWrapper, horizontal && styles.thumbnailHorizontal]}>
        <Image
          source={video.thumbnail}
          style={styles.thumbnail}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{video.duration}</Text>
        </View>
        {video.type === "short" && (
          <View style={[styles.shortsBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.shortsText}>SHORT</Text>
          </View>
        )}
      </View>

      <View style={[styles.info, horizontal && styles.infoHorizontal]}>
        <Text
          style={[styles.title, { color: colors.foreground }]}
          numberOfLines={horizontal ? 2 : 2}
        >
          {video.title}
        </Text>

        <View style={styles.meta}>
          <Image
            source={video.scholarAvatar}
            style={styles.avatar}
            contentFit="cover"
          />
          <View style={styles.metaText}>
            <View style={styles.scholarRow}>
              <Text style={[styles.scholar, { color: colors.primary }]} numberOfLines={1}>
                {video.scholar}
              </Text>
              <Ionicons name="checkmark-circle" size={13} color={colors.primary} />
            </View>
            <Text style={[styles.stats, { color: colors.mutedForeground }]}>
              {video.views} views · {video.createdAt}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  horizontal: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  thumbnailWrapper: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  thumbnailHorizontal: {
    width: 150,
    aspectRatio: 16 / 9,
    flexShrink: 0,
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  durationBadge: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.78)",
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  durationText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  shortsBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  shortsText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  info: {
    paddingTop: 8,
    gap: 6,
  },
  infoHorizontal: {
    flex: 1,
    paddingTop: 0,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 19,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  metaText: {
    flex: 1,
    gap: 1,
  },
  scholarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  scholar: {
    fontSize: 12,
    fontWeight: "500",
  },
  stats: {
    fontSize: 11,
  },
});
