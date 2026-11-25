import React, { useState } from 'react';
import {
  Award,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Save,
  GraduationCap,
  Percent,
} from 'lucide-react';
import { useAdminStore, ExamTerm, calculateCbseGrade } from '../store/useAdminStore';

export default function MarksPage() {
  const { students, examMarks, updateStudentMark, schoolProfile } = useAdminStore();
  const schoolBoard = (schoolProfile.board || 'CBSE').split(' ')[0].toUpperCase();
  const [selectedClass, setSelectedClass] = useState<string>('Class 10-A');
  const [selectedTerm, setSelectedTerm] = useState<ExamTerm>('PRE_BOARD');
  const [searchTerm, setSearchTerm] = useState('');
  const [savedNotification, setSavedNotification] = useState<string | null>(null);

  const subjects = [
    'Science & Lab',
    'Mathematics',
    'English Communicative',
    'Social Science',
    'Computer Applications',
  ];

  // Filter students by selected class
  const classStudents = students.filter((s) => s.classGrade === selectedClass);

  // Filter by search
  const visibleStudents = classStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.rollNo.includes(searchTerm) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handleRemarkChange = (
    studentId: string,
    subject: string,
    currentMark: number,
    remarks: string
  ) => {
    updateStudentMark(studentId, selectedTerm, subject, currentMark, remarks);
  };

  // Compute Class Stats
  const termRecords = examMarks.filter(
    (m) => m.classGrade === selectedClass && m.term === selectedTerm
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
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">Exam Marks & Gradebook</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ECFDF5] dark:bg-[rgba(16,185,129,0.14)] text-[#059669] dark:text-[#34D399] border border-emerald-200 dark:border-emerald-800/50">
              {schoolBoard} Pattern Grading
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-[#94A3B8] mt-0.5">
            Real-time spreadsheet gradebook. Marks sync immediately to the Student and Parent mobile apps.
          </p>
        </div>

        {savedNotification && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold animate-fade-in">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{savedNotification}</span>
          </div>
        )}
      </div>

      {/* Aggregate Metric Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#121826] p-4 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 dark:text-[#F8FAFC]">{avgClassPercentage}%</div>
            <div className="text-xs text-slate-500 dark:text-[#94A3B8] font-medium">Class Batch Average</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#121826] p-4 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{distinctionCount} Students</div>
            <div className="text-xs text-slate-500 dark:text-[#94A3B8] font-medium">&gt;90% Distinction (A1)</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#121826] p-4 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-amber-600 dark:text-amber-400">{remediationCount} Students</div>
            <div className="text-xs text-slate-500 dark:text-[#94A3B8] font-medium">Need Remedial Focus (&lt;60%)</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#121826] p-4 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-100 dark:border-cyan-800 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 dark:text-[#F8FAFC]">{classStudents.length} Graded</div>
            <div className="text-xs text-slate-500 dark:text-[#94A3B8] font-medium">In {selectedClass}</div>
          </div>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="bg-white dark:bg-[#121826] p-4 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Class Select */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 dark:text-[#94A3B8]">Class:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-1.5 bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] rounded-lg text-xs font-bold text-slate-800 dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Class 10-A">Class 10-A (Board Batch)</option>
              <option value="Class 9-B">Class 9-B (Foundation)</option>
            </select>
          </div>

          {/* Term Select */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 dark:text-[#94A3B8]">Term:</span>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value as ExamTerm)}
              className="px-3 py-1.5 bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] rounded-lg text-xs font-bold text-slate-800 dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="PRE_BOARD">Class 10 Pre-Board Examination</option>
              <option value="MIDTERM">Midterm Assessment</option>
              <option value="UNIT_TEST_1">Unit Test 1</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student or roll #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] rounded-lg text-xs text-slate-800 dark:text-[#F8FAFC] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Spreadsheet Table */}
      <div className="bg-white dark:bg-[#121826] rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#EEF2F7]/80 dark:bg-[#1A2336]/80 border-b border-[#E2E8F0] dark:border-[#232E44] text-slate-600 dark:text-slate-300 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4 w-12">Roll #</th>
                <th className="py-3 px-4 min-w-[160px]">Student Particulars</th>
                {subjects.map((sub) => (
                  <th key={sub} className="py-3 px-3 text-center min-w-[100px]">
                    <div>{sub}</div>
                    <div className="text-[10px] text-slate-400 font-normal">Max: 100</div>
                  </th>
                ))}
                <th className="py-3 px-4 text-center min-w-[90px]">Aggregate %</th>
                <th className="py-3 px-4 text-center min-w-[70px]">{schoolBoard} Grade</th>
                <th className="py-3 px-4 text-center min-w-[100px]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#232E44] text-xs">
              {visibleStudents.map((s) => {
                const record = examMarks.find(
                  (m) => m.studentId === s.id && m.term === selectedTerm
                );

                const aggregate = record?.aggregatePercentage || 0;
                const overallGrade = record?.overallGrade || '-';
                const needsHelp = record?.needsRemediation;

                return (
                  <tr
                    key={s.id}
                    className="hover:bg-[#F6F8FC] dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Roll No */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                      #{s.rollNo}
                    </td>

                    {/* Name */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-[#F8FAFC]">
                        {s.name}
                      </div>
                      <div className="font-mono text-xs text-slate-400">{s.id}</div>
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
                              className="w-16 text-center font-bold text-xs py-1 px-1 rounded border border-[#E2E8F0] dark:border-[#232E44] bg-white dark:bg-[#1A2336] text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            <span className="text-[10px] font-semibold text-slate-400 mt-0.5">
                              {currentGrade}
                            </span>
                          </div>
                        </td>
                      );
                    })}

                    {/* Aggregate */}
                    <td className="py-3 px-4 text-center font-bold text-sm text-slate-900 dark:text-[#F8FAFC]">
                      {aggregate}%
                    </td>

                    {/* Overall CBSE Grade */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                          overallGrade === 'A1'
                            ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300'
                            : overallGrade === 'A2' || overallGrade === 'B1'
                            ? 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-300'
                            : 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300'
                        }`}
                      >
                        {overallGrade}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      {needsHelp ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          <AlertTriangle className="w-3 h-3" /> Remedial
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" /> On Track
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
