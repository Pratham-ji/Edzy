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
  AlertCircle,
  TrendingUp,
  FileText,
  CreditCard,
  Banknote,
  QrCode,
} from 'lucide-react-native';
import { useEdzyStore } from '@/store/useEdzyStore';
import { colors } from '@/theme/colors';

export default function ErpHubScreen() {
  const router = useRouter();
  const { feeInstallments, examMarks, studentProfile } = useEdzyStore();
  const [activeTab, setActiveTab] = useState<'FEES' | 'MARKS'>('FEES');

  const totalPaid = feeInstallments
    .filter((f) => f.status === 'PAID')
    .reduce((sum, f) => sum + f.amount, 0);

  const totalDue = feeInstallments
    .filter((f) => f.status !== 'PAID')
    .reduce((sum, f) => sum + f.amount, 0);

  const allCleared = totalDue === 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Parent ERP Hub</Text>
          <Text style={styles.headerSubtitle}>
            {studentProfile.name} • {studentProfile.classGrade} (Roll #{studentProfile.rollNo})
          </Text>
        </View>
      </View>

      {/* Segmented Control */}
      <View style={styles.tabTrackContainer}>
        <View style={styles.tabTrack}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'FEES' && styles.tabButtonActive]}
            onPress={() => setActiveTab('FEES')}
            activeOpacity={0.85}
          >
            <Wallet
              size={15}
              color={activeTab === 'FEES' ? colors.brand.primary : colors.text.muted}
            />
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'FEES' && styles.tabButtonTextActive,
              ]}
            >
              Fee Passbook
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'MARKS' && styles.tabButtonActive]}
            onPress={() => setActiveTab('MARKS')}
            activeOpacity={0.85}
          >
            <GraduationCap
              size={15}
              color={activeTab === 'MARKS' ? colors.brand.primary : colors.text.muted}
            />
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'MARKS' && styles.tabButtonTextActive,
              ]}
            >
              Exam Marks
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'FEES' ? (
          /* =========================================================================
             FEE PASSBOOK TAB CONTENT
             ========================================================================= */
          <View style={styles.contentSection}>
            {/* Summary Card */}
            <View style={styles.card}>
              <View style={styles.summaryTopRow}>
                <Text style={styles.cardSectionLabel}>Academic Session 2026-27</Text>
                {allCleared ? (
                  <View style={styles.badgeSuccess}>
                    <CheckCircle2 size={12} color={colors.status.success} />
                    <Text style={styles.badgeSuccessText}>All Dues Cleared</Text>
                  </View>
                ) : (
                  <View style={styles.badgeWarning}>
                    <Clock size={12} color={colors.status.warning} />
                    <Text style={styles.badgeWarningText}>Dues Outstanding</Text>
                  </View>
                )}
              </View>

              <View style={styles.feeStatsRow}>
                <View style={styles.feeStatItem}>
                  <Text style={styles.feeStatLabel}>Total Fee</Text>
                  <Text style={styles.feeStatValue}>₹48,000</Text>
                </View>
                <View style={styles.feeStatDivider} />
                <View style={styles.feeStatItem}>
                  <Text style={styles.feeStatLabel}>Paid to Date</Text>
                  <Text style={[styles.feeStatValue, { color: colors.status.success }]}>
                    ₹{totalPaid.toLocaleString('en-IN')}
                  </Text>
                </View>
                <View style={styles.feeStatDivider} />
                <View style={styles.feeStatItem}>
                  <Text style={styles.feeStatLabel}>Balance</Text>
                  <Text
                    style={[
                      styles.feeStatValue,
                      { color: allCleared ? colors.status.success : colors.status.error },
                    ]}
                  >
                    ₹{totalDue.toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.fullDetailsButton}
                onPress={() => router.push('/erp/fees')}
                activeOpacity={0.85}
              >
                <Text style={styles.fullDetailsButtonText}>
                  {allCleared ? 'View Official Receipts' : 'Pay via UPI / View Full Ledger'}
                </Text>
                <ChevronRight size={16} color={colors.brand.primary} />
              </TouchableOpacity>
            </View>

            {/* Installments List */}
            <Text style={styles.sectionHeader}>Quarterly Installments</Text>

            <View style={styles.installmentsList}>
              {feeInstallments.map((item) => {
                const isPaid = item.status === 'PAID';
                const isOverdue = item.status === 'OVERDUE';

                return (
                  <View key={item.id} style={styles.installmentCard}>
                    <View style={styles.installmentTopRow}>
                      <View>
                        <Text style={styles.quarterName}>{item.quarter}</Text>
                        <Text style={styles.dueDateText}>Due: {item.dueDate}</Text>
                      </View>
                      <View style={styles.amountStatusCol}>
                        <Text style={styles.installmentAmount}>
                          ₹{item.amount.toLocaleString('en-IN')}
                        </Text>
                        <View
                          style={[
                            styles.statusPill,
                            isPaid && styles.statusPillPaid,
                            isOverdue && styles.statusPillOverdue,
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusPillText,
                              isPaid && styles.statusPillTextPaid,
                              isOverdue && styles.statusPillTextOverdue,
                            ]}
                          >
                            {item.status}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {isPaid && (
                      <View style={styles.paymentMetaRow}>
                        <View style={styles.paymentMethodPill}>
                          {item.paymentMethod === 'OFFLINE_CASH' ? (
                            <Banknote size={12} color={colors.payment.cash} />
                          ) : item.paymentMethod === 'OFFLINE_CHEQUE' ? (
                            <CreditCard size={12} color={colors.payment.cheque} />
                          ) : (
                            <QrCode size={12} color={colors.payment.upi} />
                          )}
                          <Text style={styles.paymentMethodText}>
                            {item.paymentMethod === 'OFFLINE_CASH'
                              ? 'Cash at Desk'
                              : item.paymentMethod === 'OFFLINE_CHEQUE'
                              ? 'Bank Cheque'
                              : 'Instant UPI'}
                          </Text>
                        </View>
                        {item.receiptNumber && (
                          <Text style={styles.receiptNumberText}>
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
            <Text style={styles.sectionHeader}>CBSE Term Examinations</Text>

            <View style={styles.examList}>
              {examMarks.map((exam) => (
                <View key={exam.termId} style={styles.examCard}>
                  <View style={styles.examCardHeader}>
                    <View>
                      <Text style={styles.examTermTitle}>{exam.termName}</Text>
                      <Text style={styles.examTermMeta}>
                        Session {exam.academicYear} • Class {studentProfile.classGrade}
                      </Text>
                    </View>
                    <View style={styles.rankPill}>
                      <Text style={styles.rankPillText}>
                        Rank #{exam.rankInClass} of {exam.totalStudents}
                      </Text>
                    </View>
                  </View>

                  {/* Highlights Row */}
                  <View style={styles.examStatsRow}>
                    <View style={styles.examStatBox}>
                      <Text style={styles.examStatNumber}>{exam.percentage}%</Text>
                      <Text style={styles.examStatLabel}>Aggregate</Text>
                    </View>
                    <View style={styles.examStatBox}>
                      <Text style={styles.examStatNumber}>
                        {exam.totalObtained}/{exam.totalMax}
                      </Text>
                      <Text style={styles.examStatLabel}>Total Marks</Text>
                    </View>
                    <View style={styles.examStatBox}>
                      <Text style={[styles.examStatNumber, { color: colors.parent.primary }]}>
                        {exam.attendancePercentage}%
                      </Text>
                      <Text style={styles.examStatLabel}>Attendance</Text>
                    </View>
                  </View>

                  {/* Subject Scores Preview */}
                  <View style={styles.subjectListPreview}>
                    {exam.scores.map((s) => (
                      <View key={s.subject} style={styles.subjectScoreRow}>
                        <Text style={styles.subjectScoreName}>{s.subject}</Text>
                        <View style={styles.scoreAndGrade}>
                          <Text style={styles.subjectScoreMarks}>
                            {s.marksObtained}/{s.maxMarks}
                          </Text>
                          <View style={styles.gradeBadge}>
                            <Text style={styles.gradeBadgeText}>{s.grade}</Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={styles.viewFullExamButton}
                    onPress={() => router.push('/erp/marks')}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.viewFullExamButtonText}>
                      View Subject Breakdown & Analysis
                    </Text>
                    <ChevronRight size={14} color={colors.brand.primary} />
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
  headerSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  tabTrackContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
    backgroundColor: colors.background,
  },
  tabTrack: {
    flexDirection: 'row',
    backgroundColor: '#EAEEF4',
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
    backgroundColor: colors.surface,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.muted,
  },
  tabButtonTextActive: {
    color: colors.brand.primary,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 116,
  },
  contentSection: {
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
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardSectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.primary,
  },
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
  feeStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 14,
  },
  feeStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  feeStatDivider: {
    width: 1,
    backgroundColor: colors.surfaceBorder,
  },
  feeStatLabel: {
    fontSize: 11,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  feeStatValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text.primary,
  },
  fullDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.brand.tint,
    paddingVertical: 11,
    borderRadius: 12,
  },
  fullDetailsButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.brand.primary,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
  },
  installmentsList: {
    gap: 10,
  },
  installmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EBEBEB',
    padding: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      default: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
    }),
  },
  installmentTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  quarterName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
  },
  dueDateText: {
    fontSize: 12,
    color: colors.text.muted,
    marginTop: 2,
  },
  amountStatusCol: {
    alignItems: 'flex-end',
  },
  installmentAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text.primary,
  },
  statusPill: {
    backgroundColor: colors.status.warningBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  statusPillPaid: {
    backgroundColor: colors.status.successBg,
  },
  statusPillOverdue: {
    backgroundColor: colors.status.errorBg,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.status.warning,
  },
  statusPillTextPaid: {
    color: colors.status.success,
  },
  statusPillTextOverdue: {
    color: colors.status.error,
  },
  paymentMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  paymentMethodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  paymentMethodText: {
    fontSize: 11,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  receiptNumberText: {
    fontSize: 11,
    color: colors.text.muted,
    fontWeight: '500',
  },
  examList: {
    gap: 12,
  },
  examCard: {
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
  examCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  examTermTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
  },
  examTermMeta: {
    fontSize: 12,
    color: colors.text.muted,
    marginTop: 2,
  },
  rankPill: {
    backgroundColor: colors.brand.tint,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rankPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.brand.primary,
  },
  examStatsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  examStatBox: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  examStatNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text.primary,
  },
  examStatLabel: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 2,
  },
  subjectListPreview: {
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: 10,
    marginBottom: 10,
  },
  subjectScoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subjectScoreName: {
    fontSize: 13,
    color: colors.text.primary,
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
    color: colors.text.primary,
  },
  gradeBadge: {
    backgroundColor: colors.brand.tint,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  gradeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.brand.primary,
  },
  viewFullExamButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  viewFullExamButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.brand.primary,
  },
});
