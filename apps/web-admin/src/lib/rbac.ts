import type { SchoolStaff, StaffDepartment } from '../store/useAdminStore';

export type NavTab =
  | 'dashboard'
  | 'staff'
  | 'fees'
  | 'accounts-export'
  | 'students'
  | 'circulars'
  | 'syllabus'
  | 'marks'
  | 'settings';

export interface RoleNavConfig {
  sectionLabel: string;
  defaultTab: NavTab;
  allowedTabs: NavTab[];
  items: Array<{
    id: NavTab;
    label: string;
    badgeType?: 'pending_fees' | 'class_tag';
  }>;
}

export function extractClassShortTag(assignedClass?: string | null): string | undefined {
  if (!assignedClass) return undefined;
  const trimmed = assignedClass.replace(/^class\s*/i, '').trim();
  return trimmed || undefined;
}

export function getStaffInitials(fullName?: string | null): string {
  if (!fullName) return 'ED';
  const cleaned = fullName
    .replace(/^(dr\.|mr\.|mrs\.|ms\.|fr\.|bro\.)\s+/i, '')
    .trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ''}${parts[parts.length - 1][0] || ''}`.toUpperCase();
}

export function formatStaffRoleLabel(staff: Pick<SchoolStaff, 'department' | 'designation' | 'assignedClass'>): string {
  if (staff.department === 'ADM') return staff.designation || 'Principal & ERP Admin';
  if (staff.department === 'TCH') {
    return staff.assignedClass ? `${staff.assignedClass} Teacher` : staff.designation || 'Class Teacher';
  }
  return staff.designation || 'Accounts Officer';
}

export function getRoleNavigation(department: StaffDepartment): RoleNavConfig {
  if (department === 'ADM') {
    const items: RoleNavConfig['items'] = [
      { id: 'dashboard', label: 'Principal Command' },
      { id: 'staff', label: 'Staff & Hierarchy' },
      { id: 'fees', label: 'Accounts Fee Counter', badgeType: 'pending_fees' },
      { id: 'students', label: 'Student Directory' },
      { id: 'circulars', label: 'Circulars & Attendance' },
      { id: 'syllabus', label: 'Curriculum & 3D Labs' },
      { id: 'marks', label: 'Marks & Gradebook' },
      { id: 'settings', label: 'School Settings' },
    ];
    return {
      sectionLabel: 'ADMINISTRATION',
      defaultTab: 'dashboard',
      allowedTabs: items.map((i) => i.id),
      items,
    };
  }

  if (department === 'TCH') {
    const items: RoleNavConfig['items'] = [
      { id: 'students', label: 'My Class Roster', badgeType: 'class_tag' },
      { id: 'circulars', label: 'Attendance & Notices' },
      { id: 'syllabus', label: 'Curriculum & Roadmaps' },
      { id: 'marks', label: 'Class Marks & Gradebook' },
    ];
    return {
      sectionLabel: 'CLASS WORKSPACE',
      defaultTab: 'students',
      allowedTabs: items.map((i) => i.id),
      items,
    };
  }

  const items: RoleNavConfig['items'] = [
    { id: 'fees', label: 'Accounts Fee Counter', badgeType: 'pending_fees' },
    { id: 'accounts-export', label: 'Tally & Fee Exports' },
  ];
  return {
    sectionLabel: 'ACCOUNTS DESK',
    defaultTab: 'fees',
    allowedTabs: items.map((i) => i.id),
    items,
  };
}
