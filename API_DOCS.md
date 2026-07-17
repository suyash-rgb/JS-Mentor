# JS Mentor Backend API Reference
Welcome to the JS Mentor API Documentation. This reference covers all endpoints exposed by our FastAPI backend. The API uses JSON payloads, standard URL/Query parameters, and HTTP response codes to indicate status and errors.

### 🔑 Authentication
Secure endpoints require OAuth2 Bearer tokens. To access them, log in via `/auth/login` to retrieve your access token, then include it in the `Authorization` header on secure calls:
```http
Authorization: Bearer <your_access_token>
```

---

## Table of Contents
- [AI Wrapper](#ai-wrapper)
  - [`POST` /ai/js-mentor/explain-error](#post-aijs-mentorexplain-error)
  - [`POST` /ai/js-mentor/domain-specialized-assistant](#post-aijs-mentordomain-specialized-assistant)
- [Assets](#assets)
  - [`POST` /assets/generate-signature](#post-assetsgenerate-signature)
  - [`DELETE` /assets/cleanup/{session_id}](#delete-assetscleanupsession-id)
- [Authentication](#authentication)
  - [`POST` /auth/register/trainer](#post-authregistertrainer)
  - [`POST` /auth/login](#post-authlogin)
  - [`POST` /auth/webhook/](#post-authwebhook)
- [Curriculum Management](#curriculum-management)
  - [`GET` /api/v1/curriculum/](#get-apiv1curriculum)
  - [`GET` /api/v1/curriculum/learning-path-topic-index-map](#get-apiv1curriculumlearning-path-topic-index-map)
  - [`GET` /api/v1/curriculum/learning-path-names](#get-apiv1curriculumlearning-path-names)
  - [`GET` /api/v1/curriculum/learning-path/{learning_path}/topics](#get-apiv1curriculumlearning-pathlearning-pathtopics)
  - [`GET` /api/v1/curriculum/learning-path/{learning_path}/videos](#get-apiv1curriculumlearning-pathlearning-pathvideos)
  - [`GET` /api/v1/curriculum/visualize](#get-apiv1curriculumvisualize)
  - [`GET` /api/v1/curriculum/exercises](#get-apiv1curriculumexercises)
  - [`GET` /api/v1/curriculum/quizzes](#get-apiv1curriculumquizzes)
  - [`POST` /api/v1/curriculum/learning-paths](#post-apiv1curriculumlearning-paths)
  - [`PUT` /api/v1/curriculum/learning-paths/{heading}](#put-apiv1curriculumlearning-pathsheading)
  - [`POST` /api/v1/curriculum/add-exercise](#post-apiv1curriculumadd-exercise)
  - [`POST` /api/v1/curriculum/learning-paths/add-exercises-batch](#post-apiv1curriculumlearning-pathsadd-exercises-batch)
  - [`PUT` /api/v1/curriculum/exercises/{ex_id}](#put-apiv1curriculumexercisesex-id)
  - [`DELETE` /api/v1/curriculum/learning-paths/delete-exercises/{ex_id}](#delete-apiv1curriculumlearning-pathsdelete-exercisesex-id)
  - [`GET` /api/v1/curriculum/videos](#get-apiv1curriculumvideos)
  - [`POST` /api/v1/curriculum/add-video](#post-apiv1curriculumadd-video)
  - [`PUT` /api/v1/curriculum/videos/{video_id}](#put-apiv1curriculumvideosvideo-id)
  - [`DELETE` /api/v1/curriculum/videos/{video_id}](#delete-apiv1curriculumvideosvideo-id)
  - [`POST` /api/v1/curriculum/add-quiz](#post-apiv1curriculumadd-quiz)
  - [`POST` /api/v1/curriculum/add-quiz-csv](#post-apiv1curriculumadd-quiz-csv)
  - [`PUT` /api/v1/curriculum/quizzes/{quiz_id}](#put-apiv1curriculumquizzesquiz-id)
  - [`DELETE` /api/v1/curriculum/quizzes/{quiz_id}](#delete-apiv1curriculumquizzesquiz-id)
- [General](#general)
  - [`GET` /](#get-)
- [Machine Learning](#machine-learning)
  - [`POST` /ml/predict_risk](#post-mlpredict-risk)
  - [`GET` /ml/high_risk_students](#get-mlhigh-risk-students)
- [Scheduling Engine](#scheduling-engine)
  - [`POST` /api/v1/schedule/doubts/register](#post-apiv1scheduledoubtsregister)
  - [`GET` /api/v1/schedule/queue](#get-apiv1schedulequeue)
  - [`GET` /api/v1/schedule/trainer/my-sessions](#get-apiv1scheduletrainermy-sessions)
- [Student Features](#student-features)
  - [`POST` /api/v1/student/progress](#post-apiv1studentprogress)
  - [`POST` /api/v1/student/exercise](#post-apiv1studentexercise)
  - [`POST` /api/v1/student/quiz](#post-apiv1studentquiz)
  - [`GET` /api/v1/student/doubts/mine](#get-apiv1studentdoubtsmine)
  - [`POST` /api/v1/student/video](#post-apiv1studentvideo)
  - [`GET` /api/v1/student/topic-status/{topic_id}](#get-apiv1studenttopic-statustopic-id)
- [Trainer Tools](#trainer-tools)
  - [`GET` /api/v1/trainer/me/dashboard-overview](#get-apiv1trainermedashboard-overview)
  - [`GET` /api/v1/trainer/grading/submissions](#get-apiv1trainergradingsubmissions)
  - [`PUT` /api/v1/trainer/grading/submissions/{submission_id}/grade](#put-apiv1trainergradingsubmissionssubmission-idgrade)
  - [`GET` /api/v1/trainer/cohort-stats](#get-apiv1trainercohort-stats)
  - [`PUT` /api/v1/trainer/sessions/{session_id}/resolve](#put-apiv1trainersessionssession-idresolve)
  - [`PUT` /api/v1/trainer/me/availability](#put-apiv1trainermeavailability)

---

## AI Wrapper
---

### <a id="post-aijs-mentorexplain-error"></a>`POST` /ai/js-mentor/explain-error
**Explain Error**

#### Quick Overview
- **Summary**: Send an execution error along with your JavaScript snippet to the AI Tutor for a beginner-friendly explanation.
- **Request**: Your source code snippet and the runtime error message.
- **Response**: AI-generated insights explaining what the error means and suggestions on how to fix it.

#### Request Body Content
Content Type: `application/json`

- **`code`** (`string`, Required)
- **`error_message`** (`string`, Required)

<details>
<summary><b>🛠️ View Developer Request & Response Examples</b></summary>

##### Mock curl Request
```bash
curl -X POST "http://localhost:8000/ai/js-mentor/explain-error" \
     -H "Content-Type: application/json" \
     -d '{
  "code": "setTimeout(() => console.log(1), 0);\\nPromise.resolve().then(() => console.log(2));",
  "error_message": "Uncaught TypeError: Cannot read properties of undefined (reading 'map')"
}'
```

##### Expected Response (HTTP 200)
```json
{
  "response": "The error occurs because you are calling the 'map' method on a variable that is undefined. Make sure the variable is initialized as an array before calling 'map'. Here is the corrected code..."
}
```

</details>

---

### <a id="post-aijs-mentordomain-specialized-assistant"></a>`POST` /ai/js-mentor/domain-specialized-assistant
**Consult Ai**

API endpoint for AI consultation - delegates to service layer

#### Quick Overview
- **Summary**: Consult the specialized AI Mentor for guidance on general JavaScript concepts.
- **Request**: A text query representing your question.
- **Response**: Tutor response guiding you through the concepts.

#### Request Body Content
Content Type: `application/json`

- **`input_text`** (`string`, Required)

<details>
<summary><b>🛠️ View Developer Request & Response Examples</b></summary>

##### Mock curl Request
```bash
curl -X POST "http://localhost:8000/ai/js-mentor/domain-specialized-assistant" \
     -H "Content-Type: application/json" \
     -d '{
  "input_text": "How does the macro-task queue differ from micro-task queue in JavaScript?"
}'
```

##### Expected Response (HTTP 200)
```json
{
  "response": "The event loop is a mechanism that allows JavaScript to perform non-blocking I/O operations despite being single-threaded. Micro-tasks (like Promise callbacks) have higher priority than macro-tasks (like setTimeout) and are executed at the end of each task."
}
```

</details>

---

## Assets
---

### <a id="post-assetsgenerate-signature"></a>`POST` /assets/generate-signature
**Generate a Cloudinary signed upload signature**

Generate a signature for Cloudinary direct uploads.
Delegates business logic to the asset service.

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Summary**: Get a secure cryptographic signature allowing direct upload from the client application to Cloudinary storage.
- **Request**: A query parameter `folder` specifying the destination path.
- **Response**: Cloudinary API keys, signature, and timestamp.

#### Request Parameters
| Name | Located In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `folder` | `query` | `string` | Yes | - |

<details>
<summary><b>🛠️ View Developer Request & Response Examples</b></summary>

##### Mock curl Request
```bash
curl -X POST "http://localhost:8000/assets/generate-signature?folder=avatar_uploads" \
     -H "Authorization: Bearer <your_access_token>"
```

##### Expected Response (HTTP 200)
```json
{
  "timestamp": 1779998454,
  "signature": "abcdef1234567890abcdef...",
  "cloud_name": "jsmentor-cloud",
  "api_key": "123456789012345",
  "folder": "js-mentor/sessions/205"
}
```

</details>

---

### <a id="delete-assetscleanupsession-id"></a>`DELETE` /assets/cleanup/{session_id}
**Manually trigger cleanup of session assets**

Hook to clean up a specific session's Cloudinary folder.
This can also be triggered directly from the trainer dashboard when a doubt is resolved.

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Summary**: Trigger a cleanup process to delete uploaded media assets related to a resolved session.
- **Request**: The session ID in the URL path.
- **Response**: Confirmation of successful asset deletion.

#### Request Parameters
| Name | Located In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `session_id` | `path` | `integer` | Yes | - |

<details>
<summary><b>🛠️ View Developer Request & Response Examples</b></summary>

##### Mock curl Request
```bash
curl -X DELETE "http://localhost:8000/assets/cleanup/205" \
     -H "Authorization: Bearer <your_access_token>"
```

##### Expected Response (HTTP 200)
```json
{
  "message": "Cleanup for js-mentor/sessions/205 started in background"
}
```

</details>

---

## Authentication
---

### <a id="post-authregistertrainer"></a>`POST` /auth/register/trainer
**Register Trainer**

#### Quick Overview
- **Summary**: Create a new trainer profile so you can log in, access the trainer tools, claim sessions, and grade student work.
- **Request**: A JSON payload containing name, email, password, and the required registration code (e.g. `TRAIN_MENTOR_2026`).
- **Response**: A confirmation that the trainer profile has been registered (HTTP 201).

#### Request Body Content
Content Type: `application/json`

- **`name`** (`string`, Required)
- **`email`** (`string`, Required)
- **`password`** (`string`, Required)
- **`specialization`** (`string`, Optional)
- **`registration_code`** (`string`, Required)

<details>
<summary><b>🛠️ View Developer Request & Response Examples</b></summary>

##### Mock curl Request
```bash
curl -X POST "http://localhost:8000/auth/register/trainer" \
     -H "Content-Type: application/json" \
     -d '{
  "name": "Jane Doe",
  "email": "jane.trainer@jsmentor.com",
  "password": "secure_password123",
  "specialization": "Asynchronous JS & Event Loop",
  "registration_code": "TRAIN_MENTOR_2026"
}'
```

##### Expected Response (HTTP 201)
```json
{
  "message": "Trainer registration successful."
}
```

</details>

---

### <a id="post-authlogin"></a>`POST` /auth/login
**Login**

#### Quick Overview
- **Summary**: Log in using username (email) and password credentials to get a JSON Web Token (JWT) needed to authenticate other secure operations.
- **Request**: Your username (email address) and password.
- **Response**: An access token, token type (bearer), and user role (e.g., trainer or student) used to make subsequent authorized requests.

#### Request Body Content
Content Type: `application/json`

- **`username`** (`string`, Required)
- **`password`** (`string`, Required)

<details>
<summary><b>🛠️ View Developer Request & Response Examples</b></summary>

##### Mock curl Request
```bash
curl -X POST "http://localhost:8000/auth/login" \
     -H "Content-Type: application/json" \
     -d '{
  "username": "jane.trainer",
  "password": "secure_password123"
}'
```

##### Expected Response (HTTP 200)
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5OSIsInJvbGUiOiJ0cmFpbmVyIn0.xxxx",
  "token_type": "bearer",
  "role": "trainer"
}
```

</details>

---

### <a id="post-authwebhook"></a>`POST` /auth/webhook/
**Webhook Handler**

#### Quick Overview
- **Summary**: Receive event notifications from external authentication platforms (e.g., Clerk webhook triggers).
- **Request**: Clerk webhook event headers and metadata.
- **Response**: Empty successful response indicating receipt (HTTP 204).

<details>
<summary><b>🛠️ View Developer Request & Response Examples</b></summary>

##### Mock curl Request
```bash
curl -X POST "http://localhost:8000/auth/webhook/"
```

##### Expected Response (HTTP 204)
```json
(Empty response payload)
```

</details>

---

## Curriculum Management
---

### <a id="get-apiv1curriculum"></a>`GET` /api/v1/curriculum/
**Get full curriculum**

#### Quick Overview
- **Summary**: Download the entire hierarchical curriculum structured by learning paths, topics, pages, videos, and exercises.
- **Request**: Nothing.
- **Response**: The complete curriculum tree configuration JSON.

<details>
<summary><b>🛠️ View Developer Request & Response Examples</b></summary>

##### Mock curl Request
```bash
curl -X GET "http://localhost:8000/api/v1/curriculum/"
```

##### Expected Response (HTTP 200)
```json
{
  "cards": [
    {
      "heading": "JavaScript Fundamentals",
      "content": "A comprehensive module covering variables, scope, closures, array methods...",
      "links": [
        {
          "text": "1. Scopes & Closures",
          "url": "closures-fundamentals",
          "pageContent": {
            "videos": [
              {
                "title": "Closures Deep Dive",
                "url": "https://www.youtube.com/watch?v=F3EsDdBm_a0"
              }
            ],
            "exercises": [
              {
                "id": "ex_arr_map",
                "title": "Implement custom map",
                "description": "Create a custom Array.prototype.map implementation...",
                "difficulty": "MEDIUM",
                "tags": [
                  "arrays",
                  "closures"
                ]
              }
            ],
            "quizzes": [
              {
                "id": "qz_closures",
                "title": "Closures Quiz",
                "questions": [
                  {
                    "id": "q1",
                    "text": "What is a closure?",
                    "options": [
                      "A function bundled with its lexical environment",
                      "A closed database connection"
                    ],
                    "correct_answer": "A function bundled with its lexical environment"
                  }
                ]
              }
            ]
          }
        }
      ]
    }
  ]
}
```

</details>

---

### <a id="get-apiv1curriculumslug-mapping"></a>`GET` /api/v1/curriculum/slug-mapping
**Get mapping of URL slugs to path indices**

Returns a map of { slug: 1-indexed-position } for all learning paths.

#### Quick Overview
- **Summary**: Get a map translating learning path URL slugs to their index position in the learning path sequence.
- **Request**: Nothing.
- **Response**: A key-value map like `{'fundamentals': 1, 'js-core': 2}`.

<details>
<summary><b>🛠️ View Developer Request & Response Examples</b></summary>

##### Mock curl Request
```bash
curl -X GET "http://localhost:8000/api/v1/curriculum/slug-mapping"
```

##### Expected Response (HTTP 200)
```json
{
  "fundamentals": 1,
  "js-core": 2,
  "frontend": 3,
  "node-js": 4,
  "architecture": 5,
  "trends": 6
}
```

</details>

---

### <a id="get-apiv1curriculumlearning-path-names"></a>`GET` /api/v1/curriculum/learning-path-names
**Get Learning Path Names**

Returns only the names of the learning paths for sidebar navigation.

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Summary**: Retrieve a list of just the names of the learning paths to build navigation sidebars.
- **Request**: Nothing.
- **Response**: An array of learning path name strings.

<details>
<summary><b>🛠️ View Developer Request & Response Examples</b></summary>

##### Mock curl Request
```bash
curl -X GET "http://localhost:8000/api/v1/curriculum/learning-path-names" \
     -H "Authorization: Bearer <your_access_token>"
```

##### Expected Response (HTTP 200)
```json
[
  "string"
]
```

</details>

---

### <a id="get-apiv1curriculumlearning-pathlearning-pathtopics"></a>`GET` /api/v1/curriculum/learning-path/{learning_path}/topics
**Get Topics For Learning Path**

Returns the list of topic texts for a specific learning path.

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Summary**: Get all topic keys or headings associated with a specific learning path.
- **Request**: The learning path name/slug in the URL path.
- **Response**: A list of topic strings.

#### Request Parameters
| Name | Located In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `learning_path` | `path` | `string` | Yes | - |

<details>
<summary><b>🛠️ View Developer Request & Response Examples</b></summary>

##### Mock curl Request
```bash
curl -X GET "http://localhost:8000/api/v1/curriculum/learning-path/123/topics" \
     -H "Authorization: Bearer <your_access_token>"
```

##### Expected Response (HTTP 200)
```json
[
  "string"
]
```

</details>

---

### <a id="get-apiv1curriculumlearning-pathlearning-pathvideos"></a>`GET` /api/v1/curriculum/learning-path/{learning_path}/videos
**Get Videos For Learning Path**

Returns the list of videos for a specific learning path.

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Summary**: Get all video configurations (titles, URLs) defined inside a specific learning path.
- **Request**: The learning path name/slug in the URL path.
- **Response**: A list of video objects.

#### Request Parameters
| Name | Located In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `learning_path` | `path` | `string` | Yes | - |

<details>
<summary><b>🛠️ View Developer Request & Response Examples</b></summary>

##### Mock curl Request
```bash
curl -X GET "http://localhost:8000/api/v1/curriculum/learning-path/123/videos" \
     -H "Authorization: Bearer <your_access_token>"
```

##### Expected Response (HTTP 200)
```json
[
  {}
]
```

</details>

---

### <a id="get-apiv1curriculumvisualize"></a>`GET` /api/v1/curriculum/visualize
**Visualize Paths**

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Summary**: Get a simplified structural overview mapping all learning paths and their child pages for visualization.
- **Request**: Nothing.
- **Response**: A list of paths and nested page details.

<details>
<summary><b>🛠️ View Developer Request & Response Examples</b></summary>

##### Mock curl Request
```bash
curl -X GET "http://localhost:8000/api/v1/curriculum/visualize" \
     -H "Authorization: Bearer <your_access_token>"
```

##### Expected Response (HTTP 200)
```json
[
  {
    "heading": "JavaScript Fundamentals",
    "pages": [
      {
        "text": "string",
        "titles": [
          "string"
        ],
        "exercises": [
          {}
        ]
      }
    ]
  }
]
```

</details>

---

### <a id="get-apiv1curriculumexercises"></a>`GET` /api/v1/curriculum/exercises
**List Exercises**

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Summary**: Retrieve curriculum exercises, optionally filtered by learning path heading.
- **Request**: An optional query parameter `path_heading`.
- **Response**: A list of exercises.

#### Request Parameters
| Name | Located In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `path_heading` | `query` | `string` | No | - |

<details>
<summary><b>🛠️ View Developer Request & Response Examples</b></summary>

##### Mock curl Request
```bash
curl -X GET "http://localhost:8000/api/v1/curriculum/exercises" \
     -H "Authorization: Bearer <your_access_token>"
```

##### Expected Response (HTTP 200)
```json
[
  {
    "id": "ex_arr_map",
    "title": "Implement Custom Array.map",
    "description": "Create a custom Array.prototype.map implementation...",
    "difficulty": "MEDIUM",
    "tags": [
      "arrays",
      "closures"
    ]
  }
]
```

</details>

---

### <a id="get-apiv1curriculumquizzes"></a>`GET` /api/v1/curriculum/quizzes
**List Quizzes**

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Summary**: Retrieve curriculum quizzes, optionally filtered by learning path heading.
- **Request**: An optional query parameter `path_heading`.
- **Response**: A list of quizzes.

#### Request Parameters
| Name | Located In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `path_heading` | `query` | `string` | No | - |

<details>
<summary><b>🛠️ View Developer Request & Response Examples</b></summary>

##### Mock curl Request
```bash
curl -X GET "http://localhost:8000/api/v1/curriculum/quizzes" \
     -H "Authorization: Bearer <your_access_token>"
```

##### Expected Response (HTTP 200)
```json
[
  {
    "id": "qz_closures",
    "title": "Closures Quiz",
    "questions": [
      {
        "id": "q1",
        "text": "What is a closure?",
        "options": [
          "A function bundled with its lexical environment",
          "A closed database connection"
        ],
        "correct_answer": "A function bundled with its lexical environment"
      }
    ]
  }
]
```

</details>

---

### <a id="post-apiv1curriculumlearning-paths"></a>`POST` /api/v1/curriculum/learning-paths
**Create Learning Path**

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Summary**: Create a new learning path category in the curriculum.
- **Request**: A JSON payload containing the heading, content description, and optional initial link array.
- **Response**: A success message.

#### Request Body Content
Content Type: `application/json`

- **`heading`** (`string`, Required)
- **`content`** (`string`, Required)
- **`links`** (`array`, Optional)
  - Items Schema: (`object`)
    - **`text`** (`string`, Required)
    - **`url`** (`string`, Required)
    - **`pageContent`** (`object`, Optional)

<details>
<summary><b>🛠️ View Developer Request & Response Examples</b></summary>

##### Mock curl Request
```bash
curl -X POST "http://localhost:8000/api/v1/curriculum/learning-paths" \
     -H "Authorization: Bearer <your_access_token>" \
     -H "Content-Type: application/json" \
     -d '{
  "heading": "JavaScript Fundamentals",
  "content": "A comprehensive module covering variables, scope, closures, array methods, and basic DOM manipulation.",
  "links": [
    {
      "text": "string",
      "url": "https://res.cloudinary.com/jsmentor/video/upload/v1234/vid_closures.mp4",
      "pageContent": {}
    }
  ]
}'
```

##### Expected Response (HTTP 201)
```json
{
  "message": "Learning path 'JavaScript Fundamentals' created successfully."
}
```

</details>

---

### <a id="put-apiv1curriculumlearning-pathsheading"></a>`PUT` /api/v1/curriculum/learning-paths/{heading}
**Update Learning Path**

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Summary**: Update metadata (heading, content) of an existing learning path.
- **Request**: The heading in the URL path, and updated learning path JSON properties.
- **Response**: A success confirmation message.

#### Request Parameters
| Name | Located In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `heading` | `path` | `string` | Yes | - |

#### Request Body Content
Content Type: `application/json`

- **`heading`** (`string`, Optional)
- **`content`** (`string`, Optional)
- **`links`** (`array`, Optional)
  - Items Schema: (`object`)
    - **`text`** (`string`, Required)
    - **`url`** (`string`, Required)
    - **`pageContent`** (`object`, Optional)

<details>
<summary><b>🛠️ View Developer Request & Response Examples</b></summary>

##### Mock curl Request
```bash
curl -X PUT "http://localhost:8000/api/v1/curriculum/learning-paths/JavaScript Fundamentals" \
     -H "Authorization: Bearer <your_access_token>" \
     -H "Content-Type: application/json" \
     -d '{
  "heading": "JavaScript Fundamentals",
  "content": "A comprehensive module covering variables, scope, closures, array methods, and basic DOM manipulation.",
  "links": [
    {
      "text": "string",
      "url": "https://res.cloudinary.com/jsmentor/video/upload/v1234/vid_closures.mp4",
      "pageContent": {}
    }
  ]
}'
```

##### Expected Response (HTTP 200)
```json
{
  "message": "Learning path updated successfully."
}
```

</details>

---

### <a id="post-apiv1curriculumadd-exercise"></a>`POST` /api/v1/curriculum/add-exercise
**Add Exercise**

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Summary**: Append a new exercise definition to a specific curriculum page.
- **Request**: Query parameters `path_heading` and `page_text`, along with the new exercise schema in the request body.
- **Response**: A confirmation success message.

#### Request Parameters
| Name | Located In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `path_heading` | `query` | `string` | Yes | - |
| `page_text` | `query` | `string` | Yes | - |

#### Request Body Content
Content Type: `application/json`

- **`id`** (`string`, Required)
- **`title`** (`string`, Required)
- **`description`** (`string`, Required)
- **`difficulty`** (`string`, Required)
- **`tags`** (`array`, Required)
  - Items Schema: (`string`)

<details>
<summary><b>🛠️ View Developer Request & Response Examples</b></summary>

##### Mock curl Request
```bash
curl -X POST "http://localhost:8000/api/v1/curriculum/add-exercise?path_heading=test_value&page_text=test_value" \
     -H "Authorization: Bearer <your_access_token>" \
     -H "Content-Type: application/json" \
     -d '{
  "id": "string",
  "title": "Event Loop Explained",
  "description": "I am having trouble understanding how variable lexical scoping works inside nested function loops.",
  "difficulty": "string",
  "tags": [
    "string"
  ]
}'
```

##### Expected Response (HTTP 201)
```json
{
  "message": "Successfully added 'Implement Custom Array.map' to closures-fundamentals"
}
```

</details>

---

### <a id="post-apiv1curriculumlearning-pathsadd-exercises-batch"></a>`POST` /api/v1/curriculum/learning-paths/add-exercises-batch
**Inject Exercises Batch**

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Summary**: Inject a batch of exercises to a curriculum page at once.
- **Request**: Query parameters `path_heading` and `page_text`, along with an array of exercise schemas in the request body.
- **Response**: A success confirmation message.

#### Request Parameters
| Name | Located In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `path_heading` | `query` | `string` | Yes | - |
| `page_text` | `query` | `string` | Yes | - |

#### Request Body Content
Content Type: `application/json`

<details>
<summary><b>🛠️ View Developer Request & Response Examples</b></summary>

##### Mock curl Request
```bash
curl -X POST "http://localhost:8000/api/v1/curriculum/learning-paths/add-exercises-batch?path_heading=test_value&page_text=test_value" \
     -H "Authorization: Bearer <your_access_token>" \
     -H "Content-Type: application/json" \
     -d '[
  {
    "id": "string",
    "title": "Event Loop Explained",
    "description": "I am having trouble understanding how variable lexical scoping works inside nested function loops.",
    "difficulty": "string",
    "tags": [
      "string"
    ]
  }
]'
```

##### Expected Response (HTTP 201)
```json
{
  "message": "Successfully injected 5 exercises into closures-fundamentals"
}
```

</details>

---

### <a id="put-apiv1curriculumexercisesex-id"></a>`PUT` /api/v1/curriculum/exercises/{ex_id}
**Update Existing Exercise**

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Summary**: Update details (title, description, difficulty, tags) of an existing exercise.
- **Request**: The exercise ID in the URL path, and fields to update in the request body.
- **Response**: A success confirmation message.

#### Request Parameters
| Name | Located In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `ex_id` | `path` | `string` | Yes | - |

#### Request Body Content
Content Type: `application/json`

- **`title`** (`string`, Optional)
- **`description`** (`string`, Optional)
- **`difficulty`** (`string`, Optional)
- **`tags`** (`array`, Optional)
  - Items Schema: (`string`)

<details>
<summary><b>🛠️ View Developer Request & Response Examples</b></summary>

##### Mock curl Request
```bash
curl -X PUT "http://localhost:8000/api/v1/curriculum/exercises/ex_arr_map" \
     -H "Authorization: Bearer <your_access_token>" \
     -H "Content-Type: application/json" \
     -d '{
  "title": "Event Loop Explained",
  "description": "I am having trouble understanding how variable lexical scoping works inside nested function loops.",
  "difficulty": "string",
  "tags": [
    "string"
  ]
}'
```

##### Expected Response (HTTP 200)
```json
{
  "message": "Exercise 'ex_arr_map' updated successfully."
}
```

</details>

---

### <a id="delete-apiv1curriculumlearning-pathsdelete-exercisesex-id"></a>`DELETE` /api/v1/curriculum/learning-paths/delete-exercises/{ex_id}
**Delete Exercise**

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Summary**: Remove an exercise from curriculum data.
- **Request**: The exercise ID in the URL path.
- **Response**: A success confirmation message.

#### Request Parameters
| Name | Located In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `ex_id` | `path` | `string` | Yes | - |

<details>
<summary><b>🛠️ View Developer Request & Response Examples</b></summary>

##### Mock curl Request
```bash
curl -X DELETE "http://localhost:8000/api/v1/curriculum/learning-paths/delete-exercises/ex_arr_map" \
     -H "Authorization: Bearer <your_access_token>"
```

##### Expected Response (HTTP 200)
```json
{
  "message": "Exercise 'ex_arr_map' deleted successfully."
}
```

</details>

---

### <a id="get-apiv1curriculumvideos"></a>`GET` /api/v1/curriculum/videos
**List Videos**

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Summary**: List all video entities defined in the curriculum.
- **Request**: An optional query parameter `path_heading`.
- **Response**: A list of video configurations.

#### Request Parameters
| Name | Located In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `path_heading` | `query` | `string` | No | - |

<details>
<summary><b>🛠️ View Developer Request & Response Examples</b></summary>

##### Mock curl Request
```bash
curl -X GET "http://localhost:8000/api/v1/curriculum/videos" \
     -H "Authorization: Bearer <your_access_token>"
```

##### Expected Response (HTTP 200)
```json
[
  {
    "video_id": "vid_evt_loop",
    "title": "Event Loop Explained",
    "url": "https://res.cloudinary.com/jsmentor/video/upload/v1234/vid_closures.mp4"
  }
]
```

</details>

---

### <a id="post-apiv1curriculumadd-video"></a>`POST` /api/v1/curriculum/add-video
**Add Video**

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Summary**: Upload a new video file or specify a URL, adding it to a specific page.
- **Request**: Query parameters `path_heading` and `page_text`, along with Form data containing title, optional URL, or binary file.
- **Response**: A success confirmation message.

#### Request Parameters
| Name | Located In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `path_heading` | `query` | `string` | Yes | - |
| `page_text` | `query` | `string` | Yes | - |

#### Request Body Content
Content Type: `multipart/form-data`

- **`title`** (`string`, Required)
- **`url`** (`string`, Optional)
- **`file`** (`string`, Optional)

<details>
<summary><b>🛠️ View Developer Request & Response Examples</b></summary>

##### Mock curl Request
```bash
curl -X POST "http://localhost:8000/api/v1/curriculum/add-video?path_heading=test_value&page_text=test_value" \
     -H "Authorization: Bearer <your_access_token>" \
     -F title="Event Loop Explained" \
     -F url="https://res.cloudinary.com/jsmentor/video/upload/v1234/vid_closures.mp4" \
     -F file=@/path/to/local/file
```

##### Expected Response (HTTP 201)
```json
{
  "message": "Successfully added video 'Event Loop Explained' to closures-fundamentals"
}
```

</details>

---

### <a id="put-apiv1curriculumvideosvideo-id"></a>`PUT` /api/v1/curriculum/videos/{video_id}
**Update Existing Video**

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Summary**: Update video details or replace its uploaded file.
- **Request**: The video ID in the URL path, and form data fields to update.
- **Response**: A success confirmation message.

#### Request Parameters
| Name | Located In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `video_id` | `path` | `string` | Yes | - |

#### Request Body Content
Content Type: `multipart/form-data`

- **`title`** (`string`, Optional)
- **`url`** (`string`, Optional)
- **`file`** (`string`, Optional)

<details>
<summary><b>🛠️ View Developer Request & Response Examples</b></summary>

##### Mock curl Request
```bash
curl -X PUT "http://localhost:8000/api/v1/curriculum/videos/vid_evt_loop" \
     -H "Authorization: Bearer <your_access_token>" \
     -F title="Event Loop Explained" \
     -F url="https://res.cloudinary.com/jsmentor/video/upload/v1234/vid_closures.mp4" \
     -F file=@/path/to/local/file
```

##### Expected Response (HTTP 200)
```json
{
  "message": "Video 'vid_evt_loop' updated successfully."
}
```

</details>

---

### <a id="delete-apiv1curriculumvideosvideo-id"></a>`DELETE` /api/v1/curriculum/videos/{video_id}
**Delete Video**

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Summary**: Remove a video from curriculum data.
- **Request**: The video ID in the URL path.
- **Response**: A success confirmation message.

#### Request Parameters
| Name | Located In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `video_id` | `path` | `string` | Yes | - |

<details>
<summary><b>🛠️ View Developer Request & Response Examples</b></summary>

##### Mock curl Request
```bash
curl -X DELETE "http://localhost:8000/api/v1/curriculum/videos/vid_evt_loop" \
     -H "Authorization: Bearer <your_access_token>"
```

##### Expected Response (HTTP 200)
```json
{
  "message": "Video 'vid_evt_loop' deleted successfully."
}
```

</details>

---

### <a id="post-apiv1curriculumadd-quiz"></a>`POST` /api/v1/curriculum/add-quiz
**Add Quiz**

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Summary**: Add a structured quiz page with questions, options, and correct answers.
- **Request**: Query parameters `path_heading` and `page_text`, along with the quiz schema in the body.
- **Response**: A success confirmation message.

#### Request Parameters
| Name | Located In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `path_heading` | `query` | `string` | Yes | - |
| `page_text` | `query` | `string` | Yes | - |

#### Request Body Content
Content Type: `application/json`

- **`title`** (`string`, Required)
- **`questions`** (`array`, Optional)
  - Items Schema: (`object`)
    - **`id`** (`string`, Required)
    - **`text`** (`string`, Required)
    - **`options`** (`array`, Required)
      - Items Schema: (`string`)
    - **`correct_answer`** (`string`, Required)

<details>
<summary><b>🛠️ View Developer Request & Response Examples</b></summary>

##### Mock curl Request
```bash
curl -X POST "http://localhost:8000/api/v1/curriculum/add-quiz?path_heading=test_value&page_text=test_value" \
     -H "Authorization: Bearer <your_access_token>" \
     -H "Content-Type: application/json" \
     -d '{
  "title": "Event Loop Explained",
  "questions": [
    {
      "id": "string",
      "text": "string",
      "options": [
        "string"
      ],
      "correct_answer": "string"
    }
  ]
}'
```

##### Expected Response (HTTP 201)
```json
{
  "message": "Successfully added 'Event Loop Quiz' to closures-fundamentals"
}
```

</details>

---

### <a id="post-apiv1curriculumadd-quiz-csv"></a>`POST` /api/v1/curriculum/add-quiz-csv
**Add Quiz Csv**

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Summary**: Parse a CSV file to add a quiz to a page.
- **Request**: Query parameters `path_heading` and `page_text`, along with form fields for title and the CSV file.
- **Response**: A success confirmation message.

#### Request Parameters
| Name | Located In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `path_heading` | `query` | `string` | Yes | - |
| `page_text` | `query` | `string` | Yes | - |

#### Request Body Content
Content Type: `multipart/form-data`

- **`title`** (`string`, Required)
- **`file`** (`string`, Required)

<details>
<summary><b>🛠️ View Developer Request & Response Examples</b></summary>

##### Mock curl Request
```bash
curl -X POST "http://localhost:8000/api/v1/curriculum/add-quiz-csv?path_heading=test_value&page_text=test_value" \
     -H "Authorization: Bearer <your_access_token>" \
     -F title="Event Loop Explained" \
     -F file=@/path/to/local/file
```

##### Expected Response (HTTP 201)
```json
{
  "message": "Successfully imported quiz 'Closures Quiz' from CSV"
}
```

</details>

---

### <a id="put-apiv1curriculumquizzesquiz-id"></a>`PUT` /api/v1/curriculum/quizzes/{quiz_id}
**Update Quiz**

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Summary**: Update an existing quiz's title or list of questions.
- **Request**: The quiz ID in the URL path, and updated quiz fields in the body.
- **Response**: A success confirmation message.

#### Request Parameters
| Name | Located In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `quiz_id` | `path` | `string` | Yes | - |

#### Request Body Content
Content Type: `application/json`

- **`title`** (`string`, Optional)
- **`questions`** (`array`, Optional)
  - Items Schema: (`object`)
    - **`id`** (`string`, Required)
    - **`text`** (`string`, Required)
    - **`options`** (`array`, Required)
      - Items Schema: (`string`)
    - **`correct_answer`** (`string`, Required)

<details>
<summary><b>🛠️ View Developer Request & Response Examples</b></summary>

##### Mock curl Request
```bash
curl -X PUT "http://localhost:8000/api/v1/curriculum/quizzes/qz_closures" \
     -H "Authorization: Bearer <your_access_token>" \
     -H "Content-Type: application/json" \
     -d '{
  "title": "Event Loop Explained",
  "questions": [
    {
      "id": "string",
      "text": "string",
      "options": [
        "string"
      ],
      "correct_answer": "string"
    }
  ]
}'
```

##### Expected Response (HTTP 200)
```json
{
  "message": "Quiz 'qz_closures' updated successfully."
}
```

</details>

---

### <a id="delete-apiv1curriculumquizzesquiz-id"></a>`DELETE` /api/v1/curriculum/quizzes/{quiz_id}
**Delete Quiz**

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Summary**: Remove a quiz from curriculum data.
- **Request**: The quiz ID in the URL path.
- **Response**: A success confirmation message.

#### Request Parameters
| Name | Located In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `quiz_id` | `path` | `string` | Yes | - |

<details>
<summary><b>🛠️ View Developer Request & Response Examples</b></summary>

##### Mock curl Request
```bash
curl -X DELETE "http://localhost:8000/api/v1/curriculum/quizzes/qz_closures" \
     -H "Authorization: Bearer <your_access_token>"
```

##### Expected Response (HTTP 200)
```json
{
  "message": "Quiz 'qz_closures' deleted successfully."
}
```

</details>

---

## General
---

### <a id="get-"></a>`GET` /
**Read Root**

#### Quick Overview
- **Summary**: Ping-like health check on the root API route.
- **Request**: Nothing.
- **Response**: Root API response (e.g. status code 200).

<details>
<summary><b>🛠️ View Developer Request & Response Examples</b></summary>

##### Mock curl Request
```bash
curl -X GET "http://localhost:8000/"
```

##### Expected Response (HTTP 200)
```json
{
  "status": "healthy"
}
```

</details>

---

## Machine Learning
---

### <a id="post-mlpredict-risk"></a>`POST` /ml/predict_risk
**Predict Risk**

Predicts risk for raw data provided in the request body.

#### Quick Overview
- **Summary**: Feed raw student engagement metrics into the ML model to predict if they are at risk of falling behind.
- **Request**: Student metrics including watch progress status, time spent, exercise attempts, correctness ratio, and quiz score.
- **Response**: A risk score and categorization (e.g. HIGH risk or LOW risk).

#### Request Body Content
Content Type: `application/json`

- **`progress_status`** (`string`, Required)
- **`time_spent_seconds`** (`integer`, Required)
- **`avg_exercise_attempts`** (`number`, Required)
- **`avg_exercise_execution_time_ms`** (`integer`, Required)
- **`exercise_is_correct_ratio`** (`number`, Required)
- **`quiz_score`** (`number`, Required)
- **`quiz_attempt_number`** (`integer`, Required)

<details>
<summary><b>🛠️ View Developer Request & Response Examples</b></summary>

##### Mock curl Request
```bash
curl -X POST "http://localhost:8000/ml/predict_risk" \
     -H "Content-Type: application/json" \
     -d '{
  "progress_status": "string",
  "time_spent_seconds": 1800,
  "avg_exercise_attempts": 1.0,
  "avg_exercise_execution_time_ms": 1,
  "exercise_is_correct_ratio": 1.0,
  "quiz_score": 1.0,
  "quiz_attempt_number": 1
}'
```

##### Expected Response (HTTP 200)
```json
{
  "risk_level": "HIGH",
  "probabilities": {
    "LOW": 0.12,
    "HIGH": 0.88
  }
}
```

</details>

---

### <a id="get-mlhigh-risk-students"></a>`GET` /ml/high_risk_students
**Get All High Risk**

Fetches all students, calculates their real-time metrics 
from the DB, and returns only those flagged as HIGH risk.

#### Quick Overview
- **Summary**: Query the machine learning subsystem to fetch all students currently classified as HIGH risk based on their live database metrics.
- **Request**: Nothing.
- **Response**: A list of students flagged as high risk, complete with calculated engagement metrics.

<details>
<summary><b>🛠️ View Developer Request & Response Examples</b></summary>

##### Mock curl Request
```bash
curl -X GET "http://localhost:8000/ml/high_risk_students"
```

##### Expected Response (HTTP 200)
```json
[
  {
    "student_id": 15,
    "name": "John Student",
    "risk_details": {
      "risk_level": "HIGH",
      "probabilities": {
        "LOW": 0.12,
        "HIGH": 0.88
      }
    }
  }
]
```

</details>

---

## Scheduling Engine
---

### <a id="post-apiv1scheduledoubtsregister"></a>`POST` /api/v1/schedule/doubts/register
**Student registers a new doubt for session scheduling**

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Summary**: Register a new doubt. This queues the request and automatically starts matching an online trainer to schedule a live call.
- **Request**: Doubt topic, problem description, learning path index, and an optional Cloudinary folder for screenshots.
- **Response**: The registered doubt ID, match status, and details.

#### Request Body Content
Content Type: `application/json`

- **`topic`** (`string`, Required) - Short title of the doubt (e.g. 'Closures not working')
- **`description`** (`string`, Required) - Detailed description of the problem
- **`learning_path_index`** (`integer`, Optional)
- **`cloudinary_folder`** (`string`, Optional)

<details>
<summary><b>🛠️ View Developer Request & Response Examples</b></summary>

##### Mock curl Request
```bash
curl -X POST "http://localhost:8000/api/v1/schedule/doubts/register" \
     -H "Authorization: Bearer <your_access_token>" \
     -H "Content-Type: application/json" \
     -d '{
  "topic": "Closures and Scope",
  "description": "I am having trouble understanding how variable lexical scoping works inside nested function loops.",
  "learning_path_index": 1,
  "cloudinary_folder": "doubts/session_102"
}'
```

##### Expected Response (HTTP 201)
```json
{
  "doubt_id": 102,
  "topic": "Closures and Scope",
  "duration_minutes": 45,
  "message": "Doubt registered successfully. Trainer match in progress.",
  "status": "OPEN"
}
```

</details>

---

### <a id="get-apiv1schedulequeue"></a>`GET` /api/v1/schedule/queue
**Trainer views all unscheduled (OPEN) doubts in the queue**

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Summary**: Fetch the list of unscheduled student doubt requests currently waiting in the queue.
- **Request**: Nothing (requires Trainer Auth token).
- **Response**: A list of open doubts awaiting scheduling.

<details>
<summary><b>🛠️ View Developer Request & Response Examples</b></summary>

##### Mock curl Request
```bash
curl -X GET "http://localhost:8000/api/v1/schedule/queue" \
     -H "Authorization: Bearer <your_access_token>"
```

##### Expected Response (HTTP 200)
```json
[
  {
    "doubt_id": 102,
    "student_id": 15,
    "student_name": "John Student",
    "topic": "Closures and Scope",
    "description": "I am having trouble understanding variable lexical scoping inside nested function loops.",
    "learning_path_index": 1,
    "status": "OPEN",
    "created_at": "2026-05-30T10:15:00Z"
  }
]
```

</details>

---

### <a id="get-apiv1scheduletrainermy-sessions"></a>`GET` /api/v1/schedule/trainer/my-sessions
**Trainer views their scheduled doubt sessions**

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Summary**: Retrieve the trainer's scheduled video call session slots.
- **Request**: An optional `target_date` query parameter (format: YYYY-MM-DD).
- **Response**: A list of session slots including student name, scheduled time, and session length.

#### Request Parameters
| Name | Located In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `target_date` | `query` | `string` | No | - |

<details>
<summary><b>🛠️ View Developer Request & Response Examples</b></summary>

##### Mock curl Request
```bash
curl -X GET "http://localhost:8000/api/v1/schedule/trainer/my-sessions" \
     -H "Authorization: Bearer <your_access_token>"
```

##### Expected Response (HTTP 200)
```json
[
  {
    "session_id": 205,
    "student_name": "John Student",
    "topic": "Closures and Scope",
    "scheduled_for": "2026-05-31T14:30:00Z",
    "duration_minutes": 45,
    "status": "OPEN"
  }
]
```

</details>

---

## Student Features
---

### <a id="post-apiv1studentprogress"></a>`POST` /api/v1/student/progress
**Log student learning progress**

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Summary**: Log progress metrics as a student interacts with a curriculum page.
- **Request**: Topic ID, current status (e.g. COMPLETED or IN_PROGRESS), and time spent on the page (seconds).
- **Response**: Successful log confirmation.

#### Request Body Content
Content Type: `application/json`

- **`topic_id`** (`string`, Required)
- **`status`** (`string`, Required)
- **`time_spent_seconds`** (`integer`, Required)

<details>
<summary><b>🛠️ View Developer Request & Response Examples</b></summary>

##### Mock curl Request
```bash
curl -X POST "http://localhost:8000/api/v1/student/progress" \
     -H "Authorization: Bearer <your_access_token>" \
     -H "Content-Type: application/json" \
     -d '{
  "topic_id": "closures-fundamentals",
  "status": "OPEN",
  "time_spent_seconds": 1800
}'
```

##### Expected Response (HTTP 200)
```json
{
  "message": "Progress logged successfully"
}
```

</details>

---

### <a id="post-apiv1studentexercise"></a>`POST` /api/v1/student/exercise
**Log exercise submission**

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Summary**: Log a student's attempt to solve an exercise, recording the code they submitted and whether it passed the automated tests.
- **Request**: Exercise ID, raw JavaScript code, correctness boolean, and execution time (ms).
- **Response**: Successful submission confirmation.

#### Request Body Content
Content Type: `application/json`

- **`exercise_id`** (`string`, Required)
- **`code_submitted`** (`string`, Required)
- **`is_correct`** (`boolean`, Required)
- **`execution_time_ms`** (`integer`, Required)

<details>
<summary><b>🛠️ View Developer Request & Response Examples</b></summary>

##### Mock curl Request
```bash
curl -X POST "http://localhost:8000/api/v1/student/exercise" \
     -H "Authorization: Bearer <your_access_token>" \
     -H "Content-Type: application/json" \
     -d '{
  "exercise_id": "string",
  "code_submitted": "function map(arr, fn) {\\n  const res = [];\\n  for(let i=0; i<arr.length; i++) {\\n    res.push(fn(arr[i], i, arr));\\n  }\\n  return res;\\n}",
  "is_correct": true,
  "execution_time_ms": 12
}'
```

##### Expected Response (HTTP 200)
```json
{
  "message": "Exercise submission logged successfully"
}
```

</details>

---

### <a id="post-apiv1studentquiz"></a>`POST` /api/v1/student/quiz
**Log quiz performance**

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Summary**: Log the student's performance score on a curriculum quiz.
- **Request**: Quiz ID, score, and total questions in the quiz.
- **Response**: Successful quiz log confirmation.

#### Request Body Content
Content Type: `application/json`

- **`quiz_id`** (`string`, Required)
- **`score`** (`number`, Required)
- **`total_questions`** (`integer`, Required)

<details>
<summary><b>🛠️ View Developer Request & Response Examples</b></summary>

##### Mock curl Request
```bash
curl -X POST "http://localhost:8000/api/v1/student/quiz" \
     -H "Authorization: Bearer <your_access_token>" \
     -H "Content-Type: application/json" \
     -d '{
  "quiz_id": "qz_closures",
  "score": 92.5,
  "total_questions": 10
}'
```

##### Expected Response (HTTP 200)
```json
{
  "message": "Quiz performance logged successfully"
}
```

</details>

---

### <a id="get-apiv1studentdoubtsmine"></a>`GET` /api/v1/student/doubts/mine
**Student views all their doubt requests and session status**

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Summary**: Fetch all live and past doubt assistance requests submitted by the currently logged-in student.
- **Request**: Nothing (requires Student Auth token).
- **Response**: A list of doubts, including scheduling timestamps, trainer details, and video call link statuses.

<details>
<summary><b>🛠️ View Developer Request & Response Examples</b></summary>

##### Mock curl Request
```bash
curl -X GET "http://localhost:8000/api/v1/student/doubts/mine" \
     -H "Authorization: Bearer <your_access_token>"
```

##### Expected Response (HTTP 200)
```json
[
  {
    "doubt_id": 102,
    "topic": "Closures and Scope",
    "description": "I am having trouble understanding how variable lexical scoping works inside nested function loops.",
    "learning_path_index": 1,
    "status": "OPEN",
    "created_at": "2026-05-30T10:22:29Z",
    "scheduled_for": "2026-05-31T14:30:00Z",
    "trainer_name": "Alex Mentor",
    "duration_minutes": 45,
    "session_id": 205
  }
]
```

</details>

---

### <a id="post-apiv1studentvideo"></a>`POST` /api/v1/student/video
**Log video completion progress**

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Summary**: Record progress tracking metrics for an instructional video (e.g. when finished playing or watched for a duration).
- **Request**: Topic ID, video URL, completion status (true/false), and seconds watched.
- **Response**: Successful log confirmation.

#### Request Body Content
Content Type: `application/json`

- **`topic_id`** (`string`, Required)
- **`video_url`** (`string`, Required)
- **`is_completed`** (`boolean`, Required)
- **`watched_seconds`** (`integer`, Required)

<details>
<summary><b>🛠️ View Developer Request & Response Examples</b></summary>

##### Mock curl Request
```bash
curl -X POST "http://localhost:8000/api/v1/student/video" \
     -H "Authorization: Bearer <your_access_token>" \
     -H "Content-Type: application/json" \
     -d '{
  "topic_id": "closures-fundamentals",
  "video_url": "https://www.youtube.com/watch?v=F3EsDdBm_a0",
  "is_completed": true,
  "watched_seconds": 320
}'
```

##### Expected Response (HTTP 200)
```json
{
  "message": "Video progress logged"
}
```

</details>

---

### <a id="get-apiv1studenttopic-statustopic-id"></a>`GET` /api/v1/student/topic-status/{topic_id}
**Get completion status of topic components**

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Summary**: Verify which curriculum components (videos, coding exercises) the student has completed within a given topic.
- **Request**: The topic ID in the URL path (requires Student Auth token).
- **Response**: An object detailing completion status (true/false) for all video links and exercises.

#### Request Parameters
| Name | Located In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `topic_id` | `path` | `string` | Yes | - |

<details>
<summary><b>🛠️ View Developer Request & Response Examples</b></summary>

##### Mock curl Request
```bash
curl -X GET "http://localhost:8000/api/v1/student/topic-status/closures-fundamentals" \
     -H "Authorization: Bearer <your_access_token>"
```

##### Expected Response (HTTP 200)
```json
{
  "videos": {
    "https://www.youtube.com/watch?v=F3EsDdBm_a0": true
  },
  "quizzes": {
    "qz_closures": true
  },
  "exercises": {
    "ex_arr_map": true
  }
}
```

</details>

---

## Trainer Tools
---

### <a id="get-apiv1trainermedashboard-overview"></a>`GET` /api/v1/trainer/me/dashboard-overview
**Get Dashboard Overview**

Provides aggregated data for the Trainer Dashboard overview.
Currently returns structured mock data until full DB tables are implemented for Doubts and Mentorships.

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Summary**: Obtain an overview of statistics, active debug sessions, and recent exercise submissions awaiting grading.
- **Request**: Nothing in the request body (requires a valid Trainer Auth token).
- **Response**: Aggregated stats (active students, pending reviews, new doubts), active doubts sessions, and recent student submissions.

<details>
<summary><b>🛠️ View Developer Request & Response Examples</b></summary>

##### Mock curl Request
```bash
curl -X GET "http://localhost:8000/api/v1/trainer/me/dashboard-overview" \
     -H "Authorization: Bearer <your_access_token>"
```

##### Expected Response (HTTP 200)
```json
{
  "trainer_name": "Alex Mentor",
  "is_available": true,
  "stats": {
    "active_students": 24,
    "pending_reviews": 5,
    "new_doubts": 3,
    "average_score_percentage": 84.6
  },
  "recent_submissions": [
    {
      "submission_id": "sub_991",
      "exercise_title": "Implement Custom Array.map",
      "student_id": 15,
      "student_name": "John Student",
      "status": "OPEN",
      "submitted_at": "2026-05-30T10:15:00Z"
    }
  ],
  "active_sessions": [
    {
      "session_id": 205,
      "topic": "Closures and Scope",
      "time_remaining_minutes": 1,
      "student_name": "John Student",
      "status": "OPEN"
    }
  ]
}
```

</details>

---

### <a id="get-apiv1trainergradingsubmissions"></a>`GET` /api/v1/trainer/grading/submissions
**Get Grading Submissions**

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Summary**: Retrieve all student exercise submissions, including both pending submissions that need grading and historically graded ones.
- **Request**: Nothing in the request body (requires a valid Trainer Auth token).
- **Response**: An array of detailed submission items, listing the student's name, submitted code, status, and grading details.

<details>
<summary><b>🛠️ View Developer Request & Response Examples</b></summary>

##### Mock curl Request
```bash
curl -X GET "http://localhost:8000/api/v1/trainer/grading/submissions" \
     -H "Authorization: Bearer <your_access_token>"
```

##### Expected Response (HTTP 200)
```json
[
  {
    "id": 1,
    "student_id": 15,
    "student_name": "John Student",
    "exercise_id": "string",
    "exercise_title": "Implement Custom Array.map",
    "exercise_question": "string",
    "status": "OPEN",
    "submitted_at": "2026-05-30T10:15:00Z",
    "code_submitted": "function map(arr, fn) {\\n  const res = [];\\n  for(let i=0; i<arr.length; i++) {\\n    res.push(fn(arr[i], i, arr));\\n  }\\n  return res;\\n}",
    "grade": 1.0,
    "feedback": "Excellent implementation of closure scopes. Very clean code!"
  }
]
```

</details>

---

### <a id="put-apiv1trainergradingsubmissionssubmission-idgrade"></a>`PUT` /api/v1/trainer/grading/submissions/{submission_id}/grade
**Grade Submission**

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Summary**: Grade a student's submission by providing a score and specific, constructive feedback.
- **Request**: The submission ID in the URL path, plus a score (0 to 100) and feedback string in the request body.
- **Response**: Successful response confirmation (HTTP 200).

#### Request Parameters
| Name | Located In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `submission_id` | `path` | `integer` | Yes | - |

#### Request Body Content
Content Type: `application/json`

- **`score`** (`number`, Required)
- **`feedback`** (`string`, Required)

<details>
<summary><b>🛠️ View Developer Request & Response Examples</b></summary>

##### Mock curl Request
```bash
curl -X PUT "http://localhost:8000/api/v1/trainer/grading/submissions/sub_991/grade" \
     -H "Authorization: Bearer <your_access_token>" \
     -H "Content-Type: application/json" \
     -d '{
  "score": 92.5,
  "feedback": "Excellent implementation of closure scopes. Very clean code!"
}'
```

##### Expected Response (HTTP 200)
```json
{
  "message": "Submission graded successfully."
}
```

</details>

---

### <a id="get-apiv1trainercohort-stats"></a>`GET` /api/v1/trainer/cohort-stats
**Get Cohort Stats**

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Summary**: Access broad statistical data for the active student cohort.
- **Request**: Nothing in the request body (requires Trainer Auth token).
- **Response**: Cohort-wide stats summary.

<details>
<summary><b>🛠️ View Developer Request & Response Examples</b></summary>

##### Mock curl Request
```bash
curl -X GET "http://localhost:8000/api/v1/trainer/cohort-stats" \
     -H "Authorization: Bearer <your_access_token>"
```

##### Expected Response (HTTP 200)
```json
{
  "total_students": 120,
  "average_progress": 0.45,
  "active_last_24h": 42,
  "risk_distribution": {
    "LOW": 105,
    "HIGH": 15
  }
}
```

</details>

---

### <a id="put-apiv1trainersessionssession-idresolve"></a>`PUT` /api/v1/trainer/sessions/{session_id}/resolve
**Trainer marks a session as resolved**

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Summary**: Mark a scheduled doubt-resolution session as resolved once the call has finished.
- **Request**: The session ID in the URL path (requires Trainer Auth token).
- **Response**: Successful response confirmation (HTTP 200).

#### Request Parameters
| Name | Located In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `session_id` | `path` | `integer` | Yes | - |

<details>
<summary><b>🛠️ View Developer Request & Response Examples</b></summary>

##### Mock curl Request
```bash
curl -X PUT "http://localhost:8000/api/v1/trainer/sessions/205/resolve" \
     -H "Authorization: Bearer <your_access_token>"
```

##### Expected Response (HTTP 200)
```json
{
  "message": "Session resolved successfully."
}
```

</details>

---

### <a id="put-apiv1trainermeavailability"></a>`PUT` /api/v1/trainer/me/availability
**Trainer toggles their online/offline status**

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Summary**: Toggle the trainer's status between online (available to match with student doubts) and offline.
- **Request**: A boolean query parameter `is_available` (e.g., `true` or `false`).
- **Response**: Successful response confirmation (HTTP 200).

#### Request Parameters
| Name | Located In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `is_available` | `query` | `boolean` | Yes | - |

<details>
<summary><b>🛠️ View Developer Request & Response Examples</b></summary>

##### Mock curl Request
```bash
curl -X PUT "http://localhost:8000/api/v1/trainer/me/availability?is_available=True" \
     -H "Authorization: Bearer <your_access_token>"
```

##### Expected Response (HTTP 200)
```json
{
  "message": "Trainer availability updated successfully."
}
```

</details>

---
