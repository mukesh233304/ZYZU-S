/**
 * FOCUSPOINT — Pan-India Location Master Controller
 *
 * Implements cascading hierarchical location management:
 * India → State/UT → District → Locality/Town → Area/Micro-zone
 *
 * - High performance indexing & lazy cascading queries
 * - Strict geographical isolation & parent-child validation
 * - Super Admin full management & District Admin scoped access
 */

const db = require('../db/database');
const config = require('../config');

// 1. Get Countries
exports.getCountries = (req, res) => {
  try {
    const countries = db.prepare("SELECT * FROM countries WHERE status = 'ACTIVE' ORDER BY name ASC").all();
    return res.status(200).json({
      success: true,
      count: countries.length,
      data: countries
    });
  } catch (err) {
    console.error('getCountries error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve countries' });
  }
};

// 2. Get States & Union Territories (All 28 States + 8 UTs)
exports.getStates = (req, res) => {
  try {
    const { countryId = 'loc-country-in', type } = req.query;
    let query = "SELECT * FROM states_ut WHERE country_id = ? AND status = 'ACTIVE'";
    const params = [countryId];

    if (type && ['STATE', 'UT'].includes(type.toUpperCase())) {
      query += ' AND type = ?';
      params.push(type.toUpperCase());
    }

    query += ' ORDER BY name ASC';
    const states = db.prepare(query).all(...params);

    return res.status(200).json({
      success: true,
      count: states.length,
      data: states
    });
  } catch (err) {
    console.error('getStates error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve states' });
  }
};

// 3. Get State by ID
exports.getStateById = (req, res) => {
  try {
    const { id } = req.params;
    const state = db.prepare('SELECT * FROM states_ut WHERE id = ?').get(id);
    if (!state) {
      return res.status(404).json({ success: false, message: 'State or UT not found' });
    }
    return res.status(200).json({ success: true, data: state });
  } catch (err) {
    console.error('getStateById error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve state' });
  }
};

// 4. Get Districts (Cascading query by stateId or state name)
exports.getDistricts = (req, res) => {
  try {
    const { stateId, state, q } = req.query;
    let query = "SELECT * FROM districts WHERE (status = 'ACTIVE' OR is_active = 1)";
    const params = [];

    if (stateId) {
      query += ' AND state_id = ?';
      params.push(stateId);
    } else if (state) {
      query += ' AND (LOWER(state) = LOWER(?) OR LOWER(state_id) = LOWER(?))';
      params.push(state, state);
    }

    if (q) {
      query += ' AND LOWER(name) LIKE ?';
      params.push(`%${q.toLowerCase()}%`);
    }

    query += ' ORDER BY name ASC';
    const districts = db.prepare(query).all(...params);

    return res.status(200).json({
      success: true,
      count: districts.length,
      data: districts
    });
  } catch (err) {
    console.error('getDistricts error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve districts' });
  }
};

// 5. Get District by ID
exports.getDistrictById = (req, res) => {
  try {
    const { id } = req.params;
    const district = db.prepare('SELECT * FROM districts WHERE id = ?').get(id);
    if (!district) {
      return res.status(404).json({ success: false, message: 'District not found' });
    }
    return res.status(200).json({ success: true, data: district });
  } catch (err) {
    console.error('getDistrictById error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve district' });
  }
};

// 6. Get Localities (Cascading query by districtId)
exports.getLocalities = (req, res) => {
  try {
    const { districtId, q } = req.query;
    let query = "SELECT * FROM localities WHERE status = 'ACTIVE'";
    const params = [];

    if (districtId) {
      query += ' AND district_id = ?';
      params.push(districtId);
    }

    if (q) {
      query += ' AND LOWER(name) LIKE ?';
      params.push(`%${q.toLowerCase()}%`);
    }

    query += ' ORDER BY name ASC';
    const localities = db.prepare(query).all(...params);

    return res.status(200).json({
      success: true,
      count: localities.length,
      data: localities
    });
  } catch (err) {
    console.error('getLocalities error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve localities' });
  }
};

