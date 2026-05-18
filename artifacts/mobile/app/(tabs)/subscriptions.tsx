import { Bell, RefreshCw, Users } from "lucide-react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { VideoCard } from "@/components/VideoCard";
import type { Video } from "@/data/mockData";
import { subscriptionsApi, videosApi } from "@/services/api";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

export default function SubscriptionsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 60;

  const fetchFeed = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const feed = await subscriptionsApi.feed();
      if (feed.length === 0) {
        // No subscriptions yet — show all videos as suggestions
        const all = await videosApi.list({ type: "long" });
        setVideos(all);
      } else {
        setVideos(feed);
      }
    } catch {
      try {
        const all = await videosApi.list({ type: "long" });
        setVideos(all);
      } catch {}
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    fetchFeed();
  }, [fetchFeed]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFeed();
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Subscriptions</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.push("/notifications" as any)}>
          <Bell size={22} color={colors.foreground} strokeWidth={1.8} />
        </TouchableOpacity>
      </View>

      {!user ? (
        /* Not signed in */
        <View style={styles.emptyState}>
          <Users size={64} color={colors.mutedForeground} strokeWidth={1.2} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Stay connected</Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Sign in to follow your favourite scholars and see their latest videos here.
          </Text>
          <TouchableOpacity
            style={[styles.signInBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/auth")}
          >
            <Text style={styles.signInBtnText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      ) : loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: bottomPad }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        >
          {videos.length === 0 ? (
            <View style={styles.emptyState}>
              <RefreshCw size={56} color={colors.mutedForeground} strokeWidth={1.2} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No videos yet</Text>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                Subscribe to scholars to see their latest videos here.
              </Text>
              <TouchableOpacity
                style={[styles.signInBtn, { backgroundColor: colors.primary }]}
                onPress={() => router.push("/(tabs)/search" as any)}
              >
                <Text style={styles.signInBtnText}>Discover Scholars</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={[styles.feedLabel, { color: colors.mutedForeground }]}>
                {videos.length} videos from scholars you follow
              </Text>
              {videos.map((v) => (
                <VideoCard key={v.id} video={v} />
              ))}
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { fontSize: 20, fontWeight: "800" },
  headerBtn: { padding: 4 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 14,
    paddingTop: 60,
  },
  emptyTitle: { fontSize: 20, fontWeight: "700", textAlign: "center" },
  emptyText: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  signInBtn: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 6,
  },
  signInBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  feedLabel: {
    fontSize: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
});
