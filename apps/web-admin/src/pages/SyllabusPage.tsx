import React, { useState } from 'react';
import {
  BookOpen,
  Upload,
  Box,
  Layers,
  Sparkles,
  CheckCircle2,
  FileText,
  Clock,
  Search,
  ExternalLink,
  Cpu,
  BookmarkCheck,
} from 'lucide-react';
import { useAdminStore, SyllabusChapterRecord } from '../store/useAdminStore';
import UploadSyllabusModal from '../components/UploadSyllabusModal';

export default function SyllabusPage() {
  const { syllabusVault } = useAdminStore();
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const filteredChapters = syllabusVault.filter((ch) => {
    const matchesSearch =
      ch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.arModelMapped.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesClass = selectedClass === 'ALL' || ch.classGrade === selectedClass;
    const matchesSubject = selectedSubject === 'ALL' || ch.subject === selectedSubject;

    return matchesSearch && matchesClass && matchesSubject;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Syllabus RAG & 3D Spatial Vault</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
              packages/rag-pipeline
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Class-wise NCERT syllabi parsed into milestone graphs and synced with 3D spatial models for the student mobile app.
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm shadow-indigo-200 transition-colors self-start sm:self-auto"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Chapter PDF</span>
        </button>
      </div>

      {/* RAG Pipeline Architectural Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-2xl shadow-sm border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="font-semibold text-base flex items-center gap-2">
              Autonomous Syllabus-to-Spatial Ingestion Engine
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
              When a PDF is uploaded, <code className="text-indigo-200 font-mono">packages/rag-pipeline</code> extracts textbook learning objectives, builds 5 progressive milestone checkpoints, and wires telemetry into <code className="text-cyan-200 font-mono">packages/ar-sync-engine</code> for real-time mobile 3D rendering.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-slate-300 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>3 Grounded Chapters</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Box className="w-3.5 h-3.5 text-cyan-300" />
            <span>3 AR Spatial Models</span>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search chapters, PDF file, AR model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Class:</span>
            {['ALL', 'Class 10', 'Class 9'].map((c) => (
              <button
                key={c}
                onClick={() => setSelectedClass(c)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                  selectedClass === c
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Subject:</span>
            {['ALL', 'Science', 'Physics', 'Mathematics'].map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSubject(s)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                  selectedSubject === s
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
          <div className="col-span-full bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-400">
            No syllabus chapters match your criteria.
          </div>
        ) : (
          filteredChapters.map((ch) => {
            const hasAr = ch.arModelMapped !== 'None';

            return (
              <div
                key={ch.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden"
              >
                {/* Card Header */}
                <div className="p-5 pb-4 border-b border-slate-100">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {ch.classGrade} • {ch.subject}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      RAG Ready
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    Ch {ch.chapterNumber}: {ch.title}
                  </h3>

                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 font-mono">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>{ch.fileName}</span>
                    <span className="text-slate-300">•</span>
                    <span>{ch.fileSizeBytes}</span>
                  </div>
                </div>

                {/* Spatial Mapping & RAG Node Status */}
                <div className="p-5 py-4 space-y-3.5 flex-1 bg-slate-50/50">
                  {/* AR Model Badge */}
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-indigo-50/60 border border-indigo-100">
                    <div className="flex items-center gap-2 text-indigo-900 text-xs font-semibold">
                      <Box className="w-4 h-4 text-indigo-600" />
                      <span>3D Spatial Lab:</span>
                    </div>
                    {hasAr ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-indigo-600 text-white">
                        <Sparkles className="w-3 h-3" />
                        {ch.arModelMapped}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs font-medium">None Mapped</span>
                    )}
                  </div>

                  {/* Milestones breakdown */}
                  <div>
                    <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        Milestone Roadmaps ({ch.generatedMilestones.length})
                      </span>
                      <span className="text-[11px] text-emerald-600 font-semibold">100% Grounded</span>
                    </div>

                    <div className="space-y-1.5">
                      {ch.generatedMilestones.map((ms, idx) => (
                        <div
                          key={ms.nodeId}
                          className="flex items-center justify-between p-2 rounded bg-white border border-slate-200/80 text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <span className="text-slate-800 font-medium truncate">{ms.title}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-2">
                            {ms.ncertPageRange}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1 font-mono text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Uploaded: {ch.uploadedAt}</span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-indigo-600 font-semibold hover:text-indigo-800 cursor-pointer">
                    <BookmarkCheck className="w-3.5 h-3.5" />
                    Mobile Synced
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {isUploadModalOpen && <UploadSyllabusModal onClose={() => setIsUploadModalOpen(false)} />}
    </div>
  );
}
