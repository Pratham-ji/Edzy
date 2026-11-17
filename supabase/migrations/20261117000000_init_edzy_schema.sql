-- ====================================================================
-- EDZY K-12 SPATIAL COMPUTING & SAAS PLATFORM - INITIAL POSTGRES SCHEMA
-- Multi-Tenant Database Architecture for Indian Schools (CBSE / ICSE)
-- ====================================================================

-- Enable UUID extension and Vector extension for RAG
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 1. SCHOOLS & TENANTS
CREATE TABLE IF NOT EXISTS public.schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL, -- e.g. "DPS-RKP-01"
    name VARCHAR(255) NOT NULL,
    affiliation_no VARCHAR(100), -- CBSE/ICSE Affiliation code
    board VARCHAR(50) DEFAULT 'CBSE', -- CBSE, ICSE, STATE
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pin_code VARCHAR(10),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ACADEMIC YEARS
CREATE TABLE IF NOT EXISTS public.academic_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    label VARCHAR(50) NOT NULL, -- e.g. "2026-2027"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. USER PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('STUDENT', 'PARENT', 'TEACHER', 'ADMIN', 'PRINCIPAL')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CLASSES & SECTIONS
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    grade INTEGER NOT NULL CHECK (grade >= 1 AND grade <= 12),
    section VARCHAR(10) NOT NULL, -- "A", "B", "C"
    class_teacher_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (school_id, grade, section)
);

-- 5. STUDENTS
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE RESTRICT,
    admission_no VARCHAR(50) UNIQUE NOT NULL,
    roll_no INTEGER NOT NULL,
    date_of_birth DATE,
    streak_days INTEGER DEFAULT 0,
    total_xp INTEGER DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PARENT-STUDENT GUARDIAN MAPPING
CREATE TABLE IF NOT EXISTS public.parent_student_map (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    relationship VARCHAR(50) DEFAULT 'PARENT', -- FATHER, MOTHER, GUARDIAN
    is_primary_contact BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(parent_profile_id, student_id)
);

-- 7. ATTENDANCE LOGS
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('PRESENT', 'ABSENT', 'LATE', 'HALF_DAY')),
    marked_by UUID REFERENCES public.profiles(id),
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (student_id, date)
);

-- 8. FEE MANAGEMENT & TRANSACTIONS (INDIAN UPI & NET-BANKING)
CREATE TABLE IF NOT EXISTS public.fee_structures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    academic_year_id UUID REFERENCES public.academic_years(id),
    grade INTEGER NOT NULL,
    term_name VARCHAR(50) NOT NULL, -- e.g. "Quarter 1 (Apr - Jun)"
    tuition_fee NUMERIC(10, 2) NOT NULL,
    transport_fee NUMERIC(10, 2) DEFAULT 0.00,
    lab_library_fee NUMERIC(10, 2) DEFAULT 0.00,
    annual_charges NUMERIC(10, 2) DEFAULT 0.00,
    total_amount NUMERIC(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.fee_installments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    fee_structure_id UUID REFERENCES public.fee_structures(id) ON DELETE RESTRICT,
    term_name VARCHAR(50) NOT NULL,
    total_due NUMERIC(10, 2) NOT NULL,
    paid_amount NUMERIC(10, 2) DEFAULT 0.00,
    discount_concession NUMERIC(10, 2) DEFAULT 0.00,
    status VARCHAR(30) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'PARTIALLY_PAID', 'OVERDUE')),
    due_date DATE NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.fee_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    installment_id UUID REFERENCES public.fee_installments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    payment_mode VARCHAR(50) DEFAULT 'UPI', -- UPI, NET_BANKING, DEBIT_CARD, CASH
    upi_app VARCHAR(50), -- PhonePe, GooglePay, Paytm, BHIM
    transaction_ref VARCHAR(100) UNIQUE NOT NULL,
    receipt_no VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(30) DEFAULT 'SUCCESS' CHECK (status IN ('SUCCESS', 'PENDING', 'FAILED')),
    paid_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. AR SPATIAL MODELS & CLASSROOM SESSIONS
CREATE TABLE IF NOT EXISTS public.ar_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(50) NOT NULL, -- BIOLOGY, PHYSICS, CHEMISTRY, ASTRONOMY
    target_class INTEGER NOT NULL,
    board VARCHAR(50) DEFAULT 'CBSE',
    description TEXT,
    asset_url TEXT NOT NULL,
    thumbnail_url TEXT,
    parts_json JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ar_classroom_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES public.profiles(id),
    model_id UUID REFERENCES public.ar_models(id),
    session_pin VARCHAR(10) NOT NULL,
    is_live BOOLEAN DEFAULT true,
    active_part_id VARCHAR(100),
    explode_factor NUMERIC(3, 2) DEFAULT 0.00,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ
);

-- 10. AI TUTOR QUERY LOGS & FEEDBACK
CREATE TABLE IF NOT EXISTS public.ai_tutor_queries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    subject VARCHAR(50) NOT NULL,
    class_grade INTEGER NOT NULL,
    prompt TEXT NOT NULL,
    response TEXT NOT NULL,
    language_mode VARCHAR(20) DEFAULT 'en', -- en, hi, hinglish
    helpful_rating BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. SCHOOL NOTICES & CIRCULARS
CREATE TABLE IF NOT EXISTS public.school_notices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'CIRCULAR', -- CIRCULAR, HOLIDAY, EXAM_DATE_SHEET, SPORTS
    is_urgent BOOLEAN DEFAULT false,
    published_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ar_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ar_classroom_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_notices ENABLE ROW LEVEL SECURITY;

-- Allow public read of AR Models
CREATE POLICY "Public read for AR Models" ON public.ar_models FOR SELECT USING (true);

-- Allow authenticated users to view notices belonging to their school
CREATE POLICY "Users can read their school notices" ON public.school_notices
    FOR SELECT USING (true);

-- Indexes for high-frequency queries
CREATE INDEX IF NOT EXISTS idx_students_class ON public.students(class_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON public.attendance_records(student_id, date);
CREATE INDEX IF NOT EXISTS idx_fee_installments_student ON public.fee_installments(student_id);
CREATE INDEX IF NOT EXISTS idx_ar_sessions_live ON public.ar_classroom_sessions(is_live);
