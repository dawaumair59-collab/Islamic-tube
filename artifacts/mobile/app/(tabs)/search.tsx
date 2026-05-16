import AsyncStorage from "@react-native-async-storage/async-storage";
import { Clock, CornerUpLeft, Search, TrendingUp } from "lucide-react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SearchBar } from "@/components/SearchBar";
import { CATEGORIES } from "@/data/mockData";
import type { Video } from "@/data/mockData";
import { searchApi } from "@/services/api";
import { useColors } from "@/hooks/useColors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 16 * 2 - 8) / 2;

const HISTORY_KEY = "islamictube_search_history";
const MAX_HISTORY = 20;

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
      <Text style={styles.gridTitle} numberOfLines={2}>{video.title}</Text>
      <Text style={styles.gridMeta} numberOfLines={1}>{video.scholar}</Text>
      <Text style={styles.gridMeta}>{video.views} views</Text>
    </TouchableOpacity>
  );
}

export default function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");
  const [results, setResults] = useState<Video[]>([]);
  const [trendingTerms, setTrendingTerms] = useState<string[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(HISTORY_KEY)
      .then((raw) => setSearchHistory(raw ? JSON.parse(raw) : []))
      .catch(() => {});
  }, []);

  const saveToHistory = async (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    const updated = [trimmed, ...searchHistory.filter((h) => h !== trimmed)].slice(0, MAX_HISTORY);
    setSearchHistory(updated);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated)).catch(() => {});
  };

  const clearHistory = async () => {
    setSearchHistory([]);
    await AsyncStorage.removeItem(HISTORY_KEY).catch(() => {});
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 60;

  useEffect(() => {
    searchApi.trending().then(setTrendingTerms).catch(() => {});
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 2) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await searchApi.search(query);
        setResults(data.videos);
        if (data.videos.length > 0) {
          saveToHistory(query);
        }
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const filteredResults =
    selectedCat === "All"
      ? results
      : results.filter((v) => v.category === selectedCat);

  const showResults = query.length >= 2;
  const displayTrending = trendingTerms.length > 0 ? trendingTerms : [
    "Surah Al-Baqarah",
    "Prayer guide",
    "Sheikh Omar Suleiman",
    "Ramadan tips",
    "Islamic history",
    "Quran recitation",
  ];

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <SearchBar value={query} onChangeText={setQuery} autoFocus={false} />
      </View>

      {showResults ? (
        <ScrollView
          contentContainerStyle={{ paddingBottom: bottomPad }}
          showsVerticalScrollIndicator={false}
        >
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
                  { backgroundColor: selectedCat === cat ? "#0F0F0F" : "#F2F2F2" },
                ]}
                onPress={() => setSelectedCat(cat)}
              >
                <Text style={[styles.catChipText, { color: selectedCat === cat ? "#fff" : "#0F0F0F" }]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {searching ? (
            <View style={styles.loadingCenter}>
              <ActivityIndicator color="#2563EB" />
            </View>
          ) : filteredResults.length === 0 ? (
            <View style={styles.emptyState}>
              <Search size={48} color="#909090" strokeWidth={1.5} />
              <Text style={styles.emptyTitle}>No results found</Text>
              <Text style={styles.emptyText}>Try searching with different keywords</Text>
            </View>
          ) : (
            <>
              <Text style={styles.resultCount}>{filteredResults.length} results for "{query}"</Text>
              <View style={styles.grid}>
                {filteredResults.map((video) => (
                  <GridVideoCard key={video.id} video={video} />
                ))}
              </View>
            </>
          )}
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: bottomPad }}
          showsVerticalScrollIndicator={false}
        >
          {searchHistory.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent searches</Text>
                <TouchableOpacity onPress={clearHistory}>
                  <Text style={styles.clearAll}>Clear all</Text>
                </TouchableOpacity>
              </View>
              {searchHistory.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={styles.historyItem}
                  onPress={() => { setQuery(item); saveToHistory(item); }}
                >
                  <Clock size={18} color="#909090" strokeWidth={1.8} />
                  <Text style={styles.historyText}>{item}</Text>
                  <CornerUpLeft size={16} color="#909090" strokeWidth={1.8} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trending</Text>
            <View style={styles.trendingGrid}>
              {displayTrending.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={styles.trendingChip}
                  onPress={() => setQuery(t)}
                >
                  <TrendingUp size={13} color="#2563EB" strokeWidth={2} />
                  <Text style={styles.trendingText}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Browse categories</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.slice(1).map((cat, i) => {
                const hues = [
                  "#2563EB", "#7C3AED", "#059669", "#DC2626",
                  "#D97706", "#0891B2", "#BE185D", "#1D4ED8",
                  "#065F46", "#92400E", "#1E40AF",
                ];
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.categoryCard, { backgroundColor: hues[i % hues.length] }]}
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
  screen: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E5E5",
    backgroundColor: "#FFFFFF",
  },
  catRow: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  catChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  catChipText: { fontSize: 12, fontWeight: "500" },
  loadingCenter: { alignItems: "center", paddingTop: 40 },
  resultCount: { paddingHorizontal: 16, fontSize: 12, marginBottom: 8, color: "#606060" },
  grid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, gap: 8 },
  gridCard: { gap: 5, marginBottom: 4 },
  gridThumbWrapper: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#E5E5E5",
  },
  gridThumb: { width: "100%", height: "100%" },
  durationBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.78)",
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  durationText: { color: "#fff", fontSize: 10, fontWeight: "600" },
  gridTitle: { fontSize: 12, fontWeight: "600", lineHeight: 16, color: "#0F0F0F" },
  gridMeta: { fontSize: 11, color: "#606060" },
  emptyState: { alignItems: "center", paddingTop: 60, gap: 8, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: "#0F0F0F" },
  emptyText: { fontSize: 14, textAlign: "center", color: "#606060" },
  section: { paddingHorizontal: 16, paddingTop: 16, gap: 10 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#0F0F0F" },
  clearAll: { fontSize: 13, fontWeight: "500", color: "#2563EB" },
  historyItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10 },
  historyText: { flex: 1, fontSize: 14, color: "#0F0F0F" },
  trendingGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  trendingChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    backgroundColor: "#F5F5F5",
  },
  trendingText: { fontSize: 13, color: "#0F0F0F" },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  categoryCard: {
    width: (SCREEN_WIDTH - 32 - 8) / 2,
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderRadius: 10,
    justifyContent: "flex-end",
  },
  categoryCardText: { color: "#fff", fontSize: 14, fontWeight: "700" },
});
