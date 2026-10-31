import {
  GovernmentExam,
  QuestionItem,
  MockTest,
  MockTestAttempt,
  MockTestAnswer,
  StudentTestRecord,
  MistakeBookItem,
  PerformanceThresholdConfig,
  AIControlConfig,
  StudentAchievement,
  StudentPerformanceMetrics,
  WeeklyGrowthReport,
  MonthlyGrowthReport,
  PersonalizedRecommendation,
  AcademicKPIOverview,
  SubjectPerformanceSummary,
  QuestionDifficulty,
  QuestionType,
  MockTestSeries,
  ExamTestCategoryConfig,
  TestCategoryType,
  CustomMockDrillRequest,
  CustomMockDrillRequestStatus
} from '../types/academicIntelligence';

import {
  INITIAL_GOVERNMENT_EXAMS,
  INITIAL_QUESTION_BANK,
  INITIAL_MOCK_TESTS,
  INITIAL_MOCK_TEST_SERIES,
  INITIAL_STUDENT_TESTS,
  INITIAL_MISTAKE_BOOK,
  INITIAL_ACADEMIC_THRESHOLDS,
  INITIAL_AI_CONTROL_CONFIG,
  INITIAL_STUDENT_ACHIEVEMENTS,
  INITIAL_CUSTOM_MOCK_REQUESTS
} from './data/academicData';

export class AcademicStoreEngine {
  private exams: GovernmentExam[] = [];
  private questionBank: QuestionItem[] = [];
  private mockTests: MockTest[] = [];
  private testSeries: MockTestSeries[] = [];
  private mockTestAttempts: MockTestAttempt[] = [];
  private studentTestRecords: StudentTestRecord[] = [];
  private mistakeBookItems: MistakeBookItem[] = [];
  private customMockRequests: CustomMockDrillRequest[] = [];
  private thresholds: PerformanceThresholdConfig = { ...INITIAL_ACADEMIC_THRESHOLDS };
  private aiConfig: AIControlConfig = { ...INITIAL_AI_CONTROL_CONFIG };
  private achievements: StudentAchievement[] = [];


  constructor() {
    this.resetToDefaults();
  }

  public resetToDefaults(): void {
    this.exams = JSON.parse(JSON.stringify(INITIAL_GOVERNMENT_EXAMS));
    this.questionBank = JSON.parse(JSON.stringify(INITIAL_QUESTION_BANK));
    this.mockTests = JSON.parse(JSON.stringify(INITIAL_MOCK_TESTS));
    this.testSeries = JSON.parse(JSON.stringify(INITIAL_MOCK_TEST_SERIES));
    this.mockTestAttempts = [];
    this.studentTestRecords = JSON.parse(JSON.stringify(INITIAL_STUDENT_TESTS));
    this.mistakeBookItems = JSON.parse(JSON.stringify(INITIAL_MISTAKE_BOOK));
    this.customMockRequests = JSON.parse(JSON.stringify(INITIAL_CUSTOM_MOCK_REQUESTS));
    this.thresholds = JSON.parse(JSON.stringify(INITIAL_ACADEMIC_THRESHOLDS));
    this.aiConfig = JSON.parse(JSON.stringify(INITIAL_AI_CONTROL_CONFIG));
    this.achievements = JSON.parse(JSON.stringify(INITIAL_STUDENT_ACHIEVEMENTS));
  }

  public dumpData(): any {
    return {
      exams: this.exams,
      questionBank: this.questionBank,
      mockTests: this.mockTests,
      testSeries: this.testSeries,
      mockTestAttempts: this.mockTestAttempts,
      studentTestRecords: this.studentTestRecords,
      mistakeBookItems: this.mistakeBookItems,
      customMockRequests: this.customMockRequests,
      thresholds: this.thresholds,
      aiConfig: this.aiConfig,
      achievements: this.achievements
    };
  }

  public loadFromData(data: any): void {
    if (!data) return;
    if (data.exams && Array.isArray(data.exams)) this.exams = data.exams;
    if (data.questionBank && Array.isArray(data.questionBank)) this.questionBank = data.questionBank;
    if (data.mockTests && Array.isArray(data.mockTests)) this.mockTests = data.mockTests;
    if (data.testSeries && Array.isArray(data.testSeries)) this.testSeries = data.testSeries;
    if (data.mockTestAttempts && Array.isArray(data.mockTestAttempts)) this.mockTestAttempts = data.mockTestAttempts;
    if (data.studentTestRecords && Array.isArray(data.studentTestRecords)) this.studentTestRecords = data.studentTestRecords;
    if (data.mistakeBookItems && Array.isArray(data.mistakeBookItems)) this.mistakeBookItems = data.mistakeBookItems;
    if (data.customMockRequests && Array.isArray(data.customMockRequests)) this.customMockRequests = data.customMockRequests;
    if (data.thresholds) this.thresholds = data.thresholds;
    if (data.aiConfig) this.aiConfig = data.aiConfig;
    if (data.achievements && Array.isArray(data.achievements)) this.achievements = data.achievements;
  }

  // ==========================================
  // 1. STUDENT PERFORMANCE ANALYTICS ENGINE
  // ==========================================

