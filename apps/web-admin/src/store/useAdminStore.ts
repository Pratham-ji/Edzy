import { create } from 'zustand';
import { supabase, isLiveSupabaseConfigured } from '../lib/supabase';

export type PaymentMethod = 'ONLINE_UPI' | 'OFFLINE_CASH' | 'OFFLINE_CHEQUE';
export type PaymentStatus = 'PAID' | 'PENDING' | 'OVERDUE';
export type ExamTerm = 'UNIT_TEST_1' | 'MIDTERM' | 'PRE_BOARD';
export type ARModelType = 'Human Heart 3D' | 'Optics Bench 3D' | 'Quadratic Graph 3D' | 'Animal Cell 3D' | 'None';

export interface StudentRecord {
  id: string; // e.g. SCH-2026-0104
  rollNo: string;
  name: string;
  classGrade: string; // e.g. Class 10-A, Class 9-B
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
  quarter: string; // e.g. Q1 (Apr-Jun 2026)
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
  fileSizeBytes: string;
  uploadedAt: string;
  status: 'READY' | 'PROCESSING';
  arModelMapped: ARModelType;
  generatedMilestones: {
    nodeId: string;
    title: string;
    ncertPageRange: string;
    ragStatus: 'GROUNDED' | 'INDEXING';
  }[];
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

interface AdminState {
  schoolProfile: SchoolProfile;
  students: StudentRecord[];
  feeInstallments: FeeInstallmentRecord[];
  syllabusVault: SyllabusChapterRecord[];
  examMarks: StudentExamRecord[];
  circulars: AdminCircular[];
  attendanceRegister: Record<string, 'PRESENT' | 'ABSENT'>;
  receiptCounter: number;
  connectionMode: 'LIVE_CLOUD' | 'DEMO_MODE';
  isSyncing: boolean;
  themeMode: 'light' | 'dark';

  // Actions
  toggleThemeMode: () => void;
  setThemeMode: (mode: 'light' | 'dark') => void;
  addCircular: (payload: Omit<AdminCircular, 'id' | 'date'>) => void;
  toggleStudentAttendance: (studentId: string, status: 'PRESENT' | 'ABSENT') => void;
  markAllAttendance: (classGrade: string, status: 'PRESENT' | 'ABSENT') => void;
  initializeRealtimeSync: () => Promise<() => void>;
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
  }) => SyllabusChapterRecord;

  updateStudentMark: (
    studentId: string,
    term: ExamTerm,
    subject: string,
    marksObtained: number,
    remarks?: string
  ) => void;

  updateSchoolProfile: (profilePartial: Partial<SchoolProfile>) => void;
}

// 15 realistic Indian students across Class 10-A and Class 9-B
const INITIAL_STUDENTS: StudentRecord[] = [
  {
    id: 'SCH-2026-0104',
    rollNo: '24',
    name: 'Aarav Sharma',
    classGrade: 'Class 10-A',
    section: 'A',
    parentName: 'Rajesh Sharma',
    parentPhone: '9811234567',
    parentPin: '1234',
    annualFee: 48000,
    totalPaid: 36000,
    totalPending: 12000,
    atHomeHoursThisWeek: 6.5,
    streakDays: 12,
    attendancePercent: 96.8,
  },
  {
    id: 'SCH-2026-0101',
    rollNo: '01',
    name: 'Ananya Gupta',
    classGrade: 'Class 10-A',
    section: 'A',
    parentName: 'Amit Gupta',
    parentPhone: '9811234501',
    parentPin: '2145',
    annualFee: 48000,
    totalPaid: 48000,
    totalPending: 0,
    atHomeHoursThisWeek: 8.2,
    streakDays: 19,
    attendancePercent: 98.5,
  },
  {
    id: 'SCH-2026-0102',
    rollNo: '12',
    name: 'Rohan Mehra',
    classGrade: 'Class 10-A',
    section: 'A',
    parentName: 'Sunil Mehra',
    parentPhone: '9811234502',
    parentPin: '3912',
    annualFee: 48000,
    totalPaid: 36000,
    totalPending: 12000,
    atHomeHoursThisWeek: 4.5,
    streakDays: 7,
    attendancePercent: 92.0,
  },
  {
    id: 'SCH-2026-0103',
    rollNo: '15',
    name: 'Diya Verma',
    classGrade: 'Class 10-A',
    section: 'A',
    parentName: 'Vivek Verma',
    parentPhone: '9811234503',
    parentPin: '7721',
    annualFee: 48000,
    totalPaid: 48000,
    totalPending: 0,
    atHomeHoursThisWeek: 7.0,
    streakDays: 14,
    attendancePercent: 97.2,
  },
  {
    id: 'SCH-2026-0105',
    rollNo: '27',
    name: 'Kabir Sen',
    classGrade: 'Class 10-A',
    section: 'A',
    parentName: 'Debashis Sen',
    parentPhone: '9811234505',
    parentPin: '8104',
    annualFee: 48000,
    totalPaid: 24000,
    totalPending: 24000,
    atHomeHoursThisWeek: 3.2,
    streakDays: 4,
    attendancePercent: 88.4,
  },
  {
    id: 'SCH-2026-0106',
    rollNo: '31',
    name: 'Sanjana Nair',
    classGrade: 'Class 10-A',
    section: 'A',
    parentName: 'Unnikrishnan Nair',
    parentPhone: '9811234506',
    parentPin: '4092',
    annualFee: 48000,
    totalPaid: 48000,
    totalPending: 0,
    atHomeHoursThisWeek: 6.8,
    streakDays: 16,
    attendancePercent: 99.1,
  },
  {
    id: 'SCH-2026-0107',
    rollNo: '38',
    name: 'Vivaan Joshi',
    classGrade: 'Class 10-A',
    section: 'A',
    parentName: 'Harish Joshi',
    parentPhone: '9811234507',
    parentPin: '5521',
    annualFee: 48000,
    totalPaid: 36000,
    totalPending: 12000,
    atHomeHoursThisWeek: 5.1,
    streakDays: 9,
    attendancePercent: 94.6,
  },
  {
    id: 'SCH-2026-0108',
    rollNo: '40',
    name: 'Meera Pillai',
    classGrade: 'Class 10-A',
    section: 'A',
    parentName: 'Suresh Pillai',
    parentPhone: '9811234508',
    parentPin: '6310',
    annualFee: 48000,
    totalPaid: 48000,
    totalPending: 0,
    atHomeHoursThisWeek: 7.9,
    streakDays: 18,
    attendancePercent: 96.5,
  },
  {
    id: 'SCH-2026-0201',
    rollNo: '04',
    name: 'Ishaan Agarwal',
    classGrade: 'Class 9-B',
    section: 'B',
    parentName: 'Sanjay Agarwal',
    parentPhone: '9811234509',
    parentPin: '9023',
    annualFee: 44000,
    totalPaid: 44000,
    totalPending: 0,
    atHomeHoursThisWeek: 7.2,
    streakDays: 15,
    attendancePercent: 97.8,
  },
  {
    id: 'SCH-2026-0202',
    rollNo: '09',
    name: 'Tanvi Deshmukh',
    classGrade: 'Class 9-B',
    section: 'B',
    parentName: 'Anand Deshmukh',
    parentPhone: '9811234510',
    parentPin: '1478',
    annualFee: 44000,
    totalPaid: 33000,
    totalPending: 11000,
    atHomeHoursThisWeek: 4.8,
    streakDays: 8,
    attendancePercent: 91.2,
  },
  {
    id: 'SCH-2026-0203',
    rollNo: '14',
    name: 'Aditya Kulkarni',
    classGrade: 'Class 9-B',
    section: 'B',
    parentName: 'Pravin Kulkarni',
    parentPhone: '9811234511',
    parentPin: '2367',
    annualFee: 44000,
    totalPaid: 44000,
    totalPending: 0,
    atHomeHoursThisWeek: 8.5,
    streakDays: 21,
    attendancePercent: 98.9,
  },
  {
    id: 'SCH-2026-0204',
    rollNo: '21',
    name: 'Riya Sengupta',
    classGrade: 'Class 9-B',
    section: 'B',
    parentName: 'Subhash Sengupta',
    parentPhone: '9811234512',
    parentPin: '8941',
    annualFee: 44000,
    totalPaid: 22000,
    totalPending: 22000,
    atHomeHoursThisWeek: 3.5,
    streakDays: 5,
    attendancePercent: 86.5,
  },
  {
    id: 'SCH-2026-0205',
    rollNo: '25',
    name: 'Aryan Kapoor',
    classGrade: 'Class 9-B',
    section: 'B',
    parentName: 'Gaurav Kapoor',
    parentPhone: '9811234513',
    parentPin: '3389',
    annualFee: 44000,
    totalPaid: 33000,
    totalPending: 11000,
    atHomeHoursThisWeek: 5.4,
    streakDays: 10,
    attendancePercent: 93.4,
  },
  {
    id: 'SCH-2026-0206',
    rollNo: '33',
    name: 'Sneha Reddy',
    classGrade: 'Class 9-B',
    section: 'B',
    parentName: 'K. V. Reddy',
    parentPhone: '9811234514',
    parentPin: '6712',
    annualFee: 44000,
    totalPaid: 44000,
    totalPending: 0,
    atHomeHoursThisWeek: 6.9,
    streakDays: 13,
    attendancePercent: 96.0,
  },
  {
    id: 'SCH-2026-0207',
    rollNo: '37',
    name: 'Shlok Bhatia',
    classGrade: 'Class 9-B',
    section: 'B',
    parentName: 'Rajiv Bhatia',
    parentPhone: '9811234515',
    parentPin: '5120',
    annualFee: 44000,
    totalPaid: 33000,
    totalPending: 11000,
    atHomeHoursThisWeek: 4.1,
    streakDays: 6,
    attendancePercent: 89.7,
  },
];

