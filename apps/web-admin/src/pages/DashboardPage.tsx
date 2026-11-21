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
  { month: 'Apr', onlineUpi: 144000, offlineCashCheque: 120000 },
  { month: 'May', onlineUpi: 36000, offlineCashCheque: 24000 },
  { month: 'Jun', onlineUpi: 24000, offlineCashCheque: 12000 },
  { month: 'Jul', onlineUpi: 156000, offlineCashCheque: 96000 },
  { month: 'Aug', onlineUpi: 48000, offlineCashCheque: 24000 },
  { month: 'Sep', onlineUpi: 24000, offlineCashCheque: 12000 },
  { month: 'Oct', onlineUpi: 168000, offlineCashCheque: 72000 },
  { month: 'Nov', onlineUpi: 60000, offlineCashCheque: 36000 },
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
  const { students, feeInstallments, syllabusVault } = useAdminStore();

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

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Pitch Banner for School Principals */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.25),transparent_70%)] pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] bg-indigo-500/30 text-indigo-300 font-extrabold px-2.5 py-0.5 rounded-full border border-indigo-400/30 tracking-wider">
                EXECUTIVE COCKPIT
              </span>
              <span className="text-xs text-slate-300 font-medium">CBSE Academic Session 2026-2027</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-black tracking-tight text-white">
              Doon Valley Public School Command Center
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Replacing fragmented paper fee registers with instant UPI / Offline reconciliation and transforming at-home self-study with CBSE-grounded 3D AR spatial simulations.
            </p>
          </div>

          {/* Quick Pitch Action Buttons */}
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
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Expected Fees
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            ₹{totalExpectedFees.toLocaleString('en-IN')}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-2">
            <span className="font-semibold text-slate-800">{students.length} Enrolled Students</span>
            <span>across Class 9 & 10</span>
          </div>
        </div>

        {/* KPI 2: Fees Collected (Split Online vs Offline) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Fees Collected to Date
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">
            ₹{totalCollectedFees.toLocaleString('en-IN')}
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100 font-medium">
            <span>Online UPI: <strong className="text-indigo-600">₹{upiCollected.toLocaleString('en-IN')}</strong></span>
            <span>Offline: <strong className="text-slate-700">₹{offlineCollected.toLocaleString('en-IN')}</strong></span>
          </div>
        </div>

        {/* KPI 3: Pending Dues */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              Pending Dues
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2">
            ₹{totalPendingDues.toLocaleString('en-IN')}
          </p>
          <div className="flex items-center justify-between text-[11px] mt-2">
            <span className="text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded-full">
              {defaultersCount} Students with Dues
            </span>
            <button
              onClick={() => onNavigate?.('fees')}
              className="text-indigo-600 hover:text-indigo-700 font-bold inline-flex items-center gap-0.5 text-[11px]"
            >
              Collect <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* KPI 4: Active At-Home Study Hours */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
              At-Home Study Hours
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-indigo-600 mt-2">
            {totalAtHomeHours.toFixed(1)} hrs
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 mt-2 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ROI: Replaces external tuition fees</span>
          </div>
        </div>
      </div>

      {/* RECHARTS DATA VISUALIZATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Monthly Fee Collection (Online UPI vs Offline Cash/Cheque) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Monthly Fee Collection Stream (FY 2026-27)
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Comparing Edzy Mobile UPI vs Physical Cash/Cheque Receptions
              </p>
            </div>
            <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
              ₹7.2L Collected
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_FEE_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
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
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Syllabus Mastery & At-Home AR Engagement
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Average milestone completion % and student spatial lab hours
              </p>
            </div>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
              {syllabusVault.length} Chapters Published
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SYLLABUS_ENGAGEMENT_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
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

      {/* Flagship Student Highlight: Aarav Sharma Side-by-Side Sync */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Active Demo Flagship Student Sync Record
            </h3>
          </div>
          <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
            Mirrors apps/mobile-app
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase">Student Name</span>
            <p className="text-sm font-bold text-slate-900 mt-0.5">Aarav Sharma</p>
            <p className="text-xs font-mono text-indigo-600">SCH-2026-0104</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase">Class & Roll</span>
            <p className="text-sm font-bold text-slate-900 mt-0.5">Class 10-A</p>
            <p className="text-xs text-slate-600">Roll #24 • Parent: Rajesh Sharma</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase">Fee Status</span>
            <p className="text-sm font-bold text-amber-600 mt-0.5">₹36,000 Paid / ₹12,000 Due</p>
            <p className="text-xs text-slate-500">Q4 Due 30 Nov 2026</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase">Active Spatial Study</span>
            <p className="text-sm font-bold text-emerald-600 mt-0.5">6.5 hrs this week (12d Streak)</p>
            <p className="text-xs text-slate-500">Bio Ch 6: Human Heart 3D</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
