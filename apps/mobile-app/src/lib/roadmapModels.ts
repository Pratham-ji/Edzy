export type BranchPriority = 'MUST_KNOW' | 'PRACTICE' | 'OPTIONAL';
export type BranchSide = 'left' | 'right';

export interface FlowchartBranchNode {
  id: string;
  title: string;
  side: BranchSide;
  groupBox?: string;
  priority: BranchPriority;
  durationMinutes: number;
  summary?: string;
  arModelId?: string;
  targetNode?: string;
}

export interface FlowchartSpineMilestone {
  nodeId: string;
  id?: string;
  title: string;
  description?: string;
  pageRange?: string;
  ncertPageRange?: string;
  ragStatus?: 'GROUNDED' | 'INDEXING';
  durationMinutes: number;
  examTip?: string;
  arModelId?: string;
  targetNode?: string;
  branches: FlowchartBranchNode[];
}

export interface RevisionNoteItem {
  id: string;
  milestoneId?: string;
  topicTitle: string;
  keyDefinitions: string[];
  summaryPoints: string[];
  examFormulaOrTip?: string;
}

export interface PracticeMcqQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty?: string;
}

export interface PracticeSubjectiveQuestion {
  id: string;
  type: 'SHORT' | 'LONG';
  marks: number;
  question: string;
  modelAnswer: string;
}

export interface PracticeSheetData {
  boardStyle: string;
  mcqs: PracticeMcqQuestion[];
  shortQuestions: PracticeSubjectiveQuestion[];
  longQuestions: PracticeSubjectiveQuestion[];
}

export interface RelatedChapterRef {
  id?: string;
  chapterNumber: number;
  title: string;
  subject: string;
}

export function cleanBoardCode(rawBoard?: string): string {
  const trimmed = (rawBoard || '').trim();
  if (!trimmed) return 'CBSE';
  const b = trimmed.toUpperCase();
  if (b === 'CBSE') return 'CBSE';
  if (b === 'ICSE') return 'ICSE';
  if (b === 'ISC') return 'ISC';
  if (b === 'STATE_BOARD' || b === 'STATE BOARD') return 'State Board';
  if (b === 'CAMBRIDGE' || b.includes('IGCSE')) return 'Cambridge (IGCSE)';
  if (b === 'IB') return 'IB';
  if (b === 'NIOS') return 'NIOS';
  return trimmed;
}

export function normalizeArModelId(raw?: string): string {
  const val = (raw || '').toLowerCase().trim();
  if (!val || val === 'none') return '';
  if (val.includes('heart') || val.includes('cardiac')) return 'human-heart-3d';
  if (val.includes('optic') || val.includes('bench') || val.includes('ray')) return 'optics-ray-bench-3d';
  if (val.includes('quadratic') || val.includes('graph')) return 'quadratic-graph-3d';
  if (val.includes('cell')) return 'plant-animal-cell-3d';
  if (val.includes('circuit') || val.includes('electric')) return 'electric-circuit-3d';
  return 'human-heart-3d';
}

function buildFallbackBranches(
  milestoneTitle: string,
  nodeId: string,
  arModelId?: string,
  targetNode?: string
): FlowchartBranchNode[] {
  const clean = milestoneTitle.replace(/^\d+(\.\d+)?\s*/, '').trim();
  const parts = clean.split(/[:&,-]/).map((s) => s.trim()).filter((s) => s.length > 2);
  return [
    {
      id: `${nodeId}-b1`,
      title: parts[0] || clean,
      side: 'left',
      groupBox: 'Core Concept',
      priority: 'MUST_KNOW',
      durationMinutes: 15,
      arModelId,
      targetNode,
    },
    {
      id: `${nodeId}-b2`,
      title: parts[1] || `${clean} Practice`,
      side: 'right',
      groupBox: 'Application',
      priority: 'PRACTICE',
      durationMinutes: 15,
    },
  ];
}

