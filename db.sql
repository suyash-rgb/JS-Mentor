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
    `role` enum('STUDENT', 'TRAINER') NOT NULL,
    `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `ix_users_username` (`username`),
    UNIQUE KEY `ix_users_email` (`email`),
    UNIQUE KEY `ix_users_clerk_user_id` (`clerk_user_id`),
    KEY `ix_users_id` (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

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
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

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
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

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
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

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
    `status` enum(
        'NOT_STARTED',
        'IN_PROGRESS',
        'COMPLETED'
    ) DEFAULT 'NOT_STARTED',
    `time_spent_seconds` int DEFAULT 0 COMMENT 'Total time spent on this topic',
    `last_accessed_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `ix_student_topic` (`student_id`, `topic_id`),
    CONSTRAINT `progress_student_fk` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

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
    `status` enum(
        'NEW',
        'PENDING_REVIEW',
        'GRADED'
    ) DEFAULT 'NEW',
    `grade` decimal(5, 2) DEFAULT NULL,
    `feedback` text DEFAULT NULL,
    `graded_by` int DEFAULT NULL COMMENT 'Trainer ID who graded this',
    `submitted_at` datetime DEFAULT CURRENT_TIMESTAMP,
    `graded_at` datetime DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `ix_exercise_student` (`student_id`),
    KEY `ix_exercise_trainer` (`graded_by`),
    CONSTRAINT `exercise_student_fk` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
    CONSTRAINT `exercise_trainer_fk` FOREIGN KEY (`graded_by`) REFERENCES `trainers` (`id`) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- 6. QUIZ_EVALUATIONS TABLE
