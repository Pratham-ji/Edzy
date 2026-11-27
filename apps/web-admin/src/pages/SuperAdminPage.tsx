import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
} from 'lucide-react';
import { isLiveSupabaseConfigured, supabase } from '../lib/supabase';
import { useAdminStore } from '../store/useAdminStore';

interface SuperAdminPageProps {
  onNavigateHome?: () => void;
}

interface EcosystemSchoolRow {
  id: string;
  schoolSerial: number;
  schoolCode: string;
  name: string;
  board: string;
  academicSession: string;
  principalName: string;
  createdAt?: string;
}

interface EcosystemStaffSummary {
  id: string;
  schoolId: string;
  department: string;
  fullName: string;
  designation: string;
  phone: string | null;
  isPasswordSet: boolean;
  status: string;
}

interface OnboardingKitData {
  schoolCode: string;
  schoolName: string;
  board: string;
  academicSession: string;
  principalName: string;
  principalEmployeeId: string;
  principalPhone?: string | null;
  isPasswordSet: boolean;
}

const HQ_SESSION_KEY = 'edzy_hq_founder_auth_v1';
const PORTAL_PUBLIC_URL = 'https://edzy-admin.pages.dev';
const EXPECTED_PASSKEY =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_FOUNDER_PASSKEY) ||
  'edzy-hq-2026';

