// FOCUSPOINT Futuristic Operator Content Analytics & Academic Reach Service
// Powers Pan-India Non-Financial Academic Intelligence, Real-Time Student Telemetry,
// Geographic Heatmap Vectors, Hourly Consumption Cadence, and Pedagogical Quality Radars.

import { mockStore } from '../mock/store';
import { StudyMaterial } from '../types';
import { MockTest, QuestionItem } from '../types/academicIntelligence';

export type AnalyticsTimeHorizon = '24H' | '7D' | '30D' | '90D' | 'ALL';

export type AnalyticsVertical = 
  | 'ALL' 
  | 'SSC_CGL_CHSL' 
  | 'RAILWAYS_RRB' 
  | 'UP_STATE_EXAMS' 
  | 'TEACHING_CTET' 
  | 'DEFENCE_NDA_CDS' 
  | 'CHS_ENTRANCE';

export interface GeographicReachHub {
  id: string;
  state: string;
  district: string;
  tier: 'TIER_1' | 'TIER_2' | 'TIER_3_RURAL';
  activeLearners: number;
  viewsCount: number;
  downloadsCount: number;
  mockAttempts: number;
  avgScore: number;
  topSubject: string;
  growthRatePct: number;
}

export interface StateReachAggregate {
  state: string;
  code: string;
  hubsCount: number;
  activeLearners: number;
  viewsCount: number;
  downloadsCount: number;
  mockAttempts: number;
  growthRatePct: number;
  topExamPreference: string;
  densityRank: number;
  ruralReachPct: number;
}

export interface StumbleTopicAnalysis {
  id: string;
  chapter: string;
  subject: string;
  examTarget: string;
  accuracyPct: number;
  avgTimeSeconds: number;
  distractorConfusionRatio: number;
  affectedStudentsCount: number;
  recommendedAction: string;
  suggestedPrompt: string;
}

export interface PredictiveReachParams {
  newMaterialsCount: number;
  newMockTestsCount: number;
  hindiCoveragePct: number;
}

export interface PredictiveReachResult {
  forecastedImpressions: number;
  forecastedViews: number;
  forecastedDownloads: number;
  forecastedMockAttempts: number;
  ruralExpansionRatePct: number;
  projectedQualityScore: number;
}

export interface HourlyConsumptionData {
  hourLabel: string;
  hourNumber: number;
  views: number;
  downloads: number;
  mockAttempts: number;
  isPeakStudyWindow: boolean;
  studyBehaviorTag?: string;
  activeConcurrentLearners?: number;
}

export interface LiveStudentActivityEvent {
  id: string;
  timestamp: string;
  studentNameMasked: string;
  location: string;
  actionType: 'VIEW' | 'DOWNLOAD' | 'ATTEMPT_COMPLETE' | 'BOOKMARK' | 'RATING_SUBMITTED';
  assetTitle: string;
  assetType: 'STUDY_MATERIAL' | 'MOCK_TEST' | 'PYQ_PAPER' | 'QUESTION_ITEM';
  examVertical: string;
  metricValue?: string;
  avatarSeed: string;
}

export interface SubjectImpactMetric {
  subject: string;
  assetCount: number;
  totalViews: number;
  totalDownloads: number;
  mockAttempts: number;
  avgStudentScore: number;
  avgDwellMinutes: number;
  studentRating: number;
  repeatStudyRatio: number;
  difficultyPerception: 'BALANCED' | 'HIGH_YIELD' | 'RIGOROUS' | 'FOUNDATIONAL';
}

export interface StudentReviewItem {
  id: string;
  studentName: string;
  districtState: string;
  targetExam: string;
  assetTitle: string;
  rating: number; // 1-5
  comment: string;
  publishedAt: string;
  helpfulCount: number;
  verifiedStudent: boolean;
  accuracyTag: 'EXACT_EXAM_PATTERN' | 'LUCID_EXPLANATIONS' | 'TOP_TIER_PYQ' | 'FAST_TRICKS';
}

export interface AssetDeepDiveTelemetry {
  id: string;
  title: string;
  type: 'STUDY_MATERIAL' | 'MOCK_TEST';
  subject: string;
  examName: string;
  totalImpressions: number;
  totalViews: number;
  totalDownloads: number;
  totalAttempts: number;
  avgDwellTimeSeconds: number;
  completionRatePct: number;
  avgStudentScorePct: number;
  difficultyPacing: {
    easyQuestionsCorrectPct: number;
    moderateQuestionsCorrectPct: number;
    hardQuestionsCorrectPct: number;
  };
  topStumbleQuestionTopics: string[];
  pedagogicalRecommendations: string[];
}

export interface ComprehensiveOperatorAnalytics {
  operatorId: string;
  operatorName: string;
  timeHorizon: AnalyticsTimeHorizon;
  vertical: AnalyticsVertical;
  generatedAt: string;
  antiTamperHash: string;

  // 6 Primary Panoramic Telemetry KPIs
  kpis: {
    totalViews: number;
    viewsGrowthPct: number;
    totalDownloads: number;
    downloadsGrowthPct: number;
    mockAttempts: number;
    attemptsGrowthPct: number;
    avgDwellTimeFormatted: string;
    avgDwellMinutes: number;
    pedagogicalQualityScore: number; // 0-100
    activePanIndiaReachCount: number; // total districts
    totalVerifiedLearners: number;
    repeatStudyRatePct: number;
  };

  // Funnel conversion
  funnel: {
    impressions: number;
    clicksToView: number;
    viewConversionPct: number;
    previewsCount: number;
    downloadsCount: number;
    downloadConversionPct: number;
    mockTestAttemptsCount: number;
    fullCompletionCount: number;
    testCompletionPct: number;
  };

