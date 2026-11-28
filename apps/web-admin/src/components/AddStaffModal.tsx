import React, { useEffect, useMemo, useState } from 'react';
import { X, UserPlus, Sparkles, CheckCircle2, AlertTriangle, Save } from 'lucide-react';
import { useAdminStore, SchoolStaff } from '../store/useAdminStore';
import { generateNextEmployeeId, StaffDepartment } from '../lib/idGenerator';
import {
  CLASS_PICKER_OPTIONS,
  STAFF_DEPARTMENT_META,
  compareClassNames,
  getCampusSubjects,
} from '../lib/classScope';
import StaffActivationCard from './StaffActivationCard';
import CustomizableSelect from './CustomizableSelect';

interface AddStaffModalProps {
  onClose: () => void;
  editingStaff?: SchoolStaff | null;
  onCreated?: (staff: SchoolStaff) => void;
  onUpdated?: (staff: SchoolStaff) => void;
}

const DEPARTMENTS: StaffDepartment[] = ['TCH', 'ACT', 'ADM'];
const DESIGNATION_PRESETS: Record<StaffDepartment, string[]> = {
  TCH: [
    'Class Teacher',
    'Senior Subject Teacher',
    'Pre-Primary Educator',
    'PGT Coordinator',
    'TGT Coordinator',
    'PRT Facilitator',
  ],
  ACT: ['Accounts Executive', 'Senior Accounts Officer', 'Bursar / Fee Clerk'],
  ADM: ['Vice Principal', 'Principal', 'ERP Administrator', 'Academic Coordinator'],
};

