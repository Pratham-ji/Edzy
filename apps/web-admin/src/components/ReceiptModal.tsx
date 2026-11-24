import React, { useEffect } from 'react';
import {
  X,
  Printer,
  Download,
  ShieldCheck,
  Building,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { useAdminStore, FeeInstallmentRecord } from '../store/useAdminStore';

interface ReceiptModalProps {
  installment: FeeInstallmentRecord | null;
  onClose: () => void;
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar (Hidden when printing) */}
        <div className="no-print px-6 py-3 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold tracking-wide">OFFICIAL SCHOOL RECEIPT ARCHIVE</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white transition rounded-md cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div className="p-8 font-sans bg-white text-slate-900">
          {/* School Header */}
          <div className="border-b-2 border-slate-900 pb-5 mb-5 flex items-start justify-between">
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                {schoolProfile.name}
              </h1>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                {schoolProfile.address}, {schoolProfile.city}, {schoolProfile.state}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                Affiliation: <span className="font-bold text-slate-700">{schoolProfile.affiliationNumber}</span> ({schoolProfile.board}) • Phone: {schoolProfile.phone}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-slate-100 text-slate-800 font-mono font-black text-sm rounded-lg border border-slate-300">
                {installment.receiptNumber || '#EDZ-RECORD'}
              </span>
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                Date: <span className="font-semibold text-slate-800">{installment.paidDate || 'Today'}</span>
              </p>
            </div>
          </div>

          <div className="text-center my-3">
            <span className="text-xs font-extrabold tracking-widest uppercase bg-slate-100 text-slate-800 px-4 py-1 rounded-full border border-slate-300">
              FEE PAYMENT RECEIPT • {schoolProfile.session}
            </span>
          </div>

          {/* Student Particulars */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4 my-4 text-xs">
            <div>
              <p className="text-slate-500 font-medium text-[11px]">Student Name</p>
              <p className="font-bold text-slate-900 text-sm">{installment.studentName}</p>
            </div>
            <div>
              <p className="text-slate-500 font-medium text-[11px]">Admission / Roll Number</p>
              <p className="font-bold text-slate-900 font-mono">
                {installment.studentId} (Roll #{student?.rollNo || '24'})
              </p>
            </div>
            <div>
              <p className="text-slate-500 font-medium text-[11px]">Class & Section</p>
              <p className="font-semibold text-slate-800">{installment.classGrade}</p>
            </div>
            <div>
              <p className="text-slate-500 font-medium text-[11px]">Parent / Guardian Name</p>
              <p className="font-semibold text-slate-800">{student?.parentName || 'Rajesh Sharma'}</p>
            </div>
            <div>
              <p className="text-slate-500 font-medium text-[11px]">Payment Mode</p>
              <p className="font-bold text-indigo-700">{installment.paymentMethod || 'OFFLINE_CASH'}</p>
            </div>
            <div>
              <p className="text-slate-500 font-medium text-[11px]">Transaction Reference</p>
              <p className="font-mono text-slate-700">{installment.paymentRef || 'Counter Desk Receipt'}</p>
            </div>
          </div>

          {/* Itemized Fee Breakdown Table */}
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
                  <td className="px-4 py-2 text-right font-medium">₹9,000.00</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono">2</td>
                  <td className="px-4 py-2 font-medium">Computer, AI & Science Lab Facilities</td>
                  <td className="px-4 py-2 text-slate-500">{installment.quarter}</td>
                  <td className="px-4 py-2 text-right font-medium">₹2,000.00</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono">3</td>
                  <td className="px-4 py-2 font-medium">Campus Transport & Safety Security Levy</td>
                  <td className="px-4 py-2 text-slate-500">{installment.quarter}</td>
                  <td className="px-4 py-2 text-right font-medium">₹1,000.00</td>
                </tr>
                <tr className="bg-slate-50 font-bold text-slate-900 border-t-2 border-slate-300">
                  <td colSpan={3} className="px-4 py-2.5 text-right uppercase tracking-wider text-[11px]">
                    Total Amount Received:
                  </td>
                  <td className="px-4 py-2.5 text-right text-emerald-700 text-sm">
                    ₹{installment.amount.toLocaleString('en-IN')}.00
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-[11px] text-slate-500 italic mb-6">
            Amount in words: Twelve Thousand Indian Rupees Only. Valid for Section 80C Income Tax rebate.
          </p>

          {/* Official Verification Seal & Signatures */}
          <div className="pt-6 border-t border-slate-200 flex items-end justify-between">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-emerald-600 bg-emerald-50/50 flex flex-col items-center justify-center p-1 rotate-[-4deg]">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span className="text-[8px] font-black text-emerald-700 tracking-tighter leading-none mt-0.5">
                  VERIFIED
                </span>
                <span className="text-[7px] text-emerald-600 font-medium">DVPS ACCOUNTS</span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-800">Digitally Sealed & Authorized</p>
                <p className="text-[10px] text-slate-500">School Command ERP Engine</p>
                <p className="text-[10px] text-slate-400 font-mono">Timestamp: {installment.paidDate || '2026-11-20'}</p>
              </div>
            </div>

            <div className="text-right">
              <div className="w-36 border-b border-slate-400 pb-1 mb-1">
                <span className="text-xs font-serif italic text-slate-700">Sunil Aggarwal</span>
              </div>
              <p className="text-[11px] font-bold text-slate-800">Accounts Bursar</p>
              <p className="text-[10px] text-slate-500">{schoolProfile.name}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
