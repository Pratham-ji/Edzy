import React, { useState, useEffect } from 'react';
import {
  X,
  Banknote,
  Building2,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { useAdminStore, FeeInstallmentRecord } from '../store/useAdminStore';

interface OfflineFeeModalProps {
  installment?: FeeInstallmentRecord | null;
  preselectedStudentId?: string;
  onClose: () => void;
  onSuccess?: (receiptInfo: { receiptNumber: string; studentName: string; amount: number }) => void;
}

export const OfflineFeeModal: React.FC<OfflineFeeModalProps> = ({
  installment,
  preselectedStudentId,
  onClose,
  onSuccess,
}) => {
  const { collectOfflineFee, schoolProfile, feeInstallments } = useAdminStore();

  const activeInstallment =
    installment ||
    (preselectedStudentId
      ? feeInstallments.find((f) => f.studentId === preselectedStudentId && f.status !== 'PAID')
      : null);

  const [mode, setMode] = useState<'OFFLINE_CASH' | 'OFFLINE_CHEQUE'>('OFFLINE_CASH');
  const [referenceNo, setReferenceNo] = useState('');
  const [clerkNote, setClerkNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!activeInstallment) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      try {
        const result = collectOfflineFee(activeInstallment.id, mode, referenceNo, clerkNote);
        setIsSubmitting(false);
        if (onSuccess) {
          onSuccess(result);
        } else {
          onClose();
        }
      } catch {
        setIsSubmitting(false);
        alert('Failed to process fee collection.');
      }
    }, 250);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#121826] rounded-2xl shadow-2xl max-w-lg w-full max-h-[92dvh] flex flex-col border border-[#E2E8F0] dark:border-[#232E44] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-white dark:bg-[#0D1320] border-b border-[#E2E8F0] dark:border-[#232E44] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] dark:bg-[rgba(16,185,129,0.14)] border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center">
              <Banknote className="w-4 h-4 text-[#059669] dark:text-[#34D399]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
                Accounts Fee Collection Desk
              </h2>
              <p className="text-[11px] text-[#475569] dark:text-[#94A3B8] font-medium">
                {schoolProfile.name} • Instant Mobile Sync
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close fee collection dialog"
            className="text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white transition p-1 rounded-md cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Student Info Card with Prominent ID Pill */}
          <div className="bg-[#F6F8FC] dark:bg-[#090D16] border border-[#E2E8F0] dark:border-[#232E44] rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="inline-flex items-center whitespace-nowrap px-2 py-0.5 rounded-md font-mono font-extrabold text-[11px] bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#6366F1] border border-[#C7D2FE] dark:border-[#3730A3]">
                {activeInstallment.studentId}
              </span>
              <h3 className="text-base font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
                {activeInstallment.studentName}
              </h3>
              <p className="text-xs text-[#475569] dark:text-[#94A3B8] font-medium">
                {activeInstallment.classGrade}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">
                INSTALLMENT
              </span>
              <p className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                {activeInstallment.quarter}
              </p>
              <p className="text-xl font-extrabold text-[#059669] dark:text-[#34D399] mt-0.5">
                ₹{activeInstallment.amount.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-wider mb-2">
              Select Payment Instrument
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode('OFFLINE_CASH')}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition cursor-pointer ${
                  mode === 'OFFLINE_CASH'
                    ? 'border-[#059669] bg-[#ECFDF5] dark:bg-[rgba(16,185,129,0.14)] ring-2 ring-emerald-500/20 text-[#0F172A] dark:text-[#F8FAFC]'
                    : 'border-[#E2E8F0] dark:border-[#232E44] hover:bg-[#F6F8FC] dark:hover:bg-[#1A2336] text-[#475569] dark:text-[#94A3B8]'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    mode === 'OFFLINE_CASH'
                      ? 'bg-[#059669] text-white'
                      : 'bg-[#EEF2F7] dark:bg-[#1A2336] text-[#475569] dark:text-[#94A3B8]'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold">Physical Cash</p>
                  <p className="text-[10px] text-[#475569] dark:text-[#94A3B8]">Collected at Counter</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMode('OFFLINE_CHEQUE')}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition cursor-pointer ${
                  mode === 'OFFLINE_CHEQUE'
                    ? 'border-[#4F46E5] bg-[#EEF2FF] dark:bg-[#1B2440] ring-2 ring-indigo-500/20 text-[#0F172A] dark:text-[#F8FAFC]'
                    : 'border-[#E2E8F0] dark:border-[#232E44] hover:bg-[#F6F8FC] dark:hover:bg-[#1A2336] text-[#475569] dark:text-[#94A3B8]'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    mode === 'OFFLINE_CHEQUE'
                      ? 'bg-[#4F46E5] text-white'
                      : 'bg-[#EEF2F7] dark:bg-[#1A2336] text-[#475569] dark:text-[#94A3B8]'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold">Bank Cheque / DD</p>
                  <p className="text-[10px] text-[#475569] dark:text-[#94A3B8]">Subject to Clearing</p>
                </div>
              </button>
            </div>
          </div>

          {/* Reference / Cheque Input */}
          <div>
            <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">
              {mode === 'OFFLINE_CHEQUE'
                ? 'Bank Name & Cheque Number *'
                : 'Cash Receipt Notes / Counter No.'}
            </label>
            <input
              type="text"
              required={mode === 'OFFLINE_CHEQUE'}
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
              placeholder={
                mode === 'OFFLINE_CHEQUE'
                  ? 'e.g. HDFC Bank, Chq #902188'
                  : 'e.g. Counter #1 (Verified by Accounts Officer)'
              }
              className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] bg-[#F6F8FC] dark:bg-[#1A2336] text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
            />
          </div>

          {/* Internal Note */}
          <div>
            <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">
              Accounts Reference Note (Optional)
            </label>
            <input
              type="text"
              value={clerkNote}
              onChange={(e) => setClerkNote(e.target.value)}
              placeholder="e.g. Parent collected duplicate receipt at desk."
              className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] bg-[#F6F8FC] dark:bg-[#1A2336] text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
            />
          </div>

          {/* Compliance notice */}
          <div className="flex items-center gap-2 p-3 bg-[#ECFDF5] dark:bg-[rgba(16,185,129,0.14)] border border-emerald-200 dark:border-emerald-800/50 rounded-xl text-[11px] text-[#059669] dark:text-[#34D399]">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>
              Assigns a verifiable <span className="font-bold font-mono">#{schoolProfile.code}-XXXX</span> receipt number and flips the Parent Mobile App to <span className="font-bold">PAID</span> in real time.
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#E2E8F0] dark:border-[#232E44]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#E2E8F0] dark:border-[#232E44] rounded-xl text-xs font-bold text-[#475569] dark:text-[#94A3B8] hover:bg-[#EEF2F7] dark:hover:bg-[#1A2336] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#059669] hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? 'Recording...'
                  : `Confirm & Record ₹${activeInstallment.amount.toLocaleString('en-IN')}`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OfflineFeeModal;
