# Stanford School Management & Learning Management System

A full-stack **School Management System (SMS)** and **Learning Management System (LMS)** built with Spring Boot and React. The platform provides comprehensive tools for managing students, teachers, parents, courses, fees, attendance, examinations, library resources, and report cards — all secured with JWT-based authentication and role-based access control.

---

## Architecture & Tech Stack

### Backend (`schoolbackend/`)

| Technology | Purpose |
|---|---|
| **Java 17** | Language runtime |
| **Spring Boot 4.1.0** | Application framework |
| **Spring Security** | Authentication & authorization |
| **Spring Data JPA** | ORM & database access |
| **Flyway** | Database schema migration |
| **PostgreSQL** | Primary database |
| **JJWT (io.jsonwebtoken) 0.12.6** | JWT token generation & validation |
| **Bucket4j** | API rate limiting |
| **Spring Mail** | Email sending (verification, password reset) |
| **OpenHTMLtoPDF** | PDF report card generation |
| **Lombok** | Boilerplate reduction |
| **BCrypt** | Password hashing |
| **Maven** | Build & dependency management |

### Frontend (`schoolfrontend/`)

| Technology | Purpose |
|---|---|
| **React 19** | UI library |
| **Vite 8** | Build tool & dev server |
| **Tailwind CSS 4** | Utility-first CSS framework |
| **React Router DOM 7** | Client-side routing |
| **Axios** | HTTP client |
| **Recharts 3** | Data visualization & charts |
| **Lucide React** | Icon library |

---

## Features

### Authentication & Security
- JWT access tokens with configurable expiration
- Refresh token rotation (30-day remember-me / 24h session)
- Secure logout with token revocation
- Email verification flow with resend capability
- Password reset via email link
- BCrypt password hashing
- Login rate limiting (Bucket4j)
- Auth event logging (IP tracking)
- CORS protection

### Admin Dashboard
- Aggregate statistics and analytics charts
- Overview of students, teachers, fees, and library metrics

### User Management
- **Admins** — Full system control
- **Students** — Enrolled learners with class assignments
- **Teachers** — Associated with subjects and classes
- **Staff** — Administrative personnel
- **Parents** — Portal access to monitor children

### Academic Management
- Academic terms and sessions
- Classes and sections (streams)
- Subject catalog

### Student Portal
- View personal attendance records
- Check fee balances and payment history
- Access exam results
- Download report cards
- View library borrowing history

### Teacher Management
- Take attendance for assigned classes
- Enter exam marks
- Post course announcements
- Manage assignments and submissions

### Parent Portal
- Monitor child attendance
- View child fee statements
- Access child exam results
- Download child report cards

### Attendance Tracking
- Per-session attendance records
- Status: Present, Absent, Late, Excused
- Attendance reports by class and student

### Examinations & Results
- Exam creation and scheduling
- Mark entry by subject and student
- Result computation and ranking
- Student result viewing

### Fee Management
- Configurable fee items with default amounts
- Student fee invoicing
- Payment collection and receipt tracking
- Balance and outstanding reports

### Library Management
- Book catalog with ISBN, author, publisher metadata
- Multiple copies per title with unique copy IDs
- Book loan issuance and return tracking
- Loan history by student

### Report Cards
- PDF generation via OpenHTMLtoPDF
- Grading and remark summaries
- Downloadable per student per term

### Announcements
- Targeted announcements (All / Teachers / Students)
- Course-specific announcements
- Timestamped posting

### LMS — Learning Management
- Course management
- Student enrollment in courses
- Assignment creation with due dates and max scores
- Submission upload and grading

---

## Project Structure

