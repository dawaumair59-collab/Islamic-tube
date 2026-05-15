import { Film, MoreVertical } from "lucide-react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Playlist } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

interface PlaylistCardProps {
  playlist: Playlist;
}

export function PlaylistCard({ playlist }: PlaylistCardProps) {
  const colors = useColors();

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.card }]}
      activeOpacity={0.85}
      onPress={() => router.push(`/playlist/${playlist.id}`)}
    >
      <View style={styles.thumbnailWrapper}>
        <Image source={playlist.thumbnail} style={styles.thumbnail} contentFit="cover" transition={200} />
        <View style={[styles.countBadge, { backgroundColor: "rgba(0,0,0,0.65)" }]}>
          <Film size={12} color="#fff" strokeWidth={1.8} />
          <Text style={styles.countText}>{playlist.videoCount}</Text>
        </View>
      </View>

      <View style={styles.info}>
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>
          {playlist.title}
        </Text>
        <Text style={[styles.meta, { color: colors.mutedForeground }]}>
          {playlist.videoCount} videos · {playlist.createdAt}
        </Text>
      </View>

      <TouchableOpacity style={styles.moreBtn}>
        <MoreVertical size={18} color={colors.mutedForeground} strokeWidth={1.8} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 12,
    padding: 8,
    marginBottom: 10,
  },
  thumbnailWrapper: {
    width: 120,
    height: 70,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
    flexShrink: 0,
  },
  thumbnail: { width: "100%", height: "100%" },
  countBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  countText: { color: "#fff", fontSize: 11, fontWeight: "600" },
  info: { flex: 1, gap: 4 },
  title: { fontSize: 13, fontWeight: "600", lineHeight: 18 },
  meta: { fontSize: 12 },
  moreBtn: { padding: 4 },
});
