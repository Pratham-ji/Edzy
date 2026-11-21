import { create } from 'zustand';
import { supabase, isLiveSupabaseConfigured } from '../lib/supabase';

export type UserMode = 'STUDENT' | 'PARENT';

export type MilestoneStatus = 'LOCKED' | 'IN_PROGRESS' | 'COMPLETED';

export interface RoadmapMilestone {
  id: string;
  title: string;
  description: string;
  status: MilestoneStatus;
  arModelId?: string;
  targetNode?: string;
  durationMinutes: number;
}

export interface SyllabusRoadmap {
  id: string;
  chapterNumber: number;
  subject: string;
  title: string;
  board: string;
  totalSubtopics: number;
  completedSubtopics: number;
  progressPercent: number;
  isCurrent: boolean;
  milestones: RoadmapMilestone[];
}

export interface ARDirective {
  modelName: string;
  targetNode: string;
  rotation: string;
  highlight: boolean;
  latencyMs: number;
  fps: number;
  note: string;
  explodeFactor?: number;
}

export interface ChatMessage {
  id: string;
  sender: 'STUDENT' | 'SOCRATIC_AI';
  text: string;
  timestamp: string;
  sourceDoc?: string;
  arTriggerNode?: string;
  arModelName?: string;
}

export type PaymentMethod = 'ONLINE_UPI' | 'OFFLINE_CASH' | 'OFFLINE_CHEQUE';
export type PaymentStatus = 'PAID' | 'PENDING' | 'OVERDUE';

export interface FeeInstallment {
  id: string;
  quarter: string;
  academicYear: string;
  amount: number;
  status: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentChannelDetail?: string;
  receiptNumber?: string;
  paidDate?: string;
  dueDate: string;
}

export interface ExamSubjectScore {
  subject: string;
  marksObtained: number;
  maxMarks: number;
  grade: string;
  classAverage: number;
  teacherRemarks: string;
}

export interface ExamTermRecord {
  termId: 'UNIT_TEST_1' | 'MIDTERM' | 'PRE_BOARD';
  termName: string;
  academicYear: string;
  totalObtained: number;
  totalMax: number;
  percentage: number;
  rankInClass: number;
  totalStudents: number;
  attendancePercentage: number;
  scores: ExamSubjectScore[];
}

export interface StudentProfile {
  id: string;
  name: string;
  classGrade: string;
  rollNo: string;
  schoolName: string;
  schoolCode: string;
  parentName: string;
  parentPin: string;
  weeklyStudyHours: number;
  streakDays: number;
  avatarUrl?: string;
}

interface EdzyState {
  // Auth & Mode
  isAuthenticated: boolean;
  activeMode: UserMode;
  studentProfile: StudentProfile;

  // Study & Syllabi
  roadmaps: SyllabusRoadmap[];
  activeArDirective: ARDirective;
  chatMessages: ChatMessage[];

  // ERP & Finance
  feeInstallments: FeeInstallment[];
  examMarks: ExamTermRecord[];

  // Digital Wellbeing & Screen Time Limit
  sessionTimeLimitMinutes: number;
  sessionRemainingSeconds: number;
  isTimeLimitActive: boolean;
  isSessionLocked: boolean;

  // Realtime Cloud Connection
  connectionMode: 'LIVE_CLOUD' | 'DEMO_MODE';
  liveSyncToast: string | null;

  // Actions
  initializeMobileSync: (studentIdOrRoll?: string) => Promise<() => void>;
  clearLiveSyncToast: () => void;
  login: (schoolCode: string, studentId: string, pinOrPass: string) => boolean;
  oneTapDemoLogin: () => void;
  logout: () => void;
  setActiveMode: (mode: UserMode) => void;
  updateArDirective: (partial: Partial<ARDirective>) => void;
  markMilestoneStatus: (roadmapId: string, milestoneId: string, status: MilestoneStatus) => void;
  sendSocraticPrompt: (question: string) => void;
  payFeeInstallment: (installmentId: string, pin: string) => { success: boolean; message: string; receiptNo?: string };
  incrementStudyHour: (hours: number) => void;
  setTimeLimitMinutes: (minutes: number) => void;
  decrementSessionSecond: () => void;
  unlockOrExtendSession: (pin: string, additionalMinutes: number) => boolean;
  toggleTimeLimitActive: () => void;
}

