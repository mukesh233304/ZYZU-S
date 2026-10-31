-- FOCUSPOINT Database Schema: Phase 1 & Phase 2 Complete Relational Schema

PRAGMA foreign_keys = ON;

-- 1. Roles table
CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT
);

-- 2. Permissions table
CREATE TABLE IF NOT EXISTS permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT
);

-- 3. Role-Permissions junction table
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- 4. Districts table
CREATE TABLE IF NOT EXISTS districts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    state TEXT NOT NULL DEFAULT 'Uttar Pradesh',
    code TEXT UNIQUE NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1
);

-- 5. Core Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL COLLATE NOCASE,
    mobile TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role_id INTEGER NOT NULL REFERENCES roles(id),
    district_id INTEGER REFERENCES districts(id),
    account_status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(account_status IN ('ACTIVE', 'PENDING_APPROVAL', 'SUSPENDED', 'REJECTED', 'INACTIVE')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login_at DATETIME
);

-- 6. User Roles junction table
CREATE TABLE IF NOT EXISTS user_roles (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
);

-- 7. Student Profiles (Extended for Phase 2)
CREATE TABLE IF NOT EXISTS student_profiles (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    dob TEXT NOT NULL,
    gender TEXT NOT NULL,
    city_area TEXT NOT NULL,
    address TEXT NOT NULL,
    pincode TEXT NOT NULL,
    profile_photo_url TEXT,
    school_college TEXT,
    grade_class TEXT,
    stream_subjects TEXT,
    target_goals TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 8. Teacher Profiles (Extended for Phase 2)
CREATE TABLE IF NOT EXISTS teacher_profiles (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    gender TEXT NOT NULL,
    dob TEXT NOT NULL,
    qualification TEXT NOT NULL,
    experience_years INTEGER NOT NULL DEFAULT 0,
    subjects TEXT NOT NULL, -- JSON array string
    classes TEXT NOT NULL,  -- JSON array string
    specialization TEXT,
    teaching_mode TEXT NOT NULL CHECK(teaching_mode IN ('ONLINE', 'OFFLINE', 'BOTH')),
    areas_served TEXT NOT NULL,
    expected_fee REAL NOT NULL DEFAULT 0,
    availability TEXT NOT NULL,
    address TEXT NOT NULL,
    profile_photo_url TEXT,
    verification_doc_urls TEXT, -- JSON array string
    is_publicly_visible INTEGER NOT NULL DEFAULT 0,
    bio TEXT,
    admin_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 9. Library Owner Profiles
CREATE TABLE IF NOT EXISTS library_owner_profiles (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    owner_name TEXT NOT NULL,
    address TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 10. District Admins (Enforcing strictly ONE active admin per district)
CREATE TABLE IF NOT EXISTS district_admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    district_id INTEGER NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'INACTIVE')),
    assigned_by TEXT REFERENCES users(id),
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 11. OTPs table
CREATE TABLE IF NOT EXISTS otps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    identifier TEXT NOT NULL,
    otp_code TEXT NOT NULL,
    purpose TEXT NOT NULL CHECK(purpose IN ('LOGIN', 'PASSWORD_RESET', 'VERIFICATION')),
    expires_at DATETIME NOT NULL,
    consumed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 12. Sessions
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- PHASE 2 EXTENSION TABLES: DASHBOARDS & ACADEMIC MANAGEMENT
-- =========================================================

-- 13. Teacher-Student Active Assignments (Tutoring enrollments)
CREATE TABLE IF NOT EXISTS teacher_student_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    teacher_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    monthly_fee REAL NOT NULL DEFAULT 0,
    teaching_mode TEXT NOT NULL DEFAULT 'OFFLINE' CHECK(teaching_mode IN ('ONLINE', 'OFFLINE', 'BOTH')),
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'PAUSED', 'COMPLETED')),
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 14. Attendance Records (Tutoring & Library attendance)
CREATE TABLE IF NOT EXISTS attendance_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    teacher_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    library_id INTEGER REFERENCES libraries(id) ON DELETE SET NULL,
    date TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('PRESENT', 'ABSENT', 'LATE', 'LEAVE')),
    type TEXT NOT NULL DEFAULT 'TUTOR' CHECK(type IN ('TUTOR', 'LIBRARY')),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 15. Fee Records & Ledgers (Tutor dues, Library dues)
CREATE TABLE IF NOT EXISTS fee_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    teacher_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    library_id INTEGER REFERENCES libraries(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK(type IN ('TUTOR', 'LIBRARY')),
    title TEXT NOT NULL,
    amount REAL NOT NULL,
    due_date TEXT NOT NULL,
    paid_date TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'PAID', 'OVERDUE')),
    receipt_no TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 16. Study Libraries
CREATE TABLE IF NOT EXISTS libraries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    district_id INTEGER NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    total_seats INTEGER NOT NULL DEFAULT 50,
    amenities TEXT, -- JSON array of strings
    operating_hours TEXT DEFAULT '6:00 AM - 11:00 PM',
    morning_fee REAL NOT NULL DEFAULT 600,
    evening_fee REAL NOT NULL DEFAULT 600,
    fullday_fee REAL NOT NULL DEFAULT 1000,
    status TEXT NOT NULL DEFAULT 'PENDING_APPROVAL' CHECK(status IN ('PENDING_APPROVAL', 'ACTIVE', 'INACTIVE')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 17. Library Shifts
CREATE TABLE IF NOT EXISTS library_shifts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    library_id INTEGER NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    fee REAL NOT NULL DEFAULT 600
);

