import React, { useEffect, useRef, useState } from 'react';
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
  Menu,
  Plus,
} from 'lucide-react';
import { useAdminStore } from '../store/useAdminStore';
import { formatStaffRoleLabel, getStaffInitials } from '../lib/rbac';

interface TopHeaderProps {
  title: string;
  mobileTitle?: string;
  subtitle: string;
  onOpenMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
  mobileDrawerId?: string;
  onOpenFeeModal?: () => void;
  onOpenCsvModal?: () => void;
  onOpenSyllabusModal?: () => void;
  onOpenAddStudentModal?: () => void;
  onExportLedger?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  title,
  mobileTitle,
  subtitle,
  onOpenMobileMenu,
  isMobileMenuOpen = false,
  mobileDrawerId = 'erp-mobile-drawer',
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

  const [quickMenuOpen, setQuickMenuOpen] = useState(false);
  const quickMenuRef = useRef<HTMLDivElement | null>(null);
  const department = currentStaff?.department || 'ADM';

  useEffect(() => {
    if (!quickMenuOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (quickMenuRef.current && !quickMenuRef.current.contains(e.target as Node)) {
        setQuickMenuOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setQuickMenuOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    window.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [quickMenuOpen]);

  const hasQuickActions = Boolean(
    ((department === 'ADM' || department === 'ACT') && onOpenFeeModal) ||
      (department === 'ADM' && onOpenCsvModal) ||
      (department === 'TCH' && onOpenAddStudentModal) ||
      ((department === 'ADM' || department === 'TCH') && onOpenSyllabusModal) ||
      (department === 'ACT' && onExportLedger)
  );

  return (
    <header className="relative bg-white/95 dark:bg-[#121826]/95 backdrop-blur-md border-b border-[#E2E8F0] dark:border-[#232E44] sticky top-0 lg:static z-30 shadow-xs transition-colors">
      {syncError && (
        <div className="bg-red-600 dark:bg-red-700 text-white px-4 sm:px-6 py-2 flex items-center justify-between gap-2 text-xs font-semibold shadow-inner">
          <div className="flex items-center gap-2 min-w-0">
            <AlertTriangle className="w-4 h-4 text-white shrink-0 animate-bounce" aria-hidden="true" />
            <span className="truncate">Sync Notice: {syncError}</span>
          </div>
          <button
            type="button"
            onClick={() => setSyncError(null)}
            className="p-1 hover:bg-red-800/60 rounded text-white/90 hover:text-white transition shrink-0"
            aria-label="Dismiss sync notice"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}

      <div className="h-14 sm:h-16 px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-3">
        {/* Left: Mobile Hamburger + Title & Context */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          {onOpenMobileMenu && (
            <button
              type="button"
              onClick={onOpenMobileMenu}
              aria-label="Open navigation menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls={mobileDrawerId}
              className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] text-slate-700 dark:text-slate-200 hover:bg-[#EEF2FF] hover:text-[#4F46E5] transition-colors shrink-0 cursor-pointer"
            >
              <Menu className="w-5 h-5" aria-hidden="true" />
            </button>
          )}

          <div className="min-w-0 flex-1">
            <h1 className="text-sm lg:text-base font-bold text-slate-900 dark:text-[#F8FAFC] leading-tight">
              {mobileTitle ? (
                <>
                  <span className="sm:hidden">{mobileTitle}</span>
                  <span className="hidden sm:inline truncate">{title}</span>
                </>
              ) : (
                <span className="block truncate">{title}</span>
              )}
            </h1>
            <p className="hidden sm:block text-[11px] text-slate-500 dark:text-[#94A3B8] font-medium truncate">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Desktop Role-Filtered Quick Action Buttons */}
          <div className="hidden xl:flex items-center gap-1.5">
            {(department === 'ADM' || department === 'ACT') && onOpenFeeModal && (
              <button
                type="button"
                onClick={onOpenFeeModal}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>Collect Fee</span>
              </button>
            )}

            {department === 'ADM' && onOpenCsvModal && (
              <button
                type="button"
                onClick={onOpenCsvModal}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>Import CSV</span>
              </button>
            )}

            {department === 'TCH' && onOpenAddStudentModal && (
              <button
                type="button"
                onClick={onOpenAddStudentModal}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>Add Student</span>
              </button>
            )}

            {(department === 'ADM' || department === 'TCH') && onOpenSyllabusModal && (
              <button
                type="button"
                onClick={onOpenSyllabusModal}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-cyan-50 dark:bg-cyan-950/60 hover:bg-cyan-100 dark:hover:bg-cyan-900 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer"
              >
                <FileUp className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>Upload Syllabus</span>
              </button>
            )}

            {department === 'ACT' && onExportLedger && (
              <button
                type="button"
                onClick={onExportLedger}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>Export Ledger</span>
              </button>
            )}
          </div>

          {/* Mobile & Tablet Compact Quick Actions Menu (< 1280px) */}
          {hasQuickActions && (
            <div ref={quickMenuRef} className="relative xl:hidden">
              <button
                type="button"
                onClick={() => setQuickMenuOpen((v) => !v)}
                aria-label="Quick campus actions"
                aria-expanded={quickMenuOpen}
                aria-haspopup="menu"
                className="w-9 h-9 inline-flex items-center justify-center rounded-xl bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#6366F1] border border-[#C7D2FE] dark:border-[#3730A3] hover:bg-[#4F46E5] hover:text-white transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
              </button>

              {quickMenuOpen && (
                <div
                  role="menu"
                  aria-label="Quick actions"
                  className="absolute right-0 mt-2 w-52 rounded-xl bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] shadow-xl p-1.5 space-y-1 z-50"
                >
                  {(department === 'ADM' || department === 'ACT') && onOpenFeeModal && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setQuickMenuOpen(false);
                        onOpenFeeModal();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>Collect Fee</span>
                    </button>
                  )}
                  {department === 'ADM' && onOpenCsvModal && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setQuickMenuOpen(false);
                        onOpenCsvModal();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>Import CSV Roster</span>
                    </button>
                  )}
                  {department === 'TCH' && onOpenAddStudentModal && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setQuickMenuOpen(false);
                        onOpenAddStudentModal();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>Add Student</span>
                    </button>
                  )}
                  {(department === 'ADM' || department === 'TCH') && onOpenSyllabusModal && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setQuickMenuOpen(false);
                        onOpenSyllabusModal();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-cyan-700 dark:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-950/60 cursor-pointer"
                    >
                      <FileUp className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>Upload Syllabus</span>
                    </button>
                  )}
                  {department === 'ACT' && onExportLedger && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setQuickMenuOpen(false);
                        onExportLedger();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 cursor-pointer"
                    >
                      <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>Export Ledger CSV</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleThemeMode}
            title={themeMode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={themeMode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="w-9 h-9 inline-flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-800 dark:text-[#94A3B8] dark:hover:text-slate-100 hover:bg-[#EEF2F7] dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {themeMode === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" aria-hidden="true" />
            )}
          </button>

          <div className="hidden sm:block h-5 w-px bg-slate-200 dark:bg-[#1A2336]" />

          {/* Compact Mobile Dot / Full Desktop Sync Status */}
          <div className="flex items-center gap-1">
            {connectionMode === 'LIVE_CLOUD' ? (
              <button
                type="button"
                onClick={() => initializeRealtimeSync()}
                title="Cloud Synced — Click to refresh"
                aria-label="Cloud Synced — Refresh Campus Sync"
                className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 sm:py-1 rounded-full text-[11px] font-semibold border bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 shadow-xs whitespace-nowrap cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="hidden sm:inline">Cloud Synced</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => initializeRealtimeSync()}
                title="Offline Mode — Reconnecting"
                aria-label="Offline Mode — Retry Campus Sync"
                className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 sm:py-1 rounded-full text-[11px] font-semibold border bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 shadow-xs whitespace-nowrap cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                <span className="hidden sm:inline">Offline Mode</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => initializeRealtimeSync()}
              disabled={isSyncing}
              title={isSyncing ? 'Syncing school records...' : 'Refresh Campus Sync'}
              aria-label="Refresh Campus Sync"
              className="hidden md:inline-flex p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-[#94A3B8] dark:hover:text-slate-100 hover:bg-[#EEF2F7] dark:hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  isSyncing ? 'animate-spin text-emerald-600 dark:text-emerald-400' : ''
                }`}
                aria-hidden="true"
              />
            </button>
          </div>

          {/* Academic Session Pill */}
          <div className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1 bg-[#EEF2F7] dark:bg-[#1A2336] rounded-full text-[11px] font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
            <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-[#94A3B8]" aria-hidden="true" />
            <span>Session {schoolProfile.session}</span>
          </div>

          {/* Active Staff Profile Chip + Sign Out */}
          {currentStaff && (
            <div className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 border-l border-[#E2E8F0] dark:border-[#232E44]">
              <div
                title={`${currentStaff.fullName} (${currentStaff.id})`}
                className="w-8 h-8 rounded-full bg-[#4F46E5] dark:bg-[#6366F1] text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0"
              >
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
                aria-label="Sign Out"
                className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-slate-500 hover:text-rose-600 dark:text-[#94A3B8] dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer shrink-0"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
