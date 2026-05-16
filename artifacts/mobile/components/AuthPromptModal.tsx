import { LogIn } from "lucide-react-native";
import { router } from "expo-router";
import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";

interface AuthPromptModalProps {
  visible: boolean;
  onClose: () => void;
  message?: string;
}

export function AuthPromptModal({
  visible,
  onClose,
  message = "Sign in to continue",
}: AuthPromptModalProps) {
  const colors = useColors();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1}>
          <View
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View
              style={[styles.iconWrap, { backgroundColor: colors.accent }]}
            >
              <LogIn size={28} color={colors.primary} strokeWidth={1.8} />
            </View>
            <Text style={[styles.title, { color: colors.foreground }]}>
              Sign in required
            </Text>
            <Text
              style={[styles.message, { color: colors.mutedForeground }]}
            >
              {message}
            </Text>
            <TouchableOpacity
              style={[styles.loginBtn, { backgroundColor: colors.primary }]}
              activeOpacity={0.85}
              onPress={() => {
                onClose();
                router.push("/auth");
              }}
            >
              <Text style={styles.loginBtnText}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text
                style={[
                  styles.cancelText,
                  { color: colors.mutedForeground },
                ]}
              >
                Not now
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 28,
    alignItems: "center",
    gap: 12,
    maxWidth: 340,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  title: { fontSize: 18, fontWeight: "700", textAlign: "center" },
  message: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  loginBtn: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  loginBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  cancelBtn: { paddingVertical: 8 },
  cancelText: { fontSize: 14 },
});
