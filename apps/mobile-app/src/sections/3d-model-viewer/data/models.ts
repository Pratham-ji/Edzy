/**
 * Model Registry & Educational Data
 * Contains 3D models with anatomical hotspots/annotations and CC attribution.
 */

export interface ModelAnnotation {
  id: string;
  number: number;
  label: string;
  category: 'Chamber' | 'Artery' | 'Vein' | 'Landmark';
  shortDesc: string;
  fullDesc: string;
  oxygenStatus: 'Oxygenated (Red)' | 'Deoxygenated (Blue)' | 'Mixed / Structural';
  /** Coordinates in normalized model space (-1 to +1 range) */
  position: [number, number, number];
}

export interface ModelEntry {
  id: string;
  name: string;
  subject: 'Biology' | 'Physics' | 'Chemistry' | 'Astronomy' | 'Engineering';
  description: string;
  /** require() path to the .glb asset */
  asset: number;
  /** Hex color for the card accent / background tint */
  accentColor: string;
  /** Creator attribution for CC-BY-4.0 compliance */
  attribution: {
    title: string;
    author: string;
    license: string;
    sourceUrl: string;
  };
  annotations: ModelAnnotation[];
}

export const MODELS: ModelEntry[] = [
  {
    id: 'human-heart',
    name: 'Human Heart',
    subject: 'Biology',
    description:
      'A detailed 3D model of the human heart showing the four chambers, major vessels, and cardiac muscle structure.',
    asset: require('@/sections/3d-models/assets/realistic_human_heart.glb'),
    accentColor: '#E74C3C',
    attribution: {
      title: 'Realistic Human Heart',
      author: 'neshallads',
      license: 'CC-BY-4.0',
      sourceUrl: 'https://sketchfab.com/3d-models/realistic-human-heart-3f8072336ce94d18b3d0d055a1ece089',
    },
    annotations: [
      {
        id: 'aorta',
        number: 1,
        label: 'Ascending Aorta',
        category: 'Artery',
        oxygenStatus: 'Oxygenated (Red)',
        shortDesc: 'Main systemic arterial trunk',
        fullDesc:
          'The largest blood vessel in the human body. It arches upward from the left ventricle and distributes oxygen-rich blood under high pressure to all systemic organs and tissues.',
        position: [0.08, 0.72, 0.05],
      },
      {
        id: 'pulmonary-artery',
        number: 2,
        label: 'Pulmonary Trunk',
        category: 'Artery',
        oxygenStatus: 'Deoxygenated (Blue)',
        shortDesc: 'Carries blood to the lungs',
        fullDesc:
          'Arising from the right ventricle, this trunk divides into the right and left pulmonary arteries, carrying deoxygenated blood to the lungs for carbon dioxide exchange and re-oxygenation.',
        position: [0.24, 0.48, 0.22],
      },
      {
        id: 'superior-vena-cava',
        number: 3,
        label: 'Superior Vena Cava',
        category: 'Vein',
        oxygenStatus: 'Deoxygenated (Blue)',
        shortDesc: 'Returns blood from upper body',
        fullDesc:
          'A large vein carrying deoxygenated blood from the head, neck, upper limbs, and chest back directly into the right atrium of the heart.',
        position: [-0.35, 0.62, -0.12],
      },
      {
        id: 'left-ventricle',
        number: 4,
        label: 'Left Ventricle',
        category: 'Chamber',
        oxygenStatus: 'Oxygenated (Red)',
        shortDesc: 'Main high-pressure systemic pump',
        fullDesc:
          'Possesses the thickest muscular wall of all four chambers. It contracts forcefully during ventricular systole to propel oxygenated blood through the aortic valve into systemic circulation.',
        position: [0.36, -0.28, 0.22],
      },
      {
        id: 'right-ventricle',
        number: 5,
        label: 'Right Ventricle',
        category: 'Chamber',
        oxygenStatus: 'Deoxygenated (Blue)',
        shortDesc: 'Pumps blood into the lungs',
        fullDesc:
          'Forms the anterior surface of the heart. It receives deoxygenated blood from the right atrium through the tricuspid valve and pumps it into the pulmonary circuit under low pressure.',
        position: [-0.22, -0.24, 0.36],
      },
      {
        id: 'left-atrium',
        number: 6,
        label: 'Left Atrium',
        category: 'Chamber',
        oxygenStatus: 'Oxygenated (Red)',
        shortDesc: 'Receives pulmonary venous return',
        fullDesc:
          'Forms most of the base of the heart. It receives freshly oxygenated blood returning from the lungs via four pulmonary veins before passing it to the left ventricle.',
        position: [0.34, 0.18, -0.32],
      },
      {
        id: 'apex',
        number: 7,
        label: 'Cardiac Apex',
        category: 'Landmark',
        oxygenStatus: 'Mixed / Structural',
        shortDesc: 'Inferior pointed tip of the heart',
        fullDesc:
          'The blunt, inferolateral tip of the heart formed by the left ventricle. It rests just above the diaphragm in the 5th intercostal space along the midclavicular line.',
        position: [0.18, -0.74, 0.16],
      },
    ],
  },
];