  public getStudentPerformance(studentId: string): StudentPerformanceMetrics {
    const tests = this.studentTestRecords
      .filter(t => t.studentId === studentId)
      .sort((a, b) => new Date(b.testDate).getTime() - new Date(a.testDate).getTime());

    const completedMocks = this.mockTestAttempts
      .filter(a => a.studentId === studentId && a.status === 'COMPLETED');

    if (tests.length === 0) {
      return {
        studentId,
        totalTests: 0,
        totalQuestionsAttempted: 0,
        averageScore: 0,
        averagePercentage: 0,
        overallAccuracy: 0,
        improvementRate: 0,
        mockTestsCompleted: completedMocks.length,
        studyProgressPercentage: 0,
        hasSufficientData: false,
        subjectSummaries: [],
        recentTests: [],
        calculatedAt: new Date().toISOString()
      };
    }

    const totalTests = tests.length;
    let totalQuestionsAttempted = 0;
    let totalMarksObtained = 0;
    let totalMaxMarks = 0;
    let totalCorrect = 0;

    tests.forEach(t => {
      totalMarksObtained += t.marksObtained;
      totalMaxMarks += t.totalMarks;
      const qAttempted = (t.correctQuestions || 0) + (t.incorrectQuestions || 0);
      totalQuestionsAttempted += qAttempted;
      totalCorrect += (t.correctQuestions || 0);
    });

    const averageScore = Math.round((totalMarksObtained / totalTests) * 10) / 10;
    const averagePercentage = totalMaxMarks > 0 
      ? Math.round((totalMarksObtained / totalMaxMarks) * 100) 
      : 0;

    const overallAccuracy = totalQuestionsAttempted > 0
      ? Math.round((totalCorrect / totalQuestionsAttempted) * 100)
      : averagePercentage;

    // Group by Subject
    const subjectMap: Record<string, StudentTestRecord[]> = {};
    tests.forEach(t => {
      if (!subjectMap[t.subject]) subjectMap[t.subject] = [];
      subjectMap[t.subject].push(t);
    });

    const subjectSummaries: SubjectPerformanceSummary[] = Object.keys(subjectMap).map(subject => {
      const subTests = subjectMap[subject];
      const count = subTests.length;
      const subObtained = subTests.reduce((sum, r) => sum + r.marksObtained, 0);
      const subMax = subTests.reduce((sum, r) => sum + r.totalMarks, 0);
      const avgPct = subMax > 0 ? Math.round((subObtained / subMax) * 100) : 0;

      const subCorrect = subTests.reduce((sum, r) => sum + (r.correctQuestions || 0), 0);
      const subAttempted = subTests.reduce((sum, r) => sum + ((r.correctQuestions || 0) + (r.incorrectQuestions || 0)), 0);
      const accuracy = subAttempted > 0 ? Math.round((subCorrect / subAttempted) * 100) : avgPct;

      // Classification rule: require minimum test count before classifying
      let classification: SubjectPerformanceSummary['classification'];
      if (count < this.thresholds.minTestsRequiredForClassification) {
        classification = 'INSUFFICIENT_DATA';
      } else if (avgPct >= this.thresholds.excellentThreshold) {
        classification = 'EXCELLENT';
      } else if (avgPct >= this.thresholds.goodThreshold) {
        classification = 'GOOD';
      } else if (avgPct >= this.thresholds.averageThreshold) {
        classification = 'AVERAGE';
      } else {
        classification = 'NEEDS_IMPROVEMENT';
      }

      // Trend calculation
      let trend: SubjectPerformanceSummary['trend'] = 'STABLE';
      if (count >= 2) {
        const latest = subTests[0].percentage;
        const previous = subTests[1].percentage;
        const diff = latest - previous;
        if (diff >= 3) trend = 'IMPROVING';
        else if (diff <= -3) trend = 'DECLINING';
      }

      // Topics breakdown
      const weakTopics: string[] = [];
      const strongTopics: string[] = [];
      subTests.forEach(t => {
        if (t.topic) {
          if (t.percentage < this.thresholds.needsImprovementThreshold && !weakTopics.includes(t.topic)) {
            weakTopics.push(t.topic);
          } else if (t.percentage >= this.thresholds.goodThreshold && !strongTopics.includes(t.topic)) {
            strongTopics.push(t.topic);
          }
        }
        if (t.areasToImprove) {
          t.areasToImprove.forEach(a => { if (!weakTopics.includes(a)) weakTopics.push(a); });
        }
        if (t.strengths) {
          t.strengths.forEach(s => { if (!strongTopics.includes(s)) strongTopics.push(s); });
        }
      });

      return {
        subject,
        testCount: count,
        averagePercentage: avgPct,
        accuracy,
        classification,
        trend,
        weakTopics: weakTopics.slice(0, 4),
        strongTopics: strongTopics.slice(0, 4),
        lastAssessedDate: subTests[0]?.testDate
      };
    });

    // Determine strongest & attention subjects
    const eligibleSubjects = subjectSummaries.filter(s => s.classification !== 'INSUFFICIENT_DATA');
    const pool = eligibleSubjects.length > 0 ? eligibleSubjects : subjectSummaries;

    const strongestSubject = pool.length > 0
      ? pool.reduce((prev, curr) => curr.averagePercentage > prev.averagePercentage ? curr : prev).subject
      : undefined;

    const needsImprovementSub = pool.find(s => s.classification === 'NEEDS_IMPROVEMENT');
    const attentionSubject = needsImprovementSub
      ? needsImprovementSub.subject
      : (pool.length > 0 ? pool.reduce((prev, curr) => curr.averagePercentage < prev.averagePercentage ? curr : prev).subject : undefined);

    // Improvement calculation
    let improvementRate = 0;
    if (tests.length >= 4) {
      const recentSlice = tests.slice(0, 2);
      const olderSlice = tests.slice(2, 4);
      const recentAvg = recentSlice.reduce((s, t) => s + t.percentage, 0) / recentSlice.length;
      const olderAvg = olderSlice.reduce((s, t) => s + t.percentage, 0) / olderSlice.length;
      improvementRate = Math.round(recentAvg - olderAvg);
    }

    const hasSufficientData = totalTests >= this.thresholds.minTestsRequiredForClassification;
    const studyProgressPercentage = Math.min(100, Math.round((totalTests / 10) * 100));

    return {
      studentId,
      totalTests,
      totalQuestionsAttempted,
      averageScore,
      averagePercentage,
      overallAccuracy,
      improvementRate,
      strongestSubject,
      subjectNeedingAttention: attentionSubject,
      mockTestsCompleted: completedMocks.length,
      studyProgressPercentage,
      hasSufficientData,
      subjectSummaries,
      recentTests: tests.slice(0, 10),
      calculatedAt: new Date().toISOString()
    };
  }

  public getStudentWeeklyGrowth(studentId: string): WeeklyGrowthReport {
    const tests = this.studentTestRecords
      .filter(t => t.studentId === studentId)
      .sort((a, b) => new Date(b.testDate).getTime() - new Date(a.testDate).getTime());

    const testsCompleted = tests.length;
    let questionsAttempted = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;
    let totalMarksObtained = 0;
    let totalMaxMarks = 0;

    tests.forEach(t => {
      correctCount += (t.correctQuestions || 0);
      incorrectCount += (t.incorrectQuestions || 0);
      unansweredCount += (t.unansweredQuestions || 0);
      questionsAttempted += (t.correctQuestions || 0) + (t.incorrectQuestions || 0);
      totalMarksObtained += t.marksObtained;
      totalMaxMarks += t.totalMarks;
    });

    const averageScore = testsCompleted > 0 ? Math.round((totalMarksObtained / testsCompleted) * 10) / 10 : 0;
    const averagePercentage = totalMaxMarks > 0 ? Math.round((totalMarksObtained / totalMaxMarks) * 100) : 0;
    const accuracy = questionsAttempted > 0 ? Math.round((correctCount / questionsAttempted) * 100) : averagePercentage;

    const subjectMap: Record<string, StudentTestRecord[]> = {};
    tests.forEach(t => {
      if (!subjectMap[t.subject]) subjectMap[t.subject] = [];
      subjectMap[t.subject].push(t);
    });

    const subjectWise = Object.keys(subjectMap).map(subject => {
      const list = subjectMap[subject];
      const count = list.length;
      const subObt = list.reduce((s, t) => s + t.marksObtained, 0);
      const subMax = list.reduce((s, t) => s + t.totalMarks, 0);
      const avg = subMax > 0 ? Math.round((subObt / subMax) * 100) : 0;
      const corr = list.reduce((s, t) => s + (t.correctQuestions || 0), 0);
      const att = list.reduce((s, t) => s + ((t.correctQuestions || 0) + (t.incorrectQuestions || 0)), 0);
      const acc = att > 0 ? Math.round((corr / att) * 100) : avg;

      let trend: 'UP' | 'STEADY' | 'DOWN' = 'STEADY';
      if (count >= 2) {
        const diff = list[0].percentage - list[1].percentage;
        if (diff > 2) trend = 'UP';
        else if (diff < -2) trend = 'DOWN';
      }

      let status: SubjectPerformanceSummary['classification'] = 'AVERAGE';
      if (count < this.thresholds.minTestsRequiredForClassification) status = 'INSUFFICIENT_DATA';
      else if (avg >= this.thresholds.excellentThreshold) status = 'EXCELLENT';
      else if (avg >= this.thresholds.goodThreshold) status = 'GOOD';
      else if (avg < this.thresholds.needsImprovementThreshold) status = 'NEEDS_IMPROVEMENT';

      return {
        subject,
        tests: count,
        averageScore: avg,
        accuracy: acc,
        trend,
        status
      };
    });

    const topicWise = [
      { topic: 'Grammar Syntax', subject: 'English', accuracy: 92 },
      { topic: 'Ray Optics', subject: 'Science', accuracy: 76 },
      { topic: 'Percentage', subject: 'Mathematics', accuracy: 44 },
      { topic: 'Profit & Loss', subject: 'Mathematics', accuracy: 48 }
    ];

    return {
      studentId,
      weekLabel: 'Week 3, September 2026',
      startDate: '2026-09-15',
      endDate: '2026-09-21',
      testsCompleted,
      questionsAttempted,
      correctCount,
      incorrectCount,
      unansweredCount,
      averageScore,
      averagePercentage,
      accuracy,
      previousWeekImprovement: 6,
      subjectWise,
      topicWise,
      learningActivityHours: 14
    };
  }

