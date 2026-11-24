import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Award,
  BookOpen,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
  GraduationCap,
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
              <Award size={14} color={colors.brand.primary} />
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
            Candidate: {studentProfile.name} • {studentProfile.classGrade} (Roll #{studentProfile.rollNo})
          </Text>

          {/* Grid Stats */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statBig}>{activeExam.percentage}%</Text>
              <Text style={styles.statLabel}>Aggregate Percentage</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statBig}>
                {activeExam.totalObtained}/{activeExam.totalMax}
              </Text>
              <Text style={styles.statLabel}>Total Marks Scored</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statBig, { color: colors.parent.primary }]}>
                {activeExam.attendancePercentage}%
              </Text>
              <Text style={styles.statLabel}>Term Attendance</Text>
            </View>
          </View>

          <View style={styles.endorseRow}>
            <ShieldCheck size={14} color={colors.parent.primary} />
            <Text style={styles.endorseText}>
              Official CBSE Term Marksheet verified by Academic Coordinator
            </Text>
          </View>
        </View>

        {/* Individual Subject Scores */}
        <Text style={styles.sectionHeading}>Subject-wise Breakdown</Text>

        <View style={styles.subjectsList}>
          {activeExam.scores.map((sc) => {
            const percent = (sc.marksObtained / sc.maxMarks) * 100;
            return (
              <View key={sc.subject} style={styles.scoreCard}>
                <View style={styles.scoreCardHeader}>
                  <View style={styles.subjectNameCol}>
                    <Text style={styles.subjectName}>{sc.subject}</Text>
                    <Text style={styles.subjectMarksRaw}>
                      {sc.marksObtained} / {sc.maxMarks} Marks ({percent.toFixed(0)}%)
                    </Text>
                  </View>
                  <View style={styles.gradeBadge}>
                    <Text style={styles.gradeBadgeText}>{sc.grade}</Text>
                  </View>
                </View>

                {/* Comparative Progress Bar */}
                <View style={styles.barContainer}>
                  <View style={styles.barLabelRow}>
                    <Text style={styles.barLabelStudent}>Scored: {percent.toFixed(0)}%</Text>
                    <Text style={styles.barLabelAvg}>Class Avg: {sc.classAverage}%</Text>
                  </View>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${percent}%` }]} />
                    <View style={[styles.avgTick, { left: `${sc.classAverage}%` }]} />
                  </View>
                </View>

                {/* Teacher Remarks */}
                <View style={styles.remarksBox}>
                  <Text style={styles.remarksLabel}>TEACHER REMARK</Text>
                  <Text style={styles.remarksText}>"{sc.teacherRemarks}"</Text>
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
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  filterChipActive: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
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
    gap: 14,
  },
  overviewCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 16,
    shadowColor: colors.shadow.color,
    shadowOffset: colors.shadow.offset,
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
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
    backgroundColor: colors.brand.tint,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  overviewBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.brand.primary,
    letterSpacing: 0.5,
  },
  rankPill: {
    backgroundColor: colors.status.successBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rankPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.status.success,
  },
  examMainTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 2,
  },
  examSub: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.surfaceBorder,
  },
  statBig: {
    fontSize: 17,
    fontWeight: '800',
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
    fontSize: 11,
    color: colors.parent.primary,
    flex: 1,
    lineHeight: 15,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: 4,
  },
  subjectsList: {
    gap: 12,
  },
  scoreCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 16,
    shadowColor: colors.shadow.color,
    shadowOffset: colors.shadow.offset,
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: 1,
  },
  scoreCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  subjectNameCol: {
    flex: 1,
  },
  subjectName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
  },
  subjectMarksRaw: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.brand.primary,
    marginTop: 2,
  },
  gradeBadge: {
    backgroundColor: colors.brand.tint,
    borderWidth: 1,
    borderColor: colors.brand.tintBorder,
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradeBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.brand.primary,
  },
  barContainer: {
    marginBottom: 12,
  },
  barLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  barLabelStudent: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.brand.primary,
  },
  barLabelAvg: {
    fontSize: 11,
    color: colors.text.muted,
  },
  barTrack: {
    height: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
    position: 'relative',
    overflow: 'visible',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.brand.primary,
    borderRadius: 4,
  },
  avgTick: {
    position: 'absolute',
    top: -2,
    bottom: -2,
    width: 2,
    backgroundColor: colors.status.warning,
    zIndex: 2,
  },
  remarksBox: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 10,
  },
  remarksLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.text.muted,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  remarksText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontStyle: 'italic',
    lineHeight: 16,
  },
});
