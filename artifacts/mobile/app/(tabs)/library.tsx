import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
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
import { PLAYLISTS, VIDEOS } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

const TABS = ["Playlists", "History", "Saved", "Liked"];

export default function LibraryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState("Playlists");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const renderContent = () => {
    if (activeTab === "Playlists") {
      return (
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.createPlaylist, { borderColor: colors.primary, borderRadius: colors.radius }]}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={20} color={colors.primary} />
            <Text style={[styles.createPlaylistText, { color: colors.primary }]}>
              New Playlist
            </Text>
          </TouchableOpacity>
          {PLAYLISTS.map((pl) => (
            <PlaylistCard key={pl.id} playlist={pl} />
          ))}
        </View>
      );
    }
    if (activeTab === "History") {
      return (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
              Recently watched
            </Text>
            <TouchableOpacity>
              <Text style={[styles.clearBtn, { color: colors.primary }]}>Clear</Text>
            </TouchableOpacity>
          </View>
          {VIDEOS.slice(0, 4).map((video) => (
            <VideoCard key={video.id} video={video} horizontal />
          ))}
        </View>
      );
    }
    if (activeTab === "Saved") {
      return (
        <View style={styles.section}>
          {VIDEOS.slice(2, 5).map((video) => (
            <VideoCard key={video.id} video={video} horizontal />
          ))}
        </View>
      );
    }
    if (activeTab === "Liked") {
      return (
        <View style={styles.section}>
          {VIDEOS.slice(1, 4).map((video) => (
            <VideoCard key={video.id} video={video} horizontal />
          ))}
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
          { paddingTop: topPad + 8, backgroundColor: colors.background, borderBottomColor: colors.border },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Library</Text>
        <TouchableOpacity>
          <Feather name="search" size={22} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              {
                borderBottomColor: activeTab === tab ? colors.primary : "transparent",
                borderBottomWidth: 2,
              },
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === tab ? colors.primary : colors.mutedForeground,
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
        contentContainerStyle={{ paddingBottom: 100 + bottomPad }}
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
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
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
  },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
  },
  tabText: {
    fontSize: 13,
  },
  section: {
    padding: 16,
    gap: 0,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 13,
  },
  clearBtn: {
    fontSize: 13,
    fontWeight: "500",
  },
  createPlaylist: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  createPlaylistText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
