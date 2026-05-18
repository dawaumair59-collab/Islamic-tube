import {
  AlertTriangle,
  BadgeCheck,
  ChevronLeft,
  Film,
  Shield,
  Trash2,
  UserCheck,
  UserX,
  Users,
  Video,
  X,
} from "lucide-react-native";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { adminApi } from "@/services/api";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

const TABS = ["Dashboard", "Pending", "Scholars", "Users", "Reports"] as const;
type Tab = (typeof TABS)[number];

/* ─── Stat Card ─── */
function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

/* ─── Section Header ─── */
function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {count != null && (
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{count}</Text>
        </View>
      )}
    </View>
  );
}

/* ─── Action Button ─── */
function ActionBtn({
  label,
  color,
  onPress,
  disabled,
}: {
  label: string;
  color: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.actionBtn, { backgroundColor: color, opacity: disabled ? 0.5 : 1 }]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.75}
    >
      <Text style={styles.actionBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function AdminScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("Dashboard");

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  // Redirect non-admins
  useEffect(() => {
    if (user && user.role !== "admin") router.back();
    if (!user) router.back();
  }, [user]);

  // Data state
  const [stats, setStats] = useState<any>(null);
  const [pendingVideos, setPendingVideos] = useState<any[]>([]);
  const [scholars, setScholars] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Rejection reason modal
  const [rejectModal, setRejectModal] = useState<{
    visible: boolean;
    videoId: number | null;
  }>({ visible: false, videoId: null });
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [s, pv, sc, u, r] = await Promise.allSettled([
        adminApi.stats(),
        adminApi.pendingVideos(),
        adminApi.listScholarsPending(),
        adminApi.listUsers(),
        adminApi.listReports(),
      ]);
      if (s.status === "fulfilled") setStats(s.value);
      if (pv.status === "fulfilled") setPendingVideos(pv.value);
      if (sc.status === "fulfilled") setScholars(sc.value);
      if (u.status === "fulfilled") setUsers(u.value);
      if (r.status === "fulfilled") setReports(r.value);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  };

  /* ─── Actions ─── */
  const approveVideo = async (id: number) => {
    setActionLoading(`approve-${id}`);
    try {
      await adminApi.approveVideo(id);
      setPendingVideos((prev) => prev.filter((v) => v.id !== id));
      setStats((s: any) => s ? { ...s, pending_videos: s.pending_videos - 1, approved_videos: s.approved_videos + 1 } : s);
    } catch {
      Alert.alert("Error", "Could not approve video.");
    } finally {
      setActionLoading(null);
    }
  };

  const rejectVideo = async () => {
    if (!rejectModal.videoId) return;
    setActionLoading(`reject-${rejectModal.videoId}`);
    try {
      await adminApi.rejectVideo(rejectModal.videoId, rejectReason);
      setPendingVideos((prev) => prev.filter((v) => v.id !== rejectModal.videoId));
      setRejectModal({ visible: false, videoId: null });
      setRejectReason("");
    } catch {
      Alert.alert("Error", "Could not reject video.");
    } finally {
      setActionLoading(null);
    }
  };

  const verifyScholar = async (id: number) => {
    setActionLoading(`verify-${id}`);
    try {
      await adminApi.verifyScholar(id);
      setScholars((prev) => prev.filter((s) => s.id !== id));
      setStats((st: any) => st ? { ...st, pending_scholars: st.pending_scholars - 1 } : st);
    } catch {
      Alert.alert("Error", "Could not verify scholar.");
    } finally {
      setActionLoading(null);
    }
  };

  const rejectScholar = async (id: number, name: string) => {
    Alert.alert("Reject Scholar", `Remove ${name}'s scholar profile?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reject",
        style: "destructive",
        onPress: async () => {
          setActionLoading(`reject-scholar-${id}`);
          try {
            await adminApi.rejectScholar(id);
            setScholars((prev) => prev.filter((s) => s.id !== id));
          } catch {
            Alert.alert("Error", "Could not reject scholar.");
          } finally {
            setActionLoading(null);
          }
        },
      },
    ]);
  };

  const banUser = async (id: number, name: string, isActive: boolean) => {
    const action = isActive ? "ban" : "unban";
    Alert.alert(`${action.charAt(0).toUpperCase() + action.slice(1)} User`, `${action} ${name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: action.charAt(0).toUpperCase() + action.slice(1),
        style: isActive ? "destructive" : "default",
        onPress: async () => {
          setActionLoading(`ban-${id}`);
          try {
            const newActive = await adminApi.banUser(id);
            setUsers((prev) =>
              prev.map((u) => (u.id === id ? { ...u, is_active: newActive } : u))
            );
          } catch {
            Alert.alert("Error", "Could not update user.");
          } finally {
            setActionLoading(null);
          }
        },
      },
    ]);
  };

  const removeVideo = async (videoId: number, title: string) => {
    Alert.alert("Remove Video", `Permanently remove "${title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          setActionLoading(`remove-${videoId}`);
          try {
            await adminApi.removeVideo(videoId);
            setReports((prev) => prev.filter((r) => r.video_id !== videoId));
          } catch {
            Alert.alert("Error", "Could not remove video.");
          } finally {
            setActionLoading(null);
          }
        },
      },
    ]);
  };

  /* ─── Tab content ─── */
  const renderDashboard = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.tabContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />}
    >
      {loading && !stats ? (
        <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
      ) : stats ? (
        <>
          <SectionHeader title="Overview" />
          <View style={styles.statsGrid}>
            <StatCard label="Total Videos"   value={stats.total_videos}    color="#2563EB" />
            <StatCard label="Total Users"    value={stats.total_users}     color="#10B981" />
            <StatCard label="Scholars"       value={stats.total_scholars}  color="#8B5CF6" />
            <StatCard label="Pending Review" value={stats.pending_videos}  color="#F59E0B" />
            <StatCard label="Approved"       value={stats.approved_videos} color="#10B981" />
            <StatCard label="Rejected"       value={stats.rejected_videos} color="#EF4444" />
            <StatCard label="Unverified Scholars" value={stats.pending_scholars} color="#F59E0B" />
            <StatCard label="Reports"        value={stats.total_reports}   color="#EF4444" />
          </View>

          <SectionHeader title="Quick Actions" />
          <View style={styles.quickActions}>
            {(["Pending", "Scholars", "Users", "Reports"] as Tab[]).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={styles.quickBtn}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.75}
              >
                <Text style={styles.quickBtnText}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      ) : null}
    </ScrollView>
  );

  const renderPendingVideos = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.tabContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />}
    >
      <SectionHeader title="Pending Videos" count={pendingVideos.length} />
      {loading && pendingVideos.length === 0 ? (
        <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
      ) : pendingVideos.length === 0 ? (
        <Text style={styles.emptyText}>No pending videos</Text>
      ) : (
        pendingVideos.map((v) => (
          <View key={v.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Film size={16} color="#2563EB" strokeWidth={2} />
              <Text style={styles.cardTitle} numberOfLines={2}>{v.title}</Text>
            </View>
            <View style={styles.cardMeta}>
              <Text style={styles.metaText}>Scholar: {v.scholar?.full_name ?? v.scholar_name ?? "—"}</Text>
              <Text style={styles.metaText}>Category: {v.category}</Text>
              <Text style={styles.metaText}>Type: {v.video_type}</Text>
            </View>
            {v.video_url && (
              <Text style={styles.urlText} numberOfLines={1}>{v.video_url}</Text>
            )}
            <View style={styles.cardActions}>
              <ActionBtn
                label="Approve"
                color="#10B981"
                disabled={actionLoading === `approve-${v.id}`}
                onPress={() => approveVideo(v.id)}
              />
              <ActionBtn
                label="Reject"
                color="#EF4444"
                disabled={!!actionLoading}
                onPress={() => {
                  setRejectModal({ visible: true, videoId: v.id });
                  setRejectReason("");
                }}
              />
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );

  const renderScholars = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.tabContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />}
    >
      <SectionHeader title="Pending Scholar Verification" count={scholars.length} />
      {loading && scholars.length === 0 ? (
        <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
      ) : scholars.length === 0 ? (
        <Text style={styles.emptyText}>No scholars awaiting verification</Text>
      ) : (
        scholars.map((s) => (
          <View key={s.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <UserCheck size={16} color="#8B5CF6" strokeWidth={2} />
              <Text style={styles.cardTitle}>{s.full_name}</Text>
            </View>
            <View style={styles.cardMeta}>
              <Text style={styles.metaText}>Email: {s.email}</Text>
              <Text style={styles.metaText}>Expertise: {s.expertise}</Text>
              {s.institution ? <Text style={styles.metaText}>Institution: {s.institution}</Text> : null}
              {s.qualifications ? (
                <Text style={styles.metaText} numberOfLines={2}>
                  Qualifications: {s.qualifications}
                </Text>
              ) : null}
            </View>
            <View style={styles.cardActions}>
              <ActionBtn
                label="Verify"
                color="#10B981"
                disabled={actionLoading === `verify-${s.id}`}
                onPress={() => verifyScholar(s.id)}
              />
              <ActionBtn
                label="Reject"
                color="#EF4444"
                disabled={!!actionLoading}
                onPress={() => rejectScholar(s.id, s.full_name)}
              />
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );

  const renderUsers = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.tabContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />}
    >
      <SectionHeader title="All Users" count={users.length} />
      {loading && users.length === 0 ? (
        <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
      ) : users.length === 0 ? (
        <Text style={styles.emptyText}>No users found</Text>
      ) : (
        users.map((u) => (
          <View key={u.id} style={[styles.card, !u.is_active && styles.cardBanned]}>
            <View style={styles.cardHeader}>
              <Users size={16} color={u.is_active ? "#0F0F0F" : "#9CA3AF"} strokeWidth={2} />
              <Text style={[styles.cardTitle, !u.is_active && { color: "#9CA3AF" }]}>
                {u.full_name}
                {!u.is_active && "  [BANNED]"}
              </Text>
            </View>
            <View style={styles.cardMeta}>
              <Text style={styles.metaText}>@{u.username}</Text>
              <Text style={styles.metaText}>{u.email}</Text>
              {u.is_scholar && (
                <Text style={[styles.metaText, { color: "#8B5CF6" }]}>Scholar</Text>
              )}
            </View>
            <View style={styles.cardActions}>
              <ActionBtn
                label={u.is_active ? "Ban User" : "Unban User"}
                color={u.is_active ? "#EF4444" : "#10B981"}
                disabled={actionLoading === `ban-${u.id}`}
                onPress={() => banUser(u.id, u.full_name, u.is_active)}
              />
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );

  const renderReports = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.tabContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />}
    >
      <SectionHeader title="Reported Content" count={reports.length} />
      {loading && reports.length === 0 ? (
        <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
      ) : reports.length === 0 ? (
        <Text style={styles.emptyText}>No reports</Text>
      ) : (
        reports.map((r) => (
          <View key={r.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <AlertTriangle size={16} color="#F59E0B" strokeWidth={2} />
              <Text style={styles.cardTitle} numberOfLines={2}>{r.video_title}</Text>
            </View>
            <View style={styles.cardMeta}>
              <Text style={styles.metaText}>Scholar: {r.video_scholar}</Text>
              <Text style={styles.metaText}>Reported by: @{r.reporter}</Text>
              <Text style={styles.metaText}>Reason: {r.reason}</Text>
              {r.description ? (
                <Text style={styles.metaText} numberOfLines={2}>Note: {r.description}</Text>
              ) : null}
            </View>
            <View style={styles.cardActions}>
              <ActionBtn
                label="Remove Video"
                color="#EF4444"
                disabled={actionLoading === `remove-${r.video_id}`}
                onPress={() => removeVideo(r.video_id, r.video_title)}
              />
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );

  return (
    <View style={[styles.screen, { backgroundColor: "#F9FAFB" }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#0F0F0F" strokeWidth={2} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Shield size={18} color="#2563EB" strokeWidth={2} />
          <Text style={styles.headerTitle}>Admin Panel</Text>
        </View>
        <Text style={styles.adminBadge}>ADMIN</Text>
      </View>

      {/* Tab Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabBar}
        contentContainerStyle={styles.tabBarContent}
      >
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
              {tab === "Pending" && stats?.pending_videos > 0 && ` (${stats.pending_videos})`}
              {tab === "Scholars" && stats?.pending_scholars > 0 && ` (${stats.pending_scholars})`}
              {tab === "Reports" && stats?.total_reports > 0 && ` (${stats.total_reports})`}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      {activeTab === "Dashboard" && renderDashboard()}
      {activeTab === "Pending"   && renderPendingVideos()}
      {activeTab === "Scholars"  && renderScholars()}
      {activeTab === "Users"     && renderUsers()}
      {activeTab === "Reports"   && renderReports()}

      {/* Reject Reason Modal */}
      <Modal
        visible={rejectModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setRejectModal({ visible: false, videoId: null })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reject Video</Text>
              <TouchableOpacity onPress={() => setRejectModal({ visible: false, videoId: null })}>
                <X size={20} color="#6B7280" strokeWidth={2} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalLabel}>Rejection reason (optional)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Contains inappropriate content..."
              placeholderTextColor="#9CA3AF"
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setRejectModal({ visible: false, videoId: null })}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalReject}
                onPress={rejectVideo}
                disabled={!!actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalRejectText}>Reject</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:           { flex: 1 },
  header:           { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12, backgroundColor: "#fff", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E5E7EB" },
  backBtn:          { padding: 4 },
  headerCenter:     { flex: 1, flexDirection: "row", alignItems: "center", gap: 6, marginLeft: 8 },
  headerTitle:      { fontSize: 17, fontWeight: "700", color: "#0F0F0F" },
  adminBadge:       { fontSize: 10, fontWeight: "700", color: "#2563EB", backgroundColor: "#EEF2FF", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  tabBar:           { backgroundColor: "#fff", maxHeight: 44, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E5E7EB" },
  tabBarContent:    { paddingHorizontal: 12, gap: 4 },
  tab:              { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 6 },
  tabActive:        { backgroundColor: "#EEF2FF" },
  tabText:          { fontSize: 13, color: "#6B7280", fontWeight: "500" },
  tabTextActive:    { color: "#2563EB", fontWeight: "700" },
  tabContent:       { padding: 16, paddingBottom: 40 },
  sectionHeader:    { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12, marginTop: 4 },
  sectionTitle:     { fontSize: 14, fontWeight: "700", color: "#374151", textTransform: "uppercase", letterSpacing: 0.5 },
  countBadge:       { backgroundColor: "#2563EB", borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
  countBadgeText:   { color: "#fff", fontSize: 11, fontWeight: "700" },
  statsGrid:        { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 },
  statCard:         { flex: 1, minWidth: "44%", backgroundColor: "#fff", borderRadius: 10, padding: 14, borderLeftWidth: 3, elevation: 2 },
  statValue:        { fontSize: 26, fontWeight: "800", marginBottom: 2 },
  statLabel:        { fontSize: 12, color: "#6B7280", fontWeight: "500" },
  quickActions:     { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  quickBtn:         { flex: 1, minWidth: "44%", backgroundColor: "#fff", borderRadius: 10, paddingVertical: 14, alignItems: "center", borderWidth: 1, borderColor: "#E5E7EB" },
  quickBtnText:     { fontSize: 13, fontWeight: "600", color: "#374151" },
  card:             { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 12, elevation: 2 },
  cardBanned:       { opacity: 0.7, borderWidth: 1, borderColor: "#FCA5A5" },
  cardHeader:       { flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 8 },
  cardTitle:        { flex: 1, fontSize: 14, fontWeight: "700", color: "#0F0F0F", lineHeight: 20 },
  cardMeta:         { gap: 3, marginBottom: 12 },
  metaText:         { fontSize: 12, color: "#6B7280", lineHeight: 17 },
  urlText:          { fontSize: 11, color: "#9CA3AF", marginBottom: 8, fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace" },
  cardActions:      { flexDirection: "row", gap: 8 },
  actionBtn:        { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: "center" },
  actionBtnText:    { color: "#fff", fontSize: 13, fontWeight: "700" },
  emptyText:        { textAlign: "center", color: "#9CA3AF", marginTop: 40, fontSize: 14 },
  modalOverlay:     { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", paddingHorizontal: 24 },
  modalCard:        { backgroundColor: "#fff", borderRadius: 16, padding: 20, gap: 12 },
  modalHeader:      { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  modalTitle:       { fontSize: 16, fontWeight: "700", color: "#0F0F0F" },
  modalLabel:       { fontSize: 13, color: "#374151", fontWeight: "500" },
  modalInput:       { borderWidth: 1, borderColor: "#D1D5DB", borderRadius: 8, padding: 10, fontSize: 14, color: "#0F0F0F", minHeight: 72 },
  modalActions:     { flexDirection: "row", gap: 10, marginTop: 4 },
  modalCancel:      { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: "#F3F4F6", alignItems: "center" },
  modalCancelText:  { fontSize: 14, fontWeight: "600", color: "#374151" },
  modalReject:      { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: "#EF4444", alignItems: "center" },
  modalRejectText:  { fontSize: 14, fontWeight: "700", color: "#fff" },
});
