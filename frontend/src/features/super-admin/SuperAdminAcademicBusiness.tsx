// FOCUSPOINT — Super Admin Digital Academic Business OS Command Center
// Interconnected Business Intelligence across Students, Teachers, Libraries, Tuition, Materials, Tests, Exams, Subscriptions, Revenue, Attendance & Academic Performance
// Cyber-HUD Standard: Holographic Location Command Deck, 3-Tier Cockpit, 3D Quantum Engine Orb, Web Audio Synthesizer, 12 KPI Decks, Dual Interactive Charts, 4 Safeguard Gates, 5-Tab Cockpit, Dossier Modal, Universal Export

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingBag, 
  TrendingUp, 
  Receipt, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Search, 
  Filter, 
  Download, 
  Sparkles, 
  FileText, 
  Building, 
  Tag,
  ShieldCheck, 
  RefreshCw, 
  Layers, 
  Award, 
  GraduationCap, 
  BookOpen, 
  MapPin, 
  Calendar, 
  CheckCircle, 
  BarChart3, 
  Percent, 
  IndianRupee, 
  Activity,
  Volume2,
  VolumeX,
  Eye,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Lock,
  Unlock,
  ExternalLink,
  FileSpreadsheet,
  Hash,
  ShieldAlert,
  Smartphone,
  Zap,
  Check,
  X,
  Landmark,
  Compass,
  HelpCircle,
  Send,
  Copy,
  SlidersHorizontal,
  Flame,
  Radio,
  Globe,
  RotateCcw,
  Navigation
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { LocationSelectionPayload } from '../../components/common/PanIndiaLocationSelector';
import { locationService } from '../../services/locationService';
import { State, DistrictLocation, Locality } from '../../types/location';
import { academicEntitlementService, AcademicBusinessMetrics } from '../../services/academicEntitlementService';
import { StudentSubscription, AcademicProductType, PricingScope } from '../../types/eligibilityAndPricing';
import { mockStore } from '../../mock/store';
import { useToast } from '../../context/ToastContext';
import { InteractivePieDonutChart, DonutSegment } from '../../components/common/charts/InteractivePieDonutChart';
import { ExportModal } from '../../components/common/ExportModal';

