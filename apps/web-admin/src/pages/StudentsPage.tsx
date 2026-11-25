import React, { useState } from 'react';
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
} from 'lucide-react';
import { useAdminStore, StudentRecord } from '../store/useAdminStore';
import StudentLoginSlipModal from '../components/StudentLoginSlipModal';
import OfflineFeeModal from '../components/OfflineFeeModal';
import CsvImportModal from '../components/CsvImportModal';

export default function StudentsPage() {
  const { students, feeInstallments, schoolProfile, studentProgressList } = useAdminStore();
  const schoolBoard = (schoolProfile.board || 'CBSE').split(' ')[0].toUpperCase();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');

  // Modals state
  const [selectedSlipStudent, setSelectedSlipStudent] = useState<StudentRecord | null>(null);
  const [selectedFeeStudent, setSelectedFeeStudent] = useState<StudentRecord | null>(null);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.rollNo.includes(searchTerm) ||
      s.parentPhone.includes(searchTerm);

    const matchesClass = selectedClass === 'ALL' || s.classGrade === selectedClass;

    return matchesSearch && matchesClass;
  });

  const class10Count = students.filter((s) => s.classGrade === 'Class 10-A').length;
  const class9Count = students.filter((s) => s.classGrade === 'Class 9-B').length;
  const avgHours = (
    students.reduce((acc, s) => acc + s.atHomeHoursThisWeek, 0) / (students.length || 1)
  ).toFixed(1);

  const handlePrintAll = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-[#F8FAFC]">Student Directory & Credentials</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#6366F1] border border-[#C7D2FE] dark:border-[#3730A3]">
              {schoolBoard} Roll Ledger
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-[#94A3B8] mt-0.5">
            Manage student records, access passes, at-home study telemetry, and parent credentials.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsCsvModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-[#121826] hover:bg-[#F6F8FC] dark:hover:bg-slate-800 text-slate-700 dark:text-[#F8FAFC] text-sm font-semibold rounded-lg border border-slate-300 dark:border-[#232E44] shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={handlePrintAll}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-[#121826] hover:bg-[#F6F8FC] dark:hover:bg-slate-800 text-slate-700 dark:text-[#F8FAFC] text-sm font-semibold rounded-lg border border-slate-300 dark:border-[#232E44] shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Batch Print Slips</span>
          </button>
        </div>
      </div>

      {/* Metric Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#121826] p-4 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 dark:text-[#F8FAFC]">{students.length}</div>
            <div className="text-xs text-slate-500 dark:text-[#94A3B8] font-medium">Total Registered Students</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#121826] p-4 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-100 dark:border-cyan-800 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
            <span className="font-bold text-xs">10-A</span>
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 dark:text-[#F8FAFC]">{class10Count} Active</div>
            <div className="text-xs text-slate-500 dark:text-[#94A3B8] font-medium">Class 10 Board Section</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#121826] p-4 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <span className="font-bold text-xs">9-B</span>
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 dark:text-[#F8FAFC]">{class9Count} Active</div>
            <div className="text-xs text-slate-500 dark:text-[#94A3B8] font-medium">Class 9 Foundation</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#121826] p-4 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 dark:text-[#F8FAFC]">{avgHours}h/wk</div>
            <div className="text-xs text-slate-500 dark:text-[#94A3B8] font-medium">Avg At-Home Study</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#121826] p-4 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student, roll #, parent phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] rounded-lg text-sm text-slate-800 dark:text-[#F8FAFC] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Class:
          </span>
          {['ALL', 'Class 10-A', 'Class 9-B'].map((cls) => (
            <button
              key={cls}
              onClick={() => setSelectedClass(cls)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedClass === cls
                  ? 'bg-slate-900 dark:bg-indigo-600 text-white'
                  : 'bg-[#EEF2F7] dark:bg-[#1A2336] text-slate-600 dark:text-[#94A3B8] hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cls === 'ALL' ? 'All Classes' : cls}
            </button>
          ))}
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white dark:bg-[#121826] rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#EEF2F7]/80 dark:bg-[#1A2336]/80 border-b border-[#E2E8F0] dark:border-[#232E44] text-slate-600 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Roll #</th>
                <th className="py-3 px-4">Student & ID</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Parent Details</th>
                <th className="py-3 px-4">Fee Status</th>
                <th className="py-3 px-4">Home Study & Streak</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#232E44] text-sm">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No students match your filter or search query.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => {
                  const isFullyPaid = s.totalPending === 0;

                  return (
                    <tr
                      key={s.id}
                      className="hover:bg-[#F6F8FC] dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Roll Number */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                        #{s.rollNo}
                      </td>

                      {/* Name & ID */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-[#F8FAFC]">
                              {s.name}
                            </div>
                            <div className="font-mono text-xs text-slate-400">{s.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Class */}
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-1 rounded bg-[#EEF2F7] dark:bg-[#1A2336] text-slate-700 dark:text-slate-300 font-semibold text-xs border border-[#E2E8F0] dark:border-[#232E44]">
                          {s.classGrade}
                        </span>
                      </td>

                      {/* Parent Details */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 dark:text-[#F8FAFC] font-medium text-xs">{s.parentName}</div>
                        <div className="text-slate-500 dark:text-[#94A3B8] font-mono text-[11px] flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {s.parentPhone}
                        </div>
                      </td>

                      {/* Fee Status */}
                      <td className="py-3.5 px-4">
                        {isFullyPaid ? (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            All Paid (₹{s.totalPaid.toLocaleString('en-IN')})
                          </div>
                        ) : (
                          <div>
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                              <AlertCircle className="w-3 h-3" />
                              ₹{s.totalPending.toLocaleString('en-IN')} Due
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              Paid: ₹{s.totalPaid.toLocaleString('en-IN')} / ₹
                              {s.annualFee.toLocaleString('en-IN')}
                            </div>
                          </div>
                        )}
                      </td>

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
                            onClick={() => setSelectedSlipStudent(s)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-semibold text-xs transition-colors"
                            title="Generate Parent Login Pass"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>Login Slip</span>
                          </button>

                          {!isFullyPaid && (
                            <button
                              onClick={() => setSelectedFeeStudent(s)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-semibold text-xs transition-colors"
                              title="Collect Cash/Cheque Fee at Desk"
                            >
                              <IndianRupee className="w-3.5 h-3.5" />
                              <span>Collect</span>
                            </button>
                          )}
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

      {selectedFeeStudent && (
        <OfflineFeeModal
          preselectedStudentId={selectedFeeStudent.id}
          onClose={() => setSelectedFeeStudent(null)}
        />
      )}

      {isCsvModalOpen && <CsvImportModal onClose={() => setIsCsvModalOpen(false)} />}
    </div>
  );
}
