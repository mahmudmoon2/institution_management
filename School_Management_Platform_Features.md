# 🏫 School Management Platform — Complete Feature Brief

## 📋 Project Overview
A full-featured school/institution management ERP system built with Django REST Framework (backend) and React/Vite (frontend). The platform supports 4 user roles: **Admin**, **Teacher**, **Student**, and **Parent**, plus a public-facing website for the institution.

**Tech Stack:** Django 6.0 + DRF + SimpleJWT + PostgreSQL | React + Vite | WeasyPrint (PDF) | JWT Authentication

---

## 🔐 1. USER AUTHENTICATION & ROLE MANAGEMENT

### 1.1 Multi-Role User System
- Roles: **ADMIN, TEACHER, STUDENT, PARENT**
- UUID-based user IDs for all users
- JWT Token-based authentication (Access Token: 1hr, Refresh Token: 7 days)
- All API endpoints are protected by default (IsAuthenticated)
- Custom login view with role validation

### 1.2 Password Management
- Admin can search and change passwords for any user (Teacher/Student/Staff) by username or user ID
- Password validation: minimum 4 characters
- Search users by username and role
- Role-based access: only Admin can change others' passwords

### 1.3 API Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/login/` | POST | User login with role validation |
| `/api/v1/token/refresh/` | POST | JWT token refresh |
| `/api/v1/me/` | GET | Current user profile info |
| `/api/v1/admin/change-password/` | POST | Admin changes any user's password |
| `/api/v1/admin/search-users/` | GET | Search users by username/role |

---

## 🎓 2. ACADEMIC STRUCTURE

### 2.1 Class & Section Management
- **ClassLevels** (e.g., Class 6, Class 7, ... Class 12)
- **Sections** per class (e.g., Padma, Meghna, Jamuna)
- **Groups** for higher classes (Science, Arts, Commerce)
- Section belongs to a specific ClassLevel

### 2.2 Subject Management
- Subject with name and unique code
- Subjects mapped to specific ClassLevels
- Used across: Routine, Exams, Results, Teacher specialization

### 2.3 Weekly Class Routine
- Day-wise schedule: Saturday to Friday
- Period number with start/end times
- Subject-wise period assignment
- Teacher assignment per period
- Room number tracking
- Unique constraint: One class-section can't have overlapping periods
- Active/inactive toggle

---

## 👨‍🏫 3. TEACHER MANAGEMENT

### 3.1 Teacher Profile
- Unique teacher ID (auto-generated)
- Personal info: name, email, phone, gender, photo
- Major subject assignment
- Joining date, address (present & permanent)
- NID image upload
- Guide teacher assignment for students

### 3.2 Teacher Attendance
- Daily attendance: Present / Absent / Late / On-Leave
- Unique record per teacher per date
- Recorded with optional notes

### 3.3 Class History
- Teachers record daily class history
- Subject, class, section, time, and topic covered

### 3.4 PDF Generation
- **Teacher ID Card** — Photo, name, ID, contact, blood group
- **Teacher Appointment Letter** — Official appointment document

### 3.5 Frontend Pages
| Page | Path | User |
|------|------|------|
| Teachers List | `/admin/teachers` | Admin |
| Add Teacher | `/admin/teachers/add` | Admin |
| Edit Teacher | `/admin/teachers/edit/:id` | Admin |
| Teacher Attendance | `/admin/teacher-attendance` | Admin |
| Teacher Dashboard | `/teacher/dashboard` | Teacher |

---

## 👩‍🎓 4. STUDENT MANAGEMENT

### 4.1 Student Profile
- Auto-generated student ID
- Personal info: name, DOB, gender, blood group, religion, photo
- Academic info: Class, Section, Roll Number, Group
- Address: Present & Permanent
- Guardian info: name, phone, email, NID image
- Guide teacher assignment
- Admission date, active/inactive status

### 4.2 Student Attendance
- Daily attendance: Present / Absent / Late / Holiday
- Recorded by teacher
- Unique record per student per date

### 4.3 Monthly Attendance Summary
- Auto-calculated: Total days, Present, Absent
- Attendance percentage
- Unique per student per month/year

