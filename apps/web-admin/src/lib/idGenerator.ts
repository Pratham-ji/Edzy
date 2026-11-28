export type StaffDepartment = 'ADM' | 'TCH' | 'ACT';

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function parseClassGradeParts(classGrade: string): {
  classNum: string;
  section: string;
} {
  const clean = (classGrade || 'Class 10-A').trim();
  const sectionMatch = clean.match(/[-\s]([A-Za-z])$/);
  const section = (sectionMatch?.[1] || 'A').toUpperCase();
  const lower = clean.toLowerCase();

  if (lower.startsWith('playgroup') || lower === 'pg') {
    return { classNum: 'PG', section };
  }
  if (lower.startsWith('nursery') || lower.startsWith('pre-nursery') || lower.startsWith('nur')) {
    return { classNum: 'NUR', section };
  }
  if (lower.startsWith('lkg')) {
    return { classNum: 'LKG', section };
  }
  if (lower.startsWith('ukg') || lower === 'kg') {
    return { classNum: 'UKG', section };
  }

  const numMatch = clean.match(/(\d+)\s*[-\s]*([A-Za-z])?/);
  if (numMatch?.[1]) {
    return {
      classNum: numMatch[1],
      section: (numMatch[2] || section || 'A').toUpperCase(),
    };
  }

  // Fallback for custom wing/class names (first 3 uppercase letters)
  const alphaCode = clean
    .replace(/[^A-Za-z]/g, '')
    .toUpperCase()
    .slice(0, 3) || 'CLS';
  return { classNum: alphaCode, section };
}

/**
 * Generates the next structured employee ID in the format:
 *   `${schoolCode}-${department}-${NNN}` (e.g. `SCH-01-ADM-001`, `SCH-01-TCH-004`).
 */
export function generateNextEmployeeId(
  schoolCode: string,
  department: StaffDepartment,
  existingStaffIds: string[]
): { id: string; serial: number } {
  const cleanSchool = (schoolCode || 'SCH-01').trim().toUpperCase();
  const dept = department.toUpperCase() as StaffDepartment;
  const prefix = `${cleanSchool}-${dept}-`;
  const existingSet = new Set(existingStaffIds.map((s) => s.trim().toUpperCase()));
  const pattern = new RegExp(`^${escapeRegex(prefix)}(\\d+)$`);

  let maxSerial = 0;
  for (const rawId of existingStaffIds) {
    const match = rawId.trim().toUpperCase().match(pattern);
    if (match?.[1]) {
      const n = parseInt(match[1], 10);
      if (!Number.isNaN(n) && n > maxSerial) {
        maxSerial = n;
      }
    }
  }

  let nextSerial = maxSerial + 1;
  let candidate = `${prefix}${String(nextSerial).padStart(3, '0')}`;
  while (existingSet.has(candidate)) {
    nextSerial += 1;
    candidate = `${prefix}${String(nextSerial).padStart(3, '0')}`;
  }

  return { id: candidate, serial: nextSerial };
}

/**
 * Generates the next structured student ID and 2-digit roll number.
 * Uses `${schoolCode}-${classNum}${roll2Digit}` (e.g. `SCH-01-206`, `SCH-01-1009`)
 * when there is no cross-section collision for that numeric grade, or
 * `${schoolCode}-${classNum}${section}${roll2Digit}` (e.g. `SCH-01-10B01`) if
 * another section in the same numeric grade would collide.
 */
