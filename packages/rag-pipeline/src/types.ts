export type EducationBoard = 'CBSE' | 'ICSE' | 'STATE_BOARD';

export type AcademicSubject = 
  | 'MATHEMATICS'
  | 'SCIENCE'
  | 'PHYSICS'
  | 'CHEMISTRY'
  | 'BIOLOGY'
  | 'SOCIAL_SCIENCE'
  | 'ENGLISH'
  | 'HINDI';

export interface SyllabusChunkMetadata {
  chunkId: string;
  board: EducationBoard;
  classGrade: number; // 1 to 12
  subject: AcademicSubject;
  chapterNumber: number;
  chapterTitle: string;
  topicTitle: string;
  pageNumbers: number[];
  textbookEdition: string;
}

export interface SyllabusDocumentChunk {
  id: string;
  content: string;
  metadata: SyllabusChunkMetadata;
  similarityScore?: number;
}

export interface AITutorQueryRequest {
  studentId: string;
  classGrade: number;
  subject: AcademicSubject;
  board: EducationBoard;
  userQuery: string;
  preferredLanguage?: 'en' | 'hi' | 'hinglish';
  includePracticeProblems?: boolean;
}

export interface AITutorResponse {
  answer: string;
  hinglishSummary?: string;
  citations: {
    chapterTitle: string;
    chapterNumber: number;
    pageNumbers: number[];
  }[];
  stepByStepBreakdown: string[];
  suggestedFollowUps: string[];
  relatedARModelId?: string; // Link directly to an AR model if relevant (e.g. "cell-structure-01")
}
