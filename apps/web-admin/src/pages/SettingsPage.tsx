import React, { useState } from 'react';
import {
  Building2,
  Save,
  Download,
  ShieldCheck,
  Database,
  FileSpreadsheet,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  User,
  GraduationCap,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react';
import { useAdminStore } from '../store/useAdminStore';
import { isLiveSupabaseConfigured } from '../lib/supabase';

export default function SettingsPage() {
  const {
    schoolProfile,
    updateSchoolProfile,
    feeInstallments,
    students,
    themeMode,
    setThemeMode,
  } = useAdminStore();
  const [formData, setFormData] = useState({ ...schoolProfile });
  const [saveToast, setSaveToast] = useState(false);

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
      'Installment_ID',
      'Student_ID',
      'Student_Name',
      'Class_Grade',
      'Quarter',
      'Amount_INR',
      'Status',
      'Payment_Method',
      'Payment_Ref',
      'Receipt_Number',
      'Paid_Date',
      'Due_Date',
      'Clerk_Notes',
    ];

    const rows = feeInstallments.map((f) => [
      f.id,
      f.studentId,
      `"${f.studentName}"`,
      f.classGrade,
      `"${f.quarter}"`,
      f.amount,
      f.status,
      f.paymentMethod || 'NONE',
      f.paymentRef || 'N/A',
      f.receiptNumber || 'N/A',
      f.paidDate || 'N/A',
      f.dueDate,
      `"${f.clerkNote || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `Edzy_Fee_Ledger_${schoolProfile.code}_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Campus ERP Configuration & Profile</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              CBSE Affiliated
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage official school identity for printed receipts, Tally exports, and appearance themes.
          </p>
        </div>

        <button
          onClick={handleExportFeeLedgerCsv}
          className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export Tally / Fee Ledger CSV</span>
        </button>
      </div>

      {saveToast && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>School profile details saved successfully! All receipts will use updated data.</span>
        </div>
      )}

      {/* Appearance & Theme Selector Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Sun className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Appearance & Theme</h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">Global Preference</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">ERP Color Theme</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Switch between Crisp Light (Default) and Linear Dark mode.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setThemeMode('light')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                themeMode === 'light'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
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
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
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
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-base">
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
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                CBSE Affiliation / Registration Number
              </label>
              <input
                type="text"
                name="affiliationNumber"
                value={formData.affiliationNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
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
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
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
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          {/* Key Authorized Officers */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
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
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
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
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

      {/* Cloud & Supabase Diagnostics Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-6">
        <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-base mb-2">
          <Database className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>Cloud Infrastructure & Pitch Mode</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Status of Postgres connection and real-time synchronization with Supabase and Edge RAG workers.
        </p>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-3.5 h-3.5 rounded-full ${
                isLiveSupabaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {isLiveSupabaseConfigured
                  ? 'Connected to Live Supabase Postgres'
                  : 'Offline-Resilient Demo Mode Active'}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {isLiveSupabaseConfigured
                  ? 'Cloud RLS policies and foreign keys enforced.'
                  : 'Zero external latency. Perfect for school principal boardroom pitches without relying on school Wi-Fi.'}
              </div>
            </div>
          </div>

          <div className="text-xs font-mono bg-white dark:bg-slate-900 px-3 py-1.5 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
            Postgres Schema: v20261117000000
          </div>
        </div>
      </div>
    </div>
  );
}
