import { Tabs } from "expo-router";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ACTIVE = "#0F0F0F";
const INACTIVE = "#909090";
const BG = "#FFFFFF";
const BORDER = "#E5E5E5";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const isIOS = Platform.OS === "ios";

  const tabBarHeight = isWeb ? 56 : 50 + insets.bottom;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACTIVE,
        tabBarInactiveTintColor: INACTIVE,
        tabBarStyle: {
          backgroundColor: BG,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: BORDER,
          elevation: 0,
          shadowOpacity: 0,
          height: tabBarHeight,
          paddingBottom: isWeb ? 8 : insets.bottom,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "400",
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <Ionicons name="home" size={24} color={color} />
            ) : (
              <Ionicons name="home-outline" size={24} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="shorts"
        options={{
          title: "Shorts",
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <MaterialCommunityIcons name="play-box" size={24} color={color} />
            ) : (
              <MaterialCommunityIcons name="play-box-outline" size={24} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Create",
          tabBarIcon: ({ color }) => (
            <View style={styles.createIcon}>
              <Feather name="plus" size={18} color="#0F0F0F" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "Subscriptions",
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <Ionicons name="people" size={24} color={color} />
            ) : (
              <Ionicons name="people-outline" size={24} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "You",
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <Ionicons name="person-circle" size={24} color={color} />
            ) : (
              <Ionicons name="person-circle-outline" size={24} color={color} />
            ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  createIcon: {
    width: 34,
    height: 24,
    backgroundColor: "#F2F2F2",
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#D0D0D0",
    alignItems: "center",
    justifyContent: "center",
  },
});
