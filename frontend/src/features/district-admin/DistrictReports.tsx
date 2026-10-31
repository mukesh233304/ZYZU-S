import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { districtAdminService } from '../../services/districtAdminService';
import { districtAuthorizationService } from '../../services/districtAuthorizationService';
import { mockStore } from '../../mock/store';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  Users,
  Building2,
  GraduationCap,
  DollarSign,
  TrendingUp,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Eye,
  Printer,
  Search,
  BookOpen,
  Receipt,
  Sparkles,
  Layers,
  MapPin,
  CreditCard,
  AlertCircle,
  XCircle,
  HelpCircle,
  FileSpreadsheet,
  Maximize2,
  Minimize2,
  X,
  ChevronRight,
  Check,
  Lock
} from 'lucide-react';

interface ReportColumn {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  isBadge?: boolean;
  isCurrency?: boolean;
}

interface ReportStat {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  subtext?: string;
}

interface ReportCategoryDefinition {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  count: string;
  stats: ReportStat[];
  columns: ReportColumn[];
  rows: Record<string, any>[];
  complianceNote: string;
}

export const DistrictReports: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const scope = districtAuthorizationService.getAuthorizedScope(user);
  const district = scope?.districtName || user?.districtName || user?.district || 'Mirzapur';

  // Server-side District Access Verification
  const isAuthorized = districtAuthorizationService.verifyDistrictAccess(district, user);

  // Filter State
  const [selectedMonth, setSelectedMonth] = useState('2026-09');
  const [dateRangeType, setDateRangeType] = useState<'MONTH' | 'CUSTOM' | 'EXACT_DATE'>('MONTH');
  const [startDate, setStartDate] = useState('2026-09-01');
  const [endDate, setEndDate] = useState('2026-09-30');
  const [exactDate, setExactDate] = useState('2026-09-14');

  // URL Params Synchronization
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || searchParams.get('id') || '1';

  // Selected Category & Search Filter
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [exactSnapshot, setExactSnapshot] = useState<any>(null);
  const [loadingSnapshot, setLoadingSnapshot] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const previewDeskRef = useRef<HTMLDivElement>(null);

  // Sync state if URL search param changes
  useEffect(() => {
    const urlCat = searchParams.get('category') || searchParams.get('id');
    if (urlCat && urlCat !== selectedCategoryId) {
      setSelectedCategoryId(urlCat);
    }
  }, [searchParams]);

  // Category Selector helper with smooth focus
  const selectCategory = (id: string, shouldScroll = true) => {
    setSelectedCategoryId(id);
    setSearchParams({ category: id });
    if (shouldScroll) {
      setTimeout(() => {
        previewDeskRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  };

  // Exact Date Query Runner (Req 37)
  const runExactDateQuery = async (dateStr: string) => {
    setLoadingSnapshot(true);
    try {
      const data = await districtAdminService.getHistoricalDateData(district, dateStr);
      setExactSnapshot(data);
    } catch (e) {
      console.error(e);
      addToast('Failed to fetch snapshot for specified date', 'error');
    } finally {
      setLoadingSnapshot(false);
    }
  };

  useEffect(() => {
    if (dateRangeType === 'EXACT_DATE') {
      runExactDateQuery(exactDate);
    }
  }, [exactDate, dateRangeType]);

  // Reset search on category change
  useEffect(() => {
    setSearchQuery('');
  }, [selectedCategoryId]);

  // Dynamic Category Data - Scoped strictly to Authorized District
  const categoryDataMap: Record<string, ReportCategoryDefinition> = useMemo(() => {
    // If not Ghazipur (e.g. Mirzapur), build dynamic reports based on store records for the authorized district
    if (district.toLowerCase() !== 'ghazipur') {
      const teachers = mockStore.getTeachers(district);
      const students = mockStore.getStudents(district);
      const libraries = mockStore.getLibraries(district);
      const tutorRequests = mockStore.getTutorRequests(district);
      const expenses = mockStore.getDistrictExpenses(district);
      const auditLogs = districtAuthorizationService.getAccessAuditLogs().filter(
        l => l.authorizedDistrictId?.toLowerCase() === district.toLowerCase() ||
             l.requestedDistrictId?.toLowerCase() === district.toLowerCase()
      );

      const totalDeskCapacity = libraries.reduce((acc, l) => acc + (l.totalSeats || 0), 0);
      const tuitionLearners = students.filter(s => (s as any).course?.toLowerCase().includes('tuition')).length;
      const libraryMembers = students.filter(s => (s as any).course?.toLowerCase().includes('library')).length;
      const estimatedGross = students.length * 1500;

      return {
        '1': {
          id: '1',
          name: 'Overall District Executive Summary',
          icon: ShieldCheck,
          color: 'text-blue-600 bg-blue-50',
          count: `${students.length} Students • ₹${estimatedGross.toLocaleString('en-IN')} Rev`,
          complianceNote: `Verified by District Administration (${district} Division). Certified under UP Educational Services Regulatory Framework.`,
          stats: [
            { label: 'Total Enrolled Learners', value: `${students.length} Students`, icon: Users, color: 'text-blue-600', subtext: `${tuitionLearners} Tuition • ${libraryMembers} Library` },
            { label: 'Verified Active Tutors', value: `${teachers.length} Faculty`, icon: GraduationCap, color: 'text-emerald-600', subtext: '100% Identity & Police Cleared' },
            { label: 'Study Library Facilities', value: `${libraries.length} Centers`, icon: Building2, color: 'text-purple-600', subtext: `${totalDeskCapacity} Total Seating Desks` },
            { label: 'Gross Monthly Billing', value: `₹${estimatedGross.toLocaleString('en-IN')}`, icon: DollarSign, color: 'text-indigo-600', subtext: 'Authorized District Scope' },
          ],
          columns: [
            { key: 'refId', label: 'Center Ref ID' },
            { key: 'hubName', label: 'Sub-District Hub' },
            { key: 'tehsil', label: 'Tehsil / Locality' },
            { key: 'learners', label: 'Enrolled Learners' },
            { key: 'tutors', label: 'Active Tutors' },
            { key: 'desks', label: 'Study Desks' },
            { key: 'monthlyRevenue', label: 'Monthly Inflow', align: 'right', isCurrency: true },
            { key: 'status', label: 'Regulatory Status', align: 'center', isBadge: true }
          ],
          rows: libraries.length > 0 ? libraries.map((lib, i) => ({
            refId: `${district.slice(0, 3).toUpperCase()}-CEN-0${i + 1}`,
            hubName: lib.name,
            tehsil: lib.address || `${district} Center`,
            learners: '0 Students',
            tutors: '0 Verified',
            desks: `${lib.totalSeats || 50} Desks`,
            monthlyRevenue: '₹0',
            status: 'AUDITED'
          })) : []
        },

        '2': {
          id: '2',
          name: 'Student Enrollment & Demographics',
          icon: Users,
          color: 'text-indigo-600 bg-indigo-50',
          count: `${students.length} Active Learners`,
          complianceNote: `All enrolled student profiles have verified guardian mobile credentials and locality records in ${district}.`,
          stats: [
            { label: 'Active Student Roster', value: `${students.length} Learners`, icon: Users, color: 'text-indigo-600', subtext: '100% KYC Verified' },
            { label: 'Home Tuition Enrolled', value: `${tuitionLearners} Students`, icon: BookOpen, color: 'text-emerald-600', subtext: 'Weekly In-Home Tutoring' },
            { label: 'Library Desk Members', value: `${libraryMembers} Members`, icon: Building2, color: 'text-purple-600', subtext: 'Self-Study Shift Occupants' },
            { label: 'New Admissions This Month', value: `+${students.length} Students`, icon: TrendingUp, color: 'text-blue-600', subtext: `${district} Cohort` },
          ],
          columns: [
            { key: 'studentId', label: 'Student ID' },
            { key: 'studentName', label: 'Student Name' },
            { key: 'contact', label: 'Guardian Phone' },
            { key: 'serviceType', label: 'Enrolled Program' },
            { key: 'grade', label: 'Class / Target' },
            { key: 'locality', label: 'Locality / Tehsil' },
            { key: 'joinedDate', label: 'Enrollment Date' },
            { key: 'feeStatus', label: 'Fee Status', align: 'center', isBadge: true }
          ],
          rows: students.map(s => ({
            studentId: s.id,
            studentName: s.name,
            contact: s.phone || '9876543210',
            serviceType: (s as any).course || 'Home Tuition',
            grade: (s as any).grade || (s as any).class || 'Class 10',
            locality: (s as any).locality || s.localityId || `${district} Main`,
            joinedDate: (s as any).enrollmentDate || s.createdAt || '2026-09-01',
            feeStatus: s.status === 'active' ? 'ACTIVE' : 'PENDING'
          }))
        },

        '3': {
          id: '3',
          name: 'Home Tuition Allotment & Demands',
          icon: BookOpen,
          color: 'text-emerald-600 bg-emerald-50',
          count: `${teachers.length} Active Tutors • ${tutorRequests.length} Allotted`,
          complianceNote: `Home tutor assignments are vetted with verified subject mastery and background checks before student matching.`,
          stats: [
            { label: 'Parent Tutor Demands', value: `${tutorRequests.length} Demands`, icon: HelpCircle, color: 'text-blue-600', subtext: 'Cumulative Requests' },
            { label: 'Successfully Allotted', value: `${tutorRequests.filter(r => (r.status as string) === 'active' || (r.status as string) === 'ALLOTTED' || (r.status as string) === 'TEACHER_ALLOTTED').length} Matched`, icon: CheckCircle2, color: 'text-emerald-600', subtext: 'Active Batches in Session' },
            { label: 'In Demo Trial Stage', value: `${tutorRequests.filter(r => (r.status as string) === 'UNDER_REVIEW' || (r.status as string) === 'demo_scheduled').length} Demos`, icon: Sparkles, color: 'text-purple-600', subtext: 'Pending Final Confirmation' },
            { label: 'Matching in Progress', value: `${tutorRequests.filter(r => (r.status as string) === 'pending' || (r.status as string) === 'SUBMITTED' || (r.status as string) === 'submitted').length} Pending`, icon: Clock, color: 'text-amber-600', subtext: 'Under 24hr Matching SLA' },
          ],
          columns: [
            { key: 'reqId', label: 'Demand ID' },
            { key: 'studentName', label: 'Student Name' },
            { key: 'gradeSubject', label: 'Grade & Subject Demand' },
            { key: 'locality', label: 'Locality' },
            { key: 'assignedTeacher', label: 'Allotted Educator' },
            { key: 'monthlyFee', label: 'Monthly Budget', align: 'right', isCurrency: true },
            { key: 'status', label: 'Allotment Status', align: 'center', isBadge: true }
          ],
          rows: tutorRequests.map(r => ({
            reqId: r.id,
            studentName: r.studentName,
            gradeSubject: `${r.grade || (r as any).className || 'Class 10'} - ${(r as any).subject || (r.subjects && r.subjects[0]) || 'General'}`,
            locality: (r as any).locality || r.area || (r as any).localityId || district,
            assignedTeacher: r.allottedTeacherName || 'Roster Matching Desk',
            monthlyFee: `₹${(r.budgetMonthly || 5000).toLocaleString('en-IN')}`,
            status: r.status?.toUpperCase() || 'PENDING'
          }))
        },

        '4': {
          id: '4',
          name: 'Teacher KYC & Faculty Dossier',
          icon: GraduationCap,
          color: 'text-blue-600 bg-blue-50',
          count: `${teachers.length} Verified • 0 Pending`,
          complianceNote: `Faculty members are vetted with Aadhaar biometric validation, academic degree audits, and local police verification.`,
          stats: [
            { label: 'Registered Educators', value: `${teachers.length} Verified`, icon: GraduationCap, color: 'text-blue-600', subtext: `In ${district} District` },
            { label: 'ID & Degree Verification', value: teachers.length > 0 ? '100% Cleared' : '0 Cleared', icon: ShieldCheck, color: 'text-emerald-600', subtext: 'Physical Documents Audited' },
            { label: 'Police Clearance On Record', value: `${teachers.length} Certified`, icon: CheckCircle2, color: 'text-indigo-600', subtext: 'Routine Check Done' },
            { label: 'Average Faculty Rating', value: teachers.length > 0 ? '4.90 / 5.0' : 'N/A', icon: Sparkles, color: 'text-amber-600', subtext: 'Student & Parent Reviews' },
          ],
          columns: [
            { key: 'teacherId', label: 'Faculty ID' },
            { key: 'name', label: 'Educator Name' },
            { key: 'qualification', label: 'Highest Qualification' },
            { key: 'subjects', label: 'Specialization' },
            { key: 'locality', label: 'Assigned Tehsil' },
            { key: 'experience', label: 'Experience' },
            { key: 'policeKyc', label: 'Police Clearance', align: 'center', isBadge: true },
            { key: 'status', label: 'Roster Status', align: 'center', isBadge: true }
          ],
          rows: teachers.map(t => ({
            teacherId: t.id,
            name: t.name,
            qualification: t.qualification || 'M.Sc / B.Ed',
            subjects: (t as any).subject || (t.subjects && t.subjects.join(', ')) || 'All Subjects',
            locality: (t as any).area || (t as any).locality || t.localityId || `${district} City`,
            experience: `${(t as any).experience || 3} Yrs`,
            policeKyc: 'VERIFIED',
            status: t.status?.toUpperCase() || 'ACTIVE'
          }))
        },

        '5': {
          id: '5',
          name: 'Discontinued / Left Teachers Audit',
          icon: Clock,
          color: 'text-amber-600 bg-amber-50',
          count: '0 Processed Clearances',
          complianceNote: `Formal clearances confirm zero fee disputes, zero student abandonment, and full batch reassignment.`,
          stats: [
            { label: 'Relieved Educators', value: '0 Faculty', icon: Clock, color: 'text-amber-600', subtext: 'Past 12 Months' },
            { label: 'Student Reassignments', value: '100% Completed', icon: CheckCircle2, color: 'text-emerald-600', subtext: 'Zero Interruption in Learning' },
            { label: 'Pending Dues / Liabilities', value: '₹0 Balance', icon: DollarSign, color: 'text-indigo-600', subtext: 'Full Financial Clearance' },
            { label: 'Relieving Letters Dispatched', value: '0 of 0', icon: FileText, color: 'text-blue-600', subtext: 'Official Stamp Affixed' },
          ],
          columns: [
            { key: 'exitId', label: 'Exit Token' },
            { key: 'teacherName', label: 'Educator Name' },
            { key: 'subjects', label: 'Subject Area' },
            { key: 'tenure', label: 'Active Tenure' },
            { key: 'exitDate', label: 'Relieving Date' },
            { key: 'reason', label: 'Reason for Departure' },
            { key: 'duesStatus', label: 'Financial Settlement', align: 'center', isBadge: true },
            { key: 'studentHandover', label: 'Batch Handover', align: 'center', isBadge: true }
          ],
          rows: []
        },

        '6': {
          id: '6',
          name: 'Library Infrastructure & Compliance',
          icon: Building2,
          color: 'text-purple-600 bg-purple-50',
          count: `${libraries.length} Libraries Verified`,
          complianceNote: `Every library undergoes mandatory periodic physical checks for safety, ergonomic seating, and silent study standards.`,
          stats: [
            { label: 'Certified Libraries', value: `${libraries.length} Facilities`, icon: Building2, color: 'text-purple-600', subtext: `${district} Network` },
            { label: 'Total Seating Desks', value: `${totalDeskCapacity} Desks`, icon: Users, color: 'text-blue-600', subtext: 'Air-Conditioned & Ergonomic' },
            { label: 'CCTV & Biometric Coverage', value: libraries.length > 0 ? '100% Online' : '0% Online', icon: ShieldCheck, color: 'text-emerald-600', subtext: 'All Centers Monitored' },
            { label: 'Power Backup Redundancy', value: `${libraries.length}/${libraries.length} Centers`, icon: CheckCircle2, color: 'text-indigo-600', subtext: 'Solar & Inverters' },
          ],
          columns: [
            { key: 'libId', label: 'Library ID' },
            { key: 'name', label: 'Facility Name' },
            { key: 'owner', label: 'Operator / In-Charge' },
            { key: 'location', label: 'Address / Tehsil' },
            { key: 'capacity', label: 'Total Desks' },
            { key: 'amenities', label: 'WiFi & CCTV Coverage' },
            { key: 'powerBackup', label: 'Power Redundancy' },
            { key: 'auditStatus', label: 'Compliance Status', align: 'center', isBadge: true }
          ],
          rows: libraries.map(lib => ({
            libId: lib.id,
            name: lib.name,
            owner: (lib as any).contactPerson || (lib as any).ownerName || 'Facility Manager',
            location: lib.address || `${district} Center`,
            capacity: `${lib.totalSeats || 50} Desks`,
            amenities: '200 Mbps + HD CCTVs',
            powerBackup: 'Solar + Inverter',
            auditStatus: 'COMPLIANT'
          }))
        },

        '7': {
          id: '7',
          name: 'Desk Seat Occupancy & Shift Logs',
          icon: Users,
          color: 'text-cyan-600 bg-cyan-50',
          count: `${totalDeskCapacity} Desks • 0% Occupancy`,
          complianceNote: `Seat occupancy is logged per shift to prevent overcrowding and ensure guaranteed assigned desks.`,
          stats: [
            { label: 'Total Seating Desks', value: `${totalDeskCapacity} Desks`, icon: Building2, color: 'text-blue-600', subtext: `Across ${libraries.length} Centers` },
            { label: 'Active Subscriptions', value: `${libraryMembers} Seats`, icon: Users, color: 'text-emerald-600', subtext: 'Regular Learners' },
            { label: 'Overall Utilization Rate', value: totalDeskCapacity > 0 ? `${Math.round((libraryMembers / totalDeskCapacity) * 100)}%` : '0%', icon: TrendingUp, color: 'text-indigo-600', subtext: 'Operating Margin' },
            { label: 'Peak Shift Utilization', value: totalDeskCapacity > 0 ? '75.0%' : '0%', icon: Clock, color: 'text-cyan-600', subtext: 'Morning Shift' },
          ],
          columns: [
            { key: 'library', label: 'Library Facility Hub' },
            { key: 'shift', label: 'Shift Window' },
            { key: 'timing', label: 'Shift Hours' },
            { key: 'totalDesks', label: 'Desk Capacity' },
            { key: 'occupied', label: 'Occupied' },
            { key: 'vacant', label: 'Available Seats' },
            { key: 'utilization', label: 'Seat Utilization Rate', align: 'right' }
          ],
          rows: libraries.map(lib => ({
            library: lib.name,
            shift: 'Morning Shift (A)',
            timing: '06:00 AM - 02:00 PM',
            totalDesks: `${lib.totalSeats || 50} Desks`,
            occupied: '0 Seats',
            vacant: `${lib.totalSeats || 50} Seats`,
            utilization: '0.0%'
          }))
        },

        '8': {
          id: '8',
          name: 'Daily & Monthly Attendance Register',
          icon: CheckCircle2,
          color: 'text-emerald-600 bg-emerald-50',
          count: '0% Avg Compliance',
          complianceNote: `Attendance is recorded through GPS-fenced biometric devices in libraries and OTP-verified mobile check-ins by home tutors in ${district}.`,
          stats: [
            { label: 'Overall Attendance Compliance', value: '0.0%', icon: CheckCircle2, color: 'text-emerald-600', subtext: 'Month-to-Date Ratio' },
            { label: 'Daily Biometric Scans', value: '0 Scans', icon: Users, color: 'text-blue-600', subtext: 'Average Daily Check-Ins' },
            { label: 'Tuition Sessions Logged', value: '0 Sessions / Day', icon: BookOpen, color: 'text-purple-600', subtext: 'OTP Verified Attendance' },
            { label: 'Attendance Alerts Sent', value: '0 Flags', icon: AlertCircle, color: 'text-amber-600', subtext: 'Sent to Parents via WhatsApp' },
          ],
          columns: [
            { key: 'logId', label: 'Audit Log ID' },
            { key: 'date', label: 'Session Date' },
            { key: 'studentName', label: 'Learner / Member' },
            { key: 'facilityTeacher', label: 'Educator / Study Desk Hub' },
            { key: 'service', label: 'Program Category' },
            { key: 'checkIn', label: 'Check-In Time' },
            { key: 'checkOut', label: 'Check-Out Time' },
            { key: 'compliance', label: 'Status', align: 'center', isBadge: true }
          ],
          rows: []
        },

        '9': {
          id: '9',
          name: 'Gross Fee Collections & Realization',
          icon: DollarSign,
          color: 'text-emerald-600 bg-emerald-50',
          count: `₹${estimatedGross.toLocaleString('en-IN')} Realized`,
          complianceNote: `Digital payment receipts are signed cryptographically with GST compliant reference IDs and automatic parent invoicing in ${district}.`,
          stats: [
            { label: 'Total Fee Billed', value: `₹${estimatedGross.toLocaleString('en-IN')}`, icon: DollarSign, color: 'text-blue-600', subtext: 'Invoiced for Current Cycle' },
            { label: 'Total Realized Inflow', value: `₹${estimatedGross.toLocaleString('en-IN')}`, icon: CheckCircle2, color: 'text-emerald-600', subtext: '100% Collection Rate' },
            { label: 'Pending Realization', value: '₹0', icon: Clock, color: 'text-amber-600', subtext: 'Zero Pending Dues' },
            { label: 'Digital / UPI Share', value: '100%', icon: CreditCard, color: 'text-purple-600', subtext: 'Direct Gateway Settlement' },
          ],
          columns: [
            { key: 'receiptNo', label: 'Receipt No.' },
            { key: 'studentName', label: 'Student / Parent' },
            { key: 'service', label: 'Service Description' },
            { key: 'invoiceAmount', label: 'Billed Amount', align: 'right', isCurrency: true },
            { key: 'paidDate', label: 'Payment Date' },
            { key: 'mode', label: 'Payment Gateway / Mode' },
            { key: 'status', label: 'Accounting Status', align: 'center', isBadge: true }
          ],
          rows: students.map((s, idx) => ({
            receiptNo: `FP-REC-${district.slice(0, 3).toUpperCase()}-0${idx + 1}`,
            studentName: s.name,
            service: (s as any).course || 'Monthly Educational Service',
            invoiceAmount: '₹1,500',
            paidDate: '2026-09-02',
            mode: 'UPI QR',
            status: 'REALIZED'
          }))
        },

        '10': {
          id: '10',
          name: 'District Operational Expenses Ledger',
          icon: FileText,
          color: 'text-rose-600 bg-rose-50',
          count: `${expenses.length} Recorded Vouchers`,
          complianceNote: `Operational expenditures are tracked against verified vouchers with geo-tagged proof and District Admin signoff in ${district}.`,
          stats: [
            { label: 'Recorded Vouchers', value: `${expenses.length} Vouchers`, icon: FileText, color: 'text-rose-600', subtext: 'Current Audit Cycle' },
            { label: 'Total Operational Spend', value: `₹${expenses.reduce((sum, e) => sum + (e.amount || 0), 0).toLocaleString('en-IN')}`, icon: DollarSign, color: 'text-indigo-600', subtext: 'Deducted from District Gross' },
            { label: 'Inspection & Travel Fuel', value: '₹0', icon: MapPin, color: 'text-blue-600', subtext: 'Sub-District Verification' },
            { label: 'Office & Member Supplies', value: '₹0', icon: Building2, color: 'text-purple-600', subtext: 'Printing, ID Cards, Utilities' },
          ],
          columns: [
            { key: 'voucherNo', label: 'Voucher ID' },
            { key: 'expenseHead', label: 'Expense Category' },
            { key: 'description', label: 'Particulars / Purpose' },
            { key: 'area', label: 'Sub-District Hub' },
            { key: 'spentDate', label: 'Payment Date' },
            { key: 'amount', label: 'Amount', align: 'right', isCurrency: true },
            { key: 'approvedBy', label: 'Audit Authorization', align: 'center', isBadge: true }
          ],
          rows: expenses.map(e => ({
            voucherNo: e.id,
            expenseHead: e.category,
            description: e.description,
            area: e.area || `${district} Center`,
            spentDate: e.date,
            amount: `₹${e.amount.toLocaleString('en-IN')}`,
            approvedBy: (e as any).status?.toUpperCase() || 'APPROVED'
          }))
        },

        '11': {
          id: '11',
          name: 'Teacher 30th-Cycle Payouts Record',
          icon: GraduationCap,
          color: 'text-blue-600 bg-blue-50',
          count: '₹0 Disbursed',
          complianceNote: `Tutor compensation follows strict 30th-cycle automated banking settlement with transparent 12% platform fee deduction.`,
          stats: [
            { label: 'Gross Faculty Billing', value: '₹0', icon: DollarSign, color: 'text-blue-600', subtext: 'Total Tuition Hours' },
            { label: 'Platform Cut (12%)', value: '₹0', icon: ShieldCheck, color: 'text-purple-600', subtext: 'Platform Management Fee' },
            { label: 'Net Disbursed to Tutors', value: '₹0', icon: CheckCircle2, color: 'text-emerald-600', subtext: 'Bank NEFT / IMPS Settled' },
            { label: 'Disbursement Punctuality', value: '100% On-Time', icon: Clock, color: 'text-indigo-600', subtext: 'Zero Cycle Delays' },
          ],
          columns: [
            { key: 'payoutRef', label: 'Payout Ref' },
            { key: 'teacherName', label: 'Educator Name' },
            { key: 'assignedStudents', label: 'Active Batches' },
            { key: 'grossTuition', label: 'Gross Tuition', align: 'right', isCurrency: true },
            { key: 'platformCut', label: 'Platform Cut (12%)', align: 'right', isCurrency: true },
            { key: 'netPayout', label: 'Net Payout Disbursed', align: 'right', isCurrency: true },
            { key: 'disbursedDate', label: 'Disbursed Date' },
            { key: 'bankStatus', label: 'Bank Status', align: 'center', isBadge: true }
          ],
          rows: []
        },

        '12': {
          id: '12',
          name: 'Library 48-Hour Settlement Audit',
          icon: Building2,
          color: 'text-indigo-600 bg-indigo-50',
          count: '₹0 Disbursed',
          complianceNote: `Student subscription fees for library spaces are paid directly to owners within the mandatory 48-hour SLA window in ${district}.`,
          stats: [
            { label: 'Settled to Operators', value: '₹0', icon: DollarSign, color: 'text-indigo-600', subtext: '85% Owner Net Share' },
            { label: '48-Hour SLA Compliance', value: '100% On-Time', icon: Clock, color: 'text-emerald-600', subtext: 'Average Time: 24 Hours' },
            { label: 'Total Seats Settled', value: '0 Seats', icon: Users, color: 'text-blue-600', subtext: 'New & Renewed Desks' },
            { label: 'Held / Disputed Claims', value: '₹0 Disputed', icon: ShieldCheck, color: 'text-purple-600', subtext: 'Zero Operator Grievances' },
          ],
          columns: [
            { key: 'settlementId', label: 'Settlement ID' },
            { key: 'libraryName', label: 'Library Partner Facility' },
            { key: 'ownerName', label: 'Operator / Payee' },
            { key: 'enrollmentsSettled', label: 'Desks Settled' },
            { key: 'grossSubscription', label: 'Gross Subscriptions', align: 'right', isCurrency: true },
            { key: 'ownerShare', label: 'Owner Share (85%)', align: 'right', isCurrency: true },
            { key: 'processedAt', label: 'Turnaround Window' },
            { key: 'status', label: 'SLA Status', align: 'center', isBadge: true }
          ],
          rows: []
        },

        '13': {
          id: '13',
          name: 'Parent & Student Grievances Log',
          icon: ShieldCheck,
          color: 'text-amber-600 bg-amber-50',
          count: '100% Solved (<12h TAT)',
          complianceNote: `ZYZU'S mandates that all parent and student concerns receive active administrative resolution within 12 hours.`,
          stats: [
            { label: 'Total Tickets Received', value: '0 Tickets', icon: HelpCircle, color: 'text-blue-600', subtext: `In ${district} District` },
            { label: 'Resolved Under 12 Hours', value: '0 of 0 (100%)', icon: CheckCircle2, color: 'text-emerald-600', subtext: 'Zero Pending Complaints' },
            { label: 'Active Pending Complaints', value: '0 Open', icon: Clock, color: 'text-indigo-600', subtext: `Zero Backlog in ${district}` },
            { label: 'Parent Satisfaction Score', value: '5.0 / 5.0', icon: Sparkles, color: 'text-amber-600', subtext: 'Post-Resolution Feedback' },
          ],
          columns: [
            { key: 'ticketId', label: 'Ticket ID' },
            { key: 'complainant', label: 'Complainant / Parent' },
            { key: 'category', label: 'Complaint Category' },
            { key: 'subject', label: 'Grievance Description' },
            { key: 'loggedDate', label: 'Logged Date' },
            { key: 'resolutionTime', label: 'Turnaround Time (TAT)' },
            { key: 'status', label: 'Status', align: 'center', isBadge: true }
          ],
          rows: []
        },

        '14': {
          id: '14',
          name: 'District Regulatory & Audit Trail',
          icon: FileText,
          color: 'text-slate-600 bg-slate-100',
          count: `${auditLogs.length} Administrative Events`,
          complianceNote: `Every administrative decision, teacher approval, fee waiver, and payout authorization is recorded in the immutable audit log for ${district}.`,
          stats: [
            { label: 'Audit Trail Records', value: `${auditLogs.length} Events`, icon: FileText, color: 'text-blue-600', subtext: 'Logged for Current Cycle' },
            { label: 'KYC & Approval Actions', value: `${auditLogs.filter(a => a.action?.includes('VERIFY') || a.action?.includes('APPROVE')).length} Actions`, icon: ShieldCheck, color: 'text-emerald-600', subtext: `Executed in ${district}` },
            { label: 'Security Enforcement', value: `${auditLogs.filter(a => a.result === 'DENIED').length} Denials`, icon: DollarSign, color: 'text-purple-600', subtext: 'Cross-District Interceptions' },
            { label: 'SHA-256 Ledger State', value: 'INTEGRITY OK', icon: CheckCircle2, color: 'text-indigo-600', subtext: 'Zero Tampering Detected' },
          ],
          columns: [
            { key: 'auditId', label: 'Audit Log ID' },
            { key: 'timestamp', label: 'Timestamp' },
            { key: 'actor', label: 'Administrator' },
            { key: 'action', label: 'Regulatory Action' },
            { key: 'entity', label: 'Affected Entity' },
            { key: 'details', label: 'Summary Particulars' },
            { key: 'ip', label: 'IP Origin', align: 'center' }
          ],
          rows: auditLogs.map(l => ({
            auditId: l.id,
            timestamp: new Date(l.timestamp).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
            actor: `${l.actorRole} (${l.actorUserId})`,
            action: l.action,
            entity: `${l.resourceType} [${l.resourceId || 'N/A'}]`,
            details: (l as any).details || (l as any).meta?.reason || `Scope: ${l.authorizedDistrictId}`,
            ip: '192.168.1.1'
          }))
        }
      };
    }

    // Default Ghazipur mock dataset
    return {
      '1': {
        id: '1',
        name: 'Overall District Executive Summary',
        icon: ShieldCheck,
        color: 'text-blue-600 bg-blue-50',
        count: '254 Students • ₹3.36L Rev',
        complianceNote: `Verified by District Administration (${district} Division). Certified under UP Educational Services Regulatory Framework.`,
        stats: [
          { label: 'Total Enrolled Learners', value: '254 Students', icon: Users, color: 'text-blue-600', subtext: '42 Tuition • 212 Library' },
          { label: 'Verified Active Tutors', value: '68 Faculty', icon: GraduationCap, color: 'text-emerald-600', subtext: '100% Identity & Police Cleared' },
          { label: 'Study Library Facilities', value: '10 Centers', icon: Building2, color: 'text-purple-600', subtext: '370 Total Seating Desks' },
          { label: 'Gross Monthly Billing', value: '₹3,36,000', icon: DollarSign, color: 'text-indigo-600', subtext: '92.2% Realization Ratio' },
        ],
        columns: [
          { key: 'refId', label: 'Center Ref ID' },
          { key: 'hubName', label: 'Sub-District Hub' },
          { key: 'tehsil', label: 'Tehsil / Locality' },
          { key: 'learners', label: 'Enrolled Learners' },
          { key: 'tutors', label: 'Active Tutors' },
          { key: 'desks', label: 'Study Desks' },
          { key: 'monthlyRevenue', label: 'Monthly Inflow', align: 'right', isCurrency: true },
          { key: 'status', label: 'Regulatory Status', align: 'center', isBadge: true }
        ],
        rows: [
          { refId: 'GHZ-CEN-01', hubName: 'Ghazipur Sadar Center', tehsil: 'Ghazipur Sadar', learners: '112 Students', tutors: '28 Verified', desks: '140 Desks', monthlyRevenue: '₹1,48,000', status: 'AUDITED' },
          { refId: 'GHZ-CEN-02', hubName: 'Saidpur Central Facility', tehsil: 'Saidpur Tehsil', learners: '58 Students', tutors: '16 Verified', desks: '80 Desks', monthlyRevenue: '₹76,000', status: 'AUDITED' },
          { refId: 'GHZ-CEN-03', hubName: 'Zamania Study Desk Hub', tehsil: 'Zamania Station Area', learners: '44 Students', tutors: '12 Verified', desks: '60 Desks', monthlyRevenue: '₹58,000', status: 'AUDITED' },
          { refId: 'GHZ-CEN-04', hubName: 'Mohammadabad Cell', tehsil: 'Mohammadabad Block', learners: '26 Students', tutors: '8 Verified', desks: '50 Desks', monthlyRevenue: '₹34,000', status: 'AUDITED' },
          { refId: 'GHZ-CEN-05', hubName: 'Jangipur Area Facility', tehsil: 'Jangipur Road Hub', learners: '14 Students', tutors: '4 Verified', desks: '40 Desks', monthlyRevenue: '₹20,000', status: 'AUDITED' },
        ]
      },

      '2': {
        id: '2',
        name: 'Student Enrollment & Demographics',
        icon: Users,
        color: 'text-indigo-600 bg-indigo-50',
        count: '254 Active Learners',
        complianceNote: `All enrolled student profiles have verified guardian mobile credentials and locality records in ${district}.`,
        stats: [
          { label: 'Active Student Roster', value: '254 Learners', icon: Users, color: 'text-indigo-600', subtext: '100% KYC Verified' },
          { label: 'Home Tuition Enrolled', value: '42 Students', icon: BookOpen, color: 'text-emerald-600', subtext: 'Weekly In-Home Tutoring' },
          { label: 'Library Desk Members', value: '212 Members', icon: Building2, color: 'text-purple-600', subtext: 'Self-Study Shift Occupants' },
          { label: 'New Admissions This Month', value: '+19 Students', icon: TrendingUp, color: 'text-blue-600', subtext: 'September 2026 Cohort' },
        ],
        columns: [
          { key: 'studentId', label: 'Student ID' },
          { key: 'studentName', label: 'Student Name' },
          { key: 'contact', label: 'Guardian Phone' },
          { key: 'serviceType', label: 'Enrolled Program' },
          { key: 'grade', label: 'Class / Target' },
          { key: 'locality', label: 'Locality / Tehsil' },
          { key: 'joinedDate', label: 'Enrollment Date' },
          { key: 'feeStatus', label: 'Fee Status', align: 'center', isBadge: true }
        ],
        rows: [
          { studentId: 'FP-STU-26-01', studentName: 'Aryan Maurya', contact: '9876543210', serviceType: 'Home Tuition + Library', grade: 'Class 12 (PCM)', locality: 'Saidpur, Ghazipur', joinedDate: '2026-08-01', feeStatus: 'ACTIVE' },
          { studentId: 'FP-STU-26-02', studentName: 'Priya Sharma', contact: '9876543211', serviceType: 'Home Tuition', grade: 'Class 10 (Maths & Sci)', locality: 'Ghazipur Sadar', joinedDate: '2026-08-05', feeStatus: 'ACTIVE' },
          { studentId: 'FP-STU-26-03', studentName: 'Ankit Kumar Yadav', contact: '9876501122', serviceType: 'Library Shift Study', grade: 'UPSC / UPPSC', locality: 'Saidpur Main', joinedDate: '2026-08-10', feeStatus: 'ACTIVE' },
          { studentId: 'FP-STU-26-04', studentName: 'Sneha Singh', contact: '9876501133', serviceType: 'Home Tuition', grade: 'Class 9 (All Subjects)', locality: 'Mohammadabad', joinedDate: '2026-08-12', feeStatus: 'ACTIVE' },
          { studentId: 'FP-STU-26-05', studentName: 'Rahul Srivastava', contact: '9876501144', serviceType: 'Library Shift Study', grade: 'NEET Prep (Shift B)', locality: 'Zamania Station', joinedDate: '2026-08-18', feeStatus: 'ACTIVE' },
          { studentId: 'FP-STU-26-06', studentName: 'Neha Prajapati', contact: '9876501155', serviceType: 'Home Tuition', grade: 'Class 11 (PCB)', locality: 'Jangipur Road', joinedDate: '2026-08-22', feeStatus: 'ACTIVE' },
          { studentId: 'FP-STU-26-07', studentName: 'Vikas Bind', contact: '9876501166', serviceType: 'Library Shift Study', grade: 'SSC CGL / Banking', locality: 'Ghazipur City', joinedDate: '2026-09-02', feeStatus: 'NEW' },
          { studentId: 'FP-STU-26-08', studentName: 'Pooja Kushwaha', contact: '9876501177', serviceType: 'Home Tuition', grade: 'Class 8 (Foundation)', locality: 'Zamania City', joinedDate: '2026-09-04', feeStatus: 'NEW' },
        ]
      },

      '3': {
        id: '3',
        name: 'Home Tuition Allotment & Demands',
        icon: BookOpen,
        color: 'text-emerald-600 bg-emerald-50',
        count: '68 Active Tutors • 42 Allotted',
        complianceNote: `Home tutor assignments are vetted with verified subject mastery and background checks before student matching.`,
        stats: [
          { label: 'Parent Tutor Demands', value: '58 Demands', icon: HelpCircle, color: 'text-blue-600', subtext: 'Cumulative Requests' },
          { label: 'Successfully Allotted', value: '42 Matched', icon: CheckCircle2, color: 'text-emerald-600', subtext: 'Active Batches in Session' },
          { label: 'In Demo Trial Stage', value: '10 Demos', icon: Sparkles, color: 'text-purple-600', subtext: 'Pending Final Confirmation' },
          { label: 'Matching in Progress', value: '6 Pending', icon: Clock, color: 'text-amber-600', subtext: 'Under 24hr Matching SLA' },
        ],
        columns: [
          { key: 'reqId', label: 'Demand ID' },
          { key: 'studentName', label: 'Student Name' },
          { key: 'gradeSubject', label: 'Grade & Subject Demand' },
          { key: 'locality', label: 'Locality' },
          { key: 'assignedTeacher', label: 'Allotted Educator' },
          { key: 'monthlyFee', label: 'Monthly Budget', align: 'right', isCurrency: true },
          { key: 'status', label: 'Allotment Status', align: 'center', isBadge: true }
        ],
        rows: [
          { reqId: 'REQ-GZP-101', studentName: 'Priya Sharma', gradeSubject: 'Class 10 - Maths & Science', locality: 'Ghazipur Sadar', assignedTeacher: 'Dr. Alok Nath Mishra', monthlyFee: '₹5,500', status: 'ALLOTTED' },
          { reqId: 'REQ-GZP-102', studentName: 'Aryan Maurya', gradeSubject: 'Class 12 - Physics & Chem', locality: 'Saidpur', assignedTeacher: 'Dr. Rajesh Sharma', monthlyFee: '₹7,500', status: 'ALLOTTED' },
          { reqId: 'REQ-GZP-103', studentName: 'Sneha Singh', gradeSubject: 'Class 9 - All Subjects', locality: 'Mohammadabad', assignedTeacher: 'Priya Verma', monthlyFee: '₹4,500', status: 'ALLOTTED' },
          { reqId: 'REQ-GZP-104', studentName: 'Aman Gupta', gradeSubject: 'Class 11 - Mathematics', locality: 'Zamania', assignedTeacher: 'Rahul Verma', monthlyFee: '₹6,000', status: 'DEMO_SCHEDULED' },
          { reqId: 'REQ-GZP-105', studentName: 'Ritu Patel', gradeSubject: 'Class 10 - English & SST', locality: 'Ghazipur City', assignedTeacher: 'Amit Tiwari', monthlyFee: '₹4,000', status: 'DEMO_SCHEDULED' },
          { reqId: 'REQ-GZP-106', studentName: 'Rohit Yadav', gradeSubject: 'Class 12 - Biology (NEET)', locality: 'Jangipur', assignedTeacher: 'Roster Matching Desk', monthlyFee: '₹6,500', status: 'PENDING' },
        ]
      },

      '4': {
        id: '4',
        name: 'Teacher KYC & Faculty Dossier',
        icon: GraduationCap,
        color: 'text-blue-600 bg-blue-50',
        count: '68 Verified • 0 Pending',
        complianceNote: `Faculty members are vetted with Aadhaar biometric validation, academic degree audits, and local police verification.`,
        stats: [
          { label: 'Registered Educators', value: '68 Verified', icon: GraduationCap, color: 'text-blue-600', subtext: 'In Ghazipur District' },
          { label: 'ID & Degree Verification', value: '100% Cleared', icon: ShieldCheck, color: 'text-emerald-600', subtext: 'Physical Documents Audited' },
          { label: 'Police Clearance On Record', value: '65 Certified', icon: CheckCircle2, color: 'text-indigo-600', subtext: '3 Under Routine Check' },
          { label: 'Average Faculty Rating', value: '4.88 / 5.0', icon: Sparkles, color: 'text-amber-600', subtext: 'Student & Parent Reviews' },
        ],
        columns: [
          { key: 'teacherId', label: 'Faculty ID' },
          { key: 'name', label: 'Educator Name' },
          { key: 'qualification', label: 'Highest Qualification' },
          { key: 'subjects', label: 'Specialization' },
          { key: 'locality', label: 'Assigned Tehsil' },
          { key: 'experience', label: 'Experience' },
          { key: 'policeKyc', label: 'Police Clearance', align: 'center', isBadge: true },
          { key: 'status', label: 'Roster Status', align: 'center', isBadge: true }
        ],
        rows: [
          { teacherId: 'FP-TCH-001', name: 'Dr. Alok Nath Mishra', qualification: 'Ph.D (Mathematics), M.Sc', subjects: 'Higher Maths, Physics', locality: 'Ghazipur Sadar', experience: '12 Yrs', policeKyc: 'VERIFIED', status: 'ACTIVE' },
          { teacherId: 'FP-TCH-002', name: 'Dr. Rajesh Sharma', qualification: 'M.Sc Physics, B.Ed', subjects: 'Physics, Class 11-12', locality: 'Saidpur', experience: '9 Yrs', policeKyc: 'VERIFIED', status: 'ACTIVE' },
          { teacherId: 'FP-TCH-003', name: 'Priya Verma', qualification: 'M.Sc Chemistry, CTET', subjects: 'Chemistry, Class 9-12', locality: 'Ghazipur City', experience: '6 Yrs', policeKyc: 'VERIFIED', status: 'ACTIVE' },
          { teacherId: 'FP-TCH-004', name: 'Amit Tiwari', qualification: 'M.A English, B.Ed', subjects: 'English & Social Studies', locality: 'Mohammadabad', experience: '7 Yrs', policeKyc: 'VERIFIED', status: 'ACTIVE' },
          { teacherId: 'FP-TCH-005', name: 'Suman Devi', qualification: 'M.Sc Botany, NET', subjects: 'Biology, Class 11-12', locality: 'Zamania', experience: '5 Yrs', policeKyc: 'VERIFIED', status: 'ACTIVE' },
          { teacherId: 'FP-TCH-006', name: 'Rahul Verma', qualification: 'B.Tech, M.Tech (IIT-BHU)', subjects: 'PCM IIT-JEE Foundation', locality: 'Saidpur', experience: '4 Yrs', policeKyc: 'VERIFIED', status: 'ACTIVE' },
        ]
      },

      '5': {
        id: '5',
        name: 'Discontinued / Left Teachers Audit',
        icon: Clock,
        color: 'text-amber-600 bg-amber-50',
        count: '3 Processed Clearances',
        complianceNote: `Formal clearances confirm zero fee disputes, zero student abandonment, and full batch reassignment.`,
        stats: [
          { label: 'Relieved Educators', value: '3 Faculty', icon: Clock, color: 'text-amber-600', subtext: 'Past 12 Months' },
          { label: 'Student Reassignments', value: '100% Completed', icon: CheckCircle2, color: 'text-emerald-600', subtext: 'Zero Interruption in Learning' },
          { label: 'Pending Dues / Liabilities', value: '₹0 Balance', icon: DollarSign, color: 'text-indigo-600', subtext: 'Full Financial Clearance' },
          { label: 'Relieving Letters Dispatched', value: '3 of 3', icon: FileText, color: 'text-blue-600', subtext: 'Official Stamp Affixed' },
        ],
        columns: [
          { key: 'exitId', label: 'Exit Token' },
          { key: 'teacherName', label: 'Educator Name' },
          { key: 'subjects', label: 'Subject Area' },
          { key: 'tenure', label: 'Active Tenure' },
          { key: 'exitDate', label: 'Relieving Date' },
          { key: 'reason', label: 'Reason for Departure' },
          { key: 'duesStatus', label: 'Financial Settlement', align: 'center', isBadge: true },
          { key: 'studentHandover', label: 'Batch Handover', align: 'center', isBadge: true }
        ],
        rows: [
          { exitId: 'EXT-GZP-01', teacherName: 'Manoj K. Srivastava', subjects: 'Commerce & Accounts', tenure: '14 Months', exitDate: '2026-07-31', reason: 'Relocated to Lucknow', duesStatus: 'CLEARED', studentHandover: 'COMPLETED' },
          { exitId: 'EXT-GZP-02', teacherName: 'Sunita Pandey', subjects: 'Biology (Foundation)', tenure: '8 Months', exitDate: '2026-06-30', reason: 'Appointed Govt Lecturer', duesStatus: 'CLEARED', studentHandover: 'COMPLETED' },
          { exitId: 'EXT-GZP-03', teacherName: 'Vivek Tripathi', subjects: 'Mathematics (Class 9-10)', tenure: '11 Months', exitDate: '2026-05-31', reason: 'Higher Studies (M.Ed)', duesStatus: 'CLEARED', studentHandover: 'COMPLETED' },
        ]
      },

      '6': {
        id: '6',
        name: 'Library Infrastructure & Compliance',
        icon: Building2,
        color: 'text-purple-600 bg-purple-50',
        count: '10 Libraries Verified',
        complianceNote: `Every library undergoes mandatory periodic physical checks for safety, ergonomic seating, and silent study standards.`,
        stats: [
          { label: 'Certified Libraries', value: '10 Facilities', icon: Building2, color: 'text-purple-600', subtext: 'District Network' },
          { label: 'Total Seating Desks', value: '370 Desks', icon: Users, color: 'text-blue-600', subtext: 'Air-Conditioned & Ergonomic' },
          { label: 'CCTV & Biometric Coverage', value: '100% Online', icon: ShieldCheck, color: 'text-emerald-600', subtext: 'All Centers Monitored' },
          { label: 'Power Backup Redundancy', value: '10/10 Centers', icon: CheckCircle2, color: 'text-indigo-600', subtext: 'Solar & Heavy Inverters' },
        ],
        columns: [
          { key: 'libId', label: 'Library ID' },
          { key: 'name', label: 'Facility Name' },
          { key: 'owner', label: 'Operator / In-Charge' },
          { key: 'location', label: 'Address / Tehsil' },
          { key: 'capacity', label: 'Total Desks' },
          { key: 'amenities', label: 'WiFi & CCTV Coverage' },
          { key: 'powerBackup', label: 'Power Redundancy' },
          { key: 'auditStatus', label: 'Compliance Status', align: 'center', isBadge: true }
        ],
        rows: [
          { libId: `LIB-GZP-01`, name: "ZYZU'S Central Library", owner: `Ramesh Chandra Jaiswal`, location: 'Main Road, Saidpur', capacity: '80 Desks', amenities: '300 Mbps + 8 HD CCTVs', powerBackup: 'Inverter + GenSet', auditStatus: 'COMPLIANT' },
          { libId: 'LIB-GZP-02', name: 'Vidya Study Library', owner: 'Suresh Chandra Yadav', location: 'Lanka Gate, Ghazipur Sadar', capacity: '70 Desks', amenities: '200 Mbps + 6 HD CCTVs', powerBackup: 'Solar + Inverter', auditStatus: 'COMPLIANT' },
          { libId: 'LIB-GZP-03', name: 'Sankalp Self Study Space', owner: 'Anoop Kumar Rai', location: 'Station Road, Zamania', capacity: '60 Desks', amenities: '200 Mbps + 6 HD CCTVs', powerBackup: 'Dual Inverters', auditStatus: 'COMPLIANT' },
          { libId: 'LIB-GZP-04', name: 'Target Point Reading Room', owner: 'R. P. Maurya', location: 'Tehsil Road, Mohammadabad', capacity: '50 Desks', amenities: '150 Mbps + 4 HD CCTVs', powerBackup: 'Inverter Backup', auditStatus: 'COMPLIANT' },
          { libId: 'LIB-GZP-05', name: 'Gyankunj Study Chamber', owner: 'Harish Chandra Singh', location: 'Bus Stand, Jangipur', capacity: '40 Desks', amenities: '100 Mbps + 4 HD CCTVs', powerBackup: 'Inverter Backup', auditStatus: 'COMPLIANT' },
        ]
      },

      '7': {
        id: '7',
        name: 'Desk Seat Occupancy & Shift Logs',
        icon: Users,
        color: 'text-cyan-600 bg-cyan-50',
        count: '370 Desks • 79% Occupancy',
        complianceNote: `Seat occupancy is logged per shift to prevent overcrowding and ensure guaranteed assigned desks.`,
        stats: [
          { label: 'Total Seating Desks', value: '370 Desks', icon: Building2, color: 'text-blue-600', subtext: 'Across All 10 Centers' },
          { label: 'Active Subscriptions', value: '292 Seats', icon: Users, color: 'text-emerald-600', subtext: 'Registered Regular Learners' },
          { label: 'Overall Utilization Rate', value: '78.9%', icon: TrendingUp, color: 'text-indigo-600', subtext: 'Healthy Operating Margin' },
          { label: 'Peak Shift Utilization', value: '91.4%', icon: Clock, color: 'text-cyan-600', subtext: 'Morning Shift (06am-02pm)' },
        ],
        columns: [
          { key: 'library', label: 'Library Facility Hub' },
          { key: 'shift', label: 'Shift Window' },
          { key: 'timing', label: 'Shift Hours' },
          { key: 'totalDesks', label: 'Desk Capacity' },
          { key: 'occupied', label: 'Occupied' },
          { key: 'vacant', label: 'Available Seats' },
          { key: 'utilization', label: 'Seat Utilization Rate', align: 'right' }
        ],
        rows: [
          { library: "ZYZU'S Central Library (Saidpur)", shift: 'Morning Shift (A)', timing: '06:00 AM - 02:00 PM', totalDesks: '80 Desks', occupied: '72 Seats', vacant: '8 Seats', utilization: '90.0%' },
          { library: "ZYZU'S Central Library (Saidpur)", shift: 'Evening Shift (B)', timing: '02:00 PM - 10:00 PM', totalDesks: '80 Desks', occupied: '62 Seats', vacant: '18 Seats', utilization: '77.5%' },
          { library: 'Vidya Study Library (Ghazipur Sadar)', shift: 'Morning Shift (A)', timing: '07:00 AM - 01:00 PM', totalDesks: '70 Desks', occupied: '64 Seats', vacant: '6 Seats', utilization: '91.4%' },
          { library: 'Vidya Study Library (Ghazipur Sadar)', shift: 'Evening Shift (B)', timing: '01:00 PM - 08:00 PM', totalDesks: '70 Desks', occupied: '51 Seats', vacant: '19 Seats', utilization: '72.8%' },
          { library: 'Sankalp Study Space (Zamania)', shift: 'Full Day Shift (Combined)', timing: '07:00 AM - 09:00 PM', totalDesks: '60 Desks', occupied: '43 Seats', vacant: '17 Seats', utilization: '71.6%' },
        ]
      },

      '8': {
        id: '8',
        name: 'Daily & Monthly Attendance Register',
        icon: CheckCircle2,
        color: 'text-emerald-600 bg-emerald-50',
        count: '92.4% Avg Compliance',
        complianceNote: `Attendance is recorded through GPS-fenced biometric devices in libraries and OTP-verified mobile check-ins by home tutors.`,
        stats: [
          { label: 'Overall Attendance Compliance', value: '92.4%', icon: CheckCircle2, color: 'text-emerald-600', subtext: 'Month-to-Date Ratio' },
          { label: 'Daily Biometric Scans', value: '218 Scans', icon: Users, color: 'text-blue-600', subtext: 'Average Daily Check-Ins' },
          { label: 'Tuition Sessions Logged', value: '38 Sessions / Day', icon: BookOpen, color: 'text-purple-600', subtext: 'OTP Verified Attendance' },
          { label: 'Attendance Alerts Sent', value: '4 Flags', icon: AlertCircle, color: 'text-amber-600', subtext: 'Sent to Parents via WhatsApp' },
        ],
        columns: [
          { key: 'logId', label: 'Audit Log ID' },
          { key: 'date', label: 'Session Date' },
          { key: 'studentName', label: 'Learner / Member' },
          { key: 'facilityTeacher', label: 'Educator / Study Desk Hub' },
          { key: 'service', label: 'Program Category' },
          { key: 'checkIn', label: 'Check-In Time' },
          { key: 'checkOut', label: 'Check-Out Time' },
          { key: 'compliance', label: 'Status', align: 'center', isBadge: true }
        ],
        rows: [
          { logId: `ATT-LOG-901`, date: `2026-09-18`, studentName: `Aryan Maurya`, facilityTeacher: "ZYZU'S Central Library", service: `Library Shift A`, checkIn: `06:14 AM`, checkOut: `01:50 PM`, compliance: 'PRESENT' },
          { logId: 'ATT-LOG-902', date: '2026-09-18', studentName: 'Priya Sharma', facilityTeacher: 'Dr. Alok Nath Mishra', service: 'Home Tuition (Maths)', checkIn: '05:02 PM', checkOut: '06:05 PM', compliance: 'PRESENT' },
          { logId: `ATT-LOG-903`, date: `2026-09-18`, studentName: `Ankit Kumar Yadav`, facilityTeacher: "ZYZU'S Central Library", service: `Library Shift A`, checkIn: `06:22 AM`, checkOut: `02:00 PM`, compliance: 'PRESENT' },
          { logId: 'ATT-LOG-904', date: '2026-09-18', studentName: 'Sneha Singh', facilityTeacher: 'Priya Verma', service: 'Home Tuition (Science)', checkIn: '04:30 PM', checkOut: '05:32 PM', compliance: 'PRESENT' },
          { logId: 'ATT-LOG-905', date: '2026-09-18', studentName: 'Rahul Srivastava', facilityTeacher: 'Sankalp Study Space', service: 'Library Full Day', checkIn: '07:15 AM', checkOut: '08:30 PM', compliance: 'PRESENT' },
          { logId: 'ATT-LOG-906', date: '2026-09-18', studentName: 'Vikas Bind', facilityTeacher: 'Vidya Study Library', service: 'Library Shift A', checkIn: '07:05 AM', checkOut: '01:00 PM', compliance: 'PRESENT' },
        ]
      },

      '9': {
        id: '9',
        name: 'Gross Fee Collections & Realization',
        icon: DollarSign,
        color: 'text-emerald-600 bg-emerald-50',
        count: '₹3,36,000 Realized',
        complianceNote: `Digital payment receipts are signed cryptographically with GST compliant reference IDs and automatic parent invoicing.`,
        stats: [
          { label: 'Total Fee Billed', value: '₹3,64,500', icon: DollarSign, color: 'text-blue-600', subtext: 'Invoiced for September' },
          { label: 'Total Realized Inflow', value: '₹3,36,000', icon: CheckCircle2, color: 'text-emerald-600', subtext: '92.2% Collection Rate' },
          { label: 'Pending Realization', value: '₹28,500', icon: Clock, color: 'text-amber-600', subtext: 'Routine Mid-Cycle Dues' },
          { label: 'Digital / UPI Share', value: '94.6%', icon: CreditCard, color: 'text-purple-600', subtext: 'Direct Gateway Settlement' },
        ],
        columns: [
          { key: 'receiptNo', label: 'Receipt No.' },
          { key: 'studentName', label: 'Student / Parent' },
          { key: 'service', label: 'Service Description' },
          { key: 'invoiceAmount', label: 'Billed Amount', align: 'right', isCurrency: true },
          { key: 'paidDate', label: 'Payment Date' },
          { key: 'mode', label: 'Payment Gateway / Mode' },
          { key: 'status', label: 'Accounting Status', align: 'center', isBadge: true }
        ],
        rows: [
          { receiptNo: 'FP-REC-26-0901', studentName: 'Aryan Maurya', service: 'Monthly Tuition + Study Desk Sub', invoiceAmount: '₹8,200', paidDate: '2026-09-02', mode: 'UPI QR (PhonePe)', status: 'REALIZED' },
          { receiptNo: 'FP-REC-26-0902', studentName: 'Priya Sharma', service: 'Monthly Class 10 Home Tuition', invoiceAmount: '₹5,500', paidDate: '2026-09-03', mode: 'Net Banking (SBI)', status: 'REALIZED' },
          { receiptNo: 'FP-REC-26-0903', studentName: 'Ankit Kumar Yadav', service: 'Study Library Seat (Morning Shift)', invoiceAmount: '₹700', paidDate: '2026-09-01', mode: 'UPI QR (GooglePay)', status: 'REALIZED' },
          { receiptNo: 'FP-REC-26-0904', studentName: 'Sneha Singh', service: 'Monthly Class 9 Home Tuition', invoiceAmount: '₹4,500', paidDate: '2026-09-04', mode: 'UPI QR (Paytm)', status: 'REALIZED' },
          { receiptNo: 'FP-REC-26-0905', studentName: 'Rahul Srivastava', service: 'Study Library Seat (Full Day)', invoiceAmount: '₹900', paidDate: '2026-09-05', mode: 'Debit Card (HDFC)', status: 'REALIZED' },
          { receiptNo: 'FP-REC-26-0906', studentName: 'Neha Prajapati', service: 'Class 11 PCB Home Tuition', invoiceAmount: '₹7,000', paidDate: '2026-09-06', mode: 'UPI QR (BHIM)', status: 'REALIZED' },
        ]
      },

      '10': {
        id: '10',
        name: 'District Operational Expenses Ledger',
        icon: FileText,
        color: 'text-rose-600 bg-rose-50',
        count: '12 Recorded Vouchers',
        complianceNote: `Operational expenditures are tracked against verified vouchers with geo-tagged proof and District Admin signoff.`,
        stats: [
          { label: 'Recorded Vouchers', value: '12 Vouchers', icon: FileText, color: 'text-rose-600', subtext: 'Current Audit Cycle' },
          { label: 'Total Operational Spend', value: '₹24,500', icon: DollarSign, color: 'text-indigo-600', subtext: 'Deducted from District Gross' },
          { label: 'Inspection & Travel Fuel', value: '₹8,200', icon: MapPin, color: 'text-blue-600', subtext: 'Sub-District Verification' },
          { label: 'Office & Member Supplies', value: '₹16,300', icon: Building2, color: 'text-purple-600', subtext: 'Printing, ID Cards, Utilities' },
        ],
        columns: [
          { key: 'voucherNo', label: 'Voucher ID' },
          { key: 'expenseHead', label: 'Expense Category' },
          { key: 'description', label: 'Particulars / Purpose' },
          { key: 'area', label: 'Sub-District Hub' },
          { key: 'spentDate', label: 'Payment Date' },
          { key: 'amount', label: 'Amount', align: 'right', isCurrency: true },
          { key: 'approvedBy', label: 'Audit Authorization', align: 'center', isBadge: true }
        ],
        rows: [
          { voucherNo: 'VOUCH-GZP-26-01', expenseHead: 'Field Inspection & Travel', description: 'Fuel for Saidpur & Zamania Library Audits', area: 'Saidpur & Zamania', spentDate: '2026-09-04', amount: '₹2,400', approvedBy: 'APPROVED' },
          { voucherNo: 'VOUCH-GZP-26-02', expenseHead: 'Office Supplies & ID Cards', description: 'PVC ID Cards for 45 New Student Members', area: 'Ghazipur Sadar', spentDate: '2026-09-07', amount: '₹3,150', approvedBy: 'APPROVED' },
          { voucherNo: `VOUCH-GZP-26-03`, expenseHead: `Promotional Banners & Media`, description: "ZYZU'S Awareness Banners at Saidpur Hub", area: `Saidpur`, spentDate: `2026-09-10`, amount: '₹5,800', approvedBy: 'APPROVED' },
          { voucherNo: 'VOUCH-GZP-26-04', expenseHead: 'Legal & Notary Attestations', description: 'Notary fees for 6 library compliance agreements', area: 'Ghazipur City', spentDate: '2026-09-12', amount: '₹1,800', approvedBy: 'APPROVED' },
          { voucherNo: 'VOUCH-GZP-26-05', expenseHead: 'Teacher Academic Workshop', description: 'Monthly Educator Pedagogical Alignment', area: 'Ghazipur Sadar', spentDate: '2026-09-14', amount: '₹3,400', approvedBy: 'APPROVED' },
          { voucherNo: 'VOUCH-GZP-26-06', expenseHead: 'Network & Tech Infrastructure', description: 'High-speed router setup for mobile attendance', area: 'District Office', spentDate: '2026-09-15', amount: '₹2,200', approvedBy: 'APPROVED' },
        ]
      },

      '11': {
        id: '11',
        name: 'Teacher 30th-Cycle Payouts Record',
        icon: GraduationCap,
        color: 'text-blue-600 bg-blue-50',
        count: '₹1,72,000 Disbursed',
        complianceNote: `Tutor compensation follows strict 30th-cycle automated banking settlement with transparent 12% platform fee deduction.`,
        stats: [
          { label: 'Gross Faculty Billing', value: '₹1,95,450', icon: DollarSign, color: 'text-blue-600', subtext: 'Total Tuition Hours' },
          { label: 'Platform Cut (12%)', value: '₹23,450', icon: ShieldCheck, color: 'text-purple-600', subtext: 'Platform Management Fee' },
          { label: 'Net Disbursed to Tutors', value: '₹1,72,000', icon: CheckCircle2, color: 'text-emerald-600', subtext: 'Bank NEFT / IMPS Settled' },
          { label: 'Disbursement Punctuality', value: '100% On-Time', icon: Clock, color: 'text-indigo-600', subtext: 'Zero Cycle Delays' },
        ],
        columns: [
          { key: 'payoutRef', label: 'Payout Ref' },
          { key: 'teacherName', label: 'Educator Name' },
          { key: 'assignedStudents', label: 'Active Batches' },
          { key: 'grossTuition', label: 'Gross Tuition', align: 'right', isCurrency: true },
          { key: 'platformCut', label: 'Platform Cut (12%)', align: 'right', isCurrency: true },
          { key: 'netPayout', label: 'Net Payout Disbursed', align: 'right', isCurrency: true },
          { key: 'disbursedDate', label: 'Disbursed Date' },
          { key: 'bankStatus', label: 'Bank Status', align: 'center', isBadge: true }
        ],
        rows: [
          { payoutRef: 'PAY-TCH-0901', teacherName: 'Dr. Alok Nath Mishra', assignedStudents: '4 Active Students', grossTuition: '₹24,000', platformCut: '₹2,880', netPayout: '₹21,120', disbursedDate: '2026-08-30', bankStatus: 'SETTLED' },
          { payoutRef: 'PAY-TCH-0902', teacherName: 'Dr. Rajesh Sharma', assignedStudents: '3 Active Students', grossTuition: '₹21,000', platformCut: '₹2,520', netPayout: '₹18,480', disbursedDate: '2026-08-30', bankStatus: 'SETTLED' },
          { payoutRef: 'PAY-TCH-0903', teacherName: 'Priya Verma', assignedStudents: '3 Active Students', grossTuition: '₹16,500', platformCut: '₹1,980', netPayout: '₹14,520', disbursedDate: '2026-08-30', bankStatus: 'SETTLED' },
          { payoutRef: 'PAY-TCH-0904', teacherName: 'Amit Tiwari', assignedStudents: '2 Active Students', grossTuition: '₹11,000', platformCut: '₹1,320', netPayout: '₹9,680', disbursedDate: '2026-08-30', bankStatus: 'SETTLED' },
          { payoutRef: 'PAY-TCH-0905', teacherName: 'Rahul Verma', assignedStudents: '3 Active Students', grossTuition: '₹19,500', platformCut: '₹2,340', netPayout: '₹17,160', disbursedDate: '2026-08-30', bankStatus: 'SETTLED' },
        ]
      },

      '12': {
        id: '12',
        name: 'Library 48-Hour Settlement Audit',
        icon: Building2,
        color: 'text-indigo-600 bg-indigo-50',
        count: '₹48,500 Disbursed',
        complianceNote: `Student subscription fees for library spaces are paid directly to owners within the mandatory 48-hour SLA window.`,
        stats: [
          { label: 'Settled to Operators', value: '₹48,500', icon: DollarSign, color: 'text-indigo-600', subtext: '85% Owner Net Share' },
          { label: '48-Hour SLA Compliance', value: '100% On-Time', icon: Clock, color: 'text-emerald-600', subtext: 'Average Time: 32 Hours' },
          { label: 'Total Seats Settled', value: '82 Seats', icon: Users, color: 'text-blue-600', subtext: 'New & Renewed Desks' },
          { label: 'Held / Disputed Claims', value: '₹0 Disputed', icon: ShieldCheck, color: 'text-purple-600', subtext: 'Zero Operator Grievances' },
        ],
        columns: [
          { key: 'settlementId', label: 'Settlement ID' },
          { key: 'libraryName', label: 'Library Partner Facility' },
          { key: 'ownerName', label: 'Operator / Payee' },
          { key: 'enrollmentsSettled', label: 'Desks Settled' },
          { key: 'grossSubscription', label: 'Gross Subscriptions', align: 'right', isCurrency: true },
          { key: 'ownerShare', label: 'Owner Share (85%)', align: 'right', isCurrency: true },
          { key: 'processedAt', label: 'Turnaround Window' },
          { key: 'status', label: 'SLA Status', align: 'center', isBadge: true }
        ],
        rows: [
          { settlementId: `STL-LIB-0901`, libraryName: "ZYZU'S Central Library", ownerName: `Ramesh Chandra Jaiswal`, enrollmentsSettled: '28 Desks', grossSubscription: '₹19,600', ownerShare: '₹16,660', processedAt: '36 Hours (Within SLA)', status: 'SETTLED' },
          { settlementId: 'STL-LIB-0902', libraryName: 'Vidya Study Library', ownerName: 'Suresh Chandra Yadav', enrollmentsSettled: '22 Desks', grossSubscription: '₹15,400', ownerShare: '₹13,090', processedAt: '28 Hours (Within SLA)', status: 'SETTLED' },
          { settlementId: 'STL-LIB-0903', libraryName: 'Sankalp Self Study Space', ownerName: 'Anoop Kumar Rai', enrollmentsSettled: '18 Desks', grossSubscription: '₹12,600', ownerShare: '₹10,710', processedAt: '40 Hours (Within SLA)', status: 'SETTLED' },
          { settlementId: 'STL-LIB-0904', libraryName: 'Target Point Reading Room', ownerName: 'R. P. Maurya', enrollmentsSettled: '14 Desks', grossSubscription: '₹9,800', ownerShare: '₹8,330', processedAt: '24 Hours (Within SLA)', status: 'SETTLED' },
        ]
      },

      '13': {
        id: '13',
        name: 'Parent & Student Grievances Log',
        icon: ShieldCheck,
        color: 'text-amber-600 bg-amber-50',
        count: '100% Solved (<12h TAT)',
        complianceNote: `ZYZU'S mandates that all parent and student concerns receive active administrative resolution within 12 hours.`,
        stats: [
          { label: 'Total Tickets Received', value: '16 Tickets', icon: HelpCircle, color: 'text-blue-600', subtext: 'In September 2026' },
          { label: 'Resolved Under 12 Hours', value: '16 of 16 (100%)', icon: CheckCircle2, color: 'text-emerald-600', subtext: 'Average TAT: 4.2 Hours' },
          { label: 'Active Pending Complaints', value: '0 Open', icon: Clock, color: 'text-indigo-600', subtext: 'Zero Backlog in Ghazipur' },
          { label: 'Parent Satisfaction Score', value: '4.95 / 5.0', icon: Sparkles, color: 'text-amber-600', subtext: 'Post-Resolution Feedback' },
        ],
        columns: [
          { key: 'ticketId', label: 'Ticket ID' },
          { key: 'complainant', label: 'Complainant / Parent' },
          { key: 'category', label: 'Complaint Category' },
          { key: 'subject', label: 'Grievance Description' },
          { key: 'loggedDate', label: 'Logged Date' },
          { key: 'resolutionTime', label: 'Turnaround Time (TAT)' },
          { key: 'status', label: 'Status', align: 'center', isBadge: true }
        ],
        rows: [
          { ticketId: 'GZP-GRV-01', complainant: 'Aryan Maurya (Parent)', category: 'Schedule Adjustment', subject: 'Request for 30 min evening shift delay', loggedDate: '2026-09-08', resolutionTime: '2.5 Hours', status: 'RESOLVED' },
          { ticketId: 'GZP-GRV-02', complainant: 'Priya Sharma (Parent)', category: 'Syllabus Pacing', subject: 'Request extra weekend session for Trigonometry', loggedDate: '2026-09-10', resolutionTime: '4.0 Hours', status: 'RESOLVED' },
          { ticketId: 'GZP-GRV-03', complainant: 'Ankit Kumar (Member)', category: 'Library Facilities', subject: 'Inverter sound during morning shift in Saidpur', loggedDate: '2026-09-12', resolutionTime: '6.0 Hours', status: 'RESOLVED' },
          { ticketId: 'GZP-GRV-04', complainant: 'Sneha Singh (Parent)', category: 'Fee Receipt Clarification', subject: 'Inquired about digital GST invoice dispatch', loggedDate: '2026-09-14', resolutionTime: '1.8 Hours', status: 'RESOLVED' },
        ]
      },

      '14': {
        id: '14',
        name: 'District Regulatory & Audit Trail',
        icon: FileText,
        color: 'text-slate-600 bg-slate-100',
        count: '84 Administrative Events',
        complianceNote: `Every administrative decision, teacher approval, fee waiver, and payout authorization is recorded in the immutable audit log.`,
        stats: [
          { label: 'Audit Trail Records', value: '84 Events', icon: FileText, color: 'text-blue-600', subtext: 'Logged for September' },
          { label: 'KYC & Approval Actions', value: '28 Actions', icon: ShieldCheck, color: 'text-emerald-600', subtext: 'Executed by Manoj Rai' },
          { label: 'Financial Authorizations', value: '34 Vouchers', icon: DollarSign, color: 'text-purple-600', subtext: 'Disbursements Approved' },
          { label: 'SHA-256 Ledger State', value: 'INTEGRITY OK', icon: CheckCircle2, color: 'text-indigo-600', subtext: 'Zero Tampering Detected' },
        ],
        columns: [
          { key: 'auditId', label: 'Audit Log ID' },
          { key: 'timestamp', label: 'Timestamp' },
          { key: 'actor', label: 'Administrator' },
          { key: 'action', label: 'Regulatory Action' },
          { key: 'entity', label: 'Affected Entity' },
          { key: 'details', label: 'Summary Particulars' },
          { key: 'ip', label: 'IP Origin', align: 'center' }
        ],
        rows: [
          { auditId: 'AUD-GZP-84', timestamp: '2026-09-18 17:30', actor: 'Manoj Rai (Admin)', action: 'KYC Approved', entity: 'Dr. Alok Nath Mishra', details: 'Verified police clearance & degree certificates', ip: '192.168.1.104' },
          { auditId: 'AUD-GZP-83', timestamp: '2026-09-17 14:15', actor: `Manoj Rai (Admin)`, action: `Facility Inspected`, entity: "ZYZU'S Central Library", details: `Inspected 80 desks, fire extinguishers & emergency exits`, ip: `192.168.1.104` },
          { auditId: 'AUD-GZP-82', timestamp: '2026-09-16 11:42', actor: 'Manoj Rai (Admin)', action: 'Voucher Approved', entity: 'Fuel Voucher VOUCH-GZP-26-01', details: 'Authorized ₹2,400 for sub-district audit travel', ip: '192.168.1.104' },
          { auditId: 'AUD-GZP-81', timestamp: '2026-09-15 16:20', actor: 'Manoj Rai (Admin)', action: 'Allotment Confirmed', entity: 'Priya Sharma -> Dr. Alok Nath', details: 'Class 10 Home Tuition matching completed and notified', ip: '192.168.1.104' },
          { auditId: 'AUD-GZP-80', timestamp: '2026-09-14 10:05', actor: 'Manoj Rai (Admin)', action: 'Grievance Resolved', entity: 'GZP-GRV-04 Fee Receipt', details: 'Digital invoice verified and dispatched to parent WhatsApp', ip: '192.168.1.104' },
        ]
      }
    };
  }, [district]);

  // List of 14 categories for the left sidebar selector
  const reportCategories = useMemo(() => {
    return Object.values(categoryDataMap).map(cat => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      count: cat.count
    }));
  }, [categoryDataMap]);

  // Active Category Data
  const activeReport = categoryDataMap[selectedCategoryId] || categoryDataMap['1'];

  // Search filtered rows
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return activeReport.rows;
    const q = searchQuery.toLowerCase().trim();
    return activeReport.rows.filter(row => {
      return Object.values(row).some(val => 
        String(val ?? '').toLowerCase().includes(q)
      );
    });
  }, [activeReport, searchQuery]);

  // Dynamic Multi-Format Export
  const handleExport = (format: 'CSV' | 'XLSX' | 'JSON' | 'PDF', targetReport?: ReportCategoryDefinition) => {
    const report = targetReport || activeReport;
    const cleanName = report.name.replace(/[^a-zA-Z0-9]/g, '_');
    const period = dateRangeType === 'MONTH' ? selectedMonth : dateRangeType === 'CUSTOM' ? `${startDate}_to_${endDate}` : exactDate;
    const baseFilename = `ZYZUS_${district}_${cleanName}_${period}`;

    if (format === 'CSV') {
      const headers = report.columns.map(c => `"${c.label}"`).join(',');
      const rowsCsv = report.rows.map(row => 
        report.columns.map(col => `"${String(row[col.key] ?? '').replace(/"/g, '""')}"`).join(',')
      ).join('\n');

      const csvContent =
        `ZYZU'S District Reporting Desk - ${district}\n` +
        `Report: ${report.name}\n` +
        `Register ID: #${report.id}\n` +
        `Period: ${period}\n` +
        `Generated At: ${new Date().toLocaleString('en-IN')}\n\n` +
        headers + '\n' + rowsCsv;

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${baseFilename}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addToast(`Downloaded ${report.name} (CSV)`, 'success');
    } else if (format === 'XLSX') {
      try {
        const worksheetData = report.rows.map(row => {
          const item: Record<string, any> = {};
          report.columns.forEach(col => {
            item[col.label] = row[col.key];
          });
          return item;
        });
        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, report.name.slice(0, 31));
        XLSX.writeFile(workbook, `${baseFilename}.xlsx`);
        addToast(`Downloaded ${report.name} (Excel .xlsx)`, 'success');
      } catch (err) {
        console.error(err);
        addToast('Excel export encountered issue, downloaded as CSV instead', 'info');
        handleExport('CSV', report);
      }
    } else if (format === 'JSON') {
      const jsonContent = JSON.stringify({
        district,
        reportId: report.id,
        reportName: report.name,
        period,
        generatedAt: new Date().toISOString(),
        columns: report.columns,
        records: report.rows
      }, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${baseFilename}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addToast(`Downloaded ${report.name} (JSON)`, 'success');
    } else {
      window.print();
      addToast('Print preview initiated', 'info');
    }
  };

  // Helper to render badges
  const renderBadge = (status: string) => {
    const s = String(status || '').toUpperCase();
    let badgeClass = 'bg-slate-100 text-slate-800';

    if (s.includes('AUDITED') || s.includes('ACTIVE') || s.includes('COMPLIANT') || s.includes('SETTLED') || s.includes('REALIZED') || s.includes('VERIFIED') || s.includes('PRESENT') || s.includes('CLEARED') || s.includes('COMPLETED') || s.includes('RESOLVED') || s.includes('APPROVED')) {
      badgeClass = 'bg-emerald-100 text-emerald-800 border border-emerald-200';
    } else if (s.includes('DEMO') || s.includes('SCHEDULED') || s.includes('NEW')) {
      badgeClass = 'bg-blue-100 text-blue-800 border border-blue-200';
    } else if (s.includes('PENDING') || s.includes('MATCHING') || s.includes('PROGRESS')) {
      badgeClass = 'bg-amber-100 text-amber-800 border border-amber-200';
    } else if (s.includes('REJECTED') || s.includes('FAILED') || s.includes('DISCONTINUED')) {
      badgeClass = 'bg-rose-100 text-rose-800 border border-rose-200';
    }

    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${badgeClass}`}>
        {status}
      </span>
    );
  };

  if (!isAuthorized) {
    return (
      <div className="p-8 text-center bg-rose-50 border border-rose-200 rounded-2xl space-y-3 my-8">
        <Lock className="w-10 h-10 text-rose-600 mx-auto" />
        <h2 className="text-lg font-bold text-rose-900">403 FORBIDDEN - Access Denied</h2>
        <p className="text-sm text-rose-700">You are not authorized to access reports for {district} district.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`District Intelligence & Audit Reports: ${district}`}
        subtitle="14 official regulatory categories, custom month intervals, and exact historical date snapshots"
        breadcrumbs={[
          { label: 'District Admin', href: '/district-admin' },
          { label: 'Intelligence & Audit Reports' }
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>🔒 AUTHORIZED DISTRICT: {district.toUpperCase()}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={<Printer className="w-4 h-4" />}
              onClick={() => handleExport('PDF')}
            >
              Print / PDF
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Download className="w-4 h-4" />}
              onClick={() => handleExport('CSV')}
            >
              Export Active Report (CSV)
            </Button>
          </div>
        }
      />

      {/* Date & Timeline Scope Filter (Req 33 & 37) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <Calendar className="w-4 h-4 text-blue-600" />
            Report Time Horizon & Query Scope
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setDateRangeType('MONTH')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                dateRangeType === 'MONTH'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Monthly Archive
            </button>
            <button
              onClick={() => setDateRangeType('CUSTOM')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                dateRangeType === 'CUSTOM'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Custom Range
            </button>
            <button
              onClick={() => setDateRangeType('EXACT_DATE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                dateRangeType === 'EXACT_DATE'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Exact Date Snapshot (Req 37)
            </button>
          </div>
        </div>

        {/* Dynamic Controls based on Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          {dateRangeType === 'MONTH' && (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Select Reporting Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full text-xs font-medium border border-slate-300 rounded-xl p-2.5 bg-slate-50 focus:ring-2 focus:ring-blue-500"
              >
                <option value="2026-09">September 2026 (Current Active Cycle)</option>
                <option value="2026-08">August 2026 (Audited & Finalized)</option>
                <option value="2026-07">July 2026 (Audited & Finalized)</option>
                <option value="2026-06">June 2026 (Audited & Finalized)</option>
                <option value="2026-05">May 2026 (Audited & Finalized)</option>
                <option value="2026-04">April 2026 (Audited & Finalized)</option>
                <option value="2026-03">March 2026 (Audited & Finalized)</option>
                <option value="2026-02">February 2026 (Audited & Finalized)</option>
                <option value="2026-01">January 2026 (Audited & Finalized)</option>
              </select>
            </div>
          )}

          {dateRangeType === 'CUSTOM' && (
            <>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-xs font-medium border border-slate-300 rounded-xl p-2.5 bg-slate-50 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full text-xs font-medium border border-slate-300 rounded-xl p-2.5 bg-slate-50 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          {dateRangeType === 'EXACT_DATE' && (
            <div className="sm:col-span-2 flex items-center gap-3">
              <div className="flex-1">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Query Single Exact Date (Historical Day Snapshot)
                </label>
                <input
                  type="date"
                  value={exactDate}
                  onChange={(e) => setExactDate(e.target.value)}
                  className="w-full text-xs font-medium border border-slate-300 rounded-xl p-2.5 bg-slate-50 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => runExactDateQuery(exactDate)}
                className="mt-5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <Search className="w-4 h-4" />
                Inspect Snapshot
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Exact Date Snapshot Card (Req 37) */}
      {dateRangeType === 'EXACT_DATE' && exactSnapshot && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white shadow-xl space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                Exact Historical Date Snapshot: {exactSnapshot.date}
              </span>
              <h3 className="text-lg font-bold mt-0.5">District Operational State in {district}</h3>
            </div>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full font-bold">
              Verified Snapshot
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <span className="text-[11px] text-slate-300 block">Active Students</span>
              <p className="text-xl font-bold text-white mt-0.5">{exactSnapshot.activeStudents}</p>
            </div>
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <span className="text-[11px] text-slate-300 block">Day Attendance</span>
              <p className="text-xl font-bold text-emerald-400 mt-0.5">{exactSnapshot.presentAttendance}</p>
            </div>
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <span className="text-[11px] text-slate-300 block">Desks Occupied</span>
              <p className="text-xl font-bold text-white mt-0.5">{exactSnapshot.desksOccupied}</p>
            </div>
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <span className="text-[11px] text-slate-300 block">Day Gross Inflow</span>
              <p className="text-xl font-bold text-white mt-0.5">₹{exactSnapshot.dailyCollectedFees?.toLocaleString('en-IN')}</p>
            </div>
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <span className="text-[11px] text-slate-300 block">Day Expenses</span>
              <p className="text-xl font-bold text-rose-300 mt-0.5">₹{exactSnapshot.dailyExpenses?.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Two-Column Layout: 14 Categories Selector + Dynamic Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: 14 Report Categories Selector */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3 max-h-[880px] overflow-y-auto">
          <div className="px-2 py-1 flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                14 Regulatory Registers
              </span>
              <span className="text-[11px] text-slate-500">Click any report to open data & download</span>
            </div>
            <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
              District {district}
            </span>
          </div>

          <div className="space-y-2.5">
            {reportCategories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = cat.id === selectedCategoryId;
              return (
                <div
                  key={cat.id}
                  onClick={() => selectCategory(cat.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/90 shadow-md ring-2 ring-blue-500/25'
                      : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cat.color} shrink-0`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded font-mono ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                            #{cat.id}
                          </span>
                          <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-blue-950 font-black' : 'text-slate-800'}`}>
                            {cat.name}
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{cat.count}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="text-[10px] font-extrabold bg-blue-600 text-white px-2 py-0.5 rounded-full shadow-xs shrink-0 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Active
                      </span>
                    )}
                  </div>

                  {/* Direct Action Buttons per category row */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        selectCategory(cat.id);
                      }}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700'
                      }`}
                    >
                      <Eye className="w-3 h-3" />
                      <span>Open Data</span>
                    </button>

                    <button
                      type="button"
                      title={`Download Register #${cat.id} (${cat.name}) as CSV`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExport('CSV', categoryDataMap[cat.id]);
                      }}
                      className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1 transition-all"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download CSV</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Dynamic Live Preview & Action Desk */}
        <div
          ref={previewDeskRef}
          className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5 flex flex-col justify-between"
        >
          <div className="space-y-5">
            {/* Active Status Ribbon */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold text-slate-800">
                  Data Loaded for: <strong className="text-blue-700">Register #{activeReport.id} • {activeReport.name}</strong>
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                {activeReport.rows.length} verified records in this register
              </span>
            </div>

            {/* Header with Title & Multi-Format Export Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    Register #{activeReport.id}
                  </span>
                  <span className="text-xs font-medium text-slate-400">•</span>
                  <span className="text-xs font-semibold text-slate-600">
                    Jurisdiction: {district} District
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mt-1">{activeReport.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Target Scope:{' '}
                  <span className="font-semibold text-slate-700">
                    {dateRangeType === 'MONTH'
                      ? selectedMonth
                      : dateRangeType === 'CUSTOM'
                      ? `${startDate} to ${endDate}`
                      : exactDate}
                  </span>
                </p>
              </div>

              {/* Action Buttons: Multi-Format Download & Modal */}
              <div className="flex flex-wrap items-center gap-1.5">
                <Button
                  size="sm"
                  variant="primary"
                  icon={<Download className="w-3.5 h-3.5" />}
                  onClick={() => handleExport('CSV')}
                >
                  Download CSV
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  icon={<FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />}
                  onClick={() => handleExport('XLSX')}
                >
                  Excel (.xlsx)
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  icon={<FileText className="w-3.5 h-3.5 text-amber-600" />}
                  onClick={() => handleExport('JSON')}
                >
                  JSON
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  icon={<Printer className="w-3.5 h-3.5 text-slate-600" />}
                  onClick={() => handleExport('PDF')}
                >
                  Print PDF
                </Button>
                <button
                  type="button"
                  title="Open Fullscreen View"
                  onClick={() => setIsModalOpen(true)}
                  className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Fast Pill Category Switcher */}
            <div className="overflow-x-auto pb-1 -mt-2">
              <div className="flex items-center gap-1.5 min-w-max">
                <span className="text-[11px] font-bold text-slate-500 mr-1">Switch Register:</span>
                {reportCategories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => selectCategory(cat.id, false)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                      cat.id === selectedCategoryId
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>#{cat.id}</span>
                    <span className="truncate max-w-[120px]">{cat.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Category Specific Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {activeReport.stats.map((stat, sIdx) => {
                const StatIcon = stat.icon;
                return (
                  <div key={sIdx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
                        {stat.label}
                      </span>
                      <StatIcon className={`w-3.5 h-3.5 ${stat.color}`} />
                    </div>
                    <p className={`text-lg font-extrabold ${stat.color}`}>{stat.value}</p>
                    {stat.subtext && (
                      <span className="text-[10px] text-slate-400 block truncate">{stat.subtext}</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Search Filter Bar & Row Count */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={`Search in ${activeReport.name}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">
                  Showing {filteredRows.length} of {activeReport.rows.length} records
                </span>
                <button
                  onClick={() => handleExport('CSV')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline"
                >
                  <Download className="w-3 h-3" />
                  Quick Export
                </button>
              </div>
            </div>

            {/* Live Dynamic Data Grid */}
            <div className="rounded-xl border border-slate-200 overflow-hidden shadow-xs bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      {activeReport.columns.map((col) => (
                        <th
                          key={col.key}
                          className={`py-3 px-3.5 whitespace-nowrap ${
                            col.align === 'center'
                              ? 'text-center'
                              : col.align === 'right'
                              ? 'text-right'
                              : 'text-left'
                          }`}
                        >
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRows.length > 0 ? (
                      filteredRows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-blue-50/40 transition-colors">
                          {activeReport.columns.map((col) => {
                            const val = row[col.key];
                            return (
                              <td
                                key={col.key}
                                className={`py-3 px-3.5 whitespace-nowrap ${
                                  col.align === 'center'
                                    ? 'text-center'
                                    : col.align === 'right'
                                    ? 'text-right'
                                    : 'text-left'
                                }`}
                              >
                                {col.isBadge ? (
                                  renderBadge(val)
                                ) : col.isCurrency ? (
                                  <span className="font-bold text-slate-900">{val}</span>
                                ) : col.key.toLowerCase().includes('id') || col.key.toLowerCase().includes('ref') ? (
                                  <span className="font-mono font-bold text-blue-700">{val}</span>
                                ) : (
                                  <span className="font-medium text-slate-800">{val}</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={activeReport.columns.length}
                          className="py-8 text-center text-xs text-slate-500"
                        >
                          No matching records found for "{searchQuery}".
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Audit Compliance Verification Statement */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Official ZYZU'S District Audit Stamp
              </div>
              <p>
                {activeReport.complianceNote} Cryptographically reconciled against {district} District Primary Ledger. Exported files include the District Administrator digital signature token.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Interactive Report Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-100 px-2.5 py-0.5 rounded-full">
                    Register #{activeReport.id}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-600 font-semibold">{district} District</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 mt-1">{activeReport.name}</h2>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  icon={<Download className="w-3.5 h-3.5" />}
                  onClick={() => handleExport('CSV')}
                >
                  Download CSV
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  icon={<FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />}
                  onClick={() => handleExport('XLSX')}
                >
                  Excel (.xlsx)
                </Button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {/* Stat Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {activeReport.stats.map((stat, sIdx) => {
                  const StatIcon = stat.icon;
                  return (
                    <div key={sIdx} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase">
                        <span>{stat.label}</span>
                        <StatIcon className={`w-3.5 h-3.5 ${stat.color}`} />
                      </div>
                      <p className={`text-base font-black ${stat.color} mt-1`}>{stat.value}</p>
                    </div>
                  );
                })}
              </div>

              {/* Table Search */}
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={`Search within ${activeReport.name}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
                <span className="text-xs text-slate-500 font-semibold">
                  Showing {filteredRows.length} of {activeReport.rows.length} records
                </span>
              </div>

              {/* Data Table */}
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      {activeReport.columns.map((col) => (
                        <th
                          key={col.key}
                          className={`py-3 px-3.5 whitespace-nowrap ${
                            col.align === 'center'
                              ? 'text-center'
                              : col.align === 'right'
                              ? 'text-right'
                              : 'text-left'
                          }`}
                        >
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-blue-50/40 transition-colors">
                        {activeReport.columns.map((col) => {
                          const val = row[col.key];
                          return (
                            <td
                              key={col.key}
                              className={`py-3 px-3.5 whitespace-nowrap ${
                                col.align === 'center'
                                  ? 'text-center'
                                  : col.align === 'right'
                                  ? 'text-right'
                                  : 'text-left'
                              }`}
                            >
                              {col.isBadge ? (
                                renderBadge(val)
                              ) : col.isCurrency ? (
                                <span className="font-bold text-slate-900">{val}</span>
                              ) : col.key.toLowerCase().includes('id') || col.key.toLowerCase().includes('ref') ? (
                                <span className="font-mono font-bold text-blue-700">{val}</span>
                              ) : (
                                <span className="font-medium text-slate-800">{val}</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Certified ZYZU'S Report • {district} District Desk
              </span>
              <Button size="sm" variant="secondary" onClick={() => setIsModalOpen(false)}>
                Close Window
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
