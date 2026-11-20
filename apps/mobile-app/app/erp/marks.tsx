import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import {
  Award,
  BookOpen,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  UserCheck,
  Calendar,
  Sparkles,
} from 'lucide-react-native';
import { useEdzyStore, ExamTermRecord } from '@/store/useEdzyStore';
import { colors } from '@/theme/colors';

export default function ExamMarksScreen() {
  const { examMarks, studentProfile } = useEdzyStore();
  const [selectedTermId, setSelectedTermId] = useState<'PRE_BOARD' | 'MIDTERM' | 'UNIT_TEST_1'>(
    'PRE_BOARD'
  );

  const activeExam: ExamTermRecord =
    examMarks.find((e) => e.termId === selectedTermId) || examMarks[0];

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Term Filter Scroller */}
      <View style={styles.filterBar}>
        <Text style={styles.filterTitle}>Select Examination Term:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {examMarks.map((exam) => {
            const isSelected = exam.termId === activeExam.termId;
            return (
              <TouchableOpacity
                key={exam.termId}
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
                onPress={() => setSelectedTermId(exam.termId)}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                  {exam.termName}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Aggregate Performance Overview Card */}
        <View style={styles.overviewCard}>
          <View style={styles.overviewTopRow}>
            <View style={styles.overviewBadge}>
              <Award size={16} color={colors.student.secondaryLight} />
              <Text style={styles.overviewBadgeText}>CBSE MERIT SCORECARD</Text>
            </View>
            <View style={styles.rankPill}>
              <Text style={styles.rankPillText}>
                Rank #{activeExam.rankInClass} of {activeExam.totalStudents}
              </Text>
            </View>
          </View>

          <Text style={styles.examMainTitle}>{activeExam.termName}</Text>
          <Text style={styles.examSub}>
            Candidate: {studentProfile.name} • {studentProfile.classGrade} • Roll #{studentProfile.rollNo}
          </Text>

          {/* Grid Stats */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statBig}>{activeExam.percentage}%</Text>
              <Text style={styles.statLabel}>Aggregate Percentage</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statBig}>
                {activeExam.totalObtained}/{activeExam.totalMax}
              </Text>
              <Text style={styles.statLabel}>Total Marks Scored</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statBig}>{activeExam.attendancePercentage}%</Text>
              <Text style={styles.statLabel}>Term Attendance</Text>
            </View>
          </View>

          <View style={styles.endorseRow}>
            <ShieldCheck size={14} color={colors.parent.primaryLight} />
            <Text style={styles.endorseText}>
              Official CBSE 9-point grading system standard applied (A1 top 1/8th).
            </Text>
          </View>
        </View>

        {/* Subject Scorecards List */}
        <View style={styles.subjectsSection}>
          <Text style={styles.sectionHeader}>Subject-Wise Score Breakdown</Text>
          <Text style={styles.sectionSubtitle}>
            Comparing student marks with Class 10-A batch average & teacher observations:
          </Text>

          {activeExam.scores.map((score, idx) => {
            const studentPercent = Math.round((score.marksObtained / score.maxMarks) * 100);
            const classAvgPercent = Math.round((score.classAverage / score.maxMarks) * 100);

            return (
              <View key={idx} style={styles.scoreCard}>
                <View style={styles.scoreCardHeader}>
                  <View style={styles.subjectNameCol}>
                    <Text style={styles.subjectName}>{score.subject}</Text>
                    <Text style={styles.subjectMarksRaw}>
                      {score.marksObtained} / {score.maxMarks} Marks
                    </Text>
                  </View>

                  <View style={styles.gradeBadge}>
                    <Text style={styles.gradeBadgeText}>{score.grade}</Text>
                  </View>
                </View>

                {/* Score vs Class Average Progress Bar */}
                <View style={styles.barContainer}>
                  <View style={styles.barLabelRow}>
                    <Text style={styles.barLabelStudent}>Aarav: {score.marksObtained}</Text>
                    <Text style={styles.barLabelAvg}>Class Avg: {score.classAverage}</Text>
                  </View>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${studentPercent}%` }]} />
                    {/* Class Avg tick marker */}
                    <View style={[styles.avgTick, { left: `${classAvgPercent}%` }]} />
                  </View>
                </View>

                {/* Faculty Remarks */}
                <View style={styles.remarksBox}>
                  <Text style={styles.remarksLabel}>TEACHER REMARK:</Text>
                  <Text style={styles.remarksText}>"{score.teacherRemarks}"</Text>
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
    backgroundColor: colors.background,
  },
  filterBar: {
    backgroundColor: colors.surface,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomColor: colors.cardBorder,
    borderBottomWidth: 1,
  },
  filterTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.muted,
    paddingHorizontal: 16,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    backgroundColor: colors.bentoCard,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  filterChipActive: {
    backgroundColor: colors.student.primary,
    borderColor: colors.student.primaryLight,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  overviewCard: {
    backgroundColor: colors.bentoCard,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
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
  },
  overviewBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.student.secondaryLight,
    letterSpacing: 0.8,
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
  examMainTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text.primary,
  },
  examSub: {
    fontSize: 11,
    color: colors.text.muted,
    marginTop: 2,
    marginBottom: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statBig: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: 10,
    color: colors.text.muted,
    marginTop: 2,
    textAlign: 'center',
  },
  endorseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  endorseText: {
    fontSize: 10,
    color: colors.parent.primaryLight,
    flex: 1,
  },
  subjectsSection: {
    gap: 12,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text.primary,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: colors.text.muted,
    marginBottom: 4,
  },
  scoreCard: {
    backgroundColor: colors.bentoCard,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  scoreCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  subjectNameCol: {},
  subjectName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
  },
  subjectMarksRaw: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.student.secondaryLight,
    marginTop: 2,
  },
  gradeBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderColor: colors.student.primary,
    borderWidth: 1,
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradeBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.student.primaryLight,
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
    fontSize: 10,
    fontWeight: '700',
    color: colors.student.secondaryLight,
  },
  barLabelAvg: {
    fontSize: 10,
    color: colors.text.muted,
  },
  barTrack: {
    height: 7,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 4,
    position: 'relative',
    overflow: 'visible',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.student.secondaryLight,
    borderRadius: 4,
  },
  avgTick: {
    position: 'absolute',
    top: -3,
    bottom: -3,
    width: 2,
    backgroundColor: colors.status.warning,
    zIndex: 2,
  },
  remarksBox: {
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: 10,
    padding: 8,
  },
  remarksLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.text.muted,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  remarksText: {
    fontSize: 11,
    color: colors.text.secondary,
    fontStyle: 'italic',
    lineHeight: 15,
  },
});
