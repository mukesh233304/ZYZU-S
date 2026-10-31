const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../db/database');
const config = require('../config');

function runSeed(options = {}) {
  const seedDemo = options.seedDemo !== undefined ? options.seedDemo : (process.env.NODE_ENV !== 'test');
  console.log('🌱 Starting FOCUSPOINT Database Seeding...');

  const insertRole = db.prepare(`
    INSERT INTO roles (name, description)
    VALUES (?, ?)
    ON CONFLICT(name) DO UPDATE SET description=excluded.description
  `);

  const roles = [
    { name: config.roles.STUDENT, desc: 'Student learner searching for home tutoring and library access' },
    { name: config.roles.TEACHER, desc: 'Educator offering home and online tutoring services' },
    { name: config.roles.LIBRARY_OWNER, desc: 'Owner and operator of study library spaces' },
    { name: config.roles.DISTRICT_ADMIN, desc: 'Administrative supervisor for a dedicated district' },
    { name: config.roles.SUPER_ADMIN, desc: 'Platform-wide administrator with full authority' }
  ];

  const seedTransaction = db.transaction(() => {
    // 1. Roles
    for (const r of roles) {
      insertRole.run(r.name, r.desc);
    }
    console.log('✅ Roles seeded');

    // 2. Permissions
    const insertPerm = db.prepare(`
      INSERT INTO permissions (name, description)
      VALUES (?, ?)
      ON CONFLICT(name) DO UPDATE SET description=excluded.description
    `);

    const perms = [
      { name: 'profile:read', desc: 'Read own profile' },
      { name: 'profile:update', desc: 'Update own profile' },
      { name: 'teacher:list_public', desc: 'View approved public teachers' },
      { name: 'teacher:manage', desc: 'Manage teacher profile and availability' },
      { name: 'library:manage', desc: 'Manage library profile' },
      { name: 'district:view', desc: 'View district-level analytics' },
      { name: 'district:approve_teacher', desc: 'Review and approve teachers in district' },
      { name: 'district:approve_library', desc: 'Review and approve libraries in district' },
      { name: 'admin:manage_district_admins', desc: 'Assign or remove district admins' },
      { name: 'admin:full_access', desc: 'Complete administrative access' }
    ];

    for (const p of perms) {
      insertPerm.run(p.name, p.desc);
    }
    console.log('✅ Permissions seeded');

    // 3. Map Roles to Permissions
    const getRole = db.prepare('SELECT id FROM roles WHERE name = ?');
    const getPerm = db.prepare('SELECT id FROM permissions WHERE name = ?');
    const insertRolePerm = db.prepare(`
      INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)
    `);

    const rolePermMappings = {
      [config.roles.STUDENT]: ['profile:read', 'profile:update', 'teacher:list_public'],
      [config.roles.TEACHER]: ['profile:read', 'profile:update', 'teacher:manage'],
      [config.roles.LIBRARY_OWNER]: ['profile:read', 'profile:update', 'library:manage'],
      [config.roles.DISTRICT_ADMIN]: ['profile:read', 'profile:update', 'district:view', 'district:approve_teacher', 'district:approve_library'],
      [config.roles.SUPER_ADMIN]: [
        'profile:read', 'profile:update', 'teacher:list_public', 'teacher:manage',
        'library:manage', 'district:view', 'district:approve_teacher',
        'district:approve_library', 'admin:manage_district_admins', 'admin:full_access'
      ]
    };

    for (const [roleName, permList] of Object.entries(rolePermMappings)) {
      const roleRow = getRole.get(roleName);
      if (roleRow) {
        for (const pName of permList) {
          const permRow = getPerm.get(pName);
          if (permRow) {
            insertRolePerm.run(roleRow.id, permRow.id);
          }
        }
      }
    }
    console.log('✅ Role-Permission mappings seeded');

    // 4. Districts
    const insertDistrict = db.prepare(`
      INSERT INTO districts (name, state, code, is_active)
      VALUES (?, ?, ?, 1)
      ON CONFLICT(name) DO NOTHING
    `);

    const sampleDistricts = [
      { name: 'Ghazipur', state: 'Uttar Pradesh', code: 'GZP' },
      { name: 'Saidpur', state: 'Uttar Pradesh', code: 'SDP' },
      { name: 'Varanasi', state: 'Uttar Pradesh', code: 'VNS' },
      { name: 'Mau', state: 'Uttar Pradesh', code: 'MAU' },
      { name: 'Ballia', state: 'Uttar Pradesh', code: 'BAL' },
      { name: 'Jaunpur', state: 'Uttar Pradesh', code: 'JNP' }
    ];

    for (const d of sampleDistricts) {
      insertDistrict.run(d.name, d.state, d.code);
    }
    console.log('✅ Initial districts seeded');

    // 5. Seed Super Admin (Secure Initial Setup)
    const superAdminEmail = (process.env.SUPERADMIN_EMAIL || 'superadmin@focuspoint.internal').toLowerCase();
    const superAdminMobile = process.env.SUPERADMIN_MOBILE || '9999999999';
    const superAdminPassword = process.env.SUPERADMIN_PASSWORD || 'SuperAdmin@FocusPoint2026!';

    const superAdminRole = getRole.get(config.roles.SUPER_ADMIN);
    const ghazipurDistrict = db.prepare('SELECT id FROM districts WHERE code = ?').get('GZP');

    let superAdminId;
    const existingSuperAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get(superAdminEmail);
    if (!existingSuperAdmin) {
      superAdminId = crypto.randomUUID();
      const passwordHash = bcrypt.hashSync(superAdminPassword, 10);

      db.prepare(`
        INSERT INTO users (id, email, mobile, password_hash, role_id, district_id, account_status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        superAdminId,
        superAdminEmail,
        superAdminMobile,
        passwordHash,
        superAdminRole.id,
        ghazipurDistrict ? ghazipurDistrict.id : null,
        config.statuses.ACTIVE
      );

      db.prepare(`
        INSERT INTO user_roles (user_id, role_id)
        VALUES (?, ?)
      `).run(superAdminId, superAdminRole.id);

      console.log(`👑 Super Admin account created: ${superAdminEmail}`);
    } else {
      superAdminId = existingSuperAdmin.id;
      console.log(`👑 Super Admin already exists: ${superAdminEmail}`);
    }

    // 6. Seed Demo Data for Dashboards (Idempotent checks)
    if (seedDemo) {
      seedDemoDashboardData(superAdminId, ghazipurDistrict ? ghazipurDistrict.id : 1);
    }
  });

  seedTransaction();
  console.log('✨ FOCUSPOINT Database Seeding Completed Successfully!');
}

function seedDemoDashboardData(superAdminId, districtId) {
  const getRole = db.prepare('SELECT id FROM roles WHERE name = ?');
  const studentRole = getRole.get(config.roles.STUDENT);
  const teacherRole = getRole.get(config.roles.TEACHER);
  const libraryRole = getRole.get(config.roles.LIBRARY_OWNER);
  const daRole = getRole.get(config.roles.DISTRICT_ADMIN);
  const defaultHash = bcrypt.hashSync('Password@123', 10);

  // A. Demo District Admin for Ghazipur
  const existingActiveDA = db.prepare("SELECT id FROM district_admins WHERE district_id = ? AND status = 'ACTIVE'").get(districtId);
  if (!existingActiveDA) {
    const daEmail = 'admin.ghazipur@focuspoint.internal';
    let daUser = db.prepare('SELECT id FROM users WHERE email = ?').get(daEmail);
    const daId = daUser ? daUser.id : crypto.randomUUID();
    if (!daUser) {
      db.prepare(`
        INSERT INTO users (id, email, mobile, password_hash, role_id, district_id, account_status)
        VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')
      `).run(daId, daEmail, '9876500010', defaultHash, daRole.id, districtId);
      db.prepare(`INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`).run(daId, daRole.id);
    }
    db.prepare(`
      INSERT INTO district_admins (user_id, district_id, status, assigned_by)
      VALUES (?, ?, 'ACTIVE', ?)
    `).run(daId, districtId, superAdminId);
    console.log('✅ Demo District Admin seeded for Ghazipur');
  }

  // B. Demo Active Teacher (Dr. Alok Nath) in Ghazipur
  const teacherEmail = 'alok.teacher@focuspoint.internal';
  let teacherUser = db.prepare('SELECT id FROM users WHERE email = ?').get(teacherEmail);
  let teacherId;
  if (!teacherUser) {
    teacherId = crypto.randomUUID();
    db.prepare(`
      INSERT INTO users (id, email, mobile, password_hash, role_id, district_id, account_status)
      VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')
    `).run(teacherId, teacherEmail, '9876500020', defaultHash, teacherRole.id, districtId);
    db.prepare(`INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`).run(teacherId, teacherRole.id);
    db.prepare(`
      INSERT INTO teacher_profiles (
        user_id, full_name, gender, dob, qualification, experience_years,
        subjects, classes, specialization, teaching_mode, areas_served,
        expected_fee, availability, address, is_publicly_visible, bio
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `).run(
      teacherId,
      'Dr. Alok Nath Mishra',
      'Male',
      '1988-03-15',
      'Ph.D. Physics (BHU), B.Ed',
      12,
      JSON.stringify(['Physics', 'Mathematics', 'Applied Mechanics']),
      JSON.stringify(['Class 10', 'Class 11', 'Class 12', 'JEE Foundation']),
      'IIT-JEE & Board Examination Mastery',
      'BOTH',
      'Saidpur Town, Sadar Bazar, Khanpur, Bhitari',
      7500,
      '5:00 PM - 8:30 PM (Mon-Sat)',
      'House No. 45, Near Gandhi Chowk, Saidpur, Ghazipur',
      'Experienced Physics and Mathematics educator with over a decade of mentoring board toppers and competitive aspirants.'
    );

    // Seed weekly schedule
    const insertSchedule = db.prepare(`
      INSERT INTO teacher_schedules (teacher_id, day_of_week, start_time, end_time, title, teaching_mode, student_name)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insertSchedule.run(teacherId, 'Monday', '17:00', '18:30', 'Class 12 Physics - Batch Alpha', 'BOTH', 'Aryan & Vivek');
    insertSchedule.run(teacherId, 'Wednesday', '17:00', '18:30', 'Class 12 Physics - Batch Alpha', 'BOTH', 'Aryan & Vivek');
    insertSchedule.run(teacherId, 'Friday', '17:00', '18:30', 'Class 10 Mathematics - Board Special', 'OFFLINE', 'Sneha Patel');
    insertSchedule.run(teacherId, 'Saturday', '16:00', '18:00', 'IIT-JEE Physics Doubt Clearing', 'ONLINE', 'Open Batch');

    console.log('✅ Demo Active Teacher seeded');
  } else {
    teacherId = teacherUser.id;
  }

  // C. Demo Pending Teacher (Rohan Sharma) awaiting approval
  const pendingTeacherEmail = 'rohan.pending@focuspoint.internal';
  if (!db.prepare('SELECT id FROM users WHERE email = ?').get(pendingTeacherEmail)) {
    const ptId = crypto.randomUUID();
    db.prepare(`
      INSERT INTO users (id, email, mobile, password_hash, role_id, district_id, account_status)
      VALUES (?, ?, ?, ?, ?, ?, 'PENDING_APPROVAL')
    `).run(ptId, pendingTeacherEmail, '9876500021', defaultHash, teacherRole.id, districtId);
    db.prepare(`INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`).run(ptId, teacherRole.id);
    db.prepare(`
      INSERT INTO teacher_profiles (
        user_id, full_name, gender, dob, qualification, experience_years,
        subjects, classes, specialization, teaching_mode, areas_served,
        expected_fee, availability, address, is_publicly_visible
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `).run(
      ptId,
      'Rohan Sharma',
      'Male',
      '1996-07-22',
      'M.Com, UGC-NET',
      4,
      JSON.stringify(['Accountancy', 'Economics', 'Business Studies']),
      JSON.stringify(['Class 11', 'Class 12', 'Commerce']),
      'Commerce & Financial Accounting',
      'OFFLINE',
      'Saidpur, Sadar',
      6000,
      '4:00 PM - 7:00 PM',
      'Ward 3, Station Road, Saidpur'
    );
  }

  // D. Demo Library Owner & Library (FocusPoint Study Point, Saidpur)
  const libOwnerEmail = 'owner.library@focuspoint.internal';
  let libOwner = db.prepare('SELECT id FROM users WHERE email = ?').get(libOwnerEmail);
  let libOwnerId;
  let libraryId;
  if (!libOwner) {
    libOwnerId = crypto.randomUUID();
    db.prepare(`
      INSERT INTO users (id, email, mobile, password_hash, role_id, district_id, account_status)
      VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')
    `).run(libOwnerId, libOwnerEmail, '9876500030', defaultHash, libraryRole.id, districtId);
    db.prepare(`INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`).run(libOwnerId, libraryRole.id);
    db.prepare(`
      INSERT INTO library_owner_profiles (user_id, owner_name, address)
      VALUES (?, ?, ?)
    `).run(libOwnerId, 'Ramesh Chandra Jaiswal', 'Main Road, Opposite Town Degree College, Saidpur');

    // Create Library
    const libRes = db.prepare(`
      INSERT INTO libraries (
        owner_id, district_id, name, address, total_seats,
        amenities, operating_hours, morning_fee, evening_fee, fullday_fee, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
    `).run(
      libOwnerId,
      districtId,
      'FocusPoint Central Reading Hall & Study Space',
      '2nd Floor, Jaiswal Complex, Opp. Degree College Gate, Saidpur-Ghazipur',
      40,
      JSON.stringify(['Centrally Air Conditioned', 'High-Speed Optical Fiber WiFi', 'RO Drinking Water & Dispenser', 'Individual Charging Sockets', 'Separate Lockers', 'CCTV 24x7 Security', 'Silence Zone & Discussion Area']),
      '6:00 AM - 11:00 PM',
      700,
      700,
      1200
    );
    libraryId = libRes.lastInsertRowid;

    // Seed Shifts
    const insertShift = db.prepare(`
      INSERT INTO library_shifts (library_id, name, start_time, end_time, fee)
      VALUES (?, ?, ?, ?, ?)
    `);
    const morningShift = insertShift.run(libraryId, 'Morning Shift (6:00 AM - 12:00 PM)', '06:00', '12:00', 700);
    const eveningShift = insertShift.run(libraryId, 'Evening Shift (12:00 PM - 6:00 PM)', '12:00', '18:00', 700);
    const nightShift = insertShift.run(libraryId, 'Night Shift (6:00 PM - 11:00 PM)', '18:00', '23:00', 600);
    const fullDayShift = insertShift.run(libraryId, 'Full Day Unlimited (6:00 AM - 11:00 PM)', '06:00', '23:00', 1200);

    // Seed Seats (1 to 40)
    const insertSeat = db.prepare(`
      INSERT INTO library_seats (library_id, seat_number, status)
      VALUES (?, ?, ?)
    `);
    for (let i = 1; i <= 40; i++) {
      const seatNum = `S-${i < 10 ? '0' + i : i}`;
      // Make some occupied for realistic metrics
      const status = i <= 15 ? 'OCCUPIED' : (i === 16 ? 'MAINTENANCE' : 'AVAILABLE');
      insertSeat.run(libraryId, seatNum, status);
    }
    console.log('✅ Demo Library and 40 seats seeded');
  } else {
    libOwnerId = libOwner.id;
    const libRow = db.prepare('SELECT id FROM libraries WHERE owner_id = ?').get(libOwnerId);
    if (libRow) libraryId = libRow.id;
  }

  // E. Demo Active Student (Aryan Singh) in Ghazipur
  const studentEmail = 'student.aryan@focuspoint.internal';
  let studentUser = db.prepare('SELECT id FROM users WHERE email = ?').get(studentEmail);
  let studentId;
  if (!studentUser) {
    studentId = crypto.randomUUID();
    db.prepare(`
      INSERT INTO users (id, email, mobile, password_hash, role_id, district_id, account_status)
      VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')
    `).run(studentId, studentEmail, '9876500040', defaultHash, studentRole.id, districtId);
    db.prepare(`INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`).run(studentId, studentRole.id);
    db.prepare(`
      INSERT INTO student_profiles (
        user_id, full_name, dob, gender, city_area, address, pincode,
        school_college, grade_class, stream_subjects, target_goals
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      studentId,
      'Aryan Singh',
      '2006-09-14',
      'Male',
      'Saidpur Town',
      'Ward 5, Chaharsu, Saidpur',
      '233304',
      'St. John Senior Secondary School, Ghazipur',
      'Class 12',
      'Physics, Chemistry, Mathematics, English',
      'Targeting 95%+ in CBSE Boards and top 10k in JEE Main 2027'
    );

    // Pair Aryan with Dr. Alok Nath Mishra
    if (teacherId) {
      db.prepare(`
        INSERT INTO teacher_student_assignments (teacher_id, student_id, subject, monthly_fee, teaching_mode, status)
        VALUES (?, ?, ?, ?, ?, 'ACTIVE')
      `).run(teacherId, studentId, 'Physics & Mathematics (Board & JEE)', 7500, 'BOTH');

      // Seed attendance records
      const insertAtt = db.prepare(`
        INSERT INTO attendance_records (student_id, teacher_id, date, status, type, notes)
        VALUES (?, ?, ?, ?, 'TUTOR', ?)
      `);
      insertAtt.run(studentId, teacherId, '2026-08-25', 'PRESENT', 'Covered Wave Optics interference patterns');
      insertAtt.run(studentId, teacherId, '2026-08-27', 'PRESENT', 'Completed Numericals sheet #4');
      insertAtt.run(studentId, teacherId, '2026-08-29', 'PRESENT', 'Calculus derivative applications');
      insertAtt.run(studentId, teacherId, '2026-09-01', 'LATE', 'Reported 15 min late due to rain; covered full chapter');

      // Seed fees
      const insertFee = db.prepare(`
        INSERT INTO fee_records (student_id, teacher_id, type, title, amount, due_date, paid_date, status, receipt_no)
        VALUES (?, ?, 'TUTOR', ?, ?, ?, ?, ?, ?)
      `);
      insertFee.run(studentId, teacherId, 'Monthly Tuition Fee - August 2026', 7500, '2026-08-05', '2026-08-04', 'PAID', 'FP-TUT-2026-0042');
      insertFee.run(studentId, teacherId, 'Monthly Tuition Fee - September 2026', 7500, '2026-09-05', null, 'PENDING', null);
    }

    // Enroll Aryan in Library
    if (libraryId) {
      const seatRow = db.prepare('SELECT id FROM library_seats WHERE library_id = ? LIMIT 1').get(libraryId);
      const shiftRow = db.prepare('SELECT id FROM library_shifts WHERE library_id = ? LIMIT 1').get(libraryId);

      db.prepare(`
        INSERT INTO library_enrollments (library_id, student_id, seat_id, shift_id, monthly_fee, start_date, end_date, status)
        VALUES (?, ?, ?, ?, 700, '2026-08-01', '2026-09-30', 'ACTIVE')
      `).run(libraryId, studentId, seatRow ? seatRow.id : null, shiftRow ? shiftRow.id : null);

      db.prepare(`
        INSERT INTO fee_records (student_id, library_id, type, title, amount, due_date, paid_date, status, receipt_no)
        VALUES (?, ?, 'LIBRARY', 'Library Study Space Subscription - August 2026', 700, '2026-08-01', '2026-08-01', 'PAID', 'FP-LIB-2026-0108')
      `).run(studentId, libraryId);
    }

    // Seed Notifications
    const insertNotif = db.prepare(`
      INSERT INTO notifications (user_id, title, message, type, is_read, link)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    insertNotif.run(studentId, 'Welcome to FocusPoint!', 'Your account has been verified and active home tuition matching is live.', 'SUCCESS', 1, '/dashboard/student');
    insertNotif.run(studentId, 'Tutor Class Reminder', 'Next session with Dr. Alok Nath is scheduled for Wednesday at 5:00 PM.', 'INFO', 0, '/dashboard/student');

    // Seed Support Ticket
    db.prepare(`
      INSERT INTO support_tickets (user_id, district_id, subject, message, status, priority)
      VALUES (?, ?, ?, ?, 'OPEN', 'NORMAL')
    `).run(studentId, districtId, 'Query regarding weekend library night shift access', 'Hello, can I upgrade my library shift to include Saturday night study sessions?');
    console.log('✅ Demo Student seeded');
  }

  // Seed Demo Pricing Rules for Demo System
  const insertPricingRule = db.prepare(`
    INSERT OR IGNORE INTO demo_pricing_rules (
      service_type, scope_type, state, district, service_id, service_name, price, is_active, start_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, '2026-01-01')
  `);

    // Library Pricing Hierarchy Samples
    insertPricingRule.run('LIBRARY', 'PAN_INDIA', null, null, null, null, 100);
    insertPricingRule.run('LIBRARY', 'STATE', 'Uttar Pradesh', null, null, null, 80);
    insertPricingRule.run('LIBRARY', 'DISTRICT', 'Uttar Pradesh', 'Varanasi', null, null, 70);
    insertPricingRule.run('LIBRARY', 'DISTRICT', 'Uttar Pradesh', 'Ghazipur', null, null, 60);
    insertPricingRule.run('LIBRARY', 'PARTICULAR', 'Uttar Pradesh', 'Ghazipur', 'lib-focus-saidpur', 'FocusPoint Central Library (Saidpur)', 50);

    // Home Tuition Pricing Hierarchy Samples
    insertPricingRule.run('HOME_TUITION', 'PAN_INDIA', null, null, null, null, 199);
    insertPricingRule.run('HOME_TUITION', 'STATE', 'Uttar Pradesh', null, null, null, 149);
    insertPricingRule.run('HOME_TUITION', 'DISTRICT', 'Uttar Pradesh', 'Ghazipur', null, null, 129);
    insertPricingRule.run('HOME_TUITION', 'PARTICULAR', 'Uttar Pradesh', 'Ghazipur', 'usr-teacher-rahul', 'Rahul Verma (Physics & Maths)', 99);

    console.log('✅ Demo Student & Demo Pricing Hierarchy seeded');

    // =========================================================
    // Phase 5: Library Listing Subscription Plans & 4-Tier Rules
    // =========================================================
    const insertSubPlan = db.prepare(`
      INSERT OR REPLACE INTO library_subscription_plans (
        id, name, billing_cycle, duration_months, duration_days, base_price, status, is_popular, savings_percent, features
      ) VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?, ?)
    `);

    insertSubPlan.run(
      'plan-lib-monthly',
      'Monthly Listing Subscription',
      'MONTHLY',
      1,
      30,
      500,
      0,
      0,
      JSON.stringify(['Verified Public Search Listing', 'Direct Seat Booking Integration', 'Standard Analytics Dashboard', 'Monthly Listing Renewal'])
    );

    insertSubPlan.run(
      'plan-lib-quarterly',
      'Quarterly Growth Plan',
      'QUARTERLY',
      3,
      90,
      1299,
      0,
      15,
      JSON.stringify(['All Monthly Features Included', 'Featured in District Search Results', 'Priority Support Queue', 'Quarterly Listing Lock', '15% Duration Discount'])
    );

    insertSubPlan.run(
      'plan-lib-half-yearly',
      'Half-Yearly Pro Plan',
      'HALF_YEARLY',
      6,
      180,
      2399,
      0,
      20,
      JSON.stringify(['All Quarterly Features Included', 'Verified Badge on Search Results', 'Custom Shift Timetable Display', 'Detailed Revenue Analytics', '20% Duration Discount'])
    );

    insertSubPlan.run(
      'plan-lib-yearly',
      'Annual Enterprise Plan',
      'YEARLY',
      12,
      365,
      4499,
      1,
      25,
      JSON.stringify(['All Pro Features Included', 'Top Placement on FocusPoint Homepage', 'Dedicated Account Manager', 'Custom Promotion Banners', 'Full Price Protection Guarantee', '25% Annual Savings'])
    );

    // Seed 4-Tier Pricing Rules
    const insertSubRule = db.prepare(`
      INSERT OR REPLACE INTO library_subscription_pricing_rules (
        id, name, scope_type, state, district, library_id, library_name, plan_id, price, currency, status, effective_from, price_protection, refund_policy, grace_period_days
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'INR', 'ACTIVE', '2026-01-01', 'LOCKED', 'FULL_24H', 7)
    `);

    // Tier 4: Pan-India Standard (₹500/mo)
    insertSubRule.run(
      'rule-lib-sub-pan-india',
      'Pan-India Standard Listing Fee',
      'PAN_INDIA',
      null,
      null,
      null,
      null,
      'plan-lib-monthly',
      500
    );

    // Tier 3: State Override (Uttar Pradesh ₹400/mo)
    insertSubRule.run(
      'rule-lib-sub-up',
      'Uttar Pradesh State Listing Incentive',
      'STATE',
      'Uttar Pradesh',
      null,
      null,
      null,
      'plan-lib-monthly',
      400
    );

    // Tier 2: District Override (Ghazipur ₹300/mo)
    insertSubRule.run(
      'rule-lib-sub-gzp',
      'Ghazipur District Special Launch Fee',
      'DISTRICT',
      'Uttar Pradesh',
      'Ghazipur',
      null,
      null,
      'plan-lib-monthly',
      300
    );

    // Tier 1: Particular Library Override (₹200/mo)
    insertSubRule.run(
      'rule-lib-sub-particular-1',
      'FocusPoint Premier Study Library Partner Rate',
      'PARTICULAR',
      'Uttar Pradesh',
      'Ghazipur',
      'lib-vidya-gzp',
      'FocusPoint Premier Study Library',
      'plan-lib-monthly',
      200
    );

    // Seed an active subscription on the existing seed library if available
    const existingLib = db.prepare('SELECT id, owner_id, name, district_id FROM libraries LIMIT 1').get();
    if (existingLib) {
      const now = new Date();
      const activatedAt = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(); // 2 hours ago -> ~22h remaining
      const deadline = new Date(new Date(activatedAt).getTime() + 24 * 60 * 60 * 1000).toISOString();
      const expiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);
      const subId = 'sub-seed-lib-active-1';

      db.prepare(`
        INSERT OR REPLACE INTO library_subscriptions (
          id, library_id, owner_id, plan_id, plan_name, billing_cycle, base_price, pricing_scope,
          applied_rule_id, offer_discount, coupon_code, coupon_discount, final_paid_amount,
          is_free, status, start_date, expiry_date, activated_at, cancellation_deadline,
          auto_renew, grace_period_days, price_locked, payment_method, transaction_id
        ) VALUES (
          ?, ?, ?, 'plan-lib-monthly', 'Monthly Listing Subscription', 'MONTHLY', 300, 'DISTRICT',
          'rule-lib-sub-gzp', 0, null, 0, 300,
          0, 'ACTIVE', ?, ?, ?, ?,
          1, 7, 300, 'UPI_QR', 'TXN-SEED-SUB-001'
        )
      `).run(subId, existingLib.id, existingLib.owner_id, now.toISOString().substring(0, 10), expiry, activatedAt, deadline);

      // Seed payment record
      db.prepare(`
        INSERT OR REPLACE INTO library_subscription_payments (
          id, subscription_id, library_id, owner_id, invoice_no, amount, payment_method,
          transaction_id, status, paid_at, notes
        ) VALUES (
          'pay-seed-sub-1', ?, ?, ?, 'FP-INV-SUB-2026-0001', 300, 'UPI_QR',
          'TXN-SEED-SUB-001', 'SUCCESS', ?, 'Listing Subscription for 30 Days'
        )
      `).run(subId, existingLib.id, existingLib.owner_id, activatedAt);

      // Update library entity
      db.prepare(`
        UPDATE libraries 
        SET subscription_id = ?, subscription_status = 'ACTIVE', subscription_expiry = ?
        WHERE id = ?
      `).run(subId, expiry, existingLib.id);
    }

    console.log('✅ Library Listing Subscription Plans, Rules & Demo Subscription seeded');
  }

if (require.main === module) {
  runSeed();
}

module.exports = runSeed;