function computeNextSchoolSeq(schools: EcosystemSchoolRow[]): { nextSerial: number; nextCode: string } {
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

const PrincipalOnboardingKitCard: React.FC<{ kit: OnboardingKitData }> = ({ kit }) => {
  const [copied, setCopied] = useState(false);

  const welcomeMessage = `Namaste ${kit.principalName},\n\nWelcome to *EDZY: Education Made Easy*!\nYour institution *${kit.schoolName}* (${kit.schoolCode} • ${kit.board}) is now live on the Edzy School Command Cloud.\n\n🔗 *ERP Portal:* ${PORTAL_PUBLIC_URL}\n🏫 *School Code:* ${kit.schoolCode}\n🆔 *Principal Employee ID:* ${kit.principalEmployeeId}\n\n*First-Time Activation Instructions:*\n1. Open ${PORTAL_PUBLIC_URL} and enter Employee ID *${kit.principalEmployeeId}*\n2. Set your own private password on first login to launch your dedicated school ERP\n3. Add Class Teachers, Accounts Officers, and import student rosters via CSV\n\nWarm regards,\nEdzy Partner Onboarding Team`;

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
              <School className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#4F46E5] dark:text-[#6366F1]">
                EDZY: Education Made Easy • Principal Onboarding Kit
              </div>
              <h4 className="text-base font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
                {kit.schoolName}
              </h4>
              <p className="text-[11px] text-[#475569] dark:text-[#94A3B8]">
                Board: {kit.board} • Academic Session {kit.academicSession}
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
          <ShieldCheck className="w-4 h-4 text-[#059669] dark:text-[#34D399] shrink-0 mt-0.5" />
          <span>
            Enter your Employee ID at the portal and set your own password to launch your dedicated school ERP.
          </span>
        </div>
      </div>

      <div className="no-print flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={handleCopy}
          className="flex-1 min-w-[180px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#4F46E5] hover:bg-[#3730A3] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied Welcome Kit!' : 'Copy WhatsApp Welcome Kit'}</span>
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-[#EEF2F7] dark:bg-[#1A2336] hover:bg-slate-200 dark:hover:bg-[#232E44] text-[#0F172A] dark:text-[#F8FAFC] text-xs font-bold border border-[#E2E8F0] dark:border-[#232E44] cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print Kit</span>
        </button>
      </div>
    </div>
  );
};

export default function SuperAdminPage({ onNavigateHome }: SuperAdminPageProps) {
  const { themeMode, toggleThemeMode } = useAdminStore();

  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.sessionStorage.getItem(HQ_SESSION_KEY) === 'unlocked';
  });
  const [passkeyInput, setPasskeyInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const [schools, setSchools] = useState<EcosystemSchoolRow[]>([]);
  const [staffRows, setStaffRows] = useState<EcosystemStaffSummary[]>([]);
  const [studentRows, setStudentRows] = useState<Array<{ id: string; schoolId: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [isOnboardOpen, setIsOnboardOpen] = useState(false);
  const [schoolName, setSchoolName] = useState('');
  const [board, setBoard] = useState('CBSE');
  const [academicSession, setAcademicSession] = useState('2026-27');
  const [principalName, setPrincipalName] = useState('');
  const [principalPhone, setPrincipalPhone] = useState('');
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisionError, setProvisionError] = useState<string | null>(null);
  const [issuedKit, setIssuedKit] = useState<OnboardingKitData | null>(null);

  const [inspectKit, setInspectKit] = useState<OnboardingKitData | null>(null);
  const [schoolToDelete, setSchoolToDelete] = useState<EcosystemSchoolRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
        },
      ]);
      setStaffRows([]);
      setStudentRows([]);
      return;
    }

    setIsLoading(true);
    setLoadError(null);
    try {
      const [schoolsRes, staffRes, studentsRes] = await Promise.all([
        supabase.from('schools').select('*').order('school_serial', { ascending: true }),
        supabase
          .from('school_staff')
          .select('id, school_id, department, full_name, designation, phone, is_password_set, status')
          .order('employee_serial', { ascending: true }),
        supabase.from('students').select('id, school_id'),
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
          createdAt: s.created_at,
        }))
      );

      setStaffRows(
        (staffRes.data || []).map((st: any) => ({
          id: st.id,
          schoolId: st.school_id,
          department: st.department,
          fullName: st.full_name,
          designation: st.designation,
          phone: st.phone,
          isPasswordSet: Boolean(st.is_password_set),
          status: st.status || 'ACTIVE',
        }))
      );

      setStudentRows(
        (studentsRes.data || []).map((stu: any) => ({
          id: stu.id,
          schoolId: stu.school_id,
        }))
      );
    } catch (err: any) {
      setLoadError(err?.message || 'Failed to fetch live SaaS ecosystem data.');
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

  const statsMaps = useMemo(() => {
    const studentCount = new Map<string, number>();
    const staffCount = new Map<string, number>();
    const adminBySchool = new Map<string, EcosystemStaffSummary>();

    for (const s of studentRows) {
      studentCount.set(s.schoolId, (studentCount.get(s.schoolId) || 0) + 1);
    }
    for (const st of staffRows) {
      if (st.status === 'ACTIVE') {
        staffCount.set(st.schoolId, (staffCount.get(st.schoolId) || 0) + 1);
      }
      if (st.department === 'ADM' && !adminBySchool.has(st.schoolId)) {
        adminBySchool.set(st.schoolId, st);
      }
    }

    return {
      studentCount,
      staffCount,
      adminBySchool,
      activeStaffTotal: staffRows.filter((r) => r.status === 'ACTIVE').length,
      totalStudents: studentRows.length,
      estimatedMrr: studentRows.length * 99,
    };
  }, [studentRows, staffRows]);

  const nextSeqPreview = useMemo(() => computeNextSchoolSeq(schools), [schools]);

  const filteredSchools = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return schools;
    return schools.filter(
      (s) =>
        s.schoolCode.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.board.toLowerCase().includes(q) ||
        s.principalName.toLowerCase().includes(q)
    );
  }, [schools, searchQuery]);

  const openOnboardModal = () => {
    setSchoolName('');
    setBoard('CBSE');
    setAcademicSession('2026-27');
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
    const cleanPrincipal = principalName.trim();
    const cleanSession = academicSession.trim() || '2026-27';
    const cleanPhone = principalPhone.replace(/\D/g, '').slice(0, 10) || null;

    if (!cleanName || !cleanPrincipal || isProvisioning) {
      setProvisionError('School Name and Principal Full Name are required.');
      return;
    }

    setIsProvisioning(true);
    setProvisionError(null);

    try {
      // Query live schools table to guarantee collision-free next school_serial
      let nextSerial = nextSeqPreview.nextSerial;
      let nextCode = nextSeqPreview.nextCode;

      if (isLiveSupabaseConfigured) {
        const { data: liveSchools, error: seqErr } = await supabase
          .from('schools')
          .select('school_serial, school_code');

        if (seqErr) {
          throw new Error(`Could not compute next School Code: ${seqErr.message}`);
        }

        const liveMapped: EcosystemSchoolRow[] = (liveSchools || []).map((r: any, idx: number) => ({
          id: r.school_code || `SCH-${idx + 1}`,
          schoolSerial: Number(r.school_serial || idx + 1),
          schoolCode: r.school_code || `SCH-${idx + 1}`,
          name: '',
          board: 'CBSE',
          academicSession: cleanSession,
          principalName: '',
        }));
        const seq = computeNextSchoolSeq(liveMapped);
        nextSerial = seq.nextSerial;
        nextCode = seq.nextCode;

        // Step A: Insert into public.schools (exact 1:1 schema alignment)
        const { error: schoolInsertErr } = await supabase.from('schools').insert({
          id: nextCode,
          school_serial: nextSerial,
          school_code: nextCode,
          name: cleanName,
          board,
          academic_session: cleanSession,
          principal_name: cleanPrincipal,
        });

        if (schoolInsertErr) {
          throw new Error(`Schools Insert Error (${schoolInsertErr.code || 'DB'}): ${schoolInsertErr.message}`);
        }

        // Step B: Insert inaugural Principal into public.school_staff (exact 1:1 columns, NO extra fields!)
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
          // Clean atomic rollback so orphaned school never remains without its Principal
          await supabase.from('schools').delete().eq('id', nextCode);
          throw new Error(
            `Principal Account Insert Error (${staffInsertErr.code || 'DB'}): ${staffInsertErr.message}`
          );
        }
      }

      const kit: OnboardingKitData = {
        schoolCode: nextCode,
        schoolName: cleanName,
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
      <div className="min-h-screen bg-[#F6F8FC] dark:bg-[#090D16] text-[#0F172A] dark:text-[#F8FAFC] flex flex-col justify-between px-4 py-6 transition-colors">
        <header className="max-w-5xl w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#4F46E5] flex items-center justify-center text-white shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-sm tracking-tight">EDZY HQ</div>
              <div className="text-[11px] text-[#475569] dark:text-[#94A3B8]">SaaS Ecosystem Control</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onNavigateHome && (
              <button
                type="button"
                onClick={onNavigateHome}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-bold text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white cursor-pointer"
              >
                School Portal Login
              </button>
            )}
            <button
              type="button"
              onClick={toggleThemeMode}
              className="p-2 rounded-xl bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] cursor-pointer"
              aria-label="Toggle theme"
            >
              {themeMode === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-[#475569]" />
              )}
            </button>
          </div>
        </header>

        <main className="max-w-md w-full mx-auto my-8 bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] rounded-2xl shadow-xl p-7 space-y-5">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#6366F1] border border-[#C7D2FE] dark:border-[#3730A3]">
              <Lock className="w-3 h-3" />
              Restricted Founder Console
            </span>
            <h1 className="text-xl font-extrabold">EDZY HQ • SaaS Ecosystem Control</h1>
            <p className="text-xs text-[#475569] dark:text-[#94A3B8] leading-relaxed">
              Provision isolated K-12 partner schools, issue inaugural Principal IDs, and monitor live tenant adoption across the Edzy network.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label className="block text-xs font-bold mb-1.5">Founder Access Key</label>
              <input
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
          EDZY: Education Made Easy • Multi-Tenant SaaS Operator Portal
        </footer>
      </div>
    );
  }

  // AUTHENTICATED FOUNDER HQ VIEW
  return (
    <div className="min-h-screen bg-[#F6F8FC] dark:bg-[#090D16] text-[#0F172A] dark:text-[#F8FAFC] transition-colors">
      {/* Sticky Top Header */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#0D1320]/90 backdrop-blur-md border-b border-[#E2E8F0] dark:border-[#232E44]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#4F46E5] flex items-center justify-center text-white shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight">EDZY HQ</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#6366F1] border border-[#C7D2FE] dark:border-[#3730A3]">
                  FOUNDER CONSOLE
                </span>
              </div>
              <p className="text-[11px] text-[#475569] dark:text-[#94A3B8]">
                EDZY: Education Made Easy • Partner School Onboarding
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchEcosystemData}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EEF2F7] dark:bg-[#1A2336] text-xs font-bold text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {onNavigateHome && (
              <button
                type="button"
                onClick={onNavigateHome}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-bold text-[#4F46E5] dark:text-[#6366F1] cursor-pointer"
              >
                <span>School Portal</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={toggleThemeMode}
              className="p-2 rounded-xl bg-[#EEF2F7] dark:bg-[#1A2336] cursor-pointer"
              aria-label="Toggle theme"
            >
              {themeMode === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-[#475569]" />
              )}
            </button>

            <button
              type="button"
              onClick={handleLockHq}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 text-xs font-bold cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Lock HQ</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Title & CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Partner Schools Ecosystem</h1>
            <p className="text-sm text-[#475569] dark:text-[#94A3B8] mt-0.5">
              Onboard isolated school tenants cleanly and issue Principal first-time activation kits.
            </p>
          </div>

          <button
            type="button"
            onClick={openOnboardModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#3730A3] text-white text-sm font-bold shadow-sm transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Onboard New School</span>
          </button>
        </div>

        {loadError && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold">
            {loadError}
          </div>
        )}

        {/* 4 Ecosystem Overview KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#121826] p-5 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#EEF2FF] dark:bg-[#1B2440] border border-[#C7D2FE] dark:border-[#3730A3] flex items-center justify-center text-[#4F46E5] dark:text-[#6366F1]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-extrabold">{schools.length}</div>
              <div className="text-xs text-[#475569] dark:text-[#94A3B8] font-medium">
                Total Partner Schools
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#121826] p-5 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-extrabold">{statsMaps.totalStudents}</div>
              <div className="text-xs text-[#475569] dark:text-[#94A3B8] font-medium">
                Students Across Ecosystem
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#121826] p-5 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#ECFDF5] dark:bg-[rgba(16,185,129,0.14)] border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center text-[#059669] dark:text-[#34D399]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-extrabold">{statsMaps.activeStaffTotal}</div>
              <div className="text-xs text-[#475569] dark:text-[#94A3B8] font-medium">
                Active Staff Accounts
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#121826] p-5 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#FFFBEB] dark:bg-[rgba(245,158,11,0.14)] border border-amber-200 dark:border-amber-500/30 flex items-center justify-center text-[#D97706] dark:text-[#FBBF24]">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-extrabold">
                ₹{statsMaps.estimatedMrr.toLocaleString('en-IN')}
                <span className="text-xs font-bold text-[#94A3B8]">/mo</span>
              </div>
              <div className="text-xs text-[#475569] dark:text-[#94A3B8] font-medium">
                Est. SaaS MRR (₹99 AI Suite)
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white dark:bg-[#121826] p-4 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs flex items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search School Code (SCH-01), Name, Principal, Board..."
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
            />
          </div>
          <span className="text-xs font-bold text-[#475569] dark:text-[#94A3B8] shrink-0">
            Next Auto Code: <strong className="font-mono text-[#4F46E5] dark:text-[#6366F1]">{nextSeqPreview.nextCode}</strong>
          </span>
        </div>

        {/* Partner Schools Directory Table */}
        <div className="bg-white dark:bg-[#121826] rounded-2xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#EEF2F7]/80 dark:bg-[#1A2336]/80 border-b border-[#E2E8F0] dark:border-[#232E44] text-[11px] font-bold uppercase tracking-wider text-[#475569] dark:text-[#94A3B8]">
                  <th className="py-3.5 px-4">School Code</th>
                  <th className="py-3.5 px-4">Partner School & Board</th>
                  <th className="py-3.5 px-4">Principal & Admin ID</th>
                  <th className="py-3.5 px-4">Live Usage</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#232E44]">
                {filteredSchools.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-[#94A3B8]">
                      No partner schools found.
                    </td>
                  </tr>
                ) : (
                  filteredSchools.map((sch) => {
                    const stuCount = statsMaps.studentCount.get(sch.schoolCode) || 0;
                    const stfCount = statsMaps.staffCount.get(sch.schoolCode) || 0;
                    const primaryAdmin = statsMaps.adminBySchool.get(sch.schoolCode);
                    const adminId = primaryAdmin?.id || `${sch.schoolCode}-ADM-001`;
                    const isProtectedDemo = sch.schoolCode === 'SCH-01';

                    const kitPayload: OnboardingKitData = {
                      schoolCode: sch.schoolCode,
                      schoolName: sch.name,
                      board: sch.board,
                      academicSession: sch.academicSession,
                      principalName: sch.principalName,
                      principalEmployeeId: adminId,
                      principalPhone: primaryAdmin?.phone || null,
                      isPasswordSet: Boolean(primaryAdmin?.isPasswordSet),
                    };

                    return (
                      <tr
                        key={sch.id}
                        className="hover:bg-[#F6F8FC] dark:hover:bg-[#1A2336]/40 transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center whitespace-nowrap px-2.5 py-1 rounded-lg font-mono font-extrabold text-xs bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#6366F1] border border-[#C7D2FE] dark:border-[#3730A3]">
                            {sch.schoolCode}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">
                            {sch.name}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EEF2F7] dark:bg-[#1A2336] text-[#475569] dark:text-[#94A3B8]">
                              {sch.board}
                            </span>
                            <span className="text-[11px] text-[#94A3B8]">
                              Session {sch.academicSession}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                            {sch.principalName}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono font-bold text-[11px] text-[#4F46E5] dark:text-[#6366F1]">
                              {adminId}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                primaryAdmin?.isPasswordSet
                                  ? 'bg-[#ECFDF5] dark:bg-[rgba(16,185,129,0.14)] text-[#059669] dark:text-[#34D399]'
                                  : 'bg-[#FFFBEB] dark:bg-[rgba(245,158,11,0.14)] text-[#D97706] dark:text-[#FBBF24]'
                              }`}
                            >
                              {primaryAdmin?.isPasswordSet ? 'Activated' : 'Pending'}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                            {stuCount} Students
                          </div>
                          <div className="text-[11px] text-[#475569] dark:text-[#94A3B8]">
                            {stfCount} Staff Account{stfCount === 1 ? '' : 's'}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setInspectKit(kitPayload)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EEF2FF] dark:bg-[#1B2440] hover:bg-[#4F46E5] hover:text-white dark:hover:bg-[#6366F1] text-[#4F46E5] dark:text-[#6366F1] border border-[#C7D2FE] dark:border-[#3730A3] font-bold text-xs transition-colors cursor-pointer"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                              <span>Principal Onboarding Kit</span>
                            </button>

                            <button
                              type="button"
                              disabled={isProtectedDemo}
                              onClick={() => setSchoolToDelete(sch)}
                              title={
                                isProtectedDemo
                                  ? 'SCH-01 is protected flagship demo school'
                                  : `Remove ${sch.name}`
                              }
                              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                                isProtectedDemo
                                  ? 'bg-[#F6F8FC] dark:bg-[#1A2336] text-[#94A3B8] border-[#E2E8F0] dark:border-[#232E44] opacity-45 cursor-not-allowed'
                                  : 'bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-600 hover:text-white text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/50 cursor-pointer'
                              }`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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

      {/* + Onboard New School Modal */}
      {isOnboardOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsOnboardOpen(false)}
        >
          <div
            className="bg-white dark:bg-[#121826] rounded-2xl shadow-2xl max-w-xl w-full border border-[#E2E8F0] dark:border-[#232E44] overflow-hidden my-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="no-print px-6 py-4 bg-white dark:bg-[#0D1320] border-b border-[#E2E8F0] dark:border-[#232E44] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#6366F1] flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold">
                    {issuedKit ? 'Partner School Live & Principal Kit Ready' : 'Onboard New Partner School'}
                  </h2>
                  <p className="text-[11px] text-[#475569] dark:text-[#94A3B8]">
                    {issuedKit
                      ? `Tenant ${issuedKit.schoolCode} & ${issuedKit.principalEmployeeId} provisioned`
                      : `Auto-assigns next sequential School Code (${nextSeqPreview.nextCode})`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOnboardOpen(false)}
                className="p-1.5 rounded-lg text-[#475569] dark:text-[#94A3B8] hover:bg-[#EEF2F7] dark:hover:bg-[#1A2336] cursor-pointer"
              >
                <X className="w-5 h-5" />
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
                    <span className="font-mono text-sm font-extrabold text-[#4F46E5] dark:text-[#6366F1]">
                      {nextSeqPreview.nextCode}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">School Name *</label>
                    <input
                      type="text"
                      required
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      placeholder="e.g. Brightlands School, Dehradun"
                      className="w-full h-10 px-3 rounded-xl bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold mb-1">Education Board *</label>
                      <select
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
                      <label className="block text-xs font-bold mb-1">Academic Session *</label>
                      <input
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
                      <label className="block text-xs font-bold mb-1">Principal Full Name *</label>
                      <input
                        type="text"
                        required
                        value={principalName}
                        onChange={(e) => setPrincipalName(e.target.value)}
                        placeholder="e.g. Dr. Rajeshwari Nair"
                        className="w-full h-10 px-3 rounded-xl bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-1">Principal Phone (Optional)</label>
                      <input
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
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
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
                      <Building2 className="w-4 h-4" />
                      <span>
                        {isProvisioning
                          ? 'Provisioning Tenant...'
                          : `Onboard School (${nextSeqPreview.nextCode})`}
                      </span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Inspect Principal Onboarding Kit Modal */}
      {inspectKit && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setInspectKit(null)}
        >
          <div
            className="bg-white dark:bg-[#121826] rounded-2xl shadow-2xl max-w-lg w-full border border-[#E2E8F0] dark:border-[#232E44] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="no-print px-6 py-4 bg-white dark:bg-[#0D1320] border-b border-[#E2E8F0] dark:border-[#232E44] flex items-center justify-between">
              <h3 className="text-sm font-extrabold">Principal Onboarding Kit</h3>
              <button
                type="button"
                onClick={() => setInspectKit(null)}
                className="p-1.5 rounded-lg text-[#475569] dark:text-[#94A3B8] hover:bg-[#EEF2F7] dark:hover:bg-[#1A2336] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <PrincipalOnboardingKitCard kit={inspectKit} />
            </div>
          </div>
        </div>
      )}

      {/* Remove Test School Confirmation Modal */}
      {schoolToDelete && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSchoolToDelete(null)}
        >
          <div
            className="bg-white dark:bg-[#121826] rounded-2xl shadow-2xl max-w-md w-full border border-[#E2E8F0] dark:border-[#232E44] p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold">Remove Test School?</h3>
                <p className="text-xs text-[#475569] dark:text-[#94A3B8] mt-1 leading-relaxed">
                  Are you sure you want to permanently remove{' '}
                  <strong className="text-[#0F172A] dark:text-[#F8FAFC]">{schoolToDelete.name}</strong> (
                  <span className="font-mono">{schoolToDelete.schoolCode}</span>)? All staff, students, and ledgers under this tenant will be cascade-deleted.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
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
        </div>
      )}
    </div>
  );
}
