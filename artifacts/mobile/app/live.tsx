import {
  ChevronLeft,
  Eye,
  Heart,
  Maximize,
  Pause,
  Send,
  Share2,
} from "lucide-react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LiveCard } from "@/components/LiveCard";
import { LIVE_STREAMS } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

const LIVE_CHAT = [
  { id: "lc1", name: "Ibrahim K.", message: "Alhamdulillah, this is powerful", time: "2m" },
  { id: "lc2", name: "Fatima S.", message: "SubhanAllah. Barakallahu feek sheikh", time: "1m" },
  { id: "lc3", name: "Yusuf A.", message: "Mashallah! Please keep these coming", time: "just now" },
  { id: "lc4", name: "Aisha R.", message: "Could the Sheikh address the question about", time: "just now" },
];

export default function LiveScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [chatMsg, setChatMsg] = useState("");
  const [activeStream] = useState(LIVE_STREAMS[0]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color={colors.foreground} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Live</Text>
        <View style={styles.livePill}>
          <View style={styles.liveDot} />
          <Text style={styles.livePillText}>LIVE</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 + bottomPad }}>
        {/* Live player */}
        <View style={styles.playerWrapper}>
          <Image source={activeStream.thumbnail} style={styles.playerThumb} contentFit="cover" />
          <LinearGradient colors={["rgba(0,0,0,0.3)", "transparent", "rgba(0,0,0,0.7)"]} style={StyleSheet.absoluteFill} />
          <View style={[styles.playerTop, { paddingTop: 12 }]}>
            <View style={styles.liveBadge}>
              <View style={styles.liveDotSmall} />
              <Text style={styles.liveBadgeText}>LIVE</Text>
            </View>
            <View style={styles.viewersBadge}>
              <Eye size={12} color="#fff" strokeWidth={2} />
              <Text style={styles.viewersText}>{activeStream.viewers} watching</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.playBtn}>
            <View style={styles.playCircle}>
              <Pause size={28} color="#fff" fill="#fff" strokeWidth={0} />
            </View>
          </TouchableOpacity>
          <View style={styles.playerBottom}>
            <Text style={styles.streamTitle}>{activeStream.title}</Text>
            <Text style={styles.streamScholar}>{activeStream.scholar}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={[styles.actionsRow, { borderBottomColor: colors.border }]}>
          <TouchableOpacity style={styles.actionBtn}>
            <Heart size={24} color={colors.foreground} strokeWidth={1.8} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Share2 size={22} color={colors.foreground} strokeWidth={1.8} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Maximize size={24} color={colors.foreground} strokeWidth={1.8} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.subscribeBtn, { backgroundColor: colors.primary }]}>
            <Text style={styles.subscribeBtnText}>Subscribe</Text>
          </TouchableOpacity>
        </View>

        {/* Live chat */}
        <View style={styles.chatSection}>
          <Text style={[styles.chatTitle, { color: colors.foreground }]}>Live Chat</Text>
          {LIVE_CHAT.map((msg) => (
            <View key={msg.id} style={styles.chatMsg}>
              <Text style={[styles.chatName, { color: colors.primary }]}>{msg.name} </Text>
              <Text style={[styles.chatText, { color: colors.foreground }]}>{msg.message}</Text>
            </View>
          ))}
          <View style={[styles.chatInputRow, { borderColor: colors.border, backgroundColor: colors.secondary }]}>
            <TextInput
              style={[styles.chatInput, { color: colors.foreground }]}
              placeholder="Say something..."
              placeholderTextColor={colors.mutedForeground}
              value={chatMsg}
              onChangeText={setChatMsg}
            />
            <TouchableOpacity onPress={() => setChatMsg("")}>
              <Send size={20} color={chatMsg ? colors.primary : colors.mutedForeground} strokeWidth={1.8} />
            </TouchableOpacity>
          </View>
        </View>

        {/* More live */}
        <View style={styles.upcomingSection}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>More Live</Text>
          {LIVE_STREAMS.map((stream) => (
            <LiveCard key={stream.id} stream={stream} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: "700" },
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#EF4444",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#fff" },
  liveDotSmall: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: "#fff" },
  livePillText: { color: "#fff", fontSize: 11, fontWeight: "800", letterSpacing: 0.5 },
  playerWrapper: { width: "100%", aspectRatio: 16 / 9, backgroundColor: "#000", position: "relative" },
  playerThumb: { width: "100%", height: "100%", position: "absolute" },
  playerTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
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
  liveBadgeText: { color: "#fff", fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  viewersBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  viewersText: { color: "#fff", fontSize: 11, fontWeight: "500" },
  playBtn: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  playCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  playerBottom: { position: "absolute", bottom: 10, left: 12, right: 12, gap: 3 },
  streamTitle: { color: "#fff", fontSize: 14, fontWeight: "700" },
  streamScholar: { color: "rgba(255,255,255,0.8)", fontSize: 12 },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  actionBtn: { padding: 6 },
  subscribeBtn: { marginLeft: "auto", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  subscribeBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  chatSection: { padding: 16, gap: 10 },
  chatTitle: { fontSize: 15, fontWeight: "700" },
  chatMsg: { flexDirection: "row", flexWrap: "wrap" },
  chatName: { fontSize: 13, fontWeight: "700" },
  chatText: { fontSize: 13 },
  chatInputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  chatInput: { flex: 1, fontSize: 14, padding: 0 },
  upcomingSection: { paddingHorizontal: 16, paddingTop: 8 },
  sectionTitle: { fontSize: 15, fontWeight: "700", marginBottom: 12 },
});
