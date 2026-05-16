import {
  Clapperboard,
  Film,
  Image as ImageIcon,
  Upload,
  X,
  CheckCircle,
  FileVideo,
  Pencil,
  Trash2,
  Globe,
  Link,
  Lock,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

const CATEGORIES = [
  "Quran", "Seerah", "Fiqh", "Spirituality",
  "Dhikr", "Dua", "Ramadan", "Family", "Finance", "Reminder",
];

const VIDEO_TYPES = ["Long Video", "Short"];

function formatDuration(ms: number) {
  const secs = Math.round(ms / 1000);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    uri?: string;
    fileName?: string;
    duration?: string;
    fileSize?: string;
    videoType?: "short" | "long";
  }>();

  const initialType = params.videoType === "short" ? "Short" : "Long Video";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Quran");
  const [selectedType, setSelectedType] = useState(initialType);
  const [tags, setTags] = useState("");
  const [visibility, setVisibility] = useState<"Public" | "Unlisted" | "Private">("Public");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [thumbnailUri, setThumbnailUri] = useState<string | null>(null);
  const [thumbnailPicking, setThumbnailPicking] = useState(false);

  const progressWidth = useSharedValue(0);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const progressStyle = useAnimatedStyle(
    () => ({ width: `${progressWidth.value}%` as `${number}%` })
  );

  const hasPickedFile = !!params.uri;
  const pickedFileName = params.fileName ?? null;
  const pickedDuration = params.duration ? Number(params.duration) : null;
  const pickedFileSize = params.fileSize ? Number(params.fileSize) : null;

  const pickThumbnail = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please allow access to your photo library to add a thumbnail.",
        [{ text: "OK" }]
      );
      return;
    }

    setThumbnailPicking(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.9,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets[0]) {
        setThumbnailUri(result.assets[0].uri);
      }
    } catch {
      Alert.alert("Error", "Could not open photo library. Please try again.");
    } finally {
      setThumbnailPicking(false);
    }
  };

  const removeThumbnail = () => {
    Alert.alert("Remove Thumbnail", "Are you sure you want to remove this thumbnail?", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => setThumbnailUri(null) },
    ]);
  };

  const handleUpload = () => {
    if (!title) return;
    setUploading(true);
    setProgress(0);
    progressWidth.value = 0;

    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 15;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setTimeout(() => { setUploading(false); setDone(true); }, 500);
      }
      setProgress(Math.round(p));
      progressWidth.value = withTiming(p, { duration: 300 });
    }, 400);
  };

  if (done) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={styles.successContainer}>
          <View style={[styles.successIcon, { backgroundColor: colors.accent }]}>
            <CheckCircle size={64} color={colors.primary} strokeWidth={1.5} />
          </View>
          <Text style={[styles.successTitle, { color: colors.foreground }]}>
            Video Uploaded!
          </Text>
          <Text style={[styles.successText, { color: colors.mutedForeground }]}>
            Your video is under review and will be published after approval.
          </Text>
          <TouchableOpacity
            style={[styles.doneBtn, { backgroundColor: colors.primary }]}
            onPress={() => {
              setDone(false);
              setTitle("");
              setDescription("");
              setTags("");
              setThumbnailUri(null);
              router.back();
            }}
          >
            <Text style={styles.doneBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
        <TouchableOpacity onPress={() => router.back()}>
          <X size={24} color={colors.foreground} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          Upload Video
        </Text>
        <TouchableOpacity onPress={handleUpload} disabled={!title || uploading}>
          <Text
            style={[
              styles.publishBtn,
              {
                color:
                  title && !uploading
                    ? colors.primary
                    : colors.mutedForeground,
              },
            ]}
          >
            Publish
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 + bottomPad }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Video type toggle */}
          <View style={[styles.typeRow, { backgroundColor: colors.secondary }]}>
            {VIDEO_TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.typeBtn,
                  selectedType === t && { backgroundColor: colors.background },
                ]}
                onPress={() => setSelectedType(t)}
              >
                {t === "Short" ? (
                  <Clapperboard
                    size={16}
                    color={
                      selectedType === t
                        ? colors.primary
                        : colors.mutedForeground
                    }
                    strokeWidth={1.8}
                  />
                ) : (
                  <Film
                    size={16}
                    color={
                      selectedType === t
                        ? colors.primary
                        : colors.mutedForeground
                    }
                    strokeWidth={1.8}
                  />
                )}
                <Text
                  style={[
                    styles.typeBtnText,
                    {
                      color:
                        selectedType === t
                          ? colors.primary
                          : colors.mutedForeground,
                      fontWeight: selectedType === t ? "700" : "400",
                    },
                  ]}
                >
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Thumbnail picker ── */}
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>
              Thumbnail
            </Text>

            {thumbnailUri ? (
              <View style={styles.thumbPreviewWrap}>
                <Image
                  source={{ uri: thumbnailUri }}
                  style={styles.thumbPreview}
                  resizeMode="cover"
                />
                {/* dim overlay with action buttons */}
                <View style={styles.thumbOverlay}>
                  <TouchableOpacity
                    style={styles.thumbAction}
                    onPress={pickThumbnail}
                    activeOpacity={0.8}
                  >
                    <Pencil size={16} color="#fff" strokeWidth={2} />
                    <Text style={styles.thumbActionText}>Change</Text>
                  </TouchableOpacity>
                  <View style={styles.thumbDivider} />
                  <TouchableOpacity
                    style={styles.thumbAction}
                    onPress={removeThumbnail}
                    activeOpacity={0.8}
                  >
                    <Trash2 size={16} color="#fff" strokeWidth={2} />
                    <Text style={styles.thumbActionText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.uploadBox,
                  {
                    borderColor: colors.primary,
                    backgroundColor: colors.accent,
                  },
                ]}
                onPress={pickThumbnail}
                disabled={thumbnailPicking}
                activeOpacity={0.75}
              >
                <LinearGradient
                  colors={[colors.accent, colors.background]}
                  style={StyleSheet.absoluteFill}
                />
                {thumbnailPicking ? (
                  <ActivityIndicator size="large" color={colors.primary} />
                ) : (
                  <>
                    <ImageIcon
                      size={36}
                      color={colors.primary}
                      strokeWidth={1.5}
                    />
                    <Text
                      style={[
                        styles.uploadBoxTitle,
                        { color: colors.primary },
                      ]}
                    >
                      Add Thumbnail
                    </Text>
                    <Text
                      style={[
                        styles.uploadBoxSub,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      Tap to choose from library (16:9 ratio)
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Video file — show picked file info if available */}
          {hasPickedFile ? (
            <View
              style={[
                styles.fileCard,
                {
                  backgroundColor: colors.secondary,
                  borderColor: colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.fileIconWrap,
                  { backgroundColor: colors.accent },
                ]}
              >
                <FileVideo
                  size={28}
                  color={colors.primary}
                  strokeWidth={1.5}
                />
              </View>
              <View style={styles.fileInfo}>
                <Text
                  style={[styles.fileName, { color: colors.foreground }]}
                  numberOfLines={1}
                >
                  {pickedFileName}
                </Text>
                <View style={styles.fileMeta}>
                  {pickedDuration != null && pickedDuration > 0 && (
                    <Text
                      style={[
                        styles.fileMetaText,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      {formatDuration(pickedDuration)}
                    </Text>
                  )}
                  {pickedFileSize != null && pickedFileSize > 0 && (
                    <Text
                      style={[
                        styles.fileMetaText,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      {formatSize(pickedFileSize)}
                    </Text>
                  )}
                </View>
              </View>
              <View
                style={[
                  styles.fileReadyBadge,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Text style={styles.fileReadyText}>Ready</Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.uploadBox,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.secondary,
                },
              ]}
            >
              <Film size={36} color={colors.mutedForeground} strokeWidth={1.5} />
              <Text
                style={[
                  styles.uploadBoxTitle,
                  { color: colors.foreground },
                ]}
              >
                Select Video File
              </Text>
              <Text
                style={[
                  styles.uploadBoxSub,
                  { color: colors.mutedForeground },
                ]}
              >
                MP4, MOV, AVI · Max 4GB
              </Text>
            </TouchableOpacity>
          )}

          {/* Title */}
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>
              Title *
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  borderColor: colors.border,
                  color: colors.foreground,
                  backgroundColor: colors.secondary,
                },
              ]}
              placeholder="Enter a compelling title..."
              placeholderTextColor={colors.mutedForeground}
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
            <Text style={[styles.charCount, { color: colors.mutedForeground }]}>
              {title.length}/100
            </Text>
          </View>

          {/* Description */}
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>
              Description
            </Text>
            <TextInput
              style={[
                styles.textInput,
                styles.multilineInput,
                {
                  borderColor: colors.border,
                  color: colors.foreground,
                  backgroundColor: colors.secondary,
                },
              ]}
              placeholder="Describe your video content..."
              placeholderTextColor={colors.mutedForeground}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={[styles.charCount, { color: colors.mutedForeground }]}>
              {description.length}/500
            </Text>
          </View>

          {/* Category */}
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>
              Category
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.catRow}
            >
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.catChip,
                    {
                      backgroundColor:
                        selectedCategory === cat
                          ? colors.primary
                          : colors.secondary,
                      borderColor:
                        selectedCategory === cat
                          ? colors.primary
                          : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text
                    style={[
                      styles.catChipText,
                      {
                        color:
                          selectedCategory === cat ? "#fff" : colors.foreground,
                      },
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Tags */}
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>
              Tags
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  borderColor: colors.border,
                  color: colors.foreground,
                  backgroundColor: colors.secondary,
                },
              ]}
              placeholder="islam, quran, lecture, reminder"
              placeholderTextColor={colors.mutedForeground}
              value={tags}
              onChangeText={setTags}
            />
          </View>

          {/* Visibility */}
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>
              Visibility
            </Text>
            <View style={styles.visRow}>
              {(["Public", "Unlisted", "Private"] as const).map((opt) => {
                const active = visibility === opt;
                const icon =
                  opt === "Public" ? (
                    <Globe
                      size={20}
                      color={active ? colors.primary : colors.mutedForeground}
                      strokeWidth={1.8}
                    />
                  ) : opt === "Unlisted" ? (
                    <Link
                      size={20}
                      color={active ? colors.primary : colors.mutedForeground}
                      strokeWidth={1.8}
                    />
                  ) : (
                    <Lock
                      size={20}
                      color={active ? colors.primary : colors.mutedForeground}
                      strokeWidth={1.8}
                    />
                  );
                const subtitle =
                  opt === "Public"
                    ? "Everyone can watch"
                    : opt === "Unlisted"
                    ? "Only people with the link"
                    : "Only you can watch";
                return (
                  <TouchableOpacity
                    key={opt}
                    style={[
                      styles.visCard,
                      {
                        borderColor: active ? colors.primary : colors.border,
                        backgroundColor: active ? colors.accent : colors.secondary,
                      },
                    ]}
                    onPress={() => setVisibility(opt)}
                    activeOpacity={0.75}
                  >
                    {icon}
                    <Text
                      style={[
                        styles.visLabel,
                        {
                          color: active ? colors.primary : colors.foreground,
                          fontWeight: active ? "700" : "500",
                        },
                      ]}
                    >
                      {opt}
                    </Text>
                    <Text
                      style={[
                        styles.visSub,
                        { color: colors.mutedForeground },
                      ]}
                      numberOfLines={2}
                    >
                      {subtitle}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Upload progress */}
          {uploading && (
            <View
              style={[
                styles.progressCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.progressHeader}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text
                  style={[
                    styles.progressLabel,
                    { color: colors.foreground },
                  ]}
                >
                  Uploading...
                </Text>
                <Text
                  style={[
                    styles.progressPercent,
                    { color: colors.primary },
                  ]}
                >
                  {progress}%
                </Text>
              </View>
              <View
                style={[
                  styles.progressTrack,
                  { backgroundColor: colors.secondary },
                ]}
              >
                <Animated.View
                  style={[
                    styles.progressFill,
                    { backgroundColor: colors.primary },
                    progressStyle,
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.progressHint,
                  { color: colors.mutedForeground },
                ]}
              >
                Please keep this screen open while uploading.
              </Text>
            </View>
          )}

          {/* Submit */}
          <TouchableOpacity
            style={[
              styles.submitBtn,
              {
                backgroundColor:
                  title && !uploading ? colors.primary : colors.secondary,
              },
            ]}
            onPress={handleUpload}
            disabled={!title || uploading}
            activeOpacity={0.85}
          >
            <Upload
              size={20}
              color={title && !uploading ? "#fff" : colors.mutedForeground}
              strokeWidth={1.8}
            />
            <Text
              style={[
                styles.submitBtnText,
                {
                  color:
                    title && !uploading ? "#fff" : colors.mutedForeground,
                },
              ]}
            >
              {uploading ? "Uploading..." : "Publish Video"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { fontSize: 17, fontWeight: "700" },
  publishBtn: { fontSize: 16, fontWeight: "700" },
  content: { padding: 16, gap: 16 },
  typeRow: { flexDirection: "row", borderRadius: 10, padding: 3 },
  typeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 9,
    borderRadius: 8,
  },
  typeBtnText: { fontSize: 13 },
  uploadBox: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    gap: 8,
    overflow: "hidden",
  },
  uploadBoxTitle: { fontSize: 15, fontWeight: "600" },
  uploadBoxSub: { fontSize: 12 },
  thumbPreviewWrap: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  thumbPreview: {
    width: "100%",
    height: "100%",
  },
  thumbOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
    gap: 0,
  },
  thumbAction: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 4,
  },
  thumbActionText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  thumbDivider: {
    width: 1,
    height: 20,
    backgroundColor: "rgba(255,255,255,0.35)",
    marginHorizontal: 4,
  },
  fileCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    gap: 12,
  },
  fileIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  fileInfo: { flex: 1, gap: 4 },
  fileName: { fontSize: 14, fontWeight: "600" },
  fileMeta: { flexDirection: "row", gap: 10 },
  fileMetaText: { fontSize: 12 },
  fileReadyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    flexShrink: 0,
  },
  fileReadyText: { fontSize: 12, fontWeight: "700", color: "#fff" },
  field: { gap: 6 },
  fieldLabel: { fontSize: 13, fontWeight: "600" },
  textInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
  },
  multilineInput: { height: 100, paddingTop: 11 },
  charCount: { fontSize: 11, textAlign: "right" },
  catRow: { gap: 8 },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  catChipText: { fontSize: 13 },
  visRow: {
    flexDirection: "row",
    gap: 10,
  },
  visCard: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 8,
    gap: 6,
  },
  visLabel: {
    fontSize: 13,
    textAlign: "center",
  },
  visSub: {
    fontSize: 10,
    textAlign: "center",
    lineHeight: 13,
  },
  progressCard: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    gap: 10,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  progressLabel: { fontSize: 14, fontWeight: "600", flex: 1 },
  progressPercent: { fontSize: 14, fontWeight: "700" },
  progressTrack: { height: 8, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 4 },
  progressHint: { fontSize: 12 },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
    borderRadius: 14,
  },
  submitBtnText: { fontSize: 16, fontWeight: "700" },
  successContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 14,
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  successTitle: { fontSize: 24, fontWeight: "800" },
  successText: { fontSize: 15, textAlign: "center", lineHeight: 22 },
  doneBtn: {
    marginTop: 8,
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 14,
  },
  doneBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
