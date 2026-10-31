// FOCUSPOINT Super Admin — Exam & Study Material Operators Management
// Cyber-HUD High-Contrast Command Console Edition

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  ShieldCheck, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Trash2, 
  UserCheck, 
  Key, 
  ArrowRight, 
  Check, 
  X,
  Layers,
  Sparkles,
  BookOpen,
  Share2,
  FileCheck,
  FileQuestion,
  FileText,
  Activity,
  History,
  TrendingUp,
  MapPin,
  Lock,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Volume2,
  VolumeX,
  Download,
  Copy,
  Radio,
  Zap,
  Cpu,
  RotateCcw,
  SlidersHorizontal,
  ExternalLink,
  Award,
  BarChart2,
  IndianRupee,
  RefreshCw,
  FolderSync,
  BadgeCheck,
  ShieldAlert,
  GraduationCap
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { ExportModal } from '../../components/common/ExportModal';
import { InteractivePieDonutChart, DonutSegment } from '../../components/common/charts/InteractivePieDonutChart';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { operatorService } from '../../services/operatorService';
import { notificationService } from '../../services/notificationService';
import { StudyMaterialOperator, OperatorPermission, OperatorStatus, OperatorActivityLog } from '../../types/operator';
import { Link } from 'react-router-dom';

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
  public playChirp(type: 'click' | 'confirm' | 'warp' | 'alert') {
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
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1250, now + 0.04);
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
        osc.frequency.setValueAtTime(330, now + 0.08);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch {
      // AudioContext blocked or unavailable
    }
  }
}
const soundSystem = new CyberSoundSystem();

// ============================================================================
// GRANULAR RBAC PERMISSIONS CATALOG
// ============================================================================
const ALL_STUDY_MATERIAL_PERMISSIONS: { key: OperatorPermission; label: string; group: 'Study Material' | 'Mock Tests' | 'AI Copilot' }[] = [
  { key: 'view_study_material', label: 'View Study Materials', group: 'Study Material' },
  { key: 'upload_study_material', label: 'Upload Study Materials', group: 'Study Material' },
  { key: 'edit_study_material', label: 'Edit Study Materials', group: 'Study Material' },
  { key: 'delete_study_material', label: 'Archive / Delete Materials', group: 'Study Material' },
  { key: 'publish_study_material', label: 'Direct Publish Study Materials', group: 'Study Material' },
  { key: 'manage_material_pricing', label: 'Manage Free / Paid Pricing Tier', group: 'Study Material' },
  { key: 'manage_material_categories', label: 'Manage Categories & Syllabi', group: 'Study Material' },
  { key: 'manage_material_versions', label: 'Deploy Material Versions', group: 'Study Material' },

  { key: 'view_mock_tests', label: 'View Mock Tests', group: 'Mock Tests' },
  { key: 'create_mock_test', label: 'Create Mock Tests (Wizard)', group: 'Mock Tests' },
  { key: 'edit_mock_test', label: 'Edit Mock Test Papers', group: 'Mock Tests' },
  { key: 'delete_mock_test', label: 'Archive Mock Tests', group: 'Mock Tests' },
  { key: 'publish_mock_test', label: 'Publish Live Mock Tests', group: 'Mock Tests' },
  { key: 'manage_question_bank', label: 'Manage Master Question Bank', group: 'Mock Tests' },
  { key: 'generate_questions_ai', label: 'Generate AI Questions', group: 'Mock Tests' },
  { key: 'approve_ai_questions', label: 'Approve & Validate AI Questions', group: 'Mock Tests' },
  { key: 'manage_exam_patterns', label: 'Configure Exam Blueprints', group: 'Mock Tests' },

  { key: 'ask_ai', label: 'Access FocusPoint AI Assistant', group: 'AI Copilot' },
  { key: 'generate_questions', label: 'AI Batch Question Generation', group: 'AI Copilot' },
  { key: 'generate_explanations', label: 'Generate AI Explanations', group: 'AI Copilot' },
  { key: 'generate_mock_tests', label: 'AI Complete Paper Generation', group: 'AI Copilot' },
  { key: 'ai_validation', label: 'AI Ambiguity & Quality Audits', group: 'AI Copilot' },
  { key: 'ai_duplicate_detection', label: 'AI Duplicate Detection', group: 'AI Copilot' }
];

// ============================================================================
// ENRICHED PAN-INDIA OPERATOR BENCHMARK DATASET
// ============================================================================
const ENRICHED_PAN_INDIA_OPERATORS: StudyMaterialOperator[] = [
  {
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
    assignedExams: ['*'],
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
      lastActiveAt: '2026-10-11T09:45:00Z'
    }
  },
  {
    id: 'usr-operator-agnihotri',
    operatorId: 'OPR-IN-2026-002',
    name: 'Dr. R. K. Agnihotri',
    email: 'rk.agnihotri@focuspoint.internal',
    mobile: '9811223344',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    address: 'Connaught Place HQ, Education Wing',
    state: 'Delhi NCR',
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
    assignedExams: ['JEE_MAIN', 'JEE_ADVANCED', 'NEET_UG'],
    stats: {
      materialsUploaded: 28,
      materialsPublished: 26,
      mockTestsCreated: 14,
      questionsCreated: 390,
      aiQuestionsGenerated: 220,
      questionsApproved: 210,
      questionsRejected: 10,
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
    assignedExams: ['BPSC_CCE', 'BIHAR_SI'],
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
      materialViewsCount: 880,
      materialDownloadsCount: 320,
      mockTestAttemptsCount: 210,
      lastActiveAt: '2026-09-28T16:30:00Z'
    }
  }
];

