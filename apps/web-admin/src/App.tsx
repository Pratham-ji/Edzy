import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { useAdminStore } from './store/useAdminStore';
import { getRoleNavigation } from './lib/rbac';
import { downloadCsvFile, formatReceiptNumber } from './lib/feeMetrics';
import DashboardPage from './pages/DashboardPage';
import StaffManagementPage from './pages/StaffManagementPage';
import FeesPage from './pages/FeesPage';
import AccountsExportPage from './pages/AccountsExportPage';
import StudentsPage from './pages/StudentsPage';
import { CircularsAttendancePage } from './pages/CircularsAttendancePage';
import SyllabusPage from './pages/SyllabusPage';
import MarksPage from './pages/MarksPage';
import SettingsPage from './pages/SettingsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import SchoolPitchPage from './pages/SchoolPitchPage';
import StaffLoginPage from './pages/StaffLoginPage';
import SuperAdminPage from './pages/SuperAdminPage';

import OfflineFeeModal from './components/OfflineFeeModal';
import CsvImportModal from './components/CsvImportModal';
import UploadSyllabusModal from './components/UploadSyllabusModal';
import AddStudentModal from './components/AddStudentModal';

export default function App() {
  const [pathname, setPathname] = useState(
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );
  const {
    currentStaff,
    initializeRealtimeSync,
    schoolProfile,
    feeInstallments,
  } = useAdminStore();

  const initialDept = currentStaff?.department || 'ADM';
  const [activeTab, setActiveTab] = useState<NavTab>(getRoleNavigation(initialDept).defaultTab);

  // Global Quick Modals
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isSyllabusModalOpen, setIsSyllabusModalOpen] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);

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

  // Private Edzy Founder / Super-Admin HQ Console (Not linked inside any school workspace)
  if (pathname === '/super-admin') {
    return <SuperAdminPage onNavigateHome={() => navigateTo('/')} />;
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
    const headers = [
      'Student ID',
      'Student Name',
      'Class',
      'Quarter',
      'Amount (INR)',
      'Mode',
      'Receipt #',
      'Status',
      'Paid Date',
      'Reference Note',
    ];
    const rows = feeInstallments.map((f) => [
      f.studentId,
      f.studentName,
      f.classGrade,
      f.quarter,
      f.amount,
      f.paymentMethod || 'PENDING',
      formatReceiptNumber(f.receiptNumber),
      f.status,
      f.paidDate || '',
      f.paymentRef || f.clerkNote || '',
    ]);
    downloadCsvFile(
      `edzy-${schoolProfile.code.toLowerCase()}-fee-ledger.csv`,
      headers,
      rows
    );
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

            {safeTab === 'staff' && currentStaff.department === 'ADM' && <StaffManagementPage />}

            {safeTab === 'fees' && <FeesPage />}

            {safeTab === 'accounts-export' &&
              (currentStaff.department === 'ACT' || currentStaff.department === 'ADM') && (
                <AccountsExportPage />
              )}

            {safeTab === 'students' && <StudentsPage />}
            {safeTab === 'circulars' && <CircularsAttendancePage />}
            {safeTab === 'syllabus' && <SyllabusPage />}
            {safeTab === 'marks' && <MarksPage />}
            {safeTab === 'settings' && (
              <SettingsPage onOpenAccountsExport={() => handleSelectTab('accounts-export')} />
            )}
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
      {isAddStudentModalOpen && (currentStaff.department === 'TCH' || currentStaff.department === 'ADM') && (
        <AddStudentModal
          defaultClass={currentStaff.assignedClass || undefined}
          onClose={() => setIsAddStudentModalOpen(false)}
          onCreated={() => setActiveTab('students')}
        />
      )}
    </div>
  );
}
