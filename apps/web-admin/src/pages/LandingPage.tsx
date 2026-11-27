import React, { useState } from 'react';
import {
  ArrowRight,
  Bell,
  BookOpen,
  Building2,
  CheckCircle2,
  CreditCard,
  Cuboid,
  FileSpreadsheet,
  GitBranch,
  KeyRound,
  Lock,
  Menu,
  MessageSquare,
  Moon,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Sun,
  Users,
  X,
} from 'lucide-react';
import { useAdminStore } from '../store/useAdminStore';

export interface LandingPageProps {
  onNavigatePortal?: () => void;
  onNavigatePrivacy?: () => void;
  onNavigateHome?: () => void;
}

const WHATSAPP_BASE = 'https://wa.me/919811234567';

const NAV_LINKS = [
  { href: '#why-edzy', label: 'Why Edzy' },
  { href: '#role-erp', label: 'Role-Based ERP' },
  { href: '#ai-labs', label: 'AI & 3D Labs' },
  { href: '#security', label: 'Data Security' },
  { href: '#pricing', label: 'Pricing' },
];

export default function LandingPage({
  onNavigatePortal,
  onNavigatePrivacy,
  onNavigateHome,
}: LandingPageProps) {
  const { themeMode, toggleThemeMode } = useAdminStore();
  const [studentCount, setStudentCount] = useState<number>(800);
  const [selectedPlan, setSelectedPlan] = useState<'core' | 'ai'>('ai');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const goToPortal = () => {
    if (onNavigatePortal) {
      onNavigatePortal();
    } else if (onNavigateHome) {
      onNavigateHome();
    } else if (typeof window !== 'undefined') {
      window.location.href = '/portal';
    }
  };

  const goToPrivacy = () => {
    if (onNavigatePrivacy) {
      onNavigatePrivacy();
    } else if (typeof window !== 'undefined') {
      window.location.href = '/privacy-policy';
    }
  };

  const ratePerStudent = selectedPlan === 'core' ? 49 : 99;
  const monthlyInvestment = studentCount * ratePerStudent;
  const clerkHoursSaved = Math.round(studentCount * 1.5);
  const parentTuitionSavings = Math.round(studentCount * 12000);
  const rangeProgressPct = ((studentCount - 200) / 2800) * 100;

  return (
    <div className="min-h-screen bg-[#F6F8FC] dark:bg-[#090D16] text-[#0F172A] dark:text-[#F8FAFC] font-sans transition-colors selection:bg-[#4F46E5] selection:text-white">
      <a
        href="#main-content"
        className="visually-hidden focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:rounded-xl focus:bg-[#4F46E5] focus:text-white focus:text-xs focus:font-bold focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* Sticky Glassmorphic Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/85 dark:bg-[#0D1320]/85 backdrop-blur-md border-b border-[#E2E8F0] dark:border-[#232E44] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Left: Crisp EDZY Monogram + Wordmark */}
          <a
            href="#main-content"
            className="flex items-center gap-2.5 shrink-0 focus-visible:outline-2 focus-visible:outline-[#4F46E5] focus-visible:outline-offset-4 rounded-lg"
          >
            <span
              className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-[#4F46E5] to-[#6366F1] flex items-center justify-center shadow-md shadow-indigo-500/20 text-white font-black text-sm tracking-tight"
              aria-hidden="true"
            >
              EZ
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#FBBF24]" />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="font-extrabold text-base tracking-wider text-[#0F172A] dark:text-[#F8FAFC]">
                EDZY
              </span>
              <span className="hidden sm:block text-[10px] font-semibold text-[#475569] dark:text-[#94A3B8]">
                Education Made Easy
              </span>
            </span>
          </a>

          {/* Center Anchor Navigation (Desktop) */}
          <nav aria-label="Primary" className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="px-3 py-2 rounded-lg text-xs font-semibold text-[#475569] dark:text-[#94A3B8] hover:text-[#4F46E5] dark:hover:text-[#F8FAFC] hover:bg-[#EEF2F7] dark:hover:bg-[#1A2336] transition-colors whitespace-nowrap"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Right Controls & CTAs */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={toggleThemeMode}
              aria-label={themeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] bg-white dark:bg-[#121826] text-[#475569] dark:text-[#94A3B8] hover:bg-[#EEF2F7] dark:hover:bg-[#1A2336] transition-colors cursor-pointer"
            >
              {themeMode === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />
              ) : (
                <Moon className="w-4 h-4 text-[#475569]" aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              onClick={goToPortal}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#C7D2FE] dark:border-[#3730A3] bg-white dark:bg-[#121826] text-xs font-bold text-[#4F46E5] dark:text-[#818CF8] hover:bg-[#EEF2FF] dark:hover:bg-[#1B2440] transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>School Portal Login</span>
            </button>

            <a
              href={`${WHATSAPP_BASE}?text=${encodeURIComponent(
                'Namaste Edzy Team, we would like to book a Free Campus Pilot for our school.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#3730A3] text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-colors whitespace-nowrap"
            >
              <span>Book Free Campus Pilot</span>
            </a>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-site-menu"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open navigation menu'}
              className="lg:hidden p-2 rounded-xl border border-[#E2E8F0] dark:border-[#232E44] bg-white dark:bg-[#121826] text-[#0F172A] dark:text-[#F8FAFC] hover:bg-[#EEF2F7] dark:hover:bg-[#1A2336] cursor-pointer"
            >
              {mobileMenuOpen ? (
                <X className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Menu className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <nav
            id="mobile-site-menu"
            aria-label="Mobile navigation"
            className="lg:hidden border-t border-[#E2E8F0] dark:border-[#232E44] bg-white dark:bg-[#0D1320] px-4 py-4 space-y-2"
          >
            <ul className="space-y-1">
              {NAV_LINKS.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2.5 rounded-xl text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] hover:bg-[#EEF2FF] dark:hover:bg-[#1B2440]"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#232E44] flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  goToPortal();
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-[#C7D2FE] dark:border-[#3730A3] text-xs font-bold text-[#4F46E5] dark:text-[#818CF8] bg-[#EEF2FF]/60 dark:bg-[#1B2440] cursor-pointer"
              >
                School Portal Login →
              </button>
              <a
                href={`${WHATSAPP_BASE}?text=${encodeURIComponent(
                  'Namaste Edzy Team, we would like to book a Free Campus Pilot for our school.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-[#4F46E5] text-white text-xs font-bold text-center"
              >
                Book Free Campus Pilot
              </a>
            </div>
          </nav>
        )}
      </header>

      <main id="main-content" tabIndex={-1} className="outline-none">
        {/* Hero Section */}
        <section className="relative pt-14 pb-16 sm:pt-20 sm:pb-24 px-4 sm:px-6 overflow-hidden">
          <div
            className="absolute top-10 left-1/2 -translate-x-1/2 w-[720px] h-[340px] bg-gradient-to-tr from-[#4F46E5]/15 via-[#6366F1]/10 to-cyan-400/15 dark:from-[#4F46E5]/25 dark:to-cyan-500/15 rounded-full blur-3xl pointer-events-none"
            aria-hidden="true"
          />

          <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EEF2FF] dark:bg-[#1B2440] border border-[#C7D2FE] dark:border-[#3730A3] text-xs font-bold text-[#4F46E5] dark:text-[#818CF8]">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Built for CBSE, ICSE &amp; State Board Schools Across India</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.08] text-[#0F172A] dark:text-[#F8FAFC]">
              EDZY:{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4F46E5] via-[#6366F1] to-indigo-500 dark:from-[#818CF8] dark:to-cyan-300">
                Education Made Easy.
              </span>
            </h1>

            <p className="max-w-3xl mx-auto text-base sm:text-lg text-[#475569] dark:text-[#CBD5E1] leading-relaxed font-normal">
              Replace evening tuitions with your school&apos;s own AI roadmaps &amp; 3D visual labs — while running fees, marks, and attendance on one zero-clutter campus OS.
            </p>

            {/* Primary Dual CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <button
                type="button"
                onClick={goToPortal}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#4F46E5] hover:bg-[#3730A3] text-white font-bold text-sm shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
              >
                <span>Launch School Portal</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>

              <a
                href={`${WHATSAPP_BASE}?text=${encodeURIComponent(
                  'Namaste Edzy Team, we want to schedule a 10-min campus demo for our school.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white dark:bg-[#121826] hover:bg-[#EEF2F7] dark:hover:bg-[#1A2336] text-[#0F172A] dark:text-[#F8FAFC] font-bold text-sm border border-[#E2E8F0] dark:border-[#232E44] shadow-xs transition-all"
              >
                <MessageSquare className="w-4 h-4 text-[#059669] dark:text-[#34D399]" aria-hidden="true" />
                <span>Schedule a 10-Min Demo (WhatsApp)</span>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-5 sm:gap-8 text-xs font-semibold text-[#475569] dark:text-[#94A3B8]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#059669] dark:text-[#34D399]" aria-hidden="true" />
                <span>India DPDP Act Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4F46E5] dark:text-[#818CF8]" aria-hidden="true" />
                <span>Zero Classroom Phone Distraction</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#0284C7] dark:text-cyan-400" aria-hidden="true" />
                <span>Trusted by K-12 Campuses in Uttarakhand &amp; North India</span>
              </div>
            </div>
          </div>

          {/* 3-Pillar Interactive Visual Showcase Strip */}
          <div id="why-edzy" className="scroll-mt-20 max-w-6xl mx-auto mt-14 grid md:grid-cols-3 gap-5 relative z-10">
            <article className="p-6 rounded-2xl bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] dark:bg-[#1B2440] border border-[#C7D2FE] dark:border-[#3730A3] flex items-center justify-center text-[#4F46E5] dark:text-[#818CF8]">
                  <Smartphone className="w-5 h-5" aria-hidden="true" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-[#059669] dark:text-[#34D399] border border-emerald-200 dark:border-emerald-800">
                  100% Phone-Free
                </span>
              </div>
              <h2 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                Zero Phones Needed in Class
              </h2>
              <p className="text-xs text-[#475569] dark:text-[#94A3B8] leading-relaxed">
                Teachers run attendance and term grading cleanly from school desks; students unlock at-home 3D Labs and roadmaps strictly via parent-approved mobile sessions.
              </p>
            </article>

            <article className="p-6 rounded-2xl bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-200 dark:border-cyan-800/70 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                  <FileSpreadsheet className="w-5 h-5" aria-hidden="true" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#818CF8] border border-[#C7D2FE] dark:border-[#3730A3]">
                  Excel &amp; CSV Ready
                </span>
              </div>
              <h2 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                10-Min Excel Onboarding
              </h2>
              <p className="text-xs text-[#475569] dark:text-[#94A3B8] leading-relaxed">
                Import existing student rosters, class sections, and quarterly fee structures from spreadsheets in minutes with auto-generated Student &amp; Employee IDs.
              </p>
            </article>

            <article className="p-6 rounded-2xl bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-[#059669] dark:text-[#34D399]">
                  <CreditCard className="w-5 h-5" aria-hidden="true" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-[#059669] dark:text-[#34D399] border border-emerald-200 dark:border-emerald-800">
                  ₹0 Cash Leakage
                </span>
              </div>
              <h2 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                Live Parent UPI + Cash Reconciliation
              </h2>
              <p className="text-xs text-[#475569] dark:text-[#94A3B8] leading-relaxed">
                Issue digital receipts at the school counter for Cash/Cheque or verify parent mobile UPI payments automatically — synced straight to Tally-ready CSV bundles.
              </p>
            </article>
          </div>
        </section>

        {/* Role-Based Simplicity Showcase */}
        <section
          id="role-erp"
          className="scroll-mt-20 py-16 px-4 sm:px-6 bg-white dark:bg-[#0D1320] border-y border-[#E2E8F0] dark:border-[#232E44]"
        >
          <div className="max-w-6xl mx-auto space-y-10">
            <div className="text-center space-y-2.5">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#4F46E5] dark:text-[#818CF8]">
                Zero-Clutter Role-Scoped Workspaces
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
                Built for Every Desk — Seeing Only What Matters
              </h2>
              <p className="text-sm text-[#475569] dark:text-[#94A3B8] max-w-2xl mx-auto">
                Each employee activates their own personal password using a unique institutional Employee ID and lands in a distraction-free desk tailored strictly to their role.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <article className="p-6 rounded-2xl bg-[#F6F8FC] dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#818CF8] border border-[#C7D2FE] dark:border-[#3730A3]">
                      SCH-01-ADM-001
                    </span>
                    <KeyRound className="w-4 h-4 text-[#4F46E5] dark:text-[#818CF8]" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                    Principal Command Desk
                  </h3>
                  <p className="text-xs text-[#475569] dark:text-[#94A3B8] leading-relaxed">
                    Create sequential Employee IDs for Class Teachers and Accounts Clerks with 1-click WhatsApp onboarding cards, oversee live revenue &amp; attendance KPIs, and broadcast circulars campus-wide.
                  </p>
                </div>
                <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#232E44] flex items-center justify-between text-xs">
                  <span className="text-[#475569] dark:text-[#94A3B8]">Visibility:</span>
                  <span className="font-bold text-[#4F46E5] dark:text-[#818CF8]">Full School Governance</span>
                </div>
              </article>

              <article className="p-6 rounded-2xl bg-[#F6F8FC] dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                      SCH-01-TCH-001
                    </span>
                    <Users className="w-4 h-4 text-cyan-600 dark:text-cyan-400" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                    Alphabetical Class Teacher
                  </h3>
                  <p className="text-xs text-[#475569] dark:text-[#94A3B8] leading-relaxed">
                    Scoped strictly to the assigned section with automatic A → Z student sorting and roll re-indexing, rapid daily attendance marking, term mark sheets, and chapter roadmap publishing.
                  </p>
                </div>
                <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#232E44] flex items-center justify-between text-xs">
                  <span className="text-[#475569] dark:text-[#94A3B8]">Fee &amp; Admin Clutter:</span>
                  <span className="font-bold text-[#059669] dark:text-[#34D399]">Hidden Completely</span>
                </div>
              </article>

              <article className="p-6 rounded-2xl bg-[#F6F8FC] dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-[#059669] dark:text-[#34D399] border border-emerald-200 dark:border-emerald-800">
                      SCH-01-ACT-001
                    </span>
                    <CreditCard className="w-4 h-4 text-[#059669] dark:text-[#34D399]" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                    Lightning Accounts Desk
                  </h3>
                  <p className="text-xs text-[#475569] dark:text-[#94A3B8] leading-relaxed">
                    Instant Unique Student ID search (type <span className="font-mono font-semibold">SCH-01-205</span> or <span className="font-mono font-semibold">205</span> across 3,000+ records), 1-click Cash/Cheque receipts, WhatsApp dues reminders, and Tally CSV exports.
                  </p>
                </div>
                <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#232E44] flex items-center justify-between text-xs">
                  <span className="text-[#475569] dark:text-[#94A3B8]">Lookup Speed:</span>
                  <span className="font-bold text-[#059669] dark:text-[#34D399]">&lt; 50ms by Student ID</span>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* AI Syllabus Roadmaps, 3D Labs & 14-Day Pilot Section */}
        <section id="ai-labs" className="scroll-mt-20 py-16 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-2.5">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#4F46E5] dark:text-[#818CF8]">
                Eliminate Evening Tuitions
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
                Your Exact Board Syllabus, Powered by AI &amp; 3D Labs
              </h2>
              <p className="text-sm text-[#475569] dark:text-[#94A3B8] max-w-2xl mx-auto">
                Teachers approve every chapter syllabus. Students follow visual learning paths at home instead of relying on unverified external coaching.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <article className="p-6 rounded-2xl bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] space-y-3 shadow-xs">
                <div className="w-11 h-11 rounded-xl bg-[#EEF2FF] dark:bg-[#1B2440] border border-[#C7D2FE] dark:border-[#3730A3] flex items-center justify-center text-[#4F46E5] dark:text-[#818CF8]">
                  <GitBranch className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  Visual Flowchart Roadmaps &amp; Adaptive Pace
                </h3>
                <p className="text-xs text-[#475569] dark:text-[#94A3B8] leading-relaxed">
                  Convert any CBSE, ICSE, ISC, or State Board chapter into interactive step-by-step milestone roadmaps with deadline auto-adjustments and teacher-verified exam tips.
                </p>
              </article>

              <article className="p-6 rounded-2xl bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] space-y-3 shadow-xs">
                <div className="w-11 h-11 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-200 dark:border-cyan-800 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                  <Cuboid className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  At-Home 3D Science Labs &amp; Socratic AI
                </h3>
                <p className="text-xs text-[#475569] dark:text-[#94A3B8] leading-relaxed">
                  Students inspect 3D Physics and Biology models on their study table and ask guided Socratic questions grounded strictly in their school&apos;s published syllabus.
                </p>
              </article>

              <article className="p-6 rounded-2xl bg-white dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] space-y-3 shadow-xs">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-[#059669] dark:text-[#34D399]">
                  <Bell className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  Instant Parent Circulars &amp; Marks Sync
                </h3>
                <p className="text-xs text-[#475569] dark:text-[#94A3B8] leading-relaxed">
                  Replace lost paper notices and recurring SMS bills with instant digital circulars, live attendance alerts, and CBSE-aligned report cards on parents&apos; phones.
                </p>
              </article>
            </div>

            {/* 14-Day Campus Rollout Strip */}
            <div className="rounded-2xl bg-[#EEF2FF]/70 dark:bg-[#121826] border border-[#C7D2FE] dark:border-[#232E44] p-6 sm:p-8 grid sm:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <span className="text-xs font-mono font-bold text-[#4F46E5] dark:text-[#818CF8]">DAY 1</span>
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  CSV Roster &amp; Fee Import
                </h3>
                <p className="text-xs text-[#475569] dark:text-[#94A3B8] leading-relaxed">
                  Upload existing admission IDs, classes, and fee quarters in minutes without disrupting office operations.
                </p>
              </div>
              <div className="space-y-1.5">
                <span className="text-xs font-mono font-bold text-[#0284C7] dark:text-cyan-400">DAY 2 – 7</span>
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  Teachers &amp; Accounts Live
                </h3>
                <p className="text-xs text-[#475569] dark:text-[#94A3B8] leading-relaxed">
                  Staff activate their Employee IDs, collect desk receipts, mark attendance, and publish Unit Test marks.
                </p>
              </div>
              <div className="space-y-1.5">
                <span className="text-xs font-mono font-bold text-[#059669] dark:text-[#34D399]">DAY 8 – 14</span>
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  Parent App &amp; Study Rollout
                </h3>
                <p className="text-xs text-[#475569] dark:text-[#94A3B8] leading-relaxed">
                  Distribute Student ID pass slips. Parents pay dues via UPI and students unlock home 3D labs &amp; roadmaps.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Dedicated School Confidentiality & DPDP Act Trust Section */}
        <section
          id="security"
          className="scroll-mt-20 py-16 px-4 sm:px-6 bg-white dark:bg-[#0D1320] border-y border-[#E2E8F0] dark:border-[#232E44]"
        >
          <div className="max-w-6xl mx-auto space-y-10">
            <div className="text-center space-y-2.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-[#059669] dark:text-[#34D399]">
                <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Institutional Trust &amp; Legal Compliance</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
                Bank-Grade School Confidentiality &amp; DPDP Compliance
              </h2>
              <p className="text-sm text-[#475569] dark:text-[#94A3B8] max-w-2xl mx-auto">
                Your students, parents, and ledgers belong exclusively to your trust — built from the ground up for Indian school data governance.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <article className="p-6 rounded-2xl bg-[#F6F8FC] dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-[#059669] dark:text-[#34D399]">
                  <Building2 className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  100% Isolated School Vault
                </h3>
                <p className="text-xs text-[#475569] dark:text-[#94A3B8] leading-relaxed">
                  Every school operates in its own strictly scoped campus environment (<span className="font-mono font-semibold">SCH-XX</span>) — zero data overlap or cross-campus visibility between schools.
                </p>
              </article>

              <article className="p-6 rounded-2xl bg-[#F6F8FC] dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] dark:bg-[#1B2440] border border-[#C7D2FE] dark:border-[#3730A3] flex items-center justify-center text-[#4F46E5] dark:text-[#818CF8]">
                  <ShieldCheck className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  Zero-PII Founder Architecture
                </h3>
                <p className="text-xs text-[#475569] dark:text-[#94A3B8] leading-relaxed">
                  Edzy platform administrators view only aggregate campus health and billing counts — student records, exam marks, and parent contact details remain strictly confidential to your school.
                </p>
              </article>

              <article className="p-6 rounded-2xl bg-[#F6F8FC] dark:bg-[#121826] border border-[#E2E8F0] dark:border-[#232E44] space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Lock className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  India DPDP Act Compliant (Section 9 Ready)
                </h3>
                <p className="text-xs text-[#475569] dark:text-[#94A3B8] leading-relaxed">
                  Verifiable parental controls, zero third-party ads, zero behavioral tracking or profiling of students, and on-device-only camera processing for 3D AR labs.
                </p>
              </article>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={goToPrivacy}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4F46E5] dark:text-[#818CF8] hover:underline cursor-pointer"
              >
                <span>Read full Google Play &amp; India DPDP Act 2023 Safety Standard</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </section>

        {/* Interactive School ROI & Transparent INR Pricing Calculator */}
        <section id="pricing" className="scroll-mt-20 py-16 sm:py-20 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto space-y-10">
            <div className="text-center space-y-2.5">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#4F46E5] dark:text-[#818CF8]">
                Transparent INR Campus Pricing
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
                Calculate Your Campus ROI &amp; Parent Savings
              </h2>
              <p className="text-sm text-[#475569] dark:text-[#94A3B8] max-w-2xl mx-auto">
                Zero upfront hardware cost. Preview your monthly institutional plan and estimated parent tuition savings.
              </p>
            </div>

            <div className="bg-white dark:bg-[#121826] rounded-3xl border border-[#E2E8F0] dark:border-[#232E44] p-6 sm:p-10 shadow-xl shadow-slate-900/5 dark:shadow-black/30 space-y-8">
              {/* Plan Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0] dark:border-[#232E44]">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#475569] dark:text-[#94A3B8]">
                    Select Institutional Suite
                  </p>
                  <p className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC] mt-0.5">
                    Transparent per-student campus licensing
                  </p>
                </div>

                <div
                  role="group"
                  aria-label="Institutional licensing plans"
                  className="flex flex-wrap items-center p-1 bg-[#EEF2F7] dark:bg-[#1A2336] rounded-xl border border-[#E2E8F0] dark:border-[#232E44]"
                >
                  <button
                    type="button"
                    aria-pressed={selectedPlan === 'core'}
                    onClick={() => setSelectedPlan('core')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedPlan === 'core'
                        ? 'bg-[#4F46E5] text-white shadow-sm'
                        : 'text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
                    }`}
                  >
                    Core School ERP (₹49/mo)
                  </button>
                  <button
                    type="button"
                    aria-pressed={selectedPlan === 'ai'}
                    onClick={() => setSelectedPlan('ai')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      selectedPlan === 'ai'
                        ? 'bg-[#4F46E5] text-white shadow-sm'
                        : 'text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" aria-hidden="true" />
                    <span>Complete AI + 3D Suite (₹99/mo)</span>
                  </button>
                </div>
              </div>

              {/* Slider Control */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between gap-4">
                  <label
                    htmlFor="campus-student-slider"
                    className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]"
                  >
                    Enrolled Student Strength:
                  </label>
                  <span className="text-2xl font-extrabold font-mono text-[#4F46E5] dark:text-[#818CF8]">
                    {studentCount.toLocaleString('en-IN')} Students
                  </span>
                </div>

                <input
                  id="campus-student-slider"
                  type="range"
                  min={200}
                  max={3000}
                  step={50}
                  value={studentCount}
                  onChange={(e) => setStudentCount(Number(e.target.value))}
                  style={{ '--range-progress': `${rangeProgressPct}%` } as React.CSSProperties}
                  className="edzy-range w-full h-2.5 bg-[#E2E8F0] dark:bg-[#232E44] rounded-lg cursor-pointer"
                />

                <div className="flex justify-between text-[11px] text-[#475569] dark:text-[#94A3B8] font-mono">
                  <span>200 (Pilot)</span>
                  <span>800 (Mid Campus)</span>
                  <span>1,500 (Senior School)</span>
                  <span>3,000 (K-12 Group)</span>
                </div>
              </div>

              {/* Output Metric Cards */}
              <div className="grid sm:grid-cols-3 gap-4 pt-2">
                <div className="p-5 rounded-2xl bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] space-y-1">
                  <p className="text-xs font-semibold text-[#475569] dark:text-[#94A3B8]">
                    Monthly Campus Investment
                  </p>
                  <p className="text-2xl font-extrabold font-mono text-[#0F172A] dark:text-[#F8FAFC]">
                    ₹{monthlyInvestment.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[11px] font-semibold text-[#4F46E5] dark:text-[#818CF8]">
                    ₹{ratePerStudent} / student / month
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] space-y-1">
                  <p className="text-xs font-semibold text-[#475569] dark:text-[#94A3B8]">
                    Accounts Hours Saved
                  </p>
                  <p className="text-2xl font-extrabold font-mono text-[#059669] dark:text-[#34D399]">
                    {clerkHoursSaved.toLocaleString('en-IN')} hrs/yr
                  </p>
                  <p className="text-[11px] font-medium text-[#059669] dark:text-[#34D399]">
                    Zero manual fee passbook entry
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] space-y-1">
                  <p className="text-xs font-semibold text-[#475569] dark:text-[#94A3B8]">
                    Parent Tuition Savings
                  </p>
                  <p className="text-2xl font-extrabold font-mono text-[#0284C7] dark:text-cyan-300">
                    ₹{parentTuitionSavings.toLocaleString('en-IN')}/yr
                  </p>
                  <p className="text-[11px] font-medium text-[#475569] dark:text-[#94A3B8]">
                    Est. evening coaching replaced
                  </p>
                </div>
              </div>

              {/* Footer Action Strip */}
              <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#232E44] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs font-medium text-[#475569] dark:text-[#94A3B8]">
                  <CheckCircle2 className="w-4 h-4 text-[#059669] dark:text-[#34D399] shrink-0" aria-hidden="true" />
                  <span>Zero setup charges • Same-day Tally &amp; Excel student roster import</span>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={goToPortal}
                    className="px-4 py-2.5 rounded-xl border border-[#C7D2FE] dark:border-[#3730A3] text-xs font-bold text-[#4F46E5] dark:text-[#818CF8] hover:bg-[#EEF2FF] dark:hover:bg-[#1B2440] transition-colors cursor-pointer"
                  >
                    Try Portal
                  </button>
                  <a
                    href={`${WHATSAPP_BASE}?text=${encodeURIComponent(
                      `Hi Edzy Team, we have ${studentCount} students and want a proposal for ${
                        selectedPlan === 'ai' ? 'Complete AI + 3D Suite (₹99/mo)' : 'Core School ERP (₹49/mo)'
                      }.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" aria-hidden="true" />
                    <span>Request Campus Proposal</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Clean Executive Footer (Strictly Public Links — Zero Super-Admin Link) */}
      <footer className="py-10 px-4 sm:px-6 bg-white dark:bg-[#0D1320] border-t border-[#E2E8F0] dark:border-[#232E44] text-xs text-[#475569] dark:text-[#94A3B8]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span
              className="w-8 h-8 rounded-lg bg-[#4F46E5] text-white font-black text-xs flex items-center justify-center shrink-0"
              aria-hidden="true"
            >
              EZ
            </span>
            <div>
              <p className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                EDZY: Education Made Easy
              </p>
              <p className="text-[11px] text-[#475569] dark:text-[#94A3B8]">
                © 2026 Edzy Learning Technologies Pvt. Ltd. • Dehradun &amp; New Delhi, India
              </p>
            </div>
          </div>

          <nav aria-label="Footer navigation" className="flex flex-wrap items-center justify-center gap-5 font-semibold">
            <button
              type="button"
              onClick={goToPortal}
              className="text-[#4F46E5] dark:text-[#818CF8] hover:underline cursor-pointer"
            >
              School Login
            </button>
            <button
              type="button"
              onClick={goToPrivacy}
              className="hover:text-[#0F172A] dark:hover:text-[#F8FAFC] transition-colors cursor-pointer"
            >
              Privacy &amp; DPDP Policy
            </button>
            <a
              href="mailto:support@edzy.in"
              className="hover:text-[#0F172A] dark:hover:text-[#F8FAFC] transition-colors"
            >
              Contact Support
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
