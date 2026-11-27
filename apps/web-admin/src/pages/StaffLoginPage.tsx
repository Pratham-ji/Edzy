import React, { useState } from 'react';
import {
  School,
  Sun,
  Moon,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  KeyRound,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Lock,
} from 'lucide-react';
import { SchoolStaff, useAdminStore } from '../store/useAdminStore';
import { formatStaffRoleLabel, getStaffInitials } from '../lib/rbac';

interface StaffLoginPageProps {
  onNavigatePath: (path: string) => void;
}

type LoginStep = 'IDENTIFY' | 'LOGIN' | 'ACTIVATE';

const DEMO_ACCESS_CHIPS = [
  { id: 'SCH-01-ADM-001', label: 'Principal', tag: 'SCH-01-ADM-001', isSetup: false },
  { id: 'SCH-01-TCH-001', label: 'Class 10-A Teacher', tag: 'SCH-01-TCH-001', isSetup: false },
  { id: 'SCH-01-ACT-001', label: 'Accounts Desk', tag: 'SCH-01-ACT-001', isSetup: false },
  { id: 'SCH-01-TCH-003', label: 'New Teacher Setup', tag: 'SCH-01-TCH-003', isSetup: true },
];

function evaluatePasswordStrength(pwd: string): { label: string; score: number; color: string } {
  if (!pwd) return { label: 'Enter password', score: 0, color: 'bg-[#E2E8F0] dark:bg-[#232E44]' };
  let score = 0;
  if (pwd.length >= 6) score += 1;
  if (pwd.length >= 8 && /[0-9]/.test(pwd)) score += 1;
  if (pwd.length >= 10 || (/[A-Z]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd))) score += 1;

  if (score <= 1) return { label: 'Fair (min 6 chars)', score: 1, color: 'bg-amber-500' };
  if (score === 2) return { label: 'Good', score: 2, color: 'bg-[#4F46E5] dark:bg-[#6366F1]' };
  return { label: 'Strong', score: 3, color: 'bg-[#059669] dark:bg-[#34D399]' };
}

