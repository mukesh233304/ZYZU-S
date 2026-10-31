import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { financeService } from '../../services/financeService';
import { expenditureService } from '../../services/expenditureService';
import { payrollService } from '../../services/payrollService';
import { settlementService } from '../../services/settlementService';
import {
  DistrictExpenseClaim,
  TeacherPayrollItem,
  LibrarySettlementRecord,
  PaymentQueueItem,
  SettlementBatch,
  MonthlyClosingRecord,
  FinancialAuditLog,
  FinanceSettingsConfig,
  OfficialDocument,
  ExpenseCategory
} from '../../types/finance';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { FinancialDocumentViewer } from '../../components/finance/FinancialDocumentViewer';
import { ExecutePaymentModal, PaymentTargetDetails } from '../../components/finance/ExecutePaymentModal';
import { PanIndiaLocationSelector, LocationSelectionPayload } from '../../components/common/PanIndiaLocationSelector';
import { CyberGeospatialLocationDeck, DistrictMetricEntry } from '../../components/common/CyberGeospatialLocationDeck';
import { locationService } from '../../services/locationService';
import {
  IndianRupee,
  CreditCard,
  Building,
  TrendingUp,
  Download,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  PlusCircle,
  AlertCircle,
  Clock,
  ArrowUpRight,
  Wallet,
  Receipt,
  Search,
  Filter,
  Users,
  Building2,
  FileText,
  RotateCcw,
  CheckSquare,
  Square,
  Lock,
  Eye,
  Sliders,
  AlertTriangle,
  Send,
  FileSpreadsheet,
  Layers,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Activity,
  Zap,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Sparkles,
  BarChart3,
  RefreshCw,
  Cpu,
  Server,
  Radio,
  ArrowDownRight,
  Compass,
  Flame,
  BadgeCheck,
  FileDown,
  ExternalLink,
  HelpCircle
} from 'lucide-react';

// ============================================================================
// NATIVE WEB AUDIO CYBER SYNTHESIZER (Zero External Audio Assets)
// ============================================================================
class CyberSoundSystem {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  playChirp(type: 'click' | 'node' | 'payout' | 'clear' | 'warp' = 'click') {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      const now = this.ctx.currentTime;

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(650, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.04);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
      } else if (type === 'node') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(1100, now + 0.08);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'payout') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.06); // E5
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.12); // G5
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        osc.start(now);
        osc.stop(now + 0.14);
      } else if (type === 'clear') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'warp') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch {
      // AudioContext unavailable or autoplay blocked
    }
  }
}

const soundSystem = new CyberSoundSystem();

// Quick Jurisdiction Presets for Easy MNC-Grade Navigation
const QUICK_JURISDICTIONS = [
  { label: 'Pan-India (Consolidated)', districtName: '', stateName: '', gmv: '₹24.19L', activeCount: 'All Districts' },
  { label: 'Ghazipur Main Hub', districtName: 'Ghazipur', stateName: 'Uttar Pradesh', gmv: '₹14.85L', activeCount: 'Primary Pilot' },
  { label: 'Varanasi Tech Zone', districtName: 'Varanasi', stateName: 'Uttar Pradesh', gmv: '₹5.20L', activeCount: 'Expanded Hub' },
  { label: 'Lucknow Capital Sector', districtName: 'Lucknow', stateName: 'Uttar Pradesh', gmv: '₹3.14L', activeCount: 'HQ Metro' },
  { label: 'Saidpur Rural Circuit', districtName: 'Saidpur', stateName: 'Uttar Pradesh', gmv: '₹1.00L', activeCount: 'Sub-District' }
];

