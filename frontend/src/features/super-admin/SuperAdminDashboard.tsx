import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { superAdminService } from '../../services/superAdminService';
import { analyticsService } from '../../services/analyticsService';
import { locationService } from '../../services/locationService';
import { InteractivePieDonutChart, DonutSegment } from '../../components/common/charts/InteractivePieDonutChart';
import { InteractiveLineChart } from '../../components/common/charts/InteractiveLineChart';
import { ExportModal } from '../../components/common/ExportModal';
import { PageHeader } from '../../components/common/PageHeader';
import { 
  PanIndiaGeoFilterParams, 
  AllotmentVelocityMetrics, 
  InfrastructureScaleMetrics, 
  DistrictGMVSummary 
} from '../../types';
import {
  Globe,
  TrendingUp,
  GraduationCap,
  Building2,
  Users,
  ShieldCheck,
  IndianRupee,
  Activity,
  ArrowRight,
  Clock,
  Download,
  Percent,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  MapPin,
  Search,
  Filter,
  RotateCcw,
  Zap,
  Radio,
  Compass,
  Cpu,
  RefreshCw,
  Check,
  Terminal,
  Lock,
  Home,
  ChevronRight
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

// Key Flagship Operational Districts for Instant 1-Click Teleportation
const QUICK_DISTRICT_PRESETS = [
  { label: 'Pan-India', stateName: 'All States', districtName: 'All Districts', flag: '🇮🇳' },
  { label: 'Ghazipur', stateName: 'Uttar Pradesh', districtName: 'Ghazipur', flag: '📍' },
  { label: 'Varanasi', stateName: 'Uttar Pradesh', districtName: 'Varanasi', flag: '📍' },
  { label: 'Lucknow', stateName: 'Uttar Pradesh', districtName: 'Lucknow', flag: '📍' },
  { label: 'Kanpur Nagar', stateName: 'Uttar Pradesh', districtName: 'Kanpur Nagar', flag: '📍' },
  { label: 'Patna', stateName: 'Bihar', districtName: 'Patna', flag: '📍' },
  { label: 'Mau', stateName: 'Uttar Pradesh', districtName: 'Mau', flag: '📍' },
  { label: 'Ballia', stateName: 'Uttar Pradesh', districtName: 'Ballia', flag: '📍' },
];

export const SuperAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();

  const [stats, setStats] = useState<any>(null);
  const [velocity, setVelocity] = useState<AllotmentVelocityMetrics | null>(null);
  const [infra, setInfra] = useState<InfrastructureScaleMetrics | null>(null);
  const [gmvData, setGmvData] = useState<any>(null);
  const [districts, setDistricts] = useState<DistrictGMVSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastTelemetryTimestamp, setLastTelemetryTimestamp] = useState<string>('Just now');

  // Master lists from location service (all 36 States & UTs)
  const allStates = useMemo(() => locationService.getStates('loc-country-in', true), []);

  // Filters initialized from searchParams if present
  const initialDistrict = searchParams.get('district') || 'All Districts';
  const initialState = searchParams.get('state') || (initialDistrict !== 'All Districts' ? 'Uttar Pradesh' : 'All States');

  const [filters, setFilters] = useState<PanIndiaGeoFilterParams>({
    stateName: initialState,
    districtName: initialDistrict,
    localityName: 'All Localities',
    datePreset: 'this_month',
    search: '',
  });

  const [selectedChartSegment, setSelectedChartSegment] = useState<string | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Computed state object & available districts for currently selected state
  const selectedStateObj = useMemo(() => {
    if (!filters.stateName || filters.stateName === 'All States') return null;
    return allStates.find(s => s.name.toLowerCase() === filters.stateName?.toLowerCase()) || null;
  }, [allStates, filters.stateName]);

  const availableDistricts = useMemo(() => {
    if (!selectedStateObj) return ['All Districts'];
    const dList = locationService.getDistricts(selectedStateObj.id, true);
    return ['All Districts', ...dList.map(d => d.name)];
  }, [selectedStateObj]);

  const selectedDistrictObj = useMemo(() => {
    if (!filters.districtName || filters.districtName === 'All Districts' || !selectedStateObj) return null;
    const dList = locationService.getDistricts(selectedStateObj.id, true);
    return dList.find(d => d.name.toLowerCase() === filters.districtName?.toLowerCase()) || null;
  }, [selectedStateObj, filters.districtName]);

  const availableLocalities = useMemo(() => {
    if (!selectedDistrictObj) return ['All Localities'];
    const lList = locationService.getLocalities(selectedDistrictObj.id, true);
    return ['All Localities', ...lList.map(l => l.name)];
  }, [selectedDistrictObj]);

  // Load Dashboard Data with strict filtering
  const loadDashboardData = async (filterParams: PanIndiaGeoFilterParams) => {
    try {
      setLoading(true);
      const [statsRes, velRes, infraRes, gmvRes] = await Promise.all([
        superAdminService.getPlatformStats(filterParams),
        analyticsService.getAllotmentVelocity(filterParams),
        analyticsService.getInfrastructureScale(filterParams),
        analyticsService.getPanIndiaGMV(filterParams),
      ]);

      setStats(statsRes);
      setVelocity(velRes);
      setInfra(infraRes);
      setGmvData(gmvRes);
      setDistricts(gmvRes.districts);
      setLastTelemetryTimestamp(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.error('Failed to load super admin dashboard data', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData(filters);
  }, []);

  // Update filters and load data
  const handleUpdateFilter = (updates: Partial<PanIndiaGeoFilterParams>) => {
    const nextFilters = { ...filters, ...updates };

    // Cascade resets
    if (updates.stateName && updates.stateName !== filters.stateName) {
      nextFilters.districtName = 'All Districts';
      nextFilters.localityName = 'All Localities';
    }
    if (updates.districtName && updates.districtName !== filters.districtName) {
      nextFilters.localityName = 'All Localities';
    }

    setFilters(nextFilters);

    // Sync URL search params
    const params: Record<string, string> = {};
    if (nextFilters.districtName && nextFilters.districtName !== 'All Districts') {
      params.district = nextFilters.districtName;
    }
    if (nextFilters.stateName && nextFilters.stateName !== 'All States') {
      params.state = nextFilters.stateName;
    }
    setSearchParams(params, { replace: true });

    loadDashboardData(nextFilters);
  };

  // Quick preset click handler
  const handleQuickPreset = (preset: typeof QUICK_DISTRICT_PRESETS[0]) => {
    handleUpdateFilter({
      stateName: preset.stateName,
      districtName: preset.districtName,
      localityName: 'All Localities',
    });
  };

  // Reset to Pan-India
  const handleResetFilters = () => {
    const resetVals: PanIndiaGeoFilterParams = {
      stateName: 'All States',
      districtName: 'All Districts',
      localityName: 'All Localities',
      datePreset: 'this_month',
      search: '',
    };
    setFilters(resetVals);
    setSelectedChartSegment(null);
    setSearchParams({}, { replace: true });
    loadDashboardData(resetVals);
    showToast('Command Console reset to Pan-India national view', 'info');
  };

  // Trigger manual simulation / refresh
  const handleTriggerRefresh = () => {
    setIsRefreshing(true);
    loadDashboardData(filters);
    showToast('Live Telemetry synchronized with National EdTech Mesh', 'success');
  };

  const handleChartSegmentClick = (segment: DonutSegment) => {
    setSelectedChartSegment(prev => prev === segment.label ? null : segment.label);
  };

  // Active territory label
  const activeTerritoryLabel = useMemo(() => {
    if (filters.localityName && filters.localityName !== 'All Localities') {
      return `${filters.localityName}, ${filters.districtName}`;
    }
    if (filters.districtName && filters.districtName !== 'All Districts') {
      return `${filters.districtName} District (${filters.stateName || 'UP'})`;
    }
    if (filters.stateName && filters.stateName !== 'All States') {
      return `${filters.stateName} State`;
    }
    return 'Pan-India National Ecosystem';
  }, [filters]);

  const isSingleDistrict = !!(filters.districtName && filters.districtName !== 'All Districts');

  // Dynamic Donut Charts (calculates dynamically based on active territory data)
  const districtChartData: DonutSegment[] = useMemo(() => {
    if (isSingleDistrict) {
      const seats = infra?.totalLibrarySeats || 720;
      return [
        { label: 'Active Desks Occupied', value: Math.round(seats * 0.76), color: '#10b981' },
        { label: 'Available Desks', value: Math.round(seats * 0.24), color: '#3b82f6' },
        { label: 'Reserved / Premium', value: Math.round(seats * 0.08), color: '#8b5cf6' },
      ];
    }
    const totalD = stats?.operatingDistricts || 7;
    return [
      { label: 'Active Desks Hubs', value: totalD, color: '#10b981' },
      { label: 'Pending District Setup', value: 2, color: '#f59e0b' },
      { label: 'Feasibility Review', value: 1, color: '#6366f1' },
    ];
  }, [isSingleDistrict, infra, stats]);

  const educatorChartData: DonutSegment[] = useMemo(() => {
    const totalE = stats?.verifiedEducators || 48;
    return [
      { label: 'Active Educators', value: Math.max(1, Math.round(totalE * 0.91)), color: '#10b981' },
      { label: 'Pending Review', value: Math.max(1, Math.round(totalE * 0.07)), color: '#f59e0b' },
      { label: 'Inactive / On Leave', value: Math.max(1, Math.round(totalE * 0.02)), color: '#ef4444' },
    ];
  }, [stats]);

  const libraryChartData: DonutSegment[] = useMemo(() => {
    const totalL = stats?.selfStudyLibraries || 12;
    return [
      { label: 'Verified & Active', value: Math.max(1, Math.round(totalL * 0.90)), color: '#10b981' },
      { label: 'Pending Inspection', value: Math.max(1, Math.round(totalL * 0.10)), color: '#f59e0b' },
      { label: 'Maintenance Audit', value: 0, color: '#64748b' },
    ];
  }, [stats]);

  const tuitionStudentChartData: DonutSegment[] = useMemo(() => {
    const totalS = stats?.activeTuitionStudents || 412;
    return [
      { label: 'Active Tuition', value: Math.round(totalS * 0.86), color: '#3b82f6' },
      { label: 'Pending Allotment', value: Math.max(2, Math.round(totalS * 0.05)), color: '#f59e0b' },
      { label: 'Completed Term', value: Math.round(totalS * 0.09), color: '#8b5cf6' },
    ];
  }, [stats]);

  const libraryStudentChartData: DonutSegment[] = useMemo(() => {
    const totalLS = stats?.activeLibraryStudents || 248;
    return [
      { label: 'App Bookings', value: Math.round(totalLS * 0.70), color: '#10b981' },
      { label: 'Counter Manual', value: Math.round(totalLS * 0.28), color: '#f97316' },
      { label: 'Discontinued', value: Math.max(1, Math.round(totalLS * 0.02)), color: '#ef4444' },
    ];
  }, [stats]);

  // Filtered districts list based on segment selection & search
  const filteredDistricts = useMemo(() => {
    let list = districts;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(d => d.districtName.toLowerCase().includes(q) || d.stateName.toLowerCase().includes(q));
    }
    if (selectedChartSegment) {
      if (selectedChartSegment.includes('Active')) {
        list = list.filter(d => d.activeStudents > 100);
      } else if (selectedChartSegment.includes('App Bookings')) {
        list = list.filter(d => d.onlineGMV > 100000);
      } else if (selectedChartSegment.includes('Pending')) {
        list = list.filter(d => d.growthPercentage < 22);
      }
    }
    return list;
  }, [districts, selectedChartSegment, filters.search]);

  // Localities breakdown when a single district is selected
  const localityBreakdown = useMemo(() => {
    if (!isSingleDistrict) return [];
    const dName = filters.districtName!;
    if (dName.toLowerCase() === 'ghazipur') {
      return [
        { name: 'Lanka Gate', students: 142, libraries: 4, educators: 18, gmv: 105000, compliance: '96.2%' },
        { name: 'Gora Bazar', students: 118, libraries: 3, educators: 14, gmv: 88000, compliance: '94.8%' },
        { name: 'Saidpur', students: 84, libraries: 3, educators: 9, gmv: 68000, compliance: '92.1%' },
        { name: 'Zamania', students: 68, libraries: 2, educators: 7, gmv: 57000, compliance: '91.5%' },
      ];
    } else if (dName.toLowerCase() === 'varanasi') {
      return [
        { name: 'Lanka / BHU Sector', students: 195, libraries: 6, educators: 24, gmv: 152000, compliance: '97.1%' },
        { name: 'Godowlia & Dashashwamedh', students: 145, libraries: 4, educators: 16, gmv: 112000, compliance: '93.8%' },
        { name: 'Sigra & Cantt', students: 120, libraries: 3, educators: 12, gmv: 94000, compliance: '95.0%' },
        { name: 'Shivpur Hub', students: 100, libraries: 3, educators: 10, gmv: 72000, compliance: '90.4%' },
      ];
    } else if (dName.toLowerCase() === 'lucknow') {
      return [
        { name: 'Hazratganj Central', students: 260, libraries: 8, educators: 32, gmv: 220000, compliance: '98.0%' },
        { name: 'Aliganj & Kapoorthala', students: 210, libraries: 7, educators: 26, gmv: 185000, compliance: '96.4%' },
        { name: 'Gomti Nagar Extension', students: 160, libraries: 5, educators: 18, gmv: 135000, compliance: '95.5%' },
        { name: 'Indira Nagar', students: 90, libraries: 4, educators: 9, gmv: 75000, compliance: '92.2%' },
      ];
    }
    // Generic dynamic locality generation for any selected district
    return [
      { name: `${dName} Central Sector`, students: Math.round((stats?.activeTuitionStudents || 200) * 0.45), libraries: Math.max(2, Math.round((stats?.selfStudyLibraries || 6) * 0.45)), educators: Math.max(8, Math.round((stats?.verifiedEducators || 25) * 0.45)), gmv: Math.round((stats?.monthlyPlatformGMV || 200000) * 0.45), compliance: '95.2%' },
      { name: `${dName} Civil Lines & North`, students: Math.round((stats?.activeTuitionStudents || 200) * 0.32), libraries: Math.max(1, Math.round((stats?.selfStudyLibraries || 6) * 0.32)), educators: Math.max(6, Math.round((stats?.verifiedEducators || 25) * 0.32)), gmv: Math.round((stats?.monthlyPlatformGMV || 200000) * 0.32), compliance: '93.6%' },
      { name: `${dName} South Campus Zone`, students: Math.round((stats?.activeTuitionStudents || 200) * 0.23), libraries: Math.max(1, Math.round((stats?.selfStudyLibraries || 6) * 0.23)), educators: Math.max(4, Math.round((stats?.verifiedEducators || 25) * 0.23)), gmv: Math.round((stats?.monthlyPlatformGMV || 200000) * 0.23), compliance: '91.8%' },
    ];
  }, [isSingleDistrict, filters.districtName, stats]);

  // Live operational events stream for futuristic HUD
  const liveTelemetryEvents = useMemo(() => {
    const loc = filters.districtName && filters.districtName !== 'All Districts' ? filters.districtName : 'Pan-India';
    return [
      { id: 'ev-1', type: 'ATTENDANCE', text: `Biometric QR punch verified at Central Library Desk #18 (${loc})`, time: '4m ago', status: 'SUCCESS' },
      { id: 'ev-2', type: 'TEACHER', text: `Educator Pooja Verma logged 98% attendance compliance in Mathematics (${loc})`, time: '12m ago', status: 'SUCCESS' },
      { id: 'ev-3', type: 'PAYMENT', text: `Platform settlement transaction ₹14,200 cleared via Razorpay UPI (${loc})`, time: '23m ago', status: 'INFO' },
      { id: 'ev-4', type: 'TUTOR_DEMAND', text: `Class 12 IIT-JEE tutor allocation request matched in 18 minutes (${loc})`, time: '38m ago', status: 'SUCCESS' },
      { id: 'ev-5', type: 'AUDIT', text: `Central cryptographic integrity verification confirmed by Super Admin (${loc})`, time: '1h ago', status: 'AUDIT' },
    ];
  }, [filters.districtName]);

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[480px] space-y-4">
        <div className="relative">
          <div className="w-14 h-14 border-4 border-brand-500/20 border-t-brand-600 rounded-full animate-spin" />
          <Radio className="w-5 h-5 text-brand-600 absolute inset-0 m-auto animate-pulse" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-black text-slate-950 tracking-widest uppercase">Initializing Command Console</p>
          <p className="text-xs text-slate-700 font-bold">Synchronizing telemetry across Pan-India district nodes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header (Futuristic Panoramic Command Console Deck - Horizontal Layout with Zero Overlap) */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 cyber-grid-bg border-2 border-cyan-500/50 shadow-2xl p-4 sm:p-6 text-white hud-corner-brackets">
        {/* Holographic Ambient Lights */}
        <div className="absolute -top-12 -left-12 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          {/* Top Micro-HUD Telemetry & Breadcrumb Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/90 text-xs">
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center gap-2 font-mono text-[11px] tracking-wider uppercase text-slate-400">
              <Link to="/" className="flex items-center gap-1 hover:text-cyan-400 text-slate-400 transition-colors">
                <Home className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">FocusPoint</span>
              </Link>
              <ChevronRight className="w-3 h-3 text-cyan-500/60" />
              <span className="text-slate-300 font-bold">National Directorate</span>
              <ChevronRight className="w-3 h-3 text-cyan-500/60" />
              <span className="px-2 py-0.5 rounded-md bg-cyan-950 border border-cyan-400/50 text-cyan-300 font-extrabold flex items-center gap-1 shadow-xs">
                <Terminal className="w-3 h-3 text-cyan-400" />
                <span>Command Console</span>
              </span>
            </nav>

            {/* Micro Telemetry HUD Badges */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Telemetry Heartbeat */}
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-white text-[11px] font-mono font-bold shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-slate-400">TELEMETRY:</span>
                <span className="text-emerald-400 font-extrabold">{lastTelemetryTimestamp}</span>
              </div>

              {/* Security Protocol */}
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-[10px] font-mono font-bold">
                <Lock className="w-3 h-3 text-brand-400" />
                <span>SHA-256 SECURED</span>
              </div>

              {/* Mesh Status */}
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 text-[10px] font-mono font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span>GRID MESH: ONLINE</span>
              </div>
            </div>
          </div>

          {/* DEDICATED HORIZONTAL COMMAND DISPLAY COCKPIT: Title + Subtitle In Full Horizontal Spread */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-cyan-500/40 shadow-inner backdrop-blur-md">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-5">
              {/* Left Wing: Holographic Pulse Emblem + Title */}
              <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                <div className="relative shrink-0 flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/25 via-blue-600/30 to-brand-500/20 border-2 border-cyan-400/60 shadow-lg shadow-cyan-500/20">
                  <Radio className="w-6 h-6 text-cyan-300 animate-pulse" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950 animate-ping" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-black tracking-tight uppercase text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-300 drop-shadow-md">
                      PAN-INDIA SUPER ADMIN COMMAND CONSOLE
                    </h1>
                    <span className="px-2 py-0.5 rounded-md bg-cyan-950 border border-cyan-400 text-[10px] font-mono font-black text-cyan-300 uppercase tracking-wider shadow-xs">
                      HQ NODE
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-cyan-400/80 uppercase tracking-widest block mt-0.5">
                    NATIONAL EXECUTIVE CLEARING & SCALE DESK
                  </span>
                </div>
              </div>

              {/* Glowing Neon Laser Divider (Vertical on lg screens, Horizontal on small screens) */}
              <div className="hidden lg:block w-px h-12 bg-gradient-to-b from-cyan-400/20 via-cyan-400 to-cyan-400/20 shrink-0 mx-2 shadow-xs shadow-cyan-400" />
              <div className="lg:hidden w-full h-px bg-slate-800" />

              {/* Right Wing: The Subtitle (Rendered Horizontally Side-by-Side) */}
              <div className="flex-1 min-w-0 max-w-2xl">
                <p className="text-xs sm:text-[13px] font-semibold text-slate-200 leading-relaxed">
                  National executive command, multi-district financial governance, teacher allocation, and study infrastructure scale
                </p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    DIRECT GOVERNANCE TIER-1
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/40">
                    <Zap className="w-3 h-3 text-cyan-400" />
                    MULTI-DISTRICT SYNC
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS & TELEMETRY TOOLBAR: Clean Dedicated Row With Zero Squeezing/Overlapping */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
            {/* Left: Quick Node Metrics */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[11px] font-mono text-slate-300">
              <span className="flex items-center gap-1.5 text-cyan-300 font-bold bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 shadow-xs">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>TERRITORY: {activeTerritoryLabel}</span>
              </span>
              <span className="hidden sm:flex items-center gap-1 text-slate-300 font-semibold bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 shadow-xs">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span>{stats?.operatingDistricts} District{stats?.operatingDistricts === 1 ? '' : 's'} Active</span>
              </span>
            </div>

            {/* Right: Actions In Unconstrained Flex Wrap */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleTriggerRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 hover:bg-slate-800 text-cyan-200 hover:text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50 shadow-xs"
                title="Synchronize Telemetry Mesh"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Sync Mesh</span>
              </button>

              <button
                onClick={() => setIsExportOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-blue-400 hover:bg-slate-800 text-blue-200 hover:text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>Export Dossier</span>
              </button>

              <Link
                to="/super-admin/finance"
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-400 hover:bg-slate-800 text-emerald-300 text-xs font-bold transition-all shadow-xs"
              >
                <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
                <span>Finance Ops</span>
              </Link>

              <Link
                to="/super-admin/operators/monitoring"
                className="hidden xl:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-indigo-400 hover:bg-slate-800 text-indigo-300 text-xs font-bold transition-all shadow-xs"
              >
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                <span>AI Ops Monitor</span>
              </Link>

              <Link
                to={`/super-admin/district-command?state=${encodeURIComponent(filters.stateName || 'Uttar Pradesh')}&district=${encodeURIComponent(filters.districtName && filters.districtName !== 'All Districts' ? filters.districtName : 'Ghazipur')}`}
              >
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-500 via-amber-500 to-orange-500 hover:from-brand-400 hover:to-orange-400 text-white font-black text-xs shadow-lg shadow-brand-500/25 transition-all cursor-pointer hover:scale-102">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Enter District Command</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top Location Telemetry Controller */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-300 shadow-sm relative overflow-hidden text-slate-950 space-y-4">
        <div className="space-y-4 relative z-10">
          {/* Top Bar: Breadcrumb + Status + Reset */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 text-xs">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-brand-50 text-brand-700 border border-brand-200">
                <Compass className="w-4 h-4" />
              </div>
              <span className="text-slate-800 font-extrabold uppercase tracking-wider text-xs">
                Target Territory Node:
              </span>
              <span className="px-3.5 py-1.5 rounded-xl bg-brand-50 border border-brand-300 text-brand-900 font-black text-xs shadow-xs">
                {activeTerritoryLabel}
              </span>
              {isSingleDistrict && (
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-900 font-extrabold text-[11px] border border-emerald-300 flex items-center gap-1.5 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> DIRECT DISTRICT LOCK
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 hover:text-slate-950 text-xs font-bold border border-slate-300 transition-all cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5 text-brand-600" />
                <span>Reset to Pan-India</span>
              </button>
            </div>
          </div>

          {/* Quick-Switch Teleportation Territory Chips */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-brand-600" />
              <span>Instant Territory Filter (Click to Teleport Console):</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {QUICK_DISTRICT_PRESETS.map((p) => {
                const isActive = (p.districtName === filters.districtName && (p.stateName === filters.stateName || p.districtName === 'All Districts'));
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handleQuickPreset(p)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-sm border border-brand-700 scale-102 font-black'
                        : 'bg-slate-100 border border-slate-300 text-slate-800 hover:bg-slate-200 hover:text-slate-950 font-bold'
                    }`}
                  >
                    <span>{p.flag}</span>
                    <span>{p.label}</span>
                    {isActive && <Check className="w-3 h-3 text-white ml-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Granular Cascading Dropdowns: State, District, Locality, Period, Search */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-2 text-xs">
            {/* 1. State / UT */}
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase font-black text-slate-800 tracking-wider flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span>State / UT ({allStates.length})</span>
              </label>
              <select
                value={filters.stateName || 'All States'}
                onChange={(e) => handleUpdateFilter({ stateName: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-white border border-slate-300 text-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500 font-bold cursor-pointer shadow-xs"
              >
                <option value="All States" className="bg-white text-slate-950">All States & UTs (Pan-India)</option>
                {allStates.map((s) => (
                  <option key={s.id} value={s.name} className="bg-white text-slate-950 font-semibold">
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. District */}
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase font-black text-slate-800 tracking-wider flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-brand-600" />
                <span>District ({availableDistricts.length})</span>
              </label>
              <select
                value={filters.districtName || 'All Districts'}
                disabled={filters.stateName === 'All States'}
                onChange={(e) => handleUpdateFilter({ districtName: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-white border border-slate-300 text-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500 font-bold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs"
              >
                {availableDistricts.map((d) => (
                  <option key={d} value={d} className="bg-white text-slate-950 font-semibold">
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Locality / Sub-Sector */}
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase font-black text-slate-800 tracking-wider flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-amber-600" />
                <span>Locality / Sector ({availableLocalities.length})</span>
              </label>
              <select
                value={filters.localityName || 'All Localities'}
                disabled={!filters.districtName || filters.districtName === 'All Districts'}
                onChange={(e) => handleUpdateFilter({ localityName: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-white border border-slate-300 text-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500 font-bold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs"
              >
                {availableLocalities.map((loc) => (
                  <option key={loc} value={loc} className="bg-white text-slate-950 font-semibold">
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Date Preset */}
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase font-black text-slate-800 tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Timeframe Period</span>
              </label>
              <select
                value={filters.datePreset || 'this_month'}
                onChange={(e) => handleUpdateFilter({ datePreset: e.target.value as any })}
                className="w-full h-10 px-3 rounded-xl bg-white border border-slate-300 text-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500 font-bold cursor-pointer shadow-xs"
              >
                <option value="today" className="bg-white text-slate-950">Today (Real-time)</option>
                <option value="this_week" className="bg-white text-slate-950">This Week</option>
                <option value="this_month" className="bg-white text-slate-950">This Month (September 2026)</option>
                <option value="prev_month" className="bg-white text-slate-950">Previous Month</option>
                <option value="last_3_months" className="bg-white text-slate-950">Last Quarter (Q2)</option>
                <option value="this_year" className="bg-white text-slate-950">Financial Year 2026-27</option>
              </select>
            </div>

            {/* 5. Keyword Search */}
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase font-black text-slate-800 tracking-wider flex items-center gap-1">
                <Search className="w-3.5 h-3.5 text-slate-700" />
                <span>Search Records</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={filters.search || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && loadDashboardData(filters)}
                  placeholder="Filter district, tutor, library..."
                  className="w-full h-10 pl-3.5 pr-8 rounded-xl bg-white border border-slate-300 text-slate-950 placeholder:text-slate-500 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs"
                />
                {filters.search && (
                  <button
                    onClick={() => handleUpdateFilter({ search: '' })}
                    className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-800 font-bold cursor-pointer"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Hero Executive Telemetry Banner with Centered GMV Master Cyber Deck */}
      <div className="bg-slate-950 cyber-grid-bg text-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-cyan-500/50 relative overflow-hidden text-center">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl mx-auto space-y-4">
          {/* Centered Radio Telemetry Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950 border-2 border-cyan-400 text-cyan-300 text-xs font-mono font-black tracking-wider shadow-sm">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="uppercase">
              {isSingleDistrict ? `${filters.districtName?.toUpperCase()} DISTRICT COMMAND NODE` : 'NATIONAL DIRECT TELEMETRY • PAN-INDIA HEADQUARTERS'}
            </span>
          </div>

          {/* Centered Futuristic Heading */}
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight my-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-blue-200">
              {isSingleDistrict ? `${filters.districtName} Operational Command Console` : 'FOCUSPOINT PAN-INDIA COMMAND CONSOLE'}
            </span>
          </h2>

          {/* Centered Telemetry Description with High-Contrast Badges */}
          <p className="text-slate-100 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed font-semibold">
            Operating across <strong className="text-cyan-300 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-400 font-black">{stats?.operatingDistricts} active district{stats?.operatingDistricts === 1 ? '' : 's'}</strong> with authorized single-admin governance. 
            Currently overseeing <strong className="text-emerald-300 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-400 font-black">{stats?.verifiedEducators} verified educators</strong>, <strong className="text-amber-300 px-2 py-0.5 rounded bg-amber-950 border border-amber-400 font-black">{stats?.selfStudyLibraries} self-study facilities</strong>, 
            and <strong className="text-purple-300 px-2 py-0.5 rounded bg-purple-950 border border-purple-400 font-black">{(stats?.activeTuitionStudents || 0) + (stats?.activeLibraryStudents || 0)} active learners</strong> in <strong className="text-white underline decoration-cyan-400 font-black">{activeTerritoryLabel}</strong>.
          </p>

          {/* Centered Master Monthly Platform GMV Cyber Deck */}
          <div
            onClick={() => navigate(`/super-admin/analytics/gmv?district=${encodeURIComponent(filters.districtName || '')}`)}
            className="mt-6 max-w-2xl mx-auto p-6 sm:p-7 rounded-2xl bg-slate-900 border-2 border-cyan-500/60 hover:border-cyan-400 cyber-hud-card hud-corner-brackets text-center transition-all cursor-pointer group shadow-2xl relative"
          >
            <div className="flex items-center justify-center gap-2 text-cyan-300 text-xs font-mono font-black uppercase tracking-widest mb-1.5">
              <span className="p-1 rounded-md bg-cyan-500/20 border border-cyan-400/50">
                <IndianRupee className="w-3.5 h-3.5 text-cyan-300" />
              </span>
              <span>{isSingleDistrict ? `${filters.districtName} Monthly GMV` : 'Monthly Platform Gross Merchandise Value (GMV)'}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform text-cyan-300" />
            </div>

            {/* Huge Centered Monospace Currency Figure */}
            <p className="text-4xl sm:text-5xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-emerald-300 my-2 tracking-tight">
              ₹{stats?.monthlyPlatformGMV ? stats.monthlyPlatformGMV.toLocaleString('en-IN') : '24,19,000'}
            </p>

            {/* Centered Growth Pill */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-950 border border-emerald-400 text-xs text-emerald-300 font-black mb-3 shadow-inner">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>+23.4% QoQ Velocity • Pan-India Direct Clearing</span>
            </div>

            {/* 3-Column Centered Micro-Telemetry Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-slate-800 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-700/90 hover:border-slate-600 transition-colors">
                <span className="text-[11px] text-slate-200 uppercase tracking-wider block font-bold">Tuition Share</span>
                <span className="font-mono font-black text-white text-base">
                  ₹{stats?.monthlyPlatformGMV ? Math.round(stats.monthlyPlatformGMV * 0.765).toLocaleString('en-IN') : '18,50,000'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-700/90 hover:border-slate-600 transition-colors">
                <span className="text-[11px] text-slate-200 uppercase tracking-wider block font-bold">Library Share</span>
                <span className="font-mono font-black text-white text-base">
                  ₹{stats?.monthlyPlatformGMV ? Math.round(stats.monthlyPlatformGMV * 0.235).toLocaleString('en-IN') : '5,69,000'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-cyan-500/50 hover:border-cyan-400 transition-colors">
                <span className="text-[11px] text-cyan-300 uppercase tracking-wider block font-bold">8% Commission Take</span>
                <span className="font-mono font-black text-cyan-300 text-base">
                  ₹{stats?.platformRevenue ? stats.platformRevenue.toLocaleString('en-IN') : '1,93,520'}
                </span>
              </div>
            </div>

            <p className="text-xs text-cyan-300 font-bold mt-3 group-hover:text-cyan-200 transition-colors flex items-center justify-center gap-1">
              <span>Click to open Full National GMV Financial Telemetry</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </p>
          </div>
        </div>
      </div>

      {/* 4. The 13 Key Enterprise KPI Cards (MNC Executive Command Matrix) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
        {/* Card 1: Monthly Platform GMV */}
        <div
          onClick={() => navigate(`/super-admin/analytics/gmv?district=${encodeURIComponent(filters.districtName || '')}`)}
          className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-300 hover:border-brand-500 hover:shadow-md text-center relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 cursor-pointer shadow-xs text-slate-900"
        >
          <div className="mx-auto w-11 h-11 rounded-xl flex items-center justify-center bg-emerald-50 border border-emerald-300 text-emerald-700 group-hover:scale-105 transition-transform mb-3">
            <IndianRupee className="w-5 h-5 text-emerald-700" />
          </div>
          <span className="text-xs uppercase font-extrabold text-slate-800 tracking-wider block">
            1. Monthly Platform GMV
          </span>
          <p className="text-2xl sm:text-3xl font-mono font-black text-slate-950 group-hover:text-brand-600 my-2 tracking-tight transition-colors">
            ₹{stats?.monthlyPlatformGMV ? stats.monthlyPlatformGMV.toLocaleString('en-IN') : '24,19,000'}
          </p>
          <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-[11px] font-bold text-slate-800 shadow-xs">
            <span className="text-emerald-700 font-extrabold">+23.4% Growth</span>
            <span className="text-slate-700 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              • Drill-down <ArrowRight className="w-3 h-3 text-brand-600" />
            </span>
          </div>
        </div>

        {/* Card 2: Operating Districts */}
        <div
          onClick={() => navigate('/super-admin/districts')}
          className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-300 hover:border-brand-500 hover:shadow-md text-center relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 cursor-pointer shadow-xs text-slate-900"
        >
          <div className="mx-auto w-11 h-11 rounded-xl flex items-center justify-center bg-blue-50 border border-blue-300 text-blue-700 group-hover:scale-105 transition-transform mb-3">
            <Globe className="w-5 h-5 text-blue-700" />
          </div>
          <span className="text-xs uppercase font-extrabold text-slate-800 tracking-wider block">
            2. Operating Territory Scale
          </span>
          <p className="text-2xl sm:text-3xl font-mono font-black text-slate-950 group-hover:text-brand-600 my-2 tracking-tight transition-colors">
            {stats?.operatingDistricts} District{stats?.operatingDistricts === 1 ? '' : 's'}
          </p>
          <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-[11px] font-bold text-slate-800 shadow-xs">
            <span className="text-emerald-700 font-extrabold">100% Governance</span>
            <span className="text-slate-700 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              • Registry <ArrowRight className="w-3 h-3 text-brand-600" />
            </span>
          </div>
        </div>

        {/* Card 3: Verified Educators */}
        <div
          onClick={() => navigate(`/super-admin/teachers?district=${encodeURIComponent(filters.districtName || '')}`)}
          className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-300 hover:border-brand-500 hover:shadow-md text-center relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 cursor-pointer shadow-xs text-slate-900"
        >
          <div className="mx-auto w-11 h-11 rounded-xl flex items-center justify-center bg-emerald-50 border border-emerald-300 text-emerald-700 group-hover:scale-105 transition-transform mb-3">
            <GraduationCap className="w-5 h-5 text-emerald-700" />
          </div>
          <span className="text-xs uppercase font-extrabold text-slate-800 tracking-wider block">
            3. Verified Educators
          </span>
          <p className="text-2xl sm:text-3xl font-mono font-black text-slate-950 group-hover:text-brand-600 my-2 tracking-tight transition-colors">
            {stats?.verifiedEducators} Tutors
          </p>
          <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-[11px] font-bold text-slate-800 shadow-xs">
            <span className="text-emerald-700 font-extrabold">Active: {stats?.verifiedEducators}</span>
            <span className="text-slate-700 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              • Directory <ArrowRight className="w-3 h-3 text-brand-600" />
            </span>
          </div>
        </div>

        {/* Card 4: Self-Study Libraries */}
        <div
          onClick={() => navigate(`/super-admin/libraries?district=${encodeURIComponent(filters.districtName || '')}`)}
          className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-300 hover:border-brand-500 hover:shadow-md text-center relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 cursor-pointer shadow-xs text-slate-900"
        >
          <div className="mx-auto w-11 h-11 rounded-xl flex items-center justify-center bg-amber-50 border border-amber-300 text-amber-700 group-hover:scale-105 transition-transform mb-3">
            <Building2 className="w-5 h-5 text-amber-700" />
          </div>
          <span className="text-xs uppercase font-extrabold text-slate-800 tracking-wider block">
            4. Self-Study Libraries
          </span>
          <p className="text-2xl sm:text-3xl font-mono font-black text-slate-950 group-hover:text-brand-600 my-2 tracking-tight transition-colors">
            {stats?.selfStudyLibraries} Facilities
          </p>
          <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-[11px] font-bold text-slate-800 shadow-xs">
            <span className="text-amber-800 font-extrabold">{stats?.totalLibrarySeats} Desks</span>
            <span className="text-slate-700 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              • View All <ArrowRight className="w-3 h-3 text-brand-600" />
            </span>
          </div>
        </div>

        {/* Card 5: Active Tuition Students */}
        <div
          onClick={() => navigate(`/super-admin/students?district=${encodeURIComponent(filters.districtName || '')}`)}
          className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-300 hover:border-brand-500 hover:shadow-md text-center relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 cursor-pointer shadow-xs text-slate-900"
        >
          <div className="mx-auto w-11 h-11 rounded-xl flex items-center justify-center bg-indigo-50 border border-indigo-300 text-indigo-700 group-hover:scale-105 transition-transform mb-3">
            <Users className="w-5 h-5 text-indigo-700" />
          </div>
          <span className="text-xs uppercase font-extrabold text-slate-800 tracking-wider block">
            5. Active Tuition Students
          </span>
          <p className="text-2xl sm:text-3xl font-mono font-black text-slate-950 group-hover:text-brand-600 my-2 tracking-tight transition-colors">
            {stats?.activeTuitionStudents} Learners
          </p>
          <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-[11px] font-bold text-slate-800 shadow-xs">
            <span className="text-emerald-700 font-extrabold">+18% MoM</span>
            <span className="text-slate-700 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              • Students <ArrowRight className="w-3 h-3 text-brand-600" />
            </span>
          </div>
        </div>

        {/* Card 6: Active Library Students */}
        <div
          onClick={() => navigate(`/super-admin/library-students?district=${encodeURIComponent(filters.districtName || '')}`)}
          className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-300 hover:border-brand-500 hover:shadow-md text-center relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 cursor-pointer shadow-xs text-slate-900"
        >
          <div className="mx-auto w-11 h-11 rounded-xl flex items-center justify-center bg-violet-50 border border-violet-300 text-violet-700 group-hover:scale-105 transition-transform mb-3">
            <Building2 className="w-5 h-5 text-violet-700" />
          </div>
          <span className="text-xs uppercase font-extrabold text-slate-800 tracking-wider block">
            6. Active Library Students
          </span>
          <p className="text-2xl sm:text-3xl font-mono font-black text-slate-950 group-hover:text-brand-600 my-2 tracking-tight transition-colors">
            {stats?.activeLibraryStudents} Students
          </p>
          <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-[11px] font-bold text-slate-800 shadow-xs">
            <span className="text-violet-800 font-extrabold">App + Counter</span>
            <span className="text-slate-700 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              • Registry <ArrowRight className="w-3 h-3 text-brand-600" />
            </span>
          </div>
        </div>

        {/* Card 7: Authorized District Admins */}
        <div
          onClick={() => navigate(`/super-admin/district-admins?district=${encodeURIComponent(filters.districtName || '')}`)}
          className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-300 hover:border-brand-500 hover:shadow-md text-center relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 cursor-pointer shadow-xs text-slate-900"
        >
          <div className="mx-auto w-11 h-11 rounded-xl flex items-center justify-center bg-blue-50 border border-blue-300 text-blue-700 group-hover:scale-105 transition-transform mb-3">
            <ShieldCheck className="w-5 h-5 text-blue-700" />
          </div>
          <span className="text-xs uppercase font-extrabold text-slate-800 tracking-wider block">
            7. Authorized District Admins
          </span>
          <p className="text-2xl sm:text-3xl font-mono font-black text-slate-950 group-hover:text-brand-600 my-2 tracking-tight transition-colors">
            {stats?.authorizedDistrictAdmins} Admin{stats?.authorizedDistrictAdmins === 1 ? '' : 's'}
          </p>
          <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-[11px] font-bold text-slate-800 shadow-xs">
            <span className="text-emerald-700 font-extrabold">Strict 1:1 Rule</span>
            <span className="text-slate-700 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              • Manage <ArrowRight className="w-3 h-3 text-brand-600" />
            </span>
          </div>
        </div>

        {/* Card 8: Allotment Velocity */}
        <div
          onClick={() => navigate('/super-admin/analytics/attendance')}
          className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-300 hover:border-brand-500 hover:shadow-md text-center relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 cursor-pointer shadow-xs text-slate-900"
        >
          <div className="mx-auto w-11 h-11 rounded-xl flex items-center justify-center bg-cyan-50 border border-cyan-300 text-cyan-700 group-hover:scale-105 transition-transform mb-3">
            <Clock className="w-5 h-5 text-cyan-700" />
          </div>
          <span className="text-xs uppercase font-extrabold text-slate-800 tracking-wider block">
            8. Allotment Velocity
          </span>
          <p className="text-2xl sm:text-3xl font-mono font-black text-slate-950 group-hover:text-brand-600 my-2 tracking-tight transition-colors">
            {velocity?.avgAllocationTimeHours || 3.2}h Avg
          </p>
          <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-[11px] font-bold text-slate-800 shadow-xs">
            <span className="text-emerald-700 font-extrabold">Fastest: {velocity?.fastestAllocationMinutes || 16}m</span>
            <span className="text-slate-700 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              • Velocity <ArrowRight className="w-3 h-3 text-brand-600" />
            </span>
          </div>
        </div>

        {/* Card 9: Infrastructure Scale */}
        <div
          onClick={() => navigate('/super-admin/locations')}
          className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-300 hover:border-brand-500 hover:shadow-md text-center relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 cursor-pointer shadow-xs text-slate-900"
        >
          <div className="mx-auto w-11 h-11 rounded-xl flex items-center justify-center bg-purple-50 border border-purple-300 text-purple-700 group-hover:scale-105 transition-transform mb-3">
            <Layers className="w-5 h-5 text-purple-700" />
          </div>
          <span className="text-xs uppercase font-extrabold text-slate-800 tracking-wider block">
            9. Infrastructure Capacity
          </span>
          <p className="text-2xl sm:text-3xl font-mono font-black text-slate-950 group-hover:text-brand-600 my-2 tracking-tight transition-colors">
            {stats?.totalLibrarySeats} Desks
          </p>
          <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-[11px] font-bold text-slate-800 shadow-xs">
            <span className="text-purple-800 font-extrabold">Biometric Verified</span>
            <span className="text-slate-700 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              • Scale <ArrowRight className="w-3 h-3 text-brand-600" />
            </span>
          </div>
        </div>

        {/* Card 10: Platform Revenue (8%) */}
        <div
          onClick={() => navigate('/super-admin/analytics/revenue')}
          className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-300 hover:border-brand-500 hover:shadow-md text-center relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 cursor-pointer shadow-xs text-slate-900"
        >
          <div className="mx-auto w-11 h-11 rounded-xl flex items-center justify-center bg-emerald-50 border border-emerald-300 text-emerald-700 group-hover:scale-105 transition-transform mb-3">
            <TrendingUp className="w-5 h-5 text-emerald-700" />
          </div>
          <span className="text-xs uppercase font-extrabold text-slate-800 tracking-wider block">
            10. Platform Revenue (8%)
          </span>
          <p className="text-2xl sm:text-3xl font-mono font-black text-emerald-700 group-hover:text-emerald-800 my-2 tracking-tight transition-colors">
            ₹{stats?.platformRevenue ? stats.platformRevenue.toLocaleString('en-IN') : '1,93,520'}
          </p>
          <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-[11px] font-bold text-slate-800 shadow-xs">
            <span className="text-emerald-700 font-extrabold">Commission Take</span>
            <span className="text-slate-700 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              • Revenue <ArrowRight className="w-3 h-3 text-brand-600" />
            </span>
          </div>
        </div>

        {/* Card 11: Pending Disbursements */}
        <div
          onClick={() => navigate(`/super-admin/payments?district=${encodeURIComponent(filters.districtName || '')}`)}
          className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-300 hover:border-brand-500 hover:shadow-md text-center relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 cursor-pointer shadow-xs text-slate-900"
        >
          <div className="mx-auto w-11 h-11 rounded-xl flex items-center justify-center bg-amber-50 border border-amber-300 text-amber-700 group-hover:scale-105 transition-transform mb-3">
            <IndianRupee className="w-5 h-5 text-amber-700" />
          </div>
          <span className="text-xs uppercase font-extrabold text-slate-800 tracking-wider block">
            11. Pending Disbursements
          </span>
          <p className="text-2xl sm:text-3xl font-mono font-black text-amber-700 group-hover:text-amber-800 my-2 tracking-tight transition-colors">
            ₹{stats?.pendingPayouts ? stats.pendingPayouts.toLocaleString('en-IN') : '48,200'}
          </p>
          <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-[11px] font-bold text-slate-800 shadow-xs">
            <span className="text-amber-800 font-extrabold">Bi-weekly Cycle</span>
            <span className="text-slate-700 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              • Ledger <ArrowRight className="w-3 h-3 text-brand-600" />
            </span>
          </div>
        </div>

        {/* Card 12: Operating Expenses */}
        <div
          onClick={() => navigate('/super-admin/finance')}
          className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-300 hover:border-brand-500 hover:shadow-md text-center relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 cursor-pointer shadow-xs text-slate-900"
        >
          <div className="mx-auto w-11 h-11 rounded-xl flex items-center justify-center bg-rose-50 border border-rose-300 text-rose-700 group-hover:scale-105 transition-transform mb-3">
            <Percent className="w-5 h-5 text-rose-700" />
          </div>
          <span className="text-xs uppercase font-extrabold text-slate-800 tracking-wider block">
            12. Operating Expenses
          </span>
          <p className="text-2xl sm:text-3xl font-mono font-black text-rose-700 group-hover:text-rose-800 my-2 tracking-tight transition-colors">
            ₹{stats?.platformExpenses ? stats.platformExpenses.toLocaleString('en-IN') : '90,200'}
          </p>
          <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-[11px] font-bold text-slate-800 shadow-xs">
            <span className="text-rose-700 font-extrabold">Tech & Ops</span>
            <span className="text-slate-700 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              • Breakdown <ArrowRight className="w-3 h-3 text-brand-600" />
            </span>
          </div>
        </div>

        {/* Card 13: Net Platform Revenue (Centered Full-Width Executive Financial Core) */}
        <div
          onClick={() => navigate('/super-admin/finance')}
          className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 border border-slate-700 text-center transition-all cursor-pointer group shadow-xl sm:col-span-2 md:col-span-3 lg:col-span-4 relative overflow-hidden text-white"
        >
          <div className="max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/20 border border-brand-400/50 text-brand-300 text-xs font-mono font-bold uppercase tracking-wider shadow-sm">
              <Sparkles className="w-4 h-4 text-brand-300" />
              <span>13. Net Platform Revenue (Post-Expense Retained Surplus • {activeTerritoryLabel})</span>
            </div>

            <p className="text-3xl sm:text-5xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-cyan-200 to-white my-1 tracking-tight">
              ₹{stats?.netPlatformRevenue ? stats.netPlatformRevenue.toLocaleString('en-IN') : '1,03,320'}
            </p>

            <p className="text-xs text-slate-200 font-semibold max-w-xl mx-auto leading-relaxed">
              Retained Formula: [Platform Commission (₹{(stats?.platformRevenue || 0).toLocaleString('en-IN')})] − [Total District Ops/Tech Expenses (₹{(stats?.platformExpenses || 0).toLocaleString('en-IN')})]
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-3 border-t border-slate-800 text-xs">
              <div className="text-center px-4 py-2 rounded-xl bg-slate-950 border border-slate-700">
                <span className="text-[10px] text-slate-300 block uppercase font-extrabold tracking-wider">Net Retained Margin</span>
                <span className="font-mono font-black text-emerald-400 text-base">53.4%</span>
              </div>
              <div className="text-center px-4 py-2 rounded-xl bg-slate-950 border border-slate-700">
                <span className="text-[10px] text-slate-300 block uppercase font-extrabold tracking-wider">Net Retained Take</span>
                <span className="font-mono font-black text-brand-300 text-base">4.27% of Gross GMV</span>
              </div>
              <div className="text-center px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-black flex items-center gap-1.5 shadow-md shadow-brand-600/30 transition-all">
                <span>Launch Financial Command Center</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Interactive Donut Chart Matrix (Dynamic Real-Time Segments) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-2xl bg-white border border-slate-300 shadow-sm text-slate-950">
          <div>
            <h3 className="text-base font-black text-slate-950 flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-600" />
              <span>Interactive Platform Distribution Engine — {activeTerritoryLabel}</span>
            </h3>
            <p className="text-xs text-slate-800 font-bold mt-0.5">Click any chart segment below to instantly filter records in the district performance heatmap</p>
          </div>
          {selectedChartSegment && (
            <button
              onClick={() => setSelectedChartSegment(null)}
              className="px-3.5 py-1.5 rounded-xl bg-brand-100 border border-brand-300 text-xs text-brand-900 font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer hover:bg-brand-200"
            >
              <span>Clear active segment filter:</span>
              <strong className="text-brand-950 bg-white px-2 py-0.5 rounded-lg border border-brand-300 font-black">{selectedChartSegment}</strong>
              <span className="text-brand-700 font-black">✕</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <InteractivePieDonutChart
            title={isSingleDistrict ? `${filters.districtName} Desk Utilization` : 'Operating Districts'}
            subtitle={isSingleDistrict ? 'Capacity & reservation scale' : 'Single-admin territory health'}
            data={districtChartData}
            onSegmentClick={handleChartSegmentClick}
          />
          <InteractivePieDonutChart
            title="Verified Educators"
            subtitle="Tutor certification status"
            data={educatorChartData}
            onSegmentClick={handleChartSegmentClick}
          />
          <InteractivePieDonutChart
            title="Self-Study Libraries"
            subtitle="Accreditation & desks status"
            data={libraryChartData}
            onSegmentClick={handleChartSegmentClick}
          />
          <InteractivePieDonutChart
            title="Tuition Students"
            subtitle="Enrolment & allotment matches"
            data={tuitionStudentChartData}
            onSegmentClick={handleChartSegmentClick}
          />
          <InteractivePieDonutChart
            title="Library Students"
            subtitle="App vs Counter registrations"
            data={libraryStudentChartData}
            onSegmentClick={handleChartSegmentClick}
          />
          {/* GMV Monthly Trend Line Chart */}
          <InteractiveLineChart
            title={`${activeTerritoryLabel} Monthly GMV Trend`}
            subtitle="Last 6 months velocity"
            data={gmvData?.monthlyTrend?.map((t: any) => ({ label: t.month.split(' ')[0], value: t.totalGMV })) || []}
          />
        </div>
      </div>

      {/* 6. District Performance Command Table + Granular Locality Breakdown */}
      <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-300 shadow-sm space-y-5 text-slate-950 relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-950 flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-brand-50 border border-brand-200 text-brand-600">
                <Compass className="w-4 h-4 text-brand-600" />
              </span>
              <span>District Territory Performance Heatmap</span>
            </h3>
            <p className="text-xs text-slate-800 font-bold mt-1">
              Authorized District Admins, allotment velocity, GMV contribution, and student density metrics
            </p>
          </div>
          <Link
            to="/super-admin/analytics/gmv"
            className="text-xs font-black text-brand-800 hover:text-brand-900 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-50 border border-brand-300 hover:bg-brand-100 transition-all shadow-xs"
          >
            <span>Open Advanced GMV Analytics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-300 bg-white">
          <table className="w-full text-left text-xs">
            <thead className="border-b-2 border-slate-300 text-[11px] font-black text-slate-900 uppercase bg-slate-100 tracking-wider">
              <tr>
                <th className="py-3.5 px-4">District & State</th>
                <th className="py-3.5 px-4 text-right">Tuition GMV</th>
                <th className="py-3.5 px-4 text-right">Library GMV</th>
                <th className="py-3.5 px-4 text-right">Total GMV</th>
                <th className="py-3.5 px-4 text-center">Active Students</th>
                <th className="py-3.5 px-4 text-center">Active Libraries</th>
                <th className="py-3.5 px-4 text-center">Growth</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredDistricts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-700 font-bold">
                    No districts matching criteria found for "{filters.search || activeTerritoryLabel}".
                  </td>
                </tr>
              ) : (
                filteredDistricts.map((d) => {
                  const isCurrentSelected = filters.districtName?.toLowerCase() === d.districtName.toLowerCase();
                  return (
                    <tr
                      key={d.districtId}
                      className={`transition-all group cursor-pointer ${
                        isCurrentSelected 
                          ? 'bg-brand-50/70 border-l-4 border-l-brand-600' 
                          : 'hover:bg-slate-50'
                      }`}
                      onClick={() => handleUpdateFilter({ stateName: d.stateName, districtName: d.districtName })}
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-950">
                        <div className="flex items-center gap-2">
                          <span className={`p-1 rounded font-mono text-[10px] font-bold ${
                            isCurrentSelected ? 'bg-brand-100 text-brand-900 border border-brand-300' : 'bg-slate-100 text-slate-800 border border-slate-300'
                          }`}>
                            {d.districtName.substring(0, 3).toUpperCase()}
                          </span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="group-hover:text-brand-600 transition-colors font-black text-slate-950">{d.districtName}</p>
                              {isCurrentSelected && (
                                <span className="px-1.5 py-0.2 rounded bg-brand-100 text-brand-900 font-black text-[9px] border border-brand-300">
                                  SELECTED
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-600 font-bold">{d.stateName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-800">
                        ₹{d.tuitionGMV.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-800">
                        ₹{d.libraryGMV.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-slate-950 group-hover:text-brand-600">
                        ₹{d.totalGMV.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-center font-black text-indigo-950">
                        {d.activeStudents}
                      </td>
                      <td className="py-3.5 px-4 text-center font-black text-amber-950">
                        {d.activeLibraries}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-0.5 font-black text-emerald-800">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
                          +{d.growthPercentage}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleUpdateFilter({ stateName: d.stateName, districtName: d.districtName })}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 font-black text-[11px] transition-colors cursor-pointer border border-slate-300 shadow-xs"
                          >
                            Filter
                          </button>
                          <Link to={`/super-admin/district-command?state=${encodeURIComponent(d.stateName)}&district=${encodeURIComponent(d.districtName)}`}>
                            <button className="px-2.5 py-1 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-black text-[11px] transition-all cursor-pointer border border-brand-700 shadow-xs">
                              Command
                            </button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* When a Single District is active, show the Granular Locality Breakdown */}
        {isSingleDistrict && localityBreakdown.length > 0 && (
          <div className="mt-6 pt-5 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-950 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-brand-600" />
                  <span>Sub-District Operational Locality Sectors — {filters.districtName}</span>
                </h4>
                <p className="text-xs text-slate-800 font-bold mt-0.5">Locality-level student density, study desk allocations, and attendance compliance</p>
              </div>
              <span className="text-xs text-slate-950 font-black bg-slate-100 px-3 py-1 rounded-xl border border-slate-300 shadow-xs">
                {localityBreakdown.length} Operational Sectors
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {localityBreakdown.map(loc => (
                <div key={loc.name} className="p-4 rounded-xl bg-white border border-slate-300 hover:border-brand-500 hover:shadow-md transition-all cursor-pointer group space-y-2.5 shadow-xs text-slate-950">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-slate-950 text-xs group-hover:text-brand-600">{loc.name}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-950 text-[10px] font-black border border-emerald-300">
                      {loc.compliance}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200 text-slate-800">
                    <div>
                      <span className="text-slate-700 text-[10px] block font-black uppercase tracking-wider">Students</span>
                      <span className="font-mono font-black text-indigo-950 text-sm">{loc.students}</span>
                    </div>
                    <div>
                      <span className="text-slate-700 text-[10px] block font-black uppercase tracking-wider">Libraries</span>
                      <span className="font-mono font-black text-amber-950 text-sm">{loc.libraries}</span>
                    </div>
                    <div>
                      <span className="text-slate-700 text-[10px] block font-black uppercase tracking-wider">Educators</span>
                      <span className="font-mono font-black text-emerald-950 text-sm">{loc.educators}</span>
                    </div>
                    <div>
                      <span className="text-slate-700 text-[10px] block font-black uppercase tracking-wider">Monthly GMV</span>
                      <span className="font-mono font-black text-slate-950 group-hover:text-brand-600 text-sm">₹{(loc.gmv / 1000).toFixed(0)}k</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 7. Live Operational Telemetry Stream & Audited Events */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-950 to-blue-950 border border-slate-800 shadow-md space-y-4 text-white">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-brand-500/20 border border-brand-500/30 text-brand-400">
              <Activity className="w-4 h-4 text-brand-400 animate-pulse" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-white">
              Real-Time Node Telemetry Stream • {activeTerritoryLabel}
            </span>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-brand-500/20 text-brand-300 text-[10px] font-mono font-extrabold border border-brand-500/30 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-ping" />
            CONTINUOUS STREAM
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {liveTelemetryEvents.map((ev) => (
            <div key={ev.id} className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 flex items-start gap-3 text-xs transition-all shadow-xs">
              <span className="w-2 h-2 rounded-full bg-brand-400 mt-1.5 shrink-0 animate-ping" />
              <div className="min-w-0 space-y-1">
                <p className="text-white text-xs leading-snug font-semibold">{ev.text}</p>
                <div className="flex items-center gap-2 text-[10px] text-slate-300 font-mono font-semibold">
                  <span>{ev.time}</span>
                  <span>•</span>
                  <span className="text-brand-300 font-extrabold">{ev.type}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Universal Export Modal */}
      <ExportModal
        title={`PAN-INDIA Super Admin Executive Briefing — ${activeTerritoryLabel}`}
        data={{ stats, velocity, infra, districts, filters }}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  );
};
