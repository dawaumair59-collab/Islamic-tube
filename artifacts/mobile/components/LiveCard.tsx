import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { LiveStream } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

interface LiveCardProps {
  stream: LiveStream;
}

export function LiveCard({ stream }: LiveCardProps) {
  const colors = useColors();

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.card }]}
      activeOpacity={0.85}
      onPress={() => router.push("/live")}
    >
      <View style={styles.thumbnailWrapper}>
        <Image
          source={stream.thumbnail}
          style={styles.thumbnail}
          contentFit="cover"
          transition={200}
        />
        {stream.isLive ? (
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveBadgeText}>LIVE</Text>
          </View>
        ) : (
          <View style={[styles.scheduledBadge, { backgroundColor: colors.accent }]}>
            <Ionicons name="time" size={10} color={colors.primary} />
            <Text style={[styles.scheduledText, { color: colors.primary }]}>UPCOMING</Text>
          </View>
        )}
        {stream.isLive && (
          <View style={styles.viewersBadge}>
            <Ionicons name="eye" size={10} color="#fff" />
            <Text style={styles.viewersText}>{stream.viewers}</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>
          {stream.title}
        </Text>
        <View style={styles.scholarRow}>
          <Image source={stream.scholarAvatar} style={styles.avatar} contentFit="cover" />
          <Text style={[styles.scholar, { color: colors.mutedForeground }]}>
            {stream.scholar}
          </Text>
        </View>
        {stream.scheduledAt && !stream.isLive && (
          <Text style={[styles.scheduled, { color: colors.mutedForeground }]}>
            {stream.scheduledAt}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
  },
  thumbnailWrapper: {
    width: "100%",
    aspectRatio: 16 / 9,
    position: "relative",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  liveBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#EF4444",
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#fff",
  },
  liveBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  scheduledBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  scheduledText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  viewersBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.65)",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  viewersText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  info: {
    padding: 10,
    gap: 5,
  },
  title: {
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
  scholarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  scholar: {
    fontSize: 12,
  },
  scheduled: {
    fontSize: 11,
  },
});