### 4.4 PDF Generation
- **Student ID Card** — Photo, name, class, roll, blood group, contact
- **Attendance Report** — Detailed monthly/yearly attendance with percentage bar

### 4.5 Frontend Pages
| Page | Path | User |
|------|------|------|
| Students List | `/admin/students` | Admin |
| Add Student | `/admin/students/add` | Admin |
| Edit Student | `/admin/students/edit/:id` | Admin |
| Attendance Management | `/admin/attendance-management` | Admin |
| Student Dashboard | `/student/dashboard` | Student |
| Student Attendance (Teacher) | `/teacher/attendance` | Teacher |

---

## 👨‍👩‍👧 5. PARENT PORTAL

### 5.1 Parent Features
- **Dashboard Summary** — Overview of child's attendance, results, fees
- **Child Profile** — View child's complete profile
- **Attendance** — Real-time attendance tracking for child
- **Results** — Exam results and marksheets
- **Fees** — Payment history, due amounts
- **Messages** — Direct messaging between parent and teacher
- **Notices** — View school notices
- Mark messages as read, reply to teacher messages

### 5.2 Teacher-to-Parent Messaging
- Teacher sends message to any student's parent
- Message body + optional image attachment
- Conversational threads with replies
- Teacher can view full conversation history per student
- Real-time read status

### 5.3 Frontend Pages
| Page | Path | User |
|------|------|------|
| Parent Dashboard | `/parent/dashboard` | Parent |
| Parent Profile | `/parent/profile` | Parent |
| Child Attendance | `/parent/attendance` | Parent |
| Child Results | `/parent/results` | Parent |
| Child Fees | `/parent/fees` | Parent |
| Parent Messages | `/parent/messages` | Parent |
| Teacher Messages | `/teacher/messages` | Teacher |

---

## 📝 6. EXAMINATION SYSTEM

### 6.1 Exam Management
- Create exams per class level with academic year
- Start date and end date
- Created by admin

### 6.2 Subject Exams (Exam Routine)
- Per-subject exam schedule within an exam
- Full marks, pass marks
- Exam date and time

### 6.3 Grade System
- Customizable grade scale: A+, A, A-, B, C, D, F
- Min/Max percentage range
- GPA value per grade
- Remarks

### 6.4 Results & Marks Entry
- Marks entry per student, per subject, per exam
- **Auto-grade calculation** based on percentage & grade scale
- Recorded by admin/teacher

### 6.5 Class Test System
- Create class tests per subject, class, section
- Topic and max marks
- Individual student results

### 6.6 PDF Generation (4 Types)
1. **Exam Routine PDF** — Full exam schedule with dates, times, subjects
2. **Tabulation Sheet PDF** — Complete class result sheet with all students' grades/GPA
3. **Individual Marksheet PDF** — Per student result with subject-wise marks, grades, final GPA
4. **Admit Card PDF** — Bulk admit cards for entire class with student photo, exam routine

### 6.7 Frontend Pages
| Page | Path | User |
|------|------|------|
| Exams | `/admin/exams` | Admin |
| Exam Routine / Subject Exams | `/admin/exam-routine` | Admin |
| Marks Entry | `/admin/marks-entry` | Admin |
| Grades Setup | `/admin/grades-setup` | Admin |
| Result Sheet | `/admin/result-sheet` | Admin |
| Individual Marksheet | `/admin/marksheet/:examId/:studentId` | Admin |
| Admit Cards | `/admin/admit-cards` | Admin |
| Class Tests | `/admin/class-tests` | Admin |
| Results (Student) | `/student/results` | Student |
| Results (Teacher) | `/teacher/results` | Teacher |

---

## 💰 7. FEE MANAGEMENT SYSTEM

### 7.1 Fee Categories
- Custom fee heads: e.g., Tuition Fee, Bus Fee, Lab Fee, Library Fee
- Amount per category
- Per class level or all classes
- Frequency: Monthly / Yearly / One-time

