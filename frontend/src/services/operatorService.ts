// FOCUSPOINT Study Material & Mock Test Operator Management Service

import { 
  StudyMaterialOperator, 
  OperatorPermission, 
  OperatorStatus, 
  OperatorActivityLog,
  OperatorContentMetrics,
  SuperAdminStudyMaterialBI,
  SuperAdminMockTestBI,
  SuperAdminOperatorMonitoringMetric,
  OperatorAiActivityLog,
  OperatorAiQuotaConfig,
  AiModelTelemetrySummary
} from '../types/operator';
import { mockStore } from '../mock/store';
import { safeStorage } from '../utils/storageUtils';

const OPERATORS_STORAGE_KEY = 'fp_study_material_operators';
const OPERATOR_LOGS_STORAGE_KEY = 'fp_operator_activity_logs';
const AI_QUOTAS_STORAGE_KEY = 'fp_operator_ai_quotas_v1';
const AI_LOGS_STORAGE_KEY = 'fp_operator_ai_logs_v1';
const AI_SUSPENSIONS_STORAGE_KEY = 'fp_operator_ai_suspensions_v1';

export const INITIAL_OPERATOR: StudyMaterialOperator = {
  id: 'usr-operator-sunita',
  operatorId: 'OPR-IN-2026-001',
  name: 'Sunita Verma',
  email: 'operator@focuspoint.internal',
  mobile: '9876543220',
  avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
  address: 'Civil Lines, Pan-India Content Bureau',
  state: 'Uttar Pradesh',
  district: 'Varanasi',
  qualification: 'M.Sc. Mathematics, B.Ed (Gold Medalist, BHU)',
  experience: '7+ Years Senior Exam Paper Setter & Curriculum Lead',
  appointmentDate: '2026-08-01',
  status: 'ACTIVE',
  role: 'STUDY_MATERIAL_OPERATOR',
  notes: 'Lead Pan-India Content Operator for UPSSSC, PET, and Secondary Science Track.',
  permissions: [
    'view_study_material', 'upload_study_material', 'edit_study_material', 'publish_study_material',
    'manage_material_categories', 'manage_material_versions', 'view_mock_tests', 'create_mock_test',
    'edit_mock_test', 'publish_mock_test', 'manage_question_bank', 'generate_questions_ai',
    'approve_ai_questions', 'manage_exam_patterns', 'ask_ai', 'generate_questions',
    'generate_explanations', 'generate_mock_tests', 'ai_validation', 'ai_duplicate_detection'
  ],
  assignedExams: ['UPSSSC_PET', 'CHS_BHU', 'UP_BOARD_10', 'UP_BOARD_12', 'NAVODAYA_GZP'],
  stats: {
    materialsUploaded: 42,
    materialsPublished: 38,
    mockTestsCreated: 18,
    questionsCreated: 480,
    aiQuestionsGenerated: 310,
    questionsApproved: 295,
    questionsRejected: 15,
    materialViewsCount: 5240,
    materialDownloadsCount: 2180,
    mockTestAttemptsCount: 1420,
    lastActiveAt: '2026-10-11T12:35:00Z'
  }
};

