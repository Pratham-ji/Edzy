/**
 * GLModelViewer — Phase 3
 *
 * Implements:
 * 1. 3D GL View & Three.js rendering pipeline
 * 2. Touch OrbitControls (rotate, pinch-to-zoom, auto-rotate, double-tap reset)
 * 3. Heartbeat cardiac cycle pulse simulation (72 BPM rhythmic lub-dub)
 * 4. 3D → 2D Screen Coordinate Projection for educational annotations
 * 5. Interactive Hotspot Pins & Info Drawer for STEM anatomy
 * 6. CC-BY-4.0 Attribution credit sheet
 */
import { GLView, ExpoWebGLRenderingContext } from 'expo-gl';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import * as THREE from 'three';

import { ThemedText } from '@/components/themed-text';
import { AnnotationOverlay, ScreenPoint } from './AnnotationOverlay';
import { InfoPanel } from './InfoPanel';
import { LoadingSpinner } from './LoadingSpinner';
import { ModelControls } from './ModelControls';
import { createThreeScene } from '../hooks/useThreeScene';
import { useGLBLoader } from '../hooks/useGLBLoader';
import { useOrbitControls } from '../hooks/useOrbitControls';
import { ModelAnnotation } from '../data/models';

interface GLModelViewerProps {
  modelAsset: number;
  accentColor?: string;
  annotations?: ModelAnnotation[];
  attribution?: {
    title: string;
    author: string;
    license: string;
    sourceUrl: string;
  };
}

