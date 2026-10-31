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

describe('FOCUSPOINT — Super Admin Library Verification Persistence Across Page Refreshes', () => {
  beforeEach(() => {
    // Clear storage cache for clean baseline test
    safeStorage.removeItem('fp_mock_store_v1');
    safeStorage.removeItem('fp_libraries');
    (mockStore as any).loadFromStorage();
  });

  it('initially loads unverified mock library as pending audit', () => {
    const lib = mockStore.getLibraryById('lib-saraswati-zamania');
    expect(lib).toBeDefined();
    expect(lib?.verificationStatus).toBe('PENDING');

    expect(checkIsLibraryVerified(lib!)).toBe(false);
    expect(checkIsLibraryPending(lib!)).toBe(true);
    expect(checkIsLibrarySuspended(lib!)).toBe(false);
  });

  it('persists APPROVED status when Super Admin verifies library and survives reload simulation', async () => {
    const targetId = 'lib-saraswati-zamania';

    // 1. Super Admin verifies the library with audit remarks
    const updated = await superAdminService.updateLibraryStatus(
      targetId,
      'APPROVED',
      'Physical inspection cleared by Super Admin. 6-point life safety and CCTV verified.',
      {
        verifiedBy: 'Super Admin HQ (Institutional Registry)',
        verifiedAt: new Date().toISOString(),
        remarks: 'Physical inspection cleared by Super Admin. 6-point life safety and CCTV verified.'
      }
    );

    expect(updated).not.toBeNull();
    expect(updated?.verificationStatus).toBe('APPROVED');
    expect((updated as any).auditStatus).toBe('VERIFIED');
    expect((updated as any).status).toBe('active');

    // 2. Verify safeStorage contains the updated status
    const storedRaw = safeStorage.getItem('fp_mock_store_v1');
    expect(storedRaw).not.toBeNull();
    const parsedData = JSON.parse(storedRaw!);
    const storedLib = parsedData.libraries.find((l: any) => l.id === targetId);
    expect(storedLib).toBeDefined();
    expect(storedLib.verificationStatus).toBe('APPROVED');

    // 3. Simulate FULL PAGE REFRESH (reload store from safeStorage)
    (mockStore as any).loadFromStorage();
    const reloadedLib = mockStore.getLibraryById(targetId);

    expect(reloadedLib).toBeDefined();
    expect(reloadedLib?.verificationStatus).toBe('APPROVED');
    expect(checkIsLibraryVerified(reloadedLib!)).toBe(true);
    expect(checkIsLibraryPending(reloadedLib!)).toBe(false);

    // 4. Verify public discovery service now recognizes it as discoverable
    expect(libraryDiscoveryService.isLibraryDiscoverable(reloadedLib!)).toBe(true);
  });

  it('supports instant suspension with persistence across page reloads', async () => {
    const targetId = 'lib-focus-saidpur';

    // Suspend library
    const suspended = await superAdminService.updateLibraryStatus(
      targetId,
      'SUSPENDED',
      'Temporary suspension for annual electrical overhaul'
    );

    expect(suspended?.verificationStatus).toBe('SUSPENDED');
    expect(checkIsLibrarySuspended(suspended!)).toBe(true);
    expect(checkIsLibraryVerified(suspended!)).toBe(false);

    // Simulate page reload
    (mockStore as any).loadFromStorage();
    const reloaded = mockStore.getLibraryById(targetId);

    expect(reloaded?.verificationStatus).toBe('SUSPENDED');
    expect(checkIsLibrarySuspended(reloaded!)).toBe(true);
    expect(checkIsLibraryVerified(reloaded!)).toBe(false);
    expect(libraryDiscoveryService.isLibraryDiscoverable(reloaded!)).toBe(false);
  });
});
