/**
 * ModelControls
 *
 * Reusable floating 3D control overlay shared across every model in the workspace.
 * Supports:
 * - Left column  : Zoom In, Zoom Out, Orbit/Pan gesture toggle, Animation toggle
 * - Right column : Fullscreen, Reset View, Labels/Hotspots toggle, Wireframe, Auto-Rotate, Isolate
 */
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  Activity,
  Box,
  Focus,
  MapPin,
  Maximize2,
  Minimize2,
  Move,
  RefreshCw,
  RotateCcw,
  Rotate3d,
  ZoomIn,
  ZoomOut,
} from 'lucide-react-native';
import { InteractionMode } from '../interactions/types';

interface ModelControlsProps {
  onReset: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  interactionMode: InteractionMode;
  onToggleInteractionMode: () => void;
  wireframe: boolean;
  onToggleWireframe: () => void;
  autoRotate: boolean;
  onToggleAutoRotate: () => void;
  showAnnotations: boolean;
  onToggleAnnotations: () => void;
  supportsAnnotations?: boolean;
  animationEnabled: boolean;
  onToggleAnimation: () => void;
  supportsAnimation?: boolean;
  animationStatusText?: string;
  isolateSelected?: boolean;
  onToggleIsolate?: () => void;
  canIsolate?: boolean;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  isInfoPanelOpen?: boolean;
  accentColor?: string;
  compact?: boolean;
}

interface ControlButtonProps {
  onPress: () => void;
  active?: boolean;
  accentColor?: string;
  accessibilityLabel: string;
  size: number;
  children: React.ReactNode;
}

function ControlButton({
  onPress,
  active,
  accentColor = '#4F46E5',
  accessibilityLabel,
  size,
  children,
}: ControlButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        { width: size, height: size, borderRadius: size / 2 },
        active && {
          backgroundColor: `${accentColor}CC`,
          borderColor: accentColor,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
    >
      {children}
    </TouchableOpacity>
  );
}