// Pre-seeded fee installments matching mobile app (60 installments across 15 students)
const INITIAL_INSTALLMENTS: FeeInstallmentRecord[] = [
  // 1. Aarav Sharma (Class 10-A, Roll 24)
  {
    id: 'inst-0104-q1',
    studentId: 'SCH-2026-0104',
    studentName: 'Aarav Sharma',
    classGrade: 'Class 10-A',
    quarter: 'Q1 (Apr - Jun 2026)',
    amount: 12000,
    status: 'PAID',
    paymentMethod: 'OFFLINE_CASH',
    paymentRef: 'Reception Counter #2',
    receiptNumber: '#SCH-1042',
    paidDate: '12 Apr 2026',
    dueDate: '30 Apr 2026',
    clerkNote: 'Paid in cash at main administration reception desk.',
  },
  {
    id: 'inst-0104-q2',
    studentId: 'SCH-2026-0104',
    studentName: 'Aarav Sharma',
    classGrade: 'Class 10-A',
    quarter: 'Q2 (Jul - Sep 2026)',
    amount: 12000,
    status: 'PAID',
    paymentMethod: 'OFFLINE_CHEQUE',
    paymentRef: 'HDFC Cheque #902188',
    receiptNumber: '#SCH-2190',
    paidDate: '14 Jul 2026',
    dueDate: '31 Jul 2026',
    clerkNote: 'Cleared via HDFC Bank Connaught Place branch.',
  },
  {
    id: 'inst-0104-q3',
    studentId: 'SCH-2026-0104',
    studentName: 'Aarav Sharma',
    classGrade: 'Class 10-A',
    quarter: 'Q3 (Oct - Dec 2026)',
    amount: 12000,
    status: 'PAID',
    paymentMethod: 'ONLINE_UPI',
    paymentRef: 'PhonePe EDZ904812',
    receiptNumber: '#EDZ-5581',
    paidDate: '05 Oct 2026',
    dueDate: '31 Oct 2026',
    clerkNote: 'Settled through Edzy Parent Mobile App via Razorpay UPI.',
  },
  {
    id: 'inst-0104-q4',
    studentId: 'SCH-2026-0104',
    studentName: 'Aarav Sharma',
    classGrade: 'Class 10-A',
    quarter: 'Q4 (Jan - Mar 2027)',
    amount: 12000,
    status: 'PENDING',
    dueDate: '30 Nov 2026',
  },

  // 2. Ananya Gupta (Class 10-A, Roll 01)
  {
    id: 'inst-0101-q1',
    studentId: 'SCH-2026-0101',
    studentName: 'Ananya Gupta',
    classGrade: 'Class 10-A',
    quarter: 'Q1 (Apr - Jun 2026)',
    amount: 12000,
    status: 'PAID',
    paymentMethod: 'ONLINE_UPI',
    paymentRef: 'GPay GP918233',
    receiptNumber: '#EDZ-1011',
    paidDate: '10 Apr 2026',
    dueDate: '30 Apr 2026',
  },
  {
    id: 'inst-0101-q2',
    studentId: 'SCH-2026-0101',
    studentName: 'Ananya Gupta',
    classGrade: 'Class 10-A',
    quarter: 'Q2 (Jul - Sep 2026)',
    amount: 12000,
    status: 'PAID',
    paymentMethod: 'ONLINE_UPI',
    paymentRef: 'GPay GP938211',
    receiptNumber: '#EDZ-2114',
    paidDate: '11 Jul 2026',
    dueDate: '31 Jul 2026',
  },
  {
    id: 'inst-0101-q3',
    studentId: 'SCH-2026-0101',
    studentName: 'Ananya Gupta',
    classGrade: 'Class 10-A',
    quarter: 'Q3 (Oct - Dec 2026)',
    amount: 12000,
    status: 'PAID',
    paymentMethod: 'ONLINE_UPI',
    paymentRef: 'Paytm PT772911',
    receiptNumber: '#EDZ-3921',
    paidDate: '02 Oct 2026',
    dueDate: '31 Oct 2026',
  },
  {
    id: 'inst-0101-q4',
    studentId: 'SCH-2026-0101',
    studentName: 'Ananya Gupta',
    classGrade: 'Class 10-A',
    quarter: 'Q4 (Jan - Mar 2027)',
    amount: 12000,
    status: 'PAID',
    paymentMethod: 'ONLINE_UPI',
    paymentRef: 'PhonePe EDZ99120',
    receiptNumber: '#EDZ-4890',
    paidDate: '01 Nov 2026',
    dueDate: '30 Nov 2026',
  },

  // 3. Rohan Mehra (Class 10-A, Roll 12)
  {
    id: 'inst-0102-q1',
    studentId: 'SCH-2026-0102',
    studentName: 'Rohan Mehra',
    classGrade: 'Class 10-A',
    quarter: 'Q1 (Apr - Jun 2026)',
    amount: 12000,
    status: 'PAID',
    paymentMethod: 'ONLINE_UPI',
    paymentRef: 'PhonePe EDZ1021',
    receiptNumber: '#EDZ-1021',
    paidDate: '14 Apr 2026',
    dueDate: '30 Apr 2026',
  },
  {
    id: 'inst-0102-q2',
    studentId: 'SCH-2026-0102',
    studentName: 'Rohan Mehra',
    classGrade: 'Class 10-A',
    quarter: 'Q2 (Jul - Sep 2026)',
    amount: 12000,
    status: 'PAID',
    paymentMethod: 'OFFLINE_CASH',
    paymentRef: 'Desk #1 Receipt Book',
    receiptNumber: '#SCH-2041',
    paidDate: '18 Jul 2026',
    dueDate: '31 Jul 2026',
  },
  {
    id: 'inst-0102-q3',
    studentId: 'SCH-2026-0102',
    studentName: 'Rohan Mehra',
    classGrade: 'Class 10-A',
    quarter: 'Q3 (Oct - Dec 2026)',
    amount: 12000,
    status: 'PAID',
    paymentMethod: 'ONLINE_UPI',
    paymentRef: 'GPay GP88219',
    receiptNumber: '#EDZ-3042',
    paidDate: '12 Oct 2026',
    dueDate: '31 Oct 2026',
  },
  {
    id: 'inst-0102-q4',
    studentId: 'SCH-2026-0102',
    studentName: 'Rohan Mehra',
    classGrade: 'Class 10-A',
    quarter: 'Q4 (Jan - Mar 2027)',
    amount: 12000,
    status: 'PENDING',
    dueDate: '30 Nov 2026',
  },

  // 4. Diya Verma (Class 10-A, Roll 15)
  {
    id: 'inst-0103-q1',
    studentId: 'SCH-2026-0103',
    studentName: 'Diya Verma',
    classGrade: 'Class 10-A',
    quarter: 'Q1 (Apr - Jun 2026)',
    amount: 12000,
    status: 'PAID',
    paymentMethod: 'OFFLINE_CHEQUE',
    paymentRef: 'SBI Cheque #118290',
    receiptNumber: '#SCH-1103',
    paidDate: '15 Apr 2026',
    dueDate: '30 Apr 2026',
  },
  {
    id: 'inst-0103-q2',
    studentId: 'SCH-2026-0103',
    studentName: 'Diya Verma',
    classGrade: 'Class 10-A',
    quarter: 'Q2 (Jul - Sep 2026)',
    amount: 12000,
    status: 'PAID',
    paymentMethod: 'ONLINE_UPI',
    paymentRef: 'Paytm PT81920',
    receiptNumber: '#EDZ-2103',
    paidDate: '16 Jul 2026',
    dueDate: '31 Jul 2026',
  },
  {
    id: 'inst-0103-q3',
    studentId: 'SCH-2026-0103',
    studentName: 'Diya Verma',
    classGrade: 'Class 10-A',
    quarter: 'Q3 (Oct - Dec 2026)',
    amount: 12000,
    status: 'PAID',
    paymentMethod: 'ONLINE_UPI',
    paymentRef: 'PhonePe EDZ3103',
    receiptNumber: '#EDZ-3103',
    paidDate: '08 Oct 2026',
    dueDate: '31 Oct 2026',
  },
  {
    id: 'inst-0103-q4',
    studentId: 'SCH-2026-0103',
    studentName: 'Diya Verma',
    classGrade: 'Class 10-A',
    quarter: 'Q4 (Jan - Mar 2027)',
    amount: 12000,
    status: 'PAID',
    paymentMethod: 'ONLINE_UPI',
    paymentRef: 'GPay GP4103',
    receiptNumber: '#EDZ-4103',
    paidDate: '05 Nov 2026',
    dueDate: '30 Nov 2026',
  },

  // 5. Kabir Sen (Class 10-A, Roll 27)
  {
    id: 'inst-0105-q1',
    studentId: 'SCH-2026-0105',
    studentName: 'Kabir Sen',
    classGrade: 'Class 10-A',
    quarter: 'Q1 (Apr - Jun 2026)',
    amount: 12000,
    status: 'PAID',
    paymentMethod: 'OFFLINE_CASH',
    paymentRef: 'Counter #2',
    receiptNumber: '#SCH-1055',
    paidDate: '28 Apr 2026',
    dueDate: '30 Apr 2026',
  },
  {
    id: 'inst-0105-q2',
    studentId: 'SCH-2026-0105',
    studentName: 'Kabir Sen',
    classGrade: 'Class 10-A',
    quarter: 'Q2 (Jul - Sep 2026)',
    amount: 12000,
    status: 'PAID',
    paymentMethod: 'OFFLINE_CHEQUE',
    paymentRef: 'SBI Chq #441029',
    receiptNumber: '#SCH-2201',
    paidDate: '29 Jul 2026',
    dueDate: '31 Jul 2026',
  },
  {
    id: 'inst-0105-q3',
    studentId: 'SCH-2026-0105',
    studentName: 'Kabir Sen',
    classGrade: 'Class 10-A',
    quarter: 'Q3 (Oct - Dec 2026)',
    amount: 12000,
    status: 'OVERDUE',
    dueDate: '31 Oct 2026',
  },
  {
    id: 'inst-0105-q4',
    studentId: 'SCH-2026-0105',
    studentName: 'Kabir Sen',
    classGrade: 'Class 10-A',
    quarter: 'Q4 (Jan - Mar 2027)',
    amount: 12000,
    status: 'PENDING',
    dueDate: '30 Nov 2026',
  },

  // 6. Sanjana Nair (Class 10-A, Roll 31)
  {
    id: 'inst-0106-q1',
    studentId: 'SCH-2026-0106',
    studentName: 'Sanjana Nair',
    classGrade: 'Class 10-A',
    quarter: 'Q1 (Apr - Jun 2026)',
    amount: 12000,
    status: 'PAID',
    paymentMethod: 'ONLINE_UPI',
    paymentRef: 'GPay GP1106',
    receiptNumber: '#EDZ-1106',
    paidDate: '09 Apr 2026',
    dueDate: '30 Apr 2026',
  },
  {
    id: 'inst-0106-q2',
    studentId: 'SCH-2026-0106',
    studentName: 'Sanjana Nair',
    classGrade: 'Class 10-A',
    quarter: 'Q2 (Jul - Sep 2026)',
    amount: 12000,
    status: 'PAID',
    paymentMethod: 'ONLINE_UPI',
    paymentRef: 'PhonePe EDZ2106',
    receiptNumber: '#EDZ-2106',
    paidDate: '12 Jul 2026',
    dueDate: '31 Jul 2026',
  },
  {
    id: 'inst-0106-q3',
    studentId: 'SCH-2026-0106',
    studentName: 'Sanjana Nair',
    classGrade: 'Class 10-A',
    quarter: 'Q3 (Oct - Dec 2026)',
    amount: 12000,
    status: 'PAID',
    paymentMethod: 'ONLINE_UPI',
    paymentRef: 'Paytm PT3106',
    receiptNumber: '#EDZ-3106',
    paidDate: '04 Oct 2026',
    dueDate: '31 Oct 2026',
  },
  {
    id: 'inst-0106-q4',
    studentId: 'SCH-2026-0106',
    studentName: 'Sanjana Nair',
    classGrade: 'Class 10-A',
    quarter: 'Q4 (Jan - Mar 2027)',
    amount: 12000,
    status: 'PAID',
    paymentMethod: 'ONLINE_UPI',
    paymentRef: 'GPay GP4106',
    receiptNumber: '#EDZ-4106',
    paidDate: '02 Nov 2026',
    dueDate: '30 Nov 2026',
  },

  // 7. Vivaan Joshi (Class 10-A, Roll 38)
  {
    id: 'inst-0107-q1',
    studentId: 'SCH-2026-0107',
    studentName: 'Vivaan Joshi',
    classGrade: 'Class 10-A',
    quarter: 'Q1 (Apr - Jun 2026)',
    amount: 12000,
    status: 'PAID',
    paymentMethod: 'OFFLINE_CHEQUE',
    paymentRef: 'ICICI Chq #881290',
    receiptNumber: '#SCH-1107',
    paidDate: '18 Apr 2026',
    dueDate: '30 Apr 2026',
  },
  {
    id: 'inst-0107-q2',
    studentId: 'SCH-2026-0107',
    studentName: 'Vivaan Joshi',
    classGrade: 'Class 10-A',
    quarter: 'Q2 (Jul - Sep 2026)',
    amount: 12000,
    status: 'PAID',
    paymentMethod: 'ONLINE_UPI',
    paymentRef: 'PhonePe EDZ2107',
    receiptNumber: '#EDZ-2107',
    paidDate: '19 Jul 2026',
    dueDate: '31 Jul 2026',
  },
  {
    id: 'inst-0107-q3',
    studentId: 'SCH-2026-0107',
    studentName: 'Vivaan Joshi',
    classGrade: 'Class 10-A',
    quarter: 'Q3 (Oct - Dec 2026)',
    amount: 12000,
    status: 'PAID',
    paymentMethod: 'OFFLINE_CASH',
    paymentRef: 'Counter #1',
    receiptNumber: '#SCH-3107',
    paidDate: '15 Oct 2026',
    dueDate: '31 Oct 2026',
  },
  {
    id: 'inst-0107-q4',
    studentId: 'SCH-2026-0107',
    studentName: 'Vivaan Joshi',
    classGrade: 'Class 10-A',
    quarter: 'Q4 (Jan - Mar 2027)',
    amount: 12000,
    status: 'PENDING',
    dueDate: '30 Nov 2026',
  },

  // 8. Meera Pillai (Class 10-A, Roll 40)
  {
    id: 'inst-0108-q1',
    studentId: 'SCH-2026-0108',
    studentName: 'Meera Pillai',
    classGrade: 'Class 10-A',
    quarter: 'Q1 (Apr - Jun 2026)',
    amount: 12000,
    status: 'PAID',
    paymentMethod: 'ONLINE_UPI',
    paymentRef: 'GPay GP1108',
    receiptNumber: '#EDZ-1108',
    paidDate: '08 Apr 2026',
    dueDate: '30 Apr 2026',
  },
  {
    id: 'inst-0108-q2',
    studentId: 'SCH-2026-0108',
    studentName: 'Meera Pillai',
    classGrade: 'Class 10-A',
    quarter: 'Q2 (Jul - Sep 2026)',
    amount: 12000,
    status: 'PAID',
    paymentMethod: 'OFFLINE_CHEQUE',
    paymentRef: 'Axis Chq #662190',
    receiptNumber: '#SCH-2108',
    paidDate: '10 Jul 2026',
    dueDate: '31 Jul 2026',
  },
  {
    id: 'inst-0108-q3',
    studentId: 'SCH-2026-0108',
    studentName: 'Meera Pillai',
    classGrade: 'Class 10-A',
    quarter: 'Q3 (Oct - Dec 2026)',
    amount: 12000,
    status: 'PAID',
    paymentMethod: 'ONLINE_UPI',
    paymentRef: 'PhonePe EDZ3108',
    receiptNumber: '#EDZ-3108',
    paidDate: '03 Oct 2026',
    dueDate: '31 Oct 2026',
  },
  {
    id: 'inst-0108-q4',
    studentId: 'SCH-2026-0108',
    studentName: 'Meera Pillai',
    classGrade: 'Class 10-A',
    quarter: 'Q4 (Jan - Mar 2027)',
    amount: 12000,
    status: 'PAID',
    paymentMethod: 'ONLINE_UPI',
    paymentRef: 'Paytm PT4108',
    receiptNumber: '#EDZ-4108',
    paidDate: '04 Nov 2026',
    dueDate: '30 Nov 2026',
  },

  // 9. Ishaan Agarwal (Class 9-B, Roll 04)
  {
    id: 'inst-0201-q1',
    studentId: 'SCH-2026-0201',
    studentName: 'Ishaan Agarwal',
    classGrade: 'Class 9-B',
    quarter: 'Q1 (Apr - Jun 2026)',
    amount: 11000,
    status: 'PAID',
    paymentMethod: 'ONLINE_UPI',
    paymentRef: 'GPay GP1201',
    receiptNumber: '#EDZ-1201',
    paidDate: '07 Apr 2026',
    dueDate: '30 Apr 2026',
  },
  {
    id: 'inst-0201-q2',
    studentId: 'SCH-2026-0201',
    studentName: 'Ishaan Agarwal',
    classGrade: 'Class 9-B',
    quarter: 'Q2 (Jul - Sep 2026)',
    amount: 11000,
    status: 'PAID',
    paymentMethod: 'ONLINE_UPI',
    paymentRef: 'PhonePe EDZ2201',
    receiptNumber: '#EDZ-2201',
    paidDate: '10 Jul 2026',
    dueDate: '31 Jul 2026',
  },
  {
    id: 'inst-0201-q3',
    studentId: 'SCH-2026-0201',
    studentName: 'Ishaan Agarwal',
    classGrade: 'Class 9-B',
    quarter: 'Q3 (Oct - Dec 2026)',
    amount: 11000,
    status: 'PAID',
    paymentMethod: 'OFFLINE_CHEQUE',
    paymentRef: 'PNB Chq #332190',
    receiptNumber: '#SCH-3201',
    paidDate: '09 Oct 2026',
    dueDate: '31 Oct 2026',
  },
  {
    id: 'inst-0201-q4',
    studentId: 'SCH-2026-0201',
    studentName: 'Ishaan Agarwal',
    classGrade: 'Class 9-B',
    quarter: 'Q4 (Jan - Mar 2027)',
    amount: 11000,
    status: 'PAID',
    paymentMethod: 'ONLINE_UPI',
    paymentRef: 'GPay GP4201',
    receiptNumber: '#EDZ-4201',
    paidDate: '02 Nov 2026',
    dueDate: '30 Nov 2026',
  },

  // 10. Tanvi Deshmukh (Class 9-B, Roll 09)
  {
    id: 'inst-0202-q1',
    studentId: 'SCH-2026-0202',
    studentName: 'Tanvi Deshmukh',
    classGrade: 'Class 9-B',
    quarter: 'Q1 (Apr - Jun 2026)',
    amount: 11000,
    status: 'PAID',
    paymentMethod: 'ONLINE_UPI',
    paymentRef: 'Paytm PT1202',
    receiptNumber: '#EDZ-1202',
    paidDate: '11 Apr 2026',
    dueDate: '30 Apr 2026',
  },
  {
    id: 'inst-0202-q2',
    studentId: 'SCH-2026-0202',
    studentName: 'Tanvi Deshmukh',
    classGrade: 'Class 9-B',
    quarter: 'Q2 (Jul - Sep 2026)',
    amount: 11000,
    status: 'PAID',
    paymentMethod: 'OFFLINE_CASH',
    paymentRef: 'Desk #2',
    receiptNumber: '#SCH-2202',
    paidDate: '15 Jul 2026',
    dueDate: '31 Jul 2026',
  },
  {
    id: 'inst-0202-q3',
    studentId: 'SCH-2026-0202',
    studentName: 'Tanvi Deshmukh',
    classGrade: 'Class 9-B',
    quarter: 'Q3 (Oct - Dec 2026)',
    amount: 11000,
    status: 'PAID',
    paymentMethod: 'ONLINE_UPI',
    paymentRef: 'PhonePe EDZ3202',
    receiptNumber: '#EDZ-3202',
    paidDate: '10 Oct 2026',
    dueDate: '31 Oct 2026',
  },
  {
    id: 'inst-0202-q4',
    studentId: 'SCH-2026-0202',
    studentName: 'Tanvi Deshmukh',
    classGrade: 'Class 9-B',
    quarter: 'Q4 (Jan - Mar 2027)',
    amount: 11000,
    status: 'PENDING',
    dueDate: '30 Nov 2026',
  },

  // 11. Aditya Kulkarni (Class 9-B, Roll 14)
  {
    id: 'inst-0203-q1',
    studentId: 'SCH-2026-0203',
    studentName: 'Aditya Kulkarni',
    classGrade: 'Class 9-B',
    quarter: 'Q1 (Apr - Jun 2026)',
    amount: 11000,
    status: 'PAID',
    paymentMethod: 'ONLINE_UPI',
    paymentRef: 'GPay GP1203',
    receiptNumber: '#EDZ-1203',
    paidDate: '06 Apr 2026',
    dueDate: '30 Apr 2026',
  },
  {
    id: 'inst-0203-q2',
    studentId: 'SCH-2026-0203',
    studentName: 'Aditya Kulkarni',
    classGrade: 'Class 9-B',
    quarter: 'Q2 (Jul - Sep 2026)',
    amount: 11000,
    status: 'PAID',
    paymentMethod: 'ONLINE_UPI',
    paymentRef: 'PhonePe EDZ2203',
    receiptNumber: '#EDZ-2203',
    paidDate: '08 Jul 2026',
    dueDate: '31 Jul 2026',
  },
  {
    id: 'inst-0203-q3',
    studentId: 'SCH-2026-0203',
    studentName: 'Aditya Kulkarni',
    classGrade: 'Class 9-B',
    quarter: 'Q3 (Oct - Dec 2026)',
    amount: 11000,
    status: 'PAID',
    paymentMethod: 'ONLINE_UPI',
    paymentRef: 'Paytm PT3203',
    receiptNumber: '#EDZ-3203',
    paidDate: '02 Oct 2026',
    dueDate: '31 Oct 2026',
  },
  {
    id: 'inst-0203-q4',
    studentId: 'SCH-2026-0203',
    studentName: 'Aditya Kulkarni',
    classGrade: 'Class 9-B',
    quarter: 'Q4 (Jan - Mar 2027)',
    amount: 11000,
    status: 'PAID',
    paymentMethod: 'ONLINE_UPI',
    paymentRef: 'GPay GP4203',
    receiptNumber: '#EDZ-4203',
    paidDate: '01 Nov 2026',
    dueDate: '30 Nov 2026',
  },

  // 12. Riya Sengupta (Class 9-B, Roll 21)
  {
    id: 'inst-0204-q1',
    studentId: 'SCH-2026-0204',
    studentName: 'Riya Sengupta',
    classGrade: 'Class 9-B',
    quarter: 'Q1 (Apr - Jun 2026)',
    amount: 11000,
    status: 'PAID',
    paymentMethod: 'OFFLINE_CASH',
    paymentRef: 'Counter #1',
    receiptNumber: '#SCH-1204',
    paidDate: '25 Apr 2026',
    dueDate: '30 Apr 2026',
  },
  {
    id: 'inst-0204-q2',
    studentId: 'SCH-2026-0204',
    studentName: 'Riya Sengupta',
    classGrade: 'Class 9-B',
    quarter: 'Q2 (Jul - Sep 2026)',
    amount: 11000,
    status: 'PAID',
    paymentMethod: 'OFFLINE_CHEQUE',
    paymentRef: 'HDFC Chq #771290',
    receiptNumber: '#SCH-2204',
    paidDate: '26 Jul 2026',
    dueDate: '31 Jul 2026',
  },
  {
    id: 'inst-0204-q3',
    studentId: 'SCH-2026-0204',
    studentName: 'Riya Sengupta',
    classGrade: 'Class 9-B',
    quarter: 'Q3 (Oct - Dec 2026)',
    amount: 11000,
    status: 'OVERDUE',
    dueDate: '31 Oct 2026',
  },
  {
    id: 'inst-0204-q4',
    studentId: 'SCH-2026-0204',
    studentName: 'Riya Sengupta',
    classGrade: 'Class 9-B',
    quarter: 'Q4 (Jan - Mar 2027)',
    amount: 11000,
    status: 'PENDING',
    dueDate: '30 Nov 2026',
  },

  // 13. Aryan Kapoor (Class 9-B, Roll 25)
  {
    id: 'inst-0205-q1',
    studentId: 'SCH-2026-0205',
    studentName: 'Aryan Kapoor',
    classGrade: 'Class 9-B',
    quarter: 'Q1 (Apr - Jun 2026)',
    amount: 11000,
    status: 'PAID',
    paymentMethod: 'OFFLINE_CHEQUE',
    paymentRef: 'Canara Chq #551290',
    receiptNumber: '#SCH-1205',
    paidDate: '16 Apr 2026',
    dueDate: '30 Apr 2026',
  },
  {
    id: 'inst-0205-q2',
    studentId: 'SCH-2026-0205',
    studentName: 'Aryan Kapoor',
    classGrade: 'Class 9-B',
    quarter: 'Q2 (Jul - Sep 2026)',
    amount: 11000,
    status: 'PAID',
    paymentMethod: 'ONLINE_UPI',
    paymentRef: 'PhonePe EDZ2205',
    receiptNumber: '#EDZ-2205',
    paidDate: '17 Jul 2026',
    dueDate: '31 Jul 2026',
  },
  {
    id: 'inst-0205-q3',
    studentId: 'SCH-2026-0205',
    studentName: 'Aryan Kapoor',
    classGrade: 'Class 9-B',
    quarter: 'Q3 (Oct - Dec 2026)',
    amount: 11000,
    status: 'PAID',
    paymentMethod: 'ONLINE_UPI',
    paymentRef: 'GPay GP3205',
    receiptNumber: '#EDZ-3205',
    paidDate: '11 Oct 2026',
    dueDate: '31 Oct 2026',
  },
  {
    id: 'inst-0205-q4',
    studentId: 'SCH-2026-0205',
    studentName: 'Aryan Kapoor',
    classGrade: 'Class 9-B',
    quarter: 'Q4 (Jan - Mar 2027)',
    amount: 11000,
    status: 'PENDING',
    dueDate: '30 Nov 2026',
  },

  // 14. Sneha Reddy (Class 9-B, Roll 33)
  {
    id: 'inst-0206-q1',
    studentId: 'SCH-2026-0206',
    studentName: 'Sneha Reddy',
    classGrade: 'Class 9-B',
    quarter: 'Q1 (Apr - Jun 2026)',
    amount: 11000,
    status: 'PAID',
    paymentMethod: 'ONLINE_UPI',
    paymentRef: 'GPay GP1206',
    receiptNumber: '#EDZ-1206',
    paidDate: '05 Apr 2026',
    dueDate: '30 Apr 2026',
  },
  {
    id: 'inst-0206-q2',
    studentId: 'SCH-2026-0206',
    studentName: 'Sneha Reddy',
    classGrade: 'Class 9-B',
    quarter: 'Q2 (Jul - Sep 2026)',
    amount: 11000,
    status: 'PAID',
    paymentMethod: 'OFFLINE_CHEQUE',
    paymentRef: 'SBI Chq #991209',
    receiptNumber: '#SCH-2206',
    paidDate: '08 Jul 2026',
    dueDate: '31 Jul 2026',
  },
  {
    id: 'inst-0206-q3',
    studentId: 'SCH-2026-0206',
    studentName: 'Sneha Reddy',
    classGrade: 'Class 9-B',
    quarter: 'Q3 (Oct - Dec 2026)',
    amount: 11000,
    status: 'PAID',
    paymentMethod: 'ONLINE_UPI',
    paymentRef: 'PhonePe EDZ3206',
    receiptNumber: '#EDZ-3206',
    paidDate: '04 Oct 2026',
    dueDate: '31 Oct 2026',
  },
  {
    id: 'inst-0206-q4',
    studentId: 'SCH-2026-0206',
    studentName: 'Sneha Reddy',
    classGrade: 'Class 9-B',
    quarter: 'Q4 (Jan - Mar 2027)',
    amount: 11000,
    status: 'PAID',
    paymentMethod: 'ONLINE_UPI',
    paymentRef: 'Paytm PT4206',
    receiptNumber: '#EDZ-4206',
    paidDate: '03 Nov 2026',
    dueDate: '30 Nov 2026',
  },

  // 15. Shlok Bhatia (Class 9-B, Roll 37)
  {
    id: 'inst-0207-q1',
    studentId: 'SCH-2026-0207',
    studentName: 'Shlok Bhatia',
    classGrade: 'Class 9-B',
    quarter: 'Q1 (Apr - Jun 2026)',
    amount: 11000,
    status: 'PAID',
    paymentMethod: 'ONLINE_UPI',
    paymentRef: 'Paytm PT1207',
    receiptNumber: '#EDZ-1207',
    paidDate: '12 Apr 2026',
    dueDate: '30 Apr 2026',
  },
  {
    id: 'inst-0207-q2',
    studentId: 'SCH-2026-0207',
    studentName: 'Shlok Bhatia',
    classGrade: 'Class 9-B',
    quarter: 'Q2 (Jul - Sep 2026)',
    amount: 11000,
    status: 'PAID',
    paymentMethod: 'OFFLINE_CASH',
    paymentRef: 'Desk #1',
    receiptNumber: '#SCH-2207',
    paidDate: '14 Jul 2026',
    dueDate: '31 Jul 2026',
  },
  {
    id: 'inst-0207-q3',
    studentId: 'SCH-2026-0207',
    studentName: 'Shlok Bhatia',
    classGrade: 'Class 9-B',
    quarter: 'Q3 (Oct - Dec 2026)',
    amount: 11000,
    status: 'PAID',
    paymentMethod: 'ONLINE_UPI',
    paymentRef: 'PhonePe EDZ3207',
    receiptNumber: '#EDZ-3207',
    paidDate: '09 Oct 2026',
    dueDate: '31 Oct 2026',
  },
  {
    id: 'inst-0207-q4',
    studentId: 'SCH-2026-0207',
    studentName: 'Shlok Bhatia',
    classGrade: 'Class 9-B',
    quarter: 'Q4 (Jan - Mar 2027)',
    amount: 11000,
    status: 'PENDING',
    dueDate: '30 Nov 2026',
  },
];

