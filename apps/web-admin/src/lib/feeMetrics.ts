import {
  FeeInstallmentRecord,
  SchoolProfile,
  StudentRecord,
} from '../store/useAdminStore';
import { compareClassNames } from './classScope';

export type NormalizedFeeInstrument = 'ONLINE_UPI' | 'OFFLINE_CASH' | 'OFFLINE_CHEQUE';

export interface FeeReconciliationSummary {
  totalCollected: number;
  deskCollected: number;
  cashCollected: number;
  chequeCollected: number;
  upiCollected: number;
  totalPendingDues: number;
  paidCount: number;
  pendingCount: number;
  defaultersCount: number;
}

export interface StudentFeeSummary {
  student: StudentRecord;
  installments: FeeInstallmentRecord[];
  nextPendingInstallment: FeeInstallmentRecord | null;
  latestPaidInstallment: FeeInstallmentRecord | null;
  paidCount: number;
  totalPaid: number;
  balanceDue: number;
  isFullyPaid: boolean;
  hasOverdue: boolean;
  receiptNumbersJoined: string;
}

export interface ClassCollectionReport {
  classGrade: string;
  studentCount: number;
  expectedAmount: number;
  collectedAmount: number;
  pendingAmount: number;
  collectionPct: number;
}

/** Classifies every PAID installment strictly into Online UPI, Cash, or Cheque so Cash+Cheque+UPI = 100% of Total Collected. */
export function normalizePaidInstrument(inst: FeeInstallmentRecord): NormalizedFeeInstrument {
  if (inst.paymentMethod === 'ONLINE_UPI') return 'ONLINE_UPI';
  if (inst.paymentMethod === 'OFFLINE_CHEQUE') return 'OFFLINE_CHEQUE';
  return 'OFFLINE_CASH';
}

export function computeFeeReconciliationSummary(
  feeInstallments: FeeInstallmentRecord[],
  studentSummaries?: StudentFeeSummary[]
): FeeReconciliationSummary {
  let cashCollected = 0;
  let chequeCollected = 0;
  let upiCollected = 0;
  let totalPendingDues = 0;
  let paidCount = 0;
  let pendingCount = 0;
  const defaulterStudentIds = new Set<string>();

  for (const inst of feeInstallments) {
    if (inst.status === 'PAID') {
      paidCount += 1;
      const mode = normalizePaidInstrument(inst);
      if (mode === 'ONLINE_UPI') {
        upiCollected += inst.amount;
      } else if (mode === 'OFFLINE_CHEQUE') {
        chequeCollected += inst.amount;
      } else {
        cashCollected += inst.amount;
      }
    } else {
      pendingCount += 1;
      totalPendingDues += inst.amount;
      defaulterStudentIds.add(inst.studentId);
    }
  }

  const deskCollected = cashCollected + chequeCollected;
  const totalCollected = deskCollected + upiCollected;
  const defaultersCount = studentSummaries
    ? studentSummaries.filter((s) => s.balanceDue > 0).length
    : defaulterStudentIds.size;

  return {
    totalCollected,
    deskCollected,
    cashCollected,
    chequeCollected,
    upiCollected,
    totalPendingDues,
    paidCount,
    pendingCount,
    defaultersCount,
  };
}

/** O(N + M) student ledger builder engineered to handle thousands of students cleanly without nested scans. */
export function buildStudentFeeSummaries(
  students: StudentRecord[],
  feeInstallments: FeeInstallmentRecord[]
): StudentFeeSummary[] {
  const installmentsByStudent = new Map<string, FeeInstallmentRecord[]>();
  for (const inst of feeInstallments) {
    const list = installmentsByStudent.get(inst.studentId) || [];
    list.push(inst);
    installmentsByStudent.set(inst.studentId, list);
  }

  return students.map((student) => {
    const rawList = installmentsByStudent.get(student.id) || [];
    const sortedInstallments = [...rawList].sort((a, b) =>
      a.quarter.localeCompare(b.quarter, undefined, { numeric: true })
    );

    let paidCount = 0;
    let computedPaid = 0;
    let computedDue = 0;
    let nextPendingInstallment: FeeInstallmentRecord | null = null;
    let latestPaidInstallment: FeeInstallmentRecord | null = null;
    let hasOverdue = false;
    const receipts: string[] = [];

    for (const inst of sortedInstallments) {
      if (inst.status === 'PAID') {
        paidCount += 1;
        computedPaid += inst.amount;
        latestPaidInstallment = inst;
        if (inst.receiptNumber) {
          receipts.push(inst.receiptNumber.toLowerCase());
        }
      } else {
        computedDue += inst.amount;
        if (inst.status === 'OVERDUE') {
          hasOverdue = true;
        }
        if (!nextPendingInstallment) {
          nextPendingInstallment = inst;
        }
      }
    }

    // Fallback cleanly to student balance fields only if no installments exist yet
    const totalPaid = sortedInstallments.length > 0 ? computedPaid : student.totalPaid;
    const balanceDue = sortedInstallments.length > 0 ? computedDue : student.totalPending;

    return {
      student,
      installments: sortedInstallments,
      nextPendingInstallment,
      latestPaidInstallment,
      paidCount,
      totalPaid,
      balanceDue,
      isFullyPaid: balanceDue === 0,
      hasOverdue,
      receiptNumbersJoined: receipts.join(' '),
    };
  });
}

