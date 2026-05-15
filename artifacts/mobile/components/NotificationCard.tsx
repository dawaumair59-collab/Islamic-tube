import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Notification } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

interface NotificationCardProps {
  notification: Notification;
  onPress?: () => void;
}

export function NotificationCard({ notification, onPress }: NotificationCardProps) {
  const colors = useColors();

  const typeColor =
    notification.type === "live"
      ? "#EF4444"
      : notification.type === "upload"
      ? colors.primary
      : colors.accent;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: notification.read ? colors.background : colors.accent,
          borderBottomColor: colors.border,
        },
      ]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <View style={styles.avatarWrapper}>
        <Image
          source={notification.scholarAvatar}
          style={styles.avatar}
          contentFit="cover"
        />
        <View style={[styles.typeDot, { backgroundColor: typeColor }]} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.text, { color: colors.foreground }]} numberOfLines={2}>
          <Text style={styles.bold}>{notification.scholar}</Text>
          {" "}
          {notification.message}
        </Text>
        <Text style={[styles.time, { color: colors.mutedForeground }]}>
          {notification.time}
        </Text>
      </View>

      {notification.thumbnail && (
        <Image
          source={notification.thumbnail}
          style={styles.thumb}
          contentFit="cover"
        />
      )}

      {!notification.read && (
        <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatarWrapper: {
    position: "relative",
    flexShrink: 0,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  typeDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#fff",
  },
  content: {
    flex: 1,
    gap: 3,
  },
  text: {
    fontSize: 13,
    lineHeight: 18,
  },
  bold: {
    fontWeight: "700",
  },
  time: {
    fontSize: 11,
  },
  thumb: {
    width: 56,
    height: 40,
    borderRadius: 6,
    flexShrink: 0,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
});
