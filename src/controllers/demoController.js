/**
 * FOCUSPOINT — Demo Booking & Pricing Controller
 * 
 * Implements:
 * 1. 4-tier Pricing Override Hierarchy (Particular -> District -> State -> Pan India -> Free)
 * 2. Strict One-Time Demo Restriction per category (Library vs Home Tuition)
 * 3. Atomic booking creation & locked historical fee retention
 * 4. Payment requirement & confirmation
 * 5. Unique Demo Booking ID generator (FP-LIB-DEMO-... / FP-TUT-DEMO-...)
 * 6. Admin Pricing Rules Management & Conflict Prevention
 * 7. QR Code Verification Tool
 */

const db = require('../db/database');
const config = require('../config');

// Helper to format today date YYYY-MM-DD
function getTodayDateString() {
  return new Date().toISOString().substring(0, 10);
}

// Helper to format date for ID YYYYMMDD
function getTodayDateCompact() {
  return new Date().toISOString().substring(0, 10).replace(/-/g, '');
}

/**
 * 1. Pricing Hierarchy Resolution Engine
 * Priority: Particular (Library / Teacher) -> District -> State -> Pan India -> Free (0)
 */
function resolveDemoPrice(serviceType, state, district, serviceId) {
  const today = getTodayDateString();

  // 1. Particular Library / Teacher
  if (serviceId) {
    const particularRule = db.prepare(`
      SELECT * FROM demo_pricing_rules
      WHERE service_type = ? 
        AND scope_type = 'PARTICULAR' 
        AND service_id = ? 
        AND is_active = 1
        AND start_date <= ?
        AND (end_date IS NULL OR end_date = '' OR end_date >= ?)
      ORDER BY id DESC
      LIMIT 1
    `).get(serviceType, String(serviceId), today, today);

    if (particularRule) {
      return {
        price: particularRule.price,
        scopeUsed: 'PARTICULAR',
        ruleId: particularRule.id,
        ruleName: particularRule.service_name || 'Particular Entity Rule'
      };
    }
  }

  // 2. District Rule
  if (district) {
    const districtRule = db.prepare(`
      SELECT * FROM demo_pricing_rules
      WHERE service_type = ? 
        AND scope_type = 'DISTRICT' 
        AND LOWER(TRIM(district)) = LOWER(TRIM(?))
        AND is_active = 1
        AND start_date <= ?
        AND (end_date IS NULL OR end_date = '' OR end_date >= ?)
      ORDER BY id DESC
      LIMIT 1
    `).get(serviceType, district, today, today);

    if (districtRule) {
      return {
        price: districtRule.price,
        scopeUsed: 'DISTRICT',
        ruleId: districtRule.id,
        ruleName: `${districtRule.district} District Pricing`
      };
    }
  }

  // 3. State Rule
  if (state) {
    const stateRule = db.prepare(`
      SELECT * FROM demo_pricing_rules
      WHERE service_type = ? 
        AND scope_type = 'STATE' 
        AND LOWER(TRIM(state)) = LOWER(TRIM(?))
        AND is_active = 1
        AND start_date <= ?
        AND (end_date IS NULL OR end_date = '' OR end_date >= ?)
      ORDER BY id DESC
      LIMIT 1
    `).get(serviceType, state, today, today);

    if (stateRule) {
      return {
        price: stateRule.price,
        scopeUsed: 'STATE',
        ruleId: stateRule.id,
        ruleName: `${stateRule.state} State Pricing`
      };
    }
  }

  // 4. Pan India Rule
  const panIndiaRule = db.prepare(`
    SELECT * FROM demo_pricing_rules
    WHERE service_type = ? 
      AND scope_type = 'PAN_INDIA' 
      AND is_active = 1
      AND start_date <= ?
      AND (end_date IS NULL OR end_date = '' OR end_date >= ?)
    ORDER BY id DESC
    LIMIT 1
  `).get(serviceType, today, today);

  if (panIndiaRule) {
    return {
      price: panIndiaRule.price,
      scopeUsed: 'PAN_INDIA',
      ruleId: panIndiaRule.id,
      ruleName: 'Pan-India Standard Pricing'
    };
  }

  // 5. Default Fallback: Free Demo
  return {
    price: 0,
    scopeUsed: 'DEFAULT_FREE',
    ruleId: null,
    ruleName: 'Complimentary Free Demo'
  };
}