export const DEFAULT_PAN_INDIA_OPERATORS: StudyMaterialOperator[] = [
  INITIAL_OPERATOR,
  {
    id: 'usr-operator-agnihotri',
    operatorId: 'OPR-IN-2026-002',
    name: 'Dr. R. K. Agnihotri',
    email: 'rk.agnihotri@focuspoint.internal',
    mobile: '9811223344',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    address: 'Connaught Place HQ, Education Wing',
    state: 'Delhi',
    district: 'New Delhi',
    qualification: 'Ph.D. in Physics, Retd. University Dean',
    experience: '12+ Years JEE Advanced & NEET Paper Setter',
    appointmentDate: '2026-08-15',
    status: 'ACTIVE',
    role: 'STUDY_MATERIAL_OPERATOR',
    notes: 'Head of Pre-Medical and Engineering Entrance Exam Modules.',
    permissions: [
      'view_study_material', 'upload_study_material', 'edit_study_material', 'publish_study_material',
      'view_mock_tests', 'create_mock_test', 'manage_question_bank', 'generate_questions_ai',
      'approve_ai_questions', 'manage_exam_patterns', 'ask_ai', 'generate_questions',
      'generate_mock_tests', 'ai_validation'
    ],
    assignedExams: ['JEE_MAIN', 'JEE_ADVANCED', 'NEET_UG', 'DELHI_CET'],
    stats: {
      materialsUploaded: 28,
      materialsPublished: 26,
      mockTestsCreated: 14,
      questionsCreated: 390,
      aiQuestionsGenerated: 240,
      questionsApproved: 232,
      questionsRejected: 8,
      materialViewsCount: 4120,
      materialDownloadsCount: 1750,
      mockTestAttemptsCount: 980,
      lastActiveAt: '2026-10-11T11:20:00Z'
    }
  },
  {
    id: 'usr-operator-pranav',
    operatorId: 'OPR-IN-2026-003',
    name: 'Er. Pranav Joshi',
    email: 'pranav.joshi@focuspoint.internal',
    mobile: '9822334455',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    address: 'FC Road, Pune Innovation Bureau',
    state: 'Maharashtra',
    district: 'Pune',
    qualification: 'M.Tech Computer Science, SPPU',
    experience: '6+ Years Digital Question Bank Digitizer & GATE Trainer',
    appointmentDate: '2026-09-01',
    status: 'ACTIVE',
    role: 'STUDY_MATERIAL_OPERATOR',
    notes: 'Oversees Computer Science, Technical Exams, and PYQ Optical Digitizer.',
    permissions: [
      'view_study_material', 'upload_study_material', 'edit_study_material',
      'view_mock_tests', 'create_mock_test', 'manage_question_bank', 'generate_questions_ai',
      'ask_ai', 'generate_questions', 'ai_duplicate_detection'
    ],
    assignedExams: ['GATE_CS', 'MHT_CET', 'SSC_JE'],
    stats: {
      materialsUploaded: 34,
      materialsPublished: 30,
      mockTestsCreated: 12,
      questionsCreated: 520,
      aiQuestionsGenerated: 380,
      questionsApproved: 350,
      questionsRejected: 30,
      materialViewsCount: 3890,
      materialDownloadsCount: 1460,
      mockTestAttemptsCount: 890,
      lastActiveAt: '2026-10-10T16:40:00Z'
    }
  },
  {
    id: 'usr-operator-ananya',
    operatorId: 'OPR-IN-2026-004',
    name: 'Ananya Sengupta',
    email: 'ananya.sengupta@focuspoint.internal',
    mobile: '9833445566',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    address: 'Salt Lake Sector 1, Academic Office',
    state: 'West Bengal',
    district: 'Kolkata',
    qualification: 'M.A. English & Political Science, Jadavpur University',
    experience: '8+ Years Civil Services & Humanities Curriculum Specialist',
    appointmentDate: '2026-09-10',
    status: 'ACTIVE',
    role: 'STUDY_MATERIAL_OPERATOR',
    notes: 'Directs General Studies, Current Affairs, and Language Comprehension.',
    permissions: [
      'view_study_material', 'upload_study_material', 'edit_study_material', 'publish_study_material',
      'view_mock_tests', 'create_mock_test', 'manage_question_bank', 'ask_ai', 'generate_explanations'
    ],
    assignedExams: ['UPSC_CSE', 'WBCS', 'SSC_CGL'],
    stats: {
      materialsUploaded: 22,
      materialsPublished: 20,
      mockTestsCreated: 9,
      questionsCreated: 310,
      aiQuestionsGenerated: 180,
      questionsApproved: 172,
      questionsRejected: 8,
      materialViewsCount: 2950,
      materialDownloadsCount: 1120,
      mockTestAttemptsCount: 650,
      lastActiveAt: '2026-10-10T14:15:00Z'
    }
  },
  {
    id: 'usr-operator-vikram',
    operatorId: 'OPR-IN-2026-005',
    name: 'Vikramaditya Rao',
    email: 'vikram.rao@focuspoint.internal',
    mobile: '9844556677',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    address: 'Kankarbagh, Eastern Zone Bureau',
    state: 'Bihar',
    district: 'Patna',
    qualification: 'M.Sc. Chemistry, B.Ed',
    experience: '5+ Years BPSC & State Exam Blueprint Setter',
    appointmentDate: '2026-09-15',
    status: 'INACTIVE',
    role: 'STUDY_MATERIAL_OPERATOR',
    notes: 'On sanctioned sabbatical; content responsibilities temporarily mapped to Varanasi hub.',
    permissions: [
      'view_study_material', 'view_mock_tests', 'manage_question_bank'
    ],
    assignedExams: ['BPSC_CCE', 'BIHAR_SI', 'NAVODAYA_PATNA'],
    stats: {
      materialsUploaded: 15,
      materialsPublished: 14,
      mockTestsCreated: 6,
      questionsCreated: 180,
      aiQuestionsGenerated: 90,
      questionsApproved: 85,
      questionsRejected: 5,
      materialViewsCount: 1420,
      materialDownloadsCount: 610,
      mockTestAttemptsCount: 430,
      lastActiveAt: '2026-10-02T11:00:00Z'
    }
  },
  {
    id: 'usr-operator-tariq',
    operatorId: 'OPR-IN-2026-006',
    name: 'Tariq Mansoor',
    email: 'tariq.mansoor@focuspoint.internal',
    mobile: '9855667788',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    address: 'Hazratganj Bureau, Lucknow',
    state: 'Uttar Pradesh',
    district: 'Lucknow',
    qualification: 'M.A. Modern History',
    experience: '4+ Years Historical Syllabus Reviewer',
    appointmentDate: '2026-09-18',
    status: 'SUSPENDED',
    role: 'STUDY_MATERIAL_OPERATOR',
    notes: 'Suspended pending investigation for unauthorized unvetted mock question revisions.',
    permissions: [
      'view_study_material'
    ],
    assignedExams: ['UP_POLICE', 'LEKHPAL'],
    stats: {
      materialsUploaded: 10,
      materialsPublished: 8,
      mockTestsCreated: 4,
      questionsCreated: 110,
      aiQuestionsGenerated: 80,
      questionsApproved: 65,
      questionsRejected: 15,
      materialViewsCount: 890,
      materialDownloadsCount: 380,
      mockTestAttemptsCount: 290,
      lastActiveAt: '2026-09-28T16:00:00Z'
    }
  },
  {
    id: 'usr-operator-meenakshi',
    operatorId: 'OPR-IN-2026-007',
    name: 'Meenakshi Sundaram',
    email: 'meenakshi.s@focuspoint.internal',
    mobile: '9866778899',
    avatarUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=200',
    address: 'Gopalpura Bypass, Coaching Hub',
    state: 'Rajasthan',
    district: 'Kota',
    qualification: 'M.Sc. Organic Chemistry, IIT Roorkee',
    experience: '9+ Years Elite Pre-Medical & NEET Chemistry Master',
    appointmentDate: '2026-09-25',
    status: 'ACTIVE',
    role: 'STUDY_MATERIAL_OPERATOR',
    notes: 'Lead for Chemistry Question Quality & AI Distractor Distillation.',
    permissions: [
      'view_study_material', 'upload_study_material', 'edit_study_material', 'publish_study_material',
      'view_mock_tests', 'create_mock_test', 'manage_question_bank', 'generate_questions_ai',
      'approve_ai_questions', 'ask_ai', 'generate_questions', 'ai_validation'
    ],
    assignedExams: ['KOTA_TALENT', 'NEET_UG', 'JEE_MAIN'],
    stats: {
      materialsUploaded: 31,
      materialsPublished: 29,
      mockTestsCreated: 15,
      questionsCreated: 460,
      aiQuestionsGenerated: 290,
      questionsApproved: 281,
      questionsRejected: 9,
      materialViewsCount: 4650,
      materialDownloadsCount: 1980,
      mockTestAttemptsCount: 1140,
      lastActiveAt: '2026-10-11T14:10:00Z'
    }
  },
  {
    id: 'usr-operator-arun',
    operatorId: 'OPR-IN-2026-008',
    name: 'Arun Kumar Patel',
    email: 'arun.patel@focuspoint.internal',
    mobile: '9877889900',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
    address: 'Arera Colony, Central Corridor Bureau',
    state: 'Madhya Pradesh',
    district: 'Bhopal',
    qualification: 'M.A. Public Administration & History',
    experience: '6+ Years MPPSC Syllabus Architect',
    appointmentDate: '2026-10-01',
    status: 'ACTIVE',
    role: 'STUDY_MATERIAL_OPERATOR',
    notes: 'Oversees Central India state civil services and competitive exams.',
    permissions: [
      'view_study_material', 'upload_study_material', 'edit_study_material',
      'view_mock_tests', 'create_mock_test', 'manage_question_bank', 'generate_questions_ai',
      'approve_ai_questions', 'ask_ai', 'generate_questions'
    ],
    assignedExams: ['MPPSC', 'MP_SUPER100', 'VYAPAM_PATWARI'],
    stats: {
      materialsUploaded: 19,
      materialsPublished: 17,
      mockTestsCreated: 7,
      questionsCreated: 240,
      aiQuestionsGenerated: 140,
      questionsApproved: 133,
      questionsRejected: 7,
      materialViewsCount: 2150,
      materialDownloadsCount: 870,
      mockTestAttemptsCount: 520,
      lastActiveAt: '2026-10-11T08:50:00Z'
    }
  }
];

