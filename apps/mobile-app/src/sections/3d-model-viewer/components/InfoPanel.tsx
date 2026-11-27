/**
 * InfoPanel
 * Generic floating educational inspection card for any STEM 3D hotspot
 * (Biology, Physics, Chemistry, Mathematics).
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Focus, X } from 'lucide-react-native';
import { BadgeTone, ModelComponentNode } from '../interactions/types';

interface InfoPanelProps {
  annotation: ModelComponentNode;
  totalAnnotations: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  accentColor?: string;
  supportsIsolate?: boolean;
  isIsolated?: boolean;
  onToggleIsolate?: () => void;
}

const TONE_COLOR: Record<BadgeTone, string> = {
  danger: '#FB7185',
  info: '#38BDF8',
  success: '#34D399',
  warning: '#FBBF24',
  brand: '#818CF8',
};

export function InfoPanel({
  annotation,
  totalAnnotations,
  onClose,
  onNext,
  onPrev,
  accentColor = '#4F46E5',
  supportsIsolate = false,
  isIsolated = false,
  onToggleIsolate,
}: InfoPanelProps) {
  const badgeColor = TONE_COLOR[annotation.badgeTone] ?? '#38BDF8';

  return (
    <View style={styles.card} pointerEvents="auto">
      <View style={styles.headerRow}>
        <View style={styles.tagGroup}>
          <View style={[styles.numberBadge, { backgroundColor: accentColor }]}>
            <Text style={styles.numberText}>{annotation.number}</Text>
          </View>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{annotation.category}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${badgeColor}24`, borderColor: badgeColor },
            ]}
          >
            <Text style={[styles.statusBadgeText, { color: badgeColor }]}>
              {annotation.badgeLabel}
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          {supportsIsolate && onToggleIsolate && (
            <Pressable
              style={({ pressed }) => [
                styles.isolateBtn,
                isIsolated && { backgroundColor: accentColor, borderColor: accentColor },
                pressed && { opacity: 0.7 },
              ]}
              onPress={onToggleIsolate}
              accessibilityLabel={isIsolated ? 'Show full model' : 'Isolate component'}
            >
              <Focus size={13} color="#FFFFFF" />
            </Pressable>
          )}

          <Pressable
            style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.6 }]}
            onPress={onClose}
            accessibilityLabel="Close inspection card"
          >
            <X size={14} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      <Text style={styles.title}>{annotation.label}</Text>
      <Text style={styles.shortDesc}>
        {annotation.role} • {annotation.shortDesc}
      </Text>
      <Text style={styles.fullDesc} numberOfLines={3}>
        {annotation.fullDesc}
      </Text>

      <View style={styles.footerRow}>
        <Text style={styles.stepText}>
          Part {annotation.number} of {totalAnnotations} • {annotation.keyMetricValue}
        </Text>

        <View style={styles.navButtons}>
          <Pressable
            style={({ pressed }) => [styles.navBtn, pressed && styles.navBtnPressed]}
            onPress={onPrev}
            accessibilityLabel="Previous component"
          >
            <Text style={styles.navBtnText}>‹ Prev</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.navBtn,
              { backgroundColor: accentColor, borderColor: accentColor },
              pressed && styles.navBtnPressed,
            ]}
            onPress={onNext}
            accessibilityLabel="Next component"
          >
            <Text style={[styles.navBtnText, { fontWeight: '700' }]}>Next ›</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    bottom: 14,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.94)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
    gap: 5,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  tagGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  numberBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  categoryBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  categoryText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  isolateBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  shortDesc: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 11,
    fontWeight: '500',
  },
  fullDesc: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 12,
    lineHeight: 17,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    marginTop: 3,
  },
  stepText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  navButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  navBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  navBtnPressed: {
    opacity: 0.7,
  },
  navBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
});
