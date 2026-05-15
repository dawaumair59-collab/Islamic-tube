import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
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
import { SCHOLARS, VIDEOS } from "@/data/mockData";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useColors } from "@/hooks/useColors";

const MENU_ITEMS = [
  { icon: "person-outline", label: "Edit Profile", route: "/auth" },
  { icon: "bookmark-outline", label: "Saved Videos", route: "/(tabs)/library" },
  { icon: "notifications-outline", label: "Notifications", route: "/notifications" },
  { icon: "shield-checkmark-outline", label: "Privacy & Security", route: null },
  { icon: "help-circle-outline", label: "Help & Support", route: null },
  { icon: "information-circle-outline", label: "About IslamicTube", route: null },
];

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const guestUser = {
    name: "Guest User",
    email: "Sign in to access all features",
    avatar: require("../../assets/images/placeholder-scholar.png"),
  };

  const displayUser = user ?? guestUser;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 + bottomPad }}
      >
        {/* Header gradient */}
        <LinearGradient
          colors={[colors.primary, colors.background]}
          style={[styles.headerGradient, { paddingTop: topPad + 16 }]}
        >
          <View style={styles.profileTop}>
            <View style={styles.avatarWrapper}>
              <Image
                source={displayUser.avatar}
                style={styles.avatar}
                contentFit="cover"
              />
              {user && (
                <View style={[styles.editBadge, { backgroundColor: colors.primary }]}>
                  <Feather name="edit-2" size={10} color="#fff" />
                </View>
              )}
            </View>
            <Text style={styles.name}>{displayUser.name}</Text>
            <Text style={styles.email}>{displayUser.email}</Text>

            {!user && (
              <TouchableOpacity
                style={[styles.loginBtn, { backgroundColor: colors.primary }]}
                onPress={() => router.push("/auth")}
              >
                <Text style={styles.loginBtnText}>Sign In</Text>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>

        {/* Stats row */}
        {user && (
          <View style={[styles.statsRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {[
              { label: "Watched", value: "127" },
              { label: "Saved", value: "34" },
              { label: "Liked", value: "89" },
              { label: "Playlists", value: "6" },
            ].map((stat) => (
              <View key={stat.label} style={styles.stat}>
                <Text style={[styles.statValue, { color: colors.primary }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Theme toggle */}
        <View style={[styles.settingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons
                name={isDark ? "moon" : "sunny-outline"}
                size={20}
                color={colors.primary}
              />
              <Text style={[styles.settingLabel, { color: colors.foreground }]}>
                {isDark ? "Dark Mode" : "Light Mode"}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.toggle,
                { backgroundColor: isDark ? colors.primary : colors.secondary },
              ]}
              onPress={toggleTheme}
            >
              <View
                style={[
                  styles.toggleThumb,
                  {
                    backgroundColor: isDark ? "#fff" : colors.mutedForeground,
                    transform: [{ translateX: isDark ? 20 : 2 }],
                  },
                ]}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Subscribed Scholars */}
        {user && (
          <View style={styles.scholarsSection}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Subscribed Scholars
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scholarsRow}>
              {SCHOLARS.map((scholar) => (
                <TouchableOpacity
                  key={scholar.id}
                  style={styles.scholarItem}
                  onPress={() => router.push(`/channel/${scholar.id}`)}
                >
                  <Image source={scholar.avatar} style={styles.scholarAvatar} contentFit="cover" />
                  <Text style={[styles.scholarName, { color: colors.foreground }]} numberOfLines={1}>
                    {scholar.name.split(" ")[1]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Menu items */}
        <View style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              style={[
                styles.menuItem,
                index < MENU_ITEMS.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth },
              ]}
              onPress={() => item.route && router.push(item.route as never)}
            >
              <Ionicons name={item.icon as any} size={20} color={colors.primary} />
              <Text style={[styles.menuLabel, { color: colors.foreground }]}>{item.label}</Text>
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        {user && (
          <TouchableOpacity
            style={[styles.logoutBtn, { borderColor: "#EF4444" }]}
            onPress={() => logout()}
          >
            <Ionicons name="log-out-outline" size={18} color="#EF4444" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        )}

        <Text style={[styles.version, { color: colors.mutedForeground }]}>
          IslamicTube v1.0.0
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  headerGradient: {
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  profileTop: {
    alignItems: "center",
    gap: 8,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 4,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: "#fff",
  },
  editBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  name: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
  },
  email: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
  },
  loginBtn: {
    marginTop: 8,
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 24,
  },
  loginBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  stat: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    gap: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 11,
  },
  settingCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  scholarsSection: {
    marginTop: 20,
    paddingLeft: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 12,
  },
  scholarsRow: {
    gap: 16,
    paddingRight: 16,
  },
  scholarItem: {
    alignItems: "center",
    gap: 5,
    width: 60,
  },
  scholarAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  scholarName: {
    fontSize: 11,
    textAlign: "center",
  },
  menuCard: {
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  logoutText: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "700",
  },
  version: {
    textAlign: "center",
    fontSize: 12,
    marginTop: 16,
    marginBottom: 8,
  },
});