### 7.2 Fee Collection
- Multi-item receipt: one receipt can contain multiple fee categories
- Total amount, amount paid, due amount calculation
- Payment methods: Cash, Online, Cheque
- Auto-generated receipt number (REC-1000, REC-1001...)
- Auto-generated transaction ID
- Recorded by admin

### 7.3 Payment Items
- Line items within a receipt
- Per fee category amount
- Month and year tracking for recurring fees

### 7.4 Fee Reports
- Comprehensive fee reports
- Filter by date range, class, student
- Due amount tracking

### 7.5 PDF Generation
- **Payment Receipt PDF** — Professional receipt with school header, line items, payment details, due amount

### 7.6 Frontend Pages
| Page | Path | User |
|------|------|------|
| Fee Categories | `/admin/fee-categories` | Admin |
| Collect Fee | `/admin/collect-fee` | Admin |
| Receipt View | `/admin/receipt/:id` | Admin |
| Fee Reports | `/admin/fee-reports` | Admin |

---

## 💵 8. ACCOUNTS / BOOKKEEPING

### 8.1 Income/Expense Heads
- Customizable account heads (Income or Expense type)
- Examples: Tuition Fee (Income), Electricity Bill (Expense)

### 8.2 Daily Transactions
- Record daily income and expenses
- Head-wise transaction recording
- Amount, date, description, reference number
- Recorded by admin

### 8.3 PDF Generation
- **Accounts Report PDF** — Period-wise income/expense summary with totals

### 8.4 Frontend Pages
| Page | Path | User |
|------|------|------|
| Accounts | `/admin/accounts` | Admin |

---

## 📦 9. INVENTORY MANAGEMENT

### 9.1 Category Management
- Product categories (Books, Stationery, Lab Equipment, etc.)

### 9.2 Product Management
- Product name, category, quantity in stock
- Unit (pcs, kg, box)
- Purchase price

### 9.3 Distribution Tracking
- Record product distribution
- Distributed to class or individual
- Quantity, date, distributed by
- Notes

### 9.4 Frontend Pages
| Page | Path | User |
|------|------|------|
| Inventory | `/admin/inventory` | Admin |

---

## 👔 10. STAFF MANAGEMENT (NON-TEACHING)

### 10.1 Department & Designation
- Staff departments: Administration, Accounts, Library, Lab, etc.
- Staff designations: Accountant, Librarian, Lab Assistant, Office Assistant, etc.
- Designation belongs to department

### 10.2 Staff Profile
- Unique staff ID
- Personal info: name, email, phone, DOB, gender, blood group, religion, photo
- Designation & department
- Address (present & permanent)
- NID info & image
- Joining date, salary
- Status: Active / Inactive / On-Leave / Terminated

### 10.3 Appointment Letter
- Appointment letter generation tracking
- Appointment letter date

### 10.4 PDF Generation
- **Staff Appointment Letter** — Official appointment document

### 10.5 Frontend Pages
| Page | Path | User |
|------|------|------|
| Staffs List | `/admin/staffs` | Admin |
| Add Staff | `/admin/staffs/add` | Admin |
| Edit Staff | `/admin/staffs/edit/:id` | Admin |
| Staff Setup (Dept/Desig) | `/admin/staff-setup` | Admin |

---

## 💸 11. PAYROLL MANAGEMENT

### 11.1 Unified Payroll Profile
- Single payroll profile for both Teachers and Staff
- Bank account details: account name, number, routing number, bank, branch
- Salary structure: Basic, House Rent, Medical Allowance, Transport, Other
- PF deduction percentage
- Tax deduction percentage
- Active/inactive status

### 11.2 Payroll Attendance
- Daily attendance: Present / Absent / Late / Half-Day
- Check-in / check-out time
- Unique per employee per date

### 11.3 Leave Management
- Leave types: Casual, Sick, Earned, Maternity, Paternity, Unpaid
- Start date, end date (auto-calculated total days)
- Status: Pending / Approved / Rejected
- Approved by admin

### 11.4 Loan / Advance Salary
- Employee loans with total amount
- Monthly EMI
- Remaining balance tracking
- Purpose of loan
- Active/closed status

