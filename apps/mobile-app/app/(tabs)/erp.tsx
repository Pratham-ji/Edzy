import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Wallet,
  GraduationCap,
  ChevronRight,
  CheckCircle2,
  Clock,
  Banknote,
  QrCode,
  FileText,
} from 'lucide-react-native';
import { useEdzyStore } from '@/store/useEdzyStore';
import { useAppTheme, getCardShadow } from '@/theme/colors';

const TERM_ORDER: Record<string, number> = { PRE_BOARD: 0, MIDTERM: 1, UNIT_TEST_1: 2 };

export default function ErpHubScreen() {
  const router = useRouter();
  const { feeInstallments, examMarks, studentProfile } = useEdzyStore();
  const { theme, isDark } = useAppTheme();
  const [activeTab, setActiveTab] = useState<'FEES' | 'MARKS'>('FEES');

  const totalPaid = feeInstallments
    .filter((f) => f.status === 'PAID')
    .reduce((sum, f) => sum + f.amount, 0);

  const totalDue = feeInstallments
    .filter((f) => f.status !== 'PAID')
    .reduce((sum, f) => sum + f.amount, 0);

  const allCleared = totalDue === 0;

  // Chronologically sort CBSE terms: Pre-Board (92.6%) first
  const sortedExamMarks = [...examMarks].sort(
    (a, b) => (TERM_ORDER[a.termId] ?? 99) - (TERM_ORDER[b.termId] ?? 99)
  );

  const cardShadow = getCardShadow(isDark);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.canvas }]} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.surface,
            borderBottomColor: theme.border,
          },
        ]}
      >
        <View>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
            Parent ERP Hub
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            {studentProfile.name} • {studentProfile.classGrade} (Roll #{studentProfile.rollNo})
          </Text>
        </View>
      </View>

      {/* Segmented Control */}
      <View style={[styles.tabTrackContainer, { backgroundColor: theme.canvas }]}>
        <View style={[styles.tabTrack, { backgroundColor: theme.surfaceSubtle }]}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'FEES' && [
                styles.tabButtonActive,
                { backgroundColor: theme.surface },
              ],
            ]}
            onPress={() => setActiveTab('FEES')}
            activeOpacity={0.85}
          >
            <Wallet
              size={15}
              color={activeTab === 'FEES' ? theme.brandPrimary : theme.textMuted}
            />
            <Text
              style={[
                styles.tabButtonText,
                { color: activeTab === 'FEES' ? theme.brandPrimary : theme.textMuted },
                activeTab === 'FEES' && styles.tabButtonTextActive,
              ]}
            >
              Fee Passbook
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'MARKS' && [
                styles.tabButtonActive,
                { backgroundColor: theme.surface },
              ],
            ]}
            onPress={() => setActiveTab('MARKS')}
            activeOpacity={0.85}
          >
            <GraduationCap
              size={15}
              color={activeTab === 'MARKS' ? theme.brandPrimary : theme.textMuted}
            />
            <Text
              style={[
                styles.tabButtonText,
                { color: activeTab === 'MARKS' ? theme.brandPrimary : theme.textMuted },
                activeTab === 'MARKS' && styles.tabButtonTextActive,
              ]}
            >
              Exam Marks
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 132 }]}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'FEES' ? (
          /* =========================================================================
             FEE PASSBOOK TAB CONTENT
             ========================================================================= */
          <View style={styles.contentSection}>
            {/* Summary Card */}
            <View
              style={[
                styles.card,
                cardShadow,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <View style={styles.summaryTopRow}>
                <Text style={[styles.cardSectionLabel, { color: theme.textPrimary }]}>Academic Session 2026-27</Text>
                {allCleared ? (
                  <View style={[styles.badgeSuccess, { backgroundColor: theme.successTint }]}>
                    <CheckCircle2 size={12} color={theme.success} />
                    <Text style={[styles.badgeSuccessText, { color: theme.success }]}>All Dues Cleared</Text>
                  </View>
                ) : (
                  <View style={[styles.badgeWarning, { backgroundColor: theme.warningTint }]}>
                    <Clock size={12} color={theme.warning} />
                    <Text style={[styles.badgeWarningText, { color: theme.warning }]}>Outstanding Due</Text>
                  </View>
                )}
              </View>

              <View style={[styles.feeStatsRow, { backgroundColor: theme.surfaceSubtle }]}>
                <View style={styles.feeStatItem}>
                  <Text style={[styles.feeStatLabel, { color: theme.textMuted }]}>TOTAL ANNUAL FEE</Text>
                  <Text style={[styles.feeStatValue, { color: theme.textPrimary }]}>₹48,000</Text>
                </View>
                <View style={[styles.feeStatDivider, { backgroundColor: theme.border }]} />
                <View style={styles.feeStatItem}>
                  <Text style={[styles.feeStatLabel, { color: theme.textMuted }]}>TOTAL PAID</Text>
                  <Text style={[styles.feeStatValue, { color: theme.success }]}>
                    ₹{totalPaid.toLocaleString('en-IN')}
                  </Text>
                </View>
                <View style={[styles.feeStatDivider, { backgroundColor: theme.border }]} />
                <View style={styles.feeStatItem}>
                  <Text style={[styles.feeStatLabel, { color: theme.textMuted }]}>REMAINING</Text>
                  <Text
                    style={[
                      styles.feeStatValue,
                      { color: allCleared ? theme.success : theme.danger },
                    ]}
                  >
                    ₹{totalDue.toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.primaryActionButton,
                  { backgroundColor: allCleared ? theme.brandTint : theme.success },
                ]}
                onPress={() => router.push('/erp/fees')}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.primaryActionText,
                    { color: allCleared ? theme.brandPrimary : '#FFFFFF' },
                  ]}
                >
                  {allCleared ? 'View Detailed Passbook & Receipts' : 'Pay Pending Dues via UPI'}
                </Text>
                <ChevronRight size={16} color={allCleared ? theme.brandPrimary : '#FFFFFF'} />
              </TouchableOpacity>
            </View>

            {/* Installments Breakdown List */}
            <Text style={[styles.sectionHeader, { color: theme.textPrimary }]}>Fee Installments (4 Quarters)</Text>

            <View style={styles.installmentsList}>
              {feeInstallments.map((item) => {
                const isPaid = item.status === 'PAID';

                return (
                  <View
                    key={item.id}
                    style={[
                      styles.feeRowCard,
                      cardShadow,
                      { backgroundColor: theme.surface, borderColor: theme.border },
                    ]}
                  >
                    <View style={styles.feeRowTop}>
                      <View style={styles.feeQuarterInfo}>
                        <Text style={[styles.quarterName, { color: theme.textPrimary }]}>{item.quarter}</Text>
                        <Text style={[styles.quarterDueText, { color: theme.textMuted }]}>
                          Due Date: {item.dueDate}
                        </Text>
                      </View>
                      <View style={styles.feeAmountCol}>
                        <Text style={[styles.quarterAmount, { color: theme.textPrimary }]}>
                          ₹{item.amount.toLocaleString('en-IN')}
                        </Text>
                        <View
                          style={[
                            styles.statusPill,
                            {
                              backgroundColor: isPaid ? theme.successTint : theme.dangerTint,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusPillText,
                              { color: isPaid ? theme.success : theme.danger },
                            ]}
                          >
                            {isPaid ? 'PAID' : 'PENDING'}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {isPaid && (
                      <View style={[styles.paidDetailsRow, { borderTopColor: theme.border }]}>
                        <View style={styles.paymentMethodBadge}>
                          {item.paymentMethod === 'ONLINE_UPI' ? (
                            <QrCode size={12} color={theme.brandPrimary} />
                          ) : (
                            <Banknote size={12} color={theme.success} />
                          )}
                          <Text style={[styles.paymentMethodText, { color: theme.textSecondary }]}>
                            {item.paymentMethod === 'ONLINE_UPI'
                              ? 'UPI'
                              : item.paymentMethod === 'OFFLINE_CASH'
                              ? 'Cash'
                              : item.paymentMethod === 'OFFLINE_CHEQUE'
                              ? 'Cheque'
                              : 'Paid'}{' '}
                            • {item.paidDate}
                          </Text>
                        </View>
                        {item.receiptNumber && (
                          <Text style={[styles.receiptNumberText, { color: theme.brandPrimary }]}>
                            Receipt #{item.receiptNumber.replace(/^#/, '')}
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        ) : (
          /* =========================================================================
             EXAM MARKS TAB CONTENT
             ========================================================================= */
          <View style={styles.contentSection}>
            <Text style={[styles.sectionHeader, { color: theme.textPrimary }]}>
              {(studentProfile.schoolBoard || 'CBSE').split(' ')[0].toUpperCase()} Term Examinations
            </Text>

            <View style={styles.examList}>
              {sortedExamMarks.map((exam, idx) => (
                <View
                  key={`${exam.termId}-${idx}`}
                  style={[
                    styles.examCard,
                    cardShadow,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                  ]}
                >
                  <View style={styles.examCardHeader}>
                    <View>
                      <Text style={[styles.examTermTitle, { color: theme.textPrimary }]}>{exam.termName}</Text>
                      <Text style={[styles.examTermMeta, { color: theme.textMuted }]}>
                        Session {exam.academicYear} • {studentProfile.classGrade.startsWith('Class ') ? studentProfile.classGrade : `Class ${studentProfile.classGrade}`}
                      </Text>
                    </View>
                    <View style={[styles.rankPill, { backgroundColor: theme.surfaceSubtle }]}>
                      <Text style={[styles.rankPillText, { color: theme.textSecondary }]}>
                        Rank #{exam.rankInClass} of {exam.totalStudents}
                      </Text>
                    </View>
                  </View>

                  {/* Highlights Row */}
                  <View style={[styles.examStatsRow, { backgroundColor: theme.surfaceSubtle }]}>
                    <View style={styles.examStatBox}>
                      <Text style={[styles.examStatNumber, { color: theme.textPrimary }]}>{exam.percentage}%</Text>
                      <Text style={[styles.examStatLabel, { color: theme.textMuted }]}>Aggregate</Text>
                    </View>
                    <View style={styles.examStatBox}>
                      <Text style={[styles.examStatNumber, { color: theme.textPrimary }]}>
                        {exam.totalObtained}/{exam.totalMax}
                      </Text>
                      <Text style={[styles.examStatLabel, { color: theme.textMuted }]}>Total Marks</Text>
                    </View>
                    <View style={styles.examStatBox}>
                      <Text style={[styles.examStatNumber, { color: theme.success }]}>
                        {exam.attendancePercentage}%
                      </Text>
                      <Text style={[styles.examStatLabel, { color: theme.textMuted }]}>Attendance</Text>
                    </View>
                  </View>

                  {/* Subject Scores Preview */}
                  <View style={styles.subjectListPreview}>
                    {exam.scores.map((s) => (
                      <View key={s.subject} style={[styles.subjectScoreRow, { borderBottomColor: theme.borderSubtle }]}>
                        <Text style={[styles.subjectScoreName, { color: theme.textSecondary }]}>{s.subject}</Text>
                        <View style={styles.scoreAndGrade}>
                          <Text style={[styles.subjectScoreMarks, { color: theme.textPrimary }]}>
                            {s.marksObtained}/{s.maxMarks}
                          </Text>
                          <View style={[styles.gradeBadge, { backgroundColor: theme.brandTint }]}>
                            <Text style={[styles.gradeBadgeText, { color: theme.brandPrimary }]}>{s.grade}</Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={[styles.viewFullExamButton, { borderTopColor: theme.border }]}
                    onPress={() => router.push('/erp/marks')}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.viewFullExamButtonText, { color: theme.brandPrimary }]}>
                      View Subject Breakdown & Analysis
                    </Text>
                    <ChevronRight size={14} color={theme.brandPrimary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}
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
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  tabTrackContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  tabTrack: {
    flexDirection: 'row',
    borderRadius: 25,
    padding: 3,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 22,
  },
  tabButtonActive: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  tabButtonTextActive: {
    fontWeight: '700',
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  contentSection: {
    gap: 14,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardSectionLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
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
  feeStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  feeStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  feeStatLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
  },
  feeStatValue: {
    fontSize: 15,
    fontWeight: '800',
  },
  feeStatDivider: {
    width: 1,
    height: '100%',
  },
  primaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
  },
  primaryActionText: {
    fontSize: 14,
    fontWeight: '700',
  },

  // Installments Section
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 6,
    marginBottom: 2,
  },
  installmentsList: {
    gap: 10,
  },
  feeRowCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  feeRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feeQuarterInfo: {
    flex: 1,
  },
  quarterName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  quarterDueText: {
    fontSize: 12,
  },
  feeAmountCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  quarterAmount: {
    fontSize: 16,
    fontWeight: '800',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  paidDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  paymentMethodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  paymentMethodText: {
    fontSize: 12,
    fontWeight: '500',
  },
  receiptNumberText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Exam List
  examList: {
    gap: 12,
  },
  examCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  examCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  examTermTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  examTermMeta: {
    fontSize: 12,
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
  examStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderRadius: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  examStatBox: {
    alignItems: 'center',
  },
  examStatNumber: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  examStatLabel: {
    fontSize: 11,
  },
  subjectListPreview: {
    gap: 8,
    marginBottom: 8,
  },
  subjectScoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  subjectScoreName: {
    fontSize: 13,
    fontWeight: '500',
  },
  scoreAndGrade: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subjectScoreMarks: {
    fontSize: 13,
    fontWeight: '700',
  },
  gradeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  gradeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  viewFullExamButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingTop: 12,
    marginTop: 4,
    borderTopWidth: 1,
  },
  viewFullExamButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