exports.resolveDemoPrice = resolveDemoPrice;

// Controller Endpoints

/**
 * Public/Student: Calculate Applicable Demo Price
 */
exports.calculateDemoPrice = (req, res) => {
  try {
    const serviceType = (req.query.service_type || req.body.service_type || 'LIBRARY').toUpperCase();
    const state = req.query.state || req.body.state || 'Uttar Pradesh';
    const district = req.query.district || req.body.district || 'Ghazipur';
    const serviceId = req.query.service_id || req.body.service_id || null;

    if (!['LIBRARY', 'HOME_TUITION'].includes(serviceType)) {
      return res.status(400).json({ success: false, message: 'Invalid service type' });
    }

    const resolution = resolveDemoPrice(serviceType, state, district, serviceId);

    return res.status(200).json({
      success: true,
      serviceType,
      state,
      district,
      serviceId,
      price: resolution.price,
      scopeUsed: resolution.scopeUsed,
      ruleId: resolution.ruleId,
      ruleName: resolution.ruleName,
      currency: 'INR'
    });
  } catch (err) {
    console.error('Error in calculateDemoPrice:', err);
    return res.status(500).json({ success: false, message: 'Failed to calculate demo price' });
  }
};

/**
 * Student: Check Demo Eligibility (One-Time Limit)
 */
exports.checkEligibility = (req, res) => {
  const studentId = req.user.id;

  try {
    const libraryBooking = db.prepare(`
      SELECT * FROM demo_bookings
      WHERE student_id = ? 
        AND service_type = 'LIBRARY'
        AND payment_status IN ('PAID', 'PENDING')
        AND booking_status != 'CANCELLED'
      ORDER BY id DESC
      LIMIT 1
    `).get(studentId);

    const tuitionBooking = db.prepare(`
      SELECT * FROM demo_bookings
      WHERE student_id = ? 
        AND service_type = 'HOME_TUITION'
        AND payment_status IN ('PAID', 'PENDING')
        AND booking_status != 'CANCELLED'
      ORDER BY id DESC
      LIMIT 1
    `).get(studentId);

    return res.status(200).json({
      success: true,
      hasUsedLibraryDemo: !!libraryBooking,
      hasUsedTuitionDemo: !!tuitionBooking,
      libraryDemo: libraryBooking || null,
      tuitionDemo: tuitionBooking || null
    });
  } catch (err) {
    console.error('Error in checkEligibility:', err);
    return res.status(500).json({ success: false, message: 'Failed to verify demo eligibility' });
  }
};

/**
 * Student: Create Demo Booking
 */
