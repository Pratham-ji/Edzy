/**
 * useGLBLoader (Unified 3D Model Loader)
 *
 * Supports:
 * - Local bundled .glb/.gltf assets (via Metro + expo-asset + FileSystem Base64)
 * - Remote HTTPS .glb/.gltf URLs
 * - Modular procedural Three.js models when a catalog entry doesn't have a .glb yet
 * - Automatic bounding-box centering & scale normalization
 * - Non-destructive material/position caching for isolation, highlighting & explode
 * - Retry trigger & deterministic GPU cleanup on model switch/unmount
 */
import { Asset } from 'expo-asset';
import * as LegacyFileSystem from 'expo-file-system/legacy';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
// @ts-ignore — Metro resolves three/examples/jsm at runtime
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ModelEntry } from '../interactions/types';
import { buildProceduralModel } from '../interactions/proceduralModels';
import { cacheOriginalMeshState } from '../interactions/meshEffects';

// Polyfill global environment for Three.js loader in React Native Hermes/JSC
if (typeof globalThis !== 'undefined') {
  if (typeof (globalThis as any).self === 'undefined') {
    (globalThis as any).self = globalThis;
  }
  if (typeof (globalThis as any).window === 'undefined') {
    (globalThis as any).window = globalThis;
  }
  if (typeof (globalThis as any).TextDecoder === 'undefined') {
    (globalThis as any).TextDecoder = class SimpleTextDecoder {
      decode(arr?: ArrayBufferView | ArrayBuffer): string {
        if (!arr) return '';
        const bytes = arr instanceof ArrayBuffer ? new Uint8Array(arr) : new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
        let out = '';
        for (let i = 0; i < bytes.length; i++) {
          out += String.fromCharCode(bytes[i]);
        }
        return out;
      }
    };
  }
}
if (typeof navigator !== 'undefined' && !(navigator as any).userAgent) {
  (navigator as any).userAgent = 'ReactNative';
}

export type LoadState = 'idle' | 'loading' | 'loaded' | 'error';

export interface GLBLoaderResult {
  loadState: LoadState;
  model: THREE.Group | null;
  error: string | null;
  reload: () => void;
}

const BASE64_LOOKUP = (() => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const table = new Uint8Array(256);
  for (let i = 0; i < chars.length; i++) {
    table[chars.charCodeAt(i)] = i;
  }
  return table;
})();

function decodeBase64ToArrayBuffer(base64: string): ArrayBuffer {
  let bufferLength = base64.length * 0.75;
  if (base64[base64.length - 1] === '=') {
    bufferLength--;
    if (base64[base64.length - 2] === '=') {
      bufferLength--;
    }
  }

  const arrayBuffer = new ArrayBuffer(bufferLength);
  const bytes = new Uint8Array(arrayBuffer);

  let p = 0;
  for (let i = 0; i < base64.length; i += 4) {
    const e1 = BASE64_LOOKUP[base64.charCodeAt(i)];
    const e2 = BASE64_LOOKUP[base64.charCodeAt(i + 1)];
    const e3 = BASE64_LOOKUP[base64.charCodeAt(i + 2)];
    const e4 = BASE64_LOOKUP[base64.charCodeAt(i + 3)];

    bytes[p++] = (e1 << 2) | (e2 >> 4);
    if (base64[i + 2] !== '=') {
      bytes[p++] = ((e2 & 15) << 4) | (e3 >> 2);
    }
    if (base64[i + 3] !== '=') {
      bytes[p++] = ((e3 & 3) << 6) | (e4 & 63);
    }
  }

  return arrayBuffer;
}

function normalizeAndMountModel(
  root: THREE.Group,
  scene: THREE.Scene,
  modelEntry: ModelEntry,
): THREE.Group {
  // Apply fallback material if configured and mesh has no texture map
  const matCfg = modelEntry.materialConfig;
  if (matCfg && !matCfg.preserveOriginalMaterials && matCfg.fallbackColor !== undefined) {
    const fallbackMat = new THREE.MeshStandardMaterial({
      color: matCfg.fallbackColor,
      roughness: matCfg.roughness ?? 0.35,
      metalness: matCfg.metalness ?? 0.1,
    });
    root.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh) {
        const existing = mesh.material as THREE.MeshStandardMaterial | undefined;
        const hasTexture = Boolean(existing?.map);
        if (!hasTexture) {
          mesh.material = fallbackMat.clone();
        }
        mesh.geometry?.computeVertexNormals();
      }
    });
    fallbackMat.dispose();
  }

  // Auto-center and fit inside 2-unit bounding box
  const box = new THREE.Box3().setFromObject(root);
  const center = new THREE.Vector3();
  box.getCenter(center);
  root.position.sub(center);

  const size = new THREE.Vector3();
  box.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  const scaleFactor = 2 / maxDim;
  root.scale.setScalar(scaleFactor);
  root.position.multiplyScalar(scaleFactor);

  cacheOriginalMeshState(root);
  scene.add(root);
  return root;
}

