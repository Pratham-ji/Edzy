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
  Stamp,
  Upload,
  Trash2,
  Plus,
  Receipt,
  AlertTriangle,
  BookOpen,
} from 'lucide-react';
import { useAdminStore } from '../store/useAdminStore';
import { isLiveSupabaseConfigured } from '../lib/supabase';
import { downloadCsvFile, formatReceiptNumber } from '../lib/feeMetrics';
import { processBrandImageUpload } from '../lib/imageUpload';
import { CampusConfig, FeeHeadConfig } from '../lib/campusConfig';
import { STANDARD_BOARDS, STANDARD_SUBJECTS, formatBoardLabel } from '../lib/classScope';
import { ReceiptStampSignoffBlock } from '../components/OfficialSchoolSeal';
import CustomizableSelect from '../components/CustomizableSelect';

interface SettingsPageProps {
  onOpenAccountsExport?: () => void;
}

export default function SettingsPage({ onOpenAccountsExport }: SettingsPageProps) {
  const {
    schoolProfile,
    updateSchoolProfile,
    campusConfig,
    updateCampusConfig,
    currentStaff,
    feeInstallments,
    themeMode,
    setThemeMode,
  } = useAdminStore();

  const isPrincipalAdmin = currentStaff?.department === 'ADM';

  const [formData, setFormData] = useState({
    ...schoolProfile,
    board: formatBoardLabel(schoolProfile.board),
  });
  const [brandDraft, setBrandDraft] = useState<CampusConfig>({
    ...campusConfig,
    feeHeads: campusConfig.feeHeads.map((h) => ({ ...h })),
  });
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSavingBranding, setIsSavingBranding] = useState(false);
  const [customSubjectDraft, setCustomSubjectDraft] = useState('');
  const [customClassDraft, setCustomClassDraft] = useState('');

  // Sync forms whenever active school profile or config updates
  useEffect(() => {
    setFormData({
      ...schoolProfile,
      board: formatBoardLabel(schoolProfile.board),
    });
  }, [schoolProfile]);

  useEffect(() => {
    setBrandDraft({
      ...campusConfig,
      feeHeads: campusConfig.feeHeads.map((h) => ({ ...h })),
    });
  }, [campusConfig]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddCampusSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customSubjectDraft.trim();
    if (!clean) return;
    const existing = campusConfig.customSubjects || [];
    if (
      STANDARD_SUBJECTS.some((s) => s.toLowerCase() === clean.toLowerCase()) ||
      existing.some((s) => s.toLowerCase() === clean.toLowerCase())
    ) {
      setCustomSubjectDraft('');
      return;
    }
    await updateCampusConfig({ customSubjects: [...existing, clean] });
    setCustomSubjectDraft('');
    setSaveToast(`Added "${clean}" to school subjects across Marks & Syllabus.`);
    setTimeout(() => setSaveToast(null), 2800);
  };

  const handleRemoveCampusSubject = async (subjectName: string) => {
    const next = (campusConfig.customSubjects || []).filter((s) => s !== subjectName);
    await updateCampusConfig({ customSubjects: next });
  };

  const handleAddCampusClass = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customClassDraft.trim();
    if (!clean) return;
    const existing = campusConfig.customClasses || [];
    if (existing.some((c) => c.toLowerCase() === clean.toLowerCase())) {
      setCustomClassDraft('');
      return;
    }
    await updateCampusConfig({ customClasses: [...existing, clean] });
    setCustomClassDraft('');
    setSaveToast(`Added "${clean}" to campus class pickers.`);
    setTimeout(() => setSaveToast(null), 2800);
  };

  const handleRemoveCampusClass = async (className: string) => {
    const next = (campusConfig.customClasses || []).filter((c) => c !== className);
    await updateCampusConfig({ customClasses: next });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSchoolProfile(formData);
    setSaveToast('School profile details saved! Receipts reflect updated details.');
    setTimeout(() => setSaveToast(null), 3200);
  };

  const handleAssetFileChange = async (
    field: 'logoDataUrl' | 'stampDataUrl' | 'signatureDataUrl',
    file?: File | null
  ) => {
    if (!file) return;
    setUploadError(null);
    try {
      const processed = await processBrandImageUpload(file);
      const nextPatch = { [field]: processed.dataUrl } as Partial<CampusConfig>;
      setBrandDraft((prev) => ({ ...prev, ...nextPatch }));
      await updateCampusConfig(nextPatch);
      setSaveToast('Official school image uploaded and synced to receipt template.');
      setTimeout(() => setSaveToast(null), 2800);
    } catch (err: any) {
      setUploadError(err?.message || 'Could not process selected image.');
    }
  };

  const handleClearAsset = async (field: 'logoDataUrl' | 'stampDataUrl' | 'signatureDataUrl') => {
    const nextPatch = { [field]: null } as Partial<CampusConfig>;
    setBrandDraft((prev) => ({ ...prev, ...nextPatch }));
    await updateCampusConfig(nextPatch);
  };

  const handleUpdateFeeHead = (idx: number, patch: Partial<FeeHeadConfig>) => {
    setBrandDraft((prev) => ({
      ...prev,
      feeHeads: prev.feeHeads.map((h, i) => (i === idx ? { ...h, ...patch } : h)),
    }));
  };

  const handleAddFeeHead = () => {
    setBrandDraft((prev) => ({
      ...prev,
      feeHeads: [
        ...prev.feeHeads,
        {
          id: `custom-head-${Date.now()}`,
          label: 'Transport / Special Fee',
          percentage: 0,
          eligible80C: false,
        },
      ],
    }));
  };

  const handleRemoveFeeHead = (idx: number) => {
    if (brandDraft.feeHeads.length <= 1) return;
    setBrandDraft((prev) => ({
      ...prev,
      feeHeads: prev.feeHeads.filter((_, i) => i !== idx),
    }));
  };

  const totalHeadPercentage = brandDraft.feeHeads.reduce(
    (sum, h) => sum + Number(h.percentage || 0),
    0
  );
  const isHeadTotalValid = Math.abs(totalHeadPercentage - 100) < 0.01;

  const handleSaveReceiptAndStampSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isHeadTotalValid) {
      setUploadError('Total fee head percentages must add up to exactly 100%.');
      return;
    }
    setUploadError(null);
    setIsSavingBranding(true);
    try {
      await updateCampusConfig({
        ...brandDraft,
        feeHeads: brandDraft.feeHeads.map((h) => ({
          ...h,
          label: h.label.trim() || 'Academic Fee',
          percentage: Math.max(0, Math.round(h.percentage)),
        })),
      });
      setSaveToast('Receipt & Stamp settings saved! All official receipts updated.');
      setTimeout(() => setSaveToast(null), 3200);
    } finally {
      setIsSavingBranding(false);
    }
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
        <div
          role="status"
          className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm font-semibold flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
          <span>{saveToast}</span>
        </div>
      )}

      {uploadError && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm font-semibold flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{uploadError}</span>
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
              Switch between Crisp Light (Default) and Midnight Dark mode.
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

            <CustomizableSelect
              id="settings-education-board"
              name="board"
              label={
                <span className="text-xs font-semibold normal-case tracking-normal text-slate-600 dark:text-slate-300">
                  Education Board
                </span>
              }
              value={formData.board}
              onChange={(nextBoard) => setFormData((prev) => ({ ...prev, board: nextBoard }))}
              options={[...STANDARD_BOARDS]}
              customOptionLabel="Other Board (Specify)..."
              customPlaceholder="e.g. Maharashtra State Board / Waldorf / NIOS"
              required
              selectClassName="w-full px-3 py-2 bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] rounded-lg text-sm text-slate-900 dark:text-[#F8FAFC] focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              inputClassName="w-full px-3 py-2 bg-white dark:bg-[#0D1322] border border-[#4F46E5] dark:border-[#6366F1] rounded-lg text-sm text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />

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

      {/* Principal-Only Official School Branding, Digital Stamp & Receipt Format Studio */}
      {isPrincipalAdmin && (
        <>
          <div className="bg-white dark:bg-[#121826] rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-[#232E44]">
              <div className="flex items-center gap-2 text-slate-900 dark:text-[#F8FAFC] font-bold text-base">
                <Stamp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                <span>Official School Branding, Digital Stamp &amp; Signatory</span>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#818CF8] border border-[#C7D2FE] dark:border-[#3730A3] self-start sm:self-auto">
                Principal Audit Studio
              </span>
            </div>

            {/* 3 Clean Upload Slots */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Slot 1: School Logo / Crest */}
              <div className="rounded-xl bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] p-4 flex flex-col justify-between gap-3">
                <div>
                  <h4 className="text-xs font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
                    School Logo / Crest
                  </h4>
                  <p className="text-[11px] text-[#475569] dark:text-[#94A3B8] mt-0.5">
                    Appears on printed fee receipts &amp; sidebar.
                  </p>
                </div>

                <div className="h-24 rounded-xl bg-white border border-dashed border-slate-300 flex items-center justify-center p-2 overflow-hidden">
                  {brandDraft.logoDataUrl ? (
                    <img
                      src={brandDraft.logoDataUrl}
                      alt="School logo preview"
                      className="max-h-20 object-contain"
                    />
                  ) : (
                    <span className="text-[11px] text-slate-400 font-medium text-center">
                      No custom logo uploaded
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <label className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#4F46E5] hover:bg-[#3730A3] text-white text-xs font-bold cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{brandDraft.logoDataUrl ? 'Replace' : 'Upload Logo'}</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="visually-hidden"
                      onChange={(e) => {
                        handleAssetFileChange('logoDataUrl', e.target.files?.[0]);
                        e.target.value = '';
                      }}
                    />
                  </label>
                  {brandDraft.logoDataUrl && (
                    <button
                      type="button"
                      onClick={() => handleClearAsset('logoDataUrl')}
                      aria-label="Remove school logo"
                      className="p-2 rounded-lg border border-rose-200 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>

              {/* Slot 2: Digital School Stamp / Seal */}
              <div className="rounded-xl bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] p-4 flex flex-col justify-between gap-3">
                <div>
                  <h4 className="text-xs font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
                    Official Digital School Stamp / Seal
                  </h4>
                  <p className="text-[11px] text-[#475569] dark:text-[#94A3B8] mt-0.5">
                    Auto-attached onto every fee receipt.
                  </p>
                </div>

                <div className="h-24 rounded-xl bg-white border border-dashed border-slate-300 flex items-center justify-center p-2 overflow-hidden">
                  {brandDraft.stampDataUrl ? (
                    <img
                      src={brandDraft.stampDataUrl}
                      alt="School digital stamp preview"
                      className={`max-h-20 object-contain -rotate-6 ${
                        brandDraft.stampBlendMode !== false ? 'mix-blend-multiply' : ''
                      }`}
                    />
                  ) : (
                    <span className="text-[11px] text-slate-500 font-medium text-center px-2">
                      Using crisp circular vector seal fallback
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <label className="flex items-center gap-2 font-semibold text-[#0F172A] dark:text-[#F8FAFC] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={brandDraft.stampBlendMode !== false}
                      onChange={(e) => {
                        const val = e.target.checked;
                        setBrandDraft((prev) => ({ ...prev, stampBlendMode: val }));
                        updateCampusConfig({ stampBlendMode: val });
                      }}
                      className="accent-[#4F46E5]"
                    />
                    <span>Auto-Blend White Paper Background</span>
                  </label>
                  <label className="flex items-center gap-2 font-semibold text-[#475569] dark:text-[#94A3B8] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={brandDraft.useAutoGeneratedSeal !== false}
                      onChange={(e) => {
                        const val = e.target.checked;
                        setBrandDraft((prev) => ({ ...prev, useAutoGeneratedSeal: val }));
                        updateCampusConfig({ useAutoGeneratedSeal: val });
                      }}
                      className="accent-[#4F46E5]"
                    />
                    <span>Fallback Auto-Generated Official Seal</span>
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <label className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#4F46E5] hover:bg-[#3730A3] text-white text-xs font-bold cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{brandDraft.stampDataUrl ? 'Replace' : 'Upload Stamp'}</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="visually-hidden"
                      onChange={(e) => {
                        handleAssetFileChange('stampDataUrl', e.target.files?.[0]);
                        e.target.value = '';
                      }}
                    />
                  </label>
                  {brandDraft.stampDataUrl && (
                    <button
                      type="button"
                      onClick={() => handleClearAsset('stampDataUrl')}
                      aria-label="Remove school stamp"
                      className="p-2 rounded-lg border border-rose-200 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>

              {/* Slot 3: Authorized Signatory Signature */}
              <div className="rounded-xl bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] p-4 flex flex-col justify-between gap-3">
                <div>
                  <h4 className="text-xs font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
                    Authorized Signatory Signature
                  </h4>
                  <p className="text-[11px] text-[#475569] dark:text-[#94A3B8] mt-0.5">
                    Optional ink/PNG signature above officer line.
                  </p>
                </div>

                <div className="h-24 rounded-xl bg-white border border-dashed border-slate-300 flex items-center justify-center p-2 overflow-hidden">
                  {brandDraft.signatureDataUrl ? (
                    <img
                      src={brandDraft.signatureDataUrl}
                      alt="Authorized signature preview"
                      className="max-h-16 object-contain mix-blend-multiply"
                    />
                  ) : (
                    <span className="text-sm font-serif italic text-slate-600">
                      {schoolProfile.accountantName}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <label className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#4F46E5] hover:bg-[#3730A3] text-white text-xs font-bold cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{brandDraft.signatureDataUrl ? 'Replace' : 'Upload Signature'}</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="visually-hidden"
                      onChange={(e) => {
                        handleAssetFileChange('signatureDataUrl', e.target.files?.[0]);
                        e.target.value = '';
                      }}
                    />
                  </label>
                  {brandDraft.signatureDataUrl && (
                    <button
                      type="button"
                      onClick={() => handleClearAsset('signatureDataUrl')}
                      aria-label="Remove signature image"
                      className="p-2 rounded-lg border border-rose-200 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Live Mini Receipt Stamp & Sign-Off Preview */}
            <div className="rounded-xl border border-[#CBD5E1] bg-white text-slate-900 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-3">
                  {brandDraft.logoDataUrl ? (
                    <img
                      src={brandDraft.logoDataUrl}
                      alt="Preview school logo"
                      className="w-10 h-10 object-contain rounded-lg border border-slate-200 p-0.5"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-[#4F46E5]">
                      <Building2 className="w-5 h-5" aria-hidden="true" />
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600">
                      Live Mini Receipt Stamp &amp; Sign-Off Preview
                    </p>
                    <p className="text-sm font-black uppercase text-slate-900">
                      {schoolProfile.name}
                    </p>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {brandDraft.receiptPrefix}4903
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-1">
                <p className="text-[10px] text-slate-500 max-w-xs leading-relaxed">
                  {brandDraft.receiptFooterNote}
                </p>
                <ReceiptStampSignoffBlock
                  schoolName={schoolProfile.name}
                  schoolCode={schoolProfile.code}
                  signatoryLabel={brandDraft.signatoryLabel || 'Authorized Signatory / Accounts Officer'}
                  signatoryName={schoolProfile.accountantName}
                  dateLabel="28 NOV 2026"
                  stampDataUrl={brandDraft.stampDataUrl}
                  signatureDataUrl={brandDraft.signatureDataUrl}
                  useAutoGeneratedSeal={brandDraft.useAutoGeneratedSeal}
                  stampBlendMode={brandDraft.stampBlendMode}
                />
              </div>
            </div>
          </div>

          {/* Receipt Format & Default Fee Heads (Principal Only) */}
          <form
            onSubmit={handleSaveReceiptAndStampSettings}
            className="bg-white dark:bg-[#121826] rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs p-6 space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-[#232E44]">
              <div className="flex items-center gap-2 text-slate-900 dark:text-[#F8FAFC] font-bold text-base">
                <Receipt className="w-5 h-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                <span>Receipt Format &amp; Default Fee Heads (Principal Only)</span>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${
                  isHeadTotalValid
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-[#059669] dark:text-[#34D399] border-emerald-200 dark:border-emerald-800'
                    : 'bg-amber-50 dark:bg-amber-950/50 text-[#D97706] dark:text-[#FBBF24] border-amber-200 dark:border-amber-800'
                }`}
              >
                Head Allocation Total: {totalHeadPercentage}%
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="receipt-prefix-input"
                  className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1"
                >
                  Receipt Series Prefix
                </label>
                <input
                  id="receipt-prefix-input"
                  type="text"
                  value={brandDraft.receiptPrefix || ''}
                  onChange={(e) =>
                    setBrandDraft((prev) => ({ ...prev, receiptPrefix: e.target.value }))
                  }
                  placeholder="e.g. SCH-01/2026-27/"
                  className="w-full px-3 py-2 bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] rounded-lg text-sm font-mono font-semibold"
                />
              </div>

              <div>
                <label
                  htmlFor="receipt-signatory-input"
                  className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1"
                >
                  Authorized Signatory Label
                </label>
                <input
                  id="receipt-signatory-input"
                  type="text"
                  value={brandDraft.signatoryLabel || ''}
                  onChange={(e) =>
                    setBrandDraft((prev) => ({ ...prev, signatoryLabel: e.target.value }))
                  }
                  placeholder="Authorized Signatory / Accounts Officer"
                  className="w-full px-3 py-2 bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] rounded-lg text-sm font-medium"
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="receipt-footer-input"
                  className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1"
                >
                  Statutory Receipt Footer Note
                </label>
                <input
                  id="receipt-footer-input"
                  type="text"
                  value={brandDraft.receiptFooterNote || ''}
                  onChange={(e) =>
                    setBrandDraft((prev) => ({ ...prev, receiptFooterNote: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] rounded-lg text-sm"
                />
              </div>
            </div>

            {/* Fee Head Breakup Editor */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-[#232E44]">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#0F172A] dark:text-[#F8FAFC]">
                    School Default Fee Head Breakup
                  </h4>
                  <p className="text-[11px] text-[#475569] dark:text-[#94A3B8]">
                    Automatically splits standard installments across statutory fee heads on receipts.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddFeeHead}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#818CF8] border border-[#C7D2FE] dark:border-[#3730A3] text-xs font-bold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Add Custom Fee Head</span>
                </button>
              </div>

              <div className="space-y-2">
                {brandDraft.feeHeads.map((head, idx) => (
                  <div
                    key={head.id}
                    className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2.5 p-3 rounded-xl bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44]"
                  >
                    <input
                      type="text"
                      aria-label={`Default fee head ${idx + 1} name`}
                      value={head.label}
                      onChange={(e) => handleUpdateFeeHead(idx, { label: e.target.value })}
                      className="sm:col-span-5 h-9 px-3 rounded-lg bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-semibold"
                    />

                    <div className="sm:col-span-2 relative">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        aria-label={`Default fee head ${idx + 1} percentage`}
                        value={head.percentage}
                        onChange={(e) =>
                          handleUpdateFeeHead(idx, {
                            percentage: Math.max(0, Math.min(100, Number(e.target.value))),
                          })
                        }
                        className="w-full h-9 pl-2.5 pr-6 rounded-lg bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-mono font-bold text-right"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                        %
                      </span>
                    </div>

                    <label className="sm:col-span-4 inline-flex items-center gap-2 text-xs font-semibold text-[#059669] dark:text-[#34D399] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(head.eligible80C)}
                        onChange={(e) =>
                          handleUpdateFeeHead(idx, { eligible80C: e.target.checked })
                        }
                        className="accent-[#059669]"
                      />
                      <span>Sec. 80C Tuition Eligible</span>
                    </label>

                    <div className="sm:col-span-1 flex justify-end">
                      <button
                        type="button"
                        disabled={brandDraft.feeHeads.length <= 1}
                        onClick={() => handleRemoveFeeHead(idx)}
                        aria-label={`Remove fee head ${head.label}`}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-30 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={!isHeadTotalValid || isSavingBranding}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#4F46E5] hover:bg-[#3730A3] disabled:opacity-50 text-white font-bold text-sm rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" aria-hidden="true" />
                <span>{isSavingBranding ? 'Saving...' : 'Save Receipt & Stamp Settings'}</span>
              </button>
            </div>
          </form>

          {/* Principal-Only Campus Subjects & Classes Registry */}
          <div className="bg-white dark:bg-[#121826] rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-[#232E44]">
              <div className="flex items-center gap-2 text-slate-900 dark:text-[#F8FAFC] font-bold text-base">
                <BookOpen className="w-5 h-5 text-[#4F46E5] dark:text-[#6366F1]" aria-hidden="true" />
                <span>Campus Subjects, Wings &amp; Custom Classes</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-[#94A3B8]">
                Instant dropdown sync across Syllabus, Marks, Staff &amp; Admissions
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Custom Subjects */}
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#94A3B8]">
                  School Custom Subjects ({(campusConfig.customSubjects || []).length})
                </div>
                <form onSubmit={handleAddCampusSubject} className="flex items-center gap-2">
                  <label htmlFor="custom-subject-input" className="visually-hidden">
                    Add custom school subject
                  </label>
                  <input
                    id="custom-subject-input"
                    type="text"
                    value={customSubjectDraft}
                    onChange={(e) => setCustomSubjectDraft(e.target.value)}
                    placeholder="e.g. Sanskrit, French, AI & Robotics"
                    className="flex-1 h-9 px-3 rounded-lg bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-medium text-slate-900 dark:text-[#F8FAFC]"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 h-9 px-3.5 rounded-lg bg-[#4F46E5] hover:bg-[#3730A3] text-white text-xs font-bold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Add Subject</span>
                  </button>
                </form>

                <div className="flex flex-wrap gap-1.5">
                  {(campusConfig.customSubjects || []).length === 0 ? (
                    <span className="text-xs text-slate-500 dark:text-[#94A3B8]">
                      All {STANDARD_SUBJECTS.length} standard subjects are active. Add electives above if needed.
                    </span>
                  ) : (
                    (campusConfig.customSubjects || []).map((sub) => (
                      <span
                        key={sub}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#EEF2FF] dark:bg-[#1B2440] text-[#3730A3] dark:text-indigo-200 border border-[#C7D2FE] dark:border-[#3730A3]"
                      >
                        <span>{sub}</span>
                        <button
                          type="button"
                          onClick={() => void handleRemoveCampusSubject(sub)}
                          aria-label={`Remove custom subject ${sub}`}
                          className="text-indigo-500 hover:text-rose-600 font-bold cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Custom Classes / Sections */}
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#94A3B8]">
                  Additional Campus Classes / Sections ({(campusConfig.customClasses || []).length})
                </div>
                <form onSubmit={handleAddCampusClass} className="flex items-center gap-2">
                  <label htmlFor="custom-class-input" className="visually-hidden">
                    Add custom class or wing
                  </label>
                  <input
                    id="custom-class-input"
                    type="text"
                    value={customClassDraft}
                    onChange={(e) => setCustomClassDraft(e.target.value)}
                    placeholder="e.g. Playgroup-B, LKG-A, Class 11-Commerce"
                    className="flex-1 h-9 px-3 rounded-lg bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-medium text-slate-900 dark:text-[#F8FAFC]"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 h-9 px-3.5 rounded-lg bg-[#059669] hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Add Class</span>
                  </button>
                </form>

                <div className="flex flex-wrap gap-1.5">
                  {(campusConfig.customClasses || []).length === 0 ? (
                    <span className="text-xs text-slate-500 dark:text-[#94A3B8]">
                      Playgroup–UKG and Class 1–12 are built-in. Add custom streams or extra sections here.
                    </span>
                  ) : (
                    (campusConfig.customClasses || []).map((cls) => (
                      <span
                        key={cls}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#ECFDF5] dark:bg-[rgba(16,185,129,0.14)] text-[#059669] dark:text-[#34D399] border border-emerald-200 dark:border-emerald-800/60"
                      >
                        <span>{cls}</span>
                        <button
                          type="button"
                          onClick={() => void handleRemoveCampusClass(cls)}
                          aria-label={`Remove custom class ${cls}`}
                          className="text-emerald-600 hover:text-rose-600 font-bold cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

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
