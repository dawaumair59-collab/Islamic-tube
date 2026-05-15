import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
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
import { HeroBanner } from "@/components/HeroBanner";
import { VideoCard } from "@/components/VideoCard";
import { VideoListSkeleton } from "@/components/LoadingSkeleton";
import { CATEGORIES, LIVE_STREAMS, VIDEOS } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const filteredVideos =
    selectedCategory === "All"
      ? VIDEOS
      : VIDEOS.filter((v) => v.category === selectedCategory);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const liveStream = LIVE_STREAMS.find((l) => l.isLive);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Sticky header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 8,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.headerLeft}>
          <View style={[styles.logoMark, { backgroundColor: colors.primary }]}>
            <MaterialCommunityIcons name="moon-waxing-crescent" size={16} color="#fff" />
          </View>
          <Text style={[styles.logo, { color: colors.primary }]}>IslamicTube</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => router.push("/notifications")} style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={22} color={colors.foreground} />
            <View style={[styles.notifDot, { backgroundColor: "#EF4444" }]} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/auth")} style={styles.iconBtn}>
            <Ionicons name="person-circle-outline" size={26} color={colors.foreground} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 + bottomPad }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Search bar tap-to-navigate */}
        <TouchableOpacity
          style={[styles.searchBar, { backgroundColor: colors.secondary, borderColor: colors.border }]}
          activeOpacity={0.8}
          onPress={() => router.push("/(tabs)/search")}
        >
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <Text style={[styles.searchPlaceholder, { color: colors.mutedForeground }]}>
            Search Islamic content...
          </Text>
          <Feather name="mic" size={16} color={colors.mutedForeground} />
        </TouchableOpacity>

        {/* Hero Banner */}
        <HeroBanner />

        {/* Live Now */}
        {liveStream && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.livePill}>
                <View style={styles.liveDot} />
                <Text style={styles.livePillText}>LIVE NOW</Text>
              </View>
              <TouchableOpacity onPress={() => router.push("/live")}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.liveCard, { backgroundColor: colors.card }]}
              activeOpacity={0.9}
              onPress={() => router.push("/live")}
            >
              <Image source={liveStream.thumbnail} style={styles.liveThumb} contentFit="cover" />
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.9)"]}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.liveOverlay}>
                <View style={styles.liveBadge}>
                  <View style={styles.liveDotSmall} />
                  <Text style={styles.liveBadgeText}>LIVE</Text>
                </View>
                <Text style={styles.liveViewers}>
                  {liveStream.viewers} watching
                </Text>
              </View>
              <View style={styles.liveInfo}>
                <Text style={styles.liveTitle} numberOfLines={1}>{liveStream.title}</Text>
                <Text style={styles.liveScholar}>{liveStream.scholar}</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Categories */}
        <View style={styles.categoriesWrapper}>
          <CategoryFilter
            categories={CATEGORIES}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </View>

        {/* Videos Feed */}
        <View style={styles.feed}>
          {loading ? (
            <VideoListSkeleton count={4} />
          ) : (
            filteredVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoMark: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  iconBtn: {
    padding: 6,
    position: "relative",
  },
  notifDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  scroll: {
    flex: 1,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 14,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EF4444",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#fff",
  },
  liveDotSmall: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#fff",
  },
  livePillText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: "600",
  },
  liveCard: {
    borderRadius: 12,
    overflow: "hidden",
    height: 180,
    position: "relative",
  },
  liveThumb: {
    width: "100%",
    height: "100%",
  },
  liveOverlay: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EF4444",
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  liveBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  liveViewers: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "500",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  liveInfo: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
  },
  liveTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
  },
  liveScholar: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
  },
  categoriesWrapper: {
    marginTop: 16,
    marginBottom: 4,
  },
  feed: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
});
