import { Library } from '../types';
import { mockStore } from '../mock/store';
import { pinCodeService, PinCodeResolution } from './pinCodeService';
import { locationService } from './locationService';

export interface LibraryDiscoveryFilterOptions {
  searchQuery?: string;
  pinCode?: string;
  countryId?: string;
  stateId?: string;
  districtId?: string;
  localityId?: string;
  areaId?: string;
  selectedFacilities?: string[];
  selectedShift?: string;
  maxPrice?: number;
  minAvailableSeats?: number;
}

export interface LibraryDiscoveryResult {
  libraries: Library[];
  totalMatches: number;
  pinResolution?: PinCodeResolution;
  isPinSearch: boolean;
  pinCode?: string;
  nearbyLibraries: Library[];
  matchedLocationSummary?: {
    stateName?: string;
    districtName?: string;
    localityName?: string;
    areaName?: string;
    pinCode?: string;
  };
}

class LibraryDiscoveryService {
  private listeners: Set<(libs: Library[]) => void> = new Set();

  constructor() {
    mockStore.onLibraryChange(() => {
      this.notify();
    });

    if (typeof window !== 'undefined') {
      window.addEventListener('focuspoint:library_status_changed', () => {
        this.notify();
      });
      window.addEventListener('storage', (e) => {
        if (e.key === 'fp_libraries' || e.key === 'focuspoint_libraries') {
          this.notify();
        }
      });
    }
  }

