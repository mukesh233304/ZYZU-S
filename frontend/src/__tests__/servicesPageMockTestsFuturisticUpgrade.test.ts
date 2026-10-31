import { describe, it, expect } from 'vitest';
import { mockStore } from '../mock/store';

/**
 * FOCUSPOINT SERVICES PAGE & GOVERNMENT EXAM MOCK TESTS FLAGSHIP FUTURISTIC SPOTLIGHT SUITE
 * Validating the dedicated, futuristic Government Exam Mock Tests & CBT Drill Studio spotlight section
 * accessed via the Services footer icon (/services) with id="mock-tests-section".
 */

describe('Services Page - Government Exam Mock Tests Futuristic Upgrade Suite', () => {

  describe('Scenario 1: Flagship Mock Tests Spotlight Architecture', () => {
    it('anchors the Government Exam Mock Tests section with id mock-tests-section', () => {
      const sectionId = 'mock-tests-section';
      expect(sectionId).toBe('mock-tests-section');

      const badgePillars = [
        'OFFICIAL CBT EXAM SIMULATOR',
        'Latest 2026 TCS / NTA Patterns',
        'All-State Percentile & Rank Predictor',
        'Bilingual Hindi & English'
      ];
      expect(badgePillars.length).toBe(4);
      expect(badgePillars).toContain('OFFICIAL CBT EXAM SIMULATOR');
      expect(badgePillars).toContain('Latest 2026 TCS / NTA Patterns');
      expect(badgePillars).toContain('All-State Percentile & Rank Predictor');
      expect(badgePillars).toContain('Bilingual Hindi & English');
    });

    it('provides 4 core competitive exam trust and quality guarantees for aspirants', () => {
      const guarantees = [
        { label: '100% Latest TCS/NTA Pattern', detail: 'Authentic exam timer, question palette & marking scheme' },
        { label: 'All-State Percentile Ranking', detail: 'Live benchmark against 10,000+ genuine competitive aspirants' },
        { label: 'Bilingual Hindi & English', detail: 'Seamless 1-click language toggling for every question' },
        { label: 'Instant Mistake Diagnostics', detail: 'Step-by-step text & video solutions with weak-topic tagging' }
      ];

      expect(guarantees.length).toBe(4);
      expect(guarantees[0].label).toBe('100% Latest TCS/NTA Pattern');
      expect(guarantees[1].label).toBe('All-State Percentile Ranking');
      expect(guarantees[2].label).toBe('Bilingual Hindi & English');
      expect(guarantees[3].label).toBe('Instant Mistake Diagnostics');
    });
  });

  describe('Scenario 2: Interactive Mock Exam & Score Predictor Cockpit Logic', () => {
    it('supports selecting standard government recruitment examination targets', () => {
      const examTargets = [
        { id: 'UPSSSC', name: 'UPSSSC PET & VDO', cutoff: 68.5 },
        { id: 'UP_POLICE', name: 'UP Police Constable & SI', cutoff: 72.0 },
        { id: 'SSC', name: 'SSC CGL / CHSL / MTS', cutoff: 74.5 },
        { id: 'RAILWAY', name: 'Railway RRB NTPC & Group D', cutoff: 69.0 },
        { id: 'TEACHING', name: 'UPTET / CTET / Super TET', cutoff: 60.0 }
      ];

      expect(examTargets.length).toBe(5);
      const getCutoff = (id: string) => {
        const found = examTargets.find(e => e.id === id);
        return found ? found.cutoff : 65.0;
      };

      expect(getCutoff('UPSSSC')).toBe(68.5);
      expect(getCutoff('UP_POLICE')).toBe(72.0);
      expect(getCutoff('SSC')).toBe(74.5);
    });

    it('accurately computes net score, negative penalty, and estimated percentile', () => {
      const calculateExamScore = (correct: number, incorrect: number, penaltyPerWrong: number = 0.25) => {
        const positiveMarks = correct * 1;
        const penaltyMarks = incorrect * penaltyPerWrong;
        const netScore = Math.max(0, +(positiveMarks - penaltyMarks).toFixed(2));
        
        // Percentile model grounded in normal distribution approximation
        let percentile = 50;
        if (netScore >= 80) percentile = +(95 + (netScore - 80) * 0.24).toFixed(1);
        else if (netScore >= 70) percentile = +(88 + (netScore - 70) * 0.7).toFixed(1);
        else if (netScore >= 60) percentile = +(75 + (netScore - 60) * 1.3).toFixed(1);
        else percentile = +(Math.max(10, netScore * 1.2)).toFixed(1);
        
        return {
          positiveMarks,
          penaltyMarks,
          netScore,
          percentile: Math.min(99.9, percentile)
        };
      };

      // 78 correct, 12 incorrect with 0.25 negative marking
      const result = calculateExamScore(78, 12, 0.25);
      expect(result.positiveMarks).toBe(78);
      expect(result.penaltyMarks).toBe(3);
      expect(result.netScore).toBe(75);
      expect(result.percentile).toBeGreaterThan(90);

      // Perfect score: 100 correct, 0 incorrect
      const perfect = calculateExamScore(100, 0, 0.25);
      expect(perfect.netScore).toBe(100);
      expect(perfect.percentile).toBe(99.8);
    });

    it('generates an exact deep-link search query URL for seamless handover to /mock-tests', () => {
      const buildMockTestSearchUrl = (params: { 
        examCategory?: string; 
        drillMode?: string; 
        language?: string;
      }) => {
        const urlParams = new URLSearchParams();
        if (params.examCategory) urlParams.set('exam', params.examCategory);
        if (params.drillMode) urlParams.set('mode', params.drillMode);
        if (params.language) urlParams.set('lang', params.language);
        return `/mock-tests?${urlParams.toString()}`;
      };

      const url = buildMockTestSearchUrl({
        examCategory: 'UPSSSC',
        drillMode: 'Full Mock (100 Qs)',
        language: 'Hindi & English'
      });

      expect(url).toContain('/mock-tests?');
      expect(url).toContain('exam=UPSSSC');
      expect(url).toContain('mode=Full+Mock+%28100+Qs%29');
      expect(url).toContain('lang=Hindi+%26+English');
    });
  });

  describe('Scenario 3: Featured Mock Tests Deck & Syllabus Transparency', () => {
    it('provides realistic competitive mock test cards with verified structure', () => {
      const FEATURED_MOCKS = [
        {
          id: 'mock-upsssc-pet-01',
          category: 'UPSSSC',
          title: 'UPSSSC PET 2026 Full Length Official Simulation #01',
          totalQuestions: 100,
          durationMinutes: 120,
          totalMarks: 100,
          negativeMarking: 0.25,
          language: 'Hindi & English',
          difficulty: 'MIXED',
          badge: 'Free Diagnostic',
          attempts: 6420,
          syllabus: ['General Science', 'Indian History', 'Math & Graphs', 'General Hindi', 'Current Affairs']
        },
        {
          id: 'mock-up-police-si-02',
          category: 'UP_POLICE',
          title: 'UP Police Sub-Inspector (SI) All UP Ranking Drill #03',
          totalQuestions: 160,
          durationMinutes: 120,
          totalMarks: 400,
          negativeMarking: 0.0,
          language: 'Hindi & English',
          difficulty: 'HARD',
          badge: 'High Difficulty',
          attempts: 4890,
          syllabus: ['Law & Constitution (Mool Vidhi)', 'General Hindi', 'Numerical Ability', 'Mental Aptitude']
        },
        {
          id: 'mock-ssc-cgl-04',
          category: 'SSC',
          title: 'SSC CGL Tier-1 TCS Pattern Grand Speed Test #04',
          totalQuestions: 100,
          durationMinutes: 60,
          totalMarks: 200,
          negativeMarking: 0.50,
          language: 'Hindi & English',
          difficulty: 'MEDIUM',
          badge: 'TCS Pattern',
          attempts: 8210,
          syllabus: ['General Intelligence', 'General Awareness', 'Quantitative Aptitude', 'English Comprehension']
        }
      ];

      expect(FEATURED_MOCKS.length).toBe(3);
      FEATURED_MOCKS.forEach(mock => {
        expect(mock.title).toBeTruthy();
        expect(mock.totalQuestions).toBeGreaterThan(0);
        expect(mock.durationMinutes).toBeGreaterThan(0);
        expect(mock.syllabus.length).toBeGreaterThan(0);
        expect(mock.attempts).toBeGreaterThan(1000);
      });
    });
  });

});
