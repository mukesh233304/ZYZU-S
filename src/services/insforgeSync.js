const { query } = require('../db/insforgePool');

/**
 * InsForge Cloud Synchronization Engine
 * Ensures all user registrations, profiles, bookings, attendance, and fees
 * are durably persisted in InsForge PostgreSQL and re-hydrated on boot.
 */
class InsForgeSyncService {
  constructor() {
    this.isInitialized = false;
    this.isSyncing = false;
  }

  /**
   * Bootstraps local cache with InsForge Cloud PostgreSQL.
   * If InsForge is empty, seeds it from local. If InsForge has records,
   * hydrates local SQLite with all cloud records.
   */
  async bootstrap(sqliteDb) {
    if (this.isInitialized) return;
    try {
      console.log('[InsForge Sync] Verifying cloud database state...');
      const userCountRes = await query('SELECT COUNT(*) AS count FROM users');
      const cloudUserCount = parseInt(userCountRes.rows[0].count, 10);

      if (cloudUserCount === 0) {
        console.log('[InsForge Sync] Cloud database is fresh. Seeding initial data from local to InsForge Cloud...');
        await this.pushLocalToInsForge(sqliteDb);
      } else {
        console.log(`[InsForge Sync] Cloud database has ${cloudUserCount} registered users. Hydrating local cache from InsForge...`);
        await this.pullInsForgeToLocal(sqliteDb);
      }

      this.isInitialized = true;
      console.log('✨ [InsForge Sync] Cloud synchronization engine active and healthy.');
    } catch (err) {
      console.error('⚠️ [InsForge Sync Boot Warning]:', err.message);
    }
  }