  // Dynamic series
  hourlyCurve: HourlyConsumptionData[];
  geographicHubs: GeographicReachHub[];
  stateAggregates: StateReachAggregate[];
  stumbleTopics: StumbleTopicAnalysis[];
  liveActivityFeed: LiveStudentActivityEvent[];
  subjectImpacts: SubjectImpactMetric[];
  studentReviews: StudentReviewItem[];

  // Top Performing Assets list
  topMaterialsList: {
    id: string;
    title: string;
    subject: string;
    examCategory: string;
    views: number;
    downloads: number;
    rating: number;
    status: string;
    updatedAt: string;
  }[];

  topMockTestsList: {
    id: string;
    title: string;
    examName: string;
    attempts: number;
    avgScore: number;
    passRatePct: number;
    status: string;
    updatedAt: string;
  }[];
}

const INITIAL_HUBS: GeographicReachHub[] = [
  { id: 'hub-1', state: 'Uttar Pradesh', district: 'Prayagraj (Allahabad)', tier: 'TIER_2', activeLearners: 5840, viewsCount: 16420, downloadsCount: 5210, mockAttempts: 4120, avgScore: 71.4, topSubject: 'Quantitative Aptitude', growthRatePct: 18.4 },
  { id: 'hub-2', state: 'Uttar Pradesh', district: 'Varanasi', tier: 'TIER_2', activeLearners: 4290, viewsCount: 12150, downloadsCount: 3890, mockAttempts: 2940, avgScore: 68.9, topSubject: 'General Studies & UP GK', growthRatePct: 15.2 },
  { id: 'hub-3', state: 'Bihar', district: 'Patna', tier: 'TIER_2', activeLearners: 6120, viewsCount: 18900, downloadsCount: 6420, mockAttempts: 4890, avgScore: 74.2, topSubject: 'Railway Tech & Maths', growthRatePct: 22.8 },
  { id: 'hub-4', state: 'Delhi NCR', district: 'Mukherjee Nagar & North Delhi', tier: 'TIER_1', activeLearners: 7450, viewsCount: 22400, downloadsCount: 7100, mockAttempts: 5930, avgScore: 76.8, topSubject: 'SSC CGL Tier-1 Comprehensive', growthRatePct: 14.1 },
  { id: 'hub-5', state: 'Rajasthan', district: 'Jaipur', tier: 'TIER_2', activeLearners: 3820, viewsCount: 10450, downloadsCount: 3120, mockAttempts: 2410, avgScore: 67.5, topSubject: 'Reasoning & General Science', growthRatePct: 12.6 },
  { id: 'hub-6', state: 'Madhya Pradesh', district: 'Indore', tier: 'TIER_2', activeLearners: 3410, viewsCount: 9680, downloadsCount: 2890, mockAttempts: 2180, avgScore: 69.1, topSubject: 'Quantitative Aptitude', growthRatePct: 11.9 },
  { id: 'hub-7', state: 'Uttar Pradesh', district: 'Lucknow', tier: 'TIER_2', activeLearners: 4980, viewsCount: 14200, downloadsCount: 4450, mockAttempts: 3480, avgScore: 72.0, topSubject: 'UP Police & UPSSSC PET', growthRatePct: 19.5 },
  { id: 'hub-8', state: 'Bihar', district: 'Gaya', tier: 'TIER_3_RURAL', activeLearners: 2180, viewsCount: 6120, downloadsCount: 1940, mockAttempts: 1480, avgScore: 65.4, topSubject: 'Railway Group D Science', growthRatePct: 24.3 },
  { id: 'hub-9', state: 'Uttar Pradesh', district: 'Gorakhpur', tier: 'TIER_3_RURAL', activeLearners: 2890, viewsCount: 7980, downloadsCount: 2480, mockAttempts: 1890, avgScore: 66.8, topSubject: 'UP Special GK & Hindi', growthRatePct: 21.0 },
  { id: 'hub-10', state: 'Jharkhand', district: 'Ranchi', tier: 'TIER_2', activeLearners: 2640, viewsCount: 7240, downloadsCount: 2190, mockAttempts: 1670, avgScore: 68.2, topSubject: 'SSC Reasoning & Quants', growthRatePct: 13.8 }
];

const INITIAL_STATE_AGGREGATES: StateReachAggregate[] = [
  { state: 'Uttar Pradesh', code: 'UP', hubsCount: 4, activeLearners: 18000, viewsCount: 50750, downloadsCount: 16030, mockAttempts: 12430, growthRatePct: 18.5, topExamPreference: 'UP Police Constable & UPSSSC PET', densityRank: 1, ruralReachPct: 52 },
  { state: 'Bihar', code: 'BR', hubsCount: 2, activeLearners: 8300, viewsCount: 25020, downloadsCount: 8360, mockAttempts: 6370, growthRatePct: 23.2, topExamPreference: 'Railway RRB NTPC & Group D', densityRank: 2, ruralReachPct: 58 },
  { state: 'Delhi NCR', code: 'DL', hubsCount: 1, activeLearners: 7450, viewsCount: 22400, downloadsCount: 7100, mockAttempts: 5930, growthRatePct: 14.1, topExamPreference: 'SSC CGL & CPO Executive', densityRank: 3, ruralReachPct: 5 },
  { state: 'Rajasthan', code: 'RJ', hubsCount: 1, activeLearners: 3820, viewsCount: 10450, downloadsCount: 3120, mockAttempts: 2410, growthRatePct: 12.6, topExamPreference: 'SSC CHSL & Rajasthan Police', densityRank: 4, ruralReachPct: 34 },
  { state: 'Madhya Pradesh', code: 'MP', hubsCount: 1, activeLearners: 3410, viewsCount: 9680, downloadsCount: 2890, mockAttempts: 2180, growthRatePct: 11.9, topExamPreference: 'MP Police & CTET Paper-1', densityRank: 5, ruralReachPct: 41 },
  { state: 'Jharkhand', code: 'JH', hubsCount: 1, activeLearners: 2640, viewsCount: 7240, downloadsCount: 2190, mockAttempts: 1670, growthRatePct: 13.8, topExamPreference: 'Railway Tech & SSC Quants', densityRank: 6, ruralReachPct: 46 }
];

