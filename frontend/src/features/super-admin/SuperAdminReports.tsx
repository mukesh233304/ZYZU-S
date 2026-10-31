import React, { useState, useEffect, useMemo } from 'react';
import { reportService } from '../../services/reportService';
import { locationService } from '../../services/locationService';
import { 
  StateReportSummary, 
  DistrictReportSummary, 
  PanIndiaMacroSummary,
  TerritoryComparisonRow,
  VerticalIntelligenceDetail,
  AiCognitiveInsight,
  RegulatoryTaxAuditSummary,
  CustomReportQueryDefinition,
  ScheduledReportDispatch,
  ReportExportFormat
} from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { ExportModal } from '../../components/common/ExportModal';
import { useToast } from '../../context/ToastContext';
import { 
  FileText, 
  Download, 
  Globe, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  ShieldCheck, 
  Users, 
  Building2, 
  IndianRupee, 
  GraduationCap, 
  Printer, 
  Filter, 
  CheckCircle2, 
  ArrowRight,
  Layers,
  Sparkles,
  Volume2,
  VolumeX,
  RefreshCw,
  Bot,
  Sliders,
  Cpu,
  AlertTriangle,
  Search,
  Copy,
  Check,
  Clock,
  Plus,
  Trash2,
  Play,
  Send,
  Share2,
  FileSpreadsheet,
  Eye,
  Award,
  Zap,
  CheckCircle,
  X,
  ChevronRight,
  BarChart3
} from 'lucide-react';

