import * as THREE from 'three';
import { AnimationBehaviorFn, AnimationBehaviorId } from './types';

/**
 * Modular Animation Behavior Registry.
 * Each model references an AnimationBehaviorId in its catalog capabilities,
 * keeping model-specific motion independent from the core 3D viewer.
 */
const BEHAVIOR_REGISTRY: Record<AnimationBehaviorId, AnimationBehaviorFn> = {
  none: () => {},

  'cardiac-pulse': ({ root, baseScale, elapsedSec }) => {
    // 72 BPM rhythmic lub-dub cardiac cycle (0.833s period)
    const t = elapsedSec % 0.833;
    let pulse = 0;

    if (t < 0.12) {
      // Atrial Systole (lub)
      pulse = Math.sin((t / 0.12) * Math.PI) * 0.035;
    } else if (t >= 0.18 && t < 0.35) {
      // Ventricular Systole (dub - stronger)
      pulse = Math.sin(((t - 0.18) / 0.17) * Math.PI) * 0.06;
    }

    const s = baseScale * (1 + pulse);
    root.scale.set(s, s, s);
  },

  'orbital-spin': ({ root, elapsedSec }) => {
    root.traverse((child) => {
      if (child.userData.animRole === 'orbit-electron' || child.userData.animRole === 'spin-part') {
        const speed = typeof child.userData.animSpeed === 'number' ? child.userData.animSpeed : 1.2;
        child.rotation.z = elapsedSec * speed;
        child.rotation.y = elapsedSec * speed * 0.6;
      }
    });
  },

  'wave-flow': ({ root, elapsedSec }) => {
    root.traverse((child) => {
      if (child.userData.animRole === 'pulse-flow') {
        const phase = typeof child.userData.animPhase === 'number' ? child.userData.animPhase : 0;
        const pulse = 0.88 + 0.22 * Math.sin(elapsedSec * 4.5 - phase);
        child.scale.setScalar(pulse);
      }
    });
  },

  'bond-vibrate': ({ root, elapsedSec }) => {
    root.traverse((child) => {
      if (child.userData.animRole === 'vibrate-atom') {
        const orig = child.userData.origPosition as THREE.Vector3 | undefined;
        const phase = typeof child.userData.animPhase === 'number' ? child.userData.animPhase : 0;
        if (orig) {
          const offset = Math.sin(elapsedSec * 5 + phase) * 0.025;
          child.position.set(orig.x + offset, orig.y + offset * 0.5, orig.z);
        }
      }
    });
  },

  'gentle-float': ({ root, elapsedSec }) => {
    const baseY = typeof root.userData.baseY === 'number' ? root.userData.baseY : 0;
    root.position.y = baseY + Math.sin(elapsedSec * 1.8) * 0.04;
  },
};

export function runAnimationBehavior(
  behaviorId: AnimationBehaviorId,
  ctx: {
    root: THREE.Group;
    baseScale: number;
    elapsedSec: number;
    deltaSec: number;
  },
): void {
  const fn = BEHAVIOR_REGISTRY[behaviorId] ?? BEHAVIOR_REGISTRY.none;
  fn(ctx);
}

export function resetAnimationTransform(root: THREE.Group, baseScale: number): void {
  root.scale.set(baseScale, baseScale, baseScale);
  if (typeof root.userData.baseY === 'number') {
    root.position.y = root.userData.baseY;
  }
}