  public subscribe(listener: (libs: Library[]) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public notify(): void {
    const discoverable = this.getDiscoverableLibraries();
    this.listeners.forEach((cb) => {
      try {
        cb(discoverable);
      } catch (err) {
        console.error('LibraryDiscoveryService subscriber error:', err);
      }
    });
  }

  /**
   * Centralized Discovery Eligibility Rule (Section #11 & #12):
   * Validates whether a study library is authorized and verified to appear publicly.
   */
  public isLibraryDiscoverable(library: Partial<Library> | null | undefined): boolean {
    if (!library || !library.id || !library.name) return false;

    const rawVerStatus = String(library.verificationStatus || '').trim().toUpperCase();
    const rawStatus = String((library as any).status || '').trim().toUpperCase();

    // Block rejected, suspended, pending or draft facilities
    if (rawVerStatus === 'REJECTED' || rawVerStatus === 'SUSPENDED' || rawVerStatus === 'PENDING' || rawVerStatus === 'DRAFT') {
      return false;
    }
    if (rawStatus === 'REJECTED' || rawStatus === 'SUSPENDED' || rawStatus === 'INACTIVE' || rawStatus === 'DEACTIVATED') {
      return false;
    }

    // Must be marked APPROVED, VERIFIED, or ACTIVE
    const isApproved = 
      rawVerStatus === 'APPROVED' || 
      rawVerStatus === 'VERIFIED' || 
      rawVerStatus === 'ACTIVE' ||
      rawStatus === 'ACTIVE' || 
      rawStatus === 'APPROVED' ||
      rawStatus === 'VERIFIED';

    return isApproved;
  }

  /**
   * Returns all discoverable study libraries in the platform
   */
  public getDiscoverableLibraries(): Library[] {
    const all = mockStore.getLibraries();
    return all.filter((lib) => this.isLibraryDiscoverable(lib));
  }

  /**
   * Evaluates if a library matches a resolved PIN code
   */
  public matchesPinCode(lib: Library, targetPin: string, resolution?: PinCodeResolution): boolean {
    const cleanPin = targetPin.trim().replace(/\D/g, '');
    const libPin = String(lib.pincode || '').trim().replace(/\D/g, '');

    // 1. Direct PIN code match
    if (libPin && libPin === cleanPin) {
      return true;
    }

    // 2. Address text contains PIN
    if (lib.address && lib.address.includes(cleanPin)) {
      return true;
    }

    // 3. Fallback matching via resolved location hierarchy if direct pin on library is missing
    if (resolution && resolution.success) {
      // Check district match
      const districtMatch = 
        (resolution.districtId && lib.districtId === resolution.districtId) ||
        (resolution.districtName && (lib.districtName || lib.district)?.toLowerCase() === resolution.districtName.toLowerCase());

      // Check locality match
      const localityMatch = 
        (resolution.localityId && lib.localityId === resolution.localityId) ||
        (resolution.localityName && (lib.city || lib.area || lib.address)?.toLowerCase().includes(resolution.localityName.toLowerCase()));

      if (districtMatch && localityMatch) {
        return true;
      }
    }

    return false;
  }

  /**
   * Robust Multi-Criteria Discovery Search
   */
  public async searchLibraries(filters: LibraryDiscoveryFilterOptions): Promise<LibraryDiscoveryResult> {
    const discoverable = this.getDiscoverableLibraries();
    let pinResolution: PinCodeResolution | undefined;
    const cleanPin = filters.pinCode?.trim().replace(/\D/g, '') || '';
    const isPinSearch = cleanPin.length === 6;

    if (isPinSearch) {
      try {
        const res = await pinCodeService.resolvePinCode(cleanPin);
        if (res.success) {
          pinResolution = res;
        }
      } catch (err) {
        console.warn('PIN resolution in searchLibraries fallback:', err);
      }
    }

    const matched = discoverable.filter((lib) => {
      // 1. Search Query
      if (filters.searchQuery && filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase().trim();
        const matchesName = lib.name.toLowerCase().includes(q);
        const matchesArea = lib.area?.toLowerCase().includes(q);
        const matchesDistrict = (lib.districtName || lib.district)?.toLowerCase().includes(q);
        const matchesAddress = lib.address?.toLowerCase().includes(q);
        const matchesCity = lib.city?.toLowerCase().includes(q);
        const matchesDesc = lib.description?.toLowerCase().includes(q);
        const matchesPin = String(lib.pincode || '').includes(q);

        if (!matchesName && !matchesArea && !matchesDistrict && !matchesAddress && !matchesCity && !matchesDesc && !matchesPin) {
          return false;
        }
      }

      // 2. PIN Code Filter (Priority 1 for PIN searches)
      if (isPinSearch) {
        if (!this.matchesPinCode(lib, cleanPin, pinResolution)) {
          return false;
        }
      } else {
        // 3. Geographic Hierarchy Filters (when not in explicit PIN mode)
        if (filters.stateId) {
          const stateDists = locationService.getDistricts(filters.stateId).map((d) => d.id);
          if (lib.districtId && !stateDists.includes(lib.districtId)) {
            return false;
          }
        }

        if (filters.districtId) {
          const distObj = locationService.getDistrictById(filters.districtId) || locationService.findDistrictByName(filters.districtId);
          const distName = (distObj?.name || filters.districtId).toLowerCase();
          const libDistName = (lib.districtName || lib.district || '').toLowerCase();
          const matchesDistId = lib.districtId === filters.districtId;
          const matchesDistName = libDistName === distName;

          if (!matchesDistId && !matchesDistName) {
            return false;
          }
        }

        if (filters.localityId) {
          const locObj = locationService.getLocalityById(filters.localityId);
          const locName = (locObj?.name || '').toLowerCase();
          const matchesLocId = lib.localityId === filters.localityId;
          const matchesLocName = 
            (lib.city && lib.city.toLowerCase().includes(locName)) ||
            (lib.area && lib.area.toLowerCase().includes(locName)) ||
            (lib.address && lib.address.toLowerCase().includes(locName));

          if (!matchesLocId && !matchesLocName) {
            return false;
          }
        }

        if (filters.areaId) {
          const arObj = locationService.getAreaById(filters.areaId);
          const arName = (arObj?.name || '').toLowerCase();
          const matchesAreaId = lib.areaId === filters.areaId;
          const matchesAreaName = 
            (lib.area && lib.area.toLowerCase().includes(arName)) ||
            (lib.address && lib.address.toLowerCase().includes(arName));

          if (!matchesAreaId && !matchesAreaName) {
            return false;
          }
        }
      }

      // 4. Shifts Filter
      if (filters.selectedShift) {
        const hasShift = lib.shifts?.some((s) => {
          const sName = s.name.toLowerCase();
          if (filters.selectedShift === 'morning') return sName.includes('morning');
          if (filters.selectedShift === 'afternoon') return sName.includes('afternoon');
          if (filters.selectedShift === 'evening') return sName.includes('evening');
          if (filters.selectedShift === 'full_day') return sName.includes('full') || sName.includes('15-hr') || sName.includes('24');
          return true;
        });
        if (!hasShift) return false;
      }

      // 5. Facilities Filter
      if (filters.selectedFacilities && filters.selectedFacilities.length > 0) {
        const hasAllFacilities = filters.selectedFacilities.every((fac) => {
          if (fac === 'all') return true;
          return lib.facilities?.some((f) => f.toLowerCase().includes(fac.toLowerCase()));
        });
        if (!hasAllFacilities) return false;
      }

      // 6. Max Price Filter
      if (filters.maxPrice && filters.maxPrice < 1500) {
        const price = lib.monthlyStartingPrice || lib.monthlyFee || 800;
        if (price > filters.maxPrice) return false;
      }

      // 7. Seats Filter
      if (filters.minAvailableSeats && filters.minAvailableSeats > 0) {
        const avail = lib.availableSeats ?? Math.round(lib.totalSeats * 0.4);
        if (avail < filters.minAvailableSeats) return false;
      }

      return true;
    });

    // Nearby fallback libraries (e.g. within same district/state if PIN has no direct match)
    let nearbyLibraries: Library[] = [];
    if (matched.length === 0 && (isPinSearch || filters.districtId)) {
      const targetDistrict = pinResolution?.districtName?.toLowerCase() || filters.districtId?.toLowerCase();
      nearbyLibraries = discoverable.filter((l) => {
        const lDist = (l.districtName || l.district || '').toLowerCase();
        return targetDistrict ? lDist.includes(targetDistrict) || targetDistrict.includes(lDist) : true;
      }).slice(0, 6);
    }

    return {
      libraries: matched,
      totalMatches: matched.length,
      pinResolution,
      isPinSearch,
      pinCode: isPinSearch ? cleanPin : undefined,
      nearbyLibraries,
      matchedLocationSummary: pinResolution ? {
        stateName: pinResolution.stateName,
        districtName: pinResolution.districtName,
        localityName: pinResolution.localityName,
        areaName: pinResolution.areaName,
        pinCode: cleanPin
      } : undefined
    };
  }
}

export const libraryDiscoveryService = new LibraryDiscoveryService();
