import React, { useState } from 'react';
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
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Download,
  X,
  Lock,
  Receipt,
  Building2,
  QrCode,
  Smartphone,
  Banknote,
  FileCheck,
} from 'lucide-react-native';
import { useEdzyStore, FeeInstallment, PaymentMethod } from '@/store/useEdzyStore';
import { colors } from '@/theme/colors';

export default function FeePassbookScreen() {
  const { feeInstallments, payFeeInstallment, studentProfile } = useEdzyStore();

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
          `${res.message}\nReceipt ${res.receiptNo} has been generated and archived to your passbook.`,
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
        <View style={[styles.badge, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
          <Smartphone size={11} color={colors.payment.upi} />
          <Text style={[styles.badgeText, { color: colors.payment.upi }]}>ONLINE UPI</Text>
        </View>
      );
    }
    if (method === 'OFFLINE_CASH') {
      return (
        <View style={[styles.badge, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
          <Banknote size={11} color={colors.payment.cash} />
          <Text style={[styles.badgeText, { color: colors.payment.cash }]}>OFFLINE CASH</Text>
        </View>
      );
    }
    if (method === 'OFFLINE_CHEQUE') {
      return (
        <View style={[styles.badge, { backgroundColor: 'rgba(14, 165, 233, 0.15)' }]}>
          <Building2 size={11} color={colors.payment.cheque} />
          <Text style={[styles.badgeText, { color: colors.payment.cheque }]}>OFFLINE CHEQUE</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Passbook Summary Banner */}
        <View style={styles.summaryBanner}>
          <View style={styles.bannerHeader}>
            <View style={styles.bannerBadge}>
              <Receipt size={14} color={colors.parent.primaryLight} />
              <Text style={styles.bannerBadgeText}>HYBRID FEE LEDGER (2026-2027)</Text>
            </View>
            <View
              style={[
                styles.dueStatusPill,
                totalDue === 0 ? styles.dueStatusPaid : styles.dueStatusPending,
              ]}
            >
              <Text
                style={[
                  styles.dueStatusText,
                  totalDue === 0 ? { color: colors.parent.primaryLight } : { color: colors.status.warning },
                ]}
              >
                {totalDue === 0 ? 'ALL DUES CLEARED' : 'Q4 DUES OUTSTANDING'}
              </Text>
            </View>
          </View>

          <View style={styles.bannerFiguresRow}>
            <View style={styles.figBlock}>
              <Text style={styles.figLabel}>Total Annual Fee</Text>
              <Text style={styles.figValue}>₹48,000</Text>
            </View>
            <View style={styles.figDivider} />
            <View style={styles.figBlock}>
              <Text style={styles.figLabel}>Paid to Date</Text>
              <Text style={[styles.figValue, { color: colors.parent.primaryLight }]}>
                ₹{totalPaid.toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={styles.figDivider} />
            <View style={styles.figBlock}>
              <Text style={styles.figLabel}>Outstanding Due</Text>
              <Text
                style={[
                  styles.figValue,
                  { color: totalDue === 0 ? colors.parent.primaryLight : colors.status.warning },
                ]}
              >
                ₹{totalDue.toLocaleString('en-IN')}
              </Text>
            </View>
          </View>

          <View style={styles.verifiedRow}>
            <ShieldCheck size={14} color={colors.parent.primaryLight} />
            <Text style={styles.verifiedText}>
              All offline bank deposits & digital UPI payments verified by School Accounts Dept.
            </Text>
          </View>
        </View>

        {/* Installments List */}
        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>Quarterly Installment Breakdown</Text>
          <Text style={styles.sectionSubtitle}>
            Four term installments of ₹12,000 each covering Tuition, Science Lab, and Transport:
          </Text>

          {feeInstallments.map((installment) => {
            const isPaid = installment.status === 'PAID';
            return (
              <View
                key={installment.id}
                style={[styles.installmentCard, isPaid ? styles.cardPaid : styles.cardPending]}
              >
                <View style={styles.cardTopRow}>
                  <View style={styles.quarterInfo}>
                    <Text style={styles.quarterName}>{installment.quarter}</Text>
                    <Text style={styles.installmentAmount}>
                      ₹{installment.amount.toLocaleString('en-IN')}
                    </Text>
                  </View>

                  <View style={styles.statusBlock}>
                    {isPaid ? (
                      <View style={styles.paidStatusTag}>
                        <CheckCircle2 size={13} color={colors.parent.primaryLight} />
                        <Text style={styles.paidStatusText}>PAID</Text>
                      </View>
                    ) : (
                      <View style={styles.pendingStatusTag}>
                        <Clock size={13} color={colors.status.warning} />
                        <Text style={styles.pendingStatusText}>DUE: {installment.dueDate}</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Badges & Details */}
                <View style={styles.cardMiddleRow}>
                  {isPaid ? (
                    <>
                      <View style={styles.badgesGroup}>
                        {renderPaymentBadge(installment.paymentMethod)}
                        <Text style={styles.receiptTag}>Receipt {installment.receiptNumber}</Text>
                      </View>
                      <Text style={styles.channelDetailText}>
                        Channel: {installment.paymentChannelDetail}
                      </Text>
                      <Text style={styles.paidDateText}>Settled on {installment.paidDate}</Text>
                    </>
                  ) : (
                    <View style={styles.dueAlertBox}>
                      <Text style={styles.dueAlertTitle}>Term 4 Tuition & Board Practical Dues</Text>
                      <Text style={styles.dueAlertSub}>
                        Pay via UPI instantly to avoid late fee penalties after {installment.dueDate}.
                      </Text>
                    </View>
                  )}
                </View>

                {/* Actions */}
                <View style={styles.cardActionsRow}>
                  {isPaid ? (
                    <TouchableOpacity
                      style={styles.viewReceiptBtn}
                      onPress={() => setActiveReceiptModal(installment)}
                      activeOpacity={0.8}
                    >
                      <FileCheck size={14} color={colors.student.secondaryLight} />
                      <Text style={styles.viewReceiptBtnText}>Official School Receipt</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.payUpiBtn}
                      onPress={() => handlePayPress(installment)}
                      activeOpacity={0.85}
                    >
                      <Smartphone size={16} color="#FFFFFF" />
                      <Text style={styles.payUpiBtnText}>Pay ₹12,000 via Instant UPI</Text>
                      <ArrowRight size={14} color="#FFFFFF" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* 4-DIGIT PARENT PIN & UPI PAYMENT MODAL */}
      <Modal
        visible={Boolean(activePaymentModal)}
        transparent
        animationType="slide"
        onRequestClose={() => setActivePaymentModal(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.paymentModalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <CreditCard size={20} color={colors.parent.primaryLight} />
                <Text style={styles.modalTitle}>Edzy UPI Payment Gateway</Text>
              </View>
              <TouchableOpacity onPress={() => setActivePaymentModal(null)}>
                <X size={20} color={colors.text.muted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Settling {activePaymentModal?.quarter} for student {studentProfile.name} (
              {studentProfile.classGrade})
            </Text>

            {/* Amount Box */}
            <View style={styles.amountBox}>
              <Text style={styles.amountLabel}>AMOUNT TO PAY</Text>
              <Text style={styles.amountBig}>₹12,000</Text>
              <Text style={styles.amountSub}>Zero convenience fee for Doon Valley Public School</Text>
            </View>

            {/* UPI App Selector */}
            <Text style={styles.pinLabel}>SELECT UPI APP</Text>
            <View style={styles.upiRow}>
              {(['PHONEPE', 'GPAY', 'PAYTM'] as const).map((app) => (
                <TouchableOpacity
                  key={app}
                  style={[styles.upiAppBtn, selectedUpiApp === app && styles.upiAppBtnActive]}
                  onPress={() => setSelectedUpiApp(app)}
                >
                  <Text
                    style={[
                      styles.upiAppBtnText,
                      selectedUpiApp === app && styles.upiAppBtnTextActive,
                    ]}
                  >
                    {app}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* 4-Digit Parent PIN Input */}
            <View style={styles.pinSection}>
              <View style={styles.pinHeaderRow}>
                <Lock size={15} color={colors.parent.secondary} />
                <Text style={styles.pinLabel}>ENTER 4-DIGIT PARENT SECURITY PIN</Text>
              </View>
              <TextInput
                style={styles.pinInput}
                value={parentPin}
                onChangeText={setParentPin}
                placeholder="1234"
                placeholderTextColor={colors.text.disabled}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
              />
              <Text style={styles.pinHelperText}>
                Demo Parent PIN is pre-set to: <Text style={styles.pinHighlight}>1234</Text>
              </Text>
            </View>

            {/* Confirm Payment Button */}
            <TouchableOpacity
              style={styles.confirmPaymentBtn}
              onPress={handleConfirmPayment}
              disabled={isProcessing}
              activeOpacity={0.85}
            >
              <Text style={styles.confirmPaymentBtnText}>
                {isProcessing ? 'Verifying with NPCI/UPI...' : 'Authorize Payment of ₹12,000'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* OFFICIAL SCHOOL FEE RECEIPT MODAL */}
      <Modal
        visible={Boolean(activeReceiptModal)}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveReceiptModal(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.receiptModalCard}>
            <View style={styles.receiptHeader}>
              <View>
                <Text style={styles.receiptSchoolName}>{studentProfile.schoolName}</Text>
                <Text style={styles.receiptSchoolSub}>
                  Affiliation No: 2130842 • Sector 4, R.K. Puram, New Delhi
                </Text>
              </View>
              <TouchableOpacity onPress={() => setActiveReceiptModal(null)}>
                <X size={20} color={colors.text.muted} />
              </TouchableOpacity>
            </View>

            <View style={styles.receiptNoBadge}>
              <Text style={styles.receiptNoText}>
                OFFICIAL RECEIPT: {activeReceiptModal?.receiptNumber}
              </Text>
            </View>

            {/* Student & Term Info */}
            <View style={styles.receiptTable}>
              <View style={styles.receiptTableRow}>
                <Text style={styles.rLabel}>Student Name:</Text>
                <Text style={styles.rValue}>{studentProfile.name}</Text>
              </View>
              <View style={styles.receiptTableRow}>
                <Text style={styles.rLabel}>Admission ID / Roll:</Text>
                <Text style={styles.rValue}>
                  {studentProfile.id} / Roll #{studentProfile.rollNo}
                </Text>
              </View>
              <View style={styles.receiptTableRow}>
                <Text style={styles.rLabel}>Class & Section:</Text>
                <Text style={styles.rValue}>{studentProfile.classGrade}</Text>
              </View>
              <View style={styles.receiptTableRow}>
                <Text style={styles.rLabel}>Quarter / Term:</Text>
                <Text style={styles.rValue}>{activeReceiptModal?.quarter}</Text>
              </View>
              <View style={styles.receiptTableRow}>
                <Text style={styles.rLabel}>Payment Method:</Text>
                <Text style={styles.rValue}>{activeReceiptModal?.paymentMethod}</Text>
              </View>
              <View style={styles.receiptTableRow}>
                <Text style={styles.rLabel}>Channel Details:</Text>
                <Text style={styles.rValue} numberOfLines={1}>
                  {activeReceiptModal?.paymentChannelDetail}
                </Text>
              </View>
              <View style={styles.receiptTableRow}>
                <Text style={styles.rLabel}>Paid Date:</Text>
                <Text style={styles.rValue}>{activeReceiptModal?.paidDate}</Text>
              </View>
            </View>

            {/* Fee Breakdown */}
            <View style={styles.feeBreakdownTable}>
              <Text style={styles.breakdownTitle}>ITEMIZED PARTICULARS</Text>
              <View style={styles.feeItemRow}>
                <Text style={styles.feeItemName}>Tuition Fee (Quarterly)</Text>
                <Text style={styles.feeItemPrice}>₹9,000</Text>
              </View>
              <View style={styles.feeItemRow}>
                <Text style={styles.feeItemName}>Computer & Science Lab Maintenance</Text>
                <Text style={styles.feeItemPrice}>₹2,000</Text>
              </View>
              <View style={styles.feeItemRow}>
                <Text style={styles.feeItemName}>Campus Transport Facility</Text>
                <Text style={styles.feeItemPrice}>₹1,000</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>TOTAL AMOUNT SETTLED:</Text>
                <Text style={styles.totalPrice}>₹12,000</Text>
              </View>
            </View>

            {/* Stamp Box */}
            <View style={styles.digitalStampBox}>
              <ShieldCheck size={20} color={colors.parent.primaryLight} />
              <View>
                <Text style={styles.stampTitle}>DIGITALLY AUTHORIZED BY ACCOUNTS</Text>
                <Text style={styles.stampSub}>Doon Valley Public School ERP Seal • Valid for Tax 80C</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.downloadPdfBtn}
              onPress={() => {
                Alert.alert(
                  'Receipt Downloaded',
                  `PDF saved to device storage: Receipt_${activeReceiptModal?.receiptNumber?.replace('#', '')}.pdf`
                );
              }}
              activeOpacity={0.8}
            >
              <Download size={16} color="#FFFFFF" />
              <Text style={styles.downloadPdfBtnText}>Download Official PDF Receipt</Text>
            </TouchableOpacity>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  summaryBanner: {
    backgroundColor: colors.parent.cardBg,
    borderColor: colors.parent.border,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
  },
  bannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bannerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bannerBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.parent.primaryLight,
  },
  dueStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  dueStatusPaid: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  dueStatusPending: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  dueStatusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  bannerFiguresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.bentoCard,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  figBlock: {
    alignItems: 'center',
  },
  figLabel: {
    fontSize: 10,
    color: colors.text.muted,
  },
  figValue: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.text.primary,
    marginTop: 2,
  },
  figDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.cardBorder,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  verifiedText: {
    fontSize: 10,
    color: colors.parent.primaryLight,
    flex: 1,
  },
  listSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text.primary,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: colors.text.muted,
    marginBottom: 4,
  },
  installmentCard: {
    backgroundColor: colors.bentoCard,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  cardPaid: {
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  cardPending: {
    borderColor: 'rgba(245, 158, 11, 0.4)',
    backgroundColor: '#171B26',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  quarterInfo: {},
  quarterName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.primary,
  },
  installmentAmount: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text.primary,
    marginTop: 2,
  },
  statusBlock: {},
  paidStatusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  paidStatusText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.parent.primaryLight,
  },
  pendingStatusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pendingStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.status.warning,
  },
  cardMiddleRow: {
    borderTopColor: colors.cardBorder,
    borderTopWidth: 1,
    paddingTop: 10,
    marginBottom: 12,
    gap: 6,
  },
  badgesGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  receiptTag: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.secondary,
    fontFamily: 'Menlo',
  },
  channelDetailText: {
    fontSize: 11,
    color: colors.text.muted,
  },
  paidDateText: {
    fontSize: 10,
    color: colors.parent.primaryLight,
    fontWeight: '600',
  },
  dueAlertBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderColor: 'rgba(245, 158, 11, 0.25)',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  dueAlertTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.status.warning,
  },
  dueAlertSub: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 2,
    lineHeight: 15,
  },
  cardActionsRow: {
    borderTopColor: colors.cardBorder,
    borderTopWidth: 1,
    paddingTop: 10,
  },
  viewReceiptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
  },
  viewReceiptBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.student.secondaryLight,
  },
  payUpiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.parent.primary,
    borderRadius: 12,
    paddingVertical: 12,
    shadowColor: colors.parent.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  payUpiBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  paymentModalCard: {
    backgroundColor: colors.bentoCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    padding: 20,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text.primary,
  },
  modalSubtitle: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 4,
    marginBottom: 16,
  },
  amountBox: {
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  amountLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text.muted,
    letterSpacing: 1,
  },
  amountBig: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.parent.primaryLight,
    marginVertical: 4,
  },
  amountSub: {
    fontSize: 10,
    color: colors.text.muted,
  },
  upiRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  upiAppBtn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
  },
  upiAppBtnActive: {
    borderColor: colors.payment.upi,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
  },
  upiAppBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.secondary,
  },
  upiAppBtnTextActive: {
    color: colors.payment.upi,
  },
  pinSection: {
    marginBottom: 20,
  },
  pinHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  pinLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text.muted,
    letterSpacing: 0.8,
  },
  pinInput: {
    backgroundColor: colors.background,
    borderColor: colors.cardBorder,
    borderWidth: 1.5,
    borderRadius: 12,
    height: 48,
    textAlign: 'center',
    color: colors.text.primary,
    fontSize: 22,
    letterSpacing: 10,
    fontWeight: '800',
  },
  pinHelperText: {
    fontSize: 11,
    color: colors.text.muted,
    marginTop: 6,
    textAlign: 'center',
  },
  pinHighlight: {
    color: colors.parent.secondary,
    fontWeight: '700',
  },
  confirmPaymentBtn: {
    backgroundColor: colors.parent.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmPaymentBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  receiptModalCard: {
    margin: 20,
    backgroundColor: '#0E1726',
    borderRadius: 20,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    padding: 20,
    maxHeight: '90%',
  },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  receiptSchoolName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text.primary,
  },
  receiptSchoolSub: {
    fontSize: 10,
    color: colors.text.muted,
    marginTop: 2,
  },
  receiptNoBadge: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    borderColor: colors.student.secondary,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
    marginBottom: 14,
  },
  receiptNoText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.student.secondaryLight,
    fontFamily: 'Menlo',
  },
  receiptTable: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
    gap: 6,
  },
  receiptTableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rLabel: {
    fontSize: 11,
    color: colors.text.muted,
  },
  rValue: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text.primary,
  },
  feeBreakdownTable: {
    backgroundColor: colors.bentoCard,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
  },
  breakdownTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text.muted,
    marginBottom: 6,
  },
  feeItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  feeItemName: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  feeItemPrice: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text.primary,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopColor: colors.cardBorder,
    borderTopWidth: 1,
    paddingTop: 8,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.text.primary,
  },
  totalPrice: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.parent.primaryLight,
  },
  digitalStampBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: colors.parent.primary,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
  },
  stampTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.parent.primaryLight,
  },
  stampSub: {
    fontSize: 9,
    color: colors.text.muted,
    marginTop: 1,
  },
  downloadPdfBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.student.primary,
    borderRadius: 12,
    paddingVertical: 12,
  },
  downloadPdfBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
