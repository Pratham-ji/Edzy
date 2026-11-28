import React, { useState } from 'react';
import {
  Check,
  Copy,
  Printer,
  ShieldCheck,
  School,
  Share2,
  KeyRound,
  BookOpen,
} from 'lucide-react';
import { SchoolProfile, SchoolStaff } from '../store/useAdminStore';
import { STAFF_DEPARTMENT_META } from '../lib/classScope';
import { getPortalUrl } from '../lib/siteConfig';

interface StaffActivationCardProps {
  staff: SchoolStaff;
  schoolProfile: SchoolProfile;
  subtitle?: string;
}

export const StaffActivationCard: React.FC<StaffActivationCardProps> = ({
  staff,
  schoolProfile,
  subtitle = 'Share this onboarding card so staff can activate their password on first login.',
}) => {
  const [copied, setCopied] = useState(false);
  const deptMeta = STAFF_DEPARTMENT_META[staff.department];
  const portalUrl = getPortalUrl();
  const schoolBoard = (schoolProfile.board || 'CBSE').split(' ')[0].toUpperCase();

  const whatsappInvite = `Hello ${staff.fullName},\n\nWelcome to *${schoolProfile.name}* Campus ERP on *Edzy*!\n\nYour official Employee Login ID has been issued:\n🆔 *Employee ID:* ${staff.id}\n👤 *Role:* ${staff.designation} (${deptMeta.shortLabel})${
    staff.assignedClass ? `\n🏫 *Class Scope:* ${staff.assignedClass}${staff.subject ? ` • ${staff.subject}` : ''}` : ''
  }\n🔗 *ERP Portal:* ${portalUrl}\n\n*First-Time Activation Steps:*\n1. Open the portal and enter your Employee ID: *${staff.id}*\n2. Set your own private password (min. 6 characters)\n3. Access your workspace immediately\n\nRegards,\nPrincipal Office, ${schoolProfile.name}`;

  const cleanPhone = (staff.phone || '').replace(/\D/g, '').slice(-10);
  const whatsappUrl =
    cleanPhone.length === 10
      ? `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(whatsappInvite)}`
      : null;

  const handleCopyInvite = async () => {
    try {
      await navigator.clipboard.writeText(whatsappInvite);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback copy via temporary textarea if clipboard API is restricted
      const el = document.createElement('textarea');
      el.value = whatsappInvite;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-[#475569] dark:text-[#94A3B8] no-print">{subtitle}</p>

      {/* Printable Staff Activation Card */}
      <div className="rounded-2xl border-2 border-dashed border-[#C7D2FE] dark:border-[#3730A3] bg-[#F6F8FC] dark:bg-[#090D16] p-5 space-y-4">
        <div className="flex items-start justify-between gap-3 border-b border-[#E2E8F0] dark:border-[#232E44] pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#4F46E5] text-white flex items-center justify-center shrink-0">
              <School className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#4F46E5] dark:text-[#6366F1]">
                Official Staff Activation Pass
              </div>
              <h4 className="text-sm font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
                {schoolProfile.name}
              </h4>
              <p className="text-[11px] text-[#475569] dark:text-[#94A3B8]">
                {schoolProfile.code} • {schoolBoard} • Session {schoolProfile.session}
              </p>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 ${deptMeta.badgeClass}`}>
            {deptMeta.label}
          </span>
        </div>

        {/* Highlighted Employee ID Block */}
        <div className="rounded-xl bg-[#0F172A] dark:bg-[#121826] border border-slate-800 dark:border-[#232E44] p-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Assigned Employee ID
            </div>
            <div className="text-xl font-mono font-extrabold text-indigo-300 tracking-wide mt-0.5">
              {staff.id}
            </div>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
              staff.isPasswordSet
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}
          >
            <KeyRound className="w-3 h-3" />
            {staff.isPasswordSet ? 'Password Activated' : 'Self-Setup Pending'}
          </span>
        </div>

        {/* Staff Details Grid */}
        <div className="grid grid-cols-2 gap-3 bg-white dark:bg-[#121826] rounded-xl p-3.5 border border-[#E2E8F0] dark:border-[#232E44] text-xs">
          <div>
            <div className="text-[10px] font-bold uppercase text-[#94A3B8]">Staff Name</div>
            <div className="font-bold text-[#0F172A] dark:text-[#F8FAFC] mt-0.5">{staff.fullName}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase text-[#94A3B8]">Designation</div>
            <div className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] mt-0.5">
              {staff.designation}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase text-[#94A3B8]">Access Scope</div>
            <div className="font-semibold text-[#4F46E5] dark:text-[#6366F1] mt-0.5 flex items-center gap-1">
              <BookOpen className="w-3 h-3 shrink-0" />
              <span>{staff.assignedClass || 'Campus-Wide'}</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase text-[#94A3B8]">
              {staff.subject ? 'Primary Subject' : 'Contact Phone'}
            </div>
            <div className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] mt-0.5">
              {staff.subject || (staff.phone ? `+91 ${staff.phone}` : 'Not provided')}
            </div>
          </div>
        </div>

        {/* Onboarding Note */}
        <div className="flex items-start gap-2 text-[11px] text-[#475569] dark:text-[#94A3B8] bg-white/80 dark:bg-[#1A2336]/70 rounded-xl p-3 border border-[#E2E8F0] dark:border-[#232E44]">
          <ShieldCheck className="w-4 h-4 text-[#059669] dark:text-[#34D399] shrink-0 mt-0.5" />
          <span>
            No temporary password is stored or emailed. The staff member activates their own private
            password on first login using <strong className="font-mono text-[#0F172A] dark:text-[#F8FAFC]">{staff.id}</strong>.
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="no-print flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={handleCopyInvite}
          className="flex-1 min-w-[170px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#4F46E5] hover:bg-[#3730A3] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied WhatsApp Invite!' : 'Copy WhatsApp Invite'}</span>
        </button>

        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Open WhatsApp</span>
          </a>
        )}

        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-xl bg-[#EEF2F7] dark:bg-[#1A2336] hover:bg-slate-200 dark:hover:bg-[#232E44] text-[#0F172A] dark:text-[#F8FAFC] text-xs font-bold border border-[#E2E8F0] dark:border-[#232E44] transition-colors cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print Card</span>
        </button>
      </div>
    </div>
  );
};

export default StaffActivationCard;
