CREATE DATABASE js_mentor_db;

USE js_mentor_db;

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
  CONSTRAINT `students_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `trainers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `specialization` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `ix_trainers_id` (`id`),
  CONSTRAINT `trainers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `clerk_user_id` varchar(64) DEFAULT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `hashed_password` varchar(255) DEFAULT NULL,
  `role` enum('STUDENT','TRAINER') NOT NULL,
  `created_at` datetime DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_users_username` (`username`),
  UNIQUE KEY `ix_users_email` (`email`),
  UNIQUE KEY `ix_users_clerk_user_id` (`clerk_user_id`),
  KEY `ix_users_id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


SHOW TABLES;

SELECT * FROM students;
SELECT * FROM trainers;
SELECT * FROM users;

INSERT INTO users (username, email, hashed_password, role)
VALUES (
    'head_trainer', 
    'trainer@jsmentor.com', 
    '$2b$12$6/Yd7FkG9.D.H7IeKq3YSuqB9g5uF1RzK7m4H6s.vE8uY.kU/5M.i', 
    'trainer'
);

INSERT INTO users (username, email, hashed_password, role)
VALUES (
    'demo_trainer', 
    'trainer12@jsmentor.com', 
    'kuchbhi', 
    'trainer'
);

START TRANSACTION;

-- 1. Insert the auth credentials into the users table
INSERT INTO users (username, email, hashed_password, role)
VALUES (
    'head_trainer1', 
    'trainer1@jsmentor.com', 
    '$2b$12$6/Yd7FkG9.D.H7IeKq3YSuqB9g5uF1RzK7m4H6s.vE8uY.kU/5M.i', -- Hash for 'trainer123'
    'trainer'
);

-- 2. Capture the newly created user ID into a variable
SET @last_user_id = LAST_INSERT_ID();

-- 3. Insert the profile details into the trainers table using that ID
-- Note: Replace 'name' and other columns with your actual trainer table structure
INSERT INTO trainers (user_id, name) 
VALUES (@last_user_id, 'Head Trainer');

COMMIT;

UPDATE users 
SET hashed_password = '$2b$12$UySB26uzd3Xqo4ko0UDLJOzrez6jZwQyy4tQ5w9dk1EL5tz5Q0MCu' 
WHERE username = 'head_trainer1';

INSERT INTO users (username, email, hashed_password, role)
 VALUES ('chaitanya', 'chaitu@gmail.com', '$2b$12$olckcmcCDSRY51ichN5R7upzunGq8WJ/MLNZrb2szacyrD3KFTfaW', 'trainer');
 
DROP DATABASE js_metor_db;
 
-- -------------------------------------------------- New Database Design -----------------------------------------------------

-- Create the main database for JS-Mentor
CREATE DATABASE IF NOT EXISTS js_mentor_db;
USE js_mentor_db;

-- =====================================================================
-- CORE AUTHENTICATION AND PROFILES
-- =====================================================================

-- 1. USERS TABLE
-- Stores authentication data and core user details. 
-- The 'role' column determines if the user is a STUDENT or TRAINER.
CREATE TABLE IF NOT EXISTS `users` (
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
CREATE TABLE IF NOT EXISTS `students` (
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
CREATE TABLE IF NOT EXISTS `trainers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `specialization` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `ix_trainers_id` (`id`),
  CONSTRAINT `trainers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- =====================================================================
-- MACHINE LEARNING / ANALYTICS DATA TABLES
-- =====================================================================

-- 4. STUDENT_PROGRESS TABLE
-- Tracks the state of frontend learning paths to see where students are.
-- Gives us a completion rate feature for predicting pass/fail.
CREATE TABLE IF NOT EXISTS `student_progress` (
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

-- 5. EXERCISE_EVALUATIONS TABLE
-- Captures data on coding exercises (attempts, correctness, execution time).
-- These metrics are critical independent variables for your Logistic Regression model.
CREATE TABLE IF NOT EXISTS `exercise_evaluations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `exercise_id` varchar(100) NOT NULL,
  `code_submitted` text,
  `is_correct` boolean NOT NULL DEFAULT FALSE,
  `execution_time_ms` int DEFAULT NULL,
  `attempt_number` int NOT NULL DEFAULT 1,
  `submitted_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ix_exercise_student` (`student_id`),
  CONSTRAINT `exercise_student_fk` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 6. QUIZ_EVALUATIONS TABLE
-- Captures data on quizzes. Frequent failures or poor scores are strong predictors
-- of a struggling student, making this data crucial for training the model.
CREATE TABLE IF NOT EXISTS `quiz_evaluations` (
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
CREATE TABLE IF NOT EXISTS `student_risk_predictions` (
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
-- INITIAL SEED DATA
-- =====================================================================

-- Insert sample trainers
INSERT INTO users (username, email, hashed_password, role)
VALUES (
    'head_trainer', 
    'trainer@jsmentor.com', 
    '$2b$12$6/Yd7FkG9.D.H7IeKq3YSuqB9g5uF1RzK7m4H6s.vE8uY.kU/5M.i', 
    'TRAINER'
);

INSERT INTO users (username, email, hashed_password, role)
VALUES (
    'demo_trainer', 
    'trainer12@jsmentor.com', 
    'kuchbhi', 
    'TRAINER'
);

-- Using transaction to smoothly link users to trainers
START TRANSACTION;

-- Insert another sample trainer
INSERT INTO users (username, email, hashed_password, role)
VALUES (
    'head_trainer1', 
    'trainer1@jsmentor.com', 
    '$2b$12$6/Yd7FkG9.D.H7IeKq3YSuqB9g5uF1RzK7m4H6s.vE8uY.kU/5M.i', 
    'TRAINER'
);

-- Capture the user ID and insert trainer details
SET @last_user_id = LAST_INSERT_ID();
INSERT INTO trainers (user_id, name) VALUES (@last_user_id, 'Head Trainer 1');

COMMIT;

-- Password update
UPDATE users 
SET hashed_password = '$2b$12$UySB26uzd3Xqo4ko0UDLJOzrez6jZwQyy4tQ5w9dk1EL5tz5Q0MCu' 
WHERE username = 'head_trainer1';

-- Insert chaitanya
INSERT INTO users (username, email, hashed_password, role)
VALUES ('chaitanya', 'chaitu@gmail.com', '$2b$12$olckcmcCDSRY51ichN5R7upzunGq8WJ/MLNZrb2szacyrD3KFTfaW', 'TRAINER');

