import React from 'react';
import {
  LayoutDashboard,
  CreditCard,
  Users,
  BookOpen,
  GraduationCap,
  Settings,
  Sparkles,
  School,
  ShieldCheck,
  ChevronRight,
  Bell,
  ExternalLink,
} from 'lucide-react';
import { useAdminStore } from '../store/useAdminStore';

export type NavTab = 'dashboard' | 'fees' | 'students' | 'circulars' | 'syllabus' | 'marks' | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onNavigatePath?: (path: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab, onNavigatePath }) => {
  const { schoolProfile, feeInstallments } = useAdminStore();

  const pendingDuesCount = feeInstallments.filter((f) => f.status === 'PENDING' || f.status === 'OVERDUE').length;

  const schoolBoard = (schoolProfile.board || 'CBSE').split(' ')[0].toUpperCase();

  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Principal Command', icon: LayoutDashboard },
    { id: 'fees' as NavTab, label: 'Hybrid Fee Counter', icon: CreditCard, badge: pendingDuesCount },
    { id: 'students' as NavTab, label: 'Student Directory & CSV', icon: Users },
    { id: 'circulars' as NavTab, label: 'Circulars & Attendance', icon: Bell },
    { id: 'syllabus' as NavTab, label: 'Syllabus Vault & 3D Labs', icon: BookOpen },
    { id: 'marks' as NavTab, label: 'Exam Marks & Gradebook', icon: GraduationCap },
    { id: 'settings' as NavTab, label: 'School ERP Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-[#0D1320] text-[#0F172A] dark:text-[#F8FAFC] flex flex-col justify-between shrink-0 min-h-screen border-r border-[#E2E8F0] dark:border-[#232E44] transition-colors">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-[#E2E8F0] dark:border-[#232E44] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#4F46E5] to-[#6366F1] flex items-center justify-center shadow-md shadow-indigo-500/20">
              <School className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-wider text-[#0F172A] dark:text-[#F8FAFC]">EDZY</span>
                <span className="text-[10px] bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#6366F1] font-bold px-1.5 py-0.5 rounded border border-[#C7D2FE] dark:border-[#3730A3]">
                  ERP
                </span>
              </div>
              <p className="text-[11px] text-[#475569] dark:text-[#94A3B8] font-medium">School Command Cloud</p>
            </div>
          </div>
        </div>

        {/* Institution Context Card */}
        <div className="mx-4 my-4 p-3 rounded-xl bg-[#F6F8FC] dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-[#4F46E5] dark:text-[#6366F1] tracking-wider">CAMPUS TENANT</span>
            <span className="text-[10px] bg-[#EEF2F7] dark:bg-[#1A2336] text-[#475569] dark:text-[#94A3B8] font-mono px-1.5 py-0.5 rounded border border-[#E2E8F0] dark:border-[#232E44]">
              {schoolProfile.code}
            </span>
          </div>
          <p className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] truncate">{schoolProfile.name}</p>
          <div className="flex items-center gap-1 mt-1 text-[11px] text-[#475569] dark:text-[#94A3B8]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#059669] dark:text-[#34D399]" />
            <span>{schoolBoard} Affiliated</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="px-3 space-y-1">
          <p className="px-3 pt-2 pb-1 text-[10px] font-bold text-[#475569] dark:text-[#94A3B8] tracking-wider">
            ADMINISTRATION
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#6366F1] border border-[#C7D2FE]/80 dark:border-[#3730A3] font-semibold shadow-2xs'
                    : 'text-[#475569] dark:text-[#94A3B8] hover:bg-[#EEF2F7] dark:hover:bg-[#1A2336] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#4F46E5] dark:text-[#6366F1]' : 'text-[#475569] dark:text-[#94A3B8]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isActive
                        ? 'bg-[#4F46E5] dark:bg-[#6366F1] text-white border-transparent'
                        : 'bg-[#FFFBEB] dark:bg-[rgba(245,158,11,0.14)] text-[#D97706] dark:text-[#FBBF24] border-[#FDE68A] dark:border-amber-500/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Pitch Badge */}
      <div className="p-4 border-t border-[#E2E8F0] dark:border-[#232E44] bg-[#F6F8FC] dark:bg-[#090D16]/60">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#059669] dark:bg-[#34D399]"></span>
            </span>
            <span className="text-[11px] font-semibold text-[#059669] dark:text-[#34D399]">Synced with Mobile App</span>
          </div>
          <Sparkles className="w-3.5 h-3.5 text-[#4F46E5] dark:text-[#6366F1]" />
        </div>
        <p className="text-[11px] text-[#475569] dark:text-[#94A3B8] leading-tight">
          Parent & Student App Active • Cloud Synced
        </p>

        {/* Public Pitch & Privacy Links */}
        <div className="mt-3 pt-3 border-t border-[#E2E8F0] dark:border-[#232E44] flex items-center justify-between text-[11px]">
          <button
            onClick={() => onNavigatePath ? onNavigatePath('/pitch') : (window.location.href = '/pitch')}
            className="text-[#4F46E5] dark:text-[#6366F1] hover:text-[#3730A3] dark:hover:text-[#818CF8] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>Public Pitch ↗</span>
          </button>
          <button
            onClick={() => onNavigatePath ? onNavigatePath('/privacy-policy') : (window.location.href = '/privacy-policy')}
            className="text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] transition-colors cursor-pointer"
          >
            Privacy Policy
          </button>
        </div>
      </div>
    </aside>
  );
};
