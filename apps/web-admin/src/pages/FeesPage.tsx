import React, { useState } from 'react';
import {
  Search,
  Filter,
  CreditCard,
  Banknote,
  Building2,
  Smartphone,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  Share2,
  Printer,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Download,
} from 'lucide-react';
import { useAdminStore, FeeInstallmentRecord } from '../store/useAdminStore';
import { OfflineFeeModal } from '../components/OfflineFeeModal';
import { ReceiptModal } from '../components/ReceiptModal';

export const FeesPage: React.FC = () => {
  const { feeInstallments, students, schoolProfile } = useAdminStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, PENDING, PAID, OVERDUE

  const [activeCollectModal, setActiveCollectModal] = useState<FeeInstallmentRecord | null>(null);
  const [activeReceiptModal, setActiveReceiptModal] = useState<FeeInstallmentRecord | null>(null);

  // Filter installments
  const filteredInstallments = feeInstallments.filter((inst) => {
    const student = students.find((s) => s.id === inst.studentId);
    const query = searchQuery.toLowerCase().trim();

    const matchesSearch =
      inst.studentName.toLowerCase().includes(query) ||
      inst.studentId.toLowerCase().includes(query) ||
      (inst.receiptNumber && inst.receiptNumber.toLowerCase().includes(query)) ||
      (student && student.rollNo.includes(query));

    const matchesClass =
      classFilter === 'ALL' || inst.classGrade.toUpperCase().includes(classFilter.toUpperCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'PAID' && inst.status === 'PAID') ||
      (statusFilter === 'PENDING' && (inst.status === 'PENDING' || inst.status === 'OVERDUE')) ||
      (statusFilter === 'OVERDUE' && inst.status === 'OVERDUE');

    return matchesSearch && matchesClass && matchesStatus;
  });

  const totalFilteredDue = filteredInstallments
    .filter((f) => f.status !== 'PAID')
    .reduce((sum, f) => sum + f.amount, 0);

  const totalFilteredPaid = filteredInstallments
    .filter((f) => f.status === 'PAID')
    .reduce((sum, f) => sum + f.amount, 0);

  const getWhatsAppLink = (inst: FeeInstallmentRecord) => {
    const student = students.find((s) => s.id === inst.studentId);
    const phone = student?.parentPhone || '9811234567';
    const parent = student?.parentName || 'Parent';

    const text = `Dear ${parent},\n\nThis is a gentle fee reminder from ${schoolProfile.name} regarding ${inst.studentName}'s (${inst.classGrade}) fee installment for ${inst.quarter}.\n\nPending Amount: ₹${inst.amount.toLocaleString('en-IN')}\nDue Date: ${inst.dueDate}\n\nYou can pay directly with 0 convenience fee via UPI on the Edzy Parent App (Student ID: ${inst.studentId}) or at the School Accounts counter.\n\nThank you,\nAccounts Bursar, ${schoolProfile.name}`;

    return `https://wa.me/91${phone}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Hybrid Fee Counter & Passbook Ledger
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Cash, Cheque, and Instant UPI reconciliation with instant receipt generation
          </p>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl">
            <span className="text-[10px] font-bold text-emerald-600 uppercase">Paid in View</span>
            <p className="text-sm font-black text-emerald-700">₹{totalFilteredPaid.toLocaleString('en-IN')}</p>
          </div>
          <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl">
            <span className="text-[10px] font-bold text-amber-600 uppercase">Dues in View</span>
            <p className="text-sm font-black text-amber-700">₹{totalFilteredDue.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Student Name, Roll No (24), ID (SCH-2026-0104), or Receipt #..."
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Class Filter */}
          <div className="flex items-center gap-1.5 w-full md:w-auto">
            <span className="text-xs font-bold text-slate-500 shrink-0">Class:</span>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
            >
              <option value="ALL">All Classes</option>
              <option value="10-A">Class 10-A</option>
              <option value="9-B">Class 9-B</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 w-full md:w-auto">
            <span className="text-xs font-bold text-slate-500 shrink-0">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending Dues Only</option>
              <option value="OVERDUE">Overdue Only</option>
              <option value="PAID">Fully Paid Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Installments Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Student Particulars</th>
                <th className="px-4 py-3.5">Term Quarter</th>
                <th className="px-4 py-3.5">Fee Amount</th>
                <th className="px-4 py-3.5">Payment Instrument</th>
                <th className="px-4 py-3.5">Receipt #</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Counter Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredInstallments.map((inst) => {
                const isPaid = inst.status === 'PAID';
                const isOverdue = inst.status === 'OVERDUE';
                const student = students.find((s) => s.id === inst.studentId);

                return (
                  <tr key={inst.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Student particulars */}
                    <td className="px-4 py-3">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 text-xs">{inst.studentName}</span>
                          {inst.studentId === 'SCH-2026-0104' && (
                            <span className="text-[9px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.2 rounded">
                              DEMO SYNC
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {inst.classGrade} • Roll #{student?.rollNo || '24'} •{' '}
                          <span className="font-mono">{inst.studentId}</span>
                        </p>
                      </div>
                    </td>

                    {/* Quarter */}
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {inst.quarter}
                      <p className="text-[10px] text-slate-400">Due: {inst.dueDate}</p>
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3 font-extrabold text-slate-900 text-sm">
                      ₹{inst.amount.toLocaleString('en-IN')}
                    </td>

                    {/* Payment Mode */}
                    <td className="px-4 py-3">
                      {inst.paymentMethod === 'ONLINE_UPI' && (
                        <div className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                          <Smartphone className="w-3 h-3 text-indigo-600" />
                          <span>Online UPI</span>
                        </div>
                      )}
                      {inst.paymentMethod === 'OFFLINE_CASH' && (
                        <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <Banknote className="w-3 h-3 text-emerald-600" />
                          <span>Offline Cash</span>
                        </div>
                      )}
                      {inst.paymentMethod === 'OFFLINE_CHEQUE' && (
                        <div className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-200">
                          <Building2 className="w-3 h-3 text-cyan-600" />
                          <span>Offline Cheque</span>
                        </div>
                      )}
                      {!inst.paymentMethod && (
                        <span className="text-[11px] text-slate-400 font-medium">Unsettled</span>
                      )}
                      {inst.paymentRef && (
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5 truncate max-w-xs">
                          {inst.paymentRef}
                        </p>
                      )}
                    </td>

                    {/* Receipt Number */}
                    <td className="px-4 py-3 font-mono font-bold text-slate-800 text-xs">
                      {inst.receiptNumber || '—'}
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3">
                      {isPaid ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> PAID
                        </span>
                      ) : isOverdue ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                          <AlertCircle className="w-3 h-3" /> OVERDUE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                          <Clock className="w-3 h-3" /> PENDING
                        </span>
                      )}
                    </td>

                    {/* Counter Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isPaid ? (
                          <button
                            onClick={() => setActiveReceiptModal(inst)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-bold transition"
                          >
                            <FileCheck className="w-3.5 h-3.5 text-indigo-600" />
                            <span>View Receipt</span>
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => setActiveCollectModal(inst)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shadow-xs transition"
                            >
                              <Banknote className="w-3.5 h-3.5" />
                              <span>Collect Fee</span>
                            </button>

                            <a
                              href={getWhatsAppLink(inst)}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Send WhatsApp Fee Reminder"
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg transition"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </a>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Modals */}
      <OfflineFeeModal
        installment={activeCollectModal}
        onClose={() => setActiveCollectModal(null)}
        onSuccess={(info) => {
          const updated = feeInstallments.find((f) => f.receiptNumber === info.receiptNumber);
          setActiveCollectModal(null);
          if (updated) {
            setActiveReceiptModal(updated);
          }
        }}
      />

      <ReceiptModal
        installment={activeReceiptModal}
        onClose={() => setActiveReceiptModal(null)}
      />
    </div>
  );
};

export default FeesPage;