export function computeClassWiseCollectionReport(
  studentSummaries: StudentFeeSummary[]
): ClassCollectionReport[] {
  const byClass = new Map<
    string,
    { studentCount: number; expectedAmount: number; collectedAmount: number; pendingAmount: number }
  >();

  for (const summary of studentSummaries) {
    const cls = summary.student.classGrade;
    const entry = byClass.get(cls) || {
      studentCount: 0,
      expectedAmount: 0,
      collectedAmount: 0,
      pendingAmount: 0,
    };
    const expected = summary.totalPaid + summary.balanceDue || summary.student.annualFee;
    entry.studentCount += 1;
    entry.expectedAmount += expected;
    entry.collectedAmount += summary.totalPaid;
    entry.pendingAmount += summary.balanceDue;
    byClass.set(cls, entry);
  }

  return Array.from(byClass.entries())
    .sort(([a], [b]) => compareClassNames(a, b))
    .map(([classGrade, stats]) => ({
      classGrade,
      studentCount: stats.studentCount,
      expectedAmount: stats.expectedAmount,
      collectedAmount: stats.collectedAmount,
      pendingAmount: stats.pendingAmount,
      collectionPct:
        stats.expectedAmount > 0
          ? Math.round((stats.collectedAmount / stats.expectedAmount) * 100)
          : 100,
    }));
}

export function buildWhatsAppFeeReminderUrl(
  student: StudentRecord | undefined,
  installment: Pick<FeeInstallmentRecord, 'studentId' | 'studentName' | 'classGrade' | 'quarter' | 'amount' | 'dueDate'>,
  schoolProfile: Pick<SchoolProfile, 'name'>
): string {
  const cleanPhone = (student?.parentPhone || '9811234567').replace(/\D/g, '').slice(-10);
  const parent = student?.parentName || 'Parent';
  const text = `Dear ${parent},\n\nThis is a gentle fee reminder from ${schoolProfile.name} regarding ${installment.studentName}'s (${installment.classGrade}) fee installment for ${installment.quarter}.\n\nPending Amount: ₹${installment.amount.toLocaleString('en-IN')}\nDue Date: ${installment.dueDate}\n\nYou can pay directly with 0 convenience fee via UPI on the Edzy Parent App (Student ID: ${installment.studentId}) or at the School Accounts counter.\n\nThank you,\nAccounts Bursar, ${schoolProfile.name}`;
  return `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(text)}`;
}

export function formatReceiptNumber(receiptNumber?: string): string {
  if (!receiptNumber) return '—';
  return receiptNumber.startsWith('#') ? receiptNumber : `#${receiptNumber}`;
}

export function matchesStudentFeeSearch(summary: StudentFeeSummary, rawQuery: string): boolean {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return true;
  const { student, receiptNumbersJoined } = summary;
  const normalizedPhone = student.parentPhone.toLowerCase();
  const normalizedId = student.id.toLowerCase();

  return (
    normalizedId.includes(query) ||
    student.name.toLowerCase().includes(query) ||
    student.parentName.toLowerCase().includes(query) ||
    normalizedPhone.includes(query) ||
    student.rollNo.toLowerCase().includes(query) ||
    receiptNumbersJoined.includes(query)
  );
}

/** Shared safe CSV exporter with proper quoting. */
export function downloadCsvFile(
  filename: string,
  headers: string[],
  rows: Array<Array<string | number>>
): void {
  const escapeCell = (cell: string | number) => {
    const str = String(cell ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const csvContent = [
    headers.map(escapeCell).join(','),
    ...rows.map((row) => row.map(escapeCell).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
