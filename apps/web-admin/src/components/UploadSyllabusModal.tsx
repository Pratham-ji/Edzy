import React, { useState, useEffect } from 'react';
import {
  X,
  FileUp,
  BookOpen,
  Boxes,
  Sparkles,
  CheckCircle2,
  FileText,
  GitBranch,
  ClipboardCheck,
  Wand2,
} from 'lucide-react';
import { useAdminStore, ARModelType, SyllabusChapterRecord } from '../store/useAdminStore';
import { EDZY_DEFAULT_3D_MODELS } from '../lib/default3dModels';
import {
  GeneratedStudyPack,
  cleanBoardCode,
  generateStudyPackFromSyllabus,
} from '../lib/syllabusGenerator';

interface UploadSyllabusModalProps {
  onClose: () => void;
  onSuccess?: (record: SyllabusChapterRecord) => void;
  onOpenStudio?: (record: SyllabusChapterRecord) => void;
}

const CLASSES = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
const BOARDS = ['CBSE', 'ICSE', 'ISC', 'STATE_BOARD'];
const SUBJECTS = [
  'Science',
  'Physics (Science)',
  'Chemistry (Science)',
  'Biology (Science)',
  'Mathematics',
  'Social Science',
  'English',
];

const SAMPLE_ICSE_SYLLABUS = `1. The Circulatory System (ICSE Class 10): Blood & Tissue Fluid, RBC/WBC/Platelets
2. Human Heart Anatomy: Four Chambers, Tricuspid & Bicuspid Valves, Double Circulation
3. Blood Vessels & Pulse: Arteries, Veins, Capillaries, Hepatic Portal System
4. Lymphatic System & Immunity: Spleen, Tissue Fluid, Board Diagram Labelling`;