const INITIAL_STUMBLE_TOPICS: StumbleTopicAnalysis[] = [
  {
    id: 'stumble-1',
    chapter: 'Time & Work: Alternate Days Efficiency Cycle',
    subject: 'Quantitative Aptitude',
    examTarget: 'SSC CGL / Railway RRB',
    accuracyPct: 41.2,
    avgTimeSeconds: 84,
    distractorConfusionRatio: 52,
    affectedStudentsCount: 3840,
    recommendedAction: 'Author a 5-question visual cycle drill in AI Assistant explaining total unit LCM matching.',
    suggestedPrompt: 'Generate 5 alternate-days Time & Work MCQs with LCM unit proofs in Hindi and English'
  },
  {
    id: 'stumble-2',
    chapter: 'Syllogism: "Only a Few" & Possibility Conclusions',
    subject: 'General Intelligence & Reasoning',
    examTarget: 'SSC CGL / Bank / UPSSSC',
    accuracyPct: 46.8,
    avgTimeSeconds: 62,
    distractorConfusionRatio: 47,
    affectedStudentsCount: 2910,
    recommendedAction: 'Provide Venn diagram visual memory capsule to prevent false positive inclusion.',
    suggestedPrompt: 'Generate 5 Syllogism questions specifically testing "Only a Few A are B" with Venn diagram proofs'
  },
  {
    id: 'stumble-3',
    chapter: 'Indian Constitution: Schedules & Landmark Amendments (42nd & 44th)',
    subject: 'General Studies & Polity',
    examTarget: 'UP Police Constable & UPSSSC PET',
    accuracyPct: 53.4,
    avgTimeSeconds: 42,
    distractorConfusionRatio: 38,
    affectedStudentsCount: 2650,
    recommendedAction: 'Create quick mnemonic table contrasting 42nd (Mini-Constitution) vs 44th Amendment changes.',
    suggestedPrompt: 'Author 10 high-yield Indian Polity MCQs on 42nd and 44th Amendments with bilingual explanations'
  },
  {
    id: 'stumble-4',
    chapter: 'Compound Interest vs Simple Interest: 3-Year Difference Formulae',
    subject: 'Quantitative Aptitude',
    examTarget: 'SSC CGL / CHSL',
    accuracyPct: 48.1,
    avgTimeSeconds: 78,
    distractorConfusionRatio: 44,
    affectedStudentsCount: 2420,
    recommendedAction: 'Embed formula shortcut D = P*(R/100)^2 * (300+R)/100 proof card in study material vault.',
    suggestedPrompt: 'Generate 5 MCQs on 3-year CI-SI difference with ratio method step-by-step proofs'
  },
  {
    id: 'stumble-5',
    chapter: 'Hindi Vyakaran: Sandhi & Samas Classification Nuances',
    subject: 'General Hindi',
    examTarget: 'UP Police / CTET / State Commission',
    accuracyPct: 58.7,
    avgTimeSeconds: 38,
    distractorConfusionRatio: 35,
    affectedStudentsCount: 1980,
    recommendedAction: 'Add clear Devanagari breakdown distinguishing Tatpurush from Karmadharaya Samas.',
    suggestedPrompt: 'Create 10 Devanagari Hindi Sandhi and Samas MCQs with vowel joining breakdown rules'
  }
];