export const DEFAULT_AI_ACTIVITY_LOGS: OperatorAiActivityLog[] = [
  {
    id: 'act-ai-001',
    timestamp: '2026-10-11T12:35:14Z',
    operatorId: 'usr-operator-sunita',
    operatorName: 'Sunita Verma',
    operatorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    targetExam: 'UPSSSC PET 2026',
    subject: 'Elementary Arithmetic',
    topic: 'Compound Interest & Depreciation',
    aiTask: 'QUESTION_GEN',
    modelUsed: 'Gemini 1.5 Flash',
    tokens: { prompt: 340, completion: 520, total: 860 },
    latencyMs: 310,
    costInr: 0.10,
    status: 'ACCEPTED',
    guardrailResult: 'PASSED',
    samplePromptSnippet: 'Generate 1 high-yield MCQ with formula-free intuitive explanation for UPSSSC PET difficulty level.',
    sampleGeneratedSnippet: 'A machine depreciates at 10% per annum. If current value is ₹81,000, find value 2 years ago.\n(A) ₹90,000  (B) ₹1,00,000*  (C) ₹98,000  (D) ₹1,05,000\nExplanation: Let value be P. P × 0.9 × 0.9 = 81,000 => P × 0.81 = 81,000 => P = ₹1,00,000.'
  },
  {
    id: 'act-ai-002',
    timestamp: '2026-10-11T11:20:45Z',
    operatorId: 'usr-operator-agnihotri',
    operatorName: 'Dr. R. K. Agnihotri',
    operatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    targetExam: 'JEE Advanced 2027',
    subject: 'Physics',
    topic: 'Rotational Dynamics & Rolling without Slipping',
    aiTask: 'QUESTION_GEN',
    modelUsed: 'Gemini 1.5 Pro',
    tokens: { prompt: 580, completion: 940, total: 1520 },
    latencyMs: 710,
    costInr: 0.23,
    status: 'ACCEPTED',
    guardrailResult: 'PASSED',
    samplePromptSnippet: 'Design a multi-concept rotational mechanics problem involving a hollow cylinder and a solid sphere on an incline with frictional torque.',
    sampleGeneratedSnippet: 'Consider a solid sphere and a thin cylindrical shell of equal mass M and radius R released from rest on an inclined plane of angle θ...',
    operatorEditSnippet: 'Refined coefficient of friction inequality from μ >= tanθ/3 to μ >= (2/7)tanθ to maintain strict JEE Advanced precision.'
  },
  {
    id: 'act-ai-003',
    timestamp: '2026-10-10T16:40:22Z',
    operatorId: 'usr-operator-pranav',
    operatorName: 'Er. Pranav Joshi',
    operatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    targetExam: 'GATE CS 2027',
    subject: 'Algorithms',
    topic: 'Shortest Path & Negative Weight Cycles',
    aiTask: 'QUESTION_GEN',
    modelUsed: 'Gemini 1.5 Flash',
    tokens: { prompt: 410, completion: 620, total: 1030 },
    latencyMs: 345,
    costInr: 0.12,
    status: 'MODIFIED_AND_ACCEPTED',
    guardrailResult: 'PASSED',
    samplePromptSnippet: 'Generate GATE level question on why Dijkstra fails with negative edge weights and compare with Bellman-Ford complexity.',
    sampleGeneratedSnippet: 'Let G=(V,E) contain exactly one directed edge with weight -3. Which condition guarantees Dijkstra termination with correct distances?',
    operatorEditSnippet: 'Added option (D) with DAG topological ordering edge case to test advanced candidates.'
  },
  {
    id: 'act-ai-004',
    timestamp: '2026-10-10T14:15:30Z',
    operatorId: 'usr-operator-ananya',
    operatorName: 'Ananya Sengupta',
    operatorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    targetExam: 'UPSC CSE 2027',
    subject: 'Indian Polity & Governance',
    topic: 'Constitutional Remedies & Writs (Art 32 vs 226)',
    aiTask: 'EXPLANATION',
    modelUsed: 'Gemini 1.5 Pro',
    tokens: { prompt: 620, completion: 1120, total: 1740 },
    latencyMs: 820,
    costInr: 0.26,
    status: 'ACCEPTED',
    guardrailResult: 'PASSED',
    samplePromptSnippet: 'Draft a comprehensive pedagogical breakdown of the territorial and functional reach of Quo-Warranto and Certiorari based on landmark Supreme Court rulings.',
    sampleGeneratedSnippet: 'Writ of Quo-Warranto is distinct because locus standi is relaxed—any citizen may approach the court even without direct personal injury...'
  },
  {
    id: 'act-ai-005',
    timestamp: '2026-10-11T14:10:05Z',
    operatorId: 'usr-operator-meenakshi',
    operatorName: 'Meenakshi Sundaram',
    operatorAvatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=200',
    targetExam: 'NEET UG 2027',
    subject: 'Physical Chemistry',
    topic: 'Chemical Equilibrium & Le Chatelier Principle',
    aiTask: 'DISTRACTOR_VERIFY',
    modelUsed: 'Gemma 4 Edge',
    tokens: { prompt: 280, completion: 180, total: 460 },
    latencyMs: 115,
    costInr: 0.00,
    status: 'ACCEPTED',
    guardrailResult: 'PASSED',
    samplePromptSnippet: 'Analyze 3 plausible student misconceptions for Haber Process ammonia yield upon adding inert gas at constant volume.',
    sampleGeneratedSnippet: 'At constant volume, addition of noble gas does not change partial pressures of reacting species. Hence equilibrium position remains unaffected. Misconception A is ruled out.'
  },
  {
    id: 'act-ai-006',
    timestamp: '2026-10-11T08:50:40Z',
    operatorId: 'usr-operator-arun',
    operatorName: 'Arun Kumar Patel',
    operatorAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
    targetExam: 'MPPSC State Services',
    subject: 'Madhya Pradesh History & Culture',
    topic: 'Bhimbetka Caves & Mesolithic Cave Paintings',
    aiTask: 'DIFFICULTY_CALIBRATE',
    modelUsed: 'Gemini 1.5 Pro',
    tokens: { prompt: 490, completion: 780, total: 1270 },
    latencyMs: 610,
    costInr: 0.19,
    status: 'ACCEPTED',
    guardrailResult: 'PASSED',
    samplePromptSnippet: 'Calibrate question difficulty regarding V. S. Wakankar discovery of Bhimbetka and UNESCO World Heritage inscription year (2003).',
    sampleGeneratedSnippet: 'Which archaeologist discovered the rock shelters of Bhimbetka in 1957? (A) Dr. Vishnu Shridhar Wakankar* (B) H. D. Sankalia (C) John Marshall (D) Alexander Cunningham.'
  },
  {
    id: 'act-ai-007',
    timestamp: '2026-09-28T16:00:10Z',
    operatorId: 'usr-operator-tariq',
    operatorName: 'Tariq Mansoor',
    operatorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    targetExam: 'UP Police Constable',
    subject: 'General Hindi',
    topic: 'Alankar & Chand',
    aiTask: 'QUESTION_GEN',
    modelUsed: 'Gemini 1.5 Flash',
    tokens: { prompt: 310, completion: 480, total: 790 },
    latencyMs: 290,
    costInr: 0.09,
    status: 'REJECTED',
    guardrailResult: 'WARNING_OVERRIDDEN',
    samplePromptSnippet: 'Generate Alankar identification question for Shlesh and Yamak distinction.',
    sampleGeneratedSnippet: 'कनक कनक ते सौ गुनी, मादकता अधिकाय... (Rejected due to duplicate occurrence in Question Bank Archive Q-1029).'
  },
  {
    id: 'act-ai-008',
    timestamp: '2026-10-02T11:00:55Z',
    operatorId: 'usr-operator-vikram',
    operatorName: 'Vikramaditya Rao',
    operatorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    targetExam: 'BPSC CCE 71st',
    subject: 'Bihar Special Geography',
    topic: 'Kosi River Flood Dynamics & Embankments',
    aiTask: 'QUESTION_GEN',
    modelUsed: 'Gemini 1.5 Flash',
    tokens: { prompt: 380, completion: 540, total: 920 },
    latencyMs: 320,
    costInr: 0.11,
    status: 'ACCEPTED',
    guardrailResult: 'PASSED',
    samplePromptSnippet: 'Draft BPSC standard question on course changes of River Kosi and Birpur barrage specifications.',
    sampleGeneratedSnippet: 'Known as the Sorrow of Bihar, Kosi river enters India near Bhimnagar. Where does it confluence with the Ganges? (A) Kursela, Katihar* (B) Manihari (C) Fatuha (D) Mokama.'
  }
];

