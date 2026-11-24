import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { PressableScale } from '@/components/PressableScale';
import {
  Sparkles,
  CreditCard,
  BookOpen,
  Boxes,
  HelpCircle,
  Flame,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  FileText,
  Lock,
  ChevronRight,
  Heart,
  Bell,
  Settings,
  ShieldCheck,
  Calendar,
  Layers,
  GraduationCap,
  X,
  Download,
} from 'lucide-react-native';
import { useEdzyStore, SchoolCircular } from '@/store/useEdzyStore';
import { colors, lightTheme, darkTheme } from '@/theme/colors';

const SUBJECT_CHIPS = ['All', 'Science', 'Mathematics', 'Physics', 'English'];

export default function MasterBentoDashboard() {
  const router = useRouter();
  const {
    activeMode,
    setActiveMode,
    studentProfile,
    roadmaps,
    feeInstallments,
    examMarks,
    logout,
    sessionTimeLimitMinutes,
    sessionRemainingSeconds,
    isTimeLimitActive,
    isSessionLocked,
    decrementSessionSecond,
    unlockOrExtendSession,
    connectionMode,
    liveSyncToast,
    clearLiveSyncToast,
    initializeMobileSync,
    themeMode,
    circulars,
  } = useEdzyStore();

  const [selectedSubject, setSelectedSubject] = useState('All');
  const [parentOverridePin, setParentOverridePin] = useState('');
  const [selectedCircular, setSelectedCircular] = useState<SchoolCircular | null>(null);

  const isDark = themeMode === 'dark';
  const activeTheme = isDark ? darkTheme : lightTheme;

  // Digital Wellbeing Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      decrementSessionSecond();
    }, 1000);
    return () => clearInterval(timer);
  }, [decrementSessionSecond]);

  // Realtime Supabase Live Sync
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    initializeMobileSync(studentProfile.id).then((c) => {
      cleanup = c;
    });
    return () => {
      cleanup?.();
    };
  }, [initializeMobileSync, studentProfile.id]);

  // Auto-dismiss Live Sync Toast
  useEffect(() => {
    if (liveSyncToast) {
      const t = setTimeout(() => {
        clearLiveSyncToast();
      }, 3500);
      return () => clearTimeout(t);
    }
  }, [liveSyncToast, clearLiveSyncToast]);

  const isStudent = activeMode === 'STUDENT';

  // Format time remaining
  const formatTimeRemaining = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    return `${m}m left`;
  };

  // Fees calculations
  const totalPaid = feeInstallments
    .filter((f) => f.status === 'PAID')
    .reduce((sum, f) => sum + f.amount, 0);

  const totalDue = feeInstallments
    .filter((f) => f.status !== 'PAID')
    .reduce((sum, f) => sum + f.amount, 0);

  const pendingQuarter = feeInstallments.find((f) => f.status === 'PENDING' || f.status === 'OVERDUE');
  const allFeesCleared = totalDue === 0;

  // Latest exam report - prioritizes Class 10 Pre-Board Examination (92.6%)
  const latestExam =
    examMarks?.find((m) => m.termId === 'PRE_BOARD') ||
    (examMarks && examMarks.length > 0 ? examMarks[0] : null);

  const activeCircular = circulars && circulars.length > 0 ? circulars[0] : null;

  // Active roadmap
  const activeRoadmap = roadmaps.find((r) => r.isCurrent) || roadmaps[0];

  const handleParentUnlock = () => {
    if (unlockOrExtendSession(parentOverridePin, 30)) {
      setParentOverridePin('');
      Alert.alert('Session Extended', '30 additional minutes granted for study.');
    } else {
      Alert.alert('Incorrect PIN', 'Please enter valid 4-digit Parent PIN.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ─── LIVE SYNC TOAST ─── */}
      {liveSyncToast && (
        <View style={styles.toastContainer}>
          <CheckCircle2 size={16} color="#FFFFFF" />
          <Text style={styles.toastText} numberOfLines={1}>
            {liveSyncToast}
          </Text>
        </View>
      )}

      {/* ─── 1. COMPACT 1-ROW CONSUMER HEADER (Zomato/Blinkit Style) ─── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {isStudent ? studentProfile.name[0] : studentProfile.parentName[0]}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>
              {isStudent ? `Hi, ${studentProfile.name.split(' ')[0]}` : `Hi, ${studentProfile.parentName.split(' ')[0]}`}
            </Text>
            <Text style={styles.userSub} numberOfLines={1}>
              {studentProfile.schoolName.split(' ')[0]} {studentProfile.schoolName.split(' ')[1] || ''} • {studentProfile.classGrade}
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          {isTimeLimitActive && (
            <View style={styles.timerPill}>
              <Clock size={12} color={colors.brand.primary} />
              <Text style={styles.timerText}>
                {formatTimeRemaining(sessionRemainingSeconds)}
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push('/(tabs)/profile')}
            activeOpacity={0.7}
          >
            <Settings size={18} color="#222222" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ─── 2. SLEEK SEGMENTED MODE PILL ─── */}
      <View style={styles.modeContainer}>
        <View style={styles.modeTrack}>
          <TouchableOpacity
            style={[styles.modeTab, isStudent && styles.modeTabActive]}
            onPress={() => setActiveMode('STUDENT')}
            activeOpacity={0.85}
          >
            <Sparkles size={14} color={isStudent ? colors.brand.primary : colors.text.muted} />
            <Text style={[styles.modeLabel, isStudent && styles.modeLabelActive]}>
              Study Space
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeTab, !isStudent && styles.modeTabActive]}
            onPress={() => setActiveMode('PARENT')}
            activeOpacity={0.85}
          >
            <CreditCard size={14} color={!isStudent ? colors.parent.primary : colors.text.muted} />
            <Text style={[styles.modeLabel, !isStudent && styles.modeLabelActiveParent]}>
              Parent ERP
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isStudent ? (
          /* =========================================================================
             STUDENT STUDY SPACE
             ========================================================================= */
          <View style={styles.contentSection}>
            {/* Subject Filter Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              {SUBJECT_CHIPS.map((chip) => {
                const isActive = selectedSubject === chip;
                return (
                  <TouchableOpacity
                    key={chip}
                    style={[styles.chip, isActive && styles.chipActive]}
                    onPress={() => setSelectedSubject(chip)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                      {chip}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* HERO CARD: Continue Learning */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.pillBadgeIndigo}>
                  <BookOpen size={12} color={colors.brand.primary} />
                  <Text style={styles.pillBadgeIndigoText}>
                    {activeRoadmap?.subject || 'Science'} • Ch {activeRoadmap?.chapterNumber || 6}
                  </Text>
                </View>
                <Text style={styles.cardMetaText}>NCERT Class 10</Text>
              </View>

              <Text style={styles.heroTitle}>
                {activeRoadmap?.title || 'Life Processes & Human Heart'}
              </Text>

              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBarTrack}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${activeRoadmap?.progressPercent || 65}%` },
                    ]}
                  />
                </View>
                <View style={styles.progressLabelRow}>
                  <Text style={styles.progressPercentText}>
                    {activeRoadmap?.progressPercent || 65}% Mastered
                  </Text>
                  <Text style={styles.progressSubText}>
                    {activeRoadmap?.completedSubtopics || 3} of {activeRoadmap?.totalSubtopics || 5} topics done
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => router.push('/study/roadmap')}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryButtonText}>Continue Chapter</Text>
                <ArrowRight size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* INTERACTIVE 3D LAB CARD (Clean Slot for AR Teammate) */}
            <View style={styles.card}>
              <View style={styles.arPreviewContainer}>
                <View style={styles.arGradientBox}>
                  <View style={styles.heartIconCircle}>
                    <Heart size={36} color={colors.brand.primary} fill="#EEF2FF" />
                  </View>
                  <View style={styles.arModelBadge}>
                    <Boxes size={12} color={colors.brand.primary} />
                    <Text style={styles.arModelBadgeText}>Interactive 3D Model</Text>
                  </View>
                </View>
              </View>

              <View style={styles.arCardBody}>
                <Text style={styles.cardTitle}>Human Heart — 3D Visual Lab</Text>
                <Text style={styles.cardDescription}>
                  Rotate, zoom, and explore chambers, valves, and blood flow in full 3D simulation.
                </Text>

                <TouchableOpacity
                  style={styles.secondaryBrandButton}
                  onPress={() => router.push('/study/ar-lab')}
                  activeOpacity={0.85}
                >
                  <Boxes size={16} color={colors.brand.primary} />
                  <Text style={styles.secondaryBrandButtonText}>Open 3D Lab</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 2-COLUMN QUICK ACTION GRID */}
            <View style={styles.quickGrid}>
              {/* Left Tile: AI Doubt Tutor */}
              <TouchableOpacity
                style={[styles.gridTile, styles.gridTileLeft]}
                onPress={() => router.push('/study/tutor')}
                activeOpacity={0.85}
              >
                <View style={styles.iconCircleIndigo}>
                  <HelpCircle size={22} color={colors.brand.primary} />
                </View>
                <Text style={styles.gridTileTitle}>AI Doubt Tutor</Text>
                <Text style={styles.gridTileSub}>
                  Ask anything grounded in school notes & NCERT
                </Text>
                <View style={styles.gridTileAction}>
                  <Text style={styles.gridActionTextIndigo}>Ask Doubts →</Text>
                </View>
              </TouchableOpacity>

              {/* Right Tile: Study Streak */}
              <View style={[styles.gridTile, styles.gridTileRight]}>
                <View style={styles.iconCircleOrange}>
                  <Flame size={22} color={colors.streak.primary} />
                </View>
                <Text style={styles.gridTileTitle}>
                  {studentProfile.streakDays || 12} Days
                </Text>
                <Text style={styles.gridTileSub}>
                  {studentProfile.weeklyStudyHours || 6.5} hrs logged this week
                </Text>
                <View style={styles.streakBadgeRow}>
                  <CheckCircle2 size={12} color={colors.status.success} />
                  <Text style={styles.streakBadgeText}>Daily Goal Met</Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          /* =========================================================================
             PARENT ERP MODE
             ========================================================================= */
          <View style={styles.contentSection}>
            {/* PAYMENT SUMMARY CARD (PhonePe/Groww Style) */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardCategoryTitle}>School Fee Summary</Text>
                {allFeesCleared ? (
                  <View style={styles.badgeSuccess}>
                    <CheckCircle2 size={12} color={colors.status.success} />
                    <Text style={styles.badgeSuccessText}>All Dues Cleared</Text>
                  </View>
                ) : (
                  <View style={styles.badgeWarning}>
                    <Clock size={12} color={colors.status.warning} />
                    <Text style={styles.badgeWarningText}>
                      {pendingQuarter?.quarter.split(' ')[0] || 'Q4'} Due • 30 Nov
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.feeNumbersRow}>
                <View>
                  <Text style={styles.feeLabel}>Outstanding Balance</Text>
                  <Text style={[styles.feeAmountLarge, allFeesCleared && { color: colors.status.success }]}>
                    ₹{totalDue.toLocaleString('en-IN')}
                  </Text>
                </View>
                <View style={styles.feePaidColumn}>
                  <Text style={styles.feeLabel}>Total Paid to Date</Text>
                  <Text style={styles.feePaidAmount}>
                    ₹{totalPaid.toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={allFeesCleared ? styles.secondaryBrandButton : styles.primaryButtonEmerald}
                onPress={() => router.push('/erp/fees')}
                activeOpacity={0.85}
              >
                <Text style={allFeesCleared ? styles.secondaryBrandButtonText : styles.primaryButtonText}>
                  {allFeesCleared ? 'View Receipts & Passbook' : 'Pay via UPI / View Passbook'}
                </Text>
                <ChevronRight size={16} color={allFeesCleared ? colors.brand.primary : '#FFFFFF'} />
              </TouchableOpacity>
            </View>

            {/* EXAM REPORT CARD SUMMARY */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.pillBadgeEmerald}>
                  <GraduationCap size={12} color={colors.parent.primary} />
                  <Text style={styles.pillBadgeEmeraldText}>
                    {latestExam?.termName || 'Pre-Board Examination'}
                  </Text>
                </View>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankBadgeText}>
                    Rank #{latestExam?.rankInClass || 2} of {latestExam?.totalStudents || 42}
                  </Text>
                </View>
              </View>

              <View style={styles.examScoreRow}>
                <View>
                  <Text style={styles.examAggregate}>
                    {latestExam?.percentage || 92.6}%
                  </Text>
                  <Text style={styles.examAggregateLabel}>Overall Aggregate Score</Text>
                </View>
                <View style={styles.attendanceColumn}>
                  <Text style={styles.attendanceValue}>
                    {latestExam?.attendancePercentage || 96.8}%
                  </Text>
                  <Text style={styles.attendanceLabel}>Attendance</Text>
                </View>
              </View>

              {/* Subject Score Pills */}
              <View style={styles.subjectPillsRow}>
                {latestExam?.scores.slice(0, 3).map((sc) => (
                  <View key={sc.subject} style={styles.subjectPill}>
                    <Text style={styles.subjectPillName}>
                      {sc.subject.split(' ')[0]}
                    </Text>
                    <Text style={styles.subjectPillScore}>
                      {sc.marksObtained}/{sc.maxMarks}
                    </Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={styles.outlineButton}
                onPress={() => router.push('/erp/marks')}
                activeOpacity={0.85}
              >
                <Text style={styles.outlineButtonText}>View Full Report Card</Text>
                <ChevronRight size={16} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            {/* AT-HOME STUDY PROOF CARD */}
            <View style={styles.card}>
              <View style={styles.proofHeaderRow}>
                <View style={styles.iconCircleIndigoSmall}>
                  <ShieldCheck size={18} color={colors.brand.primary} />
                </View>
                <View style={styles.proofHeaderText}>
                  <Text style={styles.cardTitle}>Verified At-Home Study</Text>
                  <Text style={styles.cardDescription}>
                    {studentProfile.name} studied {studentProfile.weeklyStudyHours || 6.5} hrs at home this week — 3 school chapters covered.
                  </Text>
                </View>
              </View>
            </View>

            {/* SCHOOL CIRCULAR / NOTICE CARD */}
            {activeCircular && (
              <PressableScale
                style={[
                  styles.card,
                  {
                    backgroundColor: activeTheme.surface,
                    borderColor: activeTheme.surfaceBorder,
                  },
                ]}
                onPress={() => setSelectedCircular(activeCircular)}
              >
                <View style={styles.cardHeaderRow}>
                  <View style={styles.noticeHeaderLeft}>
                    <Bell size={14} color={activeTheme.brand.primary} />
                    <Text style={[styles.cardCategoryTitle, { color: activeTheme.text.ink }]}>
                      Official School Circular
                    </Text>
                  </View>
                  <Text style={[styles.cardMetaText, { color: activeTheme.text.muted }]}>
                    {activeCircular.date}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.cardTitle,
                    { color: activeTheme.text.ink, fontSize: 15, marginBottom: 4 },
                  ]}
                >
                  {activeCircular.title}
                </Text>
                <Text
                  style={[styles.noticeBody, { color: activeTheme.text.secondary }]}
                  numberOfLines={2}
                >
                  {activeCircular.message}
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 10,
                    paddingTop: 10,
                    borderTopWidth: 1,
                    borderTopColor: activeTheme.divider,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: '600',
                      color: activeTheme.brand.primary,
                    }}
                  >
                    {activeCircular.author}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '700',
                      color: activeTheme.brand.primary,
                    }}
                  >
                    Read Full Circular →
                  </Text>
                </View>
              </PressableScale>
            )}
          </View>
        )}
      </ScrollView>

      {/* ─── DIGITAL WELLBEING SESSION LOCK MODAL ─── */}
      <Modal visible={isSessionLocked} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.lockCard}>
            <View style={styles.lockIconCircle}>
              <Lock size={28} color={colors.brand.primary} />
            </View>
            <Text style={styles.lockTitle}>Daily Focus Limit Reached</Text>
            <Text style={styles.lockDescription}>
              Great job today! To avoid digital fatigue, this device is temporarily paused.
              Ask your parent to enter their 4-digit PIN to extend study time.
            </Text>

            <TextInput
              style={styles.pinInput}
              placeholder="Enter 4-digit Parent PIN"
              placeholderTextColor={colors.text.muted}
              secureTextEntry
              keyboardType="numeric"
              maxLength={4}
              value={parentOverridePin}
              onChangeText={setParentOverridePin}
            />

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleParentUnlock}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>Extend 30 Minutes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* ─── SCHOOL CIRCULAR FULL VIEW MODAL ─── */}
      <Modal visible={Boolean(selectedCircular)} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.lockCard,
              {
                backgroundColor: activeTheme.surface,
                borderColor: activeTheme.surfaceBorder,
                maxWidth: 420,
              },
            ]}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                marginBottom: 14,
              }}
            >
              <View
                style={{
                  backgroundColor:
                    selectedCircular?.category === 'EXAM'
                      ? activeTheme.status.warningBg
                      : selectedCircular?.category === 'HOLIDAY'
                      ? activeTheme.status.errorBg
                      : activeTheme.brand.tint,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 10,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '700',
                    color:
                      selectedCircular?.category === 'EXAM'
                        ? activeTheme.status.warning
                        : selectedCircular?.category === 'HOLIDAY'
                        ? activeTheme.status.error
                        : activeTheme.brand.primary,
                  }}
                >
                  {selectedCircular?.category} CIRCULAR
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedCircular(null)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: isDark ? '#1F242C' : '#F3F4F6',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={16} color={activeTheme.text.secondary} />
              </TouchableOpacity>
            </View>

            <Text
              style={{
                fontSize: 17,
                fontWeight: '700',
                color: activeTheme.text.ink,
                marginBottom: 6,
                textAlign: 'left',
                width: '100%',
              }}
            >
              {selectedCircular?.title}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: activeTheme.text.muted,
                marginBottom: 14,
                width: '100%',
              }}
            >
              Issued {selectedCircular?.date} • Target: {selectedCircular?.targetClass}
            </Text>

            <View
              style={{
                backgroundColor: isDark ? '#1C222C' : '#F8FAFC',
                borderRadius: 12,
                padding: 14,
                width: '100%',
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  lineHeight: 20,
                  color: activeTheme.text.primary,
                }}
              >
                {selectedCircular?.message}
              </Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                marginBottom: 16,
                paddingTop: 8,
                borderTopWidth: 1,
                borderTopColor: activeTheme.divider,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '600',
                  color: activeTheme.text.secondary,
                }}
              >
                By {selectedCircular?.author}
              </Text>
              {selectedCircular?.attachmentName && (
                <TouchableOpacity
                  onPress={() =>
                    Alert.alert(
                      'Download Attachment',
                      `Downloaded ${selectedCircular.attachmentName} to school files.`
                    )
                  }
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Download size={13} color={activeTheme.brand.primary} />
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: '700',
                      color: activeTheme.brand.primary,
                    }}
                  >
                    PDF Attached
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.primaryButton,
                { width: '100%', backgroundColor: activeTheme.brand.primary },
              ]}
              onPress={() => setSelectedCircular(null)}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>Acknowledge & Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  toastContainer: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    backgroundColor: colors.status.success,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 999,
    shadowColor: colors.shadow.color,
    shadowOffset: colors.shadow.offset,
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },

  // 1-Row Compact Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  userSub: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.brand.tint,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  timerText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.brand.primary,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      default: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
    }),
  },

  // Mode Switcher Pill
  modeContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
    backgroundColor: colors.background,
  },
  modeTrack: {
    flexDirection: 'row',
    backgroundColor: '#EAEEF4',
    borderRadius: 25,
    padding: 3,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 22,
  },
  modeTabActive: {
    backgroundColor: colors.surface,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  modeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.muted,
  },
  modeLabelActive: {
    color: colors.brand.primary,
    fontWeight: '700',
  },
  modeLabelActiveParent: {
    color: colors.parent.primary,
    fontWeight: '700',
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 116,
  },
  contentSection: {
    gap: 12,
  },

  // Subject Chips Row
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  chipActive: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Airbnb Standard Clean White Card
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
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardCategoryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
  },
  cardMetaText: {
    fontSize: 12,
    color: colors.text.muted,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
    marginBottom: 14,
  },

  // Pills
  pillBadgeIndigo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.brand.tint,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  pillBadgeIndigoText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.brand.primary,
  },
  pillBadgeEmerald: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.parent.cardBg,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  pillBadgeEmeraldText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.parent.primary,
  },

  // Hero Card
  heroTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 12,
  },
  progressContainer: {
    marginBottom: 14,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: colors.background,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.brand.primary,
    borderRadius: 3,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressPercentText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.brand.primary,
  },
  progressSubText: {
    fontSize: 12,
    color: colors.text.muted,
  },

  // Buttons
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.brand.primary,
    paddingVertical: 12,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  primaryButtonEmerald: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.parent.primary,
    paddingVertical: 12,
    borderRadius: 12,
  },
  secondaryBrandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.brand.tint,
    paddingVertical: 12,
    borderRadius: 12,
  },
  secondaryBrandButtonText: {
    color: colors.brand.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  outlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingVertical: 11,
    borderRadius: 12,
    marginTop: 10,
  },
  outlineButtonText: {
    color: colors.text.secondary,
    fontSize: 13,
    fontWeight: '600',
  },

  // AR 3D Lab Preview
  arPreviewContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  arGradientBox: {
    height: 120,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    position: 'relative',
  },
  heartIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.brand.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  arModelBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  arModelBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.brand.primary,
  },
  arCardBody: {
    paddingHorizontal: 2,
  },

  // 2-Column Quick Grid
  quickGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  gridTile: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EBEBEB',
    padding: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
      },
      android: {
        elevation: 2,
      },
      default: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
      },
    }),
  },
  gridTileLeft: {},
  gridTileRight: {},
  iconCircleIndigo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.brand.tint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  iconCircleOrange: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.streak.tint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  iconCircleIndigoSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.brand.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridTileTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  gridTileSub: {
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 16,
    marginBottom: 10,
  },
  gridTileAction: {
    marginTop: 'auto',
  },
  gridActionTextIndigo: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.brand.primary,
  },
  streakBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 'auto',
  },
  streakBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.status.success,
  },

  // Parent ERP Cards
  badgeSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.status.successBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeSuccessText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.status.success,
  },
  badgeWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.status.warningBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeWarningText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.status.warning,
  },
  feeNumbersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginVertical: 12,
  },
  feeLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  feeAmountLarge: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.status.error,
  },
  feePaidColumn: {
    alignItems: 'flex-end',
  },
  feePaidAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.status.success,
  },

  // Exam Score Card
  rankBadge: {
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  rankBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.secondary,
  },
  examScoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginVertical: 10,
  },
  examAggregate: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text.primary,
  },
  examAggregateLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  attendanceColumn: {
    alignItems: 'flex-end',
  },
  attendanceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.parent.primary,
  },
  attendanceLabel: {
    fontSize: 11,
    color: colors.text.muted,
    marginTop: 2,
  },
  subjectPillsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
    marginBottom: 4,
  },
  subjectPill: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  subjectPillName: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  subjectPillScore: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: 2,
  },

  // Proof Card
  proofHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  proofHeaderText: {
    flex: 1,
  },

  // School Circular
  noticeHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  noticeBody: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },

  // Session Lock Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  lockCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  lockIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.brand.tint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  lockTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  lockDescription: {
    fontSize: 13,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  pinInput: {
    width: '100%',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text.primary,
    textAlign: 'center',
    letterSpacing: 4,
    marginBottom: 16,
  },
});
