import React from 'react';
import {
  Search,
  Bell,
  Database,
  Calendar,
  Sparkles,
  Download,
  PlusCircle,
  CreditCard,
  FileUp,
  UserPlus,
  Sun,
  Moon,
  RefreshCw,
  AlertTriangle,
  X,
} from 'lucide-react';
import { isLiveSupabaseConfigured } from '../lib/supabase';
import { useAdminStore } from '../store/useAdminStore';

interface TopHeaderProps {
  title: string;
  subtitle: string;
  onOpenFeeModal?: () => void;
  onOpenCsvModal?: () => void;
  onOpenSyllabusModal?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  title,
  subtitle,
  onOpenFeeModal,
  onOpenCsvModal,
  onOpenSyllabusModal,
}) => {
  const {
    schoolProfile,
    connectionMode,
    themeMode,
    toggleThemeMode,
    isSyncing,
    initializeRealtimeSync,
    syncError,
    setSyncError,
  } = useAdminStore();

  return (
    <header className="relative bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs transition-colors">
      {syncError && (
        <div className="bg-red-600 dark:bg-red-700 text-white px-6 py-2 flex items-center justify-between text-xs font-semibold shadow-inner">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-white shrink-0 animate-bounce" />
            <span>Supabase Write Note: {syncError}</span>
          </div>
          <button
            onClick={() => setSyncError(null)}
            className="p-1 hover:bg-red-800/60 rounded text-white/90 hover:text-white transition"
            title="Dismiss error notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      <div className="h-16 px-6 flex items-center justify-between">
      {/* Title & Context */}
      <div>
        <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">{title}</h1>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{subtitle}</p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2">
          {onOpenFeeModal && (
            <button
              onClick={onOpenFeeModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-semibold transition"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Collect Fee</span>
            </button>
          )}

          {onOpenCsvModal && (
            <button
              onClick={onOpenCsvModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs font-semibold transition"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Import CSV</span>
            </button>
          )}

          {onOpenSyllabusModal && (
            <button
              onClick={onOpenSyllabusModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-50 dark:bg-cyan-950/60 hover:bg-cyan-100 dark:hover:bg-cyan-900 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 rounded-lg text-xs font-semibold transition"
            >
              <FileUp className="w-3.5 h-3.5" />
              <span>Upload PDF</span>
            </button>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleThemeMode}
          title={themeMode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {themeMode === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

        {/* Database Status Indicator: Live Cloud Sync vs Offline Demo Mode + Force Sync */}
        <div className="flex items-center gap-1.5">
          {connectionMode === 'LIVE_CLOUD' ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Cloud Sync</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Offline Demo Mode</span>
            </div>
          )}

          <button
            onClick={() => initializeRealtimeSync()}
            disabled={isSyncing}
            title={isSyncing ? 'Syncing with Supabase...' : 'Force Cloud Sync'}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-600 dark:text-emerald-400' : ''}`} />
          </button>
        </div>

        {/* Academic Session Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[11px] font-medium text-slate-700 dark:text-slate-300">
          <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span>Session {schoolProfile.session}</span>
        </div>

        {/* User Avatar */}
        <div className="flex items-center gap-2 pl-2">
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
            MS
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none">Dr. Meenakshi S.</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Principal</p>
          </div>
        </div>
      </div>
      </div>
    </header>
  );
};
