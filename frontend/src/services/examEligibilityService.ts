// FOCUSPOINT Exam Eligibility Engine
// Dynamic rule resolution based on current class, target entrance class, and stream selection

import { 
  ExamEligibilityRule, 
  AcademicStream, 
  ExamAccessState, 
  StudentAcademicProfile 
} from '../types/eligibilityAndPricing';
import { GovernmentExam } from '../types/academicIntelligence';
import { INITIAL_ELIGIBILITY_RULES } from '../mock/data/eligibilityAndPricingData';
import { mockStore } from '../mock/store';

export interface EvaluatedExamItem {
  exam: GovernmentExam;
  accessState: ExamAccessState;
  matchingRule?: ExamEligibilityRule;
  displaySection: string;
  eligibilityReason: string;
  isRecommended: boolean;
  requiredStream?: AcademicStream;
  evaluation: {
    isEligible: boolean;
    reason: string;
    matchingRule?: ExamEligibilityRule;
  };
}

const STORAGE_KEY = 'focuspoint_eligibility_rules';

class ExamEligibilityService {
  private rules: ExamEligibilityRule[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    this.loadRules();
  }

  private loadRules(): void {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: ExamEligibilityRule[] = JSON.parse(saved);
        const map = new Map<string, ExamEligibilityRule>();
        INITIAL_ELIGIBILITY_RULES.forEach(r => map.set(r.id, r));
        parsed.forEach(r => {
          const init = map.get(r.id);
          map.set(r.id, init ? { ...init, ...r } : r);
        });
        this.rules = Array.from(map.values());
      } else {
        this.rules = [...INITIAL_ELIGIBILITY_RULES];
      }
    } catch {
      this.rules = [...INITIAL_ELIGIBILITY_RULES];
    }
  }

  private saveRules(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.rules));
      this.notifyListeners();
    } catch (e) {
      console.error('Failed to persist eligibility rules', e);
    }
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(cb => cb());
  }

  // Parse "Class 5", "Class 10", "12th" into number
  public parseClassNumber(gradeStr?: string): number {
    if (!gradeStr) return 10;
    const match = gradeStr.match(/\d+/);
    return match ? parseInt(match[0], 10) : 10;
  }

  // Determine section title based on academic stage
  public getTargetSectionTitle(classNum: number, stream?: AcademicStream): string {
    if (classNum === 5) return 'Class 6 Entrance Preparation';
    if (classNum === 8) return 'Class 9 Entrance Preparation';
    if (classNum === 10) {
      if (stream === 'PCM') return 'Engineering & Competitive Foundation (JEE Target)';
      if (stream === 'PCB') return 'Medical & Life Sciences Foundation (NEET Target)';
      if (stream === 'COMMERCE') return 'Commerce & Analytical Entrance Foundation';
      if (stream === 'ARTS') return 'Humanities & Olympiad Foundation';
      return 'Class 10 Board & Stream Foundation Selection';
    }
    if (classNum === 11 || classNum === 12) {
      if (stream === 'PCM') return 'Engineering Entrance Preparation (JEE Main & Advanced)';
      if (stream === 'PCB') return 'Medical Entrance Preparation (NEET UG)';
      return 'Senior Secondary Competitive Preparation';
    }
    if (classNum > 12) return 'Government & National Recruitment Preparation';
    return 'School & Foundation Exam Preparation';
  }

  // Core Evaluation Logic for a Student Profile
  public evaluateExamsForStudent(
    student: {
      studentId: string;
      currentClass: string;
      stream?: AcademicStream;
      state?: string;
    },
    activeSubscribedExamIds: string[] = []
  ): EvaluatedExamItem[] {
    const classNum = this.parseClassNumber(student.currentClass);
    const studentStream = student.stream || 'GENERAL';
    const allExams = mockStore.getGovernmentExams();

    const evaluated: EvaluatedExamItem[] = [];

    allExams.forEach(exam => {
      // Find matching rule
      const rule = this.rules.find(r => 
        r.status === 'ACTIVE' &&
        r.examId === exam.id &&
        classNum >= r.minClass &&
        classNum <= r.maxClass
      );

      const isDirectlySubscribed = activeSubscribedExamIds.includes(exam.id) || activeSubscribedExamIds.includes('ALL');

      // If no matching rule for this class
      if (!rule) {
        // Special case: Government exams can be shown for Senior / Graduate
        if (classNum >= 12 && exam.category !== 'ADMISSION_EXAMS' && exam.category !== 'OLYMPIAD') {
          const reason = 'Eligible for Class 12+ / Graduate students.';
          const state: ExamAccessState = isDirectlySubscribed ? 'AVAILABLE' : 'ELIGIBLE_SUBSCRIPTION_REQUIRED';
          evaluated.push({
            exam,
            accessState: state,
            displaySection: 'National & State Recruitment Examinations',
            eligibilityReason: reason,
            isRecommended: false,
            evaluation: {
              isEligible: true,
              reason
            }
          });
          return;
        }

        // Otherwise not eligible for this student's class
        const reason = `Designed for different class levels. Your current registered class is ${student.currentClass}.`;
        evaluated.push({
          exam,
          accessState: 'NOT_ELIGIBLE',
          displaySection: 'Other Examinations (Outside Your Current Class Level)',
          eligibilityReason: reason,
          isRecommended: false,
          evaluation: {
            isEligible: false,
            reason
          }
        });
        return;
      }

      // Stream compatibility check for Class 10, 11, 12
      let streamCompatible = true;
      let streamReason = '';

      if (rule.targetStream && rule.targetStream !== 'ANY') {
        if (studentStream !== rule.targetStream) {
          streamCompatible = false;
          streamReason = `Requires ${rule.targetStream} stream (Your current stream is ${studentStream}).`;
        }
      }

      if (!streamCompatible) {
        evaluated.push({
          exam,
          accessState: 'NOT_ELIGIBLE',
          matchingRule: rule,
          displaySection: 'Exams Outside Your Selected Stream',
          eligibilityReason: streamReason,
          isRecommended: false,
          requiredStream: rule.targetStream,
          evaluation: {
            isEligible: false,
            reason: streamReason,
            matchingRule: rule
          }
        });
        return;
      }

      // If eligible by class and stream:
      let accessState: ExamAccessState = isDirectlySubscribed 
        ? 'AVAILABLE' 
        : 'ELIGIBLE_SUBSCRIPTION_REQUIRED';

      const sectionTitle = this.getTargetSectionTitle(classNum, studentStream);
      const reason = rule.ruleNotes || rule.ineligibleReason || `Eligible for ${student.currentClass} students.`;

      evaluated.push({
        exam,
        accessState,
        matchingRule: rule,
        displaySection: sectionTitle,
        eligibilityReason: reason,
        isRecommended: true,
        requiredStream: rule.targetStream,
        evaluation: {
          isEligible: true,
          reason,
          matchingRule: rule
        }
      });
    });

    return evaluated;
  }

  // Convenience wrapper
  public getEvaluatedExamsForStudent(
    studentId: string,
    currentClass: string,
    stream?: AcademicStream,
    state?: string
  ): EvaluatedExamItem[] {
    return this.evaluateExamsForStudent({
      studentId,
      currentClass,
      stream,
      state
    });
  }

  // Super Admin CRUD API
  public getAllRules(): ExamEligibilityRule[] {
    return [...this.rules];
  }

  public getRuleById(id: string): ExamEligibilityRule | undefined {
    return this.rules.find(r => r.id === id);
  }

  public saveRule(rule: Partial<ExamEligibilityRule>): ExamEligibilityRule {
    if (rule.id) {
      const idx = this.rules.findIndex(r => r.id === rule.id);
      if (idx !== -1) {
        this.rules[idx] = {
          ...this.rules[idx],
          ...rule,
          status: rule.status || this.rules[idx].status
        };
        this.saveRules();
        return this.rules[idx];
      }
    }

    const newRule: ExamEligibilityRule = {
      id: `rule-${Date.now()}`,
      examId: rule.examId || 'exam-custom',
      examName: rule.examName || 'Configured Examination',
      category: rule.category || 'ADMISSION_EXAMS',
      minClass: rule.minClass || 5,
      maxClass: rule.maxClass || 12,
      currentClass: rule.currentClass || 10,
      targetClass: rule.targetClass,
      targetStream: rule.targetStream || 'ANY',
      eligibleSubjects: rule.eligibleSubjects || ['General'],
      status: rule.status || 'ACTIVE',
      effectiveFrom: rule.effectiveFrom || new Date().toISOString().split('T')[0],
      ruleNotes: rule.ruleNotes || 'Configured by Super Admin.'
    };

    this.rules.unshift(newRule);
    this.saveRules();
    return newRule;
  }

  public deleteRule(id: string): boolean {
    const prevLen = this.rules.length;
    this.rules = this.rules.filter(r => r.id !== id);
    if (this.rules.length !== prevLen) {
      this.saveRules();
      return true;
    }
    return false;
  }

  public resetToDefaults(): void {
    this.rules = [...INITIAL_ELIGIBILITY_RULES];
    this.saveRules();
  }
}

export const examEligibilityService = new ExamEligibilityService();
