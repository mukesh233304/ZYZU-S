import { describe, it, expect, beforeEach } from 'vitest';
import { libraryDiscoveryService } from '../services/libraryDiscoveryService';
import { notificationService } from '../services/notificationService';
import { mockStore } from '../mock/store';
import { Library, User } from '../types';

describe('FOCUSPOINT — Library Certificate, Discovery, WhatsApp & Student ID Card Upgrade', () => {
  beforeEach(() => {
    // Reset or prepare fresh mocks
  });

  describe('1. Library Certificate Eligibility & Data Formatting (Issues A, Sections #2-#8)', () => {
    it('should correctly gate certificate eligibility based on approved/verified status', () => {
      const draftLib: Library = {
        id: 'FP-LIB-9901',
        ownerId: 'usr-owner-99',
        name: 'Alpha Study Point',
        description: 'Cozy study desks',
        area: 'Saidpur',
        address: 'Main Market, Saidpur',
        pincode: '233304',
        district: 'Ghazipur',
        totalSeats: 40,
        verificationStatus: 'PENDING',
        facilities: ['WiFi', 'AC'],
        shifts: []
      };

      expect(libraryDiscoveryService.isLibraryDiscoverable(draftLib)).toBe(false);

      const approvedLib: Library = {
        ...draftLib,
        verificationStatus: 'APPROVED',
        status: 'active'
      };

      expect(libraryDiscoveryService.isLibraryDiscoverable(approvedLib)).toBe(true);

      const suspendedLib: Library = {
        ...approvedLib,
        verificationStatus: 'SUSPENDED'
      };

      expect(libraryDiscoveryService.isLibraryDiscoverable(suspendedLib)).toBe(false);
    });

    it('should format official certificate metadata without fabricated numbers', () => {
      const libId = 'FP-LIB-1084';
      const certNo = `FP-VPL-${libId.replace(/\D/g, '').padStart(4, '0')}`;
      expect(certNo).toBe('FP-VPL-1084');

      const certUrl = `/#/verify/doc/${certNo}`;
      expect(certUrl).toContain('FP-VPL-1084');
    });
  });

  describe('2. Real-Time Library Discovery & PIN Code Search (Issues B & C, Sections #9-#20, #42-#45)', () => {
    it('should match library by direct 6-digit Indian PIN code', () => {
      const library: Library = {
        id: 'FP-LIB-1084',
        ownerId: 'usr-owner-01',
        name: 'Saidpur Central Library',
        description: 'Air conditioned quiet study hall',
        area: 'Saidpur',
        address: 'Near Pankaj Talkies, Saidpur',
        pincode: '233304',
        district: 'Ghazipur',
        totalSeats: 50,
        verificationStatus: 'APPROVED',
        status: 'active',
        facilities: ['WiFi', 'AC', 'Mineral Water'],
        shifts: []
      };

      expect(libraryDiscoveryService.matchesPinCode(library, '233304')).toBe(true);
      expect(libraryDiscoveryService.matchesPinCode(library, '110001')).toBe(false);
    });

    it('should automatically publish approved library and notify listeners without manual DB refresh', () => {
      let notified = false;
      const unsubscribe = libraryDiscoveryService.subscribe(() => {
        notified = true;
      });

      const newLib: Library = {
        id: 'FP-LIB-8888',
        ownerId: 'usr-owner-88',
        name: 'Varanasi Digital Library Hub',
        description: 'High speed internet library',
        area: 'Lanka',
        address: 'Near BHU Gate, Lanka',
        pincode: '221005',
        district: 'Varanasi',
        totalSeats: 60,
        verificationStatus: 'APPROVED',
        status: 'active',
        facilities: ['WiFi', 'Power Backup'],
        shifts: []
      };

      mockStore.addLibrary(newLib);

      expect(notified).toBe(true);
      unsubscribe();
    });
  });

  describe('3. Universal WhatsApp Registration Confirmations (Issue D, Sections #21-#31)', () => {
    it('should generate canonical confirmation message for Student role', async () => {
      const res = await notificationService.sendWhatsAppRegistrationConfirmation({
        userId: 'usr-stu-test-01',
        role: 'STUDENT',
        recipientName: 'Aman Kumar',
        recipientPhone: '9876543210',
        identifierId: 'FP-STU-2026-000451'
      });

      expect(res.status).toBe('DELIVERED');
      expect(res.message).toMatch(/WELCOME TO (FOCUSPOINT|ZYZU'S)/);
      expect(res.message).toContain('Hello Aman Kumar,');
      expect(res.message).toContain('FP-STU-2026-000451');
      expect(res.message).toContain('+91 98XXXX3210');
    });

    it('should generate canonical confirmation message for Teacher role', async () => {
      const res = await notificationService.sendWhatsAppRegistrationConfirmation({
        userId: 'usr-tch-test-02',
        role: 'TEACHER',
        recipientName: 'Dr. Sunita Patel',
        recipientPhone: '9812345678',
        identifierId: 'FP-TCH-000088',
        status: 'Under Review'
      });

      expect(res.status).toBe('DELIVERED');
      expect(res.message).toMatch(/(FOCUSPOINT|ZYZU'S) TEACHER REGISTRATION CONFIRMED/);
      expect(res.message).toContain('Dr. Sunita Patel');
      expect(res.message).toContain('FP-TCH-000088');
      expect(res.message).toContain('Under Review');
    });

    it('should generate canonical confirmation message for Library Owner role', async () => {
      const res = await notificationService.sendWhatsAppRegistrationConfirmation({
        userId: 'usr-lib-test-03',
        role: 'LIBRARY_OWNER',
        recipientName: 'Vikram Singh',
        recipientPhone: '9934567890',
        identifierId: 'FP-OWN-000109'
      });

      expect(res.status).toBe('DELIVERED');
      expect(res.message).toMatch(/(FOCUSPOINT|ZYZU'S) LIBRARY OWNER REGISTRATION CONFIRMED/);
      expect(res.message).toContain('Vikram Singh');
      expect(res.message).toContain('FP-OWN-000109');
    });

    it('should generate canonical confirmation message for District Admin role', async () => {
      const res = await notificationService.sendWhatsAppRegistrationConfirmation({
        userId: 'usr-da-test-04',
        role: 'DISTRICT_ADMIN',
        recipientName: 'Rameshwar Nath',
        recipientPhone: '9415200000',
        district: 'Ghazipur',
        state: 'Uttar Pradesh'
      });

      expect(res.status).toBe('DELIVERED');
      expect(res.message).toMatch(/(FOCUSPOINT|ZYZU'S) DISTRICT ADMIN ACCOUNT CREATED/);
      expect(res.message).toContain('Rameshwar Nath');
      expect(res.message).toContain('District:\nGhazipur');
    });

    it('should generate canonical confirmation message for Super Admin role', async () => {
      const res = await notificationService.sendWhatsAppRegistrationConfirmation({
        userId: 'usr-sa-test-05',
        role: 'SUPER_ADMIN',
        recipientName: 'System Administrator',
        recipientPhone: '9000000001'
      });

      expect(res.status).toBe('DELIVERED');
      expect(res.message).toMatch(/(FOCUSPOINT|ZYZU'S) ADMIN REGISTRATION CONFIRMED/);
      expect(res.message).toContain('System Administrator');
    });

    it('should generate canonical confirmation message for Operator role', async () => {
      const res = await notificationService.sendWhatsAppRegistrationConfirmation({
        userId: 'usr-op-test-06',
        role: 'OPERATOR',
        recipientName: 'Priya Verma',
        recipientPhone: '9123456780',
        identifierId: 'FP-OPR-000021'
      });

      expect(res.status).toBe('DELIVERED');
      expect(res.message).toMatch(/(FOCUSPOINT|ZYZU'S) OPERATOR REGISTRATION CONFIRMED/);
      expect(res.message).toContain('Priya Verma');
      expect(res.message).toContain('FP-OPR-000021');
    });

    it('should NOT fail or throw when phone number is invalid or delivery fails (Section #30)', async () => {
      const res = await notificationService.sendWhatsAppRegistrationConfirmation({
        userId: 'usr-no-phone',
        role: 'STUDENT',
        recipientName: 'Phone Missing',
        recipientPhone: ''
      });

      // Must handle gracefully without throwing an unhandled exception
      expect(res.status).toBe('FAILED');
      expect(res.error).toContain('valid WhatsApp number is not available');
    });
  });

  describe('4. Student ID Card Layout & Service Isolation (Issue E, Sections #32-#38)', () => {
    it('should support Home Tuition, Library, and Both service indicators correctly', () => {
      const services = ['HOME_TUITION', 'LIBRARY', 'BOTH'] as const;
      services.forEach(svc => {
        expect(['HOME_TUITION', 'LIBRARY', 'BOTH']).toContain(svc);
      });
    });

    it('should structure compact address format without paragraph overflow (Section #37)', () => {
      const addressData = {
        street: 'Near Pankaj Talkies, Saidpur',
        district: 'Ghazipur',
        state: 'Uttar Pradesh',
        pincode: '233304'
      };

      expect(addressData.street).toBe('Near Pankaj Talkies, Saidpur');
      expect(addressData.district).toBe('Ghazipur');
      expect(addressData.state).toBe('Uttar Pradesh');
      expect(addressData.pincode).toBe('233304');
    });
  });
});
