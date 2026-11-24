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
import Svg, { Path, Circle, Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
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
  ChevronRight,
  Heart,
  Bell,
  ShieldCheck,
  GraduationCap,
  X,
  Download,
  Lock,
} from 'lucide-react-native';
import { useEdzyStore, SchoolCircular } from '@/store/useEdzyStore';
import { useAppTheme, getCardShadow } from '@/theme/colors';

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
    sessionRemainingSeconds,
    isTimeLimitActive,
    isSessionLocked,
    decrementSessionSecond,
    unlockOrExtendSession,
    liveSyncToast,
    clearLiveSyncToast,
    initializeMobileSync,
    circulars,
    unreadCircularsCount,
    clearUnreadCirculars,
  } = useEdzyStore();

  const { theme, isDark } = useAppTheme();
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [parentOverridePin, setParentOverridePin] = useState('');
  const [selectedCircular, setSelectedCircular] = useState<SchoolCircular | null>(null);
  const [showAllCircularsModal, setShowAllCircularsModal] = useState(false);

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

  // Filter roadmaps by subject chip
  const filteredRoadmaps = roadmaps.filter((r) => {
    if (selectedSubject === 'All') return true;
    return r.subject.toLowerCase().includes(selectedSubject.toLowerCase());
  });
  const activeRoadmap = filteredRoadmaps.find((r) => r.isCurrent) || filteredRoadmaps[0] || roadmaps[0];

  const handleParentUnlock = () => {
    if (unlockOrExtendSession(parentOverridePin, 30)) {
      setParentOverridePin('');
      Alert.alert('Session Extended', '30 additional minutes granted for study.');
    } else {
      Alert.alert('Incorrect PIN', 'Please enter valid 4-digit Parent PIN (Default: 1234).');
    }
  };

  const cardShadow = getCardShadow(isDark);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.canvas }]} edges={['top', 'left', 'right']}>
      {/* ─── LIVE SYNC TOAST ─── */}
      {liveSyncToast && (
        <View style={[styles.toastContainer, { backgroundColor: theme.success }]}>
          <CheckCircle2 size={16} color="#FFFFFF" />
          <Text style={styles.toastText} numberOfLines={1}>
            {liveSyncToast}
          </Text>
        </View>
      )}

      {/* ─── 1. COMPACT 1-ROW CONSUMER HEADER (Flagship Single-Row Standard) ─── */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <View style={styles.headerLeft}>
          <View style={[styles.avatarCircle, { backgroundColor: isStudent ? theme.brandPrimary : theme.success }]}>
            <Text style={styles.avatarText}>
              {isStudent ? (studentProfile?.name?.[0] || 'A') : (studentProfile?.parentName?.[0] || 'R')}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: theme.textPrimary }]} numberOfLines={1}>
              {isStudent
                ? `Hi, ${studentProfile?.name?.split(' ')[0] || 'Aarav'}`
                : `Hi, ${studentProfile?.parentName?.split(' ')[0] || 'Rajesh'}`}
            </Text>
            <Text style={[styles.userSub, { color: theme.textMuted }]} numberOfLines={1}>
              {studentProfile?.schoolName?.split(' ')[0] || 'Doon Valley'} • {studentProfile?.classGrade || 'Class 10-A'}
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          {isTimeLimitActive && isStudent && (
            <View style={[styles.timerPill, { backgroundColor: theme.brandTint }]}>
              <Clock size={11} color={theme.brandPrimary} />
              <Text style={[styles.timerText, { color: theme.brandPrimary }]}>
                {formatTimeRemaining(sessionRemainingSeconds)}
              </Text>
            </View>
          )}

          {/* Compact Persona Pill */}
          <TouchableOpacity
            style={[
              styles.personaPill,
              {
                backgroundColor: isStudent ? theme.brandTint : theme.successTint,
                borderColor: isStudent ? theme.brandBorder : theme.border,
              },
            ]}
            onPress={() => setActiveMode(isStudent ? 'PARENT' : 'STUDENT')}
            activeOpacity={0.75}
          >
            <Text
              style={[
                styles.personaPillText,
                { color: isStudent ? theme.brandPrimary : theme.success },
              ]}
            >
              {isStudent ? 'Student ⇄' : 'Parent ⇄'}
            </Text>
          </TouchableOpacity>

          {/* Circular Notice Bell Button */}
          <TouchableOpacity
            style={[
              styles.bellButton,
              { backgroundColor: theme.surfaceSubtle, borderColor: theme.border },
            ]}
            onPress={() => {
              clearUnreadCirculars();
              if (circulars && circulars.length > 0) {
                setShowAllCircularsModal(true);
              } else {
                Alert.alert('Notice Board', 'No new circulars issued today.');
              }
            }}
            activeOpacity={0.7}
          >
            <Bell size={16} color={theme.textSecondary} />
            {(unreadCircularsCount > 0 || (circulars && circulars.length > 0)) && (
              <View
                style={[
                  styles.bellDot,
                  {
                    backgroundColor: unreadCircularsCount > 0 ? theme.danger : theme.brandPrimary,
                  },
                ]}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 132 }]}
        showsVerticalScrollIndicator={false}
      >
        {isStudent ? (
          /* =========================================================================
             STUDENT STUDY SPACE
             ========================================================================= */
          <View style={styles.contentSection}>
            {/* Horizontal Subject Chips */}
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
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isActive ? theme.brandPrimary : theme.surface,
                        borderColor: isActive ? theme.brandPrimary : theme.border,
                      },
                    ]}
                    onPress={() => setSelectedSubject(chip)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: isActive ? '#FFFFFF' : theme.textSecondary },
                      ]}
                    >
                      {chip}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* HERO CARD: Continue Learning */}
            <View
              style={[
                styles.card,
                cardShadow,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <View style={styles.cardHeaderRow}>
                <View style={[styles.pillBadgeIndigo, { backgroundColor: theme.brandTint }]}>
                  <BookOpen size={12} color={theme.brandPrimary} />
                  <Text style={[styles.pillBadgeIndigoText, { color: theme.brandPrimary }]}>
                    {activeRoadmap?.subject || 'Science'} • Ch {activeRoadmap?.chapterNumber || 6}
                  </Text>
                </View>
                <Text style={[styles.cardMetaText, { color: theme.textMuted }]}>NCERT Class 10</Text>
              </View>

              <Text style={[styles.heroTitle, { color: theme.textPrimary }]}>
                {activeRoadmap?.title || 'Life Processes & Human Heart'}
              </Text>

              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={[styles.progressBarTrack, { backgroundColor: theme.surfaceSubtle }]}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${activeRoadmap?.progressPercent || 65}%`,
                        backgroundColor: theme.brandPrimary,
                      },
                    ]}
                  />
                </View>
                <View style={styles.progressLabelRow}>
                  <Text style={[styles.progressPercentText, { color: theme.brandPrimary }]}>
                    {activeRoadmap?.progressPercent || 65}% Mastered
                  </Text>
                  <Text style={[styles.progressSubText, { color: theme.textMuted }]}>
                    {activeRoadmap?.completedSubtopics || 3} of {activeRoadmap?.totalSubtopics || 5} topics done
                  </Text>
                </View>
              </View>

              <View style={styles.nextTopicRow}>
                <Sparkles size={12} color={theme.brandPrimary} />
                <Text style={[styles.nextTopicText, { color: theme.textSecondary }]}>
                  Next: Cardiac Cycle & Double Circulation
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: theme.brandPrimary }]}
                onPress={() => router.push('/study/roadmap')}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryButtonText}>Continue Chapter</Text>
                <ArrowRight size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* 3D VISUAL LAB SHOWCASE CARD */}
            <View
              style={[
                styles.card,
                cardShadow,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              {/* Rich Stylized SVG Holographic Heart Viewport */}
              <View style={styles.arPreviewContainer}>
                <View style={[styles.arViewportCanvas, { backgroundColor: isDark ? '#080C14' : '#111827' }]}>
                  <Svg width="100%" height="160" viewBox="0 0 320 160">
                    <Defs>
                      <RadialGradient id="heartGlow" cx="50%" cy="50%" rx="50%" ry="50%">
                        <Stop offset="0%" stopColor="#6366F1" stopOpacity="0.35" />
                        <Stop offset="60%" stopColor="#4F46E5" stopOpacity="0.12" />
                        <Stop offset="100%" stopColor="#1E1B4B" stopOpacity="0" />
                      </RadialGradient>
                      <RadialGradient id="pulseCenter" cx="50%" cy="50%" rx="50%" ry="50%">
                        <Stop offset="0%" stopColor="#EC4899" stopOpacity="0.7" />
                        <Stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
                      </RadialGradient>
                    </Defs>

                    {/* Ambient Glow */}
                    <Rect x="0" y="0" width="320" height="160" fill="url(#heartGlow)" />

                    {/* Concentric Telemetry Orbit Rings */}
                    <Circle cx="160" cy="80" r="64" stroke="#6366F1" strokeWidth="1" strokeDasharray="4,4" opacity="0.35" />
                    <Circle cx="160" cy="80" r="46" stroke="#38BDF8" strokeWidth="1" strokeDasharray="3,3" opacity="0.4" />
                    <Circle cx="160" cy="80" r="28" stroke="#A855F7" strokeWidth="1" opacity="0.45" />

                    {/* Stylized Anatomical Heart Wireframe Graphic */}
                    <Path
                      d="M160,54 C150,38 128,38 122,54 C114,75 142,98 160,114 C178,98 206,75 198,54 C192,38 170,38 160,54 Z"
                      fill="url(#pulseCenter)"
                      stroke="#818CF8"
                      strokeWidth="2"
                    />

                    {/* Aorta Arch Detail */}
                    <Path
                      d="M152,50 C152,36 168,36 168,50"
                      fill="none"
                      stroke="#F43F5E"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <Path
                      d="M146,42 L146,34 M158,40 L158,32 M168,44 L168,36"
                      stroke="#FB7185"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />

                    {/* Aorta Target Crosshair */}
                    <Circle cx="160" cy="40" r="5" stroke="#F43F5E" strokeWidth="1.5" fill="none" />
                    <Circle cx="160" cy="40" r="1.5" fill="#F43F5E" />
                  </Svg>

                  {/* Overlaid Badges */}
                  <View style={styles.arBadgeRow}>
                    <View style={styles.arModelBadge}>
                      <Boxes size={11} color="#38BDF8" />
                      <Text style={styles.arModelBadgeText}>3D Interactive</Text>
                    </View>
                    <View style={styles.arChBadge}>
                      <Text style={styles.arChBadgeText}>Ch 6 Biology</Text>
                    </View>
                  </View>

                  <View style={styles.focusAortaBadge}>
                    <Text style={styles.focusAortaText}>FOCUS: AORTA</Text>
                  </View>
                </View>
              </View>

              <View style={styles.arCardBody}>
                <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
                  Human Heart — 3D Visual Lab
                </Text>
                <Text style={[styles.cardDescription, { color: theme.textSecondary }]}>
                  Rotate, zoom, and explore chambers, valves, and blood flow in full 3D simulation.
                </Text>

                <TouchableOpacity
                  style={[
                    styles.secondaryBrandButton,
                    { backgroundColor: theme.brandTint },
                  ]}
                  onPress={() => router.push('/study/ar-lab')}
                  activeOpacity={0.85}
                >
                  <Boxes size={16} color={theme.brandPrimary} />
                  <Text style={[styles.secondaryBrandButtonText, { color: theme.brandPrimary }]}>
                    Explore in 3D
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 2-COLUMN ACTION GRID */}
            <View style={styles.quickGrid}>
              {/* Left Tile: AI Doubt Tutor */}
              <TouchableOpacity
                style={[
                  styles.gridTile,
                  cardShadow,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
                onPress={() => router.push('/study/tutor')}
                activeOpacity={0.85}
              >
                <View style={[styles.iconCircleIndigo, { backgroundColor: theme.brandTint }]}>
                  <HelpCircle size={20} color={theme.brandPrimary} />
                </View>
                <Text style={[styles.gridTileTitle, { color: theme.textPrimary }]}>AI Doubt Tutor</Text>
                <Text style={[styles.gridTileSub, { color: theme.textSecondary }]}>
                  Ask from your NCERT notes
                </Text>
                <View style={styles.gridTileAction}>
                  <Text style={[styles.gridActionTextIndigo, { color: theme.brandPrimary }]}>
                    Ask Doubts →
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Right Tile: Study Streak */}
              <View
                style={[
                  styles.gridTile,
                  cardShadow,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
              >
                <View style={[styles.iconCircleOrange, { backgroundColor: theme.streakTint }]}>
                  <Flame size={20} color={theme.streakPrimary} />
                </View>
                <Text style={[styles.gridTileTitle, { color: theme.textPrimary }]}>
                  {studentProfile.streakDays || 12} Days
                </Text>
                <Text style={[styles.gridTileSub, { color: theme.textSecondary }]}>
                  {studentProfile.weeklyStudyHours || 6.5} hrs logged this week
                </Text>
                <View style={styles.streakBadgeRow}>
                  <CheckCircle2 size={12} color={theme.success} />
                  <Text style={[styles.streakBadgeText, { color: theme.success }]}>Daily Goal Met</Text>
                </View>
              </View>
            </View>

            {/* Subtle Focus Limit Indicator Footer */}
            {isTimeLimitActive && (
              <View style={styles.focusFooter}>
                <Clock size={11} color={theme.textMuted} />
                <Text style={[styles.focusFooterText, { color: theme.textMuted }]}>
                  Focus limit active • {formatTimeRemaining(sessionRemainingSeconds)} remaining for today
                </Text>
              </View>
            )}
          </View>
        ) : (
          /* =========================================================================
             PARENT ERP MODE
             ========================================================================= */
          <View style={styles.contentSection}>
            {/* PAYMENT SUMMARY CARD */}
            <View
              style={[
                styles.card,
                cardShadow,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <View style={styles.cardHeaderRow}>
                <Text style={[styles.cardCategoryTitle, { color: theme.textPrimary }]}>
                  School Fee Summary
                </Text>
                {allFeesCleared ? (
                  <View style={[styles.badgeSuccess, { backgroundColor: theme.successTint }]}>
                    <CheckCircle2 size={12} color={theme.success} />
                    <Text style={[styles.badgeSuccessText, { color: theme.success }]}>All Dues Cleared</Text>
                  </View>
                ) : (
                  <View style={[styles.badgeWarning, { backgroundColor: theme.warningTint }]}>
                    <Clock size={12} color={theme.warning} />
                    <Text style={[styles.badgeWarningText, { color: theme.warning }]}>
                      {pendingQuarter?.quarter?.split(' ')?.[0] || 'Q4'} Due • 30 Nov
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.feeNumbersRow}>
                <View>
                  <Text style={[styles.feeLabel, { color: theme.textSecondary }]}>Outstanding Balance</Text>
                  <Text
                    style={[
                      styles.feeAmountLarge,
                      { color: allFeesCleared ? theme.success : theme.danger },
                    ]}
                  >
                    ₹{totalDue.toLocaleString('en-IN')}
                  </Text>
                </View>
                <View style={styles.feePaidColumn}>
                  <Text style={[styles.feeLabel, { color: theme.textSecondary }]}>Total Paid to Date</Text>
                  <Text style={[styles.feePaidAmount, { color: theme.success }]}>
                    ₹{totalPaid.toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  allFeesCleared ? styles.secondaryBrandButton : styles.primaryButtonEmerald,
                  { backgroundColor: allFeesCleared ? theme.brandTint : theme.success },
                ]}
                onPress={() => router.push('/erp/fees')}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.primaryButtonText,
                    allFeesCleared && { color: theme.brandPrimary },
                  ]}
                >
                  {allFeesCleared ? 'View Receipts & Passbook' : 'Pay via UPI / View Passbook'}
                </Text>
                <ChevronRight size={16} color={allFeesCleared ? theme.brandPrimary : '#FFFFFF'} />
              </TouchableOpacity>
            </View>

            {/* EXAM REPORT CARD SUMMARY */}
            <View
              style={[
                styles.card,
                cardShadow,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <View style={styles.cardHeaderRow}>
                <View style={[styles.pillBadgeEmerald, { backgroundColor: theme.successTint }]}>
                  <GraduationCap size={12} color={theme.success} />
                  <Text style={[styles.pillBadgeEmeraldText, { color: theme.success }]}>
                    {latestExam?.termName || 'Class 10 Pre-Board Examination'}
                  </Text>
                </View>
                <View style={[styles.rankBadge, { backgroundColor: theme.surfaceSubtle }]}>
                  <Text style={[styles.rankBadgeText, { color: theme.textSecondary }]}>
                    Rank #{latestExam?.rankInClass || 2} of {latestExam?.totalStudents || 42}
                  </Text>
                </View>
              </View>

              <View style={styles.examScoreRow}>
                <View>
                  <Text style={[styles.examAggregate, { color: theme.textPrimary }]}>
                    {latestExam?.percentage || 92.6}%
                  </Text>
                  <Text style={[styles.examAggregateLabel, { color: theme.textMuted }]}>
                    Overall Aggregate Score
                  </Text>
                </View>
                <View style={styles.attendanceColumn}>
                  <Text style={[styles.attendanceValue, { color: theme.success }]}>
                    {(studentProfile.attendancePct ?? latestExam?.attendancePercentage ?? 96.8)}%
                  </Text>
                  <Text style={[styles.attendanceLabel, { color: theme.textMuted }]}>Attendance</Text>
                </View>
              </View>

              {/* Subject Score Pills */}
              <View style={styles.subjectPillsRow}>
                {(latestExam?.scores || [
                  { subject: 'Mathematics', marksObtained: 96, maxMarks: 100 },
                  { subject: 'Science', marksObtained: 94, maxMarks: 100 },
                  { subject: 'English', marksObtained: 88, maxMarks: 100 },
                ])
                  .slice(0, 3)
                  .map((sc) => (
                    <View
                      key={sc.subject}
                      style={[styles.subjectPill, { backgroundColor: theme.surfaceSubtle }]}
                    >
                      <Text style={[styles.subjectPillName, { color: theme.textSecondary }]}>
                        {sc.subject.split(' ')[0]}
                      </Text>
                      <Text style={[styles.subjectPillScore, { color: theme.textPrimary }]}>
                        {sc.marksObtained}/{sc.maxMarks}
                      </Text>
                    </View>
                  ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.outlineButton,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
                onPress={() => router.push('/erp/marks')}
                activeOpacity={0.85}
              >
                <Text style={[styles.outlineButtonText, { color: theme.textSecondary }]}>
                  View Full Report Card
                </Text>
                <ChevronRight size={16} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* AT-HOME STUDY PROOF CARD */}
            <View
              style={[
                styles.card,
                cardShadow,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <View style={styles.proofHeaderRow}>
                <View style={[styles.iconCircleIndigoSmall, { backgroundColor: theme.brandTint }]}>
                  <ShieldCheck size={18} color={theme.brandPrimary} />
                </View>
                <View style={styles.proofHeaderText}>
                  <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
                    Verified At-Home Study
                  </Text>
                  <Text style={[styles.cardDescription, { color: theme.textSecondary, marginBottom: 0 }]}>
                    {studentProfile?.name || 'Aarav'} studied {studentProfile?.weeklyStudyHours || 6.5} hrs at home this week — 3 school chapters covered.
                  </Text>
                </View>
              </View>
            </View>

            {/* SCHOOL CIRCULAR / NOTICE CARD */}
            {activeCircular && (
              <PressableScale
                style={[
                  styles.card,
                  cardShadow,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                  },
                ]}
                onPress={() => setSelectedCircular(activeCircular)}
              >
                <View style={styles.cardHeaderRow}>
                  <View style={styles.noticeHeaderLeft}>
                    <Bell size={14} color={theme.brandPrimary} />
                    <Text style={[styles.cardCategoryTitle, { color: theme.textPrimary }]}>
                      Official School Circular
                    </Text>
                  </View>
                  <Text style={[styles.cardMetaText, { color: theme.textMuted }]}>
                    {activeCircular.date}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.cardTitle,
                    { color: theme.textPrimary, fontSize: 15, marginBottom: 4 },
                  ]}
                >
                  {activeCircular.title}
                </Text>
                <Text
                  style={[styles.noticeBody, { color: theme.textSecondary }]}
                  numberOfLines={2}
                >
                  {activeCircular.message}
                </Text>
                <View
                  style={[
                    styles.circularFooterRow,
                    { borderTopColor: theme.border },
                  ]}
                >
                  <Text style={[styles.circularAuthorText, { color: theme.textSecondary }]}>
                    {activeCircular.author}
                  </Text>
                  <Text style={[styles.circularActionText, { color: theme.brandPrimary }]}>
                    Read Full Circular →
                  </Text>
                </View>
              </PressableScale>
            )}
          </View>
        )}
      </ScrollView>

      {/* ─── DIGITAL WELLBEING SESSION LOCK MODAL (Only when STUDENT mode) ─── */}
      <Modal visible={isSessionLocked && isStudent} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.lockCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <View style={[styles.lockIconCircle, { backgroundColor: theme.brandTint }]}>
              <Lock size={26} color={theme.brandPrimary} />
            </View>
            <Text style={[styles.lockTitle, { color: theme.textPrimary }]}>
              Daily Focus Limit Reached
            </Text>
            <Text style={[styles.lockDescription, { color: theme.textSecondary }]}>
              Great job today! To avoid digital fatigue, this device is temporarily paused.
              Ask your parent to enter their 4-digit PIN to extend study time.
            </Text>

            {/* 4 Individual OTP Digit Boxes with Hidden Input */}
            <View style={styles.otpBoxesRow}>
              {[0, 1, 2, 3].map((idx) => {
                const char = parentOverridePin[idx];
                const isCurrent = parentOverridePin.length === idx;
                return (
                  <View
                    key={idx}
                    style={[
                      styles.otpBox,
                      {
                        backgroundColor: theme.surfaceSubtle,
                        borderColor: isCurrent ? theme.brandPrimary : theme.border,
                      },
                    ]}
                  >
                    <Text style={[styles.otpDigit, { color: theme.textPrimary }]}>
                      {char ? '●' : ''}
                    </Text>
                  </View>
                );
              })}
              <TextInput
                style={styles.hiddenPinInput}
                keyboardType="numeric"
                maxLength={4}
                value={parentOverridePin}
                onChangeText={setParentOverridePin}
                autoFocus
                caretHidden
              />
            </View>

            <TouchableOpacity
              style={[
                styles.primaryButton,
                { width: '100%', backgroundColor: theme.brandPrimary, height: 48 },
              ]}
              onPress={handleParentUnlock}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>Extend 30 Minutes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchModeLink}
              onPress={() => setActiveMode('PARENT')}
              activeOpacity={0.7}
            >
              <Text style={[styles.switchModeLinkText, { color: theme.brandPrimary }]}>
                Switch to Parent View
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ─── SCHOOL CIRCULAR NOTICE BOARD (ALL NOTICES) MODAL ─── */}
      <Modal visible={showAllCircularsModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.circularModalCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                maxHeight: '80%',
              },
            ]}
          >
            <View style={styles.circularModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    backgroundColor: theme.brandTint,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Bell size={16} color={theme.brandPrimary} />
                </View>
                <View>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: theme.textPrimary }}>
                    School Notice Board
                  </Text>
                  <Text style={{ fontSize: 11, color: theme.textMuted }}>
                    Official notices for {studentProfile.classGrade}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setShowAllCircularsModal(false)}
                style={[styles.closeButton, { backgroundColor: theme.surfaceSubtle }]}
              >
                <X size={16} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 10 }}>
              {circulars && circulars.length > 0 ? (
                circulars.map((circ, idx) => (
                  <TouchableOpacity
                    key={`${circ.id}-${idx}`}
                    activeOpacity={0.8}
                    onPress={() => {
                      setShowAllCircularsModal(false);
                      setSelectedCircular(circ);
                    }}
                    style={{
                      padding: 12,
                      borderRadius: 14,
                      backgroundColor: theme.surfaceSubtle,
                      borderColor: theme.border,
                      borderWidth: 1,
                      marginBottom: 10,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 6,
                      }}
                    >
                      <View
                        style={[
                          styles.categoryPill,
                          {
                            backgroundColor:
                              circ.category === 'EXAM'
                                ? theme.warningTint
                                : circ.category === 'HOLIDAY'
                                ? theme.dangerTint
                                : theme.brandTint,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.categoryPillText,
                            {
                              color:
                                circ.category === 'EXAM'
                                  ? theme.warning
                                  : circ.category === 'HOLIDAY'
                                  ? theme.danger
                                  : theme.brandPrimary,
                            },
                          ]}
                        >
                          {circ.category}
                        </Text>
                      </View>
                      <Text style={{ fontSize: 11, color: theme.textMuted, fontWeight: '500' }}>
                        {circ.date}
                      </Text>
                    </View>

                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: '700',
                        color: theme.textPrimary,
                        marginBottom: 4,
                      }}
                    >
                      {circ.title}
                    </Text>

                    <Text
                      style={{ fontSize: 12, color: theme.textSecondary, lineHeight: 17 }}
                      numberOfLines={2}
                    >
                      {circ.message}
                    </Text>

                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: 8,
                        paddingTop: 8,
                        borderTopWidth: 1,
                        borderTopColor: theme.border,
                      }}
                    >
                      <Text style={{ fontSize: 11, color: theme.textMuted }}>
                        Target: {circ.targetClass}
                      </Text>
                      <Text style={{ fontSize: 11, color: theme.brandPrimary, fontWeight: '600' }}>
                        Tap to Read Full Notice →
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={{ textAlign: 'center', color: theme.textMuted, padding: 20 }}>
                  No circulars currently published.
                </Text>
              )}
            </ScrollView>

            <TouchableOpacity
              style={[
                styles.primaryButton,
                { width: '100%', backgroundColor: theme.brandPrimary, marginTop: 10 },
              ]}
              onPress={() => setShowAllCircularsModal(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>Close Notice Board</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ─── SCHOOL CIRCULAR FULL VIEW MODAL ─── */}
      <Modal visible={Boolean(selectedCircular)} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.circularModalCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            <View style={styles.circularModalHeader}>
              <View
                style={[
                  styles.categoryPill,
                  {
                    backgroundColor:
                      selectedCircular?.category === 'EXAM'
                        ? theme.warningTint
                        : selectedCircular?.category === 'HOLIDAY'
                        ? theme.dangerTint
                        : theme.brandTint,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    {
                      color:
                        selectedCircular?.category === 'EXAM'
                          ? theme.warning
                          : selectedCircular?.category === 'HOLIDAY'
                          ? theme.danger
                          : theme.brandPrimary,
                    },
                  ]}
                >
                  {selectedCircular?.category} CIRCULAR
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedCircular(null)}
                style={[styles.closeButton, { backgroundColor: theme.surfaceSubtle }]}
              >
                <X size={16} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.circularModalTitle, { color: theme.textPrimary }]}>
              {selectedCircular?.title}
            </Text>
            <Text style={[styles.circularModalMeta, { color: theme.textMuted }]}>
              Issued {selectedCircular?.date} • Target: {selectedCircular?.targetClass}
            </Text>

            <View style={[styles.circularMessageBox, { backgroundColor: theme.surfaceSubtle }]}>
              <Text style={[styles.circularMessageText, { color: theme.textPrimary }]}>
                {selectedCircular?.message}
              </Text>
            </View>

            <View style={[styles.circularMetaRow, { borderTopColor: theme.border }]}>
              <Text style={[styles.circularAuthorMeta, { color: theme.textSecondary }]}>
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
                  style={styles.attachmentButton}
                >
                  <Download size={13} color={theme.brandPrimary} />
                  <Text style={[styles.attachmentText, { color: theme.brandPrimary }]}>
                    PDF Attached
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.primaryButton,
                { width: '100%', backgroundColor: theme.brandPrimary },
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
  },
  toastContainer: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 999,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
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
    borderBottomWidth: 1,
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
  },
  userSub: {
    fontSize: 12,
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
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 14,
  },
  timerText: {
    fontSize: 11,
    fontWeight: '700',
  },
  personaPill: {
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personaPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  bellButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bellDot: {
    position: 'absolute',
    top: 7,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  contentSection: {
    gap: 12,
  },

  // Subject Chips Row
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Flagship Clean Card
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
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
  },
  cardMetaText: {
    fontSize: 12,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },

  // Pills
  pillBadgeIndigo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  pillBadgeIndigoText: {
    fontSize: 12,
    fontWeight: '700',
  },
  pillBadgeEmerald: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  pillBadgeEmeraldText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Hero Card Progress
  progressContainer: {
    marginBottom: 10,
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressPercentText: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressSubText: {
    fontSize: 12,
  },
  nextTopicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  nextTopicText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Buttons
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
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
    paddingVertical: 12,
    borderRadius: 14,
  },
  secondaryBrandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
  },
  secondaryBrandButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  outlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1,
    paddingVertical: 11,
    borderRadius: 12,
    marginTop: 10,
  },
  outlineButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // AR 3D Lab Viewport
  arPreviewContainer: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
  },
  arViewportCanvas: {
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  arBadgeRow: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  arModelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
  },
  arModelBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#38BDF8',
  },
  arChBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.45)',
  },
  arChBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#C7D2FE',
  },
  focusAortaBadge: {
    position: 'absolute',
    bottom: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.70)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.4)',
  },
  focusAortaText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FDA4AF',
    letterSpacing: 0.8,
  },
  arCardBody: {
    paddingHorizontal: 2,
  },

  // 2-Column Action Grid
  quickGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  gridTile: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
  },
  iconCircleIndigo: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  iconCircleOrange: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  iconCircleIndigoSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridTileTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  gridTileSub: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 10,
  },
  gridTileAction: {
    marginTop: 'auto',
  },
  gridActionTextIndigo: {
    fontSize: 12,
    fontWeight: '700',
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
  },

  // Subtle Focus Limit Footer
  focusFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  focusFooterText: {
    fontSize: 11,
    fontWeight: '500',
  },

  // Parent ERP Fees
  badgeSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeSuccessText: {
    fontSize: 11,
    fontWeight: '700',
  },
  badgeWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeWarningText: {
    fontSize: 11,
    fontWeight: '700',
  },
  feeNumbersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginVertical: 12,
  },
  feeLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  feeAmountLarge: {
    fontSize: 24,
    fontWeight: '800',
  },
  feePaidColumn: {
    alignItems: 'flex-end',
  },
  feePaidAmount: {
    fontSize: 18,
    fontWeight: '700',
  },

  // Exam Score Card
  rankBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  rankBadgeText: {
    fontSize: 11,
    fontWeight: '700',
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
  },
  examAggregateLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  attendanceColumn: {
    alignItems: 'flex-end',
  },
  attendanceValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  attendanceLabel: {
    fontSize: 11,
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
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  subjectPillName: {
    fontSize: 11,
  },
  subjectPillScore: {
    fontSize: 12,
    fontWeight: '700',
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
    lineHeight: 18,
  },
  circularFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  circularAuthorText: {
    fontSize: 11,
    fontWeight: '600',
  },
  circularActionText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Session Lock Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  lockCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  lockIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  lockTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  lockDescription: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  otpBoxesRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
    position: 'relative',
    justifyContent: 'center',
    width: '100%',
  },
  otpBox: {
    width: 52,
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpDigit: {
    fontSize: 20,
    fontWeight: '700',
  },
  hiddenPinInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.01,
  },
  switchModeLink: {
    marginTop: 14,
    paddingVertical: 4,
  },
  switchModeLinkText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Circular View Modal
  circularModalCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 22,
    width: '100%',
    maxWidth: 420,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  circularModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  categoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularModalTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'left',
    width: '100%',
  },
  circularModalMeta: {
    fontSize: 12,
    marginBottom: 14,
    width: '100%',
  },
  circularMessageBox: {
    borderRadius: 14,
    padding: 14,
    width: '100%',
    marginBottom: 16,
  },
  circularMessageText: {
    fontSize: 13,
    lineHeight: 20,
  },
  circularMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  circularAuthorMeta: {
    fontSize: 11,
    fontWeight: '600',
  },
  attachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  attachmentText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
