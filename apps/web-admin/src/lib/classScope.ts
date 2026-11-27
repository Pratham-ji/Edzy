import { StaffDepartment } from './idGenerator';

export const CAMPUS_DEFAULT_CLASSES = [
  'Class 10-A',
  'Class 9-B',
  'Class 2-A',
];

export const CLASS_PICKER_OPTIONS = [
  'Class 12-A',
  'Class 11-A',
  'Class 10-A',
  'Class 10-B',
  'Class 9-A',
  'Class 9-B',
  'Class 8-A',
  'Class 7-A',
  'Class 6-A',
  'Class 5-A',
  'Class 4-A',
  'Class 3-A',
  'Class 2-A',
  'Class 1-A',
];

/** Extracts the base grade label (e.g. "Class 10-A" -> "Class 10", "Class 2-A" -> "Class 2"). */
export function extractBaseGrade(classGrade: string): string {
  const trimmed = (classGrade || '').trim();
  const match = trimmed.match(/Class\s*(\d+)/i);
  if (match) {
    return `Class ${parseInt(match[1], 10)}`;
  }
  return trimmed;
}

/** Numeric sort key placing higher grades first (Class 12..Class 1), then section A..Z. */
export function compareClassNames(a: string, b: string): number {
  const numA = parseInt((a.match(/\d+/) || ['0'])[0], 10);
  const numB = parseInt((b.match(/\d+/) || ['0'])[0], 10);
  if (numA !== numB) {
    return numB - numA;
  }
  return a.localeCompare(b);
}

/** Builds a deduplicated, naturally sorted class list across students and staff assignments. */
export function getDynamicCampusClasses(
  students: Array<{ classGrade: string }>,
  staffList: Array<{ assignedClass?: string | null }> = [],
  priorityClass?: string | null
): string[] {
  const set = new Set<string>(CAMPUS_DEFAULT_CLASSES);
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
  if (priorityClass?.trim()) {
    set.add(priorityClass.trim());
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