const INITIAL_CIRCULARS: AdminCircular[] = [
  {
    id: 'circ-001',
    title: 'CBSE Class 10 Pre-Board Examination Schedule & Guidelines',
    targetClass: 'Class 10-A',
    category: 'EXAM',
    date: '20 Nov 2026',
    author: 'Examination Controller',
    message: 'Pre-Board practical submissions and theory examination commences from 15th December 2026. Hall tickets and admit cards are available for verification.',
    attachmentName: 'CBSE_PreBoard_Schedule_2026-27.pdf',
  },
  {
    id: 'circ-002',
    title: 'Annual Athletic Meet & Sports Day Participation Consent',
    targetClass: 'All Classes',
    category: 'SPORTS',
    date: '18 Nov 2026',
    author: 'Physical Education Dept',
    message: 'Registration is now open for Track & Field events for the upcoming Annual Inter-House Sports Championship. Parents are requested to sign the digital consent slip.',
    attachmentName: 'Sports_Day_Events_Consent.pdf',
  },
  {
    id: 'circ-003',
    title: 'Parent-Teacher Meeting (PTM) for Term-1 Academic Review',
    targetClass: 'All Classes',
    category: 'ACADEMIC',
    date: '15 Nov 2026',
    author: 'Principal Office',
    message: 'Mandatory parent-teacher conference will be conducted on Saturday from 9:00 AM to 1:30 PM. Parents can check time slots directly in the Edzy Parent App.',
    attachmentName: 'PTM_Schedule_Slot_Matrix.pdf',
  },
];

