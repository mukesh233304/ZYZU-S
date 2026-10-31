import { describe, it, expect, beforeEach } from 'vitest';
import { reportService } from '../services/reportService';
import { safeStorage } from '../utils/storageUtils';

describe('FOCUSPOINT — SUPER ADMIN SOVEREIGN INTELLIGENCE REPORT MASTER SUITE', () => {
  beforeEach(() => {
    safeStorage.removeItem('fp_scheduled_report_dispatches_v1');
    safeStorage.removeItem('fp_custom_report_queries_v1');
  });

  describe('1. Pan-India Macro Overview Intelligence', () => {
    it('generates high-fidelity macro summary with correct vertical split and take-rate', async () => {
      const macro = await reportService.getPanIndiaMacroReport('Last 30 Days (Current Month)');

      expect(macro).toBeDefined();
      expect(macro.reportingPeriod).toBe('Last 30 Days (Current Month)');
      expect(macro.grossGMV).toBeGreaterThan(0);
      expect(macro.platformNetRevenue).toBeGreaterThan(0);
      expect(macro.payoutsDisbursed).toBeGreaterThan(0);
      expect(macro.blendedTakeRate).toBe(8.8);
      expect(macro.attendanceIntegrity).toBeGreaterThan(90);

      // Verify vertical split sum matches gross GMV
      const { homeTuitionGMV, studyLibraryGMV, mockExamGMV, studyVaultGMV } = macro.verticalSplit;
      expect(homeTuitionGMV).toBeGreaterThan(studyLibraryGMV);
      expect(studyLibraryGMV).toBeGreaterThan(mockExamGMV);
      expect(mockExamGMV).toBeGreaterThan(studyVaultGMV);
      const splitSum = homeTuitionGMV + studyLibraryGMV + mockExamGMV + studyVaultGMV;
      expect(Math.abs(splitSum - macro.grossGMV)).toBeLessThan(100);
    });

    it('scales metrics deterministically across date range presets', async () => {
      const weekly = await reportService.getPanIndiaMacroReport('Last 7 Days');
      const monthly = await reportService.getPanIndiaMacroReport('Last 30 Days');
      const annual = await reportService.getPanIndiaMacroReport('Financial Year 2026-27');

      expect(weekly.grossGMV).toBeLessThan(monthly.grossGMV);
      expect(monthly.grossGMV).toBeLessThan(annual.grossGMV);
      expect(annual.grossGMV).toBe(monthly.grossGMV * 12);
    });
  });

  describe('2. State & District Territory Dossiers', () => {
    it('generates state report summary with correct district counts and attendance', async () => {
      const upReport = await reportService.getStateReport('Uttar Pradesh', 'Last 30 Days');

      expect(upReport.stateName).toBe('Uttar Pradesh');
      expect(upReport.totalDistricts).toBe(6);
      expect(upReport.totalStudents).toBeGreaterThan(1000);
      expect(upReport.totalTeachers).toBeGreaterThan(100);
      expect(upReport.overallAttendanceRate).toBeGreaterThan(90);
      expect(upReport.grossGMV).toBeGreaterThan(upReport.platformRevenue);
    });

    it('generates district-scoped operational audit with tuition and library breakdown', async () => {
      const ghazipur = await reportService.getDistrictReport('Ghazipur', 'Last 30 Days');

      expect(ghazipur.districtName).toBe('Ghazipur');
      expect(ghazipur.adminName).toBe('Virendra Pratap Singh');
      expect(ghazipur.adminStatus).toBe('ACTIVE');
      expect(ghazipur.tuitionGMV).toBe(240000);
      expect(ghazipur.libraryGMV).toBe(78000);
      expect(ghazipur.totalGMV).toBe(318000);
      expect(ghazipur.educatorPayouts).toBe(220800);
      expect(ghazipur.libraryPayouts).toBe(71760);
      expect(ghazipur.platformCommission).toBe(25440);
      expect(ghazipur.netRevenue).toBe(ghazipur.platformCommission - ghazipur.districtExpenses);
    });

    it('adjusts district figures dynamically based on territory weighting for Varanasi and Lucknow', async () => {
      const ghazipur = await reportService.getDistrictReport('Ghazipur', 'Last 30 Days');
      const varanasi = await reportService.getDistrictReport('Varanasi', 'Last 30 Days');
      const lucknow = await reportService.getDistrictReport('Lucknow', 'Last 30 Days');

      expect(varanasi.totalGMV).toBeGreaterThan(ghazipur.totalGMV);
      expect(lucknow.totalGMV).toBeGreaterThan(varanasi.totalGMV);
      expect(varanasi.adminName).toBe('Dr. Rajeshwar Sharma');
      expect(lucknow.adminName).toBe('Ananya Saxena');
    });
  });

  describe('3. Comparative Territory Matrix League Table', () => {
    it('compiles multi-district comparison matrix with health scores and velocity', async () => {
      const matrix = await reportService.getTerritoryComparisonMatrix('Uttar Pradesh', 'Last 30 Days');

      expect(matrix.length).toBeGreaterThanOrEqual(8);
      const gzp = matrix.find(m => m.districtName === 'Ghazipur');
      expect(gzp).toBeDefined();
      expect(gzp?.coordinatorName).toBe('Virendra Pratap Singh');
      expect(gzp?.healthScore).toBeGreaterThanOrEqual(80);
      expect(gzp?.healthScore).toBeLessThanOrEqual(100);

      // Verify all items have positive GMVs and attendance rates
      matrix.forEach(row => {
        expect(row.grossGMV).toBeGreaterThan(0);
        expect(row.attendanceRate).toBeGreaterThan(85);
        expect(row.fulfillmentVelocityHours).toBeGreaterThan(0);
      });
    });
  });

  describe('4. Vertical-Specific Intelligence', () => {
    it('retrieves detailed metrics for all 4 operational verticals', async () => {
      const allVerts = await reportService.getAllVerticals('Pan-India', 'Last 30 Days');

      expect(allVerts.length).toBe(4);
      const tuition = allVerts.find(v => v.verticalKey === 'HOME_TUITION');
      const library = allVerts.find(v => v.verticalKey === 'STUDY_LIBRARY');
      const mocks = allVerts.find(v => v.verticalKey === 'MOCK_EXAMS');
      const vault = allVerts.find(v => v.verticalKey === 'STUDY_VAULT');

      expect(tuition).toBeDefined();
      expect(library).toBeDefined();
      expect(mocks).toBeDefined();
      expect(vault).toBeDefined();

      expect(tuition?.unitLabel).toContain('Tuition Hours');
      expect(library?.unitLabel).toContain('Desk Shifts');
      expect(mocks?.unitLabel).toContain('Test Attempts');
      expect(vault?.unitLabel).toContain('PDF Downloads');

      expect(tuition?.topPerformers.length).toBeGreaterThan(0);
      expect(library?.keyMetrics.length).toBeGreaterThan(0);
    });
  });

  describe('5. AI Cognitive Radar & Anomaly Detection', () => {
    it('generates multi-category actionable cognitive insights with severity tags', async () => {
      const insights = await reportService.getAiCognitiveInsights('Ghazipur');

      expect(insights.length).toBe(4);
      const categories = insights.map(i => i.category);
      expect(categories).toContain('OPPORTUNITY');
      expect(categories).toContain('BOTTLENECK');
      expect(categories).toContain('ANOMALY');
      expect(categories).toContain('FORECAST');

      insights.forEach(item => {
        expect(item.confidenceScore).toBeGreaterThanOrEqual(85);
        expect(item.recommendedAction).toBeDefined();
        expect(item.metricImpact).toBeDefined();
      });
    });
  });

  describe('6. Statutory GST & Legal Compliance Audit', () => {
    it('computes 18% GST split into CGST (9%) and SGST (9%) with ITC deduction', async () => {
      const audit = await reportService.getRegulatoryTaxAudit('Pan-India', 'Last 30 Days');

      expect(audit.gstTotalRatePercent).toBe(18);
      expect(audit.cgstAmount).toBe(audit.sgstAmount);
      expect(audit.cgstAmount + audit.sgstAmount).toBe(Math.round(audit.grossTaxableGMV * 0.18));
      expect(audit.netGstPayable).toBe((audit.cgstAmount + audit.sgstAmount) - audit.inputTaxCreditEligible);
      expect(audit.tdsDeductedOnPayouts).toBeGreaterThan(0);

      // Verify legal compliance rates
      expect(audit.educatorKycComplianceRate).toBeGreaterThan(95);
      expect(audit.policeClearanceRate).toBeGreaterThan(95);
      expect(audit.libraryFireSafetyScore).toBeGreaterThan(90);
      expect(audit.cctvBiometricIntegrity).toBeGreaterThan(95);
    });
  });

  describe('7. Custom On-Demand Query Engine', () => {
    it('executes user-defined query definition and returns formatted tabular records', async () => {
      const res = await reportService.runCustomQuery({
        title: 'High-Level GMV and Attendance Query',
        dateRange: 'Last 30 Days',
        territoryLevel: 'PAN_INDIA',
        selectedVerticals: ['ALL'],
        metrics: ['GMV', 'NET_REVENUE', 'STUDENTS', 'ATTENDANCE', 'GROWTH'],
        groupBy: 'TERRITORY'
      });

      expect(res.totalRecords).toBeGreaterThanOrEqual(8);
      expect(res.columns).toContain('Territory');
      expect(res.columns).toContain('Gross GMV (₹)');
      expect(res.columns).toContain('Platform Revenue (₹)');
      expect(res.columns).toContain('Enrolled Students');
      expect(res.columns).toContain('Attendance Integrity');
      expect(res.columns).toContain('Operational Health');
      expect(res.rows.length).toBe(res.totalRecords);
    });

    it('filters custom query results by specific territory when district level is chosen', async () => {
      const res = await reportService.runCustomQuery({
        title: 'Ghazipur Only Query',
        dateRange: 'Last 30 Days',
        territoryLevel: 'DISTRICT',
        selectedDistrict: 'Ghazipur',
        selectedVerticals: ['ALL'],
        metrics: ['GMV', 'NET_REVENUE'],
        groupBy: 'TERRITORY'
      });

      expect(res.totalRecords).toBe(1);
      expect(res.rows[0]['Territory']).toBe('Ghazipur');
    });
  });

  describe('8. Automated Scheduled Dispatches Management', () => {
    it('retrieves default initial scheduled dispatches', async () => {
      const dispatches = await reportService.getScheduledDispatches();
      expect(dispatches.length).toBeGreaterThanOrEqual(3);
      expect(dispatches[0].id).toBe('disp-001');
      expect(dispatches[0].active).toBe(true);
    });

    it('creates, saves, and persists a new scheduled dispatch', async () => {
      const created = await reportService.saveScheduledDispatch({
        title: 'Weekly Executive Board Report',
        frequency: 'WEEKLY',
        format: 'PDF',
        targetLevel: 'PAN_INDIA',
        territoryName: 'Pan-India',
        recipients: ['board@focuspoint.edu'],
        active: true
      });

      expect(created.id).toBeDefined();
      expect(created.title).toBe('Weekly Executive Board Report');

      const list = await reportService.getScheduledDispatches();
      expect(list.some(d => d.id === created.id)).toBe(true);
    });

    it('toggles scheduled dispatch active status', async () => {
      const updated = await reportService.toggleScheduledDispatch('disp-001');
      expect(updated).toBeDefined();
      expect(updated?.active).toBe(false);

      const reUpdated = await reportService.toggleScheduledDispatch('disp-001');
      expect(reUpdated?.active).toBe(true);
    });

    it('deletes a scheduled dispatch', async () => {
      const initial = await reportService.getScheduledDispatches();
      const count = initial.length;

      const success = await reportService.deleteScheduledDispatch('disp-003');
      expect(success).toBe(true);

      const after = await reportService.getScheduledDispatches();
      expect(after.length).toBe(count - 1);
      expect(after.some(d => d.id === 'disp-003')).toBe(false);
    });
  });

  describe('9. Multi-Format Exporter & Markdown Briefing', () => {
    it('formats plaintext / markdown executive briefing with cryptographic seal header', () => {
      const md = reportService.formatMarkdownBriefing('Ghazipur District Dossier', [
        { label: 'Gross GMV', value: '₹3,18,000' },
        { label: 'Net Retained Margin', value: '₹15,900' },
        { label: 'Attendance Rate', value: '93.8%' }
      ]);

      expect(md).toContain('# 📊 FOCUSPOINT EXECUTIVE INTELLIGENCE BRIEFING');
      expect(md).toContain('Ghazipur District Dossier');
      expect(md).toContain('**Gross GMV**: ₹3,18,000');
      expect(md).toContain('**Net Retained Margin**: ₹15,900');
      expect(md).toContain('SHA-256 Authority');
    });

    it('exports CSV, JSON, and PDF formats without throwing exceptions', async () => {
      const sampleData = [{ Territory: 'Ghazipur', GMV: 318000 }];

      const csvResult = await reportService.exportReport(sampleData, 'Ghazipur Summary', 'CSV');
      expect(csvResult.success).toBe(true);
      expect(csvResult.filename).toContain('.csv');

      const jsonResult = await reportService.exportReport(sampleData, 'Ghazipur Summary', 'JSON');
      expect(jsonResult.success).toBe(true);
      expect(jsonResult.filename).toContain('.json');

      const pdfResult = await reportService.exportReport(sampleData, 'Ghazipur Summary', 'PDF');
      expect(pdfResult.success).toBe(true);
      expect(pdfResult.filename).toContain('.pdf');
    });
  });
});
