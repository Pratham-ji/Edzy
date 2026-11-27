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
  /** Call to cleanly dispose GPU resources when the GL view unmounts */
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

  // ── Scene ─────────────────────────────────────────────────────────────────
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a14);

  // ── Camera ────────────────────────────────────────────────────────────────
  const camera = new THREE.PerspectiveCamera(55, width / height, 0.01, 1000);
  camera.position.set(0, 0, 3);

  // ── Lighting Rig ──────────────────────────────────────────────────────────
  // Ambient: fills shadowed areas
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);

  // Key light: main top-right illumination
  const keyLight = new THREE.DirectionalLight(0xfff2e0, 1.5);
  keyLight.position.set(5, 8, 5);
  scene.add(keyLight);

  // Fill light: soft cool light from opposite angle
  const fillLight = new THREE.DirectionalLight(0xc0d0ff, 0.5);
  fillLight.position.set(-5, 2, -5);
  scene.add(fillLight);

  // Rim light: backlight to highlight edges against dark background
  const rimLight = new THREE.DirectionalLight(0xff7766, 0.7);
  rimLight.position.set(0, -4, -6);
  scene.add(rimLight);

  // ── Dispose helper ────────────────────────────────────────────────────────
  function dispose() {
    renderer.dispose();
  }

  return { renderer, scene, camera, dispose };
}