const INITIAL_ATTENDANCE: Record<string, 'PRESENT' | 'ABSENT'> = {
  'SCH-2026-0104': 'PRESENT',
  'SCH-2026-0101': 'PRESENT',
  'SCH-2026-0102': 'PRESENT',
  'SCH-2026-0103': 'PRESENT',
  'SCH-2026-0105': 'PRESENT',
  'SCH-2026-0106': 'PRESENT',
  'SCH-2026-0107': 'PRESENT',
  'SCH-2026-0108': 'PRESENT',
  'SCH-2026-0201': 'PRESENT',
  'SCH-2026-0202': 'PRESENT',
  'SCH-2026-0203': 'PRESENT',
  'SCH-2026-0204': 'PRESENT',
  'SCH-2026-0205': 'PRESENT',
  'SCH-2026-0206': 'PRESENT',
  'SCH-2026-0207': 'ABSENT',
};

const INITIAL_SYLLABUS: SyllabusChapterRecord[] = [
  {
    id: 'syl-01',
    fileName: 'Class10_Bio_Ch6_SchoolNotes.pdf',
    chapterNumber: 6,
    title: 'Life Processes & Human Circulatory System',
    classGrade: 'Class 10',
    subject: 'Biology (Science)',
    fileSizeBytes: '4.2 MB',
    uploadedAt: '15 Oct 2026',
    status: 'READY',
    arModelMapped: 'Human Heart 3D',
    generatedMilestones: [
      {
        nodeId: 'm-1',
        title: '6.1 Autotrophic Nutrition & Stomata Gas Exchange',
        ncertPageRange: 'Pages 93-98',
        ragStatus: 'GROUNDED',
      },
      {
        nodeId: 'm-2',
        title: '6.2 Human Digestive System: Enzymes & Villi',
        ncertPageRange: 'Pages 99-105',
        ragStatus: 'GROUNDED',
      },
      {
        nodeId: 'm-3',
        title: '6.3 Human Heart: Chambers, Double Circulation & Aorta',
        ncertPageRange: 'Pages 106-110',
        ragStatus: 'GROUNDED',
      },
      {
        nodeId: 'm-4',
        title: '6.4 Excretion: Nephron Filtration Mechanism',
        ncertPageRange: 'Pages 111-115',
        ragStatus: 'GROUNDED',
      },
      {
        nodeId: 'm-5',
        title: '6.5 CBSE Past 5-Year Questions & Board Practicals',
        ncertPageRange: 'Pages 116-120',
        ragStatus: 'GROUNDED',
      },
    ],
  },
  {
    id: 'syl-02',
    fileName: 'Class10_Phy_Ch10_Optics.pdf',
    chapterNumber: 10,
    title: 'Light: Reflection & Refraction',
    classGrade: 'Class 10',
    subject: 'Physics (Science)',
    fileSizeBytes: '5.8 MB',
    uploadedAt: '22 Oct 2026',
    status: 'READY',
    arModelMapped: 'Optics Bench 3D',
    generatedMilestones: [
      {
        nodeId: 'p-1',
        title: '10.1 Spherical Mirrors: Concave & Convex Ray Tracing',
        ncertPageRange: 'Pages 160-168',
        ragStatus: 'GROUNDED',
      },
      {
        nodeId: 'p-2',
        title: '10.2 Mirror Formula & Magnification Ratio',
        ncertPageRange: 'Pages 169-173',
        ragStatus: 'GROUNDED',
      },
      {
        nodeId: 'p-3',
        title: "10.3 Snell's Law & Refractive Index (Air-Glass)",
        ncertPageRange: 'Pages 174-180',
        ragStatus: 'GROUNDED',
      },
      {
        nodeId: 'p-4',
        title: '10.4 Convex & Concave Lens Ray Diagrams',
        ncertPageRange: 'Pages 181-186',
        ragStatus: 'GROUNDED',
      },
      {
        nodeId: 'p-5',
        title: '10.5 Dioptre Power & Numerical Problems',
        ncertPageRange: 'Pages 187-191',
        ragStatus: 'GROUNDED',
      },
    ],
  },
  {
    id: 'syl-03',
    fileName: 'Class10_Math_Ch4_Quadratic.pdf',
    chapterNumber: 4,
    title: 'Quadratic Equations & Discriminant Analysis',
    classGrade: 'Class 10',
    subject: 'Mathematics',
    fileSizeBytes: '3.6 MB',
    uploadedAt: '01 Nov 2026',
    status: 'READY',
    arModelMapped: 'Quadratic Graph 3D',
    generatedMilestones: [
      {
        nodeId: 'q-1',
        title: '4.1 Standard Form ax² + bx + c = 0 & Factorisation',
        ncertPageRange: 'Pages 70-76',
        ragStatus: 'GROUNDED',
      },
      {
        nodeId: 'q-2',
        title: '4.2 Quadratic Formula (Shreedharacharya Rule)',
        ncertPageRange: 'Pages 77-83',
        ragStatus: 'GROUNDED',
      },
      {
        nodeId: 'q-3',
        title: '4.3 Discriminant D = b² - 4ac & Nature of Roots',
        ncertPageRange: 'Pages 84-88',
        ragStatus: 'GROUNDED',
      },
      {
        nodeId: 'q-4',
        title: '4.4 Real-World Kinematics & Area Word Problems',
        ncertPageRange: 'Pages 89-93',
        ragStatus: 'GROUNDED',
      },
      {
        nodeId: 'q-5',
        title: '4.5 Board Exam Revision Drill',
        ncertPageRange: 'Pages 94-96',
        ragStatus: 'GROUNDED',
      },
    ],
  },
  {
    id: 'syl-04',
    fileName: 'Class9_Sci_Ch5_CellStructure.pdf',
    chapterNumber: 5,
    title: 'The Fundamental Unit of Life: Cell Organelles',
    classGrade: 'Class 9',
    subject: 'Science',
    fileSizeBytes: '4.9 MB',
    uploadedAt: '12 Nov 2026',
    status: 'READY',
    arModelMapped: 'Animal Cell 3D',
    generatedMilestones: [
      {
        nodeId: 'c-1',
        title: '5.1 Discovery of Cell & Plasma Membrane Diffusion',
        ncertPageRange: 'Pages 57-62',
        ragStatus: 'GROUNDED',
      },
      {
        nodeId: 'c-2',
        title: '5.2 Nucleus, Chromosomes & DNA Structure',
        ncertPageRange: 'Pages 63-66',
        ragStatus: 'GROUNDED',
      },
      {
        nodeId: 'c-3',
        title: '5.3 Cytoplasm & Endoplasmic Reticulum (RER/SER)',
        ncertPageRange: 'Pages 67-70',
        ragStatus: 'GROUNDED',
      },
      {
        nodeId: 'c-4',
        title: '5.4 Mitochondria, Golgi Apparatus & Lysosomes',
        ncertPageRange: 'Pages 71-74',
        ragStatus: 'GROUNDED',
      },
      {
        nodeId: 'c-5',
        title: '5.5 Plant vs Animal Cell 3D Comparison',
        ncertPageRange: 'Pages 75-78',
        ragStatus: 'GROUNDED',
      },
    ],
  },
];

