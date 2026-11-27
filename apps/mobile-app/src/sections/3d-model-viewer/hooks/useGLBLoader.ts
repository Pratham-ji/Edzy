/**
 * useGLBLoader
 *
 * Robust 3D GLB Model Loader for Expo GL + React Native.
 * - Handles local file:// URIs via legacy FileSystem without fetch() failure
 * - Built-in zero-dependency pure JS Base64 -> ArrayBuffer decoder
 * - Verifies binary 'glTF' magic header before feeding to GLTFLoader
 * - Applies realistic anatomical cardiac shading with specular highlights
 * - Automatically centers and scales the model to fit screen bounds
 */
import { Asset } from 'expo-asset';
import * as LegacyFileSystem from 'expo-file-system/legacy';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
// @ts-ignore — Metro resolves three/examples/jsm at runtime
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Polyfill global environment for Three.js loader in React Native Hermes/JSC
if (typeof globalThis !== 'undefined') {
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

export type LoadState = 'idle' | 'loading' | 'loaded' | 'error';

export interface GLBLoaderResult {
  loadState: LoadState;
  model: THREE.Group | null;
  error: string | null;
}

/**
 * High performance pure JS Base64 to ArrayBuffer decoder.
 * Avoids browser atob/Blob issues in mobile Hermes/JSC runtimes.
 */
function decodeBase64ToArrayBuffer(base64: string): ArrayBuffer {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const lookup = new Uint8Array(256);
  for (let i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
  }

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
    const encoded1 = lookup[base64.charCodeAt(i)];
    const encoded2 = lookup[base64.charCodeAt(i + 1)];
    const encoded3 = lookup[base64.charCodeAt(i + 2)];
    const encoded4 = lookup[base64.charCodeAt(i + 3)];

    bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
    if (base64[i + 2] !== '=') {
      bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
    }
    if (base64[i + 3] !== '=') {
      bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }
  }

  return arrayBuffer;
}

export function useGLBLoader(
  assetModule: number,
  sceneRef: React.RefObject<THREE.Scene | null>,
  glReady: boolean,
): GLBLoaderResult {
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [error, setError] = useState<string | null>(null);
  const loadedModelRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!glReady || !sceneRef.current) return;

    const scene = sceneRef.current;
    let cancelled = false;

    async function load() {
      setLoadState('loading');
      setError(null);

      try {
        // 1. Resolve asset from module
        const asset = Asset.fromModule(assetModule);
        await asset.downloadAsync();
        if (cancelled) return;

        const targetUri = asset.localUri || asset.uri;
        if (!targetUri) {
          throw new Error('Unable to resolve asset URI for 3D model.');
        }

        // 2. Read binary data safely according to URI protocol
        let arrayBuffer: ArrayBuffer;

        if (targetUri.startsWith('file://') || targetUri.startsWith('/')) {
          // Local file on device: read as Base64 to bypass React Native fetch() limitation on file://
          const base64 = await LegacyFileSystem.readAsStringAsync(targetUri, {
            encoding: LegacyFileSystem.EncodingType.Base64,
          });
          arrayBuffer = decodeBase64ToArrayBuffer(base64);
        } else {
          // Remote/Metro HTTP URL
          const res = await fetch(targetUri);
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: Failed to download model asset from bundler`);
          }
          arrayBuffer = await res.arrayBuffer();
        }

        if (cancelled) return;

        // 3. Verify magic 'glTF' binary header (prevents parsing HTML or 404 text)
        const magic = String.fromCharCode(...new Uint8Array(arrayBuffer, 0, 4));
        if (magic !== 'glTF') {
          const preview = new TextDecoder().decode(
            new Uint8Array(arrayBuffer, 0, Math.min(arrayBuffer.byteLength, 80))
          );
          throw new Error(`Invalid GLB format (header was '${magic}': ${preview})`);
        }

        // 4. Parse with GLTFLoader
        const loader = new GLTFLoader();
        loader.parse(
          arrayBuffer,
          '',
          (gltf: any) => {
            if (cancelled) return;

            const root: THREE.Group = gltf.scene;

            // Apply high quality anatomical cardiac material
            const cardiacMat = new THREE.MeshStandardMaterial({
              color: 0xba2c2c,
              roughness: 0.35,
              metalness: 0.1,
            });

            root.traverse((child) => {
              const mesh = child as THREE.Mesh;
              if (mesh.isMesh) {
                mesh.material = cardiacMat;
                mesh.geometry?.computeVertexNormals();
              }
            });

            // Auto-center & fit within 2-unit bounding box
            const box = new THREE.Box3().setFromObject(root);
            const center = new THREE.Vector3();
            box.getCenter(center);
            root.position.sub(center);

            const size = new THREE.Vector3();
            box.getSize(size);
            const maxDim = Math.max(size.x, size.y, size.z);
            root.scale.setScalar(2 / maxDim);

            scene.add(root);
            loadedModelRef.current = root;
            setModel(root);
            setLoadState('loaded');
          },
          (err: any) => {
            if (cancelled) return;
            console.error('[GLBLoader] Parse Error:', err);
            setError(err instanceof Error ? err.message : String(err));
            setLoadState('error');
          },
        );
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : String(err);
        console.error('[GLBLoader] Asset Error:', msg);
        setError(msg);
        setLoadState('error');
      }
    }

    load();

    return () => {
      cancelled = true;
      const m = loadedModelRef.current;
      if (m) {
        scene.remove(m);
        m.traverse((child) => {
          const mesh = child as THREE.Mesh;
          if (mesh.isMesh) {
            mesh.geometry?.dispose();
            const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            mats.forEach((mat: THREE.Material) => mat?.dispose());
          }
        });
        loadedModelRef.current = null;
      }
    };
  }, [assetModule, glReady]);

  return { loadState, model, error };
}
