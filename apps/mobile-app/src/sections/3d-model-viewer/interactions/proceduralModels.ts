import * as THREE from 'three';
import { ProceduralModelId } from './types';

function makeMat(color: number, options?: { roughness?: number; metalness?: number; opacity?: number; emissive?: number }) {
  const opacity = options?.opacity ?? 1;
  return new THREE.MeshStandardMaterial({
    color,
    roughness: options?.roughness ?? 0.38,
    metalness: options?.metalness ?? 0.12,
    transparent: opacity < 1,
    opacity,
    emissive: options?.emissive ?? 0x000000,
  });
}

function addPart(
  group: THREE.Group,
  name: string,
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  pos: [number, number, number] = [0, 0, 0],
  rot: [number, number, number] = [0, 0, 0],
  extra?: { animRole?: string; animPhase?: number; animSpeed?: number },
): THREE.Mesh {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = name;
  mesh.position.set(pos[0], pos[1], pos[2]);
  mesh.rotation.set(rot[0], rot[1], rot[2]);
  if (extra?.animRole) mesh.userData.animRole = extra.animRole;
  if (extra?.animPhase !== undefined) mesh.userData.animPhase = extra.animPhase;
  if (extra?.animSpeed !== undefined) mesh.userData.animSpeed = extra.animSpeed;
  group.add(mesh);
  return mesh;
}

/**
 * Modular Procedural 3D Model Builders
 * Allows Class 6-10 Biology, Physics, Chemistry, and Mathematics catalog models
 * to render interactively in the unified Three.js viewer immediately, and can be
 * swapped for a .glb asset in models.ts without changing any viewer code.
 */
