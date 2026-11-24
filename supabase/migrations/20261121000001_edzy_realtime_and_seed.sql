-- ====================================================================
-- EDZY K-12 SPATIAL COMPUTING & SAAS PLATFORM
-- MIGRATION: 20261121000001_edzy_realtime_and_seed.sql
-- PURPOSE: Supabase Realtime Publication, Scoped RLS & Master Seed
-- Aligned with TEXT primary keys for ERP and roll-number compatibility
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. SCHOOL TENANT RECORD
CREATE TABLE IF NOT EXISTS public.schools (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    code TEXT UNIQUE NOT NULL,
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

INSERT INTO public.schools (id, code, name, affiliation_no, board, session, address, city, state, pin_code, contact_email, contact_phone, principal_name, accountant_name)
VALUES (
    'DVPS01',
    'DVPS01',
    'Doon Valley Public School',
    '2130842',
    'CBSE',
    '2026-2027',
    'Sector 4, Circular Road',
    'Dehradun',
    'Uttarakhand',
    '248001',
    'admin@doonvalleyschool.edu.in',
    '+91 135 2749100',
    'Dr. Meenakshi Sundaram',
    'Mr. Sunil Aggarwal'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    affiliation_no = EXCLUDED.affiliation_no,
    updated_at = NOW();

-- 3. STUDENTS TABLE (TEXT primary key)
CREATE TABLE IF NOT EXISTS public.students (
    id TEXT PRIMARY KEY, -- e.g. SCH-2026-0104
    school_id TEXT NOT NULL DEFAULT 'DVPS01',
    school_code TEXT NOT NULL DEFAULT 'DVPS01',
    roll_no TEXT NOT NULL,
    name TEXT NOT NULL,
    class_grade TEXT NOT NULL,
    section TEXT NOT NULL DEFAULT 'A',
    parent_name TEXT NOT NULL,
    parent_phone TEXT NOT NULL,
    parent_pin TEXT NOT NULL DEFAULT '1234',
    annual_fee NUMERIC(10,2) NOT NULL DEFAULT 48000.00,
    total_paid NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    total_pending NUMERIC(10,2) NOT NULL DEFAULT 48000.00,
    at_home_hours NUMERIC(5,2) DEFAULT 0.00,
    streak_days INTEGER DEFAULT 0,
    attendance_percent NUMERIC(5,2) DEFAULT 95.00,
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
    amount NUMERIC(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    payment_mode TEXT,
    payment_ref TEXT,
    receipt_number TEXT,
    paid_at TIMESTAMPTZ,
    due_date DATE NOT NULL DEFAULT CURRENT_DATE,
    reference_note TEXT,
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
    aggregate_percentage NUMERIC(5,2) NOT NULL DEFAULT 0.00,
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

-- 7. ENABLE REPLICATION IDENTITY FOR REALTIME
ALTER TABLE public.schools REPLICA IDENTITY FULL;
ALTER TABLE public.students REPLICA IDENTITY FULL;
ALTER TABLE public.fee_ledger REPLICA IDENTITY FULL;
ALTER TABLE public.exam_marks REPLICA IDENTITY FULL;
ALTER TABLE public.syllabus_roadmaps REPLICA IDENTITY FULL;

-- 8. PUBLICATION SETUP
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
END $$;

-- 9. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syllabus_roadmaps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Pilot read access on schools" ON public.schools;
CREATE POLICY "Pilot read access on schools" ON public.schools FOR SELECT USING (true);
DROP POLICY IF EXISTS "Pilot write access on schools" ON public.schools;
CREATE POLICY "Pilot write access on schools" ON public.schools FOR ALL USING (true);

DROP POLICY IF EXISTS "Pilot read access on students" ON public.students;
CREATE POLICY "Pilot read access on students" ON public.students FOR SELECT USING (true);
DROP POLICY IF EXISTS "Pilot write access on students" ON public.students;
CREATE POLICY "Pilot write access on students" ON public.students FOR ALL USING (true);

DROP POLICY IF EXISTS "Pilot read access on fee_ledger" ON public.fee_ledger;
CREATE POLICY "Pilot read access on fee_ledger" ON public.fee_ledger FOR SELECT USING (true);
DROP POLICY IF EXISTS "Pilot write access on fee_ledger" ON public.fee_ledger;
CREATE POLICY "Pilot write access on fee_ledger" ON public.fee_ledger FOR ALL USING (true);

DROP POLICY IF EXISTS "Pilot read access on exam_marks" ON public.exam_marks;
CREATE POLICY "Pilot read access on exam_marks" ON public.exam_marks FOR SELECT USING (true);
DROP POLICY IF EXISTS "Pilot write access on exam_marks" ON public.exam_marks;
CREATE POLICY "Pilot write access on exam_marks" ON public.exam_marks FOR ALL USING (true);

DROP POLICY IF EXISTS "Pilot read access on syllabus_roadmaps" ON public.syllabus_roadmaps;
CREATE POLICY "Pilot read access on syllabus_roadmaps" ON public.syllabus_roadmaps FOR SELECT USING (true);
DROP POLICY IF EXISTS "Pilot write access on syllabus_roadmaps" ON public.syllabus_roadmaps;
CREATE POLICY "Pilot write access on syllabus_roadmaps" ON public.syllabus_roadmaps FOR ALL USING (true);

-- 10. MASTER SEED DATA
INSERT INTO public.students (id, school_id, school_code, roll_no, name, class_grade, section, parent_name, parent_phone, parent_pin, annual_fee, total_paid, total_pending, at_home_hours, streak_days, attendance_percent)
VALUES
('SCH-2026-0104', 'DVPS01', 'DVPS01', '24', 'Aarav Sharma', 'Class 10-A', 'A', 'Rajesh Sharma', '+91 98101 23456', '1234', 48000, 36000, 12000, 6.5, 12, 96.8),
('SCH-2026-0101', 'DVPS01', 'DVPS01', '01', 'Ananya Verma', 'Class 10-A', 'A', 'Vikram Verma', '+91 98112 34567', '1234', 48000, 48000, 0, 8.2, 19, 98.4),
('SCH-2026-0102', 'DVPS01', 'DVPS01', '07', 'Rohan Gupta', 'Class 10-A', 'A', 'Sanjay Gupta', '+91 98223 45678', '1234', 48000, 36000, 12000, 4.5, 5, 91.2),
('SCH-2026-0103', 'DVPS01', 'DVPS01', '15', 'Priya Patel', 'Class 10-A', 'A', 'Hitesh Patel', '+91 98334 56789', '1234', 48000, 48000, 0, 7.8, 14, 95.0),
('SCH-2026-0105', 'DVPS01', 'DVPS01', '29', 'Diya Nair', 'Class 10-A', 'A', 'Radhika Nair', '+91 98445 67890', '1234', 48000, 24000, 24000, 5.1, 7, 88.5),
('SCH-2026-0106', 'DVPS01', 'DVPS01', '33', 'Kabir Mehta', 'Class 10-A', 'A', 'Alok Mehta', '+91 98556 78901', '1234', 48000, 48000, 0, 9.0, 22, 99.1),
('SCH-2026-0107', 'DVPS01', 'DVPS01', '38', 'Tanvi Iyer', 'Class 10-A', 'A', 'S. Iyer', '+91 98667 89012', '1234', 48000, 36000, 12000, 6.0, 9, 93.6),
('SCH-2026-0108', 'DVPS01', 'DVPS01', '42', 'Arjun Singhania', 'Class 10-A', 'A', 'Dev Singhania', '+91 98778 90123', '1234', 48000, 12000, 36000, 3.2, 2, 85.0),
('SCH-2026-0201', 'DVPS01', 'DVPS01', '04', 'Siddharth Rao', 'Class 9-B', 'B', 'Mahesh Rao', '+91 98889 01234', '1234', 44000, 44000, 0, 6.8, 11, 94.2),
('SCH-2026-0202', 'DVPS01', 'DVPS01', '11', 'Meera Deshmukh', 'Class 9-B', 'B', 'Sunita Deshmukh', '+91 98990 12345', '1234', 44000, 33000, 11000, 5.4, 8, 92.0),
('SCH-2026-0203', 'DVPS01', 'DVPS01', '18', 'Aditya Kulkarni', 'Class 9-B', 'B', 'Nitin Kulkarni', '+91 98102 34567', '1234', 44000, 44000, 0, 7.5, 15, 97.0),
('SCH-2026-0204', 'DVPS01', 'DVPS01', '25', 'Sneha Reddy', 'Class 9-B', 'B', 'K. Reddy', '+91 98213 45678', '1234', 44000, 22000, 22000, 4.0, 3, 89.4),
('SCH-2026-0205', 'DVPS01', 'DVPS01', '31', 'Ishaan Malhotra', 'Class 9-B', 'B', 'Rajiv Malhotra', '+91 98324 56789', '1234', 44000, 44000, 0, 8.5, 18, 98.0),
('SCH-2026-0206', 'DVPS01', 'DVPS01', '37', 'Riya Sen', 'Class 9-B', 'B', 'Amit Sen', '+91 98435 67890', '1234', 44000, 33000, 11000, 6.1, 10, 93.1),
('SCH-2026-0207', 'DVPS01', 'DVPS01', '44', 'Devansh Joshi', 'Class 9-B', 'B', 'Pankaj Joshi', '+91 98546 78901', '1234', 44000, 11000, 33000, 2.9, 1, 82.5)
ON CONFLICT (id) DO UPDATE SET
    total_paid = EXCLUDED.total_paid,
    total_pending = EXCLUDED.total_pending,
    updated_at = NOW();

-- Insert Aarav's 4 Quarterly Fee Installments
INSERT INTO public.fee_ledger (id, school_id, school_code, student_id, student_name, class_grade, quarter, amount, status, payment_mode, payment_ref, receipt_number, paid_at, due_date, reference_note)
VALUES
('FEE-2026-104-Q1', 'DVPS01', 'DVPS01', 'SCH-2026-0104', 'Aarav Sharma', 'Class 10-A', 'Q1 (Apr - Jun 2026)', 12000, 'PAID', 'OFFLINE_CASH', 'Counter #1 (Clerk Cash Memo)', '#SCH-1042', '2026-04-12 11:30:00+00', '2026-04-30', 'Handed physical receipt duplicate to father.'),
('FEE-2026-104-Q2', 'DVPS01', 'DVPS01', 'SCH-2026-0104', 'Aarav Sharma', 'Class 10-A', 'Q2 (Jul - Sep 2026)', 12000, 'PAID', 'OFFLINE_CHEQUE', 'HDFC Bank Chq #440912', '#SCH-2190', '2026-07-10 14:15:00+00', '2026-07-31', 'Cleared successfully on 12-Jul-2026.'),
('FEE-2026-104-Q3', 'DVPS01', 'DVPS01', 'SCH-2026-0104', 'Aarav Sharma', 'Class 10-A', 'Q3 (Oct - Dec 2026)', 12000, 'PAID', 'ONLINE_UPI', 'UPI-RAZOR-991204', 'EDZ-5581', '2026-10-05 18:45:00+00', '2026-10-31', 'Paid via PhonePe by Rajesh Sharma.'),
('FEE-2026-104-Q4', 'DVPS01', 'DVPS01', 'SCH-2026-0104', 'Aarav Sharma', 'Class 10-A', 'Q4 (Jan - Mar 2027)', 12000, 'PENDING', NULL, NULL, NULL, NULL, '2026-11-30', 'Upcoming fourth quarter tuition fee.')
ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status,
    payment_mode = EXCLUDED.payment_mode,
    receipt_number = EXCLUDED.receipt_number,
    paid_at = EXCLUDED.paid_at,
    updated_at = NOW();

-- Insert Aarav's Exam Assessments
INSERT INTO public.exam_marks (id, school_id, school_code, student_id, student_name, class_grade, roll_no, term, scores_json, aggregate_percentage, overall_grade, needs_remediation)
VALUES
(
    'SCH-2026-0104_PRE_BOARD',
    'DVPS01',
    'DVPS01',
    'SCH-2026-0104',
    'Aarav Sharma',
    'Class 10-A',
    '24',
    'PRE_BOARD',
    '[
        {"subject": "Science & Lab", "marksObtained": 94, "maxMarks": 100, "grade": "A1", "remarks": "Outstanding spatial diagram of heart & aorta."},
        {"subject": "Mathematics", "marksObtained": 91, "maxMarks": 100, "grade": "A1", "remarks": "Excellent quadratic problem solving."},
        {"subject": "English Communicative", "marksObtained": 88, "maxMarks": 100, "grade": "A2", "remarks": "Crisp essay structure and vocabulary."},
        {"subject": "Social Science", "marksObtained": 92, "maxMarks": 100, "grade": "A1", "remarks": "Comprehensive history timelines."},
        {"subject": "Computer Applications", "marksObtained": 98, "maxMarks": 100, "grade": "A1", "remarks": "Full marks on Python & SQL queries."}
    ]'::jsonb,
    92.6,
    'A1',
    false
),
(
    'SCH-2026-0104_MIDTERM',
    'DVPS01',
    'DVPS01',
    'SCH-2026-0104',
    'Aarav Sharma',
    'Class 10-A',
    '24',
    'MIDTERM',
    '[
        {"subject": "Science & Lab", "marksObtained": 90, "maxMarks": 100, "grade": "A1", "remarks": "Strong conceptual foundation."},
        {"subject": "Mathematics", "marksObtained": 88, "maxMarks": 100, "grade": "A2", "remarks": "Minor algebra calculation slips."},
        {"subject": "English Communicative", "marksObtained": 85, "maxMarks": 100, "grade": "A2", "remarks": "Good grammar comprehension."},
        {"subject": "Social Science", "marksObtained": 89, "maxMarks": 100, "grade": "A2", "remarks": "Clear map work."},
        {"subject": "Computer Applications", "marksObtained": 95, "maxMarks": 100, "grade": "A1", "remarks": "Flawless coding output."}
    ]'::jsonb,
    89.4,
    'A2',
    false
),
(
    'SCH-2026-0104_UNIT_TEST_1',
    'DVPS01',
    'DVPS01',
    'SCH-2026-0104',
    'Aarav Sharma',
    'Class 10-A',
    '24',
    'UNIT_TEST_1',
    '[
        {"subject": "Science & Lab", "marksObtained": 92, "maxMarks": 100, "grade": "A1", "remarks": "Excellent experimental deductions."},
        {"subject": "Mathematics", "marksObtained": 90, "maxMarks": 100, "grade": "A1", "remarks": "Accurate trigonometry proofs."},
        {"subject": "English Communicative", "marksObtained": 88, "maxMarks": 100, "grade": "A2", "remarks": "Impressive comprehension answers."},
        {"subject": "Social Science", "marksObtained": 91, "maxMarks": 100, "grade": "A1", "remarks": "Thorough geography answers."},
        {"subject": "Computer Applications", "marksObtained": 95, "maxMarks": 100, "grade": "A1", "remarks": "Strong logic design."}
    ]'::jsonb,
    91.2,
    'A1',
    false
)
ON CONFLICT (id) DO UPDATE SET
    scores_json = EXCLUDED.scores_json,
    aggregate_percentage = EXCLUDED.aggregate_percentage,
    overall_grade = EXCLUDED.overall_grade,
    updated_at = NOW();

-- Insert Class 10 Syllabus Chapters
INSERT INTO public.syllabus_roadmaps (id, school_id, school_code, chapter_number, title, class_grade, subject, board, file_name, file_size_bytes, status, ar_model_mapped, milestones_json, progress_percent, is_current)
VALUES
(
    'ch-sci-10-06',
    'DVPS01',
    'DVPS01',
    6,
    'Life Processes: Cardiac Anatomy & Systemic Circulation',
    'Class 10-A',
    'Science (Biology)',
    'CBSE',
    'NCERT_Class10_Science_Ch06_LifeProcesses.pdf',
    '4.8 MB',
    'READY',
    'Human Heart 3D',
    '[
        {"nodeId": "n1", "title": "6.1 Autotrophic & Heterotrophic Nutrition", "ncertPageRange": "Pages 93-97", "ragStatus": "GROUNDED"},
        {"nodeId": "n2", "title": "6.2 Cellular Respiration & ATP Synthesis", "ncertPageRange": "Pages 101-104", "ragStatus": "GROUNDED"},
        {"nodeId": "n3", "title": "6.3 Transportation: Human Heart (4 Chambers & Aorta)", "ncertPageRange": "Pages 105-108", "ragStatus": "GROUNDED"},
        {"nodeId": "n4", "title": "6.4 Blood Vessels: Arteries vs Veins & Double Circulation", "ncertPageRange": "Pages 109-111", "ragStatus": "GROUNDED"},
        {"nodeId": "n5", "title": "6.5 Excretion in Humans: Nephron Filtration System", "ncertPageRange": "Pages 112-116", "ragStatus": "GROUNDED"}
    ]'::jsonb,
    65,
    true
),
(
    'ch-phy-10-10',
    'DVPS01',
    'DVPS01',
    10,
    'Light: Reflection, Spherical Mirrors & Refraction',
    'Class 10-A',
    'Science (Physics)',
    'CBSE',
    'NCERT_Class10_Physics_Ch10_Light.pdf',
    '5.2 MB',
    'READY',
    'Optics Bench 3D',
    '[
        {"nodeId": "n1", "title": "10.1 Laws of Reflection & Ray Tracing", "ncertPageRange": "Pages 160-163", "ragStatus": "GROUNDED"},
        {"nodeId": "n2", "title": "10.2 Spherical Mirrors: Concave & Convex Optics", "ncertPageRange": "Pages 164-168", "ragStatus": "GROUNDED"},
        {"nodeId": "n3", "title": "10.3 Mirror Formula & Cartesian Sign Convention", "ncertPageRange": "Pages 169-172", "ragStatus": "GROUNDED"},
        {"nodeId": "n4", "title": "10.4 Refraction through Glass Slab & Snell''s Law", "ncertPageRange": "Pages 173-176", "ragStatus": "GROUNDED"},
        {"nodeId": "n5", "title": "10.5 Lens Power (Dioptre) & Virtual Images", "ncertPageRange": "Pages 177-181", "ragStatus": "GROUNDED"}
    ]'::jsonb,
    40,
    false
),
(
    'ch-mat-10-04',
    'DVPS01',
    'DVPS01',
    4,
    'Quadratic Equations & Discriminant Nature of Roots',
    'Class 10-A',
    'Mathematics',
    'CBSE',
    'NCERT_Class10_Maths_Ch04_QuadraticEquations.pdf',
    '3.4 MB',
    'READY',
    'Quadratic Graph 3D',
    '[
        {"nodeId": "n1", "title": "4.1 Standard Form: ax² + bx + c = 0", "ncertPageRange": "Pages 70-74", "ragStatus": "GROUNDED"},
        {"nodeId": "n2", "title": "4.2 Factorisation Method & Splitting Middle Term", "ncertPageRange": "Pages 75-79", "ragStatus": "GROUNDED"},
        {"nodeId": "n3", "title": "4.3 Quadratic Formula (Shreedharacharya Rule)", "ncertPageRange": "Pages 80-84", "ragStatus": "GROUNDED"},
        {"nodeId": "n4", "title": "4.4 Discriminant D = b² - 4ac & Real Root Analysis", "ncertPageRange": "Pages 85-88", "ragStatus": "GROUNDED"},
        {"nodeId": "n5", "title": "4.5 Real-World Word Problems (Speed, Time, Area)", "ncertPageRange": "Pages 89-93", "ragStatus": "GROUNDED"}
    ]'::jsonb,
    25,
    false
)
ON CONFLICT (id) DO UPDATE SET
    milestones_json = EXCLUDED.milestones_json,
    progress_percent = EXCLUDED.progress_percent,
    updated_at = NOW();

-- Verification query
SELECT 'Edzy Schema & Realtime Seed Complete' AS status,
       (SELECT COUNT(*) FROM public.schools) AS total_schools,
       (SELECT COUNT(*) FROM public.students) AS total_students,
       (SELECT COUNT(*) FROM public.fee_ledger) AS total_fee_installments,
       (SELECT COUNT(*) FROM public.exam_marks) AS total_exam_records,
       (SELECT COUNT(*) FROM public.syllabus_roadmaps) AS total_syllabus_chapters;
