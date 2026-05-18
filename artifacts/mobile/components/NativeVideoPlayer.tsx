import { VideoView, useVideoPlayer } from "expo-video";
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";

interface Props {
  videoUrl: string;
}

export function NativeVideoPlayer({ videoUrl }: Props) {
  const player = useVideoPlayer(
    videoUrl ? { uri: videoUrl } : null,
    (p) => { p.loop = false; }
  );

  useEffect(() => {
    if (videoUrl) {
      try { player.replace({ uri: videoUrl }); } catch {}
    }
  }, [videoUrl]);

  return (
    <VideoView
      player={player}
      style={StyleSheet.absoluteFill}
      allowsPictureInPicture
      nativeControls
      contentFit="contain"
    />
  );
}
