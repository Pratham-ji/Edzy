/**
 * Centralized 3D Model Registry & Curriculum Catalog (Classes 6-10)
 *
 * Covers Biology, Physics, Chemistry, and Mathematics.
 * The Human Heart (.glb) is the primary sample model.
 * Adding a new .glb model only requires appending a ModelEntry here —
 * the 3D viewer, controls, filters, and detail panels adapt automatically.
 */
import { ClassLevel, ModelEntry, ModelSubject } from '../interactions/types';

export type {
  AnimationBehaviorId,
  BadgeTone,
  ClassLevel,
  ExplorerViewMode,
  InteractionMode,
  ModelAttribution,
  ModelCapabilities,
  ModelComponentNode,
  ModelEntry,
  ModelSubject,
  ProceduralModelId,
} from '../interactions/types';

/** Backward-compatible alias for legacy consumers */
export type ModelAnnotation = import('../interactions/types').ModelComponentNode;

export const CLASS_LEVELS: ClassLevel[] = [6, 7, 8, 9, 10];

export const MODEL_SUBJECTS: ModelSubject[] = [
  'Biology',
  'Physics',
  'Chemistry',
  'Mathematics',
];

export const MODEL_CATALOG: ModelEntry[] = [
  // ── 1. HUMAN HEART (Primary .GLB Sample) ──────────────────────────────────
  {
    id: 'human-heart-3d',
    aliases: ['human-heart', 'Human Heart 3D', 'Human Heart (3D Spatial Lab)'],
    name: 'Human Heart',
    subtitle: '3D Spatial Cardiac Lab',
    subject: 'Biology',
    classLevel: 10,
    classes: [7, 10],
    chapterNumber: 6,
    chapter: 'Ch 6: Life Processes',
    boardRelevance: 'Very High (5 Marks)',
    description:
      'Detailed 3D anatomical model of the human heart showing chambers, systemic & pulmonary vessels, valves, and 72 BPM cardiac rhythm.',
    asset: require('../assets/realistic_human_heart.glb'),
    accentColor: '#E74C3C',
    materialConfig: {
      fallbackColor: 0xba2c2c,
      roughness: 0.35,
      metalness: 0.1,
    },
    cameraDefaults: {
      phi: Math.PI / 2,
      theta: 0,
      radius: 3.0,
    },
    capabilities: {
      supportsAnimations: true,
      defaultAnimationEnabled: true,
      animationBehavior: 'cardiac-pulse',
      animationLabel: '72 BPM Pulse',
      animationStatusText: '72 BPM • Cardiac Cycle active',
      supportsExplode: true,
      supportsCrossSection: true,
      supportsPartIsolation: true,
      supportsWireframe: true,
      supportsAnnotations: true,
    },
    attribution: {
      title: 'Realistic Human Heart',
      author: 'neshallads',
      license: 'CC-BY-4.0',
      sourceUrl: 'https://sketchfab.com/3d-models/realistic-human-heart-3f8072336ce94d18b3d0d055a1ece089',
    },
    tags: ['heart', 'aorta', 'ventricle', 'circulation', 'cardiac', 'blood'],
    components: [
      {
        id: 'Aorta',
        number: 1,
        label: 'Aorta',
        role: 'Systemic Circulation',
        category: 'Artery',
        badgeLabel: 'Oxygen-Rich (O₂)',
        badgeTone: 'danger',
        keyMetricLabel: 'BLOOD PRESSURE',
        keyMetricValue: '120 mmHg',
        examRelevance: 'Very High (5 Marks)',
        shortDesc: 'Main systemic arterial arch',
        fullDesc:
          'Main systemic arterial arch delivering high-pressure oxygenated blood from the left ventricle to all organs and tissues of the body.',
        position: [0.08, 0.72, 0.05],
        highlightColor: 0xef4444,
      },
      {
        id: 'Left Ventricle',
        number: 2,
        label: 'Left Ventricle',
        role: 'High-Pressure Pump',
        category: 'Chamber',
        badgeLabel: 'Oxygen-Rich (O₂)',
        badgeTone: 'danger',
        keyMetricLabel: 'WALL PRESSURE',
        keyMetricValue: '120 mmHg',
        examRelevance: 'Very High (5 Marks)',
        shortDesc: 'Thickest muscular pump chamber',
        fullDesc:
          'Features a 3x thicker muscular wall (myocardium) than the right ventricle to overcome systemic vascular resistance.',
        position: [0.36, -0.28, 0.22],
        highlightColor: 0xf43f5e,
      },
      {
        id: 'Pulmonary Vein',
        number: 3,
        label: 'Pulmonary Vein',
        role: 'Oxygen Inflow',
        category: 'Vein',
        badgeLabel: 'Oxygen-Rich (O₂)',
        badgeTone: 'danger',
        keyMetricLabel: 'INFLOW PRESSURE',
        keyMetricValue: '8-10 mmHg',
        examRelevance: 'High (3 Marks)',
        shortDesc: 'Only vein carrying oxygenated blood',
        fullDesc:
          'Crucial CBSE exception: the only vein carrying oxygen-rich blood directly from the lungs into the left atrium.',
        position: [0.34, 0.18, -0.32],
        highlightColor: 0xfb7185,
      },
      {
        id: 'Bicuspid Valve',
        number: 4,
        label: 'Bicuspid Valve',
        role: 'Atrioventricular Gate',
        category: 'Valve',
        badgeLabel: 'One-Way Flap',
        badgeTone: 'brand',
        keyMetricLabel: 'FLOW DIRECTION',
        keyMetricValue: 'LA → LV Only',
        examRelevance: 'High (3 Marks)',
        shortDesc: 'Prevents backflow into left atrium',
        fullDesc:
          'Also called the Mitral Valve. Closes tightly during ventricular contraction to prevent backflow of oxygenated blood into the left atrium.',
        position: [0.22, 0.04, 0.06],
        highlightColor: 0x818cf8,
      },
      {
        id: 'Pulmonary Trunk',
        number: 5,
        label: 'Pulmonary Trunk',
        role: 'Pulmonary Circulation',
        category: 'Artery',
        badgeLabel: 'Deoxygenated (CO₂)',
        badgeTone: 'info',
        keyMetricLabel: 'PULMONARY PRESSURE',
        keyMetricValue: '25 mmHg',
        examRelevance: 'High (3 Marks)',
        shortDesc: 'Carries blood to the lungs',
        fullDesc:
          'Arises from the right ventricle and divides into left and right pulmonary arteries carrying deoxygenated blood to the lungs for gas exchange.',
        position: [0.24, 0.48, 0.22],
        highlightColor: 0x38bdf8,
      },
      {
        id: 'Superior Vena Cava',
        number: 6,
        label: 'Superior Vena Cava',
        role: 'Systemic Venous Return',
        category: 'Vein',
        badgeLabel: 'Deoxygenated (CO₂)',
        badgeTone: 'info',
        keyMetricLabel: 'VENOUS PRESSURE',
        keyMetricValue: '2-6 mmHg',
        examRelevance: 'Medium (2 Marks)',
        shortDesc: 'Returns blood from upper body',
        fullDesc:
          'Large vein returning deoxygenated blood from the head, neck, and upper limbs directly into the right atrium.',
        position: [-0.35, 0.62, -0.12],
        highlightColor: 0x0ea5e9,
      },
      {
        id: 'Right Ventricle',
        number: 7,
        label: 'Right Ventricle',
        role: 'Pulmonary Pump',
        category: 'Chamber',
        badgeLabel: 'Deoxygenated (CO₂)',
        badgeTone: 'info',
        keyMetricLabel: 'WALL PRESSURE',
        keyMetricValue: '25 mmHg',
        examRelevance: 'High (3 Marks)',
        shortDesc: 'Pumps blood to lungs',
        fullDesc:
          'Forms the anterior surface of the heart. Receives deoxygenated blood from the right atrium and pumps it into the pulmonary circuit.',
        position: [-0.22, -0.24, 0.36],
        highlightColor: 0x06b6d4,
      },
    ],
  },

  // ── 2. PLANT & ANIMAL CELL (Biology — Classes 8 & 9) ──────────────────────
  {
    id: 'plant-animal-cell-3d',
    aliases: ['Plant & Animal Cell 3D', 'plant-cell'],
    name: 'Plant Cell Organelles',
    subtitle: 'Eukaryotic Cell Architecture',
    subject: 'Biology',
    classLevel: 9,
    classes: [8, 9],
    chapterNumber: 5,
    chapter: 'Ch 5: The Fundamental Unit of Life',
    boardRelevance: 'High (5 Marks)',
    description:
      'Interactive 3D plant cell highlighting the rigid cellulose cell wall, nucleus, chloroplasts, mitochondria, and central vacuole.',
    proceduralModelId: 'plant-cell',
    accentColor: '#10B981',
    capabilities: {
      supportsAnimations: true,
      defaultAnimationEnabled: true,
      animationBehavior: 'wave-flow',
      animationLabel: 'ATP Activity',
      animationStatusText: 'Mitochondrial ATP synthesis active',
      supportsExplode: true,
      supportsCrossSection: true,
      supportsPartIsolation: true,
      supportsWireframe: true,
      supportsAnnotations: true,
    },
    tags: ['cell', 'chloroplast', 'nucleus', 'mitochondria', 'vacuole'],
    components: [
      {
        id: 'Chloroplast',
        number: 1,
        label: 'Chloroplast',
        role: 'Photosynthesis Site',
        category: 'Plastid',
        badgeLabel: 'Autotrophic Energy',
        badgeTone: 'success',
        keyMetricLabel: 'PIGMENT',
        keyMetricValue: 'Chlorophyll a/b',
        examRelevance: 'Very High (5 Marks)',
        shortDesc: 'Converts light to glucose',
        fullDesc:
          'Double-membrane plastid containing chlorophyll in thylakoid stacks (grana) where light-dependent photolysis occurs.',
        position: [-0.48, 0.14, -0.25],
        meshNames: ['chloroplast'],
        highlightColor: 0x22c55e,
      },
      {
        id: 'Nucleus',
        number: 2,
        label: 'Nucleus',
        role: 'Genetic Control Center',
        category: 'Organelle',
        badgeLabel: 'DNA & Chromatin',
        badgeTone: 'brand',
        keyMetricLabel: 'STRUCTURE',
        keyMetricValue: 'Double Membrane',
        examRelevance: 'High (3 Marks)',
        shortDesc: 'Regulates cell activities & heredity',
        fullDesc:
          'Contains chromosomes (DNA + histone proteins) and controls protein synthesis, cell growth, and mitotic division.',
        position: [0.36, 0.1, 0.12],
        meshNames: ['nucleus'],
        highlightColor: 0x8b5cf6,
      },
      {
        id: 'Mitochondria',
        number: 3,
        label: 'Mitochondria',
        role: 'Cellular Respiration',
        category: 'Powerhouse',
        badgeLabel: 'ATP Synthesis',
        badgeTone: 'warning',
        keyMetricLabel: 'OUTPUT',
        keyMetricValue: '38 ATP / Glucose',
        examRelevance: 'Very High (3 Marks)',
        shortDesc: 'Powerhouse of the cell',
        fullDesc:
          'Semi-autonomous organelle with folded inner cristae that generate ATP through aerobic respiration.',
        position: [0.05, -0.12, 0.45],
        meshNames: ['mitochondria'],
        highlightColor: 0xf97316,
      },
      {
        id: 'Cell Wall',
        number: 4,
        label: 'Cell Wall',
        role: 'Structural Rigidity',
        category: 'Boundary',
        badgeLabel: 'Cellulose Matrix',
        badgeTone: 'success',
        keyMetricLabel: 'PERMEABILITY',
        keyMetricValue: 'Freely Permeable',
        examRelevance: 'High (3 Marks)',
        shortDesc: 'Outer protective cellulose layer',
        fullDesc:
          'Rigid non-living cellulose layer outside the plasma membrane that prevents bursting in hypotonic solutions.',
        position: [0, 0.28, 0],
        meshNames: ['cell-wall'],
        highlightColor: 0x4ade80,
      },
    ],
  },

  // ── 3. OPTICS RAY BENCH (Physics — Classes 7, 8, 10) ──────────────────────
  {
    id: 'optics-ray-bench-3d',
    aliases: ['Optics Ray Bench 3D', 'optics-bench'],
    name: 'Optics Ray & Lens Bench',
    subtitle: 'Refraction & Focal Convergence',
    subject: 'Physics',
    classLevel: 10,
    classes: [7, 8, 10],
    chapterNumber: 10,
    chapter: 'Ch 10: Light — Reflection & Refraction',
    boardRelevance: 'Very High (5 Marks)',
    description:
      'Explore principal axis, converging lens geometry, parallel incident rays, focal convergence, and Cartesian sign convention.',
    proceduralModelId: 'optics-bench',
    accentColor: '#3B82F6',
    capabilities: {
      supportsAnimations: true,
      defaultAnimationEnabled: true,
      animationBehavior: 'wave-flow',
      animationLabel: 'Ray Pulse',
      animationStatusText: 'Photon ray propagation active',
      supportsExplode: true,
      supportsCrossSection: true,
      supportsPartIsolation: true,
      supportsWireframe: true,
      supportsAnnotations: true,
    },
    tags: ['optics', 'lens', 'mirror', 'focal', 'refraction', 'light'],
    components: [
      {
        id: 'Concave Mirror Focus',
        number: 1,
        label: 'Principal Focus (F)',
        role: 'Convergence Point',
        category: 'Focal Landmark',
        badgeLabel: 'Real Focus',
        badgeTone: 'danger',
        keyMetricLabel: 'LENS FORMULA',
        keyMetricValue: '1/f = 1/v - 1/u',
        examRelevance: 'Very High (5 Marks)',
        shortDesc: 'Where parallel rays converge',
        fullDesc:
          'Rays parallel to the principal axis refract through a convex lens and meet at Principal Focus F at distance f = R/2.',
        position: [0.65, 0, 0],
        meshNames: ['focal-point'],
        highlightColor: 0xef4444,
      },
      {
        id: 'Optical Axis',
        number: 2,
        label: 'Optical Center & Axis',
        role: 'Reference Axis',
        category: 'Geometry',
        badgeLabel: 'Undeviated Path',
        badgeTone: 'info',
        keyMetricLabel: 'POWER UNIT',
        keyMetricValue: 'P = 1/f (Dioptre)',
        examRelevance: 'High (3 Marks)',
        shortDesc: 'Line passing through optical center',
        fullDesc:
          'Straight line passing through the centers of curvature and optical center O; rays passing through O emerge undeviated.',
        position: [0, 0, 0],
        meshNames: ['convex-lens', 'optical-axis'],
        highlightColor: 0x38bdf8,
      },
      {
        id: 'Incident Ray',
        number: 3,
        label: 'Parallel Incident Ray',
        role: 'Wavefront Propagation',
        category: 'Light Ray',
        badgeLabel: 'Snell Law',
        badgeTone: 'warning',
        keyMetricLabel: 'REFRACTIVE INDEX',
        keyMetricValue: 'n = sin i / sin r',
        examRelevance: 'High (3 Marks)',
        shortDesc: 'Enters parallel to principal axis',
        fullDesc:
          'Bends toward the normal on entering denser glass and away on exiting into air, obeying Snell Law.',
        position: [-0.25, 0.24, 0],
        meshNames: ['ray-parallel', 'ray-converging-top'],
        highlightColor: 0xfacc15,
      },
    ],
  },

  // ── 4. ELECTRIC CIRCUIT & OHM'S LAW (Physics — Classes 6, 7, 10) ──────────
  {
    id: 'electric-circuit-3d',
    aliases: ['Electric Circuit 3D', 'electric-circuit'],
    name: 'DC Circuit & Ohm’s Law Rig',
    subtitle: 'Series Loop & Potential Drop',
    subject: 'Physics',
    classLevel: 10,
    classes: [6, 7, 10],
    chapterNumber: 12,
    chapter: 'Ch 12: Electricity',
    boardRelevance: 'High (5 Marks)',
    description:
      'Inspect a closed DC circuit with battery potential source, fixed resistor, series ammeter, and incandescent load.',
    proceduralModelId: 'electric-circuit',
    accentColor: '#F59E0B',
    capabilities: {
      supportsAnimations: true,
      defaultAnimationEnabled: true,
      animationBehavior: 'wave-flow',
      animationLabel: 'Current Flow',
      animationStatusText: 'Conventional current I = V/R active',
      supportsExplode: true,
      supportsCrossSection: false,
      supportsPartIsolation: true,
      supportsWireframe: true,
      supportsAnnotations: true,
    },
    tags: ['electricity', 'ohm', 'resistor', 'circuit', 'battery', 'ammeter'],
    components: [
      {
        id: 'Resistor',
        number: 1,
        label: 'Fixed Resistor (R)',
        role: 'Current Limiter',
        category: 'Passive Element',
        badgeLabel: 'V = I × R',
        badgeTone: 'warning',
        keyMetricLabel: 'SI UNIT',
        keyMetricValue: 'Ohm (Ω)',
        examRelevance: 'Very High (5 Marks)',
        shortDesc: 'Opposes flow of electric charge',
        fullDesc:
          'Maintains proportional potential drop V = IR across its terminals and converts electrical energy into heat H = I²Rt.',
        position: [0, 0.45, 0],
        meshNames: ['resistor'],
        highlightColor: 0xf59e0b,
      },
      {
        id: 'Battery Cell',
        number: 2,
        label: 'DC Battery Source',
        role: 'Potential Difference',
        category: 'Power Supply',
        badgeLabel: 'EMF Source',
        badgeTone: 'info',
        keyMetricLabel: 'POTENTIAL',
        keyMetricValue: 'Volt (J/C)',
        examRelevance: 'High (3 Marks)',
        shortDesc: 'Drives charge around loop',
        fullDesc:
          'Creates chemical potential difference between positive and negative terminals so free electrons drift continuously.',
        position: [-0.7, 0, 0],
        meshNames: ['battery'],
        highlightColor: 0x3b82f6,
      },
      {
        id: 'Ammeter',
        number: 3,
        label: 'Series Ammeter (A)',
        role: 'Current Sensor',
        category: 'Instrument',
        badgeLabel: 'Low Resistance',
        badgeTone: 'success',
        keyMetricLabel: 'CONNECTION',
        keyMetricValue: 'Always Series',
        examRelevance: 'High (2 Marks)',
        shortDesc: 'Measures electric current in Amperes',
        fullDesc:
          'Connected in series with near-zero internal resistance so it measures total loop current I = Q/t without altering flow.',
        position: [0, -0.45, 0],
        meshNames: ['ammeter'],
        highlightColor: 0x10b981,
      },
    ],
  },

  // ── 5. WATER MOLECULE H2O (Chemistry — Classes 9 & 10) ────────────────────
  {
    id: 'molecular-geometry-3d',
    aliases: ['Water Molecule 3D', 'water-molecule'],
    name: 'H₂O Covalent Molecule',
    subtitle: 'Polar Bond Angle & Orbitals',
    subject: 'Chemistry',
    classLevel: 9,
    classes: [9, 10],
    chapterNumber: 4,
    chapter: 'Ch 4: Carbon & Covalent Bonding',
    boardRelevance: 'High (3 Marks)',
    description:
      'Explore single covalent electron-pair sharing between Oxygen and Hydrogen, bent geometry (104.5°), and electron cloud motion.',
    proceduralModelId: 'water-molecule',
    accentColor: '#06B6D4',
    capabilities: {
      supportsAnimations: true,
      defaultAnimationEnabled: true,
      animationBehavior: 'orbital-spin',
      animationLabel: 'Orbital Spin',
      animationStatusText: 'Valence electron orbital active',
      supportsExplode: true,
      supportsCrossSection: false,
      supportsPartIsolation: true,
      supportsWireframe: true,
      supportsAnnotations: true,
    },
    tags: ['chemistry', 'molecule', 'water', 'covalent', 'bond', 'atom'],
    components: [
      {
        id: 'Oxygen Atom',
        number: 1,
        label: 'Oxygen Atom (O)',
        role: 'Central Electronegative Atom',
        category: 'Atom (Z = 8)',
        badgeLabel: '2 Lone Pairs',
        badgeTone: 'danger',
        keyMetricLabel: 'VALENCY',
        keyMetricValue: '2 (2, 6)',
        examRelevance: 'High (3 Marks)',
        shortDesc: 'Shares 2 electrons to complete octet',
        fullDesc:
          'Oxygen has 6 valence electrons and shares 1 electron each with two hydrogen atoms, leaving 2 lone pairs that bend the bond angle to 104.5°.',
        position: [0, 0.12, 0],
        meshNames: ['oxygen-atom'],
        highlightColor: 0xef4444,
      },
      {
        id: 'Hydrogen Atoms',
        number: 2,
        label: 'Hydrogen Atoms (H)',
        role: 'Terminal Atoms',
        category: 'Atom (Z = 1)',
        badgeLabel: 'Duplet Stable',
        badgeTone: 'info',
        keyMetricLabel: 'BOND ANGLE',
        keyMetricValue: '104.5° Bent',
        examRelevance: 'High (3 Marks)',
        shortDesc: 'Completes K-shell duplet via sharing',
        fullDesc:
          'Each hydrogen shares its single electron with oxygen, acquiring a partial positive charge (δ+) due to oxygen higher electronegativity.',
        position: [0.55, -0.32, 0],
        meshNames: ['hydrogen'],
        highlightColor: 0x38bdf8,
      },
      {
        id: 'Covalent Bond',
        number: 3,
        label: 'Polar Covalent Bond',
        role: 'Shared Electron Pair',
        category: 'Chemical Bond',
        badgeLabel: 'Single Bond (σ)',
        badgeTone: 'brand',
        keyMetricLabel: 'BOND ENERGY',
        keyMetricValue: '464 kJ/mol',
        examRelevance: 'High (3 Marks)',
        shortDesc: 'Strong mutual electron sharing',
        fullDesc:
          'Equal or unequal sharing of an electron pair between non-metals without full ionic transfer.',
        position: [-0.28, -0.1, 0],
        meshNames: ['covalent-bond', 'electron-cloud'],
        highlightColor: 0x6366f1,
      },
    ],
  },

  // ── 6. IONIC CRYSTAL LATTICE (Chemistry — Classes 6, 7, 8, 10) ────────────
  {
    id: 'crystal-lattice-3d',
    aliases: ['Ionic Crystal Lattice 3D', 'crystal-lattice'],
    name: 'NaCl Ionic Crystal Lattice',
    subtitle: 'Electrostatic 3D Unit Cell',
    subject: 'Chemistry',
    classLevel: 10,
    classes: [6, 7, 8, 10],
    chapterNumber: 3,
    chapter: 'Ch 3: Metals & Non-Metals',
    boardRelevance: 'High (3 Marks)',
    description:
      'Visualize alternating Na⁺ cations and Cl⁻ anions packed in a rigid cubic crystal lattice explaining high melting points.',
    proceduralModelId: 'crystal-lattice',
    accentColor: '#8B5CF6',
    capabilities: {
      supportsAnimations: true,
      defaultAnimationEnabled: true,
      animationBehavior: 'gentle-float',
      animationLabel: 'Lattice Float',
      animationStatusText: 'Cubic crystal lattice view',
      supportsExplode: true,
      supportsCrossSection: false,
      supportsPartIsolation: true,
      supportsWireframe: true,
      supportsAnnotations: true,
    },
    tags: ['ionic', 'nacl', 'salt', 'crystal', 'cation', 'anion'],
    components: [
      {
        id: 'Sodium Cation',
        number: 1,
        label: 'Sodium Cation (Na⁺)',
        role: 'Positive Ion',
        category: 'Cation',
        badgeLabel: '+1 Charge',
        badgeTone: 'brand',
        keyMetricLabel: 'CONFIG',
        keyMetricValue: '2, 8 (Neon-like)',
        examRelevance: 'High (3 Marks)',
        shortDesc: 'Formed by losing 1 valence electron',
        fullDesc:
          'Smaller ionic radius after losing its 3s¹ electron; surrounded octahedrally by six Cl⁻ ions.',
        position: [0, 0.44, 0],
        meshNames: ['sodium-ion'],
        highlightColor: 0x8b5cf6,
      },
      {
        id: 'Chloride Anion',
        number: 2,
        label: 'Chloride Anion (Cl⁻)',
        role: 'Negative Ion',
        category: 'Anion',
        badgeLabel: '-1 Charge',
        badgeTone: 'success',
        keyMetricLabel: 'CONFIG',
        keyMetricValue: '2, 8, 8 (Argon-like)',
        examRelevance: 'High (3 Marks)',
        shortDesc: 'Formed by gaining 1 electron',
        fullDesc:
          'Larger anion packing tightly with Na⁺ ions under strong electrostatic attraction, yielding a melting point of 801 °C.',
        position: [0.44, 0.44, 0],
        meshNames: ['chloride-ion'],
        highlightColor: 0x10b981,
      },
    ],
  },

  // ── 7. QUADRATIC PARABOLA (Mathematics — Classes 9 & 10) ──────────────────
  {
    id: 'quadratic-graph-3d',
    aliases: ['Quadratic Graph 3D', 'quadratic-parabola'],
    name: 'Quadratic Parabola & Roots',
    subtitle: 'Discriminant & X-Intercepts',
    subject: 'Mathematics',
    classLevel: 10,
    classes: [9, 10],
    chapterNumber: 4,
    chapter: 'Ch 4: Quadratic Equations',
    boardRelevance: 'Very High (4 Marks)',
    description:
      'Spatial 3D graph of y = ax² + bx + c illustrating the vertex minimum, axis of symmetry, and real roots when D > 0.',
    proceduralModelId: 'quadratic-parabola',
    accentColor: '#6366F1',
    capabilities: {
      supportsAnimations: true,
      defaultAnimationEnabled: true,
      animationBehavior: 'wave-flow',
      animationLabel: 'Vertex Pulse',
      animationStatusText: 'D = b² - 4ac > 0 (2 Real Roots)',
      supportsExplode: true,
      supportsCrossSection: false,
      supportsPartIsolation: true,
      supportsWireframe: true,
      supportsAnnotations: true,
    },
    tags: ['quadratic', 'parabola', 'roots', 'discriminant', 'vertex', 'algebra'],
    components: [
      {
        id: 'Roots Intercept',
        number: 1,
        label: 'Real Roots (α, β)',
        role: 'X-Axis Intersections',
        category: 'Zeros of Polynomial',
        badgeLabel: 'D > 0 (Two Roots)',
        badgeTone: 'success',
        keyMetricLabel: 'FORMULA',
        keyMetricValue: '(-b ± √D) / 2a',
        examRelevance: 'Very High (4 Marks)',
        shortDesc: 'Points where y = 0 on X-axis',
        fullDesc:
          'When discriminant D = b² - 4ac > 0, the parabola cuts the X-axis at two distinct real roots α and β.',
        position: [0.63, 0, 0],
        meshNames: ['roots-intercept'],
        highlightColor: 0x10b981,
      },
      {
        id: 'Parabola Vertex',
        number: 2,
        label: 'Vertex (Minimum)',
        role: 'Turning Point',
        category: 'Extremum',
        badgeLabel: 'a > 0 Upward',
        badgeTone: 'warning',
        keyMetricLabel: 'X-COORDINATE',
        keyMetricValue: 'x = -b / 2a',
        examRelevance: 'High (3 Marks)',
        shortDesc: 'Lowest point on upward parabola',
        fullDesc:
          'Because leading coefficient a > 0, the parabola opens upward and attains its global minimum at (-b/2a, -D/4a).',
        position: [0, -0.55, 0],
        meshNames: ['vertex-point', 'parabola-curve'],
        highlightColor: 0xf59e0b,
      },
    ],
  },

  // ── 8. 3D MENSURATION SOLIDS (Mathematics — Classes 6, 7, 8, 9, 10) ───────
  {
    id: 'mensuration-solids-3d',
    aliases: ['Mensuration Solids 3D', 'mensuration-solids'],
    name: 'Composite 3D Mensuration Solid',
    subtitle: 'Surface Areas & Volumes',
    subject: 'Mathematics',
    classLevel: 8,
    classes: [6, 7, 8, 9, 10],
    chapterNumber: 13,
    chapter: 'Ch 13: Surface Areas & Volumes',
    boardRelevance: 'Very High (5 Marks)',
    description:
      'Inspect a composite cone + cylinder + hemisphere solid to separate curved surface areas (CSA) and total volume formulas.',
    proceduralModelId: 'mensuration-solids',
    accentColor: '#EC4899',
    capabilities: {
      supportsAnimations: true,
      defaultAnimationEnabled: false,
      animationBehavior: 'gentle-float',
      animationLabel: 'Float',
      animationStatusText: 'Composite solid geometry view',
      supportsExplode: true,
      supportsCrossSection: true,
      supportsPartIsolation: true,
      supportsWireframe: true,
      supportsAnnotations: true,
    },
    tags: ['cone', 'cylinder', 'hemisphere', 'volume', 'surface area', 'geometry'],
    components: [
      {
        id: 'Cone Apex',
        number: 1,
        label: 'Conical Top',
        role: 'Slant Height l = √(r²+h²)',
        category: 'Cone',
        badgeLabel: 'CSA = πrl',
        badgeTone: 'warning',
        keyMetricLabel: 'VOLUME',
        keyMetricValue: '⅓ πr²h',
        examRelevance: 'Very High (5 Marks)',
        shortDesc: 'Top conical cap sharing radius r',
        fullDesc:
          'Curved surface area is πrl (without circular base when joined to the cylinder).',
        position: [0, 0.47, 0],
        meshNames: ['cone-apex'],
        highlightColor: 0xf59e0b,
      },
      {
        id: 'Cylinder Body',
        number: 2,
        label: 'Cylindrical Shaft',
        role: 'Lateral Surface 2πrh',
        category: 'Cylinder',
        badgeLabel: 'CSA = 2πrh',
        badgeTone: 'info',
        keyMetricLabel: 'VOLUME',
        keyMetricValue: 'πr²h',
        examRelevance: 'Very High (5 Marks)',
        shortDesc: 'Middle uniform cross-section',
        fullDesc:
          'In composite solids, only the curved lateral surface 2πrh is exposed externally.',
        position: [0, -0.2, 0],
        meshNames: ['cylinder-body'],
        highlightColor: 0x3b82f6,
      },
      {
        id: 'Hemisphere Base',
        number: 3,
        label: 'Hemispherical Base',
        role: 'Curved Bowl 2πr²',
        category: 'Hemisphere',
        badgeLabel: 'CSA = 2πr²',
        badgeTone: 'success',
        keyMetricLabel: 'VOLUME',
        keyMetricValue: '⅔ πr³',
        examRelevance: 'High (3 Marks)',
        shortDesc: 'Bottom curved hemisphere',
        fullDesc:
          'Total TSA of composite toy = CSA(Cone) + CSA(Cylinder) + CSA(Hemisphere).',
        position: [0, -0.68, 0],
        meshNames: ['hemisphere-base'],
        highlightColor: 0x10b981,
      },
    ],
  },
];

