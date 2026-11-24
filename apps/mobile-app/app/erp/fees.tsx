import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Download,
  X,
  Lock,
  FileText,
  Building2,
  QrCode,
  Smartphone,
  Banknote,
  FileCheck,
  Sparkles,
} from 'lucide-react-native';
import { useEdzyStore, FeeInstallment, PaymentMethod } from '@/store/useEdzyStore';
import { colors, useAppTheme } from '@/theme/colors';

export default function FeePassbookScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const { feeInstallments, payFeeInstallment, studentProfile, initializeMobileSync } = useEdzyStore();

  React.useEffect(() => {
    let cleanup: (() => void) | undefined;
    initializeMobileSync(studentProfile.id).then((c) => {
      cleanup = c;
    });
    return () => {
      cleanup?.();
    };
  }, [initializeMobileSync, studentProfile.id]);

  const [activePaymentModal, setActivePaymentModal] = useState<FeeInstallment | null>(null);
  const [parentPin, setParentPin] = useState('');
  const [selectedUpiApp, setSelectedUpiApp] = useState<'PHONEPE' | 'GPAY' | 'PAYTM'>('PHONEPE');
  const [activeReceiptModal, setActiveReceiptModal] = useState<FeeInstallment | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const totalPaid = feeInstallments
    .filter((f) => f.status === 'PAID')
    .reduce((sum, f) => sum + f.amount, 0);

  const totalDue = feeInstallments
    .filter((f) => f.status !== 'PAID')
    .reduce((sum, f) => sum + f.amount, 0);

  const allCleared = totalDue === 0;

  const handlePayPress = (installment: FeeInstallment) => {
    setActivePaymentModal(installment);
    setParentPin('');
  };

  const handleConfirmPayment = () => {
    if (!activePaymentModal) return;
    if (parentPin.length !== 4) {
      Alert.alert('Security Validation', 'Please enter your 4-digit Parent Security PIN (Demo: 1234).');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      const res = payFeeInstallment(activePaymentModal.id, parentPin);
      setIsProcessing(false);

      if (res.success) {
        setActivePaymentModal(null);
        Alert.alert(
          'Payment Successful! 🎉',
          `${res.message}\nReceipt #${(res.receiptNo || '').replace(/^#/, '')} has been generated and archived to your passbook.`,
          [
            {
              text: 'View Receipt',
              onPress: () => {
                const updated = feeInstallments.find((f) => f.id === activePaymentModal.id);
                if (updated) setActiveReceiptModal(updated);
              },
            },
            { text: 'Done', style: 'cancel' },
          ]
        );
      } else {
        Alert.alert('Payment Failed', res.message);
      }
    }, 600);
  };

  const renderPaymentBadge = (method?: PaymentMethod) => {
    if (method === 'ONLINE_UPI') {
      return (
        <View style={[styles.methodBadge, { backgroundColor: colors.payment.upiBg }]}>
          <QrCode size={12} color={colors.payment.upi} />
          <Text style={[styles.methodBadgeText, { color: colors.payment.upi }]}>Instant UPI</Text>
        </View>
      );
    }
    if (method === 'OFFLINE_CHEQUE') {
      return (
        <View style={[styles.methodBadge, { backgroundColor: colors.payment.chequeBg }]}>
          <CreditCard size={12} color={colors.payment.cheque} />
          <Text style={[styles.methodBadgeText, { color: colors.payment.cheque }]}>Bank Cheque</Text>
        </View>
      );
    }
    return (
      <View style={[styles.methodBadge, { backgroundColor: colors.payment.cashBg }]}>
        <Banknote size={12} color={colors.payment.cash} />
        <Text style={[styles.methodBadgeText, { color: colors.payment.cash }]}>Cash at Desk</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.canvas }]} edges={['bottom', 'left', 'right']}>
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
        {/* ─── SUMMARY HERO CARD (PhonePe/Groww Style) ─── */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryTopRow}>
            <View style={styles.sessionPill}>
              <FileText size={12} color={colors.parent.primary} />
              <Text style={styles.sessionPillText}>Hybrid Fee Ledger 2026-27</Text>
            </View>
            {allCleared ? (
              <View style={styles.badgeSuccess}>
                <CheckCircle2 size={12} color={colors.status.success} />
                <Text style={styles.badgeSuccessText}>All Dues Cleared</Text>
              </View>
            ) : (
              <View style={styles.badgeWarning}>
                <Clock size={12} color={colors.status.warning} />
                <Text style={styles.badgeWarningText}>Q4 Dues Outstanding</Text>
              </View>
            )}
          </View>

          <View style={styles.figuresContainer}>
            <View style={styles.figureItem}>
              <Text style={styles.figureLabel}>Total Annual Fee</Text>
              <Text style={styles.figureValue}>₹48,000</Text>
            </View>
            <View style={styles.figureDivider} />
            <View style={styles.figureItem}>
              <Text style={styles.figureLabel}>Paid to Date</Text>
              <Text style={[styles.figureValue, { color: colors.status.success }]}>
                ₹{totalPaid.toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={styles.figureDivider} />
            <View style={styles.figureItem}>
              <Text style={styles.figureLabel}>Outstanding</Text>
              <Text
                style={[
                  styles.figureValue,
                  { color: allCleared ? colors.status.success : colors.status.error },
                ]}
              >
                ₹{totalDue.toLocaleString('en-IN')}
              </Text>
            </View>
          </View>

          <View style={styles.securityRow}>
            <ShieldCheck size={14} color={colors.parent.primary} />
            <Text style={styles.securityText}>
              All offline bank deposits & digital UPI payments verified by School Accounts Dept.
            </Text>
          </View>
        </View>

        {/* ─── INSTALLMENT LIST ─── */}
        <Text style={styles.sectionTitle}>Quarterly Installment Breakdown</Text>
        <Text style={styles.sectionSubtitle}>
          Four term installments of ₹12,000 each covering Tuition, Science Lab, and Transport:
        </Text>

        <View style={styles.installmentsList}>
          {feeInstallments.map((inst) => {
            const isPaid = inst.status === 'PAID';
            const isOverdue = inst.status === 'OVERDUE';

            return (
              <View key={inst.id} style={styles.installmentCard}>
                <View style={styles.cardHeaderRow}>
                  <View style={styles.instLeftCol}>
                    <Text style={styles.quarterName}>{inst.quarter}</Text>
                    <Text style={styles.dueDateText}>Due: {inst.dueDate}</Text>
                  </View>
                  <View style={styles.instRightCol}>
                    <Text style={styles.instAmount}>
                      ₹{inst.amount.toLocaleString('en-IN')}
                    </Text>
                    <View
                      style={[
                        styles.statusPill,
                        isPaid && styles.statusPillPaid,
                        isOverdue && styles.statusPillOverdue,
                      ]}
                    >
                      {isPaid ? (
                        <CheckCircle2 size={11} color={colors.status.success} />
                      ) : (
                        <Clock size={11} color={colors.status.warning} />
                      )}
                      <Text
                        style={[
                          styles.statusPillText,
                          isPaid && styles.statusPillTextPaid,
                          isOverdue && styles.statusPillTextOverdue,
                        ]}
                      >
                        {inst.status}
                      </Text>
                    </View>
                  </View>
                </View>

                {isPaid ? (
                  <View style={styles.paidDetailsBox}>
                    <View style={styles.paidDetailsRow}>
                      {renderPaymentBadge(inst.paymentMethod)}
                      {inst.receiptNumber && (
                        <Text style={styles.receiptNumber}>Receipt #{inst.receiptNumber.replace(/^#/, '')}</Text>
                      )}
                    </View>
                    {inst.paidDate && (
                      <Text style={styles.paidDateText}>Settled on {inst.paidDate}</Text>
                    )}

                    <TouchableOpacity
                      style={styles.receiptButton}
                      onPress={() => setActiveReceiptModal(inst)}
                      activeOpacity={0.8}
                    >
                      <FileText size={14} color={colors.brand.primary} />
                      <Text style={styles.receiptButtonText}>Official School Receipt</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.pendingActionBox}>
                    <Text style={styles.pendingNote}>
                      Avoid late administrative fee of ₹500 by settling before due date.
                    </Text>
                    <TouchableOpacity
                      style={styles.payNowButton}
                      onPress={() => handlePayPress(inst)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.payNowButtonText}>Pay ₹12,000 via Instant UPI</Text>
                      <ArrowRight size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* ─── PAYMENT MODAL (Clean Light Bottom Sheet) ─── */}
      <Modal visible={Boolean(activePaymentModal)} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.paymentModalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Settle School Fee</Text>
                <Text style={styles.modalSubtitle}>
                  {activePaymentModal?.quarter} • {studentProfile.name}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setActivePaymentModal(null)}
                style={styles.closeButton}
                activeOpacity={0.7}
              >
                <X size={18} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.amountDisplay}>
              <Text style={styles.amountDisplayLabel}>Payable Amount</Text>
              <Text style={styles.amountDisplayValue}>₹12,000</Text>
            </View>

            {/* UPI App Selection */}
            <Text style={styles.inputGroupLabel}>SELECT UPI APPLICATION</Text>
            <View style={styles.upiOptionsRow}>
              {(['PHONEPE', 'GPAY', 'PAYTM'] as const).map((app) => {
                const isSelected = selectedUpiApp === app;
                return (
                  <TouchableOpacity
                    key={app}
                    style={[styles.upiAppButton, isSelected && styles.upiAppButtonActive]}
                    onPress={() => setSelectedUpiApp(app)}
                    activeOpacity={0.8}
                  >
                    <Smartphone
                      size={18}
                      color={isSelected ? colors.brand.primary : colors.text.secondary}
                    />
                    <Text style={[styles.upiAppName, isSelected && styles.upiAppNameActive]}>
                      {app === 'PHONEPE' ? 'PhonePe' : app === 'GPAY' ? 'Google Pay' : 'Paytm'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Parent PIN Input */}
            <Text style={styles.inputGroupLabel}>PARENT 4-DIGIT SECURITY PIN</Text>
            <View style={styles.pinInputWrapper}>
              <Lock size={18} color={colors.text.muted} />
              <TextInput
                style={styles.pinInput}
                placeholder="Enter 4-digit PIN (Demo: 1234)"
                placeholderTextColor={colors.text.muted}
                secureTextEntry
                keyboardType="numeric"
                maxLength={4}
                value={parentPin}
                onChangeText={setParentPin}
              />
            </View>

            <TouchableOpacity
              style={styles.confirmPayButton}
              onPress={handleConfirmPayment}
              disabled={isProcessing}
              activeOpacity={0.85}
            >
              <Text style={styles.confirmPayButtonText}>
                {isProcessing ? 'Authenticating UPI...' : 'Confirm & Pay ₹12,000'}
              </Text>
              <ArrowRight size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ─── OFFICIAL RECEIPT MODAL ─── */}
      <Modal visible={Boolean(activeReceiptModal)} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.receiptModalCard}>
            <View style={styles.receiptSchoolHeader}>
              <Building2 size={24} color={colors.brand.primary} />
              <View style={styles.receiptSchoolInfo}>
                <Text style={styles.receiptSchoolName}>{studentProfile.schoolName}</Text>
                <Text style={styles.receiptSchoolCode}>
                  Affiliation No. 2130842 • CBSE New Delhi
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setActiveReceiptModal(null)}
                style={styles.closeButton}
                activeOpacity={0.7}
              >
                <X size={18} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.receiptDivider} />

            <View style={styles.receiptMetaGrid}>
              <View style={styles.receiptMetaItem}>
                <Text style={styles.receiptMetaLabel}>RECEIPT NO.</Text>
                <Text style={styles.receiptMetaValue}>
                  {activeReceiptModal?.receiptNumber || '#EDZ-5581'}
                </Text>
              </View>
              <View style={styles.receiptMetaItem}>
                <Text style={styles.receiptMetaLabel}>DATE</Text>
                <Text style={styles.receiptMetaValue}>
                  {activeReceiptModal?.paidDate || '21 Nov 2026'}
                </Text>
              </View>
            </View>

            <View style={styles.receiptStudentCard}>
              <Text style={styles.receiptStudentName}>{studentProfile.name}</Text>
              <Text style={styles.receiptStudentMeta}>
                Class {studentProfile.classGrade} • Roll #{studentProfile.rollNo} • ID: {studentProfile.id}
              </Text>
              <Text style={styles.receiptStudentParent}>
                Parent/Guardian: {studentProfile.parentName}
              </Text>
            </View>

            <View style={styles.receiptLineItem}>
              <Text style={styles.receiptLineItemDesc}>{activeReceiptModal?.quarter}</Text>
              <Text style={styles.receiptLineItemAmt}>₹12,000.00</Text>
            </View>

            <View style={styles.receiptTotalRow}>
              <Text style={styles.receiptTotalLabel}>Total Amount Settled</Text>
              <Text style={styles.receiptTotalValue}>₹12,000.00</Text>
            </View>

            <View style={styles.receiptStampRow}>
              <FileCheck size={18} color={colors.status.success} />
              <Text style={styles.receiptStampText}>
                Digitally authenticated and verified by School Accounts Counter
              </Text>
            </View>

            <TouchableOpacity
              style={styles.downloadButton}
              onPress={() => {
                Alert.alert('Download Receipt', 'Official fee receipt PDF saved to device downloads.');
                setActiveReceiptModal(null);
              }}
              activeOpacity={0.85}
            >
              <Download size={16} color="#FFFFFF" />
              <Text style={styles.downloadButtonText}>Save Official PDF</Text>
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
  scrollContent: {
    gap: 14,
  },
  summaryCard: {
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
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sessionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.parent.cardBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sessionPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.parent.primary,
  },
  badgeSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.status.successBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
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
    borderRadius: 8,
  },
  badgeWarningText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.status.warning,
  },
  figuresContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 12,
  },
  figureItem: {
    flex: 1,
    alignItems: 'center',
  },
  figureLabel: {
    fontSize: 10,
    color: colors.text.muted,
    marginBottom: 4,
    fontWeight: '600',
  },
  figureValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text.primary,
  },
  figureDivider: {
    width: 1,
    backgroundColor: colors.surfaceBorder,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  securityText: {
    fontSize: 11,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 15,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 16,
    marginTop: -8,
  },
  installmentsList: {
    gap: 12,
  },
  installmentCard: {
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
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  instLeftCol: {},
  quarterName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
  },
  dueDateText: {
    fontSize: 12,
    color: colors.text.muted,
    marginTop: 2,
  },
  instRightCol: {
    alignItems: 'flex-end',
  },
  instAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text.primary,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.status.warningBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
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
  paidDetailsBox: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: 10,
    gap: 8,
  },
  paidDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  methodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  methodBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  receiptNumber: {
    fontSize: 11,
    color: colors.text.muted,
    fontWeight: '600',
  },
  paidDateText: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  receiptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.brand.tint,
    borderWidth: 1,
    borderColor: colors.brand.tintBorder,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  receiptButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.brand.primary,
  },
  pendingActionBox: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: 10,
    gap: 10,
  },
  pendingNote: {
    fontSize: 11,
    color: colors.status.warning,
    lineHeight: 15,
  },
  payNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.brand.primary,
    paddingVertical: 12,
    borderRadius: 10,
  },
  payNowButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  paymentModalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text.primary,
  },
  modalSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountDisplay: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  amountDisplayLabel: {
    fontSize: 11,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  amountDisplayValue: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.brand.primary,
    marginTop: 2,
  },
  inputGroupLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text.muted,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  upiOptionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  upiAppButton: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 12,
    paddingVertical: 12,
  },
  upiAppButtonActive: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.tint,
  },
  upiAppName: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  upiAppNameActive: {
    color: colors.brand.primary,
    fontWeight: '700',
  },
  pinInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 20,
    gap: 10,
  },
  pinInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text.primary,
    letterSpacing: 2,
  },
  confirmPayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.brand.primary,
    paddingVertical: 14,
    borderRadius: 12,
  },
  confirmPayButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Official Receipt Modal
  receiptModalCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    margin: 20,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  receiptSchoolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  receiptSchoolInfo: {
    flex: 1,
  },
  receiptSchoolName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text.primary,
  },
  receiptSchoolCode: {
    fontSize: 11,
    color: colors.text.muted,
    marginTop: 2,
  },
  receiptDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: 14,
  },
  receiptMetaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  receiptMetaItem: {},
  receiptMetaLabel: {
    fontSize: 10,
    color: colors.text.muted,
    fontWeight: '700',
  },
  receiptMetaValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: 2,
  },
  receiptStudentCard: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  receiptStudentName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.primary,
  },
  receiptStudentMeta: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 2,
  },
  receiptStudentParent: {
    fontSize: 11,
    color: colors.text.muted,
    marginTop: 2,
  },
  receiptLineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  receiptLineItemDesc: {
    fontSize: 13,
    color: colors.text.primary,
    fontWeight: '500',
  },
  receiptLineItemAmt: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.primary,
  },
  receiptTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  receiptTotalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text.primary,
  },
  receiptTotalValue: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.status.success,
  },
  receiptStampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.status.successBg,
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
  },
  receiptStampText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.status.success,
    flex: 1,
    lineHeight: 14,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.brand.primary,
    paddingVertical: 12,
    borderRadius: 12,
  },
  downloadButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
