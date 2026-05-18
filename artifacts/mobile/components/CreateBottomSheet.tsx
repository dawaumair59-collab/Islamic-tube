import React from "react";
import {
  Modal,
  Platform,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Animated,
  Easing,
  Alert,
  ActivityIndicator,
} from "react-native";

import { Video, Clapperboard, Radio, CheckCircle, ChevronRight } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";

const nativeDriver = Platform.OS !== "web";

interface CreateBottomSheetProps {
  visible: boolean;
  onClose: () => void;
}

type PickStatus = "idle" | "picking" | "success" | "error";

interface PickResult {
  uri: string;
  fileName: string;
  duration: number | null;
  fileSize: number | null;
  videoType: "short" | "long";
}

export default function CreateBottomSheet({
  visible,
  onClose,
}: CreateBottomSheetProps) {
  const slideAnim = React.useRef(new Animated.Value(300)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const [pickStatus, setPickStatus] = React.useState<PickStatus>("idle");
  const [pickResult, setPickResult] = React.useState<PickResult | null>(null);
  const [activeOption, setActiveOption] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (visible) {
      setPickStatus("idle");
      setPickResult(null);
      setActiveOption(null);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.ease),
          useNativeDriver: nativeDriver,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 280,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: nativeDriver,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: nativeDriver,
        }),
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 220,
          easing: Easing.in(Easing.ease),
          useNativeDriver: nativeDriver,
        }),
      ]).start();
    }
  }, [visible]);

  const formatDuration = (ms: number | null) => {
    if (!ms) return null;
    const secs = Math.round(ms / 1000);
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return null;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const pickVideo = async (type: "short" | "long") => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please allow access to your media library to upload videos.",
        [{ text: "OK" }]
      );
      return;
    }

    setActiveOption(type);
    setPickStatus("picking");

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["videos"],
        allowsEditing: type === "short",
        videoMaxDuration: type === "short" ? 60 : undefined,
        quality: type === "long" ? 1 : 0.8,
        allowsMultipleSelection: false,
      });

      if (result.canceled) {
        setPickStatus("idle");
        setActiveOption(null);
        return;
      }

      const asset = result.assets[0];

      if (type === "short" && asset.duration && asset.duration > 60000) {
        setPickStatus("error");
        Alert.alert(
          "Video Too Long",
          "Short videos must be under 60 seconds. Please choose a shorter clip.",
          [
            {
              text: "OK",
              onPress: () => {
                setPickStatus("idle");
                setActiveOption(null);
              },
            },
          ]
        );
        return;
      }

      setPickResult({
        uri: asset.uri,
        fileName: asset.fileName ?? asset.uri.split("/").pop() ?? "video",
        duration: asset.duration ?? null,
        fileSize: asset.fileSize ?? null,
        videoType: type,
      });
      setPickStatus("success");
    } catch {
      setPickStatus("error");
      Alert.alert("Error", "Something went wrong. Please try again.", [
        {
          text: "OK",
          onPress: () => {
            setPickStatus("idle");
            setActiveOption(null);
          },
        },
      ]);
    }
  };

  const handleGoLive = () => {
    onClose();
    setTimeout(() => {
      Alert.alert("Go Live", "Live streaming is coming soon!", [
        { text: "OK" },
      ]);
    }, 300);
  };

  const handleClose = () => {
    setPickStatus("idle");
    setPickResult(null);
    setActiveOption(null);
    onClose();
  };

  const isLoading = pickStatus === "picking";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
      >
        <View style={styles.handle} />

        {pickStatus === "success" && pickResult ? (
          <>
            <View style={styles.successWrap}>
              <CheckCircle size={44} color="#00A86B" />
              <Text style={styles.successTitle}>Video Selected!</Text>
              <Text style={styles.successFile} numberOfLines={1}>
                {pickResult.fileName}
              </Text>
              <View style={styles.metaRow}>
                {pickResult.duration != null && (
                  <Text style={styles.metaText}>
                    {formatDuration(pickResult.duration)}
                  </Text>
                )}
                {pickResult.fileSize != null && (
                  <Text style={styles.metaText}>
                    {formatSize(pickResult.fileSize)}
                  </Text>
                )}
              </View>
            </View>
            <TouchableOpacity
              style={styles.uploadBtn}
              activeOpacity={0.8}
              onPress={() => {
                if (!pickResult) return;
                onClose();
                setPickStatus("idle");
                setPickResult(null);
                setActiveOption(null);
                router.push({
                  pathname: "/upload",
                  params: {
                    uri: pickResult.uri,
                    fileName: pickResult.fileName,
                    duration: pickResult.duration ?? "",
                    fileSize: pickResult.fileSize ?? "",
                    videoType: pickResult.videoType,
                  },
                });
              }}
            >
              <Text style={styles.uploadBtnText}>Start Upload</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => {
                setPickStatus("idle");
                setPickResult(null);
                setActiveOption(null);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelText}>Choose Different Video</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.sheetTitle}>Create</Text>

            <TouchableOpacity
              style={[styles.option, styles.optionBorder]}
              activeOpacity={0.7}
              onPress={() => pickVideo("short")}
              disabled={isLoading}
            >
              <View style={styles.iconWrap}>
                {isLoading && activeOption === "short" ? (
                  <ActivityIndicator size="small" color="#0F0F0F" />
                ) : (
                  <Clapperboard size={24} color="#0F0F0F" />
                )}
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>Short Video</Text>
                <Text style={styles.optionSubtitle}>
                  Upload a short video (under 60 seconds)
                </Text>
              </View>
              <ChevronRight size={18} color="#C0C0C0" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.option, styles.optionBorder]}
              activeOpacity={0.7}
              onPress={() => pickVideo("long")}
              disabled={isLoading}
            >
              <View style={styles.iconWrap}>
                {isLoading && activeOption === "long" ? (
                  <ActivityIndicator size="small" color="#0F0F0F" />
                ) : (
                  <Video size={24} color="#0F0F0F" />
                )}
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>Long Video</Text>
                <Text style={styles.optionSubtitle}>
                  Upload a long video in HD quality
                </Text>
              </View>
              <ChevronRight size={18} color="#C0C0C0" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.option}
              activeOpacity={0.7}
              onPress={handleGoLive}
              disabled={isLoading}
            >
              <View style={[styles.iconWrap, styles.liveIconWrap]}>
                <Radio size={24} color="#FF0000" />
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>Go Live</Text>
                <Text style={styles.optionSubtitle}>Start a live stream</Text>
              </View>
              <ChevronRight size={18} color="#C0C0C0" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={handleClose}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </>
        )}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 10,
    paddingBottom: 36,
    paddingHorizontal: 0,
    elevation: 16,
    ...Platform.select({ web: { boxShadow: "0 -3px 12px rgba(0,0,0,0.12)" } as any }),
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: "#D0D0D0",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 14,
  },
  sheetTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F0F0F",
    textAlign: "center",
    marginBottom: 8,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  optionBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E5E5",
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F2F2F2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  liveIconWrap: {
    backgroundColor: "#FFF0F0",
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F0F0F",
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 13,
    color: "#606060",
    lineHeight: 17,
  },
  cancelBtn: {
    marginTop: 8,
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: "#F2F2F2",
    alignItems: "center",
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F0F0F",
  },
  successWrap: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F0F0F",
    marginTop: 12,
    marginBottom: 6,
  },
  successFile: {
    fontSize: 13,
    color: "#606060",
    maxWidth: "90%",
    textAlign: "center",
  },
  metaRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 8,
  },
  metaText: {
    fontSize: 13,
    color: "#909090",
    fontWeight: "500",
  },
  uploadBtn: {
    marginHorizontal: 20,
    marginBottom: 8,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: "#2563EB",
    alignItems: "center",
  },
  uploadBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