const INITIAL_LOGS: OperatorActivityLog[] = [
  {
    id: 'log-014',
    operatorId: 'usr-operator-sunita',
    operatorName: 'Sunita Verma',
    action: 'MOCK_TEST_PUBLISH',
    entity: 'MOCK_TEST',
    entityId: 'mock-test-pet-2026-03',
    entityTitle: 'UPSSSC PET 2026 All-India Mega Mock Test 3',
    details: 'Sealed & published 100-question bilingual test with sectional cutoff timers and negative marking 0.25.',
    timestamp: '2026-10-14T05:30:00Z',
    metadata: { totalQuestions: 100, examCode: 'UPSSSC_PET', verificationSeal: 'SEAL-UP-8841' }
  },
  {
    id: 'log-013',
    operatorId: 'usr-operator-sunita',
    operatorName: 'Sunita Verma',
    action: 'AI_QUESTION_APPROVE',
    entity: 'QUESTION',
    entityId: 'q-up-pet-arith-401',
    entityTitle: 'Compound Interest Multi-Step Problem (Hindi/English)',
    details: 'Pedagogical audit passed: Verified formula derivation, verified Hindi translation accuracy, published to bank.',
    timestamp: '2026-10-14T04:15:00Z',
    metadata: { difficulty: 'MEDIUM', subject: 'Elementary Mathematics', pedagogicalScore: 98 }
  },
  {
    id: 'log-012',
    operatorId: 'usr-operator-sunita',
    operatorName: 'Sunita Verma',
    action: 'AI_QUESTION_GENERATE',
    entity: 'QUESTION',
    entityId: 'batch-ai-1014-01',
    entityTitle: 'UP Police Constable Logical Reasoning Batch',
    details: 'Triggered Gemini 2.5 Flash prompt: Generated 20 syllogism and direction sense questions with step-by-step hints.',
    timestamp: '2026-10-14T03:40:00Z',
    metadata: { batchSize: 20, promptTokens: 1420, completionTokens: 3890, model: 'gemini-2.5-flash' }
  },
  {
    id: 'log-011',
    operatorId: 'usr-operator-sunita',
    operatorName: 'Sunita Verma',
    action: 'LOGIN',
    entity: 'PROFILE',
    entityId: 'usr-operator-sunita',
    entityTitle: 'Operator Console Session Active',
    details: 'Authenticated via Bureau 2FA token. Client IP: 192.168.1.104 [Internal Exam Division LAN]. TLS 1.3 encrypted.',
    timestamp: '2026-10-14T03:00:00Z',
    metadata: { authMethod: 'PKI_MFA', ipEnclave: '192.168.1.104', tlsVersion: 'TLS_AES_256_GCM_SHA384' }
  },
  {
    id: 'log-010',
    operatorId: 'usr-operator-sunita',
    operatorName: 'Sunita Verma',
    action: 'MATERIAL_VERSION_ADD',
    entity: 'STUDY_MATERIAL',
    entityId: 'mat-001',
    entityTitle: 'UPSSSC PET Complete Quantitative Aptitude Formula Digest v2.4',
    details: 'Uploaded updated PDF chapter for Data Interpretation with shortcut charts and 2025 PYQ annotations.',
    timestamp: '2026-10-13T16:20:00Z',
    metadata: { version: '2.4', fileSizeBytes: 8420000, pages: 68 }
  },
  {
    id: 'log-009',
    operatorId: 'usr-operator-sunita',
    operatorName: 'Sunita Verma',
    action: 'QUESTION_UPDATE',
    entity: 'QUESTION',
    entityId: 'q-up-sci-904',
    entityTitle: 'Newtonian Gravity Gravitational Potential Distractor Fix',
    details: 'Corrected distractor Option C based on Cognitive Stumble Radar feedback (42% examinees confused sign convention).',
    timestamp: '2026-10-13T11:50:00Z',
    metadata: { fieldEdited: 'options.C.explanation', reason: 'Student Confusion Distractor' }
  },
  {
    id: 'log-008',
    operatorId: 'usr-operator-sunita',
    operatorName: 'Sunita Verma',
    action: 'MATERIAL_UPLOAD',
    entity: 'STUDY_MATERIAL',
    entityId: 'mat-chs-sci-02',
    entityTitle: 'BHU CHS Class 9 Science Quick Revision Mindmaps',
    details: 'Authored and uploaded high-resolution vector mindmaps for Cell Biology, Light Reflection, and Motion.',
    timestamp: '2026-10-12T15:10:00Z',
    metadata: { subject: 'Science', category: 'SECONDARY_SCHOOL', examId: 'CHS_BHU' }
  },
  {
    id: 'log-007',
    operatorId: 'usr-operator-sunita',
    operatorName: 'Sunita Verma',
    action: 'AI_QUESTION_REJECT',
    entity: 'QUESTION',
    entityId: 'q-ai-draft-088',
    entityTitle: 'Ambiguous Percentage Calculation AI Draft',
    details: 'Quarantined and rejected AI draft due to rounding ambiguity in distractor Option B. Added negative prompt rule.',
    timestamp: '2026-10-12T12:05:00Z',
    metadata: { rejectionCategory: 'AMBIGUOUS_DISTRACTOR', severity: 'MODERATE' }
  },
  {
    id: 'log-006',
    operatorId: 'usr-operator-sunita',
    operatorName: 'Sunita Verma',
    action: 'MOCK_TEST_CREATE',
    entity: 'MOCK_TEST',
    entityId: 'mock-test-chs-01',
    entityTitle: 'CHS Class 9 Entrance Rapid Mock 1',
    details: 'Configured new mock test blueprint with 100 questions, sectional weighting, and bilingual Hindi/English prompt toggle.',
    timestamp: '2026-10-11T10:05:00Z',
    metadata: { pattern: 'BHU_SET_V1', durationMinutes: 120 }
  },
  {
    id: 'log-005',
    operatorId: 'usr-operator-sunita',
    operatorName: 'Sunita Verma',
    action: 'MOCK_TEST_PUBLISH',
    entity: 'MOCK_TEST',
    entityId: 'mock-test-chs-01',
    entityTitle: 'CHS Class 9 Entrance Rapid Mock 1',
    details: 'Published 100-question comprehensive mock paper with BHU SET pattern compliance and anti-cheat randomize seeds.',
    timestamp: '2026-10-11T10:10:00Z',
    metadata: { status: 'PUBLISHED', attemptQuota: 'UNLIMITED' }
  },
  {
    id: 'log-004',
    operatorId: 'usr-operator-sunita',
    operatorName: 'Sunita Verma',
    action: 'AI_QUESTION_GENERATE',
    entity: 'QUESTION',
    entityId: 'batch-ai-0922',
    entityTitle: 'UP PET Elementary Arithmetic Batch',
    details: 'Generated 25 AI questions for Percentage and Fractions with high pedagogical explanation quality.',
    timestamp: '2026-10-11T09:45:00Z',
    metadata: { batchId: 'batch-ai-0922', count: 25 }
  },
  {
    id: 'log-003',
    operatorId: 'usr-operator-sunita',
    operatorName: 'Sunita Verma',
    action: 'QUESTION_CREATE',
    entity: 'QUESTION',
    entityId: 'q-math-latex-101',
    entityTitle: 'Quadratic Roots with Real Coefficients and Discriminant Proof',
    details: 'Created master question with KaTeX LaTeX rendering and step-by-step Hindi pedagogical proof breakdown.',
    timestamp: '2026-10-11T09:38:00Z',
    metadata: { hasLatex: true, language: 'BILINGUAL' }
  },
  {
    id: 'log-002',
    operatorId: 'usr-operator-sunita',
    operatorName: 'Sunita Verma',
    action: 'MATERIAL_ARCHIVE',
    entity: 'STUDY_MATERIAL',
    entityId: 'mat-old-pet-2023',
    entityTitle: 'Outdated 2023 UP PET Syllabus Brief',
    details: 'Decommissioned and archived obsolete 2023 material following Government notification 2026-C4.',
    timestamp: '2026-10-11T09:32:00Z',
    metadata: { archiveReason: 'SUPERSEDED_BY_2026_NOTIFICATION' }
  },
  {
    id: 'log-001',
    operatorId: 'usr-operator-sunita',
    operatorName: 'Sunita Verma',
    action: 'LOGIN',
    entity: 'PROFILE',
    entityId: 'usr-operator-sunita',
    entityTitle: 'Operator Console Session',
    details: 'Signed into Pan-India Exam & Study Material Command Center',
    timestamp: '2026-10-11T09:30:00Z',
    metadata: { ip: '192.168.1.104' }
  }
];

