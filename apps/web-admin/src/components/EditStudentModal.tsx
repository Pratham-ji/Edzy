import React, { useEffect, useMemo, useState } from 'react';
import { X, Save, Lock, Sparkles, AlertTriangle, PencilLine } from 'lucide-react';
import { StudentRecord, useAdminStore } from '../store/useAdminStore';
import {
  PRE_PRIMARY_CLASSES,
  compareClassNames,
  getDynamicCampusClasses,
  isPrePrimaryClass,
} from '../lib/classScope';

interface EditStudentModalProps {
  student: StudentRecord;
  onClose: () => void;
  onSaved?: (updated: StudentRecord) => void;
}

export const EditStudentModal: React.FC<EditStudentModalProps> = ({
  student,
  onClose,
  onSaved,
}) => {
  const { students, staffList, campusConfig, currentStaff, updateStudent } = useAdminStore();

  const isPrincipal = currentStaff?.department === 'ADM';
  const isTeacher = currentStaff?.department === 'TCH';
  const lockClassGrade = isTeacher;

  const classOptions = useMemo(() => {
    const dynamic = getDynamicCampusClasses(
      students,
      staffList,
      student.classGrade,
      campusConfig.customClasses || []
    );
    return Array.from(
      new Set([...PRE_PRIMARY_CLASSES.map((c) => `${c}-A`), ...dynamic, student.classGrade])
    ).sort(compareClassNames);
  }, [students, staffList, student.classGrade, campusConfig.customClasses]);

  const [fullName, setFullName] = useState(student.name);
  const [classGrade, setClassGrade] = useState(
    classOptions.includes(student.classGrade) ? student.classGrade : '__CUSTOM__'
  );
  const [customClass, setCustomClass] = useState(
    classOptions.includes(student.classGrade) ? '' : student.classGrade
  );
  const [parentName, setParentName] = useState(student.parentName);
  const [parentPhone, setParentPhone] = useState(student.parentPhone);
  const [parentPin, setParentPin] = useState(student.parentPin || '1234');
  const [annualFee, setAnnualFee] = useState(String(student.annualFee));
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const resolvedClass =
    lockClassGrade
      ? student.classGrade
      : classGrade === '__CUSTOM__'
      ? customClass.trim() || student.classGrade
      : classGrade;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const parsedFee = parseInt(annualFee, 10);
    if (isPrincipal && (isNaN(parsedFee) || parsedFee < 0)) {
      setErrorMsg('Please enter a valid non-negative Annual Tuition Fee.');
      return;
    }

    const res = updateStudent(student.id, {
      fullName: fullName.trim(),
      classGrade: resolvedClass,
      parentName: parentName.trim(),
      parentPhone: parentPhone.trim(),
      parentPin: parentPin.trim() || '1234',
      annualFee: isPrincipal ? parsedFee : student.annualFee,
    });

    if (!res.success || !res.student) {
      setErrorMsg(res.error || 'Could not update student details.');
      return;
    }
    onSaved?.(res.student);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#121826] rounded-2xl shadow-2xl max-w-lg w-full max-h-[92dvh] flex flex-col border border-[#E2E8F0] dark:border-[#232E44] overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-white dark:bg-[#0D1320] border-b border-[#E2E8F0] dark:border-[#232E44] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#6366F1] flex items-center justify-center">
              <PencilLine className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
                Edit Student Profile
              </h2>
              <p className="text-[11px] text-[#475569] dark:text-[#94A3B8]">
                Auto-reorders A → Z roll numbers &amp; syncs live to Parent App
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close edit student dialog"
            className="p-1.5 rounded-lg text-[#475569] dark:text-[#94A3B8] hover:bg-[#EEF2F7] dark:hover:bg-[#1A2336] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Immutable Permanent ID */}
          <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#EEF2FF] dark:bg-[#1B2440] border border-[#C7D2FE] dark:border-[#3730A3]">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#3730A3] dark:text-indigo-200">
              <Sparkles className="w-4 h-4 text-[#4F46E5] dark:text-[#6366F1]" aria-hidden="true" />
              <span>Permanent Student ID</span>
            </div>
            <span className="font-mono text-sm font-extrabold text-[#4F46E5] dark:text-[#6366F1]">
              {student.id}
            </span>
          </div>

          {isPrePrimaryClass(resolvedClass) && (
            <div className="p-3 rounded-xl bg-[#ECFDF5] dark:bg-[rgba(16,185,129,0.12)] border border-emerald-200 dark:border-emerald-800/60 text-[11px] font-medium text-emerald-900 dark:text-emerald-200">
              <strong>Pre-Primary Wing (Fee &amp; Circulars Mode):</strong> Attendance, digital fee receipts, and parent notices stay active without syllabus/exam burden.
            </div>
          )}

          {/* Full Name */}
          <div>
            <label
              htmlFor="edit-stu-name"
              className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1"
            >
              Student Full Name *
            </label>
            <input
              id="edit-stu-name"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
            />
          </div>

          {/* Class / Section */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="edit-stu-class"
                className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]"
              >
                Class &amp; Section *
              </label>
              {lockClassGrade && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#4F46E5] dark:text-[#6366F1]">
                  <Lock className="w-3 h-3" aria-hidden="true" /> Class Admin Scope
                </span>
              )}
            </div>
            {lockClassGrade ? (
              <div className="h-10 px-3 rounded-xl bg-[#EEF2FF] dark:bg-[#1B2440] border border-[#C7D2FE] dark:border-[#3730A3] flex items-center justify-between text-xs font-bold text-[#3730A3] dark:text-indigo-200">
                <span>{student.classGrade}</span>
                <span className="text-[10px] uppercase tracking-wide opacity-80">Locked</span>
              </div>
            ) : (
              <>
                <select
                  id="edit-stu-class"
                  value={classGrade}
                  onChange={(e) => setClassGrade(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                >
                  {classOptions.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                  <option value="__CUSTOM__">+ Other Class / Section...</option>
                </select>
                {classGrade === '__CUSTOM__' && (
                  <input
                    type="text"
                    required
                    value={customClass}
                    onChange={(e) => setCustomClass(e.target.value)}
                    placeholder="e.g. LKG-B, Class 10-C"
                    className="mt-2 w-full h-9 px-3 rounded-lg bg-white dark:bg-[#0D1322] border border-[#4F46E5] text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC]"
                  />
                )}
              </>
            )}
          </div>

          {/* Parent Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="edit-stu-parent"
                className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1"
              >
                Parent / Guardian Name *
              </label>
              <input
                id="edit-stu-parent"
                type="text"
                required
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>
            <div>
              <label
                htmlFor="edit-stu-phone"
                className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1"
              >
                Parent Mobile *
              </label>
              <input
                id="edit-stu-phone"
                type="tel"
                required
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="w-full h-10 px-3 rounded-xl bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-mono text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>
          </div>

          {/* Annual Fee & Parent PIN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="edit-stu-fee"
                  className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]"
                >
                  Annual Fee (₹) *
                </label>
                {!isPrincipal && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                    <Lock className="w-3 h-3" aria-hidden="true" /> Principal Only
                  </span>
                )}
              </div>
              <input
                id="edit-stu-fee"
                type="number"
                min={0}
                step={500}
                disabled={!isPrincipal}
                value={annualFee}
                onChange={(e) => setAnnualFee(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>

            <div>
              <label
                htmlFor="edit-stu-pin"
                className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1"
              >
                Parent PIN (4 Digits)
              </label>
              <input
                id="edit-stu-pin"
                type="text"
                maxLength={4}
                pattern="\d{4}"
                value={parentPin}
                onChange={(e) => setParentPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="w-full h-10 px-3 rounded-xl bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>
          </div>

          {isPrincipal && (
            <p className="text-[11px] text-[#475569] dark:text-[#94A3B8]">
              Existing PAID installments (₹{student.totalPaid.toLocaleString('en-IN')}) stay intact; pending quarters adjust automatically to match the updated Annual Fee.
            </p>
          )}

          {errorMsg && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#232E44] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] text-xs font-bold text-[#475569] dark:text-[#94A3B8] hover:bg-[#EEF2F7] dark:hover:bg-[#1A2336] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#3730A3] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" aria-hidden="true" />
              <span>Save Student Details</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStudentModal;
