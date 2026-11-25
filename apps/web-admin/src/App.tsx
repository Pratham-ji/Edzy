import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { useAdminStore } from './store/useAdminStore';
import DashboardPage from './pages/DashboardPage';
import FeesPage from './pages/FeesPage';
import StudentsPage from './pages/StudentsPage';
import { CircularsAttendancePage } from './pages/CircularsAttendancePage';
import SyllabusPage from './pages/SyllabusPage';
import MarksPage from './pages/MarksPage';
import SettingsPage from './pages/SettingsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import SchoolPitchPage from './pages/SchoolPitchPage';

import OfflineFeeModal from './components/OfflineFeeModal';
import CsvImportModal from './components/CsvImportModal';
import UploadSyllabusModal from './components/UploadSyllabusModal';

export default function App() {
  const [pathname, setPathname] = useState(
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const { initializeRealtimeSync, schoolProfile } = useAdminStore();
  const schoolBoard = (schoolProfile.board || 'CBSE').split(' ')[0].toUpperCase();

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
    initializeRealtimeSync().then((c) => {
      cleanup = c;
    });
    return () => {
      cleanup?.();
    };
  }, [initializeRealtimeSync]);

  // Public Standalone Pages
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

  // Global Quick Modals
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isSyllabusModalOpen, setIsSyllabusModalOpen] = useState(false);

  // Tab Titles & Subtitles for Header
  const getHeaderInfo = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'Executive School Command Center',
          subtitle: `${schoolProfile.name} (${schoolProfile.code}) • ${schoolBoard} Affiliated Boarding & Day Campus`,
        };
      case 'fees':
        return {
          title: 'Hybrid Fee Counter & Receipts',
          subtitle: 'Desk Cash/Cheque Collection, UPI Reconciliation, and WhatsApp Due Reminders',
        };
      case 'students':
        return {
          title: 'Student Directory & Access Passes',
          subtitle: `${schoolBoard} Enrollment Roster, Mobile Pass Slips, and At-Home Study Telemetry`,
        };
      case 'circulars':
        return {
          title: 'Official Circulars & Attendance Register',
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
      {/* Deep Navy Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onNavigatePath={navigateTo}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Sticky Executive Top Header */}
        <TopHeader
          title={headerInfo.title}
          subtitle={headerInfo.subtitle}
          onOpenFeeModal={() => setIsFeeModalOpen(true)}
          onOpenCsvModal={() => setIsCsvModalOpen(true)}
          onOpenSyllabusModal={() => setIsSyllabusModalOpen(true)}
        />

        {/* Dynamic Page Scroll Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto pb-12">
            {activeTab === 'dashboard' && (
              <DashboardPage
                onNavigate={setActiveTab}
                onOpenFeeModal={() => setIsFeeModalOpen(true)}
                onOpenCsvModal={() => setIsCsvModalOpen(true)}
                onOpenSyllabusModal={() => setIsSyllabusModalOpen(true)}
              />
            )}
            {activeTab === 'fees' && <FeesPage />}
            {activeTab === 'students' && <StudentsPage />}
            {activeTab === 'circulars' && <CircularsAttendancePage />}
            {activeTab === 'syllabus' && <SyllabusPage />}
            {activeTab === 'marks' && <MarksPage />}
            {activeTab === 'settings' && <SettingsPage />}
          </div>
        </main>
      </div>

      {/* Global Modals triggered from Top Header */}
      {isFeeModalOpen && <OfflineFeeModal onClose={() => setIsFeeModalOpen(false)} />}
      {isCsvModalOpen && <CsvImportModal onClose={() => setIsCsvModalOpen(false)} />}
      {isSyllabusModalOpen && (
        <UploadSyllabusModal onClose={() => setIsSyllabusModalOpen(false)} />
      )}
    </div>
  );
}
