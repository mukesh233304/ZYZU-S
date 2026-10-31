import { describe, it, expect, beforeEach } from 'vitest';
import { superAdminService, BOOKINGS_STORAGE_KEY } from '../services/superAdminService';
import { auditService } from '../services/auditService';
import { safeStorage } from '../utils/storageUtils';
import { UnifiedBookingRecord } from '../types/superAdmin';

describe('FOCUSPOINT — SUPER ADMIN PAN-INDIA BOOKINGS & ALLOTMENTS MASTER SUITE', () => {
  beforeEach(() => {
    safeStorage.removeItem(BOOKINGS_STORAGE_KEY);
  });

  describe('1. Unified Pan-India Bookings Data Ingestion & Normalization', () => {
    it('successfully synthesizes both Home Tuition and Library Desk bookings', async () => {
      const bookings = await superAdminService.getPanIndiaUnifiedBookings();
      expect(bookings).toBeDefined();
      expect(bookings.length).toBeGreaterThanOrEqual(2);

      const tuitionBookings = bookings.filter(b => b.serviceType === 'HOME_TUITION');
      const libraryBookings = bookings.filter(b => b.serviceType === 'LIBRARY');

      expect(tuitionBookings.length).toBeGreaterThan(0);
      expect(libraryBookings.length).toBeGreaterThan(0);

      // Verify tuition booking attributes
      const firstTuition = tuitionBookings[0];
      expect(firstTuition.refNumber).toMatch(/^FP-HTB-/);
      expect(firstTuition.studentName).toBeDefined();
      expect(firstTuition.district).toBeDefined();
      expect(firstTuition.teacherName).toBeDefined();
      expect(firstTuition.monthlyAmount).toBeGreaterThan(0);

      // Verify library booking attributes
      const firstLib = libraryBookings[0];
      expect(firstLib.refNumber).toMatch(/^FP-LIB-/);
      expect(firstLib.seatNumber).toBeDefined();
      expect(firstLib.shift).toBeDefined();
      expect(firstLib.libraryName).toBeDefined();
      expect(firstLib.qrPassId).toBeDefined();
    });

    it('correctly populates geographic node information on all bookings', async () => {
      const bookings = await superAdminService.getPanIndiaUnifiedBookings();
      bookings.forEach(b => {
        expect(b.district).toBeDefined();
        expect(b.state).toBeDefined();
        expect(typeof b.district).toBe('string');
        expect(typeof b.state).toBe('string');
      });
    });

    it('persists unified bookings to safeStorage for state continuity', async () => {
      const bookings = await superAdminService.getPanIndiaUnifiedBookings();
      const rawStored = safeStorage.getItem(BOOKINGS_STORAGE_KEY);
      expect(rawStored).toBeDefined();
      const parsed = JSON.parse(rawStored || '[]');
      expect(parsed.length).toBe(bookings.length);
    });
  });

  describe('2. Sovereign 8-KPI Radar & Metric Decks Computation', () => {
    it('computes correct aggregate KPIs across all bookings', async () => {
      const bookings = await superAdminService.getPanIndiaUnifiedBookings();
      const kpis = superAdminService.calculateBookingsKPIs(bookings);

      expect(kpis.totalAllotments).toBe(bookings.length);
      expect(kpis.activeTuitions).toBe(bookings.filter(b => b.serviceType === 'HOME_TUITION' && b.status === 'ACTIVE').length);
      expect(kpis.activeLibraryDesks).toBe(bookings.filter(b => b.serviceType === 'LIBRARY' && b.status === 'ACTIVE').length);
      expect(kpis.totalGrossValue).toBeGreaterThan(0);
      expect(kpis.tutorDeploymentRate).toBeGreaterThanOrEqual(0);
      expect(kpis.tutorDeploymentRate).toBeLessThanOrEqual(100);
      expect(kpis.qrPassesActive).toBe(bookings.filter(b => b.qrPassActive).length);
      expect(kpis.averageMonthlyTicket).toBeGreaterThan(0);
    });

    it('reacts dynamically to empty or filtered booking sets', () => {
      const emptyKPIs = superAdminService.calculateBookingsKPIs([]);
      expect(emptyKPIs.totalAllotments).toBe(0);
      expect(emptyKPIs.activeTuitions).toBe(0);
      expect(emptyKPIs.activeLibraryDesks).toBe(0);
      expect(emptyKPIs.totalGrossValue).toBe(0);
    });
  });

  describe('3. Verified Educator Reassignment & Cryptographic Audit Trail', () => {
    it('reassigns home tutor to new verified faculty and increments reassignment count', async () => {
      const bookings = await superAdminService.getPanIndiaUnifiedBookings();
      const tuitionBooking = bookings.find(b => b.serviceType === 'HOME_TUITION');
      expect(tuitionBooking).toBeDefined();

      const bookingId = tuitionBooking!.id;
      const newTeacherId = 'tch-02';
      const newTeacherName = 'Dr. Pradeep Mishra';
      const reason = 'Student requested specialization in Advanced Organic Chemistry.';

      const updated = await superAdminService.reassignHomeTutor(
        bookingId,
        newTeacherId,
        newTeacherName,
        reason,
        'Mukesh Sonkar (Super Admin)'
      );

      expect(updated.teacherId).toBe(newTeacherId);
      expect(updated.teacherName).toBe(newTeacherName);
      expect(updated.reassignmentCount).toBe(1);
      expect(updated.lastReassignedReason).toBe(reason);

      // Verify audit log creation
      const auditLogs = await auditService.getAuditLogs({ module: 'BOOKINGS_ALLOTMENTS' });
      expect(auditLogs.length).toBeGreaterThan(0);
      const reassignLog = auditLogs.find(l => l.action === 'REASSIGN_HOME_TUTOR' && l.targetId === bookingId);
      expect(reassignLog).toBeDefined();
      expect(reassignLog?.newValue).toContain(newTeacherName);
      expect(reassignLog?.newValue).toContain(reason);
    });

    it('throws error when reassigning non-existent booking', async () => {
      await expect(
        superAdminService.reassignHomeTutor(
          'non-existent-id',
          'tch-99',
          'Test Educator',
          'Invalid test'
        )
      ).rejects.toThrow('not found');
    });
  });

  describe('4. Library Workstation & Shift Reallocation', () => {
    it('reallocates desk seat and shift with audit log trail', async () => {
      const bookings = await superAdminService.getPanIndiaUnifiedBookings();
      const libraryBooking = bookings.find(b => b.serviceType === 'LIBRARY');
      expect(libraryBooking).toBeDefined();

      const bookingId = libraryBooking!.id;
      const newSeat = 'Desk-A-01-VIP';
      const newShift = 'Evening Shift (02:00 PM - 10:00 PM)';
      const reason = 'Learner upgraded to VIP silent zone workstation.';

      const updated = await superAdminService.reallocateLibraryDesk(
        bookingId,
        newSeat,
        newShift,
        reason,
        'Mukesh Sonkar (Super Admin)'
      );

      expect(updated.seatNumber).toBe(newSeat);
      expect(updated.shift).toBe(newShift);
      expect(updated.notes).toContain(newSeat);

      // Verify audit log creation
      const auditLogs = await auditService.getAuditLogs({ module: 'BOOKINGS_ALLOTMENTS' });
      const reallocLog = auditLogs.find(l => l.action === 'REALLOCATE_LIBRARY_DESK' && l.targetId === bookingId);
      expect(reallocLog).toBeDefined();
      expect(reallocLog?.newValue).toContain(newSeat);
    });
  });

  describe('5. Status Governance & QR Pass State Transition', () => {
    it('updates operational status to SUSPENDED and deactivates QR access pass', async () => {
      const bookings = await superAdminService.getPanIndiaUnifiedBookings();
      const first = bookings[0];

      const updated = await superAdminService.updateBookingStatus(
        first.id,
        'SUSPENDED',
        'Fee dues exceeded 30 days statutory grace window.',
        'Mukesh Sonkar (Super Admin)'
      );

      expect(updated.status).toBe('SUSPENDED');
      expect(updated.qrPassActive).toBe(false);

      // Verify audit log
      const auditLogs = await auditService.getAuditLogs({ module: 'BOOKINGS_ALLOTMENTS' });
      const statusLog = auditLogs.find(l => l.action === 'UPDATE_BOOKING_STATUS' && l.targetId === first.id);
      expect(statusLog).toBeDefined();
      expect(statusLog?.severity).toBe('CRITICAL');
    });

    it('reactivates status to ACTIVE and enables QR access pass', async () => {
      const bookings = await superAdminService.getPanIndiaUnifiedBookings();
      const first = bookings[0];

      const updated = await superAdminService.updateBookingStatus(
        first.id,
        'ACTIVE',
        'Fee dues cleared via UPI transaction.',
        'Mukesh Sonkar (Super Admin)'
      );

      expect(updated.status).toBe('ACTIVE');
      expect(updated.qrPassActive).toBe(true);
    });
  });
});
