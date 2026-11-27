import React, { useMemo, useState } from 'react';
import {
  Search,
  Filter,
  UserPlus,
  FileSpreadsheet,
  Printer,
  KeyRound,
  IndianRupee,
  Phone,
  Clock,
  Flame,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Trash2,
  ArrowUpDown,
  Lock,
  AlertTriangle,
  CalendarCheck,
} from 'lucide-react';
import { useAdminStore, StudentRecord } from '../store/useAdminStore';
import { sortStudentsAlphabetically } from '../lib/idGenerator';
import { compareClassNames, getDynamicCampusClasses } from '../lib/classScope';
import StudentLoginSlipModal from '../components/StudentLoginSlipModal';
import OfflineFeeModal from '../components/OfflineFeeModal';
import CsvImportModal from '../components/CsvImportModal';
import AddStudentModal from '../components/AddStudentModal';

export default function StudentsPage() {
  const {
    students,
    staffList,
    currentStaff,
    schoolProfile,
    studentProgressList,
    removeStudent,
  } = useAdminStore();

  const schoolBoard = (schoolProfile.board || 'CBSE').split(' ')[0].toUpperCase();
  const isTeacher = currentStaff?.department === 'TCH';
  const teacherClass = isTeacher ? currentStaff?.assignedClass || null : null;
  const canManageFees = currentStaff?.department === 'ADM' || currentStaff?.department === 'ACT';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');

  // Modals state
  const [selectedSlipStudent, setSelectedSlipStudent] = useState<StudentRecord | null>(null);
  const [selectedFeeStudent, setSelectedFeeStudent] = useState<StudentRecord | null>(null);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState<StudentRecord | null>(null);

  const classOptions = useMemo(
    () => getDynamicCampusClasses(students, staffList, teacherClass),
    [students, staffList, teacherClass]
  );

  // TCH stays strictly locked to their assigned class; ADM can filter freely
  const effectiveClass = teacherClass || selectedClass;

  // Compute true A -> Z position within each class before search filtering
  const alphaPositionByStudentId = useMemo(() => {
    const byClass = new Map<string, StudentRecord[]>();
    for (const s of students) {
      const list = byClass.get(s.classGrade) || [];
      list.push(s);
      byClass.set(s.classGrade, list);
    }
    const posMap = new Map<string, number>();
    byClass.forEach((group) => {
      sortStudentsAlphabetically(group).forEach((stu, idx) => {
        posMap.set(stu.id, idx + 1);
      });
    });
    return posMap;
  }, [students]);

  const scopedStudents = useMemo(
    () => (effectiveClass === 'ALL' ? students : students.filter((s) => s.classGrade === effectiveClass)),
    [students, effectiveClass]
  );

  const filteredSortedStudents = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const matched = scopedStudents.filter((s) => {
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.rollNo.includes(q) ||
        s.parentPhone.includes(q)
      );
    });

    const byClass = new Map<string, StudentRecord[]>();
    for (const s of matched) {
      const list = byClass.get(s.classGrade) || [];
      list.push(s);
      byClass.set(s.classGrade, list);
    }

    const orderedClasses = Array.from(byClass.keys()).sort(compareClassNames);
    const ordered: StudentRecord[] = [];
    for (const cls of orderedClasses) {
      ordered.push(...sortStudentsAlphabetically(byClass.get(cls) || []));
    }
    return ordered;
  }, [scopedStudents, searchTerm]);

  const avgHours = (
    scopedStudents.reduce((acc, s) => acc + s.atHomeHoursThisWeek, 0) / (scopedStudents.length || 1)
  ).toFixed(1);
  const avgAttendance = Math.round(
    scopedStudents.reduce((acc, s) => acc + s.attendancePercent, 0) / (scopedStudents.length || 1)
  );
  const class10Count = students.filter((s) => s.classGrade === 'Class 10-A').length;
  const class9Count = students.filter((s) => s.classGrade === 'Class 9-B').length;

  const confirmRemoveStudent = () => {
    if (!studentToRemove) return;
    removeStudent(studentToRemove.id);
    setStudentToRemove(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              {teacherClass ? `My Class Roster (${teacherClass})` : 'Student Directory & Credentials'}
            </h1>
            {teacherClass ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#6366F1] border border-[#C7D2FE] dark:border-[#3730A3]">
                <Lock className="w-3 h-3" />
                Class Admin • {teacherClass}
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#6366F1] border border-[#C7D2FE] dark:border-[#3730A3]">
                {schoolBoard} Roll Ledger
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ECFDF5] dark:bg-[rgba(16,185,129,0.14)] text-[#059669] dark:text-[#34D399] border border-emerald-200 dark:border-emerald-800/40">
              <ArrowUpDown className="w-3 h-3" />
              Sorted A → Z
            </span>
          </div>
          <p className="text-sm text-[#475569] dark:text-[#94A3B8] mt-0.5">
            {teacherClass
              ? `Add or remove students in ${teacherClass} with automatic A → Z roll sequencing and parent access slips.`
              : 'Manage student records, access passes, at-home study telemetry, and parent credentials.'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#4F46E5] hover:bg-[#3730A3] text-white text-sm font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Student</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCsvModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-[#121826] hover:bg-[#F6F8FC] dark:hover:bg-[#1A2336] text-[#0F172A] dark:text-[#F8FAFC] text-sm font-semibold rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#059669]" />
            <span>Import CSV</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-[#121826] hover:bg-[#F6F8FC] dark:hover:bg-[#1A2336] text-[#0F172A] dark:text-[#F8FAFC] text-sm font-semibold rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#475569]" />
            <span>Batch Print Slips</span>
          </button>
        </div>
      </div>

      {/* Metric Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#121826] p-4 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#EEF2FF] dark:bg-[#1B2440] border border-[#C7D2FE] dark:border-[#3730A3] flex items-center justify-center text-[#4F46E5] dark:text-[#6366F1]">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              {scopedStudents.length}
            </div>
            <div className="text-xs text-[#475569] dark:text-[#94A3B8] font-medium">
              {teacherClass ? `${teacherClass} Strength` : 'Total Registered Students'}
            </div>
          </div>
        </div>

        {teacherClass ? (
          <>
            <div className="bg-white dark:bg-[#121826] p-4 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#ECFDF5] dark:bg-[rgba(16,185,129,0.14)] border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-center text-[#059669] dark:text-[#34D399]">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  {avgAttendance}%
                </div>
                <div className="text-xs text-[#475569] dark:text-[#94A3B8] font-medium">Class Avg Attendance</div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#121826] p-4 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-100 dark:border-cyan-800 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                <ArrowUpDown className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">A → Z</div>
                <div className="text-xs text-[#475569] dark:text-[#94A3B8] font-medium">Auto-Alphabetical Rolls</div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white dark:bg-[#121826] p-4 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-100 dark:border-cyan-800 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                <span className="font-bold text-xs">10-A</span>
              </div>
              <div>
                <div className="text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">{class10Count} Active</div>
                <div className="text-xs text-[#475569] dark:text-[#94A3B8] font-medium">Class 10 Board Section</div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#121826] p-4 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <span className="font-bold text-xs">9-B</span>
              </div>
              <div>
                <div className="text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">{class9Count} Active</div>
                <div className="text-xs text-[#475569] dark:text-[#94A3B8] font-medium">Class 9 Foundation</div>
              </div>
            </div>
          </>
        )}

        <div className="bg-white dark:bg-[#121826] p-4 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#ECFDF5] dark:bg-[rgba(16,185,129,0.14)] border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-center text-[#059669] dark:text-[#34D399]">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">{avgHours}h/wk</div>
            <div className="text-xs text-[#475569] dark:text-[#94A3B8] font-medium">Avg At-Home Study</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#121826] p-4 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student name, ID, roll #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] rounded-lg text-sm text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {teacherClass ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#6366F1] border border-[#C7D2FE] dark:border-[#3730A3] shrink-0">
              <Lock className="w-3.5 h-3.5" />
              Viewing {teacherClass} Only
            </span>
          ) : (
            <>
              <span className="text-xs font-semibold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider flex items-center gap-1 shrink-0">
                <Filter className="w-3.5 h-3.5" /> Class:
              </span>
              {['ALL', ...classOptions].map((cls) => (
                <button
                  key={cls}
                  type="button"
                  onClick={() => setSelectedClass(cls)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    selectedClass === cls
                      ? 'bg-[#4F46E5] dark:bg-[#6366F1] text-white'
                      : 'bg-[#EEF2F7] dark:bg-[#1A2336] text-[#475569] dark:text-[#94A3B8] hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cls === 'ALL' ? 'All Classes' : cls}
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white dark:bg-[#121826] rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#EEF2F7]/80 dark:bg-[#1A2336]/80 border-b border-[#E2E8F0] dark:border-[#232E44] text-[#475569] dark:text-[#94A3B8] text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Roll # (A–Z)</th>
                <th className="py-3 px-4">Student & Permanent ID</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Parent Details</th>
                {canManageFees && <th className="py-3 px-4">Fee Status</th>}
                <th className="py-3 px-4">Home Study & Streak</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#232E44] text-sm">
              {filteredSortedStudents.length === 0 ? (
                <tr>
                  <td colSpan={canManageFees ? 7 : 6} className="py-12 text-center text-[#94A3B8]">
                    No students match your filter or search query.
                  </td>
                </tr>
              ) : (
                filteredSortedStudents.map((s) => {
                  const isFullyPaid = s.totalPending === 0;
                  const alphaPos = alphaPositionByStudentId.get(s.id) || parseInt(s.rollNo, 10) || 1;
                  const displayPos = String(alphaPos).padStart(2, '0');

                  return (
                    <tr
                      key={s.id}
                      className="hover:bg-[#F6F8FC] dark:hover:bg-[#1A2336]/40 transition-colors"
                    >
                      {/* Alphabetical Section Position */}
                      <td className="py-3.5 px-4 font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#EEF2F7] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] text-xs">
                          #{displayPos}
                        </span>
                      </td>

                      {/* Name & Permanent ID Badge */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{s.name}</div>
                        <span className="inline-block whitespace-nowrap mt-0.5 px-1.5 py-0.5 rounded font-mono text-[11px] font-bold bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#6366F1] border border-[#C7D2FE]/60 dark:border-[#3730A3]/60">
                          {s.id}
                        </span>
                      </td>

                      {/* Class */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block whitespace-nowrap px-2 py-1 rounded bg-[#EEF2F7] dark:bg-[#1A2336] text-[#0F172A] dark:text-[#F8FAFC] font-semibold text-xs border border-[#E2E8F0] dark:border-[#232E44]">
                          {s.classGrade}
                        </span>
                      </td>

                      {/* Parent Details */}
                      <td className="py-3.5 px-4">
                        <div className="text-[#0F172A] dark:text-[#F8FAFC] font-medium text-xs">{s.parentName}</div>
                        <div className="text-[#475569] dark:text-[#94A3B8] font-mono text-[11px] flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-[#94A3B8]" />
                          {s.parentPhone}
                        </div>
                      </td>

                      {/* Fee Status (ADM / ACT only — hidden for Class Teachers) */}
                      {canManageFees && (
                        <td className="py-3.5 px-4">
                          {isFullyPaid ? (
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[#ECFDF5] dark:bg-[rgba(16,185,129,0.14)] text-[#059669] dark:text-[#34D399] border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle2 className="w-3 h-3" />
                              All Paid (₹{s.totalPaid.toLocaleString('en-IN')})
                            </div>
                          ) : (
                            <div>
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[#FFFBEB] dark:bg-[rgba(245,158,11,0.14)] text-[#D97706] dark:text-[#FBBF24] border border-amber-200 dark:border-amber-800">
                                <AlertCircle className="w-3 h-3" />
                                ₹{s.totalPending.toLocaleString('en-IN')} Due
                              </div>
                              <div className="text-[11px] text-[#94A3B8] mt-0.5">
                                Paid: ₹{s.totalPaid.toLocaleString('en-IN')} / ₹
                                {s.annualFee.toLocaleString('en-IN')}
                              </div>
                            </div>
                          )}
                        </td>
                      )}

                      {/* Study, Live Roadmap Mastery & Streak */}
                      <td className="py-3.5 px-4">
                        {(() => {
                          const progs = studentProgressList.filter((p) => p.studentId === s.id);
                          const primary = progs[0];
                          const masteryPct = primary
                            ? primary.completionPct
                            : Math.min(95, Math.max(25, Math.round((s.atHomeHoursThisWeek / 8) * 100)));
                          const paceLabel =
                            primary?.paceStatus === 'AUTO_ADJUSTED'
                              ? 'Auto-Adjusted'
                              : primary?.paceStatus === 'HIGH_PACE'
                              ? 'High Pace'
                              : primary?.paceStatus === 'COMPLETED'
                              ? 'Completed'
                              : 'On Track';
                          const paceStyle =
                            primary?.paceStatus === 'AUTO_ADJUSTED' || primary?.paceStatus === 'HIGH_PACE'
                              ? 'bg-[#FFFBEB] dark:bg-[rgba(245,158,11,0.14)] text-[#D97706] dark:text-[#FBBF24] border-amber-200 dark:border-amber-500/30'
                              : 'bg-[#ECFDF5] dark:bg-[rgba(16,185,129,0.14)] text-[#059669] dark:text-[#34D399] border-emerald-200 dark:border-emerald-800/40';

                          return (
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1 text-[#0F172A] dark:text-[#F8FAFC] text-xs font-medium">
                                  <Clock className="w-3.5 h-3.5 text-[#4F46E5] dark:text-[#6366F1]" />
                                  <span>{s.atHomeHoursThisWeek}h</span>
                                </div>
                                <div className="flex items-center gap-1 text-[#D97706] dark:text-[#FBBF24] text-xs font-medium">
                                  <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                  <span>{s.streakDays}d</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#6366F1] border border-[#C7D2FE] dark:border-[#3730A3]">
                                  {masteryPct}% Mastery
                                </span>
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${paceStyle}`}>
                                  {paceLabel}
                                </span>
                              </div>
                            </div>
                          );
                        })()}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedSlipStudent(s)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#EEF2FF] dark:bg-[#1B2440] hover:bg-[#4F46E5] hover:text-white dark:hover:bg-[#6366F1] text-[#4F46E5] dark:text-[#6366F1] font-semibold text-xs transition-colors cursor-pointer"
                            title="Generate Parent Login Pass"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>Login Slip</span>
                          </button>

                          {canManageFees && !isFullyPaid && (
                            <button
                              type="button"
                              onClick={() => setSelectedFeeStudent(s)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#ECFDF5] dark:bg-[rgba(16,185,129,0.14)] hover:bg-[#059669] hover:text-white text-[#059669] dark:text-[#34D399] font-semibold text-xs transition-colors cursor-pointer"
                              title="Collect Cash/Cheque Fee at Desk"
                            >
                              <IndianRupee className="w-3.5 h-3.5" />
                              <span>Collect</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setStudentToRemove(s)}
                            className="inline-flex items-center justify-center p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-600 hover:text-white text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 transition-colors cursor-pointer"
                            title={`Remove ${s.name} from class roster`}
                            aria-label={`Remove ${s.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {selectedSlipStudent && (
        <StudentLoginSlipModal
          student={selectedSlipStudent}
          onClose={() => setSelectedSlipStudent(null)}
        />
      )}

      {canManageFees && selectedFeeStudent && (
        <OfflineFeeModal
          preselectedStudentId={selectedFeeStudent.id}
          onClose={() => setSelectedFeeStudent(null)}
        />
      )}

      {isCsvModalOpen && <CsvImportModal onClose={() => setIsCsvModalOpen(false)} />}

      {isAddModalOpen && (
        <AddStudentModal
          defaultClass={effectiveClass}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}

      {studentToRemove && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setStudentToRemove(null)}
        >
          <div
            className="bg-white dark:bg-[#121826] rounded-2xl shadow-2xl max-w-md w-full border border-[#E2E8F0] dark:border-[#232E44] p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
                  Remove Student from Roster?
                </h3>
                <p className="text-xs text-[#475569] dark:text-[#94A3B8] mt-1 leading-relaxed">
                  Are you sure you want to remove{' '}
                  <strong className="text-[#0F172A] dark:text-[#F8FAFC]">{studentToRemove.name}</strong> (
                  <span className="font-mono">{studentToRemove.id}</span> • {studentToRemove.classGrade})?
                  Roll numbers in {studentToRemove.classGrade} will automatically re-sequence A → Z.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setStudentToRemove(null)}
                className="px-4 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] text-xs font-bold text-[#475569] dark:text-[#94A3B8] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRemoveStudent}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
              >
                Confirm Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
