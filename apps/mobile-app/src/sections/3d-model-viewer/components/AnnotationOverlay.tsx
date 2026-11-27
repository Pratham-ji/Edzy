/**
 * AnnotationOverlay
 * Renders 2D anatomical hotspot pins mapped from 3D coordinates
 * over the Expo GL canvas.
 */
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ModelAnnotation } from '../data/models';

export interface ScreenPoint {
  x: number;
  y: number;
  visible: boolean;
}

interface AnnotationOverlayProps {
  annotations: ModelAnnotation[];
  screenPositions: Record<string, ScreenPoint>;
  selectedId: string | null;
  onSelect: (item: ModelAnnotation) => void;
  visible: boolean;
  accentColor?: string;
}

export function AnnotationOverlay({
  annotations,
  screenPositions,
  selectedId,
  onSelect,
  visible,
  accentColor = '#E74C3C',
}: AnnotationOverlayProps) {
  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {annotations.map((item) => {
        const point = screenPositions[item.id];
        if (!point || !point.visible) return null;

        const isSelected = selectedId === item.id;

        return (
          <View
            key={item.id}
            style={[
              styles.pinContainer,
              {
                left: point.x,
                top: point.y,
              },
            ]}
            pointerEvents="box-none"
          >
            <Pressable
              style={({ pressed }) => [
                styles.touchTarget,
                pressed && { transform: [{ scale: 1.15 }] },
              ]}
              onPress={() => onSelect(item)}
              accessibilityLabel={`Hotspot ${item.number}: ${item.label}`}
              accessibilityRole="button"
            >
              {/* Pulse effect for selected or unselected */}
              <View
                style={[
                  styles.pulseRing,
                  isSelected && styles.pulseRingSelected,
                  { borderColor: isSelected ? accentColor : '#fff' },
                ]}
              />

              {/* Center Pin Button */}
              <View
                style={[
                  styles.pinBadge,
                  { backgroundColor: isSelected ? accentColor : 'rgba(255,255,255,0.92)' },
                ]}
              >
                <ThemedText
                  style={[
                    styles.pinText,
                    { color: isSelected ? '#ffffff' : '#111222' },
                  ]}
                >
                  {item.number}
                </ThemedText>
              </View>

              {/* Floating Label when selected or compact tag */}
              {isSelected && (
                <View style={[styles.floatingTag, { borderColor: accentColor + '88' }]}>
                  <ThemedText style={styles.floatingTagText} numberOfLines={1}>
                    {item.label}
                  </ThemedText>
                </View>
              )}
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

const PIN_SIZE = 24;

const styles = StyleSheet.create({
  pinContainer: {
    position: 'absolute',
    width: 0,
    height: 0,
    overflow: 'visible',
    alignItems: 'center',
    justifyContent: 'center',
  },
  touchTarget: {
    width: 44,
    height: 44,
    marginLeft: -22,
    marginTop: -22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    opacity: 0.45,
  },
  pulseRingSelected: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    opacity: 0.9,
  },
  pinBadge: {
    width: PIN_SIZE,
    height: PIN_SIZE,
    borderRadius: PIN_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  pinText: {
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 14,
  },
  floatingTag: {
    position: 'absolute',
    top: -26,
    backgroundColor: 'rgba(17, 18, 34, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  floatingTagText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
});
