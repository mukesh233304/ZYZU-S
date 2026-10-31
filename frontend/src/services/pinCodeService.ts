// FOCUSPOINT — Frontend-First PIN Code Intelligence Service
// Clean abstraction over postal and geographic resolution, ready for direct backend API replacement.

import { locationService } from './locationService';
import { LocationHierarchySelection, PincodeLookupResult, Locality, Area } from '../types/location';

export interface PinCodeResolution {
  success: boolean;
  pincode: string;
  stateId?: string;
  stateName?: string;
  districtId?: string;
  districtName?: string;
  localityId?: string;
  localityName?: string;
  areaId?: string;
  areaName?: string;
  availableLocalities: Locality[];
  availableAreas: Area[];
  message?: string;
  source: 'local_master' | 'india_post_api' | 'prefix_fallback' | 'cache' | 'none';
}

class PinCodeService {
  /**
   * Validate Indian PIN code format (exactly 6 numeric digits, cannot start with 0)
   */
  public isValidPinCode(pincode: string): boolean {
    const cleaned = (pincode || '').trim().replace(/\D/g, '');
    return /^[1-9][0-9]{5}$/.test(cleaned);
  }

  /**
   * Resolve an Indian PIN code into State, District, Locality, and Area hierarchy
   */
  public async resolvePinCode(pincode: string): Promise<PinCodeResolution> {
    const cleanPin = (pincode || '').trim().replace(/\D/g, '').slice(0, 6);

    if (!cleanPin) {
      return {
        success: false,
        pincode: '',
        availableLocalities: [],
        availableAreas: [],
        source: 'none',
        message: 'Please enter a 6-digit Indian PIN code'
      };
    }

    if (cleanPin.length !== 6 || cleanPin.startsWith('0')) {
      return {
        success: false,
        pincode: cleanPin,
        availableLocalities: [],
        availableAreas: [],
        source: 'none',
        message: 'Invalid PIN code. Must be a valid 6-digit Indian Postal code.'
      };
    }

    try {
      const result: PincodeLookupResult = await locationService.lookupPincode(cleanPin);

      if (!result.success) {
        return {
          success: false,
          pincode: cleanPin,
          availableLocalities: [],
          availableAreas: [],
          source: result.source || 'none',
          message: result.message || `No location found for PIN code ${cleanPin}. You can select manually below.`
        };
      }

      const availableLocalities = result.localities || [];
      const suggestedLocality = result.suggestedLocality || availableLocalities[0];
      const availableAreas = suggestedLocality ? locationService.getAreas(suggestedLocality.id) : [];
      const suggestedArea = result.suggestedArea || availableAreas[0];

      return {
        success: true,
        pincode: cleanPin,
        stateId: result.state?.id,
        stateName: result.state?.name,
        districtId: result.district?.id,
        districtName: result.district?.name,
        localityId: suggestedLocality?.id,
        localityName: suggestedLocality?.name,
        areaId: suggestedArea?.id,
        areaName: suggestedArea?.name,
        availableLocalities,
        availableAreas,
        source: result.source,
        message: result.message || `Location resolved for PIN ${cleanPin}`
      };
    } catch (err: any) {
      console.error('PIN code resolution error:', err);
      return {
        success: false,
        pincode: cleanPin,
        availableLocalities: [],
        availableAreas: [],
        source: 'none',
        message: 'Unable to connect to location directory. Please select your location manually.'
      };
    }
  }

  /**
   * Convert PinCodeResolution to LocationHierarchySelection for search filters
   */
  public toLocationSelection(resolution: PinCodeResolution): LocationHierarchySelection {
    return {
      countryId: 'loc-country-in',
      stateId: resolution.stateId,
      stateName: resolution.stateName,
      districtId: resolution.districtId,
      districtName: resolution.districtName,
      localityId: resolution.localityId,
      localityName: resolution.localityName,
      areaId: resolution.areaId,
      areaName: resolution.areaName,
      pincode: resolution.pincode
    };
  }
}

export const pinCodeService = new PinCodeService();
