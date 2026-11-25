import { BranchPriority, FlowchartSpineMilestone } from './roadmapModels';

export type NodeStudyStatus = 'not_started' | 'learning' | 'done';
export type PaceStatus = 'ON_TRACK' | 'AUTO_ADJUSTED' | 'HIGH_PACE' | 'COMPLETED';

export interface NodeProgressEntry {
  status: NodeStudyStatus;
  scheduledDate: string; // 'YYYY-MM-DD'
  completedAt?: string;
}

export interface StudentRoadmapProgress {
  id: string;
  schoolId: string;
  studentId: string;
  roadmapId: string;
  targetDeadline: string; // 'YYYY-MM-DD'
  totalDays: number;
  dailyPaceMinutes: 30 | 45 | 60;
  skippedDaysCount: number;
  paceStatus: PaceStatus;
  completionPct: number;
  lastMasteredTopicTitle?: string;
  completedTodayCount: number;
  nodeStates: Record<string, NodeProgressEntry>;
  updatedAt: string;
  // Derived UI metadata
  isOverloaded?: boolean;
  requiredDailyMinutes?: number;
  focusLimitMinutes?: number;
  recoveryBannerMessage?: string;
}

export interface TrackableNodeMeta {
  id: string;
  title: string;
  priority: BranchPriority;
  durationMinutes: number;
  milestoneId: string;
}

export function getLocalDateString(offsetDays = 0): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function diffDaysBetween(startDateStr: string, endDateStr: string): number {
  const start = new Date(`${startDateStr}T12:00:00`);
  const end = new Date(`${endDateStr}T12:00:00`);
  const diffMs = end.getTime() - start.getTime();
  return Math.round(diffMs / 86400000);
}

