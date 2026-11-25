import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  Platform,
  TextInput,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import {
  BookOpen,
  Check,
  CheckCircle2,
  Boxes,
  Sparkles,
  Calendar,
  SlidersHorizontal,
  Lightbulb,
  AlertTriangle,
  X,
  RefreshCw,
  FileText,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Layers,
  Circle,
} from 'lucide-react-native';
import {
  useEdzyStore,
  FlowchartBranchNode,
  RoadmapMilestone,
  NodeStudyStatus,
} from '@/store/useEdzyStore';
import { useAppTheme, getCardShadow } from '@/theme/colors';
import {
  computeSprintBannerSummary,
  formatShortDisplayDate,
} from '@/lib/adaptiveScheduler';

type ActiveViewTab = 'roadmap' | 'notes';

type SheetTarget =
  | {
      kind: 'branch';
      branch: FlowchartBranchNode;
      milestoneId: string;
      milestoneTitle: string;
      milestoneTip?: string;
    }
  | {
      kind: 'milestone';
      milestone: RoadmapMilestone;
    };

const CLEAN_TIP_OVERRIDES: Array<[string[], string]> = [
  [['nutrition', 'photosynth', 'stomat'], 'Write the balanced chlorophyll-sunlight equation and label guard cells cleanly.'],
  [['digest', 'enzyme', 'respir'], 'Contrast acidic gastric pH (Pepsin) with alkaline duodenal pH (Trypsin).'],
  [['heart', 'circulat', 'transport'], 'Left Ventricle has 3x thicker muscular walls; Pulmonary Vein carries oxygenated blood.'],
  [['excret', 'nephron', 'kidney'], 'Differentiate glomerular ultrafiltration from selective tubular reabsorption clearly.'],
  [['mirror', 'reflect'], 'Concave mirror focal length f is negative; sketch ray diagrams beyond C cleanly.'],
  [['refract', 'lens', 'snell'], 'Convert focal length f into metres before solving Lens Power P = 1/f(m).'],
  [['standard form', 'factor'], 'Always confirm a != 0 before factoring or classifying a quadratic equation.'],
  [['formula', 'discriminant'], 'For equal real roots with unknown k, immediately set D = b^2 - 4ac = 0.'],
  [['word problem', 'motion', 'speed'], 'Reject negative time or negative speed explicitly in your concluding line.'],
];

function sanitizeExamTip(rawTip: string | undefined, milestoneTitle: string, boardCode: string): string | undefined {
  if (!rawTip) return undefined;
  const lower = rawTip.toLowerCase();
  if (
    lower.includes('focus on core terminology') ||
    lower.includes('focus on structured explanations')
  ) {
    const titleLower = milestoneTitle.toLowerCase();
    for (const [keywords, tip] of CLEAN_TIP_OVERRIDES) {
      if (keywords.some((kw) => titleLower.includes(kw))) return tip;
    }
    return `Include labelled diagrams and key ${boardCode} definitions for high-weightage steps.`;
  }
  return rawTip;
}

function getBranchPairs(branches: FlowchartBranchNode[]): Array<[FlowchartBranchNode, FlowchartBranchNode | null]> {
  const lefts = branches.filter((b) => b.side === 'left');
  const rights = branches.filter((b) => b.side === 'right');

  if (lefts.length > 0 && rights.length > 0) {
    const count = Math.max(lefts.length, rights.length);
    const pairs: Array<[FlowchartBranchNode, FlowchartBranchNode | null]> = [];
    for (let i = 0; i < count; i++) {
      const l = lefts[i];
      const r = rights[i];
      if (l && r) {
        pairs.push([l, r]);
      } else if (l) {
        pairs.push([l, null]);
      } else if (r) {
        pairs.push([r, null]);
      }
    }
    return pairs;
  }

  const pairs: Array<[FlowchartBranchNode, FlowchartBranchNode | null]> = [];
  for (let i = 0; i < branches.length; i += 2) {
    pairs.push([branches[i], branches[i + 1] || null]);
  }
  return pairs;
}