export const UploadSyllabusModal: React.FC<UploadSyllabusModalProps> = ({
  onClose,
  onSuccess,
  onOpenStudio,
}) => {
  const { uploadSyllabusChapter, schoolProfile } = useAdminStore();

  const [fileName, setFileName] = useState('School_Chapter_Syllabus.txt');
  const [chapterNumber, setChapterNumber] = useState(7);
  const [title, setTitle] = useState('Human Circulatory System & Cardiac Rhythm');
  const [classGrade, setClassGrade] = useState('Class 10');
  const [subject, setSubject] = useState('Biology (Science)');
  const [board, setBoard] = useState(cleanBoardCode(schoolProfile.board));
  const [selected3dModel, setSelected3dModel] = useState<string>('AUTO_MATCH');
  const [rawText, setRawText] = useState(SAMPLE_ICSE_SYLLABUS);

  const [isScanning, setIsScanning] = useState(false);
  const [generatedPack, setGeneratedPack] = useState<GeneratedStudyPack | null>(null);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    if (file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = String(ev.target?.result || '');
        if (text.trim()) {
          setRawText(text);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleScanAndGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsScanning(true);
    try {
      const pack = await generateStudyPackFromSyllabus({
        rawText,
        classGrade,
        subject,
        board,
        chapterNumber,
        title,
        selected3dModel,
      });
      setGeneratedPack(pack);
    } finally {
      setIsScanning(false);
    }
  };

  const handlePublish = (openStudioAfter = false) => {
    if (!generatedPack) return;
    const record = uploadSyllabusChapter({
      fileName,
      chapterNumber,
      title,
      classGrade,
      subject,
      arModelMapped: (generatedPack.arModelName as ARModelType) || 'None',
      board: generatedPack.board,
      default3dModelId: generatedPack.default3dModelId,
      rawSyllabusText: rawText,
      generatedMilestones: generatedPack.generatedMilestones,
      revisionNotes: generatedPack.revisionNotes,
      practiceSheet: generatedPack.practiceSheet,
    });

    if (openStudioAfter && onOpenStudio) {
      onClose();
      onOpenStudio(record);
      return;
    }

    setPublishedResult(record);
    onSuccess?.(record);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#121826] rounded-2xl shadow-2xl max-w-3xl w-full border border-[#E2E8F0] dark:border-[#232E44] overflow-hidden my-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-white dark:bg-[#0D1320] border-b border-[#E2E8F0] dark:border-[#232E44] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EEF2FF] dark:bg-[#1B2440] border border-[#C7D2FE] dark:border-[#3730A3] flex items-center justify-center">
              <Wand2 className="w-4 h-4 text-[#4F46E5] dark:text-[#6366F1]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                AI Syllabus Scanner & Study Pack Publisher
              </h2>
              <p className="text-[11px] text-[#475569] dark:text-[#94A3B8]">
                Paste raw {board} school syllabus text to auto-build flowchart roadmaps, notes, practice sheets & 3D labs
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] p-1.5 rounded-lg hover:bg-[#EEF2F7] dark:hover:bg-[#1A2336] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Scan Input Form */}
        {!generatedPack && !publishedResult && (
          <form onSubmit={handleScanAndGenerate} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                  Education Board *
                </label>
                <select
                  value={board}
                  onChange={(e) => setBoard(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]"
                >
                  {BOARDS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                  Class / Grade *
                </label>
                <select
                  value={classGrade}
                  onChange={(e) => setClassGrade(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]"
                >
                  {CLASSES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                  Subject *
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]"
                >
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div className="col-span-1">
                <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                  Chapter # *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={40}
                  value={chapterNumber}
                  onChange={(e) => setChapterNumber(parseInt(e.target.value, 10) || 1)}
                  className="w-full h-9 px-3 rounded-lg bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]"
                />
              </div>

              <div className="col-span-3">
                <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                  Chapter Title ({board} Syllabus) *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]"
                />
              </div>
            </div>

            {/* Raw Text Syllabus Scanner Area */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  Paste School Text Syllabus / Topic Outline *
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setBoard('ICSE');
                      setSubject('Biology (Science)');
                      setTitle('The Circulatory System');
                      setChapterNumber(8);
                      setRawText(SAMPLE_ICSE_SYLLABUS);
                    }}
                    className="text-[11px] font-semibold text-[#4F46E5] dark:text-[#6366F1] hover:underline cursor-pointer"
                  >
                    Load ICSE Sample
                  </button>
                  <label className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EEF2F7] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] text-[11px] font-semibold text-[#475569] dark:text-[#94A3B8] cursor-pointer hover:opacity-80">
                    <FileUp className="w-3 h-3" />
                    <span>Import .txt / .pdf</span>
                    <input
                      type="file"
                      accept=".txt,.md,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <textarea
                rows={5}
                required
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste chapter topics, numbered points, or teacher syllabus outline..."
                className="w-full p-3 rounded-xl bg-[#F6F8FC] dark:bg-[#090D16] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-mono text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
              <p className="text-[11px] text-[#475569] dark:text-[#94A3B8]">
                File label: <span className="font-mono">{fileName}</span> • Topics are strictly parsed into flowchart spine nodes & sub-branches.
              </p>
            </div>

            {/* Edzy Global Default 3D Model Selector */}
            <div className="p-4 rounded-xl bg-[#EEF2FF] dark:bg-[#1B2440] border border-[#C7D2FE] dark:border-[#3730A3] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-[#4F46E5] dark:text-[#6366F1]" />
                  <span className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                    Link Edzy 3D Spatial Lab Companion
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white dark:bg-[#121826] text-[#4F46E5] dark:text-[#6366F1] border border-[#C7D2FE] dark:border-[#3730A3]">
                  Edzy 3D Catalog
                </span>
              </div>
              <select
                value={selected3dModel}
                onChange={(e) => setSelected3dModel(e.target.value)}
                className="w-full h-9 px-3 rounded-lg bg-white dark:bg-[#121826] border border-[#C7D2FE] dark:border-[#3730A3] text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]"
              >
                <option value="AUTO_MATCH">Auto-Match Best 3D Model from Syllabus</option>
                {EDZY_DEFAULT_3D_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0] dark:border-[#232E44]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-[#E2E8F0] dark:border-[#232E44] rounded-xl text-xs font-semibold text-[#475569] dark:text-[#94A3B8] hover:bg-[#EEF2F7] dark:hover:bg-[#1A2336] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isScanning}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#4F46E5] hover:bg-[#3730A3] text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isScanning ? 'Scanning Syllabus...' : 'Scan Syllabus & Generate Study Pack'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Generated Pack Review Before Publish */}
        {generatedPack && !publishedResult && (
          <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="p-4 rounded-xl bg-[#ECFDF5] dark:bg-[rgba(16,185,129,0.14)] border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#059669] dark:text-[#34D399] shrink-0" />
                <div>
                  <h3 className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                    Study Pack Synthesized ({generatedPack.board} • {classGrade})
                  </h3>
                  <p className="text-[11px] text-[#475569] dark:text-[#94A3B8]">
                    Source: {generatedPack.generationSource === 'GEMINI_AI' ? 'Gemini 2.5 Flash AI' : 'Edzy Deterministic Syllabus Parser'} • 3D Model: {generatedPack.arModelName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setGeneratedPack(null)}
                className="text-xs font-bold text-[#4F46E5] dark:text-[#6366F1] hover:underline cursor-pointer"
              >
                ← Edit Text
              </button>
            </div>

            {/* Summary Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44]">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#4F46E5] dark:text-[#6366F1]">
                  <GitBranch className="w-3.5 h-3.5" />
                  Flowchart Graph
                </div>
                <p className="text-sm font-extrabold text-[#0F172A] dark:text-[#F8FAFC] mt-1">
                  {generatedPack.generatedMilestones.length} Milestones •{' '}
                  {generatedPack.generatedMilestones.reduce((s, m) => s + m.branches.length, 0)} Topics
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44]">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#059669] dark:text-[#34D399]">
                  <BookOpen className="w-3.5 h-3.5" />
                  Revision Notes
                </div>
                <p className="text-sm font-extrabold text-[#0F172A] dark:text-[#F8FAFC] mt-1">
                  {generatedPack.revisionNotes.length} Structured Guides
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44]">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#D97706] dark:text-[#FBBF24]">
                  <ClipboardCheck className="w-3.5 h-3.5" />
                  {generatedPack.board} Practice
                </div>
                <p className="text-sm font-extrabold text-[#0F172A] dark:text-[#F8FAFC] mt-1">
                  {generatedPack.practiceSheet.mcqs.length} MCQ • {generatedPack.practiceSheet.shortQuestions.length} Short • {generatedPack.practiceSheet.longQuestions.length} Long
                </p>
              </div>
            </div>

            {/* Generated Milestones & Branches Preview */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {generatedPack.generatedMilestones.map((ms, i) => (
                <div
                  key={ms.nodeId}
                  className="p-3 rounded-xl bg-[#F6F8FC] dark:bg-[#090D16] border border-[#E2E8F0] dark:border-[#232E44]"
                >
                  <div className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                    {i + 1}. {ms.title}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {ms.branches.map((br) => (
                      <span
                        key={br.id}
                        className="px-2 py-0.5 rounded-md bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#818CF8] border border-[#C7D2FE] dark:border-[#3730A3] text-[11px] font-semibold"
                      >
                        {br.title} ({br.side})
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-[#E2E8F0] dark:border-[#232E44]">
              {onOpenStudio && (
                <button
                  type="button"
                  onClick={() => handlePublish(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#6366F1] border border-[#C7D2FE] dark:border-[#3730A3] text-xs font-bold hover:opacity-90 cursor-pointer"
                >
                  <GitBranch className="w-3.5 h-3.5" />
                  <span>Open Visual Studio Editor</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => handlePublish(false)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#3730A3] text-white text-xs font-bold shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Publish Live to Class</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation View */}
        {publishedResult && (
          <div className="p-6 space-y-4">
            <div className="bg-[#ECFDF5] dark:bg-[rgba(16,185,129,0.14)] border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-[#059669] dark:text-[#34D399] shrink-0" />
              <div>
                <h3 className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  Published & Synced Live to Student Mobile App!
                </h3>
                <p className="text-[11px] text-[#475569] dark:text-[#94A3B8] mt-0.5">
                  Ch {publishedResult.chapterNumber}: {publishedResult.title} ({publishedResult.board}) is now active across student devices.
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-[#4F46E5] hover:bg-[#3730A3] text-white rounded-xl text-xs font-bold cursor-pointer"
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
