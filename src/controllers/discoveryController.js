const db = require('../db/database');

/**
 * FOCUSPOINT Discovery Controller
 * High-performance search and discovery engine for verified tutors and study libraries
 */

// 1. Discover Public Verified Tutors
exports.getTutors = (req, res) => {
  try {
    const {
      district_id,
      search,
      subject,
      class_level,
      teaching_mode,
      min_fee,
      max_fee,
      gender,
      sort = 'newest',
      page = 1,
      limit = 20
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * pageLimit;

    // Strict security rule: Only ACTIVE accounts that are explicitly approved & publicly visible
    let whereClauses = [
      "u.account_status = 'ACTIVE'",
      'tp.is_publicly_visible = 1'
    ];
    let params = [];

    if (district_id) {
      whereClauses.push('u.district_id = ?');
      params.push(parseInt(district_id, 10));
    }

    if (gender && ['Male', 'Female', 'Other'].includes(gender)) {
      whereClauses.push('tp.gender = ?');
      params.push(gender);
    }

    if (teaching_mode && ['ONLINE', 'OFFLINE', 'BOTH'].includes(teaching_mode)) {
      whereClauses.push('(tp.teaching_mode = ? OR tp.teaching_mode = \'BOTH\')');
      params.push(teaching_mode);
    }

    if (min_fee) {
      const minVal = parseFloat(min_fee);
      if (!isNaN(minVal)) {
        whereClauses.push('tp.expected_fee >= ?');
        params.push(minVal);
      }
    }

    if (max_fee) {
      const maxVal = parseFloat(max_fee);
      if (!isNaN(maxVal)) {
        whereClauses.push('tp.expected_fee <= ?');
        params.push(maxVal);
      }
    }

    if (subject) {
      whereClauses.push('tp.subjects LIKE ?');
      params.push(`%${subject}%`);
    }

    if (class_level) {
      whereClauses.push('tp.classes LIKE ?');
      params.push(`%${class_level}%`);
    }

    if (search && search.trim()) {
      const s = `%${search.trim()}%`;
      whereClauses.push(`(
        tp.full_name LIKE ? OR
        tp.qualification LIKE ? OR
        tp.subjects LIKE ? OR
        tp.specialization LIKE ? OR
        tp.areas_served LIKE ? OR
        d.name LIKE ?
      )`);
      params.push(s, s, s, s, s, s);
    }

    const whereSql = whereClauses.join(' AND ');

    // Determine sorting
    let orderSql = 'ORDER BY u.created_at DESC';
    if (sort === 'fee_asc') {
      orderSql = 'ORDER BY tp.expected_fee ASC';
    } else if (sort === 'fee_desc') {
      orderSql = 'ORDER BY tp.expected_fee DESC';
    } else if (sort === 'experience_desc') {
      orderSql = 'ORDER BY tp.experience_years DESC';
    }

    // Total count query
    const countRow = db.prepare(`
      SELECT COUNT(*) AS total
      FROM teacher_profiles tp
      JOIN users u ON tp.user_id = u.id
      LEFT JOIN districts d ON u.district_id = d.id
      WHERE ${whereSql}
    `).get(...params);

    const total = countRow ? countRow.total : 0;

    // Results query
    const querySql = `
      SELECT
        u.id,
        u.email,
        u.mobile,
        u.district_id,
        u.created_at,
        d.name AS district_name,
        d.code AS district_code,
        tp.full_name,
        tp.gender,
        tp.dob,
        tp.qualification,
        tp.experience_years,
        tp.subjects,
        tp.classes,
        tp.specialization,
        tp.teaching_mode,
        tp.areas_served,
        tp.expected_fee,
        tp.availability,
        tp.bio,
        tp.profile_photo_url
      FROM teacher_profiles tp
      JOIN users u ON tp.user_id = u.id
      LEFT JOIN districts d ON u.district_id = d.id
      WHERE ${whereSql}
      ${orderSql}
      LIMIT ? OFFSET ?
    `;

    const rows = db.prepare(querySql).all(...params, pageLimit, offset);

    const tutors = rows.map(r => {
      let subjectsArr = [];
      let classesArr = [];
      try { subjectsArr = JSON.parse(r.subjects || '[]'); } catch (e) { subjectsArr = [r.subjects]; }
      try { classesArr = JSON.parse(r.classes || '[]'); } catch (e) { classesArr = [r.classes]; }

      return {
        id: r.id,
        fullName: r.full_name,
        gender: r.gender,
        qualification: r.qualification,
        experienceYears: r.experience_years,
        subjects: subjectsArr,
        classes: classesArr,
        specialization: r.specialization,
        teachingMode: r.teaching_mode,
        areasServed: r.areas_served,
        expectedFee: r.expected_fee,
        availability: r.availability,
        bio: r.bio,
        profilePhotoUrl: r.profile_photo_url,
        districtId: r.district_id,
        districtName: r.district_name || 'Uttar Pradesh',
        districtCode: r.district_code || ''
      };
    });

    return res.status(200).json({
      success: true,
      total,
      page: pageNum,
      limit: pageLimit,
      totalPages: Math.ceil(total / pageLimit) || 1,
      tutors
    });
  } catch (err) {
    console.error('Error discovering tutors:', err);
    return res.status(500).json({ success: false, message: 'Failed to search tutors' });
  }
};

// 2. Get Public Verified Tutor Profile Dossier by ID
exports.getTutorById = (req, res) => {
  try {
    const { id } = req.params;

    const row = db.prepare(`
      SELECT
        u.id,
        u.district_id,
        d.name AS district_name,
        d.code AS district_code,
        tp.full_name,
        tp.gender,
        tp.qualification,
        tp.experience_years,
        tp.subjects,
        tp.classes,
        tp.specialization,
        tp.teaching_mode,
        tp.areas_served,
        tp.expected_fee,
        tp.availability,
        tp.bio,
        tp.profile_photo_url,
        tp.created_at
      FROM teacher_profiles tp
      JOIN users u ON tp.user_id = u.id
      LEFT JOIN districts d ON u.district_id = d.id
      WHERE u.id = ? AND u.account_status = 'ACTIVE' AND tp.is_publicly_visible = 1
    `).get(id);

    if (!row) {
      return res.status(404).json({ success: false, message: 'Verified tutor not found' });
    }

    let subjectsArr = [];
    let classesArr = [];
    try { subjectsArr = JSON.parse(row.subjects || '[]'); } catch (e) { subjectsArr = [row.subjects]; }
    try { classesArr = JSON.parse(row.classes || '[]'); } catch (e) { classesArr = [row.classes]; }

    // Fetch public weekly schedules
    const schedules = db.prepare(`
      SELECT id, day_of_week, start_time, end_time, title, teaching_mode
      FROM teacher_schedules
      WHERE teacher_id = ?
      ORDER BY
        CASE day_of_week
          WHEN 'Monday' THEN 1
          WHEN 'Tuesday' THEN 2
          WHEN 'Wednesday' THEN 3
          WHEN 'Thursday' THEN 4
          WHEN 'Friday' THEN 5
          WHEN 'Saturday' THEN 6
          WHEN 'Sunday' THEN 7
        END,
        start_time ASC
    `).all(id);

    return res.status(200).json({
      success: true,
      tutor: {
        id: row.id,
        fullName: row.full_name,
        gender: row.gender,
        qualification: row.qualification,
        experienceYears: row.experience_years,
        subjects: subjectsArr,
        classes: classesArr,
        specialization: row.specialization,
        teachingMode: row.teaching_mode,
        areasServed: row.areas_served,
        expectedFee: row.expected_fee,
        availability: row.availability,
        bio: row.bio,
        profilePhotoUrl: row.profile_photo_url,
        districtId: row.district_id,
        districtName: row.district_name || 'Uttar Pradesh',
        districtCode: row.district_code || '',
        schedules
      }
    });
  } catch (err) {
    console.error('Error fetching tutor details:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve tutor profile' });
  }
};

