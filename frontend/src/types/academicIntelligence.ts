// FOCUSPOINT Academic Intelligence & Mock Test Engine Type Definitions

export type QuestionType = 
  | 'MCQ' 
  | 'MULTIPLE_CORRECT' 
  | 'TRUE_FALSE' 
  | 'NUMERICAL' 
  | 'ASSERTION_REASON'
  | 'MATCH_FOLLOWING'
  | 'COMPREHENSION';

export type QuestionDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export type QuestionStatus = 
  | 'DRAFT' 
  | 'AI_GENERATED' 
  | 'UNDER_REVIEW' 
  | 'APPROVED' 
  | 'PUBLISHED' 
  | 'ARCHIVED' 
  | 'REJECTED';

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface MatchPair {
  left: string;
  right: string;
}

export interface QuestionItem {
  id: string;
  examId: string;
  examName: string;
  subject: string;
  topic: string;
  chapter?: string;
  difficulty: QuestionDifficulty;
  questionType: QuestionType;
  questionText: string;
  hindiQuestionText?: string;
  assertionText?: string;
  reasonText?: string;
  passageText?: string;
  matchPairs?: MatchPair[];
  options: QuestionOption[];
  hindiOptions?: QuestionOption[];
  correctAnswer: string; // e.g. "A" or option text
  correctAnswers?: string[]; // for multiple correct
  numericalAnswer?: number;
  numericalTolerance?: number;
  explanation: string;
  hindiExplanation?: string;
  conceptPoint?: string;
  marks: number;
  negativeMarks: number;
  language: string;
  source: 'TEACHER_ENTERED' | 'AI_GENERATED' | 'STAFF_AUTHORED' | 'PAST_YEAR_PAPER';
  status: QuestionStatus;
  approvedBy?: string;
  approvedAt?: string;
  usageStats?: {
    mockTestCount: number;
    studentAttempts: number;
    accuracyRate: number;
  };
  createdAt: string;
  updatedAt: string;
}

export type TestCategoryType = 
  | 'TEST_SERIES' 
  | 'PREVIOUS_YEAR' 
  | 'CHAPTER_WISE' 
  | 'IMPORTANT_TEST' 
  | 'SUBJECT_WISE' 
  | 'FULL_TEST' 
  | 'ADVANCED_TEST' 
  | 'MISCELLANEOUS';

export type PreviousYearPaperSourceType = 
  | 'OFFICIAL_PYQ' 
  | 'RECONSTRUCTED_PATTERN' 
  | 'EXPERT_CURATED';

export interface ExamTestCategoryConfig {
  id: string;
  categoryKey: TestCategoryType | string;
  name: string;
  shortLabel: string;
  description: string;
  icon?: string;
  isEnabled: boolean;
  order: number;
  isCustom?: boolean;
}

export interface GovernmentExam {
  id: string;
  name: string;
  shortName: string;
  category: 'SSC' | 'RAILWAY' | 'TEACHING' | 'STATE_EXAMS' | 'BANKING' | 'DEFENCE' | 'CIVIL_SERVICES' | 'POLICE' | 'ADMISSION_EXAMS' | 'ENGINEERING' | 'MEDICAL' | 'OLYMPIAD';
  examType?: 'GOVERNMENT' | 'ADMISSION';
  conductingAuthority: string;
  isNational: boolean;
  applicableState?: string;
  level: 'GRADUATE' | 'INTERMEDIATE' | 'MATRIC' | 'SPECIALIZED';
  subjects: string[];
  chapters?: Record<string, string[]>;
  topics?: Record<string, string[]>;
  categoriesConfig?: ExamTestCategoryConfig[];
  subjectDistribution?: Record<string, { questionCount: number; marks: number }>;
  sections?: {
    id: string;
    name: string;
    subject: string;
    questionCount: number;
    marks: number;
    durationMinutes?: number;
  }[];
  durationMinutes: number;
  totalQuestions: number;
  totalMarks: number;
  negativeMarkingPerQuestion: number;
  languages: string[];
  status: 'ACTIVE' | 'UPCOMING' | 'ARCHIVED';
  patternVersion: string;
  icon?: string;
  description: string;
  eligibilityDescription?: string;
  officialSourceUrl?: string;
}

export interface MockTestSeriesItem {
  testId: string;
  testTitle: string;
  order: number;
  unlockDate?: string;
  isUnlocked: boolean;
  questionCount: number;
  durationMinutes: number;
  totalMarks: number;
}

export interface MockTestSeries {
  id: string;
  examId: string;
  examName: string;
  title: string;
  description: string;
  totalTests: number;
  tests: MockTestSeriesItem[];
  difficulty: 'MIXED' | 'EASY' | 'MEDIUM' | 'HARD';
  language: string;
  isFree: boolean;
  price?: number;
  subscriptionRequired: boolean;
  status: 'PUBLISHED' | 'DRAFT';
  unlockScheduleType: 'ALL_AT_ONCE' | 'WEEKLY' | 'DAILY' | 'DATE_BASED';
  createdAt: string;
  attemptedCount?: number;
}

