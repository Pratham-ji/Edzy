import React, { useEffect, useMemo, useState } from 'react';
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
  CheckCheck,
  Lock,
  ArrowUpDown,
} from 'lucide-react';
import { useAdminStore } from '../store/useAdminStore';
import { sortStudentsAlphabetically } from '../lib/idGenerator';
import { getDynamicCampusClasses } from '../lib/classScope';

export const CircularsAttendancePage: React.FC = () => {
  const {
    circulars,
    addCircular,
    students,
    staffList,
    currentStaff,
    attendanceRegister,
    toggleStudentAttendance,
    markAllAttendance,
  } = useAdminStore();

  const isTeacher = currentStaff?.department === 'TCH';
  const lockedClass = isTeacher && currentStaff?.assignedClass ? currentStaff.assignedClass : null;

  const classOptions = useMemo(
    () => getDynamicCampusClasses(students, staffList, lockedClass),
    [students, staffList, lockedClass]
  );

  const [activeSubTab, setActiveSubTab] = useState<'circulars' | 'attendance'>('circulars');

  // Circular form state
  const [title, setTitle] = useState('');
  const [targetClass, setTargetClass] = useState(lockedClass || 'All Classes');
  const [category, setCategory] = useState<'ACADEMIC' | 'EXAM' | 'HOLIDAY' | 'SPORTS' | 'GENERAL'>('ACADEMIC');
  const [author, setAuthor] = useState(
    lockedClass && currentStaff ? `${currentStaff.fullName} (${lockedClass})` : 'Principal Office'
  );
  const [message, setMessage] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // Attendance state
  const [selectedClass, setSelectedClass] = useState<string>(
    lockedClass || classOptions[0] || 'Class 10-A'
  );
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (lockedClass) {
      setSelectedClass(lockedClass);
      setTargetClass(lockedClass);
      if (currentStaff) {
        setAuthor(`${currentStaff.fullName} (${lockedClass})`);
      }
    } else {
      setTargetClass('All Classes');
      setAuthor('Principal Office');
    }
  }, [lockedClass, currentStaff?.id, currentStaff?.fullName]);

  const effectiveClass = lockedClass || selectedClass;
  const effectiveTargetClass = lockedClass || targetClass;

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    addCircular({
      title: title.trim(),
      targetClass: effectiveTargetClass,
      category,
      author: author.trim() || (lockedClass ? currentStaff?.fullName || 'Class Teacher' : 'Principal Office'),
      message: message.trim(),
      attachmentName: attachmentName.trim() || undefined,
    });

    setBroadcastSuccess(true);
    setTitle('');
    setMessage('');
    setAttachmentName('');
    setTimeout(() => setBroadcastSuccess(false), 3500);
  };

  const classRosterSorted = useMemo(
    () => sortStudentsAlphabetically(students.filter((s) => s.classGrade === effectiveClass)),
    [students, effectiveClass]
  );

  const alphaPosByStudentId = useMemo(() => {
    const map = new Map<string, number>();
    classRosterSorted.forEach((stu, idx) => {
      map.set(stu.id, idx + 1);
    });
    return map;
  }, [classRosterSorted]);

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return classRosterSorted;
    return classRosterSorted.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.rollNo.includes(searchQuery) ||
        s.id.toLowerCase().includes(q)
    );
  }, [classRosterSorted, searchQuery]);

  const totalInClass = classRosterSorted.length;
  const presentInClass = classRosterSorted.filter(
    (s) => attendanceRegister[s.id] !== 'ABSENT'
  ).length;
  const absentInClass = totalInClass - presentInClass;
  const classRate = totalInClass > 0 ? Math.round((presentInClass / totalInClass) * 100) : 0;

  const visibleCirculars = useMemo(
    () =>
      lockedClass
        ? circulars.filter(
            (c) => c.targetClass === 'All Classes' || c.targetClass === lockedClass
          )
        : circulars,
    [circulars, lockedClass]
  );

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] dark:border-[#232E44] pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              {lockedClass ? `${lockedClass} Attendance & Circulars` : 'School Circulars & Daily Attendance'}
            </h2>
            {lockedClass && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#6366F1] border border-[#C7D2FE] dark:border-[#3730A3]">
                <Lock className="w-3 h-3" />
                Scoped to {lockedClass}
              </span>
            )}
          </div>
          <p className="text-sm text-[#475569] dark:text-[#94A3B8] mt-0.5">
            {lockedClass
              ? `Mark ${lockedClass} daily register (sorted A → Z) and send circulars directly to your class parents.`
              : 'Broadcast official notices directly to parent mobile apps and track class registers in real time.'}
          </p>
        </div>

        <div className="flex items-center gap-1 bg-[#EEF2F7] dark:bg-[#1A2336]/80 p-1 rounded-xl self-start sm:self-auto border border-[#E2E8F0]/80 dark:border-[#232E44]/60">
          <button
            type="button"
            onClick={() => setActiveSubTab('circulars')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeSubTab === 'circulars'
                ? 'bg-white dark:bg-[#121826] text-[#4F46E5] dark:text-[#6366F1] shadow-sm'
                : 'text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-slate-200'
            }`}
          >
            <Bell className="w-4 h-4" />
            Circular Broadcaster
            <span className="px-2 py-0.5 text-xs rounded-full bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#6366F1] font-bold">
              {visibleCirculars.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('attendance')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeSubTab === 'attendance'
                ? 'bg-white dark:bg-[#121826] text-[#4F46E5] dark:text-[#6366F1] shadow-sm'
                : 'text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-slate-200'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            Daily Attendance Register
            <span
              className={`px-2 py-0.5 text-xs rounded-full font-bold ${
                absentInClass > 0
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                  : 'bg-[#ECFDF5] dark:bg-emerald-950/60 text-[#059669] dark:text-[#34D399]'
              }`}
            >
              {classRate}% Today
            </span>
          </button>
        </div>
      </div>

      {activeSubTab === 'circulars' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Broadcaster Form (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-[#121826] rounded-2xl border border-[#E2E8F0] dark:border-[#232E44] p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#232E44]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#EEF2FF] dark:bg-[#1B2440] flex items-center justify-center text-[#4F46E5] dark:text-[#6366F1]">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] text-base">
                    {lockedClass ? `New ${lockedClass} Circular` : 'New School Circular'}
                  </h3>
                  <p className="text-xs text-[#475569] dark:text-[#94A3B8]">
                    Instant push to Parent Mobile App
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#059669] dark:text-[#34D399] bg-[#ECFDF5] dark:bg-[rgba(16,185,129,0.14)] px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
                <Check className="w-3 h-3" /> Live Channel
              </span>
            </div>

            {broadcastSuccess && (
              <div className="flex items-center gap-2 p-3.5 rounded-xl bg-[#ECFDF5] dark:bg-[rgba(16,185,129,0.14)] border border-emerald-200 dark:border-emerald-800 text-[#059669] dark:text-[#34D399] text-xs font-semibold animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Circular successfully broadcasted to {effectiveTargetClass}! Parent devices updated.
              </div>
            )}

            <form onSubmit={handleBroadcast} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] dark:text-slate-300 mb-1.5">
                  Circular Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Practical Exam Schedule 2026-27"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] bg-white dark:bg-[#1A2336] text-[#0F172A] dark:text-[#F8FAFC] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] dark:text-slate-300 mb-1.5">
                    Target Class
                  </label>
                  {lockedClass ? (
                    <div className="w-full px-3 py-2.5 rounded-xl border border-[#C7D2FE] dark:border-[#3730A3] bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#6366F1] text-xs font-bold flex items-center justify-between">
                      <span>{lockedClass}</span>
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <select
                      value={targetClass}
                      onChange={(e) => setTargetClass(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] bg-white dark:bg-[#1A2336] text-[#0F172A] dark:text-[#F8FAFC] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    >
                      <option value="All Classes">All Classes</option>
                      {classOptions.map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] dark:text-slate-300 mb-1.5">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] bg-white dark:bg-[#1A2336] text-[#0F172A] dark:text-[#F8FAFC] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
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
                  <label className="block text-xs font-semibold text-[#0F172A] dark:text-slate-300 mb-1.5">
                    Issuing Authority
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Principal Office"
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] bg-white dark:bg-[#1A2336] text-[#0F172A] dark:text-[#F8FAFC] text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] dark:text-slate-300 mb-1.5">
                    Attachment (Optional)
                  </label>
                  <input
                    type="text"
                    value={attachmentName}
                    onChange={(e) => setAttachmentName(e.target.value)}
                    placeholder="e.g. Schedule_2026.pdf"
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] bg-white dark:bg-[#1A2336] text-[#0F172A] dark:text-[#F8FAFC] text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] dark:text-slate-300 mb-1.5">
                  Notice Details / Message *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Type official notification body here. Parents receive instant notification in the Edzy mobile app..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] bg-white dark:bg-[#1A2336] text-[#0F172A] dark:text-[#F8FAFC] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#4F46E5] hover:bg-[#3730A3] text-white font-semibold text-sm transition-all shadow-sm cursor-pointer"
              >
                <Send className="w-4 h-4" />
                Publish & Broadcast to {effectiveTargetClass}
              </button>
            </form>
          </div>

          {/* Published Circulars Feed (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
                <span>Active School Notices</span>
                <span className="px-2 py-0.5 rounded-full bg-[#EEF2F7] dark:bg-[#1A2336] text-[#475569] dark:text-[#94A3B8] text-xs font-semibold">
                  {visibleCirculars.length} notices
                </span>
              </h3>
              <p className="text-xs text-[#475569] dark:text-[#94A3B8]">Synchronized with Parent App</p>
            </div>

            <div className="space-y-3">
              {visibleCirculars.length === 0 ? (
                <div className="p-8 rounded-2xl bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] text-center text-xs text-[#475569] dark:text-[#94A3B8]">
                  No school notices published yet. Broadcast your first notice using the form on the left.
                </div>
              ) : (
                visibleCirculars.map((circ) => (
                <div
                  key={circ.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] shadow-sm hover:border-indigo-200 dark:hover:border-indigo-900 transition-all space-y-3"
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
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#EEF2F7] dark:bg-[#1A2336] text-[#0F172A] dark:text-slate-300">
                          {circ.targetClass}
                        </span>
                        <span className="text-xs text-[#94A3B8]">• {circ.date}</span>
                      </div>
                      <h4 className="text-base font-semibold text-[#0F172A] dark:text-[#F8FAFC] pt-1">
                        {circ.title}
                      </h4>
                    </div>
                  </div>

                  <p className="text-sm text-[#475569] dark:text-slate-300 leading-relaxed">
                    {circ.message}
                  </p>

                  <div className="pt-2 flex items-center justify-between border-t border-[#E2E8F0] dark:border-[#232E44]/80 text-xs text-[#475569] dark:text-[#94A3B8]">
                    <span className="font-medium">Issued by: {circ.author}</span>
                    {circ.attachmentName && (
                      <div className="flex items-center gap-1.5 text-[#4F46E5] dark:text-[#6366F1] font-medium bg-[#EEF2FF] dark:bg-[#1B2440] px-2.5 py-1 rounded-lg">
                        <FileText className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[160px]">{circ.attachmentName}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Daily Attendance Register View */
        <div className="space-y-6">
          {/* Top Controls & Metrics Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-[#475569] dark:text-[#94A3B8] tracking-wider">
                  Class Strength
                </p>
                <p className="text-2xl font-bold text-[#0F172A] dark:text-[#F8FAFC] mt-1">{totalInClass}</p>
                <p className="text-xs text-[#475569] dark:text-[#94A3B8] mt-0.5">{effectiveClass}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#EEF2FF] dark:bg-[#1B2440] flex items-center justify-center text-[#4F46E5] dark:text-[#6366F1]">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-[#059669] dark:text-[#34D399] tracking-wider">
                  Present Today
                </p>
                <p className="text-2xl font-bold text-[#059669] dark:text-[#34D399] mt-1">{presentInClass}</p>
                <p className="text-xs text-[#475569] dark:text-[#94A3B8] mt-0.5">Physical / Verified</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#ECFDF5] dark:bg-[rgba(16,185,129,0.14)] flex items-center justify-center text-[#059669] dark:text-[#34D399]">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-rose-600 dark:text-rose-400 tracking-wider">
                  Absent Today
                </p>
                <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{absentInClass}</p>
                <p className="text-xs text-[#475569] dark:text-[#94A3B8] mt-0.5">SMS Notification Sent</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/70 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <XCircle className="w-6 h-6" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-[#4F46E5] dark:text-[#6366F1] tracking-wider">
                  Attendance Rate
                </p>
                <p className="text-2xl font-bold text-[#4F46E5] dark:text-[#6366F1] mt-1">{classRate}%</p>
                <p className="text-xs text-[#475569] dark:text-[#94A3B8] mt-0.5">Daily Goal: &gt;90%</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#EEF2FF] dark:bg-[#1B2440] flex items-center justify-center text-[#4F46E5] dark:text-[#6366F1]">
                <CalendarCheck className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Filter Bar & Quick Actions */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-[#121826] p-4 rounded-2xl border border-[#E2E8F0] dark:border-[#232E44] shadow-sm">
            <div className="flex items-center gap-3 flex-wrap">
              {lockedClass ? (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#EEF2FF] dark:bg-[#1B2440] border border-[#C7D2FE] dark:border-[#3730A3] text-xs font-bold text-[#4F46E5] dark:text-[#6366F1]">
                  <Lock className="w-3.5 h-3.5" />
                  <span>{lockedClass} Register ({totalInClass} Students)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 bg-[#EEF2F7] dark:bg-[#1A2336] p-1 rounded-xl overflow-x-auto">
                  {classOptions.map((cls) => {
                    const count = students.filter((s) => s.classGrade === cls).length;
                    return (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => setSelectedClass(cls)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                          effectiveClass === cls
                            ? 'bg-white dark:bg-[#121826] text-[#4F46E5] dark:text-[#6366F1] shadow-xs'
                            : 'text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-slate-200'
                        }`}
                      >
                        {cls} ({count})
                      </button>
                    );
                  })}
                </div>
              )}

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#ECFDF5] dark:bg-[rgba(16,185,129,0.14)] text-[#059669] dark:text-[#34D399] border border-emerald-200 dark:border-emerald-800/40">
                <ArrowUpDown className="w-3 h-3" />
                A → Z
              </span>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Search student, ID, roll #..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-[#E2E8F0] dark:border-[#232E44] bg-[#F6F8FC] dark:bg-[#1A2336] text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-indigo-500 w-44 sm:w-56"
                />
                <Filter className="w-3.5 h-3.5 text-[#94A3B8] absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-auto">
              <button
                type="button"
                onClick={() => markAllAttendance(effectiveClass, 'PRESENT')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#ECFDF5] dark:bg-[rgba(16,185,129,0.14)] text-[#059669] dark:text-[#34D399] hover:opacity-90 border border-emerald-200 dark:border-emerald-800 transition-all cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark All Present
              </button>
              <button
                type="button"
                onClick={() => markAllAttendance(effectiveClass, 'ABSENT')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 transition-all cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" />
                Mark All Absent
              </button>
            </div>
          </div>

          {/* Register Table */}
          <div className="bg-white dark:bg-[#121826] rounded-2xl border border-[#E2E8F0] dark:border-[#232E44] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-[#EEF2F7]/80 dark:bg-[#1A2336]/80 border-b border-[#E2E8F0] dark:border-[#232E44] text-xs font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider">
                    <th className="py-3 px-4">Roll # (A–Z)</th>
                    <th className="py-3 px-4">Student Name & ID</th>
                    <th className="py-3 px-4">Parent Contact</th>
                    <th className="py-3 px-4">Term Attendance %</th>
                    <th className="py-3 px-4 text-center">Status Today</th>
                    <th className="py-3 px-4 text-right">Quick Toggle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#232E44]">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-xs text-[#475569] dark:text-[#94A3B8]">
                        No students enrolled in {effectiveClass} yet.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((st) => {
                    const isPresent = attendanceRegister[st.id] !== 'ABSENT';
                    const alphaPos = String(alphaPosByStudentId.get(st.id) || st.rollNo).padStart(2, '0');

                    return (
                      <tr
                        key={st.id}
                        className="hover:bg-[#F6F8FC] dark:hover:bg-[#1A2336]/40 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-mono font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                          #{alphaPos}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{st.name}</div>
                          <div className="text-xs text-[#4F46E5] dark:text-[#6366F1] font-mono">{st.id}</div>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-[#475569] dark:text-slate-300">
                          <div className="font-medium text-[#0F172A] dark:text-[#F8FAFC]">{st.parentName}</div>
                          <div className="text-[#94A3B8] font-mono">+91 {st.parentPhone}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC] text-xs">
                              {st.attendancePercent}%
                            </span>
                            <div className="w-16 h-1.5 rounded-full bg-[#EEF2F7] dark:bg-[#1A2336] overflow-hidden">
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
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#ECFDF5] text-[#059669] dark:bg-[rgba(16,185,129,0.14)] dark:text-[#34D399] border border-emerald-200/60 dark:border-emerald-800/60">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Present
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60">
                              <XCircle className="w-3.5 h-3.5" /> Absent
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex rounded-lg border border-[#E2E8F0] dark:border-[#232E44] p-0.5 bg-[#F6F8FC] dark:bg-[#1A2336]">
                            <button
                              type="button"
                              onClick={() => toggleStudentAttendance(st.id, 'PRESENT')}
                              className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                                isPresent
                                  ? 'bg-[#059669] text-white shadow-xs'
                                  : 'text-[#475569] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:text-slate-100'
                              }`}
                            >
                              P
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleStudentAttendance(st.id, 'ABSENT')}
                              className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                                !isPresent
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'text-[#475569] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:text-slate-100'
                              }`}
                            >
                              A
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
        </div>
      )}
    </div>
  );
};
