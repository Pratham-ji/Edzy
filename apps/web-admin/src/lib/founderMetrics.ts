export type SchoolPlanTier = 'CORE_ERP' | 'AI_SUITE';
export type SchoolBillingStatus = 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'SUSPENDED';
export type SchoolHealthStatus = 'Healthy' | 'Onboarding' | 'Needs Attention';

export interface EcosystemSchoolRecord {
  id: string;
  schoolSerial: number;
  schoolCode: string;
  name: string;
  board: string;
  academicSession: string;
  principalName: string;
  planTier: SchoolPlanTier;
  billingStatus: SchoolBillingStatus;
  city: string;
  contactPhone: string | null;
  createdAt?: string;
}

export interface AggregateStaffRow {
  id: string;
  schoolId: string;
  department: string;
  fullName: string;
  phone: string | null;
  isPasswordSet: boolean;
  status: string;
}

export interface AggregateFeeRow {
  schoolId: string;
  status: string;
  paymentMode: string;
  amount: number;
}

export interface SchoolTelemetrySummary {
  school: EcosystemSchoolRecord;
  principalEmployeeId: string;
  principalPhone: string | null;
  isPrincipalActivated: boolean;
  // SaaS Revenue Metrics
  planTier: SchoolPlanTier;
  planLabel: string;
  ratePerStudent: number;
  billingStatus: SchoolBillingStatus;
  billingLabel: string;
  monthlySaaSRevenue: number;
  annualRunRate: number;
  // Campus Fee Transaction Telemetry (Aggregate GMV Only — Zero Student PII)
  totalFeeVolumeProcessed: number;
  onlineUpiVolume: number;
  offlineDeskVolume: number;
  digitalUpiAdoptionPct: number;
  paidTransactionsCount: number;
  pendingDuesVolume: number;
  // Platform Adoption & Health Score
  studentCount: number;
  totalStaffCount: number;
  activatedStaffCount: number;
  pendingStaffCount: number;
  publishedChaptersCount: number;
  circularsSentCount: number;
  healthStatus: SchoolHealthStatus;
}

export interface EcosystemSummaryMetrics {
  totalSchools: number;
  activeSchoolsCount: number;
  trialSchoolsCount: number;
  attentionSchoolsCount: number;
  totalEcosystemMrr: number;
  totalEcosystemArr: number;
  totalFeeVolumeProcessed: number;
  totalOnlineUpiVolume: number;
  totalOfflineDeskVolume: number;
  totalPaidTransactionsCount: number;
  ecosystemUpiAdoptionPct: number;
  totalStudents: number;
  totalStaff: number;
  totalActivatedStaff: number;
  totalPublishedChapters: number;
}

const BILLING_OVERRIDES_STORAGE_KEY = 'edzy_hq_school_billing_meta_v1';

export interface SchoolBillingMetaOverride {
  planTier?: SchoolPlanTier;
  billingStatus?: SchoolBillingStatus;
  city?: string;
  contactPhone?: string | null;
}

export const PLAN_META: Record<
  SchoolPlanTier,
  { label: string; shortLabel: string; rate: number }
> = {
  CORE_ERP: {
    label: 'Core School ERP (₹49/stu/mo)',
    shortLabel: 'Core ERP ₹49',
    rate: 49,
  },
  AI_SUITE: {
    label: 'Full AI + 3D Suite (₹99/stu/mo)',
    shortLabel: 'AI Suite ₹99',
    rate: 99,
  },
};

export const BILLING_STATUS_META: Record<
  SchoolBillingStatus,
  { label: string; badgeClass: string }
> = {
  ACTIVE: {
    label: 'Active',
    badgeClass:
      'bg-[#ECFDF5] dark:bg-[rgba(16,185,129,0.14)] text-[#059669] dark:text-[#34D399] border-emerald-200 dark:border-emerald-800/60',
  },
  TRIAL: {
    label: '14-Day Pilot',
    badgeClass:
      'bg-[#EEF2FF] dark:bg-[#1B2440] text-[#4F46E5] dark:text-[#818CF8] border-[#C7D2FE] dark:border-[#3730A3]',
  },
  PAST_DUE: {
    label: 'Past Due',
    badgeClass:
      'bg-[#FFFBEB] dark:bg-[rgba(245,158,11,0.14)] text-[#D97706] dark:text-[#FBBF24] border-amber-200 dark:border-amber-500/30',
  },
  SUSPENDED: {
    label: 'Suspended',
    badgeClass:
      'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/60',
  },
};

export function normalizePlanTier(raw?: string | null): SchoolPlanTier {
  return raw === 'CORE_ERP' ? 'CORE_ERP' : 'AI_SUITE';
}

