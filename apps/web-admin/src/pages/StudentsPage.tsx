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
  Sparkles,
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
  const { students, feeInstallments } = useAdminStore();
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
            <h1 className="text-2xl font-bold text-slate-900">Student Directory & Credentials</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              CBSE Roll Ledger
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage student records, access passes, at-home study telemetry, and parent credentials.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsCsvModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg border border-slate-300 shadow-sm transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={handlePrintAll}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg border border-slate-300 shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Batch Print Slips</span>
          </button>
        </div>
      </div>

      {/* Metric Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">{students.length}</div>
            <div className="text-xs text-slate-500 font-medium">Total Registered Students</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600">
            <span className="font-bold text-xs">10-A</span>
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">{class10Count} Active</div>
            <div className="text-xs text-slate-500 font-medium">Class 10 Board Section</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <span className="font-bold text-xs">9-B</span>
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">{class9Count} Active</div>
            <div className="text-xs text-slate-500 font-medium">Class 9 Foundation</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">{avgHours}h/wk</div>
            <div className="text-xs text-slate-500 font-medium">Avg At-Home Study</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student, roll #, parent phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
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
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cls === 'ALL' ? 'All Classes' : cls}
            </button>
          ))}
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Roll #</th>
                <th className="py-3 px-4">Student & ID</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Parent Details</th>
                <th className="py-3 px-4">Fee Status</th>
                <th className="py-3 px-4">Home Study & Streak</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No students match your filter or search query.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => {
                  const isAarav = s.id === 'SCH-2026-0104';
                  const isFullyPaid = s.totalPending === 0;

                  return (
                    <tr
                      key={s.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isAarav ? 'bg-indigo-50/20' : ''
                      }`}
                    >
                      {/* Roll Number */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        #{s.rollNo}
                      </td>

                      {/* Name & ID */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                              {s.name}
                              {isAarav && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
                                  <Sparkles className="w-2.5 h-2.5" /> Flagship
                                </span>
                              )}
                            </div>
                            <div className="font-mono text-xs text-slate-400">{s.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Class */}
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-1 rounded bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200">
                          {s.classGrade}
                        </span>
                      </td>

                      {/* Parent Details */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 font-medium text-xs">{s.parentName}</div>
                        <div className="text-slate-500 font-mono text-[11px] flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {s.parentPhone}
                        </div>
                      </td>

                      {/* Fee Status */}
                      <td className="py-3.5 px-4">
                        {isFullyPaid ? (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            All Paid (₹{s.totalPaid.toLocaleString('en-IN')})
                          </div>
                        ) : (
                          <div>
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
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

                      {/* Study & Streak */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-slate-700 text-xs font-medium">
                            <Clock className="w-3.5 h-3.5 text-indigo-500" />
                            <span>{s.atHomeHoursThisWeek}h</span>
                          </div>
                          <div className="flex items-center gap-1 text-amber-600 text-xs font-medium">
                            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            <span>{s.streakDays}d streak</span>
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedSlipStudent(s)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs transition-colors"
                            title="Generate Parent Login Pass"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>Login Slip</span>
                          </button>

                          {!isFullyPaid && (
                            <button
                              onClick={() => setSelectedFeeStudent(s)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs transition-colors"
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
