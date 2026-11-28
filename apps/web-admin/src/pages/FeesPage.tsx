import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  Banknote,
  Building2,
  Smartphone,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  Share2,
  X,
  IndianRupee,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Layers,
  ListChecks,
  Sparkles,
  Phone,
  Pencil,
} from 'lucide-react';
import { useAdminStore, FeeInstallmentRecord } from '../store/useAdminStore';
import { OfflineFeeModal } from '../components/OfflineFeeModal';
import { ReceiptModal } from '../components/ReceiptModal';
import { EditInstallmentModal } from '../components/EditInstallmentModal';
import { getDynamicCampusClasses } from '../lib/classScope';
import {
  buildStudentFeeSummaries,
  buildWhatsAppFeeReminderUrl,
  computeFeeReconciliationSummary,
  formatReceiptNumber,
  matchesStudentFeeSearch,
  StudentFeeSummary,
} from '../lib/feeMetrics';

type LedgerViewMode = 'STUDENTS' | 'TRANSACTIONS';
type StatusFilter = 'ALL' | 'PENDING' | 'PAID';
type StudentSortMode = 'ID' | 'NAME' | 'DUES';

const STUDENTS_PAGE_SIZE = 20;
const TRANSACTIONS_PAGE_SIZE = 25;

export const FeesPage: React.FC = () => {
  const { feeInstallments, students, staffList, schoolProfile, currentStaff } = useAdminStore();
  const isPrincipalAdmin = currentStaff?.department === 'ADM';

  const [viewMode, setViewMode] = useState<LedgerViewMode>('STUDENTS');
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [sortBy, setSortBy] = useState<StudentSortMode>('ID');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);

  const [activeCollectModal, setActiveCollectModal] = useState<FeeInstallmentRecord | null>(null);
  const [activeReceiptModal, setActiveReceiptModal] = useState<FeeInstallmentRecord | null>(null);
  const [activeEditModal, setActiveEditModal] = useState<FeeInstallmentRecord | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // `/` shortcut focuses search immediately; `Escape` clears search when focused
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeCollectModal || activeReceiptModal || activeEditModal) return;

      const target = e.target as HTMLElement | null;
      const isEditable =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if (e.key === '/' && !isEditable) {
        e.preventDefault();
        e.stopPropagation();
        requestAnimationFrame(() => {
          searchInputRef.current?.focus();
          searchInputRef.current?.select();
        });
      } else if (e.key === 'Escape' && document.activeElement === searchInputRef.current && searchQuery) {
        e.preventDefault();
        setSearchQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [activeCollectModal, activeReceiptModal, activeEditModal, searchQuery]);

  // Reset pagination whenever filters or view mode change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, classFilter, statusFilter, viewMode, sortBy]);

  const classOptions = useMemo(
    () => getDynamicCampusClasses(students, staffList),
    [students, staffList]
  );

  // O(N + M) summaries keyed once
  const studentSummaries = useMemo(
    () => buildStudentFeeSummaries(students, feeInstallments),
    [students, feeInstallments]
  );

  const studentByIdMap = useMemo(() => {
    const map = new Map<string, (typeof students)[number]>();
    for (const s of students) map.set(s.id, s);
    return map;
  }, [students]);

  // Live Reconciliation KPIs (Cash/Cheque + UPI strictly equals 100% of Total Collected)
  const kpis = useMemo(
    () => computeFeeReconciliationSummary(feeInstallments, studentSummaries),
    [feeInstallments, studentSummaries]
  );

  // Student Ledger View filtered + sorted list
  const filteredStudentSummaries = useMemo(() => {
    const list = studentSummaries.filter((summary) => {
      if (!matchesStudentFeeSearch(summary, searchQuery)) return false;
      if (classFilter !== 'ALL' && summary.student.classGrade !== classFilter) return false;
      if (statusFilter === 'PENDING' && summary.balanceDue <= 0) return false;
      if (statusFilter === 'PAID' && summary.balanceDue > 0) return false;
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'DUES') {
        if (b.balanceDue !== a.balanceDue) return b.balanceDue - a.balanceDue;
      } else if (sortBy === 'NAME') {
        return a.student.name.localeCompare(b.student.name, 'en-IN', { sensitivity: 'base' });
      }
      return a.student.id.localeCompare(b.student.id, undefined, { numeric: true });
    });
  }, [studentSummaries, searchQuery, classFilter, statusFilter, sortBy]);

  // Spotlight exact single-student match whenever search narrows down to 1 student
  const spotlightStudent: StudentFeeSummary | null = useMemo(() => {
    if (!searchQuery.trim()) return null;
    if (filteredStudentSummaries.length === 1) {
      return filteredStudentSummaries[0];
    }
    const exactId = searchQuery.trim().toLowerCase();
    const direct = studentSummaries.find(
      (s) => s.student.id.toLowerCase() === exactId
    );
    return direct || null;
  }, [searchQuery, filteredStudentSummaries, studentSummaries]);

  // Installment Transactions View filtered list
  const filteredInstallments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return feeInstallments.filter((inst) => {
      const student = studentByIdMap.get(inst.studentId);

      const matchesSearch =
        !query ||
        inst.studentName.toLowerCase().includes(query) ||
        inst.studentId.toLowerCase().includes(query) ||
        (inst.receiptNumber && inst.receiptNumber.toLowerCase().includes(query)) ||
        (student &&
          (student.rollNo.toLowerCase().includes(query) ||
            student.parentPhone.toLowerCase().includes(query) ||
            student.parentName.toLowerCase().includes(query)));

      const matchesClass = classFilter === 'ALL' || inst.classGrade === classFilter;
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'PAID' && inst.status === 'PAID') ||
        (statusFilter === 'PENDING' && inst.status !== 'PAID');

      return matchesSearch && matchesClass && matchesStatus;
    });
  }, [feeInstallments, studentByIdMap, searchQuery, classFilter, statusFilter]);

  const pageSize = viewMode === 'STUDENTS' ? STUDENTS_PAGE_SIZE : TRANSACTIONS_PAGE_SIZE;
  const totalItems =
    viewMode === 'STUDENTS' ? filteredStudentSummaries.length : filteredInstallments.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * pageSize;

  const pagedStudents = filteredStudentSummaries.slice(startIdx, startIdx + pageSize);
  const pagedInstallments = filteredInstallments.slice(startIdx, startIdx + pageSize);

  const handleOpenAllQuartersForStudent = (studentId: string) => {
    setSearchQuery(studentId);
    setClassFilter('ALL');
    setStatusFilter('ALL');
    setViewMode('TRANSACTIONS');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
              Accounts Fee Counter & ID Desk
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#6366F1] border border-[#C7D2FE] dark:border-[#3730A3]">
              {students.length} Active Students
            </span>
          </div>
          <p className="text-xs text-[#475569] dark:text-[#94A3B8] font-medium mt-0.5">
            Instant Unique ID lookup ({schoolProfile.code}-...), desk Cash/Cheque collection, and live Parent UPI reconciliation.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-[#EEF2F7] dark:bg-[#1A2336] p-1 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] self-start md:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('STUDENTS')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'STUDENTS'
                ? 'bg-white dark:bg-[#121826] text-[#4F46E5] dark:text-[#6366F1] shadow-xs'
                : 'text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Student Ledger View</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('TRANSACTIONS')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'TRANSACTIONS'
                ? 'bg-white dark:bg-[#121826] text-[#4F46E5] dark:text-[#6366F1] shadow-xs'
                : 'text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
            }`}
          >
            <ListChecks className="w-3.5 h-3.5" />
            <span>Installment Transactions View</span>
          </button>
        </div>
      </div>

      {/* Live Single-Source-of-Truth Reconciliation KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#121826] p-4 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] dark:bg-[rgba(16,185,129,0.14)] border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center text-[#059669] dark:text-[#34D399] shrink-0">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wide text-[#475569] dark:text-[#94A3B8]">
              Total Collected (All Modes)
            </div>
            <div className="text-xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
              ₹{kpis.totalCollected.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-[#059669] dark:text-[#34D399] font-semibold">
              {kpis.paidCount} settled quarters
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#121826] p-4 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 flex items-center justify-center text-cyan-700 dark:text-cyan-400 shrink-0">
            <Banknote className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wide text-[#475569] dark:text-[#94A3B8]">
              Cash & Cheque Desk Total
            </div>
            <div className="text-xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
              ₹{kpis.deskCollected.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-[#475569] dark:text-[#94A3B8] font-medium">
              Cash ₹{kpis.cashCollected.toLocaleString('en-IN')} • Chq ₹
              {kpis.chequeCollected.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#121826] p-4 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] dark:bg-[#1B2440] border border-[#C7D2FE] dark:border-[#3730A3] flex items-center justify-center text-[#4F46E5] dark:text-[#6366F1] shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wide text-[#475569] dark:text-[#94A3B8]">
              Online UPI App Total
            </div>
            <div className="text-xl font-extrabold text-[#4F46E5] dark:text-[#6366F1]">
              ₹{kpis.upiCollected.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-[#475569] dark:text-[#94A3B8] font-medium">
              {kpis.totalCollected > 0
                ? `${Math.round((kpis.upiCollected / kpis.totalCollected) * 100)}% digital share`
                : 'Instant mobile sync'}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#121826] p-4 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] dark:bg-[rgba(245,158,11,0.14)] border border-amber-200 dark:border-amber-500/30 flex items-center justify-center text-[#D97706] dark:text-[#FBBF24] shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wide text-[#475569] dark:text-[#94A3B8]">
              Total Pending Dues
            </div>
            <div className="text-xl font-extrabold text-[#D97706] dark:text-[#FBBF24]">
              ₹{kpis.totalPendingDues.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-[#475569] dark:text-[#94A3B8] font-medium">
              {kpis.defaultersCount} student{kpis.defaultersCount === 1 ? '' : 's'} with balance due
            </div>
          </div>
        </div>
      </div>

      {/* Hero Lightning Search Bar & Filters */}
      <div className="bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] rounded-2xl p-4 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-[#4F46E5] dark:text-[#6366F1] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Student ID (e.g. SCH-01-205 or 205), Name, Parent Phone, or Receipt #..."
            className="w-full h-11 pl-10 pr-28 rounded-xl border-2 border-[#E2E8F0] dark:border-[#232E44] focus:border-[#4F46E5] dark:focus:border-[#6366F1] bg-[#F6F8FC] dark:bg-[#1A2336] text-sm font-medium text-[#0F172A] dark:text-[#F8FAFC] placeholder:text-[#94A3B8] focus:outline-none transition-colors"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EEF2F7] dark:bg-[#121826] hover:bg-slate-200 dark:hover:bg-slate-800 text-[11px] font-bold text-[#475569] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-[#232E44] cursor-pointer"
              >
                <X className="w-3 h-3" />
                <span>Clear (Esc)</span>
              </button>
            ) : (
              <kbd className="px-2 py-0.5 rounded-md bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] text-[11px] font-mono font-bold text-[#475569] dark:text-[#94A3B8]">
                / to focus
              </kbd>
            )}
          </div>
        </div>

        {/* Status Pills + Dynamic Class Dropdown */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {(
              [
                { id: 'ALL', label: 'All Students' },
                { id: 'PENDING', label: 'Pending Dues' },
                { id: 'PAID', label: 'Fully Paid' },
              ] as const
            ).map((pill) => (
              <button
                key={pill.id}
                type="button"
                onClick={() => setStatusFilter(pill.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  statusFilter === pill.id
                    ? 'bg-[#4F46E5] dark:bg-[#6366F1] text-white'
                    : 'bg-[#EEF2F7] dark:bg-[#1A2336] text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[#475569] dark:text-[#94A3B8]">Class:</span>
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="h-9 px-3 rounded-lg border border-[#E2E8F0] dark:border-[#232E44] bg-[#F6F8FC] dark:bg-[#1A2336] text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              >
                <option value="ALL">All Classes</option>
                {classOptions.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            {viewMode === 'STUDENTS' && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#475569] dark:text-[#94A3B8]">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as StudentSortMode)}
                  className="h-9 px-3 rounded-lg border border-[#E2E8F0] dark:border-[#232E44] bg-[#F6F8FC] dark:bg-[#1A2336] text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                >
                  <option value="ID">Student ID</option>
                  <option value="NAME">Name (A → Z)</option>
                  <option value="DUES">Highest Dues First</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pinned Quick-Action Student Spotlight Banner (Appears automatically on single student match) */}
      {spotlightStudent && (
        <div className="rounded-2xl bg-gradient-to-r from-[#EEF2FF] via-white to-[#F6F8FC] dark:from-[#1B2440] dark:via-[#121826] dark:to-[#121826] border-2 border-[#C7D2FE] dark:border-[#3730A3] p-5 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#4F46E5] text-white">
                <Sparkles className="w-3 h-3" />
                Spotlight Match
              </span>
              <span className="inline-flex items-center whitespace-nowrap px-2.5 py-0.5 rounded-lg font-mono text-xs font-extrabold bg-white dark:bg-[#090D16] text-[#4F46E5] dark:text-[#6366F1] border border-[#C7D2FE] dark:border-[#3730A3]">
                {spotlightStudent.student.id}
              </span>
              <span className="text-xs font-semibold text-[#475569] dark:text-[#94A3B8]">
                {spotlightStudent.student.classGrade} • Roll #{spotlightStudent.student.rollNo}
              </span>
            </div>

            <div className="flex items-baseline gap-3 flex-wrap">
              <h3 className="text-lg font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
                {spotlightStudent.student.name}
              </h3>
              <span className="text-xs text-[#475569] dark:text-[#94A3B8] flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {spotlightStudent.student.parentName} (+91 {spotlightStudent.student.parentPhone})
              </span>
            </div>

            <div className="flex items-center gap-3 flex-wrap text-xs">
              <span className="font-bold text-[#059669] dark:text-[#34D399]">
                Paid: ₹{spotlightStudent.totalPaid.toLocaleString('en-IN')}
              </span>
              <span className="text-[#94A3B8]">•</span>
              <span
                className={`font-extrabold ${
                  spotlightStudent.balanceDue > 0
                    ? 'text-[#D97706] dark:text-[#FBBF24]'
                    : 'text-[#059669] dark:text-[#34D399]'
                }`}
              >
                {spotlightStudent.balanceDue > 0
                  ? `₹${spotlightStudent.balanceDue.toLocaleString('en-IN')} Due`
                  : 'All 4 Quarters Paid'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {spotlightStudent.nextPendingInstallment ? (
              <>
                <button
                  type="button"
                  onClick={() => setActiveCollectModal(spotlightStudent.nextPendingInstallment)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#059669] hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
                >
                  <Banknote className="w-4 h-4" />
                  <span>
                    Collect Pending Fee (₹
                    {spotlightStudent.nextPendingInstallment.amount.toLocaleString('en-IN')})
                  </span>
                </button>
                <a
                  href={buildWhatsAppFeeReminderUrl(
                    spotlightStudent.student,
                    spotlightStudent.nextPendingInstallment,
                    schoolProfile
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#ECFDF5] dark:bg-[rgba(16,185,129,0.14)] text-[#059669] dark:text-[#34D399] border border-emerald-200 dark:border-emerald-800/50 text-xs font-bold transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>WhatsApp Due Reminder</span>
                </a>
              </>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#ECFDF5] dark:bg-[rgba(16,185,129,0.14)] text-[#059669] dark:text-[#34D399] text-xs font-bold border border-emerald-200 dark:border-emerald-800/50">
                <CheckCircle2 className="w-4 h-4" />
                Zero Pending Balance
              </span>
            )}

            <button
              type="button"
              onClick={() => handleOpenAllQuartersForStudent(spotlightStudent.student.id)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1A2336] hover:bg-[#EEF2F7] dark:hover:bg-[#232E44] text-[#0F172A] dark:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-bold transition-colors cursor-pointer"
            >
              <ListChecks className="w-3.5 h-3.5 text-[#4F46E5] dark:text-[#6366F1]" />
              <span>View All 4 Quarters</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Ledger Table */}
      <div className="bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {viewMode === 'STUDENTS' ? (
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-[#EEF2F7]/80 dark:bg-[#1A2336]/80 border-b border-[#E2E8F0] dark:border-[#232E44] text-[#475569] dark:text-[#94A3B8] font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Student ID</th>
                  <th className="px-4 py-3.5">Student & Class</th>
                  <th className="px-4 py-3.5">Parent Contact</th>
                  <th className="px-4 py-3.5">4-Quarter Progress</th>
                  <th className="px-4 py-3.5">Paid / Balance</th>
                  <th className="px-4 py-3.5 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#232E44] text-[#0F172A] dark:text-[#F8FAFC]">
                {pagedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-[#94A3B8]">
                      No students match your search query or filters.
                    </td>
                  </tr>
                ) : (
                  pagedStudents.map((summary) => {
                    const { student, installments, nextPendingInstallment, latestPaidInstallment } =
                      summary;
                    const isExpanded = expandedStudentId === student.id;

                    return (
                      <React.Fragment key={student.id}>
                        <tr className="hover:bg-[#F6F8FC] dark:hover:bg-[#1A2336]/40 transition-colors">
                          <td className="px-4 py-3.5">
                            <span className="inline-flex items-center whitespace-nowrap px-2.5 py-1 rounded-lg font-mono font-extrabold text-xs bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#6366F1] border border-[#C7D2FE] dark:border-[#3730A3]">
                              {student.id}
                            </span>
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="font-bold text-[#0F172A] dark:text-[#F8FAFC] text-sm">
                              {student.name}
                            </div>
                            <div className="text-[11px] text-[#475569] dark:text-[#94A3B8]">
                              {student.classGrade} • Roll #{student.rollNo}
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="font-medium text-[#0F172A] dark:text-[#F8FAFC]">
                              {student.parentName}
                            </div>
                            <div className="font-mono text-[11px] text-[#475569] dark:text-[#94A3B8]">
                              +91 {student.parentPhone}
                            </div>
                          </td>

                          {/* 4-Quarter Visual Progress Dots */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {installments.map((inst, idx) => {
                                const qLabel = `Q${idx + 1}`;
                                const paid = inst.status === 'PAID';
                                const overdue = inst.status === 'OVERDUE';
                                return (
                                  <button
                                    key={inst.id}
                                    type="button"
                                    onClick={() =>
                                      paid
                                        ? setActiveReceiptModal(inst)
                                        : setActiveCollectModal(inst)
                                    }
                                    title={
                                      paid
                                        ? `${inst.quarter}: PAID (${formatReceiptNumber(inst.receiptNumber)}) — Click for receipt`
                                        : `${inst.quarter}: ₹${inst.amount.toLocaleString('en-IN')} Due — Click to collect`
                                    }
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-transform hover:scale-105 cursor-pointer ${
                                      paid
                                        ? 'bg-[#ECFDF5] dark:bg-[rgba(16,185,129,0.14)] text-[#059669] dark:text-[#34D399] border-emerald-200 dark:border-emerald-800/40'
                                        : overdue
                                        ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                                        : 'bg-[#FFFBEB] dark:bg-[rgba(245,158,11,0.14)] text-[#D97706] dark:text-[#FBBF24] border-amber-200 dark:border-amber-500/30'
                                    }`}
                                  >
                                    <span>{qLabel}</span>
                                    <span>{paid ? '✓' : 'Due'}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </td>

                          {/* Paid / Balance */}
                          <td className="px-4 py-3.5">
                            <div className="font-bold text-[#059669] dark:text-[#34D399]">
                              ₹{summary.totalPaid.toLocaleString('en-IN')} Paid
                            </div>
                            <div
                              className={`text-[11px] font-semibold ${
                                summary.balanceDue > 0
                                  ? 'text-[#D97706] dark:text-[#FBBF24]'
                                  : 'text-[#94A3B8]'
                              }`}
                            >
                              {summary.balanceDue > 0
                                ? `₹${summary.balanceDue.toLocaleString('en-IN')} Due`
                                : 'All Clear'}
                            </div>
                          </td>

                          {/* Quick Actions */}
                          <td className="px-4 py-3.5 text-right">
                            <div className="inline-flex items-center justify-end gap-1.5 flex-wrap">
                              {nextPendingInstallment && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => setActiveCollectModal(nextPendingInstallment)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#059669] hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs transition-colors cursor-pointer"
                                  >
                                    <Banknote className="w-3.5 h-3.5" />
                                    <span>Collect Next Due</span>
                                  </button>

                                  <a
                                    href={buildWhatsAppFeeReminderUrl(
                                      student,
                                      nextPendingInstallment,
                                      schoolProfile
                                    )}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Send WhatsApp Reminder"
                                    className="p-1.5 rounded-lg bg-[#ECFDF5] dark:bg-[rgba(16,185,129,0.14)] text-[#059669] dark:text-[#34D399] border border-emerald-200 dark:border-emerald-800/50 hover:opacity-85 transition"
                                  >
                                    <Share2 className="w-3.5 h-3.5" />
                                  </a>
                                </>
                              )}

                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedStudentId(isExpanded ? null : student.id)
                                }
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#EEF2F7] dark:bg-[#1A2336] hover:bg-slate-200 dark:hover:bg-[#232E44] text-[#0F172A] dark:text-[#F8FAFC] text-[11px] font-bold transition-colors cursor-pointer"
                              >
                                <FileCheck className="w-3.5 h-3.5 text-[#4F46E5] dark:text-[#6366F1]" />
                                <span>{latestPaidInstallment ? 'Receipts' : 'Quarters'}</span>
                                {isExpanded ? (
                                  <ChevronUp className="w-3 h-3" />
                                ) : (
                                  <ChevronDown className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Inline Expandable 4-Quarter Drawer */}
                        {isExpanded && (
                          <tr className="bg-[#F6F8FC] dark:bg-[#090D16]/70">
                            <td colSpan={6} className="px-6 py-4">
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                {installments.map((inst) => {
                                  const paid = inst.status === 'PAID';
                                  return (
                                    <div
                                      key={inst.id}
                                      className="p-3 rounded-xl bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] flex flex-col justify-between gap-2"
                                    >
                                      <div className="flex items-start justify-between gap-2">
                                        <div>
                                          <div className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                                            {inst.quarter}
                                          </div>
                                          <div className="text-[11px] text-[#94A3B8]">
                                            Due: {inst.dueDate}
                                          </div>
                                        </div>
                                        <span
                                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                            paid
                                              ? 'bg-[#ECFDF5] dark:bg-[rgba(16,185,129,0.14)] text-[#059669] dark:text-[#34D399]'
                                              : 'bg-[#FFFBEB] dark:bg-[rgba(245,158,11,0.14)] text-[#D97706] dark:text-[#FBBF24]'
                                          }`}
                                        >
                                          {inst.status}
                                        </span>
                                      </div>

                                      <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0] dark:border-[#232E44] gap-1.5">
                                        <div>
                                          <span className="font-extrabold text-sm text-[#0F172A] dark:text-[#F8FAFC]">
                                            ₹{inst.amount.toLocaleString('en-IN')}
                                          </span>
                                          {(inst.concessionAmount || 0) > 0 && (
                                            <span className="block text-[10px] font-bold text-[#059669] dark:text-[#34D399]">
                                              -₹{(inst.concessionAmount || 0).toLocaleString('en-IN')} concession
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                          {isPrincipalAdmin && (
                                            <button
                                              type="button"
                                              onClick={() => setActiveEditModal(inst)}
                                              title="Edit Fee / Concession"
                                              aria-label={`Edit fee or concession for ${inst.quarter}`}
                                              className="p-1 rounded-lg bg-[#EEF2F7] dark:bg-[#1A2336] hover:bg-[#EEF2FF] dark:hover:bg-[#1B2440] text-[#4F46E5] dark:text-[#818CF8] border border-[#E2E8F0] dark:border-[#232E44] cursor-pointer"
                                            >
                                              <Pencil className="w-3 h-3" aria-hidden="true" />
                                            </button>
                                          )}
                                          {paid ? (
                                            <button
                                              type="button"
                                              onClick={() => setActiveReceiptModal(inst)}
                                              className="px-2.5 py-1 rounded-lg bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#6366F1] text-[11px] font-bold cursor-pointer"
                                            >
                                              {formatReceiptNumber(inst.receiptNumber)}
                                            </button>
                                          ) : (
                                            <button
                                              type="button"
                                              onClick={() => setActiveCollectModal(inst)}
                                              className="px-2.5 py-1 rounded-lg bg-[#059669] text-white text-[11px] font-bold cursor-pointer"
                                            >
                                              Collect
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-[#EEF2F7]/80 dark:bg-[#1A2336]/80 border-b border-[#E2E8F0] dark:border-[#232E44] text-[#475569] dark:text-[#94A3B8] font-bold uppercase text-[10px] tracking-wider">
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
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#232E44] text-[#0F172A] dark:text-[#F8FAFC]">
                {pagedInstallments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-[#94A3B8]">
                      No installment transactions match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  pagedInstallments.map((inst) => {
                    const isPaid = inst.status === 'PAID';
                    const isOverdue = inst.status === 'OVERDUE';
                    const student = studentByIdMap.get(inst.studentId);

                    return (
                      <tr
                        key={inst.id}
                        className="hover:bg-[#F6F8FC] dark:hover:bg-[#1A2336]/40 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="font-bold text-[#0F172A] dark:text-[#F8FAFC] text-xs">
                            {inst.studentName}
                          </div>
                          <p className="text-[11px] text-[#475569] dark:text-[#94A3B8] mt-0.5">
                            <span className="font-mono font-bold text-[#4F46E5] dark:text-[#6366F1]">
                              {inst.studentId}
                            </span>{' '}
                            • {inst.classGrade} • Roll #{student?.rollNo || '--'}
                          </p>
                        </td>

                        <td className="px-4 py-3 font-medium">
                          {inst.quarter}
                          <p className="text-[10px] text-[#94A3B8]">
                            {isPaid ? `Paid: ${inst.paidDate || 'Verified'}` : `Due: ${inst.dueDate}`}
                          </p>
                        </td>

                        <td className="px-4 py-3 font-extrabold text-sm tabular-nums">
                          <div>₹{inst.amount.toLocaleString('en-IN')}</div>
                          {(inst.concessionAmount || 0) > 0 && (
                            <span className="text-[10px] font-bold text-[#059669] dark:text-[#34D399]">
                              -₹{(inst.concessionAmount || 0).toLocaleString('en-IN')}{' '}
                              {inst.concessionReason ? `(${inst.concessionReason})` : 'concession'}
                            </span>
                          )}
                          {(inst.lateFee || 0) > 0 && (
                            <span className="block text-[10px] font-bold text-[#D97706] dark:text-[#FBBF24]">
                              +₹{(inst.lateFee || 0).toLocaleString('en-IN')} late fee
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          {inst.paymentMethod === 'ONLINE_UPI' && (
                            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-[#4F46E5] dark:text-[#6366F1] bg-[#EEF2FF] dark:bg-[#1B2440] px-2 py-0.5 rounded-md border border-[#C7D2FE] dark:border-[#3730A3]">
                              <Smartphone className="w-3 h-3" />
                              <span>Online UPI</span>
                            </div>
                          )}
                          {inst.paymentMethod === 'OFFLINE_CASH' && (
                            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-[#059669] dark:text-[#34D399] bg-[#ECFDF5] dark:bg-[rgba(16,185,129,0.14)] px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                              <Banknote className="w-3 h-3" />
                              <span>Offline Cash</span>
                            </div>
                          )}
                          {inst.paymentMethod === 'OFFLINE_CHEQUE' && (
                            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-200 dark:border-cyan-800">
                              <Building2 className="w-3 h-3" />
                              <span>Offline Cheque</span>
                            </div>
                          )}
                          {!inst.paymentMethod && (
                            <span className="text-[11px] text-[#94A3B8] font-medium">Unsettled</span>
                          )}
                          {inst.paymentRef && (
                            <p className="text-[10px] font-mono text-[#94A3B8] mt-0.5 truncate max-w-xs">
                              {inst.paymentRef}
                            </p>
                          )}
                        </td>

                        <td className="px-4 py-3 font-mono font-bold text-xs">
                          {formatReceiptNumber(inst.receiptNumber)}
                        </td>

                        <td className="px-4 py-3">
                          {isPaid ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] dark:bg-[rgba(16,185,129,0.14)] dark:text-[#34D399] border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle2 className="w-3 h-3" /> PAID
                            </span>
                          ) : isOverdue ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                              <AlertCircle className="w-3 h-3" /> OVERDUE
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#FFFBEB] text-[#D97706] dark:bg-[rgba(245,158,11,0.14)] dark:text-[#FBBF24] border border-amber-200 dark:border-amber-800">
                              <Clock className="w-3 h-3" /> PENDING
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isPrincipalAdmin && (
                              <button
                                type="button"
                                onClick={() => setActiveEditModal(inst)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#EEF2FF] dark:bg-[#1B2440] hover:bg-[#4F46E5] hover:text-white text-[#4F46E5] dark:text-[#818CF8] border border-[#C7D2FE] dark:border-[#3730A3] text-[11px] font-bold transition cursor-pointer"
                              >
                                <Pencil className="w-3 h-3" aria-hidden="true" />
                                <span>Edit Fee / Concession</span>
                              </button>
                            )}
                            {isPaid ? (
                              <button
                                type="button"
                                onClick={() => setActiveReceiptModal(inst)}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-[#EEF2F7] dark:bg-[#1A2336] hover:bg-slate-200 dark:hover:bg-[#232E44] text-[#0F172A] dark:text-[#F8FAFC] rounded-lg text-[11px] font-bold transition cursor-pointer"
                              >
                                <FileCheck className="w-3.5 h-3.5 text-[#4F46E5] dark:text-[#6366F1]" />
                                <span>View / Print Receipt</span>
                              </button>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setActiveCollectModal(inst)}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-[#059669] hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shadow-xs transition cursor-pointer"
                                >
                                  <Banknote className="w-3.5 h-3.5" />
                                  <span>Collect Fee</span>
                                </button>

                                <a
                                  href={buildWhatsAppFeeReminderUrl(student, inst, schoolProfile)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Send WhatsApp Fee Reminder"
                                  className="p-1.5 bg-[#ECFDF5] dark:bg-[rgba(16,185,129,0.14)] text-[#059669] dark:text-[#34D399] border border-emerald-200 dark:border-emerald-800 rounded-lg transition"
                                >
                                  <Share2 className="w-3.5 h-3.5" />
                                </a>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Client-side Pagination Footer (scales cleanly to thousands of records) */}
        <div className="px-4 py-3 bg-[#F6F8FC] dark:bg-[#0D1320] border-t border-[#E2E8F0] dark:border-[#232E44] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#475569] dark:text-[#94A3B8]">
          <span>
            Showing{' '}
            <strong className="text-[#0F172A] dark:text-[#F8FAFC]">
              {totalItems === 0 ? 0 : startIdx + 1}–{Math.min(startIdx + pageSize, totalItems)}
            </strong>{' '}
            of <strong className="text-[#0F172A] dark:text-[#F8FAFC]">{totalItems}</strong>{' '}
            {viewMode === 'STUDENTS' ? 'students' : 'installments'}
          </span>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-bold disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>
            <span className="font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              Page {safePage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-bold disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Modals */}
      {activeCollectModal && (
        <OfflineFeeModal
          installment={activeCollectModal}
          onClose={() => setActiveCollectModal(null)}
          onSuccess={(info) => {
            const updated = useAdminStore
              .getState()
              .feeInstallments.find((f) => f.receiptNumber === info.receiptNumber);
            setActiveCollectModal(null);
            if (updated) {
              setActiveReceiptModal(updated);
            }
          }}
        />
      )}

      {activeReceiptModal && (
        <ReceiptModal
          installment={activeReceiptModal}
          onClose={() => setActiveReceiptModal(null)}
        />
      )}

      {isPrincipalAdmin && activeEditModal && (
        <EditInstallmentModal
          installment={activeEditModal}
          onClose={() => setActiveEditModal(null)}
        />
      )}
    </div>
  );
};

export default FeesPage;
