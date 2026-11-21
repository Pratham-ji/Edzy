import React, { useState } from 'react';
import {
  Award,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  Save,
  GraduationCap,
  Percent,
} from 'lucide-react';
import { useAdminStore, ExamTerm, calculateCbseGrade } from '../store/useAdminStore';

export default function MarksPage() {
  const { students, examMarks, updateStudentMark } = useAdminStore();
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
            <h1 className="text-2xl font-bold text-slate-900">Academic Marks & Term Assessments</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              CBSE 9-Point Grading
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time spreadsheet gradebook. Marks sync immediately to the Student and Parent mobile apps.
          </p>
        </div>

        {savedNotification && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold animate-fade-in">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{savedNotification}</span>
          </div>
        )}
      </div>

      {/* Class Assessment Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">{avgClassPercentage}%</div>
            <div className="text-xs text-slate-500 font-medium">Class Aggregate Avg</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-emerald-700">{distinctionCount} Students</div>
            <div className="text-xs text-slate-500 font-medium">A1/A2 Distinctions (&gt;90%)</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-rose-700">{remediationCount} Students</div>
            <div className="text-xs text-slate-500 font-medium">Needs Remediation (&lt;60%)</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">Live Synced</div>
            <div className="text-xs text-slate-500 font-medium">Parent App Telemetry</div>
          </div>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Class and Term Selectors */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Class:</span>
            {['Class 10-A', 'Class 9-B'].map((cls) => (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  selectedClass === cls
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cls}
              </button>
            ))}
          </div>

          <div className="h-5 w-px bg-slate-200 hidden sm:block" />

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Term:</span>
            {[
              { id: 'PRE_BOARD', label: 'Pre-Board Exam 2026' },
              { id: 'MIDTERM', label: 'Midterm Evaluation' },
              { id: 'UNIT_TEST_1', label: 'Unit Test 1' },
            ].map((term) => (
              <button
                key={term.id}
                onClick={() => setSelectedTerm(term.id as ExamTerm)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  selectedTerm === term.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {term.label}
              </button>
            ))}
          </div>
        </div>

        {/* Student Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student or roll #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Spreadsheet Marks Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-4 w-16">Roll #</th>
                <th className="py-3 px-4 w-48">Student Name</th>
                {subjects.map((sub) => (
                  <th key={sub} className="py-3 px-3 text-center">
                    <div>{sub}</div>
                    <span className="text-[10px] text-slate-400 font-normal">Max: 100</span>
                  </th>
                ))}
                <th className="py-3 px-4 text-center w-24">Agg %</th>
                <th className="py-3 px-4 text-center w-20">CBSE</th>
                <th className="py-3 px-4 text-center w-36">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {visibleStudents.map((s) => {
                const isAarav = s.id === 'SCH-2026-0104';
                const record = examMarks.find(
                  (m) => m.studentId === s.id && m.term === selectedTerm
                );

                const aggregate = record ? record.aggregatePercentage : 0;
                const grade = record ? record.overallGrade : 'N/A';
                const needsRemediation = record ? record.needsRemediation : false;

                return (
                  <tr
                    key={s.id}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      isAarav ? 'bg-indigo-50/20' : ''
                    }`}
                  >
                    {/* Roll No */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">
                      #{s.rollNo}
                    </td>

                    {/* Name */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        {s.name}
                        {isAarav && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700">
                            <Sparkles className="w-2.5 h-2.5" /> Flagship
                          </span>
                        )}
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
                              className="w-16 text-center font-mono font-bold text-sm py-1 px-1 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-800"
                            />
                            <span className="text-[10px] font-bold font-mono text-slate-400 mt-0.5">
                              {currentGrade}
                            </span>
                          </div>
                        </td>
                      );
                    })}

                    {/* Aggregate Percentage */}
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold font-mono text-slate-900 text-sm">
                        {aggregate}%
                      </span>
                    </td>

                    {/* CBSE Overall Grade */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded font-mono font-bold text-xs ${
                          grade === 'A1' || grade === 'A2'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : grade === 'B1' || grade === 'B2'
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {grade}
                      </span>
                    </td>

                    {/* Remediation Status */}
                    <td className="py-3 px-4 text-center">
                      {aggregate >= 90 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Award className="w-3 h-3" />
                          Top 5%
                        </span>
                      ) : needsRemediation ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertTriangle className="w-3 h-3" />
                          Remedial
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500 font-medium">On Track</span>
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
