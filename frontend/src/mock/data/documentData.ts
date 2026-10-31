// FOCUSPOINT DIGITAL DOCUMENT & CREDENTIAL REPOSITORY SEED DATA
import { UnifiedFocusPointDocument } from '../../types/document';

export const INITIAL_FOCUSPOINT_DOCUMENTS: UnifiedFocusPointDocument[] = [
  // ==========================================
  // STUDENT: Aryan Singh (usr-student-aryan)
  // ==========================================
  {
    id: 'doc-stu-id-01',
    documentNumber: 'FP-ID-2026-000109',
    title: "ZYZU'S Official Student Identity Card",
    category: 'IDENTITY',
    documentType: 'STUDENT_ID_CARD',
    recipientId: 'usr-student-aryan',
    recipientName: 'Aryan Singh',
    recipientRole: 'STUDENT',
    recipientAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300',
    recipientEmail: 'student.aryan@zyzus.com',
    recipientPhone: '9876543210',
    state: 'Uttar Pradesh',
    district: 'Ghazipur',
    locality: 'Saidpur',
    issueDate: '2026-08-15',
    validFrom: '2026-08-15',
    validUntil: '2027-03-31',
    status: 'READY',
    paymentStatus: 'NOT_APPLICABLE',
    amount: 0,
    currency: 'INR',
    authorizedBy: 'Prof. Alok Tripathi',
    authorizedRole: 'National Registrar & Academic Comptroller',
    qrVerificationUrl: 'https://zyzus.com/verify/doc/FP-ID-2026-000109',
    qrVerificationHash: 'SHA256-ID-STU-992148102',
    version: 1,
    isCurrent: true,
    metadata: {
      qualification: 'Class 11 (Science - PCM)',
      bloodGroup: 'O+ (Verified)',
      emergencyContact: '+91 98765 43210',
      rollNumber: 'FP-GZP-STU-5001',
      verificationStatus: 'VERIFIED'
    },
    auditTrail: [
      {
        action: 'GENERATED',
        timestamp: '2026-08-15T10:00:00Z',
        performedBy: 'SYSTEM_AUTOGEN',
        performedByRole: 'SYSTEM'
      },
      {
        action: 'VIEWED',
        timestamp: '2026-08-16T12:00:00Z',
        performedBy: 'usr-student-aryan',
        performedByRole: 'STUDENT'
      }
    ],
    createdAt: '2026-08-15T10:00:00Z',
    updatedAt: '2026-08-15T10:00:00Z'
  },
  {
    id: 'doc-stu-fee-01',
    documentNumber: 'FP-RCP-2026-09-00101',
    title: "ZYZU'S Official Home Tuition Fee Receipt",
    category: 'PAYMENT',
    documentType: 'TUITION_FEE_RECEIPT',
    recipientId: 'usr-student-aryan',
    recipientName: 'Aryan Singh',
    recipientRole: 'STUDENT',
    recipientEmail: 'student.aryan@zyzus.com',
    recipientPhone: '9876543210',
    state: 'Uttar Pradesh',
    district: 'Ghazipur',
    locality: 'Saidpur',
    issueDate: '2026-09-03',
    billingPeriod: 'September 2026',
    status: 'READY',
    paymentStatus: 'PAID',
    amount: 3500,
    currency: 'INR',
    paymentMethod: 'UPI (Unified Payments Interface)',
    paymentId: 'PAY-TUT-2026-09-01',
    transactionRef: 'UPI/260903/FP9928129',
    authorizedBy: "ZYZU'S Central Billing Clearinghouse",
    authorizedRole: 'Automated Financial Settlement Engine',
    qrVerificationUrl: 'https://zyzus.com/verify/doc/FP-RCP-2026-09-00101',
    qrVerificationHash: 'SHA256-RCP-TUT-3391024',
    version: 1,
    isCurrent: true,
    lineItems: [
      { label: 'Monthly Home Tuition Fee (Dr. Rajesh Sharma - Physics & Maths)', amount: 3500 },
      { label: 'Comprehensive Academic Materials & Diagnostic Tests', amount: 0 },
      { label: 'Total Paid & Settled (No Dues Outstanding)', amount: 3500, isHighlight: true }
    ],
    metadata: {
      teacherName: 'Dr. Rajesh Sharma',
      teacherId: 'usr-teacher-rajesh',
      subjects: ['Physics', 'Mathematics'],
      invoiceNumber: 'FP-INV-2026-089',
      referenceId: 'req-101'
    },
    auditTrail: [
      {
        action: 'GENERATED',
        timestamp: '2026-09-03T11:20:00Z',
        performedBy: 'SYSTEM_AUTOGEN',
        performedByRole: 'SYSTEM'
      }
    ],
    createdAt: '2026-09-03T11:20:00Z',
    updatedAt: '2026-09-03T11:20:00Z'
  },
  {
    id: 'doc-stu-fee-02',
    documentNumber: 'FP-RCP-2026-08-00204',
    title: "ZYZU'S Official Library Seat Booking Fee Receipt",
    category: 'BOOKING',
    documentType: 'LIBRARY_SEAT_RECEIPT',
    recipientId: 'usr-student-aryan',
    recipientName: 'Aryan Singh',
    recipientRole: 'STUDENT',
    recipientEmail: 'student.aryan@zyzus.com',
    recipientPhone: '9876543210',
    state: 'Uttar Pradesh',
    district: 'Ghazipur',
    locality: 'Saidpur',
    issueDate: '2026-08-30',
    billingPeriod: 'September 2026',
    status: 'READY',
    paymentStatus: 'PAID',
    amount: 499,
    currency: 'INR',
    paymentMethod: 'UPI (Unified Payments Interface)',
    paymentId: 'PAY-LIB-2026-08-30',
    transactionRef: 'UPI/260830/FP3310028',
    authorizedBy: "ZYZU'S Study Space Registrar",
    authorizedRole: 'Library Allocations Controller',
    qrVerificationUrl: 'https://zyzus.com/verify/doc/FP-RCP-2026-08-00204',
    qrVerificationHash: 'SHA256-RCP-LIB-8841029',
    version: 1,
    isCurrent: true,
    lineItems: [
      { label: 'Reserved Reading Seat (Seat 03 - Morning Shift 07:00 AM – 12:00 PM)', amount: 499 },
      { label: 'Hi-Speed Fiber Wi-Fi & Air Conditioning Access', amount: 0 },
      { label: 'Total Paid (Valid Through Sep 30, 2026)', amount: 499, isHighlight: true }
    ],
    metadata: {
      libraryName: "ZYZU'S Premier Study Library - Saidpur",
      libraryId: 'lib-focus-saidpur',
      seatNumber: 'Seat 03',
      shiftName: 'Morning Shift (07:00 AM – 12:00 PM)',
      bookingId: 'bk-5001'
    },
    auditTrail: [
      {
        action: 'GENERATED',
        timestamp: '2026-08-30T10:35:00Z',
        performedBy: 'SYSTEM_AUTOGEN',
        performedByRole: 'SYSTEM'
      }
    ],
    createdAt: '2026-08-30T10:35:00Z',
    updatedAt: '2026-08-30T10:35:00Z'
  },
  {
    id: 'doc-stu-demo-01',
    documentNumber: 'FP-DEMO-2026-000042',
    title: "ZYZU'S Official Home Tuition Demo Pass",
    category: 'DEMO',
    documentType: 'HOME_TUITION_DEMO_PASS',
    recipientId: 'usr-student-aryan',
    recipientName: 'Aryan Singh',
    recipientRole: 'STUDENT',
    recipientEmail: 'student.aryan@zyzus.com',
    recipientPhone: '9876543210',
    state: 'Uttar Pradesh',
    district: 'Ghazipur',
    locality: 'Saidpur',
    issueDate: '2026-08-20',
    validFrom: '2026-08-20',
    validUntil: '2026-08-25',
    status: 'READY',
    paymentStatus: 'FREE',
    isFree: true,
    amount: 0,
    currency: 'INR',
    authorizedBy: 'Office of District Education Operations, Ghazipur',
    authorizedRole: 'District Allotment Coordinator',
    qrVerificationUrl: 'https://zyzus.com/verify/doc/FP-DEMO-2026-000042',
    qrVerificationHash: 'SHA256-DEMO-TUT-448102',
    version: 1,
    isCurrent: true,
    metadata: {
      demoId: 'DEMO-TUT-GZP-0042',
      demoType: 'HOME_TUITION',
      teacherName: 'Dr. Rajesh Sharma',
      teacherId: 'usr-teacher-rajesh',
      subject: 'Physics & Mathematics (JEE Foundation)',
      slotTime: '05:00 PM - 06:30 PM',
      locationAddress: 'Near Town Hall, Ward No. 4, Saidpur',
      verificationStatus: 'CONFIRMED & COMPLETED'
    },
    auditTrail: [
      {
        action: 'GENERATED',
        timestamp: '2026-08-20T14:30:00Z',
        performedBy: 'SYSTEM_AUTOGEN',
        performedByRole: 'SYSTEM'
      }
    ],
    createdAt: '2026-08-20T14:30:00Z',
    updatedAt: '2026-08-20T14:30:00Z'
  },
  {
    id: 'doc-stu-demo-02',
    documentNumber: 'FP-DEMO-2026-000088',
    title: "ZYZU'S Official Library Study Space Demo Pass",
    category: 'DEMO',
    documentType: 'LIBRARY_DEMO_PASS',
    recipientId: 'usr-student-aryan',
    recipientName: 'Aryan Singh',
    recipientRole: 'STUDENT',
    recipientEmail: 'student.aryan@zyzus.com',
    recipientPhone: '9876543210',
    state: 'Uttar Pradesh',
    district: 'Ghazipur',
    locality: 'Saidpur',
    issueDate: '2026-08-28',
    validFrom: '2026-08-28',
    validUntil: '2026-08-30',
    status: 'READY',
    paymentStatus: 'FREE',
    amount: 0,
    currency: 'INR',
    authorizedBy: "ZYZU'S Study Library Operations",
    authorizedRole: 'Seat Allocation Authority',
    qrVerificationUrl: 'https://zyzus.com/verify/doc/FP-DEMO-2026-000088',
    qrVerificationHash: 'SHA256-DEMO-LIB-119283',
    version: 1,
    isCurrent: true,
    metadata: {
      demoId: 'DEMO-LIB-GZP-0088',
      demoType: 'LIBRARY',
      libraryName: "ZYZU'S Premier Study Library - Saidpur",
      libraryId: 'lib-focus-saidpur',
      slotTime: '07:00 AM - 12:00 PM (1-Day Complimentary Trial)',
      locationAddress: 'Near Old Tehsil, Saidpur, Ghazipur',
      verificationStatus: 'CONFIRMED'
    },
    auditTrail: [
      {
        action: 'GENERATED',
        timestamp: '2026-08-28T09:00:00Z',
        performedBy: 'SYSTEM_AUTOGEN',
        performedByRole: 'SYSTEM'
      }
    ],
    createdAt: '2026-08-28T09:00:00Z',
    updatedAt: '2026-08-28T09:00:00Z'
  },

  // ==========================================
  // TEACHER: Dr. Rajesh Sharma (usr-teacher-rajesh)
  // ==========================================
  {
    id: 'doc-tch-id-01',
    documentNumber: 'FP-ID-2026-000211',
    title: "ZYZU'S Official Teacher Identity Card",
    category: 'IDENTITY',
    documentType: 'TEACHER_ID_CARD',
    recipientId: 'usr-teacher-rajesh',
    recipientName: 'Dr. Rajesh Sharma',
    recipientRole: 'TEACHER',
    recipientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    recipientEmail: 'teacher.rajesh@zyzus.com',
    recipientPhone: '9876543211',
    state: 'Uttar Pradesh',
    district: 'Ghazipur',
    locality: 'Saidpur',
    issueDate: '2026-08-10',
    validFrom: '2026-08-10',
    validUntil: '2027-03-31',
    status: 'READY',
    paymentStatus: 'NOT_APPLICABLE',
    amount: 0,
    currency: 'INR',
    authorizedBy: 'Mukesh Sonkar',
    authorizedRole: 'Authorized National Registrar',
    qrVerificationUrl: 'https://zyzus.com/verify/doc/FP-ID-2026-000211',
    qrVerificationHash: 'SHA256-ID-TCH-00211-RAJESH',
    version: 1,
    isCurrent: true,
    metadata: {
      qualification: 'Ph.D. in Physics (BHU Gold Medalist)',
      teachingSubjects: ['Physics', 'Mathematics', 'Science (9-12)'],
      experienceYears: 9,
      bloodGroup: 'B+ (Verified)',
      emergencyContact: '+91 98765 43211',
      verificationStatus: 'APPROVED'
    },
    auditTrail: [
      {
        action: 'GENERATED',
        timestamp: '2026-08-10T09:30:00Z',
        performedBy: 'SYSTEM_AUTOGEN',
        performedByRole: 'SYSTEM'
      }
    ],
    createdAt: '2026-08-10T09:30:00Z',
    updatedAt: '2026-08-10T09:30:00Z'
  },
  {
    id: 'doc-tch-reg-01',
    documentNumber: 'FP-RCP-2026-08-00101',
    title: "ZYZU'S Teacher Registration Fee Receipt",
    category: 'PAYMENT',
    documentType: 'TEACHER_REGISTRATION_RECEIPT',
    recipientId: 'usr-teacher-rajesh',
    recipientName: 'Dr. Rajesh Sharma',
    recipientRole: 'TEACHER',
    recipientEmail: 'teacher.rajesh@zyzus.com',
    recipientPhone: '9876543211',
    state: 'Uttar Pradesh',
    district: 'Ghazipur',
    locality: 'Saidpur',
    issueDate: '2026-08-10',
    status: 'READY',
    paymentStatus: 'PAID',
    amount: 300,
    currency: 'INR',
    paymentMethod: 'UPI QR (BHIM/PhonePe)',
    paymentId: 'PAY-UPI-GZP-8801',
    transactionRef: 'UPI/260810/FP880192',
    authorizedBy: 'Office of District Education Operations, Ghazipur',
    authorizedRole: 'District Coordinator',
    qrVerificationUrl: 'https://zyzus.com/verify/doc/FP-RCP-2026-08-00101',
    qrVerificationHash: 'SHA256-RCP-REG-TCH-101',
    version: 1,
    isCurrent: true,
    lineItems: [
      { label: 'One-Time Educator Accreditation & Background Verification Fee', amount: 300 },
      { label: 'District Ghazipur Educator Subsidy Applied', amount: 0 },
      { label: 'Net Paid Amount (Approved & Verified)', amount: 300, isHighlight: true }
    ],
    metadata: {
      pricingRuleId: 'tr-rule-dist-gzp',
      pricingScope: 'DISTRICT',
      registrationStatus: 'APPROVED'
    },
    auditTrail: [
      {
        action: 'GENERATED',
        timestamp: '2026-08-10T09:32:00Z',
        performedBy: 'SYSTEM_AUTOGEN',
        performedByRole: 'SYSTEM'
      }
    ],
    createdAt: '2026-08-10T09:32:00Z',
    updatedAt: '2026-08-10T09:32:00Z'
  },
  {
    id: 'doc-tch-sal-01',
    documentNumber: 'FP-SAL-2026-09-000145',
    title: "ZYZU'S Official Teacher Monthly Salary Slip",
    category: 'SALARY',
    documentType: 'TEACHER_SALARY_SLIP',
    recipientId: 'usr-teacher-rajesh',
    recipientName: 'Dr. Rajesh Sharma',
    recipientRole: 'Verified Senior Educator',
    recipientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    recipientEmail: 'teacher.rajesh@zyzus.com',
    recipientPhone: '9876543211',
    state: 'Uttar Pradesh',
    district: 'Ghazipur',
    locality: 'Saidpur',
    issueDate: '2026-09-15',
    billingPeriod: 'September 2026',
    status: 'READY',
    paymentStatus: 'PAID',
    amount: 14600,
    currency: 'INR',
    paymentMethod: 'NEFT Direct Bank Transfer',
    paymentId: 'PAY-SAL-2026-09-01',
    transactionRef: 'SBI-NEFT-99120481',
    bankAccountMasked: 'XXXX XXXX 3381 (SBI)',
    authorizedBy: 'Prof. Alok Tripathi',
    authorizedRole: 'Super Admin Authority & Comptroller',
    qrVerificationUrl: 'https://zyzus.com/verify/doc/FP-SAL-2026-09-000145',
    qrVerificationHash: 'SHA256-SAL-2026-09-000145',
    version: 1,
    isCurrent: true,
    lineItems: [
      { label: 'Gross Tuition Collection (4 Students, 28 Completed Sessions)', amount: 16000 },
      { label: 'Educator Gross Earnings Share (85%)', amount: 13600 },
      { label: 'Performance & 100% Attendance Incentive Bonus', amount: 1000 },
      { label: "ZYZU'S Platform Service Fee", amount: 2400, isDeduction: true },
      { label: 'Final Net Disbursed Salary Payout', amount: 14600, isHighlight: true }
    ],
    metadata: {
      completedSessions: 28,
      assignedStudentsCount: 4,
      attendanceRate: '100%',
      payoutPeriod: 'September 2026'
    },
    auditTrail: [
      {
        action: 'GENERATED',
        timestamp: '2026-09-15T14:20:00Z',
        performedBy: 'SYSTEM_AUTOGEN',
        performedByRole: 'SYSTEM'
      },
      {
        action: 'DOWNLOADED',
        timestamp: '2026-09-16T08:15:00Z',
        performedBy: 'usr-teacher-rajesh',
        performedByRole: 'TEACHER'
      }
    ],
    createdAt: '2026-09-15T14:20:00Z',
    updatedAt: '2026-09-16T08:15:00Z'
  },
  {
    id: 'doc-tch-sal-02',
    documentNumber: 'FP-SAL-2026-08-000122',
    title: "ZYZU'S Official Teacher Monthly Salary Slip",
    category: 'SALARY',
    documentType: 'TEACHER_SALARY_SLIP',
    recipientId: 'usr-teacher-rajesh',
    recipientName: 'Dr. Rajesh Sharma',
    recipientRole: 'Verified Senior Educator',
    recipientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    recipientEmail: 'teacher.rajesh@zyzus.com',
    recipientPhone: '9876543211',
    state: 'Uttar Pradesh',
    district: 'Ghazipur',
    locality: 'Saidpur',
    issueDate: '2026-08-15',
    billingPeriod: 'August 2026',
    status: 'READY',
    paymentStatus: 'PAID',
    amount: 13600,
    currency: 'INR',
    paymentMethod: 'NEFT Direct Bank Transfer',
    paymentId: 'PAY-SAL-2026-08-01',
    transactionRef: 'SBI-NEFT-88192031',
    bankAccountMasked: 'XXXX XXXX 3381 (SBI)',
    authorizedBy: 'Prof. Alok Tripathi',
    authorizedRole: 'Super Admin Authority & Comptroller',
    qrVerificationUrl: 'https://zyzus.com/verify/doc/FP-SAL-2026-08-000122',
    qrVerificationHash: 'SHA256-SAL-2026-08-000122',
    version: 1,
    isCurrent: false,
    lineItems: [
      { label: 'Gross Tuition Collection (4 Students, 26 Completed Sessions)', amount: 16000 },
      { label: 'Educator Gross Earnings Share (85%)', amount: 13600 },
      { label: 'Performance Bonus', amount: 0 },
      { label: "ZYZU'S Platform Service Fee", amount: 2400, isDeduction: true },
      { label: 'Final Net Disbursed Salary Payout', amount: 13600, isHighlight: true }
    ],
    metadata: {
      completedSessions: 26,
      assignedStudentsCount: 4,
      attendanceRate: '98%',
      payoutPeriod: 'August 2026'
    },
    auditTrail: [
      {
        action: 'GENERATED',
        timestamp: '2026-08-15T14:20:00Z',
        performedBy: 'SYSTEM_AUTOGEN',
        performedByRole: 'SYSTEM'
      }
    ],
    createdAt: '2026-08-15T14:20:00Z',
    updatedAt: '2026-08-15T14:20:00Z'
  },
  {
    id: 'doc-tch-cert-01',
    documentNumber: 'FP-CERT-2026-000014',
    title: "ZYZU'S Verified Senior Educator Certificate",
    category: 'CERTIFICATE',
    documentType: 'TEACHER_VERIFICATION_CERTIFICATE',
    recipientId: 'usr-teacher-rajesh',
    recipientName: 'Dr. Rajesh Sharma',
    recipientRole: 'TEACHER',
    state: 'Uttar Pradesh',
    district: 'Ghazipur',
    locality: 'Saidpur',
    issueDate: '2026-08-12',
    validFrom: '2026-08-12',
    validUntil: '2027-08-11',
    status: 'READY',
    paymentStatus: 'NOT_APPLICABLE',
    amount: 0,
    currency: 'INR',
    authorizedBy: 'National Academic Standards Directorate',
    authorizedRole: 'Academic Accreditation Board',
    qrVerificationUrl: 'https://zyzus.com/verify/doc/FP-CERT-2026-000014',
    qrVerificationHash: 'SHA256-CERT-TCH-RAJESH-0014',
    version: 1,
    isCurrent: true,
    metadata: {
      qualification: 'Ph.D. in Physics (BHU Gold Medalist)',
      teachingSubjects: ['Physics', 'Mathematics'],
      experienceYears: 9,
      verificationStatus: 'APPROVED & ACCREDITED'
    },
    auditTrail: [
      {
        action: 'GENERATED',
        timestamp: '2026-08-12T11:00:00Z',
        performedBy: 'SYSTEM_AUTOGEN',
        performedByRole: 'SYSTEM'
      }
    ],
    createdAt: '2026-08-12T11:00:00Z',
    updatedAt: '2026-08-12T11:00:00Z'
  },

  // ==========================================
  // LIBRARY OWNER: Suresh Chandra Yadav (usr-lib-suresh)
  // ==========================================
  {
    id: 'doc-lib-id-01',
    documentNumber: 'FP-ID-2026-000315',
    title: "ZYZU'S Official Library Partner Identity Card",
    category: 'IDENTITY',
    documentType: 'LIBRARY_OWNER_ID_CARD',
    recipientId: 'usr-lib-suresh',
    recipientName: 'Suresh Chandra Yadav',
    recipientRole: 'LIBRARY_OWNER',
    recipientAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    recipientEmail: 'owner.suresh@zyzus.com',
    recipientPhone: '9876543213',
    state: 'Uttar Pradesh',
    district: 'Ghazipur',
    locality: 'Saidpur',
    issueDate: '2026-08-01',
    validFrom: '2026-08-01',
    validUntil: '2027-03-31',
    status: 'READY',
    paymentStatus: 'NOT_APPLICABLE',
    amount: 0,
    currency: 'INR',
    authorizedBy: 'Mukesh Sonkar',
    authorizedRole: 'Authorized National Registrar',
    qrVerificationUrl: 'https://zyzus.com/verify/doc/FP-ID-2026-000315',
    qrVerificationHash: 'SHA256-ID-LIB-SURESH-00315',
    version: 1,
    isCurrent: true,
    metadata: {
      libraryName: "ZYZU'S Premier Study Library - Saidpur",
      libraryId: 'lib-focus-saidpur',
      emergencyContact: '+91 94152 01122',
      verificationStatus: 'VERIFIED & PARTNERED'
    },
    auditTrail: [
      {
        action: 'GENERATED',
        timestamp: '2026-08-01T08:00:00Z',
        performedBy: 'SYSTEM_AUTOGEN',
        performedByRole: 'SYSTEM'
      }
    ],
    createdAt: '2026-08-01T08:00:00Z',
    updatedAt: '2026-08-01T08:00:00Z'
  },
  {
    id: 'doc-lib-sub-01',
    documentNumber: 'FP-SUB-2026-09-000054',
    title: "ZYZU'S Official Library Subscription Payment Receipt",
    category: 'SUBSCRIPTION',
    documentType: 'LIBRARY_SUBSCRIPTION_RECEIPT',
    recipientId: 'usr-lib-suresh',
    recipientName: 'Suresh Chandra Yadav',
    recipientRole: 'LIBRARY_OWNER',
    recipientEmail: 'owner.suresh@zyzus.com',
    recipientPhone: '9876543213',
    state: 'Uttar Pradesh',
    district: 'Ghazipur',
    locality: 'Saidpur',
    issueDate: '2026-09-15',
    billingPeriod: 'September 2026',
    validFrom: '2026-09-15',
    validUntil: '2026-10-15',
    status: 'READY',
    paymentStatus: 'PAID',
    amount: 200,
    currency: 'INR',
    paymentMethod: 'UPI QR (Unified Payments)',
    paymentId: 'PAY-LS-00192',
    transactionRef: 'TXN-UPI-LS-991204',
    authorizedBy: "ZYZU'S National Partner Network",
    authorizedRole: 'Subscription Billing Directorate',
    qrVerificationUrl: 'https://zyzus.com/verify/doc/FP-SUB-2026-09-000054',
    qrVerificationHash: 'SHA256-SUB-LIB-2026-000054',
    version: 1,
    isCurrent: true,
    lineItems: [
      { label: 'Monthly Study Library Listing & Seat Booking Engine Subscription', amount: 200 },
      { label: 'Dedicated Student Management & Biometric Shift Roster Access', amount: 0 },
      { label: 'Net Paid Amount (Active & Auto-Renewing)', amount: 200, isHighlight: true }
    ],
    metadata: {
      planName: 'Monthly Listing Plan',
      billingCycle: 'MONTHLY',
      libraryName: "ZYZU'S Premier Study Library - Saidpur",
      libraryId: 'lib-focus-saidpur',
      invoiceNumber: 'INV-LS-2026-001',
      autoRenew: true
    },
    auditTrail: [
      {
        action: 'GENERATED',
        timestamp: '2026-09-15T10:00:00Z',
        performedBy: 'SYSTEM_AUTOGEN',
        performedByRole: 'SYSTEM'
      }
    ],
    createdAt: '2026-09-15T10:00:00Z',
    updatedAt: '2026-09-15T10:00:00Z'
  },
  {
    id: 'doc-lib-sett-01',
    documentNumber: 'FP-LIB-2026-09-000278',
    title: "ZYZU'S Official Library Seat Settlement Receipt",
    category: 'FINANCIAL',
    documentType: 'LIBRARY_SETTLEMENT_RECEIPT',
    recipientId: 'usr-lib-suresh',
    recipientName: "Suresh Chandra Yadav (ZYZU'S Premier Study Library)",
    recipientRole: 'LIBRARY_OWNER',
    recipientEmail: 'owner.suresh@zyzus.com',
    recipientPhone: '9876543213',
    state: 'Uttar Pradesh',
    district: 'Ghazipur',
    locality: 'Saidpur',
    issueDate: '2026-09-12',
    billingPeriod: 'September 2026',
    status: 'READY',
    paymentStatus: 'PAID',
    amount: 2745,
    currency: 'INR',
    paymentMethod: 'RTGS Electronic Bank Transfer',
    paymentId: 'PAY-SET-LIB-01',
    transactionRef: 'HDFC-RTGS-98210492',
    bankAccountMasked: 'XXXX XXXX 6112 (HDFC)',
    authorizedBy: 'Prof. Alok Tripathi',
    authorizedRole: 'Super Admin Authority & Comptroller',
    qrVerificationUrl: 'https://zyzus.com/verify/doc/FP-LIB-2026-09-000278',
    qrVerificationHash: 'SHA256-SETT-LIB-000278',
    version: 1,
    isCurrent: true,
    lineItems: [
      { label: 'Gross Online Seat Bookings (3 Confirmed)', amount: 3100 },
      { label: 'Student Promotional Discount Adjustment', amount: 50, isDeduction: true },
      { label: "ZYZU'S Commission Fee (10% Tier)", amount: 305, isDeduction: true },
      { label: 'Final Net Partner Settled Payout', amount: 2745, isHighlight: true }
    ],
    metadata: {
      libraryName: "ZYZU'S Premier Study Library - Saidpur",
      libraryId: 'lib-focus-saidpur',
      utr: 'UTR9821049281',
      totalBookings: 3
    },
    auditTrail: [
      {
        action: 'GENERATED',
        timestamp: '2026-09-12T16:00:00Z',
        performedBy: 'SYSTEM_AUTOGEN',
        performedByRole: 'SYSTEM'
      }
    ],
    createdAt: '2026-09-12T16:00:00Z',
    updatedAt: '2026-09-12T16:00:00Z'
  },
  {
    id: 'doc-lib-cert-01',
    documentNumber: 'FP-CERT-2026-000088',
    title: "ZYZU'S Verified & Partnered Study Library Certificate",
    category: 'CERTIFICATE',
    documentType: 'LIBRARY_PARTNER_CERTIFICATE',
    recipientId: 'usr-lib-suresh',
    recipientName: 'Suresh Chandra Yadav',
    recipientRole: 'LIBRARY_OWNER',
    state: 'Uttar Pradesh',
    district: 'Ghazipur',
    locality: 'Saidpur',
    issueDate: '2026-08-05',
    validFrom: '2026-08-05',
    validUntil: '2027-08-04',
    status: 'READY',
    paymentStatus: 'NOT_APPLICABLE',
    amount: 0,
    currency: 'INR',
    authorizedBy: 'National Study Environment Standards Board',
    authorizedRole: 'Infrastructure Compliance Board',
    qrVerificationUrl: 'https://zyzus.com/verify/doc/FP-CERT-2026-000088',
    qrVerificationHash: 'SHA256-CERT-LIB-SAIDPUR-0088',
    version: 1,
    isCurrent: true,
    metadata: {
      libraryName: "ZYZU'S Premier Study Library - Saidpur",
      libraryId: 'lib-focus-saidpur',
      totalSeats: 45,
      facilities: ['Wi-Fi 5G', 'Air Conditioning', 'Power Backup', 'CCTV Monitoring', 'Pure RO Water'],
      verificationStatus: 'VERIFIED & CERTIFIED PARTNER'
    },
    auditTrail: [
      {
        action: 'GENERATED',
        timestamp: '2026-08-05T12:00:00Z',
        performedBy: 'SYSTEM_AUTOGEN',
        performedByRole: 'SYSTEM'
      }
    ],
    createdAt: '2026-08-05T12:00:00Z',
    updatedAt: '2026-08-05T12:00:00Z'
  },

  // ==========================================
  // DISTRICT ADMIN: Manoj Kumar Rai (usr-admin-ghazipur)
  // ==========================================
  {
    id: 'doc-da-id-01',
    documentNumber: 'FP-ID-2026-000401',
    title: "ZYZU'S Official District Administrator Identity Card",
    category: 'IDENTITY',
    documentType: 'DISTRICT_ADMIN_ID_CARD',
    recipientId: 'usr-admin-ghazipur',
    recipientName: 'Manoj Kumar Rai',
    recipientRole: 'DISTRICT_ADMIN',
    recipientAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
    recipientEmail: 'admin.ghazipur@zyzus.com',
    recipientPhone: '9876543214',
    state: 'Uttar Pradesh',
    district: 'Ghazipur',
    locality: 'Vikas Bhawan',
    issueDate: '2026-07-01',
    validFrom: '2026-07-01',
    validUntil: '2027-03-31',
    status: 'READY',
    paymentStatus: 'NOT_APPLICABLE',
    amount: 0,
    currency: 'INR',
    authorizedBy: 'Mukesh Sonkar',
    authorizedRole: 'Authorized National Registrar',
    qrVerificationUrl: 'https://zyzus.com/verify/doc/FP-ID-2026-000401',
    qrVerificationHash: 'SHA256-ID-DA-MANOJ-00401',
    version: 1,
    isCurrent: true,
    metadata: {
      qualification: 'District Operations & Educational Administrative Head',
      emergencyContact: '+91 98765 43214',
      jurisdiction: 'Ghazipur District (All Tehsils & Blocks)',
      verificationStatus: 'AUTHORIZED'
    },
    auditTrail: [
      {
        action: 'GENERATED',
        timestamp: '2026-07-01T00:00:00Z',
        performedBy: 'SYSTEM_AUTOGEN',
        performedByRole: 'SYSTEM'
      }
    ],
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'doc-da-exp-01',
    documentNumber: 'FP-EXP-2026-09-000092',
    title: "ZYZU'S Official District Expense Payment Receipt",
    category: 'FINANCIAL',
    documentType: 'DISTRICT_EXPENSE_RECEIPT',
    recipientId: 'usr-admin-ghazipur',
    recipientName: 'Manoj Kumar Rai (C/O Bharti Airtel Ltd)',
    recipientRole: 'DISTRICT_ADMIN',
    recipientEmail: 'admin.ghazipur@zyzus.com',
    recipientPhone: '9876543214',
    state: 'Uttar Pradesh',
    district: 'Ghazipur',
    locality: 'Vikas Bhawan',
    issueDate: '2026-09-04',
    billingPeriod: 'September 2026',
    status: 'READY',
    paymentStatus: 'PAID',
    amount: 4800,
    currency: 'INR',
    paymentMethod: 'UPI (Unified Payments Interface)',
    paymentId: 'PAY-EXP-88910',
    transactionRef: 'TXN-UPI-984210',
    bankAccountMasked: 'XXXX XXXX 9912 (HDFC)',
    authorizedBy: 'Prof. Alok Tripathi',
    authorizedRole: 'Super Admin Authority & Comptroller',
    qrVerificationUrl: 'https://zyzus.com/verify/doc/FP-EXP-2026-09-000092',
    qrVerificationHash: 'SHA256-EXP-GZP-000092',
    version: 1,
    isCurrent: true,
    lineItems: [
      { label: 'Claimed Operational Expenditure (High-speed Airtel Fiber connection)', amount: 4800 },
      { label: 'Super Admin Approved Reimbursement Amount', amount: 4800 },
      { label: 'Total Paid & Settled (Disbursed Direct to Payee)', amount: 4800, isHighlight: true }
    ],
    metadata: {
      expenseCategory: 'Internet',
      billNumber: 'AIRTEL-GZP-9942',
      purpose: 'High-speed Airtel Fiber connection for District Admin Command Office',
      payee: 'Bharti Airtel Ltd'
    },
    auditTrail: [
      {
        action: 'GENERATED',
        timestamp: '2026-09-04T12:30:00Z',
        performedBy: 'SYSTEM_AUTOGEN',
        performedByRole: 'SYSTEM'
      }
    ],
    createdAt: '2026-09-04T12:30:00Z',
    updatedAt: '2026-09-04T12:30:00Z'
  },
  {
    id: 'doc-da-sal-01',
    documentNumber: 'FP-SAL-2026-09-000088',
    title: "ZYZU'S Official District Admin Salary Slip",
    category: 'SALARY',
    documentType: 'DISTRICT_ADMIN_SALARY_SLIP',
    recipientId: 'usr-admin-ghazipur',
    recipientName: 'Manoj Kumar Rai',
    recipientRole: 'DISTRICT_ADMIN',
    recipientAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
    recipientEmail: 'admin.ghazipur@zyzus.com',
    recipientPhone: '9876543214',
    state: 'Uttar Pradesh',
    district: 'Ghazipur',
    locality: 'Vikas Bhawan',
    issueDate: '2026-09-15',
    billingPeriod: 'September 2026',
    status: 'READY',
    paymentStatus: 'PAID',
    amount: 35000,
    currency: 'INR',
    paymentMethod: 'NEFT Bank Transfer',
    paymentId: 'PAY-DA-SAL-2026-09',
    transactionRef: 'NEFT-SBI-DA-881920',
    bankAccountMasked: 'XXXX XXXX 9912 (HDFC)',
    authorizedBy: 'Prof. Alok Tripathi',
    authorizedRole: 'Super Admin Authority & Comptroller',
    qrVerificationUrl: 'https://zyzus.com/verify/doc/FP-SAL-2026-09-000088',
    qrVerificationHash: 'SHA256-DA-SAL-88',
    version: 1,
    isCurrent: true,
    lineItems: [
      { label: 'Base District Operations Remuneration', amount: 30000 },
      { label: 'District Target Achievement & Verification Honorarium', amount: 5000 },
      { label: 'Net Disbursed Payable Amount', amount: 35000, isHighlight: true }
    ],
    metadata: {
      designation: 'District Coordinator',
      district: 'Ghazipur'
    },
    auditTrail: [
      {
        action: 'GENERATED',
        timestamp: '2026-09-15T14:25:00Z',
        performedBy: 'SYSTEM_AUTOGEN',
        performedByRole: 'SYSTEM'
      }
    ],
    createdAt: '2026-09-15T14:25:00Z',
    updatedAt: '2026-09-15T14:25:00Z'
  },
  {
    id: 'doc-da-appt-01',
    documentNumber: 'FP-DOC-2026-000005',
    title: "ZYZU'S Official District Coordinator Authorization Warrant",
    category: 'ADMINISTRATIVE',
    documentType: 'DISTRICT_APPOINTMENT_LETTER',
    recipientId: 'usr-admin-ghazipur',
    recipientName: 'Manoj Kumar Rai',
    recipientRole: 'DISTRICT_ADMIN',
    state: 'Uttar Pradesh',
    district: 'Ghazipur',
    locality: 'Vikas Bhawan',
    issueDate: '2026-07-01',
    validFrom: '2026-07-01',
    validUntil: '2027-06-30',
    status: 'READY',
    paymentStatus: 'NOT_APPLICABLE',
    amount: 0,
    currency: 'INR',
    authorizedBy: "Board of Directors, ZYZU'S Educational Directorate",
    authorizedRole: 'National Directorate',
    qrVerificationUrl: 'https://zyzus.com/verify/doc/FP-DOC-2026-000005',
    qrVerificationHash: 'SHA256-APPT-GZP-005',
    version: 1,
    isCurrent: true,
    metadata: {
      jurisdiction: 'Ghazipur District (Uttar Pradesh)',
      officialTerms: 'Full operational jurisdiction for educator accreditation, study facility verification, and student home tuition matching.'
    },
    auditTrail: [
      {
        action: 'GENERATED',
        timestamp: '2026-07-01T00:00:00Z',
        performedBy: 'SYSTEM_AUTOGEN',
        performedByRole: 'SYSTEM'
      }
    ],
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },

  // ==========================================
  // SUPER ADMIN: Chief Platform Administrator
  // ==========================================
  {
    id: 'doc-sa-id-01',
    documentNumber: 'FP-ID-2026-000001',
    title: "ZYZU'S Sovereign Super Administrator Credential",
    category: 'IDENTITY',
    documentType: 'SUPER_ADMIN_ID_CARD',
    recipientId: 'usr-super-admin',
    recipientName: 'Chief Platform Administrator',
    recipientRole: 'SUPER_ADMIN',
    recipientAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300',
    recipientEmail: 'superadmin@zyzus.com',
    recipientPhone: '9999999999',
    state: 'Uttar Pradesh',
    district: 'Headquarters (Lucknow)',
    locality: 'Gomti Nagar',
    issueDate: '2026-06-01',
    validFrom: '2026-06-01',
    validUntil: '2028-05-31',
    status: 'READY',
    paymentStatus: 'NOT_APPLICABLE',
    amount: 0,
    currency: 'INR',
    authorizedBy: "ZYZU'S Governing Council",
    authorizedRole: 'Supreme Directorate',
    qrVerificationUrl: 'https://zyzus.com/verify/doc/FP-ID-2026-000001',
    qrVerificationHash: 'SHA256-SA-SOVEREIGN-0001',
    version: 1,
    isCurrent: true,
    metadata: {
      designation: 'Chief Platform Architect & Central Comptroller',
      accessLevel: 'ROOT / TIER-0 AUTONOMOUS'
    },
    auditTrail: [
      {
        action: 'GENERATED',
        timestamp: '2026-06-01T00:00:00Z',
        performedBy: 'SYSTEM_AUTOGEN',
        performedByRole: 'SYSTEM'
      }
    ],
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-06-01T00:00:00Z'
  }
];
