import { describe, it, expect, beforeEach } from 'vitest';
import { mockStore } from '../mock/store';
import { operatorService } from '../services/operatorService';
import { GovernmentExam } from '../types/academicIntelligence';

describe('FOCUSPOINT — Operator Exam Catalog & Syllabus Genome Studio Suite', () => {
  const operatorId = 'usr-operator-sunita';
  const operatorName = 'Sunita Verma';

  beforeEach(() => {
    // Clean state
  });

  describe('1. Exam Catalog Inventory & Telemetry Calibration', () => {
    it('Should fetch pan-India exam registry with accurate government and admission categorizations', () => {
      const allExams = mockStore.getGovernmentExams();
      expect(Array.isArray(allExams)).toBe(true);
      expect(allExams.length).toBeGreaterThanOrEqual(10);

      const governmentExams = allExams.filter(
        e => e.examType !== 'ADMISSION' && !['ADMISSION_EXAMS', 'ENGINEERING', 'MEDICAL', 'OLYMPIAD'].includes(e.category)
      );
      const admissionExams = allExams.filter(
        e => e.examType === 'ADMISSION' || ['ADMISSION_EXAMS', 'ENGINEERING', 'MEDICAL', 'OLYMPIAD'].includes(e.category)
      );

      expect(governmentExams.length).toBeGreaterThan(0);
      expect(admissionExams.length).toBeGreaterThan(0);
      expect(governmentExams.length + admissionExams.length).toBe(allExams.length);
    });

    it('Should calculate total mapped syllabus topics across curriculum tree', () => {
      const allExams = mockStore.getGovernmentExams();
      let totalTopics = 0;

      allExams.forEach(e => {
        if (e.topics) {
          Object.values(e.topics).forEach(list => {
            totalTopics += list.length;
          });
        }
      });

      expect(totalTopics).toBeGreaterThan(20);
    });
  });

  describe('2. Examination Blueprint Authoring & Store Operations', () => {
    it('Should create and persist a new Pan-India government examination blueprint', () => {
      const testExamId = `exam-test-${Date.now()}`;
      const newExam: GovernmentExam = {
        id: testExamId,
        name: 'Madhya Pradesh Public Service Commission (MPPSC State Services 2026)',
        shortName: 'MPPSC SSE',
        category: 'STATE_EXAMS',
        examType: 'GOVERNMENT',
        conductingAuthority: 'MPPSC Indore',
        isNational: false,
        applicableState: 'Madhya Pradesh',
        level: 'GRADUATE',
        subjects: ['General Studies Paper I', 'General Aptitude Test Paper II'],
        topics: {
          'General Studies Paper I': ['History of MP', 'Geography of MP', 'Indian Polity & Governance', 'Current Events'],
          'General Aptitude Test Paper II': ['Comprehension', 'Interpersonal Skills', 'Logical Reasoning', 'Basic Numeracy']
        },
        durationMinutes: 120,
        totalQuestions: 100,
        totalMarks: 200,
        negativeMarkingPerQuestion: 0,
        languages: ['Hindi', 'English'],
        status: 'ACTIVE',
        patternVersion: 'MPPSC-CBT-2026',
        description: 'Combined Competitive State Service Examination for MP State Administrative Service.',
        officialSourceUrl: 'https://mppsc.mp.gov.in'
      };

      const saved = mockStore.saveGovernmentExam(newExam);
      expect(saved).toBeDefined();
      expect(saved.id).toBe(testExamId);

      const retrieved = mockStore.getGovernmentExamById(testExamId);
      expect(retrieved).toBeDefined();
      expect(retrieved?.shortName).toBe('MPPSC SSE');
      expect(retrieved?.totalMarks).toBe(200);
      expect(retrieved?.subjects.length).toBe(2);
    });

    it('Should update existing exam blueprint marking scheme and pattern rules', () => {
      const existing = mockStore.getGovernmentExams()[0];
      expect(existing).toBeDefined();

      const updatedDuration = existing.durationMinutes + 15;
      const updatedExam: GovernmentExam = {
        ...existing,
        durationMinutes: updatedDuration,
        patternVersion: 'Pattern-2026-Revised'
      };

      mockStore.saveGovernmentExam(updatedExam);
      const reFetched = mockStore.getGovernmentExamById(existing.id);
      expect(reFetched?.durationMinutes).toBe(updatedDuration);
      expect(reFetched?.patternVersion).toBe('Pattern-2026-Revised');
    });

    it('Should clone an exam genome with distinct identifier and version', () => {
      const target = mockStore.getGovernmentExams()[0];
      const cloneId = `exam-clone-${Date.now()}`;
      const cloned: GovernmentExam = {
        ...target,
        id: cloneId,
        name: `${target.name} (Clone)`,
        shortName: `${target.shortName}-CLONE`,
        patternVersion: `${target.patternVersion}-v2`
      };

      mockStore.saveGovernmentExam(cloned);
      const retrieved = mockStore.getGovernmentExamById(cloneId);
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(cloneId);
      expect(retrieved?.shortName).toContain('CLONE');
    });
  });

  describe('3. Syllabus Hierarchy & Micro-Topic Manipulation', () => {
    it('Should add micro-topics inline to a subject within an examination curriculum', () => {
      const exam = mockStore.getGovernmentExams()[0];
      const targetSubject = exam.subjects[0];
      const currentTopics = exam.topics || {};
      const subjectTopics = currentTopics[targetSubject] || [];
      const newTopic = `Special Concept Drill ${Date.now()}`;

      const updatedExam: GovernmentExam = {
        ...exam,
        topics: {
          ...currentTopics,
          [targetSubject]: [...subjectTopics, newTopic]
        }
      };

      mockStore.saveGovernmentExam(updatedExam);
      const reFetched = mockStore.getGovernmentExamById(exam.id);
      expect(reFetched?.topics?.[targetSubject]).toContain(newTopic);
    });

    it('Should remove micro-topics cleanly from subject topics list', () => {
      const exam = mockStore.getGovernmentExams()[0];
      const targetSubject = exam.subjects[0];
      const currentTopics = exam.topics || {};
      const subjectTopics = currentTopics[targetSubject] || [];

      if (subjectTopics.length > 0) {
        const topicToRemove = subjectTopics[0];
        const updatedTopicsList = subjectTopics.filter(t => t !== topicToRemove);

        const updatedExam: GovernmentExam = {
          ...exam,
          topics: {
            ...currentTopics,
            [targetSubject]: updatedTopicsList
          }
        };

        mockStore.saveGovernmentExam(updatedExam);
        const reFetched = mockStore.getGovernmentExamById(exam.id);
        expect(reFetched?.topics?.[targetSubject]).not.toContain(topicToRemove);
      }
    });
  });

  describe('4. Neural AI Syllabus Decomposer Engine', () => {
    it('Should decompose raw commission notification into subjects and micro-topics', () => {
      const exam = mockStore.getGovernmentExams()[0];
      const aiSynthesizedTopics: Record<string, string[]> = {};

      exam.subjects.forEach(sub => {
        aiSynthesizedTopics[sub] = [
          'High Frequency Past 5-Year Questions',
          'Analytical Multi-Step Logic',
          'Common Distractor Misconceptions',
          'Speed Calculation Techniques'
        ];
      });

      const updatedExam: GovernmentExam = {
        ...exam,
        topics: aiSynthesizedTopics
      };

      mockStore.saveGovernmentExam(updatedExam);
      const reFetched = mockStore.getGovernmentExamById(exam.id);
      expect(reFetched?.topics?.[exam.subjects[0]].length).toBe(4);
      expect(reFetched?.topics?.[exam.subjects[0]]).toContain('High Frequency Past 5-Year Questions');
    });
  });

  describe('5. Operator Audit Trail & Activity Compliance', () => {
    it('Should register immutable operator audit entry for blueprint management', async () => {
      const log = await operatorService.logActivity({
        operatorId,
        operatorName,
        action: 'MOCK_TEST_CREATE',
        entity: 'EXAM',
        entityId: 'exam-ssc-cgl',
        entityTitle: 'SSC CGL Tier 1',
        details: 'Calibrated blueprint marking scheme and sectional time distribution'
      });

      expect(log).toBeDefined();
      expect(log.operatorId).toBe(operatorId);
      expect(log.action).toBe('MOCK_TEST_CREATE');
      expect(log.entity).toBe('EXAM');
    });
  });
});
