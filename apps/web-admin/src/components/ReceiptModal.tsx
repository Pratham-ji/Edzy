import React, { useEffect, useId, useState } from 'react';
import { X, Printer, ShieldCheck, AlertCircle, Building2 } from 'lucide-react';
import { useAdminStore, FeeInstallmentRecord } from '../store/useAdminStore';
import { computeHeadAmountsFromTotal } from '../lib/campusConfig';
import { ReceiptStampSignoffBlock } from './OfficialSchoolSeal';

interface ReceiptModalProps {
  installment: FeeInstallmentRecord | null;
  onClose: () => void;
}

const ONES = [
  '',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function twoDigitsToWords(n: number): string {
  if (n < 20) return ONES[n];
  return `${TENS[Math.floor(n / 10)]}${n % 10 ? ` ${ONES[n % 10]}` : ''}`;
}

function amountToIndianWords(amount: number): string {
  const num = Math.max(0, Math.round(amount));
  if (num === 0) return 'Rupees Zero Only';
  const parts: string[] = [];
  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const hundred = Math.floor((num % 1000) / 100);
  const remainder = num % 100;

  if (crore) parts.push(`${twoDigitsToWords(crore)} Crore`);
  if (lakh) parts.push(`${twoDigitsToWords(lakh)} Lakh`);
  if (thousand) parts.push(`${twoDigitsToWords(thousand)} Thousand`);
  if (hundred) parts.push(`${ONES[hundred]} Hundred`);
  if (remainder) parts.push(twoDigitsToWords(remainder));

  return `Rupees ${parts.join(' ')} Only`;
}

function formatPaymentModeLabel(mode?: string): string {
  switch (mode) {
    case 'ONLINE_UPI':
      return 'Online UPI';
    case 'OFFLINE_CHEQUE':
      return 'Bank Cheque / DD';
    case 'OFFLINE_CASH':
      return 'Physical Cash';
    default:
      return 'Pending Settlement';
  }
}

function formatPrintableReceiptNumber(rawNumber: string | undefined, prefix: string | undefined, schoolCode: string): string {
  const base = (rawNumber || `${schoolCode}-REC`).replace(/^#/, '');
  if (!prefix) return `#${base}`;
  if (base.startsWith(prefix) || base.includes('/')) return base;
  return `${prefix}${base}`;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ installment, onClose }) => {
  const { schoolProfile, students, campusConfig } = useAdminStore();
  const [isDuplicateCopy, setIsDuplicateCopy] = useState(false);
  const duplicateCheckId = useId();

  useEffect(() => {
    setIsDuplicateCopy(false);
  }, [installment?.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!installment) return null;

  const student = students.find((s) => s.id === installment.studentId);
  const netReceived = Math.max(0, Math.round(installment.amount));
  const concessionAmount = Math.max(0, Math.round(installment.concessionAmount || 0));
  const lateFee = Math.max(0, Math.round(installment.lateFee || 0));

  // Derive exact gross base amount before concession / late fee
  const customHeadsSum =
    installment.feeHeadsJson && installment.feeHeadsJson.length > 0
      ? installment.feeHeadsJson.reduce((sum, h) => sum + Math.max(0, Math.round(h.amount)), 0)
      : 0;
  const grossHeads =
    installment.feeHeadsJson && installment.feeHeadsJson.length > 0
      ? installment.feeHeadsJson
      : computeHeadAmountsFromTotal(
          Math.max(0, netReceived + concessionAmount - lateFee),
          campusConfig.feeHeads
        );

  const has80CEligibleHead = grossHeads.some((h) => h.eligible80C && h.amount > 0);
  const hasMeaningfulRef =
    Boolean(installment.paymentRef) &&
    installment.paymentRef !== 'Counter Desk Cash Settlement' &&
    installment.paymentRef !== 'N/A';

  const printedOnStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const formattedReceiptNo = formatPrintableReceiptNumber(
    installment.receiptNumber,
    campusConfig.receiptPrefix,
    schoolProfile.code
  );
  const studentBalanceRemaining = Math.max(0, student?.totalPending ?? 0);
  const isChequePayment = installment.paymentMethod === 'OFFLINE_CHEQUE';
  const receivedByLabel =
    installment.collectedBy ||
    (installment.paymentMethod === 'ONLINE_UPI'
      ? 'Online Parent App (Verified UPI)'
      : `${schoolProfile.accountantName}`);

  return (
    <div
      id="edzy-receipt-dialog-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="edzy-printable-receipt-shell"
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[94dvh] flex flex-col border border-[#E2E8F0] overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Action Bar (Hidden when printing) */}
        <div className="no-print px-3.5 sm:px-5 py-3 bg-[#0F172A] text-white flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" aria-hidden="true" />
            <span className="text-xs font-bold tracking-wide">
              Receipt Preview • {schoolProfile.code}
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <label
              htmlFor={duplicateCheckId}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-[11px] font-semibold text-slate-200 cursor-pointer select-none"
            >
              <input
                id={duplicateCheckId}
                type="checkbox"
                checked={isDuplicateCopy}
                onChange={(e) => setIsDuplicateCopy(e.target.checked)}
                className="accent-[#4F46E5] w-3.5 h-3.5 rounded cursor-pointer"
              />
              <span>Mark as Duplicate Copy</span>
            </label>

            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#4F46E5] hover:bg-[#3730A3] text-white rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Print / Save Official PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close receipt modal"
              className="p-1 text-slate-400 hover:text-white transition rounded-md cursor-pointer"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Always Crisp White Ink-Safe Printable Paper Sheet */}
        <div
          id="edzy-printable-receipt"
          className="relative p-4 sm:p-8 font-sans bg-white text-slate-900 select-text overflow-y-auto flex-1"
        >
          {/* Optional Diagonal DUPLICATE COPY Watermark */}
          {isDuplicateCopy && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden z-10"
            >
              <span className="text-5xl sm:text-6xl font-black uppercase tracking-[0.22em] text-slate-900/10 -rotate-24 border-4 border-slate-900/10 px-6 py-2 rounded-xl">
                DUPLICATE COPY
              </span>
            </div>
          )}

          {/* Institutional Letterhead */}
          <div className="border-b-2 border-slate-900 pb-4 mb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 relative z-20">
            <div className="flex items-start gap-3.5">
              {campusConfig.logoDataUrl ? (
                <img
                  src={campusConfig.logoDataUrl}
                  alt={`${schoolProfile.name} logo`}
                  className="w-14 h-14 object-contain rounded-xl border border-slate-200 bg-white p-1 shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-[#4F46E5] shrink-0">
                  <Building2 className="w-7 h-7" aria-hidden="true" />
                </div>
              )}
              <div>
                <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight uppercase leading-snug">
                  {schoolProfile.name}
                </h1>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  {[schoolProfile.address, schoolProfile.city, schoolProfile.state]
                    .filter(Boolean)
                    .join(', ')}
                </p>
                <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                  Affiliated to <strong className="text-slate-800">{schoolProfile.board}</strong> • Reg/Affil. No:{' '}
                  <strong className="font-mono text-slate-800">{schoolProfile.affiliationNumber}</strong>
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  {[
                    schoolProfile.phone ? `Tel: ${schoolProfile.phone}` : null,
                    schoolProfile.email ? `Email: ${schoolProfile.email}` : null,
                  ]
                    .filter(Boolean)
                    .join(' • ')}
                </p>
              </div>
            </div>

            <div className="sm:text-right shrink-0 flex sm:block items-center justify-between gap-2">
              <div className="inline-block px-2.5 py-1 rounded-md bg-slate-900 text-white text-[10px] font-extrabold uppercase tracking-wider">
                OFFICIAL FEE RECEIPT
              </div>
              <div className="text-[11px] font-bold text-slate-700 mt-1.5">
                Session {schoolProfile.session}
              </div>
            </div>
          </div>

          {/* Receipt & Student Meta Grid (2 Clean Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4 text-xs relative z-20">
            <div className="space-y-2">
              <div className="flex justify-between gap-2">
                <span className="text-slate-500 font-medium">Student Name</span>
                <span className="font-bold text-slate-900 text-right">{installment.studentName}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500 font-medium">Admission / Student ID</span>
                <span className="font-mono font-extrabold text-[#4F46E5] text-right">
                  {installment.studentId}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500 font-medium">Class &amp; Section</span>
                <span className="font-semibold text-slate-800 text-right">
                  {installment.classGrade} • Roll #{student?.rollNo || '--'}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500 font-medium">Father / Guardian Name</span>
                <span className="font-semibold text-slate-800 text-right">
                  {student?.parentName || 'Parent / Guardian'}
                </span>
              </div>
            </div>

            <div className="space-y-2 sm:border-l sm:border-slate-200 sm:pl-4">
              <div className="flex justify-between gap-2">
                <span className="text-slate-500 font-medium">Receipt No.</span>
                <span className="font-mono font-extrabold text-slate-900 text-right">
                  {formattedReceiptNo}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500 font-medium">Payment Date &amp; Time</span>
                <span className="font-semibold text-slate-800 text-right">
                  {installment.paidTimestamp || installment.paidDate || printedOnStr}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500 font-medium">Printed On</span>
                <span className="font-medium text-slate-700 text-right">{printedOnStr}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500 font-medium">Period Covered</span>
                <span className="font-semibold text-slate-800 text-right">{installment.quarter}</span>
              </div>
            </div>
          </div>

          {/* Itemized Audit-Grade Head-Wise Fee Table */}
          <div className="border border-slate-300 rounded-xl overflow-x-auto mb-3 relative z-20">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-100 border-b border-slate-300 text-[10px] font-extrabold uppercase tracking-wider text-slate-700">
                <tr>
                  <th scope="col" className="px-4 py-2.5 w-12">S.No</th>
                  <th scope="col" className="px-4 py-2.5">Fee Head Description</th>
                  <th scope="col" className="px-4 py-2.5 text-right">Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800 tabular-nums">
                {grossHeads.map((head, idx) => (
                  <tr key={head.id || idx}>
                    <td className="px-4 py-2 font-mono text-slate-500">{idx + 1}</td>
                    <td className="px-4 py-2 font-semibold">
                      <span>{head.label}</span>
                      {head.eligible80C && (
                        <span className="ml-2 inline-block px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9.5px] font-bold">
                          Sec. 80C Eligible
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right font-mono font-semibold">
                      ₹{head.amount.toLocaleString('en-IN')}.00
                    </td>
                  </tr>
                ))}

                {customHeadsSum > 0 && (concessionAmount > 0 || lateFee > 0) && (
                  <tr className="bg-slate-50/70">
                    <td className="px-4 py-1.5" />
                    <td className="px-4 py-1.5 text-[11px] font-bold text-slate-600">
                      Gross Fee Total
                    </td>
                    <td className="px-4 py-1.5 text-right font-mono font-bold text-slate-700">
                      ₹{customHeadsSum.toLocaleString('en-IN')}.00
                    </td>
                  </tr>
                )}

                {concessionAmount > 0 && (
                  <tr className="bg-emerald-50/60 text-emerald-800">
                    <td className="px-4 py-2 font-mono">—</td>
                    <td className="px-4 py-2 font-bold">
                      Less: Concession / Scholarship ({installment.concessionReason || 'Approved Discount'})
                    </td>
                    <td className="px-4 py-2 text-right font-mono font-bold">
                      (-₹{concessionAmount.toLocaleString('en-IN')}.00)
                    </td>
                  </tr>
                )}

                {lateFee > 0 && (
                  <tr className="bg-amber-50/70 text-amber-900">
                    <td className="px-4 py-2 font-mono">+</td>
                    <td className="px-4 py-2 font-bold">Add: Late Payment Fee</td>
                    <td className="px-4 py-2 text-right font-mono font-bold">
                      (+₹{lateFee.toLocaleString('en-IN')}.00)
                    </td>
                  </tr>
                )}

                <tr className="bg-slate-900 text-white font-bold">
                  <td colSpan={2} className="px-4 py-2.5 text-right uppercase tracking-wider text-[11px]">
                    Net Amount Received
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-sm">
                    ₹{netReceived.toLocaleString('en-IN')}.00
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-[11px] font-semibold text-slate-700 mb-4 relative z-20">
            Amount in Words:{' '}
            <span className="italic font-bold text-slate-900">
              {amountToIndianWords(netReceived)}
            </span>
            {has80CEligibleHead && (
              <span className="ml-1.5 text-emerald-700 font-medium">
                (Tuition component valid for Section 80C rebate.)
              </span>
            )}
          </p>

          {/* Payment Settlement & Student Balance Strip */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 mb-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px] relative z-20">
            <div>
              <span className="text-slate-500 font-medium">Payment Mode: </span>
              <strong className="text-slate-900">
                {formatPaymentModeLabel(installment.paymentMethod)}
              </strong>
            </div>

            {hasMeaningfulRef && (
              <div>
                <span className="text-slate-500 font-medium">
                  {isChequePayment ? 'Cheque / Bank Ref: ' : 'Transaction Ref: '}
                </span>
                <strong className="font-mono text-slate-900">{installment.paymentRef}</strong>
              </div>
            )}

            <div>
              <span className="text-slate-500 font-medium">Received By: </span>
              <strong className="text-slate-900">{receivedByLabel}</strong>
            </div>

            <div>
              <span className="text-slate-500 font-medium">Total Student Balance Remaining: </span>
              <strong
                className={`font-mono ${
                  studentBalanceRemaining === 0 ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {studentBalanceRemaining === 0
                  ? '₹0.00 (All Dues Cleared)'
                  : `₹${studentBalanceRemaining.toLocaleString('en-IN')}.00`}
              </strong>
            </div>

            {isChequePayment && (
              <div className="sm:col-span-2 mt-1 flex items-center gap-1.5 text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-lg font-semibold">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>Cheque/DD payments are subject to bank realisation.</span>
              </div>
            )}
          </div>

          {/* Official Digital Stamp, Statutory Note & Signatory Footer */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-end justify-between gap-4 relative z-20">
            <div className="space-y-1 max-w-xs">
              <p className="text-[10px] font-semibold text-slate-600 leading-relaxed">
                {campusConfig.receiptFooterNote}
              </p>
              <p className="text-[10px] text-slate-400">
                Computer-generated receipt verified via Edzy School Cloud ({schoolProfile.code})
              </p>
            </div>

            <ReceiptStampSignoffBlock
              schoolName={schoolProfile.name}
              schoolCode={schoolProfile.code}
              signatoryLabel={campusConfig.signatoryLabel || 'Authorized Signatory / Accounts Officer'}
              signatoryName={schoolProfile.accountantName}
              dateLabel={(installment.paidDate || printedOnStr).toUpperCase()}
              stampDataUrl={campusConfig.stampDataUrl}
              signatureDataUrl={campusConfig.signatureDataUrl}
              useAutoGeneratedSeal={campusConfig.useAutoGeneratedSeal}
              stampBlendMode={campusConfig.stampBlendMode}
              isPaid={installment.status === 'PAID'}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