export function normalizeBillingStatus(
  raw?: string | null,
  schoolCode?: string
): SchoolBillingStatus {
  if (raw === 'TRIAL' || raw === 'ACTIVE' || raw === 'PAST_DUE' || raw === 'SUSPENDED') {
    return raw;
  }
  return schoolCode === 'SCH-01' ? 'ACTIVE' : 'TRIAL';
}

export function loadBillingMetaOverrides(): Record<string, SchoolBillingMetaOverride> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(BILLING_OVERRIDES_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, SchoolBillingMetaOverride>) : {};
  } catch {
    return {};
  }
}

export function saveBillingMetaOverride(
  schoolCode: string,
  patch: SchoolBillingMetaOverride
): void {
  if (typeof window === 'undefined') return;
  try {
    const current = loadBillingMetaOverrides();
    current[schoolCode] = { ...current[schoolCode], ...patch };
    window.localStorage.setItem(BILLING_OVERRIDES_STORAGE_KEY, JSON.stringify(current));
  } catch {
    // Ignore storage quota restrictions
  }
}

export function formatCompactInr(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

/** Computes Zero-PII per-school billing, GMV, and platform health from aggregate rows only. */
export function buildFounderEcosystemTelemetry(params: {
  schools: EcosystemSchoolRecord[];
  staffRows: AggregateStaffRow[];
  studentSchoolIds: string[];
  feeRows: AggregateFeeRow[];
  syllabusSchoolIds: string[];
  circularSchoolIds: string[];
}): {
  schoolSummaries: SchoolTelemetrySummary[];
  ecosystem: EcosystemSummaryMetrics;
} {
  const overrides = loadBillingMetaOverrides();

  const staffBySchool = new Map<string, AggregateStaffRow[]>();
  for (const st of params.staffRows) {
    if ((st.status || 'ACTIVE').toUpperCase() === 'INACTIVE') continue;
    const key = st.schoolId || 'SCH-01';
    const list = staffBySchool.get(key) || [];
    list.push(st);
    staffBySchool.set(key, list);
  }

  const studentCounts = new Map<string, number>();
  for (const sid of params.studentSchoolIds) {
    const key = sid || 'SCH-01';
    studentCounts.set(key, (studentCounts.get(key) || 0) + 1);
  }

  const chapterCounts = new Map<string, number>();
  for (const sid of params.syllabusSchoolIds) {
    const key = sid || 'SCH-01';
    chapterCounts.set(key, (chapterCounts.get(key) || 0) + 1);
  }

  const circularCounts = new Map<string, number>();
  for (const sid of params.circularSchoolIds) {
    const key = sid || 'SCH-01';
    circularCounts.set(key, (circularCounts.get(key) || 0) + 1);
  }

  const feeAgg = new Map<
    string,
    { paidVolume: number; upiVolume: number; deskVolume: number; paidCount: number; pendingVolume: number }
  >();
  for (const row of params.feeRows) {
    const key = row.schoolId || 'SCH-01';
    const bucket = feeAgg.get(key) || {
      paidVolume: 0,
      upiVolume: 0,
      deskVolume: 0,
      paidCount: 0,
      pendingVolume: 0,
    };
    const amt = Number(row.amount || 0);
    if ((row.status || '').toUpperCase() === 'PAID') {
      bucket.paidVolume += amt;
      bucket.paidCount += 1;
      if ((row.paymentMode || '').toUpperCase() === 'ONLINE_UPI') {
        bucket.upiVolume += amt;
      } else {
        bucket.deskVolume += amt;
      }
    } else {
      bucket.pendingVolume += amt;
    }
    feeAgg.set(key, bucket);
  }

  const schoolSummaries: SchoolTelemetrySummary[] = params.schools.map((rawSchool) => {
    const code = rawSchool.schoolCode || rawSchool.id;
    const override = overrides[code] || {};
    const planTier = normalizePlanTier(override.planTier ?? rawSchool.planTier);
    const billingStatus = normalizeBillingStatus(
      override.billingStatus ?? rawSchool.billingStatus,
      code
    );
    const city = (override.city ?? rawSchool.city ?? 'Dehradun').trim() || 'Dehradun';
    const contactPhone = override.contactPhone ?? rawSchool.contactPhone ?? null;

    const school: EcosystemSchoolRecord = {
      ...rawSchool,
      planTier,
      billingStatus,
      city,
      contactPhone,
    };

    const schoolStaff = staffBySchool.get(code) || staffBySchool.get(rawSchool.id) || [];
    const primaryAdmin = schoolStaff.find((s) => s.department === 'ADM');
    const principalEmployeeId = primaryAdmin?.id || `${code}-ADM-001`;
    const principalPhone = contactPhone || primaryAdmin?.phone || null;

    const totalStaffCount = schoolStaff.length;
    const activatedStaffCount = schoolStaff.filter((s) => s.isPasswordSet).length;
    const pendingStaffCount = Math.max(0, totalStaffCount - activatedStaffCount);

    const studentCount = studentCounts.get(code) ?? studentCounts.get(rawSchool.id) ?? 0;
    const publishedChaptersCount = chapterCounts.get(code) ?? chapterCounts.get(rawSchool.id) ?? 0;
    const circularsSentCount = circularCounts.get(code) ?? circularCounts.get(rawSchool.id) ?? 0;

    const feeBucket = feeAgg.get(code) ||
      feeAgg.get(rawSchool.id) || {
        paidVolume: 0,
        upiVolume: 0,
        deskVolume: 0,
        paidCount: 0,
        pendingVolume: 0,
      };

    const digitalUpiAdoptionPct =
      feeBucket.paidVolume > 0
        ? Math.round((feeBucket.upiVolume / feeBucket.paidVolume) * 100)
        : 0;

    const ratePerStudent = PLAN_META[planTier].rate;
    const monthlySaaSRevenue = studentCount * ratePerStudent;
    const annualRunRate = monthlySaaSRevenue * 12;

    let healthStatus: SchoolHealthStatus = 'Onboarding';
    if (billingStatus === 'PAST_DUE' || billingStatus === 'SUSPENDED') {
      healthStatus = 'Needs Attention';
    } else if (
      activatedStaffCount > 0 &&
      (feeBucket.paidCount > 0 || publishedChaptersCount > 0 || circularsSentCount > 0)
    ) {
      healthStatus = 'Healthy';
    } else if (totalStaffCount === 0 && studentCount === 0) {
      healthStatus = 'Needs Attention';
    }

    return {
      school,
      principalEmployeeId,
      principalPhone,
      isPrincipalActivated: Boolean(primaryAdmin?.isPasswordSet),
      planTier,
      planLabel: PLAN_META[planTier].shortLabel,
      ratePerStudent,
      billingStatus,
      billingLabel: BILLING_STATUS_META[billingStatus].label,
      monthlySaaSRevenue,
      annualRunRate,
      totalFeeVolumeProcessed: feeBucket.paidVolume,
      onlineUpiVolume: feeBucket.upiVolume,
      offlineDeskVolume: feeBucket.deskVolume,
      digitalUpiAdoptionPct,
      paidTransactionsCount: feeBucket.paidCount,
      pendingDuesVolume: feeBucket.pendingVolume,
      studentCount,
      totalStaffCount,
      activatedStaffCount,
      pendingStaffCount,
      publishedChaptersCount,
      circularsSentCount,
      healthStatus,
    };
  });

  const activeSchoolsCount = schoolSummaries.filter((s) => s.billingStatus === 'ACTIVE').length;
  const trialSchoolsCount = schoolSummaries.filter((s) => s.billingStatus === 'TRIAL').length;
  const attentionSchoolsCount = schoolSummaries.filter(
    (s) => s.healthStatus === 'Needs Attention'
  ).length;

  const totalEcosystemMrr = schoolSummaries.reduce((acc, s) => acc + s.monthlySaaSRevenue, 0);
  const totalFeeVolumeProcessed = schoolSummaries.reduce(
    (acc, s) => acc + s.totalFeeVolumeProcessed,
    0
  );
  const totalOnlineUpiVolume = schoolSummaries.reduce((acc, s) => acc + s.onlineUpiVolume, 0);
  const totalOfflineDeskVolume = schoolSummaries.reduce((acc, s) => acc + s.offlineDeskVolume, 0);
  const totalPaidTransactionsCount = schoolSummaries.reduce(
    (acc, s) => acc + s.paidTransactionsCount,
    0
  );

  return {
    schoolSummaries,
    ecosystem: {
      totalSchools: schoolSummaries.length,
      activeSchoolsCount,
      trialSchoolsCount,
      attentionSchoolsCount,
      totalEcosystemMrr,
      totalEcosystemArr: totalEcosystemMrr * 12,
      totalFeeVolumeProcessed,
      totalOnlineUpiVolume,
      totalOfflineDeskVolume,
      totalPaidTransactionsCount,
      ecosystemUpiAdoptionPct:
        totalFeeVolumeProcessed > 0
          ? Math.round((totalOnlineUpiVolume / totalFeeVolumeProcessed) * 100)
          : 0,
      totalStudents: schoolSummaries.reduce((acc, s) => acc + s.studentCount, 0),
      totalStaff: schoolSummaries.reduce((acc, s) => acc + s.totalStaffCount, 0),
      totalActivatedStaff: schoolSummaries.reduce((acc, s) => acc + s.activatedStaffCount, 0),
      totalPublishedChapters: schoolSummaries.reduce(
        (acc, s) => acc + s.publishedChaptersCount,
        0
      ),
    },
  };
}
