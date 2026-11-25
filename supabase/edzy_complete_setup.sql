-- ====================================================================
-- EDZY K-12 SMART SCHOOL OS & SAAS COMMAND PLATFORM
-- MASTER DATABASE INITIALIZATION & SEED SCRIPT: supabase/edzy_complete_setup.sql
-- PURPOSE: 100% Idempotent, Single-Click Setup, TEXT Primary/Foreign Keys,
--          Realtime Replication, Composite Indexes, Permissive Pilot RLS,
--          and Mathematically Consistent Seed Data for Side-by-Side Laptop & Phone Demos.
-- ====================================================================

-- 1. SAFE DROP OF EXISTING TABLES IN REVERSE DEPENDENCY ORDER
DROP TABLE IF EXISTS public.student_roadmap_progress CASCADE;
DROP TABLE IF EXISTS public.school_circulars CASCADE;
DROP TABLE IF EXISTS public.student_progress CASCADE;
DROP TABLE IF EXISTS public.fee_ledger CASCADE;
DROP TABLE IF EXISTS public.exam_marks CASCADE;
DROP TABLE IF EXISTS public.syllabus_roadmaps CASCADE;
DROP TABLE IF EXISTS public.students CASCADE;
DROP TABLE IF EXISTS public.schools CASCADE;

-- Also clean up legacy migration tables if present
DROP TABLE IF EXISTS public.school_notices CASCADE;
DROP TABLE IF EXISTS public.ai_tutor_queries CASCADE;
DROP TABLE IF EXISTS public.ar_classroom_sessions CASCADE;
DROP TABLE IF EXISTS public.ar_models CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.fee_transactions CASCADE;
DROP TABLE IF EXISTS public.fee_installments CASCADE;
DROP TABLE IF EXISTS public.fee_structures CASCADE;
DROP TABLE IF EXISTS public.attendance_records CASCADE;
DROP TABLE IF EXISTS public.parent_student_map CASCADE;
DROP TABLE IF EXISTS public.classes CASCADE;
DROP TABLE IF EXISTS public.academic_years CASCADE;

-- 2. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- 3. CORE TABLE SCHEMAS (ALL USING TEXT KEYS - NEVER UUID 22P02 MISMATCH)
-- ====================================================================