export function ModelControls({
  onReset,
  onZoomIn,
  onZoomOut,
  interactionMode,
  onToggleInteractionMode,
  wireframe,
  onToggleWireframe,
  autoRotate,
  onToggleAutoRotate,
  showAnnotations,
  onToggleAnnotations,
  supportsAnnotations = true,
  animationEnabled,
  onToggleAnimation,
  supportsAnimation = false,
  animationStatusText,
  isolateSelected = false,
  onToggleIsolate,
  canIsolate = false,
  isFullscreen = false,
  onToggleFullscreen,
  isInfoPanelOpen = false,
  accentColor = '#4F46E5',
  compact = false,
}: ModelControlsProps) {
  const btnSize = compact ? 34 : 40;
  const iconSize = compact ? 15 : 17;

  return (
    <View
      style={[
        styles.root,
        compact && styles.rootCompact,
        isInfoPanelOpen && styles.rootPanelShifted,
      ]}
      pointerEvents="box-none"
    >
      {/* Left Column: Zoom, Pan/Orbit, Animation */}
      <View style={styles.column}>
        <ControlButton
          size={btnSize}
          onPress={onZoomIn}
          accessibilityLabel="Zoom in"
        >
          <ZoomIn size={iconSize} color="#FFFFFF" />
        </ControlButton>

        <ControlButton
          size={btnSize}
          onPress={onZoomOut}
          accessibilityLabel="Zoom out"
        >
          <ZoomOut size={iconSize} color="#FFFFFF" />
        </ControlButton>

        <ControlButton
          size={btnSize}
          onPress={onToggleInteractionMode}
          active={interactionMode === 'pan'}
          accentColor="#0EA5E9"
          accessibilityLabel={
            interactionMode === 'pan' ? 'Switch to orbit rotate' : 'Switch to single-finger pan'
          }
        >
          {interactionMode === 'pan' ? (
            <Move size={iconSize} color="#FFFFFF" />
          ) : (
            <Rotate3d size={iconSize} color="#FFFFFF" />
          )}
        </ControlButton>

        {supportsAnimation && (
          <ControlButton
            size={btnSize}
            onPress={onToggleAnimation}
            active={animationEnabled}
            accentColor={accentColor}
            accessibilityLabel={animationEnabled ? 'Pause animation' : 'Play animation'}
          >
            <Activity size={iconSize} color="#FFFFFF" />
          </ControlButton>
        )}
      </View>

      {/* Right Column: Fullscreen, Reset, Pins, Wireframe, Auto-Rotate, Isolate */}
      <View style={styles.column}>
        {onToggleFullscreen && (
          <ControlButton
            size={btnSize}
            onPress={onToggleFullscreen}
            active={isFullscreen}
            accentColor={accentColor}
            accessibilityLabel={isFullscreen ? 'Exit fullscreen' : 'Open fullscreen viewer'}
          >
            {isFullscreen ? (
              <Minimize2 size={iconSize} color="#FFFFFF" />
            ) : (
              <Maximize2 size={iconSize} color="#FFFFFF" />
            )}
          </ControlButton>
        )}

        <ControlButton
          size={btnSize}
          onPress={onReset}
          accessibilityLabel="Reset camera view"
        >
          <RotateCcw size={iconSize} color="#FFFFFF" />
        </ControlButton>

        {supportsAnnotations && (
          <ControlButton
            size={btnSize}
            onPress={onToggleAnnotations}
            active={showAnnotations}
            accentColor="#38BDF8"
            accessibilityLabel={showAnnotations ? 'Hide labels' : 'Show labels'}
          >
            <MapPin size={iconSize} color="#FFFFFF" />
          </ControlButton>
        )}

        {canIsolate && onToggleIsolate && (
          <ControlButton
            size={btnSize}
            onPress={onToggleIsolate}
            active={isolateSelected}
            accentColor={accentColor}
            accessibilityLabel={isolateSelected ? 'Show full assembly' : 'Isolate selected part'}
          >
            <Focus size={iconSize} color="#FFFFFF" />
          </ControlButton>
        )}

        <ControlButton
          size={btnSize}
          onPress={onToggleWireframe}
          active={wireframe}
          accentColor="#A855F7"
          accessibilityLabel={wireframe ? 'Disable wireframe' : 'Enable wireframe'}
        >
          <Box size={iconSize} color="#FFFFFF" />
        </ControlButton>

        <ControlButton
          size={btnSize}
          onPress={onToggleAutoRotate}
          active={autoRotate}
          accentColor="#F59E0B"
          accessibilityLabel={autoRotate ? 'Stop auto-rotate' : 'Start auto-rotate'}
        >
          <RefreshCw size={iconSize} color="#FFFFFF" />
        </ControlButton>
      </View>

      {/* Subtle status pill when animation or pan mode is active */}
      {!isInfoPanelOpen && (interactionMode === 'pan' || (supportsAnimation && animationEnabled && animationStatusText)) && (
        <View style={styles.statusPill} pointerEvents="none">
          <Text style={[styles.statusText, { borderColor: `${accentColor}66` }]} numberOfLines={1}>
            {interactionMode === 'pan'
              ? 'Pan Mode • Drag to move model'
              : animationStatusText}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    bottom: 18,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  rootCompact: {
    bottom: 10,
    left: 10,
    right: 10,
  },
  rootPanelShifted: {
    bottom: 196,
  },
  column: {
    gap: 7,
    alignItems: 'center',
  },
  button: {
    backgroundColor: 'rgba(15, 23, 42, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 4,
  },
  statusPill: {
    position: 'absolute',
    bottom: 2,
    left: 48,
    right: 48,
    alignItems: 'center',
  },
  statusText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 10,
    fontWeight: '600',
    backgroundColor: 'rgba(15, 23, 42, 0.86)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    letterSpacing: 0.3,
    overflow: 'hidden',
  },
});
