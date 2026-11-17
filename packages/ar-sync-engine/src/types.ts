export type Vector3D = {
  x: number;
  y: number;
  z: number;
};

export type Quaternion4D = {
  x: number;
  y: number;
  z: number;
  w: number;
};

export type ARModelSubject = 'BIOLOGY' | 'PHYSICS' | 'CHEMISTRY' | 'ASTRONOMY' | 'MATHEMATICS';

export interface ARModelMetadata {
  id: string;
  title: string;
  subject: ARModelSubject;
  targetClass: number; // e.g. 8 for Class 8
  board: 'CBSE' | 'ICSE' | 'STATE';
  assetUrl: string; // GLTF / USDZ / OBJ
  thumbnailUrl: string;
  defaultScale: number;
  parts: {
    partId: string;
    label: string;
    description: string;
    localAnchor: Vector3D;
  }[];
}

export type ARDirectiveType = 
  | 'SESSION_INIT'
  | 'MODEL_LOAD'
  | 'CAMERA_UPDATE'
  | 'TRANSFORM_UPDATE'
  | 'PART_HIGHLIGHT'
  | 'EXPLODE_FACTOR'
  | 'AI_DIRECTIVE_PIN'
  | 'TEACHER_POINTER'
  | 'SESSION_END';

export interface ARDirectivePayload {
  sessionId: string;
  teacherId: string;
  schoolId: string;
  classSectionId: string;
  timestamp: number;
  type: ARDirectiveType;
  modelId?: string;
  cameraPosition?: Vector3D;
  cameraRotation?: Quaternion4D;
  zoomFactor?: number;
  activePartId?: string;
  explodeFactor?: number; // 0.0 to 1.0
  pointerPosition?: Vector3D;
  aiNote?: {
    title: string;
    content: string;
    hindiTranslation?: string;
    coordinate: Vector3D;
  };
}

export interface ARSessionSyncState {
  sessionId: string;
  activeModel: ARModelMetadata | null;
  teacherConnected: boolean;
  studentCount: number;
  currentExplodeFactor: number;
  highlightedPartId: string | null;
  lastDirective: ARDirectivePayload | null;
}
