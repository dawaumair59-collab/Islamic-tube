import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";

function SkeletonBox({ width, height, borderRadius = 8, style }: {
  width?: number | string;
  height: number;
  borderRadius?: number;
  style?: object;
}) {
  const colors = useColors();
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 700 }),
        withTiming(1, { duration: 700 })
      ),
      -1,
      false
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        {
          width: width as number,
          height,
          borderRadius,
          backgroundColor: colors.muted,
        },
        animStyle,
        style,
      ]}
    />
  );
}

export function VideoCardSkeleton() {
  return (
    <View style={styles.card}>
      <SkeletonBox width="100%" height={200} borderRadius={10} />
      <View style={styles.info}>
        <View style={styles.avatarRow}>
          <SkeletonBox width={28} height={28} borderRadius={14} />
          <View style={styles.textGroup}>
            <SkeletonBox width={180} height={14} />
            <SkeletonBox width={120} height={11} style={{ marginTop: 4 }} />
          </View>
        </View>
      </View>
    </View>
  );
}

export function VideoListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <VideoCardSkeleton key={i} />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  info: {
    paddingTop: 8,
  },
  avatarRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  textGroup: {
    flex: 1,
  },
});
