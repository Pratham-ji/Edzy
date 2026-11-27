export type Default3DModelId =
  | 'human-heart-3d'
  | 'optics-ray-bench-3d'
  | 'quadratic-graph-3d'
  | 'plant-animal-cell-3d'
  | 'electric-circuit-3d'
  | 'none';

export interface Default3DModelSpec {
  id: Default3DModelId;
  name: string;
  category: string;
  targetNodes: string[];
  description: string;
  keywords: string[];
}

export const EDZY_DEFAULT_3D_MODELS: Default3DModelSpec[] = [
  {
    id: 'human-heart-3d',
    name: 'Human Heart 3D',
    category: 'Biology & Anatomy',
    targetNodes: ['Aorta', 'Left Ventricle', 'Bicuspid Valve', 'Pulmonary Vein'],
    description: 'Real-time volumetric cardiac chambers, systemic aorta arch, and valve blood flow simulation.',
    keywords: ['heart', 'cardiac', 'circulation', 'life processes', 'blood', 'aorta', 'ventricle', 'biology', 'respiration', 'excretion', 'nephron'],
  },
  {
    id: 'optics-ray-bench-3d',
    name: 'Optics Ray Bench 3D',
    category: 'Physics (Optics)',
    targetNodes: ['Concave Mirror Focus', 'Optical Axis', 'Convex Lens 2F', 'Glass Prism Refraction'],
    description: 'Interactive spherical mirror & thin lens ray tracing with adjustable focal distance and Snell refraction.',
    keywords: ['light', 'optics', 'lens', 'mirror', 'reflection', 'refraction', 'snell', 'dioptre', 'concave', 'convex', 'ray'],
  },
  {
    id: 'quadratic-graph-3d',
    name: 'Quadratic Graph 3D',
    category: 'Mathematics',
    targetNodes: ['Parabola Vertex', 'Roots Intercept', 'Discriminant Surface'],
    description: 'Dynamic 3D surface plotting of ax² + bx + c = 0 showing real-time discriminant root shifts.',
    keywords: ['quadratic', 'parabola', 'discriminant', 'polynomial', 'equation', 'algebra', 'graph', 'mathematics', 'roots'],
  },
  {
    id: 'plant-animal-cell-3d',
    name: 'Plant & Animal Cell 3D',
    category: 'Biology (Cell)',
    targetNodes: ['Nucleus', 'Mitochondria', 'Chloroplast', 'Plasma Membrane', 'Golgi Apparatus'],
    description: 'Cross-sectional organelle explorer comparing eukaryotic plant cell walls/chloroplasts vs animal cells.',
    keywords: ['cell', 'organelle', 'mitochondria', 'nucleus', 'chloroplast', 'cytoplasm', 'photosynthesis', 'stomata', 'fundamental unit'],
  },
  {
    id: 'electric-circuit-3d',
    name: 'Electric Circuit 3D',
    category: 'Physics (Electricity)',
    targetNodes: ['Ohm Resistor', 'Series-Parallel Loop', 'Ammeter & Voltmeter', 'Solenoid Coil'],
    description: 'Interactive DC circuit workbench demonstrating Ohm law voltage drops, parallel current splits, and electromagnetism.',
    keywords: ['electric', 'circuit', 'ohm', 'resistor', 'current', 'voltage', 'magnet', 'solenoid', 'induction', 'series', 'parallel'],
  },
  {
    id: 'none',
    name: 'None',
    category: 'Text & Notes Only',
    targetNodes: [],
    description: 'Pure conceptual flowchart, revision notes, and board practice sheet without a 3D lab overlay.',
    keywords: [],
  },
];

export function normalize3dModelId(raw?: string): Default3DModelId {
  const val = (raw || '').toLowerCase().trim();
  if (!val || val === 'none') return 'none';
  if (val.includes('heart') || val.includes('cardiac')) return 'human-heart-3d';
  if (val.includes('optic') || val.includes('bench') || val.includes('ray')) return 'optics-ray-bench-3d';
  if (val.includes('quadratic') || val.includes('graph') || val.includes('parabola')) return 'quadratic-graph-3d';
  if (val.includes('cell')) return 'plant-animal-cell-3d';
  if (val.includes('circuit') || val.includes('electric')) return 'electric-circuit-3d';
  return 'none';
}

export function getModelSpecByIdOrName(idOrName?: string): Default3DModelSpec {
  const id = normalize3dModelId(idOrName);
  return EDZY_DEFAULT_3D_MODELS.find((m) => m.id === id) || EDZY_DEFAULT_3D_MODELS[EDZY_DEFAULT_3D_MODELS.length - 1];
}

export function autoMatch3dModel(subject: string, title: string, rawText = ''): Default3DModelSpec {
  const combined = `${subject} ${title} ${rawText}`.toLowerCase();
  let bestScore = 0;
  let bestModel = EDZY_DEFAULT_3D_MODELS[EDZY_DEFAULT_3D_MODELS.length - 1];

  for (const model of EDZY_DEFAULT_3D_MODELS) {
    if (model.id === 'none') continue;
    let score = 0;
    for (const kw of model.keywords) {
      if (combined.includes(kw)) {
        score += kw.length > 6 ? 2 : 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestModel = model;
    }
  }

  return bestModel;
}
