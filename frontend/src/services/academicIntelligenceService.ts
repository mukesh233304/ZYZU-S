// FOCUSPOINT Executive Academic Intelligence & Policy Controls Service

import { mockStore } from '../mock/store';
import {
  AcademicKPIOverview,
  PerformanceThresholdConfig,
  AIControlConfig
} from '../types/academicIntelligence';

export class AcademicIntelligenceService {
  /**
   * Retrieves platform-wide, state, or district-isolated academic KPIs
   */
  public async getKPIOverview(filter?: string | { state?: string; district?: string; locality?: string }): Promise<AcademicKPIOverview> {
    await this.delay(80);
    const dist = typeof filter === 'string' ? filter : filter?.district;
    return mockStore.getAcademicKPIOverview(dist);
  }

  /**
   * Fetches active configurable performance thresholds
   */
  public async getThresholds(): Promise<PerformanceThresholdConfig> {
    await this.delay(50);
    return mockStore.getAcademicThresholds();
  }

  /**
   * Updates performance thresholds (Excellent, Good, Average, Minimum Tests)
   */
  public async updateThresholds(updates: Partial<PerformanceThresholdConfig>, adminName?: string): Promise<PerformanceThresholdConfig> {
    await this.delay(100);
    return mockStore.updateAcademicThresholds(updates, adminName);
  }

  /**
   * Fetches AI Control & Quality Validation Configuration
   */
  public async getAIControlConfig(): Promise<AIControlConfig> {
    await this.delay(50);
    return mockStore.getAIControlConfig();
  }

  /**
   * Updates AI engine policies and limits
   */
  public async updateAIControlConfig(updates: Partial<AIControlConfig>): Promise<AIControlConfig> {
    await this.delay(100);
    return mockStore.updateAIControlConfig(updates);
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const academicIntelligenceService = new AcademicIntelligenceService();