exports.createDemoBooking = (req, res) => {
  const studentId = req.user.id;
  const {
    service_type,
    library_id,
    teacher_id,
    service_name,
    subject_or_shift,
    state = 'Uttar Pradesh',
    district = 'Ghazipur',
    demo_date,
    demo_time
  } = req.body;

  const normalizedType = (service_type || '').toUpperCase();
  if (!['LIBRARY', 'HOME_TUITION'].includes(normalizedType)) {
    return res.status(400).json({ success: false, message: 'Service type must be LIBRARY or HOME_TUITION' });
  }

  if (!demo_date || !demo_time) {
    return res.status(400).json({ success: false, message: 'Demo date and time slot are required' });
  }

  try {
    // 1. Enforce strict ONE-TIME demo rule
    const existing = db.prepare(`
      SELECT * FROM demo_bookings
      WHERE student_id = ? 
        AND service_type = ? 
        AND payment_status IN ('PAID', 'PENDING')
        AND booking_status != 'CANCELLED'
      LIMIT 1
    `).get(studentId, normalizedType);

    if (existing) {
      const message = normalizedType === 'LIBRARY'
        ? "You have already used your ZYZU'S Library Demo."
        : "You have already used your ZYZU'S Home Tuition Demo.";
      return res.status(409).json({
        success: false,
        code: 'DEMO_ALREADY_USED',
        message,
        existingBooking: existing
      });
    }

    // 2. Resolve price on server side
    const targetServiceId = normalizedType === 'LIBRARY' ? library_id : teacher_id;
    const priceResolution = resolveDemoPrice(normalizedType, state, district, targetServiceId);
    const applicablePrice = priceResolution.price;

    // 3. Generate unique Demo Booking ID
    const prefix = normalizedType === 'LIBRARY' ? 'FP-LIB-DEMO' : 'FP-TUT-DEMO';
    const dateCompact = getTodayDateCompact();
    
    // Count today's bookings for sequence
    const countRow = db.prepare(`
      SELECT COUNT(*) as count FROM demo_bookings
      WHERE demo_booking_id LIKE ?
    `).get(`${prefix}-${dateCompact}-%`);

    const seq = String((countRow ? countRow.count : 0) + 1).padStart(4, '0');
    const demoBookingId = `${prefix}-${dateCompact}-${seq}`;

    // 4. Determine initial payment & booking status
    const isFree = applicablePrice === 0;
    const paymentStatus = isFree ? 'PAID' : 'PENDING';
    const bookingStatus = isFree ? 'CONFIRMED' : 'PENDING';
    const paymentTxnId = isFree ? `FREE-DEMO-${Date.now()}` : null;
    const paidAt = isFree ? new Date().toISOString() : null;

    // QR payload
    const qrData = JSON.stringify({
      id: demoBookingId,
      studentId,
      service: normalizedType,
      date: demo_date,
      time: demo_time
    });

    const insertStmt = db.prepare(`
      INSERT INTO demo_bookings (
        demo_booking_id, student_id, service_type, library_id, teacher_id,
        service_name, subject_or_shift, state, district, demo_date, demo_time,
        price, payment_status, payment_transaction_id, paid_at,
        booking_status, qr_code_data, pricing_scope_used
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertStmt.run(
      demoBookingId,
      studentId,
      normalizedType,
      library_id || null,
      teacher_id || null,
      service_name || (normalizedType === `LIBRARY` ? "ZYZU'S Study Library" : `Home Tuition Bureau`),
      subject_or_shift || null,
      state,
      district,
      demo_date,
      demo_time,
      applicablePrice,
      paymentStatus,
      paymentTxnId,
      paidAt,
      bookingStatus,
      qrData,
      priceResolution.scopeUsed
    );

    const createdBooking = db.prepare('SELECT * FROM demo_bookings WHERE id = ?').get(result.lastInsertRowid);

    return res.status(201).json({
      success: true,
      message: isFree ? 'Free demo booked successfully!' : 'Demo initiated. Please complete payment to confirm.',
      booking: createdBooking,
      requiresPayment: !isFree,
      price: applicablePrice
    });
  } catch (err) {
    console.error('Error in createDemoBooking:', err);
    if (err.message && err.message.includes('idx_one_demo_per_student_service')) {
      const message = normalizedType === 'LIBRARY'
        ? "You have already used your ZYZU'S Library Demo."
        : "You have already used your ZYZU'S Home Tuition Demo.";
      return res.status(409).json({ success: false, code: 'DEMO_ALREADY_USED', message });
    }
    return res.status(500).json({ success: false, message: 'Failed to create demo booking' });
  }
};

/**
 * Student: Process Payment for Paid Demo Booking
 */
exports.processDemoPayment = (req, res) => {
  const studentId = req.user.id;
  const bookingId = req.params.id || req.body.booking_id;
  const { payment_method = 'UPI_QR', transaction_id } = req.body;

  try {
    const booking = db.prepare(`
      SELECT * FROM demo_bookings
      WHERE (id = ? OR demo_booking_id = ?) AND student_id = ?
    `).get(bookingId, bookingId, studentId);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Demo booking not found' });
    }

    if (booking.payment_status === 'PAID') {
      return res.status(200).json({ success: true, message: 'Booking is already paid and confirmed', booking });
    }

    const txnId = transaction_id || `TXN-DEMO-${Date.now()}`;
    const paidAt = new Date().toISOString();

    db.prepare(`
      UPDATE demo_bookings
      SET payment_status = 'PAID',
          booking_status = 'CONFIRMED',
          payment_transaction_id = ?,
          payment_method = ?,
          paid_at = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(txnId, payment_method, paidAt, booking.id);

    const updated = db.prepare('SELECT * FROM demo_bookings WHERE id = ?').get(booking.id);

    return res.status(200).json({
      success: true,
      message: 'Demo payment completed and booking confirmed!',
      booking: updated
    });
  } catch (err) {
    console.error('Error in processDemoPayment:', err);
    return res.status(500).json({ success: false, message: 'Failed to process demo payment' });
  }
};

/**
 * Student: List Own Demo Bookings
 */
exports.getStudentDemos = (req, res) => {
  const studentId = req.user.id;

  try {
    const demos = db.prepare(`
      SELECT 
        db.*,
        sp.full_name AS student_name,
        sp.profile_photo_url AS student_photo,
        sp.grade_class,
        u.mobile AS student_mobile
      FROM demo_bookings db
      JOIN student_profiles sp ON db.student_id = sp.user_id
      JOIN users u ON db.student_id = u.id
      WHERE db.student_id = ?
      ORDER BY db.created_at DESC
    `).all(studentId);

    return res.status(200).json({ success: true, demos });
  } catch (err) {
    console.error('Error in getStudentDemos:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch demo bookings' });
  }
};

