const db = require('../db/database');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { cleanString } = require('../middleware/validation');
const insforgeSync = require('../services/insforgeSync');
const bookingConfirmationService = require('../services/bookingConfirmationService');

// Helper to get or create library for the logged in owner
function getOwnerLibrary(ownerId) {
  let lib = db.prepare('SELECT * FROM libraries WHERE owner_id = ?').get(ownerId);
  if (!lib) {
    // If owner has no library registered yet, create default entry from their profile
    const owner = db.prepare(`
      SELECT u.district_id, lop.owner_name, lop.address
      FROM users u
      LEFT JOIN library_owner_profiles lop ON u.id = lop.user_id
      WHERE u.id = ?
    `).get(ownerId);

    const libName = owner && owner.owner_name ? `${owner.owner_name}'s Study Library` : "ZYZU'S Study Library";
    const libAddr = owner && owner.address ? owner.address : 'Main Road, Study Center';
    const distId = owner && owner.district_id ? owner.district_id : 1;

    const res = db.prepare(`
      INSERT INTO libraries (owner_id, district_id, name, address, total_seats, amenities, operating_hours, morning_fee, evening_fee, fullday_fee, status)
      VALUES (?, ?, ?, ?, 40, ?, '6:00 AM - 11:00 PM', 700, 700, 1200, 'ACTIVE')
    `).run(
      ownerId,
      distId,
      libName,
      libAddr,
      JSON.stringify(['AC', 'High-Speed WiFi', 'RO Water', 'Lockers', 'CCTV'])
    );

    const libId = res.lastInsertRowid;

    // Create default shifts
    db.prepare(`INSERT INTO library_shifts (library_id, name, start_time, end_time, fee) VALUES (?, ?, ?, ?, ?)`).run(libId, 'Morning Shift (6:00 AM - 12:00 PM)', '06:00', '12:00', 700);
    db.prepare(`INSERT INTO library_shifts (library_id, name, start_time, end_time, fee) VALUES (?, ?, ?, ?, ?)`).run(libId, 'Evening Shift (12:00 PM - 6:00 PM)', '12:00', '18:00', 700);
    db.prepare(`INSERT INTO library_shifts (library_id, name, start_time, end_time, fee) VALUES (?, ?, ?, ?, ?)`).run(libId, 'Full Day (6:00 AM - 11:00 PM)', '06:00', '23:00', 1200);

    // Create default 40 seats
    const insertSeat = db.prepare(`INSERT INTO library_seats (library_id, seat_number, status) VALUES (?, ?, ?)`);
    for (let i = 1; i <= 40; i++) {
      insertSeat.run(libId, `S-${i < 10 ? '0' + i : i}`, 'AVAILABLE');
    }

    lib = db.prepare('SELECT * FROM libraries WHERE id = ?').get(libId);
  }
  return lib;
}

// 1. Library Dashboard Overview
exports.getOverview = (req, res) => {
  const ownerId = req.user.id;

  try {
    const lib = getOwnerLibrary(ownerId);

    // Seats summary
    const seatStats = db.prepare(`
      SELECT
        COUNT(*) AS total_seats,
        SUM(CASE WHEN status = 'OCCUPIED' THEN 1 ELSE 0 END) AS occupied_seats,
        SUM(CASE WHEN status = 'AVAILABLE' THEN 1 ELSE 0 END) AS available_seats
      FROM library_seats
      WHERE library_id = ?
    `).get(lib.id);

    // Active Enrolled Students Count
    const activeMembers = db.prepare(`
      SELECT COUNT(*) AS count
      FROM library_enrollments
      WHERE library_id = ? AND status = 'ACTIVE'
    `).get(lib.id).count;

    // Available Shifts Count
    const shiftsCount = db.prepare(`
      SELECT COUNT(*) AS count
      FROM library_shifts
      WHERE library_id = ?
    `).get(lib.id).count;

    // Monthly Revenue
    const revenueStats = db.prepare(`
      SELECT COALESCE(SUM(monthly_fee), 0) AS monthly_revenue
      FROM library_enrollments
      WHERE library_id = ? AND status = 'ACTIVE'
    `).get(lib.id).monthly_revenue;

    // Pending Dues
    const pendingDues = db.prepare(`
      SELECT
        COUNT(*) AS count,
        COALESCE(SUM(amount), 0) AS total
      FROM fee_records
      WHERE library_id = ? AND status IN ('PENDING', 'OVERDUE')
    `).get(lib.id);

    return res.status(200).json({
      success: true,
      overview: {
        libraryName: lib.name,
        libraryStatus: lib.status,
        totalSeats: seatStats.total_seats || lib.total_seats,
        occupiedSeats: seatStats.occupied_seats || 0,
        availableSeats: seatStats.available_seats || 0,
        activeMembers,
        shiftsCount,
        monthlyRevenue: revenueStats,
        pendingFeesCount: pendingDues.count,
        pendingFeesAmount: pendingDues.total
      }
    });
  } catch (err) {
    console.error('Error in library getOverview:', err);
    return res.status(500).json({ success: false, message: 'Failed to load library overview' });
  }
};

