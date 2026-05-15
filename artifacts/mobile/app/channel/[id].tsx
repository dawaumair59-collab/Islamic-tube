import {
  BadgeCheck,
  Bell,
  Check,
  ChevronLeft,
  Share2,
  UserPlus,
} from "lucide-react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
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

import { VideoCard } from "@/components/VideoCard";
import { PlaylistCard } from "@/components/PlaylistCard";
import { PLAYLISTS, SCHOLARS, VIDEOS } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

const CHANNEL_TABS = ["Videos", "Shorts", "Playlists", "About"];

export default function ChannelScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState("Videos");
  const [subscribed, setSubscribed] = useState(false);

  const scholar = SCHOLARS.find((s) => s.id === id) ?? SCHOLARS[0];
  const videos = VIDEOS.filter((v) => v.scholarId === scholar.id);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const renderContent = () => {
    if (activeTab === "Videos") {
      return (
        <View style={styles.feedPad}>
          {(videos.length > 0 ? videos : VIDEOS.slice(0, 3)).map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </View>
      );
    }
    if (activeTab === "Shorts") {
      return (
        <View style={styles.feedPad}>
          {VIDEOS.slice(0, 2).map((v) => (
            <VideoCard key={v.id} video={{ ...v, type: "short", duration: "0:58" }} />
          ))}
        </View>
      );
    }
    if (activeTab === "Playlists") {
      return (
        <View style={styles.feedPad}>
          {PLAYLISTS.slice(0, 3).map((pl) => (
            <PlaylistCard key={pl.id} playlist={pl} />
          ))}
        </View>
      );
    }
    if (activeTab === "About") {
      return (
        <View style={[styles.feedPad, styles.aboutSection]}>
          <View style={[styles.aboutCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.aboutLabel, { color: colors.mutedForeground }]}>Bio</Text>
            <Text style={[styles.aboutText, { color: colors.foreground }]}>{scholar.bio}</Text>
          </View>
          <View style={[styles.aboutCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.aboutLabel, { color: colors.mutedForeground }]}>Location</Text>
            <Text style={[styles.aboutText, { color: colors.foreground }]}>{scholar.location}</Text>
          </View>
          <View style={[styles.aboutCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.aboutLabel, { color: colors.mutedForeground }]}>Stats</Text>
            <Text style={[styles.aboutText, { color: colors.foreground }]}>
              {scholar.subscribers} subscribers · {scholar.totalVideos} videos
            </Text>
          </View>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Banner */}
        <View style={styles.bannerWrapper}>
          <Image source={scholar.avatar} style={styles.banner} contentFit="cover" />
          <LinearGradient colors={["rgba(0,0,0,0.2)", "rgba(0,0,0,0.7)"]} style={StyleSheet.absoluteFill} />
          <TouchableOpacity style={[styles.backBtn, { paddingTop: topPad + 8 }]} onPress={() => router.back()}>
            <ChevronLeft size={24} color="#fff" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Channel info */}
        <View style={[styles.channelInfo, { backgroundColor: colors.background }]}>
          <View style={styles.channelHeader}>
            <Image source={scholar.avatar} style={styles.avatar} contentFit="cover" />
            <View style={styles.channelMeta}>
              <View style={styles.nameRow}>
                <Text style={[styles.channelName, { color: colors.foreground }]}>{scholar.name}</Text>
                {scholar.verified && (
                  <BadgeCheck size={16} color={colors.primary} fill={colors.primary} strokeWidth={0} />
                )}
              </View>
              <Text style={[styles.subs, { color: colors.mutedForeground }]}>
                {scholar.subscribers} subscribers · {scholar.totalVideos} videos
              </Text>
            </View>
          </View>

          <Text style={[styles.bio, { color: colors.foreground }]} numberOfLines={2}>
            {scholar.bio}
          </Text>

          <View style={styles.channelActions}>
            <TouchableOpacity
              style={[styles.subscribeBtn, { backgroundColor: subscribed ? colors.secondary : colors.primary }]}
              onPress={() => setSubscribed((s) => !s)}
            >
              {subscribed ? (
                <Check size={16} color={colors.foreground} strokeWidth={2.5} />
              ) : (
                <UserPlus size={16} color="#fff" strokeWidth={1.8} />
              )}
              <Text style={[styles.subscribeText, { color: subscribed ? colors.foreground : "#fff" }]}>
                {subscribed ? "Subscribed" : "Subscribe"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.iconActionBtn, { backgroundColor: colors.secondary }]}>
              <Bell size={18} color={colors.foreground} strokeWidth={1.8} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.iconActionBtn, { backgroundColor: colors.secondary }]}>
              <Share2 size={18} color={colors.foreground} strokeWidth={1.8} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
          {CHANNEL_TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, { borderBottomColor: activeTab === tab ? colors.primary : "transparent", borderBottomWidth: 2 }]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, { color: activeTab === tab ? colors.primary : colors.mutedForeground, fontWeight: activeTab === tab ? "700" : "400" }]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {renderContent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  bannerWrapper: { width: "100%", height: 180, position: "relative" },
  banner: { width: "100%", height: "100%" },
  backBtn: { position: "absolute", left: 12, top: 0, padding: 6 },
  channelInfo: { padding: 16, gap: 10 },
  channelHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: "#fff", marginTop: -28 },
  channelMeta: { flex: 1, gap: 2 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  channelName: { fontSize: 17, fontWeight: "800" },
  subs: { fontSize: 12 },
  bio: { fontSize: 13, lineHeight: 19 },
  channelActions: { flexDirection: "row", gap: 8 },
  subscribeBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 24 },
  subscribeText: { fontSize: 14, fontWeight: "700" },
  iconActionBtn: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  tabs: { flexDirection: "row", borderBottomWidth: StyleSheet.hairlineWidth },
  tab: { flex: 1, alignItems: "center", paddingVertical: 12 },
  tabText: { fontSize: 13 },
  feedPad: { padding: 16 },
  aboutSection: { gap: 10 },
  aboutCard: { borderRadius: 10, borderWidth: StyleSheet.hairlineWidth, padding: 12, gap: 4 },
  aboutLabel: { fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  aboutText: { fontSize: 14, lineHeight: 20 },
});
