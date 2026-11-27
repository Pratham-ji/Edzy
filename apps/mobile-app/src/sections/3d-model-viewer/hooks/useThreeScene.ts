/**
 * useThreeScene
 * Sets up the core Three.js renderer, scene, camera, and lighting
 * from an Expo GL rendering context.
 *
 * Includes React Native environment polyfills for document/canvas
 * so Three.js WebGLRenderer initializes without DOM dependencies.
 */
import { ExpoWebGLRenderingContext } from 'expo-gl';
import * as THREE from 'three';

export interface ThreeScene {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  /** Cleanly dispose GPU resources when the GL view unmounts */
  dispose: () => void;
}

export function createThreeScene(gl: ExpoWebGLRenderingContext): ThreeScene {
  const width = gl.drawingBufferWidth || 360;
  const height = gl.drawingBufferHeight || 640;

  // ── Mock Canvas for React Native ──────────────────────────────────────────
  const mockCanvas: any = {
    width,
    height,
    style: {
      width: `${width}px`,
      height: `${height}px`,
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    setPointerCapture: () => {},
    releasePointerCapture: () => {},
    getContext: () => gl,
  };

  // ── Document & Navigator Polyfill for React Native Hermes / JSC ──────────
  if (typeof globalThis !== 'undefined') {
    if (typeof (globalThis as any).document === 'undefined') {
      (globalThis as any).document = {
        createElement: (tag: string) => (tag === 'canvas' ? mockCanvas : {}),
        createElementNS: (_ns: string, tag: string) => (tag === 'canvas' ? mockCanvas : {}),
      };
    }
    if (typeof (globalThis as any).self === 'undefined') {
      (globalThis as any).self = globalThis;
    }
    if (typeof (globalThis as any).window === 'undefined') {
      (globalThis as any).window = globalThis;
    }
  }
  if (typeof navigator !== 'undefined' && !(navigator as any).userAgent) {
    (navigator as any).userAgent = 'ReactNative';
  }

  // ── WebGL 2 Polyfill ──────────────────────────────────────────────────────
  // Three.js r163+ dropped WebGL 1 entirely. It detects WebGL 2 via:
  //   gl instanceof WebGL2RenderingContext
  // In React Native / Hermes, WebGL2RenderingContext is not a global class,
  // so the check always returns false. The fix: assign the expo-gl context's
  // own constructor as the global WebGL2RenderingContext *before* constructing
  // the renderer, so the instanceof check passes on every Android device.
  if (typeof (globalThis as any).WebGL2RenderingContext === 'undefined') {
    (globalThis as any).WebGL2RenderingContext = (gl as any).constructor;
  }

  // Polyfill drawingBufferColorSpace (used by THREE r166+ SRGBColorSpace logic)
  if (typeof (gl as any).drawingBufferColorSpace === 'undefined') {
    Object.defineProperty(gl, 'drawingBufferColorSpace', {
      get: () => 'srgb',
      set: () => {},
      configurable: true,
    });
  }
  // Polyfill unpackColorSpace (used by Three.js texture uploads in WebGL 2 path)
  if (typeof (gl as any).unpackColorSpace === 'undefined') {
    Object.defineProperty(gl, 'unpackColorSpace', {
      get: () => 'srgb',
      set: () => {},
      configurable: true,
    });
  }

  // ── Renderer ──────────────────────────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({
    canvas: mockCanvas,
    context: gl as unknown as WebGL2RenderingContext,
    antialias: false,
    alpha: true,
  });

  // false prevents Three.js from attempting DOM style manipulations
  renderer.setSize(width, height, false);
  renderer.setPixelRatio(1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = false;
  // Enable clipping planes for cross-section exploration mode
  renderer.localClippingEnabled = true;

  // ── Scene ─────────────────────────────────────────────────────────────────
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b101b);

  // ── Camera ────────────────────────────────────────────────────────────────
  const camera = new THREE.PerspectiveCamera(55, width / height, 0.01, 1000);
  camera.position.set(0, 0, 3);

  // ── Lighting Rig ──────────────────────────────────────────────────────────
  const ambient = new THREE.AmbientLight(0xffffff, 0.65);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xfff4e6, 1.55);
  keyLight.position.set(5, 8, 5);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xc0d4ff, 0.55);
  fillLight.position.set(-5, 2, -5);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0x93c5fd, 0.65);
  rimLight.position.set(0, -4, -6);
  scene.add(rimLight);

  // ── Dispose helper ────────────────────────────────────────────────────────
  function dispose() {
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.geometry?.dispose();
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((m) => m?.dispose());
      }
    });
    scene.clear();
    renderer.dispose();
  }

  return { renderer, scene, camera, dispose };
}