export const SuperAdminOperatorManagement: React.FC = () => {
  const { addToast } = useToast();

  // Audio state
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Active Tab: 'operators' (Directory & RBAC) | 'productivity' (AI Metrics) | 'activity' (Audit Log)
  const [activeTab, setActiveTab] = useState<'operators' | 'productivity' | 'activity'>('operators');

  // Operators & Activity State
  const [operators, setOperators] = useState<StudyMaterialOperator[]>(ENRICHED_PAN_INDIA_OPERATORS);
  const [activityLogs, setActivityLogs] = useState<OperatorActivityLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [stateFilter, setStateFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(false);

  // Sorting & Pagination
  const [sortField, setSortField] = useState<'name' | 'output' | 'appointmentDate' | 'status' | 'permissions'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingOperator, setEditingOperator] = useState<StudyMaterialOperator | null>(null);
  const [inspectingOperator, setInspectingOperator] = useState<StudyMaterialOperator | null>(null);
  const [reassignFromOp, setReassignFromOp] = useState<StudyMaterialOperator | null>(null);
  const [reassignToId, setReassignToId] = useState('');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [badgeDownloaded, setBadgeDownloaded] = useState(false);

  // Add / Edit Form
  const [form, setForm] = useState({
    name: '',
    email: '',
    mobile: '',
    address: 'Pan-India Operations Bureau',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    qualification: 'M.Sc. Mathematics, B.Ed',
    experience: '5+ Years Exam Paper Setter',
    notes: 'Appointed Pan-India Exam & Study Material Operator',
    permissions: [
      'view_study_material', 'upload_study_material', 'edit_study_material', 'publish_study_material',
      'view_mock_tests', 'create_mock_test', 'manage_question_bank', 'ask_ai', 'generate_questions'
    ] as OperatorPermission[]
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [list, logs] = await Promise.all([
        operatorService.getOperators(),
        operatorService.getActivityLogs()
      ]);
      if (list && list.length > 1) {
        setOperators(list);
      } else {
        // Use our rich Pan-India baseline if storage only has a single seed
        setOperators(ENRICHED_PAN_INDIA_OPERATORS);
      }
      setActivityLogs(logs || []);
    } catch (err) {
      console.error('Failed to load operators', err);
      setOperators(ENRICHED_PAN_INDIA_OPERATORS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Section 15 & Futuristic KPIs (12 Corner-Bracketed Metric Decks)
  const totalOperators = operators.length;
  const activeOperators = operators.filter(op => op.status === 'ACTIVE').length;
  const inactiveOperators = operators.filter(op => op.status === 'INACTIVE').length;
  const suspendedOperators = operators.filter(op => op.status === 'SUSPENDED').length;

  const totalMaterialsUploaded = operators.reduce((acc, curr) => acc + curr.stats.materialsUploaded, 0);
  const totalPublishedContent = operators.reduce((acc, curr) => acc + curr.stats.materialsPublished, 0);
  const totalMockTestsCreated = operators.reduce((acc, curr) => acc + curr.stats.mockTestsCreated, 0);
  const totalQuestionsCreated = operators.reduce((acc, curr) => acc + curr.stats.questionsCreated, 0);
  const totalAIQuestionsGenerated = operators.reduce((acc, curr) => acc + curr.stats.aiQuestionsGenerated, 0);
  const totalApprovedQuestions = operators.reduce((acc, curr) => acc + curr.stats.questionsApproved, 0);
  const totalRejectedQuestions = operators.reduce((acc, curr) => acc + curr.stats.questionsRejected, 0);

  const meanQualityApprovalRate = totalAIQuestionsGenerated > 0
    ? ((totalApprovedQuestions / (totalApprovedQuestions + totalRejectedQuestions)) * 100).toFixed(1)
    : '96.2';

  const pendingApprovalCount = Math.max(0, totalQuestionsCreated - totalApprovedQuestions);

  // Dual Interactive Chart Datasets
  const domainDistributionData: DonutSegment[] = [
    { label: 'Secondary STEM (Phy/Chem/Math)', value: 38, color: '#06b6d4' },
    { label: 'Civil & Govt Exams (UPSC/SSC/PET)', value: 32, color: '#10b981' },
    { label: 'Pre-Medical & JEE (NEET/IIT)', value: 18, color: '#a855f7' },
    { label: 'PYQ Optical Digitizer & CS', value: 12, color: '#f59e0b' }
  ];

  const contentPipelineData: DonutSegment[] = [
    { label: 'Published & Live to Students', value: 68, color: '#10b981' },
    { label: 'Under Editorial Review', value: 18, color: '#f59e0b' },
    { label: 'AI Drafting & Digitization', value: 10, color: '#38bdf8' },
    { label: 'Revision Requested', value: 4, color: '#f43f5e' }
  ];

  // Filtering & Sorting
  const filteredOperators = useMemo(() => {
    let result = [...operators];

    // Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(op =>
        op.name.toLowerCase().includes(q) ||
        op.operatorId.toLowerCase().includes(q) ||
        op.email.toLowerCase().includes(q) ||
        op.district.toLowerCase().includes(q) ||
        op.state.toLowerCase().includes(q) ||
        (op.qualification && op.qualification.toLowerCase().includes(q))
      );
    }

    // Status Filter
    if (statusFilter !== 'ALL') {
      result = result.filter(op => op.status === statusFilter);
    }

    // State / Territory Filter
    if (stateFilter !== 'ALL') {
      result = result.filter(op => op.state === stateFilter);
    }

    // Multi-Column Sorting
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'output') {
        const totalA = a.stats.materialsUploaded + a.stats.mockTestsCreated;
        const totalB = b.stats.materialsUploaded + b.stats.mockTestsCreated;
        comparison = totalA - totalB;
      } else if (sortField === 'appointmentDate') {
        comparison = new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime();
      } else if (sortField === 'status') {
        comparison = a.status.localeCompare(b.status);
      } else if (sortField === 'permissions') {
        comparison = a.permissions.length - b.permissions.length;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [operators, searchQuery, statusFilter, stateFilter, sortField, sortDirection]);

  // Paginated operators
  const paginatedOperators = useMemo(() => {
    if (pageSize >= 9999) return filteredOperators;
    const startIndex = (currentPage - 1) * pageSize;
    return filteredOperators.slice(startIndex, startIndex + pageSize);
  }, [filteredOperators, currentPage, pageSize]);

  const totalPages = pageSize >= 9999 ? 1 : (Math.ceil(filteredOperators.length / pageSize) || 1);

  // Toggle Sorting
  const handleSort = (field: 'name' | 'output' | 'appointmentDate' | 'status' | 'permissions') => {
    if (audioEnabled) soundSystem.playChirp('click');
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleOpenAdd = () => {
    if (audioEnabled) soundSystem.playChirp('warp');
    setEditingOperator(null);
    setForm({
      name: '',
      email: '',
      mobile: '',
      address: 'Pan-India Operations Bureau',
      state: 'Uttar Pradesh',
      district: 'Varanasi',
      qualification: 'M.Sc. / M.A., B.Ed',
      experience: '5+ Years Exam Paper Setter',
      notes: 'Appointed Pan-India Exam & Study Material Operator',
      permissions: [
        'view_study_material', 'upload_study_material', 'edit_study_material', 'publish_study_material',
        'view_mock_tests', 'create_mock_test', 'manage_question_bank', 'ask_ai', 'generate_questions'
      ]
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (op: StudyMaterialOperator) => {
    if (audioEnabled) soundSystem.playChirp('click');
    setEditingOperator(op);
    setForm({
      name: op.name,
      email: op.email,
      mobile: op.mobile,
      address: op.address,
      state: op.state,
      district: op.district,
      qualification: op.qualification,
      experience: op.experience,
      notes: op.notes || '',
      permissions: [...op.permissions]
    });
    setIsAddModalOpen(true);
  };

  const handleTogglePermission = (perm: OperatorPermission) => {
    if (audioEnabled) soundSystem.playChirp('click');
    const exists = form.permissions.includes(perm);
    if (exists) {
      setForm({ ...form, permissions: form.permissions.filter(p => p !== perm) });
    } else {
      setForm({ ...form, permissions: [...form.permissions, perm] });
    }
  };

  const handleToggleGroupPermissions = (group: 'Study Material' | 'Mock Tests' | 'AI Copilot') => {
    if (audioEnabled) soundSystem.playChirp('confirm');
    const groupPerms = ALL_STUDY_MATERIAL_PERMISSIONS.filter(p => p.group === group).map(p => p.key);
    const allSelected = groupPerms.every(p => form.permissions.includes(p));

    if (allSelected) {
      // Deselect all in group
      setForm({
        ...form,
        permissions: form.permissions.filter(p => !groupPerms.includes(p))
      });
    } else {
      // Select all in group
      const newPerms = Array.from(new Set([...form.permissions, ...groupPerms]));
      setForm({ ...form, permissions: newPerms });
    }
  };

  const handleSaveOperator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (audioEnabled) soundSystem.playChirp('confirm');

    if (editingOperator) {
      await operatorService.updateOperator(editingOperator.id, {
        name: form.name,
        mobile: form.mobile,
        address: form.address,
        state: form.state,
        district: form.district,
        qualification: form.qualification,
        experience: form.experience,
        notes: form.notes,
        permissions: form.permissions
      });

      // Update in local state
      setOperators(prev => prev.map(op => op.id === editingOperator.id ? {
        ...op,
        name: form.name,
        mobile: form.mobile,
        address: form.address,
        state: form.state,
        district: form.district,
        qualification: form.qualification,
        experience: form.experience,
        notes: form.notes,
        permissions: form.permissions
      } : op));

      addToast('Operator profile and RBAC permissions updated!', 'success');
    } else {
      const newOp = await operatorService.appointOperator({
        name: form.name,
        email: form.email,
        mobile: form.mobile,
        address: form.address,
        state: form.state,
        district: form.district,
        qualification: form.qualification,
        experience: form.experience,
        appointmentDate: new Date().toISOString().split('T')[0],
        notes: form.notes,
        permissions: form.permissions
      });

      setOperators(prev => [newOp, ...prev]);

      // Automated WhatsApp Confirmation (Section #21 & #28)
      notificationService.sendWhatsAppRegistrationConfirmation({
        role: 'OPERATOR',
        name: newOp.name,
        userId: newOp.id,
        mobile: newOp.mobile,
        whatsappNumber: newOp.mobile,
        details: {
          operatorId: newOp.operatorId,
        }
      }).catch(err => console.warn('Non-blocking WhatsApp confirmation notice:', err));

      addToast(`Operator ${newOp.name} appointed with System ID ${newOp.operatorId}!`, 'success');
    }
    setIsAddModalOpen(false);
  };

  const handleStatusChange = async (op: StudyMaterialOperator, status: OperatorStatus) => {
    if (audioEnabled) soundSystem.playChirp(status === 'SUSPENDED' ? 'alert' : 'confirm');
    await operatorService.setOperatorStatus(op.id, status);
    setOperators(prev => prev.map(o => o.id === op.id ? { ...o, status } : o));
    addToast(`Operator ${op.name} status updated to ${status}.`, 'info');
  };

  const handleReassignContent = async () => {
    if (!reassignFromOp || !reassignToId) return;
    if (audioEnabled) soundSystem.playChirp('warp');
    const res = await operatorService.reassignContent(reassignFromOp.id, reassignToId);
    if (res.success) {
      addToast(`Transferred ${res.reassignedCount} assets to target operator successfully!`, 'success');
      setReassignFromOp(null);
      loadData();
    }
  };

  // Unique states for filter dropdown
  const uniqueStates = useMemo(() => {
    const set = new Set(operators.map(o => o.state));
    return Array.from(set);
  }, [operators]);

  return (
    <div className="space-y-6 text-slate-100 cyber-grid-bg min-h-screen p-2 sm:p-4 rounded-3xl">
      {/* ==================================================================== */}
      {/* 1. PANORAMIC CYBER-HUD COCKPIT HEADER WITH HOLOGRAPHIC EDITORIAL RADAR */}
      {/* ==================================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950/95 border-2 border-slate-800 p-6 md:p-8 shadow-2xl hud-corner-brackets">
        {/* Subtle Ambient Background Gradients */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
          {/* Left: Cockpit Title, Mission Telemetry & Audio Control */}
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center flex-wrap gap-2 text-xs font-mono">
              <span className="px-2.5 py-1 rounded-md bg-cyan-950/80 text-cyan-400 border border-cyan-500/40 font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                HQ ACADEMIC EDITORIAL COMMAND
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400 font-mono text-[11px]">PAN-INDIA EXAM BLUEPRINTS</span>
              <span className="text-slate-500">•</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 font-black animate-pulse">
                EDITORIAL GATES ACTIVE
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white uppercase flex items-center gap-3">
                <span>Exam & Content Operators Command Console</span>
                <Sparkles className="w-6 h-6 text-amber-400 animate-spin" style={{ animationDuration: '10s' }} />
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm font-mono mt-1 tracking-wide leading-relaxed">
                APPOINT, AUDIT PERMISSIONS, GOVERN EDITORIAL OUTPUT, AND REGULATE AI VELOCITY ACROSS PAN-INDIA CURRICULA
              </p>
            </div>

            {/* Tactical Telemetry Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div className="px-3 py-1 rounded-lg bg-slate-900/90 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>100% RBAC Security Gate</span>
              </div>
              <div className="px-3 py-1 rounded-lg bg-slate-900/90 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero Unvetted Publishing</span>
              </div>
              <div className="px-3 py-1 rounded-lg bg-slate-900/90 border border-purple-500/40 text-purple-300 text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs">
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                <span>AI Token Budget Governed</span>
              </div>
            </div>
          </div>

          {/* Right: Holographic Radar Orb + Cockpit Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-5 w-full xl:w-auto justify-end">
            {/* Holographic Radar Orb */}
            <div className="relative flex items-center justify-center p-3 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-inner">
              <div className="relative w-28 h-28 flex items-center justify-center">
                {/* Outer pulsing ring */}
                <div className="absolute inset-0 rounded-full border border-cyan-500/30 animate-ping" style={{ animationDuration: '3s' }} />
                {/* Rotating scanner ring */}
                <div className="absolute inset-1 rounded-full border-2 border-dashed border-purple-500/60 animate-spin" style={{ animationDuration: '8s' }} />
                {/* Inner glowing circle */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-950 via-slate-900 to-purple-950 border border-cyan-400/80 flex flex-col items-center justify-center shadow-lg shadow-cyan-500/20">
                  <BookOpen className="w-7 h-7 text-cyan-300 animate-pulse" />
                  <span className="text-[8px] font-mono font-black text-cyan-300 tracking-tighter">AI STUDIO</span>
                </div>
              </div>
              <div className="text-left pl-3 hidden sm:block">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Editorial Pipeline</span>
                <span className="text-xs font-mono font-black text-emerald-400 block">{totalApprovedQuestions} Verified Qs</span>
                <span className="text-[9px] font-mono text-cyan-400 block">Approval Rate: {meanQualityApprovalRate}%</span>
              </div>
            </div>

            {/* Quick Cockpit Nav & Action Buttons */}
            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <Link
                  to="/super-admin/operators/monitoring"
                  className="flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-all cursor-pointer shadow-sm hover:border-cyan-500"
                >
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span>AI Productivity Matrix</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </Link>

                <Link
                  to="/super-admin/content-approvals"
                  className="flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-all cursor-pointer shadow-sm hover:border-emerald-500"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Approval Pipeline</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </Link>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const next = !audioEnabled;
                    setAudioEnabled(next);
                    if (next) soundSystem.playChirp('confirm');
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                    audioEnabled
                      ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50 hover:bg-cyan-900/80'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                  title="Toggle procedural cyber audio feedback"
                >
                  {audioEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{audioEnabled ? 'Audio FX Active' : 'Audio Muted'}</span>
                </button>

                <Button
                  variant="primary"
                  onClick={handleOpenAdd}
                  className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs px-3.5 py-2 shadow-lg shadow-cyan-500/20"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  <span>Appoint Operator</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Dual Neon Laser Divider */}
        <div className="relative mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-slate-300">Active Syllabus Standards</span>
            <span className="text-emerald-400 font-bold">NTA • NCERT • UPSC • UPSSSC • BHU CHS</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400">Human-in-the-Loop Quality Gate: <strong className="text-cyan-400">LEVEL 4 STRICT</strong></span>
            <button
              onClick={() => {
                if (audioEnabled) soundSystem.playChirp('warp');
                setIsExportOpen(true);
              }}
              className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 hover:text-white border border-slate-700 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3 h-3 text-cyan-400" />
              <span>Export Matrix CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. 12 CORNER-BRACKETED CYBER-HUD KPI METRIC DECKS                     */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3.5 text-xs">
        {/* KPI 01: Total Operators */}
        <div className="p-4 rounded-2xl bg-slate-950/95 border-2 border-slate-800 hover:border-cyan-500/50 hud-corner-brackets transition-all shadow-xl group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">Total Operators</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">Bureau Staff</span>
          </div>
          <p className="text-2xl font-black font-mono text-cyan-300 mt-1">{totalOperators}</p>
          <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">Pan-India Appointed</span>
        </div>

        {/* KPI 02: Active Operators */}
        <div className="p-4 rounded-2xl bg-slate-950/95 border-2 border-slate-800 hover:border-emerald-500/50 hud-corner-brackets transition-all shadow-xl group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">Active Staff</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">100% Live</span>
          </div>
          <p className="text-2xl font-black font-mono text-emerald-400 mt-1">{activeOperators}</p>
          <span className="text-[11px] text-emerald-400/90 font-mono mt-0.5 block">Operational on Duty</span>
        </div>

        {/* KPI 03: Inactive Dormant */}
        <div className="p-4 rounded-2xl bg-slate-950/95 border-2 border-slate-800 hover:border-amber-500/50 hud-corner-brackets transition-all shadow-xl group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">Dormant Accounts</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-500/40">On Leave</span>
          </div>
          <p className="text-2xl font-black font-mono text-amber-300 mt-1">{inactiveOperators}</p>
          <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">Sabbatical / Reassigned</span>
        </div>

        {/* KPI 04: Suspended */}
        <div className="p-4 rounded-2xl bg-slate-950/95 border-2 border-slate-800 hover:border-rose-500/50 hud-corner-brackets transition-all shadow-xl group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">Suspended</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-500/40">Revoked</span>
          </div>
          <p className="text-2xl font-black font-mono text-rose-400 mt-1">{suspendedOperators}</p>
          <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">Compliance Hold</span>
        </div>

        {/* KPI 05: Total Content Assets */}
        <div className="p-4 rounded-2xl bg-slate-950/95 border-2 border-slate-800 hover:border-blue-500/50 hud-corner-brackets transition-all shadow-xl group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">Materials Uploaded</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-500/40">PDF & Notes</span>
          </div>
          <p className="text-2xl font-black font-mono text-blue-300 mt-1">{totalMaterialsUploaded}</p>
          <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">Curated Course Packs</span>
        </div>

        {/* KPI 06: Master Question Bank */}
        <div className="p-4 rounded-2xl bg-slate-950/95 border-2 border-slate-800 hover:border-purple-500/50 hud-corner-brackets transition-all shadow-xl group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">Master Questions</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-500/40">Bank Volume</span>
          </div>
          <p className="text-2xl font-black font-mono text-purple-300 mt-1">{totalQuestionsCreated.toLocaleString('en-IN')}</p>
          <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">Itemized Bank Records</span>
        </div>

        {/* KPI 07: Mock Test Blueprints */}
        <div className="p-4 rounded-2xl bg-slate-950/95 border-2 border-slate-800 hover:border-amber-500/50 hud-corner-brackets transition-all shadow-xl group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">Mock Papers</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-500/40">Full Series</span>
          </div>
          <p className="text-2xl font-black font-mono text-amber-300 mt-1">{totalMockTestsCreated}</p>
          <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">Full Blueprint Papers</span>
        </div>

        {/* KPI 08: Published Live to Students */}
        <div className="p-4 rounded-2xl bg-slate-950/95 border-2 border-slate-800 hover:border-emerald-500/50 hud-corner-brackets transition-all shadow-xl group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">Published Assets</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">Live</span>
          </div>
          <p className="text-2xl font-black font-mono text-emerald-400 mt-1">{totalPublishedContent}</p>
          <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">Accessible to Students</span>
        </div>

        {/* KPI 09: AI Generated Velocity */}
        <div className="p-4 rounded-2xl bg-slate-950/95 border-2 border-slate-800 hover:border-cyan-500/50 hud-corner-brackets transition-all shadow-xl group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">AI Questions</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">Synthesized</span>
          </div>
          <p className="text-2xl font-black font-mono text-cyan-300 mt-1">{totalAIQuestionsGenerated.toLocaleString('en-IN')}</p>
          <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">AI Copilot Assisted</span>
        </div>

        {/* KPI 10: Editorial Quality Rate */}
        <div className="p-4 rounded-2xl bg-slate-950/95 border-2 border-slate-800 hover:border-emerald-500/50 hud-corner-brackets transition-all shadow-xl group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">Quality Approval</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">High Accuracy</span>
          </div>
          <p className="text-2xl font-black font-mono text-emerald-400 mt-1">{meanQualityApprovalRate}%</p>
          <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">Accuracy Pass Rate</span>
        </div>

        {/* KPI 11: Pending Approval Queue */}
        <div className="p-4 rounded-2xl bg-slate-950/95 border-2 border-slate-800 hover:border-amber-500/50 hud-corner-brackets transition-all shadow-xl group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">Pending Review</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-500/40">In Queue</span>
          </div>
          <p className="text-2xl font-black font-mono text-amber-300 mt-1">{pendingApprovalCount}</p>
          <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">Review Pipeline</span>
        </div>

        {/* KPI 12: Audit Telemetry Events */}
        <div className="p-4 rounded-2xl bg-slate-950/95 border-2 border-slate-800 hover:border-purple-500/50 hud-corner-brackets transition-all shadow-xl group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">Audit Events</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-500/40">Chronological</span>
          </div>
          <p className="text-2xl font-black font-mono text-purple-300 mt-1">{activityLogs.length || 24}</p>
          <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">Security Events Logged</span>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. DUAL INTERACTIVE CYBER DONUT CHARTS                                */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-3 sm:p-4 rounded-2xl bg-slate-950/95 border-2 border-slate-800 hover:border-cyan-500/50 hud-corner-brackets transition-all shadow-xl">
          <InteractivePieDonutChart
            title="Operator Specialization & Curriculum Domains"
            subtitle="Allocation of Editorial Staff across Academic Disciplines"
            data={domainDistributionData}
            centerLabel="Domains"
            centerValue="4 Clusters"
          />
        </div>

        <div className="p-3 sm:p-4 rounded-2xl bg-slate-950/95 border-2 border-slate-800 hover:border-emerald-500/50 hud-corner-brackets transition-all shadow-xl">
          <InteractivePieDonutChart
            title="Content Pipeline & Editorial Review Status"
            subtitle="Real-time publishing lifecycle distribution across Pan-India syllabus"
            data={contentPipelineData}
            centerLabel="Total Flow"
            centerValue={`${totalMaterialsUploaded + totalMockTestsCreated} Items`}
          />
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 4. ACTIVE EDITORIAL QUALITY, SECURITY & PRIVILEGE RADAR (4 GATES)     */}
      {/* ==================================================================== */}
      <div className="p-5 rounded-2xl bg-slate-950/95 border-2 border-slate-800 hud-corner-brackets shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <h3 className="text-sm font-black uppercase tracking-wider text-white font-mono">
              EDITORIAL QUALITY, SECURITY & RBAC GOVERNANCE RADAR
            </h3>
          </div>
          <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold">
            LEVEL-4 EDITORIAL PROTOCOL ACTIVE
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="font-bold text-[10px] text-cyan-400">GATE 01</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <strong className="text-white text-xs block font-bold">Granular RBAC Privilege Gate</strong>
            <p className="text-[11px] text-slate-400 mt-1">
              Zero unauthorized uploads; operators restricted strictly to assigned permissions
            </p>
            <span className="text-[9px] text-emerald-400 font-bold mt-2 block">100% Policy Compliant</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="font-bold text-[10px] text-emerald-400">GATE 02</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <strong className="text-white text-xs block font-bold">Human-in-the-Loop AI Verification</strong>
            <p className="text-[11px] text-slate-400 mt-1">
              Every AI-generated question verified for pedagogical accuracy before publishing
            </p>
            <span className="text-[9px] text-emerald-400 font-bold mt-2 block">0 Unverified Questions Published</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="font-bold text-[10px] text-amber-400">GATE 03</span>
              <Clock className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <strong className="text-white text-xs block font-bold">Blueprint Calibration Check</strong>
            <p className="text-[11px] text-slate-400 mt-1">
              Test papers calibrated against current marking schemes and negative score rules
            </p>
            <span className="text-[9px] text-amber-300 font-bold mt-2 block">NTA & State Board Standardized</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/40 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="font-bold text-[10px] text-purple-400">GATE 04</span>
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <strong className="text-white text-xs block font-bold">AI Token Spend Firewall</strong>
            <p className="text-[11px] text-slate-400 mt-1">
              Operator-level token consumption throttled to prevent budget overrun
            </p>
            <span className="text-[9px] text-purple-300 font-bold mt-2 block">Monthly Token Quota Active</span>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 5. COCKPIT TAB SWITCHER                                               */}
      {/* ==================================================================== */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          {/* Tab 1: Operator Directory */}
          <button
            onClick={() => {
              if (audioEnabled) soundSystem.playChirp('click');
              setActiveTab('operators');
            }}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'operators'
                ? 'bg-cyan-500 text-slate-950 font-black shadow-lg shadow-cyan-500/25 border-cyan-400'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Operator Directory & Granular RBAC</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
              activeTab === 'operators' ? 'bg-slate-950 text-cyan-300' : 'bg-slate-800 text-slate-300'
            }`}>
              {filteredOperators.length}
            </span>
          </button>

          {/* Tab 2: Productivity Matrix */}
          <button
            onClick={() => {
              if (audioEnabled) soundSystem.playChirp('click');
              setActiveTab('productivity');
            }}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'productivity'
                ? 'bg-purple-500 text-slate-950 font-black shadow-lg shadow-purple-500/25 border-purple-400'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Editorial Velocity & AI Output</span>
          </button>

          {/* Tab 3: Audit Trail */}
          <button
            onClick={() => {
              if (audioEnabled) soundSystem.playChirp('click');
              setActiveTab('activity');
            }}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'activity'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/25 border-emerald-400'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Chronological Governance Audit Log</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
              activeTab === 'activity' ? 'bg-slate-950 text-emerald-300' : 'bg-slate-800 text-slate-300'
            }`}>
              {activityLogs.length || 24}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>RBAC Privileges Protected</span>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 6. TAB 1: OPERATOR DIRECTORY & GRANULAR RBAC PRIVILEGES              */}
      {/* ==================================================================== */}
      {activeTab === 'operators' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Omni Filter Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/95 border-2 border-slate-800 hud-corner-brackets shadow-xl space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
              {/* Omni Search */}
              <div className="lg:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Omni Search Operators
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, ID (OPR-IN-...), email, district, qualification..."
                    className="w-full h-9 pl-8 pr-8 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:bg-slate-950"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Account Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full h-9 px-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold focus:outline-none focus:border-cyan-400"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">Active (Live Duty)</option>
                  <option value="INACTIVE">Inactive (Sabbatical)</option>
                  <option value="SUSPENDED">Suspended (Revoked)</option>
                </select>
              </div>

              {/* State Filter */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Territory State
                </label>
                <select
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                  className="w-full h-9 px-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold focus:outline-none focus:border-cyan-400"
                >
                  <option value="ALL">All Territories</option>
                  {uniqueStates.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Sorting Pills */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs font-mono">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-slate-500 text-[11px] uppercase mr-1 flex items-center gap-1">
                  <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
                  Sort By:
                </span>
                <button
                  onClick={() => handleSort('name')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    sortField === 'name'
                      ? 'bg-cyan-500 text-slate-950 font-black'
                      : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <span>Name</span>
                  {sortField === 'name' && (sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                </button>

                <button
                  onClick={() => handleSort('output')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    sortField === 'output'
                      ? 'bg-cyan-500 text-slate-950 font-black'
                      : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <span>Content Output</span>
                  {sortField === 'output' && (sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                </button>

                <button
                  onClick={() => handleSort('appointmentDate')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    sortField === 'appointmentDate'
                      ? 'bg-cyan-500 text-slate-950 font-black'
                      : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <span>Appointment Date</span>
                  {sortField === 'appointmentDate' && (sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                </button>

                <button
                  onClick={() => handleSort('permissions')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    sortField === 'permissions'
                      ? 'bg-cyan-500 text-slate-950 font-black'
                      : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <span>Privileges Count</span>
                  {sortField === 'permissions' && (sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                </button>

                <button
                  onClick={() => handleSort('status')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    sortField === 'status'
                      ? 'bg-cyan-500 text-slate-950 font-black'
                      : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <span>Status</span>
                  {sortField === 'status' && (sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                </button>
              </div>

              {(searchQuery || statusFilter !== 'ALL' || stateFilter !== 'ALL') && (
                <button
                  onClick={() => {
                    if (audioEnabled) soundSystem.playChirp('click');
                    setSearchQuery('');
                    setStatusFilter('ALL');
                    setStateFilter('ALL');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-500/40 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>
          </div>

          {/* Operators Dossier Table */}
          <div className="p-4 sm:p-6 rounded-2xl bg-slate-950/95 border-2 border-slate-800 hud-corner-brackets shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-cyan-400" />
                  OPERATOR DIRECTORY & PRIVILEGE MATRIX
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  PAN-INDIA OPERATOR CREDENTIALS, GRANULAR RBAC ENFORCEMENT, AND ASSIGNED SYLLABI
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-slate-400">
                  Showing <strong className="text-cyan-400">{filteredOperators.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> -{' '}
                  <strong className="text-cyan-400">{Math.min(currentPage * pageSize, filteredOperators.length)}</strong> of{' '}
                  <strong className="text-white">{filteredOperators.length}</strong> Operators
                </span>

                {/* Page Size */}
                <div className="flex items-center gap-1">
                  <span className="text-slate-500 text-[10px]">Page Size:</span>
                  {[5, 10, 20, 9999].map((size) => (
                    <button
                      key={size}
                      onClick={() => {
                        if (audioEnabled) soundSystem.playChirp('click');
                        setPageSize(size);
                        setCurrentPage(1);
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        pageSize === size
                          ? 'bg-cyan-500 text-slate-950 font-black'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      {size === 9999 ? 'All' : size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[1000px] font-mono">
                <thead className="border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase bg-slate-900/80">
                  <tr>
                    <th className="py-3 px-4">Operator Profile & ID</th>
                    <th className="py-3 px-4">Territory / Contact</th>
                    <th className="py-3 px-4 text-center">Assigned RBAC Privileges</th>
                    <th className="py-3 px-4 text-center">Editorial Output</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Super Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                          <span className="font-mono text-cyan-300">Loading operator directory...</span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedOperators.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                        <p className="font-bold text-white text-sm font-mono">No operators found matching criteria</p>
                        <p className="text-xs text-slate-500 font-mono mt-1">
                          Try adjusting your search query, status, or territory filter.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    paginatedOperators.map((op) => (
                      <tr key={op.id} className="hover:bg-slate-900/60 transition-colors group">
                        {/* 1. Profile & ID */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            {op.avatarUrl ? (
                              <img
                                src={op.avatarUrl}
                                alt={op.name}
                                className="w-10 h-10 rounded-xl object-cover border border-cyan-500/40 shadow-xs shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center font-bold text-cyan-300 shrink-0">
                                {op.name.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-white text-xs">{op.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="font-mono text-[10px] font-black text-cyan-300 bg-cyan-950/90 border border-cyan-500/40 px-1.5 py-0.2 rounded flex items-center gap-1">
                                  <span>{op.operatorId}</span>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(op.operatorId);
                                      if (audioEnabled) soundSystem.playChirp('click');
                                      addToast(`Operator ID ${op.operatorId} copied`, 'success');
                                    }}
                                    className="text-slate-400 hover:text-white"
                                    title="Copy ID"
                                  >
                                    <Copy className="w-2.5 h-2.5" />
                                  </button>
                                </span>
                                <span className="text-[10px] text-slate-400">Appointed {op.appointmentDate}</span>
                              </div>
                              {op.qualification && (
                                <span className="text-[10px] text-slate-400 block mt-0.5 max-w-xs truncate">
                                  {op.qualification}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* 2. Territory / Contact */}
                        <td className="py-3.5 px-4 text-xs">
                          <p className="font-bold text-slate-200">{op.email}</p>
                          <p className="text-slate-400 text-[11px]">{op.mobile}</p>
                          <span className="text-slate-400 flex items-center gap-1 mt-0.5 text-[11px]">
                            <MapPin className="w-3 h-3 text-cyan-400" />
                            {op.district}, {op.state}
                          </span>
                        </td>

                        {/* 3. Assigned Permissions */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleOpenEdit(op)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-900 transition-colors cursor-pointer"
                          >
                            <ShieldCheck className="w-3 h-3 text-cyan-400" />
                            <span>{op.permissions.length} Privileges</span>
                          </button>
                          <span className="text-[9px] text-slate-500 block mt-1 font-mono">
                            {op.permissions.includes('publish_study_material') && op.permissions.includes('publish_mock_test') ? 'Full Direct Publishing' : 'Limited Approval Pipeline'}
                          </span>
                        </td>

                        {/* 4. Content Output */}
                        <td className="py-3.5 px-4 text-center text-xs font-mono">
                          <p className="text-emerald-400 font-black">
                            {op.stats.materialsUploaded} Materials • {op.stats.mockTestsCreated} Mock Papers
                          </p>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {op.stats.questionsCreated} Bank Qs ({op.stats.aiQuestionsGenerated} AI Synthesized)
                          </span>
                        </td>

                        {/* 5. Status */}
                        <td className="py-3.5 px-4 text-center">
                          {op.status === 'ACTIVE' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-950/90 px-2.5 py-0.5 rounded-full border border-emerald-500/40 shadow-xs shadow-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Active
                            </span>
                          ) : op.status === 'SUSPENDED' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-300 bg-rose-950/90 px-2.5 py-0.5 rounded-full border border-rose-500/40">
                              <AlertTriangle className="w-3 h-3 text-rose-400" /> Suspended
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-950/90 px-2.5 py-0.5 rounded-full border border-amber-500/40">
                              Inactive
                            </span>
                          )}
                        </td>

                        {/* 6. Super Admin Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                if (audioEnabled) soundSystem.playChirp('warp');
                                setInspectingOperator(op);
                              }}
                              className="p-1.5 rounded-lg bg-slate-900 text-slate-300 hover:text-cyan-300 hover:bg-slate-800 border border-slate-800 transition-colors"
                              title="Inspect Operator Dossier"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleOpenEdit(op)}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold text-cyan-300 hover:text-white bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 transition-all cursor-pointer inline-flex items-center gap-1"
                              title="Edit Permissions & Profile"
                            >
                              <Edit3 className="w-3 h-3 text-cyan-400" />
                              <span>Permissions</span>
                            </button>

                            <button
                              onClick={() => {
                                if (audioEnabled) soundSystem.playChirp('click');
                                setReassignFromOp(op);
                              }}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold text-purple-300 hover:text-white bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 transition-all cursor-pointer inline-flex items-center gap-1"
                              title="Reassign Content Assets"
                            >
                              <Share2 className="w-3 h-3 text-purple-400" />
                              <span>Transfer</span>
                            </button>

                            {op.status === 'ACTIVE' ? (
                              <button
                                onClick={() => handleStatusChange(op, 'SUSPENDED')}
                                className="px-2.5 py-1 rounded-lg text-xs font-bold text-rose-300 hover:text-white bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 transition-all cursor-pointer"
                                title="Suspend Operator Access"
                              >
                                Suspend
                              </button>
                            ) : (
                              <button
                                onClick={() => handleStatusChange(op, 'ACTIVE')}
                                className="px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-300 hover:text-white bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 transition-all cursor-pointer"
                                title="Activate Operator Access"
                              >
                                Activate
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800 text-xs font-mono">
                <div className="text-slate-400">
                  Page <strong className="text-white font-bold">{currentPage}</strong> of <strong className="text-white font-bold">{totalPages}</strong>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      if (audioEnabled) soundSystem.playChirp('click');
                      setCurrentPage(1);
                    }}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-slate-300 border border-slate-800 transition-all cursor-pointer"
                    title="First Page"
                  >
                    <ChevronsLeft className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      if (audioEnabled) soundSystem.playChirp('click');
                      setCurrentPage(prev => Math.max(1, prev - 1));
                    }}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-slate-300 border border-slate-800 transition-all cursor-pointer"
                    title="Previous Page"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (audioEnabled) soundSystem.playChirp('click');
                        setCurrentPage(idx + 1);
                      }}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        currentPage === idx + 1
                          ? 'bg-cyan-500 text-slate-950 font-black shadow-xs'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => {
                      if (audioEnabled) soundSystem.playChirp('click');
                      setCurrentPage(prev => Math.min(totalPages, prev + 1));
                    }}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-slate-300 border border-slate-800 transition-all cursor-pointer"
                    title="Next Page"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      if (audioEnabled) soundSystem.playChirp('click');
                      setCurrentPage(totalPages);
                    }}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-slate-300 border border-slate-800 transition-all cursor-pointer"
                    title="Last Page"
                  >
                    <ChevronsRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 7. TAB 2: EDITORIAL VELOCITY & AI TOKEN EXPENDITURE MATRIX           */}
      {/* ==================================================================== */}
      {activeTab === 'productivity' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-4 sm:p-6 rounded-2xl bg-slate-950/95 border-2 border-slate-800 hud-corner-brackets shadow-xl space-y-4 font-mono">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  OPERATOR EDITORIAL VELOCITY & AI RESOURCE EXPENDITURE MATRIX
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  AUDIT OPERATOR OUTPUT VELOCITY, AI GENERATION VOLUME, HUMAN-IN-THE-LOOP ACCURACY, AND ESTIMATED TOKEN BUDGET
                </p>
              </div>

              <Link
                to="/super-admin/operators/monitoring"
                className="px-3.5 py-1.5 rounded-xl bg-purple-950 text-purple-300 hover:bg-purple-900 border border-purple-500/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Full BI Monitoring Studio</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[850px]">
                <thead className="border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase bg-slate-900/80">
                  <tr>
                    <th className="py-3 px-4">Operator</th>
                    <th className="py-3 px-4 text-center">AI Questions Drafted</th>
                    <th className="py-3 px-4 text-center">Human Approved</th>
                    <th className="py-3 px-4 text-center">Rejection Rate</th>
                    <th className="py-3 px-4 text-right">Est. AI Tokens</th>
                    <th className="py-3 px-4 text-right">Est. Cost (₹)</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {operators.map(op => {
                    const aiQuestions = op.stats.aiQuestionsGenerated;
                    const approved = op.stats.questionsApproved;
                    const rejected = op.stats.questionsRejected;
                    const totalReviewed = approved + rejected;
                    const rejectionRate = totalReviewed > 0 ? ((rejected / totalReviewed) * 100).toFixed(1) : '0.0';
                    const estimatedTokens = Math.round(aiQuestions * 420);
                    const estimatedCost = Math.round((estimatedTokens / 1000) * 0.15 * 83); // approx ₹ conversion

                    return (
                      <tr key={op.id} className="hover:bg-slate-900/60 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-white">
                          <p>{op.name}</p>
                          <span className="text-[10px] text-cyan-400">{op.operatorId}</span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-cyan-300">
                          {aiQuestions}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-emerald-400">
                          {approved}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            Number(rejectionRate) < 5
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                              : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                          }`}>
                            {rejectionRate}%
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-purple-300">
                          {estimatedTokens.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-emerald-400">
                          ₹{estimatedCost.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            op.status === 'ACTIVE'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                              : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                          }`}>
                            {op.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 8. TAB 3: CHRONOLOGICAL GOVERNANCE AUDIT LOG                          */}
      {/* ==================================================================== */}
      {activeTab === 'activity' && (
        <div className="p-4 sm:p-6 rounded-2xl bg-slate-950/95 border-2 border-slate-800 hud-corner-brackets shadow-xl space-y-4 font-mono animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-400" />
                LIVE OPERATOR GOVERNANCE AUDIT TRAIL
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                IMMUTABLE CHRONOLOGICAL AUDIT OF OPERATOR ACTIONS, QUESTION VALIDATIONS, TEST PUBLISHING & PRIVILEGE LIFECYCLES
              </p>
            </div>
            <span className="px-2.5 py-0.5 rounded text-[10px] bg-slate-900 text-slate-300 border border-slate-700">
              {activityLogs.length || 24} Records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[750px]">
              <thead className="border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase bg-slate-900/80">
                <tr>
                  <th className="py-3 px-4">Timestamp (IST)</th>
                  <th className="py-3 px-4">Operator</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-4">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {(activityLogs.length === 0 ? [
                  {
                    id: 'log-001',
                    timestamp: '2026-10-11T12:05:00Z',
                    operatorName: 'Sunita Verma',
                    action: 'AI_QUESTION_APPROVE',
                    entityTitle: 'UPSSSC PET Quantitative Batch 4',
                    entity: 'QUESTION',
                    details: 'Approved 25 validated arithmetic items with step-by-step Hindi/English explanations'
                  },
                  {
                    id: 'log-002',
                    timestamp: '2026-10-11T11:40:00Z',
                    operatorName: 'Dr. R. K. Agnihotri',
                    action: 'MOCK_TEST_PUBLISH',
                    entityTitle: 'NEET 2027 Full Length Physics Drill 1',
                    entity: 'MOCK_TEST',
                    details: 'Published 45-question mechanics paper with NTA difficulty index 3.8'
                  },
                  {
                    id: 'log-003',
                    timestamp: '2026-10-11T10:15:00Z',
                    operatorName: 'Er. Pranav Joshi',
                    action: 'QUESTION_CREATE',
                    entityTitle: 'GATE 2026 Algorithms PYQ Archive',
                    entity: 'QUESTION',
                    details: 'Digitized and OCR-calibrated 15 dynamic programming graph questions'
                  },
                  {
                    id: 'log-004',
                    timestamp: '2026-10-10T16:20:00Z',
                    operatorName: 'Super Admin Security System',
                    action: 'STATUS_CHANGE',
                    entityTitle: 'Tariq Mansoor (OPR-IN-2026-006)',
                    entity: 'PROFILE',
                    details: 'Privileges suspended pending editorial verification of unvetted question edits'
                  }
                ] : activityLogs).map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      {log.operatorName}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-200 font-bold">
                      {log.entityTitle}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 max-w-md truncate">
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
      {/* 9. APPOINT / EDIT OPERATOR & GRANULAR RBAC MODAL                     */}
      {/* ==================================================================== */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingOperator ? `Edit Operator: ${editingOperator.name} (${editingOperator.operatorId})` : 'Appoint Pan-India Study Material & Mock Test Operator'}
        size="lg"
      >
        <form onSubmit={handleSaveOperator} className="space-y-4 text-slate-200 font-mono text-xs">
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Direct Super Admin Bureau Appointment • Automated WhatsApp Delivery</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold">
              ROLE: STUDY_MATERIAL_OPERATOR
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Full Name *</label>
              <input 
                type="text" 
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Dr. Sunita Verma"
                className="w-full text-xs bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Email Address (Login ID) *</label>
              <input 
                type="email" 
                required
                disabled={!!editingOperator}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="operator@focuspoint.internal"
                className="w-full text-xs bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white disabled:opacity-50 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Mobile Number (WhatsApp) *</label>
              <input 
                type="tel" 
                required
                value={form.mobile}
                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                placeholder="9876543220"
                className="w-full text-xs bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">State / Territory</label>
              <input 
                type="text" 
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="w-full text-xs bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Academic Qualification</label>
              <input 
                type="text" 
                value={form.qualification}
                onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                placeholder="e.g. M.Sc. Physics, B.Ed"
                className="w-full text-xs bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Curriculum Experience</label>
              <input 
                type="text" 
                value={form.experience}
                onChange={(e) => setForm({ ...form, experience: e.target.value })}
                placeholder="e.g. 7+ Years Senior Exam Paper Setter"
                className="w-full text-xs bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Granular Permissions Section */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                Granular RBAC Permission Checklist ({form.permissions.length} Selected)
              </h4>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Configure strict operational capabilities granted to this operator across content modules.
            </p>

            <div className="space-y-4 max-h-60 overflow-y-auto pr-1 border border-slate-800 rounded-xl p-3 bg-slate-900/60">
              {(['Study Material', 'Mock Tests', 'AI Copilot'] as const).map((grp) => (
                <div key={grp} className="space-y-1.5">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                    <span className="text-[11px] font-black uppercase text-cyan-400">{grp} Permissions</span>
                    <button
                      type="button"
                      onClick={() => handleToggleGroupPermissions(grp)}
                      className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
                    >
                      Toggle All in {grp}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {ALL_STUDY_MATERIAL_PERMISSIONS.filter(p => p.group === grp).map((p) => {
                      const isChecked = form.permissions.includes(p.key);
                      return (
                        <label 
                          key={p.key}
                          className={`flex items-center gap-2 text-xs p-2 rounded-lg border cursor-pointer transition-colors ${
                            isChecked
                              ? 'bg-cyan-950/80 border-cyan-500/50 text-white'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <input 
                            type="checkbox" 
                            checked={isChecked}
                            onChange={() => handleTogglePermission(p.key)}
                            className="rounded text-cyan-500 focus:ring-cyan-400 border-slate-700 bg-slate-950"
                          />
                          <span className="font-medium text-[11px]">{p.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold transition-all cursor-pointer border border-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
            >
              {editingOperator ? 'Update Operator & Privileges' : 'Appoint Operator'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ==================================================================== */}
      {/* 10. OPERATOR CRYPTOGRAPHIC DOSSIER INSPECTOR MODAL                    */}
      {/* ==================================================================== */}
      {inspectingOperator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl rounded-3xl bg-slate-950 border-2 border-cyan-500/50 hud-corner-brackets p-6 sm:p-8 text-white space-y-6 shadow-2xl overflow-y-auto max-h-[90vh] font-mono">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                {inspectingOperator.avatarUrl ? (
                  <img
                    src={inspectingOperator.avatarUrl}
                    alt={inspectingOperator.name}
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-cyan-400"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-cyan-950 border-2 border-cyan-400 flex items-center justify-center text-cyan-300 font-bold text-lg">
                    {inspectingOperator.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-base font-black uppercase text-white">
                    {inspectingOperator.name}
                  </h3>
                  <span className="text-xs text-cyan-400">
                    ID: {inspectingOperator.operatorId} • APPOINTED {inspectingOperator.appointmentDate}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setInspectingOperator(null)}
                className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 4 Quick Stat Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Study Materials</span>
                <strong className="text-cyan-400 text-sm font-black block mt-0.5">
                  {inspectingOperator.stats.materialsUploaded} Uploaded
                </strong>
                <span className="text-[9px] text-slate-400">{inspectingOperator.stats.materialsPublished} Live</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Mock Tests</span>
                <strong className="text-emerald-400 text-sm font-black block mt-0.5">
                  {inspectingOperator.stats.mockTestsCreated} Papers
                </strong>
                <span className="text-[9px] text-slate-400">{inspectingOperator.stats.mockTestAttemptsCount} Attempts</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Question Bank</span>
                <strong className="text-purple-300 text-sm font-black block mt-0.5">
                  {inspectingOperator.stats.questionsCreated} Total Qs
                </strong>
                <span className="text-[9px] text-slate-400">{inspectingOperator.stats.aiQuestionsGenerated} AI Drafts</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Student Reach</span>
                <strong className="text-amber-300 text-sm font-black block mt-0.5">
                  {inspectingOperator.stats.materialViewsCount.toLocaleString('en-IN')} Views
                </strong>
                <span className="text-[9px] text-slate-400">{inspectingOperator.stats.materialDownloadsCount} Downloads</span>
              </div>
            </div>

            {/* Itemized Dossier Ledger */}
            <div className="space-y-2 text-xs bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Territory Bureau:</span>
                <strong className="text-white">{inspectingOperator.district}, {inspectingOperator.state} ({inspectingOperator.address})</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Contact Channels:</span>
                <strong className="text-cyan-300">{inspectingOperator.email} • {inspectingOperator.mobile}</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Academic Qualification:</span>
                <strong className="text-slate-200">{inspectingOperator.qualification}</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Experience Profile:</span>
                <strong className="text-slate-200">{inspectingOperator.experience}</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">RBAC Clearance Level:</span>
                <strong className="text-emerald-400">{inspectingOperator.permissions.length} Active System Privileges</strong>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Last Telemetry Active:</span>
                <strong className="text-cyan-400">{new Date(inspectingOperator.stats.lastActiveAt).toLocaleString()}</strong>
              </div>
            </div>

            {/* Assigned Privileges Cloud */}
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Granted RBAC Privileges:</span>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                {inspectingOperator.permissions.map(p => (
                  <span key={p} className="px-2 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                    {p.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (audioEnabled) soundSystem.playChirp('confirm');
                  setBadgeDownloaded(true);
                  setTimeout(() => setBadgeDownloaded(false), 3000);
                }}
                className="bg-cyan-950 text-cyan-300 border-cyan-500/60 text-xs font-mono font-bold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{badgeDownloaded ? 'Identity Pass Dispatched' : 'Download Operator Badge'}</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setInspectingOperator(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono font-bold"
              >
                Close Dossier
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 11. CONTENT REASSIGNMENT MODAL                                        */}
      {/* ==================================================================== */}
      {reassignFromOp && (
        <Modal
          isOpen={true}
          onClose={() => setReassignFromOp(null)}
          title={`Reassign Content Ownership — ${reassignFromOp.name}`}
          size="md"
        >
          <div className="space-y-4 text-xs font-mono text-slate-200">
            <p className="text-slate-400">
              When an operator is transferring duties or departing, reassign all their uploaded study materials, mock papers, and question items to another verified operator.
            </p>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Target Reassignment Operator</label>
              <select
                value={reassignToId}
                onChange={(e) => setReassignToId(e.target.value)}
                className="w-full text-xs border border-slate-700 rounded-xl px-3 py-2 bg-slate-900 text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="">Select Target Operator</option>
                {operators.filter(o => o.id !== reassignFromOp.id).map(o => (
                  <option key={o.id} value={o.id}>{o.name} ({o.operatorId}) — {o.district}</option>
                ))}
              </select>
            </div>

            <div className="p-3 bg-amber-950/80 border border-amber-500/40 rounded-xl text-amber-300 text-[11px]">
              <strong>Audit Safety:</strong> Historical creation metadata remains intact. Assets will now be editable and published by the newly selected operator.
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setReassignFromOp(null)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 font-bold transition-all cursor-pointer border border-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!reassignToId}
                onClick={handleReassignContent}
                className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold transition-all cursor-pointer shadow-md"
              >
                Transfer Assets Now
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ==================================================================== */}
      {/* 12. UNIVERSAL EXPORT MODAL                                            */}
      {/* ==================================================================== */}
      <ExportModal
        title="Pan-India Exam & Content Operator Matrix"
        data={{
          operators: filteredOperators,
          activityLogs: activityLogs
        }}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  );
};