/**
 * Student/Public: Get Single Demo Details for ID Card
 */
exports.getDemoById = (req, res) => {
  const bookingId = req.params.id;

  try {
    const demo = db.prepare(`
      SELECT 
        db.*,
        sp.full_name AS student_name,
        sp.profile_photo_url AS student_photo,
        sp.grade_class,
        u.mobile AS student_mobile,
        u.email AS student_email,
        l.address AS library_address,
        l.operating_hours AS library_hours,
        tp.full_name AS teacher_name,
        tp.subjects AS teacher_subjects
      FROM demo_bookings db
      JOIN student_profiles sp ON db.student_id = sp.user_id
      JOIN users u ON db.student_id = u.id
      LEFT JOIN libraries l ON db.library_id = l.id
      LEFT JOIN teacher_profiles tp ON db.teacher_id = tp.user_id
      WHERE db.id = ? OR db.demo_booking_id = ?
    `).get(bookingId, bookingId);

    if (!demo) {
      return res.status(404).json({ success: false, message: 'Demo booking not found' });
    }

    return res.status(200).json({ success: true, demo });
  } catch (err) {
    console.error('Error in getDemoById:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve demo details' });
  }
};

/**
 * Admin: Get Demo Pricing Rules
 */
exports.getPricingRules = (req, res) => {
  const user = req.user;
  const isSuperAdmin = user.role === config.roles.SUPER_ADMIN;
  const userDistrictId = user.district_id;

  try {
    let rules = [];
    if (isSuperAdmin) {
      rules = db.prepare('SELECT * FROM demo_pricing_rules ORDER BY created_at DESC').all();
    } else {
      // District Admin can only view rules applicable to their district or pan-india/state references
      const distRow = db.prepare('SELECT name FROM districts WHERE id = ?').get(userDistrictId);
      const districtName = distRow ? distRow.name : '';

      rules = db.prepare(`
        SELECT * FROM demo_pricing_rules 
        WHERE scope_type = 'PAN_INDIA'
           OR (scope_type = 'STATE' AND state = 'Uttar Pradesh')
           OR (scope_type IN ('DISTRICT', 'PARTICULAR') AND LOWER(district) = LOWER(?))
        ORDER BY created_at DESC
      `).all(districtName);
    }

    return res.status(200).json({ success: true, rules });
  } catch (err) {
    console.error('Error in getPricingRules:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch pricing rules' });
  }
};