export interface MockTest {
  id: string;
  examId: string;
  examName: string;
  title: string;
  shortName?: string;
  description: string;
  category?: TestCategoryType;
  customCategoryName?: string;
  subject?: string;
  chapter?: string;
  topic?: string;
  isFullMock: boolean;
  durationMinutes: number;
  totalQuestions: number;
  totalMarks: number;
  negativeMarkingPerQuestion: number;
  passingMarks: number;
  difficulty: 'MIXED' | 'EASY' | 'MEDIUM' | 'HARD';
  language?: string;
  status: 'PUBLISHED' | 'DRAFT';
  questionIds: string[];
  attemptCount: number;
  createdAt: string;
  version?: string;
  
  // Previous Year Question Paper metadata
  year?: number;
  shift?: string;
  paperSet?: string;
  paperSourceType?: PreviousYearPaperSourceType;
  paperSourceReference?: string;
  
  // Test Series linkage
  seriesId?: string;
  seriesOrder?: number;

  // Commercial / Entitlement flags
  isFree?: boolean;
  subscriptionRequired?: boolean;
  price?: number;
  
  // Recommendation & Tags
  isRecommended?: boolean;
  recommendedReason?: string;
  tags?: string[];
  instructions?: string[];
}

export type QuestionAttemptStatus = 
  | 'NOT_VISITED' 
  | 'NOT_ANSWERED' 
  | 'ANSWERED' 
  | 'MARKED_FOR_REVIEW' 
  | 'ANSWERED_AND_MARKED';

export interface MockTestAnswer {
  questionId: string;
  selectedOptions: string[];
  numericalValue?: number;
  isMarkedForReview: boolean;
  timeSpentSeconds: number;
  isAnswered: boolean;
}

export interface MockTestAttempt {
  id: string;
  studentId: string;
  studentName: string;
  examId: string;
  examName: string;
  mockTestId: string;
  mockTestTitle: string;
  startedAt: string;
  submittedAt?: string;
  timeSpentSeconds: number;
  questionOrder: string[];
  answers: Record<string, MockTestAnswer>;
  score?: number;
  totalMarks?: number;
  percentage?: number;
  accuracy?: number;
  totalQuestions: number;
  attemptedCount?: number;
  correctCount?: number;
  incorrectCount?: number;
  unansweredCount?: number;
  negativeMarksPenalty?: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
  subjectBreakdown?: Record<string, {
    total: number;
    attempted: number;
    correct: number;
    incorrect: number;
    score: number;
    accuracy: number;
  }>;
  topicBreakdown?: Record<string, {
    total: number;
    correct: number;
    accuracy: number;
  }>;
}

export interface StudentTestRecord {
  id: string;
  studentId: string;
  studentName: string;
  teacherId?: string;
  teacherName?: string;
  subject: string;
  topic?: string;
  chapter?: string;
  testName: string;
  testDate: string;
  marksObtained: number;
  totalMarks: number;
  percentage: number;
  difficulty?: QuestionDifficulty;
  correctQuestions?: number;
  incorrectQuestions?: number;
  unansweredQuestions?: number;
  source: 'TEACHER_ENTERED' | 'STUDENT_TEST' | 'LIBRARY_MOCK_TEST' | 'AI_GENERATED_MOCK_TEST' | 'ADMIN_ENTERED';
  remarks?: string;
  teacherFeedback?: string;
  strengths?: string[];
  areasToImprove?: string[];
  createdAt: string;
  updatedAt: string;
}

export type PerformanceClassification = 
  | 'EXCELLENT' 
  | 'GOOD' 
  | 'AVERAGE' 
  | 'NEEDS_IMPROVEMENT' 
  | 'INSUFFICIENT_DATA';

export interface SubjectPerformanceSummary {
  subject: string;
  testCount: number;
  averagePercentage: number;
  accuracy: number;
  classification: PerformanceClassification;
  trend: 'IMPROVING' | 'DECLINING' | 'STABLE';
  weakTopics: string[];
  strongTopics: string[];
  lastAssessedDate?: string;
}

export interface TopicPerformanceSummary {
  subject: string;
  topic: string;
  totalQuestions: number;
  correctQuestions: number;
  accuracy: number;
  classification: PerformanceClassification;
}

export interface StudentPerformanceMetrics {
  studentId: string;
  totalTests: number;
  totalQuestionsAttempted: number;
  averageScore: number;
  averagePercentage: number;
  overallAccuracy: number;
  improvementRate: number;
  strongestSubject?: string;
  subjectNeedingAttention?: string;
  mockTestsCompleted: number;
  studyProgressPercentage: number;
  hasSufficientData: boolean;
  subjectSummaries: SubjectPerformanceSummary[];
  recentTests: StudentTestRecord[];
  calculatedAt: string;
}

