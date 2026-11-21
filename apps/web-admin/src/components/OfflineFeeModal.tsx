import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Banknote,
  Building2,
  CheckCircle2,
  AlertCircle,
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
      : feeInstallments.find((f) => f.status !== 'PAID')) ||
    null;

  const [mode, setMode] = useState<'OFFLINE_CASH' | 'OFFLINE_CHEQUE'>('OFFLINE_CASH');
  const [referenceNo, setReferenceNo] = useState('');
  const [clerkNote, setClerkNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      } catch (err) {
        setIsSubmitting(false);
        alert('Failed to process fee collection.');
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center">
              <Banknote className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Offline Fee Collection Desk</h2>
              <p className="text-[11px] text-slate-400 font-medium">
                Reception Counter • {schoolProfile.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Student Info Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 tracking-wider">STUDENT</span>
              <h3 className="text-base font-bold text-slate-900">{activeInstallment.studentName}</h3>
              <p className="text-xs text-slate-600 font-medium">
                {activeInstallment.classGrade} • ID: <span className="font-mono font-semibold">{activeInstallment.studentId}</span>
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-500 tracking-wider">INSTALLMENT</span>
              <p className="text-xs font-semibold text-slate-800">{activeInstallment.quarter}</p>
              <p className="text-xl font-extrabold text-emerald-600 mt-0.5">
                ₹{activeInstallment.amount.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Payment Instrument
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode('OFFLINE_CASH')}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition ${
                  mode === 'OFFLINE_CASH'
                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/20 text-emerald-950'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    mode === 'OFFLINE_CASH' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold">Physical Cash</p>
                  <p className="text-[10px] text-slate-500">Collected at Desk Counter</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMode('OFFLINE_CHEQUE')}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition ${
                  mode === 'OFFLINE_CHEQUE'
                    ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-600/20 text-indigo-950'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    mode === 'OFFLINE_CHEQUE' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold">Bank Cheque / DD</p>
                  <p className="text-[10px] text-slate-500">Subject to Clearing</p>
                </div>
              </button>
            </div>
          </div>

          {/* Reference / Cheque Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {mode === 'OFFLINE_CHEQUE' ? 'Bank Name & Cheque Number *' : 'Cash Receipt Notes / Counter No.'}
            </label>
            <input
              type="text"
              required={mode === 'OFFLINE_CHEQUE'}
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
              placeholder={
                mode === 'OFFLINE_CHEQUE'
                  ? 'e.g. HDFC Bank, Chq #902188 (Connaught Place)'
                  : 'e.g. Counter #1 (Verified by Clerk)'
              }
              className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Internal Note */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Accounts Clerk Notes (Optional)
            </label>
            <input
              type="text"
              value={clerkNote}
              onChange={(e) => setClerkNote(e.target.value)}
              placeholder="e.g. Father visited in-person, handed receipt duplicate."
              className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Compliance notice */}
          <div className="flex items-center gap-2 p-2.5 bg-emerald-50/80 border border-emerald-200/80 rounded-lg text-[11px] text-emerald-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Generating this entry instantly assigns a verifiable <span className="font-bold">#SCH-XXXX</span> receipt number and updates the parent app in real time.
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Recording...' : `Confirm & Record ₹${activeInstallment.amount.toLocaleString('en-IN')}`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OfflineFeeModal;
