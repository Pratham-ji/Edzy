import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  Sparkles,
  CheckCircle2,
  Download,
  Lock,
  Users,
} from 'lucide-react';
import { useAdminStore } from '../store/useAdminStore';

interface CsvImportModalProps {
  onClose: () => void;
  onSuccess?: (count: number) => void;
}

interface ParsedRow {
  name: string;
  classGrade: string;
  rollNo: string;
  parentName: string;
  parentPhone: string;
  annualFee?: number;
}

const DEMO_PITCH_BATCH: ParsedRow[] = [
  {
    name: 'Kavya Singhania',
    classGrade: 'Class 10-A',
    rollNo: '41',
    parentName: 'Vikram Singhania',
    parentPhone: '9811234516',
    annualFee: 48000,
  },
  {
    name: 'Pranav Chawla',
    classGrade: 'Class 10-A',
    rollNo: '42',
    parentName: 'Manoj Chawla',
    parentPhone: '9811234517',
    annualFee: 48000,
  },
  {
    name: 'Ananya Roy',
    classGrade: 'Class 9-B',
    rollNo: '38',
    parentName: 'Arindam Roy',
    parentPhone: '9811234518',
    annualFee: 44000,
  },
  {
    name: 'Yashwardhan Rathore',
    classGrade: 'Class 9-B',
    rollNo: '39',
    parentName: 'Col. R. S. Rathore',
    parentPhone: '9811234519',
    annualFee: 44000,
  },
  {
    name: 'Navya Swaminathan',
    classGrade: 'Class 9-B',
    rollNo: '40',
    parentName: 'T. S. Swaminathan',
    parentPhone: '9811234520',
    annualFee: 44000,
  },
];

