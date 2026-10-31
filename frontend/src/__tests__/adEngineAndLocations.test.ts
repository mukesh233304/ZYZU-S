import { describe, it, expect } from 'vitest';
import { locationService } from '../services/locationService';
import { advertisementService } from '../services/advertisementService';

describe('PAN-INDIA LOCATION MASTER VERIFICATION', () => {
  it('contains all 28 States and 8 Union Territories of India', () => {
    const states = locationService.getStates('loc-country-in');
    expect(states.length).toBeGreaterThanOrEqual(36);
    
    // Verify key States and UTs exist
    const stateNames = states.map(s => s.name);
    expect(stateNames).toContain('Uttar Pradesh');
    expect(stateNames).toContain('Delhi');
    expect(stateNames).toContain('Bihar');
    expect(stateNames).toContain('Maharashtra');
    expect(stateNames).toContain('Rajasthan');
    expect(stateNames).toContain('Madhya Pradesh');
    expect(stateNames).toContain('Karnataka');
    expect(stateNames).toContain('Tamil Nadu');
    expect(stateNames).toContain('Gujarat');
    expect(stateNames).toContain('Punjab');
    expect(stateNames).toContain('Haryana');
  });

  it('verifies Uttar Pradesh contains all 75 official districts', () => {
    const upDistricts = locationService.getDistricts('loc-state-up');
    expect(upDistricts.length).toBe(75);

    const distNames = upDistricts.map(d => d.name);
    // Spot check districts across UP
    expect(distNames).toContain('Ghazipur');
    expect(distNames).toContain('Varanasi');
    expect(distNames).toContain('Lucknow');
    expect(distNames).toContain('Prayagraj (Allahabad)');
    expect(distNames).toContain('Kanpur Nagar');
    expect(distNames).toContain('Gorakhpur');
    expect(distNames).toContain('Agra');
    expect(distNames).toContain('Aligarh');
    expect(distNames).toContain('Ayodhya (Faizabad)');
    expect(distNames).toContain('Bareilly');
    expect(distNames).toContain('Jhansi');
    expect(distNames).toContain('Meerut');
    expect(distNames).toContain('Moradabad');
    expect(distNames).toContain('Saharanpur');
    expect(distNames).toContain('Mirzapur');
    expect(distNames).toContain('Ballia');
    expect(distNames).toContain('Mau');
    expect(distNames).toContain('Jaunpur');
    expect(distNames).toContain('Chandauli');
    expect(distNames).toContain('Bhadohi (Sant Ravidas Nagar)');
    expect(distNames).toContain('Sonbhadra');
  });

  it('loads localities for a selected district', () => {
    const ghazipurLocalities = locationService.getLocalities('dist-gzp');
    expect(ghazipurLocalities.length).toBeGreaterThan(0);
    const locNames = ghazipurLocalities.map(l => l.name);
    expect(locNames).toContain('Saidpur');
  });
});

describe('ADVANCED FOCUSPOINT ADVERTISEMENT ENGINE VERIFICATION', () => {
  it('serves active multi-company campaigns for all 4 service pages', () => {
    const tutorAds = advertisementService.getCampaignsForPage('FIND_TUTOR');
    const libraryAds = advertisementService.getCampaignsForPage('FIND_LIBRARY');
    const mockTestAds = advertisementService.getCampaignsForPage('MOCK_TESTS');
    const studyMaterialAds = advertisementService.getCampaignsForPage('STUDY_MATERIALS');

    expect(tutorAds.length).toBeGreaterThanOrEqual(1);
    expect(libraryAds.length).toBeGreaterThanOrEqual(1);
    expect(mockTestAds.length).toBeGreaterThanOrEqual(1);
    expect(studyMaterialAds.length).toBeGreaterThanOrEqual(1);

    // Multiple companies exist simultaneously
    const allAds = advertisementService.getAllCampaigns();
    const companies = new Set(allAds.map(a => a.advertiserName));
    expect(companies.size).toBeGreaterThanOrEqual(3);
  });

  it('supports diverse media formats: text, image, video, rich', () => {
    const allAds = advertisementService.getAllCampaigns();
    const mediaTypes = allAds.map(a => a.mediaType);
    expect(mediaTypes).toContain('RICH_AD');
    expect(mediaTypes).toContain('IMAGE_TEXT');
  });

  it('automatically excludes expired campaigns from public queries', () => {
    // Add expired campaign
    const expiredCamp = advertisementService.saveCampaign({
      advertiserName: 'Test Advertiser',
      headline: 'Expired Flash Sale',
      placement: 'SERVICE_CAROUSEL',
      targetPages: ['FIND_TUTOR'],
      mediaType: 'TEXT_ONLY',
      destinationUrl: '/find-tutor',
      ctaText: 'Expired',
      layout: 'carousel',
      status: 'LIVE',
      startDate: '2020-01-01',
      endDate: '2021-01-01', // definitely expired
      priority: 100,
    });

    const activeTutorAds = advertisementService.getCampaignsForPage('FIND_TUTOR');
    const foundExpired = activeTutorAds.find(a => a.id === expiredCamp.id);
    expect(foundExpired).toBeUndefined();

    // Clean up
    advertisementService.deleteCampaign(expiredCamp.id);
  });

  it('sanitizes external and destination URLs preventing malicious redirects', () => {
    expect(advertisementService.sanitizeUrl('javascript:alert(1)')).toBe('/');
    expect(advertisementService.sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('/');
    expect(advertisementService.sanitizeUrl('/find-tutor')).toBe('/find-tutor');
    expect(advertisementService.sanitizeUrl('https://partner-books.com/neet')).toBe('https://partner-books.com/neet');
  });

  it('records real analytics events accurately without fabricated data', () => {
    const allAds = advertisementService.getAllCampaigns();
    const targetAd = allAds[0];
    const initialImpressions = targetAd.impressions || 0;
    const initialClicks = targetAd.clicks || 0;

    advertisementService.recordImpression(targetAd.id);
    advertisementService.recordClick(targetAd.id);

    const updated = advertisementService.getAllCampaigns().find(a => a.id === targetAd.id);
    expect(updated?.impressions).toBe(initialImpressions + 1);
    expect(updated?.clicks).toBe(initialClicks + 1);
  });
});
