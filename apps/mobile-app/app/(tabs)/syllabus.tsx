import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
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
              <TouchableOpacity
                key={roadmap.id}
                style={styles.chapterCard}
                onPress={() => router.push('/study/roadmap')}
                activeOpacity={0.85}
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

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressBarTrack}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${roadmap.progressPercent}%` },
                        isComplete && { backgroundColor: colors.status.success },
                      ]}
                    />
                  </View>
                  <View style={styles.progressLabelRow}>
                    <Text
                      style={[
                        styles.progressPercentText,
                        isComplete && { color: colors.status.success },
                      ]}
                    >
                      {roadmap.progressPercent}% Mastered
                    </Text>
                    <Text style={styles.progressSubText}>
                      {roadmap.completedSubtopics} of {roadmap.totalSubtopics} topics completed
                    </Text>
                  </View>
                </View>

                {/* Card Footer */}
                <View style={styles.chapterFooter}>
                  <View style={styles.boardBadge}>
                    <Text style={styles.boardBadgeText}>{roadmap.board}</Text>
                  </View>
                  <View style={styles.openLink}>
                    <Text style={styles.openLinkText}>Open Roadmap</Text>
                    <ChevronRight size={14} color={colors.brand.primary} />
                  </View>
                </View>
              </TouchableOpacity>
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
    fontWeight: '800',
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
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
    padding: 16,
    gap: 16,
  },
  bannerCard: {
    flexDirection: 'row',
    backgroundColor: colors.brand.tint,
    borderRadius: 16,
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
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
  },
  chapterList: {
    gap: 12,
  },
  chapterCard: {
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
    fontWeight: '600',
  },
  chapterTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 12,
  },
  progressContainer: {
    marginBottom: 14,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: colors.background,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.brand.primary,
    borderRadius: 3,
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
    fontSize: 12,
    color: colors.text.muted,
  },
  chapterFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: 12,
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
  openLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  openLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.brand.primary,
  },
});