// ============================================================================
// WEB AUDIO PROCEDURAL SYNTHESIZER (CyberSoundSystem)
// ============================================================================
class CyberSoundSystem {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public playChirp(type: 'click' | 'confirm' | 'warp' | 'alert' | 'scan') {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      if (type === 'click') {
        osc.frequency.setValueAtTime(840, now);
        osc.frequency.exponentialRampToValueAtTime(1260, now + 0.04);
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
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === 'scan') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(580, now);
        osc.frequency.linearRampToValueAtTime(1180, now + 0.08);
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
// ENRICHED PAN-INDIA SEED SUBSCRIPTIONS WITH EXPLICIT GEOGRAPHY COORDINATES
// ============================================================================
const ENRICHED_ACADEMIC_SUBSCRIPTIONS: StudentSubscription[] = [
  // --- UTTAR PRADESH SCHOLARS ---
  {
    id: 'sub-student-aryan-mock',
    studentId: 'STU-UP-2026-0891',
    studentName: 'Aryan Sharma',
    productId: 'prod-mock-tests-monthly',
    productName: 'Pan-India 30-Day Mock Test Pass',
    productType: 'MOCK_TEST_SUBSCRIPTION',
    examId: 'exam-uppolice-si',
    examName: 'UP Police Sub-Inspector (UPPRPB)',
    source: 'DIRECT_PURCHASE',
    stateId: 'loc-state-up',
    stateName: 'Uttar Pradesh',
    districtId: 'dist-vns',
    districtName: 'Varanasi',
    localityName: 'Lanka',
    startDate: '2026-09-01',
    endDate: '2026-11-01',
    status: 'ACTIVE',
    features: ['MOCK_TESTS', 'PERFORMANCE_ANALYTICS', 'ALL_MOCK_TESTS'],
    originalPrice: 499,
    discount: 200,
    finalPaidAmount: 299,
    pricingScope: 'STUDENT',
    invoiceNumber: 'INV-2026-09-0012',
    paymentId: 'pay_live_ind_992187',
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-09-01T10:00:00Z'
  },
  {
    id: 'sub-student-ananya-growth',
    studentId: 'STU-UP-2026-1104',
    studentName: 'Ananya Verma',
    productId: 'prod-growing-intelligence-pass',
    productName: 'AI Studio & Personal Mistake Book Pass',
    productType: 'GROWING_INTELLIGENCE',
    examId: 'exam-upsc-prelims',
    examName: 'UPSC Civil Services (IAS/IPS)',
    source: 'DIRECT_PURCHASE',
    stateId: 'loc-state-up',
    stateName: 'Uttar Pradesh',
    districtId: 'dist-ald',
    districtName: 'Prayagraj (Allahabad)',
    localityName: 'Civil Lines',
    startDate: '2026-08-15',
    endDate: '2026-12-15',
    status: 'ACTIVE',
    features: ['GROWING_INTELLIGENCE', 'MISTAKE_BOOK', 'PERFORMANCE_ANALYTICS'],
    originalPrice: 599,
    discount: 100,
    finalPaidAmount: 499,
    pricingScope: 'STUDENT',
    invoiceNumber: 'INV-2026-08-0044',
    paymentId: 'pay_live_ind_881923',
    createdAt: '2026-08-15T11:00:00Z',
    updatedAt: '2026-08-15T11:00:00Z'
  },
  {
    id: 'sub-student-priya-library',
    studentId: 'STU-UP-2026-2241',
    studentName: 'Priya Srivastava',
    productId: 'prod-study-material-vault',
    productName: 'Study Material Vault: General Studies & CSAT Blueprint',
    productType: 'STUDY_MATERIAL_SUBSCRIPTION',
    examId: 'exam-upsc-prelims',
    examName: 'UPSC Civil Services (IAS/IPS)',
    source: 'LIBRARY_BOOKING',
    libraryId: 'lib-saidpur-central',
    libraryName: 'Saidpur Central Study Space',
    stateId: 'loc-state-up',
    stateName: 'Uttar Pradesh',
    districtId: 'dist-gzp',
    districtName: 'Ghazipur',
    localityName: 'Saidpur',
    startDate: '2026-09-10',
    endDate: '2026-10-25',
    status: 'ACTIVE',
    features: ['STUDY_MATERIAL', 'PERFORMANCE_ANALYTICS'],
    originalPrice: 399,
    discount: 399,
    finalPaidAmount: 0,
    pricingScope: 'LIBRARY',
    invoiceNumber: 'INV-2026-09-LIB-88',
    paymentId: 'pay_lib_concession_001',
    createdAt: '2026-09-10T09:00:00Z',
    updatedAt: '2026-09-10T09:00:00Z'
  },
  {
    id: 'sub-student-kavita-jee',
    studentId: 'STU-UP-2026-5519',
    studentName: 'Kavita Pandey',
    productId: 'prod-jee-advanced-pack',
    productName: 'JEE Advanced Physics & Chem Vault + 20 Grand Mocks',
    productType: 'COMPLETE_EXAM_PACKAGE',
    examId: 'exam-jee-adv',
    examName: 'JEE Advanced 2026',
    source: 'TEACHER_ALLOTMENT',
    teacherId: 'tch-verma-physics',
    teacherName: 'Er. R.K. Verma (IIT Kanpur Alum)',
    stateId: 'loc-state-up',
    stateName: 'Uttar Pradesh',
    districtId: 'dist-knp',
    districtName: 'Kanpur Nagar',
    localityName: 'Kanpur City',
    startDate: '2026-08-01',
    endDate: '2026-11-30',
    status: 'ACTIVE',
    features: ['MOCK_TESTS', 'STUDY_MATERIAL', 'PERFORMANCE_ANALYTICS'],
    originalPrice: 1999,
    discount: 800,
    finalPaidAmount: 1199,
    pricingScope: 'TEACHER',
    invoiceNumber: 'INV-2026-08-0382',
    paymentId: 'pay_live_ind_552109',
    createdAt: '2026-08-01T12:00:00Z',
    updatedAt: '2026-08-01T12:00:00Z'
  },
  {
    id: 'sub-student-dev-neet',
    studentId: 'STU-UP-2026-6623',
    studentName: 'Devansh Tiwari',
    productId: 'prod-neet-biology-vault',
    productName: 'NEET-UG High-Yield NCERT Line-by-Line Vault',
    productType: 'STUDY_MATERIAL_SUBSCRIPTION',
    examId: 'exam-neet-ug',
    examName: 'NEET-UG Medical Entrance',
    source: 'DIRECT_PURCHASE',
    stateId: 'loc-state-up',
    stateName: 'Uttar Pradesh',
    districtId: 'dist-gkp',
    districtName: 'Gorakhpur',
    localityName: 'Gorakhpur City',
    startDate: '2026-09-05',
    endDate: '2026-12-05',
    status: 'ACTIVE',
    features: ['STUDY_MATERIAL', 'PERFORMANCE_ANALYTICS'],
    originalPrice: 499,
    discount: 100,
    finalPaidAmount: 399,
    pricingScope: 'STUDENT',
    invoiceNumber: 'INV-2026-09-0210',
    paymentId: 'pay_live_ind_442981',
    createdAt: '2026-09-05T08:15:00Z',
    updatedAt: '2026-09-05T08:15:00Z'
  },
  {
    id: 'sub-student-pooja-chs',
    studentId: 'STU-UP-2026-7734',
    studentName: 'Pooja Gupta',
    productId: 'prod-bhu-chs-class9',
    productName: 'BHU Central Hindu School (CHS) Class 9 Grand Prep',
    productType: 'COMPLETE_EXAM_PACKAGE',
    examId: 'exam-chs-class9',
    examName: 'BHU CHS SET Class 9',
    source: 'LIBRARY_BOOKING',
    libraryId: 'lib-lanka-study',
    libraryName: 'Lanka Knowledge Reading Space (BHU Gate)',
    stateId: 'loc-state-up',
    stateName: 'Uttar Pradesh',
    districtId: 'dist-vns',
    districtName: 'Varanasi',
    localityName: 'Lanka',
    startDate: '2026-08-20',
    endDate: '2026-11-20',
    status: 'ACTIVE',
    features: ['MOCK_TESTS', 'STUDY_MATERIAL', 'MISTAKE_BOOK'],
    originalPrice: 799,
    discount: 300,
    finalPaidAmount: 499,
    pricingScope: 'LIBRARY',
    invoiceNumber: 'INV-2026-08-LIB-44',
    paymentId: 'pay_lib_concession_002',
    createdAt: '2026-08-20T10:45:00Z',
    updatedAt: '2026-08-20T10:45:00Z'
  },
  {
    id: 'sub-student-neha-uppsc',
    studentId: 'STU-UP-2026-9012',
    studentName: 'Neha Tripathi',
    productId: 'prod-uppsc-pcs-pack',
    productName: 'UPPSC Combined State / Upper Subordinate Prelims Pass',
    productType: 'COMPLETE_EXAM_PACKAGE',
    examId: 'exam-uppsc-pcs',
    examName: 'UPPSC Provincial Civil Services',
    source: 'DIRECT_PURCHASE',
    stateId: 'loc-state-up',
    stateName: 'Uttar Pradesh',
    districtId: 'dist-lko',
    districtName: 'Lucknow',
    localityName: 'Hazratganj',
    startDate: '2026-08-10',
    endDate: '2026-12-10',
    status: 'ACTIVE',
    features: ['MOCK_TESTS', 'STUDY_MATERIAL', 'PERFORMANCE_ANALYTICS'],
    originalPrice: 899,
    discount: 200,
    finalPaidAmount: 699,
    pricingScope: 'STATE',
    invoiceNumber: 'INV-2026-08-0771',
    paymentId: 'pay_live_ind_993411',
    createdAt: '2026-08-10T14:00:00Z',
    updatedAt: '2026-08-10T14:00:00Z'
  },
  {
    id: 'sub-student-suraj-ballia',
    studentId: 'STU-UP-2026-3390',
    studentName: 'Suraj Yadav',
    productId: 'prod-upsssc-pet-drill',
    productName: 'UPSSSC PET 2026: Sectional Topic Mastery Pack',
    productType: 'MOCK_TEST_SUBSCRIPTION',
    examId: 'exam-upsssc-pet',
    examName: 'UPSSSC Preliminary Eligibility Test (PET)',
    source: 'DIRECT_PURCHASE',
    stateId: 'loc-state-up',
    stateName: 'Uttar Pradesh',
    districtId: 'dist-bal',
    districtName: 'Ballia',
    localityName: 'Ballia City',
    startDate: '2026-07-20',
    endDate: '2026-10-20',
    status: 'ACTIVE',
    features: ['MOCK_TESTS', 'PERFORMANCE_ANALYTICS'],
    originalPrice: 299,
    discount: 50,
    finalPaidAmount: 249,
    pricingScope: 'STUDENT',
    invoiceNumber: 'INV-2026-07-0899',
    paymentId: 'pay_live_ind_339012',
    createdAt: '2026-07-20T11:00:00Z',
    updatedAt: '2026-07-20T11:00:00Z'
  },

  // --- BIHAR SCHOLARS ---
  {
    id: 'sub-student-vikram-combo',
    studentId: 'STU-BR-2026-3042',
    studentName: 'Vikram Singh',
    productId: 'prod-complete-bpsc-combo',
    productName: 'BPSC 71st CCE Complete Master Combo Pass',
    productType: 'COMPLETE_EXAM_PACKAGE',
    examId: 'exam-bpsc-cce',
    examName: 'BPSC Integrated CCE',
    source: 'DIRECT_PURCHASE',
    stateId: 'loc-state-br',
    stateName: 'Bihar',
    districtId: 'dist-pat',
    districtName: 'Patna',
    localityName: 'Boring Road',
    startDate: '2026-07-01',
    endDate: '2026-12-31',
    status: 'ACTIVE',
    features: ['MOCK_TESTS', 'STUDY_MATERIAL', 'GROWING_INTELLIGENCE', 'MISTAKE_BOOK'],
    originalPrice: 1499,
    discount: 500,
    finalPaidAmount: 999,
    pricingScope: 'DISTRICT',
    invoiceNumber: 'INV-2026-07-0491',
    paymentId: 'pay_live_ind_771822',
    createdAt: '2026-07-01T14:30:00Z',
    updatedAt: '2026-07-01T14:30:00Z'
  },
  {
    id: 'sub-student-manish-navodaya',
    studentId: 'STU-BR-2026-8812',
    studentName: 'Manish Kumar',
    productId: 'prod-jnvst-navodaya-6',
    productName: 'Jawahar Navodaya Vidyalaya Selection Test Pass',
    productType: 'MOCK_TEST_SUBSCRIPTION',
    examId: 'exam-jnvst-class6',
    examName: 'Navodaya JNVST Class 6',
    source: 'DIRECT_PURCHASE',
    stateId: 'loc-state-br',
    stateName: 'Bihar',
    districtId: 'dist-gaya',
    districtName: 'Gaya',
    localityName: 'Gaya City',
    startDate: '2026-07-15',
    endDate: '2026-10-15',
    status: 'ACTIVE',
    features: ['MOCK_TESTS', 'PERFORMANCE_ANALYTICS'],
    originalPrice: 299,
    discount: 100,
    finalPaidAmount: 199,
    pricingScope: 'STATE',
    invoiceNumber: 'INV-2026-07-0628',
    paymentId: 'pay_live_ind_331002',
    createdAt: '2026-07-15T09:20:00Z',
    updatedAt: '2026-07-15T09:20:00Z'
  },
  {
    id: 'sub-student-rakesh-biharsi',
    studentId: 'STU-BR-2026-4401',
    studentName: 'Rakesh Ranjan',
    productId: 'prod-bihar-si-pass',
    productName: 'Bihar Police Sub-Inspector (BPSSC) 25 Full Mocks',
    productType: 'MOCK_TEST_SUBSCRIPTION',
    examId: 'exam-bihar-si',
    examName: 'Bihar Police Sub-Inspector (BPSSC)',
    source: 'DIRECT_PURCHASE',
    stateId: 'loc-state-br',
    stateName: 'Bihar',
    districtId: 'dist-muz',
    districtName: 'Muzaffarpur',
    localityName: 'Muzaffarpur City',
    startDate: '2026-08-01',
    endDate: '2026-11-01',
    status: 'ACTIVE',
    features: ['MOCK_TESTS', 'PERFORMANCE_ANALYTICS'],
    originalPrice: 399,
    discount: 100,
    finalPaidAmount: 299,
    pricingScope: 'STUDENT',
    invoiceNumber: 'INV-2026-08-0412',
    paymentId: 'pay_live_ind_883011',
    createdAt: '2026-08-01T15:00:00Z',
    updatedAt: '2026-08-01T15:00:00Z'
  },

  // --- DELHI-NCR SCHOLARS ---
  {
    id: 'sub-student-rohit-expired',
    studentId: 'STU-DL-2026-4412',
    studentName: 'Rohit Khandelwal',
    productId: 'prod-mock-tests-monthly',
    productName: 'Pan-India 30-Day Mock Test Pass',
    productType: 'MOCK_TEST_SUBSCRIPTION',
    examId: 'exam-ssc-cgl',
    examName: 'SSC Combined Graduate Level (CGL)',
    source: 'DIRECT_PURCHASE',
    stateId: 'loc-state-dl',
    stateName: 'Delhi',
    districtId: 'dist-ndl',
    districtName: 'New Delhi',
    localityName: 'Connaught Place',
    startDate: '2026-07-10',
    endDate: '2026-08-10',
    status: 'EXPIRED',
    features: ['MOCK_TESTS', 'PERFORMANCE_ANALYTICS'],
    originalPrice: 499,
    discount: 150,
    finalPaidAmount: 349,
    pricingScope: 'STUDENT',
    invoiceNumber: 'INV-2026-07-0109',
    paymentId: 'pay_live_ind_661029',
    createdAt: '2026-07-10T16:00:00Z',
    updatedAt: '2026-08-10T00:00:00Z'
  },
  {
    id: 'sub-student-tanya-upsc',
    studentId: 'STU-DL-2026-5582',
    studentName: 'Tanya Mehra',
    productId: 'prod-upsc-complete-package',
    productName: 'UPSC CSE Prelims & Mains Comprehensive Intelligence',
    productType: 'COMPLETE_EXAM_PACKAGE',
    examId: 'exam-upsc-prelims',
    examName: 'UPSC Civil Services (IAS/IPS)',
    source: 'DIRECT_PURCHASE',
    stateId: 'loc-state-dl',
    stateName: 'Delhi',
    districtId: 'dist-sd',
    districtName: 'South Delhi',
    localityName: 'Saket',
    startDate: '2026-08-25',
    endDate: '2026-12-25',
    status: 'ACTIVE',
    features: ['MOCK_TESTS', 'STUDY_MATERIAL', 'GROWING_INTELLIGENCE', 'MISTAKE_BOOK'],
    originalPrice: 1999,
    discount: 500,
    finalPaidAmount: 1499,
    pricingScope: 'STUDENT',
    invoiceNumber: 'INV-2026-08-0902',
    paymentId: 'pay_live_ind_990145',
    createdAt: '2026-08-25T13:30:00Z',
    updatedAt: '2026-08-25T13:30:00Z'
  },

  // --- RAJASTHAN SCHOLARS ---
  {
    id: 'sub-student-sakshi-nda',
    studentId: 'STU-RJ-2026-9901',
    studentName: 'Sakshi Rathore',
    productId: 'prod-nda-na-mathematics',
    productName: 'NDA & NA Mathematics Strategy & 15 CBT Drills',
    productType: 'MOCK_TEST_SUBSCRIPTION',
    examId: 'exam-nda-na',
    examName: 'NDA & Naval Academy (UPSC)',
    source: 'DIRECT_PURCHASE',
    stateId: 'loc-state-rj',
    stateName: 'Rajasthan',
    districtId: 'dist-jpr',
    districtName: 'Jaipur',
    localityName: 'Malviya Nagar',
    startDate: '2026-06-01',
    endDate: '2026-09-01',
    status: 'EXPIRED',
    features: ['MOCK_TESTS', 'PERFORMANCE_ANALYTICS'],
    originalPrice: 599,
    discount: 200,
    finalPaidAmount: 399,
    pricingScope: 'STUDENT',
    invoiceNumber: 'INV-2026-06-0312',
    paymentId: 'pay_live_ind_221087',
    createdAt: '2026-06-01T15:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z'
  },
  {
    id: 'sub-student-aditya-kota',
    studentId: 'STU-RJ-2026-1198',
    studentName: 'Aditya Choudhary',
    productId: 'prod-jee-advanced-pack',
    productName: 'JEE Advanced Physics & Chem Vault + 20 Grand Mocks',
    productType: 'COMPLETE_EXAM_PACKAGE',
    examId: 'exam-jee-adv',
    examName: 'JEE Advanced 2026',
    source: 'DIRECT_PURCHASE',
    stateId: 'loc-state-rj',
    stateName: 'Rajasthan',
    districtId: 'dist-kota',
    districtName: 'Kota',
    localityName: 'Talwandi',
    startDate: '2026-09-01',
    endDate: '2026-12-01',
    status: 'ACTIVE',
    features: ['MOCK_TESTS', 'STUDY_MATERIAL', 'MISTAKE_BOOK'],
    originalPrice: 1499,
    discount: 300,
    finalPaidAmount: 1199,
    pricingScope: 'STUDENT',
    invoiceNumber: 'INV-2026-09-0741',
    paymentId: 'pay_live_ind_448123',
    createdAt: '2026-09-01T18:00:00Z',
    updatedAt: '2026-09-01T18:00:00Z'
  },

  // --- MADHYA PRADESH SCHOLARS ---
  {
    id: 'sub-student-rahul-mppsc',
    studentId: 'STU-MP-2026-8819',
    studentName: 'Rahul Patel',
    productId: 'prod-mppsc-state-pack',
    productName: 'MPPSC State Service Preliminary Exam Grand Pack',
    productType: 'MOCK_TEST_SUBSCRIPTION',
    examId: 'exam-mppsc-pre',
    examName: 'MPPSC State Services Examination',
    source: 'DIRECT_PURCHASE',
    stateId: 'loc-state-mp',
    stateName: 'Madhya Pradesh',
    districtId: 'dist-bho',
    districtName: 'Bhopal',
    localityName: 'Arera Colony',
    startDate: '2026-08-18',
    endDate: '2026-11-18',
    status: 'ACTIVE',
    features: ['MOCK_TESTS', 'PERFORMANCE_ANALYTICS'],
    originalPrice: 499,
    discount: 100,
    finalPaidAmount: 399,
    pricingScope: 'STUDENT',
    invoiceNumber: 'INV-2026-08-0881',
    paymentId: 'pay_live_ind_771092',
    createdAt: '2026-08-18T10:00:00Z',
    updatedAt: '2026-08-18T10:00:00Z'
  },

  // --- MAHARASHTRA SCHOLARS ---
  {
    id: 'sub-student-pranav-mpsc',
    studentId: 'STU-MH-2026-3312',
    studentName: 'Pranav Deshmukh',
    productId: 'prod-mpsc-rajyaseva',
    productName: 'MPSC Civil Services (Rajyaseva) Preliminary Pass',
    productType: 'COMPLETE_EXAM_PACKAGE',
    examId: 'exam-mpsc-rajyaseva',
    examName: 'Maharashtra MPSC Rajyaseva',
    source: 'DIRECT_PURCHASE',
    stateId: 'loc-state-mh',
    stateName: 'Maharashtra',
    districtId: 'dist-pne',
    districtName: 'Pune',
    localityName: 'Kothrud',
    startDate: '2026-07-28',
    endDate: '2026-10-28',
    status: 'ACTIVE',
    features: ['MOCK_TESTS', 'STUDY_MATERIAL'],
    originalPrice: 899,
    discount: 200,
    finalPaidAmount: 699,
    pricingScope: 'STATE',
    invoiceNumber: 'INV-2026-07-0943',
    paymentId: 'pay_live_ind_660192',
    createdAt: '2026-07-28T14:15:00Z',
    updatedAt: '2026-07-28T14:15:00Z'
  }
];

export const SuperAdminAcademicBusiness: React.FC = () => {
  const { showToast } = useToast();

  // Active Tab View in Cockpit
  const [activeTab, setActiveTab] = useState<'PILLARS_MATRIX' | 'COMMERCIAL_CHANNELS' | 'ENTITLEMENT_LEDGER' | 'INSTITUTIONAL_QUOTAS' | 'TRANSACTION_AUDIT'>('PILLARS_MATRIX');

  // Audio state
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

  // Centralized Pan-India Location State
  const [selectedLocation, setSelectedLocation] = useState<LocationSelectionPayload>({
    countryId: 'loc-country-in',
    stateId: '',
    stateName: '',
    districtId: '',
    districtName: '',
    localityId: '',
    localityName: '',
    level: 'INDIA',
    breadcrumb: 'Pan-India'
  });

  // Time Period Range Filter
  const [filterPeriod, setFilterPeriod] = useState<'today' | 'week' | 'month' | 'quarter' | 'all'>('month');

  // Master lists from locationService
  const [statesList, setStatesList] = useState<State[]>([]);
  const [districtsList, setDistrictsList] = useState<DistrictLocation[]>([]);
  const [localitiesList, setLocalitiesList] = useState<Locality[]>([]);

  // Load States from authoritative location master
  useEffect(() => {
    try {
      const allStates = locationService.getStates('loc-country-in', true);
      setStatesList(allStates);
    } catch (e) {
      console.error('Failed to load states', e);
    }
  }, []);

  // Load Districts when stateId changes
  useEffect(() => {
    if (selectedLocation.stateId) {
      try {
        const dists = locationService.getDistricts(selectedLocation.stateId, true);
        setDistrictsList(dists);
      } catch (e) {
        console.error('Failed to load districts', e);
        setDistrictsList([]);
      }
    } else {
      setDistrictsList([]);
    }
  }, [selectedLocation.stateId]);

  // Load Localities when districtId changes
  useEffect(() => {
    if (selectedLocation.districtId) {
      try {
        const locs = locationService.getLocalities(selectedLocation.districtId, true);
        setLocalitiesList(locs);
      } catch (e) {
        console.error('Failed to load localities', e);
        setLocalitiesList([]);
      }
    } else {
      setLocalitiesList([]);
    }
  }, [selectedLocation.districtId]);

  // Handlers for Location Cascading
  const handleSelectStateByName = (stateName: string) => {
    playSfx('click');
    if (!stateName || stateName === 'ALL' || stateName === 'Pan-India') {
      setSelectedLocation({
        countryId: 'loc-country-in',
        stateId: '',
        stateName: '',
        districtId: '',
        districtName: '',
        localityId: '',
        localityName: '',
        level: 'INDIA',
        breadcrumb: 'Pan-India'
      });
      setCurrentPage(1);
      showToast('Territory reset to Nationwide Pan-India', 'info');
      return;
    }

    const stObj = statesList.find(s => s.name.toLowerCase() === stateName.toLowerCase() || s.id === stateName);
    const resolvedId = stObj ? stObj.id : `loc-state-${stateName.toLowerCase().slice(0, 2)}`;
    const resolvedName = stObj ? stObj.name : stateName;

    setSelectedLocation({
      countryId: 'loc-country-in',
      stateId: resolvedId,
      stateName: resolvedName,
      districtId: '',
      districtName: '',
      localityId: '',
      localityName: '',
      level: 'STATE',
      breadcrumb: `India → ${resolvedName}`
    });
    setCurrentPage(1);
    showToast(`Territory focused on ${resolvedName}`, 'success');
  };

  const handleSelectDistrictByName = (districtName: string) => {
    playSfx('click');
    if (!districtName || districtName === 'ALL') {
      // Revert to State level
      setSelectedLocation(prev => ({
        ...prev,
        districtId: '',
        districtName: '',
        localityId: '',
        localityName: '',
        level: prev.stateName ? 'STATE' : 'INDIA',
        breadcrumb: prev.stateName ? `India → ${prev.stateName}` : 'Pan-India'
      }));
      setCurrentPage(1);
      return;
    }

    const distObj = districtsList.find(d => d.name.toLowerCase() === districtName.toLowerCase() || d.id === districtName);
    const resolvedDistId = distObj ? distObj.id : `dist-${districtName.toLowerCase().slice(0, 3)}`;
    const resolvedDistName = distObj ? distObj.name : districtName;

    setSelectedLocation(prev => ({
      ...prev,
      districtId: resolvedDistId,
      districtName: resolvedDistName,
      localityId: '',
      localityName: '',
      level: 'DISTRICT',
      breadcrumb: `India → ${prev.stateName || 'State'} → ${resolvedDistName}`
    }));
    setCurrentPage(1);
    showToast(`District focused on ${resolvedDistName}`, 'success');
  };

  const handleSelectLocalityByName = (localityName: string) => {
    playSfx('click');
    if (!localityName || localityName === 'ALL') {
      setSelectedLocation(prev => ({
        ...prev,
        localityId: '',
        localityName: '',
        level: 'DISTRICT',
        breadcrumb: `India → ${prev.stateName} → ${prev.districtName}`
      }));
      setCurrentPage(1);
      return;
    }

    const locObj = localitiesList.find(l => l.name.toLowerCase() === localityName.toLowerCase() || l.id === localityName);
    const resolvedLocId = locObj ? locObj.id : `loc-${localityName.toLowerCase().slice(0, 3)}`;
    const resolvedLocName = locObj ? locObj.name : localityName;

    setSelectedLocation(prev => ({
      ...prev,
      localityId: resolvedLocId,
      localityName: resolvedLocName,
      level: 'LOCALITY',
      breadcrumb: `India → ${prev.stateName} → ${prev.districtName} → ${resolvedLocName}`
    }));
    setCurrentPage(1);
    showToast(`Locality hub focused on ${resolvedLocName}`, 'success');
  };

  const handleResetToPanIndia = () => {
    playSfx('warp');
    setSelectedLocation({
      countryId: 'loc-country-in',
      stateId: '',
      stateName: '',
      districtId: '',
      districtName: '',
      localityId: '',
      localityName: '',
      level: 'INDIA',
      breadcrumb: 'Pan-India'
    });
    setCurrentPage(1);
    showToast('Location scope reset to Pan-India', 'info');
  };

  // Metrics & Subscriptions State
  const [metrics, setMetrics] = useState<AcademicBusinessMetrics>(() => 
    academicEntitlementService.getBusinessMetrics()
  );

  const [subscriptionsList, setSubscriptionsList] = useState<StudentSubscription[]>(() => {
    const existing = academicEntitlementService.getAllSubscriptions();
    const existingIds = new Set(existing.map(s => s.id));
    const merged = [...existing];
    ENRICHED_ACADEMIC_SUBSCRIPTIONS.forEach(sub => {
      if (!existingIds.has(sub.id)) {
        merged.push(sub);
      }
    });
    return merged;
  });

  // Table Searching, Filtering & Sorting State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'EXPIRED'>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [scopeFilter, setScopeFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<'student' | 'product' | 'endDate' | 'amount' | 'invoice'>('endDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  // Modals State
  const [inspectDossier, setInspectDossier] = useState<StudentSubscription | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedPillarDetail, setSelectedPillarDetail] = useState<any | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const refreshData = () => {
    playSfx('warp');
    setMetrics(academicEntitlementService.getBusinessMetrics());
    setSubscriptionsList(prev => {
      const existing = academicEntitlementService.getAllSubscriptions();
      const existingIds = new Set(existing.map(s => s.id));
      const merged = [...existing];
      prev.forEach(sub => {
        if (!existingIds.has(sub.id)) merged.push(sub);
      });
      return merged;
    });
    showToast('Academic intelligence telemetry refreshed across all 11 pillars', 'info');
  };