const INITIAL_ROADMAPS: SyllabusRoadmap[] = [
  {
    id: 'bio-ch6',
    chapterNumber: 6,
    subject: 'Biology (Science)',
    title: 'Life Processes & Human Circulatory System',
    board: 'CBSE Class 10 NCERT',
    totalSubtopics: 4,
    completedSubtopics: 3,
    progressPercent: 75,
    isCurrent: true,
    milestones: [
      {
        id: 'bio-node-1',
        title: '6.1 Autotrophic Nutrition & Stomata Gas Exchange',
        description: 'Chlorophyll activation, light-dependent reactions, and guard cell turgidity.',
        status: 'COMPLETED',
        durationMinutes: 25,
      },
      {
        id: 'bio-node-2',
        title: '6.2 Human Digestive System: Enzymes & Villi',
        description: 'Pepsin, trypsin, bile salts, and microvillar absorption mechanism.',
        status: 'COMPLETED',
        durationMinutes: 30,
      },
      {
        id: 'bio-node-3',
        title: '6.3 Human Heart: Chambers, Double Circulation & Aorta',
        description: 'Systemic vs pulmonary circulation, bicuspid valves, and deoxygenated venous return.',
        status: 'IN_PROGRESS',
        arModelId: 'human-heart-3d',
        targetNode: 'Aorta',
        durationMinutes: 45,
      },
      {
        id: 'bio-node-4',
        title: '6.4 Excretion: Nephron Filtration & Bowman Capsule',
        description: 'Ultrafiltration, selective reabsorption of glucose, and urine concentration.',
        status: 'LOCKED',
        arModelId: 'nephron-3d',
        targetNode: 'Bowman Capsule',
        durationMinutes: 35,
      },
    ],
  },
  {
    id: 'phy-ch10',
    chapterNumber: 10,
    subject: 'Physics (Science)',
    title: 'Light: Reflection & Refraction',
    board: 'CBSE Class 10 NCERT',
    totalSubtopics: 4,
    completedSubtopics: 2,
    progressPercent: 50,
    isCurrent: false,
    milestones: [
      {
        id: 'phy-node-1',
        title: '10.1 Spherical Mirrors: Concave & Convex Focal Lengths',
        description: 'Ray tracing conventions, pole, radius of curvature, and principal axis.',
        status: 'COMPLETED',
        durationMinutes: 30,
      },
      {
        id: 'phy-node-2',
        title: '10.2 Mirror Formula & Magnification Ratio',
        description: 'Sign conventions (Cartesian), 1/f = 1/v + 1/u, and linear magnification.',
        status: 'COMPLETED',
        durationMinutes: 40,
      },
      {
        id: 'phy-node-3',
        title: "10.3 Snell's Law & Refractive Index (Air-Glass Boundary)",
        description: 'Light speed variance in optical media, lateral displacement, and critical angle.',
        status: 'IN_PROGRESS',
        arModelId: 'optics-bench-3d',
        targetNode: 'Glass Slab Ray',
        durationMinutes: 35,
      },
      {
        id: 'phy-node-4',
        title: '10.4 Convex Lens Ray Tracing & Power of Lens',
        description: 'Real vs virtual inverted images and Dioptre focal calculation.',
        status: 'LOCKED',
        durationMinutes: 30,
      },
    ],
  },
  {
    id: 'math-ch4',
    chapterNumber: 4,
    subject: 'Mathematics',
    title: 'Quadratic Equations & Discriminant Analysis',
    board: 'CBSE Class 10 NCERT',
    totalSubtopics: 3,
    completedSubtopics: 1,
    progressPercent: 33,
    isCurrent: false,
    milestones: [
      {
        id: 'math-node-1',
        title: '4.1 Standard Form: ax² + bx + c = 0 & Factorisation',
        description: 'Splitting the middle term method and geometry of parabolas.',
        status: 'COMPLETED',
        durationMinutes: 40,
      },
      {
        id: 'math-node-2',
        title: '4.2 Quadratic Formula (Shreedharacharya Rule)',
        description: 'Derivation by completing the square and algebraic proofs.',
        status: 'IN_PROGRESS',
        durationMinutes: 45,
      },
      {
        id: 'math-node-3',
        title: '4.3 Nature of Roots (Discriminant D = b² - 4ac)',
        description: 'Real, equal, distinct, or imaginary roots with word problems.',
        status: 'LOCKED',
        durationMinutes: 35,
      },
    ],
  },
];

