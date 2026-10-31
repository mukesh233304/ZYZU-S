import { describe, it, expect, beforeEach } from 'vitest';
import { superAdminService, HOME_TUITION_STUDENTS_STORAGE_KEY } from '../services/superAdminService';
import { auditService } from '../services/auditService';
import { mockStore } from '../mock/store';
import { safeStorage } from '../utils/storageUtils';

describe('FOCUSPOINT — Super Admin Home Tuition Students Console Suite', () => {
  beforeEach(() => {
    safeStorage.removeItem(HOME_TUITION_STUDENTS_STORAGE_KEY);
  });

  it('retrieves comprehensive Pan-India home tuition student roster with telemetry', async () => {
    const students = await superAdminService.getPanIndiaHomeTuitionStudents();
    expect(students).toBeDefined();
    expect(students.length).toBeGreaterThanOrEqual(15);

    const aryan = students.find(s => s.name === 'Aryan Singh');
    expect(aryan).toBeDefined();
    expect(aryan?.districtName).toBe('Ghazipur');
    expect(aryan?.stateName).toBe('Uttar Pradesh');
    expect(aryan?.rollNumber).toBe('FP-HTS-2026-0814');
    expect(aryan?.parentName).toBe('Rajendra Pratap Singh');
    expect(aryan?.parentPhone).toBe('9876543200');
    expect(aryan?.enrollmentStatus).toBe('ACTIVE');
    expect(aryan?.assignedTutorName).toBe('Dr. Rajesh Sharma');
    expect(aryan?.escrowSecured).toBe(true);
    expect(aryan?.monthlyFee).toBe(4500);
  });

  it('reallocates verified home tutor and records audit log', async () => {
    const students = await superAdminService.getPanIndiaHomeTuitionStudents();
    const student = students[0];
    expect(student).toBeDefined();

    const updated = await superAdminService.reallocateHomeTuitionTutor(
      student.id,
      'usr-teacher-priya',
      'Priya Verma',
      '9876543212',
      'M.Sc. Chemistry Specialist',
      'Super Admin manual reassignment test'
    );

    expect(updated).toBeDefined();
    expect(updated?.assignedTutorId).toBe('usr-teacher-priya');
    expect(updated?.assignedTutorName).toBe('Priya Verma');
    expect(updated?.enrollmentStatus).toBe('ACTIVE');

    // Verify audit log
    const auditLogs = await auditService.getAuditLogs();
    const log = auditLogs.find(l => l.action === 'REALLOCATE_HOME_TUTOR' && l.targetId === student.id);
    expect(log).toBeDefined();
    expect(log?.module).toBe('STUDENTS_REGISTRY');
    expect(log?.newValue).toContain('Priya Verma');
  });

  it('performs master profile correction with mandatory audit note', async () => {
    const students = await superAdminService.getPanIndiaHomeTuitionStudents();
    const student = students.find(s => s.name === 'Rohit Gupta') || students[1];

    const updated = await superAdminService.updateHomeTuitionStudent(
      student.id,
      {
        monthlyFee: 3500,
        grade: 'Class 10 (Secondary CBSE)',
        reason: 'Fee adjustment approved by District Coordinator'
      }
    );

    expect(updated).toBeDefined();
    expect(updated?.monthlyFee).toBe(3500);
    expect(updated?.grade).toBe('Class 10 (Secondary CBSE)');

    // Verify audit log
    const auditLogs = await auditService.getAuditLogs();
    const log = auditLogs.find(l => l.action === 'UPDATE_HOME_TUITION_STUDENT' && l.targetId === student.id);
    expect(log).toBeDefined();
    expect(log?.newValue).toContain('Fee adjustment approved');
  });

  it('toggles student status between ACTIVE and SUSPENDED with audit event', async () => {
    const students = await superAdminService.getPanIndiaHomeTuitionStudents();
    const student = students.find(s => s.enrollmentStatus === 'ACTIVE') || students[0];

    // Suspend
    const suspended = await superAdminService.toggleHomeTuitionStatus(student.id, 'SUSPENDED');
    expect(suspended?.enrollmentStatus).toBe('SUSPENDED');

    // Reactivate
    const reactivated = await superAdminService.toggleHomeTuitionStatus(student.id, 'ACTIVE');
    expect(reactivated?.enrollmentStatus).toBe('ACTIVE');

    const auditLogs = await auditService.getAuditLogs();
    const log = auditLogs.find(l => l.action === 'TOGGLE_STUDENT_STATUS' && l.targetId === student.id);
    expect(log).toBeDefined();
  });

  it('onboards new student directly into home tuition registry and mockStore', async () => {
    const newLearner = await superAdminService.createHomeTuitionStudent({
      rollNumber: 'FP-HTS-2026-9999',
      name: 'Aditya Raj',
      email: 'aditya.raj@focuspoint.internal',
      mobile: '9844001122',
      gender: 'MALE',
      parentName: 'Sanjay Raj',
      parentPhone: '9844001100',
      parentRelation: 'Father',
      stateName: 'Uttar Pradesh',
      districtName: 'Varanasi',
      localityName: 'Sigra',
      pincode: '221002',
      address: 'Near Stadium, Sigra, Varanasi, UP',
      grade: 'Class 12 (Science PCM)',
      board: 'CBSE',
      schoolName: 'Delhi Public School Varanasi',
      targetExam: 'JEE Advanced',
      medium: 'English',
      enrollmentStatus: 'ACTIVE',
      subjects: ['Physics', 'Mathematics'],
      assignedTutorId: 'usr-teacher-rajesh',
      assignedTutorName: 'Dr. Rajesh Sharma',
      schedule: 'Mon, Wed, Fri • 05:00 PM - 07:00 PM',
      sessionFrequency: '3 Days a Week',
      mode: 'OFFLINE_HOME_VISIT',
      attendanceRate: 100,
      totalClassesHeld: 0,
      classesAttended: 0,
      syllabusProgress: 0,
      averageScore: 90,
      academicPace: 'ON_TRACK',
      tutorRating: 5.0,
      lastSessionDate: 'N/A',
      monthlyFee: 5000,
      feeStatus: 'PAID',
      escrowSecured: true
    });

    expect(newLearner).toBeDefined();
    expect(newLearner.id).toBeDefined();
    expect(newLearner.name).toBe('Aditya Raj');

    // Verify it exists in subsequent fetches
    const all = await superAdminService.getPanIndiaHomeTuitionStudents();
    const found = all.find(s => s.name === 'Aditya Raj');
    expect(found).toBeDefined();
    expect(found?.districtName).toBe('Varanasi');

    // Verify registered in mockStore users
    const mockUsers = mockStore.getUsers();
    const inStore = mockUsers.find(u => u.name === 'Aditya Raj');
    expect(inStore).toBeDefined();
    expect(inStore?.role).toBe('STUDENT');
  });
});