/** Backward-compatible export */
export const MODELS = MODEL_CATALOG;

/**
 * Resolve a model by ID, alias, or display name (case-insensitive).
 * Defaults to the first catalog entry (Human Heart) if no match is found.
 */
export function resolveModelByIdOrName(idOrName?: string | null): ModelEntry {
  if (!idOrName) return MODEL_CATALOG[0];
  const query = idOrName.trim().toLowerCase();
  if (!query) return MODEL_CATALOG[0];

  const exact = MODEL_CATALOG.find(
    (m) =>
      m.id.toLowerCase() === query ||
      m.name.toLowerCase() === query ||
      m.aliases?.some((a) => a.toLowerCase() === query),
  );
  if (exact) return exact;

  const partial = MODEL_CATALOG.find(
    (m) =>
      query.includes(m.id.toLowerCase()) ||
      query.includes(m.name.toLowerCase()) ||
      m.tags?.some((t) => query.includes(t)),
  );
  return partial ?? MODEL_CATALOG[0];
}

export interface CatalogFilterOptions {
  classLevel?: ClassLevel | 'ALL';
  subject?: ModelSubject | 'ALL';
  chapterQuery?: string;
}

export function filterModelCatalog(options: CatalogFilterOptions): ModelEntry[] {
  const { classLevel = 'ALL', subject = 'ALL', chapterQuery = '' } = options;
  const q = chapterQuery.trim().toLowerCase();

  return MODEL_CATALOG.filter((m) => {
    if (classLevel !== 'ALL' && !m.classes.includes(classLevel)) return false;
    if (subject !== 'ALL' && m.subject !== subject) return false;
    if (q) {
      const hay = `${m.name} ${m.chapter} ${m.subject} ${m.description} ${(m.tags ?? []).join(' ')}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}
