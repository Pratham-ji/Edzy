import {
  autoMatch3dModel,
  getModelSpecByIdOrName,
  normalize3dModelId,
} from './default3dModels';

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
  title: string;
  pageRange?: string;
  ncertPageRange?: string; // preserved for backward compatibility
  ragStatus: 'GROUNDED' | 'INDEXING';
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
  difficulty?: 'Easy' | 'Medium' | 'Board HOTS';
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

export interface GeneratedStudyPack {
  board: string;
  default3dModelId: string;
  arModelName: string;
  generatedMilestones: FlowchartSpineMilestone[];
  revisionNotes: RevisionNoteItem[];
  practiceSheet: PracticeSheetData;
  relatedChapters: RelatedChapterRef[];
  generationSource: 'GEMINI_AI' | 'LOCAL_SYLLABUS_SCANNER';
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

function buildFallbackBranchGroups(
  milestoneTitle: string,
  nodeId: string,
  arModelId?: string,
  targetNode?: string
): FlowchartBranchNode[] {
  const shortTitle = milestoneTitle.replace(/^\d+(\.\d+)?\s*/, '').trim();
  const baseParts = shortTitle.split(/[:&,-]/).map((s) => s.trim()).filter((s) => s.length > 2);
  const firstLabel = baseParts[0] || shortTitle;
  const secondLabel = baseParts[1] || `${shortTitle} Problem Drills`;

  return [
    {
      id: `${nodeId}-b1`,
      title: firstLabel,
      side: 'left',
      groupBox: 'Core Concept',
      priority: 'MUST_KNOW',
      durationMinutes: 15,
      arModelId: arModelId && arModelId !== 'none' ? arModelId : undefined,
      targetNode,
    },
    {
      id: `${nodeId}-b2`,
      title: secondLabel,
      side: 'right',
      groupBox: 'Application',
      priority: 'PRACTICE',
      durationMinutes: 15,
    },
  ];
}

export function buildDefaultRevisionNotes(
  milestones: FlowchartSpineMilestone[],
  chapterTitle: string,
  board: string
): RevisionNoteItem[] {
  return milestones.map((m, idx) => {
    const branchTitles = m.branches.map((b) => b.title).filter(Boolean);
    return {
      id: `rn-${m.nodeId}-${idx}`,
      milestoneId: m.nodeId,
      topicTitle: m.title,
      keyDefinitions:
        branchTitles.length > 0
          ? branchTitles.map((bt) => `${bt}: Core principle inside ${chapterTitle}`)
          : [`${m.title}: Foundational concept aligned to ${board} curriculum`],
      summaryPoints: [
        `Understand the step-by-step workflow behind ${m.title}.`,
        ...(m.branches.map((b) => `${b.title} — Priority: ${b.priority === 'MUST_KNOW' ? 'Board Must-Know' : b.priority}`)),
      ],
      examFormulaOrTip:
        m.examTip ||
        `For ${board} Board exams, clearly underline technical keywords and include neat labelled diagrams where applicable.`,
    };
  });
}

export function buildDefaultPracticeSheet(
  milestones: FlowchartSpineMilestone[],
  chapterTitle: string,
  subject: string,
  board: string
): PracticeSheetData {
  const boardCode = cleanBoardCode(board);
  const allTopics = milestones.flatMap((m) => [
    m.title.replace(/^\d+(\.\d+)?\s*/, '').trim(),
    ...m.branches.map((b) => b.title),
  ]);
  const t1 = allTopics[0] || chapterTitle;
  const t2 = allTopics[1] || `Applications of ${chapterTitle}`;
  const t3 = allTopics[2] || `Core Mechanisms in ${subject}`;
  const t4 = allTopics[3] || `Analytical Cases of ${chapterTitle}`;
  const t5 = allTopics[4] || `${boardCode} Examination Concepts`;

  return {
    boardStyle: boardCode,
    mcqs: [
      {
        id: 'mcq-1',
        question: `In the chapter "${chapterTitle}", which core concept directly governs "${t1}"?`,
        options: [
          `Primary mechanism and principle of ${t1}`,
          `Unrelated thermal equilibrium assumption`,
          `Zero-interaction vacuum boundary condition`,
          `Random linear approximation only`,
        ],
        correctIndex: 0,
        explanation: `${t1} relies directly on the core rules taught in Milestone 1 of this chapter's ${boardCode} syllabus.`,
        difficulty: 'Easy',
      },
      {
        id: 'mcq-2',
        question: `Which of the following is most critical when evaluating "${t2}" in ${boardCode} ${subject} assessments?`,
        options: [
          `Skipping boundary units`,
          `Applying standard stepwise relationships and verification for ${t2}`,
          `Ignoring conservation principles`,
          `Rounding intermediate steps arbitrarily`,
        ],
        correctIndex: 1,
        explanation: `Examiners award full credit when ${t2} is solved with complete units and structured reasoning.`,
        difficulty: 'Medium',
      },
      {
        id: 'mcq-3',
        question: `Identify the primary relationship connecting "${t1}" and "${t3}":`,
        options: [
          `They are mutually independent domains`,
          `They operate inversely under all conditions`,
          `${t1} forms the conceptual foundation required to master ${t3}`,
          `Neither appears in term assessments`,
        ],
        correctIndex: 2,
        explanation: `Mastering ${t1} directly unlocks multi-step reasoning for ${t3}.`,
        difficulty: 'Easy',
      },
      {
        id: 'mcq-4',
        question: `Under ${boardCode} competency guidelines, Assertion (A): "${t4}" must be verified using labelled schematic logic. Reason (R): High-weightage structured questions reward visual & analytical steps.`,
        options: [
          `Both A and R are true, and R is the correct explanation of A`,
          `Both A and R are true, but R is not the explanation`,
          `A is true, R is false`,
          `A is false, R is true`,
        ],
        correctIndex: 0,
        explanation: `Both ${boardCode} competency framing and school rubrics reward schematic clarity in ${t4}.`,
        difficulty: 'Board HOTS',
      },
      {
        id: 'mcq-5',
        question: `Which revision strategy best secures full marks on "${t5}"?`,
        options: [
          `Memorizing disconnected definitions`,
          `Combining revision summary cards with timed structured problem drills on ${t5}`,
          `Omitting derivations during revision`,
          `Studying only MCQ option letters`,
        ],
        correctIndex: 1,
        explanation: `Combining concept notes and structured drills builds speed and accuracy for ${boardCode} finals.`,
        difficulty: 'Easy',
      },
    ],
    shortQuestions: [
      {
        id: 'sq-1',
        type: 'SHORT',
        marks: 2,
        question: `Define the fundamental concept behind "${t1}" and state one practical real-world example.`,
        modelAnswer: `${t1} is a foundational pillar of ${chapterTitle} in ${subject}. Key points to state: (1) Accurate formal definition as per ${boardCode} syllabus notes, and (2) One concrete laboratory or everyday application demonstrating its real behavior.`,
      },
      {
        id: 'sq-2',
        type: 'SHORT',
        marks: 3,
        question: `Distinguish between the key mechanisms in "${t2}" and "${t3}" with two clear points of comparison.`,
        modelAnswer: `Comparison (${boardCode} Pattern): Point 1 — Structural / theoretical distinction between ${t2} and ${t3}. Point 2 — Functional outcome or condition under which each mechanism operates reliably.`,
      },
      {
        id: 'sq-3',
        type: 'SHORT',
        marks: 3,
        question: `Explain step-by-step how "${t4}" is analyzed or derived in standard school practicals.`,
        modelAnswer: `Step 1: State initial laws/assumptions governing ${t4}. Step 2: Trace the intermediate transformation carefully with proper terminology. Step 3: Conclude with the standard verified result expected by ${boardCode} examiners.`,
      },
    ],
    longQuestions: [
      {
        id: 'lq-1',
        type: 'LONG',
        marks: 5,
        question: `(a) Draw a neat labelled diagram/flowchart explaining "${t1}" and "${t2}". (b) Derive or justify the key principle connecting them in ${chapterTitle}.`,
        modelAnswer: `Part (a): Sketch all primary components and label directional flow cleanly (2 marks). Part (b): Present the structured stepwise explanation linking ${t1} directly to ${t2}, highlighting key technical vocabulary and edge conditions (3 marks).`,
      },
      {
        id: 'lq-2',
        type: 'LONG',
        marks: 5,
        question: `Case-Study (${boardCode} Pattern): A student investigates "${t3}" alongside "${t5}". Answer: (i) What core principle governs the observation? (ii) Identify two common errors to avoid. (iii) Summarize the complete outcome.`,
        modelAnswer: `(i) State the core governing law/process of ${t3}. (ii) Highlight unit/sign or structural labelling mistakes commonly penalized in exams. (iii) Provide a crisp final conclusion tying ${t3} and ${t5} together.`,
      },
    ],
  };
}

export function normalizeMilestonesJson(
  rawJson: any,
  chapterMeta: {
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
  generatedMilestones: FlowchartSpineMilestone[];
  revisionNotes: RevisionNoteItem[];
  practiceSheet: PracticeSheetData;
  relatedChapters: RelatedChapterRef[];
} {
  const boardCode = cleanBoardCode(
    (!Array.isArray(rawJson) && rawJson?.board) || chapterMeta.board || 'CBSE'
  );
  const modelSpec = getModelSpecByIdOrName(
    (!Array.isArray(rawJson) && rawJson?.default3dModelId) || chapterMeta.arModelName
  );
  const defaultTargetNode = modelSpec.targetNodes[0];

  const rawMilestonesList: any[] = Array.isArray(rawJson)
    ? rawJson
    : Array.isArray(rawJson?.milestones)
    ? rawJson.milestones
    : [];

  const generatedMilestones: FlowchartSpineMilestone[] = rawMilestonesList.map((m, idx) => {
    const nodeId = m.nodeId || m.id || `${chapterMeta.id}-m-${idx + 1}`;
    const title = m.title || `${chapterMeta.chapterNumber}.${idx + 1} Key Concept`;
    const mArId = m.arModelId || (modelSpec.id !== 'none' && idx === 0 ? modelSpec.id : undefined);
    const mTarget = m.targetNode || (mArId ? defaultTargetNode : undefined);

    const branches: FlowchartBranchNode[] =
      Array.isArray(m.branches) && m.branches.length > 0
        ? m.branches.map((b: any, bIdx: number) => ({
            id: b.id || `${nodeId}-b-${bIdx + 1}`,
            title: b.title || 'Concept Node',
            side: b.side === 'right' ? 'right' : b.side === 'left' ? 'left' : bIdx % 2 === 0 ? 'left' : 'right',
            groupBox: b.groupBox || (bIdx % 2 === 0 ? 'Core Concept' : 'Practice & Application'),
            priority:
              b.priority === 'MUST_KNOW' || b.priority === 'PRACTICE' || b.priority === 'OPTIONAL'
                ? b.priority
                : bIdx === 0
                ? 'MUST_KNOW'
                : 'PRACTICE',
            durationMinutes: Number(b.durationMinutes || 15),
            summary: b.summary,
            arModelId: b.arModelId || (idx === 1 && modelSpec.id !== 'none' ? modelSpec.id : undefined),
            targetNode: b.targetNode,
          }))
        : buildFallbackBranchGroups(title, nodeId, mArId, mTarget);

    return {
      nodeId,
      title,
      pageRange: m.pageRange || m.ncertPageRange || `Section ${idx + 1}`,
      ncertPageRange: m.ncertPageRange || m.pageRange || `Section ${idx + 1}`,
      ragStatus: m.ragStatus === 'INDEXING' ? 'INDEXING' : 'GROUNDED',
      durationMinutes: Number(m.durationMinutes || 30),
      examTip:
        m.examTip ||
        `Focus on structured explanations and diagrams for ${title} in ${boardCode} assessments.`,
      arModelId: mArId,
      targetNode: mTarget,
      branches,
    };
  });

  const revisionNotes: RevisionNoteItem[] =
    !Array.isArray(rawJson) && Array.isArray(rawJson?.revisionNotes) && rawJson.revisionNotes.length > 0
      ? rawJson.revisionNotes
      : buildDefaultRevisionNotes(generatedMilestones, chapterMeta.title, boardCode);

  const practiceSheet: PracticeSheetData =
    !Array.isArray(rawJson) && rawJson?.practiceSheet?.mcqs?.length
      ? rawJson.practiceSheet
      : buildDefaultPracticeSheet(generatedMilestones, chapterMeta.title, chapterMeta.subject, boardCode);

  const relatedChapters: RelatedChapterRef[] =
    !Array.isArray(rawJson) && Array.isArray(rawJson?.relatedChapters)
      ? rawJson.relatedChapters
      : [];

  return {
    board: boardCode,
    default3dModelId: modelSpec.id,
    generatedMilestones,
    revisionNotes,
    practiceSheet,
    relatedChapters,
  };
}

export function serializeStudyPackToMilestonesJson(chapter: {
  board?: string;
  default3dModelId?: string;
  generatedMilestones: FlowchartSpineMilestone[];
  revisionNotes?: RevisionNoteItem[];
  practiceSheet?: PracticeSheetData;
  relatedChapters?: RelatedChapterRef[];
}) {
  return {
    format: 'edzy-flowchart-v2',
    board: cleanBoardCode(chapter.board),
    default3dModelId: normalize3dModelId(chapter.default3dModelId),
    relatedChapters: chapter.relatedChapters || [],
    milestones: chapter.generatedMilestones,
    revisionNotes: chapter.revisionNotes || [],
    practiceSheet: chapter.practiceSheet,
  };
}

function parseLocalTextSyllabus(input: {
  rawText: string;
  classGrade: string;
  subject: string;
  board: string;
  chapterNumber: number;
  title: string;
  selected3dModel: string;
}): GeneratedStudyPack {
  const boardCode = cleanBoardCode(input.board);
  const matchedModel =
    input.selected3dModel === 'AUTO_MATCH'
      ? autoMatch3dModel(input.subject, input.title, input.rawText)
      : getModelSpecByIdOrName(input.selected3dModel);

  const rawLines = (input.rawText || '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 2);

  // Extract structured sections & subtopics from pasted raw syllabus text
  interface ParsedGroup {
    heading: string;
    items: string[];
  }

  const groups: ParsedGroup[] = [];
  let currentGroup: ParsedGroup | null = null;

  for (const line of rawLines) {
    const cleanLine = line.replace(/^[-•*▪➢]+\s*/, '').trim();
    const isNumberedOrHeading =
      /^(\d+(\.\d+)?[.):]|unit\s+\w+|module\s+\w+|topic\s+\w+|section\s+\w+|chapter\s+\w+)/i.test(
        line
      ) ||
      (line.endsWith(':') && line.length < 75) ||
      (!line.startsWith('-') && !line.startsWith('•') && !line.startsWith('*') && line.includes(':') && line.split(':')[0].length < 48);

    if (isNumberedOrHeading) {
      if (cleanLine.includes(':')) {
        const [headPart, tailPart] = cleanLine.split(':').map((p) => p.trim());
        currentGroup = {
          heading: headPart,
          items: tailPart
            ? tailPart
                .split(/[,;|]/)
                .map((s) => s.trim())
                .filter((s) => s.length > 2)
            : [],
        };
        groups.push(currentGroup);
      } else {
        currentGroup = { heading: cleanLine, items: [] };
        groups.push(currentGroup);
      }
    } else if (currentGroup) {
      const subParts = cleanLine
        .split(/[,;|]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 2);
      currentGroup.items.push(...subParts);
    } else {
      const subParts = cleanLine
        .split(/[,;|]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 2);
      currentGroup = {
        heading: subParts[0] || cleanLine,
        items: subParts.slice(1),
      };
      groups.push(currentGroup);
    }
  }

  // Coalesce into 3 to 5 strong Spine Milestones
  let normalizedGroups: ParsedGroup[] = [];
  if (groups.length === 0) {
    normalizedGroups = [
      {
        heading: `${input.chapterNumber}.1 Core Principles & Definitions`,
        items: [`Foundations of ${input.title}`, `Essential Terminology (${boardCode})`],
      },
      {
        heading: `${input.chapterNumber}.2 Mechanisms & Analytical Models`,
        items: [`Key Processes & Laws`, `Interactive Visualization & Diagrams`],
      },
      {
        heading: `${input.chapterNumber}.3 Solved Derivations & Applications`,
        items: [`Structured Worked Examples`, `${boardCode} Examination Questions`],
      },
    ];
  } else if (groups.length <= 5) {
    normalizedGroups = groups;
  } else {
    // Chunk excess lines cleanly into 4 milestone clusters
    const chunkSize = Math.ceil(groups.length / 4);
    for (let i = 0; i < groups.length; i += chunkSize) {
      const slice = groups.slice(i, i + chunkSize);
      normalizedGroups.push({
        heading: slice[0].heading,
        items: [
          ...slice[0].items,
          ...slice.slice(1).flatMap((g) => [g.heading, ...g.items]),
        ],
      });
    }
  }

  const stamp = Date.now().toString(36);
  const milestones: FlowchartSpineMilestone[] = normalizedGroups.slice(0, 5).map((grp, idx) => {
    const nodeId = `ms-${stamp}-${idx + 1}`;
    const hasNumericPrefix = /^\d+(\.\d+)?\s/.test(grp.heading);
    const spineTitle = hasNumericPrefix
      ? grp.heading
      : `${input.chapterNumber}.${idx + 1} ${grp.heading}`;

    const rawSubtopics = grp.items.length > 0 ? grp.items.slice(0, 4) : [
      `${grp.heading} Concepts`,
      `${grp.heading} Practice Drill`,
    ];

    const branches: FlowchartBranchNode[] = rawSubtopics.map((sub, bIdx) => {
      const side: BranchSide = bIdx % 2 === 0 ? 'left' : 'right';
      const attachAr =
        matchedModel.id !== 'none' && ((idx === 1 && bIdx === 0) || (idx === 0 && bIdx === 0))
          ? matchedModel.id
          : undefined;
      return {
        id: `${nodeId}-b${bIdx + 1}`,
        title: sub.slice(0, 56),
        side,
        groupBox: side === 'left' ? 'Core Concept' : 'Practice & Board Prep',
        priority: bIdx === 0 ? 'MUST_KNOW' : bIdx === 1 ? 'PRACTICE' : 'OPTIONAL',
        durationMinutes: 15,
        arModelId: attachAr,
        targetNode: attachAr ? matchedModel.targetNodes[0] : undefined,
      };
    });

    return {
      nodeId,
      title: spineTitle,
      pageRange: `Module ${idx + 1} • ${boardCode}`,
      ncertPageRange: `Module ${idx + 1} • ${boardCode}`,
      ragStatus: 'GROUNDED',
      durationMinutes: branches.reduce((s, b) => s + b.durationMinutes, 0),
      examTip: `Emphasize "${rawSubtopics[0]}" in ${boardCode} ${input.subject} structured questions with neat definitions.`,
      arModelId: idx === 1 && matchedModel.id !== 'none' ? matchedModel.id : undefined,
      targetNode: idx === 1 && matchedModel.id !== 'none' ? matchedModel.targetNodes[0] : undefined,
      branches,
    };
  });

  const revisionNotes: RevisionNoteItem[] = milestones.map((m, idx) => {
    const grp = normalizedGroups[idx];
    const items = grp?.items?.length ? grp.items : [m.title];
    return {
      id: `rn-${stamp}-${idx + 1}`,
      milestoneId: m.nodeId,
      topicTitle: m.title,
      keyDefinitions: items.slice(0, 2).map((t) => `${t}: Defined within ${input.title} (${boardCode} syllabus)`),
      summaryPoints: [
        `Scanned directly from school teacher's ${input.subject} syllabus for ${input.classGrade}.`,
        ...items.slice(0, 4).map((t) => `Key focus: ${t}`),
      ],
      examFormulaOrTip: m.examTip,
    };
  });

  const practiceSheet = buildDefaultPracticeSheet(milestones, input.title, input.subject, boardCode);

  return {
    board: boardCode,
    default3dModelId: matchedModel.id,
    arModelName: matchedModel.name,
    generatedMilestones: milestones,
    revisionNotes,
    practiceSheet,
    relatedChapters: [],
    generationSource: 'LOCAL_SYLLABUS_SCANNER',
  };
}

export async function generateStudyPackFromSyllabus(input: {
  rawText: string;
  classGrade: string;
  subject: string;
  board: string;
  chapterNumber: number;
  title: string;
  selected3dModel: string;
}): Promise<GeneratedStudyPack> {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  const boardCode = cleanBoardCode(input.board);
  const matchedModel =
    input.selected3dModel === 'AUTO_MATCH'
      ? autoMatch3dModel(input.subject, input.title, input.rawText)
      : getModelSpecByIdOrName(input.selected3dModel);

  if (apiKey && String(apiKey).trim().length > 10) {
    try {
      const prompt = `You are an expert Indian K-12 curriculum architect for ${boardCode} (${input.classGrade} ${input.subject}).
Strictly parse the school's syllabus below for Chapter ${input.chapterNumber}: "${input.title}".
Do NOT invent off-syllabus chapters. Output ONLY valid JSON matching this schema:
{
  "milestones": [
    {
      "nodeId": "m-1",
      "title": "Section Title",
      "pageRange": "Module 1",
      "examTip": "Short exam tip for ${boardCode}",
      "branches": [
        { "id": "m-1-b1", "title": "Subtopic", "side": "left" | "right", "groupBox": "Group Label", "priority": "MUST_KNOW" | "PRACTICE" | "OPTIONAL", "durationMinutes": 15 }
      ]
    }
  ],
  "revisionNotes": [
    { "id": "rn-1", "milestoneId": "m-1", "topicTitle": "...", "keyDefinitions": ["..."], "summaryPoints": ["..."], "examFormulaOrTip": "..." }
  ],
  "practiceSheet": {
    "boardStyle": "${boardCode}",
    "mcqs": [{ "id": "mcq-1", "question": "...", "options": ["A","B","C","D"], "correctIndex": 0, "explanation": "...", "difficulty": "Easy" }],
    "shortQuestions": [{ "id": "sq-1", "type": "SHORT", "marks": 3, "question": "...", "modelAnswer": "..." }],
    "longQuestions": [{ "id": "lq-1", "type": "LONG", "marks": 5, "question": "...", "modelAnswer": "..." }]
  }
}
Generate 3 to 5 milestones, 5 MCQs, 3 short questions, and 2 long questions.

Pasted School Syllabus:
${input.rawText || input.title}`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.3,
            },
          }),
        }
      );

      if (res.ok) {
        const jsonRes = await res.json();
        const rawCandidate = jsonRes?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawCandidate) {
          const parsed = JSON.parse(rawCandidate);
          if (Array.isArray(parsed?.milestones) && parsed.milestones.length > 0) {
            const normalized = normalizeMilestonesJson(parsed, {
              id: `gen-${Date.now()}`,
              title: input.title,
              subject: input.subject,
              chapterNumber: input.chapterNumber,
              board: boardCode,
              arModelName: matchedModel.name,
            });
            return {
              ...normalized,
              arModelName: matchedModel.name,
              generationSource: 'GEMINI_AI',
            };
          }
        }
      }
    } catch (err) {
      console.warn('[Syllabus Generator] Gemini fallback to local deterministic scanner:', err);
    }
  }

  return parseLocalTextSyllabus(input);
}
