import { Image } from "expo-image";
import { Trash2 } from "lucide-react-native";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import type { Notification, NotificationType } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

interface NotificationCardProps {
  notification: Notification;
  onPress?: () => void;
  onDelete?: () => void;
}

function typeDotColor(type: NotificationType, primary: string, accent: string): string {
  switch (type) {
    case "live":
      return "#EF4444";
    case "upload":
    case "new_video":
    case "video_approved":
      return primary;
    case "new_like":
      return "#F59E0B";
    case "new_comment":
      return "#10B981";
    case "new_subscriber":
    case "subscription":
      return "#8B5CF6";
    case "video_rejected":
      return "#EF4444";
    default:
      return accent;
  }
}

function typeLabel(type: NotificationType): string {
  switch (type) {
    case "new_video":
    case "upload":
      return "New Video";
    case "live":
      return "Live";
    case "new_subscriber":
    case "subscription":
      return "Subscriber";
    case "video_approved":
      return "Approved";
    case "video_rejected":
      return "Rejected";
    case "new_comment":
      return "Comment";
    case "new_like":
      return "Like";
    default:
      return "";
  }
}

export function NotificationCard({
  notification,
  onPress,
  onDelete,
}: NotificationCardProps) {
  const colors = useColors();
  const dotColor = typeDotColor(notification.type, colors.primary, colors.accent);

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
        <View style={[styles.typeDot, { backgroundColor: dotColor }]} />
      </View>

      <View style={styles.content}>
        <Text
          style={[styles.text, { color: colors.foreground }]}
          numberOfLines={2}
        >
          <Text style={styles.bold}>{notification.scholar}</Text>{" "}
          {notification.message}
        </Text>
        <View style={styles.metaRow}>
          <Text style={[styles.time, { color: colors.mutedForeground }]}>
            {notification.time}
          </Text>
          <View style={[styles.typePill, { backgroundColor: dotColor + "20" }]}>
            <Text style={[styles.typePillText, { color: dotColor }]}>
              {typeLabel(notification.type)}
            </Text>
          </View>
        </View>
      </View>

      {notification.thumbnail && (
        <Image
          source={notification.thumbnail}
          style={styles.thumb}
          contentFit="cover"
        />
      )}

      <View style={styles.rightSide}>
        {!notification.read && (
          <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
        )}
        {onDelete && (
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={(e) => {
              e.stopPropagation?.();
              onDelete();
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Trash2 size={15} color={colors.mutedForeground} strokeWidth={1.8} />
          </TouchableOpacity>
        )}
      </View>
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
    gap: 4,
  },
  text: {
    fontSize: 13,
    lineHeight: 18,
  },
  bold: {
    fontWeight: "700",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  time: {
    fontSize: 11,
  },
  typePill: {
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  typePillText: {
    fontSize: 10,
    fontWeight: "600",
  },
  thumb: {
    width: 56,
    height: 40,
    borderRadius: 6,
    flexShrink: 0,
  },
  rightSide: {
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  deleteBtn: {
    padding: 2,
  },
});