-- 18. Library Seats (Grid Management)
CREATE TABLE IF NOT EXISTS library_seats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    library_id INTEGER NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
    seat_number TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK(status IN ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE')),
    UNIQUE(library_id, seat_number)
);

-- 19. Library Student Enrollments
CREATE TABLE IF NOT EXISTS library_enrollments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    library_id INTEGER NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seat_id INTEGER REFERENCES library_seats(id) ON DELETE SET NULL,
    shift_id INTEGER REFERENCES library_shifts(id) ON DELETE SET NULL,
    monthly_fee REAL NOT NULL DEFAULT 600,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'EXPIRED', 'CANCELLED')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 20. Booking & Enquiry Requests (Phase 3 Extended)
CREATE TABLE IF NOT EXISTS booking_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    district_id INTEGER NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL CHECK(target_type IN ('TEACHER', 'LIBRARY')),
    teacher_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    library_id INTEGER REFERENCES libraries(id) ON DELETE SET NULL,
    subject_or_shift TEXT NOT NULL,
    message TEXT,
    preferred_mode TEXT DEFAULT 'OFFLINE' CHECK(preferred_mode IN ('OFFLINE', 'ONLINE', 'BOTH')),
    preferred_seat_id INTEGER REFERENCES library_seats(id) ON DELETE SET NULL,
    shift_id INTEGER REFERENCES library_shifts(id) ON DELETE SET NULL,
    start_date TEXT,
    response_note TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 21. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'INFO' CHECK(type IN ('INFO', 'SUCCESS', 'WARNING', 'ALERT')),
    is_read INTEGER NOT NULL DEFAULT 0,
    link TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 22. Support Tickets Table
