import React, { useEffect, useMemo, useState } from 'react';
import {
  Building2,
  Save,
  ShieldCheck,
  Database,
  FileSpreadsheet,
  CheckCircle2,
  GraduationCap,
  Sun,
  Moon,
  ArrowRight,
  KeyRound,
} from 'lucide-react';
import { useAdminStore } from '../store/useAdminStore';
import { isLiveSupabaseConfigured } from '../lib/supabase';
import { downloadCsvFile, formatReceiptNumber } from '../lib/feeMetrics';

interface SettingsPageProps {
  onOpenAccountsExport?: () => void;
}

function suggestNextSchoolCode(availableSchools: Array<{ schoolCode: string }>): string {
  let maxNum = 1;
  for (const sch of availableSchools) {
    const match = (sch.schoolCode || '').toUpperCase().match(/^SCH-(\d+)$/);
    if (match) {
      maxNum = Math.max(maxNum, parseInt(match[1], 10));
    }
  }
  return `SCH-${String(maxNum + 1).padStart(2, '0')}`;
}

export default function SettingsPage({ onOpenAccountsExport }: SettingsPageProps) {
  const {
    schoolProfile,
    availableSchools,
    switchActiveSchool,
    provisionPilotSchool,
    updateSchoolProfile,
    feeInstallments,
    themeMode,
    setThemeMode,
  } = useAdminStore();
  const [formData, setFormData] = useState({ ...schoolProfile });
  const [saveToast, setSaveToast] = useState(false);

  const suggestedCode = useMemo(
    () => suggestNextSchoolCode(availableSchools),
    [availableSchools]
  );

  // Pilot School Provisioning State
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSchoolCode, setNewSchoolCode] = useState(suggestedCode);
  const [newBoard, setNewBoard] = useState('CBSE');
  const [newPrincipal, setNewPrincipal] = useState('');
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisionSuccess, setProvisionSuccess] = useState<{
    name: string;
    code: string;
    principalId: string;
  } | null>(null);
  const [provisionError, setProvisionError] = useState<string | null>(null);

  useEffect(() => {
    setNewSchoolCode((prev) => (prev ? prev : suggestedCode));
  }, [suggestedCode]);

  const handleProvisionSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = newSchoolCode.trim().toUpperCase();
    const cleanName = newSchoolName.trim();
    const cleanPrincipal = newPrincipal.trim();

    if (!cleanCode || !cleanName) {
      setProvisionError('School Code and School Name are required.');
      return;
    }

    setIsProvisioning(true);
    setProvisionError(null);
    setProvisionSuccess(null);

    try {
      const result = await provisionPilotSchool({
        schoolCode: cleanCode,
        name: cleanName,
        board: newBoard,
        principalName: cleanPrincipal,
      });

      setProvisionSuccess({
        name: result.school.name,
        code: result.school.schoolCode,
        principalId: result.principalStaff.id,
      });
      setNewSchoolName('');
      setNewPrincipal('');
      const updatedSchools = useAdminStore.getState().availableSchools;
      setNewSchoolCode(suggestNextSchoolCode(updatedSchools));
    } catch (err: any) {
      setProvisionError(err?.message || 'Failed to provision pilot school in database.');
    } finally {
      setIsProvisioning(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSchoolProfile(formData);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const handleExportFeeLedgerCsv = () => {
    const headers = [
      'Student ID',
      'Student Name',
      'Class',
      'Quarter',
      'Amount (INR)',
      'Mode',
      'Receipt #',
      'Status',
      'Paid Date',
      'Reference Note',
    ];
    const rows = feeInstallments.map((f) => [
      f.studentId,
      f.studentName,
      f.classGrade,
      f.quarter,
      f.amount,
      f.paymentMethod || 'PENDING',
      formatReceiptNumber(f.receiptNumber),
      f.status,
      f.paidDate || '',
      f.paymentRef || f.clerkNote || '',
    ]);
    downloadCsvFile(
      `Edzy_Fee_Ledger_${schoolProfile.code}_${new Date().toISOString().split('T')[0]}.csv`,
      headers,
      rows
    );
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              Campus ERP Configuration & Profile
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#6366F1] border border-[#C7D2FE] dark:border-[#3730A3]">
              {(schoolProfile.board || 'CBSE').split(' ')[0].toUpperCase()} Affiliated
            </span>
          </div>
          <p className="text-sm text-[#475569] dark:text-[#94A3B8] mt-0.5">
            Manage official school identity for printed receipts, Tally accounting exports, and tenant provisioning.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          {onOpenAccountsExport && (
            <button
              type="button"
              onClick={onOpenAccountsExport}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#EEF2FF] dark:bg-[#1B2440] hover:bg-[#4F46E5] hover:text-white text-[#4F46E5] dark:text-[#6366F1] border border-[#C7D2FE] dark:border-[#3730A3] text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <span>Open Tally Export Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={handleExportFeeLedgerCsv}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#059669] hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Tally CSV</span>
          </button>
        </div>
      </div>

      {saveToast && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>School profile details saved successfully! All receipts will use updated data.</span>
        </div>
      )}

      {/* Multi-Board School Campus Switcher Card */}
      <div className="bg-white dark:bg-[#121826] rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#232E44]">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#4F46E5] dark:text-[#6366F1]" />
            <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">Active School & Board Context</h3>
          </div>
          <span className="text-xs text-[#475569] dark:text-[#94A3B8] font-medium">Multi-Board Ready</span>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {availableSchools.map((sch) => {
            const isActive = schoolProfile.code === sch.schoolCode;
            return (
              <button
                key={sch.id}
                type="button"
                onClick={() => {
                  switchActiveSchool(sch.id);
                  setFormData((prev) => ({
                    ...prev,
                    name: sch.name,
                    code: sch.schoolCode,
                    board: sch.board,
                    principalName: sch.principalName,
                    session: sch.academicSession,
                  }));
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#6366F1] border-[#C7D2FE] dark:border-[#3730A3]'
                    : 'bg-[#F6F8FC] dark:bg-[#1A2336] text-[#475569] dark:text-[#94A3B8] border-[#E2E8F0] dark:border-[#232E44] hover:opacity-85'
                }`}
              >
                {sch.name} ({sch.schoolCode}) • {sch.board}
              </button>
            );
          })}
        </div>
      </div>

      {/* Appearance & Theme Selector Card */}
      <div className="bg-white dark:bg-[#121826] rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#232E44]">
          <div className="flex items-center gap-2">
            <Sun className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">Appearance & Theme</h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">Global Preference</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-[#F8FAFC]">ERP Color Theme</p>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8]">Switch between Crisp Light (Default) and Linear Dark mode.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setThemeMode('light')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                themeMode === 'light'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-[#EEF2F7] dark:bg-[#1A2336] text-slate-600 dark:text-[#94A3B8] hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              Light Mode (Default)
            </button>
            <button
              type="button"
              onClick={() => setThemeMode('dark')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                themeMode === 'dark'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-[#EEF2F7] dark:bg-[#1A2336] text-slate-600 dark:text-[#94A3B8] hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              Dark Mode
            </button>
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-[#121826] rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs p-6 space-y-6">
          <div className="border-b border-slate-100 dark:border-[#232E44] pb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-900 dark:text-[#F8FAFC] font-bold text-base">
              <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Institutional Identity & Affiliation</span>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-800">
              Code: {schoolProfile.code}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Official School Name (Header on Receipts)
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] rounded-lg text-sm text-slate-900 dark:text-[#F8FAFC] focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Board Affiliation / Registration Number
              </label>
              <input
                type="text"
                name="affiliationNumber"
                value={formData.affiliationNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] rounded-lg text-sm text-slate-900 dark:text-[#F8FAFC] focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Education Board
              </label>
              <input
                type="text"
                name="board"
                value={formData.board}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] rounded-lg text-sm text-slate-900 dark:text-[#F8FAFC] focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Current Academic Session
              </label>
              <input
                type="text"
                name="session"
                value={formData.session}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] rounded-lg text-sm text-slate-900 dark:text-[#F8FAFC] focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Campus Postal Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] rounded-lg text-sm text-slate-900 dark:text-[#F8FAFC] focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] rounded-lg text-sm text-slate-900 dark:text-[#F8FAFC] focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] rounded-lg text-sm text-slate-900 dark:text-[#F8FAFC] focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          {/* Key Authorized Officers */}
          <div className="border-t border-slate-100 dark:border-[#232E44] pt-5">
            <h4 className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-4">
              Authorized Signatories & Office Contacts
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Principal Name
                </label>
                <input
                  type="text"
                  name="principalName"
                  value={formData.principalName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] rounded-lg text-sm text-slate-900 dark:text-[#F8FAFC] focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Accounts Officer / Head Clerk
                </label>
                <input
                  type="text"
                  name="accountantName"
                  value={formData.accountantName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] rounded-lg text-sm text-slate-900 dark:text-[#F8FAFC] focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Accounts Phone (For SMS/WhatsApp receipts)
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] rounded-lg text-sm text-slate-900 dark:text-[#F8FAFC] focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Official School ERP Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] rounded-lg text-sm text-slate-900 dark:text-[#F8FAFC] focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-sm transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save School Configuration</span>
            </button>
          </div>
        </div>
      </form>

      {/* Provision New Pilot School Card */}
      <div className="bg-white dark:bg-[#121826] rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-slate-900 dark:text-[#F8FAFC] font-bold text-base">
            <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Provision New Pilot School Entity</span>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            Multi-Tenant Core
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-[#94A3B8] mb-5">
          Deploy a clean tenant schema for a new K-12 partner school on Edzy Postgres. Once provisioned, admission rosters and fee schedules can be imported via CSV.
        </p>

        {provisionSuccess && (
          <div className="mb-5 p-4 rounded-xl bg-[#ECFDF5] dark:bg-[rgba(16,185,129,0.14)] border border-emerald-200 dark:border-emerald-800 text-[#059669] dark:text-[#34D399] text-xs space-y-1.5">
            <div className="font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                Partner School &ldquo;{provisionSuccess.name}&rdquo; ({provisionSuccess.code}) provisioned!
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] pl-6">
              <KeyRound className="w-3.5 h-3.5 shrink-0" />
              <span>
                Initial Principal Login ID created:{' '}
                <strong className="font-mono">{provisionSuccess.principalId}</strong> (ready for first-time self-password activation).
              </span>
            </div>
          </div>
        )}

        {provisionError && (
          <div className="mb-5 p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-semibold">
            {provisionError}
          </div>
        )}

        <form onSubmit={handleProvisionSchool} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Official Institution Name *
              </label>
              <input
                type="text"
                placeholder="e.g. St. Joseph's Senior Secondary School"
                value={newSchoolName}
                onChange={(e) => setNewSchoolName(e.target.value)}
                className="w-full px-3 py-2 bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] rounded-lg text-sm text-slate-900 dark:text-[#F8FAFC] focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Unique Campus Code (Auto-Suggested: {suggestedCode}) *
              </label>
              <input
                type="text"
                placeholder={suggestedCode}
                value={newSchoolCode}
                onChange={(e) => setNewSchoolCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] rounded-lg text-sm text-slate-900 dark:text-[#F8FAFC] font-mono focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Board Affiliation
              </label>
              <select
                value={newBoard}
                onChange={(e) => setNewBoard(e.target.value)}
                className="w-full px-3 py-2 bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] rounded-lg text-sm text-slate-900 dark:text-[#F8FAFC] focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="CBSE">CBSE (Central Board of Secondary Education)</option>
                <option value="ICSE">CISCE / ICSE (Indian Certificate of Secondary Education)</option>
                <option value="State Board">State Board (UBSE, UPMSP, MSBSHSE)</option>
                <option value="Cambridge / IB">Cambridge International / IB</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Principal / Head of Institution
              </label>
              <input
                type="text"
                placeholder="e.g. Dr. Rajeshwari Nair"
                value={newPrincipal}
                onChange={(e) => setNewPrincipal(e.target.value)}
                className="w-full px-3 py-2 bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] rounded-lg text-sm text-slate-900 dark:text-[#F8FAFC] focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isProvisioning}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold text-sm rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Building2 className="w-4 h-4" />
              <span>{isProvisioning ? 'Provisioning Tenant...' : 'Provision Pilot School'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Cloud & Supabase Diagnostics Card */}
      <div className="bg-white dark:bg-[#121826] rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs p-6">
        <div className="flex items-center gap-2 text-slate-900 dark:text-[#F8FAFC] font-bold text-base mb-2">
          <Database className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>Cloud Infrastructure & Multi-Tenant Readiness</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-[#94A3B8] mb-4">
          Real-time Postgres synchronization, tenant isolation, and live mobile app broadcast channels.
        </p>

        <div className="p-4 rounded-xl bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-3.5 h-3.5 rounded-full ${
                isLiveSupabaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <div>
              <div className="text-sm font-bold text-slate-800 dark:text-[#F8FAFC]">
                {isLiveSupabaseConfigured
                  ? 'Connected to Live Cloud Postgres'
                  : 'Local Cache Fallback Mode'}
              </div>
              <div className="text-xs text-slate-500 dark:text-[#94A3B8]">
                {isLiveSupabaseConfigured
                  ? 'Tenant isolation, Realtime channels, and automated audit logs active.'
                  : 'Resilient local storage active when network connectivity is offline.'}
              </div>
            </div>
          </div>

          <div className="text-xs font-mono bg-white dark:bg-[#121826] px-3 py-1.5 rounded border border-[#E2E8F0] dark:border-[#232E44] text-slate-600 dark:text-slate-300">
            Edzy Multi-Tenant Core
          </div>
        </div>
      </div>
    </div>
  );
}
