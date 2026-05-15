import {
  AlertCircle,
  ChevronLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Moon,
  User,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

type AuthMode = "login" | "register" | "forgot";

export default function AuthScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login, register } = useAuth();

  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleSubmit = async () => {
    if (!email || !password) { setError("Please fill in all fields"); return; }
    setError("");
    setLoading(true);
    try {
      if (mode === "login") { await login(email, password); }
      else if (mode === "register") { await register(name, email, password); }
      router.back();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primary, "#1D4ED8", colors.background]}
        style={[styles.topGradient, { paddingTop: topPad }]}
        locations={[0, 0.4, 1]}
      />

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: 40 + bottomPad }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity style={[styles.closeBtn, { marginTop: topPad + 8 }]} onPress={() => router.back()}>
            <ChevronLeft size={24} color="#fff" strokeWidth={2} />
          </TouchableOpacity>

          <View style={styles.logoSection}>
            <View style={[styles.logoMark, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
              <Moon size={32} color="#fff" fill="#fff" strokeWidth={0} />
            </View>
            <Text style={styles.logoText}>IslamicTube</Text>
            <Text style={styles.logoSub}>
              {mode === "login" ? "Welcome back" : mode === "register" ? "Join the community" : "Reset your password"}
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
            {mode !== "forgot" && (
              <View style={[styles.modeTabs, { backgroundColor: colors.secondary }]}>
                <TouchableOpacity
                  style={[styles.modeTab, mode === "login" && { backgroundColor: colors.background }]}
                  onPress={() => setMode("login")}
                >
                  <Text style={[styles.modeTabText, { color: mode === "login" ? colors.primary : colors.mutedForeground, fontWeight: mode === "login" ? "700" : "400" }]}>Sign In</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modeTab, mode === "register" && { backgroundColor: colors.background }]}
                  onPress={() => setMode("register")}
                >
                  <Text style={[styles.modeTabText, { color: mode === "register" ? colors.primary : colors.mutedForeground, fontWeight: mode === "register" ? "700" : "400" }]}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            )}

            {error.length > 0 && (
              <View style={[styles.errorBox, { backgroundColor: "#FEF2F2", borderColor: "#FECACA" }]}>
                <AlertCircle size={16} color="#EF4444" strokeWidth={2} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {mode === "register" && (
              <View>
                <Text style={[styles.label, { color: colors.foreground }]}>Full Name</Text>
                <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.secondary }]}>
                  <User size={18} color={colors.mutedForeground} strokeWidth={1.8} />
                  <TextInput
                    style={[styles.input, { color: colors.foreground }]}
                    placeholder="Ahmed Al-Farsi"
                    placeholderTextColor={colors.mutedForeground}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
              </View>
            )}

            <View>
              <Text style={[styles.label, { color: colors.foreground }]}>Email</Text>
              <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.secondary }]}>
                <Mail size={18} color={colors.mutedForeground} strokeWidth={1.8} />
                <TextInput
                  style={[styles.input, { color: colors.foreground }]}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.mutedForeground}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {mode !== "forgot" && (
              <View>
                <Text style={[styles.label, { color: colors.foreground }]}>Password</Text>
                <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.secondary }]}>
                  <Lock size={18} color={colors.mutedForeground} strokeWidth={1.8} />
                  <TextInput
                    style={[styles.input, { color: colors.foreground }]}
                    placeholder="••••••••"
                    placeholderTextColor={colors.mutedForeground}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity onPress={() => setShowPassword((s) => !s)}>
                    {showPassword ? (
                      <EyeOff size={18} color={colors.mutedForeground} strokeWidth={1.8} />
                    ) : (
                      <Eye size={18} color={colors.mutedForeground} strokeWidth={1.8} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {mode === "login" && (
              <TouchableOpacity onPress={() => setMode("forgot")} style={styles.forgotRow}>
                <Text style={[styles.forgotText, { color: colors.primary }]}>Forgot password?</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: colors.primary }]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitBtnText}>
                  {mode === "login" ? "Sign In" : mode === "register" ? "Create Account" : "Send Reset Link"}
                </Text>
              )}
            </TouchableOpacity>

            {mode !== "forgot" && (
              <>
                <View style={styles.divider}>
                  <View style={[styles.line, { backgroundColor: colors.border }]} />
                  <Text style={[styles.dividerText, { color: colors.mutedForeground }]}>or</Text>
                  <View style={[styles.line, { backgroundColor: colors.border }]} />
                </View>
                <TouchableOpacity style={[styles.socialBtn, { borderColor: colors.border, backgroundColor: colors.secondary }]} activeOpacity={0.8}>
                  <View style={styles.googleG}>
                    <Text style={styles.googleGText}>G</Text>
                  </View>
                  <Text style={[styles.socialBtnText, { color: colors.foreground }]}>Continue with Google</Text>
                </TouchableOpacity>
              </>
            )}

            {mode === "forgot" && (
              <TouchableOpacity onPress={() => setMode("login")}>
                <Text style={[styles.backToLogin, { color: colors.primary }]}>Back to Sign In</Text>
              </TouchableOpacity>
            )}
          </View>

          {mode === "register" && (
            <Text style={[styles.terms, { color: colors.mutedForeground }]}>
              By signing up, you agree to our Terms of Service and Privacy Policy
            </Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flex: { flex: 1 },
  topGradient: { position: "absolute", top: 0, left: 0, right: 0, height: 320 },
  scroll: { paddingHorizontal: 20, gap: 0 },
  closeBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  logoSection: { alignItems: "center", paddingTop: 16, paddingBottom: 28, gap: 8 },
  logoMark: { width: 72, height: 72, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  logoText: { color: "#fff", fontSize: 26, fontWeight: "800", letterSpacing: -0.5 },
  logoSub: { color: "rgba(255,255,255,0.85)", fontSize: 15 },
  card: { borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, padding: 20, gap: 14 },
  modeTabs: { flexDirection: "row", borderRadius: 10, padding: 3 },
  modeTab: { flex: 1, alignItems: "center", paddingVertical: 8, borderRadius: 8 },
  modeTabText: { fontSize: 14 },
  errorBox: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 8, borderWidth: 1, padding: 10 },
  errorText: { color: "#EF4444", fontSize: 13, flex: 1 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  inputWrapper: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, gap: 10 },
  input: { flex: 1, fontSize: 15, padding: 0 },
  forgotRow: { alignItems: "flex-end" },
  forgotText: { fontSize: 13, fontWeight: "500" },
  submitBtn: { paddingVertical: 15, borderRadius: 12, alignItems: "center" },
  submitBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  divider: { flexDirection: "row", alignItems: "center", gap: 10 },
  line: { flex: 1, height: StyleSheet.hairlineWidth },
  dividerText: { fontSize: 13 },
  socialBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderWidth: 1, borderRadius: 12, paddingVertical: 13 },
  socialBtnText: { fontSize: 15, fontWeight: "600" },
  googleG: { width: 20, height: 20, borderRadius: 10, backgroundColor: "#EA4335", alignItems: "center", justifyContent: "center" },
  googleGText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  backToLogin: { textAlign: "center", fontSize: 14, fontWeight: "600", paddingVertical: 4 },
  terms: { fontSize: 11, textAlign: "center", paddingTop: 12, lineHeight: 16 },
});
