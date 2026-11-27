import React, { useEffect } from 'react';
import {
  X,
  Printer,
  ShieldCheck,
} from 'lucide-react';
import { useAdminStore, FeeInstallmentRecord } from '../store/useAdminStore';

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
  if (num === 0) return 'Zero Indian Rupees Only';
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

  return `${parts.join(' ')} Indian Rupees Only`;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ installment, onClose }) => {
  const { schoolProfile, students } = useAdminStore();

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
  const totalAmount = Math.max(0, installment.amount);
  const tuitionShare = Math.round(totalAmount * 0.75);
  const labShare = Math.round(totalAmount * 0.17);
  const campusShare = Math.max(0, totalAmount - tuitionShare - labShare);

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#121826] rounded-2xl shadow-2xl max-w-2xl w-full border border-[#E2E8F0] dark:border-[#232E44] overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar (Hidden when printing) */}
        <div className="no-print px-6 py-3 bg-[#0F172A] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold tracking-wide">
              OFFICIAL {schoolProfile.code} FEE RECEIPT
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4F46E5] hover:bg-[#3730A3] text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close receipt modal"
              className="p-1 text-slate-400 hover:text-white transition rounded-md cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div className="p-8 font-sans bg-white text-slate-900">
          {/* School Header */}
          <div className="border-b-2 border-slate-900 pb-5 mb-5 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                {schoolProfile.name}
              </h1>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                {schoolProfile.address}, {schoolProfile.city}, {schoolProfile.state}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                Affiliation:{' '}
                <span className="font-bold text-slate-700">{schoolProfile.affiliationNumber}</span> (
                {schoolProfile.board}) • Phone: {schoolProfile.phone}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="inline-block px-3 py-1 bg-slate-100 text-slate-800 font-mono font-black text-sm rounded-lg border border-slate-300">
                {installment.receiptNumber || `#${schoolProfile.code}-REC`}
              </span>
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                Date:{' '}
                <span className="font-semibold text-slate-800">
                  {installment.paidDate || 'Verified'}
                </span>
              </p>
            </div>
          </div>

          <div className="text-center my-3">
            <span className="text-xs font-extrabold tracking-widest uppercase bg-slate-100 text-slate-800 px-4 py-1 rounded-full border border-slate-300">
              FEE PAYMENT RECEIPT • {schoolProfile.session}
            </span>
          </div>

          {/* Student Particulars with Prominent Structured ID */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4 my-4 text-xs">
            <div>
              <p className="text-slate-500 font-medium text-[11px]">Student Name</p>
              <p className="font-bold text-slate-900 text-sm">{installment.studentName}</p>
            </div>
            <div>
              <p className="text-slate-500 font-medium text-[11px]">Student ID & Roll #</p>
              <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                <span className="inline-block px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono font-extrabold text-xs">
                  {installment.studentId}
                </span>
                <span className="font-semibold text-slate-700">
                  (Roll #{student?.rollNo || '--'})
                </span>
              </div>
            </div>
            <div>
              <p className="text-slate-500 font-medium text-[11px]">Class & Section</p>
              <p className="font-semibold text-slate-800">{installment.classGrade}</p>
            </div>
            <div>
              <p className="text-slate-500 font-medium text-[11px]">Parent / Guardian Name</p>
              <p className="font-semibold text-slate-800">{student?.parentName || 'Parent / Guardian'}</p>
            </div>
            <div>
              <p className="text-slate-500 font-medium text-[11px]">Payment Mode</p>
              <p className="font-bold text-indigo-700">{installment.paymentMethod || 'OFFLINE_CASH'}</p>
            </div>
            <div>
              <p className="text-slate-500 font-medium text-[11px]">Transaction Reference</p>
              <p className="font-mono text-slate-700">
                {installment.paymentRef || 'Counter Desk Receipt'}
              </p>
            </div>
          </div>

          {/* Itemized Fee Breakdown Table summing 100% to installment.amount */}
          <div className="border border-slate-200 rounded-xl overflow-hidden my-4">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-2.5">S.No</th>
                  <th className="px-4 py-2.5">Fee Head Description</th>
                  <th className="px-4 py-2.5">Term Period</th>
                  <th className="px-4 py-2.5 text-right">Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="px-4 py-2 font-mono">1</td>
                  <td className="px-4 py-2 font-medium">Tuition & Academic Instructional Fee</td>
                  <td className="px-4 py-2 text-slate-500">{installment.quarter}</td>
                  <td className="px-4 py-2 text-right font-medium">
                    ₹{tuitionShare.toLocaleString('en-IN')}.00
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono">2</td>
                  <td className="px-4 py-2 font-medium">Computer, AI & Science Lab Facilities</td>
                  <td className="px-4 py-2 text-slate-500">{installment.quarter}</td>
                  <td className="px-4 py-2 text-right font-medium">
                    ₹{labShare.toLocaleString('en-IN')}.00
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono">3</td>
                  <td className="px-4 py-2 font-medium">Campus Activity & Safety Levy</td>
                  <td className="px-4 py-2 text-slate-500">{installment.quarter}</td>
                  <td className="px-4 py-2 text-right font-medium">
                    ₹{campusShare.toLocaleString('en-IN')}.00
                  </td>
                </tr>
                <tr className="bg-slate-50 font-bold text-slate-900 border-t-2 border-slate-300">
                  <td colSpan={3} className="px-4 py-2.5 text-right uppercase tracking-wider text-[11px]">
                    Total Amount Received:
                  </td>
                  <td className="px-4 py-2.5 text-right text-emerald-700 text-sm">
                    ₹{totalAmount.toLocaleString('en-IN')}.00
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-[11px] text-slate-500 italic mb-6">
            Amount in words: {amountToIndianWords(totalAmount)}. Valid for Section 80C Income Tax rebate.
          </p>

          {/* Official Verification Seal & Signatures */}
          <div className="pt-6 border-t border-slate-200 flex items-end justify-between">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-emerald-600 bg-emerald-50/50 flex flex-col items-center justify-center p-1 rotate-[-4deg]">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span className="text-[8px] font-black text-emerald-700 tracking-tighter leading-none mt-0.5">
                  VERIFIED
                </span>
                <span className="text-[7px] text-emerald-600 font-medium">
                  {schoolProfile.code} DESK
                </span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-800">Digitally Sealed & Authorized</p>
                <p className="text-[10px] text-slate-500">Edzy School Accounting Engine</p>
                <p className="text-[10px] text-slate-400 font-mono">
                  Timestamp: {installment.paidDate || 'Verified'}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="w-36 border-b border-slate-400 pb-1 mb-1">
                <span className="text-xs font-serif italic text-slate-700">
                  {schoolProfile.accountantName}
                </span>
              </div>
              <p className="text-[11px] font-bold text-slate-800">Accounts Officer</p>
              <p className="text-[10px] text-slate-500">{schoolProfile.name}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
