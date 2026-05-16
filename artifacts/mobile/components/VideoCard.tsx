import {
  BadgeCheck,
  Ban,
  Clock,
  List,
  MoreVertical,
  Share2,
} from "lucide-react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import { Video } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

interface VideoCardProps {
  video: Video;
  horizontal?: boolean;
}

const MENU_OPTIONS = [
  { icon: Clock, label: "Save to Watch Later" },
  { icon: List, label: "Save to Playlist" },
  { icon: Share2, label: "Share" },
  { icon: Ban, label: "Not interested" },
];

export function VideoCard({ video, horizontal = false }: VideoCardProps) {
  const colors = useColors();
  const [menuVisible, setMenuVisible] = useState(false);

  if (horizontal) {
    return (
      <TouchableOpacity
        style={styles.horizontal}
        activeOpacity={0.8}
        onPress={() => router.push(`/watch/${video.id}`)}
      >
        <View style={styles.thumbHorizontal}>
          <Image
            source={video.thumbnail}
            style={styles.thumbImgHorizontal}
            contentFit="cover"
            transition={150}
          />
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{video.duration}</Text>
          </View>
        </View>
        <View style={styles.infoHorizontal}>
          <Text style={styles.titleHorizontal} numberOfLines={2}>{video.title}</Text>
          <Text style={styles.metaSmall} numberOfLines={1}>{video.scholar}</Text>
          <Text style={styles.metaSmall}>{video.views} views · {video.createdAt}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.9}
      onPress={() => router.push(`/watch/${video.id}`)}
    >
      {/* Full-width edge-to-edge thumbnail */}
      <View style={styles.thumbWrap}>
        <Image
          source={video.thumbnail}
          style={styles.thumbImg}
          contentFit="cover"
          transition={150}
        />
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{video.duration}</Text>
        </View>
      </View>

      {/* Info row: avatar | title + meta | 3-dot */}
      <View style={styles.infoRow}>
        <TouchableOpacity
          onPress={() => router.push(`/channel/${video.scholarId}`)}
          activeOpacity={0.8}
        >
          <Image source={video.scholarAvatar} style={styles.avatar} contentFit="cover" />
        </TouchableOpacity>

        <View style={styles.titleBlock}>
          <Text style={styles.title} numberOfLines={2}>{video.title}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.meta} numberOfLines={1}>{video.scholar}</Text>
            <BadgeCheck size={11} color="#606060" style={{ marginLeft: 2 }} />
            <Text style={styles.meta}> · {video.views} views · {video.createdAt}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.dotBtn}
          onPress={() => setMenuVisible(true)}
          hitSlop={{ top: 10, bottom: 10, left: 8, right: 0 }}
        >
          <MoreVertical size={18} color="#606060" strokeWidth={1.8} />
        </TouchableOpacity>
      </View>

      {/* Options bottom sheet */}
      <Modal transparent visible={menuVisible} animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.overlay}>
            <View style={styles.menu}>
              {MENU_OPTIONS.map((item) => {
                const Icon = item.icon;
                return (
                  <TouchableOpacity
                    key={item.label}
                    style={styles.menuItem}
                    onPress={() => setMenuVisible(false)}
                  >
                    <Icon size={20} color="#0F0F0F" strokeWidth={1.8} />
                    <Text style={styles.menuLabel}>{item.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20, backgroundColor: "#FFFFFF" },
  thumbWrap: {
    width: "100%",
    aspectRatio: 16 / 9,
    position: "relative",
    backgroundColor: "#E5E5E5",
  },
  thumbImg: { width: "100%", height: "100%" },
  durationBadge: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.82)",
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  durationText: { color: "#FFFFFF", fontSize: 11, fontWeight: "600" },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 2,
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginTop: 2,
    flexShrink: 0,
  },
  titleBlock: { flex: 1, gap: 3 },
  title: { fontSize: 14, fontWeight: "500", lineHeight: 20, color: "#0F0F0F" },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "nowrap",
    overflow: "hidden",
  },
  meta: { fontSize: 12, lineHeight: 17, color: "#606060" },
  dotBtn: { padding: 2, marginTop: 1, flexShrink: 0 },
  horizontal: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "flex-start",
  },
  thumbHorizontal: {
    width: 168,
    height: 94,
    borderRadius: 4,
    overflow: "hidden",
    flexShrink: 0,
    backgroundColor: "#E5E5E5",
    position: "relative",
  },
  thumbImgHorizontal: { width: "100%", height: "100%" },
  infoHorizontal: { flex: 1, gap: 3, paddingTop: 2 },
  titleHorizontal: { fontSize: 14, fontWeight: "700", lineHeight: 19, color: "#0F0F0F" },
  metaSmall: { fontSize: 12, color: "#606060", lineHeight: 17 },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  menu: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    paddingVertical: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E5E5",
    borderBottomWidth: 0,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  menuLabel: { fontSize: 15, color: "#0F0F0F" },
});