CREATE TABLE IF NOT EXISTS support_tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    district_id INTEGER REFERENCES districts(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK(status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED')),
    priority TEXT NOT NULL DEFAULT 'NORMAL' CHECK(priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
    admin_response TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 23. Teacher Weekly Schedules
CREATE TABLE IF NOT EXISTS teacher_schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    teacher_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day_of_week TEXT NOT NULL, -- Monday, Tuesday, etc.
    start_time TEXT NOT NULL,  -- e.g. 16:00
    end_time TEXT NOT NULL,    -- e.g. 17:30
    title TEXT NOT NULL,       -- e.g. Class 10 Board Math
    teaching_mode TEXT NOT NULL DEFAULT 'OFFLINE',
    student_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- INDEXES & CONSTRAINTS
-- =========================================================

-- Business rule: Exactly ONE ACTIVE District Admin per District
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_district_admin
ON district_admins (district_id)
WHERE status = 'ACTIVE';

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_mobile ON users(mobile);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_district ON users(district_id);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(account_status);
CREATE INDEX IF NOT EXISTS idx_assignments_teacher ON teacher_student_assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_assignments_student ON teacher_student_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_fee_student ON fee_records(student_id);
CREATE INDEX IF NOT EXISTS idx_libraries_district ON libraries(district_id);
CREATE INDEX IF NOT EXISTS idx_libraries_owner ON libraries(owner_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_bookings_student ON booking_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_bookings_teacher ON booking_requests(teacher_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_library ON booking_requests(library_id, status);
CREATE INDEX IF NOT EXISTS idx_teacher_public_active ON teacher_profiles(is_publicly_visible);
CREATE INDEX IF NOT EXISTS idx_support_user ON support_tickets(user_id);

-- =========================================================
-- PHASE 4: DEMO BOOKING SYSTEM & PRICING HIERARCHY
-- =========================================================

-- 24. Demo Pricing Rules
CREATE TABLE IF NOT EXISTS demo_pricing_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_type TEXT NOT NULL CHECK(service_type IN ('LIBRARY', 'HOME_TUITION')),
    scope_type TEXT NOT NULL CHECK(scope_type IN ('PAN_INDIA', 'STATE', 'DISTRICT', 'PARTICULAR')),
    state TEXT,
    district TEXT,
    service_id TEXT,
    service_name TEXT,
    price REAL NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    start_date TEXT NOT NULL,
    end_date TEXT,
    created_by TEXT REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 25. Demo Bookings
CREATE TABLE IF NOT EXISTS demo_bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    demo_booking_id TEXT UNIQUE NOT NULL,
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_type TEXT NOT NULL CHECK(service_type IN ('LIBRARY', 'HOME_TUITION')),
    library_id INTEGER REFERENCES libraries(id) ON DELETE SET NULL,
    teacher_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    service_name TEXT NOT NULL,
    subject_or_shift TEXT,
    state TEXT NOT NULL DEFAULT 'Uttar Pradesh',
    district TEXT NOT NULL DEFAULT 'Ghazipur',
    demo_date TEXT NOT NULL,
    demo_time TEXT NOT NULL,
    price REAL NOT NULL DEFAULT 0,
    payment_status TEXT NOT NULL DEFAULT 'PENDING' CHECK(payment_status IN ('PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED', 'FREE')),
    payment_transaction_id TEXT,
    payment_method TEXT,
    paid_at DATETIME,
    booking_status TEXT NOT NULL DEFAULT 'CONFIRMED' CHECK(booking_status IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'EXPIRED')),
    qr_code_data TEXT,
    pricing_scope_used TEXT,
    verified_at DATETIME,
    verified_by TEXT REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Constraint: Strictly ONE Demo per Student per Service Category (Library vs Tuition)
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_demo_per_student_service
ON demo_bookings (student_id, service_type)
WHERE payment_status IN ('PAID', 'PENDING');

CREATE INDEX IF NOT EXISTS idx_demo_pricing_lookup ON demo_pricing_rules(service_type, is_active, scope_type);
CREATE INDEX IF NOT EXISTS idx_demo_bookings_student ON demo_bookings(student_id);
CREATE INDEX IF NOT EXISTS idx_demo_bookings_booking_id ON demo_bookings(demo_booking_id);
CREATE INDEX IF NOT EXISTS idx_demo_bookings_service ON demo_bookings(service_type, booking_status);

-- =========================================================
-- PHASE 5: ADVANCED LIBRARY LISTING SUBSCRIPTION SYSTEM
-- =========================================================

-- 26. Library Subscription Plans
CREATE TABLE IF NOT EXISTS library_subscription_plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    billing_cycle TEXT NOT NULL CHECK(billing_cycle IN ('MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY', 'CUSTOM')),
    duration_months INTEGER NOT NULL,
    duration_days INTEGER NOT NULL,
    base_price REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'INACTIVE', 'ARCHIVED')),
    is_popular INTEGER NOT NULL DEFAULT 0,
    savings_percent INTEGER NOT NULL DEFAULT 0,
    features TEXT, -- JSON array of feature strings
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 27. Library Subscription Pricing Rules (4-Tier Priority Engine)
CREATE TABLE IF NOT EXISTS library_subscription_pricing_rules (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    scope_type TEXT NOT NULL CHECK(scope_type IN ('PAN_INDIA', 'STATE', 'DISTRICT', 'PARTICULAR')),
    state TEXT,
    district TEXT,
    library_id TEXT,
    library_name TEXT,
    plan_id TEXT REFERENCES library_subscription_plans(id) ON DELETE SET NULL,
    price REAL NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'INACTIVE', 'EXPIRED')),
    effective_from TEXT NOT NULL,
    effective_until TEXT,
    price_protection TEXT NOT NULL DEFAULT 'LOCKED' CHECK(price_protection IN ('NONE', 'LOCKED', 'PROMOTIONAL')),
    locked_cycles INTEGER DEFAULT 1,
    refund_policy TEXT NOT NULL DEFAULT 'FULL_24H' CHECK(refund_policy IN ('FULL_24H', 'FULL_MINUS_GATEWAY_FEE', 'PARTIAL_50', 'NO_REFUND')),
    grace_period_days INTEGER NOT NULL DEFAULT 7,
    created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 28. Library Subscriptions
CREATE TABLE IF NOT EXISTS library_subscriptions (
    id TEXT PRIMARY KEY,
    library_id INTEGER NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
    owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL REFERENCES library_subscription_plans(id),
    plan_name TEXT NOT NULL,
    billing_cycle TEXT NOT NULL,
    base_price REAL NOT NULL,
    pricing_scope TEXT NOT NULL,
    applied_rule_id TEXT REFERENCES library_subscription_pricing_rules(id) ON DELETE SET NULL,
    offer_discount REAL NOT NULL DEFAULT 0,
    coupon_code TEXT,
    coupon_discount REAL NOT NULL DEFAULT 0,
    final_paid_amount REAL NOT NULL DEFAULT 0,
    is_free INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('DRAFT', 'PAYMENT_REQUIRED', 'PAYMENT_PENDING', 'ACTIVE', 'TRIAL', 'GRACE_PERIOD', 'CANCEL_REQUESTED', 'CANCELLED', 'EXPIRED', 'PAUSED', 'SUSPENDED', 'REFUND_PENDING', 'REFUNDED', 'FAILED')),
    start_date TEXT NOT NULL,
    expiry_date TEXT NOT NULL,
    activated_at DATETIME,
    cancellation_deadline DATETIME,
    auto_renew INTEGER NOT NULL DEFAULT 1,
    grace_period_days INTEGER NOT NULL DEFAULT 7,
    price_locked REAL,
    payment_method TEXT,
    transaction_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 29. Library Subscription Financial Ledger / Payments
CREATE TABLE IF NOT EXISTS library_subscription_payments (
    id TEXT PRIMARY KEY,
    subscription_id TEXT NOT NULL REFERENCES library_subscriptions(id) ON DELETE CASCADE,
    library_id INTEGER NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
    owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invoice_no TEXT UNIQUE NOT NULL,
    amount REAL NOT NULL,
    payment_method TEXT NOT NULL,
    transaction_id TEXT,
    status TEXT NOT NULL DEFAULT 'SUCCESS' CHECK(status IN ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED')),
    paid_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    receipt_url TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 30. Library Subscription 24-Hour Cancellations & Refunds
CREATE TABLE IF NOT EXISTS library_subscription_cancellations (
    id TEXT PRIMARY KEY,
    subscription_id TEXT NOT NULL REFERENCES library_subscriptions(id) ON DELETE CASCADE,
    library_id INTEGER NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
    owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason_category TEXT NOT NULL CHECK(reason_category IN ('TOO_EXPENSIVE', 'NOT_USING', 'SWITCHING_SERVICE', 'TECHNICAL_ISSUES', 'CLOSED_LIBRARY', 'OTHER')),
    reason_text TEXT,
    requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    refund_amount REAL NOT NULL DEFAULT 0,
    refund_status TEXT NOT NULL DEFAULT 'COMPLETED' CHECK(refund_status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'REJECTED')),
    policy_applied TEXT NOT NULL,
    admin_notes TEXT,
    processed_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    processed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 31. Library Subscription Audit Events
CREATE TABLE IF NOT EXISTS library_subscription_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subscription_id TEXT REFERENCES library_subscriptions(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    actor_id TEXT,
    actor_role TEXT,
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performant lookups
CREATE INDEX IF NOT EXISTS idx_lib_sub_rules_lookup ON library_subscription_pricing_rules(scope_type, status);
CREATE INDEX IF NOT EXISTS idx_lib_sub_rules_state ON library_subscription_pricing_rules(state);
CREATE INDEX IF NOT EXISTS idx_lib_sub_rules_district ON library_subscription_pricing_rules(district);
CREATE INDEX IF NOT EXISTS idx_lib_sub_owner ON library_subscriptions(owner_id);
CREATE INDEX IF NOT EXISTS idx_lib_sub_library ON library_subscriptions(library_id);
CREATE INDEX IF NOT EXISTS idx_lib_sub_status ON library_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_lib_sub_payments_sub ON library_subscription_payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_lib_sub_payments_invoice ON library_subscription_payments(invoice_no);
CREATE INDEX IF NOT EXISTS idx_lib_sub_cancellations_sub ON library_subscription_cancellations(subscription_id);

-- ============================================================================
-- PHASE 6: ACADEMIC INTELLIGENCE, GOVT EXAMS, MOCK TESTS & MISTAKE BOOK
-- ============================================================================

-- 32. Government / Competitive Exams Master
CREATE TABLE IF NOT EXISTS government_exams (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    eligibility TEXT,
    total_marks INTEGER NOT NULL DEFAULT 100,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    negative_marking_ratio REAL NOT NULL DEFAULT 0.25,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 33. Exam Subjects
CREATE TABLE IF NOT EXISTS exam_subjects (
    id TEXT PRIMARY KEY,
    exam_id TEXT NOT NULL REFERENCES government_exams(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    weightage_marks INTEGER DEFAULT 25,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 34. Exam Topics
CREATE TABLE IF NOT EXISTS exam_topics (
    id TEXT PRIMARY KEY,
    subject_id TEXT NOT NULL REFERENCES exam_subjects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 35. Question Bank
CREATE TABLE IF NOT EXISTS question_bank (
    id TEXT PRIMARY KEY,
    subject_name TEXT NOT NULL,
    topic_name TEXT NOT NULL,
    exam_category TEXT NOT NULL,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL DEFAULT 'MCQ' CHECK(question_type IN ('MCQ', 'MULTIPLE_CORRECT', 'TRUE_FALSE', 'NUMERICAL', 'ASSERTION_REASON')),
    options TEXT NOT NULL, -- JSON array of options: [{"id": "opt_1", "text": "..."}]
    correct_option_ids TEXT NOT NULL, -- JSON array: ["opt_2"]
    explanation TEXT NOT NULL,
    difficulty TEXT NOT NULL DEFAULT 'MEDIUM' CHECK(difficulty IN ('EASY', 'MEDIUM', 'HARD')),
    marks REAL NOT NULL DEFAULT 2.0,
    negative_marks REAL NOT NULL DEFAULT 0.5,
    status TEXT NOT NULL DEFAULT 'AI_GENERATED' CHECK(status IN ('DRAFT', 'AI_GENERATED', 'APPROVED', 'PUBLISHED', 'ARCHIVED')),
    created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 36. Mock Tests
CREATE TABLE IF NOT EXISTS mock_tests (
    id TEXT PRIMARY KEY,
    exam_id TEXT NOT NULL REFERENCES government_exams(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    test_type TEXT NOT NULL DEFAULT 'FULL_LENGTH' CHECK(test_type IN ('FULL_LENGTH', 'SECTIONAL', 'RAPID_QUIZ')),
    total_questions INTEGER NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    total_marks REAL NOT NULL DEFAULT 100.0,
    passing_percentage REAL NOT NULL DEFAULT 40.0,
    negative_marking_ratio REAL NOT NULL DEFAULT 0.25,
    is_published INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 37. Mock Test Questions junction
CREATE TABLE IF NOT EXISTS mock_test_questions (
    mock_test_id TEXT NOT NULL REFERENCES mock_tests(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL REFERENCES question_bank(id) ON DELETE CASCADE,
    question_order INTEGER NOT NULL,
    PRIMARY KEY (mock_test_id, question_id)
);

-- 38. Mock Test Attempts
CREATE TABLE IF NOT EXISTS mock_test_attempts (
    id TEXT PRIMARY KEY,
    mock_test_id TEXT NOT NULL REFERENCES mock_tests(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    duration_seconds INTEGER DEFAULT 0,
    total_marks_obtained REAL DEFAULT 0,
    max_marks REAL NOT NULL,
    percentage REAL DEFAULT 0,
    accuracy REAL DEFAULT 0,
    questions_attempted INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    incorrect_answers INTEGER DEFAULT 0,
    unanswered INTEGER DEFAULT 0,
    negative_deductions REAL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'IN_PROGRESS' CHECK(status IN ('IN_PROGRESS', 'SUBMITTED', 'EVALUATED', 'EXPIRED')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 39. Mock Test Answers
CREATE TABLE IF NOT EXISTS mock_test_answers (
    id TEXT PRIMARY KEY,
    attempt_id TEXT NOT NULL REFERENCES mock_test_attempts(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL REFERENCES question_bank(id) ON DELETE CASCADE,
    selected_option_ids TEXT, -- JSON array
    is_marked_for_review INTEGER DEFAULT 0,
    is_correct INTEGER DEFAULT 0,
    time_spent_seconds INTEGER DEFAULT 0,
    marks_awarded REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 39b. Custom Mock Drill Requests (Operator-Controlled Student Practice Requests)
CREATE TABLE IF NOT EXISTS custom_mock_drill_requests (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    exam_id TEXT NOT NULL REFERENCES government_exams(id),
    exam_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    chapter TEXT,
    topic TEXT,
    difficulty TEXT NOT NULL DEFAULT 'MODERATE',
    question_count INTEGER NOT NULL DEFAULT 25,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    language TEXT NOT NULL DEFAULT 'Hindi',
    test_type TEXT NOT NULL DEFAULT 'Chapter Drill',
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'REQUESTED',
    operator_message TEXT,
    assigned_operator_id TEXT,
    assigned_operator_name TEXT,
    generated_mock_test_id TEXT,
    priority TEXT NOT NULL DEFAULT 'MEDIUM',
    estimated_availability TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    published_at DATETIME
);

-- 40. Student Test Records (Teacher input & external test tracking)
CREATE TABLE IF NOT EXISTS student_test_records (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    teacher_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    topic TEXT,
    test_name TEXT NOT NULL,
    test_type TEXT NOT NULL DEFAULT 'HOME_TUITION' CHECK(test_type IN ('HOME_TUITION', 'GOVT_MOCK', 'SELF_PRACTICE')),
    marks_obtained REAL NOT NULL,
    total_marks REAL NOT NULL,
    percentage REAL NOT NULL,
    remarks TEXT,
    test_date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 41. Student Mistake Book
CREATE TABLE IF NOT EXISTS student_mistake_book (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL REFERENCES question_bank(id) ON DELETE CASCADE,
    attempt_id TEXT REFERENCES mock_test_attempts(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    user_incorrect_answers TEXT, -- JSON array
    status TEXT NOT NULL DEFAULT 'NEEDS_REVISION' CHECK(status IN ('NEEDS_REVISION', 'MASTERED')),
    retries_count INTEGER DEFAULT 0,
    last_retried_at DATETIME,
    personal_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 42. Academic Thresholds & Policies
CREATE TABLE IF NOT EXISTS academic_thresholds (
    id TEXT PRIMARY KEY,
    scope TEXT NOT NULL DEFAULT 'GLOBAL' CHECK(scope IN ('GLOBAL', 'DISTRICT')),
    district_id INTEGER REFERENCES districts(id) ON DELETE CASCADE,
    weak_subject_cutoff REAL NOT NULL DEFAULT 60.0,
    strong_subject_cutoff REAL NOT NULL DEFAULT 80.0,
    minimum_tests_required INTEGER NOT NULL DEFAULT 2,
    updated_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 43. AI Question Generation Jobs
CREATE TABLE IF NOT EXISTS ai_question_generation_jobs (
    id TEXT PRIMARY KEY,
    subject_name TEXT NOT NULL,
    exam_category TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    question_count INTEGER NOT NULL,
    generated_questions_count INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'COMPLETED' CHECK(status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
    created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 44. Academic Subscriptions & Passes
CREATE TABLE IF NOT EXISTS academic_subscriptions (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_type TEXT NOT NULL CHECK(product_type IN ('EXAM_PASS', 'TEST_SERIES', 'STUDY_PACKAGE', 'SUBJECT_BUNDLE', 'PREMIUM_MENTORSHIP')),
    product_id TEXT NOT NULL,
    product_title TEXT NOT NULL,
    exam_id TEXT REFERENCES government_exams(id) ON DELETE SET NULL,
    base_price REAL NOT NULL,
    discount_amount REAL NOT NULL DEFAULT 0,
    coupon_code TEXT,
    tax_amount REAL NOT NULL DEFAULT 0,
    final_price REAL NOT NULL,
    source TEXT NOT NULL DEFAULT 'DIRECT_PURCHASE' CHECK(source IN ('DIRECT_PURCHASE', 'LIBRARY_BOOKING', 'TEACHER_ALLOTMENT', 'ADMIN_GRANT')),
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'EXPIRING_SOON', 'EXPIRED', 'CANCELLED')),
    features TEXT, -- JSON array of feature strings
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    order_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 45. Academic Priority Pricing Rules (6-tier hierarchy)
CREATE TABLE IF NOT EXISTS academic_pricing_rules (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    product_type TEXT NOT NULL,
    scope TEXT NOT NULL CHECK(scope IN ('PAN_INDIA', 'STATE', 'DISTRICT', 'LIBRARY', 'TEACHER', 'STUDENT')),
    target_id TEXT, -- State name, district id, library id, teacher user_id, or student user_id
    base_price REAL NOT NULL,
    discount_percentage REAL NOT NULL DEFAULT 0,
    override_price REAL,
    is_active INTEGER NOT NULL DEFAULT 1,
    priority INTEGER NOT NULL DEFAULT 0, -- 1=PanIndia, 2=State, 3=District, 4=Library, 5=Teacher, 6=Student
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 46. Academic Eligibility Rules
CREATE TABLE IF NOT EXISTS academic_eligibility_rules (
    id TEXT PRIMARY KEY,
    exam_id TEXT NOT NULL REFERENCES government_exams(id) ON DELETE CASCADE,
    min_class INTEGER,
    max_class INTEGER,
    allowed_streams TEXT, -- JSON array e.g. ["SCIENCE_PCM", "SCIENCE_PCB"]
    min_age INTEGER,
    max_age INTEGER,
    required_state TEXT,
    notes TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 47. Previous Year Question Papers (PYQ Vault)
CREATE TABLE IF NOT EXISTS pyq_papers (
    id TEXT PRIMARY KEY,
    exam_id TEXT NOT NULL REFERENCES government_exams(id) ON DELETE CASCADE,
    exam_name TEXT NOT NULL,
    exam_category TEXT NOT NULL,
    exam_year INTEGER NOT NULL,
    tier_or_stage TEXT NOT NULL DEFAULT 'Tier-1',
    exam_date TEXT NOT NULL,
    shift TEXT NOT NULL DEFAULT 'Shift 1',
    shift_timing TEXT,
    paper_code TEXT,
    language TEXT NOT NULL DEFAULT 'Bilingual (Hindi + English)',
    total_questions INTEGER NOT NULL,
    total_marks REAL NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    negative_marking REAL NOT NULL DEFAULT 0.25,
    sections_json TEXT NOT NULL, -- JSON array of sectional blueprint
    master_paper_pdf_url TEXT,
    official_answer_key_url TEXT,
    solved_solutions_pdf_url TEXT,
    is_cbt_available INTEGER NOT NULL DEFAULT 0,
    linked_cbt_mock_test_id TEXT REFERENCES mock_tests(id) ON DELETE SET NULL,
    ocr_confidence_score REAL DEFAULT 98.5,
    digitized_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'PUBLISHED' CHECK(status IN ('DRAFT', 'NEEDS_VERIFICATION', 'PUBLISHED', 'ARCHIVED')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Academic Intelligence performance
CREATE INDEX IF NOT EXISTS idx_qb_exam_category ON question_bank(exam_category);
CREATE INDEX IF NOT EXISTS idx_qb_subject ON question_bank(subject_name);
CREATE INDEX IF NOT EXISTS idx_qb_status ON question_bank(status);
CREATE INDEX IF NOT EXISTS idx_mock_tests_exam ON mock_tests(exam_id);
CREATE INDEX IF NOT EXISTS idx_mock_attempts_student ON mock_test_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_mock_attempts_test ON mock_test_attempts(mock_test_id);
CREATE INDEX IF NOT EXISTS idx_mock_answers_attempt ON mock_test_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_student_tests_student ON student_test_records(student_id);
CREATE INDEX IF NOT EXISTS idx_student_tests_teacher ON student_test_records(teacher_id);
CREATE INDEX IF NOT EXISTS idx_mistake_book_student ON student_mistake_book(student_id);
CREATE INDEX IF NOT EXISTS idx_mistake_book_status ON student_mistake_book(status);
CREATE INDEX IF NOT EXISTS idx_academic_subs_student ON academic_subscriptions(student_id);
CREATE INDEX IF NOT EXISTS idx_academic_pricing_scope ON academic_pricing_rules(scope, target_id);
CREATE INDEX IF NOT EXISTS idx_pyq_exam_year ON pyq_papers(exam_id, exam_year);

-- ============================================================================
-- 48. Pan-India Location Master: Countries
-- ============================================================================
CREATE TABLE IF NOT EXISTS countries (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    code TEXT UNIQUE NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    phone_code TEXT NOT NULL DEFAULT '+91',
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'INACTIVE')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 49. Pan-India Location Master: States & Union Territories (28 States + 8 UTs)
-- ============================================================================
CREATE TABLE IF NOT EXISTS states_ut (
    id TEXT PRIMARY KEY,
    country_id TEXT NOT NULL DEFAULT 'loc-country-in' REFERENCES countries(id),
    name TEXT UNIQUE NOT NULL,
    code TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL DEFAULT 'STATE' CHECK(type IN ('STATE', 'UT')),
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'INACTIVE')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 50. Pan-India Location Master: Localities (Towns, Cities, Villages, Blocks)
-- ============================================================================
CREATE TABLE IF NOT EXISTS localities (
    id TEXT PRIMARY KEY,
    district_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'TOWN' CHECK(type IN ('CITY', 'TOWN', 'VILLAGE', 'URBAN_ZONE', 'BLOCK')),
    pincode TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'INACTIVE')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 51. Pan-India Location Master: Areas / Micro-Zones
-- ============================================================================
CREATE TABLE IF NOT EXISTS areas (
    id TEXT PRIMARY KEY,
    locality_id TEXT NOT NULL REFERENCES localities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    landmark TEXT,
    pincode TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'INACTIVE')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 52. Advertisement Engine: Campaigns & Placements
-- ============================================================================
CREATE TABLE IF NOT EXISTS advertisement_campaigns (
    id TEXT PRIMARY KEY,
    advertiser_name TEXT NOT NULL,
    campaign_name TEXT NOT NULL,
    placement TEXT NOT NULL,
    target_pages TEXT NOT NULL, -- JSON array e.g. ["FIND_TUTOR", "ALL"]
    media_type TEXT NOT NULL CHECK(media_type IN ('TEXT_ONLY', 'IMAGE_ONLY', 'VIDEO_ONLY', 'IMAGE_TEXT', 'VIDEO_TEXT', 'RICH_AD')),
    headline TEXT NOT NULL,
    subheading TEXT,
    description TEXT,
    image_url TEXT,
    video_url TEXT,
    destination_url TEXT,
    cta_text TEXT DEFAULT 'Learn More',
    supporting_text TEXT,
    badge_text TEXT,
    promotional_offer TEXT,
    layout TEXT DEFAULT 'split' CHECK(layout IN ('split', 'card', 'banner', 'video_focus', 'full-width')),
    status TEXT NOT NULL DEFAULT 'LIVE' CHECK(status IN ('DRAFT', 'UNDER_REVIEW', 'APPROVED', 'LIVE', 'PAUSED', 'EXPIRED', 'ARCHIVED')),
    start_date TEXT,
    end_date TEXT,
    priority INTEGER DEFAULT 50,
    target_audience TEXT,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    video_plays INTEGER DEFAULT 0,
    created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 53. Advertisement Engine: Real-time Telemetry Events
-- ============================================================================
CREATE TABLE IF NOT EXISTS advertisement_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_id TEXT NOT NULL REFERENCES advertisement_campaigns(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK(event_type IN ('IMPRESSION', 'CLICK', 'VIDEO_PLAY', 'CTA_CLICK')),
    page TEXT,
    ip_hash TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 54. Advertisement Engine: Audit Trail Logs
-- ============================================================================
CREATE TABLE IF NOT EXISTS advertisement_audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_id TEXT NOT NULL,
    action TEXT NOT NULL,
    actor_id TEXT,
    actor_role TEXT,
    details_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Location & Advertisement Engine Indexes
CREATE INDEX IF NOT EXISTS idx_states_country ON states_ut(country_id);
CREATE INDEX IF NOT EXISTS idx_localities_district ON localities(district_id);
CREATE INDEX IF NOT EXISTS idx_areas_locality ON areas(locality_id);
CREATE INDEX IF NOT EXISTS idx_ad_status_priority ON advertisement_campaigns(status, priority DESC);
CREATE INDEX IF NOT EXISTS idx_ad_placement ON advertisement_campaigns(placement);
CREATE INDEX IF NOT EXISTS idx_ad_events_campaign ON advertisement_events(campaign_id, event_type);

-- ============================================================================
-- 55. FocusPoint Smart Personal QR Attendance Pass & Access Security
-- ============================================================================
CREATE TABLE IF NOT EXISTS qr_attendance_passes (
    id TEXT PRIMARY KEY,
    qr_id TEXT UNIQUE NOT NULL,
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'SUSPENDED', 'REVOKED')),
    service_eligibility TEXT NOT NULL DEFAULT 'UNIVERSAL' CHECK(service_eligibility IN ('HOME_TUITION', 'LIBRARY', 'UNIVERSAL')),
    revocation_reason TEXT,
    reissued_from_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_qr_passes_student ON qr_attendance_passes(student_id);
CREATE INDEX IF NOT EXISTS idx_qr_passes_token ON qr_attendance_passes(token);
CREATE INDEX IF NOT EXISTS idx_qr_passes_qr_id ON qr_attendance_passes(qr_id);

-- ============================================================================
-- 56. Booking Confirmation Events
-- ============================================================================
CREATE TABLE IF NOT EXISTS booking_confirmation_events (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    booking_id TEXT NOT NULL,
    service_type TEXT NOT NULL CHECK(service_type IN ('HOME_TUITION', 'LIBRARY', 'BOTH')),
    teacher_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    library_id INTEGER REFERENCES libraries(id) ON DELETE SET NULL,
    start_date TEXT NOT NULL,
    active_month TEXT NOT NULL,
    valid_until TEXT NOT NULL,
    total_amount REAL DEFAULT 0,
    payment_status TEXT NOT NULL DEFAULT 'PAID' CHECK(payment_status IN ('PAID', 'PENDING', 'OVERDUE')),
    whatsapp_status TEXT NOT NULL DEFAULT 'QUEUED' CHECK(whatsapp_status IN ('QUEUED', 'SENDING', 'SENT', 'DELIVERED', 'FAILED', 'RETRYING')),
    metadata TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_bce_student ON booking_confirmation_events(student_id);
CREATE INDEX IF NOT EXISTS idx_bce_booking ON booking_confirmation_events(booking_id);

-- ============================================================================
-- 57. WhatsApp Notifications & Delivery Tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS whatsapp_notifications (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    phone_number TEXT NOT NULL,
    recipient_role TEXT NOT NULL DEFAULT 'STUDENT' CHECK(recipient_role IN ('STUDENT', 'PARENT', 'TEACHER', 'LIBRARY_OWNER')),
    notification_type TEXT NOT NULL CHECK(notification_type IN ('BOOKING_CONFIRMATION', 'ATTENDANCE_CHECKIN', 'ATTENDANCE_CHECKOUT', 'FEE_REMINDER', 'PASS_REISSUED')),
    booking_id TEXT,
    service_type TEXT CHECK(service_type IN ('HOME_TUITION', 'LIBRARY', 'BOTH', 'GENERAL')),
    template_id TEXT NOT NULL,
    message TEXT NOT NULL,
    provider_message_id TEXT,
    status TEXT NOT NULL DEFAULT 'QUEUED' CHECK(status IN ('QUEUED', 'SENDING', 'SENT', 'DELIVERED', 'FAILED', 'RETRYING')),
    retry_count INTEGER DEFAULT 0,
    failure_reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    sent_at DATETIME,
    delivered_at DATETIME,
    failed_at DATETIME
);
CREATE INDEX IF NOT EXISTS idx_wn_student ON whatsapp_notifications(student_id);
CREATE INDEX IF NOT EXISTS idx_wn_status ON whatsapp_notifications(status);

-- ============================================================================
-- 58. Attendance & QR Access Audit Trail Logs
-- ============================================================================
CREATE TABLE IF NOT EXISTS attendance_audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    actor_id TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    action TEXT NOT NULL,
    student_id TEXT NOT NULL,
    service_type TEXT,
    booking_id TEXT,
    previous_state TEXT,
    new_state TEXT,
    reason TEXT,
    ip_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_aal_student ON attendance_audit_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_aal_action ON attendance_audit_logs(action);

-- ============================================================================
-- 59. FOCUSPOINT AI Agent: Smart Notification, WhatsApp Offer & Recommendation Engine
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_notification_events (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    session_id TEXT,
    event_type TEXT NOT NULL,
    service_category TEXT NOT NULL,
    state_name TEXT,
    district_name TEXT,
    locality_name TEXT,
    pincode TEXT,
    search_query TEXT,
    payload_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ai_events_user ON ai_notification_events(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_events_service ON ai_notification_events(service_category);
CREATE INDEX IF NOT EXISTS idx_ai_events_created ON ai_notification_events(created_at);

CREATE TABLE IF NOT EXISTS ai_offer_recommendations (
    id TEXT PRIMARY KEY,
    event_id TEXT REFERENCES ai_notification_events(id) ON DELETE CASCADE,
    user_id TEXT,
    service_type TEXT NOT NULL,
    offer_id TEXT,
    offer_title TEXT NOT NULL,
    offer_code TEXT,
    offer_category TEXT,
    discount_type TEXT CHECK(discount_type IN ('PERCENTAGE', 'FIXED', 'FLAT')),
    discount_value REAL DEFAULT 0,
    relevance_score REAL DEFAULT 0,
    is_organic INTEGER DEFAULT 0,
    deep_link TEXT NOT NULL,
    location_scope_json TEXT,
    clicked INTEGER DEFAULT 0,
    converted INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ai_recs_event ON ai_offer_recommendations(event_id);
CREATE INDEX IF NOT EXISTS idx_ai_recs_user ON ai_offer_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_recs_service ON ai_offer_recommendations(service_type);

CREATE TABLE IF NOT EXISTS in_app_notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    service_category TEXT NOT NULL,
    offer_id TEXT,
    offer_code TEXT,
    discount_display TEXT,
    deep_link TEXT NOT NULL,
    action_label TEXT DEFAULT 'View Details',
    is_read INTEGER DEFAULT 0,
    read_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ian_user ON in_app_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_ian_read ON in_app_notifications(user_id, is_read);

CREATE TABLE IF NOT EXISTS user_notification_preferences (
    user_id TEXT PRIMARY KEY,
    promotional_whatsapp_opt_in INTEGER DEFAULT 0,
    transactional_whatsapp_opt_in INTEGER DEFAULT 1,
    in_app_notifications_enabled INTEGER DEFAULT 1,
    max_promotional_per_day INTEGER DEFAULT 2,
    max_promotional_per_week INTEGER DEFAULT 5,
    quiet_hours_start TEXT DEFAULT '21:00',
    quiet_hours_end TEXT DEFAULT '09:00',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_whatsapp_dispatches (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    recipient_phone TEXT NOT NULL,
    service_category TEXT NOT NULL,
    template_id TEXT NOT NULL,
    template_name TEXT,
    rendered_message TEXT NOT NULL,
    deep_link TEXT,
    offer_id TEXT,
    consent_verified INTEGER DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'QUEUED' CHECK(status IN ('QUEUED', 'PROCESSING', 'SENT', 'DELIVERED', 'FAILED', 'SUPPRESSED', 'SKIPPED')),
    provider_message_id TEXT,
    failure_reason TEXT,
    retry_count INTEGER DEFAULT 0,
    sent_at DATETIME,
    delivered_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_awd_user ON ai_whatsapp_dispatches(user_id);
CREATE INDEX IF NOT EXISTS idx_awd_status ON ai_whatsapp_dispatches(status);

CREATE TABLE IF NOT EXISTS ai_automation_configs (
    key TEXT PRIMARY KEY,
    value_json TEXT NOT NULL,
    updated_by TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_automation_audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    admin_id TEXT,
    admin_name TEXT,
    admin_role TEXT,
    category TEXT NOT NULL CHECK(category IN ('CONFIG_CHANGE', 'MANUAL_DISPATCH', 'RETRY_QUEUE', 'RULE_UPDATE', 'OPT_OUT', 'DELIVERY_DISPATCH', 'POLICY_EVALUATION')),
    details TEXT,
    payload_snapshot TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_aaal_action ON ai_automation_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_aaal_category ON ai_automation_audit_logs(category);



