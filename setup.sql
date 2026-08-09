-- =====================================================================
-- JS-MENTOR DATABASE SCHEMA (PostgreSQL version for Render Deployment)
-- =====================================================================

-- 1. ENUM TYPES
-- PostgreSQL requires explicit creation of ENUM types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('STUDENT', 'TRAINER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE progress_status AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE evaluation_status AS ENUM ('NEW', 'PENDING_REVIEW', 'GRADED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE risk_level AS ENUM ('LOW', 'MEDIUM', 'HIGH');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE doubt_status AS ENUM ('OPEN', 'SCHEDULED', 'RESOLVED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE session_status AS ENUM ('SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  clerk_user_id VARCHAR(64) UNIQUE,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  hashed_password VARCHAR(255),
  role user_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  razorpay_customer_id VARCHAR(255) UNIQUE DEFAULT NULL,
  razorpay_order_id VARCHAR(255) DEFAULT NULL,
  subscription_status VARCHAR(50) DEFAULT 'inactive',
  subscription_ends_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='users' AND column_name='razorpay_customer_id'
    ) THEN
        ALTER TABLE users ADD COLUMN razorpay_customer_id VARCHAR(255) UNIQUE DEFAULT NULL;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='users' AND column_name='razorpay_order_id'
    ) THEN
        ALTER TABLE users ADD COLUMN razorpay_order_id VARCHAR(255) DEFAULT NULL;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='users' AND column_name='subscription_status'
    ) THEN
        ALTER TABLE users ADD COLUMN subscription_status VARCHAR(50) DEFAULT 'inactive';
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='users' AND column_name='subscription_ends_at'
    ) THEN
        ALTER TABLE users ADD COLUMN subscription_ends_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
    END IF;
END $$;


-- 3. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  phone_no VARCHAR(20) NOT NULL,
  scholar_no VARCHAR(50) UNIQUE
);

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='students' AND column_name='scholar_no'
    ) THEN
        ALTER TABLE students ADD COLUMN scholar_no VARCHAR(50) UNIQUE;
    END IF;
END $$;

-- 4. TRAINERS TABLE
CREATE TABLE IF NOT EXISTS trainers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  specialization VARCHAR(100),
  is_available BOOLEAN DEFAULT FALSE
);

-- 5. TRAINER REGISTRATION CODES TABLE
CREATE TABLE IF NOT EXISTS trainer_registration_codes (
  code VARCHAR(20) PRIMARY KEY,
  is_used BOOLEAN DEFAULT FALSE,
  used_by_trainer_id INTEGER REFERENCES trainers(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. STUDENT_PROGRESS TABLE
CREATE TABLE IF NOT EXISTS student_progress (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  topic_id VARCHAR(100) NOT NULL,
  status progress_status DEFAULT 'NOT_STARTED',
  time_spent_seconds INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (student_id, topic_id)
);

-- Function for updating last_accessed_at (Replaces ON UPDATE CURRENT_TIMESTAMP)
CREATE OR REPLACE FUNCTION update_last_accessed_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_accessed_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for student_progress
DROP TRIGGER IF EXISTS tr_update_last_accessed ON student_progress;
CREATE TRIGGER tr_update_last_accessed
BEFORE UPDATE ON student_progress
FOR EACH ROW EXECUTE FUNCTION update_last_accessed_column();


-- VIDEO_PROGRESS TABLE
CREATE TABLE IF NOT EXISTS video_progress (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    topic_id VARCHAR(100) NOT NULL,
    video_url VARCHAR(255) NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    watched_seconds INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_video_progress_student_id ON video_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_video_progress_topic_id ON video_progress(topic_id);

-- Trigger for video_progress
DROP TRIGGER IF EXISTS tr_update_video_last_accessed ON video_progress;
CREATE TRIGGER tr_update_video_last_accessed
BEFORE UPDATE ON video_progress
FOR EACH ROW
EXECUTE FUNCTION update_last_accessed_column();

-- 7. EXERCISE_EVALUATIONS TABLE
CREATE TABLE IF NOT EXISTS exercise_evaluations (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  exercise_id VARCHAR(100) NOT NULL,
  code_submitted TEXT,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  execution_time_ms INTEGER,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  status evaluation_status DEFAULT 'NEW',
  grade DECIMAL(5,2),
  feedback TEXT,
  graded_by INTEGER REFERENCES trainers(id) ON DELETE SET NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  graded_at TIMESTAMP WITH TIME ZONE
);

-- 8. QUIZ_EVALUATIONS TABLE
CREATE TABLE IF NOT EXISTS quiz_evaluations (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  quiz_id VARCHAR(100) NOT NULL,
  score DECIMAL(5,2) NOT NULL,
  total_questions INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. STUDENT_RISK_PREDICTIONS TABLE
CREATE TABLE IF NOT EXISTS student_risk_predictions (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  predicted_pass_probability DECIMAL(5,4) NOT NULL,
  risk_level risk_level NOT NULL,
  key_factors TEXT,
  evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. MENTORSHIP_SESSIONS TABLE
CREATE TABLE IF NOT EXISTS mentorship_sessions (
  id SERIAL PRIMARY KEY,
  trainer_id INTEGER NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  topic VARCHAR(255) NOT NULL,
  status session_status DEFAULT 'SCHEDULED',
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (trainer_id, scheduled_for)
);

-- 11. DOUBTS TABLE
CREATE TABLE IF NOT EXISTS doubts (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  topic VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  learning_path_index INTEGER,
  cloudinary_folder VARCHAR(255),
  status doubt_status DEFAULT 'OPEN',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by INTEGER REFERENCES trainers(id) ON DELETE SET NULL,
  session_id INTEGER REFERENCES mentorship_sessions(id) ON DELETE SET NULL
);

-- 12. DOUBT_REPLIES TABLE
CREATE TABLE IF NOT EXISTS doubt_replies (
  id SERIAL PRIMARY KEY,
  doubt_id INTEGER NOT NULL REFERENCES doubts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  image_urls TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. CURRICULUM_ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS curriculum_assignments (
  id SERIAL PRIMARY KEY,
  trainer_id INTEGER NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  learning_path_id VARCHAR(100) NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  due_date TIMESTAMP WITH TIME ZONE
);

-- 14. MEDIA_TUTORIALS TABLE
CREATE TABLE IF NOT EXISTS media_tutorials (
  id SERIAL PRIMARY KEY,
  trainer_id INTEGER NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  url VARCHAR(500) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- INITIAL SEED DATA
-- =====================================================================

DO $$
DECLARE
    v_trainer1_id INTEGER;
    v_trainer2_id INTEGER;
    v_trainer3_id INTEGER;
    v_s1 INTEGER; v_s2 INTEGER; v_s3 INTEGER; v_s4 INTEGER; v_s5 INTEGER;
    v_s6 INTEGER; v_s7 INTEGER; v_s8 INTEGER; v_s9 INTEGER; v_s10 INTEGER;
    v_u_tmp INTEGER;
BEGIN

    -- Seed Registration Codes
    INSERT INTO trainer_registration_codes (code) VALUES 
    ('2025JSMC004CT'), ('2025JSMC005CT'), ('2026JSMC005CT'), ('2026JSMC006CT')
    ON CONFLICT (code) DO NOTHING;

END $$;
