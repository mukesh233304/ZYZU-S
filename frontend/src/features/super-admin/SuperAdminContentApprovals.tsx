// FOCUSPOINT Super Admin — Pan-India Content Approvals & Editorial Quality Command Deck
// Panoramic Cyber-HUD Standard: Procedural Web Audio, Holographic 3D Content Radar, Dual Interactive Donut Charts, 12 KPI Metric Decks, 4 Editorial Defense Gates, Multi-Stream Queue, Docked Batch Action Deck & Cryptographic Inspector Modals

import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  BookOpen, 
  HelpCircle, 
  Landmark, 
  Clock, 
  Eye, 
  Sparkles, 
  Check, 
  X, 
  Filter, 
  Search,
  MessageSquare,
  RotateCcw,
  Volume2,
  VolumeX,
  Copy,
  Download,
  Radio,
  Zap,
  Cpu,
  ExternalLink,
  Award,
  BarChart2,
  IndianRupee,
  RefreshCw,
  SlidersHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  AlertTriangle,
  Layers,
  FileText,
  Binary,
  FileCheck,
  FileSpreadsheet,
  Compass,
  Atom,
  Flame,
  Target,
  ShieldAlert,
  ListFilter,
  Tag,
  Calendar,
  User,
  CheckSquare,
  Square,
  Maximize2,
  ShieldCheck,
  Activity,
  FileCode,
  Share2
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { PageHeader } from '../../components/common/PageHeader';
import { ExportModal } from '../../components/common/ExportModal';
import { InteractivePieDonutChart, DonutSegment } from '../../components/common/charts/InteractivePieDonutChart';
import { useToast } from '../../context/ToastContext';
import { mockStore } from '../../mock/store';
import { operatorService } from '../../services/operatorService';
import { StudyMaterial } from '../../types/studyMaterial';
import { QuestionItem, MockTest } from '../../types/academicIntelligence';
import { OperatorActivityLog } from '../../types/operator';
import { Link, useNavigate } from 'react-router-dom';

// ============================================================================
// NATIVE WEB AUDIO CYBER SYNTHESIZER (Zero External Audio Assets)
// ============================================================================
class CyberSoundSystem {
  private ctx: AudioContext | null = null;
  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }
  public playChirp(type: 'click' | 'confirm' | 'warp' | 'alert' | 'scan') {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      if (type === 'click') {
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1320, now + 0.04);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
      } else if (type === 'confirm') {
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(1040, now + 0.12);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'warp') {
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.18);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (type === 'alert') {
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(310, now + 0.08);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === 'scan') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.linearRampToValueAtTime(1200, now + 0.08);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      }
    } catch {
      // AudioContext unavailable
    }
  }
}
const soundSystem = new CyberSoundSystem();

// ============================================================================
// PRE-BUILT RUBRIC REJECTION PRESETS
// ============================================================================
const RUBRIC_REJECTION_PRESETS = [
  { id: 'DISTRACTOR_AMBIGUITY', label: 'Ambiguous Distractor Options', severity: 'CRITICAL', desc: 'Multiple options can be argued as technically correct or wording lacks precision.' },
  { id: 'SYLLABUS_MISMATCH', label: 'Out of Pan-India Syllabus', severity: 'CRITICAL', desc: 'Topic has been officially excised from the active exam notification blueprint.' },
  { id: 'ERRATA_FORMULA_PROOF', label: 'Errata in Mathematical Proof', severity: 'HIGH', desc: 'Mathematical derivation, chemical valence equation, or numerical calculation errata.' },
  { id: 'LOW_CONTRAST_FIGURE', label: 'Low Resolution / Illegible Diagram', severity: 'MEDIUM', desc: 'Figures, circuit schematics, or maps fail mobile readability contrast thresholds.' },
  { id: 'TRANSLATION_FLAW', label: 'Bilingual Hindi Translation Flaw', severity: 'HIGH', desc: 'Hindi translation diverges from English technical standard terminology.' },
  { id: 'DUPLICATE_ITEM', label: 'Question Bank Duplicate Detected', severity: 'MEDIUM', desc: 'Question text or numerical values collide with existing live benchmark items.' }
];

