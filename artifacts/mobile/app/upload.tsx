import { AntDesign, Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
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

export default function UploadScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Quran");
  const [selectedType, setSelectedType] = useState("Long Video");
  const [tags, setTags] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  const progressWidth = useSharedValue(0);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

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
        setTimeout(() => {
          setUploading(false);
          setDone(true);
        }, 500);
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
            <Ionicons name="checkmark-circle" size={64} color={colors.primary} />
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
          { paddingTop: topPad + 8, backgroundColor: colors.background, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Upload Video</Text>
        <TouchableOpacity
          onPress={handleUpload}
          disabled={!title || uploading}
        >
          <Text
            style={[
              styles.publishBtn,
              { color: title && !uploading ? colors.primary : colors.mutedForeground },
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
                <MaterialCommunityIcons
                  name={t === "Short" ? "play-box-outline" : "movie-outline"}
                  size={16}
                  color={selectedType === t ? colors.primary : colors.mutedForeground}
                />
                <Text
                  style={[
                    styles.typeBtnText,
                    { color: selectedType === t ? colors.primary : colors.mutedForeground, fontWeight: selectedType === t ? "700" : "400" },
                  ]}
                >
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Thumbnail upload */}
          <TouchableOpacity
            style={[styles.uploadBox, { borderColor: colors.primary, backgroundColor: colors.accent }]}
          >
            <LinearGradient
              colors={[colors.accent, colors.background]}
              style={StyleSheet.absoluteFill}
            />
            <AntDesign name="picture" size={36} color={colors.primary} />
            <Text style={[styles.uploadBoxTitle, { color: colors.primary }]}>Add Thumbnail</Text>
            <Text style={[styles.uploadBoxSub, { color: colors.mutedForeground }]}>
              Tap to upload (JPG, PNG · 16:9 ratio)
            </Text>
          </TouchableOpacity>

          {/* Video file */}
          <TouchableOpacity
            style={[styles.uploadBox, { borderColor: colors.border, backgroundColor: colors.secondary }]}
          >
            <Feather name="film" size={36} color={colors.mutedForeground} />
            <Text style={[styles.uploadBoxTitle, { color: colors.foreground }]}>Select Video File</Text>
            <Text style={[styles.uploadBoxSub, { color: colors.mutedForeground }]}>
              MP4, MOV, AVI · Max 4GB
            </Text>
          </TouchableOpacity>

          {/* Title */}
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Title *</Text>
            <TextInput
              style={[styles.textInput, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.secondary }]}
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
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Description</Text>
            <TextInput
              style={[
                styles.textInput,
                styles.multilineInput,
                { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.secondary },
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
          </View>

          {/* Category */}
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.catChip,
                    {
                      backgroundColor: selectedCategory === cat ? colors.primary : colors.secondary,
                      borderColor: selectedCategory === cat ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text
                    style={[
                      styles.catChipText,
                      { color: selectedCategory === cat ? "#fff" : colors.foreground },
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
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Tags</Text>
            <TextInput
              style={[styles.textInput, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.secondary }]}
              placeholder="islam, quran, lecture, reminder"
              placeholderTextColor={colors.mutedForeground}
              value={tags}
              onChangeText={setTags}
            />
          </View>

          {/* Upload progress */}
          {uploading && (
            <View style={[styles.progressCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.progressHeader}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.progressTitle, { color: colors.foreground }]}>
                  Uploading... {progress}%
                </Text>
              </View>
              <View style={[styles.progressTrack, { backgroundColor: colors.secondary }]}>
                <Animated.View
                  style={[styles.progressFill, { backgroundColor: colors.primary }, progressStyle]}
                />
              </View>
            </View>
          )}

          {/* Submit button */}
          <TouchableOpacity
            style={[
              styles.submitBtn,
              {
                backgroundColor: title && !uploading ? colors.primary : colors.secondary,
              },
            ]}
            onPress={handleUpload}
            disabled={!title || uploading}
            activeOpacity={0.85}
          >
            <Feather name="upload-cloud" size={20} color={title && !uploading ? "#fff" : colors.mutedForeground} />
            <Text
              style={[
                styles.submitBtnText,
                { color: title && !uploading ? "#fff" : colors.mutedForeground },
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
  typeRow: {
    flexDirection: "row",
    borderRadius: 10,
    padding: 3,
  },
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
  field: { gap: 6 },
  fieldLabel: { fontSize: 13, fontWeight: "600" },
  textInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
  },
  multilineInput: {
    height: 100,
    paddingTop: 11,
  },
  charCount: { fontSize: 11, textAlign: "right" },
  catRow: { gap: 8 },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  catChipText: { fontSize: 13 },
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
  progressTitle: { fontSize: 14, fontWeight: "600" },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
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
