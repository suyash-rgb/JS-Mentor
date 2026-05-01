-- =====================================================================
-- JS-MENTOR DATABASE SCHEMA
-- =====================================================================

DROP DATABASE IF EXISTS js_mentor_db;
CREATE DATABASE js_mentor_db;
USE js_mentor_db;

-- =====================================================================
-- CORE AUTHENTICATION AND PROFILES
-- =====================================================================

-- 1. USERS TABLE
-- Stores authentication data and core user details. 
-- The 'role' column determines if the user is a STUDENT or TRAINER.
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `clerk_user_id` varchar(64) DEFAULT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `hashed_password` varchar(255) DEFAULT NULL,
  `role` enum('STUDENT','TRAINER') NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_users_username` (`username`),
  UNIQUE KEY `ix_users_email` (`email`),
  UNIQUE KEY `ix_users_clerk_user_id` (`clerk_user_id`),
  KEY `ix_users_id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 2. STUDENTS TABLE
-- Stores student-specific profile information. Linked to the users table.
-- Trainers can view details from this table via the trainer dashboard.
CREATE TABLE `students` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `phone_no` varchar(20) NOT NULL,
  `scholar_no` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  UNIQUE KEY `ix_students_scholar_no` (`scholar_no`),
  KEY `ix_students_id` (`id`),
  CONSTRAINT `students_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 3. TRAINERS TABLE
-- Stores trainer profile information for the institute login dashboard.
CREATE TABLE `trainers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `specialization` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `ix_trainers_id` (`id`),
  CONSTRAINT `trainers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 3.5. TRAINER REGISTRATION CODES TABLE
-- Restricts who can register as a trainer.
CREATE TABLE `trainer_registration_codes` (
  `code` varchar(20) NOT NULL,
  `is_used` boolean DEFAULT FALSE,
  `used_by_trainer_id` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`code`),
  KEY `ix_registration_code_trainer` (`used_by_trainer_id`),
  CONSTRAINT `code_trainer_fk` FOREIGN KEY (`used_by_trainer_id`) REFERENCES `trainers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- =====================================================================
-- MACHINE LEARNING / ANALYTICS DATA TABLES
-- =====================================================================

-- 4. STUDENT_PROGRESS TABLE
-- Tracks the state of frontend learning paths to see where students are.
-- Gives us a completion rate feature for predicting pass/fail.
CREATE TABLE `student_progress` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `topic_id` varchar(100) NOT NULL COMMENT 'Identifier for the learning path or topic',
  `status` enum('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED') DEFAULT 'NOT_STARTED',
  `time_spent_seconds` int DEFAULT 0 COMMENT 'Total time spent on this topic',
  `last_accessed_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_student_topic` (`student_id`, `topic_id`),
  CONSTRAINT `progress_student_fk` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 5. EXERCISE_EVALUATIONS TABLE (Used for Grading Hub)
-- Captures data on coding exercises (attempts, correctness, execution time).
-- Extended to support Grading Hub (manual review, grading, feedback).
CREATE TABLE `exercise_evaluations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `exercise_id` varchar(100) NOT NULL,
  `code_submitted` text,
  `is_correct` boolean NOT NULL DEFAULT FALSE,
  `execution_time_ms` int DEFAULT NULL,
  `attempt_number` int NOT NULL DEFAULT 1,
  `status` enum('NEW', 'PENDING_REVIEW', 'GRADED') DEFAULT 'NEW',
  `grade` decimal(5,2) DEFAULT NULL,
  `feedback` text DEFAULT NULL,
  `graded_by` int DEFAULT NULL COMMENT 'Trainer ID who graded this',
  `submitted_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `graded_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_exercise_student` (`student_id`),
  KEY `ix_exercise_trainer` (`graded_by`),
  CONSTRAINT `exercise_student_fk` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `exercise_trainer_fk` FOREIGN KEY (`graded_by`) REFERENCES `trainers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 6. QUIZ_EVALUATIONS TABLE
-- Captures data on quizzes. Frequent failures or poor scores are strong predictors
-- of a struggling student, making this data crucial for training the model.
CREATE TABLE `quiz_evaluations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `quiz_id` varchar(100) NOT NULL,
  `score` decimal(5,2) NOT NULL,
  `total_questions` int NOT NULL,
  `passed` boolean NOT NULL,
  `attempt_number` int NOT NULL DEFAULT 1,
  `completed_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ix_quiz_student` (`student_id`),
  CONSTRAINT `quiz_student_fk` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 7. STUDENT_RISK_PREDICTIONS TABLE
