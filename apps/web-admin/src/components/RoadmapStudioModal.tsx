import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Boxes,
  FileText,
  BookOpen,
  ClipboardCheck,
  GitBranch,
  RotateCcw,
  Send,
  CheckCircle2,
  Lightbulb,
} from 'lucide-react';
import {
  useAdminStore,
  SyllabusChapterRecord,
  FlowchartSpineMilestone,
  RevisionNoteItem,
  PracticeSheetData,
  ARModelType,
} from '../store/useAdminStore';
import {
  BranchPriority,
  BranchSide,
  FlowchartBranchNode,
  cleanBoardCode,
  generateStudyPackFromSyllabus,
} from '../lib/syllabusGenerator';
import { EDZY_DEFAULT_3D_MODELS, normalize3dModelId } from '../lib/default3dModels';

interface RoadmapStudioModalProps {
  chapter: SyllabusChapterRecord;
  onClose: () => void;
}

type StudioTab = 'flowchart' | 'notes' | 'practice';

export const RoadmapStudioModal: React.FC<RoadmapStudioModalProps> = ({ chapter, onClose }) => {
  const { updateSyllabusChapter, schoolProfile, syllabusVault } = useAdminStore();

  const [title, setTitle] = useState(chapter.title);
  const [board, setBoard] = useState(cleanBoardCode(chapter.board || schoolProfile.board));
  const [arModelId, setArModelId] = useState(
    normalize3dModelId(chapter.default3dModelId || chapter.arModelMapped)
  );
  const [milestones, setMilestones] = useState<FlowchartSpineMilestone[]>(
    () => JSON.parse(JSON.stringify(chapter.generatedMilestones || []))
  );
  const [revisionNotes, setRevisionNotes] = useState<RevisionNoteItem[]>(
    () => JSON.parse(JSON.stringify(chapter.revisionNotes || []))
  );
  const [practiceSheet, setPracticeSheet] = useState<PracticeSheetData>(() =>
    JSON.parse(
      JSON.stringify(
        chapter.practiceSheet || {
          boardStyle: cleanBoardCode(chapter.board || schoolProfile.board),
          mcqs: [],
          shortQuestions: [],
          longQuestions: [],
        }
      )
    )
  );

  const [activeTab, setActiveTab] = useState<StudioTab>('flowchart');
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>(
    chapter.generatedMilestones?.[0]?.nodeId || ''
  );
  const [isResetting, setIsResetting] = useState(false);
  const [publishedToast, setPublishedToast] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const selectedModelSpec =
    EDZY_DEFAULT_3D_MODELS.find((m) => m.id === arModelId) ||
    EDZY_DEFAULT_3D_MODELS[EDZY_DEFAULT_3D_MODELS.length - 1];

  const relatedList =
    chapter.relatedChapters && chapter.relatedChapters.length > 0
      ? chapter.relatedChapters
      : syllabusVault
          .filter((c) => c.id !== chapter.id)
          .slice(0, 2)
          .map((c) => ({
            id: c.id,
            chapterNumber: c.chapterNumber,
            title: c.title,
            subject: c.subject,
          }));

  // ── Flowchart Mutation Helpers ──
  const moveMilestone = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= milestones.length) return;
    const copy = [...milestones];
    [copy[index], copy[target]] = [copy[target], copy[index]];
    setMilestones(copy);
  };

  const addMilestone = () => {
    const num = milestones.length + 1;
    const newId = `ms-${Date.now().toString(36)}`;
    const newMs: FlowchartSpineMilestone = {
      nodeId: newId,
      title: `${chapter.chapterNumber}.${num} New Core Topic`,
      pageRange: `Module ${num} • ${board}`,
      ncertPageRange: `Module ${num} • ${board}`,
      ragStatus: 'GROUNDED',
      durationMinutes: 30,
      examTip: `Highlight diagrams & definitions for ${board} exams.`,
      branches: [
        {
          id: `${newId}-b1`,
          title: 'Key Concept',
          side: 'left',
          groupBox: 'Concept Cluster',
          priority: 'MUST_KNOW',
          durationMinutes: 15,
        },
        {
          id: `${newId}-b2`,
          title: 'Practice Questions',
          side: 'right',
          groupBox: 'Application',
          priority: 'PRACTICE',
          durationMinutes: 15,
        },
      ],
    };
    setMilestones([...milestones, newMs]);
    setSelectedMilestoneId(newId);
  };

  const updateMilestoneField = (
    nodeId: string,
    field: keyof FlowchartSpineMilestone,
    val: string | number
  ) => {
    setMilestones((prev) =>
      prev.map((m) => (m.nodeId === nodeId ? { ...m, [field]: val } : m))
    );
  };

  const deleteMilestone = (nodeId: string) => {
    setMilestones((prev) => prev.filter((m) => m.nodeId !== nodeId));
    if (selectedMilestoneId === nodeId) {
      setSelectedMilestoneId(milestones[0]?.nodeId || '');
    }
  };

  const addBranch = (milestoneId: string, side: BranchSide) => {
    const newBranch: FlowchartBranchNode = {
      id: `br-${Date.now().toString(36)}`,
      title: 'New Sub-Topic',
      side,
      groupBox: side === 'left' ? 'Core Concepts' : 'Board Practice',
      priority: 'MUST_KNOW',
      durationMinutes: 15,
    };
    setMilestones((prev) =>
      prev.map((m) =>
        m.nodeId === milestoneId ? { ...m, branches: [...(m.branches || []), newBranch] } : m
      )
    );
  };

  const updateBranch = (
    milestoneId: string,
    branchId: string,
    patch: Partial<FlowchartBranchNode>
  ) => {
    setMilestones((prev) =>
      prev.map((m) =>
        m.nodeId === milestoneId
          ? {
              ...m,
              branches: m.branches.map((b) => (b.id === branchId ? { ...b, ...patch } : b)),
            }
          : m
      )
    );
  };

  const deleteBranch = (milestoneId: string, branchId: string) => {
    setMilestones((prev) =>
      prev.map((m) =>
        m.nodeId === milestoneId
          ? { ...m, branches: m.branches.filter((b) => b.id !== branchId) }
          : m
      )
    );
  };

  // ── Notes & Practice Mutations ──
  const addRevisionNote = () => {
    setRevisionNotes((prev) => [
      ...prev,
      {
        id: `rn-${Date.now().toString(36)}`,
        topicTitle: 'New Revision Summary',
        keyDefinitions: ['Key term definition'],
        summaryPoints: ['Essential formula or mechanism to remember'],
        examFormulaOrTip: `Keep neat formatting for ${board} grading.`,
      },
    ]);
  };

  const addMcqQuestion = () => {
    setPracticeSheet((prev) => ({
      ...prev,
      mcqs: [
        ...prev.mcqs,
        {
          id: `mcq-${Date.now().toString(36)}`,
          question: `New ${board} Question on ${title}`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctIndex: 0,
          explanation: 'Stepwise reason for correct answer.',
          difficulty: 'Medium',
        },
      ],
    }));
  };

  const handleResetToAiDefault = async () => {
    setIsResetting(true);
    const seedText =
      chapter.rawSyllabusText ||
      milestones.map((m) => `${m.title}: ${m.branches.map((b) => b.title).join(', ')}`).join('\n');

    const pack = await generateStudyPackFromSyllabus({
      rawText: seedText,
      classGrade: chapter.classGrade,
      subject: chapter.subject,
      board,
      chapterNumber: chapter.chapterNumber,
      title,
      selected3dModel: arModelId,
    });

    setMilestones(pack.generatedMilestones);
    setRevisionNotes(pack.revisionNotes);
    setPracticeSheet(pack.practiceSheet);
    if (pack.generatedMilestones[0]) {
      setSelectedMilestoneId(pack.generatedMilestones[0].nodeId);
    }
    setIsResetting(false);
  };

  const handlePublishLive = () => {
    updateSyllabusChapter(chapter.id, {
      title: title.trim() || chapter.title,
      board,
      default3dModelId: arModelId,
      arModelMapped: (selectedModelSpec.name as ARModelType) || 'None',
      generatedMilestones: milestones,
      revisionNotes,
      practiceSheet,
      relatedChapters: relatedList,
    });
    setPublishedToast(true);
    setTimeout(() => {
      setPublishedToast(false);
      onClose();
    }, 1000);
  };

  const priorityBadgeStyle = (priority: BranchPriority) => {
    if (priority === 'MUST_KNOW') {
      return 'bg-[#FFFBEB] dark:bg-[rgba(245,158,11,0.14)] text-[#D97706] dark:text-[#FBBF24] border-amber-200 dark:border-amber-500/30';
    }
    if (priority === 'PRACTICE') {
      return 'bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#6366F1] border-[#C7D2FE] dark:border-[#3730A3]';
    }
    return 'bg-[#EEF2F7] dark:bg-[#1A2336] text-[#475569] dark:text-[#94A3B8] border-[#E2E8F0] dark:border-[#232E44]';
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#121826] rounded-2xl shadow-2xl w-full max-w-7xl h-[92vh] border border-[#E2E8F0] dark:border-[#232E44] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Studio Bar */}
        <div className="px-5 py-3.5 bg-white dark:bg-[#0D1320] border-b border-[#E2E8F0] dark:border-[#232E44] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#EEF2FF] dark:bg-[#1B2440] border border-[#C7D2FE] dark:border-[#3730A3] flex items-center justify-center text-[#4F46E5] dark:text-[#6366F1] shrink-0">
              <GitBranch className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-[#F8FAFC] truncate">
                  Visual Flowchart & Study Pack Studio
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#6366F1] border border-[#C7D2FE] dark:border-[#3730A3]">
                  {board} • {chapter.classGrade}
                </span>
              </div>
              <p className="text-[11px] text-[#475569] dark:text-[#94A3B8] truncate">
                Ch {chapter.chapterNumber}: {title} • {chapter.subject}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {publishedToast && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECFDF5] dark:bg-[rgba(16,185,129,0.14)] text-[#059669] dark:text-[#34D399] text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Published to Class!
              </span>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#475569] dark:text-[#94A3B8] hover:bg-[#EEF2F7] dark:hover:bg-[#1A2336] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Split Screen Workspace */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
          {/* LEFT PANE: LIVE ROADMAP.SH-STYLE FLOWCHART PREVIEW */}
          <div className="w-full lg:w-[48%] bg-[#F6F8FC] dark:bg-[#090D16] border-b lg:border-b-0 lg:border-r border-[#E2E8F0] dark:border-[#232E44] overflow-y-auto p-5 relative">
            {/* Top Preview Header + Related Chapters Box */}
            <div className="flex items-start justify-between gap-3 mb-6">
              <div className="bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] rounded-xl p-3 shadow-2xs max-w-[230px]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#4F46E5] dark:text-[#6366F1] block mb-1">
                  Related Chapters
                </span>
                {relatedList.length > 0 ? (
                  <div className="space-y-1">
                    {relatedList.map((rc, i) => (
                      <div key={i} className="text-[11px] font-medium text-[#475569] dark:text-[#94A3B8] truncate">
                        • Ch {rc.chapterNumber}: {rc.title}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[11px] text-[#475569] dark:text-[#94A3B8]">
                    {chapter.subject} Core Sequence
                  </div>
                )}
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#6366F1] border border-[#C7D2FE] dark:border-[#3730A3]">
                  <Sparkles className="w-3 h-3" />
                  Live Mobile Preview
                </span>
                {selectedModelSpec.id !== 'none' && (
                  <div className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-[#059669] dark:text-[#34D399]">
                    <Boxes className="w-3.5 h-3.5" />
                    <span>3D: {selectedModelSpec.name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Central Vertical Indigo Spine + Left/Right SVG Dotted Branches */}
            <div className="relative flex flex-col items-center space-y-6 pb-8">
              {/* Continuous Vertical Spine Trunk */}
              {milestones.length > 1 && (
                <div className="absolute top-6 bottom-6 left-1/2 -translate-x-1/2 w-0.5 bg-[#4F46E5]/35 dark:bg-[#6366F1]/40 pointer-events-none" />
              )}

              {milestones.map((ms, idx) => {
                const leftBranches = (ms.branches || []).filter((b) => b.side === 'left');
                const rightBranches = (ms.branches || []).filter((b) => b.side === 'right');
                const isSelected = selectedMilestoneId === ms.nodeId;

                return (
                  <div key={ms.nodeId} className="w-full relative z-10 flex flex-col items-center">
                    {/* Spine Node Box */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMilestoneId(ms.nodeId);
                        setActiveTab('flowchart');
                      }}
                      className={`px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-md transition-all cursor-pointer max-w-xs text-center border-2 ${
                        isSelected
                          ? 'bg-[#3730A3] dark:bg-[#6366F1] border-indigo-300 ring-2 ring-indigo-500/30'
                          : 'bg-[#4F46E5] dark:bg-[#4F46E5] border-transparent hover:bg-[#3730A3]'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-white/20 text-[10px] flex items-center justify-center font-mono">
                          {idx + 1}
                        </span>
                        <span>{ms.title}</span>
                      </div>
                    </button>

                    {/* SVG Curved Dotted Connectors */}
                    {(leftBranches.length > 0 || rightBranches.length > 0) && (
                      <svg
                        viewBox="0 0 320 26"
                        className="w-full max-w-md h-6 overflow-visible pointer-events-none"
                      >
                        <line
                          x1="160"
                          y1="0"
                          x2="160"
                          y2="26"
                          stroke="#4F46E5"
                          strokeOpacity="0.4"
                          strokeWidth="2"
                        />
                        {leftBranches.length > 0 && (
                          <path
                            d="M 160 2 C 130 14, 95 10, 75 24"
                            fill="none"
                            stroke="#6366F1"
                            strokeWidth="2"
                            strokeDasharray="4 4"
                          />
                        )}
                        {rightBranches.length > 0 && (
                          <path
                            d="M 160 2 C 190 14, 225 10, 245 24"
                            fill="none"
                            stroke="#6366F1"
                            strokeWidth="2"
                            strokeDasharray="4 4"
                          />
                        )}
                      </svg>
                    )}

                    {/* Left & Right Cluster Boxes */}
                    {(leftBranches.length > 0 || rightBranches.length > 0) && (
                      <div className="w-full max-w-md grid grid-cols-2 gap-3">
                        {/* Left Cluster */}
                        <div className="space-y-2">
                          {leftBranches.length > 0 && (
                            <div className="p-2.5 rounded-xl bg-[#EEF2FF] dark:bg-[#1B2440] border border-[#C7D2FE] dark:border-[#3730A3] space-y-2">
                              <span className="text-[10px] font-bold text-[#4F46E5] dark:text-[#818CF8] uppercase tracking-wider block">
                                {leftBranches[0]?.groupBox || 'Core Concept'}
                              </span>
                              {leftBranches.map((br) => (
                                <div
                                  key={br.id}
                                  className="p-2 rounded-lg bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] text-[11px] font-semibold text-[#0F172A] dark:text-[#F8FAFC] shadow-2xs"
                                >
                                  <div className="flex items-start justify-between gap-1">
                                    <span className="leading-snug">{br.title}</span>
                                    <span
                                      className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold border ${priorityBadgeStyle(
                                        br.priority
                                      )}`}
                                    >
                                      {br.priority === 'MUST_KNOW' ? '✓' : br.priority === 'PRACTICE' ? 'P' : '○'}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Right Cluster */}
                        <div className="space-y-2">
                          {rightBranches.length > 0 && (
                            <div className="p-2.5 rounded-xl bg-[#EEF2FF] dark:bg-[#1B2440] border border-[#C7D2FE] dark:border-[#3730A3] space-y-2">
                              <span className="text-[10px] font-bold text-[#4F46E5] dark:text-[#818CF8] uppercase tracking-wider block">
                                {rightBranches[0]?.groupBox || 'Application'}
                              </span>
                              {rightBranches.map((br) => (
                                <div
                                  key={br.id}
                                  className="p-2 rounded-lg bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] text-[11px] font-semibold text-[#0F172A] dark:text-[#F8FAFC] shadow-2xs"
                                >
                                  <div className="flex items-start justify-between gap-1">
                                    <span className="leading-snug">{br.title}</span>
                                    <span
                                      className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold border ${priorityBadgeStyle(
                                        br.priority
                                      )}`}
                                    >
                                      {br.priority === 'MUST_KNOW' ? '✓' : br.priority === 'PRACTICE' ? 'P' : '○'}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Teacher Exam Tip Callout */}
                    {ms.examTip && (
                      <div className="mt-2.5 max-w-md w-full px-3 py-1.5 rounded-lg bg-[#FFFBEB] dark:bg-[rgba(245,158,11,0.14)] border border-amber-200/80 dark:border-amber-500/30 flex items-start gap-1.5 text-[11px] text-[#D97706] dark:text-[#FBBF24]">
                        <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{ms.examTip}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT PANE: 3-TAB EDITOR */}
          <div className="w-full lg:w-[52%] flex flex-col min-h-0 bg-white dark:bg-[#121826]">
            {/* Tab Bar */}
            <div className="px-5 pt-3 border-b border-[#E2E8F0] dark:border-[#232E44] flex items-center justify-between gap-2">
              <div className="flex items-center gap-4">
                {[
                  { id: 'flowchart' as StudioTab, label: 'Flowchart Builder', icon: GitBranch },
                  { id: 'notes' as StudioTab, label: `AI Revision Notes (${revisionNotes.length})`, icon: BookOpen },
                  { id: 'practice' as StudioTab, label: `Practice Sheet (${practiceSheet.mcqs.length + practiceSheet.shortQuestions.length + practiceSheet.longQuestions.length})`, icon: ClipboardCheck },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`pb-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                        active
                          ? 'border-[#4F46E5] dark:border-[#6366F1] text-[#4F46E5] dark:text-[#6366F1]'
                          : 'border-transparent text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Content Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {activeTab === 'flowchart' && (
                <>
                  {/* Quick Chapter Meta Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44]">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold uppercase text-[#475569] dark:text-[#94A3B8] mb-1">
                        Chapter Title
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-[#475569] dark:text-[#94A3B8] mb-1">
                        Default 3D Model
                      </label>
                      <select
                        value={arModelId}
                        onChange={(e) => setArModelId(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]"
                      >
                        {EDZY_DEFAULT_3D_MODELS.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Milestones Header */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                      Core Spine Milestones ({milestones.length})
                    </span>
                    <button
                      type="button"
                      onClick={addMilestone}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#6366F1] border border-[#C7D2FE] dark:border-[#3730A3] text-xs font-bold hover:opacity-90 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Milestone</span>
                    </button>
                  </div>

                  {/* Milestones Editor List */}
                  <div className="space-y-3">
                    {milestones.map((ms, idx) => {
                      const isExpanded = selectedMilestoneId === ms.nodeId;
                      return (
                        <div
                          key={ms.nodeId}
                          className={`rounded-xl border transition-all ${
                            isExpanded
                              ? 'border-[#4F46E5] dark:border-[#6366F1] bg-white dark:bg-[#121826] shadow-xs'
                              : 'border-[#E2E8F0] dark:border-[#232E44] bg-[#F6F8FC] dark:bg-[#1A2336]/50'
                          }`}
                        >
                          {/* Spine Title Header Row */}
                          <div className="p-3 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedMilestoneId(ms.nodeId)}
                              className="w-6 h-6 rounded-full bg-[#4F46E5] text-white text-[11px] font-bold flex items-center justify-center shrink-0 cursor-pointer"
                            >
                              {idx + 1}
                            </button>
                            <input
                              type="text"
                              value={ms.title}
                              onFocus={() => setSelectedMilestoneId(ms.nodeId)}
                              onChange={(e) => updateMilestoneField(ms.nodeId, 'title', e.target.value)}
                              className="flex-1 px-2.5 py-1 rounded-lg bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]"
                            />
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => moveMilestone(idx, -1)}
                                disabled={idx === 0}
                                className="p-1 rounded hover:bg-[#EEF2F7] dark:hover:bg-[#1A2336] disabled:opacity-30 cursor-pointer"
                                title="Move Up"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveMilestone(idx, 1)}
                                disabled={idx === milestones.length - 1}
                                className="p-1 rounded hover:bg-[#EEF2F7] dark:hover:bg-[#1A2336] disabled:opacity-30 cursor-pointer"
                                title="Move Down"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteMilestone(ms.nodeId)}
                                className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                                title="Delete Milestone"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Expanded Sub-Topic Branches & Teacher Exam Tip */}
                          {isExpanded && (
                            <div className="px-3 pb-3 pt-1 border-t border-[#E2E8F0] dark:border-[#232E44] space-y-3">
                              <div>
                                <label className="block text-[10px] font-bold text-[#D97706] dark:text-[#FBBF24] uppercase mb-1">
                                  Teacher Exam Tip
                                </label>
                                <input
                                  type="text"
                                  value={ms.examTip || ''}
                                  onChange={(e) => updateMilestoneField(ms.nodeId, 'examTip', e.target.value)}
                                  placeholder="Key diagram or examiner hint..."
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#FFFBEB]/60 dark:bg-[#1A2336] border border-amber-200 dark:border-amber-500/30 text-xs text-[#0F172A] dark:text-[#F8FAFC]"
                                />
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-[#475569] dark:text-[#94A3B8]">
                                  Left / Right Branch Nodes ({(ms.branches || []).length})
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => addBranch(ms.nodeId, 'left')}
                                    className="px-2 py-1 rounded bg-[#EEF2F7] dark:bg-[#1A2336] text-[10px] font-bold text-[#4F46E5] dark:text-[#6366F1] cursor-pointer"
                                  >
                                    + Left Branch
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => addBranch(ms.nodeId, 'right')}
                                    className="px-2 py-1 rounded bg-[#EEF2F7] dark:bg-[#1A2336] text-[10px] font-bold text-[#4F46E5] dark:text-[#6366F1] cursor-pointer"
                                  >
                                    + Right Branch
                                  </button>
                                </div>
                              </div>

                              <div className="space-y-2">
                                {(ms.branches || []).map((br) => (
                                  <div
                                    key={br.id}
                                    className="p-2.5 rounded-lg bg-[#F6F8FC] dark:bg-[#090D16] border border-[#E2E8F0] dark:border-[#232E44] space-y-2"
                                  >
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="text"
                                        value={br.title}
                                        onChange={(e) => updateBranch(ms.nodeId, br.id, { title: e.target.value })}
                                        className="flex-1 px-2 py-1 rounded bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => deleteBranch(ms.nodeId, br.id)}
                                        className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded cursor-pointer"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2">
                                      <select
                                        value={br.side}
                                        onChange={(e) =>
                                          updateBranch(ms.nodeId, br.id, { side: e.target.value as BranchSide })
                                        }
                                        className="px-2 py-1 rounded bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] text-[11px] font-semibold"
                                      >
                                        <option value="left">Left Cluster</option>
                                        <option value="right">Right Cluster</option>
                                      </select>

                                      <input
                                        type="text"
                                        value={br.groupBox || ''}
                                        onChange={(e) =>
                                          updateBranch(ms.nodeId, br.id, { groupBox: e.target.value })
                                        }
                                        placeholder="Group Name"
                                        className="px-2 py-1 rounded bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] text-[11px]"
                                      />

                                      <select
                                        value={br.priority}
                                        onChange={(e) =>
                                          updateBranch(ms.nodeId, br.id, {
                                            priority: e.target.value as BranchPriority,
                                          })
                                        }
                                        className="px-2 py-1 rounded bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] text-[11px] font-semibold"
                                      >
                                        <option value="MUST_KNOW">Board Must-Know</option>
                                        <option value="PRACTICE">Practice</option>
                                        <option value="OPTIONAL">Optional</option>
                                      </select>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {activeTab === 'notes' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[#475569] dark:text-[#94A3B8]">
                      Structured summary notes displayed in the student mobile app's <strong>Notes & Practice</strong> tab.
                    </p>
                    <button
                      type="button"
                      onClick={addRevisionNote}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#6366F1] text-xs font-bold border border-[#C7D2FE] dark:border-[#3730A3] cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Note Block
                    </button>
                  </div>

                  {revisionNotes.map((note, idx) => (
                    <div
                      key={note.id}
                      className="p-4 rounded-xl bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={note.topicTitle}
                          onChange={(e) =>
                            setRevisionNotes((prev) =>
                              prev.map((n, i) => (i === idx ? { ...n, topicTitle: e.target.value } : n))
                            )
                          }
                          className="flex-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => setRevisionNotes((prev) => prev.filter((_, i) => i !== idx))}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-[#475569] dark:text-[#94A3B8] mb-1">
                          Key Definitions (one per line)
                        </label>
                        <textarea
                          rows={2}
                          value={note.keyDefinitions.join('\n')}
                          onChange={(e) =>
                            setRevisionNotes((prev) =>
                              prev.map((n, i) =>
                                i === idx
                                  ? { ...n, keyDefinitions: e.target.value.split('\n') }
                                  : n
                              )
                            )
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-[#475569] dark:text-[#94A3B8] mb-1">
                          Summary Bullets (one per line)
                        </label>
                        <textarea
                          rows={3}
                          value={note.summaryPoints.join('\n')}
                          onChange={(e) =>
                            setRevisionNotes((prev) =>
                              prev.map((n, i) =>
                                i === idx
                                  ? { ...n, summaryPoints: e.target.value.split('\n') }
                                  : n
                              )
                            )
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'practice' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                      {board} Pattern Practice Sheet ({practiceSheet.mcqs.length} MCQs •{' '}
                      {practiceSheet.shortQuestions.length} Short • {practiceSheet.longQuestions.length} Long)
                    </span>
                    <button
                      type="button"
                      onClick={addMcqQuestion}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#6366F1] text-xs font-bold border border-[#C7D2FE] dark:border-[#3730A3] cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add MCQ
                    </button>
                  </div>

                  {/* MCQs Editor */}
                  <div className="space-y-3">
                    {practiceSheet.mcqs.map((q, qIdx) => (
                      <div
                        key={q.id}
                        className="p-3.5 rounded-xl bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#6366F1]">
                            MCQ #{qIdx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setPracticeSheet((prev) => ({
                                ...prev,
                                mcqs: prev.mcqs.filter((_, i) => i !== qIdx),
                              }))
                            }
                            className="text-rose-500 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={q.question}
                          onChange={(e) =>
                            setPracticeSheet((prev) => ({
                              ...prev,
                              mcqs: prev.mcqs.map((item, i) =>
                                i === qIdx ? { ...item, question: e.target.value } : item
                              ),
                            }))
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-semibold"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          {q.options.map((opt, oIdx) => (
                            <div key={oIdx} className="flex items-center gap-1.5">
                              <input
                                type="radio"
                                name={`mcq-correct-${q.id}`}
                                checked={q.correctIndex === oIdx}
                                onChange={() =>
                                  setPracticeSheet((prev) => ({
                                    ...prev,
                                    mcqs: prev.mcqs.map((item, i) =>
                                      i === qIdx ? { ...item, correctIndex: oIdx } : item
                                    ),
                                  }))
                                }
                              />
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) =>
                                  setPracticeSheet((prev) => ({
                                    ...prev,
                                    mcqs: prev.mcqs.map((item, i) =>
                                      i === qIdx
                                        ? {
                                            ...item,
                                            options: item.options.map((o, oi) =>
                                              oi === oIdx ? e.target.value : o
                                            ),
                                          }
                                        : item
                                    ),
                                  }))
                                }
                                className="flex-1 px-2 py-1 rounded bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] text-[11px]"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Subjective Questions Preview & Edit */}
                  <div className="space-y-2.5">
                    <span className="text-[11px] font-bold uppercase text-[#475569] dark:text-[#94A3B8] block">
                      Short & Long Answer Questions + Model Keys
                    </span>
                    {[...practiceSheet.shortQuestions, ...practiceSheet.longQuestions].map((sq) => (
                      <div
                        key={sq.id}
                        className="p-3 rounded-xl bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-[10px] font-bold text-[#4F46E5] dark:text-[#6366F1]">
                          <span>
                            {sq.type} ANSWER • {sq.marks} MARKS
                          </span>
                        </div>
                        <input
                          type="text"
                          value={sq.question}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPracticeSheet((prev) => ({
                              ...prev,
                              shortQuestions: prev.shortQuestions.map((item) =>
                                item.id === sq.id ? { ...item, question: val } : item
                              ),
                              longQuestions: prev.longQuestions.map((item) =>
                                item.id === sq.id ? { ...item, question: val } : item
                              ),
                            }));
                          }}
                          className="w-full px-2.5 py-1 rounded bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-semibold"
                        />
                        <textarea
                          rows={2}
                          value={sq.modelAnswer}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPracticeSheet((prev) => ({
                              ...prev,
                              shortQuestions: prev.shortQuestions.map((item) =>
                                item.id === sq.id ? { ...item, modelAnswer: val } : item
                              ),
                              longQuestions: prev.longQuestions.map((item) =>
                                item.id === sq.id ? { ...item, modelAnswer: val } : item
                              ),
                            }));
                          }}
                          className="w-full px-2.5 py-1 rounded bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] text-[11px] text-[#475569] dark:text-[#94A3B8]"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-white dark:bg-[#0D1320] border-t border-[#E2E8F0] dark:border-[#232E44] flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResetToAiDefault}
            disabled={isResetting}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] text-xs font-bold text-[#475569] dark:text-[#94A3B8] hover:bg-[#EEF2F7] dark:hover:bg-[#1A2336] transition cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>{isResetting ? 'Rebuilding Pack...' : 'Reset to AI Default'}</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] text-xs font-semibold text-[#475569] dark:text-[#94A3B8] hover:bg-[#EEF2F7] dark:hover:bg-[#1A2336] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePublishLive}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#3730A3] text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Publish Live to Class</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapStudioModal;
