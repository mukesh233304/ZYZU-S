// FOCUSPOINT Finance OS — Teacher Payroll Service
import { mockStore } from '../mock/store';
import { TeacherPayrollItem, OfficialDocument } from '../types/finance';

export const payrollService = {
  /**
   * Retrieves teacher payroll records
   */
  async getPayrollItems(month: string = 'ALL', district: string = 'ALL', status: string = 'ALL', teacherId?: string): Promise<TeacherPayrollItem[]> {
    await new Promise(r => setTimeout(r, 70));
    return mockStore.getTeacherPayrollItems(month, district, status, teacherId);
  },

  async getTeacherPayroll(params?: { month?: string; district?: string; status?: string; teacherId?: string }): Promise<TeacherPayrollItem[]> {
    return this.getPayrollItems(params?.month || 'ALL', params?.district || 'ALL', params?.status || 'ALL', params?.teacherId);
  },

  /**
   * Retrieves single teacher payroll item by ID
   */
  async getPayrollById(id: string): Promise<TeacherPayrollItem | undefined> {
    await new Promise(r => setTimeout(r, 50));
    return mockStore.getTeacherPayrollById(id);
  },

  /**
   * Generates a teacher payroll run for a billing month
   */
  async generatePayrollRun(billingMonth: string = 'September 2026', district: string = 'ALL'): Promise<TeacherPayrollItem[]> {
    await new Promise(r => setTimeout(r, 150));
    return mockStore.generateTeacherPayrollRun(billingMonth, district);
  },

  /**
   * Enqueues teacher payroll item for disbursement
   */
  async queuePayrollItem(id: string): Promise<TeacherPayrollItem> {
    await new Promise(r => setTimeout(r, 80));
    return mockStore.queueTeacherPayroll(id);
  },

  /**
   * Super Admin directly disburses / pays teacher payroll
   */
  async payPayrollItem(
    payrollId: string,
    paymentMethod: string = 'NEFT_RTGS',
    transactionRef?: string
  ): Promise<{ success: boolean; item?: any; officialDocument?: OfficialDocument; error?: string }> {
    await new Promise(r => setTimeout(r, 200));
    return mockStore.payTeacherPayroll(payrollId, paymentMethod, transactionRef);
  },

  /**
   * Retrieves official salary slip document
   */
  async getSalarySlip(salarySlipNumber: string): Promise<OfficialDocument | null> {
    await new Promise(r => setTimeout(r, 50));
    return mockStore.getOfficialDocument(salarySlipNumber);
  }
};