const INITIAL_EXAM_MARKS: StudentExamRecord[] = [
  {
    studentId: 'SCH-2026-0104',
    studentName: 'Aarav Sharma',
    classGrade: 'Class 10-A',
    rollNo: '24',
    term: 'PRE_BOARD',
    aggregatePercentage: 92.6,
    overallGrade: 'A1',
    needsRemediation: false,
    scores: [
      {
        subject: 'Science & Lab',
        marksObtained: 94,
        maxMarks: 100,
        grade: 'A1',
        remarks: 'Exceptional diagrammatic clarity in Biology & ray optics.',
      },
      {
        subject: 'Mathematics',
        marksObtained: 91,
        maxMarks: 100,
        grade: 'A1',
        remarks: 'Very strong algebraic manipulation.',
      },
      {
        subject: 'English Communicative',
        marksObtained: 88,
        maxMarks: 100,
        grade: 'A2',
        remarks: 'High comprehension, vocabulary is strong.',
      },
      {
        subject: 'Social Science',
        marksObtained: 92,
        maxMarks: 100,
        grade: 'A1',
        remarks: 'Detailed historical chronology and accurate map work.',
      },
      {
        subject: 'Computer Applications',
        marksObtained: 98,
        maxMarks: 100,
        grade: 'A1',
        remarks: 'Top scorer in Python and data structures!',
      },
    ],
  },
  {
    studentId: 'SCH-2026-0101',
    studentName: 'Ananya Gupta',
    classGrade: 'Class 10-A',
    rollNo: '01',
    term: 'PRE_BOARD',
    aggregatePercentage: 96.2,
    overallGrade: 'A1',
    needsRemediation: false,
    scores: [
      {
        subject: 'Science & Lab',
        marksObtained: 98,
        maxMarks: 100,
        grade: 'A1',
        remarks: 'Batch topper in Science experiments.',
      },
      {
        subject: 'Mathematics',
        marksObtained: 97,
        maxMarks: 100,
        grade: 'A1',
        remarks: 'Flawless quadratic proofs.',
      },
      {
        subject: 'English Communicative',
        marksObtained: 93,
        maxMarks: 100,
        grade: 'A1',
        remarks: 'Excellent analytical writing.',
      },
      {
        subject: 'Social Science',
        marksObtained: 96,
        maxMarks: 100,
        grade: 'A1',
        remarks: 'Thorough coverage of Economics & Civics.',
      },
      {
        subject: 'Computer Applications',
        marksObtained: 97,
        maxMarks: 100,
        grade: 'A1',
        remarks: 'Creative coding test solutions.',
      },
    ],
  },
  {
    studentId: 'SCH-2026-0105',
    studentName: 'Kabir Sen',
    classGrade: 'Class 10-A',
    rollNo: '27',
    term: 'PRE_BOARD',
    aggregatePercentage: 54.4,
    overallGrade: 'C1',
    needsRemediation: true,
    scores: [
      {
        subject: 'Science & Lab',
        marksObtained: 48,
        maxMarks: 100,
        grade: 'C2',
        remarks: 'Needs urgent remediation in Chemistry formulas & ray diagrams.',
      },
      {
        subject: 'Mathematics',
        marksObtained: 46,
        maxMarks: 100,
        grade: 'C2',
        remarks: 'Struggles with word problems and quadratic equations.',
      },
      {
        subject: 'English Communicative',
        marksObtained: 64,
        maxMarks: 100,
        grade: 'B2',
        remarks: 'Average performance.',
      },
      {
        subject: 'Social Science',
        marksObtained: 52,
        maxMarks: 100,
        grade: 'C1',
        remarks: 'Incomplete answers in History section.',
      },
      {
        subject: 'Computer Applications',
        marksObtained: 62,
        maxMarks: 100,
        grade: 'B2',
        remarks: 'Basic syntax understanding is okay.',
      },
    ],
  },
  {
    studentId: 'SCH-2026-0204',
    studentName: 'Riya Sengupta',
    classGrade: 'Class 9-B',
    rollNo: '21',
    term: 'PRE_BOARD',
    aggregatePercentage: 58.0,
    overallGrade: 'C1',
    needsRemediation: true,
    scores: [
      {
        subject: 'Science & Lab',
        marksObtained: 51,
        maxMarks: 100,
        grade: 'C1',
        remarks: 'Requires practice with cell organelle diagrams.',
      },
      {
        subject: 'Mathematics',
        marksObtained: 49,
        maxMarks: 100,
        grade: 'C2',
        remarks: 'Weak in polynomial factorisation.',
      },
      {
        subject: 'English Communicative',
        marksObtained: 70,
        maxMarks: 100,
        grade: 'B1',
        remarks: 'Good spoken fluency.',
      },
      {
        subject: 'Social Science',
        marksObtained: 56,
        maxMarks: 100,
        grade: 'C1',
        remarks: 'Needs review of Indian physical geography.',
      },
      {
        subject: 'Computer Applications',
        marksObtained: 64,
        maxMarks: 100,
        grade: 'B2',
        remarks: 'Fair execution of HTML tables.',
      },
    ],
  },
];

