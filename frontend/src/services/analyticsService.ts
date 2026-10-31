// FOCUSPOINT Platform Analytics Service Abstraction Layer
// Pan-India GMV, Revenue, Attendance & Infrastructure Intelligence

import { 
  GMVAnalyticsData, 
  DistrictGMVSummary, 
  AllotmentVelocityMetrics, 
  InfrastructureScaleMetrics, 
  PanIndiaGeoFilterParams 
} from '../types';
import { mockStore } from '../mock/store';

export const analyticsService = {
  /**
   * Retrieves Pan-India GMV Analytics with multi-tier geographic and date breakdown.
   */
  async getPanIndiaGMV(filters?: PanIndiaGeoFilterParams): Promise<GMVAnalyticsData> {
    await new Promise(r => setTimeout(r, 120));

    // Base district summaries
    const baseDistricts: DistrictGMVSummary[] = [
      {
        districtId: 'dist-gzp',
        districtName: 'Ghazipur',
        stateName: 'Uttar Pradesh',
        tuitionGMV: 240000,
        libraryGMV: 78000,
        totalGMV: 318000,
        onlineGMV: 275000,
        offlineGMV: 43000,
        activeStudents: 412,
        activeTeachers: 48,
        activeLibraries: 12,
        growthPercentage: 24.5,
        lastUpdated: new Date().toISOString()
      },
      {
        districtId: 'dist-vns',
        districtName: 'Varanasi',
        stateName: 'Uttar Pradesh',
        tuitionGMV: 320000,
        libraryGMV: 110000,
        totalGMV: 430000,
        onlineGMV: 390000,
        offlineGMV: 40000,
        activeStudents: 560,
        activeTeachers: 62,
        activeLibraries: 16,
        growthPercentage: 28.2,
        lastUpdated: new Date().toISOString()
      },
      {
        districtId: 'dist-mau',
        districtName: 'Mau',
        stateName: 'Uttar Pradesh',
        tuitionGMV: 115000,
        libraryGMV: 35000,
        totalGMV: 150000,
        onlineGMV: 128000,
        offlineGMV: 22000,
        activeStudents: 185,
        activeTeachers: 22,
        activeLibraries: 5,
        growthPercentage: 14.8,
        lastUpdated: new Date().toISOString()
      },
      {
        districtId: 'dist-bal',
        districtName: 'Ballia',
        stateName: 'Uttar Pradesh',
        tuitionGMV: 95000,
        libraryGMV: 28000,
        totalGMV: 123000,
        onlineGMV: 104000,
        offlineGMV: 19000,
        activeStudents: 140,
        activeTeachers: 18,
        activeLibraries: 4,
        growthPercentage: 11.2,
        lastUpdated: new Date().toISOString()
      },
      {
        districtId: 'dist-lko',
        districtName: 'Lucknow',
        stateName: 'Uttar Pradesh',
        tuitionGMV: 450000,
        libraryGMV: 165000,
        totalGMV: 615000,
        onlineGMV: 560000,
        offlineGMV: 55000,
        activeStudents: 720,
        activeTeachers: 85,
        activeLibraries: 24,
        growthPercentage: 35.6,
        lastUpdated: new Date().toISOString()
      },
      {
        districtId: 'dist-kan',
        districtName: 'Kanpur Nagar',
        stateName: 'Uttar Pradesh',
        tuitionGMV: 280000,
        libraryGMV: 95000,
        totalGMV: 375000,
        onlineGMV: 335000,
        offlineGMV: 40000,
        activeStudents: 430,
        activeTeachers: 52,
        activeLibraries: 14,
        growthPercentage: 19.4,
        lastUpdated: new Date().toISOString()
      },
      {
        districtId: 'dist-pat',
        districtName: 'Patna',
        stateName: 'Bihar',
        tuitionGMV: 310000,
        libraryGMV: 98000,
        totalGMV: 408000,
        onlineGMV: 370000,
        offlineGMV: 38000,
        activeStudents: 490,
        activeTeachers: 58,
        activeLibraries: 15,
        growthPercentage: 22.1,
        lastUpdated: new Date().toISOString()
      }
    ];

    // Apply geographic filtering if specified
    let filteredDistricts = [...baseDistricts];
    if (filters?.stateName && filters.stateName !== 'All States') {
      filteredDistricts = filteredDistricts.filter(d => d.stateName.toLowerCase() === filters.stateName?.toLowerCase());
    }
    if (filters?.districtName && filters.districtName !== 'All Districts') {
      filteredDistricts = filteredDistricts.filter(d => d.districtName.toLowerCase() === filters.districtName?.toLowerCase());
      
      // If selected district is not in baseDistricts (e.g. from 36 states master), synthesize deterministic data
      if (filteredDistricts.length === 0) {
        const dName = filters.districtName;
        let hash = 0;
        for (let i = 0; i < dName.length; i++) hash = (hash * 31 + dName.charCodeAt(i)) & 0xffffffff;
        const absHash = Math.abs(hash);
        const tot = 180000 + (absHash % 240000);
        const tGMV = Math.round(tot * 0.72);
        const lGMV = tot - tGMV;
        const stu = 180 + (absHash % 280);
        const tea = 24 + (absHash % 35);
        const libs = 5 + (absHash % 12);
        
        filteredDistricts = [{
          districtId: 'dist-' + dName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          districtName: dName,
          stateName: filters.stateName || 'Uttar Pradesh',
          tuitionGMV: tGMV,
          libraryGMV: lGMV,
          totalGMV: tot,
          onlineGMV: Math.round(tot * 0.86),
          offlineGMV: Math.round(tot * 0.14),
          activeStudents: stu,
          activeTeachers: tea,
          activeLibraries: libs,
          growthPercentage: Number((12 + (absHash % 18) + 0.4).toFixed(1)),
          lastUpdated: new Date().toISOString()
        }];
      }
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      filteredDistricts = filteredDistricts.filter(d => d.districtName.toLowerCase().includes(q) || d.stateName.toLowerCase().includes(q));
    }

    const totalGMV = filteredDistricts.reduce((acc, curr) => acc + curr.totalGMV, 0);
    const tuitionGMV = filteredDistricts.reduce((acc, curr) => acc + curr.tuitionGMV, 0);
    const libraryGMV = filteredDistricts.reduce((acc, curr) => acc + curr.libraryGMV, 0);
    const onlineGMV = filteredDistricts.reduce((acc, curr) => acc + curr.onlineGMV, 0);
    const offlineGMV = filteredDistricts.reduce((acc, curr) => acc + curr.offlineGMV, 0);

    return {
      totalGMV,
      currentMonthGMV: totalGMV,
      previousMonthGMV: Math.round(totalGMV * 0.81),
      growthQoQ: 23.4,
      tuitionGMV,
      libraryGMV,
      onlineGMV,
      offlineGMV,
      districts: filteredDistricts,
      monthlyTrend: [
        { month: 'Apr 2026', tuitionGMV: Math.round(tuitionGMV * 0.65), libraryGMV: Math.round(libraryGMV * 0.65), totalGMV: Math.round(totalGMV * 0.65) },
        { month: 'May 2026', tuitionGMV: Math.round(tuitionGMV * 0.72), libraryGMV: Math.round(libraryGMV * 0.72), totalGMV: Math.round(totalGMV * 0.72) },
        { month: 'Jun 2026', tuitionGMV: Math.round(tuitionGMV * 0.79), libraryGMV: Math.round(libraryGMV * 0.80), totalGMV: Math.round(totalGMV * 0.79) },
        { month: 'Jul 2026', tuitionGMV: Math.round(tuitionGMV * 0.86), libraryGMV: Math.round(libraryGMV * 0.85), totalGMV: Math.round(totalGMV * 0.86) },
        { month: 'Aug 2026', tuitionGMV: Math.round(tuitionGMV * 0.93), libraryGMV: Math.round(libraryGMV * 0.94), totalGMV: Math.round(totalGMV * 0.93) },
        { month: 'Sep 2026 (MTD)', tuitionGMV, libraryGMV, totalGMV },
      ]
    };
  },

  /**
   * Deep drill-down for a specific District Command View
   */
  async getDistrictGMVDetails(districtName: string) {
    await new Promise(r => setTimeout(r, 100));
    const gmvData = await this.getPanIndiaGMV({ districtName });
    const found = gmvData.districts.find(d => d.districtName.toLowerCase() === districtName.toLowerCase()) || gmvData.districts[0];

    return {
      district: found,
      tuitionStats: {
        newlyRegisteredStudents: 42,
        activeStudents: found.activeStudents,
        discontinuedStudents: 8,
        newlyRegisteredTeachers: 6,
        activeTeachers: found.activeTeachers,
        discontinuedTeachers: 2,
        tutorRequests: 68,
        completedTuitionAssignments: 58,
      },
      libraryStats: {
        newlyRegisteredLibraryStudents: 28,
        activeLibraryStudents: Math.round(found.activeStudents * 0.6),
        discontinuedLibraryStudents: 4,
        newLibraries: 2,
        activeLibraries: found.activeLibraries,
        discontinuedLibraries: 0,
        libraryBookings: 142,
      },
      financialStats: {
        districtGMV: found.totalGMV,
        tuitionGMV: found.tuitionGMV,
        libraryGMV: found.libraryGMV,
        platformCommission: Math.round(found.totalGMV * 0.08),
        educatorPayout: Math.round(found.tuitionGMV * 0.92),
        libraryPayout: Math.round(found.libraryGMV * 0.92),
        expenses: Math.round(found.totalGMV * 0.03),
        netPlatformRevenue: Math.round(found.totalGMV * 0.05),
      },
      growthStats: {
        studentGrowth: 21.4,
        teacherGrowth: 18.2,
        libraryGrowth: 25.0,
        gmvGrowth: found.growthPercentage,
      }
    };
  },

  /**
   * Allotment Velocity: Tutor Request -> Teacher Allocation metrics
   */
  async getAllotmentVelocity(filters?: PanIndiaGeoFilterParams): Promise<AllotmentVelocityMetrics> {
    await new Promise(r => setTimeout(r, 60));
    const requests = mockStore.getTutorRequests();
    const assigned = requests.filter(r => r.status === 'TEACHER_ALLOTTED' || r.status === 'ACTIVE' || r.status === 'COMPLETED');

    const isDistrictFiltered = !!(filters?.districtName && filters.districtName !== 'All Districts');

    if (isDistrictFiltered) {
      const dName = filters!.districtName!;
      const comparisons = [
        { district: 'Ghazipur', avgHours: 2.8, fillRate: 94.2, fastest: 14 },
        { district: 'Varanasi', avgHours: 3.1, fillRate: 91.5, fastest: 18 },
        { district: 'Lucknow', avgHours: 3.6, fillRate: 88.4, fastest: 22 },
        { district: 'Mau', avgHours: 4.2, fillRate: 86.0, fastest: 25 },
        { district: 'Ballia', avgHours: 4.8, fillRate: 82.5, fastest: 28 },
      ];
      const match = comparisons.find(c => c.district.toLowerCase() === dName.toLowerCase()) || {
        district: dName,
        avgHours: 3.2,
        fillRate: 89.5,
        fastest: 20
      };

      return {
        totalRequests: 32,
        assignedRequests: 29,
        pendingRequests: 3,
        avgAllocationTimeHours: match.avgHours,
        fastestAllocationMinutes: match.fastest,
        longestPendingHours: 6.2,
        districtComparison: [match]
      };
    }

    return {
      totalRequests: requests.length || 184,
      assignedRequests: assigned.length || 162,
      pendingRequests: requests.filter(r => r.status === 'SUBMITTED' || r.status === 'UNDER_REVIEW').length || 22,
      avgAllocationTimeHours: 3.4,
      fastestAllocationMinutes: 18,
      longestPendingHours: 14.5,
      districtComparison: [
        { district: 'Ghazipur', avgHours: 2.8, fillRate: 94.2 },
        { district: 'Varanasi', avgHours: 3.1, fillRate: 91.5 },
        { district: 'Lucknow', avgHours: 3.6, fillRate: 88.4 },
        { district: 'Mau', avgHours: 4.2, fillRate: 86.0 },
        { district: 'Ballia', avgHours: 4.8, fillRate: 82.5 },
      ]
    };
  },

  /**
   * Infrastructure Scale: physical & network operational assets
   */
  async getInfrastructureScale(filters?: PanIndiaGeoFilterParams): Promise<InfrastructureScaleMetrics> {
    await new Promise(r => setTimeout(r, 60));
    const libraries = mockStore.getLibraries();
    const teachers = mockStore.getTeachers();

    const isDistrictFiltered = !!(filters?.districtName && filters.districtName !== 'All Districts');

    if (isDistrictFiltered) {
      const gmvRes = await this.getPanIndiaGMV(filters);
      const dist = gmvRes.districts[0] || {
        activeLibraries: 12,
        activeTeachers: 48,
        activeStudents: 412
      };
      const seats = dist.activeLibraries * 60;
      const tStudents = dist.activeStudents;
      const lStudents = Math.round(tStudents * 0.6);

      return {
        operatingDistricts: 1,
        activeLibraries: dist.activeLibraries,
        totalLibrarySeats: seats,
        activeEducators: dist.activeTeachers,
        activeTuitionStudents: tStudents,
        activeLibraryStudents: lStudents,
        districtAdmins: 1,
      };
    }

    const totalSeats = libraries.reduce((acc, lib) => acc + (lib.totalSeats || 60), 0) || 1680;

    return {
      operatingDistricts: 7,
      activeLibraries: libraries.length || 28,
      totalLibrarySeats: totalSeats,
      activeEducators: teachers.filter(t => t.isActive).length || 148,
      activeTuitionStudents: 742,
      activeLibraryStudents: 890,
      districtAdmins: 7,
    };
  },

  /**
   * Attendance Overview for Pan-India Attendance Command Center (Section #12)
   */
  async getAttendanceOverview(filters?: PanIndiaGeoFilterParams) {
    await new Promise(r => setTimeout(r, 80));
    const isStateFiltered = filters?.stateName && filters.stateName !== 'All States';
    const isDistrictFiltered = filters?.districtName && filters.districtName !== 'All Districts';

    // Base multiplier based on scope
    const factor = isDistrictFiltered ? 0.35 : isStateFiltered ? 0.75 : 1.0;
    const totalSessions = Math.round(1840 * factor);
    const presentSessions = Math.round(1682 * factor);
    const absentSessions = Math.round(78 * factor);
    const lateSessions = Math.round(52 * factor);
    const leaveSessions = Math.max(1, Math.round(28 * factor));

    const checkInCount = presentSessions + lateSessions;
    const checkOutCount = Math.round(checkInCount * 0.96);
    const missingCheckoutCount = checkInCount - checkOutCount;
    const qrAttendanceCount = Math.round(checkInCount * 0.82);
    const manualAttendanceCount = checkInCount - qrAttendanceCount;
    const attendanceAnomaliesCount = Math.round(lateSessions * 0.4) + missingCheckoutCount;

    const studentAttendancePct = 92.4;
    const teacherAttendancePct = 96.8;
    const libraryAttendancePct = 89.2;
    const tuitionAttendancePct = 94.1;

    let districtBreakdown = [
      { district: 'Ghazipur', present: 93.4, sessions: Math.round(480 * factor), state: 'Uttar Pradesh' },
      { district: 'Varanasi', present: 92.0, sessions: Math.round(520 * factor), state: 'Uttar Pradesh' },
      { district: 'Lucknow', present: 90.8, sessions: Math.round(420 * factor), state: 'Uttar Pradesh' },
      { district: 'Ballia', present: 91.2, sessions: Math.round(310 * factor), state: 'Uttar Pradesh' },
      { district: 'Patna', present: 88.9, sessions: Math.round(420 * factor), state: 'Bihar' },
    ];

    if (isDistrictFiltered) {
      districtBreakdown = districtBreakdown.filter(d => d.district.toLowerCase() === filters!.districtName!.toLowerCase());
      if (districtBreakdown.length === 0) {
        districtBreakdown = [{ district: filters!.districtName!, present: 92.5, sessions: totalSessions, state: filters?.stateName || 'India' }];
      }
    } else if (isStateFiltered) {
      districtBreakdown = districtBreakdown.filter(d => d.state.toLowerCase() === filters!.stateName!.toLowerCase());
    }

    return {
      presentPercentage: Math.round((presentSessions / (totalSessions || 1)) * 1000) / 10,
      totalSessions,
      presentSessions,
      absentSessions,
      lateSessions,
      leaveSessions,
      // Section #12 specific metrics
      studentAttendance: { count: Math.round(presentSessions * 0.7), percentage: studentAttendancePct },
      teacherAttendance: { count: Math.round(presentSessions * 0.15), percentage: teacherAttendancePct },
      libraryAttendance: { count: Math.round(presentSessions * 0.1), percentage: libraryAttendancePct },
      tuitionAttendance: { count: Math.round(presentSessions * 0.05), percentage: tuitionAttendancePct },
      qrAttendanceCount,
      manualAttendanceCount,
      checkInCount,
      checkOutCount,
      lateAttendanceCount: lateSessions,
      missingCheckoutCount,
      attendanceAnomaliesCount,
      stateBreakdown: [
        { state: 'Uttar Pradesh', present: 92.1, sessions: Math.round(1420 * factor) },
        { state: 'Bihar', present: 88.9, sessions: Math.round(420 * factor) },
      ],
      districtBreakdown
    };
  }
};