// 3. Discover Public Study Libraries
exports.getLibraries = (req, res) => {
  try {
    const { district_id, search, amenity, max_fee } = req.query;

    let whereClauses = ["l.status = 'ACTIVE'"];
    let params = [];

    if (district_id) {
      whereClauses.push('l.district_id = ?');
      params.push(parseInt(district_id, 10));
    }

    if (amenity) {
      whereClauses.push('l.amenities LIKE ?');
      params.push(`%${amenity}%`);
    }

    if (max_fee) {
      const feeVal = parseFloat(max_fee);
      if (!isNaN(feeVal)) {
        whereClauses.push('(l.morning_fee <= ? OR l.evening_fee <= ? OR l.fullday_fee <= ?)');
        params.push(feeVal, feeVal, feeVal);
      }
    }

    if (search && search.trim()) {
      const s = `%${search.trim()}%`;
      whereClauses.push('(l.name LIKE ? OR l.address LIKE ? OR d.name LIKE ?)');
      params.push(s, s, s);
    }

    const whereSql = whereClauses.join(' AND ');

    const libraries = db.prepare(`
      SELECT
        l.id,
        l.name,
        l.address,
        l.total_seats,
        l.amenities,
        l.operating_hours,
        l.morning_fee,
        l.evening_fee,
        l.fullday_fee,
        l.district_id,
        d.name AS district_name,
        d.code AS district_code
      FROM libraries l
      JOIN districts d ON l.district_id = d.id
      WHERE ${whereSql}
      ORDER BY l.name ASC
    `).all(...params);

    // Compute live seat statistics for each library
    const enrichedLibraries = libraries.map(lib => {
      let amenitiesList = [];
      try { amenitiesList = JSON.parse(lib.amenities || '[]'); } catch (e) { amenitiesList = []; }

      const seatStats = db.prepare(`
        SELECT
          COUNT(*) AS total_configured,
          SUM(CASE WHEN status = 'AVAILABLE' THEN 1 ELSE 0 END) AS available_count,
          SUM(CASE WHEN status = 'OCCUPIED' THEN 1 ELSE 0 END) AS occupied_count,
          SUM(CASE WHEN status = 'MAINTENANCE' THEN 1 ELSE 0 END) AS maintenance_count
        FROM library_seats
        WHERE library_id = ?
      `).get(lib.id);

      const totalSeats = (seatStats && seatStats.total_configured > 0) ? seatStats.total_configured : lib.total_seats;
      const occupiedSeats = (seatStats && seatStats.occupied_count) ? seatStats.occupied_count : 0;
      const availableSeats = (seatStats && seatStats.available_count !== null) ? seatStats.available_count : (totalSeats - occupiedSeats);

      // Fetch shifts
      const shifts = db.prepare(`
        SELECT id, name, start_time, end_time, fee
        FROM library_shifts
        WHERE library_id = ?
        ORDER BY start_time ASC
      `).all(lib.id);

      return {
        id: lib.id,
        name: lib.name,
        address: lib.address,
        districtId: lib.district_id,
        districtName: lib.district_name,
        districtCode: lib.district_code,
        totalSeats,
        occupiedSeats,
        availableSeats,
        amenities: amenitiesList,
        operatingHours: lib.operating_hours || '6:00 AM - 11:00 PM',
        fees: {
          morning: lib.morning_fee,
          evening: lib.evening_fee,
          fullday: lib.fullday_fee
        },
        shifts
      };
    });

    return res.status(200).json({
      success: true,
      count: enrichedLibraries.length,
      libraries: enrichedLibraries
    });
  } catch (err) {
    console.error('Error discovering libraries:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve study libraries' });
  }
};