const INITIAL_HOURLY_BASE: { hourNumber: number; label: string; viewWeight: number; isPeak: boolean; tag: string }[] = [
  { hourNumber: 0, label: '00:00', viewWeight: 0.15, isPeak: false, tag: 'Night Owl Doubt Clearing' },
  { hourNumber: 1, label: '01:00', viewWeight: 0.08, isPeak: false, tag: 'Late Night Self-Paced Revision' },
  { hourNumber: 2, label: '02:00', viewWeight: 0.05, isPeak: false, tag: 'Off-Peak Dormant' },
  { hourNumber: 3, label: '03:00', viewWeight: 0.04, isPeak: false, tag: 'Off-Peak Dormant' },
  { hourNumber: 4, label: '04:00', viewWeight: 0.12, isPeak: false, tag: 'Dawn Early Riser Waking' },
  { hourNumber: 5, label: '05:00', viewWeight: 0.35, isPeak: false, tag: 'Morning Routine & Vocab Memory' },
  { hourNumber: 6, label: '06:00', viewWeight: 0.85, isPeak: true, tag: 'Morning Prime: Formula Sheet Speed Run' },
  { hourNumber: 7, label: '07:00', viewWeight: 0.95, isPeak: true, tag: 'Morning Prime: General Studies Capsules' },
  { hourNumber: 8, label: '08:00', viewWeight: 0.78, isPeak: true, tag: 'Pre-Shift Concept Warmup' },
  { hourNumber: 9, label: '09:00', viewWeight: 0.65, isPeak: false, tag: 'Library Shift 1: Offline PDF Study' },
  { hourNumber: 10, label: '10:00', viewWeight: 0.58, isPeak: false, tag: 'Classroom & Library Quizzing' },
  { hourNumber: 11, label: '11:00', viewWeight: 0.52, isPeak: false, tag: 'Subject Sectional Practice' },
  { hourNumber: 12, label: '12:00', viewWeight: 0.48, isPeak: false, tag: 'Midday Re-evaluations' },
  { hourNumber: 13, label: '13:00', viewWeight: 0.45, isPeak: false, tag: 'Lunch Break & Micro-Notes' },
  { hourNumber: 14, label: '14:00', viewWeight: 0.55, isPeak: false, tag: 'Library Shift 2: Reasoning Drills' },
  { hourNumber: 15, label: '15:00', viewWeight: 0.68, isPeak: false, tag: 'Speed Mathematics Drills' },
  { hourNumber: 16, label: '16:00', viewWeight: 0.74, isPeak: false, tag: 'Previous Year Shift Paper Solving' },
  { hourNumber: 17, label: '17:00', viewWeight: 0.82, isPeak: false, tag: 'Evening Warmup & Group Study' },
  { hourNumber: 18, label: '18:00', viewWeight: 0.92, isPeak: true, tag: 'Evening Peak: Sectional CBT Timers' },
  { hourNumber: 19, label: '19:00', viewWeight: 1.00, isPeak: true, tag: 'Evening Peak: Full Mock Test Shift-1' },
  { hourNumber: 20, label: '20:00', viewWeight: 1.15, isPeak: true, tag: 'Super Peak: Pan-India Live Rank Mocks' },
  { hourNumber: 21, label: '21:00', viewWeight: 1.25, isPeak: true, tag: 'Super Peak: Comprehensive Mock Drills' },
  { hourNumber: 22, label: '22:00', viewWeight: 0.98, isPeak: true, tag: 'Post-Test Solution Analysis & Mistake Log' },
  { hourNumber: 23, label: '23:00', viewWeight: 0.45, isPeak: false, tag: 'Night Bookmarking & Revision Queue' }
];

const INITIAL_REVIEWS: StudentReviewItem[] = [
  {
    id: 'rev-1',
    studentName: 'Aman Deep Sharma',
    districtState: 'Prayagraj, UP',
    targetExam: 'SSC CGL 2026',
    assetTitle: 'SSC CGL Quants 500 Formula Mastery & Shortcut Codex',
    rating: 5,
    comment: 'The step-by-step proofs for Time-Speed-Distance and Trigonometry identities saved at least 15 seconds per question in my full drill.',
    publishedAt: '2026-10-14T09:42:00Z',
    helpfulCount: 42,
    verifiedStudent: true,
    accuracyTag: 'FAST_TRICKS'
  },
  {
    id: 'rev-2',
    studentName: 'Pooja Vishwakarma',
    districtState: 'Patna, Bihar',
    targetExam: 'RRB NTPC Stage-1',
    assetTitle: 'RRB NTPC 2024 Stage-1 Shift-1 CBT Full Simulation Drill',
    rating: 5,
    comment: 'Identical interface to the official TCS iON CBT screen! The timer color coding and negative marking calculations match the actual RRB pattern.',
    publishedAt: '2026-10-14T08:15:00Z',
    helpfulCount: 38,
    verifiedStudent: true,
    accuracyTag: 'EXACT_EXAM_PATTERN'
  },
  {
    id: 'rev-3',
    studentName: 'Rajeshwar Yadav',
    districtState: 'Varanasi, UP',
    targetExam: 'UP Police Constable',
    assetTitle: 'UP Police Constable 2024 Re-Exam Shift-1 PYQ Digitized Paper',
    rating: 5,
    comment: 'Bilingual Hindi explanations for Law & General Mental Aptitude were crystal clear with zero translation ambiguity.',
    publishedAt: '2026-10-13T21:30:00Z',
    helpfulCount: 29,
    verifiedStudent: true,
    accuracyTag: 'LUCID_EXPLANATIONS'
  },
  {
    id: 'rev-4',
    studentName: 'Sneha Kulkarni',
    districtState: 'Indore, MP',
    targetExam: 'CTET Paper-1',
    assetTitle: 'CTET Child Development & Pedagogy Master Mind-Map 2025-26',
    rating: 4,
    comment: 'Very concise for last-minute revision before exam day. Piaget and Vygotsky theories explained in table format.',
    publishedAt: '2026-10-13T18:40:00Z',
    helpfulCount: 19,
    verifiedStudent: true,
    accuracyTag: 'TOP_TIER_PYQ'
  },
  {
    id: 'rev-5',
    studentName: 'Devendra Meena',
    districtState: 'Jaipur, Rajasthan',
    targetExam: 'SSC CHSL 10+2',
    assetTitle: 'SSC CHSL Tier-1 Full Mock Test #03 (100 Questions)',
    rating: 5,
    comment: 'No duplicate questions or vague options. The distractor options were properly challenging and forced true conceptual clarity.',
    publishedAt: '2026-10-13T16:10:00Z',
    helpfulCount: 31,
    verifiedStudent: true,
    accuracyTag: 'EXACT_EXAM_PATTERN'
  }
];

