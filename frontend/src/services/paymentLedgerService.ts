// FOCUSPOINT Payment Ledger & Financial Reconciliation Service
// Pan-India Payment Statement, Expense Breakdown, & Payout Auditing

import { 
  PanIndiaPaymentStatement, 
  PaymentLedgerRecord, 
  ExpenseBreakdownItem, 
  PanIndiaGeoFilterParams 
} from '../types';

export const paymentLedgerService = {
  /**
   * Generates Pan-India Payment Statement with 8 expense categories and net platform revenue.
   */
  async getPaymentStatement(filters?: PanIndiaGeoFilterParams): Promise<PanIndiaPaymentStatement> {
    await new Promise(r => setTimeout(r, 120));

    // Base monthly benchmark (30-day baseline)
    let grossVolume = 2419000;

    if (filters?.startDate && filters?.endDate) {
      const start = new Date(filters.startDate).getTime();
      const end = new Date(filters.endDate).getTime();
      const days = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);
      grossVolume = Math.round(days * 80633); // approx 2.419M / 30
    } else if (filters?.datePreset) {
      switch (filters.datePreset) {
        case 'today':
          grossVolume = 84500;
          break;
        case 'this_week':
          grossVolume = 582000;
          break;
        case 'this_month':
          grossVolume = 2419000;
          break;
        case 'prev_month':
          grossVolume = 2150000;
          break;
        case 'last_3_months':
          grossVolume = 6840000;
          break;
        case 'this_year':
          grossVolume = 24650000;
          break;
        default:
          grossVolume = 2419000;
      }
    }

    const ratio = grossVolume / 2419000;
    const platformTakeRatePercent = 8.0;
    const platformCommission = Math.round(grossVolume * (platformTakeRatePercent / 100));
    const disbursedToEducators = Math.round(1485000 * ratio);
    const disbursedToLibraries = Math.round(740480 * ratio);
    const districtAdminPayments = Math.round(140000 * ratio);
    const refunds = Math.round(12500 * ratio);

    const expenseBreakdown: ExpenseBreakdownItem[] = [
      { category: 'Technology', amount: Math.round(32000 * ratio), percentage: 35.5, description: 'Cloud servers, SMS/WhatsApp APIs, & database instances' },
      { category: 'Operations', amount: Math.round(18500 * ratio), percentage: 20.5, description: 'Field audits & verification logistics' },
      { category: 'Advertising', amount: Math.round(14000 * ratio), percentage: 15.5, description: 'Local print flyers & digital teacher acquisition' },
      { category: 'Support', amount: Math.round(9500 * ratio), percentage: 10.5, description: 'Helpline toll-free infrastructure & dispute resolution' },
      { category: 'Research & Development', amount: Math.round(6000 * ratio), percentage: 6.7, description: 'Curriculum standardisation & app feature enhancements' },
      { category: 'Administration', amount: Math.round(5500 * ratio), percentage: 6.1, description: 'Office supplies & compliance documentation' },
      { category: 'Travel', amount: Math.round(3200 * ratio), percentage: 3.5, description: 'District Admin inspection travel allowance' },
      { category: 'Other', amount: Math.round(1500 * ratio), percentage: 1.7, description: 'Bank gateway reconciliation charges & misc fees' },
    ];

    const totalExpenses = expenseBreakdown.reduce((acc, curr) => acc + curr.amount, 0);
    const netPlatformRevenue = platformCommission - totalExpenses;

    return {
      grossVolume,
      platformTakeRatePercent,
      platformCommission,
      disbursedToEducators,
      disbursedToLibraries,
      districtAdminPayments,
      refunds,
      totalExpenses,
      netPlatformRevenue,
      expenseBreakdown,
    };
  },

  /**
   * Retrieves line-by-line financial transaction records with full drill-down.
   */
  async getPaymentLedgerRecords(filters?: PanIndiaGeoFilterParams): Promise<PaymentLedgerRecord[]> {
    await new Promise(r => setTimeout(r, 100));

    const records: PaymentLedgerRecord[] = [
      {
        id: 'rec-001',
        transactionId: 'TXN-984210',
        date: '2026-09-16 14:22:10',
        studentName: 'Aryan Maurya',
        userRole: 'Student',
        serviceType: 'HOME_TUITION',
        serviceTitle: 'Class 11 Physics (Saidpur)',
        productName: 'Class 11 Science Tuition Pass',
        stateName: 'Uttar Pradesh',
        districtName: 'Ghazipur',
        localityName: 'Saidpur',
        areaName: 'Ward 4 Market',
        grossAmount: 3000,
        discountAmount: 200,
        couponCode: 'FP200',
        platformFee: 240,
        partnerPayout: 2760,
        paymentMethod: 'UPI',
        status: 'COMPLETED',
        refundStatus: 'NONE',
        settlementStatus: 'SETTLED',
        invoiceUrl: '/invoices/TXN-984210.pdf'
      },
      {
        id: 'rec-002',
        transactionId: 'TXN-984211',
        date: '2026-09-16 11:05:40',
        studentName: 'Priya Sharma',
        userRole: 'Student',
        serviceType: 'SELF_STUDY_LIBRARY',
        serviceTitle: 'FocusPoint Digital Library (Desk A-04)',
        productName: 'Monthly Digital Study Pass',
        stateName: 'Uttar Pradesh',
        districtName: 'Ghazipur',
        localityName: 'Saidpur',
        areaName: 'Station Road',
        grossAmount: 1000,
        discountAmount: 100,
        couponCode: 'LIBRARY100',
        platformFee: 80,
        partnerPayout: 920,
        paymentMethod: 'UPI',
        status: 'COMPLETED',
        refundStatus: 'NONE',
        settlementStatus: 'SETTLED',
        invoiceUrl: '/invoices/TXN-984211.pdf'
      },
      {
        id: 'rec-003',
        transactionId: 'TXN-984212',
        date: '2026-09-15 17:45:12',
        studentName: 'Rohan Gupta',
        userRole: 'Student',
        serviceType: 'HOME_TUITION',
        serviceTitle: 'Class 12 Mathematics (Lanka)',
        productName: 'Senior Secondary Math Mentorship',
        stateName: 'Uttar Pradesh',
        districtName: 'Varanasi',
        localityName: 'Lanka',
        areaName: 'BHU Gate Colony',
        grossAmount: 4000,
        discountAmount: 0,
        couponCode: undefined,
        platformFee: 320,
        partnerPayout: 3680,
        paymentMethod: 'CARD',
        status: 'COMPLETED',
        refundStatus: 'NONE',
        settlementStatus: 'SETTLED',
        invoiceUrl: '/invoices/TXN-984212.pdf'
      },
      {
        id: 'rec-004',
        transactionId: 'TXN-984213',
        date: '2026-09-15 13:10:05',
        studentName: 'Sneha Verma',
        userRole: 'Student',
        serviceType: 'SELF_STUDY_LIBRARY',
        serviceTitle: 'Saraswati Study Point (Desk B-12)',
        productName: 'AC Study Hall Reserved Seat',
        stateName: 'Uttar Pradesh',
        districtName: 'Lucknow',
        localityName: 'Aliganj',
        areaName: 'Sector C',
        grossAmount: 1200,
        discountAmount: 150,
        couponCode: 'EDTECH15',
        platformFee: 96,
        partnerPayout: 1104,
        paymentMethod: 'NET_BANKING',
        status: 'COMPLETED',
        refundStatus: 'NONE',
        settlementStatus: 'SETTLED',
        invoiceUrl: '/invoices/TXN-984213.pdf'
      },
      {
        id: 'rec-005',
        transactionId: 'TXN-984214',
        date: '2026-09-14 18:20:30',
        studentName: 'Amitabh Singh',
        userRole: 'Student',
        serviceType: 'HOME_TUITION',
        serviceTitle: 'Class 10 Science (Mohammadabad)',
        productName: 'High School Board Booster',
        stateName: 'Uttar Pradesh',
        districtName: 'Ghazipur',
        localityName: 'Mohammadabad',
        areaName: 'Tehsil Road',
        grossAmount: 2500,
        discountAmount: 50,
        couponCode: 'FLAT50',
        platformFee: 200,
        partnerPayout: 2300,
        paymentMethod: 'UPI',
        status: 'COMPLETED',
        refundStatus: 'NONE',
        settlementStatus: 'SETTLED',
        invoiceUrl: '/invoices/TXN-984214.pdf'
      },
      {
        id: 'rec-006',
        transactionId: 'TXN-984215',
        date: '2026-09-14 09:15:00',
        studentName: 'Kavita Rai',
        userRole: 'Student',
        serviceType: 'SELF_STUDY_LIBRARY',
        serviceTitle: 'Chanakya Reading Room (Desk C-01)',
        productName: 'Premium Quiet Zone Desk',
        stateName: 'Bihar',
        districtName: 'Patna',
        localityName: 'Kankarbagh',
        areaName: 'Main Road',
        grossAmount: 1100,
        discountAmount: 0,
        couponCode: undefined,
        platformFee: 88,
        partnerPayout: 1012,
        paymentMethod: 'UPI',
        status: 'COMPLETED',
        refundStatus: 'NONE',
        settlementStatus: 'SETTLED',
        invoiceUrl: '/invoices/TXN-984215.pdf'
      },
      {
        id: 'rec-007',
        transactionId: 'TXN-984216',
        date: '2026-09-13 16:50:22',
        studentName: 'Vivek Yadav',
        userRole: 'Student',
        serviceType: 'HOME_TUITION',
        serviceTitle: 'Class 9 Foundation Mathematics',
        productName: 'Foundation STEM Track',
        stateName: 'Uttar Pradesh',
        districtName: 'Mau',
        localityName: 'City Center',
        areaName: 'Civil Lines',
        grossAmount: 2200,
        discountAmount: 100,
        couponCode: 'MATH10',
        platformFee: 176,
        partnerPayout: 2024,
        paymentMethod: 'MANUAL_CASH',
        status: 'PROCESSING',
        refundStatus: 'NONE',
        settlementStatus: 'PENDING',
        invoiceUrl: '/invoices/TXN-984216.pdf'
      },
      {
        id: 'rec-008',
        transactionId: 'TXN-984217',
        date: '2026-09-12 10:15:45',
        studentName: 'Neha Agarwal',
        userRole: 'Student',
        serviceType: 'MOCK_TEST',
        serviceTitle: 'UPSSSC PET All-India Mock Pass',
        productName: 'Government Exam Unlimited Pass',
        stateName: 'Uttar Pradesh',
        districtName: 'Ghazipur',
        localityName: 'Saidpur',
        areaName: 'Railway Crossing',
        grossAmount: 499,
        discountAmount: 50,
        couponCode: 'PET50',
        platformFee: 49,
        partnerPayout: 450,
        paymentMethod: 'UPI',
        status: 'COMPLETED',
        refundStatus: 'NONE',
        settlementStatus: 'SETTLED',
        invoiceUrl: '/invoices/TXN-984217.pdf'
      },
      {
        id: 'rec-009',
        transactionId: 'TXN-984218',
        date: '2026-09-11 15:40:20',
        studentName: 'Deepak Dubey',
        userRole: 'Student',
        serviceType: 'STUDY_MATERIAL',
        serviceTitle: 'SSC CGL Tier 1 Complete Question Bank PDF',
        productName: 'Digital Study Material Bundle',
        stateName: 'Uttar Pradesh',
        districtName: 'Varanasi',
        localityName: 'Assi',
        areaName: 'Assi Ghat Road',
        grossAmount: 299,
        discountAmount: 0,
        couponCode: undefined,
        platformFee: 30,
        partnerPayout: 269,
        paymentMethod: 'UPI',
        status: 'COMPLETED',
        refundStatus: 'NONE',
        settlementStatus: 'SETTLED',
        invoiceUrl: '/invoices/TXN-984218.pdf'
      },
      {
        id: 'rec-010',
        transactionId: 'TXN-984219',
        date: '2026-09-10 12:30:15',
        studentName: 'Ananya Mishra',
        userRole: 'Student',
        serviceType: 'HOME_TUITION',
        serviceTitle: 'Class 12 Chemistry Masterclass',
        productName: 'NEET Organic Chemistry Intensive',
        stateName: 'Uttar Pradesh',
        districtName: 'Prayagraj',
        localityName: 'Civil Lines',
        areaName: 'Subhash Chauraha',
        grossAmount: 3500,
        discountAmount: 300,
        couponCode: 'NEET300',
        platformFee: 280,
        partnerPayout: 3220,
        paymentMethod: 'UPI',
        status: 'COMPLETED',
        refundStatus: 'NONE',
        settlementStatus: 'SETTLED',
        invoiceUrl: '/invoices/TXN-984219.pdf'
      },
      {
        id: 'rec-011',
        transactionId: 'TXN-984220',
        date: '2026-09-09 18:05:40',
        studentName: 'Mohit Srivastava',
        userRole: 'Student',
        serviceType: 'SELF_STUDY_LIBRARY',
        serviceTitle: 'Vidyapeeth Reading Hub (Desk E-11)',
        productName: '24/7 Silent Desk Pass',
        stateName: 'Uttar Pradesh',
        districtName: 'Gorakhpur',
        localityName: 'Golghar',
        areaName: 'Cinema Road',
        grossAmount: 1300,
        discountAmount: 100,
        couponCode: 'GORAKH100',
        platformFee: 104,
        partnerPayout: 1196,
        paymentMethod: 'UPI',
        status: 'COMPLETED',
        refundStatus: 'NONE',
        settlementStatus: 'SETTLED',
        invoiceUrl: '/invoices/TXN-984220.pdf'
      },
      {
        id: 'rec-012',
        transactionId: 'TXN-984221',
        date: '2026-09-08 16:45:00',
        studentName: 'Aditya Chauhan',
        userRole: 'Student',
        serviceType: 'HOME_TUITION',
        serviceTitle: 'JEE Advanced Physics Problem Solving',
        productName: 'Advanced IIT-JEE Mentorship',
        stateName: 'Uttar Pradesh',
        districtName: 'Noida',
        localityName: 'Sector 62',
        areaName: 'Block B IT Zone',
        grossAmount: 5000,
        discountAmount: 500,
        couponCode: 'JEEVIP',
        platformFee: 400,
        partnerPayout: 4600,
        paymentMethod: 'CARD',
        status: 'COMPLETED',
        refundStatus: 'NONE',
        settlementStatus: 'SETTLED',
        invoiceUrl: '/invoices/TXN-984221.pdf'
      },
      {
        id: 'rec-013',
        transactionId: 'TXN-984222',
        date: '2026-09-07 14:10:25',
        studentName: 'Pooja Jha',
        userRole: 'Student',
        serviceType: 'SELF_STUDY_LIBRARY',
        serviceTitle: 'Nalanda Study Lounge (Desk N-02)',
        productName: 'Premium Ergonomic Study Desk',
        stateName: 'Bihar',
        districtName: 'Patna',
        localityName: 'Boring Road',
        areaName: 'Chauraha Complex',
        grossAmount: 1400,
        discountAmount: 0,
        couponCode: undefined,
        platformFee: 112,
        partnerPayout: 1288,
        paymentMethod: 'NET_BANKING',
        status: 'COMPLETED',
        refundStatus: 'NONE',
        settlementStatus: 'SETTLED',
        invoiceUrl: '/invoices/TXN-984222.pdf'
      },
      {
        id: 'rec-014',
        transactionId: 'TXN-984223',
        date: '2026-09-06 11:20:10',
        studentName: 'Suresh Tiwari',
        userRole: 'Student',
        serviceType: 'HOME_TUITION',
        serviceTitle: 'Class 10 ICSE English Literature',
        productName: 'ICSE Board Booster',
        stateName: 'Uttar Pradesh',
        districtName: 'Varanasi',
        localityName: 'Sigra',
        areaName: 'Stadium Road',
        grossAmount: 2600,
        discountAmount: 150,
        couponCode: 'VARANASI15',
        platformFee: 208,
        partnerPayout: 2392,
        paymentMethod: 'UPI',
        status: 'COMPLETED',
        refundStatus: 'NONE',
        settlementStatus: 'SETTLED',
        invoiceUrl: '/invoices/TXN-984223.pdf'
      },
      {
        id: 'rec-015',
        transactionId: 'TXN-984224',
        date: '2026-09-05 19:15:35',
        studentName: 'Harshita Pandey',
        userRole: 'Student',
        serviceType: 'SELF_STUDY_LIBRARY',
        serviceTitle: 'Apex Scholar Desk (Desk A-19)',
        productName: 'Dual Screen Academic Desk',
        stateName: 'Uttar Pradesh',
        districtName: 'Lucknow',
        localityName: 'Gomti Nagar',
        areaName: 'Vipul Khand',
        grossAmount: 1500,
        discountAmount: 100,
        couponCode: 'LUCKNOW100',
        platformFee: 120,
        partnerPayout: 1380,
        paymentMethod: 'UPI',
        status: 'COMPLETED',
        refundStatus: 'NONE',
        settlementStatus: 'SETTLED',
        invoiceUrl: '/invoices/TXN-984224.pdf'
      },
      {
        id: 'rec-016',
        transactionId: 'TXN-984225',
        date: '2026-09-04 15:40:00',
        studentName: 'Ravi Rathore',
        userRole: 'Student',
        serviceType: 'HOME_TUITION',
        serviceTitle: 'Class 12 Physics Mechanics',
        productName: 'CBSE Physics Excellence',
        stateName: 'Rajasthan',
        districtName: 'Jaipur',
        localityName: 'Malviya Nagar',
        areaName: 'Calgiri Marg',
        grossAmount: 3200,
        discountAmount: 200,
        couponCode: 'JAIPUR200',
        platformFee: 256,
        partnerPayout: 2944,
        paymentMethod: 'UPI',
        status: 'COMPLETED',
        refundStatus: 'NONE',
        settlementStatus: 'SETTLED',
        invoiceUrl: '/invoices/TXN-984225.pdf'
      },
      {
        id: 'rec-017',
        transactionId: 'TXN-984226',
        date: '2026-09-03 10:25:15',
        studentName: 'Tarun Saxena',
        userRole: 'Student',
        serviceType: 'SELF_STUDY_LIBRARY',
        serviceTitle: 'Central Scholar Hub (Desk S-08)',
        productName: 'Reserved High Speed Wi-Fi Desk',
        stateName: 'Madhya Pradesh',
        districtName: 'Bhopal',
        localityName: 'MP Nagar',
        areaName: 'Zone II Commercial',
        grossAmount: 1100,
        discountAmount: 0,
        couponCode: undefined,
        platformFee: 88,
        partnerPayout: 1012,
        paymentMethod: 'UPI',
        status: 'COMPLETED',
        refundStatus: 'NONE',
        settlementStatus: 'SETTLED',
        invoiceUrl: '/invoices/TXN-984226.pdf'
      },
      {
        id: 'rec-018',
        transactionId: 'TXN-984227',
        date: '2026-09-02 17:50:40',
        studentName: 'Sunil Bind',
        userRole: 'Student',
        serviceType: 'HOME_TUITION',
        serviceTitle: 'Class 10 Mathematics (Zamania)',
        productName: 'Rural STEM Empowerment Track',
        stateName: 'Uttar Pradesh',
        districtName: 'Ghazipur',
        localityName: 'Zamania',
        areaName: 'Station Bazar',
        grossAmount: 2000,
        discountAmount: 200,
        couponCode: 'VILLAGE200',
        platformFee: 160,
        partnerPayout: 1840,
        paymentMethod: 'MANUAL_CASH',
        status: 'COMPLETED',
        refundStatus: 'NONE',
        settlementStatus: 'SETTLED',
        invoiceUrl: '/invoices/TXN-984227.pdf'
      },
      {
        id: 'rec-019',
        transactionId: 'TXN-984228',
        date: '2026-09-01 13:15:20',
        studentName: 'Kunal Kashyap',
        userRole: 'Student',
        serviceType: 'HOME_TUITION',
        serviceTitle: 'Class 8 Science Foundation',
        productName: 'Middle School STEM Pass',
        stateName: 'Uttar Pradesh',
        districtName: 'Mau',
        localityName: 'Ghosi',
        areaName: 'Madhuban Road',
        grossAmount: 1800,
        discountAmount: 0,
        couponCode: undefined,
        platformFee: 144,
        partnerPayout: 1656,
        paymentMethod: 'UPI',
        status: 'COMPLETED',
        refundStatus: 'NONE',
        settlementStatus: 'SETTLED',
        invoiceUrl: '/invoices/TXN-984228.pdf'
      },
      {
        id: 'rec-020',
        transactionId: 'TXN-984229',
        date: '2026-08-31 16:30:45',
        studentName: 'Meera Sen',
        userRole: 'Student',
        serviceType: 'HOME_TUITION',
        serviceTitle: 'Class 12 Economics & Accountancy',
        productName: 'Commerce Super Achievers',
        stateName: 'Delhi',
        districtName: 'New Delhi',
        localityName: 'Connaught Place',
        areaName: 'Barakhamba Road',
        grossAmount: 4500,
        discountAmount: 500,
        couponCode: 'CAPITAL500',
        platformFee: 360,
        partnerPayout: 4140,
        paymentMethod: 'CARD',
        status: 'COMPLETED',
        refundStatus: 'NONE',
        settlementStatus: 'SETTLED',
        invoiceUrl: '/invoices/TXN-984229.pdf'
      }
    ];

    let filtered = [...records];
    if (filters?.startDate) {
      filtered = filtered.filter(r => r.date.substring(0, 10) >= filters.startDate!);
    }
    if (filters?.endDate) {
      filtered = filtered.filter(r => r.date.substring(0, 10) <= filters.endDate!);
    }
    if (filters?.stateName && filters.stateName !== 'All States') {
      filtered = filtered.filter(r => r.stateName.toLowerCase() === filters.stateName?.toLowerCase());
    }
    if (filters?.districtName && filters.districtName !== 'All Districts') {
      filtered = filtered.filter(r => r.districtName.toLowerCase() === filters.districtName?.toLowerCase());
    }
    if (filters?.localityName) {
      filtered = filtered.filter(r => r.localityName && r.localityName.toLowerCase() === filters.localityName?.toLowerCase());
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(r => 
        r.studentName.toLowerCase().includes(q) || 
        r.transactionId.toLowerCase().includes(q) || 
        r.serviceTitle.toLowerCase().includes(q) ||
        r.districtName.toLowerCase().includes(q) ||
        (r.localityName ? r.localityName.toLowerCase().includes(q) : false) ||
        (r.areaName ? r.areaName.toLowerCase().includes(q) : false) ||
        r.stateName.toLowerCase().includes(q)
      );
    }
    return filtered;
  }
};