```
stanford/
├── schoolbackend/                         # Spring Boot backend
│   ├── pom.xml                            # Maven configuration
│   ├── mvnw / mvnw.cmd                    # Maven wrapper
│   └── src/
│       ├── main/
│       │   ├── java/com/stanford/schoolbackend/
│       │   │   ├── SchoolbackendApplication.java   # Entry point
│       │   │   ├── core/
│       │   │   │   ├── admin/              # Admin user CRUD
│       │   │   │   ├── auth/               # Auth, JWT, refresh tokens, email verification, password reset
│       │   │   │   ├── config/             # SecurityConfig, AdminSeeder
│       │   │   │   ├── dashboard/          # Dashboard stats API
│       │   │   │   ├── email/              # Email sending service
│       │   │   │   ├── enums/              # Shared enums
│       │   │   │   ├── exception/          # Global exception handling
│       │   │   │   ├── notification/       # Notification system
│       │   │   │   ├── security/           # JWT filter, rate limiting
│       │   │   │   ├── storage/            # File upload handling
│       │   │   │   ├── user/               # User DTOs and shared user logic
│       │   │   │   ├── utils/              # Utility classes
│       │   │   │   └── validation/         # Custom validators
│       │   │   ├── lms/
│       │   │   │   ├── announcement/       # Announcement CRUD
│       │   │   │   ├── assignment/         # Assignment management
│       │   │   │   ├── course/             # Course management
│       │   │   │   ├── enrollment/         # Course enrollment
│       │   │   │   └── submission/         # Assignment submissions
│       │   │   └── sms/
│       │   │       ├── academic/           # Terms, classes, sections, subjects
│       │   │       ├── attendance/         # Attendance records
│       │   │       ├── exams/              # Exams & marks
│       │   │       ├── fees/               # Fee items, invoices, payments
│       │   │       ├── library/            # Books, copies, loans
│       │   │       ├── parent/             # Parent portal APIs
│       │   │       ├── student/            # Student management
│       │   │       └── teacher/            # Teacher management
│       │   └── resources/
│       │       ├── application.yaml        # Application configuration
│       │       ├── db/migration/           # Flyway SQL migrations
│       │       ├── static/                 # Static resources
│       │       └── templates/              # Email templates
│       └── test/                           # Unit & integration tests
│
├── schoolfrontend/                         # React frontend
│   ├── package.json                        # NPM dependencies & scripts
│   ├── vite.config.js                      # Vite build configuration
│   ├── index.html                          # HTML entry point
│   └── src/
│       ├── main.jsx                        # React entry point
│       ├── App.jsx                         # Root component with routing
│       ├── api/
│       │   └── axiosClient.js              # Axios instance with JWT interceptor
│       ├── components/
│       │   ├── layout/
│       │   │   ├── DashboardLayout.jsx     # Main dashboard shell
│       │   │   ├── Sidebar.jsx             # Navigation sidebar
│       │   │   └── Topbar.jsx              # Top navigation bar
│       │   └── shared/
│       │       ├── Breadcrumbs.jsx         # Breadcrumb navigation
│       │       ├── ConfirmDialog.jsx       # Confirmation modal
│       │       ├── DataTable.jsx           # Reusable data table
│       │       ├── EmptyState.jsx          # Empty state placeholder
│       │       ├── GlobalSearch.jsx        # Global search bar
│       │       ├── LoadingSkeleton.jsx     # Skeleton loading states
│       │       ├── NotificationDropdown.jsx # Notification bell
│       │       ├── OnboardingCard.jsx      # Onboarding help cards
│       │       └── TempPasswordModal.jsx   # Temporary password display
│       ├── context/
│       │   ├── AuthContext.jsx             # Auth state & JWT management
│       │   ├── SidebarContext.jsx          # Sidebar collapse state
│       │   ├── ThemeContext.jsx            # Light/dark theme
│       │   └── ToastContext.jsx            # Toast notifications
│       ├── hooks/
│       │   └── useApi.js                   # API data fetching hook
│       ├── pages/
│       │   ├── announcements/              # Announcements (admin view, user view)
│       │   ├── attendance/                 # Attendance taking & viewing
│       │   ├── auth/                       # Login, Register, Forgot/Reset Password, Verify Email, Change Password
│       │   ├── classes/                    # Class & section management
│       │   ├── dashboard/                  # Dashboard with charts
│       │   ├── exams/                      # Exam scheduling & management
│       │   ├── fees/                       # Fee items, invoicing, payment collection
│       │   ├── library/                    # Book catalog, copies, loan issuance
│       │   ├── marks/                      # Mark entry interface
│       │   ├── parents/                    # Parent dashboard, child views
│       │   ├── reportcards/                # Report card generation & viewing
│       │   ├── results/                    # Result computation & viewing
│       │   ├── staff/                      # Staff management
│       │   ├── students/                   # Student CRUD & student portal
│       │   ├── subjects/                   # Subject management
│       │   ├── teachers/                   # Teacher management
│       │   └── terms/                      # Academic term management
│       └── routes/
│           └── ProtectedRoute.jsx          # Auth guard component
│
└── .gitignore                              # Global git ignore rules
```

