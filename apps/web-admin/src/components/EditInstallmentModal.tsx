import React, { useEffect, useState } from 'react';
import { X, Plus, Trash2, ShieldCheck, IndianRupee, Save } from 'lucide-react';
import { useAdminStore, FeeInstallmentRecord } from '../store/useAdminStore';
import {
  computeHeadAmountsFromTotal,
  InstallmentFeeHeadAmount,
} from '../lib/campusConfig';

interface EditInstallmentModalProps {
  installment: FeeInstallmentRecord | null;
  onClose: () => void;
}

const CONCESSION_REASONS = [
  'None',
  'Sibling Discount',
  'Merit Scholarship',
  'Staff Ward',
  'Financial Aid',
  'Other',
];

export const EditInstallmentModal: React.FC<EditInstallmentModalProps> = ({
  installment,
  onClose,
}) => {
  const { campusConfig, currentStaff, updateFeeInstallment } = useAdminStore();

  const [heads, setHeads] = useState<InstallmentFeeHeadAmount[]>([]);
  const [concessionAmount, setConcessionAmount] = useState<number>(0);
  const [concessionReasonSelect, setConcessionReasonSelect] = useState<string>('None');
  const [customReason, setCustomReason] = useState<string>('');
  const [lateFee, setLateFee] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!installment) return;
    const prevConcession = Math.max(0, Math.round(installment.concessionAmount || 0));
    const prevLate = Math.max(0, Math.round(installment.lateFee || 0));
    const grossBase = Math.max(0, Math.round(installment.amount + prevConcession - prevLate));

    setHeads(
      installment.feeHeadsJson && installment.feeHeadsJson.length > 0
        ? installment.feeHeadsJson.map((h) => ({ ...h }))
        : computeHeadAmountsFromTotal(grossBase, campusConfig.feeHeads)
    );
    setConcessionAmount(prevConcession);
    setLateFee(prevLate);

    const existingReason = (installment.concessionReason || '').trim();
    if (!existingReason || prevConcession === 0) {
      setConcessionReasonSelect('None');
      setCustomReason('');
    } else if (CONCESSION_REASONS.includes(existingReason)) {
      setConcessionReasonSelect(existingReason);
      setCustomReason('');
    } else {
      setConcessionReasonSelect('Other');
      setCustomReason(existingReason);
    }
    setErrorMsg(null);
  }, [installment, campusConfig.feeHeads]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!installment || currentStaff?.department !== 'ADM') return null;

  const grossTotal = heads.reduce((sum, h) => sum + Math.max(0, Math.round(h.amount || 0)), 0);
  const safeConcession = Math.max(0, Math.round(concessionAmount || 0));
  const safeLateFee = Math.max(0, Math.round(lateFee || 0));
  const netPayable = Math.max(0, grossTotal - safeConcession + safeLateFee);

  const handleUpdateHead = (
    idx: number,
    patch: Partial<InstallmentFeeHeadAmount>
  ) => {
    setHeads((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, ...patch } : row))
    );
  };

  const handleAddHead = () => {
    setHeads((prev) => [
      ...prev,
      {
        id: `custom-${Date.now()}`,
        label: 'Board Exam / Special Fee',
        amount: 0,
        eligible80C: false,
      },
    ]);
  };

  const handleRemoveHead = (idx: number) => {
    if (heads.length <= 1) return;
    setHeads((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedHeads = heads
      .map((h) => ({
        ...h,
        label: h.label.trim() || 'Academic Fee',
        amount: Math.max(0, Math.round(h.amount || 0)),
      }))
      .filter((h) => h.label.length > 0);

    if (cleanedHeads.length === 0) {
      setErrorMsg('At least one fee head line is required.');
      return;
    }

    if (safeConcession > grossTotal) {
      setErrorMsg('Concession amount cannot exceed Gross Fee Total.');
      return;
    }

    let finalReason = '';
    if (safeConcession > 0) {
      finalReason =
        concessionReasonSelect === 'Other'
          ? customReason.trim() || 'Special Principal Concession'
          : concessionReasonSelect === 'None'
          ? 'Principal Concession'
          : concessionReasonSelect;
    }

    setIsSaving(true);
    setErrorMsg(null);
    try {
      await updateFeeInstallment(installment.id, {
        amount: netPayable,
        concessionAmount: safeConcession,
        concessionReason: finalReason,
        lateFee: safeLateFee,
        feeHeadsJson: cleanedHeads,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to update installment.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#121826] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92dvh] flex flex-col border border-[#E2E8F0] dark:border-[#232E44] overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 bg-white dark:bg-[#0D1320] border-b border-[#E2E8F0] dark:border-[#232E44] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#818CF8] flex items-center justify-center">
              <IndianRupee className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
                Principal Fee Structure &amp; Concession Editor
              </h2>
              <p className="text-[11px] text-[#475569] dark:text-[#94A3B8]">
                {installment.studentName} (<span className="font-mono">{installment.studentId}</span>) • {installment.quarter}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close fee editor"
            className="p-1.5 rounded-lg text-[#475569] dark:text-[#94A3B8] hover:bg-[#EEF2F7] dark:hover:bg-[#1A2336] cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Itemized Fee Heads */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#475569] dark:text-[#94A3B8]">
                Itemized Fee Heads
              </h3>
              <button
                type="button"
                onClick={handleAddHead}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#818CF8] text-[11px] font-bold border border-[#C7D2FE] dark:border-[#3730A3] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Add Head</span>
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {heads.map((head, idx) => (
                <div
                  key={head.id}
                  className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 p-2.5 rounded-xl bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44]"
                >
                  <input
                    type="text"
                    aria-label={`Fee head ${idx + 1} label`}
                    value={head.label}
                    onChange={(e) => handleUpdateHead(idx, { label: e.target.value })}
                    className="sm:col-span-6 h-9 px-2.5 rounded-lg bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-semibold"
                  />

                  <div className="sm:col-span-3 relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[#94A3B8]">
                      ₹
                    </span>
                    <input
                      type="number"
                      min={0}
                      aria-label={`Fee head ${idx + 1} amount`}
                      value={head.amount}
                      onChange={(e) =>
                        handleUpdateHead(idx, { amount: Math.max(0, Number(e.target.value)) })
                      }
                      className="w-full h-9 pl-6 pr-2 rounded-lg bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-mono font-bold text-right"
                    />
                  </div>

                  <label className="sm:col-span-2 inline-flex items-center gap-1.5 text-[11px] font-bold text-[#059669] dark:text-[#34D399] cursor-pointer justify-end sm:justify-center">
                    <input
                      type="checkbox"
                      checked={Boolean(head.eligible80C)}
                      onChange={(e) => handleUpdateHead(idx, { eligible80C: e.target.checked })}
                      className="accent-[#059669]"
                    />
                    <span>80C</span>
                  </label>

                  <div className="sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      disabled={heads.length <= 1}
                      onClick={() => handleRemoveHead(idx)}
                      aria-label={`Remove ${head.label}`}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-30 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Concession & Late Fee Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#E2E8F0] dark:border-[#232E44]">
            <div>
              <label htmlFor="edit-concession-amount" className="block text-xs font-bold mb-1">
                Concession / Scholarship (₹)
              </label>
              <input
                id="edit-concession-amount"
                type="number"
                min={0}
                value={concessionAmount}
                onChange={(e) => {
                  const val = Math.max(0, Number(e.target.value));
                  setConcessionAmount(val);
                  if (val > 0 && concessionReasonSelect === 'None') {
                    setConcessionReasonSelect('Sibling Discount');
                  }
                }}
                className="w-full h-10 px-3 rounded-xl bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label htmlFor="edit-concession-reason" className="block text-xs font-bold mb-1">
                Concession Reason
              </label>
              <select
                id="edit-concession-reason"
                value={concessionReasonSelect}
                onChange={(e) => setConcessionReasonSelect(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-bold"
              >
                {CONCESSION_REASONS.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="edit-late-fee" className="block text-xs font-bold mb-1">
                Late Payment Fee (₹)
              </label>
              <input
                id="edit-late-fee"
                type="number"
                min={0}
                value={lateFee}
                onChange={(e) => setLateFee(Math.max(0, Number(e.target.value)))}
                className="w-full h-10 px-3 rounded-xl bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-mono font-bold"
              />
            </div>
          </div>

          {concessionReasonSelect === 'Other' && (
            <div>
              <label htmlFor="edit-custom-reason" className="block text-xs font-bold mb-1">
                Specify Custom Concession Reason *
              </label>
              <input
                id="edit-custom-reason"
                type="text"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="e.g. Chairman Humanitarian Waiver"
                className="w-full h-10 px-3 rounded-xl bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-medium"
              />
            </div>
          )}

          {/* Live Calculation Summary Card */}
          <div className="rounded-xl bg-[#EEF2FF]/75 dark:bg-[#1B2440]/60 border border-[#C7D2FE] dark:border-[#3730A3] p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs tabular-nums">
            <div>
              <div className="text-[10px] font-bold uppercase text-[#475569] dark:text-[#94A3B8]">
                Gross Fee
              </div>
              <div className="font-mono font-extrabold text-sm mt-0.5">
                ₹{grossTotal.toLocaleString('en-IN')}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-[#059669] dark:text-[#34D399]">
                Less Concession
              </div>
              <div className="font-mono font-extrabold text-sm text-[#059669] dark:text-[#34D399] mt-0.5">
                -₹{safeConcession.toLocaleString('en-IN')}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-[#D97706] dark:text-[#FBBF24]">
                Add Late Fee
              </div>
              <div className="font-mono font-extrabold text-sm text-[#D97706] dark:text-[#FBBF24] mt-0.5">
                +₹{safeLateFee.toLocaleString('en-IN')}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-[#4F46E5] dark:text-[#818CF8]">
                Net Payable
              </div>
              <div className="font-mono font-black text-base text-[#4F46E5] dark:text-[#818CF8] mt-0.5">
                ₹{netPayable.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold">
              {errorMsg}
            </div>
          )}

          <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#E2E8F0] dark:border-[#232E44]">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#475569] dark:text-[#94A3B8]">
              <ShieldCheck className="w-4 h-4 text-[#059669] dark:text-[#34D399]" aria-hidden="true" />
              Principal Audit Lock Active • Syncs to Mobile App
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] text-xs font-bold text-[#475569] dark:text-[#94A3B8] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#3730A3] disabled:opacity-60 text-white text-xs font-bold shadow-sm cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{isSaving ? 'Saving...' : 'Save Fee Adjustment'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditInstallmentModal;