export function formatShortDisplayDate(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function extractTrackableNodes(milestones: FlowchartSpineMilestone[]): TrackableNodeMeta[] {
  const nodes: TrackableNodeMeta[] = [];
  for (const ms of milestones || []) {
    const mId = ms.nodeId || ms.id || 'ms';
    if (Array.isArray(ms.branches) && ms.branches.length > 0) {
      for (const br of ms.branches) {
        nodes.push({
          id: br.id,
          title: br.title,
          priority: br.priority || 'MUST_KNOW',
          durationMinutes: Number(br.durationMinutes || 15),
          milestoneId: mId,
        });
      }
    } else {
      nodes.push({
        id: mId,
        title: ms.title,
        priority: 'MUST_KNOW',
        durationMinutes: Number(ms.durationMinutes || 30),
        milestoneId: mId,
      });
    }
  }
  return nodes;
}

export function calculateCompletionStats(
  nodes: TrackableNodeMeta[],
  nodeStates: Record<string, NodeProgressEntry>
): { completedCount: number; totalCount: number; completionPct: number; completedTodayCount: number } {
  const totalCount = nodes.length || 1;
  const todayStr = getLocalDateString(0);
  let completedCount = 0;
  let completedTodayCount = 0;

  for (const n of nodes) {
    const entry = nodeStates[n.id];
    if (entry?.status === 'done') {
      completedCount++;
      if (entry.completedAt?.startsWith(todayStr) || entry.scheduledDate === todayStr) {
        completedTodayCount++;
      }
    }
  }

  return {
    completedCount,
    totalCount: nodes.length,
    completionPct: Math.round((completedCount / totalCount) * 100),
    completedTodayCount,
  };
}

export function buildSchedulePlan(params: {
  roadmapId: string;
  studentId: string;
  schoolId: string;
  milestones: FlowchartSpineMilestone[];
  targetDays: number;
  dailyPaceMinutes: 30 | 45 | 60;
  focusLimitMinutes: number;
  existingProgress?: StudentRoadmapProgress;
  focusMustKnowOnly?: boolean;
}): StudentRoadmapProgress {
  const {
    roadmapId,
    studentId,
    schoolId,
    milestones,
    targetDays,
    dailyPaceMinutes,
    focusLimitMinutes,
    existingProgress,
    focusMustKnowOnly = false,
  } = params;

  const nodes = extractTrackableNodes(milestones);
  const safeDays = Math.max(1, targetDays);
  const todayStr = getLocalDateString(0);
  const targetDeadline = getLocalDateString(safeDays - 1);

  const prevStates = existingProgress?.nodeStates || {};
  const nextStates: Record<string, NodeProgressEntry> = {};

  // Separate completed vs uncompleted in prerequisite order
  const uncompleted: TrackableNodeMeta[] = [];
  for (const n of nodes) {
    const prev = prevStates[n.id];
    if (prev?.status === 'done') {
      nextStates[n.id] = { ...prev };
    } else {
      uncompleted.push(n);
    }
  }

  // Filter priority if Focus Board Must-Knows guardrail is selected
  const prioritizedUncompleted = focusMustKnowOnly
    ? [
        ...uncompleted.filter((n) => n.priority === 'MUST_KNOW'),
        ...uncompleted.filter((n) => n.priority === 'PRACTICE'),
        ...uncompleted.filter((n) => n.priority === 'OPTIONAL'),
      ]
    : uncompleted;

  const totalRemainingMinutes = prioritizedUncompleted.reduce((sum, n) => {
    if (focusMustKnowOnly && n.priority === 'OPTIONAL') return sum;
    return sum + n.durationMinutes;
  }, 0);

  const requiredDailyMinutes = Math.ceil(totalRemainingMinutes / safeDays);
  const isOverloaded =
    prioritizedUncompleted.length > 0 && requiredDailyMinutes > focusLimitMinutes;

  // Distribute remaining uncompleted items cleanly across [0 ... safeDays - 1]
  prioritizedUncompleted.forEach((n, idx) => {
    const prev = prevStates[n.id];
    const isDeferredOptional = focusMustKnowOnly && n.priority === 'OPTIONAL';
    const dayOffset = isDeferredOptional
      ? safeDays
      : Math.min(safeDays - 1, Math.floor((idx * safeDays) / Math.max(1, prioritizedUncompleted.length)));

    nextStates[n.id] = {
      status: prev?.status === 'learning' ? 'learning' : 'not_started',
      scheduledDate: getLocalDateString(dayOffset),
    };
  });

  const stats = calculateCompletionStats(nodes, nextStates);
  let paceStatus: PaceStatus = 'ON_TRACK';
  if (stats.completionPct === 100) {
    paceStatus = 'COMPLETED';
  } else if (isOverloaded) {
    paceStatus = 'HIGH_PACE';
  }

  return {
    id: `${studentId}-${roadmapId}`,
    schoolId,
    studentId,
    roadmapId,
    targetDeadline,
    totalDays: safeDays,
    dailyPaceMinutes,
    skippedDaysCount: existingProgress?.skippedDaysCount || 0,
    paceStatus,
    completionPct: stats.completionPct,
    lastMasteredTopicTitle: existingProgress?.lastMasteredTopicTitle,
    completedTodayCount: stats.completedTodayCount,
    nodeStates: nextStates,
    updatedAt: new Date().toISOString(),
    isOverloaded,
    requiredDailyMinutes,
    focusLimitMinutes,
    recoveryBannerMessage: focusMustKnowOnly
      ? `Prioritized Board Must-Knows within your ${focusLimitMinutes}m focus limit`
      : undefined,
  };
}

export function reconcileAndRecoverProgress(params: {
  progress: StudentRoadmapProgress;
  milestones: FlowchartSpineMilestone[];
  focusLimitMinutes: number;
  simulateSkippedDay?: boolean;
}): { updated: StudentRoadmapProgress; didRecover: boolean } {
  const { progress, milestones, focusLimitMinutes, simulateSkippedDay = false } = params;
  const nodes = extractTrackableNodes(milestones);
  const todayStr = getLocalDateString(0);

  const clonedStates: Record<string, NodeProgressEntry> = {};
  for (const [k, v] of Object.entries(progress.nodeStates || {})) {
    clonedStates[k] = { ...v };
  }

  // Collect overdue uncompleted nodes
  const uncompleted = nodes.filter((n) => clonedStates[n.id]?.status !== 'done');
  let overdueNodes = uncompleted.filter((n) => {
    const sched = clonedStates[n.id]?.scheduledDate;
    return sched && sched < todayStr;
  });

  // For live principal pitch demo: simulate a skipped study day cleanly!
  if (simulateSkippedDay && uncompleted.length > 0 && overdueNodes.length === 0) {
    const yesterdayStr = getLocalDateString(-1);
    uncompleted.slice(0, Math.min(2, uncompleted.length)).forEach((n) => {
      clonedStates[n.id] = {
        status: clonedStates[n.id]?.status === 'learning' ? 'learning' : 'not_started',
        scheduledDate: yesterdayStr,
      };
    });
    overdueNodes = uncompleted.slice(0, Math.min(2, uncompleted.length));
  }

  const hasOverdue = overdueNodes.length > 0;
  if (!hasOverdue && !simulateSkippedDay) {
    const stats = calculateCompletionStats(nodes, clonedStates);
    const remainingDays = Math.max(1, diffDaysBetween(todayStr, progress.targetDeadline) + 1);
    const remainingMinutes = uncompleted.reduce((s, n) => s + n.durationMinutes, 0);
    const requiredDailyMinutes = Math.ceil(remainingMinutes / remainingDays);
    const isOverloaded = uncompleted.length > 0 && requiredDailyMinutes > focusLimitMinutes;
    return {
      didRecover: false,
      updated: {
        ...progress,
        completionPct: stats.completionPct,
        completedTodayCount: stats.completedTodayCount,
        requiredDailyMinutes,
        focusLimitMinutes,
        isOverloaded,
        paceStatus:
          stats.completionPct === 100
            ? 'COMPLETED'
            : isOverloaded
            ? 'HIGH_PACE'
            : progress.skippedDaysCount > 0
            ? 'AUTO_ADJUSTED'
            : 'ON_TRACK',
      },
    };
  }

  // Redistribute all uncompleted nodes across remaining days [todayStr ... targetDeadline]
  const rawRemainingDays = diffDaysBetween(todayStr, progress.targetDeadline) + 1;
  const remainingDays = Math.max(1, rawRemainingDays);
  const newSkippedCount = (progress.skippedDaysCount || 0) + 1;

  uncompleted.forEach((n, idx) => {
    const dayOffset = Math.min(
      remainingDays - 1,
      Math.floor((idx * remainingDays) / Math.max(1, uncompleted.length))
    );
    clonedStates[n.id] = {
      status: clonedStates[n.id]?.status === 'learning' ? 'learning' : 'not_started',
      scheduledDate: getLocalDateString(dayOffset),
    };
  });

  const stats = calculateCompletionStats(nodes, clonedStates);
  const totalRemainingMinutes = uncompleted.reduce((s, n) => s + n.durationMinutes, 0);
  const requiredDailyMinutes = Math.ceil(totalRemainingMinutes / remainingDays);
  const isOverloaded = uncompleted.length > 0 && requiredDailyMinutes > focusLimitMinutes;

  const recoveryMsg = `${newSkippedCount} day${newSkippedCount > 1 ? 's' : ''} missed — Auto-adjusted across ${remainingDays} remaining day${remainingDays > 1 ? 's' : ''}`;

  return {
    didRecover: true,
    updated: {
      ...progress,
      skippedDaysCount: newSkippedCount,
      paceStatus: stats.completionPct === 100 ? 'COMPLETED' : isOverloaded ? 'HIGH_PACE' : 'AUTO_ADJUSTED',
      completionPct: stats.completionPct,
      completedTodayCount: stats.completedTodayCount,
      nodeStates: clonedStates,
      requiredDailyMinutes,
      focusLimitMinutes,
      isOverloaded,
      recoveryBannerMessage: recoveryMsg,
      updatedAt: new Date().toISOString(),
    },
  };
}

export function computeSprintBannerSummary(
  progress: StudentRoadmapProgress | undefined,
  milestones: FlowchartSpineMilestone[]
): {
  bannerText: string;
  dueTodayCount: number;
  dueTodayNodeIds: Set<string>;
  currentDayNumber: number;
  totalDays: number;
} {
  const nodes = extractTrackableNodes(milestones);
  const todayStr = getLocalDateString(0);

  if (!progress) {
    const firstTwoIds = new Set(nodes.slice(0, 2).map((n) => n.id));
    return {
      bannerText: `7-Day Sprint • Day 2 of 7 • ${firstTwoIds.size} topics due today`,
      dueTodayCount: firstTwoIds.size,
      dueTodayNodeIds: firstTwoIds,
      currentDayNumber: 2,
      totalDays: 7,
    };
  }

  const totalDays = Math.max(1, progress.totalDays || 7);
  const daysRemaining = Math.max(0, diffDaysBetween(todayStr, progress.targetDeadline));
  const currentDayNumber = Math.min(totalDays, Math.max(1, totalDays - daysRemaining));

  const dueTodayIds = new Set<string>();
  for (const n of nodes) {
    const entry = progress.nodeStates?.[n.id];
    if (entry && entry.status !== 'done' && entry.scheduledDate <= todayStr) {
      dueTodayIds.add(n.id);
    }
  }

  if (progress.completionPct === 100) {
    return {
      bannerText: `Chapter Mastered • 100% Complete`,
      dueTodayCount: 0,
      dueTodayNodeIds: dueTodayIds,
      currentDayNumber,
      totalDays,
    };
  }

  if (progress.recoveryBannerMessage || progress.skippedDaysCount > 0) {
    const remDays = Math.max(1, daysRemaining + 1);
    const msg =
      progress.recoveryBannerMessage ||
      `${progress.skippedDaysCount} day${progress.skippedDaysCount > 1 ? 's' : ''} missed — Auto-adjusted across ${remDays} remaining day${remDays > 1 ? 's' : ''}`;
    return {
      bannerText: msg,
      dueTodayCount: dueTodayIds.size,
      dueTodayNodeIds: dueTodayIds,
      currentDayNumber,
      totalDays,
    };
  }

  return {
    bannerText: `${totalDays}-Day Sprint • Day ${currentDayNumber} of ${totalDays} • ${dueTodayIds.size} topic${dueTodayIds.size === 1 ? '' : 's'} due today`,
    dueTodayCount: dueTodayIds.size,
    dueTodayNodeIds: dueTodayIds,
    currentDayNumber,
    totalDays,
  };
}
