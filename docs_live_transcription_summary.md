# Live Transcription & AI Class Summary System

This document outlines the zero-cost, low-latency architecture for live dialogue transcription, chunked AI summary generation via GPT OSS 20B, and student-editable notes persistence.

---

## 1. Live Dialogue Transcription Flow
Natively handles speech-to-text in the browser for unmuted trainers and students (when voice is granted), transmitting dialogue data in real time without audio-server overhead.

```mermaid
flowchart TD
    subgraph ClientSide ["Client-Side (Browser)"]
        A1["Trainer speaks (Mic Active)"] -->|Audio| B1["Trainer webkitSpeechRecognition"]
        A2["Student speaks (Mic Active & Voice Granted)"] -->|Audio| B2["Student webkitSpeechRecognition"]
        
        B1 -->|Plain Text + Speaker/Role| C["Socket.IO Event: live_transcript"]
        B2 -->|Plain Text + Speaker/Role| C
    end

    subgraph BackendServer ["Backend Server"]
        C -->|Relay event| D["Signaling Server (Socket.IO Room)"]
        D -->|Real-Time CC Broadcast| E["All Room Peer UI (Closed Captions)"]
        D -->|Append to Dialogue List| F["In-Memory/Temporary Class Transcript Log"]
    end
```

### Transcript Dialogue Format (JSON):
```json
{
  "id": 12,
  "speaker": "Rahul (Student)",
  "role": "student",
  "text": "Sir, why is the await keyword necessary here?",
  "timestamp": "16:22:18"
}
```

---

## 2. Chunked Summary Generation & Temporary Storage
Solves model token limit issues by chunking the transcript before processing, then saves the generated summary temporarily for 48 hours.

```mermaid
flowchart TD
    A["Lecture Ends"] --> B["Extract Dialogue Log from Session Cache"]
    B --> C{"Total Tokens > 3,000?"}
    
    C -->|Yes: Map-Reduce Chunking| D["Split into 15-Minute Windows"]
    D --> E["GPT OSS 20B: Summarize Chunks individually"]
    E --> F["GPT OSS 20B: Synthesize Final Markdown Summary"]
    
    C -->|No: Direct Processing| G["GPT OSS 20B: Generate Final Summary"]
    
    F --> H["Store in DB: class_summaries (expires_at = +48h)"]
    G --> H
    
    H --> I["Emit Global Socket.IO Notification to Cohort Students"]
    H --> J["Redirect Student to Notes tab on lecture exit"]
```

---

## 3. Student Persistence & Notes Editing Flow
Enables students to claim a temporary summary, copy it into their personal notes library, and edit it.

```mermaid
flowchart TD
    A["Student visits Notes Page / Receives Notification"] --> B["Show Banner: Temporary Live Notes Available"]
    B --> C["Student clicks 'Save & Customize Notes'"]
    
    C --> D["Backend copies class_summary to student_notes"]
    D --> E["Associate with Student ID and Learning Path ID"]
    
    E --> F["NotesViewerPage opens Student Note in Edit Mode"]
    F --> G["Student edits note (Markdown editor)"]
    G -->|Save| H["Update student_notes table (Permanent copy)"]
    
    subgraph DatabaseArchitecture ["Database Architecture"]
        I1["class_summaries (Temporary 2-day TTL)"]
        I2["curriculum_notes (Shared Trainer-authored course notes)"]
        I3["student_notes (Personal student copies - permanent/editable)"]
    end
```