---

## Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| **Java JDK** | 17+ | Backend compilation & runtime |
| **Node.js** | 18+ | Frontend development server |
| **PostgreSQL** | 14+ | Primary database |
| **Maven** | 3.8+ | Backend build (wrapper included) |
| **Gmail Account** | — | SMTP for email verification & password reset (App Password required) |

---

## Environment Variables

Create a `.env` file in `schoolbackend/` with the following variables:

```env
# Database
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password

# JWT
JWT_SECRET=your_256bit_base64_encoded_secret_key
JWT_EXPIRATION_MS=3600000

# Email (Gmail SMTP)
GMAIL_USERNAME=your_email@gmail.com
GMAIL_APP_PASSWORD=your_16_char_app_password

# Admin Seeder (default admin account created on first run)
ADMIN_EMAIL=admin@school.com
ADMIN_PASSWORD=secure_admin_password
ADMIN_FIRST_NAME=School
ADMIN_LAST_NAME=Administrator

# Frontend URL (for CORS and email links)
FRONTEND_URL=http://localhost:5173
```

> **Note:** `ADMIN_PASSWORD`, `GMAIL_USERNAME`, `GMAIL_APP_PASSWORD`, `DB_USERNAME`, `DB_PASSWORD`, and `JWT_SECRET` are **required**. All other variables have sensible defaults.

---

## Setup & Installation

### 1. Clone the Repository

```bash
git clone https://github.com/MAROOTS/stanford-sms-lms.git
cd stanford
```

### 2. Database Setup

Create the PostgreSQL database:

```bash
psql -U postgres -c "CREATE DATABASE school_db;"
```

Flyway will automatically run all migrations on application startup (`application.yaml` has `flyway.enabled: true` and `baseline-on-migrate: true`).

### 3. Backend Setup

```bash
cd schoolbackend

# Create .env file with the required variables (see Environment Variables section above)

# Build and run
./mvnw spring-boot:run
```

The backend starts on **http://localhost:8080**.

On first run, the `AdminSeeder` creates a default admin account using the `ADMIN_*` environment variables.

### 4. Frontend Setup

```bash
cd schoolfrontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend starts on **http://localhost:5173**.

### 5. Access the Application

Open **http://localhost:5173** in your browser and log in with the admin credentials from your `.env` file.

---

## API Endpoints Summary

### Authentication — `/api/auth`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Login, returns JWT + refresh token | Public |
| PUT | `/api/auth/change-password` | Change password | Authenticated |
| POST | `/api/auth/forgot-password` | Request password reset email | Public |
| POST | `/api/auth/reset-password` | Reset password with token | Public |
| GET | `/api/auth/verify-email` | Verify email with token | Public |
| POST | `/api/auth/resend-verification` | Resend verification email | Public |
| POST | `/api/auth/refresh` | Refresh access token | Public |
| POST | `/api/auth/logout` | Revoke refresh token | Public |

### Admin — `/api/admin`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/admin/users` | List all users | Admin |
| POST | `/api/admin/users` | Create a user | Admin |
| PUT | `/api/admin/users/{id}` | Update a user | Admin |
| DELETE | `/api/admin/users/{id}` | Delete a user | Admin |