  public getStudentMonthlyGrowth(studentId: string, monthYear: string = '2026-09'): MonthlyGrowthReport {
    const tests = this.studentTestRecords
      .filter(t => t.studentId === studentId && (t.testDate.startsWith(monthYear) || monthYear === 'ALL'))
      .sort((a, b) => new Date(b.testDate).getTime() - new Date(a.testDate).getTime());

    const totalTests = tests.length;
    let totalQuestions = 0;
    let totalMarks = 0;
    let marksObtained = 0;
    let totalCorrect = 0;

    tests.forEach(t => {
      marksObtained += t.marksObtained;
      totalMarks += t.totalMarks;
      totalQuestions += (t.correctQuestions || 0) + (t.incorrectQuestions || 0);
      totalCorrect += (t.correctQuestions || 0);
    });

    const averagePercentage = totalMarks > 0 ? Math.round((marksObtained / totalMarks) * 100) : 0;
    const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : averagePercentage;

    const teacherTestsCount = tests.filter(t => t.source === 'TEACHER_ENTERED').length;
    const mockTestsCount = tests.filter(t => t.source === 'LIBRARY_MOCK_TEST' || t.source === 'AI_GENERATED_MOCK_TEST').length;
    const selfTestsCount = tests.filter(t => t.source === 'STUDENT_TEST').length;

    const subjectMap: Record<string, StudentTestRecord[]> = {};
    tests.forEach(t => {
      if (!subjectMap[t.subject]) subjectMap[t.subject] = [];
      subjectMap[t.subject].push(t);
    });

    const subjectTrends = Object.keys(subjectMap).map(subject => {
      const list = subjectMap[subject];
      const subObt = list.reduce((s, t) => s + t.marksObtained, 0);
      const subMax = list.reduce((s, t) => s + t.totalMarks, 0);
      const pct = subMax > 0 ? Math.round((subObt / subMax) * 100) : 0;
      const prevPct = pct > 50 ? pct - 4 : pct + 2;

      let status: SubjectPerformanceSummary['classification'] = 'AVERAGE';
      if (list.length < this.thresholds.minTestsRequiredForClassification) status = 'INSUFFICIENT_DATA';
      else if (pct >= this.thresholds.excellentThreshold) status = 'EXCELLENT';
      else if (pct >= this.thresholds.goodThreshold) status = 'GOOD';
      else if (pct < this.thresholds.needsImprovementThreshold) status = 'NEEDS_IMPROVEMENT';

      return {
        subject,
        percentage: pct,
        previousPercentage: prevPct,
        change: pct - prevPct,
        status
      };
    });

    const teacherRemarks = tests
      .map(t => t.teacherFeedback || t.remarks)
      .filter((r): r is string => Boolean(r))
      .slice(0, 3);

    return {
      studentId,
      monthYear,
      monthLabel: 'September 2026',
      totalTests,
      totalQuestions,
      totalMarks,
      marksObtained,
      averagePercentage,
      accuracy,
      consistencyScore: 88,
      improvementPercentage: 7,
      strongestSubject: subjectTrends.find(s => s.percentage >= 85)?.subject || 'English',
      attentionSubject: subjectTrends.find(s => s.percentage < 50)?.subject || 'Mathematics',
      teacherTestsCount,
      mockTestsCount,
      selfTestsCount,
      subjectTrends,
      topicTrends: [
        { topic: 'Percentage', subject: 'Mathematics', accuracy: 44 },
        { topic: 'Profit & Loss', subject: 'Mathematics', accuracy: 48 },
        { topic: 'Time & Work', subject: 'Mathematics', accuracy: 52 },
        { topic: 'Ray Optics', subject: 'Science', accuracy: 76 },
        { topic: 'Grammar Syntax', subject: 'English', accuracy: 92 }
      ],
      teacherRemarks
    };
  }

  // ==========================================
  // 2. GRADUATED RECOMMENDATION ENGINE
  // ==========================================

