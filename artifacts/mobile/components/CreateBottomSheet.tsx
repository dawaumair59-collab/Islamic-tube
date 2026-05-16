import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import { Video, Clapperboard, Radio } from "lucide-react-native";

interface CreateBottomSheetProps {
  visible: boolean;
  onClose: () => void;
}

const OPTIONS = [
  {
    icon: <Clapperboard size={24} color="#0F0F0F" />,
    emoji: "📱",
    title: "Short Video",
    subtitle: "Upload a short video (under 60 seconds)",
  },
  {
    icon: <Video size={24} color="#0F0F0F" />,
    emoji: "🎬",
    title: "Long Video",
    subtitle: "Upload a long video in HD quality",
  },
  {
    icon: <Radio size={24} color="#FF0000" />,
    emoji: "🔴",
    title: "Go Live",
    subtitle: "Start a live stream",
  },
];

export default function CreateBottomSheet({
  visible,
  onClose,
}: CreateBottomSheetProps) {
  const slideAnim = React.useRef(new Animated.Value(300)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 280,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 220,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.sheet,
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={styles.handle} />

        <Text style={styles.sheetTitle}>Create</Text>

        {OPTIONS.map((option, index) => (
          <TouchableOpacity
            key={option.title}
            style={[
              styles.option,
              index < OPTIONS.length - 1 && styles.optionBorder,
            ]}
            activeOpacity={0.7}
            onPress={onClose}
          >
            <View style={styles.iconWrap}>{option.icon}</View>
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>{option.title}</Text>
              <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.8}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 16,
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
});
