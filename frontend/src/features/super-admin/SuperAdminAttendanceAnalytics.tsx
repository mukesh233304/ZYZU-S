import React, { useState, useEffect, useMemo } from 'react';
import { analyticsService } from '../../services/analyticsService';
import { InteractivePieDonutChart, DonutSegment } from '../../components/common/charts/InteractivePieDonutChart';
import { ExportModal } from '../../components/common/ExportModal';
import { Button } from '../../components/common/Button';
import { 
  CalendarCheck, 
  MapPin, 
  Globe, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Download, 
  ArrowRight,
  QrCode,
  UserCheck,
  Building2,
  GraduationCap,
  AlertTriangle,
  LogIn,
  LogOut,
  Volume2,
  VolumeX,
  RefreshCw,
  Search,
  Filter,
  Check,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  X,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Target,
  Copy,
  ShieldCheck,
  Radio,
  Fingerprint,
  Zap,
  Activity,
  Layers,
  Sparkles,
  Calendar,
  RotateCcw
} from 'lucide-react';

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
        osc.frequency.setValueAtTime(850, now);
        osc.frequency.exponentialRampToValueAtTime(1300, now + 0.04);
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
// ATTENDANCE SESSION & BIOMETRIC PUNCH RECORD INTERFACE
// ============================================================================
export interface AttendanceIntegrityRecord {
  id: string;
  punchId: string;
  attendeeName: string;
  role: 'STUDENT' | 'TEACHER' | 'LIBRARY_SCHOLAR';
  userId: string;
  serviceType: 'HOME_TUITION' | 'SELF_STUDY_LIBRARY' | 'FACULTY_BATCH';
  serviceTitle: string;
  facilityName: string;
  stateName: string;
  districtName: string;
  localityName: string;
  areaName: string;
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  status: 'PRESENT' | 'LATE' | 'ABSENT' | 'ANOMALY' | 'APPROVED_LEAVE';
  verificationMethod: 'GEO_QR' | 'GPS_BIOMETRIC' | 'RFID_GATE' | 'SUPERVISOR_OVERRIDE';
  geofenceDistanceMeters: number;
  geofenceStatus: 'VERIFIED_IN_PERIMETER' | 'PERIMETER_WARNING' | 'RADIUS_BREACH';
  deviceIp: string;
  deviceFingerprint: string;
  supervisorName?: string;
  parentNotification: 'DELIVERED' | 'QUEUED' | 'NA';
  anomalyReason?: string;
  integrityScore: number;
  hashId: string;
}

