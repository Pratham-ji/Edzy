import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Platform,
  TextInput,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Svg, { Path, Line } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import {
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
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
  Layers,
} from 'lucide-react-native';
import {
  useEdzyStore,
  FlowchartBranchNode,
  NodeStudyStatus,
} from '@/store/useEdzyStore';
import { useAppTheme, getCardShadow } from '@/theme/colors';
import {
  computeSprintBannerSummary,
  formatShortDisplayDate,
} from '@/lib/adaptiveScheduler';

type ActiveViewTab = 'roadmap' | 'notes';

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

  // Auto-reconcile & skip recovery on open or chapter switch
  useEffect(() => {
    if (activeRoadmap?.id) {
      reconcileRoadmapSchedule(activeRoadmap.id, false);
    }
  }, [activeRoadmap?.id]);

  const [activeTab, setActiveTab] = useState<ActiveViewTab>('roadmap');
  const [popoverNodeId, setPopoverNodeId] = useState<string | null>(null);
  const [highlightedNoteMilestoneId, setHighlightedNoteMilestoneId] = useState<string | null>(null);

  // Personalize / Deadline Modal State
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalDays, setGoalDays] = useState<number>(activeProgress?.totalDays || 7);
  const [goalPace, setGoalPace] = useState<30 | 45 | 60>(activeProgress?.dailyPaceMinutes || 45);
  const [customDaysInput, setCustomDaysInput] = useState<string>(String(activeProgress?.totalDays || 7));

  // Interactive Practice Sheet State
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, number>>({});
  const [revealedSubjective, setRevealedSubjective] = useState<Record<string, boolean>>({});

  const notesScrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);

  const sprintSummary = useMemo(() => {
    if (!activeRoadmap) {
      return {
        bannerText: '7-Day Sprint',
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

  const handleNodeAction = (
    node: FlowchartBranchNode,
    nextStatus: NodeStudyStatus
  ) => {
    if (!activeRoadmap) return;
    if (Platform.OS !== 'web') {
      if (nextStatus === 'done') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
    }
    updateFlowchartNodeStatus(activeRoadmap.id, node.id, nextStatus, node.title);
    setPopoverNodeId(null);
  };

  const handleReadNotesForMilestone = (milestoneId: string) => {
    setPopoverNodeId(null);
    setHighlightedNoteMilestoneId(milestoneId);
    setActiveTab('notes');
    setTimeout(() => {
      notesScrollRef.current?.scrollTo({ y: 0, animated: true });
    }, 80);
  };

  const handleLaunchAR = (arModelId?: string, targetNode?: string) => {
    updateArDirective({
      targetNode: targetNode || 'Aorta',
      modelName:
        arModelId === 'optics-ray-bench-3d'
          ? 'Optics Ray Bench 3D'
          : arModelId === 'quadratic-graph-3d'
          ? 'Quadratic Graph 3D'
          : arModelId === 'plant-animal-cell-3d'
          ? 'Plant & Animal Cell 3D'
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

  const renderBranchNode = (
    br: FlowchartBranchNode,
    milestoneId: string
  ) => {
    const entry = activeProgress?.nodeStates?.[br.id];
    const status: NodeStudyStatus = entry?.status || 'not_started';
    const isDone = status === 'done';
    const isLearning = status === 'learning';
    const isDueToday = sprintSummary.dueTodayNodeIds.has(br.id);
    const isPopoverOpen = popoverNodeId === br.id;

    const cardBg = isDone
      ? theme.successTint
      : isLearning
      ? theme.warningTint
      : theme.surface;

    const cardBorder = isDone
      ? theme.success
      : isLearning
      ? theme.warning
      : isPopoverOpen
      ? theme.brandPrimary
      : theme.border;

    return (
      <View key={br.id} style={[styles.branchWrapper, isPopoverOpen && { zIndex: 60 }]}>
        {/* Floating Inline 1-Tap Quick-Status Popover */}
        {isPopoverOpen && (
          <View
            style={[
              styles.inlinePopover,
              cardShadow,
              {
                backgroundColor: isDark ? '#1A2336' : '#0F172A',
                borderColor: theme.brandPrimary,
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.popoverBtn,
                {
                  backgroundColor: isLearning
                    ? theme.warning
                    : 'rgba(245, 158, 11, 0.18)',
                },
              ]}
              onPress={() => handleNodeAction(br, 'learning')}
              activeOpacity={0.85}
            >
              <BookOpen size={11} color={isLearning ? '#0F172A' : '#FBBF24'} />
              <Text
                style={[
                  styles.popoverBtnText,
                  { color: isLearning ? '#0F172A' : '#FBBF24' },
                ]}
              >
                Learning
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.popoverBtn,
                {
                  backgroundColor: isDone
                    ? theme.success
                    : 'rgba(16, 185, 129, 0.2)',
                },
              ]}
              onPress={() => handleNodeAction(br, 'done')}
              activeOpacity={0.85}
            >
              <Check size={11} color={isDone ? '#0F172A' : '#34D399'} />
              <Text
                style={[
                  styles.popoverBtnText,
                  { color: isDone ? '#0F172A' : '#34D399' },
                ]}
              >
                Done
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.popoverNotesBtn]}
              onPress={() => handleReadNotesForMilestone(milestoneId)}
              activeOpacity={0.8}
            >
              <FileText size={11} color="#C7D2FE" />
              <Text style={styles.popoverNotesText}>Notes</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.branchNodeCard,
            {
              backgroundColor: cardBg,
              borderColor: cardBorder,
            },
          ]}
          onPress={() => setPopoverNodeId(isPopoverOpen ? null : br.id)}
          activeOpacity={0.85}
        >
          <View style={styles.branchNodeTopRow}>
            <Text
              style={[
                styles.branchNodeTitle,
                { color: theme.textPrimary },
                isDone && { color: theme.success },
              ]}
              numberOfLines={3}
            >
              {br.title}
            </Text>
            {isDone ? (
              <View style={[styles.doneCheckCircle, { backgroundColor: theme.success }]}>
                <Check size={10} color="#FFFFFF" strokeWidth={3} />
              </View>
            ) : isLearning ? (
              <View style={[styles.learningDot, { backgroundColor: theme.warning }]} />
            ) : (
              <View
                style={[
                  styles.priorityDot,
                  {
                    backgroundColor:
                      br.priority === 'MUST_KNOW'
                        ? theme.brandPrimary
                        : theme.textMuted,
                  },
                ]}
              />
            )}
          </View>

          <View style={styles.branchBadgesRow}>
            {isDueToday && !isDone && (
              <View style={[styles.todayPill, { backgroundColor: theme.warningTint }]}>
                <Text style={[styles.todayPillText, { color: theme.warning }]}>Today</Text>
              </View>
            )}

            {br.arModelId && (
              <TouchableOpacity
                style={[styles.arMiniBadge, { backgroundColor: theme.brandTint, borderColor: theme.brandBorder }]}
                onPress={() => handleLaunchAR(br.arModelId, br.targetNode)}
                activeOpacity={0.8}
              >
                <Boxes size={10} color={theme.brandPrimary} />
                <Text style={[styles.arMiniBadgeText, { color: theme.brandPrimary }]}>3D Lab</Text>
              </TouchableOpacity>
            )}

            {!isDueToday && !br.arModelId && (
              <Text style={[styles.branchDurationText, { color: theme.textMuted }]}>
                ~{br.durationMinutes}m
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </View>
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
    <SafeAreaView style={[styles.safeContainer, { backgroundColor: theme.canvas }]} edges={['bottom', 'left', 'right']}>
      {/* Compact Chapter Switcher Pills */}
      <View style={[styles.chapterStrip, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chapterStripScroll}>
          {roadmaps.map((item) => {
            const selected = item.id === activeRoadmap.id;
            const progPct = studentRoadmapProgress[item.id]?.completionPct ?? item.progressPercent;
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => {
                  setPopoverNodeId(null);
                  setSelectedRoadmapId(item.id);
                }}
                style={[
                  styles.chapterPill,
                  {
                    backgroundColor: selected ? theme.brandTint : theme.surfaceSubtle,
                    borderColor: selected ? theme.brandPrimary : theme.border,
                  },
                ]}
                activeOpacity={0.8}
              >
                <Text style={[styles.chapterPillText, { color: selected ? theme.brandPrimary : theme.textSecondary }]}>
                  Ch {item.chapterNumber} • {progPct}%
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* roadmap.sh-style Header & 3-Part Utility Bar */}
      <View style={[styles.roadmapHeaderBlock, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <Text style={[styles.mainChapterTitle, { color: theme.textPrimary }]}>
          {activeRoadmap.title}
        </Text>
        <Text style={[styles.boardSubtitle, { color: theme.textSecondary }]}>
          {studentProfile.classGrade} • School Verified {schoolBoard} Curriculum • {activeRoadmap.progressPercent}% Mastered
        </Text>

        {/* 3-Part Utility Bar: Tabs on Left, Personalize on Right */}
        <View style={styles.utilityBar}>
          <View style={styles.utilityTabsLeft}>
            <TouchableOpacity
              style={[
                styles.utilityTab,
                activeTab === 'roadmap' && [styles.utilityTabActive, { borderBottomColor: theme.brandPrimary }],
              ]}
              onPress={() => setActiveTab('roadmap')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.utilityTabText,
                  { color: activeTab === 'roadmap' ? theme.brandPrimary : theme.textSecondary },
                ]}
              >
                Roadmap
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.utilityTab,
                activeTab === 'notes' && [styles.utilityTabActive, { borderBottomColor: theme.brandPrimary }],
              ]}
              onPress={() => setActiveTab('notes')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.utilityTabText,
                  { color: activeTab === 'notes' ? theme.brandPrimary : theme.textSecondary },
                ]}
              >
                Notes & Practice
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.utilityTab}
              onPress={() => router.push({ pathname: '/study/tutor', params: { roadmapId: activeRoadmap.id } })}
              activeOpacity={0.8}
            >
              <Text style={[styles.utilityTabText, { color: theme.textSecondary }]}>
                AI Tutor
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.personalizeBtn, { backgroundColor: theme.brandTint, borderColor: theme.brandBorder }]}
            onPress={openPersonalizeModal}
            activeOpacity={0.85}
          >
            <SlidersHorizontal size={12} color={theme.brandPrimary} />
            <Text style={[styles.personalizeBtnText, { color: theme.brandPrimary }]}>Personalize</Text>
          </TouchableOpacity>
        </View>

        {/* Live Adaptive Goal Strip */}
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
              size={13}
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
            <Text style={[styles.adjustGoalPillText, { color: theme.brandPrimary }]}>
              {activeProgress ? 'Adjust' : 'Set Goal'}
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
                  Extend Deadline +2 Days
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* BODY: ROADMAP FLOWCHART CANVAS VS NOTES & PRACTICE */}
      {activeTab === 'roadmap' ? (
        <View style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={[
              styles.canvasScroll,
              { paddingBottom: Math.max(insets.bottom, 24) + 84 },
            ]}
            showsVerticalScrollIndicator={false}
            onScrollBeginDrag={() => setPopoverNodeId(null)}
          >
            {/* Compact Related Chapters Card */}
            {relatedList.length > 0 && (
              <View style={styles.topCanvasRow}>
                <View style={[styles.relatedCard, cardShadow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <Text style={[styles.relatedTitle, { color: theme.brandPrimary }]}>Related Chapters</Text>
                  <View style={styles.relatedLinksList}>
                    {relatedList.map((rel, idx) => (
                      <TouchableOpacity
                        key={`${rel.id}-${idx}`}
                        onPress={() => {
                          if (rel.id && roadmaps.some((r) => r.id === rel.id)) {
                            setSelectedRoadmapId(rel.id);
                          }
                        }}
                        style={styles.relatedLinkBtn}
                        activeOpacity={0.75}
                      >
                        <Text style={[styles.relatedLinkText, { color: theme.textSecondary }]} numberOfLines={1}>
                          • Ch {rel.chapterNumber}: {rel.title}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Legend */}
                <View style={[styles.legendBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <View style={styles.legendRow}>
                    <View style={[styles.legendDot, { backgroundColor: theme.success }]} />
                    <Text style={[styles.legendText, { color: theme.textSecondary }]}>Done</Text>
                  </View>
                  <View style={styles.legendRow}>
                    <View style={[styles.legendDot, { backgroundColor: theme.warning }]} />
                    <Text style={[styles.legendText, { color: theme.textSecondary }]}>Learning</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Vertical Spine Flowchart Canvas */}
            <View style={styles.flowchartColumn}>
              {/* Continuous Indigo Central Trunk Line */}
              {activeRoadmap.milestones.length > 1 && (
                <View
                  style={[
                    styles.verticalSpineLine,
                    { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.35)' : 'rgba(79, 70, 229, 0.25)' },
                  ]}
                />
              )}

              {activeRoadmap.milestones.map((ms, idx) => {
                const milestoneId = ms.nodeId || ms.id;
                const branches = ms.branches || [];
                const leftBranches = branches.filter((b) => b.side === 'left');
                const rightBranches = branches.filter((b) => b.side === 'right');

                const doneInMs = branches.filter(
                  (b) => activeProgress?.nodeStates?.[b.id]?.status === 'done'
                ).length;
                const msAllDone = branches.length > 0 && doneInMs === branches.length;

                return (
                  <View key={milestoneId} style={styles.milestoneBlock}>
                    {/* Bold Core Spine Milestone Box */}
                    <TouchableOpacity
                      style={[
                        styles.spineMilestoneCard,
                        cardShadow,
                        {
                          backgroundColor: msAllDone ? theme.success : theme.brandPrimary,
                          borderColor: msAllDone ? theme.success : theme.brandDark,
                        },
                      ]}
                      onPress={() => handleReadNotesForMilestone(milestoneId)}
                      activeOpacity={0.9}
                    >
                      <View style={styles.spineIndexCircle}>
                        <Text style={styles.spineIndexText}>{idx + 1}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.spineTitleText}>{ms.title}</Text>
                        <Text style={styles.spineSubText}>
                          {doneInMs}/{branches.length || 1} mastered • Tap for Notes
                        </Text>
                      </View>
                      {msAllDone && <CheckCircle2 size={18} color="#FFFFFF" />}
                    </TouchableOpacity>

                    {/* SVG Curved Dotted Branch Connectors */}
                    {(leftBranches.length > 0 || rightBranches.length > 0) && (
                      <View style={styles.svgConnectorWrapper}>
                        <Svg width="100%" height={28} viewBox="0 0 320 28">
                          <Line
                            x1="160"
                            y1="0"
                            x2="160"
                            y2="28"
                            stroke={theme.brandPrimary}
                            strokeOpacity={0.3}
                            strokeWidth="2.5"
                          />
                          {leftBranches.length > 0 && (
                            <Path
                              d="M 160 2 C 128 14, 96 10, 74 26"
                              fill="none"
                              stroke={theme.brandPrimary}
                              strokeWidth="2"
                              strokeDasharray="4 4"
                            />
                          )}
                          {rightBranches.length > 0 && (
                            <Path
                              d="M 160 2 C 192 14, 224 10, 246 26"
                              fill="none"
                              stroke={theme.brandPrimary}
                              strokeWidth="2"
                              strokeDasharray="4 4"
                            />
                          )}
                        </Svg>
                      </View>
                    )}

                    {/* Left & Right Grouped Sub-Topic Cluster Boxes */}
                    {(leftBranches.length > 0 || rightBranches.length > 0) && (
                      <View style={styles.clustersTwoColRow}>
                        {/* Left Cluster Box */}
                        <View style={styles.clusterCol}>
                          {leftBranches.length > 0 && (
                            <View
                              style={[
                                styles.clusterBox,
                                {
                                  backgroundColor: theme.brandTint,
                                  borderColor: theme.brandBorder,
                                },
                              ]}
                            >
                              <Text style={[styles.clusterGroupTitle, { color: theme.brandPrimary }]}>
                                {leftBranches[0]?.groupBox || 'Core Concept'}
                              </Text>
                              <View style={styles.clusterNodesStack}>
                                {leftBranches.map((br) => renderBranchNode(br, milestoneId))}
                              </View>
                            </View>
                          )}
                        </View>

                        {/* Right Cluster Box */}
                        <View style={styles.clusterCol}>
                          {rightBranches.length > 0 && (
                            <View
                              style={[
                                styles.clusterBox,
                                {
                                  backgroundColor: theme.brandTint,
                                  borderColor: theme.brandBorder,
                                },
                              ]}
                            >
                              <Text style={[styles.clusterGroupTitle, { color: theme.brandPrimary }]}>
                                {rightBranches[0]?.groupBox || 'Application'}
                              </Text>
                              <View style={styles.clusterNodesStack}>
                                {rightBranches.map((br) => renderBranchNode(br, milestoneId))}
                              </View>
                            </View>
                          )}
                        </View>
                      </View>
                    )}

                    {/* Teacher Exam Tip Callout */}
                    {ms.examTip && (
                      <View
                        style={[
                          styles.examTipBox,
                          { backgroundColor: theme.warningTint, borderColor: isDark ? 'rgba(245,158,11,0.28)' : '#FDE68A' },
                        ]}
                      >
                        <Lightbulb size={13} color={theme.warning} style={{ marginTop: 1 }} />
                        <Text style={[styles.examTipText, { color: theme.textPrimary }]}>
                          {ms.examTip}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </ScrollView>

          {/* Sleek Floating Dark Glass AI Tutor Pill */}
          <View style={[styles.floatingTutorWrap, { bottom: Math.max(insets.bottom, 12) + 8 }]}>
            <TouchableOpacity
              style={[
                styles.floatingTutorPill,
                cardShadow,
                {
                  backgroundColor: isDark ? 'rgba(18, 24, 38, 0.94)' : 'rgba(15, 23, 42, 0.92)',
                  borderColor: 'rgba(99, 102, 241, 0.45)',
                },
              ]}
              onPress={() => router.push({ pathname: '/study/tutor', params: { roadmapId: activeRoadmap.id } })}
              activeOpacity={0.9}
            >
              <Sparkles size={15} color="#818CF8" />
              <Text style={styles.floatingTutorText} numberOfLines={1}>
                AI Tutor • Ask a doubt about Ch {activeRoadmap.chapterNumber}...
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* =========================================================
           NOTES & PRACTICE TAB (ELIMINATING EVENING TUITIONS)
           ========================================================= */
        <ScrollView
          ref={notesScrollRef}
          contentContainerStyle={[
            styles.notesScrollContent,
            { paddingBottom: Math.max(insets.bottom, 24) + 28 },
          ]}
          showsVerticalScrollIndicator={false}
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
              return (
                <View
                  key={note.id}
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

                  {note.examFormulaOrTip && (
                    <View style={[styles.noteTipBox, { backgroundColor: theme.warningTint }]}>
                      <Lightbulb size={13} color={theme.warning} />
                      <Text style={[styles.noteTipText, { color: theme.textPrimary }]}>
                        {note.examFormulaOrTip}
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
        </ScrollView>
      )}

      {/* PERSONALIZE / ADAPTIVE GOAL MODAL */}
      <Modal
        visible={showGoalModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowGoalModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                  Personalize Study Sprint
                </Text>
                <Text style={[styles.modalSub, { color: theme.textSecondary }]}>
                  Auto-schedules remaining topics • Parental Limit: {sessionTimeLimitMinutes}m/day
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

            {/* Demo Skip Recovery Button */}
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
  chapterStrip: {
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  chapterStripScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chapterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
    borderWidth: 1,
  },
  chapterPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  roadmapHeaderBlock: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  mainChapterTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  boardSubtitle: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 10,
  },
  utilityBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  utilityTabsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  utilityTab: {
    paddingVertical: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  utilityTabActive: {},
  utilityTabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  personalizeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  personalizeBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  adaptiveStrip: {
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 10,
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
    gap: 7,
  },
  adaptiveStripText: {
    fontSize: 11.5,
    fontWeight: '600',
    flex: 1,
  },
  adjustGoalPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  adjustGoalPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  guardrailBox: {
    marginTop: 8,
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
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  guardrailActionText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Flowchart Canvas
  canvasScroll: {
    paddingHorizontal: 14,
    paddingTop: 14,
  },
  topCanvasRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 16,
  },
  relatedCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 10,
  },
  relatedTitle: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  relatedLinksList: {
    gap: 3,
  },
  relatedLinkBtn: {},
  relatedLinkText: {
    fontSize: 11,
    fontWeight: '600',
  },
  legendBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 8,
    gap: 4,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
    fontWeight: '600',
  },

  flowchartColumn: {
    position: 'relative',
    alignItems: 'center',
    gap: 20,
  },
  verticalSpineLine: {
    position: 'absolute',
    top: 24,
    bottom: 24,
    width: 3,
    borderRadius: 2,
    zIndex: 0,
  },
  milestoneBlock: {
    width: '100%',
    alignItems: 'center',
    zIndex: 2,
  },
  spineMilestoneCard: {
    width: '86%',
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 5,
  },
  spineIndexCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spineIndexText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  spineTitleText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  spineSubText: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 10.5,
    marginTop: 2,
  },
  svgConnectorWrapper: {
    width: '100%',
    height: 28,
    alignItems: 'center',
  },
  clustersTwoColRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  clusterCol: {
    flex: 1,
  },
  clusterBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 8,
    gap: 6,
  },
  clusterGroupTitle: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    paddingHorizontal: 2,
  },
  clusterNodesStack: {
    gap: 8,
  },
  branchWrapper: {
    position: 'relative',
  },
  inlinePopover: {
    position: 'absolute',
    top: -42,
    left: -4,
    right: -4,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  popoverBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 8,
  },
  popoverBtnText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  popoverNotesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 5,
    paddingVertical: 4,
  },
  popoverNotesText: {
    color: '#C7D2FE',
    fontSize: 10,
    fontWeight: '700',
  },
  branchNodeCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 9,
    gap: 6,
  },
  branchNodeTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 6,
  },
  branchNodeTitle: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  doneCheckCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  learningDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 3,
  },
  priorityDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginTop: 4,
  },
  branchBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
    flexWrap: 'wrap',
  },
  todayPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  todayPillText: {
    fontSize: 9.5,
    fontWeight: '800',
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
    fontSize: 9.5,
    fontWeight: '700',
  },
  branchDurationText: {
    fontSize: 10,
    fontWeight: '600',
  },
  examTipBox: {
    marginTop: 8,
    width: '94%',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  examTipText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 15.5,
    fontWeight: '500',
  },

  floatingTutorWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  floatingTutorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 99,
    borderWidth: 1,
    maxWidth: 420,
    width: '100%',
    justifyContent: 'center',
  },
  floatingTutorText: {
    color: '#F8FAFC',
    fontSize: 12.5,
    fontWeight: '700',
  },

  // Notes & Practice Tab
  notesScrollContent: {
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
    padding: 9,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  noteTipText: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 16,
    fontWeight: '600',
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

  // Modal Sheet
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.62)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
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
