import { describe, it, expect, beforeEach } from 'vitest';
import { superAdminService } from '../services/superAdminService';
import { libraryDiscoveryService } from '../services/libraryDiscoveryService';
import { mockStore } from '../mock/store';
import { safeStorage } from '../utils/storageUtils';
import {
  checkIsLibraryVerified,
  checkIsLibraryPending,
  checkIsLibrarySuspended
} from '../features/super-admin/SuperAdminLibraries';

describe('FOCUSPOINT — Super Admin Partner Study Libraries Grid Master Suite', () => {
  beforeEach(() => {
    safeStorage.removeItem('fp_mock_store_v1');
    safeStorage.removeItem('fp_libraries');
    (mockStore as any).loadFromStorage();
  });

  it('retrieves comprehensive partner libraries roster with IoT environmental sensors and badges', async () => {
    const libraries = await superAdminService.getAllLibraries();
    expect(libraries.length).toBeGreaterThan(0);

    const first = libraries[0];
    expect(first.id).toBeDefined();
    expect(first.name).toBeDefined();
    expect(first.totalSeats).toBeGreaterThan(0);
    expect(first.availableSeats).toBeDefined();

    // Verify IoT sensor telemetry fields
    expect(first.iotSensors).toBeDefined();
    expect(first.iotSensors?.decibels).toBeGreaterThan(0);
    expect(first.iotSensors?.wifiPingMs).toBeGreaterThan(0);
    expect(first.iotSensors?.powerBackupHealth).toBeGreaterThanOrEqual(90);

    // Verify accreditation badges
    expect(Array.isArray(first.accreditationBadges)).toBe(true);
    expect(first.accreditationBadges?.length).toBeGreaterThan(0);
  });

  it('performs statutory accreditation approval and records audit trail', async () => {
    const targetId = 'lib-saraswati-zamania';
    const auditRemarks = 'Institutional physical inspection cleared. 6-point life-safety certified.';

    const updated = await superAdminService.updateLibraryStatus(
      targetId,
      'APPROVED',
      auditRemarks,
      {
        verifiedBy: 'Super Admin HQ (Institutional Registry)',
        verifiedAt: new Date().toISOString(),
        remarks: auditRemarks
      }
    );

    expect(updated).not.toBeNull();
    expect(updated?.verificationStatus).toBe('APPROVED');
    expect(checkIsLibraryVerified(updated!)).toBe(true);

    // Verify in mock store
    const storeLib = mockStore.getLibraryById(targetId);
    expect(storeLib?.verificationStatus).toBe('APPROVED');
  });

  it('supports facility suspension and updates network state', async () => {
    const targetId = 'lib-focus-saidpur';
    const suspended = await superAdminService.updateLibraryStatus(
      targetId,
      'SUSPENDED',
      'Suspended pending noise level investigation'
    );

    expect(suspended?.verificationStatus).toBe('SUSPENDED');
    expect(checkIsLibrarySuspended(suspended!)).toBe(true);
    expect(checkIsLibraryVerified(suspended!)).toBe(false);
  });

  it('awards and toggles holographic accreditation badges with persistence', async () => {
    const libraries = await superAdminService.getAllLibraries();
    const targetId = libraries[0].id;
    const testBadge = '24_7_ALL_NIGHTER_HUB';

    // 1. Check initial badge state or toggle
    const initialBadges = libraries[0].accreditationBadges || [];
    const hadBadge = initialBadges.includes(testBadge);

    const toggled = await superAdminService.awardLibraryAccreditationBadge(targetId, testBadge);
    expect(toggled).not.toBeNull();

    if (hadBadge) {
      expect(toggled?.accreditationBadges?.includes(testBadge)).toBe(false);
    } else {
      expect(toggled?.accreditationBadges?.includes(testBadge)).toBe(true);
    }

    // Toggle back
    const toggledAgain = await superAdminService.awardLibraryAccreditationBadge(targetId, testBadge);
    expect(toggledAgain?.accreditationBadges?.includes(testBadge)).toBe(hadBadge);
  });

  it('dispatches and allocates scholar seat, updating desk compute availability', async () => {
    const libraries = await superAdminService.getAllLibraries();
    const target = libraries[0];
    const initialVacant = target.availableSeats ?? 18;

    const dispatchResult = await superAdminService.dispatchSeatAllocation(target.id, {
      studentName: 'Pooja Verma',
      studentPhone: '9876543210',
      shiftName: 'Morning Shift (06:00 AM - 12:00 PM)',
      seatNumber: 'A-15',
      monthlyFee: 499,
      examFocus: 'UPSC Civil Services'
    });

    expect(dispatchResult.success).toBe(true);
    expect(dispatchResult.bookingId).toContain('BK-DISPATCH-');
    expect(dispatchResult.seatAllocated).toBe('A-15');
    expect(dispatchResult.library.availableSeats).toBe(Math.max(0, initialVacant - 1));

    // Verify mock store has recorded lower vacancy
    const updatedLib = mockStore.getLibraryById(target.id);
    expect(updatedLib?.availableSeats).toBe(Math.max(0, initialVacant - 1));
  });

  it('executes automated AI facility life-safety radar scan with cryptographic seal', async () => {
    const scanResult = await superAdminService.runAutomatedFacilitySafetyScan();

    expect(scanResult.totalNodesAudited).toBeGreaterThan(0);
    expect(scanResult.passedGateCount).toBe(scanResult.totalNodesAudited);
    expect(scanResult.safetyComplianceIndex).toBe(99.8);
    expect(scanResult.sha3AuditSeal).toContain('0xSHA3-');
    expect(scanResult.diagnostics.fireSafetyNOC).toBeDefined();
    expect(scanResult.diagnostics.opticalFiberBroadband).toBeDefined();
    expect(scanResult.diagnostics.soundAcousticsIndex).toContain('Pin-Drop');
  });

  it('generates official monthly revenue escrow settlement voucher with TDS breakdown', async () => {
    const libraries = await superAdminService.getAllLibraries();
    const target = libraries[0];

    const voucher = await superAdminService.generateLibrarySettlementVoucher(target.id, 'October 2026');

    expect(voucher.voucherId).toContain('VCHR-');
    expect(voucher.libraryId).toBe(target.id);
    expect(voucher.grossBookings).toBeGreaterThan(0);
    expect(voucher.platformCommission).toBe(Math.round(voucher.grossBookings * 0.10));
    expect(voucher.tdsDeducted).toBe(Math.round(voucher.grossBookings * 0.01));
    expect(voucher.netPayout).toBe(voucher.grossBookings - voucher.platformCommission - voucher.tdsDeducted);
    expect(voucher.utrNumber).toContain('FPESCROW');
    expect(voucher.escrowStatus).toBe('SETTLED');
  });

  it('onboards a new partner study library node with instant accreditation', async () => {
    const newLib = await superAdminService.onboardPartnerLibrary({
      name: 'Nalanda Digital Study Sanctuary',
      ownerName: 'Virendra Singh',
      ownerPhone: '9812345678',
      district: 'Ghazipur',
      address: 'Near Ghazipur City Station',
      pincode: '233002',
      totalSeats: 80,
      monthlyFee: 599,
      hourlyRate: 35
    });

    expect(newLib.id).toContain('lib-node-');
    expect(newLib.name).toBe('Nalanda Digital Study Sanctuary');
    expect(newLib.totalSeats).toBe(80);
    expect(newLib.verificationStatus).toBe('APPROVED');
    expect(newLib.iotSensors).toBeDefined();
    expect(newLib.aiSafetyScore).toBeGreaterThan(95);

    // Verify it is now in mockStore
    const retrieved = mockStore.getLibraryById(newLib.id);
    expect(retrieved).toBeDefined();
    expect(retrieved?.name).toBe('Nalanda Digital Study Sanctuary');
  });

  it('validates helper functions for verified, pending, and suspended statuses', () => {
    expect(checkIsLibraryVerified({ verificationStatus: 'APPROVED' })).toBe(true);
    expect(checkIsLibraryVerified({ status: 'active' } as any)).toBe(true);
    expect(checkIsLibraryVerified({ auditStatus: 'VERIFIED' } as any)).toBe(true);

    expect(checkIsLibrarySuspended({ verificationStatus: 'SUSPENDED' })).toBe(true);
    expect(checkIsLibrarySuspended({ status: 'suspended' } as any)).toBe(true);

    expect(checkIsLibraryPending({ verificationStatus: 'PENDING' })).toBe(true);
    expect(checkIsLibraryPending({ verificationStatus: 'APPROVED' })).toBe(false);
  });

  it('survives simulated full page reload across safeStorage', async () => {
    const targetId = 'lib-saraswati-zamania';

    // Verify facility
    await superAdminService.updateLibraryStatus(targetId, 'APPROVED', 'Full reload test accreditation');

    // Simulate page reload
    (mockStore as any).loadFromStorage();
    const reloaded = mockStore.getLibraryById(targetId);

    expect(reloaded).toBeDefined();
    expect(reloaded?.verificationStatus).toBe('APPROVED');
    expect(checkIsLibraryVerified(reloaded!)).toBe(true);
  });
});