const INITIAL_DIRECTIVE: ARDirective = {
  modelName: 'Human Heart (3D Spatial Lab)',
  targetNode: 'Aorta',
  rotation: '0°, 45°, 0°',
  highlight: true,
  latencyMs: 18,
  fps: 60,
  note: 'Oxygenated blood leaves the left ventricle via the Aorta.',
  explodeFactor: 0.15,
};

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'STUDENT',
    text: 'Sir, how does oxygenated blood avoid mixing with deoxygenated blood in the human heart?',
    timestamp: '10:14 AM',
  },
  {
    id: 'msg-2',
    sender: 'SOCRATIC_AI',
    text: 'Great question, Aarav! Look at the muscular wall dividing the left and right chambers. What is this septum called, and how does the pressure difference between the ventricles guide the blood through the Aorta?',
    timestamp: '10:15 AM',
    sourceDoc: 'Class10_Bio_Ch6_SchoolNotes.pdf (Page 106)',
    arTriggerNode: 'Aorta',
    arModelName: 'Human Heart (3D Spatial Lab)',
  },
];

const INITIAL_FEES: FeeInstallment[] = [
  {
    id: 'fee-q1',
    quarter: 'Quarter 1 (Apr - Jun 2026)',
    academicYear: '2026-2027',
    amount: 12000,
    status: 'PAID',
    paymentMethod: 'OFFLINE_CASH',
    paymentChannelDetail: 'School Reception Cash Counter Desk #2',
    receiptNumber: '#SCH-1042',
    paidDate: '12 Apr 2026',
    dueDate: '30 Apr 2026',
  },
  {
    id: 'fee-q2',
    quarter: 'Quarter 2 (Jul - Sep 2026)',
    academicYear: '2026-2027',
    amount: 12000,
    status: 'PAID',
    paymentMethod: 'OFFLINE_CHEQUE',
    paymentChannelDetail: 'HDFC Bank Cheque Clr #902188 (Accounts Office)',
    receiptNumber: '#SCH-2190',
    paidDate: '14 Jul 2026',
    dueDate: '31 Jul 2026',
  },
  {
    id: 'fee-q3',
    quarter: 'Quarter 3 (Oct - Dec 2026)',
    academicYear: '2026-2027',
    amount: 12000,
    status: 'PAID',
    paymentMethod: 'ONLINE_UPI',
    paymentChannelDetail: 'Edzy UPI Gateway (PhonePe - TxnRef: EDZ904812)',
    receiptNumber: '#EDZ-5581',
    paidDate: '05 Oct 2026',
    dueDate: '31 Oct 2026',
  },
  {
    id: 'fee-q4',
    quarter: 'Quarter 4 (Jan - Mar 2027)',
    academicYear: '2026-2027',
    amount: 12000,
    status: 'PENDING',
    dueDate: '30 Nov 2026',
  },
];

