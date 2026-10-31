import { describe, it, expect } from 'vitest';
import { locationService } from '../services/locationService';

describe('PIN CODE AUTO-FILL & GEOGRAPHIC HIERARCHY TESTS', () => {
  it('rejects invalid or incomplete PIN codes gracefully', async () => {
    const emptyResult = await locationService.lookupPincode('');
    expect(emptyResult.success).toBe(false);

    const shortResult = await locationService.lookupPincode('123');
    expect(shortResult.success).toBe(false);
    expect(shortResult.message).toContain('6 digits');
  });

  it('resolves Ghazipur PIN 233221 with exact State, District and Locality from local master', async () => {
    const result = await locationService.lookupPincode('233221');
    expect(result.success).toBe(true);
    expect(result.pincode).toBe('233221');

    const state = result.state;
    const district = result.district;

    expect(state).toBeDefined();
    expect(state?.name).toBe('Uttar Pradesh');

    expect(district).toBeDefined();
    expect(district?.name).toBe('Ghazipur');

    expect(result.localities.length).toBeGreaterThan(0);
    expect(result.suggestedLocality).toBeDefined();
  });

  it('resolves major Indian cities via instant offline prefix directory fallback', async () => {
    // 226xxx -> Lucknow, UP
    const lko = await locationService.lookupPincode('226001');
    expect(lko.success).toBe(true);
    expect(lko.state?.name).toBe('Uttar Pradesh');
    expect(lko.district?.name).toContain('Lucknow');

    // 221xxx -> Varanasi, UP
    const vns = await locationService.lookupPincode('221001');
    expect(vns.success).toBe(true);
    expect(vns.state?.name).toBe('Uttar Pradesh');
    expect(vns.district?.name).toContain('Varanasi');

    // 110xxx -> New Delhi / Delhi
    const del = await locationService.lookupPincode('110001');
    expect(del.success).toBe(true);
    expect(del.state?.name).toBe('Delhi');

    // 800xxx -> Patna, Bihar
    const pat = await locationService.lookupPincode('800001');
    expect(pat.success).toBe(true);
    expect(pat.state?.name).toBe('Bihar');
    expect(pat.district?.name).toContain('Patna');
  });

  it('supports bidirectional reverse lookup: finding PIN from locality and area', () => {
    // Saidpur locality has pincode 233221 in master
    const saidpurPin = locationService.getPincodeForLocation('loc-gzp-saidpur');
    expect(saidpurPin).toBe('233221');

    // Pankaj Talkies Area has pincode 233221
    const areaPin = locationService.getPincodeForLocation('loc-gzp-saidpur', 'loc-area-pankaj-talkies');
    expect(areaPin).toBe('233221');
  });

  it('correctly formats the 4-tier location hierarchy string', () => {
    const formatted = locationService.formatLocation({
      stateName: 'Uttar Pradesh',
      districtName: 'Ghazipur',
      localityName: 'Saidpur',
      areaName: 'Pankaj Talkies Area',
    });
    expect(formatted).toBe('Pankaj Talkies Area, Saidpur, Ghazipur, Uttar Pradesh');
  });
});
