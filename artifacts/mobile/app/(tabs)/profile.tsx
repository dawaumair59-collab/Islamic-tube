import { Feather, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
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

import { SCHOLARS } from "@/data/mockData";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

const MENU_ITEMS = [
  { icon: "time-outline" as const, label: "History" },
  { icon: "play-circle-outline" as const, label: "Your videos" },
  { icon: "bookmark-outline" as const, label: "Saved videos" },
  { icon: "thumbs-up-outline" as const, label: "Liked videos" },
  { icon: "settings-outline" as const, label: "Settings" },
  { icon: "help-circle-outline" as const, label: "Help & feedback" },
];

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 60;

  const displayName = user ? user.name : "Sign in";
  const displayHandle = user ? "@user · IslamicTube" : "Personalize your experience";
  const displayAvatar = require("../../assets/images/placeholder-scholar.png");

  return (
    <View style={[styles.screen, { backgroundColor: "#FFFFFF" }]}>
      {/* Navbar */}
      <View style={[styles.navbar, { paddingTop: topPad + 4, borderBottomColor: "#E5E5E5" }]}>
        <Text style={styles.navTitle}>You</Text>
        <View style={styles.navRight}>
          <TouchableOpacity style={styles.navBtn} onPress={() => router.push("/(tabs)/search")}>
            <Feather name="search" size={22} color="#0F0F0F" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navBtn}>
            <Feather name="settings" size={22} color="#0F0F0F" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPad }}
      >
        {/* User identity row */}
        <TouchableOpacity
          style={styles.identityRow}
          activeOpacity={0.8}
          onPress={() => !user && router.push("/auth")}
        >
          <Image
            source={displayAvatar}
            style={styles.avatar}
            contentFit="cover"
          />
          <View style={styles.identityText}>
            <Text style={styles.userName}>{displayName}</Text>
            <Text style={styles.userHandle}>{displayHandle}</Text>
            {!user && (
              <Text style={styles.signInLink}>Sign in &rsaquo;</Text>
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Subscribed scholars */}
        <View style={styles.scholarsSection}>
          <View style={styles.scholarsHeader}>
            <Text style={styles.scholarsTitle}>Subscriptions</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scholarsRow}
          >
            {SCHOLARS.map((scholar) => (
              <TouchableOpacity
                key={scholar.id}
                style={styles.scholarItem}
                onPress={() => router.push(`/channel/${scholar.id}`)}
              >
                <View style={styles.scholarAvatarWrap}>
                  <Image
                    source={scholar.avatar}
                    style={styles.scholarAvatar}
                    contentFit="cover"
                  />
                  <View style={styles.liveRing} />
                </View>
                <Text style={styles.scholarName} numberOfLines={1}>
                  {scholar.name.split(" ").slice(-1)[0]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.divider} />

        {/* Menu list */}
        {MENU_ITEMS.map((item, i) => (
          <TouchableOpacity key={item.label} style={styles.menuRow}>
            <Ionicons name={item.icon} size={22} color="#0F0F0F" />
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Feather name="chevron-right" size={16} color="#909090" />
          </TouchableOpacity>
        ))}

        <View style={styles.divider} />

        {user && (
          <TouchableOpacity style={styles.menuRow} onPress={() => logout()}>
            <Ionicons name="log-out-outline" size={22} color="#FF0000" />
            <Text style={[styles.menuLabel, { color: "#FF0000" }]}>Sign out</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.version}>IslamicTube v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    backgroundColor: "#FFFFFF",
  },
  navTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F0F0F",
  },
  navRight: {
    flexDirection: "row",
    gap: 4,
  },
  navBtn: {
    padding: 8,
  },
  identityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  identityText: {
    flex: 1,
    gap: 2,
  },
  userName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#0F0F0F",
  },
  userHandle: {
    fontSize: 13,
    color: "#606060",
  },
  signInLink: {
    fontSize: 13,
    color: "#2563EB",
    fontWeight: "500",
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E5E5E5",
    marginVertical: 4,
  },
  scholarsSection: {
    paddingVertical: 12,
  },
  scholarsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  scholarsTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F0F0F",
  },
  seeAll: {
    fontSize: 13,
    color: "#2563EB",
  },
  scholarsRow: {
    paddingHorizontal: 16,
    gap: 16,
  },
  scholarItem: {
    alignItems: "center",
    gap: 6,
    width: 62,
  },
  scholarAvatarWrap: {
    position: "relative",
  },
  scholarAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: "#E5E5E5",
  },
  liveRing: {
    position: "absolute",
    inset: -2,
    borderRadius: 30,
  },
  scholarName: {
    fontSize: 11,
    color: "#0F0F0F",
    textAlign: "center",
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    color: "#0F0F0F",
  },
  version: {
    textAlign: "center",
    fontSize: 11,
    color: "#909090",
    marginTop: 16,
    marginBottom: 8,
  },
});