  useEffect(() => {
    const unsub = academicEntitlementService.subscribe(() => {
      setMetrics(academicEntitlementService.getBusinessMetrics());
    });
    return () => unsub();
  }, []);

  // Multipliers based on geography and time period
  const geoMultiplier = useMemo(() => {
    if (selectedLocation.localityName) return 0.08;
    if (selectedLocation.districtName) return 0.22;
    if (selectedLocation.stateName) {
      const s = selectedLocation.stateName.toLowerCase();
      if (s.includes('uttar')) return 0.64;
      if (s.includes('bihar')) return 0.19;
      if (s.includes('delhi')) return 0.12;
      if (s.includes('rajasthan')) return 0.08;
      if (s.includes('madhya')) return 0.07;
      if (s.includes('maharashtra')) return 0.09;
      return 0.05;
    }
    return 1.0;
  }, [selectedLocation]);

  const periodMultiplier = useMemo(() => {
    switch (filterPeriod) {
      case 'today': return 0.04;
      case 'week': return 0.25;
      case 'month': return 1.0;
      case 'quarter': return 2.8;
      case 'all': return 8.0;
      default: return 1.0;
    }
  }, [filterPeriod]);

  const effectiveMultiplier = geoMultiplier * periodMultiplier;

  // Interconnected 11 Business Pillars calculated dynamically
  const interconnectedPillars = useMemo(() => {
    const allTeachers = mockStore.getTeachers();
    const allLibraries = mockStore.getLibraries();
    const allTuitions = mockStore.getTutorRequests();
    const allMaterials = mockStore.getStudyMaterials();
    const allTests = mockStore.getMockTests();

    const studentsCount = Math.max(8, Math.round(1850 * effectiveMultiplier));
    const teachersCount = Math.max(2, Math.round((allTeachers.length || 24) * effectiveMultiplier));
    const librariesCount = Math.max(1, Math.round((allLibraries.length || 18) * effectiveMultiplier));
    const tuitionsCount = Math.max(2, Math.round((allTuitions.length || 46) * effectiveMultiplier));
    const studyMaterialsCount = Math.max(6, Math.round((allMaterials.length || 38) * (filterPeriod === 'all' ? 1.5 : 1)));
    const mockTestsCount = Math.max(8, Math.round((allTests.length || 64) * (filterPeriod === 'all' ? 1.4 : 1)));
    const activeExamsCount = selectedLocation.stateName ? 6 : 14;
    const activeSubscriptionsCount = Math.max(5, Math.round((metrics.mockTests.activeSubscriptions + metrics.studyMaterial.activeEntitlements + metrics.completePackages.active) * effectiveMultiplier));
    const grossDigitalRevenue = Math.round(metrics.totalAcademicGrossRevenue * effectiveMultiplier);
    const attendanceCompliance = 94.6;
    const avgAcademicPerformance = 72.8;
    const ebitdaMargin = 86.4;

    return {
      studentsCount,
      teachersCount,
      librariesCount,
      tuitionsCount,
      studyMaterialsCount,
      mockTestsCount,
      activeExamsCount,
      activeSubscriptionsCount,
      grossDigitalRevenue,
      attendanceCompliance,
      avgAcademicPerformance,
      ebitdaMargin
    };
  }, [metrics, effectiveMultiplier, filterPeriod, selectedLocation]);

  // Dual Interactive Cyber Donut Charts
  const revenueMatrixShareData: DonutSegment[] = useMemo(() => {
    return [
      { label: 'Mock CBT Subscriptions (Passes)', value: 36, color: '#06b6d4' },
      { label: 'Study Material Vault Passes', value: 24, color: '#f59e0b' },
      { label: 'AI Studio & Mistake Book', value: 18, color: '#a855f7' },
      { label: 'Complete National Bundles', value: 14, color: '#10b981' },
      { label: 'Library Concession Passes', value: 8, color: '#ec4899' }
    ];
  }, []);

  const regionalDensityData: DonutSegment[] = useMemo(() => {
    return [
      { label: 'Uttar Pradesh Central & Eastern Hub', value: 42, color: '#8b5cf6' },
      { label: 'Bihar Plains & Patna Hub', value: 24, color: '#3b82f6' },
      { label: 'Delhi-NCR & Western Hub', value: 16, color: '#10b981' },
      { label: 'Rajasthan & Desert Hub', value: 10, color: '#f59e0b' },
      { label: 'Pan-India Distributed Hubs', value: 8, color: '#06b6d4' }
    ];
  }, []);

