import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { VideoCard } from "@/components/VideoCard";
import { PLAYLISTS, VIDEOS } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

export default function PlaylistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const playlist = PLAYLISTS.find((p) => p.id === id) ?? PLAYLISTS[0];
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Header banner */}
        <View style={styles.bannerWrapper}>
          <Image source={playlist.thumbnail} style={styles.banner} contentFit="cover" />
          <LinearGradient
            colors={["rgba(0,0,0,0.2)", "rgba(0,0,0,0.8)"]}
            style={StyleSheet.absoluteFill}
          />
          <TouchableOpacity
            style={[styles.backBtn, { paddingTop: topPad + 8 }]}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.bannerInfo}>
            <Text style={styles.bannerTitle}>{playlist.title}</Text>
            <Text style={styles.bannerMeta}>
              {playlist.videoCount} videos · {playlist.createdAt}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={[styles.actionsRow, { borderBottomColor: colors.border }]}>
          <TouchableOpacity style={[styles.playAllBtn, { backgroundColor: colors.primary }]}>
            <Ionicons name="play" size={18} color="#fff" />
            <Text style={styles.playAllText}>Play All</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.shuffleBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <Ionicons name="shuffle" size={18} color={colors.foreground} />
            <Text style={[styles.shuffleText, { color: colors.foreground }]}>Shuffle</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Feather name="share-2" size={20} color={colors.foreground} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <MaterialCommunityIcons name="dots-vertical" size={20} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* Videos */}
        <View style={styles.feed}>
          {VIDEOS.map((video, index) => (
            <View key={video.id} style={styles.videoWrapper}>
              <Text style={[styles.index, { color: colors.mutedForeground }]}>
                {index + 1}
              </Text>
              <View style={styles.videoCard}>
                <VideoCard video={video} horizontal />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  bannerWrapper: { width: "100%", height: 220, position: "relative" },
  banner: { width: "100%", height: "100%" },
  backBtn: {
    position: "absolute",
    left: 12,
    top: 0,
    padding: 6,
  },
  bannerInfo: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    gap: 4,
  },
  bannerTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  bannerMeta: { color: "rgba(255,255,255,0.8)", fontSize: 13 },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  playAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 24,
  },
  playAllText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  shuffleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 24,
    borderWidth: 1,
  },
  shuffleText: { fontWeight: "600", fontSize: 14 },
  iconBtn: { marginLeft: "auto", padding: 6 },
  feed: { padding: 16, gap: 4 },
  videoWrapper: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginBottom: 8,
  },
  index: { fontSize: 14, fontWeight: "600", paddingTop: 10, width: 20, textAlign: "center" },
  videoCard: { flex: 1 },
});
