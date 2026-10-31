import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { superAdminService } from '../../services/superAdminService';
import { auditService } from '../../services/auditService';
import { locationService } from '../../services/locationService';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { 
  ShieldAlert, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  GraduationCap, 
  Building2, 
  Users, 
  Clock, 
  DollarSign, 
  IndianRupee,
  Percent, 
  FileText, 
  HelpCircle, 
  ArrowRight, 
  Activity, 
  Sparkles, 
  Globe, 
  Check, 
  Radio, 
  Zap, 
  Phone, 
  Mail, 
  Send, 
  Lock, 
  Unlock, 
  AlertTriangle, 
  RotateCcw,
  Search,
  Copy,
  ExternalLink,
  ShieldCheck,
  Eye,
  SlidersHorizontal,
  Award,
  BookOpen,
  Wifi,
  Flame,
  CheckCheck,
  Volume2,
  VolumeX,
  Terminal,
  Cpu,
  Layers,
  Crosshair,
  Compass,
  Maximize2,
  Filter,
  CheckSquare,
  AlertCircle,
  Hash,
  Laptop,
  CheckCircle,
  Sliders,
  ChevronRight,
  Shield,
  X
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

// Key Flagship Operational Districts for Quick Teleportation
const QUICK_DISTRICT_CHIPS = [
  { name: 'Ghazipur', state: 'Uttar Pradesh', code: 'GZP' },
  { name: 'Varanasi', state: 'Uttar Pradesh', code: 'VNS' },
  { name: 'Lucknow', state: 'Uttar Pradesh', code: 'LKO' },
  { name: 'Kanpur Nagar', state: 'Uttar Pradesh', code: 'KNP' },
  { name: 'Patna', state: 'Bihar', code: 'PAT' },
  { name: 'Mau', state: 'Uttar Pradesh', code: 'MAU' },
  { name: 'Ballia', state: 'Uttar Pradesh', code: 'BAL' },
];

interface PendingTeacher {
  id: string;
  name: string;
  subject: string;
  exp: string;
  appliedDate: string;
  district: string;
  locality: string;
  qualifications: string;
  hourlyRate: number;
  verificationScore: number;
  phone: string;
  email: string;
  degrees: string[];
}

interface PendingLibrary {
  id: string;
  name: string;
  seats: number;
  locality: string;
  owner: string;
  appliedDate: string;
  district: string;
  amenities: string[];
  fiberSpeed: string;
  fireSafetyStatus: string;
  cctvChannels: number;
  biometricModel: string;
}

interface PendingTutorRequest {
  id: string;
  student: string;
  subject: string;
  locality: string;
  date: string;
  district: string;
  targetExam: string;
  parentContact: string;
  monthlyBudget: number;
  urgency: 'URGENT' | 'HIGH' | 'STANDARD';
  studentClass: string;
}

interface InspectedNode {
  nodeId: string;
  title: string;
  category: string;
  value: string;
  timestamp: string;
  coordinates: string;
  hash: string;
  status: string;
  details: Record<string, string | number>;
  actions?: { label: string; action: () => void; icon?: React.ReactNode }[];
}

interface TerminalLog {
  id: string;
  timestamp: string;
  tag: 'OVERRIDE' | 'CLEARANCE' | 'TELEPORT' | 'BROADCAST' | 'AUDIT' | 'SIGNAL';
  message: string;
  hash: string;
}

// Lightweight Sci-Fi Web Audio synthesizer for tactile futuristic feedback
class CyberSoundSystem {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {}

  public toggle(): boolean {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public play(type: 'click' | 'beep' | 'warp' | 'confirm' | 'alert') {
    if (!this.enabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.ctx) this.ctx = new AudioCtx();
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(500, now + 0.04);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
      } else if (type === 'beep') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(950, now);
        osc.frequency.setValueAtTime(1900, now + 0.06);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        osc.start(now);
        osc.stop(now + 0.09);
      } else if (type === 'confirm') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.05);
        osc.frequency.setValueAtTime(1046.5, now + 0.1);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (type === 'alert') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.setValueAtTime(220, now + 0.08);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'warp') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(350, now);
        osc.frequency.exponentialRampToValueAtTime(1750, now + 0.12);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      }
    } catch {
      // Audio fails silently if permissions require interaction
    }
  }
}

const cyberAudio = new CyberSoundSystem();

