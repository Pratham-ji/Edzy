import { StaffDepartment } from './idGenerator';
import type { CampusConfig } from './campusConfig';

export const PRE_PRIMARY_CLASSES = ['Playgroup', 'Nursery', 'LKG', 'UKG'] as const;

export const K12_CLASSES = [
  'Class 1',
  'Class 2',
  'Class 3',
  'Class 4',
  'Class 5',
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
  'Class 11',
  'Class 12',
] as const;

export const STANDARD_BOARDS = [
  'CBSE',
  'ICSE',
  'ISC',
  'State Board',
  'IB',
  'Cambridge (IGCSE)',
  'NIOS',
] as const;

export const STANDARD_SUBJECTS = [
  'Science & Lab',
  'Mathematics',
  'English Communicative',
  'Social Science',
  'Physics',
  'Chemistry',
  'Biology',
  'Hindi',
  'Computer Applications',
  'Economics',
  'Accountancy',
  'Business Studies',
  'Geography',
  'History',
] as const;

export const CAMPUS_DEFAULT_CLASSES = [
  'Nursery-A',
  'Class 2-A',
  'Class 9-B',
  'Class 10-A',
];

export const CLASS_PICKER_OPTIONS = [
  'Playgroup-A',
  'Nursery-A',
  'Nursery-B',
  'LKG-A',
  'LKG-B',
  'UKG-A',
  'UKG-B',
  'Class 1-A',
  'Class 2-A',
  'Class 3-A',
  'Class 4-A',
  'Class 5-A',
  'Class 6-A',
  'Class 7-A',
  'Class 8-A',
  'Class 9-A',
  'Class 9-B',
  'Class 10-A',
  'Class 10-B',
  'Class 11-A',
  'Class 12-A',
];

/** Normalizes legacy underscored board codes like STATE_BOARD -> State Board. */
export function formatBoardLabel(board?: string | null): string {
  const clean = (board || '').trim();
  if (!clean) return 'CBSE';
  if (clean.toUpperCase() === 'STATE_BOARD') return 'State Board';
  return clean;
}

/** Returns true for Pre-Primary wings (Playgroup, Nursery, LKG, UKG) that use Fee & Notice mode only. */
export function isPrePrimaryClass(classGrade?: string | null): boolean {
  const clean = (classGrade || '').trim().toLowerCase();
  if (!clean) return false;
  return /^(playgroup|nursery|lkg|ukg|pre-nursery|pre\s*primary|kg\b)/.test(clean);
}

/** Merges built-in standard subjects with school-saved custom subjects from campusConfig. */
export function getCampusSubjects(campusConfig?: Pick<CampusConfig, 'customSubjects'> | null): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  const pushUnique = (val?: string | null) => {
    const clean = (val || '').trim();
    if (!clean) return;
    const key = clean.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    result.push(clean);
  };
  for (const s of STANDARD_SUBJECTS) pushUnique(s);
  if (campusConfig?.customSubjects) {
    for (const s of campusConfig.customSubjects) pushUnique(s);
  }
  return result;
}

function getGradeRank(className: string): number {
  const clean = (className || '').trim().toLowerCase();
  if (clean.startsWith('playgroup') || clean === 'pg') return -3;
  if (clean.startsWith('nursery') || clean.startsWith('pre-nursery') || clean.startsWith('nur')) return -2;
  if (clean.startsWith('lkg')) return -1;
  if (clean.startsWith('ukg') || clean === 'kg') return 0;
  const numMatch = clean.match(/(\d+)/);
  if (numMatch) {
    return parseInt(numMatch[1], 10);
  }
  return 999;
}

/** Extracts the base grade label (e.g. "Class 10-A" -> "Class 10", "Nursery-A" -> "Nursery"). */
export function extractBaseGrade(classGrade: string): string {
  const trimmed = (classGrade || '').trim();
  const lower = trimmed.toLowerCase();
  if (lower.startsWith('playgroup')) return 'Playgroup';
  if (lower.startsWith('nursery')) return 'Nursery';
  if (lower.startsWith('lkg')) return 'LKG';
  if (lower.startsWith('ukg')) return 'UKG';
  const match = trimmed.match(/Class\s*(\d+)/i);
  if (match) {
    return `Class ${parseInt(match[1], 10)}`;
  }
  return trimmed;
}

