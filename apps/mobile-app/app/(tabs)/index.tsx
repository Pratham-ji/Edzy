import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  School,
  Sparkles,
  BookOpen,
  Boxes,
  MessageSquareCode,
  Flame,
  CreditCard,
  Award,
  Clock,
  Bell,
  ArrowRight,
  LogOut,
  ChevronRight,
  ShieldAlert,
  CheckCircle,
  Hourglass,
  Lock,
  Timer,
  ShieldCheck,
  X,
  Coffee,
} from 'lucide-react-native';
import { useEdzyStore } from '@/store/useEdzyStore';
import { colors } from '@/theme/colors';
import { HolographicHeartPreview } from '@/components/HolographicHeartPreview';

export default function MasterBentoDashboard() {
  const router = useRouter();
  const {
    activeMode,
    setActiveMode,
    studentProfile,
    roadmaps,
    activeArDirective,
    chatMessages,
    feeInstallments,
    examMarks,
    logout,
    sessionTimeLimitMinutes,
    sessionRemainingSeconds,
    isTimeLimitActive,
    isSessionLocked,
    setTimeLimitMinutes,
    decrementSessionSecond,
    unlockOrExtendSession,
    toggleTimeLimitActive,
    connectionMode,
    liveSyncToast,
    clearLiveSyncToast,
    initializeMobileSync,
  } = useEdzyStore();

  const [parentOverridePin, setParentOverridePin] = useState('');

  // Run the digital wellbeing time limit countdown
  useEffect(() => {
    const timer = setInterval(() => {
      decrementSessionSecond();
    }, 1000);
    return () => clearInterval(timer);
  }, [decrementSessionSecond]);

  // Realtime Supabase live sync
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    initializeMobileSync(studentProfile.id).then((c) => {
      cleanup = c;
    });
    return () => {
      cleanup?.();
    };
  }, [initializeMobileSync, studentProfile.id]);

  // Auto-dismiss live sync notification toast
  useEffect(() => {
    if (liveSyncToast) {
      const t = setTimeout(() => {
        clearLiveSyncToast();
      }, 4500);
      return () => clearTimeout(t);
    }
  }, [liveSyncToast, clearLiveSyncToast]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isStudent = activeMode === 'STUDENT';
  const currentChapter = roadmaps.find((r) => r.isCurrent) || roadmaps[0];
  const latestExam = examMarks[0];

  // Fee calculation
  const totalPaid = feeInstallments
    .filter((f) => f.status === 'PAID')
    .reduce((sum, f) => sum + f.amount, 0);

  const totalDue = feeInstallments
    .filter((f) => f.status !== 'PAID')
    .reduce((sum, f) => sum + f.amount, 0);

  const pendingQuarter = feeInstallments.find((f) => f.status !== 'PAID');

  const latestSocraticMsg = chatMessages[chatMessages.length - 1];

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* 1. Sticky School Header */}
      <View style={styles.headerBar}>
        <View style={styles.schoolInfoRow}>
          <View style={styles.schoolLogoSmall}>
            <School size={18} color={isStudent ? colors.student.secondaryLight : colors.parent.primaryLight} />
          </View>
          <View style={styles.schoolTitleBox}>
            <Text style={styles.schoolNameText} numberOfLines={1}>
              {studentProfile.schoolName}
            </Text>
            <Text style={styles.schoolMetaText}>
              {studentProfile.schoolCode} • CBSE Affiliated • Class 10
            </Text>
          </View>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => {
              logout();
              router.replace('/login');
            }}
          >
            <LogOut size={16} color={colors.text.muted} />
          </TouchableOpacity>
        </View>

        {/* Student / Parent Identity Bar */}
        <View style={styles.identityBar}>
          <View style={styles.avatarPill}>
            <Text style={styles.avatarInitial}>
              {isStudent ? studentProfile.name[0] : studentProfile.parentName[0]}
            </Text>
          </View>
          <View style={styles.identityDetails}>
            <Text style={styles.identityName}>
              {isStudent ? studentProfile.name : `${studentProfile.parentName} (Parent)`}
            </Text>
            <Text style={styles.identityClass}>
              {studentProfile.classGrade} • Roll #{studentProfile.rollNo} • ID: {studentProfile.id}
            </Text>
          </View>
          <View style={styles.verifiedTag}>
            <Text style={styles.verifiedText}>Active 26-27</Text>
          </View>
        </View>

        {/* Digital Wellbeing Session Limit Indicator */}
        <View style={styles.timeLimitBannerRow}>
          <View style={styles.timeLimitLeft}>
            <Hourglass
              size={13}
              color={
                !isTimeLimitActive
                  ? colors.text.muted
                  : sessionRemainingSeconds < 300
                  ? colors.status.error
                  : colors.student.secondaryLight
              }
            />
            <Text
              style={[
                styles.timeLimitBannerText,
                sessionRemainingSeconds < 300 && isTimeLimitActive && { color: colors.status.error },
              ]}
            >
              {isTimeLimitActive
                ? `Focus Time Limit: ${formatTimer(sessionRemainingSeconds)} Left`
                : 'Focus Time Limit: Disabled'}
            </Text>
          </View>
          <View style={styles.timeLimitModeTag}>
            <Text style={styles.timeLimitModeTagText}>
              {isTimeLimitActive ? `${sessionTimeLimitMinutes}m Max` : 'Off'}
            </Text>
          </View>
        </View>

        {/* Realtime Live Sync Notification Toast */}
        {liveSyncToast && (
          <View style={styles.liveSyncToastBanner}>
            <View style={styles.pulseGreenDot} />
            <Text style={styles.liveSyncToastText} numberOfLines={1}>
              {liveSyncToast}
            </Text>
            <TouchableOpacity onPress={clearLiveSyncToast} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={13} color="#6EE7B7" />
            </TouchableOpacity>
          </View>
        )}

        {/* 2. Master Mode Switcher: Study Space vs Parent ERP */}
        <View style={styles.modeSwitcherContainer}>
          <TouchableOpacity
            style={[
              styles.modeTabButton,
              isStudent && styles.modeTabStudentActive,
            ]}
            onPress={() => setActiveMode('STUDENT')}
            activeOpacity={0.85}
          >
            <Sparkles size={14} color={isStudent ? '#FFFFFF' : colors.text.muted} />
            <Text style={[styles.modeTabText, isStudent && styles.modeTabTextActive]}>
              Study Space (At-Home)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeTabButton,
              !isStudent && styles.modeTabParentActive,
            ]}
            onPress={() => setActiveMode('PARENT')}
            activeOpacity={0.85}
          >
            <CreditCard size={14} color={!isStudent ? '#FFFFFF' : colors.text.muted} />
            <Text style={[styles.modeTabText, !isStudent && styles.modeTabTextActive]}>
              Parent ERP & Fees
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
             STUDENT BENTO GRID
             ========================================================================= */
          <View style={styles.bentoGrid}>
            {/* 1. HERO TILE: Active AI Syllabus Roadmap */}
            <TouchableOpacity
              style={[styles.bentoTile, styles.heroTile]}
              onPress={() => router.push('/study/roadmap')}
              activeOpacity={0.85}
            >
              <View style={styles.heroTopRow}>
                <View style={styles.heroBadge}>
                  <BookOpen size={14} color={colors.student.secondaryLight} />
                  <Text style={styles.heroBadgeText}>{currentChapter.board}</Text>
                </View>
                <View style={styles.progressPill}>
                  <Text style={styles.progressPillText}>{currentChapter.progressPercent}% DONE</Text>
                </View>
              </View>

              <Text style={styles.heroSubject}>{currentChapter.subject}</Text>
              <Text style={styles.heroTitle}>
                Ch {currentChapter.chapterNumber}: {currentChapter.title}
              </Text>

              {/* Progress Bar */}
              <View style={styles.progressBarTrack}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${currentChapter.progressPercent}%` },
                  ]}
                />
              </View>

              <View style={styles.heroBottomRow}>
                <Text style={styles.heroMilestoneSummary}>
                  {currentChapter.completedSubtopics} of {currentChapter.totalSubtopics} Milestones Cleared
                </Text>
                <View style={styles.actionArrow}>
                  <Text style={styles.actionArrowText}>Open Roadmap</Text>
                  <ArrowRight size={14} color={colors.student.secondaryLight} />
                </View>
              </View>
            </TouchableOpacity>

            {/* 2. WIDE 16:9 PREVIEW TILE: Interactive 3D Spatial AR Lab */}
            <TouchableOpacity
              style={[styles.bentoTile, styles.arPreviewTile]}
              onPress={() => router.push('/study/ar-lab')}
              activeOpacity={0.85}
            >
              <View style={styles.arPreviewHeader}>
                <View style={styles.spatialBadge}>
                  <Boxes size={14} color={colors.spatial.nodeActive} />
                  <Text style={styles.spatialBadgeText}>16:9 SPATIAL AR LAB</Text>
                </View>
                <View style={styles.fpsBadge}>
                  <Text style={styles.fpsText}>
                    {activeArDirective.fps} FPS • {activeArDirective.latencyMs}ms WebRTC
                  </Text>
                </View>
              </View>

              {/* High-Tech 16:9 Holographic Heart AR Wireframe Viewport */}
              <View style={styles.aspect169PreviewContainer}>
                <HolographicHeartPreview
                  targetNode={activeArDirective.targetNode}
                  fps={activeArDirective.fps}
                  latencyMs={activeArDirective.latencyMs}
                  rotation={activeArDirective.rotation}
                />
                <View style={styles.arOverlayInfo}>
                  <Text style={styles.arModelTitle}>{activeArDirective.modelName}</Text>
                  <Text style={styles.arModelSub} numberOfLines={1}>
                    {activeArDirective.note}
                  </Text>
                </View>
              </View>

              <View style={styles.arLaunchFooter}>
                <Text style={styles.arDirectiveAngle}>
                  Spatial Orientation: {activeArDirective.rotation}
                </Text>
                <View style={styles.arLaunchButton}>
                  <Text style={styles.arLaunchButtonText}>Launch 3D Viewport</Text>
                  <ChevronRight size={14} color="#FFFFFF" />
                </View>
              </View>
            </TouchableOpacity>

            {/* TWO-COLUMN SPLIT TILES */}
            <View style={styles.twoColumnRow}>
              {/* 3. SOCRATIC DOUBT SOLVER TILE */}
              <TouchableOpacity
                style={[styles.bentoTile, styles.halfTile]}
                onPress={() => router.push('/study/tutor')}
                activeOpacity={0.85}
              >
                <View style={styles.tileHeaderRow}>
                  <MessageSquareCode size={18} color={colors.student.primaryLight} />
                  <View style={styles.miniTag}>
                    <Text style={styles.miniTagText}>NCERT AI</Text>
                  </View>
                </View>
                <Text style={styles.tileTitle}>Socratic Doubt Solver</Text>
                <Text style={styles.tileDescription} numberOfLines={2}>
                  {latestSocraticMsg ? latestSocraticMsg.text : 'Grounded in Class 10 School Notes'}
                </Text>
                <View style={styles.chipRow}>
                  <Text style={styles.chipText}>Ask Ch 6 Bio Doubts</Text>
                  <ArrowRight size={12} color={colors.student.primaryLight} />
                </View>
              </TouchableOpacity>

              {/* 4. AT-HOME DAILY MICRO-QUIZ & STREAK TILE */}
              <View style={[styles.bentoTile, styles.halfTile]}>
                <View style={styles.tileHeaderRow}>
                  <Flame size={18} color="#F97316" />
                  <View style={[styles.miniTag, { backgroundColor: 'rgba(249, 115, 22, 0.15)' }]}>
                    <Text style={[styles.miniTagText, { color: '#F97316' }]}>12 DAYS</Text>
                  </View>
                </View>
                <Text style={styles.tileTitle}>Study Streak</Text>
                <Text style={styles.streakSubText}>
                  {studentProfile.weeklyStudyHours} hrs logged this week
                </Text>
                <View style={styles.streakStatusPill}>
                  <CheckCircle size={12} color={colors.parent.primary} />
                  <Text style={styles.streakStatusText}>Today's Target: Met</Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          /* =========================================================================
             PARENT ERP BENTO GRID
             ========================================================================= */
          <View style={styles.bentoGrid}>
            {/* 1. HERO TILE: Live Fee Balance Summary */}
            <TouchableOpacity
              style={[styles.bentoTile, styles.heroTileParent]}
              onPress={() => router.push('/erp/fees')}
              activeOpacity={0.85}
            >
              <View style={styles.heroTopRow}>
                <View style={styles.parentBadge}>
                  <CreditCard size={14} color={colors.parent.primaryLight} />
                  <Text style={styles.parentBadgeText}>ACADEMIC SESSION 2026-2027</Text>
                </View>
                <View
                  style={[
                    styles.feeStatusTag,
                    {
                      backgroundColor:
                        totalDue === 0 ? colors.status.successBg : colors.status.warningBg,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.feeStatusTagText,
                      { color: totalDue === 0 ? colors.parent.primaryLight : colors.status.warning },
                    ]}
                  >
                    {totalDue === 0 ? 'ALL CLEARED' : 'Q4 DUES PENDING'}
                  </Text>
                </View>
              </View>

              <Text style={styles.heroSubject}>School Tuition & Transport Fee</Text>
              <View style={styles.feeFiguresRow}>
                <View>
                  <Text style={styles.figureLabel}>Total Due Balance</Text>
                  <Text
                    style={[
                      styles.figureBigValue,
                      { color: totalDue === 0 ? colors.parent.primaryLight : colors.status.warning },
                    ]}
                  >
                    ₹{totalDue.toLocaleString('en-IN')}
                  </Text>
                </View>
                <View style={styles.figureDivider} />
                <View>
                  <Text style={styles.figureLabel}>Total Paid to Date</Text>
                  <Text style={[styles.figureBigValue, { color: colors.text.primary }]}>
                    ₹{totalPaid.toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>

              <View style={styles.parentHeroFooter}>
                <Text style={styles.parentHeroFooterText}>
                  {totalDue === 0
                    ? 'Receipt #EDZ-9940 generated • Nil Outstanding'
                    : `Upcoming: ${pendingQuarter?.quarter} due on ${pendingQuarter?.dueDate}`}
                </Text>
                <View style={styles.actionArrowGreen}>
                  <Text style={styles.actionArrowTextGreen}>
                    {totalDue === 0 ? 'View Passbook' : 'Pay Now via UPI'}
                  </Text>
                  <ArrowRight size={14} color={colors.parent.primaryLight} />
                </View>
              </View>
            </TouchableOpacity>

            {/* 2. EXAM MARKS & REPORT CARD SUMMARY */}
            <TouchableOpacity
              style={[styles.bentoTile, styles.reportCardTile]}
              onPress={() => router.push('/erp/marks')}
              activeOpacity={0.85}
            >
              <View style={styles.tileHeaderRow}>
                <View style={styles.reportTitleRow}>
                  <Award size={18} color={colors.student.secondaryLight} />
                  <Text style={styles.reportTileTitle}>{latestExam.termName}</Text>
                </View>
                <View style={styles.rankPill}>
                  <Text style={styles.rankPillText}>Class Rank #{latestExam.rankInClass}</Text>
                </View>
              </View>

              <View style={styles.metricsRow}>
                <View style={styles.metricBox}>
                  <Text style={styles.metricVal}>{latestExam.percentage}%</Text>
                  <Text style={styles.metricLabel}>Aggregate</Text>
                </View>
                <View style={styles.metricBox}>
                  <Text style={styles.metricVal}>
                    {latestExam.totalObtained}/{latestExam.totalMax}
                  </Text>
                  <Text style={styles.metricLabel}>Score</Text>
                </View>
                <View style={styles.metricBox}>
                  <Text style={styles.metricVal}>{latestExam.attendancePercentage}%</Text>
                  <Text style={styles.metricLabel}>Attendance</Text>
                </View>
              </View>

              <View style={styles.topSubjectPillsRow}>
                <View style={styles.subPill}>
                  <Text style={styles.subPillText}>Science: 94/100 (A1)</Text>
                </View>
                <View style={styles.subPill}>
                  <Text style={styles.subPillText}>Comp: 98/100 (A1)</Text>
                </View>
                <View style={styles.subPill}>
                  <Text style={styles.subPillText}>Math: 91/100 (A1)</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* TWO-COLUMN SPLIT TILES FOR PARENT */}
            <View style={styles.twoColumnRow}>
              {/* 3. AT-HOME TUITION TRACKER TILE */}
              <View style={[styles.bentoTile, styles.halfTile]}>
                <View style={styles.tileHeaderRow}>
                  <Clock size={18} color={colors.parent.primaryLight} />
                  <View style={styles.miniTagGreen}>
                    <Text style={styles.miniTagGreenText}>WEEKLY</Text>
                  </View>
                </View>
                <Text style={styles.tileTitle}>At-Home Study Hours</Text>
                <Text style={styles.studyHourBig}>{studentProfile.weeklyStudyHours} hrs</Text>
                <Text style={styles.tileDescription}>
                  3 NCERT chapters & 7 AR simulations explored this week.
                </Text>
              </View>

              {/* 4. OFFICIAL SCHOOL CIRCULARS & SYLLABUS LOG */}
              <View style={[styles.bentoTile, styles.halfTile]}>
                <View style={styles.tileHeaderRow}>
                  <Bell size={18} color={colors.parent.secondary} />
                  <View style={styles.miniTagAmber}>
                    <Text style={styles.miniTagAmberText}>NEW</Text>
                  </View>
                </View>
                <Text style={styles.tileTitle}>School Circulars</Text>
                <Text style={styles.tileDescription} numberOfLines={2}>
                  CBSE Pre-Board Practical Date-Sheet released by Principal.
                </Text>
                <Text style={styles.circularTime}>Synced 2 hours ago</Text>
              </View>
            </View>

            {/* 5. PARENTAL DIGITAL WELLBEING & STUDY TIME LIMIT TILE */}
            <View style={[styles.bentoTile, styles.parentTimeLimitTile]}>
              <View style={styles.tileHeaderRow}>
                <View style={styles.reportTitleRow}>
                  <Timer size={18} color={colors.parent.primaryLight} />
                  <Text style={styles.reportTileTitle}>Parental Session Time Limit</Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.toggleTagBtn,
                    isTimeLimitActive ? styles.toggleTagBtnActive : styles.toggleTagBtnInactive,
                  ]}
                  onPress={toggleTimeLimitActive}
                  activeOpacity={0.8}
                >
                  <Text style={styles.toggleTagBtnText}>
                    {isTimeLimitActive ? 'ACTIVE' : 'OFF'}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.tileDescription}>
                Sets a strict study time limit so your child avoids digital fatigue and does not waste excess screen time.
              </Text>

              <View style={styles.presetRow}>
                {[15, 30, 45, 60, 90].map((mins) => (
                  <TouchableOpacity
                    key={mins}
                    style={[
                      styles.presetBtn,
                      sessionTimeLimitMinutes === mins && styles.presetBtnActive,
                    ]}
                    onPress={() => setTimeLimitMinutes(mins)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.presetBtnText,
                        sessionTimeLimitMinutes === mins && styles.presetBtnTextActive,
                      ]}
                    >
                      {mins}m
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* SESSION TIME LIMIT EXPIRED BREAK MODAL */}
      <Modal
        visible={isSessionLocked}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.lockModalBackdrop}>
          <View style={styles.lockModalCard}>
            <View style={styles.lockIconCircle}>
              <Coffee size={32} color={colors.student.secondaryLight} />
            </View>
            <Text style={styles.lockModalTitle}>Study Time Limit Reached 🛑</Text>
            <Text style={styles.lockModalSub}>
              You have completed your scheduled {sessionTimeLimitMinutes}-minute focused study block. To protect your vision and concentration, take a 10-minute break.
            </Text>

            <View style={styles.parentOverrideSection}>
              <Text style={styles.parentOverrideLabel}>
                PARENT PIN OVERRIDE (+15 MINS EXTENSION):
              </Text>
              <View style={styles.overrideInputRow}>
                <TextInput
                  style={styles.overrideInput}
                  value={parentOverridePin}
                  onChangeText={setParentOverridePin}
                  placeholder="PIN: 1234"
                  placeholderTextColor={colors.text.disabled}
                  secureTextEntry
                  keyboardType="numeric"
                  maxLength={4}
                />
                <TouchableOpacity
                  style={styles.overrideSubmitBtn}
                  onPress={() => {
                    const success = unlockOrExtendSession(parentOverridePin, 15);
                    if (success) {
                      setParentOverridePin('');
                      Alert.alert('Study Session Extended', 'Added +15 minutes of study time.');
                    } else {
                      Alert.alert('Invalid PIN', 'Enter 4-digit Parent PIN (Demo: 1234).');
                    }
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.overrideSubmitBtnText}>Extend +15m</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerBar: {
    backgroundColor: colors.background,
    borderBottomColor: colors.cardBorder,
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    maxWidth: 920,
    width: '100%',
    alignSelf: 'center',
  },
  schoolInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  schoolLogoSmall: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.bentoCard,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  schoolTitleBox: {
    flex: 1,
  },
  schoolNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
  },
  schoolMetaText: {
    fontSize: 11,
    color: colors.text.muted,
    marginTop: 1,
  },
  logoutButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  identityBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bentoCard,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginTop: 12,
    gap: 10,
  },
  avatarPill: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.student.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  identityDetails: {
    flex: 1,
  },
  identityName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.primary,
  },
  identityClass: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 1,
  },
  verifiedTag: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.parent.primaryLight,
  },
  liveSyncToastBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.35)',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 8,
    gap: 8,
  },
  pulseGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  liveSyncToastText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: '#6EE7B7',
  },
  modeSwitcherContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 4,
    marginTop: 12,
    gap: 4,
  },
  modeTabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 9,
    gap: 6,
  },
  modeTabStudentActive: {
    backgroundColor: colors.student.primary,
    shadowColor: colors.student.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  modeTabParentActive: {
    backgroundColor: colors.parent.primary,
    shadowColor: colors.parent.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  modeTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.muted,
  },
  modeTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    maxWidth: 920,
    width: '100%',
    alignSelf: 'center',
  },
  bentoGrid: {
    gap: 14,
  },
  bentoTile: {
    backgroundColor: colors.bentoCard,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
  },
  heroTile: {
    backgroundColor: colors.student.cardBg,
    borderColor: colors.student.border,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.student.secondaryLight,
  },
  progressPill: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  progressPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.student.secondaryLight,
  },
  heroSubject: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 14,
    lineHeight: 24,
  },
  progressBarTrack: {
    height: 7,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.student.secondaryLight,
    borderRadius: 4,
  },
  heroBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroMilestoneSummary: {
    fontSize: 12,
    color: colors.text.muted,
  },
  actionArrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionArrowText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.student.secondaryLight,
  },
  arPreviewTile: {
    borderColor: colors.spatial.telemetryBorder,
    backgroundColor: '#0C1527',
  },
  arPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  spatialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  spatialBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.spatial.nodeActive,
    letterSpacing: 0.8,
  },
  fpsBadge: {
    backgroundColor: colors.spatial.telemetryBg,
    borderColor: colors.spatial.telemetryBorder,
    borderWidth: 0.8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  fpsText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.spatial.nodeActive,
    fontFamily: 'Menlo',
  },
  aspect169PreviewContainer: {
    aspectRatio: 16 / 9,
    width: '100%',
    maxHeight: 260,
    backgroundColor: '#060B14',
    borderRadius: 12,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    alignSelf: 'center',
  },
  wireframeGrid: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetNodeReticle: {
    alignItems: 'center',
  },
  pulseRing: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderColor: colors.student.secondaryLight,
    borderWidth: 2,
    backgroundColor: 'rgba(6, 182, 212, 0.25)',
    marginBottom: 6,
  },
  reticleLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.spatial.nodeActive,
    letterSpacing: 1,
  },
  arOverlayInfo: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.90)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderColor: colors.cardBorder,
    borderWidth: 1,
  },
  arModelTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.primary,
  },
  arModelSub: {
    fontSize: 10,
    color: colors.text.secondary,
    marginTop: 2,
  },
  arLaunchFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  arDirectiveAngle: {
    fontSize: 11,
    color: colors.text.muted,
    fontFamily: 'Menlo',
  },
  arLaunchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.student.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  arLaunchButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfTile: {
    flex: 1,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  tileHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  miniTag: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  miniTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.student.primaryLight,
  },
  tileTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: 6,
  },
  tileDescription: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 4,
    lineHeight: 15,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.student.primaryLight,
  },
  streakSubText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
    marginTop: 4,
  },
  streakStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  streakStatusText: {
    fontSize: 11,
    color: colors.parent.primaryLight,
    fontWeight: '600',
  },
  heroTileParent: {
    backgroundColor: colors.parent.cardBg,
    borderColor: colors.parent.border,
  },
  parentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  parentBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.parent.primaryLight,
    letterSpacing: 0.5,
  },
  feeStatusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  feeStatusTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  feeFiguresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  figureLabel: {
    fontSize: 11,
    color: colors.text.muted,
  },
  figureBigValue: {
    fontSize: 22,
    fontWeight: '900',
    marginTop: 2,
  },
  figureDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.cardBorder,
    marginHorizontal: 20,
  },
  parentHeroFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopColor: colors.cardBorder,
    borderTopWidth: 1,
    paddingTop: 10,
  },
  parentHeroFooterText: {
    fontSize: 11,
    color: colors.text.muted,
    flex: 1,
  },
  actionArrowGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionArrowTextGreen: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.parent.primaryLight,
  },
  reportCardTile: {
    backgroundColor: colors.bentoCard,
  },
  reportTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reportTileTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
  },
  rankPill: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  rankPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.student.secondaryLight,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 14,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
  },
  metricBox: {
    alignItems: 'center',
  },
  metricVal: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text.primary,
  },
  metricLabel: {
    fontSize: 10,
    color: colors.text.muted,
    marginTop: 2,
  },
  topSubjectPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subPill: {
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  subPillText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  miniTagGreen: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  miniTagGreenText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.parent.primaryLight,
  },
  studyHourBig: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.parent.primaryLight,
    marginTop: 4,
  },
  miniTagAmber: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  miniTagAmberText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.parent.secondary,
  },
  circularTime: {
    fontSize: 10,
    color: colors.text.disabled,
    marginTop: 8,
  },
  timeLimitBannerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 182, 212, 0.08)',
    borderColor: 'rgba(6, 182, 212, 0.25)',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 8,
  },
  timeLimitLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeLimitBannerText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.student.secondaryLight,
    fontFamily: 'Menlo',
  },
  timeLimitModeTag: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  timeLimitModeTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.student.secondaryLight,
  },
  parentTimeLimitTile: {
    backgroundColor: colors.surface,
  },
  toggleTagBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  toggleTagBtnActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  toggleTagBtnInactive: {
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
  },
  toggleTagBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.parent.primaryLight,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  presetBtn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.bentoCard,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
  },
  presetBtnActive: {
    borderColor: colors.parent.primary,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  presetBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text.muted,
  },
  presetBtnTextActive: {
    color: colors.parent.primaryLight,
    fontWeight: '800',
  },
  lockModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  lockModalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.bentoCard,
    borderColor: colors.student.secondary,
    borderWidth: 1.5,
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
  },
  lockIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  lockModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text.primary,
    textAlign: 'center',
  },
  lockModalSub: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  parentOverrideSection: {
    width: '100%',
    marginTop: 20,
    borderTopColor: colors.cardBorder,
    borderTopWidth: 1,
    paddingTop: 14,
  },
  parentOverrideLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.text.muted,
    letterSpacing: 0.8,
    marginBottom: 8,
    textAlign: 'center',
  },
  overrideInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  overrideInput: {
    flex: 1,
    height: 42,
    backgroundColor: colors.background,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: 10,
    textAlign: 'center',
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  overrideSubmitBtn: {
    backgroundColor: colors.student.primary,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  overrideSubmitBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