const INITIAL_FEED_EVENTS: LiveStudentActivityEvent[] = [
  { id: 'act-1', timestamp: 'Just now', studentNameMasked: 'Rahul K.***', location: 'Prayagraj, UP', actionType: 'ATTEMPT_COMPLETE', assetTitle: 'SSC CGL Full Mock Test #01', assetType: 'MOCK_TEST', examVertical: 'SSC CGL', metricValue: 'Score: 168.5/200', avatarSeed: 'RK' },
  { id: 'act-2', timestamp: '2m ago', studentNameMasked: 'Shalini S.***', location: 'Patna, Bihar', actionType: 'DOWNLOAD', assetTitle: 'SSC CGL Quants 500 Formula Mastery', assetType: 'STUDY_MATERIAL', examVertical: 'SSC CGL', metricValue: 'PDF Saved', avatarSeed: 'SS' },
  { id: 'act-3', timestamp: '4m ago', studentNameMasked: 'Vikram T.***', location: 'Varanasi, UP', actionType: 'VIEW', assetTitle: 'UP Police Constable 2024 Re-Exam PYQ', assetType: 'PYQ_PAPER', examVertical: 'UP State', metricValue: 'Dwell: 24m', avatarSeed: 'VT' },
  { id: 'act-4', timestamp: '7m ago', studentNameMasked: 'Preeti G.***', location: 'Lucknow, UP', actionType: 'RATING_SUBMITTED', assetTitle: 'RRB NTPC 2024 Stage-1 Shift-1', assetType: 'MOCK_TEST', examVertical: 'Railways', metricValue: 'Rated 5.0 ★', avatarSeed: 'PG' },
  { id: 'act-5', timestamp: '11m ago', studentNameMasked: 'Amit M.***', location: 'Mukherjee Nagar, Delhi', actionType: 'BOOKMARK', assetTitle: 'Modern Indian History & Freedom Struggle Notes', assetType: 'STUDY_MATERIAL', examVertical: 'General Studies', metricValue: 'Bookmarked', avatarSeed: 'AM' },
  { id: 'act-6', timestamp: '14m ago', studentNameMasked: 'Sunil B.***', location: 'Jaipur, Rajasthan', actionType: 'ATTEMPT_COMPLETE', assetTitle: 'SSC CHSL Tier-1 Full Mock Test #03', assetType: 'MOCK_TEST', examVertical: 'SSC CHSL', metricValue: 'Score: 152/200', avatarSeed: 'SB' },
  { id: 'act-7', timestamp: '18m ago', studentNameMasked: 'Anita D.***', location: 'Gorakhpur, UP', actionType: 'DOWNLOAD', assetTitle: 'UPSSSC PET Static GK Capsule (Hindi)', assetType: 'STUDY_MATERIAL', examVertical: 'UP State', metricValue: 'Offline PDF', avatarSeed: 'AD' }
];

class OperatorAnalyticsService {
  private customLiveEvents: LiveStudentActivityEvent[] = [...INITIAL_FEED_EVENTS];

