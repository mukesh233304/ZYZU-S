import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import db from '../src/db/database';
import { generateToken } from '../src/utils/token';
import config from '../src/config';

describe('Pan-India Location Master — Backend API & Database Architecture', () => {
  let superAdminToken;
  let ghazipurAdminToken;
  let ghazipurDistrictId;
  let varanasiDistrictId;

  const cleanupTestData = () => {
    db.prepare("DELETE FROM states_ut WHERE id NOT LIKE 'loc-state-%'").run();
    db.prepare("DELETE FROM districts WHERE name LIKE 'Test District%'").run();
    db.prepare("DELETE FROM localities WHERE name LIKE 'Bahadurganj Test%'").run();
  };

  beforeAll(() => {
    cleanupTestData();

    // Generate authorized tokens dynamically from database
    const superAdmin = db.prepare("SELECT u.id FROM users u JOIN roles r ON u.role_id = r.id WHERE r.name = 'SUPER_ADMIN' LIMIT 1").get();
    superAdminToken = generateToken({
      userId: superAdmin ? superAdmin.id : '83a90e5f-c62a-4497-bee0-0f2725418c07',
      role: config.roles.SUPER_ADMIN
    });

    const ghz = db.prepare("SELECT id FROM districts WHERE name = 'Ghazipur'").get();
    ghazipurDistrictId = ghz ? ghz.id : 1;

    const vns = db.prepare("SELECT id FROM districts WHERE name = 'Varanasi'").get();
    varanasiDistrictId = vns ? vns.id : 2;

    const distAdmin = db.prepare("SELECT u.id, u.district_id FROM users u JOIN roles r ON u.role_id = r.id WHERE r.name = 'DISTRICT_ADMIN' LIMIT 1").get();
    ghazipurAdminToken = generateToken({
      userId: distAdmin ? distAdmin.id : '84df11ac-e5eb-4ea9-80fa-e5391e92ee46',
      role: config.roles.DISTRICT_ADMIN,
      districtId: ghazipurDistrictId
    });
  });

  afterAll(() => {
    cleanupTestData();
  });

  describe('1. Pan-India Master Taxonomy Coverage', () => {
    it('GET /api/locations/countries should return India as active root node', async () => {
      const res = await request(app).get('/api/locations/countries');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBeGreaterThanOrEqual(1);

      const india = res.body.data.find(c => c.code === 'IND');
      expect(india).toBeDefined();
      expect(india.name).toBe('India');
      expect(india.status).toBe('ACTIVE');
    });

    it('GET /api/locations/states should return all 28 States and 8 Union Territories (36 divisions)', async () => {
      const res = await request(app).get('/api/locations/states');
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(36);

      const states = res.body.data.filter(s => s.type === 'STATE');
      const uts = res.body.data.filter(s => s.type === 'UT');
      expect(states.length).toBe(28);
      expect(uts.length).toBe(8);

      const names = res.body.data.map(s => s.name);
      expect(names).toContain('Uttar Pradesh');
      expect(names).toContain('Bihar');
      expect(names).toContain('Maharashtra');
      expect(names).toContain('Karnataka');
      expect(names).toContain('Tamil Nadu');
      expect(names).toContain('Delhi');
      expect(names).toContain('Chandigarh');
      expect(names).toContain('Jammu and Kashmir');
      expect(names).toContain('Ladakh');
    });

    it('GET /api/locations/states?type=UT should return only Union Territories', async () => {
      const res = await request(app).get('/api/locations/states?type=UT');
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(8);
      res.body.data.forEach(ut => {
        expect(ut.type).toBe('UT');
      });
    });
  });

  describe('2. Authoritative District Coverage & Cascading Queries', () => {
    it('GET /api/locations/districts?stateId=loc-state-up should return all official Uttar Pradesh districts', async () => {
      const res = await request(app).get('/api/locations/districts?stateId=loc-state-up');
      expect(res.status).toBe(200);
      expect(res.body.count).toBeGreaterThanOrEqual(75);

      const names = res.body.data.map(d => d.name);
      expect(names).toContain('Ghazipur');
      expect(names).toContain('Varanasi');
      expect(names).toContain('Ballia');
      expect(names).toContain('Mau');
      expect(names).toContain('Lucknow');
      expect(names).toContain('Prayagraj (Allahabad)');
      expect(names).toContain('Agra');
      expect(names).toContain('Gorakhpur');
    });

    it('GET /api/locations/districts?state=Bihar should return only Bihar districts', async () => {
      const res = await request(app).get('/api/locations/districts?state=Bihar');
      expect(res.status).toBe(200);
      const names = res.body.data.map(d => d.name);
      expect(names).toContain('Patna');
      expect(names).not.toContain('Ghazipur');
    });
  });

  describe('3. Localities and Micro-Areas Cascading Retrieval', () => {
    it('GET /api/locations/localities?districtId=... should return localities strictly belonging to district', async () => {
      const res = await request(app).get(`/api/locations/localities?districtId=${ghazipurDistrictId}`);
      expect(res.status).toBe(200);
      expect(res.body.count).toBeGreaterThanOrEqual(1);

      const names = res.body.data.map(l => l.name);
      expect(names).toContain('Saidpur');
    });

    it('GET /api/locations/areas?localityId=loc-up-ghz-saidpur should return areas within Saidpur', async () => {
      const res = await request(app).get('/api/locations/areas?localityId=loc-up-ghz-saidpur');
      expect(res.status).toBe(200);
      const names = res.body.data.map(a => a.name);
      expect(names).toContain('Pankaj Talkies Area');
      expect(names).toContain('Station Road');
    });
  });

  describe('4. Full-Text Location Search & Master Hierarchy Stats', () => {
    it('GET /api/locations/search?q=Saidpur should locate Saidpur locality and areas', async () => {
      const res = await request(app).get('/api/locations/search?q=Saidpur');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.results.localities.length).toBeGreaterThanOrEqual(1);
      expect(res.body.results.localities[0].name).toBe('Saidpur');
    });

    it('GET /api/locations/stats should return comprehensive pan-India counts', async () => {
      const res = await request(app).get('/api/locations/stats');
      expect(res.status).toBe(200);
      expect(res.body.stats.states).toBe(28);
      expect(res.body.stats.uts).toBe(8);
      expect(res.body.stats.totalAdministrativeDivisions).toBe(36);
      expect(res.body.stats.districts).toBeGreaterThanOrEqual(75);
      expect(res.body.stats.localities).toBeGreaterThanOrEqual(5);
      expect(res.body.stats.areas).toBeGreaterThanOrEqual(5);
    });
  });

  describe('5. Super Admin CRUD & District Admin Geographic Isolation', () => {
    it('Super Admin can create a new district with parent state validation', async () => {
      const uniqueCode = `TST${Date.now().toString().slice(-3)}`;
      const res = await request(app)
        .post('/api/locations/districts')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          name: `Test District ${uniqueCode}`,
          stateId: 'loc-state-up',
          code: uniqueCode
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.state).toBe('Uttar Pradesh');
    });

    it('District Admin cannot create a district or state (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/locations/districts')
        .set('Authorization', `Bearer ${ghazipurAdminToken}`)
        .send({
          name: 'Unauthorized District',
          stateId: 'loc-state-up',
          code: 'UNAUTH'
        });

      expect(res.status).toBe(403);
    });

    it('District Admin CAN create a locality in their authorized district', async () => {
      const uniqueName = `Bahadurganj Test ${Date.now().toString().slice(-4)}`;
      const res = await request(app)
        .post('/api/locations/localities')
        .set('Authorization', `Bearer ${ghazipurAdminToken}`)
        .send({
          districtId: ghazipurDistrictId,
          name: uniqueName,
          type: 'TOWN',
          pincode: '233301'
        });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe(uniqueName);
    });

    it('District Admin CANNOT create a locality in another district (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/locations/localities')
        .set('Authorization', `Bearer ${ghazipurAdminToken}`)
        .send({
          districtId: varanasiDistrictId,
          name: 'Unauthorized Locality in Varanasi',
          type: 'TOWN',
          pincode: '221001'
        });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('restricted');
    });
  });
});
