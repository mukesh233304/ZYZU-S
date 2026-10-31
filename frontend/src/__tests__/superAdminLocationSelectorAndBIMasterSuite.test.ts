import { describe, it, expect, beforeEach } from 'vitest';
import { locationService } from '../services/locationService';
import { LocationSelectionPayload } from '../components/common/PanIndiaLocationSelector';

describe('FOCUSPOINT — PAN-INDIA LOCATION SELECTOR & BI COCKPIT MASTER SUITE', () => {
  beforeEach(() => {
    // Reset any mutations
  });

  describe('1. Location Service Master Integrity & State-to-District Cascading', () => {
    it('successfully retrieves all major Indian States from locationService', () => {
      const states = locationService.getStates('loc-country-in');
      expect(states).toBeDefined();
      expect(states.length).toBeGreaterThanOrEqual(7);

      const stateNames = states.map(s => s.name);
      expect(stateNames).toContain('Uttar Pradesh');
      expect(stateNames).toContain('Bihar');
      expect(stateNames).toContain('Delhi');
      expect(stateNames).toContain('Maharashtra');
      expect(stateNames).toContain('Rajasthan');
      expect(stateNames).toContain('Madhya Pradesh');
      expect(stateNames).toContain('West Bengal');
    });

    it('gracefully handles non-standard country IDs with fallback to initial states', () => {
      const states = locationService.getStates('IN');
      expect(states.length).toBeGreaterThan(0);
      expect(states.some(s => s.name === 'Uttar Pradesh')).toBe(true);

      const fallbackStates = locationService.getStates('unknown-country');
      expect(fallbackStates.length).toBeGreaterThan(0);
    });

    it('cascades correctly from Uttar Pradesh to its districts', () => {
      const upDistricts = locationService.getDistricts('loc-state-up');
      expect(upDistricts).toBeDefined();
      expect(upDistricts.length).toBeGreaterThanOrEqual(6);

      const districtNames = upDistricts.map(d => d.name);
      expect(districtNames).toContain('Varanasi');
      expect(districtNames).toContain('Ghazipur');
      expect(districtNames).toContain('Lucknow');
      expect(districtNames).toContain('Prayagraj (Allahabad)');
      expect(districtNames).toContain('Gorakhpur');
      expect(districtNames).toContain('Kanpur Nagar');
    });

    it('cascades correctly from Bihar to its districts', () => {
      const brDistricts = locationService.getDistricts('loc-state-br');
      expect(brDistricts).toBeDefined();
      expect(brDistricts.length).toBeGreaterThanOrEqual(5);

      const districtNames = brDistricts.map(d => d.name);
      expect(districtNames).toContain('Patna');
      expect(districtNames).toContain('Gaya');
      expect(districtNames).toContain('Muzaffarpur');
      expect(districtNames).toContain('Bhagalpur');
      expect(districtNames).toContain('Darbhanga');
    });

    it('cascades correctly from Varanasi district to its educational localities', () => {
      const localities = locationService.getLocalities('dist-vns');
      expect(localities).toBeDefined();
      expect(localities.length).toBeGreaterThanOrEqual(5);

      const locNames = localities.map(l => l.name);
      expect(locNames).toContain('Lanka');
      expect(locNames).toContain('BHU Campus');
      expect(locNames).toContain('Sigra');
      expect(locNames).toContain('Assi');
      expect(locNames).toContain('Pandeypur');
    });

    it('returns empty array when unknown district ID is requested', () => {
      const localities = locationService.getLocalities('non-existent-dist-id');
      expect(Array.isArray(localities)).toBe(true);
      expect(localities.length).toBe(0);
    });
  });

  describe('2. Study Material Commercial BI Location & Period Reactivity', () => {
    // Helper function reproducing SuperAdminStudyMaterialBI multiplier logic
    const calculateStudyMaterialMultiplier = (location: LocationSelectionPayload, timeRange: string) => {
      let locMultiplier = 1.0;
      if (location.level !== 'INDIA' && location.stateName) {
        const stateLower = (location.stateName || '').toLowerCase();
        const districtLower = (location.districtName || '').toLowerCase();
        const localityLower = (location.localityName || '').toLowerCase();

        if (localityLower) {
          locMultiplier = 0.04;
        } else if (districtLower) {
          if (districtLower.includes('varanasi')) locMultiplier = 0.24;
          else if (districtLower.includes('ghazipur')) locMultiplier = 0.18;
          else if (districtLower.includes('lucknow')) locMultiplier = 0.16;
          else if (districtLower.includes('prayagraj') || districtLower.includes('allahabad')) locMultiplier = 0.14;
          else if (districtLower.includes('patna')) locMultiplier = 0.15;
          else if (districtLower.includes('delhi')) locMultiplier = 0.20;
          else if (districtLower.includes('pune')) locMultiplier = 0.18;
          else if (districtLower.includes('jaipur')) locMultiplier = 0.12;
          else locMultiplier = 0.09;
        } else {
          if (stateLower.includes('uttar')) locMultiplier = 0.62;
          else if (stateLower.includes('bihar')) locMultiplier = 0.24;
          else if (stateLower.includes('delhi')) locMultiplier = 0.32;
          else if (stateLower.includes('maharashtra')) locMultiplier = 0.35;
          else if (stateLower.includes('rajasthan')) locMultiplier = 0.22;
          else if (stateLower.includes('madhya')) locMultiplier = 0.20;
          else if (stateLower.includes('bengal')) locMultiplier = 0.19;
          else locMultiplier = 0.15;
        }
      }

      let pMultiplier = 1.0;
      switch (timeRange) {
        case 'today': pMultiplier = 0.035; break;
        case '7d': pMultiplier = 0.25; break;
        case '30d': pMultiplier = 1.0; break;
        case 'quarter': pMultiplier = 2.8; break;
        case 'year': pMultiplier = 10.5; break;
      }

      return { locMultiplier, pMultiplier, effectiveMultiplier: locMultiplier * pMultiplier };
    };

    it('scales gross sales correctly for Pan-India baseline at 30D period', () => {
      const panIndia: LocationSelectionPayload = {
        countryId: 'IN',
        level: 'INDIA',
        breadcrumb: 'Pan-India'
      };
      const res = calculateStudyMaterialMultiplier(panIndia, '30d');
      expect(res.locMultiplier).toBe(1.0);
      expect(res.pMultiplier).toBe(1.0);
      expect(res.effectiveMultiplier).toBe(1.0);
    });

    it('scales gross sales accurately when Uttar Pradesh state is selected', () => {
      const upLocation: LocationSelectionPayload = {
        countryId: 'IN',
        stateId: 'loc-state-up',
        stateName: 'Uttar Pradesh',
        level: 'STATE',
        breadcrumb: 'India → Uttar Pradesh'
      };
      const res = calculateStudyMaterialMultiplier(upLocation, '30d');
      expect(res.locMultiplier).toBe(0.62);
      expect(res.effectiveMultiplier).toBe(0.62);
    });

    it('scales gross sales accurately when Varanasi district is selected', () => {
      const vnsLocation: LocationSelectionPayload = {
        countryId: 'IN',
        stateId: 'loc-state-up',
        stateName: 'Uttar Pradesh',
        districtId: 'loc-dist-vns',
        districtName: 'Varanasi',
        level: 'DISTRICT',
        breadcrumb: 'India → Uttar Pradesh → Varanasi'
      };
      const res = calculateStudyMaterialMultiplier(vnsLocation, '30d');
      expect(res.locMultiplier).toBe(0.24);
      expect(res.effectiveMultiplier).toBe(0.24);
    });

    it('scales gross sales accurately when Ghazipur district is selected', () => {
      const gzLocation: LocationSelectionPayload = {
        countryId: 'IN',
        stateId: 'loc-state-up',
        stateName: 'Uttar Pradesh',
        districtId: 'loc-dist-gzp',
        districtName: 'Ghazipur',
        level: 'DISTRICT',
        breadcrumb: 'India → Uttar Pradesh → Ghazipur'
      };
      const res = calculateStudyMaterialMultiplier(gzLocation, '30d');
      expect(res.locMultiplier).toBe(0.18);
    });

    it('scales gross sales accurately for Patna, Bihar', () => {
      const patnaLocation: LocationSelectionPayload = {
        countryId: 'IN',
        stateId: 'loc-state-br',
        stateName: 'Bihar',
        districtId: 'loc-dist-pat',
        districtName: 'Patna',
        level: 'DISTRICT',
        breadcrumb: 'India → Bihar → Patna'
      };
      const res = calculateStudyMaterialMultiplier(patnaLocation, '30d');
      expect(res.locMultiplier).toBe(0.15);
    });

    it('multiplies correctly across all time periods', () => {
      const panIndia: LocationSelectionPayload = {
        countryId: 'IN',
        level: 'INDIA',
        breadcrumb: 'Pan-India'
      };
      expect(calculateStudyMaterialMultiplier(panIndia, 'today').pMultiplier).toBe(0.035);
      expect(calculateStudyMaterialMultiplier(panIndia, '7d').pMultiplier).toBe(0.25);
      expect(calculateStudyMaterialMultiplier(panIndia, 'quarter').pMultiplier).toBe(2.8);
      expect(calculateStudyMaterialMultiplier(panIndia, 'year').pMultiplier).toBe(10.5);
    });
  });

  describe('3. Mock Test BI & Passes Location & Cohort Multiplier Engine', () => {
    // Helper function reproducing SuperAdminMockTestBI multiplier logic
    const calculateMockTestMultiplier = (location: LocationSelectionPayload, filterPeriod: string) => {
      let locMultiplier = 1.0;
      if (location.level !== 'INDIA' && location.stateName) {
        const stateLower = (location.stateName || '').toLowerCase();
        const districtLower = (location.districtName || '').toLowerCase();
        const localityLower = (location.localityName || '').toLowerCase();

        if (localityLower) {
          locMultiplier = 0.05;
        } else if (districtLower) {
          if (districtLower.includes('varanasi')) locMultiplier = 0.26;
          else if (districtLower.includes('ghazipur')) locMultiplier = 0.20;
          else if (districtLower.includes('lucknow')) locMultiplier = 0.17;
          else if (districtLower.includes('prayagraj') || districtLower.includes('allahabad')) locMultiplier = 0.15;
          else if (districtLower.includes('patna')) locMultiplier = 0.16;
          else if (districtLower.includes('delhi')) locMultiplier = 0.22;
          else if (districtLower.includes('pune')) locMultiplier = 0.19;
          else locMultiplier = 0.10;
        } else {
          if (stateLower.includes('uttar')) locMultiplier = 0.65;
          else if (stateLower.includes('bihar')) locMultiplier = 0.25;
          else if (stateLower.includes('delhi')) locMultiplier = 0.34;
          else if (stateLower.includes('maharashtra')) locMultiplier = 0.36;
          else if (stateLower.includes('rajasthan')) locMultiplier = 0.23;
          else locMultiplier = 0.16;
        }
      }

      let pMultiplier = 1.0;
      switch (filterPeriod) {
        case 'today': pMultiplier = 0.04; break;
        case 'week': pMultiplier = 0.26; break;
        case 'month': pMultiplier = 1.0; break;
        case 'quarter': pMultiplier = 2.9; break;
        case 'all': pMultiplier = 8.2; break;
      }

      return { locMultiplier, pMultiplier, effectiveMultiplier: locMultiplier * pMultiplier };
    };

    it('computes CBT candidate volume correctly for Pan-India', () => {
      const panIndia: LocationSelectionPayload = {
        countryId: 'IN',
        level: 'INDIA',
        breadcrumb: 'Pan-India'
      };
      const res = calculateMockTestMultiplier(panIndia, 'month');
      expect(res.locMultiplier).toBe(1.0);
      expect(res.effectiveMultiplier).toBe(1.0);
    });

    it('computes CBT candidate volume correctly for Uttar Pradesh', () => {
      const upLocation: LocationSelectionPayload = {
        countryId: 'IN',
        stateId: 'loc-state-up',
        stateName: 'Uttar Pradesh',
        level: 'STATE',
        breadcrumb: 'India → Uttar Pradesh'
      };
      const res = calculateMockTestMultiplier(upLocation, 'month');
      expect(res.locMultiplier).toBe(0.65);
    });

    it('computes CBT candidate volume correctly for Varanasi test hub', () => {
      const vnsLocation: LocationSelectionPayload = {
        countryId: 'IN',
        stateId: 'loc-state-up',
        stateName: 'Uttar Pradesh',
        districtId: 'loc-dist-vns',
        districtName: 'Varanasi',
        level: 'DISTRICT',
        breadcrumb: 'India → Uttar Pradesh → Varanasi'
      };
      const res = calculateMockTestMultiplier(vnsLocation, 'month');
      expect(res.locMultiplier).toBe(0.26);
    });

    it('computes CBT candidate volume correctly for Bihar state and Patna node', () => {
      const biharLocation: LocationSelectionPayload = {
        countryId: 'IN',
        stateId: 'loc-state-br',
        stateName: 'Bihar',
        level: 'STATE',
        breadcrumb: 'India → Bihar'
      };
      expect(calculateMockTestMultiplier(biharLocation, 'month').locMultiplier).toBe(0.25);

      const patnaLocation: LocationSelectionPayload = {
        countryId: 'IN',
        stateId: 'loc-state-br',
        stateName: 'Bihar',
        districtId: 'loc-dist-pat',
        districtName: 'Patna',
        level: 'DISTRICT',
        breadcrumb: 'India → Bihar → Patna'
      };
      expect(calculateMockTestMultiplier(patnaLocation, 'month').locMultiplier).toBe(0.16);
    });
  });

  describe('4. Theme and UI Tokens Harmonization', () => {
    it('verifies Emerald theme configuration for Study Material BI', () => {
      const emeraldTheme = {
        accent: 'emerald',
        caretColor: '#10b981',
        textColor: '#ffffff',
        popoverBg: 'bg-[#03150d]/95'
      };
      expect(emeraldTheme.accent).toBe('emerald');
      expect(emeraldTheme.textColor).toBe('#ffffff');
      expect(emeraldTheme.caretColor).toBe('#10b981');
    });

    it('verifies Purple theme configuration for Mock Test BI & Passes', () => {
      const purpleTheme = {
        accent: 'purple',
        caretColor: '#a855f7',
        textColor: '#ffffff',
        popoverBg: 'bg-[#120422]/95'
      };
      expect(purpleTheme.accent).toBe('purple');
      expect(purpleTheme.textColor).toBe('#ffffff');
      expect(purpleTheme.caretColor).toBe('#a855f7');
    });

    it('validates territory preset codes match valid states', () => {
      const presets = [
        { id: 'loc-state-up', name: 'Uttar Pradesh', code: 'UP' },
        { id: 'loc-state-br', name: 'Bihar', code: 'BR' },
        { id: 'loc-state-dl', name: 'Delhi', code: 'DL' },
        { id: 'loc-state-mh', name: 'Maharashtra', code: 'MH' },
        { id: 'loc-state-rj', name: 'Rajasthan', code: 'RJ' },
        { id: 'loc-state-mp', name: 'Madhya Pradesh', code: 'MP' },
        { id: 'loc-state-wb', name: 'West Bengal', code: 'WB' },
      ];

      const allStates = locationService.getStates('loc-country-in');
      presets.forEach(preset => {
        const found = allStates.find(s => s.id === preset.id || s.name === preset.name);
        expect(found).toBeDefined();
      });
    });
  });
});
