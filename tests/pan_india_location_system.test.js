import { describe, it, expect, beforeEach } from 'vitest';
import { 
  INITIAL_COUNTRY, 
  INITIAL_STATES, 
  INITIAL_DISTRICTS, 
  INITIAL_LOCALITIES, 
  INITIAL_AREAS 
} from '../frontend/src/mock/data/locations.ts';
import { locationService } from '../frontend/src/services/locationService.ts';

// Minimal localStorage mock for Node/Vitest environment
class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) { return this.store[key] || null; }
  setItem(key, value) { this.store[key] = value.toString(); }
  removeItem(key) { delete this.store[key]; }
  clear() { this.store = {}; }
}

globalThis.localStorage = new MockLocalStorage();

describe('Pan-India Location System — State → District → Locality → Area', () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
  });

  describe('1. Pan-India Master Taxonomy Coverage', () => {
    it('Should include Country India as the root node', () => {
      expect(INITIAL_COUNTRY.id).toBe('loc-country-in');
      expect(INITIAL_COUNTRY.name).toBe('India');
      expect(INITIAL_COUNTRY.code).toBe('IND');
      expect(INITIAL_COUNTRY.status).toBe('ACTIVE');
    });

    it('Should include all 28 States and 8 Union Territories (36 total administrative divisions)', () => {
      const states = INITIAL_STATES.filter(s => s.type === 'STATE');
      const uts = INITIAL_STATES.filter(s => s.type === 'UT');

      expect(INITIAL_STATES.length).toBe(36);
      expect(states.length).toBe(28);
      expect(uts.length).toBe(8);

      // Verify key states requested
      const stateNames = INITIAL_STATES.map(s => s.name);
      expect(stateNames).toContain('Uttar Pradesh');
      expect(stateNames).toContain('Bihar');
      expect(stateNames).toContain('Maharashtra');
      expect(stateNames).toContain('Karnataka');
      expect(stateNames).toContain('Tamil Nadu');
      expect(stateNames).toContain('West Bengal');
      expect(stateNames).toContain('Delhi');
      expect(stateNames).toContain('Chandigarh');
      expect(stateNames).toContain('Jammu and Kashmir');
      expect(stateNames).toContain('Ladakh');
    });

    it('Should have active status for all initial states and UTs', () => {
      INITIAL_STATES.forEach(state => {
        expect(state.status).toBe('ACTIVE');
        expect(state.countryId).toBe('loc-country-in');
        expect(state.code).toBeDefined();
        expect(state.code.length).toBeGreaterThan(0);
      });
    });
  });

  describe('2. Hierarchical Relationships & Parent-Child Integrity', () => {
    it('Every district must belong to a valid State in India', () => {
      const stateIds = new Set(INITIAL_STATES.map(s => s.id));
      INITIAL_DISTRICTS.forEach(dist => {
        expect(dist.countryId).toBe('loc-country-in');
        expect(stateIds.has(dist.stateId)).toBe(true);
        expect(dist.status).toBe('ACTIVE');
      });
    });

    it('Every locality must belong to a valid District', () => {
      const districtIds = new Set(INITIAL_DISTRICTS.map(d => d.id));
      INITIAL_LOCALITIES.forEach(loc => {
        expect(districtIds.has(loc.districtId)).toBe(true);
        expect(loc.status).toBe('ACTIVE');
      });
    });

    it('Every area must belong to a valid Locality', () => {
      const localityIds = new Set(INITIAL_LOCALITIES.map(l => l.id));
      INITIAL_AREAS.forEach(area => {
        expect(localityIds.has(area.localityId)).toBe(true);
        expect(area.status).toBe('ACTIVE');
      });
    });

    it('Should correctly map Ghazipur → Saidpur → Pankaj Talkies Area hierarchy', () => {
      const up = INITIAL_STATES.find(s => s.name === 'Uttar Pradesh');
      expect(up).toBeDefined();

      const ghazipur = INITIAL_DISTRICTS.find(d => d.stateId === up?.id && d.name === 'Ghazipur');
      expect(ghazipur).toBeDefined();

      const saidpur = INITIAL_LOCALITIES.find(l => l.districtId === ghazipur?.id && l.name === 'Saidpur');
      expect(saidpur).toBeDefined();

      const pankajTalkies = INITIAL_AREAS.find(a => a.localityId === saidpur?.id && a.name.includes('Pankaj Talkies'));
      expect(pankajTalkies).toBeDefined();
      expect(pankajTalkies?.districtId).toBe(ghazipur?.id);
      expect(pankajTalkies?.stateId).toBe(up?.id);
    });

    it('Should correctly map Varanasi → Lanka / Sigra / Shivpur localities', () => {
      const up = INITIAL_STATES.find(s => s.name === 'Uttar Pradesh');
      const varanasi = INITIAL_DISTRICTS.find(d => d.stateId === up?.id && d.name === 'Varanasi');
      expect(varanasi).toBeDefined();

      const varanasiLocalities = INITIAL_LOCALITIES.filter(l => l.districtId === varanasi?.id).map(l => l.name);
      expect(varanasiLocalities).toContain('Lanka');
      expect(varanasiLocalities).toContain('Sigra');
      expect(varanasiLocalities).toContain('Shivpur');
      expect(varanasiLocalities).toContain('Rohania');
    });
  });

  describe('3. Cascading Downward Reset Invariant', () => {
    it('Simulating cascading resets: Changing State must invalidate District, Locality, and Area', () => {
      let selection = {
        countryId: 'loc-country-in',
        stateId: 'loc-state-up',
        stateName: 'Uttar Pradesh',
        districtId: 'dist-gzp',
        districtName: 'Ghazipur',
        localityId: 'loc-gzp-saidpur',
        localityName: 'Saidpur',
        areaId: 'loc-area-pankaj-talkies',
        areaName: 'Pankaj Talkies Area'
      };

      // When state changes to Bihar
      const newStateId = 'loc-state-br';
      if (selection.stateId !== newStateId) {
        selection = {
          countryId: 'loc-country-in',
          stateId: newStateId,
          stateName: 'Bihar',
          districtId: undefined,
          districtName: undefined,
          localityId: undefined,
          localityName: undefined,
          areaId: undefined,
          areaName: undefined
        };
      }

      expect(selection.stateId).toBe('loc-state-br');
      expect(selection.districtId).toBeUndefined();
      expect(selection.localityId).toBeUndefined();
      expect(selection.areaId).toBeUndefined();
    });

    it('Simulating cascading resets: Changing District must invalidate Locality and Area', () => {
      let selection = {
        countryId: 'loc-country-in',
        stateId: 'loc-state-up',
        stateName: 'Uttar Pradesh',
        districtId: 'dist-gzp',
        districtName: 'Ghazipur',
        localityId: 'loc-gzp-saidpur',
        localityName: 'Saidpur',
        areaId: 'loc-area-pankaj-talkies',
        areaName: 'Pankaj Talkies Area'
      };

      // When district changes to Varanasi
      const newDistrictId = 'dist-vns';
      if (selection.districtId !== newDistrictId) {
        selection = {
          ...selection,
          districtId: newDistrictId,
          districtName: 'Varanasi',
          localityId: undefined,
          localityName: undefined,
          areaId: undefined,
          areaName: undefined
        };
      }

      expect(selection.stateId).toBe('loc-state-up');
      expect(selection.districtId).toBe('dist-vns');
      expect(selection.localityId).toBeUndefined();
      expect(selection.areaId).toBeUndefined();
    });

    it('Simulating cascading resets: Changing Locality must invalidate Area', () => {
      let selection = {
        countryId: 'loc-country-in',
        stateId: 'loc-state-up',
        stateName: 'Uttar Pradesh',
        districtId: 'dist-gzp',
        districtName: 'Ghazipur',
        localityId: 'loc-gzp-saidpur',
        localityName: 'Saidpur',
        areaId: 'loc-area-pankaj-talkies',
        areaName: 'Pankaj Talkies Area'
      };

      // When locality changes to Sadat
      const newLocalityId = 'loc-gzp-sadat';
      if (selection.localityId !== newLocalityId) {
        selection = {
          ...selection,
          localityId: newLocalityId,
          localityName: 'Sadat',
          areaId: undefined,
          areaName: undefined
        };
      }

      expect(selection.districtId).toBe('dist-gzp');
      expect(selection.localityId).toBe('loc-gzp-sadat');
      expect(selection.areaId).toBeUndefined();
    });
  });

  describe('4. Geographic Isolation & Strict Filtering', () => {
    const mockLibraries = [
      { id: 'lib-1', name: 'Saidpur Digital Library', stateId: 'loc-state-up', districtId: 'dist-gzp', localityId: 'loc-gzp-saidpur', areaId: 'loc-area-pankaj-talkies' },
      { id: 'lib-2', name: 'Sadat Study Hub', stateId: 'loc-state-up', districtId: 'dist-gzp', localityId: 'loc-gzp-sadat', areaId: 'loc-area-sadat-mkt' },
      { id: 'lib-3', name: 'Kashi Central Library', stateId: 'loc-state-up', districtId: 'dist-vns', localityId: 'loc-vns-lanka', areaId: 'loc-area-vns-bhugate' },
      { id: 'lib-4', name: 'Patna Knowledge Point', stateId: 'loc-state-br', districtId: 'dist-pat', localityId: 'loc-pat-boringroad', areaId: 'loc-area-pat-ancollege' }
    ];

    it('Filter by State UP should never return libraries from Bihar', () => {
      const upLibs = mockLibraries.filter(lib => lib.stateId === 'loc-state-up');
      expect(upLibs.map(l => l.id)).toEqual(['lib-1', 'lib-2', 'lib-3']);
      expect(upLibs.some(l => l.stateId === 'loc-state-br')).toBe(false);
    });

    it('Filter by District Ghazipur should never return libraries from Varanasi', () => {
      const gzpLibs = mockLibraries.filter(lib => lib.districtId === 'dist-gzp');
      expect(gzpLibs.map(l => l.id)).toEqual(['lib-1', 'lib-2']);
      expect(gzpLibs.some(l => l.districtId === 'dist-vns')).toBe(false);
    });

    it('Filter by Locality Saidpur should never return libraries from Sadat', () => {
      const saidpurLibs = mockLibraries.filter(lib => lib.localityId === 'loc-gzp-saidpur');
      expect(saidpurLibs.map(l => l.id)).toEqual(['lib-1']);
      expect(saidpurLibs.some(l => l.localityId === 'loc-gzp-sadat')).toBe(false);
    });

    it('Filter by Area Pankaj Talkies Area should isolate to that micro-zone', () => {
      const areaLibs = mockLibraries.filter(lib => lib.areaId === 'loc-area-pankaj-talkies');
      expect(areaLibs.length).toBe(1);
      expect(areaLibs[0].name).toBe('Saidpur Digital Library');
    });
  });

  describe('5. Formatting & Hierarchy Display', () => {
    it('Should format complete location string with Area, Locality, District, State', () => {
      const parts = ['Pankaj Talkies Area', 'Saidpur', 'Ghazipur', 'Uttar Pradesh'];
      const formatted = parts.filter(p => p && !p.startsWith('All ')).join(', ');
      expect(formatted).toBe('Pankaj Talkies Area, Saidpur, Ghazipur, Uttar Pradesh');
    });

    it('Should format fallback cleanly when Area is not selected', () => {
      const parts = [undefined, 'Saidpur', 'Ghazipur', 'Uttar Pradesh'];
      const formatted = parts.filter(Boolean).join(', ');
      expect(formatted).toBe('Saidpur, Ghazipur, Uttar Pradesh');
    });

    it('Should format fallback cleanly when only District and State are selected', () => {
      const parts = [undefined, undefined, 'Ghazipur', 'Uttar Pradesh'];
      const formatted = parts.filter(Boolean).join(', ');
      expect(formatted).toBe('Ghazipur, Uttar Pradesh');
    });
  });

  describe('6. LocationService Operations & Super Admin CRUD', () => {
    beforeEach(() => {
      locationService.resetToDefaults(false);
    });

    it('locationService.getStates() should return all active states sorted', () => {
      const states = locationService.getStates();
      expect(states.length).toBe(36);
      // Alphabetical check
      expect(states[0].name.localeCompare(states[1].name)).toBeLessThanOrEqual(0);
    });

    it('locationService.getDistricts(stateId) should return only districts in that state', () => {
      const upDistricts = locationService.getDistricts('loc-state-up');
      expect(upDistricts.length).toBeGreaterThanOrEqual(16);
      upDistricts.forEach(d => expect(d.stateId).toBe('loc-state-up'));

      const biharDistricts = locationService.getDistricts('loc-state-br');
      expect(biharDistricts.length).toBeGreaterThanOrEqual(5);
      biharDistricts.forEach(d => expect(d.stateId).toBe('loc-state-br'));
    });

    it('locationService.getLocalities(districtId) should return only localities in that district', () => {
      const gzpLocalities = locationService.getLocalities('dist-gzp');
      expect(gzpLocalities.length).toBeGreaterThanOrEqual(14);
      gzpLocalities.forEach(l => expect(l.districtId).toBe('dist-gzp'));

      const vnsLocalities = locationService.getLocalities('dist-vns');
      expect(vnsLocalities.length).toBeGreaterThanOrEqual(10);
      vnsLocalities.forEach(l => expect(l.districtId).toBe('dist-vns'));
    });

    it('locationService.getAreas(localityId) should return only areas in that locality', () => {
      const saidpurAreas = locationService.getAreas('loc-gzp-saidpur');
      expect(saidpurAreas.length).toBeGreaterThanOrEqual(8);
      saidpurAreas.forEach(a => expect(a.localityId).toBe('loc-gzp-saidpur'));
    });

    it('locationService.formatLocation() should generate consistent hierarchy strings', () => {
      const formatted = locationService.formatLocation({
        countryId: 'loc-country-in',
        stateId: 'loc-state-up',
        districtId: 'dist-gzp',
        localityId: 'loc-gzp-saidpur',
        areaId: 'loc-area-pankaj-talkies',
      });
      expect(formatted).toBe('Pankaj Talkies Area, Saidpur, Ghazipur, Uttar Pradesh');
    });

    it('Super Admin CRUD: Can add, update, toggle, and delete a state', () => {
      const newState = locationService.addState({
        name: 'Test New State',
        code: 'TNS',
        type: 'STATE',
        status: 'ACTIVE',
      });
      expect(newState.id).toBeDefined();
      expect(locationService.getStateById(newState.id)?.name).toBe('Test New State');

      // Update
      const updated = locationService.updateState(newState.id, { name: 'Updated Test State' });
      expect(updated.name).toBe('Updated Test State');

      // Toggle status
      const toggled = locationService.toggleStateStatus(newState.id);
      expect(toggled.status).toBe('INACTIVE');
      expect(locationService.getActiveStates().some(s => s.id === newState.id)).toBe(false);

      // Delete
      locationService.deleteState(newState.id);
      expect(locationService.getStateById(newState.id)).toBeUndefined();
    });

    it('Super Admin CRUD: Can add, update, toggle, and delete a district', () => {
      const newDist = locationService.addDistrict({
        stateId: 'loc-state-up',
        name: 'New Test District',
        code: 'NTD',
        status: 'ACTIVE',
      });
      expect(newDist.id).toBeDefined();
      expect(locationService.getDistrictById(newDist.id)?.name).toBe('New Test District');

      // Update
      locationService.updateDistrict(newDist.id, { name: 'Updated District Name' });
      expect(locationService.getDistrictById(newDist.id)?.name).toBe('Updated District Name');

      // Toggle status
      locationService.toggleDistrictStatus(newDist.id);
      expect(locationService.getActiveDistricts('loc-state-up').some(d => d.id === newDist.id)).toBe(false);

      // Delete
      locationService.deleteDistrict(newDist.id);
      expect(locationService.getDistrictById(newDist.id)).toBeUndefined();
    });

    it('Super Admin CRUD: Can add, update, toggle, and delete a locality', () => {
      const newLoc = locationService.addLocality({
        stateId: 'loc-state-up',
        districtId: 'dist-gzp',
        name: 'New Test Tehsil',
        type: 'TEHSIL',
        pincode: '233999',
        status: 'ACTIVE',
      });
      expect(newLoc.id).toBeDefined();
      expect(locationService.getLocalityById(newLoc.id)?.name).toBe('New Test Tehsil');

      // Update
      locationService.updateLocality(newLoc.id, { pincode: '233888' });
      expect(locationService.getLocalityById(newLoc.id)?.pincode).toBe('233888');

      // Toggle status
      locationService.toggleLocalityStatus(newLoc.id);
      expect(locationService.getActiveLocalities('dist-gzp').some(l => l.id === newLoc.id)).toBe(false);

      // Delete
      locationService.deleteLocality(newLoc.id);
      expect(locationService.getLocalityById(newLoc.id)).toBeUndefined();
    });

    it('Super Admin CRUD: Can add, update, toggle, and delete an area', () => {
      const newArea = locationService.addArea({
        stateId: 'loc-state-up',
        districtId: 'dist-gzp',
        localityId: 'loc-gzp-saidpur',
        name: 'New Test Nagar',
        type: 'NEIGHBORHOOD',
        pincode: '233221',
        status: 'ACTIVE',
      });
      expect(newArea.id).toBeDefined();
      expect(locationService.getAreaById(newArea.id)?.name).toBe('New Test Nagar');

      // Update
      locationService.updateArea(newArea.id, { name: 'Renamed Test Nagar' });
      expect(locationService.getAreaById(newArea.id)?.name).toBe('Renamed Test Nagar');

      // Toggle status
      locationService.toggleAreaStatus(newArea.id);
      expect(locationService.getActiveAreas('loc-gzp-saidpur').some(a => a.id === newArea.id)).toBe(false);

      // Delete
      locationService.deleteArea(newArea.id);
      expect(locationService.getAreaById(newArea.id)).toBeUndefined();
    });

    it('locationService.getLocationHierarchyStats() should return aggregate metrics', () => {
      const stats = locationService.getLocationHierarchyStats();
      expect(stats.totalCountries).toBe(1);
      expect(stats.totalStates).toBe(36);
      expect(stats.totalDistricts).toBeGreaterThanOrEqual(30);
      expect(stats.totalLocalities).toBeGreaterThanOrEqual(25);
      expect(stats.totalAreas).toBeGreaterThanOrEqual(20);
    });
  });
});