// 7. Get Areas (Cascading query by localityId)
exports.getAreas = (req, res) => {
  try {
    const { localityId, q } = req.query;
    let query = "SELECT * FROM areas WHERE status = 'ACTIVE'";
    const params = [];

    if (localityId) {
      query += ' AND locality_id = ?';
      params.push(localityId);
    }

    if (q) {
      query += ' AND LOWER(name) LIKE ?';
      params.push(`%${q.toLowerCase()}%`);
    }

    query += ' ORDER BY name ASC';
    const areas = db.prepare(query).all(...params);

    return res.status(200).json({
      success: true,
      count: areas.length,
      data: areas
    });
  } catch (err) {
    console.error('getAreas error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve areas' });
  }
};

// 8. Full-Text Search across States, Districts, Localities, Areas
exports.searchLocations = (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Search term must be at least 2 characters long' });
    }

    const term = `%${q.trim().toLowerCase()}%`;

    const matchedStates = db.prepare("SELECT id, name, code, type FROM states_ut WHERE LOWER(name) LIKE ? AND status = 'ACTIVE' LIMIT 10").all(term);
    const matchedDistricts = db.prepare("SELECT id, name, state, state_id, code FROM districts WHERE (LOWER(name) LIKE ? OR LOWER(code) LIKE ?) AND (status = 'ACTIVE' OR is_active = 1) LIMIT 15").all(term, term);
    const matchedLocalities = db.prepare("SELECT l.id, l.name, l.pincode, l.type, d.name AS district_name FROM localities l JOIN districts d ON l.district_id = d.id WHERE LOWER(l.name) LIKE ? AND l.status = 'ACTIVE' LIMIT 20").all(term);
    const matchedAreas = db.prepare("SELECT a.id, a.name, a.landmark, a.pincode, l.name AS locality_name FROM areas a JOIN localities l ON a.locality_id = l.id WHERE LOWER(a.name) LIKE ? AND a.status = 'ACTIVE' LIMIT 20").all(term);

    return res.status(200).json({
      success: true,
      query: q.trim(),
      results: {
        states: matchedStates,
        districts: matchedDistricts,
        localities: matchedLocalities,
        areas: matchedAreas
      }
    });
  } catch (err) {
    console.error('searchLocations error:', err);
    return res.status(500).json({ success: false, message: 'Failed to search location master' });
  }
};

// 9. Aggregated Hierarchy Stats
exports.getLocationStats = (req, res) => {
  try {
    const countryCount = db.prepare("SELECT COUNT(*) as c FROM countries WHERE status = 'ACTIVE'").get().c;
    const totalStates = db.prepare("SELECT COUNT(*) as c FROM states_ut WHERE status = 'ACTIVE' AND type = 'STATE'").get().c;
    const totalUts = db.prepare("SELECT COUNT(*) as c FROM states_ut WHERE status = 'ACTIVE' AND type = 'UT'").get().c;
    const totalDistricts = db.prepare("SELECT COUNT(*) as c FROM districts WHERE status = 'ACTIVE' OR is_active = 1").get().c;
    const upDistricts = db.prepare("SELECT COUNT(*) as c FROM districts WHERE (state = 'Uttar Pradesh' OR state_id = 'loc-state-up') AND (status = 'ACTIVE' OR is_active = 1)").get().c;
    const totalLocalities = db.prepare("SELECT COUNT(*) as c FROM localities WHERE status = 'ACTIVE'").get().c;
    const totalAreas = db.prepare("SELECT COUNT(*) as c FROM areas WHERE status = 'ACTIVE'").get().c;

    return res.status(200).json({
      success: true,
      stats: {
        countries: countryCount,
        states: totalStates,
        uts: totalUts,
        totalAdministrativeDivisions: totalStates + totalUts,
        districts: totalDistricts,
        uttarPradeshDistricts: upDistricts,
        localities: totalLocalities,
        areas: totalAreas
      }
    });
  } catch (err) {
    console.error('getLocationStats error:', err);
    return res.status(500).json({ success: false, message: 'Failed to calculate location stats' });
  }
};

