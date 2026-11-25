import React, { useEffect } from 'react';
import {
  X,
  Printer,
  Share2,
  Lock,
  User,
  School,
  ShieldCheck,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { useAdminStore, StudentRecord } from '../store/useAdminStore';

interface StudentLoginSlipModalProps {
  student: StudentRecord | null;
  onClose: () => void;
}

export const StudentLoginSlipModal: React.FC<StudentLoginSlipModalProps> = ({
  student,
  onClose,
}) => {
  const { schoolProfile } = useAdminStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!student) return null;

  const handlePrint = () => {
    window.print();
  };

  const schoolBoard = (schoolProfile.board || 'CBSE').split(' ')[0].toUpperCase();
  const whatsappMessage = `Dear ${student.parentName},\n\nGreetings from ${schoolProfile.name}!\n\nYour child ${student.name}'s Edzy Campus & At-Home AI Study Space account is now active.\n\n📱 Mobile App Download: https://edzy.app/download\n🏫 School Code: ${schoolProfile.code}\n🆔 Student Admission ID: ${student.id}\n🔑 Parent Fee Passbook PIN: ${student.parentPin}\n\nPlease install the app to view daily ${schoolBoard} attendance, 3D AR experiments, and quarterly fee receipts.\n\nRegards,\nPrincipal Office, ${schoolProfile.name}`;

  const whatsappUrl = `https://wa.me/91${student.parentPhone}?text=${encodeURIComponent(
    whatsappMessage
  )}`;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="no-print px-6 py-3 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <School className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold tracking-wide">STUDENT CREDENTIAL SLIP</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Slip</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white transition rounded-md cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Slip Body */}
        <div className="p-6 bg-white text-slate-900">
          <div className="border-2 border-dashed border-indigo-200 bg-indigo-50/30 rounded-2xl p-6 relative">
            {/* Header */}
            <div className="text-center border-b border-indigo-100 pb-4 mb-4">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full">
                OFFICIAL LOGIN CREDENTIAL PASS
              </span>
              <h2 className="text-base font-extrabold text-slate-900 mt-2">
                {schoolProfile.name}
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Academic Session {schoolProfile.session} • School Code:{' '}
                <span className="font-bold font-mono text-slate-800">{schoolProfile.code}</span>
              </p>
            </div>

            {/* Student Identification */}
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 mb-4 shadow-2xs space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Student Name:</span>
                <span className="font-bold text-slate-900">{student.name}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Class & Section:</span>
                <span className="font-bold text-slate-900">{student.classGrade} (Roll #{student.rollNo})</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Parent / Guardian:</span>
                <span className="font-semibold text-slate-800">{student.parentName}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Registered Phone:</span>
                <span className="font-mono text-slate-800">+91 {student.parentPhone}</span>
              </div>
            </div>

            {/* Credential Box */}
            <div className="bg-slate-900 text-white rounded-xl p-4 space-y-3">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Student Login ID / Roll Identifier
                </span>
                <p className="text-base font-mono font-extrabold text-cyan-400">{student.id}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    Student Default Password
                  </span>
                  <p className="text-sm font-mono font-bold text-white">1234</p>
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    Parent Security Fee PIN
                  </span>
                  <p className="text-sm font-mono font-bold text-emerald-400">{student.parentPin}</p>
                </div>
              </div>
            </div>

            {/* Verification Footer */}
            <div className="mt-4 flex items-center justify-between text-[10px] text-slate-500 pt-3 border-t border-indigo-100">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Authorized by IT Registrar</span>
              </div>
              <span>edzy.app/download</span>
            </div>
          </div>

          {/* Quick WhatsApp Share Button */}
          <div className="no-print mt-5 flex items-center justify-between gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition"
            >
              <Share2 className="w-4 h-4" />
              <span>Send Credentials via WhatsApp</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentLoginSlipModal;
