import React, { useEffect, useMemo, useState } from 'react';
import {
  Upload,
  Box,
  Layers,
  Sparkles,
  CheckCircle2,
  FileText,
  Clock,
  Search,
  Cpu,
  Edit3,
  Lock,
} from 'lucide-react';
import { useAdminStore } from '../store/useAdminStore';
import UploadSyllabusModal from '../components/UploadSyllabusModal';
import RoadmapStudioModal from '../components/RoadmapStudioModal';
import { cleanBoardCode } from '../lib/syllabusGenerator';
import { compareClassNames, extractBaseGrade } from '../lib/classScope';

export default function SyllabusPage() {
  const { syllabusVault, schoolProfile, currentStaff } = useAdminStore();

  const teacherBaseGrade =
    currentStaff?.department === 'TCH' && currentStaff.assignedClass
      ? extractBaseGrade(currentStaff.assignedClass)
      : null;

  const [selectedClass, setSelectedClass] = useState<string>(teacherBaseGrade || 'ALL');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [studioChapterId, setStudioChapterId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedClass(teacherBaseGrade || 'ALL');
  }, [teacherBaseGrade]);

  const classFilterOptions = useMemo(() => {
    const grades = new Set<string>(['Class 10', 'Class 9']);
    for (const ch of syllabusVault) {
      if (ch.classGrade?.trim()) {
        grades.add(extractBaseGrade(ch.classGrade));
      }
    }
    if (teacherBaseGrade) {
      grades.add(teacherBaseGrade);
    }
    return ['ALL', ...Array.from(grades).sort(compareClassNames)];
  }, [syllabusVault, teacherBaseGrade]);

  const schoolBoard = cleanBoardCode(schoolProfile.board);
  const studioChapter = syllabusVault.find((c) => c.id === studioChapterId) || null;

  const filteredChapters = syllabusVault.filter((ch) => {
    const matchesSearch =
      ch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.arModelMapped.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesClass =
      selectedClass === 'ALL' || extractBaseGrade(ch.classGrade) === selectedClass;
    const matchesSubject =
      selectedSubject === 'ALL' ||
      ch.subject.toLowerCase().includes(selectedSubject.toLowerCase());

    return matchesSearch && matchesClass && matchesSubject;
  });

  const arModelsCount = syllabusVault.filter((c) => c.arModelMapped && c.arModelMapped !== 'None').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              Curriculum Vault & 3D Labs
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#6366F1] border border-[#C7D2FE] dark:border-[#3730A3]">
              {schoolBoard} Aligned
            </span>
          </div>
          <p className="text-sm text-[#475569] dark:text-[#94A3B8] mt-0.5">
            Scan school text syllabi into roadmap.sh-style visual flowcharts, AI revision notes, practice sheets, and interactive 3D labs.
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#4F46E5] hover:bg-[#3730A3] text-white text-sm font-semibold rounded-xl shadow-sm transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          <span>Scan Syllabus & Publish</span>
        </button>
      </div>

      {/* Curriculum & 3D Learning Engine Banner */}
      <div className="bg-gradient-to-r from-[#3730A3] via-[#4F46E5] to-slate-900 dark:from-[#121826] dark:via-[#1B2440] dark:to-[#090D16] text-white p-5 rounded-2xl shadow-sm border border-[#C7D2FE]/30 dark:border-[#232E44] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="font-semibold text-base flex items-center gap-2">
              Multi-Board AI Curriculum & Flowchart Engine ({schoolBoard})
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-indigo-100/90 dark:text-[#94A3B8] mt-0.5 max-w-2xl leading-relaxed">
              Every chapter generates a 2-sided visual flowchart, structured revision pack, and {schoolBoard}-pattern questions synced directly to students' home schedules.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-indigo-100 dark:text-[#94A3B8] shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{syllabusVault.length} Published Chapters</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Box className="w-3.5 h-3.5 text-cyan-300" />
            <span>{arModelsCount} 3D Labs Linked</span>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white dark:bg-[#121826] p-4 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search chapters, topics, 3D model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] rounded-lg text-sm text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] transition-all"
          />
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider">Class:</span>
            {classFilterOptions.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedClass(c)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  selectedClass === c
                    ? 'bg-[#4F46E5] dark:bg-[#6366F1] text-white'
                    : 'bg-[#EEF2F7] dark:bg-[#1A2336] text-[#475569] dark:text-[#94A3B8] hover:opacity-80'
                }`}
              >
                {c}
              </button>
            ))}
            {teacherBaseGrade && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#6366F1] border border-[#C7D2FE] dark:border-[#3730A3]">
                <Lock className="w-2.5 h-2.5" />
                Default: {teacherBaseGrade}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider">Subject:</span>
            {['ALL', 'Science', 'Physics', 'Biology', 'Mathematics'].map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSubject(s)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  selectedSubject === s
                    ? 'bg-[#4F46E5] dark:bg-[#6366F1] text-white'
                    : 'bg-[#EEF2F7] dark:bg-[#1A2336] text-[#475569] dark:text-[#94A3B8] hover:opacity-80'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chapters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredChapters.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-[#121826] p-12 text-center rounded-xl border border-[#E2E8F0] dark:border-[#232E44] text-[#475569] dark:text-[#94A3B8]">
            No syllabus chapters match your criteria.
          </div>
        ) : (
          filteredChapters.map((ch) => {
            const hasAr = ch.arModelMapped && ch.arModelMapped !== 'None';
            const totalBranches = ch.generatedMilestones.reduce(
              (acc, ms) => acc + (ms.branches?.length || 0),
              0
            );
            const totalNotes = ch.revisionNotes?.length || 0;
            const totalQuestions =
              (ch.practiceSheet?.mcqs?.length || 0) +
              (ch.practiceSheet?.shortQuestions?.length || 0) +
              (ch.practiceSheet?.longQuestions?.length || 0);

            return (
              <div
                key={ch.id}
                className="bg-white dark:bg-[#121826] rounded-2xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden"
              >
                {/* Card Header */}
                <div className="p-5 pb-4 border-b border-[#E2E8F0] dark:border-[#232E44]">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#EEF2F7] dark:bg-[#1A2336] text-[#475569] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-[#232E44]">
                      {ch.classGrade} • {ch.subject}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#ECFDF5] dark:bg-[rgba(16,185,129,0.14)] text-[#059669] dark:text-[#34D399] border border-emerald-200 dark:border-emerald-800/40">
                      <CheckCircle2 className="w-3 h-3" />
                      {ch.board || schoolBoard} Verified
                    </span>
                  </div>

                  <h3 className="font-bold text-[#0F172A] dark:text-[#F8FAFC] text-base leading-snug">
                    Ch {ch.chapterNumber}: {ch.title}
                  </h3>

                  <div className="flex items-center justify-between gap-2 mt-2 text-xs text-[#475569] dark:text-[#94A3B8] font-mono">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <FileText className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
                      <span className="truncate">{ch.fileName}</span>
                    </div>
                    <span className="shrink-0 font-sans text-[11px] whitespace-nowrap">{ch.fileSizeBytes}</span>
                  </div>
                </div>

                {/* Study Pack Summary & Milestones */}
                <div className="p-5 py-4 space-y-3.5 flex-1 bg-[#F6F8FC]/70 dark:bg-[#090D16]/40">
                  {/* AR Model Badge */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#EEF2FF] dark:bg-[#1B2440] border border-[#C7D2FE] dark:border-[#3730A3]">
                    <div className="flex items-center gap-2 text-[#3730A3] dark:text-[#F8FAFC] text-xs font-semibold">
                      <Box className="w-4 h-4 text-[#4F46E5] dark:text-[#6366F1]" />
                      <span>3D Spatial Lab:</span>
                    </div>
                    {hasAr ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-[#4F46E5] text-white">
                        <Sparkles className="w-3 h-3" />
                        {ch.arModelMapped}
                      </span>
                    ) : (
                      <span className="text-[#475569] dark:text-[#94A3B8] text-xs font-medium">None Mapped</span>
                    )}
                  </div>

                  {/* Flowchart / Notes / Practice Metrics */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44]">
                      <div className="text-xs font-extrabold text-[#4F46E5] dark:text-[#6366F1]">
                        {totalBranches || ch.generatedMilestones.length}
                      </div>
                      <div className="text-[10px] text-[#475569] dark:text-[#94A3B8] font-medium">Nodes</div>
                    </div>
                    <div className="p-2 rounded-lg bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44]">
                      <div className="text-xs font-extrabold text-[#059669] dark:text-[#34D399]">
                        {totalNotes}
                      </div>
                      <div className="text-[10px] text-[#475569] dark:text-[#94A3B8] font-medium">Notes</div>
                    </div>
                    <div className="p-2 rounded-lg bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44]">
                      <div className="text-xs font-extrabold text-[#D97706] dark:text-[#FBBF24]">
                        {totalQuestions}
                      </div>
                      <div className="text-[10px] text-[#475569] dark:text-[#94A3B8] font-medium">Questions</div>
                    </div>
                  </div>

                  {/* Milestones breakdown */}
                  <div>
                    <div className="text-xs font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5" />
                        Spine Milestones ({ch.generatedMilestones.length})
                      </span>
                      <span className="text-[11px] text-[#059669] dark:text-[#34D399] font-semibold">
                        Flowchart Ready
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {ch.generatedMilestones.slice(0, 4).map((ms, idx) => (
                        <div
                          key={ms.nodeId}
                          className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="w-4 h-4 rounded-full bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#6366F1] font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <span className="text-[#0F172A] dark:text-[#F8FAFC] font-medium truncate">
                              {ms.title}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-[#475569] dark:text-[#94A3B8] shrink-0 ml-2">
                            {ms.branches?.length || 0} topics
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer with Studio Button */}
                <div className="p-4 bg-white dark:bg-[#121826] border-t border-[#E2E8F0] dark:border-[#232E44] flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1 font-mono text-[11px] text-[#475569] dark:text-[#94A3B8]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{ch.uploadedAt}</span>
                  </div>

                  <button
                    onClick={() => setStudioChapterId(ch.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EEF2FF] dark:bg-[#1B2440] hover:bg-[#4F46E5] hover:text-white dark:hover:bg-[#6366F1] text-[#4F46E5] dark:text-[#6366F1] border border-[#C7D2FE] dark:border-[#3730A3] font-bold text-xs transition-all cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Flowchart & Study Pack</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Syllabus Scanner Modal */}
      {isUploadModalOpen && (
        <UploadSyllabusModal
          lockedClass={teacherBaseGrade}
          onClose={() => setIsUploadModalOpen(false)}
          onOpenStudio={(rec) => setStudioChapterId(rec.id)}
        />
      )}

      {/* Split-Screen Teacher Flowchart Studio Modal */}
      {studioChapter && (
        <RoadmapStudioModal
          chapter={studioChapter}
          onClose={() => setStudioChapterId(null)}
        />
      )}
    </div>
  );
}