class OperatorService {
  private operators: StudyMaterialOperator[] = [];
  private logs: OperatorActivityLog[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const storedOps = safeStorage.getItem(OPERATORS_STORAGE_KEY);
      if (storedOps) {
        const parsed = JSON.parse(storedOps);
        if (Array.isArray(parsed) && parsed.length >= 4) {
          this.operators = parsed;
        } else {
          const existingIds = new Set(parsed.map((p: any) => p.id));
          const missing = DEFAULT_PAN_INDIA_OPERATORS.filter(o => !existingIds.has(o.id));
          this.operators = [...parsed, ...missing];
          safeStorage.setItem(OPERATORS_STORAGE_KEY, JSON.stringify(this.operators));
        }
      } else {
        this.operators = DEFAULT_PAN_INDIA_OPERATORS;
        safeStorage.setItem(OPERATORS_STORAGE_KEY, JSON.stringify(this.operators));
      }

      const storedLogs = safeStorage.getItem(OPERATOR_LOGS_STORAGE_KEY);
      if (storedLogs) {
        const parsedLogs = JSON.parse(storedLogs);
        if (Array.isArray(parsedLogs) && parsedLogs.length >= INITIAL_LOGS.length) {
          this.logs = parsedLogs;
        } else {
          this.logs = INITIAL_LOGS;
          safeStorage.setItem(OPERATOR_LOGS_STORAGE_KEY, JSON.stringify(this.logs));
        }
      } else {
        this.logs = INITIAL_LOGS;
        safeStorage.setItem(OPERATOR_LOGS_STORAGE_KEY, JSON.stringify(this.logs));
      }
    } catch {
      this.operators = DEFAULT_PAN_INDIA_OPERATORS;
      this.logs = INITIAL_LOGS;
    }
  }

  private saveToStorage() {
    try {
      safeStorage.setItem(OPERATORS_STORAGE_KEY, JSON.stringify(this.operators));
      safeStorage.setItem(OPERATOR_LOGS_STORAGE_KEY, JSON.stringify(this.logs));
    } catch (e) {
      console.error('Failed to persist operator data', e);
    }
  }

  // Retrieve all appointed operators
  async getOperators(): Promise<StudyMaterialOperator[]> {
    return [...this.operators];
  }

  // Retrieve operator by ID
  async getOperatorById(id: string): Promise<StudyMaterialOperator | null> {
    return this.operators.find(o => o.id === id || o.operatorId === id) || null;
  }

  // Appoint new Operator (Super Admin action)
  async appointOperator(data: Omit<StudyMaterialOperator, 'id' | 'operatorId' | 'stats' | 'status' | 'role'>): Promise<StudyMaterialOperator> {
    const nextSeq = String(this.operators.length + 1).padStart(3, '0');
    const operatorId = `OPR-IN-${new Date().getFullYear()}-${nextSeq}`;
    const id = `usr-operator-${Date.now()}`;

    const newOperator: StudyMaterialOperator = {
      ...data,
      id,
      operatorId,
      status: 'ACTIVE',
      role: 'STUDY_MATERIAL_OPERATOR',
      stats: {
        materialsUploaded: 0,
        materialsPublished: 0,
        mockTestsCreated: 0,
        questionsCreated: 0,
        aiQuestionsGenerated: 0,
        questionsApproved: 0,
        questionsRejected: 0,
        materialViewsCount: 0,
        materialDownloadsCount: 0,
        mockTestAttemptsCount: 0,
        lastActiveAt: new Date().toISOString()
      }
    };

    this.operators.unshift(newOperator);
    this.saveToStorage();

    await this.logActivity({
      operatorId: newOperator.id,
      operatorName: newOperator.name,
      action: 'PERMISSION_UPDATE',
      entity: 'PROFILE',
      entityId: newOperator.id,
      entityTitle: newOperator.name,
      details: `Appointed as Pan-India Study Material & Mock Test Operator with ${newOperator.permissions.length} granular permissions`
    });

    return newOperator;
  }

  // Update Operator Profile & Permissions
  async updateOperator(id: string, updates: Partial<StudyMaterialOperator>): Promise<StudyMaterialOperator | null> {
    const idx = this.operators.findIndex(o => o.id === id || o.operatorId === id);
    if (idx === -1) return null;

    this.operators[idx] = {
      ...this.operators[idx],
      ...updates,
      id: this.operators[idx].id,
      operatorId: this.operators[idx].operatorId, // immutable system ID
      role: 'STUDY_MATERIAL_OPERATOR'
    };

    this.saveToStorage();
    return this.operators[idx];
  }

  // Update Operator Status (Super Admin action)
  async setOperatorStatus(id: string, status: OperatorStatus, reason?: string): Promise<boolean> {
    const op = await this.getOperatorById(id);
    if (!op) return false;

    op.status = status;
    this.saveToStorage();

    await this.logActivity({
      operatorId: op.id,
      operatorName: op.name,
      action: 'STATUS_CHANGE',
      entity: 'PROFILE',
      entityId: op.id,
      entityTitle: op.name,
      details: `Status transitioned to ${status}${reason ? `. Reason: ${reason}` : ''}`
    });

    return true;
  }

  // Content Reassignment (Super Admin action when operator is deactivated/leaves)
  async reassignContent(fromOperatorId: string, toOperatorId: string, notes?: string): Promise<{ success: boolean; reassignedCount: number }> {
    const fromOp = await this.getOperatorById(fromOperatorId);
    const toOp = await this.getOperatorById(toOperatorId);

    if (!fromOp || !toOp) {
      return { success: false, reassignedCount: 0 };
    }

    // Transfer stats counters
    const transferredMaterials = fromOp.stats.materialsUploaded;
    toOp.stats.materialsUploaded += transferredMaterials;
    toOp.stats.mockTestsCreated += fromOp.stats.mockTestsCreated;
    toOp.stats.questionsCreated += fromOp.stats.questionsCreated;

    fromOp.notes = `${fromOp.notes || ''} [Content reassigned to ${toOp.name} (${toOp.operatorId}) on ${new Date().toLocaleDateString()}: ${notes || 'Staff transition'}]`;

    this.saveToStorage();

    await this.logActivity({
      operatorId: toOp.id,
      operatorName: toOp.name,
      action: 'MATERIAL_EDIT',
      entity: 'STUDY_MATERIAL',
      entityId: fromOp.id,
      entityTitle: `Content transfer from ${fromOp.name}`,
      details: `Reassigned ${transferredMaterials} study materials and question assets from ${fromOp.name} (${fromOp.operatorId}) to ${toOp.name}`
    });

    return { success: true, reassignedCount: transferredMaterials + fromOp.stats.mockTestsCreated };
  }

  // Log an operator action
  async logActivity(item: Omit<OperatorActivityLog, 'id' | 'timestamp'>): Promise<OperatorActivityLog> {
    const log: OperatorActivityLog = {
      ...item,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString()
    };

    this.logs.unshift(log);
    if (this.logs.length > 500) this.logs.pop();
    this.saveToStorage();
    return log;
  }

  // Get Activity Logs
  async getActivityLogs(operatorId?: string): Promise<OperatorActivityLog[]> {
    if (operatorId) {
      return this.logs.filter(l => l.operatorId === operatorId);
    }
    return [...this.logs];
  }

  // Get Operator Content Metrics (Strictly non-financial)
  async getOperatorContentMetrics(operatorId: string): Promise<OperatorContentMetrics> {
    const op = await this.getOperatorById(operatorId) || INITIAL_OPERATOR;
    const studyMaterials = mockStore.getStudyMaterials();
    const mockTests = mockStore.getMockTests();
    const questions = mockStore.getQuestionBank();

    const publishedMaterials = studyMaterials.filter(m => m.status === 'PUBLISHED').length;
    const draftMaterials = studyMaterials.filter(m => m.status === 'DRAFT').length;

    const publishedTests = mockTests.filter(t => t.status === 'PUBLISHED').length;
    const draftTests = mockTests.filter(t => t.status === 'DRAFT').length;

    const approvedQuestions = questions.filter(q => q.status === 'APPROVED' || q.status === 'PUBLISHED').length;
    const pendingQuestions = questions.filter(q => q.status === 'UNDER_REVIEW' || q.status === 'AI_GENERATED').length;
    const aiQuestions = questions.filter(q => q.source === 'AI_GENERATED').length;
    const rejectedQuestions = questions.filter(q => q.status === 'REJECTED').length;

    const totalViews = studyMaterials.reduce((sum, m) => sum + (m.totalDownloads * 2.5), 1850);
    const totalDownloads = studyMaterials.reduce((sum, m) => sum + m.totalDownloads, 780);
    const totalAttempts = mockTests.reduce((sum, t) => sum + t.attemptCount, 540);

    const rejectionRate = aiQuestions > 0 ? Number(((rejectedQuestions / aiQuestions) * 100).toFixed(1)) : 3.8;

    return {
      totalMaterials: studyMaterials.length,
      publishedMaterials,
      draftMaterials,
      underReviewMaterials: 4,
      archivedMaterials: 2,

      totalMockTests: mockTests.length,
      publishedMockTests: publishedTests,
      draftMockTests: draftTests,
      scheduledMockTests: 2,

      totalQuestions: questions.length,
      approvedQuestions,
      pendingQuestions,
      aiGeneratedQuestions: aiQuestions,
      rejectedQuestions,

      totalViews: Math.round(totalViews),
      totalDownloads,
      totalAttempts,
      rejectionRate,

      topMaterials: studyMaterials.slice(0, 5).map(m => ({
        id: m.id,
        title: m.title,
        views: Math.round(m.totalDownloads * 2.8),
        downloads: m.totalDownloads,
        subject: m.subject
      })),

      topMockTests: mockTests.slice(0, 5).map(t => ({
        id: t.id,
        title: t.title,
        examName: t.examName,
        attempts: t.attemptCount,
        averageScore: 68.5
      }))
    };
  }

  // Super Admin: Study Material Business Intelligence (Financial calculations)
  async getSuperAdminStudyMaterialBI(): Promise<SuperAdminStudyMaterialBI> {
    const studyMaterials = mockStore.getStudyMaterials();
    const purchases = mockStore.getStudyMaterialPurchases ? mockStore.getStudyMaterialPurchases() : [];

    let totalGrossSales = 0;
    let totalUnitsSold = 0;
    let totalDiscounts = 0;
    let totalRefunds = 480;

    purchases.forEach((p: any) => {
      totalGrossSales += p.amount || 0;
      totalUnitsSold += 1;
      if (p.discountAmount) totalDiscounts += p.discountAmount;
    });

    if (totalGrossSales === 0) {
      // Authentic baseline from initial seed items
      totalGrossSales = 46800;
      totalUnitsSold = 312;
      totalDiscounts = 5200;
      totalRefunds = 750;
    }

    const netRevenue = totalGrossSales - totalRefunds;

    return {
      totalGrossSales,
      totalUnitsSold,
      activePaidMaterials: studyMaterials.filter(m => m.isPaid).length,
      totalFreeMaterials: studyMaterials.filter(m => !m.isPaid).length,
      totalDiscounts,
      totalRefunds,
      netRevenue,
      salesByExam: [
        { exam: 'SSC CGL', units: 110, revenue: 16500 },
        { exam: 'UP PET', units: 85, revenue: 11900 },
        { exam: 'RRB NTPC', units: 62, revenue: 9300 },
        { exam: 'CHS & Navodaya', units: 40, revenue: 6000 },
        { exam: 'UP TET', units: 15, revenue: 3100 }
      ],
      salesByState: [
        { state: 'Uttar Pradesh', revenue: 29500 },
        { state: 'Bihar', revenue: 8400 },
        { state: 'Madhya Pradesh', revenue: 4900 },
        { state: 'Delhi NCR', revenue: 4000 }
      ],
      salesByDistrict: [
        { district: 'Ghazipur', revenue: 14200 },
        { district: 'Varanasi', revenue: 9800 },
        { district: 'Ballia', revenue: 5500 },
        { district: 'Gorakhpur', revenue: 4100 },
        { district: 'Patna', revenue: 3900 }
      ],
      monthlyRevenueTrend: [
        { month: 'Apr 2026', sales: 42, revenue: 6300 },
        { month: 'May 2026', sales: 58, revenue: 8700 },
        { month: 'Jun 2026', sales: 65, revenue: 9750 },
        { month: 'Jul 2026', sales: 72, revenue: 10800 },
        { month: 'Aug 2026', sales: 75, revenue: 11250 }
      ],
      topSellingMaterials: studyMaterials.slice(0, 5).map((m, idx) => ({
        id: m.id,
        title: m.title,
        unitsSold: 45 - (idx * 6),
        revenue: (45 - (idx * 6)) * (m.basePrice || 149),
        price: m.basePrice || 149
      }))
    };
  }

  // Super Admin: Mock Test Business Intelligence
  async getSuperAdminMockTestBI(): Promise<SuperAdminMockTestBI> {
    return {
      activeSubscriptions: 480,
      totalSubscriptions: 610,
      newSubscriptionsThisMonth: 95,
      renewalsThisMonth: 140,
      expiredSubscriptions: 85,
      cancelledSubscriptions: 15,
      grossSubscriptionRevenue: 124500,
      totalRefunds: 2400,
      netSubscriptionRevenue: 122100,
      totalAttemptsPlatformWide: 8940,
      subscriptionsByExam: [
        { exam: 'SSC CGL Pro Pass', count: 210, revenue: 52500 },
        { exam: 'UP PET Booster Pass', count: 145, revenue: 36250 },
        { exam: 'Railways NTPC Pass', count: 125, revenue: 31250 },
        { exam: 'BHU CHS School Entrance', count: 80, revenue: 16000 }
      ],
      regionalDemand: [
        { state: 'Uttar Pradesh', activeUsers: 340, testAttempts: 5900 },
        { state: 'Bihar', activeUsers: 110, testAttempts: 1850 },
        { state: 'Madhya Pradesh', activeUsers: 30, testAttempts: 680 }
      ],
      topAttemptedTests: [
        { id: 'mock-test-ssc-01', title: 'SSC CGL Tier-1 All-India Mock 1', examName: 'SSC CGL', attempts: 3420 },
        { id: 'mock-test-up-pet-01', title: 'UPSSSC PET Full Length Practice Mock 1', examName: 'UP PET', attempts: 2680 },
        { id: 'mock-test-ntpc-01', title: 'RRB NTPC Stage 1 CBT Grand Test', examName: 'RRB NTPC', attempts: 1840 }
      ]
    };
  }

  // Super Admin: Operator Monitoring & AI Cost Tracking
  getAiQuotaConfig(operatorId: string): OperatorAiQuotaConfig {
    try {
      const stored = safeStorage.getItem(AI_QUOTAS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed[operatorId]) return parsed[operatorId];
      }
    } catch (e) {
      console.error(e);
    }
    return {
      operatorId,
      monthlyTokenLimit: 500000,
      rateLimitPerMinute: 25,
      allowedModels: ['Gemini 1.5 Flash', 'Gemini 1.5 Pro', 'Gemma 4 Edge'],
      autoFreezeOnExhaustion: true,
      temperatureCap: 0.7,
      requireHumanReview: true
    };
  }

  async updateOperatorAiQuota(operatorId: string, quota: Partial<OperatorAiQuotaConfig>): Promise<boolean> {
    try {
      const current = this.getAiQuotaConfig(operatorId);
      const updated = { ...current, ...quota, operatorId };
      const stored = safeStorage.getItem(AI_QUOTAS_STORAGE_KEY);
      const allQuotas = stored ? JSON.parse(stored) : {};
      allQuotas[operatorId] = updated;
      safeStorage.setItem(AI_QUOTAS_STORAGE_KEY, JSON.stringify(allQuotas));
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  isOperatorAiSuspended(operatorId: string): boolean {
    try {
      const stored = safeStorage.getItem(AI_SUSPENSIONS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed[operatorId] === 'boolean') {
          return parsed[operatorId];
        }
      }
    } catch (e) {
      console.error(e);
    }
    return operatorId === 'usr-operator-tariq';
  }

  async toggleOperatorAiAccess(operatorId: string, suspended: boolean): Promise<boolean> {
    try {
      const stored = safeStorage.getItem(AI_SUSPENSIONS_STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : {};
      parsed[operatorId] = suspended;
      safeStorage.setItem(AI_SUSPENSIONS_STORAGE_KEY, JSON.stringify(parsed));
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  async getOperatorAiActivityLogs(): Promise<OperatorAiActivityLog[]> {
    try {
      const stored = safeStorage.getItem(AI_LOGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_AI_ACTIVITY_LOGS;
  }

  async getAiModelTelemetrySummaries(): Promise<AiModelTelemetrySummary[]> {
    return [
      {
        modelName: 'gemini-1.5-flash',
        displayName: 'Gemini 1.5 Flash (Fast MCQ Copilot)',
        sharePercent: 68,
        totalTokens: 1480000,
        costPer1kTokensInr: 0.02,
        avgLatencyMs: 310,
        totalRequests: 1420,
        color: '#06b6d4'
      },
      {
        modelName: 'gemini-1.5-pro',
        displayName: 'Gemini 1.5 Pro (Deep STEM & Reasoning)',
        sharePercent: 27,
        totalTokens: 1120000,
        costPer1kTokensInr: 0.15,
        avgLatencyMs: 690,
        totalRequests: 490,
        color: '#8b5cf6'
      },
      {
        modelName: 'gemma-4-edge',
        displayName: 'Gemma 4 Edge (Local Distractor Verifier)',
        sharePercent: 5,
        totalTokens: 160000,
        costPer1kTokensInr: 0.00,
        avgLatencyMs: 110,
        totalRequests: 210,
        color: '#10b981'
      }
    ];
  }

  async getSuperAdminOperatorMonitoring(): Promise<SuperAdminOperatorMonitoringMetric[]> {
    return this.operators.map(op => {
      const generated = op.stats.aiQuestionsGenerated || 280;
      const approved = op.stats.questionsApproved || 265;
      const rejected = op.stats.questionsRejected || 15;
      const rate = generated > 0 ? Number(((rejected / generated) * 100).toFixed(1)) : 4.5;
      const promptTok = Math.round(generated * 320);
      const compTok = Math.round(generated * 530);
      const tokens = promptTok + compTok;
      const estimatedCost = Number(((tokens / 1000) * 0.11).toFixed(2));

      const quota = this.getAiQuotaConfig(op.id);
      const isSuspended = this.isOperatorAiSuspended(op.id) || op.status === 'SUSPENDED';
      const quotaLimit = quota.monthlyTokenLimit || 500000;
      const quotaUsedPct = Math.min(100, Math.round((tokens / quotaLimit) * 100));

      const isSTEM = op.qualification.toLowerCase().includes('physics') || op.qualification.toLowerCase().includes('chemistry');
      const isTech = op.qualification.toLowerCase().includes('computer');
      const modelPref: 'Gemini 1.5 Pro' | 'Gemini 1.5 Flash' | 'Hybrid (Pro + Flash)' = 
        isSTEM ? 'Gemini 1.5 Pro' : isTech ? 'Hybrid (Pro + Flash)' : 'Gemini 1.5 Flash';
      const avgLatency = isSTEM ? 680 : isTech ? 480 : 320;
      const hitlScore = Math.max(70, Math.min(99, Math.round(100 - (rate * 1.3) + (approved > 200 ? 4 : 0))));
      const humanEditPct = op.id === 'usr-operator-pranav' ? 14 : op.id === 'usr-operator-agnihotri' ? 8 : op.id === 'usr-operator-sunita' ? 5 : 9;

      return {
        operatorId: op.id,
        operatorName: op.name,
        systemId: op.operatorId,
        avatarUrl: op.avatarUrl,
        status: op.status,
        materialsCreated: op.stats.materialsUploaded,
        mockTestsCreated: op.stats.mockTestsCreated,
        questionsCreated: op.stats.questionsCreated,
        aiQuestionsGenerated: generated,
        questionsApproved: approved,
        rejectionRate: rate,
        totalViewsGenerated: op.stats.materialViewsCount,
        totalAttemptsGenerated: op.stats.mockTestAttemptsCount,
        aiTokensUsed: tokens,
        estimatedAiCost: estimatedCost,
        lastActive: op.stats.lastActiveAt,

        state: op.state,
        district: op.district,
        assignedExams: op.assignedExams,
        aiModelPreference: modelPref,
        promptTokens: promptTok,
        completionTokens: compTok,
        avgInferenceLatencyMs: avgLatency,
        humanEditDistancePercent: humanEditPct,
        monthlyTokenQuota: quotaLimit,
        tokenQuotaUsedPercent: quotaUsedPct,
        hitlQualityScore: hitlScore,
        guardrailFlagsCount: op.id === 'usr-operator-tariq' ? 2 : 0,
        aiGenerationRatePerHour: Math.round(generated / 12),
        isAiAccessSuspended: isSuspended,
        rateLimitPerMinute: quota.rateLimitPerMinute || 25,
        temperatureCap: quota.temperatureCap || 0.7
      };
    });
  }
}

export const operatorService = new OperatorService();
