/**
 * GLModelViewer
 *
 * Reusable, model-agnostic 3D Model Viewer for Edzy (Classes 6-10).
 * Supports:
 * - Local/remote .glb models & modular procedural 3D models via useGLBLoader
 * - Orbit rotation, single-finger & two-finger panning, pinch-to-zoom, zoom buttons, double-tap & button reset
 * - Modular animation behaviors (cardiac pulse, orbital spin, wave flow, bond vibration)
 * - View modes: Solid, Cross-Section (WebGL clipping plane), Exploded assembly
 * - Component highlighting, mesh isolation, and 3D spatial target beacon
 * - Throttled 3D → 2D projected hotspot annotations & InfoPanel inspection tour
 * - Deterministic RAF cancellation & GPU memory cleanup on unmount
 */
import { GLView, ExpoWebGLRenderingContext } from 'expo-gl';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { LayoutChangeEvent, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AlertTriangle, Maximize2, Minimize2, RotateCw } from 'lucide-react-native';
import * as THREE from 'three';

import { AnnotationOverlay, ScreenPoint } from './AnnotationOverlay';
import { InfoPanel } from './InfoPanel';
import { LoadingSpinner } from './LoadingSpinner';
import { ModelControls } from './ModelControls';
import { createThreeScene } from '../hooks/useThreeScene';
import { useGLBLoader } from '../hooks/useGLBLoader';
import { useOrbitControls } from '../hooks/useOrbitControls';
import {
  resetAnimationTransform,
  runAnimationBehavior,
} from '../interactions/animationBehaviors';
import {
  applyModelVisualState,
  createFocusBeacon,
} from '../interactions/meshEffects';
import {
  ExplorerViewMode,
  InteractionMode,
  ModelComponentNode,
  ModelEntry,
} from '../interactions/types';

export interface GLModelViewerHandle {
  rotateBy: (degrees: number) => void;
  resetView: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  reload: () => void;
}

interface GLModelViewerProps {
  modelEntry: ModelEntry;
  selectedComponentId?: string | null;
  onSelectComponent?: (component: ModelComponentNode | null) => void;
  viewMode?: ExplorerViewMode;
  isolateSelected?: boolean;
  onToggleIsolate?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  compact?: boolean;
  showInlineInfoPanel?: boolean;
}