  // Filtered & Sorted Subscriptions (WITH REAL-TIME LOCATION RECOGNITION)
  const filteredSubscriptions = useMemo(() => {
    return subscriptionsList.filter(sub => {
      const isExpired = sub.status === 'EXPIRED' || sub.endDate < today;
      const effectiveStatus = isExpired ? 'EXPIRED' : 'ACTIVE';

      // 1. Status Filter
      const matchStatus = 
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && effectiveStatus === 'ACTIVE') ||
        (statusFilter === 'EXPIRED' && effectiveStatus === 'EXPIRED');

      // 2. Product Type & Pricing Scope Filter
      const matchType = typeFilter === 'ALL' || sub.productType === typeFilter;
      const matchScope = scopeFilter === 'ALL' || sub.pricingScope === scopeFilter;

      // 3. Location Filtering (State -> District -> Locality)
      let matchLocation = true;
      if (selectedLocation.stateName) {
        const selState = selectedLocation.stateName.toLowerCase();
        const subState = (sub.stateName || '').toLowerCase();
        const matchesDirectState = subState.includes(selState);
        const matchesStudentIdPrefix = 
          (selState.includes('uttar') && sub.studentId.includes('UP')) ||
          (selState.includes('bihar') && sub.studentId.includes('BR')) ||
          (selState.includes('delhi') && sub.studentId.includes('DL')) ||
          (selState.includes('rajasthan') && sub.studentId.includes('RJ')) ||
          (selState.includes('madhya') && sub.studentId.includes('MP')) ||
          (selState.includes('maharashtra') && sub.studentId.includes('MH'));

        if (!matchesDirectState && !matchesStudentIdPrefix) {
          matchLocation = false;
        }
      }

      if (matchLocation && selectedLocation.districtName) {
        const selDist = selectedLocation.districtName.toLowerCase();
        const subDist = (sub.districtName || '').toLowerCase();
        if (!subDist.includes(selDist)) {
          matchLocation = false;
        }
      }

      if (matchLocation && selectedLocation.localityName) {
        const selLoc = selectedLocation.localityName.toLowerCase();
        const subLoc = (sub.localityName || '').toLowerCase();
        if (!subLoc.includes(selLoc)) {
          matchLocation = false;
        }
      }

      // 4. Omni Search
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = 
        !q ||
        sub.studentName.toLowerCase().includes(q) ||
        sub.productName.toLowerCase().includes(q) ||
        sub.invoiceNumber.toLowerCase().includes(q) ||
        sub.studentId.toLowerCase().includes(q) ||
        (sub.examName && sub.examName.toLowerCase().includes(q)) ||
        (sub.stateName && sub.stateName.toLowerCase().includes(q)) ||
        (sub.districtName && sub.districtName.toLowerCase().includes(q));

      return matchStatus && matchType && matchScope && matchLocation && matchSearch;
    }).sort((a, b) => {
      let comp = 0;
      if (sortField === 'student') comp = a.studentName.localeCompare(b.studentName);
      else if (sortField === 'product') comp = a.productName.localeCompare(b.productName);
      else if (sortField === 'endDate') comp = a.endDate.localeCompare(b.endDate);
      else if (sortField === 'amount') comp = a.finalPaidAmount - b.finalPaidAmount;
      else if (sortField === 'invoice') comp = a.invoiceNumber.localeCompare(b.invoiceNumber);

      return sortDirection === 'asc' ? comp : -comp;
    });
  }, [subscriptionsList, statusFilter, typeFilter, scopeFilter, searchQuery, sortField, sortDirection, today, selectedLocation]);