export default function SyllabusRoadmapScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ roadmapId?: string }>();
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useAppTheme();
  const cardShadow = getCardShadow(isDark);

  const {
    roadmaps,
    studentProfile,
    studentRoadmapProgress,
    sessionTimeLimitMinutes,
    updateFlowchartNodeStatus,
    updateRoadmapGoalSchedule,
    reconcileRoadmapSchedule,
    applyRoadmapGuardrail,
    updateArDirective,
  } = useEdzyStore();

  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string>(
    params.roadmapId || roadmaps.find((r) => r.isCurrent)?.id || roadmaps[0]?.id || 'syl-01'
  );

  useEffect(() => {
    if (params.roadmapId && roadmaps.some((r) => r.id === params.roadmapId)) {
      setSelectedRoadmapId(params.roadmapId);
    }
  }, [params.roadmapId, roadmaps]);

  const activeRoadmap = useMemo(
    () => roadmaps.find((r) => r.id === selectedRoadmapId) || roadmaps[0],
    [roadmaps, selectedRoadmapId]
  );

  const activeProgress = studentRoadmapProgress[activeRoadmap?.id || ''];
  const schoolBoard = (activeRoadmap?.board || studentProfile.schoolBoard || 'CBSE')
    .split(' ')[0]
    .toUpperCase();

  const currentMasteryPct = activeProgress?.completionPct ?? activeRoadmap?.progressPercent ?? 0;

  // Auto-reconcile & skip recovery on open or chapter switch
  useEffect(() => {
    if (activeRoadmap?.id) {
      reconcileRoadmapSchedule(activeRoadmap.id, false);
    }
  }, [activeRoadmap?.id]);

  const [activeTab, setActiveTab] = useState<ActiveViewTab>('roadmap');
  const [sheetTarget, setSheetTarget] = useState<SheetTarget | null>(null);
  const [highlightedNoteMilestoneId, setHighlightedNoteMilestoneId] = useState<string | null>(null);

  // Personalize / Deadline Modal State
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalDays, setGoalDays] = useState<number>(activeProgress?.totalDays || 7);
  const [goalPace, setGoalPace] = useState<30 | 45 | 60>(activeProgress?.dailyPaceMinutes || 45);
  const [customDaysInput, setCustomDaysInput] = useState<string>(String(activeProgress?.totalDays || 7));

  // Interactive Practice Sheet State
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, number>>({});
  const [revealedSubjective, setRevealedSubjective] = useState<Record<string, boolean>>({});

  const mainScrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const notesAnchorY = useRef<number>(0);
  const noteCardYMap = useRef<Record<string, number>>({});

  const sprintSummary = useMemo(() => {
    if (!activeRoadmap) {
      return {
        bannerText: '7-Day Sprint • Day 1 of 7',
        dueTodayCount: 0,
        dueTodayNodeIds: new Set<string>(),
        currentDayNumber: 1,
        totalDays: 7,
      };
    }
    return computeSprintBannerSummary(
      activeProgress,
      activeRoadmap.milestones.map((m) => ({
        ...m,
        nodeId: m.nodeId || m.id,
        branches: m.branches || [],
      }))
    );
  }, [activeProgress, activeRoadmap]);

  const relatedList = useMemo(() => {
    if (activeRoadmap?.relatedChapters && activeRoadmap.relatedChapters.length > 0) {
      return activeRoadmap.relatedChapters;
    }
    return roadmaps
      .filter((r) => r.id !== activeRoadmap?.id)
      .slice(0, 2)
      .map((r) => ({
        id: r.id,
        chapterNumber: r.chapterNumber,
        title: r.title,
        subject: r.subject,
      }));
  }, [activeRoadmap, roadmaps]);

  const triggerStatusHaptic = (nextStatus: NodeStudyStatus) => {
    if (Platform.OS === 'web') return;
    if (nextStatus === 'done') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  };

  const handleSetSheetStatus = (nextStatus: NodeStudyStatus) => {
    if (!activeRoadmap || !sheetTarget) return;
    triggerStatusHaptic(nextStatus);

    if (sheetTarget.kind === 'branch') {
      updateFlowchartNodeStatus(
        activeRoadmap.id,
        sheetTarget.branch.id,
        nextStatus,
        sheetTarget.branch.title
      );
      return;
    }

    const msBranches = sheetTarget.milestone.branches || [];
    if (msBranches.length > 0) {
      for (const b of msBranches) {
        updateFlowchartNodeStatus(activeRoadmap.id, b.id, nextStatus, b.title);
      }
    } else {
      const mId = sheetTarget.milestone.nodeId || sheetTarget.milestone.id;
      updateFlowchartNodeStatus(activeRoadmap.id, mId, nextStatus, sheetTarget.milestone.title);
    }
  };

  const handleReadNotesForMilestone = (milestoneId: string) => {
    setSheetTarget(null);
    setHighlightedNoteMilestoneId(milestoneId);
    setActiveTab('notes');
    setTimeout(() => {
      const cardOffset = noteCardYMap.current[milestoneId];
      const y =
        cardOffset !== undefined
          ? Math.max(0, notesAnchorY.current + cardOffset - 12)
          : Math.max(0, notesAnchorY.current - 8);
      mainScrollRef.current?.scrollTo({ y, animated: true });
    }, 90);
  };

  const handleLaunchAR = (arModelId?: string, targetNode?: string) => {
    setSheetTarget(null);
    updateArDirective({
      targetNode: targetNode || 'Aorta',
      modelName:
        arModelId === 'optics-ray-bench-3d'
          ? 'Optics Ray Bench 3D'
          : arModelId === 'quadratic-graph-3d'
          ? 'Quadratic Graph 3D'
          : arModelId === 'plant-animal-cell-3d'
          ? 'Plant & Animal Cell 3D'
          : arModelId === 'electric-circuit-3d'
          ? 'Electric Circuit 3D'
          : 'Human Heart 3D',
      highlight: true,
      note: `Inspecting ${targetNode || 'structure'} from ${activeRoadmap?.title}`,
    });
    router.push('/study/ar-lab');
  };

  const handleSaveGoal = () => {
    if (!activeRoadmap) return;
    const parsedDays = Math.max(1, Math.min(45, parseInt(customDaysInput, 10) || goalDays));
    updateRoadmapGoalSchedule(activeRoadmap.id, parsedDays, goalPace);
    setShowGoalModal(false);
  };

  const openPersonalizeModal = () => {
    const days = activeProgress?.totalDays || 7;
    setGoalDays(days);
    setCustomDaysInput(String(days));
    setGoalPace(activeProgress?.dailyPaceMinutes || 45);
    setShowGoalModal(true);
  };

  const resolveSheetRevisionSummary = (target: SheetTarget): string => {
    if (target.kind === 'branch') {
      if (target.branch.summary && target.branch.summary.trim().length > 0) {
        return target.branch.summary.trim();
      }
      const matchedNote = activeRoadmap?.revisionNotes?.find(
        (n) => n.milestoneId === target.milestoneId
      );
      const firstDef = matchedNote?.keyDefinitions?.[0];
      const cleanTip = sanitizeExamTip(target.milestoneTip, target.milestoneTitle, schoolBoard);
      if (firstDef && cleanTip) {
        return `${firstDef}. ${cleanTip}`;
      }
      if (cleanTip) {
        return `Part of ${target.milestoneTitle} (${schoolBoard}). ${cleanTip}`;
      }
      return `Core topic inside ${target.milestoneTitle} for ${activeRoadmap?.title}. Tap below to review full notes or ask the AI Tutor.`;
    }

    const matchedNote = activeRoadmap?.revisionNotes?.find(
      (n) => n.milestoneId === (target.milestone.nodeId || target.milestone.id)
    );
    const point = matchedNote?.summaryPoints?.[0];
    const cleanTip = sanitizeExamTip(target.milestone.examTip, target.milestone.title, schoolBoard);
    if (point && cleanTip) return `${point} ${cleanTip}`;
    if (cleanTip) return cleanTip;
    return target.milestone.description || `Core ${schoolBoard} module in ${activeRoadmap?.title}.`;
  };

  const resolveSheetCurrentStatus = (target: SheetTarget): NodeStudyStatus => {
    if (target.kind === 'branch') {
      return activeProgress?.nodeStates?.[target.branch.id]?.status || 'not_started';
    }
    const msBranches = target.milestone.branches || [];
    if (msBranches.length === 0) {
      const mId = target.milestone.nodeId || target.milestone.id;
      return activeProgress?.nodeStates?.[mId]?.status || 'not_started';
    }
    const statuses = msBranches.map((b) => activeProgress?.nodeStates?.[b.id]?.status || 'not_started');
    if (statuses.every((s) => s === 'done')) return 'done';
    if (statuses.some((s) => s === 'done' || s === 'learning')) return 'learning';
    return 'not_started';
  };

  const renderSubTopicCard = (
    br: FlowchartBranchNode,
    milestone: RoadmapMilestone
  ) => {
    const milestoneId = milestone.nodeId || milestone.id;
    const status: NodeStudyStatus = activeProgress?.nodeStates?.[br.id]?.status || 'not_started';
    const isDone = status === 'done';
    const isLearning = status === 'learning';
    const isDueToday = sprintSummary.dueTodayNodeIds.has(br.id);

    const cardBg = isDone
      ? theme.successTint
      : isLearning
      ? theme.warningTint
      : theme.surface;

    const cardBorder = isDone
      ? theme.success
      : isLearning
      ? theme.warning
      : theme.border;

    const tagLabel = br.priority === 'MUST_KNOW' ? 'CORE' : 'APPLIED';
    const tagColor = isDone
      ? theme.success
      : isLearning
      ? theme.warning
      : theme.textMuted;

    return (
      <TouchableOpacity
        key={br.id}
        style={[
          styles.topicCard,
          !isDone && !isLearning ? cardShadow : null,
          {
            backgroundColor: cardBg,
            borderColor: cardBorder,
          },
        ]}
        onPress={() => {
          if (Platform.OS !== 'web') {
            Haptics.selectionAsync().catch(() => {});
          }
          setSheetTarget({
            kind: 'branch',
            branch: br,
            milestoneId,
            milestoneTitle: milestone.title,
            milestoneTip: milestone.examTip,
          });
        }}
        activeOpacity={0.84}
      >
        {/* Top Row: CORE / APPLIED tag + 20px status indicator */}
        <View style={styles.topicCardTopRow}>
          <Text style={[styles.topicTagText, { color: tagColor }]}>
            {tagLabel}
          </Text>

          {isDone ? (
            <View style={[styles.statusCheckBadge, { backgroundColor: theme.success }]}>
              <Check size={12} color="#FFFFFF" strokeWidth={3} />
            </View>
          ) : isLearning ? (
            <View style={[styles.statusLearningRing, { borderColor: theme.warning }]}>
              <View style={[styles.statusLearningInnerDot, { backgroundColor: theme.warning }]} />
            </View>
          ) : (
            <View style={[styles.statusEmptyCircle, { borderColor: theme.border }]} />
          )}
        </View>

        {/* Middle: Crisp Readable Title */}
        <Text
          style={[
            styles.topicCardTitle,
            { color: theme.textPrimary },
          ]}
          numberOfLines={3}
        >
          {br.title}
        </Text>

        {/* Bottom Row: Duration + optional Today / 3D pill */}
        <View style={styles.topicCardBottomRow}>
          <Text style={[styles.topicDurationText, { color: theme.textMuted }]}>
            {br.durationMinutes}m
          </Text>

          <View style={styles.topicMiniPills}>
            {isDueToday && !isDone && (
              <View style={[styles.todayPill, { backgroundColor: theme.warningTint }]}>
                <Text style={[styles.todayPillText, { color: theme.warning }]}>Today</Text>
              </View>
            )}
            {br.arModelId && (
              <View
                style={[
                  styles.arMiniBadge,
                  { backgroundColor: theme.brandTint, borderColor: theme.brandBorder },
                ]}
              >
                <Boxes size={10} color={theme.brandPrimary} />
                <Text style={[styles.arMiniBadgeText, { color: theme.brandPrimary }]}>3D</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (!activeRoadmap) {
    return (
      <SafeAreaView style={[styles.safeContainer, { backgroundColor: theme.canvas }]}>
        <View style={{ padding: 24, alignItems: 'center' }}>
          <Text style={{ color: theme.textSecondary }}>Loading chapter roadmap...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeContainer, { backgroundColor: theme.canvas }]}
      edges={['left', 'right']}
    >
      {/* MAIN SCROLLABLE VIEWPORT: Hero Header + Flowchart / Notes inside one clean scroll */}
      <ScrollView
        ref={mainScrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.mainScrollContent,
          { paddingBottom: 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* SLIM AIRY HERO SECTION (Scrolls naturally out of the way) */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: theme.surface,
              borderBottomColor: theme.border,
            },
          ]}
        >
          {/* Compact Horizontal Chapter Switcher Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chapterPillsRow}
          >
            {roadmaps.map((item) => {
              const selected = item.id === activeRoadmap.id;
              const progPct = studentRoadmapProgress[item.id]?.completionPct ?? item.progressPercent;
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => {
                    setSheetTarget(null);
                    setSelectedRoadmapId(item.id);
                  }}
                  style={[
                    styles.chapterPill,
                    {
                      backgroundColor: selected ? theme.brandPrimary : theme.surfaceSubtle,
                      borderColor: selected ? theme.brandPrimary : theme.border,
                    },
                  ]}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.chapterPillText,
                      { color: selected ? '#FFFFFF' : theme.textSecondary },
                    ]}
                  >
                    Ch {item.chapterNumber}
                  </Text>
                  <Text
                    style={[
                      styles.chapterPillPct,
                      {
                        color: selected
                          ? 'rgba(255,255,255,0.85)'
                          : theme.textMuted,
                      },
                    ]}
                  >
                    {progPct}%
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Crisp Title + 1-Line Subtitle + Thin 4px Progress Track */}
          <View style={styles.heroTitleBlock}>
            <Text style={[styles.heroChapterTitle, { color: theme.textPrimary }]}>
              {activeRoadmap.title}
            </Text>
            <Text style={[styles.heroChapterSub, { color: theme.textSecondary }]} numberOfLines={1}>
              {studentProfile.classGrade} • {schoolBoard} • {currentMasteryPct}% Mastered
            </Text>
            <View style={[styles.progressTrack, { backgroundColor: theme.surfaceSubtle }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(100, Math.max(0, currentMasteryPct))}%`,
                    backgroundColor: currentMasteryPct === 100 ? theme.success : theme.brandPrimary,
                  },
                ]}
              />
            </View>
          </View>

          {/* Clean 3-Tab Strip: Roadmap | Notes & Practice | AI Tutor */}
          <View style={[styles.segmentedTabs, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
            <TouchableOpacity
              style={[
                styles.segmentBtn,
                { flex: 0.9 },
                activeTab === 'roadmap' && [
                  styles.segmentBtnActive,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ],
              ]}
              onPress={() => setActiveTab('roadmap')}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.segmentBtnText,
                  { color: activeTab === 'roadmap' ? theme.brandPrimary : theme.textSecondary },
                ]}
                numberOfLines={1}
              >
                Roadmap
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.segmentBtn,
                { flex: 1.35 },
                activeTab === 'notes' && [
                  styles.segmentBtnActive,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ],
              ]}
              onPress={() => setActiveTab('notes')}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.segmentBtnText,
                  { color: activeTab === 'notes' ? theme.brandPrimary : theme.textSecondary },
                ]}
                numberOfLines={1}
              >
                Notes & Practice
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.segmentBtn, { flex: 0.85 }]}
              onPress={() =>
                router.push({ pathname: '/study/tutor', params: { roadmapId: activeRoadmap.id } })
              }
              activeOpacity={0.85}
            >
              <Text
                style={[styles.segmentBtnText, { color: theme.textSecondary }]}
                numberOfLines={1}
              >
                AI Tutor
              </Text>
            </TouchableOpacity>
          </View>

          {/* Compact Adaptive Goal Strip with Adjust Pill */}
          <View
            style={[
              styles.adaptiveStrip,
              {
                backgroundColor:
                  activeProgress?.paceStatus === 'AUTO_ADJUSTED' || activeProgress?.paceStatus === 'HIGH_PACE'
                    ? theme.warningTint
                    : theme.surfaceSubtle,
                borderColor:
                  activeProgress?.paceStatus === 'AUTO_ADJUSTED' || activeProgress?.paceStatus === 'HIGH_PACE'
                    ? theme.warning
                    : theme.border,
              },
            ]}
          >
            <View style={styles.adaptiveStripLeft}>
              <Calendar
                size={14}
                color={
                  activeProgress?.paceStatus === 'AUTO_ADJUSTED' || activeProgress?.paceStatus === 'HIGH_PACE'
                    ? theme.warning
                    : theme.brandPrimary
                }
              />
              <Text style={[styles.adaptiveStripText, { color: theme.textPrimary }]} numberOfLines={2}>
                {sprintSummary.bannerText}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.adjustGoalPill, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={openPersonalizeModal}
              activeOpacity={0.8}
            >
              <SlidersHorizontal size={11} color={theme.brandPrimary} />
              <Text style={[styles.adjustGoalPillText, { color: theme.brandPrimary }]}>
                {activeProgress ? 'Adjust' : 'Personalize'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Overload Guardrail Banner when Daily Minutes > Parental Focus Limit */}
          {activeProgress?.isOverloaded && (
            <View style={[styles.guardrailBox, { backgroundColor: theme.dangerTint, borderColor: theme.danger }]}>
              <View style={styles.guardrailHeaderRow}>
                <AlertTriangle size={14} color={theme.danger} />
                <Text style={[styles.guardrailTitle, { color: theme.danger }]}>
                  {activeProgress.requiredDailyMinutes}m/day exceeds {sessionTimeLimitMinutes}m Focus Limit
                </Text>
              </View>
              <View style={styles.guardrailActionsRow}>
                <TouchableOpacity
                  style={[styles.guardrailActionBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
                  onPress={() => applyRoadmapGuardrail(activeRoadmap.id, 'FOCUS_MUST_KNOW')}
                >
                  <Text style={[styles.guardrailActionText, { color: theme.brandPrimary }]}>
                    Focus Board Must-Knows
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.guardrailActionBtn, { backgroundColor: theme.brandPrimary, borderColor: theme.brandPrimary }]}
                  onPress={() => applyRoadmapGuardrail(activeRoadmap.id, 'EXTEND_2_DAYS')}
                >
                  <Text style={[styles.guardrailActionText, { color: '#FFFFFF' }]}>
                    Extend +2 Days
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* BODY VIEW 1: CLEAN SINGLE-LAYER FLOWCHART */}
        {activeTab === 'roadmap' ? (
          <View style={styles.flowchartSection}>
            {activeRoadmap.milestones.map((ms, idx) => {
              const milestoneId = ms.nodeId || ms.id;
              const branches = ms.branches || [];
              const pairs = getBranchPairs(branches);
              const doneInMs = branches.filter(
                (b) => activeProgress?.nodeStates?.[b.id]?.status === 'done'
              ).length;
              const msAllDone = branches.length > 0 && doneInMs === branches.length;
              const cleanTip = sanitizeExamTip(ms.examTip, ms.title, schoolBoard);

              return (
                <View key={milestoneId} style={styles.milestoneBlock}>
                  {/* Clean vertical spine segment strictly BETWEEN sections (never behind boxes!) */}
                  {idx > 0 && (
                    <View style={styles.interSectionSpineWrap}>
                      <View
                        style={[
                          styles.interSectionSpineLine,
                          { backgroundColor: theme.brandPrimary, opacity: 0.35 },
                        ]}
                      />
                    </View>
                  )}

                  {/* Centered Core Spine Milestone Node */}
                  <TouchableOpacity
                    style={[
                      styles.spineMilestoneCard,
                      cardShadow,
                      {
                        backgroundColor: msAllDone ? theme.success : theme.brandPrimary,
                      },
                    ]}
                    onPress={() => {
                      if (Platform.OS !== 'web') {
                        Haptics.selectionAsync().catch(() => {});
                      }
                      setSheetTarget({ kind: 'milestone', milestone: ms });
                    }}
                    activeOpacity={0.88}
                  >
                    <View style={styles.spineNumberBadge}>
                      <Text style={styles.spineNumberText}>
                        {String(idx + 1).padStart(2, '0')}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.spineTitleText} numberOfLines={2}>
                        {ms.title}
                      </Text>
                      <Text style={styles.spineSubText}>
                        {doneInMs} of {branches.length || 1} mastered
                      </Text>
                    </View>
                    {msAllDone ? (
                      <CheckCircle2 size={20} color="#FFFFFF" />
                    ) : (
                      <ChevronRight size={18} color="rgba(255,255,255,0.85)" />
                    )}
                  </TouchableOpacity>

                  {/* Dedicated 32px SVG Curved Dotted Branch Connector Band */}
                  {pairs.length > 0 && (
                    <View style={styles.svgConnectorBand}>
                      <Svg width="100%" height={32} viewBox="0 0 320 32" preserveAspectRatio="none">
                        {pairs[0][1] ? (
                          <>
                            <Path
                              d="M 160 0 C 160 16, 76 12, 76 32"
                              fill="none"
                              stroke={theme.brandPrimary}
                              strokeOpacity={0.45}
                              strokeWidth={2}
                              strokeDasharray="4 4"
                            />
                            <Path
                              d="M 160 0 C 160 16, 244 12, 244 32"
                              fill="none"
                              stroke={theme.brandPrimary}
                              strokeOpacity={0.45}
                              strokeWidth={2}
                              strokeDasharray="4 4"
                            />
                          </>
                        ) : (
                          <Path
                            d="M 160 0 L 160 32"
                            fill="none"
                            stroke={theme.brandPrimary}
                            strokeOpacity={0.45}
                            strokeWidth={2}
                            strokeDasharray="4 4"
                          />
                        )}
                      </Svg>
                    </View>
                  )}

                  {/* Equal-Height 2-Column Single-Layer Sub-Topic Cards */}
                  <View style={styles.pairsStack}>
                    {pairs.map(([leftItem, rightItem], pIdx) => (
                      <View key={`${milestoneId}-row-${pIdx}`} style={styles.twoColRow}>
                        {renderSubTopicCard(leftItem, ms)}
                        {rightItem ? (
                          renderSubTopicCard(rightItem, ms)
                        ) : (
                          <View style={{ flex: 1 }} />
                        )}
                      </View>
                    ))}
                  </View>

                  {/* Concise Subtle Exam Tip Strip */}
                  {cleanTip && (
                    <View style={[styles.examTipStrip, { backgroundColor: theme.surfaceSubtle }]}>
                      <View style={[styles.examTipAccentBar, { backgroundColor: theme.warning }]} />
                      <Lightbulb size={14} color={theme.warning} style={{ marginTop: 1 }} />
                      <Text style={[styles.examTipText, { color: theme.textSecondary }]}>
                        {cleanTip}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}

            {/* Related Chapters & Legend Footer Card (Bottom of Flowchart) */}
            {relatedList.length > 0 && (
              <View
                style={[
                  styles.relatedFooterCard,
                  cardShadow,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
              >
                <View style={styles.relatedFooterHeader}>
                  <Text style={[styles.relatedFooterTitle, { color: theme.textPrimary }]}>
                    Related Chapters
                  </Text>
                  <View style={styles.footerLegendRow}>
                    <View style={styles.legendChip}>
                      <View style={[styles.legendDot, { backgroundColor: theme.success }]} />
                      <Text style={[styles.legendChipText, { color: theme.textMuted }]}>Mastered</Text>
                    </View>
                    <View style={styles.legendChip}>
                      <View style={[styles.legendDot, { backgroundColor: theme.warning }]} />
                      <Text style={[styles.legendChipText, { color: theme.textMuted }]}>Learning</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.relatedFooterList}>
                  {relatedList.map((rel, idx) => (
                    <TouchableOpacity
                      key={`${rel.id || rel.title}-${idx}`}
                      onPress={() => {
                        if (rel.id && roadmaps.some((r) => r.id === rel.id)) {
                          setSelectedRoadmapId(rel.id);
                          mainScrollRef.current?.scrollTo({ y: 0, animated: true });
                        }
                      }}
                      style={[styles.relatedRowBtn, { backgroundColor: theme.surfaceSubtle }]}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.relatedChBadge, { backgroundColor: theme.brandTint }]}>
                        <Text style={[styles.relatedChBadgeText, { color: theme.brandPrimary }]}>
                          Ch {rel.chapterNumber}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.relatedRowTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                          {rel.title}
                        </Text>
                        <Text style={[styles.relatedRowSub, { color: theme.textMuted }]} numberOfLines={1}>
                          {rel.subject}
                        </Text>
                      </View>
                      <ChevronRight size={15} color={theme.textMuted} />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        ) : (
          /* =========================================================
             BODY VIEW 2: NOTES & PRACTICE TAB
             ========================================================= */
          <View
            style={styles.notesSectionContainer}
            onLayout={(e) => {
              notesAnchorY.current = e.nativeEvent.layout.y;
            }}
          >
            {/* Section 1: AI Revision Notes */}
            <View style={styles.sectionHeaderRow}>
              <BookOpen size={17} color={theme.brandPrimary} />
              <Text style={[styles.sectionHeaderTitle, { color: theme.textPrimary }]}>
                School Revision Notes ({schoolBoard})
              </Text>
            </View>

            <View style={styles.notesList}>
              {(activeRoadmap.revisionNotes || []).map((note) => {
                const isHighlighted = highlightedNoteMilestoneId === note.milestoneId;
                const cleanNoteTip = sanitizeExamTip(
                  note.examFormulaOrTip,
                  note.topicTitle,
                  schoolBoard
                );
                return (
                  <View
                    key={note.id}
                    onLayout={(e) => {
                      if (note.milestoneId) {
                        noteCardYMap.current[note.milestoneId] = e.nativeEvent.layout.y;
                      }
                    }}
                    style={[
                      styles.noteCard,
                      cardShadow,
                      {
                        backgroundColor: theme.surface,
                        borderColor: isHighlighted ? theme.brandPrimary : theme.border,
                        borderWidth: isHighlighted ? 1.5 : 1,
                      },
                    ]}
                  >
                    <Text style={[styles.noteTopicTitle, { color: theme.textPrimary }]}>
                      {note.topicTitle}
                    </Text>

                    {note.keyDefinitions.length > 0 && (
                      <View style={[styles.definitionsBox, { backgroundColor: theme.brandTint }]}>
                        <Text style={[styles.definitionsLabel, { color: theme.brandPrimary }]}>
                          KEY DEFINITIONS
                        </Text>
                        {note.keyDefinitions.map((def, i) => (
                          <Text key={i} style={[styles.definitionItem, { color: theme.textPrimary }]}>
                            • {def}
                          </Text>
                        ))}
                      </View>
                    )}

                    <View style={styles.bulletsList}>
                      {note.summaryPoints.map((pt, i) => (
                        <Text key={i} style={[styles.bulletText, { color: theme.textSecondary }]}>
                          ◦ {pt}
                        </Text>
                      ))}
                    </View>

                    {cleanNoteTip && (
                      <View style={[styles.noteTipBox, { backgroundColor: theme.surfaceSubtle }]}>
                        <View style={[styles.examTipAccentBar, { backgroundColor: theme.warning }]} />
                        <Lightbulb size={13} color={theme.warning} style={{ marginTop: 1 }} />
                        <Text style={[styles.noteTipText, { color: theme.textPrimary }]}>
                          {cleanNoteTip}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>

            {/* Section 2: Interactive Board-Pattern Practice Sheet */}
            <View style={[styles.sectionHeaderRow, { marginTop: 22 }]}>
              <Layers size={17} color={theme.success} />
              <Text style={[styles.sectionHeaderTitle, { color: theme.textPrimary }]}>
                {activeRoadmap.practiceSheet?.boardStyle || schoolBoard}-Pattern Practice Sheet
              </Text>
            </View>

            {/* Part A: Interactive MCQs */}
            <Text style={[styles.practiceSubHeading, { color: theme.textSecondary }]}>
              Section A: Objective MCQs (Tap option for instant feedback)
            </Text>
            <View style={styles.practiceList}>
              {(activeRoadmap.practiceSheet?.mcqs || []).map((q, qIdx) => {
                const selectedIdx = mcqAnswers[q.id];
                const hasAnswered = selectedIdx !== undefined;
                const isRight = selectedIdx === q.correctIndex;

                return (
                  <View
                    key={q.id}
                    style={[
                      styles.questionCard,
                      cardShadow,
                      { backgroundColor: theme.surface, borderColor: theme.border },
                    ]}
                  >
                    <View style={styles.questionTopMeta}>
                      <Text style={[styles.questionNumBadge, { color: theme.brandPrimary }]}>
                        Q{qIdx + 1} • {q.difficulty || 'Board'}
                      </Text>
                      {hasAnswered && (
                        <Text style={[styles.feedbackTag, { color: isRight ? theme.success : theme.danger }]}>
                          {isRight ? 'Correct ✓' : 'Review Explanation'}
                        </Text>
                      )}
                    </View>
                    <Text style={[styles.questionText, { color: theme.textPrimary }]}>
                      {q.question}
                    </Text>

                    <View style={styles.optionsList}>
                      {q.options.map((opt, oIdx) => {
                        const chosen = selectedIdx === oIdx;
                        const isCorrectOption = oIdx === q.correctIndex;
                        let bgColor = theme.surfaceSubtle;
                        let borderCol = theme.border;
                        let textCol = theme.textPrimary;

                        if (hasAnswered) {
                          if (isCorrectOption) {
                            bgColor = theme.successTint;
                            borderCol = theme.success;
                            textCol = theme.success;
                          } else if (chosen) {
                            bgColor = theme.dangerTint;
                            borderCol = theme.danger;
                            textCol = theme.danger;
                          }
                        }

                        return (
                          <TouchableOpacity
                            key={oIdx}
                            style={[styles.optionBtn, { backgroundColor: bgColor, borderColor: borderCol }]}
                            onPress={() => setMcqAnswers((prev) => ({ ...prev, [q.id]: oIdx }))}
                            activeOpacity={0.8}
                          >
                            <Text style={[styles.optionBtnText, { color: textCol }]}>
                              {String.fromCharCode(65 + oIdx)}. {opt}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {hasAnswered && (
                      <View style={[styles.explanationBox, { backgroundColor: theme.surfaceSubtle }]}>
                        <Text style={[styles.explanationText, { color: theme.textSecondary }]}>
                          {q.explanation}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>

            {/* Part B & C: Short & Long Questions with Reveal Model Answer */}
            <Text style={[styles.practiceSubHeading, { color: theme.textSecondary, marginTop: 18 }]}>
              Section B & C: Structured Short & Long Questions
            </Text>
            <View style={styles.practiceList}>
              {[
                ...(activeRoadmap.practiceSheet?.shortQuestions || []),
                ...(activeRoadmap.practiceSheet?.longQuestions || []),
              ].map((sq, sIdx) => {
                const revealed = Boolean(revealedSubjective[sq.id]);
                return (
                  <View
                    key={sq.id}
                    style={[
                      styles.questionCard,
                      cardShadow,
                      { backgroundColor: theme.surface, borderColor: theme.border },
                    ]}
                  >
                    <View style={styles.questionTopMeta}>
                      <Text style={[styles.questionNumBadge, { color: theme.brandPrimary }]}>
                        {sq.type} ANSWER #{sIdx + 1}
                      </Text>
                      <View style={[styles.marksBadge, { backgroundColor: theme.brandTint }]}>
                        <Text style={[styles.marksBadgeText, { color: theme.brandPrimary }]}>
                          {sq.marks} Marks
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.questionText, { color: theme.textPrimary }]}>
                      {sq.question}
                    </Text>

                    <TouchableOpacity
                      style={[styles.revealBtn, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}
                      onPress={() =>
                        setRevealedSubjective((prev) => ({ ...prev, [sq.id]: !revealed }))
                      }
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.revealBtnText, { color: theme.brandPrimary }]}>
                        {revealed ? 'Hide Model Answer' : 'Reveal Model Answer'}
                      </Text>
                      {revealed ? (
                        <ChevronUp size={14} color={theme.brandPrimary} />
                      ) : (
                        <ChevronDown size={14} color={theme.brandPrimary} />
                      )}
                    </TouchableOpacity>

                    {revealed && (
                      <View style={[styles.modelAnswerBox, { backgroundColor: theme.successTint, borderColor: theme.success }]}>
                        <Text style={[styles.modelAnswerText, { color: theme.textPrimary }]}>
                          {sq.modelAnswer}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* SOLID DOCKED BOTTOM AI TUTOR FOOTER (ZERO CONTENT OVERLAP) */}
      <View
        style={[
          styles.dockedFooter,
          {
            backgroundColor: theme.surface,
            borderTopColor: theme.border,
            paddingBottom: Math.max(insets.bottom, 12),
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.dockedTutorBtn,
            {
              backgroundColor: theme.brandTint,
              borderColor: theme.brandBorder,
            },
          ]}
          onPress={() =>
            router.push({ pathname: '/study/tutor', params: { roadmapId: activeRoadmap.id } })
          }
          activeOpacity={0.85}
        >
          <Sparkles size={16} color={theme.brandPrimary} />
          <Text style={[styles.dockedTutorText, { color: theme.brandPrimary }]} numberOfLines={1}>
            Ask AI Tutor about Chapter {activeRoadmap.chapterNumber}
          </Text>
          <ChevronRight size={15} color={theme.brandPrimary} />
        </TouchableOpacity>
      </View>

      {/* TACTILE BOTTOM TOPIC ACTION SHEET */}
      <Modal
        visible={sheetTarget !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSheetTarget(null)}
      >
        <View style={styles.sheetOverlay}>
          <Pressable
            style={styles.sheetBackdropDismiss}
            onPress={() => setSheetTarget(null)}
          />
          {sheetTarget && (() => {
            const currentStatus = resolveSheetCurrentStatus(sheetTarget);
            const isBranch = sheetTarget.kind === 'branch';
            const branchDueToday =
              isBranch && sprintSummary.dueTodayNodeIds.has(sheetTarget.branch.id);

            const categoryMeta = isBranch
              ? `${sheetTarget.branch.priority === 'MUST_KNOW' ? 'Core Concept' : 'Applied Topic'} • ${
                  sheetTarget.branch.durationMinutes
                } mins${branchDueToday ? ' • Due Today' : ''}`
              : `Module • ${(sheetTarget.milestone.branches || []).length || 1} topics • ${
                  sheetTarget.milestone.durationMinutes
                } mins`;

            const sheetTitle = isBranch
              ? sheetTarget.branch.title
              : sheetTarget.milestone.title;

            const sheetMilestoneId = isBranch
              ? sheetTarget.milestoneId
              : sheetTarget.milestone.nodeId || sheetTarget.milestone.id;

            const sheetArModelId = isBranch
              ? sheetTarget.branch.arModelId
              : sheetTarget.milestone.arModelId;

            const sheetTargetNode = isBranch
              ? sheetTarget.branch.targetNode
              : sheetTarget.milestone.targetNode;

            return (
              <View
                style={[
                  styles.actionSheetCard,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    paddingBottom: Math.max(insets.bottom, 18) + 8,
                  },
                ]}
              >
                {/* Drag Handle Bar */}
                <View style={styles.dragHandleWrap}>
                  <View style={[styles.dragHandleBar, { backgroundColor: theme.border }]} />
                </View>

                {/* Header Row: Category Pill + Close (x) */}
                <View style={styles.sheetHeaderRow}>
                  <View
                    style={[
                      styles.sheetCategoryPill,
                      {
                        backgroundColor: branchDueToday ? theme.warningTint : theme.brandTint,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.sheetCategoryText,
                        { color: branchDueToday ? theme.warning : theme.brandPrimary },
                      ]}
                    >
                      {categoryMeta}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => setSheetTarget(null)}
                    style={[styles.closeModalBtn, { backgroundColor: theme.surfaceSubtle }]}
                    activeOpacity={0.8}
                  >
                    <X size={17} color={theme.textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* Topic Title & Concise Revision Summary */}
                <Text style={[styles.sheetTopicTitle, { color: theme.textPrimary }]}>
                  {sheetTitle}
                </Text>
                <Text
                  style={[styles.sheetTopicSummary, { color: theme.textSecondary }]}
                  numberOfLines={3}
                >
                  {resolveSheetRevisionSummary(sheetTarget)}
                </Text>

                {/* Thumb-Friendly 3-State Status Selector */}
                <Text style={[styles.sheetSectionLabel, { color: theme.textMuted }]}>
                  MARK TOPIC PROGRESS
                </Text>
                <View style={styles.statusSelectorRow}>
                  {(
                    [
                      {
                        key: 'not_started' as NodeStudyStatus,
                        label: 'Not Started',
                        activeBg: theme.surfaceSubtle,
                        activeBorder: theme.textSecondary,
                        activeText: theme.textPrimary,
                      },
                      {
                        key: 'learning' as NodeStudyStatus,
                        label: 'Learning',
                        activeBg: theme.warningTint,
                        activeBorder: theme.warning,
                        activeText: theme.warning,
                      },
                      {
                        key: 'done' as NodeStudyStatus,
                        label: 'Mastered',
                        activeBg: theme.successTint,
                        activeBorder: theme.success,
                        activeText: theme.success,
                      },
                    ] as const
                  ).map((opt) => {
                    const selected = currentStatus === opt.key;
                    return (
                      <TouchableOpacity
                        key={opt.key}
                        style={[
                          styles.statusChoiceBtn,
                          {
                            backgroundColor: selected ? opt.activeBg : theme.canvas,
                            borderColor: selected ? opt.activeBorder : theme.border,
                            borderWidth: selected ? 1.5 : 1,
                          },
                        ]}
                        onPress={() => handleSetSheetStatus(opt.key)}
                        activeOpacity={0.82}
                      >
                        {opt.key === 'done' ? (
                          <Check
                            size={14}
                            color={selected ? opt.activeText : theme.textMuted}
                            strokeWidth={2.5}
                          />
                        ) : opt.key === 'learning' ? (
                          <BookOpen
                            size={14}
                            color={selected ? opt.activeText : theme.textMuted}
                          />
                        ) : (
                          <Circle
                            size={13}
                            color={selected ? opt.activeText : theme.textMuted}
                          />
                        )}
                        <Text
                          style={[
                            styles.statusChoiceText,
                            { color: selected ? opt.activeText : theme.textSecondary },
                          ]}
                          numberOfLines={1}
                        >
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Primary Action + Secondary Action Row */}
                <TouchableOpacity
                  style={[styles.sheetPrimaryBtn, { backgroundColor: theme.brandPrimary }]}
                  onPress={() => handleReadNotesForMilestone(sheetMilestoneId)}
                  activeOpacity={0.88}
                >
                  <FileText size={16} color="#FFFFFF" />
                  <Text style={styles.sheetPrimaryBtnText}>
                    Open Full Revision Notes & Practice
                  </Text>
                </TouchableOpacity>

                <View style={styles.sheetSecondaryRow}>
                  <TouchableOpacity
                    style={[
                      styles.sheetSecondaryBtn,
                      { backgroundColor: theme.surfaceSubtle, borderColor: theme.border },
                    ]}
                    onPress={() => {
                      setSheetTarget(null);
                      router.push({
                        pathname: '/study/tutor',
                        params: { roadmapId: activeRoadmap.id },
                      });
                    }}
                    activeOpacity={0.84}
                  >
                    <Sparkles size={15} color={theme.brandPrimary} />
                    <Text style={[styles.sheetSecondaryText, { color: theme.textPrimary }]}>
                      Ask AI Tutor
                    </Text>
                  </TouchableOpacity>

                  {sheetArModelId && (
                    <TouchableOpacity
                      style={[
                        styles.sheetSecondaryBtn,
                        { backgroundColor: theme.brandTint, borderColor: theme.brandBorder },
                      ]}
                      onPress={() => handleLaunchAR(sheetArModelId, sheetTargetNode)}
                      activeOpacity={0.84}
                    >
                      <Boxes size={15} color={theme.brandPrimary} />
                      <Text style={[styles.sheetSecondaryText, { color: theme.brandPrimary }]}>
                        Launch 3D Lab
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })()}
        </View>
      </Modal>

      {/* PERSONALIZE / ADAPTIVE GOAL MODAL */}
      <Modal
        visible={showGoalModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowGoalModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            style={styles.sheetBackdropDismiss}
            onPress={() => setShowGoalModal(false)}
          />
          <View
            style={[
              styles.modalSheet,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                paddingBottom: Math.max(insets.bottom, 20) + 12,
              },
            ]}
          >
            <View style={styles.dragHandleWrap}>
              <View style={[styles.dragHandleBar, { backgroundColor: theme.border }]} />
            </View>

            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                  Personalize Study Sprint
                </Text>
                <Text style={[styles.modalSub, { color: theme.textSecondary }]}>
                  Auto-schedules remaining topics • Focus Limit: {sessionTimeLimitMinutes}m/day
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowGoalModal(false)}
                style={[styles.closeModalBtn, { backgroundColor: theme.surfaceSubtle }]}
              >
                <X size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.fieldLabel, { color: theme.textPrimary }]}>
              Target Finish Window
            </Text>
            <View style={styles.presetGrid}>
              {[3, 5, 7, 14].map((d) => {
                const active = goalDays === d && customDaysInput === String(d);
                return (
                  <TouchableOpacity
                    key={d}
                    style={[
                      styles.presetChip,
                      {
                        backgroundColor: active ? theme.brandPrimary : theme.surfaceSubtle,
                        borderColor: active ? theme.brandPrimary : theme.border,
                      },
                    ]}
                    onPress={() => {
                      setGoalDays(d);
                      setCustomDaysInput(String(d));
                    }}
                  >
                    <Text style={[styles.presetChipText, { color: active ? '#FFFFFF' : theme.textPrimary }]}>
                      {d} Days
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.customDaysRow}>
              <Text style={[styles.customDaysLabel, { color: theme.textSecondary }]}>
                Or custom days:
              </Text>
              <TextInput
                keyboardType="number-pad"
                value={customDaysInput}
                onChangeText={(txt) => {
                  setCustomDaysInput(txt);
                  const n = parseInt(txt, 10);
                  if (!isNaN(n) && n > 0) setGoalDays(n);
                }}
                style={[
                  styles.customDaysInput,
                  {
                    backgroundColor: theme.canvas,
                    borderColor: theme.border,
                    color: theme.textPrimary,
                  },
                ]}
              />
            </View>

            <Text style={[styles.fieldLabel, { color: theme.textPrimary, marginTop: 14 }]}>
              Daily Study Pace
            </Text>
            <View style={styles.presetGrid}>
              {([30, 45, 60] as const).map((pace) => {
                const active = goalPace === pace;
                return (
                  <TouchableOpacity
                    key={pace}
                    style={[
                      styles.presetChip,
                      {
                        backgroundColor: active ? theme.brandPrimary : theme.surfaceSubtle,
                        borderColor: active ? theme.brandPrimary : theme.border,
                      },
                    ]}
                    onPress={() => setGoalPace(pace)}
                  >
                    <Text style={[styles.presetChipText, { color: active ? '#FFFFFF' : theme.textPrimary }]}>
                      {pace}m / day
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {activeProgress?.targetDeadline && (
              <Text style={[styles.deadlineHint, { color: theme.textSecondary }]}>
                Current Goal Ends: {formatShortDisplayDate(activeProgress.targetDeadline)} •{' '}
                {activeProgress.skippedDaysCount > 0
                  ? `${activeProgress.skippedDaysCount} skipped day(s) recovered`
                  : 'Pace On Track'}
              </Text>
            )}

            <TouchableOpacity
              style={[
                styles.simulateSkipBtn,
                { backgroundColor: theme.warningTint, borderColor: theme.warning },
              ]}
              onPress={() => {
                reconcileRoadmapSchedule(activeRoadmap.id, true);
                setShowGoalModal(false);
              }}
              activeOpacity={0.85}
            >
              <RefreshCw size={14} color={theme.warning} />
              <Text style={[styles.simulateSkipText, { color: theme.warning }]}>
                Simulate Skipped Day (Test Auto-Rebalance)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveGoalPrimaryBtn, { backgroundColor: theme.brandPrimary }]}
              onPress={handleSaveGoal}
              activeOpacity={0.88}
            >
              <Text style={styles.saveGoalPrimaryText}>Save & Generate Study Schedule</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  mainScrollContent: {
    flexGrow: 1,
  },

  // Scrollable Airy Hero Card
  heroCard: {
    paddingTop: 12,
    paddingBottom: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  chapterPillsRow: {
    gap: 8,
    paddingVertical: 2,
  },
  chapterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  chapterPillText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  chapterPillPct: {
    fontSize: 11,
    fontWeight: '700',
  },
  heroTitleBlock: {
    gap: 4,
  },
  heroChapterTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
    lineHeight: 25,
  },
  heroChapterSub: {
    fontSize: 12.5,
    fontWeight: '500',
  },
  progressTrack: {
    height: 4,
    borderRadius: 99,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 99,
  },

  // Clean 3-Tab Strip
  segmentedTabs: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  segmentBtnActive: {},
  segmentBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Compact Adaptive Sprint Strip
  adaptiveStrip: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 11,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  adaptiveStripLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  adaptiveStripText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  adjustGoalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  adjustGoalPillText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  guardrailBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    gap: 8,
  },
  guardrailHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  guardrailTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    flex: 1,
  },
  guardrailActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  guardrailActionBtn: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  guardrailActionText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Single-Layer Flowchart Architecture
  flowchartSection: {
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  milestoneBlock: {
    width: '100%',
    alignItems: 'center',
  },
  interSectionSpineWrap: {
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  interSectionSpineLine: {
    width: 2,
    height: 24,
    borderRadius: 1,
  },
  spineMilestoneCard: {
    width: '100%',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  spineNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spineNumberText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  spineTitleText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
    lineHeight: 20,
  },
  spineSubText: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 11.5,
    fontWeight: '500',
    marginTop: 2,
  },
  svgConnectorBand: {
    width: '100%',
    height: 32,
  },
  pairsStack: {
    width: '100%',
    gap: 10,
  },
  twoColRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
    alignItems: 'stretch',
  },
  topicCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 14,
    justifyContent: 'space-between',
    minHeight: 114,
  },
  topicCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topicTagText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  statusCheckBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusLearningRing: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusLearningInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusEmptyCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  topicCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 19,
    marginVertical: 10,
  },
  topicCardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  topicDurationText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  topicMiniPills: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  todayPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  todayPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  arMiniBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  arMiniBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  examTipStrip: {
    marginTop: 10,
    width: '100%',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  examTipAccentBar: {
    width: 3,
    alignSelf: 'stretch',
    borderRadius: 2,
  },
  examTipText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
  },

  // Bottom Related Chapters Footer Box
  relatedFooterCard: {
    marginTop: 24,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  relatedFooterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  relatedFooterTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: -0.1,
  },
  footerLegendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  legendChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  relatedFooterList: {
    gap: 8,
  },
  relatedRowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 12,
  },
  relatedChBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  relatedChBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  relatedRowTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  relatedRowSub: {
    fontSize: 11,
    marginTop: 1,
  },

  // Docked Bottom AI Tutor Footer (Solid, Zero Overlap)
  dockedFooter: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  dockedTutorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
  },
  dockedTutorText: {
    fontSize: 13.5,
    fontWeight: '700',
    flexShrink: 1,
  },

  // Bottom Topic Action Sheet
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(9, 13, 22, 0.56)',
    justifyContent: 'flex-end',
  },
  sheetBackdropDismiss: {
    flex: 1,
  },
  actionSheetCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  dragHandleWrap: {
    alignItems: 'center',
    marginBottom: 12,
  },
  dragHandleBar: {
    width: 38,
    height: 4,
    borderRadius: 2,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 10,
  },
  sheetCategoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  sheetCategoryText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  sheetTopicTitle: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.3,
    lineHeight: 24,
  },
  sheetTopicSummary: {
    fontSize: 13.5,
    lineHeight: 20,
    marginTop: 6,
  },
  sheetSectionLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.7,
    marginTop: 18,
    marginBottom: 8,
  },
  statusSelectorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusChoiceBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 11,
    paddingHorizontal: 6,
    borderRadius: 12,
  },
  statusChoiceText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sheetPrimaryBtn: {
    marginTop: 16,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  sheetPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  sheetSecondaryRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 10,
  },
  sheetSecondaryBtn: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  sheetSecondaryText: {
    fontSize: 13,
    fontWeight: '700',
  },

  // Notes & Practice Tab
  notesSectionContainer: {
    padding: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  notesList: {
    gap: 12,
  },
  noteCard: {
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  noteTopicTitle: {
    fontSize: 14.5,
    fontWeight: '800',
  },
  definitionsBox: {
    borderRadius: 10,
    padding: 10,
    gap: 4,
  },
  definitionsLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  definitionItem: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },
  bulletsList: {
    gap: 4,
  },
  bulletText: {
    fontSize: 12.5,
    lineHeight: 18,
  },
  noteTipBox: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  noteTipText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
  },

  practiceSubHeading: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  practiceList: {
    gap: 12,
  },
  questionCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  questionTopMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionNumBadge: {
    fontSize: 11,
    fontWeight: '800',
  },
  feedbackTag: {
    fontSize: 11,
    fontWeight: '800',
  },
  questionText: {
    fontSize: 13.5,
    fontWeight: '700',
    lineHeight: 19,
  },
  optionsList: {
    gap: 7,
  },
  optionBtn: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 9,
  },
  optionBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  explanationBox: {
    borderRadius: 10,
    padding: 10,
  },
  explanationText: {
    fontSize: 11.5,
    lineHeight: 16.5,
  },
  marksBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  marksBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  revealBtn: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  revealBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  modelAnswerBox: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
  },
  modelAnswerText: {
    fontSize: 12,
    lineHeight: 17.5,
  },

  // Personalize Sprint Modal Sheet
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(9, 13, 22, 0.56)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  modalSub: {
    fontSize: 12,
    marginTop: 2,
  },
  closeModalBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    marginBottom: 8,
  },
  presetGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  presetChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  presetChipText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  customDaysRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  customDaysLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  customDaysInput: {
    width: 72,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
  },
  deadlineHint: {
    fontSize: 11.5,
    marginTop: 12,
    fontWeight: '600',
  },
  simulateSkipBtn: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
  },
  simulateSkipText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  saveGoalPrimaryBtn: {
    marginTop: 12,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveGoalPrimaryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
