import React from 'react';
import {
  CreditCard,
  TrendingUp,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  Boxes,
  Users,
  BookOpen,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Receipt,
  IndianRupee,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { useAdminStore } from '../store/useAdminStore';

interface DashboardPageProps {
  onNavigate?: (tab: any) => void;
  onOpenFeeModal?: () => void;
  onOpenCsvModal?: () => void;
  onOpenSyllabusModal?: () => void;
}

const MONTHLY_FEE_DATA = [
  { month: 'Apr 26 (Q1)', onlineUpi: 120000, offlineCashCheque: 90000 },
  { month: 'Jul 26 (Q2)', onlineUpi: 110000, offlineCashCheque: 50000 },
  { month: 'Oct 26 (Q3)', onlineUpi: 110000, offlineCashCheque: 45000 },
  { month: 'Nov 26 (Q4)', onlineUpi: 52000, offlineCashCheque: 0 },
];

const SYLLABUS_ENGAGEMENT_DATA = [
  { subject: 'Biology (Ch 6)', class10Mastery: 75, atHomeArHours: 42 },
  { subject: 'Physics (Ch 10)', class10Mastery: 50, atHomeArHours: 35 },
  { subject: 'Maths (Ch 4)', class10Mastery: 33, atHomeArHours: 28 },
  { subject: 'Chemistry (Ch 1)', class10Mastery: 85, atHomeArHours: 38 },
  { subject: 'English Lit', class10Mastery: 90, atHomeArHours: 18 },
];

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onOpenFeeModal,
  onOpenCsvModal,
  onOpenSyllabusModal,
}) => {
  const { students, feeInstallments, syllabusVault, schoolProfile, studentProgressList } = useAdminStore();
  const schoolBoard = (schoolProfile.board || 'CBSE').split(' ')[0].toUpperCase();

  const liveEngagementData = syllabusVault.slice(0, 5).map((ch, idx) => {
    const progRows = studentProgressList.filter((p) => p.roadmapId === ch.id);
    const avgMastery =
      progRows.length > 0
        ? Math.round(progRows.reduce((s, r) => s + r.completionPct, 0) / progRows.length)
        : [75, 50, 33, 85, 68][idx % 5];

    return {
      subject: `${ch.subject.split(' ')[0]} (Ch ${ch.chapterNumber})`,
      class10Mastery: avgMastery,
      atHomeArHours: Math.max(12, Math.round(avgMastery * 0.55)),
    };
  });

  const totalExpectedFees = students.reduce((sum, s) => sum + s.annualFee, 0);
  const totalCollectedFees = students.reduce((sum, s) => sum + s.totalPaid, 0);
  const totalPendingDues = students.reduce((sum, s) => sum + s.totalPending, 0);
  const totalAtHomeHours = students.reduce((sum, s) => sum + s.atHomeHoursThisWeek, 0);

  const defaultersCount = students.filter((s) => s.totalPending > 0).length;

  const paidInstallments = feeInstallments.filter((f) => f.status === 'PAID');
  const upiCollected = paidInstallments
    .filter((f) => f.paymentMethod === 'ONLINE_UPI')
    .reduce((sum, f) => sum + f.amount, 0);
  const offlineCollected = paidInstallments
    .filter((f) => f.paymentMethod === 'OFFLINE_CASH' || f.paymentMethod === 'OFFLINE_CHEQUE')
    .reduce((sum, f) => sum + f.amount, 0);

  // Recent fee receipts
  const recentPayments = paidInstallments.slice(-5).reverse();

  return (
    <div className="space-y-6">
      {/* Top Banner for School Principals */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.25),transparent_70%)] pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] bg-indigo-500/30 text-indigo-300 font-extrabold px-2.5 py-0.5 rounded-full border border-indigo-400/30 tracking-wider">
                EXECUTIVE COCKPIT
              </span>
              <span className="text-xs text-slate-300 font-medium">{schoolBoard} Academic Session {schoolProfile.session}</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-black tracking-tight text-white">
              {schoolProfile.name} Command Center
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Replacing fragmented paper fee registers with instant UPI / Offline reconciliation and transforming at-home self-study with school-verified {schoolBoard} 3D AR spatial simulations.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenFeeModal}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition flex items-center gap-1.5"
            >
              <CreditCard className="w-4 h-4" />
              <span>Collect Fee</span>
            </button>
            <button
              onClick={onOpenCsvModal}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center gap-1.5"
            >
              <Users className="w-4 h-4" />
              <span>Import CSV</span>
            </button>
            <button
              onClick={onOpenSyllabusModal}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Publish Syllabus</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 CORE EXECUTIVE KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Expected Revenue */}
        <div className="bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] rounded-2xl p-5 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider">
              Total Expected Fees
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#EEF2F7] dark:bg-[#1A2336] flex items-center justify-center text-slate-600 dark:text-slate-300">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-[#F8FAFC] mt-2">
            ₹{totalExpectedFees.toLocaleString('en-IN')}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-[#94A3B8] mt-2">
            <span className="font-semibold text-slate-800 dark:text-[#F8FAFC]">{students.length} Enrolled Students</span>
            <span>across Class 9 & 10</span>
          </div>
        </div>

        {/* KPI 2: Fees Collected (Split Online vs Offline) */}
        <div className="bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] rounded-2xl p-5 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Fees Collected to Date
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            ₹{totalCollectedFees.toLocaleString('en-IN')}
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-[#94A3B8] mt-2 pt-2 border-t border-slate-100 dark:border-[#232E44] font-medium">
            <span>Online UPI: <strong className="text-indigo-600 dark:text-indigo-400">₹{upiCollected.toLocaleString('en-IN')}</strong></span>
            <span>Offline: <strong className="text-slate-700 dark:text-slate-300">₹{offlineCollected.toLocaleString('en-IN')}</strong></span>
          </div>
        </div>

        {/* KPI 3: Pending Dues */}
        <div className="bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] rounded-2xl p-5 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
              Pending Dues
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">
            ₹{totalPendingDues.toLocaleString('en-IN')}
          </p>
          <div className="flex items-center justify-between text-[11px] mt-2">
            <span className="text-amber-800 dark:text-amber-300 font-bold bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
              {defaultersCount} Students with Dues
            </span>
            <button
              onClick={() => onNavigate?.('fees')}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-bold inline-flex items-center gap-0.5 text-[11px]"
            >
              Collect <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* KPI 4: Active At-Home Study Hours */}
        <div className="bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] rounded-2xl p-5 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
              At-Home Study Hours
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-2">
            {totalAtHomeHours.toFixed(1)} hrs
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 mt-2 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ROI: Replaces external tuition fees</span>
          </div>
        </div>
      </div>

      {/* RECHARTS DATA VISUALIZATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Monthly Fee Collection (Online UPI vs Offline Cash/Cheque) */}
        <div className="bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">
                Quarterly Fee Collection Stream (FY 2026-27)
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-medium">
                Comparing Edzy Mobile UPI vs Physical Cash/Cheque Receptions
              </p>
            </div>
            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-100 dark:border-indigo-800">
              ₹{(totalCollectedFees / 100000).toFixed(2)}L Collected
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_FEE_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '11px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="onlineUpi" name="Edzy App UPI" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="offlineCashCheque" name="Offline Cash/Cheque" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Class-Wise Syllabus Mastery & AR Engagement */}
        <div className="bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">
                Syllabus Mastery & At-Home AR Engagement
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-medium">
                Average milestone completion % and student spatial lab hours
              </p>
            </div>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-100 dark:border-emerald-800">
              {syllabusVault.length} Chapters Published
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={liveEngagementData.length > 0 ? liveEngagementData : SYLLABUS_ENGAGEMENT_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMastery" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorAR" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '11px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area
                  type="monotone"
                  dataKey="class10Mastery"
                  name="Syllabus Mastery %"
                  stroke="#4F46E5"
                  fillOpacity={1}
                  fill="url(#colorMastery)"
                />
                <Area
                  type="monotone"
                  dataKey="atHomeArHours"
                  name="At-Home AR Hours"
                  stroke="#06B6D4"
                  fillOpacity={1}
                  fill="url(#colorAR)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Fee & Activity Feed */}
      <div className="bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">
              Recent Fee & Activity Feed
            </h3>
          </div>
          <button
            onClick={() => onNavigate?.('fees')}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1"
          >
            View Full Ledger <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F6F8FC] dark:bg-[#1A2336]/80 border-b border-slate-100 dark:border-[#232E44] text-slate-500 dark:text-[#94A3B8] font-semibold uppercase">
                <th className="py-2.5 px-3">Receipt #</th>
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">Class & Roll</th>
                <th className="py-2.5 px-3">Quarter</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Instrument</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Study Telemetry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#232E44]">
              {recentPayments.map((inst) => {
                const st = students.find((s) => s.id === inst.studentId);
                const isOnline = inst.paymentMethod === 'ONLINE_UPI';

                return (
                  <tr key={inst.id} className="hover:bg-[#F6F8FC]/50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {inst.receiptNumber?.startsWith('#') ? inst.receiptNumber : `#${inst.receiptNumber || 'REC'}`}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900 dark:text-[#F8FAFC]">{inst.studentName}</div>
                      <div className="text-[11px] font-mono text-slate-400">{inst.studentId}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                      <div>{inst.classGrade}</div>
                      <div className="text-[11px] text-slate-400">Roll #{st?.rollNo || '--'}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-medium">
                      {inst.quarter.split(' ')[0]}
                    </td>
                    <td className="py-3 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{inst.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          isOnline
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                            : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        }`}
                      >
                        {isOnline ? 'Online UPI' : inst.paymentMethod === 'OFFLINE_CHEQUE' ? 'Cheque' : 'Cash'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500 dark:text-[#94A3B8]">
                      {inst.paidDate || 'Paid'}
                    </td>
                    <td className="py-3 px-3">
                      {(() => {
                        const liveProg = studentProgressList.find((p) => p.studentId === inst.studentId);
                        return (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                              <Clock className="w-3.5 h-3.5 text-indigo-500" />
                              <span>{st?.atHomeHoursThisWeek || 0} hrs/wk</span>
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                                ({st?.streakDays || 0}d streak)
                              </span>
                            </div>
                            {liveProg && (
                              <div className="text-[10px] font-bold text-[#4F46E5] dark:text-[#6366F1]">
                                Roadmap Mastery: {liveProg.completionPct}% •{' '}
                                {liveProg.paceStatus === 'AUTO_ADJUSTED' ? 'Auto-Adjusted' : 'On Track'}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