### 11.5 Monthly Salary (Payslip)
- Per-employee monthly salary record
- All allowances: Basic, House Rent, Medical, Transport, Other
- Bonus
- All deductions: PF, Tax, Loan EMI, Unpaid leave, Other
- Net payable auto-calculation
- Payment status: Unpaid / Paid
- Generated by admin

### 11.6 PDF Generation (3 Types)
1. **Payslip PDF** — Individual employee monthly payslip with all earnings & deductions
2. **Salary Statement PDF** — Statement for a specific employee for a period
3. **Collective Statement PDF** — Bulk salary sheet for all employees in a month

### 11.7 Frontend Pages
| Page | Path | User |
|------|------|------|
| Payroll Management | `/admin/payroll` | Admin |

---

## 📢 12. CMS (CONTENT MANAGEMENT SYSTEM)

### 12.1 Hero Slides (Homepage Banner)
- Image + title (EN/BN)
- Subtitle (EN/BN)
- Two CTA buttons with custom text and links
- Order control
- Active/inactive

### 12.2 Notices
- Title and description (EN/BN)
- Categories: Academic, Administrative, Exam, Event, General
- Date, PDF file attachment
- Active/inactive

### 12.3 Events
- Cover image, title (EN/BN)
- Date/time, venue
- Description (EN/BN)
- Status: Upcoming / Past
- Registration link (optional)

### 12.4 Event Gallery
- Multiple images per event
- Caption (EN/BN)
- Sort order

### 12.5 Event Registration
- Public event registration
- Name, email, phone, message

### 12.6 FAQs
- Question & Answer (EN/BN)
- Categories (Admissions, Academic, General)
- Sort order, active/inactive

### 12.7 Blog
- Title, slug, description (EN/BN)
- Image, author, date
- Auto-slug generation

### 12.8 Contact Messages
- Public contact form submissions
- Name, email, subject, message
- Read/unread tracking

### 12.9 Frontend Pages
| Page | Path | User |
|------|------|------|
| Home | `/` | Public |
| About Us | `/about-us` | Public |
| Notice Board | `/notice-board` | Public |
| Contact Us | `/contact-us` | Public |
| Admissions | `/admissions` | Public |
| Events | `/events` | Public |
| Event Gallery | `/events/:id/gallery` | Public |
| Event Registration | `/events/:id/register` | Public |
| Teachers Corner | `/teachers-corner` | Public |
| Blogs | `/blogs` | Public |
| Add Notice | `/admin/notices/add` | Admin |
| Add Event | `/admin/events/add` | Admin |

---

## 📱 13. NOTIFICATION & MESSAGING SYSTEM

### 13.1 Internal Notifications
- System-level messages: sender → recipient
- Read/unread tracking

### 13.2 Parent-Teacher Messaging
- Teacher sends message to student's parent
- Message body + optional image
- Read status tracking
- **Reply threads**: both parent and teacher can reply
- Full conversation history

### 13.3 SMS / WhatsApp Gateway
- SMS log for all sent messages
- Types: Attendance, Result, Fee Reminder, Custom Bulk
- Status: Sent / Failed
- Recipient phone tracking

### 13.4 Frontend Pages
| Page | Path | User |
|------|------|------|
| SMS Gateway | `/admin/sms-gateway` | Admin |
| Teacher Messages | `/teacher/messages` | Teacher |
| Parent Messages | `/parent/messages` | Parent |

---

## 💼 14. RECRUITMENT SYSTEM

### 14.1 Job Postings
- Job title, department, description
- Requirements, vacancies, deadline
- Active/inactive status

### 14.2 Applications
- Applicant name, email, phone
- Resume file upload
- Cover letter
- Status pipeline: Applied → Shortlisted → Selected → Rejected
- Internal notes

### 14.3 Frontend Pages
| Page | Path | User |
|------|------|------|
| Careers | `/careers` | Public |
| Recruitment Admin | `/admin/recruitment` | Admin |

---

## 📊 15. DASHBOARD & ANALYTICS

### 15.1 Admin Dashboard
- Total students, teachers, staff counts
- Fee collection summary
- Attendance overview
- Recent transactions
- Quick access to all modules

