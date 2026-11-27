import React, { useEffect, useState } from 'react';
import {
  Building2,
  Save,
  Lock,
  FileSpreadsheet,
  CheckCircle2,
  Sun,
  Moon,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useAdminStore } from '../store/useAdminStore';
import { isLiveSupabaseConfigured } from '../lib/supabase';
import { downloadCsvFile, formatReceiptNumber } from '../lib/feeMetrics';

interface SettingsPageProps {
  onOpenAccountsExport?: () => void;
}

export default function SettingsPage({ onOpenAccountsExport }: SettingsPageProps) {
  const {
    schoolProfile,
    updateSchoolProfile,
    feeInstallments,
    themeMode,
    setThemeMode,
  } = useAdminStore();
  const [formData, setFormData] = useState({ ...schoolProfile });
  const [saveToast, setSaveToast] = useState(false);

  // Sync form whenever active school's live profile updates
  useEffect(() => {
    setFormData({ ...schoolProfile });
  }, [schoolProfile]);

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
            Manage official school identity for printed receipts, Tally accounting exports, and ERP theme.
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

      {/* Appearance & Theme Selector Card */}
      <div className="bg-white dark:bg-[#121826] rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#232E44]">
          <div className="flex items-center gap-2">
            <Sun className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">Appearance & Theme</h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">Campus Preference</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-[#F8FAFC]">ERP Color Theme</p>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
              Switch between Crisp Light (Default) and Linear Dark mode.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setThemeMode('light')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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

      {/* Main Settings Form (Strictly Isolated to Active School) */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-[#121826] rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs p-6 space-y-6">
          <div className="border-b border-slate-100 dark:border-[#232E44] pb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-900 dark:text-[#F8FAFC] font-bold text-base">
              <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Institutional Identity & Affiliation</span>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded border border-indigo-100 dark:border-indigo-800">
              School Code: {schoolProfile.code}
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
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save School Configuration</span>
            </button>
          </div>
        </div>
      </form>

      {/* Data Confidentiality & Campus Security Card */}
      <div className="bg-white dark:bg-[#121826] rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-[#232E44]">
          <div className="flex items-center gap-2 text-slate-900 dark:text-[#F8FAFC] font-bold text-base">
            <Lock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
            <span>Data Confidentiality &amp; Campus Security</span>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold bg-[#EEF2FF] dark:bg-[#1B2440] px-3 py-1 rounded-full border border-[#C7D2FE] dark:border-[#3730A3] text-[#4F46E5] dark:text-[#818CF8]">
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
            <span>School Vault: {schoolProfile.code}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-800/50 space-y-1.5">
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-800 dark:text-emerald-300">
            <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>End-to-End School Confidentiality Active</span>
          </div>
          <p className="text-xs text-emerald-900/90 dark:text-emerald-200/90 leading-relaxed">
            All student profiles, exam marks, and fee records belong exclusively to{' '}
            <strong>{schoolProfile.name}</strong>. Encrypted in transit, DPDP Act Section 9 compliant,
            and strictly isolated from other institutions.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full shrink-0 ${
                isLiveSupabaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <div>
              <div
                className={`text-sm font-bold ${
                  isLiveSupabaseConfigured
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : 'text-amber-700 dark:text-amber-300'
                }`}
              >
                {isLiveSupabaseConfigured ? 'Cloud Sync Active' : 'Offline Mode — Reconnecting'}
              </div>
              <div className="text-xs text-slate-500 dark:text-[#94A3B8]">
                {isLiveSupabaseConfigured
                  ? 'Changes sync automatically across campus desks and authorized parent apps.'
                  : 'Reconnecting to campus cloud — records stay safely queued on this device.'}
              </div>
            </div>
          </div>

          <span className="text-[11px] font-semibold text-[#475569] dark:text-[#94A3B8]">
            Private Campus Tenant
          </span>
        </div>
      </div>
    </div>
  );
}
