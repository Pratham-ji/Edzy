/**
 * useOrbitControls  — Phase 2
 *
 * Accepts a RefObject<camera> so it always reads the live camera,
 * even though it's created before the GL context fires.
 *
 * New in Phase 2
 * ──────────────
 * • Auto-rotate  — slow idle spin when the user isn't touching
 * • toggleAutoRotate() — exposed so UI can toggle it
 * • Double-tap to reset  — fires reset() when two taps < 300 ms apart
 * • Zoom buttons  — zoomIn() / zoomOut() for the UI controls
 * • Improved inertia  — separate horizontal/vertical damping
 */
import { useCallback, useRef } from 'react';
import { GestureResponderEvent, PanResponder } from 'react-native';
import * as THREE from 'three';

interface OrbitState {
  isPointerDown: boolean;
  lastX: number;
  lastY: number;
  velocityX: number;
  velocityY: number;
  lastPinchDist: number | null;
  phi: number;
  theta: number;
  radius: number;
  autoRotate: boolean;
  lastTapTime: number;
}

// ── Tuning constants ─────────────────────────────────────────────────────────
const PHI_MIN        = 0.08;
const PHI_MAX        = Math.PI - 0.08;
const RADIUS_MIN     = 0.6;
const RADIUS_MAX     = 8;
const ROTATE_SPEED   = 0.004;
const ZOOM_SPEED     = 0.012;
const DAMPING        = 0.85;
const AUTO_ROT_SPEED = 0.004;   // radians per frame
const ZOOM_STEP      = 0.5;     // units per button press
const DBL_TAP_MS     = 280;

export function useOrbitControls(cameraRef: React.RefObject<THREE.PerspectiveCamera | null>) {
  const state = useRef<OrbitState>({
    isPointerDown: false,
    lastX: 0,
    lastY: 0,
    velocityX: 0,
    velocityY: 0,
    lastPinchDist: null,
    phi: Math.PI / 2,
    theta: 0,
    radius: 3,
    autoRotate: true,   // on by default — nice first impression
    lastTapTime: 0,
  });

  // ── Core: apply spherical coords → camera position ───────────────────────
  function applySpherical() {
    const camera = cameraRef.current;
    if (!camera) return;
    const s = state.current;
    s.phi    = Math.max(PHI_MIN, Math.min(PHI_MAX, s.phi));
    s.radius = Math.max(RADIUS_MIN, Math.min(RADIUS_MAX, s.radius));
    camera.position.set(
      s.radius * Math.sin(s.phi) * Math.sin(s.theta),
      s.radius * Math.cos(s.phi),
      s.radius * Math.sin(s.phi) * Math.cos(s.theta),
    );
    camera.lookAt(0, 0, 0);
  }

  // ── Pinch distance helper ─────────────────────────────────────────────────
  function getPinchDist(evt: GestureResponderEvent): number | null {
    const touches = evt.nativeEvent.touches;
    if (touches.length < 2) return null;
    const dx = touches[0].pageX - touches[1].pageX;
    const dy = touches[0].pageY - touches[1].pageY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // ── PanResponder ──────────────────────────────────────────────────────────
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder:  () => true,

      onPanResponderGrant: (evt) => {
        const s = state.current;
        s.isPointerDown  = true;
        s.velocityX      = 0;
        s.velocityY      = 0;
        s.lastX          = evt.nativeEvent.pageX;
        s.lastY          = evt.nativeEvent.pageY;
        s.lastPinchDist  = getPinchDist(evt);

        // Double-tap detection → reset
        const now = Date.now();
        if (now - s.lastTapTime < DBL_TAP_MS) {
          // Trigger reset inline (avoids circular ref)
          s.phi    = Math.PI / 2;
          s.theta  = 0;
          s.radius = 3;
          applySpherical();
        }
        s.lastTapTime = now;
      },

      onPanResponderMove: (evt) => {
        const s = state.current;

        // Pinch zoom (two fingers)
        const pinchDist = getPinchDist(evt);
        if (pinchDist !== null && s.lastPinchDist !== null) {
          s.radius += (s.lastPinchDist - pinchDist) * ZOOM_SPEED;
        }
        s.lastPinchDist = pinchDist;

        // Single-finger rotate
        if (evt.nativeEvent.touches.length < 2) {
          const dx = evt.nativeEvent.pageX - s.lastX;
          const dy = evt.nativeEvent.pageY - s.lastY;
          s.velocityX  = dx;
          s.velocityY  = dy;
          s.theta     -= dx * ROTATE_SPEED;
          s.phi       -= dy * ROTATE_SPEED;
        }

        s.lastX = evt.nativeEvent.pageX;
        s.lastY = evt.nativeEvent.pageY;
        applySpherical();
      },

      onPanResponderRelease: () => {
        state.current.isPointerDown = false;
        state.current.lastPinchDist = null;
      },

      onPanResponderTerminate: () => {
        state.current.isPointerDown = false;
        state.current.lastPinchDist = null;
      },
    }),
  ).current;

  // ── Per-frame update — called inside the render loop ─────────────────────
  const update = useCallback(() => {
    const s = state.current;

    if (s.isPointerDown) return; // user has control

    // Inertia
    if (Math.abs(s.velocityX) > 0.01 || Math.abs(s.velocityY) > 0.01) {
      s.theta     -= s.velocityX * ROTATE_SPEED;
      s.phi       -= s.velocityY * ROTATE_SPEED;
      s.velocityX *= DAMPING;
      s.velocityY *= DAMPING;
      applySpherical();
      return; // don't auto-rotate while still coasting
    }

    // Auto-rotate (idle)
    if (s.autoRotate) {
      s.theta += AUTO_ROT_SPEED;
      applySpherical();
    }
  }, []); // stable — reads refs every frame, no deps needed

  // ── Exposed controls ──────────────────────────────────────────────────────
  const reset = useCallback(() => {
    const s = state.current;
    s.phi       = Math.PI / 2;
    s.theta     = 0;
    s.radius    = 3;
    s.velocityX = 0;
    s.velocityY = 0;
    applySpherical();
  }, []);

  const toggleAutoRotate = useCallback(() => {
    state.current.autoRotate = !state.current.autoRotate;
    return state.current.autoRotate;
  }, []);

  const getAutoRotate = useCallback(() => state.current.autoRotate, []);

  const zoomIn = useCallback(() => {
    state.current.radius = Math.max(RADIUS_MIN, state.current.radius - ZOOM_STEP);
    applySpherical();
  }, []);

  const zoomOut = useCallback(() => {
    state.current.radius = Math.min(RADIUS_MAX, state.current.radius + ZOOM_STEP);
    applySpherical();
  }, []);

  return { panResponder, update, reset, toggleAutoRotate, getAutoRotate, zoomIn, zoomOut };
}
