import { Plus, Search } from "lucide-react-native";
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
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 60;

  const renderContent = () => {
    if (activeTab === "Playlists") {
      return (
        <View style={styles.section}>
          <TouchableOpacity style={styles.createPlaylist} activeOpacity={0.8}>
            <Plus size={20} color="#2563EB" strokeWidth={2} />
            <Text style={styles.createPlaylistText}>New Playlist</Text>
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
            <Text style={styles.sectionLabel}>Recently watched</Text>
            <TouchableOpacity>
              <Text style={styles.clearBtn}>Clear</Text>
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
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Text style={styles.headerTitle}>Library</Text>
        <TouchableOpacity>
          <Search size={22} color="#0F0F0F" strokeWidth={1.8} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              { borderBottomColor: activeTab === tab ? "#2563EB" : "transparent", borderBottomWidth: 2 },
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === tab ? "#2563EB" : "#606060",
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
  screen: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E5E5",
    backgroundColor: "#FFFFFF",
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#0F0F0F" },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E5E5",
    backgroundColor: "#FFFFFF",
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
  sectionLabel: { fontSize: 13, color: "#606060" },
  clearBtn: { fontSize: 13, fontWeight: "500", color: "#2563EB" },
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
  createPlaylistText: { fontSize: 14, fontWeight: "600", color: "#2563EB" },
});
