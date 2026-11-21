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
  const { schoolProfile } = useAdminStore();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Title & Context */}
      <div>
        <h1 className="text-base font-bold text-slate-900 leading-tight">{title}</h1>
        <p className="text-[11px] text-slate-500 font-medium">{subtitle}</p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2">
          {onOpenFeeModal && (
            <button
              onClick={onOpenFeeModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold transition"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Collect Fee</span>
            </button>
          )}

          {onOpenCsvModal && (
            <button
              onClick={onOpenCsvModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold transition"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Import CSV</span>
            </button>
          )}

          {onOpenSyllabusModal && (
            <button
              onClick={onOpenSyllabusModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 rounded-lg text-xs font-semibold transition"
            >
              <FileUp className="w-3.5 h-3.5" />
              <span>Upload PDF</span>
            </button>
          )}
        </div>

        <div className="h-5 w-px bg-slate-200 mx-1" />

        {/* Database Status Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border bg-slate-50 text-slate-600 border-slate-200">
          <Database className={`w-3.5 h-3.5 ${isLiveSupabaseConfigured ? 'text-emerald-500' : 'text-indigo-500'}`} />
          <span>{isLiveSupabaseConfigured ? 'Live Supabase DB' : 'Demo Pitch Mode'}</span>
        </div>

        {/* Academic Session Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-full text-[11px] font-medium text-slate-700">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>Session {schoolProfile.session}</span>
        </div>

        {/* User Avatar */}
        <div className="flex items-center gap-2 pl-2">
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
            MS
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-none">Dr. Meenakshi S.</p>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">Principal</p>
          </div>
        </div>
      </div>
    </header>
  );
};
