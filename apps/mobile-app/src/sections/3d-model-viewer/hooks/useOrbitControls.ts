/**
 * useOrbitControls
 *
 * Reusable 3D camera controller for Expo GL + Three.js:
 * - Single-finger Orbit rotation (or single-finger Pan when interactionMode === 'pan')
 * - Two-finger Pinch-to-Zoom + Two-finger Pan simultaneously
 * - Double-tap to Reset view (rotation, zoom, and pan target)
 * - Programmatic helpers: zoomIn(), zoomOut(), rotateByStep(), panBy(), reset(), toggleAutoRotate()
 * - Smooth rotational inertia damping
 */
import { useCallback, useEffect, useRef } from 'react';
import { GestureResponderEvent, PanResponder } from 'react-native';
import * as THREE from 'three';
import { InteractionMode, ModelCameraDefaults } from '../interactions/types';

interface OrbitState {
  isPointerDown: boolean;
  lastX: number;
  lastY: number;
  lastMidX: number | null;
  lastMidY: number | null;
  velocityX: number;
  velocityY: number;
  lastPinchDist: number | null;
  phi: number;
  theta: number;
  radius: number;
  targetX: number;
  targetY: number;
  targetZ: number;
  autoRotate: boolean;
  interactionMode: InteractionMode;
  lastTapTime: number;
}

const PHI_MIN        = 0.08;
const PHI_MAX        = Math.PI - 0.08;
const RADIUS_MIN     = 0.7;
const RADIUS_MAX     = 8.0;
const PAN_LIMIT      = 2.2;
const ROTATE_SPEED   = 0.0055;
const PAN_SPEED      = 0.0032;
const ZOOM_SPEED     = 0.012;
const DAMPING        = 0.85;
const AUTO_ROT_SPEED = 0.0045;
const ZOOM_STEP      = 0.45;
const DBL_TAP_MS     = 280;