export const SuperAdminDistrictCommand: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();

  const allStates = useMemo(() => locationService.getStates('loc-country-in', true), []);
  const initialDistrict = searchParams.get('district') || 'Ghazipur';
  const initialState = searchParams.get('state') || (initialDistrict === 'Patna' ? 'Bihar' : 'Uttar Pradesh');

  const [selectedState, setSelectedState] = useState(initialState);
  const [selectedDistrict, setSelectedDistrict] = useState(initialDistrict);

  // Active clicked card / item state for instant high-visibility inspector
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Audio feedback toggle
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Simulated live cyber telemetry
  const [liveLatency, setLiveLatency] = useState(5);
  const [activeSignalStrength, setActiveSignalStrength] = useState(99.6);

  // Universal Holographic Node Inspector (triggers when user clicks ANY text/metric/element)
  const [inspectedNode, setInspectedNode] = useState<InspectedNode | null>(null);
  const [isInspectorExpanded, setIsInspectorExpanded] = useState(true);

  // Quantum Audit Terminal Logs
  const [terminalLogs, setTerminalLogs] = useState<TerminalLog[]>([
    {
      id: 'log-init-1',
      timestamp: new Date().toLocaleTimeString('en-IN', { hour12: false }),
      tag: 'SIGNAL',
      message: 'Uplink established with ISRO-GSAT-24 geostationary orbit (83.5°E). AES-256-GCM encrypted.',
      hash: '0x8f4a12ec'
    },
    {
      id: 'log-init-2',
      timestamp: new Date().toLocaleTimeString('en-IN', { hour12: false }),
      tag: 'CLEARANCE',
      message: `Direct root authority authenticated for territory node: ${initialDistrict.toUpperCase()} (${initialState.toUpperCase()}).`,
      hash: '0x3c99a0bf'
    }
  ]);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);

  // Category Quick Filters
  const [subjectFilter, setSubjectFilter] = useState('ALL');
  const [libraryAmenityFilter, setLibraryAmenityFilter] = useState('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState('ALL');

  const selectedStateObj = useMemo(() => {
    return allStates.find(s => s.name.toLowerCase() === selectedState.toLowerCase()) || allStates[0];
  }, [allStates, selectedState]);

  const availableDistricts = useMemo(() => {
    if (!selectedStateObj) return [];
    const dList = locationService.getDistricts(selectedStateObj.id, true);
    if (dList.length === 0) {
      return [{ id: 'dist-default', name: 'Ghazipur', code: 'GZP', stateId: selectedStateObj.id, countryId: 'loc-country-in', status: 'ACTIVE', createdAt: '', updatedAt: '' }];
    }
    return dList;
  }, [selectedStateObj]);

  // Keep district in sync when state changes
  useEffect(() => {
    if (availableDistricts.length > 0 && !availableDistricts.some(d => d.name.toLowerCase() === selectedDistrict.toLowerCase())) {
      setSelectedDistrict(availableDistricts[0].name);
    }
  }, [selectedState, availableDistricts]);

  // Sync state & district to URL search params
  useEffect(() => {
    setSearchParams({ state: selectedState, district: selectedDistrict }, { replace: true });
  }, [selectedState, selectedDistrict]);

  // Simulate real-time satellite latency jitter
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveLatency(Math.floor(4 + Math.random() * 5));
      setActiveSignalStrength(Number((99.2 + Math.random() * 0.7).toFixed(1)));
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // District Queues
  const [pendingTeachers, setPendingTeachers] = useState<PendingTeacher[]>([]);
  const [pendingLibraries, setPendingLibraries] = useState<PendingLibrary[]>([]);
  const [tutorRequests, setTutorRequests] = useState<PendingTutorRequest[]>([]);
  const [districtTelemetry, setDistrictTelemetry] = useState<any>(null);

  const [activeTab, setActiveTab] = useState<'teachers' | 'libraries' | 'requests' | 'overview'>('teachers');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Emergency Broadcast Modal
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastPreset, setBroadcastPreset] = useState<'WEATHER' | 'EXAM' | 'VERIFICATION' | 'SEATS'>('EXAM');
  const [isAdmissionsFrozen, setIsAdmissionsFrozen] = useState(false);

  // Authoritative Coordinator Governance mapping
  const districtsList = [
    { name: 'Ghazipur', state: 'Uttar Pradesh', admin: 'Virendra Pratap Singh', email: 'virendra.gzp@zyzus.com', phone: '+91 94501 82341', appointedDate: '12 Jan 2025', status: 'ACTIVE' },
    { name: 'Varanasi', state: 'Uttar Pradesh', admin: 'Anjali Srivastava', email: 'anjali.vns@zyzus.com', phone: '+91 98390 11244', appointedDate: '01 Feb 2025', status: 'ACTIVE' },
    { name: 'Lucknow', state: 'Uttar Pradesh', admin: 'Devendra Nath Trivedi', email: 'devendra.lko@zyzus.com', phone: '+91 94150 99812', appointedDate: '15 Nov 2024', status: 'ACTIVE' },
    { name: 'Mau', state: 'Uttar Pradesh', admin: 'Rakesh Rai', email: 'rakesh.mau@zyzus.com', phone: '+91 97920 44321', appointedDate: '20 Mar 2025', status: 'ACTIVE' },
    { name: 'Ballia', state: 'Uttar Pradesh', admin: 'Sudhir Pandey', email: 'sudhir.bal@zyzus.com', phone: '+91 98891 22314', appointedDate: '10 Feb 2025', status: 'ACTIVE' },
    { name: 'Kanpur Nagar', state: 'Uttar Pradesh', admin: 'Pradeep Saxena', email: 'pradeep.knp@zyzus.com', phone: '+91 93361 77412', appointedDate: '05 Apr 2025', status: 'ACTIVE' },
    { name: 'Patna', state: 'Bihar', admin: 'Manoj Kumar Jha', email: 'manoj.pat@zyzus.com', phone: '+91 94310 88219', appointedDate: '18 Jan 2025', status: 'ACTIVE' },
  ];

  const currentDistrictInfo = districtsList.find(d => d.name.toLowerCase() === selectedDistrict.toLowerCase()) || {
    name: selectedDistrict,
    state: selectedState,
    admin: `${selectedDistrict} District Coordinator`,
    email: `coordinator.${selectedDistrict.toLowerCase().replace(/[^a-z0-9]/g, '')}@zyzus.com`,
    phone: '+91 98765 00000',
    appointedDate: '01 Jun 2025',
    status: 'ACTIVE'
  };

  // Helper to add terminal log
  const pushTerminalLog = (tag: TerminalLog['tag'], message: string) => {
    const newLog: TerminalLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour12: false }),
      tag,
      message,
      hash: `0x${Math.floor(Math.random() * 0xffffffff).toString(16)}`
    };
    setTerminalLogs(prev => [newLog, ...prev.slice(0, 49)]);
  };

  // Load queues dynamically based on selected district
  const loadDistrictQueues = (districtName: string, stateName: string) => {
    const dLower = districtName.toLowerCase().trim();

    if (dLower === 'ghazipur') {
      setPendingTeachers([
        { id: 't-gzp-1', name: 'Dr. Ramesh Chandra', subject: 'Advanced Physics (Class 11-12 / IIT-JEE)', exp: '9 Years Exp', appliedDate: '14 Sep 2026', district: 'Ghazipur', locality: 'Lanka Gate', qualifications: 'M.Sc. Physics (BHU), B.Ed', hourlyRate: 850, verificationScore: 98.4, phone: '+91 94501 88712', email: 'ramesh.chandra@gmail.com', degrees: ['B.Sc Physics (Gold Medalist)', 'M.Sc Advanced Optics', 'B.Ed Teaching'] },
        { id: 't-gzp-2', name: 'Pooja Verma', subject: 'Mathematics (Class 9-10 / CBSE)', exp: '5 Years Exp', appliedDate: '15 Sep 2026', district: 'Ghazipur', locality: 'Gora Bazar', qualifications: 'B.Sc. Maths, M.Sc.', hourlyRate: 600, verificationScore: 96.8, phone: '+91 98390 12874', email: 'pooja.verma.math@gmail.com', degrees: ['B.Sc Mathematics', 'M.Sc Applied Mathematics'] },
        { id: 't-gzp-3', name: 'Sunil K. Gond', subject: 'Chemistry (Class 11-12 / NEET)', exp: '7 Years Exp', appliedDate: '16 Sep 2026', district: 'Ghazipur', locality: 'Saidpur', qualifications: 'M.Sc. Organic Chemistry', hourlyRate: 750, verificationScore: 94.2, phone: '+91 97920 33418', email: 'sunil.gond.chem@gmail.com', degrees: ['M.Sc Chemistry', 'NET Qualified'] },
      ]);
      setPendingLibraries([
        { id: 'lib-gzp-1', name: 'Apex Premier Study Library', seats: 65, locality: 'Lanka Gate', owner: 'Suresh Maurya', appliedDate: '12 Sep 2026', district: 'Ghazipur', amenities: ['Central AC', 'Gigabit Wi-Fi', 'Smart Desks', 'CCTV 24x7', 'Power Backup'], fiberSpeed: '300 Mbps Dedicated', fireSafetyStatus: 'Certified Grade-A', cctvChannels: 16, biometricModel: 'FP-BioTurnstile v3.2' },
        { id: 'lib-gzp-2', name: 'Gyan Sthali Digital Space', seats: 50, locality: 'Gora Bazar', owner: 'Rajesh Bind', appliedDate: '14 Sep 2026', district: 'Ghazipur', amenities: ['Air-Conditioned', 'Inverter Power Backup', 'RO Alkaline Water', 'Locker Cubicles'], fiberSpeed: '200 Mbps Fiber', fireSafetyStatus: 'Verified', cctvChannels: 12, biometricModel: 'FP-BioTurnstile v2.8' },
      ]);
      setTutorRequests([
        { id: 'req-gzp-1', student: 'Aayush Kushwaha', subject: 'Class 10 Science & Mathematics', locality: 'Gora Bazar', date: '16 Sep 2026', district: 'Ghazipur', targetExam: 'CBSE Board 2027', parentContact: '+91 94501 11223', monthlyBudget: 4500, urgency: 'URGENT', studentClass: 'Class 10 CBSE' },
        { id: 'req-gzp-2', student: 'Priya Rai', subject: 'IIT-JEE Advanced Physics & Optics', locality: 'Lanka Gate', date: '17 Sep 2026', district: 'Ghazipur', targetExam: 'JEE Advanced 2027', parentContact: '+91 98390 33445', monthlyBudget: 8000, urgency: 'HIGH', studentClass: 'Class 12 IIT Aspirant' },
      ]);
    } else if (dLower === 'varanasi') {
      setPendingTeachers([
        { id: 't-vns-1', name: 'Prof. Rajeshwar Pandey', subject: 'Advanced Physical Chemistry (IIT-JEE)', exp: '12 Years Exp', appliedDate: '13 Sep 2026', district: 'Varanasi', locality: 'Lanka / BHU Road', qualifications: 'Ph.D. Chemistry (BHU)', hourlyRate: 1100, verificationScore: 99.2, phone: '+91 98390 77123', email: 'rajeshwar.pandey@bhu.ac.in', degrees: ['Ph.D Physical Chemistry', 'Ex-Allen Faculty'] },
        { id: 't-vns-2', name: 'Ananya Sen', subject: 'Biology & Human Physiology (NEET-UG)', exp: '6 Years Exp', appliedDate: '15 Sep 2026', district: 'Varanasi', locality: 'Sigra', qualifications: 'M.Sc. Zoology, CSIR-NET', hourlyRate: 800, verificationScore: 97.5, phone: '+91 94150 44219', email: 'ananya.sen.bio@gmail.com', degrees: ['M.Sc Zoology', 'CSIR-NET JRF'] },
      ]);
      setPendingLibraries([
        { id: 'lib-vns-1', name: 'Banaras Scholastic Reading Hub', seats: 80, locality: 'Lanka Gate', owner: 'Anand Sharma', appliedDate: '10 Sep 2026', district: 'Varanasi', amenities: ['Central AC', 'Dual High-Speed Fiber', 'Soundproof Cubicles', 'Cafeteria'], fiberSpeed: '500 Mbps Dual Fiber', fireSafetyStatus: 'Certified Grade-A+', cctvChannels: 24, biometricModel: 'FP-BioTurnstile v4.0 Pro' },
      ]);
      setTutorRequests([
        { id: 'req-vns-1', student: 'Shivam Singh', subject: 'IIT-JEE Mathematics & Coordinate Geometry', locality: 'Lanka / BHU Road', date: '16 Sep 2026', district: 'Varanasi', targetExam: 'JEE Mains 2027', parentContact: '+91 94150 44556', monthlyBudget: 9000, urgency: 'URGENT', studentClass: 'Class 12 JEE' },
      ]);
    } else if (dLower === 'lucknow') {
      setPendingTeachers([
        { id: 't-lko-1', name: 'Er. Amit Tripathy', subject: 'Computer Science, Python & AI Systems', exp: '8 Years Exp', appliedDate: '14 Sep 2026', district: 'Lucknow', locality: 'Gomti Nagar', qualifications: 'B.Tech CSE, M.Tech (IITK)', hourlyRate: 950, verificationScore: 98.9, phone: '+91 94150 99123', email: 'amit.tripathy@gmail.com', degrees: ['M.Tech IIT Kanpur', 'AWS Certified'] },
        { id: 't-lko-2', name: 'Neha Tiwari', subject: 'English Literature & Verbal Ability', exp: '6 Years Exp', appliedDate: '15 Sep 2026', district: 'Lucknow', locality: 'Hazratganj', qualifications: 'M.A. English (Lucknow Univ)', hourlyRate: 700, verificationScore: 96.1, phone: '+91 93361 44512', email: 'neha.tiwari.eng@gmail.com', degrees: ['M.A English', 'UGC-NET'] },
      ]);
      setPendingLibraries([
        { id: 'lib-lko-1', name: 'Awadh Academic Reading Hall', seats: 95, locality: 'Hazratganj', owner: 'Mohd. Aslam', appliedDate: '11 Sep 2026', district: 'Lucknow', amenities: ['HVAC Central Cooling', 'Biometric Turnstile', 'Ergonomic Mesh Seating', 'CCTV 24x7'], fiberSpeed: '1 Gbps Fiber', fireSafetyStatus: 'Certified Grade-A', cctvChannels: 32, biometricModel: 'FP-BioTurnstile v4.0 Pro' },
      ]);
      setTutorRequests([
        { id: 'req-lko-1', student: 'Priyanshu Sharma', subject: 'CBSE Foundation Science & Maths', locality: 'Gomti Nagar', date: '16 Sep 2026', district: 'Lucknow', targetExam: 'CBSE Class 9', parentContact: '+91 99350 88776', monthlyBudget: 5000, urgency: 'STANDARD', studentClass: 'Class 9 Foundation' },
      ]);
    } else if (dLower === 'kanpur nagar') {
      setPendingTeachers([
        { id: 't-knp-1', name: 'Er. Shailendra Mishra', subject: 'Applied Mechanics & Physics', exp: '11 Years Exp', appliedDate: '13 Sep 2026', district: 'Kanpur Nagar', locality: 'Kakadeo', qualifications: 'B.Tech Mechanical (HBTI)', hourlyRate: 900, verificationScore: 97.8, phone: '+91 98391 22145', email: 'shailendra.hbti@gmail.com', degrees: ['B.Tech HBTI Kanpur', '11 Yrs Coaching Exp'] },
      ]);
      setPendingLibraries([
        { id: 'lib-knp-1', name: 'Ganga Pragya Study Center', seats: 70, locality: 'Kakadeo', owner: 'Rameshwar Gupta', appliedDate: '12 Sep 2026', district: 'Kanpur Nagar', amenities: ['Split AC', 'Uninterrupted Power', 'Silent Reading Halls'], fiberSpeed: '300 Mbps', fireSafetyStatus: 'Certified Grade-A', cctvChannels: 16, biometricModel: 'FP-BioTurnstile v3.0' },
      ]);
      setTutorRequests([
        { id: 'req-knp-1', student: 'Rohan Dixit', subject: 'IIT-JEE Mathematics & Calculus', locality: 'Kakadeo', date: '15 Sep 2026', district: 'Kanpur Nagar', targetExam: 'JEE Advanced', parentContact: '+91 98391 77665', monthlyBudget: 8500, urgency: 'URGENT', studentClass: 'Class 12 Dropper' },
      ]);
    } else if (dLower === 'patna') {
      setPendingTeachers([
        { id: 't-pat-1', name: 'Dr. K.K. Sinha', subject: 'Coordinate Geometry & Calculus (IIT-JEE)', exp: '14 Years Exp', appliedDate: '14 Sep 2026', district: 'Patna', locality: 'Boring Road', qualifications: 'Ph.D. Mathematics (Patna Univ)', hourlyRate: 1000, verificationScore: 99.0, phone: '+91 94310 11982', email: 'kksinha.patna@gmail.com', degrees: ['Ph.D Mathematics', 'Author of 2 IIT-JEE Guides'] },
      ]);
      setPendingLibraries([
        { id: 'lib-pat-1', name: 'Maurya Central Reading Lounge', seats: 85, locality: 'Boring Road', owner: 'Alok Jha', appliedDate: '13 Sep 2026', district: 'Patna', amenities: ['Central AC', 'High-Speed Wi-Fi', 'Locker Facility'], fiberSpeed: '400 Mbps', fireSafetyStatus: 'Certified Grade-A', cctvChannels: 20, biometricModel: 'FP-BioTurnstile v3.5' },
      ]);
      setTutorRequests([
        { id: 'req-pat-1', student: 'Rohit Kumar', subject: 'NEET Physics & Optics', locality: 'Boring Road', date: '16 Sep 2026', district: 'Patna', targetExam: 'NEET 2027', parentContact: '+91 94310 55443', monthlyBudget: 7500, urgency: 'HIGH', studentClass: 'Class 12 Medical' },
      ]);
    } else {
      // Dynamic deterministic generation for any other selected district
      let hash = 0;
      for (let i = 0; i < dLower.length; i++) hash = (hash * 31 + dLower.charCodeAt(i)) & 0xffffffff;
      const absHash = Math.abs(hash);

      setPendingTeachers([
        { id: `t-${dLower}-1`, name: `Prof. S.K. ${districtName} Tutor`, subject: 'Science & Advanced Mathematics', exp: `${5 + (absHash % 8)} Years Exp`, appliedDate: '14 Sep 2026', district: districtName, locality: `${districtName} Central Sector`, qualifications: 'M.Sc. / B.Ed Post-Graduate', hourlyRate: 700 + (absHash % 250), verificationScore: 95.0 + (absHash % 4), phone: `+91 98${absHash % 90000000}`, email: `tutor.${dLower}@zyzus.com`, degrees: ['M.Sc Mathematics', 'B.Ed Professional'] },
        { id: `t-${dLower}-2`, name: `Dr. Neha ${districtName} Educator`, subject: 'Social Sciences & English Communication', exp: `${4 + (absHash % 6)} Years Exp`, appliedDate: '15 Sep 2026', district: districtName, locality: `${districtName} Civil Lines`, qualifications: 'M.A. First Class, UGC-NET', hourlyRate: 650 + (absHash % 200), verificationScore: 96.2, phone: `+91 94${absHash % 90000000}`, email: `educator.${dLower}@zyzus.com`, degrees: ['M.A English', 'UGC-NET'] },
      ]);
      setPendingLibraries([
        { id: `lib-${dLower}-1`, name: `${districtName} Central Aspirants Library`, seats: 45 + (absHash % 35), locality: `${districtName} Sadar`, owner: `${districtName} Educational Trustee`, appliedDate: '12 Sep 2026', district: districtName, amenities: ['Air-Conditioned', 'Fast Wi-Fi', 'Power Backup', 'CCTV Surveillance'], fiberSpeed: '250 Mbps', fireSafetyStatus: 'Compliant', cctvChannels: 16, biometricModel: 'FP-BioTurnstile v3.0' },
      ]);
      setTutorRequests([
        { id: `req-${dLower}-1`, student: `Aditya Sharma`, subject: 'Class 10 Science & Mathematics', locality: `${districtName} Main Sector`, date: '16 Sep 2026', district: districtName, targetExam: 'Board Exam 2027', parentContact: `+91 98${absHash % 90000000}`, monthlyBudget: 5000, urgency: 'STANDARD', studentClass: 'Class 10 Board' },
      ]);
    }

    // Load district overview stats
    superAdminService.getPlatformStats({ districtName, stateName }).then((res) => {
      setDistrictTelemetry(res);
    });

    pushTerminalLog('TELEPORT', `Node orbit transferred to ${districtName.toUpperCase()} // Telemetry synchronised.`);
  };

  useEffect(() => {
    loadDistrictQueues(selectedDistrict, selectedState);
    setSelectedCardId(null);
  }, [selectedDistrict, selectedState]);

  // Handle universal inspection of ANY clicked text, metric or node
  const handleInspectElement = (
    title: string,
    value: string,
    category: string,
    details: Record<string, string | number> = {},
    status = 'VERIFIED_ACTIVE',
    customId = ''
  ) => {
    cyberAudio.play('beep');
    const id = customId || `node-${Date.now()}`;
    const hash = `0x${Math.abs(Array.from(title + value).reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 0)).toString(16)}`;

    setInspectedNode({
      nodeId: id,
      title,
      category,
      value,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      coordinates: `${(25.5 + Math.random() * 2).toFixed(4)}°N, ${(82.9 + Math.random() * 2).toFixed(4)}°E`,
      hash,
      status,
      details
    });

    setIsInspectorExpanded(true);
    pushTerminalLog('AUDIT', `Focus Inspector targeting: [${category.toUpperCase()}] ${title} // Hash: ${hash}`);
  };

  // Filter queues by search query & quick filters
  const filteredTeachers = useMemo(() => {
    return pendingTeachers.filter(t => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || (
        t.name.toLowerCase().includes(q) || 
        t.subject.toLowerCase().includes(q) || 
        t.locality.toLowerCase().includes(q) ||
        t.qualifications.toLowerCase().includes(q)
      );

      const matchesSubject = subjectFilter === 'ALL' || t.subject.toLowerCase().includes(subjectFilter.toLowerCase());
      return matchesSearch && matchesSubject;
    });
  }, [pendingTeachers, searchQuery, subjectFilter]);

  const filteredLibraries = useMemo(() => {
    return pendingLibraries.filter(l => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || (
        l.name.toLowerCase().includes(q) || 
        l.locality.toLowerCase().includes(q) || 
        l.owner.toLowerCase().includes(q)
      );

      const matchesAmenity = libraryAmenityFilter === 'ALL' || l.amenities.some(a => a.toLowerCase().includes(libraryAmenityFilter.toLowerCase()));
      return matchesSearch && matchesAmenity;
    });
  }, [pendingLibraries, searchQuery, libraryAmenityFilter]);

  const filteredRequests = useMemo(() => {
    return tutorRequests.filter(r => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || (
        r.student.toLowerCase().includes(q) || 
        r.subject.toLowerCase().includes(q) || 
        r.locality.toLowerCase().includes(q) ||
        r.targetExam.toLowerCase().includes(q)
      );

      const matchesUrgency = urgencyFilter === 'ALL' || r.urgency === urgencyFilter;
      return matchesSearch && matchesUrgency;
    });
  }, [tutorRequests, searchQuery, urgencyFilter]);

  // Handle direct teacher approval override
  const handleApproveTeacher = async (teacher: PendingTeacher) => {
    cyberAudio.play('confirm');
    setProcessingId(teacher.id);
    try {
      await auditService.record({
        action: 'SUPER_ADMIN_OVERRIDE_APPROVE_TEACHER',
        module: 'DISTRICT_COMMAND',
        target: `${teacher.name} (${teacher.subject})`,
        district: selectedDistrict,
        newValue: 'Approved by Super Admin Direct Override with Central Accreditation',
        status: 'SUCCESS'
      });

      setPendingTeachers(prev => prev.filter(t => t.id !== teacher.id));
      if (selectedCardId === teacher.id) setSelectedCardId(null);
      if (inspectedNode?.nodeId === teacher.id) setInspectedNode(null);

      pushTerminalLog('CLEARANCE', `Teacher ${teacher.name} centrally approved. Central credential token issued.`);
      showToast(`Teacher ${teacher.name} verified & centrally approved for ${selectedDistrict}!`, 'success');
    } finally {
      setProcessingId(null);
    }
  };

  // Handle batch teacher approvals
  const handleBatchApproveTeachers = async () => {
    if (filteredTeachers.length === 0) return;
    cyberAudio.play('warp');
    const count = filteredTeachers.length;
    await auditService.record({
      action: 'SUPER_ADMIN_BATCH_APPROVE_TEACHERS',
      module: 'DISTRICT_COMMAND',
      target: `Batch Approval (${count} Teachers)`,
      district: selectedDistrict,
      newValue: `Centrally accredited ${count} teachers in fast-track queue`,
      status: 'SUCCESS'
    });
    setPendingTeachers([]);
    setSelectedCardId(null);
    pushTerminalLog('CLEARANCE', `Batch fast-track cleared ${count} educators in ${selectedDistrict}.`);
    showToast(`Instant Central Accreditation granted to all ${count} educators in ${selectedDistrict}!`, 'success');
  };

  // Handle direct library accreditation override
  const handleApproveLibrary = async (lib: PendingLibrary) => {
    cyberAudio.play('confirm');
    setProcessingId(lib.id);
    try {
      await auditService.record({
        action: 'SUPER_ADMIN_OVERRIDE_APPROVE_LIBRARY',
        module: 'DISTRICT_COMMAND',
        target: `${lib.name} (${lib.seats} Desks)`,
        district: selectedDistrict,
        newValue: 'Accredited by Super Admin Direct Override with Full Smart Desks Rights',
        status: 'SUCCESS'
      });

      setPendingLibraries(prev => prev.filter(l => l.id !== lib.id));
      if (selectedCardId === lib.id) setSelectedCardId(null);
      if (inspectedNode?.nodeId === lib.id) setInspectedNode(null);

      pushTerminalLog('CLEARANCE', `Library ${lib.name} accredited. Hardware node token authorized.`);
      showToast(`Library ${lib.name} (${lib.seats} Desks) accredited under Super Admin authority!`, 'success');
    } finally {
      setProcessingId(null);
    }
  };

  // Handle direct tutor demand allocation override
  const handleAllocateTutor = async (req: PendingTutorRequest) => {
    cyberAudio.play('confirm');
    setProcessingId(req.id);
    try {
      await auditService.record({
        action: 'SUPER_ADMIN_OVERRIDE_ALLOCATE_TUTOR',
        module: 'DISTRICT_COMMAND',
        target: `Tutor Request: ${req.student} (${req.subject})`,
        district: selectedDistrict,
        newValue: "Matched with Verified ZYZU'S Educator (Super Admin Fast-Track Allocation)",
        status: 'SUCCESS'
      });

      setTutorRequests(prev => prev.filter(r => r.id !== req.id));
      if (selectedCardId === req.id) setSelectedCardId(null);
      if (inspectedNode?.nodeId === req.id) setInspectedNode(null);

      pushTerminalLog('OVERRIDE', `Learner ${req.student} paired with verified educator. Escrow cleared.`);
      showToast(`Verified Tutor successfully allocated to ${req.student}!`, 'success');
    } finally {
      setProcessingId(null);
    }
  };

  // Handle emergency district broadcast
  const handleSendBroadcast = async () => {
    if (!broadcastMessage.trim()) return;
    cyberAudio.play('warp');
    await auditService.record({
      action: 'SUPER_ADMIN_DISTRICT_BROADCAST',
      module: 'DISTRICT_COMMAND',
      target: `Broadcast Notice to ${selectedDistrict}`,
      newValue: broadcastMessage,
      district: selectedDistrict,
      status: 'SUCCESS'
    });
    pushTerminalLog('BROADCAST', `Emergency transmission broadcasted to ${selectedDistrict}. SMS/Push Gateway executed.`);
    showToast(`Emergency Advisory broadcasted to all students and educators in ${selectedDistrict}!`, 'success');
    setBroadcastMessage('');
    setIsBroadcastOpen(false);
  };

  // Toggle freeze on admissions
  const handleToggleFreeze = async () => {
    const nextState = !isAdmissionsFrozen;
    cyberAudio.play(nextState ? 'alert' : 'confirm');
    setIsAdmissionsFrozen(nextState);
    await auditService.record({
      action: nextState ? 'SUPER_ADMIN_FREEZE_ADMISSIONS' : 'SUPER_ADMIN_UNFREEZE_ADMISSIONS',
      module: 'DISTRICT_COMMAND',
      target: `District Admission Control: ${selectedDistrict}`,
      newValue: nextState ? 'FROZEN' : 'ACTIVE',
      district: selectedDistrict,
      status: 'SUCCESS'
    });
    pushTerminalLog('OVERRIDE', `District admission gate set to ${nextState ? 'FROZEN' : 'OPEN'} for ${selectedDistrict}.`);
    showToast(
      nextState 
        ? `Seat allocations and new student admissions frozen in ${selectedDistrict}!` 
        : `Seat allocations and admissions reopened for ${selectedDistrict}!`,
      nextState ? 'warning' : 'success'
    );
  };

  // Copy helper
  const handleCopyText = (text: string, label: string) => {
    cyberAudio.play('click');
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard!`, 'info');
  };

  // Toggle cyber audio
  const handleToggleAudio = () => {
    const newState = cyberAudio.toggle();
    setAudioEnabled(newState);
    cyberAudio.play('beep');
    showToast(`Cyber Audio FX: ${newState ? 'ENGAGED' : 'MUTED'}`, 'info');
  };

  return (
    <div className="space-y-6 max-w-full overflow-hidden text-slate-100 relative bg-[#060b19] p-3 sm:p-5 lg:p-6 rounded-3xl cyber-grid-bg border-2 border-cyan-500/40 shadow-2xl">
      {/* Sci-Fi Ambient Cyber Grid Background Texture */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-25 z-0 bg-[linear-gradient(to_right,#06b6d415_1px,transparent_1px),linear-gradient(to_bottom,#06b6d415_1px,transparent_1px)] bg-[size:32px_32px]" 
        aria-hidden="true" 
      />

      {/* 1. Bespoke Panoramic Cyber-HUD Command Station */}
      <div className="relative z-10 p-5 sm:p-6 rounded-3xl bg-slate-900/95 border-2 border-cyan-500/50 shadow-2xl text-white space-y-4 overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-48 bg-gradient-to-bl from-cyan-500/15 via-blue-500/10 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-36 bg-gradient-to-tr from-brand-500/15 via-cyan-500/10 to-transparent blur-2xl pointer-events-none" />

        {/* TIER 1: Micro-HUD Breadcrumbs & Live Orbital Telemetry Stream */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-cyan-500/30 text-xs">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 flex-wrap text-slate-200 font-bold" aria-label="Breadcrumb">
            <Link 
              to="/super-admin/dashboard" 
              className="text-cyan-400 hover:text-white transition-colors flex items-center gap-1 font-bold"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>Super Administration</span>
            </Link>
            <ChevronRight className="w-3 h-3 text-cyan-400" />
            <span className="text-slate-200 font-bold">Territory Desks</span>
            <ChevronRight className="w-3 h-3 text-cyan-400" />
            <span className="px-2.5 py-0.5 rounded-md bg-cyan-950 border border-cyan-400 text-cyan-300 font-extrabold flex items-center gap-1.5 shadow-xs">
              <Crosshair className="w-3 h-3 text-cyan-400" />
              <span>DIRECT DISTRICT COMMAND</span>
            </span>
            <span className="px-2 py-0.5 rounded-md bg-rose-950 border border-rose-500/60 text-rose-300 font-mono text-[10px] font-black uppercase">
              NODE: {selectedDistrict.toUpperCase()}
            </span>
          </nav>

          {/* Micro Telemetry HUD Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {/* GSAT-24 Satellite Uplink */}
            <div 
              onClick={() => handleInspectElement('Satellite Telemetry Uplink', 'ISRO-GSAT-24', 'Orbital Telemetry', { orbit: '83.5°E Geostationary', signalStrength: `${activeSignalStrength}%`, cipher: 'AES-256-GCM' })}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 border border-slate-700 hover:border-cyan-400 text-cyan-300 text-[11px] font-mono font-bold shadow-xs cursor-pointer transition-all"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="text-slate-400">GSAT-24:</span>
              <span className="text-cyan-300 font-extrabold">{activeSignalStrength}%</span>
            </div>

            {/* Live Orbit Latency */}
            <div 
              onClick={() => handleInspectElement('District Gateway Latency', `${liveLatency}ms`, 'Network Telemetry', { gateway: `${selectedDistrict.toUpperCase()}-GW01`, jitter: '0.00ms', packetLoss: '0%' })}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 border border-slate-700 hover:border-emerald-400 text-emerald-400 text-[11px] font-mono font-bold shadow-xs cursor-pointer transition-all"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400">PING:</span>
              <span className="text-emerald-400 font-extrabold">{liveLatency}ms</span>
            </div>

            {/* Root Privilege Lock */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-950/80 border border-red-500/60 text-red-300 text-[10px] font-mono font-black">
              <Lock className="w-3 h-3 text-red-400" />
              <span>LEVEL-0 ROOT PRIVILEGE</span>
            </div>

            {/* Audio Toggle */}
            <button
              type="button"
              onClick={handleToggleAudio}
              title="Toggle Tactical Audio FX"
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold transition-all cursor-pointer shadow-xs ${
                audioEnabled
                  ? 'bg-cyan-950 border-cyan-400 text-cyan-300 hover:bg-cyan-900'
                  : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              {audioEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{audioEnabled ? 'Audio: ON' : 'Audio: MUTE'}</span>
            </button>
          </div>
        </div>

        {/* TIER 2: Dedicated Horizontal Command Cockpit: Title + Laser Divider + Subtitle */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-cyan-500/40 shadow-inner backdrop-blur-md">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
            {/* Left Wing: Holographic Pulse Emblem + Title */}
            <div className="flex items-center gap-3.5 sm:gap-4 shrink-0">
              <div className="relative shrink-0 flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500/30 via-cyan-500/25 to-blue-600/30 border-2 border-cyan-400 shadow-lg shadow-cyan-500/20">
                <ShieldAlert className="w-7 h-7 text-cyan-300 animate-pulse" />
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-slate-950 animate-ping" />
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-black tracking-tight uppercase text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-300 drop-shadow-md">
                    DIRECT DISTRICT COMMAND CONSOLE
                  </h1>
                  <span className="px-2 py-0.5 rounded-md bg-cyan-950 border border-cyan-400 text-[10px] font-mono font-black text-cyan-300 uppercase tracking-wider shadow-xs">
                    ROOT INTERVENTION
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold text-cyan-400/90 uppercase tracking-widest block mt-0.5">
                  CENTRAL EXECUTIVE JURISDICTION & REAL-TIME DISPATCH DESK
                </span>
              </div>
            </div>

            {/* Glowing Neon Laser Divider (Vertical on lg screens, Horizontal on small screens) */}
            <div className="hidden lg:block w-px h-14 bg-gradient-to-b from-cyan-400/20 via-cyan-400 to-cyan-400/20 shrink-0 mx-3 shadow-xs shadow-cyan-400" />
            <div className="lg:hidden w-full h-px bg-slate-800" />

            {/* Right Wing: The Subtitle (Rendered Horizontally Side-by-Side) */}
            <div className="flex-1 min-w-0 max-w-2xl">
              <p className="text-xs sm:text-[13px] font-semibold text-slate-200 leading-relaxed">
                Central executive intervention across teacher verifications, library accreditations, and urgent student allocations across India's districts.
              </p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  INSTANT CLEARANCE ENGAGED
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/40">
                  <Cpu className="w-3 h-3 text-cyan-400" />
                  T+0 FINANCIAL SETTLEMENT
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-500/40">
                  <Radio className="w-3 h-3 text-purple-400" />
                  BYPASS REGIONAL DELAYS
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* TIER 3: Action & Utility Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs">
          {/* Active Jurisdiction Status Tag */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 font-bold uppercase text-[11px]">ACTIVE TELEMETRY TARGET:</span>
            <div 
              onClick={() => handleInspectElement('Active Focus Jurisdiction', `${selectedDistrict.toUpperCase()} (${selectedState.toUpperCase()})`, 'Geographic Territory', { district: selectedDistrict, state: selectedState })}
              className="px-3 py-1 rounded-xl bg-slate-950 border border-cyan-400/60 text-cyan-300 font-mono font-black text-xs hover:border-cyan-300 cursor-pointer transition-all flex items-center gap-1.5 shadow-sm"
            >
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>{selectedDistrict.toUpperCase()}, {selectedState.toUpperCase()}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Terminal Logs Toggle */}
            <button
              type="button"
              onClick={() => {
                cyberAudio.play('click');
                setIsTerminalOpen(prev => !prev);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-black transition-all cursor-pointer shadow-sm ${
                isTerminalOpen
                  ? 'bg-purple-950 border-purple-400 text-purple-200'
                  : 'bg-slate-950 border-slate-700 text-slate-200 hover:text-white hover:border-purple-400'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-purple-400" />
              <span>Audit Stream</span>
              <span className="px-1.5 py-0.5 rounded-full bg-purple-500/30 text-purple-200 text-[10px] font-mono">
                {terminalLogs.length}
              </span>
            </button>

            {/* Broadcast Advisory Button */}
            <button
              type="button"
              onClick={() => {
                cyberAudio.play('click');
                setIsBroadcastOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 hover:border-cyan-400 text-cyan-300 hover:text-white text-xs font-black transition-all cursor-pointer shadow-sm"
            >
              <Send className="w-3.5 h-3.5 text-cyan-400" />
              <span>Push Advisory</span>
            </button>

            {/* Jump to National Console */}
            <Link to="/super-admin/dashboard">
              <button 
                onClick={() => cyberAudio.play('click')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-black transition-all cursor-pointer shadow-md shadow-cyan-600/30"
              >
                <span>National Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Central Super Admin Audit Banner with Live Satellite Telemetry */}
      <div className="relative z-10 p-5 rounded-3xl bg-gradient-to-r from-red-950/95 via-slate-950 to-slate-900 border-2 border-red-500/70 text-white shadow-2xl overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-36 bg-red-500/15 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-red-600/30 border border-red-400 text-red-300 shrink-0 mt-0.5 shadow-inner">
              <ShieldAlert className="w-7 h-7 text-red-400 animate-pulse" />
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span 
                  onClick={() => handleInspectElement('Executive Security Protocol', 'Super Admin Override Engaged', 'Security clearance', { level: 'Level-0 Root', crypt: 'AES-256' })}
                  className="font-black uppercase tracking-wider text-white text-xs sm:text-sm hover:text-cyan-300 cursor-pointer transition-colors"
                >
                  SUPER ADMIN OVERRIDE PROTOCOL ENGAGED
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white font-black text-[10px] tracking-wider flex items-center gap-1 shadow-md shadow-red-600/40">
                  <Radio className="w-2.5 h-2.5 animate-ping" />
                  LEVEL-0 ROOT LOCK
                </span>
                <span 
                  onClick={() => handleInspectElement('Jurisdiction Territory', `${selectedDistrict.toUpperCase()} (${selectedState.toUpperCase()})`, 'Geographic territory', { district: selectedDistrict, state: selectedState })}
                  className="px-2.5 py-0.5 rounded-lg bg-cyan-950 border border-cyan-400 text-cyan-300 font-mono text-[11px] font-black hover:border-cyan-300 cursor-pointer transition-all"
                >
                  TERRITORY: {selectedDistrict.toUpperCase()} ({selectedState.toUpperCase()})
                </span>
              </div>
              <p className="text-slate-100 leading-relaxed text-xs sm:text-[13px] max-w-3xl font-medium">
                Interventions in this workspace are cryptographically recorded in the central audit ledger with instantaneous central clearance authority, bypassing standard regional delays while ensuring strict compliance.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center shrink-0">
            {/* Live Orbit & Satellite Uplink Badges */}
            <div 
              onClick={() => handleInspectElement('Satellite Uplink', 'ISRO-GSAT-24', 'Orbital telemetry', { orbitalPosition: '83.5°E Geostationary', signalStrength: `${activeSignalStrength}%`, encryption: 'AES-256-GCM' })}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border-2 border-slate-700 text-cyan-300 font-mono text-xs font-black flex items-center gap-2 shadow-inner cursor-pointer hover:border-cyan-400 hover:text-white transition-all"
            >
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>GSAT-24 // {activeSignalStrength}%</span>
            </div>

            <div 
              onClick={() => handleInspectElement('Central Node Latency', `${liveLatency}ms`, 'Network telemetry', { targetNode: `${selectedDistrict}-GW`, packetLoss: '0.00%', jitter: '0.2ms' })}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border-2 border-slate-700 text-emerald-400 font-mono text-xs font-black flex items-center gap-2 shadow-inner cursor-pointer hover:border-emerald-400 hover:text-white transition-all"
            >
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>PING: {liveLatency}ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Quick Territory Switcher & Cascading Header Controller */}
      <div className="relative z-10 p-5 sm:p-6 rounded-3xl bg-slate-950/95 border-2 border-cyan-500/40 shadow-2xl space-y-4">
        {/* Instant District Switcher Chips */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label className="text-xs font-black uppercase tracking-wider text-cyan-300 flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Instant Operational District Teleportation:</span>
            </label>
            <span className="text-xs text-slate-200">
              Active Focus: <strong className="text-white font-black underline decoration-cyan-400 underline-offset-4">{selectedDistrict}</strong>
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {QUICK_DISTRICT_CHIPS.map(c => {
              const isActive = c.name.toLowerCase() === selectedDistrict.toLowerCase();
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => {
                    cyberAudio.play('warp');
                    setSelectedState(c.state);
                    setSelectedDistrict(c.name);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 shadow-sm ${
                    isActive
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/50 border-2 border-red-300 scale-105 ring-2 ring-red-400/60'
                      : 'bg-slate-900 text-white hover:text-cyan-300 hover:bg-slate-800 hover:border-cyan-400 border-2 border-slate-700/90 hover:scale-102'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{c.name}</span>
                  <span className="text-[10px] text-cyan-300 font-mono font-bold">({c.code})</span>
                  {isActive && <Check className="w-3.5 h-3.5 text-white ml-0.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Responsive Cascading State & District Selectors + Coordinator Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-center pt-3 border-t border-slate-800">
          {/* State Selector */}
          <div className="space-y-1.5 min-w-0">
            <label className="text-xs font-extrabold text-slate-100 flex items-center gap-1.5 uppercase tracking-wider">
              <Globe className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>State / Territory Directorate</span>
            </label>
            <select
              value={selectedState}
              onChange={(e) => {
                cyberAudio.play('click');
                setSelectedState(e.target.value);
              }}
              className="w-full h-11 px-3.5 rounded-xl bg-slate-950 border-2 border-slate-700 text-white font-extrabold text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 hover:border-purple-400 transition-colors truncate cursor-pointer shadow-inner"
            >
              {allStates.map(s => (
                <option key={s.id} value={s.name} className="bg-slate-900 text-white font-bold">
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          {/* District Selector */}
          <div className="space-y-1.5 min-w-0">
            <label className="text-xs font-extrabold text-slate-100 flex items-center gap-1.5 uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Target Operating District</span>
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => {
                cyberAudio.play('click');
                setSelectedDistrict(e.target.value);
              }}
              className="w-full h-11 px-3.5 rounded-xl bg-slate-950 border-2 border-slate-700 text-white font-extrabold text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-400 hover:border-cyan-400 transition-colors truncate cursor-pointer shadow-inner"
            >
              {availableDistricts.map(d => (
                <option key={d.id} value={d.name} className="bg-slate-900 text-white font-bold">
                  {d.name} {d.code ? `(${d.code})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* District Coordinator Info Card */}
          <div className="space-y-1.5 md:col-span-2 xl:col-span-1 min-w-0">
            <label className="text-xs font-extrabold text-slate-100 uppercase tracking-wider block">Appointed District Coordinator</label>
            <div 
              onClick={() => handleInspectElement(
                currentDistrictInfo.admin,
                currentDistrictInfo.email,
                'District coordinator',
                {
                  phone: currentDistrictInfo.phone,
                  appointed: currentDistrictInfo.appointedDate,
                  status: currentDistrictInfo.status,
                  jurisdiction: selectedDistrict
                }
              )}
              className="h-11 px-3.5 rounded-xl bg-slate-950 border-2 border-slate-700 flex items-center justify-between gap-2 overflow-hidden hover:border-cyan-400 hover:bg-slate-900 cursor-pointer transition-all group shadow-inner"
            >
              <div className="truncate text-xs">
                <span className="text-cyan-300 text-[10px] block font-bold group-hover:text-cyan-200">Central Authorization</span>
                <span className="font-black text-white truncate block group-hover:text-cyan-100">{currentDistrictInfo.admin}</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-400 shrink-0 flex items-center gap-1 group-hover:scale-105 transition-transform">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                {currentDistrictInfo.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Real-Time District Operational Telemetry Bar (Clickable & High Contrast) */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        {/* Metric 1: GMV */}
        <div 
          onClick={() => {
            cyberAudio.play('click');
            setActiveTab('overview');
            setSelectedCardId(null);
            handleInspectElement(
              'District Platform GMV',
              `₹${districtTelemetry?.monthlyPlatformGMV ? districtTelemetry.monthlyPlatformGMV.toLocaleString('en-IN') : '3,18,000'}`,
              'Financial Telemetry',
              {
                takeRate: '8.0%',
                platformRevenue: `₹${districtTelemetry?.platformRevenue ? districtTelemetry.platformRevenue.toLocaleString('en-IN') : '25,440'}`,
                settlementCycle: 'Instant T+0',
                district: selectedDistrict
              }
            );
          }}
          className={`p-5 rounded-2xl cyber-hud-card hud-corner-brackets transition-all cursor-pointer group shadow-xl relative overflow-hidden ${
            activeTab === 'overview' 
              ? 'border-2 border-emerald-400 ring-2 ring-emerald-500/40 bg-slate-900' 
              : 'border-2 border-slate-800 hover:border-emerald-400 bg-slate-950/90 hover:bg-slate-900'
          }`}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
          <div className="flex items-center justify-between text-slate-200 group-hover:text-white">
            <span className="text-[11px] uppercase font-black tracking-wider text-slate-200 group-hover:text-emerald-300">1. District GMV</span>
            <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 group-hover:scale-110 transition-transform">
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-mono font-black text-white group-hover:text-emerald-300 mt-2 tracking-tight">
            ₹{districtTelemetry?.monthlyPlatformGMV ? districtTelemetry.monthlyPlatformGMV.toLocaleString('en-IN') : '3,18,000'}
          </p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80">
            <span className="text-[11px] text-slate-200 font-bold">
              8% Platform Take:
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-950 border border-emerald-500/50 text-emerald-300 font-mono font-black text-xs">
              ₹{districtTelemetry?.platformRevenue ? districtTelemetry.platformRevenue.toLocaleString('en-IN') : '25,440'}
            </span>
          </div>
        </div>

        {/* Metric 2: Verified Tutors */}
        <div 
          onClick={() => {
            cyberAudio.play('click');
            setActiveTab('teachers');
            setSelectedCardId(null);
            handleInspectElement(
              'Verified Educators',
              `${districtTelemetry?.verifiedEducators || 48} Tutors`,
              'Educator network',
              {
                actionableQueue: `${pendingTeachers.length} Pending`,
                avgHourlyRate: '₹750/hr',
                verificationPassRate: '98.2%',
                district: selectedDistrict
              }
            );
          }}
          className={`p-5 rounded-2xl cyber-hud-card hud-corner-brackets transition-all cursor-pointer group shadow-xl relative overflow-hidden ${
            activeTab === 'teachers' 
              ? 'border-2 border-blue-400 ring-2 ring-blue-500/40 bg-slate-900' 
              : 'border-2 border-slate-800 hover:border-blue-400 bg-slate-950/90 hover:bg-slate-900'
          }`}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-400" />
          <div className="flex items-center justify-between text-slate-200 group-hover:text-white">
            <span className="text-[11px] uppercase font-black tracking-wider text-slate-200 group-hover:text-blue-300">2. Verified Tutors</span>
            <div className="p-2 rounded-xl bg-blue-500/15 border border-blue-500/40 text-blue-400 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-mono font-black text-white group-hover:text-blue-300 mt-2 tracking-tight">
            {districtTelemetry?.verifiedEducators || 48} Tutors
          </p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80">
            <span className="text-[11px] text-slate-200 font-bold">
              Actionable Queue:
            </span>
            <span className="px-2 py-0.5 rounded-md bg-amber-950 border border-amber-500/50 text-amber-300 font-mono font-black text-xs">
              {pendingTeachers.length} Pending
            </span>
          </div>
        </div>

        {/* Metric 3: Study Libraries */}
        <div 
          onClick={() => {
            cyberAudio.play('click');
            setActiveTab('libraries');
            setSelectedCardId(null);
            handleInspectElement(
              'Study Libraries',
              `${districtTelemetry?.selfStudyLibraries || 12} Facilities`,
              'Infrastructure capacity',
              {
                totalSmartDesks: districtTelemetry?.totalLibrarySeats || 720,
                pendingInspection: pendingLibraries.length,
                biometricCompliance: '100%',
                district: selectedDistrict
              }
            );
          }}
          className={`p-5 rounded-2xl cyber-hud-card hud-corner-brackets transition-all cursor-pointer group shadow-xl relative overflow-hidden ${
            activeTab === 'libraries' 
              ? 'border-2 border-amber-400 ring-2 ring-amber-500/40 bg-slate-900' 
              : 'border-2 border-slate-800 hover:border-amber-400 bg-slate-950/90 hover:bg-slate-900'
          }`}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-yellow-400" />
          <div className="flex items-center justify-between text-slate-200 group-hover:text-white">
            <span className="text-[11px] uppercase font-black tracking-wider text-slate-200 group-hover:text-amber-300">3. Study Libraries</span>
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-400 group-hover:scale-110 transition-transform">
              <Building2 className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-mono font-black text-white group-hover:text-amber-300 mt-2 tracking-tight">
            {districtTelemetry?.selfStudyLibraries || 12} Facilities
          </p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80">
            <span className="text-[11px] text-slate-200 font-bold">
              Total Smart Desks:
            </span>
            <span className="px-2 py-0.5 rounded-md bg-amber-950 border border-amber-500/50 text-amber-300 font-mono font-black text-xs">
              {districtTelemetry?.totalLibrarySeats || 720} Desks
            </span>
          </div>
        </div>

        {/* Metric 4: Active Learners */}
        <div 
          onClick={() => {
            cyberAudio.play('click');
            setActiveTab('requests');
            setSelectedCardId(null);
            handleInspectElement(
              'Active Learners',
              `${districtTelemetry?.activeTuitionStudents || 412} Learners`,
              'Student velocity',
              {
                pendingAllocations: tutorRequests.length,
                allocationSpeed: '2.8 hours avg',
                escrowSecured: '100%',
                district: selectedDistrict
              }
            );
          }}
          className={`p-5 rounded-2xl cyber-hud-card hud-corner-brackets transition-all cursor-pointer group shadow-xl relative overflow-hidden ${
            activeTab === 'requests' 
              ? 'border-2 border-purple-400 ring-2 ring-purple-500/40 bg-slate-900' 
              : 'border-2 border-slate-800 hover:border-purple-400 bg-slate-950/90 hover:bg-slate-900'
          }`}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-400" />
          <div className="flex items-center justify-between text-slate-200 group-hover:text-white">
            <span className="text-[11px] uppercase font-black tracking-wider text-slate-200 group-hover:text-purple-300">4. Active Learners</span>
            <div className="p-2 rounded-xl bg-purple-500/15 border border-purple-500/40 text-purple-400 group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4 text-purple-400" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-mono font-black text-white group-hover:text-purple-300 mt-2 tracking-tight">
            {districtTelemetry?.activeTuitionStudents || 412} Learners
          </p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80">
            <span className="text-[11px] text-slate-200 font-bold">
              Urgent Allocations:
            </span>
            <span className="px-2 py-0.5 rounded-md bg-purple-950 border border-purple-500/50 text-purple-300 font-mono font-black text-xs">
              {tutorRequests.length} Demands
            </span>
          </div>
        </div>
      </div>

      {/* 5. Operations Hub Tabs with High-Contrast Illuminations & Subject Filter Chips */}
      <div className="relative z-10 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b-2 border-slate-800 pb-3">
          {/* Operations Hub Navigation Tabs */}
          <div className="flex gap-2 text-xs sm:text-sm font-bold overflow-x-auto pb-1 max-w-full">
            <button
              type="button"
              onClick={() => {
                cyberAudio.play('click');
                setActiveTab('teachers');
                setSelectedCardId(null);
              }}
              className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                activeTab === 'teachers' 
                  ? 'bg-blue-600 text-white font-black shadow-lg shadow-blue-600/50 border-2 border-blue-300 scale-102 ring-2 ring-blue-400/40' 
                  : 'bg-slate-900 text-white hover:text-cyan-300 hover:bg-slate-800 border-2 border-slate-700 hover:border-blue-400 font-extrabold'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-blue-300" />
              <span>Educator Verifications ({pendingTeachers.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                cyberAudio.play('click');
                setActiveTab('libraries');
                setSelectedCardId(null);
              }}
              className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                activeTab === 'libraries' 
                  ? 'bg-amber-600 text-white font-black shadow-lg shadow-amber-600/50 border-2 border-amber-300 scale-102 ring-2 ring-amber-400/40' 
                  : 'bg-slate-900 text-white hover:text-amber-300 hover:bg-slate-800 border-2 border-slate-700 hover:border-amber-400 font-extrabold'
              }`}
            >
              <Building2 className="w-4 h-4 text-amber-300" />
              <span>Library Accreditation ({pendingLibraries.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                cyberAudio.play('click');
                setActiveTab('requests');
                setSelectedCardId(null);
              }}
              className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                activeTab === 'requests' 
                  ? 'bg-emerald-600 text-white font-black shadow-lg shadow-emerald-600/50 border-2 border-emerald-300 scale-102 ring-2 ring-emerald-400/40' 
                  : 'bg-slate-900 text-white hover:text-emerald-300 hover:bg-slate-800 border-2 border-slate-700 hover:border-emerald-400 font-extrabold'
              }`}
            >
              <Clock className="w-4 h-4 text-emerald-300" />
              <span>Tutor Allocation ({tutorRequests.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                cyberAudio.play('click');
                setActiveTab('overview');
                setSelectedCardId(null);
              }}
              className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                activeTab === 'overview' 
                  ? 'bg-purple-600 text-white font-black shadow-lg shadow-purple-600/50 border-2 border-purple-300 scale-102 ring-2 ring-purple-400/40' 
                  : 'bg-slate-900 text-white hover:text-purple-300 hover:bg-slate-800 border-2 border-slate-700 hover:border-purple-400 font-extrabold'
              }`}
            >
              <Activity className="w-4 h-4 text-purple-300" />
              <span>District Live Status</span>
            </button>
          </div>

          {/* Search Queue */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-cyan-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, subject, locality..."
              className="w-full h-11 pl-10 pr-9 rounded-xl bg-slate-950 border-2 border-slate-700 text-white placeholder:text-slate-400 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-400 hover:border-cyan-400 transition-colors shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Category Quick Filters */}
        {activeTab === 'teachers' && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-200 font-black flex items-center gap-1 uppercase tracking-wider text-[11px]">
              <Filter className="w-3.5 h-3.5 text-cyan-400" /> Subject Filter:
            </span>
            {['ALL', 'Physics', 'Mathematics', 'Chemistry', 'Biology', 'Computer'].map(sub => (
              <button
                key={sub}
                type="button"
                onClick={() => {
                  cyberAudio.play('click');
                  setSubjectFilter(sub);
                }}
                className={`px-3.5 py-1.5 rounded-lg font-black text-xs transition-all cursor-pointer ${
                  subjectFilter === sub
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/40 border border-blue-300'
                    : 'bg-slate-900 text-white hover:text-cyan-300 hover:bg-slate-800 border border-slate-700'
                }`}
              >
                {sub}
              </button>
            ))}
            {pendingTeachers.length > 0 && (
              <button
                type="button"
                onClick={handleBatchApproveTeachers}
                className="ml-auto px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs transition-all shadow-md shadow-emerald-600/40 border border-emerald-400 flex items-center gap-1.5 cursor-pointer"
              >
                <CheckSquare className="w-4 h-4" />
                <span>Fast-Track Batch Approve All</span>
              </button>
            )}
          </div>
        )}

        {activeTab === 'libraries' && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-200 font-black flex items-center gap-1 uppercase tracking-wider text-[11px]">
              <Filter className="w-3.5 h-3.5 text-amber-400" /> Facility Filter:
            </span>
            {['ALL', 'AC', 'Fiber', 'Biometric', 'Power'].map(am => (
              <button
                key={am}
                type="button"
                onClick={() => {
                  cyberAudio.play('click');
                  setLibraryAmenityFilter(am);
                }}
                className={`px-3.5 py-1.5 rounded-lg font-black text-xs transition-all cursor-pointer ${
                  libraryAmenityFilter === am
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/40 border border-amber-300'
                    : 'bg-slate-900 text-white hover:text-amber-300 hover:bg-slate-800 border border-slate-700'
                }`}
              >
                {am}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-200 font-black flex items-center gap-1 uppercase tracking-wider text-[11px]">
              <Filter className="w-3.5 h-3.5 text-emerald-400" /> Urgency Filter:
            </span>
            {['ALL', 'URGENT', 'HIGH', 'STANDARD'].map(u => (
              <button
                key={u}
                type="button"
                onClick={() => {
                  cyberAudio.play('click');
                  setUrgencyFilter(u);
                }}
                className={`px-3.5 py-1.5 rounded-lg font-black text-xs transition-all cursor-pointer ${
                  urgencyFilter === u
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/40 border border-emerald-300'
                    : 'bg-slate-900 text-white hover:text-emerald-300 hover:bg-slate-800 border border-slate-700'
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        )}

        {/* Tab 1: Educator Approvals */}
        {activeTab === 'teachers' && (
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-950/95 border-2 border-slate-800 space-y-4 max-w-full shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2 border-slate-800">
              <div>
                <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-blue-400" />
                  <span>Pending Educator Central Clearances — {selectedDistrict}</span>
                </h3>
                <p className="text-xs text-slate-200 font-semibold mt-0.5">
                  Click any educator dossier to inspect academic degrees, verified credentials, and execute central approval
                </p>
              </div>
              <span className="text-xs text-blue-300 font-black bg-blue-950 border border-blue-400 px-3.5 py-1.5 rounded-xl shadow-xs">
                {filteredTeachers.length} Actionable Candidates
              </span>
            </div>

            {filteredTeachers.length === 0 ? (
              <div className="p-8 text-center text-slate-200 text-xs bg-slate-900/90 rounded-2xl border-2 border-slate-800 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <p className="font-black text-white text-base">All Educator Approvals Cleared in {selectedDistrict}</p>
                <p className="text-slate-300 font-medium">No educator verification applications currently pending in this territory queue.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTeachers.map(t => {
                  const isSelected = selectedCardId === t.id;
                  return (
                    <div 
                      key={t.id} 
                      onClick={() => {
                        cyberAudio.play('click');
                        setSelectedCardId(isSelected ? null : t.id);
                        handleInspectElement(
                          t.name,
                          t.subject,
                          'Educator credentials',
                          {
                            qualifications: t.qualifications,
                            hourlyRate: `₹${t.hourlyRate}/hr`,
                            verificationScore: `${t.verificationScore}%`,
                            phone: t.phone,
                            email: t.email,
                            locality: t.locality,
                            district: t.district
                          },
                          'PENDING_CENTRAL_APPROVAL',
                          t.id
                        );
                      }}
                      className={`p-5 sm:p-6 rounded-2xl transition-all cursor-pointer group border-2 ${
                        isSelected 
                          ? 'bg-slate-900 border-cyan-400 ring-2 ring-cyan-500/40 shadow-2xl shadow-cyan-500/20 scale-[1.005]' 
                          : 'bg-slate-950/90 border-slate-800 hover:border-cyan-400/90 hover:bg-slate-900 hover:shadow-xl'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="min-w-0 space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <h4 className="font-black text-white text-base sm:text-lg group-hover:text-cyan-300 transition-colors">
                              {t.name}
                            </h4>
                            <span className="px-3 py-1 rounded-lg bg-blue-950 text-blue-300 font-mono text-xs font-black border border-blue-400">
                              ₹{t.hourlyRate}/hr
                            </span>
                            <span className="px-3 py-1 rounded-lg bg-emerald-950 text-emerald-300 font-mono text-xs font-black border border-emerald-400 flex items-center gap-1.5">
                              <ShieldCheck className="w-4 h-4 text-emerald-400" />
                              {t.verificationScore}% Score
                            </span>
                          </div>

                          <p className="text-cyan-300 font-black text-xs sm:text-[13px] break-words group-hover:text-cyan-200">
                            {t.subject} • {t.exp}
                          </p>

                          <p className="text-xs text-slate-100 group-hover:text-white font-semibold">
                            <strong className="text-slate-300 uppercase text-[11px] font-bold">Qualifications:</strong> {t.qualifications}
                          </p>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-200 group-hover:text-white pt-1 font-medium">
                            <span><strong className="text-slate-300 uppercase text-[11px] font-bold">Locality:</strong> <span className="text-white font-semibold">{t.locality}, {t.district}</span></span>
                            <span>•</span>
                            <span><strong className="text-slate-300 uppercase text-[11px] font-bold">Applied:</strong> <span className="text-white font-mono font-semibold">{t.appliedDate}</span></span>
                            <span>•</span>
                            <span className="text-cyan-400 font-black group-hover:underline flex items-center gap-1.5">
                              <Eye className="w-4 h-4 text-cyan-400" />
                              {isSelected ? 'Click to Collapse Dossier' : 'Click to Inspect Full Credentials Dossier'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleApproveTeacher(t)}
                            disabled={processingId === t.id}
                            className="w-full md:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs transition-all shadow-lg shadow-emerald-600/40 hover:shadow-emerald-500/60 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 border border-emerald-400"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{processingId === t.id ? 'Approving...' : 'Direct Approve (Super Admin)'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Expanded Holographic Inspection Dossier when clicked */}
                      {isSelected && (
                        <div className="mt-5 pt-5 border-t-2 border-cyan-500/50 space-y-4 bg-slate-950 border border-slate-800 p-5 rounded-2xl shadow-inner">
                          <div className="flex items-center justify-between text-xs text-cyan-300 font-black">
                            <span className="flex items-center gap-2 uppercase tracking-wider">
                              <Award className="w-4 h-4 text-cyan-400" />
                              Central Accreditation Credentials Dossier
                            </span>
                            <span className="text-emerald-300 font-mono flex items-center gap-1.5 font-bold">
                              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Aadhaar & Police Background Verified
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                            <div className="p-4 rounded-xl bg-slate-900 border-2 border-slate-800 space-y-2">
                              <span className="text-[10px] text-cyan-300 block uppercase font-black tracking-wider">Verified Degrees</span>
                              <div className="space-y-1.5">
                                {t.degrees.map((d, i) => (
                                  <p key={i} className="text-white font-semibold flex items-center gap-2">
                                    <Check className="w-4 h-4 text-emerald-400 shrink-0" /> {d}
                                  </p>
                                ))}
                              </div>
                            </div>

                            <div className="p-4 rounded-xl bg-slate-900 border-2 border-slate-800 space-y-2">
                              <span className="text-[10px] text-cyan-300 block uppercase font-black tracking-wider">Direct Verified Contact</span>
                              <p 
                                onClick={(e) => { e.stopPropagation(); handleCopyText(t.phone, 'Teacher Phone'); }}
                                className="text-white font-mono font-bold flex items-center gap-2 hover:text-cyan-300 cursor-pointer text-xs"
                              >
                                <Phone className="w-4 h-4 text-emerald-400" /> {t.phone}
                              </p>
                              <p 
                                onClick={(e) => { e.stopPropagation(); handleCopyText(t.email, 'Teacher Email'); }}
                                className="text-white font-mono font-bold flex items-center gap-2 hover:text-cyan-300 cursor-pointer text-xs"
                              >
                                <Mail className="w-4 h-4 text-blue-400" /> {t.email}
                              </p>
                            </div>

                            <div className="p-4 rounded-xl bg-slate-900 border-2 border-slate-800 space-y-2">
                              <span className="text-[10px] text-cyan-300 block uppercase font-black tracking-wider">Teaching Demo Audit</span>
                              <p className="text-emerald-400 font-black text-base">4.9 / 5.0 (Passed)</p>
                              <p className="text-slate-200 text-xs font-medium">Evaluated by Central Academic Panel</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Library Approvals */}
        {activeTab === 'libraries' && (
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-950/95 border-2 border-slate-800 space-y-4 max-w-full shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2 border-slate-800">
              <div>
                <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-400" />
                  <span>Pending Study Library Facilities — {selectedDistrict}</span>
                </h3>
                <p className="text-xs text-slate-200 font-semibold mt-0.5">
                  Click any study center card to inspect desk blueprints, high-speed fiber lease, and grant instant central partnership
                </p>
              </div>
              <span className="text-xs text-amber-300 font-black bg-amber-950 border border-amber-400 px-3.5 py-1.5 rounded-xl shadow-xs">
                {filteredLibraries.length} Actionable Facilities
              </span>
            </div>

            {filteredLibraries.length === 0 ? (
              <div className="p-8 text-center text-slate-200 text-xs bg-slate-900/90 rounded-2xl border-2 border-slate-800 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <p className="font-black text-white text-base">All Study Centers Accredited in {selectedDistrict}</p>
                <p className="text-slate-300 font-medium">No study center facilities currently pending inspection in this territory queue.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredLibraries.map(lib => {
                  const isSelected = selectedCardId === lib.id;
                  return (
                    <div 
                      key={lib.id} 
                      onClick={() => {
                        cyberAudio.play('click');
                        setSelectedCardId(isSelected ? null : lib.id);
                        handleInspectElement(
                          lib.name,
                          `${lib.seats} Desks`,
                          'Library Facility',
                          {
                            locality: lib.locality,
                            owner: lib.owner,
                            fiberSpeed: lib.fiberSpeed,
                            cctvChannels: lib.cctvChannels,
                            fireSafety: lib.fireSafetyStatus,
                            biometric: lib.biometricModel
                          },
                          'PENDING_ACCREDITATION',
                          lib.id
                        );
                      }}
                      className={`p-5 sm:p-6 rounded-2xl transition-all cursor-pointer group border-2 ${
                        isSelected 
                          ? 'bg-slate-900 border-amber-400 ring-2 ring-amber-500/40 shadow-2xl shadow-amber-500/20 scale-[1.005]' 
                          : 'bg-slate-950/90 border-slate-800 hover:border-amber-400/90 hover:bg-slate-900 hover:shadow-xl'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="min-w-0 space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <h4 className="font-black text-white text-base sm:text-lg group-hover:text-amber-300 transition-colors">
                              {lib.name}
                            </h4>
                            <span className="px-3 py-1 rounded-lg bg-amber-950 text-amber-300 font-mono text-xs font-black border border-amber-400">
                              {lib.seats} Desks
                            </span>
                          </div>

                          <p className="text-amber-300 font-black text-xs sm:text-[13px] break-words group-hover:text-amber-200">
                            {lib.locality}, {selectedDistrict}
                          </p>

                          <div className="flex flex-wrap gap-2 pt-0.5">
                            {lib.amenities.map(a => (
                              <span key={a} className="px-3 py-1 rounded-lg bg-slate-900 text-white text-xs font-bold border border-slate-700">
                                {a}
                              </span>
                            ))}
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-200 group-hover:text-white pt-1 font-medium">
                            <span><strong className="text-slate-300 uppercase text-[11px] font-bold">Owner:</strong> <span className="text-white font-semibold">{lib.owner}</span></span>
                            <span>•</span>
                            <span><strong className="text-slate-300 uppercase text-[11px] font-bold">Applied:</strong> <span className="text-white font-mono font-semibold">{lib.appliedDate}</span></span>
                            <span>•</span>
                            <span className="text-amber-400 font-black group-hover:underline flex items-center gap-1.5">
                              <Eye className="w-4 h-4 text-amber-400" />
                              {isSelected ? 'Click to Collapse Specs' : 'Click to View Hardware & Inspection Specs'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleApproveLibrary(lib)}
                            disabled={processingId === lib.id}
                            className="w-full md:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition-all shadow-lg shadow-amber-500/40 hover:shadow-amber-400/60 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 border border-amber-300"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{processingId === lib.id ? 'Accrediting...' : 'Accredit & Partner (Super Admin)'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Expanded Library Specifications when clicked */}
                      {isSelected && (
                        <div className="mt-5 pt-5 border-t-2 border-amber-500/50 space-y-4 bg-slate-950 border border-slate-800 p-5 rounded-2xl shadow-inner">
                          <div className="flex items-center justify-between text-xs text-amber-300 font-black">
                            <span className="flex items-center gap-2 uppercase tracking-wider">
                              <Building2 className="w-4 h-4 text-amber-400" />
                              Facility Hardware & Safety Inspection Telemetry
                            </span>
                            <span className="text-emerald-300 font-mono flex items-center gap-1.5 font-bold">
                              <CheckCircle className="w-4 h-4 text-emerald-400" /> Biometric Node Ready
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 text-xs">
                            <div className="p-4 rounded-xl bg-slate-900 border-2 border-slate-800 space-y-1.5">
                              <span className="text-[10px] text-amber-300 block uppercase font-black tracking-wider">Fiber Backbone</span>
                              <p className="text-white font-mono font-black flex items-center gap-2 text-xs">
                                <Wifi className="w-4 h-4 text-cyan-400" /> {lib.fiberSpeed}
                              </p>
                            </div>

                            <div className="p-4 rounded-xl bg-slate-900 border-2 border-slate-800 space-y-1.5">
                              <span className="text-[10px] text-amber-300 block uppercase font-black tracking-wider">Fire & Disaster Safety</span>
                              <p className="text-emerald-400 font-black flex items-center gap-2 text-xs">
                                <Flame className="w-4 h-4 text-amber-400" /> {lib.fireSafetyStatus}
                              </p>
                            </div>

                            <div className="p-4 rounded-xl bg-slate-900 border-2 border-slate-800 space-y-1.5">
                              <span className="text-[10px] text-amber-300 block uppercase font-black tracking-wider">CCTV Coverage</span>
                              <p className="text-white font-mono font-black text-xs">{lib.cctvChannels} Channels 24x7</p>
                            </div>

                            <div className="p-4 rounded-xl bg-slate-900 border-2 border-slate-800 space-y-1.5">
                              <span className="text-[10px] text-amber-300 block uppercase font-black tracking-wider">Biometric Turnstile</span>
                              <p className="text-cyan-400 font-mono font-black text-xs">{lib.biometricModel}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Tutor Requests & Allocation */}
        {activeTab === 'requests' && (
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-950/95 border-2 border-slate-800 space-y-4 max-w-full shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2 border-slate-800">
              <div>
                <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-400" />
                  <span>Pending Tutor Demands & Urgent Allocation — {selectedDistrict}</span>
                </h3>
                <p className="text-xs text-slate-200 font-semibold mt-0.5">
                  Click any student demand dossier to inspect guardian budget, target syllabus, and execute instant educator allocation
                </p>
              </div>
              <span className="text-xs text-emerald-300 font-black bg-emerald-950 border border-emerald-400 px-3.5 py-1.5 rounded-xl shadow-xs">
                {filteredRequests.length} Student Demands
              </span>
            </div>

            {filteredRequests.length === 0 ? (
              <div className="p-8 text-center text-slate-200 text-xs bg-slate-900/90 rounded-2xl border-2 border-slate-800 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <p className="font-black text-white text-base">All Student Requests Allocated in {selectedDistrict}</p>
                <p className="text-slate-300 font-medium">Every learner has been successfully paired with an accredited ZYZU'S educator.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map(req => {
                  const isSelected = selectedCardId === req.id;
                  return (
                    <div 
                      key={req.id} 
                      onClick={() => {
                        cyberAudio.play('click');
                        setSelectedCardId(isSelected ? null : req.id);
                        handleInspectElement(
                          req.student,
                          req.subject,
                          'Student tuition demand',
                          {
                            class: req.studentClass,
                            targetExam: req.targetExam,
                            monthlyBudget: `₹${req.monthlyBudget.toLocaleString('en-IN')}`,
                            urgency: req.urgency,
                            parentPhone: req.parentContact,
                            locality: req.locality,
                            district: req.district
                          },
                          'PENDING_ALLOCATION',
                          req.id
                        );
                      }}
                      className={`p-5 sm:p-6 rounded-2xl transition-all cursor-pointer group border-2 ${
                        isSelected 
                          ? 'bg-slate-900 border-emerald-400 ring-2 ring-emerald-500/40 shadow-2xl shadow-emerald-500/20 scale-[1.005]' 
                          : 'bg-slate-950/90 border-slate-800 hover:border-emerald-400/90 hover:bg-slate-900 hover:shadow-xl'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="min-w-0 space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <h4 className="font-black text-white text-base sm:text-lg group-hover:text-emerald-300 transition-colors">
                              {req.student}
                            </h4>
                            <span className="px-3 py-1 rounded-lg bg-blue-950 text-blue-300 font-mono text-xs font-black border border-blue-400">
                              {req.studentClass}
                            </span>
                            <span className={`px-3 py-1 rounded-lg font-mono text-xs font-black border ${
                              req.urgency === 'URGENT' 
                                ? 'bg-rose-950 text-rose-300 border-rose-400' 
                                : 'bg-amber-950 text-amber-300 border-amber-400'
                            }`}>
                              {req.urgency}
                            </span>
                          </div>

                          <p className="text-emerald-300 font-black text-xs sm:text-[13px] break-words group-hover:text-emerald-200">
                            Demand: {req.subject} • Target Syllabus: {req.targetExam}
                          </p>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-200 group-hover:text-white pt-1 font-medium">
                            <span><strong className="text-slate-300 uppercase text-[11px] font-bold">Locality:</strong> <span className="text-white font-semibold">{req.locality}, {req.district}</span></span>
                            <span>•</span>
                            <span><strong className="text-slate-300 uppercase text-[11px] font-bold">Raised:</strong> <span className="text-white font-mono font-semibold">{req.date}</span></span>
                            <span>•</span>
                            <span className="text-emerald-400 font-black group-hover:underline flex items-center gap-1.5">
                              <Eye className="w-4 h-4 text-emerald-400" />
                              {isSelected ? 'Click to Collapse Dossier' : 'Click to View Allocation & Guardian Escrow Details'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleAllocateTutor(req)}
                            disabled={processingId === req.id}
                            className="w-full md:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs transition-all shadow-lg shadow-emerald-600/40 hover:shadow-emerald-500/60 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 border border-emerald-300"
                          >
                            <Sparkles className="w-4 h-4" />
                            <span>{processingId === req.id ? 'Allocating...' : 'Allocate Educator (Fast-Track)'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Expanded Student Demand Dossier when clicked */}
                      {isSelected && (
                        <div className="mt-5 pt-5 border-t-2 border-emerald-500/50 space-y-4 bg-slate-950 border border-slate-800 p-5 rounded-2xl shadow-inner">
                          <div className="flex items-center justify-between text-xs text-emerald-300 font-black">
                            <span className="flex items-center gap-2 uppercase tracking-wider">
                              <BookOpen className="w-4 h-4 text-emerald-400" />
                              Student Learning Syllabus & Parent Verification
                            </span>
                            <span className="text-emerald-300 font-mono flex items-center gap-1.5 font-bold">
                              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Pre-Payment Escrow Secured
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                            <div className="p-4 rounded-xl bg-slate-900 border-2 border-slate-800 space-y-1.5">
                              <span className="text-[10px] text-emerald-300 block uppercase font-black tracking-wider">Parent Contact</span>
                              <p 
                                onClick={(e) => { e.stopPropagation(); handleCopyText(req.parentContact, 'Parent Contact'); }}
                                className="text-white font-mono font-bold flex items-center gap-2 hover:text-cyan-300 cursor-pointer text-xs"
                              >
                                <Phone className="w-4 h-4 text-emerald-400" /> {req.parentContact}
                              </p>
                              <p className="text-slate-300 text-[11px] font-medium">Primary Guardian Registered</p>
                            </div>

                            <div className="p-4 rounded-xl bg-slate-900 border-2 border-slate-800 space-y-1.5">
                              <span className="text-[10px] text-emerald-300 block uppercase font-black tracking-wider">Monthly Budget</span>
                              <p className="text-emerald-400 font-black text-sm sm:text-base">₹{req.monthlyBudget.toLocaleString('en-IN')} / mo</p>
                              <p className="text-slate-300 text-[11px] font-medium">4 Sessions / Week (Home + Online)</p>
                            </div>

                            <div className="p-4 rounded-xl bg-slate-900 border-2 border-slate-800 space-y-1.5">
                              <span className="text-[10px] text-emerald-300 block uppercase font-black tracking-wider">Fast-Track Match Recommendation</span>
                              <p className="text-cyan-300 font-black text-xs">Dr. Ramesh Chandra (98% Match)</p>
                              <p className="text-slate-300 text-[11px] font-medium">Proximity: 1.4 km from student</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: District Live Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metric Telemetry Grid (Centered Futuristic Cyber HUD) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div 
                onClick={() => {
                  cyberAudio.play('click');
                  handleInspectElement('Territory Node', selectedDistrict, 'Node Dispatch', { state: selectedState, district: selectedDistrict, jurisdictionCode: 'DIST-L0' });
                }}
                className="p-5 sm:p-6 rounded-2xl cyber-hud-card hud-corner-brackets text-center relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 cursor-pointer shadow-lg space-y-2"
              >
                <div className="mx-auto w-10 h-10 rounded-xl flex items-center justify-center bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 group-hover:scale-110 transition-transform">
                  <Copy className="w-4 h-4 text-cyan-400" />
                </div>
                <span className="text-[11px] uppercase font-bold tracking-wider text-slate-300 group-hover:text-cyan-300 block">Territory Node</span>
                <p className="text-2xl font-mono font-black text-white group-hover:text-cyan-300">{selectedDistrict}</p>
                <div className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[11px] text-cyan-300 font-bold">
                  {selectedState} Directorate
                </div>
              </div>

              <div 
                onClick={() => {
                  cyberAudio.play('click');
                  handleInspectElement('Monthly Territory GMV', `₹${districtTelemetry?.monthlyPlatformGMV ? districtTelemetry.monthlyPlatformGMV.toLocaleString('en-IN') : '3,18,000'}`, 'GMV Analytics', { takeRate: '8%', commission: `₹${districtTelemetry?.platformRevenue ? districtTelemetry.platformRevenue.toLocaleString('en-IN') : '25,440'}` });
                }}
                className="p-5 sm:p-6 rounded-2xl cyber-hud-card hud-corner-brackets text-center relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 cursor-pointer shadow-lg space-y-2"
              >
                <div className="mx-auto w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 group-hover:scale-110 transition-transform">
                  <IndianRupee className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-[11px] uppercase font-bold tracking-wider text-slate-300 group-hover:text-emerald-300 block">Monthly Territory GMV</span>
                <p className="text-2xl font-mono font-black text-emerald-400">
                  ₹{districtTelemetry?.monthlyPlatformGMV ? districtTelemetry.monthlyPlatformGMV.toLocaleString('en-IN') : '3,18,000'}
                </p>
                <div className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[11px] text-emerald-300 font-bold">
                  8% Take: ₹{districtTelemetry?.platformRevenue ? districtTelemetry.platformRevenue.toLocaleString('en-IN') : '25,440'}
                </div>
              </div>

              <div 
                onClick={() => {
                  cyberAudio.play('click');
                  handleInspectElement('Operational Scale', `${districtTelemetry?.activeTuitionStudents || 412} Learners`, 'Scale Analysis', { verifiedTutors: districtTelemetry?.verifiedEducators || 48, libraries: districtTelemetry?.selfStudyLibraries || 12 });
                }}
                className="p-5 sm:p-6 rounded-2xl cyber-hud-card hud-corner-brackets text-center relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 cursor-pointer shadow-lg space-y-2"
              >
                <div className="mx-auto w-10 h-10 rounded-xl flex items-center justify-center bg-blue-500/10 border border-blue-500/30 text-blue-400 group-hover:scale-110 transition-transform">
                  <Users className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-[11px] uppercase font-bold tracking-wider text-slate-300 group-hover:text-blue-300 block">Operational Scale</span>
                <p className="text-2xl font-mono font-black text-blue-400">
                  {districtTelemetry?.activeTuitionStudents || 412} Learners
                </p>
                <div className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-blue-950/80 border border-blue-500/40 text-[11px] text-blue-300 font-bold">
                  {districtTelemetry?.verifiedEducators || 48} Tutors • {districtTelemetry?.selfStudyLibraries || 12} Libraries
                </div>
              </div>

              <div 
                onClick={() => {
                  cyberAudio.play('click');
                  handleInspectElement('Action Queue Items', `${pendingTeachers.length + pendingLibraries.length + tutorRequests.length}`, 'Executive Tasks', { teachers: pendingTeachers.length, libraries: pendingLibraries.length, requests: tutorRequests.length });
                }}
                className="p-5 sm:p-6 rounded-2xl cyber-hud-card hud-corner-brackets text-center relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 cursor-pointer shadow-lg space-y-2"
              >
                <div className="mx-auto w-10 h-10 rounded-xl flex items-center justify-center bg-amber-500/10 border border-amber-500/30 text-amber-400 group-hover:scale-110 transition-transform">
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-[11px] uppercase font-bold tracking-wider text-slate-300 group-hover:text-amber-300 block">Pending Action Queue</span>
                <p className="text-2xl font-mono font-black text-amber-400">{pendingTeachers.length + pendingLibraries.length + tutorRequests.length}</p>
                <div className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/40 text-[11px] text-amber-300 font-bold">
                  Actionable Central Items
                </div>
              </div>
            </div>

            {/* Appointed Coordinator Governance Details & Emergency Overrides */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Coordinator Profile with High-Contrast Illuminations */}
              <div className="p-5 sm:p-6 rounded-3xl bg-slate-950/95 border-2 border-slate-800 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b-2 border-slate-800">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-blue-600/30 border-2 border-blue-400 text-blue-200 font-black text-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
                      {currentDistrictInfo.admin.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                    </div>
                    <div>
                      <h4 
                        onClick={() => handleInspectElement(currentDistrictInfo.admin, currentDistrictInfo.email, 'District Coordinator', { phone: currentDistrictInfo.phone, appointed: currentDistrictInfo.appointedDate })}
                        className="text-base sm:text-lg font-black text-white hover:text-cyan-300 transition-colors cursor-pointer"
                      >
                        {currentDistrictInfo.admin}
                      </h4>
                      <p className="text-xs text-slate-200 font-bold mt-0.5">Authorized Single District Coordinator</p>
                    </div>
                  </div>
                  <span className="px-3.5 py-1.5 rounded-full bg-emerald-950 text-emerald-300 font-black text-xs border border-emerald-400 shadow-xs">
                    {currentDistrictInfo.status}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div 
                    onClick={() => handleCopyText(currentDistrictInfo.email, 'Coordinator Email')}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border-2 border-slate-800 hover:border-blue-400 transition-all cursor-pointer group"
                  >
                    <span className="text-slate-200 group-hover:text-white flex items-center gap-2 font-bold">
                      <Mail className="w-4 h-4 text-blue-400" /> Email Address
                    </span>
                    <span className="font-mono text-white font-bold flex items-center gap-1.5 group-hover:text-cyan-300">
                      {currentDistrictInfo.email}
                      <Copy className="w-3.5 h-3.5 text-slate-300 group-hover:text-cyan-400" />
                    </span>
                  </div>

                  <div 
                    onClick={() => handleCopyText(currentDistrictInfo.phone, 'Coordinator Phone')}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border-2 border-slate-800 hover:border-emerald-400 transition-all cursor-pointer group"
                  >
                    <span className="text-slate-200 group-hover:text-white flex items-center gap-2 font-bold">
                      <Phone className="w-4 h-4 text-emerald-400" /> Phone Number
                    </span>
                    <span className="font-mono text-white font-bold flex items-center gap-1.5 group-hover:text-emerald-300">
                      {currentDistrictInfo.phone}
                      <Copy className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-400" />
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border-2 border-slate-800">
                    <span className="text-slate-200 font-bold">Authorized Since</span>
                    <span className="font-mono font-bold text-white">{currentDistrictInfo.appointedDate}</span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border-2 border-slate-800">
                    <span className="text-slate-200 font-bold">Admission Gate Status</span>
                    <span className={`font-mono font-black text-xs px-2.5 py-0.5 rounded-md border ${
                      isAdmissionsFrozen 
                        ? 'bg-red-950 text-red-300 border-red-500' 
                        : 'bg-emerald-950 text-emerald-300 border-emerald-500'
                    }`}>
                      {isAdmissionsFrozen ? 'FROZEN (Central Lock)' : 'OPEN & OPERATIONAL'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Central Super Admin Emergency Intervention Controls */}
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-red-950/40 border-2 border-red-500/70 space-y-4 shadow-2xl shadow-red-950/30">
                <div className="pb-3 border-b-2 border-red-500/30">
                  <h4 className="text-base font-black text-white flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-red-400 animate-pulse" />
                    <span>Central Super Admin Emergency Controls</span>
                  </h4>
                  <p className="text-xs text-slate-200 font-semibold mt-0.5">Instant executive authority actions applied to {selectedDistrict}</p>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      cyberAudio.play('click');
                      setIsBroadcastOpen(true);
                    }}
                    className="w-full py-4 px-5 rounded-2xl bg-blue-600/40 hover:bg-blue-600/60 text-white font-black text-xs sm:text-sm border-2 border-blue-400 hover:border-blue-300 transition-all flex items-center justify-between cursor-pointer shadow-lg shadow-blue-600/20 group"
                  >
                    <span className="flex items-center gap-2.5">
                      <Send className="w-4 h-4 text-cyan-300 group-hover:scale-115 transition-transform" />
                      <span>Broadcast Urgent District Circular</span>
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-cyan-300" />
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleFreeze}
                    className={`w-full py-4 px-5 rounded-2xl font-black text-xs sm:text-sm border-2 transition-all flex items-center justify-between cursor-pointer shadow-lg group ${
                      isAdmissionsFrozen
                        ? 'bg-emerald-600/40 hover:bg-emerald-600/60 text-white border-emerald-400 hover:border-emerald-300 shadow-emerald-500/20'
                        : 'bg-red-600/40 hover:bg-red-600/60 text-white border-red-500 hover:border-red-400 shadow-red-500/20'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      {isAdmissionsFrozen ? <Unlock className="w-4 h-4 text-emerald-300" /> : <Lock className="w-4 h-4 text-rose-300" />}
                      <span>{isAdmissionsFrozen ? 'Unfreeze New Admissions & Bookings' : 'Emergency Freeze on Admissions & Bookings'}</span>
                    </span>
                    <span className="text-[10px] font-mono px-3 py-1 rounded-md bg-slate-950 font-black border border-slate-700">
                      {isAdmissionsFrozen ? 'RESTORE' : 'LOCK'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      cyberAudio.play('confirm');
                      await auditService.record({
                        action: 'SUPER_ADMIN_RECONCILE_LEDGER',
                        module: 'DISTRICT_COMMAND',
                        target: `District Ledger: ${selectedDistrict}`,
                        newValue: 'Audit Verified: 0 Balance Discrepancy',
                        district: selectedDistrict,
                        status: 'SUCCESS'
                      });
                      pushTerminalLog('AUDIT', `Reconciliation completed for ${selectedDistrict}. 0 discrepancies detected.`);
                      showToast(`Cryptographic ledger reconciliation completed for ${selectedDistrict}!`, 'success');
                    }}
                    className="w-full py-4 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm border-2 border-slate-700 hover:border-cyan-400 transition-all flex items-center justify-between cursor-pointer shadow-lg group"
                  >
                    <span className="flex items-center gap-2.5">
                      <RotateCcw className="w-4 h-4 text-cyan-400 group-hover:rotate-180 transition-transform duration-500" />
                      <span>Run Cryptographic Ledger Re-Audit</span>
                    </span>
                    <span className="text-[10px] text-cyan-300 font-black bg-cyan-950 px-3 py-1 rounded-md border border-cyan-500/50">VERIFY</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 6. Universal Holographic Node Inspector Drawer / Dock (Activates on Click of ANY text) */}
      {inspectedNode && (
        <div className="relative z-20 mt-6 p-5 sm:p-6 rounded-3xl bg-slate-950 border-2 border-cyan-400 shadow-2xl shadow-cyan-500/30 transition-all">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b-2 border-cyan-500/40">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border-2 border-cyan-400">
                <Crosshair className="w-5 h-5 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-cyan-300 bg-cyan-950 px-2.5 py-0.5 rounded-md border border-cyan-400">
                    TARGET NODE ACQUIRED // {inspectedNode.category}
                  </span>
                  <span className="text-[11px] font-mono text-emerald-300 font-bold bg-emerald-950 px-2.5 py-0.5 rounded-md border border-emerald-400">
                    {inspectedNode.status}
                  </span>
                </div>
                <h4 className="text-base sm:text-lg font-black text-white mt-1">{inspectedNode.title}</h4>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  cyberAudio.play('click');
                  handleCopyText(JSON.stringify(inspectedNode, null, 2), 'Node telemetry');
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 border-2 border-slate-700 text-white hover:text-cyan-300 hover:border-cyan-400 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-4 h-4 text-cyan-400" />
                <span>Copy Payload</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  cyberAudio.play('click');
                  setInspectedNode(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-600 cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900 border-2 border-slate-800 space-y-1">
              <span className="text-[10px] text-cyan-300 block uppercase font-black tracking-wider">Node Value / Name</span>
              <p className="font-extrabold text-white truncate text-sm">{inspectedNode.value}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border-2 border-slate-800 space-y-1">
              <span className="text-[10px] text-cyan-300 block uppercase font-black tracking-wider">Cryptographic Hash</span>
              <p className="font-mono text-cyan-300 font-black truncate text-xs">{inspectedNode.hash}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border-2 border-slate-800 space-y-1">
              <span className="text-[10px] text-cyan-300 block uppercase font-black tracking-wider">GPS Coordinates</span>
              <p className="font-mono text-emerald-400 font-black truncate text-xs">{inspectedNode.coordinates}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border-2 border-slate-800 space-y-1">
              <span className="text-[10px] text-cyan-300 block uppercase font-black tracking-wider">Timestamp (IST)</span>
              <p className="font-mono text-white font-bold truncate text-xs">{inspectedNode.timestamp} IST</p>
            </div>
          </div>

          {Object.keys(inspectedNode.details).length > 0 && (
            <div className="mt-4 p-4 rounded-xl bg-slate-900 border-2 border-slate-800">
              <span className="text-[11px] font-black text-cyan-300 uppercase tracking-wider block mb-2">Extended Node Telemetry:</span>
              <div className="flex flex-wrap gap-2 text-xs">
                {Object.entries(inspectedNode.details).map(([k, v]) => (
                  <span key={k} className="px-3 py-1.5 rounded-lg bg-slate-950 border-2 border-slate-800 text-white font-mono font-bold">
                    <strong className="text-cyan-400 font-extrabold">{k}:</strong> {String(v)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 7. Quantum Central Audit Terminal Drawer (Collapsible) */}
      {isTerminalOpen && (
        <div className="relative z-20 mt-6 p-5 sm:p-6 rounded-3xl bg-[#060b19] border-2 border-purple-500/80 shadow-2xl font-mono text-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-purple-500/40">
            <div className="flex items-center gap-2.5">
              <Terminal className="w-5 h-5 text-purple-400" />
              <span className="text-purple-300 font-black text-xs uppercase tracking-wider">
                CENTRAL QUANTUM AUDIT STREAM // ROOT LEVEL-0
              </span>
            </div>
            <button
              onClick={() => setIsTerminalOpen(false)}
              className="text-purple-300 hover:text-white font-black cursor-pointer px-3 py-1 rounded-lg bg-purple-950 border border-purple-500/50 transition-colors"
            >
              Close Feed [ESC]
            </button>
          </div>

          <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1 font-mono text-xs">
            {terminalLogs.map(l => (
              <div key={l.id} className="p-3 rounded-xl bg-slate-950 border-2 border-slate-800 flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-300 font-bold">[{l.timestamp}]</span>
                    <span className={`px-2 py-0.5 rounded font-black text-[10px] ${
                      l.tag === 'CLEARANCE' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500' :
                      l.tag === 'OVERRIDE' ? 'bg-rose-950 text-rose-300 border border-rose-500' :
                      l.tag === 'BROADCAST' ? 'bg-blue-950 text-blue-300 border border-blue-500' :
                      l.tag === 'SIGNAL' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500' : 'bg-purple-950 text-purple-300 border border-purple-500'
                    }`}>
                      {l.tag}
                    </span>
                    <span className="text-slate-400 text-xs font-mono">{l.hash}</span>
                  </div>
                  <p className="text-white font-bold text-xs">{l.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. Emergency Broadcast Modal */}
      {isBroadcastOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-xl p-6 sm:p-8 rounded-3xl bg-[#060b19] border-2 border-cyan-500/50 shadow-2xl shadow-cyan-950/50 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b-2 border-slate-800">
              <div className="flex items-center gap-3">
                <Send className="w-6 h-6 text-cyan-400" />
                <h3 className="text-lg font-black text-white">Broadcast Executive Advisory to {selectedDistrict}</h3>
              </div>
              <button
                onClick={() => setIsBroadcastOpen(false)}
                className="text-slate-400 hover:text-white font-bold text-2xl cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* Quick Presets */}
            <div className="space-y-2">
              <label className="text-slate-200 text-xs font-black uppercase tracking-wider block">Advisory Quick Presets:</label>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setBroadcastPreset('EXAM');
                    setBroadcastMessage(`OFFICIAL NOTICE: All ZYZU'S educators and study libraries in ${selectedDistrict} must align mock test rosters with the updated central syllabus.`);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white border-2 border-blue-400 hover:bg-blue-500 cursor-pointer font-black transition-all"
                >
                  Exam Prep Notice
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBroadcastPreset('SEATS');
                    setBroadcastMessage(`URGENT: Desk capacity reservations extended in ${selectedDistrict}. Reserve study desks through ZYZU'S student portal.`);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-600 text-white border-2 border-amber-400 hover:bg-amber-500 cursor-pointer font-black transition-all"
                >
                  Library Desks Advisory
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBroadcastPreset('WEATHER');
                    setBroadcastMessage(`WEATHER ADVISORY: Due to heavy rains in ${selectedDistrict}, offline home tuition sessions may transition to online ZYZU'S classrooms.`);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white border-2 border-emerald-400 hover:bg-emerald-500 cursor-pointer font-black transition-all"
                >
                  Weather / Online Notice
                </button>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="text-white font-black uppercase tracking-wider text-xs block">Official Advisory Text</label>
              <textarea
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder={`Type the official executive notice to be pushed to all students, educators, and library operators in ${selectedDistrict}...`}
                rows={4}
                className="w-full p-4 rounded-xl bg-slate-950 border-2 border-slate-700 text-white placeholder:text-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-400 hover:border-slate-500 transition-colors font-bold shadow-inner"
              />
              <p className="text-xs text-slate-200 font-semibold leading-normal">
                This notice will be immediately broadcasted across the Mobile App, Web Portal, and SMS Gateway for {selectedDistrict}.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-slate-800">
              <button
                type="button"
                onClick={() => setIsBroadcastOpen(false)}
                className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold border-2 border-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendBroadcast}
                disabled={!broadcastMessage.trim()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-black transition-all shadow-lg shadow-cyan-500/30 cursor-pointer disabled:opacity-50 flex items-center gap-2 border border-cyan-300"
              >
                <Send className="w-4 h-4" />
                <span>Transmit Broadcast</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