// ============================================================================
// NATIVE CYBER ACOUSTIC SYNTHESIZER (Zero external dependencies)
// ============================================================================
class ReportSoundEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  public setMuted(m: boolean) {
    this.muted = m;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }

  public play(type: 'click' | 'confirm' | 'warp' | 'alert' | 'toggle') {
    if (this.muted) return;
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
        osc.frequency.setValueAtTime(750, now);
        osc.frequency.exponentialRampToValueAtTime(1100, now + 0.03);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        osc.start(now);
        osc.stop(now + 0.03);
      } else if (type === 'confirm') {
        osc.frequency.setValueAtTime(480, now);
        osc.frequency.exponentialRampToValueAtTime(960, now + 0.1);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'warp') {
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.16);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        osc.start(now);
        osc.stop(now + 0.16);
      } else if (type === 'alert') {
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(320, now + 0.08);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (type === 'toggle') {
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.setValueAtTime(800, now + 0.04);
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

const soundEngine = new ReportSoundEngine();

type ReportTab = 
  | 'MACRO_OVERVIEW' 
  | 'TERRITORY_DOSSIER' 
  | 'AI_COGNITIVE_STUDIO' 
  | 'TAX_REGULATORY_AUDIT' 
  | 'QUERY_BUILDER' 
  | 'SCHEDULED_DISPATCH';

export const SuperAdminReports: React.FC = () => {
  const { showToast } = useToast();

  // Acoustic & Global UI States
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [activeTab, setActiveTab] = useState<ReportTab>('MACRO_OVERVIEW');
  const [loading, setLoading] = useState(false);
  const [copiedBriefing, setCopiedBriefing] = useState(false);

  // Generator Controls
  const [reportLevel, setReportLevel] = useState<'PAN_INDIA' | 'STATE' | 'DISTRICT'>('PAN_INDIA');
  const [selectedState, setSelectedState] = useState('Uttar Pradesh');
  const [selectedDistrict, setSelectedDistrict] = useState('Ghazipur');
  const [dateRange, setDateRange] = useState('Last 30 Days (Current Month)');

  // Telemetry & Aggregated Data States
  const [macroData, setMacroData] = useState<PanIndiaMacroSummary | null>(null);
  const [stateData, setStateData] = useState<StateReportSummary | null>(null);
  const [districtData, setDistrictData] = useState<DistrictReportSummary | null>(null);
  const [territoryMatrix, setTerritoryMatrix] = useState<TerritoryComparisonRow[]>([]);
  const [matrixSearch, setMatrixSearch] = useState('');
  const [matrixSortField, setMatrixSortField] = useState<keyof TerritoryComparisonRow>('grossGMV');
  const [matrixSortAsc, setMatrixSortAsc] = useState(false);

  // Verticals & AI Intelligence
  const [verticals, setVerticals] = useState<VerticalIntelligenceDetail[]>([]);
  const [aiInsights, setAiInsights] = useState<AiCognitiveInsight[]>([]);
  const [taxAudit, setTaxAudit] = useState<RegulatoryTaxAuditSummary | null>(null);

  // Quick District Drill-Down Modal
  const [inspectDistrict, setInspectDistrict] = useState<TerritoryComparisonRow | null>(null);

  // Scheduled Dispatches
  const [scheduledList, setScheduledList] = useState<ScheduledReportDispatch[]>([]);
  const [isNewDispatchOpen, setIsNewDispatchOpen] = useState(false);
  const [newDispatchTitle, setNewDispatchTitle] = useState('');
  const [newDispatchFreq, setNewDispatchFreq] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('WEEKLY');
  const [newDispatchFormat, setNewDispatchFormat] = useState<ReportExportFormat>('PDF');
  const [newDispatchRecipients, setNewDispatchRecipients] = useState('cfo@focuspoint.edu, audit@focuspoint.edu');

  // Custom Query Builder
  const [customQueryDef, setCustomQueryDef] = useState<CustomReportQueryDefinition>({
    title: 'Ad-Hoc Territory Performance Query',
    dateRange: 'Last 30 Days (Current Month)',
    territoryLevel: 'PAN_INDIA',
    selectedState: 'Uttar Pradesh',
    selectedDistrict: 'Ghazipur',
    selectedVerticals: ['ALL'],
    metrics: ['GMV', 'NET_REVENUE', 'STUDENTS', 'ATTENDANCE', 'GROWTH'],
    groupBy: 'TERRITORY'
  });
  const [customQueryResult, setCustomQueryResult] = useState<{ columns: string[]; rows: any[]; totalRecords: number } | null>(null);
  const [queryRunning, setQueryRunning] = useState(false);

  // Multi-Format Export Modal
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportPayload, setExportPayload] = useState<{ data: any[]; title: string; filename: string }>({
    data: [],
    title: '',
    filename: ''
  });

  const activeDistricts = locationService.getActiveDistricts();

  // Toggle Mute
  const handleToggleMute = () => {
    const next = !isAudioMuted;
    setIsAudioMuted(next);
    soundEngine.setMuted(next);
    if (!next) soundEngine.play('toggle');
  };

  // Main Report Generation Pipeline
  const loadReports = async () => {
    setLoading(true);
    soundEngine.play('warp');
    try {
      const [macro, st, dist, matrix, verts, insights, tax, dispatches] = await Promise.all([
        reportService.getPanIndiaMacroReport(dateRange),
        reportService.getStateReport(selectedState, dateRange),
        reportService.getDistrictReport(selectedDistrict, dateRange),
        reportService.getTerritoryComparisonMatrix(selectedState, dateRange),
        reportService.getAllVerticals(reportLevel === 'DISTRICT' ? selectedDistrict : 'Pan-India', dateRange),
        reportService.getAiCognitiveInsights(selectedDistrict),
        reportService.getRegulatoryTaxAudit(reportLevel === 'DISTRICT' ? selectedDistrict : 'Pan-India', dateRange),
        reportService.getScheduledDispatches()
      ]);

      setMacroData(macro);
      setStateData(st);
      setDistrictData(dist);
      setTerritoryMatrix(matrix);
      setVerticals(verts);
      setAiInsights(insights);
      setTaxAudit(tax);
      setScheduledList(dispatches);
    } catch (err) {
      console.error('Failed to compile intelligence report', err);
      showToast('Error synchronizing live intelligence data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [selectedState, selectedDistrict, dateRange, reportLevel]);

  // Tab switcher
  const handleSelectTab = (t: ReportTab) => {
    soundEngine.play('click');
    setActiveTab(t);
  };

  // Filter & Sort Territory Matrix
  const sortedTerritories = useMemo(() => {
    return territoryMatrix
      .filter(t => 
        t.districtName.toLowerCase().includes(matrixSearch.toLowerCase()) ||
        t.stateName.toLowerCase().includes(matrixSearch.toLowerCase()) ||
        t.coordinatorName.toLowerCase().includes(matrixSearch.toLowerCase())
      )
      .sort((a, b) => {
        const valA = a[matrixSortField];
        const valB = b[matrixSortField];
        if (typeof valA === 'number' && typeof valB === 'number') {
          return matrixSortAsc ? valA - valB : valB - valA;
        }
        return matrixSortAsc 
          ? String(valA).localeCompare(String(valB)) 
          : String(valB).localeCompare(String(valA));
      });
  }, [territoryMatrix, matrixSearch, matrixSortField, matrixSortAsc]);

  const handleSortMatrix = (field: keyof TerritoryComparisonRow) => {
    soundEngine.play('click');
    if (matrixSortField === field) {
      setMatrixSortAsc(!matrixSortAsc);
    } else {
      setMatrixSortField(field);
      setMatrixSortAsc(false);
    }
  };

  // 1-Click Clipboard Executive Briefing Copy
  const handleCopyBriefing = () => {
    soundEngine.play('confirm');
    const title = reportLevel === 'PAN_INDIA' 
      ? 'Pan-India Consolidated Sovereign Dossier' 
      : reportLevel === 'STATE' 
      ? `${selectedState} State Dossier` 
      : `${selectedDistrict} District Territory Audit`;

    const metrics = reportLevel === 'PAN_INDIA' && macroData
      ? [
          { label: 'Reporting Period', value: macroData.reportingPeriod },
          { label: 'Gross Ecosystem GMV', value: `₹${macroData.grossGMV.toLocaleString('en-IN')}` },
          { label: 'Platform Net Retained Revenue', value: `₹${macroData.platformNetRevenue.toLocaleString('en-IN')}` },
          { label: 'Partner Payouts Disbursed', value: `₹${macroData.payoutsDisbursed.toLocaleString('en-IN')}` },
          { label: 'Blended Take-Rate', value: `${macroData.blendedTakeRate}%` },
          { label: 'Enrolled Students', value: macroData.totalStudents.toLocaleString('en-IN') },
          { label: 'Verified Educators', value: macroData.totalTeachers },
          { label: 'Partner Study Libraries', value: macroData.totalLibraries },
          { label: 'Biometric Attendance Integrity', value: `${macroData.attendanceIntegrity}%` },
        ]
      : reportLevel === 'STATE' && stateData
      ? [
          { label: 'State Name', value: stateData.stateName },
          { label: 'Reporting Period', value: stateData.dateRange },
          { label: 'Total Operating Districts', value: stateData.totalDistricts },
          { label: 'Gross State GMV', value: `₹${stateData.grossGMV.toLocaleString('en-IN')}` },
          { label: 'Platform Revenue', value: `₹${stateData.platformRevenue.toLocaleString('en-IN')}` },
          { label: 'Enrolled Students', value: stateData.totalStudents },
          { label: 'Verified Educators', value: stateData.totalTeachers },
          { label: 'Partner Libraries', value: stateData.totalLibraries },
          { label: 'Biometric Attendance Rate', value: `${stateData.overallAttendanceRate}%` }
        ]
      : districtData
      ? [
          { label: 'District Territory', value: districtData.districtName },
          { label: 'District Coordinator', value: districtData.adminName },
          { label: 'Gross Territory GMV', value: `₹${districtData.totalGMV.toLocaleString('en-IN')}` },
          { label: 'Tuition GMV', value: `₹${districtData.tuitionGMV.toLocaleString('en-IN')}` },
          { label: 'Library GMV', value: `₹${districtData.libraryGMV.toLocaleString('en-IN')}` },
          { label: 'Platform Retained Net', value: `₹${districtData.netRevenue.toLocaleString('en-IN')}` },
          { label: 'Active Enrolled Students', value: districtData.totalStudents },
          { label: 'Active Educators', value: districtData.totalTeachers },
          { label: 'Partner Libraries', value: districtData.totalLibraries }
        ]
      : [];

    const md = reportService.formatMarkdownBriefing(title, metrics);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(md);
      setCopiedBriefing(true);
      showToast('Executive briefing copied to clipboard in markdown format', 'success');
      setTimeout(() => setCopiedBriefing(false), 3000);
    }
  };

  // Trigger Universal Export Modal
  const handleTriggerExport = (type: 'MACRO' | 'STATE' | 'DISTRICT' | 'MATRIX' | 'TAX') => {
    soundEngine.play('confirm');
    if (type === 'MACRO' && macroData) {
      setExportPayload({
        data: [
          { Metric: 'Scope', Value: 'Pan-India Consolidated Ecosystem' },
          { Metric: 'Reporting Period', Value: macroData.reportingPeriod },
          { Metric: 'Total States Covered', Value: macroData.totalStates },
          { Metric: 'Total Operating Districts', Value: macroData.totalDistricts },
          { Metric: 'Gross Merchandise Value (GMV)', Value: `₹${macroData.grossGMV.toLocaleString('en-IN')}` },
          { Metric: 'Platform Net Retained Revenue', Value: `₹${macroData.platformNetRevenue.toLocaleString('en-IN')}` },
          { Metric: 'Partner Payouts Disbursed', Value: `₹${macroData.payoutsDisbursed.toLocaleString('en-IN')}` },
          { Metric: 'Active Promotional Subsidy', Value: `₹${macroData.activeOffersBurn.toLocaleString('en-IN')}` },
          { Metric: 'Blended Take-Rate', Value: `${macroData.blendedTakeRate}%` },
          { Metric: 'Total Enrolled Students', Value: macroData.totalStudents },
          { Metric: 'Verified Educators', Value: macroData.totalTeachers },
          { Metric: 'Partner Study Libraries', Value: macroData.totalLibraries },
          { Metric: 'Biometric Attendance Integrity', Value: `${macroData.attendanceIntegrity}%` },
          { Metric: 'Month-on-Month Growth', Value: `+${macroData.overallGrowthMoM}%` }
        ],
        title: `Pan-India Sovereign Intelligence Dossier - ${macroData.reportingPeriod}`,
        filename: `pan_india_macro_dossier_${macroData.reportingPeriod.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
      });
      setIsExportOpen(true);
    } else if (type === 'STATE' && stateData) {
      setExportPayload({
        data: [
          { Metric: 'State Name', Value: stateData.stateName },
          { Metric: 'Reporting Period', Value: stateData.dateRange },
          { Metric: 'Total Operating Districts', Value: stateData.totalDistricts },
          { Metric: 'Total Enrolled Students', Value: stateData.totalStudents },
          { Metric: 'Total Verified Educators', Value: stateData.totalTeachers },
          { Metric: 'Total Partner Libraries', Value: stateData.totalLibraries },
          { Metric: 'Gross Merchandise Value (GMV)', Value: `₹${stateData.grossGMV.toLocaleString('en-IN')}` },
          { Metric: 'Platform Net Revenue', Value: `₹${stateData.platformRevenue.toLocaleString('en-IN')}` },
          { Metric: 'Partner Payouts Disbursed', Value: `₹${stateData.payoutsDisbursed.toLocaleString('en-IN')}` },
          { Metric: 'Overall Attendance Rate', Value: `${stateData.overallAttendanceRate}%` },
          { Metric: 'New Registrations This Period', Value: stateData.newRegistrations }
        ],
        title: `State Executive Intelligence Report - ${stateData.stateName}`,
        filename: `state_report_${stateData.stateName.toLowerCase().replace(/\s+/g, '_')}`
      });
      setIsExportOpen(true);
    } else if (type === 'DISTRICT' && districtData) {
      setExportPayload({
        data: [
          { Metric: 'District Name', Value: districtData.districtName },
          { Metric: 'State', Value: districtData.stateName },
          { Metric: 'District Coordinator', Value: districtData.adminName },
          { Metric: 'Coordinator Status', Value: districtData.adminStatus },
          { Metric: 'Total Enrolled Students', Value: districtData.totalStudents },
          { Metric: 'Total Verified Teachers', Value: districtData.totalTeachers },
          { Metric: 'Total Partner Libraries', Value: districtData.totalLibraries },
          { Metric: 'Total Bookings Completed', Value: districtData.totalBookings },
          { Metric: 'Tuition GMV', Value: `₹${districtData.tuitionGMV.toLocaleString('en-IN')}` },
          { Metric: 'Library GMV', Value: `₹${districtData.libraryGMV.toLocaleString('en-IN')}` },
          { Metric: 'Total District GMV', Value: `₹${districtData.totalGMV.toLocaleString('en-IN')}` },
          { Metric: 'Gross Platform Fee', Value: `₹${districtData.platformCommission.toLocaleString('en-IN')}` },
          { Metric: 'Educator Disbursements', Value: `₹${districtData.educatorPayouts.toLocaleString('en-IN')}` },
          { Metric: 'Library Disbursements', Value: `₹${districtData.libraryPayouts.toLocaleString('en-IN')}` },
          { Metric: 'District Admin Expenses', Value: `₹${districtData.districtExpenses.toLocaleString('en-IN')}` },
          { Metric: 'Net Platform Retained', Value: `₹${districtData.netRevenue.toLocaleString('en-IN')}` },
          { Metric: 'Student Body Growth', Value: `+${districtData.studentGrowth}%` }
        ],
        title: `District Territory Audit Report - ${districtData.districtName}`,
        filename: `district_report_${districtData.districtName.toLowerCase().replace(/\s+/g, '_')}`
      });
      setIsExportOpen(true);
    } else if (type === 'MATRIX') {
      setExportPayload({
        data: territoryMatrix.map(t => ({
          'District': t.districtName,
          'State': t.stateName,
          'Coordinator': t.coordinatorName,
          'Students': t.totalStudents,
          'Teachers': t.totalTeachers,
          'Libraries': t.totalLibraries,
          'Bookings': t.activeBookings,
          'Gross GMV (₹)': t.grossGMV,
          'Net Revenue (₹)': t.platformNetRevenue,
          'Attendance (%)': t.attendanceRate,
          'Velocity (Hrs)': t.fulfillmentVelocityHours,
          'Health Score': t.healthScore
        })),
        title: `Territory Comparison Matrix - ${dateRange}`,
        filename: `territory_comparison_matrix_${dateRange.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
      });
      setIsExportOpen(true);
    } else if (type === 'TAX' && taxAudit) {
      setExportPayload({
        data: [
          { Metric: 'Reporting Period', Value: taxAudit.reportingPeriod },
          { Metric: 'Territory Scope', Value: taxAudit.territory },
          { Metric: 'Gross Taxable Turnover (₹)', Value: `₹${taxAudit.grossTaxableGMV.toLocaleString('en-IN')}` },
          { Metric: 'Total GST Rate', Value: `${taxAudit.gstTotalRatePercent}%` },
          { Metric: 'Central GST (CGST 9%)', Value: `₹${taxAudit.cgstAmount.toLocaleString('en-IN')}` },
          { Metric: 'State GST (SGST 9%)', Value: `₹${taxAudit.sgstAmount.toLocaleString('en-IN')}` },
          { Metric: 'Input Tax Credit (ITC) Claimed', Value: `₹${taxAudit.inputTaxCreditEligible.toLocaleString('en-IN')}` },
          { Metric: 'Net GST Treasury Payable', Value: `₹${taxAudit.netGstPayable.toLocaleString('en-IN')}` },
          { Metric: 'TDS Withheld on Payouts (1%)', Value: `₹${taxAudit.tdsDeductedOnPayouts.toLocaleString('en-IN')}` },
          { Metric: 'Educator KYC Compliance Rate', Value: `${taxAudit.educatorKycComplianceRate}%` },
          { Metric: 'Police Clearance Rate', Value: `${taxAudit.policeClearanceRate}%` },
          { Metric: 'Library Safety & Fire Audit Score', Value: `${taxAudit.libraryFireSafetyScore}%` },
          { Metric: 'CCTV 30-Day Backup Reliability', Value: `${taxAudit.cctvBiometricIntegrity}%` },
        ],
        title: `GST & Legal Compliance Reconciliation - ${taxAudit.reportingPeriod}`,
        filename: `tax_legal_audit_${taxAudit.reportingPeriod.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
      });
      setIsExportOpen(true);
    }
  };

  // Run Custom Query
  const handleExecuteCustomQuery = async () => {
    soundEngine.play('warp');
    setQueryRunning(true);
    try {
      const res = await reportService.runCustomQuery(customQueryDef);
      setCustomQueryResult(res);
      showToast(`Query executed: ${res.totalRecords} territory records synthesized`, 'success');
    } catch {
      showToast('Failed to execute query', 'error');
    } finally {
      setQueryRunning(false);
    }
  };

  // Scheduled Dispatch Actions
  const handleToggleDispatch = async (id: string) => {
    soundEngine.play('toggle');
    const updated = await reportService.toggleScheduledDispatch(id);
    if (updated) {
      setScheduledList(prev => prev.map(d => d.id === id ? updated : d));
      showToast(`Dispatch schedule ${updated.active ? 'activated' : 'paused'}`, 'info');
    }
  };

  const handleDeleteDispatch = async (id: string) => {
    soundEngine.play('alert');
    await reportService.deleteScheduledDispatch(id);
    setScheduledList(prev => prev.filter(d => d.id !== id));
    showToast('Scheduled dispatch removed', 'info');
  };

  const handleCreateDispatch = async () => {
    if (!newDispatchTitle.trim()) {
      showToast('Please specify a dispatch title', 'error');
      return;
    }
    soundEngine.play('confirm');
    const recs = newDispatchRecipients.split(',').map(s => s.trim()).filter(Boolean);
    const created = await reportService.saveScheduledDispatch({
      title: newDispatchTitle.trim(),
      frequency: newDispatchFreq,
      format: newDispatchFormat,
      targetLevel: reportLevel,
      territoryName: reportLevel === 'DISTRICT' ? selectedDistrict : reportLevel === 'STATE' ? selectedState : 'Pan-India',
      recipients: recs.length ? recs : ['superadmin@focuspoint.edu'],
      active: true,
      nextRunTimestamp: newDispatchFreq === 'DAILY' ? 'Tomorrow 08:00 IST' : newDispatchFreq === 'WEEKLY' ? 'Next Monday 09:00 IST' : '1st of Next Month'
    });
    setScheduledList(prev => [...prev, created]);
    setIsNewDispatchOpen(false);
    setNewDispatchTitle('');
    showToast(`New scheduled dispatch "${created.title}" configured`, 'success');
  };

  // Drill down from Matrix row to District Dossier
  const handleDrilldownDistrict = (distName: string) => {
    soundEngine.play('confirm');
    setSelectedDistrict(distName);
    setReportLevel('DISTRICT');
    setActiveTab('TERRITORY_DOSSIER');
    showToast(`Navigated to ${distName} territory dossier`, 'info');
  };

  return (
    <div className="space-y-6 pb-24 font-sans text-slate-100">
      {/* =========================================================================
          IMMERSIVE SOVEREIGN COMMAND DECK HEADER (High Contrast Cyber Glass)
          ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 border-2 border-purple-500/40 p-6 shadow-[0_0_35px_rgba(168,85,247,0.15)] backdrop-blur-2xl">
        {/* Futuristic Ambient Glow Background Orbs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-purple-500/20 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/90 border border-purple-500/50 text-purple-200 text-xs font-mono font-bold tracking-wider mb-2">
              <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>SOVEREIGN INTELLIGENCE RADAR // CORE ENGINE v5.0</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>Executive Intelligence Report Engine</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-cyan-950/90 text-cyan-300 border border-cyan-500/50">
                ACTIVE
              </span>
            </h1>
            <p className="text-slate-200 text-xs sm:text-sm mt-1 max-w-3xl leading-relaxed font-medium">
              Autonomous multi-tier executive analytics generator, real-time ledger synthesis, AI cognitive insights, and regulatory compliance audit center.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Audio Synthesizer Toggle */}
            <button
              onClick={handleToggleMute}
              className={`p-2.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
                isAudioMuted
                  ? 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                  : 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300 shadow-lg shadow-cyan-500/20'
              }`}
              title={isAudioMuted ? 'Unmute Audio Synthesizer' : 'Mute Audio Synthesizer'}
            >
              {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{isAudioMuted ? 'MUTED' : 'AUDIO ON'}</span>
            </button>

            {/* 1-Click Clipboard Markdown Briefing */}
            <button
              onClick={handleCopyBriefing}
              className="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-100 hover:border-cyan-400 hover:text-cyan-200 hover:bg-cyan-950/50 transition-all font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              {copiedBriefing ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Copy Briefing</span>
                </>
              )}
            </button>

            {/* Print Official Dossier */}
            <button
              onClick={() => {
                soundEngine.play('confirm');
                window.print();
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-100 hover:border-purple-400 hover:text-purple-200 hover:bg-purple-950/50 transition-all font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Printer className="w-3.5 h-3.5 text-purple-400" />
              <span>Print Dossier</span>
            </button>

            {/* Export Generated Dossier */}
            <button
              onClick={() => handleTriggerExport(reportLevel === 'PAN_INDIA' ? 'MACRO' : reportLevel === 'STATE' ? 'STATE' : 'DISTRICT')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.4)] border border-purple-400/40 cursor-pointer transition-all"
            >
              <Download className="w-3.5 h-3.5 text-cyan-200" />
              <span>Export Dossier</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            SEMANTIC COLOR-CODED LIVE TELEMETRY STRIP
            (Background color actively tuned according to metric category & text)
            ========================================================================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {/* Card 1: Gross Ecosystem GMV (Emerald Growth Palette) */}
          <div className="p-4.5 rounded-2xl bg-emerald-950/50 border-2 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)] relative overflow-hidden backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold tracking-wider text-emerald-300 uppercase">Gross Platform GMV</span>
              <span className="flex items-center text-[10px] font-black text-emerald-200 bg-emerald-900/80 px-2.5 py-0.5 rounded-full border border-emerald-400">
                <TrendingUp className="w-3 h-3 mr-1 text-emerald-300" />
                +19.4% MoM
              </span>
            </div>
            <p className="text-3xl font-black text-white font-mono mt-2 tracking-tight">
              ₹{macroData ? macroData.grossGMV.toLocaleString('en-IN') : '28,60,000'}
            </p>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-emerald-500/20 text-xs">
              <span className="text-emerald-200 font-semibold">Period Velocity</span>
              <span className="text-emerald-300 font-mono font-bold">₹95.3K / day</span>
            </div>
          </div>

          {/* Card 2: Net Retained Revenue (Cyan / Blue Platform Margin Palette) */}
          <div className="p-4.5 rounded-2xl bg-cyan-950/50 border-2 border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.15)] relative overflow-hidden backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold tracking-wider text-cyan-300 uppercase">Platform Retained Net</span>
              <span className="text-[10px] font-black text-cyan-200 bg-cyan-900/80 px-2.5 py-0.5 rounded-full border border-cyan-400 font-mono">
                8.8% Take-Rate
              </span>
            </div>
            <p className="text-3xl font-black text-cyan-200 font-mono mt-2 tracking-tight">
              ₹{macroData ? macroData.platformNetRevenue.toLocaleString('en-IN') : '2,51,680'}
            </p>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-cyan-500/20 text-xs">
              <span className="text-cyan-200 font-semibold">Partner Disbursements</span>
              <span className="text-cyan-300 font-mono font-bold">₹{macroData ? macroData.payoutsDisbursed.toLocaleString('en-IN') : '25.7L'}</span>
            </div>
          </div>

          {/* Card 3: Active Ecosystem Nodes (Purple / Sovereign Scale Palette) */}
          <div className="p-4.5 rounded-2xl bg-purple-950/50 border-2 border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.15)] relative overflow-hidden backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold tracking-wider text-purple-300 uppercase">Active Node Density</span>
              <span className="text-[10px] font-black text-purple-200 bg-purple-900/80 px-2.5 py-0.5 rounded-full border border-purple-400 font-mono">
                8 Districts
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-purple-100 font-mono tracking-tight">
                {macroData ? macroData.totalStudents.toLocaleString('en-IN') : '1,420'}
              </span>
              <span className="text-xs text-purple-200 font-bold">Students</span>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-purple-500/20 text-xs">
              <span className="text-purple-200 font-semibold">{macroData ? macroData.totalTeachers : 148} Educators</span>
              <span className="text-purple-300 font-mono font-bold">{macroData ? macroData.totalLibraries : 28} Libraries</span>
            </div>
          </div>

          {/* Card 4: Sovereign Compliance Index (Amber / Gold Statutory Palette) */}
          <div className="p-4.5 rounded-2xl bg-amber-950/50 border-2 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)] relative overflow-hidden backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold tracking-wider text-amber-300 uppercase">Compliance Index</span>
              <span className="flex items-center text-[10px] font-black text-amber-200 bg-amber-900/80 px-2.5 py-0.5 rounded-full border border-amber-400">
                <ShieldCheck className="w-3 h-3 mr-1 text-amber-300" />
                Audited
              </span>
            </div>
            <p className="text-3xl font-black text-amber-200 font-mono mt-2 tracking-tight">
              {macroData ? macroData.attendanceIntegrity : 93.6}%
            </p>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-amber-500/20 text-xs">
              <span className="text-amber-200 font-semibold">Biometric Reliability</span>
              <span className="text-amber-300 font-mono font-bold">100% GST Match</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          GENERATOR CONTROL TOOLBAR (High-Contrast Scope & Preset Selectors)
          ========================================================================= */}
      <div className="p-4.5 rounded-2xl bg-slate-950 border border-slate-700/80 shadow-xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Scope Level Toggle */}
            <div className="flex items-center p-1.5 bg-slate-900 rounded-xl border border-slate-700">
              <button
                onClick={() => {
                  soundEngine.play('click');
                  setReportLevel('PAN_INDIA');
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  reportLevel === 'PAN_INDIA'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md border border-purple-400/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5 inline mr-1" />
                Pan-India
              </button>
              <button
                onClick={() => {
                  soundEngine.play('click');
                  setReportLevel('STATE');
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  reportLevel === 'STATE'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md border border-purple-400/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Globe className="w-3.5 h-3.5 inline mr-1" />
                Statewide
              </button>
              <button
                onClick={() => {
                  soundEngine.play('click');
                  setReportLevel('DISTRICT');
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  reportLevel === 'DISTRICT'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md border border-purple-400/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 inline mr-1" />
                District
              </button>
            </div>

            {/* State Selector */}
            {reportLevel !== 'PAN_INDIA' && (
              <div>
                <select
                  value={selectedState}
                  onChange={(e) => {
                    soundEngine.play('click');
                    setSelectedState(e.target.value);
                  }}
                  className="bg-slate-900 border-2 border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-bold focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 outline-none cursor-pointer"
                >
                  <option value="Uttar Pradesh">Uttar Pradesh (75 Districts)</option>
                  <option value="Bihar">Bihar (Patna Region)</option>
                  <option value="Delhi NCR">Delhi NCR</option>
                </select>
              </div>
            )}

            {/* District Selector */}
            {reportLevel === 'DISTRICT' && (
              <div>
                <select
                  value={selectedDistrict}
                  onChange={(e) => {
                    soundEngine.play('click');
                    setSelectedDistrict(e.target.value);
                  }}
                  className="bg-slate-900 border-2 border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-bold focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 outline-none cursor-pointer"
                >
                  {activeDistricts.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                  <option value="Varanasi">Varanasi</option>
                  <option value="Lucknow">Lucknow</option>
                  <option value="Mau">Mau</option>
                  <option value="Ballia">Ballia</option>
                  <option value="Saidpur">Saidpur</option>
                  <option value="Patna">Patna</option>
                  <option value="South Delhi">South Delhi</option>
                </select>
              </div>
            )}

            {/* Date Preset Selector */}
            <div>
              <select
                value={dateRange}
                onChange={(e) => {
                  soundEngine.play('click');
                  setDateRange(e.target.value);
                }}
                className="bg-slate-900 border-2 border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-bold focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 outline-none cursor-pointer"
              >
                <option value="Last 7 Days">Last 7 Days (Micro Audit)</option>
                <option value="Last 30 Days (Current Month)">Last 30 Days (Current Month)</option>
                <option value="Current Quarter (Q2 2026)">Current Quarter (Q2 2026)</option>
                <option value="Financial Year 2026-27">Financial Year 2026-27</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadReports}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-cyan-950/70 border border-cyan-500/50 hover:bg-cyan-900 text-cyan-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-300 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Synthesis</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          CYBER HUD NAVIGATION TABS (Active Glowing Borders)
          ========================================================================= */}
      <div className="flex border-b border-slate-800 overflow-x-auto gap-2 pb-1 scrollbar-thin">
        {[
          { key: 'MACRO_OVERVIEW', label: 'Executive Macro', icon: Layers, badge: 'Sovereign' },
          { key: 'TERRITORY_DOSSIER', label: 'Territory Dossiers', icon: MapPin, badge: selectedDistrict },
          { key: 'AI_COGNITIVE_STUDIO', label: 'AI Cognitive Radar', icon: Bot, badge: '4 Signals' },
          { key: 'TAX_REGULATORY_AUDIT', label: 'GST & Legal Audit', icon: ShieldCheck, badge: '18% GST' },
          { key: 'QUERY_BUILDER', label: 'Ad-Hoc Query Builder', icon: Sliders, badge: 'Custom' },
          { key: 'SCHEDULED_DISPATCH', label: 'Automated Dispatches', icon: Clock, badge: `${scheduledList.filter(s => s.active).length} Active` },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => handleSelectTab(tab.key as ReportTab)}
              className={`flex items-center gap-2 px-4.5 py-3 rounded-t-2xl text-xs font-black transition-all whitespace-nowrap border-b-2 cursor-pointer ${
                isActive
                  ? 'border-purple-400 text-white bg-slate-900 shadow-[0_-4px_16px_rgba(168,85,247,0.2)]'
                  : 'border-transparent text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                isActive ? 'bg-purple-900/80 text-purple-200 border border-purple-400' : 'bg-slate-800 border border-slate-700 text-slate-300'
              }`}>
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          TAB 1: EXECUTIVE MACRO OVERVIEW
          ========================================================================= */}
      {activeTab === 'MACRO_OVERVIEW' && (
        <div className="space-y-6">
          {/* Executive Dossier Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/80 via-slate-950 to-cyan-950/80 border-2 border-purple-500/50 shadow-2xl relative overflow-hidden backdrop-blur-xl">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-0.5 rounded-full text-[10px] font-black bg-purple-900/80 text-purple-200 border border-purple-400 tracking-wider">
                    {reportLevel === 'PAN_INDIA' ? 'SOVEREIGN MACRO DOSSIER' : `${selectedState.toUpperCase()} CONSOLIDATED DOSSIER`}
                  </span>
                  <span className="text-cyan-300 text-xs font-mono font-bold">
                    SHA-256 SEAL: #FP-{dateRange.substring(0, 3).toUpperCase()}-9821
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white mt-2">
                  {reportLevel === 'PAN_INDIA' ? 'All-India Educational Footprint & Territory Ledger' : `${selectedState} Executive Operations Overview`}
                </h3>
                <p className="text-slate-200 text-xs sm:text-sm mt-1 font-medium">
                  Synthesized across <span className="text-cyan-300 font-extrabold font-mono">8 Operational Districts</span> • Period: <span className="text-purple-200 font-bold">{dateRange}</span> • Reconciled against immutable ledger.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="p-4 bg-slate-950/90 border border-purple-500/40 rounded-2xl text-right shadow-lg">
                  <p className="text-[10px] text-slate-300 uppercase font-extrabold">Consolidated Gross GMV</p>
                  <p className="text-2xl font-black text-white font-mono">₹{macroData ? macroData.grossGMV.toLocaleString('en-IN') : '28,60,000'}</p>
                  <p className="text-xs text-emerald-300 font-bold">Net Margin: ₹{macroData ? macroData.platformNetRevenue.toLocaleString('en-IN') : '2,51,680'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sector / Vertical Revenue Split Visualizer (Dynamic Color Coordination) */}
          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-700/80 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                <h4 className="text-base font-black text-white">Vertical Gross Revenue Contribution & Take-Rate Split</h4>
              </div>
              <span className="text-xs text-cyan-300 font-mono font-bold bg-cyan-950/80 px-2.5 py-1 rounded-full border border-cyan-500/40">100% RECONCILED</span>
            </div>

            {/* Visual SVG / CSS Progress Bar */}
            <div className="w-full h-5 rounded-full bg-slate-900 overflow-hidden flex p-0.5 border border-slate-700">
              <div style={{ width: '58%' }} className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-l-full shadow-inner" title="Home Tuition: 58%" />
              <div style={{ width: '26%' }} className="h-full bg-gradient-to-r from-purple-600 to-pink-500 shadow-inner" title="Study Libraries: 26%" />
              <div style={{ width: '10%' }} className="h-full bg-gradient-to-r from-amber-500 to-orange-500 shadow-inner" title="CBT Mock Exams: 10%" />
              <div style={{ width: '6%' }} className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-r-full shadow-inner" title="Study Vault: 6%" />
            </div>

            {/* Legend Grid with Semantic Color Harmony */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
              {/* Home Tuition Card */}
              <div className="p-4 rounded-2xl bg-blue-950/60 border-2 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-cyan-400" />
                  <span className="text-xs font-black text-blue-200">Home Tuition</span>
                </div>
                <p className="text-xl font-black text-white font-mono mt-1.5">₹{macroData ? macroData.verticalSplit.homeTuitionGMV.toLocaleString('en-IN') : '16,58,800'}</p>
                <p className="text-xs text-blue-300 font-semibold mt-0.5">58% Share • 8.0% Take Rate</p>
              </div>

              {/* Study Libraries Card */}
              <div className="p-4 rounded-2xl bg-purple-950/60 border-2 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-400" />
                  <span className="text-xs font-black text-purple-200">Study Libraries</span>
                </div>
                <p className="text-xl font-black text-white font-mono mt-1.5">₹{macroData ? macroData.verticalSplit.studyLibraryGMV.toLocaleString('en-IN') : '7,43,600'}</p>
                <p className="text-xs text-purple-300 font-semibold mt-0.5">26% Share • 8.0% Take Rate</p>
              </div>

              {/* CBT Mock Exams Card */}
              <div className="p-4 rounded-2xl bg-amber-950/60 border-2 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <span className="text-xs font-black text-amber-200">CBT Mock Exams</span>
                </div>
                <p className="text-xl font-black text-white font-mono mt-1.5">₹{macroData ? macroData.verticalSplit.mockExamGMV.toLocaleString('en-IN') : '2,86,000'}</p>
                <p className="text-xs text-amber-300 font-semibold mt-0.5">10% Share • 16.0% Take Rate</p>
              </div>

              {/* Paid Study Vault Card */}
              <div className="p-4 rounded-2xl bg-emerald-950/60 border-2 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="text-xs font-black text-emerald-200">Paid Study Vault</span>
                </div>
                <p className="text-xl font-black text-white font-mono mt-1.5">₹{macroData ? macroData.verticalSplit.studyVaultGMV.toLocaleString('en-IN') : '1,71,600'}</p>
                <p className="text-xs text-emerald-300 font-semibold mt-0.5">6% Share • 16.0% Take Rate</p>
              </div>
            </div>
          </div>

          {/* Comparative Territory Performance League Table */}
          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-700/80 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div>
                <h4 className="text-base font-black text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-purple-400" />
                  Operational Territory Comparison Matrix
                </h4>
                <p className="text-xs text-slate-200 font-medium">
                  Click any district to inspect its deep-dive audit dossier or sort columns.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={matrixSearch}
                    onChange={(e) => setMatrixSearch(e.target.value)}
                    placeholder="Search district, state, coordinator..."
                    className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:border-purple-400 focus:ring-1 focus:ring-purple-500 outline-none font-medium"
                  />
                </div>

                <button
                  onClick={() => handleTriggerExport('MATRIX')}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-200 hover:text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-300" />
                  Export
                </button>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto rounded-2xl border-2 border-slate-800">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900 text-slate-200 font-extrabold border-b-2 border-slate-700 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4 cursor-pointer hover:text-white" onClick={() => handleSortMatrix('districtName')}>
                      Territory / State {matrixSortField === 'districtName' && (matrixSortAsc ? '▲' : '▼')}
                    </th>
                    <th className="py-3.5 px-4">Coordinator</th>
                    <th className="py-3.5 px-4 text-right cursor-pointer hover:text-white" onClick={() => handleSortMatrix('totalStudents')}>
                      Students {matrixSortField === 'totalStudents' && (matrixSortAsc ? '▲' : '▼')}
                    </th>
                    <th className="py-3.5 px-4 text-right cursor-pointer hover:text-white" onClick={() => handleSortMatrix('totalTeachers')}>
                      Educators {matrixSortField === 'totalTeachers' && (matrixSortAsc ? '▲' : '▼')}
                    </th>
                    <th className="py-3.5 px-4 text-right cursor-pointer hover:text-white" onClick={() => handleSortMatrix('totalLibraries')}>
                      Libraries {matrixSortField === 'totalLibraries' && (matrixSortAsc ? '▲' : '▼')}
                    </th>
                    <th className="py-3.5 px-4 text-right cursor-pointer hover:text-white" onClick={() => handleSortMatrix('grossGMV')}>
                      Gross GMV (₹) {matrixSortField === 'grossGMV' && (matrixSortAsc ? '▲' : '▼')}
                    </th>
                    <th className="py-3.5 px-4 text-right cursor-pointer hover:text-white" onClick={() => handleSortMatrix('platformNetRevenue')}>
                      Net Margin {matrixSortField === 'platformNetRevenue' && (matrixSortAsc ? '▲' : '▼')}
                    </th>
                    <th className="py-3.5 px-4 text-right cursor-pointer hover:text-white" onClick={() => handleSortMatrix('attendanceRate')}>
                      Attendance {matrixSortField === 'attendanceRate' && (matrixSortAsc ? '▲' : '▼')}
                    </th>
                    <th className="py-3.5 px-4 text-center cursor-pointer hover:text-white" onClick={() => handleSortMatrix('healthScore')}>
                      Health {matrixSortField === 'healthScore' && (matrixSortAsc ? '▲' : '▼')}
                    </th>
                    <th className="py-3.5 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-950 font-mono">
                  {sortedTerritories.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-900/80 transition-colors group">
                      <td className="py-3.5 px-4">
                        <div className="font-black text-white group-hover:text-cyan-300 transition-colors text-sm">
                          {row.districtName}
                        </div>
                        <div className="text-xs text-slate-300 font-sans font-medium">{row.stateName}</div>
                      </td>
                      <td className="py-3.5 px-4 font-sans">
                        <div className="text-slate-100 font-bold">{row.coordinatorName}</div>
                        <div className="text-[10px] text-emerald-300 font-bold flex items-center gap-1 mt-0.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                          {row.coordinatorStatus}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-100 font-bold">{row.totalStudents}</td>
                      <td className="py-3.5 px-4 text-right text-slate-100 font-bold">{row.totalTeachers}</td>
                      <td className="py-3.5 px-4 text-right text-slate-100 font-bold">{row.totalLibraries}</td>
                      <td className="py-3.5 px-4 text-right font-black text-white">
                        <span className="bg-slate-900 px-2 py-1 rounded border border-slate-700">
                          ₹{row.grossGMV.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-black">
                        <span className="bg-cyan-950/80 text-cyan-200 border border-cyan-500/40 px-2 py-1 rounded">
                          ₹{row.platformNetRevenue.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-black ${
                          row.attendanceRate >= 93 
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50' 
                            : 'bg-amber-950/80 text-amber-300 border border-amber-500/50'
                        }`}>
                          {row.attendanceRate}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-purple-950/80 text-purple-200 border border-purple-500/50">
                          {row.healthScore}/100
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleDrilldownDistrict(row.districtName)}
                          className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-black transition-all text-xs cursor-pointer shadow-md"
                        >
                          Audit Dossier →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: TERRITORY DOSSIER (District Deep-Dive)
          ========================================================================= */}
      {activeTab === 'TERRITORY_DOSSIER' && districtData && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-950/80 via-slate-950 to-slate-950 border-2 border-blue-500/50 shadow-2xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-900/80 text-blue-200 border border-blue-400">
                  DISTRICT TERRITORY AUDIT DOSSIER
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white mt-2">{districtData.districtName} Operational Intelligence</h3>
                <p className="text-xs sm:text-sm text-slate-200 mt-1 font-medium">
                  Designated Coordinator: <span className="text-white font-bold">{districtData.adminName}</span> • State: {districtData.stateName} • Status: <span className="text-emerald-300 font-black">{districtData.adminStatus}</span>
                </p>
              </div>

              <div className="text-right p-4 bg-slate-950/90 border border-blue-500/40 rounded-2xl">
                <p className="text-xs text-slate-300 font-bold uppercase">Total District GMV</p>
                <p className="text-2xl sm:text-3xl font-black text-white font-mono">₹{districtData.totalGMV.toLocaleString('en-IN')}</p>
                <p className="text-xs text-emerald-300 font-bold">Net Platform Retained: ₹{districtData.netRevenue.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          {/* Vertical Performance Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {verticals.map((vert) => {
              const isTuition = vert.verticalKey === 'HOME_TUITION';
              const isLibrary = vert.verticalKey === 'STUDY_LIBRARY';
              const isMocks = vert.verticalKey === 'MOCK_EXAMS';

              const cardBg = isTuition 
                ? 'bg-blue-950/50 border-blue-500/50 shadow-blue-500/10'
                : isLibrary
                ? 'bg-purple-950/50 border-purple-500/50 shadow-purple-500/10'
                : isMocks
                ? 'bg-amber-950/50 border-amber-500/50 shadow-amber-500/10'
                : 'bg-emerald-950/50 border-emerald-500/50 shadow-emerald-500/10';

              const badgeColor = isTuition 
                ? 'bg-blue-900/80 text-blue-200 border-blue-400'
                : isLibrary
                ? 'bg-purple-900/80 text-purple-200 border-purple-400'
                : isMocks
                ? 'bg-amber-900/80 text-amber-200 border-amber-400'
                : 'bg-emerald-900/80 text-emerald-200 border-emerald-400';

              return (
                <div key={vert.verticalKey} className={`p-5 rounded-2xl border-2 flex flex-col justify-between ${cardBg} shadow-lg`}>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${badgeColor}`}>
                        {vert.verticalKey.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-black text-emerald-300">+{vert.growthPercentage}% YoY</span>
                    </div>
                    <h4 className="font-black text-white text-sm">{vert.title}</h4>
                    <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed font-medium">{vert.description}</p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-700/60 space-y-1.5 font-mono text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-300 font-sans font-bold">Gross GMV:</span>
                      <span className="font-black text-white">₹{vert.grossGMV.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300 font-sans font-bold">Disbursed:</span>
                      <span className="text-emerald-300 font-bold">₹{vert.partnerPayouts.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300 font-sans font-bold">Net Margin:</span>
                      <span className="text-cyan-200 font-black">₹{vert.platformNetRevenue.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Territory Financial Ledger & Discontinuations */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Tuition Card */}
            <div className="p-5 rounded-2xl bg-blue-950/40 border-2 border-blue-500/40 shadow-xl space-y-3">
              <h4 className="font-black text-blue-200 text-xs uppercase tracking-wider flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-400" />
                Home Tuition Vertical
              </h4>
              <div className="space-y-2.5 text-xs font-semibold">
                <div className="flex justify-between">
                  <span className="text-slate-300">Tuition Volume:</span>
                  <span className="font-black text-white font-mono">₹{districtData.tuitionGMV.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Teacher Disbursements:</span>
                  <span className="font-bold text-emerald-300 font-mono">₹{districtData.educatorPayouts.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Active Educators:</span>
                  <span className="font-black text-white font-mono">{districtData.totalTeachers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Quarterly Tutor Growth:</span>
                  <span className="font-bold text-emerald-300 font-mono">+{districtData.teacherGrowth}%</span>
                </div>
              </div>
            </div>

            {/* Library Card */}
            <div className="p-5 rounded-2xl bg-amber-950/40 border-2 border-amber-500/40 shadow-xl space-y-3">
              <h4 className="font-black text-amber-200 text-xs uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400" />
                Study Library Study Hall
              </h4>
              <div className="space-y-2.5 text-xs font-semibold">
                <div className="flex justify-between">
                  <span className="text-slate-300">Library GMV:</span>
                  <span className="font-black text-white font-mono">₹{districtData.libraryGMV.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Owner Disbursements:</span>
                  <span className="font-bold text-emerald-300 font-mono">₹{districtData.libraryPayouts.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Active Facilities:</span>
                  <span className="font-black text-white font-mono">{districtData.totalLibraries}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Quarterly Facility Growth:</span>
                  <span className="font-bold text-emerald-300 font-mono">+{districtData.libraryGrowth}%</span>
                </div>
              </div>
            </div>

            {/* Territory Margin Ledger Card */}
            <div className="p-5 rounded-2xl bg-purple-950/40 border-2 border-purple-500/40 shadow-xl space-y-3">
              <h4 className="font-black text-purple-200 text-xs uppercase tracking-wider flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-purple-400" />
                Territory Margin Ledger
              </h4>
              <div className="space-y-2.5 text-xs font-semibold">
                <div className="flex justify-between">
                  <span className="text-slate-300">Gross Platform Fee:</span>
                  <span className="font-black text-purple-200 font-mono">₹{districtData.platformCommission.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Coordinator Ops Expenses:</span>
                  <span className="font-bold text-rose-300 font-mono">-₹{districtData.districtExpenses.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-purple-500/30">
                  <span className="text-white font-bold">Net Platform Retained:</span>
                  <span className="font-black text-cyan-200 font-mono text-sm">₹{districtData.netRevenue.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Student Enrollment Trend:</span>
                  <span className="font-bold text-emerald-300 font-mono">+{districtData.studentGrowth}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: AI COGNITIVE STUDIO & ANOMALY RADAR
          (Backgrounds perfectly colored according to signal category and severity)
          ========================================================================= */}
      {activeTab === 'AI_COGNITIVE_STUDIO' && (
        <div className="space-y-6">
          {/* Executive AI Synthesis Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/90 via-slate-950 to-slate-950 border-2 border-purple-500/50 shadow-2xl relative overflow-hidden backdrop-blur-xl">
            <div className="flex items-start gap-4">
              <div className="p-3.5 rounded-2xl bg-purple-900/80 text-purple-200 border border-purple-400 shadow-lg">
                <Bot className="w-6 h-6 animate-pulse text-cyan-300" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-white">Autonomous Cognitive Intelligence Radar</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-400">
                    REAL-TIME SYNDICATE
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                  Real-time cognitive synthesis detecting supply deficits, turnstile discrepancies, peak shift congestions, and quarterly GMV runway projections across all active territories.
                </p>
              </div>
            </div>
          </div>

          {/* AI Signals & Anomaly Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiInsights.map((insight) => {
              const isCrit = insight.severity === 'CRITICAL';
              const isWarn = insight.severity === 'WARNING';
              const isPos = insight.severity === 'POSITIVE';

              const boxBg = isCrit
                ? 'bg-rose-950/50 border-2 border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.15)]'
                : isWarn
                ? 'bg-amber-950/50 border-2 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                : isPos
                ? 'bg-emerald-950/50 border-2 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                : 'bg-cyan-950/50 border-2 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)]';

              const badgeStyle = isCrit
                ? 'bg-rose-900/80 text-rose-200 border-rose-400'
                : isWarn
                ? 'bg-amber-900/80 text-amber-200 border-amber-400'
                : isPos
                ? 'bg-emerald-900/80 text-emerald-200 border-emerald-400'
                : 'bg-cyan-900/80 text-cyan-200 border-cyan-400';

              return (
                <div key={insight.id} className={`p-6 rounded-3xl ${boxBg} flex flex-col justify-between transition-all hover:scale-[1.01]`}>
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border uppercase tracking-wider ${badgeStyle}`}>
                          {insight.category}
                        </span>
                        <span className="text-xs text-slate-200 font-mono font-bold">{insight.territory}</span>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono text-cyan-200 font-black">{insight.confidenceScore}% Confidence</span>
                      </div>
                    </div>

                    <h4 className="text-base font-black text-white mt-3">{insight.title}</h4>
                    <p className="text-xs sm:text-sm text-slate-100 mt-1 leading-relaxed font-medium">{insight.description}</p>

                    <div className="mt-4 p-3.5 rounded-xl bg-slate-950/90 border border-slate-700/80 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300 font-bold">Impact Evaluation:</span>
                        <span className="text-amber-300 font-mono font-black">{insight.metricImpact}</span>
                      </div>
                      <div className="text-slate-200 pt-2 border-t border-slate-800 text-xs">
                        <span className="text-cyan-300 font-black mr-1">Recommended Action:</span>
                        {insight.recommendedAction}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between">
                    <span className="text-[11px] text-slate-300 font-medium">{insight.timestamp}</span>
                    <button
                      onClick={() => {
                        soundEngine.play('confirm');
                        showToast(`Action initiated for ${insight.title}`, 'success');
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-purple-600 text-white font-bold text-xs border border-slate-700 hover:border-purple-400 transition-all cursor-pointer shadow-md"
                    >
                      Acknowledge & Deploy →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: STATUTORY GST & LEGAL REGULATORY AUDIT
          ========================================================================= */}
      {activeTab === 'TAX_REGULATORY_AUDIT' && taxAudit && (
        <div className="space-y-6">
          {/* Header */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/80 via-slate-950 to-slate-950 border-2 border-emerald-500/50 shadow-2xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-900/80 text-emerald-200 border border-emerald-400">
                  GOVERNMENT COMPLIANCE & GST RECONCILIATION
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white mt-2">Statutory Tax & Regulatory Audit Ledger</h3>
                <p className="text-xs sm:text-sm text-slate-200 mt-1 font-medium">
                  Scope: <span className="text-white font-bold">{taxAudit.territory}</span> • Reporting Period: <span className="text-cyan-300 font-mono font-bold">{taxAudit.reportingPeriod}</span> • 18% GST Compliance Standard
                </p>
              </div>

              <div className="text-right">
                <button
                  onClick={() => handleTriggerExport('TAX')}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] border border-emerald-400 cursor-pointer transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Tax Reconciliation</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tax Ledger Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* GST Withholding */}
            <div className="p-6 rounded-3xl bg-emerald-950/40 border-2 border-emerald-500/40 shadow-xl space-y-3 font-mono">
              <h4 className="font-black text-emerald-200 text-xs uppercase tracking-wider font-sans flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-emerald-400" />
                GST Statutory Withholding
              </h4>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-300 font-sans font-bold">Gross Taxable GMV:</span>
                  <span className="font-black text-white">₹{taxAudit.grossTaxableGMV.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 font-sans font-bold">CGST (9.0% Central):</span>
                  <span className="text-purple-200 font-bold">₹{taxAudit.cgstAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 font-sans font-bold">SGST (9.0% State):</span>
                  <span className="text-purple-200 font-bold">₹{taxAudit.sgstAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-emerald-500/30">
                  <span className="text-white font-extrabold font-sans">Total GST Liability:</span>
                  <span className="font-black text-amber-300 text-sm">₹{(taxAudit.cgstAmount + taxAudit.sgstAmount).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Input Tax Credit & Treasury */}
            <div className="p-6 rounded-3xl bg-cyan-950/40 border-2 border-cyan-500/40 shadow-xl space-y-3 font-mono">
              <h4 className="font-black text-cyan-200 text-xs uppercase tracking-wider font-sans flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                Input Tax Credit & Net Treasury
              </h4>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-300 font-sans font-bold">Eligible ITC Claimed:</span>
                  <span className="text-emerald-300 font-black">-₹{taxAudit.inputTaxCreditEligible.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 font-sans font-bold">Net GST Payable:</span>
                  <span className="font-black text-cyan-200 text-sm">₹{taxAudit.netGstPayable.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 font-sans font-bold">TDS on Disbursements (1%):</span>
                  <span className="text-slate-100 font-bold">₹{taxAudit.tdsDeductedOnPayouts.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-cyan-500/30">
                  <span className="text-white font-extrabold font-sans">GST Filing Status:</span>
                  <span className="text-emerald-300 font-black font-sans">GSTR-1 & 3B Ready</span>
                </div>
              </div>
            </div>

            {/* Legal & Safety Compliance */}
            <div className="p-6 rounded-3xl bg-purple-950/40 border-2 border-purple-500/40 shadow-xl space-y-3 font-mono">
              <h4 className="font-black text-purple-200 text-xs uppercase tracking-wider font-sans flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-400" />
                Legal & Safety Compliance
              </h4>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-300 font-sans font-bold">Educator KYC Authenticated:</span>
                  <span className="text-emerald-300 font-black">{taxAudit.educatorKycComplianceRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 font-sans font-bold">Police Background Clearance:</span>
                  <span className="text-emerald-300 font-black">{taxAudit.policeClearanceRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 font-sans font-bold">Study Hall Fire Safety Audit:</span>
                  <span className="text-cyan-200 font-black">{taxAudit.libraryFireSafetyScore}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 font-sans font-bold">CCTV 30-Day Turnstile Backup:</span>
                  <span className="text-emerald-300 font-black">{taxAudit.cctvBiometricIntegrity}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Standard Regulatory Reports Catalog */}
          <div className="pt-4 border-t border-slate-800">
            <h4 className="font-black text-white text-base mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
              Pre-Packaged Statutory Regulatory Dossiers
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 rounded-3xl bg-slate-950 border-2 border-blue-500/40 shadow-xl flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="p-2.5 w-fit rounded-xl bg-blue-900/80 text-blue-200 border border-blue-400">
                    <Globe className="w-5 h-5" />
                  </div>
                  <h5 className="font-black text-white text-base">District Territory Comparison Matrix</h5>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                    Audited performance matrix across Ghazipur, Saidpur, Varanasi, Mau, Ballia, and Lucknow detailing student demand, tutor density, and fulfillment velocity.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => handleTriggerExport('MATRIX')}
                    className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-100 hover:text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-300" />
                    <span>Export Matrix</span>
                  </button>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-slate-950 border-2 border-emerald-500/40 shadow-xl flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="p-2.5 w-fit rounded-xl bg-emerald-900/80 text-emerald-200 border border-emerald-400">
                    <IndianRupee className="w-5 h-5" />
                  </div>
                  <h5 className="font-black text-white text-base">Statewide GST Reconciliation Statement</h5>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                    Statutory statements of gross transaction turnover, 18% GST liability with input credit deductions, platform fee retainment, and partner bank payouts.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => handleTriggerExport('TAX')}
                    className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-400 text-slate-100 hover:text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Export Reconciliation</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: AD-HOC QUERY BUILDER
          ========================================================================= */}
      {activeTab === 'QUERY_BUILDER' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-950 border-2 border-purple-500/40 shadow-2xl">
            <h3 className="text-lg font-black text-white flex items-center gap-2 mb-2">
              <Sliders className="w-5 h-5 text-purple-400" />
              Dynamic On-Demand Intelligence Query Builder
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 mb-6 font-medium">
              Select specific metrics, territory scope, and grouping logic to assemble tailor-made intelligence tables.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Scope Selection */}
              <div>
                <label className="text-xs font-extrabold text-slate-200 uppercase tracking-wider block mb-1.5">Scope</label>
                <select
                  value={customQueryDef.territoryLevel}
                  onChange={(e) => setCustomQueryDef({ ...customQueryDef, territoryLevel: e.target.value as any })}
                  className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold outline-none focus:border-purple-400 cursor-pointer"
                >
                  <option value="PAN_INDIA">Pan-India (All Operational Territories)</option>
                  <option value="STATE">State-Scoped (Uttar Pradesh)</option>
                  <option value="DISTRICT">Specific District Scope</option>
                </select>
              </div>

              {/* District Filter if scoped */}
              {customQueryDef.territoryLevel === 'DISTRICT' && (
                <div>
                  <label className="text-xs font-extrabold text-slate-200 uppercase tracking-wider block mb-1.5">Target District</label>
                  <select
                    value={customQueryDef.selectedDistrict}
                    onChange={(e) => setCustomQueryDef({ ...customQueryDef, selectedDistrict: e.target.value })}
                    className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold outline-none focus:border-purple-400 cursor-pointer"
                  >
                    {activeDistricts.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                    <option value="Varanasi">Varanasi</option>
                    <option value="Lucknow">Lucknow</option>
                    <option value="Mau">Mau</option>
                  </select>
                </div>
              )}

              {/* Date Range */}
              <div>
                <label className="text-xs font-extrabold text-slate-200 uppercase tracking-wider block mb-1.5">Date Window</label>
                <select
                  value={customQueryDef.dateRange}
                  onChange={(e) => setCustomQueryDef({ ...customQueryDef, dateRange: e.target.value })}
                  className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold outline-none focus:border-purple-400 cursor-pointer"
                >
                  <option value="Last 7 Days">Last 7 Days</option>
                  <option value="Last 30 Days (Current Month)">Last 30 Days</option>
                  <option value="Current Quarter (Q2 2026)">Current Quarter</option>
                  <option value="Financial Year 2026-27">Financial Year 2026-27</option>
                </select>
              </div>
            </div>

            {/* Metrics Checklist */}
            <div className="mt-6">
              <label className="text-xs font-extrabold text-slate-200 uppercase tracking-wider block mb-2.5">Metrics to Include</label>
              <div className="flex flex-wrap gap-2.5">
                {[
                  { key: 'GMV', label: 'Gross GMV (₹)' },
                  { key: 'NET_REVENUE', label: 'Platform Net Margin (₹)' },
                  { key: 'STUDENTS', label: 'Enrolled Students' },
                  { key: 'TEACHERS', label: 'Verified Educators' },
                  { key: 'LIBRARIES', label: 'Study Libraries' },
                  { key: 'ATTENDANCE', label: 'Attendance Integrity (%)' },
                  { key: 'GROWTH', label: 'Operational Health Score' },
                ].map((m) => {
                  const isChecked = customQueryDef.metrics.includes(m.key as any);
                  return (
                    <button
                      key={m.key}
                      onClick={() => {
                        soundEngine.play('click');
                        const next = isChecked
                          ? customQueryDef.metrics.filter(x => x !== m.key)
                          : [...customQueryDef.metrics, m.key as any];
                        setCustomQueryDef({ ...customQueryDef, metrics: next });
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all border cursor-pointer ${
                        isChecked
                          ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                          : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {isChecked ? '✓ ' : '+ '} {m.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleExecuteCustomQuery}
                disabled={queryRunning}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-600/30 transition-all border border-purple-400"
              >
                <Play className={`w-4 h-4 ${queryRunning ? 'animate-spin' : ''}`} />
                <span>{queryRunning ? 'Synthesizing...' : 'Execute Custom Query'}</span>
              </button>
            </div>
          </div>

          {/* Query Results Table */}
          {customQueryResult && (
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-700/80 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-base font-black text-white">Synthesized Query Results</h4>
                  <p className="text-xs text-cyan-300 font-mono font-bold">{customQueryResult.totalRecords} records compiled</p>
                </div>
                <button
                  onClick={() => {
                    setExportPayload({
                      data: customQueryResult.rows,
                      title: 'Custom Query Results',
                      filename: 'custom_query_results'
                    });
                    setIsExportOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 hover:text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Export Table</span>
                </button>
              </div>

              <div className="overflow-x-auto rounded-2xl border-2 border-slate-800">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-900 text-slate-200 font-black border-b-2 border-slate-700 text-[11px] uppercase">
                    <tr>
                      {customQueryResult.columns.map((c) => (
                        <th key={c} className="py-3 px-4">{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-950 font-mono">
                    {customQueryResult.rows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/60">
                        {customQueryResult.columns.map((c) => (
                          <td key={c} className="py-3 px-4 text-slate-100 font-bold">{row[c] || '—'}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 6: AUTOMATED DISPATCH SCHEDULER
          ========================================================================= */}
      {activeTab === 'SCHEDULED_DISPATCH' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-950 border-2 border-purple-500/40 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  Automated Intelligence Dispatch Scheduler
                </h3>
                <p className="text-xs sm:text-sm text-slate-200 font-medium">
                  Configure recurring autonomous report deliveries to executive stakeholders, state coordinators, and audit authorities.
                </p>
              </div>

              <button
                onClick={() => {
                  soundEngine.play('click');
                  setIsNewDispatchOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-600/30 border border-purple-400 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>New Scheduled Dispatch</span>
              </button>
            </div>

            <div className="space-y-3.5">
              {scheduledList.map((item) => (
                <div
                  key={item.id}
                  className={`p-5 rounded-2xl border-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
                    item.active
                      ? 'bg-emerald-950/20 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                      : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                        item.active 
                          ? 'bg-emerald-900/80 text-emerald-200 border-emerald-400' 
                          : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}>
                        {item.active ? 'ACTIVE DISPATCH' : 'PAUSED'}
                      </span>
                      <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-900 text-cyan-300 border border-slate-700">
                        {item.frequency} • {item.format}
                      </span>
                    </div>
                    <h4 className="text-base font-black text-white">{item.title}</h4>
                    <p className="text-xs text-slate-200 font-medium">
                      Scope: <span className="text-cyan-300 font-bold">{item.territoryName}</span> • Recipients: <span className="text-purple-200 font-mono font-bold">{item.recipients.join(', ')}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                    <div className="text-right text-xs text-slate-300 hidden sm:block font-medium">
                      <div>Next Run: <span className="text-white font-mono font-bold">{item.nextRunTimestamp}</span></div>
                      {item.lastRunTimestamp && <div>Last Run: <span className="text-slate-400 font-mono">{item.lastRunTimestamp}</span></div>}
                    </div>

                    <button
                      onClick={() => handleToggleDispatch(item.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all border cursor-pointer ${
                        item.active 
                          ? 'bg-slate-900 text-slate-200 border-slate-700 hover:text-white' 
                          : 'bg-purple-600 text-white border-purple-400 shadow-md'
                      }`}
                    >
                      {item.active ? 'Pause' : 'Activate'}
                    </button>

                    <button
                      onClick={() => {
                        soundEngine.play('confirm');
                        showToast(`Simulated dispatch dispatched for "${item.title}"`, 'success');
                      }}
                      className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:text-cyan-300 text-slate-300 transition-colors cursor-pointer"
                      title="Run Test Dispatch Now"
                    >
                      <Play className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteDispatch(item.id)}
                      className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:text-rose-400 text-slate-300 transition-colors cursor-pointer"
                      title="Delete Schedule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          NEW DISPATCH MODAL (High-Contrast Cyber Styling)
          ========================================================================= */}
      {isNewDispatchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-950 border-2 border-purple-500/50 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              Schedule Automated Intelligence Dispatch
            </h3>
            <p className="text-xs text-slate-200 font-medium">
              Configure autonomous delivery of executive reports to stakeholders.
            </p>

            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block mb-1">Dispatch Title</label>
                <input
                  type="text"
                  value={newDispatchTitle}
                  onChange={(e) => setNewDispatchTitle(e.target.value)}
                  placeholder="e.g. Weekly District GMV Digest"
                  className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-purple-400 outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block mb-1">Frequency</label>
                  <select
                    value={newDispatchFreq}
                    onChange={(e) => setNewDispatchFreq(e.target.value as any)}
                    className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-purple-400 outline-none font-medium cursor-pointer"
                  >
                    <option value="DAILY">Daily (08:00 IST)</option>
                    <option value="WEEKLY">Weekly (Monday 09:00 IST)</option>
                    <option value="MONTHLY">Monthly (1st of Month)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block mb-1">Export Format</label>
                  <select
                    value={newDispatchFormat}
                    onChange={(e) => setNewDispatchFormat(e.target.value as any)}
                    className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-purple-400 outline-none font-medium cursor-pointer"
                  >
                    <option value="PDF">PDF Dossier</option>
                    <option value="CSV">CSV Data File</option>
                    <option value="JSON">JSON Schema Payload</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block mb-1">Stakeholder Email Recipients (comma-separated)</label>
                <input
                  type="text"
                  value={newDispatchRecipients}
                  onChange={(e) => setNewDispatchRecipients(e.target.value)}
                  placeholder="email1@domain.com, email2@domain.com"
                  className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-purple-400 outline-none font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-800">
              <button
                onClick={() => setIsNewDispatchOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:text-white text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDispatch}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs cursor-pointer shadow-lg shadow-purple-600/30 border border-purple-400"
              >
                Create Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Format Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        data={exportPayload.data}
        title={exportPayload.title}
        filename={exportPayload.filename}
      />
    </div>
  );
};