-- 3.1 SCHOOLS (Multi-School Multi-Tenant Core)
CREATE TABLE public.schools (
    id TEXT PRIMARY KEY DEFAULT 'DVPS01',
    school_code TEXT UNIQUE NOT NULL DEFAULT 'DVPS01',
    name TEXT NOT NULL,
    board TEXT NOT NULL DEFAULT 'CBSE',
    academic_session TEXT NOT NULL DEFAULT '2026-2027',
    principal_name TEXT NOT NULL DEFAULT 'Dr. R. K. Mahapatra',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.2 STUDENTS (Unified Student & Parent Directory)
CREATE TABLE public.students (
    id TEXT PRIMARY KEY, -- e.g. 'SCH-2026-0104'
    school_id TEXT NOT NULL DEFAULT 'DVPS01' REFERENCES public.schools(id) ON DELETE CASCADE,
    school_code TEXT NOT NULL DEFAULT 'DVPS01',
    roll_number TEXT NOT NULL,
    full_name TEXT NOT NULL,
    class_grade TEXT NOT NULL, -- e.g. 'Class 10-A', 'Class 9-B'
    section TEXT NOT NULL DEFAULT 'A',
    parent_name TEXT NOT NULL,
    parent_phone TEXT NOT NULL,
    parent_pin TEXT NOT NULL DEFAULT '1234',
    total_fee NUMERIC(10, 2) NOT NULL DEFAULT 48000.00,
    paid_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    balance_due NUMERIC(10, 2) NOT NULL DEFAULT 48000.00,
    weekly_study_hours NUMERIC(5, 2) DEFAULT 0.00,
    streak_days INTEGER DEFAULT 0,
    attendance_pct NUMERIC(5, 2) DEFAULT 95.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.3 FEE LEDGER (Quarterly Hybrid Fees: Cash, Cheque & UPI)
CREATE TABLE public.fee_ledger (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, -- e.g. 'inst-0104-q1'
    school_id TEXT NOT NULL DEFAULT 'DVPS01' REFERENCES public.schools(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    installment_title TEXT NOT NULL, -- e.g. 'Q1 (Apr - Jun 2026)'
    due_date DATE NOT NULL,
    amount NUMERIC(10, 2) NOT NULL DEFAULT 12000.00,
    status TEXT NOT NULL DEFAULT 'PENDING', -- 'PAID', 'PENDING'
    payment_mode TEXT NOT NULL DEFAULT 'PENDING', -- 'ONLINE_UPI', 'OFFLINE_CASH', 'OFFLINE_CHEQUE', 'PENDING'
    receipt_number TEXT, -- e.g. '#SCH-1042', '#EDZ-5581'
    reference_note TEXT,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.4 EXAM MARKS (Granular Subject Marks with CBSE Grading)
CREATE TABLE public.exam_marks (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, -- e.g. 'SCH-2026-0104-Pre-Board-Science & Lab'
    school_id TEXT NOT NULL DEFAULT 'DVPS01' REFERENCES public.schools(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    exam_type TEXT NOT NULL, -- 'Pre-Board', 'Midterm', 'Unit Test 1'
    subject TEXT NOT NULL, -- 'Science & Lab', 'Mathematics', etc.
    marks_obtained NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    max_marks NUMERIC(5, 2) NOT NULL DEFAULT 100.00,
    class_average NUMERIC(5, 2) DEFAULT 75.00,
    grade TEXT NOT NULL DEFAULT 'A1',
    teacher_remarks TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.5 SYLLABUS ROADMAPS (NCERT Curricula & 3D Spatial Model Mappings)
CREATE TABLE public.syllabus_roadmaps (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, -- e.g. 'syl-01'
    school_id TEXT NOT NULL DEFAULT 'DVPS01' REFERENCES public.schools(id) ON DELETE CASCADE,
    class_grade TEXT NOT NULL, -- 'Class 10'
    subject TEXT NOT NULL, -- 'Biology (Science)'
    chapter_number INTEGER NOT NULL,
    chapter_title TEXT NOT NULL,
    pdf_filename TEXT,
    file_size_label TEXT,
    ar_model_name TEXT DEFAULT 'None',
    milestones_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.6 SCHOOL CIRCULARS & NOTICES (Web to Mobile Broadcast Channel)
CREATE TABLE public.school_circulars (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, -- e.g. 'circ-001'
    school_id TEXT NOT NULL DEFAULT 'DVPS01' REFERENCES public.schools(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General', -- 'Exam', 'Holiday', 'Fee', 'General'
    target_class TEXT NOT NULL DEFAULT 'All', -- 'All', 'Class 10-A', 'Class 9-B'
    message TEXT NOT NULL,
    published_by TEXT NOT NULL DEFAULT 'Principal Office',
    published_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.7 STUDENT ROADMAP PROGRESS (Adaptive Goal, Flowchart Node States & Parent ERP Sync)
CREATE TABLE public.student_roadmap_progress (
    id TEXT PRIMARY KEY, -- e.g. 'SCH-2026-0104-syl-01'
    school_id TEXT NOT NULL DEFAULT 'DVPS01' REFERENCES public.schools(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    roadmap_id TEXT NOT NULL REFERENCES public.syllabus_roadmaps(id) ON DELETE CASCADE,
    target_deadline DATE,
    total_days INTEGER DEFAULT 7,
    skipped_days_count INTEGER DEFAULT 0,
    node_states_json JSONB DEFAULT '{}'::jsonb,
    pace_status TEXT DEFAULT 'ON_TRACK', -- 'ON_TRACK' | 'AUTO_ADJUSTED' | 'HIGH_PACE' | 'COMPLETED'
    completion_pct INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 4. COMPOSITE PERFORMANCE INDEXES (MULTI-TENANT SCALE)
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_students_school_student ON public.students (school_id, id);
CREATE INDEX IF NOT EXISTS idx_students_school_class ON public.students (school_id, class_grade);
CREATE INDEX IF NOT EXISTS idx_students_roll ON public.students (roll_number);

CREATE INDEX IF NOT EXISTS idx_fee_ledger_tenant ON public.fee_ledger (school_id, student_id, status);
CREATE INDEX IF NOT EXISTS idx_fee_ledger_school_student ON public.fee_ledger (school_id, student_id);
CREATE INDEX IF NOT EXISTS idx_fee_ledger_status ON public.fee_ledger (status);
CREATE INDEX IF NOT EXISTS idx_fee_ledger_due ON public.fee_ledger (due_date);

CREATE INDEX IF NOT EXISTS idx_exam_marks_tenant ON public.exam_marks (school_id, student_id, exam_type);
CREATE INDEX IF NOT EXISTS idx_exam_marks_lookup ON public.exam_marks (school_id, student_id, exam_type);
CREATE INDEX IF NOT EXISTS idx_exam_marks_subject ON public.exam_marks (subject);

CREATE INDEX IF NOT EXISTS idx_syllabus_tenant ON public.syllabus_roadmaps (school_id, class_grade);
CREATE INDEX IF NOT EXISTS idx_syllabus_lookup ON public.syllabus_roadmaps (school_id, class_grade, chapter_number);

CREATE INDEX IF NOT EXISTS idx_circulars_tenant ON public.school_circulars (school_id, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_circulars_lookup ON public.school_circulars (school_id, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_roadmap_progress_lookup ON public.student_roadmap_progress (school_id, student_id, roadmap_id);

-- ====================================================================
-- 5. REALTIME REPLICATION (FULL ROW REPLICA IDENTITY)
-- ====================================================================
ALTER TABLE public.schools REPLICA IDENTITY FULL;
ALTER TABLE public.students REPLICA IDENTITY FULL;
ALTER TABLE public.fee_ledger REPLICA IDENTITY FULL;
ALTER TABLE public.exam_marks REPLICA IDENTITY FULL;
ALTER TABLE public.syllabus_roadmaps REPLICA IDENTITY FULL;
ALTER TABLE public.school_circulars REPLICA IDENTITY FULL;
ALTER TABLE public.student_roadmap_progress REPLICA IDENTITY FULL;

DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.schools;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.students;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.fee_ledger;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.exam_marks;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.syllabus_roadmaps;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.school_circulars;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.student_roadmap_progress;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
END $$;

-- ====================================================================
-- 6. PERMISSIVE ROW LEVEL SECURITY (RLS) FOR SCHOOL PILOTS
-- ====================================================================
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syllabus_roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_circulars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_roadmap_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Pilot open access on schools" ON public.schools;
CREATE POLICY "Pilot open access on schools" ON public.schools FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Pilot open access on students" ON public.students;
CREATE POLICY "Pilot open access on students" ON public.students FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Pilot open access on fee_ledger" ON public.fee_ledger;
CREATE POLICY "Pilot open access on fee_ledger" ON public.fee_ledger FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Pilot open access on exam_marks" ON public.exam_marks;
CREATE POLICY "Pilot open access on exam_marks" ON public.exam_marks FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Pilot open access on syllabus_roadmaps" ON public.syllabus_roadmaps;
CREATE POLICY "Pilot open access on syllabus_roadmaps" ON public.syllabus_roadmaps FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Pilot open access on school_circulars" ON public.school_circulars;
CREATE POLICY "Pilot open access on school_circulars" ON public.school_circulars FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Pilot open access on student_roadmap_progress" ON public.student_roadmap_progress;
CREATE POLICY "Pilot open access on student_roadmap_progress" ON public.student_roadmap_progress FOR ALL USING (true) WITH CHECK (true);

-- ====================================================================
-- 7. COMPLETE, MATHEMATICALLY CONSISTENT SEED DATA
-- ====================================================================

-- 7.1 SEED SCHOOLS (Multi-Board Demo: CBSE + ICSE)
INSERT INTO public.schools (id, school_code, name, board, academic_session, principal_name)
VALUES
(
    'DVPS01',
    'DVPS01',
    'Doon Valley Public School',
    'CBSE',
    '2026-2027',
    'Dr. R. K. Mahapatra'
),
(
    'STJ01',
    'STJ01',
    'St. Joseph''s Academy, Dehradun',
    'ICSE',
    '2026-2027',
    'Bro. Joseph Mathew'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    board = EXCLUDED.board,
    academic_session = EXCLUDED.academic_session,
    principal_name = EXCLUDED.principal_name;

-- 7.2 SEED 15 STUDENTS (8 in Class 10-A, 7 in Class 9-B)
-- Notice Aarav Sharma is seeded with paid_fee = 36000 and balance_due = 12000 (Q4 Pending)
INSERT INTO public.students (
    id, school_id, school_code, roll_number, full_name, class_grade, section,
    parent_name, parent_phone, parent_pin, total_fee, paid_fee, balance_due,
    weekly_study_hours, streak_days, attendance_pct
) VALUES
-- Class 10-A
('SCH-2026-0104', 'DVPS01', 'DVPS01', '24', 'Aarav Sharma',   'Class 10-A', 'A', 'Rajesh Sharma',      '9811234567', '1234', 48000.00, 36000.00, 12000.00, 6.5, 12, 96.80),
('SCH-2026-0101', 'DVPS01', 'DVPS01', '01', 'Ananya Gupta',   'Class 10-A', 'A', 'Amit Gupta',        '9811234501', '1234', 48000.00, 48000.00,     0.00, 8.2, 19, 98.50),
('SCH-2026-0102', 'DVPS01', 'DVPS01', '12', 'Rohan Mehra',    'Class 10-A', 'A', 'Sunil Mehra',       '9811234502', '1234', 48000.00, 36000.00, 12000.00, 4.5,  7, 92.00),
('SCH-2026-0103', 'DVPS01', 'DVPS01', '15', 'Diya Verma',     'Class 10-A', 'A', 'Vivek Verma',       '9811234503', '1234', 48000.00, 48000.00,     0.00, 7.0, 14, 97.20),
('SCH-2026-0105', 'DVPS01', 'DVPS01', '27', 'Kabir Sen',      'Class 10-A', 'A', 'Debashis Sen',      '9811234505', '1234', 48000.00, 24000.00, 24000.00, 3.2,  4, 88.40),
('SCH-2026-0106', 'DVPS01', 'DVPS01', '31', 'Sanjana Nair',   'Class 10-A', 'A', 'Unnikrishnan Nair', '9811234506', '1234', 48000.00, 48000.00,     0.00, 6.8, 16, 99.10),
('SCH-2026-0107', 'DVPS01', 'DVPS01', '38', 'Vivaan Joshi',   'Class 10-A', 'A', 'Harish Joshi',      '9811234507', '1234', 48000.00, 36000.00, 12000.00, 5.1,  9, 94.60),
('SCH-2026-0108', 'DVPS01', 'DVPS01', '40', 'Meera Pillai',   'Class 10-A', 'A', 'Suresh Pillai',     '9811234508', '1234', 48000.00, 48000.00,     0.00, 7.9, 18, 96.50),

-- Class 9-B
('SCH-2026-0201', 'DVPS01', 'DVPS01', '04', 'Ishaan Agarwal', 'Class 9-B',  'B', 'Sanjay Agarwal',     '9811234509', '1234', 44000.00, 44000.00,     0.00, 7.2, 15, 97.80),
('SCH-2026-0202', 'DVPS01', 'DVPS01', '09', 'Tanvi Deshmukh', 'Class 9-B',  'B', 'Anand Deshmukh',     '9811234510', '1234', 44000.00, 33000.00, 11000.00, 4.8,  8, 91.20),
('SCH-2026-0203', 'DVPS01', 'DVPS01', '14', 'Aditya Kulkarni','Class 9-B',  'B', 'Pravin Kulkarni',    '9811234511', '1234', 44000.00, 44000.00,     0.00, 8.5, 21, 98.90),
('SCH-2026-0204', 'DVPS01', 'DVPS01', '21', 'Riya Sengupta',  'Class 9-B',  'B', 'Subhash Sengupta',   '9811234512', '1234', 44000.00, 22000.00, 22000.00, 3.5,  5, 86.50),
('SCH-2026-0205', 'DVPS01', 'DVPS01', '25', 'Aryan Kapoor',   'Class 9-B',  'B', 'Gaurav Kapoor',      '9811234513', '1234', 44000.00, 33000.00, 11000.00, 5.4, 10, 93.40),
('SCH-2026-0206', 'DVPS01', 'DVPS01', '33', 'Sneha Reddy',    'Class 9-B',  'B', 'K. V. Reddy',        '9811234514', '1234', 44000.00, 44000.00,     0.00, 6.9, 13, 96.00),
('SCH-2026-0207', 'DVPS01', 'DVPS01', '37', 'Shlok Bhatia',   'Class 9-B',  'B', 'Rajiv Bhatia',       '9811234515', '1234', 44000.00, 33000.00, 11000.00, 4.1,  6, 89.70)
ON CONFLICT (id) DO UPDATE SET
    roll_number = EXCLUDED.roll_number,
    full_name = EXCLUDED.full_name,
    class_grade = EXCLUDED.class_grade,
    section = EXCLUDED.section,
    parent_name = EXCLUDED.parent_name,
    parent_phone = EXCLUDED.parent_phone,
    parent_pin = EXCLUDED.parent_pin,
    total_fee = EXCLUDED.total_fee,
    paid_fee = EXCLUDED.paid_fee,
    balance_due = EXCLUDED.balance_due,
    weekly_study_hours = EXCLUDED.weekly_study_hours,
    streak_days = EXCLUDED.streak_days,
    attendance_pct = EXCLUDED.attendance_pct;

-- 7.3 SEED ALL 60 QUARTERLY FEE LEDGER ROWS (4 Quarters across all 15 students)
-- Aarav Sharma's Q4 is explicitly PENDING (Due 30 Nov 2026) for demoing live fee collection!
INSERT INTO public.fee_ledger (
    id, school_id, student_id, installment_title, due_date, amount, status, payment_mode, receipt_number, reference_note, paid_at
) VALUES
-- 1. Aarav Sharma (SCH-2026-0104)
('inst-0104-q1', 'DVPS01', 'SCH-2026-0104', 'Q1 (Apr - Jun 2026)', '2026-04-30', 12000.00, 'PAID',    'OFFLINE_CASH',   '#SCH-1042', 'School Accounts Desk Cash Counter #2', '2026-04-12 10:30:00+05:30'),
('inst-0104-q2', 'DVPS01', 'SCH-2026-0104', 'Q2 (Jul - Sep 2026)', '2026-07-31', 12000.00, 'PAID',    'OFFLINE_CHEQUE', '#SCH-2190', 'HDFC Bank Cheque #902188 Cleared',     '2026-07-14 11:15:00+05:30'),
('inst-0104-q3', 'DVPS01', 'SCH-2026-0104', 'Q3 (Oct - Dec 2026)', '2026-10-31', 12000.00, 'PAID',    'ONLINE_UPI',     '#EDZ-5581', 'Edzy App PhonePe UPI Txn EDZ904812',    '2026-10-05 16:45:00+05:30'),
('inst-0104-q4', 'DVPS01', 'SCH-2026-0104', 'Q4 (Jan - Mar 2027)', '2026-11-30', 12000.00, 'PENDING', 'PENDING',        NULL,        'Quarter 4 Installment Due',             NULL),

-- 2. Ananya Gupta (SCH-2026-0101) - All Paid
('inst-0101-q1', 'DVPS01', 'SCH-2026-0101', 'Q1 (Apr - Jun 2026)', '2026-04-30', 12000.00, 'PAID',    'ONLINE_UPI',     '#EDZ-1011', 'GPay GP918233', '2026-04-10 09:12:00+05:30'),
('inst-0101-q2', 'DVPS01', 'SCH-2026-0101', 'Q2 (Jul - Sep 2026)', '2026-07-31', 12000.00, 'PAID',    'ONLINE_UPI',     '#EDZ-2114', 'GPay GP938211', '2026-07-11 14:20:00+05:30'),
('inst-0101-q3', 'DVPS01', 'SCH-2026-0101', 'Q3 (Oct - Dec 2026)', '2026-10-31', 12000.00, 'PAID',    'ONLINE_UPI',     '#EDZ-3921', 'Paytm PT772911', '2026-10-02 18:30:00+05:30'),
('inst-0101-q4', 'DVPS01', 'SCH-2026-0101', 'Q4 (Jan - Mar 2027)', '2026-11-30', 12000.00, 'PAID',    'ONLINE_UPI',     '#EDZ-4890', 'PhonePe EDZ99120', '2026-11-01 12:15:00+05:30'),

-- 3. Rohan Mehra (SCH-2026-0102) - Q1-Q3 Paid, Q4 Pending
('inst-0102-q1', 'DVPS01', 'SCH-2026-0102', 'Q1 (Apr - Jun 2026)', '2026-04-30', 12000.00, 'PAID',    'ONLINE_UPI',     '#EDZ-1021', 'PhonePe EDZ1021', '2026-04-14 11:00:00+05:30'),
('inst-0102-q2', 'DVPS01', 'SCH-2026-0102', 'Q2 (Jul - Sep 2026)', '2026-07-31', 12000.00, 'PAID',    'OFFLINE_CASH',   '#SCH-2021', 'Cash Counter #1', '2026-07-16 10:45:00+05:30'),
('inst-0102-q3', 'DVPS01', 'SCH-2026-0102', 'Q3 (Oct - Dec 2026)', '2026-10-31', 12000.00, 'PAID',    'ONLINE_UPI',     '#EDZ-3021', 'GPay GP1023', '2026-10-10 14:15:00+05:30'),
('inst-0102-q4', 'DVPS01', 'SCH-2026-0102', 'Q4 (Jan - Mar 2027)', '2026-11-30', 12000.00, 'PENDING', 'PENDING',        NULL,        'Quarter 4 Due', NULL),

-- 4. Diya Verma (SCH-2026-0103) - All Paid
('inst-0103-q1', 'DVPS01', 'SCH-2026-0103', 'Q1 (Apr - Jun 2026)', '2026-04-30', 12000.00, 'PAID',    'ONLINE_UPI',     '#EDZ-1031', 'GPay GP1031', '2026-04-12 10:00:00+05:30'),
('inst-0103-q2', 'DVPS01', 'SCH-2026-0103', 'Q2 (Jul - Sep 2026)', '2026-07-31', 12000.00, 'PAID',    'ONLINE_UPI',     '#EDZ-2031', 'GPay GP2031', '2026-07-15 15:30:00+05:30'),
('inst-0103-q3', 'DVPS01', 'SCH-2026-0103', 'Q3 (Oct - Dec 2026)', '2026-10-31', 12000.00, 'PAID',    'ONLINE_UPI',     '#EDZ-3031', 'PhonePe EDZ3031', '2026-10-08 11:20:00+05:30'),
('inst-0103-q4', 'DVPS01', 'SCH-2026-0103', 'Q4 (Jan - Mar 2027)', '2026-11-30', 12000.00, 'PAID',    'ONLINE_UPI',     '#EDZ-4031', 'GPay GP4031', '2026-11-04 16:40:00+05:30'),

-- 5. Kabir Sen (SCH-2026-0105) - Q1-Q2 Paid, Q3-Q4 Pending
('inst-0105-q1', 'DVPS01', 'SCH-2026-0105', 'Q1 (Apr - Jun 2026)', '2026-04-30', 12000.00, 'PAID',    'OFFLINE_CASH',   '#SCH-1051', 'Cash Counter #1', '2026-04-18 12:00:00+05:30'),
('inst-0105-q2', 'DVPS01', 'SCH-2026-0105', 'Q2 (Jul - Sep 2026)', '2026-07-31', 12000.00, 'PAID',    'OFFLINE_CHEQUE', '#SCH-2051', 'ICICI Cheque #441092', '2026-07-20 14:10:00+05:30'),
('inst-0105-q3', 'DVPS01', 'SCH-2026-0105', 'Q3 (Oct - Dec 2026)', '2026-10-31', 12000.00, 'PENDING', 'PENDING',        NULL,        'Quarter 3 Due', NULL),
('inst-0105-q4', 'DVPS01', 'SCH-2026-0105', 'Q4 (Jan - Mar 2027)', '2026-11-30', 12000.00, 'PENDING', 'PENDING',        NULL,        'Quarter 4 Due', NULL),

-- 6. Sanjana Nair (SCH-2026-0106) - All Paid
('inst-0106-q1', 'DVPS01', 'SCH-2026-0106', 'Q1 (Apr - Jun 2026)', '2026-04-30', 12000.00, 'PAID',    'ONLINE_UPI',     '#EDZ-1061', 'GPay GP1061', '2026-04-11 09:30:00+05:30'),
('inst-0106-q2', 'DVPS01', 'SCH-2026-0106', 'Q2 (Jul - Sep 2026)', '2026-07-31', 12000.00, 'PAID',    'ONLINE_UPI',     '#EDZ-2061', 'PhonePe EDZ2061', '2026-07-12 11:45:00+05:30'),
('inst-0106-q3', 'DVPS01', 'SCH-2026-0106', 'Q3 (Oct - Dec 2026)', '2026-10-31', 12000.00, 'PAID',    'ONLINE_UPI',     '#EDZ-3061', 'GPay GP3061', '2026-10-06 17:15:00+05:30'),
('inst-0106-q4', 'DVPS01', 'SCH-2026-0106', 'Q4 (Jan - Mar 2027)', '2026-11-30', 12000.00, 'PAID',    'ONLINE_UPI',     '#EDZ-4061', 'Paytm PT4061', '2026-11-02 10:20:00+05:30'),

-- 7. Vivaan Joshi (SCH-2026-0107) - Q1-Q3 Paid, Q4 Pending
('inst-0107-q1', 'DVPS01', 'SCH-2026-0107', 'Q1 (Apr - Jun 2026)', '2026-04-30', 12000.00, 'PAID',    'OFFLINE_CASH',   '#SCH-1071', 'Desk #2', '2026-04-15 11:30:00+05:30'),
('inst-0107-q2', 'DVPS01', 'SCH-2026-0107', 'Q2 (Jul - Sep 2026)', '2026-07-31', 12000.00, 'PAID',    'ONLINE_UPI',     '#EDZ-2071', 'PhonePe EDZ2071', '2026-07-18 16:00:00+05:30'),
('inst-0107-q3', 'DVPS01', 'SCH-2026-0107', 'Q3 (Oct - Dec 2026)', '2026-10-31', 12000.00, 'PAID',    'ONLINE_UPI',     '#EDZ-3071', 'GPay GP3071', '2026-10-09 13:45:00+05:30'),
('inst-0107-q4', 'DVPS01', 'SCH-2026-0107', 'Q4 (Jan - Mar 2027)', '2026-11-30', 12000.00, 'PENDING', 'PENDING',        NULL,        'Quarter 4 Due', NULL),

-- 8. Meera Pillai (SCH-2026-0108) - All Paid
('inst-0108-q1', 'DVPS01', 'SCH-2026-0108', 'Q1 (Apr - Jun 2026)', '2026-04-30', 12000.00, 'PAID',    'ONLINE_UPI',     '#EDZ-1081', 'GPay GP1081', '2026-04-10 10:15:00+05:30'),
('inst-0108-q2', 'DVPS01', 'SCH-2026-0108', 'Q2 (Jul - Sep 2026)', '2026-07-31', 12000.00, 'PAID',    'ONLINE_UPI',     '#EDZ-2081', 'Paytm PT2081', '2026-07-14 12:00:00+05:30'),
('inst-0108-q3', 'DVPS01', 'SCH-2026-0108', 'Q3 (Oct - Dec 2026)', '2026-10-31', 12000.00, 'PAID',    'ONLINE_UPI',     '#EDZ-3081', 'PhonePe EDZ3081', '2026-10-04 18:20:00+05:30'),
('inst-0108-q4', 'DVPS01', 'SCH-2026-0108', 'Q4 (Jan - Mar 2027)', '2026-11-30', 12000.00, 'PAID',    'ONLINE_UPI',     '#EDZ-4081', 'GPay GP4081', '2026-11-03 14:10:00+05:30'),

-- 9. Ishaan Agarwal (SCH-2026-0201) - Class 9-B (₹11,000/qtr, All Paid)
('inst-0201-q1', 'DVPS01', 'SCH-2026-0201', 'Q1 (Apr - Jun 2026)', '2026-04-30', 11000.00, 'PAID',    'ONLINE_UPI',     '#EDZ-1201', 'GPay GP1201', '2026-04-11 10:00:00+05:30'),
('inst-0201-q2', 'DVPS01', 'SCH-2026-0201', 'Q2 (Jul - Sep 2026)', '2026-07-31', 11000.00, 'PAID',    'ONLINE_UPI',     '#EDZ-2201', 'PhonePe EDZ2201', '2026-07-13 14:30:00+05:30'),
('inst-0201-q3', 'DVPS01', 'SCH-2026-0201', 'Q3 (Oct - Dec 2026)', '2026-10-31', 11000.00, 'PAID',    'ONLINE_UPI',     '#EDZ-3201', 'Paytm PT3201', '2026-10-05 16:00:00+05:30'),
('inst-0201-q4', 'DVPS01', 'SCH-2026-0201', 'Q4 (Jan - Mar 2027)', '2026-11-30', 11000.00, 'PAID',    'ONLINE_UPI',     '#EDZ-4201', 'GPay GP4201', '2026-11-02 11:20:00+05:30'),

-- 10. Tanvi Deshmukh (SCH-2026-0202) - Q1-Q3 Paid, Q4 Pending
('inst-0202-q1', 'DVPS01', 'SCH-2026-0202', 'Q1 (Apr - Jun 2026)', '2026-04-30', 11000.00, 'PAID',    'OFFLINE_CASH',   '#SCH-1202', 'Desk #1', '2026-04-14 11:20:00+05:30'),
('inst-0202-q2', 'DVPS01', 'SCH-2026-0202', 'Q2 (Jul - Sep 2026)', '2026-07-31', 11000.00, 'PAID',    'OFFLINE_CHEQUE', '#SCH-2202', 'SBI Cheque #192019', '2026-07-17 12:45:00+05:30'),
('inst-0202-q3', 'DVPS01', 'SCH-2026-0202', 'Q3 (Oct - Dec 2026)', '2026-10-31', 11000.00, 'PAID',    'ONLINE_UPI',     '#EDZ-3202', 'GPay GP3202', '2026-10-09 15:10:00+05:30'),
('inst-0202-q4', 'DVPS01', 'SCH-2026-0202', 'Q4 (Jan - Mar 2027)', '2026-11-30', 11000.00, 'PENDING', 'PENDING',        NULL,        'Quarter 4 Due', NULL),

-- 11. Aditya Kulkarni (SCH-2026-0203) - All Paid
('inst-0203-q1', 'DVPS01', 'SCH-2026-0203', 'Q1 (Apr - Jun 2026)', '2026-04-30', 11000.00, 'PAID',    'ONLINE_UPI',     '#EDZ-1203', 'PhonePe EDZ1203', '2026-04-12 09:40:00+05:30'),
('inst-0203-q2', 'DVPS01', 'SCH-2026-0203', 'Q2 (Jul - Sep 2026)', '2026-07-31', 11000.00, 'PAID',    'ONLINE_UPI',     '#EDZ-2203', 'GPay GP2203', '2026-07-15 11:20:00+05:30'),
('inst-0203-q3', 'DVPS01', 'SCH-2026-0203', 'Q3 (Oct - Dec 2026)', '2026-10-31', 11000.00, 'PAID',    'ONLINE_UPI',     '#EDZ-3203', 'Paytm PT3203', '2026-10-07 14:00:00+05:30'),
('inst-0203-q4', 'DVPS01', 'SCH-2026-0203', 'Q4 (Jan - Mar 2027)', '2026-11-30', 11000.00, 'PAID',    'ONLINE_UPI',     '#EDZ-4203', 'GPay GP4203', '2026-11-01 10:15:00+05:30'),

-- 12. Riya Sengupta (SCH-2026-0204) - Q1-Q2 Paid, Q3-Q4 Pending
('inst-0204-q1', 'DVPS01', 'SCH-2026-0204', 'Q1 (Apr - Jun 2026)', '2026-04-30', 11000.00, 'PAID',    'OFFLINE_CASH',   '#SCH-1204', 'Desk #2', '2026-04-16 12:30:00+05:30'),
('inst-0204-q2', 'DVPS01', 'SCH-2026-0204', 'Q2 (Jul - Sep 2026)', '2026-07-31', 11000.00, 'PAID',    'OFFLINE_CHEQUE', '#SCH-2204', 'Axis Cheque #772810', '2026-07-19 14:00:00+05:30'),
('inst-0204-q3', 'DVPS01', 'SCH-2026-0204', 'Q3 (Oct - Dec 2026)', '2026-10-31', 11000.00, 'PENDING', 'PENDING',        NULL,        'Quarter 3 Due', NULL),
('inst-0204-q4', 'DVPS01', 'SCH-2026-0204', 'Q4 (Jan - Mar 2027)', '2026-11-30', 11000.00, 'PENDING', 'PENDING',        NULL,        'Quarter 4 Due', NULL),

-- 13. Aryan Kapoor (SCH-2026-0205) - Q1-Q3 Paid, Q4 Pending
('inst-0205-q1', 'DVPS01', 'SCH-2026-0205', 'Q1 (Apr - Jun 2026)', '2026-04-30', 11000.00, 'PAID',    'ONLINE_UPI',     '#EDZ-1205', 'PhonePe EDZ1205', '2026-04-13 11:10:00+05:30'),
('inst-0205-q2', 'DVPS01', 'SCH-2026-0205', 'Q2 (Jul - Sep 2026)', '2026-07-31', 11000.00, 'PAID',    'ONLINE_UPI',     '#EDZ-2205', 'GPay GP2205', '2026-07-16 16:30:00+05:30'),
('inst-0205-q3', 'DVPS01', 'SCH-2026-0205', 'Q3 (Oct - Dec 2026)', '2026-10-31', 11000.00, 'PAID',    'OFFLINE_CASH',   '#SCH-3205', 'Desk #1', '2026-10-10 10:15:00+05:30'),
('inst-0205-q4', 'DVPS01', 'SCH-2026-0205', 'Q4 (Jan - Mar 2027)', '2026-11-30', 11000.00, 'PENDING', 'PENDING',        NULL,        'Quarter 4 Due', NULL),

-- 14. Sneha Reddy (SCH-2026-0206) - All Paid
('inst-0206-q1', 'DVPS01', 'SCH-2026-0206', 'Q1 (Apr - Jun 2026)', '2026-04-30', 11000.00, 'PAID',    'ONLINE_UPI',     '#EDZ-1206', 'GPay GP1206', '2026-04-11 10:45:00+05:30'),
('inst-0206-q2', 'DVPS01', 'SCH-2026-0206', 'Q2 (Jul - Sep 2026)', '2026-07-31', 11000.00, 'PAID',    'ONLINE_UPI',     '#EDZ-2206', 'Paytm PT2206', '2026-07-14 13:20:00+05:30'),
('inst-0206-q3', 'DVPS01', 'SCH-2026-0206', 'Q3 (Oct - Dec 2026)', '2026-10-31', 11000.00, 'PAID',    'ONLINE_UPI',     '#EDZ-3206', 'PhonePe EDZ3206', '2026-10-06 17:00:00+05:30'),
('inst-0206-q4', 'DVPS01', 'SCH-2026-0206', 'Q4 (Jan - Mar 2027)', '2026-11-30', 11000.00, 'PAID',    'ONLINE_UPI',     '#EDZ-4206', 'GPay GP4206', '2026-11-03 15:40:00+05:30'),

-- 15. Shlok Bhatia (SCH-2026-0207) - Q1-Q3 Paid, Q4 Pending
('inst-0207-q1', 'DVPS01', 'SCH-2026-0207', 'Q1 (Apr - Jun 2026)', '2026-04-30', 11000.00, 'PAID',    'ONLINE_UPI',     '#EDZ-1207', 'Paytm PT1207', '2026-04-12 11:30:00+05:30'),
('inst-0207-q2', 'DVPS01', 'SCH-2026-0207', 'Q2 (Jul - Sep 2026)', '2026-07-31', 11000.00, 'PAID',    'OFFLINE_CASH',   '#SCH-2207', 'Desk #1', '2026-07-14 14:15:00+05:30'),
('inst-0207-q3', 'DVPS01', 'SCH-2026-0207', 'Q3 (Oct - Dec 2026)', '2026-10-31', 11000.00, 'PAID',    'ONLINE_UPI',     '#EDZ-3207', 'PhonePe EDZ3207', '2026-10-09 16:45:00+05:30'),
('inst-0207-q4', 'DVPS01', 'SCH-2026-0207', 'Q4 (Jan - Mar 2027)', '2026-11-30', 11000.00, 'PENDING', 'PENDING',        NULL,        'Quarter 4 Due', NULL)
ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status,
    payment_mode = EXCLUDED.payment_mode,
    receipt_number = EXCLUDED.receipt_number,
    reference_note = EXCLUDED.reference_note,
    paid_at = EXCLUDED.paid_at;

-- 7.4 SEED ACADEMIC EXAM MARKS (Granular Subject Marks with CBSE Grading)
-- Seed for Aarav Sharma (SCH-2026-0104) across Pre-Board (92.6%), Midterm (90.2%), and Unit Test 1 (90.8%)
-- Plus Classmates in Class 10-A
INSERT INTO public.exam_marks (
    id, school_id, student_id, exam_type, subject, marks_obtained, max_marks, class_average, grade, teacher_remarks
) VALUES
-- Aarav Sharma - Pre-Board
('SCH-2026-0104-Pre-Board-Science & Lab',          'DVPS01', 'SCH-2026-0104', 'Pre-Board',   'Science & Lab',          94, 100, 78, 'A1', 'Exceptional diagrammatic clarity in Biology & ray optics.'),
('SCH-2026-0104-Pre-Board-Mathematics',            'DVPS01', 'SCH-2026-0104', 'Pre-Board',   'Mathematics',            91, 100, 72, 'A1', 'Very strong algebraic manipulation.'),
('SCH-2026-0104-Pre-Board-English Communicative',  'DVPS01', 'SCH-2026-0104', 'Pre-Board',   'English Communicative',  88, 100, 76, 'A2', 'High comprehension, vocabulary is strong.'),
('SCH-2026-0104-Pre-Board-Social Science',        'DVPS01', 'SCH-2026-0104', 'Pre-Board',   'Social Science',        92, 100, 71, 'A1', 'Detailed historical chronology and accurate map work.'),
('SCH-2026-0104-Pre-Board-Computer Applications', 'DVPS01', 'SCH-2026-0104', 'Pre-Board',   'Computer Applications', 98, 100, 82, 'A1', 'Top scorer in Python and data structures!'),

-- Aarav Sharma - Midterm
('SCH-2026-0104-Midterm-Science & Lab',            'DVPS01', 'SCH-2026-0104', 'Midterm',     'Science & Lab',          90, 100, 71, 'A1', 'Solid understanding of chemical reactions.'),
('SCH-2026-0104-Midterm-Mathematics',              'DVPS01', 'SCH-2026-0104', 'Midterm',     'Mathematics',            89, 100, 68, 'A2', 'Clean proofs in geometry.'),
('SCH-2026-0104-Midterm-English Communicative',    'DVPS01', 'SCH-2026-0104', 'Midterm',     'English Communicative',  86, 100, 74, 'A2', 'Good writing clarity.'),
('SCH-2026-0104-Midterm-Social Science',          'DVPS01', 'SCH-2026-0104', 'Midterm',     'Social Science',        90, 100, 69, 'A1', 'Accurate geographical reasoning.'),
('SCH-2026-0104-Midterm-Computer Applications',   'DVPS01', 'SCH-2026-0104', 'Midterm',     'Computer Applications', 96, 100, 79, 'A1', 'Clean syntax and loops logic.'),

-- Aarav Sharma - Unit Test 1
('SCH-2026-0104-Unit Test 1-Science & Lab',        'DVPS01', 'SCH-2026-0104', 'Unit Test 1', 'Science & Lab',          46,  50, 36, 'A1', 'Strong start in Life Processes.'),
('SCH-2026-0104-Unit Test 1-Mathematics',          'DVPS01', 'SCH-2026-0104', 'Unit Test 1', 'Mathematics',            44,  50, 33, 'A2', 'Accurate Real Numbers proofs.'),
('SCH-2026-0104-Unit Test 1-English Communicative','DVPS01', 'SCH-2026-0104', 'Unit Test 1', 'English Communicative',  43,  50, 37, 'A2', 'Very good grammar accuracy.'),
('SCH-2026-0104-Unit Test 1-Social Science',      'DVPS01', 'SCH-2026-0104', 'Unit Test 1', 'Social Science',        46,  50, 35, 'A1', 'Well structured answers in Nationalism.'),
('SCH-2026-0104-Unit Test 1-Computer Applications','DVPS01', 'SCH-2026-0104', 'Unit Test 1', 'Computer Applications', 48,  50, 40, 'A1', 'Superb grasp of basic algorithms.'),

-- Ananya Gupta - Pre-Board (Topper)
('SCH-2026-0101-Pre-Board-Science & Lab',          'DVPS01', 'SCH-2026-0101', 'Pre-Board',   'Science & Lab',          98, 100, 78, 'A1', 'Batch topper in Science experiments.'),
('SCH-2026-0101-Pre-Board-Mathematics',            'DVPS01', 'SCH-2026-0101', 'Pre-Board',   'Mathematics',            96, 100, 72, 'A1', 'Flawless trigonometry and circle theorems.'),
('SCH-2026-0101-Pre-Board-English Communicative',  'DVPS01', 'SCH-2026-0101', 'Pre-Board',   'English Communicative',  94, 100, 76, 'A1', 'Exceptional essay and creative expression.'),
('SCH-2026-0101-Pre-Board-Social Science',        'DVPS01', 'SCH-2026-0101', 'Pre-Board',   'Social Science',        95, 100, 71, 'A1', 'High analytical precision in economics.'),
('SCH-2026-0101-Pre-Board-Computer Applications', 'DVPS01', 'SCH-2026-0101', 'Pre-Board',   'Computer Applications', 98, 100, 82, 'A1', 'Perfect score on logic practicals.'),

-- Rohan Mehra - Pre-Board
('SCH-2026-0102-Pre-Board-Science & Lab',          'DVPS01', 'SCH-2026-0102', 'Pre-Board',   'Science & Lab',          82, 100, 78, 'A2', 'Good lab technique, needs chemistry formula practice.'),
('SCH-2026-0102-Pre-Board-Mathematics',            'DVPS01', 'SCH-2026-0102', 'Pre-Board',   'Mathematics',            88, 100, 72, 'A2', 'Consistent problem-solving in calculus.'),
('SCH-2026-0102-Pre-Board-English Communicative',  'DVPS01', 'SCH-2026-0102', 'Pre-Board',   'English Communicative',  85, 100, 76, 'A2', 'Clear prose and good handwriting.'),
('SCH-2026-0102-Pre-Board-Social Science',        'DVPS01', 'SCH-2026-0102', 'Pre-Board',   'Social Science',        84, 100, 71, 'A2', 'Good coverage of Indian political parties.'),
('SCH-2026-0102-Pre-Board-Computer Applications', 'DVPS01', 'SCH-2026-0102', 'Pre-Board',   'Computer Applications', 92, 100, 82, 'A1', 'Solid understanding of loops.')
ON CONFLICT (id) DO UPDATE SET
    marks_obtained = EXCLUDED.marks_obtained,
    max_marks = EXCLUDED.max_marks,
    class_average = EXCLUDED.class_average,
    grade = EXCLUDED.grade,
    teacher_remarks = EXCLUDED.teacher_remarks,
    updated_at = NOW();

-- 7.5 SEED SYLLABUS ROADMAPS (Rich Flowchart + Study Pack JSONB)
INSERT INTO public.syllabus_roadmaps (
    id, school_id, class_grade, subject, chapter_number, chapter_title, pdf_filename, file_size_label, ar_model_name, milestones_json
) VALUES
(
    'syl-01',
    'DVPS01',
    'Class 10',
    'Biology (Science)',
    6,
    'Life Processes: Cardiac Anatomy & Systemic Circulation',
    'Class10_Bio_Ch6_LifeProcesses.pdf',
    '4.2 MB',
    'Human Heart 3D',
    '{
      "format": "edzy-flowchart-v2",
      "board": "CBSE",
      "default3dModelId": "human-heart-3d",
      "relatedChapters": [
        {"id": "syl-02", "chapterNumber": 10, "title": "Light: Reflection & Refraction", "subject": "Physics (Science)"},
        {"id": "syl-03", "chapterNumber": 4, "title": "Quadratic Equations", "subject": "Mathematics"}
      ],
      "milestones": [
        {
          "nodeId": "m-1",
          "title": "6.1 Nutrition & Stomata Exchange",
          "pageRange": "Pages 93-98",
          "ragStatus": "GROUNDED",
          "durationMinutes": 25,
          "examTip": "Draw balanced photosynthesis equation and labelled guard cells clearly for 3-mark questions.",
          "branches": [
            {"id": "m-1-b1", "title": "Chlorophyll & Photolysis", "side": "left", "groupBox": "Autotrophic Mechanics", "priority": "MUST_KNOW", "durationMinutes": 15, "arModelId": "plant-animal-cell-3d", "targetNode": "Chloroplast"},
            {"id": "m-1-b2", "title": "Stomatal Pore Opening/Closing", "side": "right", "groupBox": "Gas Exchange", "priority": "PRACTICE", "durationMinutes": 10}
          ]
        },
        {
          "nodeId": "m-2",
          "title": "6.2 Human Digestive Tract & Enzymes",
          "pageRange": "Pages 99-105",
          "ragStatus": "GROUNDED",
          "durationMinutes": 30,
          "examTip": "Compare Pepsin (acidic pH in stomach) vs Trypsin (alkaline pH in duodenum) carefully.",
          "branches": [
            {"id": "m-2-b1", "title": "Bile Emulsification & Lipase", "side": "left", "groupBox": "Enzyme Pathway", "priority": "MUST_KNOW", "durationMinutes": 15},
            {"id": "m-2-b2", "title": "Intestinal Villi Surface Area", "side": "right", "groupBox": "Absorption", "priority": "PRACTICE", "durationMinutes": 15}
          ]
        },
        {
          "nodeId": "m-3",
          "title": "6.3 Human Heart & Double Circulation",
          "pageRange": "Pages 106-110",
          "ragStatus": "GROUNDED",
          "durationMinutes": 45,
          "examTip": "Left Ventricle has a 3x thicker muscular wall than Right Ventricle to sustain 120 mmHg systemic blood pressure.",
          "arModelId": "human-heart-3d",
          "targetNode": "Aorta",
          "branches": [
            {"id": "m-3-b1", "title": "Four Chambers & Bicuspid/Tricuspid Valves", "side": "left", "groupBox": "Cardiac Chambers", "priority": "MUST_KNOW", "durationMinutes": 25, "arModelId": "human-heart-3d", "targetNode": "Bicuspid Valve"},
            {"id": "m-3-b2", "title": "Aorta Arch & Pulmonary Vein Exception", "side": "right", "groupBox": "Circulation Loops", "priority": "MUST_KNOW", "durationMinutes": 20, "arModelId": "human-heart-3d", "targetNode": "Aorta"}
          ]
        },
        {
          "nodeId": "m-4",
          "title": "6.4 Excretion & Nephron Filtration",
          "pageRange": "Pages 111-115",
          "ragStatus": "GROUNDED",
          "durationMinutes": 30,
          "examTip": "Differentiate ultrafiltration in Bowman capsule from selective tubular reabsorption.",
          "branches": [
            {"id": "m-4-b1", "title": "Glomerulus & Bowman Capsule", "side": "left", "groupBox": "Nephron Unit", "priority": "MUST_KNOW", "durationMinutes": 15},
            {"id": "m-4-b2", "title": "Glucose Reabsorption & Osmoregulation", "side": "right", "groupBox": "Tubular Control", "priority": "OPTIONAL", "durationMinutes": 15}
          ]
        }
      ],
      "revisionNotes": [
        {
          "id": "rn-bio-1",
          "milestoneId": "m-1",
          "topicTitle": "6.1 Autotrophic Nutrition",
          "keyDefinitions": ["Photosynthesis: 6CO2 + 12H2O -> C6H12O6 + 6O2 + 6H2O", "Stomata: Epidermal pores regulated by turgor pressure of guard cells"],
          "summaryPoints": ["Absorption of light energy by chlorophyll", "Conversion to chemical energy & splitting of water", "Reduction of carbon dioxide into carbohydrates"],
          "examFormulaOrTip": "Desert plants take up CO2 at night and prepare an intermediate acted upon by daytime chlorophyll."
        },
        {
          "id": "rn-bio-2",
          "milestoneId": "m-2",
          "topicTitle": "6.2 Human Digestive Enzymes",
          "keyDefinitions": ["Peristalsis: Rhythmic contraction pushing food forward", "Emulsification: Bile salts breaking large fat globules into small micelles"],
          "summaryPoints": ["Salivary amylase breaks starch to maltose in mouth", "Gastric HCl activates pepsinogen to pepsin", "Small intestine completes carbohydrate, protein, and fat digestion"],
          "examFormulaOrTip": "Herbivores have a longer small intestine than carnivores to digest cellulose."
        },
        {
          "id": "rn-bio-3",
          "milestoneId": "m-3",
          "topicTitle": "6.3 Human Heart & Double Circulation",
          "keyDefinitions": ["Double Circulation: Blood passes twice through the heart in one complete cardiac cycle", "Systemic Aorta: Primary artery supplying oxygenated blood to body organs"],
          "summaryPoints": ["Pulmonary Vein uniquely carries oxygenated blood from lungs to Left Atrium", "Valves prevent backflow during ventricular systole", "Left ventricle wall is thickest to pump against high systemic resistance"],
          "examFormulaOrTip": "Normal resting blood pressure is 120/80 mmHg measured by a sphygmomanometer."
        },
        {
          "id": "rn-bio-4",
          "milestoneId": "m-4",
          "topicTitle": "6.4 Excretion in Humans",
          "keyDefinitions": ["Nephron: Structural and functional filtration unit of kidney (~1 million per kidney)"],
          "summaryPoints": ["Ultrafiltration occurs under high pressure in glomerulus", "Useful glucose, amino acids, salts, and water are selectively reabsorbed"],
          "examFormulaOrTip": "Always mention Bowman capsule, glomerulus, and collecting duct when sketching the nephron diagram."
        }
      ],
      "practiceSheet": {
        "boardStyle": "CBSE",
        "mcqs": [
          {"id": "mcq-b1", "question": "Which blood vessel brings oxygenated blood from the lungs into the left atrium?", "options": ["Pulmonary artery", "Vena cava", "Pulmonary vein", "Aorta"], "correctIndex": 2, "explanation": "Pulmonary vein is the sole vein carrying oxygenated blood directly from alveoli capillaries to the left atrium.", "difficulty": "Easy"},
          {"id": "mcq-b2", "question": "Why is the muscular wall of the left ventricle noticeably thicker than the right ventricle?", "options": ["Stores more reserve blood", "Pumps blood throughout the body under high pressure", "Receives blood from vena cava", "Contains cardiac pacemaker"], "correctIndex": 1, "explanation": "Right ventricle only pumps to nearby lungs, whereas left ventricle drives systemic circulation across the entire body.", "difficulty": "Medium"},
          {"id": "mcq-b3", "question": "Which enzyme requires an acidic pH created by gastric HCl inside the stomach?", "options": ["Trypsin", "Salivary amylase", "Pepsin", "Lipase"], "correctIndex": 2, "explanation": "Pepsin works optimally in acidic gastric juice (pH ~1.8-2.0) to digest proteins into peptones.", "difficulty": "Easy"},
          {"id": "mcq-b4", "question": "What prevents backflow of blood inside the heart when atria or ventricles contract?", "options": ["Pericardium", "Septum", "Cardiac valves", "Arterioles"], "correctIndex": 2, "explanation": "Bicuspid, tricuspid, and semilunar valves enforce strict one-way circulation.", "difficulty": "Easy"},
          {"id": "mcq-b5", "question": "The structural filtration unit responsible for urine formation in human kidneys is:", "options": ["Neuron", "Nephron", "Alveolus", "Villus"], "correctIndex": 1, "explanation": "Each nephron filters nitrogenous urea via its glomerulus and Bowman capsule.", "difficulty": "Easy"}
        ],
        "shortQuestions": [
          {"id": "sq-b1", "type": "SHORT", "marks": 2, "question": "How is the small intestine structurally designed to absorb digested food efficiently?", "modelAnswer": "The inner lining contains millions of finger-like projections called villi that vastly increase surface area and are richly supplied with blood vessels to transport absorbed nutrients."},
          {"id": "sq-b2", "type": "SHORT", "marks": 3, "question": "Why is separation of oxygenated and deoxygenated blood necessary in mammals and birds?", "modelAnswer": "Warm-blooded animals have high energy demands to maintain constant body temperature. Complete separation prevents mixing, ensuring maximum oxygen delivery to tissues for aerobic cellular respiration."},
          {"id": "sq-b3", "type": "SHORT", "marks": 3, "question": "State the role of bile juice in human digestion even though it contains no digestive enzymes.", "modelAnswer": "Bile juice makes acidic chyme alkaline for pancreatic enzymes and performs emulsification—breaking large fat globules into tiny droplets so lipase can act efficiently."}
        ],
        "longQuestions": [
          {"id": "lq-b1", "type": "LONG", "marks": 5, "question": "Explain the mechanism of double circulation in humans with trace of oxygenated vs deoxygenated blood flow through the four chambers.", "modelAnswer": "In double circulation, blood completes two circuits per heartbeat: (1) Pulmonary circuit: Deoxygenated blood flows from Right Atrium -> Right Ventricle -> Pulmonary Artery -> Lungs -> Pulmonary Vein (oxygenated) -> Left Atrium. (2) Systemic circuit: Oxygenated blood enters Left Ventricle -> Aorta -> Body tissues -> Vena Cava -> Right Atrium."},
          {"id": "lq-b2", "type": "LONG", "marks": 5, "question": "Describe the structure of a nephron and explain the three major steps involved in urine formation.", "modelAnswer": "A nephron consists of a cup-shaped Bowman capsule enclosing a capillary cluster called glomerulus, followed by a coiled tubule and collecting duct. Urine formation involves: (1) Glomerular ultrafiltration under pressure, (2) Selective tubular reabsorption of glucose, amino acids, salts, and water, and (3) Secretion of excess ions into the collecting duct."}
        ]
      }
    }'::jsonb
),
(
    'syl-02',
    'DVPS01',
    'Class 10',
    'Physics (Science)',
    10,
    'Light: Reflection & Refraction (Ray Optics & Lenses)',
    'Class10_Phy_Ch10_Optics.pdf',
    '5.8 MB',
    'Optics Ray Bench 3D',
    '{
      "format": "edzy-flowchart-v2",
      "board": "CBSE",
      "default3dModelId": "optics-ray-bench-3d",
      "relatedChapters": [
        {"id": "syl-01", "chapterNumber": 6, "title": "Life Processes", "subject": "Biology (Science)"},
        {"id": "syl-03", "chapterNumber": 4, "title": "Quadratic Equations", "subject": "Mathematics"}
      ],
      "milestones": [
        {
          "nodeId": "p-1",
          "title": "10.1 Spherical Mirrors & Sign Convention",
          "pageRange": "Pages 160-168",
          "ragStatus": "GROUNDED",
          "durationMinutes": 30,
          "examTip": "Focal length f of concave mirror is always negative; convex mirror is always positive.",
          "arModelId": "optics-ray-bench-3d",
          "targetNode": "Concave Mirror Focus",
          "branches": [
            {"id": "p-1-b1", "title": "Concave Mirror 6 Ray Positions", "side": "left", "groupBox": "Mirror Ray Rules", "priority": "MUST_KNOW", "durationMinutes": 20, "arModelId": "optics-ray-bench-3d", "targetNode": "Concave Mirror Focus"},
            {"id": "p-1-b2", "title": "New Cartesian Sign Convention", "side": "right", "groupBox": "Sign Convention", "priority": "MUST_KNOW", "durationMinutes": 15}
          ]
        },
        {
          "nodeId": "p-2",
          "title": "10.2 Mirror Formula & Refraction",
          "pageRange": "Pages 169-180",
          "ragStatus": "GROUNDED",
          "durationMinutes": 35,
          "examTip": "Double-check signs for magnification m: negative means real & inverted image.",
          "branches": [
            {"id": "p-2-b1", "title": "1/f = 1/v + 1/u Numericals", "side": "left", "groupBox": "Mirror Formula", "priority": "MUST_KNOW", "durationMinutes": 20},
            {"id": "p-2-b2", "title": "Snell Law: sin i / sin r = n21", "side": "right", "groupBox": "Refraction Laws", "priority": "PRACTICE", "durationMinutes": 15}
          ]
        },
        {
          "nodeId": "p-3",
          "title": "10.3 Lenses, Power (Dioptre) & Ray Diagrams",
          "pageRange": "Pages 181-191",
          "ragStatus": "GROUNDED",
          "durationMinutes": 35,
          "examTip": "Convert focal length to meters before computing P = 1/f(m) in Dioptres.",
          "branches": [
            {"id": "p-3-b1", "title": "Convex vs Concave Lens Formula", "side": "left", "groupBox": "Thin Lenses", "priority": "MUST_KNOW", "durationMinutes": 20, "arModelId": "optics-ray-bench-3d", "targetNode": "Optical Axis"},
            {"id": "p-3-b2", "title": "Power of Lens Combinations (P = P1 + P2)", "side": "right", "groupBox": "Lens Power", "priority": "PRACTICE", "durationMinutes": 15}
          ]
        }
      ],
      "revisionNotes": [
        {
          "id": "rn-phy-1",
          "milestoneId": "p-1",
          "topicTitle": "10.1 Spherical Mirrors",
          "keyDefinitions": ["Principal Focus: Point where parallel rays converge or appear to diverge", "Aperture: Effective reflecting diameter of mirror"],
          "summaryPoints": ["Concave mirrors produce real inverted images except when object is between P and F", "Convex mirrors always produce virtual, erect, diminished images (rear-view mirrors)"],
          "examFormulaOrTip": "Radius of curvature R = 2f holds true for small aperture spherical mirrors."
        },
        {
          "id": "rn-phy-2",
          "milestoneId": "p-2",
          "topicTitle": "10.2 Mirror Formula & Snell Law",
          "keyDefinitions": ["Mirror Equation: 1/v + 1/u = 1/f", "Refractive Index n = c / v"],
          "summaryPoints": ["Light bends towards the normal when moving from rarer to denser medium", "Magnification m = -v/u for mirrors; m = +v/u for lenses"],
          "examFormulaOrTip": "Diamond has the highest natural refractive index (n = 2.42)."
        }
      ],
      "practiceSheet": {
        "boardStyle": "CBSE",
        "mcqs": [
          {"id": "mcq-p1", "question": "What is the power of a convex lens having focal length 25 cm?", "options": ["+2.0 D", "+4.0 D", "-4.0 D", "+0.25 D"], "correctIndex": 1, "explanation": "f = +0.25 m, so P = 1 / 0.25 = +4.0 D.", "difficulty": "Easy"},
          {"id": "mcq-p2", "question": "Where should an object be placed in front of a convex lens to obtain a real image of the same size?", "options": ["At focus F1", "At infinity", "At 2F1", "Between F1 and O"], "correctIndex": 2, "explanation": "Placing an object at 2F1 produces an inverted real image of identical size at 2F2.", "difficulty": "Easy"},
          {"id": "mcq-p3", "question": "If magnification produced by a spherical mirror is +0.5, the mirror must be:", "options": ["Concave", "Convex", "Plane", "Parabolic"], "correctIndex": 1, "explanation": "Positive (< 1) magnification signifies virtual, erect, and diminished image formed by a convex mirror.", "difficulty": "Medium"},
          {"id": "mcq-p4", "question": "Speed of light is maximum in which medium?", "options": ["Crown glass (n=1.52)", "Water (n=1.33)", "Vacuum", "Diamond (n=2.42)"], "correctIndex": 2, "explanation": "Light slows down inversely with refractive index n; vacuum has n=1.", "difficulty": "Easy"},
          {"id": "mcq-p5", "question": "If angle of incidence inside a glass slab is 0 degrees, the angle of refraction is:", "options": ["90 degrees", "45 degrees", "0 degrees", "Critical angle"], "correctIndex": 2, "explanation": "Normal incidence passes straight through without deviation (sin 0 = 0).", "difficulty": "Easy"}
        ],
        "shortQuestions": [
          {"id": "sq-p1", "type": "SHORT", "marks": 2, "question": "Why are convex mirrors preferred as rear-view mirrors in vehicles?", "modelAnswer": "Convex mirrors always form an erect, virtual image and provide a significantly wider field of view than plane mirrors because they curve outwards."},
          {"id": "sq-p2", "type": "SHORT", "marks": 3, "question": "Find the focal length of a lens of power -2.0 D. Identify its nature and optical use.", "modelAnswer": "P = 1/f -> f = 1/(-2.0) = -0.5 m = -50 cm. Negative focal length indicates a concave (diverging) lens used to correct myopia."},
          {"id": "sq-p3", "type": "SHORT", "marks": 3, "question": "State Snell Law of refraction and define absolute refractive index.", "modelAnswer": "Snell Law states that the ratio of sine of angle of incidence to sine of angle of refraction is constant for a given pair of media (sin i / sin r = n21). Absolute refractive index is the ratio of speed of light in vacuum to speed in the medium (n = c/v)."}
        ],
        "longQuestions": [
          {"id": "lq-p1", "type": "LONG", "marks": 5, "question": "An object 4 cm tall is placed 25 cm in front of a concave mirror of focal length 15 cm. Find image distance, height, and nature.", "modelAnswer": "Using mirror formula 1/v + 1/u = 1/f with u = -25 cm, f = -15 cm: 1/v = 1/(-15) - 1/(-25) = -2/75, so v = -37.5 cm (in front of mirror). m = -v/u = -(-37.5)/(-25) = -1.5. Image height h2 = -1.5 * 4 = -6 cm. Nature: Real, inverted, enlarged."},
          {"id": "lq-p2", "type": "LONG", "marks": 5, "question": "Draw labelled ray diagrams for a convex lens when object is placed (a) between F1 and 2F1, and (b) between optical centre O and F1.", "modelAnswer": "(a) Ray parallel to principal axis refracts through F2; ray through optical centre O goes undeviated. They meet beyond 2F2 forming a real, inverted, magnified image. (b) Rays diverge on the right side and appear to converge behind the object on the same side forming a virtual, erect, magnified image."}
        ]
      }
    }'::jsonb
),
(
    'syl-03',
    'DVPS01',
    'Class 10',
    'Mathematics',
    4,
    'Quadratic Equations & Discriminant Analysis',
    'Class10_Math_Ch4_Quadratic.pdf',
    '3.9 MB',
    'Quadratic Graph 3D',
    '{
      "format": "edzy-flowchart-v2",
      "board": "CBSE",
      "default3dModelId": "quadratic-graph-3d",
      "relatedChapters": [
        {"id": "syl-01", "chapterNumber": 6, "title": "Life Processes", "subject": "Biology (Science)"},
        {"id": "syl-02", "chapterNumber": 10, "title": "Light: Reflection & Refraction", "subject": "Physics (Science)"}
      ],
      "milestones": [
        {
          "nodeId": "q-1",
          "title": "4.1 Standard Form & Middle-Term Splitting",
          "pageRange": "Pages 70-76",
          "ragStatus": "GROUNDED",
          "durationMinutes": 25,
          "examTip": "Verify that a != 0 before classifying any simplified equation as quadratic.",
          "branches": [
            {"id": "q-1-b1", "title": "Check ax^2 + bx + c = 0 Standard Form", "side": "left", "groupBox": "Identification", "priority": "MUST_KNOW", "durationMinutes": 10},
            {"id": "q-1-b2", "title": "Factorization by Splitting bx", "side": "right", "groupBox": "Factorization", "priority": "MUST_KNOW", "durationMinutes": 15}
          ]
        },
        {
          "nodeId": "q-2",
          "title": "4.2 Quadratic Formula & Nature of Roots",
          "pageRange": "Pages 77-91",
          "ragStatus": "GROUNDED",
          "durationMinutes": 35,
          "examTip": "For equal roots problems involving parameter k, immediately equate D = b^2 - 4ac = 0.",
          "arModelId": "quadratic-graph-3d",
          "targetNode": "Parabola Vertex",
          "branches": [
            {"id": "q-2-b1", "title": "Shreedharacharya Formula (-b +/- sqrt(D))/2a", "side": "left", "groupBox": "Quadratic Formula", "priority": "MUST_KNOW", "durationMinutes": 20, "arModelId": "quadratic-graph-3d", "targetNode": "Roots Intercept"},
            {"id": "q-2-b2", "title": "Discriminant D > 0, D = 0, D < 0", "side": "right", "groupBox": "Root Classification", "priority": "MUST_KNOW", "durationMinutes": 15}
          ]
        },
        {
          "nodeId": "q-3",
          "title": "4.3 Applied Speed-Time & Area Word Problems",
          "pageRange": "Pages 92-97",
          "ragStatus": "GROUNDED",
          "durationMinutes": 35,
          "examTip": "Always reject negative time or negative speed at the final step of word problems.",
          "branches": [
            {"id": "q-3-b1", "title": "Upstream/Downstream Boat Problems", "side": "left", "groupBox": "Motion Equations", "priority": "MUST_KNOW", "durationMinutes": 20},
            {"id": "q-3-b2", "title": "Rectangular Plot & Age Problems", "side": "right", "groupBox": "Geometry Models", "priority": "PRACTICE", "durationMinutes": 15}
          ]
        }
      ],
      "revisionNotes": [
        {
          "id": "rn-m-1",
          "milestoneId": "q-1",
          "topicTitle": "4.1 Standard Form & Roots",
          "keyDefinitions": ["Quadratic Equation: ax^2 + bx + c = 0 where a != 0", "Roots/Zeros: Real values of x satisfying f(x) = 0"],
          "summaryPoints": ["Simplify brackets fully before testing highest degree = 2", "Factor splitting splits b into p + q such that p*q = a*c"],
          "examFormulaOrTip": "A quadratic polynomial has at most two real roots corresponding to x-axis intercepts of its parabola."
        },
        {
          "id": "rn-m-2",
          "milestoneId": "q-2",
          "topicTitle": "4.2 Discriminant Analysis",
          "keyDefinitions": ["D = b^2 - 4ac"],
          "summaryPoints": ["D > 0 -> Two distinct real roots", "D = 0 -> Two equal real roots (tangent to x-axis)", "D < 0 -> No real roots"],
          "examFormulaOrTip": "Use discriminant first to check root existence before factoring complex fractions."
        }
      ],
      "practiceSheet": {
        "boardStyle": "CBSE",
        "mcqs": [
          {"id": "mcq-q1", "question": "If the quadratic equation 2x^2 - kx + k = 0 has equal roots, then k equals:", "options": ["0 only", "4", "8 only", "0 or 8"], "correctIndex": 3, "explanation": "Set D = (-k)^2 - 4(2)(k) = 0 => k(k - 8) = 0 => k = 0 or k = 8.", "difficulty": "Board HOTS"},
          {"id": "mcq-q2", "question": "Find the discriminant of 3x^2 - 2x + 1/3 = 0.", "options": ["1", "0", "-1", "4"], "correctIndex": 1, "explanation": "D = (-2)^2 - 4(3)(1/3) = 4 - 4 = 0.", "difficulty": "Easy"},
          {"id": "mcq-q3", "question": "Which of the following is NOT a quadratic equation?", "options": ["(x+1)^2 = 2(x-3)", "x^2 + 3x = (-1)(1-3x)^2", "(x-2)(x+1) = (x-1)(x+3)", "x^3 - 4x^2 - x + 1 = (x-2)^3"], "correctIndex": 2, "explanation": "Expanding (x-2)(x+1) = (x-1)(x+3) cancels x^2 from both sides, leaving a linear equation.", "difficulty": "Medium"},
          {"id": "mcq-q4", "question": "The roots of x^2 - 7x + 12 = 0 are:", "options": ["3 and 4", "-3 and -4", "2 and 6", "1 and 12"], "correctIndex": 0, "explanation": "(x - 3)(x - 4) = 0 gives roots x = 3, 4.", "difficulty": "Easy"},
          {"id": "mcq-q5", "question": "A parabola with a > 0 and D < 0 opens:", "options": ["Upwards touching x-axis once", "Downwards cutting x-axis twice", "Upwards completely above x-axis", "Downwards below x-axis"], "correctIndex": 2, "explanation": "a > 0 opens upwards, and D < 0 means zero real x-intercepts.", "difficulty": "Medium"}
        ],
        "shortQuestions": [
          {"id": "sq-q1", "type": "SHORT", "marks": 2, "question": "Find two consecutive positive integers whose sum of squares is 365.", "modelAnswer": "Let integers be x and x+1. x^2 + (x+1)^2 = 365 => 2x^2 + 2x - 364 = 0 => x^2 + x - 182 = 0 => (x+14)(x-13) = 0. Rejecting -14, the integers are 13 and 14."},
          {"id": "sq-q2", "type": "SHORT", "marks": 3, "question": "Find values of p for which x^2 + 5px + 16 = 0 has no real roots.", "modelAnswer": "For no real roots, D < 0 => (5p)^2 - 4(1)(16) < 0 => 25p^2 < 64 => -8/5 < p < 8/5."},
          {"id": "sq-q3", "type": "SHORT", "marks": 3, "question": "Solve using quadratic formula: 2x^2 + x - 4 = 0.", "modelAnswer": "Here a=2, b=1, c=-4. D = 1 - 4(2)(-4) = 33. Therefore x = (-1 +/- sqrt(33)) / 4."}
        ],
        "longQuestions": [
          {"id": "lq-q1", "type": "LONG", "marks": 5, "question": "A motorboat whose speed in still water is 18 km/h takes 1 hour more to go 24 km upstream than to return downstream to the same spot. Find the speed of the stream.", "modelAnswer": "Let stream speed be x km/h. Upstream speed = 18 - x, downstream speed = 18 + x. Time eq: 24/(18-x) - 24/(18+x) = 1 => 24(2x) = 324 - x^2 => x^2 + 48x - 324 = 0 => (x + 54)(x - 6) = 0. Since x > 0, stream speed = 6 km/h."},
          {"id": "lq-q2", "type": "LONG", "marks": 5, "question": "A train travels 360 km at a uniform speed. If the speed had been 5 km/h more, it would have taken 1 hour less for the same journey. Find the original speed of the train.", "modelAnswer": "Let speed be v km/h. 360/v - 360/(v+5) = 1 => 1800 = v^2 + 5v => v^2 + 5v - 1800 = 0 => (v + 45)(v - 40) = 0. Rejecting negative speed, train speed = 40 km/h."}
        ]
      }
    }'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    chapter_number = EXCLUDED.chapter_number,
    chapter_title = EXCLUDED.chapter_title,
    pdf_filename = EXCLUDED.pdf_filename,
    file_size_label = EXCLUDED.file_size_label,
    ar_model_name = EXCLUDED.ar_model_name,
    milestones_json = EXCLUDED.milestones_json;

-- 7.6 SEED SCHOOL CIRCULARS & NOTICES (Web to Mobile Broadcast)
INSERT INTO public.school_circulars (
    id, school_id, title, category, target_class, message, published_by, published_at
) VALUES
(
    'circ-001',
    'DVPS01',
    'Class 10 Pre-Board Examination Schedule',
    'Exam',
    'Class 10-A',
    'Dear Parents, Pre-Board examinations commence from 15th December 2026. Hall tickets and admit cards are available for verification at the reception desk. Practical laboratory assessments start this Monday.',
    'Examination Controller',
    '2026-11-20 10:00:00+05:30'
),
(
    'circ-002',
    'DVPS01',
    'Winter Timings Notice & School Uniform Advisory',
    'General',
    'All',
    'Effective Monday 1st December, school timings will be 8:30 AM to 2:30 PM due to seasonal morning fog. Winter navy blazers and woollen caps are mandatory for all students.',
    'Principal Office',
    '2026-11-22 14:30:00+05:30'
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    category = EXCLUDED.category,
    target_class = EXCLUDED.target_class,
    message = EXCLUDED.message,
    published_by = EXCLUDED.published_by,
    published_at = EXCLUDED.published_at;

-- 7.7 SEED INITIAL STUDENT ROADMAP PROGRESS (Aarav Sharma - Life Processes Sprint)
INSERT INTO public.student_roadmap_progress (
    id, school_id, student_id, roadmap_id, target_deadline, total_days, skipped_days_count, node_states_json, pace_status, completion_pct
) VALUES (
    'SCH-2026-0104-syl-01',
    'DVPS01',
    'SCH-2026-0104',
    'syl-01',
    (CURRENT_DATE + INTERVAL '5 days')::date,
    7,
    0,
    jsonb_build_object(
        'm-1-b1', jsonb_build_object('status', 'done', 'scheduledDate', to_char(CURRENT_DATE - INTERVAL '1 day', 'YYYY-MM-DD'), 'completedAt', to_char(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"')),
        'm-1-b2', jsonb_build_object('status', 'done', 'scheduledDate', to_char(CURRENT_DATE - INTERVAL '1 day', 'YYYY-MM-DD'), 'completedAt', to_char(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"')),
        'm-2-b1', jsonb_build_object('status', 'done', 'scheduledDate', to_char(CURRENT_DATE, 'YYYY-MM-DD'), 'completedAt', to_char(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"')),
        'm-2-b2', jsonb_build_object('status', 'done', 'scheduledDate', to_char(CURRENT_DATE, 'YYYY-MM-DD'), 'completedAt', to_char(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"')),
        'm-3-b1', jsonb_build_object('status', 'learning', 'scheduledDate', to_char(CURRENT_DATE, 'YYYY-MM-DD')),
        'm-3-b2', jsonb_build_object('status', 'not_started', 'scheduledDate', to_char(CURRENT_DATE + INTERVAL '1 day', 'YYYY-MM-DD')),
        'm-4-b1', jsonb_build_object('status', 'not_started', 'scheduledDate', to_char(CURRENT_DATE + INTERVAL '2 days', 'YYYY-MM-DD')),
        'm-4-b2', jsonb_build_object('status', 'not_started', 'scheduledDate', to_char(CURRENT_DATE + INTERVAL '3 days', 'YYYY-MM-DD'))
    ),
    'ON_TRACK',
    50
)
ON CONFLICT (id) DO UPDATE SET
    target_deadline = EXCLUDED.target_deadline,
    total_days = EXCLUDED.total_days,
    node_states_json = EXCLUDED.node_states_json,
    pace_status = EXCLUDED.pace_status,
    completion_pct = EXCLUDED.completion_pct,
    updated_at = NOW();

-- Verification query
SELECT
    (SELECT COUNT(*) FROM public.schools) AS total_schools,
    (SELECT COUNT(*) FROM public.students) AS total_students,
    (SELECT COUNT(*) FROM public.fee_ledger) AS total_fee_installments,
    (SELECT COUNT(*) FROM public.exam_marks) AS total_exam_marks,
    (SELECT COUNT(*) FROM public.syllabus_roadmaps) AS total_syllabi,
    (SELECT COUNT(*) FROM public.school_circulars) AS total_circulars,
    (SELECT COUNT(*) FROM public.student_roadmap_progress) AS total_roadmap_progress;

-- Reload PostgREST schema cache to ensure instantaneous reflection of column/index definitions
NOTIFY pgrst, 'reload schema';
