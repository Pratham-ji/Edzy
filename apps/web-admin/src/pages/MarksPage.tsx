import React, { useEffect, useMemo, useState } from 'react';
import {
  Award,
  Search,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  Percent,
  Lock,
  ArrowUpDown,
  Plus,
  Sparkles,
} from 'lucide-react';
import { useAdminStore, ExamTerm } from '../store/useAdminStore';
import { sortStudentsAlphabetically } from '../lib/idGenerator';
import {
  formatBoardLabel,
  getDynamicCampusClasses,
  isPrePrimaryClass,
} from '../lib/classScope';

export default function MarksPage() {
  const {
    students,
    staffList,
    currentStaff,
    examMarks,
    updateStudentMark,
    schoolProfile,
    campusConfig,
    updateCampusConfig,
  } = useAdminStore();

  const schoolBoard = formatBoardLabel(schoolProfile.board).split(' ')[0].toUpperCase();
  const isTeacher = currentStaff?.department === 'TCH';
  const lockedClass = isTeacher && currentStaff?.assignedClass ? currentStaff.assignedClass : null;

  const classOptions = useMemo(
    () => getDynamicCampusClasses(students, staffList, lockedClass, campusConfig.customClasses || []),
    [students, staffList, lockedClass, campusConfig.customClasses]
  );

  const [selectedClass, setSelectedClass] = useState<string>(
    lockedClass || classOptions[0] || 'Class 10-A'
  );
  const [selectedTerm, setSelectedTerm] = useState<ExamTerm>('PRE_BOARD');
  const [customTermInput, setCustomTermInput] = useState('');
  const [isAddingTerm, setIsAddingTerm] = useState(false);
  const [newSubjectInput, setNewSubjectInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [savedNotification, setSavedNotification] = useState<string | null>(null);

  useEffect(() => {
    if (lockedClass) {
      setSelectedClass(lockedClass);
    }
  }, [lockedClass]);

  const effectiveClass = lockedClass || selectedClass;
  const isPrePrimary = isPrePrimaryClass(effectiveClass);

  // Compute Class Stats (for selected term & class)
  const baseSubjects = [
    'Science & Lab',
    'Mathematics',
    'English Communicative',
    'Social Science',
    'Computer Applications',
  ];

  const subjects = useMemo(() => {
    const merged = [...baseSubjects, ...(campusConfig.customSubjects || [])];
    for (const rec of examMarks) {
      if (rec.classGrade === effectiveClass) {
        for (const sc of rec.scores) {
          if (sc.subject && !merged.some((m) => m.toLowerCase() === sc.subject.toLowerCase())) {
            merged.push(sc.subject);
          }
        }
      }
    }
    return merged;
  }, [campusConfig.customSubjects, examMarks, effectiveClass]);

  const customTerms = useMemo(() => {
    const standard = new Set(['PRE_BOARD', 'MIDTERM', 'UNIT_TEST_1', 'ANNUAL']);
    const extra = new Set<string>();
    for (const rec of examMarks) {
      if (rec.term && !standard.has(rec.term)) extra.add(rec.term);
    }
    if (selectedTerm && !standard.has(selectedTerm)) extra.add(selectedTerm);
    return Array.from(extra);
  }, [examMarks, selectedTerm]);

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newSubjectInput.trim();
    if (!clean) return;
    if (!subjects.some((s) => s.toLowerCase() === clean.toLowerCase())) {
      await updateCampusConfig({
        customSubjects: [...(campusConfig.customSubjects || []), clean],
      });
    }
    setNewSubjectInput('');
    setSavedNotification(`Added "${clean}" subject column!`);
    setTimeout(() => setSavedNotification(null), 2500);
  };

  const handleApplyCustomTerm = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customTermInput.trim().toUpperCase().replace(/[\s-]+/g, '_');
    if (!clean) return;
    setSelectedTerm(clean);
    setCustomTermInput('');
    setIsAddingTerm(false);
  };

  // Sorted A -> Z roster for effectiveClass
  const classStudents = useMemo(
    () => sortStudentsAlphabetically(students.filter((s) => s.classGrade === effectiveClass)),
    [students, effectiveClass]
  );

  const alphaPosByStudentId = useMemo(() => {
    const map = new Map<string, number>();
    classStudents.forEach((stu, idx) => {
      map.set(stu.id, idx + 1);
    });
    return map;
  }, [classStudents]);

  // Filter by search (preserving A -> Z order)
  const visibleStudents = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return classStudents;
    return classStudents.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.rollNo.includes(searchTerm) ||
        s.id.toLowerCase().includes(q)
    );
  }, [classStudents, searchTerm]);

  const handleMarkChange = (
    studentId: string,
    subject: string,
    newMarks: string,
    existingRemarks?: string
  ) => {
    const parsed = parseInt(newMarks, 10);
    const validMark = isNaN(parsed) ? 0 : Math.min(100, Math.max(0, parsed));
    updateStudentMark(studentId, selectedTerm, subject, validMark, existingRemarks);

    setSavedNotification(`Updated ${subject} for student!`);
    setTimeout(() => setSavedNotification(null), 2500);
  };

  // Compute Class Stats
  const termRecords = examMarks.filter(
    (m) => m.classGrade === effectiveClass && m.term === selectedTerm
  );

  const avgClassPercentage = termRecords.length
    ? (
        termRecords.reduce((acc, r) => acc + r.aggregatePercentage, 0) / termRecords.length
      ).toFixed(1)
    : '0.0';

  const remediationCount = termRecords.filter((r) => r.needsRemediation).length;
  const distinctionCount = termRecords.filter((r) => r.aggregatePercentage >= 90).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              {lockedClass ? `${lockedClass} Gradebook & Marks` : 'Exam Marks & Gradebook'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ECFDF5] dark:bg-[rgba(16,185,129,0.14)] text-[#059669] dark:text-[#34D399] border border-emerald-200 dark:border-emerald-800/50">
              {schoolBoard} Pattern Grading
            </span>
            {lockedClass && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#6366F1] border border-[#C7D2FE] dark:border-[#3730A3]">
                <Lock className="w-3 h-3" />
                Class Admin • {lockedClass}
              </span>
            )}
          </div>
          <p className="text-sm text-[#475569] dark:text-[#94A3B8] mt-0.5">
            Real-time alphabetical spreadsheet gradebook. Marks sync immediately to the Student and Parent mobile apps.
          </p>
        </div>

        {savedNotification && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#ECFDF5] dark:bg-[rgba(16,185,129,0.14)] text-[#059669] dark:text-[#34D399] border border-emerald-200 dark:border-emerald-800 text-xs font-semibold animate-fade-in">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{savedNotification}</span>
          </div>
        )}
      </div>

      {/* Aggregate Metric Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#121826] p-4 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#EEF2FF] dark:bg-[#1B2440] border border-[#C7D2FE] dark:border-[#3730A3] flex items-center justify-center text-[#4F46E5] dark:text-[#6366F1]">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">{avgClassPercentage}%</div>
            <div className="text-xs text-[#475569] dark:text-[#94A3B8] font-medium">Class Batch Average</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#121826] p-4 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#ECFDF5] dark:bg-[rgba(16,185,129,0.14)] border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-[#059669] dark:text-[#34D399]">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-[#059669] dark:text-[#34D399]">{distinctionCount} Students</div>
            <div className="text-xs text-[#475569] dark:text-[#94A3B8] font-medium">&gt;90% Distinction (A1)</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#121826] p-4 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#FFFBEB] dark:bg-[rgba(245,158,11,0.14)] border border-amber-200 dark:border-amber-800 flex items-center justify-center text-[#D97706] dark:text-[#FBBF24]">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-[#D97706] dark:text-[#FBBF24]">{remediationCount} Students</div>
            <div className="text-xs text-[#475569] dark:text-[#94A3B8] font-medium">Need Remedial Focus (&lt;60%)</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#121826] p-4 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-100 dark:border-cyan-800 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">{classStudents.length} Students</div>
            <div className="text-xs text-[#475569] dark:text-[#94A3B8] font-medium">In {effectiveClass}</div>
          </div>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="bg-white dark:bg-[#121826] p-4 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          {/* Class Select (Locked for Class Teacher, Dynamic for Principal) */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-[#475569] dark:text-[#94A3B8]">Class:</span>
            {lockedClass ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EEF2FF] dark:bg-[#1B2440] border border-[#C7D2FE] dark:border-[#3730A3] text-xs font-bold text-[#4F46E5] dark:text-[#6366F1]">
                <Lock className="w-3 h-3" />
                {lockedClass}
              </span>
            ) : (
              <select
                value={effectiveClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-3 py-1.5 bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] rounded-lg text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {classOptions.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Term Select */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <label htmlFor="marks-term-select" className="text-xs font-semibold text-[#475569] dark:text-[#94A3B8]">
              Term:
            </label>
            <select
              id="marks-term-select"
              value={isAddingTerm ? '__CUSTOM__' : selectedTerm}
              onChange={(e) => {
                if (e.target.value === '__CUSTOM__') {
                  setIsAddingTerm(true);
                } else {
                  setIsAddingTerm(false);
                  setSelectedTerm(e.target.value as ExamTerm);
                }
              }}
              className="px-3 py-1.5 bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] rounded-lg text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="PRE_BOARD">
                {effectiveClass.includes('10') ? 'Class 10 Pre-Board Examination' : 'Term Final Examination'}
              </option>
              <option value="MIDTERM">Midterm Assessment</option>
              <option value="UNIT_TEST_1">Unit Test 1</option>
              <option value="ANNUAL">Annual Final Exam</option>
              {customTerms.map((ct) => (
                <option key={ct} value={ct}>
                  {ct.replace(/_/g, ' ')}
                </option>
              ))}
              <option value="__CUSTOM__">+ Custom Exam Term...</option>
            </select>
            {isAddingTerm && (
              <form onSubmit={handleApplyCustomTerm} className="inline-flex items-center gap-1">
                <label htmlFor="custom-term-input" className="visually-hidden">
                  Custom exam term name
                </label>
                <input
                  id="custom-term-input"
                  type="text"
                  value={customTermInput}
                  onChange={(e) => setCustomTermInput(e.target.value)}
                  placeholder="e.g. Unit Test 2"
                  className="h-8 px-2.5 rounded-lg bg-white dark:bg-[#0D1322] border border-[#4F46E5] text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]"
                />
                <button
                  type="submit"
                  className="h-8 px-2.5 rounded-lg bg-[#4F46E5] text-white text-xs font-bold cursor-pointer"
                >
                  Apply
                </button>
              </form>
            )}
          </div>

          {!isPrePrimary && (
            <form onSubmit={handleAddSubject} className="flex items-center gap-1.5">
              <label htmlFor="marks-add-subject-input" className="visually-hidden">
                Add custom subject column
              </label>
              <input
                id="marks-add-subject-input"
                type="text"
                value={newSubjectInput}
                onChange={(e) => setNewSubjectInput(e.target.value)}
                placeholder="+ Subject (e.g. Sanskrit)"
                className="h-8 w-36 px-2.5 rounded-lg bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC]"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#6366F1] border border-[#C7D2FE] dark:border-[#3730A3] text-xs font-bold cursor-pointer"
              >
                <Plus className="w-3 h-3" aria-hidden="true" />
                <span>Add Subject</span>
              </button>
            </form>
          )}

          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold bg-[#ECFDF5] dark:bg-[rgba(16,185,129,0.14)] text-[#059669] dark:text-[#34D399]">
            <ArrowUpDown className="w-3 h-3" />
            Sorted A → Z
          </span>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student name, ID, roll #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] rounded-lg text-xs text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Pre-Primary Wing Notice OR Spreadsheet Table */}
      {isPrePrimary ? (
        <div className="bg-white dark:bg-[#121826] rounded-xl border border-emerald-200 dark:border-emerald-800/60 shadow-xs p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] dark:bg-[rgba(16,185,129,0.14)] border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-[#059669] dark:text-[#34D399]" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                {effectiveClass} — Pre-Primary Fee &amp; Observation Wing
              </h2>
              <p className="text-xs text-[#475569] dark:text-[#94A3B8] leading-relaxed">
                Pre-Primary classes (Playgroup, Nursery, LKG, UKG) intentionally skip numerical mark sheets and high-stakes exam tables. Manage <strong>{effectiveClass}</strong> parent circulars &amp; daily attendance on the Attendance desk, or fees on the Fee Counter. Formal exam ledgers begin from <strong>Class 1</strong>.
              </p>
            </div>
          </div>

          {classStudents.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-[#232E44]">
              {classStudents.map((stu, idx) => (
                <div
                  key={stu.id}
                  className="p-3 rounded-lg bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                      #{String(idx + 1).padStart(2, '0')} {stu.name}
                    </div>
                    <div className="text-[11px] font-mono text-[#4F46E5] dark:text-[#818CF8]">
                      {stu.id}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ECFDF5] dark:bg-[rgba(16,185,129,0.14)] text-[#059669] dark:text-[#34D399]">
                    Att. {stu.attendancePercent}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
      <div className="bg-white dark:bg-[#121826] rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#EEF2F7]/80 dark:bg-[#1A2336]/80 border-b border-[#E2E8F0] dark:border-[#232E44] text-[#475569] dark:text-slate-300 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4 w-16">Roll #</th>
                <th className="py-3 px-4 min-w-[170px]">Student & Permanent ID</th>
                {subjects.map((sub) => (
                  <th key={sub} className="py-3 px-3 text-center min-w-[100px]">
                    <div>{sub}</div>
                    <div className="text-[10px] text-[#94A3B8] font-normal">Max: 100</div>
                  </th>
                ))}
                <th className="py-3 px-4 text-center min-w-[90px]">Aggregate %</th>
                <th className="py-3 px-4 text-center min-w-[70px]">{schoolBoard} Grade</th>
                <th className="py-3 px-4 text-center min-w-[100px]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#232E44] text-xs">
              {visibleStudents.length === 0 ? (
                <tr>
                  <td colSpan={subjects.length + 5} className="py-12 text-center text-[#475569] dark:text-[#94A3B8]">
                    No students enrolled in {effectiveClass} yet. Add students or import a CSV roster to begin grading.
                  </td>
                </tr>
              ) : (
                visibleStudents.map((s) => {
                const record = examMarks.find(
                  (m) => m.studentId === s.id && m.term === selectedTerm
                );
                const alphaPos = String(alphaPosByStudentId.get(s.id) || s.rollNo).padStart(2, '0');
                const aggregate = record?.aggregatePercentage || 0;
                const overallGrade = record?.overallGrade || '-';
                const needsHelp = record?.needsRemediation;

                return (
                  <tr
                    key={s.id}
                    className="hover:bg-[#F6F8FC] dark:hover:bg-[#1A2336]/40 transition-colors"
                  >
                    {/* Alphabetical Roll No */}
                    <td className="py-3 px-4 font-mono font-bold text-[#0F172A] dark:text-slate-300">
                      #{alphaPos}
                    </td>

                    {/* Name & ID */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{s.name}</div>
                      <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded font-mono text-[10px] font-bold bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#6366F1]">
                        {s.id}
                      </span>
                    </td>

                    {/* Subject Marks Input Columns */}
                    {subjects.map((sub) => {
                      const subjectScore = record?.scores.find((sc) => sc.subject === sub);
                      const currentMarks = subjectScore ? subjectScore.marksObtained : 0;
                      const currentGrade = subjectScore ? subjectScore.grade : '-';

                      return (
                        <td key={sub} className="py-2.5 px-3 text-center">
                          <div className="inline-flex flex-col items-center">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={currentMarks}
                              onChange={(e) =>
                                handleMarkChange(s.id, sub, e.target.value, subjectScore?.remarks)
                              }
                              className="w-16 text-center font-bold text-xs py-1 px-1 rounded border border-[#E2E8F0] dark:border-[#232E44] bg-white dark:bg-[#1A2336] text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            <span className="text-[10px] font-semibold text-[#94A3B8] mt-0.5">
                              {currentGrade}
                            </span>
                          </div>
                        </td>
                      );
                    })}

                    {/* Aggregate */}
                    <td className="py-3 px-4 text-center font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">
                      {aggregate}%
                    </td>

                    {/* Overall Grade */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                          overallGrade === 'A1'
                            ? 'bg-[#ECFDF5] dark:bg-[rgba(16,185,129,0.14)] text-[#059669] dark:text-[#34D399]'
                            : overallGrade === 'A2' || overallGrade === 'B1'
                            ? 'bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#6366F1]'
                            : 'bg-[#FFFBEB] dark:bg-[rgba(245,158,11,0.14)] text-[#D97706] dark:text-[#FBBF24]'
                        }`}
                      >
                        {overallGrade}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      {needsHelp ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFFBEB] dark:bg-[rgba(245,158,11,0.14)] text-[#D97706] dark:text-[#FBBF24] border border-amber-200 dark:border-amber-800">
                          <AlertTriangle className="w-3 h-3" /> Remedial
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ECFDF5] dark:bg-[rgba(16,185,129,0.14)] text-[#059669] dark:text-[#34D399] border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" /> On Track
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}
    </div>
  );
}
