// FOCUSPOINT — Operator Content Analytics & Pan-India Reach Studio Master Suite
// Verifies Non-Financial Academic Intelligence, Real-Time Student Telemetry,
// 24-Hour Study Cadence, Geographic Reach Vectors, and Dossier Export Integrity.

import { describe, it, expect, beforeEach } from 'vitest';
import { operatorAnalyticsService } from '../services/operatorAnalyticsService';
import { mockStore } from '../mock/store';

describe('FOCUSPOINT — Operator Content Analytics & Pan-India Reach Studio Master Suite', () => {
  const operatorId = 'usr-operator-sunita';

  beforeEach(() => {
    // Setup state before tests
  });

  describe('1. Non-Financial Telemetry & KPI Calculations', () => {
    it('Should fetch comprehensive analytics and produce all 6 primary telemetry KPIs', async () => {
      const data = await operatorAnalyticsService.getComprehensiveAnalytics(operatorId, '30D', 'ALL');

      expect(data).toBeDefined();
      expect(data.operatorId).toBe(operatorId);
      expect(data.antiTamperHash).toMatch(/^SHA256-/);

      // Verify 6 KPIs
      expect(data.kpis.totalViews).toBeGreaterThan(0);
      expect(data.kpis.totalDownloads).toBeGreaterThan(0);
      expect(data.kpis.mockAttempts).toBeGreaterThan(0);
      expect(data.kpis.avgDwellTimeFormatted).toBeDefined();
      expect(data.kpis.pedagogicalQualityScore).toBeGreaterThanOrEqual(90);
      expect(data.kpis.activePanIndiaReachCount).toBeGreaterThanOrEqual(20);
    });

    it('Should correctly scale metrics across different time horizons', async () => {
      const data24H = await operatorAnalyticsService.getComprehensiveAnalytics(operatorId, '24H', 'ALL');
      const data30D = await operatorAnalyticsService.getComprehensiveAnalytics(operatorId, '30D', 'ALL');
      const dataAll = await operatorAnalyticsService.getComprehensiveAnalytics(operatorId, 'ALL', 'ALL');

      // 24H should be less than 30D, which should be less than ALL
      expect(data24H.kpis.totalViews).toBeLessThan(data30D.kpis.totalViews);
      expect(data30D.kpis.totalViews).toBeLessThan(dataAll.kpis.totalViews);
      expect(data24H.kpis.totalDownloads).toBeLessThan(data30D.kpis.totalDownloads);
    });

    it('Should calculate realistic academic funnel conversion metrics', async () => {
      const data = await operatorAnalyticsService.getComprehensiveAnalytics(operatorId, '30D', 'ALL');
      const { funnel } = data;

      expect(funnel.impressions).toBeGreaterThan(funnel.clicksToView);
      expect(funnel.clicksToView).toBeGreaterThan(funnel.downloadsCount);
      expect(funnel.viewConversionPct).toBeGreaterThan(0);
      expect(funnel.downloadConversionPct).toBeGreaterThan(0);
      expect(funnel.testCompletionPct).toBeGreaterThan(80);
    });
  });

  describe('2. 24-Hour Hourly Consumption Cadence & Peak Windows', () => {
    it('Should generate 24 hourly data points representing a full diurnal cycle', async () => {
      const data = await operatorAnalyticsService.getComprehensiveAnalytics(operatorId, '30D', 'ALL');
      expect(data.hourlyCurve).toHaveLength(24);

      // Verify morning rush and evening mock drill peaks
      const morningHour = data.hourlyCurve.find(h => h.hourNumber === 7);
      const eveningHour = data.hourlyCurve.find(h => h.hourNumber === 21);
      const lateNightHour = data.hourlyCurve.find(h => h.hourNumber === 3);

      expect(morningHour?.isPeakStudyWindow).toBe(true);
      expect(eveningHour?.isPeakStudyWindow).toBe(true);
      expect(lateNightHour?.isPeakStudyWindow).toBe(false);

      // Evening peak should have higher view cadence than 3 AM
      expect(eveningHour!.views).toBeGreaterThan(lateNightHour!.views);
    });
  });

  describe('3. Pan-India Geographic Reach Hubs & Tier Penetration', () => {
    it('Should return geographic hubs spanning Tier-1, Tier-2, and Tier-3 rural clusters', async () => {
      const data = await operatorAnalyticsService.getComprehensiveAnalytics(operatorId, '30D', 'ALL');
      expect(data.geographicHubs.length).toBeGreaterThanOrEqual(8);

      const tier1 = data.geographicHubs.filter(h => h.tier === 'TIER_1');
      const tier2 = data.geographicHubs.filter(h => h.tier === 'TIER_2');
      const rural = data.geographicHubs.filter(h => h.tier === 'TIER_3_RURAL');

      expect(tier1.length).toBeGreaterThanOrEqual(1);
      expect(tier2.length).toBeGreaterThanOrEqual(1);
      expect(rural.length).toBeGreaterThanOrEqual(1);

      // Verify essential exam hubs are present
      const prayagraj = data.geographicHubs.find(h => h.district.includes('Prayagraj'));
      const patna = data.geographicHubs.find(h => h.district.includes('Patna'));

      expect(prayagraj).toBeDefined();
      expect(patna).toBeDefined();
      expect(prayagraj?.activeLearners).toBeGreaterThan(0);
    });
  });

  describe('4. Real-Time Student Activity Feed Simulation', () => {
    it('Should provide an active feed and inject live student events dynamically', async () => {
      const initialData = await operatorAnalyticsService.getComprehensiveAnalytics(operatorId, '30D', 'ALL');
      const initialCount = initialData.liveActivityFeed.length;
      expect(initialCount).toBeGreaterThan(0);

      // Simulate a live student pulse
      const newEvent = operatorAnalyticsService.simulateLiveStudentEvent('UP State Exams');
      expect(newEvent.id).toBeDefined();
      expect(newEvent.studentNameMasked).toMatch(/\*\*\*$/);
      expect(newEvent.location).toBeDefined();

      // Re-fetch and verify event is at the top of the feed
      const refreshedData = await operatorAnalyticsService.getComprehensiveAnalytics(operatorId, '30D', 'ALL');
      expect(refreshedData.liveActivityFeed[0].id).toBe(newEvent.id);
      expect(refreshedData.liveActivityFeed.length).toBeGreaterThanOrEqual(initialCount);
    });
  });

  describe('5. Subject Impact & Student Pedagogical Reviews', () => {
    it('Should categorize academic performance across major syllabus domains', async () => {
      const data = await operatorAnalyticsService.getComprehensiveAnalytics(operatorId, '30D', 'ALL');
      expect(data.subjectImpacts.length).toBeGreaterThanOrEqual(4);

      const quants = data.subjectImpacts.find(s => s.subject.includes('Quantitative'));
      expect(quants).toBeDefined();
      expect(quants?.totalViews).toBeGreaterThan(0);
      expect(quants?.avgStudentScore).toBeGreaterThan(50);
      expect(quants?.studentRating).toBeGreaterThanOrEqual(4.5);
    });

    it('Should provide verified student reviews with accuracy tags', async () => {
      const data = await operatorAnalyticsService.getComprehensiveAnalytics(operatorId, '30D', 'ALL');
      expect(data.studentReviews.length).toBeGreaterThanOrEqual(4);

      const review = data.studentReviews[0];
      expect(review.studentName).toBeDefined();
      expect(review.rating).toBeGreaterThanOrEqual(4);
      expect(review.verifiedStudent).toBe(true);
      expect(review.accuracyTag).toBeDefined();
    });
  });

  describe('6. Asset Deep Dive Telemetry & Cohort Analysis', () => {
    it('Should retrieve granular telemetry for a specific study material or mock test', () => {
      const deepDive = operatorAnalyticsService.getAssetDeepDive(
        'mat-101', 
        'SSC CGL Quants 500 Formula Mastery', 
        'STUDY_MATERIAL'
      );

      expect(deepDive.id).toBe('mat-101');
      expect(deepDive.title).toBe('SSC CGL Quants 500 Formula Mastery');
      expect(deepDive.completionRatePct).toBeGreaterThan(80);
      expect(deepDive.difficultyPacing.easyQuestionsCorrectPct).toBeGreaterThan(deepDive.difficultyPacing.hardQuestionsCorrectPct);
      expect(deepDive.topStumbleQuestionTopics.length).toBeGreaterThanOrEqual(2);
      expect(deepDive.pedagogicalRecommendations.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('7. Verifiable Dossier Export (JSON & CSV)', () => {
    it('Should export valid JSON dossier containing complete telemetry with hash', async () => {
      const data = await operatorAnalyticsService.getComprehensiveAnalytics(operatorId, '30D', 'ALL');
      const jsonStr = operatorAnalyticsService.exportDossier(data, 'JSON');

      expect(typeof jsonStr).toBe('string');
      const parsed = JSON.parse(jsonStr);
      expect(parsed.operatorId).toBe(operatorId);
      expect(parsed.antiTamperHash).toBe(data.antiTamperHash);
      expect(parsed.kpis.totalViews).toBe(data.kpis.totalViews);
    });

    it('Should export valid CSV dossier containing formatted sections and headers', async () => {
      const data = await operatorAnalyticsService.getComprehensiveAnalytics(operatorId, '30D', 'ALL');
      const csvStr = operatorAnalyticsService.exportDossier(data, 'CSV');

      expect(typeof csvStr).toBe('string');
      expect(csvStr).toContain('FOCUSPOINT PAN-INDIA OPERATOR CONTENT ANALYTICS & REACH DOSSIER');
      expect(csvStr).toContain(operatorId);
      expect(csvStr).toContain(data.antiTamperHash);
      expect(csvStr).toContain('GEOGRAPHIC REACH HUB');
      expect(csvStr).toContain('SUBJECT IMPACT');
    });
  });

  describe('8. State Reach Aggregates & Regional Density', () => {
    it('Should calculate state aggregates and verify high density states like UP, Bihar, and Delhi', async () => {
      const data = await operatorAnalyticsService.getComprehensiveAnalytics(operatorId, '30D', 'ALL');
      expect(data.stateAggregates.length).toBeGreaterThanOrEqual(4);

      const up = data.stateAggregates.find(s => s.code === 'UP');
      const bihar = data.stateAggregates.find(s => s.code === 'BR');

      expect(up).toBeDefined();
      expect(bihar).toBeDefined();
      expect(up?.densityRank).toBe(1);
      expect(up?.ruralReachPct).toBeGreaterThan(40);
      expect(bihar?.topExamPreference).toContain('Railway');
    });
  });

  describe('9. 24-Hour Diurnal Time-Travel Scrubber & Hourly Telemetry', () => {
    it('Should return hourly telemetry for any scrubbed hour with behavior tag and examinees', async () => {
      const data = await operatorAnalyticsService.getComprehensiveAnalytics(operatorId, '30D', 'ALL');
      
      const hour20 = operatorAnalyticsService.getHourlyTelemetryAtHour(20, data);
      expect(hour20.hourNumber).toBe(20);
      expect(hour20.isPeakStudyWindow).toBe(true);
      expect(hour20.studyBehaviorTag).toBeDefined();
      expect(hour20.activeConcurrentLearners).toBeGreaterThan(0);

      const hour3 = operatorAnalyticsService.getHourlyTelemetryAtHour(3, data);
      expect(hour3.hourNumber).toBe(3);
      expect(hour3.isPeakStudyWindow).toBe(false);
      expect(hour20.views).toBeGreaterThan(hour3.views);
    });
  });

  describe('10. Cognitive Stumble Topic Radar & AI Studio Remedial Prompts', () => {
    it('Should identify low-accuracy chapters and provide recommended corrective actions and prompts', () => {
      const stumbleTopics = operatorAnalyticsService.getStumbleTopics();
      expect(stumbleTopics.length).toBeGreaterThanOrEqual(3);

      const topStumble = stumbleTopics[0];
      expect(topStumble.accuracyPct).toBeLessThan(60);
      expect(topStumble.distractorConfusionRatio).toBeGreaterThan(30);
      expect(topStumble.affectedStudentsCount).toBeGreaterThan(1000);
      expect(topStumble.recommendedAction).toBeDefined();
      expect(topStumble.suggestedPrompt).toBeDefined();
    });
  });

  describe('11. What-If Predictive Reach Simulation Engine', () => {
    it('Should calculate realistic incremental lifts when adjusting publishing roadmap', async () => {
      const data = await operatorAnalyticsService.getComprehensiveAnalytics(operatorId, '30D', 'ALL');
      
      const forecast = operatorAnalyticsService.calculatePredictiveReach({
        newMaterialsCount: 4,
        newMockTestsCount: 2,
        hindiCoveragePct: 90
      }, data);

      expect(forecast.forecastedViews).toBeGreaterThan(data.kpis.totalViews);
      expect(forecast.forecastedDownloads).toBeGreaterThan(data.kpis.totalDownloads);
      expect(forecast.forecastedMockAttempts).toBeGreaterThan(data.kpis.mockAttempts);
      expect(forecast.ruralExpansionRatePct).toBeGreaterThan(50);
      expect(forecast.projectedQualityScore).toBeGreaterThanOrEqual(data.kpis.pedagogicalQualityScore);
    });
  });
});

