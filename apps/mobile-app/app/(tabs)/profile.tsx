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
  Sun,
  Moon,
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
    logout,
  } = useEdzyStore();

  const isDark = themeMode === 'dark';
  const activeTheme = isDark ? darkTheme : lightTheme;

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

        {/* ─── 4. POLICIES & INFO ─── */}
        <View style={[styles.card, { backgroundColor: activeTheme.surface, borderColor: activeTheme.surfaceBorder }]}>
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => Alert.alert('Privacy Policy', 'Edzy Indian School OS complies with India DPDP Act 2023. Student records are encrypted with 256-bit AES.')}
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
            onPress={() => Alert.alert('About Edzy', 'Edzy Unified K-12 Spatial Learning & School ERP • Version 1.0.0')}
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
});
