// FOCUSPOINT Study Material Constants & Taxonomies
// Structured taxonomy for Classes, Categories, Subjects, Exams, and Access Rules

export const STUDY_MATERIAL_CLASSES = [
  // Pre-Primary
  { id: 'nursery', name: 'Nursery', stage: 'PRE_PRIMARY' },
  { id: 'lkg', name: 'LKG', stage: 'PRE_PRIMARY' },
  { id: 'ukg', name: 'UKG', stage: 'PRE_PRIMARY' },

  // Primary
  { id: 'class-1', name: 'Class 1', stage: 'PRIMARY' },
  { id: 'class-2', name: 'Class 2', stage: 'PRIMARY' },
  { id: 'class-3', name: 'Class 3', stage: 'PRIMARY' },
  { id: 'class-4', name: 'Class 4', stage: 'PRIMARY' },
  { id: 'class-5', name: 'Class 5', stage: 'PRIMARY' },

  // Middle School
  { id: 'class-6', name: 'Class 6', stage: 'MIDDLE' },
  { id: 'class-7', name: 'Class 7', stage: 'MIDDLE' },
  { id: 'class-8', name: 'Class 8', stage: 'MIDDLE' },

  // Secondary
  { id: 'class-9', name: 'Class 9', stage: 'SECONDARY' },
  { id: 'class-10', name: 'Class 10', stage: 'SECONDARY' },

  // Senior Secondary
  { id: 'class-11', name: 'Class 11', stage: 'SENIOR_SECONDARY' },
  { id: 'class-12', name: 'Class 12', stage: 'SENIOR_SECONDARY' },
] as const;

export const EDUCATION_STAGES = [
  { id: 'ALL', label: 'All Education Stages' },
  { id: 'PRE_PRIMARY', label: 'Pre-Primary (Nursery, LKG, UKG)' },
  { id: 'PRIMARY', label: 'Primary (Class 1 - 5)' },
  { id: 'MIDDLE', label: 'Middle School (Class 6 - 8)' },
  { id: 'SECONDARY', label: 'Secondary (Class 9 - 10)' },
  { id: 'SENIOR_SECONDARY', label: 'Senior Secondary (Class 11 - 12)' },
] as const;

export const STUDY_MATERIAL_CATEGORIES = [
  { id: 'ACADEMIC', label: 'Academic Study Material', description: 'Curriculum-aligned textbook solutions, chapter notes, and concepts' },
  { id: 'COMPETITIVE_EXAM', label: 'Competitive Exam Preparation', description: 'Olympiads, CHS, Navodaya, IIT-JEE, NEET prep sets' },
  { id: 'GOVERNMENT_EXAM', label: 'Government Exam Preparation', description: 'UP Police, SSC, State Services, and aptitude modules' },
  { id: 'PRACTICE_SETS', label: 'Practice Sets', description: 'Subject-wise question sets with step-by-step answer keys' },
  { id: 'CLASS_EXAM_PRACTICE', label: 'Class Examination Practice', description: 'Unit tests, quarterly, half-yearly & annual mock drills' },
  { id: 'REVISION_MATERIAL', label: 'Revision Material', description: 'Quick-glance formula cheat sheets, mindmaps, and summaries' },
  { id: 'QUESTION_BANKS', label: 'Question Banks', description: 'Exhaustive chapter-wise question repositories' },
  { id: 'SAMPLE_PAPERS', label: 'Sample Papers', description: 'Latest board pattern model test papers' },
  { id: 'PREVIOUS_YEAR_PAPERS', label: 'Previous Year Papers', description: 'Past 10 years solved examination papers with marking scheme' },
  { id: 'NOTES', label: 'Notes', description: 'Handcrafted topper notes and faculty lecture digests' },
  { id: 'WORKSHEETS', label: 'Worksheets', description: 'Homework sheets, daily practice problems (DPP)' },
  { id: 'MOCK_TESTS', label: 'Mock Tests', description: 'Timed full syllabus benchmark evaluations' },
] as const;

export const STUDY_MATERIAL_SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'Hindi',
  'Science',
  'Social Science',
  'Computer Science',
  'Sanskrit',
  'General Knowledge',
  'EVS',
  'Accountancy',
  'Business Studies',
  'Economics',
] as const;

export const COMPETITIVE_EXAMS = [
  { id: 'CHS', name: 'CHS (Central Hindu School)', eligibleClasses: ['Class 6', 'Class 9', 'Class 11'] },
  { id: 'NAVODAYA', name: 'JNVST (Navodaya Vidyalaya)', eligibleClasses: ['Class 6', 'Class 9'] },
  { id: 'IIT_JEE', name: 'IIT-JEE (Main & Advanced)', eligibleClasses: ['Class 11', 'Class 12', 'Class 11 (Science)', 'Class 12 (Science)'] },
  { id: 'NEET', name: 'NEET UG (Medical Entrance)', eligibleClasses: ['Class 11', 'Class 12', 'Class 11 (Science)', 'Class 12 (Science)'] },
  { id: 'OLYMPIAD', name: 'Science & Math Olympiads (SOF/SilverZone)', eligibleClasses: ['Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'] },
  { id: 'NTSE', name: 'NTSE / NMMS Scholarship Exams', eligibleClasses: ['Class 8', 'Class 10'] },
  { id: 'CUET', name: 'CUET UG', eligibleClasses: ['Class 12', 'Class 12 (Science)', 'Class 12 (Commerce)', 'Class 12 (Arts)'] },
] as const;

export const GOVERNMENT_EXAMS = [
  { id: 'UP_POLICE', name: 'UP Police Constable / SI', targetStage: 'General Preparation' },
  { id: 'SSC_GD', name: 'SSC GD / MTS', targetStage: 'Matriculation Level' },
  { id: 'UPSSSC', name: 'UPSSSC PET / Lekhpal', targetStage: 'State Eligibility' },
  { id: 'RAILWAY_RRB', name: 'Railway RRB NTPC / Group D', targetStage: 'General Aptitude' },
  { id: 'DEFENCE_NDA', name: 'NDA / CDS / Agniveer', targetStage: 'Intermediate / Graduate' },
] as const;

export const DIFFICULTY_LEVELS = [
  { id: 'EASY', label: 'Foundation / Beginner', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { id: 'MEDIUM', label: 'Standard / Intermediate', badgeColor: 'bg-blue-100 text-blue-800 border-blue-200' },
  { id: 'HARD', label: 'Advanced / Topper Level', badgeColor: 'bg-purple-100 text-purple-800 border-purple-200' },
  { id: 'EXEMPLAR', label: 'Exemplar & High Order (HOTS)', badgeColor: 'bg-rose-100 text-rose-800 border-rose-200' },
] as const;

export const CONTENT_LANGUAGES = ['Bilingual (English + Hindi)', 'English Medium', 'Hindi Medium'] as const;

export const ACADEMIC_SESSIONS = ['2026-2027 (Current)', '2025-2026', '2024-2025'] as const;

// Default Pan-India Monthly Download Quota
export const DEFAULT_MONTHLY_DOWNLOAD_LIMIT = 3;
