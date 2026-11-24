import React, { useState } from 'react';
import {
  School,
  CreditCard,
  BookOpen,
  Bell,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Clock,
  TrendingUp,
  FileCheck,
  Phone,
  MessageSquare,
  Award,
  ChevronRight,
  Building,
} from 'lucide-react';

interface SchoolPitchPageProps {
  onNavigateHome?: () => void;
  onNavigatePrivacy?: () => void;
}

export default function SchoolPitchPage({
  onNavigateHome,
  onNavigatePrivacy,
}: SchoolPitchPageProps) {
  const [studentCount, setStudentCount] = useState<number>(800);
  const [selectedPlan, setSelectedPlan] = useState<'core' | 'ai'>('ai');

  // Math Calculations
  const ratePerStudent = selectedPlan === 'core' ? 49 : 99;
  const monthlyTotal = studentCount * ratePerStudent;
  const annualTotal = monthlyTotal * 12;
  const clerkHoursSaved = Math.round(studentCount * 1.5);
  const parentTuitionSavings = Math.round(studentCount * 12000); // ~₹1,000/mo tuition replaced

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Floating Glass Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <School className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-wider text-white">EDZY</span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-bold px-1.5 py-0.5 rounded border border-indigo-400/30">
                  CAMPUS OS
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">B2B Indian School Enterprise</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onNavigatePrivacy && (
              <button
                onClick={onNavigatePrivacy}
                className="hidden md:inline-flex text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
              >
                Privacy & Data Safety
              </button>
            )}
            <a
              href="https://wa.me/919811234567?text=Hi%20Edzy%20Team,%20we%20want%20to%20explore%20a%20campus%20pilot%20for%20our%20school."
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold border border-slate-700 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Pilot Desk</span>
            </a>
            <button
              onClick={onNavigateHome || (() => (window.location.href = '/'))}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all transform active:scale-95"
            >
              <span>Launch School ERP</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 overflow-hidden">
        {/* Glow Background Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-indigo-600/20 to-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-semibold text-cyan-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Built for Indian K-12 Boarding & Day Schools (CBSE / ICSE / State Boards)</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight sm:leading-none">
            Turn Your School Into a Smart AI + 3D Campus{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-300 to-indigo-200">
              Without Allowing Phones Inside Classrooms.
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Edzy unifies a <strong>zero-leakage hybrid fee counter</strong>, real-time parent circulars, and at-home 3D spatial science labs into a single institutional platform. Save 100+ clerk hours every quarter and build unshakeable parent trust.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onNavigateHome || (() => (window.location.href = '/'))}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5"
            >
              <span>Launch Live School ERP Demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="https://wa.me/919811234567?text=Hi%20Edzy%20Team,%20we%20want%20to%20explore%20a%20campus%20pilot%20for%20our%20school."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition-all"
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Book a 10-Min Campus Pilot (WhatsApp)</span>
            </a>
          </div>

          {/* Social Proof Badges */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>India DPDP Act 2023 Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
              <span>Zero Classroom Phone Distraction</span>
            </div>
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-cyan-400" />
              <span>Piloted at Doon Valley Public School</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Core Value Pillars */}
      <section className="py-16 px-4 sm:px-6 bg-slate-950/60 border-y border-slate-800">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              The Three Core Pillars of Edzy
            </span>
            <h2 className="text-3xl font-extrabold text-white">
              Engineered For School Trustees, Teachers & Parents
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Pillar 1 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-6 hover:border-slate-700 transition-colors">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Hybrid Fee Counter & Instant UPI</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Collect cash and cheques at the school counter with 1-click receipt generation, or allow parents to pay via UPI on mobile with PIN authorization.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Cash Leakage:</span>
                  <span className="font-bold text-emerald-400">₹0 Reconciled</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Dues Recovery:</span>
                  <span className="font-bold text-cyan-400">+18.4% Faster</span>
                </div>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-6 hover:border-slate-700 transition-colors">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">At-Home 3D AR Labs & Socratic AI</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Empower students with 3D interactive physics and biology models on home devices. Solves doubts Socratically according to the official CBSE syllabus.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Classroom Policy:</span>
                  <span className="font-bold text-emerald-400">100% Phone-Free</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Parental Control:</span>
                  <span className="font-bold text-cyan-400">Daily Screen Limits</span>
                </div>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-6 hover:border-slate-700 transition-colors">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Bell className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Cloud Broadcasts & Live Attendance</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Publish official holiday notices and circulars directly to the mobile app in under 200ms. Eliminate lost paper circulars and expensive SMS gateway charges.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Delivery Latency:</span>
                  <span className="font-bold text-emerald-400">&lt;200ms Supabase Realtime</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Paper Circular Costs:</span>
                  <span className="font-bold text-cyan-400">100% Eliminated</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive School ROI & Pricing Calculator */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Transparent Institutional Pricing & Impact
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Calculate Your Campus ROI & Operational Savings
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl mx-auto">
              Simulate monthly school licensing and estimated administrative savings based on your enrolled student capacity.
            </p>
          </div>

          <div className="bg-slate-950 rounded-3xl border border-slate-800 p-6 sm:p-10 shadow-2xl space-y-8">
            {/* Plan Switcher */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Institutional Tier</span>
                <p className="text-sm text-slate-300 font-medium">Billed annually per enrolled student</p>
              </div>

              <div className="flex items-center p-1 bg-slate-900 rounded-xl border border-slate-800">
                <button
                  onClick={() => setSelectedPlan('core')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    selectedPlan === 'core'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Core School ERP (₹49/mo)
                </button>
                <button
                  onClick={() => setSelectedPlan('ai')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    selectedPlan === 'ai'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>AI + 3D Suite (₹99/mo)</span>
                </button>
              </div>
            </div>

            {/* Slider Control */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-300">Enrolled Student Capacity:</span>
                <span className="text-2xl font-extrabold text-cyan-400 font-mono">
                  {studentCount.toLocaleString('en-IN')} Students
                </span>
              </div>

              <input
                type="range"
                min="200"
                max="3000"
                step="50"
                value={studentCount}
                onChange={(e) => setStudentCount(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />

              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>200 (Pilot Batch)</span>
                <span>800 (Mid Campus)</span>
                <span>1,500 (Senior School)</span>
                <span>3,000+ (K-12 Flagship)</span>
              </div>
            </div>

            {/* Metric Output Cards */}
            <div className="grid sm:grid-cols-3 gap-4 pt-4">
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 space-y-1">
                <span className="text-xs text-slate-400 font-medium">Monthly School License</span>
                <div className="text-2xl font-extrabold text-white font-mono">
                  ₹{monthlyTotal.toLocaleString('en-IN')}
                </div>
                <span className="text-[11px] text-indigo-400">₹{ratePerStudent}/student/month</span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 space-y-1">
                <span className="text-xs text-slate-400 font-medium">Clerk & Admin Hours Saved</span>
                <div className="text-2xl font-extrabold text-emerald-400 font-mono">
                  {clerkHoursSaved.toLocaleString('en-IN')} hrs/yr
                </div>
                <span className="text-[11px] text-emerald-400/80">Zero manual receipt entry</span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 space-y-1">
                <span className="text-xs text-slate-400 font-medium">Est. Parent Tuition Savings</span>
                <div className="text-2xl font-extrabold text-cyan-300 font-mono">
                  ₹{parentTuitionSavings.toLocaleString('en-IN')}
                </div>
                <span className="text-[11px] text-cyan-400/80">Replaces private coaching</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800">
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero setup fees • 24-Hour onboarding with existing Tally/Excel records</span>
              </div>

              <a
                href={`https://wa.me/919811234567?text=Hi%20Edzy%20Team,%20we%20have%20${studentCount}%20students%20and%20want%20to%20review%20a%20campus%20pilot%20for%20the%20${selectedPlan === 'ai' ? 'AI%20Suite' : 'Core%20ERP'}.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Request Custom Campus Quote</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Pilot Proof Section */}
      <section className="py-16 px-4 sm:px-6 bg-slate-950/40 border-t border-slate-800 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white">How a 14-Day Campus Pilot Works</h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Experience the platform live on your campus with zero disruption to daily school operations.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 text-left">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="text-indigo-400 font-mono font-bold text-sm">DAY 1</div>
              <h4 className="text-sm font-bold text-white">1-Click CSV Roster Import</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Import existing CBSE student roll numbers, classes, and pending fee dues in 5 minutes via Excel.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="text-cyan-400 font-mono font-bold text-sm">DAY 2 - 7</div>
              <h4 className="text-sm font-bold text-white">Clerk Desk & Teacher Onboarding</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Accounts clerks use the Hybrid Fee Counter for desk receipts while teachers test instant attendance.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="text-emerald-400 font-mono font-bold text-sm">DAY 8 - 14</div>
              <h4 className="text-sm font-bold text-white">Parent App Rollout</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Distribute student pass slips. Parents view marks, pay dues via UPI, and students study via 3D AR labs.
              </p>
            </div>
          </div>

          <div className="pt-6">
            <button
              onClick={onNavigateHome || (() => (window.location.href = '/'))}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5"
            >
              <span>Explore Live ERP Dashboard Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 border-t border-slate-800 text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Edzy Learning Technologies Pvt. Ltd. • Dehradun & New Delhi</p>
          <div className="flex items-center gap-4">
            {onNavigatePrivacy && (
              <button onClick={onNavigatePrivacy} className="hover:text-white transition-colors">
                Privacy Policy
              </button>
            )}
            <span>•</span>
            <button onClick={onNavigateHome} className="hover:text-white transition-colors">
              School ERP
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