// 10. Super Admin: Create State / UT
exports.createState = (req, res) => {
  try {
    const { id, countryId = 'loc-country-in', name, code, type = 'STATE' } = req.body;

    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'State name and code are required' });
    }

    const stateId = id || `loc-state-${code.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

    db.prepare(`
      INSERT INTO states_ut (id, country_id, name, code, type, status)
      VALUES (?, ?, ?, ?, ?, 'ACTIVE')
    `).run(stateId, countryId, name.trim(), code.trim().toUpperCase(), type.toUpperCase());

    const created = db.prepare('SELECT * FROM states_ut WHERE id = ?').get(stateId);
    return res.status(201).json({ success: true, message: 'State/UT created successfully', data: created });
  } catch (err) {
    console.error('createState error:', err);
    if (err.message && err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ success: false, message: 'State name or code already exists' });
    }
    return res.status(500).json({ success: false, message: 'Failed to create state' });
  }
};

// 11. Super Admin: Create District
exports.createDistrict = (req, res) => {
  try {
    const { name, stateId, code } = req.body;

    if (!name || !stateId) {
      return res.status(400).json({ success: false, message: 'District name and parent stateId are required' });
    }

    const parentState = db.prepare('SELECT * FROM states_ut WHERE id = ?').get(stateId);
    if (!parentState) {
      return res.status(400).json({ success: false, message: 'Parent state does not exist in master records' });
    }

    const districtCode = code ? code.toUpperCase() : name.substring(0, 3).toUpperCase();

    const result = db.prepare(`
      INSERT INTO districts (name, state, code, is_active, state_id, country_id, status)
      VALUES (?, ?, ?, 1, ?, 'loc-country-in', 'ACTIVE')
    `).run(name.trim(), parentState.name, districtCode, stateId);

    const created = db.prepare('SELECT * FROM districts WHERE id = ?').get(result.lastInsertRowid);
    return res.status(201).json({ success: true, message: 'District created successfully', data: created });
  } catch (err) {
    console.error('createDistrict error:', err);
    if (err.message && err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ success: false, message: 'District name or code already exists' });
    }
    return res.status(500).json({ success: false, message: 'Failed to create district' });
  }
};

// 12. Create Locality (Super Admin OR District Admin with district isolation)
exports.createLocality = (req, res) => {
  try {
    const { id, districtId, name, type = 'TOWN', pincode } = req.body;

    if (!districtId || !name) {
      return res.status(400).json({ success: false, message: 'District ID and locality name are required' });
    }

    // District Admin Isolation Check
    if (req.user && req.user.role === config.roles.DISTRICT_ADMIN) {
      if (String(req.user.districtId) !== String(districtId)) {
        return res.status(403).json({
          success: false,
          message: 'District Admin is strictly restricted to managing localities within their authorized district.'
        });
      }
    }

    const district = db.prepare('SELECT * FROM districts WHERE id = ?').get(districtId);
    if (!district) {
      return res.status(400).json({ success: false, message: 'Parent district does not exist' });
    }

    const localityId = id || `loc-${district.code.toLowerCase()}-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;

    db.prepare(`
      INSERT INTO localities (id, district_id, name, type, pincode, status)
      VALUES (?, ?, ?, ?, ?, 'ACTIVE')
    `).run(localityId, districtId, name.trim(), type, pincode ? pincode.trim() : null);

    const created = db.prepare('SELECT * FROM localities WHERE id = ?').get(localityId);
    return res.status(201).json({ success: true, message: 'Locality created successfully', data: created });
  } catch (err) {
    console.error('createLocality error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create locality' });
  }
};

