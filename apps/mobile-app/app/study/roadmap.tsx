import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Lock,
  PlayCircle,
  Boxes,
  ArrowRight,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react-native';
import { useEdzyStore, MilestoneStatus } from '@/store/useEdzyStore';
import { colors } from '@/theme/colors';

export default function SyllabusRoadmapScreen() {
  const router = useRouter();
  const { roadmaps, markMilestoneStatus, updateArDirective, incrementStudyHour } = useEdzyStore();
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string>(roadmaps[0].id);

  const activeRoadmap = roadmaps.find((r) => r.id === selectedRoadmapId) || roadmaps[0];

  const handleToggleMilestone = (nodeId: string, currentStatus: MilestoneStatus, targetNode?: string) => {
    if (currentStatus === 'LOCKED') {
      Alert.alert(
        'Prerequisite Milestone',
        'Please complete preceding milestones in sequence according to the CBSE NCERT curriculum.'
      );
      return;
    }

    if (currentStatus === 'IN_PROGRESS') {
      markMilestoneStatus(activeRoadmap.id, nodeId, 'COMPLETED');
      incrementStudyHour(0.5);
      Alert.alert('Milestone Cleared! 🎉', 'Added +30 mins to your weekly study log. Keep going!');
    } else {
      markMilestoneStatus(activeRoadmap.id, nodeId, 'IN_PROGRESS');
    }
  };

  const handleLaunchAR = (modelId?: string, targetNode?: string) => {
    if (targetNode) {
      updateArDirective({
        targetNode,
        highlight: true,
        note: `Focused on ${targetNode} from Syllabus Roadmap (${activeRoadmap.subject})`,
      });
    }
    router.push('/study/ar-lab');
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Chapter Selection Horizontal Scroller */}
      <View style={styles.selectorHeader}>
        <Text style={styles.headerTitle}>CBSE Class 10 Syllabus Track</Text>
        <Text style={styles.headerSubtitle}>
          Select a subject chapter to view curriculum milestones and AR experiments:
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}
        >
          {roadmaps.map((item) => {
            const isSelected = item.id === activeRoadmap.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.chapterTabCard,
                  isSelected && styles.chapterTabCardActive,
                ]}
                onPress={() => setSelectedRoadmapId(item.id)}
                activeOpacity={0.85}
              >
                <View style={styles.tabTopRow}>
                  <Text style={[styles.tabSubject, isSelected && styles.tabSubjectActive]}>
                    Ch {item.chapterNumber}
                  </Text>
                  <View style={styles.tabPercentBadge}>
                    <Text style={styles.tabPercentText}>{item.progressPercent}%</Text>
                  </View>
                </View>
                <Text
                  style={[styles.tabTitle, isSelected && styles.tabTitleActive]}
                  numberOfLines={2}
                >
                  {item.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.contentScroll} showsVerticalScrollIndicator={false}>
        {/* Selected Chapter Progress Summary Card */}
        <View style={styles.chapterSummaryCard}>
          <View style={styles.summaryTopRow}>
            <View style={styles.boardBadge}>
              <ShieldCheck size={14} color={colors.student.secondaryLight} />
              <Text style={styles.boardBadgeText}>{activeRoadmap.board}</Text>
            </View>
            <Text style={styles.completedCountText}>
              {activeRoadmap.completedSubtopics} / {activeRoadmap.totalSubtopics} Milestones
            </Text>
          </View>

          <Text style={styles.chapterMainTitle}>
            Chapter {activeRoadmap.chapterNumber}: {activeRoadmap.title}
          </Text>

          {/* Progress bar */}
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${activeRoadmap.progressPercent}%` },
              ]}
            />
          </View>

          <View style={styles.summaryMetaRow}>
            <View style={styles.metaItem}>
              <Clock size={12} color={colors.text.muted} />
              <Text style={styles.metaText}>Est. 3.5 Hours Total</Text>
            </View>
            <View style={styles.metaItem}>
              <Sparkles size={12} color={colors.student.secondaryLight} />
              <Text style={styles.metaText}>NCERT Syllabus Verified</Text>
            </View>
          </View>
        </View>

        {/* Milestone Tree Title */}
        <View style={styles.treeHeaderRow}>
          <Text style={styles.treeSectionTitle}>Interactive Milestone Sequence</Text>
          <Text style={styles.treeSectionSubtitle}>Tap to mark progress or view 3D model</Text>
        </View>

        {/* Milestones List */}
        <View style={styles.milestoneTreeContainer}>
          {activeRoadmap.milestones.map((milestone, index) => {
            const isCompleted = milestone.status === 'COMPLETED';
            const isInProgress = milestone.status === 'IN_PROGRESS';
            const isLocked = milestone.status === 'LOCKED';

            return (
              <View key={milestone.id} style={styles.milestoneItemWrapper}>
                {/* Vertical tree connection line */}
                {index < activeRoadmap.milestones.length - 1 && (
                  <View
                    style={[
                      styles.treeConnectorLine,
                      isCompleted && styles.treeConnectorLineCompleted,
                    ]}
                  />
                )}

                {/* Milestone Node Card */}
                <View
                  style={[
                    styles.milestoneCard,
                    isCompleted && styles.milestoneCardCompleted,
                    isInProgress && styles.milestoneCardInProgress,
                    isLocked && styles.milestoneCardLocked,
                  ]}
                >
                  <View style={styles.nodeHeaderRow}>
                    {/* Status Icon */}
                    <View style={styles.statusIconBox}>
                      {isCompleted && (
                        <CheckCircle2 size={20} color={colors.parent.primaryLight} />
                      )}
                      {isInProgress && (
                        <PlayCircle size={20} color={colors.student.secondaryLight} />
                      )}
                      {isLocked && <Lock size={18} color={colors.text.disabled} />}
                    </View>

                    <View style={styles.nodeTitleContainer}>
                      <Text
                        style={[
                          styles.nodeTitle,
                          isLocked && styles.nodeTitleLocked,
                        ]}
                      >
                        {milestone.title}
                      </Text>
                      <View style={styles.timeTag}>
                        <Clock size={10} color={colors.text.muted} />
                        <Text style={styles.timeTagText}>{milestone.durationMinutes} mins</Text>
                      </View>
                    </View>

                    {/* Status Badge */}
                    <View
                      style={[
                        styles.nodeStatusBadge,
                        isCompleted && styles.badgeCompleted,
                        isInProgress && styles.badgeInProgress,
                        isLocked && styles.badgeLocked,
                      ]}
                    >
                      <Text
                        style={[
                          styles.nodeStatusBadgeText,
                          isCompleted && { color: colors.parent.primaryLight },
                          isInProgress && { color: colors.student.secondaryLight },
                          isLocked && { color: colors.text.disabled },
                        ]}
                      >
                        {milestone.status}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.nodeDescription}>{milestone.description}</Text>

                  {/* Action buttons inside Milestone */}
                  <View style={styles.nodeActionsRow}>
                    {milestone.targetNode && (
                      <TouchableOpacity
                        style={styles.arPillButton}
                        onPress={() => handleLaunchAR(milestone.arModelId, milestone.targetNode)}
                        activeOpacity={0.8}
                      >
                        <Boxes size={14} color={colors.spatial.nodeActive} />
                        <Text style={styles.arPillButtonText}>
                          AR: {milestone.targetNode}
                        </Text>
                        <ChevronRight size={12} color={colors.spatial.nodeActive} />
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={[
                        styles.toggleButton,
                        isCompleted && styles.toggleButtonCompleted,
                        isInProgress && styles.toggleButtonProgress,
                        isLocked && styles.toggleButtonLocked,
                      ]}
                      onPress={() =>
                        handleToggleMilestone(milestone.id, milestone.status, milestone.targetNode)
                      }
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.toggleButtonText,
                          isCompleted && { color: colors.text.secondary },
                        ]}
                      >
                        {isCompleted
                          ? 'Review Node'
                          : isInProgress
                          ? 'Mark Complete ✓'
                          : 'Locked (Sequence)'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  selectorHeader: {
    backgroundColor: colors.surface,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomColor: colors.cardBorder,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text.primary,
    paddingHorizontal: 16,
  },
  headerSubtitle: {
    fontSize: 11,
    color: colors.text.muted,
    paddingHorizontal: 16,
    marginTop: 2,
    marginBottom: 12,
  },
  horizontalScroll: {
    paddingHorizontal: 16,
    gap: 10,
  },
  chapterTabCard: {
    width: 170,
    backgroundColor: colors.bentoCard,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
  },
  chapterTabCardActive: {
    borderColor: colors.student.secondaryLight,
    backgroundColor: 'rgba(6, 182, 212, 0.08)',
  },
  tabTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  tabSubject: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.muted,
  },
  tabSubjectActive: {
    color: colors.student.secondaryLight,
  },
  tabPercentBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tabPercentText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.student.primaryLight,
  },
  tabTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.secondary,
    lineHeight: 16,
  },
  tabTitleActive: {
    color: colors.text.primary,
  },
  contentScroll: {
    padding: 16,
    paddingBottom: 40,
  },
  chapterSummaryCard: {
    backgroundColor: colors.student.cardBg,
    borderColor: colors.student.border,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  boardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  boardBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.student.secondaryLight,
  },
  completedCountText: {
    fontSize: 11,
    color: colors.text.muted,
    fontWeight: '600',
  },
  chapterMainTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 12,
    lineHeight: 24,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.student.secondaryLight,
    borderRadius: 4,
  },
  summaryMetaRow: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 11,
    color: colors.text.muted,
    fontWeight: '500',
  },
  treeHeaderRow: {
    marginBottom: 14,
  },
  treeSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
  },
  treeSectionSubtitle: {
    fontSize: 11,
    color: colors.text.muted,
    marginTop: 2,
  },
  milestoneTreeContainer: {
    position: 'relative',
    paddingLeft: 8,
  },
  milestoneItemWrapper: {
    position: 'relative',
    marginBottom: 14,
  },
  treeConnectorLine: {
    position: 'absolute',
    left: 20,
    top: 36,
    bottom: -18,
    width: 2,
    backgroundColor: colors.cardBorder,
    zIndex: -1,
  },
  treeConnectorLineCompleted: {
    backgroundColor: colors.parent.primary,
  },
  milestoneCard: {
    backgroundColor: colors.bentoCard,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  milestoneCardCompleted: {
    borderColor: colors.parent.border,
    backgroundColor: '#0E1C1F',
  },
  milestoneCardInProgress: {
    borderColor: colors.student.secondary,
    backgroundColor: '#0F1E2E',
  },
  milestoneCardLocked: {
    opacity: 0.65,
    backgroundColor: colors.background,
  },
  nodeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  statusIconBox: {
    marginTop: 2,
  },
  nodeTitleContainer: {
    flex: 1,
  },
  nodeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.primary,
  },
  nodeTitleLocked: {
    color: colors.text.muted,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  timeTagText: {
    fontSize: 10,
    color: colors.text.muted,
  },
  nodeStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  badgeInProgress: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
  },
  badgeLocked: {
    backgroundColor: 'rgba(100, 116, 139, 0.15)',
  },
  nodeStatusBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  nodeDescription: {
    fontSize: 11,
    color: colors.text.secondary,
    lineHeight: 16,
    marginBottom: 12,
  },
  nodeActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopColor: colors.cardBorder,
    borderTopWidth: 1,
    paddingTop: 10,
    gap: 8,
  },
  arPillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.spatial.telemetryBg,
    borderColor: colors.spatial.telemetryBorder,
    borderWidth: 0.8,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    gap: 5,
  },
  arPillButtonText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.spatial.nodeActive,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.student.primary,
  },
  toggleButtonProgress: {
    backgroundColor: colors.student.secondary,
  },
  toggleButtonCompleted: {
    backgroundColor: colors.surface,
  },
  toggleButtonLocked: {
    backgroundColor: 'transparent',
  },
  toggleButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
