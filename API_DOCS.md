# JS Mentor Backend
## Version: 0.1.0

### Available authorizations
#### OAuth2PasswordBearer (OAuth2, password)
Token URL: auth/login  
Scopes:

---

### [POST] /auth/register/trainer
**Register Trainer**

#### Request Body

| Required | Schema |
| -------- | ------ |
|  Yes | **application/json**: [TrainerCreate](#trainercreate-schema)<br> |

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 201 | Successful Response | **application/json**: <br> |
| 422 | Validation Error | **application/json**: [HTTPValidationError](#httpvalidationerror-schema)<br> |

### [POST] /auth/login
**Login**

#### Request Body

| Required | Schema |
| -------- | ------ |
|  Yes | **application/json**: [UserLogin](#userlogin-schema)<br> |

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Successful Response | **application/json**: [Token](#token-schema)<br> |
| 422 | Validation Error | **application/json**: [HTTPValidationError](#httpvalidationerror-schema)<br> |

### [POST] /auth/webhook/
**Webhook Handler**

#### Responses

| Code | Description |
| ---- | ----------- |
| 204 | Successful Response |

---

### [GET] /api/v1/trainer/me/dashboard-overview
**Get Dashboard Overview**

Provides aggregated data for the Trainer Dashboard overview.
Currently returns structured mock data until full DB tables are implemented for Doubts and Mentorships.

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Successful Response | **application/json**: [DashboardOverview](#dashboardoverview-schema)<br> |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| OAuth2PasswordBearer |  |

### [GET] /api/v1/trainer/grading/submissions
**Get Grading Submissions**

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Successful Response | **application/json**: [ [SubmissionDetail](#submissiondetail-schema) ]<br> |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| OAuth2PasswordBearer |  |

### [PUT] /api/v1/trainer/grading/submissions/{submission_id}/grade
**Grade Submission**

#### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| submission_id | path |  | Yes | integer |

#### Request Body

| Required | Schema |
| -------- | ------ |
|  Yes | **application/json**: [GradeSubmissionRequest](#gradesubmissionrequest-schema)<br> |

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Successful Response | **application/json**: <br> |
| 422 | Validation Error | **application/json**: [HTTPValidationError](#httpvalidationerror-schema)<br> |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| OAuth2PasswordBearer |  |

### [GET] /api/v1/trainer/cohort-stats
**Get Cohort Stats**

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Successful Response | **application/json**: <br> |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| OAuth2PasswordBearer |  |

### [PUT] /api/v1/trainer/sessions/{session_id}/resolve
**Trainer marks a session as resolved**

#### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| session_id | path |  | Yes | integer |

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Successful Response | **application/json**: <br> |
| 422 | Validation Error | **application/json**: [HTTPValidationError](#httpvalidationerror-schema)<br> |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| OAuth2PasswordBearer |  |

### [PUT] /api/v1/trainer/me/availability
**Trainer toggles their online/offline status**

#### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| is_available | query |  | Yes | boolean |

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Successful Response | **application/json**: <br> |
| 422 | Validation Error | **application/json**: [HTTPValidationError](#httpvalidationerror-schema)<br> |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| OAuth2PasswordBearer |  |

---

### [POST] /ml/predict_risk
**Predict Risk**

Predicts risk for raw data provided in the request body.

#### Request Body

| Required | Schema |
| -------- | ------ |
|  Yes | **application/json**: [StudentData](#studentdata-schema)<br> |

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Successful Response | **application/json**: <br> |
| 422 | Validation Error | **application/json**: [HTTPValidationError](#httpvalidationerror-schema)<br> |

### [GET] /ml/high_risk_students
**Get All High Risk**

Fetches all students, calculates their real-time metrics 
from the DB, and returns only those flagged as HIGH risk.

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Successful Response | **application/json**: <br> |

---

### [POST] /api/v1/student/progress
**Log student learning progress**

#### Request Body

| Required | Schema |
| -------- | ------ |
|  Yes | **application/json**: [ProgressUpdate](#progressupdate-schema)<br> |

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Successful Response | **application/json**: <br> |
| 422 | Validation Error | **application/json**: [HTTPValidationError](#httpvalidationerror-schema)<br> |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| OAuth2PasswordBearer |  |

### [POST] /api/v1/student/exercise
**Log exercise submission**

#### Request Body

| Required | Schema |
| -------- | ------ |
|  Yes | **application/json**: [ExerciseSubmission](#exercisesubmission-schema)<br> |

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Successful Response | **application/json**: <br> |
| 422 | Validation Error | **application/json**: [HTTPValidationError](#httpvalidationerror-schema)<br> |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| OAuth2PasswordBearer |  |

### [POST] /api/v1/student/quiz
**Log quiz performance**

#### Request Body

| Required | Schema |
| -------- | ------ |
|  Yes | **application/json**: [QuizSubmission](#quizsubmission-schema)<br> |

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Successful Response | **application/json**: <br> |
| 422 | Validation Error | **application/json**: [HTTPValidationError](#httpvalidationerror-schema)<br> |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| OAuth2PasswordBearer |  |

### [GET] /api/v1/student/doubts/mine
**Student views all their doubt requests and session status**

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Successful Response | **application/json**: [ [MyDoubtDetail](#mydoubtdetail-schema) ]<br> |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| OAuth2PasswordBearer |  |

### [POST] /api/v1/student/video
**Log video completion progress**

#### Request Body

| Required | Schema |
| -------- | ------ |
|  Yes | **application/json**: [VideoProgressUpdate](#videoprogressupdate-schema)<br> |

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Successful Response | **application/json**: <br> |
| 422 | Validation Error | **application/json**: [HTTPValidationError](#httpvalidationerror-schema)<br> |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| OAuth2PasswordBearer |  |

### [GET] /api/v1/student/topic-status/{topic_id}
**Get completion status of topic components**

#### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| topic_id | path |  | Yes | string |

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Successful Response | **application/json**: <br> |
| 422 | Validation Error | **application/json**: [HTTPValidationError](#httpvalidationerror-schema)<br> |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| OAuth2PasswordBearer |  |

---

### [POST] /api/v1/schedule/doubts/register
**Student registers a new doubt for session scheduling**

#### Request Body

| Required | Schema |
| -------- | ------ |
|  Yes | **application/json**: [RegisterDoubtRequest](#registerdoubtrequest-schema)<br> |

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 201 | Successful Response | **application/json**: [RegisterDoubtResponse](#registerdoubtresponse-schema)<br> |
| 422 | Validation Error | **application/json**: [HTTPValidationError](#httpvalidationerror-schema)<br> |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| OAuth2PasswordBearer |  |

### [GET] /api/v1/schedule/queue
**Trainer views all unscheduled (OPEN) doubts in the queue**

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Successful Response | **application/json**: <br> |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| OAuth2PasswordBearer |  |

### [GET] /api/v1/schedule/trainer/my-sessions
**Trainer views their scheduled doubt sessions**

#### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| target_date | query |  | No | date |

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Successful Response | **application/json**: [ [TrainerSessionSlot](#trainersessionslot-schema) ]<br> |
| 422 | Validation Error | **application/json**: [HTTPValidationError](#httpvalidationerror-schema)<br> |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| OAuth2PasswordBearer |  |

---

### [GET] /api/v1/curriculum/
**Get full curriculum**

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Successful Response | **application/json**: <br> |

### [GET] /api/v1/curriculum/slug-mapping
**Get mapping of URL slugs to path indices**

Returns a map of { slug: 1-indexed-position } for all learning paths.

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Successful Response | **application/json**: <br> |

### [GET] /api/v1/curriculum/learning-path-names
**Get Learning Path Names**

Returns only the names of the learning paths for sidebar navigation.

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Successful Response | **application/json**: [ string ]<br> |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| OAuth2PasswordBearer |  |

### [GET] /api/v1/curriculum/learning-path/{learning_path}/topics
**Get Topics For Learning Path**

Returns the list of topic texts for a specific learning path.

#### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| learning_path | path |  | Yes | string |

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Successful Response | **application/json**: [ string ]<br> |
| 422 | Validation Error | **application/json**: [HTTPValidationError](#httpvalidationerror-schema)<br> |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| OAuth2PasswordBearer |  |

### [GET] /api/v1/curriculum/learning-path/{learning_path}/videos
**Get Videos For Learning Path**

Returns the list of videos for a specific learning path.

#### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| learning_path | path |  | Yes | string |

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Successful Response | **application/json**: [ object ]<br> |
| 422 | Validation Error | **application/json**: [HTTPValidationError](#httpvalidationerror-schema)<br> |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| OAuth2PasswordBearer |  |

### [GET] /api/v1/curriculum/visualize
**Visualize Paths**

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Successful Response | **application/json**: [ [PathOverview](#pathoverview-schema) ]<br> |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| OAuth2PasswordBearer |  |

### [GET] /api/v1/curriculum/exercises
**List Exercises**

#### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| path_heading | query |  | No | string |

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Successful Response | **application/json**: [ object ]<br> |
| 422 | Validation Error | **application/json**: [HTTPValidationError](#httpvalidationerror-schema)<br> |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| OAuth2PasswordBearer |  |

### [GET] /api/v1/curriculum/quizzes
**List Quizzes**

#### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| path_heading | query |  | No | string |

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Successful Response | **application/json**: [ object ]<br> |
| 422 | Validation Error | **application/json**: [HTTPValidationError](#httpvalidationerror-schema)<br> |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| OAuth2PasswordBearer |  |

### [POST] /api/v1/curriculum/learning-paths
**Create Learning Path**

#### Request Body

| Required | Schema |
| -------- | ------ |
|  Yes | **application/json**: [LearningPathCreate](#learningpathcreate-schema)<br> |

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 201 | Successful Response | **application/json**: <br> |
| 422 | Validation Error | **application/json**: [HTTPValidationError](#httpvalidationerror-schema)<br> |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| OAuth2PasswordBearer |  |

### [PUT] /api/v1/curriculum/learning-paths/{heading}
**Update Learning Path**

#### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| heading | path |  | Yes | string |

#### Request Body

| Required | Schema |
| -------- | ------ |
|  Yes | **application/json**: [LearningPathUpdate](#learningpathupdate-schema)<br> |

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Successful Response | **application/json**: <br> |
| 422 | Validation Error | **application/json**: [HTTPValidationError](#httpvalidationerror-schema)<br> |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| OAuth2PasswordBearer |  |

### [POST] /api/v1/curriculum/add-exercise
**Add Exercise**

#### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| path_heading | query |  | Yes | string |
| page_text | query |  | Yes | string |

#### Request Body

| Required | Schema |
| -------- | ------ |
|  Yes | **application/json**: [ExerciseCreate](#exercisecreate-schema)<br> |

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 201 | Successful Response | **application/json**: <br> |
| 422 | Validation Error | **application/json**: [HTTPValidationError](#httpvalidationerror-schema)<br> |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| OAuth2PasswordBearer |  |

### [POST] /api/v1/curriculum/learning-paths/add-exercises-batch
**Inject Exercises Batch**

#### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| path_heading | query |  | Yes | string |
| page_text | query |  | Yes | string |

#### Request Body

| Required | Schema |
| -------- | ------ |
|  Yes | **application/json**: [ [ExerciseCreate](#exercisecreate-schema) ]<br> |

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 201 | Successful Response | **application/json**: <br> |
| 422 | Validation Error | **application/json**: [HTTPValidationError](#httpvalidationerror-schema)<br> |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| OAuth2PasswordBearer |  |

### [PUT] /api/v1/curriculum/exercises/{ex_id}
**Update Existing Exercise**

#### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| ex_id | path |  | Yes | string |

#### Request Body

| Required | Schema |
| -------- | ------ |
|  Yes | **application/json**: [ExerciseUpdate](#exerciseupdate-schema)<br> |

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Successful Response | **application/json**: <br> |
| 422 | Validation Error | **application/json**: [HTTPValidationError](#httpvalidationerror-schema)<br> |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| OAuth2PasswordBearer |  |

### [DELETE] /api/v1/curriculum/learning-paths/delete-exercises/{ex_id}
**Delete Exercise**

#### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| ex_id | path |  | Yes | string |

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Successful Response | **application/json**: <br> |
| 422 | Validation Error | **application/json**: [HTTPValidationError](#httpvalidationerror-schema)<br> |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| OAuth2PasswordBearer |  |

### [GET] /api/v1/curriculum/videos
**List Videos**

#### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| path_heading | query |  | No | string |

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Successful Response | **application/json**: [ object ]<br> |
| 422 | Validation Error | **application/json**: [HTTPValidationError](#httpvalidationerror-schema)<br> |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| OAuth2PasswordBearer |  |

### [POST] /api/v1/curriculum/add-video
**Add Video**

#### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| path_heading | query |  | Yes | string |
| page_text | query |  | Yes | string |

#### Request Body

| Required | Schema |
| -------- | ------ |
|  Yes | **multipart/form-data**: [Body_add_video_api_v1_curriculum_add_video_post](#body_add_video_api_v1_curriculum_add_video_post-schema)<br> |

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 201 | Successful Response | **application/json**: <br> |
| 422 | Validation Error | **application/json**: [HTTPValidationError](#httpvalidationerror-schema)<br> |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| OAuth2PasswordBearer |  |

### [PUT] /api/v1/curriculum/videos/{video_id}
**Update Existing Video**

#### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| video_id | path |  | Yes | string |

#### Request Body

| Required | Schema |
| -------- | ------ |
|  No | **multipart/form-data**: [Body_update_existing_video_api_v1_curriculum_videos__video_id__put](#body_update_existing_video_api_v1_curriculum_videos__video_id__put-schema)<br> |

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Successful Response | **application/json**: <br> |
| 422 | Validation Error | **application/json**: [HTTPValidationError](#httpvalidationerror-schema)<br> |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| OAuth2PasswordBearer |  |

### [DELETE] /api/v1/curriculum/videos/{video_id}
**Delete Video**

#### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| video_id | path |  | Yes | string |

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Successful Response | **application/json**: <br> |
| 422 | Validation Error | **application/json**: [HTTPValidationError](#httpvalidationerror-schema)<br> |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| OAuth2PasswordBearer |  |

### [POST] /api/v1/curriculum/add-quiz
**Add Quiz**

#### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| path_heading | query |  | Yes | string |
| page_text | query |  | Yes | string |

#### Request Body

| Required | Schema |
| -------- | ------ |
|  Yes | **application/json**: [QuizCreate](#quizcreate-schema)<br> |

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 201 | Successful Response | **application/json**: <br> |
| 422 | Validation Error | **application/json**: [HTTPValidationError](#httpvalidationerror-schema)<br> |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| OAuth2PasswordBearer |  |

### [POST] /api/v1/curriculum/add-quiz-csv
**Add Quiz Csv**

#### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| path_heading | query |  | Yes | string |
| page_text | query |  | Yes | string |

#### Request Body

| Required | Schema |
| -------- | ------ |
|  Yes | **multipart/form-data**: [Body_add_quiz_csv_api_v1_curriculum_add_quiz_csv_post](#body_add_quiz_csv_api_v1_curriculum_add_quiz_csv_post-schema)<br> |

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 201 | Successful Response | **application/json**: <br> |
| 422 | Validation Error | **application/json**: [HTTPValidationError](#httpvalidationerror-schema)<br> |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| OAuth2PasswordBearer |  |

### [PUT] /api/v1/curriculum/quizzes/{quiz_id}
**Update Quiz**

#### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| quiz_id | path |  | Yes | string |

#### Request Body

| Required | Schema |
| -------- | ------ |
|  Yes | **application/json**: [QuizUpdate](#quizupdate-schema)<br> |

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Successful Response | **application/json**: <br> |
| 422 | Validation Error | **application/json**: [HTTPValidationError](#httpvalidationerror-schema)<br> |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| OAuth2PasswordBearer |  |

### [DELETE] /api/v1/curriculum/quizzes/{quiz_id}
**Delete Quiz**

#### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| quiz_id | path |  | Yes | string |

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Successful Response | **application/json**: <br> |
| 422 | Validation Error | **application/json**: [HTTPValidationError](#httpvalidationerror-schema)<br> |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| OAuth2PasswordBearer |  |

---

### [POST] /ai/js-mentor/explain-error
**Explain Error**

#### Request Body

| Required | Schema |
| -------- | ------ |
|  Yes | **application/json**: [ExplainErrorQuery](#explainerrorquery-schema)<br> |

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Successful Response | **application/json**: <br> |
| 422 | Validation Error | **application/json**: [HTTPValidationError](#httpvalidationerror-schema)<br> |

### [POST] /ai/js-mentor/domain-specialized-assistant
**Consult Ai**

API endpoint for AI consultation - delegates to service layer

#### Request Body

| Required | Schema |
| -------- | ------ |
|  Yes | **application/json**: [AIQuery](#aiquery-schema)<br> |

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Successful Response | **application/json**: <br> |
| 422 | Validation Error | **application/json**: [HTTPValidationError](#httpvalidationerror-schema)<br> |

---

### [POST] /assets/generate-signature
**Generate a Cloudinary signed upload signature**

Generate a signature for Cloudinary direct uploads.
Delegates business logic to the asset service.

#### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| folder | query |  | Yes | string |

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Successful Response | **application/json**: <br> |
| 422 | Validation Error | **application/json**: [HTTPValidationError](#httpvalidationerror-schema)<br> |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| OAuth2PasswordBearer |  |

### [DELETE] /assets/cleanup/{session_id}
**Manually trigger cleanup of session assets**

Hook to clean up a specific session's Cloudinary folder.
This can also be triggered directly from the trainer dashboard when a doubt is resolved.

#### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| session_id | path |  | Yes | integer |

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Successful Response | **application/json**: <br> |
| 422 | Validation Error | **application/json**: [HTTPValidationError](#httpvalidationerror-schema)<br> |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| OAuth2PasswordBearer |  |

---

### [GET] /
**Read Root**

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Successful Response | **application/json**: <br> |

---
### Schemas

#### AIQuery Schema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| input_text | string |  | Yes |

#### ActiveSession Schema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| session_id | string |  | Yes |
| topic | string |  | Yes |
| time_remaining_minutes | integer |  | Yes |
| student_name | string |  | Yes |
| status | string |  | Yes |

#### Body_add_quiz_csv_api_v1_curriculum_add_quiz_csv_post Schema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| title | string |  | Yes |
| file | binary |  | Yes |

#### Body_add_video_api_v1_curriculum_add_video_post Schema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| title | string |  | Yes |
| url | string or null |  | No |
| file | binary |  | No |

#### Body_update_existing_video_api_v1_curriculum_videos__video_id__put Schema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| title | string or null |  | No |
| url | string or null |  | No |
| file | binary |  | No |

#### DashboardOverview Schema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| trainer_name | string |  | Yes |
| is_available | boolean |  | Yes |
| stats | [DashboardStats](#dashboardstats-schema) |  | Yes |
| recent_submissions | [ [RecentSubmission](#recentsubmission-schema) ] |  | Yes |
| active_sessions | [ [ActiveSession](#activesession-schema) ] |  | Yes |

#### DashboardStats Schema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| active_students | integer |  | Yes |
| pending_reviews | integer |  | Yes |
| new_doubts | integer |  | Yes |
| average_score_percentage | number |  | Yes |

#### ExerciseCreate Schema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| id | string |  | Yes |
| title | string |  | Yes |
| description | string |  | Yes |
| difficulty | string |  | Yes |
| tags | [ string ] |  | Yes |

#### ExerciseSubmission Schema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| exercise_id | string |  | Yes |
| code_submitted | string |  | Yes |
| is_correct | boolean |  | Yes |
| execution_time_ms | integer |  | Yes |

#### ExerciseUpdate Schema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| title | string or null |  | No |
| description | string or null |  | No |
| difficulty | string or null |  | No |
| tags | [ string ] or null |  | No |

#### ExplainErrorQuery Schema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| code | string |  | Yes |
| error_message | string |  | Yes |

#### GradeSubmissionRequest Schema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| score | number |  | Yes |
| feedback | string |  | Yes |

#### HTTPValidationError Schema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| detail | [ [ValidationError](#validationerror-schema) ] |  | No |

#### LearningPathCreate Schema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| heading | string |  | Yes |
| content | string |  | Yes |
| links | [ [LinkCreate](#linkcreate-schema) ] or null |  | No |

#### LearningPathUpdate Schema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| heading | string or null |  | No |
| content | string or null |  | No |
| links | [ [LinkCreate](#linkcreate-schema) ] or null |  | No |

#### LinkCreate Schema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| text | string |  | Yes |
| url | string |  | Yes |
| pageContent | object or null |  | No |

#### MyDoubtDetail Schema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| doubt_id | integer |  | Yes |
| topic | string |  | Yes |
| description | string |  | Yes |
| learning_path_index | integer |  | Yes |
| status | string |  | Yes |
| created_at | dateTime |  | Yes |
| scheduled_for | dateTime or null |  | No |
| trainer_name | string or null |  | No |
| duration_minutes | integer or null |  | No |
| session_id | integer or null |  | No |

#### PageOverview Schema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| text | string |  | Yes |
| titles | [ string ] |  | Yes |
| exercises | [ object ], <br>**Default:**  |  | No |

#### PathOverview Schema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| heading | string |  | Yes |
| pages | [ [PageOverview](#pageoverview-schema) ] |  | Yes |

#### ProgressUpdate Schema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| topic_id | string |  | Yes |
| status | string |  | Yes |
| time_spent_seconds | integer |  | Yes |

#### QuizCreate Schema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| title | string |  | Yes |
| questions | [ [QuizQuestionCreate](#quizquestioncreate-schema) ], <br>**Default:**  |  | No |

#### QuizQuestionCreate Schema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| id | string |  | Yes |
| text | string |  | Yes |
| options | [ string ] |  | Yes |
| correct_answer | string |  | Yes |

#### QuizSubmission Schema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| quiz_id | string |  | Yes |
| score | number |  | Yes |
| total_questions | integer |  | Yes |

#### QuizUpdate Schema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| title | string or null |  | No |
| questions | [ [QuizQuestionCreate](#quizquestioncreate-schema) ] or null |  | No |

#### RecentSubmission Schema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| submission_id | string |  | Yes |
| exercise_title | string |  | Yes |
| student_id | string |  | Yes |
| student_name | string |  | Yes |
| status | string |  | Yes |
| submitted_at | dateTime |  | Yes |

#### RegisterDoubtRequest Schema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| topic | string | Short title of the doubt (e.g. 'Closures not working') | Yes |
| description | string | Detailed description of the problem | Yes |
| learning_path_index | integer or null | The 1-indexed position of the learning path (1=Fundamentals, 2=JS Core, etc.) | No |
| cloudinary_folder | string or null | The Cloudinary folder where images are uploaded | No |

#### RegisterDoubtResponse Schema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| doubt_id | integer |  | Yes |
| topic | string |  | Yes |
| duration_minutes | integer |  | Yes |
| message | string |  | Yes |
| status | string |  | Yes |

#### StudentData Schema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| progress_status | string |  | Yes |
| time_spent_seconds | integer |  | Yes |
| avg_exercise_attempts | number |  | Yes |
| avg_exercise_execution_time_ms | integer |  | Yes |
| exercise_is_correct_ratio | number |  | Yes |
| quiz_score | number |  | Yes |
| quiz_attempt_number | integer |  | Yes |

#### SubmissionDetail Schema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| id | integer |  | Yes |
| student_id | integer |  | Yes |
| student_name | string |  | Yes |
| exercise_id | string |  | Yes |
| exercise_title | string |  | Yes |
| exercise_question | string or null |  | No |
| status | string |  | Yes |
| submitted_at | dateTime |  | Yes |
| code_submitted | string or null |  | No |
| grade | number or null |  | No |
| feedback | string or null |  | No |

#### Token Schema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| access_token | string |  | Yes |
| token_type | string |  | Yes |
| role | string |  | Yes |

#### TrainerCreate Schema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| name | string |  | Yes |
| email | string (email) |  | Yes |
| password | string |  | Yes |
| specialization | string or null |  | No |
| registration_code | string |  | Yes |

#### TrainerSessionSlot Schema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| session_id | integer |  | Yes |
| student_name | string |  | Yes |
| topic | string |  | Yes |
| scheduled_for | dateTime |  | Yes |
| duration_minutes | integer |  | Yes |
| status | string |  | Yes |

#### UserLogin Schema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| username | string |  | Yes |
| password | string |  | Yes |

#### ValidationError Schema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| loc | [ string or integer ] |  | Yes |
| msg | string |  | Yes |
| type | string |  | Yes |

#### VideoProgressUpdate Schema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| topic_id | string |  | Yes |
| video_url | string |  | Yes |
| is_completed | boolean |  | Yes |
| watched_seconds | integer |  | Yes |
