import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useState } from "react";
import {
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
import { VideoCard } from "@/components/VideoCard";
import { CATEGORIES, LIVE_STREAMS, SHORTS, VIDEOS } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SHORTS_CARD_W = 110;
const LIVE_CARD_W = 260;

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom;

  const filteredVideos =
    selectedCategory === "All"
      ? VIDEOS
      : selectedCategory === "Live"
      ? []
      : selectedCategory === "Shorts"
      ? []
      : VIDEOS.filter((v) => v.category === selectedCategory);

  const showShorts = selectedCategory === "All" || selectedCategory === "Shorts";
  const showLive = selectedCategory === "All" || selectedCategory === "Live";

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>

      {/* Top Navbar */}
      <View
        style={[
          styles.navbar,
          {
            paddingTop: topPad + 6,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.navLeft}>
          <MaterialCommunityIcons
            name="moon-waxing-crescent"
            size={20}
            color={colors.primary}
          />
          <Text style={[styles.navLogo, { color: colors.foreground }]}>
            <Text style={{ color: colors.primary }}>Islamic</Text>Tube
          </Text>
        </View>
        <View style={styles.navRight}>
          <TouchableOpacity
            style={styles.navIcon}
            onPress={() => router.push("/(tabs)/search")}
          >
            <Feather name="search" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navIcon}
            onPress={() => router.push("/notifications")}
          >
            <Ionicons name="notifications-outline" size={22} color={colors.foreground} />
            <View style={[styles.notifDot, { backgroundColor: "#FF0000" }]} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navIcon}
            onPress={() => router.push("/auth")}
          >
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>A</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Category chips — sticky below navbar */}
      <View style={[styles.chipsBar, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <CategoryFilter
          categories={CATEGORIES}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </View>

      {/* Feed */}
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPad + 80, paddingTop: 8 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >

        {/* First 2 videos */}
        {filteredVideos.slice(0, 2).map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}

        {/* Shorts shelf */}
        {showShorts && (
          <View style={styles.shelf}>
            <View style={styles.shelfHeader}>
              <View style={styles.shortsLabel}>
                <View style={[styles.shortsDot, { backgroundColor: colors.destructive }]} />
                <Text style={[styles.shelfTitle, { color: colors.foreground }]}>Shorts</Text>
              </View>
              <TouchableOpacity onPress={() => router.push("/(tabs)/shorts")}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.shortsRow}
            >
              {SHORTS.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={styles.shortsCard}
                  activeOpacity={0.85}
                  onPress={() => router.push("/(tabs)/shorts")}
                >
                  <View style={[styles.shortsThumbWrap, { backgroundColor: colors.card }]}>
                    <Image
                      source={s.thumbnail}
                      style={styles.shortsThumb}
                      contentFit="cover"
                    />
                    <View style={styles.shortsDuration}>
                      <Text style={styles.shortsDurationText}>{s.duration}</Text>
                    </View>
                  </View>
                  <Text style={[styles.shortsCardTitle, { color: colors.foreground }]} numberOfLines={2}>
                    {s.title}
                  </Text>
                  <Text style={[styles.shortsViews, { color: colors.mutedForeground }]}>
                    {s.views} views
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Middle videos (3 & 4) */}
        {filteredVideos.slice(2, 4).map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}

        {/* Live section */}
        {showLive && LIVE_STREAMS.filter((l) => l.isLive).length > 0 && (
          <View style={styles.shelf}>
            <View style={styles.shelfHeader}>
              <View style={styles.liveLabel}>
                <View style={[styles.liveDot, { backgroundColor: "#FF0000" }]} />
                <Text style={[styles.shelfTitle, { color: colors.foreground }]}>Live now</Text>
              </View>
              <TouchableOpacity onPress={() => router.push("/live")}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
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
                  style={[styles.liveCard, { backgroundColor: colors.card }]}
                  activeOpacity={0.85}
                  onPress={() => router.push("/live")}
                >
                  <View style={styles.liveThumbWrap}>
                    <Image
                      source={stream.thumbnail}
                      style={styles.liveThumb}
                      contentFit="cover"
                    />
                    <View style={styles.liveBadge}>
                      <View style={styles.liveBadgeDot} />
                      <Text style={styles.liveBadgeText}>LIVE</Text>
                    </View>
                    <View style={styles.liveViewersPill}>
                      <Text style={styles.liveViewersText}>{stream.viewers} watching</Text>
                    </View>
                  </View>
                  <View style={styles.liveInfo}>
                    <Image
                      source={stream.scholarAvatar}
                      style={styles.liveAvatar}
                      contentFit="cover"
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.liveTitle, { color: colors.foreground }]} numberOfLines={2}>
                        {stream.title}
                      </Text>
                      <Text style={[styles.liveMeta, { color: colors.mutedForeground }]}>
                        {stream.scholar}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Remaining videos */}
        {filteredVideos.slice(4).map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}

        {/* If filtered list is empty */}
        {filteredVideos.length === 0 && !showShorts && !showLive && (
          <View style={styles.emptyState}>
            <Ionicons name="videocam-outline" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No videos in this category yet
            </Text>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingBottom: 8,
    zIndex: 10,
  },
  navLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  navLogo: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  navRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 0,
  },
  navIcon: {
    padding: 8,
    position: "relative",
  },
  notifDot: {
    position: "absolute",
    top: 7,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  chipsBar: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  scroll: {
    flex: 1,
  },
  shelf: {
    marginBottom: 20,
  },
  shelfHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  shortsLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  shortsDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  liveLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  shelfTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  seeAll: {
    fontSize: 13,
    fontWeight: "500",
  },
  shortsRow: {
    paddingHorizontal: 12,
    gap: 8,
  },
  shortsCard: {
    width: SHORTS_CARD_W,
    gap: 5,
  },
  shortsThumbWrap: {
    width: SHORTS_CARD_W,
    height: SHORTS_CARD_W * 1.78,
    borderRadius: 6,
    overflow: "hidden",
    position: "relative",
  },
  shortsThumb: {
    width: "100%",
    height: "100%",
  },
  shortsDuration: {
    position: "absolute",
    bottom: 5,
    left: 5,
    backgroundColor: "rgba(0,0,0,0.75)",
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  shortsDurationText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  shortsCardTitle: {
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 16,
  },
  shortsViews: {
    fontSize: 11,
  },
  liveRow: {
    paddingHorizontal: 12,
    gap: 10,
  },
  liveCard: {
    width: LIVE_CARD_W,
    borderRadius: 6,
    overflow: "hidden",
  },
  liveThumbWrap: {
    width: LIVE_CARD_W,
    height: (LIVE_CARD_W * 9) / 16,
    position: "relative",
  },
  liveThumb: {
    width: "100%",
    height: "100%",
  },
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
  liveBadgeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#fff",
  },
  liveBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  liveViewersPill: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.65)",
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  liveViewersText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "500",
  },
  liveInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 8,
  },
  liveAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    flexShrink: 0,
  },
  liveTitle: {
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
  },
  liveMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
  },
});
