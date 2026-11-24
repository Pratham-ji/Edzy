import React, { useState, useEffect } from 'react';
import {
  X,
  FileUp,
  BookOpen,
  Boxes,
  Sparkles,
  CheckCircle2,
  FileText,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useAdminStore, ARModelType, SyllabusChapterRecord } from '../store/useAdminStore';

interface UploadSyllabusModalProps {
  onClose: () => void;
  onSuccess?: (record: SyllabusChapterRecord) => void;
}

const AR_MODELS: ARModelType[] = [
  'Human Heart 3D',
  'Optics Bench 3D',
  'Quadratic Graph 3D',
  'Animal Cell 3D',
  'None',
];

const CLASSES = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
const SUBJECTS = [
  'Science',
  'Physics (Science)',
  'Chemistry (Science)',
  'Biology (Science)',
  'Mathematics',
  'Social Science',
  'English Communicative',
];

export const UploadSyllabusModal: React.FC<UploadSyllabusModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const { uploadSyllabusChapter } = useAdminStore();

  const [fileName, setFileName] = useState('Class10_Bio_Ch7_ControlCoordination.pdf');
  const [chapterNumber, setChapterNumber] = useState(7);
  const [title, setTitle] = useState('Control & Coordination: Nervous System & Hormones');
  const [classGrade, setClassGrade] = useState('Class 10');
  const [subject, setSubject] = useState('Biology (Science)');
  const [arModelMapped, setArModelMapped] = useState<ARModelType>('Human Heart 3D');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedResult, setPublishedResult] = useState<SyllabusChapterRecord | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublishing(true);

    setTimeout(() => {
      const record = uploadSyllabusChapter({
        fileName,
        chapterNumber,
        title,
        classGrade,
        subject,
        arModelMapped,
      });
      setIsPublishing(false);
      setPublishedResult(record);
    }, 600);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">
                Class Syllabus & 3D AR Publisher
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                Upload teacher notes / NCERT textbook PDF to auto-synthesize student AI study roadmap
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

        {/* Form or Result View */}
        {!publishedResult ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* File drag drop area */}
            <div className="border-2 border-dashed border-slate-300 hover:border-cyan-400 rounded-xl p-5 text-center bg-slate-50/60 transition">
              <FileUp className="w-8 h-8 text-cyan-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-800">
                Uploaded PDF Document:{' '}
                <span className="font-mono text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                  {fileName}
                </span>
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Class notes will be automatically parsed into milestone roadmaps and attached to AI doubt tutoring.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Grade / Class *
                </label>
                <select
                  value={classGrade}
                  onChange={(e) => setClassGrade(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {CLASSES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Subject *
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-1">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chapter # *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={30}
                  value={chapterNumber}
                  onChange={(e) => setChapterNumber(parseInt(e.target.value, 10))}
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="col-span-3">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chapter Title (as per NCERT Syllabus) *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* 3D AR Model Mapping */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-xl p-4 border border-indigo-900/60 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                    Link 3D Spatial AR Companion Module
                  </span>
                </div>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-400/30 font-semibold">
                  16:9 Sync Engine
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mb-3">
                When mapped, students can launch real-time 3D anatomical / physical mesh models directly from their syllabus roadmap and Socratic AI hints.
              </p>
              <select
                value={arModelMapped}
                onChange={(e) => setArModelMapped(e.target.value as ARModelType)}
                className="w-full h-9 px-3 rounded-lg bg-slate-800 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                {AR_MODELS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPublishing}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-600/20 transition disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-indigo-200" />
                <span>{isPublishing ? 'Synthesizing AI Roadmap...' : 'Publish to Class Roadmap'}</span>
              </button>
            </div>
          </form>
        ) : (
          /* Success Roadmap Preview */
          <div className="p-6 space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <h3 className="text-xs font-bold text-emerald-900">
                  Chapter Published & Indexed in Edzy RAG Vault!
                </h3>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Grounded across {publishedResult.classGrade} {publishedResult.subject}. 5-node AI study sequence generated.
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Auto-Synthesized 5-Node Study Roadmap Preview:
                </span>
                <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded">
                  Live on Student App
                </span>
              </div>

              <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50">
                {publishedResult.generatedMilestones.map((m, idx) => (
                  <div
                    key={m.nodeId}
                    className="bg-white border border-slate-200 rounded-lg p-2.5 flex items-center justify-between shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{m.title}</p>
                        <p className="text-[10px] text-slate-500">{m.ncertPageRange}</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      {m.ragStatus}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                onClick={() => {
                  onSuccess?.(publishedResult);
                  onClose();
                }}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition shadow-xs"
              >
                Done & Return to Vault
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadSyllabusModal;
