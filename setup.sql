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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  phone_no VARCHAR(20) NOT NULL,
  scholar_no VARCHAR(50) UNIQUE
);

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
  learning_path_index INTEGER NOT NULL DEFAULT 1,
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
    -- Seed Trainers (Avoid duplicate inserts if re-run)
    IF NOT EXISTS (SELECT 1 FROM users WHERE username = 'head_trainer') THEN
        INSERT INTO users (username, email, hashed_password, role) 
        VALUES ('head_trainer', 'trainer@jsmentor.com', '$2b$12$6/Yd7FkG9.D.H7IeKq3YSuqB9g5uF1RzK7m4H6s.vE8uY.kU/5M.i', 'TRAINER')
        RETURNING id INTO v_u_tmp;
        INSERT INTO trainers (user_id, name, is_available) VALUES (v_u_tmp, 'Head Trainer', TRUE) RETURNING id INTO v_trainer1_id;
    ELSE
        SELECT id INTO v_trainer1_id FROM trainers WHERE name = 'Head Trainer' LIMIT 1;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM users WHERE username = 'demo_trainer') THEN
        INSERT INTO users (username, email, hashed_password, role) 
        VALUES ('demo_trainer', 'trainer12@jsmentor.com', 'kuchbhi', 'TRAINER')
        RETURNING id INTO v_u_tmp;
        INSERT INTO trainers (user_id, name, is_available) VALUES (v_u_tmp, 'Demo Trainer', TRUE) RETURNING id INTO v_trainer2_id;
    ELSE
        SELECT id INTO v_trainer2_id FROM trainers WHERE name = 'Demo Trainer' LIMIT 1;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM users WHERE username = 'chaitanya') THEN
        INSERT INTO users (username, email, hashed_password, role) 
        VALUES ('chaitanya', 'chaitu@gmail.com', '$2b$12$olckcmcCDSRY51ichN5R7upzunGq8WJ/MLNZrb2szacyrD3KFTfaW', 'TRAINER')
        RETURNING id INTO v_u_tmp;
        INSERT INTO trainers (user_id, name, is_available) VALUES (v_u_tmp, 'Chaitanya', TRUE) RETURNING id INTO v_trainer3_id;
    ELSE
        SELECT id INTO v_trainer3_id FROM trainers WHERE name = 'Chaitanya' LIMIT 1;
    END IF;

    -- Seed Registration Codes
    INSERT INTO trainer_registration_codes (code) VALUES 
    ('2025JSMC004CT'), ('2025JSMC005CT'), ('2026JSMC005CT'), ('2026JSMC006CT')
    ON CONFLICT (code) DO NOTHING;

    -- Seed Students (Mock Data for Demo)
    IF NOT EXISTS (SELECT 1 FROM users WHERE username = 's1_alice') THEN
        INSERT INTO users (clerk_user_id, username, email, role) VALUES ('mock_ck_1', 's1_alice', 'alice@jsmentor.com', 'STUDENT') RETURNING id INTO v_u_tmp;
        INSERT INTO students (user_id, name, phone_no, scholar_no) VALUES (v_u_tmp, 'Alice Smith', '9876543210', 'SCH101') RETURNING id INTO v_s1;

        INSERT INTO users (clerk_user_id, username, email, role) VALUES ('mock_ck_2', 's2_bob', 'bob@jsmentor.com', 'STUDENT') RETURNING id INTO v_u_tmp;
        INSERT INTO students (user_id, name, phone_no, scholar_no) VALUES (v_u_tmp, 'Bob Jones', '9876543211', 'SCH102') RETURNING id INTO v_s2;

        INSERT INTO users (clerk_user_id, username, email, role) VALUES ('mock_ck_3', 's3_charlie', 'charlie@jsmentor.com', 'STUDENT') RETURNING id INTO v_u_tmp;
        INSERT INTO students (user_id, name, phone_no, scholar_no) VALUES (v_u_tmp, 'Charlie Brown', '9876543212', 'SCH103') RETURNING id INTO v_s3;

        INSERT INTO users (clerk_user_id, username, email, role) VALUES ('mock_ck_4', 's4_diana', 'diana@jsmentor.com', 'STUDENT') RETURNING id INTO v_u_tmp;
        INSERT INTO students (user_id, name, phone_no, scholar_no) VALUES (v_u_tmp, 'Diana Prince', '9876543213', 'SCH104') RETURNING id INTO v_s4;

        INSERT INTO users (clerk_user_id, username, email, role) VALUES ('mock_ck_5', 's5_ethan', 'ethan@jsmentor.com', 'STUDENT') RETURNING id INTO v_u_tmp;
        INSERT INTO students (user_id, name, phone_no, scholar_no) VALUES (v_u_tmp, 'Ethan Hunt', '9876543214', 'SCH105') RETURNING id INTO v_s5;

        INSERT INTO users (clerk_user_id, username, email, role) VALUES ('mock_ck_6', 's6_fiona', 'fiona@jsmentor.com', 'STUDENT') RETURNING id INTO v_u_tmp;
        INSERT INTO students (user_id, name, phone_no, scholar_no) VALUES (v_u_tmp, 'Fiona Gallagher', '9876543215', 'SCH106') RETURNING id INTO v_s6;

        INSERT INTO users (clerk_user_id, username, email, role) VALUES ('mock_ck_7', 's7_george', 'george@jsmentor.com', 'STUDENT') RETURNING id INTO v_u_tmp;
        INSERT INTO students (user_id, name, phone_no, scholar_no) VALUES (v_u_tmp, 'George Lucas', '9876543216', 'SCH107') RETURNING id INTO v_s7;

        INSERT INTO users (clerk_user_id, username, email, role) VALUES ('mock_ck_8', 's8_hannah', 'hannah@jsmentor.com', 'STUDENT') RETURNING id INTO v_u_tmp;
        INSERT INTO students (user_id, name, phone_no, scholar_no) VALUES (v_u_tmp, 'Hannah Abbott', '9876543217', 'SCH108') RETURNING id INTO v_s8;

        INSERT INTO users (clerk_user_id, username, email, role) VALUES ('mock_ck_9', 's9_ian', 'ian@jsmentor.com', 'STUDENT') RETURNING id INTO v_u_tmp;
        INSERT INTO students (user_id, name, phone_no, scholar_no) VALUES (v_u_tmp, 'Ian Malcolm', '9876543218', 'SCH109') RETURNING id INTO v_s9;

        INSERT INTO users (clerk_user_id, username, email, role) VALUES ('mock_ck_10', 's10_julia', 'julia@jsmentor.com', 'STUDENT') RETURNING id INTO v_u_tmp;
        INSERT INTO students (user_id, name, phone_no, scholar_no) VALUES (v_u_tmp, 'Julia Roberts', '9876543219', 'SCH110') RETURNING id INTO v_s10;

        -- Add Quiz Evaluations
        INSERT INTO quiz_evaluations (student_id, quiz_id, score, total_questions, passed) VALUES 
        (v_s1, 'fundamentals_quiz_1', 9.5, 10, TRUE),
        (v_s2, 'fundamentals_quiz_1', 7.0, 10, TRUE),
        (v_s3, 'fundamentals_quiz_1', 4.0, 10, FALSE),
        (v_s4, 'fundamentals_quiz_1', 8.5, 10, TRUE),
        (v_s5, 'fundamentals_quiz_1', 6.0, 10, TRUE),
        (v_s6, 'fundamentals_quiz_1', 9.0, 10, TRUE),
        (v_s7, 'fundamentals_quiz_1', 5.5, 10, FALSE),
        (v_s8, 'fundamentals_quiz_1', 10.0, 10, TRUE),
        (v_s9, 'fundamentals_quiz_1', 7.5, 10, TRUE),
        (v_s10, 'fundamentals_quiz_1', 8.0, 10, TRUE);

        -- Add Exercise Evaluations
        INSERT INTO exercise_evaluations (student_id, exercise_id, code_submitted, is_correct, status, submitted_at) VALUES 
        (v_s2, '102', 'function makeCounter() { let count = 0; return function() { return ++count; }; }', TRUE, 'NEW', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
        (v_s3, '103', 'function delayedGreeting(name, cb) { setTimeout(() => { console.log(`Hello ${name}`); cb(); }, 1000); }', FALSE, 'PENDING_REVIEW', CURRENT_TIMESTAMP - INTERVAL '5 hours'),
        (v_s7, '102', 'const makeCounter = () => { let c = 0; return () => ++c; };', TRUE, 'NEW', CURRENT_TIMESTAMP - INTERVAL '1 hour'),
        (v_s1, '103', 'function delayedGreeting(n, c) { setTimeout(c, 1000); }', TRUE, 'GRADED', CURRENT_TIMESTAMP - INTERVAL '1 day'),
        (v_s9, '102', 'let count = 0; function makeCounter() { return function() { count++; return count; } }', TRUE, 'NEW', CURRENT_TIMESTAMP - INTERVAL '30 minutes');

        -- Add Mentorship Sessions (Assumes trainer1 is the one logged in for testing)
        INSERT INTO mentorship_sessions (trainer_id, student_id, topic, status, scheduled_for, duration_minutes) VALUES 
        (v_trainer1_id, v_s3, 'Reviewing Loop Concepts', 'SCHEDULED', CURRENT_TIMESTAMP + INTERVAL '1 day', 30),
        (v_trainer1_id, v_s7, 'Advanced DOM Manipulation', 'ACTIVE', CURRENT_TIMESTAMP, 45),
        (v_trainer1_id, v_s5, 'Debugging CSS', 'SCHEDULED', CURRENT_TIMESTAMP + INTERVAL '2 days', 30);

        -- Add Doubts
        INSERT INTO doubts (student_id, topic, description, status, created_at) VALUES 
        (v_s3, 'While Loops', 'I keep getting infinite loops, please help!', 'OPEN', CURRENT_TIMESTAMP - INTERVAL '4 hours'),
        (v_s7, 'Promises', 'What is the difference between resolve and reject?', 'OPEN', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
        (v_s5, 'CSS Grid', 'My grid items are overlapping.', 'OPEN', CURRENT_TIMESTAMP - INTERVAL '1 hour'),
        (v_s1, 'React Hooks', 'When to use useMemo?', 'RESOLVED', CURRENT_TIMESTAMP - INTERVAL '2 days');
    END IF;
END $$;