export const useAdminStore = create<AdminState>((set, get) => ({
  schoolProfile: {
    name: 'Doon Valley Public School',
    code: 'DVPS01',
    affiliationNumber: 'CBSE-2130842',
    board: 'CBSE New Delhi',
    session: '2026-2027',
    address: 'Sector 4, R.K. Puram, Outer Ring Road',
    city: 'New Delhi',
    state: 'Delhi (NCR)',
    principalName: 'Dr. Meenakshi Sundaram (M.Sc., Ph.D.)',
    accountantName: 'Sunil Aggarwal (Chief Bursar)',
    phone: '+91 11 2618 4021',
    email: 'admin@doonvalley.edu.in',
  },
  students: INITIAL_STUDENTS,
  feeInstallments: INITIAL_INSTALLMENTS,
  syllabusVault: INITIAL_SYLLABUS,
  examMarks: INITIAL_EXAM_MARKS,
  circulars: INITIAL_CIRCULARS,
  attendanceRegister: INITIAL_ATTENDANCE,
  receiptCounter: 3240,
  connectionMode: isLiveSupabaseConfigured ? 'LIVE_CLOUD' : 'DEMO_MODE',
  isSyncing: false,
  themeMode: (typeof window !== 'undefined' && (localStorage.getItem('edzy_admin_theme') as 'light' | 'dark')) || 'light',

  initializeRealtimeSync: async () => {
    if (!isLiveSupabaseConfigured) {
      set({ connectionMode: 'DEMO_MODE' });
      return () => {};
    }

    try {
      set({ isSyncing: true });
      const [studentsRes, feeRes, marksRes, syllabusRes] = await Promise.all([
        supabase.from('students').select('*').order('roll_no', { ascending: true }),
        supabase.from('fee_ledger').select('*').order('due_date', { ascending: true }),
        supabase.from('exam_marks').select('*'),
        supabase.from('syllabus_roadmaps').select('*').order('chapter_number', { ascending: true }),
      ]);

      const updates: Partial<AdminState> = {};

      if (studentsRes.data && studentsRes.data.length > 0) {
        updates.students = studentsRes.data.map((row: any) => ({
          id: row.id,
          rollNo: row.roll_no ? String(row.roll_no).padStart(2, '0') : '0',
          name: row.name,
          classGrade: row.class_grade,
          section: row.section || 'A',
          parentName: row.parent_name,
          parentPhone: row.parent_phone,
          parentPin: row.parent_pin || '1234',
          annualFee: Number(row.annual_fee || 48000),
          totalPaid: Number(row.total_paid || 0),
          totalPending: Number(row.total_pending || 0),
          atHomeHoursThisWeek: Number(row.at_home_hours || 0),
          streakDays: Number(row.streak_days || 0),
          attendancePercent: Number(row.attendance_percent || 95),
        }));
      }

      if (feeRes.data && feeRes.data.length > 0) {
        updates.feeInstallments = feeRes.data.map((row: any) => ({
          id: row.id,
          studentId: row.student_id,
          studentName: row.student_name,
          classGrade: row.class_grade,
          quarter: row.quarter,
          amount: Number(row.amount),
          status: row.status as PaymentStatus,
          paymentMethod: row.payment_mode as PaymentMethod | undefined,
          paymentRef: row.payment_ref || undefined,
          receiptNumber: row.receipt_number || undefined,
          paidDate: row.paid_at
            ? new Date(row.paid_at).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })
            : undefined,
          dueDate: row.due_date || '30 Nov 2026',
          clerkNote: row.clerk_note || undefined,
        }));
      }

      if (marksRes.data && marksRes.data.length > 0) {
        updates.examMarks = marksRes.data.map((row: any) => ({
          studentId: row.student_id,
          studentName: row.student_name,
          classGrade: row.class_grade,
          rollNo: row.roll_no,
          term: row.term as ExamTerm,
          scores: Array.isArray(row.scores_json) ? row.scores_json : [],
          aggregatePercentage: Number(row.aggregate_percentage || 0),
          overallGrade: row.overall_grade || 'A1',
          needsRemediation: Boolean(row.needs_remediation),
        }));
      }

      if (syllabusRes.data && syllabusRes.data.length > 0) {
        updates.syllabusVault = syllabusRes.data.map((row: any) => ({
          id: row.id,
          fileName: row.file_name || 'Chapter.pdf',
          chapterNumber: Number(row.chapter_number),
          title: row.title,
          classGrade: row.class_grade,
          subject: row.subject,
          fileSizeBytes: row.file_size_bytes || '4.5 MB',
          uploadedAt: row.created_at
            ? new Date(row.created_at).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })
            : 'Today',
          status: (row.status as any) || 'READY',
          arModelMapped: (row.ar_model_mapped as any) || 'None',
          generatedMilestones: Array.isArray(row.milestones_json) ? row.milestones_json : [],
        }));
      }

      set({
        ...updates,
        connectionMode: 'LIVE_CLOUD',
        isSyncing: false,
      });

      // Subscribe to Realtime Postgres changes across all core tables
      const channel = supabase
        .channel('edzy-web-admin-realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'fee_ledger' },
          (payload) => {
            const row: any = payload.new;
            if (!row || !row.id) return;
            set((state) => {
              const mapped: FeeInstallmentRecord = {
                id: row.id,
                studentId: row.student_id,
                studentName: row.student_name,
                classGrade: row.class_grade,
                quarter: row.quarter,
                amount: Number(row.amount),
                status: row.status as PaymentStatus,
                paymentMethod: row.payment_mode as PaymentMethod | undefined,
                paymentRef: row.payment_ref || undefined,
                receiptNumber: row.receipt_number || undefined,
                paidDate: row.paid_at
                  ? new Date(row.paid_at).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })
                  : undefined,
                dueDate: row.due_date || '30 Nov 2026',
                clerkNote: row.clerk_note || undefined,
              };

              const exists = state.feeInstallments.some((f) => f.id === row.id);
              const updated = exists
                ? state.feeInstallments.map((f) => (f.id === row.id ? mapped : f))
                : [mapped, ...state.feeInstallments];

              // Recompute student totalPaid / totalPending
              const updatedStudents = state.students.map((st) => {
                if (st.id === row.student_id) {
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
          { event: '*', schema: 'public', table: 'students' },
          (payload) => {
            const row: any = payload.new;
            if (!row || !row.id) return;
            set((state) => {
              const mapped: StudentRecord = {
                id: row.id,
                rollNo: row.roll_no ? String(row.roll_no).padStart(2, '0') : '0',
                name: row.name,
                classGrade: row.class_grade,
                section: row.section || 'A',
                parentName: row.parent_name,
                parentPhone: row.parent_phone,
                parentPin: row.parent_pin || '1234',
                annualFee: Number(row.annual_fee || 48000),
                totalPaid: Number(row.total_paid || 0),
                totalPending: Number(row.total_pending || 0),
                atHomeHoursThisWeek: Number(row.at_home_hours || 0),
                streakDays: Number(row.streak_days || 0),
                attendancePercent: Number(row.attendance_percent || 95),
              };
              const exists = state.students.some((s) => s.id === row.id);
              return {
                students: exists
                  ? state.students.map((s) => (s.id === row.id ? mapped : s))
                  : [...state.students, mapped],
              };
            });
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'exam_marks' },
          (payload) => {
            const row: any = payload.new;
            if (!row || !row.id) return;
            set((state) => {
              const mapped: StudentExamRecord = {
                studentId: row.student_id,
                studentName: row.student_name,
                classGrade: row.class_grade,
                rollNo: row.roll_no,
                term: row.term as ExamTerm,
                scores: Array.isArray(row.scores_json) ? row.scores_json : [],
                aggregatePercentage: Number(row.aggregate_percentage || 0),
                overallGrade: row.overall_grade || 'A1',
                needsRemediation: Boolean(row.needs_remediation),
              };
              const filtered = state.examMarks.filter(
                (e) => !(e.studentId === mapped.studentId && e.term === mapped.term)
              );
              return { examMarks: [mapped, ...filtered] };
            });
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'syllabus_roadmaps' },
          (payload) => {
            const row: any = payload.new;
            if (!row || !row.id) return;
            set((state) => {
              const mapped: SyllabusChapterRecord = {
                id: row.id,
                fileName: row.file_name || 'Chapter.pdf',
                chapterNumber: Number(row.chapter_number),
                title: row.title,
                classGrade: row.class_grade,
                subject: row.subject,
                fileSizeBytes: row.file_size_bytes || '4.5 MB',
                uploadedAt: row.created_at
                  ? new Date(row.created_at).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'Today',
                status: (row.status as any) || 'READY',
                arModelMapped: (row.ar_model_mapped as any) || 'None',
                generatedMilestones: Array.isArray(row.milestones_json) ? row.milestones_json : [],
              };
              const exists = state.syllabusVault.some((s) => s.id === row.id);
              return {
                syllabusVault: exists
                  ? state.syllabusVault.map((s) => (s.id === row.id ? mapped : s))
                  : [mapped, ...state.syllabusVault],
              };
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (err) {
      console.warn('Supabase Realtime fell back to Demo Mode:', err);
      set({ connectionMode: 'DEMO_MODE', isSyncing: false });
      return () => {};
    }
  },

  collectOfflineFee: (installmentId, mode, referenceNo, clerkNote) => {
    const state = get();
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

    const updatedInstallments = state.feeInstallments.map((item) => {
      if (item.id === installmentId) {
        return {
          ...item,
          status: 'PAID' as PaymentStatus,
          paymentMethod: mode,
          paymentRef: referenceNo || (mode === 'OFFLINE_CASH' ? 'Cash at Counter #1' : 'Cheque In-Hand'),
          receiptNumber: nextReceiptNum,
          paidDate: todayStr,
          clerkNote: clerkNote || `Collected by Accounts Desk on ${todayStr}`,
        };
      }
      return item;
    });

    // Update student totals
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
          payment_ref: referenceNo || (mode === 'OFFLINE_CASH' ? 'Cash at Counter #1' : 'Cheque In-Hand'),
          receipt_number: nextReceiptNum,
          paid_at: nowIso,
          clerk_note: clerkNote || `Collected by Accounts Desk on ${todayStr}`,
          updated_at: nowIso,
        })
        .eq('id', installmentId)
        .then(() => {
          const st = updatedStudents.find((s) => s.id === inst.studentId);
          if (st) {
            supabase
              .from('students')
              .update({
                total_paid: st.totalPaid,
                total_pending: st.totalPending,
                updated_at: nowIso,
              })
              .eq('id', st.id)
              .then(() => {});
          }
        });
    }

    return {
      receiptNumber: nextReceiptNum,
      studentName: inst.studentName,
      amount: inst.amount,
    };
  },

  importStudentsFromCSV: (rows) => {
    const state = get();
    const newStudents: StudentRecord[] = [];
    const newInstallments: FeeInstallmentRecord[] = [];

    let count = state.students.length + 1;

    for (const row of rows) {
      const paddedNum = count.toString().padStart(4, '0');
      const studentId = `SCH-2026-${paddedNum}`;
      const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
      const annualFee = row.annualFee || (row.classGrade.includes('10') ? 48000 : 44000);
      const quarterFee = annualFee / 4;

      const newStudent: StudentRecord = {
        id: studentId,
        rollNo: row.rollNo || count.toString(),
        name: row.name,
        classGrade: row.classGrade,
        section: row.classGrade.includes('-') ? row.classGrade.split('-')[1] : 'A',
        parentName: row.parentName,
        parentPhone: row.parentPhone,
        parentPin: randomPin,
        annualFee,
        totalPaid: 0,
        totalPending: annualFee,
        atHomeHoursThisWeek: 0,
        streakDays: 0,
        attendancePercent: 100,
      };

      newStudents.push(newStudent);

      // Auto-create 4 quarterly fee installments
      const quarters = [
        { q: 'Q1 (Apr - Jun 2026)', due: '30 Apr 2026' },
        { q: 'Q2 (Jul - Sep 2026)', due: '31 Jul 2026' },
        { q: 'Q3 (Oct - Dec 2026)', due: '31 Oct 2026' },
        { q: 'Q4 (Jan - Mar 2027)', due: '30 Nov 2026' },
      ];

      quarters.forEach((qObj, qIdx) => {
        newInstallments.push({
          id: `inst-${paddedNum}-q${qIdx + 1}`,
          studentId,
          studentName: row.name,
          classGrade: row.classGrade,
          quarter: qObj.q,
          amount: quarterFee,
          status: 'PENDING',
          dueDate: qObj.due,
        });
      });

      count++;
    }

    set({
      students: [...state.students, ...newStudents],
      feeInstallments: [...state.feeInstallments, ...newInstallments],
    });

    if (isLiveSupabaseConfigured) {
      const dbStudents = newStudents.map((st) => ({
        id: st.id,
        school_id: 'DVPS01',
        school_code: 'DVPS01',
        roll_no: st.rollNo,
        name: st.name,
        class_grade: st.classGrade,
        section: st.section,
        parent_name: st.parentName,
        parent_phone: st.parentPhone,
        parent_pin: st.parentPin,
        annual_fee: st.annualFee,
        total_paid: st.totalPaid,
        total_pending: st.totalPending,
        at_home_hours: st.atHomeHoursThisWeek,
        streak_days: st.streakDays,
        attendance_percent: st.attendancePercent,
      }));

      const dbInstallments = newInstallments.map((inst) => ({
        id: inst.id,
        school_id: 'DVPS01',
        school_code: 'DVPS01',
        student_id: inst.studentId,
        student_name: inst.studentName,
        class_grade: inst.classGrade,
        quarter: inst.quarter,
        amount: inst.amount,
        status: inst.status,
        due_date: '2026-11-30',
      }));

      supabase.from('students').upsert(dbStudents).then(() => {});
      supabase.from('fee_ledger').upsert(dbInstallments).then(() => {});
    }

    return { importedCount: newStudents.length };
  },

  uploadSyllabusChapter: (payload) => {
    const todayStr = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const newRecord: SyllabusChapterRecord = {
      id: `syl-${Date.now()}`,
      fileName: payload.fileName,
      chapterNumber: payload.chapterNumber,
      title: payload.title,
      classGrade: payload.classGrade,
      subject: payload.subject,
      fileSizeBytes: '5.2 MB',
      uploadedAt: todayStr,
      status: 'READY',
      arModelMapped: payload.arModelMapped,
      generatedMilestones: [
        {
          nodeId: `n-${Date.now()}-1`,
          title: `${payload.chapterNumber}.1 Core Theoretical Concepts & Principles`,
          ncertPageRange: 'Pages 01-08',
          ragStatus: 'GROUNDED',
        },
        {
          nodeId: `n-${Date.now()}-2`,
          title: `${payload.chapterNumber}.2 Real-World Indian Everyday Applications`,
          ncertPageRange: 'Pages 09-15',
          ragStatus: 'GROUNDED',
        },
        {
          nodeId: `n-${Date.now()}-3`,
          title: `${payload.chapterNumber}.3 Step-by-Step Problem Solving & Derivations`,
          ncertPageRange: 'Pages 16-22',
          ragStatus: 'GROUNDED',
        },
        {
          nodeId: `n-${Date.now()}-4`,
          title: `${payload.chapterNumber}.4 3D Spatial Anatomy / Lab Simulation Drill`,
          ncertPageRange: 'Pages 23-28',
          ragStatus: 'GROUNDED',
        },
        {
          nodeId: `n-${Date.now()}-5`,
          title: `${payload.chapterNumber}.5 CBSE 5-Year Past Examination Board Questions`,
          ncertPageRange: 'Pages 29-34',
          ragStatus: 'GROUNDED',
        },
      ],
    };

    set((state) => ({
      syllabusVault: [newRecord, ...state.syllabusVault],
    }));

    if (isLiveSupabaseConfigured) {
      supabase
        .from('syllabus_roadmaps')
        .insert({
          id: newRecord.id,
          school_id: 'DVPS01',
          school_code: 'DVPS01',
          chapter_number: newRecord.chapterNumber,
          title: newRecord.title,
          class_grade: newRecord.classGrade,
          subject: newRecord.subject,
          board: 'CBSE',
          file_name: newRecord.fileName,
          file_size_bytes: newRecord.fileSizeBytes,
          status: newRecord.status,
          ar_model_mapped: newRecord.arModelMapped,
          milestones_json: newRecord.generatedMilestones,
          progress_percent: 0,
          is_current: false,
        })
        .then(() => {});
    }

    return newRecord;
  },

  updateStudentMark: (studentId, term, subject, marksObtained, remarks) => {
    set((state) => {
      const student = state.students.find((s) => s.id === studentId);
      const studentName = student ? student.name : 'Unknown';
      const classGrade = student ? student.classGrade : 'Class 10-A';
      const rollNo = student ? student.rollNo : '0';

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
            remarks: isTarget ? (remarks || 'Good consistency.') : 'Good consistency.',
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
        supabase
          .from('exam_marks')
          .upsert({
            id: `${updatedRecord.studentId}_${updatedRecord.term}`,
            school_id: 'DVPS01',
            school_code: 'DVPS01',
            student_id: updatedRecord.studentId,
            student_name: updatedRecord.studentName,
            class_grade: updatedRecord.classGrade,
            roll_no: updatedRecord.rollNo,
            term: updatedRecord.term,
            scores_json: updatedRecord.scores,
            aggregate_percentage: updatedRecord.aggregatePercentage,
            overall_grade: updatedRecord.overallGrade,
            needs_remediation: updatedRecord.needsRemediation,
            updated_at: new Date().toISOString(),
          })
          .then(() => {});
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
    const newCircular: AdminCircular = {
      ...payload,
      id: `circ-${Date.now().toString(36)}`,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    };
    set((state) => ({
      circulars: [newCircular, ...state.circulars],
    }));
  },

  toggleStudentAttendance: (studentId, status) => {
    set((state) => {
      const newRegister = {
        ...state.attendanceRegister,
        [studentId]: status,
      };
      const updatedStudents = state.students.map((st) => {
        if (st.id === studentId) {
          const delta = status === 'PRESENT' ? 0.3 : -0.3;
          const newPct = Math.min(100, Math.max(70, parseFloat((st.attendancePercent + delta).toFixed(1))));
          return { ...st, attendancePercent: newPct };
        }
        return st;
      });
      return {
        attendanceRegister: newRegister,
        students: updatedStudents,
      };
    });
  },

  markAllAttendance: (classGrade, status) => {
    set((state) => {
      const newRegister = { ...state.attendanceRegister };
      const updatedStudents = state.students.map((st) => {
        if (st.classGrade === classGrade) {
          newRegister[st.id] = status;
          const delta = status === 'PRESENT' ? 0.2 : -0.2;
          const newPct = Math.min(100, Math.max(70, parseFloat((st.attendancePercent + delta).toFixed(1))));
          return { ...st, attendancePercent: newPct };
        }
        return st;
      });
      return {
        attendanceRegister: newRegister,
        students: updatedStudents,
      };
    });
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