// 2. Library Profile (Read & Edit)
exports.getProfile = (req, res) => {
  const ownerId = req.user.id;

  try {
    const lib = getOwnerLibrary(ownerId);
    let amenitiesList = [];
    if (lib.amenities) {
      try { amenitiesList = JSON.parse(lib.amenities); } catch (e) {}
    }

    return res.status(200).json({
      success: true,
      library: {
        ...lib,
        amenities: amenitiesList
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load library profile' });
  }
};

exports.updateProfile = (req, res) => {
  const ownerId = req.user.id;
  const {
    name,
    address,
    total_seats,
    amenities,
    operating_hours,
    morning_fee,
    evening_fee,
    fullday_fee
  } = req.body;

  try {
    const lib = getOwnerLibrary(ownerId);

    const formattedAmenities = amenities
      ? (Array.isArray(amenities) ? JSON.stringify(amenities) : JSON.stringify(amenities.split(',').map(a => a.trim()).filter(Boolean)))
      : null;

    db.prepare(`
      UPDATE libraries
      SET name = COALESCE(?, name),
          address = COALESCE(?, address),
          total_seats = COALESCE(?, total_seats),
          amenities = COALESCE(?, amenities),
          operating_hours = COALESCE(?, operating_hours),
          morning_fee = COALESCE(?, morning_fee),
          evening_fee = COALESCE(?, evening_fee),
          fullday_fee = COALESCE(?, fullday_fee)
      WHERE id = ?
    `).run(
      name ? cleanString(name) : null,
      address ? cleanString(address) : null,
      total_seats !== undefined ? parseInt(total_seats, 10) : null,
      formattedAmenities,
      operating_hours ? cleanString(operating_hours) : null,
      morning_fee !== undefined ? parseFloat(morning_fee) : null,
      evening_fee !== undefined ? parseFloat(evening_fee) : null,
      fullday_fee !== undefined ? parseFloat(fullday_fee) : null,
      lib.id
    );

    return res.status(200).json({ success: true, message: 'Library profile updated successfully!' });
  } catch (err) {
    console.error('Error updating library profile:', err);
    return res.status(500).json({ success: false, message: 'Failed to update library profile' });
  }
};

// 3. Students (Enrolled Members)
exports.getStudents = (req, res) => {
  const ownerId = req.user.id;

  try {
    const lib = getOwnerLibrary(ownerId);

    const members = db.prepare(`
      SELECT
        le.id AS enrollment_id,
        le.monthly_fee,
        le.start_date,
        le.end_date,
        le.status AS enrollment_status,
        sp.full_name AS student_name,
        sp.city_area,
        sp.school_college,
        u.email AS student_email,
        u.mobile AS student_mobile,
        ls.seat_number,
        lsh.name AS shift_name
      FROM library_enrollments le
      JOIN users u ON le.student_id = u.id
      JOIN student_profiles sp ON u.id = sp.user_id
      LEFT JOIN library_seats ls ON le.seat_id = ls.id
      LEFT JOIN library_shifts lsh ON le.shift_id = lsh.id
      WHERE le.library_id = ?
      ORDER BY le.status ASC, le.start_date DESC
    `).all(lib.id);

    return res.status(200).json({ success: true, students: members });
  } catch (err) {
    console.error('Error fetching library students:', err);
    return res.status(500).json({ success: false, message: 'Failed to load library students' });
  }
};

// 4. Seats Visual Matrix
exports.getSeats = (req, res) => {
  const ownerId = req.user.id;

  try {
    const lib = getOwnerLibrary(ownerId);

    const seats = db.prepare(`
      SELECT
        ls.id,
        ls.seat_number,
        ls.status,
        sp.full_name AS occupied_by,
        lsh.name AS current_shift
      FROM library_seats ls
      LEFT JOIN library_enrollments le ON ls.id = le.seat_id AND le.status = 'ACTIVE'
      LEFT JOIN student_profiles sp ON le.student_id = sp.user_id
      LEFT JOIN library_shifts lsh ON le.shift_id = lsh.id
      WHERE ls.library_id = ?
      ORDER BY ls.seat_number ASC
    `).all(lib.id);

    return res.status(200).json({ success: true, seats });
  } catch (err) {
    console.error('Error fetching library seats:', err);
    return res.status(500).json({ success: false, message: 'Failed to load seats' });
  }
};

// 5. Shifts Management
exports.getShifts = (req, res) => {
  const ownerId = req.user.id;

  try {
    const lib = getOwnerLibrary(ownerId);
    const shifts = db.prepare(`
      SELECT id, name, start_time, end_time, fee
      FROM library_shifts
      WHERE library_id = ?
      ORDER BY start_time ASC
    `).all(lib.id);

    return res.status(200).json({ success: true, shifts });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load shifts' });
  }
};

exports.addShift = (req, res) => {
  const ownerId = req.user.id;
  const { name, start_time, end_time, fee } = req.body;

  if (!name || !start_time || !end_time || fee === undefined) {
    return res.status(400).json({ success: false, message: 'All shift fields are required' });
  }

  try {
    const lib = getOwnerLibrary(ownerId);
    db.prepare(`
      INSERT INTO library_shifts (library_id, name, start_time, end_time, fee)
      VALUES (?, ?, ?, ?, ?)
    `).run(lib.id, cleanString(name), start_time, end_time, parseFloat(fee));

    return res.status(201).json({ success: true, message: 'Shift created successfully!' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create shift' });
  }
};

// 6. Attendance Tracking
exports.getAttendance = (req, res) => {
  const ownerId = req.user.id;

  try {
    const lib = getOwnerLibrary(ownerId);

    const records = db.prepare(`
      SELECT
        ar.id, ar.date, ar.status, ar.notes,
        sp.full_name AS student_name,
        u.mobile AS student_mobile
      FROM attendance_records ar
      JOIN users u ON ar.student_id = u.id
      JOIN student_profiles sp ON u.id = sp.user_id
      WHERE ar.library_id = ?
      ORDER BY ar.date DESC
      LIMIT 50
    `).all(lib.id);

    return res.status(200).json({ success: true, records });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load attendance' });
  }
};

exports.markAttendance = (req, res) => {
  const ownerId = req.user.id;
  const { student_id, date, status, notes } = req.body;

  try {
    const lib = getOwnerLibrary(ownerId);
    db.prepare(`
      INSERT INTO attendance_records (student_id, library_id, date, status, type, notes)
      VALUES (?, ?, ?, ?, 'LIBRARY', ?)
    `).run(student_id, lib.id, date, status, cleanString(notes));

    return res.status(201).json({ success: true, message: 'Member attendance logged' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to log attendance' });
  }
};

// 7. Fees Management
exports.getFees = (req, res) => {
  const ownerId = req.user.id;

  try {
    const lib = getOwnerLibrary(ownerId);

    const fees = db.prepare(`
      SELECT
        fr.id, fr.title, fr.amount, fr.due_date, fr.paid_date, fr.status, fr.receipt_no,
        sp.full_name AS student_name,
        u.mobile AS student_mobile
      FROM fee_records fr
      JOIN users u ON fr.student_id = u.id
      JOIN student_profiles sp ON u.id = sp.user_id
      WHERE fr.library_id = ?
      ORDER BY fr.due_date DESC
    `).all(lib.id);

    return res.status(200).json({ success: true, fees });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load fees' });
  }
};

// 8. Revenue Summary
exports.getRevenue = (req, res) => {
  const ownerId = req.user.id;

  try {
    const lib = getOwnerLibrary(ownerId);

    const monthlyTotal = db.prepare(`
      SELECT COALESCE(SUM(monthly_fee), 0) AS total
      FROM library_enrollments
      WHERE library_id = ? AND status = 'ACTIVE'
    `).get(lib.id).total;

    const shiftBreakdown = db.prepare(`
      SELECT
        lsh.name AS shift_name,
        COUNT(le.id) AS member_count,
        COALESCE(SUM(le.monthly_fee), 0) AS shift_revenue
      FROM library_shifts lsh
      LEFT JOIN library_enrollments le ON lsh.id = le.shift_id AND le.status = 'ACTIVE'
      WHERE lsh.library_id = ?
      GROUP BY lsh.id
    `).all(lib.id);

    return res.status(200).json({
      success: true,
      revenue: {
        monthlyTotal,
        shiftBreakdown
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load revenue' });
  }
};

// 9. Bookings / Seat Reservations
exports.getBookings = (req, res) => {
  const ownerId = req.user.id;

  try {
    const lib = getOwnerLibrary(ownerId);

    const bookings = db.prepare(`
      SELECT
        br.id, br.subject_or_shift, br.preferred_mode, br.preferred_seat_id,
        br.shift_id, br.start_date, br.message, br.status, br.response_note,
        br.created_at, br.updated_at,
        sp.full_name AS student_name,
        sp.city_area,
        sp.school_college,
        sp.grade_class,
        u.email AS student_email,
        u.mobile AS student_mobile,
        ls.seat_number AS preferred_seat_number,
        lsh.name AS shift_name,
        lsh.fee AS shift_fee
      FROM booking_requests br
      JOIN users u ON br.student_id = u.id
      JOIN student_profiles sp ON u.id = sp.user_id
      LEFT JOIN library_seats ls ON br.preferred_seat_id = ls.id
      LEFT JOIN library_shifts lsh ON br.shift_id = lsh.id
      WHERE br.library_id = ?
      ORDER BY
        CASE br.status
          WHEN 'PENDING' THEN 1
          WHEN 'ACCEPTED' THEN 2
          WHEN 'REJECTED' THEN 3
          WHEN 'CANCELLED' THEN 4
        END,
        br.created_at DESC
    `).all(lib.id);

    return res.status(200).json({ success: true, bookings });
  } catch (err) {
    console.error('Error loading library bookings:', err);
    return res.status(500).json({ success: false, message: 'Failed to load bookings' });
  }
};

exports.respondBooking = (req, res) => {
  const ownerId = req.user.id;
  const { id } = req.params;
  const { action, response_note, seat_id, shift_id, monthly_fee } = req.body;

  if (!['ACCEPT', 'REJECT'].includes(action)) {
    return res.status(400).json({ success: false, message: 'Action must be ACCEPT or REJECT' });
  }

  try {
    const lib = getOwnerLibrary(ownerId);

    const booking = db.prepare(`
      SELECT br.*, sp.full_name AS student_name
      FROM booking_requests br
      JOIN users u ON br.student_id = u.id
      JOIN student_profiles sp ON u.id = sp.user_id
      WHERE br.id = ? AND br.library_id = ?
    `).get(id, lib.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking request not found' });
    }

    if (booking.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Booking request has already been ${booking.status.toLowerCase()}`
      });
    }

    let allocatedSeat = null;
    let determinedFee = 0;
    let determinedShift = null;
    const transaction = db.transaction(() => {
      if (action === 'ACCEPT') {
        // Find or validate seat
        const targetSeatId = seat_id || booking.preferred_seat_id;

        if (targetSeatId) {
          allocatedSeat = db.prepare(`
            SELECT id, seat_number, status
            FROM library_seats
            WHERE id = ? AND library_id = ?
          `).get(targetSeatId, lib.id);

          if (!allocatedSeat || allocatedSeat.status !== 'AVAILABLE') {
            // Target seat taken, try fallback to any available seat
            allocatedSeat = db.prepare(`
              SELECT id, seat_number, status
              FROM library_seats
              WHERE library_id = ? AND status = 'AVAILABLE'
              ORDER BY id ASC
              LIMIT 1
            `).get(lib.id);
          }
        } else {
          allocatedSeat = db.prepare(`
            SELECT id, seat_number, status
            FROM library_seats
            WHERE library_id = ? AND status = 'AVAILABLE'
            ORDER BY id ASC
            LIMIT 1
          `).get(lib.id);
        }

        if (!allocatedSeat) {
          throw new Error('No available seats remaining in this library');
        }

        // Determine shift and fee
        let targetShiftId = shift_id || booking.shift_id;
        let shiftRow = null;
        if (targetShiftId) {
          shiftRow = db.prepare('SELECT id, name, fee FROM library_shifts WHERE id = ? AND library_id = ?').get(targetShiftId, lib.id);
        }
        if (!shiftRow) {
          shiftRow = db.prepare('SELECT id, name, fee FROM library_shifts WHERE library_id = ? LIMIT 1').get(lib.id);
        }

        determinedShift = shiftRow;
        determinedFee = parseFloat(monthly_fee) || (shiftRow ? shiftRow.fee : lib.morning_fee) || 600;
        const fee = determinedFee;
        const startDate = booking.start_date || new Date().toISOString().split('T')[0];
        const endDt = new Date(startDate);
        endDt.setDate(endDt.getDate() + 30);
        const endDate = endDt.toISOString().split('T')[0];

        // 1. Mark seat as OCCUPIED
        db.prepare("UPDATE library_seats SET status = 'OCCUPIED' WHERE id = ?").run(allocatedSeat.id);

        // 2. Create library student enrollment
        db.prepare(`
          INSERT INTO library_enrollments (
            library_id, student_id, seat_id, shift_id, monthly_fee, start_date, end_date, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
        `).run(lib.id, booking.student_id, allocatedSeat.id, shiftRow ? shiftRow.id : null, fee, startDate, endDate);

        // 3. Create initial fee record
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 7);
        const dueStr = dueDate.toISOString().split('T')[0];
        const receiptNo = `LIB-${Date.now().toString().slice(-6)}`;

        db.prepare(`
          INSERT INTO fee_records (
            student_id, library_id, type, title, amount, due_date, status, receipt_no
          ) VALUES (?, ?, 'LIBRARY', ?, ?, ?, 'PENDING', ?)
        `).run(
          booking.student_id,
          lib.id,
          `Library Desk Fee: Desk ${allocatedSeat.seat_number} (${shiftRow ? shiftRow.name : 'Standard'})`,
          fee,
          dueStr,
          receiptNo
        );

        // 4. Update booking request
        db.prepare(`
          UPDATE booking_requests
          SET status = 'ACCEPTED', preferred_seat_id = ?, shift_id = ?,
              response_note = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(
          allocatedSeat.id,
          shiftRow ? shiftRow.id : null,
          cleanString(response_note || `Desk ${allocatedSeat.seat_number} allocated`),
          id
        );

        // 5. Send notification to student
        db.prepare(`
          INSERT INTO notifications (user_id, title, message, type, link)
          VALUES (?, ?, ?, 'SUCCESS', '/dashboard/student?tab=library')
        `).run(
          booking.student_id,
          'Library Desk Reservation Approved!',
          `Your seat at ${lib.name} is confirmed! Allocated Desk #${allocatedSeat.seat_number}, Shift: ${shiftRow ? shiftRow.name : 'Standard'}.`
        );
      } else {
        // REJECT
        db.prepare(`
          UPDATE booking_requests
          SET status = 'REJECTED', response_note = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(cleanString(response_note || 'Desk requested is currently unavailable'), id);

        db.prepare(`
          INSERT INTO notifications (user_id, title, message, type, link)
          VALUES (?, ?, ?, 'WARNING', '/dashboard/student?tab=bookings')
        `).run(
          booking.student_id,
          'Library Reservation Update',
          `Your reservation request at ${lib.name} was declined. Note: ${response_note || 'Study center at capacity.'}`
        );
      }
    });

    transaction();

    // Trigger Authoritative Booking Confirmation Event, QR Pass & WhatsApp notification
    if (action === 'ACCEPT') {
      bookingConfirmationService.confirmBooking({
        studentId: booking.student_id,
        bookingId: `BK-LIB-${id}`,
        serviceType: 'LIBRARY',
        libraryId: lib.id,
        amount: determinedFee,
        paymentStatus: 'PAID',
        metadata: {
          libraryName: lib.name,
          libraryAddress: lib.address,
          seatNumber: allocatedSeat?.seat_number,
          shiftName: determinedShift ? determinedShift.name : 'Standard Shift'
        },
        skipInAppNotification: true
      }).catch(e => console.warn('Library booking confirmation hook notice:', e.message));
    }

    // Real-time Cloud Sync to InsForge
    insforgeSync.syncBooking({
      ...booking,
      status: action === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED',
      response_note: cleanString(response_note || ''),
      preferred_seat_id: action === 'ACCEPT' ? allocatedSeat.id : booking.preferred_seat_id
    });

    return res.status(200).json({
      success: true,
      message: action === 'ACCEPT' ? 'Desk allocated and member enrolled!' : 'Reservation request declined'
    });
  } catch (err) {
    console.error('Error responding to library booking:', err);
    return res.status(err.message.includes('No available seats') ? 400 : 500).json({
      success: false,
      message: err.message || 'Failed to respond to booking request'
    });
  }
};

// 10. Notifications
exports.getNotifications = (req, res) => {
  const ownerId = req.user.id;

  try {
    const notifications = db.prepare(`
      SELECT id, title, message, type, is_read, created_at
      FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 30
    `).all(ownerId);

    return res.status(200).json({ success: true, notifications });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load notifications' });
  }
};

// 11. Add Walk-In Student (Offline Ledger)
exports.addWalkInStudent = (req, res) => {
  const ownerId = req.user.id;
  const {
    full_name,
    mobile,
    email,
    seat_id,
    shift_id,
    monthly_fee,
    start_date,
    end_date,
    payment_status,
    notes
  } = req.body;

  if (!full_name || !mobile || !monthly_fee || !start_date || !end_date) {
    return res.status(400).json({
      success: false,
      message: 'Full name, mobile, monthly fee, and duration dates are required'
    });
  }

  try {
    const lib = getOwnerLibrary(ownerId);

    const transaction = db.transaction(() => {
      // 1. Check if user with this mobile already exists
      let user = db.prepare('SELECT * FROM users WHERE mobile = ?').get(mobile);
      let studentUserId;

      if (!user) {
        studentUserId = crypto.randomUUID();
        const dummyEmail = email && email.trim() ? email.trim().toLowerCase() : `walkin.${mobile}@focuspoint.internal`;
        const tempPassword = crypto.randomBytes(8).toString('hex');
        const passwordHash = bcrypt.hashSync(tempPassword, 10);
        const studentRole = db.prepare('SELECT id FROM roles WHERE name = ?').get('STUDENT');
        const studentRoleId = studentRole ? studentRole.id : 2;

        db.prepare(`
          INSERT INTO users (id, email, mobile, password_hash, role_id, district_id, account_status)
          VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')
        `).run(studentUserId, dummyEmail, mobile, passwordHash, studentRoleId, lib.district_id);

        db.prepare(`
          INSERT OR IGNORE INTO user_roles (user_id, role_id)
          VALUES (?, ?)
        `).run(studentUserId, studentRoleId);

        db.prepare(`
          INSERT INTO student_profiles (user_id, full_name, dob, gender, city_area, address, pincode)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(studentUserId, cleanString(full_name), '2005-01-01', 'OTHER', cleanString(notes || 'Walk-in Member'), 'Walk-in Registration', '000000');
      } else {
        studentUserId = user.id;
      }

      // 2. Validate seat if provided
      let allocatedSeatId = null;
      if (seat_id) {
        const seat = db.prepare('SELECT * FROM library_seats WHERE id = ? AND library_id = ?').get(seat_id, lib.id);
        if (seat) {
          allocatedSeatId = seat.id;
          db.prepare("UPDATE library_seats SET status = 'OCCUPIED' WHERE id = ?").run(seat.id);
        }
      }

      // 3. Create Enrollment
      const enrollRes = db.prepare(`
        INSERT INTO library_enrollments (library_id, student_id, seat_id, shift_id, monthly_fee, start_date, end_date, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
      `).run(
        lib.id,
        studentUserId,
        allocatedSeatId,
        shift_id ? parseInt(shift_id, 10) : null,
        parseFloat(monthly_fee),
        start_date,
        end_date
      );

      // 4. Create Fee Record
      const receiptNo = `REC-LIB-${Date.now().toString().slice(-6)}`;
      const isPaid = payment_status === 'PAID';
      db.prepare(`
        INSERT INTO fee_records (student_id, library_id, type, title, amount, due_date, paid_date, status, receipt_no)
        VALUES (?, ?, 'LIBRARY', ?, ?, ?, ?, ?, ?)
      `).run(
        studentUserId,
        lib.id,
        `Subscription (${start_date} to ${end_date})`,
        parseFloat(monthly_fee),
        start_date,
        isPaid ? new Date().toISOString().split('T')[0] : null,
        isPaid ? 'PAID' : 'PENDING',
        receiptNo
      );

      // 5. Send Notification
      db.prepare(`
        INSERT INTO notifications (user_id, title, message, type, link)
        VALUES (?, ?, ?, 'INFO', '/dashboard/student?tab=library')
      `).run(
        studentUserId,
        `Enrolled at ${lib.name}`,
        `You have been registered at ${lib.name} from ${start_date} to ${end_date}.`
      );

      return { enrollmentId: enrollRes.lastInsertRowid, studentUserId };
    });

    const result = transaction();
    return res.status(201).json({
      success: true,
      message: 'Walk-in member registered successfully!',
      enrollmentId: result.enrollmentId
    });
  } catch (err) {
    console.error('Error in addWalkInStudent:', err);
    return res.status(500).json({ success: false, message: 'Failed to register walk-in member' });
  }
};

