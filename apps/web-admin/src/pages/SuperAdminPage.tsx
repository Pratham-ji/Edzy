import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  ShieldCheck,
  Building2,
  Users,
  GraduationCap,
  IndianRupee,
  Plus,
  Search,
  KeyRound,
  Copy,
  Check,
  Printer,
  Trash2,
  X,
  Lock,
  LogOut,
  RefreshCw,
  AlertTriangle,
  Sun,
  Moon,
  ArrowUpRight,
  School,
  Globe,
  FileSpreadsheet,
  SlidersHorizontal,
  BookOpen,
  CreditCard,
  Activity,
} from 'lucide-react';
import { CANONICAL_SITE_URL, getPortalUrl } from '../lib/siteConfig';
import { isLiveSupabaseConfigured, supabase } from '../lib/supabase';
import { useAdminStore } from '../store/useAdminStore';
import { downloadCsvFile } from '../lib/feeMetrics';
import {
  AggregateFeeRow,
  AggregateStaffRow,
  BILLING_STATUS_META,
  buildFounderEcosystemTelemetry,
  EcosystemSchoolRecord,
  formatCompactInr,
  normalizeBillingStatus,
  normalizePlanTier,
  PLAN_META,
  saveBillingMetaOverride,
  SchoolBillingStatus,
  SchoolPlanTier,
  SchoolTelemetrySummary,
} from '../lib/founderMetrics';

interface SuperAdminPageProps {
  onNavigateHome?: () => void;
  onNavigatePath?: (path: string) => void;
}

interface OnboardingKitData {
  schoolCode: string;
  schoolName: string;
  city: string;
  board: string;
  academicSession: string;
  principalName: string;
  principalEmployeeId: string;
  principalPhone?: string | null;
  isPasswordSet: boolean;
}

type EcosystemFilter = 'ALL' | 'ACTIVE' | 'TRIAL' | 'ATTENTION';

const HQ_SESSION_KEY = 'edzy_hq_founder_auth_v1';
const PUBLIC_SITE_URL = CANONICAL_SITE_URL.replace(/\/$/, '');
const PORTAL_PUBLIC_URL = getPortalUrl(true);
const EXPECTED_PASSKEY =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_FOUNDER_PASSKEY) ||
  'edzy-hq-2026';

function computeNextSchoolSeq(schools: EcosystemSchoolRecord[]): { nextSerial: number; nextCode: string } {
  let maxSerial = 0;
  for (const s of schools) {
    const parsedFromCode = parseInt((s.schoolCode || '').replace(/\D/g, ''), 10);
    maxSerial = Math.max(
      maxSerial,
      Number(s.schoolSerial || 0),
      Number.isFinite(parsedFromCode) ? parsedFromCode : 0
    );
  }
  const nextSerial = Math.max(1, maxSerial + 1);
  return {
    nextSerial,
    nextCode: `SCH-${String(nextSerial).padStart(2, '0')}`,
  };
}

function buildPrincipalWelcomeMessage(kit: OnboardingKitData): string {
  return `Namaste ${kit.principalName},\n\nWelcome to *EDZY: Education Made Easy*!\nYour institution *${kit.schoolName}* (${kit.schoolCode} • ${kit.board} • ${kit.city}) is now live on the Edzy School Command Cloud.\n\n🔗 *ERP Portal:* ${PORTAL_PUBLIC_URL}\n🏫 *School Code:* ${kit.schoolCode}\n🆔 *Principal Employee ID:* ${kit.principalEmployeeId}\n\n*First-Time Activation Instructions:*\n1. Open ${PORTAL_PUBLIC_URL} and enter Employee ID *${kit.principalEmployeeId}*\n2. Set your own private password on first login to launch your dedicated school ERP\n3. Add Class Teachers, Accounts Officers, and import student rosters via CSV\n\nWarm regards,\nEdzy Partner Onboarding Team`;
}

/** Native modal <dialog> wrapper with Esc dismissal, backdrop light-dismiss fallback, and clean return focus. */
const NativeModalDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  ariaLabelledBy: string;
  variant?: 'modal' | 'drawer';
  children: React.ReactNode;
}> = ({ open, onClose, ariaLabelledBy, variant = 'modal', children }) => {
  const ref = useRef<HTMLDialogElement>(null);
  const pressedOutsideRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open) {
      if (!el.open && typeof el.showModal === 'function') {
        el.showModal();
      }
    } else if (el.open) {
      el.close();
    }
  }, [open]);

  if (!open) return null;

  const isOutsideDialog = (e: React.PointerEvent<HTMLDialogElement>) => {
    const el = ref.current;
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    );
  };

  const baseClass =
    variant === 'drawer'
      ? 'm-0 ml-auto h-dvh max-h-dvh w-full max-w-lg bg-white dark:bg-[#121826] text-[#0F172A] dark:text-[#F8FAFC] border-l border-[#E2E8F0] dark:border-[#232E44] shadow-2xl p-0 backdrop:bg-slate-950/60 backdrop:backdrop-blur-xs overflow-y-auto'
      : 'm-auto w-[calc(100%-2rem)] max-w-xl rounded-2xl bg-white dark:bg-[#121826] text-[#0F172A] dark:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#232E44] shadow-2xl p-0 backdrop:bg-slate-950/65 backdrop:backdrop-blur-xs overflow-y-auto';

  return (
    <dialog
      ref={ref}
      aria-labelledby={ariaLabelledBy}
      {...({ closedby: 'any' } as Record<string, string>)}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onPointerDown={(e) => {
        pressedOutsideRef.current = isOutsideDialog(e);
      }}
      onPointerUp={(e) => {
        if (pressedOutsideRef.current && isOutsideDialog(e)) {
          onClose();
        }
        pressedOutsideRef.current = false;
      }}
      className={baseClass}
    >
      {children}
    </dialog>
  );
};

