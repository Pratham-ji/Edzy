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
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string>(roadmaps[0]?.id || 'bio-ch6');

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

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Chapter Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryTopRow}>
            <View style={styles.subjectPill}>
              <BookOpen size={12} color={colors.brand.primary} />
              <Text style={styles.subjectPillText}>
                {activeRoadmap.subject} • Chapter {activeRoadmap.chapterNumber}
              </Text>
            </View>
            <View style={styles.boardBadge}>
              <Text style={styles.boardBadgeText}>{activeRoadmap.board}</Text>
            </View>
          </View>

          <Text style={styles.chapterMainTitle}>{activeRoadmap.title}</Text>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${activeRoadmap.progressPercent}%` },
                  activeRoadmap.progressPercent === 100 && {
                    backgroundColor: colors.status.success,
                  },
                ]}
              />
            </View>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressPercentText}>
                {activeRoadmap.progressPercent}% Completed
              </Text>
              <Text style={styles.progressSubText}>
                {activeRoadmap.completedSubtopics} of {activeRoadmap.totalSubtopics} topics cleared
              </Text>
            </View>
          </View>
        </View>

        {/* Milestone Timeline Header */}
        <Text style={styles.timelineSectionTitle}>NCERT Topic Milestones</Text>

        {/* Milestone Tree List */}
        <View style={styles.milestoneList}>
          {activeRoadmap.milestones.map((node, index) => {
            const isCompleted = node.status === 'COMPLETED';
            const isInProgress = node.status === 'IN_PROGRESS';
            const isLocked = node.status === 'LOCKED';

            return (
              <View key={node.id} style={styles.milestoneCard}>
                <View style={styles.nodeHeaderRow}>
                  <View style={styles.statusIconBox}>
                    {isCompleted ? (
                      <CheckCircle2 size={20} color={colors.status.success} />
                    ) : isInProgress ? (
                      <PlayCircle size={20} color={colors.brand.primary} />
                    ) : (
                      <Lock size={18} color={colors.text.muted} />
                    )}
                  </View>

                  <View style={styles.nodeTitleContainer}>
                    <Text
                      style={[
                        styles.nodeTitle,
                        isLocked && styles.nodeTitleLocked,
                      ]}
                    >
                      {node.title}
                    </Text>
                    <View style={styles.timeTag}>
                      <Clock size={11} color={colors.text.muted} />
                      <Text style={styles.timeTagText}>{node.durationMinutes} mins</Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.statusPillBadge,
                      isCompleted && styles.badgeCompleted,
                      isInProgress && styles.badgeInProgress,
                      isLocked && styles.badgeLocked,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillBadgeText,
                        isCompleted && { color: colors.status.success },
                        isInProgress && { color: colors.brand.primary },
                        isLocked && { color: colors.text.muted },
                      ]}
                    >
                      {isCompleted ? 'Done' : isInProgress ? 'Active' : 'Locked'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.nodeDescription}>{node.description}</Text>

                <View style={styles.nodeActionsRow}>
                  {node.arModelId ? (
                    <TouchableOpacity
                      style={styles.arPillButton}
                      onPress={() => handleLaunchAR(node.arModelId, node.targetNode)}
                      activeOpacity={0.8}
                    >
                      <Boxes size={14} color={colors.brand.primary} />
                      <Text style={styles.arPillButtonText}>Open 3D Lab</Text>
                    </TouchableOpacity>
                  ) : (
                    <View />
                  )}

                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      isInProgress && styles.toggleButtonProgress,
                      isCompleted && styles.toggleButtonCompleted,
                      isLocked && styles.toggleButtonLocked,
                    ]}
                    onPress={() => handleToggleMilestone(node.id, node.status, node.targetNode)}
                    disabled={isLocked}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.toggleButtonText,
                        isCompleted && styles.toggleButtonTextCompleted,
                      ]}
                    >
                      {isCompleted ? 'Completed ✓' : isInProgress ? 'Mark Complete' : 'Locked'}
                    </Text>
                  </TouchableOpacity>
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
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  horizontalScroll: {
    paddingHorizontal: 16,
    gap: 10,
  },
  chapterTabCard: {
    width: 136,
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 10,
  },
  chapterTabCardActive: {
    backgroundColor: colors.brand.tint,
    borderColor: colors.brand.primary,
  },
  tabTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  tabSubject: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.secondary,
  },
  tabSubjectActive: {
    color: colors.brand.primary,
  },
  tabPercentBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tabPercentText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.brand.primary,
  },
  tabTitle: {
    fontSize: 11,
    color: colors.text.primary,
    fontWeight: '600',
    lineHeight: 15,
  },
  tabTitleActive: {
    color: colors.brand.primaryDark,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    gap: 14,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 16,
    shadowColor: colors.shadow.color,
    shadowOffset: colors.shadow.offset,
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  subjectPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.brand.tint,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  subjectPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.brand.primary,
  },
  boardBadge: {
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  boardBadgeText: {
    fontSize: 11,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  chapterMainTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 14,
  },
  progressContainer: {
    gap: 6,
  },
  progressBarTrack: {
    height: 7,
    backgroundColor: colors.background,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.brand.primary,
    borderRadius: 4,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressPercentText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.brand.primary,
  },
  progressSubText: {
    fontSize: 11,
    color: colors.text.muted,
  },
  timelineSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: 4,
  },
  milestoneList: {
    gap: 12,
  },
  milestoneCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 16,
    shadowColor: colors.shadow.color,
    shadowOffset: colors.shadow.offset,
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: 1,
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
    fontSize: 14,
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
    fontSize: 11,
    color: colors.text.muted,
  },
  statusPillBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeCompleted: {
    backgroundColor: colors.status.successBg,
  },
  badgeInProgress: {
    backgroundColor: colors.brand.tint,
  },
  badgeLocked: {
    backgroundColor: colors.background,
  },
  statusPillBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  nodeDescription: {
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 17,
    marginBottom: 12,
  },
  nodeActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: 10,
  },
  arPillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.brand.tint,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  arPillButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.brand.primary,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: colors.brand.primary,
  },
  toggleButtonProgress: {
    backgroundColor: colors.brand.primary,
  },
  toggleButtonCompleted: {
    backgroundColor: colors.status.successBg,
    borderWidth: 1,
    borderColor: colors.status.successBorder,
  },
  toggleButtonLocked: {
    backgroundColor: colors.background,
  },
  toggleButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  toggleButtonTextCompleted: {
    color: colors.status.success,
  },
});
