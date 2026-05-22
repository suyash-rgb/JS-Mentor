# 🚀 JS-Mentor: The Ultimate AI-Powered JavaScript LMS

JS-Mentor is a state-of-the-art, feature-rich Learning Management System (LMS) specifically engineered for mastering JavaScript. It merges interactive curriculum delivery with cutting-edge AI assistance, real-time mentorship tools, and machine-learning-driven student analytics to create a holistic learning ecosystem.

---

## 🌟 Key Pillars of the Platform

### 🤖 1. AI-Driven Learning Experience
*   **Domain-Specialized AI Assistant**: A dedicated JavaScript mentor available 24/7, providing context-aware guidance without giving away direct answers.
*   **AI Error Explanation**: Integrated with the online compiler, this feature detects runtime failures and uses the Groq API to provide friendly, plain-language explanations of complex errors.
*   **Sequential AI Quizzes**: Intelligent assessment paths that adapt to student performance, ensuring foundational concepts are mastered before advancing.
*   **Smart Chatbot**: A persistent, sleek UI component for quick Q&A, featuring markdown support, code highlighting, and seamless redirection to deep-dive AI pages.

### 🎥 2. Real-time Mentorship & Collaboration
*   **1-on-1 Video & Screen Sharing**: Built on PeerJS, allowing trainers to initiate instant high-quality video calls and screen-sharing sessions directly within the browser.
*   **Unified Mentorship Chat**: A robust WebSocket-based messaging system (powered by RabbitMQ on the backend) for seamless student-trainer communication.
*   **Automated Scheduling Engine**: A sophisticated backend engine that manages doubt sessions using a **Saturation Strategy**. It prioritizes trainer efficiency and supports dynamic backfilling for resolved or cancelled slots.

### 📊 3. Trainer Dashboard & Analytics
*   **Cohort Health Analytics**: Real-time visualization of student progress, completion rates, and engagement metrics across different learning paths.
*   **ML-Powered Risk Assessment**: Uses machine learning to predict "High-Risk" students based on their activity patterns, submission delays, and quiz scores.
*   **Grading Hub**: A centralized interface for trainers to review, grade, and provide feedback on coding exercises.

### 🏗️ 4. Advanced Content Management
*   **Visual Quiz Builder (XYFlow)**: A node-based, interactive builder for creating complex, branching assessment paths visually.
*   **Dynamic Learning Paths**: Support for atomic theory reading and exercise-based competency tracking.
*   **Media Manager**: Integrated Cloudinary support for ephemeral image uploads and self-cleaning media management. Supports both YouTube and local video tutorials.

---

## 🛠️ Technical Stack

### **Frontend (The Experience)**
- **Framework**: React.js
- **Authentication**: Clerk (Role-based: Student/Trainer/Institute)
- **State Management**: Context API with persistent local storage
- **Visualization**: XYFlow (Quiz Logic), Chart.js (Analytics)
- **Communication**: PeerJS (WebRTC), Socket.io-client
- **Styling**: Modern, responsive UI with custom CSS (Glassmorphism, Vibrant Accents, and Light/Dark Mode support)

### **Backend (The Engine)**
- **API Framework**: FastAPI (Python)
- **Database**: PostgreSQL (Production) / SQLite (Dev)
- **Scheduling**: Custom Python-based logic engine with FIFO and Saturation strategies
- **ML Engine**: Scikit-learn for student risk prediction models
- **Deployment**: Dockerized services for scalable delivery

---

## 📈 Technical Deep Dives

### **Progress Tracking Logic (30/70 Weighting)**
The system evaluates page "Mastery" based on:
- **Theory Reading (30%)**: Tracked via `IntersectionObserver` as students consume content.
- **Exercise Mastery (70%)**: Calculated by the ratio of successfully completed coding challenges on the page.
*This ensures that students cannot "complete" a technical topic without hands-on practice.*

### **Doubt Scheduling Strategy**
The engine maximizes trainer utilization through:
- **FIFO Processing**: Oldest requests are handled first.
- **Saturation Sorting**: Fills one trainer's 6-hour daily shift completely before assigning to the next, keeping other trainers available for emergency calls.
- **Dynamic "Now" Floor**: Allows for immediate scheduling of doubts into current-day gaps.

---

## 🚀 Getting Started

### **1. Clone & Install**
```bash
git clone https://github.com/suyash-rgb/JS-Mentor.git
cd JS-Mentor
npm install
```

### **2. Environment Configuration**
Create a `.env` file in the root directory:
```env
REACT_APP_CLERK_PUBLISHABLE_KEY=your_clerk_key
REACT_APP_API_BASE_URL=http://localhost:8000
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

### **3. Start the Engines**
- **Frontend**: `npm start`
- **Backend**: (Navigate to backend directory) `uvicorn app.main:app --reload`

---

## 🗺️ Project Roadmap (Recent "Feat" Commits)
- [x] **PeerJS Integration**: Real-time video/screen share refactor.
- [x] **Visual Quiz Visualizer**: XYFlow integration for curriculum management.
- [x] **ML Risk API**: Initial cohort status and predictive modeling.
- [x] **Cloudinary Integration**: Ephemeral image upload and self-cleaning system.
- [x] **WebSocket Signaling**: Robust real-time chat and session resolution.
- [ ] **Advanced Learning Path Inference**: Dynamic syllabus generation (In Progress).

---

## 🤝 Contribution & Governance
We use a structured branching strategy:
- `main`: Production-ready, stable releases.
- `dev`: Active frontend development and integration.
- `backend`: Core API and microservices development.

For detailed API documentation, refer to the `SCHEDULER_LOGIC.md` and `trainer_dashboard_apis.md` files.

---
*Developed with ❤️ for the JavaScript Community.*
