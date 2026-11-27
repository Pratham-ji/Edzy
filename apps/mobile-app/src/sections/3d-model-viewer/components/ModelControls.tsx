/**
 * ModelControls — Phase 3 (Hotspots, Heartbeat, Zoom & Camera)
 *
 * Floating control panel rendered on top of the GL canvas.
 *
 * Controls
 * ────────
 * Left column  : Zoom in (＋), Zoom out (－), Heartbeat Pulse (💓)
 * Right column : Reset View (↺), Wireframe (⬡), Auto-rotate (⟳), Annotations (📌)
 */
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

interface ModelControlsProps {
  onReset: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  wireframe: boolean;
  onToggleWireframe: () => void;
  autoRotate: boolean;
  onToggleAutoRotate: () => void;
  showAnnotations: boolean;
  onToggleAnnotations: () => void;
  heartbeat: boolean;
  onToggleHeartbeat: () => void;
  isInfoPanelOpen?: boolean;
}

interface ControlButtonProps {
  label: string;
  onPress: () => void;
  active?: boolean;
  accentColor?: string;
  accessibilityLabel: string;
}

function ControlButton({
  label,
  onPress,
  active,
  accentColor = '#E74C3C',
  accessibilityLabel,
}: ControlButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        active && {
          backgroundColor: accentColor + '88',
          borderColor: accentColor,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.72}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
    >
      <ThemedText style={[styles.buttonText, active && styles.buttonTextActive]}>
        {label}
      </ThemedText>
    </TouchableOpacity>
  );
}

export function ModelControls({
  onReset,
  onZoomIn,
  onZoomOut,
  wireframe,
  onToggleWireframe,
  autoRotate,
  onToggleAutoRotate,
  showAnnotations,
  onToggleAnnotations,
  heartbeat,
  onToggleHeartbeat,
  isInfoPanelOpen = false,
}: ModelControlsProps) {
  return (
    <View
      style={[
        styles.root,
        isInfoPanelOpen && styles.rootPanelShifted,
      ]}
      pointerEvents="box-none"
    >
      {/* Left Column: Zoom & Heartbeat */}
      <View style={styles.column}>
        <ControlButton
          label="＋"
          onPress={onZoomIn}
          accessibilityLabel="Zoom in"
        />
        <ControlButton
          label="－"
          onPress={onZoomOut}
          accessibilityLabel="Zoom out"
        />
        <ControlButton
          label={heartbeat ? '💓' : '🤍'}
          onPress={onToggleHeartbeat}
          active={heartbeat}
          accentColor="#E74C3C"
          accessibilityLabel={heartbeat ? 'Stop heartbeat simulation' : 'Start heartbeat simulation'}
        />
      </View>

      {/* Right Column: Interactive Modes */}
      <View style={styles.column}>
        <ControlButton
          label="↺"
          onPress={onReset}
          accessibilityLabel="Reset camera pose"
        />
        <ControlButton
          label="📌"
          onPress={onToggleAnnotations}
          active={showAnnotations}
          accentColor="#3498DB"
          accessibilityLabel={showAnnotations ? 'Hide anatomical pins' : 'Show anatomical pins'}
        />
        <ControlButton
          label="⬡"
          onPress={onToggleWireframe}
          active={wireframe}
          accentColor="#9B59B6"
          accessibilityLabel={wireframe ? 'Disable wireframe mode' : 'Enable wireframe mode'}
        />
        <ControlButton
          label="⟳"
          onPress={onToggleAutoRotate}
          active={autoRotate}
          accentColor="#F39C12"
          accessibilityLabel={autoRotate ? 'Stop auto-rotate' : 'Start auto-rotate'}
        />
      </View>

      {/* Rhythmic BPM indicator banner when heartbeat active */}
      {heartbeat && !isInfoPanelOpen && (
        <View style={styles.statusPill}>
          <ThemedText style={styles.statusText}>72 BPM • Cardiac Cycle active</ThemedText>
        </View>
      )}
    </View>
  );
}

const BTN = 44;

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    bottom: 34,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  rootPanelShifted: {
    bottom: 230,
  },
  column: {
    gap: 10,
    alignItems: 'center',
  },
  button: {
    width: BTN,
    height: BTN,
    borderRadius: BTN / 2,
    backgroundColor: 'rgba(20, 22, 40, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonTextActive: {
    color: '#ffffff',
  },
  statusPill: {
    position: 'absolute',
    bottom: 4,
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'none',
  },
  statusText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 11,
    fontWeight: '600',
    backgroundColor: 'rgba(15, 16, 30, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(231, 76, 60, 0.4)',
    letterSpacing: 0.5,
  },
});
