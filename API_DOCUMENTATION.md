# 📚 Full System API Reference

> Welcome to the Attendance API Documentation. This reference provides comprehensive details on all models, endpoints, and integration payloads for the Attendance MVC Backend.

---

## 🔒 1. Authentication & Security
Almost all routes in this application are protected via JWT (JSON Web Tokens). 
When a user logs in, the API returns a token. This token must be included in the header of all subsequent requests.

**Required Header Layout:**
```http
Authorization: Bearer <YOUR_ACCESS_TOKEN>
```

---

## 🗄️ 2. Core Entities (Data Models)

### **User Object**
| Field | Type | Description |
|---|---|---|
| `user_id` | Integer | Primary key |
| `username` | String | Unique username for login |
| `email` | String | User's email address |
| `full_name` | String | Display name |
| `role` | Enum | `admin`, `teacher`, or `student` |
| `profile_id` | Integer | Foreign key linking to Teacher/Student ID based on role |

### **Student Object**
| Field | Type | Description |
|---|---|---|
| `student_id` | Integer | Primary key |
| `class_id` | Integer | ID of the class the student belongs to |
| `student_name_kh` | String | Khmer Name |
| `student_name_eng` | String | English Name |
| `gender` | Char | `M`, `F`, or `O` |

### **Attendance Object**
| Field | Type | Description |
|---|---|---|
| `attendance_id` | Integer | Primary key |
| `student_id` | Integer | Foreign Key to Student |
| `teacher_id` | Integer | Foreign Key to Teacher creating the record |
| `subject_id` | Integer | Foreign Key to Subject |
| `attendance_date` | Date | Target calendar date (YYYY-MM-DD) |
| `session` | String | `morning`, `afternoon`, `evening`, etc. |
| `status` | String | `P` (Present), `A` (Absent), `L` (Late), `E` (Excused) |
| `notes` | String | Optional context/reasoning |

---

## 🚀 3. API Endpoints Reference

### 🟢 Authentication (`/api/v1/auth`)

#### `POST /register`
Registers a new user in the system.
**Request Body:**
```json
{
  "username": "admin01",
  "password": "securepassword123",
  "email": "admin@school.edu",
  "full_name": "System Admin",
  "role": "admin"
}
```

#### `POST /login`
Authenticates a user and returns a token.
**Request Body:**
```json
{
  "username": "admin01",
  "password": "securepassword123"
}
```
**Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUz...",
  "user": {
    "user_id": 1,
    "role": "admin",
    "username": "admin01"
  }
}
```

---

### 🎓 Students (`/api/v1/student`)
*Protected Routes*

#### `GET /`
Retrieves a paginated list of all enrolled students.

#### `POST /`
Creates a new student profile.
**Request Body:**
```json
{
  "class_id": 1,
  "student_name_kh": "សុខ សាន",
  "student_name_eng": "Sok San",
  "gender": "M"
}
```

#### `GET /:id`
Gets full profile details of a single student by `student_id`.

#### `POST /upload-excel-bulk`
*Multipart/form-data request.* Upload an `.xlsx` sheet with student records for automatic bulk insertion.
**Form Data:**
- `file`: The Excel file.

---

### 🏫 Classes & Subjects (`/api/v1/class` | `/api/v1/subject`)
*Protected Routes*

#### `POST /api/v1/class`
Create a new academic class section.
**Request Body:**
```json
{
  "class_code": "M101"
}
```

#### `POST /api/v1/subject`
Create a new subject curriculum entry.
**Request Body:**
```json
{
  "subject_name": "Mathematics",
  "subject_code": "MATH-101",
  "description": "Intro to Calculus"
}
```

#### `POST /api/v1/subject/assign`
Binds a subject to a specific class for a specific day/schedule.

---

### 📋 Attendance Management (`/api/v1/attendance`)
*Protected Routes*

#### `POST /`
Records attendance for a single student.
**Request Body:**
```json
{
  "student_id": 45,
  "teacher_id": 2,
  "subject_id": 8,
  "attendance_date": "2024-03-02",
  "session": "morning",
  "status": "A",
  "notes": "Called in sick"
}
```

#### `POST /submit-batch`
Submits grouped attendance payloads at once (e.g., end of class submission). Triggers a Telegram alert automatically.
**Request Body:**
```json
{
  "teacher_id": 2,
  "subject_id": 8,
  "attendance_date": "2024-03-02",
  "session": "morning",
  "records": [
    { "student_id": 1, "status": "P" },
    { "student_id": 2, "status": "A", "notes": "No call" },
    { "student_id": 3, "status": "P" }
  ]
}
```

#### `GET /reports/dashboard`
Fetches high-level key performance metrics for the main application dashboard (Late %, Absent %, total present).

#### `GET /reports/student?student_id=X&start_date=Y&end_date=Z`
Fetches a detailed percentage presence/absence matrix for a specific student over a specific timeframe.

---

### ✉️ Integrations (`/api/v1/telegram`)
*Protected Routes*

#### `POST /send`
Triggers an immediate message drop in the configured Telegram group.
**Request Body:**
```json
{
  "text": "🚨 **Alert:** Class M101 Attendance was finalized by John Doe.",
  "parse_mode": "MarkdownV2"
}
```