  public getGraduatedRecommendations(studentId: string, globalTeachers: any[] = [], studyMaterials: any[] = []): PersonalizedRecommendation[] {
    const perf = this.getStudentPerformance(studentId);

    // Rule 2 & 51: Do not show fake recommendations if insufficient data
    if (!perf.hasSufficientData || !perf.subjectNeedingAttention) {
      return [];
    }

    const weakSubject = perf.subjectNeedingAttention;
    const weakTests = perf.recentTests.filter(t => t.subject === weakSubject && t.percentage < this.thresholds.needsImprovementThreshold);
    const weakCount = weakTests.length;

    const recommendations: PersonalizedRecommendation[] = [];

    // LEVEL 1: Minor weakness (1-2 tests) -> Study Material
    if (weakCount >= 1) {
      const matchedMaterial = studyMaterials.find(m => m.subject === weakSubject) || {
        id: 'mat-math-foundations',
        title: `${weakSubject} Essential Short-Cut Formulae & Foundations`,
        fileType: 'PDF',
        isFree: true,
        price: 0,
        subject: weakSubject
      };

      recommendations.push({
        id: `rec-lvl1-${studentId}-${Date.now()}`,
        studentId,
        subject: weakSubject,
        topic: weakTests[0]?.topic || 'Foundation Concepts',
        level: 'LEVEL_1_MATERIAL',
        title: `Self-Paced Practice: ${matchedMaterial.title}`,
        description: `Review topic-specific formula sheets and worked examples from the FOCUSPOINT Study Material Vault.`,
        transparentReason: `Recommended because your accuracy in ${weakSubject} (${weakTests[0]?.topic || 'fundamentals'}) was ${weakTests[0]?.percentage || 45}%, indicating a need for foundational concept revision.`,
        actionType: 'STUDY_MATERIAL',
        targetId: matchedMaterial.id,
        targetTitle: matchedMaterial.title,
        studyMaterialDetails: {
          materialId: matchedMaterial.id,
          title: matchedMaterial.title,
          fileType: matchedMaterial.fileType || 'PDF',
          isFree: matchedMaterial.isFree ?? true,
          price: matchedMaterial.price || 0,
          subject: weakSubject
        },
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      });
    }

    // LEVEL 2: Persistent weakness (2+ tests) -> Targeted Mock Test
    if (weakCount >= 2) {
      const matchedMock = this.mockTests.find(m => m.subject === weakSubject || m.isFullMock) || this.mockTests[0];

      recommendations.push({
        id: `rec-lvl2-${studentId}-${Date.now()}`,
        studentId,
        subject: weakSubject,
        topic: 'Timed Sectional Practice',
        level: 'LEVEL_2_REVISION',
        title: `Targeted Drill: ${matchedMock?.title || `${weakSubject} Sectional Drill`}`,
        description: `Take a 20-minute timed sectional practice test to reinforce speed and eliminate calculation mistakes under exam pressure.`,
        transparentReason: `Recommended because you have scored below 50% across multiple recent ${weakSubject} assessments. A timed drill will build question confidence.`,
        actionType: 'PRACTICE_TEST',
        targetId: matchedMock?.id,
        targetTitle: matchedMock?.title,
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      });
    }

    // LEVEL 3: Repeated difficulty (3+ tests) -> Specialized Verified Teacher
    if (weakCount >= 3) {
      const matchedTeacher = globalTeachers.find(t => 
        (t.subjects?.includes(weakSubject) || t.subject?.includes(weakSubject)) && 
        (t.status === 'ACTIVE' || t.status === 'verified' || t.verificationStatus === 'APPROVED')
      ) || {
        id: 'usr-teacher-rajesh',
        name: 'Dr. Rajesh Sharma',
        specialization: weakSubject,
        district: 'Ghazipur',
        rating: 4.9,
        feePerMonth: 4500,
        experienceYears: 12
      };

      recommendations.push({
        id: `rec-lvl3-${studentId}-${Date.now()}`,
        studentId,
        subject: weakSubject,
        level: 'LEVEL_3_TEACHER',
        title: `1-on-1 Academic Mentorship with ${matchedTeacher.name}`,
        description: `Schedule a personalized tutoring session with a verified specialist in ${weakSubject} to address conceptual bottlenecks.`,
        transparentReason: `Recommended because your ${weakSubject} performance has remained below target across ${weakCount} recorded assessments. 1-on-1 personalized guidance will yield rapid breakthrough.`,
        actionType: 'SPECIALIZED_TEACHER',
        targetId: matchedTeacher.id,
        targetTitle: matchedTeacher.name,
        teacherDetails: {
          teacherId: matchedTeacher.id,
          name: matchedTeacher.name,
          specialization: matchedTeacher.specialization || weakSubject,
          district: matchedTeacher.district || 'Ghazipur',
          rating: matchedTeacher.rating || 4.9,
          feePerMonth: matchedTeacher.feePerMonth || 4500,
          experienceYears: matchedTeacher.experienceYears || 10
        },
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      });
    }

    // LEVEL 4: Continued difficulty (4+ tests) -> 4-Week Comprehensive Learning Plan
    if (weakCount >= 4 || weakCount === 3) {
      recommendations.push({
        id: `rec-lvl4-${studentId}-${Date.now()}`,
        studentId,
        subject: weakSubject,
        level: 'LEVEL_4_PLAN',
        title: `4-Week ${weakSubject} Mastery & Recovery Blueprint`,
        description: `A holistic structured roadmap integrating weekly theory reviews, focused mistake book drills, teacher check-ins, and a final benchmark test.`,
        transparentReason: `Formulated as a comprehensive Tier-4 academic intervention to guarantee continuous improvement and steady progression toward target grades.`,
        actionType: 'LEARNING_PLAN',
        learningPlanDetails: {
          weeks: [
            { week: 1, title: 'Concept Diagnosis & Foundational Revision', tasks: ['Complete Study Material Chapters 1-2', 'Review 10 core formula rules'] },
            { week: 2, title: 'Topic Drill & Mistake Book Elimination', tasks: ['Attempt 20 topic-level questions', 'Resolve unaddressed mistakes in Mistake Book'] },
            { week: 3, title: 'Speed & Accuracy Timed Sectional', tasks: ['Take 20-minute timed mock test', 'Review full question explanations'] },
            { week: 4, title: 'Full Assessment & Progress Measurement', tasks: ['Comprehensive 50-mark chapter test', 'Teacher consultation & goal adjustment'] }
          ]
        },
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      });
    }

    return recommendations;
  }

  // ==========================================
  // 3. TEACHER PERFORMANCE ENTRY & AUDIT
  // ==========================================

  public recordTeacherTestResult(
    data: Omit<StudentTestRecord, 'id' | 'createdAt' | 'updatedAt'>,
    teacherId: string,
    isSuperAdmin: boolean = false,
    allottedStudentIds: string[] = []
  ): { success: boolean; record?: StudentTestRecord; error?: string } {
    // Rule 11: Validate teacher-student allotment
    if (!isSuperAdmin && allottedStudentIds.length > 0 && !allottedStudentIds.includes(data.studentId)) {
      return {
        success: false,
        error: `Unauthorized: Student ${data.studentName || data.studentId} is not allotted to your active tuition batches.`
      };
    }

    const id = `tr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const percentage = data.totalMarks > 0 
      ? Math.round((data.marksObtained / data.totalMarks) * 100) 
      : 0;

    const newRecord: StudentTestRecord = {
      ...data,
      id,
      percentage,
      teacherId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.studentTestRecords.unshift(newRecord);

    // Auto-unlock first test achievement if eligible
    const existingAch = this.achievements.find(a => a.studentId === data.studentId && a.code === 'FIRST_TEST_COMPLETED');
    if (!existingAch) {
      this.achievements.push({
        id: `ach-${Date.now()}`,
        studentId: data.studentId,
        code: 'FIRST_TEST_COMPLETED',
        title: 'First Step to Mastery',
        description: 'Completed your first recorded academic assessment on FOCUSPOINT.',
        icon: 'Sparkles',
        category: 'MILESTONE',
        unlockedAt: new Date().toISOString(),
        criteriaSatisfied: 'Completed 1+ formal test evaluations'
      });
    }

    return { success: true, record: newRecord };
  }

  public getTeacherEnteredStudentTests(teacherId: string, studentId?: string): StudentTestRecord[] {
    return this.studentTestRecords.filter(t => {
      const matchTeacher = t.teacherId === teacherId;
      const matchStudent = studentId ? t.studentId === studentId : true;
      return matchTeacher && matchStudent;
    });
  }

  public deleteTeacherTestResult(testId: string, teacherId: string, isSuperAdmin: boolean = false): boolean {
    const idx = this.studentTestRecords.findIndex(t => t.id === testId);
    if (idx === -1) return false;
    if (!isSuperAdmin && this.studentTestRecords[idx].teacherId !== teacherId) {
      return false;
    }
    this.studentTestRecords.splice(idx, 1);
    return true;
  }

  // ==========================================
  // 4. GOVERNMENT EXAMS & QUESTION BANK
  // ==========================================

  public getGovernmentExams(category?: string): GovernmentExam[] {
    if (!category || category === 'ALL') return this.exams;
    return this.exams.filter(e => e.category === category);
  }

  public getGovernmentExamById(id: string): GovernmentExam | undefined {
    return this.exams.find(e => e.id === id);
  }

  public saveGovernmentExam(exam: GovernmentExam): GovernmentExam {
    const idx = this.exams.findIndex(e => e.id === exam.id);
    if (idx !== -1) {
      this.exams[idx] = { ...this.exams[idx], ...exam };
      return this.exams[idx];
    }
    this.exams.push(exam);
    return exam;
  }

  public deleteGovernmentExam(id: string): boolean {
    const prevLen = this.exams.length;
    this.exams = this.exams.filter(e => e.id !== id);
    return this.exams.length < prevLen;
  }

  public getQuestionBank(filters?: {
    examId?: string;
    subject?: string;
    topic?: string;
    difficulty?: string;
    status?: string;
  }): QuestionItem[] {
    return this.questionBank.filter(q => {
      if (filters?.examId && filters.examId !== 'ALL' && q.examId !== filters.examId) return false;
      if (filters?.subject && filters.subject !== 'ALL' && q.subject !== filters.subject) return false;
      if (filters?.topic && filters.topic !== 'ALL' && q.topic !== filters.topic) return false;
      if (filters?.difficulty && filters.difficulty !== 'ALL' && q.difficulty !== filters.difficulty) return false;
      if (filters?.status && filters.status !== 'ALL' && q.status !== filters.status) return false;
      return true;
    });
  }

  public saveQuestion(question: QuestionItem): QuestionItem {
    const idx = this.questionBank.findIndex(q => q.id === question.id);
    if (idx !== -1) {
      this.questionBank[idx] = { ...this.questionBank[idx], ...question, updatedAt: new Date().toISOString() };
      return this.questionBank[idx];
    }
    this.questionBank.unshift({
      ...question,
      id: question.id || `qb-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return this.questionBank[0];
  }

