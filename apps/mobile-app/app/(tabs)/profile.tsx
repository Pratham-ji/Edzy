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
} from 'lucide-react-native';
import { useEdzyStore } from '@/store/useEdzyStore';
import { colors } from '@/theme/colors';

const TIME_LIMIT_OPTIONS = [15, 30, 45, 60, 90];

export default function ProfileScreen() {
  const router = useRouter();
  const {
    studentProfile,
    sessionTimeLimitMinutes,
    setTimeLimitMinutes,
    isTimeLimitActive,
    toggleTimeLimitActive,
    logout,
  } = useEdzyStore();

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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account & Profile</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── 1. STUDENT ID CARD ─── */}
        <View style={styles.card}>
          <View style={styles.idCardTopRow}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarLargeText}>
                {studentProfile.name[0]}
              </Text>
            </View>
            <View style={styles.idCardInfo}>
              <View style={styles.nameBadgeRow}>
                <Text style={styles.studentName}>{studentProfile.name}</Text>
                <View style={styles.activePill}>
                  <Text style={styles.activePillText}>Active 26-27</Text>
                </View>
              </View>
              <Text style={styles.studentIdText}>ID: {studentProfile.id}</Text>
              <Text style={styles.classRollText}>
                {studentProfile.classGrade} • Roll #{studentProfile.rollNo}
              </Text>
            </View>
          </View>

          <View style={styles.idCardDetailsGrid}>
            <View style={styles.detailBox}>
              <Text style={styles.detailBoxLabel}>AFFILIATED SCHOOL</Text>
              <Text style={styles.detailBoxValue} numberOfLines={1}>
                {studentProfile.schoolName} ({studentProfile.schoolCode})
              </Text>
            </View>
            <View style={styles.detailBox}>
              <Text style={styles.detailBoxLabel}>REGISTERED PARENT</Text>
              <Text style={styles.detailBoxValue}>
                {studentProfile.parentName}
              </Text>
            </View>
          </View>

          {/* Engagement Mini Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <View style={styles.statIconBadgeOrange}>
                <Flame size={14} color={colors.streak.primary} />
              </View>
              <Text style={styles.statNumber}>{studentProfile.streakDays} Days</Text>
              <Text style={styles.statLabel}>Study Streak</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <View style={styles.statIconBadgeIndigo}>
                <BookOpen size={14} color={colors.brand.primary} />
              </View>
              <Text style={styles.statNumber}>{studentProfile.weeklyStudyHours}h</Text>
              <Text style={styles.statLabel}>Weekly Study</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <View style={styles.statIconBadgeGreen}>
                <Award size={14} color={colors.status.success} />
              </View>
              <Text style={styles.statNumber}>CBSE</Text>
              <Text style={styles.statLabel}>Board Curr.</Text>
            </View>
          </View>
        </View>

        {/* ─── 2. PARENTAL SCREEN TIME LIMIT SELECTOR ─── */}
        <View style={styles.card}>
          <View style={styles.settingHeaderRow}>
            <View style={styles.settingIconCircle}>
              <Clock size={18} color={colors.brand.primary} />
            </View>
            <View style={styles.settingHeaderText}>
              <Text style={styles.settingTitle}>Parental Focus Time Limit</Text>
              <Text style={styles.settingSubtitle}>
                Pause study app automatically to prevent digital screen fatigue
              </Text>
            </View>
            <Switch
              value={isTimeLimitActive}
              onValueChange={toggleTimeLimitActive}
              trackColor={{ false: colors.surfaceBorder, true: colors.brand.primaryLight }}
              thumbColor={isTimeLimitActive ? colors.brand.primary : '#FFFFFF'}
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
                      isSelected && styles.timeOptionButtonActive,
                    ]}
                    onPress={() => setTimeLimitMinutes(mins)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.timeOptionText,
                        isSelected && styles.timeOptionTextActive,
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

        {/* ─── 3. POLICIES & INFO ─── */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => Alert.alert('Privacy Policy', 'Edzy Indian School OS complies with India DPDP Act 2023. Student records are encrypted with 256-bit AES.')}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconCircle}>
              <Shield size={16} color={colors.text.secondary} />
            </View>
            <Text style={styles.menuRowTitle}>Privacy Policy & Data Security</Text>
            <ChevronRight size={16} color={colors.text.muted} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => Alert.alert('About Edzy', 'Edzy Unified K-12 Spatial Learning & School ERP • Version 1.0.0')}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconCircle}>
              <FileText size={16} color={colors.text.secondary} />
            </View>
            <Text style={styles.menuRowTitle}>About Edzy Indian School OS</Text>
            <ChevronRight size={16} color={colors.text.muted} />
          </TouchableOpacity>
        </View>

        {/* ─── 4. LOGOUT BUTTON ─── */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <LogOut size={16} color={colors.status.error} />
          <Text style={styles.logoutButtonText}>Sign Out of School Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: '#222222',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 116,
    gap: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EBEBEB',
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
    backgroundColor: colors.brand.primary,
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
    fontWeight: '800',
    color: colors.text.primary,
  },
  activePill: {
    backgroundColor: colors.status.successBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.status.success,
  },
  studentIdText: {
    fontSize: 12,
    color: colors.brand.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  classRollText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 1,
  },
  idCardDetailsGrid: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    gap: 10,
    marginBottom: 14,
  },
  detailBox: {},
  detailBoxLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text.muted,
    letterSpacing: 0.5,
  },
  detailBoxValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: 12,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.divider,
  },
  statIconBadgeOrange: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.streak.tint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statIconBadgeIndigo: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.brand.tint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statIconBadgeGreen: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.status.successBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: 10,
    color: colors.text.muted,
    marginTop: 1,
  },

  // Setting Card
  settingHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.brand.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingHeaderText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
  },
  settingSubtitle: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 2,
    lineHeight: 15,
  },
  timeLimitButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  timeOptionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    alignItems: 'center',
  },
  timeOptionButtonActive: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  timeOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  timeOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Menu Rows
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  menuIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuRowTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: 10,
  },

  // Logout
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.status.errorBg,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.status.errorBorder,
  },
  logoutButtonText: {
    color: colors.status.error,
    fontSize: 14,
    fontWeight: '700',
  },
});
