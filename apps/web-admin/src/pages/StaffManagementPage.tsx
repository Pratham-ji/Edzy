import React, { useMemo, useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  ShieldCheck,
  GraduationCap,
  Wallet,
  KeyRound,
  Trash2,
  CreditCard,
  X,
  AlertTriangle,
  Phone,
  Pencil,
} from 'lucide-react';
import { useAdminStore, SchoolStaff } from '../store/useAdminStore';
import { StaffDepartment } from '../lib/idGenerator';
import { STAFF_DEPARTMENT_META } from '../lib/classScope';
import AddStaffModal from '../components/AddStaffModal';
import StaffActivationCard from '../components/StaffActivationCard';

type DeptFilter = 'ALL' | StaffDepartment;

export default function StaffManagementPage() {
  const { staffList, currentStaff, schoolProfile, removeStaffMember } = useAdminStore();

  const [deptFilter, setDeptFilter] = useState<DeptFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [staffToEdit, setStaffToEdit] = useState<SchoolStaff | null>(null);
  const [slipStaff, setSlipStaff] = useState<SchoolStaff | null>(null);
  const [staffToRemove, setStaffToRemove] = useState<SchoolStaff | null>(null);

  const metrics = useMemo(() => {
    const active = staffList.filter((s) => s.status === 'ACTIVE');
    return {
      totalActive: active.length,
      teachers: active.filter((s) => s.department === 'TCH').length,
      accounts: active.filter((s) => s.department === 'ACT').length,
      pendingSetup: active.filter((s) => !s.isPasswordSet).length,
    };
  }, [staffList]);

  const filteredStaff = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return staffList.filter((member) => {
      if (deptFilter !== 'ALL' && member.department !== deptFilter) return false;
      if (!q) return true;
      return (
        member.fullName.toLowerCase().includes(q) ||
        member.id.toLowerCase().includes(q) ||
        (member.assignedClass || '').toLowerCase().includes(q) ||
        (member.subject || '').toLowerCase().includes(q) ||
        member.designation.toLowerCase().includes(q)
      );
    });
  }, [staffList, deptFilter, searchQuery]);

  const confirmRemoveStaff = () => {
    if (!staffToRemove || staffToRemove.id === currentStaff?.id) return;
    removeStaffMember(staffToRemove.id);
    setStaffToRemove(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              Principal Staff & Hierarchy Manager
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#6366F1] border border-[#C7D2FE] dark:border-[#3730A3]">
              {schoolProfile.code} Directory
            </span>
          </div>
          <p className="text-sm text-[#475569] dark:text-[#94A3B8] mt-0.5">
            Issue role-scoped Employee IDs for Class Teachers and Accounts Staff with zero-password-leak onboarding cards.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#3730A3] text-white text-sm font-bold shadow-sm transition-colors self-start sm:self-auto cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Staff</span>
        </button>
      </div>

      {/* 4-Card KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#121826] p-4 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] dark:bg-[#1B2440] border border-[#C7D2FE] dark:border-[#3730A3] flex items-center justify-center text-[#4F46E5] dark:text-[#6366F1]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
              {metrics.totalActive}
            </div>
            <div className="text-xs text-[#475569] dark:text-[#94A3B8] font-medium">Total Active Staff</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#121826] p-4 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
              {metrics.teachers}
            </div>
            <div className="text-xs text-[#475569] dark:text-[#94A3B8] font-medium">Teachers (TCH)</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#121826] p-4 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] dark:bg-[rgba(16,185,129,0.14)] border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center text-[#059669] dark:text-[#34D399]">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
              {metrics.accounts}
            </div>
            <div className="text-xs text-[#475569] dark:text-[#94A3B8] font-medium">Accounts Staff (ACT)</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#121826] p-4 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] dark:bg-[rgba(245,158,11,0.14)] border border-amber-200 dark:border-amber-500/30 flex items-center justify-center text-[#D97706] dark:text-[#FBBF24]">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
              {metrics.pendingSetup}
            </div>
            <div className="text-xs text-[#475569] dark:text-[#94A3B8] font-medium">Pending First-Time Setup</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-[#121826] p-4 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 flex-wrap">
          {(
            [
              { id: 'ALL', label: 'All Staff' },
              { id: 'TCH', label: 'Teachers (TCH)' },
              { id: 'ACT', label: 'Accounts (ACT)' },
              { id: 'ADM', label: 'Admins (ADM)' },
            ] as const
          ).map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => setDeptFilter(pill.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                deptFilter === pill.id
                  ? 'bg-[#4F46E5] dark:bg-[#6366F1] text-white'
                  : 'bg-[#EEF2F7] dark:bg-[#1A2336] text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Name, Employee ID, Class..."
            className="w-full pl-9 pr-4 py-2 bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] rounded-lg text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
          />
        </div>
      </div>

      {/* Staff Directory Table */}
      <div className="bg-white dark:bg-[#121826] rounded-2xl border border-[#E2E8F0] dark:border-[#232E44] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#EEF2F7]/80 dark:bg-[#1A2336]/80 border-b border-[#E2E8F0] dark:border-[#232E44] text-[11px] font-bold uppercase tracking-wider text-[#475569] dark:text-[#94A3B8]">
                <th className="py-3.5 px-4">Employee ID</th>
                <th className="py-3.5 px-4">Staff Member</th>
                <th className="py-3.5 px-4">Dept & Role</th>
                <th className="py-3.5 px-4">Assigned Scope</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#232E44] text-xs">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#475569] dark:text-[#94A3B8]">
                    No staff accounts match your filter or search query.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((member) => {
                  const deptMeta = STAFF_DEPARTMENT_META[member.department];
                  const isSelf = member.id === currentStaff?.id;

                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-[#F6F8FC] dark:hover:bg-[#1A2336]/40 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center whitespace-nowrap px-2.5 py-1 rounded-lg font-mono font-extrabold text-xs bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#6366F1] border border-[#C7D2FE] dark:border-[#3730A3]">
                          {member.id}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC] text-sm">
                            {member.fullName}
                          </span>
                          {isSelf && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#6366F1]">
                              You
                            </span>
                          )}
                        </div>
                        {member.phone && (
                          <div className="flex items-center gap-1 text-[11px] font-mono text-[#475569] dark:text-[#94A3B8] mt-0.5">
                            <Phone className="w-3 h-3" />
                            <span>+91 {member.phone}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${deptMeta.badgeClass}`}>
                            {member.department}
                          </span>
                          <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                            {member.designation}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {member.assignedClass ? (
                          <div>
                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#EEF2F7] dark:bg-[#1A2336] text-[#0F172A] dark:text-[#F8FAFC] font-bold border border-[#E2E8F0] dark:border-[#232E44]">
                              {member.assignedClass}
                            </span>
                            {member.subject && (
                              <div className="text-[11px] text-[#475569] dark:text-[#94A3B8] mt-0.5">
                                {member.subject}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-[#475569] dark:text-[#94A3B8] font-medium">
                            {member.department === 'ACT' ? 'Finance & Receipts' : 'All Campus Modules'}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            member.isPasswordSet
                              ? 'bg-[#ECFDF5] dark:bg-[rgba(16,185,129,0.14)] text-[#059669] dark:text-[#34D399] border border-emerald-200 dark:border-emerald-800/50'
                              : 'bg-[#FFFBEB] dark:bg-[rgba(245,158,11,0.14)] text-[#D97706] dark:text-[#FBBF24] border border-amber-200 dark:border-amber-500/30'
                          }`}
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          {member.isPasswordSet ? 'Activated' : 'Pending Self-Setup'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setStaffToEdit(member)}
                            aria-label={`Edit ${member.fullName}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#F6F8FC] dark:bg-[#1A2336] hover:bg-[#EEF2FF] dark:hover:bg-[#1B2440] text-[#0F172A] dark:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#232E44] font-bold text-xs transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSlipStaff(member)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#EEF2FF] dark:bg-[#1B2440] hover:bg-[#4F46E5] hover:text-white dark:hover:bg-[#6366F1] text-[#4F46E5] dark:text-[#6366F1] border border-[#C7D2FE] dark:border-[#3730A3] font-bold text-xs transition-colors cursor-pointer"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Onboarding Slip</span>
                          </button>

                          <button
                            type="button"
                            disabled={isSelf}
                            onClick={() => setStaffToRemove(member)}
                            title={isSelf ? 'Cannot remove currently logged-in Principal' : `Remove ${member.fullName}`}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                              isSelf
                                ? 'bg-[#F6F8FC] dark:bg-[#1A2336] text-[#94A3B8] border-[#E2E8F0] dark:border-[#232E44] opacity-50 cursor-not-allowed'
                                : 'bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-600 hover:text-white text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/50 cursor-pointer'
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
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

      {/* Add / Edit Staff Modal */}
      {isAddModalOpen && <AddStaffModal onClose={() => setIsAddModalOpen(false)} />}
      {staffToEdit && (
        <AddStaffModal
          editingStaff={staffToEdit}
          onClose={() => setStaffToEdit(null)}
        />
      )}

      {/* Staff Activation Card Modal */}
      {slipStaff && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSlipStaff(null)}
        >
          <div
            className="bg-white dark:bg-[#121826] rounded-2xl shadow-2xl max-w-lg w-full border border-[#E2E8F0] dark:border-[#232E44] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="no-print px-6 py-4 bg-white dark:bg-[#0D1320] border-b border-[#E2E8F0] dark:border-[#232E44] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
                  Staff Onboarding Card
                </h3>
                <p className="text-[11px] text-[#475569] dark:text-[#94A3B8]">
                  Employee ID & first-time self-setup pass
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSlipStaff(null)}
                className="p-1.5 rounded-lg text-[#475569] dark:text-[#94A3B8] hover:bg-[#EEF2F7] dark:hover:bg-[#1A2336] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <StaffActivationCard staff={slipStaff} schoolProfile={schoolProfile} />
            </div>
          </div>
        </div>
      )}

      {/* Remove Staff Confirmation Modal */}
      {staffToRemove && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setStaffToRemove(null)}
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
                  Remove Staff Account?
                </h3>
                <p className="text-xs text-[#475569] dark:text-[#94A3B8] mt-1 leading-relaxed">
                  Are you sure you want to remove <strong className="text-[#0F172A] dark:text-[#F8FAFC]">{staffToRemove.fullName}</strong> (
                  <span className="font-mono">{staffToRemove.id}</span>)? Their ERP access will be revoked immediately.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setStaffToRemove(null)}
                className="px-4 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] text-xs font-bold text-[#475569] dark:text-[#94A3B8] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRemoveStaff}
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