// Realistic Pan-India Dataset of 22 Live Biometric Punch Sessions
const INITIAL_PUNCH_RECORDS: AttendanceIntegrityRecord[] = [
  {
    id: 'punch-001',
    punchId: 'PUNCH-984210',
    attendeeName: 'Aryan Maurya',
    role: 'STUDENT',
    userId: 'usr-stu-001',
    serviceType: 'HOME_TUITION',
    serviceTitle: 'Class 11 Physics (Mechanics)',
    facilityName: 'Saidpur Student Residence',
    stateName: 'Uttar Pradesh',
    districtName: 'Ghazipur',
    localityName: 'Saidpur',
    areaName: 'Ward 4 Market',
    date: '2026-09-16',
    checkInTime: '09:02:14 AM',
    checkOutTime: '10:32:00 AM',
    status: 'PRESENT',
    verificationMethod: 'GEO_QR',
    geofenceDistanceMeters: 4.2,
    geofenceStatus: 'VERIFIED_IN_PERIMETER',
    deviceIp: '103.21.58.42',
    deviceFingerprint: 'SM-G998B-ANDROID14',
    supervisorName: 'Dr. Rajesh Sharma',
    parentNotification: 'DELIVERED',
    integrityScore: 99.4,
    hashId: 'SHA256:7f89ab12...c0'
  },
  {
    id: 'punch-002',
    punchId: 'PUNCH-984211',
    attendeeName: 'Dr. Rajesh Sharma',
    role: 'TEACHER',
    userId: 'usr-tch-001',
    serviceType: 'HOME_TUITION',
    serviceTitle: 'Faculty Punch-in: Physics',
    facilityName: 'Saidpur Student Residence',
    stateName: 'Uttar Pradesh',
    districtName: 'Ghazipur',
    localityName: 'Saidpur',
    areaName: 'Ward 4 Market',
    date: '2026-09-16',
    checkInTime: '08:58:40 AM',
    checkOutTime: '10:35:10 AM',
    status: 'PRESENT',
    verificationMethod: 'GPS_BIOMETRIC',
    geofenceDistanceMeters: 2.1,
    geofenceStatus: 'VERIFIED_IN_PERIMETER',
    deviceIp: '103.21.58.44',
    deviceFingerprint: 'IPHONE15PRO-IOS18',
    parentNotification: 'NA',
    integrityScore: 100.0,
    hashId: 'SHA256:4a31bc99...d1'
  },
  {
    id: 'punch-003',
    punchId: 'PUNCH-984212',
    attendeeName: 'Priya Sharma',
    role: 'LIBRARY_SCHOLAR',
    userId: 'usr-stu-002',
    serviceType: 'SELF_STUDY_LIBRARY',
    serviceTitle: 'Desk A-04 Reserved Study Pass',
    facilityName: 'FocusPoint Digital Library',
    stateName: 'Uttar Pradesh',
    districtName: 'Ghazipur',
    localityName: 'Saidpur',
    areaName: 'Station Road',
    date: '2026-09-16',
    checkInTime: '07:45:10 AM',
    checkOutTime: '02:15:30 PM',
    status: 'PRESENT',
    verificationMethod: 'RFID_GATE',
    geofenceDistanceMeters: 1.2,
    geofenceStatus: 'VERIFIED_IN_PERIMETER',
    deviceIp: '172.16.0.12',
    deviceFingerprint: 'RFID-GATE-TURNSTILE-01',
    supervisorName: 'Manoj Kumar (Library Owner)',
    parentNotification: 'DELIVERED',
    integrityScore: 99.8,
    hashId: 'SHA256:1b29cc34...e2'
  },
  {
    id: 'punch-004',
    punchId: 'PUNCH-984213',
    attendeeName: 'Rohan Gupta',
    role: 'STUDENT',
    userId: 'usr-stu-003',
    serviceType: 'HOME_TUITION',
    serviceTitle: 'Class 12 Senior Mathematics',
    facilityName: 'Lanka Student Residence',
    stateName: 'Uttar Pradesh',
    districtName: 'Varanasi',
    localityName: 'Lanka',
    areaName: 'BHU Gate Colony',
    date: '2026-09-16',
    checkInTime: '09:28:12 AM',
    checkOutTime: '11:00:00 AM',
    status: 'LATE',
    verificationMethod: 'GEO_QR',
    geofenceDistanceMeters: 6.8,
    geofenceStatus: 'VERIFIED_IN_PERIMETER',
    deviceIp: '49.36.12.98',
    deviceFingerprint: 'ONEPLUS-11R-ANDROID14',
    supervisorName: 'Prof. Alok Nath',
    parentNotification: 'DELIVERED',
    anomalyReason: 'Arrived 28 mins after scheduled start (Grace 15m exceeded)',
    integrityScore: 88.5,
    hashId: 'SHA256:9c12aa44...f3'
  },
  {
    id: 'punch-005',
    punchId: 'PUNCH-984214',
    attendeeName: 'Sneha Verma',
    role: 'LIBRARY_SCHOLAR',
    userId: 'usr-stu-004',
    serviceType: 'SELF_STUDY_LIBRARY',
    serviceTitle: 'AC Study Hall Reserved Seat B-12',
    facilityName: 'Saraswati Study Point',
    stateName: 'Uttar Pradesh',
    districtName: 'Lucknow',
    localityName: 'Aliganj',
    areaName: 'Sector C',
    date: '2026-09-16',
    checkInTime: '08:12:05 AM',
    checkOutTime: undefined,
    status: 'PRESENT',
    verificationMethod: 'GEO_QR',
    geofenceDistanceMeters: 3.5,
    geofenceStatus: 'VERIFIED_IN_PERIMETER',
    deviceIp: '157.34.89.21',
    deviceFingerprint: 'VIVO-V29-ANDROID14',
    supervisorName: 'Anil Rastogi',
    parentNotification: 'DELIVERED',
    integrityScore: 99.1,
    hashId: 'SHA256:3d44ee55...a4'
  },
  {
    id: 'punch-006',
    punchId: 'PUNCH-984215',
    attendeeName: 'Amitabh Singh',
    role: 'STUDENT',
    userId: 'usr-stu-005',
    serviceType: 'HOME_TUITION',
    serviceTitle: 'Class 10 High School Science',
    facilityName: 'Mohammadabad Learning Pod',
    stateName: 'Uttar Pradesh',
    districtName: 'Ghazipur',
    localityName: 'Mohammadabad',
    areaName: 'Tehsil Road',
    date: '2026-09-16',
    checkInTime: '10:05:40 AM',
    checkOutTime: undefined,
    status: 'ANOMALY',
    verificationMethod: 'GPS_BIOMETRIC',
    geofenceDistanceMeters: 142.5,
    geofenceStatus: 'RADIUS_BREACH',
    deviceIp: '223.184.45.10',
    deviceFingerprint: 'REALME-GT-ANDROID13',
    supervisorName: 'Sunita Rai',
    parentNotification: 'QUEUED',
    anomalyReason: 'Geofence Perimeter Breach: 142.5m away from registered residence GPS',
    integrityScore: 42.0,
    hashId: 'SHA256:6e77ff88...b5'
  },
  {
    id: 'punch-007',
    punchId: 'PUNCH-984216',
    attendeeName: 'Kavita Rai',
    role: 'LIBRARY_SCHOLAR',
    userId: 'usr-stu-006',
    serviceType: 'SELF_STUDY_LIBRARY',
    serviceTitle: 'Quiet Zone Desk C-01',
    facilityName: 'Chanakya Reading Room',
    stateName: 'Bihar',
    districtName: 'Patna',
    localityName: 'Kankarbagh',
    areaName: 'Main Road',
    date: '2026-09-16',
    checkInTime: '06:55:00 AM',
    checkOutTime: '01:45:00 PM',
    status: 'PRESENT',
    verificationMethod: 'GEO_QR',
    geofenceDistanceMeters: 2.8,
    geofenceStatus: 'VERIFIED_IN_PERIMETER',
    deviceIp: '117.200.45.66',
    deviceFingerprint: 'SAMSUNG-A54-ANDROID14',
    supervisorName: 'Rameshwar Jha',
    parentNotification: 'DELIVERED',
    integrityScore: 99.6,
    hashId: 'SHA256:8a99bb00...c6'
  },
  {
    id: 'punch-008',
    punchId: 'PUNCH-984217',
    attendeeName: 'Vivek Yadav',
    role: 'STUDENT',
    userId: 'usr-stu-007',
    serviceType: 'HOME_TUITION',
    serviceTitle: 'Class 9 STEM Foundation',
    facilityName: 'Mau Study Pod',
    stateName: 'Uttar Pradesh',
    districtName: 'Mau',
    localityName: 'City Center',
    areaName: 'Civil Lines',
    date: '2026-09-15',
    checkInTime: '04:30:15 PM',
    checkOutTime: '06:00:20 PM',
    status: 'PRESENT',
    verificationMethod: 'SUPERVISOR_OVERRIDE',
    geofenceDistanceMeters: 18.0,
    geofenceStatus: 'PERIMETER_WARNING',
    deviceIp: '106.195.22.18',
    deviceFingerprint: 'WEB-PORTAL-SUPERVISOR',
    supervisorName: 'District Admin Mau',
    parentNotification: 'DELIVERED',
    anomalyReason: 'Manual supervisor punch: Student phone battery exhausted',
    integrityScore: 85.0,
    hashId: 'SHA256:5b66cc77...d7'
  },
  {
    id: 'punch-009',
    punchId: 'PUNCH-984218',
    attendeeName: 'Ananya Mishra',
    role: 'STUDENT',
    userId: 'usr-stu-008',
    serviceType: 'HOME_TUITION',
    serviceTitle: 'NEET Organic Chemistry Intensive',
    facilityName: 'Prayagraj Residence',
    stateName: 'Uttar Pradesh',
    districtName: 'Prayagraj',
    localityName: 'Civil Lines',
    areaName: 'Subhash Chauraha',
    date: '2026-09-15',
    checkInTime: '11:15:30 AM',
    checkOutTime: '01:15:00 PM',
    status: 'PRESENT',
    verificationMethod: 'GEO_QR',
    geofenceDistanceMeters: 3.1,
    geofenceStatus: 'VERIFIED_IN_PERIMETER',
    deviceIp: '103.45.12.90',
    deviceFingerprint: 'IPHONE14-IOS17',
    supervisorName: 'Dr. V. K. Agnihotri',
    parentNotification: 'DELIVERED',
    integrityScore: 99.5,
    hashId: 'SHA256:2c33dd44...e8'
  },
  {
    id: 'punch-010',
    punchId: 'PUNCH-984219',
    attendeeName: 'Mohit Srivastava',
    role: 'LIBRARY_SCHOLAR',
    userId: 'usr-stu-009',
    serviceType: 'SELF_STUDY_LIBRARY',
    serviceTitle: '24/7 Silent Study Pass E-11',
    facilityName: 'Vidyapeeth Reading Hub',
    stateName: 'Uttar Pradesh',
    districtName: 'Gorakhpur',
    localityName: 'Golghar',
    areaName: 'Cinema Road',
    date: '2026-09-15',
    checkInTime: '08:00:20 AM',
    checkOutTime: '04:30:10 PM',
    status: 'PRESENT',
    verificationMethod: 'RFID_GATE',
    geofenceDistanceMeters: 1.0,
    geofenceStatus: 'VERIFIED_IN_PERIMETER',
    deviceIp: '172.16.1.4',
    deviceFingerprint: 'RFID-GATE-TURNSTILE-02',
    supervisorName: 'Prakash Pandey',
    parentNotification: 'DELIVERED',
    integrityScore: 100.0,
    hashId: 'SHA256:7e88ff99...f9'
  },
  {
    id: 'punch-011',
    punchId: 'PUNCH-984220',
    attendeeName: 'Aditya Chauhan',
    role: 'STUDENT',
    userId: 'usr-stu-010',
    serviceType: 'HOME_TUITION',
    serviceTitle: 'JEE Advanced Physics Problem Solving',
    facilityName: 'Noida Tech Enclave',
    stateName: 'Uttar Pradesh',
    districtName: 'Noida',
    localityName: 'Sector 62',
    areaName: 'Block B IT Zone',
    date: '2026-09-15',
    checkInTime: '03:45:00 PM',
    checkOutTime: '05:45:00 PM',
    status: 'PRESENT',
    verificationMethod: 'GPS_BIOMETRIC',
    geofenceDistanceMeters: 5.4,
    geofenceStatus: 'VERIFIED_IN_PERIMETER',
    deviceIp: '182.70.34.12',
    deviceFingerprint: 'PIXEL-8-PRO-ANDROID14',
    supervisorName: 'Er. Sandeep Mittal',
    parentNotification: 'DELIVERED',
    integrityScore: 99.2,
    hashId: 'SHA256:9f00aa11...a0'
  },
  {
    id: 'punch-012',
    punchId: 'PUNCH-984221',
    attendeeName: 'Pooja Jha',
    role: 'LIBRARY_SCHOLAR',
    userId: 'usr-stu-011',
    serviceType: 'SELF_STUDY_LIBRARY',
    serviceTitle: 'Ergonomic Desk Pass N-02',
    facilityName: 'Nalanda Study Lounge',
    stateName: 'Bihar',
    districtName: 'Patna',
    localityName: 'Boring Road',
    areaName: 'Chauraha Complex',
    date: '2026-09-15',
    checkInTime: '07:30:15 AM',
    checkOutTime: '03:00:10 PM',
    status: 'PRESENT',
    verificationMethod: 'GEO_QR',
    geofenceDistanceMeters: 2.2,
    geofenceStatus: 'VERIFIED_IN_PERIMETER',
    deviceIp: '117.211.56.78',
    deviceFingerprint: 'XIAOMI-13PRO-ANDROID14',
    supervisorName: 'Bipin Bihari',
    parentNotification: 'DELIVERED',
    integrityScore: 99.7,
    hashId: 'SHA256:4d55ee66...b1'
  },
  {
    id: 'punch-013',
    punchId: 'PUNCH-984222',
    attendeeName: 'Suresh Tiwari',
    role: 'TEACHER',
    userId: 'usr-tch-002',
    serviceType: 'HOME_TUITION',
    serviceTitle: 'ICSE Board Booster Mentorship',
    facilityName: 'Sigra Learning Center',
    stateName: 'Uttar Pradesh',
    districtName: 'Varanasi',
    localityName: 'Sigra',
    areaName: 'Stadium Road',
    date: '2026-09-14',
    checkInTime: '10:15:00 AM',
    checkOutTime: '12:15:00 PM',
    status: 'PRESENT',
    verificationMethod: 'GEO_QR',
    geofenceDistanceMeters: 4.0,
    geofenceStatus: 'VERIFIED_IN_PERIMETER',
    deviceIp: '14.139.22.10',
    deviceFingerprint: 'MOTO-EDGE-ANDROID14',
    parentNotification: 'NA',
    integrityScore: 99.4,
    hashId: 'SHA256:1a22bb33...c2'
  },
  {
    id: 'punch-014',
    punchId: 'PUNCH-984223',
    attendeeName: 'Harshita Pandey',
    role: 'LIBRARY_SCHOLAR',
    userId: 'usr-stu-012',
    serviceType: 'SELF_STUDY_LIBRARY',
    serviceTitle: 'Dual Screen Academic Desk A-19',
    facilityName: 'Apex Scholar Desk',
    stateName: 'Uttar Pradesh',
    districtName: 'Lucknow',
    localityName: 'Gomti Nagar',
    areaName: 'Vipul Khand',
    date: '2026-09-14',
    checkInTime: '08:45:10 AM',
    checkOutTime: '01:00:00 PM',
    status: 'PRESENT',
    verificationMethod: 'RFID_GATE',
    geofenceDistanceMeters: 1.5,
    geofenceStatus: 'VERIFIED_IN_PERIMETER',
    deviceIp: '172.16.4.19',
    deviceFingerprint: 'RFID-GATE-TURNSTILE-03',
    supervisorName: 'Deepak Shukla',
    parentNotification: 'DELIVERED',
    integrityScore: 99.9,
    hashId: 'SHA256:3c44dd55...d3'
  },
  {
    id: 'punch-015',
    punchId: 'PUNCH-984224',
    attendeeName: 'Ravi Rathore',
    role: 'STUDENT',
    userId: 'usr-stu-013',
    serviceType: 'HOME_TUITION',
    serviceTitle: 'CBSE Physics Excellence Program',
    facilityName: 'Malviya Nagar Pod',
    stateName: 'Rajasthan',
    districtName: 'Jaipur',
    localityName: 'Malviya Nagar',
    areaName: 'Calgiri Marg',
    date: '2026-09-14',
    checkInTime: '02:00:45 PM',
    checkOutTime: '04:00:10 PM',
    status: 'PRESENT',
    verificationMethod: 'GPS_BIOMETRIC',
    geofenceDistanceMeters: 3.8,
    geofenceStatus: 'VERIFIED_IN_PERIMETER',
    deviceIp: '103.88.22.90',
    deviceFingerprint: 'ONEPLUS-NORD-ANDROID13',
    supervisorName: 'K. S. Shekhawat',
    parentNotification: 'DELIVERED',
    integrityScore: 99.3,
    hashId: 'SHA256:6e77ff88...e4'
  },
  {
    id: 'punch-016',
    punchId: 'PUNCH-984225',
    attendeeName: 'Tarun Saxena',
    role: 'LIBRARY_SCHOLAR',
    userId: 'usr-stu-014',
    serviceType: 'SELF_STUDY_LIBRARY',
    serviceTitle: 'High Speed Wi-Fi Desk S-08',
    facilityName: 'Central Scholar Hub',
    stateName: 'Madhya Pradesh',
    districtName: 'Bhopal',
    localityName: 'MP Nagar',
    areaName: 'Zone II Commercial',
    date: '2026-09-14',
    checkInTime: '09:10:00 AM',
    checkOutTime: '05:00:00 PM',
    status: 'PRESENT',
    verificationMethod: 'GEO_QR',
    geofenceDistanceMeters: 2.5,
    geofenceStatus: 'VERIFIED_IN_PERIMETER',
    deviceIp: '115.112.44.18',
    deviceFingerprint: 'IQOO-Z7-ANDROID14',
    supervisorName: 'Mukesh Sharma',
    parentNotification: 'DELIVERED',
    integrityScore: 99.6,
    hashId: 'SHA256:8b99aa00...f5'
  },
  {
    id: 'punch-017',
    punchId: 'PUNCH-984226',
    attendeeName: 'Sunil Bind',
    role: 'STUDENT',
    userId: 'usr-stu-015',
    serviceType: 'HOME_TUITION',
    serviceTitle: 'Rural STEM Empowerment Track',
    facilityName: 'Zamania Village Center',
    stateName: 'Uttar Pradesh',
    districtName: 'Ghazipur',
    localityName: 'Zamania',
    areaName: 'Station Bazar',
    date: '2026-09-13',
    checkInTime: '08:30:10 AM',
    checkOutTime: '10:30:00 AM',
    status: 'PRESENT',
    verificationMethod: 'GEO_QR',
    geofenceDistanceMeters: 4.8,
    geofenceStatus: 'VERIFIED_IN_PERIMETER',
    deviceIp: '103.21.58.99',
    deviceFingerprint: 'POCO-X5-ANDROID14',
    supervisorName: 'Ramprasad Kushwaha',
    parentNotification: 'DELIVERED',
    integrityScore: 99.1,
    hashId: 'SHA256:2d33ee44...a6'
  },
  {
    id: 'punch-018',
    punchId: 'PUNCH-984227',
    attendeeName: 'Kunal Kashyap',
    role: 'STUDENT',
    userId: 'usr-stu-016',
    serviceType: 'HOME_TUITION',
    serviceTitle: 'Class 8 Science Foundation',
    facilityName: 'Ghosi Residential Desk',
    stateName: 'Uttar Pradesh',
    districtName: 'Mau',
    localityName: 'Ghosi',
    areaName: 'Madhuban Road',
    date: '2026-09-13',
    checkInTime: '03:15:20 PM',
    checkOutTime: '05:15:20 PM',
    status: 'PRESENT',
    verificationMethod: 'GPS_BIOMETRIC',
    geofenceDistanceMeters: 7.2,
    geofenceStatus: 'VERIFIED_IN_PERIMETER',
    deviceIp: '106.195.33.45',
    deviceFingerprint: 'REDMI-12-ANDROID13',
    supervisorName: 'Neeraj Dubey',
    parentNotification: 'DELIVERED',
    integrityScore: 98.7,
    hashId: 'SHA256:5a66bb77...b7'
  },
  {
    id: 'punch-019',
    punchId: 'PUNCH-984228',
    attendeeName: 'Meera Sen',
    role: 'STUDENT',
    userId: 'usr-stu-017',
    serviceType: 'HOME_TUITION',
    serviceTitle: 'Commerce Super Achievers 12th',
    facilityName: 'Connaught Place Academy',
    stateName: 'Delhi',
    districtName: 'New Delhi',
    localityName: 'Connaught Place',
    areaName: 'Barakhamba Road',
    date: '2026-09-13',
    checkInTime: '10:00:00 AM',
    checkOutTime: '12:00:00 PM',
    status: 'PRESENT',
    verificationMethod: 'GEO_QR',
    geofenceDistanceMeters: 3.1,
    geofenceStatus: 'VERIFIED_IN_PERIMETER',
    deviceIp: '122.160.10.88',
    deviceFingerprint: 'MACBOOK-AIR-M2-SAFARI',
    supervisorName: 'CA Rajeshwari Iyer',
    parentNotification: 'DELIVERED',
    integrityScore: 99.8,
    hashId: 'SHA256:7c88dd99...c8'
  },
  {
    id: 'punch-020',
    punchId: 'PUNCH-984229',
    attendeeName: 'Deepak Dubey',
    role: 'STUDENT',
    userId: 'usr-stu-018',
    serviceType: 'SELF_STUDY_LIBRARY',
    serviceTitle: 'Assi Scholar Silent Desk',
    facilityName: 'Ghat Study Point Assi',
    stateName: 'Uttar Pradesh',
    districtName: 'Varanasi',
    localityName: 'Assi',
    areaName: 'Assi Ghat Road',
    date: '2026-09-12',
    checkInTime: '08:00:00 AM',
    checkOutTime: undefined,
    status: 'ANOMALY',
    verificationMethod: 'GEO_QR',
    geofenceDistanceMeters: 85.0,
    geofenceStatus: 'RADIUS_BREACH',
    deviceIp: '14.139.22.99',
    deviceFingerprint: 'OPPO-RENO-ANDROID13',
    supervisorName: 'Girish Tripathi',
    parentNotification: 'QUEUED',
    anomalyReason: 'Unclosed Session: Open for >7 hours without punch-out record',
    integrityScore: 35.0,
    hashId: 'SHA256:9e00ff11...d9'
  },
  {
    id: 'punch-021',
    punchId: 'PUNCH-984230',
    attendeeName: 'Neha Agarwal',
    role: 'STUDENT',
    userId: 'usr-stu-019',
    serviceType: 'HOME_TUITION',
    serviceTitle: 'UPSSSC Preparation Batch',
    facilityName: 'Saidpur Exam Center',
    stateName: 'Uttar Pradesh',
    districtName: 'Ghazipur',
    localityName: 'Saidpur',
    areaName: 'Railway Crossing',
    date: '2026-09-12',
    checkInTime: '09:15:30 AM',
    checkOutTime: '11:15:30 AM',
    status: 'APPROVED_LEAVE',
    verificationMethod: 'SUPERVISOR_OVERRIDE',
    geofenceDistanceMeters: 0,
    geofenceStatus: 'VERIFIED_IN_PERIMETER',
    deviceIp: '103.21.58.12',
    deviceFingerprint: 'PARENT-PORTAL-WEB',
    supervisorName: 'Dr. Rajesh Sharma',
    parentNotification: 'DELIVERED',
    anomalyReason: 'Sanctioned Medical Leave: Document attached and verified',
    integrityScore: 100.0,
    hashId: 'SHA256:1b22cc33...ea'
  },
  {
    id: 'punch-022',
    punchId: 'PUNCH-984231',
    attendeeName: 'Prakash Pandey',
    role: 'TEACHER',
    userId: 'usr-tch-003',
    serviceType: 'FACULTY_BATCH',
    serviceTitle: 'Faculty Attendance: Golghar Hub',
    facilityName: 'Vidyapeeth Reading Hub',
    stateName: 'Uttar Pradesh',
    districtName: 'Gorakhpur',
    localityName: 'Golghar',
    areaName: 'Cinema Road',
    date: '2026-09-12',
    checkInTime: '08:00:10 AM',
    checkOutTime: '05:00:10 PM',
    status: 'PRESENT',
    verificationMethod: 'GPS_BIOMETRIC',
    geofenceDistanceMeters: 1.8,
    geofenceStatus: 'VERIFIED_IN_PERIMETER',
    deviceIp: '172.16.1.1',
    deviceFingerprint: 'FACULTY-TAB-G10',
    parentNotification: 'NA',
    integrityScore: 100.0,
    hashId: 'SHA256:4d55ff66...fb'
  }
];