export interface WeeklyGrowthReport {
  studentId: string;
  weekLabel: string;
  startDate: string;
  endDate: string;
  testsCompleted: number;
  questionsAttempted: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  averageScore: number;
  averagePercentage: number;
  accuracy: number;
  previousWeekImprovement: number;
  subjectWise: {
    subject: string;
    tests: number;
    averageScore: number;
    accuracy: number;
    trend: 'UP' | 'STEADY' | 'DOWN';
    status: PerformanceClassification;
  }[];
  topicWise: {
    topic: string;
    subject: string;
    accuracy: number;
  }[];
  learningActivityHours: number;
}

export interface MonthlyGrowthReport {
  studentId: string;
  monthYear: string; // e.g. "2026-09"
  monthLabel: string; // e.g. "September 2026"
  totalTests: number;
  totalQuestions: number;
  totalMarks: number;
  marksObtained: number;
  averagePercentage: number;
  accuracy: number;
  consistencyScore: number;
  improvementPercentage: number;
  strongestSubject?: string;
  attentionSubject?: string;
  teacherTestsCount: number;
  mockTestsCount: number;
  selfTestsCount: number;
  subjectTrends: {
    subject: string;
    percentage: number;
    previousPercentage?: number;
    change: number;
    status: PerformanceClassification;
  }[];
  topicTrends: {
    topic: string;
    subject: string;
    accuracy: number;
  }[];
  teacherRemarks?: string[];
}

export type RecommendationLevel = 
  | 'LEVEL_1_MATERIAL' 
  | 'LEVEL_2_REVISION' 
  | 'LEVEL_3_TEACHER' 
  | 'LEVEL_4_PLAN';

export interface PersonalizedRecommendation {
  id: string;
  studentId: string;
  subject: string;
  topic?: string;
  level: RecommendationLevel;
  title: string;
  description: string;
  transparentReason: string;
  actionType: 'STUDY_MATERIAL' | 'PRACTICE_TEST' | 'SPECIALIZED_TEACHER' | 'LEARNING_PLAN';
  targetId?: string;
  targetTitle?: string;
  teacherDetails?: {
    teacherId: string;
    name: string;
    specialization: string;
    district: string;
    rating: number;
    feePerMonth: number;
    experienceYears: number;
    photo?: string;
  };
  studyMaterialDetails?: {
    materialId: string;
    title: string;
    fileType: string;
    isFree: boolean;
    price: number;
    subject: string;
  };
  learningPlanDetails?: {
    weeks: {
      week: number;
      title: string;
      tasks: string[];
    }[];
  };
  status: 'ACTIVE' | 'DISMISSED' | 'COMPLETED';
  createdAt: string;
}

export interface MistakeBookItem {
  id: string;
  studentId: string;
  questionId: string;
  examName: string;
  subject: string;
  topic: string;
  difficulty: QuestionDifficulty;
  questionText: string;
  options: QuestionOption[];
  studentAnswer: string;
  correctAnswer: string;
  explanation: string;
  conceptPoint?: string;
  attemptDate: string;
  isUnderstood: boolean;
  personalNotes?: string;
  retryCount: number;
  lastRetriedAt?: string;
}

export interface StudentAchievement {
  id: string;
  studentId: string;
  code: string;
  title: string;
  description: string;
  icon: string;
  category: 'MILESTONE' | 'ACCURACY' | 'CONSISTENCY' | 'MASTERY';
  unlockedAt: string;
  criteriaSatisfied: string;
}

export interface PerformanceThresholdConfig {
  excellentThreshold: number; // e.g. 85
  goodThreshold: number;      // e.g. 70
  averageThreshold: number;   // e.g. 50
  needsImprovementThreshold: number; // e.g. 50 (below 50)
  minTestsRequiredForClassification: number; // e.g. 2
  minQuestionsRequiredForTopic: number;      // e.g. 5
  recentTestWeight: number;   // e.g. 1.5
  accuracyWeight: number;     // e.g. 1.2
  consistencyWeight: number;  // e.g. 1.0
  version: string;
  updatedAt: string;
  updatedBy: string;
}

export interface AIControlConfig {
  aiQuestionGenerationEnabled: boolean;
  aiExplanationGenerationEnabled: boolean;
  aiRecommendationEngineEnabled: boolean;
  aiDuplicateDetectionEnabled: boolean;
  humanApprovalRequired: boolean;
  maxQuestionsPerRequest: number;
  confidenceThreshold: number;
  monthlyApiLimit: number;
  currentUsageCount: number;
}