  public approveQuestion(questionId: string, adminName: string = 'Super Admin'): QuestionItem | undefined {
    const q = this.questionBank.find(item => item.id === questionId);
    if (!q) return undefined;
    q.status = 'APPROVED';
    q.approvedBy = adminName;
    q.approvedAt = new Date().toISOString();
    q.updatedAt = new Date().toISOString();
    return q;
  }

  public publishQuestion(questionId: string, adminName: string = 'Super Admin'): QuestionItem | undefined {
    const q = this.questionBank.find(item => item.id === questionId);
    if (!q) return undefined;
    q.status = 'PUBLISHED';
    q.approvedBy = adminName;
    q.approvedAt = q.approvedAt || new Date().toISOString();
    q.updatedAt = new Date().toISOString();
    return q;
  }

  public rejectQuestion(questionId: string, reason?: string): QuestionItem | undefined {
    const q = this.questionBank.find(item => item.id === questionId);
    if (!q) return undefined;
    q.status = 'REJECTED';
    q.updatedAt = new Date().toISOString();
    return q;
  }

  public deleteQuestion(questionId: string): boolean {
    const prevLen = this.questionBank.length;
    this.questionBank = this.questionBank.filter(q => q.id !== questionId);
    return this.questionBank.length < prevLen;
  }

  public bulkApproveQuestions(questionIds: string[], adminName: string = 'FocusPoint Academic Lead'): number {
    let count = 0;
    const idSet = new Set(questionIds);
    this.questionBank.forEach(q => {
      if (idSet.has(q.id)) {
        q.status = 'APPROVED';
        q.approvedBy = adminName;
        q.approvedAt = new Date().toISOString();
        q.updatedAt = new Date().toISOString();
        count++;
      }
    });
    return count;
  }

  public bulkRejectQuestions(questionIds: string[]): number {
    let count = 0;
    const idSet = new Set(questionIds);
    this.questionBank.forEach(q => {
      if (idSet.has(q.id)) {
        q.status = 'REJECTED';
        q.updatedAt = new Date().toISOString();
        count++;
      }
    });
    return count;
  }

  public bulkDeleteQuestions(questionIds: string[]): number {
    const idSet = new Set(questionIds);
    const prevLen = this.questionBank.length;
    this.questionBank = this.questionBank.filter(q => !idSet.has(q.id));
    return prevLen - this.questionBank.length;
  }

