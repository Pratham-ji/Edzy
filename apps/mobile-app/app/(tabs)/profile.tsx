import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
  Modal,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  User,
  School,
  Clock,
  Shield,
  FileText,
  LogOut,
  ChevronRight,
  Flame,
  BookOpen,
  Award,
  Sparkles,
  Sun,
  Moon,
  Cloud,
  RefreshCw,
  Eye,
  EyeOff,
  X,
  ExternalLink,
  Lock,
  CheckCircle2,
} from 'lucide-react-native';
import { useEdzyStore } from '@/store/useEdzyStore';
import { lightTheme, darkTheme } from '@/theme/colors';

const TIME_LIMIT_OPTIONS = [15, 30, 45, 60, 90];

export default function ProfileScreen() {
  const router = useRouter();
  const {
    studentProfile,
    sessionTimeLimitMinutes,
    setTimeLimitMinutes,
    isTimeLimitActive,
    toggleTimeLimitActive,
    themeMode,
    toggleThemeMode,
    connectionMode,
    initializeMobileSync,
    logout,
  } = useEdzyStore();

  const [isSyncing, setIsSyncing] = React.useState(false);
  const [showPin, setShowPin] = React.useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = React.useState(false);
  const [showAboutModal, setShowAboutModal] = React.useState(false);

  const isDark = themeMode === 'dark';
  const activeTheme = isDark ? darkTheme : lightTheme;

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await initializeMobileSync(studentProfile.id);
      Alert.alert('Cloud Synced', 'Student profile, fee ledger, and marks synced with Supabase Realtime.');
    } catch {
      Alert.alert('Offline Mode', 'Operating in local demo mode.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of Edzy?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: activeTheme.background }]}>
      <View style={[styles.header, { backgroundColor: activeTheme.surface, borderBottomColor: activeTheme.surfaceBorder }]}>
        <Text style={[styles.headerTitle, { color: activeTheme.text.ink }]}>Account & Profile</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 144 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── 1. STUDENT ID CARD ─── */}
        <View style={[styles.card, { backgroundColor: activeTheme.surface, borderColor: activeTheme.surfaceBorder }]}>
          <View style={styles.idCardTopRow}>
            <View style={[styles.avatarLarge, { backgroundColor: activeTheme.brand.primary }]}>
              <Text style={styles.avatarLargeText}>
                {studentProfile.name[0]}
              </Text>
            </View>
            <View style={styles.idCardInfo}>
              <View style={styles.nameBadgeRow}>
                <Text style={[styles.studentName, { color: activeTheme.text.ink }]}>{studentProfile.name}</Text>
                <View style={[styles.activePill, { backgroundColor: isDark ? 'rgba(52, 211, 153, 0.16)' : '#ECFDF5' }]}>
                  <Text style={[styles.activePillText, { color: activeTheme.status.success }]}>Active 26-27</Text>
                </View>
              </View>
              <Text style={[styles.studentIdText, { color: activeTheme.brand.primary }]}>ID: {studentProfile.id}</Text>
              <Text style={[styles.classRollText, { color: activeTheme.text.secondary }]}>
                {studentProfile.classGrade} • Roll #{studentProfile.rollNo}
              </Text>
            </View>
          </View>

          <View style={[styles.idCardDetailsGrid, { backgroundColor: isDark ? '#1C222C' : '#F8FAFC' }]}>
            <View style={styles.detailBox}>
              <Text style={styles.detailBoxLabel}>AFFILIATED SCHOOL</Text>
              <Text style={[styles.detailBoxValue, { color: activeTheme.text.ink }]} numberOfLines={1}>
                {studentProfile.schoolName} ({studentProfile.schoolCode})
              </Text>
            </View>
            <View style={styles.detailBox}>
              <Text style={styles.detailBoxLabel}>REGISTERED PARENT</Text>
              <Text style={[styles.detailBoxValue, { color: activeTheme.text.ink }]}>
                {studentProfile.parentName}
              </Text>
            </View>
            <View style={styles.detailBox}>
              <Text style={styles.detailBoxLabel}>PARENT FEE PIN (TAP TO VIEW)</Text>
              <TouchableOpacity
                onPress={() => setShowPin(!showPin)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.detailBoxValue,
                    {
                      color: activeTheme.brand.primary,
                      letterSpacing: showPin ? 2 : 3,
                      fontWeight: '700',
                    },
                  ]}
                >
                  {showPin ? (studentProfile.parentPin || '1234') : '••••'}
                </Text>
                {showPin ? (
                  <EyeOff size={14} color={activeTheme.brand.primary} />
                ) : (
                  <Eye size={14} color={activeTheme.text.secondary} />
                )}
              </TouchableOpacity>
            </View>
            <View style={styles.detailBox}>
              <Text style={styles.detailBoxLabel}>CAMPUS ATTENDANCE</Text>
              <Text style={[styles.detailBoxValue, { color: activeTheme.status.success, fontWeight: '700' }]}>
                {(studentProfile.attendancePct ?? 96.8)}%
              </Text>
            </View>
          </View>

          {/* Engagement Mini Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <View style={[styles.statIconBadgeOrange, { backgroundColor: isDark ? 'rgba(251, 146, 60, 0.16)' : '#FFF7ED' }]}>
                <Flame size={14} color={activeTheme.streak.primary} />
              </View>
              <Text style={[styles.statNumber, { color: activeTheme.text.ink }]}>{studentProfile.streakDays} Days</Text>
              <Text style={[styles.statLabel, { color: activeTheme.text.secondary }]}>Study Streak</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: activeTheme.divider }]} />
            <View style={styles.statCol}>
              <View style={[styles.statIconBadgeIndigo, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.16)' : '#EEF2FF' }]}>
                <BookOpen size={14} color={activeTheme.brand.primary} />
              </View>
              <Text style={[styles.statNumber, { color: activeTheme.text.ink }]}>{studentProfile.weeklyStudyHours}h</Text>
              <Text style={[styles.statLabel, { color: activeTheme.text.secondary }]}>Weekly Study</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: activeTheme.divider }]} />
            <View style={styles.statCol}>
              <View style={[styles.statIconBadgeGreen, { backgroundColor: isDark ? 'rgba(52, 211, 153, 0.16)' : '#ECFDF5' }]}>
                <Award size={14} color={activeTheme.status.success} />
              </View>
              <Text style={[styles.statNumber, { color: activeTheme.text.ink }]}>CBSE</Text>
              <Text style={[styles.statLabel, { color: activeTheme.text.secondary }]}>Board Curr.</Text>
            </View>
          </View>
        </View>

        {/* ─── 2. PARENTAL SCREEN TIME LIMIT SELECTOR ─── */}
        <View style={[styles.card, { backgroundColor: activeTheme.surface, borderColor: activeTheme.surfaceBorder }]}>
          <View style={styles.settingHeaderRow}>
            <View style={[styles.settingIconCircle, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.16)' : '#EEF2FF' }]}>
              <Clock size={18} color={activeTheme.brand.primary} />
            </View>
            <View style={styles.settingHeaderText}>
              <Text style={[styles.settingTitle, { color: activeTheme.text.ink }]}>Parental Focus Time Limit</Text>
              <Text style={[styles.settingSubtitle, { color: activeTheme.text.secondary }]}>
                Pause study app automatically to prevent digital screen fatigue
              </Text>
            </View>
            <Switch
              value={isTimeLimitActive}
              onValueChange={toggleTimeLimitActive}
              trackColor={{ false: activeTheme.surfaceBorder, true: activeTheme.brand.primary }}
              thumbColor={'#FFFFFF'}
            />
          </View>

          {isTimeLimitActive && (
            <View style={styles.timeLimitButtonsRow}>
              {TIME_LIMIT_OPTIONS.map((mins) => {
                const isSelected = sessionTimeLimitMinutes === mins;
                return (
                  <TouchableOpacity
                    key={mins}
                    style={[
                      styles.timeOptionButton,
                      {
                        backgroundColor: isSelected
                          ? activeTheme.brand.primary
                          : isDark
                          ? '#1C222C'
                          : '#F8FAFC',
                        borderColor: isSelected
                          ? activeTheme.brand.primary
                          : activeTheme.surfaceBorder,
                      },
                    ]}
                    onPress={() => setTimeLimitMinutes(mins)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.timeOptionText,
                        {
                          color: isSelected
                            ? '#FFFFFF'
                            : activeTheme.text.secondary,
                          fontWeight: isSelected ? '700' : '600',
                        },
                      ]}
                    >
                      {mins}m
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* ─── 3. APPEARANCE (LIGHT / DARK THEME TOGGLE) ─── */}
        <View style={[styles.card, { backgroundColor: activeTheme.surface, borderColor: activeTheme.surfaceBorder }]}>
          <View style={styles.settingHeaderRow}>
            <View style={[styles.settingIconCircle, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.2)' : '#EEF2FF' }]}>
              {isDark ? (
                <Moon size={18} color={activeTheme.brand.primary} />
              ) : (
                <Sun size={18} color={activeTheme.brand.primary} />
              )}
            </View>
            <View style={styles.settingHeaderText}>
              <Text style={[styles.settingTitle, { color: activeTheme.text.ink }]}>
                Appearance ({themeMode === 'dark' ? 'Dark Mode' : 'Light Mode'})
              </Text>
              <Text style={[styles.settingSubtitle, { color: activeTheme.text.secondary }]}>
                {isDark ? 'Linear obsidian dark surface for night study' : 'Clean Airbnb off-white surface (Default)'}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleThemeMode}
              trackColor={{ false: activeTheme.surfaceBorder, true: activeTheme.brand.primary }}
              thumbColor={'#FFFFFF'}
            />
          </View>
        </View>

        {/* ─── 4. CLOUD REALTIME SYNC STATUS ─── */}
        <View style={[styles.card, { backgroundColor: activeTheme.surface, borderColor: activeTheme.surfaceBorder }]}>
          <View style={styles.settingHeaderRow}>
            <View
              style={[
                styles.settingIconCircle,
                {
                  backgroundColor:
                    connectionMode === 'LIVE_CLOUD'
                      ? isDark
                        ? 'rgba(52, 211, 153, 0.16)'
                        : '#ECFDF5'
                      : isDark
                      ? 'rgba(251, 146, 60, 0.16)'
                      : '#FFF7ED',
                },
              ]}
            >
              <Cloud
                size={18}
                color={
                  connectionMode === 'LIVE_CLOUD'
                    ? activeTheme.status.success
                    : activeTheme.streak.primary
                }
              />
            </View>
            <View style={styles.settingHeaderText}>
              <View style={styles.cloudBadgeRow}>
                <Text style={[styles.settingTitle, { color: activeTheme.text.ink }]}>Cloud Engine</Text>
                <View
                  style={[
                    styles.syncStatusBadge,
                    {
                      backgroundColor:
                        connectionMode === 'LIVE_CLOUD'
                          ? isDark
                            ? 'rgba(52, 211, 153, 0.16)'
                            : '#ECFDF5'
                          : isDark
                          ? 'rgba(251, 146, 60, 0.16)'
                          : '#FFF7ED',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.syncStatusText,
                      {
                        color:
                          connectionMode === 'LIVE_CLOUD'
                            ? activeTheme.status.success
                            : activeTheme.streak.primary,
                      },
                    ]}
                  >
                    {connectionMode === 'LIVE_CLOUD' ? 'Live Synced' : 'Offline Mode'}
                  </Text>
                </View>
              </View>
              <Text style={[styles.settingSubtitle, { color: activeTheme.text.secondary }]}>
                {connectionMode === 'LIVE_CLOUD'
                  ? 'Realtime channel active • Subscribed to DVPS01 ledger'
                  : 'Operating in local offline demo fallback'}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.syncNowButton,
                {
                  backgroundColor: activeTheme.brand.primary,
                  opacity: isSyncing ? 0.6 : 1,
                },
              ]}
              onPress={handleManualSync}
              disabled={isSyncing}
              activeOpacity={0.8}
            >
              <RefreshCw size={12} color="#FFFFFF" />
              <Text style={styles.syncNowButtonText}>
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── 5. POLICIES & INFO ─── */}
        <View style={[styles.card, { backgroundColor: activeTheme.surface, borderColor: activeTheme.surfaceBorder }]}>
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => setShowPrivacyModal(true)}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: isDark ? '#1C222C' : '#F8FAFC' }]}>
              <Shield size={16} color={activeTheme.text.secondary} />
            </View>
            <Text style={[styles.menuRowTitle, { color: activeTheme.text.ink }]}>Privacy Policy & Data Security</Text>
            <ChevronRight size={16} color={activeTheme.text.muted} />
          </TouchableOpacity>

          <View style={[styles.menuDivider, { backgroundColor: activeTheme.divider }]} />

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => setShowAboutModal(true)}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: isDark ? '#1C222C' : '#F8FAFC' }]}>
              <FileText size={16} color={activeTheme.text.secondary} />
            </View>
            <Text style={[styles.menuRowTitle, { color: activeTheme.text.ink }]}>About Edzy Indian School OS</Text>
            <ChevronRight size={16} color={activeTheme.text.muted} />
          </TouchableOpacity>
        </View>

        {/* ─── 5. LOGOUT BUTTON ─── */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.12)' : '#FEF2F2', borderColor: isDark ? 'rgba(239, 68, 68, 0.28)' : '#FECACA' }]}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <LogOut size={16} color={activeTheme.status.error} />
          <Text style={[styles.logoutButtonText, { color: activeTheme.status.error }]}>Sign Out of School Account</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ─── PRIVACY POLICY MODAL ─── */}
      <Modal
        visible={showPrivacyModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPrivacyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: activeTheme.surface, borderColor: activeTheme.surfaceBorder }]}>
            <View style={styles.modalHeaderRow}>
              <View style={styles.modalHeaderBadgeTitle}>
                <View style={[styles.modalIconBadge, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.2)' : '#EEF2FF' }]}>
                  <Shield size={20} color={activeTheme.brand.primary} />
                </View>
                <View>
                  <Text style={[styles.modalTitle, { color: activeTheme.text.ink }]}>Privacy & Data Security</Text>
                  <Text style={[styles.modalSubtitle, { color: activeTheme.text.secondary }]}>India DPDP Act 2023 Compliant</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setShowPrivacyModal(false)}
                style={[styles.modalCloseBtn, { backgroundColor: isDark ? '#1E2530' : '#F1F5F9' }]}
                activeOpacity={0.7}
              >
                <X size={18} color={activeTheme.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
              <View style={[styles.policyCard, { backgroundColor: isDark ? '#161B22' : '#F8FAFC', borderColor: activeTheme.surfaceBorder }]}>
                <View style={styles.policyCardHeader}>
                  <CheckCircle2 size={16} color={activeTheme.status.success} />
                  <Text style={[styles.policyCardTitle, { color: activeTheme.text.ink }]}>Zero-Storage Camera / AR Policy</Text>
                </View>
                <Text style={[styles.policyCardBody, { color: activeTheme.text.secondary }]}>
                  Device camera permissions are strictly executed in-memory to project real-time 3D spatial models. Edzy NEVER records, stores, or transmits student faces, home backgrounds, or classroom video streams to any cloud server.
                </Text>
              </View>

              <View style={[styles.policyCard, { backgroundColor: isDark ? '#161B22' : '#F8FAFC', borderColor: activeTheme.surfaceBorder }]}>
                <View style={styles.policyCardHeader}>
                  <Lock size={16} color={activeTheme.brand.primary} />
                  <Text style={[styles.policyCardTitle, { color: activeTheme.text.ink }]}>Bank-Grade UPI & Fee Safety</Text>
                </View>
                <Text style={[styles.policyCardBody, { color: activeTheme.text.secondary }]}>
                  Fee payments are handled via NPCI-certified UPI protocols with 256-bit bank encryption. Edzy does not store parent UPI MPINs, CVVs, or debit/credit card numbers. Instant receipts are cryptographically signed.
                </Text>
              </View>

              <View style={[styles.policyCard, { backgroundColor: isDark ? '#161B22' : '#F8FAFC', borderColor: activeTheme.surfaceBorder }]}>
                <View style={styles.policyCardHeader}>
                  <School size={16} color={activeTheme.status.info} />
                  <Text style={[styles.policyCardTitle, { color: activeTheme.text.ink }]}>Campus Tenant Isolation</Text>
                </View>
                <Text style={[styles.policyCardBody, { color: activeTheme.text.secondary }]}>
                  Student attendance, exam scores, and roll numbers are strictly sandboxed under Doon Valley Public School (DVPS01). Academic records are never commercialized, harvested, or sold to advertising brokers.
                </Text>
              </View>

              <View style={[styles.policyCard, { backgroundColor: isDark ? '#161B22' : '#F8FAFC', borderColor: activeTheme.surfaceBorder }]}>
                <View style={styles.policyCardHeader}>
                  <FileText size={16} color={activeTheme.streak.primary} />
                  <Text style={[styles.policyCardTitle, { color: activeTheme.text.ink }]}>Google Play Data Safety & Deletion</Text>
                </View>
                <Text style={[styles.policyCardBody, { color: activeTheme.text.secondary }]}>
                  Parents and students have full rights to request profile anonymization or complete account deletion. To request data purging, email our grievance officer at support@edzy.in or submit through school administration.
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalFooterActions}>
              <TouchableOpacity
                style={[styles.webPolicyLinkBtn, { borderColor: activeTheme.brand.primary }]}
                onPress={() => Linking.openURL('https://edzy-admin.pages.dev/privacy-policy')}
                activeOpacity={0.8}
              >
                <ExternalLink size={14} color={activeTheme.brand.primary} />
                <Text style={[styles.webPolicyLinkText, { color: activeTheme.brand.primary }]}>Open Web Policy ↗</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalPrimaryBtn, { backgroundColor: activeTheme.brand.primary }]}
                onPress={() => setShowPrivacyModal(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.modalPrimaryBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ─── ABOUT EDZY MODAL ─── */}
      <Modal
        visible={showAboutModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAboutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: activeTheme.surface, borderColor: activeTheme.surfaceBorder }]}>
            <View style={styles.modalHeaderRow}>
              <View style={styles.modalHeaderBadgeTitle}>
                <View style={[styles.modalIconBadge, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.2)' : '#EEF2FF' }]}>
                  <Sparkles size={20} color={activeTheme.brand.primary} />
                </View>
                <View>
                  <Text style={[styles.modalTitle, { color: activeTheme.text.ink }]}>Edzy Indian School OS</Text>
                  <Text style={[styles.modalSubtitle, { color: activeTheme.text.secondary }]}>Version 1.0.0 • Build 1</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setShowAboutModal(false)}
                style={[styles.modalCloseBtn, { backgroundColor: isDark ? '#1E2530' : '#F1F5F9' }]}
                activeOpacity={0.7}
              >
                <X size={18} color={activeTheme.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
              <View style={[styles.aboutHeroBanner, { backgroundColor: isDark ? '#161B22' : '#F5F7FA', borderColor: activeTheme.surfaceBorder }]}>
                <Text style={[styles.aboutHeroTagline, { color: activeTheme.brand.primary }]}>
                  "Education Made Easy for Gen-Z"
                </Text>
                <Text style={[styles.aboutHeroBody, { color: activeTheme.text.ink }]}>
                  Edzy is India's premier unified K-12 Spatial Learning & School ERP platform. Designed to give students deep conceptual clarity via 3D interactive labs while offering schools a zero-leakage hybrid fee counter and instant parent circular broadcast.
                </Text>
              </View>

              <View style={styles.aboutSpecsList}>
                <View style={styles.aboutSpecRow}>
                  <Text style={[styles.aboutSpecLabel, { color: activeTheme.text.secondary }]}>Architectural Core:</Text>
                  <Text style={[styles.aboutSpecValue, { color: activeTheme.text.ink }]}>Supabase Realtime Cloud</Text>
                </View>
                <View style={styles.aboutSpecRow}>
                  <Text style={[styles.aboutSpecLabel, { color: activeTheme.text.secondary }]}>Curriculum Engine:</Text>
                  <Text style={[styles.aboutSpecValue, { color: activeTheme.text.ink }]}>CBSE / ICSE / State Board</Text>
                </View>
                <View style={styles.aboutSpecRow}>
                  <Text style={[styles.aboutSpecLabel, { color: activeTheme.text.secondary }]}>Spatial Renderer:</Text>
                  <Text style={[styles.aboutSpecValue, { color: activeTheme.text.ink }]}>Three.js & ARKit/ARCore</Text>
                </View>
                <View style={styles.aboutSpecRow}>
                  <Text style={[styles.aboutSpecLabel, { color: activeTheme.text.secondary }]}>Technical Support:</Text>
                  <Text style={[styles.aboutSpecValue, { color: activeTheme.brand.primary }]}>support@edzy.in</Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooterActions}>
              <TouchableOpacity
                style={[styles.modalPrimaryBtn, { backgroundColor: activeTheme.brand.primary, flex: 1 }]}
                onPress={() => setShowAboutModal(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.modalPrimaryBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 144,
    gap: 14,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
      },
      android: {
        elevation: 3,
      },
      default: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
      },
    }),
  },

  // Student ID Card
  idCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  avatarLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLargeText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  idCardInfo: {
    flex: 1,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  studentName: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  activePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activePillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  studentIdText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  classRollText: {
    fontSize: 12,
    marginTop: 2,
  },
  idCardDetailsGrid: {
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginBottom: 14,
  },
  detailBox: {},
  detailBoxLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  detailBoxValue: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Engagement Stats
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 6,
  },
  statCol: {
    alignItems: 'center',
  },
  statIconBadgeOrange: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statIconBadgeIndigo: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statIconBadgeGreen: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statNumber: {
    fontSize: 14,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
  },

  // Parental Time Limit
  settingHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingHeaderText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  settingSubtitle: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  cloudBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  syncStatusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  syncStatusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  syncNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  syncNowButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  timeLimitButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  timeOptionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  timeOptionButtonActive: {},
  timeOptionText: {
    fontSize: 13,
  },
  timeOptionTextActive: {},

  // Policies Menu
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  menuIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuRowTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  menuDivider: {
    height: 1,
    marginVertical: 10,
  },

  // Logout
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    maxHeight: '85%',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalHeaderBadgeTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScrollView: {
    marginVertical: 4,
  },
  policyCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  policyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  policyCardTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  policyCardBody: {
    fontSize: 12.5,
    lineHeight: 18,
  },
  modalFooterActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
  },
  webPolicyLinkBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 12,
  },
  webPolicyLinkText: {
    fontSize: 13,
    fontWeight: '700',
  },
  modalPrimaryBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 13,
  },
  modalPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  // About Modal
  aboutHeroBanner: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  aboutHeroTagline: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  aboutHeroBody: {
    fontSize: 13,
    lineHeight: 19,
  },
  aboutSpecsList: {
    gap: 10,
    marginBottom: 8,
  },
  aboutSpecRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  aboutSpecLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  aboutSpecValue: {
    fontSize: 13,
    fontWeight: '700',
  },
});