  // Paginated Slices
  const totalPages = Math.ceil(filteredSubscriptions.length / itemsPerPage) || 1;
  const paginatedSubscriptions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSubscriptions.slice(start, start + itemsPerPage);
  }, [filteredSubscriptions, currentPage, itemsPerPage]);

  // Extend / Revoke Actions
  const handleExtendPass = (subId: string, days: number) => {
    playSfx('confirm');
    setSubscriptionsList(prev => prev.map(s => {
      if (s.id === subId) {
        const currentEnd = new Date(s.endDate > today ? s.endDate : today);
        currentEnd.setDate(currentEnd.getDate() + days);
        const newEndDate = currentEnd.toISOString().split('T')[0];
        return {
          ...s,
          endDate: newEndDate,
          status: 'ACTIVE'
        };
      }
      return s;
    }));
    showToast(`Pass extended by ${days} days successfully!`, 'success');
  };

  const handleRevokePass = (subId: string) => {
    playSfx('alert');
    setSubscriptionsList(prev => prev.map(s => {
      if (s.id === subId) {
        return {
          ...s,
          status: 'EXPIRED'
        };
      }
      return s;
    }));
    showToast('Pass entitlement revoked and locked from active session.', 'warning');
  };

  const copyToClipboard = (text: string, label: string) => {
    playSfx('click');
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard!`, 'info');
  };

  const handleTabChange = (tab: typeof activeTab) => {
    playSfx('warp');
    setActiveTab(tab);
  };

  const getScopeBadge = (scope?: string) => {
    switch (scope) {
      case 'STUDENT':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 uppercase">Student Scholar</span>;
      case 'TEACHER':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-300 border border-blue-500/30 uppercase">Teacher Referral</span>;
      case 'LIBRARY':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30 uppercase">Library Concession</span>;
      case 'DISTRICT':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 uppercase">District Priority</span>;
      case 'STATE':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 uppercase">State Quota</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 uppercase">Pan-India Base</span>;
    }
  };

  // 11 Core Pillars Data for Tab 1
  const PILLARS_LIST = [
    {
      id: 'p1-students',
      pillarNumber: '01',
      title: 'Enrolled Scholars',
      category: 'LEARNER NEXUS',
      metric: interconnectedPillars.studentsCount.toLocaleString('en-IN'),
      unit: 'Active Learners',
      growth: '+18.4% YoY',
      status: 'OPTIMAL',
      icon: Users,
      color: 'blue',
      description: 'Unified scholar identification directory tracking student test history, study streak, and district demographics.',
      dependencies: ['P8 Subscriptions', 'P10 Attendance', 'P11 Performance']
    },
    {
      id: 'p2-teachers',
      pillarNumber: '02',
      title: 'Verified Educators',
      category: 'FACULTY HIGHWAY',
      metric: interconnectedPillars.teachersCount.toLocaleString('en-IN'),
      unit: 'Certified Faculty',
      growth: '+24.1% YoY',
      status: 'HEALTHY',
      icon: GraduationCap,
      color: 'emerald',
      description: 'Credentialed educators authoring blueprints, resolving student doubts, and referring localized cohorts.',
      dependencies: ['P4 Home Tuition', 'P5 Study Materials', 'P6 Mock Tests']
    },
    {
      id: 'p3-libraries',
      pillarNumber: '03',
      title: 'Study Libraries',
      category: 'PHYSICAL HUBS',
      metric: interconnectedPillars.librariesCount.toLocaleString('en-IN'),
      unit: 'Partner Centers',
      growth: '+31.0% YoY',
      status: 'OPTIMAL',
      icon: Building,
      color: 'purple',
      description: 'Air-conditioned digital study spaces offering high-speed Wi-Fi, reserved desks, and bundled academic passes.',
      dependencies: ['P10 Attendance', 'P8 Subscriptions', 'P1 Students']
    },
    {
      id: 'p4-tuition',
      pillarNumber: '04',
      title: 'Home Tuition',
      category: '1-ON-1 MENTORSHIP',
      metric: interconnectedPillars.tuitionsCount.toLocaleString('en-IN'),
      unit: 'Active Cohorts',
      growth: '+14.8% YoY',
      status: 'HEALTHY',
      icon: BookOpen,
      color: 'amber',
      description: 'Verified home tutors offering customized 1-on-1 exam mentorship and continuous formative assessment.',
      dependencies: ['P2 Teachers', 'P1 Students', 'P9 Revenue']
    },
    {
      id: 'p5-materials',
      pillarNumber: '05',
      title: 'Study Materials',
      category: 'CONTENT VAULT',
      metric: interconnectedPillars.studyMaterialsCount.toLocaleString('en-IN'),
      unit: 'Monetized Packs',
      growth: '+42.5% YoY',
      status: 'OPTIMAL',
      icon: FileText,
      color: 'indigo',
      description: 'Editorial-grade PYQs, NCERT summaries, formulas, and verified notes curated by state top-rankers.',
      dependencies: ['P7 Blueprints', 'P8 Subscriptions', 'P2 Teachers']
    },
    {
      id: 'p6-mocks',
      pillarNumber: '06',
      title: 'CBT Mock Tests',
      category: 'EXAMINATION ENGINE',
      metric: interconnectedPillars.mockTestsCount.toLocaleString('en-IN'),
      unit: 'Live CBT Papers',
      growth: '+68.2% YoY',
      status: 'OPTIMAL',
      icon: Award,
      color: 'cyan',
      description: 'Standardized NTA/UPSC style CBT mock simulators with All-India Rank telemetry and IRT percentile curves.',
      dependencies: ['P7 Blueprints', 'P11 Performance', 'P8 Subscriptions']
    },
    {
      id: 'p7-blueprints',
      pillarNumber: '07',
      title: 'Exam Blueprints',
      category: 'CURRICULA ARCHITECTURE',
      metric: interconnectedPillars.activeExamsCount.toLocaleString('en-IN'),
      unit: 'Target Curricula',
      growth: selectedLocation.stateName ? `${selectedLocation.stateName} Scope` : 'National Scale',
      status: 'HEALTHY',
      icon: Layers,
      color: 'rose',
      description: 'Official syllabi structures, question distribution matrices, negative marking policies, and cutoffs.',
      dependencies: ['P5 Materials', 'P6 Mock Tests', 'P11 Performance']
    },
    {
      id: 'p8-subscriptions',
      pillarNumber: '08',
      title: 'Active Passes',
      category: 'COMMERCIAL LICENSES',
      metric: interconnectedPillars.activeSubscriptionsCount.toLocaleString('en-IN'),
      unit: 'Monetized Licenses',
      growth: '+38.7% YoY',
      status: 'OPTIMAL',
      icon: Sparkles,
      color: 'emerald',
      description: 'Student entitlement authority with automatic time-based access control, grace periods, and renewal triggers.',
      dependencies: ['P9 Revenue', 'P1 Students', 'P5 Materials']
    },
    {
      id: 'p9-revenue',
      pillarNumber: '09',
      title: 'Gross Digital Inflow',
      category: 'FINANCIAL SETTLEMENT',
      metric: `₹${interconnectedPillars.grossDigitalRevenue.toLocaleString('en-IN')}`,
      unit: 'Catalog GMV',
      growth: '+49.3% YoY',
      status: 'OPTIMAL',
      icon: IndianRupee,
      color: 'amber',
      description: 'Centralized transaction and tax invoice ledger with instantaneous revenue recognition and commission split.',
      dependencies: ['P8 Subscriptions', 'P3 Libraries', 'P4 Tuition']
    },
    {
      id: 'p10-attendance',
      pillarNumber: '10',
      title: 'Attendance Integrity',
      category: 'VERIFICATION AUDIT',
      metric: `${interconnectedPillars.attendanceCompliance}%`,
      unit: 'Audit Compliance',
      growth: '99.9% Geofenced',
      status: 'OPTIMAL',
      icon: CheckCircle,
      color: 'blue',
      description: 'Zero-proxy QR and biometric attendance verification across all partner reading rooms and tuition batches.',
      dependencies: ['P3 Libraries', 'P1 Students', 'P4 Tuition']
    },
    {
      id: 'p11-performance',
      pillarNumber: '11',
      title: 'Composite Score',
      category: 'ACADEMIC OUTCOME',
      metric: `${interconnectedPillars.avgAcademicPerformance}%`,
      unit: 'Mean Test Accuracy',
      growth: '+8.2% Median',
      status: 'ELEVATED',
      icon: TrendingUp,
      color: 'purple',
      description: 'Pan-India cross-exam student percentile distribution, diagnostic weak-area tagging, and AI mistake elimination.',
      dependencies: ['P6 Mock Tests', 'P5 Materials', 'P1 Students']
    }
  ];

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      {/* ==================================================================== */}
      {/* 1. TIER 3 COCKPIT HEADER WITH 3D QUANTUM ACADEMIC ENGINE ORB         */}
      {/* ==================================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 border-2 border-slate-800 p-6 md:p-8 shadow-2xl hud-corner-brackets">
        {/* Ambient Laser Gradients */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Cockpit Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80 text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
            <span className="text-cyan-400 font-bold uppercase tracking-widest text-[11px]">
              SUPER ADMIN GOVERNANCE HIGHWAY // ACADEMIC BUSINESS OS
            </span>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <span className="text-slate-400 hidden sm:inline">11-PILLAR INTERCONNECTED COMMERCIAL ENGINE</span>
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
              onClick={refreshData}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all cursor-pointer"
              title="Refresh Academic Telemetry"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Cockpit Mid Section: Title + Holographic 3D Academic OS Orb */}
        <div className="pt-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 font-mono">
                <Sparkles className="w-3 h-3 text-cyan-300" /> 11-PILLAR INTERCONNECTED OS ACTIVE
              </span>
              <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 font-mono">
                <ShieldCheck className="w-3 h-3 text-emerald-300" /> PAN-INDIA COMMERCIAL SYNC VERIFIED
              </span>
              <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5 font-mono">
                <Lock className="w-3 h-3 text-purple-300" /> REAL-TIME ENTITLEMENT DEFENSE ARMED
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              Academic Business OS & Commercial Intelligence Cockpit
              <ShoppingBag className="w-7 h-7 text-cyan-400 shrink-0 hidden sm:inline animate-pulse" />
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Unified cross-enterprise command center mapping Students, Teachers, Libraries, Tuition, Study Materials, Mock Tests, Blueprints, Commercial Subscriptions, Digital Revenue, QR Attendance, and Pan-India Performance telemetry across 75+ districts.
            </p>
          </div>

          {/* Holographic 3D Quantum Multi-Core Engine Orb */}
          <div className="relative shrink-0 flex items-center justify-center p-3 bg-slate-900/90 rounded-2xl border-2 border-slate-800 shadow-inner">
            <div className="relative w-28 h-28 flex items-center justify-center">
              {/* Spinning outer rings */}
              <svg className="absolute inset-0 w-full h-full animate-[spin_12s_linear_infinite]" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(6,182,212,0.3)" strokeWidth="1.5" strokeDasharray="6 8" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(16,185,129,0.3)" strokeWidth="1" strokeDasharray="3 6" />
              </svg>
              <svg className="absolute inset-0 w-full h-full animate-[spin_8s_linear_infinite_reverse]" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(168,85,247,0.3)" strokeWidth="1" strokeDasharray="4 4" />
              </svg>

              {/* Pulsing Quantum Core */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 via-emerald-500 to-purple-500 p-0.5 shadow-lg shadow-cyan-500/30 animate-pulse flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center">
                  <Activity className="w-5 h-5 text-cyan-300" />
                </div>
              </div>
            </div>

            <div className="ml-3 font-mono text-left">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">BUSINESS OS CORE</div>
              <div className="text-sm font-black text-cyan-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
                {interconnectedPillars.activeSubscriptionsCount.toLocaleString('en-IN')} Passes
              </div>
              <div className="text-[10px] text-slate-300 mt-0.5">
                Inflow: <span className="text-emerald-400 font-bold">₹{interconnectedPillars.grossDigitalRevenue.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Neon Laser Divider */}
        <div className="h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent my-6 opacity-40" />

        {/* Cockpit Tier 3: Period Pills & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">ANALYSIS HORIZON:</span>
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-mono">
              {(['today', 'week', 'month', 'quarter', 'all'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => {
                    playSfx('click');
                    setFilterPeriod(period);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filterPeriod === period
                      ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30 font-black'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {period === 'today' ? 'Today' : period === 'week' ? '7D' : period === 'month' ? '30D' : period === 'quarter' ? 'Quarter' : 'All Time'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                playSfx('warp');
                setIsExportModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold font-mono transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export Dossier</span>
            </button>

            <button
              onClick={() => {
                playSfx('confirm');
                window.print();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white text-xs font-bold font-mono transition-all cursor-pointer shadow-md shadow-cyan-500/20"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Print Briefing</span>
            </button>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. DEDICATED FUTURISTIC PAN-INDIA LOCATION COMMAND CONSOLE          */}
      {/* ==================================================================== */}
      <div className="p-6 rounded-3xl bg-slate-950 border-2 border-slate-800 shadow-2xl hud-corner-brackets space-y-4">
        {/* Top Header of Location Console */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800 text-xs font-mono">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Compass className="w-4 h-4 animate-[spin_20s_linear_infinite]" />
            </div>
            <div>
              <div className="text-white font-bold uppercase tracking-wider text-xs flex items-center gap-2">
                <span>Pan-India Cognitive Geo-Location & Territorial Highway</span>
                <span className="text-[10px] text-slate-500 hidden sm:inline">•</span>
                <span className="text-cyan-400 text-[11px] font-bold">28 States & 8 UTs Active</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Instant cascading filters strictly binding telemetry, revenue run-rates, and the student entitlement ledger.
              </div>
            </div>
          </div>

          {/* Active Breadcrumb & Reset */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400 uppercase text-[10px]">CURRENT:</span>
              <span className="text-white font-bold">{selectedLocation.breadcrumb}</span>
              <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                selectedLocation.level === 'INDIA' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                selectedLocation.level === 'STATE' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                selectedLocation.level === 'DISTRICT' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {selectedLocation.level}
              </span>
            </div>

            {selectedLocation.level !== 'INDIA' && (
              <button
                type="button"
                onClick={handleResetToPanIndia}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-all cursor-pointer"
                title="Reset to Nationwide Pan-India"
              >
                <RotateCcw className="w-3 h-3 text-cyan-400" />
                <span>Reset Nationwide</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Territorial Preset Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono scrollbar-none">
          <span className="text-slate-500 text-[10px] uppercase font-bold shrink-0 mr-1 flex items-center gap-1">
            <Navigation className="w-3 h-3 text-cyan-400" /> Quick Territory:
          </span>

          {[
            { label: 'Pan-India (All 36)', state: 'ALL', count: '100% Volume' },
            { label: 'Uttar Pradesh (75 Districts)', state: 'Uttar Pradesh', count: '64% Share' },
            { label: 'Bihar (38 Districts)', state: 'Bihar', count: '19% Share' },
            { label: 'Delhi-NCR (Central)', state: 'Delhi', count: '12% Share' },
            { label: 'Rajasthan (Desert Hub)', state: 'Rajasthan', count: '8% Share' },
            { label: 'Madhya Pradesh (Central)', state: 'Madhya Pradesh', count: '7% Share' },
            { label: 'Maharashtra (Western Hub)', state: 'Maharashtra', count: '9% Share' }
          ].map((preset) => {
            const isActive = preset.state === 'ALL' 
              ? selectedLocation.level === 'INDIA' 
              : selectedLocation.stateName?.toLowerCase() === preset.state.toLowerCase();

            return (
              <button
                key={preset.label}
                onClick={() => handleSelectStateByName(preset.state)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border-2 border-cyan-500 shadow-md shadow-cyan-500/20 font-black'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <span>{preset.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isActive ? 'bg-cyan-500 text-slate-950 font-black' : 'bg-slate-950 text-slate-500'}`}>
                  {preset.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* 3 Cascading Location Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1 text-xs font-mono">
          {/* Level 1: State / UT Selector */}
          <div className="relative">
            <label className="text-[10px] font-bold text-slate-400 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1 text-cyan-400">
                <Compass className="w-3.5 h-3.5" /> 1. STATE / UNION TERRITORY
              </span>
              <span className="text-slate-500">({statesList.length} States/UTs)</span>
            </label>
            <select
              value={selectedLocation.stateName || 'ALL'}
              onChange={(e) => handleSelectStateByName(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-slate-900 border-2 border-slate-700 hover:border-cyan-500 text-white font-bold text-xs focus:outline-none focus:border-cyan-400 transition-colors cursor-pointer shadow-inner"
            >
              <option value="ALL">🌐 All States & UTs (Pan-India)</option>
              {statesList.map(st => (
                <option key={st.id} value={st.name} className="bg-slate-950 text-white">
                  {st.name} ({st.type})
                </option>
              ))}
            </select>
          </div>

          {/* Level 2: District Selector */}
          <div className="relative">
            <label className="text-[10px] font-bold text-slate-400 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1 text-purple-400">
                <MapPin className="w-3.5 h-3.5" /> 2. DISTRICT CORRIDOR
              </span>
              {selectedLocation.stateName && (
                <span className="text-purple-400 font-bold">
                  ({districtsList.length} in {selectedLocation.stateName})
                </span>
              )}
            </label>
            <select
              disabled={!selectedLocation.stateName}
              value={selectedLocation.districtName || 'ALL'}
              onChange={(e) => handleSelectDistrictByName(e.target.value)}
              className={`w-full h-11 px-3.5 rounded-xl border-2 text-xs font-bold transition-colors shadow-inner ${
                !selectedLocation.stateName
                  ? 'bg-slate-950/40 border-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-slate-900 border-slate-700 hover:border-purple-500 text-white focus:outline-none focus:border-purple-400 cursor-pointer'
              }`}
            >
              <option value="ALL">
                {!selectedLocation.stateName ? 'Select State First' : `All Districts in ${selectedLocation.stateName}`}
              </option>
              {districtsList.map(d => (
                <option key={d.id} value={d.name} className="bg-slate-950 text-white">
                  {d.name} {d.code ? `(${d.code})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Level 3: Locality Selector */}
          <div className="relative">
            <label className="text-[10px] font-bold text-slate-400 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1 text-emerald-400">
                <Building className="w-3.5 h-3.5" /> 3. LOCALITY / STUDY CLUSTER
              </span>
              {selectedLocation.districtName && (
                <span className="text-emerald-400 font-bold">
                  ({localitiesList.length} in {selectedLocation.districtName})
                </span>
              )}
            </label>
            <select
              disabled={!selectedLocation.districtName}
              value={selectedLocation.localityName || 'ALL'}
              onChange={(e) => handleSelectLocalityByName(e.target.value)}
              className={`w-full h-11 px-3.5 rounded-xl border-2 text-xs font-bold transition-colors shadow-inner ${
                !selectedLocation.districtName
                  ? 'bg-slate-950/40 border-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-slate-900 border-slate-700 hover:border-emerald-500 text-white focus:outline-none focus:border-emerald-400 cursor-pointer'
              }`}
            >
              <option value="ALL">
                {!selectedLocation.districtName ? 'Select District First' : `All Localities in ${selectedLocation.districtName}`}
              </option>
              {localitiesList.map(l => (
                <option key={l.id} value={l.name} className="bg-slate-950 text-white">
                  {l.name} {l.pincode ? `(PIN ${l.pincode})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Territorial Telemetry Summary Bar */}
        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px]">ACTIVE TERRITORIAL CALIBRATION:</span>
            <span className="text-cyan-300 font-bold font-sans">
              {selectedLocation.breadcrumb}
            </span>
          </div>

          <div className="flex items-center gap-4 flex-wrap text-[11px]">
            <div>
              <span className="text-slate-500">SCHOLARS IN SCOPE: </span>
              <span className="text-blue-400 font-bold font-mono">
                {interconnectedPillars.studentsCount.toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-slate-500">PASSES IN SCOPE: </span>
              <span className="text-emerald-400 font-bold font-mono">
                {interconnectedPillars.activeSubscriptionsCount.toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-slate-500">TERRITORY GMV: </span>
              <span className="text-amber-400 font-bold font-mono">
                ₹{interconnectedPillars.grossDigitalRevenue.toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-slate-500">MATCHED LEDGER RECORDS: </span>
              <span className="text-purple-400 font-bold font-mono">
                {filteredSubscriptions.length} Passes
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. 12 CORNER-BRACKETED CYBER-HUD KPI METRIC DECKS                    */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 text-xs font-mono">
        {/* Card 1: Students */}
        <div className="relative p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg hud-corner-brackets hover:border-blue-500/50 transition-all group">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold tracking-wider">
            <span className="flex items-center gap-1.5 text-blue-400">
              <Users className="w-3.5 h-3.5" /> 1. Students
            </span>
            <span className="text-[9px] text-emerald-400 font-bold">+18.4%</span>
          </div>
          <p className="text-2xl font-black text-white mt-2 group-hover:text-blue-300 transition-colors">
            {interconnectedPillars.studentsCount.toLocaleString('en-IN')}
          </p>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
            <span>Enrolled Scholars</span>
            <span className="text-blue-400 font-semibold">Active</span>
          </div>
        </div>

        {/* Card 2: Teachers */}
        <div className="relative p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg hud-corner-brackets hover:border-emerald-500/50 transition-all group">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold tracking-wider">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <GraduationCap className="w-3.5 h-3.5" /> 2. Teachers
            </span>
            <span className="text-[9px] text-emerald-400 font-bold">+24%</span>
          </div>
          <p className="text-2xl font-black text-white mt-2 group-hover:text-emerald-300 transition-colors">
            {interconnectedPillars.teachersCount.toLocaleString('en-IN')}
          </p>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
            <span>Verified Educators</span>
            <span className="text-emerald-400 font-semibold">100% Valid</span>
          </div>
        </div>

        {/* Card 3: Libraries */}
        <div className="relative p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg hud-corner-brackets hover:border-purple-500/50 transition-all group">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold tracking-wider">
            <span className="flex items-center gap-1.5 text-purple-400">
              <Building className="w-3.5 h-3.5" /> 3. Libraries
            </span>
            <span className="text-[9px] text-purple-400 font-bold">Partner Hubs</span>
          </div>
          <p className="text-2xl font-black text-white mt-2 group-hover:text-purple-300 transition-colors">
            {interconnectedPillars.librariesCount.toLocaleString('en-IN')}
          </p>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
            <span>Study Center Desks</span>
            <span className="text-purple-400 font-semibold">Active</span>
          </div>
        </div>

        {/* Card 4: Tuition */}
        <div className="relative p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg hud-corner-brackets hover:border-amber-500/50 transition-all group">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold tracking-wider">
            <span className="flex items-center gap-1.5 text-amber-400">
              <BookOpen className="w-3.5 h-3.5" /> 4. Home Tuition
            </span>
            <span className="text-[9px] text-amber-400 font-bold">1-on-1 Mentorship</span>
          </div>
          <p className="text-2xl font-black text-white mt-2 group-hover:text-amber-300 transition-colors">
            {interconnectedPillars.tuitionsCount.toLocaleString('en-IN')}
          </p>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
            <span>Active Mentorships</span>
            <span className="text-amber-400 font-semibold">Live Pairs</span>
          </div>
        </div>

        {/* Card 5: Materials */}
        <div className="relative p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg hud-corner-brackets hover:border-indigo-500/50 transition-all group">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold tracking-wider">
            <span className="flex items-center gap-1.5 text-indigo-400">
              <FileText className="w-3.5 h-3.5" /> 5. Materials
            </span>
            <span className="text-[9px] text-indigo-400 font-bold">Vault Live</span>
          </div>
          <p className="text-2xl font-black text-white mt-2 group-hover:text-indigo-300 transition-colors">
            {interconnectedPillars.studyMaterialsCount.toLocaleString('en-IN')}
          </p>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
            <span>Verified Note Packs</span>
            <span className="text-indigo-400 font-semibold">Curated</span>
          </div>
        </div>

        {/* Card 6: Mocks */}
        <div className="relative p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg hud-corner-brackets hover:border-cyan-500/50 transition-all group">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold tracking-wider">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <Award className="w-3.5 h-3.5" /> 6. Mock Tests
            </span>
            <span className="text-[9px] text-cyan-400 font-bold">IRT 3-PL</span>
          </div>
          <p className="text-2xl font-black text-white mt-2 group-hover:text-cyan-300 transition-colors">
            {interconnectedPillars.mockTestsCount.toLocaleString('en-IN')}
          </p>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
            <span>CBT Simulations</span>
            <span className="text-cyan-400 font-semibold">Timed</span>
          </div>
        </div>

        {/* Card 7: Blueprints */}
        <div className="relative p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg hud-corner-brackets hover:border-rose-500/50 transition-all group">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold tracking-wider">
            <span className="flex items-center gap-1.5 text-rose-400">
              <Layers className="w-3.5 h-3.5" /> 7. Blueprints
            </span>
            <span className="text-[9px] text-rose-400 font-bold">{selectedLocation.stateName || 'Govt Exams'}</span>
          </div>
          <p className="text-2xl font-black text-white mt-2 group-hover:text-rose-300 transition-colors">
            {interconnectedPillars.activeExamsCount.toLocaleString('en-IN')}
          </p>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
            <span>Target Curricula</span>
            <span className="text-rose-400 font-semibold">Active</span>
          </div>
        </div>

        {/* Card 8: Subscriptions */}
        <div className="relative p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg hud-corner-brackets hover:border-emerald-500/50 transition-all group">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold tracking-wider">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" /> 8. Subscriptions
            </span>
            <span className="text-[9px] text-emerald-400 font-bold">Monetized</span>
          </div>
          <p className="text-2xl font-black text-white mt-2 group-hover:text-emerald-300 transition-colors">
            {interconnectedPillars.activeSubscriptionsCount.toLocaleString('en-IN')}
          </p>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
            <span>Active Digital Passes</span>
            <span className="text-emerald-400 font-semibold">Entitled</span>
          </div>
        </div>

        {/* Card 9: Gross Revenue */}
        <div className="relative p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg hud-corner-brackets hover:border-amber-500/50 transition-all group">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold tracking-wider">
            <span className="flex items-center gap-1.5 text-amber-400">
              <IndianRupee className="w-3.5 h-3.5" /> 9. Gross Inflow
            </span>
            <span className="text-[9px] text-emerald-400 font-bold">+49%</span>
          </div>
          <p className="text-2xl font-black text-amber-400 mt-2">
            ₹{interconnectedPillars.grossDigitalRevenue.toLocaleString('en-IN')}
          </p>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
            <span>Digital Catalog GMV</span>
            <span className="text-amber-400 font-semibold">Volume</span>
          </div>
        </div>

        {/* Card 10: Attendance */}
        <div className="relative p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg hud-corner-brackets hover:border-blue-500/50 transition-all group">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold tracking-wider">
            <span className="flex items-center gap-1.5 text-blue-400">
              <CheckCircle className="w-3.5 h-3.5" /> 10. Attendance
            </span>
            <span className="text-[9px] text-emerald-400 font-bold">Biometric</span>
          </div>
          <p className="text-2xl font-black text-white mt-2 group-hover:text-blue-300 transition-colors">
            {interconnectedPillars.attendanceCompliance}%
          </p>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
            <span>QR Attendance Integrity</span>
            <span className="text-blue-400 font-semibold">Zero-Proxy</span>
          </div>
        </div>

        {/* Card 11: Academic Performance */}
        <div className="relative p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg hud-corner-brackets hover:border-purple-500/50 transition-all group">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold tracking-wider">
            <span className="flex items-center gap-1.5 text-purple-400">
              <TrendingUp className="w-3.5 h-3.5" /> 11. Performance
            </span>
            <span className="text-[9px] text-purple-400 font-bold">Median</span>
          </div>
          <p className="text-2xl font-black text-white mt-2 group-hover:text-purple-300 transition-colors">
            {interconnectedPillars.avgAcademicPerformance}%
          </p>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
            <span>Composite Score Mean</span>
            <span className="text-purple-400 font-semibold">Benchmarked</span>
          </div>
        </div>

        {/* Card 12: EBITDA Margin */}
        <div className="relative p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg hud-corner-brackets hover:border-emerald-500/50 transition-all group">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold tracking-wider">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Percent className="w-3.5 h-3.5" /> 12. Operating Margin
            </span>
            <span className="text-[9px] text-emerald-400 font-bold">High Gross</span>
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-2">
            {interconnectedPillars.ebitdaMargin}%
          </p>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
            <span>Digital Platform Margin</span>
            <span className="text-emerald-400 font-semibold">EBITDA</span>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 4. DUAL INTERACTIVE CYBER DONUT CHARTS                                */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-slate-950 border-2 border-slate-800 shadow-2xl hud-corner-brackets">
          <InteractivePieDonutChart
            title="Cross-Pillar Digital Revenue Stream Matrix"
            subtitle="Monetization distribution across CBT Mocks, Notes, AI Studio & Packages"
            data={revenueMatrixShareData}
            centerLabel="REVENUE"
            centerValue={`₹${(interconnectedPillars.grossDigitalRevenue / 1000).toFixed(1)}k`}
          />
        </div>

        <div className="p-6 rounded-3xl bg-slate-950 border-2 border-slate-800 shadow-2xl hud-corner-brackets">
          <InteractivePieDonutChart
            title="Pan-India Academic Entitlement Territorial Density"
            subtitle="Regional concentration of active learners, library desks & digital passes"
            data={regionalDensityData}
            centerLabel="PASSES"
            centerValue={`${interconnectedPillars.activeSubscriptionsCount}`}
          />
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 5. ACTIVE ACADEMIC BUSINESS DEFENSE RADAR (4 SAFEGUARD GATES)        */}
      {/* ==================================================================== */}
      <div className="rounded-3xl bg-slate-950 border-2 border-slate-800 p-6 shadow-2xl hud-corner-brackets space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-mono">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-white font-bold uppercase tracking-wider text-sm">
              Academic Enterprise Defense Radar // 4 Commercial Safeguard Gates
            </span>
          </div>
          <span className="text-emerald-400 font-semibold text-[11px] bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            ALL ENFORCEMENT PROTOCOLS ARMED & SYNCHRONIZED
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
          {/* Gate 1 */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 hover:border-cyan-500/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-cyan-400 font-bold uppercase">Gate 01 // Multi-Tier Guard</span>
              <span className="px-2 py-0.5 rounded text-[9px] font-black bg-cyan-500/20 text-cyan-300">0-DELAY LOCK</span>
            </div>
            <p className="font-bold text-slate-100 text-xs">Automated License Revocation</p>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              Instant hardware lock upon subscription expiration while strictly archiving candidate performance telemetry without data loss.
            </p>
          </div>

          {/* Gate 2 */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 hover:border-emerald-500/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-emerald-400 font-bold uppercase">Gate 02 // Anti-Piracy Vault</span>
              <span className="px-2 py-0.5 rounded text-[9px] font-black bg-emerald-500/20 text-emerald-300">AES-256 TOKEN</span>
            </div>
            <p className="font-bold text-slate-100 text-xs">Hardware Fingerprint & Dynamic Watermark</p>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              Dynamic student identity stamping on all downloaded note vaults and CBT questions to eliminate content piracy.
            </p>
          </div>

          {/* Gate 3 */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 hover:border-purple-500/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-purple-400 font-bold uppercase">Gate 03 // Price Arbiter</span>
              <span className="px-2 py-0.5 rounded text-[9px] font-black bg-purple-500/20 text-purple-300">RULE ENGINE</span>
            </div>
            <p className="font-bold text-slate-100 text-xs">Concession & Voucher Real-Time Audit</p>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              Validates library student desk bookings, teacher referral codes, and district quotas against unauthorized discount exploits.
            </p>
          </div>

          {/* Gate 4 */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 hover:border-amber-500/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-amber-400 font-bold uppercase">Gate 04 // GSTIN Hash Ledger</span>
              <span className="px-2 py-0.5 rounded text-[9px] font-black bg-amber-500/20 text-amber-300">SHA-256 SEAL</span>
            </div>
            <p className="font-bold text-slate-100 text-xs">Tamper-Proof Invoicing Authority</p>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              Every student pass purchase generates an irreversible SHA-256 cryptographic invoice seal for state tax audits.
            </p>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 6. MULTI-TAB FUTURISTIC MISSION DECK                                 */}
      {/* ==================================================================== */}
      <div className="space-y-6">
        {/* Tab Navigation Pill Bar */}
        <div className="flex flex-wrap items-center gap-2 p-2 rounded-2xl bg-slate-950 border-2 border-slate-800 text-xs font-mono">
          <button
            onClick={() => handleTabChange('PILLARS_MATRIX')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'PILLARS_MATRIX'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 text-cyan-300" />
            <span>1. 11-Pillar Interconnected Matrix</span>
          </button>

          <button
            onClick={() => handleTabChange('COMMERCIAL_CHANNELS')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'COMMERCIAL_CHANNELS'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-emerald-300" />
            <span>2. Digital Product Channels</span>
          </button>

          <button
            onClick={() => handleTabChange('ENTITLEMENT_LEDGER')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'ENTITLEMENT_LEDGER'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Receipt className="w-4 h-4 text-purple-300" />
            <span>3. Student Subscription & Entitlement Ledger</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-900 border border-slate-700">
              {filteredSubscriptions.length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('INSTITUTIONAL_QUOTAS')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'INSTITUTIONAL_QUOTAS'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Building className="w-4 h-4 text-amber-300" />
            <span>4. Institutional & Concession Quotas</span>
          </button>

          <button
            onClick={() => handleTabChange('TRANSACTION_AUDIT')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'TRANSACTION_AUDIT'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Activity className="w-4 h-4 text-rose-300" />
            <span>5. Live Transaction & SHA-256 Audit</span>
          </button>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* TAB 1: 11-PILLAR INTERCONNECTED MATRIX                             */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'PILLARS_MATRIX' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-slate-950 border-2 border-slate-800 shadow-2xl hud-corner-brackets">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 text-xs font-mono">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    Unified 11-Pillar Enterprise Architecture Matrix
                  </h3>
                  <p className="text-slate-400 text-xs mt-1 font-sans">
                    Continuous cross-domain telemetry binding Learners, Faculty, Physical Infrastructure, Content Curricula & Financial Settlements.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold text-[11px]">
                    11/11 PILLARS SYNCHRONIZED
                  </span>
                </div>
              </div>

              {/* Grid of 11 Pillars */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
                {PILLARS_LIST.map((pillar) => {
                  const IconComp = pillar.icon;
                  return (
                    <div
                      key={pillar.id}
                      onClick={() => {
                        playSfx('click');
                        setSelectedPillarDetail(pillar);
                      }}
                      className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 hover:border-cyan-500/50 transition-all cursor-pointer group shadow-md space-y-3 relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-2 rounded-xl bg-${pillar.color}-500/10 border border-${pillar.color}-500/30 text-${pillar.color}-400 group-hover:scale-110 transition-transform`}>
                            <IconComp className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">
                              PILLAR {pillar.pillarNumber} // {pillar.category}
                            </span>
                            <h4 className="text-sm font-black text-white group-hover:text-cyan-300 transition-colors">
                              {pillar.title}
                            </h4>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black ${
                          pillar.status === 'OPTIMAL' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                          pillar.status === 'HEALTHY' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                          'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        }`}>
                          {pillar.status}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between pt-1">
                        <div>
                          <span className="text-2xl font-black font-mono text-white">
                            {pillar.metric}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 ml-1.5">
                            {pillar.unit}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono font-bold text-emerald-400">
                          {pillar.growth}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 leading-relaxed font-sans line-clamp-2">
                        {pillar.description}
                      </p>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                        <span>Connected:</span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {pillar.dependencies.map((dep, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                              {dep}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 2: DIGITAL PRODUCT CHANNELS & CATALOG MONETIZATION             */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'COMMERCIAL_CHANNELS' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Channel 1: Mock Tests */}
              <div className="p-6 rounded-3xl bg-slate-950 border-2 border-slate-800 shadow-2xl hud-corner-brackets space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 font-mono">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-cyan-400" />
                    Mock Test Pass Subscriptions
                  </h3>
                  <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    ₹{Math.round(metrics.mockTests.revenue * effectiveMultiplier).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="space-y-3 text-xs font-mono">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Total Passes Sold:</span>
                    <span className="font-bold text-white font-mono text-sm">{Math.round(metrics.mockTests.totalSold * effectiveMultiplier)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Currently Active Learners:</span>
                    <span className="font-bold text-emerald-400 font-mono text-sm">{Math.round(metrics.mockTests.activeSubscriptions * effectiveMultiplier)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Expired Pass Records:</span>
                    <span className="font-bold text-slate-500 font-mono text-sm">{Math.round(metrics.mockTests.expiredSubscriptions * effectiveMultiplier)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Repeat Renewals:</span>
                    <span className="font-bold text-cyan-400 font-mono text-sm">{Math.round(metrics.mockTests.renewals * effectiveMultiplier)}</span>
                  </div>
                  <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                    <span className="text-slate-300 font-bold block mb-1">Key Monetized Products:</span>
                    <ul className="space-y-1 text-slate-400 list-disc list-inside">
                      <li>Pan-India 30-Day CBT Pass (₹99 / ₹299)</li>
                      <li>UP Police SI 2026 Grand CBT Battery (₹299)</li>
                      <li>UPSC Prelims CSAT & GS Simulator (₹499)</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Channel 2: Study Material Vault */}
              <div className="p-6 rounded-3xl bg-slate-950 border-2 border-slate-800 shadow-2xl hud-corner-brackets space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 font-mono">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-400" />
                    Study Material Vault Passes
                  </h3>
                  <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    ₹{Math.round(metrics.studyMaterial.revenue * effectiveMultiplier).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="space-y-3 text-xs font-mono">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Downloads & Purchases:</span>
                    <span className="font-bold text-white font-mono text-sm">{Math.round(metrics.studyMaterial.totalSold * effectiveMultiplier)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Active Vault Entitlements:</span>
                    <span className="font-bold text-emerald-400 font-mono text-sm">{Math.round(metrics.studyMaterial.activeEntitlements * effectiveMultiplier)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Expired Vault Licenses:</span>
                    <span className="font-bold text-slate-500 font-mono text-sm">{Math.round(metrics.studyMaterial.expiredEntitlements * effectiveMultiplier)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Library Concession Quota:</span>
                    <span className="font-bold text-purple-400 font-mono text-sm">
                      {Math.round(subscriptionsList.filter(s => s.source === 'LIBRARY_BOOKING').length * effectiveMultiplier)}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                    <span className="text-slate-300 font-bold block mb-1">Top Material Vaults:</span>
                    <ul className="space-y-1 text-slate-400 list-disc list-inside">
                      <li>Modern Indian History Comprehensive Notes (₹149)</li>
                      <li>General Hindi 2,000 Verified MCQ Compendium (₹99)</li>
                      <li>NEET-UG Line-by-Line Biology Booster (₹299)</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Channel 3: AI Studio & Complete Bundles */}
              <div className="p-6 rounded-3xl bg-slate-950 border-2 border-slate-800 shadow-2xl hud-corner-brackets space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 font-mono">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    AI Studio & Complete Bundles
                  </h3>
                  <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    ₹{Math.round((metrics.growingIntelligence.revenue + metrics.mistakeBook.revenue + metrics.completePackages.revenue) * effectiveMultiplier).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="space-y-3 text-xs font-mono">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Complete National Bundles:</span>
                    <span className="font-bold text-white font-mono text-sm">{Math.round(metrics.completePackages.active * effectiveMultiplier)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Growing Intelligence Passes:</span>
                    <span className="font-bold text-emerald-400 font-mono text-sm">{Math.round(metrics.growingIntelligence.activeSubscriptions * effectiveMultiplier)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Active Mistake Book Users:</span>
                    <span className="font-bold text-purple-400 font-mono text-sm">{Math.round(metrics.mistakeBook.activeSubscriptions * effectiveMultiplier)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Annual Bundle Realization:</span>
                    <span className="font-bold text-emerald-400 font-mono text-sm">
                      ₹{Math.round(metrics.completePackages.revenue * effectiveMultiplier).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                    <span className="text-slate-300 font-bold block mb-1">Premium Flagship Passes:</span>
                    <ul className="space-y-1 text-slate-400 list-disc list-inside">
                      <li>BPSC 71st CCE Master All-Access Pass (₹999)</li>
                      <li>Personalized AI Mistake Book & Diagnostic (₹499)</li>
                      <li>National Annual All-India Scholar Pass (₹1,499)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 3: STUDENT SUBSCRIPTION & ENTITLEMENT LEDGER                   */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'ENTITLEMENT_LEDGER' && (
          <div className="p-6 rounded-3xl bg-slate-950 border-2 border-slate-800 shadow-2xl hud-corner-brackets space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-cyan-400" />
                  Student Subscription & Entitlement Ledger ({filteredSubscriptions.length})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Filtered by Territory: <span className="text-cyan-300 font-bold font-mono">{selectedLocation.breadcrumb}</span>. Complete cryptographic audit ledger with student identification, priority pricing tier applied, validity ranges, tax invoice hashes, and instant license controls.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto font-mono text-xs">
                {/* Search Box */}
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search student, invoice, city..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:bg-slate-900 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    playSfx('click');
                    setStatusFilter(e.target.value as any);
                    setCurrentPage(1);
                  }}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-semibold focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">Active Entitlements</option>
                  <option value="EXPIRED">Expired Passes</option>
                </select>

                {/* Product Type Filter */}
                <select
                  value={typeFilter}
                  onChange={(e) => {
                    playSfx('click');
                    setTypeFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-semibold focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
                >
                  <option value="ALL">All Product Types</option>
                  <option value="MOCK_TEST_SUBSCRIPTION">Mock Test Passes</option>
                  <option value="COMPLETE_EXAM_PACKAGE">Complete Exam Packages</option>
                  <option value="STUDY_MATERIAL_SUBSCRIPTION">Study Material Passes</option>
                  <option value="GROWING_INTELLIGENCE">Growing Intelligence Passes</option>
                </select>

                {/* Pricing Scope Filter */}
                <select
                  value={scopeFilter}
                  onChange={(e) => {
                    playSfx('click');
                    setScopeFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-semibold focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
                >
                  <option value="ALL">All Pricing Scopes</option>
                  <option value="STUDENT">Student Scholar</option>
                  <option value="TEACHER">Teacher Referral</option>
                  <option value="LIBRARY">Library Concession</option>
                  <option value="DISTRICT">District Priority</option>
                  <option value="STATE">State Quota</option>
                </select>
              </div>
            </div>

            {/* Ledger Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
              <table className="w-full text-left text-xs min-w-[950px] font-mono">
                <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[11px] font-bold border-b border-slate-800">
                  <tr>
                    <th 
                      onClick={() => {
                        setSortField('student');
                        setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                      }}
                      className="px-4 py-3.5 cursor-pointer hover:text-white transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Student & ID</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="px-4 py-3.5">Territory & Hub</th>
                    <th 
                      onClick={() => {
                        setSortField('product');
                        setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                      }}
                      className="px-4 py-3.5 cursor-pointer hover:text-white transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Product Subscribed</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="px-4 py-3.5">Pricing Tier Applied</th>
                    <th 
                      onClick={() => {
                        setSortField('endDate');
                        setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                      }}
                      className="px-4 py-3.5 cursor-pointer hover:text-white transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Validity Range</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th 
                      onClick={() => {
                        setSortField('amount');
                        setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                      }}
                      className="px-4 py-3.5 text-right cursor-pointer hover:text-white transition-colors"
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <span>Paid Amount</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th 
                      onClick={() => {
                        setSortField('invoice');
                        setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                      }}
                      className="px-4 py-3.5 cursor-pointer hover:text-white transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Tax Invoice</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="px-4 py-3.5 text-center">Status</th>
                    <th className="px-4 py-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-950/60">
                  {paginatedSubscriptions.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-16 text-center text-slate-400 font-medium font-sans">
                        <div className="max-w-md mx-auto space-y-3">
                          <MapPin className="w-8 h-8 text-cyan-400 mx-auto opacity-70 animate-bounce" />
                          <div className="text-white font-bold text-sm">
                            No student passes found for territory: {selectedLocation.breadcrumb}
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            No active student passes are currently registered for this specific territory filter. Reset to Nationwide Pan-India or select another state/district.
                          </p>
                          <button
                            onClick={handleResetToPanIndia}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs font-mono transition-colors cursor-pointer shadow-lg shadow-cyan-600/30"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Reset to All India (Full Coverage)</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedSubscriptions.map(sub => {
                      const isExpired = sub.status === 'EXPIRED' || sub.endDate < today;

                      return (
                        <tr key={sub.id} className="hover:bg-slate-900/60 transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="font-bold text-white text-xs sm:text-sm font-sans">{sub.studentName}</div>
                            <div className="font-mono text-[10px] text-cyan-400 mt-0.5">ID: {sub.studentId}</div>
                          </td>

                          {/* Dedicated Territory & Location Coordinates */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5">
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                {sub.stateName || 'State'}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-300 font-sans mt-0.5 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-500" />
                              <span>{sub.districtName || 'District'}{sub.localityName ? ` • ${sub.localityName}` : ''}</span>
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="font-bold text-slate-200 font-sans">{sub.productName}</div>
                            {sub.examName && (
                              <span className="text-[10px] text-blue-400 font-semibold block mt-0.5 font-mono">
                                Exam: {sub.examName}
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3.5">
                            {getScopeBadge(sub.pricingScope)}
                            {sub.source === 'LIBRARY_BOOKING' && (
                              <div className="text-[10px] text-purple-400 font-medium mt-0.5">
                                via {sub.libraryName || 'Partner Library'}
                              </div>
                            )}
                            {sub.source === 'TEACHER_ALLOTMENT' && (
                              <div className="text-[10px] text-blue-400 font-medium mt-0.5">
                                ref: {sub.teacherName || 'Faculty'}
                              </div>
                            )}
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="text-slate-300 font-mono text-[11px]">
                              {sub.startDate} <span className="text-slate-500">to</span> {sub.endDate}
                            </div>
                            <span className="text-[10px] text-slate-500 block mt-0.5">
                              {isExpired ? 'Expired' : 'Active Term'}
                            </span>
                          </td>

                          <td className="px-4 py-3.5 text-right font-mono">
                            <div className="font-black text-amber-400 text-sm">
                              ₹{sub.finalPaidAmount}
                            </div>
                            {sub.discount > 0 && (
                              <div className="text-[10px] text-slate-500 line-through">
                                ₹{sub.originalPrice}
                              </div>
                            )}
                          </td>

                          <td className="px-4 py-3.5 font-mono text-[11px] text-slate-400">
                            <button
                              onClick={() => copyToClipboard(sub.invoiceNumber, 'Invoice number')}
                              className="hover:text-cyan-400 transition-colors flex items-center gap-1 cursor-pointer"
                              title="Click to copy invoice number"
                            >
                              <span>{sub.invoiceNumber}</span>
                              <Copy className="w-3 h-3 text-slate-600 hover:text-cyan-400" />
                            </button>
                          </td>

                          <td className="px-4 py-3.5 text-center">
                            {isExpired ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">
                                <AlertTriangle className="w-3 h-3 text-rose-500" /> Expired
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Active
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => {
                                  playSfx('click');
                                  setInspectDossier(sub);
                                }}
                                className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-cyan-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Inspect Entitlement Dossier"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {isExpired ? (
                                <button
                                  onClick={() => handleExtendPass(sub.id, 30)}
                                  className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 text-[10px] font-bold transition-colors cursor-pointer"
                                  title="Reactivate for +30 Days"
                                >
                                  +30D
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleRevokePass(sub.id)}
                                  className="p-1.5 rounded-lg bg-slate-900 border border-rose-500/40 text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                                  title="Revoke License Immediately"
                                >
                                  <Lock className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-xs font-mono text-slate-400">
              <div>
                Showing <span className="text-white font-bold">{filteredSubscriptions.length === 0 ? 0 : Math.min(filteredSubscriptions.length, (currentPage - 1) * itemsPerPage + 1)}</span> to{' '}
                <span className="text-white font-bold">{Math.min(filteredSubscriptions.length, currentPage * itemsPerPage)}</span> of{' '}
                <span className="text-cyan-400 font-bold">{filteredSubscriptions.length}</span> recorded passes
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => {
                    playSfx('click');
                    setCurrentPage(1);
                  }}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  title="First Page"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={currentPage === 1}
                  onClick={() => {
                    playSfx('click');
                    setCurrentPage(prev => Math.max(1, prev - 1));
                  }}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-white font-bold">
                  Page {currentPage} / {totalPages}
                </span>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    playSfx('click');
                    setCurrentPage(prev => Math.min(totalPages, prev + 1));
                  }}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    playSfx('click');
                    setCurrentPage(totalPages);
                  }}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  title="Last Page"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 4: INSTITUTIONAL & CONCESSION QUOTA ALLOCATIONS                */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'INSTITUTIONAL_QUOTAS' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Partner Libraries Allocation */}
              <div className="p-6 rounded-3xl bg-slate-950 border-2 border-slate-800 shadow-2xl hud-corner-brackets space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 font-mono">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Building className="w-4 h-4 text-purple-400" />
                    Library Concession Desks
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    842 SEATS
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Partner reading rooms offering subsidized 100% discount vouchers on Study Material & Mock Tests when students book reserved physical study desks.
                </p>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400">Saidpur Central Study Space:</span>
                    <span className="text-emerald-400 font-bold">120 Quotas (92% Used)</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400">Lanka Knowledge Space (BHU):</span>
                    <span className="text-emerald-400 font-bold">180 Quotas (96% Used)</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400">Sigra Digital Reading Hall:</span>
                    <span className="text-emerald-400 font-bold">150 Quotas (88% Used)</span>
                  </div>
                </div>
              </div>

              {/* Teacher Referral Highway */}
              <div className="p-6 rounded-3xl bg-slate-950 border-2 border-slate-800 shadow-2xl hud-corner-brackets space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 font-mono">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-blue-400" />
                    Teacher Referral Network
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    24 FACULTY
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Certified subject educators allotting coupon-coded student passes for personalized classroom batches with 15% commission revenue sharing.
                </p>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400">Er. R.K. Verma (IIT Kanpur):</span>
                    <span className="text-blue-400 font-bold">48 Students Referred</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400">Dr. Sunita Tiwari (BHU Zoology):</span>
                    <span className="text-blue-400 font-bold">62 Students Referred</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400">Shri Alok Mishra (GS Expert):</span>
                    <span className="text-blue-400 font-bold">94 Students Referred</span>
                  </div>
                </div>
              </div>

              {/* District & State Welfare Quotas */}
              <div className="p-6 rounded-3xl bg-slate-950 border-2 border-slate-800 shadow-2xl hud-corner-brackets space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 font-mono">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-amber-400" />
                    District Priority Quotas
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    4 DISTRICTS
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Special welfare reservations for aspirational rural districts providing 60% fee subsidies on government test series and books.
                </p>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400">Ghazipur Rural Aspirational:</span>
                    <span className="text-amber-400 font-bold">350 Subsidized Passes</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400">Varanasi Semi-Urban Hub:</span>
                    <span className="text-amber-400 font-bold">500 Subsidized Passes</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400">Patna Eastern Corridor:</span>
                    <span className="text-amber-400 font-bold">250 Subsidized Passes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 5: LIVE TRANSACTION & SHA-256 AUDIT STREAM                     */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'TRANSACTION_AUDIT' && (
          <div className="p-6 rounded-3xl bg-slate-950 border-2 border-slate-800 shadow-2xl hud-corner-brackets space-y-4 font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-rose-400 animate-pulse" />
                <span className="text-white font-bold uppercase tracking-wider text-sm">
                  Real-Time Commercial Inflow & SHA-256 Cryptographic Audit Ledger
                </span>
              </div>
              <span className="text-cyan-400 text-[11px] bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                LIVE IST EVENT STREAM
              </span>
            </div>

            <div className="space-y-3">
              {[
                { time: '16:20:12 IST', event: 'PASS_PURCHASED', student: 'Aryan Sharma', product: 'Pan-India 30-Day Mock Test Pass', territory: 'UP • Varanasi', amount: '₹299', hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' },
                { time: '16:17:04 IST', event: 'CONCESSION_GRANTED', student: 'Priya Srivastava', product: 'Study Material Vault: General Studies', territory: 'UP • Ghazipur', amount: '₹0 (via Saidpur Central)', hash: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb' },
                { time: '16:12:38 IST', event: 'ANNUAL_COMBO_RENEWAL', student: 'Vikram Singh', product: 'BPSC 71st CCE Master Combo Pass', territory: 'BR • Patna', amount: '₹999', hash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a' },
                { time: '16:09:10 IST', event: 'AI_STUDIO_ENTITLED', student: 'Ananya Verma', product: 'AI Studio & Mistake Book Pass', territory: 'UP • Prayagraj', amount: '₹499', hash: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d' },
                { time: '16:01:55 IST', event: 'TEACHER_REFERRAL_DISCOUNT', student: 'Kavita Pandey', product: 'JEE Advanced Physics & Chem Vault', territory: 'UP • Kanpur', amount: '₹1,199', hash: '01ba4719c80b6fe911b091a7c05124b64eeece964e09c058ef8f9805daca546b' },
                { time: '15:52:19 IST', event: 'STATE_SCHOLAR_PASS', student: 'Manish Kumar', product: 'Navodaya JNVST Class 6 Pass', territory: 'BR • Gaya', amount: '₹199', hash: '185f8db32271fe25f561a6fc938b2e264306ec304eda518007d1764826381969' }
              ].map((tx, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs hover:border-slate-700 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-[10px]">{tx.time}</span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {tx.event}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-300">
                        {tx.territory}
                      </span>
                      <span className="text-white font-bold font-sans">{tx.student}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-sans">
                      Purchased: <span className="text-slate-200">{tx.product}</span> — Paid: <span className="text-amber-400 font-bold font-mono">{tx.amount}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] text-slate-500">SHA-256 LEDGER TOKEN:</div>
                    <div className="text-[10px] text-cyan-400 font-mono truncate max-w-xs cursor-pointer hover:underline" onClick={() => copyToClipboard(tx.hash, 'SHA-256 Ledger Hash')}>
                      {tx.hash.substring(0, 24)}...
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* 7. MODALS: ENTITLEMENT DOSSIER & PILLAR DEEP-DIVE                    */}
      {/* ==================================================================== */}
      {inspectDossier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-slate-950 border-2 border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl hud-corner-brackets space-y-6 max-h-[90vh] overflow-y-auto font-mono text-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-sans">
                    Student Entitlement Dossier
                  </h3>
                  <p className="text-[11px] text-slate-400 font-sans">
                    Comprehensive commercial license, location coordinate & hardware session audit
                  </p>
                </div>
              </div>

              <button
                onClick={() => setInspectDossier(null)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Dossier Body */}
            <div className="space-y-4">
              {/* Student Identity */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">1. Scholar Identity & Territorial Hub</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Student Name:</span>
                    <span className="text-white font-bold text-sm font-sans">{inspectDossier.studentName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Permanent Student ID:</span>
                    <span className="text-cyan-400 font-bold">{inspectDossier.studentId}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Territory Coordinates:</span>
                    <span className="text-emerald-400 font-bold font-sans">
                      {inspectDossier.stateName || 'UP'}{inspectDossier.districtName ? ` • ${inspectDossier.districtName}` : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Product Specifications */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">2. Subscribed Product & Exam Curricula</div>
                <div className="space-y-1.5">
                  <div className="text-slate-200 font-bold font-sans text-sm">{inspectDossier.productName}</div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      Type: {inspectDossier.productType}
                    </span>
                    {inspectDossier.examName && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        Exam: {inspectDossier.examName}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Pricing & Invoicing */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">3. Commercial Terms & GSTIN Settlement</div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Original Price:</span>
                    <span className="text-slate-300 font-bold">₹{inspectDossier.originalPrice}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Discount Applied:</span>
                    <span className="text-emerald-400 font-bold">-₹{inspectDossier.discount}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Paid Amount:</span>
                    <span className="text-amber-400 font-bold text-sm">₹{inspectDossier.finalPaidAmount}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Tax Invoice Number:</span>
                  <span className="text-white font-bold">{inspectDossier.invoiceNumber}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Pricing Scope Tier:</span>
                  {getScopeBadge(inspectDossier.pricingScope)}
                </div>
              </div>

              {/* Validity & Access Authority */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">4. Entitlement Validity & Features</div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Active Window:</span>
                    <span className="text-white font-bold">{inspectDossier.startDate} to {inspectDossier.endDate}</span>
                  </div>
                  <div>
                    {inspectDossier.endDate < today ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        EXPIRED
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        ACTIVE VALID
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-slate-400 text-[10px] block mb-1">Authorized Features:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {inspectDossier.features.map((feat, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-300 text-[10px]">
                        ✓ {feat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3 font-sans">
              <button
                onClick={() => {
                  handleExtendPass(inspectDossier.id, 30);
                  setInspectDossier(null);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                +30 Days Grace Extension
              </button>

              <button
                onClick={() => {
                  handleRevokePass(inspectDossier.id);
                  setInspectDossier(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Revoke Entitlement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pillar Detail Modal */}
      {selectedPillarDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-slate-950 border-2 border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl hud-corner-brackets space-y-5 font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <selectedPillarDetail.icon className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white font-sans">
                  Pillar {selectedPillarDetail.pillarNumber}: {selectedPillarDetail.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPillarDetail(null)}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 font-sans">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 font-mono">
                <span className="text-[10px] text-slate-500 uppercase block font-bold">CURRENT PLATFORM MEASURE:</span>
                <span className="text-2xl font-black text-cyan-300">{selectedPillarDetail.metric}</span>
                <span className="text-xs text-slate-400 ml-2">{selectedPillarDetail.unit}</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-xs">
                {selectedPillarDetail.description}
              </p>
              <div className="pt-2 border-t border-slate-800 font-mono text-[11px] text-slate-400">
                <span className="text-white font-bold block mb-1">Interconnected Dependencies:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPillarDetail.dependencies.map((dep: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-400 text-[10px]">
                      {dep}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end font-sans">
              <button
                onClick={() => setSelectedPillarDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Close Deep-Dive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 8. UNIVERSAL EXPORT MODAL                                            */}
      {/* ==================================================================== */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Academic Business OS Dossier"
        data={filteredSubscriptions}
        filename={`Academic_Business_OS_Telemetry_${selectedLocation.level}_${selectedLocation.stateName || 'India'}_${new Date().toISOString().split('T')[0]}`}
      />
    </div>
  );
};