export function useOrbitControls(
  cameraRef: React.RefObject<THREE.PerspectiveCamera | null>,
  defaults?: ModelCameraDefaults,
) {
  const defaultPhi    = defaults?.phi    ?? Math.PI / 2;
  const defaultTheta  = defaults?.theta  ?? 0;
  const defaultRadius = defaults?.radius ?? 3;

  const state = useRef<OrbitState>({
    isPointerDown: false,
    lastX: 0,
    lastY: 0,
    lastMidX: null,
    lastMidY: null,
    velocityX: 0,
    velocityY: 0,
    lastPinchDist: null,
    phi: defaultPhi,
    theta: defaultTheta,
    radius: defaultRadius,
    targetX: 0,
    targetY: 0,
    targetZ: 0,
    autoRotate: true,
    interactionMode: 'orbit',
    lastTapTime: 0,
  });

  const defaultsRef = useRef({ phi: defaultPhi, theta: defaultTheta, radius: defaultRadius });
  useEffect(() => {
    defaultsRef.current = { phi: defaultPhi, theta: defaultTheta, radius: defaultRadius };
  }, [defaultPhi, defaultTheta, defaultRadius]);

  function applyCameraTransform() {
    const camera = cameraRef.current;
    if (!camera) return;
    const s = state.current;
    s.phi     = Math.max(PHI_MIN, Math.min(PHI_MAX, s.phi));
    s.radius  = Math.max(RADIUS_MIN, Math.min(RADIUS_MAX, s.radius));
    s.targetX = Math.max(-PAN_LIMIT, Math.min(PAN_LIMIT, s.targetX));
    s.targetY = Math.max(-PAN_LIMIT, Math.min(PAN_LIMIT, s.targetY));
    s.targetZ = Math.max(-PAN_LIMIT, Math.min(PAN_LIMIT, s.targetZ));

    const offsetX = s.radius * Math.sin(s.phi) * Math.sin(s.theta);
    const offsetY = s.radius * Math.cos(s.phi);
    const offsetZ = s.radius * Math.sin(s.phi) * Math.cos(s.theta);

    camera.position.set(s.targetX + offsetX, s.targetY + offsetY, s.targetZ + offsetZ);
    camera.lookAt(s.targetX, s.targetY, s.targetZ);
  }

  function applyScreenPan(dx: number, dy: number) {
    const camera = cameraRef.current;
    const s = state.current;
    const scale = PAN_SPEED * (s.radius / 3);

    if (camera) {
      const forward = new THREE.Vector3();
      camera.getWorldDirection(forward);
      const right = new THREE.Vector3().crossVectors(forward, camera.up).normalize();
      const up = new THREE.Vector3().crossVectors(right, forward).normalize();

      s.targetX -= right.x * dx * scale - up.x * dy * scale;
      s.targetY -= right.y * dx * scale - up.y * dy * scale;
      s.targetZ -= right.z * dx * scale - up.z * dy * scale;
    } else {
      s.targetX -= dx * scale;
      s.targetY += dy * scale;
    }
  }

  function getTouchMetrics(evt: GestureResponderEvent): {
    pinchDist: number | null;
    midX: number | null;
    midY: number | null;
  } {
    const touches = evt.nativeEvent.touches;
    if (!touches || touches.length < 2) {
      return { pinchDist: null, midX: null, midY: null };
    }
    const dx = touches[0].pageX - touches[1].pageX;
    const dy = touches[0].pageY - touches[1].pageY;
    return {
      pinchDist: Math.sqrt(dx * dx + dy * dy),
      midX: (touches[0].pageX + touches[1].pageX) / 2,
      midY: (touches[0].pageY + touches[1].pageY) / 2,
    };
  }

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,

      onPanResponderGrant: (evt) => {
        const s = state.current;
        s.isPointerDown = true;
        s.velocityX = 0;
        s.velocityY = 0;
        s.lastX = evt.nativeEvent.pageX;
        s.lastY = evt.nativeEvent.pageY;

        const metrics = getTouchMetrics(evt);
        s.lastPinchDist = metrics.pinchDist;
        s.lastMidX = metrics.midX;
        s.lastMidY = metrics.midY;

        // Double-tap resets orbit, zoom, and pan target
        const now = Date.now();
        if (now - s.lastTapTime < DBL_TAP_MS && (!evt.nativeEvent.touches || evt.nativeEvent.touches.length <= 1)) {
          s.phi = defaultsRef.current.phi;
          s.theta = defaultsRef.current.theta;
          s.radius = defaultsRef.current.radius;
          s.targetX = 0;
          s.targetY = 0;
          s.targetZ = 0;
          applyCameraTransform();
        }
        s.lastTapTime = now;
      },

      onPanResponderMove: (evt) => {
        const s = state.current;
        const touches = evt.nativeEvent.touches;

        if (touches && touches.length >= 2) {
          const { pinchDist, midX, midY } = getTouchMetrics(evt);
          if (pinchDist !== null && s.lastPinchDist !== null) {
            s.radius += (s.lastPinchDist - pinchDist) * ZOOM_SPEED;
          }
          if (midX !== null && midY !== null && s.lastMidX !== null && s.lastMidY !== null) {
            applyScreenPan(midX - s.lastMidX, midY - s.lastMidY);
          }
          s.lastPinchDist = pinchDist;
          s.lastMidX = midX;
          s.lastMidY = midY;
        } else {
          s.lastPinchDist = null;
          s.lastMidX = null;
          s.lastMidY = null;

          const dx = evt.nativeEvent.pageX - s.lastX;
          const dy = evt.nativeEvent.pageY - s.lastY;

          if (s.interactionMode === 'pan') {
            applyScreenPan(dx, dy);
          } else {
            s.velocityX = dx;
            s.velocityY = dy;
            s.theta -= dx * ROTATE_SPEED;
            s.phi   -= dy * ROTATE_SPEED;
          }
        }

        s.lastX = evt.nativeEvent.pageX;
        s.lastY = evt.nativeEvent.pageY;
        applyCameraTransform();
      },

      onPanResponderRelease: () => {
        const s = state.current;
        s.isPointerDown = false;
        s.lastPinchDist = null;
        s.lastMidX = null;
        s.lastMidY = null;
      },

      onPanResponderTerminate: () => {
        const s = state.current;
        s.isPointerDown = false;
        s.lastPinchDist = null;
        s.lastMidX = null;
        s.lastMidY = null;
      },
    }),
  ).current;

  const update = useCallback(() => {
    const s = state.current;
    if (s.isPointerDown) return;

    if (Math.abs(s.velocityX) > 0.01 || Math.abs(s.velocityY) > 0.01) {
      s.theta -= s.velocityX * ROTATE_SPEED;
      s.phi   -= s.velocityY * ROTATE_SPEED;
      s.velocityX *= DAMPING;
      s.velocityY *= DAMPING;
      applyCameraTransform();
      return;
    }

    if (s.autoRotate) {
      s.theta += AUTO_ROT_SPEED;
      applyCameraTransform();
    }
  }, []);

  const reset = useCallback(() => {
    const s = state.current;
    s.phi = defaultsRef.current.phi;
    s.theta = defaultsRef.current.theta;
    s.radius = defaultsRef.current.radius;
    s.targetX = 0;
    s.targetY = 0;
    s.targetZ = 0;
    s.velocityX = 0;
    s.velocityY = 0;
    applyCameraTransform();
  }, []);

  const toggleAutoRotate = useCallback(() => {
    state.current.autoRotate = !state.current.autoRotate;
    return state.current.autoRotate;
  }, []);

  const setAutoRotateEnabled = useCallback((enabled: boolean) => {
    state.current.autoRotate = enabled;
  }, []);

  const setInteractionMode = useCallback((mode: InteractionMode) => {
    state.current.interactionMode = mode;
  }, []);

  const zoomIn = useCallback(() => {
    state.current.radius = Math.max(RADIUS_MIN, state.current.radius - ZOOM_STEP);
    applyCameraTransform();
  }, []);

  const zoomOut = useCallback(() => {
    state.current.radius = Math.min(RADIUS_MAX, state.current.radius + ZOOM_STEP);
    applyCameraTransform();
  }, []);

  const rotateByDegrees = useCallback((deltaDeg: number) => {
    state.current.theta += (deltaDeg * Math.PI) / 180;
    applyCameraTransform();
  }, []);

  return {
    panResponder,
    update,
    reset,
    toggleAutoRotate,
    setAutoRotateEnabled,
    setInteractionMode,
    zoomIn,
    zoomOut,
    rotateByDegrees,
  };
}