// 4. Get Public Study Library Details by ID (With Seat Layout)
exports.getLibraryById = (req, res) => {
  try {
    const { id } = req.params;

    const lib = db.prepare(`
      SELECT
        l.id,
        l.name,
        l.address,
        l.total_seats,
        l.amenities,
        l.operating_hours,
        l.morning_fee,
        l.evening_fee,
        l.fullday_fee,
        l.district_id,
        d.name AS district_name,
        d.code AS district_code
      FROM libraries l
      JOIN districts d ON l.district_id = d.id
      WHERE l.id = ? AND l.status = 'ACTIVE'
    `).get(id);

    if (!lib) {
      return res.status(404).json({ success: false, message: 'Study library not found' });
    }

    let amenitiesList = [];
    try { amenitiesList = JSON.parse(lib.amenities || '[]'); } catch (e) { amenitiesList = []; }

    // Fetch shifts
    const shifts = db.prepare(`
      SELECT id, name, start_time, end_time, fee
      FROM library_shifts
      WHERE library_id = ?
      ORDER BY start_time ASC
    `).all(lib.id);

    // Fetch seats grid
    const seats = db.prepare(`
      SELECT id, seat_number, status
      FROM library_seats
      WHERE library_id = ?
      ORDER BY CAST(SUBSTR(seat_number, 3) AS INTEGER) ASC, seat_number ASC
    `).all(lib.id);

    const availableSeats = seats.filter(s => s.status === 'AVAILABLE').length;
    const occupiedSeats = seats.filter(s => s.status === 'OCCUPIED').length;

    return res.status(200).json({
      success: true,
      library: {
        id: lib.id,
        name: lib.name,
        address: lib.address,
        districtId: lib.district_id,
        districtName: lib.district_name,
        districtCode: lib.district_code,
        totalSeats: seats.length > 0 ? seats.length : lib.total_seats,
        availableSeats,
        occupiedSeats,
        amenities: amenitiesList,
        operatingHours: lib.operating_hours || '6:00 AM - 11:00 PM',
        fees: {
          morning: lib.morning_fee,
          evening: lib.evening_fee,
          fullday: lib.fullday_fee
        },
        shifts,
        seats
      }
    });
  } catch (err) {
    console.error('Error fetching library details:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve study space details' });
  }
};