export interface AcademicKPIOverview {
  totalAssessments: number;
  totalMockTests: number;
  activeExamCategories: number;
  totalQuestionsInBank: number;
  aiGeneratedQuestionsCount: number;
  pendingReviewCount: number;
  averageStudentAccuracy: number;
  mostAttemptedExams: {
    examName: string;
    attempts: number;
  }[];
  difficultTopics: {
    topic: string;
    subject: string;
    errorRate: number;
  }[];
  performanceDistribution: {
    excellentPct: number;
    goodPct: number;
    averagePct: number;
    needsImprovementPct: number;
  };
}

// ==========================================
// 10. OPERATOR-CONTROLLED CUSTOM MOCK DRILL REQUESTS
// ==========================================

export type CustomMockDrillRequestStatus = 
  | 'REQUESTED'
  | 'UNDER_REVIEW'
  | 'IN_PREPARATION'
  | 'GENERATED'
  | 'QUALITY_REVIEW'
  | 'PUBLISHED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'EXPIRED';

export type CustomMockDrillDifficulty = 'EASY' | 'MODERATE' | 'HARD' | 'ADVANCED' | 'MIXED';

export type CustomMockDrillTestType = 
  | 'Practice Drill'
  | 'Chapter Drill'
  | 'Subject Drill'
  | 'Revision Drill'
  | 'Full Mock'
  | 'Previous-Year Based'
  | 'Mixed Practice'
  | 'Weak Topic Practice';

export interface CustomMockDrillRequest {
  id: string; // e.g. "FP-MDR-2026-001"
  studentId: string;
  studentName: string;
  examId: string;
  examName: string;
  subject: string;
  chapter?: string;
  topic?: string;
  difficulty: CustomMockDrillDifficulty;
  questionCount: number;
  durationMinutes: number;
  language: string;
  testType: CustomMockDrillTestType;
  notes?: string;
  status: CustomMockDrillRequestStatus;
  operatorMessage?: string;
  assignedOperatorId?: string;
  assignedOperatorName?: string;
  generatedMockTestId?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  estimatedAvailability?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

// ==========================================
// 11. OPERATOR BLUEPRINT VALIDATION ENGINE
// ==========================================

export type BlueprintIssueSeverity = 'ERROR' | 'WARNING' | 'INFO';

export type BlueprintRuleCode = 
  | 'QUESTION_COUNT_MISMATCH'
  | 'SECTION_COUNT_MISMATCH'
  | 'TOTAL_MARKS_MISMATCH'
  | 'DUPLICATE_OPTIONS'
  | 'DUPLICATE_QUESTION'
  | 'MISSING_CORRECT_ANSWER'
  | 'MISSING_EXPLANATION'
  | 'DIFFICULTY_IMBALANCE'
  | 'NEGATIVE_MARKING_INVALID'
  | 'UNMAPPED_TOPIC'
  | 'MISSING_LANGUAGE_TRANSLATION'
  | 'IMAGE_MEDIA_BROKEN';

export interface BlueprintValidationIssue {
  id: string;
  severity: BlueprintIssueSeverity;
  ruleCode: BlueprintRuleCode;
  title: string;
  message: string;
  questionId?: string;
  questionNumber?: number;
  sectionName?: string;
  canAutoFix?: boolean;
  fixActionLabel?: string;
}

export interface SectionCoverageDetail {
  sectionId: string;
  sectionName: string;
  subject: string;
  actualQuestions: number;
  targetQuestions: number;
  actualMarks: number;
  targetMarks: number;
  isBalanced: boolean;
}

export interface DifficultyRatioAnalysis {
  easyCount: number;
  easyPct: number;
  targetEasyPct: number;
  moderateCount: number;
  moderatePct: number;
  targetModeratePct: number;
  hardCount: number;
  hardPct: number;
  targetHardPct: number;
  isCompliant: boolean;
}

export interface DuplicateQuestionMatch {
  questionAId: string;
  questionANumber: number;
  questionAText: string;
  questionBId: string;
  questionBNumber: number;
  questionBText: string;
  similarityScorePct: number;
}

export interface BlueprintValidationReport {
  id: string;
  mockTestId: string;
  mockTestTitle: string;
  examId: string;
  examName: string;
  isValid: boolean; // True only if errorCount === 0
  readinessScore: number; // 0 to 100
  totalQuestions: number;
  targetQuestions: number;
  totalMarks: number;
  targetMarks: number;
  durationMinutes: number;
  targetDurationMinutes: number;
  negativeMarking: number;
  standardNegativeMarking: number;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  sectionCoverage: SectionCoverageDetail[];
  difficultyAnalysis: DifficultyRatioAnalysis;
  duplicateMatches: DuplicateQuestionMatch[];
  issues: BlueprintValidationIssue[];
  auditedBy: string;
  auditedAt: string;
  complianceSummary: string;
}

