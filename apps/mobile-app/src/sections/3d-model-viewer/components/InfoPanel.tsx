/**
 * InfoPanel
 * Sliding educational modal card for displaying STEM details about
 * the currently selected 3D hotspot.
 */
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ModelAnnotation } from '../data/models';

interface InfoPanelProps {
  annotation: ModelAnnotation;
  totalAnnotations: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  accentColor?: string;
}

export function InfoPanel({
  annotation,
  totalAnnotations,
  onClose,
  onNext,
  onPrev,
  accentColor = '#E74C3C',
}: InfoPanelProps) {
  const isOxygenated = annotation.oxygenStatus.includes('Oxygenated');
  const isDeoxygenated = annotation.oxygenStatus.includes('Deoxygenated');

  const badgeColor = isOxygenated
    ? '#FF4757'
    : isDeoxygenated
    ? '#2ED573'
    : '#FFA502';

  return (
    <View style={styles.card} pointerEvents="auto">
      {/* Top row: Counter & Close */}
      <View style={styles.headerRow}>
        <View style={styles.tagGroup}>
          <View style={[styles.numberBadge, { backgroundColor: accentColor }]}>
            <ThemedText style={styles.numberText}>{annotation.number}</ThemedText>
          </View>
          <View style={[styles.categoryBadge, { borderColor: 'rgba(255,255,255,0.2)' }]}>
            <ThemedText style={styles.categoryText}>{annotation.category}</ThemedText>
          </View>
          <View style={[styles.oxygenBadge, { backgroundColor: badgeColor + '25', borderColor: badgeColor }]}>
            <ThemedText style={[styles.oxygenText, { color: badgeColor }]}>
              {annotation.oxygenStatus}
            </ThemedText>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.6 }]}
          onPress={onClose}
          accessibilityLabel="Close description"
        >
          <ThemedText style={styles.closeBtnText}>✕</ThemedText>
        </Pressable>
      </View>

      {/* Main Title & Short description */}
      <ThemedText style={styles.title}>{annotation.label}</ThemedText>
      <ThemedText style={styles.shortDesc}>{annotation.shortDesc}</ThemedText>

      {/* Full Educational Explanation */}
      <ThemedText style={styles.fullDesc}>{annotation.fullDesc}</ThemedText>

      {/* Tour Navigation Controls */}
      <View style={styles.footerRow}>
        <ThemedText style={styles.stepText}>
          Part {annotation.number} of {totalAnnotations}
        </ThemedText>

        <View style={styles.navButtons}>
          <Pressable
            style={({ pressed }) => [styles.navBtn, pressed && styles.navBtnPressed]}
            onPress={onPrev}
            accessibilityLabel="Previous anatomical feature"
          >
            <ThemedText style={styles.navBtnText}>‹ Prev</ThemedText>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.navBtn,
              { backgroundColor: accentColor },
              pressed && styles.navBtnPressed,
            ]}
            onPress={onNext}
            accessibilityLabel="Next anatomical feature"
          >
            <ThemedText style={[styles.navBtnText, { color: '#fff', fontWeight: '700' }]}>
              Next ›
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(18, 19, 36, 0.94)',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tagGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  numberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  categoryText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  oxygenBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  oxygenText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 18,
  },
  title: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 2,
  },
  shortDesc: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 13,
    fontStyle: 'italic',
  },
  fullDesc: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 14,
    lineHeight: 20,
    marginVertical: 4,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: 4,
  },
  stepText: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 12,
  },
  navButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  navBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  navBtnPressed: {
    opacity: 0.7,
  },
  navBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
