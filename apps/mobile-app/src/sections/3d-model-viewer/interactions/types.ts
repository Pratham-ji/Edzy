import * as THREE from 'three';

export type ClassLevel = 6 | 7 | 8 | 9 | 10;

export type ModelSubject = 'Biology' | 'Physics' | 'Chemistry' | 'Mathematics';

export type ExplorerViewMode = 'solid' | 'cross-section' | 'exploded';

export type InteractionMode = 'orbit' | 'pan';

export type AnimationBehaviorId =
  | 'none'
  | 'cardiac-pulse'
  | 'orbital-spin'
  | 'wave-flow'
  | 'bond-vibrate'
  | 'gentle-float';

export type ProceduralModelId =
  | 'plant-cell'
  | 'optics-bench'
  | 'electric-circuit'
  | 'water-molecule'
  | 'crystal-lattice'
  | 'quadratic-parabola'
  | 'mensuration-solids';

export type BadgeTone = 'danger' | 'info' | 'success' | 'warning' | 'brand';

export interface ModelComponentNode {
  id: string;
  number: number;
  label: string;
  role: string;
  category: string;
  badgeLabel: string;
  badgeTone: BadgeTone;
  keyMetricLabel: string;
  keyMetricValue: string;
  examRelevance?: string;
  shortDesc: string;
  fullDesc: string;
  /** Coordinates in normalized model space (-1 to +1 range) */
  position: [number, number, number];
  /** Optional Three.js mesh name fragments for mesh-level isolation & highlighting */
  meshNames?: string[];
  /** Optional highlight tint hex (defaults to model accentColor) */
  highlightColor?: number;
}

export interface ModelCapabilities {
  supportsAnimations: boolean;
  defaultAnimationEnabled: boolean;
  animationBehavior: AnimationBehaviorId;
  animationLabel: string;
  animationStatusText?: string;
  supportsExplode: boolean;
  supportsCrossSection: boolean;
  supportsPartIsolation: boolean;
  supportsWireframe: boolean;
  supportsAnnotations: boolean;
}

export interface ModelMaterialConfig {
  /** Override base color when GLB lacks embedded textures (hex number) */
  fallbackColor?: number;
  roughness?: number;
  metalness?: number;
  preserveOriginalMaterials?: boolean;
}

export interface ModelCameraDefaults {
  phi?: number;
  theta?: number;
  radius?: number;
}

export interface ModelAttribution {
  title: string;
  author: string;
  license: string;
  sourceUrl: string;
}

export interface ModelEntry {
  id: string;
  aliases?: string[];
  name: string;
  subtitle?: string;
  subject: ModelSubject;
  classLevel: ClassLevel;
  classes: ClassLevel[];
  chapterNumber: number;
  chapter: string;
  boardRelevance: string;
  description: string;
  /** require() module ID for bundled .glb/.gltf or HTTPS URL */
  asset?: number | string;
  /** Modular procedural Three.js fallback when .glb is not yet bundled */
  proceduralModelId?: ProceduralModelId;
  accentColor: string;
  materialConfig?: ModelMaterialConfig;
  cameraDefaults?: ModelCameraDefaults;
  capabilities: ModelCapabilities;
  attribution?: ModelAttribution;
  components: ModelComponentNode[];
  tags?: string[];
}

export interface AnimationFrameContext {
  root: THREE.Group;
  baseScale: number;
  elapsedSec: number;
  deltaSec: number;
}

export type AnimationBehaviorFn = (ctx: AnimationFrameContext) => void;