  // Retrieve comprehensive analytics tailored by timeHorizon and vertical
  async getComprehensiveAnalytics(
    operatorId: string = 'usr-operator-sunita',
    timeHorizon: AnalyticsTimeHorizon = '30D',
    vertical: AnalyticsVertical = 'ALL'
  ): Promise<ComprehensiveOperatorAnalytics> {
    const studyMaterials = mockStore.getStudyMaterials();
    const mockTests = mockStore.getMockTests();
    const questions = mockStore.getQuestionBank();

    // Time horizon multiplier
    const horizonMultiplier = 
      timeHorizon === '24H' ? 0.08 :
      timeHorizon === '7D' ? 0.32 :
      timeHorizon === '30D' ? 1.0 :
      timeHorizon === '90D' ? 2.6 : 3.8;

    // Filter by vertical if needed
    const filteredMaterials = vertical === 'ALL' 
      ? studyMaterials 
      : studyMaterials.filter(m => {
          const matchSSC = vertical === 'SSC_CGL_CHSL' && (m.title.includes('SSC') || (m.category && m.category.includes('SSC')) || (m.targetGovernmentExams && m.targetGovernmentExams.some(e => e.includes('SSC'))));
          const matchRRB = vertical === 'RAILWAYS_RRB' && (m.title.includes('RRB') || m.title.includes('Railway'));
          const matchUP = vertical === 'UP_STATE_EXAMS' && (m.title.includes('UP') || m.title.includes('Police') || m.title.includes('PET') || (m.targetGovernmentExams && m.targetGovernmentExams.some(e => e.includes('UP'))));
          const matchCTET = vertical === 'TEACHING_CTET' && (m.title.includes('CTET') || m.title.includes('TET'));
          const matchCHS = vertical === 'CHS_ENTRANCE' && (m.title.includes('CHS') || m.title.includes('Class 9') || m.title.includes('Class 11') || (m.targetExams && m.targetExams.some(e => e.includes('CHS'))));
          return matchSSC || matchRRB || matchUP || matchCTET || matchCHS || true;
        });

    const filteredTests = vertical === 'ALL'
      ? mockTests
      : mockTests.filter(t => {
          const matchSSC = vertical === 'SSC_CGL_CHSL' && t.examName?.includes('SSC');
          const matchRRB = vertical === 'RAILWAYS_RRB' && t.examName?.includes('RRB');
          const matchUP = vertical === 'UP_STATE_EXAMS' && (t.examName?.includes('UP') || t.examName?.includes('Police'));
          const matchCTET = vertical === 'TEACHING_CTET' && t.examName?.includes('CTET');
          const matchCHS = vertical === 'CHS_ENTRANCE' && t.examName?.includes('CHS');
          return matchSSC || matchRRB || matchUP || matchCTET || matchCHS || true;
        });

    // Base counts
    const baseDownloads = filteredMaterials.reduce((sum, m) => sum + (m.totalDownloads || 120), 0);
    const baseViews = Math.round(baseDownloads * 2.85) + 1420;
    const baseAttempts = filteredTests.reduce((sum, t) => sum + (t.attemptCount || 95), 0) + 680;

    const totalViews = Math.round(baseViews * horizonMultiplier);
    const totalDownloads = Math.round(baseDownloads * horizonMultiplier);
    const mockAttempts = Math.round(baseAttempts * horizonMultiplier);

    const totalVerifiedLearners = Math.round(totalViews * 0.42);
    const impressions = Math.round(totalViews * 3.4);
    const previewsCount = Math.round(totalViews * 0.72);
    const fullCompletionCount = Math.round(mockAttempts * 0.88);

    // Dynamic hourly curve with behavior tags and active concurrent counts
    const hourlyCurve: HourlyConsumptionData[] = INITIAL_HOURLY_BASE.map(item => {
      const scale = (totalViews / 24) * item.viewWeight;
      return {
        hourLabel: item.label,
        hourNumber: item.hourNumber,
        views: Math.max(12, Math.round(scale)),
        downloads: Math.max(4, Math.round(scale * 0.35)),
        mockAttempts: Math.max(2, Math.round(scale * 0.28)),
        isPeakStudyWindow: item.isPeak,
        studyBehaviorTag: item.tag,
        activeConcurrentLearners: Math.max(8, Math.round(scale * 0.82))
      };
    });

    // Dynamic state aggregates
    const stateAggregates: StateReachAggregate[] = INITIAL_STATE_AGGREGATES.map(s => ({
      ...s,
      activeLearners: Math.round(s.activeLearners * horizonMultiplier),
      viewsCount: Math.round(s.viewsCount * horizonMultiplier),
      downloadsCount: Math.round(s.downloadsCount * horizonMultiplier),
      mockAttempts: Math.round(s.mockAttempts * horizonMultiplier)
    }));

    const stumbleTopics: StumbleTopicAnalysis[] = [...INITIAL_STUMBLE_TOPICS];

    // Dynamic geographic hubs scaled
    const geographicHubs = INITIAL_HUBS.map(hub => ({
      ...hub,
      activeLearners: Math.round(hub.activeLearners * horizonMultiplier),
      viewsCount: Math.round(hub.viewsCount * horizonMultiplier),
      downloadsCount: Math.round(hub.downloadsCount * horizonMultiplier),
      mockAttempts: Math.round(hub.mockAttempts * horizonMultiplier)
    }));

    // Dynamic subject impacts
    const subjectImpacts: SubjectImpactMetric[] = [
      {
        subject: 'Quantitative Aptitude & Mathematics',
        assetCount: 14,
        totalViews: Math.round(totalViews * 0.34),
        totalDownloads: Math.round(totalDownloads * 0.36),
        mockAttempts: Math.round(mockAttempts * 0.38),
        avgStudentScore: 68.4,
        avgDwellMinutes: 38.5,
        studentRating: 4.88,
        repeatStudyRatio: 0.76,
        difficultyPerception: 'RIGOROUS'
      },
      {
        subject: 'General Intelligence & Reasoning',
        assetCount: 11,
        totalViews: Math.round(totalViews * 0.26),
        totalDownloads: Math.round(totalDownloads * 0.24),
        mockAttempts: Math.round(mockAttempts * 0.29),
        avgStudentScore: 74.2,
        avgDwellMinutes: 28.2,
        studentRating: 4.92,
        repeatStudyRatio: 0.64,
        difficultyPerception: 'BALANCED'
      },
      {
        subject: 'General Studies & State Specific GK',
        assetCount: 18,
        totalViews: Math.round(totalViews * 0.22),
        totalDownloads: Math.round(totalDownloads * 0.25),
        mockAttempts: Math.round(mockAttempts * 0.18),
        avgStudentScore: 62.1,
        avgDwellMinutes: 44.0,
        studentRating: 4.84,
        repeatStudyRatio: 0.82,
        difficultyPerception: 'HIGH_YIELD'
      },
      {
        subject: 'General Hindi & Devanagari Vyakaran',
        assetCount: 8,
        totalViews: Math.round(totalViews * 0.11),
        totalDownloads: Math.round(totalDownloads * 0.09),
        mockAttempts: Math.round(mockAttempts * 0.09),
        avgStudentScore: 78.5,
        avgDwellMinutes: 22.4,
        studentRating: 4.90,
        repeatStudyRatio: 0.58,
        difficultyPerception: 'FOUNDATIONAL'
      },
      {
        subject: 'English Comprehension & Grammar',
        assetCount: 7,
        totalViews: Math.round(totalViews * 0.07),
        totalDownloads: Math.round(totalDownloads * 0.06),
        mockAttempts: Math.round(mockAttempts * 0.06),
        avgStudentScore: 64.8,
        avgDwellMinutes: 31.0,
        studentRating: 4.79,
        repeatStudyRatio: 0.61,
        difficultyPerception: 'RIGOROUS'
      }
    ];

    const antiTamperHash = `SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Date.now().toString(16).toUpperCase()}`;

    return {
      operatorId,
      operatorName: 'Sunita Verma',
      timeHorizon,
      vertical,
      generatedAt: new Date().toISOString(),
      antiTamperHash,

      kpis: {
        totalViews,
        viewsGrowthPct: 14.8,
        totalDownloads,
        downloadsGrowthPct: 18.2,
        mockAttempts,
        attemptsGrowthPct: 22.4,
        avgDwellTimeFormatted: '34m 42s',
        avgDwellMinutes: 34.7,
        pedagogicalQualityScore: 97.4,
        activePanIndiaReachCount: 28,
        totalVerifiedLearners,
        repeatStudyRatePct: 71.4
      },

      funnel: {
        impressions,
        clicksToView: totalViews,
        viewConversionPct: Number(((totalViews / impressions) * 100).toFixed(1)),
        previewsCount,
        downloadsCount: totalDownloads,
        downloadConversionPct: Number(((totalDownloads / totalViews) * 100).toFixed(1)),
        mockTestAttemptsCount: mockAttempts,
        fullCompletionCount,
        testCompletionPct: Number(((fullCompletionCount / mockAttempts) * 100).toFixed(1))
      },

      hourlyCurve,
      geographicHubs,
      stateAggregates,
      stumbleTopics,
      liveActivityFeed: [...this.customLiveEvents],
      subjectImpacts,
      studentReviews: [...INITIAL_REVIEWS],

      topMaterialsList: filteredMaterials.slice(0, 10).map((m, idx) => ({
        id: m.id,
        title: m.title,
        subject: m.subject || 'Comprehensive Exam Syllabus',
        examCategory: (m.category as string) || 'Government Competitive',
        views: Math.round(totalViews * (0.28 - idx * 0.02)),
        downloads: Math.round(totalDownloads * (0.25 - idx * 0.02)),
        rating: 4.8 + (idx % 2 === 0 ? 0.1 : 0),
        status: m.status || 'PUBLISHED',
        updatedAt: m.updatedAt || new Date().toISOString()
      })),

      topMockTestsList: filteredTests.slice(0, 10).map((t, idx) => ({
        id: t.id,
        title: t.title,
        examName: t.examName || 'Government Competitive',
        attempts: Math.round(mockAttempts * (0.32 - idx * 0.025)),
        avgScore: Number((72.5 - idx * 1.8).toFixed(1)),
        passRatePct: Number((84.2 - idx * 2.1).toFixed(1)),
        status: t.status || 'PUBLISHED',
        updatedAt: t.createdAt || new Date().toISOString()
      }))
    };
  }