### 15.2 Teacher Dashboard
- Assigned classes and subjects
- Today's routine
- Recent class history

### 15.3 Student Dashboard
- Personal attendance summary
- Upcoming exams
- Fee status
- Recent results

### 15.4 Parent Dashboard
- Child's attendance summary
- Recent results
- Fee due status
- Unread messages count

---

## 📄 16. PDF GENERATION SUMMARY

| # | PDF Document | Module | Purpose |
|---|-------------|--------|---------|
| 1 | Accounts Report | Accounts | Income/Expense period report |
| 2 | Exam Routine | Exams | Full exam schedule |
| 3 | Tabulation Sheet | Exams | Complete class result sheet |
| 4 | Individual Marksheet | Exams | Student result with GPA |
| 5 | Admit Cards (Bulk) | Exams | Class-wide admit cards |
| 6 | Payment Receipt | Payments | Fee payment receipt |
| 7 | Student ID Card | Students | Individual student ID |
| 8 | Student Attendance Report | Students | Attendance history |
| 9 | Teacher ID Card | Teachers | Individual teacher ID |
| 10 | Teacher Appointment Letter | Teachers | Official appointment |
| 11 | Staff Appointment Letter | Staffs | Official appointment |
| 12 | Payslip | Payroll | Monthly salary slip |
| 13 | Salary Statement | Payroll | Employee salary statement |
| 14 | Collective Salary Statement | Payroll | Bulk monthly salary sheet |

---

## 🛡️ 17. SECURITY FEATURES

- JWT Authentication on all API endpoints
- Role-based access control (Admin/Teacher/Student/Parent)
- Password encryption (Django AbstractUser)
- CORS protection (allowed origins whitelist)
- Password change by admin only
- User search with role filtering

---

## 📊 SUMMARY: COMPLETE FEATURE COUNT

| # | Module | Features |
|---|--------|---------|
| 1 | **User & Auth** | 4 roles, JWT auth, password management, user search |
| 2 | **Academics** | Classes, sections, groups, subjects, weekly routine |
| 3 | **Teachers** | CRUD, attendance, class history, ID card, appointment letter |
| 4 | **Students** | CRUD, attendance, monthly summary, ID card, attendance report |
| 5 | **Parent Portal** | Dashboard, profile, attendance, results, fees, messaging |
| 6 | **Exams** | Exams, subject exams, grades, results, class tests, 4 PDFs |
| 7 | **Payments** | Fee categories, collection, multi-item receipt, reports, PDF |
| 8 | **Accounts** | Heads, daily transactions, income/expense tracking, PDF |
| 9 | **Inventory** | Categories, products, stock tracking, distribution |
| 10 | **Staff** | Departments, designations, CRUD, appointment letter |
| 11 | **Payroll** | Profiles, attendance, leave, loans, salary, 3 PDFs |
| 12 | **CMS** | Hero slides, notices, events, gallery, FAQs, blogs, contacts |
| 13 | **Notifications** | Internal messages, parent-teacher chat, SMS gateway |
| 14 | **Recruitment** | Job postings, applications, status pipeline |
| 15 | **Dashboards** | 4 role-specific dashboards with analytics |

---

## 🎯 KEY SELLING POINTS FOR PRESENTATION

1. **All-in-One Solution** — Single platform for managing everything from students to payroll
2. **Multi-Role System** — Admin, Teacher, Student, Parent — each with their own portal
3. **14+ PDF Documents** — Professionally generated PDFs for all official needs
4. **Parent Portal** — Real-time child tracking: attendance, results, fees, teacher messaging
5. **Complete Examination System** — From routine to admit card to tabulation sheet to marksheet
6. **Payroll + HR** — Teacher & Staff unified payroll with attendance, leave, loans
7. **Financial Accounting** — Fee collection, income/expense bookkeeping, inventory
8. **Public Website** — CMS with hero slider, notices, events, blogs, careers
9. **Bilingual Support** — English and Bengali (BN) content throughout
10. **Secure & Scalable** — JWT auth, PostgreSQL, REST API architecture
11. **Responsive Design** — Modern React frontend, works on all devices