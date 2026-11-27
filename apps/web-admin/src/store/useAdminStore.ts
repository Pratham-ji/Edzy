import { create } from 'zustand';
import { supabase, isLiveSupabaseConfigured } from '../lib/supabase';
import {
  FlowchartSpineMilestone,
  RevisionNoteItem,
  PracticeSheetData,
  RelatedChapterRef,
  normalizeMilestonesJson,
  serializeStudyPackToMilestonesJson,
  cleanBoardCode,
} from '../lib/syllabusGenerator';
import { getModelSpecByIdOrName } from '../lib/default3dModels';
import {
  StaffDepartment,
  generateNextEmployeeId,
  generateNextStudentId,
  sortStudentsAlphabetically,
} from '../lib/idGenerator';
import { hashStaffPassword, verifyStaffPassword } from '../lib/authCrypto';
import { resequenceStudentsAlphabeticallyByClass } from '../lib/classScope';

export type PaymentMethod = 'ONLINE_UPI' | 'OFFLINE_CASH' | 'OFFLINE_CHEQUE';
export type PaymentStatus = 'PAID' | 'PENDING' | 'OVERDUE';
export type ExamTerm = 'UNIT_TEST_1' | 'MIDTERM' | 'PRE_BOARD';
export type ARModelType =
  | 'Human Heart 3D'
  | 'Optics Ray Bench 3D'
  | 'Optics Bench 3D'
  | 'Quadratic Graph 3D'
  | 'Plant & Animal Cell 3D'
  | 'Animal Cell 3D'
  | 'Electric Circuit 3D'
  | 'None';

export type {
  FlowchartSpineMilestone,
  RevisionNoteItem,
  PracticeSheetData,
  RelatedChapterRef,
  StaffDepartment,
};

