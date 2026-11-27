import React, { useEffect, useState } from 'react';
import { X, UserPlus, Sparkles, CheckCircle2, Briefcase, AlertTriangle } from 'lucide-react';
import { useAdminStore, SchoolStaff } from '../store/useAdminStore';
import { generateNextEmployeeId, StaffDepartment } from '../lib/idGenerator';
import { CLASS_PICKER_OPTIONS, STAFF_DEPARTMENT_META } from '../lib/classScope';
import StaffActivationCard from './StaffActivationCard';

interface AddStaffModalProps {
  onClose: () => void;
  onCreated?: (staff: SchoolStaff) => void;
}

const DEPARTMENTS: StaffDepartment[] = ['TCH', 'ACT', 'ADM'];

export const AddStaffModal: React.FC<AddStaffModalProps> = ({ onClose, onCreated }) => {
  const { schoolProfile, staffList, addStaffMember } = useAdminStore();

  const [department, setDepartment] = useState<StaffDepartment>('TCH');
  const [fullName, setFullName] = useState('');
  const [designation, setDesignation] = useState(STAFF_DEPARTMENT_META.TCH.defaultDesignation);
  const [designationTouched, setDesignationTouched] = useState(false);
  const [assignedClass, setAssignedClass] = useState('Class 10-A');
  const [customClass, setCustomClass] = useState('');
  const [subject, setSubject] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdStaff, setCreatedStaff] = useState<SchoolStaff | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const previewId = generateNextEmployeeId(
    schoolProfile.code,
    department,
    staffList.map((s) => s.id)
  );

  const handleSelectDepartment = (dept: StaffDepartment) => {
    setDepartment(dept);
    setSubmitError(null);
    if (!designationTouched) {
      setDesignation(STAFF_DEPARTMENT_META[dept].defaultDesignation);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || isSubmitting) return;

    const resolvedClass =
      department === 'TCH'
        ? assignedClass === '__CUSTOM__'
          ? customClass.trim() || 'Class 10-A'
          : assignedClass
        : null;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await addStaffMember({
        fullName: fullName.trim(),
        department,
        designation: designation.trim() || STAFF_DEPARTMENT_META[department].defaultDesignation,
        assignedClass: resolvedClass,
        subject: department === 'TCH' ? subject.trim() || null : null,
        phone: phone.trim() || null,
      });

      if (!result.success || !result.staff) {
        setSubmitError(result.error || 'Could not save staff account. Please retry.');
        return;
      }

      setCreatedStaff(result.staff);
      onCreated?.(result.staff);
    } catch (err: any) {
      setSubmitError(err?.message || 'Unexpected error creating staff account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#121826] rounded-2xl shadow-2xl max-w-xl w-full border border-[#E2E8F0] dark:border-[#232E44] overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="no-print px-6 py-4 bg-white dark:bg-[#0D1320] border-b border-[#E2E8F0] dark:border-[#232E44] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                createdStaff
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-[#059669] dark:text-[#34D399]'
                  : 'bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#6366F1]'
              }`}
            >
              {createdStaff ? <CheckCircle2 className="w-5 h-5" /> : <UserPlus className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
                {createdStaff ? 'Staff Account Issued & Ready' : 'Add Staff Member to Campus ERP'}
              </h2>
              <p className="text-[11px] text-[#475569] dark:text-[#94A3B8]">
                {createdStaff
                  ? `Employee ID ${createdStaff.id} synced to ${schoolProfile.code}`
                  : `Auto-assigns sequential Employee ID for ${schoolProfile.code}`}
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

        <div className="p-6">
          {createdStaff ? (
            <div className="space-y-4">
              <StaffActivationCard
                staff={createdStaff}
                schoolProfile={schoolProfile}
                subtitle="Employee ID created and saved to live staff directory. Send this pass so they can set their own password on first sign-in."
              />
              <div className="no-print pt-2 border-t border-[#E2E8F0] dark:border-[#232E44] flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-[#0F172A] dark:bg-[#1A2336] text-white text-xs font-bold hover:opacity-90 cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Department Role Cards */}
              <div>
                <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-2">
                  1. Select Department Role *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {DEPARTMENTS.map((dept) => {
                    const meta = STAFF_DEPARTMENT_META[dept];
                    const selected = department === dept;
                    return (
                      <button
                        key={dept}
                        type="button"
                        onClick={() => handleSelectDepartment(dept)}
                        className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                          selected
                            ? 'bg-[#EEF2FF] dark:bg-[#1B2440] border-[#4F46E5] dark:border-[#6366F1] ring-1 ring-[#4F46E5]/30'
                            : 'bg-[#F6F8FC] dark:bg-[#1A2336] border-[#E2E8F0] dark:border-[#232E44] hover:border-[#4F46E5]/40'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
                            {meta.label}
                          </span>
                          <span className="font-mono text-[10px] font-bold text-[#4F46E5] dark:text-[#6366F1]">
                            {dept}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#475569] dark:text-[#94A3B8] mt-1 leading-snug">
                          {meta.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live Next Employee ID Preview */}
              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#EEF2FF] dark:bg-[#1B2440] border border-[#C7D2FE] dark:border-[#3730A3]">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#3730A3] dark:text-indigo-200">
                  <Sparkles className="w-4 h-4 text-[#4F46E5] dark:text-[#6366F1]" />
                  <span>Auto-Generated Employee ID</span>
                </div>
                <span className="font-mono text-sm font-extrabold text-[#4F46E5] dark:text-[#6366F1]">
                  {previewId.id}
                </span>
              </div>

              {/* Name & Designation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ms. Priya Nair"
                    className="w-full h-10 px-3 rounded-xl bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                    Designation *
                  </label>
                  <div className="relative">
                    <Briefcase className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={designation}
                      onChange={(e) => {
                        setDesignation(e.target.value);
                        setDesignationTouched(true);
                      }}
                      className="w-full h-10 pl-8 pr-3 rounded-xl bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                    />
                  </div>
                </div>
              </div>

              {/* Class Teacher Assignment */}
              {department === 'TCH' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#F6F8FC] dark:bg-[#1A2336]/60 border border-[#E2E8F0] dark:border-[#232E44]">
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                      Assigned Class (Class Admin) *
                    </label>
                    <select
                      value={assignedClass}
                      onChange={(e) => setAssignedClass(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                    >
                      {CLASS_PICKER_OPTIONS.map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                      <option value="__CUSTOM__">+ Custom Class / Section...</option>
                    </select>
                    {assignedClass === '__CUSTOM__' && (
                      <input
                        type="text"
                        required
                        value={customClass}
                        onChange={(e) => setCustomClass(e.target.value)}
                        placeholder="e.g. Class 10-C"
                        className="mt-2 w-full h-9 px-3 rounded-lg bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC]"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                      Primary Subject (Optional)
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Science & Lab"
                      className="w-full h-10 px-3 rounded-xl bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                    />
                  </div>
                </div>
              )}

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                  WhatsApp / Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="9811234510"
                  className="w-full h-10 px-3 rounded-xl bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-mono text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                />
              </div>

              {submitError && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{submitError}</span>
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
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#3730A3] disabled:opacity-60 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? 'Saving Staff Account...'
                      : `Create Staff Account (${previewId.id})`}
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddStaffModal;
