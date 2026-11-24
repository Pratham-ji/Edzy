import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  BookOpen,
  ChevronRight,
  Sparkles,
  Boxes,
} from 'lucide-react-native';
import { useEdzyStore } from '@/store/useEdzyStore';
import { useAppTheme, getCardShadow } from '@/theme/colors';
import { PressableScale } from '@/components/PressableScale';

export default function SyllabusScreen() {
  const router = useRouter();
  const { roadmaps, studentProfile } = useEdzyStore();
  const { theme, isDark } = useAppTheme();
  const cardShadow = getCardShadow(isDark);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.canvas }]} edges={['top', 'left', 'right']}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.surface,
            borderBottomColor: theme.border,
          },
        ]}
      >
        <View>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>CBSE Syllabus</Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            {studentProfile.classGrade} • Academic Session 2026-27
          </Text>
        </View>
        <View style={[styles.badgePill, { backgroundColor: theme.brandTint }]}>
          <Sparkles size={12} color={theme.brandPrimary} />
          <Text style={[styles.badgePillText, { color: theme.brandPrimary }]}>AI Synced</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 132 }]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.bannerCard,
            cardShadow,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={[styles.bannerIconCircle, { backgroundColor: theme.brandTint }]}>
            <BookOpen size={24} color={theme.brandPrimary} />
          </View>
          <View style={styles.bannerTextContainer}>
            <Text style={[styles.bannerTitle, { color: theme.textPrimary }]}>Grounded NCERT Curriculum</Text>
            <Text style={[styles.bannerDescription, { color: theme.textSecondary }]}>
              Step-by-step master roadmaps with interactive 3D spatial models and CBSE past papers.
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Prescribed Chapters</Text>

        <View style={styles.chapterList}>
          {roadmaps.map((roadmap) => {
            const isComplete = roadmap.progressPercent === 100;

            return (
              <PressableScale
                key={roadmap.id}
                style={[
                  styles.chapterCard,
                  cardShadow,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
                onPress={() => router.push('/study/roadmap')}
              >
                <View style={styles.chapterTopRow}>
                  <View style={[styles.subjectPill, { backgroundColor: theme.brandTint, borderColor: theme.brandBorder }]}>
                    <Text style={[styles.subjectPillText, { color: theme.brandPrimary }]}>{roadmap.subject}</Text>
                  </View>
                  <Text style={[styles.chapterNumberText, { color: theme.textMuted }]}>
                    Chapter {roadmap.chapterNumber}
                  </Text>
                </View>

                <Text style={[styles.chapterTitle, { color: theme.textPrimary }]}>{roadmap.title}</Text>
                <Text style={[styles.chapterTopicCount, { color: theme.textSecondary }]}>
                  {roadmap.totalSubtopics || 4} Core Topics • NCERT Aligned
                </Text>

                {/* Progress Bar */}
                <View style={styles.progressRow}>
                  <View style={[styles.progressBarTrack, { backgroundColor: theme.surfaceSubtle }]}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${roadmap.progressPercent}%`,
                          backgroundColor: isComplete ? theme.success : theme.brandPrimary,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.progressPercentText, { color: isComplete ? theme.success : theme.brandPrimary }]}>
                    {roadmap.progressPercent}%
                  </Text>
                </View>

                {/* Card Footer */}
                <View style={[styles.chapterFooter, { borderTopColor: theme.border }]}>
                  <View style={styles.modelTag}>
                    <Boxes size={14} color={theme.brandPrimary} />
                    <Text style={[styles.modelTagText, { color: theme.brandPrimary }]}>3D Interactive Model</Text>
                  </View>
                  <View style={styles.actionPrompt}>
                    <Text style={[styles.actionPromptText, { color: theme.brandPrimary }]}>
                      {isComplete ? 'Review' : 'Continue'}
                    </Text>
                    <ChevronRight size={14} color={theme.brandPrimary} />
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  badgePillText: {
    fontSize: 12,
    fontWeight: '700',
  },

  scrollContent: {
    padding: 16,
  },
  bannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  bannerIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  bannerDescription: {
    fontSize: 12,
    lineHeight: 16,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  chapterList: {
    gap: 12,
  },
  chapterCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  chapterTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  subjectPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  subjectPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  chapterNumberText: {
    fontSize: 12,
    fontWeight: '500',
  },
  chapterTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  chapterTopicCount: {
    fontSize: 13,
    marginBottom: 14,
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
    width: 38,
    textAlign: 'right',
  },
  chapterFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  modelTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modelTagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  actionPromptText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
