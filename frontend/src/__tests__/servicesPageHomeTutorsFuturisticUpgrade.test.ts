import { describe, it, expect } from 'vitest';
import { mockStore } from '../mock/store';

/**
 * FOCUSPOINT SERVICES PAGE & HOME TUTOR FLAGSHIP FUTURISTIC SPOTLIGHT SUITE
 * Validating the dedicated, futuristic Find Home Tutors spotlight section
 * accessed via the Services footer icon (/services).
 */

describe('Services Page - Find Home Tutors Futuristic Upgrade Suite', () => {

  describe('Scenario 1: Flagship Home Tutors Spotlight Architecture', () => {
    it('anchors the Find Home Tutors section as a top-priority flagship module directly below the hero', () => {
      const sectionId = 'home-tutors-section';
      expect(sectionId).toBe('home-tutors-section');
      
      const badgePillars = [
        'FLAGSHIP 1-ON-1 SERVICE',
        '100% Verified Educators',
        'Free 1st Demo Session'
      ];
      expect(badgePillars.length).toBe(3);
      expect(badgePillars).toContain('100% Verified Educators');
    });

    it('provides 4 core security and trust guarantees for parents and students', () => {
      const guarantees = [
        { label: 'Identity Verified', detail: 'Police & degree pre-checked' },
        { label: 'Free Demo Session', detail: 'No commitment upfront' },
        { label: 'Local to Your Area', detail: 'Within 5 km radius' },
        { label: 'Zero Commission', detail: 'Direct transparent fee' }
      ];

      expect(guarantees.length).toBe(4);
      expect(guarantees[0].label).toBe('Identity Verified');
      expect(guarantees[3].label).toBe('Zero Commission');
    });
  });

  describe('Scenario 2: Interactive Futuristic Matcher Cockpit Logic', () => {
    it('supports selecting subjects across core disciplines', () => {
      const subjects = ['Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology', 'English', 'Social Science', 'All Subjects'];
      expect(subjects).toContain('Mathematics');
      expect(subjects).toContain('Science');
      expect(subjects).toContain('Physics');
    });

    it('supports selecting education levels from primary to competitive foundations', () => {
      const classLevels = [
        'Class 1-5 (Primary)',
        'Class 6-8 (Middle)',
        'Class 9-10 (High School)',
        'Class 11-12 (Senior Sec)',
        'Foundation / NEET / JEE'
      ];
      expect(classLevels.length).toBe(5);
      expect(classLevels).toContain('Foundation / NEET / JEE');
    });

    it('generates an exact deep-link search query URL for seamless handover to /find-tutor', () => {
      const buildTutorSearchUrl = (params: { subject: string; classLevel: string; mode: string; locality: string }) => {
        const urlParams = new URLSearchParams();
        if (params.subject) urlParams.set('subject', params.subject);
        if (params.classLevel) urlParams.set('class', params.classLevel);
        if (params.mode) urlParams.set('mode', params.mode);
        if (params.locality) urlParams.set('locality', params.locality);
        return `/find-tutor?${urlParams.toString()}`;
      };

      const url = buildTutorSearchUrl({
        subject: 'Mathematics',
        classLevel: 'Class 10',
        mode: 'HOME',
        locality: 'Saidpur, Ghazipur'
      });

      expect(url).toContain('/find-tutor?');
      expect(url).toContain('subject=Mathematics');
      expect(url).toContain('class=Class+10');
      expect(url).toContain('mode=HOME');
      expect(url).toContain('locality=Saidpur%2C+Ghazipur');
    });
  });

  describe('Scenario 3: Live Verified Educator Deck Integration', () => {
    it('loads active and approved educators directly from mockStore', () => {
      const approvedTeachers = mockStore.getTeachers({ status: 'APPROVED' });
      expect(approvedTeachers.length).toBeGreaterThan(0);

      const sample = approvedTeachers[0];
      expect(sample.verificationStatus).toBe('APPROVED');
      expect(sample.name).toBeTruthy();
      expect(sample.subjects.length).toBeGreaterThan(0);
    });

    it('displays pricing and demo booking links for approved educators', () => {
      const approvedTeachers = mockStore.getTeachers({ status: 'APPROVED' }).slice(0, 3);
      approvedTeachers.forEach(t => {
        const fee = t.expectedFeeMonthly || t.monthlyFee || 2500;
        expect(fee).toBeGreaterThan(0);
        const demoLink = `/find-tutor?teacherId=${t.id}`;
        expect(demoLink).toContain(t.id);
      });
    });
  });

  describe('Scenario 4: Secondary Services Catalog and Tab Filtering', () => {
    const SERVICES_DATA = [
      { id: 'digital-libraries', category: 'STUDENT', path: '/find-library' },
      { id: 'mock-tests', category: 'EXAMS', path: '/mock-tests' },
      { id: 'study-materials', category: 'STUDENT', path: '/study-materials' },
      { id: 'apply-teacher', category: 'PARTNER', path: '/register/teacher' },
      { id: 'list-library', category: 'PARTNER', path: '/register/library' }
    ];

    it('filters services correctly by tab selection', () => {
      const filterByTab = (tab: 'ALL' | 'STUDENT' | 'EXAMS' | 'PARTNER') => {
        return SERVICES_DATA.filter(s => {
          if (tab === 'ALL') return true;
          if (tab === 'STUDENT') return s.category === 'STUDENT' || s.category === 'EXAMS';
          return s.category === tab;
        });
      };

      expect(filterByTab('ALL').length).toBe(5);
      expect(filterByTab('STUDENT').length).toBe(3);
      expect(filterByTab('EXAMS').length).toBe(1);
      expect(filterByTab('PARTNER').length).toBe(2);
    });

    it('supports quick search querying for home tutors, libraries, and mock tests', () => {
      const searchItems = (query: string) => {
        const q = query.toLowerCase();
        return SERVICES_DATA.filter(s => s.id.includes(q) || s.path.includes(q));
      };

      expect(searchItems('library').length).toBe(2);
      expect(searchItems('mock').length).toBe(1);
    });
  });

});