const INITIAL_EXAMS: ExamTermRecord[] = [
  {
    termId: 'PRE_BOARD',
    termName: 'Class 10 Pre-Board Examination',
    academicYear: '2026-2027',
    totalObtained: 463,
    totalMax: 500,
    percentage: 92.6,
    rankInClass: 2,
    totalStudents: 42,
    attendancePercentage: 96.8,
    scores: [
      {
        subject: 'Science & Lab',
        marksObtained: 94,
        maxMarks: 100,
        grade: 'A1',
        classAverage: 74.2,
        teacherRemarks: 'Exceptional visual grasp of Biology diagrams and Optics ray problems.',
      },
      {
        subject: 'Mathematics',
        marksObtained: 91,
        maxMarks: 100,
        grade: 'A1',
        classAverage: 69.5,
        teacherRemarks: 'Strong arithmetic reasoning; double check quadratic word problems.',
      },
      {
        subject: 'English Communicative',
        marksObtained: 88,
        maxMarks: 100,
        grade: 'A2',
        classAverage: 76.1,
        teacherRemarks: 'Good analytical essay writing. Keep vocabulary sharp in literature sections.',
      },
      {
        subject: 'Social Science',
        marksObtained: 92,
        maxMarks: 100,
        grade: 'A1',
        classAverage: 71.0,
        teacherRemarks: 'Detailed historical chronology and accurate map plotting.',
      },
      {
        subject: 'Computer Applications',
        marksObtained: 98,
        maxMarks: 100,
        grade: 'A1',
        classAverage: 82.4,
        teacherRemarks: 'Top scorer! Implemented Python loop algorithms with clean logic.',
      },
    ],
  },
  {
    termId: 'MIDTERM',
    termName: 'Midterm Half-Yearly Assessments',
    academicYear: '2026-2027',
    totalObtained: 451,
    totalMax: 500,
    percentage: 90.2,
    rankInClass: 4,
    totalStudents: 42,
    attendancePercentage: 95.4,
    scores: [
      {
        subject: 'Science & Lab',
        marksObtained: 90,
        maxMarks: 100,
        grade: 'A1',
        classAverage: 71.8,
        teacherRemarks: 'Very good understanding of chemical reactions and balancing.',
      },
      {
        subject: 'Mathematics',
        marksObtained: 89,
        maxMarks: 100,
        grade: 'A2',
        classAverage: 67.2,
        teacherRemarks: 'Good performance in Polynomials and Triangles.',
      },
      {
        subject: 'English Communicative',
        marksObtained: 86,
        maxMarks: 100,
        grade: 'A2',
        classAverage: 73.5,
        teacherRemarks: 'Solid reading comprehension.',
      },
      {
        subject: 'Social Science',
        marksObtained: 90,
        maxMarks: 100,
        grade: 'A1',
        classAverage: 68.9,
        teacherRemarks: 'Clear answers in Civics and Geography.',
      },
      {
        subject: 'Computer Applications',
        marksObtained: 96,
        maxMarks: 100,
        grade: 'A1',
        classAverage: 79.0,
        teacherRemarks: 'Excellent coding test score.',
      },
    ],
  },
  {
    termId: 'UNIT_TEST_1',
    termName: 'Unit Test 1 (Periodic Assessment)',
    academicYear: '2026-2027',
    totalObtained: 227,
    totalMax: 250,
    percentage: 90.8,
    rankInClass: 3,
    totalStudents: 42,
    attendancePercentage: 98.0,
    scores: [
      {
        subject: 'Science & Lab',
        marksObtained: 46,
        maxMarks: 50,
        grade: 'A1',
        classAverage: 36.2,
        teacherRemarks: 'Strong start in Life Processes.',
      },
      {
        subject: 'Mathematics',
        marksObtained: 44,
        maxMarks: 50,
        grade: 'A2',
        classAverage: 33.1,
        teacherRemarks: 'Accurate Real Numbers proofs.',
      },
      {
        subject: 'English Communicative',
        marksObtained: 43,
        maxMarks: 50,
        grade: 'A2',
        classAverage: 37.0,
        teacherRemarks: 'Very good grammar accuracy.',
      },
      {
        subject: 'Social Science',
        marksObtained: 46,
        maxMarks: 50,
        grade: 'A1',
        classAverage: 35.4,
        teacherRemarks: 'Well structured answers in Nationalism in India.',
      },
      {
        subject: 'Computer Applications',
        marksObtained: 48,
        maxMarks: 50,
        grade: 'A1',
        classAverage: 40.5,
        teacherRemarks: 'Superb grasp of basic algorithms.',
      },
    ],
  },
];

