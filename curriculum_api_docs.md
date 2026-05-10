# Curriculum Manager API Documentation

This document describes the APIs added to support the Curriculum Manager on the Trainer Dashboard. All curriculum data is persisted in `data.json` to minimize database reads and keep the system lightweight.

## 1. Learning Path Management

### Create Learning Path
- **Endpoint:** `POST /curriculum/learning-paths`
- **Description:** Adds a new top-level learning path (card) to the curriculum.
- **Payload:**
  ```json
  {
    "heading": "Node.js Advanced",
    "content": "Deep dive into Node.js internals and streams."
  }
  ```

### Update Learning Path
- **Endpoint:** `PUT /curriculum/learning-paths/{heading}`
- **Description:** Updates the title or description of an existing learning path.
- **Payload:**
  ```json
  {
    "heading": "Node.js Mastery",
    "content": "Updated description for Node.js."
  }
  ```

---

## 2. Quiz Management
Quizzes are stored nested within specific lesson pages to maintain a linear learning experience.

### List All Quizzes
- **Endpoint:** `GET /curriculum/quizzes`
- **Description:** Deep-searches the curriculum and returns a flattened list of all quizzes, including their location (path and page).

### Add Quiz to Page
- **Endpoint:** `POST /curriculum/add-quiz`
- **Query Params:** `path_heading`, `page_text`
- **Description:** Creates a new quiz on a specific lesson page. Generates UUIDs for the quiz and all included questions.
- **Payload:**
  ```json
  {
    "title": "Module 1 Quiz",
    "questions": [
      {
        "text": "What is an Event Loop?",
        "options": ["A", "B", "C", "D"],
        "correct_answer": "B"
      }
    ]
  }
  ```

### Update Quiz
- **Endpoint:** `PUT /curriculum/quizzes/{quiz_id}`
- **Description:** Updates the title or question list of an existing quiz.

### Delete Quiz
- **Endpoint:** `DELETE /curriculum/quizzes/{quiz_id}`
- **Description:** Removes a quiz from its parent page.

---

## 3. Data Structure Rationale
- **Location:** `card.links[i].pageContent.quizzes`
- **Why:** 
  1. **Linear Progression:** Assessments are directly tied to the learning material they cover.
  2. **Consistency:** Matches the existing structure for coding `exercises`.
  3. **Efficiency:** Avoids database joins and additional lookups by keeping the entire module context in a single JSON read.
