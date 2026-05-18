import {
  BadgeCheck,
  Camera,
  Check,
  ChevronLeft,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Share2,
} from "lucide-react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Platform,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AuthPromptModal } from "@/components/AuthPromptModal";
import type { Video } from "@/data/mockData";
import { videosApi, subscriptionsApi } from "@/services/api";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

function ShortItem({ item, isActive }: { item: Video; isActive: boolean }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(item.likes);
  const [following, setFollowing] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const likeScale = useSharedValue(1);

  const likeAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: likeScale.value }],
  }));

  // ── Video player ────────────────────────────────────────────────
  const player = useVideoPlayer(
    item.videoUrl ? { uri: item.videoUrl } : null,
    (p) => {
      p.loop = true;
    }
  );

  useEffect(() => {
    if (isActive && item.videoUrl) {
      try {
        player.play();
      } catch {}
    } else {
      try {
        player.pause();
      } catch {}
    }
  }, [isActive, item.videoUrl]);

  const handleLike = async () => {
    if (!user) {
      setShowAuthPrompt(true);
      return;
    }
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikes((l) => (wasLiked ? l - 1 : l + 1));
    likeScale.value = withSequence(
      withSpring(1.4, { damping: 6 }),
      withSpring(1, { damping: 8 })
    );
    try {
      if (wasLiked) {
        await videosApi.unlike(item.id);
      } else {
        await videosApi.like(item.id);
      }
    } catch {
      setLiked(wasLiked);
      setLikes((l) => (wasLiked ? l + 1 : l - 1));
    }
  };

  const handleFollow = async () => {
    if (!user) {
      setShowAuthPrompt(true);
      return;
    }
    const wasFollowing = following;
    setFollowing(!wasFollowing);
    try {
      if (wasFollowing) {
        await subscriptionsApi.unfollow(item.scholarId);
      } else {
        await subscriptionsApi.follow(item.scholarId);
      }
    } catch {
      setFollowing(wasFollowing);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Watch "${item.title}" by ${item.scholar} on IslamicTube`,
        url: `https://islamictube.app/watch/${item.id}`,
        title: item.title,
      });
    } catch {}
  };

  const bottomPad = Platform.OS === "web" ? 84 + 34 : 90 + insets.bottom;

  return (
    <View style={[styles.slide, { height: SCREEN_HEIGHT }]}>
      {item.videoUrl ? (
        <VideoView
          player={player}
          style={styles.background}
          contentFit="cover"
          nativeControls={false}
        />
      ) : (
        <Image
          source={item.thumbnail}
          style={styles.background}
          contentFit="cover"
          transition={300}
        />
      )}
      <LinearGradient
        colors={["rgba(0,0,0,0.15)", "transparent", "rgba(0,0,0,0.75)"]}
        style={[StyleSheet.absoluteFill, { pointerEvents: "none" } as any]}
      />

      <View
        style={[
          styles.topBar,
          { paddingTop: Platform.OS === "web" ? 67 : insets.top + 8 },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={26} color="#fff" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.shortsLabel}>Shorts</Text>
        <TouchableOpacity>
          <Camera size={22} color="#fff" strokeWidth={1.8} />
        </TouchableOpacity>
      </View>

      <View style={[styles.actions, { bottom: bottomPad + 60 }]}>
        <View style={styles.scholarAvatarWrapper}>
          <Image
            source={item.scholarAvatar}
            style={styles.scholarAvatar}
            contentFit="cover"
          />
          <TouchableOpacity
            style={[
              styles.followBtn,
              {
                backgroundColor: following
                  ? colors.mutedForeground
                  : colors.primary,
              },
            ]}
            onPress={handleFollow}
          >
            {following ? (
              <Check size={10} color="#fff" strokeWidth={3} />
            ) : (
              <Plus size={10} color="#fff" strokeWidth={3} />
            )}
          </TouchableOpacity>
        </View>

        <Animated.View style={likeAnimStyle}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
            <Heart
              size={30}
              color={liked ? "#EF4444" : "#fff"}
              fill={liked ? "#EF4444" : "transparent"}
              strokeWidth={1.8}
            />
            <Text style={styles.actionCount}>
              {likes >= 1000 ? `${(likes / 1000).toFixed(0)}K` : likes}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => router.push(`/watch/${item.id}`)}
        >
          <MessageCircle size={28} color="#fff" strokeWidth={1.8} />
          <Text style={styles.actionCount}>Comment</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
          <Share2 size={26} color="#fff" strokeWidth={1.8} />
          <Text style={styles.actionCount}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <MoreHorizontal size={26} color="#fff" strokeWidth={1.8} />
        </TouchableOpacity>
      </View>

      <View style={[styles.bottomInfo, { paddingBottom: bottomPad }]}>
        <TouchableOpacity
          onPress={() => router.push(`/channel/${item.scholarId}`)}
          style={styles.scholarNameRow}
        >
          <Text style={styles.scholarText}>{item.scholar}</Text>
          <BadgeCheck
            size={14}
            color={colors.primary}
            fill={colors.primary}
            strokeWidth={0}
          />
        </TouchableOpacity>
        <Text style={styles.shortTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.shortDescription} numberOfLines={1}>
          {item.description}
        </Text>
        <View style={styles.categoryTag}>
          <Text style={styles.categoryTagText}>{item.category}</Text>
        </View>
      </View>

      <AuthPromptModal
        visible={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
        message="Sign in to like and follow scholars"
      />
    </View>
  );
}

export default function ShortsScreen() {
  const [shorts, setShorts] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    videosApi
      .shorts()
      .then(setShorts)
      .catch(() => setShorts([]))
      .finally(() => setLoading(false));
  }, []);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
    []
  );

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 });

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { alignItems: "center", justifyContent: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (shorts.length === 0) {
    return (
      <View
        style={[
          styles.container,
          { alignItems: "center", justifyContent: "center" },
        ]}
      >
        <Text style={{ color: "#fff", fontSize: 15 }}>
          No shorts available
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={shorts}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig.current}
        renderItem={({ item, index }) => (
          <ShortItem item={item} isActive={index === activeIndex} />
        )}
        getItemLayout={(_, index) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * index,
          index,
        })}
        windowSize={3}
        maxToRenderPerBatch={3}
        initialNumToRender={2}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  slide: { width: SCREEN_WIDTH, position: "relative" },
  background: { width: "100%", height: "100%", position: "absolute" },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    zIndex: 10,
  },
  shortsLabel: { color: "#fff", fontSize: 17, fontWeight: "700" },
  actions: {
    position: "absolute",
    right: 12,
    alignItems: "center",
    gap: 20,
  },
  scholarAvatarWrapper: { position: "relative" },
  scholarAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "#fff",
  },
  followBtn: {
    position: "absolute",
    bottom: -6,
    alignSelf: "center",
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  actionBtn: { alignItems: "center", gap: 3 },
  actionCount: { color: "#fff", fontSize: 12, fontWeight: "600" },
  bottomInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 70,
    paddingHorizontal: 16,
    gap: 5,
  },
  scholarNameRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  scholarText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  shortTitle: { color: "#fff", fontSize: 15, fontWeight: "600", lineHeight: 20 },
  shortDescription: { color: "rgba(255,255,255,0.85)", fontSize: 13 },
  categoryTag: {
    backgroundColor: "rgba(37,99,235,0.85)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  categoryTagText: { color: "#fff", fontSize: 11, fontWeight: "600" },
});