/** Progressive academic grade sort: Playgroup -> Nursery -> LKG -> UKG -> Class 1..12, then section A..Z. */
export function compareClassNames(a: string, b: string): number {
  const rankA = getGradeRank(a);
  const rankB = getGradeRank(b);
  if (rankA !== rankB) {
    return rankA - rankB;
  }
  return a.localeCompare(b, 'en-IN', { sensitivity: 'base' });
}

/** Builds a deduplicated, naturally sorted class list across students, staff, and custom classes. */
export function getDynamicCampusClasses(
  students: Array<{ classGrade: string }>,
  staffList: Array<{ assignedClass?: string | null }> = [],
  priorityClass?: string | null,
  customClasses: string[] = []
): string[] {
  const set = new Set<string>(
    students.length > 0 ? [] : CAMPUS_DEFAULT_CLASSES
  );
  for (const stu of students) {
    if (stu.classGrade?.trim()) {
      set.add(stu.classGrade.trim());
    }
  }
  for (const member of staffList) {
    if (member.assignedClass?.trim()) {
      set.add(member.assignedClass.trim());
    }
  }
  for (const cls of customClasses) {
    if (cls?.trim()) {
      set.add(cls.trim());
    }
  }
  if (priorityClass?.trim() && priorityClass.trim().toUpperCase() !== 'ALL') {
    set.add(priorityClass.trim());
  }
  if (set.size === 0) {
    for (const defCls of CAMPUS_DEFAULT_CLASSES) set.add(defCls);
  }
  return Array.from(set).sort(compareClassNames);
}

/** Sorts students alphabetically A -> Z within each class and re-sequences rollNo ("01", "02", ...). */
export function resequenceStudentsAlphabeticallyByClass<
  T extends { id: string; rollNo: string; name: string; classGrade: string }
>(students: T[]): { sortedStudents: T[]; rollUpdates: Array<{ id: string; rollNo: string }> } {
  const byClass = new Map<string, T[]>();
  for (const stu of students) {
    const group = byClass.get(stu.classGrade) || [];
    group.push(stu);
    byClass.set(stu.classGrade, group);
  }
  const orderedClasses = Array.from(byClass.keys()).sort(compareClassNames);
  const sortedStudents: T[] = [];
  const rollUpdates: Array<{ id: string; rollNo: string }> = [];

  for (const cls of orderedClasses) {
    const alphaSorted = [...(byClass.get(cls) || [])].sort((a, b) =>
      a.name.trim().localeCompare(b.name.trim(), 'en-IN', { sensitivity: 'base' })
    );
    alphaSorted.forEach((stu, idx) => {
      const nextRoll = String(idx + 1).padStart(2, '0');
      if (stu.rollNo !== nextRoll) {
        rollUpdates.push({ id: stu.id, rollNo: nextRoll });
      }
      sortedStudents.push(stu.rollNo === nextRoll ? stu : { ...stu, rollNo: nextRoll });
    });
  }

  return { sortedStudents, rollUpdates };
}

export interface DepartmentMeta {
  code: StaffDepartment;
  label: string;
  shortLabel: string;
  description: string;
  defaultDesignation: string;
  badgeClass: string;
}

export const STAFF_DEPARTMENT_META: Record<StaffDepartment, DepartmentMeta> = {
  ADM: {
    code: 'ADM',
    label: 'ERP Admin',
    shortLabel: 'Principal / Admin',
    description: 'Full campus authority, staff hierarchy & analytics',
    defaultDesignation: 'Vice Principal',
    badgeClass:
      'bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#6366F1] border border-[#C7D2FE] dark:border-[#3730A3]',
  },
  TCH: {
    code: 'TCH',
    label: 'Teacher',
    shortLabel: 'Class Teacher',
    description: 'Dedicated Class Admin, roster, marks & attendance',
    defaultDesignation: 'Class Teacher',
    badgeClass:
      'bg-[#ECFEFF] dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800',
  },
  ACT: {
    code: 'ACT',
    label: 'Accounts Dept',
    shortLabel: 'Accounts',
    description: 'Fee desk, receipts & Tally accounting exports',
    defaultDesignation: 'Accounts Executive',
    badgeClass:
      'bg-[#ECFDF5] dark:bg-[rgba(16,185,129,0.14)] text-[#059669] dark:text-[#34D399] border border-emerald-200 dark:border-emerald-800/50',
  },
};
