-- FOCUSPOINT Relational Database Schema for InsForge PostgreSQL

-- 1. Roles table
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

-- 2. Permissions table
CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
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
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    state VARCHAR(100) NOT NULL DEFAULT 'Uttar Pradesh',
    code VARCHAR(10) UNIQUE NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1
);

-- 5. Core Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    mobile VARCHAR(30) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role_id INTEGER NOT NULL REFERENCES roles(id),
    district_id INTEGER REFERENCES districts(id),
    account_status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE' CHECK(account_status IN ('ACTIVE', 'PENDING_APPROVAL', 'SUSPENDED', 'REJECTED', 'INACTIVE')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMPTZ
);

-- 6. User Roles junction table
CREATE TABLE IF NOT EXISTS user_roles (
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
);

-- 7. Student Profiles
CREATE TABLE IF NOT EXISTS student_profiles (
    user_id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    dob VARCHAR(30) NOT NULL,
    gender VARCHAR(20) NOT NULL,
    city_area VARCHAR(150) NOT NULL,
    address TEXT NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    profile_photo_url TEXT,
    school_college VARCHAR(200),
    grade_class VARCHAR(50),
    stream_subjects TEXT,
    target_goals TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. Teacher Profiles
CREATE TABLE IF NOT EXISTS teacher_profiles (
    user_id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    gender VARCHAR(20) NOT NULL,
    dob VARCHAR(30) NOT NULL,
    qualification VARCHAR(200) NOT NULL,
    experience_years INTEGER NOT NULL DEFAULT 0,
    subjects TEXT NOT NULL,
    classes TEXT NOT NULL,
    specialization VARCHAR(200),
    teaching_mode VARCHAR(20) NOT NULL CHECK(teaching_mode IN ('ONLINE', 'OFFLINE', 'BOTH')),
    areas_served TEXT NOT NULL,
    expected_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
    availability TEXT NOT NULL,
    address TEXT NOT NULL,
    profile_photo_url TEXT,
    verification_doc_urls TEXT,
    is_publicly_visible INTEGER NOT NULL DEFAULT 0,
    bio TEXT,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 9. Library Owner Profiles
CREATE TABLE IF NOT EXISTS library_owner_profiles (
    user_id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    owner_name VARCHAR(150) NOT NULL,
    address TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 10. District Admins
CREATE TABLE IF NOT EXISTS district_admins (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    district_id INTEGER NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'INACTIVE')),
    assigned_by VARCHAR(64) REFERENCES users(id),
    assigned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 11. OTPs table
CREATE TABLE IF NOT EXISTS otps (
    id SERIAL PRIMARY KEY,
    identifier VARCHAR(255) NOT NULL,
    otp_code VARCHAR(20) NOT NULL,
    purpose VARCHAR(30) NOT NULL CHECK(purpose IN ('LOGIN', 'PASSWORD_RESET', 'VERIFICATION')),
    expires_at TIMESTAMPTZ NOT NULL,
    consumed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 12. Sessions
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 13. Teacher-Student Assignments
CREATE TABLE IF NOT EXISTS teacher_student_assignments (
    id SERIAL PRIMARY KEY,
    teacher_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(150) NOT NULL,
    monthly_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
    teaching_mode VARCHAR(20) NOT NULL DEFAULT 'OFFLINE' CHECK(teaching_mode IN ('ONLINE', 'OFFLINE', 'BOTH')),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'PAUSED', 'COMPLETED')),
    started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 14. Study Libraries
CREATE TABLE IF NOT EXISTS libraries (
    id SERIAL PRIMARY KEY,
    owner_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    district_id INTEGER NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    address TEXT NOT NULL,
    total_seats INTEGER NOT NULL DEFAULT 50,
    amenities TEXT,
    operating_hours VARCHAR(100) DEFAULT '6:00 AM - 11:00 PM',
    morning_fee NUMERIC(10, 2) NOT NULL DEFAULT 600,
    evening_fee NUMERIC(10, 2) NOT NULL DEFAULT 600,
    fullday_fee NUMERIC(10, 2) NOT NULL DEFAULT 1000,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING_APPROVAL' CHECK(status IN ('PENDING_APPROVAL', 'ACTIVE', 'INACTIVE')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 15. Library Shifts
CREATE TABLE IF NOT EXISTS library_shifts (
    id SERIAL PRIMARY KEY,
    library_id INTEGER NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    start_time VARCHAR(20) NOT NULL,
    end_time VARCHAR(20) NOT NULL,
    fee NUMERIC(10, 2) NOT NULL DEFAULT 600
);

-- 16. Library Seats
CREATE TABLE IF NOT EXISTS library_seats (
    id SERIAL PRIMARY KEY,
    library_id INTEGER NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
    seat_number VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE' CHECK(status IN ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE')),
    UNIQUE(library_id, seat_number)
);

-- 17. Library Enrollments
CREATE TABLE IF NOT EXISTS library_enrollments (
    id SERIAL PRIMARY KEY,
    library_id INTEGER NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
    student_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seat_id INTEGER REFERENCES library_seats(id) ON DELETE SET NULL,
    shift_id INTEGER REFERENCES library_shifts(id) ON DELETE SET NULL,
    monthly_fee NUMERIC(10, 2) NOT NULL DEFAULT 600,
    start_date VARCHAR(30) NOT NULL,
    end_date VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'EXPIRED', 'CANCELLED')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 18. Attendance Records
CREATE TABLE IF NOT EXISTS attendance_records (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    teacher_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    library_id INTEGER REFERENCES libraries(id) ON DELETE SET NULL,
    date VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK(status IN ('PRESENT', 'ABSENT', 'LATE', 'LEAVE')),
    type VARCHAR(20) NOT NULL DEFAULT 'TUTOR' CHECK(type IN ('TUTOR', 'LIBRARY')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 19. Fee Records
CREATE TABLE IF NOT EXISTS fee_records (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    teacher_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    library_id INTEGER REFERENCES libraries(id) ON DELETE SET NULL,
    type VARCHAR(20) NOT NULL CHECK(type IN ('TUTOR', 'LIBRARY')),
    title VARCHAR(200) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    due_date VARCHAR(30) NOT NULL,
    paid_date VARCHAR(30),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'PAID', 'OVERDUE')),
    receipt_no VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 20. Booking & Enquiry Requests
CREATE TABLE IF NOT EXISTS booking_requests (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    district_id INTEGER NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
    target_type VARCHAR(20) NOT NULL CHECK(target_type IN ('TEACHER', 'LIBRARY')),
    teacher_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    library_id INTEGER REFERENCES libraries(id) ON DELETE SET NULL,
    subject_or_shift VARCHAR(200) NOT NULL,
    message TEXT,
    preferred_mode VARCHAR(20) DEFAULT 'OFFLINE' CHECK(preferred_mode IN ('OFFLINE', 'ONLINE', 'BOTH')),
    preferred_seat_id INTEGER REFERENCES library_seats(id) ON DELETE SET NULL,
    shift_id INTEGER REFERENCES library_shifts(id) ON DELETE SET NULL,
    start_date VARCHAR(30),
    response_note TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 21. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'INFO' CHECK(type IN ('INFO', 'SUCCESS', 'WARNING', 'ALERT')),
    is_read INTEGER NOT NULL DEFAULT 0,
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 22. Support Tickets Table
CREATE TABLE IF NOT EXISTS support_tickets (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    district_id INTEGER REFERENCES districts(id) ON DELETE SET NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK(status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED')),
    priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL' CHECK(priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
    admin_response TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 23. Teacher Weekly Schedules
CREATE TABLE IF NOT EXISTS teacher_schedules (
    id SERIAL PRIMARY KEY,
    teacher_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day_of_week VARCHAR(20) NOT NULL,
    start_time VARCHAR(20) NOT NULL,
    end_time VARCHAR(20) NOT NULL,
    title VARCHAR(200) NOT NULL,
    teaching_mode VARCHAR(20) NOT NULL DEFAULT 'OFFLINE',
    student_name VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_district_admin ON district_admins (district_id) WHERE status = 'ACTIVE';
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
