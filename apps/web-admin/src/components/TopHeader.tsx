import React from 'react';
import {
  Calendar,
  CreditCard,
  FileUp,
  UserPlus,
  Download,
  Sun,
  Moon,
  RefreshCw,
  AlertTriangle,
  X,
  LogOut,
} from 'lucide-react';
import { useAdminStore } from '../store/useAdminStore';
import { formatStaffRoleLabel, getStaffInitials } from '../lib/rbac';

interface TopHeaderProps {
  title: string;
  subtitle: string;
  onOpenFeeModal?: () => void;
  onOpenCsvModal?: () => void;
  onOpenSyllabusModal?: () => void;
  onOpenAddStudentModal?: () => void;
  onExportLedger?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  title,
  subtitle,
  onOpenFeeModal,
  onOpenCsvModal,
  onOpenSyllabusModal,
  onOpenAddStudentModal,
  onExportLedger,
}) => {
  const {
    schoolProfile,
    currentStaff,
    logoutStaff,
    connectionMode,
    themeMode,
    toggleThemeMode,
    isSyncing,
    initializeRealtimeSync,
    syncError,
    setSyncError,
  } = useAdminStore();

  const department = currentStaff?.department || 'ADM';

  return (
    <header className="relative bg-white dark:bg-[#121826] border-b border-[#E2E8F0] dark:border-[#232E44] sticky top-0 z-30 shadow-xs transition-colors">
      {syncError && (
        <div className="bg-red-600 dark:bg-red-700 text-white px-6 py-2 flex items-center justify-between text-xs font-semibold shadow-inner">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-white shrink-0 animate-bounce" aria-hidden="true" />
            <span>Sync Notice: {syncError}</span>
          </div>
          <button
            onClick={() => setSyncError(null)}
            className="p-1 hover:bg-red-800/60 rounded text-white/90 hover:text-white transition"
            title="Dismiss notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      <div className="h-16 px-5 flex items-center justify-between gap-3">
        {/* Title & Context */}
        <div className="min-w-0 flex-1">
          <h1 className="text-sm lg:text-base font-bold text-slate-900 dark:text-[#F8FAFC] leading-tight truncate">
            {title}
          </h1>
          <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] font-medium truncate">
            {subtitle}
          </p>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Role-Filtered Quick Action Buttons */}
          <div className="flex items-center gap-1.5">
            {(department === 'ADM' || department === 'ACT') && onOpenFeeModal && (
              <button
                onClick={onOpenFeeModal}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5 shrink-0" />
                <span>Collect Fee</span>
              </button>
            )}

            {department === 'ADM' && onOpenCsvModal && (
              <button
                onClick={onOpenCsvModal}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5 shrink-0" />
                <span>Import CSV</span>
              </button>
            )}

            {department === 'TCH' && onOpenAddStudentModal && (
              <button
                onClick={onOpenAddStudentModal}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5 shrink-0" />
                <span>Add Student</span>
              </button>
            )}

            {(department === 'ADM' || department === 'TCH') && onOpenSyllabusModal && (
              <button
                onClick={onOpenSyllabusModal}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-cyan-50 dark:bg-cyan-950/60 hover:bg-cyan-100 dark:hover:bg-cyan-900 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer"
              >
                <FileUp className="w-3.5 h-3.5 shrink-0" />
                <span>Upload Syllabus</span>
              </button>
            )}

            {department === 'ACT' && onExportLedger && (
              <button
                onClick={onExportLedger}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 shrink-0" />
                <span>Export Ledger</span>
              </button>
            )}
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleThemeMode}
            title={themeMode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-[#94A3B8] dark:hover:text-slate-100 hover:bg-[#EEF2F7] dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {themeMode === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          <div className="h-5 w-px bg-slate-200 dark:bg-[#1A2336]" />

          {/* Clean Campus Sync Status Indicator */}
          <div className="flex items-center gap-1">
            {connectionMode === 'LIVE_CLOUD' ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 shadow-xs whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span>Cloud Synced</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 shadow-xs whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                <span>Offline Mode</span>
              </div>
            )}

            <button
              onClick={() => initializeRealtimeSync()}
              disabled={isSyncing}
              title={isSyncing ? 'Syncing school records...' : 'Refresh Campus Sync'}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-[#94A3B8] dark:hover:text-slate-100 hover:bg-[#EEF2F7] dark:hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  isSyncing ? 'animate-spin text-emerald-600 dark:text-emerald-400' : ''
                }`}
              />
            </button>
          </div>

          {/* Academic Session Pill (shown on ultra-wide viewports cleanly) */}
          <div className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1 bg-[#EEF2F7] dark:bg-[#1A2336] rounded-full text-[11px] font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
            <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-[#94A3B8]" />
            <span>Session {schoolProfile.session}</span>
          </div>

          {/* Active Staff Profile Chip + Sign Out */}
          {currentStaff && (
            <div className="flex items-center gap-2 pl-2 border-l border-[#E2E8F0] dark:border-[#232E44]">
              <div className="w-8 h-8 rounded-full bg-[#4F46E5] dark:bg-[#6366F1] text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                {getStaffInitials(currentStaff.fullName)}
              </div>
              <div className="hidden xl:block text-left max-w-[148px]">
                <p className="text-xs font-bold text-slate-800 dark:text-[#F8FAFC] leading-none truncate">
                  {currentStaff.fullName}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-[#94A3B8] font-medium mt-0.5 truncate">
                  <span className="font-mono text-[#4F46E5] dark:text-[#6366F1]">{currentStaff.id}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={logoutStaff}
                title={`Sign Out (${formatStaffRoleLabel(currentStaff)})`}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:text-[#94A3B8] dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
