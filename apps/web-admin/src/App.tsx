import React, { useState, useEffect } from 'react';
import { Users, FileSpreadsheet, Download, ShieldCheck, X, UserPlus } from 'lucide-react';
import { Sidebar, NavTab } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { useAdminStore } from './store/useAdminStore';
import { getRoleNavigation } from './lib/rbac';
import DashboardPage from './pages/DashboardPage';
import FeesPage from './pages/FeesPage';
import StudentsPage from './pages/StudentsPage';
import { CircularsAttendancePage } from './pages/CircularsAttendancePage';
import SyllabusPage from './pages/SyllabusPage';
import MarksPage from './pages/MarksPage';
import SettingsPage from './pages/SettingsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import SchoolPitchPage from './pages/SchoolPitchPage';
import StaffLoginPage from './pages/StaffLoginPage';

import OfflineFeeModal from './components/OfflineFeeModal';
import CsvImportModal from './components/CsvImportModal';
import UploadSyllabusModal from './components/UploadSyllabusModal';

export default function App() {
  const [pathname, setPathname] = useState(
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );
  const {
    currentStaff,
    initializeRealtimeSync,
    schoolProfile,
    staffList,
    feeInstallments,
    addSingleStudent,
  } = useAdminStore();

  const initialDept = currentStaff?.department || 'ADM';
  const [activeTab, setActiveTab] = useState<NavTab>(getRoleNavigation(initialDept).defaultTab);

  // Global Quick Modals
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isSyllabusModalOpen, setIsSyllabusModalOpen] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);

  // Quick Add Student Form State (for TCH quick action)
  const [newStuName, setNewStuName] = useState('');
  const [newStuClass, setNewStuClass] = useState(currentStaff?.assignedClass || 'Class 10-A');
  const [newStuParent, setNewStuParent] = useState('');
  const [newStuPhone, setNewStuPhone] = useState('');

  useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const navigateTo = (path: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      setPathname(path);
    }
  };

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    initializeRealtimeSync(currentStaff?.schoolId).then((c) => {
      cleanup = c;
    });
    return () => {
      cleanup?.();
    };
  }, [initializeRealtimeSync, currentStaff?.schoolId]);

  // Keep activeTab strictly within authenticated staff's permitted tabs
  useEffect(() => {
    if (!currentStaff) return;
    const roleNav = getRoleNavigation(currentStaff.department);
    if (!roleNav.allowedTabs.includes(activeTab)) {
      setActiveTab(roleNav.defaultTab);
    }
  }, [currentStaff?.id, currentStaff?.department, activeTab]);

  useEffect(() => {
    if (currentStaff?.assignedClass) {
      setNewStuClass(currentStaff.assignedClass);
    }
  }, [currentStaff?.assignedClass]);

  // Public Standalone Pages (Always accessible without authentication)
  if (pathname === '/privacy-policy') {
    return (
      <PrivacyPolicyPage
        onNavigateHome={() => navigateTo('/')}
        onNavigatePitch={() => navigateTo('/pitch')}
      />
    );
  }

  if (pathname === '/pitch') {
    return (
      <SchoolPitchPage
        onNavigateHome={() => navigateTo('/')}
        onNavigatePrivacy={() => navigateTo('/privacy-policy')}
      />
    );
  }

  // Require Staff Employee ID Login for ERP workspace
  if (!currentStaff) {
    return <StaffLoginPage onNavigatePath={navigateTo} />;
  }

  const schoolBoard = (schoolProfile.board || 'CBSE').split(' ')[0].toUpperCase();
  const roleNav = getRoleNavigation(currentStaff.department);
  const safeTab: NavTab = roleNav.allowedTabs.includes(activeTab) ? activeTab : roleNav.defaultTab;

  const handleSelectTab = (tab: NavTab) => {
    if (roleNav.allowedTabs.includes(tab)) {
      setActiveTab(tab);
    }
  };

  const handleExportLedgerCsv = () => {
    const header = 'Installment ID,Student ID,Student Name,Class,Quarter,Amount,Status,Payment Mode,Receipt Number,Paid Date\n';
    const csvRows = feeInstallments
      .map((f) =>
        [
          f.id,
          f.studentId,
          `"${f.studentName.replace(/"/g, '""')}"`,
          f.classGrade,
          `"${f.quarter}"`,
          f.amount,
          f.status,
          f.paymentMethod || 'PENDING',
          f.receiptNumber || '',
          f.paidDate || '',
        ].join(',')
      )
      .join('\n');
    const blob = new Blob([header + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `edzy-${schoolProfile.code.toLowerCase()}-fee-ledger.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleQuickAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStuName.trim() || !newStuParent.trim() || !newStuPhone.trim()) return;
    addSingleStudent({
      fullName: newStuName,
      classGrade: currentStaff.assignedClass || newStuClass,
      parentName: newStuParent,
      parentPhone: newStuPhone,
    });
    setNewStuName('');
    setNewStuParent('');
    setNewStuPhone('');
    setIsAddStudentModalOpen(false);
    setActiveTab('students');
  };

  // Tab Titles & Subtitles for Header
  const getHeaderInfo = () => {
    switch (safeTab) {
      case 'dashboard':
        return {
          title: 'Executive School Command Center',
          subtitle: `${schoolProfile.name} (${schoolProfile.code}) • ${schoolBoard} Affiliated Boarding & Day Campus`,
        };
      case 'staff':
        return {
          title: 'Staff Directory & Hierarchy',
          subtitle: `${schoolProfile.name} (${schoolProfile.code}) • Role-Based Employee Accounts`,
        };
      case 'fees':
        return {
          title: 'Hybrid Fee Counter & Receipts',
          subtitle: 'Desk Cash/Cheque Collection, UPI Reconciliation, and WhatsApp Due Reminders',
        };
      case 'accounts-export':
        return {
          title: 'Tally & Fee Reconciliation Exports',
          subtitle: `${schoolProfile.name} • Real-Time Collection Reports & CSV Accounting Bundles`,
        };
      case 'students':
        return {
          title:
            currentStaff.department === 'TCH' && currentStaff.assignedClass
              ? `My Class Roster • ${currentStaff.assignedClass}`
              : 'Student Directory & Access Passes',
          subtitle: `${schoolBoard} Enrollment Roster, Mobile Pass Slips, and At-Home Study Telemetry`,
        };
      case 'circulars':
        return {
          title:
            currentStaff.department === 'TCH'
              ? 'Class Attendance & Official Notices'
              : 'Official Circulars & Attendance Register',
          subtitle: 'Digital Broadcasts to Parent App & Daily Class Attendance Tracking',
        };
      case 'syllabus':
        return {
          title: 'Curriculum Vault & 3D Labs',
          subtitle: `${schoolBoard} Syllabus Scanner with Visual Flowchart Roadmaps, Notes & 3D Visual Labs`,
        };
      case 'marks':
        return {
          title: 'Exam Marks & Term Assessments',
          subtitle: `${schoolBoard} Grading Spreadsheet with Real-Time Parent App Sync`,
        };
      case 'settings':
        return {
          title: 'Campus ERP Configuration & Profile',
          subtitle: 'Official School Entity Details, Tally CSV Exports, and Cloud Health',
        };
      default:
        return {
          title: 'Edzy School ERP',
          subtitle: 'B2B K-12 Educational SaaS & Spatial Computing',
        };
    }
  };

  const headerInfo = getHeaderInfo();

  return (
    <div className="flex h-screen bg-[#F6F8FC] dark:bg-[#090D16] text-[#0F172A] dark:text-[#F8FAFC] antialiased overflow-hidden font-sans transition-colors">
      {/* Role-Filtered Navigation Sidebar */}
      <Sidebar activeTab={safeTab} onSelectTab={handleSelectTab} onNavigatePath={navigateTo} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Sticky Role-Filtered Top Header */}
        <TopHeader
          title={headerInfo.title}
          subtitle={headerInfo.subtitle}
          onOpenFeeModal={
            currentStaff.department === 'ADM' || currentStaff.department === 'ACT'
              ? () => setIsFeeModalOpen(true)
              : undefined
          }
          onOpenCsvModal={
            currentStaff.department === 'ADM' ? () => setIsCsvModalOpen(true) : undefined
          }
          onOpenSyllabusModal={
            currentStaff.department === 'ADM' || currentStaff.department === 'TCH'
              ? () => setIsSyllabusModalOpen(true)
              : undefined
          }
          onOpenAddStudentModal={
            currentStaff.department === 'TCH' ? () => setIsAddStudentModalOpen(true) : undefined
          }
          onExportLedger={
            currentStaff.department === 'ACT' ? handleExportLedgerCsv : undefined
          }
        />

        {/* Dynamic Role-Scoped Page Scroll Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto pb-12">
            {safeTab === 'dashboard' && (
              <DashboardPage
                onNavigate={handleSelectTab}
                onOpenFeeModal={() => setIsFeeModalOpen(true)}
                onOpenCsvModal={() => setIsCsvModalOpen(true)}
                onOpenSyllabusModal={() => setIsSyllabusModalOpen(true)}
              />
            )}

            {safeTab === 'staff' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#6366F1] flex items-center justify-center shrink-0">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
                          Staff & RBAC Hierarchy Preview
                        </h2>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#6366F1] border border-[#C7D2FE] dark:border-[#3730A3]">
                          PHASE C PREVIEW
                        </span>
                      </div>
                      <p className="text-xs text-[#475569] dark:text-[#94A3B8] mt-1">
                        {staffList.length} active staff accounts synced for {schoolProfile.code}. Full employee creation and class assignment management activates in Phase C.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] rounded-2xl overflow-hidden shadow-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F6F8FC] dark:bg-[#1A2336] border-b border-[#E2E8F0] dark:border-[#232E44] text-[10px] font-bold uppercase tracking-wider text-[#475569] dark:text-[#94A3B8]">
                        <th className="py-3 px-4">Employee ID</th>
                        <th className="py-3 px-4">Staff Member</th>
                        <th className="py-3 px-4">Dept & Role</th>
                        <th className="py-3 px-4">Password Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#232E44] text-xs">
                      {staffList.map((member) => (
                        <tr key={member.id}>
                          <td className="py-3 px-4 font-mono font-bold text-[#4F46E5] dark:text-[#6366F1]">
                            {member.id}
                          </td>
                          <td className="py-3 px-4 font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                            {member.fullName}
                          </td>
                          <td className="py-3 px-4 text-[#475569] dark:text-[#94A3B8]">
                            {member.department} • {member.assignedClass || member.designation}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                member.isPasswordSet
                                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                                  : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300'
                              }`}
                            >
                              <ShieldCheck className="w-3 h-3" />
                              {member.isPasswordSet ? 'Activated' : 'Pending Self-Setup'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {safeTab === 'fees' && <FeesPage />}

            {safeTab === 'accounts-export' && (
              <div className="bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] rounded-2xl p-6 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-[#059669] dark:text-[#34D399] flex items-center justify-center shrink-0">
                      <FileSpreadsheet className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
                          Tally & Fee Ledger Exports
                        </h2>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-[#059669] dark:text-[#34D399]">
                          READY TO EXPORT
                        </span>
                      </div>
                      <p className="text-xs text-[#475569] dark:text-[#94A3B8] mt-1">
                        {feeInstallments.filter((f) => f.status === 'PAID').length} settled installments and{' '}
                        {feeInstallments.filter((f) => f.status !== 'PAID').length} pending quarters synced across {schoolProfile.code}.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportLedgerCsv}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#3730A3] text-white text-xs font-bold shadow-sm transition cursor-pointer shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Ledger CSV</span>
                  </button>
                </div>
              </div>
            )}

            {safeTab === 'students' && <StudentsPage />}
            {safeTab === 'circulars' && <CircularsAttendancePage />}
            {safeTab === 'syllabus' && <SyllabusPage />}
            {safeTab === 'marks' && <MarksPage />}
            {safeTab === 'settings' && <SettingsPage />}
          </div>
        </main>
      </div>

      {/* Role-Safe Global Modals triggered from Top Header */}
      {isFeeModalOpen && (currentStaff.department === 'ADM' || currentStaff.department === 'ACT') && (
        <OfflineFeeModal onClose={() => setIsFeeModalOpen(false)} />
      )}
      {isCsvModalOpen && currentStaff.department === 'ADM' && (
        <CsvImportModal onClose={() => setIsCsvModalOpen(false)} />
      )}
      {isSyllabusModalOpen && (currentStaff.department === 'ADM' || currentStaff.department === 'TCH') && (
        <UploadSyllabusModal onClose={() => setIsSyllabusModalOpen(false)} />
      )}
      {isAddStudentModalOpen && currentStaff.department === 'TCH' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#6366F1] flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
                    Add Student to {currentStaff.assignedClass || newStuClass}
                  </h3>
                  <p className="text-[11px] text-[#475569] dark:text-[#94A3B8]">
                    Auto-generates structured {schoolProfile.code} Student ID
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddStudentModalOpen(false)}
                className="p-1.5 rounded-lg text-[#475569] dark:text-[#94A3B8] hover:bg-[#EEF2F7] dark:hover:bg-[#1A2336] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickAddStudentSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-[#475569] dark:text-[#94A3B8] mb-1">
                  Student Full Name
                </label>
                <input
                  type="text"
                  required
                  value={newStuName}
                  onChange={(e) => setNewStuName(e.target.value)}
                  placeholder="e.g. Kabir Sharma"
                  className="w-full h-10 px-3 rounded-xl bg-[#EEF2F7] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#475569] dark:text-[#94A3B8] mb-1">
                  Parent / Guardian Name
                </label>
                <input
                  type="text"
                  required
                  value={newStuParent}
                  onChange={(e) => setNewStuParent(e.target.value)}
                  placeholder="e.g. Vikram Sharma"
                  className="w-full h-10 px-3 rounded-xl bg-[#EEF2F7] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#475569] dark:text-[#94A3B8] mb-1">
                  Parent WhatsApp / Phone
                </label>
                <input
                  type="tel"
                  required
                  value={newStuPhone}
                  onChange={(e) => setNewStuPhone(e.target.value)}
                  placeholder="9811234599"
                  className="w-full h-10 px-3 rounded-xl bg-[#EEF2F7] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC]"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddStudentModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] text-xs font-bold text-[#475569] dark:text-[#94A3B8] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#3730A3] text-white text-xs font-bold cursor-pointer"
                >
                  Register Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
