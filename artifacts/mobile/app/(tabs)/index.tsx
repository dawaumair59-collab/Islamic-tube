import {
  Bell,
  CircleUser,
  Moon,
  Search,
} from "lucide-react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CategoryFilter } from "@/components/CategoryFilter";
import { ContinueWatchingShelf } from "@/components/ContinueWatchingShelf";
import { VideoCard } from "@/components/VideoCard";
import { CATEGORIES, LIVE_STREAMS } from "@/data/mockData";
import type { Video } from "@/data/mockData";
import { videosApi } from "@/services/api";
import { useColors } from "@/hooks/useColors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SHORTS_CARD_W = 110;
const LIVE_CARD_W = 260;

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [allVideos, setAllVideos] = useState<Video[]>([]);
  const [shorts, setShorts] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom;

  const fetchData = async () => {
    try {
      const [videos, shortsData] = await Promise.all([
        videosApi.list(),
        videosApi.shorts(),
      ]);
      setAllVideos(videos);
      setShorts(shortsData);
    } catch {
      // keep existing data on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const filteredVideos =
    selectedCategory === "All"
      ? allVideos.filter((v) => v.type !== "short")
      : selectedCategory === "Live"
      ? []
      : selectedCategory === "Shorts"
      ? []
      : allVideos.filter((v) => v.category === selectedCategory && v.type !== "short");

  const displayShorts = selectedCategory === "All" || selectedCategory === "Shorts"
    ? shorts
    : [];
  const showLive = selectedCategory === "All" || selectedCategory === "Live";

  return (
    <View style={styles.screen}>
      <View style={[styles.navbar, { paddingTop: topPad + 6 }]}>
        <View style={styles.navLeft}>
          <Moon size={18} color="#2563EB" fill="#2563EB" />
          <Text style={styles.navLogo}>
            <Text style={{ color: "#2563EB" }}>Islamic</Text>
            <Text style={{ color: "#0F0F0F" }}>Tube</Text>
          </Text>
        </View>
        <View style={styles.navRight}>
          <TouchableOpacity
            style={styles.navIcon}
            onPress={() => router.push("/(tabs)/search")}
          >
            <Search size={22} color="#0F0F0F" strokeWidth={1.8} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navIcon}
            onPress={() => router.push("/notifications")}
          >
            <Bell size={22} color="#0F0F0F" strokeWidth={1.8} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navIcon}
            onPress={() => router.push("/auth")}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>A</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.chipsBar, { borderBottomColor: "#E5E5E5" }]}>
        <CategoryFilter
          categories={CATEGORIES}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </View>

      {loading ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: bottomPad + 80, paddingTop: 8 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />
          }
        >
          {selectedCategory === "All" && (
            <ContinueWatchingShelf videos={filteredVideos.slice(0, 5)} />
          )}

          {filteredVideos.slice(0, 2).map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}

          {displayShorts.length > 0 && (
            <View style={styles.shelf}>
              <View style={styles.shelfHeader}>
                <View style={styles.shelfLeft}>
                  <View style={styles.shortsDot} />
                  <Text style={styles.shelfTitle}>Shorts</Text>
                </View>
                <TouchableOpacity onPress={() => router.push("/(tabs)/shorts")}>
                  <Text style={styles.seeAll}>See all</Text>
                </TouchableOpacity>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.shortsRow}
              >
                {displayShorts.map((s) => (
                  <TouchableOpacity
                    key={s.id}
                    style={styles.shortsCard}
                    activeOpacity={0.85}
                    onPress={() => router.push("/(tabs)/shorts")}
                  >
                    <View style={styles.shortsThumbWrap}>
                      <Image source={s.thumbnail} style={styles.shortsThumb} contentFit="cover" />
                      <View style={styles.shortsDurationBadge}>
                        <Text style={styles.shortsDurationText}>{s.duration}</Text>
                      </View>
                    </View>
                    <Text style={styles.shortsCardTitle} numberOfLines={2}>{s.title}</Text>
                    <Text style={styles.shortsViews}>{s.views} views</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {filteredVideos.slice(2, 4).map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}

          {showLive && LIVE_STREAMS.filter((l) => l.isLive).length > 0 && (
            <View style={styles.shelf}>
              <View style={styles.shelfHeader}>
                <View style={styles.shelfLeft}>
                  <View style={[styles.shortsDot, { backgroundColor: "#FF0000" }]} />
                  <Text style={styles.shelfTitle}>Live now</Text>
                </View>
                <TouchableOpacity onPress={() => router.push("/live")}>
                  <Text style={styles.seeAll}>See all</Text>
                </TouchableOpacity>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.liveRow}
              >
                {LIVE_STREAMS.filter((l) => l.isLive).map((stream) => (
                  <TouchableOpacity
                    key={stream.id}
                    style={styles.liveCard}
                    activeOpacity={0.85}
                    onPress={() => router.push("/live")}
                  >
                    <View style={styles.liveThumbWrap}>
                      <Image source={stream.thumbnail} style={styles.liveThumb} contentFit="cover" />
                      <View style={styles.liveBadge}>
                        <View style={styles.liveBadgeDot} />
                        <Text style={styles.liveBadgeText}>LIVE</Text>
                      </View>
                      <View style={styles.liveViewersPill}>
                        <Text style={styles.liveViewersText}>{stream.viewers} watching</Text>
                      </View>
                    </View>
                    <View style={styles.liveInfo}>
                      <Image source={stream.scholarAvatar} style={styles.liveAvatar} contentFit="cover" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.liveTitle} numberOfLines={2}>{stream.title}</Text>
                        <Text style={styles.liveMeta}>{stream.scholar}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {filteredVideos.slice(4).map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}

          {filteredVideos.length === 0 && !loading && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No videos found</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FFFFFF" },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingBottom: 8,
    backgroundColor: "#FFFFFF",
  },
  navLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  navLogo: { fontSize: 20, fontWeight: "700", letterSpacing: -0.3 },
  navRight: { flexDirection: "row", alignItems: "center" },
  navIcon: { padding: 8, position: "relative" },
  notifDot: {
    position: "absolute",
    top: 7,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#FF0000",
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  chipsBar: { borderBottomWidth: StyleSheet.hairlineWidth, backgroundColor: "#FFFFFF" },
  scroll: { flex: 1 },
  loadingCenter: { flex: 1, alignItems: "center", justifyContent: "center" },
  shelf: { marginBottom: 20 },
  shelfHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  shelfLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  shortsDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#0F0F0F" },
  shelfTitle: { fontSize: 16, fontWeight: "600", color: "#0F0F0F" },
  seeAll: { fontSize: 13, fontWeight: "500", color: "#2563EB" },
  shortsRow: { paddingHorizontal: 12, gap: 8 },
  shortsCard: { width: SHORTS_CARD_W, gap: 5 },
  shortsThumbWrap: {
    width: SHORTS_CARD_W,
    height: SHORTS_CARD_W * 1.78,
    borderRadius: 6,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#E5E5E5",
  },
  shortsThumb: { width: "100%", height: "100%" },
  shortsDurationBadge: {
    position: "absolute",
    bottom: 5,
    left: 5,
    backgroundColor: "rgba(0,0,0,0.75)",
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  shortsDurationText: { color: "#fff", fontSize: 10, fontWeight: "600" },
  shortsCardTitle: { fontSize: 12, fontWeight: "500", lineHeight: 16, color: "#0F0F0F" },
  shortsViews: { fontSize: 11, color: "#606060" },
  liveRow: { paddingHorizontal: 12, gap: 10 },
  liveCard: { width: LIVE_CARD_W, borderRadius: 6, overflow: "hidden", backgroundColor: "#F5F5F5" },
  liveThumbWrap: { width: LIVE_CARD_W, height: (LIVE_CARD_W * 9) / 16, position: "relative" },
  liveThumb: { width: "100%", height: "100%" },
  liveBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FF0000",
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  liveBadgeDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: "#fff" },
  liveBadgeText: { color: "#fff", fontSize: 10, fontWeight: "800", letterSpacing: 0.4 },
  liveViewersPill: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.65)",
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  liveViewersText: { color: "#fff", fontSize: 10, fontWeight: "500" },
  liveInfo: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 8 },
  liveAvatar: { width: 28, height: 28, borderRadius: 14, flexShrink: 0 },
  liveTitle: { fontSize: 13, fontWeight: "500", lineHeight: 18, color: "#0F0F0F" },
  liveMeta: { fontSize: 11, marginTop: 2, color: "#606060" },
  emptyState: { alignItems: "center", paddingTop: 60 },
  emptyText: { fontSize: 15, color: "#606060" },
});