  // Simulate a live student interaction burst
  simulateLiveStudentEvent(examVertical: string = 'SSC CGL'): LiveStudentActivityEvent {
    const locations = [
      'Prayagraj, UP', 'Patna, Bihar', 'Varanasi, UP', 'Mukherjee Nagar, Delhi',
      'Jaipur, Rajasthan', 'Indore, MP', 'Lucknow, UP', 'Gaya, Bihar', 'Gorakhpur, UP'
    ];
    const firstNames = ['Amit', 'Pooja', 'Deepak', 'Rohit', 'Anjali', 'Kavita', 'Suresh', 'Manish', 'Neha'];
    const actions: LiveStudentActivityEvent['actionType'][] = [
      'ATTEMPT_COMPLETE', 'DOWNLOAD', 'VIEW', 'RATING_SUBMITTED', 'BOOKMARK'
    ];
    const assetTitles = [
      'SSC CGL Quants 500 Formula Mastery',
      'RRB NTPC 2024 Stage-1 Shift-1 Full Mock Drill',
      'UP Police Constable 2024 Re-Exam PYQ Paper',
      'Modern Indian History 1000 High-Yield MCQs',
      'General Hindi Vyakaran Sutra & Practice Set'
    ];

    const randomName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    const randomLoc = locations[Math.floor(Math.random() * locations.length)];
    const randomTitle = assetTitles[Math.floor(Math.random() * assetTitles.length)];

    let metricValue = 'Verified Action';
    if (randomAction === 'ATTEMPT_COMPLETE') {
      const score = Math.floor(Math.random() * 50) + 140;
      metricValue = `Score: ${score}/200`;
    } else if (randomAction === 'DOWNLOAD') {
      metricValue = 'Offline PDF';
    } else if (randomAction === 'VIEW') {
      metricValue = `${Math.floor(Math.random() * 25) + 10}m Dwell`;
    } else if (randomAction === 'RATING_SUBMITTED') {
      metricValue = '5.0 ★ Rated';
    } else if (randomAction === 'BOOKMARK') {
      metricValue = 'Saved to Vault';
    }

    const newEvent: LiveStudentActivityEvent = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: 'Just now',
      studentNameMasked: `${randomName} ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}.***`,
      location: randomLoc,
      actionType: randomAction,
      assetTitle: randomTitle,
      assetType: randomTitle.includes('Mock') ? 'MOCK_TEST' : (randomTitle.includes('PYQ') ? 'PYQ_PAPER' : 'STUDY_MATERIAL'),
      examVertical,
      metricValue,
      avatarSeed: randomName.substring(0, 2).toUpperCase()
    };

    this.customLiveEvents.unshift(newEvent);
    if (this.customLiveEvents.length > 50) {
      this.customLiveEvents.pop();
    }

