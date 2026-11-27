import * as THREE from 'three';
import { ExplorerViewMode, ModelComponentNode } from './types';

const CROSS_SECTION_PLANE = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0.05);

function hexStringToInt(hex: string): number {
  return parseInt(hex.replace('#', ''), 16) || 0x4f46e5;
}

function matchesComponentMeshes(meshName: string, component: ModelComponentNode | null): boolean {
  if (!component?.meshNames || component.meshNames.length === 0) return false;
  const lower = meshName.toLowerCase();
  return component.meshNames.some((fragment) => lower.includes(fragment.toLowerCase()));
}

/**
 * Snapshot original mesh transforms and material values once after loading,
 * enabling non-destructive highlighting, isolation, wireframe, and explode effects.
 */
export function cacheOriginalMeshState(root: THREE.Group): void {
  root.userData.baseY = root.position.y;
  let meshCount = 0;

  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    meshCount++;

    if (!mesh.userData.origPosition) {
      mesh.userData.origPosition = mesh.position.clone();
    }

    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    mats.forEach((mat) => {
      const std = mat as THREE.MeshStandardMaterial;
      if (!std) return;
      if (std.userData.origColor === undefined && std.color) {
        std.userData.origColor = std.color.getHex();
      }
      if (std.userData.origEmissive === undefined && std.emissive) {
        std.userData.origEmissive = std.emissive.getHex();
      }
      if (std.userData.origOpacity === undefined) {
        std.userData.origOpacity = std.opacity ?? 1;
      }
      if (std.userData.origTransparent === undefined) {
        std.userData.origTransparent = Boolean(std.transparent);
      }
    });
  });

  root.userData.meshCount = meshCount;
}

/**
 * Creates a glowing 3D spatial target beacon placed inside the model group
 * so even single-mesh .glb models highlight selected anatomical/structural parts clearly.
 */
export function createFocusBeacon(accentColor: string): THREE.Group {
  const beacon = new THREE.Group();
  beacon.name = '__focus_beacon__';

  const colorInt = hexStringToInt(accentColor);
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.055, 16, 16),
    new THREE.MeshBasicMaterial({ color: colorInt }),
  );
  const halo = new THREE.Mesh(
    new THREE.RingGeometry(0.085, 0.125, 24),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    }),
  );

  beacon.add(core);
  beacon.add(halo);
  beacon.visible = false;
  return beacon;
}

export interface VisualEffectOptions {
  root: THREE.Group;
  beacon: THREE.Group | null;
  selectedComponent: ModelComponentNode | null;
  isolateSelected: boolean;
  wireframe: boolean;
  viewMode: ExplorerViewMode;
  accentColor: string;
}

export function applyModelVisualState({
  root,
  beacon,
  selectedComponent,
  isolateSelected,
  wireframe,
  viewMode,
  accentColor,
}: VisualEffectOptions): void {
  const meshCount: number = root.userData.meshCount ?? 1;
  const isMultiPart = meshCount > 1;
  const hasMeshTargets = Boolean(selectedComponent?.meshNames?.length);
  const accentInt = selectedComponent?.highlightColor ?? hexStringToInt(accentColor);

  // Compute model center in local space for radial explosion
  const localCenter = new THREE.Vector3(0, 0, 0);

  root.traverse((child) => {
    if (child.name === '__focus_beacon__' || child.parent?.name === '__focus_beacon__') return;
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;

    const origPos = (mesh.userData.origPosition as THREE.Vector3 | undefined) ?? mesh.position;

    // 1. Explode displacement (multi-part models separate radially outward)
    if (viewMode === 'exploded' && isMultiPart) {
      const dir = origPos.clone().sub(localCenter);
      if (dir.lengthSq() < 0.001) {
        dir.set(0, 0.25, 0);
      } else {
        dir.normalize();
      }
      mesh.position.copy(origPos).addScaledVector(dir, 0.38);
    } else {
      mesh.position.copy(origPos);
    }

    // 2. Material states: wireframe, cross-section clipping, highlight, isolation
    const isMatchedPart = hasMeshTargets && matchesComponentMeshes(mesh.name, selectedComponent);
    const shouldGhost =
      Boolean(selectedComponent) &&
      isolateSelected &&
      isMultiPart &&
      hasMeshTargets &&
      !isMatchedPart;

    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    mats.forEach((mat) => {
      const std = mat as THREE.MeshStandardMaterial;
      if (!std) return;

      const origOpacity = (std.userData.origOpacity as number | undefined) ?? 1;
      const origTransparent = (std.userData.origTransparent as boolean | undefined) ?? false;
      const origEmissive = (std.userData.origEmissive as number | undefined) ?? 0x000000;

      // Wireframe or single-mesh exploded cutaway preview
      std.wireframe = wireframe || (viewMode === 'exploded' && !isMultiPart);

      // Cross-section clipping plane
      if (viewMode === 'cross-section') {
        std.clippingPlanes = [CROSS_SECTION_PLANE];
        std.side = THREE.DoubleSide;
      } else {
        std.clippingPlanes = [];
        std.side = THREE.FrontSide;
      }

      // Highlight & isolation
      if (shouldGhost) {
        std.transparent = true;
        std.opacity = 0.14;
        std.depthWrite = false;
      } else {
        std.transparent = origTransparent;
        std.opacity = origOpacity;
        std.depthWrite = origOpacity >= 1;
      }

      if (std.emissive) {
        if (isMatchedPart) {
          std.emissive.setHex(accentInt);
          std.emissiveIntensity = 0.55;
        } else {
          std.emissive.setHex(origEmissive);
          std.emissiveIntensity = 1;
        }
      }

      std.needsUpdate = true;
    });
  });

  // 3. Position 3D focus beacon inside model local coordinates
  if (beacon) {
    if (selectedComponent) {
      // Because model root is normalized to ~2-unit box centered at origin,
      // annotation normalized [-1..1] coordinates map directly onto local space.
      const invScale = root.scale.x !== 0 ? 1 / root.scale.x : 1;
      beacon.position.set(
        selectedComponent.position[0] * invScale,
        selectedComponent.position[1] * invScale,
        selectedComponent.position[2] * invScale,
      );
      beacon.scale.setScalar(invScale);
      beacon.visible = true;
    } else {
      beacon.visible = false;
    }
  }
}