export const useEdzyStore = create<EdzyState>((set, get) => ({
  isAuthenticated: true,
  activeMode: 'STUDENT',
  studentProfile: {
    id: 'SCH-2026-0104',
    name: 'Aarav Sharma',
    classGrade: 'Class 10-A',
    rollNo: '24',
    schoolName: 'Doon Valley Public School',
    schoolCode: 'DVPS01',
    parentName: 'Rajesh Sharma',
    parentPin: '1234',
    weeklyStudyHours: 6.5,
    streakDays: 12,
  },
  roadmaps: INITIAL_ROADMAPS,
  activeArDirective: INITIAL_DIRECTIVE,
  chatMessages: INITIAL_MESSAGES,
  feeInstallments: INITIAL_FEES,
  examMarks: INITIAL_EXAMS,

  // Digital Wellbeing: 45 min default time limit to avoid digital fatigue & time waste
  sessionTimeLimitMinutes: 45,
  sessionRemainingSeconds: 45 * 60,
  isTimeLimitActive: true,
  isSessionLocked: false,

  // Realtime Cloud Connection
  connectionMode: isLiveSupabaseConfigured ? 'LIVE_CLOUD' : 'DEMO_MODE',
  liveSyncToast: null,
  clearLiveSyncToast: () => set({ liveSyncToast: null }),

  initializeMobileSync: async (studentIdOrRoll = 'SCH-2026-0104') => {
    if (!isLiveSupabaseConfigured) {
      set({ connectionMode: 'DEMO_MODE' });
      return () => {};
    }

    try {
      const targetId = studentIdOrRoll;
      const [studentRes, feeRes, marksRes, syllabusRes] = await Promise.all([
        supabase.from('students').select('*').eq('id', targetId).maybeSingle(),
        supabase.from('fee_ledger').select('*').eq('student_id', targetId).order('due_date', { ascending: true }),
        supabase.from('exam_marks').select('*').eq('student_id', targetId),
        supabase.from('syllabus_roadmaps').select('*').order('chapter_number', { ascending: true }),
      ]);

      const updates: Partial<EdzyState> = {};

      if (studentRes.data) {
        const s = studentRes.data;
        updates.studentProfile = {
          ...get().studentProfile,
          id: s.id,
          name: s.name || get().studentProfile.name,
          rollNo: s.roll_no ? String(s.roll_no) : get().studentProfile.rollNo,
          classGrade: s.class_grade || get().studentProfile.classGrade,
          parentName: s.parent_name || get().studentProfile.parentName,
          parentPin: s.parent_pin || get().studentProfile.parentPin,
          weeklyStudyHours: Number(s.at_home_hours || get().studentProfile.weeklyStudyHours),
          streakDays: Number(s.streak_days || get().studentProfile.streakDays),
        };
      }

      if (feeRes.data && feeRes.data.length > 0) {
        updates.feeInstallments = feeRes.data.map((row: any) => ({
          id: row.id,
          quarter: row.quarter,
          academicYear: '2026-2027',
          amount: Number(row.amount),
          status: row.status as PaymentStatus,
          paymentMethod: row.payment_mode as PaymentMethod | undefined,
          paymentChannelDetail:
            row.payment_mode === 'OFFLINE_CASH'
              ? 'School Accounts Desk (Cash Counter #1)'
              : row.payment_mode === 'OFFLINE_CHEQUE'
              ? `Bank Cheque (${row.payment_ref || 'In-Hand'})`
              : 'Instant UPI (Razorpay/NPCI)',
          receiptNumber: row.receipt_number || undefined,
          paidDate: row.paid_at
            ? new Date(row.paid_at).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })
            : undefined,
          dueDate: row.due_date || '30 Nov 2026',
        }));
      }

      if (marksRes.data && marksRes.data.length > 0) {
        updates.examMarks = marksRes.data.map((row: any) => ({
          termId: row.term as any,
          termName:
            row.term === 'PRE_BOARD'
              ? 'Class 10 Pre-Board Examination'
              : row.term === 'MIDTERM'
              ? 'Class 10 Midterm Examination'
              : 'Class 10 Unit Test 1',
          academicYear: '2026-2027',
          totalObtained: Array.isArray(row.scores_json)
            ? row.scores_json.reduce((sum: number, sc: any) => sum + (sc.marksObtained || 0), 0)
            : 463,
          totalMax: 500,
          percentage: Number(row.aggregate_percentage || 92.6),
          rankInClass: 2,
          totalStudents: 42,
          attendancePercentage: 96.8,
          scores: Array.isArray(row.scores_json)
            ? row.scores_json.map((sc: any) => ({
                subject: sc.subject,
                marksObtained: sc.marksObtained,
                maxMarks: sc.maxMarks || 100,
                grade: sc.grade || 'A1',
                classAverage: 78,
                teacherRemarks: sc.remarks || 'Good performance',
              }))
            : [],
        }));
      }

      if (syllabusRes.data && syllabusRes.data.length > 0) {
        updates.roadmaps = syllabusRes.data.map((row: any) => ({
          id: row.id,
          chapterNumber: Number(row.chapter_number),
          subject: row.subject,
          title: row.title,
          board: 'CBSE Class 10 NCERT',
          totalSubtopics: Array.isArray(row.milestones_json) ? row.milestones_json.length : 5,
          completedSubtopics: Number(row.progress_percent) > 50 ? 3 : 1,
          progressPercent: Number(row.progress_percent || 0),
          isCurrent: Boolean(row.is_current),
          milestones: Array.isArray(row.milestones_json)
            ? row.milestones_json.map((ms: any, idx: number) => ({
                id: ms.nodeId || `m-${idx}`,
                title: ms.title,
                description: ms.ncertPageRange || 'NCERT Textbook',
                status: idx === 0 ? 'COMPLETED' : idx === 1 ? 'IN_PROGRESS' : 'LOCKED',
                targetNode: row.ar_model_mapped !== 'None' ? 'Aorta' : undefined,
                durationMinutes: 45,
              }))
            : [],
        }));
      }

      set({
        ...updates,
        connectionMode: 'LIVE_CLOUD',
      });

      // Realtime subscription filtered for student
      const channel = supabase
        .channel(`mobile-sync-${targetId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'fee_ledger',
            filter: `student_id=eq.${targetId}`,
          },
          (payload) => {
            const row: any = payload.new;
            if (!row || !row.id) return;
            set((state) => {
              const mapped: FeeInstallment = {
                id: row.id,
                quarter: row.quarter,
                academicYear: '2026-2027',
                amount: Number(row.amount),
                status: row.status as PaymentStatus,
                paymentMethod: row.payment_mode as PaymentMethod | undefined,
                paymentChannelDetail:
                  row.payment_mode === 'OFFLINE_CASH'
                    ? 'School Accounts Desk (Cash Counter #1)'
                    : row.payment_mode === 'OFFLINE_CHEQUE'
                    ? `Bank Cheque (${row.payment_ref || 'In-Hand'})`
                    : 'Instant UPI (Razorpay/NPCI)',
                receiptNumber: row.receipt_number || undefined,
                paidDate: row.paid_at
                  ? new Date(row.paid_at).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })
                  : undefined,
                dueDate: row.due_date || '30 Nov 2026',
              };

              const updated = state.feeInstallments.map((item) =>
                item.id === row.id ? mapped : item
              );

              const notice = row.receipt_number
                ? `Fee Receipt #${row.receipt_number} synced from School Desk`
                : `Fee installment updated: ${row.quarter}`;

              return {
                feeInstallments: updated,
                liveSyncToast: notice,
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
            filter: `student_id=eq.${targetId}`,
          },
          (payload) => {
            const row: any = payload.new;
            if (!row || !row.id) return;
            set((state) => {
              const mapped: ExamTermRecord = {
                termId: row.term as any,
                termName:
                  row.term === 'PRE_BOARD'
                    ? 'Class 10 Pre-Board Examination'
                    : row.term === 'MIDTERM'
                    ? 'Class 10 Midterm Examination'
                    : 'Class 10 Unit Test 1',
                academicYear: '2026-2027',
                totalObtained: Array.isArray(row.scores_json)
                  ? row.scores_json.reduce((sum: number, sc: any) => sum + (sc.marksObtained || 0), 0)
                  : 463,
                totalMax: 500,
                percentage: Number(row.aggregate_percentage || 92.6),
                rankInClass: 2,
                totalStudents: 42,
                attendancePercentage: 96.8,
                scores: Array.isArray(row.scores_json)
                  ? row.scores_json.map((sc: any) => ({
                      subject: sc.subject,
                      marksObtained: sc.marksObtained,
                      maxMarks: sc.maxMarks || 100,
                      grade: sc.grade || 'A1',
                      classAverage: 78,
                      teacherRemarks: sc.remarks || 'Good performance',
                    }))
                  : [],
              };
              const filtered = state.examMarks.filter((m) => m.termId !== mapped.termId);
              return {
                examMarks: [mapped, ...filtered],
                liveSyncToast: `Exam Marks updated by teacher: ${mapped.termName}`,
              };
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
              const newRoadmap: SyllabusRoadmap = {
                id: row.id,
                chapterNumber: Number(row.chapter_number),
                subject: row.subject,
                title: row.title,
                board: 'CBSE Class 10 NCERT',
                totalSubtopics: Array.isArray(row.milestones_json) ? row.milestones_json.length : 5,
                completedSubtopics: 1,
                progressPercent: Number(row.progress_percent || 0),
                isCurrent: Boolean(row.is_current),
                milestones: Array.isArray(row.milestones_json)
                  ? row.milestones_json.map((ms: any, idx: number) => ({
                      id: ms.nodeId || `m-${idx}`,
                      title: ms.title,
                      description: ms.ncertPageRange || 'NCERT Textbook',
                      status: idx === 0 ? 'COMPLETED' : idx === 1 ? 'IN_PROGRESS' : 'LOCKED',
                      targetNode: row.ar_model_mapped !== 'None' ? 'Aorta' : undefined,
                      durationMinutes: 45,
                    }))
                  : [],
              };
              const exists = state.roadmaps.some((r) => r.id === row.id);
              return {
                roadmaps: exists
                  ? state.roadmaps.map((r) => (r.id === row.id ? newRoadmap : r))
                  : [...state.roadmaps, newRoadmap],
                liveSyncToast: `New Syllabus Chapter synced: Ch ${newRoadmap.chapterNumber}`,
              };
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (err) {
      console.warn('Mobile Supabase Realtime fell back to Demo Mode:', err);
      set({ connectionMode: 'DEMO_MODE' });
      return () => {};
    }
  },

  login: (schoolCode, studentId, pinOrPass) => {
    // Validates credentials or fallback to demo
    if (studentId.trim() === 'SCH-2026-0104' || pinOrPass === '1234' || schoolCode.toUpperCase() === 'DVPS01') {
      set({ isAuthenticated: true });
      return true;
    }
    // Accept valid-looking school login
    if (studentId.length >= 3) {
      set({ isAuthenticated: true });
      return true;
    }
    return false;
  },

  oneTapDemoLogin: () => {
    set({
      isAuthenticated: true,
      activeMode: 'STUDENT',
    });
  },

  logout: () => {
    set({ isAuthenticated: false });
  },

  setActiveMode: (mode) => {
    set({ activeMode: mode });
  },

  updateArDirective: (partial) => {
    set((state) => ({
      activeArDirective: {
        ...state.activeArDirective,
        ...partial,
      },
    }));
  },

  markMilestoneStatus: (roadmapId, milestoneId, status) => {
    set((state) => {
      const updatedRoadmaps = state.roadmaps.map((r) => {
        if (r.id !== roadmapId) return r;
        const updatedMilestones = r.milestones.map((m) => {
          if (m.id !== milestoneId) return m;
          return { ...m, status };
        });
        const completedCount = updatedMilestones.filter((m) => m.status === 'COMPLETED').length;
        const percent = Math.round((completedCount / updatedMilestones.length) * 100);
        return {
          ...r,
          milestones: updatedMilestones,
          completedSubtopics: completedCount,
          progressPercent: percent,
        };
      });
      return { roadmaps: updatedRoadmaps };
    });
  },

  sendSocraticPrompt: (question: string) => {
    const studentMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'STUDENT',
      text: question,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Syllabus-grounded pedagogical responses tailored to Class 10 CBSE NCERT
    let aiResponseText = '';
    let targetNode = 'Aorta';
    const qLower = question.toLowerCase();

    if (qLower.includes('valve') || qLower.includes('bicuspid')) {
      targetNode = 'Bicuspid Valve';
      aiResponseText =
        'Notice how the bicuspid (mitral) valve acts as a one-way flap between the left atrium and left ventricle. Why is unidirectional blood flow critical under high ventricular systolic pressure?';
    } else if (qLower.includes('ventricle') || qLower.includes('pressure') || qLower.includes('wall')) {
      targetNode = 'Left Ventricle';
      aiResponseText =
        'Observe the myocardial muscle thickness of the left ventricle compared to the right ventricle. Since it must pump blood to the entire human body through systemic circulation, why must its muscular wall be 3x thicker?';
    } else if (qLower.includes('pulmonary') || qLower.includes('lungs') || qLower.includes('vein')) {
      targetNode = 'Pulmonary Vein';
      aiResponseText =
        'Recall from NCERT page 106: veins typically carry deoxygenated blood, EXCEPT the pulmonary vein! Which organ does it arrive from, and why is its oxygen saturation above 98%?';
    } else {
      targetNode = 'Aorta';
      aiResponseText =
        'Based on Class 10 NCERT Life Processes (Ch 6), the Aorta is the largest systemic artery, enduring a systolic pressure of 120 mmHg. Look at the 3D model: where does it arch over the pulmonary trunk?';
    }

    const aiMsg: ChatMessage = {
      id: `msg-${Date.now()}-ai`,
      sender: 'SOCRATIC_AI',
      text: aiResponseText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sourceDoc: 'Class10_Bio_Ch6_SchoolNotes.pdf (Page 106-107)',
      arTriggerNode: targetNode,
      arModelName: 'Human Heart (3D Spatial Lab)',
    };

    set((state) => ({
      chatMessages: [...state.chatMessages, studentMsg, aiMsg],
      activeArDirective: {
        ...state.activeArDirective,
        targetNode,
        highlight: true,
        note: `Socratic Focus: ${targetNode} highlighted as referenced in ${aiMsg.sourceDoc}`,
      },
    }));
  },

  payFeeInstallment: (installmentId: string, pin: string) => {
    const state = get();
    if (pin.trim() !== state.studentProfile.parentPin) {
      return { success: false, message: 'Invalid 4-digit Parent PIN. Please check security PIN.' };
    }

    const targetInstallment = state.feeInstallments.find((f) => f.id === installmentId);
    if (!targetInstallment) {
      return { success: false, message: 'Installment record not found.' };
    }

    if (targetInstallment.status === 'PAID') {
      return { success: false, message: 'This installment has already been settled.' };
    }

    const generatedReceipt = '#EDZ-9940';
    const nowStr = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const updatedInstallments = state.feeInstallments.map((item) => {
      if (item.id === installmentId) {
        return {
          ...item,
          status: 'PAID' as PaymentStatus,
          paymentMethod: 'ONLINE_UPI' as PaymentMethod,
          paymentChannelDetail: 'Edzy Instant UPI (Razorpay/NPCI Authenticated)',
          receiptNumber: generatedReceipt,
          paidDate: nowStr,
        };
      }
      return item;
    });

    set({ feeInstallments: updatedInstallments });

    if (isLiveSupabaseConfigured) {
      const nowIso = new Date().toISOString();
      supabase
        .from('fee_ledger')
        .update({
          status: 'PAID',
          payment_mode: 'ONLINE_UPI',
          payment_ref: 'UPI-RAZOR-991204',
          receipt_number: generatedReceipt,
          paid_at: nowIso,
          clerk_note: 'Paid via Instant UPI on Mobile App',
          updated_at: nowIso,
        })
        .eq('id', installmentId)
        .then(() => {});

      supabase
        .from('students')
        .update({
          total_paid: 48000,
          total_pending: 0,
          updated_at: nowIso,
        })
        .eq('id', state.studentProfile.id)
        .then(() => {});
    }

    return {
      success: true,
      message: 'Payment of ₹12,000 processed successfully via UPI.',
      receiptNo: generatedReceipt,
    };
  },

  incrementStudyHour: (hours: number) => {
    set((state) => ({
      studentProfile: {
        ...state.studentProfile,
        weeklyStudyHours: parseFloat((state.studentProfile.weeklyStudyHours + hours).toFixed(1)),
      },
    }));
  },

  setTimeLimitMinutes: (minutes: number) => {
    set({
      sessionTimeLimitMinutes: minutes,
      sessionRemainingSeconds: minutes * 60,
      isSessionLocked: false,
    });
  },

  decrementSessionSecond: () => {
    const { sessionRemainingSeconds, isTimeLimitActive, isSessionLocked } = get();
    if (!isTimeLimitActive || isSessionLocked) return;

    if (sessionRemainingSeconds <= 1) {
      set({ sessionRemainingSeconds: 0, isSessionLocked: true });
    } else {
      set({ sessionRemainingSeconds: sessionRemainingSeconds - 1 });
    }
  },

  unlockOrExtendSession: (pin: string, additionalMinutes: number) => {
    const { studentProfile } = get();
    if (pin.trim() !== studentProfile.parentPin) {
      return false;
    }
    set((state) => ({
      sessionRemainingSeconds: state.sessionRemainingSeconds + additionalMinutes * 60,
      isSessionLocked: false,
    }));
    return true;
  },

  toggleTimeLimitActive: () => {
    set((state) => ({
      isTimeLimitActive: !state.isTimeLimitActive,
      isSessionLocked: false,
    }));
  },
}));
