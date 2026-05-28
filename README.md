# JS-Mentor: The Ultimate AI-Powered JavaScript LMS

JS-Mentor is a state-of-the-art, feature-rich Learning Management System (LMS) specifically engineered for mastering JavaScript. It merges interactive curriculum delivery with cutting-edge AI assistance, real-time mentorship tools, and machine-learning-driven student analytics to create a holistic learning ecosystem.

---

## Contents

- [Key Pillars of the Platform](#key-pillars-of-the-platform)
- [Technical Stack](#technical-stack)
- [Technical Deep Dives](#technical-deep-dives)
- [Database ER Diagram](#database-er-diagram)
- [Data Dictionary](#data-dictionary)
- [Getting Started](#getting-started)
- [Project Roadmap](#project-roadmap)
- [Contribution & Governance](#contribution--governance)

---

## Key Pillars of the Platform

### 1. AI-Driven Learning Experience
*   **Domain-Specialized AI Assistant**: A dedicated JavaScript mentor available 24/7, providing context-aware guidance without giving away direct answers.
*   **AI Error Explanation**: Integrated with the online compiler, this feature detects runtime failures and uses the Groq API to provide friendly, plain-language explanations of complex errors.
*   **Sequential AI Quizzes**: Intelligent assessment paths that adapt to student performance, ensuring foundational concepts are mastered before advancing.
*   **Smart Chatbot**: A persistent, sleek UI component for quick Q&A, featuring markdown support, code highlighting, and seamless redirection to deep-dive AI pages.

### 2. Real-time Mentorship & Collaboration
*   **1-on-1 Video & Screen Sharing**: Built on PeerJS, allowing trainers to initiate instant high-quality video calls and screen-sharing sessions directly within the browser.
*   **Unified Mentorship Chat**: A robust WebSocket-based messaging system (powered by RabbitMQ on the backend) for seamless student-trainer communication.
*   **Automated Scheduling Engine**: A sophisticated backend engine that manages doubt sessions using a **Saturation Strategy**. It prioritizes trainer efficiency and supports dynamic backfilling for resolved or cancelled slots.

### 3. Trainer Dashboard & Analytics
*   **Cohort Health Analytics**: Real-time visualization of student progress, completion rates, and engagement metrics across different learning paths.
*   **ML-Powered Risk Assessment**: Uses machine learning to predict "High-Risk" students based on their activity patterns, submission delays, and quiz scores.
*   **Grading Hub**: A centralized interface for trainers to review, grade, and provide feedback on coding exercises.

### 4. Advanced Content Management
*   **Visual Quiz Builder (XYFlow)**: A node-based, interactive builder for creating complex, branching assessment paths visually.
*   **Dynamic Learning Paths**: Support for atomic theory reading and exercise-based competency tracking.
*   **Media Manager**: Integrated Cloudinary support for ephemeral image uploads and self-cleaning media management. Supports both YouTube and local video tutorials.

---

## Technical Stack

### Frontend (The Experience)
- **Framework**: React.js
- **Authentication**: Clerk (Role-based: Student/Trainer/Institute)
- **State Management**: Context API with persistent local storage
- **Visualization**: XYFlow (Quiz Logic), Chart.js (Analytics)
- **Communication**: PeerJS (WebRTC), Socket.io-client
- **Styling**: Modern, responsive UI with custom CSS (Glassmorphism, Vibrant Accents, and Light/Dark Mode support)

### Backend (The Engine)
- **API Framework**: FastAPI (Python)
- **Database**: PostgreSQL (Production) / SQLite (Dev)
- **Scheduling**: Custom Python-based logic engine with FIFO and Saturation strategies
- **ML Engine**: Scikit-learn for student risk prediction models
- **Deployment**: Dockerized services for scalable delivery

---

## Technical Deep Dives

### Strict Progress Tracking Logic (Synced & Weighted)
The system evaluates page "Mastery" and strictly synchronizes it with the backend database to prevent bypassing of learning paths:
- **Theory Reading (30%)**: Tracked locally via `IntersectionObserver` as students consume content.
- **Exercise Mastery (70%)**: Calculated by the ratio of successfully completed coding challenges on the page.
- **Server-Synced Valuations**: Progress is further secured by logging **Video Completions** and verifying **Quiz Evals & Exercise Evals** directly against backend evaluations to generate a true `topicStatus`.
*This hybrid approach ensures students cannot "complete" a technical topic without hands-on verified practice.*

### Doubt Session Scheduling Logic

The JS-Mentor Doubt Scheduling Engine is designed to maximize trainer efficiency through a **Saturation & Dynamic Backfilling** strategy.

#### ── Business Rules ──

1.  **Availability**: No doubt sessions are scheduled on **Sundays**.
2.  **Trainer Shifts**: The active window is **10:00 AM – 4:00 PM** (6 hours/day).
3.  **Durations**:
    *   Learning Paths 1 & 2 → **30-minute** sessions.
    *   Learning Paths 3 – 6 → **60-minute** sessions.
4.  **Priority**: Doubts are processed **FIFO** (oldest request first).
5.  **Saturation Strategy**: The engine fills one trainer's schedule completely before assigning tasks to the next available trainer.
6.  **Dynamic Backfilling**: If a session is resolved early or a trainer goes online mid-day, the engine can "tap into" the current time to fill newly available gaps.

#### ── Algorithmic Flow ──

```mermaid
graph TD
    Start([Start Run]) --> IsSunday{Is it Sunday?}
    
    IsSunday -- Yes --> Reject[Reject & Stop]
    IsSunday -- No --> FetchData[Fetch OPEN Doubts & Available Trainers]
    
    FetchData --> LoopDoubt{For Each <br/> Pending Doubt}
    
    LoopDoubt -- Done --> Commit[Commit Changes & Return Report]
    
    LoopDoubt -- Next --> SortTrainers[Sort Trainers by Booked Minutes DESC <br/> 'Saturation Strategy']
    
    SortTrainers --> PickTrainer[For each Trainer in sorted list]
    
    PickTrainer --> CapacityCheck{Total Booked + New <br/> <= 360 mins?}
    
    CapacityCheck -- No --> NextTrainer[Try Next Trainer]
    
    CapacityCheck -- Yes --> FindSlot{Earliest Free Slot <br/> >= max 10AM, NOW}
    
    FindSlot -- No --> NextTrainer
    
    FindSlot -- Yes --> CreateSession[Create MentorshipSession <br/> Status = 'SCHEDULED']
    CreateSession --> UpdateDoubt[Link Doubt to Session <br/> Status = 'SCHEDULED']
    UpdateDoubt --> LoopDoubt

    NextTrainer --> LoopDoubt
```

#### ── Optimization Details ──

**1. Saturation Sorting**
Instead of spreading the load (Load Balancing), we sort trainers by their already booked minutes in **descending** order. This ensures that the engine tries to "top up" the trainer who is already working, keeping other trainers free unless necessary.

**2. Dynamic "Now" Floor**
When searching for an available slot (`_next_free_slot`), the engine uses `max(SESSION_START, CURRENT_TIME)`. This allows for **immediate scheduling** of new doubts into the current day's gaps, rather than waiting for the next day.

**3. Reactive Triggers**
The engine doesn't just run on a schedule. It is reactively triggered when:
*   A **Student** registers a new doubt.
*   A **Trainer** marks a session as resolved (freeing up their remaining time).

---

## Database ER Diagrams

To improve visibility, the database schema is divided into three core domains:

### 1. Core Profiles & Authentication

```mermaid
erDiagram
    users ||--o| students : "1 to 1"
    users ||--o| trainers : "1 to 1"
    trainers ||--o{ trainer_registration_codes : "1 to Many"

    users {
        int id PK
        varchar clerk_user_id
        varchar username
        varchar email
        enum role
    }
    students {
        int id PK
        int user_id FK
        varchar name
        varchar scholar_no
    }
    trainers {
        int id PK
        int user_id FK
        varchar name
        varchar specialization
    }
    trainer_registration_codes {
        varchar code PK
        boolean is_used
        int used_by_trainer_id FK
    }
```

### 2.1 Evaluation & Progress

```mermaid
erDiagram
    students ||--o{ student_progress : "1 to Many"
    students ||--o{ video_progress : "1 to Many"
    students ||--o{ exercise_evaluations : "1 to Many"
    trainers ||--o{ exercise_evaluations : "1 to Many"
    students ||--o{ quiz_evaluations : "1 to Many"

    student_progress {
        int id PK
        int student_id FK
        varchar topic_id
    }
    video_progress {
        int id PK
        int student_id FK
    }
    exercise_evaluations {
        int id PK
        int student_id FK
        int graded_by FK
    }
    quiz_evaluations {
        int id PK
        int student_id FK
    }
```

### 2.2 Curriculum & Risk Predictions

```mermaid
erDiagram
    students ||--o{ student_risk_predictions : "1 to Many"
    trainers ||--o{ curriculum_assignments : "1 to Many"
    students ||--o{ curriculum_assignments : "1 to Many"

    student_risk_predictions {
        int id PK
        int student_id FK
    }
    curriculum_assignments {
        int id PK
        int student_id FK
        int trainer_id FK
    }
```

### 3. Mentorship & Interaction

```mermaid
erDiagram
    trainers ||--o{ mentorship_sessions : "1 to Many"
    students ||--o{ mentorship_sessions : "1 to Many"
    students ||--o{ doubts : "1 to Many"
    trainers ||--o{ doubts : "1 to Many"
    mentorship_sessions ||--o{ doubts : "1 to Many"
    doubts ||--o{ doubt_replies : "1 to Many"
    users ||--o{ doubt_replies : "1 to Many"
    trainers ||--o{ media_tutorials : "1 to Many"

    mentorship_sessions {
        int id PK
        int trainer_id FK
        int student_id FK
    }
    doubts {
        int id PK
        int student_id FK
        int resolved_by FK
        int session_id FK
    }
    doubt_replies {
        int id PK
        int doubt_id FK
        int user_id FK
    }
    media_tutorials {
        int id PK
        int trainer_id FK
    }
```

---

## Data Dictionary

### Table Overviews

| Table Name | Description | Related Tables |
| :--- | :--- | :--- |
| **`users`** | Core authentication profiles mapping Clerk credentials to platform roles. | `students`, `trainers`, `doubt_replies` |
| **`students`** | Specific profiles for students containing academic details like scholar numbers. | `users`, `student_progress`, `exercise_evaluations`, `quiz_evaluations`, `student_risk_predictions`, `mentorship_sessions`, `doubts`, `curriculum_assignments`, `video_progress` |
| **`trainers`** | Specific profiles for trainers containing their specialized areas. | `users`, `trainer_registration_codes`, `exercise_evaluations`, `mentorship_sessions`, `doubts`, `curriculum_assignments`, `media_tutorials` |
| **`trainer_registration_codes`** | Pre-authorized codes used by trainers to register onto the platform. | `trainers` |
| **`student_progress`** | Tracks student progress and time spent across various learning paths/topics. | `students` |
| **`exercise_evaluations`** | Records student coding submissions, attempts, and grades provided by trainers. | `students`, `trainers` |
| **`quiz_evaluations`** | Logs student scores, attempts, and pass/fail statuses for visual quizzes. | `students` |
| **`student_risk_predictions`** | Stores machine-learning driven risk assessments and probability of student failure. | `students` |
| **`mentorship_sessions`** | Manages scheduled and active 1-on-1 sessions between trainers and students. | `trainers`, `students`, `doubts` |
| **`doubts`** | Represents individual queries or issues raised by students waiting for resolution. | `students`, `trainers`, `mentorship_sessions`, `doubt_replies` |
| **`doubt_replies`** | Chat messages and replies within a specific doubt thread. | `doubts`, `users` |
| **`curriculum_assignments`** | Links specific learning paths assigned to students by trainers with due dates. | `trainers`, `students` |
| **`media_tutorials`** | References external media tutorials (e.g., videos) uploaded or linked by trainers. | `trainers` |
| **`video_progress`** | Tracks the completion status and watched seconds for individual student video access. | `students` |

---

## Key User Workflows & Scenarios

### 1. Dual Authentication & Registration Flow
This flow details how students and trainers access the platform using completely distinct authentication strategies.

#### 1.1 Student Flow
```mermaid
flowchart TD
    S1[Student accesses platform] --> S2[Clerk Auth / Google OAuth]
    S2 --> S3[Clerk Webhook 'user.created']
    S3 --> S4[Backend syncs to users table]
    S4 --> S5[Student Dashboard Access]
```

#### 1.2 Trainer Flow
```mermaid
flowchart TD
    T1[Trainer accesses sign-up] --> T2{Registration Code Validation}
    T2 -- Invalid --> T3[Block Registration]
    T2 -- Valid Format --> T4[Custom Auth Backend API]
    T4 --> T5[Trainer Account Created]
    T5 --> T6[Trainer Login]
    T6 --> T7[Trainer Dashboard Access]
```

### 2. Doubt Lifecycle & Resolution
This scenario illustrates the journey of a student's doubt from registration to resolution.

```mermaid
sequenceDiagram
    actor S as Student
    participant C as Classifier (Hybrid: Fuzzy + LLM)
    participant E as Automated Scheduling Engine
    participant CH as Chat & WebRTC System
    actor T as Trainer

    S->>C: Registers Doubt (Topic & Description)
    C-->>E: Classifies Doubt (Priority & Topic Index)
    E->>E: Runs Saturation & Backfilling Strategy
    E-->>S: Assigns Session (Status: SCHEDULED)
    E-->>T: Adds Session to Trainer Dashboard
    S->>CH: Enters Mentorship Chat Room (Text & Images)
    T->>CH: Joins Mentorship Chat Room
    T->>CH: Initiates Video & Screen Share Call
    S->>CH: Joins Video Call for Live Debugging
    T->>E: Marks Doubt as Resolved
    E-->>S: Session Concluded & Progress Updated
```

### 3. Curriculum Mastery & Progress Tracking
This flow demonstrates how student progress is rigorously tracked and verified against the backend database.

```mermaid
flowchart TD
    A[Student accesses Topic] --> B[Theory Reading]
    B --> C{Intersection Observer}
    C -- 30% Weight --> D[Local Progress Updated]
    
    A --> E[Watch Video Tutorial]
    E --> F[Video Logged to Backend]
    
    A --> G[Solve Exercise]
    G --> H[Code Submission]
    H --> I{Grading by Trainer}
    
    A --> J[Take Sequential AI Quiz]
    J --> K[Auto-Evaluated & Logged to Backend]
    
    D --> L{Aggregation & Sync}
    F --> L
    I -- 70% Weight --> L
    K --> L
    
    L --> M[Progress Updated]
```

### 4. ML-Powered Risk Assessment & Intervention
This scenario outlines the proactive approach taken by the platform to identify and assist struggling students.

```mermaid
sequenceDiagram
    participant DB as System Database
    participant ML as ML Engine (Scikit-learn)
    participant Dashboard as Trainer Dashboard
    actor T as Trainer
    actor S as Student

    DB->>ML: Sends Cohort Activity, Submissions, Quiz Scores
    ML->>ML: Calculates Pass Probability & Risk Level
    ML-->>Dashboard: Flags High-Risk Students
    T->>Dashboard: Reviews Cohort Health Analytics
    T->>Dashboard: Selects High-Risk Student
    T->>S: Initiates Proactive Mentorship / Curriculum Assignment
```

### 5. Domain-Specialized AI Assistance
This flow demonstrates the strict domain boundaries enforced when a student interacts with the dedicated JS-Mentor AI.

```mermaid
sequenceDiagram
    actor S as Student
    participant UI as AI Page (Frontend)
    participant C as JS-Domain Checker
    participant B as AI Backend Wrapper (Groq API)

    S->>UI: Submits Query
    UI->>C: checkIfJavaScriptRelated(query)
    
    alt Is NOT JavaScript Related
        C-->>UI: Returns False
        UI-->>S: Displays strict boundary warning ("I can only help with JS...")
    else Is JavaScript Related
        C-->>UI: Returns True
        UI->>B: askDomainSpecicalizedAssistant(query)
        B-->>UI: Returns AI payload
        UI->>UI: Cleans & Renders via ReactMarkdown
        UI-->>S: Displays Formatted AI Response
    end
```

### 6. AI-Powered Error Explanation (Compiler)
This scenario outlines how the platform assists students when they encounter runtime errors during coding exercises.

```mermaid
sequenceDiagram
    actor S as Student
    participant EC as Exercise Compiler
    participant AI as AI Error Explainer (useCompilerAi)
    participant B as Backend AI Wrapper

    S->>EC: Runs Code with Error
    EC-->>S: Displays Error in Console Output
    S->>EC: Clicks "Explain Error"
    EC->>AI: Passes Code & Console Output
    AI->>B: POST /ai/js-mentor/explain-error
    B-->>AI: Returns Plain-Language Explanation
    AI-->>EC: Formats Markdown Response
    EC-->>S: Displays "Expert Feedback"
```

### 7. Anti-Cheat Proctoring Engine
This flow tracks browser visibility, window focus, and viewport layout ratios to prevent cheating via external windows, side panels, or developer tools.

```mermaid
flowchart TD
    A[Student starts Exercise] --> B{Action Taken}
    B -- Switch Tab --> C[visibilitychange Event Fired]
    B -- Lose Focus --> D[blur Event Fired]
    B -- Paste Code --> E[Keyboard/DOM Paste Blocked]
    B -- Open Sidebar/DevTools --> K[resize Event Fired & Ratios Violate Limits]
    
    C --> F[handleSecurityEvent Triggered]
    D --> F
    K --> F
    K --> J[Block Workspace & Show Blocker Overlay]
    
    F --> G{Warning Count > 3?}
    G -- No --> H[Show Security Warning Banner]
    G -- Yes --> I[Auto-Reject Submission & Close Compiler]
    
    J -- Close Sidebar/DevTools --> L[Unblock Workspace & Resume]
```

### 8. AI-Assisted Quiz Evaluation & Feedback
This flow breaks down the reactive, event-driven architecture behind the interactive quizzes, utilizing `MutationObserver` to intercept DOM changes and fetch contextual AI feedback.

```mermaid
sequenceDiagram
    actor S as Student
    participant Q as Quiz Component
    participant DOM as Hidden DOM Element
    participant MO as MutationObserver Hook
    participant B as Backend AI Wrapper

    S->>Q: Selects Quiz Answer Option
    Q->>Q: Auto-Evaluates Answer & Updates Local Score
    Q->>DOM: Injects Payload into 'data-quiz-result'
    DOM-->>MO: Triggers DOM Attribute Mutation Event
    MO->>B: POST /ai/js-mentor/quiz-feedback
    B-->>MO: Returns Contextual Markdown Explanation
    MO-->>Q: Updates Feedback State
    Q-->>S: Displays Expert Feedback & Unlocks "Next"
```

### 9. Video Tutorial Management & Rendering Flow
This section details how trainers publish video content and how the platform processes, stores, and presents these tutorials across the application with dynamic thumbnails. We've split this into two flows for clarity: Local Video Uploads (via Cloudinary) and YouTube Embeds.

#### 9A. Local Video Upload (Cloudinary) Flow

```mermaid
sequenceDiagram
    actor T as Trainer
    participant MM as MediaManager (Frontend)
    participant TS as Trainer Service
    participant B as Backend API
    participant C as Cloudinary (External)
    participant VC as VideoCarousel (Student View)

    T->>MM: Enters Title & Selects Path/Topic
    T->>MM: Selects Video File (MP4)
    MM->>TS: addVideo(FormData with File)
    TS->>B: POST /api/v1/curriculum/add-video
    B->>C: Uploads File to Cloudinary
    C-->>B: Returns Cloudinary URL
    B->>B: Saves Video Record in DB
    B-->>TS: Returns Success
    TS-->>MM: Updates Published Tutorials Gallery

    Note over MM,VC: Thumbnail Generation & Rendering
    
    MM->>MM: getVideoThumbnail(url)
    MM->>MM: Generates Thumbnail via Cloudinary Transformations (so_auto, c_scale, w_500)
    MM-->>T: Displays Video Card with Thumbnail & Play Overlay
    
    VC->>VC: Iterates Published Videos
    VC-->>Student: Renders inside native HTML5 <video> tag
```

#### 9B. YouTube Embed Flow

```mermaid
sequenceDiagram
    actor T as Trainer
    participant MM as MediaManager (Frontend)
    participant TS as Trainer Service
    participant B as Backend API
    participant VC as VideoCarousel (Student View)

    T->>MM: Enters Title & Selects Path/Topic
    T->>MM: Pastes YouTube Link
    MM->>MM: formatYouTubeUrl() converts to embed format
    MM->>TS: addVideo(FormData with embed URL)
    TS->>B: POST /api/v1/curriculum/add-video
    B->>B: Saves Video Record in DB
    B-->>TS: Returns Success
    TS-->>MM: Updates Published Tutorials Gallery

    Note over MM,VC: Thumbnail Generation & Rendering
    
    MM->>MM: getVideoThumbnail(url)
    MM->>MM: Extracts Video ID & Fetches img.youtube.com/.../mqdefault.jpg
    MM-->>T: Displays Video Card with Thumbnail & Play Overlay
    
    VC->>VC: Iterates Published Videos
    VC->>VC: getEmbedUrl() appends ?enablejsapi=1
    VC-->>Student: Renders inside <iframe>
```


## Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/suyash-rgb/JS-Mentor.git
cd JS-Mentor
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
REACT_APP_CLERK_PUBLISHABLE_KEY=your_clerk_key
REACT_APP_API_BASE_URL=http://localhost:8000
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

### 3. Start the Engines
- **Frontend**: `npm start`
- **Backend**: (Navigate to backend directory) `uvicorn app.main:app --reload`

---

## Project Roadmap 
- [x] **PeerJS Integration**: Real-time video/screen share refactor.
- [x] **Visual Quiz Visualizer**: XYFlow integration for curriculum management.
- [x] **ML Risk API**: Initial cohort status and predictive modeling.
- [x] **Cloudinary Integration**: Ephemeral image upload and self-cleaning system.
- [x] **WebSocket Signaling**: Robust real-time chat and session resolution.
- [ ] **Advanced Learning Path Inference**: Dynamic syllabus generation (In Progress).

---

## Contribution & Governance
We use a structured branching strategy:
- `main`: Production-ready, stable releases.
- `dev`: Active frontend development and integration.
- `backend`: Core API and microservices development.

For more details, refer to the inline documentation and code comments throughout the repository. For detailed API documentation, refer to the `SCHEDULER_LOGIC.md` and `trainer_dashboard_apis.md` files. Happy coding!

---
*Developed for the JavaScript Community.*