### Students — `/api/students`

Full CRUD for student records, including class/section assignment and parent linkage.

### Teachers — `/api/teachers`

Full CRUD for teacher records, including subject assignment.

### Classes — `/api/classes`

Manage classes, sections (streams), and class-teacher assignments.

### Subjects — `/api/subjects`

CRUD for academic subjects.

### Terms — `/api/terms`

Manage academic terms with start/end dates and active status.

### Attendance — `/api/attendance`

Record and retrieve attendance per session, with status tracking (Present/Absent/Late/Excused).

### Exams — `/api/exams`

Schedule exams and manage exam records by term and class.

### Marks — `/api/marks`

Enter and retrieve student marks by exam and subject.

### Results — `/api/results`

Computed results, rankings, and student performance summaries.

### Fees — `/api/fees`

Fee item configuration, student invoicing, and payment collection with balance tracking.

### Library — `/api/library`

Book catalog management, copy tracking, loan issuance, and return processing.

### Report Cards — `/api/reportcards`

PDF generation and retrieval of student report cards per term.

### Announcements — `/api/announcements`

Create and view announcements with audience targeting (All / Teachers / Students).

### Courses (LMS) — `/api/courses`

Course management for the learning management module.

### Enrollments (LMS) — `/api/enrollments`

Student enrollment in courses.

### Assignments (LMS) — `/api/assignments`

Assignment creation with due dates and scoring.

### Submissions (LMS) — `/api/submissions`

Student submission upload and grading.

### Dashboard — `/api/dashboard`

Aggregated statistics for the admin/role-based dashboard views.

### Parent Portal — `/api/parents`

Parent-specific endpoints for viewing child attendance, fees, results, and report cards.

---

## Default Admin Credentials

An admin account is automatically seeded on first application startup based on your `.env` configuration:

| Field | Value |
|---|---|
| **Email** | Set via `ADMIN_EMAIL` (default: `admin@admin.com`) |
| **Password** | Set via `ADMIN_PASSWORD` |
| **First Name** | Set via `ADMIN_FIRST_NAME` (default: `School`) |
| **Last Name** | Set via `ADMIN_LAST_NAME` (default: `Administrator`) |

> ⚠️ **Important:** Change the default admin password immediately after first login.

---

## Database Migrations

All database schema changes are managed through **Flyway** migrations located in `schoolbackend/src/main/resources/db/migration/`:

| Migration | Description |
|---|---|
| `V1__initial_schema.sql` | Core schema: users, students, teachers, classes, attendance, exams, fees, library, courses, announcements |
| `V2__parent_portal.sql` | Parent portal tables and relationships |
| `V3__fee_item_default_amount.sql` | Default fee amount configuration |
| `V4__create_refresh_tokens.sql` | JWT refresh token persistence |

Migrations run automatically on startup. No manual intervention is needed.

---

## Security Model

- **Password Hashing:** BCrypt with configurable strength
- **JWT Tokens:** Short-lived access tokens (configurable via `JWT_EXPIRATION_MS`), long-lived refresh tokens (30 days remember-me / 24 hours session)
- **Rate Limiting:** Login endpoint is rate-limited using Bucket4j to prevent brute-force attacks
- **CORS:** Configured for the frontend origin (`http://localhost:5173` by default, configurable via `FRONTEND_URL`)
- **Auth Event Logging:** All authentication events (login attempts, failures, password changes) are logged with IP addresses
- **Email Verification:** New registrations require email verification before full access
- **Stateless Sessions:** No server-side HTTP sessions — all state is carried in JWTs

---

## License

This project is proprietary. All rights reserved.