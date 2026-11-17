# Edzy Syllabus RAG Pipeline (`packages/rag-pipeline`)
> **Pod Lead**: Teammate 3 (Curriculum Intelligence & AI Tutor RAG)

## 🧠 Mission & Scope
The **Syllabus RAG Pipeline** is the contextual retrieval engine powering Edzy's on-demand AI Tutor. It is strictly anchored to Indian K-12 curricula (CBSE NCERT, ICSE, and major State Education Boards) to prevent AI hallucinations and provide grade-appropriate pedagogical answers.

---

## 📚 Curriculum Ingestion & Indexing Architecture

### 1. Document Taxonomy
Every ingested textbook chunk is annotated with metadata:
* `board`: `'CBSE' | 'ICSE' | 'MAHARASHTRA_STATE' | 'UP_BOARD'`
* `class_grade`: `1` through `12`
* `subject`: `'MATHEMATICS' | 'SCIENCE' | 'PHYSICS' | 'CHEMISTRY' | 'BIOLOGY' | 'SOCIAL_SCIENCE'`
* `chapter_number`: Integer
* `chapter_title`: E.g., *"Acids, Bases and Salts"*, *"Trigonometry"*
* `page_range`: `[14, 18]`
* `language`: `'en' | 'hi' | 'hinglish'`

### 2. Retrieval Strategy
* **Hybrid Search**: Dense Vector Retrieval (OpenAI `text-embedding-3-small` / Gemini Embeddings stored in Supabase `pgvector`) combined with BM25 keyword matching for specialized Indian scientific and mathematical terminology.
* **Grade-Gated Prompting**: Prompts inject strict system rules (e.g. for a Class 6 student, do not use calculus or university-level notation; explain using everyday Indian examples like cricket, bicycles, or kitchen experiments).
* **Hinglish Synthesis**: Supports natural queries like *"Sir, photosynthesis ka reaction explain karo in simple steps"* and produces bilingual step-by-step clarity.

---

## 📦 Exported Types & Contracts
See [types.ts](file:///Users/pratham/Projects/Edzy/packages/rag-pipeline/src/types.ts) and [index.ts](file:///Users/pratham/Projects/Edzy/packages/rag-pipeline/src/index.ts).
