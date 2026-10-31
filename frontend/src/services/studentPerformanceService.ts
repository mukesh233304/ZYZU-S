// FOCUSPOINT Student Performance & Academic Growth Service

import { mockStore } from '../mock/store';
import {
  StudentPerformanceMetrics,
  WeeklyGrowthReport,
  MonthlyGrowthReport,
  PersonalizedRecommendation,
  StudentAchievement,
  StudentTestRecord,
  MistakeBookItem
} from '../types/academicIntelligence';

export class StudentPerformanceService {
  /**
   * Fetches real calculated student performance metrics.
   * Returns empty states with zero fake values if insufficient assessments exist.
   */
  public async getPerformanceOverview(studentId: string): Promise<StudentPerformanceMetrics> {
    await this.delay(100);
    return mockStore.getStudentPerformance(studentId);
  }

  /**
   * Fetches the 7-day weekly academic growth report
   */
  public async getWeeklyGrowthReport(studentId: string): Promise<WeeklyGrowthReport> {
    await this.delay(100);
    return mockStore.getStudentWeeklyGrowth(studentId);
  }

  /**
   * Fetches historical or current monthly academic performance report
   */
  public async getMonthlyGrowthReport(studentId: string, monthYear: string = '2026-09'): Promise<MonthlyGrowthReport> {
    await this.delay(100);
    return mockStore.getStudentMonthlyGrowth(studentId, monthYear);
  }

  /**
   * Fetches transparent graduated learning recommendations (Level 1-4)
   */
  public async getPersonalizedRecommendations(studentId: string): Promise<PersonalizedRecommendation[]> {
    await this.delay(100);
    return mockStore.getGraduatedRecommendations(studentId);
  }

  /**
   * Fetches verified student achievements
   */
  public async getAchievements(studentId: string): Promise<StudentAchievement[]> {
    await this.delay(80);
    return mockStore.getStudentAchievements(studentId);
  }

  /**
   * Records a teacher-entered test result with relationship validation
   */
  public async recordTeacherTestResult(
    data: Omit<StudentTestRecord, 'id' | 'createdAt' | 'updatedAt'>,
    teacherId: string,
    isSuperAdmin: boolean = false
  ): Promise<{ success: boolean; record?: StudentTestRecord; error?: string }> {
    await this.delay(150);
    return mockStore.recordTeacherTestResult(data, teacherId, isSuperAdmin);
  }

  /**
   * Deletes a recorded test result
   */
  public async deleteTestResult(testId: string, teacherId: string, isSuperAdmin: boolean = false): Promise<boolean> {
    await this.delay(100);
    return mockStore.deleteTeacherTestResult(testId, teacherId, isSuperAdmin);
  }

  /**
   * Fetches tests recorded by a teacher
   */
  public async getTeacherTests(teacherId: string, studentId?: string): Promise<StudentTestRecord[]> {
    await this.delay(100);
    return mockStore.getTeacherEnteredStudentTests(teacherId, studentId);
  }

  /**
   * Fetches a student's personal mistake book items
   */
  public async getMistakeBook(studentId: string, filters?: { subject?: string; isUnderstood?: boolean }): Promise<MistakeBookItem[]> {
    await this.delay(100);
    return mockStore.getStudentMistakeBook(studentId, filters);
  }

  /**
   * Updates mistake item personal notes or mark as understood
   */
  public async updateMistakeItem(mistakeId: string, updates: Partial<MistakeBookItem>): Promise<MistakeBookItem | undefined> {
    await this.delay(80);
    return mockStore.updateMistakeItem(mistakeId, updates);
  }

  /**
   * Retries an incorrectly answered question
   */
  public async retryMistake(mistakeId: string, selectedAnswer: string): Promise<{ isCorrect: boolean; explanation: string }> {
    await this.delay(100);
    return mockStore.retryMistakeQuestion(mistakeId, selectedAnswer);
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const studentPerformanceService = new StudentPerformanceService();