function disposeGroup(scene: THREE.Scene, group: THREE.Group | null): void {
  if (!group) return;
  scene.remove(group);
  group.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (mesh.isMesh) {
      mesh.geometry?.dispose();
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((mat: THREE.Material) => mat?.dispose());
    }
  });
}

export function useGLBLoader(
  modelEntry: ModelEntry,
  sceneRef: React.RefObject<THREE.Scene | null>,
  glReady: boolean,
): GLBLoaderResult {
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadNonce, setReloadNonce] = useState(0);
  const loadedModelRef = useRef<THREE.Group | null>(null);

  const reload = useCallback(() => {
    setReloadNonce((n) => n + 1);
  }, []);

  useEffect(() => {
    if (!glReady || !sceneRef.current) return;

    const scene = sceneRef.current;
    let cancelled = false;

    async function load() {
      setLoadState('loading');
      setError(null);
      setModel(null);

      // Clear any previous model before loading next
      if (loadedModelRef.current) {
        disposeGroup(scene, loadedModelRef.current);
        loadedModelRef.current = null;
      }

      try {
        // Branch A: Procedural 3D model when no .glb asset is attached yet
        if (modelEntry.asset === undefined && modelEntry.proceduralModelId) {
          const proceduralRoot = buildProceduralModel(modelEntry.proceduralModelId);
          if (cancelled) return;
          const mounted = normalizeAndMountModel(proceduralRoot, scene, modelEntry);
          loadedModelRef.current = mounted;
          setModel(mounted);
          setLoadState('loaded');
          return;
        }

        if (modelEntry.asset === undefined) {
          throw new Error(`No .glb asset or procedural geometry configured for "${modelEntry.name}".`);
        }

        // Branch B: Bundled module number or remote HTTPS URL
        let targetUri: string;
        if (typeof modelEntry.asset === 'number') {
          const asset = Asset.fromModule(modelEntry.asset);
          await asset.downloadAsync();
          if (cancelled) return;
          targetUri = asset.localUri || asset.uri;
        } else {
          targetUri = modelEntry.asset;
        }

        if (!targetUri) {
          throw new Error(`Unable to resolve asset URI for ${modelEntry.name}.`);
        }

        let arrayBuffer: ArrayBuffer;
        if (targetUri.startsWith('file://') || targetUri.startsWith('/')) {
          const base64 = await LegacyFileSystem.readAsStringAsync(targetUri, {
            encoding: LegacyFileSystem.EncodingType.Base64,
          });
          arrayBuffer = decodeBase64ToArrayBuffer(base64);
        } else {
          const res = await fetch(targetUri);
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: Failed to fetch 3D model asset.`);
          }
          arrayBuffer = await res.arrayBuffer();
        }

        if (cancelled) return;

        // Verify binary 'glTF' magic header for .glb files
        const magic = String.fromCharCode(...new Uint8Array(arrayBuffer, 0, 4));
        if (magic !== 'glTF') {
          throw new Error(`Invalid GLB header ('${magic}'). Ensure Metro bundles .glb as an asset.`);
        }

        const loader = new GLTFLoader();
        loader.parse(
          arrayBuffer,
          '',
          (gltf: { scene: THREE.Group }) => {
            if (cancelled) return;
            const mounted = normalizeAndMountModel(gltf.scene, scene, modelEntry);
            loadedModelRef.current = mounted;
            setModel(mounted);
            setLoadState('loaded');
          },
          (err: unknown) => {
            if (cancelled) return;
            const msg = err instanceof Error ? err.message : String(err);
            setError(msg);
            setLoadState('error');
          },
        );
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
        setLoadState('error');
      }
    }

    load();

    return () => {
      cancelled = true;
      disposeGroup(scene, loadedModelRef.current);
      loadedModelRef.current = null;
    };
  }, [modelEntry, glReady, reloadNonce, sceneRef]);

  return { loadState, model, error, reload };
}
