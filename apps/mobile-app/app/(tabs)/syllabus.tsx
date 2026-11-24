import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Sparkles,
  Boxes,
} from 'lucide-react-native';
import { useEdzyStore } from '@/store/useEdzyStore';
import { colors } from '@/theme/colors';
import { PressableScale } from '@/components/PressableScale';

export default function SyllabusScreen() {
  const router = useRouter();
  const { roadmaps, studentProfile } = useEdzyStore();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>CBSE Syllabus</Text>
          <Text style={styles.headerSubtitle}>
            {studentProfile.classGrade} • Academic Session 2026-27
          </Text>
        </View>
        <View style={styles.badgePill}>
          <Sparkles size={12} color={colors.brand.primary} />
          <Text style={styles.badgePillText}>AI Synced</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.bannerCard}>
          <View style={styles.bannerIconCircle}>
            <BookOpen size={24} color={colors.brand.primary} />
          </View>
          <View style={styles.bannerTextContainer}>
            <Text style={styles.bannerTitle}>Grounded NCERT Curriculum</Text>
            <Text style={styles.bannerDescription}>
              Step-by-step master roadmaps with interactive 3D spatial models and CBSE past papers.
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Prescribed Chapters</Text>

        <View style={styles.chapterList}>
          {roadmaps.map((roadmap) => {
            const isComplete = roadmap.progressPercent === 100;

            return (
              <PressableScale
                key={roadmap.id}
                style={styles.chapterCard}
                onPress={() => router.push('/study/roadmap')}
              >
                <View style={styles.chapterTopRow}>
                  <View style={styles.subjectPill}>
                    <Text style={styles.subjectPillText}>{roadmap.subject}</Text>
                  </View>
                  <Text style={styles.chapterNumberText}>
                    Chapter {roadmap.chapterNumber}
                  </Text>
                </View>

                <Text style={styles.chapterTitle}>{roadmap.title}</Text>
                <Text style={styles.chapterTopicCount}>
                  {roadmap.totalSubtopics || 4} Core Topics • NCERT Aligned
                </Text>

                {/* Progress Bar */}
                <View style={styles.progressRow}>
                  <View style={styles.progressBarTrack}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${roadmap.progressPercent}%`,
                          backgroundColor: isComplete
                            ? colors.status.success
                            : colors.brand.primary,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressPercentText}>
                    {roadmap.progressPercent}%
                  </Text>
                </View>

                {/* Card Footer */}
                <View style={styles.chapterFooter}>
                  <View style={styles.modelTag}>
                    <Boxes size={14} color={colors.brand.primary} />
                    <Text style={styles.modelTagText}>3D Interactive Model</Text>
                  </View>
                  <View style={styles.actionPrompt}>
                    <Text style={styles.actionPromptText}>
                      {isComplete ? 'Review' : 'Continue'}
                    </Text>
                    <ChevronRight size={14} color={colors.brand.primary} />
                  </View>
                </View>
              </PressableScale>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: '#222222',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#717171',
    marginTop: 2,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.brand.tint,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.brand.primary,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 116,
    gap: 16,
  },
  bannerCard: {
    flexDirection: 'row',
    backgroundColor: colors.brand.tint,
    borderRadius: 20,
    padding: 16,
    gap: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.brand.tintBorder,
  },
  bannerIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.brand.primaryDark,
    marginBottom: 4,
  },
  bannerDescription: {
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
    color: '#222222',
  },
  chapterList: {
    gap: 12,
  },
  chapterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EBEBEB',
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
      },
      android: {
        elevation: 3,
      },
      default: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
      },
    }),
  },
  chapterTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectPill: {
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
  chapterNumberText: {
    fontSize: 12,
    color: colors.text.muted,
  },
  chapterTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
    color: '#222222',
    marginBottom: 4,
  },
  chapterTopicCount: {
    fontSize: 12,
    color: '#717171',
    marginBottom: 12,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  progressBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: colors.surfaceBorder,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressPercentText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#222222',
    width: 36,
    textAlign: 'right',
  },
  chapterFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  modelTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modelTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.brand.primary,
  },
  actionPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionPromptText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.brand.primary,
  },
});