export const SuperAdminAttendanceAnalytics: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Temporal Horizon controls
  const [dateRange, setDateRange] = useState('this_month');
  const [isCustomRange, setIsCustomRange] = useState(false);
  const [startDate, setStartDate] = useState('2026-09-01');
  const [endDate, setEndDate] = useState('2026-09-17');
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Location filter state
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [selectedLocality, setSelectedLocality] = useState<string>('ALL');

  // Ledger filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');
  const [selectedServiceFilter, setSelectedServiceFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [selectedMethodFilter, setSelectedMethodFilter] = useState<string>('ALL');

  // Sorting ("shorting") engine state
  type SortKey = 'location' | 'date' | 'attendee' | 'role' | 'status' | 'distance';
  type SortDirection = 'asc' | 'desc';
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortOrder, setSortOrder] = useState<SortDirection>('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Modal inspection state
  const [selectedAuditRecord, setSelectedAuditRecord] = useState<AttendanceIntegrityRecord | null>(null);
  const [copiedPunchId, setCopiedPunchId] = useState(false);
  const [passDownloaded, setPassDownloaded] = useState(false);

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      const res = await analyticsService.getAttendanceOverview({
        stateName: selectedState !== 'ALL' ? selectedState : undefined,
        districtName: selectedDistrict !== 'ALL' ? selectedDistrict : undefined,
        datePreset: dateRange as any,
        startDate: isCustomRange ? startDate : undefined,
        endDate: isCustomRange ? endDate : undefined,
      });
      setData(res);
    } catch (err) {
      console.error('Failed to load attendance analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, [selectedState, selectedDistrict, dateRange, isCustomRange, startDate, endDate]);

  // Unique list of states
  const uniqueStates = useMemo(() => {
    const states = Array.from(new Set(INITIAL_PUNCH_RECORDS.map(r => r.stateName).filter(Boolean)));
    return ['ALL', ...states.sort()];
  }, []);

  // Available districts (cascading)
  const availableDistricts = useMemo(() => {
    let source = INITIAL_PUNCH_RECORDS;
    if (selectedState !== 'ALL') {
      source = source.filter(r => r.stateName.toLowerCase() === selectedState.toLowerCase());
    }
    const districts = Array.from(new Set(source.map(r => r.districtName).filter(Boolean)));
    return ['ALL', ...districts.sort()];
  }, [selectedState]);

  // Available localities (cascading)
  const availableLocalities = useMemo(() => {
    let source = INITIAL_PUNCH_RECORDS;
    if (selectedState !== 'ALL') {
      source = source.filter(r => r.stateName.toLowerCase() === selectedState.toLowerCase());
    }
    if (selectedDistrict !== 'ALL') {
      source = source.filter(r => r.districtName.toLowerCase() === selectedDistrict.toLowerCase());
    }
    const localities = Array.from(new Set(source.map(r => r.localityName).filter(Boolean)));
    return ['ALL', ...localities.sort()];
  }, [selectedState, selectedDistrict]);

  // Filtered & Sorted Punch Sessions
  const processedRecords = useMemo(() => {
    let result = [...INITIAL_PUNCH_RECORDS];

    // State filter
    if (selectedState !== 'ALL') {
      result = result.filter(r => r.stateName.toLowerCase() === selectedState.toLowerCase());
    }

    // District filter
    if (selectedDistrict !== 'ALL') {
      result = result.filter(r => r.districtName.toLowerCase() === selectedDistrict.toLowerCase());
    }

    // Locality filter
    if (selectedLocality !== 'ALL') {
      result = result.filter(r => r.localityName.toLowerCase() === selectedLocality.toLowerCase());
    }

    // Role filter
    if (selectedRoleFilter !== 'ALL') {
      result = result.filter(r => r.role === selectedRoleFilter);
    }

    // Service filter
    if (selectedServiceFilter !== 'ALL') {
      result = result.filter(r => r.serviceType === selectedServiceFilter);
    }

    // Status filter
    if (selectedStatusFilter !== 'ALL') {
      result = result.filter(r => r.status === selectedStatusFilter);
    }

    // Method filter
    if (selectedMethodFilter !== 'ALL') {
      result = result.filter(r => r.verificationMethod === selectedMethodFilter);
    }

    // Omni Search query matching attendee, punch ID, district, locality, service
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(r => 
        r.punchId.toLowerCase().includes(q) ||
        r.attendeeName.toLowerCase().includes(q) ||
        r.userId.toLowerCase().includes(q) ||
        r.districtName.toLowerCase().includes(q) ||
        r.localityName.toLowerCase().includes(q) ||
        r.areaName.toLowerCase().includes(q) ||
        r.serviceTitle.toLowerCase().includes(q) ||
        r.facilityName.toLowerCase().includes(q) ||
        (r.supervisorName && r.supervisorName.toLowerCase().includes(q))
      );
    }

    // Multi-Column Sorting
    result.sort((a, b) => {
      let comp = 0;
      switch (sortKey) {
        case 'location': {
          const locA = `${a.districtName} ${a.localityName} ${a.stateName}`.toLowerCase();
          const locB = `${b.districtName} ${b.localityName} ${b.stateName}`.toLowerCase();
          comp = locA.localeCompare(locB);
          break;
        }
        case 'date': {
          const timeA = new Date(`${a.date} ${a.checkInTime}`).getTime();
          const timeB = new Date(`${b.date} ${b.checkInTime}`).getTime();
          comp = timeA - timeB;
          break;
        }
        case 'attendee':
          comp = a.attendeeName.localeCompare(b.attendeeName);
          break;
        case 'role':
          comp = a.role.localeCompare(b.role);
          break;
        case 'status':
          comp = a.status.localeCompare(b.status);
          break;
        case 'distance':
          comp = a.geofenceDistanceMeters - b.geofenceDistanceMeters;
          break;
        default:
          comp = 0;
      }
      return sortOrder === 'asc' ? comp : -comp;
    });

    return result;
  }, [selectedState, selectedDistrict, selectedLocality, selectedRoleFilter, selectedServiceFilter, selectedStatusFilter, selectedMethodFilter, searchQuery, sortKey, sortOrder]);

  // Pagination calculation
  const totalRecords = processedRecords.length;
  const effectivePageSize = pageSize === 9999 ? (totalRecords || 1) : pageSize;
  const totalPages = Math.max(1, Math.ceil(totalRecords / effectivePageSize));
  const paginatedRecords = useMemo(() => {
    if (pageSize === 9999) return processedRecords;
    const startIdx = (currentPage - 1) * pageSize;
    return processedRecords.slice(startIdx, startIdx + pageSize);
  }, [processedRecords, currentPage, pageSize]);

  // Active filters count
  const activeFiltersCount = 
    (selectedState !== 'ALL' ? 1 : 0) +
    (selectedDistrict !== 'ALL' ? 1 : 0) +
    (selectedLocality !== 'ALL' ? 1 : 0) +
    (selectedRoleFilter !== 'ALL' ? 1 : 0) +
    (selectedServiceFilter !== 'ALL' ? 1 : 0) +
    (selectedStatusFilter !== 'ALL' ? 1 : 0) +
    (selectedMethodFilter !== 'ALL' ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  // Sorting handler
  const handleSort = (key: SortKey) => {
    if (audioEnabled) soundSystem.playChirp('click');
    if (sortKey === key) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder(key === 'attendee' || key === 'location' ? 'asc' : 'desc');
    }
    setCurrentPage(1);
  };

  // Reset filters handler
  const handleClearFilters = () => {
    if (audioEnabled) soundSystem.playChirp('confirm');
    setSelectedState('ALL');
    setSelectedDistrict('ALL');
    setSelectedLocality('ALL');
    setSelectedRoleFilter('ALL');
    setSelectedServiceFilter('ALL');
    setSelectedStatusFilter('ALL');
    setSelectedMethodFilter('ALL');
    setSearchQuery('');
    setSortKey('date');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  // Regional quick presets
  const applyPreset = (preset: 'ALL' | 'UP' | 'BIHAR' | 'GHAZIPUR') => {
    if (audioEnabled) soundSystem.playChirp('warp');
    setCurrentPage(1);
    if (preset === 'ALL') {
      setSelectedState('ALL');
      setSelectedDistrict('ALL');
      setSelectedLocality('ALL');
    } else if (preset === 'UP') {
      setSelectedState('Uttar Pradesh');
      setSelectedDistrict('ALL');
      setSelectedLocality('ALL');
    } else if (preset === 'BIHAR') {
      setSelectedState('Bihar');
      setSelectedDistrict('ALL');
      setSelectedLocality('ALL');
    } else if (preset === 'GHAZIPUR') {
      setSelectedState('Uttar Pradesh');
      setSelectedDistrict('Ghazipur');
      setSelectedLocality('ALL');
    }
  };

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] bg-[#060b19] cyber-grid-bg border-2 border-emerald-500/30 rounded-3xl p-10 text-white space-y-4">
        <div className="relative flex items-center justify-center w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin" />
          <Fingerprint className="w-8 h-8 text-emerald-400 animate-pulse" />
        </div>
        <p className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-300">
          SCANNING PAN-INDIA BIOMETRIC ATTENDANCE RADAR & GEOFENCE TELEMETRY...
        </p>
      </div>
    );
  }

  // Compliance distribution donut
  const complianceChartData: DonutSegment[] = [
    { label: 'Present', value: data.presentSessions, color: '#10b981' },
    { label: 'Absent', value: data.absentSessions, color: '#ef4444' },
    { label: 'Late Arrival', value: data.lateSessions, color: '#f59e0b' },
    { label: 'Approved Leave', value: data.leaveSessions, color: '#8b5cf6' },
  ];

  // Biometric punch channel breakdown donut
  const methodChartData: DonutSegment[] = [
    { label: 'Geo-fenced Dynamic QR', value: data.qrAttendanceCount || 1422, color: '#06b6d4' },
    { label: 'Mobile GPS Biometric', value: 890, color: '#10b981' },
    { label: 'Library RFID Gate', value: 380, color: '#f59e0b' },
    { label: 'Supervisor Manual Override', value: data.manualAttendanceCount || 312, color: '#f43f5e' },
  ];

  return (
    <div className="space-y-6 pb-20 bg-[#060b19] cyber-grid-bg border-2 border-emerald-500/30 shadow-2xl rounded-3xl p-4 sm:p-6 lg:p-7 text-white min-h-screen relative overflow-hidden">
      {/* Ambient Neon Nebula Glow */}
      <div
        className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none -mr-40 -mt-40 animate-pulse"
        style={{ animationDuration: '7s' }}
      />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none -ml-40 -mb-40" />

      {/* ==================================================================== */}
      {/* 1. PANORAMIC CYBER-HUD ATTENDANCE COMMAND STATION (3-Tier) */}
      {/* ==================================================================== */}
      <div className="relative z-10 p-4 sm:p-6 rounded-3xl bg-slate-950/95 border-2 border-emerald-500/50 shadow-2xl space-y-4 backdrop-blur-md overflow-hidden text-white">
        {/* TIER 1: MICRO-HUD TELEMETRY BREADCRUMB BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Live Pulse Indicator & OS Badge */}
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.9)]"></span>
              </span>
              <span className="text-[11px] font-mono font-black uppercase tracking-widest text-emerald-300 px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-500/70 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                ATTENDANCE INTEGRITY OS // V4.8 BIOMETRIC RADAR
              </span>
            </div>

            {/* Geofence Integrity Badge */}
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-cyan-300 bg-slate-900 px-3 py-1 rounded-full border border-slate-700 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>GEOFENCE INTEGRITY: 100% ENFORCED</span>
            </div>

            {/* Zero Proxy Badge */}
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-black text-amber-300 bg-amber-950/90 px-3 py-1 rounded-full border border-amber-500/60 shadow-xs">
              <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>ZERO PROXY PROTOCOL: ACTIVE</span>
            </div>
          </div>

          {/* Audio Synthesizer Toggle & Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => {
                const next = !audioEnabled;
                setAudioEnabled(next);
                if (next) soundSystem.playChirp('confirm');
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

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (audioEnabled) soundSystem.playChirp('warp');
                fetchAttendanceData();
              }}
              className="bg-emerald-950 hover:bg-emerald-900 text-emerald-200 border border-emerald-500/70 text-xs font-black shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-300 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Radar</span>
            </Button>

            <button
              onClick={() => {
                if (audioEnabled) soundSystem.playChirp('click');
                setIsExportOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-mono font-black shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Briefing</span>
            </button>
          </div>
        </div>

        {/* TIER 2: DEDICATED HORIZONTAL COMMAND DISPLAY COCKPIT */}
        <div className="relative overflow-hidden p-5 sm:p-6 lg:p-7 rounded-3xl bg-gradient-to-r from-slate-950/98 via-[#06151f]/95 to-slate-950/98 border-2 border-emerald-500/60 hover:border-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.25),inset_0_0_20px_rgba(6,182,212,0.06)] backdrop-blur-xl hud-corner-brackets transition-all group">
          {/* Ambient Scanning Laser Shimmer */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-cyan-500/5 to-transparent pointer-events-none" />
          <div className="absolute top-0 right-0 w-80 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-6 lg:gap-8">
            {/* Left Wing: Holographic Biometric Radar Orb & Master Heading */}
            <div className="flex items-start sm:items-center gap-4 sm:gap-5 shrink-0 max-w-3xl">
              {/* Holographic 3D Biometric Scanner Radar Orb */}
              <div className="relative shrink-0 flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-emerald-500/35 via-teal-600/30 to-cyan-500/25 border-2 border-emerald-400/90 shadow-[0_0_30px_rgba(16,185,129,0.6)] ring-2 ring-cyan-400/30 group-hover:scale-105 transition-all duration-300">
                <Fingerprint className="w-9 h-9 sm:w-11 sm:h-11 text-emerald-300 animate-pulse drop-shadow-[0_0_14px_rgba(16,185,129,0.9)]" />
                <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-cyan-400 ring-4 ring-slate-950 animate-ping" />
                <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-cyan-400 ring-2 ring-slate-950 shadow-[0_0_12px_rgba(6,182,212,1)]" />
                <span className="absolute -bottom-1 -left-1 px-1.5 py-0.5 rounded text-[8px] font-mono font-black bg-slate-950 border border-emerald-400/80 text-emerald-300 shadow-xs">
                  RADAR
                </span>
              </div>

              {/* Title & Headquarters Clear Hierarchy */}
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-lg sm:text-2xl md:text-3xl font-black tracking-tight uppercase text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-100 via-teal-200 to-cyan-300 drop-shadow-[0_2px_14px_rgba(16,185,129,0.5)]">
                    Pan-India Attendance Integrity Command
                  </h1>
                  <span className="px-3 py-1 rounded-lg bg-emerald-950/95 border-2 border-emerald-400 text-xs font-mono font-black text-emerald-200 uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.45)] inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    BIOMETRIC HIGHWAY
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-cyan-950/90 border border-cyan-400/80 text-[11px] font-mono font-black text-cyan-300 uppercase tracking-wider shadow-xs">
                    GEOFENCE V3
                  </span>
                </div>
                <span className="text-[11px] sm:text-xs font-mono font-black text-amber-300 tracking-[0.16em] uppercase block drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]">
                  REAL-TIME SESSION VERIFICATION, QR PUNCH TELEMETRY, GEOFENCE RADIUS CALIBRATION & ANOMALY TRACKING
                </span>
              </div>
            </div>

            {/* Glowing Neon Laser Energy Divider */}
            <div className="hidden 2xl:flex flex-col items-center justify-center mx-3 self-stretch shrink-0">
              <div className="w-[2px] min-h-[90px] h-full bg-gradient-to-b from-emerald-400/10 via-emerald-400 via-cyan-400 to-amber-400/10 shadow-[0_0_16px_rgba(16,185,129,1)]" />
              <div className="w-2.5 h-2.5 rotate-45 bg-emerald-300 border border-white shadow-[0_0_12px_rgba(16,185,129,1)] my-[-4px]" />
              <div className="w-[2px] min-h-[90px] h-full bg-gradient-to-b from-amber-400/10 via-cyan-400 via-emerald-400 to-emerald-400/10 shadow-[0_0_16px_rgba(16,185,129,1)]" />
            </div>
            <div className="2xl:hidden w-full h-[2px] bg-gradient-to-r from-emerald-500/20 via-emerald-400 via-cyan-400 to-amber-500/20 shadow-[0_0_10px_rgba(16,185,129,0.6)]" />

            {/* Right Wing: Description & Tactical Chips */}
            <div className="flex-1 min-w-0 max-w-3xl space-y-3">
              <p className="text-xs sm:text-sm font-semibold text-slate-100 leading-relaxed drop-shadow-xs">
                Autonomous Pan-India biometric compliance telemetry tracking student sessions, teacher attendance, library check-ins, geofence radius compliance, and proxy prevention.
              </p>
              
              {/* 3 Holographic Interactive Tactical Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-0.5">
                {/* 1. Biometric Integrity Rate */}
                <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-emerald-950/90 to-slate-950 border-2 border-emerald-500/80 hover:border-emerald-300 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:scale-102 flex items-center gap-2.5 group">
                  <div className="p-1.5 rounded-lg bg-emerald-950 border border-emerald-400/60 text-emerald-300 shrink-0 shadow-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-mono font-black text-[11px] uppercase tracking-wider text-emerald-300 block truncate">
                      98.4% INTEGRITY SCORE
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400/90 font-medium block truncate">
                      Cryptographic Punch Pass
                    </span>
                  </div>
                </div>

                {/* 2. Dynamic QR Automated Punches */}
                <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-cyan-950/90 to-slate-950 border-2 border-cyan-500/80 hover:border-cyan-300 text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all hover:scale-102 flex items-center gap-2.5 group">
                  <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-400/60 text-cyan-300 shrink-0 shadow-xs">
                    <QrCode className="w-4 h-4 text-cyan-400 animate-pulse" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-mono font-black text-[11px] uppercase tracking-wider text-cyan-300 block truncate">
                      82.0% AUTOMATED QR
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400/90 font-medium block truncate">
                      Geofence Radius Verified
                    </span>
                  </div>
                </div>

                {/* 3. Proxy Prevention */}
                <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-amber-950/90 to-slate-950 border-2 border-amber-500/80 hover:border-amber-300 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all hover:scale-102 flex items-center gap-2.5 group">
                  <div className="p-1.5 rounded-lg bg-amber-950 border border-amber-400/60 text-amber-300 shrink-0 shadow-xs">
                    <ShieldCheck className="w-4 h-4 text-amber-400 animate-pulse" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-mono font-black text-[11px] uppercase tracking-wider text-amber-300 block truncate">
                      ZERO PROXY DEFENSE
                    </span>
                    <span className="text-[10px] font-mono text-amber-400/90 font-medium block truncate">
                      Device MAC & GPS Bound
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TIER 3: TEMPORAL HORIZON & REGIONAL PRESET CONTROL BAR */}
        <div className="pt-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-t border-slate-800">
          {/* Quick Date Horizon Selectors */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              Horizon:
            </span>
            {[
              { key: 'today', label: 'Today' },
              { key: 'this_week', label: 'This Week' },
              { key: 'this_month', label: 'This Month (Sep 2026)' },
              { key: 'prev_month', label: 'Prev Month' },
              { key: 'custom', label: 'Custom Horizon' },
            ].map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => {
                  if (audioEnabled) soundSystem.playChirp('click');
                  if (p.key === 'custom') {
                    setIsCustomRange(true);
                  } else {
                    setIsCustomRange(false);
                    setDateRange(p.key);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  (isCustomRange && p.key === 'custom') || (!isCustomRange && dateRange === p.key)
                    ? 'bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)] border border-emerald-400'
                    : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom Date Horizon Inputs */}
          {isCustomRange && (
            <div className="flex items-center gap-2 bg-slate-900/90 p-2 rounded-xl border border-slate-700 animate-fadeIn">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-white focus:outline-none focus:border-emerald-400"
              />
              <span className="text-slate-400 font-mono text-xs">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-white focus:outline-none focus:border-emerald-400"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (audioEnabled) soundSystem.playChirp('confirm');
                  fetchAttendanceData();
                }}
                className="text-xs font-mono bg-emerald-950 text-emerald-300 border-emerald-500/60"
              >
                Apply
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. 12 CORNER-BRACKETED CYBER-HUD KPI METRIC DECKS */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 text-xs">
        {/* 1. Overall Compliance */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border-2 border-emerald-500/60 hover:border-emerald-300 transition-all cyber-hud-card hud-corner-brackets shadow-lg">
          <span className="text-[10px] uppercase font-black text-emerald-400 block tracking-wider">Overall Compliance</span>
          <p className="text-2xl font-black text-emerald-300 mt-1 font-mono">{data.presentPercentage}%</p>
          <span className="text-[11px] text-emerald-400 font-bold">+1.8% vs last month</span>
        </div>

        {/* 2. Student Attendance */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border-2 border-slate-800 hover:border-blue-400 transition-all cyber-hud-card hud-corner-brackets shadow-lg">
          <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wider flex items-center gap-1">
            <GraduationCap className="w-3.5 h-3.5 text-blue-400" /> Student Attendance
          </span>
          <p className="text-2xl font-black text-blue-400 mt-1 font-mono">{data.studentAttendance?.percentage || 92.4}%</p>
          <span className="text-[11px] text-slate-300">{(data.studentAttendance?.count || 1177).toLocaleString()} attendees</span>
        </div>

        {/* 3. Teacher Attendance */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border-2 border-slate-800 hover:border-teal-400 transition-all cyber-hud-card hud-corner-brackets shadow-lg">
          <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wider flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-teal-400" /> Faculty Attendance
          </span>
          <p className="text-2xl font-black text-teal-400 mt-1 font-mono">{data.teacherAttendance?.percentage || 96.8}%</p>
          <span className="text-[11px] text-slate-300">Faculty verified</span>
        </div>

        {/* 4. Library Check-ins */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border-2 border-slate-800 hover:border-indigo-400 transition-all cyber-hud-card hud-corner-brackets shadow-lg">
          <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wider flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-indigo-400" /> Library Check-ins
          </span>
          <p className="text-2xl font-black text-indigo-400 mt-1 font-mono">{data.libraryAttendance?.percentage || 89.2}%</p>
          <span className="text-[11px] text-slate-300">Seat bookings</span>
        </div>

        {/* 5. Home Tuition */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border-2 border-slate-800 hover:border-amber-400 transition-all cyber-hud-card hud-corner-brackets shadow-lg">
          <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wider">Home Tuition</span>
          <p className="text-2xl font-black text-amber-400 mt-1 font-mono">{data.tuitionAttendance?.percentage || 94.1}%</p>
          <span className="text-[11px] text-slate-300">1-on-1 verified</span>
        </div>

        {/* 6. QR Punches */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border-2 border-cyan-500/60 hover:border-cyan-300 transition-all cyber-hud-card hud-corner-brackets shadow-lg">
          <span className="text-[10px] uppercase font-black text-cyan-400 block tracking-wider flex items-center gap-1">
            <QrCode className="w-3.5 h-3.5 text-cyan-400" /> QR Punches
          </span>
          <p className="text-2xl font-black text-cyan-300 mt-1 font-mono">{(data.qrAttendanceCount || 1422).toLocaleString()}</p>
          <span className="text-[11px] text-cyan-400 font-bold">82% automated</span>
        </div>

        {/* 7. Manual Logged */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border-2 border-slate-800 hover:border-slate-700 transition-all cyber-hud-card hud-corner-brackets shadow-lg">
          <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wider">Manual Logged</span>
          <p className="text-2xl font-black text-slate-200 mt-1 font-mono">{(data.manualAttendanceCount || 312).toLocaleString()}</p>
          <span className="text-[11px] text-slate-400">Supervisor entry</span>
        </div>

        {/* 8. Total Check-in */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border-2 border-slate-800 hover:border-emerald-400 transition-all cyber-hud-card hud-corner-brackets shadow-lg">
          <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wider flex items-center gap-1">
            <LogIn className="w-3.5 h-3.5 text-emerald-400" /> Total Check-in
          </span>
          <p className="text-2xl font-black text-emerald-400 mt-1 font-mono">{(data.checkInCount || 1734).toLocaleString()}</p>
          <span className="text-[11px] text-slate-400">Arrivals registered</span>
        </div>

        {/* 9. Total Check-out */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border-2 border-slate-800 hover:border-blue-400 transition-all cyber-hud-card hud-corner-brackets shadow-lg">
          <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wider flex items-center gap-1">
            <LogOut className="w-3.5 h-3.5 text-blue-400" /> Total Check-out
          </span>
          <p className="text-2xl font-black text-blue-400 mt-1 font-mono">{(data.checkOutCount || 1665).toLocaleString()}</p>
          <span className="text-[11px] text-slate-400">Departures closed</span>
        </div>

        {/* 10. Late Attendance */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border-2 border-amber-500/60 hover:border-amber-300 transition-all cyber-hud-card hud-corner-brackets shadow-lg">
          <span className="text-[10px] uppercase font-black text-amber-400 block tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" /> Late Attendance
          </span>
          <p className="text-2xl font-black text-amber-400 mt-1 font-mono">{data.lateAttendanceCount || data.lateSessions}</p>
          <span className="text-[11px] text-amber-300 font-bold">&gt;15m grace exceeded</span>
        </div>

        {/* 11. Missing Checkout */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border-2 border-rose-500/60 hover:border-rose-400 transition-all cyber-hud-card hud-corner-brackets shadow-lg">
          <span className="text-[10px] uppercase font-black text-rose-400 block tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Missing Checkout
          </span>
          <p className="text-2xl font-black text-rose-400 mt-1 font-mono">{data.missingCheckoutCount || 69}</p>
          <span className="text-[11px] text-rose-300">Unclosed shifts</span>
        </div>

        {/* 12. Anomalies Logged */}
        <div className="p-4 rounded-2xl bg-rose-950/40 border-2 border-rose-500/80 hover:border-rose-400 transition-all cyber-hud-card hud-corner-brackets shadow-lg">
          <span className="text-[10px] uppercase font-black text-rose-400 block tracking-wider flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" /> Anomalies Logged
          </span>
          <p className="text-2xl font-black text-rose-300 mt-1 font-mono drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]">
            {data.attendanceAnomaliesCount || 90}
          </p>
          <span className="text-[11px] text-rose-400 font-bold">Flagged for audit</span>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. DUAL INTERACTIVE CYBER DONUT CHARTS */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-2 rounded-2xl bg-slate-950/95 border-2 border-slate-800 hover:border-emerald-500/50 hud-corner-brackets transition-all shadow-xl">
          <InteractivePieDonutChart
            title="Session Compliance Distribution"
            subtitle="National breakdown of verified present, absent, late, and approved leave sessions"
            data={complianceChartData}
            centerLabel="Compliance"
            centerValue={`${data.presentPercentage}%`}
          />
        </div>

        <div className="p-2 rounded-2xl bg-slate-950/95 border-2 border-slate-800 hover:border-cyan-500/50 hud-corner-brackets transition-all shadow-xl">
          <InteractivePieDonutChart
            title="Biometric Punch Verification Channels"
            subtitle="Automated Dynamic QR vs GPS Radius vs RFID Gates vs Supervisor Override"
            data={methodChartData}
            centerLabel="Automated"
            centerValue="82.0%"
          />
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 4. ACTIVE BIOMETRIC ANOMALY & FRAUD DEFENSE TELEMETRY */}
      {/* ==================================================================== */}
      <div className="p-6 rounded-2xl bg-slate-950/95 border-2 border-rose-500/40 hover:border-rose-500/70 hud-corner-brackets space-y-4 shadow-xl transition-all">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-rose-950/80 border border-rose-500/60 text-rose-400">
                <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
              </span>
              <h3 className="text-sm font-black uppercase tracking-wider text-white">
                Active Biometric Anomaly & Fraud Defense Telemetry
              </h3>
              <span className="text-[10px] font-mono font-black text-rose-300 px-2.5 py-0.5 rounded-full bg-rose-950/80 border border-rose-500/40">
                4 CRITICAL GATES
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">
              Real-time telemetry flagging perimeter geofence radius breaches, proxy attempts, and open session shifts
            </p>
          </div>
          <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-950/80 px-2.5 py-1 rounded border border-amber-500/40">
            AUTO ESCALATION TO DISTRICT ADMIN
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Gate 1 */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 hover:border-rose-500/60 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase font-bold text-rose-400">Gate 01 // Geofence Breach</span>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-rose-950 text-rose-300 border border-rose-600/50">CRITICAL</span>
            </div>
            <strong className="text-sm font-black text-white block">Perimeter Distance &gt; 50m</strong>
            <p className="text-[11px] text-slate-400 font-mono">
              Punches recorded outside authorized school/library GPS radius. 2 active breaches flagged in Ghazipur & Varanasi.
            </p>
            <button
              onClick={() => {
                if (audioEnabled) soundSystem.playChirp('click');
                setSelectedStatusFilter('ANOMALY');
              }}
              className="text-xs font-mono font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 pt-1 cursor-pointer"
            >
              <span>Filter Anomaly Sessions</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Gate 2 */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 hover:border-amber-500/60 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase font-bold text-amber-400">Gate 02 // Shift Drift</span>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-950 text-amber-300 border border-amber-600/50">WARNING</span>
            </div>
            <strong className="text-sm font-black text-white block">Unclosed Sessions (&gt;6h)</strong>
            <p className="text-[11px] text-slate-400 font-mono">
              69 check-ins registered without corresponding checkout punch. Automated WhatsApp notifications queued to parents.
            </p>
            <button
              onClick={() => {
                if (audioEnabled) soundSystem.playChirp('click');
                setSelectedStatusFilter('PRESENT');
              }}
              className="text-xs font-mono font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 pt-1 cursor-pointer"
            >
              <span>Inspect Open Sessions</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Gate 3 */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 hover:border-cyan-500/60 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase font-bold text-cyan-400">Gate 03 // Device Clone</span>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-600/50">SECURED</span>
            </div>
            <strong className="text-sm font-black text-white block">Simultaneous Hardware ID</strong>
            <p className="text-[11px] text-slate-400 font-mono">
              Zero duplicate device fingerprints detected. Hardware cryptographic pass enforced on all student QR scans.
            </p>
            <span className="text-[10px] font-mono text-emerald-400 font-bold block pt-1">
              ✓ 100% Hardware Bound
            </span>
          </div>

          {/* Gate 4 */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 hover:border-purple-500/60 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase font-bold text-purple-400">Gate 04 // Supervisor Audit</span>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-purple-950 text-purple-300 border border-purple-600/50">AUDITED</span>
            </div>
            <strong className="text-sm font-black text-white block">Manual Overrides (&lt;18%)</strong>
            <p className="text-[11px] text-slate-400 font-mono">
              All 312 supervisor manual overrides signed with District Admin verified credentials and audit remarks.
            </p>
            <button
              onClick={() => {
                if (audioEnabled) soundSystem.playChirp('click');
                setSelectedMethodFilter('SUPERVISOR_OVERRIDE');
              }}
              className="text-xs font-mono font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 pt-1 cursor-pointer"
            >
              <span>View Manual Overrides</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 5. TERRITORY ATTENDANCE & DISTRICT PERFORMANCE MATRIX */}
      {/* ==================================================================== */}
      <div className="p-6 rounded-2xl bg-slate-950/95 border-2 border-slate-800 hover:border-emerald-500/50 hud-corner-brackets space-y-4 shadow-xl transition-all">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              Territory Attendance Compliance & Performance Matrix
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
              Live district-level presence rate, sessions verified, and automated audit status
            </p>
          </div>
          <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-950/80 px-2.5 py-1 rounded border border-cyan-500/40">
            AUDITED BY FOCUSPOINT OS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {data.districtBreakdown.map((item: any) => {
            const isDistrictActive = selectedDistrict.toLowerCase() === item.district.toLowerCase();

            return (
              <div
                key={item.district}
                className={`p-4 rounded-xl border-2 transition-all cyber-hud-card hud-corner-brackets ${
                  isDistrictActive
                    ? 'bg-emerald-950/70 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] ring-1 ring-emerald-400'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-black text-xs text-white uppercase">{item.district}</span>
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                    {item.state}
                  </span>
                </div>

                <div className="my-2.5 space-y-1">
                  <div className="flex justify-between items-baseline font-mono">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Compliance:</span>
                    <strong className="text-base font-black text-emerald-400">{item.present}%</strong>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                      style={{ width: `${item.present}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 block pt-0.5">
                    {item.sessions} Sessions Logged
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (audioEnabled) soundSystem.playChirp('warp');
                    if (isDistrictActive) {
                      setSelectedDistrict('ALL');
                    } else {
                      setSelectedState(item.state);
                      setSelectedDistrict(item.district);
                      setSelectedLocality('ALL');
                    }
                    setCurrentPage(1);
                  }}
                  className={`mt-2 w-full py-1.5 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    isDistrictActive
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-xs'
                      : 'bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-emerald-500/60'
                  }`}
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>{isDistrictActive ? 'ACTIVE DISTRICT' : 'FOCUS DISTRICT'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 6. LIVE ATTENDANCE SESSIONS & BIOMETRIC PUNCH LEDGER */}
      {/* ==================================================================== */}
      <div className="p-6 rounded-2xl bg-slate-950/95 border-2 border-slate-800 hud-corner-brackets space-y-5 shadow-xl">
        {/* Ledger Header & Active Status */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-cyan-400" />
                Live Attendance Sessions & Biometric Punch Ledger
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                {processedRecords.length} OF {INITIAL_PUNCH_RECORDS.length} VERIFIED SESSIONS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">
              Real-time biometric punch ledger with location coordinates, geofence radius analysis, and proxy verification status
            </p>
          </div>

          {/* Reset Filters Button if Active */}
          {activeFiltersCount > 0 && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/80 border border-rose-500/60 text-rose-300 hover:bg-rose-900 text-xs font-mono font-bold transition-all cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters ({activeFiltersCount})</span>
            </button>
          )}
        </div>

        {/* ==================================================================== */}
        {/* SEARCH & CASCADING LOCATION CONTROLS */}
        {/* ==================================================================== */}
        <div className="space-y-3.5 bg-slate-900/50 p-4 rounded-2xl border border-slate-800/80">
          {/* Row 1: Omni Search & Location Cascading Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. Omni Search with Clear button */}
            <div className="relative">
              <Search className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search student, teacher, punch ID..."
                className="w-full h-10 pl-10 pr-8 rounded-xl bg-slate-900 border-2 border-slate-700 text-white text-xs font-mono placeholder:text-slate-500 focus:outline-none focus:border-emerald-400"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setCurrentPage(1);
                  }}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white p-0.5"
                  title="Clear Search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* 2. State Selector */}
            <div className="relative">
              <label className="text-[9px] font-mono font-bold uppercase text-slate-400 absolute left-3 top-1 pointer-events-none">
                State Scope:
              </label>
              <select
                value={selectedState}
                onChange={(e) => {
                  if (audioEnabled) soundSystem.playChirp('click');
                  setSelectedState(e.target.value);
                  setSelectedDistrict('ALL');
                  setSelectedLocality('ALL');
                  setCurrentPage(1);
                }}
                className="w-full h-10 pt-3.5 pb-0.5 px-3 rounded-xl bg-slate-900 border-2 border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                {uniqueStates.map(st => (
                  <option key={st} value={st} className="bg-slate-900 text-white">
                    {st === 'ALL' ? 'All States (Pan-India)' : st}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. District Selector (Cascading) */}
            <div className="relative">
              <label className="text-[9px] font-mono font-bold uppercase text-slate-400 absolute left-3 top-1 pointer-events-none">
                District:
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => {
                  if (audioEnabled) soundSystem.playChirp('click');
                  setSelectedDistrict(e.target.value);
                  setSelectedLocality('ALL');
                  setCurrentPage(1);
                }}
                className="w-full h-10 pt-3.5 pb-0.5 px-3 rounded-xl bg-slate-900 border-2 border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                {availableDistricts.map(dt => (
                  <option key={dt} value={dt} className="bg-slate-900 text-white">
                    {dt === 'ALL' ? 'All Districts' : dt}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Locality / Center Selector (Cascading) */}
            <div className="relative">
              <label className="text-[9px] font-mono font-bold uppercase text-slate-400 absolute left-3 top-1 pointer-events-none">
                Locality / Center:
              </label>
              <select
                value={selectedLocality}
                onChange={(e) => {
                  if (audioEnabled) soundSystem.playChirp('click');
                  setSelectedLocality(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-10 pt-3.5 pb-0.5 px-3 rounded-xl bg-slate-900 border-2 border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                {availableLocalities.map(loc => (
                  <option key={loc} value={loc} className="bg-slate-900 text-white">
                    {loc === 'ALL' ? 'All Localities' : loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Role, Status, and Method Filter Pills */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1 border-t border-slate-800/60">
            {/* Role Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase mr-1">Role:</span>
              {[
                { key: 'ALL', label: 'All Roles' },
                { key: 'STUDENT', label: 'Students' },
                { key: 'TEACHER', label: 'Faculty / Teachers' },
                { key: 'LIBRARY_SCHOLAR', label: 'Library Scholars' },
              ].map(role => (
                <button
                  key={role.key}
                  onClick={() => {
                    if (audioEnabled) soundSystem.playChirp('click');
                    setSelectedRoleFilter(role.key);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    selectedRoleFilter === role.key
                      ? 'bg-emerald-600 text-white shadow-sm border border-emerald-400'
                      : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  {role.label}
                </button>
              ))}
            </div>

            {/* Status Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase mr-1">Status:</span>
              {[
                { key: 'ALL', label: 'All' },
                { key: 'PRESENT', label: 'Present' },
                { key: 'LATE', label: 'Late' },
                { key: 'ANOMALY', label: 'Anomaly' },
                { key: 'APPROVED_LEAVE', label: 'Leave' },
              ].map(st => (
                <button
                  key={st.key}
                  onClick={() => {
                    if (audioEnabled) soundSystem.playChirp('click');
                    setSelectedStatusFilter(st.key);
                    setCurrentPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    selectedStatusFilter === st.key
                      ? 'bg-cyan-600 text-white shadow-sm border border-cyan-400'
                      : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* Method Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase mr-1">Method:</span>
              {[
                { key: 'ALL', label: 'All Methods' },
                { key: 'GEO_QR', label: 'Geo-QR' },
                { key: 'GPS_BIOMETRIC', label: 'GPS Mobile' },
                { key: 'RFID_GATE', label: 'RFID Gate' },
                { key: 'SUPERVISOR_OVERRIDE', label: 'Override' },
              ].map(m => (
                <button
                  key={m.key}
                  onClick={() => {
                    if (audioEnabled) soundSystem.playChirp('click');
                    setSelectedMethodFilter(m.key);
                    setCurrentPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    selectedMethodFilter === m.key
                      ? 'bg-purple-600 text-white shadow-sm border border-purple-400'
                      : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Row 3: Sorting ("Shorting") & View Control Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
            {/* Sorting Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-mono font-bold text-amber-300 uppercase flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                Sort By:
              </span>
              {[
                { key: 'location', label: 'Location' },
                { key: 'date', label: 'Time / Date' },
                { key: 'attendee', label: 'Attendee Name' },
                { key: 'role', label: 'Role' },
                { key: 'status', label: 'Status' },
                { key: 'distance', label: 'Geofence Distance' },
              ].map(sortItem => (
                <button
                  key={sortItem.key}
                  onClick={() => handleSort(sortItem.key as SortKey)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    sortKey === sortItem.key
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{sortItem.label}</span>
                  {sortKey === sortItem.key && (
                    sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-amber-400" /> : <ArrowDown className="w-3 h-3 text-amber-400" />
                  )}
                </button>
              ))}

              {/* Order Toggle */}
              <button
                onClick={() => {
                  if (audioEnabled) soundSystem.playChirp('click');
                  setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 text-xs font-mono font-bold hover:bg-slate-700 flex items-center gap-1 cursor-pointer"
                title="Toggle Sort Order"
              >
                <ArrowUpDown className="w-3 h-3 text-amber-400" />
                <span>{sortOrder === 'asc' ? 'ASC (A-Z / Low-High)' : 'DESC (Z-A / High-Low)'}</span>
              </button>
            </div>

            {/* Page Size Selector */}
            <div className="flex items-center gap-2 self-end lg:self-auto">
              <span className="text-[11px] font-mono text-slate-400">Show:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="h-8 px-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value={5}>5 Rows</option>
                <option value={10}>10 Rows</option>
                <option value={20}>20 Rows</option>
                <option value={9999}>All Rows</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filters Summary Chips */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono">
            <span className="text-slate-400 font-bold uppercase">Active Filters:</span>
            {selectedState !== 'ALL' && (
              <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-200 flex items-center gap-1">
                State: <strong className="text-cyan-300">{selectedState}</strong>
                <button onClick={() => { setSelectedState('ALL'); setSelectedDistrict('ALL'); setSelectedLocality('ALL'); }} className="hover:text-rose-400 ml-1">×</button>
              </span>
            )}
            {selectedDistrict !== 'ALL' && (
              <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-200 flex items-center gap-1">
                District: <strong className="text-emerald-300">{selectedDistrict}</strong>
                <button onClick={() => { setSelectedDistrict('ALL'); setSelectedLocality('ALL'); }} className="hover:text-rose-400 ml-1">×</button>
              </span>
            )}
            {selectedLocality !== 'ALL' && (
              <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-200 flex items-center gap-1">
                Locality: <strong className="text-amber-300">{selectedLocality}</strong>
                <button onClick={() => setSelectedLocality('ALL')} className="hover:text-rose-400 ml-1">×</button>
              </span>
            )}
            {selectedRoleFilter !== 'ALL' && (
              <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-200 flex items-center gap-1">
                Role: <strong className="text-purple-300">{selectedRoleFilter}</strong>
                <button onClick={() => setSelectedRoleFilter('ALL')} className="hover:text-rose-400 ml-1">×</button>
              </span>
            )}
            {selectedStatusFilter !== 'ALL' && (
              <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-200 flex items-center gap-1">
                Status: <strong className="text-rose-300">{selectedStatusFilter}</strong>
                <button onClick={() => setSelectedStatusFilter('ALL')} className="hover:text-rose-400 ml-1">×</button>
              </span>
            )}
            {selectedMethodFilter !== 'ALL' && (
              <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-200 flex items-center gap-1">
                Method: <strong className="text-cyan-300">{selectedMethodFilter}</strong>
                <button onClick={() => setSelectedMethodFilter('ALL')} className="hover:text-rose-400 ml-1">×</button>
              </span>
            )}
            {searchQuery && (
              <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-200 flex items-center gap-1">
                Search: <strong className="text-white">"{searchQuery}"</strong>
                <button onClick={() => setSearchQuery('')} className="hover:text-rose-400 ml-1">×</button>
              </span>
            )}
          </div>
        )}

        {/* Ledger Table Matrix */}
        {paginatedRecords.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs font-mono bg-slate-900/60 rounded-2xl border border-slate-800 space-y-3">
            <p className="text-sm font-black text-slate-300 uppercase">
              No biometric sessions match the selected filters
            </p>
            <p className="text-[11px] text-slate-500">
              Try adjusting the State/District filter, clearing the search term, or selecting "All India" preset.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="mt-2 text-xs font-bold bg-slate-800 border-slate-700 text-emerald-400"
            >
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="border-b border-slate-800 text-[11px] font-mono font-bold text-slate-400 uppercase bg-slate-900/60">
                <tr>
                  <th 
                    className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Punch ID & Time</span>
                      {sortKey === 'date' ? (
                        sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-amber-400" /> : <ArrowDown className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-600" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('attendee')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Attendee & Role</span>
                      {sortKey === 'attendee' ? (
                        sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-amber-400" /> : <ArrowDown className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-600" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('location')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Location Coordinates</span>
                      {sortKey === 'location' ? (
                        sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-amber-400" /> : <ArrowDown className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-600" />
                      )}
                    </div>
                  </th>
                  <th className="py-3 px-4">Service & Facility</th>
                  <th className="py-3 px-4">Verification Method</th>
                  <th 
                    className="py-3 px-4 text-center cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('distance')}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>Geofence Status</span>
                      {sortKey === 'distance' ? (
                        sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-amber-400" /> : <ArrowDown className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-600" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="py-3 px-4 text-center cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>Status</span>
                      {sortKey === 'status' ? (
                        sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-amber-400" /> : <ArrowDown className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-600" />
                      )}
                    </div>
                  </th>
                  <th className="py-3 px-4 text-center">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono">
                {paginatedRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-900/90 transition-colors group">
                    {/* Punch ID & Timestamp */}
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      <div className="text-cyan-400 font-bold group-hover:text-cyan-300 transition-colors flex items-center gap-1">
                        <span>{r.punchId}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal">{r.date} · {r.checkInTime}</div>
                    </td>

                    {/* Attendee & Role */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>{r.attendeeName}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${
                          r.role === 'STUDENT'
                            ? 'bg-blue-950/90 text-blue-300 border border-blue-500/40'
                            : r.role === 'TEACHER'
                            ? 'bg-teal-950/90 text-teal-300 border border-teal-500/40'
                            : 'bg-indigo-950/90 text-indigo-300 border border-indigo-500/40'
                        }`}>
                          {r.role === 'STUDENT' ? 'Student' : r.role === 'TEACHER' ? 'Faculty' : 'Scholar'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{r.userId}</span>
                      </div>
                    </td>

                    {/* Location Coordinates */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-[11px] text-slate-300 font-sans">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="font-semibold text-emerald-300">{r.districtName}</span>
                        <span className="text-slate-400">({r.localityName})</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {r.areaName} · {r.stateName}
                      </div>
                    </td>

                    {/* Service & Facility */}
                    <td className="py-3.5 px-4">
                      <div className="text-slate-200 font-sans truncate max-w-xs font-medium">
                        {r.serviceTitle}
                      </div>
                      <div className="text-[10px] text-slate-400 font-sans truncate max-w-xs mt-0.5">
                        {r.facilityName}
                      </div>
                    </td>

                    {/* Verification Method */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        r.verificationMethod === 'GEO_QR'
                          ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40'
                          : r.verificationMethod === 'GPS_BIOMETRIC'
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                          : r.verificationMethod === 'RFID_GATE'
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                          : 'bg-purple-950/80 text-purple-300 border border-purple-500/40'
                      }`}>
                        {r.verificationMethod === 'GEO_QR' ? <QrCode className="w-3 h-3" /> :
                         r.verificationMethod === 'GPS_BIOMETRIC' ? <MapPin className="w-3 h-3" /> :
                         r.verificationMethod === 'RFID_GATE' ? <Radio className="w-3 h-3" /> :
                         <UserCheck className="w-3 h-3" />}
                        <span>
                          {r.verificationMethod === 'GEO_QR' ? 'Geo-QR v3' :
                           r.verificationMethod === 'GPS_BIOMETRIC' ? 'GPS Mobile' :
                           r.verificationMethod === 'RFID_GATE' ? 'RFID Turnstile' :
                           'Supervisor'}
                        </span>
                      </span>
                    </td>

                    {/* Geofence Status & Radius */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.geofenceStatus === 'VERIFIED_IN_PERIMETER'
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                            : r.geofenceStatus === 'PERIMETER_WARNING'
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                            : 'bg-rose-950/90 text-rose-300 border border-rose-500/60 animate-pulse'
                        }`}>
                          {r.geofenceStatus === 'VERIFIED_IN_PERIMETER' ? 'In Perimeter' :
                           r.geofenceStatus === 'PERIMETER_WARNING' ? 'Warning' :
                           'BREACH'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {r.geofenceDistanceMeters}m radius
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        r.status === 'PRESENT'
                          ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/50'
                          : r.status === 'LATE'
                          ? 'bg-amber-950/90 text-amber-300 border border-amber-500/50'
                          : r.status === 'ANOMALY'
                          ? 'bg-rose-950/90 text-rose-300 border border-rose-500/60'
                          : 'bg-purple-950/90 text-purple-300 border border-purple-500/50'
                      }`}>
                        {r.status}
                      </span>
                    </td>

                    {/* Audit Action Button */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          if (audioEnabled) soundSystem.playChirp('click');
                          setSelectedAuditRecord(r);
                        }}
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-cyan-300 hover:border-cyan-400 hover:bg-cyan-950/60 transition-all cursor-pointer shadow-xs"
                        title="Audit Biometric Punch Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* User-Friendly Pagination Navigation */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800 text-xs font-mono">
            <span className="text-slate-400">
              Showing <strong className="text-white">{(currentPage - 1) * effectivePageSize + 1}</strong> to{' '}
              <strong className="text-white">{Math.min(totalRecords, currentPage * effectivePageSize)}</strong> of{' '}
              <strong className="text-emerald-400">{totalRecords}</strong> records
            </span>

            <div className="flex items-center gap-1.5">
              {/* First Page */}
              <button
                disabled={currentPage === 1}
                onClick={() => {
                  if (audioEnabled) soundSystem.playChirp('click');
                  setCurrentPage(1);
                }}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                title="First Page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              {/* Prev Page */}
              <button
                disabled={currentPage === 1}
                onClick={() => {
                  if (audioEnabled) soundSystem.playChirp('click');
                  setCurrentPage(prev => Math.max(1, prev - 1));
                }}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page Number Chips */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => {
                    if (audioEnabled) soundSystem.playChirp('click');
                    setCurrentPage(p);
                  }}
                  className={`w-8 h-8 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                    currentPage === p
                      ? 'bg-emerald-600 text-white border border-emerald-400 shadow-md shadow-emerald-500/30'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}

              {/* Next Page */}
              <button
                disabled={currentPage === totalPages}
                onClick={() => {
                  if (audioEnabled) soundSystem.playChirp('click');
                  setCurrentPage(prev => Math.min(totalPages, prev + 1));
                }}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Last Page */}
              <button
                disabled={currentPage === totalPages}
                onClick={() => {
                  if (audioEnabled) soundSystem.playChirp('click');
                  setCurrentPage(totalPages);
                }}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                title="Last Page"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* 7. BIOMETRIC PUNCH AUDIT & GEOFENCE INSPECTION MODAL */}
      {/* ==================================================================== */}
      {selectedAuditRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-[#060b19] border-2 border-emerald-500/80 rounded-3xl p-6 text-white shadow-[0_0_50px_rgba(16,185,129,0.4)] hud-corner-brackets space-y-5 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Fingerprint className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-black uppercase tracking-wider text-white font-mono">
                  Cryptographic Biometric Punch & Geofence Audit
                </h3>
              </div>
              <button
                onClick={() => setSelectedAuditRecord(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Reference & SHA-256 Hash Bar */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3 font-mono text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Punch Reference ID</span>
                <strong className="text-cyan-400 text-sm font-black">{selectedAuditRecord.punchId}</strong>
              </div>
              <button
                onClick={() => {
                  if (audioEnabled) soundSystem.playChirp('click');
                  navigator.clipboard.writeText(selectedAuditRecord.punchId);
                  setCopiedPunchId(true);
                  setTimeout(() => setCopiedPunchId(false), 2000);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-950 border border-slate-700 text-[11px] text-slate-300 hover:text-white cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-cyan-400" />
                <span>{copiedPunchId ? 'Copied!' : 'Copy Punch ID'}</span>
              </button>
            </div>

            {/* 4 Key Biometric Telemetry Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Compliance Status</span>
                <strong className="text-sm font-black text-emerald-400 uppercase block mt-0.5">{selectedAuditRecord.status}</strong>
              </div>
              <div className="p-3 rounded-xl bg-cyan-950/70 border border-cyan-500/40">
                <span className="text-[10px] text-cyan-300 uppercase block font-bold">Punch Timestamp</span>
                <strong className="text-xs font-black text-white block mt-0.5">{selectedAuditRecord.checkInTime}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Geofence Radius</span>
                <strong className="text-xs font-black text-emerald-300 block mt-0.5">{selectedAuditRecord.geofenceDistanceMeters}m from center</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Integrity Score</span>
                <strong className="text-sm font-black text-cyan-400 block mt-0.5">{selectedAuditRecord.integrityScore}%</strong>
              </div>
            </div>

            {/* Comprehensive Biometric Attribute Grid */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Attendee Identity:</span>
                <strong className="text-white">{selectedAuditRecord.attendeeName} ({selectedAuditRecord.role})</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Location Coordinates:</span>
                <strong className="text-emerald-300">
                  {selectedAuditRecord.localityName}, {selectedAuditRecord.districtName}, {selectedAuditRecord.stateName}
                </strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Facility / Facility Center:</span>
                <strong className="text-slate-200">{selectedAuditRecord.facilityName}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Punch Verification Rail:</span>
                <strong className="text-cyan-400">{selectedAuditRecord.verificationMethod} (Hardware Hash Verified)</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Device Hardware ID / IP:</span>
                <strong className="text-slate-300">{selectedAuditRecord.deviceFingerprint} ({selectedAuditRecord.deviceIp})</strong>
              </div>
              {selectedAuditRecord.anomalyReason && (
                <div className="flex justify-between py-1 border-b border-slate-800/80 text-rose-300">
                  <span className="font-bold">Anomaly Diagnostic:</span>
                  <strong className="text-right max-w-xs">{selectedAuditRecord.anomalyReason}</strong>
                </div>
              )}
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Parent Notification:</span>
                <strong className="text-emerald-400">
                  {selectedAuditRecord.parentNotification === 'DELIVERED' ? '✓ WhatsApp Telemetry Delivered' : 'N/A or Pending'}
                </strong>
              </div>
            </div>

            {/* Modal Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (audioEnabled) soundSystem.playChirp('confirm');
                  setPassDownloaded(true);
                  setTimeout(() => setPassDownloaded(false), 3000);
                }}
                className="bg-emerald-950 text-emerald-300 border-emerald-500/60 text-xs font-mono font-bold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{passDownloaded ? 'Biometric Pass Dispatched' : 'Download Biometric Certificate'}</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedAuditRecord(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono font-bold"
              >
                Close Inspection Deck
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Universal Export Modal */}
      <ExportModal
        title={`Attendance Intelligence Briefing (Pan-India)`}
        data={{ data, records: INITIAL_PUNCH_RECORDS }}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  );
};