-- This table stores the evaluated outputs of your logistic regression model so 
-- Trainers can view flagged students (High Risk) directly on their dashboard.
CREATE TABLE `student_risk_predictions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `predicted_pass_probability` decimal(5,4) NOT NULL COMMENT 'Calculated probability between 0.0 and 1.0',
  `risk_level` enum('LOW', 'MEDIUM', 'HIGH') NOT NULL COMMENT 'Categorization based on probability threshold',
  `key_factors` text COMMENT 'Optional JSON/String explaining driving causes (e.g., low quiz scores)',
  `evaluated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ix_prediction_student` (`student_id`),
  CONSTRAINT `prediction_student_fk` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- =====================================================================
-- TRAINER DASHBOARD TABLES
-- =====================================================================

-- 8. DOUBTS TABLE (Student Doubts Hub)
-- Stores doubts raised by students that trainers need to answer.
CREATE TABLE `doubts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `topic` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `status` enum('OPEN', 'RESOLVED') DEFAULT 'OPEN',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `resolved_at` datetime DEFAULT NULL,
  `resolved_by` int DEFAULT NULL COMMENT 'Trainer ID who resolved this',
  PRIMARY KEY (`id`),
  KEY `ix_doubt_student` (`student_id`),
  KEY `ix_doubt_trainer` (`resolved_by`),
  CONSTRAINT `doubt_student_fk` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `doubt_trainer_fk` FOREIGN KEY (`resolved_by`) REFERENCES `trainers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 9. DOUBT_REPLIES TABLE (Student Doubts Hub)
-- Threaded replies for doubts.
CREATE TABLE `doubt_replies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `doubt_id` int NOT NULL,
  `user_id` int NOT NULL COMMENT 'Can be Student or Trainer',
  `message` text NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ix_reply_doubt` (`doubt_id`),
  KEY `ix_reply_user` (`user_id`),
  CONSTRAINT `reply_doubt_fk` FOREIGN KEY (`doubt_id`) REFERENCES `doubts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reply_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 10. MENTORSHIP_SESSIONS TABLE (Active Mentorship Sessions)
-- Manages 1-on-1 sessions between students and trainers.
CREATE TABLE `mentorship_sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `trainer_id` int NOT NULL,
  `student_id` int NOT NULL,
  `topic` varchar(255) NOT NULL,
  `status` enum('SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED') DEFAULT 'SCHEDULED',
  `scheduled_for` datetime NOT NULL,
  `duration_minutes` int NOT NULL DEFAULT 30,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ix_session_trainer` (`trainer_id`),
  KEY `ix_session_student` (`student_id`),
  CONSTRAINT `session_trainer_fk` FOREIGN KEY (`trainer_id`) REFERENCES `trainers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `session_student_fk` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 11. CURRICULUM_ASSIGNMENTS TABLE (Curriculum Manager)
-- Allows trainers to assign specific learning paths to students.
CREATE TABLE `curriculum_assignments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `trainer_id` int NOT NULL,
  `student_id` int NOT NULL,
  `learning_path_id` varchar(100) NOT NULL,
  `assigned_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `due_date` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_assignment_trainer` (`trainer_id`),
  KEY `ix_assignment_student` (`student_id`),
  CONSTRAINT `assignment_trainer_fk` FOREIGN KEY (`trainer_id`) REFERENCES `trainers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `assignment_student_fk` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 12. MEDIA_TUTORIALS TABLE (Video Tutorials Hub)
-- Allows trainers to upload or link to specific video resources.
CREATE TABLE `media_tutorials` (
  `id` int NOT NULL AUTO_INCREMENT,
  `trainer_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `url` varchar(500) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ix_media_trainer` (`trainer_id`),
  CONSTRAINT `media_trainer_fk` FOREIGN KEY (`trainer_id`) REFERENCES `trainers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- =====================================================================
-- INITIAL SEED DATA
-- =====================================================================

START TRANSACTION;

-- Seed Head Trainer 1
INSERT INTO users (username, email, hashed_password, role)
VALUES (
    'head_trainer', 
    'trainer@jsmentor.com', 
    '$2b$12$6/Yd7FkG9.D.H7IeKq3YSuqB9g5uF1RzK7m4H6s.vE8uY.kU/5M.i', 
    'TRAINER'
);
SET @head_trainer_id = LAST_INSERT_ID();
INSERT INTO trainers (user_id, name) VALUES (@head_trainer_id, 'Head Trainer');

-- Seed Demo Trainer
INSERT INTO users (username, email, hashed_password, role)
VALUES (
    'demo_trainer', 
    'trainer12@jsmentor.com', 
    'kuchbhi', 
    'TRAINER'
);
SET @demo_trainer_id = LAST_INSERT_ID();
INSERT INTO trainers (user_id, name) VALUES (@demo_trainer_id, 'Demo Trainer');

-- Seed Chaitanya Trainer
INSERT INTO users (username, email, hashed_password, role)
VALUES (
    'chaitanya', 
    'chaitu@gmail.com', 
    '$2b$12$olckcmcCDSRY51ichN5R7upzunGq8WJ/MLNZrb2szacyrD3KFTfaW', 
    'TRAINER'
);
SET @chaitanya_trainer_id = LAST_INSERT_ID();
INSERT INTO trainers (user_id, name) VALUES (@chaitanya_trainer_id, 'Chaitanya');

COMMIT;

SHOW TABLES;
SELECT * FROM users;
SELECT * FROM trainers;

-- Seed Valid Registration Codes
INSERT INTO trainer_registration_codes (code) VALUES ('2025JSMC004CT');
INSERT INTO trainer_registration_codes (code) VALUES ('2025JSMC005CT');
INSERT INTO trainer_registration_codes (code) VALUES ('2026JSMC006CT');
SELECT * FROM students;

SELECT * FROM trainer_registration_codes;

INSERT INTO js_mentor_db.trainer_registration_codes (code) VALUES ('2025JSMC004CT');
INSERT INTO js_mentor_db.trainer_registration_codes (code) VALUES ('2026JSMC005CT');
