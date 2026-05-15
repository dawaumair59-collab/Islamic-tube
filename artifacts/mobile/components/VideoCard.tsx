import { Ionicons } from "@expo/vector-icons";
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

export function VideoCard({ video, horizontal = false }: VideoCardProps) {
  const colors = useColors();
  const [menuVisible, setMenuVisible] = useState(false);

  if (horizontal) {
    return (
      <TouchableOpacity
        style={[styles.horizontal, { backgroundColor: colors.background }]}
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
          <Text style={[styles.titleHorizontal, { color: colors.foreground }]} numberOfLines={2}>
            {video.title}
          </Text>
          <Text style={[styles.metaSmall, { color: colors.mutedForeground }]} numberOfLines={1}>
            {video.scholar}
          </Text>
          <Text style={[styles.metaSmall, { color: colors.mutedForeground }]}>
            {video.views} views · {video.createdAt}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.background }]}
      activeOpacity={0.9}
      onPress={() => router.push(`/watch/${video.id}`)}
    >
      {/* Thumbnail — full width, edge-to-edge */}
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

      {/* Info row */}
      <View style={styles.infoRow}>
        <TouchableOpacity
          onPress={() => router.push(`/channel/${video.scholarId}`)}
          activeOpacity={0.8}
        >
          <Image
            source={video.scholarAvatar}
            style={styles.avatar}
            contentFit="cover"
          />
        </TouchableOpacity>

        <View style={styles.titleBlock}>
          <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>
            {video.title}
          </Text>
          <View style={styles.metaRow}>
            <Text style={[styles.meta, { color: colors.mutedForeground }]} numberOfLines={1}>
              {video.scholar}
            </Text>
            <Ionicons name="checkmark-circle" size={11} color={colors.mutedForeground} style={{ marginLeft: 2 }} />
            <Text style={[styles.meta, { color: colors.mutedForeground }]}>
              {" "}· {video.views} views · {video.createdAt}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.dotBtn}
          onPress={() => setMenuVisible(true)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 0 }}
        >
          <Ionicons name="ellipsis-vertical" size={18} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      {/* Options menu modal */}
      <Modal transparent visible={menuVisible} animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.overlay}>
            <View style={[styles.menu, { backgroundColor: colors.background, borderColor: colors.border }]}>
              {[
                { icon: "time-outline" as const, label: "Save to Watch Later" },
                { icon: "list-outline" as const, label: "Save to Playlist" },
                { icon: "share-outline" as const, label: "Share" },
                { icon: "ban-outline" as const, label: "Not interested" },
              ].map((item) => (
                <TouchableOpacity
                  key={item.label}
                  style={styles.menuItem}
                  onPress={() => setMenuVisible(false)}
                >
                  <Ionicons name={item.icon} size={20} color={colors.foreground} />
                  <Text style={[styles.menuLabel, { color: colors.foreground }]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  thumbWrap: {
    width: "100%",
    aspectRatio: 16 / 9,
    position: "relative",
    backgroundColor: "#E5E5E5",
  },
  thumbImg: {
    width: "100%",
    height: "100%",
  },
  durationBadge: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.82)",
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  durationText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
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
  titleBlock: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "nowrap",
    overflow: "hidden",
  },
  meta: {
    fontSize: 12,
    lineHeight: 17,
  },
  dotBtn: {
    padding: 2,
    marginTop: 1,
    flexShrink: 0,
  },
  horizontal: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
    paddingHorizontal: 12,
  },
  thumbHorizontal: {
    width: 160,
    aspectRatio: 16 / 9,
    borderRadius: 4,
    overflow: "hidden",
    flexShrink: 0,
    backgroundColor: "#E5E5E5",
    position: "relative",
  },
  thumbImgHorizontal: {
    width: "100%",
    height: "100%",
  },
  infoHorizontal: {
    flex: 1,
    gap: 3,
    paddingTop: 2,
  },
  titleHorizontal: {
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
  },
  metaSmall: {
    fontSize: 12,
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  menu: {
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    paddingVertical: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: 0,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  menuLabel: {
    fontSize: 15,
  },
});