// 5. Aggregated Discovery Metadata for Instant UI Filtering
exports.getSearchMetadata = (req, res) => {
  try {
    const districts = db.prepare('SELECT id, name, state, code FROM districts WHERE is_active = 1 ORDER BY name ASC').all();

    const popularSubjects = [
      'Mathematics',
      'Physics',
      'Chemistry',
      'Biology',
      'English Literature & Grammar',
      'Hindi & Sanskrit',
      'Social Studies & History',
      'Computer Science & Coding',
      'Commerce & Accountancy',
      'Economics',
      'IIT-JEE Foundation',
      'NEET Preparation'
    ];

    const standardClasses = [
      'Class 1 - 5 (Primary)',
      'Class 6 - 8 (Middle)',
      'Class 9 (High School)',
      'Class 10 (Board Exam)',
      'Class 11 (Science / Commerce / Arts)',
      'Class 12 (Senior Secondary)',
      'JEE / NEET Foundation',
      'CUET & Competitive Exams'
    ];

    const libraryAmenities = [
      'High-Speed Wi-Fi',
      'Air Conditioned (AC)',
      'Ergonomic Desk & Chair',
      'Personal Charging Sockets',
      'RO Purified Water',
      '100% Power Backup (Inverter/DG)',
      'CCTV Surveillance 24x7',
      'Personal Storage Locker',
      'Discussion & Lunch Zone',
      'Daily Hindi/English Newspapers'
    ];

    const feeRange = db.prepare(`
      SELECT
        MIN(tp.expected_fee) AS min_tutor_fee,
        MAX(tp.expected_fee) AS max_tutor_fee
      FROM teacher_profiles tp
      JOIN users u ON tp.user_id = u.id
      WHERE u.account_status = 'ACTIVE' AND tp.is_publicly_visible = 1
    `).get();

    return res.status(200).json({
      success: true,
      districts,
      subjects: popularSubjects,
      classes: standardClasses,
      amenities: libraryAmenities,
      teachingModes: ['OFFLINE', 'ONLINE', 'BOTH'],
      feeBounds: {
        minTutorFee: feeRange ? (feeRange.min_tutor_fee || 1000) : 1000,
        maxTutorFee: feeRange ? (feeRange.max_tutor_fee || 15000) : 15000
      }
    });
  } catch (err) {
    console.error('Error fetching search metadata:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve filter metadata' });
  }
};
