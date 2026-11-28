import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { useAdminStore } from './store/useAdminStore';
import { getRoleNavigation } from './lib/rbac';
import { applyRouteSeo } from './lib/seo';
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
import LandingPage from './pages/LandingPage';
import StaffLoginPage from './pages/StaffLoginPage';
import SuperAdminPage from './pages/SuperAdminPage';

import OfflineFeeModal from './components/OfflineFeeModal';
import CsvImportModal from './components/CsvImportModal';
import UploadSyllabusModal from './components/UploadSyllabusModal';
import AddStudentModal from './components/AddStudentModal';

function normalizeRoutePath(rawPath: string): string {
  if (!rawPath || rawPath === '/pitch') return '/';
  return rawPath;
}

export default function App() {
  const [pathname, setPathname] = useState(() =>
    typeof window !== 'undefined' ? normalizeRoutePath(window.location.pathname) : '/'
  );
  const {
    currentStaff,
    initializeRealtimeSync,
    schoolProfile,
    feeInstallments,
    themeMode,
  } = useAdminStore();

  const initialDept = currentStaff?.department || 'ADM';
  const [activeTab, setActiveTab] = useState<NavTab>(getRoleNavigation(initialDept).defaultTab);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Global Quick Modals
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isSyllabusModalOpen, setIsSyllabusModalOpen] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);

  // Keep /pitch normalized to / and respond to browser back/forward navigation
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.location.pathname === '/pitch') {
      window.history.replaceState({}, '', '/');
      setPathname('/');
    }

    const handlePopState = () => {
      const next = normalizeRoutePath(window.location.pathname);
      if (window.location.pathname === '/pitch') {
        window.history.replaceState({}, '', '/');
      }
      setPathname(next);
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Close mobile nav drawer automatically on desktop breakpoint resize or route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname, currentStaff?.id]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(min-width: 1024px)');
    const handleChange = () => {
      if (mq.matches) setMobileMenuOpen(false);
    };
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  // Synchronize light/dark DOM class and <meta name="color-scheme">
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('dark', themeMode === 'dark');
    document
      .querySelector('meta[name="color-scheme"]')
      ?.setAttribute('content', themeMode === 'dark' ? 'dark' : 'light');
  }, [themeMode]);

  // Synchronize per-route SEO title, canonical link, and indexing directives
  useEffect(() => {
    applyRouteSeo(pathname, Boolean(currentStaff), schoolProfile.name);
  }, [pathname, currentStaff, schoolProfile.name]);

  const navigateTo = (path: string) => {
    const clean = normalizeRoutePath(path);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', clean);
      setPathname(clean);
      window.scrollTo({ top: 0, behavior: 'auto' });
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

  // Public Standalone Privacy Policy Route
  if (pathname === '/privacy-policy') {
    return (
      <PrivacyPolicyPage
        onNavigateHome={() => navigateTo('/')}
        onNavigatePortal={() => navigateTo('/portal')}
      />
    );
  }

  // Private Edzy Founder / Super-Admin HQ Console (Never linked inside public website or school ERP)
  if (pathname === '/super-admin') {
    return (
      <SuperAdminPage
        onNavigateHome={() => navigateTo('/portal')}
        onNavigatePath={navigateTo}
      />
    );
  }

  // Public Flagship Landing Website (/ and normalized /pitch)
  const isPortalRoute = pathname === '/portal' || pathname === '/login';
  if (!isPortalRoute) {
    return (
      <LandingPage
        onNavigatePortal={() => navigateTo('/portal')}
        onNavigatePrivacy={() => navigateTo('/privacy-policy')}
      />
    );
  }

  // Require Staff Employee ID Login for School ERP Portal (/portal and /login)
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
          title: 'Campus Command Center',
          subtitle: `${schoolProfile.name} (${schoolProfile.code}) • ${schoolBoard} Session ${schoolProfile.session}`,
        };
      case 'staff':
        return {
          title: 'Staff Directory & Hierarchy',
          subtitle: `${schoolProfile.name} (${schoolProfile.code}) • Role-Based Employee Accounts`,
        };
      case 'fees':
        return {
          title: 'Fee Counter & Receipts',
          subtitle: 'Cash/Cheque Receipts, Parent UPI Reconciliation & Dues Follow-up',
        };
      case 'accounts-export':
        return {
          title: 'Tally & Fee Reconciliation Exports',
          subtitle: `${schoolProfile.name} • Daily Collections & Tally CSV Bundles`,
        };
      case 'students':
        return {
          title:
            currentStaff.department === 'TCH' && currentStaff.assignedClass
              ? `My Class Roster • ${currentStaff.assignedClass}`
              : 'Student Directory & Passes',
          subtitle: `${schoolBoard} Student Roster & App Login Slips`,
        };
      case 'circulars':
        return {
          title:
            currentStaff.department === 'TCH'
              ? 'Class Attendance & Official Notices'
              : 'Official Circulars & Attendance',
          subtitle: 'Digital Parent Broadcasts & Daily Attendance Register',
        };
      case 'syllabus':
        return {
          title: 'Curriculum Vault & 3D Labs',
          subtitle: `${schoolBoard} Visual Flowchart Roadmaps & 3D Labs`,
        };
      case 'marks':
        return {
          title: 'Exam Marks & Assessments',
          subtitle: `${schoolBoard} Term Grading & Report Card Sync`,
        };
      case 'settings':
        return {
          title: 'Campus Settings & Profile',
          subtitle: 'School Profile, Receipts Header & Appearance',
        };
      default:
        return {
          title: 'Edzy School ERP',
          subtitle: `${schoolProfile.name} (${schoolProfile.code})`,
        };
    }
  };

  const headerInfo = getHeaderInfo();

  return (
    <div className="flex h-dvh bg-[#F6F8FC] dark:bg-[#090D16] text-[#0F172A] dark:text-[#F8FAFC] antialiased overflow-hidden font-sans transition-colors">
      {/* Role-Filtered Navigation Sidebar & Mobile Drawer */}
      <Sidebar
        activeTab={safeTab}
        onSelectTab={handleSelectTab}
        onNavigatePath={navigateTo}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        drawerId="erp-mobile-drawer"
      />

      {/* Main Content Area */}
      <div
        inert={mobileMenuOpen || undefined}
        className="flex-1 flex flex-col min-w-0 overflow-hidden"
      >
        {/* Sticky Role-Filtered Top Header */}
        <TopHeader
          title={headerInfo.title}
          subtitle={headerInfo.subtitle}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          isMobileMenuOpen={mobileMenuOpen}
          mobileDrawerId="erp-mobile-drawer"
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
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 sm:p-6 lg:p-8">
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
