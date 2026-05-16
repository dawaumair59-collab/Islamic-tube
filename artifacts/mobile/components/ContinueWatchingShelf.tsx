import { X } from "lucide-react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { CONTINUE_WATCHING, Video, WatchProgress } from "@/data/mockData";

const CARD_W = 200;
const THUMB_H = Math.round((CARD_W * 9) / 16); // 112px

function parseSeconds(duration: string): number {
  const parts = duration.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return parts[0] * 60 + (parts[1] ?? 0);
}

function formatRemaining(totalSecs: number, progress: number): string {
  const remaining = Math.round(totalSecs * (1 - progress));
  if (remaining < 60) return `${remaining}s left`;
  const mins = Math.round(remaining / 60);
  return `${mins} min left`;
}

interface Props {
  videos: Video[];
}

export function ContinueWatchingShelf({ videos }: Props) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const items = CONTINUE_WATCHING
    .filter((w) => !dismissed.has(w.videoId))
    .map((w) => ({ ...w, video: videos.find((v) => v.id === w.videoId) }))
    .filter((w): w is WatchProgress & { video: Video } => !!w.video);

  if (items.length === 0) return null;

  const dismiss = (videoId: string, e: any) => {
    e.stopPropagation();
    setDismissed((prev) => new Set([...prev, videoId]));
  };

  return (
    <View style={styles.container}>
      {/* Section header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Continue Watching</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {items.map(({ videoId, progress, video }) => {
          const totalSecs = parseSeconds(video.duration);
          const remaining = formatRemaining(totalSecs, progress);

          return (
            <TouchableOpacity
              key={videoId}
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => router.push(`/watch/${videoId}`)}
            >
              {/* Thumbnail + progress bar */}
              <View style={styles.thumbWrap}>
                <Image
                  source={video.thumbnail}
                  style={styles.thumb}
                  contentFit="cover"
                  transition={150}
                />

                {/* Duration badge */}
                <View style={styles.durationBadge}>
                  <Text style={styles.durationText}>{video.duration}</Text>
                </View>

                {/* Dismiss button */}
                <TouchableOpacity
                  style={styles.dismissBtn}
                  onPress={(e) => dismiss(videoId, e)}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <X size={12} color="#fff" strokeWidth={2.5} />
                </TouchableOpacity>

                {/* Progress track + fill */}
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${Math.round(progress * 100)}%` },
                    ]}
                  />
                </View>
              </View>

              {/* Info */}
              <View style={styles.info}>
                <Text style={styles.title} numberOfLines={2}>
                  {video.title}
                </Text>
                <Text style={styles.meta} numberOfLines={1}>
                  {video.scholar}
                </Text>
                <Text style={styles.remaining}>{remaining}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F0F0F",
  },
  seeAll: {
    fontSize: 13,
    fontWeight: "500",
    color: "#2563EB",
  },
  row: {
    paddingHorizontal: 12,
    gap: 10,
  },
  card: {
    width: CARD_W,
    backgroundColor: "#FFFFFF",
  },
  thumbWrap: {
    width: CARD_W,
    height: THUMB_H,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "#E5E5E5",
    position: "relative",
  },
  thumb: {
    width: "100%",
    height: "100%",
  },
  durationBadge: {
    position: "absolute",
    bottom: 7,
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
  dismissBtn: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  progressTrack: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FF0000",
  },
  info: {
    paddingTop: 7,
    paddingHorizontal: 2,
    gap: 2,
  },
  title: {
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
    color: "#0F0F0F",
  },
  meta: {
    fontSize: 11,
    color: "#606060",
    lineHeight: 16,
  },
  remaining: {
    fontSize: 11,
    color: "#606060",
    lineHeight: 16,
  },
});