/**
 * Admin: Create Demo Pricing Rule
 */
exports.createPricingRule = (req, res) => {
  const user = req.user;
  const isSuperAdmin = user.role === config.roles.SUPER_ADMIN;
  const {
    service_type,
    scope_type,
    state,
    district,
    service_id,
    service_name,
    price = 0,
    start_date = getTodayDateString(),
    end_date
  } = req.body;

  const normalizedService = (service_type || '').toUpperCase();
  const normalizedScope = (scope_type || '').toUpperCase();

  if (!['LIBRARY', 'HOME_TUITION'].includes(normalizedService)) {
    return res.status(400).json({ success: false, message: 'Invalid service type' });
  }

  if (!['PAN_INDIA', 'STATE', 'DISTRICT', 'PARTICULAR'].includes(normalizedScope)) {
    return res.status(400).json({ success: false, message: 'Invalid scope type' });
  }

  // District Admin permission validation: Cannot create PAN_INDIA or other district rules
  if (!isSuperAdmin) {
    const distRow = db.prepare('SELECT name FROM districts WHERE id = ?').get(user.district_id);
    const myDistrict = distRow ? distRow.name.toLowerCase() : '';

    if (normalizedScope === 'PAN_INDIA' || normalizedScope === 'STATE') {
      return res.status(403).json({ success: false, message: 'District Admins cannot configure Pan India or State-wide pricing' });
    }

    if (district && district.trim().toLowerCase() !== myDistrict) {
      return res.status(403).json({ success: false, message: 'You can only configure demo pricing within your assigned district' });
    }
  }

  try {
    // Conflict Prevention: Check for existing active rule with exact same scope
    let conflictQuery = `
      SELECT id FROM demo_pricing_rules
      WHERE service_type = ? 
        AND scope_type = ? 
        AND is_active = 1
    `;
    const conflictParams = [normalizedService, normalizedScope];

    if (normalizedScope === 'PAN_INDIA') {
      // no additional params
    } else if (normalizedScope === 'STATE') {
      conflictQuery += ' AND LOWER(TRIM(state)) = LOWER(TRIM(?))';
      conflictParams.push(state || 'Uttar Pradesh');
    } else if (normalizedScope === 'DISTRICT') {
      conflictQuery += ' AND LOWER(TRIM(district)) = LOWER(TRIM(?))';
      conflictParams.push(district || '');
    } else if (normalizedScope === 'PARTICULAR') {
      conflictQuery += ' AND service_id = ?';
      conflictParams.push(String(service_id || ''));
    }

    const conflict = db.prepare(conflictQuery).get(...conflictParams);
    if (conflict) {
      return res.status(409).json({
        success: false,
        message: 'An active pricing rule already exists for this exact scope. Please edit or deactivate the existing rule.'
      });
    }

    const insert = db.prepare(`
      INSERT INTO demo_pricing_rules (
        service_type, scope_type, state, district, service_id, service_name,
        price, is_active, start_date, end_date, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
    `);

    const result = insert.run(
      normalizedService,
      normalizedScope,
      state || (normalizedScope !== 'PAN_INDIA' ? 'Uttar Pradesh' : null),
      district || (['DISTRICT', 'PARTICULAR'].includes(normalizedScope) ? district : null),
      service_id ? String(service_id) : null,
      service_name || null,
      Number(price) || 0,
      start_date,
      end_date || null,
      user.id
    );

    const created = db.prepare('SELECT * FROM demo_pricing_rules WHERE id = ?').get(result.lastInsertRowid);

    return res.status(201).json({ success: true, message: 'Demo pricing rule created successfully', rule: created });
  } catch (err) {
    console.error('Error in createPricingRule:', err);
    return res.status(500).json({ success: false, message: 'Failed to create pricing rule' });
  }
};

