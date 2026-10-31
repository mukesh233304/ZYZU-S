const app = require('./app');
const config = require('./config');
const db = require('./db/database');
const runSeed = require('./scripts/seed');

// Run seed to ensure roles, districts, and superadmin exist
runSeed();

// Connect and bootstrap InsForge Cloud Persistence
const insforgeSync = require('./services/insforgeSync');
const { testConnection } = require('./db/insforgePool');

testConnection().then(async (conn) => {
  if (conn.connected) {
    console.log('☁️ [InsForge BaaS] Connected to InsForge PostgreSQL Cloud in ap-southeast');
    await insforgeSync.bootstrap(db);
  } else {
    console.warn('⚠️ [InsForge BaaS] Cloud database connection fallback:', conn.error);
  }
}).catch(err => {
  console.warn('⚠️ [InsForge BaaS] Error initializing InsForge Sync:', err.message);
});

const server = app.listen(config.port, () => {
  console.log(`
  =======================================================
  🚀 FOCUSPOINT Authentication Platform Running!
  -------------------------------------------------------
  📡 Server:      http://localhost:${config.port}
  🔒 Environment: ${config.nodeEnv}
  📦 Database:    ${config.dbPath}
  🛡️ Auth OTP:    ${config.authOtpEnabled ? 'ENABLED' : 'CONFIGURABLE (OPTIONAL)'}
  =======================================================
  `);
});

module.exports = server;
