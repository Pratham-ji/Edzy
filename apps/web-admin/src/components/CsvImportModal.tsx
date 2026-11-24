import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  Sparkles,
  CheckCircle2,
  Download,
  AlertCircle,
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
  const { importStudentsFromCSV } = useAdminStore();

  const [previewRows, setPreviewRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

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
            classGrade: cols[1],
            rollNo: cols[2],
            parentName: cols[3],
            parentPhone: cols[4],
            annualFee: cols[5] ? parseInt(cols[5], 10) : undefined,
          });
        }
      }

      setPreviewRows(parsed);
    };

    reader.readAsText(file);
  };

  const handleLoadDemoBatch = () => {
    setFileName('Demo_DVPS_5_Students_Batch.csv');
    setPreviewRows(DEMO_PITCH_BATCH);
  };

  const handleDownloadSampleTemplate = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Name,ClassGrade,RollNo,ParentName,ParentPhone,AnnualFee\n' +
      'Aarav Sharma,Class 10-A,24,Rajesh Sharma,9811234567,48000\n' +
      'Ananya Gupta,Class 10-A,01,Amit Gupta,9811234501,48000\n' +
      'Ishaan Agarwal,Class 9-B,04,Sanjay Agarwal,9811234509,44000\n';
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

    setTimeout(() => {
      const { importedCount } = importStudentsFromCSV(previewRows);
      setIsProcessing(false);
      onSuccess?.(importedCount);
    }, 450);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">1-Click Excel / CSV Bulk Student Importer</h2>
              <p className="text-[11px] text-slate-400 font-medium">
                Auto-generates student IDs, 4 quarterly fee installments & parent login PINs
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-1 rounded-md cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Pitch Banner & Fast Load */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gradient-to-r from-indigo-50 via-slate-50 to-indigo-50/50 border border-indigo-100 rounded-xl">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Live School Pitch Mode
                </h3>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Don't have a CSV handy? Click the button to test instant onboarding.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleDownloadSampleTemplate}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Template CSV</span>
              </button>
              <button
                type="button"
                onClick={handleLoadDemoBatch}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Load 5-Student Batch</span>
              </button>
            </div>
          </div>

          {/* Upload Dropzone */}
          <div className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-2xl p-6 text-center transition bg-slate-50/50">
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-800">
              Drag & Drop your School Excel/CSV File here, or{' '}
              <label className="text-indigo-600 hover:text-indigo-700 cursor-pointer underline">
                Browse Files
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Supports standard column headers: Name, ClassGrade, RollNo, ParentName, ParentPhone, AnnualFee
            </p>
            {fileName && (
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Selected: {fileName} ({previewRows.length} rows loaded)</span>
              </div>
            )}
          </div>

          {/* Live Preview Table */}
          {previewRows.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Parsed Records Preview ({previewRows.length} Students)
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ready to Import
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider sticky top-0">
                    <tr>
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">Class</th>
                      <th className="px-3 py-2">Roll No</th>
                      <th className="px-3 py-2">Parent Name</th>
                      <th className="px-3 py-2">Parent Mobile</th>
                      <th className="px-3 py-2 text-right">Fee (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {previewRows.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-3 py-2 font-semibold text-slate-900">{r.name}</td>
                        <td className="px-3 py-2">{r.classGrade}</td>
                        <td className="px-3 py-2 font-mono">{r.rollNo}</td>
                        <td className="px-3 py-2">{r.parentName}</td>
                        <td className="px-3 py-2 font-mono text-slate-500">{r.parentPhone}</td>
                        <td className="px-3 py-2 text-right font-medium text-slate-900">
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
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <p className="text-[11px] text-slate-500">
              Auto-allocates roll numbers, student portals, and parent OTP passcodes.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={previewRows.length === 0 || isProcessing}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-600/20 transition disabled:opacity-50"
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