/**
 * Admin: Update Demo Pricing Rule
 */
exports.updatePricingRule = (req, res) => {
  const ruleId = req.params.id;
  const user = req.user;
  const isSuperAdmin = user.role === config.roles.SUPER_ADMIN;
  const { price, is_active, end_date, service_name } = req.body;

  try {
    const existing = db.prepare('SELECT * FROM demo_pricing_rules WHERE id = ?').get(ruleId);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Pricing rule not found' });
    }

    if (!isSuperAdmin) {
      const distRow = db.prepare('SELECT name FROM districts WHERE id = ?').get(user.district_id);
      const myDistrict = distRow ? distRow.name.toLowerCase() : '';
      if (existing.district && existing.district.toLowerCase() !== myDistrict) {
        return res.status(403).json({ success: false, message: 'Unauthorized to modify pricing outside your district' });
      }
    }

    db.prepare(`
      UPDATE demo_pricing_rules
      SET price = COALESCE(?, price),
          is_active = COALESCE(?, is_active),
          end_date = COALESCE(?, end_date),
          service_name = COALESCE(?, service_name),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      price !== undefined ? Number(price) : null,
      is_active !== undefined ? (is_active ? 1 : 0) : null,
      end_date !== undefined ? end_date : null,
      service_name !== undefined ? service_name : null,
      ruleId
    );

    const updated = db.prepare('SELECT * FROM demo_pricing_rules WHERE id = ?').get(ruleId);
    return res.status(200).json({ success: true, message: 'Pricing rule updated successfully', rule: updated });
  } catch (err) {
    console.error('Error in updatePricingRule:', err);
    return res.status(500).json({ success: false, message: 'Failed to update pricing rule' });
  }
};

/**
 * Admin: Delete Pricing Rule
 */
exports.deletePricingRule = (req, res) => {
  const ruleId = req.params.id;
  const user = req.user;
  const isSuperAdmin = user.role === config.roles.SUPER_ADMIN;

  try {
    const existing = db.prepare('SELECT * FROM demo_pricing_rules WHERE id = ?').get(ruleId);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Pricing rule not found' });
    }

    if (!isSuperAdmin) {
      const distRow = db.prepare('SELECT name FROM districts WHERE id = ?').get(user.district_id);
      const myDistrict = distRow ? distRow.name.toLowerCase() : '';
      if (existing.district && existing.district.toLowerCase() !== myDistrict) {
        return res.status(403).json({ success: false, message: 'Unauthorized to delete pricing outside your district' });
      }
    }

    db.prepare('DELETE FROM demo_pricing_rules WHERE id = ?').run(ruleId);
    return res.status(200).json({ success: true, message: 'Pricing rule deleted successfully' });
  } catch (err) {
    console.error('Error in deletePricingRule:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete pricing rule' });
  }
};

/**
 * Admin: Get All Demo Bookings with Filtering
 */
exports.getAllDemoBookings = (req, res) => {
  const user = req.user;
  const isSuperAdmin = user.role === config.roles.SUPER_ADMIN;
  const {
    service_type,
    state,
    district,
    payment_status,
    booking_status,
    date
  } = req.query;

  try {
    let query = `
      SELECT 
        db.*,
        sp.full_name AS student_name,
        sp.grade_class,
        u.mobile AS student_mobile,
        u.email AS student_email
      FROM demo_bookings db
      JOIN student_profiles sp ON db.student_id = sp.user_id
      JOIN users u ON db.student_id = u.id
      WHERE 1=1
    `;
    const params = [];

    // Role district restriction
    if (!isSuperAdmin) {
      const distRow = db.prepare('SELECT name FROM districts WHERE id = ?').get(user.district_id);
      const myDistrict = distRow ? distRow.name : 'Ghazipur';
      query += ' AND LOWER(TRIM(db.district)) = LOWER(TRIM(?))';
      params.push(myDistrict);
    } else if (district) {
      query += ' AND LOWER(TRIM(db.district)) = LOWER(TRIM(?))';
      params.push(district);
    }

    if (service_type) {
      query += ' AND db.service_type = ?';
      params.push(service_type.toUpperCase());
    }

    if (state) {
      query += ' AND LOWER(TRIM(db.state)) = LOWER(TRIM(?))';
      params.push(state);
    }

    if (payment_status) {
      query += ' AND db.payment_status = ?';
      params.push(payment_status.toUpperCase());
    }

    if (booking_status) {
      query += ' AND db.booking_status = ?';
      params.push(booking_status.toUpperCase());
    }

    if (date) {
      query += ' AND db.demo_date = ?';
      params.push(date);
    }

    query += ' ORDER BY db.created_at DESC';

    const bookings = db.prepare(query).all(...params);
    return res.status(200).json({ success: true, bookings });
  } catch (err) {
    console.error('Error in getAllDemoBookings:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch demo bookings' });
  }
};

/**
 * QR Code / Demo ID Verification
 */
exports.verifyDemoQr = (req, res) => {
  const { demo_booking_id, qr_data } = req.body;
  const token = demo_booking_id || (qr_data ? (typeof qr_data === 'string' && qr_data.startsWith('{') ? JSON.parse(qr_data).id : qr_data) : null);

  if (!token) {
    return res.status(400).json({ success: false, valid: false, message: 'Demo Booking ID or QR payload is required' });
  }

  try {
    const booking = db.prepare(`
      SELECT 
        db.id, db.demo_booking_id, db.service_type, db.service_name,
        db.demo_date, db.demo_time, db.price, db.payment_status,
        db.booking_status, db.verified_at,
        sp.full_name AS student_name,
        db.district, db.state
      FROM demo_bookings db
      JOIN student_profiles sp ON db.student_id = sp.user_id
      WHERE db.demo_booking_id = ? OR db.id = ?
    `).get(token, token);

    if (!booking) {
      return res.status(404).json({
        success: true,
        valid: false,
        message: 'Invalid Demo ID: No booking record exists with this identifier.'
      });
    }

    if (booking.payment_status !== 'PAID') {
      return res.status(200).json({
        success: true,
        valid: false,
        message: 'Unconfirmed Demo Pass: Payment is pending for this demo booking.',
        booking
      });
    }

    if (booking.booking_status === 'CANCELLED') {
      return res.status(200).json({
        success: true,
        valid: false,
        message: 'Cancelled Demo Pass: This booking has been cancelled.',
        booking
      });
    }

    // Mark as verified if scanned by staff
    if (!booking.verified_at && req.user) {
      db.prepare(`
        UPDATE demo_bookings
        SET verified_at = CURRENT_TIMESTAMP,
            verified_by = ?
        WHERE id = ?
      `).run(req.user.id, booking.id);
    }

    return res.status(200).json({
      success: true,
      valid: true,
      message: "Verified ZYZU'S Demo Pass",
      studentName: booking.student_name,
      demoBookingId: booking.demo_booking_id,
      serviceType: booking.service_type,
      serviceName: booking.service_name,
      demoDate: booking.demo_date,
      demoTime: booking.demo_time,
      bookingStatus: booking.booking_status,
      paymentStatus: booking.payment_status,
      district: booking.district,
      state: booking.state
    });
  } catch (err) {
    console.error('Error in verifyDemoQr:', err);
    return res.status(500).json({ success: false, valid: false, message: 'Verification lookup failed' });
  }
};
