import { Plus, Search, Trash2 } from "lucide-react-native";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PlaylistCard } from "@/components/PlaylistCard";
import { VideoCard } from "@/components/VideoCard";
import { PLAYLISTS } from "@/data/mockData";
import type { Video } from "@/data/mockData";
import { likesApi, savedVideosApi, watchHistoryApi } from "@/services/api";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

const TABS = ["Playlists", "History", "Saved", "Liked"];

export default function LibraryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Playlists");
  const [likedVideos, setLikedVideos] = useState<Video[]>([]);
  const [historyVideos, setHistoryVideos] = useState<Video[]>([]);
  const [savedVideos, setSavedVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 60;

  useEffect(() => {
    if (!user) return;

    if (activeTab === "Liked") {
      setLoading(true);
      likesApi
        .myLikes()
        .then(setLikedVideos)
        .catch(() => setLikedVideos([]))
        .finally(() => setLoading(false));
    }
    if (activeTab === "History") {
      setLoading(true);
      watchHistoryApi
        .list()
        .then(setHistoryVideos)
        .catch(() => setHistoryVideos([]))
        .finally(() => setLoading(false));
    }
    if (activeTab === "Saved") {
      setLoading(true);
      savedVideosApi
        .list()
        .then(setSavedVideos)
        .catch(() => setSavedVideos([]))
        .finally(() => setLoading(false));
    }
  }, [activeTab, user]);

  const handleClearHistory = () => {
    Alert.alert(
      "Clear Watch History",
      "This will remove all videos from your watch history. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              await watchHistoryApi.clear();
              setHistoryVideos([]);
            } catch {
              Alert.alert("Error", "Failed to clear watch history.");
            }
          },
        },
      ]
    );
  };

  const renderAuthPrompt = () => (
    <View style={styles.authPrompt}>
      <Text style={[styles.authTitle, { color: colors.foreground }]}>
        Sign in to view your library
      </Text>
      <Text style={[styles.authSub, { color: colors.mutedForeground }]}>
        Track your watch history, save videos, and access your liked content.
      </Text>
      <TouchableOpacity
        style={[styles.signInBtn, { backgroundColor: colors.primary }]}
        onPress={() => router.push("/auth")}
      >
        <Text style={styles.signInBtnText}>Sign In</Text>
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    if (activeTab === "Playlists") {
      return (
        <View style={styles.section}>
          <TouchableOpacity style={styles.createPlaylist} activeOpacity={0.8}>
            <Plus size={20} color={colors.primary} strokeWidth={2} />
            <Text
              style={[styles.createPlaylistText, { color: colors.primary }]}
            >
              New Playlist
            </Text>
          </TouchableOpacity>
          {PLAYLISTS.map((pl) => (
            <PlaylistCard key={pl.id} playlist={pl} />
          ))}
        </View>
      );
    }

    if (!user) return renderAuthPrompt();

    if (activeTab === "History") {
      return (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
              Recently watched
            </Text>
            <TouchableOpacity
              style={styles.clearRow}
              onPress={handleClearHistory}
            >
              <Trash2 size={14} color={colors.primary} strokeWidth={1.8} />
              <Text style={[styles.clearBtn, { color: colors.primary }]}>
                Clear
              </Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <ActivityIndicator color={colors.primary} style={styles.loader} />
          ) : historyVideos.length === 0 ? (
            <Text
              style={[styles.emptyText, { color: colors.mutedForeground }]}
            >
              No watch history yet
            </Text>
          ) : (
            historyVideos.map((video) => (
              <VideoCard key={video.id} video={video} horizontal />
            ))
          )}
        </View>
      );
    }

    if (activeTab === "Saved") {
      return (
        <View style={styles.section}>
          {loading ? (
            <ActivityIndicator color={colors.primary} style={styles.loader} />
          ) : savedVideos.length === 0 ? (
            <Text
              style={[styles.emptyText, { color: colors.mutedForeground }]}
            >
              No saved videos yet
            </Text>
          ) : (
            savedVideos.map((video) => (
              <VideoCard key={video.id} video={video} horizontal />
            ))
          )}
        </View>
      );
    }

    if (activeTab === "Liked") {
      return (
        <View style={styles.section}>
          {loading ? (
            <ActivityIndicator color={colors.primary} style={styles.loader} />
          ) : likedVideos.length === 0 ? (
            <Text
              style={[styles.emptyText, { color: colors.mutedForeground }]}
            >
              No liked videos yet
            </Text>
          ) : (
            likedVideos.map((video) => (
              <VideoCard key={video.id} video={video} horizontal />
            ))
          )}
        </View>
      );
    }
    return null;
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
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
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          Library
        </Text>
        <TouchableOpacity>
          <Search size={22} color={colors.foreground} strokeWidth={1.8} />
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.tabs,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              {
                borderBottomColor:
                  activeTab === tab ? colors.primary : "transparent",
                borderBottomWidth: 2,
              },
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === tab ? colors.primary : colors.mutedForeground,
                  fontWeight: activeTab === tab ? "700" : "400",
                },
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
      </ScrollView>
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
  headerTitle: { fontSize: 22, fontWeight: "800" },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tab: { flex: 1, alignItems: "center", paddingVertical: 12 },
  tabText: { fontSize: 13 },
  section: { padding: 16 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionLabel: { fontSize: 13 },
  clearRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  clearBtn: { fontSize: 13, fontWeight: "500" },
  createPlaylist: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#2563EB",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  createPlaylistText: { fontSize: 14, fontWeight: "600" },
  loader: { marginTop: 24 },
  emptyText: { fontSize: 14, textAlign: "center", paddingTop: 24 },
  authPrompt: {
    padding: 32,
    alignItems: "center",
    gap: 12,
  },
  authTitle: { fontSize: 17, fontWeight: "700", textAlign: "center" },
  authSub: { fontSize: 13, textAlign: "center", lineHeight: 19 },
  signInBtn: {
    marginTop: 8,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  signInBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