export const GLModelViewer = forwardRef<GLModelViewerHandle, GLModelViewerProps>(
  function GLModelViewer(
    {
      modelEntry,
      selectedComponentId = null,
      onSelectComponent,
      viewMode = 'solid',
      isolateSelected = false,
      onToggleIsolate,
      isFullscreen = false,
      onToggleFullscreen,
      compact = false,
      showInlineInfoPanel = true,
    },
    ref,
  ) {
    // ── Stable Three.js Refs ────────────────────────────────────────────────
    const sceneRef        = useRef<THREE.Scene | null>(null);
    const cameraRef       = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef     = useRef<THREE.WebGLRenderer | null>(null);
    const sceneDisposeRef = useRef<(() => void) | null>(null);
    const modelRootRef    = useRef<THREE.Group | null>(null);
    const focusBeaconRef  = useRef<THREE.Group | null>(null);
    const baseScaleRef    = useRef<number>(1);
    const rafRef          = useRef<number | null>(null);
    const layoutSizeRef   = useRef({ width: 360, height: 320 });
    const prevScreenRef   = useRef<Record<string, ScreenPoint>>({});

    // Refs synced with reactive props/state for the 60fps render loop
    const animEnabledRef  = useRef(modelEntry.capabilities.defaultAnimationEnabled);
    const animBehaviorRef = useRef(modelEntry.capabilities.animationBehavior);
    const showPinsRef     = useRef(modelEntry.capabilities.supportsAnnotations);
    const componentsRef   = useRef(modelEntry.components);

    // ── UI State ────────────────────────────────────────────────────────────
    const [glReady,         setGlReady]         = useState(false);
    const [wireframe,       setWireframe]       = useState(false);
    const [autoRotate,      setAutoRotate]      = useState(true);
    const [interactionMode, setInteractionModeState] = useState<InteractionMode>('orbit');
    const [animEnabled,     setAnimEnabled]     = useState(
      modelEntry.capabilities.defaultAnimationEnabled,
    );
    const [showAnnotations, setShowAnnotations] = useState(
      modelEntry.capabilities.supportsAnnotations,
    );
    const [internalSelected, setInternalSelected] = useState<ModelComponentNode | null>(null);
    const [screenPositions,  setScreenPositions]  = useState<Record<string, ScreenPoint>>({});
    const [setupError,       setSetupError]       = useState<string | null>(null);

    const selectedComponent = useMemo(() => {
      if (selectedComponentId !== undefined) {
        if (!selectedComponentId) return null;
        return (
          modelEntry.components.find((c) => c.id === selectedComponentId) ?? null
        );
      }
      return internalSelected;
    }, [selectedComponentId, internalSelected, modelEntry.components]);

    // ── Orbit & Pan Controls ────────────────────────────────────────────────
    const {
      panResponder,
      update: updateOrbit,
      reset: resetCamera,
      toggleAutoRotate,
      setAutoRotateEnabled,
      setInteractionMode,
      zoomIn,
      zoomOut,
      rotateByDegrees,
    } = useOrbitControls(cameraRef, modelEntry.cameraDefaults);

    // ── Unified GLB / Procedural Loader ─────────────────────────────────────
    const { loadState, model, error: loadError, reload } = useGLBLoader(
      modelEntry,
      sceneRef,
      glReady,
    );

    useImperativeHandle(
      ref,
      () => ({
        rotateBy: rotateByDegrees,
        resetView: resetCamera,
        zoomIn,
        zoomOut,
        reload,
      }),
      [rotateByDegrees, resetCamera, zoomIn, zoomOut, reload],
    );

    // Reset per-model viewer defaults when switching models
    useEffect(() => {
      const nextAnim = modelEntry.capabilities.defaultAnimationEnabled;
      const nextPins = modelEntry.capabilities.supportsAnnotations;
      setAnimEnabled(nextAnim);
      animEnabledRef.current = nextAnim;
      animBehaviorRef.current = modelEntry.capabilities.animationBehavior;
      setShowAnnotations(nextPins);
      showPinsRef.current = nextPins;
      componentsRef.current = modelEntry.components;
      setWireframe(false);
      setAutoRotate(true);
      setAutoRotateEnabled(true);
      setInteractionModeState('orbit');
      setInteractionMode('orbit');
      setInternalSelected(null);
      prevScreenRef.current = {};
      setScreenPositions({});
      resetCamera();
    }, [modelEntry, resetCamera, setAutoRotateEnabled, setInteractionMode]);

    // Mount model ref + spatial focus beacon
    useEffect(() => {
      if (!model) {
        modelRootRef.current = null;
        focusBeaconRef.current = null;
        return;
      }
      modelRootRef.current = model;
      baseScaleRef.current = model.scale.x || 1;

      const beacon = createFocusBeacon(modelEntry.accentColor);
      model.add(beacon);
      focusBeaconRef.current = beacon;

      return () => {
        model.remove(beacon);
        focusBeaconRef.current = null;
      };
    }, [model, modelEntry.accentColor]);

    // Apply visual effects (wireframe, isolate, highlight, cross-section, explode, beacon)
    useEffect(() => {
      if (!model) return;
      applyModelVisualState({
        root: model,
        beacon: focusBeaconRef.current,
        selectedComponent,
        isolateSelected,
        wireframe,
        viewMode,
        accentColor: modelEntry.accentColor,
      });
    }, [model, selectedComponent, isolateSelected, wireframe, viewMode, modelEntry.accentColor]);

    useEffect(() => {
      animEnabledRef.current = animEnabled;
      if (!animEnabled && modelRootRef.current) {
        resetAnimationTransform(modelRootRef.current, baseScaleRef.current);
      }
    }, [animEnabled]);

    useEffect(() => {
      showPinsRef.current = showAnnotations;
    }, [showAnnotations]);

    // Cleanup RAF & Three.js GPU resources on unmount
    useEffect(() => {
      return () => {
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        sceneDisposeRef.current?.();
        sceneDisposeRef.current = null;
        rendererRef.current = null;
        sceneRef.current = null;
        cameraRef.current = null;
      };
    }, []);

    // ── Handle view layout & camera aspect ratio ────────────────────────────
    const onLayout = useCallback((e: LayoutChangeEvent) => {
      const { width, height } = e.nativeEvent.layout;
      if (width > 0 && height > 0) {
        layoutSizeRef.current = { width, height };
        if (cameraRef.current) {
          cameraRef.current.aspect = width / height;
          cameraRef.current.updateProjectionMatrix();
        }
      }
    }, []);

    // ── Throttled 3D → 2D Hotspot Projection ────────────────────────────────
    const updateHotspotProjections = useCallback(() => {
      const components = componentsRef.current;
      if (
        !showPinsRef.current ||
        !cameraRef.current ||
        !modelRootRef.current ||
        components.length === 0
      ) {
        return;
      }

      const camera = cameraRef.current;
      const root = modelRootRef.current;
      const { width, height } = layoutSizeRef.current;
      const invScale = root.scale.x !== 0 ? 1 / root.scale.x : 1;

      const newPositions: Record<string, ScreenPoint> = {};
      const worldPos = new THREE.Vector3();
      const camToPoint = new THREE.Vector3();
      const normalApprox = new THREE.Vector3();

      let changed = Object.keys(prevScreenRef.current).length !== components.length;

      for (const comp of components) {
        worldPos.set(
          comp.position[0] * invScale,
          comp.position[1] * invScale,
          comp.position[2] * invScale,
        );
        worldPos.applyMatrix4(root.matrixWorld);

        normalApprox.copy(worldPos).normalize();
        camToPoint.copy(camera.position).sub(worldPos).normalize();
        const isFacing = normalApprox.dot(camToPoint) > -0.25;

        const projected = worldPos.clone().project(camera);
        const isInFront = projected.z < 1;
        const x = (projected.x * 0.5 + 0.5) * width;
        const y = (-projected.y * 0.5 + 0.5) * height;
        const inScreen = x >= -24 && x <= width + 24 && y >= -24 && y <= height + 24;
        const visible = isInFront && inScreen && isFacing;

        newPositions[comp.id] = { x, y, visible };

        const prev = prevScreenRef.current[comp.id];
        if (
          !prev ||
          prev.visible !== visible ||
          Math.abs(prev.x - x) > 0.75 ||
          Math.abs(prev.y - y) > 0.75
        ) {
          changed = true;
        }
      }

      if (changed) {
        prevScreenRef.current = newPositions;
        setScreenPositions(newPositions);
      }
    }, []);

    // ── GL Context Created ──────────────────────────────────────────────────
    const onContextCreate = useCallback(
      (gl: ExpoWebGLRenderingContext) => {
        try {
          const { renderer, scene, camera, dispose } = createThreeScene(gl);
          const { width, height } = layoutSizeRef.current;
          if (width > 0 && height > 0) {
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
          }

          rendererRef.current = renderer;
          sceneRef.current = scene;
          cameraRef.current = camera;
          sceneDisposeRef.current = dispose;

          setGlReady(true);

          let frameCount = 0;
          let lastTime = performance.now();

          const loop = () => {
            rafRef.current = requestAnimationFrame(loop);
            frameCount++;

            const now = performance.now();
            const deltaSec = Math.min(0.1, (now - lastTime) / 1000);
            lastTime = now;

            updateOrbit();

            if (animEnabledRef.current && modelRootRef.current) {
              runAnimationBehavior(animBehaviorRef.current, {
                root: modelRootRef.current,
                baseScale: baseScaleRef.current,
                elapsedSec: now / 1000,
                deltaSec,
              });
            }

            if (focusBeaconRef.current?.visible) {
              const halo = focusBeaconRef.current.children[1];
              if (halo && cameraRef.current) {
                halo.lookAt(cameraRef.current.position);
                const pulse = 1 + 0.16 * Math.sin(now * 0.006);
                halo.scale.setScalar(pulse);
              }
            }

            renderer.render(scene, camera);
            gl.endFrameEXP();

            if (frameCount % 2 === 0) {
              updateHotspotProjections();
            }
          };

          loop();
        } catch (err) {
          setSetupError(err instanceof Error ? err.message : String(err));
        }
      },
      [updateOrbit, updateHotspotProjections],
    );

    // ── Reusable Viewer Control Handlers ────────────────────────────────────
    const handleSelectComponent = useCallback(
      (comp: ModelComponentNode | null) => {
        if (onSelectComponent) {
          onSelectComponent(comp);
        } else {
          setInternalSelected(comp);
        }
      },
      [onSelectComponent],
    );

    const handleToggleWireframe = useCallback(() => {
      setWireframe((w) => !w);
    }, []);

    const handleToggleAutoRotate = useCallback(() => {
      const next = toggleAutoRotate();
      setAutoRotate(next);
    }, [toggleAutoRotate]);

    const handleToggleInteractionMode = useCallback(() => {
      setInteractionModeState((prev) => {
        const next: InteractionMode = prev === 'orbit' ? 'pan' : 'orbit';
        setInteractionMode(next);
        return next;
      });
    }, [setInteractionMode]);

    const handleToggleAnimation = useCallback(() => {
      setAnimEnabled((prev) => !prev);
    }, []);

    const handleToggleAnnotations = useCallback(() => {
      setShowAnnotations((prev) => {
        const next = !prev;
        if (!next) handleSelectComponent(null);
        return next;
      });
    }, [handleSelectComponent]);

    const handleNextAnnotation = useCallback(() => {
      const list = modelEntry.components;
      if (list.length === 0) return;
      if (!selectedComponent) {
        handleSelectComponent(list[0]);
        return;
      }
      const idx = list.findIndex((a) => a.id === selectedComponent.id);
      handleSelectComponent(list[(idx + 1) % list.length]);
    }, [modelEntry.components, selectedComponent, handleSelectComponent]);

    const handlePrevAnnotation = useCallback(() => {
      const list = modelEntry.components;
      if (list.length === 0) return;
      if (!selectedComponent) {
        handleSelectComponent(list[list.length - 1]);
        return;
      }
      const idx = list.findIndex((a) => a.id === selectedComponent.id);
      handleSelectComponent(list[(idx - 1 + list.length) % list.length]);
    }, [modelEntry.components, selectedComponent, handleSelectComponent]);

    if (setupError) {
      return (
        <View style={styles.fullError}>
          <AlertTriangle size={28} color="#FB7185" />
          <Text style={styles.errorTitle}>3D Renderer Error</Text>
          <Text style={styles.errorDetail}>{setupError}</Text>
          {onToggleFullscreen && (
            <TouchableOpacity
              style={[styles.expandFabError, { borderColor: modelEntry.accentColor }]}
              onPress={onToggleFullscreen}
              activeOpacity={0.8}
            >
              <Maximize2 size={14} color={modelEntry.accentColor} />
              <Text style={[styles.expandFabErrorText, { color: modelEntry.accentColor }]}>
                {isFullscreen ? 'Exit Fullscreen' : 'Try Fullscreen'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    const showInfoCard = Boolean(showInlineInfoPanel && selectedComponent);

    return (
      <View style={styles.container} onLayout={onLayout} {...panResponder.panHandlers}>
        <GLView style={styles.glSurface} onContextCreate={onContextCreate} />

        {/* ── Persistent Expand / Collapse FAB (always visible, top-right) ── */}
        {onToggleFullscreen && (
          <TouchableOpacity
            style={[
              styles.expandFab,
              isFullscreen && styles.expandFabActive,
              { borderColor: isFullscreen ? modelEntry.accentColor : 'rgba(255,255,255,0.28)' },
            ]}
            onPress={onToggleFullscreen}
            activeOpacity={0.8}
            accessibilityLabel={isFullscreen ? 'Exit fullscreen viewer' : 'Open fullscreen 3D viewer'}
            accessibilityRole="button"
          >
            {isFullscreen ? (
              <Minimize2 size={16} color="#FFFFFF" />
            ) : (
              <Maximize2 size={16} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        )}

        {(loadState === 'idle' || loadState === 'loading') && (
          <LoadingSpinner
            message={`Loading ${modelEntry.name}…`}
            accentColor={modelEntry.accentColor}
          />
        )}

        {loadState === 'error' && (
          <View style={styles.inlineError}>
            <AlertTriangle size={26} color="#FB7185" />
            <Text style={styles.errorTitle}>Failed to load 3D model</Text>
            <Text style={styles.errorDetail}>{loadError}</Text>
            <TouchableOpacity
              style={[styles.retryBtn, { backgroundColor: modelEntry.accentColor }]}
              onPress={reload}
              activeOpacity={0.8}
            >
              <RotateCw size={14} color="#FFFFFF" />
              <Text style={styles.retryBtnText}>Retry Load</Text>
            </TouchableOpacity>
          </View>
        )}

        {loadState === 'loaded' && (
          <AnnotationOverlay
            annotations={modelEntry.components}
            screenPositions={screenPositions}
            selectedId={selectedComponent?.id ?? null}
            onSelect={(item) => handleSelectComponent(item)}
            visible={showAnnotations}
            accentColor={modelEntry.accentColor}
          />
        )}

        {loadState === 'loaded' && (
          <ModelControls
            onReset={resetCamera}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            interactionMode={interactionMode}
            onToggleInteractionMode={handleToggleInteractionMode}
            wireframe={wireframe}
            onToggleWireframe={handleToggleWireframe}
            autoRotate={autoRotate}
            onToggleAutoRotate={handleToggleAutoRotate}
            showAnnotations={showAnnotations}
            onToggleAnnotations={handleToggleAnnotations}
            supportsAnnotations={modelEntry.capabilities.supportsAnnotations}
            animationEnabled={animEnabled}
            onToggleAnimation={handleToggleAnimation}
            supportsAnimation={modelEntry.capabilities.supportsAnimations}
            animationStatusText={modelEntry.capabilities.animationStatusText}
            isolateSelected={isolateSelected}
            onToggleIsolate={onToggleIsolate}
            canIsolate={Boolean(
              modelEntry.capabilities.supportsPartIsolation &&
                selectedComponent &&
                onToggleIsolate,
            )}
            isFullscreen={isFullscreen}
            onToggleFullscreen={undefined}
            isInfoPanelOpen={showInfoCard}
            accentColor={modelEntry.accentColor}
            compact={compact}
          />
        )}

        {showInfoCard && selectedComponent && (
          <InfoPanel
            annotation={selectedComponent}
            totalAnnotations={modelEntry.components.length}
            onClose={() => handleSelectComponent(null)}
            onNext={handleNextAnnotation}
            onPrev={handlePrevAnnotation}
            accentColor={modelEntry.accentColor}
            supportsIsolate={modelEntry.capabilities.supportsPartIsolation}
            isIsolated={isolateSelected}
            onToggleIsolate={onToggleIsolate}
          />
        )}

        {modelEntry.attribution && modelEntry.name !== 'Human Heart' && !showInfoCard && !compact && (
          <View style={styles.attributionPill} pointerEvents="none">
            <Text style={styles.attributionText}>
              {modelEntry.attribution.title} • {modelEntry.attribution.author} (
              {modelEntry.attribution.license})
            </Text>
          </View>
        )}

        <View style={[styles.accentBar, { backgroundColor: modelEntry.accentColor }]} />
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#777777',
    overflow: 'hidden',
  },
  glSurface: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  fullError: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#777777',
    gap: 8,
    padding: 24,
  },
  inlineError: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(80, 80, 80, 0.92)',
    gap: 8,
    padding: 24,
  },
  errorTitle: {
    color: '#FDA4AF',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  errorDetail: {
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 17,
  },
  retryBtn: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  attributionPill: {
    position: 'absolute',
    bottom: 6,
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  attributionText: {
    color: 'rgba(255, 255, 255, 0.35)',
    fontSize: 9,
    textAlign: 'center',
  },
  accentBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    opacity: 0.85,
  },
  // ── Persistent expand / collapse FAB ──────────────────────────────────────
  expandFab: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 6,
    zIndex: 20,
  },
  expandFabActive: {
    backgroundColor: 'rgba(30, 20, 60, 0.92)',
  },
  expandFabError: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(15,23,42,0.6)',
    borderWidth: 1,
  },
  expandFabErrorText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