export const CsvImportModal: React.FC<CsvImportModalProps> = ({ onClose, onSuccess }) => {
  const { importStudentsFromCSV, currentStaff } = useAdminStore();

  const lockedClass =
    currentStaff?.department === 'TCH' && currentStaff.assignedClass
      ? currentStaff.assignedClass
      : null;

  const [previewRows, setPreviewRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const applyClassScope = (rows: ParsedRow[]): ParsedRow[] =>
    lockedClass ? rows.map((r) => ({ ...r, classGrade: lockedClass })) : rows;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
      if (lines.length <= 1) {
        alert('CSV file is empty or missing headers.');
        return;
      }

      // Expected header: Name,Class,RollNo,ParentName,ParentPhone,AnnualFee
      const parsed: ParsedRow[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
        if (cols.length >= 5) {
          parsed.push({
            name: cols[0],
            classGrade: lockedClass || cols[1],
            rollNo: cols[2],
            parentName: cols[3],
            parentPhone: cols[4],
            annualFee: cols[5] ? parseInt(cols[5], 10) : undefined,
          });
        }
      }

      setPreviewRows(applyClassScope(parsed));
    };

    reader.readAsText(file);
  };

  const handleLoadDemoBatch = () => {
    setFileName(
      lockedClass
        ? `Sample_${lockedClass.replace(/\s+/g, '_')}_Batch.csv`
        : 'Sample_Campus_5_Students_Batch.csv'
    );
    setPreviewRows(applyClassScope(DEMO_PITCH_BATCH));
  };

  const handleDownloadSampleTemplate = () => {
    const sampleClass = lockedClass || 'Class 10-A';
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Name,ClassGrade,RollNo,ParentName,ParentPhone,AnnualFee\n' +
      `Aarav Sharma,${sampleClass},24,Rajesh Sharma,9811234567,48000\n` +
      `Ananya Gupta,${sampleClass},01,Amit Gupta,9811234501,48000\n` +
      `Ishaan Agarwal,${lockedClass || 'Class 9-B'},04,Sanjay Agarwal,9811234509,44000\n`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Edzy_Sample_Student_Import_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmImport = () => {
    if (previewRows.length === 0) return;
    setIsProcessing(true);

    const scopedRows = applyClassScope(previewRows);
    setTimeout(() => {
      const { importedCount } = importStudentsFromCSV(scopedRows);
      setIsProcessing(false);
      onSuccess?.(importedCount);
      onClose();
    }, 350);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#121826] rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92dvh] flex flex-col border border-[#E2E8F0] dark:border-[#232E44] overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-white dark:bg-[#0D1320] border-b border-[#E2E8F0] dark:border-[#232E44] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] dark:bg-[#1B2440] border border-[#C7D2FE] dark:border-[#3730A3] flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4 text-[#4F46E5] dark:text-[#6366F1]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
                  1-Click Excel / CSV Bulk Student Importer
                </h2>
                {lockedClass && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#6366F1] border border-[#C7D2FE] dark:border-[#3730A3]">
                    <Lock className="w-2.5 h-2.5" />
                    {lockedClass} Only
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#475569] dark:text-[#94A3B8] font-medium">
                Auto-generates permanent student IDs, A → Z rolls, 4 fee quarters & parent login PINs
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white transition p-1 rounded-md cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Pitch Banner & Fast Load */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#EEF2FF]/70 dark:bg-[#1B2440]/50 border border-[#C7D2FE] dark:border-[#3730A3] rounded-xl">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#4F46E5] dark:text-[#6366F1]" />
                <h3 className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-wide">
                  Quick Sample Onboarding
                </h3>
              </div>
              <p className="text-xs text-[#475569] dark:text-[#94A3B8] mt-0.5">
                {lockedClass
                  ? `All imported students will be assigned directly to your scoped class (${lockedClass}).`
                  : "Don't have a CSV handy? Load a sample batch to test instant onboarding."}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleDownloadSampleTemplate}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] hover:bg-[#F6F8FC] text-[#0F172A] dark:text-[#F8FAFC] rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#475569]" />
                <span>Template CSV</span>
              </button>
              <button
                type="button"
                onClick={handleLoadDemoBatch}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#4F46E5] hover:bg-[#3730A3] text-white rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Load 5-Student Batch</span>
              </button>
            </div>
          </div>

          {/* Upload Dropzone */}
          <div className="border-2 border-dashed border-[#E2E8F0] dark:border-[#232E44] hover:border-[#4F46E5] rounded-2xl p-6 text-center transition bg-[#F6F8FC] dark:bg-[#090D16]/60">
            <Upload className="w-8 h-8 text-[#94A3B8] mx-auto mb-2" />
            <p className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              Drag & Drop your School Excel/CSV File here, or{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[#4F46E5] dark:text-[#6366F1] hover:underline font-extrabold cursor-pointer"
              >
                Browse Files
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                tabIndex={-1}
                aria-hidden="true"
                onChange={(e) => {
                  handleFileUpload(e);
                  e.target.value = '';
                }}
                className="hidden"
              />
            </p>
            <p className="text-[11px] text-[#475569] dark:text-[#94A3B8] mt-1">
              Supports standard column headers: Name, ClassGrade, RollNo, ParentName, ParentPhone, AnnualFee
            </p>
            {fileName && (
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-[#ECFDF5] dark:bg-[rgba(16,185,129,0.14)] text-[#059669] dark:text-[#34D399] border border-emerald-200 dark:border-emerald-800/40 rounded-full text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Selected: {fileName} ({previewRows.length} rows loaded)</span>
              </div>
            )}
          </div>

          {/* Live Preview Table */}
          {previewRows.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-wide">
                  Parsed Records Preview ({previewRows.length} Students)
                </span>
                <span className="text-[11px] text-[#059669] dark:text-[#34D399] font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ready to Import
                </span>
              </div>

              <div className="border border-[#E2E8F0] dark:border-[#232E44] rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#EEF2F7] dark:bg-[#1A2336] border-b border-[#E2E8F0] dark:border-[#232E44] text-[#475569] dark:text-[#94A3B8] font-bold uppercase text-[10px] tracking-wider sticky top-0">
                    <tr>
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">Class</th>
                      <th className="px-3 py-2">Parent Name</th>
                      <th className="px-3 py-2">Parent Mobile</th>
                      <th className="px-3 py-2 text-right">Fee (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#232E44] text-[#475569] dark:text-[#94A3B8]">
                    {previewRows.map((r, i) => (
                      <tr key={i} className="hover:bg-[#F6F8FC] dark:hover:bg-[#1A2336]/40">
                        <td className="px-3 py-2 font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{r.name}</td>
                        <td className="px-3 py-2 font-semibold text-[#4F46E5] dark:text-[#6366F1]">{r.classGrade}</td>
                        <td className="px-3 py-2">{r.parentName}</td>
                        <td className="px-3 py-2 font-mono">{r.parentPhone}</td>
                        <td className="px-3 py-2 text-right font-medium text-[#0F172A] dark:text-[#F8FAFC]">
                          ₹{(r.annualFee || 48000).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0] dark:border-[#232E44]">
            <p className="text-[11px] text-[#475569] dark:text-[#94A3B8]">
              Auto-allocates alphabetical roll numbers, student IDs, and parent fee PINs.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-[#E2E8F0] dark:border-[#232E44] rounded-lg text-xs font-semibold text-[#475569] dark:text-[#94A3B8] hover:bg-[#EEF2F7] dark:hover:bg-[#1A2336] transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={previewRows.length === 0 || isProcessing}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#4F46E5] hover:bg-[#3730A3] text-white rounded-lg text-xs font-bold shadow-sm transition disabled:opacity-50 cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span>
                  {isProcessing
                    ? 'Importing...'
                    : `Confirm & Import ${previewRows.length} Students`}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CsvImportModal;