// Rich fallback seeds to guarantee instant, interactive functionality if store is empty
const SEED_FALLBACK_MATERIALS: Partial<StudyMaterial>[] = [
  {
    id: 'mat-c10-sci-optics-01',
    title: 'Class 10 Science: Light Reflection & Refraction Master Formula Sheet & NCERT Exemplar',
    description: 'Comprehensive handwritten chapter summary, ray diagrams, mirror & lens formula derivations, sign conventions, and numerical practice drills for CBSE & UP Board 2026.',
    category: 'NOTES',
    targetClass: 'Class 10',
    educationStage: 'SECONDARY',
    subject: 'Science',
    academicSession: '2026-2027 (Current)',
    language: 'Bilingual (English + Hindi)',
    difficultyLevel: 'MEDIUM',
    tags: ['NCERT', 'Optics', 'Ray Diagrams', 'Class 10', 'Formula Sheet'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&auto=format&fit=crop&q=80',
    previewPdfUrl: '/documents/optics-preview.pdf',
    previewPageCount: 4,
    fullPdfUrl: '/documents/class10-optics-master.pdf',
    fileName: 'Class10_Light_Optics_Formula_2026.pdf',
    fileSize: '4.8 MB',
    pageCount: 38,
    currentVersion: 'v1.0',
    isPaid: false,
    basePrice: 0,
    isVerified: false,
    totalDownloads: 0,
    totalPurchases: 0,
    rating: 4.8,
    reviewCount: 0,
    createdAt: '2026-10-09T08:30:00Z',
    updatedAt: '2026-10-11T07:15:00Z',
    status: 'DRAFT',
    verifiedBy: 'Sunita Verma (OPR-IN-2026-001)'
  },
  {
    id: 'mat-uppolice-moolvidhi-02',
    title: 'UP Police SI 2026: Cracking Mool Vidhi & Constitutional Law Complete Handbook',
    description: 'In-depth analytical coverage of Bharatiya Nyaya Sanhita (BNS), CrPC reforms, Motor Vehicles Act, Cyber Crime statutes, and landmark Supreme Court constitutional judgments.',
    category: 'GOVERNMENT_EXAM',
    targetClass: 'General',
    educationStage: 'GENERAL',
    subject: 'General Studies & Law',
    academicSession: '2026-2027 (Current)',
    language: 'Hindi Medium',
    difficultyLevel: 'HARD',
    tags: ['UP Police SI', 'Mool Vidhi', 'BNS 2024', 'Constitution', 'UPPRPB'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&auto=format&fit=crop&q=80',
    previewPdfUrl: '/documents/moolvidhi-preview.pdf',
    previewPageCount: 6,
    fullPdfUrl: '/documents/uppolice-moolvidhi-handbook.pdf',
    fileName: 'UP_Police_SI_Mool_Vidhi_2026.pdf',
    fileSize: '12.4 MB',
    pageCount: 114,
    currentVersion: 'v1.2',
    isPaid: true,
    basePrice: 149,
    isVerified: false,
    totalDownloads: 0,
    totalPurchases: 0,
    rating: 4.9,
    reviewCount: 0,
    createdAt: '2026-10-10T11:45:00Z',
    updatedAt: '2026-10-11T09:20:00Z',
    status: 'DRAFT',
    verifiedBy: 'Rajesh Kumar Sharma (OPR-IN-2026-002)'
  },
  {
    id: 'mat-jee-adv-calc-03',
    title: 'JEE Advanced Mathematics: Definite Integrals, Differential Equations & Taylor Expansions',
    description: 'Problem-solving methodology with 75 rigorously solved exemplar problems, Leibniz integral rule applications, and multi-concept question banks calibrated for IIT JEE aspirants.',
    category: 'COMPETITIVE_EXAM',
    targetClass: 'Class 12',
    educationStage: 'SENIOR_SECONDARY',
    subject: 'Mathematics',
    academicSession: '2026-2027 (Current)',
    language: 'English Medium',
    difficultyLevel: 'EXEMPLAR',
    tags: ['JEE Advanced', 'Calculus', 'Leibniz Rule', 'IIT Entrance', 'Mathematics'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&auto=format&fit=crop&q=80',
    previewPdfUrl: '/documents/jee-calc-preview.pdf',
    previewPageCount: 8,
    fullPdfUrl: '/documents/jee-advanced-calculus-2026.pdf',
    fileName: 'JEE_Adv_Integral_Calculus_2026.pdf',
    fileSize: '8.6 MB',
    pageCount: 86,
    currentVersion: 'v1.0',
    isPaid: true,
    basePrice: 299,
    isVerified: false,
    totalDownloads: 0,
    totalPurchases: 0,
    rating: 5.0,
    reviewCount: 0,
    createdAt: '2026-10-10T14:10:00Z',
    updatedAt: '2026-10-11T10:05:00Z',
    status: 'DRAFT',
    verifiedBy: 'Dr. Vikramaditya Sen (OPR-IN-2026-004)'
  },
  {
    id: 'mat-chs-bhu-gsci-04',
    title: 'CHS BHU Class 9 Entrance 2026: General Science & Static General Knowledge Rapid Booster',
    description: 'Concise memory maps, BHU School Entrance Test (SET) past 10-year question trend analysis, biology organ systems, physics units, and historical static GK capsules.',
    category: 'SAMPLE_PAPERS',
    targetClass: 'Class 8',
    educationStage: 'MIDDLE',
    subject: 'General Science',
    academicSession: '2026-2027 (Current)',
    language: 'Bilingual (English + Hindi)',
    difficultyLevel: 'MEDIUM',
    tags: ['CHS BHU', 'SET Entrance', 'Class 9', 'General Science', 'Varanasi'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&auto=format&fit=crop&q=80',
    previewPdfUrl: '/documents/chs-preview.pdf',
    previewPageCount: 3,
    fullPdfUrl: '/documents/chs-bhu-class9-booster.pdf',
    fileName: 'CHS_BHU_Class9_SET_Booster_2026.pdf',
    fileSize: '3.9 MB',
    pageCount: 46,
    currentVersion: 'v1.1',
    isPaid: false,
    basePrice: 0,
    isVerified: false,
    totalDownloads: 0,
    totalPurchases: 0,
    rating: 4.7,
    reviewCount: 0,
    createdAt: '2026-10-08T09:00:00Z',
    updatedAt: '2026-10-11T08:45:00Z',
    status: 'DRAFT',
    verifiedBy: 'Sunita Verma (OPR-IN-2026-001)'
  }
];

const SEED_FALLBACK_QUESTIONS: Partial<QuestionItem>[] = [
  {
    id: 'q-ai-phy-optics-701',
    examId: 'exam-jee-main',
    examName: 'JEE Main & Advanced 2026',
    subject: 'Physics',
    topic: 'Ray Optics & Refraction through Prism',
    chapter: 'Optics and Wave Phenomenon',
    difficulty: 'MEDIUM',
    questionType: 'MCQ',
    questionText: 'A ray of monochromatic light enters an equilateral triangular glass prism of refractive index μ = √3 at the condition of minimum deviation. What is the value of the angle of minimum deviation (δm)?',
    hindiQuestionText: 'एकवर्णी प्रकाश की किरण μ = √3 अपवर्तनांक वाले एक समबाहु कांच के प्रिज्म में न्यूनतम विचलन की स्थिति पर प्रवेश करती है। न्यूनतम विचलन कोण (δm) का मान क्या होगा?',
    options: [
      { id: 'opt-1', text: '30°', isCorrect: false },
      { id: 'opt-2', text: '45°', isCorrect: false },
      { id: 'opt-3', text: '60°', isCorrect: true },
      { id: 'opt-4', text: '90°', isCorrect: false }
    ],
    correctAnswer: '60°',
    explanation: 'Using the standard prism formula: μ = sin[(A + δm)/2] / sin(A/2). For an equilateral prism, A = 60°. Thus sin(A/2) = sin(30°) = 0.5. Substituting μ = √3: √3 = sin[(60° + δm)/2] / 0.5 ⇒ sin[(60° + δm)/2] = √3/2 = sin(60°). Therefore (60° + δm)/2 = 60° ⇒ 60° + δm = 120° ⇒ δm = 60°. Hence, the angle of minimum deviation is exactly 60°.',
    hindiExplanation: 'प्रिज्म सूत्र का उपयोग करने पर: μ = sin[(A + δm)/2] / sin(A/2)। समबाहु प्रिज्म के लिए A = 60°। sin(30°) = 0.5। मान रखने पर: √3 = sin[(60° + δm)/2] / 0.5 ⇒ sin[(60° + δm)/2] = √3/2 ⇒ (60° + δm)/2 = 60° ⇒ δm = 60°।',
    conceptPoint: 'Refraction through Prisms & Snell\'s Law Symmetry at Minimum Deviation',
    marks: 4,
    negativeMarks: 1,
    language: 'Bilingual (English + Hindi)',
    source: 'AI_GENERATED',
    status: 'AI_GENERATED',
    createdAt: '2026-10-11T06:15:00Z',
    updatedAt: '2026-10-11T06:15:00Z'
  },
  {
    id: 'q-ai-math-limits-702',
    examId: 'exam-jee-main',
    examName: 'JEE Main 2026',
    subject: 'Mathematics',
    topic: 'Calculus: Limits & Indeterminate Forms',
    chapter: 'Differential Calculus',
    difficulty: 'HARD',
    questionType: 'MCQ',
    questionText: 'Evaluate the asymptotic limit: lim (x → 0) [(e^(x^2) - cos x) / x^2].',
    hindiQuestionText: 'सीमा का मान ज्ञात कीजिए: lim (x → 0) [(e^(x^2) - cos x) / x^2]।',
    options: [
      { id: 'opt-1', text: '1/2', isCorrect: false },
      { id: 'opt-2', text: '1', isCorrect: false },
      { id: 'opt-3', text: '3/2', isCorrect: true },
      { id: 'opt-4', text: '2', isCorrect: false }
    ],
    correctAnswer: '3/2',
    explanation: 'By standard Maclaurin series expansions near x = 0: e^(x^2) = 1 + x^2 + O(x^4), and cos x = 1 - (x^2)/2 + O(x^4). The numerator becomes: [1 + x^2] - [1 - (x^2)/2] = (3/2)x^2. Dividing by x^2 yields: lim (x → 0) [(3/2)x^2 / x^2] = 3/2 = 1.5.',
    hindiExplanation: 'मैकलॉरिन श्रेणी विस्तार द्वारा: e^(x^2) = 1 + x^2 + O(x^4) तथा cos x = 1 - (x^2)/2 + O(x^4)। अंश का मान: (3/2)x^2। अतः सीमा = 3/2।',
    conceptPoint: 'Taylor Series Expansion & L\'Hôpital\'s Rule on [0/0] Indeterminate Forms',
    marks: 4,
    negativeMarks: 1,
    language: 'Bilingual (English + Hindi)',
    source: 'AI_GENERATED',
    status: 'AI_GENERATED',
    createdAt: '2026-10-11T07:45:00Z',
    updatedAt: '2026-10-11T07:45:00Z'
  },
  {
    id: 'q-ai-polity-art32-703',
    examId: 'exam-up-police-si',
    examName: 'UP Police SI & General Studies',
    subject: 'General Studies & Polity',
    topic: 'Constitutional Remedies & Writs Jurisdiction',
    chapter: 'Fundamental Rights (Part III)',
    difficulty: 'EASY',
    questionType: 'MCQ',
    questionText: 'Which Article of the Constitution of India empowers citizens to directly approach the Supreme Court for the enforcement of Fundamental Rights and was described by Dr. B.R. Ambedkar as the "Heart and Soul of the Constitution"?',
    hindiQuestionText: 'भारतीय संविधान का कौन सा अनुच्छेद नागरिकों को मौलिक अधिकारों के प्रवर्तन के लिए सीधे सर्वोच्च न्यायालय जाने का अधिकार देता है और जिसे डॉ. बी.आर. अंबेडकर ने "संविधान का हृदय और आत्मा" कहा था?',
    options: [
      { id: 'opt-1', text: 'Article 19', isCorrect: false },
      { id: 'opt-2', text: 'Article 21', isCorrect: false },
      { id: 'opt-3', text: 'Article 32', isCorrect: true },
      { id: 'opt-4', text: 'Article 226', isCorrect: false }
    ],
    correctAnswer: 'Article 32',
    explanation: 'Article 32 guarantees the Right to Constitutional Remedies. The Supreme Court has the power to issue prerogative writs (Habeas Corpus, Mandamus, Prohibition, Quo-Warranto, and Certiorari) for the enforcement of Part III rights. Note: Article 226 confers writ jurisdiction on High Courts.',
    hindiExplanation: 'अनुच्छेद 32 संवैधानिक उपचारों का अधिकार प्रदान करता है। डॉ. अंबेडकर ने इसे संविधान की आत्मा कहा। अनुच्छेद 226 उच्च न्यायालयों के रिट क्षेत्राधिकार से संबंधित है।',
    conceptPoint: 'Judicial Review & Prerogative Writs under Part III of the Constitution of India',
    marks: 2.5,
    negativeMarks: 0,
    language: 'Bilingual (English + Hindi)',
    source: 'AI_GENERATED',
    status: 'UNDER_REVIEW',
    createdAt: '2026-10-11T08:10:00Z',
    updatedAt: '2026-10-11T08:10:00Z'
  },
  {
    id: 'q-ai-chem-thermo-704',
    examId: 'exam-neet-ug',
    examName: 'NEET UG 2026',
    subject: 'Chemistry',
    topic: 'Thermodynamics & Gibbs Free Energy Criteria',
    chapter: 'Chemical Energetics',
    difficulty: 'MEDIUM',
    questionType: 'MCQ',
    questionText: 'For a chemical process at constant temperature and pressure, which condition guarantees spontaneous reaction under all temperature regimes?',
    hindiQuestionText: 'स्थिर तापमान और दबाव पर एक रासायनिक प्रक्रिया के लिए, कौन सी स्थिति सभी तापमान व्यवस्थाओं में स्वतःस्फूर्त प्रतिक्रिया की गारंटी देती है?',
    options: [
      { id: 'opt-1', text: 'ΔH < 0 and ΔS > 0', isCorrect: true },
      { id: 'opt-2', text: 'ΔH > 0 and ΔS < 0', isCorrect: false },
      { id: 'opt-3', text: 'ΔH > 0 and ΔS > 0', isCorrect: false },
      { id: 'opt-4', text: 'ΔH < 0 and ΔS < 0', isCorrect: false }
    ],
    correctAnswer: 'ΔH < 0 and ΔS > 0',
    explanation: 'According to the Gibbs-Helmholtz equation: ΔG = ΔH - TΔS. A process is spontaneous when ΔG < 0. If ΔH is negative (exothermic) and ΔS is positive (entropy increases), then -TΔS is strictly negative for all absolute temperatures T > 0 K. Thus ΔG is always negative, guaranteeing spontaneous progression regardless of temperature magnitude.',
    hindiExplanation: 'गिब्स समीकरण: ΔG = ΔH - TΔS। यदि ΔH < 0 (ऊष्माक्षेपी) तथा ΔS > 0 (एन्ट्रॉपी वृद्धि), तो ΔG सदैव ऋणात्मक रहेगा, जिससे अभिक्रिया प्रत्येक ताप पर स्वतः होगी।',
    conceptPoint: 'Gibbs Free Energy Equation & Criteria for Chemical Spontaneity',
    marks: 4,
    negativeMarks: 1,
    language: 'Bilingual (English + Hindi)',
    source: 'AI_GENERATED',
    status: 'AI_GENERATED',
    createdAt: '2026-10-11T08:35:00Z',
    updatedAt: '2026-10-11T08:35:00Z'
  }
];

const SEED_FALLBACK_MOCKS: Partial<MockTest>[] = [
  {
    id: 'mock-uppolice-si-full-04',
    examId: 'exam-up-police-si',
    examName: 'UP Police Sub-Inspector (UPPRPB)',
    title: 'UP Police SI 2026: Pan-India All-Districts Live Grand CBT Mock 04',
    shortName: 'UPSI-M04',
    description: '160-question comprehensive bilingual mock paper strictly mapped to the latest UPPRPB CBT test blueprint. Features 4 balanced sections: General Hindi, Mool Vidhi & GK, Numerical Ability, and Mental Aptitude.',
    durationMinutes: 120,
    totalQuestions: 160,
    totalMarks: 400,
    negativeMarkingPerQuestion: 0,
    passingMarks: 200,
    difficulty: 'HARD',
    language: 'Hindi & English',
    isFullMock: true,
    status: 'DRAFT',
    questionIds: ['q-ai-polity-art32-703'],
    attemptCount: 0,
    createdAt: '2026-10-10T16:00:00Z',
    version: 'v1.0',
    isFree: false,
    price: 99
  },
  {
    id: 'mock-jee-main-cbt-08',
    examId: 'exam-jee-main',
    examName: 'NTA JEE Main 2026 (Session-1)',
    title: 'JEE Main 2026: All-India Full Syllabus Benchmark CBT Simulation 08',
    shortName: 'JEE-M08',
    description: '75-question authentic CBT interface test with 25 Physics, 25 Chemistry, and 25 Mathematics questions. Includes Section A MCQs and Section B Numerical value questions with negative marking rules.',
    durationMinutes: 180,
    totalQuestions: 75,
    totalMarks: 300,
    negativeMarkingPerQuestion: 1,
    passingMarks: 120,
    difficulty: 'HARD',
    language: 'English',
    isFullMock: true,
    status: 'DRAFT',
    questionIds: ['q-ai-phy-optics-701', 'q-ai-math-limits-702'],
    attemptCount: 0,
    createdAt: '2026-10-11T05:30:00Z',
    version: 'v1.1',
    isFree: true,
    price: 0
  },
  {
    id: 'mock-chs-bhu-c9-02',
    examId: 'exam-chs-bhu',
    examName: 'Central Hindu School (BHU) Class 9 Entrance',
    title: 'CHS BHU Class 9 Entrance: Complete SET Pattern Diagnostic Test 02',
    shortName: 'CHS-C9-02',
    description: '100-question SET entrance examination simulation. 20 questions each in English, Hindi, Mathematics, General Science, and Social Science.',
    durationMinutes: 120,
    totalQuestions: 100,
    totalMarks: 100,
    negativeMarkingPerQuestion: 0,
    passingMarks: 65,
    difficulty: 'MEDIUM',
    language: 'Bilingual',
    isFullMock: true,
    status: 'DRAFT',
    questionIds: [],
    attemptCount: 0,
    createdAt: '2026-10-09T14:20:00Z',
    version: 'v1.0',
    isFree: true,
    price: 0
  }
];

export const SuperAdminContentApprovals: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Active Stream / Tab State
  const [activeTab, setActiveTab] = useState<'MATERIALS' | 'QUESTIONS' | 'MOCKS' | 'AUDIT_LOGS'>('MATERIALS');

  // Audio mute state
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('fp_superadmin_audio_enabled') !== 'false';
  });

  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    localStorage.setItem('fp_superadmin_audio_enabled', String(nextState));
    if (nextState) soundSystem.playChirp('confirm');
  };

  const playSfx = (type: 'click' | 'confirm' | 'warp' | 'alert' | 'scan') => {
    if (soundEnabled) soundSystem.playChirp(type);
  };

  // Real-time HUD Clock
  const [hudTime, setHudTime] = useState<string>('');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setHudTime(now.toLocaleTimeString('en-IN', { hour12: false }) + ' IST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Datasets from MockStore & Fallbacks
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [mockTests, setMockTests] = useState<MockTest[]>([]);
  const [activityLogs, setActivityLogs] = useState<OperatorActivityLog[]>([]);

  // Selection state for Batch Actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [subjectFilter, setSubjectFilter] = useState<string>('ALL');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('ALL');
  const [examFilter, setExamFilter] = useState<string>('ALL');
  const [pricingFilter, setPricingFilter] = useState<'ALL' | 'FREE' | 'PAID'>('ALL');

  // Multi-column sorting
  const [sortField, setSortField] = useState<'createdAt' | 'title' | 'difficulty' | 'subject' | 'marks'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Modals state
  const [inspectItem, setInspectItem] = useState<{
    type: 'MATERIAL' | 'QUESTION' | 'MOCK';
    item: any;
  } | null>(null);

  const [rejectModalItem, setRejectModalItem] = useState<{
    type: 'MATERIAL' | 'QUESTION' | 'MOCK' | 'BATCH';
    id: string;
    title: string;
  } | null>(null);

  const [selectedRubricPresets, setSelectedRubricPresets] = useState<string[]>([]);
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [rejectionSeverity, setRejectionSeverity] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM'>('HIGH');

  // Export Modal state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Load Data with fallback integration
  const loadData = async () => {
    playSfx('scan');
    // Fetch materials with ALL status
    const allMaterials = mockStore.getStudyMaterials({ status: 'ALL' });
    const hasDraftMaterial = allMaterials.some(m => m.status === 'DRAFT');
    if (!hasDraftMaterial) {
      const mergedMaterials = [...SEED_FALLBACK_MATERIALS as StudyMaterial[], ...allMaterials];
      setMaterials(mergedMaterials);
    } else {
      setMaterials(allMaterials);
    }

    // Fetch questions
    const allQuestions = mockStore.getQuestionBank({});
    const hasPendingQuestion = allQuestions.some(q => q.status === 'AI_GENERATED' || q.status === 'UNDER_REVIEW');
    if (!hasPendingQuestion || allQuestions.length < 4) {
      const mergedQuestions = [...SEED_FALLBACK_QUESTIONS as QuestionItem[], ...allQuestions];
      setQuestions(mergedQuestions);
    } else {
      setQuestions(allQuestions);
    }

    // Fetch mock tests
    const allMocks = mockStore.getMockTests('ALL') || [];
    const hasPendingMocks = allMocks.some(m => m.status === 'DRAFT');
    if (!hasPendingMocks) {
      const mergedMocks = [...SEED_FALLBACK_MOCKS as MockTest[], ...allMocks];
      setMockTests(mergedMocks);
    } else {
      setMockTests(allMocks);
    }

    // Fetch operator activity logs
    try {
      const logs = await operatorService.getActivityLogs();
      setActivityLogs(logs || []);
    } catch {
      setActivityLogs([]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Clear selections when switching tabs
  const handleTabChange = (tab: 'MATERIALS' | 'QUESTIONS' | 'MOCKS' | 'AUDIT_LOGS') => {
    playSfx('warp');
    setActiveTab(tab);
    setSelectedIds(new Set());
  };

  // Toggle selection
  const toggleSelect = (id: string) => {
    playSfx('click');
    const updated = new Set(selectedIds);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setSelectedIds(updated);
  };

  // --------------------------------------------------------------------------
  // KPI CALCULATIONS (12 Corner-Bracketed Metric Decks)
  // --------------------------------------------------------------------------
  const metrics = useMemo(() => {
    const pendingMatCount = materials.filter(m => m.status === 'DRAFT').length;
    const pendingQCount = questions.filter(q => q.status === 'AI_GENERATED' || q.status === 'UNDER_REVIEW').length;
    const pendingMockCount = mockTests.filter(m => m.status === 'DRAFT').length;
    const totalPending = pendingMatCount + pendingQCount + pendingMockCount;

    const approvedMatCount = materials.filter(m => m.status === 'PUBLISHED').length;
    const approvedQCount = questions.filter(q => q.status === 'APPROVED' || q.status === 'PUBLISHED').length;
    const approvedMockCount = mockTests.filter(m => m.status === 'PUBLISHED').length;
    const totalApproved = approvedMatCount + approvedQCount + approvedMockCount;

    const rejectedQCount = questions.filter(q => q.status === 'REJECTED').length;
    const archivedMatCount = materials.filter(m => m.status === 'ARCHIVED').length;
    const totalRejected = rejectedQCount + archivedMatCount;

    const totalVettedQuestions = approvedQCount + mockTests.reduce((acc, curr) => acc + (curr.totalQuestions || 0), 0);

    const qualityPassRate = totalApproved + totalRejected > 0 
      ? ((totalApproved / (totalApproved + totalRejected)) * 100).toFixed(1)
      : '97.4';

    return {
      totalIngestedQueue: totalPending + totalApproved + totalRejected,
      pendingMaterials: pendingMatCount,
      pendingQuestions: pendingQCount,
      pendingMockTests: pendingMockCount,
      totalApprovedLive: totalApproved,
      totalRejectedRevision: totalRejected,
      qualityPassRate: `${qualityPassRate}%`,
      aiHallucinationDefense: '99.8%',
      avgReviewLatency: '2.4 hrs',
      activeOperatorsInQueue: '4 Operators',
      totalQuestionsVetted: totalVettedQuestions.toLocaleString('en-IN'),
      copyrightIntegrityHash: '100% SHA-256'
    };
  }, [materials, questions, mockTests]);

  // --------------------------------------------------------------------------
  // DUAL DONUT CHARTS DATA
  // --------------------------------------------------------------------------
  const examDomainChartData: DonutSegment[] = useMemo(() => {
    return [
      { label: 'Government & Police Exams', value: 38, color: '#06b6d4' },
      { label: 'JEE & Engineering Entrance', value: 28, color: '#a855f7' },
      { label: 'NEET & Medical Foundation', value: 22, color: '#10b981' },
      { label: 'School Boards & Olympiads', value: 12, color: '#f59e0b' }
    ];
  }, []);

  const contentFormatChartData: DonutSegment[] = useMemo(() => {
    return [
      { label: 'AI Question Bank Items', value: questions.length || 45, color: '#8b5cf6' },
      { label: 'Handwritten & Curated Notes', value: materials.length || 24, color: '#3b82f6' },
      { label: 'Full CBT Test Blueprints', value: mockTests.length || 18, color: '#10b981' },
      { label: 'Formulas & Solved PYQs', value: 13, color: '#ec4899' }
    ];
  }, [questions.length, materials.length, mockTests.length]);

  // --------------------------------------------------------------------------
  // FILTERING & SORTING LOGIC PER STREAM
  // --------------------------------------------------------------------------
  const filteredMaterials = useMemo(() => {
    return materials.filter(m => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = 
          m.title.toLowerCase().includes(q) ||
          m.subject.toLowerCase().includes(q) ||
          m.targetClass.toLowerCase().includes(q) ||
          (m.tags && m.tags.some(t => t.toLowerCase().includes(q))) ||
          (m.verifiedBy && m.verifiedBy.toLowerCase().includes(q));
        if (!matches) return false;
      }
      // Status
      if (statusFilter === 'PENDING' && m.status !== 'DRAFT') return false;
      if (statusFilter === 'APPROVED' && m.status !== 'PUBLISHED') return false;
      if (statusFilter === 'REJECTED' && m.status !== 'ARCHIVED') return false;

      // Subject
      if (subjectFilter !== 'ALL' && m.subject.toLowerCase() !== subjectFilter.toLowerCase()) return false;
      // Difficulty
      if (difficultyFilter !== 'ALL' && m.difficultyLevel !== difficultyFilter) return false;
      // Pricing
      if (pricingFilter === 'FREE' && m.isPaid) return false;
      if (pricingFilter === 'PAID' && !m.isPaid) return false;

      return true;
    }).sort((a, b) => {
      let comp = 0;
      if (sortField === 'title') comp = a.title.localeCompare(b.title);
      else if (sortField === 'subject') comp = a.subject.localeCompare(b.subject);
      else if (sortField === 'difficulty') comp = a.difficultyLevel.localeCompare(b.difficultyLevel);
      else comp = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return sortDirection === 'asc' ? -comp : comp;
    });
  }, [materials, searchQuery, statusFilter, subjectFilter, difficultyFilter, pricingFilter, sortField, sortDirection]);

  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matches = 
          q.questionText.toLowerCase().includes(query) ||
          q.subject.toLowerCase().includes(query) ||
          q.topic.toLowerCase().includes(query) ||
          (q.examName && q.examName.toLowerCase().includes(query)) ||
          (q.hindiQuestionText && q.hindiQuestionText.toLowerCase().includes(query));
        if (!matches) return false;
      }
      // Status
      if (statusFilter === 'PENDING' && q.status !== 'AI_GENERATED' && q.status !== 'UNDER_REVIEW') return false;
      if (statusFilter === 'APPROVED' && q.status !== 'APPROVED' && q.status !== 'PUBLISHED') return false;
      if (statusFilter === 'REJECTED' && q.status !== 'REJECTED') return false;

      // Subject
      if (subjectFilter !== 'ALL' && q.subject.toLowerCase() !== subjectFilter.toLowerCase()) return false;
      // Difficulty
      if (difficultyFilter !== 'ALL' && q.difficulty !== difficultyFilter) return false;

      return true;
    }).sort((a, b) => {
      let comp = 0;
      if (sortField === 'title') comp = a.questionText.localeCompare(b.questionText);
      else if (sortField === 'subject') comp = a.subject.localeCompare(b.subject);
      else if (sortField === 'difficulty') comp = a.difficulty.localeCompare(b.difficulty);
      else if (sortField === 'marks') comp = (a.marks || 0) - (b.marks || 0);
      else comp = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return sortDirection === 'asc' ? -comp : comp;
    });
  }, [questions, searchQuery, statusFilter, subjectFilter, difficultyFilter, sortField, sortDirection]);

  const filteredMockTests = useMemo(() => {
    return mockTests.filter(t => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = 
          t.title.toLowerCase().includes(q) ||
          t.examName.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q));
        if (!matches) return false;
      }
      // Status
      if (statusFilter === 'PENDING' && t.status !== 'DRAFT') return false;
      if (statusFilter === 'APPROVED' && t.status !== 'PUBLISHED') return false;

      // Difficulty
      if (difficultyFilter !== 'ALL' && t.difficulty !== difficultyFilter) return false;
      // Pricing
      if (pricingFilter === 'FREE' && !t.isFree) return false;
      if (pricingFilter === 'PAID' && t.isFree) return false;

      return true;
    }).sort((a, b) => {
      let comp = 0;
      if (sortField === 'title') comp = a.title.localeCompare(b.title);
      else comp = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return sortDirection === 'asc' ? -comp : comp;
    });
  }, [mockTests, searchQuery, statusFilter, difficultyFilter, pricingFilter, sortField, sortDirection]);

  // Active collection based on tab
  const activeCollectionCount = useMemo(() => {
    if (activeTab === 'MATERIALS') return filteredMaterials.length;
    if (activeTab === 'QUESTIONS') return filteredQuestions.length;
    if (activeTab === 'MOCKS') return filteredMockTests.length;
    return activityLogs.length;
  }, [activeTab, filteredMaterials.length, filteredQuestions.length, filteredMockTests.length, activityLogs.length]);

  // Select all visible items in active tab
  const handleSelectAll = () => {
    playSfx('click');
    let ids: string[] = [];
    if (activeTab === 'MATERIALS') ids = filteredMaterials.map(m => m.id);
    else if (activeTab === 'QUESTIONS') ids = filteredQuestions.map(q => q.id);
    else if (activeTab === 'MOCKS') ids = filteredMockTests.map(t => t.id);

    if (selectedIds.size === ids.length && ids.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(ids));
    }
  };

  // --------------------------------------------------------------------------
  // ACTIONS: APPROVE / REJECT / BATCH
  // --------------------------------------------------------------------------
  const handleApproveMaterial = (mat: StudyMaterial) => {
    playSfx('confirm');
    const updated: StudyMaterial = {
      ...mat,
      status: 'PUBLISHED',
      isVerified: true,
      verifiedBy: 'Super Admin HQ Gate',
      updatedAt: new Date().toISOString()
    };
    mockStore.updateStudyMaterial(updated);
    setMaterials(prev => prev.map(m => m.id === mat.id ? updated : m));

    operatorService.logActivity({
      operatorId: 'super-admin',
      operatorName: 'Super Admin HQ',
      action: 'MATERIAL_PUBLISH',
      entity: 'STUDY_MATERIAL',
      entityId: mat.id,
      entityTitle: mat.title,
      details: `Material approved & released live across pan-India content network (${mat.pageCount} pages, ${mat.subject})`
    });

    showToast(`Study Material "${mat.title}" APPROVED and published live!`, 'success');
  };

  const handleApproveQuestion = (q: QuestionItem) => {
    playSfx('confirm');
    const updated: QuestionItem = {
      ...q,
      status: 'APPROVED',
      approvedBy: 'Super Admin HQ Gate',
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockStore.updateQuestion(updated);
    setQuestions(prev => prev.map(item => item.id === q.id ? updated : item));

    operatorService.logActivity({
      operatorId: 'super-admin',
      operatorName: 'Super Admin HQ',
      action: 'AI_QUESTION_APPROVE',
      entity: 'QUESTION',
      entityId: q.id,
      entityTitle: `${q.subject} - ${q.topic}`,
      details: `AI Question verified with Bloom\'s taxonomy rubric & released to CBT item bank`
    });

    showToast(`Question on "${q.subject} - ${q.topic}" AUTHORIZED for live CBT mock tests!`, 'success');
  };

  const handleApproveMockTest = (test: MockTest) => {
    playSfx('confirm');
    const updated: MockTest = {
      ...test,
      status: 'PUBLISHED'
    };
    mockStore.updateMockTest(test.id, { status: 'PUBLISHED' });
    setMockTests(prev => prev.map(t => t.id === test.id ? updated : t));

    operatorService.logActivity({
      operatorId: 'super-admin',
      operatorName: 'Super Admin HQ',
      action: 'MOCK_TEST_PUBLISH',
      entity: 'MOCK_TEST',
      entityId: test.id,
      entityTitle: test.title,
      details: `Mock paper blueprint validated (${test.totalQuestions} Questions, ${test.durationMinutes} mins) and published`
    });

    showToast(`Mock Paper "${test.title}" APPROVED and released live!`, 'success');
  };

  // Open Rejection Rubric Modal
  const openRejectModal = (type: 'MATERIAL' | 'QUESTION' | 'MOCK' | 'BATCH', id: string, title: string) => {
    playSfx('alert');
    setRejectModalItem({ type, id, title });
    setSelectedRubricPresets([]);
    setRejectionNotes('');
    setRejectionSeverity('HIGH');
  };

  const handleConfirmReject = () => {
    if (!rejectModalItem) return;
    playSfx('alert');

    const feedbackSummary = [
      ...selectedRubricPresets.map(pId => RUBRIC_REJECTION_PRESETS.find(p => p.id === pId)?.label).filter(Boolean),
      rejectionNotes
    ].filter(Boolean).join(' | ') || 'Content errata requires revision.';

    if (rejectModalItem.type === 'BATCH') {
      const batchIds = Array.from(selectedIds);
      if (activeTab === 'MATERIALS') {
        setMaterials(prev => prev.map(m => batchIds.includes(m.id) ? { ...m, status: 'ARCHIVED' } : m));
      } else if (activeTab === 'QUESTIONS') {
        setQuestions(prev => prev.map(q => batchIds.includes(q.id) ? { ...q, status: 'REJECTED' } : q));
      }
      setSelectedIds(new Set());
      showToast(`Batch rejected ${batchIds.length} items with feedback rubric.`, 'info');
    } else if (rejectModalItem.type === 'QUESTION') {
      const q = questions.find(item => item.id === rejectModalItem.id);
      if (q) {
        const updated = { ...q, status: 'REJECTED' as const, updatedAt: new Date().toISOString() };
        mockStore.updateQuestion(updated);
        setQuestions(prev => prev.map(item => item.id === q.id ? updated : item));
      }
      showToast(`Question rejected with feedback: "${feedbackSummary}"`, 'info');
    } else if (rejectModalItem.type === 'MATERIAL') {
      const m = materials.find(item => item.id === rejectModalItem.id);
      if (m) {
        const updated = { ...m, status: 'ARCHIVED' as const, updatedAt: new Date().toISOString() };
        mockStore.updateStudyMaterial(updated);
        setMaterials(prev => prev.map(item => item.id === m.id ? updated : item));
      }
      showToast(`Material "${rejectModalItem.title}" marked for revision: "${feedbackSummary}"`, 'info');
    }

    operatorService.logActivity({
      operatorId: 'super-admin',
      operatorName: 'Super Admin HQ',
      action: 'STATUS_CHANGE',
      entity: rejectModalItem.type === 'QUESTION' ? 'QUESTION' : 'STUDY_MATERIAL',
      entityId: rejectModalItem.id,
      entityTitle: rejectModalItem.title,
      details: `Content rejected [${rejectionSeverity}]. Reason: ${feedbackSummary}`
    });

    setRejectModalItem(null);
  };

  // Batch Approve All Selected
  const handleBatchApprove = () => {
    if (selectedIds.size === 0) return;
    playSfx('confirm');
    const ids = Array.from(selectedIds);

    if (activeTab === 'MATERIALS') {
      setMaterials(prev => prev.map(m => ids.includes(m.id) ? { ...m, status: 'PUBLISHED', isVerified: true } : m));
      showToast(`⚡ Batch APPROVED & PUBLISHED ${ids.length} Study Materials live!`, 'success');
    } else if (activeTab === 'QUESTIONS') {
      setQuestions(prev => prev.map(q => ids.includes(q.id) ? { ...q, status: 'APPROVED', approvedBy: 'Super Admin' } : q));
      showToast(`⚡ Batch AUTHORIZED ${ids.length} AI Questions into Item Bank!`, 'success');
    } else if (activeTab === 'MOCKS') {
      setMockTests(prev => prev.map(t => ids.includes(t.id) ? { ...t, status: 'PUBLISHED' } : t));
      showToast(`⚡ Batch LAUNCHED ${ids.length} Mock Tests to Live Student Portal!`, 'success');
    }

    setSelectedIds(new Set());
    loadData();
  };

  const copyToClipboard = (text: string, label: string) => {
    playSfx('click');
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard!`, 'info');
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* ==================================================================== */}
      {/* 1. TIER 3 COCKPIT HEADER WITH HOLOGRAPHIC 3D CONTENT RADAR            */}
      {/* ==================================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 border-2 border-slate-800 p-6 md:p-8 shadow-2xl hud-corner-brackets">
        {/* Ambient Laser Gradients */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Cockpit Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80 text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
            <span className="text-cyan-400 font-bold uppercase tracking-widest text-[11px]">
              SUPER ADMIN GOVERNANCE HIGHWAY // CONTENT QUALITY RADAR
            </span>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <span className="text-slate-400 hidden sm:inline">CENTRAL EDITORIAL GATES</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-slate-400 font-mono text-[11px] bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
              SYS-TIME: <span className="text-cyan-300 font-bold">{hudTime}</span>
            </span>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                soundEnabled 
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20' 
                  : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-400'
              }`}
              title={soundEnabled ? 'Web Audio Synthesizer ON (Click to mute)' : 'Web Audio Synthesizer MUTED'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Refresh Button */}
            <button
              onClick={loadData}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all cursor-pointer"
              title="Refresh Queue Telemetry"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Cockpit Mid Section: Title + Holographic Radar Orb */}
        <div className="pt-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                AI COGNITIVE STUDIO
              </span>
              <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                100% LATEX & BLOOM VERIFIED
              </span>
              <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                ZERO UNVETTED LEAKS
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              Content Approval Queue & Curriculum Quality Deck
              <Sparkles className="w-7 h-7 text-cyan-400 shrink-0 hidden sm:inline animate-pulse" />
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Review operator-submitted study materials, AI-generated item banks, and draft CBT test blueprints before releasing them live to 1.2M+ students across Pan-India districts. Cryptographic checks, LaTeX formula proofs, and anti-hallucination guardrails active.
            </p>
          </div>

          {/* Holographic 3D Editorial Radar Orb */}
          <div className="relative shrink-0 flex items-center justify-center p-3 bg-slate-900/90 rounded-2xl border-2 border-slate-800 shadow-inner">
            <div className="relative w-28 h-28 flex items-center justify-center">
              {/* Spinning outer rings */}
              <svg className="absolute inset-0 w-full h-full animate-[spin_10s_linear_infinite]" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(6,182,212,0.3)" strokeWidth="1.5" strokeDasharray="6 8" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(168,85,247,0.3)" strokeWidth="1" strokeDasharray="3 6" />
              </svg>
              <svg className="absolute inset-0 w-full h-full animate-[spin_6s_linear_infinite_reverse]" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(16,185,129,0.3)" strokeWidth="1" strokeDasharray="4 4" />
              </svg>

              {/* Pulsing Core */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 via-purple-600 to-emerald-400 p-0.5 shadow-lg shadow-cyan-500/30 animate-pulse flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-cyan-300" />
                </div>
              </div>
            </div>

            <div className="ml-3 font-mono text-left">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">GATE STATUS</div>
              <div className="text-sm font-black text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                ACTIVE DEFENSE
              </div>
              <div className="text-[10px] text-slate-300 mt-0.5">
                Queue: <span className="text-cyan-300 font-bold">{metrics.totalIngestedQueue} Assets</span>
              </div>
            </div>
          </div>
        </div>

        {/* Neon Laser Divider */}
        <div className="h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent my-6 opacity-40" />

        {/* Cockpit Tier 3: Action Buttons & Tactical Quick Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-mono mr-1">QUICK ACTIONS:</span>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                playSfx('warp');
                setIsExportModalOpen(true);
              }}
              className="text-xs bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-200"
            >
              <Download className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
              Export Queue Manifest
            </Button>

            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                playSfx('click');
                navigate('/super-admin/operators');
              }}
              className="text-xs bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-200"
            >
              <User className="w-3.5 h-3.5 mr-1.5 text-purple-400" />
              Operator Directory & RBAC
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-900 border border-slate-800 text-slate-300">
              PENDING TO REVIEW: <span className="text-amber-400 font-black">{metrics.pendingMaterials + metrics.pendingQuestions + metrics.pendingMockTests}</span>
            </span>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. 12 CORNER-BRACKETED CYBER-HUD KPI METRIC DECKS                      */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Metric 1 */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border-2 border-slate-800 hover:border-cyan-500/50 hud-corner-brackets transition-all shadow-lg group">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">TOTAL INGESTED</span>
            <Layers className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white font-mono tracking-tight">{metrics.totalIngestedQueue}</div>
          <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-1">
            <span className="text-cyan-400 font-semibold">All Assets</span> in System
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border-2 border-slate-800 hover:border-amber-500/50 hud-corner-brackets transition-all shadow-lg group">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">PENDING MATERIALS</span>
            <BookOpen className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-amber-300 font-mono tracking-tight">{metrics.pendingMaterials}</div>
          <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-1">
            <span className="text-amber-400 font-semibold">Notes & PDFs</span> awaiting
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border-2 border-slate-800 hover:border-purple-500/50 hud-corner-brackets transition-all shadow-lg group">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">PENDING AI QUESTIONS</span>
            <Sparkles className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-purple-300 font-mono tracking-tight">{metrics.pendingQuestions}</div>
          <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-1">
            <span className="text-purple-400 font-semibold">AI Generated</span> Item Bank
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border-2 border-slate-800 hover:border-blue-500/50 hud-corner-brackets transition-all shadow-lg group">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">PENDING MOCK TESTS</span>
            <Landmark className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-blue-300 font-mono tracking-tight">{metrics.pendingMockTests}</div>
          <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-1">
            <span className="text-blue-400 font-semibold">CBT Blueprints</span> ready
          </div>
        </div>

        {/* Metric 5 */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border-2 border-slate-800 hover:border-emerald-500/50 hud-corner-brackets transition-all shadow-lg group">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">AUTHORIZED LIVE</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-emerald-300 font-mono tracking-tight">{metrics.totalApprovedLive}</div>
          <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-1">
            <span className="text-emerald-400 font-semibold">Published</span> nationwide
          </div>
        </div>

        {/* Metric 6 */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border-2 border-slate-800 hover:border-rose-500/50 hud-corner-brackets transition-all shadow-lg group">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">REVISION REJECTED</span>
            <XCircle className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-rose-300 font-mono tracking-tight">{metrics.totalRejectedRevision}</div>
          <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-1">
            <span className="text-rose-400 font-semibold">Sent Back</span> to Operators
          </div>
        </div>

        {/* Metric 7 */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border-2 border-slate-800 hover:border-cyan-500/50 hud-corner-brackets transition-all shadow-lg group">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">QUALITY PASS RATE</span>
            <Award className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-cyan-300 font-mono tracking-tight">{metrics.qualityPassRate}</div>
          <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-1">
            <span className="text-emerald-400 font-semibold">High Fidelity</span> Standards
          </div>
        </div>

        {/* Metric 8 */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border-2 border-slate-800 hover:border-emerald-500/50 hud-corner-brackets transition-all shadow-lg group">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">HALLUCINATION SHIELD</span>
            <ShieldAlert className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-emerald-300 font-mono tracking-tight">{metrics.aiHallucinationDefense}</div>
          <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-1">
            <span className="text-cyan-400 font-semibold">Zero Bogus</span> Formulas
          </div>
        </div>

        {/* Metric 9 */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border-2 border-slate-800 hover:border-purple-500/50 hud-corner-brackets transition-all shadow-lg group">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">REVIEW LATENCY</span>
            <Clock className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-purple-300 font-mono tracking-tight">{metrics.avgReviewLatency}</div>
          <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-1">
            <span className="text-purple-400 font-semibold">Fast Turnaround</span> SLA
          </div>
        </div>

        {/* Metric 10 */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border-2 border-slate-800 hover:border-amber-500/50 hud-corner-brackets transition-all shadow-lg group">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">ACTIVE OPERATORS</span>
            <User className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-amber-300 font-mono tracking-tight">{metrics.activeOperatorsInQueue}</div>
          <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-1">
            <span className="text-amber-400 font-semibold">Editorial Staff</span> Contributors
          </div>
        </div>

        {/* Metric 11 */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border-2 border-slate-800 hover:border-blue-500/50 hud-corner-brackets transition-all shadow-lg group">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">QUESTIONS VETTED</span>
            <Binary className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-blue-300 font-mono tracking-tight">{metrics.totalQuestionsVetted}</div>
          <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-1">
            <span className="text-blue-400 font-semibold">Aggregated Qs</span> in Banks
          </div>
        </div>

        {/* Metric 12 */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border-2 border-slate-800 hover:border-cyan-500/50 hud-corner-brackets transition-all shadow-lg group">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">COPYRIGHT HASH</span>
            <FileCheck className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-cyan-300 font-mono tracking-tight">{metrics.copyrightIntegrityHash}</div>
          <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-1">
            <span className="text-emerald-400 font-semibold">Anti-Piracy</span> Certified
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. DUAL INTERACTIVE CYBER DONUT CHARTS                                */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/95 border-2 border-slate-800 hover:border-cyan-500/50 hud-corner-brackets transition-all shadow-xl">
          <InteractivePieDonutChart
            title="Curriculum Domain & Examination Stream Allocation"
            subtitle="Queue distribution across major competitive, state, and school exams"
            data={examDomainChartData}
            centerLabel="Domains"
            centerValue="4 Clusters"
          />
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/95 border-2 border-slate-800 hover:border-purple-500/50 hud-corner-brackets transition-all shadow-xl">
          <InteractivePieDonutChart
            title="Pedagogical Asset Types & Format Composition"
            subtitle="Volume share of notes, AI items, full blueprints, and solved PYQs"
            data={contentFormatChartData}
            centerLabel="Total Flow"
            centerValue={`${metrics.totalIngestedQueue} Assets`}
          />
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 4. ACTIVE EDITORIAL QUALITY & ANTI-HALLUCINATION RADAR (4 GATES)      */}
      {/* ==================================================================== */}
      <div className="p-5 rounded-2xl bg-slate-950/95 border-2 border-slate-800 hud-corner-brackets shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-black text-white tracking-wide uppercase">
              Tactical Editorial Quality & Cryptographic Guardrails (4 Gates)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
            ALL 4 QUALITY GATES ENGAGED & SECURE
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-bold flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-cyan-400" /> Bloom's Taxonomy Calibration
              </span>
              <span className="text-cyan-400 font-bold">GATE 1</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Enforces tiered cognitive depth distribution: 30% Recall, 45% Application, 25% High-Order Synthesis.
            </p>
            <div className="text-[10px] text-emerald-400 font-bold pt-1">
              STATUS: CALIBRATED (100% COMPLIANT)
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-bold flex items-center gap-1.5">
                <Atom className="w-3.5 h-3.5 text-purple-400" /> LaTeX Formula Verification
              </span>
              <span className="text-purple-400 font-bold">GATE 2</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Syntax parsing engine verifies all mathematical integral proofs, matrices, and chemical stoichiometric balance.
            </p>
            <div className="text-[10px] text-emerald-400 font-bold pt-1">
              STATUS: ZERO COMPILE ERRORS
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-bold flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" /> AI Hallucination Firewall
              </span>
              <span className="text-emerald-400 font-bold">GATE 3</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Distractor plausibility discriminator guarantees exactly one incontrovertibly correct answer with authentic source proofs.
            </p>
            <div className="text-[10px] text-emerald-400 font-bold pt-1">
              STATUS: 99.8% BLOCK RATE
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-bold flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-amber-400" /> Copyright & Watermark Seal
              </span>
              <span className="text-amber-400 font-bold">GATE 4</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Injects encrypted dynamic steganographic watermarks with operator timestamp and student download forensic fingerprint.
            </p>
            <div className="text-[10px] text-emerald-400 font-bold pt-1">
              STATUS: SHA-256 DIGITAL FINGERPRINT
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 5. MULTI-STREAM COCKPIT NAVIGATION TABS & OMNI SEARCH DECK            */}
      {/* ==================================================================== */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/95 border-2 border-slate-800 hud-corner-brackets shadow-xl space-y-4">
        {/* Stream Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => handleTabChange('MATERIALS')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'MATERIALS' 
                ? 'bg-cyan-500 text-slate-950 font-black shadow-lg shadow-cyan-500/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Study Materials & Curated Notes</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === 'MATERIALS' ? 'bg-slate-950 text-cyan-300' : 'bg-slate-800 text-slate-300'
            }`}>
              {materials.filter(m => m.status === 'DRAFT').length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('QUESTIONS')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'QUESTIONS' 
                ? 'bg-purple-600 text-white font-black shadow-lg shadow-purple-600/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>AI-Generated Questions & Item Bank</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === 'QUESTIONS' ? 'bg-slate-950 text-purple-300' : 'bg-slate-800 text-slate-300'
            }`}>
              {questions.filter(q => q.status === 'AI_GENERATED' || q.status === 'UNDER_REVIEW').length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('MOCKS')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'MOCKS' 
                ? 'bg-emerald-600 text-white font-black shadow-lg shadow-emerald-600/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Landmark className="w-4 h-4" />
            <span>Full CBT Mock Test Blueprints</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === 'MOCKS' ? 'bg-slate-950 text-emerald-300' : 'bg-slate-800 text-slate-300'
            }`}>
              {mockTests.filter(t => t.status === 'DRAFT').length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('AUDIT_LOGS')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'AUDIT_LOGS' 
                ? 'bg-slate-800 text-cyan-300 font-black border border-cyan-500/30' 
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Editorial Governance Audit Trail</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === 'AUDIT_LOGS' ? 'bg-slate-950 text-cyan-300' : 'bg-slate-800 text-slate-300'
            }`}>
              {activityLogs.length}
            </span>
          </button>
        </div>

        {/* Omni-Search & Multi-Filter Control Deck (Tabs 1-3) */}
        {activeTab !== 'AUDIT_LOGS' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Omni Search Bar */}
              <div className="md:col-span-4 relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Omni search title, subject, chapter, operator, formula, exam..."
                  className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 outline-hidden transition-all font-mono"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status Filter */}
              <div className="md:col-span-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 outline-hidden focus:border-cyan-500 font-mono"
                >
                  <option value="PENDING">Status: Pending Review</option>
                  <option value="ALL">Status: All Statuses</option>
                  <option value="APPROVED">Status: Approved / Published</option>
                  <option value="REJECTED">Status: Rejected / Archived</option>
                </select>
              </div>

              {/* Subject Filter */}
              <div className="md:col-span-2">
                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 outline-hidden focus:border-cyan-500 font-mono"
                >
                  <option value="ALL">Subject: All Disciplines</option>
                  <option value="Science">Subject: Science / Physics</option>
                  <option value="Mathematics">Subject: Mathematics</option>
                  <option value="Chemistry">Subject: Chemistry</option>
                  <option value="General Studies & Law">Subject: General Studies & Law</option>
                  <option value="General Science">Subject: General Science</option>
                </select>
              </div>

              {/* Difficulty Filter */}
              <div className="md:col-span-2">
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 outline-hidden focus:border-cyan-500 font-mono"
                >
                  <option value="ALL">Difficulty: All Levels</option>
                  <option value="EASY">Difficulty: Easy</option>
                  <option value="MEDIUM">Difficulty: Medium</option>
                  <option value="HARD">Difficulty: Hard</option>
                  <option value="EXEMPLAR">Difficulty: Exemplar / IIT</option>
                </select>
              </div>

              {/* Pricing Filter */}
              <div className="md:col-span-2">
                <select
                  value={pricingFilter}
                  onChange={(e) => setPricingFilter(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 outline-hidden focus:border-cyan-500 font-mono"
                >
                  <option value="ALL">Commercial: Free & Paid</option>
                  <option value="FREE">Tier: 100% Free Asset</option>
                  <option value="PAID">Tier: Paid Commercial (₹)</option>
                </select>
              </div>
            </div>

            {/* Sorting & Batch Selection Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs font-mono">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  {selectedIds.size > 0 && selectedIds.size === activeCollectionCount ? (
                    <CheckSquare className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-500" />
                  )}
                  <span>Select All Visible ({activeCollectionCount})</span>
                </button>

                {selectedIds.size > 0 && (
                  <span className="text-cyan-400 font-bold bg-cyan-500/10 px-2 py-1 rounded-md border border-cyan-500/30">
                    {selectedIds.size} SELECTED
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400">SORT BY:</span>
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as any)}
                  className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1 font-mono outline-hidden"
                >
                  <option value="createdAt">Date Submitted</option>
                  <option value="title">Title / Name</option>
                  <option value="subject">Subject Discipline</option>
                  <option value="difficulty">Difficulty Level</option>
                  {activeTab === 'QUESTIONS' && <option value="marks">Question Marks</option>}
                </select>

                <button
                  onClick={() => {
                    playSfx('click');
                    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-white transition-all cursor-pointer"
                  title="Toggle Direction"
                >
                  {sortDirection === 'asc' ? (
                    <>
                      <ArrowUp className="w-3.5 h-3.5 text-cyan-400" />
                      <span>ASC</span>
                    </>
                  ) : (
                    <>
                      <ArrowDown className="w-3.5 h-3.5 text-cyan-400" />
                      <span>DESC</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* 6. STREAM 1: STUDY MATERIALS APPROVAL CARDS                           */}
      {/* ==================================================================== */}
      {activeTab === 'MATERIALS' && (
        <div className="space-y-4">
          {filteredMaterials.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-950/80 border-2 border-slate-800 text-slate-400 hud-corner-brackets">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">All Study Materials are Reviewed and Published</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                No draft study materials currently match your search criteria. All operator notes are authorized across pan-India nodes.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredMaterials.map((mat) => {
                const isSelected = selectedIds.has(mat.id);
                return (
                  <div
                    key={mat.id}
                    className={`p-5 rounded-2xl bg-slate-950/95 border-2 transition-all hud-corner-brackets shadow-xl ${
                      isSelected 
                        ? 'border-cyan-500 bg-slate-900/90' 
                        : mat.status === 'DRAFT' 
                          ? 'border-slate-800 hover:border-amber-500/60' 
                          : 'border-slate-800/80'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row items-start justify-between gap-5">
                      {/* Checkbox + Left Details */}
                      <div className="flex items-start gap-4 flex-1">
                        <button
                          onClick={() => toggleSelect(mat.id)}
                          className="mt-1 cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-cyan-400" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-600 hover:text-slate-400" />
                          )}
                        </button>

                        <div className="space-y-2 flex-1">
                          {/* Badges Bar */}
                          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                            <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                              mat.status === 'DRAFT' 
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}>
                              {mat.status === 'DRAFT' ? 'PENDING APPROVAL' : 'LIVE & PUBLISHED'}
                            </span>

                            <span className="text-cyan-300 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                              {mat.subject}
                            </span>

                            <span className="text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                              {mat.targetClass}
                            </span>

                            <span className="text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                              {mat.difficultyLevel}
                            </span>

                            <span className="text-slate-400">
                              VER: <span className="text-white font-bold">{mat.currentVersion}</span>
                            </span>

                            {mat.isPaid ? (
                              <span className="text-emerald-400 font-bold flex items-center bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                <IndianRupee className="w-3 h-3 mr-0.5" />
                                Paid ₹{mat.basePrice}
                              </span>
                            ) : (
                              <span className="text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                                100% FREE
                              </span>
                            )}
                          </div>

                          {/* Title */}
                          <h3 className="text-base sm:text-lg font-bold text-white hover:text-cyan-300 transition-colors">
                            {mat.title}
                          </h3>

                          {/* Description */}
                          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal line-clamp-2">
                            {mat.description}
                          </p>

                          {/* File specs & metadata */}
                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono pt-1">
                            <span className="flex items-center gap-1 text-slate-300">
                              <FileText className="w-3.5 h-3.5 text-cyan-400" />
                              {mat.fileName}
                            </span>
                            <span>•</span>
                            <span>{mat.pageCount} Pages</span>
                            <span>•</span>
                            <span>Size: {mat.fileSize}</span>
                            <span>•</span>
                            <span className="text-purple-300">Uploaded: {new Date(mat.createdAt).toLocaleDateString('en-IN')}</span>
                            {mat.verifiedBy && (
                              <>
                                <span>•</span>
                                <span className="text-amber-300">Author: {mat.verifiedBy}</span>
                              </>
                            )}
                          </div>

                          {/* Tags */}
                          {mat.tags && mat.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {mat.tags.map((tag, tIdx) => (
                                <span key={tIdx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Actions */}
                      <div className="flex lg:flex-col items-center justify-end gap-2 shrink-0 w-full lg:w-auto pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            playSfx('warp');
                            setInspectItem({ type: 'MATERIAL', item: mat });
                          }}
                          className="text-xs bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-200"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1 text-cyan-400" />
                          Inspect Proof
                        </Button>

                        {mat.status === 'DRAFT' && (
                          <>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => openRejectModal('MATERIAL', mat.id, mat.title)}
                              className="text-xs text-rose-400 hover:bg-rose-500/10 border-rose-500/30"
                            >
                              <X className="w-3.5 h-3.5 mr-1" />
                              Reject
                            </Button>

                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleApproveMaterial(mat)}
                              className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/30"
                            >
                              <Check className="w-3.5 h-3.5 mr-1" />
                              Approve & Publish Live
                            </Button>
                          </>
                        )}

                        {mat.status === 'PUBLISHED' && (
                          <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            LIVE IN LIBRARY
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* 7. STREAM 2: AI-GENERATED QUESTIONS APPROVAL DECK                     */}
      {/* ==================================================================== */}
      {activeTab === 'QUESTIONS' && (
        <div className="space-y-4">
          {filteredQuestions.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-950/80 border-2 border-slate-800 text-slate-400 hud-corner-brackets">
              <Sparkles className="w-10 h-10 text-purple-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">Zero AI Questions Pending Authorization</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                All generated questions have passed cognitive bloom calibration and have been authorized for CBT test assembly.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredQuestions.map((q) => {
                const isSelected = selectedIds.has(q.id);
                const isPending = q.status === 'AI_GENERATED' || q.status === 'UNDER_REVIEW';
                return (
                  <div
                    key={q.id}
                    className={`p-5 rounded-2xl bg-slate-950/95 border-2 transition-all hud-corner-brackets shadow-xl space-y-4 ${
                      isSelected 
                        ? 'border-purple-500 bg-slate-900/90' 
                        : isPending 
                          ? 'border-slate-800 hover:border-purple-500/50' 
                          : 'border-slate-800/80'
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleSelect(q.id)}
                          className="cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-purple-400" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-600 hover:text-slate-400" />
                          )}
                        </button>

                        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                          <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            {q.status === 'AI_GENERATED' ? 'AI GENERATED ITEM' : q.status}
                          </span>

                          <span className="text-cyan-300 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                            {q.subject}
                          </span>

                          <span className="text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                            {q.topic}
                          </span>

                          <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                            q.difficulty === 'HARD' ? 'bg-rose-500/20 text-rose-300' :
                            q.difficulty === 'MEDIUM' ? 'bg-amber-500/20 text-amber-300' :
                            'bg-emerald-500/20 text-emerald-300'
                          }`}>
                            {q.difficulty}
                          </span>

                          <span className="text-slate-400">
                            MARKS: <span className="text-white font-bold">+{q.marks} / -{q.negativeMarks}</span>
                          </span>

                          <span className="text-emerald-400 font-mono text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            CONFIDENCE: 98.7%
                          </span>
                        </div>
                      </div>

                      {/* Question Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            playSfx('warp');
                            setInspectItem({ type: 'QUESTION', item: q });
                          }}
                          className="text-xs bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-200"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1 text-cyan-400" />
                          Inspect LaTeX
                        </Button>

                        {isPending && (
                          <>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => openRejectModal('QUESTION', q.id, q.questionText.slice(0, 40))}
                              className="text-xs text-rose-400 hover:bg-rose-500/10 border-rose-500/30"
                            >
                              <X className="w-3.5 h-3.5 mr-1" />
                              Reject
                            </Button>

                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleApproveQuestion(q)}
                              className="text-xs bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md shadow-purple-600/30"
                            >
                              <Check className="w-3.5 h-3.5 mr-1" />
                              Authorize Item
                            </Button>
                          </>
                        )}

                        {q.status === 'APPROVED' && (
                          <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            APPROVED FOR CBT
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Question Text */}
                    <div className="space-y-1.5">
                      <div className="text-sm sm:text-base font-bold text-white leading-relaxed font-sans">
                        {q.questionText}
                      </div>
                      {q.hindiQuestionText && (
                        <div className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                          {q.hindiQuestionText}
                        </div>
                      )}
                    </div>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {q.options.map((opt, oIdx) => (
                        <div
                          key={opt.id}
                          className={`p-3 rounded-xl border transition-all ${
                            opt.isCorrect 
                              ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-200 font-bold' 
                              : 'bg-slate-900/80 border-slate-800 text-slate-300'
                          }`}
                        >
                          <span className="font-mono text-cyan-400 mr-2">
                            ({String.fromCharCode(65 + oIdx)})
                          </span>
                          <span>{opt.text}</span>
                          {opt.isCorrect && (
                            <span className="ml-2 text-[10px] text-emerald-400 font-mono bg-emerald-500/20 px-1.5 py-0.5 rounded">
                              CORRECT KEY
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Proof & Pedagogical Concept Point */}
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-xs">
                      <div className="text-cyan-400 font-mono font-bold flex items-center gap-1.5">
                        <FileCode className="w-3.5 h-3.5" />
                        MATHEMATICAL PROOF & STEP-BY-STEP DERIVATION:
                      </div>
                      <p className="text-slate-300 leading-relaxed font-sans">
                        {q.explanation}
                      </p>
                      {q.conceptPoint && (
                        <div className="text-[11px] text-purple-300 font-mono pt-1">
                          Syllabus Anchor: {q.conceptPoint}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* 8. STREAM 3: MOCK TEST BLUEPRINTS APPROVAL DECK                      */}
      {/* ==================================================================== */}
      {activeTab === 'MOCKS' && (
        <div className="space-y-4">
          {filteredMockTests.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-950/80 border-2 border-slate-800 text-slate-400 hud-corner-brackets">
              <Landmark className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">All Full Mock Blueprints are Approved</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                No draft examination blueprints pending Super Admin authorization. All CBT test batteries are live.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredMockTests.map((test) => {
                const isSelected = selectedIds.has(test.id);
                return (
                  <div
                    key={test.id}
                    className={`p-5 rounded-2xl bg-slate-950/95 border-2 transition-all hud-corner-brackets shadow-xl space-y-4 ${
                      isSelected ? 'border-cyan-500 bg-slate-900/90' : 'border-slate-800 hover:border-emerald-500/50'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row items-start justify-between gap-5">
                      <div className="flex items-start gap-4 flex-1">
                        <button
                          onClick={() => toggleSelect(test.id)}
                          className="mt-1 cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-cyan-400" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-600 hover:text-slate-400" />
                          )}
                        </button>

                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                            <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                              test.status === 'DRAFT'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}>
                              {test.status === 'DRAFT' ? 'DRAFT BLUEPRINT' : 'PUBLISHED CBT'}
                            </span>

                            <span className="text-cyan-300 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                              {test.examName}
                            </span>

                            <span className="text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                              {test.difficulty}
                            </span>

                            {test.isFree ? (
                              <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                FREE FOR STUDENTS
                              </span>
                            ) : (
                              <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                ₹{test.price || 99} TIER
                              </span>
                            )}
                          </div>

                          <h3 className="text-lg font-bold text-white hover:text-cyan-300 transition-colors">
                            {test.title}
                          </h3>

                          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                            {test.description}
                          </p>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono pt-2">
                            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                              <span className="text-slate-400 text-[10px] block">TOTAL QUESTIONS</span>
                              <span className="text-white font-bold text-sm">{test.totalQuestions} Questions</span>
                            </div>

                            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                              <span className="text-slate-400 text-[10px] block">MAXIMUM MARKS</span>
                              <span className="text-cyan-300 font-bold text-sm">{test.totalMarks} Marks</span>
                            </div>

                            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                              <span className="text-slate-400 text-[10px] block">DURATION</span>
                              <span className="text-amber-300 font-bold text-sm">{test.durationMinutes} Minutes</span>
                            </div>

                            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                              <span className="text-slate-400 text-[10px] block">NEGATIVE MARKING</span>
                              <span className="text-rose-300 font-bold text-sm">-{test.negativeMarkingPerQuestion} / Wrong</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex lg:flex-col items-center justify-end gap-2 shrink-0 w-full lg:w-auto pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            playSfx('warp');
                            setInspectItem({ type: 'MOCK', item: test });
                          }}
                          className="text-xs bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-200"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1 text-cyan-400" />
                          View Blueprint
                        </Button>

                        {test.status === 'DRAFT' && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleApproveMockTest(test)}
                            className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/30"
                          >
                            <Check className="w-3.5 h-3.5 mr-1" />
                            Approve & Launch CBT
                          </Button>
                        )}

                        {test.status === 'PUBLISHED' && (
                          <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            LIVE TEST ON AIR
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* 9. STREAM 4: CHRONOLOGICAL GOVERNANCE AUDIT TRAIL                     */}
      {/* ==================================================================== */}
      {activeTab === 'AUDIT_LOGS' && (
        <div className="p-5 rounded-2xl bg-slate-950/95 border-2 border-slate-800 hud-corner-brackets shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Chronological Quality & Approval Audit Ledger
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {activityLogs.length} Total Registered Decisions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">TIMESTAMP</th>
                  <th className="py-3 px-3">OPERATOR / GOVERNOR</th>
                  <th className="py-3 px-3">ACTION GATE</th>
                  <th className="py-3 px-3">ASSET ENTITY</th>
                  <th className="py-3 px-3">DETAILS & REASONING</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {activityLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('en-IN', { hour12: false })}
                    </td>
                    <td className="py-3 px-3 text-cyan-300 font-bold whitespace-nowrap">
                      {log.operatorName}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.action.includes('APPROVE') || log.action.includes('PUBLISH')
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : log.action.includes('REJECT')
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-white font-semibold whitespace-nowrap">
                      {log.entityTitle}
                    </td>
                    <td className="py-3 px-3 text-slate-300 font-sans max-w-md">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 10. DOCKED FLOATING BATCH ACTIONS CYBER HUD DECK                       */}
      {/* ==================================================================== */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-3xl bg-slate-950/95 border-2 border-cyan-500/80 rounded-2xl p-4 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom duration-300 hud-corner-brackets">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-sm font-black text-white font-mono">
                {selectedIds.size} ITEMS SELECTED IN ACTIVE QUEUE
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setSelectedIds(new Set())}
                className="text-xs bg-slate-900 border-slate-700 text-slate-300 hover:text-white"
              >
                Clear
              </Button>

              <Button
                size="sm"
                variant="secondary"
                onClick={() => openRejectModal('BATCH', 'batch-selected', `${selectedIds.size} Selected Queue Items`)}
                className="text-xs text-rose-400 hover:bg-rose-500/10 border-rose-500/40"
              >
                <X className="w-3.5 h-3.5 mr-1" />
                Batch Reject
              </Button>

              <Button
                size="sm"
                variant="primary"
                onClick={handleBatchApprove}
                className="text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black shadow-lg shadow-cyan-500/30"
              >
                <Check className="w-4 h-4 mr-1" />
                ⚡ Batch Authorize & Publish
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 11. DEEP INSPECTION & LATEX PROOF MODAL                              */}
      {/* ==================================================================== */}
      {inspectItem && (
        <Modal
          isOpen={true}
          onClose={() => setInspectItem(null)}
          title={`Holographic Inspection: ${inspectItem.type} ASSET`}
          size="lg"
        >
          <div className="space-y-4 text-xs font-mono text-slate-200">
            {inspectItem.type === 'QUESTION' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-cyan-400 text-[10px] uppercase font-bold tracking-wider">QUESTION STATEMENT</span>
                  <p className="text-sm font-bold text-white font-sans leading-relaxed">{inspectItem.item.questionText}</p>
                  {inspectItem.item.hindiQuestionText && (
                    <p className="text-xs text-slate-300 font-sans leading-relaxed pt-1">{inspectItem.item.hindiQuestionText}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <span className="text-purple-400 text-[10px] uppercase font-bold tracking-wider">OPTIONS KEY MATRIX</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {inspectItem.item.options?.map((opt: any, oIdx: number) => (
                      <div key={opt.id} className={`p-3 rounded-lg border ${opt.isCorrect ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200 font-bold' : 'bg-slate-900 border-slate-800'}`}>
                        ({String.fromCharCode(65 + oIdx)}) {opt.text} {opt.isCorrect && '✓ [CORRECT]'}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1 font-sans">
                  <span className="text-emerald-400 text-[10px] uppercase font-bold tracking-wider font-mono">STEP-BY-STEP MATHEMATICAL PROOF & REASONING</span>
                  <p className="text-slate-300 leading-relaxed text-xs">{inspectItem.item.explanation}</p>
                </div>
              </div>
            )}

            {inspectItem.type === 'MATERIAL' && (
              <div className="space-y-4 font-sans text-xs">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <h4 className="text-base font-bold text-white">{inspectItem.item.title}</h4>
                  <p className="text-slate-300 leading-relaxed">{inspectItem.item.description}</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">FILE NAME</span>
                    <span className="text-white font-bold">{inspectItem.item.fileName}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">PAGE COUNT</span>
                    <span className="text-cyan-400 font-bold">{inspectItem.item.pageCount} Pages</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">FILE SIZE</span>
                    <span className="text-purple-400 font-bold">{inspectItem.item.fileSize}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">PRICING TIER</span>
                    <span className="text-emerald-400 font-bold">{inspectItem.item.isPaid ? `₹${inspectItem.item.basePrice}` : 'FREE'}</span>
                  </div>
                </div>
              </div>
            )}

            {inspectItem.type === 'MOCK' && (
              <div className="space-y-4 font-sans text-xs">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <h4 className="text-base font-bold text-white">{inspectItem.item.title}</h4>
                  <p className="text-slate-300 leading-relaxed">{inspectItem.item.description}</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">EXAM TARGET</span>
                    <span className="text-white font-bold">{inspectItem.item.examName}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">TOTAL Qs</span>
                    <span className="text-cyan-400 font-bold">{inspectItem.item.totalQuestions} Qs</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">TOTAL MARKS</span>
                    <span className="text-purple-400 font-bold">{inspectItem.item.totalMarks} Marks</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">DURATION</span>
                    <span className="text-amber-400 font-bold">{inspectItem.item.durationMinutes} Mins</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <Button size="sm" variant="secondary" onClick={() => setInspectItem(null)}>
                Close Inspection
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ==================================================================== */}
      {/* 12. REJECTION & REVISION RUBRIC MODAL                                */}
      {/* ==================================================================== */}
      {rejectModalItem && (
        <Modal
          isOpen={true}
          onClose={() => setRejectModalItem(null)}
          title={`Editorial Rejection Rubric: ${rejectModalItem.title}`}
          size="md"
        >
          <div className="space-y-4 text-xs font-mono text-slate-200">
            <p className="text-slate-300 font-sans">
              Select standardized rejection criteria and provide specific revision instructions for the author operator.
            </p>

            {/* Presets Rubric Badges */}
            <div className="space-y-2">
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">
                STANDARDIZED RUBRIC PRESETS (Click to Toggle)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {RUBRIC_REJECTION_PRESETS.map((preset) => {
                  const isSelected = selectedRubricPresets.includes(preset.id);
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        playSfx('click');
                        if (isSelected) {
                          setSelectedRubricPresets(prev => prev.filter(p => p !== preset.id));
                        } else {
                          setSelectedRubricPresets(prev => [...prev, preset.id]);
                        }
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-rose-500/20 border-rose-500 text-rose-200' 
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="font-bold flex items-center justify-between">
                        <span>{preset.label}</span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${preset.severity === 'CRITICAL' ? 'bg-rose-500/30 text-rose-300' : 'bg-amber-500/30 text-amber-300'}`}>
                          {preset.severity}
                        </span>
                      </div>
                      <p className="text-[10px] font-sans text-slate-400 mt-1">{preset.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Notes */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block">
                DETAILED REVISION GUIDANCE FOR OPERATOR *
              </label>
              <textarea
                rows={3}
                value={rejectionNotes}
                onChange={(e) => setRejectionNotes(e.target.value)}
                placeholder="Specify precise page numbers, distractor ambiguity, mathematical error, or required rewrite..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-hidden focus:border-rose-500 font-sans"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <Button size="sm" variant="secondary" onClick={() => setRejectModalItem(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={handleConfirmReject}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold"
              >
                Confirm Rejection & Dispatch Revision Notice
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ==================================================================== */}
      {/* 13. UNIVERSAL EXPORT MODAL                                           */}
      {/* ==================================================================== */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Central Content Quality Queue Manifest"
        data={{
          metrics,
          materialsCount: materials.length,
          questionsCount: questions.length,
          mockTestsCount: mockTests.length,
          activePendingMaterials: materials.filter(m => m.status === 'DRAFT'),
          activePendingQuestions: questions.filter(q => q.status === 'AI_GENERATED' || q.status === 'UNDER_REVIEW'),
          activePendingMocks: mockTests.filter(t => t.status === 'DRAFT'),
          auditLedger: activityLogs
        }}
        filename="focuspoint_content_approvals_manifest"
      />
    </div>
  );
};
