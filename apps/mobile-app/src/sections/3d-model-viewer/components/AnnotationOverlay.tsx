/**
 * AnnotationOverlay
 * Renders 2D educational hotspot pins projected from 3D model coordinates
 * over the Expo GL canvas.
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ModelComponentNode } from '../interactions/types';

export interface ScreenPoint {
  x: number;
  y: number;
  visible: boolean;
}

interface AnnotationOverlayProps {
  annotations: ModelComponentNode[];
  screenPositions: Record<string, ScreenPoint>;
  selectedId: string | null;
  onSelect: (item: ModelComponentNode) => void;
  visible: boolean;
  accentColor?: string;
}

export function AnnotationOverlay({
  annotations,
  screenPositions,
  selectedId,
  onSelect,
  visible,
  accentColor = '#4F46E5',
}: AnnotationOverlayProps) {
  if (!visible || annotations.length === 0) return null;

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
              <View
                style={[
                  styles.pulseRing,
                  isSelected && styles.pulseRingSelected,
                  { borderColor: isSelected ? accentColor : '#FFFFFF' },
                ]}
              />

              <View
                style={[
                  styles.pinBadge,
                  { backgroundColor: isSelected ? accentColor : 'rgba(255,255,255,0.94)' },
                ]}
              >
                <Text
                  style={[
                    styles.pinText,
                    { color: isSelected ? '#FFFFFF' : '#0F172A' },
                  ]}
                >
                  {item.number}
                </Text>
              </View>

              {isSelected && (
                <View style={[styles.floatingTag, { borderColor: `${accentColor}99` }]}>
                  <Text style={styles.floatingTagText} numberOfLines={1}>
                    {item.label}
                  </Text>
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
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    opacity: 0.45,
  },
  pulseRingSelected: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 13,
  },
  floatingTag: {
    position: 'absolute',
    top: -26,
    backgroundColor: 'rgba(15, 23, 42, 0.94)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    minWidth: 68,
    alignItems: 'center',
  },
  floatingTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
