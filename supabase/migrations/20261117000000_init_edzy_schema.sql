-- ====================================================================
-- EDZY K-12 SPATIAL COMPUTING & SAAS PLATFORM - INITIAL POSTGRES SCHEMA
-- Multi-Tenant Database Architecture for Indian Schools (CBSE / ICSE)
-- Updated with TEXT Primary Keys for ERP & Roll-Number Compatibility
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. SCHOOLS & TENANTS
CREATE TABLE IF NOT EXISTS public.schools (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    code TEXT UNIQUE NOT NULL, -- e.g. "DVPS01"
    name TEXT NOT NULL,
    affiliation_no TEXT,
    board TEXT DEFAULT 'CBSE',
    session TEXT DEFAULT '2026-2027',
    address TEXT,
    city TEXT,
    state TEXT,
    pin_code TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    principal_name TEXT,
    accountant_name TEXT,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. STUDENTS
CREATE TABLE IF NOT EXISTS public.students (
    id TEXT PRIMARY KEY, -- e.g. "SCH-2026-0104"
    school_id TEXT NOT NULL DEFAULT 'DVPS01',
    school_code TEXT NOT NULL DEFAULT 'DVPS01',
    roll_no TEXT NOT NULL,
    name TEXT NOT NULL,
    class_grade TEXT NOT NULL,
    section TEXT NOT NULL DEFAULT 'A',
    parent_name TEXT NOT NULL,
    parent_phone TEXT NOT NULL,
    parent_pin TEXT NOT NULL DEFAULT '1234',
    annual_fee NUMERIC(10, 2) NOT NULL DEFAULT 48000.00,
    total_paid NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_pending NUMERIC(10, 2) NOT NULL DEFAULT 48000.00,
    at_home_hours NUMERIC(5, 2) DEFAULT 0.00,
    streak_days INTEGER DEFAULT 0,
    attendance_percent NUMERIC(5, 2) DEFAULT 95.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. HYBRID FEE LEDGER
CREATE TABLE IF NOT EXISTS public.fee_ledger (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    school_id TEXT NOT NULL DEFAULT 'DVPS01',
    school_code TEXT NOT NULL DEFAULT 'DVPS01',
    student_id TEXT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    class_grade TEXT NOT NULL,
    quarter TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    payment_mode TEXT,
    payment_ref TEXT,
    receipt_number TEXT,
    paid_at TIMESTAMPTZ,
    due_date DATE NOT NULL DEFAULT CURRENT_DATE,
    clerk_note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ACADEMIC EXAM MARKS
CREATE TABLE IF NOT EXISTS public.exam_marks (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    school_id TEXT NOT NULL DEFAULT 'DVPS01',
    school_code TEXT NOT NULL DEFAULT 'DVPS01',
    student_id TEXT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    class_grade TEXT NOT NULL,
    roll_no TEXT NOT NULL,
    term TEXT NOT NULL,
    scores_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    aggregate_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    overall_grade TEXT NOT NULL DEFAULT 'A1',
    needs_remediation BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SYLLABUS ROADMAPS
CREATE TABLE IF NOT EXISTS public.syllabus_roadmaps (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    school_id TEXT NOT NULL DEFAULT 'DVPS01',
    school_code TEXT NOT NULL DEFAULT 'DVPS01',
    chapter_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    class_grade TEXT NOT NULL,
    subject TEXT NOT NULL,
    board TEXT NOT NULL DEFAULT 'CBSE',
    file_name TEXT,
    file_size_bytes TEXT,
    status TEXT NOT NULL DEFAULT 'READY',
    ar_model_mapped TEXT DEFAULT 'None',
    milestones_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    progress_percent INTEGER DEFAULT 0,
    is_current BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    school_id TEXT NOT NULL DEFAULT 'DVPS01',
    email TEXT UNIQUE,
    phone_number TEXT,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'STUDENT',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. AR SPATIAL MODELS
CREATE TABLE IF NOT EXISTS public.ar_models (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    target_class INTEGER NOT NULL,
    board TEXT DEFAULT 'CBSE',
    description TEXT,
    asset_url TEXT NOT NULL DEFAULT '',
    thumbnail_url TEXT,
    parts_json JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. AR CLASSROOM SESSIONS
CREATE TABLE IF NOT EXISTS public.ar_classroom_sessions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    school_id TEXT NOT NULL DEFAULT 'DVPS01',
    class_id TEXT,
    teacher_id TEXT,
    model_id TEXT,
    session_pin TEXT NOT NULL,
    is_live BOOLEAN DEFAULT true,
    active_part_id TEXT,
    explode_factor NUMERIC(3, 2) DEFAULT 0.00,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ
);

-- 10. AI TUTOR QUERY LOGS
CREATE TABLE IF NOT EXISTS public.ai_tutor_queries (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    student_id TEXT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    class_grade TEXT NOT NULL DEFAULT 'Class 10-A',
    prompt TEXT NOT NULL,
    response TEXT NOT NULL,
    language_mode TEXT DEFAULT 'en',
    helpful_rating BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. SCHOOL NOTICES & CIRCULARS
CREATE TABLE IF NOT EXISTS public.school_notices (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    school_id TEXT NOT NULL DEFAULT 'DVPS01',
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    category TEXT DEFAULT 'CIRCULAR',
    is_urgent BOOLEAN DEFAULT false,
    published_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. COMPOSITE PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_students_school_class ON public.students (school_id, class_grade);
CREATE INDEX IF NOT EXISTS idx_students_roll ON public.students (roll_no);
CREATE INDEX IF NOT EXISTS idx_fee_ledger_lookup ON public.fee_ledger (school_id, student_id, status);
CREATE INDEX IF NOT EXISTS idx_fee_ledger_class ON public.fee_ledger (class_grade, due_date);
CREATE INDEX IF NOT EXISTS idx_exam_marks_lookup ON public.exam_marks (school_id, student_id, term);
CREATE INDEX IF NOT EXISTS idx_exam_marks_class ON public.exam_marks (class_grade, term);
CREATE INDEX IF NOT EXISTS idx_syllabus_school_class ON public.syllabus_roadmaps (school_id, class_grade, chapter_number);
CREATE INDEX IF NOT EXISTS idx_ar_sessions_live ON public.ar_classroom_sessions (is_live);

-- 13. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syllabus_roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ar_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ar_classroom_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_tutor_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_notices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on ar_models" ON public.ar_models FOR SELECT USING (true);
CREATE POLICY "Allow public read on school_notices" ON public.school_notices FOR SELECT USING (true);
CREATE POLICY "Allow pilot read on students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Allow pilot write on students" ON public.students FOR ALL USING (true);
CREATE POLICY "Allow pilot read on fee_ledger" ON public.fee_ledger FOR SELECT USING (true);
CREATE POLICY "Allow pilot write on fee_ledger" ON public.fee_ledger FOR ALL USING (true);
CREATE POLICY "Allow pilot read on exam_marks" ON public.exam_marks FOR SELECT USING (true);
CREATE POLICY "Allow pilot write on exam_marks" ON public.exam_marks FOR ALL USING (true);
CREATE POLICY "Allow pilot read on syllabus_roadmaps" ON public.syllabus_roadmaps FOR SELECT USING (true);
CREATE POLICY "Allow pilot write on syllabus_roadmaps" ON public.syllabus_roadmaps FOR ALL USING (true);
