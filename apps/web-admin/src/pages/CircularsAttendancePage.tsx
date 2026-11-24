import React, { useState } from 'react';
import {
  Bell,
  CalendarCheck,
  Send,
  FileText,
  CheckCircle2,
  XCircle,
  Users,
  Check,
  Filter,
  Download,
  AlertCircle,
  CheckCheck,
} from 'lucide-react';
import { useAdminStore } from '../store/useAdminStore';

export const CircularsAttendancePage: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'circulars' | 'attendance'>('circulars');

  // Circular form state
  const [title, setTitle] = useState('');
  const [targetClass, setTargetClass] = useState('All Classes');
  const [category, setCategory] = useState<'ACADEMIC' | 'EXAM' | 'HOLIDAY' | 'SPORTS' | 'GENERAL'>('ACADEMIC');
  const [author, setAuthor] = useState('Principal Office');
  const [message, setMessage] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // Attendance state
  const [selectedClass, setSelectedClass] = useState<'Class 10-A' | 'Class 9-B'>('Class 10-A');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    circulars,
    addCircular,
    students,
    attendanceRegister,
    toggleStudentAttendance,
    markAllAttendance,
  } = useAdminStore();

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    addCircular({
      title: title.trim(),
      targetClass,
      category,
      author: author.trim() || 'Principal Office',
      message: message.trim(),
      attachmentName: attachmentName.trim() || undefined,
    });

    setBroadcastSuccess(true);
    setTitle('');
    setMessage('');
    setAttachmentName('');
    setTimeout(() => setBroadcastSuccess(false), 3500);
  };

  const filteredStudents = students
    .filter((s) => s.classGrade === selectedClass)
    .filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.rollNo.includes(searchQuery));

  const totalInClass = students.filter((s) => s.classGrade === selectedClass).length;
  const presentInClass = students
    .filter((s) => s.classGrade === selectedClass)
    .filter((s) => attendanceRegister[s.id] !== 'ABSENT').length;
  const absentInClass = totalInClass - presentInClass;
  const classRate = totalInClass > 0 ? Math.round((presentInClass / totalInClass) * 100) : 0;

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'EXAM':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'SPORTS':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'HOLIDAY':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'ACADEMIC':
      default:
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Segment Controller */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            School Circulars & Daily Attendance
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Broadcast official notices directly to parent mobile apps and track class registers in real time.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl self-start sm:self-auto border border-slate-200/80 dark:border-slate-700/60">
          <button
            onClick={() => setActiveSubTab('circulars')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeSubTab === 'circulars'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Bell className="w-4 h-4" />
            Circular Broadcaster
            <span className="px-2 py-0.5 text-xs rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 font-bold">
              {circulars.length}
            </span>
          </button>
          <button
            onClick={() => setActiveSubTab('attendance')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeSubTab === 'attendance'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            Daily Attendance Register
            <span className={`px-2 py-0.5 text-xs rounded-full font-bold ${
              absentInClass > 0
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
            }`}>
              {classRate}% Today
            </span>
          </button>
        </div>
      </div>

      {activeSubTab === 'circulars' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Broadcaster Form (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base">New School Circular</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Instant push to Parent Mobile App</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
                <Check className="w-3 h-3" /> Live Channel
              </span>
            </div>

            {broadcastSuccess && (
              <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                Circular successfully broadcasted! Parent devices updated.
              </div>
            )}

            <form onSubmit={handleBroadcast} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Circular Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CBSE Practical Exam Schedule 2026-27"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Target Class
                  </label>
                  <select
                    value={targetClass}
                    onChange={(e) => setTargetClass(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="All Classes">All Classes</option>
                    <option value="Class 10-A">Class 10-A</option>
                    <option value="Class 9-B">Class 9-B</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="ACADEMIC">Academic</option>
                    <option value="EXAM">Examination</option>
                    <option value="HOLIDAY">Holiday Notice</option>
                    <option value="SPORTS">Sports & Events</option>
                    <option value="GENERAL">General Notice</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Issuing Authority
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Principal Office"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Attachment (Optional)
                  </label>
                  <input
                    type="text"
                    value={attachmentName}
                    onChange={(e) => setAttachmentName(e.target.value)}
                    placeholder="e.g. Schedule_2026.pdf"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Notice Details / Message *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Type official notification body here. Parents receive instant notification in the Edzy mobile app..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all shadow-sm shadow-indigo-200 dark:shadow-none hover:shadow"
              >
                <Send className="w-4 h-4" />
                Publish & Broadcast to Parents
              </button>
            </form>
          </div>

          {/* Published Circulars Feed (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Active School Notices</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold">
                  {circulars.length} notices
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Synchronized with Parent App</p>
            </div>

            <div className="space-y-3">
              {circulars.map((circ) => (
                <div
                  key={circ.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-200 dark:hover:border-indigo-900 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getCategoryBadge(
                            circ.category
                          )}`}
                        >
                          {circ.category}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {circ.targetClass}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500">• {circ.date}</span>
                      </div>
                      <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100 pt-1">
                        {circ.title}
                      </h4>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {circ.message}
                  </p>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-medium">Issued by: {circ.author}</span>
                    {circ.attachmentName && (
                      <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg">
                        <FileText className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[160px]">{circ.attachmentName}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Daily Attendance Register View */
        <div className="space-y-6">
          {/* Top Controls & Metrics Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  Class Strength
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{totalInClass}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{selectedClass}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">
                  Present Today
                </p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{presentInClass}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Physical / Verified</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-rose-600 dark:text-rose-400 tracking-wider">
                  Absent Today
                </p>
                <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{absentInClass}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">SMS Notification Sent</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/70 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <XCircle className="w-6 h-6" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">
                  Attendance Rate
                </p>
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">{classRate}%</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Daily Goal: &gt;90%</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <CalendarCheck className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Filter Bar & Quick Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => setSelectedClass('Class 10-A')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedClass === 'Class 10-A'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Class 10-A (8 Students)
                </button>
                <button
                  onClick={() => setSelectedClass('Class 9-B')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedClass === 'Class 9-B'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Class 9-B (7 Students)
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Search student or roll #..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-44 sm:w-56"
                />
                <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => markAllAttendance(selectedClass, 'PRESENT')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 transition-all"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark All Present
              </button>
              <button
                onClick={() => markAllAttendance(selectedClass, 'ABSENT')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 transition-all"
              >
                <XCircle className="w-3.5 h-3.5" />
                Mark All Absent
              </button>
            </div>
          </div>

          {/* Register Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Roll #</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Parent Contact</th>
                    <th className="py-3 px-4">Term Attendance %</th>
                    <th className="py-3 px-4 text-center">Status Today</th>
                    <th className="py-3 px-4 text-right">Quick Toggle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredStudents.map((st) => {
                    const isPresent = attendanceRegister[st.id] !== 'ABSENT';

                    return (
                      <tr
                        key={st.id}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-mono font-semibold text-slate-900 dark:text-slate-100">
                          #{st.rollNo}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900 dark:text-slate-100">{st.name}</div>
                          <div className="text-xs text-slate-400 font-mono">{st.id}</div>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300">
                          <div className="font-medium text-slate-800 dark:text-slate-200">{st.parentName}</div>
                          <div className="text-slate-400 font-mono">+91 {st.parentPhone}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                              {st.attendancePercent}%
                            </span>
                            <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  st.attendancePercent >= 90
                                    ? 'bg-emerald-500'
                                    : st.attendancePercent >= 75
                                    ? 'bg-indigo-500'
                                    : 'bg-rose-500'
                                }`}
                                style={{ width: `${st.attendancePercent}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {isPresent ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Present
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60">
                              <XCircle className="w-3.5 h-3.5" /> Absent
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800">
                            <button
                              type="button"
                              onClick={() => toggleStudentAttendance(st.id, 'PRESENT')}
                              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                                isPresent
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                              }`}
                            >
                              P
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleStudentAttendance(st.id, 'ABSENT')}
                              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                                !isPresent
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                              }`}
                            >
                              A
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
