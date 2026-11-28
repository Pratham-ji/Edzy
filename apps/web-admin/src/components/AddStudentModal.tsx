import React, { useEffect, useState } from 'react';
import {
  X,
  UserPlus,
  Sparkles,
  CheckCircle2,
  Lock,
  KeyRound,
  ArrowUpDown,
} from 'lucide-react';
import { useAdminStore, StudentRecord } from '../store/useAdminStore';
import { generateNextStudentId } from '../lib/idGenerator';
import {
  PRE_PRIMARY_CLASSES,
  compareClassNames,
  getDynamicCampusClasses,
  isPrePrimaryClass,
} from '../lib/classScope';
import StudentLoginSlipModal from './StudentLoginSlipModal';

interface AddStudentModalProps {
  onClose: () => void;
  defaultClass?: string;
  onCreated?: (student: StudentRecord) => void;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  onClose,
  defaultClass,
  onCreated,
}) => {
  const {
    students,
    staffList,
    schoolProfile,
    currentStaff,
    campusConfig,
    addSingleStudent,
  } = useAdminStore();

  const lockedClass =
    currentStaff?.department === 'TCH' && currentStaff.assignedClass
      ? currentStaff.assignedClass
      : null;

  const dynamicClasses = getDynamicCampusClasses(
    students,
    staffList,
    defaultClass,
    campusConfig.customClasses || []
  );
  const classOptions = Array.from(
    new Set([...PRE_PRIMARY_CLASSES.map((c) => `${c}-A`), ...dynamicClasses])
  ).sort(compareClassNames);
  const initialClass =
    lockedClass ||
    (defaultClass && defaultClass !== 'ALL' ? defaultClass : classOptions[0] || 'Class 10-A');

  const suggestFeeForClass = (cls: string) =>
    isPrePrimaryClass(cls)
      ? '28000'
      : cls.includes('10')
      ? '48000'
      : cls.includes('9')
      ? '44000'
      : '32000';

  const [classGrade, setClassGrade] = useState(initialClass);
  const [customClass, setCustomClass] = useState('');
  const [fullName, setFullName] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentPin, setParentPin] = useState('1234');
  const [annualFee, setAnnualFee] = useState(() => suggestFeeForClass(initialClass));
  const [feeTouched, setFeeTouched] = useState(false);

  const [createdStudent, setCreatedStudent] = useState<StudentRecord | null>(null);
  const [slipStudent, setSlipStudent] = useState<StudentRecord | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !slipStudent) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, slipStudent]);

  useEffect(() => {
    if (lockedClass) {
      setClassGrade(lockedClass);
    }
  }, [lockedClass]);

  const resolvedClass =
    lockedClass || (classGrade === '__CUSTOM__' ? customClass.trim() || 'Class 10-A' : classGrade);

  // Suggest peer fee automatically when class changes if user hasn't entered custom fee
  useEffect(() => {
    const peer = students.find((s) => s.classGrade === resolvedClass);
    if (peer?.annualFee) {
      setAnnualFee(String(peer.annualFee));
    }
  }, [resolvedClass, students]);

  const idPreview = generateNextStudentId(
    schoolProfile.code,
    resolvedClass,
    students.map((s) => s.id),
    students
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !parentName.trim() || !parentPhone.trim()) return;

    const cleanPin = (parentPin || '1234').replace(/\D/g, '').slice(0, 4).padEnd(4, '0');
    const feeNumber = Math.max(0, parseInt(annualFee, 10) || 48000);

    const created = addSingleStudent({
      fullName: fullName.trim(),
      classGrade: resolvedClass,
      parentName: parentName.trim(),
      parentPhone: parentPhone.replace(/\D/g, '').slice(0, 10) || parentPhone.trim(),
      parentPin: cleanPin,
      annualFee: feeNumber,
    });

    setCreatedStudent(created);
    onCreated?.(created);
  };

  const handleResetForAnother = () => {
    setCreatedStudent(null);
    setFullName('');
    setParentName('');
    setParentPhone('');
    setParentPin('1234');
  };

  if (slipStudent) {
    return (
      <StudentLoginSlipModal
        student={slipStudent}
        onClose={() => setSlipStudent(null)}
      />
    );
  }

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
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                createdStudent
                  ? 'bg-[#ECFDF5] dark:bg-[rgba(16,185,129,0.14)] text-[#059669] dark:text-[#34D399]'
                  : 'bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#6366F1]'
              }`}
            >
              {createdStudent ? <CheckCircle2 className="w-5 h-5" /> : <UserPlus className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
                {createdStudent ? 'Student Added to Roster' : 'Add Student to Class Roster'}
              </h2>
              <p className="text-[11px] text-[#475569] dark:text-[#94A3B8]">
                {createdStudent
                  ? `Placed alphabetically in ${createdStudent.classGrade}`
                  : `Auto-inserts A → Z & provisions 4 fee quarters`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#475569] dark:text-[#94A3B8] hover:bg-[#EEF2F7] dark:hover:bg-[#1A2336] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {createdStudent ? (
            <div className="space-y-4">
              <div className="rounded-xl bg-[#F6F8FC] dark:bg-[#090D16] border border-[#E2E8F0] dark:border-[#232E44] p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-base font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
                      {createdStudent.name}
                    </div>
                    <div className="text-xs text-[#475569] dark:text-[#94A3B8]">
                      {createdStudent.classGrade} • Guardian: {createdStudent.parentName}
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#6366F1] border border-[#C7D2FE] dark:border-[#3730A3]">
                    <ArrowUpDown className="w-3 h-3" />
                    Roll #{createdStudent.rollNo} (A → Z)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-[#E2E8F0] dark:border-[#232E44] text-xs">
                  <div className="bg-white dark:bg-[#121826] p-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#232E44]">
                    <div className="text-[10px] font-bold uppercase text-[#94A3B8]">Student ID</div>
                    <div className="font-mono font-extrabold text-[#4F46E5] dark:text-[#6366F1] mt-0.5">
                      {createdStudent.id}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-[#121826] p-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#232E44]">
                    <div className="text-[10px] font-bold uppercase text-[#94A3B8]">Parent PIN</div>
                    <div className="font-mono font-extrabold text-[#059669] dark:text-[#34D399] mt-0.5">
                      {createdStudent.parentPin}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-[#121826] p-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#232E44]">
                    <div className="text-[10px] font-bold uppercase text-[#94A3B8]">Annual Fee</div>
                    <div className="font-bold text-[#0F172A] dark:text-[#F8FAFC] mt-0.5">
                      ₹{createdStudent.annualFee.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={() => setSlipStudent(createdStudent)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#3730A3] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>View Parent Login Slip</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetForAnother}
                  className="px-4 py-2.5 rounded-xl bg-[#EEF2F7] dark:bg-[#1A2336] text-[#0F172A] dark:text-[#F8FAFC] text-xs font-bold border border-[#E2E8F0] dark:border-[#232E44] cursor-pointer"
                >
                  Add Another
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-[#0F172A] dark:bg-[#1A2336] text-white text-xs font-bold cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Target Class (Locked for TCH, Selectable for ADM) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                    Class & Section *
                  </label>
                  {lockedClass && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#4F46E5] dark:text-[#6366F1]">
                      <Lock className="w-3 h-3" /> Class Admin Scope
                    </span>
                  )}
                </div>

                {lockedClass ? (
                  <div className="h-10 px-3 rounded-xl bg-[#EEF2FF] dark:bg-[#1B2440] border border-[#C7D2FE] dark:border-[#3730A3] flex items-center justify-between text-xs font-bold text-[#3730A3] dark:text-indigo-200">
                    <span>{lockedClass}</span>
                    <span className="text-[10px] uppercase tracking-wide opacity-80">Locked</span>
                  </div>
                ) : (
                  <>
                    <select
                      value={classGrade}
                      onChange={(e) => {
                        const picked = e.target.value;
                        setClassGrade(picked);
                        if (!feeTouched && picked !== '__CUSTOM__') {
                          setAnnualFee(suggestFeeForClass(picked));
                        }
                      }}
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
                        onChange={(e) => {
                          const nextVal = e.target.value;
                          setCustomClass(nextVal);
                          if (!feeTouched) {
                            setAnnualFee(suggestFeeForClass(nextVal));
                          }
                        }}
                        placeholder="e.g. Nursery-B, Class 8-A, Montessori-1"
                        className="mt-2 w-full h-9 px-3 rounded-lg bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC]"
                      />
                    )}
                  </>
                )}
              </div>

              {/* Live Next Student ID Preview */}
              <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#EEF2FF] dark:bg-[#1B2440] border border-[#C7D2FE] dark:border-[#3730A3]">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#3730A3] dark:text-indigo-200">
                  <Sparkles className="w-4 h-4 text-[#4F46E5] dark:text-[#6366F1]" />
                  <span>Permanent Student ID</span>
                </div>
                <span className="font-mono text-sm font-extrabold text-[#4F46E5] dark:text-[#6366F1]">
                  {idPreview.id}
                </span>
              </div>

              {isPrePrimaryClass(
                lockedClass || (classGrade === '__CUSTOM__' ? customClass : classGrade)
              ) && (
                <div className="p-3 rounded-xl bg-[#ECFDF5] dark:bg-[rgba(16,185,129,0.12)] border border-emerald-200 dark:border-emerald-800/60 text-[11px] font-medium text-emerald-900 dark:text-emerald-200 leading-relaxed">
                  <strong>Pre-Primary Wing (Fee &amp; Circulars Mode):</strong> Parents receive instant fee receipts, daily attendance updates, and school circulars. Study roadmaps &amp; mark sheets stay hidden for Pre-Primary classes.
                </div>
              )}

              {/* Student Name */}
              <div>
                <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                  Student Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Kabir Deshmukh"
                  className="w-full h-10 px-3 rounded-xl bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                />
              </div>

              {/* Parent Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                    Parent / Guardian Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="e.g. Vikram Deshmukh"
                    className="w-full h-10 px-3 rounded-xl bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                    Parent Mobile / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9811234599"
                    className="w-full h-10 px-3 rounded-xl bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-mono text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  />
                </div>
              </div>

              {/* Annual Fee & Initial 4-Digit Parent PIN */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                    Annual Fee (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={500}
                    value={annualFee}
                    onChange={(e) => {
                      setAnnualFee(e.target.value);
                      setFeeTouched(true);
                    }}
                    className="w-full h-10 px-3 rounded-xl bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                    Initial Parent PIN (4 Digits)
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    pattern="\d{4}"
                    value={parentPin}
                    onChange={(e) => setParentPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="w-full h-10 px-3 rounded-xl bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#232E44] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] text-xs font-bold text-[#475569] dark:text-[#94A3B8] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#3730A3] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register Student & Sync</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddStudentModal;