const PrincipalOnboardingKitCard: React.FC<{ kit: OnboardingKitData }> = ({ kit }) => {
  const [copied, setCopied] = useState(false);
  const welcomeMessage = buildPrincipalWelcomeMessage(kit);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(welcomeMessage);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = welcomeMessage;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border-2 border-dashed border-[#C7D2FE] dark:border-[#3730A3] bg-[#F6F8FC] dark:bg-[#090D16] p-5 space-y-4">
        <div className="flex items-start justify-between gap-3 border-b border-[#E2E8F0] dark:border-[#232E44] pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#4F46E5] text-white flex items-center justify-center shrink-0">
              <School className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#4F46E5] dark:text-[#6366F1]">
                EDZY: Education Made Easy • Principal Activation Kit
              </div>
              <h4 className="text-base font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
                {kit.schoolName}
              </h4>
              <p className="text-[11px] text-[#475569] dark:text-[#94A3B8]">
                {kit.board} • {kit.city} • Session {kit.academicSession}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full font-mono text-xs font-extrabold bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#6366F1] border border-[#C7D2FE] dark:border-[#3730A3]">
            {kit.schoolCode}
          </span>
        </div>

        <div className="rounded-xl bg-[#0F172A] dark:bg-[#121826] border border-slate-800 dark:border-[#232E44] p-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Principal Employee ID
            </div>
            <div className="text-xl font-mono font-extrabold text-indigo-300 mt-0.5">
              {kit.principalEmployeeId}
            </div>
          </div>
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
              kit.isPasswordSet
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}
          >
            {kit.isPasswordSet ? 'Activated' : 'Ready for Self-Setup'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white dark:bg-[#121826] rounded-xl p-3.5 border border-[#E2E8F0] dark:border-[#232E44] text-xs">
          <div>
            <div className="text-[10px] font-bold uppercase text-[#94A3B8]">Portal URL</div>
            <div className="font-mono font-bold text-[#4F46E5] dark:text-[#6366F1] mt-0.5 break-all">
              {PORTAL_PUBLIC_URL}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase text-[#94A3B8]">Head of Institution</div>
            <div className="font-bold text-[#0F172A] dark:text-[#F8FAFC] mt-0.5">
              {kit.principalName}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2 text-[11px] text-[#475569] dark:text-[#94A3B8] bg-white/80 dark:bg-[#1A2336]/70 rounded-xl p-3 border border-[#E2E8F0] dark:border-[#232E44]">
          <ShieldCheck className="w-4 h-4 text-[#059669] dark:text-[#34D399] shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            Enter this Employee ID at <span className="font-mono font-semibold">{PORTAL_PUBLIC_URL}</span> and set a private password to launch your school ERP.
          </span>
        </div>
      </div>

      <div className="no-print flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={handleCopy}
          className="flex-1 min-w-[180px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#4F46E5] hover:bg-[#3730A3] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-4 h-4" aria-hidden="true" /> : <Copy className="w-4 h-4" aria-hidden="true" />}
          <span>{copied ? 'Copied Welcome Kit!' : 'Copy WhatsApp Welcome Kit'}</span>
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-[#EEF2F7] dark:bg-[#1A2336] hover:bg-slate-200 dark:hover:bg-[#232E44] text-[#0F172A] dark:text-[#F8FAFC] text-xs font-bold border border-[#E2E8F0] dark:border-[#232E44] cursor-pointer"
        >
          <Printer className="w-4 h-4" aria-hidden="true" />
          <span>Print Kit</span>
        </button>
      </div>
    </div>
  );
};

export default function SuperAdminPage({ onNavigateHome, onNavigatePath }: SuperAdminPageProps) {
  const { themeMode, toggleThemeMode } = useAdminStore();

  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.sessionStorage.getItem(HQ_SESSION_KEY) === 'unlocked';
  });
  const [passkeyInput, setPasskeyInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Strict Zero-PII Aggregate Raw State
  const [schools, setSchools] = useState<EcosystemSchoolRecord[]>([]);
  const [staffRows, setStaffRows] = useState<AggregateStaffRow[]>([]);
  const [studentSchoolIds, setStudentSchoolIds] = useState<string[]>([]);
  const [feeRows, setFeeRows] = useState<AggregateFeeRow[]>([]);
  const [syllabusSchoolIds, setSyllabusSchoolIds] = useState<string[]>([]);
  const [circularSchoolIds, setCircularSchoolIds] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<EcosystemFilter>('ALL');
  const [pitchLinkCopied, setPitchLinkCopied] = useState(false);

  // Onboard New School Modal State
  const [isOnboardOpen, setIsOnboardOpen] = useState(false);
  const [schoolName, setSchoolName] = useState('');
  const [city, setCity] = useState('Dehradun');
  const [board, setBoard] = useState('CBSE');
  const [academicSession, setAcademicSession] = useState('2026-27');
  const [planTier, setPlanTier] = useState<SchoolPlanTier>('AI_SUITE');
  const [billingStatus, setBillingStatus] = useState<SchoolBillingStatus>('TRIAL');
  const [principalName, setPrincipalName] = useState('');
  const [principalPhone, setPrincipalPhone] = useState('');
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisionError, setProvisionError] = useState<string | null>(null);
  const [issuedKit, setIssuedKit] = useState<OnboardingKitData | null>(null);

  // Slide-Over Inspector Drawer, Activation Kit Modal, Delete Confirmation
  const [inspectedSchoolCode, setInspectedSchoolCode] = useState<string | null>(null);
  const [drawerKitCopied, setDrawerKitCopied] = useState(false);
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);
  const [planFeedback, setPlanFeedback] = useState<string | null>(null);
  const [inspectKit, setInspectKit] = useState<OnboardingKitData | null>(null);
  const [schoolToDelete, setSchoolToDelete] = useState<EcosystemSchoolRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const onboardTitleId = useId();
  const kitTitleId = useId();
  const deleteTitleId = useId();
  const drawerTitleId = useId();
  const tableCaptionId = useId();

  const navTo = (path: string) => {
    if (onNavigatePath) {
      onNavigatePath(path);
    } else if (path === '/portal' && onNavigateHome) {
      onNavigateHome();
    } else if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  };

  const fetchEcosystemData = useCallback(async () => {
    if (!isLiveSupabaseConfigured) {
      setSchools([
        {
          id: 'SCH-01',
          schoolSerial: 1,
          schoolCode: 'SCH-01',
          name: 'Doon Valley Public School',
          board: 'CBSE',
          academicSession: '2026-27',
          principalName: 'Dr. Meenakshi Sharma',
          planTier: 'AI_SUITE',
          billingStatus: 'ACTIVE',
          city: 'Dehradun',
          contactPhone: '9811000001',
        },
        {
          id: 'SCH-02',
          schoolSerial: 2,
          schoolCode: 'SCH-02',
          name: "St. Joseph's Academy",
          board: 'ICSE',
          academicSession: '2026-27',
          principalName: 'Fr. Joseph Thomas',
          planTier: 'AI_SUITE',
          billingStatus: 'TRIAL',
          city: 'Dehradun',
          contactPhone: null,
        },
      ]);
      setStaffRows([
        {
          id: 'SCH-01-ADM-001',
          schoolId: 'SCH-01',
          department: 'ADM',
          fullName: 'Dr. Meenakshi Sharma',
          phone: '9811000001',
          isPasswordSet: true,
          status: 'ACTIVE',
        },
        {
          id: 'SCH-02-ADM-001',
          schoolId: 'SCH-02',
          department: 'ADM',
          fullName: 'Fr. Joseph Thomas',
          phone: null,
          isPasswordSet: false,
          status: 'ACTIVE',
        },
      ]);
      setStudentSchoolIds(Array.from({ length: 19 }, () => 'SCH-01'));
      setFeeRows([]);
      setSyllabusSchoolIds(['SCH-01', 'SCH-01', 'SCH-01']);
      setCircularSchoolIds(['SCH-01', 'SCH-01']);
      return;
    }

    setIsLoading(true);
    setLoadError(null);
    try {
      // Strictly Zero-PII selects: NEVER query student names, parent phones, marks, or receipt details!
      const [schoolsRes, staffRes, studentsRes, feeRes, sylRes, circRes] = await Promise.all([
        supabase.from('schools').select('*').order('school_serial', { ascending: true }),
        supabase
          .from('school_staff')
          .select('id, school_id, department, full_name, phone, is_password_set, status')
          .order('employee_serial', { ascending: true }),
        supabase.from('students').select('school_id'),
        supabase.from('fee_ledger').select('school_id, status, payment_mode, amount'),
        supabase.from('syllabus_roadmaps').select('school_id'),
        supabase.from('school_circulars').select('school_id'),
      ]);

      if (schoolsRes.error) throw new Error(schoolsRes.error.message);

      setSchools(
        (schoolsRes.data || []).map((s: any, idx: number) => ({
          id: s.id,
          schoolSerial: Number(s.school_serial || idx + 1),
          schoolCode: s.school_code || s.id,
          name: s.name,
          board: s.board || 'CBSE',
          academicSession: s.academic_session || '2026-27',
          principalName: s.principal_name || 'Principal',
          planTier: normalizePlanTier(s.plan_tier),
          billingStatus: normalizeBillingStatus(s.billing_status, s.school_code || s.id),
          city: s.city || 'Dehradun',
          contactPhone: s.contact_phone || null,
          createdAt: s.created_at,
        }))
      );

      setStaffRows(
        (staffRes.data || []).map((st: any) => ({
          id: st.id,
          schoolId: st.school_id,
          department: st.department,
          fullName: st.full_name,
          phone: st.phone || null,
          isPasswordSet: Boolean(st.is_password_set),
          status: st.status || 'ACTIVE',
        }))
      );

      setStudentSchoolIds((studentsRes.data || []).map((r: any) => r.school_id || 'SCH-01'));
      setFeeRows(
        (feeRes.data || []).map((f: any) => ({
          schoolId: f.school_id || 'SCH-01',
          status: f.status || 'PENDING',
          paymentMode: f.payment_mode || 'PENDING',
          amount: Number(f.amount || 0),
        }))
      );
      setSyllabusSchoolIds((sylRes.data || []).map((sy: any) => sy.school_id || 'SCH-01'));
      setCircularSchoolIds((circRes.data || []).map((c: any) => c.school_id || 'SCH-01'));
    } catch (err: any) {
      setLoadError(err?.message || 'Failed to load live ecosystem telemetry.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isUnlocked) {
      fetchEcosystemData();
    }
  }, [isUnlocked, fetchEcosystemData]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passkeyInput.trim() === EXPECTED_PASSKEY) {
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(HQ_SESSION_KEY, 'unlocked');
      }
      setAuthError(null);
      setIsUnlocked(true);
      return;
    }
    setAuthError('Invalid Founder Access Key. Check your internal HQ passkey.');
  };

  const handleLockHq = () => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(HQ_SESSION_KEY);
    }
    setIsUnlocked(false);
    setPasskeyInput('');
  };

  const telemetry = useMemo(
    () =>
      buildFounderEcosystemTelemetry({
        schools,
        staffRows,
        studentSchoolIds,
        feeRows,
        syllabusSchoolIds,
        circularSchoolIds,
      }),
    [schools, staffRows, studentSchoolIds, feeRows, syllabusSchoolIds, circularSchoolIds]
  );

  const nextSeqPreview = useMemo(() => computeNextSchoolSeq(schools), [schools]);

  const filteredSummaries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return telemetry.schoolSummaries.filter((item) => {
      if (activeFilter === 'ACTIVE' && item.billingStatus !== 'ACTIVE') return false;
      if (activeFilter === 'TRIAL' && item.billingStatus !== 'TRIAL') return false;
      if (activeFilter === 'ATTENTION' && item.healthStatus !== 'Needs Attention') return false;

      if (!q) return true;
      return (
        item.school.schoolCode.toLowerCase().includes(q) ||
        item.school.name.toLowerCase().includes(q) ||
        item.school.city.toLowerCase().includes(q) ||
        item.school.board.toLowerCase().includes(q) ||
        item.school.principalName.toLowerCase().includes(q)
      );
    });
  }, [telemetry.schoolSummaries, searchQuery, activeFilter]);

  const inspectedSummary: SchoolTelemetrySummary | null = useMemo(
    () =>
      telemetry.schoolSummaries.find((s) => s.school.schoolCode === inspectedSchoolCode) || null,
    [telemetry.schoolSummaries, inspectedSchoolCode]
  );

  const handleCopyPitchLink = async () => {
    try {
      await navigator.clipboard.writeText(PUBLIC_SITE_URL);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = PUBLIC_SITE_URL;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setPitchLinkCopied(true);
    setTimeout(() => setPitchLinkCopied(false), 2400);
  };

  const handleExportEcosystemCsv = () => {
    const headers = [
      'School Code',
      'Name',
      'City',
      'Board',
      'Plan',
      'Billing Status',
      'Students',
      'MRR (INR)',
      'ARR (INR)',
      'Total Transactions Processed (INR)',
      'Paid Transactions Count',
      'UPI Volume (INR)',
      'Desk Volume (INR)',
      'UPI Adoption %',
      'Total Staff Accounts',
      'Activated Staff Accounts',
      'Health Status',
    ];

    const rows = telemetry.schoolSummaries.map((s) => [
      s.school.schoolCode,
      s.school.name,
      s.school.city,
      s.school.board,
      s.planLabel,
      s.billingLabel,
      s.studentCount,
      s.monthlySaaSRevenue,
      s.annualRunRate,
      s.totalFeeVolumeProcessed,
      s.paidTransactionsCount,
      s.onlineUpiVolume,
      s.offlineDeskVolume,
      `${s.digitalUpiAdoptionPct}%`,
      s.totalStaffCount,
      s.activatedStaffCount,
      s.healthStatus,
    ]);

    downloadCsvFile(
      `edzy-ecosystem-billing-gmv-${new Date().toISOString().split('T')[0]}.csv`,
      headers,
      rows
    );
  };

  const handleUpdateSubscription = async (
    schoolCode: string,
    patch: { planTier?: SchoolPlanTier; billingStatus?: SchoolBillingStatus }
  ) => {
    setIsUpdatingPlan(true);
    setPlanFeedback(null);
    saveBillingMetaOverride(schoolCode, patch);

    setSchools((prev) =>
      prev.map((s) => (s.schoolCode === schoolCode ? { ...s, ...patch } : s))
    );

    try {
      if (isLiveSupabaseConfigured) {
        const dbPatch: Record<string, any> = {};
        if (patch.planTier) dbPatch.plan_tier = patch.planTier;
        if (patch.billingStatus) dbPatch.billing_status = patch.billingStatus;

        const { error } = await supabase.from('schools').update(dbPatch).eq('id', schoolCode);
        if (error) {
          const msg = (error.message || '').toLowerCase();
          if (msg.includes('column') || msg.includes('schema cache') || error.code === 'PGRST204') {
            setPlanFeedback('Updated subscription locally — run updated SQL to sync plan columns.');
          } else {
            throw new Error(error.message);
          }
        } else {
          setPlanFeedback('Subscription plan & billing synced.');
        }
      } else {
        setPlanFeedback('Subscription updated.');
      }
    } catch (err: any) {
      setPlanFeedback(err?.message || 'Saved locally.');
    } finally {
      setIsUpdatingPlan(false);
      setTimeout(() => setPlanFeedback(null), 3000);
    }
  };

  const openOnboardModal = () => {
    setSchoolName('');
    setCity('Dehradun');
    setBoard('CBSE');
    setAcademicSession('2026-27');
    setPlanTier('AI_SUITE');
    setBillingStatus('TRIAL');
    setPrincipalName('');
    setPrincipalPhone('');
    setProvisionError(null);
    setIssuedKit(null);
    setIsOnboardOpen(true);
    fetchEcosystemData();
  };

  const handleOnboardSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = schoolName.trim();
    const cleanCity = city.trim() || 'Dehradun';
    const cleanPrincipal = principalName.trim();
    const cleanSession = academicSession.trim() || '2026-27';
    const cleanPhone = principalPhone.replace(/\D/g, '').slice(0, 10) || null;

    if (!cleanName || !cleanPrincipal || isProvisioning) {
      setProvisionError('School Name, City, and Principal Full Name are required.');
      return;
    }

    setIsProvisioning(true);
    setProvisionError(null);

    try {
      let nextSerial = nextSeqPreview.nextSerial;
      let nextCode = nextSeqPreview.nextCode;

      if (isLiveSupabaseConfigured) {
        const { data: liveSchools, error: seqErr } = await supabase
          .from('schools')
          .select('school_serial, school_code');

        if (seqErr) {
          throw new Error(`Could not compute next School Code: ${seqErr.message}`);
        }

        const liveMapped: EcosystemSchoolRecord[] = (liveSchools || []).map((r: any, idx: number) => ({
          id: r.school_code || `SCH-${idx + 1}`,
          schoolSerial: Number(r.school_serial || idx + 1),
          schoolCode: r.school_code || `SCH-${idx + 1}`,
          name: '',
          board: 'CBSE',
          academicSession: cleanSession,
          principalName: '',
          planTier: 'AI_SUITE',
          billingStatus: 'TRIAL',
          city: cleanCity,
          contactPhone: null,
        }));
        const seq = computeNextSchoolSeq(liveMapped);
        nextSerial = seq.nextSerial;
        nextCode = seq.nextCode;

        const baseSchoolRow = {
          id: nextCode,
          school_serial: nextSerial,
          school_code: nextCode,
          name: cleanName,
          board,
          academic_session: cleanSession,
          principal_name: cleanPrincipal,
        };

        let { error: schoolInsertErr } = await supabase.from('schools').insert({
          ...baseSchoolRow,
          plan_tier: planTier,
          billing_status: billingStatus,
          city: cleanCity,
          contact_phone: cleanPhone,
        });

        // Graceful backward compatibility if SQL optional billing columns haven't been run yet
        if (
          schoolInsertErr &&
          ((schoolInsertErr.message || '').toLowerCase().includes('column') ||
            (schoolInsertErr.message || '').toLowerCase().includes('schema cache') ||
            schoolInsertErr.code === 'PGRST204')
        ) {
          const retryRes = await supabase.from('schools').insert(baseSchoolRow);
          schoolInsertErr = retryRes.error;
        }

        if (schoolInsertErr) {
          throw new Error(`Schools Insert Error (${schoolInsertErr.code || 'DB'}): ${schoolInsertErr.message}`);
        }

        const principalEmployeeId = `${nextCode}-ADM-001`;
        const { error: staffInsertErr } = await supabase.from('school_staff').insert({
          id: principalEmployeeId,
          school_id: nextCode,
          employee_serial: 1,
          full_name: cleanPrincipal,
          department: 'ADM',
          designation: 'Principal & ERP Administrator',
          assigned_class: null,
          subject: null,
          phone: cleanPhone,
          password_hash: null,
          is_password_set: false,
          status: 'ACTIVE',
        });

        if (staffInsertErr) {
          await supabase.from('schools').delete().eq('id', nextCode);
          throw new Error(
            `Principal Account Insert Error (${staffInsertErr.code || 'DB'}): ${staffInsertErr.message}`
          );
        }
      }

      saveBillingMetaOverride(nextCode, {
        planTier,
        billingStatus,
        city: cleanCity,
        contactPhone: cleanPhone,
      });

      const kit: OnboardingKitData = {
        schoolCode: nextCode,
        schoolName: cleanName,
        city: cleanCity,
        board,
        academicSession: cleanSession,
        principalName: cleanPrincipal,
        principalEmployeeId: `${nextCode}-ADM-001`,
        principalPhone: cleanPhone,
        isPasswordSet: false,
      };

      setIssuedKit(kit);
      await fetchEcosystemData();
    } catch (err: any) {
      setProvisionError(err?.message || 'Failed to onboard partner school.');
    } finally {
      setIsProvisioning(false);
    }
  };

  const handleConfirmDeleteSchool = async () => {
    if (!schoolToDelete || schoolToDelete.schoolCode === 'SCH-01' || isDeleting) return;
    setIsDeleting(true);
    try {
      if (isLiveSupabaseConfigured) {
        const { error } = await supabase.from('schools').delete().eq('id', schoolToDelete.id);
        if (error) throw new Error(error.message);
      }
      if (inspectedSchoolCode === schoolToDelete.schoolCode) {
        setInspectedSchoolCode(null);
      }
      setSchoolToDelete(null);
      await fetchEcosystemData();
    } catch (err: any) {
      setLoadError(err?.message || 'Could not remove school.');
    } finally {
      setIsDeleting(false);
    }
  };

  // GATEKEEPER VIEW
  if (!isUnlocked) {
    return (
      <div className="min-h-dvh bg-[#F6F8FC] dark:bg-[#090D16] text-[#0F172A] dark:text-[#F8FAFC] flex flex-col justify-between px-4 pt-5 pb-[calc(3.5rem+env(safe-area-inset-bottom))] sm:py-6 transition-colors">
        <header className="max-w-5xl w-full mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#4F46E5] flex items-center justify-center text-white shadow-sm shrink-0">
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="font-extrabold text-sm tracking-tight">EDZY HQ</div>
              <div className="hidden sm:block text-[11px] text-[#475569] dark:text-[#94A3B8]">
                SaaS Ecosystem Control
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => navTo('/portal')}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-bold text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white cursor-pointer"
            >
              <span className="sm:hidden">Portal</span>
              <span className="hidden sm:inline">School Portal Login</span>
            </button>
            <button
              type="button"
              onClick={toggleThemeMode}
              className="p-2 rounded-xl bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] cursor-pointer"
              aria-label={themeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {themeMode === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />
              ) : (
                <Moon className="w-4 h-4 text-[#475569]" aria-hidden="true" />
              )}
            </button>
          </div>
        </header>

        <main className="max-w-md w-full mx-auto my-6 sm:my-8 bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] rounded-2xl shadow-xl p-5 sm:p-7 space-y-5">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#6366F1] border border-[#C7D2FE] dark:border-[#3730A3]">
              <Lock className="w-3 h-3" aria-hidden="true" />
              Restricted Founder Console
            </span>
            <h1 className="text-xl font-extrabold">EDZY HQ • SaaS Ecosystem Control</h1>
            <p className="text-xs text-[#475569] dark:text-[#94A3B8] leading-relaxed">
              Monitor ecosystem billing, aggregate fee GMV, and onboard partner schools with Zero-PII school confidentiality.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label htmlFor="founder-passkey-input" className="block text-xs font-bold mb-1.5">
                Founder Access Key
              </label>
              <input
                id="founder-passkey-input"
                type="password"
                required
                autoFocus
                value={passkeyInput}
                onChange={(e) => setPasskeyInput(e.target.value)}
                placeholder="Enter Founder Access Key"
                className="w-full h-11 px-3.5 rounded-xl bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full h-11 rounded-xl bg-[#4F46E5] hover:bg-[#3730A3] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              Unlock Founder Console
            </button>
          </form>
        </main>

        <footer className="text-center text-[11px] text-[#94A3B8]">
          EDZY: Education Made Easy • Zero-PII Multi-Tenant SaaS Governance
        </footer>
      </div>
    );
  }

  // AUTHENTICATED FOUNDER CONTROL TOWER
  return (
    <div className="min-h-dvh bg-[#F6F8FC] dark:bg-[#090D16] text-[#0F172A] dark:text-[#F8FAFC] transition-colors">
      {/* Sticky Top Header */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#0D1320]/90 backdrop-blur-md border-b border-[#E2E8F0] dark:border-[#232E44]">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#4F46E5] flex items-center justify-center text-white shadow-sm shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight whitespace-nowrap">
                  EDZY HQ
                </span>
                <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#818CF8] border border-[#C7D2FE] dark:border-[#3730A3] whitespace-nowrap">
                  <span className="sm:hidden">FOUNDER</span>
                  <span className="hidden sm:inline">FOUNDER CONSOLE</span>
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-[#475569] dark:text-[#94A3B8] truncate">
                EDZY: Education Made Easy • Aggregate SaaS Governance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={fetchEcosystemData}
              disabled={isLoading}
              aria-label="Refresh telemetry"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#EEF2F7] dark:bg-[#1A2336] text-xs font-bold text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              type="button"
              onClick={toggleThemeMode}
              className="p-2 rounded-xl bg-[#EEF2F7] dark:bg-[#1A2336] cursor-pointer"
              aria-label={themeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {themeMode === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />
              ) : (
                <Moon className="w-4 h-4 text-[#475569]" aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              onClick={handleLockHq}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 text-xs font-bold cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="sm:hidden">Lock</span>
              <span className="hidden sm:inline">Lock HQ</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3.5 sm:px-6 pt-4 sm:pt-6 pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:pb-10 space-y-4 sm:space-y-5">
        {/* Zero-PII Confidentiality Trust Strip */}
        <section
          aria-label="Zero-PII data confidentiality assurance"
          className="rounded-xl bg-[#EEF2FF]/75 dark:bg-[#121826] border border-[#C7D2FE] dark:border-[#3730A3] px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
        >
          <div className="flex items-start sm:items-center gap-2.5">
            <Lock className="w-4 h-4 text-[#4F46E5] dark:text-[#818CF8] shrink-0 mt-0.5 sm:mt-0" aria-hidden="true" />
            <p className="text-xs text-[#0F172A] dark:text-[#E2E8F0]">
              <strong className="font-extrabold text-[#4F46E5] dark:text-[#818CF8]">
                Strict Data Confidentiality Mode (DPDP Compliant):
              </strong>{' '}
              Founder HQ displays aggregate billing, adoption, and transaction volume only. Individual student records, exam marks, and parent contact details remain strictly encrypted &amp; private to each school.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-[#059669] dark:text-[#34D399] border border-emerald-200 dark:border-emerald-800 shrink-0 self-start sm:self-auto">
            Zero-PII Verified
          </span>
        </section>

        {/* Founder Quick Links & Operations Command Dock */}
        <nav
          aria-label="Founder quick actions"
          className="-mx-3.5 px-3.5 sm:mx-0 sm:px-2.5 py-2 sm:py-2.5 bg-white dark:bg-[#121826] border-y sm:border border-[#E2E8F0] dark:border-[#232E44] sm:rounded-xl flex flex-nowrap sm:flex-wrap items-center justify-between gap-2 overflow-x-auto shadow-2xs"
        >
          <div className="flex flex-nowrap sm:flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => navTo('/')}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-[#F6F8FC] dark:bg-[#1A2336] hover:bg-[#EEF2FF] dark:hover:bg-[#1B2440] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] cursor-pointer whitespace-nowrap shrink-0 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-[#4F46E5] dark:text-[#818CF8]" aria-hidden="true" />
              <span>Main Website (/) ↗</span>
            </button>

            <button
              type="button"
              onClick={() => navTo('/portal')}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-[#F6F8FC] dark:bg-[#1A2336] hover:bg-[#EEF2FF] dark:hover:bg-[#1B2440] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] cursor-pointer whitespace-nowrap shrink-0 transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#4F46E5] dark:text-[#818CF8]" aria-hidden="true" />
              <span>School Login Portal (/portal) ↗</span>
            </button>

            <button
              type="button"
              onClick={handleCopyPitchLink}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-[#F6F8FC] dark:bg-[#1A2336] hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-[#E2E8F0] dark:border-[#232E44] text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] cursor-pointer whitespace-nowrap shrink-0 transition-colors"
            >
              {pitchLinkCopied ? (
                <Check className="w-3.5 h-3.5 text-[#059669] dark:text-[#34D399]" aria-hidden="true" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-[#475569] dark:text-[#94A3B8]" aria-hidden="true" />
              )}
              <span>{pitchLinkCopied ? 'Copied!' : 'Copy WhatsApp Pitch Link'}</span>
            </button>

            <button
              type="button"
              onClick={() => navTo('/privacy-policy')}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-[#F6F8FC] dark:bg-[#1A2336] hover:bg-[#EEF2FF] dark:hover:bg-[#1B2440] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-semibold text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] cursor-pointer whitespace-nowrap shrink-0 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#059669] dark:text-[#34D399]" aria-hidden="true" />
              <span>Privacy &amp; DPDP Policy ↗</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleExportEcosystemCsv}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-[#059669] hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer whitespace-nowrap shrink-0 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Export Ecosystem Billing Report (CSV)</span>
          </button>
        </nav>

        {/* Title & Onboard CTA Row (Single + icon!) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Partner Schools Ecosystem
            </h1>
            <p className="text-xs sm:text-sm text-[#475569] dark:text-[#94A3B8] mt-0.5">
              SaaS subscriptions, aggregate campus transaction GMV, and inaugural Principal provisioning.
            </p>
          </div>

          <button
            type="button"
            onClick={openOnboardModal}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#3730A3] text-white text-sm font-bold shadow-sm transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Onboard New School</span>
          </button>
        </div>

        {loadError && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold">
            {loadError}
          </div>
        )}

        {/* 5 Executive SaaS KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-[#121826] p-3.5 sm:p-5 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs space-y-2 tabular-nums">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#475569] dark:text-[#94A3B8]">
                Partner Schools
              </span>
              <Building2 className="w-4 h-4 text-[#4F46E5] dark:text-[#818CF8] shrink-0" aria-hidden="true" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold">{telemetry.ecosystem.totalSchools}</div>
            <div className="text-[11px] text-[#475569] dark:text-[#94A3B8] font-medium">
              <span className="font-bold text-[#059669] dark:text-[#34D399]">
                {telemetry.ecosystem.activeSchoolsCount} Active
              </span>{' '}
              • {telemetry.ecosystem.trialSchoolsCount} Pilot
            </div>
          </div>

          <div className="bg-white dark:bg-[#121826] p-3.5 sm:p-5 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs space-y-2 tabular-nums">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#475569] dark:text-[#94A3B8]">
                Ecosystem MRR
              </span>
              <IndianRupee className="w-4 h-4 text-[#D97706] dark:text-[#FBBF24] shrink-0" aria-hidden="true" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold font-mono">
              ₹{telemetry.ecosystem.totalEcosystemMrr.toLocaleString('en-IN')}
              <span className="text-xs font-sans font-bold text-[#94A3B8]">/mo</span>
            </div>
            <div className="text-[11px] text-[#475569] dark:text-[#94A3B8] font-medium">
              ARR: <strong className="text-[#0F172A] dark:text-[#F8FAFC]">{formatCompactInr(telemetry.ecosystem.totalEcosystemArr)}/yr</strong>
            </div>
          </div>

          <div className="bg-white dark:bg-[#121826] p-3.5 sm:p-5 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs space-y-2 tabular-nums">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#475569] dark:text-[#94A3B8]">
                Fee Volume (GMV)
              </span>
              <CreditCard className="w-4 h-4 text-[#059669] dark:text-[#34D399] shrink-0" aria-hidden="true" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold font-mono text-[#059669] dark:text-[#34D399]">
              {formatCompactInr(telemetry.ecosystem.totalFeeVolumeProcessed)}
            </div>
            <div className="text-[11px] text-[#475569] dark:text-[#94A3B8] font-medium">
              {telemetry.ecosystem.totalPaidTransactionsCount} txns •{' '}
              <strong className="text-[#4F46E5] dark:text-[#818CF8]">
                {telemetry.ecosystem.ecosystemUpiAdoptionPct}% UPI
              </strong>
            </div>
          </div>

          <div className="bg-white dark:bg-[#121826] p-3.5 sm:p-5 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs space-y-2 tabular-nums">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#475569] dark:text-[#94A3B8]">
                Campus Users
              </span>
              <GraduationCap className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" aria-hidden="true" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold">
              {telemetry.ecosystem.totalStudents}
              <span className="text-xs font-bold text-[#94A3B8] ml-1.5">Students</span>
            </div>
            <div className="text-[11px] text-[#475569] dark:text-[#94A3B8] font-medium">
              {telemetry.ecosystem.totalStaff} Staff ({telemetry.ecosystem.totalActivatedStaff} Activated)
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-white dark:bg-[#121826] p-3.5 sm:p-5 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs space-y-2 tabular-nums">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#475569] dark:text-[#94A3B8]">
                Platform Health
              </span>
              <Activity className="w-4 h-4 text-[#059669] dark:text-[#34D399] shrink-0" aria-hidden="true" />
            </div>
            <div className="flex items-center gap-2 pt-0.5">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isLiveSupabaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span className="text-base font-extrabold">
                {isLiveSupabaseConfigured ? 'Cloud Connected' : 'Local Demo'}
              </span>
            </div>
            <div className="text-[11px] text-[#475569] dark:text-[#94A3B8] font-medium">
              {telemetry.ecosystem.totalPublishedChapters} AI Syllabus Chapters Live
            </div>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-white dark:bg-[#121826] p-4 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
            <search className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
              <input
                type="search"
                aria-label="Search partner schools"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Code (SCH-01), School, City, Board..."
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </search>

            <div role="group" aria-label="Filter schools by status" className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { id: 'ALL', label: `All (${telemetry.ecosystem.totalSchools})` },
                  { id: 'ACTIVE', label: `Active Paid (${telemetry.ecosystem.activeSchoolsCount})` },
                  { id: 'TRIAL', label: `Pilot / Trial (${telemetry.ecosystem.trialSchoolsCount})` },
                  { id: 'ATTENTION', label: `Needs Attention (${telemetry.ecosystem.attentionSchoolsCount})` },
                ] as const
              ).map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  aria-pressed={activeFilter === pill.id}
                  onClick={() => setActiveFilter(pill.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                    activeFilter === pill.id
                      ? 'bg-[#4F46E5] text-white border-[#4F46E5]'
                      : 'bg-[#F6F8FC] dark:bg-[#1A2336] text-[#475569] dark:text-[#94A3B8] border-[#E2E8F0] dark:border-[#232E44] hover:text-[#0F172A] dark:hover:text-white'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          <span className="text-xs font-bold text-[#475569] dark:text-[#94A3B8] shrink-0">
            Next Auto Code:{' '}
            <strong className="font-mono text-[#4F46E5] dark:text-[#818CF8]">
              {nextSeqPreview.nextCode}
            </strong>
          </span>
        </div>

        {/* Partner Schools Mobile Cards (< md) & Directory Table (>= md) */}
        <div className="bg-white dark:bg-[#121826] rounded-2xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs overflow-hidden">
          {/* Mobile School Cards (< md) */}
          <div className="md:hidden divide-y divide-[#E2E8F0] dark:divide-[#232E44]">
            {filteredSummaries.length === 0 ? (
              <div className="py-12 px-4 text-center text-xs text-[#94A3B8]">
                No partner schools match this filter.
              </div>
            ) : (
              filteredSummaries.map((item) => {
                const sch = item.school;
                const isProtectedDemo = sch.schoolCode === 'SCH-01';
                const billingMeta = BILLING_STATUS_META[item.billingStatus];
                const kitPayload: OnboardingKitData = {
                  schoolCode: sch.schoolCode,
                  schoolName: sch.name,
                  city: sch.city,
                  board: sch.board,
                  academicSession: sch.academicSession,
                  principalName: sch.principalName,
                  principalEmployeeId: item.principalEmployeeId,
                  principalPhone: item.principalPhone,
                  isPasswordSet: item.isPrincipalActivated,
                };

                return (
                  <div key={sch.id} className="p-4 space-y-3 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC] truncate">
                          {sch.name}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md font-mono font-extrabold text-[11px] bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#818CF8] border border-[#C7D2FE] dark:border-[#3730A3]">
                            {sch.schoolCode}
                          </span>
                          <span className="text-[11px] text-[#475569] dark:text-[#94A3B8]">
                            {sch.city} • {sch.board}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setInspectedSchoolCode(sch.schoolCode)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 cursor-pointer ${billingMeta.badgeClass}`}
                      >
                        {billingMeta.label}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] tabular-nums">
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-[#475569] dark:text-[#94A3B8]">
                          Fee GMV
                        </div>
                        <div className="font-mono font-bold text-[#059669] dark:text-[#34D399] mt-0.5">
                          ₹{item.totalFeeVolumeProcessed.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-[#475569] dark:text-[#94A3B8]">
                          SaaS MRR
                        </div>
                        <div className="font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC] mt-0.5">
                          ₹{item.monthlySaaSRevenue.toLocaleString('en-IN')}/mo
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-[#475569] dark:text-[#94A3B8]">
                          Students
                        </div>
                        <div className="font-bold text-[#0F172A] dark:text-[#F8FAFC] mt-0.5">
                          {item.studentCount}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-[#475569] dark:text-[#94A3B8]">
                          Staff
                        </div>
                        <div className="font-bold text-[#0F172A] dark:text-[#F8FAFC] mt-0.5">
                          {item.totalStaffCount} ({item.activatedStaffCount} active)
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setInspectedSchoolCode(sch.schoolCode)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#4F46E5] hover:bg-[#3730A3] text-white font-bold text-xs cursor-pointer"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Inspect</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setInspectKit(kitPayload)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#818CF8] border border-[#C7D2FE] dark:border-[#3730A3] font-bold text-xs cursor-pointer"
                      >
                        <KeyRound className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Onboarding Kit</span>
                      </button>
                      {!isProtectedDemo && (
                        <button
                          type="button"
                          onClick={() => setSchoolToDelete(sch)}
                          aria-label={`Remove ${sch.name}`}
                          className="p-2 rounded-lg border bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/50 cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div
            tabIndex={0}
            role="region"
            aria-labelledby={tableCaptionId}
            className="hidden md:block overflow-x-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]"
          >
            <table className="w-full text-left border-collapse text-xs">
              <caption id={tableCaptionId} className="sr-only">
                Partner schools SaaS billing, aggregate GMV transactions, and campus adoption directory
              </caption>
              <thead>
                <tr className="bg-[#EEF2F7]/80 dark:bg-[#1A2336]/80 border-b border-[#E2E8F0] dark:border-[#232E44] text-[11px] font-bold uppercase tracking-wider text-[#475569] dark:text-[#94A3B8]">
                  <th scope="col" className="py-3.5 px-4">School Code &amp; City</th>
                  <th scope="col" className="py-3.5 px-4">Partner School &amp; Board</th>
                  <th scope="col" className="py-3.5 px-4">Plan &amp; Billing</th>
                  <th scope="col" className="py-3.5 px-4">Fee Transactions (GMV)</th>
                  <th scope="col" className="py-3.5 px-4">Campus Adoption</th>
                  <th scope="col" className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#232E44]">
                {filteredSummaries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#94A3B8]">
                      No partner schools match this filter.
                    </td>
                  </tr>
                ) : (
                  filteredSummaries.map((item) => {
                    const sch = item.school;
                    const isProtectedDemo = sch.schoolCode === 'SCH-01';
                    const billingMeta = BILLING_STATUS_META[item.billingStatus];

                    const kitPayload: OnboardingKitData = {
                      schoolCode: sch.schoolCode,
                      schoolName: sch.name,
                      city: sch.city,
                      board: sch.board,
                      academicSession: sch.academicSession,
                      principalName: sch.principalName,
                      principalEmployeeId: item.principalEmployeeId,
                      principalPhone: item.principalPhone,
                      isPasswordSet: item.isPrincipalActivated,
                    };

                    return (
                      <tr
                        key={sch.id}
                        className="hover:bg-[#F6F8FC] dark:hover:bg-[#1A2336]/40 transition-colors"
                      >
                        <td className="py-3.5 px-4 align-top">
                          <span className="inline-flex items-center whitespace-nowrap px-2.5 py-1 rounded-lg font-mono font-extrabold text-xs bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#818CF8] border border-[#C7D2FE] dark:border-[#3730A3]">
                            {sch.schoolCode}
                          </span>
                          <div className="mt-1.5 text-[11px] font-medium text-[#475569] dark:text-[#94A3B8]">
                            {sch.city}
                          </div>
                        </td>

                        <th scope="row" className="py-3.5 px-4 font-normal text-left align-top">
                          <div className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">
                            {sch.name}
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EEF2F7] dark:bg-[#1A2336] text-[#475569] dark:text-[#94A3B8]">
                              {sch.board}
                            </span>
                            <span className="text-[11px] text-[#94A3B8]">
                              {sch.academicSession}
                            </span>
                            <span className="text-[#CBD5E1] dark:text-[#334155]">•</span>
                            <span className="text-[11px] font-mono font-semibold text-[#4F46E5] dark:text-[#818CF8]">
                              {item.principalEmployeeId}
                            </span>
                          </div>
                        </th>

                        <td className="py-3.5 px-4 align-top">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setInspectedSchoolCode(sch.schoolCode)}
                              className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#818CF8] border border-[#C7D2FE] dark:border-[#3730A3] hover:bg-[#4F46E5] hover:text-white transition-colors cursor-pointer"
                            >
                              {item.planLabel}
                            </button>
                            <button
                              type="button"
                              onClick={() => setInspectedSchoolCode(sch.schoolCode)}
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border cursor-pointer ${billingMeta.badgeClass}`}
                            >
                              {billingMeta.label}
                            </button>
                          </div>
                          <div className="mt-1.5 font-mono text-[11px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                            ₹{item.monthlySaaSRevenue.toLocaleString('en-IN')}/mo MRR
                          </div>
                        </td>

                        <td className="py-3.5 px-4 align-top min-w-[165px]">
                          <div className="font-mono font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
                            ₹{item.totalFeeVolumeProcessed.toLocaleString('en-IN')}
                          </div>
                          <div className="text-[11px] text-[#475569] dark:text-[#94A3B8] mt-0.5">
                            {item.paidTransactionsCount} txns • UPI {item.digitalUpiAdoptionPct}%
                          </div>
                          <div
                            className="mt-1.5 h-1.5 w-full rounded-full bg-[#E2E8F0] dark:bg-[#232E44] overflow-hidden"
                            aria-hidden="true"
                          >
                            <div
                              className="h-full rounded-full bg-[#4F46E5] dark:bg-[#6366F1]"
                              style={{ width: `${item.digitalUpiAdoptionPct}%` }}
                            />
                          </div>
                        </td>

                        <td className="py-3.5 px-4 align-top">
                          <div className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                            {item.studentCount} Students
                          </div>
                          <div className="text-[11px] text-[#475569] dark:text-[#94A3B8] mt-0.5">
                            {item.totalStaffCount} Staff Account{item.totalStaffCount === 1 ? '' : 's'}
                            {item.totalStaffCount > 0 && (
                              <span className="ml-1 font-semibold">
                                ({item.activatedStaffCount}/{item.totalStaffCount} Active)
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right align-top">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setInspectedSchoolCode(sch.schoolCode)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#4F46E5] hover:bg-[#3730A3] text-white font-bold text-xs transition-colors cursor-pointer whitespace-nowrap"
                            >
                              <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>Inspect</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setInspectKit(kitPayload)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#EEF2FF] dark:bg-[#1B2440] hover:bg-[#4F46E5] hover:text-white dark:hover:bg-[#6366F1] text-[#4F46E5] dark:text-[#818CF8] border border-[#C7D2FE] dark:border-[#3730A3] font-bold text-xs transition-colors cursor-pointer whitespace-nowrap"
                            >
                              <KeyRound className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>Activation Kit</span>
                            </button>

                            <button
                              type="button"
                              disabled={isProtectedDemo}
                              onClick={() => setSchoolToDelete(sch)}
                              aria-label={
                                isProtectedDemo
                                  ? `${sch.name} cannot be removed`
                                  : `Remove ${sch.name}`
                              }
                              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-colors whitespace-nowrap ${
                                isProtectedDemo
                                  ? 'bg-[#F6F8FC] dark:bg-[#1A2336] text-[#94A3B8] border-[#E2E8F0] dark:border-[#232E44] opacity-45 cursor-not-allowed'
                                  : 'bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-600 hover:text-white text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/50 cursor-pointer'
                              }`}
                            >
                              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Slide-Over School Executive Inspector Drawer (Zero-PII Deep Dive) */}
      <NativeModalDialog
        open={Boolean(inspectedSummary)}
        onClose={() => setInspectedSchoolCode(null)}
        ariaLabelledBy={drawerTitleId}
        variant="drawer"
      >
        {inspectedSummary && (
          <div className="flex flex-col min-h-full">
            <div className="px-6 py-4 bg-white dark:bg-[#0D1320] border-b border-[#E2E8F0] dark:border-[#232E44] flex items-center justify-between gap-3 sticky top-0 z-10">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md font-mono text-[11px] font-extrabold bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#818CF8]">
                    {inspectedSummary.school.schoolCode}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      BILLING_STATUS_META[inspectedSummary.billingStatus].badgeClass
                    }`}
                  >
                    {inspectedSummary.billingLabel}
                  </span>
                </div>
                <h2 id={drawerTitleId} className="text-base font-extrabold mt-1 truncate">
                  {inspectedSummary.school.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setInspectedSchoolCode(null)}
                aria-label="Close school inspector"
                className="p-2 rounded-lg text-[#475569] dark:text-[#94A3B8] hover:bg-[#EEF2F7] dark:hover:bg-[#1A2336] cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="p-6 space-y-6 flex-1">
              {/* School Identity & Direct Link */}
              <div className="rounded-xl bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] p-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#475569] dark:text-[#94A3B8]">Location &amp; Board</span>
                  <span className="font-bold">
                    {inspectedSummary.school.city} • {inspectedSummary.school.board}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#475569] dark:text-[#94A3B8]">Principal</span>
                  <span className="font-bold">{inspectedSummary.school.principalName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#475569] dark:text-[#94A3B8]">Admin Login ID</span>
                  <span className="font-mono font-bold text-[#4F46E5] dark:text-[#818CF8]">
                    {inspectedSummary.principalEmployeeId}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0] dark:border-[#232E44]">
                  <span className="text-[#475569] dark:text-[#94A3B8]">Direct Portal URL</span>
                  <span className="font-mono font-semibold text-[#4F46E5] dark:text-[#818CF8]">
                    {PORTAL_PUBLIC_URL}
                  </span>
                </div>
              </div>

              {/* Subscription & Plan Manager */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#475569] dark:text-[#94A3B8]">
                    Subscription &amp; Plan Manager
                  </h3>
                  <span className="font-mono text-xs font-extrabold text-[#4F46E5] dark:text-[#818CF8]">
                    ₹{inspectedSummary.monthlySaaSRevenue.toLocaleString('en-IN')}/mo
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {(['CORE_ERP', 'AI_SUITE'] as SchoolPlanTier[]).map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      disabled={isUpdatingPlan}
                      onClick={() =>
                        handleUpdateSubscription(inspectedSummary.school.schoolCode, {
                          planTier: tier,
                        })
                      }
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        inspectedSummary.planTier === tier
                          ? 'bg-[#EEF2FF] dark:bg-[#1B2440] border-[#4F46E5] text-[#4F46E5] dark:text-[#818CF8]'
                          : 'bg-[#F6F8FC] dark:bg-[#1A2336] border-[#E2E8F0] dark:border-[#232E44] text-[#475569] dark:text-[#94A3B8]'
                      }`}
                    >
                      <div className="text-xs font-extrabold">{PLAN_META[tier].shortLabel}</div>
                      <div className="text-[10px] mt-0.5">
                        ₹{PLAN_META[tier].rate}/student/mo
                      </div>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['TRIAL', 'ACTIVE', 'PAST_DUE', 'SUSPENDED'] as SchoolBillingStatus[]).map(
                    (statusKey) => (
                      <button
                        key={statusKey}
                        type="button"
                        disabled={isUpdatingPlan}
                        onClick={() =>
                          handleUpdateSubscription(inspectedSummary.school.schoolCode, {
                            billingStatus: statusKey,
                          })
                        }
                        className={`py-2 px-2.5 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                          inspectedSummary.billingStatus === statusKey
                            ? 'bg-[#0F172A] dark:bg-[#4F46E5] text-white border-transparent'
                            : 'bg-white dark:bg-[#1A2336] border-[#E2E8F0] dark:border-[#232E44] text-[#475569] dark:text-[#94A3B8]'
                        }`}
                      >
                        {BILLING_STATUS_META[statusKey].label}
                      </button>
                    )
                  )}
                </div>

                {planFeedback && (
                  <p className="text-[11px] font-semibold text-[#059669] dark:text-[#34D399]">
                    {planFeedback}
                  </p>
                )}
              </div>

              {/* Aggregate Financial Telemetry (Zero Student PII) */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#475569] dark:text-[#94A3B8]">
                  Aggregate Fee Telemetry (Zero Student PII)
                </h3>
                <div className="rounded-xl border border-[#E2E8F0] dark:border-[#232E44] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-[#475569] dark:text-[#94A3B8]">
                        Total Fee Volume Processed
                      </div>
                      <div className="text-xl font-mono font-extrabold text-[#059669] dark:text-[#34D399]">
                        ₹{inspectedSummary.totalFeeVolumeProcessed.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-[#475569] dark:text-[#94A3B8]">
                        Paid Transactions
                      </div>
                      <div className="text-base font-extrabold">
                        {inspectedSummary.paidTransactionsCount}
                      </div>
                    </div>
                  </div>

                  {/* UPI vs Offline Split Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-semibold">
                      <span className="text-[#4F46E5] dark:text-[#818CF8]">
                        Online UPI: ₹{inspectedSummary.onlineUpiVolume.toLocaleString('en-IN')} (
                        {inspectedSummary.digitalUpiAdoptionPct}%)
                      </span>
                      <span className="text-[#475569] dark:text-[#94A3B8]">
                        Cash/Cheque: ₹{inspectedSummary.offlineDeskVolume.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div
                      className="h-2.5 w-full rounded-full bg-[#E2E8F0] dark:bg-[#232E44] overflow-hidden"
                      aria-hidden="true"
                    >
                      <div
                        className="h-full bg-[#4F46E5] dark:bg-[#6366F1] rounded-full transition-all"
                        style={{ width: `${inspectedSummary.digitalUpiAdoptionPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#232E44] flex items-center justify-between text-xs">
                    <span className="text-[#475569] dark:text-[#94A3B8]">Outstanding Dues Volume</span>
                    <span className="font-mono font-bold text-[#D97706] dark:text-[#FBBF24]">
                      ₹{inspectedSummary.pendingDuesVolume.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Platform Adoption Telemetry */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#475569] dark:text-[#94A3B8]">
                  Campus Adoption Telemetry
                </h3>
                <div className="grid grid-cols-3 gap-2.5 text-center">
                  <div className="p-3 rounded-xl bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44]">
                    <Users className="w-4 h-4 mx-auto text-[#4F46E5] dark:text-[#818CF8]" aria-hidden="true" />
                    <div className="text-sm font-extrabold mt-1">
                      {inspectedSummary.activatedStaffCount}/{inspectedSummary.totalStaffCount}
                    </div>
                    <div className="text-[10px] text-[#475569] dark:text-[#94A3B8]">Staff Active</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44]">
                    <BookOpen className="w-4 h-4 mx-auto text-cyan-600 dark:text-cyan-400" aria-hidden="true" />
                    <div className="text-sm font-extrabold mt-1">
                      {inspectedSummary.publishedChaptersCount}
                    </div>
                    <div className="text-[10px] text-[#475569] dark:text-[#94A3B8]">AI Chapters</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44]">
                    <ShieldCheck className="w-4 h-4 mx-auto text-[#059669] dark:text-[#34D399]" aria-hidden="true" />
                    <div className="text-sm font-extrabold mt-1">
                      {inspectedSummary.circularsSentCount}
                    </div>
                    <div className="text-[10px] text-[#475569] dark:text-[#94A3B8]">Circulars Sent</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Drawer Action Footer */}
            <div className="p-5 bg-white dark:bg-[#0D1320] border-t border-[#E2E8F0] dark:border-[#232E44] flex flex-wrap items-center gap-2 sticky bottom-0">
              <button
                type="button"
                onClick={async () => {
                  const msg = buildPrincipalWelcomeMessage({
                    schoolCode: inspectedSummary.school.schoolCode,
                    schoolName: inspectedSummary.school.name,
                    city: inspectedSummary.school.city,
                    board: inspectedSummary.school.board,
                    academicSession: inspectedSummary.school.academicSession,
                    principalName: inspectedSummary.school.principalName,
                    principalEmployeeId: inspectedSummary.principalEmployeeId,
                    principalPhone: inspectedSummary.principalPhone,
                    isPasswordSet: inspectedSummary.isPrincipalActivated,
                  });
                  try {
                    await navigator.clipboard.writeText(msg);
                  } catch {
                    // Fallback copy
                  }
                  setDrawerKitCopied(true);
                  setTimeout(() => setDrawerKitCopied(false), 2400);
                }}
                className="flex-1 min-w-[170px] inline-flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-xl bg-[#4F46E5] hover:bg-[#3730A3] text-white text-xs font-bold cursor-pointer"
              >
                {drawerKitCopied ? (
                  <Check className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Copy className="w-4 h-4" aria-hidden="true" />
                )}
                <span>{drawerKitCopied ? 'Copied Kit!' : 'Copy Principal WhatsApp Kit'}</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 py-2.5 px-3.5 rounded-xl bg-[#EEF2F7] dark:bg-[#1A2336] text-xs font-bold cursor-pointer"
              >
                <Printer className="w-4 h-4" aria-hidden="true" />
                <span>Print</span>
              </button>

              <button
                type="button"
                onClick={() => navTo('/portal')}
                className="inline-flex items-center gap-1 py-2.5 px-3.5 rounded-xl border border-[#C7D2FE] dark:border-[#3730A3] text-xs font-bold text-[#4F46E5] dark:text-[#818CF8] cursor-pointer"
              >
                <span>Open Portal</span>
                <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </NativeModalDialog>

      {/* Onboard New School Modal */}
      <NativeModalDialog
        open={isOnboardOpen}
        onClose={() => setIsOnboardOpen(false)}
        ariaLabelledBy={onboardTitleId}
      >
        <div className="no-print px-6 py-4 bg-white dark:bg-[#0D1320] border-b border-[#E2E8F0] dark:border-[#232E44] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#818CF8] flex items-center justify-center">
              <Building2 className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h2 id={onboardTitleId} className="text-sm font-extrabold">
                {issuedKit ? 'Partner School Live & Principal Kit Ready' : 'Onboard New Partner School'}
              </h2>
              <p className="text-[11px] text-[#475569] dark:text-[#94A3B8]">
                {issuedKit
                  ? `Tenant ${issuedKit.schoolCode} & ${issuedKit.principalEmployeeId} provisioned`
                  : `Auto-assigns sequential School Code (${nextSeqPreview.nextCode})`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOnboardOpen(false)}
            aria-label="Close onboard modal"
            className="p-1.5 rounded-lg text-[#475569] dark:text-[#94A3B8] hover:bg-[#EEF2F7] dark:hover:bg-[#1A2336] cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="p-6">
          {issuedKit ? (
            <div className="space-y-4">
              <PrincipalOnboardingKitCard kit={issuedKit} />
              <div className="no-print pt-2 border-t border-[#E2E8F0] dark:border-[#232E44] flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsOnboardOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#0F172A] dark:bg-[#1A2336] text-white text-xs font-bold cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleOnboardSchool} className="space-y-4">
              <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#EEF2FF] dark:bg-[#1B2440] border border-[#C7D2FE] dark:border-[#3730A3]">
                <span className="text-xs font-bold text-[#3730A3] dark:text-indigo-200">
                  Auto-Generated School Code
                </span>
                <span className="font-mono text-sm font-extrabold text-[#4F46E5] dark:text-[#818CF8]">
                  {nextSeqPreview.nextCode}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label htmlFor="onboard-school-name" className="block text-xs font-bold mb-1">
                    School Name *
                  </label>
                  <input
                    id="onboard-school-name"
                    type="text"
                    required
                    autoFocus
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="e.g. Brightlands School"
                    className="w-full h-10 px-3 rounded-xl bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  />
                </div>

                <div>
                  <label htmlFor="onboard-city" className="block text-xs font-bold mb-1">
                    City *
                  </label>
                  <input
                    id="onboard-city"
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Dehradun"
                    className="w-full h-10 px-3 rounded-xl bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="onboard-board" className="block text-xs font-bold mb-1">
                    Education Board *
                  </label>
                  <select
                    id="onboard-board"
                    value={board}
                    onChange={(e) => setBoard(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  >
                    <option value="CBSE">CBSE</option>
                    <option value="ICSE">ICSE</option>
                    <option value="ISC">ISC</option>
                    <option value="State Board">State Board</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="onboard-session" className="block text-xs font-bold mb-1">
                    Academic Session *
                  </label>
                  <input
                    id="onboard-session"
                    type="text"
                    required
                    value={academicSession}
                    onChange={(e) => setAcademicSession(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="onboard-plan" className="block text-xs font-bold mb-1">
                    SaaS Plan Tier *
                  </label>
                  <select
                    id="onboard-plan"
                    value={planTier}
                    onChange={(e) => setPlanTier(e.target.value as SchoolPlanTier)}
                    className="w-full h-10 px-3 rounded-xl bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  >
                    <option value="AI_SUITE">Full AI + 3D Suite (₹99/stu/mo)</option>
                    <option value="CORE_ERP">Core School ERP (₹49/stu/mo)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="onboard-billing" className="block text-xs font-bold mb-1">
                    Billing Status *
                  </label>
                  <select
                    id="onboard-billing"
                    value={billingStatus}
                    onChange={(e) => setBillingStatus(e.target.value as SchoolBillingStatus)}
                    className="w-full h-10 px-3 rounded-xl bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  >
                    <option value="TRIAL">14-Day Free Pilot</option>
                    <option value="ACTIVE">Active Paid</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="onboard-principal-name" className="block text-xs font-bold mb-1">
                    Principal Full Name *
                  </label>
                  <input
                    id="onboard-principal-name"
                    type="text"
                    required
                    value={principalName}
                    onChange={(e) => setPrincipalName(e.target.value)}
                    placeholder="e.g. Dr. Rajeshwari Nair"
                    className="w-full h-10 px-3 rounded-xl bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  />
                </div>

                <div>
                  <label htmlFor="onboard-principal-phone" className="block text-xs font-bold mb-1">
                    Principal Phone (Optional)
                  </label>
                  <input
                    id="onboard-principal-phone"
                    type="tel"
                    value={principalPhone}
                    onChange={(e) => setPrincipalPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9811223344"
                    className="w-full h-10 px-3 rounded-xl bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  />
                </div>
              </div>

              {provisionError && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{provisionError}</span>
                </div>
              )}

              <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#232E44] flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsOnboardOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] text-xs font-bold text-[#475569] dark:text-[#94A3B8] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProvisioning}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#3730A3] disabled:opacity-60 text-white text-xs font-bold shadow-sm cursor-pointer"
                >
                  <Building2 className="w-4 h-4" aria-hidden="true" />
                  <span>
                    {isProvisioning ? 'Provisioning Tenant...' : `Onboard School (${nextSeqPreview.nextCode})`}
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>
      </NativeModalDialog>

      {/* Principal Activation Kit Modal */}
      <NativeModalDialog
        open={Boolean(inspectKit)}
        onClose={() => setInspectKit(null)}
        ariaLabelledBy={kitTitleId}
      >
        <div className="no-print px-6 py-4 bg-white dark:bg-[#0D1320] border-b border-[#E2E8F0] dark:border-[#232E44] flex items-center justify-between">
          <h2 id={kitTitleId} className="text-sm font-extrabold">
            Principal Activation Kit
          </h2>
          <button
            type="button"
            onClick={() => setInspectKit(null)}
            aria-label="Close activation kit"
            className="p-1.5 rounded-lg text-[#475569] dark:text-[#94A3B8] hover:bg-[#EEF2F7] dark:hover:bg-[#1A2336] cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
        <div className="p-6">{inspectKit && <PrincipalOnboardingKitCard kit={inspectKit} />}</div>
      </NativeModalDialog>

      {/* Remove Test School Confirmation Modal (autofocus on Cancel!) */}
      <NativeModalDialog
        open={Boolean(schoolToDelete)}
        onClose={() => setSchoolToDelete(null)}
        ariaLabelledBy={deleteTitleId}
      >
        {schoolToDelete && (
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h2 id={deleteTitleId} className="text-base font-extrabold">
                  Remove Partner School?
                </h2>
                <p className="text-xs text-[#475569] dark:text-[#94A3B8] mt-1 leading-relaxed">
                  Are you sure you want to permanently remove{' '}
                  <strong className="text-[#0F172A] dark:text-[#F8FAFC]">
                    {schoolToDelete.name}
                  </strong>{' '}
                  (<span className="font-mono">{schoolToDelete.schoolCode}</span>)? All staff,
                  students, and ledgers under this tenant will be cascade-deleted.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                autoFocus
                onClick={() => setSchoolToDelete(null)}
                className="px-4 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] text-xs font-bold text-[#475569] dark:text-[#94A3B8] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDeleteSchool}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white text-xs font-bold cursor-pointer"
              >
                {isDeleting ? 'Removing...' : 'Confirm Remove School'}
              </button>
            </div>
          </div>
        )}
      </NativeModalDialog>
    </div>
  );
}