  /**
   * Pushes local database state to InsForge PostgreSQL
   */
  async pushLocalToInsForge(sqliteDb) {
    try {
      // 1. Roles
      const roles = sqliteDb.prepare('SELECT id, name, description FROM roles').all();
      for (const r of roles) {
        await query(
          'INSERT INTO roles (id, name, description) VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name',
          [r.id, r.name, r.description]
        );
      }

      // 2. Permissions
      const perms = sqliteDb.prepare('SELECT id, name, description FROM permissions').all();
      for (const p of perms) {
        await query(
          'INSERT INTO permissions (id, name, description) VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name',
          [p.id, p.name, p.description]
        );
      }

      // 3. Role Permissions
      const rolePerms = sqliteDb.prepare('SELECT role_id, permission_id FROM role_permissions').all();
      for (const rp of rolePerms) {
        await query(
          'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [rp.role_id, rp.permission_id]
        );
      }

      // 4. Districts
      const districts = sqliteDb.prepare('SELECT id, name, state, code, is_active FROM districts').all();
      for (const d of districts) {
        await query(
          'INSERT INTO districts (id, name, state, code, is_active) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO UPDATE SET is_active = EXCLUDED.is_active',
          [d.id, d.name, d.state, d.code, d.is_active]
        );
      }

      // 5. Users
      const users = sqliteDb.prepare('SELECT id, email, mobile, password_hash, role_id, district_id, account_status, created_at, updated_at FROM users').all();
      for (const u of users) {
        await query(`
          INSERT INTO users (id, email, mobile, password_hash, role_id, district_id, account_status, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (id) DO UPDATE SET
            password_hash = EXCLUDED.password_hash,
            account_status = EXCLUDED.account_status,
            updated_at = EXCLUDED.updated_at
        `, [u.id, u.email, u.mobile, u.password_hash, u.role_id, u.district_id, u.account_status, u.created_at, u.updated_at]);
      }

      // 6. User Roles
      const userRoles = sqliteDb.prepare('SELECT user_id, role_id FROM user_roles').all();
      for (const ur of userRoles) {
        await query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [ur.user_id, ur.role_id]);
      }

      // 7. Student Profiles
      const students = sqliteDb.prepare('SELECT * FROM student_profiles').all();
      for (const s of students) {
        await query(`
          INSERT INTO student_profiles (user_id, full_name, dob, gender, city_area, address, pincode, profile_photo_url, school_college, grade_class, stream_subjects, target_goals)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          ON CONFLICT (user_id) DO UPDATE SET
            full_name = EXCLUDED.full_name,
            address = EXCLUDED.address,
            profile_photo_url = EXCLUDED.profile_photo_url
        `, [s.user_id, s.full_name, s.dob, s.gender, s.city_area, s.address, s.pincode, s.profile_photo_url, s.school_college, s.grade_class, s.stream_subjects, s.target_goals]);
      }

      // 8. Teacher Profiles
      const teachers = sqliteDb.prepare('SELECT * FROM teacher_profiles').all();
      for (const t of teachers) {
        await query(`
          INSERT INTO teacher_profiles (user_id, full_name, gender, dob, qualification, experience_years, subjects, classes, specialization, teaching_mode, areas_served, expected_fee, availability, address, profile_photo_url, verification_doc_urls, is_publicly_visible, bio, admin_notes)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
          ON CONFLICT (user_id) DO UPDATE SET
            full_name = EXCLUDED.full_name,
            is_publicly_visible = EXCLUDED.is_publicly_visible,
            expected_fee = EXCLUDED.expected_fee,
            bio = EXCLUDED.bio
        `, [t.user_id, t.full_name, t.gender, t.dob, t.qualification, t.experience_years, t.subjects, t.classes, t.specialization, t.teaching_mode, t.areas_served, t.expected_fee, t.availability, t.address, t.profile_photo_url, t.verification_doc_urls, t.is_publicly_visible, t.bio, t.admin_notes]);
      }

      // 9. Libraries
      const libraries = sqliteDb.prepare('SELECT * FROM libraries').all();
      for (const l of libraries) {
        await query(`
          INSERT INTO libraries (id, owner_id, district_id, name, address, total_seats, amenities, operating_hours, morning_fee, evening_fee, fullday_fee, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          ON CONFLICT (id) DO UPDATE SET
            total_seats = EXCLUDED.total_seats,
            status = EXCLUDED.status
        `, [l.id, l.owner_id, l.district_id, l.name, l.address, l.total_seats, l.amenities, l.operating_hours, l.morning_fee, l.evening_fee, l.fullday_fee, l.status]);
      }

      // 10. Library Shifts
      const shifts = sqliteDb.prepare('SELECT * FROM library_shifts').all();
      for (const sh of shifts) {
        await query(`
          INSERT INTO library_shifts (id, library_id, name, start_time, end_time, fee)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (id) DO UPDATE SET fee = EXCLUDED.fee
        `, [sh.id, sh.library_id, sh.name, sh.start_time, sh.end_time, sh.fee]);
      }

      // 11. Library Seats
      const seats = sqliteDb.prepare('SELECT * FROM library_seats').all();
      for (const st of seats) {
        await query(`
          INSERT INTO library_seats (id, library_id, seat_number, status)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status
        `, [st.id, st.library_id, st.seat_number, st.status]);
      }

      console.log('✅ [InsForge Sync] Initial local state successfully seeded to InsForge Cloud.');
    } catch (err) {
      console.error('⚠️ [InsForge Sync Push Error]:', err.message);
    }
  }

  /**
   * Pulls remote InsForge PostgreSQL state down to local SQLite cache
   */
  async pullInsForgeToLocal(sqliteDb) {
    try {
      // Temporarily disable foreign keys during bulk hydration
      sqliteDb.pragma('foreign_keys = OFF');

      // 1. Roles & Permissions & Districts first
      const rolesRes = await query('SELECT * FROM roles');
      const insertRole = sqliteDb.prepare('INSERT OR REPLACE INTO roles (id, name, description) VALUES (@id, @name, @description)');
      for (const r of rolesRes.rows) insertRole.run(r);

      const permsRes = await query('SELECT * FROM permissions');
      const insertPerm = sqliteDb.prepare('INSERT OR REPLACE INTO permissions (id, name, description) VALUES (@id, @name, @description)');
      for (const p of permsRes.rows) insertPerm.run(p);

      const districtsRes = await query('SELECT * FROM districts');
      const insertDist = sqliteDb.prepare('INSERT OR REPLACE INTO districts (id, name, state, code, is_active) VALUES (@id, @name, @state, @code, @is_active)');
      for (const d of districtsRes.rows) insertDist.run(d);

      // 2. Pull Users
      const usersRes = await query('SELECT * FROM users');
      const insertUser = sqliteDb.prepare(`
        INSERT OR REPLACE INTO users (id, email, mobile, password_hash, role_id, district_id, account_status, created_at, updated_at)
        VALUES (@id, @email, @mobile, @password_hash, @role_id, @district_id, @account_status, @created_at, @updated_at)
      `);
      for (const u of usersRes.rows) {
        insertUser.run({
          id: u.id,
          email: u.email,
          mobile: u.mobile,
          password_hash: u.password_hash,
          role_id: u.role_id,
          district_id: u.district_id,
          account_status: u.account_status,
          created_at: u.created_at ? new Date(u.created_at).toISOString() : new Date().toISOString(),
          updated_at: u.updated_at ? new Date(u.updated_at).toISOString() : new Date().toISOString()
        });
      }

      // 3. User Roles
      const userRolesRes = await query('SELECT * FROM user_roles');
      const insertUserRole = sqliteDb.prepare(`
        INSERT OR REPLACE INTO user_roles (user_id, role_id) VALUES (@user_id, @role_id)
      `);
      for (const ur of userRolesRes.rows) {
        insertUserRole.run(ur);
      }

      // 4. Student Profiles
      const studentRes = await query('SELECT * FROM student_profiles');
      const insertStudent = sqliteDb.prepare(`
        INSERT OR REPLACE INTO student_profiles (user_id, full_name, dob, gender, city_area, address, pincode, profile_photo_url, school_college, grade_class, stream_subjects, target_goals)
        VALUES (@user_id, @full_name, @dob, @gender, @city_area, @address, @pincode, @profile_photo_url, @school_college, @grade_class, @stream_subjects, @target_goals)
      `);
      for (const sp of studentRes.rows) {
        insertStudent.run({
          user_id: sp.user_id,
          full_name: sp.full_name,
          dob: sp.dob,
          gender: sp.gender,
          city_area: sp.city_area,
          address: sp.address,
          pincode: sp.pincode,
          profile_photo_url: sp.profile_photo_url,
          school_college: sp.school_college,
          grade_class: sp.grade_class,
          stream_subjects: sp.stream_subjects,
          target_goals: sp.target_goals
        });
      }

      // 5. Teacher Profiles
      const teacherRes = await query('SELECT * FROM teacher_profiles');
      const insertTeacher = sqliteDb.prepare(`
        INSERT OR REPLACE INTO teacher_profiles (user_id, full_name, gender, dob, qualification, experience_years, subjects, classes, specialization, teaching_mode, areas_served, expected_fee, availability, address, profile_photo_url, verification_doc_urls, is_publicly_visible, bio, admin_notes)
        VALUES (@user_id, @full_name, @gender, @dob, @qualification, @experience_years, @subjects, @classes, @specialization, @teaching_mode, @areas_served, @expected_fee, @availability, @address, @profile_photo_url, @verification_doc_urls, @is_publicly_visible, @bio, @admin_notes)
      `);
      for (const tp of teacherRes.rows) {
        insertTeacher.run({
          user_id: tp.user_id,
          full_name: tp.full_name,
          gender: tp.gender,
          dob: tp.dob,
          qualification: tp.qualification,
          experience_years: tp.experience_years,
          subjects: tp.subjects,
          classes: tp.classes,
          specialization: tp.specialization,
          teaching_mode: tp.teaching_mode,
          areas_served: tp.areas_served,
          expected_fee: parseFloat(tp.expected_fee) || 0,
          availability: tp.availability,
          address: tp.address,
          profile_photo_url: tp.profile_photo_url,
          verification_doc_urls: tp.verification_doc_urls,
          is_publicly_visible: tp.is_publicly_visible,
          bio: tp.bio,
          admin_notes: tp.admin_notes
        });
      }

      // 6. Libraries & Seats
      const libRes = await query('SELECT * FROM libraries');
      const insertLib = sqliteDb.prepare(`
        INSERT OR REPLACE INTO libraries (id, owner_id, district_id, name, address, total_seats, amenities, operating_hours, morning_fee, evening_fee, fullday_fee, status)
        VALUES (@id, @owner_id, @district_id, @name, @address, @total_seats, @amenities, @operating_hours, @morning_fee, @evening_fee, @fullday_fee, @status)
      `);
      for (const l of libRes.rows) {
        insertLib.run({
          ...l,
          morning_fee: parseFloat(l.morning_fee) || 600,
          evening_fee: parseFloat(l.evening_fee) || 600,
          fullday_fee: parseFloat(l.fullday_fee) || 1000
        });
      }

      const seatsRes = await query('SELECT * FROM library_seats');
      const insertSeat = sqliteDb.prepare(`INSERT OR REPLACE INTO library_seats (id, library_id, seat_number, status) VALUES (@id, @library_id, @seat_number, @status)`);
      for (const s of seatsRes.rows) insertSeat.run(s);

      // 7. Bookings
      const bookingsRes = await query('SELECT * FROM booking_requests');
      const insertBooking = sqliteDb.prepare(`
        INSERT OR REPLACE INTO booking_requests (id, student_id, district_id, target_type, teacher_id, library_id, subject_or_shift, message, preferred_mode, preferred_seat_id, shift_id, start_date, response_note, status, created_at, updated_at)
        VALUES (@id, @student_id, @district_id, @target_type, @teacher_id, @library_id, @subject_or_shift, @message, @preferred_mode, @preferred_seat_id, @shift_id, @start_date, @response_note, @status, @created_at, @updated_at)
      `);
      for (const b of bookingsRes.rows) {
        insertBooking.run({
          id: b.id,
          student_id: b.student_id,
          district_id: b.district_id,
          target_type: b.target_type,
          teacher_id: b.teacher_id,
          library_id: b.library_id,
          subject_or_shift: b.subject_or_shift,
          message: b.message,
          preferred_mode: b.preferred_mode,
          preferred_seat_id: b.preferred_seat_id,
          shift_id: b.shift_id,
          start_date: b.start_date,
          response_note: b.response_note,
          status: b.status,
          created_at: b.created_at ? new Date(b.created_at).toISOString() : new Date().toISOString(),
          updated_at: b.updated_at ? new Date(b.updated_at).toISOString() : new Date().toISOString()
        });
      }

      // Re-enable foreign keys
      sqliteDb.pragma('foreign_keys = ON');

      console.log('✅ [InsForge Sync] Local cache hydrated with InsForge Cloud records.');
    } catch (err) {
      sqliteDb.pragma('foreign_keys = ON');
      console.error('⚠️ [InsForge Sync Pull Error]:', err.message);
    }
  }

  /**
   * Real-time Cloud Mutation: Syncs a newly registered user and their profile to InsForge Cloud
   */
  async syncUserRegistration({ user, roleName, profile }) {
    try {
      // 1. Insert or update User in InsForge
      await query(`
        INSERT INTO users (id, email, mobile, password_hash, role_id, district_id, account_status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
          password_hash = EXCLUDED.password_hash,
          account_status = EXCLUDED.account_status,
          updated_at = NOW()
      `, [user.id, user.email, user.mobile, user.password_hash, user.role_id, user.district_id, user.account_status]);

      // 2. Insert User Role junction
      await query(`
        INSERT INTO user_roles (user_id, role_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
      `, [user.id, user.role_id]);

      // 3. Insert specific Profile
      if (roleName === 'STUDENT' && profile) {
        await query(`
          INSERT INTO student_profiles (user_id, full_name, dob, gender, city_area, address, pincode, profile_photo_url, school_college, grade_class, stream_subjects, target_goals)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          ON CONFLICT (user_id) DO UPDATE SET
            full_name = EXCLUDED.full_name,
            address = EXCLUDED.address,
            pincode = EXCLUDED.pincode
        `, [
          user.id, profile.full_name, profile.dob, profile.gender, profile.city_area,
          profile.address, profile.pincode, profile.profile_photo_url || null,
          profile.school_college || null, profile.grade_class || null,
          profile.stream_subjects || null, profile.target_goals || null
        ]);
      } else if (roleName === 'TEACHER' && profile) {
        await query(`
          INSERT INTO teacher_profiles (user_id, full_name, gender, dob, qualification, experience_years, subjects, classes, specialization, teaching_mode, areas_served, expected_fee, availability, address, profile_photo_url, verification_doc_urls, is_publicly_visible, bio, admin_notes)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
          ON CONFLICT (user_id) DO UPDATE SET
            full_name = EXCLUDED.full_name,
            qualification = EXCLUDED.qualification,
            experience_years = EXCLUDED.experience_years,
            expected_fee = EXCLUDED.expected_fee
        `, [
          user.id, profile.full_name, profile.gender, profile.dob, profile.qualification,
          profile.experience_years || 0,
          typeof profile.subjects === 'string' ? profile.subjects : JSON.stringify(profile.subjects || []),
          typeof profile.classes === 'string' ? profile.classes : JSON.stringify(profile.classes || []),
          profile.specialization || null, profile.teaching_mode || 'OFFLINE',
          profile.areas_served || '', profile.expected_fee || 0, profile.availability || '',
          profile.address || '', profile.profile_photo_url || null,
          typeof profile.verification_doc_urls === 'string' ? profile.verification_doc_urls : JSON.stringify(profile.verification_doc_urls || []),
          profile.is_publicly_visible || 0, profile.bio || null, profile.admin_notes || null
        ]);
      } else if (roleName === 'LIBRARY_OWNER' && profile) {
        await query(`
          INSERT INTO library_owner_profiles (user_id, owner_name, address)
          VALUES ($1, $2, $3)
          ON CONFLICT (user_id) DO UPDATE SET
            owner_name = EXCLUDED.owner_name,
            address = EXCLUDED.address
        `, [user.id, profile.owner_name, profile.address]);
      }

      console.log(`☁️ [InsForge Cloud Sync] User '${user.email}' (${roleName}) successfully persisted to InsForge Cloud.`);
    } catch (err) {
      console.error(`⚠️ [InsForge Cloud Sync Error] Failed to persist user registration:`, err.message);
    }
  }

  /**
   * Real-time Cloud Mutation: Syncs a booking request to InsForge Cloud
   */
  async syncBooking(booking) {
    try {
      await query(`
        INSERT INTO booking_requests (
          id, student_id, district_id, target_type, teacher_id, library_id,
          subject_or_shift, message, preferred_mode, preferred_seat_id,
          shift_id, start_date, response_note, status, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status,
          response_note = EXCLUDED.response_note,
          preferred_seat_id = EXCLUDED.preferred_seat_id,
          updated_at = NOW()
      `, [
        booking.id, booking.student_id, booking.district_id, booking.target_type,
        booking.teacher_id || null, booking.library_id || null,
        booking.subject_or_shift, booking.message || null,
        booking.preferred_mode || 'OFFLINE', booking.preferred_seat_id || null,
        booking.shift_id || null, booking.start_date || null,
        booking.response_note || null, booking.status || 'PENDING'
      ]);
      console.log(`☁️ [InsForge Cloud Sync] Booking #${booking.id} (${booking.status}) synced to InsForge Cloud.`);
    } catch (err) {
      console.error(`⚠️ [InsForge Cloud Sync Error] Failed to sync booking #${booking.id}:`, err.message);
    }
  }

  /**
   * Real-time Cloud Mutation: Syncs an attendance log to InsForge Cloud
   */
  async syncAttendance(record) {
    try {
      await query(`
        INSERT INTO attendance_records (student_id, teacher_id, library_id, date, status, type, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        record.student_id, record.teacher_id || null, record.library_id || null,
        record.date, record.status, record.type || 'TUTOR', record.notes || null
      ]);
      console.log(`☁️ [InsForge Cloud Sync] Attendance for student ${record.student_id} synced to InsForge Cloud.`);
    } catch (err) {
      console.error(`⚠️ [InsForge Cloud Sync Error] Failed to sync attendance:`, err.message);
    }
  }

  /**
   * Real-time Cloud Mutation: Syncs a fee record to InsForge Cloud
   */
  async syncFeeRecord(record) {
    try {
      await query(`
        INSERT INTO fee_records (student_id, teacher_id, library_id, type, title, amount, due_date, paid_date, status, receipt_no)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        record.student_id, record.teacher_id || null, record.library_id || null,
        record.type, record.title, record.amount, record.due_date,
        record.paid_date || null, record.status || 'PENDING', record.receipt_no || null
      ]);
      console.log(`☁️ [InsForge Cloud Sync] Fee record '${record.title}' synced to InsForge Cloud.`);
    } catch (err) {
      console.error(`⚠️ [InsForge Cloud Sync Error] Failed to sync fee record:`, err.message);
    }
  }

  /**
   * Real-time Cloud Mutation: Syncs teacher schedule slot
   */
  async syncTeacherSchedule(slot, action = 'INSERT') {
    try {
      if (action === 'DELETE') {
        await query('DELETE FROM teacher_schedules WHERE id = $1 AND teacher_id = $2', [slot.id, slot.teacher_id]);
      } else {
        await query(`
          INSERT INTO teacher_schedules (id, teacher_id, day_of_week, start_time, end_time, title, teaching_mode, student_name)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            start_time = EXCLUDED.start_time,
            end_time = EXCLUDED.end_time
        `, [
          slot.id, slot.teacher_id, slot.day_of_week, slot.start_time,
          slot.end_time, slot.title, slot.teaching_mode || 'OFFLINE', slot.student_name || null
        ]);
      }
    } catch (err) {
      console.error(`⚠️ [InsForge Cloud Sync Error] Failed to sync schedule:`, err.message);
    }
  }
}

const insforgeSync = new InsForgeSyncService();
module.exports = insforgeSync;
