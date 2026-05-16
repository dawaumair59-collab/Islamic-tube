import { BellOff, ChevronLeft, Trash2 } from "lucide-react-native";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
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

import { NotificationCard } from "@/components/NotificationCard";
import { NOTIFICATIONS } from "@/data/mockData";
import type { Notification } from "@/data/mockData";
import { notificationsApi } from "@/services/api";
import { useColors } from "@/hooks/useColors";
import { useNotifications } from "@/context/NotificationContext";
import { useAuth } from "@/context/AuthContext";

const POLL_INTERVAL_MS = 30_000;

export default function NotificationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { refresh: refreshBadge } = useNotifications();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const pollerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const loadNotifications = useCallback(async () => {
    if (!user) {
      setNotifications(NOTIFICATIONS);
      setLoading(false);
      return;
    }
    try {
      const { notifications: fetched } = await notificationsApi.list();
      setNotifications(fetched.length > 0 ? fetched : NOTIFICATIONS);
    } catch {
      setNotifications(NOTIFICATIONS);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadNotifications();
    pollerRef.current = setInterval(loadNotifications, POLL_INTERVAL_MS);
    return () => {
      if (pollerRef.current) clearInterval(pollerRef.current);
    };
  }, [loadNotifications]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    refreshBadge();
    setRefreshing(false);
  };

  const handleMarkRead = async (notif: Notification) => {
    if (notif.read) return;
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
    try {
      if (user) await notificationsApi.markRead(notif.id);
      refreshBadge();
    } catch {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: false } : n))
      );
    }
  };

  const handleDelete = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      if (user) await notificationsApi.delete(id);
      refreshBadge();
    } catch {
      loadNotifications();
    }
  };

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      if (user) await notificationsApi.markAllRead();
      refreshBadge();
    } catch {
      loadNotifications();
    }
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.foreground} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          Notifications
        </Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={[styles.markAll, { color: colors.primary }]}>
              Mark all read
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 + bottomPad }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {unreadCount > 0 && (
            <View style={styles.sectionLabel}>
              <Text
                style={[styles.sectionText, { color: colors.mutedForeground }]}
              >
                New · {unreadCount}
              </Text>
            </View>
          )}

          {notifications.map((notif) => (
            <NotificationCard
              key={notif.id}
              notification={notif}
              onPress={() => handleMarkRead(notif)}
              onDelete={() => handleDelete(notif.id)}
            />
          ))}

          {notifications.length === 0 && (
            <View style={styles.empty}>
              <BellOff
                size={52}
                color={colors.mutedForeground}
                strokeWidth={1.5}
              />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                No notifications
              </Text>
              <Text
                style={[styles.emptyText, { color: colors.mutedForeground }]}
              >
                Subscribe to scholars to receive updates
              </Text>
            </View>
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
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: "700" },
  markAll: { fontSize: 13, fontWeight: "500" },
  loadingCenter: { flex: 1, alignItems: "center", justifyContent: "center" },
  sectionLabel: { paddingHorizontal: 16, paddingVertical: 8 },
  sectionText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  empty: {
    alignItems: "center",
    paddingTop: 80,
    gap: 8,
    paddingHorizontal: 40,
  },
  emptyTitle: { fontSize: 17, fontWeight: "700" },
  emptyText: { fontSize: 14, textAlign: "center" },
});