const TOPIC_TIP_RULES: Array<[string[], string]> = [
  [['nutrition', 'photosynth', 'stomat'], 'Write balanced chlorophyll-sunlight equation cleanly and label guard cells.'],
  [['digest', 'enzyme', 'respir'], 'Compare acidic stomach (Pepsin) vs alkaline duodenal (Trypsin) pH conditions.'],
  [['heart', 'circulat', 'transport', 'transpir'], 'Left Ventricle wall is 3x thicker than Right Ventricle; Pulmonary Vein carries oxygenated blood.'],
  [['excret', 'nephron', 'kidney'], 'Contrast glomerular ultrafiltration vs selective tubular reabsorption for 3-mark questions.'],
  [['mirror', 'reflect'], 'Concave mirror focal length f is always negative; trace cases beyond C vs between F and P.'],
  [['refract', 'lens', 'snell'], 'Convert focal length f into metres before substituting in Lens Power P = 1/f(m).'],
  [['standard form', 'factor'], 'Verify leading coefficient a != 0 first before factoring or computing roots.'],
  [['formula', 'discriminant'], 'For equal roots involving parameter k, set Discriminant D = b^2 - 4ac = 0 immediately.'],
  [['word problem', 'motion', 'speed'], 'Explicitly reject negative speed, time, or length values at the final step.'],
];

function buildNaturalExamTip(title: string, subject: string, boardCode: string): string {
  const t = title.toLowerCase();
  const s = subject.toLowerCase();
  for (const [keywords, tip] of TOPIC_TIP_RULES) {
    if (keywords.some((kw) => t.includes(kw))) return tip;
  }
  if (s.includes('math')) {
    return `Show step-by-step substitution and units to secure full ${boardCode} step-marking.`;
  }
  if (s.includes('bio') || s.includes('chem') || s.includes('phys') || s.includes('science')) {
    return `Include neat pencil-labelled diagrams with directional arrows in ${boardCode} answers.`;
  }
  const cleanTitle = title.replace(/^\d+(\.\d+)?\s*/, '').trim();
  return `Underline keywords around ${cleanTitle} and back answers with a clear example.`;
}

function isTemplatedTip(tip?: string): boolean {
  if (!tip) return true;
  const lower = tip.toLowerCase();
  return (
    lower.includes('focus on core terminology') ||
    lower.includes('focus on structured explanations')
  );
}