export default function StaffLoginPage({ onNavigatePath }: StaffLoginPageProps) {
  const {
    themeMode,
    toggleThemeMode,
    schoolProfile,
    availableSchools,
    lookupEmployeeById,
    loginWithStaffPassword,
    completeFirstTimePasswordSetup,
  } = useAdminStore();

  const [step, setStep] = useState<LoginStep>('IDENTIFY');
  const [employeeIdInput, setEmployeeIdInput] = useState('');
  const [verifiedStaff, setVerifiedStaff] = useState<SchoolStaff | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDemoTray, setShowDemoTray] = useState(true);

  const staffSchoolName = verifiedStaff
    ? availableSchools.find((s) => s.id === verifiedStaff.schoolId || s.schoolCode === verifiedStaff.schoolId)?.name ||
      schoolProfile.name
    : schoolProfile.name;

  const strength = evaluatePasswordStrength(passwordInput);

  const runEmployeeLookup = async (rawId: string) => {
    const clean = rawId.trim().toUpperCase();
    if (!clean) {
      setErrorMsg('Please enter your Employee ID to continue.');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const res = await lookupEmployeeById(clean);
      if (!res.found || !res.staff) {
        setErrorMsg('Employee ID not found. Contact your School Principal to register your account.');
        return;
      }
      if (res.isInactive) {
        setErrorMsg('This Employee ID has been deactivated by your School Administrator.');
        return;
      }

      setVerifiedStaff(res.staff);
      setPasswordInput('');
      setConfirmPasswordInput('');
      setShowPassword(false);
      setShowConfirmPassword(false);
      setStep(res.needsPasswordSetup ? 'ACTIVATE' : 'LOGIN');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleIdentifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runEmployeeLookup(employeeIdInput);
  };

  const handleReturningLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifiedStaff) return;
    if (!passwordInput) {
      setErrorMsg('Please enter your account password.');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const res = await loginWithStaffPassword(verifiedStaff.id, passwordInput);
      if (!res.success) {
        setErrorMsg(res.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFirstTimeActivation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifiedStaff) return;

    if (passwordInput.length < 6) {
      setErrorMsg('Please create a password with at least 6 characters.');
      return;
    }
    if (passwordInput !== confirmPasswordInput) {
      setErrorMsg('Passwords do not match. Re-enter both fields identically.');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const res = await completeFirstTimePasswordSetup(verifiedStaff.id, passwordInput);
      if (!res.success) {
        setErrorMsg(res.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetToIdentify = () => {
    setStep('IDENTIFY');
    setVerifiedStaff(null);
    setPasswordInput('');
    setConfirmPasswordInput('');
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-[#F6F8FC] dark:bg-[#090D16] text-[#0F172A] dark:text-[#F8FAFC] flex flex-col justify-between transition-colors font-sans">
      {/* Subtle Top Utility Header */}
      <header className="w-full max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#4F46E5] to-[#6366F1] flex items-center justify-center shadow-md shadow-indigo-500/20">
            <School className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-wider text-[#0F172A] dark:text-[#F8FAFC]">EDZY</span>
              <span className="text-[10px] bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#6366F1] font-bold px-2 py-0.5 rounded border border-[#C7D2FE] dark:border-[#3730A3]">
                SCHOOL ERP
              </span>
            </div>
            <p className="text-[11px] text-[#475569] dark:text-[#94A3B8] font-medium">
              School Command Cloud
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onNavigatePath('/pitch')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-semibold text-[#4F46E5] dark:text-[#6366F1] hover:bg-[#EEF2FF] dark:hover:bg-[#1B2440] transition cursor-pointer"
          >
            <span>View Public Pitch</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={toggleThemeMode}
            title={themeMode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-xl bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] text-[#475569] dark:text-[#94A3B8] hover:bg-[#EEF2FF] dark:hover:bg-[#1A2336] transition cursor-pointer"
          >
            {themeMode === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-[#475569]" />
            )}
          </button>
        </div>
      </header>

      {/* Main Centered Institutional Portal */}
      <main className="flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-md space-y-5">
          {/* Gen-Z Affiliation Pill */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EEF2FF] dark:bg-[#1B2440] border border-[#C7D2FE] dark:border-[#3730A3] text-[11px] font-bold text-[#4F46E5] dark:text-[#6366F1]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Education Made Easy for Gen-Z</span>
            </div>
          </div>

          {/* Auth Card */}
          <div className="bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] rounded-2xl shadow-xl shadow-slate-900/5 dark:shadow-black/30 p-7 space-y-6">
            {/* STEP 1: IDENTIFY EMPLOYEE ID */}
            {step === 'IDENTIFY' && (
              <form onSubmit={handleIdentifySubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <h1 className="text-xl font-extrabold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
                    Staff & Leadership Sign-In
                  </h1>
                  <p className="text-xs text-[#475569] dark:text-[#94A3B8] leading-relaxed">
                    Enter your school-issued Employee ID to launch your Principal, Class Teacher, or Accounts desk workspace.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#475569] dark:text-[#94A3B8]">
                    Employee ID
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-[#475569] dark:text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={employeeIdInput}
                      onChange={(e) => {
                        setEmployeeIdInput(e.target.value.toUpperCase());
                        if (errorMsg) setErrorMsg(null);
                      }}
                      placeholder="e.g. SCH-01-ADM-001"
                      autoFocus
                      className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#EEF2F7] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] text-sm font-mono font-semibold text-[#0F172A] dark:text-[#F8FAFC] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] dark:focus:ring-[#6366F1]"
                    />
                  </div>
                  <p className="text-[11px] text-[#475569] dark:text-[#94A3B8] font-medium">
                    Format: <span className="font-mono font-semibold text-[#4F46E5] dark:text-[#6366F1]">SCH-01</span> (School) •{' '}
                    <span className="font-mono font-semibold">ADM / TCH / ACT</span> (Dept) •{' '}
                    <span className="font-mono font-semibold">001</span> (Serial)
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/70 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    <p className="text-xs font-medium text-rose-700 dark:text-rose-300 leading-relaxed">
                      {errorMsg}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 rounded-xl bg-[#4F46E5] hover:bg-[#3730A3] dark:bg-[#6366F1] dark:hover:bg-[#4F46E5] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 disabled:opacity-60 transition cursor-pointer"
                >
                  <span>{isSubmitting ? 'Verifying Employee ID...' : 'Continue'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* STEP 2A: RETURNING STAFF PASSWORD ENTRY */}
            {step === 'LOGIN' && verifiedStaff && (
              <form onSubmit={handleReturningLogin} className="space-y-5">
                {/* Verified Staff Card */}
                <div className="p-3.5 rounded-xl bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#4F46E5] dark:bg-[#6366F1] text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {getStaffInitials(verifiedStaff.fullName)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] truncate">
                        {verifiedStaff.fullName}
                      </p>
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#4F46E5] dark:text-[#6366F1]">
                        <span>{formatStaffRoleLabel(verifiedStaff)}</span>
                        <span>•</span>
                        <span className="font-mono">{verifiedStaff.id}</span>
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={resetToIdentify}
                    className="text-[11px] font-bold text-[#475569] dark:text-[#94A3B8] hover:text-[#4F46E5] dark:hover:text-[#6366F1] shrink-0 underline cursor-pointer"
                  >
                    Change ID
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#475569] dark:text-[#94A3B8]">
                    Account Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#475569] dark:text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordInput}
                      onChange={(e) => {
                        setPasswordInput(e.target.value);
                        if (errorMsg) setErrorMsg(null);
                      }}
                      placeholder="Enter your password"
                      autoFocus
                      className="w-full h-11 pl-10 pr-11 rounded-xl bg-[#EEF2F7] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] text-sm text-[#0F172A] dark:text-[#F8FAFC] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] dark:focus:ring-[#6366F1]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/70 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    <p className="text-xs font-medium text-rose-700 dark:text-rose-300 leading-relaxed">
                      {errorMsg}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 rounded-xl bg-[#4F46E5] hover:bg-[#3730A3] dark:bg-[#6366F1] dark:hover:bg-[#4F46E5] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 disabled:opacity-60 transition cursor-pointer"
                >
                  <span>{isSubmitting ? 'Signing In...' : 'Sign In to Workspace →'}</span>
                </button>
              </form>
            )}

            {/* STEP 2B: FIRST-TIME SELF-PASSWORD ACTIVATION */}
            {step === 'ACTIVATE' && verifiedStaff && (
              <form onSubmit={handleFirstTimeActivation} className="space-y-4">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={resetToIdentify}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Use another ID</span>
                  </button>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    FIRST-TIME ACTIVATION
                  </span>
                </div>

                {/* Warm Emerald Onboarding Banner */}
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/35 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#059669] dark:text-[#34D399] shrink-0 mt-0.5" />
                  <p className="text-xs font-medium text-emerald-900 dark:text-emerald-200 leading-relaxed">
                    Welcome to <strong>{staffSchoolName}</strong>, <strong>{verifiedStaff.fullName}</strong> (
                    <span className="font-mono font-bold">{verifiedStaff.id}</span>)! Set your personal password below to activate your ERP account.
                  </p>
                </div>

                {/* Create Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#475569] dark:text-[#94A3B8]">
                      Create Password
                    </label>
                    <span className="text-[10px] font-semibold text-[#475569] dark:text-[#94A3B8]">
                      {strength.label}
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#475569] dark:text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordInput}
                      onChange={(e) => {
                        setPasswordInput(e.target.value);
                        if (errorMsg) setErrorMsg(null);
                      }}
                      placeholder="Minimum 6 characters"
                      autoFocus
                      className="w-full h-11 pl-10 pr-11 rounded-xl bg-[#EEF2F7] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] text-sm text-[#0F172A] dark:text-[#F8FAFC] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] dark:focus:ring-[#6366F1]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#475569] dark:text-[#94A3B8] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Strength Indicator Track */}
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    {[1, 2, 3].map((lvl) => (
                      <div
                        key={lvl}
                        className={`h-1 rounded-full transition-colors ${
                          strength.score >= lvl ? strength.color : 'bg-[#E2E8F0] dark:bg-[#232E44]'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#475569] dark:text-[#94A3B8]">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#475569] dark:text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPasswordInput}
                      onChange={(e) => {
                        setConfirmPasswordInput(e.target.value);
                        if (errorMsg) setErrorMsg(null);
                      }}
                      placeholder="Re-enter password"
                      className="w-full h-11 pl-10 pr-11 rounded-xl bg-[#EEF2F7] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] text-sm text-[#0F172A] dark:text-[#F8FAFC] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] dark:focus:ring-[#6366F1]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#475569] dark:text-[#94A3B8] cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/70 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    <p className="text-xs font-medium text-rose-700 dark:text-rose-300 leading-relaxed">
                      {errorMsg}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 rounded-xl bg-[#059669] hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 disabled:opacity-60 transition cursor-pointer"
                >
                  <span>{isSubmitting ? 'Activating Account...' : 'Set Password & Enter Workspace →'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Compact Quick-Demo Credentials Footer Tray */}
          <div className="bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] rounded-2xl p-4">
            <button
              type="button"
              onClick={() => setShowDemoTray(!showDemoTray)}
              className="w-full flex items-center justify-between text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#4F46E5] dark:text-[#6366F1]" />
                <span>Quick Demo Credentials (Password: <span className="font-mono text-[#4F46E5] dark:text-[#6366F1]">edzy123</span>)</span>
              </div>
              {showDemoTray ? (
                <ChevronUp className="w-4 h-4 text-[#475569] dark:text-[#94A3B8]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#475569] dark:text-[#94A3B8]" />
              )}
            </button>

            {showDemoTray && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DEMO_ACCESS_CHIPS.map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => {
                      setEmployeeIdInput(chip.id);
                      runEmployeeLookup(chip.id);
                    }}
                    className={`text-left px-3 py-2 rounded-xl border transition cursor-pointer ${
                      chip.isSetup
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100/70'
                        : 'bg-[#F6F8FC] dark:bg-[#1A2336] border-[#E2E8F0] dark:border-[#232E44] hover:border-[#C7D2FE] dark:hover:border-[#3730A3]'
                    }`}
                  >
                    <p className="text-[11px] font-bold text-[#0F172A] dark:text-[#F8FAFC] truncate">
                      {chip.label}
                    </p>
                    <p className="text-[10px] font-mono text-[#4F46E5] dark:text-[#6366F1] font-semibold mt-0.5">
                      {chip.tag}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Minimal Privacy Footer */}
      <footer className="py-4 px-6 text-center text-[11px] text-[#475569] dark:text-[#94A3B8] flex items-center justify-center gap-4">
        <span>Edzy K-12 Cloud OS • DPDP Act 2023 Compliant</span>
        <span>•</span>
        <button
          type="button"
          onClick={() => onNavigatePath('/privacy-policy')}
          className="font-semibold text-[#4F46E5] dark:text-[#6366F1] hover:underline cursor-pointer"
        >
          Privacy Policy
        </button>
      </footer>
    </div>
  );
}
