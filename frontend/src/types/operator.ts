// FOCUSPOINT Pan-India Study Material & Mock Test Operator TypeScript Definitions

export type StudyMaterialPermission = 
  | 'view_study_material'
  | 'upload_study_material'
  | 'edit_study_material'
  | 'delete_study_material'
  | 'publish_study_material'
  | 'manage_material_pricing'
  | 'manage_material_categories'
  | 'manage_material_versions';

export type MockTestPermission = 
  | 'view_mock_tests'
  | 'create_mock_test'
  | 'edit_mock_test'
  | 'delete_mock_test'
  | 'publish_mock_test'
  | 'manage_question_bank'
  | 'generate_questions_ai'
  | 'approve_ai_questions'
  | 'manage_exam_patterns';

export type AIPermission = 
  | 'ask_ai'
  | 'generate_questions'
  | 'generate_explanations'
  | 'generate_mock_tests'
  | 'ai_validation'
  | 'ai_duplicate_detection';

export type OperatorPermission = StudyMaterialPermission | MockTestPermission | AIPermission;

export type OperatorStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'ARCHIVED';

export interface StudyMaterialOperator {
  id: string;
  operatorId: string; // Auto-generated ID e.g. 'OPR-IN-2026-001'
  name: string;
  email: string;
  mobile: string;
  avatarUrl?: string;
  address: string;
  state: string;
  district: string;
  qualification: string;
  experience: string;
  appointmentDate: string;
  status: OperatorStatus;
  role: 'STUDY_MATERIAL_OPERATOR';
  notes?: string;
  permissions: OperatorPermission[];
  assignedExams?: string[]; // IDs of exams or '*' for all
  stats: {
    materialsUploaded: number;
    materialsPublished: number;
    mockTestsCreated: number;
    questionsCreated: number;
    aiQuestionsGenerated: number;
    questionsApproved: number;
    questionsRejected: number;
    materialViewsCount: number;
    materialDownloadsCount: number;
    mockTestAttemptsCount: number;
    lastActiveAt: string;
  };
}

export type OperatorActivityAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'PROFILE_UPDATE'
  | 'PHOTO_UPDATE'
  | 'MATERIAL_UPLOAD'
  | 'MATERIAL_EDIT'
  | 'MATERIAL_PUBLISH'
  | 'MATERIAL_ARCHIVE'
  | 'MATERIAL_VERSION_ADD'
  | 'QUESTION_CREATE'
  | 'QUESTION_UPDATE'
  | 'AI_QUESTION_GENERATE'
  | 'AI_QUESTION_APPROVE'
  | 'AI_QUESTION_REJECT'
  | 'MOCK_TEST_CREATE'
  | 'MOCK_TEST_PUBLISH'
  | 'MOCK_TEST_SCHEDULE'
  | 'MOCK_TEST_EDIT'
  | 'PERMISSION_UPDATE'
  | 'STATUS_CHANGE';

export interface OperatorActivityLog {
  id: string;
  operatorId: string;
  operatorName: string;
  action: OperatorActivityAction;
  entity: 'STUDY_MATERIAL' | 'MOCK_TEST' | 'QUESTION' | 'EXAM' | 'AI_SESSION' | 'PROFILE';
  entityId: string;
  entityTitle: string;
  details: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface AIChatMessage {
  id: string;
  sender: 'OPERATOR' | 'AI' | 'SYSTEM';
  text: string;
  timestamp: string;
  status?: 'SENDING' | 'SUCCESS' | 'ERROR';
  structuredData?: {
    type: 'QUESTIONS_DRAFT' | 'MOCK_PAPER_DRAFT' | 'QUALITY_REPORT' | 'EXPLANATION';
    payload: any;
  };
}

export interface AIChatSession {
  id: string;
  operatorId: string;
  title: string;
  examId?: string;
  subject?: string;
  createdAt: string;
  updatedAt: string;
  messages: AIChatMessage[];
}

export interface OperatorContentMetrics {
  totalMaterials: number;
  publishedMaterials: number;
  draftMaterials: number;
  underReviewMaterials: number;
  archivedMaterials: number;

  totalMockTests: number;
  publishedMockTests: number;
  draftMockTests: number;
  scheduledMockTests: number;

  totalQuestions: number;
  approvedQuestions: number;
  pendingQuestions: number;
  aiGeneratedQuestions: number;
  rejectedQuestions: number;

  totalViews: number;
  totalDownloads: number;
  totalAttempts: number;
  rejectionRate: number; // percentage e.g. 4.2%