export function GLModelViewer({
  modelAsset,
  accentColor = '#E74C3C',
  annotations = [],
  attribution,
}: GLModelViewerProps) {
  // ── Stable Three.js Refs ──────────────────────────────────────────────────
  const sceneRef       = useRef<THREE.Scene | null>(null);
  const cameraRef      = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef    = useRef<THREE.WebGLRenderer | null>(null);
  const modelRootRef   = useRef<THREE.Group | null>(null);
  const baseScaleRef   = useRef<number>(1);
  const rafRef         = useRef<number | null>(null);
  const wireRef        = useRef(false);
  const heartbeatRef   = useRef(true);
  const showPinsRef    = useRef(true);

  // ── Layout dimensions for 2D screen projection ────────────────────────────
  const layoutSizeRef  = useRef({ width: 360, height: 640 });

  // ── UI State ──────────────────────────────────────────────────────────────
  const [glReady,            setGlReady]            = useState(false);
  const [wireframe,          setWireframe]          = useState(false);
  const [autoRotate,         setAutoRotate]         = useState(false);
  const [heartbeat,          setHeartbeat]          = useState(true);
  const [showAnnotations,    setShowAnnotations]    = useState(true);
  const [selectedAnnotation, setSelectedAnnotation] = useState<ModelAnnotation | null>(null);
  const [screenPositions,    setScreenPositions]    = useState<Record<string, ScreenPoint>>({});
  const [setupError,         setSetupError]         = useState<string | null>(null);

  // ── Orbit Controls ────────────────────────────────────────────────────────
  const {
    panResponder,
    update: updateOrbit,
    reset: resetCamera,
    toggleAutoRotate,
    zoomIn,
    zoomOut,
  } = useOrbitControls(cameraRef);

  // ── GLB Loader ────────────────────────────────────────────────────────────
  const { loadState, model, error: loadError } = useGLBLoader(modelAsset, sceneRef, glReady);

  useEffect(() => {
    if (model) {
      modelRootRef.current = model;
      baseScaleRef.current = model.scale.x;
    }
  }, [model]);

  // Keep refs in sync with state for access inside the render loop
  useEffect(() => {
    heartbeatRef.current = heartbeat;
  }, [heartbeat]);

  useEffect(() => {
    showPinsRef.current = showAnnotations;
  }, [showAnnotations]);

  // ── Handle view layout ────────────────────────────────────────────────────
  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) {
      layoutSizeRef.current = { width, height };
    }
  }, []);

  // ── Calculate 2D Screen Positions for 3D Hotspots ─────────────────────────
  const updateHotspotProjections = useCallback(() => {
    if (
      !showPinsRef.current ||
      !cameraRef.current ||
      !modelRootRef.current ||
      annotations.length === 0
    ) {
      return;
    }

    const camera = cameraRef.current;
    const root = modelRootRef.current;
    const { width, height } = layoutSizeRef.current;

    const newPositions: Record<string, ScreenPoint> = {};

    // Temporary vectors
    const worldPos = new THREE.Vector3();
    const camToPoint = new THREE.Vector3();
    const normalApprox = new THREE.Vector3();

    for (const ann of annotations) {
      worldPos.set(ann.position[0], ann.position[1], ann.position[2]);
      worldPos.applyMatrix4(root.matrixWorld);

      // Occlusion heuristic: check if normal faces towards the camera
      normalApprox.copy(worldPos).normalize();
      camToPoint.copy(camera.position).sub(worldPos).normalize();
      const dot = normalApprox.dot(camToPoint);
      const isFacing = dot > -0.25;

      // Project into NDC [-1, 1]
      const projected = worldPos.clone().project(camera);

      // Check camera frustum bounds
      const isInFront = projected.z < 1;
      const x = (projected.x * 0.5 + 0.5) * width;
      const y = (-projected.y * 0.5 + 0.5) * height;
      const inScreen = x >= -30 && x <= width + 30 && y >= -30 && y <= height + 30;

      newPositions[ann.id] = {
        x,
        y,
        visible: isInFront && inScreen && isFacing,
      };
    }

    setScreenPositions(newPositions);
  }, [annotations]);

  // ── GL Context Created ────────────────────────────────────────────────────
  const onContextCreate = useCallback((gl: ExpoWebGLRenderingContext) => {
    try {
      const { renderer, scene, camera } = createThreeScene(gl);
      rendererRef.current = renderer;
      sceneRef.current    = scene;
      cameraRef.current   = camera;

      setGlReady(true);

      let frameCount = 0;

      // ── Main Animation & Simulation Loop ──────────────────────────────────
      const loop = () => {
        rafRef.current = requestAnimationFrame(loop);
        frameCount++;

        // 1. Update camera inertia / auto-spin
        updateOrbit();

        // 2. Cardiac Heartbeat Simulation (72 BPM)
        if (heartbeatRef.current && modelRootRef.current) {
          const t = (performance.now() / 1000) % 0.833; // 72 bpm = 0.833s period
          let pulse = 0;

          if (t < 0.12) {
            // Atrial Systole (lub)
            pulse = Math.sin((t / 0.12) * Math.PI) * 0.035;
          } else if (t >= 0.18 && t < 0.35) {
            // Ventricular Systole (dub - stronger)
            pulse = Math.sin(((t - 0.18) / 0.17) * Math.PI) * 0.06;
          }

          const currentScale = baseScaleRef.current * (1 + pulse);
          modelRootRef.current.scale.set(currentScale, currentScale, currentScale);
        }

        // 3. Render 3D Frame
        renderer.render(scene, camera);
        gl.endFrameEXP();

        // 4. Update Hotspot 2D Overlay (every 2 frames for smooth 30-60fps UI)
        if (frameCount % 2 === 0) {
          updateHotspotProjections();
        }
      };

      loop();
    } catch (err) {
      setSetupError(err instanceof Error ? err.message : String(err));
    }
  }, [updateOrbit, updateHotspotProjections]);

  // ── Interactive Controls Handlers ─────────────────────────────────────────
  const handleToggleWireframe = useCallback(() => {
    wireRef.current = !wireRef.current;
    setWireframe(wireRef.current);
    sceneRef.current?.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh) {
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((m) => {
          if (m) (m as THREE.MeshStandardMaterial).wireframe = wireRef.current;
        });
      }
    });
  }, []);

  const handleToggleAutoRotate = useCallback(() => {
    const next = toggleAutoRotate();
    setAutoRotate(next);
  }, [toggleAutoRotate]);

  const handleToggleHeartbeat = useCallback(() => {
    setHeartbeat((prev) => !prev);
  }, []);

  const handleToggleAnnotations = useCallback(() => {
    setShowAnnotations((prev) => !prev);
    if (showAnnotations) {
      setSelectedAnnotation(null);
    }
  }, [showAnnotations]);

  // ── Hotspot Tour Navigation ───────────────────────────────────────────────
  const handleNextAnnotation = useCallback(() => {
    if (annotations.length === 0) return;
    if (!selectedAnnotation) {
      setSelectedAnnotation(annotations[0]);
      return;
    }
    const idx = annotations.findIndex((a) => a.id === selectedAnnotation.id);
    const nextIdx = (idx + 1) % annotations.length;
    setSelectedAnnotation(annotations[nextIdx]);
  }, [annotations, selectedAnnotation]);

  const handlePrevAnnotation = useCallback(() => {
    if (annotations.length === 0) return;
    if (!selectedAnnotation) {
      setSelectedAnnotation(annotations[annotations.length - 1]);
      return;
    }
    const idx = annotations.findIndex((a) => a.id === selectedAnnotation.id);
    const prevIdx = (idx - 1 + annotations.length) % annotations.length;
    setSelectedAnnotation(annotations[prevIdx]);
  }, [annotations, selectedAnnotation]);

  // ── Render Error ──────────────────────────────────────────────────────────
  if (setupError) {
    return (
      <View style={styles.fullError}>
        <ThemedText style={styles.errorTitle}>⚠ Renderer error</ThemedText>
        <ThemedText type="small" style={styles.errorDetail}>{setupError}</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container} onLayout={onLayout} {...panResponder.panHandlers}>
      {/* Native OpenGL Surface */}
      <GLView style={styles.glSurface} onContextCreate={onContextCreate} />

      {/* Loading Overlay */}
      {(loadState === 'idle' || loadState === 'loading') && glReady && (
        <LoadingSpinner message="Loading 3D Anatomy Model…" />
      )}

      {/* Error Fallback */}
      {loadState === 'error' && (
        <View style={styles.inlineError}>
          <ThemedText style={styles.errorTitle}>⚠ Failed to load model</ThemedText>
          <ThemedText type="small" style={styles.errorDetail}>{loadError}</ThemedText>
        </View>
      )}

      {/* 2D Projected Hotspot Pins */}
      {loadState === 'loaded' && (
        <AnnotationOverlay
          annotations={annotations}
          screenPositions={screenPositions}
          selectedId={selectedAnnotation?.id ?? null}
          onSelect={(item) => setSelectedAnnotation(item)}
          visible={showAnnotations}
          accentColor={accentColor}
        />
      )}

      {/* Floating 3D Action Controls */}
      {loadState === 'loaded' && (
        <ModelControls
          onReset={resetCamera}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          wireframe={wireframe}
          onToggleWireframe={handleToggleWireframe}
          autoRotate={autoRotate}
          onToggleAutoRotate={handleToggleAutoRotate}
          showAnnotations={showAnnotations}
          onToggleAnnotations={handleToggleAnnotations}
          heartbeat={heartbeat}
          onToggleHeartbeat={handleToggleHeartbeat}
          isInfoPanelOpen={Boolean(selectedAnnotation)}
        />
      )}

      {/* STEM Detail Card when Hotspot is tapped */}
      {selectedAnnotation && (
        <InfoPanel
          annotation={selectedAnnotation}
          totalAnnotations={annotations.length}
          onClose={() => setSelectedAnnotation(null)}
          onNext={handleNextAnnotation}
          onPrev={handlePrevAnnotation}
          accentColor={accentColor}
        />
      )}

      {/* Attribution Footer Bar */}
      {attribution && !selectedAnnotation && (
        <View style={styles.attributionPill}>
          <ThemedText style={styles.attributionText}>
            3D Model: {attribution.title} by {attribution.author} ({attribution.license})
          </ThemedText>
        </View>
      )}

      {/* Subject Color Accent Strip */}
      <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a14',
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
    backgroundColor: '#0a0a14',
    gap: 8,
    padding: 32,
  },
  inlineError: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    padding: 32,
  },
  errorTitle: {
    color: '#ff6b6b',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorDetail: {
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    fontSize: 12,
  },
  attributionPill: {
    position: 'absolute',
    bottom: 8,
    left: 16,
    right: 16,
    alignItems: 'center',
    pointerEvents: 'none',
  },
  attributionText: {
    color: 'rgba(255, 255, 255, 0.35)',
    fontSize: 9.5,
    textAlign: 'center',
  },
  accentBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    opacity: 0.8,
  },
});
