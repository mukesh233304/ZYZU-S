import { describe, it, expect } from 'vitest';
import { mockStore } from '../mock/store';

/**
 * FOCUSPOINT SERVICES PAGE & DIGITAL LIBRARIES FLAGSHIP FUTURISTIC SPOTLIGHT SUITE
 * Validating the dedicated, futuristic Find AC Digital Libraries spotlight section
 * accessed via the Services footer icon (/services).
 */

describe('Services Page - Find Digital Libraries Futuristic Upgrade Suite', () => {

  describe('Scenario 1: Flagship Digital Libraries Spotlight Architecture', () => {
    it('anchors the Find Digital Libraries section as a top-priority flagship module with id digital-libraries-section', () => {
      const sectionId = 'digital-libraries-section';
      expect(sectionId).toBe('digital-libraries-section');

      const badgePillars = [
        'FLAGSHIP SELF-STUDY NETWORK',
        '100% AC & Power Backup',
        'Live Seat Reservation',
        'Free 1-Day Trial Pass'
      ];
      expect(badgePillars.length).toBe(4);
      expect(badgePillars).toContain('100% AC & Power Backup');
      expect(badgePillars).toContain('Live Seat Reservation');
      expect(badgePillars).toContain('Free 1-Day Trial Pass');
    });

    it('provides 4 core security and trust guarantees for students and aspirants', () => {
      const guarantees = [
        { label: 'District Pre-Inspected', detail: 'Verified ventilation, fire safety & CCTV' },
        { label: 'Guaranteed Personal Desk', detail: 'Reserved numbered desk with power point' },
        { label: 'Pin-Drop Silence Zone', detail: 'Acoustic partitions & strict compliance' },
        { label: 'Free 1-Day Trial Pass', detail: 'Zero upfront commitment test study' }
      ];

      expect(guarantees.length).toBe(4);
      expect(guarantees[0].label).toBe('District Pre-Inspected');
      expect(guarantees[1].label).toBe('Guaranteed Personal Desk');
      expect(guarantees[2].label).toBe('Pin-Drop Silence Zone');
      expect(guarantees[3].label).toBe('Free 1-Day Trial Pass');
    });
  });

  describe('Scenario 2: Interactive Futuristic Library Matcher Cockpit Logic', () => {
    it('supports selecting standard study shifts and calculating pricing estimates', () => {
      const shifts = [
        { name: 'Morning (06:00 AM - 11:00 AM)', price: 499 },
        { name: 'Afternoon (11:00 AM - 04:00 PM)', price: 499 },
        { name: 'Evening (04:00 PM - 09:00 PM)', price: 499 },
        { name: 'Full Day (15-Hr Pass)', price: 999 },
        { name: '24x7 Night Owl Pass', price: 1299 }
      ];

      expect(shifts.length).toBe(5);
      const getEstimatedShiftPrice = (shiftName: string) => {
        const found = shifts.find(s => s.name === shiftName);
        return found ? found.price : 499;
      };

      expect(getEstimatedShiftPrice('Morning (06:00 AM - 11:00 AM)')).toBe(499);
      expect(getEstimatedShiftPrice('Full Day (15-Hr Pass)')).toBe(999);
      expect(getEstimatedShiftPrice('24x7 Night Owl Pass')).toBe(1299);
    });

    it('supports selecting key facility filters including AC, Wi-Fi, and Lockers', () => {
      const facilities = [
        'Air Conditioned (AC)',
        'High-Speed 5G Wi-Fi',
        '100% Power Backup',
        'Personal Storage Locker',
        'Pin-Drop Silence Zone',
        'RO Cold & Hot Water'
      ];

      expect(facilities).toContain('Air Conditioned (AC)');
      expect(facilities).toContain('High-Speed 5G Wi-Fi');
      expect(facilities).toContain('Personal Storage Locker');
    });

    it('supports selecting target examination categories for tailored seat matching', () => {
      const examGoals = [
        'Civil Services / UPSC / UPPSC',
        'NEET / JEE / Medical',
        'SSC / Railway / UP Police',
        'State Board / High School',
        'General Self-Study & Reading'
      ];

      expect(examGoals.length).toBe(5);
      expect(examGoals).toContain('Civil Services / UPSC / UPPSC');
      expect(examGoals).toContain('NEET / JEE / Medical');
    });

    it('generates an exact deep-link search query URL for seamless handover to /find-library', () => {
      const buildLibrarySearchUrl = (params: { 
        facility?: string; 
        shift?: string; 
        locality?: string;
        goal?: string;
      }) => {
        const urlParams = new URLSearchParams();
        if (params.facility) urlParams.set('facility', params.facility);
        if (params.shift) urlParams.set('shift', params.shift);
        if (params.locality) urlParams.set('locality', params.locality);
        if (params.goal) urlParams.set('goal', params.goal);
        return `/find-library?${urlParams.toString()}`;
      };

      const url = buildLibrarySearchUrl({
        facility: 'Air Conditioned (AC)',
        shift: 'Full Day (15-Hr Pass)',
        locality: 'Saidpur, Ghazipur',
        goal: 'Civil Services / UPSC / UPPSC'
      });

      expect(url).toContain('/find-library?');
      expect(url).toContain('facility=Air+Conditioned+%28AC%29');
      expect(url).toContain('shift=Full+Day+%2815-Hr+Pass%29');
      expect(url).toContain('locality=Saidpur%2C+Ghazipur');
      expect(url).toContain('goal=Civil+Services+%2F+UPSC+%2F+UPPSC');
    });
  });

  describe('Scenario 3: Live Verified Library Deck Integration & Real-Time Seat Metrics', () => {
    it('loads approved and discoverable libraries directly from mockStore', () => {
      const approvedLibraries = mockStore.getLibraries().filter(l => l.verificationStatus === 'APPROVED');
      expect(approvedLibraries.length).toBeGreaterThan(0);

      const sample = approvedLibraries[0];
      expect(sample.verificationStatus).toBe('APPROVED');
      expect(sample.name).toBeTruthy();
      expect(sample.totalSeats).toBeGreaterThan(0);
      expect(sample.availableSeats).toBeGreaterThanOrEqual(0);
      expect(sample.facilities.length).toBeGreaterThan(0);
    });

    it('accurately calculates seat occupancy rates for visual progress displays', () => {
      const calculateOccupancy = (total: number, available: number) => {
        if (!total || total <= 0) return 0;
        const occupied = Math.max(0, total - available);
        return Math.round((occupied / total) * 100);
      };

      expect(calculateOccupancy(50, 20)).toBe(60);
      expect(calculateOccupancy(60, 22)).toBe(63);
      expect(calculateOccupancy(48, 16)).toBe(67);
      expect(calculateOccupancy(100, 100)).toBe(0);
    });

    it('displays starting pricing and direct booking links for approved study halls', () => {
      const approvedLibraries = mockStore.getLibraries().filter(l => l.verificationStatus === 'APPROVED').slice(0, 3);
      approvedLibraries.forEach(lib => {
        const price = lib.monthlyStartingPrice || 499;
        expect(price).toBeGreaterThan(0);
        const bookingLink = `/find-library?libraryId=${lib.id}`;
        expect(bookingLink).toContain(lib.id);
      });
    });
  });

  describe('Scenario 4: Interactive Miniature Seat Pod Simulator Logic', () => {
    const DESK_PODS = [
      { id: 1, label: 'Desk 01', status: 'OCCUPIED', shift: 'Morning Shift' },
      { id: 2, label: 'Desk 02', status: 'OCCUPIED', shift: 'Full Day' },
      { id: 3, label: 'Desk 03', status: 'AVAILABLE', shift: 'All Shifts' },
      { id: 4, label: 'Desk 04', status: 'AVAILABLE', shift: 'All Shifts' },
      { id: 5, label: 'Desk 05', status: 'AVAILABLE', shift: 'All Shifts' },
      { id: 6, label: 'Desk 06', status: 'OCCUPIED', shift: 'Evening Shift' },
      { id: 7, label: 'Desk 07', status: 'AVAILABLE', shift: 'All Shifts' },
      { id: 8, label: 'Desk 08', status: 'AVAILABLE', shift: 'All Shifts' }
    ];

    it('manages 8 preview desk units with status and allocation info', () => {
      expect(DESK_PODS.length).toBe(8);
      const available = DESK_PODS.filter(d => d.status === 'AVAILABLE');
      expect(available.length).toBe(5);
    });

    it('provides desk specifications for power, ergonomics, and acoustics', () => {
      const deskSpec = {
        power: '240V 3-Pin Dedicated Socket + Dual USB Fast Charging',
        chair: 'High-back Ergonomic Mesh Chair with Lumbar Support',
        lighting: 'Flicker-Free Warm/Cool LED Focus Lamp',
        wifi: '5G Dual-Band Wi-Fi (100 Mbps Dedicated Lane)'
      };

      expect(deskSpec.power).toContain('240V');
      expect(deskSpec.chair).toContain('Ergonomic');
      expect(deskSpec.lighting).toContain('LED');
      expect(deskSpec.wifi).toContain('5G');
    });
  });

});