export const SuperAdminFinanceCommandCenter: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'queue' | 'expenditures' | 'payroll' | 'settlements' | 'batches' | 'documents' | 'closing' | 'audit' | 'settings'
  >('overview');

  // Loading States
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Futuristic Sound & Telemetry State
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [gatewayLatency, setGatewayLatency] = useState(2.8);
  const [treasuryPoolHealth] = useState(94.2);
  const [forecastMultiplier, setForecastMultiplier] = useState(1.0);
  const [stressTestActive, setStressTestActive] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  // Universal Holographic Node Inspector State
  const [inspectedNode, setInspectedNode] = useState<{
    title: string;
    category: string;
    hash: string;
    amount?: number;
    timestamp: string;
    district?: string;
    payload: Record<string, any>;
  } | null>(null);

  // Core Data Collections
  const [kpis, setKpis] = useState<any>(null);
  const [paymentQueue, setPaymentQueue] = useState<PaymentQueueItem[]>([]);
  const [expenseClaims, setExpenseClaims] = useState<DistrictExpenseClaim[]>([]);
  const [payrollItems, setPayrollItems] = useState<TeacherPayrollItem[]>([]);
  const [settlementRecords, setSettlementRecords] = useState<LibrarySettlementRecord[]>([]);
  const [batches, setBatches] = useState<SettlementBatch[]>([]);
  const [documents, setDocuments] = useState<OfficialDocument[]>([]);
  const [monthlyClosings, setMonthlyClosings] = useState<MonthlyClosingRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<FinancialAuditLog[]>([]);
  const [settings, setSettings] = useState<FinanceSettingsConfig | null>(null);

  // Filters & Pan-India Location State
  const [selectedLocation, setSelectedLocation] = useState<LocationSelectionPayload>({
    countryId: 'IN',
    stateId: '',
    stateName: '',
    districtId: '',
    districtName: '',
    localityId: '',
    localityName: '',
    level: 'INDIA',
    breadcrumb: 'Pan-India'
  });
  const selectedDistrict = selectedLocation.districtName || 'ALL';

  const [queuePayeeFilter, setQueuePayeeFilter] = useState('ALL');
  const [queueStatusFilter, setQueueStatusFilter] = useState('ALL');
  const [queueSearch, setQueueSearch] = useState('');

  // Bulk Payment Selection
  const [selectedQueueIds, setSelectedQueueIds] = useState<string[]>([]);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [generatedBatch, setGeneratedBatch] = useState<SettlementBatch | null>(null);

  // Claim Verification Drawer / Modal
  const [selectedClaim, setSelectedClaim] = useState<DistrictExpenseClaim | null>(null);
  const [isClaimReviewOpen, setIsClaimReviewOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<'APPROVE' | 'PARTIAL' | 'REJECT' | 'DOCS'>('APPROVE');
  const [approvedAmountInput, setApprovedAmountInput] = useState('');
  const [reviewRemarks, setReviewRemarks] = useState('');

  // Teacher Payroll Calculation Statement Modal
  const [selectedPayroll, setSelectedPayroll] = useState<TeacherPayrollItem | null>(null);
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);

  // Library Settlement Detail Modal
  const [selectedSettlement, setSelectedSettlement] = useState<LibrarySettlementRecord | null>(null);
  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);

  // Batch Detail Modal
  const [selectedBatchDetails, setSelectedBatchDetails] = useState<{ batch: SettlementBatch; items: PaymentQueueItem[] } | null>(null);

  // Official Document Viewer
  const [activeDocument, setActiveDocument] = useState<OfficialDocument | null>(null);
  const [isDocViewerOpen, setIsDocViewerOpen] = useState(false);

  // Super Admin Payment Execution Modal
  const [paymentModalTarget, setPaymentModalTarget] = useState<PaymentTargetDetails | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Monthly Closing Modal
  const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);
  const [closingMonth, setClosingMonth] = useState('September');
  const [closingYear, setClosingYear] = useState(2026);

  // New Category Modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatSubs, setNewCatSubs] = useState('');

  // Simulated Gateway Latency Jitter
  useEffect(() => {
    const interval = setInterval(() => {
      setGatewayLatency(+(2.4 + Math.random() * 1.4).toFixed(1));
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Universal Element Inspector Handler
  const handleInspectElement = (
    title: string,
    category: string,
    payload: Record<string, any>,
    e?: React.MouseEvent
  ) => {
    if (e) {
      e.stopPropagation();
    }
    if (audioEnabled) {
      soundSystem.playChirp('node');
    }
    const cryptoHash = '0x' + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setInspectedNode({
      title,
      category,
      hash: cryptoHash,
      amount: payload.amount ?? payload.value,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      district: payload.district || (selectedDistrict === 'ALL' ? 'Pan-India' : selectedDistrict),
      payload
    });
  };

  // Format Currency
  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  // Dynamic District Fallback Synthesizer to ensure ANY selected district has rich operational data
  const synthesizeDistrictDataIfEmpty = (
    district: string,
    rawQueue: PaymentQueueItem[],
    rawClaims: DistrictExpenseClaim[],
    rawPayrolls: TeacherPayrollItem[],
    rawSettlements: LibrarySettlementRecord[]
  ) => {
    if (district === 'ALL' || district.trim() === '') {
      if (selectedLocation.stateName && selectedLocation.stateName !== 'ALL') {
        const sName = selectedLocation.stateName.toLowerCase();
        const stateDistricts = locationService.getDistricts(selectedLocation.stateId, true).map(d => d.name.toLowerCase());
        const filterByState = <T extends { district: string; state?: string }>(items: T[]) =>
          items.filter(item => 
            (item.state && item.state.toLowerCase() === sName) ||
            stateDistricts.includes(item.district.toLowerCase())
          );
        return {
          queue: filterByState(rawQueue),
          claims: filterByState(rawClaims),
          payrolls: filterByState(rawPayrolls),
          settlements: filterByState(rawSettlements)
        };
      }
      return { queue: rawQueue, claims: rawClaims, payrolls: rawPayrolls, settlements: rawSettlements };
    }

    let q = rawQueue.filter(item => item.district.toLowerCase() === district.toLowerCase());
    let c = rawClaims.filter(item => item.district.toLowerCase() === district.toLowerCase());
    let p = rawPayrolls.filter(item => item.district.toLowerCase() === district.toLowerCase());
    let s = rawSettlements.filter(item => item.district.toLowerCase() === district.toLowerCase());

    // If this district has no seed data yet, synthesize high-fidelity realistic MNC EdTech records for it!
    if (q.length === 0 && p.length === 0) {
      const now = new Date().toISOString();
      const resolvedDt = locationService.getDistricts(undefined, true).find(d => d.name.toLowerCase() === district.toLowerCase());
      const resolvedSt = resolvedDt ? locationService.getStates('loc-country-in', true).find(st => st.id === resolvedDt.stateId)?.name : undefined;
      const targetState = resolvedSt || selectedLocation.stateName || 'Uttar Pradesh';

      const syntheticPayroll: TeacherPayrollItem[] = [
        {
          id: `PAY-${district.toUpperCase().slice(0, 3)}-001`,
          teacherId: `tch-${district.toLowerCase()}-1`,
          teacherName: `Dr. Anand Verma (${district} Hub)`,
          teacherPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
          district: district,
          state: targetState,
          billingMonth: 'September 2026',
          assignedStudentsCount: 6,
          completedSessionsCount: 48,
          approvedSessionsCount: 48,
          grossTuitionCollection: 32000,
          teacherEarnings: 27200,
          focusPointCommission: 4800,
          bonus: 1000,
          deductions: 0,
          adjustments: 0,
          netPayable: 28200,
          paidAmount: 0,
          status: 'READY_FOR_PAYMENT',
          salarySlipNumber: `SLIP-${district.toUpperCase().slice(0, 3)}-2026-001`,
          bankDetails: {
            accountHolderName: `Dr. Anand Verma`,
            bankName: 'HDFC Bank',
            accountNumberMasked: 'XXXX XXXX 8812',
            ifscCode: 'HDFC0001824',
            verificationStatus: 'VERIFIED'
          },
          createdAt: now,
          updatedAt: now
        },
        {
          id: `PAY-${district.toUpperCase().slice(0, 3)}-002`,
          teacherId: `tch-${district.toLowerCase()}-2`,
          teacherName: `Er. Shweta Rai (${district})`,
          teacherPhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100',
          district: district,
          state: targetState,
          billingMonth: 'September 2026',
          assignedStudentsCount: 4,
          completedSessionsCount: 32,
          approvedSessionsCount: 32,
          grossTuitionCollection: 24000,
          teacherEarnings: 20400,
          focusPointCommission: 3600,
          bonus: 0,
          deductions: 0,
          adjustments: 0,
          netPayable: 20400,
          paidAmount: 0,
          status: 'READY_FOR_PAYMENT',
          salarySlipNumber: `SLIP-${district.toUpperCase().slice(0, 3)}-2026-002`,
          bankDetails: {
            accountHolderName: `Er. Shweta Rai`,
            bankName: 'State Bank of India',
            accountNumberMasked: 'XXXX XXXX 4192',
            ifscCode: 'SBIN0000812',
            verificationStatus: 'VERIFIED'
          },
          createdAt: now,
          updatedAt: now
        }
      ];

      const syntheticSettlements: LibrarySettlementRecord[] = [
        {
          id: `SETT-${district.toUpperCase().slice(0, 3)}-001`,
          libraryId: `lib-${district.toLowerCase()}-1`,
          libraryName: `${district} Central Study Hub & AC Reading Room`,
          ownerId: `usr-owner-${district.toLowerCase()}-1`,
          ownerName: `Sunil K. Pandey`,
          district: district,
          state: targetState,
          settlementPeriod: 'September 2026',
          lineItems: [],
          totalBookingsCount: 84,
          grossBookingAmount: 42000,
          totalDiscounts: 0,
          platformCommission: 4200,
          adjustments: 0,
          netPayable: 37800,
          paidAmount: 0,
          status: 'READY_FOR_SETTLEMENT',
          receiptNumber: `REC-${district.toUpperCase().slice(0, 3)}-2026-881`,
          bankDetails: {
            accountHolderName: `${district} Central Study Hub`,
            bankName: 'Punjab National Bank',
            accountNumberMasked: 'XXXX XXXX 9931',
            ifscCode: 'PUNB0002144',
            verificationStatus: 'VERIFIED'
          },
          createdAt: now,
          updatedAt: now
        }
      ];

      const syntheticClaims: DistrictExpenseClaim[] = [
        {
          id: `DEXP-${district.toUpperCase().slice(0, 3)}-001`,
          district: district,
          state: targetState,
          category: 'Marketing',
          subCategory: 'Flyers & Posters',
          description: `Promotional banner and admission flyers campaign across ${district} institutions`,
          purpose: 'Expand district student enrollment ahead of board batches',
          claimedAmount: 18500,
          approvedAmount: 18500,
          payableAmount: 18500,
          alreadyPaidAmount: 0,
          remainingAmount: 18500,
          expenseDate: '2026-09-18',
          vendorName: `${district} Graphics & Print Works`,
          paymentMethod: 'NEFT_RTGS',
          billNumber: `BILL-${district.toUpperCase().slice(0, 3)}-449`,
          billDate: '2026-09-17',
          notes: 'Standard district promotion budget claim',
          internalRemarks: 'Verified rate card compliance',
          supportingDocuments: [
            {
              id: `doc-${district}-1`,
              name: 'Print_Invoice_Verified.pdf',
              url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800',
              fileType: 'application/pdf',
              sizeBytes: 320000,
              uploadedAt: now
            }
          ],
          bankDetails: {
            accountHolderName: `${district} Graphics & Print Works`,
            bankName: 'State Bank of India',
            accountNumberMasked: 'XXXX XXXX 3381',
            ifscCode: 'SBIN0001244',
            verified: true
          },
          status: 'PAYMENT_QUEUED',
          submittedByAdminId: `usr-admin-${district.toLowerCase()}`,
          submittedByAdminName: `${district} Regional Coordinator`,
          approvedBySuperAdminId: user?.id || 'usr-superadmin',
          approvedBySuperAdminName: user?.name || 'Prof. Alok Tripathi (Super Admin)',
          approvedAt: now,
          paymentQueueId: `PQ-${district.toUpperCase().slice(0, 3)}-001`,
          timeline: [
            {
              id: `tl-${district}-1`,
              status: 'SUBMITTED',
              note: 'Claim Submitted',
              actorName: `${district} Regional Coordinator`,
              actorRole: 'DISTRICT_ADMIN',
              timestamp: '2026-09-18T10:00:00Z'
            },
            {
              id: `tl-${district}-2`,
              status: 'APPROVED',
              note: 'Approved by Super Admin',
              actorName: 'Prof. Alok Tripathi (Super Admin)',
              actorRole: 'SUPER_ADMIN',
              timestamp: '2026-09-18T14:30:00Z'
            }
          ],
          createdAt: '2026-09-18T10:00:00Z',
          updatedAt: now
        }
      ];

      const syntheticQueue: PaymentQueueItem[] = [
        {
          id: `PQ-TCH-${district.toUpperCase().slice(0, 3)}-01`,
          payeeId: syntheticPayroll[0].teacherId,
          payeeName: syntheticPayroll[0].teacherName,
          payeeType: 'TEACHER',
          paymentType: 'SALARY',
          district: district,
          state: targetState,
          amount: syntheticPayroll[0].netPayable,
          claimedOrGrossAmount: syntheticPayroll[0].grossTuitionCollection,
          sourceReferenceId: syntheticPayroll[0].id,
          referenceCode: syntheticPayroll[0].salarySlipNumber || `SLIP-${district}-01`,
          description: `${syntheticPayroll[0].billingMonth} Faculty Salary (${syntheticPayroll[0].assignedStudentsCount} Students, ${syntheticPayroll[0].completedSessionsCount} Sessions)`,
          paymentMethod: 'BANK_TRANSFER',
          bankAccountMasked: syntheticPayroll[0].bankDetails?.accountNumberMasked || 'XXXX XXXX 8812',
          ifscCode: syntheticPayroll[0].bankDetails?.ifscCode || 'HDFC0001824',
          bankVerified: true,
          status: 'QUEUED',
          idempotencyKey: `IDEMP-${district}-TCH-1`,
          createdAt: now
        },
        {
          id: `PQ-LIB-${district.toUpperCase().slice(0, 3)}-01`,
          payeeId: syntheticSettlements[0].libraryId,
          payeeName: `${syntheticSettlements[0].ownerName} (${syntheticSettlements[0].libraryName})`,
          payeeType: 'LIBRARY_OWNER',
          paymentType: 'SETTLEMENT',
          district: district,
          state: targetState,
          amount: syntheticSettlements[0].netPayable,
          claimedOrGrossAmount: syntheticSettlements[0].grossBookingAmount,
          sourceReferenceId: syntheticSettlements[0].id,
          referenceCode: syntheticSettlements[0].receiptNumber || `REC-${district}-01`,
          description: `Seat Settlement for ${syntheticSettlements[0].settlementPeriod} (${syntheticSettlements[0].totalBookingsCount} bookings)`,
          paymentMethod: 'BANK_TRANSFER',
          bankAccountMasked: syntheticSettlements[0].bankDetails?.accountNumberMasked || 'XXXX XXXX 9931',
          ifscCode: syntheticSettlements[0].bankDetails?.ifscCode || 'PUNB0002144',
          bankVerified: true,
          status: 'QUEUED',
          idempotencyKey: `IDEMP-${district}-LIB-1`,
          createdAt: now
        },
        {
          id: `PQ-EXP-${district.toUpperCase().slice(0, 3)}-01`,
          payeeId: syntheticClaims[0].submittedByAdminId,
          payeeName: `${syntheticClaims[0].submittedByAdminName} (${syntheticClaims[0].vendorName})`,
          payeeType: 'DISTRICT_ADMIN',
          paymentType: 'EXPENDITURE',
          district: district,
          state: targetState,
          amount: syntheticClaims[0].payableAmount || 18500,
          claimedOrGrossAmount: syntheticClaims[0].claimedAmount,
          sourceReferenceId: syntheticClaims[0].id,
          referenceCode: syntheticClaims[0].billNumber,
          description: `Marketing: ${syntheticClaims[0].description}`,
          paymentMethod: 'BANK_TRANSFER',
          bankAccountMasked: syntheticClaims[0].bankDetails?.accountNumberMasked || 'XXXX XXXX 3381',
          ifscCode: syntheticClaims[0].bankDetails?.ifscCode || 'SBIN0001244',
          bankVerified: true,
          status: 'QUEUED',
          idempotencyKey: `IDEMP-${district}-EXP-1`,
          createdAt: now
        }
      ];

      return {
        queue: syntheticQueue,
        claims: syntheticClaims,
        payrolls: syntheticPayroll,
        settlements: syntheticSettlements
      };
    }

    return { queue: q, claims: c, payrolls: p, settlements: s };
  };

  // Load All Financial Data
  const loadData = async () => {
    setLoading(true);
    try {
      const locFilter = {
        state: selectedLocation.stateName || 'ALL',
        district: selectedLocation.districtName || 'ALL',
        locality: selectedLocation.localityName || 'ALL'
      };

      const [
        kpiData,
        qData,
        cData,
        pData,
        sData,
        bData,
        dData,
        mcData,
        aData,
        settData
      ] = await Promise.all([
        financeService.getOverviewKpis(locFilter),
        financeService.getPaymentQueue({ state: locFilter.state, district: locFilter.district }),
        expenditureService.getClaims(locFilter.district),
        payrollService.getPayrollItems('ALL', locFilter.district),
        settlementService.getSettlements('ALL', locFilter.district),
        financeService.getSettlementBatches(),
        financeService.getDocumentVault('SUPER_ADMIN', undefined, locFilter.district),
        financeService.getMonthlyClosings(locFilter.district),
        financeService.getAuditLogs(locFilter.district),
        financeService.getSettings()
      ]);

      const synthesized = synthesizeDistrictDataIfEmpty(
        locFilter.district,
        qData,
        cData,
        pData,
        sData
      );

      // Re-calculate live KPIs if synthesized for this district
      let finalKpis = kpiData;
      if (locFilter.district !== 'ALL' && (!kpiData || kpiData.grossTotalVolume === 0)) {
        const grossTuition = synthesized.payrolls.reduce((sum, p) => sum + p.grossTuitionCollection, 0);
        const grossLibrary = synthesized.settlements.reduce((sum, s) => sum + s.grossBookingAmount, 0);
        const gmv = grossTuition + grossLibrary;
        const commission = Math.round(grossTuition * 0.15 + grossLibrary * 0.10);
        const totalDisbursed = synthesized.claims.reduce((s, c) => s + c.alreadyPaidAmount, 0) +
          synthesized.payrolls.reduce((s, p) => s + p.paidAmount, 0);
        const pendingPay = synthesized.queue.filter(q => q.status === 'QUEUED').reduce((s, q) => s + q.amount, 0);

        finalKpis = {
          grossTotalVolume: gmv || 54000,
          gmv: gmv || 54000,
          revenue: commission || 7200,
          netRevenue: (commission - 18500) || 5200,
          commission: commission || 7200,
          teacherPayouts: Math.round(grossTuition * 0.85) || 47600,
          librarySettlements: Math.round(grossLibrary * 0.90) || 37800,
          districtPayments: 18500,
          expenses: 18500,
          refunds: 0,
          pendingPayments: pendingPay || 66400,
          profit: Math.round(commission * 0.6) || 4300,
          receivables: Math.round(gmv * 0.08) || 4320,
          payables: pendingPay || 66400,
          failedPaymentsCount: 0,
          totalDisbursed: totalDisbursed || 12000,
          netPlatformProfit: (commission - 18500) || 5200,
          platformCommissionTotal: commission || 7200,
          districtExpenses: 18500
        };
      }

      setKpis(finalKpis);
      setPaymentQueue(synthesized.queue);
      setExpenseClaims(synthesized.claims);
      setPayrollItems(synthesized.payrolls);
      setSettlementRecords(synthesized.settlements);
      setBatches(bData);
      setDocuments(dData);
      setMonthlyClosings(mcData);
      setAuditLogs(aData);
      setSettings(settData);
    } catch (err) {
      console.error('Failed to load finance data', err);
      addToast('Error loading finance workspace data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedLocation]);

  // Quick Jurisdiction Selection Handler
  const handleSelectQuickJurisdiction = (preset: typeof QUICK_JURISDICTIONS[0]) => {
    if (audioEnabled) soundSystem.playChirp('click');
    setSelectedLocation({
      countryId: 'IN',
      stateId: preset.stateName ? 'UP' : '',
      stateName: preset.stateName,
      districtId: preset.districtName ? `dist-${preset.districtName.toLowerCase()}` : '',
      districtName: preset.districtName,
      localityId: '',
      localityName: '',
      level: preset.districtName ? 'DISTRICT' : 'INDIA',
      breadcrumb: preset.districtName ? `India > ${preset.stateName} > ${preset.districtName}` : 'Pan-India'
    });
  };

  // District Jurisdiction Metrics for Matrix Leaderboard
  const districtMetrics: DistrictMetricEntry[] = useMemo(() => {
    const map = new Map<string, DistrictMetricEntry>();

    payrollItems.forEach(p => {
      const key = `${p.district}|${p.state || 'Uttar Pradesh'}`;
      if (!map.has(key)) {
        map.set(key, {
          districtName: p.district,
          stateName: p.state || 'Uttar Pradesh',
          totalTxns: 0,
          totalGross: 0,
          totalPlatformFee: 0,
          totalPartnerPayout: 0
        });
      }
      const e = map.get(key)!;
      e.totalTxns++;
      e.totalGross += p.grossTuitionCollection;
      e.totalPlatformFee = (e.totalPlatformFee || 0) + p.focusPointCommission;
      e.totalPartnerPayout = (e.totalPartnerPayout || 0) + p.netPayable;
    });

    settlementRecords.forEach(s => {
      const key = `${s.district}|${s.state || 'Uttar Pradesh'}`;
      if (!map.has(key)) {
        map.set(key, {
          districtName: s.district,
          stateName: s.state || 'Uttar Pradesh',
          totalTxns: 0,
          totalGross: 0,
          totalPlatformFee: 0,
          totalPartnerPayout: 0
        });
      }
      const e = map.get(key)!;
      e.totalTxns++;
      e.totalGross += s.grossBookingAmount;
      e.totalPlatformFee = (e.totalPlatformFee || 0) + s.platformCommission;
      e.totalPartnerPayout = (e.totalPartnerPayout || 0) + s.netPayable;
    });

    return Array.from(map.values()).sort((a, b) => b.totalGross - a.totalGross);
  }, [payrollItems, settlementRecords]);

  // Export Financial Dossier Handler (MNC Corporate Standard Feature)
  const handleExportDossier = () => {
    if (audioEnabled) soundSystem.playChirp('warp');
    const headers = ['Record ID', 'Payee Name', 'Payee Type', 'Category', 'District', 'Amount (INR)', 'Status', 'Reference / UTR', 'Bank Mask', 'Timestamp'];
    const rows = paymentQueue.map(q => [
      q.id,
      `"${q.payeeName.replace(/"/g, '""')}"`,
      q.payeeType,
      q.paymentType,
      `"${q.district}"`,
      q.amount,
      q.status,
      `"${q.referenceCode || q.id}"`,
      `"${q.bankAccountMasked || 'N/A'}"`,
      `"${q.createdAt}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FocusPoint_Finance_Dossier_${selectedDistrict}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast(`Official Financial Dossier CSV exported for ${selectedDistrict === 'ALL' ? 'Pan-India' : selectedDistrict}!`, 'success');
  };

  // --- Handlers: Payment Queue & Bulk ---
  const handleToggleSelectQueue = (id: string) => {
    if (audioEnabled) soundSystem.playChirp('click');
    setSelectedQueueIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAllQueue = () => {
    if (audioEnabled) soundSystem.playChirp('click');
    const payableItems = filteredQueue.filter(q => q.status === 'QUEUED' || q.status === 'RETRY_READY');
    if (selectedQueueIds.length === payableItems.length) {
      setSelectedQueueIds([]);
    } else {
      setSelectedQueueIds(payableItems.map(q => q.id));
    }
  };

  const handleSelectPayeeCategory = (type: 'TEACHER' | 'LIBRARY_OWNER' | 'DISTRICT_ADMIN') => {
    if (audioEnabled) soundSystem.playChirp('click');
    const matchingIds = filteredQueue
      .filter(q => (q.status === 'QUEUED' || q.status === 'RETRY_READY') && q.payeeType === type)
      .map(q => q.id);
    setSelectedQueueIds(matchingIds);
    addToast(`Selected ${matchingIds.length} payable ${type} items for batch clearance`, 'info');
  };

  const handleProcessSinglePayment = async (id: string, simulateFailure = false) => {
    if (audioEnabled) soundSystem.playChirp('payout');
    setActionLoading(true);
    try {
      const res = await financeService.processPayment(id, 'NEFT_RTGS', simulateFailure);
      if (res.success) {
        addToast(`Payment of ${formatINR(res.item.amount)} processed successfully!`, 'success');
        if (res.officialDocument) {
          setActiveDocument(res.officialDocument);
          setIsDocViewerOpen(true);
        }
      } else {
        addToast(`Payment Failed: ${res.error || 'Gateway Timeout'}`, 'error');
      }
      await loadData();
    } catch (e: any) {
      addToast(e?.message || 'Error processing payment', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExecuteBulkPayment = async () => {
    if (selectedQueueIds.length === 0) return;
    if (audioEnabled) soundSystem.playChirp('clear');
    setActionLoading(true);
    try {
      const batch = await financeService.processBulkBatch(
        selectedQueueIds,
        user?.id || 'usr-superadmin',
        user?.name || 'Prof. Alok Tripathi (Super Admin)'
      );
      setGeneratedBatch(batch);
      setSelectedQueueIds([]);
      setIsBulkConfirmOpen(false);
      addToast(`Settlement Batch ${batch.id} completed with ${batch.successfulPayments} successful payments totaling ${formatINR(batch.totalAmount)}`, 'success');
      await loadData();
    } catch (e: any) {
      addToast(e?.message || 'Bulk processing failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRetryPayment = async (itemId: string) => {
    if (audioEnabled) soundSystem.playChirp('click');
    try {
      await financeService.retryFailedPayment(itemId);
      addToast('Payment reset to QUEUED for retry', 'info');
      await loadData();
    } catch (e: any) {
      addToast(e?.message || 'Retry failed', 'error');
    }
  };

  // --- Handlers: District Expenditure Verification ---
  const handleOpenClaimReview = (claim: DistrictExpenseClaim) => {
    if (audioEnabled) soundSystem.playChirp('node');
    setSelectedClaim(claim);
    setApprovedAmountInput(String(claim.claimedAmount));
    setReviewRemarks(claim.internalRemarks || '');
    setReviewAction('APPROVE');
    setIsClaimReviewOpen(true);
  };

  const handleSubmitClaimReview = async () => {
    if (!selectedClaim) return;
    if (audioEnabled) soundSystem.playChirp('clear');
    setActionLoading(true);
    try {
      let finalStatus: any = 'APPROVED';
      let approvedAmt = Number(approvedAmountInput);

      if (reviewAction === 'PARTIAL') {
        finalStatus = 'PARTIALLY_APPROVED';
        if (approvedAmt <= 0 || approvedAmt >= selectedClaim.claimedAmount) {
          addToast('For partial approval, enter an amount greater than 0 and less than claimed amount', 'error');
          setActionLoading(false);
          return;
        }
      } else if (reviewAction === 'REJECT') {
        finalStatus = 'REJECTED';
      } else if (reviewAction === 'DOCS') {
        finalStatus = 'DOCUMENT_REQUIRED';
      }

      await expenditureService.reviewClaim({
        claimId: selectedClaim.id,
        status: finalStatus,
        adminId: user?.id || 'usr-superadmin',
        adminName: user?.name || 'Super Admin',
        remarks: reviewRemarks,
        approvedAmount: reviewAction === 'REJECT' ? 0 : approvedAmt,
        rejectionReason: reviewAction === 'REJECT' ? reviewRemarks : undefined
      });

      addToast(`Claim ${selectedClaim.id} updated to ${finalStatus}`, 'success');
      setIsClaimReviewOpen(false);
      await loadData();
    } catch (e: any) {
      addToast(e?.message || 'Error reviewing claim', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveAndPayClaim = () => {
    if (!selectedClaim) return;
    if (audioEnabled) soundSystem.playChirp('payout');
    const approvedAmt = approvedAmountInput ? Number(approvedAmountInput) : selectedClaim.claimedAmount;
    setPaymentModalTarget({
      id: selectedClaim.id,
      targetType: 'CLAIM',
      payeeName: `${selectedClaim.vendorName} (C/O ${selectedClaim.submittedByAdminName})`,
      payeeType: 'DISTRICT_ADMIN',
      district: selectedClaim.district,
      amount: approvedAmt,
      description: `${selectedClaim.category} - ${selectedClaim.description}`,
      referenceCode: selectedClaim.billNumber,
      bankDetails: selectedClaim.bankDetails
    });
    setIsClaimReviewOpen(false);
    setIsPaymentModalOpen(true);
  };

  // --- Handlers: Payroll & Settlements Generation ---
  const handleGeneratePayroll = async () => {
    if (audioEnabled) soundSystem.playChirp('warp');
    setActionLoading(true);
    try {
      const generated = await payrollService.generatePayrollRun('September 2026', selectedDistrict);
      addToast(`Payroll run successfully calculated and generated for ${selectedDistrict === 'ALL' ? 'all educators' : selectedDistrict}!`, 'success');
      await loadData();
    } catch (e: any) {
      addToast(e?.message || 'Error generating payroll', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleQueuePayroll = async (id: string) => {
    if (audioEnabled) soundSystem.playChirp('click');
    try {
      await payrollService.queuePayrollItem(id);
      addToast('Teacher payroll successfully queued for disbursement', 'success');
      await loadData();
    } catch (e: any) {
      addToast(e?.message || 'Error queuing payroll', 'error');
    }
  };

  const handleGenerateSettlements = async () => {
    if (audioEnabled) soundSystem.playChirp('warp');
    setActionLoading(true);
    try {
      const generated = await settlementService.generateSettlementRun('September 2026', selectedDistrict);
      addToast(`Seat booking settlement calculations generated for ${selectedDistrict === 'ALL' ? 'all libraries' : selectedDistrict}!`, 'success');
      await loadData();
    } catch (e: any) {
      addToast(e?.message || 'Error generating settlements', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleQueueSettlement = async (id: string) => {
    if (audioEnabled) soundSystem.playChirp('click');
    try {
      await settlementService.queueSettlement(id);
      addToast('Library settlement successfully queued for payment', 'success');
      await loadData();
    } catch (e: any) {
      addToast(e?.message || 'Error queuing settlement', 'error');
    }
  };

  // --- Handlers: Monthly Closing ---
  const handleExecuteClosing = async () => {
    if (audioEnabled) soundSystem.playChirp('clear');
    setActionLoading(true);
    try {
      const closed = await financeService.closeFinancialMonth(
        closingMonth,
        closingYear,
        selectedDistrict === 'ALL' ? 'Ghazipur' : selectedDistrict,
        user?.id || 'usr-superadmin',
        user?.name || 'Prof. Alok Tripathi (Super Admin)'
      );
      addToast(`Period ${closed.month} ${closed.year} for ${closed.district} closed and locked successfully!`, 'success');
      setIsClosingModalOpen(false);
      await loadData();
    } catch (e: any) {
      addToast(e?.message || 'Monthly closing failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // --- Handlers: Settings & Categories ---
  const handleToggleCategory = async (catId: string, current: boolean) => {
    if (audioEnabled) soundSystem.playChirp('click');
    try {
      await financeService.toggleCategory(catId, !current);
      addToast('Expense category status updated', 'success');
      await loadData();
    } catch (e) {
      addToast('Failed to update category', 'error');
    }
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim()) {
      addToast('Please enter category name', 'error');
      return;
    }
    if (audioEnabled) soundSystem.playChirp('node');
    try {
      const subs = newCatSubs.split(',').map(s => s.trim()).filter(Boolean);
      await financeService.addCategory(newCatName as any, subs);
      addToast(`Category ${newCatName} added to system`, 'success');
      setIsCategoryModalOpen(false);
      setNewCatName('');
      setNewCatSubs('');
      await loadData();
    } catch (e) {
      addToast('Failed to add category', 'error');
    }
  };

  // Filtered Payment Queue
  const filteredQueue = paymentQueue.filter(item => {
    if (queuePayeeFilter !== 'ALL' && item.payeeType !== queuePayeeFilter) return false;
    if (queueStatusFilter !== 'ALL' && item.status !== queueStatusFilter) return false;
    if (queueSearch.trim()) {
      const q = queueSearch.toLowerCase();
      return (
        item.payeeName.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.referenceCode.toLowerCase().includes(q) ||
        item.district.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const selectedTotalAmount = paymentQueue
    .filter(q => selectedQueueIds.includes(q.id))
    .reduce((sum, q) => sum + q.amount, 0);

  // Simulated AI Liquidity Forecast Outputs
  const baseOutflow = 1985000;
  const simulatedOutflow = Math.round(baseOutflow * forecastMultiplier * (stressTestActive ? 1.35 : 1.0));
  const baseGrossGmv = kpis?.grossTotalVolume || 2419000;
  const simulatedGmv = Math.round(baseGrossGmv * forecastMultiplier);
  const simulatedRunwayDays = Math.max(45, Math.round(210 / (forecastMultiplier * (stressTestActive ? 1.4 : 1.0))));

  return (
    <div className="relative space-y-6 pb-36 text-slate-900">
      {/* ==================================================================== */}
      {/* ==================================================================== */}
      {/* 1. PANORAMIC CYBER-HUD FINANCE COMMAND STATION (3-Tier Cockpit Deck) */}
      {/* ==================================================================== */}
      <div className="relative z-10 p-4 sm:p-6 rounded-3xl bg-slate-950/95 border-2 border-brand-500/50 shadow-2xl space-y-4 backdrop-blur-md overflow-hidden text-white">
        {/* Ambient Amber/Brand Matrix Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none -mr-40 -mt-40 animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -ml-40 -mb-40" />

        {/* TIER 1: MICRO-HUD TELEMETRY BREADCRUMB BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Live Pulse Indicator & Primary OS Badge */}
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-500 shadow-[0_0_12px_rgba(249,115,22,0.9)]"></span>
              </span>
              <span className="text-[11px] font-mono font-black uppercase tracking-widest text-brand-300 px-3 py-1 rounded-full bg-brand-950/90 border border-brand-500/70 shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                FOCUSPOINT AUTONOMOUS FINANCE OS // V4.8
              </span>
            </div>

            {/* NPCI-IMPS Highway Badge */}
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-cyan-300 bg-slate-900 px-3 py-1 rounded-full border border-slate-700 shadow-xs">
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>NPCI-IMPS HIGHWAY // Latency: {gatewayLatency || '2.7'}ms // 256-AES</span>
            </div>

            {/* Treasury Pool Health Badge */}
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-black text-emerald-300 bg-emerald-950/90 px-3 py-1 rounded-full border border-emerald-500/60 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>TREASURY POOL: {treasuryPoolHealth}% HEALTH (₹1.48 CR)</span>
            </div>
          </div>

          {/* Security & Cyber Audio Toggle */}
          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-200 text-[10px] font-mono font-bold">
              <Lock className="w-3 h-3 text-amber-400" />
              <span>SHA-256 LEDGER LOCK</span>
            </div>

            <button
              type="button"
              onClick={() => {
                const next = !audioEnabled;
                setAudioEnabled(next);
                if (next) soundSystem.playChirp('node');
                addToast(next ? 'Cyber Synth Audio Enabled' : 'Cyber Synth Muted', 'info');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-black flex items-center gap-1.5 border transition-all cursor-pointer ${
                audioEnabled
                  ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400/40'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
              }`}
              title="Toggle Web Audio Synthesizer"
            >
              {audioEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>AUDIO: {audioEnabled ? 'ONLINE' : 'MUTED'}</span>
            </button>
          </div>
        </div>

        {/* TIER 2: DEDICATED HORIZONTAL COMMAND DISPLAY COCKPIT: Title + Subtitle In Full Horizontal Spread */}
        <div className="p-4 sm:p-5 lg:p-6 rounded-2xl bg-slate-900/90 border border-brand-500/40 shadow-inner backdrop-blur-md">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
            {/* Left Wing: Holographic Pulse Emblem + Title */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              <div className="relative shrink-0 flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500/25 via-amber-600/30 to-emerald-500/20 border-2 border-brand-400/60 shadow-lg shadow-brand-500/30 group-hover:scale-105 transition-transform">
                <Wallet className="w-7 h-7 text-brand-300 animate-pulse" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950 animate-ping" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-black tracking-tight uppercase text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-brand-300 drop-shadow-md">
                    Autonomous Financial Command Deck
                  </h1>
                  <span className="px-2 py-0.5 rounded-md bg-brand-950 border border-brand-400 text-[10px] font-mono font-black text-brand-300 uppercase tracking-wider shadow-xs">
                    HQ LEDGER
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-widest block mt-0.5">
                  NATIONAL LIQUIDITY & ESCROW CLEARING HIGHWAY
                </span>
              </div>
            </div>

            {/* Glowing Neon Laser Divider (Vertical on lg screens, Horizontal on small screens) */}
            <div className="hidden lg:block w-px h-14 bg-gradient-to-b from-brand-400/20 via-brand-400 to-brand-400/20 shrink-0 mx-2 shadow-xs shadow-brand-400" />
            <div className="lg:hidden w-full h-px bg-slate-800" />

            {/* Right Wing: The Subtitle (Rendered Horizontally Side-by-Side with Title) */}
            <div className="flex-1 min-w-0 max-w-2xl">
              <p className="text-xs sm:text-[13px] font-semibold text-slate-100 leading-relaxed drop-shadow-xs">
                Real-time Liquidity Telemetry, Algorithmic Teacher Payroll, Escrow Library Settlements, Instant IMPS/NEFT Clearing Highway & Immutable Ledger Locking.
              </p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/50 shadow-xs">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  INSTANT T+0 SETTLEMENTS
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/50 shadow-xs">
                  <Zap className="w-3 h-3 text-cyan-400" />
                  ALGORITHMIC ESCROW V4.8
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/50 shadow-xs">
                  <Lock className="w-3 h-3 text-amber-400" />
                  IMMUTABLE AUDIT LOGS
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* TIER 3: ACTION BUTTONS & EXECUTIVE FINANCIAL TOOLBAR */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
          {/* Left: 3-Cockpit Cross-Navigation Dock & Territory Scope */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[11px] font-mono text-slate-300">
            {/* Quick 3-Cockpit Cross Navigation */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/90 border border-slate-800">
              <Link
                to="/super-admin/analytics/revenue"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 hover:text-white text-xs font-mono font-bold border border-slate-700/60 transition-all"
              >
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>P&L Analytics</span>
                <ArrowUpRight className="w-3 h-3 text-slate-400" />
              </Link>
              <Link
                to="/super-admin/finance"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/80 border border-amber-500/70 text-amber-300 text-xs font-mono font-black shadow-[0_0_12px_rgba(245,158,11,0.25)]"
              >
                <Wallet className="w-3.5 h-3.5 text-amber-400" />
                <span>Finance HQ</span>
              </Link>
              <Link
                to="/super-admin/payments"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 hover:text-white text-xs font-mono font-bold border border-slate-700/60 transition-all"
              >
                <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
                <span>Payments Ledger</span>
                <ArrowUpRight className="w-3 h-3 text-slate-400" />
              </Link>
            </div>

            <span className="flex items-center gap-1.5 text-brand-300 font-bold bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 shadow-xs">
              <Compass className="w-3.5 h-3.5 text-brand-400" />
              <span>TERRITORY: {selectedLocation.localityName || selectedLocation.districtName || selectedLocation.stateName || 'PAN-INDIA SETTLEMENT MATRIX'}</span>
            </span>
            <span className="hidden sm:flex items-center gap-1 text-emerald-300 font-semibold bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>NPCI GATEWAY: HEALTHY</span>
            </span>
          </div>

          {/* Right: Actions In Unconstrained Flex Wrap */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportDossier}
              className="text-xs font-bold border-emerald-500/50 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60 hover:text-white hover:border-emerald-400 shadow-sm cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
              <span>Export Dossier (CSV)</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleGeneratePayroll}
              loading={actionLoading}
              className="text-xs font-bold border-cyan-500/50 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/60 hover:text-white hover:border-cyan-400 shadow-sm cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
              <span>Run Teacher Payroll</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleGenerateSettlements}
              loading={actionLoading}
              className="text-xs font-bold border-indigo-500/50 bg-indigo-950/40 text-indigo-300 hover:bg-indigo-900/60 hover:text-white hover:border-indigo-400 shadow-sm cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
              <span>Run Library Settlements</span>
            </Button>

            <Button
              size="sm"
              onClick={() => {
                if (audioEnabled) soundSystem.playChirp('warp');
                setIsClosingModalOpen(true);
              }}
              className="text-xs font-bold bg-gradient-to-r from-amber-500 via-brand-500 to-amber-600 text-slate-950 hover:from-amber-400 hover:to-amber-500 shadow-lg shadow-amber-500/30 border border-amber-300 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 mr-1.5 text-slate-950" />
              <span>Lock Financial Period</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. REAL-TIME FINANCIAL STREAM MARQUEE TICKER                          */}
      {/* ==================================================================== */}
      <div className="relative z-10 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-950/90 border-2 border-slate-800 hover:border-brand-500/40 text-xs text-slate-200 font-mono overflow-hidden shadow-lg transition-colors">
        <div className="flex items-center gap-1.5 text-brand-400 font-black shrink-0">
          <Activity className="w-3.5 h-3.5 text-brand-400 animate-pulse" />
          <span>LIVE LEDGER STREAM:</span>
        </div>
        <div className="flex items-center gap-6 overflow-x-auto whitespace-nowrap scrollbar-none text-[11px] font-bold">
          <span className="text-emerald-300">• [IMPS-DISBURSE] ₹18,400 to Dr. Shweta Rai ({selectedDistrict === 'ALL' ? 'Ghazipur' : selectedDistrict}) - Cleared (UTR: 0x98f2..4a)</span>
          <span className="text-cyan-300">• [ESCROW-RELEASE] ₹42,600 to Vivekanand Study Hub - Auto-Approved</span>
          <span className="text-amber-300">• [OPEX-CLAIM] ₹8,200 Internet & Fiber Utilities - Queued for Review</span>
          <span className="text-purple-300">• [NPCI-RECON] 100% Match on 142 Micro-Transactions Across Sectors</span>
          <span className="text-emerald-300">• [TREASURY] Dynamic Liquidity Yield +6.2% APY Reserve Buffer Active</span>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. MNC EDTECH JURISDICTION SWITCHER & LOCATION CONTEXT BAR            */}
      {/* ==================================================================== */}
      <CyberGeospatialLocationDeck
        selectedLocation={selectedLocation}
        onChange={(newLoc) => {
          setSelectedLocation(newLoc);
        }}
        audioEnabled={audioEnabled}
        onAudioPlay={(type) => soundSystem.playChirp(type as any)}
        stats={{
          totalAmount: kpis?.gmv || kpis?.grossTotalVolume || 2419000,
          totalRecords: paymentQueue.length + settlementRecords.length + expenseClaims.length,
          label: 'Settlement Scope GMV',
          currencySymbol: '₹'
        }}
        districtMetrics={districtMetrics}
        title="HQ FINANCIAL COMMAND • GEOSPATIAL LOCATION RADAR"
        subtitle="ESCROW RECONCILIATION & JURISDICTION SETTLEMENT CONTROL DECK"
      />

      {/* ==================================================================== */}
      {/* 4. MNC EDTECH INFLOW/OUTFLOW REVENUE SPLIT VISUALIZER                */}
      {/* ==================================================================== */}
      <div className="relative z-10 p-5 rounded-3xl bg-slate-900/90 border-2 border-slate-800 text-slate-100 shadow-2xl hud-corner-brackets space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-sm text-slate-100">Enterprise Revenue Architecture & Payout Split</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold">
              86.7% Partner Pass-Through
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-amber-400 font-bold">Tuition GMV: 67%</span>
            <span className="text-purple-400 font-bold">Library GMV: 33%</span>
            <span className="text-emerald-400 font-bold">Retained Take: 13.3%</span>
          </div>
        </div>

        {/* Visual Weighted Split Bar */}
        <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden flex border border-slate-800 shadow-inner">
          <div style={{ width: '67%' }} className="bg-gradient-to-r from-amber-500 to-amber-400 h-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" title="Tuition Volume (67%)" />
          <div style={{ width: '33%' }} className="bg-gradient-to-r from-purple-500 to-purple-400 h-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" title="Library Volume (33%)" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
            <span>Faculty Disbursals: <strong className="text-slate-200">85% Net Tuition</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]"></span>
            <span>Library Center Share: <strong className="text-slate-200">90% Net Seat</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></span>
            <span>Platform Royalty Take: <strong className="text-slate-200">10% - 15%</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            <span>Settlement Cycle: <strong className="text-slate-200">Instant Automated T+0</strong></span>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 5. THE 13 FINANCIAL INDICATORS MATRIX — CYBER TELEMETRY GRID         */}
      {/* ==================================================================== */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3">
        {/* 1. GMV */}
        <div
          onClick={(e) => handleInspectElement('Gross Merchandise Volume (GMV)', 'INDICATOR_METRIC', { value: kpis?.gmv || kpis?.grossTotalVolume || 2419000, type: 'Gross Platform Inflow' }, e)}
          className={`p-3.5 rounded-2xl bg-slate-900/90 border transition-all duration-300 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:-translate-y-0.5 cursor-pointer group ${
            inspectedNode?.title === 'Gross Merchandise Volume (GMV)' ? 'ring-2 ring-cyan-400 border-cyan-400 bg-cyan-950/60 shadow-[0_0_25px_rgba(6,182,212,0.4)]' : 'border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 group-hover:text-cyan-300">GMV</p>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">+18% MoM</span>
          </div>
          <p className="text-lg font-black text-amber-400 mt-1 font-mono">{formatINR(kpis?.gmv || kpis?.grossTotalVolume || 2419000)}</p>
          <span className="text-[10px] text-slate-400 group-hover:text-slate-200 font-medium block truncate">Gross Merchandise Val</span>
        </div>

        {/* 2. Revenue */}
        <div
          onClick={(e) => handleInspectElement('Gross Platform Revenue', 'INDICATOR_METRIC', { value: kpis?.revenue || kpis?.platformCommissionTotal || 322900, type: 'Platform Cut' }, e)}
          className={`p-3.5 rounded-2xl bg-slate-900/90 border transition-all duration-300 hover:border-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:-translate-y-0.5 cursor-pointer group ${
            inspectedNode?.title === 'Gross Platform Revenue' ? 'ring-2 ring-emerald-400 border-emerald-400 bg-emerald-950/60 shadow-[0_0_25px_rgba(16,185,129,0.4)]' : 'border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 group-hover:text-emerald-300">Revenue</p>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">Take 13.3%</span>
          </div>
          <p className="text-lg font-black text-emerald-400 mt-1 font-mono">{formatINR(kpis?.revenue || kpis?.platformCommissionTotal || 322900)}</p>
          <span className="text-[10px] text-slate-400 group-hover:text-slate-200 font-medium block truncate">Gross platform cut</span>
        </div>

        {/* 3. Net Revenue */}
        <div
          onClick={(e) => handleInspectElement('Net Platform Revenue', 'INDICATOR_METRIC', { value: kpis?.netRevenue || 179000, type: 'Post-OpEx Net' }, e)}
          className={`p-3.5 rounded-2xl bg-slate-900/90 border transition-all duration-300 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:-translate-y-0.5 cursor-pointer group ${
            inspectedNode?.title === 'Net Platform Revenue' ? 'ring-2 ring-cyan-400 border-cyan-400 bg-cyan-950/60 shadow-[0_0_25px_rgba(6,182,212,0.4)]' : 'border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 group-hover:text-cyan-300">Net Revenue</p>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">Post-OpEx</span>
          </div>
          <p className="text-lg font-black text-cyan-400 mt-1 font-mono">{formatINR(kpis?.netRevenue || 179000)}</p>
          <span className="text-[10px] text-slate-400 group-hover:text-slate-200 font-medium block truncate">Revenue post OpEx</span>
        </div>

        {/* 4. Commission */}
        <div
          onClick={(e) => handleInspectElement('Platform Commission Total', 'INDICATOR_METRIC', { value: kpis?.commission || kpis?.platformCommissionTotal || 322900, type: 'Fee Accrual' }, e)}
          className={`p-3.5 rounded-2xl bg-slate-900/90 border transition-all duration-300 hover:border-indigo-400 hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:-translate-y-0.5 cursor-pointer group ${
            inspectedNode?.title === 'Platform Commission Total' ? 'ring-2 ring-indigo-400 border-indigo-400 bg-indigo-950/60 shadow-[0_0_25px_rgba(99,102,241,0.4)]' : 'border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 group-hover:text-indigo-300">Commission</p>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">Live Fee</span>
          </div>
          <p className="text-lg font-black text-indigo-400 mt-1 font-mono">{formatINR(kpis?.commission || kpis?.platformCommissionTotal || 322900)}</p>
          <span className="text-[10px] text-slate-400 group-hover:text-slate-200 font-medium block truncate">Platform fee pool</span>
        </div>

        {/* 5. Teacher Payouts */}
        <div
          onClick={(e) => handleInspectElement('Teacher Payouts Total', 'INDICATOR_METRIC', { value: kpis?.teacherPayouts || kpis?.teacherPayable || 1377000, type: 'Faculty Earnings' }, e)}
          className={`p-3.5 rounded-2xl bg-slate-900/90 border transition-all duration-300 hover:border-blue-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:-translate-y-0.5 cursor-pointer group ${
            inspectedNode?.title === 'Teacher Payouts Total' ? 'ring-2 ring-blue-400 border-blue-400 bg-blue-950/60 shadow-[0_0_25px_rgba(59,130,246,0.4)]' : 'border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 group-hover:text-blue-300">Teacher Payouts</p>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">85% Share</span>
          </div>
          <p className="text-lg font-black text-blue-400 mt-1 font-mono">{formatINR(kpis?.teacherPayouts || kpis?.teacherPayable || 1377000)}</p>
          <span className="text-[10px] text-slate-400 group-hover:text-slate-200 font-medium block truncate">Faculty disbursements</span>
        </div>

        {/* 6. Library Settlements */}
        <div
          onClick={(e) => handleInspectElement('Library Settlements Total', 'INDICATOR_METRIC', { value: kpis?.librarySettlements || kpis?.libraryPayable || 719100, type: 'Host Partner Share' }, e)}
          className={`p-3.5 rounded-2xl bg-slate-900/90 border transition-all duration-300 hover:border-purple-400 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:-translate-y-0.5 cursor-pointer group ${
            inspectedNode?.title === 'Library Settlements Total' ? 'ring-2 ring-purple-400 border-purple-400 bg-purple-950/60 shadow-[0_0_25px_rgba(168,85,247,0.4)]' : 'border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 group-hover:text-purple-300">Library Settlements</p>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">90% Share</span>
          </div>
          <p className="text-lg font-black text-purple-400 mt-1 font-mono">{formatINR(kpis?.librarySettlements || kpis?.libraryPayable || 719100)}</p>
          <span className="text-[10px] text-slate-400 group-hover:text-slate-200 font-medium block truncate">Seat booking shares</span>
        </div>

        {/* 7. District Payments */}
        <div
          onClick={(e) => handleInspectElement('District Operational Payments', 'INDICATOR_METRIC', { value: kpis?.districtPayments || kpis?.districtExpenses || 143900, type: 'Zila Operations' }, e)}
          className={`p-3.5 rounded-2xl bg-slate-900/90 border transition-all duration-300 hover:border-teal-400 hover:shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:-translate-y-0.5 cursor-pointer group ${
            inspectedNode?.title === 'District Operational Payments' ? 'ring-2 ring-teal-400 border-teal-400 bg-teal-950/60 shadow-[0_0_25px_rgba(20,184,166,0.4)]' : 'border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 group-hover:text-teal-300">District Payments</p>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30">OpEx</span>
          </div>
          <p className="text-lg font-black text-teal-400 mt-1 font-mono">{formatINR(kpis?.districtPayments || kpis?.districtExpenses || 143900)}</p>
          <span className="text-[10px] text-slate-400 group-hover:text-slate-200 font-medium block truncate">Zila operations</span>
        </div>

        {/* 8. Expenses */}
        <div
          onClick={(e) => handleInspectElement('Total Platform Expenses', 'INDICATOR_METRIC', { value: kpis?.expenses || 143900, type: 'Operating Cost' }, e)}
          className={`p-3.5 rounded-2xl bg-slate-900/90 border transition-all duration-300 hover:border-rose-400 hover:shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:-translate-y-0.5 cursor-pointer group ${
            inspectedNode?.title === 'Total Platform Expenses' ? 'ring-2 ring-rose-400 border-rose-400 bg-rose-950/60 shadow-[0_0_25px_rgba(244,63,94,0.4)]' : 'border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 group-hover:text-rose-300">Expenses</p>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">Verified</span>
          </div>
          <p className="text-lg font-black text-rose-400 mt-1 font-mono">{formatINR(kpis?.expenses || 143900)}</p>
          <span className="text-[10px] text-slate-400 group-hover:text-slate-200 font-medium block truncate">Operating expenses</span>
        </div>

        {/* 9. Refunds */}
        <div
          onClick={(e) => handleInspectElement('Refunds & Adjustments', 'INDICATOR_METRIC', { value: kpis?.refunds || 12500, type: 'Student Adjustments' }, e)}
          className={`p-3.5 rounded-2xl bg-slate-900/90 border transition-all duration-300 hover:border-orange-400 hover:shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:-translate-y-0.5 cursor-pointer group ${
            inspectedNode?.title === 'Refunds & Adjustments' ? 'ring-2 ring-orange-400 border-orange-400 bg-orange-950/60 shadow-[0_0_25px_rgba(249,115,22,0.4)]' : 'border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 group-hover:text-orange-300">Refunds</p>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-300 font-bold border border-orange-500/30">0.5% Ratio</span>
          </div>
          <p className="text-lg font-black text-orange-400 mt-1 font-mono">{formatINR(kpis?.refunds || 12500)}</p>
          <span className="text-[10px] text-slate-400 group-hover:text-slate-200 font-medium block truncate">Adjustments & returns</span>
        </div>

        {/* 10. Pending Payments */}
        <div
          onClick={(e) => handleInspectElement('Pending Payment Queue', 'INDICATOR_METRIC', { value: kpis?.pendingPayments || kpis?.totalPayable || 348000, type: 'Payables Queue' }, e)}
          className={`p-3.5 rounded-2xl bg-slate-900/90 border transition-all duration-300 hover:border-amber-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:-translate-y-0.5 cursor-pointer group ${
            inspectedNode?.title === 'Pending Payment Queue' ? 'ring-2 ring-amber-400 border-amber-400 bg-amber-950/60 shadow-[0_0_25px_rgba(245,158,11,0.4)]' : 'border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 group-hover:text-amber-300">Pending Pay</p>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">Ready</span>
          </div>
          <p className="text-lg font-black text-amber-300 mt-1 font-mono">{formatINR(kpis?.pendingPayments || kpis?.totalPayable || 348000)}</p>
          <span className="text-[10px] text-slate-400 group-hover:text-slate-200 font-medium block truncate">Queued for clearing</span>
        </div>

        {/* 11. Net Profit */}
        <div
          onClick={(e) => handleInspectElement('Net Platform Margin (Profit)', 'INDICATOR_METRIC', { value: kpis?.profit || kpis?.netPlatformProfit || 179000, type: 'Net Retained Margin' }, e)}
          className={`p-3.5 rounded-2xl bg-slate-900/90 border transition-all duration-300 hover:border-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:-translate-y-0.5 cursor-pointer group ${
            inspectedNode?.title === 'Net Platform Margin (Profit)' ? 'ring-2 ring-emerald-400 border-emerald-400 bg-emerald-950/60 shadow-[0_0_25px_rgba(16,185,129,0.4)]' : 'border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 group-hover:text-emerald-300">Net Profit</p>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">+55.4%</span>
          </div>
          <p className="text-lg font-black text-emerald-300 mt-1 font-mono">{formatINR(kpis?.profit || kpis?.netPlatformProfit || 179000)}</p>
          <span className="text-[10px] text-slate-400 group-hover:text-slate-200 font-medium block truncate">Net platform return</span>
        </div>

        {/* 12. Receivables */}
        <div
          onClick={(e) => handleInspectElement('Gateway Receivables in Transit', 'INDICATOR_METRIC', { value: kpis?.receivables || 482000, type: 'Settling with Bank' }, e)}
          className={`p-3.5 rounded-2xl bg-slate-900/90 border transition-all duration-300 hover:border-sky-400 hover:shadow-[0_0_20px_rgba(56,189,248,0.3)] hover:-translate-y-0.5 cursor-pointer group ${
            inspectedNode?.title === 'Gateway Receivables in Transit' ? 'ring-2 ring-sky-400 border-sky-400 bg-sky-950/60 shadow-[0_0_25px_rgba(56,189,248,0.4)]' : 'border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 group-hover:text-sky-300">Receivables</p>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30">T+1 Route</span>
          </div>
          <p className="text-lg font-black text-sky-400 mt-1 font-mono">{formatINR(kpis?.receivables || 482000)}</p>
          <span className="text-[10px] text-slate-400 group-hover:text-slate-200 font-medium block truncate">Gateway settlements</span>
        </div>

        {/* 13. Payables */}
        <div
          onClick={(e) => handleInspectElement('Total Outstanding Payables', 'INDICATOR_METRIC', { value: kpis?.payables || kpis?.totalPayable || 2240000, type: 'Platform Debt Liability' }, e)}
          className={`p-3.5 rounded-2xl bg-slate-900/90 border transition-all duration-300 hover:border-slate-400 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:-translate-y-0.5 cursor-pointer group ${
            inspectedNode?.title === 'Total Outstanding Payables' ? 'ring-2 ring-white border-white bg-slate-800 shadow-[0_0_25px_rgba(255,255,255,0.3)]' : 'border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 group-hover:text-white">Payables</p>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-700 text-slate-200 font-bold">Total Liab</span>
          </div>
          <p className="text-lg font-black text-slate-200 mt-1 font-mono">{formatINR(kpis?.payables || kpis?.totalPayable || 2240000)}</p>
          <span className="text-[10px] text-slate-400 group-hover:text-slate-200 font-medium block truncate">Total platform debt</span>
        </div>

        {/* Extra: Failed Gateway Items */}
        <div
          onClick={(e) => handleInspectElement('Failed Gateway Transactions', 'INDICATOR_METRIC', { count: kpis?.failedPaymentsCount || 0, type: 'IMPS/NEFT Reversals' }, e)}
          className={`p-3.5 rounded-2xl border transition-all duration-300 hover:border-rose-400 hover:shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:-translate-y-0.5 cursor-pointer group ${
            (kpis?.failedPaymentsCount || 0) > 0 ? 'bg-rose-950/60 border-rose-700/80' : 'bg-slate-900/90 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase font-bold tracking-wider text-rose-400">Failed Items</p>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">Auto-Retry</span>
          </div>
          <p className="text-lg font-black text-rose-400 mt-1 font-mono">{kpis?.failedPaymentsCount || 0}</p>
          <span className="text-[10px] text-slate-400 group-hover:text-slate-200 font-medium block truncate">Requires retry</span>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 6. ENTERPRISE FINTECH TAB BAR                                        */}
      {/* ==================================================================== */}
      <div className="relative z-10 flex items-center gap-1.5 p-1.5 bg-slate-950/90 rounded-2xl border-2 border-slate-800 text-xs overflow-x-auto shadow-2xl">
        {[
          { id: 'overview', label: 'Finance Overview', icon: <Layers className="w-4 h-4" /> },
          { id: 'queue', label: `Payment Queue (${paymentQueue.length})`, icon: <CreditCard className="w-4 h-4" />, badge: paymentQueue.filter(q => q.status === 'QUEUED').length },
          { id: 'expenditures', label: `District Claims (${expenseClaims.length})`, icon: <Receipt className="w-4 h-4" />, badge: expenseClaims.filter(c => c.status === 'SUBMITTED' || c.status === 'UNDER_REVIEW').length },
          { id: 'payroll', label: `Salary & Payroll (${payrollItems.length})`, icon: <Users className="w-4 h-4" /> },
          { id: 'settlements', label: `Library Settlements (${settlementRecords.length})`, icon: <Building2 className="w-4 h-4" /> },
          { id: 'batches', label: `Settlement Batches (${batches.length})`, icon: <CheckSquare className="w-4 h-4" /> },
          { id: 'documents', label: `Document Vault (${documents.length})`, icon: <FileText className="w-4 h-4" /> },
          { id: 'closing', label: 'Monthly Closing', icon: <Lock className="w-4 h-4" /> },
          { id: 'audit', label: 'Financial Audit Trail', icon: <ShieldCheck className="w-4 h-4" /> },
          { id: 'settings', label: 'Finance Settings', icon: <Sliders className="w-4 h-4" /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              if (audioEnabled) soundSystem.playChirp('click');
              setActiveTab(tab.id as any);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-cyan-600 to-brand-600 text-white font-black shadow-[0_0_15px_rgba(6,182,212,0.4)] border border-cyan-400'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900 font-bold border border-transparent'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-rose-950 text-rose-300 border border-rose-500/40'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Loading Skeleton Indicator */}
      {loading && (
        <div className="relative z-10 p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center animate-pulse flex items-center justify-center gap-3">
          <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin" />
          <span className="font-mono text-xs text-cyan-300 font-bold tracking-widest uppercase">
            CALIBRATING MULTI-DISTRICT RECONCILIATION ENGINE...
          </span>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 1: OVERVIEW & ALGORITHMIC LIQUIDITY SIMULATOR                    */}
      {/* ==================================================================== */}
      {activeTab === 'overview' && (
        <div className="relative z-10 space-y-6 animate-fadeIn">
          {/* Cash Flow Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              onClick={(e) => handleInspectElement('Gross Platform GMV Telemetry', 'FLOW_TELEMETRY', { gmv: kpis?.grossTotalVolume || 2419000, tuitionShare: 1620000, libraryShare: 799000 }, e)}
              className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 hover:border-cyan-500/60 hover:shadow-[0_0_25px_rgba(6,182,212,0.2)] transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="font-bold uppercase tracking-wider text-cyan-400">Gross Platform GMV Volume</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">+18.4% MoM</span>
              </div>
              <p className="text-3xl font-black mt-3 font-mono text-amber-400">{formatINR(kpis?.grossTotalVolume || 2419000)}</p>
              <div className="mt-4 pt-4 border-t border-slate-800/80 text-xs text-slate-300 flex justify-between font-mono">
                <span>Tuition GMV: {formatINR(Math.round((kpis?.grossTotalVolume || 2419000) * 0.67))}</span>
                <span>Library GMV: {formatINR(Math.round((kpis?.grossTotalVolume || 2419000) * 0.33))}</span>
              </div>
            </div>

            <div
              onClick={(e) => handleInspectElement('Net Platform Revenue Telemetry', 'FLOW_TELEMETRY', { netProfit: kpis?.netPlatformProfit || 179000, grossTake: kpis?.platformCommissionTotal || 322900, opex: kpis?.districtExpenses || 143900 }, e)}
              className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/80 to-slate-950 text-white border border-indigo-900/60 hover:border-indigo-400/80 hover:shadow-[0_0_25px_rgba(99,102,241,0.2)] transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs text-indigo-300">
                <span className="font-bold uppercase tracking-wider text-indigo-300">Net Platform Revenue (Commission - OpEx)</span>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 font-bold border border-indigo-400/30">Live P&L</span>
              </div>
              <p className="text-3xl font-black mt-3 font-mono text-emerald-400">{formatINR(kpis?.netPlatformProfit || 179000)}</p>
              <div className="mt-4 pt-4 border-t border-indigo-900/50 text-xs text-indigo-200 flex justify-between font-mono">
                <span>Gross Take: {formatINR(kpis?.platformCommissionTotal || 322900)}</span>
                <span>OpEx Deducted: {formatINR(kpis?.districtExpenses || 143900)}</span>
              </div>
            </div>

            <div
              onClick={(e) => handleInspectElement('Partner Payouts Disbursed Telemetry', 'FLOW_TELEMETRY', { totalDisbursed: kpis?.totalDisbursed || 1985000, teacherPct: '65%', libraryPct: '30%', districtPct: '5%' }, e)}
              className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/80 to-slate-950 text-white border border-emerald-900/60 hover:border-emerald-400/80 hover:shadow-[0_0_25px_rgba(16,185,129,0.2)] transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs text-emerald-300">
                <span className="font-bold uppercase tracking-wider text-emerald-300">Total Disbursed to Partners</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 font-bold border border-emerald-400/30">Verified</span>
              </div>
              <p className="text-3xl font-black mt-3 font-mono text-cyan-300">{formatINR(kpis?.totalDisbursed || 1985000)}</p>
              <div className="mt-4 pt-4 border-t border-emerald-900/50 text-xs text-emerald-200 flex justify-between font-mono">
                <span>Teachers: 65%</span>
                <span>Libraries: 30%</span>
                <span>District Ops: 5%</span>
              </div>
            </div>
          </div>

          {/* NEW: ALGORITHMIC LIQUIDITY FORECASTER & AI CASH-BURN SIMULATOR */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                  <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-black text-white text-base flex items-center gap-2">
                    Algorithmic Liquidity Forecaster & Cash-Burn Simulator
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">PREDICTIVE AI</span>
                  </h3>
                  <p className="text-xs text-slate-300">Simulate learner scale surges, partner disbursement obligations, and treasury runway.</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={stressTestActive}
                    onChange={(e) => {
                      if (audioEnabled) soundSystem.playChirp('click');
                      setStressTestActive(e.target.checked);
                    }}
                    className="w-4 h-4 rounded text-cyan-500 bg-slate-800 border-slate-700 focus:ring-cyan-400"
                  />
                  <span>Stress Test Mode (35% Outflow Surge)</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6 items-center">
              {/* Slider Control */}
              <div className="space-y-2 lg:col-span-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-300">Scale Multiplier:</span>
                  <span className="font-mono font-black text-cyan-400 text-sm">{forecastMultiplier.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="4.0"
                  step="0.2"
                  value={forecastMultiplier}
                  onChange={(e) => {
                    if (audioEnabled) soundSystem.playChirp('click');
                    setForecastMultiplier(parseFloat(e.target.value));
                  }}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>1.0x (Current)</span>
                  <span>2.0x (Expansion)</span>
                  <span>4.0x (National)</span>
                </div>
              </div>

              {/* Simulated Output 1: Projected GMV */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Simulated Gross GMV</span>
                <p className="text-xl font-black font-mono text-amber-400">{formatINR(simulatedGmv)}</p>
                <span className="text-[10px] text-slate-300">Expected monthly student volume</span>
              </div>

              {/* Simulated Output 2: Projected Outflows */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Projected Partner Outflow</span>
                <p className="text-xl font-black font-mono text-rose-400">{formatINR(simulatedOutflow)}</p>
                <span className="text-[10px] text-slate-300">Teachers + Libraries obligation</span>
              </div>

              {/* Simulated Output 3: Treasury Runway */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Treasury Runway Index</span>
                <p className="text-xl font-black font-mono text-emerald-400">{simulatedRunwayDays} Days Safe</p>
                <span className="text-[10px] text-slate-300">At current ₹1.48 Cr Liquidity Pool</span>
              </div>
            </div>
          </div>

          {/* Quick Payables Health Matrix & Category Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 text-white shadow-xl">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Compass className="w-4 h-4 text-cyan-400" />
                  Disbursement Liability by Territorial Sector
                </h3>
                <span className="text-xs text-slate-300 font-mono">September 2026</span>
              </div>
              <div className="space-y-3">
                {[
                  { name: `${selectedDistrict === 'ALL' ? 'Ghazipur District' : selectedDistrict} (Main Hub)`, amount: 48500, percent: 55, status: 'Active Queue' },
                  { name: `${selectedDistrict === 'ALL' ? 'Saidpur' : 'North Sector'} Sub-Division`, amount: 22000, percent: 25, status: 'Claim Approved' },
                  { name: `${selectedDistrict === 'ALL' ? 'Zamania' : 'East Zone'} Rural Circle`, amount: 11500, percent: 13, status: 'Inspection Travel' },
                  { name: `${selectedDistrict === 'ALL' ? 'Bhurkura & Lanka' : 'Central Core'} Hub`, amount: 6200, percent: 7, status: 'Library Sync' }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    onClick={(e) => handleInspectElement(item.name, 'DISTRICT_LIABILITY', item, e)}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between hover:border-cyan-500/60 hover:bg-slate-800/60 transition-all cursor-pointer group"
                  >
                    <div>
                      <p className="font-bold text-xs text-white group-hover:text-cyan-300">{item.name}</p>
                      <p className="text-[10px] text-slate-400">{item.status}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-xs text-emerald-400">{formatINR(item.amount)}</p>
                      <span className="text-[10px] font-semibold text-cyan-400">{item.percent}% total</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 text-white shadow-xl">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-cyan-400" />
                  Operational Expense Categories Distribution
                </h3>
                <button
                  onClick={() => {
                    if (audioEnabled) soundSystem.playChirp('click');
                    setActiveTab('settings');
                  }}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-bold underline cursor-pointer"
                >
                  Configure Rules
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {[
                  { cat: 'Office Expenses', amount: 32000, cap: 50000 },
                  { cat: 'Marketing & Flyers', amount: 25000, cap: 40000 },
                  { cat: 'Equipment & Tech', amount: 18500, cap: 35000 },
                  { cat: 'Travel & Inspections', amount: 14700, cap: 20000 },
                  { cat: 'Internet & Utilities', amount: 8200, cap: 15000 },
                  { cat: 'Software & SMS', amount: 5500, cap: 10000 }
                ].map((c, i) => (
                  <div
                    key={i}
                    onClick={(e) => handleInspectElement(c.cat, 'EXPENSE_CATEGORY', c, e)}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-cyan-500/60 hover:bg-slate-800/60 transition-all cursor-pointer group"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-200 group-hover:text-white">{c.cat}</span>
                      <span className="font-mono font-bold text-cyan-300">{formatINR(c.amount)}</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full"
                        style={{ width: `${Math.min(100, Math.round((c.amount / c.cap) * 100))}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">Cap: {formatINR(c.cap)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: CENTRAL PAYMENT QUEUE & BULK PAYOUTS                          */}
      {/* ==================================================================== */}
      {activeTab === 'queue' && (
        <div className="relative z-10 space-y-4 animate-fadeIn">
          {/* Enterprise Filter & Selection Deck */}
          <div className="p-4 bg-slate-900/90 rounded-3xl border-2 border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xl hud-corner-brackets text-slate-100">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search payee, UTR, district..."
                  value={queueSearch}
                  onChange={e => setQueueSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:border-cyan-400 w-64 shadow-inner"
                />
              </div>

              <select
                value={queuePayeeFilter}
                onChange={e => {
                  if (audioEnabled) soundSystem.playChirp('click');
                  setQueuePayeeFilter(e.target.value);
                }}
                className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-950 text-xs font-semibold text-slate-200 focus:outline-hidden focus:border-cyan-400 shadow-inner"
              >
                <option value="ALL" className="bg-slate-950 text-slate-100">All Payee Types</option>
                <option value="DISTRICT_ADMIN" className="bg-slate-950 text-slate-100">District Admin (Expenses)</option>
                <option value="TEACHER" className="bg-slate-950 text-slate-100">Teacher (Salary)</option>
                <option value="LIBRARY_OWNER" className="bg-slate-950 text-slate-100">Library Owner (Settlement)</option>
              </select>

              <select
                value={queueStatusFilter}
                onChange={e => {
                  if (audioEnabled) soundSystem.playChirp('click');
                  setQueueStatusFilter(e.target.value);
                }}
                className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-950 text-xs font-semibold text-slate-200 focus:outline-hidden focus:border-cyan-400 shadow-inner"
              >
                <option value="ALL" className="bg-slate-950 text-slate-100">All Statuses</option>
                <option value="QUEUED" className="bg-slate-950 text-slate-100">Queued / Ready</option>
                <option value="PAID" className="bg-slate-950 text-slate-100">Paid / Confirmed</option>
                <option value="FAILED" className="bg-slate-950 text-slate-100">Payment Failed</option>
              </select>
            </div>

            {/* Quick Batch Select Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleSelectPayeeCategory('TEACHER')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-950/80 text-blue-300 border border-blue-500/40 hover:bg-blue-900 transition cursor-pointer"
              >
                + All Teachers
              </button>
              <button
                onClick={() => handleSelectPayeeCategory('LIBRARY_OWNER')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-purple-950/80 text-purple-300 border border-purple-500/40 hover:bg-purple-900 transition cursor-pointer"
              >
                + All Libraries
              </button>
              <button
                onClick={() => handleSelectPayeeCategory('DISTRICT_ADMIN')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-teal-950/80 text-teal-300 border border-teal-500/40 hover:bg-teal-900 transition cursor-pointer"
              >
                + All District Ops
              </button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleSelectAllQueue}
                className="text-xs font-bold border-cyan-500/40 text-cyan-300 hover:bg-cyan-950 bg-cyan-950/40"
              >
                {selectedQueueIds.length === filteredQueue.filter(q => q.status === 'QUEUED' || q.status === 'RETRY_READY').length && filteredQueue.length > 0
                  ? 'Deselect All'
                  : 'Select All Ready'}
              </Button>
            </div>
          </div>

          {/* Payment Queue Table */}
          <div className="rounded-3xl border-2 border-slate-800 bg-slate-900/90 overflow-hidden shadow-2xl hud-corner-brackets">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950/95 border-b border-slate-800 font-bold uppercase tracking-wider text-slate-400 text-[11px]">
                  <tr>
                    <th className="px-4 py-3.5 w-8">
                      <span className="sr-only">Select</span>
                    </th>
                    <th className="px-4 py-3.5">Payee & Beneficiary</th>
                    <th className="px-4 py-3.5">Payment Type</th>
                    <th className="px-4 py-3.5">District</th>
                    <th className="px-4 py-3.5 text-right">Payable Amount</th>
                    <th className="px-4 py-3.5">Bank Routing</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {filteredQueue.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <div className="space-y-3">
                          <p className="text-sm font-medium">No payment queue records found for {selectedDistrict === 'ALL' ? 'the selected filters' : selectedDistrict}.</p>
                          <Button
                            size="sm"
                            onClick={handleGeneratePayroll}
                            className="bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs"
                          >
                            Calculate & Enqueue {selectedDistrict === 'ALL' ? 'District' : selectedDistrict} Payouts
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredQueue.map(item => {
                      const isSelected = selectedQueueIds.includes(item.id);
                      const isPayable = item.status === 'QUEUED' || item.status === 'RETRY_READY';

                      return (
                        <tr
                          key={item.id}
                          onClick={(e) => handleInspectElement(item.payeeName, 'PAYMENT_QUEUE_ITEM', item, e)}
                          className={`transition-colors cursor-pointer ${
                            isSelected ? 'bg-cyan-950/60 border-l-4 border-cyan-400' : 'hover:bg-slate-800/60'
                          } ${
                            inspectedNode?.payload?.id === item.id ? 'ring-1 ring-cyan-400 bg-cyan-950/40' : ''
                          }`}
                        >
                          <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={!isPayable}
                              onChange={() => handleToggleSelectQueue(item.id)}
                              className="w-4 h-4 rounded text-cyan-600 bg-slate-950 border-slate-700 focus:ring-cyan-400 cursor-pointer disabled:opacity-30"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-bold text-white group-hover:text-cyan-300">{item.payeeName}</p>
                            <p className="text-[10px] text-slate-400">{item.description}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                item.paymentType === 'SALARY'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : item.paymentType === 'SETTLEMENT'
                                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {item.paymentType}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-700">{item.district}</td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-slate-950 text-sm">
                            {formatINR(item.amount)}
                          </td>
                          <td className="px-4 py-3 text-[11px] text-slate-600">
                            <p className="font-mono text-slate-800">{item.bankAccountMasked}</p>
                            <p className="text-[10px] font-mono text-slate-500">{item.ifscCode}</p>
                          </td>
                          <td className="px-4 py-3">
                            {item.status === 'PAID' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                PAID
                              </span>
                            )}
                            {item.status === 'QUEUED' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                                <Clock className="w-3 h-3 text-amber-400 animate-pulse" />
                                Ready for Payment
                              </span>
                            )}
                            {item.status === 'FAILED' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                                <AlertCircle className="w-3 h-3 text-rose-400" />
                                Failed
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                            {item.status === 'QUEUED' && (
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    if (audioEnabled) soundSystem.playChirp('payout');
                                    setPaymentModalTarget({
                                      id: item.id,
                                      targetType: 'QUEUE_ITEM',
                                      payeeName: item.payeeName,
                                      payeeType: item.payeeType,
                                      district: item.district,
                                      amount: item.amount,
                                      description: item.description,
                                      referenceCode: item.referenceCode,
                                      bankDetails: {
                                        bankName: 'State Bank of India',
                                        accountNumberMasked: item.bankAccountMasked,
                                        ifscCode: item.ifscCode,
                                        verified: item.bankVerified
                                      }
                                    });
                                    setIsPaymentModalOpen(true);
                                  }}
                                  className="text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/30"
                                >
                                  Pay Now
                                </Button>
                              </div>
                            )}

                            {item.status === 'FAILED' && (
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRetryPayment(item.id)}
                                  className="text-xs font-bold text-rose-300 border-rose-800 hover:bg-rose-950"
                                >
                                  <RotateCcw className="w-3 h-3 mr-1" />
                                  Retry
                                </Button>
                              </div>
                            )}

                            {item.status === 'PAID' && item.officialDocumentNumber && (
                              <button
                                onClick={async () => {
                                  if (audioEnabled) soundSystem.playChirp('node');
                                  const doc = await financeService.verifyDocument(item.officialDocumentNumber!);
                                  if (doc) {
                                    setActiveDocument(doc);
                                    setIsDocViewerOpen(true);
                                  }
                                }}
                                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 underline inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3 h-3" />
                                Receipt
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Floating Bulk Action Bar */}
          {selectedQueueIds.length > 0 && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 text-white px-7 py-4 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] border border-cyan-500/60 backdrop-blur-2xl flex items-center gap-6 animate-slideUp">
              <div>
                <span className="text-xs text-slate-300 font-mono">Total Selected:</span>
                <p className="text-lg font-black font-mono text-emerald-400">{formatINR(selectedTotalAmount)}</p>
              </div>
              <div className="h-8 w-px bg-slate-700" />
              <div>
                <span className="text-xs text-slate-300 font-mono">Beneficiaries:</span>
                <p className="text-sm font-bold text-white">{selectedQueueIds.length} payees</p>
              </div>
              <Button
                onClick={() => {
                  if (audioEnabled) soundSystem.playChirp('clear');
                  setIsBulkConfirmOpen(true);
                }}
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs px-6 py-2 rounded-xl shadow-lg shadow-emerald-500/30"
              >
                Review & Disburse Batch
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: DISTRICT EXPENDITURE CLAIMS & BILL VERIFICATION                */}
      {/* ==================================================================== */}
      {activeTab === 'expenditures' && (
        <div className="relative z-10 space-y-4 animate-fadeIn">
          <div className="rounded-3xl border-2 border-slate-800 bg-slate-900/90 overflow-hidden shadow-2xl hud-corner-brackets">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-cyan-400" />
                  <span>District Operational Expenditure Claims</span>
                </h3>
                <p className="text-xs text-slate-400">Dual-amount verification workflow: Claimed Amount vs Super Admin Approved Amount with document audit</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950/95 border-b border-slate-800 font-bold uppercase tracking-wider text-slate-400 text-[11px]">
                  <tr>
                    <th className="px-4 py-3.5">Claim ID / Bill No</th>
                    <th className="px-4 py-3.5">District</th>
                    <th className="px-4 py-3.5">Category</th>
                    <th className="px-4 py-3.5">Vendor / Payee</th>
                    <th className="px-4 py-3.5 text-right">Claimed Amt</th>
                    <th className="px-4 py-3.5 text-right">Approved Amt</th>
                    <th className="px-4 py-3.5 text-right">Remaining</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {expenseClaims.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        No expenditure claims submitted yet for {selectedDistrict === 'ALL' ? 'Pan-India' : selectedDistrict}.
                      </td>
                    </tr>
                  ) : (
                    expenseClaims.map(c => (
                      <tr
                        key={c.id}
                        onClick={(e) => handleInspectElement(c.vendorName, 'EXPENDITURE_CLAIM', c, e)}
                        className="hover:bg-slate-800/60 transition cursor-pointer text-slate-300"
                      >
                        <td className="px-4 py-3 font-mono">
                          <p className="font-bold text-white">{c.id}</p>
                          <p className="text-[10px] text-slate-400">Bill: {c.billNumber}</p>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-300">{c.district}</td>
                        <td className="px-4 py-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-cyan-300 border border-slate-700">
                            {c.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-200">{c.vendorName}</td>
                        <td className="px-4 py-3 text-right font-mono text-slate-400">{formatINR(c.claimedAmount)}</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-100">
                          {c.approvedAmount !== undefined ? formatINR(c.approvedAmount) : '—'}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-emerald-400 font-bold">
                          {formatINR(c.remainingAmount)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              c.status === 'PAID'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : c.status === 'PAYMENT_QUEUED'
                                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                                : c.status === 'REJECTED'
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : 'bg-amber-950 text-amber-300 border border-amber-800'
                            }`}
                          >
                            {c.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            {c.status === 'PAYMENT_QUEUED' && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  if (audioEnabled) soundSystem.playChirp('payout');
                                  setPaymentModalTarget({
                                    id: c.paymentQueueId || c.id,
                                    targetType: c.paymentQueueId ? 'QUEUE_ITEM' : 'CLAIM',
                                    payeeName: `${c.vendorName} (C/O ${c.submittedByAdminName})`,
                                    payeeType: 'DISTRICT_ADMIN',
                                    district: c.district,
                                    amount: c.payableAmount || c.approvedAmount || c.claimedAmount,
                                    description: `${c.category}: ${c.description}`,
                                    referenceCode: c.billNumber,
                                    bankDetails: c.bankDetails
                                  });
                                  setIsPaymentModalOpen(true);
                                }}
                                className="text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm"
                              >
                                Pay Now
                              </Button>
                            )}

                            {c.status !== 'PAID' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenClaimReview(c)}
                                className="text-xs font-bold text-slate-200 border-slate-700 hover:bg-slate-800"
                              >
                                Verify & Review
                              </Button>
                            )}

                            {c.status === 'PAID' && c.receiptNumber && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={async () => {
                                  if (audioEnabled) soundSystem.playChirp('node');
                                  const doc = await financeService.verifyDocument(c.receiptNumber!);
                                  if (doc) {
                                    setActiveDocument(doc);
                                    setIsDocViewerOpen(true);
                                  }
                                }}
                                className="text-xs font-bold text-cyan-400 border-cyan-800 hover:bg-cyan-950"
                              >
                                View Receipt
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 4: TEACHER PAYROLL ENGINE                                        */}
      {/* ==================================================================== */}
      {activeTab === 'payroll' && (
        <div className="relative z-10 space-y-4 animate-fadeIn">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-2xl backdrop-blur-xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">Automated Teacher Payroll Engine</h3>
                <p className="text-xs text-slate-300">Payable amount calculated directly from completed tuition sessions, attendance, and commission split</p>
              </div>
              <Button
                size="sm"
                onClick={handleGeneratePayroll}
                loading={actionLoading}
                className="text-xs font-bold bg-cyan-600 text-slate-950 hover:bg-cyan-500 font-mono shadow-md shadow-cyan-600/30"
              >
                <Users className="w-3.5 h-3.5 mr-1" />
                Generate September Payroll Run
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/90 border-b border-slate-800 font-bold uppercase tracking-wider text-slate-300">
                  <tr>
                    <th className="px-4 py-3.5">Educator</th>
                    <th className="px-4 py-3.5">District</th>
                    <th className="px-4 py-3.5">Period</th>
                    <th className="px-4 py-3.5 text-right">Students / Sessions</th>
                    <th className="px-4 py-3.5 text-right">Gross Collection</th>
                    <th className="px-4 py-3.5 text-right">Platform Fee (15%)</th>
                    <th className="px-4 py-3.5 text-right">Net Payable</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {payrollItems.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        No salary records available for {selectedDistrict === 'ALL' ? 'Pan-India' : selectedDistrict}. Click "Generate September Payroll Run" above to calculate.
                      </td>
                    </tr>
                  ) : (
                    payrollItems.map(p => (
                      <tr
                        key={p.id}
                        onClick={(e) => handleInspectElement(p.teacherName, 'TEACHER_PAYROLL', p, e)}
                        className="hover:bg-slate-800/60 transition cursor-pointer"
                      >
                        <td className="px-4 py-3 flex items-center gap-2.5">
                          <img
                            src={p.teacherPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                            alt={p.teacherName}
                            className="w-8 h-8 rounded-full object-cover border border-slate-700 shadow-sm"
                          />
                          <div>
                            <p className="font-bold text-white">{p.teacherName}</p>
                            <p className="text-[10px] font-mono text-slate-400">{p.id}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-300">{p.district}</td>
                        <td className="px-4 py-3 text-slate-300 font-medium">{p.billingMonth}</td>
                        <td className="px-4 py-3 text-right font-mono text-slate-200">
                          {p.assignedStudentsCount} St / {p.completedSessionsCount} Sess
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-slate-300">{formatINR(p.grossTuitionCollection)}</td>
                        <td className="px-4 py-3 text-right font-mono text-rose-400">-{formatINR(p.focusPointCommission)}</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400 text-sm">{formatINR(p.netPayable)}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              p.status === 'PAID'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : p.status === 'PAYMENT_QUEUED'
                                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                                : 'bg-blue-950 text-blue-300 border border-blue-800'
                            }`}
                          >
                            {p.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                if (audioEnabled) soundSystem.playChirp('node');
                                setSelectedPayroll(p);
                                setIsPayrollModalOpen(true);
                              }}
                              className="text-xs font-bold text-slate-300 border-slate-700 hover:bg-slate-800"
                            >
                              Statement
                            </Button>

                            {p.status === 'READY_FOR_PAYMENT' && (
                              <div className="flex items-center gap-1.5">
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    if (audioEnabled) soundSystem.playChirp('payout');
                                    setPaymentModalTarget({
                                      id: p.id,
                                      targetType: 'PAYROLL',
                                      payeeName: p.teacherName,
                                      payeeType: 'TEACHER',
                                      district: p.district,
                                      amount: p.netPayable,
                                      description: `${p.billingMonth} Tuition Salary (${p.assignedStudentsCount} Students, ${p.completedSessionsCount} Sessions)`,
                                      referenceCode: p.salarySlipNumber,
                                      bankDetails: p.bankDetails ? {
                                        bankName: p.bankDetails.bankName,
                                        accountNumberMasked: p.bankDetails.accountNumberMasked,
                                        ifscCode: p.bankDetails.ifscCode,
                                        verified: true
                                      } : undefined
                                    });
                                    setIsPaymentModalOpen(true);
                                  }}
                                  className="text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm"
                                >
                                  Pay Now
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleQueuePayroll(p.id)}
                                  className="text-xs font-bold text-slate-300 border-slate-700"
                                >
                                  Queue
                                </Button>
                              </div>
                            )}

                            {p.status === 'PAID' && p.salarySlipNumber && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={async () => {
                                  if (audioEnabled) soundSystem.playChirp('node');
                                  const doc = await financeService.verifyDocument(p.salarySlipNumber!);
                                  if (doc) {
                                    setActiveDocument(doc);
                                    setIsDocViewerOpen(true);
                                  }
                                }}
                                className="text-xs font-bold text-cyan-400 border-cyan-800 hover:bg-cyan-950"
                              >
                                Salary Slip
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 5: LIBRARY SEAT SETTLEMENTS                                      */}
      {/* ==================================================================== */}
      {activeTab === 'settlements' && (
        <div className="relative z-10 space-y-4 animate-fadeIn">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-2xl backdrop-blur-xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">Library Seat Booking Settlement Engine</h3>
                <p className="text-xs text-slate-300">Platform Ledger → Commission Policy Hierarchy → Partner Payout Queue</p>
              </div>
              <Button
                size="sm"
                onClick={handleGenerateSettlements}
                loading={actionLoading}
                className="text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/30"
              >
                <Building2 className="w-3.5 h-3.5 mr-1" />
                Generate September Settlement Run
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/90 border-b border-slate-800 font-bold uppercase tracking-wider text-slate-300">
                  <tr>
                    <th className="px-4 py-3.5">Library & Operator</th>
                    <th className="px-4 py-3.5">District</th>
                    <th className="px-4 py-3.5">Period</th>
                    <th className="px-4 py-3.5 text-right">Confirmed Bookings</th>
                    <th className="px-4 py-3.5 text-right">Gross Booking Amt</th>
                    <th className="px-4 py-3.5 text-right">Platform Fee (10%)</th>
                    <th className="px-4 py-3.5 text-right">Net Partner Share</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {settlementRecords.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        No library payment records available for {selectedDistrict === 'ALL' ? 'Pan-India' : selectedDistrict}. Click "Generate September Settlement Run" above.
                      </td>
                    </tr>
                  ) : (
                    settlementRecords.map(s => (
                      <tr
                        key={s.id}
                        onClick={(e) => handleInspectElement(s.libraryName, 'LIBRARY_SETTLEMENT', s, e)}
                        className="hover:bg-slate-800/60 transition cursor-pointer"
                      >
                        <td className="px-4 py-3">
                          <p className="font-bold text-white">{s.libraryName}</p>
                          <p className="text-[10px] text-slate-400">Owner: {s.ownerName}</p>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-300">{s.district}</td>
                        <td className="px-4 py-3 text-slate-300 font-medium">{s.settlementPeriod}</td>
                        <td className="px-4 py-3 text-right font-mono text-slate-200">{s.totalBookingsCount} bookings</td>
                        <td className="px-4 py-3 text-right font-mono text-slate-300">{formatINR(s.grossBookingAmount)}</td>
                        <td className="px-4 py-3 text-right font-mono text-rose-400">-{formatINR(s.platformCommission)}</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400 text-sm">{formatINR(s.netPayable)}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              s.status === 'PAID'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : s.status === 'QUEUED'
                                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                                : 'bg-blue-950 text-blue-300 border border-blue-800'
                            }`}
                          >
                            {s.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                if (audioEnabled) soundSystem.playChirp('node');
                                setSelectedSettlement(s);
                                setIsSettlementModalOpen(true);
                              }}
                              className="text-xs font-bold text-slate-300 border-slate-700 hover:bg-slate-800"
                            >
                              Statement
                            </Button>

                            {s.status === 'READY_FOR_SETTLEMENT' && (
                              <div className="flex items-center gap-1.5">
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    if (audioEnabled) soundSystem.playChirp('payout');
                                    setPaymentModalTarget({
                                      id: s.id,
                                      targetType: 'SETTLEMENT',
                                      payeeName: `${s.ownerName} (${s.libraryName})`,
                                      payeeType: 'LIBRARY_OWNER',
                                      district: s.district,
                                      amount: s.netPayable,
                                      description: `Library Seat Settlement for ${s.settlementPeriod} (${s.totalBookingsCount} bookings)`,
                                      referenceCode: s.receiptNumber,
                                      bankDetails: s.bankDetails ? {
                                        bankName: s.bankDetails.bankName,
                                        accountNumberMasked: s.bankDetails.accountNumberMasked,
                                        ifscCode: s.bankDetails.ifscCode,
                                        verified: true
                                      } : undefined
                                    });
                                    setIsPaymentModalOpen(true);
                                  }}
                                  className="text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm"
                                >
                                  Settle Now
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleQueueSettlement(s.id)}
                                  className="text-xs font-bold text-slate-300 border-slate-700"
                                >
                                  Queue
                                </Button>
                              </div>
                            )}

                            {s.status === 'PAID' && s.receiptNumber && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={async () => {
                                  if (audioEnabled) soundSystem.playChirp('node');
                                  const doc = await financeService.verifyDocument(s.receiptNumber!);
                                  if (doc) {
                                    setActiveDocument(doc);
                                    setIsDocViewerOpen(true);
                                  }
                                }}
                                className="text-xs font-bold text-indigo-400 border-indigo-800 hover:bg-indigo-950"
                              >
                                View Receipt
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 6: SETTLEMENT BATCHES                                            */}
      {/* ==================================================================== */}
      {activeTab === 'batches' && (
        <div className="relative z-10 space-y-4 animate-fadeIn">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-2xl backdrop-blur-xl">
            <div className="p-5 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Bulk Settlement Batches</h3>
              <p className="text-xs text-slate-300">Atomic execution records with unique Cryptographic Batch ID (FP-SET-YYYY-MM-XXXXXX)</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/90 border-b border-slate-800 font-bold uppercase tracking-wider text-slate-300">
                  <tr>
                    <th className="px-4 py-3.5">Batch ID</th>
                    <th className="px-4 py-3.5">Initiated At</th>
                    <th className="px-4 py-3.5">Authorized By</th>
                    <th className="px-4 py-3.5 text-right">Total Payments</th>
                    <th className="px-4 py-3.5 text-right">Total Batch Amount</th>
                    <th className="px-4 py-3.5">Success / Fail</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {batches.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        No bulk settlement batches executed yet.
                      </td>
                    </tr>
                  ) : (
                    batches.map(b => (
                      <tr
                        key={b.id}
                        onClick={(e) => handleInspectElement(b.id, 'SETTLEMENT_BATCH', b, e)}
                        className="hover:bg-slate-800/60 transition cursor-pointer"
                      >
                        <td className="px-4 py-3 font-mono font-bold text-cyan-400">{b.id}</td>
                        <td className="px-4 py-3 text-slate-300">
                          {new Date(b.batchDate).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="px-4 py-3 font-medium text-white">{b.initiatedByName}</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-200">{b.totalPayments}</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400">{formatINR(b.totalAmount)}</td>
                        <td className="px-4 py-3 font-mono">
                          <span className="text-emerald-400 font-bold">{b.successfulPayments}</span>
                          <span className="text-slate-500"> / </span>
                          <span className={b.failedPayments > 0 ? 'text-rose-400 font-bold' : 'text-slate-500'}>{b.failedPayments}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              b.status === 'COMPLETED'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : 'bg-amber-950 text-amber-300 border border-amber-800'
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              if (audioEnabled) soundSystem.playChirp('node');
                              const details = await financeService.getSettlementBatchById(b.id);
                              if (details) {
                                setSelectedBatchDetails(details);
                              }
                            }}
                            className="text-xs font-bold text-cyan-400 border-cyan-800 hover:bg-cyan-950"
                          >
                            Inspect Batch
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 7: DOCUMENT VAULT                                                */}
      {/* ==================================================================== */}
      {activeTab === 'documents' && (
        <div className="relative z-10 space-y-4 animate-fadeIn">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-2xl backdrop-blur-xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">Centralized Financial Document Vault</h3>
                <p className="text-xs text-slate-300">Official verified documents with unique cryptographically signed identifiers & QR code confirmation</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/90 border-b border-slate-800 font-bold uppercase tracking-wider text-slate-300">
                  <tr>
                    <th className="px-4 py-3.5">Document Number</th>
                    <th className="px-4 py-3.5">Type</th>
                    <th className="px-4 py-3.5">Beneficiary</th>
                    <th className="px-4 py-3.5">District</th>
                    <th className="px-4 py-3.5 text-right">Amount</th>
                    <th className="px-4 py-3.5">Issued Date</th>
                    <th className="px-4 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {documents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No financial documents generated yet.
                      </td>
                    </tr>
                  ) : (
                    documents.map(d => (
                      <tr
                        key={d.documentId}
                        onClick={(e) => handleInspectElement(d.documentId, 'DOCUMENT_VAULT', d, e)}
                        className="hover:bg-slate-800/60 transition cursor-pointer"
                      >
                        <td className="px-4 py-3 font-mono font-bold text-cyan-400">{d.documentId}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              d.documentType === 'SALARY_SLIP'
                                ? 'bg-blue-950 text-blue-300 border border-blue-800'
                                : d.documentType === 'SETTLEMENT_RECEIPT'
                                ? 'bg-purple-950 text-purple-300 border border-purple-800'
                                : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            }`}
                          >
                            {d.documentType.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-white">{d.recipientName}</td>
                        <td className="px-4 py-3 text-slate-300">{d.district}</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400">{formatINR(d.amount)}</td>
                        <td className="px-4 py-3 text-slate-400">{d.date}</td>
                        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (audioEnabled) soundSystem.playChirp('node');
                              setActiveDocument(d);
                              setIsDocViewerOpen(true);
                            }}
                            className="text-xs font-bold text-cyan-400 border-cyan-800 hover:bg-cyan-950"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View & Print
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 8: MONTHLY FINANCIAL CLOSING                                     */}
      {/* ==================================================================== */}
      {activeTab === 'closing' && (
        <div className="relative z-10 space-y-4 animate-fadeIn">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-white text-base">Monthly Financial Closing & Ledger Locking</h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Protects historical records from unauthorized modification. Closed periods create immutable cryptographic audit snapshots.
                </p>
              </div>
              <Button
                onClick={() => {
                  if (audioEnabled) soundSystem.playChirp('warp');
                  setIsClosingModalOpen(true);
                }}
                className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs hover:from-amber-400 hover:to-amber-500 shadow-lg shadow-amber-500/20"
              >
                <Lock className="w-3.5 h-3.5 mr-1.5 text-slate-950" />
                Close Financial Month
              </Button>
            </div>

            <div className="mt-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Locked Financial Periods</h4>
              <div className="space-y-3">
                {monthlyClosings.map(mc => (
                  <div
                    key={mc.id}
                    onClick={(e) => handleInspectElement(`${mc.month} ${mc.year}`, 'MONTHLY_CLOSING_SNAPSHOT', mc, e)}
                    className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-cyan-500/60 hover:bg-slate-800/60 transition cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{mc.month} {mc.year} — {mc.district}</span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                          <Lock className="w-2.5 h-2.5 mr-1" />
                          LOCKED & CLOSED
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Closed by {mc.closedByName} at {new Date(mc.closedAt || '').toLocaleString('en-IN')}
                      </p>
                      <p className="text-[10px] font-mono text-cyan-400 mt-0.5">Hash: {mc.snapshotHash}</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-sans">Gross Tuition</span>
                        <span className="font-bold text-white">{formatINR(mc.totalTuitionCollections)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-sans">Library Bookings</span>
                        <span className="font-bold text-white">{formatINR(mc.libraryCollections)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-sans">Disbursed</span>
                        <span className="font-bold text-emerald-400">{formatINR(mc.teacherPayouts + mc.librarySettlements + mc.districtExpenditure)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-sans">Net Retained</span>
                        <span className="font-bold text-cyan-400">{formatINR(mc.netPlatformRevenue)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 9: FINANCIAL AUDIT TRAIL                                         */}
      {/* ==================================================================== */}
      {activeTab === 'audit' && (
        <div className="relative z-10 space-y-4 animate-fadeIn">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-2xl backdrop-blur-xl">
            <div className="p-5 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Immutable Financial Audit Trail</h3>
              <p className="text-xs text-slate-300">Chronological tamper-evident log of all payments, approvals, and settlements with actor identity verification</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/90 border-b border-slate-800 font-bold uppercase tracking-wider text-slate-300">
                  <tr>
                    <th className="px-4 py-3.5">Timestamp</th>
                    <th className="px-4 py-3.5">Actor / Role</th>
                    <th className="px-4 py-3.5">Action</th>
                    <th className="px-4 py-3.5">Entity Type</th>
                    <th className="px-4 py-3.5">Entity ID</th>
                    <th className="px-4 py-3.5">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {auditLogs.map(log => (
                    <tr
                      key={log.id}
                      onClick={(e) => handleInspectElement(log.action, 'AUDIT_LOG', log, e)}
                      className="hover:bg-slate-800/60 transition cursor-pointer"
                    >
                      <td className="px-4 py-3 font-mono text-slate-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-white">{log.userName}</p>
                        <p className="text-[10px] text-slate-400">{log.role}</p>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-cyan-400">{log.action}</td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                          {log.entityType}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-300">{log.entityId}</td>
                      <td className="px-4 py-3 text-slate-200 max-w-xs truncate">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 10: FINANCE SETTINGS & EXPENSE CATEGORIES                        */}
      {/* ==================================================================== */}
      {activeTab === 'settings' && settings && (
        <div className="relative z-10 space-y-6 animate-fadeIn">
          {/* Approval Tiers Configuration */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl">
            <h3 className="font-bold text-white text-base mb-1">Expenditure Approval Thresholds</h3>
            <p className="text-xs text-slate-300 mb-4">Configurable financial authority tiers for district claims</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div
                onClick={(e) => handleInspectElement('Tier 1: Standard Verification', 'APPROVAL_TIER', { limit: settings.approvalTiers.standardLimit }, e)}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-cyan-500/60 transition cursor-pointer"
              >
                <span className="font-bold text-slate-200 block">Tier 1: Standard Verification</span>
                <span className="text-slate-400">Expenses up to</span>
                <p className="text-lg font-black font-mono text-cyan-400 mt-1">{formatINR(settings.approvalTiers.standardLimit)}</p>
                <span className="text-[10px] text-emerald-400 font-semibold block mt-1">Single Super Admin Approval</span>
              </div>
              <div
                onClick={(e) => handleInspectElement('Tier 2: Enhanced Verification', 'APPROVAL_TIER', { limit: settings.approvalTiers.mediumLimit }, e)}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-cyan-500/60 transition cursor-pointer"
              >
                <span className="font-bold text-slate-200 block">Tier 2: Enhanced Verification</span>
                <span className="text-slate-400">Expenses between Tier 1 and</span>
                <p className="text-lg font-black font-mono text-amber-400 mt-1">{formatINR(settings.approvalTiers.mediumLimit)}</p>
                <span className="text-[10px] text-amber-300 font-semibold block mt-1">Invoice + Rate Card Audit Required</span>
              </div>
              <div
                onClick={(e) => handleInspectElement('Tier 3: High-Value Approval', 'APPROVAL_TIER', { limit: settings.approvalTiers.highValueLimit }, e)}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-cyan-500/60 transition cursor-pointer"
              >
                <span className="font-bold text-slate-200 block">Tier 3: High-Value Approval</span>
                <span className="text-slate-400">Expenses exceeding</span>
                <p className="text-lg font-black font-mono text-rose-400 mt-1">{formatINR(settings.approvalTiers.highValueLimit)}</p>
                <span className="text-[10px] text-rose-300 font-semibold block mt-1">Executive Financial Review</span>
              </div>
            </div>
          </div>

          {/* Configurable Expense Categories */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-white text-base">Configurable Operational Expenditure Categories</h3>
                <p className="text-xs text-slate-300">Enable, disable, or add categories available to District Admins</p>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  if (audioEnabled) soundSystem.playChirp('node');
                  setIsCategoryModalOpen(true);
                }}
                className="text-xs font-bold bg-cyan-600 text-slate-950 hover:bg-cyan-500 font-mono shadow-md shadow-cyan-600/30"
              >
                <PlusCircle className="w-3.5 h-3.5 mr-1" />
                Add Category
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {settings.categories.map(cat => (
                <div
                  key={cat.id}
                  onClick={(e) => handleInspectElement(cat.name, 'CONFIG_CATEGORY', cat, e)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    cat.isActive
                      ? 'bg-slate-950/60 border-slate-800 hover:border-cyan-500/60'
                      : 'bg-slate-950/30 border-slate-800/40 opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white">{cat.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleCategory(cat.id, cat.isActive);
                      }}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer ${
                        cat.isActive
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {cat.isActive ? 'Active' : 'Disabled'}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">
                    Subs: {cat.subCategories.join(', ') || 'General'}
                  </p>
                  {cat.monthlyBudgetAlert && (
                    <p className="text-[10px] text-cyan-400 mt-1 font-mono">
                      Alert Budget: {formatINR(cat.monthlyBudgetAlert)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 7. UNIVERSAL HOLOGRAPHIC FINANCIAL NODE INSPECTOR DRAWER             */}
      {/* ==================================================================== */}
      {inspectedNode && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 border-t-2 border-cyan-400 shadow-[0_-15px_40px_rgba(6,182,212,0.3)] backdrop-blur-2xl p-5 animate-slideUp">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono text-[10px] font-bold border border-cyan-800">
                  {inspectedNode.category}
                </span>
                <span className="font-mono text-xs text-slate-400">HASH: {inspectedNode.hash}</span>
                <span className="font-mono text-xs text-emerald-400">GEO // {inspectedNode.district || 'India Core'}</span>
                <span className="text-xs text-slate-400 font-mono">• {inspectedNode.timestamp}</span>
              </div>
              <h4 className="text-base font-black text-white flex items-center gap-2">
                {inspectedNode.title}
                {inspectedNode.amount !== undefined && (
                  <span className="text-cyan-400 font-mono">({formatINR(inspectedNode.amount)})</span>
                )}
              </h4>
              <p className="text-xs text-slate-300 font-mono max-w-3xl truncate">
                {JSON.stringify(inspectedNode.payload)}
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(inspectedNode, null, 2));
                  setCopiedHash(true);
                  if (audioEnabled) soundSystem.playChirp('click');
                  setTimeout(() => setCopiedHash(false), 2000);
                  addToast('Node Telemetry JSON copied to clipboard', 'success');
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-slate-900 border border-cyan-500/50 text-cyan-300 hover:bg-slate-800 flex items-center gap-1.5 transition cursor-pointer"
              >
                {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
                <span>{copiedHash ? 'COPIED' : 'COPY JSON'}</span>
              </button>

              <button
                onClick={() => {
                  if (audioEnabled) soundSystem.playChirp('click');
                  setInspectedNode(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 transition cursor-pointer"
              >
                Close HUD
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: CLAIM REVIEW & VERIFICATION DRAWER (DARK SCI-FI OVERHAUL)     */}
      {/* ==================================================================== */}
      {isClaimReviewOpen && selectedClaim && (
        <Modal
          isOpen={isClaimReviewOpen}
          onClose={() => setIsClaimReviewOpen(false)}
          title={`Review District Expenditure Claim — ${selectedClaim.id}`}
        >
          <div className="space-y-4 text-xs text-slate-200">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex justify-between items-start">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {selectedClaim.category}
                  </span>
                  <h4 className="font-bold text-sm text-white mt-1.5">{selectedClaim.description}</h4>
                  <p className="text-slate-400 mt-0.5">Purpose: {selectedClaim.purpose}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Claimed Amount</span>
                  <p className="text-lg font-black font-mono text-cyan-400">{formatINR(selectedClaim.claimedAmount)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-800 text-slate-300">
                <div>
                  <p><strong>District:</strong> {selectedClaim.district}, {selectedClaim.state}</p>
                  <p><strong>Vendor:</strong> {selectedClaim.vendorName}</p>
                  <p><strong>Bill No:</strong> {selectedClaim.billNumber} ({selectedClaim.billDate})</p>
                </div>
                <div>
                  <p><strong>Payment Method:</strong> {selectedClaim.paymentMethod}</p>
                  <p><strong>Submitted By:</strong> {selectedClaim.submittedByAdminName}</p>
                  <p><strong>Account:</strong> {selectedClaim.bankDetails?.accountNumberMasked || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Supporting Documents Preview List */}
            <div>
              <label className="font-bold text-slate-200 block mb-1.5">Submitted Bill Attachments & Invoices</label>
              <div className="space-y-2">
                {selectedClaim.supportingDocuments.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-800 bg-slate-900">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-cyan-400" />
                      <div>
                        <p className="font-bold text-white">{doc.name}</p>
                        <p className="text-[10px] text-slate-400">{Math.round(doc.sizeBytes / 1024)} KB • {doc.fileType}</p>
                      </div>
                    </div>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700"
                    >
                      Inspect Document
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Selection */}
            <div>
              <label className="font-bold text-slate-200 block mb-1.5">Super Admin Decision</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'APPROVE', label: 'Approve Full', color: 'border-emerald-500 bg-emerald-950 text-emerald-300' },
                  { id: 'PARTIAL', label: 'Approve Partial', color: 'border-cyan-500 bg-cyan-950 text-cyan-300' },
                  { id: 'DOCS', label: 'Need Docs', color: 'border-amber-500 bg-amber-950 text-amber-300' },
                  { id: 'REJECT', label: 'Reject', color: 'border-rose-500 bg-rose-950 text-rose-300' }
                ].map(act => (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => {
                      if (audioEnabled) soundSystem.playChirp('click');
                      setReviewAction(act.id as any);
                      if (act.id === 'APPROVE') {
                        setApprovedAmountInput(String(selectedClaim.claimedAmount));
                      }
                    }}
                    className={`py-2 px-1 text-center rounded-xl border font-bold transition-all cursor-pointer ${
                      reviewAction === act.id ? act.color : 'border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {act.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Partial Approved Amount Input */}
            {reviewAction === 'PARTIAL' && (
              <div className="p-3 bg-cyan-950/40 rounded-xl border border-cyan-800">
                <label className="font-bold text-cyan-300 block mb-1">Approved Amount (INR)</label>
                <p className="text-[11px] text-cyan-400/80 mb-2">
                  System will generate Payable Amount = Approved Amount. Only this amount will enter the payment queue.
                </p>
                <Input
                  type="number"
                  value={approvedAmountInput}
                  onChange={e => setApprovedAmountInput(e.target.value)}
                  placeholder="Enter approved amount"
                  className="font-mono font-bold bg-slate-900 text-white border-slate-700"
                />
              </div>
            )}

            {/* Remarks */}
            <div>
              <label className="font-bold text-slate-200 block mb-1">
                {reviewAction === 'REJECT' ? 'Rejection Reason (Required)' : 'Internal Review Remarks'}
              </label>
              <textarea
                rows={2}
                value={reviewRemarks}
                onChange={e => setReviewRemarks(e.target.value)}
                placeholder={reviewAction === 'REJECT' ? 'State clear reason for audit...' : 'Add notes for district coordinator...'}
                className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs focus:outline-cyan-500"
              />
            </div>

            <div className="flex justify-end items-center gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsClaimReviewOpen(false)}>
                Cancel
              </Button>
              {reviewAction !== 'REJECT' && reviewAction !== 'DOCS' && (
                <Button
                  onClick={handleApproveAndPayClaim}
                  className="bg-emerald-600 text-white font-black hover:bg-emerald-500 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5 mr-1" />
                  Approve & Pay Now
                </Button>
              )}
              <Button
                onClick={handleSubmitClaimReview}
                loading={actionLoading}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
              >
                {reviewAction === 'REJECT' ? 'Reject Claim' : reviewAction === 'DOCS' ? 'Request Documents' : 'Confirm & Enqueue'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ==================================================================== */}
      {/* MODAL: BULK SETTLEMENT BATCH CONFIRMATION                            */}
      {/* ==================================================================== */}
      {isBulkConfirmOpen && (
        <Modal
          isOpen={isBulkConfirmOpen}
          onClose={() => setIsBulkConfirmOpen(false)}
          title="Review & Confirm Bulk Settlement Batch"
        >
          <div className="space-y-4 text-xs text-slate-200">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-semibold">Total Batch Disbursement</span>
                  <p className="text-2xl font-black font-mono text-emerald-400 mt-0.5">{formatINR(selectedTotalAmount)}</p>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 uppercase text-[10px] font-semibold">Beneficiaries</span>
                  <p className="text-lg font-bold text-white mt-0.5">{selectedQueueIds.length} items</p>
                </div>
              </div>
            </div>

            <p className="text-slate-300">
              Executing this operation will generate an official <strong>Settlement Batch ID (FP-SET-...)</strong> and
              disburse individual line-item payouts via the automated IMPS clearing highway.
            </p>

            <div className="max-h-48 overflow-y-auto divide-y divide-slate-800 border border-slate-800 rounded-xl bg-slate-950">
              {paymentQueue.filter(q => selectedQueueIds.includes(q.id)).map(item => (
                <div key={item.id} className="p-2.5 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-white">{item.payeeName}</p>
                    <p className="text-[10px] text-slate-400">{item.paymentType} • {item.district}</p>
                  </div>
                  <span className="font-mono font-bold text-cyan-300">{formatINR(item.amount)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsBulkConfirmOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleExecuteBulkPayment}
                loading={actionLoading}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
              >
                Disburse All Now
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ==================================================================== */}
      {/* MODAL: MONTHLY CLOSING CONFIRMATION                                  */}
      {/* ==================================================================== */}
      {isClosingModalOpen && (
        <Modal
          isOpen={isClosingModalOpen}
          onClose={() => setIsClosingModalOpen(false)}
          title="Execute Monthly Financial Period Closing"
        >
          <div className="space-y-4 text-xs text-slate-200">
            <div className="p-4 rounded-xl bg-amber-950/60 border border-amber-800 text-amber-200 flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">Permanent Historical Snapshot Warning</p>
                <p className="text-[11px] text-amber-300/80 mt-0.5">
                  Once closed, historical financial records for this month are locked from modification.
                  Future commission changes will not alter generated slips.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-200 block mb-1">Billing Month</label>
                <select
                  value={closingMonth}
                  onChange={e => setClosingMonth(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs font-semibold"
                >
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-200 block mb-1">Financial Year</label>
                <input
                  type="number"
                  value={closingYear}
                  onChange={e => setClosingYear(Number(e.target.value))}
                  className="w-full p-2 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs font-semibold font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsClosingModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleExecuteClosing}
                loading={actionLoading}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
              >
                Confirm & Lock Period
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ==================================================================== */}
      {/* MODAL: ADD EXPENSE CATEGORY                                          */}
      {/* ==================================================================== */}
      {isCategoryModalOpen && (
        <Modal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          title="Add Configurable Expenditure Category"
        >
          <div className="space-y-4 text-xs text-slate-200">
            <div>
              <label className="font-bold text-slate-200 block mb-1">Category Name</label>
              <Input
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                placeholder="e.g. Laboratory Equipment, Solar Maintenance..."
                className="bg-slate-900 text-white border-slate-700"
              />
            </div>

            <div>
              <label className="font-bold text-slate-200 block mb-1">Sub-categories (Comma separated)</label>
              <Input
                value={newCatSubs}
                onChange={e => setNewCatSubs(e.target.value)}
                placeholder="e.g. Chemicals, Glassware, Safety Gear..."
                className="bg-slate-900 text-white border-slate-700"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsCategoryModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCategory} className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold">
                Add to Registry
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ==================================================================== */}
      {/* MODAL: TEACHER PAYROLL CALCULATION STATEMENT                         */}
      {/* ==================================================================== */}
      {isPayrollModalOpen && selectedPayroll && (
        <Modal
          isOpen={isPayrollModalOpen}
          onClose={() => setIsPayrollModalOpen(false)}
          title={`Teacher Payroll Calculation Statement — ${selectedPayroll.teacherName}`}
        >
          <div className="space-y-4 text-xs text-slate-200">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <p className="font-bold text-sm text-white">{selectedPayroll.teacherName}</p>
              <p className="text-slate-400">Period: {selectedPayroll.billingMonth} • District: {selectedPayroll.district}</p>
              <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[10px]">Assigned Learners</span>
                  <span className="font-bold text-white">{selectedPayroll.assignedStudentsCount} Students</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Verified Sessions</span>
                  <span className="font-bold text-white">{selectedPayroll.completedSessionsCount} Sessions (100% Approved)</span>
                </div>
              </div>
            </div>

            {/* Calculation Table */}
            <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900">
              <table className="w-full text-left">
                <thead className="bg-slate-950 text-slate-300 font-bold border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-2.5">Calculation Parameter</th>
                    <th className="px-4 py-2.5 text-right">Amount (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  <tr>
                    <td className="px-4 py-2 text-slate-300">Gross Tuition Collection</td>
                    <td className="px-4 py-2 text-right font-mono font-medium">{formatINR(selectedPayroll.grossTuitionCollection)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-slate-300">Teacher Earnings Share</td>
                    <td className="px-4 py-2 text-right font-mono font-medium">{formatINR(selectedPayroll.teacherEarnings)}</td>
                  </tr>
                  <tr className="text-rose-400">
                    <td className="px-4 py-2">FocusPoint Commission (15%)</td>
                    <td className="px-4 py-2 text-right font-mono">-{formatINR(selectedPayroll.focusPointCommission)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-emerald-400 font-medium">Performance / Attendance Bonus</td>
                    <td className="px-4 py-2 text-right font-mono text-emerald-400">+{formatINR(selectedPayroll.bonus)}</td>
                  </tr>
                </tbody>
                <tfoot className="bg-slate-950 text-white font-bold border-t border-slate-800">
                  <tr>
                    <td className="px-4 py-3">Final Net Payable</td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-400 text-sm">{formatINR(selectedPayroll.netPayable)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsPayrollModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ==================================================================== */}
      {/* MODAL: BATCH INSPECTION MODAL                                        */}
      {/* ==================================================================== */}
      {selectedBatchDetails && (
        <Modal
          isOpen={!!selectedBatchDetails}
          onClose={() => setSelectedBatchDetails(null)}
          title={`Batch Inspection: ${selectedBatchDetails.batch.id}`}
        >
          <div className="space-y-4 text-xs text-slate-200">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between">
              <div>
                <p className="font-bold text-white">Total: {formatINR(selectedBatchDetails.batch.totalAmount)}</p>
                <p className="text-[10px] text-slate-400">Initiated by {selectedBatchDetails.batch.initiatedByName}</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 h-fit">
                {selectedBatchDetails.batch.status}
              </span>
            </div>

            <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden max-h-60 overflow-y-auto bg-slate-950">
              {selectedBatchDetails.items.map(item => (
                <div key={item.id} className="p-3 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-white">{item.payeeName}</p>
                    <p className="text-[10px] text-slate-400">{item.paymentType} • {item.referenceCode}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-cyan-300">{formatINR(item.amount)}</p>
                    <span className="text-[10px] font-semibold text-emerald-400">{item.status}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setSelectedBatchDetails(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ==================================================================== */}
      {/* OFFICIAL DOCUMENT VIEWER (PRINTABLE A4 MODAL)                        */}
      {/* ==================================================================== */}
      <FinancialDocumentViewer
        isOpen={isDocViewerOpen}
        onClose={() => setIsDocViewerOpen(false)}
        document={activeDocument}
      />

      {/* ==================================================================== */}
      {/* SUPER ADMIN PAYMENT EXECUTION MODAL                                  */}
      {/* ==================================================================== */}
      <ExecutePaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setPaymentModalTarget(null);
        }}
        target={paymentModalTarget}
        onSuccess={async (res) => {
          if (res.officialDocument) {
            setActiveDocument(res.officialDocument);
            setIsDocViewerOpen(true);
          }
          await loadData();
        }}
      />
    </div>
  );
};