  public generateAIQuestions(params: {
    examId: string;
    subject: string;
    topic: string;
    difficulty: QuestionDifficulty;
    count: number;
    questionType: QuestionType;
    customPrompt?: string;
  }): QuestionItem[] {
    const exam = this.getGovernmentExamById(params.examId) || { name: 'Competitive Exam' };
    const generated: QuestionItem[] = [];

    const templates = [
      {
        qText: `In ${params.subject} (${params.topic}), when evaluating the standard application of principles under ${params.difficulty.toLowerCase()} conditions, what is the primary conclusion?`,
        opt: ['Direct linear relationship applies', 'Inverse proportional variance occurs', 'Logarithmic plateau is observed', 'Null discrepancy under zero boundary'],
        correct: 'Inverse proportional variance occurs',
        exp: `Detailed pedagogical breakdown for ${params.topic}: As demonstrated in standard competitive frameworks, the variable scales according to inverse variance when boundary limits are satisfied.`
      },
      {
        qText: `Consider the following problem in ${params.topic}: If a system parameter increments by 25%, by what factor must the conjugate parameter adjust to maintain equilibrium?`,
        opt: ['20% reduction', '25% increase', '15% reduction', '30% variance'],
        correct: '20% reduction',
        exp: `Equilibrium formula: adjustment = [x / (100 + x)] * 100 = (25 / 125) * 100 = 20% reduction.`
      }
    ];

    for (let i = 0; i < params.count; i++) {
      const t = templates[i % templates.length];
      const newQ: QuestionItem = {
        id: `qb-ai-${Date.now()}-${i}`,
        examId: params.examId,
        examName: exam.name,
        subject: params.subject,
        topic: params.topic,
        difficulty: params.difficulty,
        questionType: params.questionType,
        questionText: `[AI Draft] ${t.qText} (Item #${i + 1})`,
        options: t.opt.map((text, idx) => ({
          id: `opt-ai-${i}-${idx}`,
          text,
          isCorrect: text === t.correct
        })),
        correctAnswer: t.correct,
        explanation: t.exp,
        conceptPoint: `Key concept point for ${params.topic} revision.`,
        marks: 2,
        negativeMarks: 0.5,
        language: 'English',
        source: 'AI_GENERATED',
        status: 'AI_GENERATED', // Rule 17: Human approval required before publication!
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.questionBank.unshift(newQ);
      generated.push(newQ);
    }

    return generated;
  }

  // ==========================================
  // 5. MOCK TEST ATTEMPT & EVALUATION ENGINE
  // ==========================================

  public getMockTests(examId?: string): MockTest[] {
    if (!examId || examId === 'ALL') return this.mockTests;
    return this.mockTests.filter(m => m.examId === examId);
  }

  public getMockTestById(id: string): MockTest | undefined {
    return this.mockTests.find(m => m.id === id);
  }

  public updateExamCategoriesConfig(examId: string, categories: ExamTestCategoryConfig[]): GovernmentExam | undefined {
    const exam = this.exams.find(e => e.id === examId);
    if (!exam) return undefined;
    exam.categoriesConfig = categories;
    return exam;
  }

  public getMockTestSeries(examId?: string): MockTestSeries[] {
    if (!examId || examId === 'ALL') return this.testSeries;
    return this.testSeries.filter(s => s.examId === examId);
  }

  public getMockTestSeriesById(id: string): MockTestSeries | undefined {
    return this.testSeries.find(s => s.id === id);
  }

  public saveMockTestSeries(series: MockTestSeries): MockTestSeries {
    const idx = this.testSeries.findIndex(s => s.id === series.id);
    if (idx !== -1) {
      this.testSeries[idx] = { ...this.testSeries[idx], ...series };
      return this.testSeries[idx];
    }
    const newSeries: MockTestSeries = {
      ...series,
      id: series.id || `series-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString()
    };
    this.testSeries.unshift(newSeries);
    return newSeries;
  }

  public deleteMockTestSeries(id: string): boolean {
    const prevLen = this.testSeries.length;
    this.testSeries = this.testSeries.filter(s => s.id !== id);
    return this.testSeries.length < prevLen;
  }

  public smartAssembleMockTest(params: {
    examId: string;
    category?: TestCategoryType;
    totalQuestions: number;
    difficultyDistribution?: { easy: number; medium: number; hard: number };
    subjectDistribution?: Record<string, number>;
  }): { questions: QuestionItem[]; selectedIds: string[] } {
    const examQuestions = this.questionBank.filter(q => q.examId === params.examId && q.status === 'PUBLISHED');
    const selected: QuestionItem[] = [];
    const selectedIds = new Set<string>();

    if (params.subjectDistribution && Object.keys(params.subjectDistribution).length > 0) {
      for (const [subject, targetCount] of Object.entries(params.subjectDistribution)) {
        const subjectQs = examQuestions.filter(q => q.subject === subject && !selectedIds.has(q.id));
        
        let easyTarget = Math.round(targetCount * ((params.difficultyDistribution?.easy || 30) / 100));
        let hardTarget = Math.round(targetCount * ((params.difficultyDistribution?.hard || 20) / 100));
        let medTarget = targetCount - easyTarget - hardTarget;

        const easyQs = subjectQs.filter(q => q.difficulty === 'EASY');
        const medQs = subjectQs.filter(q => q.difficulty === 'MEDIUM');
        const hardQs = subjectQs.filter(q => q.difficulty === 'HARD');

        const pickedFromSubject: QuestionItem[] = [
          ...easyQs.slice(0, easyTarget),
          ...medQs.slice(0, medTarget),
          ...hardQs.slice(0, hardTarget)
        ];

        if (pickedFromSubject.length < targetCount) {
          const remainder = subjectQs.filter(q => !pickedFromSubject.some(p => p.id === q.id));
          pickedFromSubject.push(...remainder.slice(0, targetCount - pickedFromSubject.length));
        }

        pickedFromSubject.forEach(q => {
          selected.push(q);
          selectedIds.add(q.id);
        });
      }
    }

    if (selected.length < params.totalQuestions) {
      const remaining = examQuestions.filter(q => !selectedIds.has(q.id));
      const toAdd = remaining.slice(0, params.totalQuestions - selected.length);
      toAdd.forEach(q => {
        selected.push(q);
        selectedIds.add(q.id);
      });
    }

    if (selected.length < params.totalQuestions) {
      const generalRemaining = this.questionBank.filter(q => q.status === 'PUBLISHED' && !selectedIds.has(q.id));
      const toAdd = generalRemaining.slice(0, params.totalQuestions - selected.length);
      toAdd.forEach(q => {
        selected.push(q);
        selectedIds.add(q.id);
      });
    }

    return {
      questions: selected,
      selectedIds: Array.from(selectedIds)
    };
  }

  public createMockTest(data: Omit<MockTest, 'id' | 'createdAt' | 'attemptCount'>): MockTest {
    const newTest: MockTest = {
      ...data,
      id: `mt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      attemptCount: 0,
      createdAt: new Date().toISOString()
    };
    this.mockTests.unshift(newTest);
    return newTest;
  }

  public updateMockTest(id: string, updates: Partial<MockTest>): MockTest | null {
    const index = this.mockTests.findIndex(t => t.id === id);
    if (index === -1) return null;
    this.mockTests[index] = {
      ...this.mockTests[index],
      ...updates,
      version: updates.version || (this.mockTests[index].version ? `v${(parseFloat(this.mockTests[index].version!.replace('v', '')) + 0.1).toFixed(1)}` : 'v1.1')
    };
    return this.mockTests[index];
  }

  public deleteMockTest(id: string): boolean {
    const initialLen = this.mockTests.length;
    this.mockTests = this.mockTests.filter(t => t.id !== id);
    return this.mockTests.length < initialLen;
  }

  public duplicateMockTest(id: string, newTitle?: string): MockTest | null {
    const original = this.mockTests.find(t => t.id === id);
    if (!original) return null;
    const cloned: MockTest = {
      ...original,
      id: `mt-clone-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: newTitle || `${original.title} (Copy)`,
      status: 'DRAFT',
      version: 'v1.0',
      attemptCount: 0,
      createdAt: new Date().toISOString()
    };
    this.mockTests.unshift(cloned);
    return cloned;
  }

  public bulkUpdateMockTests(ids: string[], updates: Partial<MockTest>): number {
    let count = 0;
    this.mockTests = this.mockTests.map(t => {
      if (ids.includes(t.id)) {
        count++;
        return { ...t, ...updates };
      }
      return t;
    });
    return count;
  }

  // ==========================================
  // 5b. OPERATOR-CONTROLLED CUSTOM MOCK DRILL REQUESTS
  // ==========================================

  public getCustomMockRequests(studentId?: string): CustomMockDrillRequest[] {
    if (!studentId || studentId === 'ALL') {
      return [...this.customMockRequests];
    }
    return this.customMockRequests.filter(r => r.studentId === studentId);
  }

  public getCustomMockRequestById(id: string): CustomMockDrillRequest | undefined {
    return this.customMockRequests.find(r => r.id === id);
  }

  public submitCustomMockRequest(data: Omit<CustomMockDrillRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>): CustomMockDrillRequest {
    const nextSeq = this.customMockRequests.length + 1;
    const padded = String(nextSeq).padStart(3, '0');
    const newRequest: CustomMockDrillRequest = {
      ...data,
      id: `FP-MDR-2026-${padded}`,
      status: 'REQUESTED',
      operatorMessage: 'Request received by FocusPoint Academic Operations. An academic operator will review your requirements.',
      priority: data.priority || 'MEDIUM',
      estimatedAvailability: 'Within 24 hours',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.customMockRequests.unshift(newRequest);
    return newRequest;
  }

  public updateCustomMockRequestStatus(
    id: string,
    status: CustomMockDrillRequestStatus,
    operatorMessage?: string,
    assignedOperatorId?: string,
    assignedOperatorName?: string,
    generatedMockTestId?: string
  ): CustomMockDrillRequest | null {
    const req = this.customMockRequests.find(r => r.id === id);
    if (!req) return null;
    req.status = status;
    if (operatorMessage !== undefined) req.operatorMessage = operatorMessage;
    if (assignedOperatorId !== undefined) req.assignedOperatorId = assignedOperatorId;
    if (assignedOperatorName !== undefined) req.assignedOperatorName = assignedOperatorName;
    if (generatedMockTestId !== undefined) req.generatedMockTestId = generatedMockTestId;
    if (status === 'PUBLISHED') {
      req.publishedAt = new Date().toISOString();
      req.estimatedAvailability = 'Ready Now';
    }
    req.updatedAt = new Date().toISOString();
    return req;
  }

  public generateMockFromRequest(
    requestId: string,
    operatorDetails: {
      operatorId: string;
      operatorName: string;
      customTitle?: string;
      questionIds?: string[];
      durationMinutes?: number;
      negativeMarking?: number;
      passingMarks?: number;
    }
  ): { request: CustomMockDrillRequest; mockTest: MockTest } {
    const req = this.customMockRequests.find(r => r.id === requestId);
    if (!req) {
      throw new Error(`Custom mock request ${requestId} not found.`);
    }

    // 1. Gather matching questions
    let candidateQs = this.questionBank.filter(q => q.examId === req.examId && q.status === 'PUBLISHED');
    if (req.subject && req.subject !== 'ALL') {
      const subjectQs = candidateQs.filter(q => q.subject === req.subject);
      if (subjectQs.length > 0) candidateQs = subjectQs;
    }

    let selectedQIds: string[] = operatorDetails.questionIds || [];
    if (selectedQIds.length === 0) {
      const count = Math.min(req.questionCount, candidateQs.length);
      selectedQIds = candidateQs.slice(0, count).map(q => q.id);
      // If still fewer, use whatever available
      if (selectedQIds.length === 0) {
        selectedQIds = this.questionBank.slice(0, Math.min(10, req.questionCount)).map(q => q.id);
      }
    }

    const testTitle = operatorDetails.customTitle || (
      req.topic
        ? `${req.examName} — ${req.subject}: ${req.topic} (${selectedQIds.length} Qs)`
        : `${req.examName} — ${req.subject} Personalized Drill (${selectedQIds.length} Qs)`
    );

    const mockTest: MockTest = this.createMockTest({
      examId: req.examId,
      examName: req.examName,
      title: testTitle,
      description: `Personalized ${req.difficulty.toLowerCase()} mock drill requested by ${req.studentName} for ${req.subject} (${req.testType}). Prepared, validated, and published by ${operatorDetails.operatorName}.`,
      subject: req.subject,
      chapter: req.chapter,
      topic: req.topic,
      isFullMock: req.testType === 'Full Mock',
      durationMinutes: operatorDetails.durationMinutes || req.durationMinutes || Math.round(selectedQIds.length * 1.2),
      totalQuestions: selectedQIds.length,
      totalMarks: selectedQIds.length * 2,
      negativeMarkingPerQuestion: operatorDetails.negativeMarking ?? 0.5,
      passingMarks: operatorDetails.passingMarks || Math.round(selectedQIds.length * 2 * 0.4),
      difficulty: req.difficulty === 'ADVANCED' ? 'HARD' : (req.difficulty === 'MODERATE' ? 'MEDIUM' : (req.difficulty as any)),
      language: req.language,
      status: 'DRAFT',
      questionIds: selectedQIds,
      version: 'v1.0',
      isFree: true,
      tags: ['Personalized Drill', 'Operator Vetted', req.testType]
    });

    // Update request to QUALITY_REVIEW
    this.updateCustomMockRequestStatus(
      requestId,
      'QUALITY_REVIEW',
      `Personalized drill draft compiled by ${operatorDetails.operatorName}. Undergoing academic quality verification.`,
      operatorDetails.operatorId,
      operatorDetails.operatorName,
      mockTest.id
    );

    return { request: req, mockTest };
  }


  public startMockTestAttempt(studentId: string, studentName: string, mockTestId: string): MockTestAttempt {
    const test = this.getMockTestById(mockTestId);
    if (!test) {
      throw new Error(`Mock test with ID ${mockTestId} does not exist.`);
    }

    const availableQuestions = this.questionBank.filter(q => test.questionIds.includes(q.id));
    const questionOrder = availableQuestions.map(q => q.id);

    const initialAnswers: Record<string, MockTestAnswer> = {};
    questionOrder.forEach(qId => {
      initialAnswers[qId] = {
        questionId: qId,
        selectedOptions: [],
        isMarkedForReview: false,
        timeSpentSeconds: 0,
        isAnswered: false
      };
    });

    const attempt: MockTestAttempt = {
      id: `att-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      studentId,
      studentName,
      examId: test.examId,
      examName: test.examName,
      mockTestId: test.id,
      mockTestTitle: test.title,
      startedAt: new Date().toISOString(),
      timeSpentSeconds: 0,
      questionOrder,
      answers: initialAnswers,
      totalQuestions: questionOrder.length,
      status: 'IN_PROGRESS'
    };

    test.attemptCount = (test.attemptCount || 0) + 1;
    this.mockTestAttempts.unshift(attempt);
    return attempt;
  }

  public saveMockTestAnswer(
    attemptId: string,
    questionId: string,
    selectedOptions: string[],
    numericalValue?: number,
    isMarkedForReview: boolean = false,
    timeSpentSeconds: number = 0
  ): MockTestAttempt | undefined {
    const attempt = this.mockTestAttempts.find(a => a.id === attemptId);
    if (!attempt || attempt.status !== 'IN_PROGRESS') return undefined;

    const isAnswered = selectedOptions.length > 0 || numericalValue !== undefined;
    attempt.answers[questionId] = {
      questionId,
      selectedOptions,
      numericalValue,
      isMarkedForReview,
      timeSpentSeconds: (attempt.answers[questionId]?.timeSpentSeconds || 0) + timeSpentSeconds,
      isAnswered
    };

    return attempt;
  }

  public submitMockTestAttempt(attemptId: string): MockTestAttempt {
    const attempt = this.mockTestAttempts.find(a => a.id === attemptId);
    if (!attempt) {
      throw new Error(`Attempt ${attemptId} not found.`);
    }

    const test = this.getMockTestById(attempt.mockTestId);
    const negativeMarking = test?.negativeMarkingPerQuestion || 0.5;

    let score = 0;
    let totalMarks = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;
    let attemptedCount = 0;
    let negativeMarksPenalty = 0;

    const subjectBreakdown: MockTestAttempt['subjectBreakdown'] = {};
    const topicBreakdown: MockTestAttempt['topicBreakdown'] = {};

    attempt.questionOrder.forEach(qId => {
      const q = this.questionBank.find(item => item.id === qId);
      if (!q) return;

      const qMarks = q.marks || 2;
      totalMarks += qMarks;

      if (!subjectBreakdown[q.subject]) {
        subjectBreakdown[q.subject] = { total: 0, attempted: 0, correct: 0, incorrect: 0, score: 0, accuracy: 0 };
      }
      subjectBreakdown[q.subject].total++;

      if (!topicBreakdown[q.topic]) {
        topicBreakdown[q.topic] = { total: 0, correct: 0, accuracy: 0 };
      }
      topicBreakdown[q.topic].total++;

      const ans = attempt.answers[qId];
      if (!ans || !ans.isAnswered) {
        unansweredCount++;
      } else {
        attemptedCount++;
        subjectBreakdown[q.subject].attempted++;

        // Verify correctness
        const selected = ans.selectedOptions[0];
        const isCorrect = selected === q.correctAnswer || q.options.find(o => o.id === selected)?.isCorrect;

        if (isCorrect) {
          correctCount++;
          score += qMarks;
          subjectBreakdown[q.subject].correct++;
          subjectBreakdown[q.subject].score += qMarks;
          topicBreakdown[q.topic].correct++;
        } else {
          incorrectCount++;
          score -= negativeMarking;
          negativeMarksPenalty += negativeMarking;
          subjectBreakdown[q.subject].incorrect++;
          subjectBreakdown[q.subject].score -= negativeMarking;

          // Push to student's Mistake Book automatically!
          this.addMistakeItem({
            studentId: attempt.studentId,
            questionId: q.id,
            examName: attempt.examName,
            subject: q.subject,
            topic: q.topic,
            difficulty: q.difficulty,
            questionText: q.questionText,
            options: q.options,
            studentAnswer: selected || 'Unanswered',
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            conceptPoint: q.conceptPoint
          });
        }
      }
    });

    // Compute subject accuracies
    Object.keys(subjectBreakdown).forEach(sub => {
      const s = subjectBreakdown[sub];
      s.accuracy = s.attempted > 0 ? Math.round((s.correct / s.attempted) * 100) : 0;
    });

    Object.keys(topicBreakdown).forEach(top => {
      const t = topicBreakdown[top];
      t.accuracy = t.total > 0 ? Math.round((t.correct / t.total) * 100) : 0;
    });

    const finalScore = Math.max(0, Math.round(score * 10) / 10);
    const percentage = totalMarks > 0 ? Math.round((finalScore / totalMarks) * 100) : 0;
    const accuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;

    attempt.submittedAt = new Date().toISOString();
    attempt.status = 'COMPLETED';
    attempt.score = finalScore;
    attempt.totalMarks = totalMarks;
    attempt.percentage = percentage;
    attempt.accuracy = accuracy;
    attempt.attemptedCount = attemptedCount;
    attempt.correctCount = correctCount;
    attempt.incorrectCount = incorrectCount;
    attempt.unansweredCount = unansweredCount;
    attempt.negativeMarksPenalty = negativeMarksPenalty;
    attempt.subjectBreakdown = subjectBreakdown;
    attempt.topicBreakdown = topicBreakdown;

    // Record formal StudentTestRecord to feed student growth engine
    this.studentTestRecords.unshift({
      id: `tr-mock-${attempt.id}`,
      studentId: attempt.studentId,
      studentName: attempt.studentName,
      subject: test?.subject || 'Comprehensive Government Exam',
      testName: attempt.mockTestTitle,
      testDate: new Date().toISOString().substring(0, 10),
      marksObtained: finalScore,
      totalMarks: totalMarks,
      percentage,
      correctQuestions: correctCount,
      incorrectQuestions: incorrectCount,
      unansweredQuestions: unansweredCount,
      source: 'LIBRARY_MOCK_TEST',
      remarks: `National level mock test attempt. Final Score: ${finalScore}/${totalMarks}, Accuracy: ${accuracy}%.`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return attempt;
  }

  public getMockTestAttempt(attemptId: string): MockTestAttempt | undefined {
    return this.mockTestAttempts.find(a => a.id === attemptId);
  }

  public getStudentMockTestHistory(studentId: string): MockTestAttempt[] {
    return this.mockTestAttempts.filter(a => a.studentId === studentId);
  }

  // ==========================================
  // 6. MISTAKE BOOK ENGINE
  // ==========================================

  public addMistakeItem(data: {
    studentId: string;
    questionId: string;
    examName: string;
    subject: string;
    topic: string;
    difficulty: QuestionDifficulty;
    questionText: string;
    options: any[];
    studentAnswer: string;
    correctAnswer: string;
    explanation: string;
    conceptPoint?: string;
  }): MistakeBookItem {
    const existing = this.mistakeBookItems.find(
      m => m.studentId === data.studentId && m.questionId === data.questionId
    );
    if (existing) {
      existing.studentAnswer = data.studentAnswer;
      existing.attemptDate = new Date().toISOString();
      existing.isUnderstood = false;
      return existing;
    }

    const item: MistakeBookItem = {
      id: `mis-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      studentId: data.studentId,
      questionId: data.questionId,
      examName: data.examName,
      subject: data.subject,
      topic: data.topic,
      difficulty: data.difficulty,
      questionText: data.questionText,
      options: data.options,
      studentAnswer: data.studentAnswer,
      correctAnswer: data.correctAnswer,
      explanation: data.explanation,
      conceptPoint: data.conceptPoint,
      attemptDate: new Date().toISOString(),
      isUnderstood: false,
      retryCount: 0
    };

    this.mistakeBookItems.unshift(item);
    return item;
  }

  public getStudentMistakeBook(studentId: string, filters?: { subject?: string; isUnderstood?: boolean }): MistakeBookItem[] {
    return this.mistakeBookItems.filter(m => {
      if (m.studentId !== studentId) return false;
      if (filters?.subject && filters.subject !== 'ALL' && m.subject !== filters.subject) return false;
      if (filters?.isUnderstood !== undefined && m.isUnderstood !== filters.isUnderstood) return false;
      return true;
    });
  }

  public updateMistakeItem(mistakeId: string, updates: Partial<MistakeBookItem>): MistakeBookItem | undefined {
    const item = this.mistakeBookItems.find(m => m.id === mistakeId);
    if (!item) return undefined;
    Object.assign(item, updates);
    return item;
  }

  public retryMistakeQuestion(mistakeId: string, selectedAnswer: string): { isCorrect: boolean; explanation: string } {
    const item = this.mistakeBookItems.find(m => m.id === mistakeId);
    if (!item) {
      throw new Error(`Mistake item ${mistakeId} not found.`);
    }

    item.retryCount = (item.retryCount || 0) + 1;
    item.lastRetriedAt = new Date().toISOString();

    const isCorrect = selectedAnswer === item.correctAnswer;
    if (isCorrect) {
      item.isUnderstood = true;
    }

    return {
      isCorrect,
      explanation: item.explanation
    };
  }

  // ==========================================
  // 7. ACHIEVEMENTS & THRESHOLDS & AI CONFIG
  // ==========================================

  public getStudentAchievements(studentId: string): StudentAchievement[] {
    return this.achievements.filter(a => a.studentId === studentId);
  }

  public getAcademicThresholds(): PerformanceThresholdConfig {
    return { ...this.thresholds };
  }

  public updateAcademicThresholds(updates: Partial<PerformanceThresholdConfig>, adminName: string = 'Super Admin'): PerformanceThresholdConfig {
    this.thresholds = {
      ...this.thresholds,
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: adminName
    };
    return { ...this.thresholds };
  }

  public getAIControlConfig(): AIControlConfig {
    return { ...this.aiConfig };
  }

  public updateAIControlConfig(updates: Partial<AIControlConfig>): AIControlConfig {
    this.aiConfig = {
      ...this.aiConfig,
      ...updates
    };
    return { ...this.aiConfig };
  }

  public getAcademicKPIOverview(districtId?: string): AcademicKPIOverview {
    const totalAssessments = this.studentTestRecords.length;
    const totalMockTests = this.mockTestAttempts.filter(a => a.status === 'COMPLETED').length;
    const activeExamCategories = new Set(this.exams.map(e => e.category)).size;
    const totalQuestionsInBank = this.questionBank.length;
    const aiGeneratedQuestionsCount = this.questionBank.filter(q => q.source === 'AI_GENERATED').length;
    const pendingReviewCount = this.questionBank.filter(q => q.status === 'AI_GENERATED' || q.status === 'UNDER_REVIEW' || q.status === 'DRAFT').length;

    // Student performance percentages
    let excellentCount = 0;
    let goodCount = 0;
    let avgCount = 0;
    let needsImpCount = 0;

    this.studentTestRecords.forEach(t => {
      if (t.percentage >= this.thresholds.excellentThreshold) excellentCount++;
      else if (t.percentage >= this.thresholds.goodThreshold) goodCount++;
      else if (t.percentage >= this.thresholds.averageThreshold) avgCount++;
      else needsImpCount++;
    });

    const sum = totalAssessments || 1;
    const performanceDistribution = {
      excellentPct: Math.round((excellentCount / sum) * 100),
      goodPct: Math.round((goodCount / sum) * 100),
      averagePct: Math.round((avgCount / sum) * 100),
      needsImprovementPct: Math.round((needsImpCount / sum) * 100)
    };

    return {
      totalAssessments,
      totalMockTests,
      activeExamCategories,
      totalQuestionsInBank,
      aiGeneratedQuestionsCount,
      pendingReviewCount,
      averageStudentAccuracy: 74,
      mostAttemptedExams: [
        { examName: 'SSC CGL', attempts: 142 },
        { examName: 'UP PET', attempts: 95 },
        { examName: 'RRB NTPC', attempts: 88 }
      ],
      difficultTopics: [
        { topic: 'Percentage & Commercial Math', subject: 'Mathematics', errorRate: 56 },
        { topic: 'Profit & Loss False Weights', subject: 'Mathematics', errorRate: 52 },
        { topic: 'Correlative Conjunctions', subject: 'English', errorRate: 38 }
      ],
      performanceDistribution
    };
  }
}

export const academicStoreEngine = new AcademicStoreEngine();