// 13. Create Area (Super Admin OR District Admin)
exports.createArea = (req, res) => {
  try {
    const { id, localityId, name, landmark, pincode } = req.body;

    if (!localityId || !name) {
      return res.status(400).json({ success: false, message: 'Locality ID and Area name are required' });
    }

    const locality = db.prepare('SELECT * FROM localities WHERE id = ?').get(localityId);
    if (!locality) {
      return res.status(400).json({ success: false, message: 'Parent locality does not exist' });
    }

    // District Admin Isolation Check
    if (req.user && req.user.role === config.roles.DISTRICT_ADMIN) {
      if (String(req.user.districtId) !== String(locality.district_id)) {
        return res.status(403).json({
          success: false,
          message: 'District Admin cannot create areas outside their authorized district.'
        });
      }
    }

    const areaId = id || `area-${localityId.replace('loc-', '')}-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;

    db.prepare(`
      INSERT INTO areas (id, locality_id, name, landmark, pincode, status)
      VALUES (?, ?, ?, ?, ?, 'ACTIVE')
    `).run(areaId, localityId, name.trim(), landmark ? landmark.trim() : null, pincode ? pincode.trim() : locality.pincode);

    const created = db.prepare('SELECT * FROM areas WHERE id = ?').get(areaId);
    return res.status(201).json({ success: true, message: 'Area created successfully', data: created });
  } catch (err) {
    console.error('createArea error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create area' });
  }
};

// 14. Update Location Entity (State, District, Locality, Area)
exports.updateLocationEntity = (req, res) => {
  try {
    const { entityType, id } = req.params;
    const { name, code, status, pincode, landmark } = req.body;

    if (!['state', 'district', 'locality', 'area'].includes(entityType)) {
      return res.status(400).json({ success: false, message: 'Invalid entityType' });
    }

    let table = '';
    if (entityType === 'state') table = 'states_ut';
    else if (entityType === 'district') table = 'districts';
    else if (entityType === 'locality') table = 'localities';
    else if (entityType === 'area') table = 'areas';

    const existing = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: `${entityType} record not found` });
    }

    // District Admin check
    if (req.user && req.user.role === config.roles.DISTRICT_ADMIN) {
      if (entityType === 'state' || entityType === 'district') {
        return res.status(403).json({ success: false, message: 'District Admins cannot modify State or District master records' });
      }
      if (entityType === 'locality' && String(existing.district_id) !== String(req.user.districtId)) {
        return res.status(403).json({ success: false, message: 'Cannot modify localities outside your authorized district' });
      }
    }

    const updates = [];
    const params = [];

    if (name) { updates.push('name = ?'); params.push(name.trim()); }
    if (code) { updates.push('code = ?'); params.push(code.trim().toUpperCase()); }
    if (status) {
      updates.push('status = ?');
      params.push(status);
      if (entityType === 'district') {
        updates.push('is_active = ?');
        params.push(status === 'ACTIVE' ? 1 : 0);
      }
    }
    if (pincode !== undefined) { updates.push('pincode = ?'); params.push(pincode); }
    if (landmark !== undefined) { updates.push('landmark = ?'); params.push(landmark); }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    if (updates.length > 1) {
      db.prepare(`UPDATE ${table} SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    }

    const updated = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id);
    return res.status(200).json({ success: true, message: `${entityType} updated successfully`, data: updated });
  } catch (err) {
    console.error('updateLocationEntity error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update location record' });
  }
};

// 15. Delete / Archive Location Entity
exports.deleteLocationEntity = (req, res) => {
  try {
    const { entityType, id } = req.params;

    if (!['state', 'district', 'locality', 'area'].includes(entityType)) {
      return res.status(400).json({ success: false, message: 'Invalid entityType' });
    }

    let table = '';
    if (entityType === 'state') table = 'states_ut';
    else if (entityType === 'district') table = 'districts';
    else if (entityType === 'locality') table = 'localities';
    else if (entityType === 'area') table = 'areas';

    const existing = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: `${entityType} record not found` });
    }

    // District Admin check
    if (req.user && req.user.role === config.roles.DISTRICT_ADMIN) {
      if (entityType === 'state' || entityType === 'district') {
        return res.status(403).json({ success: false, message: 'District Admins cannot delete State or District master records' });
      }
    }

    // Soft delete by setting status = 'INACTIVE'
    db.prepare(`UPDATE ${table} SET status = 'INACTIVE', updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(id);
    if (entityType === 'district') {
      db.prepare('UPDATE districts SET is_active = 0 WHERE id = ?').run(id);
    }

    return res.status(200).json({ success: true, message: `${entityType} deactivated successfully` });
  } catch (err) {
    console.error('deleteLocationEntity error:', err);
    return res.status(500).json({ success: false, message: 'Failed to deactivate location record' });
  }
};
