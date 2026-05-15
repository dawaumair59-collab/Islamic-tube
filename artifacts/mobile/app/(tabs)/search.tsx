import { Feather, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SearchBar } from "@/components/SearchBar";
import { CATEGORIES, VIDEOS, Video } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 16 * 2 - 8) / 2;

const TRENDING_SEARCHES = [
  "Surah Al-Baqarah",
  "Prayer guide",
  "Sheikh Omar Suleiman",
  "Ramadan tips",
  "Islamic history",
  "Quran recitation",
];

const SEARCH_HISTORY = ["Mufti Menk lectures", "How to make dua", "Seerah series"];

function GridVideoCard({ video }: { video: Video }) {
  const colors = useColors();
  return (
    <TouchableOpacity
      style={[styles.gridCard, { width: CARD_WIDTH }]}
      activeOpacity={0.85}
      onPress={() => router.push(`/watch/${video.id}`)}
    >
      <View style={styles.gridThumbWrapper}>
        <Image source={video.thumbnail} style={styles.gridThumb} contentFit="cover" />
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{video.duration}</Text>
        </View>
      </View>
      <Text style={[styles.gridTitle, { color: colors.foreground }]} numberOfLines={2}>
        {video.title}
      </Text>
      <Text style={[styles.gridMeta, { color: colors.mutedForeground }]} numberOfLines={1}>
        {video.scholar}
      </Text>
      <Text style={[styles.gridMeta, { color: colors.mutedForeground }]}>
        {video.views} views
      </Text>
    </TouchableOpacity>
  );
}

export default function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const results =
    query.length > 0
      ? VIDEOS.filter(
          (v) =>
            v.title.toLowerCase().includes(query.toLowerCase()) ||
            v.scholar.toLowerCase().includes(query.toLowerCase()) ||
            v.category.toLowerCase().includes(query.toLowerCase())
        )
      : [];

  const showResults = query.length > 0;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 8, backgroundColor: colors.background, borderBottomColor: colors.border },
        ]}
      >
        <SearchBar
          value={query}
          onChangeText={setQuery}
          autoFocus={false}
        />
      </View>

      {showResults ? (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 100 + bottomPad }}
          showsVerticalScrollIndicator={false}
        >
          {/* Category chips horizontal */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.catRow}
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.catChip,
                  {
                    backgroundColor: selectedCat === cat ? colors.primary : colors.secondary,
                    borderColor: selectedCat === cat ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedCat(cat)}
              >
                <Text
                  style={[
                    styles.catChipText,
                    { color: selectedCat === cat ? "#fff" : colors.foreground },
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {results.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="search" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                No results found
              </Text>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                Try searching with different keywords
              </Text>
            </View>
          ) : (
            <>
              <Text style={[styles.resultCount, { color: colors.mutedForeground }]}>
                {results.length} results for "{query}"
              </Text>
              <View style={styles.grid}>
                {results.map((video) => (
                  <GridVideoCard key={video.id} video={video} />
                ))}
              </View>
            </>
          )}
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 100 + bottomPad }}
          showsVerticalScrollIndicator={false}
        >
          {/* Search history */}
          {SEARCH_HISTORY.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                  Recent searches
                </Text>
                <TouchableOpacity>
                  <Text style={[styles.clearAll, { color: colors.primary }]}>Clear all</Text>
                </TouchableOpacity>
              </View>
              {SEARCH_HISTORY.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={styles.historyItem}
                  onPress={() => setQuery(item)}
                >
                  <Ionicons name="time-outline" size={18} color={colors.mutedForeground} />
                  <Text style={[styles.historyText, { color: colors.foreground }]}>{item}</Text>
                  <Feather name="arrow-up-left" size={16} color={colors.mutedForeground} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Trending */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Trending
            </Text>
            <View style={styles.trendingGrid}>
              {TRENDING_SEARCHES.map((t, i) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.trendingChip, { backgroundColor: colors.secondary, borderColor: colors.border }]}
                  onPress={() => setQuery(t)}
                >
                  <Feather name="trending-up" size={13} color={colors.primary} />
                  <Text style={[styles.trendingText, { color: colors.foreground }]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Browse Categories */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Browse categories
            </Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.slice(1).map((cat, i) => {
                const hues = [
                  "#2563EB", "#7C3AED", "#059669", "#DC2626",
                  "#D97706", "#0891B2", "#BE185D", "#1D4ED8",
                  "#065F46", "#92400E", "#1E40AF",
                ];
                const bg = hues[i % hues.length];
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.categoryCard, { backgroundColor: bg }]}
                    onPress={() => setQuery(cat)}
                  >
                    <Text style={styles.categoryCardText}>{cat}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  catRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  catChipText: {
    fontSize: 12,
    fontWeight: "500",
  },
  resultCount: {
    paddingHorizontal: 16,
    fontSize: 12,
    marginBottom: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 8,
  },
  gridCard: {
    gap: 5,
    marginBottom: 4,
  },
  gridThumbWrapper: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  gridThumb: {
    width: "100%",
    height: "100%",
  },
  durationBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.78)",
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  durationText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  gridTitle: {
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
  },
  gridMeta: {
    fontSize: 11,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
    gap: 8,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  clearAll: {
    fontSize: 13,
    fontWeight: "500",
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
  },
  historyText: {
    flex: 1,
    fontSize: 14,
  },
  trendingGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  trendingChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  trendingText: {
    fontSize: 13,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryCard: {
    width: (SCREEN_WIDTH - 32 - 8) / 2,
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderRadius: 10,
    justifyContent: "flex-end",
  },
  categoryCardText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});
