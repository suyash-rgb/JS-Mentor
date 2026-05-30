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
  - [`GET` /api/v1/curriculum/slug-mapping](#get-apiv1curriculumslug-mapping)
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
- **Purpose**: Send an execution error along with your JavaScript snippet to the AI Tutor for a beginner-friendly explanation.
- 📤 **You Send**: Your source code snippet and the runtime error message.
- 📥 **You Receive**: AI-generated insights explaining what the error means and suggestions on how to fix it.

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
(Empty response payload)
```

##### Expected Validation Error Response (HTTP 422)
```json
{
  "detail": [
    {
      "loc": [
        "body",
        "email"
      ],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

</details>

---

### <a id="post-aijs-mentordomain-specialized-assistant"></a>`POST` /ai/js-mentor/domain-specialized-assistant
**Consult Ai**

API endpoint for AI consultation - delegates to service layer

#### Quick Overview
- **Purpose**: Consult the specialized AI Mentor for guidance on general JavaScript concepts.
- 📤 **You Send**: A text query representing your question.
- 📥 **You Receive**: Tutor response guiding you through the concepts.

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
(Empty response payload)
```

##### Expected Validation Error Response (HTTP 422)
```json
{
  "detail": [
    {
      "loc": [
        "body",
        "email"
      ],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
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
- **Purpose**: Get a secure cryptographic signature allowing direct upload from the client application to Cloudinary storage.
- 📤 **You Send**: A query parameter `folder` specifying the destination path.
- 📥 **You Receive**: Cloudinary API keys, signature, and timestamp.

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
(Empty response payload)
```

##### Expected Validation Error Response (HTTP 422)
```json
{
  "detail": [
    {
      "loc": [
        "body",
        "query"
      ],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
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
- **Purpose**: Trigger a cleanup process to delete uploaded media assets related to a resolved session.
- 📤 **You Send**: The session ID in the URL path.
- 📥 **You Receive**: Confirmation of successful asset deletion.

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
(Empty response payload)
```

##### Expected Validation Error Response (HTTP 422)
```json
{
  "detail": [
    {
      "loc": [
        "body",
        "query"
      ],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

</details>

---

## Authentication
---

### <a id="post-authregistertrainer"></a>`POST` /auth/register/trainer
**Register Trainer**

#### Quick Overview
- **Purpose**: Create a new trainer profile so you can log in, access the trainer tools, claim sessions, and grade student work.
- 📤 **You Send**: A JSON payload containing name, email, password, and the required registration code (e.g. `TRAIN_MENTOR_2026`).
- 📥 **You Receive**: A confirmation that the trainer profile has been registered (HTTP 201).

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
(Empty response payload)
```

##### Expected Validation Error Response (HTTP 422)
```json
{
  "detail": [
    {
      "loc": [
        "body",
        "email"
      ],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

</details>

---

### <a id="post-authlogin"></a>`POST` /auth/login
**Login**

#### Quick Overview
- **Purpose**: Log in using username (email) and password credentials to get a JSON Web Token (JWT) needed to authenticate other secure operations.
- 📤 **You Send**: Your username (email address) and password.
- 📥 **You Receive**: An access token, token type (bearer), and user role (e.g., trainer or student) used to make subsequent authorized requests.

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

##### Expected Validation Error Response (HTTP 422)
```json
{
  "detail": [
    {
      "loc": [
        "body",
        "email"
      ],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

</details>

---

### <a id="post-authwebhook"></a>`POST` /auth/webhook/
**Webhook Handler**

#### Quick Overview
- **Purpose**: Receive event notifications from external authentication platforms (e.g., Clerk webhook triggers).
- 📤 **You Send**: Clerk webhook event headers and metadata.
- 📥 **You Receive**: Empty successful response indicating receipt (HTTP 204).

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
- **Purpose**: Download the entire hierarchical curriculum structured by learning paths, topics, pages, videos, and exercises.
- 📤 **You Send**: Nothing.
- 📥 **You Receive**: The complete curriculum tree configuration JSON.

<details>
<summary><b>🛠️ View Developer Request & Response Examples</b></summary>

##### Mock curl Request
```bash
curl -X GET "http://localhost:8000/api/v1/curriculum/"
```

##### Expected Response (HTTP 200)
```json
(Empty response payload)
```

</details>

---

### <a id="get-apiv1curriculumslug-mapping"></a>`GET` /api/v1/curriculum/slug-mapping
**Get mapping of URL slugs to path indices**

Returns a map of { slug: 1-indexed-position } for all learning paths.

#### Quick Overview
- **Purpose**: Get a map translating learning path URL slugs to their index position in the learning path sequence.
- 📤 **You Send**: Nothing.
- 📥 **You Receive**: A key-value map like `{'fundamentals': 1, 'js-core': 2}`.

<details>
<summary><b>🛠️ View Developer Request & Response Examples</b></summary>

##### Mock curl Request
```bash
curl -X GET "http://localhost:8000/api/v1/curriculum/slug-mapping"
```

##### Expected Response (HTTP 200)
```json
(Empty response payload)
```

</details>

---

### <a id="get-apiv1curriculumlearning-path-names"></a>`GET` /api/v1/curriculum/learning-path-names
**Get Learning Path Names**

Returns only the names of the learning paths for sidebar navigation.

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Purpose**: Retrieve a list of just the names of the learning paths to build navigation sidebars.
- 📤 **You Send**: Nothing.
- 📥 **You Receive**: An array of learning path name strings.

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
- **Purpose**: Interacts with the curriculum management module at `/api/v1/curriculum/learning-path/{learning_path}/topics`.
- 📤 **You Send**: Request parameters or payload depending on route.
- 📥 **You Receive**: Successful response indicator or resource object.

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

##### Expected Validation Error Response (HTTP 422)
```json
{
  "detail": [
    {
      "loc": [
        "body",
        "query"
      ],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

</details>

---

### <a id="get-apiv1curriculumlearning-pathlearning-pathvideos"></a>`GET` /api/v1/curriculum/learning-path/{learning_path}/videos
**Get Videos For Learning Path**

Returns the list of videos for a specific learning path.

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Purpose**: Interacts with the curriculum management module at `/api/v1/curriculum/learning-path/{learning_path}/videos`.
- 📤 **You Send**: Request parameters or payload depending on route.
- 📥 **You Receive**: Successful response indicator or resource object.

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

##### Expected Validation Error Response (HTTP 422)
```json
{
  "detail": [
    {
      "loc": [
        "body",
        "query"
      ],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

</details>

---

### <a id="get-apiv1curriculumvisualize"></a>`GET` /api/v1/curriculum/visualize
**Visualize Paths**

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Purpose**: Interacts with the curriculum management module at `/api/v1/curriculum/visualize`.
- 📤 **You Send**: Request parameters or payload depending on route.
- 📥 **You Receive**: Successful response indicator or resource object.

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
- **Purpose**: Interacts with the curriculum management module at `/api/v1/curriculum/exercises`.
- 📤 **You Send**: Request parameters or payload depending on route.
- 📥 **You Receive**: Successful response indicator or resource object.

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
  {}
]
```

##### Expected Validation Error Response (HTTP 422)
```json
{
  "detail": [
    {
      "loc": [
        "body",
        "query"
      ],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

</details>

---

### <a id="get-apiv1curriculumquizzes"></a>`GET` /api/v1/curriculum/quizzes
**List Quizzes**

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Purpose**: Interacts with the curriculum management module at `/api/v1/curriculum/quizzes`.
- 📤 **You Send**: Request parameters or payload depending on route.
- 📥 **You Receive**: Successful response indicator or resource object.

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
  {}
]
```

##### Expected Validation Error Response (HTTP 422)
```json
{
  "detail": [
    {
      "loc": [
        "body",
        "query"
      ],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

</details>

---

### <a id="post-apiv1curriculumlearning-paths"></a>`POST` /api/v1/curriculum/learning-paths
**Create Learning Path**

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Purpose**: Interacts with the curriculum management module at `/api/v1/curriculum/learning-paths`.
- 📤 **You Send**: Request parameters or payload depending on route.
- 📥 **You Receive**: Successful response indicator or resource object.

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
(Empty response payload)
```

##### Expected Validation Error Response (HTTP 422)
```json
{
  "detail": [
    {
      "loc": [
        "body",
        "email"
      ],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

</details>

---

### <a id="put-apiv1curriculumlearning-pathsheading"></a>`PUT` /api/v1/curriculum/learning-paths/{heading}
**Update Learning Path**

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Purpose**: Interacts with the curriculum management module at `/api/v1/curriculum/learning-paths/{heading}`.
- 📤 **You Send**: Request parameters or payload depending on route.
- 📥 **You Receive**: Successful response indicator or resource object.

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
(Empty response payload)
```

##### Expected Validation Error Response (HTTP 422)
```json
{
  "detail": [
    {
      "loc": [
        "body",
        "email"
      ],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

</details>

---

### <a id="post-apiv1curriculumadd-exercise"></a>`POST` /api/v1/curriculum/add-exercise
**Add Exercise**

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Purpose**: Interacts with the curriculum management module at `/api/v1/curriculum/add-exercise`.
- 📤 **You Send**: Request parameters or payload depending on route.
- 📥 **You Receive**: Successful response indicator or resource object.

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
(Empty response payload)
```

##### Expected Validation Error Response (HTTP 422)
```json
{
  "detail": [
    {
      "loc": [
        "body",
        "email"
      ],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

</details>

---

### <a id="post-apiv1curriculumlearning-pathsadd-exercises-batch"></a>`POST` /api/v1/curriculum/learning-paths/add-exercises-batch
**Inject Exercises Batch**

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Purpose**: Interacts with the curriculum management module at `/api/v1/curriculum/learning-paths/add-exercises-batch`.
- 📤 **You Send**: Request parameters or payload depending on route.
- 📥 **You Receive**: Successful response indicator or resource object.

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
(Empty response payload)
```

##### Expected Validation Error Response (HTTP 422)
```json
{
  "detail": [
    {
      "loc": [
        "body",
        "email"
      ],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

</details>

---

### <a id="put-apiv1curriculumexercisesex-id"></a>`PUT` /api/v1/curriculum/exercises/{ex_id}
**Update Existing Exercise**

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Purpose**: Interacts with the curriculum management module at `/api/v1/curriculum/exercises/{ex_id}`.
- 📤 **You Send**: Request parameters or payload depending on route.
- 📥 **You Receive**: Successful response indicator or resource object.

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
(Empty response payload)
```

##### Expected Validation Error Response (HTTP 422)
```json
{
  "detail": [
    {
      "loc": [
        "body",
        "email"
      ],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

</details>

---

### <a id="delete-apiv1curriculumlearning-pathsdelete-exercisesex-id"></a>`DELETE` /api/v1/curriculum/learning-paths/delete-exercises/{ex_id}
**Delete Exercise**

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Purpose**: Interacts with the curriculum management module at `/api/v1/curriculum/learning-paths/delete-exercises/{ex_id}`.
- 📤 **You Send**: Request parameters or payload depending on route.
- 📥 **You Receive**: Successful response indicator or resource object.

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
(Empty response payload)
```

##### Expected Validation Error Response (HTTP 422)
```json
{
  "detail": [
    {
      "loc": [
        "body",
        "query"
      ],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

</details>

---

### <a id="get-apiv1curriculumvideos"></a>`GET` /api/v1/curriculum/videos
**List Videos**

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Purpose**: Interacts with the curriculum management module at `/api/v1/curriculum/videos`.
- 📤 **You Send**: Request parameters or payload depending on route.
- 📥 **You Receive**: Successful response indicator or resource object.

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
  {}
]
```

##### Expected Validation Error Response (HTTP 422)
```json
{
  "detail": [
    {
      "loc": [
        "body",
        "query"
      ],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

</details>

---

### <a id="post-apiv1curriculumadd-video"></a>`POST` /api/v1/curriculum/add-video
**Add Video**

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Purpose**: Interacts with the curriculum management module at `/api/v1/curriculum/add-video`.
- 📤 **You Send**: Request parameters or payload depending on route.
- 📥 **You Receive**: Successful response indicator or resource object.

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
(Empty response payload)
```

##### Expected Validation Error Response (HTTP 422)
```json
{
  "detail": [
    {
      "loc": [
        "body",
        "email"
      ],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

</details>

---

### <a id="put-apiv1curriculumvideosvideo-id"></a>`PUT` /api/v1/curriculum/videos/{video_id}
**Update Existing Video**

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Purpose**: Interacts with the curriculum management module at `/api/v1/curriculum/videos/{video_id}`.
- 📤 **You Send**: Request parameters or payload depending on route.
- 📥 **You Receive**: Successful response indicator or resource object.

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
(Empty response payload)
```

##### Expected Validation Error Response (HTTP 422)
```json
{
  "detail": [
    {
      "loc": [
        "body",
        "email"
      ],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

</details>

---

### <a id="delete-apiv1curriculumvideosvideo-id"></a>`DELETE` /api/v1/curriculum/videos/{video_id}
**Delete Video**

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Purpose**: Interacts with the curriculum management module at `/api/v1/curriculum/videos/{video_id}`.
- 📤 **You Send**: Request parameters or payload depending on route.
- 📥 **You Receive**: Successful response indicator or resource object.

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
(Empty response payload)
```

##### Expected Validation Error Response (HTTP 422)
```json
{
  "detail": [
    {
      "loc": [
        "body",
        "query"
      ],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

</details>

---

### <a id="post-apiv1curriculumadd-quiz"></a>`POST` /api/v1/curriculum/add-quiz
**Add Quiz**

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Purpose**: Interacts with the curriculum management module at `/api/v1/curriculum/add-quiz`.
- 📤 **You Send**: Request parameters or payload depending on route.
- 📥 **You Receive**: Successful response indicator or resource object.

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
(Empty response payload)
```

##### Expected Validation Error Response (HTTP 422)
```json
{
  "detail": [
    {
      "loc": [
        "body",
        "email"
      ],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

</details>

---

### <a id="post-apiv1curriculumadd-quiz-csv"></a>`POST` /api/v1/curriculum/add-quiz-csv
**Add Quiz Csv**

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Purpose**: Interacts with the curriculum management module at `/api/v1/curriculum/add-quiz-csv`.
- 📤 **You Send**: Request parameters or payload depending on route.
- 📥 **You Receive**: Successful response indicator or resource object.

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
(Empty response payload)
```

##### Expected Validation Error Response (HTTP 422)
```json
{
  "detail": [
    {
      "loc": [
        "body",
        "email"
      ],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

</details>

---

### <a id="put-apiv1curriculumquizzesquiz-id"></a>`PUT` /api/v1/curriculum/quizzes/{quiz_id}
**Update Quiz**

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Purpose**: Interacts with the curriculum management module at `/api/v1/curriculum/quizzes/{quiz_id}`.
- 📤 **You Send**: Request parameters or payload depending on route.
- 📥 **You Receive**: Successful response indicator or resource object.

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
(Empty response payload)
```

##### Expected Validation Error Response (HTTP 422)
```json
{
  "detail": [
    {
      "loc": [
        "body",
        "email"
      ],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

</details>

---

### <a id="delete-apiv1curriculumquizzesquiz-id"></a>`DELETE` /api/v1/curriculum/quizzes/{quiz_id}
**Delete Quiz**

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Purpose**: Interacts with the curriculum management module at `/api/v1/curriculum/quizzes/{quiz_id}`.
- 📤 **You Send**: Request parameters or payload depending on route.
- 📥 **You Receive**: Successful response indicator or resource object.

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
(Empty response payload)
```

##### Expected Validation Error Response (HTTP 422)
```json
{
  "detail": [
    {
      "loc": [
        "body",
        "query"
      ],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

</details>

---

## General
---

### <a id="get-"></a>`GET` /
**Read Root**

#### Quick Overview
- **Purpose**: Ping-like health check on the root API route.
- 📤 **You Send**: Nothing.
- 📥 **You Receive**: Root API response (e.g. status code 200).

<details>
<summary><b>🛠️ View Developer Request & Response Examples</b></summary>

##### Mock curl Request
```bash
curl -X GET "http://localhost:8000/"
```

##### Expected Response (HTTP 200)
```json
(Empty response payload)
```

</details>

---

## Machine Learning
---

### <a id="post-mlpredict-risk"></a>`POST` /ml/predict_risk
**Predict Risk**

Predicts risk for raw data provided in the request body.

#### Quick Overview
- **Purpose**: Feed raw student engagement metrics into the ML model to predict if they are at risk of falling behind.
- 📤 **You Send**: Student metrics including watch progress status, time spent, exercise attempts, correctness ratio, and quiz score.
- 📥 **You Receive**: A risk score and categorization (e.g. HIGH risk or LOW risk).

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
(Empty response payload)
```

##### Expected Validation Error Response (HTTP 422)
```json
{
  "detail": [
    {
      "loc": [
        "body",
        "email"
      ],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

</details>

---

### <a id="get-mlhigh-risk-students"></a>`GET` /ml/high_risk_students
**Get All High Risk**

Fetches all students, calculates their real-time metrics 
from the DB, and returns only those flagged as HIGH risk.

#### Quick Overview
- **Purpose**: Query the machine learning subsystem to fetch all students currently classified as HIGH risk based on their live database metrics.
- 📤 **You Send**: Nothing.
- 📥 **You Receive**: A list of students flagged as high risk, complete with calculated engagement metrics.

<details>
<summary><b>🛠️ View Developer Request & Response Examples</b></summary>

##### Mock curl Request
```bash
curl -X GET "http://localhost:8000/ml/high_risk_students"
```

##### Expected Response (HTTP 200)
```json
(Empty response payload)
```

</details>

---

## Scheduling Engine
---

### <a id="post-apiv1scheduledoubtsregister"></a>`POST` /api/v1/schedule/doubts/register
**Student registers a new doubt for session scheduling**

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Purpose**: Register a new doubt. This queues the request and automatically starts matching an online trainer to schedule a live call.
- 📤 **You Send**: Doubt topic, problem description, learning path index, and an optional Cloudinary folder for screenshots.
- 📥 **You Receive**: The registered doubt ID, match status, and details.

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

##### Expected Validation Error Response (HTTP 422)
```json
{
  "detail": [
    {
      "loc": [
        "body",
        "email"
      ],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

</details>

---

### <a id="get-apiv1schedulequeue"></a>`GET` /api/v1/schedule/queue
**Trainer views all unscheduled (OPEN) doubts in the queue**

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Purpose**: Fetch the list of unscheduled student doubt requests currently waiting in the queue.
- 📤 **You Send**: Nothing (requires Trainer Auth token).
- 📥 **You Receive**: A list of open doubts awaiting scheduling.

<details>
<summary><b>🛠️ View Developer Request & Response Examples</b></summary>

##### Mock curl Request
```bash
curl -X GET "http://localhost:8000/api/v1/schedule/queue" \
     -H "Authorization: Bearer <your_access_token>"
```

##### Expected Response (HTTP 200)
```json
(Empty response payload)
```

</details>

---

### <a id="get-apiv1scheduletrainermy-sessions"></a>`GET` /api/v1/schedule/trainer/my-sessions
**Trainer views their scheduled doubt sessions**

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Purpose**: Retrieve the trainer's scheduled video call session slots.
- 📤 **You Send**: An optional `target_date` query parameter (format: YYYY-MM-DD).
- 📥 **You Receive**: A list of session slots including student name, scheduled time, and session length.

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

##### Expected Validation Error Response (HTTP 422)
```json
{
  "detail": [
    {
      "loc": [
        "body",
        "query"
      ],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

</details>

---

## Student Features
---

### <a id="post-apiv1studentprogress"></a>`POST` /api/v1/student/progress
**Log student learning progress**

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Purpose**: Log progress metrics as a student interacts with a curriculum page.
- 📤 **You Send**: Topic ID, current status (e.g. COMPLETED or IN_PROGRESS), and time spent on the page (seconds).
- 📥 **You Receive**: Successful log confirmation.

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
(Empty response payload)
```

##### Expected Validation Error Response (HTTP 422)
```json
{
  "detail": [
    {
      "loc": [
        "body",
        "email"
      ],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

</details>

---

### <a id="post-apiv1studentexercise"></a>`POST` /api/v1/student/exercise
**Log exercise submission**

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Purpose**: Log a student's attempt to solve an exercise, recording the code they submitted and whether it passed the automated tests.
- 📤 **You Send**: Exercise ID, raw JavaScript code, correctness boolean, and execution time (ms).
- 📥 **You Receive**: Successful submission confirmation.

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
(Empty response payload)
```

##### Expected Validation Error Response (HTTP 422)
```json
{
  "detail": [
    {
      "loc": [
        "body",
        "email"
      ],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

</details>

---

### <a id="post-apiv1studentquiz"></a>`POST` /api/v1/student/quiz
**Log quiz performance**

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Purpose**: Log the student's performance score on a curriculum quiz.
- 📤 **You Send**: Quiz ID, score, and total questions in the quiz.
- 📥 **You Receive**: Successful quiz log confirmation.

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
(Empty response payload)
```

##### Expected Validation Error Response (HTTP 422)
```json
{
  "detail": [
    {
      "loc": [
        "body",
        "email"
      ],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

</details>

---

### <a id="get-apiv1studentdoubtsmine"></a>`GET` /api/v1/student/doubts/mine
**Student views all their doubt requests and session status**

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Purpose**: Fetch all live and past doubt assistance requests submitted by the currently logged-in student.
- 📤 **You Send**: Nothing (requires Student Auth token).
- 📥 **You Receive**: A list of doubts, including scheduling timestamps, trainer details, and video call link statuses.

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
- **Purpose**: Record progress tracking metrics for an instructional video (e.g. when finished playing or watched for a duration).
- 📤 **You Send**: Topic ID, video URL, completion status (true/false), and seconds watched.
- 📥 **You Receive**: Successful log confirmation.

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
(Empty response payload)
```

##### Expected Validation Error Response (HTTP 422)
```json
{
  "detail": [
    {
      "loc": [
        "body",
        "email"
      ],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

</details>

---

### <a id="get-apiv1studenttopic-statustopic-id"></a>`GET` /api/v1/student/topic-status/{topic_id}
**Get completion status of topic components**

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Purpose**: Verify which curriculum components (videos, coding exercises) the student has completed within a given topic.
- 📤 **You Send**: The topic ID in the URL path (requires Student Auth token).
- 📥 **You Receive**: An object detailing completion status (true/false) for all video links and exercises.

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
(Empty response payload)
```

##### Expected Validation Error Response (HTTP 422)
```json
{
  "detail": [
    {
      "loc": [
        "body",
        "query"
      ],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
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
- **Purpose**: Obtain an overview of statistics, active debug sessions, and recent exercise submissions awaiting grading.
- 📤 **You Send**: Nothing in the request body (requires a valid Trainer Auth token).
- 📥 **You Receive**: Aggregated stats (active students, pending reviews, new doubts), active doubts sessions, and recent student submissions.

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
- **Purpose**: Retrieve all student exercise submissions, including both pending submissions that need grading and historically graded ones.
- 📤 **You Send**: Nothing in the request body (requires a valid Trainer Auth token).
- 📥 **You Receive**: An array of detailed submission items, listing the student's name, submitted code, status, and grading details.

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
- **Purpose**: Grade a student's submission by providing a score and specific, constructive feedback.
- 📤 **You Send**: The submission ID in the URL path, plus a score (0 to 100) and feedback string in the request body.
- 📥 **You Receive**: Successful response confirmation (HTTP 200).

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
(Empty response payload)
```

##### Expected Validation Error Response (HTTP 422)
```json
{
  "detail": [
    {
      "loc": [
        "body",
        "email"
      ],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

</details>

---

### <a id="get-apiv1trainercohort-stats"></a>`GET` /api/v1/trainer/cohort-stats
**Get Cohort Stats**

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Purpose**: Access broad statistical data for the active student cohort.
- 📤 **You Send**: Nothing in the request body (requires Trainer Auth token).
- 📥 **You Receive**: Cohort-wide stats summary.

<details>
<summary><b>🛠️ View Developer Request & Response Examples</b></summary>

##### Mock curl Request
```bash
curl -X GET "http://localhost:8000/api/v1/trainer/cohort-stats" \
     -H "Authorization: Bearer <your_access_token>"
```

##### Expected Response (HTTP 200)
```json
(Empty response payload)
```

</details>

---

### <a id="put-apiv1trainersessionssession-idresolve"></a>`PUT` /api/v1/trainer/sessions/{session_id}/resolve
**Trainer marks a session as resolved**

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Purpose**: Mark a scheduled doubt-resolution session as resolved once the call has finished.
- 📤 **You Send**: The session ID in the URL path (requires Trainer Auth token).
- 📥 **You Receive**: Successful response confirmation (HTTP 200).

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
(Empty response payload)
```

##### Expected Validation Error Response (HTTP 422)
```json
{
  "detail": [
    {
      "loc": [
        "body",
        "query"
      ],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

</details>

---

### <a id="put-apiv1trainermeavailability"></a>`PUT` /api/v1/trainer/me/availability
**Trainer toggles their online/offline status**

> 🔑 **Authorization Required**: Requires a valid OAuth2 Bearer token in the `Authorization` header.

#### Quick Overview
- **Purpose**: Toggle the trainer's status between online (available to match with student doubts) and offline.
- 📤 **You Send**: A boolean query parameter `is_available` (e.g., `true` or `false`).
- 📥 **You Receive**: Successful response confirmation (HTTP 200).

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
(Empty response payload)
```

##### Expected Validation Error Response (HTTP 422)
```json
{
  "detail": [
    {
      "loc": [
        "body",
        "query"
      ],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

</details>

---