export function normalizeMobileMilestonesJson(
  rawJson: any,
  meta: {
    id: string;
    title: string;
    subject: string;
    chapterNumber: number;
    board?: string;
    arModelName?: string;
  }
): {
  board: string;
  default3dModelId: string;
  milestones: FlowchartSpineMilestone[];
  revisionNotes: RevisionNoteItem[];
  practiceSheet: PracticeSheetData;
  relatedChapters: RelatedChapterRef[];
} {
  const boardCode = cleanBoardCode(
    (!Array.isArray(rawJson) && rawJson?.board) || meta.board || 'CBSE'
  );
  const arId = normalizeArModelId(
    (!Array.isArray(rawJson) && rawJson?.default3dModelId) || meta.arModelName
  );
  const defaultTarget =
    arId === 'human-heart-3d'
      ? 'Aorta'
      : arId === 'optics-ray-bench-3d'
      ? 'Concave Mirror Focus'
      : arId === 'quadratic-graph-3d'
      ? 'Parabola Vertex'
      : arId === 'plant-animal-cell-3d'
      ? 'Nucleus'
      : arId === 'electric-circuit-3d'
      ? 'Ohm Resistor'
      : undefined;

  const rawList: any[] = Array.isArray(rawJson)
    ? rawJson
    : Array.isArray(rawJson?.milestones)
    ? rawJson.milestones
    : [];

  const milestones: FlowchartSpineMilestone[] = rawList.map((m, idx) => {
    const nodeId = m.nodeId || m.id || `${meta.id}-m-${idx + 1}`;
    const title = m.title || `${meta.chapterNumber}.${idx + 1} Topic`;
    const mArId = m.arModelId || (arId && idx === 1 ? arId : undefined);
    const mTarget = m.targetNode || (mArId ? defaultTarget : undefined);

    const branches: FlowchartBranchNode[] =
      Array.isArray(m.branches) && m.branches.length > 0
        ? m.branches.map((b: any, bIdx: number) => ({
            id: b.id || `${nodeId}-b-${bIdx + 1}`,
            title: b.title || 'Subtopic',
            side: b.side === 'right' ? 'right' : b.side === 'left' ? 'left' : bIdx % 2 === 0 ? 'left' : 'right',
            groupBox: b.groupBox || (bIdx % 2 === 0 ? 'Core Concept' : 'Practice & Board Prep'),
            priority:
              b.priority === 'MUST_KNOW' || b.priority === 'PRACTICE' || b.priority === 'OPTIONAL'
                ? b.priority
                : bIdx === 0
                ? 'MUST_KNOW'
                : 'PRACTICE',
            durationMinutes: Number(b.durationMinutes || 15),
            summary: b.summary,
            arModelId: b.arModelId || (idx === 1 && bIdx === 0 && arId ? arId : undefined),
            targetNode: b.targetNode || (idx === 1 && bIdx === 0 && arId ? defaultTarget : undefined),
          }))
        : buildFallbackBranches(title, nodeId, mArId, mTarget);

    const resolvedTip = !isTemplatedTip(m.examTip)
      ? m.examTip
      : buildNaturalExamTip(title, meta.subject, boardCode);

    return {
      nodeId,
      id: nodeId,
      title,
      description: m.description || m.pageRange || m.ncertPageRange || `${boardCode} Module ${idx + 1}`,
      pageRange: m.pageRange || m.ncertPageRange || `Module ${idx + 1}`,
      ncertPageRange: m.ncertPageRange || m.pageRange || `Module ${idx + 1}`,
      ragStatus: 'GROUNDED',
      durationMinutes: Number(m.durationMinutes || 30),
      examTip: resolvedTip,
      arModelId: mArId,
      targetNode: mTarget,
      branches,
    };
  });

  const revisionNotes: RevisionNoteItem[] =
    !Array.isArray(rawJson) && Array.isArray(rawJson?.revisionNotes) && rawJson.revisionNotes.length > 0
      ? rawJson.revisionNotes
      : milestones.map((m, idx) => ({
          id: `rn-${m.nodeId}-${idx}`,
          milestoneId: m.nodeId,
          topicTitle: m.title,
          keyDefinitions: m.branches.map((b) => `${b.title}: Key concept in ${meta.title}`),
          summaryPoints: [
            `Complete understanding of ${m.title} for ${boardCode} assessments.`,
            ...m.branches.map((b) => `${b.title} (${b.priority === 'MUST_KNOW' ? 'Board Must-Know' : 'Practice'})`),
          ],
          examFormulaOrTip: m.examTip,
        }));

  const fallbackMcqs: PracticeMcqQuestion[] = milestones.slice(0, 5).map((m, i) => ({
    id: `mcq-auto-${i + 1}`,
    question: `Which concept is central to "${m.title}" in ${meta.title}?`,
    options: [
      m.branches[0]?.title || m.title,
      'Unrelated atmospheric assumption',
      'Zero resistance equilibrium only',
      'Static constant inversion',
    ],
    correctIndex: 0,
    explanation: `"${m.branches[0]?.title || m.title}" is directly covered in this milestone under ${boardCode} curriculum.`,
    difficulty: i === 0 ? 'Easy' : 'Medium',
  }));

  const practiceSheet: PracticeSheetData =
    !Array.isArray(rawJson) && rawJson?.practiceSheet?.mcqs?.length
      ? rawJson.practiceSheet
      : {
          boardStyle: boardCode,
          mcqs: fallbackMcqs,
          shortQuestions: [
            {
              id: 'sq-auto-1',
              type: 'SHORT',
              marks: 2,
              question: `Explain the core principle behind ${milestones[0]?.title || meta.title}.`,
              modelAnswer: `Write the formal ${boardCode} definition and state one real-world application clearly.`,
            },
            {
              id: 'sq-auto-2',
              type: 'SHORT',
              marks: 3,
              question: `Compare the primary mechanisms studied in ${meta.title} with labelled examples.`,
              modelAnswer: `Contrast key properties step-by-step and underline scientific terms as expected by ${boardCode} evaluators.`,
            },
          ],
          longQuestions: [
            {
              id: 'lq-auto-1',
              type: 'LONG',
              marks: 5,
              question: `Describe the complete workflow of ${meta.title} with a labelled flowchart and structured derivations.`,
              modelAnswer: `Present (1) neatly labelled schematic diagram (2 marks), and (2) step-by-step analytical reasoning covering all key milestones (3 marks).`,
            },
          ],
        };

  const relatedChapters: RelatedChapterRef[] =
    !Array.isArray(rawJson) && Array.isArray(rawJson?.relatedChapters)
      ? rawJson.relatedChapters
      : [];

  return {
    board: boardCode,
    default3dModelId: arId || 'none',
    milestones,
    revisionNotes,
    practiceSheet,
    relatedChapters,
  };
}