export function buildProceduralModel(id: ProceduralModelId): THREE.Group {
  const group = new THREE.Group();
  group.name = `procedural_${id}`;

  switch (id) {
    case 'plant-cell': {
      // Outer Cell Wall (translucent rounded box/hex prism)
      addPart(
        group,
        'cell-wall',
        new THREE.CylinderGeometry(0.95, 0.95, 0.55, 6),
        makeMat(0x22c55e, { opacity: 0.32, roughness: 0.5 }),
      );
      // Central Vacuole
      addPart(
        group,
        'vacuole',
        new THREE.SphereGeometry(0.38, 24, 18),
        makeMat(0x38bdf8, { opacity: 0.62, roughness: 0.2 }),
        [-0.18, 0.02, 0.05],
      );
      // Nucleus + Nucleolus
      addPart(
        group,
        'nucleus',
        new THREE.SphereGeometry(0.24, 24, 20),
        makeMat(0x8b5cf6, { roughness: 0.3, emissive: 0x2e1065 }),
        [0.36, 0.1, 0.12],
      );
      // Chloroplasts
      addPart(
        group,
        'chloroplast-1',
        new THREE.CapsuleGeometry(0.11, 0.18, 8, 16),
        makeMat(0x16a34a, { roughness: 0.28 }),
        [-0.48, 0.14, -0.25],
        [0.3, 0.4, 0.8],
      );
      addPart(
        group,
        'chloroplast-2',
        new THREE.CapsuleGeometry(0.11, 0.18, 8, 16),
        makeMat(0x16a34a, { roughness: 0.28 }),
        [0.44, -0.1, -0.32],
        [-0.2, 0.7, 0.5],
      );
      // Mitochondria
      addPart(
        group,
        'mitochondria',
        new THREE.CapsuleGeometry(0.09, 0.16, 8, 16),
        makeMat(0xf97316, { roughness: 0.32, emissive: 0x431407 }),
        [0.05, -0.12, 0.45],
        [0.4, 0.2, 1.1],
        { animRole: 'pulse-flow', animPhase: 0 },
      );
      break;
    }

    case 'optics-bench': {
      // Optical Bench Base Rail
      addPart(
        group,
        'optical-axis',
        new THREE.CylinderGeometry(0.025, 0.025, 2.0, 12),
        makeMat(0x94a3b8, { metalness: 0.6, roughness: 0.3 }),
        [0, 0, 0],
        [0, 0, Math.PI / 2],
      );
      // Concave Mirror / Convex Lens Disc
      addPart(
        group,
        'convex-lens',
        new THREE.SphereGeometry(0.45, 28, 20),
        makeMat(0x38bdf8, { opacity: 0.55, roughness: 0.1, metalness: 0.15 }),
        [0, 0, 0],
      );
      // Scale lens thinly along X
      const lens = group.children[group.children.length - 1];
      lens.scale.set(0.22, 1, 1);

      // Incident & Refracted Light Rays
      addPart(
        group,
        'ray-parallel',
        new THREE.CylinderGeometry(0.018, 0.018, 1.75, 10),
        makeMat(0xfacc15, { emissive: 0xca8a04 }),
        [-0.08, 0.24, 0],
        [0, 0, Math.PI / 2],
        { animRole: 'pulse-flow', animPhase: 0.2 },
      );
      addPart(
        group,
        'ray-converging-top',
        new THREE.CylinderGeometry(0.018, 0.018, 0.95, 10),
        makeMat(0xf59e0b, { emissive: 0xb45309 }),
        [0.42, 0.12, 0],
        [0, 0, 1.85],
        { animRole: 'pulse-flow', animPhase: 1.0 },
      );
      // Focal Point Marker
      addPart(
        group,
        'focal-point',
        new THREE.SphereGeometry(0.08, 16, 16),
        makeMat(0xef4444, { emissive: 0x7f1d1d }),
        [0.65, 0, 0],
        [0, 0, 0],
        { animRole: 'pulse-flow', animPhase: 0.5 },
      );
      // Object Arrow
      addPart(
        group,
        'object-arrow',
        new THREE.ConeGeometry(0.08, 0.35, 12),
        makeMat(0x10b981, { emissive: 0x064e3b }),
        [-0.75, 0.18, 0],
      );
      break;
    }

    case 'electric-circuit': {
      // Closed Circuit Loop Wires (4 segments)
      const wireMat = makeMat(0x64748b, { metalness: 0.7, roughness: 0.25 });
      addPart(group, 'wire-top', new THREE.CylinderGeometry(0.025, 0.025, 1.4, 12), wireMat, [0, 0.45, 0], [0, 0, Math.PI / 2]);
      addPart(group, 'wire-bottom', new THREE.CylinderGeometry(0.025, 0.025, 1.4, 12), wireMat, [0, -0.45, 0], [0, 0, Math.PI / 2]);
      addPart(group, 'wire-left', new THREE.CylinderGeometry(0.025, 0.025, 0.9, 12), wireMat, [-0.7, 0, 0]);
      addPart(group, 'wire-right', new THREE.CylinderGeometry(0.025, 0.025, 0.9, 12), wireMat, [0.7, 0, 0]);

      // DC Battery Cell (Left)
      addPart(
        group,
        'battery-cell',
        new THREE.CylinderGeometry(0.14, 0.14, 0.42, 20),
        makeMat(0x3b82f6, { roughness: 0.3 }),
        [-0.7, 0, 0],
      );
      addPart(
        group,
        'battery-terminal',
        new THREE.CylinderGeometry(0.07, 0.07, 0.08, 16),
        makeMat(0xef4444, { emissive: 0x7f1d1d }),
        [-0.7, 0.25, 0],
      );

      // Resistor (Top)
      addPart(
        group,
        'resistor',
        new THREE.CylinderGeometry(0.11, 0.11, 0.48, 18),
        makeMat(0xf59e0b, { roughness: 0.35 }),
        [0, 0.45, 0],
        [0, 0, Math.PI / 2],
      );

      // Bulb / Load (Right)
      addPart(
        group,
        'load-bulb',
        new THREE.SphereGeometry(0.18, 20, 20),
        makeMat(0xfde047, { emissive: 0xca8a04, roughness: 0.2 }),
        [0.7, 0, 0],
        [0, 0, 0],
        { animRole: 'pulse-flow', animPhase: 0 },
      );

      // Ammeter Node (Bottom)
      addPart(
        group,
        'ammeter',
        new THREE.CylinderGeometry(0.16, 0.16, 0.12, 20),
        makeMat(0x10b981, { roughness: 0.3 }),
        [0, -0.45, 0],
        [Math.PI / 2, 0, 0],
      );
      break;
    }

    case 'water-molecule': {
      // Central Oxygen / Carbon Atom
      addPart(
        group,
        'oxygen-atom',
        new THREE.SphereGeometry(0.36, 28, 24),
        makeMat(0xef4444, { roughness: 0.25, emissive: 0x450a0a }),
        [0, 0.12, 0],
      );
      // Two Hydrogen Atoms at 104.5° angle
      const angle = (104.5 * Math.PI) / 180;
      const dist = 0.72;
      const hx = Math.sin(angle / 2) * dist;
      const hy = -Math.cos(angle / 2) * dist + 0.12;

      addPart(
        group,
        'hydrogen-left',
        new THREE.SphereGeometry(0.22, 24, 20),
        makeMat(0xe2e8f0, { roughness: 0.2 }),
        [-hx, hy, 0],
        [0, 0, 0],
        { animRole: 'vibrate-atom', animPhase: 0 },
      );
      addPart(
        group,
        'hydrogen-right',
        new THREE.SphereGeometry(0.22, 24, 20),
        makeMat(0xe2e8f0, { roughness: 0.2 }),
        [hx, hy, 0],
        [0, 0, 0],
        { animRole: 'vibrate-atom', animPhase: Math.PI },
      );

      // Covalent Bonds
      addPart(
        group,
        'covalent-bond-1',
        new THREE.CylinderGeometry(0.055, 0.055, dist, 14),
        makeMat(0x94a3b8, { metalness: 0.4 }),
        [-hx / 2, (0.12 + hy) / 2, 0],
        [0, 0, -angle / 2],
      );
      addPart(
        group,
        'covalent-bond-2',
        new THREE.CylinderGeometry(0.055, 0.055, dist, 14),
        makeMat(0x94a3b8, { metalness: 0.4 }),
        [hx / 2, (0.12 + hy) / 2, 0],
        [0, 0, angle / 2],
      );

      // Electron Orbit Ring
      addPart(
        group,
        'electron-cloud',
        new THREE.TorusGeometry(0.56, 0.018, 12, 48),
        makeMat(0x38bdf8, { emissive: 0x0369a1, opacity: 0.75 }),
        [0, 0.12, 0],
        [0.8, 0.4, 0],
        { animRole: 'orbit-electron', animSpeed: 1.4 },
      );
      break;
    }

    case 'crystal-lattice': {
      // 3x3x3 Ionic Na+ / Cl- Lattice Cube
      const spacing = 0.44;
      let idx = 0;
      for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
          for (let z = -1; z <= 1; z++) {
            const isCation = (x + y + z) % 2 === 0;
            const partName = isCation ? `sodium-ion-${idx}` : `chloride-ion-${idx}`;
            addPart(
              group,
              partName,
              new THREE.SphereGeometry(isCation ? 0.11 : 0.15, 16, 14),
              makeMat(isCation ? 0x8b5cf6 : 0x10b981, { roughness: 0.25 }),
              [x * spacing, y * spacing, z * spacing],
            );
            idx++;
          }
        }
      }
      // Lattice Frame Cage
      addPart(
        group,
        'unit-cell-frame',
        new THREE.BoxGeometry(spacing * 2, spacing * 2, spacing * 2),
        new THREE.MeshStandardMaterial({ color: 0x94a3b8, wireframe: true }),
      );
      break;
    }

    case 'quadratic-parabola': {
      // X and Y Axes
      const axisMat = makeMat(0x64748b, { roughness: 0.4 });
      addPart(group, 'x-axis', new THREE.CylinderGeometry(0.02, 0.02, 1.9, 10), axisMat, [0, 0, 0], [0, 0, Math.PI / 2]);
      addPart(group, 'y-axis', new THREE.CylinderGeometry(0.02, 0.02, 1.9, 10), axisMat, [0, 0, 0]);

      // Parabolic Curve y = 1.4x^2 - 0.55 built from smooth tube points
      const pts: THREE.Vector3[] = [];
      for (let i = -12; i <= 12; i++) {
        const x = (i / 12) * 0.85;
        const y = 1.4 * x * x - 0.55;
        pts.push(new THREE.Vector3(x, y, 0));
      }
      const curve = new THREE.CatmullRomCurve3(pts);
      addPart(
        group,
        'parabola-curve',
        new THREE.TubeGeometry(curve, 40, 0.04, 12, false),
        makeMat(0x6366f1, { emissive: 0x312e81, roughness: 0.25 }),
      );

      // Vertex Point
      addPart(
        group,
        'vertex-point',
        new THREE.SphereGeometry(0.085, 18, 18),
        makeMat(0xf59e0b, { emissive: 0x78350f }),
        [0, -0.55, 0],
        [0, 0, 0],
        { animRole: 'pulse-flow', animPhase: 0 },
      );

      // Two Real Roots on X-axis (y = 0 => x = ±sqrt(0.55/1.4) ≈ ±0.627)
      const rootX = Math.sqrt(0.55 / 1.4);
      addPart(
        group,
        'roots-intercept-left',
        new THREE.SphereGeometry(0.075, 16, 16),
        makeMat(0x10b981, { emissive: 0x064e3b }),
        [-rootX, 0, 0],
      );
      addPart(
        group,
        'roots-intercept-right',
        new THREE.SphereGeometry(0.075, 16, 16),
        makeMat(0x10b981, { emissive: 0x064e3b }),
        [rootX, 0, 0],
      );
      break;
    }

    case 'mensuration-solids': {
      // Composite Cylinder Base + Cone Top + Hemisphere Cap
      addPart(
        group,
        'cylinder-body',
        new THREE.CylinderGeometry(0.45, 0.45, 0.72, 28),
        makeMat(0x3b82f6, { roughness: 0.3 }),
        [0, -0.2, 0],
      );
      addPart(
        group,
        'cone-apex',
        new THREE.ConeGeometry(0.45, 0.62, 28),
        makeMat(0xf59e0b, { roughness: 0.3 }),
        [0, 0.47, 0],
      );
      addPart(
        group,
        'hemisphere-base',
        new THREE.SphereGeometry(0.45, 28, 18, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
        makeMat(0x10b981, { roughness: 0.3 }),
        [0, -0.56, 0],
      );
      break;
    }
  }

  return group;
}

