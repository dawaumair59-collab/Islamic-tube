import { Tabs } from "expo-router";
import {
  Clapperboard,
  Home,
  Plus,
  Users,
  CircleUser,
} from "lucide-react-native";
import React from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CreateBottomSheet from "../../components/CreateBottomSheet";

const ACTIVE = "#0F0F0F";
const INACTIVE = "#909090";
const BG = "#FFFFFF";
const BORDER = "#E5E5E5";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const [createSheetVisible, setCreateSheetVisible] = React.useState(false);

  const tabBarHeight = isWeb ? 62 : 58 + insets.bottom;

  return (
    <>
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
            paddingBottom: isWeb ? 6 : insets.bottom,
            paddingTop: 6,
          },
          tabBarLabelStyle: {
            fontSize: 9,
            fontWeight: "400",
            marginTop: 2,
            includeFontPadding: false,
          },
          tabBarItemStyle: {
            flex: 1,
            paddingHorizontal: 0,
            minWidth: 0,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
              <Home
                size={23}
                color={color}
                fill={focused ? color : "transparent"}
                strokeWidth={focused ? 2 : 1.8}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="shorts"
          options={{
            title: "Shorts",
            tabBarIcon: ({ color, focused }) => (
              <Clapperboard
                size={23}
                color={color}
                fill={focused ? color : "transparent"}
                strokeWidth={focused ? 2 : 1.8}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="create"
          options={{
            title: "Create",
            tabBarIcon: () => (
              <View style={styles.createIcon}>
                <Plus size={18} color="#0F0F0F" strokeWidth={2} />
              </View>
            ),
            tabBarButton: (props) => (
              <Pressable
                {...props}
                onPress={() => setCreateSheetVisible(true)}
                style={[props.style, { alignItems: "center", justifyContent: "center" }]}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            title: "Subscriptions",
            tabBarIcon: ({ color, focused }) => (
              <Users
                size={23}
                color={color}
                fill={focused ? color : "transparent"}
                strokeWidth={focused ? 2 : 1.8}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "You",
            tabBarIcon: ({ color, focused }) => (
              <CircleUser
                size={23}
                color={color}
                fill={focused ? color : "transparent"}
                strokeWidth={focused ? 2 : 1.8}
              />
            ),
          }}
        />
      </Tabs>

      <CreateBottomSheet
        visible={createSheetVisible}
        onClose={() => setCreateSheetVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  createIcon: {
    width: 36,
    height: 24,
    backgroundColor: "#F2F2F2",
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#D0D0D0",
    alignItems: "center",
    justifyContent: "center",
  },
});
