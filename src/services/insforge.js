const { createClient, createAdminClient } = require('@insforge/sdk');
const config = require('../config');

// User-scoped / Anon Client
const insforge = createClient({
  baseUrl: config.insforge.url,
  anonKey: config.insforge.anonKey
});

// Privileged / Service-role Admin Client
const insforgeAdmin = createAdminClient({
  baseUrl: config.insforge.url,
  apiKey: config.insforge.apiKey
});

/**
 * Health check test for InsForge backend connectivity
 */
async function checkInsForgeHealth() {
  try {
    const { data, error } = await insforgeAdmin.database.from('information_schema.tables').select('count', { count: 'exact' }).limit(1);
    if (error) {
      return { connected: false, error: error.message };
    }
    return { connected: true, data };
  } catch (err) {
    return { connected: false, error: err.message };
  }
}

module.exports = {
  insforge,
  insforgeAdmin,
  checkInsForgeHealth
};
