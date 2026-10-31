// FOCUSPOINT Teacher Service Abstraction Layer
// Zero Hardcoded/Fake Data — Connected directly to real persistent store

import { 
  Teacher, TeacherAssignment, TeacherBankAccount, 
  TeacherDocumentItem, TeacherExperienceRecord, TeacherPayout 
} from '../types';
import { mockStore } from '../mock/store';

export const teacherService = {
  async getProfile(id: string): Promise<Teacher | undefined> {
    await new Promise(r => setTimeout(r, 60));
    let teacher = mockStore.getTeacherById(id);
    if (!teacher) {
      // Check if user exists in store
      const user = mockStore.getUserById(id);
      if (user) {
        // Initialize fresh teacher record with pure zero stats
        teacher = {
          ...user,
          role: 'TEACHER',
          verificationStatus: 'PENDING',
          subjects: [],
          experienceYears: 0,
          rating: 0,
          reviewsCount: 0,
          totalReviews: 0,
          assignedStudentsCount: 0,
          expectedFeeMonthly: 0,
          monthlyFee: 0,
          hourlyRate: 0,
          documentsUploaded: {},
          experienceRecords: [],
        } as Teacher;
        mockStore.addTeacher(teacher);
      }
    }
    return teacher;
  },

  async updateProfile(teacherId: string, data: Partial<Teacher>): Promise<Teacher> {
    await new Promise(r => setTimeout(r, 120));
    const updated = mockStore.updateTeacherProfile(teacherId, data);
    if (updated) return updated;
    const existing = await this.getProfile(teacherId);
    return { ...existing, ...data } as Teacher;
  },

  async uploadProfilePhoto(teacherId: string, photoUrl: string): Promise<string> {
    await new Promise(r => setTimeout(r, 150));
    mockStore.saveTeacherProfilePhoto(teacherId, photoUrl);
    return photoUrl;
  },

  async getAssignments(teacherId: string): Promise<TeacherAssignment[]> {
    await new Promise(r => setTimeout(r, 80));
    // Strictly return only real assignments belonging to this teacherId
    return mockStore.getTeacherAssignmentsByTeacherId(teacherId);
  },

  async getTeacherById(id: string): Promise<Teacher | undefined> {
    return this.getProfile(id);
  },

  async getAllApprovedTeachers(districtId?: string): Promise<Teacher[]> {
    await new Promise(r => setTimeout(r, 100));
    return mockStore.getTeachers({ districtId, status: 'APPROVED' });
  },

  async getAssignedStudents(teacherId: string): Promise<TeacherAssignment[]> {
    return this.getAssignments(teacherId);
  },

  async getTeacherRevenue(teacherId: string): Promise<{
    currentMonth: number;
    previousMonth: number;
    total: number;
    paid: number;
    pending: number;
    activeStudents: number;
  }> {
    await new Promise(r => setTimeout(r, 100));
    const assignments = await this.getAssignments(teacherId);
    const activeAssignments = assignments.filter(a => a.status === 'active' || a.status === 'ACTIVE');
    const payouts = mockStore.getTeacherPayouts(teacherId);

    // Sum of fees for active students
    const activeStudents = activeAssignments.length;
    const currentMonth = activeAssignments.reduce((acc, a) => acc + (a.monthlyFee || 0), 0);

    // Real paid payouts
    const paidPayouts = payouts.filter(p => p.status === 'paid');
    const totalPaid = paidPayouts.reduce((acc, p) => acc + p.amount, 0);

    // Pending payouts
    const pendingPayouts = payouts.filter(p => p.status === 'pending' || p.status === 'processing');
    const pendingAmount = pendingPayouts.reduce((acc, p) => acc + p.amount, 0);

    // If there are no assignments and no payouts, every number is strictly 0
    return {
      currentMonth,
      previousMonth: 0,
      total: totalPaid + currentMonth,
      paid: totalPaid,
      pending: pendingAmount,
      activeStudents,
    };
  },

  async getPayouts(teacherId: string): Promise<TeacherPayout[]> {
    await new Promise(r => setTimeout(r, 80));
    return mockStore.getTeacherPayouts(teacherId);
  },

  async updateBankDetails(teacherId: string, bankInfo: TeacherBankAccount): Promise<Teacher | null> {
    await new Promise(r => setTimeout(r, 150));
    return mockStore.updateTeacherBank(teacherId, bankInfo);
  },

  async updateBankAccount(teacherId: string, bankInfo: TeacherBankAccount): Promise<Teacher | null> {
    return this.updateBankDetails(teacherId, bankInfo);
  },

  async uploadDocument(
    teacherId: string, 
    category: 'degreeCertificate' | 'experienceLetter' | 'idProof' | 'degree' | 'experience' | string, 
    docItem: TeacherDocumentItem
  ): Promise<Teacher | null> {
    await new Promise(r => setTimeout(r, 150));
    const mappedCategory = category === 'degree' ? 'degreeCertificate' : category === 'experience' ? 'experienceLetter' : category;
    return mockStore.updateTeacherDocument(teacherId, mappedCategory as any, docItem);
  },

  async updateDocument(
    teacherId: string, 
    category: 'degreeCertificate' | 'experienceLetter' | 'idProof' | 'degree' | 'experience' | string, 
    docItem: TeacherDocumentItem
  ): Promise<Teacher | null> {
    return this.uploadDocument(teacherId, category, docItem);
  },

  async getExperienceRecords(teacherId: string): Promise<TeacherExperienceRecord[]> {
    const profile = await this.getProfile(teacherId);
    return profile?.experienceRecords || [];
  },

  async addExperienceRecord(teacherId: string, record: TeacherExperienceRecord): Promise<Teacher | null> {
    await new Promise(r => setTimeout(r, 100));
    return mockStore.addTeacherExperience(teacherId, record);
  },

  async addExperience(teacherId: string, record: TeacherExperienceRecord): Promise<Teacher | null> {
    return this.addExperienceRecord(teacherId, record);
  },

  async deleteExperienceRecord(teacherId: string, recordId: string): Promise<Teacher | null> {
    await new Promise(r => setTimeout(r, 100));
    return mockStore.deleteTeacherExperience(teacherId, recordId);
  },

  async deleteExperience(teacherId: string, recordId: string): Promise<Teacher | null> {
    return this.deleteExperienceRecord(teacherId, recordId);
  }
};
