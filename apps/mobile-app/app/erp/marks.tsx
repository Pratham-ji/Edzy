import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Award,
  ShieldCheck,
} from 'lucide-react-native';
import { useEdzyStore, ExamTermRecord } from '@/store/useEdzyStore';
import { useAppTheme, getCardShadow } from '@/theme/colors';

const TERM_ORDER: Record<string, number> = { PRE_BOARD: 0, MIDTERM: 1, UNIT_TEST_1: 2 };

export default function ExamMarksScreen() {
  const insets = useSafeAreaInsets();
  const { examMarks, studentProfile } = useEdzyStore();
  const { theme, isDark } = useAppTheme();
  const [selectedTermId, setSelectedTermId] = useState<string>('PRE_BOARD');

  // Chronologically sort CBSE terms: Pre-Board (92.6%) first
  const sortedExamMarks = [...examMarks].sort(
    (a, b) => (TERM_ORDER[a.termId] ?? 99) - (TERM_ORDER[b.termId] ?? 99)
  );

  const activeExam: ExamTermRecord =
    sortedExamMarks.find((e) => e.termId === selectedTermId) || sortedExamMarks[0];

  const cardShadow = getCardShadow(isDark);

  return (
    <SafeAreaView style={[styles.safeContainer, { backgroundColor: theme.canvas }]} edges={['bottom', 'left', 'right']}>
      {/* Term Filter Scroller */}
      <View
        style={[
          styles.filterBar,
          {
            backgroundColor: theme.surface,
            borderBottomColor: theme.border,
          },
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {sortedExamMarks.map((exam) => {
            const isSelected = exam.termId === activeExam.termId;
            return (
              <TouchableOpacity
                key={exam.termId}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isSelected ? theme.brandPrimary : theme.surfaceSubtle,
                    borderColor: isSelected ? theme.brandPrimary : theme.border,
                  },
                ]}
                onPress={() => setSelectedTermId(exam.termId)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: isSelected ? '#FFFFFF' : theme.textSecondary },
                    isSelected && styles.filterChipTextActive,
                  ]}
                >
                  {exam.termName}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: 16,
            paddingHorizontal: 16,
            paddingBottom: Math.max(insets.bottom, 24) + 16,
          },
        ]}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
      >
        {/* Aggregate Performance Overview Card */}
        <View
          style={[
            styles.overviewCard,
            cardShadow,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={styles.overviewTopRow}>
            <View style={[styles.overviewBadge, { backgroundColor: theme.brandTint }]}>
              <Award size={14} color={theme.brandPrimary} />
              <Text style={[styles.overviewBadgeText, { color: theme.brandPrimary }]}>CBSE MERIT SCORECARD</Text>
            </View>
            <View style={[styles.rankPill, { backgroundColor: theme.surfaceSubtle }]}>
              <Text style={[styles.rankPillText, { color: theme.textSecondary }]}>
                Rank #{activeExam.rankInClass} of {activeExam.totalStudents}
              </Text>
            </View>
          </View>

          <Text style={[styles.examMainTitle, { color: theme.textPrimary }]}>{activeExam.termName}</Text>
          <Text style={[styles.examSub, { color: theme.textMuted }]}>
            Candidate: {studentProfile.name} • {studentProfile.classGrade} (Roll #{studentProfile.rollNo})
          </Text>

          {/* Grid Stats */}
          <View style={[styles.statsGrid, { backgroundColor: theme.surfaceSubtle }]}>
            <View style={styles.statBox}>
              <Text style={[styles.statBig, { color: theme.textPrimary }]}>{activeExam.percentage}%</Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Aggregate Percentage</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
            <View style={styles.statBox}>
              <Text style={[styles.statBig, { color: theme.textPrimary }]}>
                {activeExam.totalObtained}/{activeExam.totalMax}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Total Marks Scored</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
            <View style={styles.statBox}>
              <Text style={[styles.statBig, { color: theme.success }]}>
                {activeExam.attendancePercentage}%
              </Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Term Attendance</Text>
            </View>
          </View>

          <View style={styles.endorseRow}>
            <ShieldCheck size={14} color={theme.success} />
            <Text style={[styles.endorseText, { color: theme.textSecondary }]}>
              Official CBSE Term Marksheet verified by Academic Coordinator
            </Text>
          </View>
        </View>

        {/* Individual Subject Scores */}
        <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>Subject-wise Breakdown</Text>

        <View style={styles.subjectsList}>
          {activeExam.scores.map((sc) => {
            const percent = (sc.marksObtained / sc.maxMarks) * 100;
            return (
              <View
                key={sc.subject}
                style={[
                  styles.scoreCard,
                  cardShadow,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
              >
                <View style={styles.scoreCardHeader}>
                  <View style={styles.subjectNameCol}>
                    <Text style={[styles.subjectName, { color: theme.textPrimary }]}>{sc.subject}</Text>
                    <Text style={[styles.subjectMarksRaw, { color: theme.textMuted }]}>
                      {sc.marksObtained} / {sc.maxMarks} Marks ({percent.toFixed(0)}%)
                    </Text>
                  </View>
                  <View style={[styles.gradeBadge, { backgroundColor: theme.brandTint, borderColor: theme.brandBorder }]}>
                    <Text style={[styles.gradeBadgeText, { color: theme.brandPrimary }]}>{sc.grade}</Text>
                  </View>
                </View>

                {/* Comparative Progress Bar */}
                <View style={styles.barContainer}>
                  <View style={styles.barLabelRow}>
                    <Text style={[styles.barLabelStudent, { color: theme.brandPrimary }]}>
                      Scored: {percent.toFixed(0)}%
                    </Text>
                    <Text style={[styles.barLabelAvg, { color: theme.textMuted }]}>
                      Class Avg: {sc.classAverage}%
                    </Text>
                  </View>
                  <View style={[styles.barTrack, { backgroundColor: theme.surfaceSubtle }]}>
                    <View style={[styles.barFill, { width: `${percent}%`, backgroundColor: theme.brandPrimary }]} />
                    <View style={[styles.avgTick, { left: `${sc.classAverage}%`, backgroundColor: theme.warning }]} />
                  </View>
                </View>

                {/* Teacher Remarks */}
                <View style={[styles.remarksBox, { backgroundColor: theme.surfaceSubtle }]}>
                  <Text style={[styles.remarksLabel, { color: theme.textMuted }]}>TEACHER REMARK</Text>
                  <Text style={[styles.remarksText, { color: theme.textSecondary }]}>"{sc.teacherRemarks}"</Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  filterBar: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  filterChipTextActive: {
    fontWeight: '700',
  },
  scrollContent: {
    gap: 14,
  },
  overviewCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  overviewTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  overviewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  overviewBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  rankPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rankPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  examMainTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  examSub: {
    fontSize: 12,
    marginBottom: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statBig: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: '100%',
  },
  endorseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  endorseText: {
    fontSize: 11,
    fontWeight: '500',
    flex: 1,
  },

  // Breakdown
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 2,
  },
  subjectsList: {
    gap: 12,
  },
  scoreCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  scoreCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  subjectNameCol: {
    flex: 1,
  },
  subjectName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  subjectMarksRaw: {
    fontSize: 12,
  },
  gradeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  gradeBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  barContainer: {
    marginBottom: 10,
  },
  barLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  barLabelStudent: {
    fontSize: 11,
    fontWeight: '700',
  },
  barLabelAvg: {
    fontSize: 11,
  },
  barTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  avgTick: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    zIndex: 2,
  },
  remarksBox: {
    borderRadius: 8,
    padding: 10,
  },
  remarksLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  remarksText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});
