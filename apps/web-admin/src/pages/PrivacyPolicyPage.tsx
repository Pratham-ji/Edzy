import React from 'react';
import {
  ShieldCheck,
  Lock,
  Camera,
  School,
  Database,
  Mail,
  ArrowLeft,
  CheckCircle,
  FileText,
  ExternalLink,
  Phone,
  Sparkles,
} from 'lucide-react';

interface PrivacyPolicyPageProps {
  onNavigateHome?: () => void;
  onNavigatePitch?: () => void;
}

export default function PrivacyPolicyPage({
  onNavigateHome,
  onNavigatePitch,
}: PrivacyPolicyPageProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <School className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-wider text-slate-900 dark:text-white">EDZY</span>
                <span className="text-[10px] bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 font-bold px-1.5 py-0.5 rounded border border-indigo-400/20">
                  LEGAL
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Privacy & Data Governance</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onNavigatePitch && (
              <button
                onClick={onNavigatePitch}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <span>School Pitch ↗</span>
              </button>
            )}
            <button
              onClick={onNavigateHome || (() => (window.location.href = '/'))}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-600/30 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to School ERP</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Document Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
        {/* Document Header */}
        <div className="space-y-4 border-b border-slate-200 dark:border-slate-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>India DPDP Act 2023 & Google Play Data Safety Certified</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Edzy Privacy Policy & Student Data Safety Standard
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <span>Effective Date: <strong>November 24, 2026</strong></span>
            <span>•</span>
            <span>Version: <strong>1.0.0 (Production Release)</strong></span>
            <span>•</span>
            <span>Scope: <strong>Unified Mobile App & School Web ERP</strong></span>
          </div>
        </div>

        {/* Executive Summary Card */}
        <div className="p-6 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-3">
          <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Executive Commitment to K-12 Institutions & Guardians</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            Edzy is an educational enterprise operating system designed exclusively for Indian schools (CBSE, ICSE, and State Boards). We operate under a strict <strong>Zero Commercial Advertising</strong> and <strong>Zero Student Profile Selling</strong> policy. All academic, financial, and attendance records are tenant-isolated and belong strictly to the student's enrolled campus.
          </p>
        </div>

        {/* Section 1: Information Collected */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>1. Categories of Data Collected & Educational Purpose</span>
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <h3 className="font-semibold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span>Student Directory & Academic Roster</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Roll number, full name, class/grade, section, and enrolled campus ID (e.g. <code>DVPS01</code>). Used solely to authenticate student access and route official homework circulars.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <h3 className="font-semibold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span>Fee Ledger & Financial Transactions</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Quarterly tuition installment status, payment methods (Cash/Cheque/UPI), clerk reconciliation notes, and cryptographically signed PDF receipt numbers.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <h3 className="font-semibold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span>Guardian Identity & Security PIN</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Parent guardian name, registered contact number, and a 4-digit Parent Security PIN required to authenticate digital fee approvals and parental screen time locks.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <h3 className="font-semibold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span>Curriculum Telemetry & Marks</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Periodic test scores, CBSE 9-point grades, chapter mastery milestones, and daily attendance percentages synced directly with teacher gradebooks.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Zero Camera Storage Policy */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Camera className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>2. Zero-Storage Spatial AR & Device Camera Policy</span>
          </h2>
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Edzy includes interactive 3D Spatial Science Labs (e.g. Plant Cell Biology, Solar System, Electric Motor AR). When a student launches an AR Lab, the mobile app requests <code>CAMERA</code> access strictly to anchor 3D WebGL models onto flat surfaces (tabletops or floors) using on-device Apple ARKit or Google ARCore capabilities.
            </p>
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 space-y-1">
              <strong>Crucial Data Safety Disclosure for Parents & Reviewers:</strong>
              <p>
                Camera feed frames are processed transiently in volatile device memory and are NEVER recorded, saved to gallery, or uploaded to any remote server or AI provider. No photos, videos, or spatial scans of children or home interiors leave the client device.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Financial & UPI Security */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>3. Bank-Grade UPI & Fee Payment Security</span>
          </h2>
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <p>
              When a parent pays school dues through the Edzy mobile app:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Transactions are executed via standard National Payments Corporation of India (NPCI) unified payment interface protocols.</li>
              <li>Edzy <strong>NEVER</strong> collects or stores bank account passwords, debit/credit card CVVs, or bank UPI MPINs.</li>
              <li>Verification occurs via the school's authorized nodal merchant account, and receipt numbers are generated instantly with a cryptographically verifiable transaction reference.</li>
            </ul>
          </div>
        </section>

        {/* Section 4: Data Retention & User Deletion Rights */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>4. Google Play Data Deletion & DPDP Act 2023 Compliance</span>
          </h2>
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              In accordance with Google Play's Data Safety Policy and the Digital Personal Data Protection Act (DPDP) 2023 of India, parents and school administrators have full sovereignty over their records:
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Right to Rectify & Export</span>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Parents may inspect or correct demographic data and export printable fee passbooks at any time directly through the app.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Account Deletion & Data Purging</span>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  To request permanent deletion of student profiles or study history, email{' '}
                  <a href="mailto:support@edzy.in" className="text-indigo-600 dark:text-indigo-400 font-semibold underline">
                    support@edzy.in
                  </a>
                  . Requests are authenticated and purged within 48 business hours.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Grievance Officer */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>5. Grievance Officer & Contact Information</span>
          </h2>
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <p>
              If you have any questions, security disclosures, or audit requests concerning Edzy data governance, contact our designated Data Protection & Grievance Officer:
            </p>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-mono text-xs space-y-1">
              <div><strong>Entity:</strong> Edzy Learning Technologies Pvt. Ltd.</div>
              <div><strong>Grievance Email:</strong> support@edzy.in</div>
              <div><strong>Campus Locations:</strong> Dehradun, Uttarakhand & New Delhi, India</div>
              <div><strong>Turnaround SLA:</strong> Acknowledgement in 24 hours, resolution in 15 days</div>
            </div>
          </div>
        </section>

        {/* Footer Back Button */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            © 2026 Edzy Learning Technologies. All rights reserved.
          </p>
          <button
            onClick={onNavigateHome || (() => (window.location.href = '/'))}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to School ERP Dashboard</span>
          </button>
        </div>
      </main>
    </div>
  );
}