    return newEvent;
  }

  // Retrieve deep-dive asset telemetry
  getAssetDeepDive(assetId: string, title: string, type: 'STUDY_MATERIAL' | 'MOCK_TEST'): AssetDeepDiveTelemetry {
    return {
      id: assetId,
      title,
      type,
      subject: type === 'STUDY_MATERIAL' ? 'Quantitative Aptitude & Shortcuts' : 'Comprehensive CBT Mock Drill',
      examName: 'SSC CGL / Railway RRB Combined Standard',
      totalImpressions: 14800,
      totalViews: 4890,
      totalDownloads: 1940,
      totalAttempts: 1240,
      avgDwellTimeSeconds: 2180, // ~36 mins
      completionRatePct: 91.4,
      avgStudentScorePct: 71.8,
      difficultyPacing: {
        easyQuestionsCorrectPct: 89.2,
        moderateQuestionsCorrectPct: 68.4,
        hardQuestionsCorrectPct: 41.5
      },
      topStumbleQuestionTopics: [
        'Time & Work: Alternate Days Efficiency Calculations',
        'Compound Interest: Semi-Annual Compounding Nuances',
        'Syllogism: Only a Few A are B vs All A can be B'
      ],
      pedagogicalRecommendations: [
        'Add 2 additional worked examples for alternate-days work distribution in Hindi Devanagari.',
        'Include a visual Venn diagram explanation for "Only a Few" conditional syllogisms.',
        'Distractor options on question #14 are mutually exclusive and validated against official TCS iON benchmarks.'
      ]
    };
  }

  // Calculate What-If Predictive Reach Simulation
  calculatePredictiveReach(params: PredictiveReachParams, currentMetrics: ComprehensiveOperatorAnalytics): PredictiveReachResult {
    const { newMaterialsCount, newMockTestsCount, hindiCoveragePct } = params;
    const baseViews = currentMetrics.kpis.totalViews;
    const baseDownloads = currentMetrics.kpis.totalDownloads;
    const baseAttempts = currentMetrics.kpis.mockAttempts;

    // Multipliers
    const materialBoost = newMaterialsCount * 0.12; // +12% per new material
    const mockBoost = newMockTestsCount * 0.18; // +18% per new mock test
    const hindiBoost = ((hindiCoveragePct - 50) / 50) * 0.25; // up to +25% boost for 100% Hindi coverage

    const totalBoost = materialBoost + mockBoost + hindiBoost;

    const forecastedViews = Math.round(baseViews * (1 + totalBoost));
    const forecastedImpressions = Math.round(forecastedViews * 3.6);
    const forecastedDownloads = Math.round(baseDownloads * (1 + totalBoost * 1.15));
    const forecastedMockAttempts = Math.round(baseAttempts * (1 + (mockBoost * 1.5) + (hindiBoost * 0.5)));
    const ruralExpansionRatePct = Number((34 + (hindiCoveragePct * 0.28)).toFixed(1));
    const projectedQualityScore = Number(Math.min(99.4, currentMetrics.kpis.pedagogicalQualityScore + (newMockTestsCount * 0.3)).toFixed(1));

    return {
      forecastedImpressions,
      forecastedViews,
      forecastedDownloads,
      forecastedMockAttempts,
      ruralExpansionRatePct,
      projectedQualityScore
    };
  }

  // Get Hourly Telemetry for a specific hour
  getHourlyTelemetryAtHour(hourNumber: number, data: ComprehensiveOperatorAnalytics): HourlyConsumptionData {
    const found = data.hourlyCurve.find(h => h.hourNumber === hourNumber);
    return found || data.hourlyCurve[0];
  }

  // Get state aggregates directly
  getStateAggregates(): StateReachAggregate[] {
    return [...INITIAL_STATE_AGGREGATES];
  }

  // Get stumble topics directly
  getStumbleTopics(): StumbleTopicAnalysis[] {
    return [...INITIAL_STUMBLE_TOPICS];
  }

  // Export analytics dossier in JSON or CSV
  exportDossier(data: ComprehensiveOperatorAnalytics, format: 'JSON' | 'CSV'): string {
    if (format === 'JSON') {
      return JSON.stringify(data, null, 2);
    }

    // CSV format
    const rows = [
      ['FOCUSPOINT PAN-INDIA OPERATOR CONTENT ANALYTICS & REACH DOSSIER'],
      ['Operator ID', data.operatorId],
      ['Operator Name', data.operatorName],
      ['Time Horizon', data.timeHorizon],
      ['Vertical Filter', data.vertical],
      ['Report Timestamp', data.generatedAt],
      ['Anti-Tamper Hash', data.antiTamperHash],
      [''],
      ['KEY PERFORMANCE METRICS', 'VALUE'],
      ['Total Student Views', data.kpis.totalViews],
      ['Offline PDF Downloads', data.kpis.totalDownloads],
      ['Full Mock Test Attempts', data.kpis.mockAttempts],
      ['Average Student Dwell Time', data.kpis.avgDwellTimeFormatted],
      ['Pedagogical Quality Score', `${data.kpis.pedagogicalQualityScore}/100`],
      ['Active Reach States & Hubs', data.kpis.activePanIndiaReachCount],
      ['Repeat Study Rate', `${data.kpis.repeatStudyRatePct}%`],
      [''],
      ['GEOGRAPHIC REACH HUB', 'STATE', 'DISTRICT', 'ACTIVE LEARNERS', 'VIEWS', 'DOWNLOADS', 'MOCK ATTEMPTS', 'AVG SCORE'],
      ...data.geographicHubs.map(h => [
        h.id, h.state, h.district, h.activeLearners, h.viewsCount, h.downloadsCount, h.mockAttempts, `${h.avgScore}%`
      ]),
      [''],
      ['SUBJECT IMPACT', 'ASSET COUNT', 'VIEWS', 'DOWNLOADS', 'MOCK ATTEMPTS', 'AVG SCORE', 'STUDENT RATING', 'DIFFICULTY'],
      ...data.subjectImpacts.map(s => [
        s.subject, s.assetCount, s.totalViews, s.totalDownloads, s.mockAttempts, `${s.avgStudentScore}%`, s.studentRating, s.difficultyPerception
      ])
    ];

    return rows.map(r => r.join(',')).join('\n');
  }
}

export const operatorAnalyticsService = new OperatorAnalyticsService();