-- Captures data on quizzes. Frequent failures or poor scores are strong predictors
-- of a struggling student, making this data crucial for training the model.
CREATE TABLE `quiz_evaluations` (
    `id` int NOT NULL AUTO_INCREMENT,
    `student_id` int NOT NULL,
    `quiz_id` varchar(100) NOT NULL,
    `score` decimal(5, 2) NOT NULL,
    `total_questions` int NOT NULL,
    `passed` boolean NOT NULL,
    `attempt_number` int NOT NULL DEFAULT 1,
    `completed_at` datetime DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `ix_quiz_student` (`student_id`),
    CONSTRAINT `quiz_student_fk` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- 7. STUDENT_RISK_PREDICTIONS TABLE
-- This table stores the evaluated outputs of your logistic regression model so
-- Trainers can view flagged students (High Risk) directly on their dashboard.
CREATE TABLE `student_risk_predictions` (
    `id` int NOT NULL AUTO_INCREMENT,
    `student_id` int NOT NULL,
    `predicted_pass_probability` decimal(5, 4) NOT NULL COMMENT 'Calculated probability between 0.0 and 1.0',
    `risk_level` enum('LOW', 'MEDIUM', 'HIGH') NOT NULL COMMENT 'Categorization based on probability threshold',
    `key_factors` text COMMENT 'Optional JSON/String explaining driving causes (e.g., low quiz scores)',
    `evaluated_at` datetime DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `ix_prediction_student` (`student_id`),
    CONSTRAINT `prediction_student_fk` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

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
    -- 1-indexed position of the learning path card in data.json.
    -- Paths 1 & 2 → 30-min sessions. Paths 3-6 → 60-min sessions.
    `learning_path_index` int NOT NULL DEFAULT 1,
    `cloudinary_folder` varchar(255) DEFAULT NULL,
    `status` enum(
        'OPEN',
        'SCHEDULED',
        'RESOLVED'
    ) DEFAULT 'OPEN',
    `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
    `resolved_at` datetime DEFAULT NULL,
    `resolved_by` int DEFAULT NULL COMMENT 'Trainer ID who resolved this',
    -- FK to the MentorshipSession created by the scheduling engine
    `session_id` int DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `ix_doubt_student` (`student_id`),
    KEY `ix_doubt_trainer` (`resolved_by`),
    KEY `ix_doubt_session` (`session_id`),
    CONSTRAINT `doubt_student_fk` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
    CONSTRAINT `doubt_trainer_fk` FOREIGN KEY (`resolved_by`) REFERENCES `trainers` (`id`) ON DELETE SET NULL
    -- Note: FK to mentorship_sessions added after that table is created (see ALTER below)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- 9. DOUBT_REPLIES TABLE (Student Doubts Hub)
-- Threaded replies for doubts.
CREATE TABLE `doubt_replies` (
    `id` int NOT NULL AUTO_INCREMENT,
    `doubt_id` int NOT NULL,
    `user_id` int NOT NULL COMMENT 'Can be Student or Trainer',
    `message` text NOT NULL,
    `image_urls` text DEFAULT NULL,
    `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `ix_reply_doubt` (`doubt_id`),
    KEY `ix_reply_user` (`user_id`),
    CONSTRAINT `reply_doubt_fk` FOREIGN KEY (`doubt_id`) REFERENCES `doubts` (`id`) ON DELETE CASCADE,
    CONSTRAINT `reply_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- 10. MENTORSHIP_SESSIONS TABLE (Active Mentorship Sessions)
-- Manages 1-on-1 sessions between students and trainers.
CREATE TABLE `mentorship_sessions` (
    `id` int NOT NULL AUTO_INCREMENT,
    `trainer_id` int NOT NULL,
    `student_id` int NOT NULL,
    `topic` varchar(255) NOT NULL,
    `status` enum(
        'SCHEDULED',
        'ACTIVE',
        'COMPLETED',
        'CANCELLED'
    ) DEFAULT 'SCHEDULED',
    `scheduled_for` datetime NOT NULL,
    `duration_minutes` int NOT NULL DEFAULT 30,
    `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    -- Prevents double-booking: a trainer cannot have two sessions at the same start time
    UNIQUE KEY `uq_trainer_slot` (`trainer_id`, `scheduled_for`),
    KEY `ix_session_trainer` (`trainer_id`),
    KEY `ix_session_student` (`student_id`),
    CONSTRAINT `session_trainer_fk` FOREIGN KEY (`trainer_id`) REFERENCES `trainers` (`id`) ON DELETE CASCADE,
    CONSTRAINT `session_student_fk` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

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
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

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
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- VIDEO_PROGRESS TABLE
CREATE TABLE IF NOT EXISTS video_progress (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students (id) ON DELETE CASCADE,
    topic_id VARCHAR(100) NOT NULL,
    video_url VARCHAR(255) NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    watched_seconds INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_video_progress_student_id ON video_progress (student_id);

CREATE INDEX IF NOT EXISTS idx_video_progress_topic_id ON video_progress (topic_id);

-- Trigger for video_progress
DROP TRIGGER IF EXISTS tr_update_video_last_accessed ON video_progress;

CREATE TRIGGER tr_update_video_last_accessed
BEFORE UPDATE ON video_progress
FOR EACH ROW
EXECUTE FUNCTION update_last_accessed_column();

ALTER TABLE `doubts`
ADD COLUMN `learning_path_index` int NOT NULL DEFAULT 1 AFTER `description`,
ADD COLUMN `session_id` int DEFAULT NULL AFTER `resolved_by`,
MODIFY COLUMN `status` enum(
    'OPEN',
    'SCHEDULED',
    'RESOLVED'
) DEFAULT 'OPEN',
ADD KEY `ix_doubt_session` (`session_id`),
ADD CONSTRAINT `doubt_session_fk` FOREIGN KEY (`session_id`) REFERENCES `mentorship_sessions` (`id`) ON DELETE SET NULL;

ALTER TABLE `mentorship_sessions`
ADD UNIQUE KEY `uq_trainer_slot` (`trainer_id`, `scheduled_for`);

SELECT * FROM users;

ALTER TABLE doubts
ADD COLUMN cloudinary_folder VARCHAR(255) DEFAULT NULL;

SET SQL_SAFE_UPDATES = 0;

UPDATE trainers SET is_available = 0;

SET SQL_SAFE_UPDATES = 1;