  topMaterials: {
    id: string;
    title: string;
    views: number;
    downloads: number;
    subject: string;
  }[];

  topMockTests: {
    id: string;
    title: string;
    examName: string;
    attempts: number;
    averageScore: number;
  }[];
}

export interface SuperAdminStudyMaterialBI {
  totalGrossSales: number;
  totalUnitsSold: number;
  activePaidMaterials: number;
  totalFreeMaterials: number;
  totalDiscounts: number;
  totalRefunds: number;
  netRevenue: number;
  salesByExam: { exam: string; units: number; revenue: number }[];
  salesByState: { state: string; revenue: number }[];
  salesByDistrict: { district: string; revenue: number }[];
  monthlyRevenueTrend: { month: string; sales: number; revenue: number }[];
  topSellingMaterials: {
    id: string;
    title: string;
    unitsSold: number;
    revenue: number;
    price: number;
  }[];
}

export interface SuperAdminMockTestBI {
  activeSubscriptions: number;
  totalSubscriptions: number;
  newSubscriptionsThisMonth: number;
  renewalsThisMonth: number;
  expiredSubscriptions: number;
  cancelledSubscriptions: number;
  grossSubscriptionRevenue: number;
  totalRefunds: number;
  netSubscriptionRevenue: number;
  totalAttemptsPlatformWide: number;
  subscriptionsByExam: { exam: string; count: number; revenue: number }[];
  regionalDemand: { state: string; activeUsers: number; testAttempts: number }[];
  topAttemptedTests: { id: string; title: string; examName: string; attempts: number }[];
}

export interface SuperAdminOperatorMonitoringMetric {
  operatorId: string;
  operatorName: string;
  systemId: string;
  avatarUrl?: string;
  status: OperatorStatus;
  materialsCreated: number;
  mockTestsCreated: number;
  questionsCreated: number;
  aiQuestionsGenerated: number;
  questionsApproved: number;
  rejectionRate: number;
  totalViewsGenerated: number;
  totalAttemptsGenerated: number;
  aiTokensUsed: number;
  estimatedAiCost: number; // in INR
  lastActive: string;

  // Extended Futuristic AI Telemetry & Scoping
  state?: string;
  district?: string;
  assignedExams?: string[];
  aiModelPreference?: 'Gemini 1.5 Pro' | 'Gemini 1.5 Flash' | 'Hybrid (Pro + Flash)' | 'Gemma 4 Edge';
  promptTokens?: number;
  completionTokens?: number;
  avgInferenceLatencyMs?: number;
  humanEditDistancePercent?: number; // % of AI generated text modified before approval
  monthlyTokenQuota?: number;
  tokenQuotaUsedPercent?: number;
  hitlQualityScore?: number; // 0 - 100 rating
  guardrailFlagsCount?: number;
  aiGenerationRatePerHour?: number;
  isAiAccessSuspended?: boolean;
  rateLimitPerMinute?: number;
  temperatureCap?: number;
}

export interface OperatorAiActivityLog {
  id: string;
  timestamp: string;
  operatorId: string;
  operatorName: string;
  operatorAvatar?: string;
  targetExam: string;
  subject: string;
  topic: string;
  aiTask: 'QUESTION_GEN' | 'EXPLANATION' | 'DISTRACTOR_VERIFY' | 'OCR_DIGITIZE' | 'DIFFICULTY_CALIBRATE';
  modelUsed: 'Gemini 1.5 Pro' | 'Gemini 1.5 Flash' | 'Gemma 4 Edge';
  tokens: { prompt: number; completion: number; total: number };
  latencyMs: number;
  costInr: number;
  status: 'ACCEPTED' | 'MODIFIED_AND_ACCEPTED' | 'REJECTED' | 'FLAGGED';
  guardrailResult: 'PASSED' | 'WARNING_OVERRIDDEN' | 'REJECTED';
  samplePromptSnippet: string;
  sampleGeneratedSnippet: string;
  operatorEditSnippet?: string;
}

export interface OperatorAiQuotaConfig {
  operatorId: string;
  monthlyTokenLimit: number;
  rateLimitPerMinute: number;
  allowedModels: string[];
  autoFreezeOnExhaustion: boolean;
  temperatureCap: number;
  requireHumanReview: boolean;
}

export interface AiModelTelemetrySummary {
  modelName: string;
  displayName: string;
  sharePercent: number;
  totalTokens: number;
  costPer1kTokensInr: number;
  avgLatencyMs: number;
  totalRequests: number;
  color: string;
}

