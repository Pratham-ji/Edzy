import React, { useState } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import DashboardPage from './pages/DashboardPage';
import FeesPage from './pages/FeesPage';
import StudentsPage from './pages/StudentsPage';
import SyllabusPage from './pages/SyllabusPage';
import MarksPage from './pages/MarksPage';
import SettingsPage from './pages/SettingsPage';

import OfflineFeeModal from './components/OfflineFeeModal';
import CsvImportModal from './components/CsvImportModal';
import UploadSyllabusModal from './components/UploadSyllabusModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

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
          subtitle: 'Doon Valley Public School (DVPS01) • CBSE Affiliated Boarding & Day Campus',
        };
      case 'fees':
        return {
          title: 'Hybrid Fee Counter & Receipts',
          subtitle: 'Desk Cash/Cheque Collection, UPI Reconciliation, and WhatsApp Due Reminders',
        };
      case 'students':
        return {
          title: 'Student Directory & Access Passes',
          subtitle: 'CBSE Enrollment Roster, Mobile Pass Slips, and At-Home Study Telemetry',
        };
      case 'syllabus':
        return {
          title: 'Syllabus RAG & 3D Spatial Vault',
          subtitle: 'CBSE NCERT Textbook PDF Ingestion with Milestone Graphs and 3D AR Assets',
        };
      case 'marks':
        return {
          title: 'Academic Marks & Term Assessments',
          subtitle: 'CBSE 9-Point Grading Spreadsheet with Real-Time Parent App Sync',
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
    <div className="flex h-screen bg-slate-50 text-slate-800 antialiased overflow-hidden font-sans">
      {/* Deep Navy Sidebar */}
      <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

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
