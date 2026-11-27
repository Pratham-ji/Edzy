import React, { useMemo, useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Banknote,
  Building2,
  Smartphone,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  Phone,
  Calendar,
} from 'lucide-react';
import { useAdminStore } from '../store/useAdminStore';
import {
  buildStudentFeeSummaries,
  computeClassWiseCollectionReport,
  computeFeeReconciliationSummary,
  downloadCsvFile,
  formatReceiptNumber,
  normalizePaidInstrument,
} from '../lib/feeMetrics';

export default function AccountsExportPage() {
  const { feeInstallments, students, schoolProfile } = useAdminStore();
  const [lastExportLabel, setLastExportLabel] = useState<string | null>(null);

  const studentSummaries = useMemo(
    () => buildStudentFeeSummaries(students, feeInstallments),
    [students, feeInstallments]
  );

  const reconciliation = useMemo(
    () => computeFeeReconciliationSummary(feeInstallments, studentSummaries),
    [feeInstallments, studentSummaries]
  );

  const classReports = useMemo(
    () => computeClassWiseCollectionReport(studentSummaries),
    [studentSummaries]
  );

  const defaulters = useMemo(
    () =>
      studentSummaries
        .filter((s) => s.balanceDue > 0)
        .sort((a, b) => b.balanceDue - a.balanceDue),
    [studentSummaries]
  );

  const todayDisplay = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const dateSlug = new Date().toISOString().split('T')[0];

  const todayStats = useMemo(() => {
    let cash = 0;
    let cheque = 0;
    let upi = 0;
    let count = 0;
    for (const inst of feeInstallments) {
      if (inst.status === 'PAID' && inst.paidDate === todayDisplay) {
        count += 1;
        const mode = normalizePaidInstrument(inst);
        if (mode === 'ONLINE_UPI') upi += inst.amount;
        else if (mode === 'OFFLINE_CHEQUE') cheque += inst.amount;
        else cash += inst.amount;
      }
    }
    return {
      cash,
      cheque,
      upi,
      total: cash + cheque + upi,
      count,
    };
  }, [feeInstallments, todayDisplay]);

  const notifyExport = (label: string) => {
    setLastExportLabel(label);
    setTimeout(() => setLastExportLabel(null), 3500);
  };

  const handleExportFullLedger = () => {
    const headers = [
      'Student ID',
      'Student Name',
      'Class',
      'Quarter',
      'Amount (INR)',
      'Mode',
      'Receipt #',
      'Status',
      'Paid Date',
      'Reference Note',
    ];
    const rows = feeInstallments.map((f) => [
      f.studentId,
      f.studentName,
      f.classGrade,
      f.quarter,
      f.amount,
      f.paymentMethod || 'PENDING',
      formatReceiptNumber(f.receiptNumber),
      f.status,
      f.paidDate || '',
      f.paymentRef || f.clerkNote || '',
    ]);
    downloadCsvFile(
      `Edzy_${schoolProfile.code}_Full_Fee_Ledger_${dateSlug}.csv`,
      headers,
      rows
    );
    notifyExport(`Exported ${rows.length} ledger rows (Tally-Ready CSV)`);
  };

  const handleExportDefaulters = () => {
    const headers = [
      'Student ID',
      'Student Name',
      'Class',
      'Roll #',
      'Parent Name',
      'Parent Phone',
      'Pending Quarters',
      'Pending Amount (INR)',
    ];
    const rows = defaulters.map((d) => [
      d.student.id,
      d.student.name,
      d.student.classGrade,
      d.student.rollNo,
      d.student.parentName,
      d.student.parentPhone,
      d.installments
        .filter((i) => i.status !== 'PAID')
        .map((i) => i.quarter)
        .join(' | '),
      d.balanceDue,
    ]);
    downloadCsvFile(
      `Edzy_${schoolProfile.code}_Pending_Defaulters_${dateSlug}.csv`,
      headers,
      rows
    );
    notifyExport(`Exported ${rows.length} pending defaulter records`);
  };

  const handleExportClassSummary = () => {
    const headers = [
      'Class',
      'Enrolled Students',
      'Expected Annual Fee (INR)',
      'Collected (INR)',
      'Pending Balance (INR)',
      'Collection %',
    ];
    const rows = classReports.map((c) => [
      c.classGrade,
      c.studentCount,
      c.expectedAmount,
      c.collectedAmount,
      c.pendingAmount,
      `${c.collectionPct}%`,
    ]);
    downloadCsvFile(
      `Edzy_${schoolProfile.code}_Class_Summary_${dateSlug}.csv`,
      headers,
      rows
    );
    notifyExport(`Exported class-wise summary across ${rows.length} classes`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              Tally & Fee Accounting Exports Hub
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#ECFDF5] dark:bg-[rgba(16,185,129,0.14)] text-[#059669] dark:text-[#34D399] border border-emerald-200 dark:border-emerald-800/50">
              {schoolProfile.code} Reconciliation Ready
            </span>
          </div>
          <p className="text-sm text-[#475569] dark:text-[#94A3B8] mt-0.5">
            Verify Cash, Cheque, and UPI settlement totals and download Tally-ready accounting sheets in one click.
          </p>
        </div>

        {lastExportLabel && (
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#ECFDF5] dark:bg-[rgba(16,185,129,0.14)] border border-emerald-200 dark:border-emerald-800/50 text-xs font-bold text-[#059669] dark:text-[#34D399]">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{lastExportLabel}</span>
          </div>
        )}
      </div>

      {/* Daily & Mode Breakdown Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#121826] p-4 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-[#475569] dark:text-[#94A3B8]">
            <span>Today ({todayDisplay})</span>
            <Calendar className="w-4 h-4 text-[#4F46E5] dark:text-[#6366F1]" />
          </div>
          <div className="text-xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
            ₹{todayStats.total.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-[#475569] dark:text-[#94A3B8]">
            {todayStats.count} receipt{todayStats.count === 1 ? '' : 's'} settled today
          </div>
        </div>

        <div className="bg-white dark:bg-[#121826] p-4 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-[#059669] dark:text-[#34D399]">
            <span>Cash Desk Total</span>
            <Banknote className="w-4 h-4" />
          </div>
          <div className="text-xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
            ₹{reconciliation.cashCollected.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-[#475569] dark:text-[#94A3B8]">
            Today: ₹{todayStats.cash.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="bg-white dark:bg-[#121826] p-4 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-cyan-700 dark:text-cyan-400">
            <span>Cheque / DD Total</span>
            <Building2 className="w-4 h-4" />
          </div>
          <div className="text-xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
            ₹{reconciliation.chequeCollected.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-[#475569] dark:text-[#94A3B8]">
            Today: ₹{todayStats.cheque.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="bg-white dark:bg-[#121826] p-4 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-[#4F46E5] dark:text-[#6366F1]">
            <span>Online UPI App Total</span>
            <Smartphone className="w-4 h-4" />
          </div>
          <div className="text-xl font-extrabold text-[#4F46E5] dark:text-[#6366F1]">
            ₹{reconciliation.upiCollected.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-[#475569] dark:text-[#94A3B8]">
            Today: ₹{todayStats.upi.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* 3 One-Click Accounting Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#121826] p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs flex flex-col justify-between gap-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#6366F1] flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
              Full Fee Ledger (Tally-Ready CSV)
            </h3>
            <p className="text-xs text-[#475569] dark:text-[#94A3B8] leading-relaxed">
              Includes Student ID ({schoolProfile.code}-...), Name, Class, Quarter, Amount, Mode, Receipt #, Status, and Paid Date for all {feeInstallments.length} entries.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportFullLedger}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#3730A3] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Full Fee Ledger (CSV)</span>
          </button>
        </div>

        <div className="bg-white dark:bg-[#121826] p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs flex flex-col justify-between gap-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] dark:bg-[rgba(245,158,11,0.14)] text-[#D97706] dark:text-[#FBBF24] flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
              Pending Defaulters List (CSV)
            </h3>
            <p className="text-xs text-[#475569] dark:text-[#94A3B8] leading-relaxed">
              Exports only the {defaulters.length} students with balance due &gt; ₹0, Parent Name, Phone, Pending Quarters, and exact Amount Due.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportDefaulters}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#D97706] hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Pending Defaulters ({defaulters.length})</span>
          </button>
        </div>

        <div className="bg-white dark:bg-[#121826] p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs flex flex-col justify-between gap-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] dark:bg-[rgba(16,185,129,0.14)] text-[#059669] dark:text-[#34D399] flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
              Class-Wise Summary Report (CSV)
            </h3>
            <p className="text-xs text-[#475569] dark:text-[#94A3B8] leading-relaxed">
              Summarizes Expected vs Collected vs Pending fee totals across all {classReports.length} active campus classes for trustee reviews.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportClassSummary}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#059669] hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Class-Wise Summary (CSV)</span>
          </button>
        </div>
      </div>

      {/* Class-Wise Collection Progress Bars + Defaulters Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Class Collection Bars (6 cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-[#121826] rounded-2xl border border-[#E2E8F0] dark:border-[#232E44] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#232E44]">
            <div>
              <h3 className="text-base font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
                Class-Wise Collection Progress
              </h3>
              <p className="text-xs text-[#475569] dark:text-[#94A3B8]">
                Live fee realization across every active section
              </p>
            </div>
            <span className="font-mono text-xs font-bold text-[#4F46E5] dark:text-[#6366F1]">
              ₹{reconciliation.totalCollected.toLocaleString('en-IN')} Total
            </span>
          </div>

          <div className="space-y-4">
            {classReports.map((cls) => (
              <div key={cls.classGrade} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">{cls.classGrade}</span>
                    <span className="text-[11px] text-[#94A3B8]">({cls.studentCount} students)</span>
                  </div>
                  <div className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                    ₹{cls.collectedAmount.toLocaleString('en-IN')} / ₹
                    {cls.expectedAmount.toLocaleString('en-IN')}{' '}
                    <span className="text-[#4F46E5] dark:text-[#6366F1] font-extrabold">
                      ({cls.collectionPct}%)
                    </span>
                  </div>
                </div>
                <div className="w-full h-2.5 rounded-full bg-[#EEF2F7] dark:bg-[#1A2336] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#4F46E5] dark:bg-[#6366F1] transition-all"
                    style={{ width: `${cls.collectionPct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#475569] dark:text-[#94A3B8]">
                  <span>Realized: ₹{cls.collectedAmount.toLocaleString('en-IN')}</span>
                  <span className="text-[#D97706] dark:text-[#FBBF24] font-semibold">
                    Pending: ₹{cls.pendingAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Defaulters Follow-Up Preview (6 cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-[#121826] rounded-2xl border border-[#E2E8F0] dark:border-[#232E44] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#232E44]">
            <div>
              <h3 className="text-base font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
                Pending Follow-Up Queue
              </h3>
              <p className="text-xs text-[#475569] dark:text-[#94A3B8]">
                Top balances ready for WhatsApp reminders or desk settlement
              </p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FFFBEB] dark:bg-[rgba(245,158,11,0.14)] text-[#D97706] dark:text-[#FBBF24]">
              {defaulters.length} Students
            </span>
          </div>

          {defaulters.length === 0 ? (
            <div className="py-10 text-center text-xs text-[#059669] dark:text-[#34D399] font-bold">
              All enrolled students have 100% settled dues!
            </div>
          ) : (
            <div className="divide-y divide-[#E2E8F0] dark:divide-[#232E44] max-h-80 overflow-y-auto">
              {defaulters.slice(0, 12).map((d) => (
                <div key={d.student.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-[#4F46E5] dark:text-[#6366F1]">
                        {d.student.id}
                      </span>
                      <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC] truncate">
                        {d.student.name}
                      </span>
                      <span className="text-[11px] text-[#94A3B8]">({d.student.classGrade})</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#475569] dark:text-[#94A3B8] mt-0.5">
                      <Phone className="w-3 h-3" />
                      <span>
                        {d.student.parentName} • +91 {d.student.parentPhone}
                      </span>
                    </div>
                  </div>
                  <span className="font-extrabold text-[#D97706] dark:text-[#FBBF24] whitespace-nowrap">
                    ₹{d.balanceDue.toLocaleString('en-IN')} Due
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