export function generateNextStudentId(
  schoolCode: string,
  classGrade: string,
  existingStudentIds: string[],
  existingStudents?: Array<{ id: string; classGrade?: string; rollNo?: string }>
): { id: string; rollNumber: string } {
  const cleanSchool = (schoolCode || 'SCH-01').trim().toUpperCase();
  const { classNum, section } = parseClassGradeParts(classGrade);
  const normalizedTargetClass = classGrade.trim().toUpperCase();
  const existingSet = new Set(existingStudentIds.map((s) => s.trim().toUpperCase()));

  const plainPattern = new RegExp(`^${escapeRegex(cleanSchool)}-${escapeRegex(classNum)}(\\d{2})$`);
  const sectionPattern = new RegExp(
    `^${escapeRegex(cleanSchool)}-${escapeRegex(classNum)}${escapeRegex(section)}(\\d{2,})$`
  );

  // Detect whether another section of the same classNum already exists in existingStudents
  const hasOtherSection = Boolean(
    existingStudents?.some((st) => {
      if (!st.classGrade) return false;
      const parts = parseClassGradeParts(st.classGrade);
      return (
        parts.classNum === classNum &&
        parts.section !== section &&
        st.id.trim().toUpperCase().startsWith(`${cleanSchool}-`)
      );
    })
  );

  let maxSectionRoll = 0;
  let maxPlainRoll = 0;

  if (existingStudents && existingStudents.length > 0) {
    for (const st of existingStudents) {
      const idUpper = st.id.trim().toUpperCase();
      if (!idUpper.startsWith(`${cleanSchool}-`)) continue;

      const secMatch = idUpper.match(sectionPattern);
      if (secMatch?.[1]) {
        const n = parseInt(secMatch[1], 10);
        if (!Number.isNaN(n) && n > maxSectionRoll) maxSectionRoll = n;
      }

      if (st.classGrade && st.classGrade.trim().toUpperCase() === normalizedTargetClass) {
        const r = parseInt(String(st.rollNo || '0'), 10);
        if (!Number.isNaN(r) && r > maxSectionRoll) maxSectionRoll = r;
        const plainMatch = idUpper.match(plainPattern);
        if (plainMatch?.[1]) {
          const pn = parseInt(plainMatch[1], 10);
          if (!Number.isNaN(pn) && pn > maxPlainRoll) maxPlainRoll = pn;
        }
      }
    }
  } else {
    for (const rawId of existingStudentIds) {
      const idUpper = rawId.trim().toUpperCase();
      const secMatch = idUpper.match(sectionPattern);
      if (secMatch?.[1]) {
        const n = parseInt(secMatch[1], 10);
        if (!Number.isNaN(n) && n > maxSectionRoll) maxSectionRoll = n;
        continue;
      }
      const plainMatch = idUpper.match(plainPattern);
      if (plainMatch?.[1]) {
        const n = parseInt(plainMatch[1], 10);
        if (!Number.isNaN(n) && n > maxPlainRoll) maxPlainRoll = n;
      }
    }
  }

  // If section-explicit IDs already exist or another section conflicts, use section-tagged IDs
  if (hasOtherSection || maxSectionRoll > maxPlainRoll) {
    let nextRoll = Math.max(maxSectionRoll, 0) + 1;
    let rollStr = String(nextRoll).padStart(2, '0');
    let candidate = `${cleanSchool}-${classNum}${section}${rollStr}`;
    while (existingSet.has(candidate)) {
      nextRoll += 1;
      rollStr = String(nextRoll).padStart(2, '0');
      candidate = `${cleanSchool}-${classNum}${section}${rollStr}`;
    }
    return { id: candidate, rollNumber: rollStr };
  }

  let nextRoll = maxPlainRoll + 1;
  let rollStr = String(nextRoll).padStart(2, '0');
  let candidate = `${cleanSchool}-${classNum}${rollStr}`;

  if (existingSet.has(candidate)) {
    // Fallback cleanly to section-prefixed ID to guarantee global uniqueness
    let secRoll = maxSectionRoll + 1;
    rollStr = String(secRoll).padStart(2, '0');
    candidate = `${cleanSchool}-${classNum}${section}${rollStr}`;
    while (existingSet.has(candidate)) {
      secRoll += 1;
      rollStr = String(secRoll).padStart(2, '0');
      candidate = `${cleanSchool}-${classNum}${section}${rollStr}`;
    }
    return { id: candidate, rollNumber: rollStr };
  }

  return { id: candidate, rollNumber: rollStr };
}

/**
 * Returns a copy of the student array sorted strictly A -> Z by fullName (or name).
 */
export function sortStudentsAlphabetically<T extends { fullName?: string; name?: string }>(
  students: T[]
): T[] {
  return [...students].sort((a, b) => {
    const nameA = (a.fullName || a.name || '').trim();
    const nameB = (b.fullName || b.name || '').trim();
    return nameA.localeCompare(nameB, 'en', { sensitivity: 'base' });
  });
}
