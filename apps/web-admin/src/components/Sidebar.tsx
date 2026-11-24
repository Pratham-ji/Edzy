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
} from 'lucide-react';
import { useAdminStore } from '../store/useAdminStore';

export type NavTab = 'dashboard' | 'fees' | 'students' | 'circulars' | 'syllabus' | 'marks' | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const { schoolProfile, feeInstallments } = useAdminStore();

  const pendingDuesCount = feeInstallments.filter((f) => f.status === 'PENDING' || f.status === 'OVERDUE').length;

  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Principal Command', icon: LayoutDashboard },
    { id: 'fees' as NavTab, label: 'Hybrid Fee Counter', icon: CreditCard, badge: pendingDuesCount },
    { id: 'students' as NavTab, label: 'Student Directory & CSV', icon: Users },
    { id: 'circulars' as NavTab, label: 'Circulars & Attendance', icon: Bell },
    { id: 'syllabus' as NavTab, label: 'Syllabus Vault & AR', icon: BookOpen },
    { id: 'marks' as NavTab, label: 'CBSE Marks & Gradebook', icon: GraduationCap },
    { id: 'settings' as NavTab, label: 'School ERP Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between shrink-0 min-h-screen border-r border-slate-800">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <School className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-wider text-white">EDZY</span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-bold px-1.5 py-0.5 rounded border border-indigo-400/30">
                  ERP
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">School Command Cloud</p>
            </div>
          </div>
        </div>

        {/* Institution Context Card */}
        <div className="mx-4 my-4 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-cyan-400 tracking-wider">CAMPUS TENANT</span>
            <span className="text-[10px] bg-slate-700 text-slate-300 font-mono px-1.5 py-0.5 rounded">
              {schoolProfile.code}
            </span>
          </div>
          <p className="text-xs font-bold text-slate-200 truncate">{schoolProfile.name}</p>
          <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>CBSE Affiliated</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="px-3 space-y-1">
          <p className="px-3 pt-2 pb-1 text-[10px] font-bold text-slate-400 tracking-wider">
            ADMINISTRATION
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
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
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-semibold text-emerald-400">Synced with Mobile App</span>
          </div>
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
        </div>
        <p className="text-[11px] text-slate-400 leading-tight">
          Parent & Student App Active • Cloud Synced
        </p>
      </div>
    </aside>
  );
};