export interface SchoolStaff {
  id: string;
  schoolId: string;
  employeeSerial: number;
  fullName: string;
  department: StaffDepartment;
  designation: string;
  assignedClass: string | null;
  subject: string | null;
  phone: string | null;
  passwordHash: string | null;
  isPasswordSet: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface StudentRoadmapProgressSummary {
  id: string;
  schoolId: string;
  studentId: string;
  roadmapId: string;
  targetDeadline: string | null;
  totalDays: number;
  skippedDaysCount: number;
  paceStatus: 'ON_TRACK' | 'AUTO_ADJUSTED' | 'HIGH_PACE' | 'COMPLETED';
  completionPct: number;
  lastMasteredTopicTitle?: string;
  completedTodayCount?: number;
  nodeStates: Record<
    string,
    {
      status: 'not_started' | 'learning' | 'done';
      scheduledDate?: string;
      completedAt?: string;
    }
  >;
  updatedAt: string;
}

export interface SchoolTenantRecord {
  id: string;
  schoolSerial: number;
  schoolCode: string;
  name: string;
  board: string;
  principalName: string;
  academicSession: string;
}

export interface StudentRecord {
  id: string; // e.g. SCH-01-1001, SCH-01-205
  rollNo: string;
  name: string;
  classGrade: string; // e.g. Class 10-A, Class 9-B, Class 2-A
  section: string;
  parentName: string;
  parentPhone: string;
  parentPin: string;
  annualFee: number;
  totalPaid: number;
  totalPending: number;
  atHomeHoursThisWeek: number;
  streakDays: number;
  attendancePercent: number;
}

export interface FeeInstallmentRecord {
  id: string;
  studentId: string;
  studentName: string;
  classGrade: string;
  quarter: string; // e.g. Q1 (Apr - Jun 2026)
  amount: number;
  status: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentRef?: string;
  receiptNumber?: string;
  paidDate?: string;
  dueDate: string;
  clerkNote?: string;
}

export interface SyllabusChapterRecord {
  id: string;
  fileName: string;
  chapterNumber: number;
  title: string;
  classGrade: string;
  subject: string;
  board?: string;
  default3dModelId?: string;
  rawSyllabusText?: string;
  fileSizeBytes: string;
  uploadedAt: string;
  status: 'READY' | 'PROCESSING';
  arModelMapped: ARModelType;
  generatedMilestones: FlowchartSpineMilestone[];
  revisionNotes?: RevisionNoteItem[];
  practiceSheet?: PracticeSheetData;
  relatedChapters?: RelatedChapterRef[];
}

export interface StudentSubjectScore {
  subject: string;
  marksObtained: number;
  maxMarks: number;
  grade: string;
  remarks: string;
}

export interface StudentExamRecord {
  studentId: string;
  studentName: string;
  classGrade: string;
  rollNo: string;
  term: ExamTerm;
  scores: StudentSubjectScore[];
  aggregatePercentage: number;
  overallGrade: string;
  needsRemediation: boolean;
}

export interface AdminCircular {
  id: string;
  title: string;
  targetClass: string;
  category: 'ACADEMIC' | 'EXAM' | 'HOLIDAY' | 'SPORTS' | 'GENERAL';
  date: string;
  author: string;
  message: string;
  attachmentName?: string;
}

export interface SchoolProfile {
  name: string;
  code: string;
  affiliationNumber: string;
  board: string;
  session: string;
  address: string;
  city: string;
  state: string;
  principalName: string;
  accountantName: string;
  phone: string;
  email: string;
}

export function calculateCbseGrade(percentage: number): string {
  if (percentage >= 91) return 'A1';
  if (percentage >= 81) return 'A2';
  if (percentage >= 71) return 'B1';
  if (percentage >= 61) return 'B2';
  if (percentage >= 51) return 'C1';
  if (percentage >= 41) return 'C2';
  if (percentage >= 33) return 'D';
  return 'E';
}

export function normalizeExamTerm(raw: string): ExamTerm {
  const upper = (raw || '').toUpperCase().replace(/[\s-]/g, '_');
  if (upper.includes('PRE_BOARD') || upper.includes('PREBOARD')) return 'PRE_BOARD';
  if (upper.includes('MIDTERM') || upper.includes('MID_TERM')) return 'MIDTERM';
  return 'UNIT_TEST_1';
}

export function mapSchoolStaffRow(row: any): SchoolStaff {
  return {
    id: row.id,
    schoolId: row.school_id || 'SCH-01',
    employeeSerial: Number(row.employee_serial || 1),
    fullName: row.full_name || 'Staff Member',
    department: (row.department as StaffDepartment) || 'TCH',
    designation: row.designation || 'Faculty',
    assignedClass: row.assigned_class || null,
    subject: row.subject || null,
    phone: row.phone || null,
    passwordHash: row.password_hash || null,
    isPasswordSet: Boolean(row.is_password_set),
    status: row.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export function mapStudentRow(row: any): StudentRecord {
  return {
    id: row.id,
    rollNo: String(row.roll_number || row.roll_no || '01').padStart(2, '0'),
    name: row.full_name || row.name || 'Student',
    classGrade: row.class_grade || 'Class 10-A',
    section: row.section || (row.class_grade?.includes('-') ? row.class_grade.split('-')[1] : 'A'),
    parentName: row.parent_name || 'Parent',
    parentPhone: row.parent_phone || '',
    parentPin: row.parent_pin || '1234',
    annualFee: Number(row.total_fee ?? row.annual_fee ?? 48000),
    totalPaid: Number(row.paid_fee ?? row.total_paid ?? 0),
    totalPending: Number(
      row.balance_due ??
        row.total_pending ??
        Number(row.total_fee ?? row.annual_fee ?? 48000) - Number(row.paid_fee ?? row.total_paid ?? 0)
    ),
    atHomeHoursThisWeek: Number(row.weekly_study_hours ?? row.at_home_hours ?? 0),
    streakDays: Number(row.streak_days || 0),
    attendancePercent: Number(row.attendance_pct ?? row.attendance_percent ?? 95),
  };
}

export function mapFeeRow(row: any, students?: StudentRecord[]): FeeInstallmentRecord {
  const matchedStudent = students?.find((s) => s.id === row.student_id);
  return {
    id: row.id,
    studentId: row.student_id,
    studentName: row.student_name || matchedStudent?.name || 'Aarav Sharma',
    classGrade: row.class_grade || matchedStudent?.classGrade || 'Class 10-A',
    quarter: row.installment_title || row.quarter || 'Q1 (Apr - Jun 2026)',
    amount: Number(row.amount || 12000),
    status: (row.status as PaymentStatus) || 'PENDING',
    paymentMethod: (row.payment_mode as PaymentMethod) || undefined,
    paymentRef: row.payment_ref || row.reference_note || undefined,
    receiptNumber: row.receipt_number || undefined,
    paidDate: row.paid_at
      ? new Date(row.paid_at).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : undefined,
    dueDate: row.due_date ? String(row.due_date).split('T')[0] : '2026-11-30',
    clerkNote: row.reference_note || undefined,
  };
}

export function mapMarkRow(row: any, students?: StudentRecord[]): StudentExamRecord {
  const matchedStudent = students?.find((s) => s.id === row.student_id);
  const term = normalizeExamTerm(row.term || row.exam_type || 'PRE_BOARD');

  let scores: StudentSubjectScore[] = [];
  if (Array.isArray(row.scores_json) && row.scores_json.length > 0) {
    scores = row.scores_json.map((sc: any) => ({
      subject: sc.subject,
      marksObtained: Number(sc.marksObtained ?? sc.marks_obtained ?? 0),
      maxMarks: Number(sc.maxMarks ?? sc.max_marks ?? 100),
      grade: sc.grade || calculateCbseGrade(Number(sc.marksObtained ?? sc.marks_obtained ?? 0)),
      remarks: sc.remarks || sc.teacher_remarks || 'Good performance',
    }));
  } else if (row.subject) {
    scores = [
      {
        subject: row.subject,
        marksObtained: Number(row.marks_obtained || 0),
        maxMarks: Number(row.max_marks || 100),
        grade: row.grade || calculateCbseGrade(Number(row.marks_obtained || 0)),
        remarks: row.teacher_remarks || 'Consistent effort',
      },
    ];
  }

  const totalObtained = scores.reduce((sum, s) => sum + s.marksObtained, 0);
  const totalMax = scores.reduce((sum, s) => sum + s.maxMarks, 0) || 100;
  const aggregatePercentage = Number(row.aggregate_percentage || ((totalObtained / totalMax) * 100).toFixed(1));

  return {
    studentId: row.student_id,
    studentName: row.student_name || matchedStudent?.name || 'Aarav Sharma',
    classGrade: row.class_grade || matchedStudent?.classGrade || 'Class 10-A',
    rollNo: row.roll_number || row.roll_no ? String(row.roll_number || row.roll_no).padStart(2, '0') : matchedStudent?.rollNo || '01',
    term,
    scores,
    aggregatePercentage,
    overallGrade: row.overall_grade || calculateCbseGrade(aggregatePercentage),
    needsRemediation: Boolean(row.needs_remediation || aggregatePercentage < 60),
  };
}

export function mapSyllabusRow(row: any): SyllabusChapterRecord {
  const id = row.id || `syl-${Date.now()}`;
  const title = row.title || row.chapter_title || '';
  const subject = row.subject || 'Science';
  const chapterNumber = Number(row.chapter_number || 1);
  const rawArName = row.ar_model_mapped || row.ar_model_name || 'None';
  const normalized = normalizeMilestonesJson(row.milestones_json, {
    id,
    title,
    subject,
    chapterNumber,
    board: row.board || 'CBSE',
    arModelName: rawArName,
  });
  const modelSpec = getModelSpecByIdOrName(normalized.default3dModelId || rawArName);

  return {
    id,
    fileName: row.file_name || row.pdf_filename || 'Chapter_Syllabus.txt',
    chapterNumber,
    title,
    classGrade: row.class_grade || 'Class 10',
    subject,
    board: normalized.board,
    default3dModelId: normalized.default3dModelId,
    fileSizeBytes: row.file_size_bytes || row.file_size_label || '4.5 MB',
    uploadedAt: row.created_at
      ? new Date(row.created_at).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : 'Today',
    status: (row.status as any) || 'READY',
    arModelMapped: (modelSpec.name as ARModelType) || (rawArName as ARModelType),
    generatedMilestones: normalized.generatedMilestones,
    revisionNotes: normalized.revisionNotes,
    practiceSheet: normalized.practiceSheet,
    relatedChapters: normalized.relatedChapters,
  };
}

export function mapStudentRoadmapProgressRow(row: any): StudentRoadmapProgressSummary {
  const nodeStates = (row.node_states_json && typeof row.node_states_json === 'object'
    ? row.node_states_json
    : {}) as Record<string, { status: 'not_started' | 'learning' | 'done'; scheduledDate?: string; completedAt?: string }>;
  const entries = Object.values(nodeStates);
  const todayStr = new Date().toISOString().split('T')[0];
  const completedTodayCount = entries.filter(
    (e) => e.status === 'done' && (e.completedAt?.startsWith(todayStr) || e.scheduledDate === todayStr)
  ).length;

  return {
    id: row.id || `${row.student_id}-${row.roadmap_id}`,
    schoolId: row.school_id || 'SCH-01',
    studentId: row.student_id,
    roadmapId: row.roadmap_id,
    targetDeadline: row.target_deadline || null,
    totalDays: Number(row.total_days || 7),
    skippedDaysCount: Number(row.skipped_days_count || 0),
    paceStatus: (row.pace_status || 'ON_TRACK') as any,
    completionPct: Number(row.completion_pct || 0),
    completedTodayCount,
    nodeStates,
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

export function mapCircularRow(row: any): AdminCircular {
  return {
    id: row.id,
    title: row.title || '',
    targetClass: row.target_class || 'All',
    category: (row.category ? row.category.toUpperCase() : 'GENERAL') as any,
    date: row.published_at || row.created_at
      ? new Date(row.published_at || row.created_at).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    author: row.published_by || row.author || 'Principal Office',
    message: row.message || '',
    attachmentName: row.attachment_name || undefined,
  };
}

function buildQuarterInstallmentsForStudent(
  student: StudentRecord,
  paidQuarters: number,
  feePrefix = 'inst'
): FeeInstallmentRecord[] {
  const shortCode = student.id.replace(/^[A-Z]+-\d+-/i, '').toLowerCase();
  const quarterDefs = [
    { q: 'Q1 (Apr - Jun 2026)', due: '2026-04-30', paidDate: '12 Apr 2026', mode: 'OFFLINE_CASH' as PaymentMethod, receipt: `#SCH-1${shortCode}`, note: 'Accounts Desk Counter #1' },
    { q: 'Q2 (Jul - Sep 2026)', due: '2026-07-31', paidDate: '14 Jul 2026', mode: 'OFFLINE_CHEQUE' as PaymentMethod, receipt: `#SCH-2${shortCode}`, note: 'Cleared Cheque Payment' },
    { q: 'Q3 (Oct - Dec 2026)', due: '2026-10-31', paidDate: '05 Oct 2026', mode: 'ONLINE_UPI' as PaymentMethod, receipt: `#EDZ-3${shortCode}`, note: 'Edzy Instant UPI Gateway' },
    { q: 'Q4 (Jan - Mar 2027)', due: '2026-11-30', paidDate: '02 Nov 2026', mode: 'ONLINE_UPI' as PaymentMethod, receipt: `#EDZ-4${shortCode}`, note: 'Quarter 4 Installment Due' },
  ];
  const quarterAmount = Math.round(student.annualFee / 4);

  return quarterDefs.map((qDef, idx) => {
    const isPaid = idx < paidQuarters;
    return {
      id: `${feePrefix}-${shortCode}-q${idx + 1}`,
      studentId: student.id,
      studentName: student.name,
      classGrade: student.classGrade,
      quarter: qDef.q,
      amount: quarterAmount,
      status: isPaid ? 'PAID' : 'PENDING',
      paymentMethod: isPaid ? qDef.mode : undefined,
      paymentRef: isPaid ? qDef.note : undefined,
      receiptNumber: isPaid ? qDef.receipt.toUpperCase() : undefined,
      paidDate: isPaid ? qDef.paidDate : undefined,
      dueDate: qDef.due,
      clerkNote: isPaid ? qDef.note : undefined,
    };
  });
}

// ====================================================================
// SEED DATA MATCHING supabase/edzy_complete_setup.sql 1:1
// ====================================================================
const SEED_STAFF_PASSWORD_HASH =
  'ef99c298f748f0479f1857e80755d1ef48450d74ebeed8caa267bd7aa1267542'; // edzy-salt-v1:edzy123

const INITIAL_SCHOOLS: SchoolTenantRecord[] = [
  {
    id: 'SCH-01',
    schoolSerial: 1,
    schoolCode: 'SCH-01',
    name: 'Doon Valley Public School',
    board: 'CBSE',
    principalName: 'Dr. Meenakshi Sharma',
    academicSession: '2026-27',
  },
  {
    id: 'SCH-02',
    schoolSerial: 2,
    schoolCode: 'SCH-02',
    name: "St. Joseph's Academy",
    board: 'ICSE',
    principalName: 'Fr. Joseph Thomas',
    academicSession: '2026-27',
  },
];

const INITIAL_STAFF: SchoolStaff[] = [
  {
    id: 'SCH-01-ADM-001',
    schoolId: 'SCH-01',
    employeeSerial: 1,
    fullName: 'Dr. Meenakshi Sharma',
    department: 'ADM',
    designation: 'Principal & ERP Admin',
    assignedClass: null,
    subject: null,
    phone: '9811000001',
    passwordHash: SEED_STAFF_PASSWORD_HASH,
    isPasswordSet: true,
    status: 'ACTIVE',
    createdAt: '2026-04-01T08:00:00Z',
  },
  {
    id: 'SCH-01-TCH-001',
    schoolId: 'SCH-01',
    employeeSerial: 1,
    fullName: 'Mrs. Sunita Rawat',
    department: 'TCH',
    designation: 'Class Teacher',
    assignedClass: 'Class 10-A',
    subject: 'Science',
    phone: '9811000002',
    passwordHash: SEED_STAFF_PASSWORD_HASH,
    isPasswordSet: true,
    status: 'ACTIVE',
    createdAt: '2026-04-01T08:05:00Z',
  },
  {
    id: 'SCH-01-TCH-002',
    schoolId: 'SCH-01',
    employeeSerial: 2,
    fullName: 'Mr. Vikram Negi',
    department: 'TCH',
    designation: 'Class Teacher',
    assignedClass: 'Class 9-B',
    subject: 'Mathematics',
    phone: '9811000003',
    passwordHash: SEED_STAFF_PASSWORD_HASH,
    isPasswordSet: true,
    status: 'ACTIVE',
    createdAt: '2026-04-01T08:10:00Z',
  },
  {
    id: 'SCH-01-TCH-003',
    schoolId: 'SCH-01',
    employeeSerial: 3,
    fullName: 'Ms. Kavita Joshi',
    department: 'TCH',
    designation: 'Class Teacher',
    assignedClass: 'Class 2-A',
    subject: 'All Subjects',
    phone: '9811000004',
    passwordHash: null,
    isPasswordSet: false,
    status: 'ACTIVE',
    createdAt: '2026-04-01T08:15:00Z',
  },
  {
    id: 'SCH-01-ACT-001',
    schoolId: 'SCH-01',
    employeeSerial: 1,
    fullName: 'Mr. Harish Pant',
    department: 'ACT',
    designation: 'Senior Accounts Officer',
    assignedClass: null,
    subject: null,
    phone: '9811000005',
    passwordHash: SEED_STAFF_PASSWORD_HASH,
    isPasswordSet: true,
    status: 'ACTIVE',
    createdAt: '2026-04-01T08:20:00Z',
  },
];

type SeedStudentTuple = [
  id: string,
  rollNo: string,
  name: string,
  classGrade: string,
  section: string,
  parentName: string,
  parentPhone: string,
  annualFee: number,
  paidQuarters: number,
  hours: number,
  streak: number,
  attendance: number
];

const RAW_SEED_STUDENTS: SeedStudentTuple[] = [
  // Class 10-A (Strict A -> Z)
  ['SCH-01-1001', '01', 'Aarav Sharma', 'Class 10-A', 'A', 'Rajesh Sharma', '9811234567', 48000, 3, 6.5, 12, 96.8],
  ['SCH-01-1002', '02', 'Ananya Verma', 'Class 10-A', 'A', 'Amit Verma', '9811234502', 48000, 4, 8.2, 19, 98.5],
  ['SCH-01-1003', '03', 'Diya Nair', 'Class 10-A', 'A', 'Suresh Nair', '9811234503', 48000, 2, 5.1, 8, 93.4],
  ['SCH-01-1004', '04', 'Kabir Mehta', 'Class 10-A', 'A', 'Vivek Mehta', '9811234504', 48000, 4, 7.4, 15, 97.2],
  ['SCH-01-1005', '05', 'Priya Patel', 'Class 10-A', 'A', 'Rakesh Patel', '9811234505', 48000, 4, 6.9, 16, 99.1],
  ['SCH-01-1006', '06', 'Rohan Gupta', 'Class 10-A', 'A', 'Sunil Gupta', '9811234506', 48000, 3, 4.5, 7, 92.0],
  ['SCH-01-1007', '07', 'Tanvi Rawat', 'Class 10-A', 'A', 'Harish Rawat', '9811234507', 48000, 4, 7.9, 18, 96.5],
  ['SCH-01-1008', '08', 'Yash Chauhan', 'Class 10-A', 'A', 'Manoj Chauhan', '9811234508', 48000, 3, 5.6, 9, 94.6],

  // Class 9-B (Strict A -> Z)
  ['SCH-01-901', '01', 'Aditya Kulkarni', 'Class 9-B', 'B', 'Pravin Kulkarni', '9811234511', 44000, 4, 8.5, 21, 98.9],
  ['SCH-01-902', '02', 'Meera Deshmukh', 'Class 9-B', 'B', 'Anand Deshmukh', '9811234512', 44000, 3, 4.8, 8, 91.2],
  ['SCH-01-903', '03', 'Nikhil Bisht', 'Class 9-B', 'B', 'Mohan Bisht', '9811234513', 44000, 4, 7.2, 15, 97.8],
  ['SCH-01-904', '04', 'Riya Sengupta', 'Class 9-B', 'B', 'Subhash Sengupta', '9811234514', 44000, 2, 3.5, 5, 88.5],
  ['SCH-01-905', '05', 'Siddharth Rao', 'Class 9-B', 'B', 'Prakash Rao', '9811234515', 44000, 4, 6.9, 13, 96.0],
  ['SCH-01-906', '06', 'Sneha Reddy', 'Class 9-B', 'B', 'Venkat Reddy', '9811234516', 44000, 2, 4.1, 6, 90.4],

  // Class 2-A (Strict A -> Z)
  ['SCH-01-201', '01', 'Aadhya Negi', 'Class 2-A', 'A', 'Dinesh Negi', '9811234521', 32000, 4, 3.8, 14, 98.0],
  ['SCH-01-202', '02', 'Aarush Rawat', 'Class 2-A', 'A', 'Mahesh Rawat', '9811234522', 32000, 4, 4.0, 11, 97.5],
  ['SCH-01-203', '03', 'Ishaan Verma', 'Class 2-A', 'A', 'Sanjay Verma', '9811234523', 32000, 3, 3.2, 7, 94.2],
  ['SCH-01-204', '04', 'Myra Pant', 'Class 2-A', 'A', 'Alok Pant', '9811234524', 32000, 4, 4.5, 17, 99.0],
  ['SCH-01-205', '05', 'Vedant Joshi', 'Class 2-A', 'A', 'Sanjay Joshi', '9811234525', 32000, 3, 3.6, 9, 95.5],
];

const INITIAL_STUDENTS: StudentRecord[] = RAW_SEED_STUDENTS.map(
  ([id, rollNo, name, classGrade, section, parentName, parentPhone, annualFee, paidQuarters, hours, streak, attendance]) => {
    const qAmt = Math.round(annualFee / 4);
    const totalPaid = paidQuarters * qAmt;
    return {
      id,
      rollNo,
      name,
      classGrade,
      section,
      parentName,
      parentPhone,
      parentPin: '1234',
      annualFee,
      totalPaid,
      totalPending: annualFee - totalPaid,
      atHomeHoursThisWeek: hours,
      streakDays: streak,
      attendancePercent: attendance,
    };
  }
);

const INITIAL_INSTALLMENTS: FeeInstallmentRecord[] = RAW_SEED_STUDENTS.flatMap((tuple, idx) =>
  buildQuarterInstallmentsForStudent(INITIAL_STUDENTS[idx], tuple[8])
);

const INITIAL_ATTENDANCE: Record<string, 'PRESENT' | 'ABSENT'> = Object.fromEntries(
  INITIAL_STUDENTS.map((s) => [s.id, s.id === 'SCH-01-904' ? 'ABSENT' : 'PRESENT'])
);

const INITIAL_CIRCULARS: AdminCircular[] = [
  {
    id: 'circ-001',
    title: 'Class 10 Pre-Board Examination Schedule & Guidelines',
    targetClass: 'Class 10-A',
    category: 'EXAM',
    date: '20 Nov 2026',
    author: 'Examination Controller',
    message: 'Pre-Board practical submissions and theory examination commences from 15th December 2026. Hall tickets and admit cards are available for verification.',
    attachmentName: 'PreBoard_Schedule_2026-27.pdf',
  },
  {
    id: 'circ-002',
    title: 'Winter Timings Notice & School Uniform Advisory',
    targetClass: 'All',
    category: 'GENERAL',
    date: '22 Nov 2026',
    author: 'Principal Office',
    message: 'Effective Monday 1st December, school timings will be 8:30 AM to 2:30 PM due to seasonal morning fog. Winter navy blazers and woollen caps are mandatory for all students.',
    attachmentName: 'Winter_Advisory_2026-27.pdf',
  },
];

const RAW_INITIAL_SYLLABUS: Array<{
  id: string;
  fileName: string;
  chapterNumber: number;
  title: string;
  classGrade: string;
  subject: string;
  fileSizeBytes: string;
  uploadedAt: string;
  arModelMapped: ARModelType;
  milestones: Array<{ nodeId: string; title: string; ncertPageRange: string; ragStatus: 'GROUNDED' }>;
}> = [
  {
    id: 'syl-01',
    fileName: 'Class10_Bio_Ch6_LifeProcesses.pdf',
    chapterNumber: 6,
    title: 'Life Processes: Cardiac Anatomy & Systemic Circulation',
    classGrade: 'Class 10',
    subject: 'Biology (Science)',
    fileSizeBytes: '4.2 MB',
    uploadedAt: '15 Oct 2026',
    arModelMapped: 'Human Heart 3D',
    milestones: [
      { nodeId: 'm-1', title: '6.1 Nutrition & Stomata Exchange', ncertPageRange: 'Pages 93-98', ragStatus: 'GROUNDED' },
      { nodeId: 'm-2', title: '6.2 Human Digestive Tract & Enzymes', ncertPageRange: 'Pages 99-105', ragStatus: 'GROUNDED' },
      { nodeId: 'm-3', title: '6.3 Human Heart & Double Circulation', ncertPageRange: 'Pages 106-110', ragStatus: 'GROUNDED' },
      { nodeId: 'm-4', title: '6.4 Excretion & Nephron Filtration', ncertPageRange: 'Pages 111-115', ragStatus: 'GROUNDED' },
    ],
  },
  {
    id: 'syl-02',
    fileName: 'Class10_Phy_Ch10_Optics.pdf',
    chapterNumber: 10,
    title: 'Light: Reflection & Refraction (Ray Optics & Lenses)',
    classGrade: 'Class 10',
    subject: 'Physics (Science)',
    fileSizeBytes: '5.8 MB',
    uploadedAt: '22 Oct 2026',
    arModelMapped: 'Optics Ray Bench 3D',
    milestones: [
      { nodeId: 'p-1', title: '10.1 Spherical Mirrors & Sign Convention', ncertPageRange: 'Pages 160-168', ragStatus: 'GROUNDED' },
      { nodeId: 'p-2', title: '10.2 Mirror Formula & Refraction', ncertPageRange: 'Pages 169-180', ragStatus: 'GROUNDED' },
      { nodeId: 'p-3', title: '10.3 Lenses, Power (Dioptre) & Ray Diagrams', ncertPageRange: 'Pages 181-191', ragStatus: 'GROUNDED' },
    ],
  },
  {
    id: 'syl-03',
    fileName: 'Class10_Math_Ch4_Quadratic.pdf',
    chapterNumber: 4,
    title: 'Quadratic Equations & Discriminant Analysis',
    classGrade: 'Class 10',
    subject: 'Mathematics',
    fileSizeBytes: '3.9 MB',
    uploadedAt: '01 Nov 2026',
    arModelMapped: 'Quadratic Graph 3D',
    milestones: [
      { nodeId: 'q-1', title: '4.1 Standard Form & Middle-Term Splitting', ncertPageRange: 'Pages 70-76', ragStatus: 'GROUNDED' },
      { nodeId: 'q-2', title: '4.2 Quadratic Formula & Nature of Roots', ncertPageRange: 'Pages 77-91', ragStatus: 'GROUNDED' },
      { nodeId: 'q-3', title: '4.3 Applied Speed-Time & Area Word Problems', ncertPageRange: 'Pages 92-97', ragStatus: 'GROUNDED' },
    ],
  },
];

const INITIAL_SYLLABUS: SyllabusChapterRecord[] = RAW_INITIAL_SYLLABUS.map((item) => {
  const norm = normalizeMilestonesJson(item.milestones, {
    id: item.id,
    title: item.title,
    subject: item.subject,
    chapterNumber: item.chapterNumber,
    board: 'CBSE',
    arModelName: item.arModelMapped,
  });
  return {
    id: item.id,
    fileName: item.fileName,
    chapterNumber: item.chapterNumber,
    title: item.title,
    classGrade: item.classGrade,
    subject: item.subject,
    board: norm.board,
    default3dModelId: norm.default3dModelId,
    fileSizeBytes: item.fileSizeBytes,
    uploadedAt: item.uploadedAt,
    status: 'READY',
    arModelMapped: item.arModelMapped,
    generatedMilestones: norm.generatedMilestones,
    revisionNotes: norm.revisionNotes,
    practiceSheet: norm.practiceSheet,
    relatedChapters: RAW_INITIAL_SYLLABUS.filter((other) => other.id !== item.id)
      .slice(0, 2)
      .map((other) => ({
        id: other.id,
        chapterNumber: other.chapterNumber,
        title: other.title,
        subject: other.subject,
      })),
  };
});

const INITIAL_PROGRESS_LIST: StudentRoadmapProgressSummary[] = [
  {
    id: 'SCH-01-1001-syl-01',
    schoolId: 'SCH-01',
    studentId: 'SCH-01-1001',
    roadmapId: 'syl-01',
    targetDeadline: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    totalDays: 7,
    skippedDaysCount: 0,
    paceStatus: 'ON_TRACK',
    completionPct: 50,
    lastMasteredTopicTitle: 'Intestinal Villi Surface Area',
    completedTodayCount: 2,
    nodeStates: {
      'm-1-b1': { status: 'done' },
      'm-1-b2': { status: 'done' },
      'm-2-b1': { status: 'done' },
      'm-2-b2': { status: 'done' },
      'm-3-b1': { status: 'learning' },
    },
    updatedAt: new Date().toISOString(),
  },
];

const INITIAL_EXAM_MARKS: StudentExamRecord[] = [
  {
    studentId: 'SCH-01-1001',
    studentName: 'Aarav Sharma',
    classGrade: 'Class 10-A',
    rollNo: '01',
    term: 'PRE_BOARD',
    aggregatePercentage: 92.6,
    overallGrade: 'A1',
    needsRemediation: false,
    scores: [
      { subject: 'Science & Lab', marksObtained: 94, maxMarks: 100, grade: 'A1', remarks: 'Exceptional diagrammatic clarity in Biology & ray optics.' },
      { subject: 'Mathematics', marksObtained: 91, maxMarks: 100, grade: 'A1', remarks: 'Very strong algebraic manipulation.' },
      { subject: 'English Communicative', marksObtained: 88, maxMarks: 100, grade: 'A2', remarks: 'High comprehension, vocabulary is strong.' },
      { subject: 'Social Science', marksObtained: 92, maxMarks: 100, grade: 'A1', remarks: 'Detailed historical chronology and accurate map work.' },
      { subject: 'Computer Applications', marksObtained: 98, maxMarks: 100, grade: 'A1', remarks: 'Top scorer in Python and data structures!' },
    ],
  },
  {
    studentId: 'SCH-01-1002',
    studentName: 'Ananya Verma',
    classGrade: 'Class 10-A',
    rollNo: '02',
    term: 'PRE_BOARD',
    aggregatePercentage: 96.2,
    overallGrade: 'A1',
    needsRemediation: false,
    scores: [
      { subject: 'Science & Lab', marksObtained: 98, maxMarks: 100, grade: 'A1', remarks: 'Batch topper in Science experiments.' },
      { subject: 'Mathematics', marksObtained: 96, maxMarks: 100, grade: 'A1', remarks: 'Flawless trigonometry and circle theorems.' },
      { subject: 'English Communicative', marksObtained: 94, maxMarks: 100, grade: 'A1', remarks: 'Exceptional essay and creative expression.' },
      { subject: 'Social Science', marksObtained: 95, maxMarks: 100, grade: 'A1', remarks: 'High analytical precision in economics.' },
      { subject: 'Computer Applications', marksObtained: 98, maxMarks: 100, grade: 'A1', remarks: 'Perfect score on logic practicals.' },
    ],
  },
  {
    studentId: 'SCH-01-1003',
    studentName: 'Diya Nair',
    classGrade: 'Class 10-A',
    rollNo: '03',
    term: 'PRE_BOARD',
    aggregatePercentage: 79.0,
    overallGrade: 'B1',
    needsRemediation: false,
    scores: [
      { subject: 'Science & Lab', marksObtained: 76, maxMarks: 100, grade: 'B1', remarks: 'Needs revision on human nephron diagram labels.' },
      { subject: 'Mathematics', marksObtained: 74, maxMarks: 100, grade: 'B1', remarks: 'Practice quadratic word problems daily.' },
      { subject: 'English Communicative', marksObtained: 84, maxMarks: 100, grade: 'A2', remarks: 'Strong literature commentary.' },
      { subject: 'Social Science', marksObtained: 79, maxMarks: 100, grade: 'B1', remarks: 'Consistent performance.' },
      { subject: 'Computer Applications', marksObtained: 82, maxMarks: 100, grade: 'A2', remarks: 'Good logic flowcharts.' },
    ],
  },
  {
    studentId: 'SCH-01-1006',
    studentName: 'Rohan Gupta',
    classGrade: 'Class 10-A',
    rollNo: '06',
    term: 'PRE_BOARD',
    aggregatePercentage: 86.2,
    overallGrade: 'A2',
    needsRemediation: false,
    scores: [
      { subject: 'Science & Lab', marksObtained: 82, maxMarks: 100, grade: 'A2', remarks: 'Good lab technique, practice lens numericals.' },
      { subject: 'Mathematics', marksObtained: 88, maxMarks: 100, grade: 'A2', remarks: 'Consistent problem-solving in algebra.' },
      { subject: 'English Communicative', marksObtained: 85, maxMarks: 100, grade: 'A2', remarks: 'Clear prose and good handwriting.' },
      { subject: 'Social Science', marksObtained: 84, maxMarks: 100, grade: 'A2', remarks: 'Good coverage of democratic politics.' },
      { subject: 'Computer Applications', marksObtained: 92, maxMarks: 100, grade: 'A1', remarks: 'Solid understanding of loops.' },
    ],
  },
];

export interface StaffLookupResult {
  found: boolean;
  staff: SchoolStaff | null;
  needsPasswordSetup: boolean;
  isInactive: boolean;
}

export interface StaffAuthResult {
  success: boolean;
  message: string;
  staff?: SchoolStaff;
}

interface AdminState {
  activeSchoolId: string;
  currentStaff: SchoolStaff | null;
  schoolProfile: SchoolProfile;
  availableSchools: SchoolTenantRecord[];
  staffList: SchoolStaff[];
  students: StudentRecord[];
  feeInstallments: FeeInstallmentRecord[];
  syllabusVault: SyllabusChapterRecord[];
  studentProgressList: StudentRoadmapProgressSummary[];
  examMarks: StudentExamRecord[];
  circulars: AdminCircular[];
  attendanceRegister: Record<string, 'PRESENT' | 'ABSENT'>;
  receiptCounter: number;
  connectionMode: 'LIVE_CLOUD' | 'DEMO_MODE';
  isSyncing: boolean;
  themeMode: 'light' | 'dark';
  syncError: string | null;

  setSyncError: (error: string | null) => void;
  toggleThemeMode: () => void;
  setThemeMode: (mode: 'light' | 'dark') => void;
  switchActiveSchool: (schoolId: string) => void;
  provisionPilotSchool: (payload: {
    schoolCode: string;
    name: string;
    board: string;
    principalName?: string;
  }) => Promise<{ school: SchoolTenantRecord; principalStaff: SchoolStaff }>;
  addCircular: (payload: Omit<AdminCircular, 'id' | 'date'>) => void;
  toggleStudentAttendance: (studentId: string, status: 'PRESENT' | 'ABSENT') => void;
  markAllAttendance: (classGrade: string, status: 'PRESENT' | 'ABSENT') => void;
  initializeRealtimeSync: (schoolIdOverride?: string) => Promise<() => void>;

  // Employee ID Authentication & Self-Password Onboarding
  lookupEmployeeById: (employeeId: string) => Promise<StaffLookupResult>;
  loginWithStaffPassword: (employeeId: string, plainPassword: string) => Promise<StaffAuthResult>;
  completeFirstTimePasswordSetup: (employeeId: string, newPassword: string) => Promise<StaffAuthResult>;
  logoutStaff: () => void;

  // Staff Directory & Auth CRUD
  fetchStaffList: (schoolId?: string) => Promise<void>;
  addStaffMember: (payload: {
    fullName: string;
    department: StaffDepartment;
    designation: string;
    assignedClass?: string | null;
    subject?: string | null;
    phone?: string | null;
  }) => Promise<{ success: boolean; staff?: SchoolStaff; error?: string }>;
  removeStaffMember: (staffId: string) => void;
  setStaffPassword: (staffId: string, passwordHash: string) => void;

  // Student CRUD
  addSingleStudent: (payload: {
    fullName: string;
    classGrade: string;
    parentName: string;
    parentPhone: string;
    parentPin?: string;
    annualFee?: number;
  }) => StudentRecord;
  removeStudent: (studentId: string) => void;

  collectOfflineFee: (
    installmentId: string,
    mode: 'OFFLINE_CASH' | 'OFFLINE_CHEQUE',
    referenceNo: string,
    clerkNote: string
  ) => { receiptNumber: string; studentName: string; amount: number };

  importStudentsFromCSV: (
    rows: Array<{
      name: string;
      classGrade: string;
      rollNo: string;
      parentName: string;
      parentPhone: string;
      annualFee?: number;
    }>
  ) => { importedCount: number };

  uploadSyllabusChapter: (payload: {
    fileName: string;
    chapterNumber: number;
    title: string;
    classGrade: string;
    subject: string;
    arModelMapped: ARModelType;
    board?: string;
    default3dModelId?: string;
    rawSyllabusText?: string;
    generatedMilestones?: FlowchartSpineMilestone[];
    revisionNotes?: RevisionNoteItem[];
    practiceSheet?: PracticeSheetData;
    relatedChapters?: RelatedChapterRef[];
  }) => SyllabusChapterRecord;

  updateSyllabusChapter: (
    chapterId: string,
    updates: Partial<SyllabusChapterRecord>
  ) => SyllabusChapterRecord | null;

  updateStudentMark: (
    studentId: string,
    term: ExamTerm,
    subject: string,
    marksObtained: number,
    remarks?: string
  ) => void;

  updateSchoolProfile: (profilePartial: Partial<SchoolProfile>) => void;
}

let adminRealtimeChannel: ReturnType<typeof supabase.channel> | null = null;
let adminBroadcastChannel: ReturnType<typeof supabase.channel> | null = null;

function broadcastAdminSyncEvent(
  action: string,
  schoolId: string,
  studentId: string | null,
  data: Record<string, any>,
  legacyFields: Record<string, any> = {}
) {
  if (!isLiveSupabaseConfigured || !adminBroadcastChannel) return;

  adminBroadcastChannel.send({
    type: 'broadcast',
    event: 'EDZY_SYNC',
    payload: {
      action,
      schoolId,
      studentId,
      data,
      ts: Date.now(),
      type: action,
      ...legacyFields,
    },
  });

  adminBroadcastChannel.send({
    type: 'broadcast',
    event: 'edzy-event',
    payload: {
      type: action,
      schoolId,
      studentId,
      ...data,
      ...legacyFields,
    },
  });
}

const STAFF_SESSION_KEY = 'edzy_staff_session_v1';

function loadSavedStaffSession(): SchoolStaff | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STAFF_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SchoolStaff;
    if (!parsed || !parsed.id || !parsed.department || parsed.status !== 'ACTIVE') {
      window.localStorage.removeItem(STAFF_SESSION_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function saveStaffSession(staff: SchoolStaff | null) {
  if (typeof window === 'undefined') return;
  try {
    if (staff) {
      window.localStorage.setItem(STAFF_SESSION_KEY, JSON.stringify(staff));
    } else {
      window.localStorage.removeItem(STAFF_SESSION_KEY);
    }
  } catch {
    // ignore storage quota errors
  }
}

const INITIAL_RESTORED_STAFF = loadSavedStaffSession();
const INITIAL_BOOT_SCHOOL_ID = INITIAL_RESTORED_STAFF?.schoolId || 'SCH-01';
const USE_LOCAL_SCH01_FALLBACK = !isLiveSupabaseConfigured && INITIAL_BOOT_SCHOOL_ID === 'SCH-01';

const EMPTY_TENANT_DATA = {
  students: [] as StudentRecord[],
  feeInstallments: [] as FeeInstallmentRecord[],
  syllabusVault: [] as SyllabusChapterRecord[],
  studentProgressList: [] as StudentRoadmapProgressSummary[],
  examMarks: [] as StudentExamRecord[],
  circulars: [] as AdminCircular[],
  attendanceRegister: {} as Record<string, 'PRESENT' | 'ABSENT'>,
};

function buildDefaultProfileForSchool(
  schoolId: string,
  schools: SchoolTenantRecord[] = INITIAL_SCHOOLS
): SchoolProfile {
  const matched = schools.find((s) => s.id === schoolId || s.schoolCode === schoolId);
  if (matched && matched.schoolCode !== 'SCH-01') {
    return {
      name: matched.name,
      code: matched.schoolCode,
      affiliationNumber: 'AFFILIATED',
      board: cleanBoardCode(matched.board),
      session: matched.academicSession || '2026-27',
      address: 'Registered Campus',
      city: '',
      state: '',
      principalName: matched.principalName || 'Principal',
      accountantName: 'Accounts Office',
      phone: '',
      email: `admin@${matched.schoolCode.toLowerCase()}.edu.in`,
    };
  }
  if (schoolId !== 'SCH-01') {
    return {
      name: `${schoolId} Campus`,
      code: schoolId,
      affiliationNumber: 'AFFILIATED',
      board: 'CBSE',
      session: '2026-27',
      address: 'Registered Campus',
      city: '',
      state: '',
      principalName: INITIAL_RESTORED_STAFF?.fullName || 'Principal',
      accountantName: 'Accounts Office',
      phone: '',
      email: `admin@${schoolId.toLowerCase()}.edu.in`,
    };
  }
  return {
    name: 'Doon Valley Public School',
    code: 'SCH-01',
    affiliationNumber: '2130842',
    board: 'CBSE',
    session: '2026-27',
    address: 'Sector 4, Rajpur Road',
    city: 'Dehradun',
    state: 'Uttarakhand',
    principalName: 'Dr. Meenakshi Sharma',
    accountantName: 'Mr. Harish Pant (Senior Accounts Officer)',
    phone: '+91 135 261 8402',
    email: 'admin@doonvalley.edu.in',
  };
}

export const useAdminStore = create<AdminState>((set, get) => ({
  activeSchoolId: INITIAL_BOOT_SCHOOL_ID,
  currentStaff: INITIAL_RESTORED_STAFF,
  schoolProfile: buildDefaultProfileForSchool(INITIAL_BOOT_SCHOOL_ID),
  availableSchools: INITIAL_SCHOOLS,
  staffList: USE_LOCAL_SCH01_FALLBACK
    ? INITIAL_STAFF
    : INITIAL_RESTORED_STAFF
    ? [INITIAL_RESTORED_STAFF]
    : [],
  students: USE_LOCAL_SCH01_FALLBACK ? INITIAL_STUDENTS : [],
  feeInstallments: USE_LOCAL_SCH01_FALLBACK ? INITIAL_INSTALLMENTS : [],
  syllabusVault: USE_LOCAL_SCH01_FALLBACK ? INITIAL_SYLLABUS : [],
  studentProgressList: USE_LOCAL_SCH01_FALLBACK ? INITIAL_PROGRESS_LIST : [],
  examMarks: USE_LOCAL_SCH01_FALLBACK ? INITIAL_EXAM_MARKS : [],
  circulars: USE_LOCAL_SCH01_FALLBACK ? INITIAL_CIRCULARS : [],
  attendanceRegister: USE_LOCAL_SCH01_FALLBACK ? INITIAL_ATTENDANCE : {},
  receiptCounter: 3240,
  connectionMode: isLiveSupabaseConfigured ? 'LIVE_CLOUD' : 'DEMO_MODE',
  isSyncing: false,
  themeMode:
    (typeof window !== 'undefined' && (localStorage.getItem('edzy_admin_theme') as 'light' | 'dark')) ||
    'light',
  syncError: null,
  setSyncError: (error) => set({ syncError: error }),

  switchActiveSchool: (schoolId) => {
    const found = get().availableSchools.find(
      (s) => s.id === schoolId || s.schoolCode === schoolId
    );
    if (!found) return;
    set((state) => ({
      activeSchoolId: found.id,
      schoolProfile: {
        ...state.schoolProfile,
        name: found.name,
        code: found.schoolCode,
        board: cleanBoardCode(found.board),
        principalName: found.principalName,
        session: found.academicSession,
      },
    }));
    if (isLiveSupabaseConfigured) {
      get().initializeRealtimeSync();
    }
  },

  provisionPilotSchool: async (payload) => {
    const cleanCode = payload.schoolCode.trim().toUpperCase();
    const cleanName = payload.name.trim();
    const cleanBoard = payload.board.trim() || 'CBSE';
    const cleanPrincipal = (payload.principalName || '').trim() || 'Principal In-Charge';

    if (!cleanCode || !cleanName) {
      throw new Error('School Code and Official Institution Name are required.');
    }

    const parsedSerial = parseInt(cleanCode.replace(/\D/g, ''), 10);
    const maxSerial = get().availableSchools.reduce(
      (max, s) => Math.max(max, s.schoolSerial || 0),
      0
    );
    const schoolSerial = Number.isFinite(parsedSerial) && parsedSerial > 0 ? parsedSerial : maxSerial + 1;

    const newSchool: SchoolTenantRecord = {
      id: cleanCode,
      schoolSerial,
      schoolCode: cleanCode,
      name: cleanName,
      board: cleanBoard,
      academicSession: '2026-2027',
      principalName: cleanPrincipal,
    };

    const principalStaff: SchoolStaff = {
      id: `${cleanCode}-ADM-001`,
      schoolId: cleanCode,
      employeeSerial: 1,
      fullName: cleanPrincipal,
      department: 'ADM',
      designation: 'Principal & ERP Admin',
      assignedClass: null,
      subject: null,
      phone: null,
      passwordHash: null,
      isPasswordSet: false,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };

    if (isLiveSupabaseConfigured) {
      const { error: schoolErr } = await supabase.from('schools').insert({
        id: newSchool.id,
        school_serial: newSchool.schoolSerial,
        school_code: newSchool.schoolCode,
        name: newSchool.name,
        board: newSchool.board,
        academic_session: newSchool.academicSession,
        principal_name: newSchool.principalName,
      });

      if (schoolErr) {
        throw new Error(schoolErr.message);
      }

      const { error: staffErr } = await supabase.from('school_staff').insert({
        id: principalStaff.id,
        school_id: principalStaff.schoolId,
        employee_serial: principalStaff.employeeSerial,
        full_name: principalStaff.fullName,
        department: principalStaff.department,
        designation: principalStaff.designation,
        assigned_class: null,
        subject: null,
        phone: null,
        password_hash: null,
        is_password_set: false,
        status: 'ACTIVE',
      });

      if (staffErr) {
        await supabase.from('schools').delete().eq('id', newSchool.id);
        throw new Error(`School creation rolled back (Principal account failed): ${staffErr.message}`);
      }
    }

    set((state) => ({
      availableSchools: state.availableSchools.some((s) => s.id === newSchool.id)
        ? state.availableSchools
        : [...state.availableSchools, newSchool],
    }));

    return { school: newSchool, principalStaff };
  },

  fetchStaffList: async (schoolIdParam) => {
    if (!isLiveSupabaseConfigured) return;
    const schoolId = schoolIdParam || get().activeSchoolId || 'SCH-01';
    const { data, error } = await supabase
      .from('school_staff')
      .select('*')
      .eq('school_id', schoolId)
      .order('department', { ascending: true })
      .order('employee_serial', { ascending: true });

    if (error) {
      console.warn('[Edzy Cloud Web] fetchStaffList note:', error.message);
      return;
    }
    if (data) {
      set({ staffList: data.map((row: any) => mapSchoolStaffRow(row)) });
    }
  },

  addStaffMember: async (payload) => {
    const state = get();
    const schoolId =
      state.currentStaff?.schoolId || state.activeSchoolId || state.schoolProfile.code || 'SCH-01';

    const cleanFullName = payload.fullName.trim();
    const cleanDesignation = payload.designation.trim();
    const cleanAssignedClass = payload.assignedClass?.trim() || null;
    const cleanSubject = payload.subject?.trim() || null;
    const cleanPhone = payload.phone?.trim() || null;

    if (!isLiveSupabaseConfigured) {
      const { id, serial } = generateNextEmployeeId(
        schoolId,
        payload.department,
        state.staffList.filter((m) => m.schoolId === schoolId).map((m) => m.id)
      );
      const newStaff: SchoolStaff = {
        id,
        schoolId,
        employeeSerial: serial,
        fullName: cleanFullName,
        department: payload.department,
        designation: cleanDesignation,
        assignedClass: cleanAssignedClass,
        subject: cleanSubject,
        phone: cleanPhone,
        passwordHash: null,
        isPasswordSet: false,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      };
      set((curr) => ({
        staffList: [...curr.staffList, newStaff],
        syncError: null,
      }));
      return { success: true, staff: newStaff };
    }

    const computeNextCandidate = (liveRows: Array<{ id: string; employee_serial?: number; department?: string }>) => {
      const existingIds = Array.from(
        new Set([
          ...state.staffList.filter((m) => m.schoolId === schoolId).map((m) => m.id),
          ...liveRows.map((r) => String(r.id).toUpperCase()),
        ])
      );
      const gen = generateNextEmployeeId(schoolId, payload.department, existingIds);
      const maxLiveDeptSerial = liveRows
        .filter((r) => (r.department || '').toUpperCase() === payload.department)
        .reduce((max, r) => Math.max(max, Number(r.employee_serial || 0)), 0);
      const serial = Math.max(gen.serial, maxLiveDeptSerial + 1);
      const id = `${schoolId}-${payload.department}-${String(serial).padStart(3, '0')}`;
      return { id, serial };
    };

    const { data: liveStaffRows, error: fetchErr } = await supabase
      .from('school_staff')
      .select('id, employee_serial, department')
      .eq('school_id', schoolId);

    if (fetchErr) {
      const msg = `Could not query existing staff IDs: ${fetchErr.message}`;
      get().setSyncError(msg);
      return { success: false, error: msg };
    }

    let candidate = computeNextCandidate(liveStaffRows || []);

    const attemptInsert = async (cand: { id: string; serial: number }) => {
      return supabase
        .from('school_staff')
        .insert({
          id: cand.id,
          school_id: schoolId,
          employee_serial: cand.serial,
          full_name: cleanFullName,
          department: payload.department,
          designation: cleanDesignation,
          assigned_class: cleanAssignedClass,
          subject: cleanSubject,
          phone: cleanPhone,
          password_hash: null,
          is_password_set: false,
          status: 'ACTIVE',
        })
        .select('*')
        .single();
    };

    let { data: insertedRow, error: insertErr } = await attemptInsert(candidate);

    // Retry once cleanly with bumped serial if a concurrent write collided on PK
    if (insertErr?.code === '23505') {
      const { data: refreshedRows } = await supabase
        .from('school_staff')
        .select('id, employee_serial, department')
        .eq('school_id', schoolId);
      const nextCand = computeNextCandidate(refreshedRows || []);
      candidate =
        nextCand.id === candidate.id
          ? {
              serial: candidate.serial + 1,
              id: `${schoolId}-${payload.department}-${String(candidate.serial + 1).padStart(3, '0')}`,
            }
          : nextCand;
      const retry = await attemptInsert(candidate);
      insertedRow = retry.data;
      insertErr = retry.error;
    }

    if (insertErr || !insertedRow) {
      const msg = insertErr
        ? `Staff Add Error: ${insertErr.message}${insertErr.code ? ` (${insertErr.code})` : ''}`
        : 'Staff record could not be saved.';
      console.error('[Edzy Cloud Web] addStaffMember error:', msg);
      get().setSyncError(msg);
      return { success: false, error: msg };
    }

    const confirmedStaff = mapSchoolStaffRow(insertedRow);

    set((curr) => ({
      staffList: curr.staffList.some((m) => m.id === confirmedStaff.id)
        ? curr.staffList.map((m) => (m.id === confirmedStaff.id ? confirmedStaff : m))
        : [...curr.staffList, confirmedStaff],
      syncError: null,
    }));

    broadcastAdminSyncEvent('STAFF_UPDATED', schoolId, null, {
      operation: 'ADDED',
      staff: confirmedStaff,
    });

    return { success: true, staff: confirmedStaff };
  },

  removeStaffMember: (staffId) => {
    const state = get();
    const schoolId = state.activeSchoolId || state.schoolProfile.code || 'SCH-01';

    set((curr) => ({
      staffList: curr.staffList.filter((m) => m.id !== staffId),
    }));

    if (isLiveSupabaseConfigured) {
      supabase
        .from('school_staff')
        .delete()
        .eq('id', staffId)
        .then(({ error }) => {
          if (error) {
            console.error('[Edzy Cloud Web] removeStaffMember error:', error.code, error.message);
            get().setSyncError(`Staff Removal Error: ${error.message} (${error.code})`);
          }
        });

      broadcastAdminSyncEvent('STAFF_UPDATED', schoolId, null, {
        operation: 'REMOVED',
        staffId,
      });
    }
  },

  setStaffPassword: (staffId, passwordHash) => {
    const state = get();
    const schoolId = state.activeSchoolId || state.schoolProfile.code || 'SCH-01';

    set((curr) => ({
      staffList: curr.staffList.map((m) =>
        m.id === staffId ? { ...m, passwordHash, isPasswordSet: true } : m
      ),
    }));

    if (isLiveSupabaseConfigured) {
      supabase
        .from('school_staff')
        .update({
          password_hash: passwordHash,
          is_password_set: true,
        })
        .eq('id', staffId)
        .then(({ error }) => {
          if (error) {
            console.error('[Edzy Cloud Web] setStaffPassword error:', error.code, error.message);
            get().setSyncError(`Password Update Error: ${error.message} (${error.code})`);
          }
        });

      broadcastAdminSyncEvent('STAFF_UPDATED', schoolId, null, {
        operation: 'PASSWORD_SET',
        staffId,
      });
    }
  },

  addSingleStudent: (payload) => {
    const state = get();
    const schoolId = state.activeSchoolId || state.schoolProfile.code || 'SCH-01';
    const cleanClass = payload.classGrade.trim();
    const section = cleanClass.includes('-')
      ? cleanClass.split('-')[1].trim().toUpperCase()
      : 'A';

    const { id: studentId, rollNumber } = generateNextStudentId(
      schoolId,
      cleanClass,
      state.students.map((s) => s.id),
      state.students
    );

    const annualFee =
      payload.annualFee ||
      (cleanClass.includes('10')
        ? 48000
        : cleanClass.includes('9')
        ? 44000
        : 32000);

    const newStudent: StudentRecord = {
      id: studentId,
      rollNo: rollNumber,
      name: payload.fullName.trim(),
      classGrade: cleanClass,
      section,
      parentName: payload.parentName.trim(),
      parentPhone: payload.parentPhone.trim(),
      parentPin: (payload.parentPin || '1234').trim(),
      annualFee,
      totalPaid: 0,
      totalPending: annualFee,
      atHomeHoursThisWeek: 0,
      streakDays: 0,
      attendancePercent: 100,
    };

    const newInstallments = buildQuarterInstallmentsForStudent(newStudent, 0, 'inst');
    const { sortedStudents, rollUpdates } = resequenceStudentsAlphabeticallyByClass([
      ...state.students,
      newStudent,
    ]);
    const finalNewStudent =
      sortedStudents.find((s) => s.id === newStudent.id) || newStudent;

    set((curr) => {
      const resequenced = resequenceStudentsAlphabeticallyByClass([
        ...curr.students.filter((s) => s.id !== newStudent.id),
        finalNewStudent,
      ]);
      return {
        students: resequenced.sortedStudents,
        feeInstallments: [...curr.feeInstallments, ...newInstallments],
        attendanceRegister: {
          ...curr.attendanceRegister,
          [finalNewStudent.id]: 'PRESENT',
        },
      };
    });

    if (isLiveSupabaseConfigured) {
      const nowIso = new Date().toISOString();
      supabase
        .from('students')
        .insert({
          id: finalNewStudent.id,
          school_id: schoolId,
          school_code: schoolId,
          roll_number: finalNewStudent.rollNo,
          full_name: finalNewStudent.name,
          class_grade: finalNewStudent.classGrade,
          section: finalNewStudent.section,
          parent_name: finalNewStudent.parentName,
          parent_phone: finalNewStudent.parentPhone,
          parent_pin: finalNewStudent.parentPin,
          total_fee: finalNewStudent.annualFee,
          paid_fee: 0,
          balance_due: finalNewStudent.annualFee,
          weekly_study_hours: 0,
          streak_days: 0,
          attendance_pct: 100,
          updated_at: nowIso,
        })
        .then(({ error }) => {
          if (error) {
            console.error('[Edzy Cloud Web] addSingleStudent error:', error.code, error.message);
            get().setSyncError(`Student Insert Error: ${error.message} (${error.code})`);
            return;
          }
          const dbInstallments = newInstallments.map((inst) => ({
            id: inst.id,
            school_id: schoolId,
            student_id: inst.studentId,
            installment_title: inst.quarter,
            due_date: inst.dueDate,
            amount: inst.amount,
            status: 'PENDING',
            payment_mode: 'PENDING',
            reference_note: `${inst.quarter} Installment Due`,
          }));
          supabase
            .from('fee_ledger')
            .insert(dbInstallments)
            .then(({ error: feeErr }) => {
              if (feeErr) {
                console.error('[Edzy Cloud Web] Student fee_ledger insert error:', feeErr.message);
              }
            });
          for (const upd of rollUpdates) {
            if (upd.id === finalNewStudent.id) continue;
            supabase
              .from('students')
              .update({ roll_number: upd.rollNo, updated_at: nowIso })
              .eq('id', upd.id)
              .then(() => {});
          }
        });

      broadcastAdminSyncEvent('STUDENT_UPDATED', schoolId, finalNewStudent.id, {
        operation: 'ADDED',
        student: finalNewStudent,
        installments: newInstallments,
      });
    }

    return finalNewStudent;
  },

  removeStudent: (studentId) => {
    const state = get();
    const schoolId = state.activeSchoolId || state.schoolProfile.code || 'SCH-01';
    const remaining = state.students.filter((s) => s.id !== studentId);
    const { rollUpdates } = resequenceStudentsAlphabeticallyByClass(remaining);

    set((curr) => {
      const nextAttendance = { ...curr.attendanceRegister };
      delete nextAttendance[studentId];
      const nextRemaining = curr.students.filter((s) => s.id !== studentId);
      const { sortedStudents } = resequenceStudentsAlphabeticallyByClass(nextRemaining);
      return {
        students: sortedStudents,
        feeInstallments: curr.feeInstallments.filter((f) => f.studentId !== studentId),
        examMarks: curr.examMarks.filter((m) => m.studentId !== studentId),
        studentProgressList: curr.studentProgressList.filter((p) => p.studentId !== studentId),
        attendanceRegister: nextAttendance,
      };
    });

    if (isLiveSupabaseConfigured) {
      const nowIso = new Date().toISOString();
      supabase
        .from('students')
        .delete()
        .eq('id', studentId)
        .then(({ error }) => {
          if (error) {
            console.error('[Edzy Cloud Web] removeStudent error:', error.code, error.message);
            get().setSyncError(`Student Removal Error: ${error.message} (${error.code})`);
            return;
          }
          for (const upd of rollUpdates) {
            supabase
              .from('students')
              .update({ roll_number: upd.rollNo, updated_at: nowIso })
              .eq('id', upd.id)
              .then(() => {});
          }
        });

      broadcastAdminSyncEvent('STUDENT_UPDATED', schoolId, studentId, {
        operation: 'REMOVED',
        studentId,
      });
    }
  },

  lookupEmployeeById: async (employeeId) => {
    const cleanId = (employeeId || '').trim().toUpperCase();
    if (!cleanId) {
      return { found: false, staff: null, needsPasswordSetup: false, isInactive: false };
    }

    if (isLiveSupabaseConfigured) {
      const { data, error } = await supabase
        .from('school_staff')
        .select('*')
        .eq('id', cleanId)
        .maybeSingle();

      if (!error) {
        if (!data) {
          return { found: false, staff: null, needsPasswordSetup: false, isInactive: false };
        }
        const mapped = mapSchoolStaffRow(data);
        // Hydrate that school's metadata cleanly for StaffLoginPage preview without mixing staff rosters
        const { data: schoolRow } = await supabase
          .from('schools')
          .select('*')
          .eq('id', mapped.schoolId)
          .maybeSingle();

        if (schoolRow) {
          const tenantRec: SchoolTenantRecord = {
            id: schoolRow.id,
            schoolSerial: Number(schoolRow.school_serial || 1),
            schoolCode: schoolRow.school_code || schoolRow.id,
            name: schoolRow.name,
            board: cleanBoardCode(schoolRow.board),
            principalName: schoolRow.principal_name || 'Principal',
            academicSession: schoolRow.academic_session || '2026-27',
          };
          set((state) => ({
            availableSchools: state.availableSchools.some((s) => s.id === tenantRec.id)
              ? state.availableSchools.map((s) => (s.id === tenantRec.id ? tenantRec : s))
              : [...state.availableSchools, tenantRec],
          }));
        }

        return {
          found: true,
          staff: mapped,
          needsPasswordSetup: !mapped.isPasswordSet,
          isInactive: mapped.status !== 'ACTIVE',
        };
      }
      console.warn('[Edzy Cloud Web] lookupEmployeeById note:', error.message);
    }

    // Fallback when Supabase env is absent
    const localMatch = get().staffList.find((m) => m.id.toUpperCase() === cleanId) || null;
    if (!localMatch) {
      return { found: false, staff: null, needsPasswordSetup: false, isInactive: false };
    }
    return {
      found: true,
      staff: localMatch,
      needsPasswordSetup: !localMatch.isPasswordSet,
      isInactive: localMatch.status !== 'ACTIVE',
    };
  },

  loginWithStaffPassword: async (employeeId, plainPassword) => {
    const cleanId = (employeeId || '').trim().toUpperCase();
    const lookup = await get().lookupEmployeeById(cleanId);
    if (!lookup.found || !lookup.staff) {
      return {
        success: false,
        message: 'Employee ID not found. Contact your School Principal to register your account.',
      };
    }
    if (lookup.isInactive) {
      return {
        success: false,
        message: 'This Employee ID has been deactivated by your School Administrator.',
      };
    }
    if (lookup.needsPasswordSetup || !lookup.staff.passwordHash) {
      return {
        success: false,
        message: 'Account not activated yet. Please create your personal password first.',
      };
    }

    const matches = await verifyStaffPassword(plainPassword, lookup.staff.passwordHash);
    if (!matches) {
      return {
        success: false,
        message: 'Incorrect password. Verify your Employee ID password and try again.',
      };
    }

    const targetSchoolId = lookup.staff.schoolId;
    let matchedSchool = get().availableSchools.find(
      (s) => s.id === targetSchoolId || s.schoolCode === targetSchoolId
    );
    if (isLiveSupabaseConfigured && !matchedSchool) {
      const { data: schoolRow } = await supabase
        .from('schools')
        .select('*')
        .eq('id', targetSchoolId)
        .maybeSingle();
      if (schoolRow) {
        matchedSchool = {
          id: schoolRow.id,
          schoolSerial: Number(schoolRow.school_serial || 1),
          schoolCode: schoolRow.school_code || schoolRow.id,
          name: schoolRow.name,
          board: cleanBoardCode(schoolRow.board),
          principalName: schoolRow.principal_name || 'Principal',
          academicSession: schoolRow.academic_session || '2026-27',
        };
      }
    }

    const nextProfile = matchedSchool
      ? buildDefaultProfileForSchool(targetSchoolId, [matchedSchool])
      : buildDefaultProfileForSchool(targetSchoolId, get().availableSchools);

    set(() => ({
      currentStaff: lookup.staff,
      activeSchoolId: targetSchoolId,
      syncError: null,
      schoolProfile: nextProfile,
      staffList: [lookup.staff!],
      ...(isLiveSupabaseConfigured
        ? EMPTY_TENANT_DATA
        : targetSchoolId === 'SCH-01'
        ? {}
        : EMPTY_TENANT_DATA),
    }));
    saveStaffSession(lookup.staff);
    await get().initializeRealtimeSync(targetSchoolId);

    return {
      success: true,
      message: `Signed in as ${lookup.staff.fullName}`,
      staff: lookup.staff,
    };
  },

  completeFirstTimePasswordSetup: async (employeeId, newPassword) => {
    const cleanId = (employeeId || '').trim().toUpperCase();
    if (!newPassword || newPassword.length < 6) {
      return {
        success: false,
        message: 'Password must be at least 6 characters long.',
      };
    }

    const lookup = await get().lookupEmployeeById(cleanId);
    if (!lookup.found || !lookup.staff) {
      return {
        success: false,
        message: 'Employee ID not found. Contact your School Principal.',
      };
    }
    if (lookup.isInactive) {
      return {
        success: false,
        message: 'This Employee ID has been deactivated by your School Administrator.',
      };
    }

    const passwordHash = await hashStaffPassword(newPassword);

    if (isLiveSupabaseConfigured) {
      const { error } = await supabase
        .from('school_staff')
        .update({
          password_hash: passwordHash,
          is_password_set: true,
        })
        .eq('id', cleanId);

      if (error) {
        console.error('[Edzy Cloud Web] First-time password setup error:', error.code, error.message);
        return {
          success: false,
          message: `Failed to save password to cloud: ${error.message}`,
        };
      }
    }

    const updatedStaff: SchoolStaff = {
      ...lookup.staff,
      passwordHash,
      isPasswordSet: true,
    };

    const targetSchoolId = updatedStaff.schoolId;
    let matchedSchool = get().availableSchools.find(
      (s) => s.id === targetSchoolId || s.schoolCode === targetSchoolId
    );
    if (isLiveSupabaseConfigured && !matchedSchool) {
      const { data: schoolRow } = await supabase
        .from('schools')
        .select('*')
        .eq('id', targetSchoolId)
        .maybeSingle();
      if (schoolRow) {
        matchedSchool = {
          id: schoolRow.id,
          schoolSerial: Number(schoolRow.school_serial || 1),
          schoolCode: schoolRow.school_code || schoolRow.id,
          name: schoolRow.name,
          board: cleanBoardCode(schoolRow.board),
          principalName: schoolRow.principal_name || 'Principal',
          academicSession: schoolRow.academic_session || '2026-27',
        };
      }
    }

    const nextProfile = matchedSchool
      ? buildDefaultProfileForSchool(targetSchoolId, [matchedSchool])
      : buildDefaultProfileForSchool(targetSchoolId, get().availableSchools);

    set(() => ({
      staffList: [updatedStaff],
      currentStaff: updatedStaff,
      activeSchoolId: targetSchoolId,
      syncError: null,
      schoolProfile: nextProfile,
      ...(isLiveSupabaseConfigured
        ? EMPTY_TENANT_DATA
        : targetSchoolId === 'SCH-01'
        ? {}
        : EMPTY_TENANT_DATA),
    }));
    saveStaffSession(updatedStaff);
    broadcastAdminSyncEvent('STAFF_UPDATED', updatedStaff.schoolId, null, {
      operation: 'PASSWORD_SET',
      staffId: updatedStaff.id,
    });
    await get().initializeRealtimeSync(targetSchoolId);

    return {
      success: true,
      message: 'Password activated successfully!',
      staff: updatedStaff,
    };
  },

  logoutStaff: () => {
    saveStaffSession(null);
    set({
      currentStaff: null,
      syncError: null,
      ...(isLiveSupabaseConfigured ? { staffList: [], ...EMPTY_TENANT_DATA } : {}),
    });
  },

  initializeRealtimeSync: async (schoolIdOverride) => {
    if (!isLiveSupabaseConfigured) {
      set({ connectionMode: 'DEMO_MODE', isSyncing: false });
      return () => {};
    }

    try {
      set({ isSyncing: true });

      if (adminRealtimeChannel) {
        try {
          await supabase.removeChannel(adminRealtimeChannel);
        } catch {
          // ignore
        }
        adminRealtimeChannel = null;
      }
      if (adminBroadcastChannel) {
        try {
          await supabase.removeChannel(adminBroadcastChannel);
        } catch {
          // ignore
        }
        adminBroadcastChannel = null;
      }

      const activeSchoolId =
        schoolIdOverride ||
        get().currentStaff?.schoolId ||
        get().activeSchoolId ||
        get().schoolProfile.code ||
        'SCH-01';

      if (activeSchoolId !== get().activeSchoolId) {
        set({
          activeSchoolId,
          ...EMPTY_TENANT_DATA,
          staffList: get().currentStaff?.schoolId === activeSchoolId ? [get().currentStaff!] : [],
        });
      }

      // Layer A: Broadcast channel for instantaneous UI patching (<150ms perceived latency)
      adminBroadcastChannel = supabase.channel(`edzy-live:${activeSchoolId}`, {
        config: { broadcast: { self: false, ack: true } },
      });

      const handleAdminBroadcast = (payload: any) => {
        if (!payload) return;
        const action = payload.action || payload.type;
        const data = payload.data || payload;

        if (action === 'FEE_UPDATED') {
          const installmentId = data.installmentId || payload.installmentId;
          const studentId = data.studentId || payload.studentId;

          set((state) => {
            const updated = state.feeInstallments.map((inst) =>
              inst.id === installmentId ||
              (inst.studentId === studentId &&
                (inst.quarter.includes('Q4') || String(installmentId || '').toLowerCase().includes('q4')))
                ? {
                    ...inst,
                    status: 'PAID' as PaymentStatus,
                    paymentMethod:
                      ((data.paymentMode || payload.paymentMode) as PaymentMethod) || 'ONLINE_UPI',
                    paymentRef: data.referenceNote || payload.referenceNote || 'Instant UPI',
                    receiptNumber: data.receiptNumber || payload.receiptNumber,
                    paidDate: new Date().toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    }),
                    clerkNote: data.referenceNote || payload.referenceNote || 'Paid via Instant UPI on Mobile App',
                  }
                : inst
            );
            const updatedStudents = state.students.map((st) => {
              if (st.id === studentId) {
                const studentInsts = updated.filter((f) => f.studentId === st.id);
                const totalPaid = studentInsts
                  .filter((f) => f.status === 'PAID')
                  .reduce((sum, f) => sum + f.amount, 0);
                const totalPending = studentInsts
                  .filter((f) => f.status !== 'PAID')
                  .reduce((sum, f) => sum + f.amount, 0);
                return { ...st, totalPaid, totalPending };
              }
              return st;
            });
            return { feeInstallments: updated, students: updatedStudents };
          });
        } else if (action === 'ROADMAP_PROGRESS_UPDATED') {
          const progressRecord: StudentRoadmapProgressSummary = {
            id: data.id || `${data.studentId}-${data.roadmapId}`,
            schoolId: data.schoolId || activeSchoolId,
            studentId: data.studentId,
            roadmapId: data.roadmapId,
            targetDeadline: data.targetDeadline || null,
            totalDays: Number(data.totalDays || 7),
            skippedDaysCount: Number(data.skippedDaysCount || 0),
            paceStatus: data.paceStatus || 'ON_TRACK',
            completionPct: Number(data.completionPct || 0),
            lastMasteredTopicTitle: data.lastMasteredTopicTitle,
            completedTodayCount: Number(data.completedTodayCount || 0),
            nodeStates: data.nodeStates || {},
            updatedAt: new Date().toISOString(),
          };
          set((state) => {
            const exists = state.studentProgressList.some((p) => p.id === progressRecord.id);
            return {
              studentProgressList: exists
                ? state.studentProgressList.map((p) => (p.id === progressRecord.id ? progressRecord : p))
                : [progressRecord, ...state.studentProgressList],
            };
          });
        } else if (action === 'STAFF_UPDATED') {
          if (data.operation === 'ADDED' && data.staff) {
            const incoming = data.staff as SchoolStaff;
            set((state) => ({
              staffList: state.staffList.some((m) => m.id === incoming.id)
                ? state.staffList
                : [...state.staffList, incoming],
            }));
          } else if (data.operation === 'REMOVED' && data.staffId) {
            set((state) => {
              const shouldLogout = state.currentStaff?.id === data.staffId;
              if (shouldLogout) saveStaffSession(null);
              return {
                staffList: state.staffList.filter((m) => m.id !== data.staffId),
                currentStaff: shouldLogout ? null : state.currentStaff,
              };
            });
          }
        } else if (action === 'STUDENT_UPDATED') {
          if (data.operation === 'ADDED' && data.student) {
            const incoming = data.student as StudentRecord;
            const insts = (data.installments || []) as FeeInstallmentRecord[];
            set((state) => ({
              students: state.students.some((s) => s.id === incoming.id)
                ? state.students
                : sortStudentsAlphabetically([...state.students, incoming]),
              feeInstallments: [
                ...state.feeInstallments,
                ...insts.filter((ni) => !state.feeInstallments.some((fi) => fi.id === ni.id)),
              ],
            }));
          } else if (data.operation === 'REMOVED' && data.studentId) {
            set((state) => ({
              students: state.students.filter((s) => s.id !== data.studentId),
              feeInstallments: state.feeInstallments.filter((f) => f.studentId !== data.studentId),
            }));
          }
        }
      };

      adminBroadcastChannel
        .on('broadcast', { event: 'EDZY_SYNC' }, ({ payload }) => handleAdminBroadcast(payload))
        .on('broadcast', { event: 'edzy-event' }, ({ payload }) => handleAdminBroadcast(payload))
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log(`[Edzy Cloud Web] Broadcast channel SUBSCRIBED to edzy-live:${activeSchoolId}`);
          }
        });

      const [
        schoolsRes,
        activeSchoolRes,
        staffRes,
        studentsRes,
        feeRes,
        marksRes,
        syllabusRes,
        circularsRes,
        progressRes,
      ] = await Promise.all([
        supabase.from('schools').select('*').then((r) => r, () => ({ data: null, error: null })),
        supabase
          .from('schools')
          .select('*')
          .eq('id', activeSchoolId)
          .maybeSingle()
          .then((r) => r, () => ({ data: null, error: null })),
        supabase
          .from('school_staff')
          .select('*')
          .eq('school_id', activeSchoolId)
          .order('department', { ascending: true })
          .order('employee_serial', { ascending: true })
          .then((r) => r, () => ({ data: null, error: null })),
        supabase
          .from('students')
          .select('*')
          .eq('school_id', activeSchoolId)
          .order('class_grade', { ascending: true })
          .order('full_name', { ascending: true }),
        supabase
          .from('fee_ledger')
          .select('*')
          .eq('school_id', activeSchoolId)
          .order('due_date', { ascending: true }),
        supabase.from('exam_marks').select('*').eq('school_id', activeSchoolId),
        supabase
          .from('syllabus_roadmaps')
          .select('*')
          .eq('school_id', activeSchoolId)
          .order('chapter_number', { ascending: true }),
        supabase
          .from('school_circulars')
          .select('*')
          .eq('school_id', activeSchoolId)
          .order('published_at', { ascending: false })
          .then((r) => r, () => ({ data: null, error: null })),
        supabase
          .from('student_roadmap_progress')
          .select('*')
          .eq('school_id', activeSchoolId)
          .then((r) => r, () => ({ data: null, error: null })),
      ]);

      const updates: Partial<AdminState> = { activeSchoolId };
      let loadedStudents: StudentRecord[] = [];

      if (schoolsRes.data && schoolsRes.data.length > 0) {
        const mappedSchools: SchoolTenantRecord[] = schoolsRes.data.map((s: any, idx: number) => ({
          id: s.id,
          schoolSerial: Number(s.school_serial || idx + 1),
          schoolCode: s.school_code || s.id,
          name: s.name,
          board: cleanBoardCode(s.board),
          principalName: s.principal_name || 'Principal',
          academicSession: s.academic_session || '2026-27',
        }));
        updates.availableSchools = mappedSchools;
      }

      const activeSchoolRow: any =
        activeSchoolRes.data ||
        schoolsRes.data?.find((s: any) => s.id === activeSchoolId || s.school_code === activeSchoolId);

      if (activeSchoolRow) {
        const tenantMeta: SchoolTenantRecord = {
          id: activeSchoolRow.id,
          schoolSerial: Number(activeSchoolRow.school_serial || 1),
          schoolCode: activeSchoolRow.school_code || activeSchoolRow.id,
          name: activeSchoolRow.name,
          board: cleanBoardCode(activeSchoolRow.board),
          principalName: activeSchoolRow.principal_name || 'Principal',
          academicSession: activeSchoolRow.academic_session || '2026-27',
        };
        updates.schoolProfile = buildDefaultProfileForSchool(activeSchoolId, [tenantMeta]);
      }

      // Strictly hydrate EVERY table for activeSchoolId (including 0-row [] states for newly onboarded schools!)
      if (staffRes.data) {
        const mappedStaff = staffRes.data.map((row: any) => mapSchoolStaffRow(row));
        updates.staffList = mappedStaff;

        const restored = get().currentStaff;
        if (restored && restored.schoolId === activeSchoolId) {
          const liveSelf = mappedStaff.find((m) => m.id === restored.id);
          if (!liveSelf || liveSelf.status !== 'ACTIVE') {
            saveStaffSession(null);
            updates.currentStaff = null;
          } else {
            saveStaffSession(liveSelf);
            updates.currentStaff = liveSelf;
          }
        }
      }

      if (!studentsRes.error && studentsRes.data) {
        loadedStudents = studentsRes.data.map((row: any) => mapStudentRow(row));
        updates.students = loadedStudents;
        const nextAttendance: Record<string, 'PRESENT' | 'ABSENT'> = {};
        const prevAttendance = get().attendanceRegister;
        for (const stu of loadedStudents) {
          nextAttendance[stu.id] = prevAttendance[stu.id] || 'PRESENT';
        }
        updates.attendanceRegister = nextAttendance;
      } else if (activeSchoolId !== 'SCH-01') {
        updates.students = [];
        updates.attendanceRegister = {};
      }

      if (!feeRes.error && feeRes.data) {
        updates.feeInstallments = feeRes.data.map((row: any) => mapFeeRow(row, loadedStudents));
      } else if (activeSchoolId !== 'SCH-01') {
        updates.feeInstallments = [];
      }

      if (!marksRes.error && marksRes.data) {
        updates.examMarks = marksRes.data.map((row: any) => mapMarkRow(row, loadedStudents));
      } else if (activeSchoolId !== 'SCH-01') {
        updates.examMarks = [];
      }

      if (!syllabusRes.error && syllabusRes.data) {
        updates.syllabusVault = syllabusRes.data.map((row: any) => mapSyllabusRow(row));
      } else if (activeSchoolId !== 'SCH-01') {
        updates.syllabusVault = [];
      }

      if (circularsRes.data) {
        updates.circulars = circularsRes.data.map((row: any) => mapCircularRow(row));
      } else if (activeSchoolId !== 'SCH-01') {
        updates.circulars = [];
      }

      if (progressRes.data) {
        updates.studentProgressList = progressRes.data.map((row: any) =>
          mapStudentRoadmapProgressRow(row)
        );
      } else if (activeSchoolId !== 'SCH-01') {
        updates.studentProgressList = [];
      }

      set({
        ...updates,
        connectionMode: 'LIVE_CLOUD',
        isSyncing: false,
      });

      // Layer B: Tenant-scoped Realtime Postgres changes with O(1) patching (INSERT, UPDATE, DELETE)
      adminRealtimeChannel = supabase
        .channel(`edzy-web-admin-${activeSchoolId}-${Date.now()}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'fee_ledger',
            filter: `school_id=eq.${activeSchoolId}`,
          },
          (payload) => {
            if (payload.eventType === 'DELETE') {
              const delId = (payload.old as any)?.id;
              if (!delId) return;
              set((state) => ({
                feeInstallments: state.feeInstallments.filter((f) => f.id !== delId),
              }));
              return;
            }
            const row: any = payload.new;
            if (!row || !row.id) return;
            set((state) => {
              const mapped = mapFeeRow(row, state.students);
              const exists = state.feeInstallments.some((f) => f.id === mapped.id);
              const updated = exists
                ? state.feeInstallments.map((f) => (f.id === mapped.id ? mapped : f))
                : [mapped, ...state.feeInstallments];

              const updatedStudents = state.students.map((st) => {
                if (st.id === mapped.studentId) {
                  const studentInstallments = updated.filter((f) => f.studentId === st.id);
                  const totalPaid = studentInstallments
                    .filter((f) => f.status === 'PAID')
                    .reduce((sum, f) => sum + f.amount, 0);
                  const totalPending = studentInstallments
                    .filter((f) => f.status !== 'PAID')
                    .reduce((sum, f) => sum + f.amount, 0);
                  return { ...st, totalPaid, totalPending };
                }
                return st;
              });

              return { feeInstallments: updated, students: updatedStudents };
            });
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'students',
            filter: `school_id=eq.${activeSchoolId}`,
          },
          (payload) => {
            if (payload.eventType === 'DELETE') {
              const delId = (payload.old as any)?.id;
              if (!delId) return;
              set((state) => ({
                students: state.students.filter((s) => s.id !== delId),
                feeInstallments: state.feeInstallments.filter((f) => f.studentId !== delId),
              }));
              return;
            }
            const row: any = payload.new;
            if (!row || !row.id) return;
            set((state) => {
              const mapped = mapStudentRow(row);
              const exists = state.students.some((s) => s.id === mapped.id);
              const nextList = exists
                ? state.students.map((s) => (s.id === mapped.id ? mapped : s))
                : sortStudentsAlphabetically([...state.students, mapped]);
              return { students: nextList };
            });
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'school_staff',
            filter: `school_id=eq.${activeSchoolId}`,
          },
          (payload) => {
            if (payload.eventType === 'DELETE') {
              const delId = (payload.old as any)?.id;
              if (!delId) return;
              set((state) => {
                const shouldLogout = state.currentStaff?.id === delId;
                if (shouldLogout) saveStaffSession(null);
                return {
                  staffList: state.staffList.filter((m) => m.id !== delId),
                  currentStaff: shouldLogout ? null : state.currentStaff,
                };
              });
              return;
            }
            const row: any = payload.new;
            if (!row || !row.id) return;
            set((state) => {
              const mapped = mapSchoolStaffRow(row);
              const exists = state.staffList.some((m) => m.id === mapped.id);
              const isSelfDeactivated =
                state.currentStaff?.id === mapped.id && mapped.status !== 'ACTIVE';
              if (isSelfDeactivated) saveStaffSession(null);
              const nextCurrent =
                isSelfDeactivated
                  ? null
                  : state.currentStaff?.id === mapped.id
                  ? mapped
                  : state.currentStaff;
              if (nextCurrent && nextCurrent.id === mapped.id) {
                saveStaffSession(nextCurrent);
              }
              return {
                staffList: exists
                  ? state.staffList.map((m) => (m.id === mapped.id ? mapped : m))
                  : [...state.staffList, mapped],
                currentStaff: nextCurrent,
              };
            });
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'exam_marks',
            filter: `school_id=eq.${activeSchoolId}`,
          },
          (payload) => {
            const row: any = payload.new;
            if (!row || !row.id) return;
            set((state) => {
              const mapped = mapMarkRow(row, state.students);
              const filtered = state.examMarks.filter(
                (e) => !(e.studentId === mapped.studentId && e.term === mapped.term)
              );
              return { examMarks: [mapped, ...filtered] };
            });
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'syllabus_roadmaps',
            filter: `school_id=eq.${activeSchoolId}`,
          },
          (payload) => {
            const row: any = payload.new;
            if (!row || !row.id) return;
            set((state) => {
              const mapped = mapSyllabusRow(row);
              const exists = state.syllabusVault.some((s) => s.id === mapped.id);
              return {
                syllabusVault: exists
                  ? state.syllabusVault.map((s) => (s.id === mapped.id ? mapped : s))
                  : [mapped, ...state.syllabusVault],
              };
            });
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'school_circulars',
            filter: `school_id=eq.${activeSchoolId}`,
          },
          (payload) => {
            const row: any = payload.new;
            if (!row || !row.id) return;
            set((state) => {
              const mapped = mapCircularRow(row);
              const exists = state.circulars.some((c) => c.id === mapped.id);
              return {
                circulars: exists
                  ? state.circulars.map((c) => (c.id === mapped.id ? mapped : c))
                  : [mapped, ...state.circulars],
              };
            });
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'student_roadmap_progress',
            filter: `school_id=eq.${activeSchoolId}`,
          },
          (payload) => {
            const row: any = payload.new;
            if (!row || !row.id) return;
            set((state) => {
              const mapped = mapStudentRoadmapProgressRow(row);
              const exists = state.studentProgressList.some((p) => p.id === mapped.id);
              return {
                studentProgressList: exists
                  ? state.studentProgressList.map((p) => (p.id === mapped.id ? mapped : p))
                  : [mapped, ...state.studentProgressList],
              };
            });
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log(`[Edzy Cloud Web] Realtime SUBSCRIBED for ${activeSchoolId}`);
          }
        });

      return () => {
        if (adminRealtimeChannel) {
          supabase.removeChannel(adminRealtimeChannel);
          adminRealtimeChannel = null;
        }
        if (adminBroadcastChannel) {
          supabase.removeChannel(adminBroadcastChannel);
          adminBroadcastChannel = null;
        }
      };
    } catch (err) {
      console.warn('Supabase Realtime note:', err);
      set({
        connectionMode: isLiveSupabaseConfigured ? 'LIVE_CLOUD' : 'DEMO_MODE',
        isSyncing: false,
      });
      return () => {};
    }
  },

  collectOfflineFee: (installmentId, mode, referenceNo, clerkNote) => {
    const state = get();
    const schoolId = state.activeSchoolId || state.schoolProfile.code || 'SCH-01';
    const inst = state.feeInstallments.find((f) => f.id === installmentId);
    if (!inst) {
      throw new Error('Installment not found');
    }

    const nextReceiptNum = `#SCH-${state.receiptCounter + 1}`;
    const todayStr = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const refNote = referenceNo
      ? `${referenceNo}${clerkNote ? ' • ' + clerkNote : ''}`
      : clerkNote || `Collected by Accounts Desk on ${todayStr}`;

    const updatedInstallments = state.feeInstallments.map((item) => {
      if (item.id === installmentId) {
        return {
          ...item,
          status: 'PAID' as PaymentStatus,
          paymentMethod: mode,
          paymentRef: refNote,
          receiptNumber: nextReceiptNum,
          paidDate: todayStr,
          clerkNote: refNote,
        };
      }
      return item;
    });

    const updatedStudents = state.students.map((st) => {
      if (st.id === inst.studentId) {
        return {
          ...st,
          totalPaid: st.totalPaid + inst.amount,
          totalPending: Math.max(0, st.totalPending - inst.amount),
        };
      }
      return st;
    });

    set({
      feeInstallments: updatedInstallments,
      students: updatedStudents,
      receiptCounter: state.receiptCounter + 1,
    });

    if (isLiveSupabaseConfigured) {
      const nowIso = new Date().toISOString();
      supabase
        .from('fee_ledger')
        .update({
          status: 'PAID',
          payment_mode: mode,
          receipt_number: nextReceiptNum,
          paid_at: nowIso,
          reference_note: refNote,
          updated_at: nowIso,
        })
        .eq('id', installmentId)
        .then(({ error }) => {
          if (error) {
            console.error('[Edzy Cloud Web] Fee collection error:', error.code, error.message);
            get().setSyncError(`Fee Collection Error: ${error.message} (${error.code})`);
            return;
          }
          const st = updatedStudents.find((s) => s.id === inst.studentId);
          if (st) {
            supabase
              .from('students')
              .update({
                paid_fee: st.totalPaid,
                balance_due: st.totalPending,
                updated_at: nowIso,
              })
              .eq('id', st.id)
              .then(({ error: studentErr }) => {
                if (studentErr) {
                  console.warn('[Edzy Cloud Web] Student balance update note:', studentErr.message);
                }
              });
          }
        });

      broadcastAdminSyncEvent(
        'FEE_UPDATED',
        schoolId,
        inst.studentId,
        {
          installmentId,
          studentId: inst.studentId,
          status: 'PAID',
          paymentMode: mode,
          receiptNumber: nextReceiptNum,
          referenceNote: refNote,
          amount: inst.amount,
        },
        {
          installmentId,
          paymentMode: mode,
          receiptNumber: nextReceiptNum,
          referenceNote: refNote,
          amount: inst.amount,
        }
      );
    }

    return {
      receiptNumber: nextReceiptNum,
      studentName: inst.studentName,
      amount: inst.amount,
    };
  },

  importStudentsFromCSV: (rows) => {
    const state = get();
    const schoolId = state.activeSchoolId || state.schoolProfile.code || 'SCH-01';
    const newStudents: StudentRecord[] = [];
    const newInstallments: FeeInstallmentRecord[] = [];
    let runningStudents = [...state.students];

    for (const row of rows) {
      const cleanClass = row.classGrade || 'Class 10-A';
      const section = cleanClass.includes('-')
        ? cleanClass.split('-')[1].trim().toUpperCase()
        : 'A';

      const { id: studentId, rollNumber } = generateNextStudentId(
        schoolId,
        cleanClass,
        runningStudents.map((s) => s.id),
        runningStudents
      );

      const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
      const annualFee =
        row.annualFee ||
        (cleanClass.includes('10') ? 48000 : cleanClass.includes('9') ? 44000 : 32000);

      const newStudent: StudentRecord = {
        id: studentId,
        rollNo: row.rollNo ? String(row.rollNo).padStart(2, '0') : rollNumber,
        name: row.name.trim(),
        classGrade: cleanClass,
        section,
        parentName: row.parentName.trim(),
        parentPhone: row.parentPhone.trim(),
        parentPin: randomPin,
        annualFee,
        totalPaid: 0,
        totalPending: annualFee,
        atHomeHoursThisWeek: 0,
        streakDays: 0,
        attendancePercent: 100,
      };

      newStudents.push(newStudent);
      runningStudents.push(newStudent);
      newInstallments.push(...buildQuarterInstallmentsForStudent(newStudent, 0, 'inst'));
    }

    const { sortedStudents, rollUpdates } = resequenceStudentsAlphabeticallyByClass([
      ...state.students,
      ...newStudents,
    ]);
    const syncedNewIds = new Set(newStudents.map((s) => s.id));
    const finalNewStudents = sortedStudents.filter((s) => syncedNewIds.has(s.id));

    set({
      students: sortedStudents,
      feeInstallments: [...state.feeInstallments, ...newInstallments],
    });

    if (isLiveSupabaseConfigured && finalNewStudents.length > 0) {
      const nowIso = new Date().toISOString();
      const dbStudents = finalNewStudents.map((st) => ({
        id: st.id,
        school_id: schoolId,
        school_code: schoolId,
        roll_number: st.rollNo,
        full_name: st.name,
        class_grade: st.classGrade,
        section: st.section,
        parent_name: st.parentName,
        parent_phone: st.parentPhone,
        parent_pin: st.parentPin,
        total_fee: st.annualFee,
        paid_fee: st.totalPaid,
        balance_due: st.totalPending,
        weekly_study_hours: st.atHomeHoursThisWeek,
        streak_days: st.streakDays,
        attendance_pct: st.attendancePercent,
        updated_at: nowIso,
      }));
      for (const upd of rollUpdates) {
        if (syncedNewIds.has(upd.id)) continue;
        supabase
          .from('students')
          .update({ roll_number: upd.rollNo, updated_at: nowIso })
          .eq('id', upd.id)
          .then(() => {});
      }

      const dbInstallments = newInstallments.map((inst) => ({
        id: inst.id,
        school_id: schoolId,
        student_id: inst.studentId,
        installment_title: inst.quarter,
        due_date: inst.dueDate,
        amount: inst.amount,
        status: inst.status,
        payment_mode: 'PENDING',
        reference_note: `${inst.quarter} Installment Due`,
      }));

      supabase
        .from('students')
        .upsert(dbStudents)
        .then(({ error }) => {
          if (error) {
            console.error('[Edzy Cloud Web] CSV students upsert error:', error.message);
            return;
          }
          supabase.from('fee_ledger').upsert(dbInstallments).then(() => {});
        });

      broadcastAdminSyncEvent('STUDENT_UPDATED', schoolId, null, {
        operation: 'CSV_IMPORT',
        count: newStudents.length,
      });
    }

    return { importedCount: newStudents.length };
  },

  uploadSyllabusChapter: (payload) => {
    const state = get();
    const schoolId = state.activeSchoolId || state.schoolProfile.code || 'SCH-01';
    const todayStr = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const boardCode = cleanBoardCode(payload.board || state.schoolProfile.board);
    const id = `syl-${Date.now()}`;
    const defaultModel = getModelSpecByIdOrName(payload.default3dModelId || payload.arModelMapped);

    const fallbackMilestones = [
      {
        nodeId: `n-${Date.now()}-1`,
        title: `${payload.chapterNumber}.1 Core Principles & Definitions`,
        ncertPageRange: `Module 1 • ${boardCode}`,
        ragStatus: 'GROUNDED' as const,
      },
      {
        nodeId: `n-${Date.now()}-2`,
        title: `${payload.chapterNumber}.2 Mechanisms & Everyday Applications`,
        ncertPageRange: `Module 2 • ${boardCode}`,
        ragStatus: 'GROUNDED' as const,
      },
      {
        nodeId: `n-${Date.now()}-3`,
        title: `${payload.chapterNumber}.3 Problem Solving & ${boardCode} Drills`,
        ncertPageRange: `Module 3 • ${boardCode}`,
        ragStatus: 'GROUNDED' as const,
      },
    ];

    const normalized = normalizeMilestonesJson(
      payload.generatedMilestones && payload.generatedMilestones.length > 0
        ? {
            format: 'edzy-flowchart-v2',
            board: boardCode,
            default3dModelId: defaultModel.id,
            milestones: payload.generatedMilestones,
            revisionNotes: payload.revisionNotes,
            practiceSheet: payload.practiceSheet,
            relatedChapters: payload.relatedChapters,
          }
        : fallbackMilestones,
      {
        id,
        title: payload.title,
        subject: payload.subject,
        chapterNumber: payload.chapterNumber,
        board: boardCode,
        arModelName: defaultModel.name,
      }
    );

    const relatedRefs: RelatedChapterRef[] =
      payload.relatedChapters && payload.relatedChapters.length > 0
        ? payload.relatedChapters
        : state.syllabusVault.slice(0, 2).map((ch) => ({
            id: ch.id,
            chapterNumber: ch.chapterNumber,
            title: ch.title,
            subject: ch.subject,
          }));

    const newRecord: SyllabusChapterRecord = {
      id,
      fileName: payload.fileName,
      chapterNumber: payload.chapterNumber,
      title: payload.title,
      classGrade: payload.classGrade,
      subject: payload.subject,
      board: normalized.board,
      default3dModelId: normalized.default3dModelId,
      rawSyllabusText: payload.rawSyllabusText,
      fileSizeBytes: payload.rawSyllabusText
        ? `${Math.max(12, Math.round(payload.rawSyllabusText.length / 64))} KB`
        : '5.2 MB',
      uploadedAt: todayStr,
      status: 'READY',
      arModelMapped: (defaultModel.name as ARModelType) || payload.arModelMapped,
      generatedMilestones: normalized.generatedMilestones,
      revisionNotes: normalized.revisionNotes,
      practiceSheet: normalized.practiceSheet,
      relatedChapters: relatedRefs,
    };

    const milestonesJsonPayload = serializeStudyPackToMilestonesJson(newRecord);

    set((curr) => ({
      syllabusVault: [newRecord, ...curr.syllabusVault],
    }));

    if (isLiveSupabaseConfigured) {
      supabase
        .from('syllabus_roadmaps')
        .insert({
          id: newRecord.id,
          school_id: schoolId,
          chapter_number: newRecord.chapterNumber,
          chapter_title: newRecord.title,
          class_grade: newRecord.classGrade,
          subject: newRecord.subject,
          pdf_filename: newRecord.fileName,
          file_size_label: newRecord.fileSizeBytes,
          ar_model_name: newRecord.arModelMapped,
          milestones_json: milestonesJsonPayload,
        })
        .then(({ error }) => {
          if (error) {
            console.error('[Edzy Cloud Web] Syllabus insert error:', error.code, error.message);
            get().setSyncError(`Syllabus Sync Error: ${error.message} (${error.code})`);
          }
        });

      const broadcastRecord = {
        ...newRecord,
        milestones_json: milestonesJsonPayload,
      };
      broadcastAdminSyncEvent('SYLLABUS_ADDED', schoolId, null, broadcastRecord, {
        record: broadcastRecord,
      });
    }

    return newRecord;
  },

  updateSyllabusChapter: (chapterId, updates) => {
    const state = get();
    const schoolId = state.activeSchoolId || state.schoolProfile.code || 'SCH-01';
    const existing = state.syllabusVault.find((c) => c.id === chapterId);
    if (!existing) return null;

    const merged: SyllabusChapterRecord = {
      ...existing,
      ...updates,
    };

    const milestonesJsonPayload = serializeStudyPackToMilestonesJson(merged);

    set((curr) => ({
      syllabusVault: curr.syllabusVault.map((c) => (c.id === chapterId ? merged : c)),
    }));

    if (isLiveSupabaseConfigured) {
      supabase
        .from('syllabus_roadmaps')
        .upsert(
          {
            id: merged.id,
            school_id: schoolId,
            chapter_number: merged.chapterNumber,
            chapter_title: merged.title,
            class_grade: merged.classGrade,
            subject: merged.subject,
            pdf_filename: merged.fileName,
            file_size_label: merged.fileSizeBytes,
            ar_model_name: merged.arModelMapped,
            milestones_json: milestonesJsonPayload,
          },
          { onConflict: 'id' }
        )
        .then(({ error }) => {
          if (error) {
            console.error('[Edzy Cloud Web] Syllabus upsert error:', error.code, error.message);
            get().setSyncError(`Syllabus Studio Save Error: ${error.message} (${error.code})`);
          }
        });

      const broadcastRecord = {
        ...merged,
        milestones_json: milestonesJsonPayload,
      };
      broadcastAdminSyncEvent('SYLLABUS_UPDATED', schoolId, null, broadcastRecord, {
        record: broadcastRecord,
      });
    }

    return merged;
  },

  updateStudentMark: (studentId, term, subject, marksObtained, remarks) => {
    set((state) => {
      const schoolId = state.activeSchoolId || state.schoolProfile.code || 'SCH-01';
      const student = state.students.find((s) => s.id === studentId);
      const studentName = student ? student.name : 'Unknown';
      const classGrade = student ? student.classGrade : 'Class 10-A';
      const rollNo = student ? student.rollNo : '01';

      const existingRecord = state.examMarks.find(
        (e) => e.studentId === studentId && e.term === term
      );

      const subjects = [
        'Science & Lab',
        'Mathematics',
        'English Communicative',
        'Social Science',
        'Computer Applications',
      ];

      let scoresList: StudentSubjectScore[] = [];

      if (existingRecord) {
        scoresList = existingRecord.scores.map((sc) => {
          if (sc.subject === subject) {
            return {
              ...sc,
              marksObtained,
              grade: calculateCbseGrade((marksObtained / sc.maxMarks) * 100),
              remarks: remarks || sc.remarks,
            };
          }
          return sc;
        });
      } else {
        scoresList = subjects.map((sub) => {
          const isTarget = sub === subject;
          const mark = isTarget ? marksObtained : 75;
          return {
            subject: sub,
            marksObtained: mark,
            maxMarks: 100,
            grade: calculateCbseGrade(mark),
            remarks: isTarget ? remarks || 'Good consistency.' : 'Good consistency.',
          };
        });
      }

      const totalObtained = scoresList.reduce((acc, s) => acc + s.marksObtained, 0);
      const totalMax = scoresList.reduce((acc, s) => acc + s.maxMarks, 0);
      const aggregate = parseFloat(((totalObtained / totalMax) * 100).toFixed(1));
      const overallGrade = calculateCbseGrade(aggregate);
      const needsRemediation = aggregate < 60;

      const updatedRecord: StudentExamRecord = {
        studentId,
        studentName,
        classGrade,
        rollNo,
        term,
        scores: scoresList,
        aggregatePercentage: aggregate,
        overallGrade,
        needsRemediation,
      };

      if (isLiveSupabaseConfigured) {
        const examType =
          term === 'PRE_BOARD' ? 'Pre-Board' : term === 'MIDTERM' ? 'Midterm' : 'Unit Test 1';
        const markRowId = `${studentId}-${examType}-${subject}`;
        const grade = calculateCbseGrade(marksObtained);
        const dbMarkRow = {
          id: markRowId,
          school_id: schoolId,
          student_id: studentId,
          exam_type: examType,
          subject,
          marks_obtained: marksObtained,
          max_marks: 100,
          class_average: 75,
          grade,
          teacher_remarks: remarks || 'Good performance.',
          updated_at: new Date().toISOString(),
        };

        supabase
          .from('exam_marks')
          .upsert(dbMarkRow, { onConflict: 'id' })
          .then(({ error }) => {
            if (error) {
              console.error('[Edzy Cloud Web] exam_marks upsert error:', error.code, error.message);
              get().setSyncError(`Marks Sync Error: ${error.message} (${error.code})`);
            }
          });

        broadcastAdminSyncEvent(
          'MARK_UPDATED',
          schoolId,
          studentId,
          {
            studentId,
            term,
            examType,
            subject,
            marksObtained,
            grade,
            remarks: remarks || 'Good performance.',
            scores: updatedRecord.scores,
            aggregatePercentage: updatedRecord.aggregatePercentage,
            overallGrade: updatedRecord.overallGrade,
          },
          {
            scores: updatedRecord.scores,
            aggregatePercentage: updatedRecord.aggregatePercentage,
            overallGrade: updatedRecord.overallGrade,
            needsRemediation: updatedRecord.needsRemediation,
          }
        );
      }

      const filtered = state.examMarks.filter(
        (e) => !(e.studentId === studentId && e.term === term)
      );

      return {
        examMarks: [updatedRecord, ...filtered],
      };
    });
  },

  updateSchoolProfile: (profilePartial) => {
    set((state) => ({
      schoolProfile: {
        ...state.schoolProfile,
        ...profilePartial,
      },
    }));
  },

  toggleThemeMode: () => {
    set((state) => {
      const next = state.themeMode === 'light' ? 'dark' : 'light';
      if (typeof window !== 'undefined') {
        localStorage.setItem('edzy_admin_theme', next);
      }
      if (typeof document !== 'undefined') {
        if (next === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      return { themeMode: next };
    });
  },

  setThemeMode: (mode) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('edzy_admin_theme', mode);
    }
    if (typeof document !== 'undefined') {
      if (mode === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    set({ themeMode: mode });
  },

  addCircular: (payload) => {
    const state = get();
    const schoolId = state.activeSchoolId || state.schoolProfile.code || 'SCH-01';
    const normalizedTargetClass =
      !payload.targetClass || payload.targetClass === 'All Classes' || payload.targetClass === 'All'
        ? 'All'
        : payload.targetClass;

    const newCircular: AdminCircular = {
      ...payload,
      targetClass: normalizedTargetClass,
      id: `circ-${Date.now().toString(36)}`,
      date: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    };
    set((curr) => ({
      circulars: [newCircular, ...curr.circulars],
    }));

    if (isLiveSupabaseConfigured) {
      supabase
        .from('school_circulars')
        .insert({
          id: newCircular.id,
          school_id: schoolId,
          title: newCircular.title,
          category: newCircular.category,
          target_class: normalizedTargetClass,
          message: newCircular.message,
          published_by: newCircular.author,
          published_at: new Date().toISOString(),
        })
        .then(({ error }) => {
          if (error) {
            console.error('[Edzy Cloud Web] school_circulars insert error:', error.code, error.message);
            get().setSyncError(`Circular Broadcast Error: ${error.message} (${error.code})`);
          }
        });

      broadcastAdminSyncEvent('CIRCULAR_ADDED', schoolId, null, newCircular, {
        circular: newCircular,
      });
    }
  },

  toggleStudentAttendance: (studentId, status) => {
    const schoolId = get().activeSchoolId || get().schoolProfile.code || 'SCH-01';
    let targetPct = 95;
    set((state) => {
      const newRegister = {
        ...state.attendanceRegister,
        [studentId]: status,
      };
      const updatedStudents = state.students.map((st) => {
        if (st.id === studentId) {
          const delta = status === 'PRESENT' ? 0.3 : -0.3;
          const newPct = Math.min(100, Math.max(70, parseFloat((st.attendancePercent + delta).toFixed(1))));
          targetPct = newPct;
          return { ...st, attendancePercent: newPct };
        }
        return st;
      });
      return {
        attendanceRegister: newRegister,
        students: updatedStudents,
      };
    });

    if (isLiveSupabaseConfigured) {
      supabase
        .from('students')
        .update({
          attendance_pct: targetPct,
          updated_at: new Date().toISOString(),
        })
        .eq('id', studentId)
        .then(({ error }) => {
          if (error) {
            console.error('[Edzy Cloud Web] Attendance update error:', error.code, error.message);
            get().setSyncError(`Attendance Sync Error: ${error.message} (${error.code})`);
          }
        });

      broadcastAdminSyncEvent(
        'ATTENDANCE_UPDATED',
        schoolId,
        studentId,
        { studentId, attendancePct: targetPct },
        { attendancePct: targetPct }
      );
    }
  },

  markAllAttendance: (classGrade, status) => {
    const schoolId = get().activeSchoolId || get().schoolProfile.code || 'SCH-01';
    const updates: Array<{ id: string; pct: number }> = [];
    set((state) => {
      const newRegister = { ...state.attendanceRegister };
      const updatedStudents = state.students.map((st) => {
        if (st.classGrade === classGrade) {
          newRegister[st.id] = status;
          const delta = status === 'PRESENT' ? 0.2 : -0.2;
          const newPct = Math.min(100, Math.max(70, parseFloat((st.attendancePercent + delta).toFixed(1))));
          updates.push({ id: st.id, pct: newPct });
          return { ...st, attendancePercent: newPct };
        }
        return st;
      });
      return {
        attendanceRegister: newRegister,
        students: updatedStudents,
      };
    });

    if (isLiveSupabaseConfigured && updates.length > 0) {
      Promise.all(
        updates.map((u) =>
          supabase
            .from('students')
            .update({ attendance_pct: u.pct, updated_at: new Date().toISOString() })
            .eq('id', u.id)
        )
      )
        .then((results) => {
          const firstErr = results.find((r) => r.error)?.error;
          if (firstErr) {
            console.error('[Edzy Cloud Web] Batch attendance update error:', firstErr.code, firstErr.message);
            get().setSyncError(`Batch Attendance Sync Error: ${firstErr.message} (${firstErr.code})`);
          }
        })
        .catch((err) => {
          console.error('[Edzy Cloud Web] Batch attendance update error:', err);
          get().setSyncError(`Batch Attendance Sync Error: ${String(err)}`);
        });

      broadcastAdminSyncEvent('ATTENDANCE_UPDATED', schoolId, null, {
        classGrade,
        status,
        updates,
      });
    }
  },
}));

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const initialTheme = localStorage.getItem('edzy_admin_theme');
  if (initialTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}