export const AddStaffModal: React.FC<AddStaffModalProps> = ({
  onClose,
  editingStaff,
  onCreated,
  onUpdated,
}) => {
  const isEditMode = Boolean(editingStaff);
  const { schoolProfile, staffList, campusConfig, addStaffMember, updateStaffMember } =
    useAdminStore();

  const [department, setDepartment] = useState<StaffDepartment>(
    editingStaff?.department || 'TCH'
  );
  const [fullName, setFullName] = useState(editingStaff?.fullName || '');
  const [designation, setDesignation] = useState(
    editingStaff?.designation || STAFF_DEPARTMENT_META.TCH.defaultDesignation
  );
  const [designationTouched, setDesignationTouched] = useState(isEditMode);
  const [assignedClass, setAssignedClass] = useState(
    editingStaff?.assignedClass || 'Class 10-A'
  );
  const [customClass, setCustomClass] = useState('');
  const [subject, setSubject] = useState(editingStaff?.subject || '');
  const [phone, setPhone] = useState(editingStaff?.phone || '');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>(editingStaff?.status || 'ACTIVE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdStaff, setCreatedStaff] = useState<SchoolStaff | null>(null);

  const classOptions = useMemo(() => {
    const merged = new Set([...CLASS_PICKER_OPTIONS, ...(campusConfig.customClasses || [])]);
    if (editingStaff?.assignedClass?.trim()) merged.add(editingStaff.assignedClass.trim());
    return Array.from(merged).sort(compareClassNames);
  }, [campusConfig.customClasses, editingStaff?.assignedClass]);

  const subjectOptions = useMemo(() => {
    return ['Pre-Primary All Activities', ...getCampusSubjects(campusConfig)];
  }, [campusConfig]);

  useEffect(() => {
    if (editingStaff) {
      setDepartment(editingStaff.department);
      setFullName(editingStaff.fullName);
      setDesignation(editingStaff.designation);
      setDesignationTouched(true);
      setAssignedClass(editingStaff.assignedClass || 'Class 10-A');
      setSubject(editingStaff.subject || '');
      setPhone(editingStaff.phone || '');
      setStatus(editingStaff.status);
    }
  }, [editingStaff]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const previewId = editingStaff
    ? { id: editingStaff.id, serial: editingStaff.employeeSerial }
    : generateNextEmployeeId(
        schoolProfile.code,
        department,
        staffList.map((s) => s.id)
      );

  const handleSelectDepartment = (dept: StaffDepartment) => {
    if (isEditMode) return;
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
      if (isEditMode && editingStaff) {
        const res = await updateStaffMember(editingStaff.id, {
          fullName: fullName.trim(),
          designation: designation.trim() || STAFF_DEPARTMENT_META[department].defaultDesignation,
          assignedClass: resolvedClass,
          subject: department === 'TCH' ? subject.trim() || null : null,
          phone: phone.trim() || null,
          status,
        });
        if (!res.success || !res.staff) {
          setSubmitError(res.error || 'Could not update staff account.');
          return;
        }
        onUpdated?.(res.staff);
        onClose();
        return;
      }

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
      setSubmitError(err?.message || 'Unexpected error saving staff account.');
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
                {createdStaff
                  ? 'Staff Account Issued & Ready'
                  : isEditMode
                  ? `Edit Staff Profile (${editingStaff?.id})`
                  : 'Add Staff Member to Campus ERP'}
              </h2>
              <p className="text-[11px] text-[#475569] dark:text-[#94A3B8]">
                {createdStaff
                  ? `Employee ID ${createdStaff.id} synced to ${schoolProfile.code}`
                  : isEditMode
                  ? `Update name, designation, assigned class or subject for ${schoolProfile.code}`
                  : `Auto-assigns sequential Employee ID for ${schoolProfile.code}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close staff modal"
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
              {!isEditMode ? (
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
              ) : (
                <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#EEF2FF] dark:bg-[#1B2440] border border-[#C7D2FE] dark:border-[#3730A3]">
                  <span className="text-xs font-bold text-[#3730A3] dark:text-indigo-200">
                    Department: {STAFF_DEPARTMENT_META[department].label} ({department})
                  </span>
                  <span className="font-mono text-xs font-extrabold text-[#4F46E5] dark:text-[#6366F1]">
                    ID Locked: {previewId.id}
                  </span>
                </div>
              )}

              {/* Live Next Employee ID Preview */}
              {!isEditMode && (
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#EEF2FF] dark:bg-[#1B2440] border border-[#C7D2FE] dark:border-[#3730A3]">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#3730A3] dark:text-indigo-200">
                    <Sparkles className="w-4 h-4 text-[#4F46E5] dark:text-[#6366F1]" />
                    <span>Auto-Generated Employee ID</span>
                  </div>
                  <span className="font-mono text-sm font-extrabold text-[#4F46E5] dark:text-[#6366F1]">
                    {previewId.id}
                  </span>
                </div>
              )}

              {/* Name & Designation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                <div>
                  <label
                    htmlFor="staff-full-name"
                    className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5"
                  >
                    Full Name *
                  </label>
                  <input
                    id="staff-full-name"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ms. Priya Nair"
                    className="w-full h-10 px-3 rounded-xl bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  />
                </div>

                <CustomizableSelect
                  id="staff-designation"
                  name="designation"
                  label={
                    <span className="text-xs font-bold normal-case tracking-normal text-[#0F172A] dark:text-[#F8FAFC]">
                      Designation *
                    </span>
                  }
                  value={designation}
                  onChange={(nextVal) => {
                    setDesignation(nextVal);
                    setDesignationTouched(true);
                  }}
                  options={DESIGNATION_PRESETS[department]}
                  customOptionLabel="Other Designation (Specify)..."
                  customPlaceholder="e.g. Pre-Primary Coordinator"
                  required
                  selectClassName="w-full h-10 px-3 rounded-xl bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  inputClassName="w-full h-9 px-3 rounded-lg bg-white dark:bg-[#0D1322] border border-[#4F46E5] dark:border-[#6366F1] text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC]"
                />
              </div>

              {/* Class Teacher Assignment */}
              {department === 'TCH' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#F6F8FC] dark:bg-[#1A2336]/60 border border-[#E2E8F0] dark:border-[#232E44] items-start">
                  <div>
                    <label
                      htmlFor="staff-assigned-class"
                      className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5"
                    >
                      Assigned Class (Class Admin) *
                    </label>
                    <select
                      id="staff-assigned-class"
                      value={assignedClass}
                      onChange={(e) => setAssignedClass(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                    >
                      {classOptions.map((cls) => (
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
                        placeholder="e.g. Nursery-B, Class 10-C"
                        className="mt-2 w-full h-9 px-3 rounded-lg bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC]"
                      />
                    )}
                  </div>

                  <CustomizableSelect
                    id="staff-subject"
                    name="subject"
                    label={
                      <span className="text-xs font-bold normal-case tracking-normal text-[#0F172A] dark:text-[#F8FAFC]">
                        Primary Subject (Optional)
                      </span>
                    }
                    value={subject}
                    onChange={setSubject}
                    options={subjectOptions}
                    customOptionLabel="Other Subject (Specify)..."
                    customPlaceholder="e.g. Sanskrit / Craft & Storytelling"
                    selectClassName="w-full h-10 px-3 rounded-xl bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                    inputClassName="w-full h-9 px-3 rounded-lg bg-white dark:bg-[#0D1322] border border-[#4F46E5] dark:border-[#6366F1] text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC]"
                  />
                </div>
              )}

              {/* Phone & Status */}
              <div className={`grid gap-3 ${isEditMode ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                <div>
                  <label
                    htmlFor="staff-phone"
                    className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1"
                  >
                    WhatsApp / Phone Number (Optional)
                  </label>
                  <input
                    id="staff-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9811234510"
                    className="w-full h-10 px-3 rounded-xl bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-mono text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  />
                </div>

                {isEditMode && (
                  <div>
                    <label
                      htmlFor="staff-status"
                      className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1"
                    >
                      Account Status
                    </label>
                    <select
                      id="staff-status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
                      className="w-full h-10 px-3 rounded-xl bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>
                )}
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
                  {isEditMode ? <Save className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  <span>
                    {isSubmitting
                      ? 'Saving Changes...'
                      : isEditMode
                      ? `Save Staff Profile (${previewId.id})`
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
