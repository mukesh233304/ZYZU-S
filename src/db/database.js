const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const config = require('../config');

// Ensure database directory exists
const dbDir = path.dirname(config.dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize SQLite database connection
const db = new Database(config.dbPath);

// Configure SQLite pragmas for high performance and integrity
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.pragma('synchronous = NORMAL');

// Run schema initialization and safe column migrations
function initDatabase() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schemaSql);

  // Safe migrations for newly added columns if table already existed
  safeAddColumn('student_profiles', 'profile_photo_url', 'TEXT');
  safeAddColumn('student_profiles', 'school_college', 'TEXT');
  safeAddColumn('student_profiles', 'grade_class', 'TEXT');
  safeAddColumn('student_profiles', 'stream_subjects', 'TEXT');
  safeAddColumn('student_profiles', 'target_goals', 'TEXT');

  safeAddColumn('teacher_profiles', 'bio', 'TEXT');
  safeAddColumn('teacher_profiles', 'admin_notes', 'TEXT');

  // Phase 3 booking workflow migrations
  safeAddColumn('booking_requests', 'preferred_mode', "TEXT DEFAULT 'OFFLINE'");
  safeAddColumn('booking_requests', 'preferred_seat_id', 'INTEGER REFERENCES library_seats(id)');
  safeAddColumn('booking_requests', 'shift_id', 'INTEGER REFERENCES library_shifts(id)');
  safeAddColumn('booking_requests', 'start_date', 'TEXT');
  safeAddColumn('booking_requests', 'response_note', 'TEXT');
  safeAddColumn('booking_requests', 'updated_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP');

  // Phase 4 demo_bookings CHECK constraint migration
  try {
    const tableSql = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='demo_bookings'").get();
    if (tableSql && tableSql.sql && !tableSql.sql.includes("'PENDING', 'CONFIRMED'")) {
      db.prepare("DROP TABLE IF EXISTS demo_bookings").run();
      db.exec(schemaSql);
    }
  } catch (err) {
    // Ignore
  }

  // Phase 5 library subscription columns on libraries table
  safeAddColumn('libraries', 'subscription_id', 'TEXT');
  safeAddColumn('libraries', 'subscription_status', "TEXT DEFAULT 'PENDING_SUBSCRIPTION'");
  safeAddColumn('libraries', 'subscription_expiry', 'TEXT');

  // Pan-India Location Master columns on districts table
  safeAddColumn('districts', 'state_id', 'TEXT REFERENCES states_ut(id)');
  safeAddColumn('districts', 'country_id', "TEXT DEFAULT 'loc-country-in'");
  safeAddColumn('districts', 'status', "TEXT DEFAULT 'ACTIVE'");
  safeAddColumn('districts', 'created_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP');
  safeAddColumn('districts', 'updated_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP');
  try {
    db.exec('CREATE INDEX IF NOT EXISTS idx_districts_state_id ON districts(state_id);');
  } catch (err) {}

  // FocusPoint Smart QR Pass & Attendance columns migrations
  safeAddColumn('attendance_records', 'check_in_time', 'TEXT');
  safeAddColumn('attendance_records', 'check_out_time', 'TEXT');
  safeAddColumn('attendance_records', 'duration', 'TEXT');
  safeAddColumn('attendance_records', 'duration_minutes', 'INTEGER DEFAULT 0');
  safeAddColumn('attendance_records', 'booking_id', 'TEXT');
  safeAddColumn('attendance_records', 'qr_id', 'TEXT');
  safeAddColumn('attendance_records', 'source', "TEXT DEFAULT 'STUDENT_QR'");
  safeAddColumn('attendance_records', 'updated_at', 'DATETIME');

  // Canonical Student Parent & WhatsApp Contact columns
  safeAddColumn('student_profiles', 'parent_phone', "TEXT DEFAULT '9876543210'");
  safeAddColumn('student_profiles', 'parent_name', "TEXT DEFAULT 'Parent / Guardian'");
  safeAddColumn('student_profiles', 'whatsapp_number', 'TEXT');

  // Seed Pan-India location master taxonomy and advertisement engine campaigns
  try {
    const { seedLocationAndAds } = require('./seedLocationAndAds');
    seedLocationAndAds(db);
  } catch (seedErr) {
    console.error('Failed to run seedLocationAndAds:', seedErr);
  }
}

function safeAddColumn(tableName, columnName, columnDef) {
  try {
    const tableInfo = db.prepare(`PRAGMA table_info(${tableName})`).all();
    const exists = tableInfo.some(col => col.name === columnName);
    if (!exists) {
      db.prepare(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDef}`).run();
    }
  } catch (err) {
    // Ignore if already exists
  }
}

// Initialize immediately
initDatabase();

module.exports = db;
