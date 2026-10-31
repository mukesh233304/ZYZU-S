import { 
  Country, 
  State, 
  DistrictLocation, 
  Locality, 
  Area, 
  LocationHierarchySelection, 
  LocationHierarchyStats,
  PincodeLookupResult,
  PincodePostOffice
} from '../types/location';
import { 
  INITIAL_COUNTRY, 
  INITIAL_STATES, 
  INITIAL_DISTRICTS, 
  INITIAL_LOCALITIES, 
  INITIAL_AREAS 
} from '../mock/data/locations';

const STORAGE_KEY = 'fp_locations_master_v2';
const LEGACY_STORAGE_KEY = 'fp_locations_master_v1';

// Comprehensive Indian Postal PIN Code Map for Instant 0ms Resolution
const PINCODE_PREFIX_MAP: Record<string, { stateName: string; stateId: string; districtName: string; districtId: string; defaultLocality: string }> = {
  // Uttar Pradesh
  '233': { stateName: 'Uttar Pradesh', stateId: 'loc-state-up', districtName: 'Ghazipur', districtId: 'dist-gzp', defaultLocality: 'Saidpur' },
  '221': { stateName: 'Uttar Pradesh', stateId: 'loc-state-up', districtName: 'Varanasi', districtId: 'dist-vns', defaultLocality: 'Lanka' },
  '226': { stateName: 'Uttar Pradesh', stateId: 'loc-state-up', districtName: 'Lucknow', districtId: 'dist-lko', defaultLocality: 'Hazratganj' },
  '208': { stateName: 'Uttar Pradesh', stateId: 'loc-state-up', districtName: 'Kanpur Nagar', districtId: 'dist-knp', defaultLocality: 'Kanpur City' },
  '211': { stateName: 'Uttar Pradesh', stateId: 'loc-state-up', districtName: 'Prayagraj (Allahabad)', districtId: 'dist-ald', defaultLocality: 'Civil Lines' },
  '282': { stateName: 'Uttar Pradesh', stateId: 'loc-state-up', districtName: 'Agra', districtId: 'dist-agr', defaultLocality: 'Agra Cantt' },
  '277': { stateName: 'Uttar Pradesh', stateId: 'loc-state-up', districtName: 'Ballia', districtId: 'dist-bal', defaultLocality: 'Ballia City' },
  '275': { stateName: 'Uttar Pradesh', stateId: 'loc-state-up', districtName: 'Mau', districtId: 'dist-mau', defaultLocality: 'Mau Sadar' },
  '232': { stateName: 'Uttar Pradesh', stateId: 'loc-state-up', districtName: 'Chandauli', districtId: 'dist-cnd', defaultLocality: 'Mughalsarai' },
  '273': { stateName: 'Uttar Pradesh', stateId: 'loc-state-up', districtName: 'Gorakhpur', districtId: 'dist-gkp', defaultLocality: 'Gorakhpur City' },
  '201': { stateName: 'Uttar Pradesh', stateId: 'loc-state-up', districtName: 'Gautam Buddha Nagar (Noida)', districtId: 'dist-gbn', defaultLocality: 'Noida City' },
  '248': { stateName: 'Uttarakhand', stateId: 'loc-state-uk', districtName: 'Dehradun', districtId: 'dist-ddn', defaultLocality: 'Rajpur Road' },
  '800': { stateName: 'Bihar', stateId: 'loc-state-br', districtName: 'Patna', districtId: 'dist-pat', defaultLocality: 'Boring Road' },
  '110': { stateName: 'Delhi', stateId: 'loc-state-dl', districtName: 'New Delhi', districtId: 'dist-ndl', defaultLocality: 'Connaught Place' },
  '400': { stateName: 'Maharashtra', stateId: 'loc-state-mh', districtName: 'Mumbai', districtId: 'dist-mum', defaultLocality: 'South Mumbai' },
  '411': { stateName: 'Maharashtra', stateId: 'loc-state-mh', districtName: 'Pune', districtId: 'dist-pne', defaultLocality: 'Kothrud' },
  '560': { stateName: 'Karnataka', stateId: 'loc-state-ka', districtName: 'Bengaluru Urban', districtId: 'dist-blr', defaultLocality: 'Koramangala' },
  '500': { stateName: 'Telangana', stateId: 'loc-state-ts', districtName: 'Hyderabad', districtId: 'dist-hyd', defaultLocality: 'Banjara Hills' },
  '600': { stateName: 'Tamil Nadu', stateId: 'loc-state-tn', districtName: 'Chennai', districtId: 'dist-chn', defaultLocality: 'T Nagar' },
  '700': { stateName: 'West Bengal', stateId: 'loc-state-wb', districtName: 'Kolkata', districtId: 'dist-kol', defaultLocality: 'Salt Lake' },
  '302': { stateName: 'Rajasthan', stateId: 'loc-state-rj', districtName: 'Jaipur', districtId: 'dist-jpr', defaultLocality: 'Malviya Nagar' },
  '380': { stateName: 'Gujarat', stateId: 'loc-state-gj', districtName: 'Ahmedabad', districtId: 'dist-ahd', defaultLocality: 'Navrangpura' },
  '462': { stateName: 'Madhya Pradesh', stateId: 'loc-state-mp', districtName: 'Bhopal', districtId: 'dist-bho', defaultLocality: 'Arera Colony' },
  '160': { stateName: 'Chandigarh', stateId: 'loc-state-ch', districtName: 'Chandigarh', districtId: 'dist-chd', defaultLocality: 'Sector 17' },
};

// 2-digit Zone mapping for Pan-India State resolution
const PINCODE_STATE_RANGE_MAP: Array<{ prefix: string[]; stateId: string; stateName: string }> = [
  { prefix: ['11'], stateId: 'loc-state-dl', stateName: 'Delhi' },
  { prefix: ['12', '13'], stateId: 'loc-state-hr', stateName: 'Haryana' },
  { prefix: ['14', '15'], stateId: 'loc-state-pb', stateName: 'Punjab' },
  { prefix: ['16'], stateId: 'loc-state-ch', stateName: 'Chandigarh' },
  { prefix: ['17'], stateId: 'loc-state-hp', stateName: 'Himachal Pradesh' },
  { prefix: ['18', '19'], stateId: 'loc-state-jk', stateName: 'Jammu and Kashmir' },
  { prefix: ['20', '21', '22', '23', '24', '25', '26', '27', '28'], stateId: 'loc-state-up', stateName: 'Uttar Pradesh' },
  { prefix: ['30', '31', '32', '33', '34'], stateId: 'loc-state-rj', stateName: 'Rajasthan' },
  { prefix: ['36', '37', '38', '39'], stateId: 'loc-state-gj', stateName: 'Gujarat' },
  { prefix: ['40', '41', '42', '43', '44'], stateId: 'loc-state-mh', stateName: 'Maharashtra' },
  { prefix: ['45', '46', '47', '48'], stateId: 'loc-state-mp', stateName: 'Madhya Pradesh' },
  { prefix: ['49'], stateId: 'loc-state-cg', stateName: 'Chhattisgarh' },
  { prefix: ['50', '51', '52', '53'], stateId: 'loc-state-ap', stateName: 'Andhra Pradesh' },
  { prefix: ['56', '57', '58', '59'], stateId: 'loc-state-ka', stateName: 'Karnataka' },
  { prefix: ['60', '61', '62', '63', '64'], stateId: 'loc-state-tn', stateName: 'Tamil Nadu' },
  { prefix: ['67', '68', '69'], stateId: 'loc-state-kl', stateName: 'Kerala' },
  { prefix: ['70', '71', '72', '73', '74'], stateId: 'loc-state-wb', stateName: 'West Bengal' },
  { prefix: ['75', '76', '77'], stateId: 'loc-state-od', stateName: 'Odisha' },
  { prefix: ['78', '79'], stateId: 'loc-state-as', stateName: 'Assam' },
  { prefix: ['80', '81', '82', '83', '84', '85'], stateId: 'loc-state-br', stateName: 'Bihar' },
];

type Listener = () => void;

class LocationService {
  private countries: Country[] = [];
  private states: State[] = [];
  private districts: DistrictLocation[] = [];
  private localities: Locality[] = [];
  private areas: Area[] = [];
  private listeners: Set<Listener> = new Set();

  constructor() {
    this.init();
  }

  private init() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.countries = parsed.countries || [INITIAL_COUNTRY];
        this.states = INITIAL_STATES; // Always keep all 28 States and 8 UTs updated

        // Merge INITIAL_DISTRICTS (including all 75 UP districts) with any custom user districts
        const districtMap = new Map<string, DistrictLocation>();
        INITIAL_DISTRICTS.forEach(d => districtMap.set(d.id, d));
        (parsed.districts || []).forEach((d: DistrictLocation) => {
          if (!districtMap.has(d.id)) {
            districtMap.set(d.id, d);
          }
        });
        this.districts = Array.from(districtMap.values());
        
        // Merge localities & areas
        const locMap = new Map<string, Locality>();
        INITIAL_LOCALITIES.forEach(l => locMap.set(l.id, l));
        (parsed.localities || []).forEach((l: Locality) => {
          if (!locMap.has(l.id)) {
            locMap.set(l.id, l);
          }
        });
        this.localities = Array.from(locMap.values());

        const areaMap = new Map<string, Area>();
        INITIAL_AREAS.forEach(a => areaMap.set(a.id, a));
        (parsed.areas || []).forEach((a: Area) => {
          if (!areaMap.has(a.id)) {
            areaMap.set(a.id, a);
          }
        });
        this.areas = Array.from(areaMap.values());

        // Save into v2 storage
        this.save();
        return;
      }
    } catch {
      // Fallback on error
    }
    this.resetToDefaults(false);
  }

  private save() {
    try {
      const data = {
        countries: this.countries,
        states: this.states,
        districts: this.districts,
        localities: this.localities,
        areas: this.areas,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      this.notify();
    } catch (e) {
      console.error('Failed to save location master:', e);
    }
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(fn => {
      try {
        fn();
      } catch (err) {
        console.error('Error in location listener:', err);
      }
    });
  }

  public resetToDefaults(notify = true) {
    this.countries = [INITIAL_COUNTRY];
    this.states = [...INITIAL_STATES];
    this.districts = [...INITIAL_DISTRICTS];
    this.localities = [...INITIAL_LOCALITIES];
    this.areas = [...INITIAL_AREAS];
    if (notify) {
      this.save();
    } else {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          countries: this.countries,
          states: this.states,
          districts: this.districts,
          localities: this.localities,
          areas: this.areas,
        }));
      } catch {}
    }
  }

  // ==========================================
  // QUERY METHODS (Cascading Lookups)
  // ==========================================

  public getCountries(onlyActive = true): Country[] {
    return onlyActive 
      ? this.countries.filter(c => c.status === 'ACTIVE') 
      : [...this.countries];
  }

  public getStates(countryId = 'loc-country-in', onlyActive = true): State[] {
    let list = this.states.filter(s => 
      s.countryId === countryId || 
      s.countryId === 'IN' || 
      countryId === 'IN' || 
      !s.countryId ||
      countryId === 'loc-country-in'
    );
    if (onlyActive) {
      list = list.filter(s => s.status === 'ACTIVE');
    }
    if (list.length === 0 && this.states.length > 0) {
      list = onlyActive ? this.states.filter(s => s.status === 'ACTIVE') : [...this.states];
    }
    if (list.length === 0) {
      list = [...INITIAL_STATES];
    }
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }

  public getDistricts(stateId?: string, onlyActive = true): DistrictLocation[] {
    let list = this.districts;
    if (stateId) {
      list = list.filter(d => d.stateId === stateId || d.stateId.toLowerCase() === stateId.toLowerCase());
    }
    if (onlyActive) {
      list = list.filter(d => d.status === 'ACTIVE');
    }
    if (list.length === 0 && stateId) {
      list = INITIAL_DISTRICTS.filter(d => d.stateId === stateId || d.stateId.toLowerCase() === stateId.toLowerCase());
      if (onlyActive) {
        list = list.filter(d => d.status === 'ACTIVE');
      }
    }
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }

  public getLocalities(districtId?: string, onlyActive = true): Locality[] {
    let list = this.localities;
    if (districtId) {
      list = list.filter(l => l.districtId === districtId);
    }
    if (onlyActive) {
      list = list.filter(l => l.status === 'ACTIVE');
    }
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }

  public getAreas(localityId?: string, onlyActive = true): Area[] {
    let list = this.areas;
    if (localityId) {
      list = list.filter(a => a.localityId === localityId);
    }
    if (onlyActive) {
      list = list.filter(a => a.status === 'ACTIVE');
    }
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }

  public getActiveStates(countryId = 'loc-country-in'): State[] {
    return this.getStates(countryId, true);
  }

  public getActiveDistricts(stateId?: string): DistrictLocation[] {
    return this.getDistricts(stateId, true);
  }

  public getActiveLocalities(districtId?: string): Locality[] {
    return this.getLocalities(districtId, true);
  }

  public getActiveAreas(localityId?: string): Area[] {
    return this.getAreas(localityId, true);
  }

  // ==========================================
  // GET BY ID METHODS
  // ==========================================

  public getStateById(id?: string): State | undefined {
    if (!id) return undefined;
    return this.states.find(s => s.id === id);
  }

  public getDistrictById(id?: string): DistrictLocation | undefined {
    if (!id) return undefined;
    return this.districts.find(d => d.id === id);
  }

  public getLocalityById(id?: string): Locality | undefined {
    if (!id) return undefined;
    return this.localities.find(l => l.id === id);
  }

  public getAreaById(id?: string): Area | undefined {
    if (!id) return undefined;
    return this.areas.find(a => a.id === id);
  }

  // ==========================================
  // RESOLUTION BY NAME / FUZZY MATCH
  // ==========================================

  public findStateByName(name?: string): State | undefined {
    if (!name) return undefined;
    const clean = name.trim().toLowerCase();
    return this.states.find(s => 
      s.name.toLowerCase() === clean || 
      s.code.toLowerCase() === clean ||
      s.id.toLowerCase() === clean
    );
  }

  public findDistrictByName(name?: string, stateId?: string): DistrictLocation | undefined {
    if (!name) return undefined;
    const clean = name.trim().toLowerCase();
    return this.districts.find(d => {
      const matchState = !stateId || d.stateId === stateId;
      const matchName = d.name.toLowerCase() === clean || 
                        d.code.toLowerCase() === clean || 
                        d.id.toLowerCase() === clean ||
                        d.name.toLowerCase().includes(clean);
      return matchState && matchName;
    });
  }

  public findLocalityByName(name?: string, districtId?: string): Locality | undefined {
    if (!name) return undefined;
    const clean = name.trim().toLowerCase();
    return this.localities.find(l => {
      const matchDist = !districtId || l.districtId === districtId;
      const matchName = l.name.toLowerCase() === clean || 
                        l.id.toLowerCase() === clean ||
                        l.name.toLowerCase().includes(clean);
      return matchDist && matchName;
    });
  }

  public findAreaByName(name?: string, localityId?: string): Area | undefined {
    if (!name) return undefined;
    const clean = name.trim().toLowerCase();
    return this.areas.find(a => {
      const matchLoc = !localityId || a.localityId === localityId;
      const matchName = a.name.toLowerCase() === clean || 
                        a.id.toLowerCase() === clean ||
                        a.name.toLowerCase().includes(clean);
      return matchLoc && matchName;
    });
  }

  // ==========================================
  // FORMATTING HIERARCHY HELPER
  // ==========================================

  public formatLocation(selection: LocationHierarchySelection): string {
    const parts: string[] = [];

    const area = this.getAreaById(selection.areaId);
    const areaName = area ? area.name : selection.areaName;
    if (areaName && areaName !== 'All Areas') parts.push(areaName);

    const locality = this.getLocalityById(selection.localityId);
    const localityName = locality ? locality.name : selection.localityName;
    if (localityName && localityName !== 'All Localities') parts.push(localityName);

    const district = this.getDistrictById(selection.districtId);
    const districtName = district ? district.name : selection.districtName;
    if (districtName && districtName !== 'All Districts') parts.push(districtName);

    const state = this.getStateById(selection.stateId);
    const stateName = state ? state.name : selection.stateName;
    if (stateName && stateName !== 'All States') parts.push(stateName);

    return parts.join(', ');
  }

  // ==========================================
  // PIN CODE SMART AUTO-FILL ENGINE
  // ==========================================

  public async lookupPincode(pincode: string): Promise<PincodeLookupResult> {
    const clean = (pincode || '').replace(/\D/g, '').slice(0, 6);
    if (clean.length !== 6) {
      return {
        success: false,
        pincode: clean,
        localities: [],
        source: 'none',
        message: clean.length === 0 ? 'Please enter a PIN code' : 'PIN code must be exactly 6 digits',
      };
    }

    // 1. Check in-memory / localStorage cache
    const cacheKey = `fp_pincode_cache_${clean}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        const state = this.getStateById(parsed.state?.id) || this.findStateByName(parsed.state?.name);
        const district = this.getDistrictById(parsed.district?.id) || this.findDistrictByName(parsed.district?.name, state?.id);
        const localities = district ? this.getLocalities(district.id) : [];
        const suggestedLocality = this.getLocalityById(parsed.suggestedLocality?.id) || localities[0];
        const suggestedArea = this.getAreaById(parsed.suggestedArea?.id) || (suggestedLocality ? this.getAreas(suggestedLocality.id)[0] : undefined);
        return {
          ...parsed,
          state: state || parsed.state,
          district: district || parsed.district,
          localities: localities.length > 0 ? localities : parsed.localities,
          suggestedLocality,
          suggestedArea,
          source: 'local_master'
        };
      }
    } catch {}

    // 2. Local Master Exact Match (Areas or Localities with this PIN)
    const matchingAreas = this.areas.filter(a => a.pincode === clean && a.status === 'ACTIVE');
    const matchingLocalities = this.localities.filter(l => l.pincode === clean && l.status === 'ACTIVE');

    if (matchingAreas.length > 0 || matchingLocalities.length > 0) {
      const firstArea = matchingAreas[0];
      const firstLoc = matchingLocalities[0] || (firstArea ? this.getLocalityById(firstArea.localityId) : undefined);
      const districtId = firstLoc?.districtId || firstArea?.districtId;
      const stateId = firstLoc?.stateId || firstArea?.stateId;

      const state = this.getStateById(stateId);
      const district = this.getDistrictById(districtId);
      const allDistrictLocalities = district ? this.getLocalities(district.id) : [];
      const relevantLocalities = matchingLocalities.length > 0 ? matchingLocalities : (firstLoc ? [firstLoc] : allDistrictLocalities);
      const suggestedLocality = firstLoc || relevantLocalities[0];
      const suggestedArea = firstArea || (suggestedLocality ? this.getAreas(suggestedLocality.id)[0] : undefined);

      const result: PincodeLookupResult = {
        success: true,
        pincode: clean,
        state,
        district,
        localities: allDistrictLocalities,
        suggestedLocality,
        suggestedArea,
        source: 'local_master',
        message: `Verified Postal PIN: ${suggestedLocality?.name || ''}, ${district?.name || ''}, ${state?.name || ''}`
      };

      try {
        localStorage.setItem(cacheKey, JSON.stringify(result));
      } catch {}

      return result;
    }

    // 3. Query India Post Public API for real-time Pan-India coverage (with fast 2.2s timeout)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2200);

      const res = await fetch(`https://api.postalpincode.in/pincode/${clean}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data[0]?.Status === 'Success' && Array.isArray(data[0].PostOffice) && data[0].PostOffice.length > 0) {
          const postOffices: PincodePostOffice[] = data[0].PostOffice.map((po: any) => ({
            name: po.Name,
            branchType: po.BranchType,
            deliveryStatus: po.DeliveryStatus,
            circle: po.Circle,
            district: po.District,
            division: po.Division,
            region: po.Region,
            block: po.Block !== 'NA' ? po.Block : po.Name,
            state: po.State,
            pincode: po.Pincode,
          }));

          const firstPO = postOffices[0];

          // Match or resolve State
          let state = this.findStateByName(firstPO.state);
          if (!state) {
            const prefix2 = clean.slice(0, 2);
            const rangeMatch = PINCODE_STATE_RANGE_MAP.find(r => r.prefix.includes(prefix2));
            if (rangeMatch) {
              state = this.getStateById(rangeMatch.stateId);
            }
          }

          // Match or resolve District
          let district = state ? this.findDistrictByName(firstPO.district, state.id) : this.findDistrictByName(firstPO.district);
          if (!district && state) {
            try {
              district = this.addDistrict({
                stateId: state.id,
                name: firstPO.district,
                code: firstPO.district.slice(0, 3).toUpperCase(),
                status: 'ACTIVE'
              });
            } catch {
              district = this.findDistrictByName(firstPO.district);
            }
          }

          // Match or resolve Locality / Block / Town
          let localities: Locality[] = district ? this.getLocalities(district.id) : [];
          let suggestedLocality: Locality | undefined;

          const blockName = (firstPO.block && firstPO.block !== 'NA') ? firstPO.block : firstPO.name;
          suggestedLocality = district ? this.findLocalityByName(blockName, district.id) : undefined;

          if (!suggestedLocality && district) {
            try {
              suggestedLocality = this.addLocality({
                districtId: district.id,
                name: blockName,
                type: 'TOWN',
                pincode: clean,
                status: 'ACTIVE'
              });
              localities = this.getLocalities(district.id);
            } catch {}
          }

          // Areas: register post office names as areas under this locality if not existing
          let suggestedArea: Area | undefined;
          if (suggestedLocality) {
            const existingAreas = this.getAreas(suggestedLocality.id);
            const poName = firstPO.name;
            suggestedArea = existingAreas.find(a => a.name.toLowerCase() === poName.toLowerCase());
            if (!suggestedArea) {
              try {
                suggestedArea = this.addArea({
                  localityId: suggestedLocality.id,
                  name: poName,
                  type: 'NEIGHBORHOOD',
                  pincode: clean,
                  status: 'ACTIVE'
                });
              } catch {}
            }
          }

          const result: PincodeLookupResult = {
            success: true,
            pincode: clean,
            state,
            district,
            localities,
            suggestedLocality: suggestedLocality || localities[0],
            suggestedArea,
            postOffices,
            source: 'india_post_api',
            message: `India Post Verified: ${firstPO.name} (${blockName}), ${district?.name || firstPO.district}, ${state?.name || firstPO.state}`
          };

          try {
            localStorage.setItem(cacheKey, JSON.stringify(result));
          } catch {}

          return result;
        }
      }
    } catch {
      // Fallback on timeout or network offline
    }

    // 4. Prefix fallback for offline / remote locations
    const prefix3 = clean.slice(0, 3);
    const prefixMatch = PINCODE_PREFIX_MAP[prefix3];

    if (prefixMatch) {
      const state = this.getStateById(prefixMatch.stateId) || this.findStateByName(prefixMatch.stateName);
      const district = this.getDistrictById(prefixMatch.districtId) || (state ? this.findDistrictByName(prefixMatch.districtName, state.id) : undefined);
      const localities = district ? this.getLocalities(district.id) : [];
      const suggestedLocality = (district ? this.findLocalityByName(prefixMatch.defaultLocality, district.id) : undefined) || localities[0];
      const areas = suggestedLocality ? this.getAreas(suggestedLocality.id) : [];

      const result: PincodeLookupResult = {
        success: true,
        pincode: clean,
        state,
        district,
        localities,
        suggestedLocality,
        suggestedArea: areas[0],
        source: 'prefix_fallback',
        message: `Offline Postal Match: ${district?.name || prefixMatch.districtName}, ${state?.name || prefixMatch.stateName}`
      };

      try {
        localStorage.setItem(cacheKey, JSON.stringify(result));
      } catch {}

      return result;
    }

    // 5. 2-digit State Zone Fallback
    const prefix2 = clean.slice(0, 2);
    const rangeMatch = PINCODE_STATE_RANGE_MAP.find(r => r.prefix.includes(prefix2));
    if (rangeMatch) {
      const state = this.getStateById(rangeMatch.stateId) || this.findStateByName(rangeMatch.stateName);
      const districts = state ? this.getDistricts(state.id) : [];
      return {
        success: true,
        pincode: clean,
        state,
        district: districts[0],
        localities: districts[0] ? this.getLocalities(districts[0].id) : [],
        source: 'prefix_fallback',
        message: `Detected State: ${state?.name || rangeMatch.stateName}`
      };
    }

    return {
      success: false,
      pincode: clean,
      localities: [],
      source: 'none',
      message: `Could not identify location for PIN code ${clean}. Please select state & district manually.`
    };
  }

  public getPincodeForLocation(localityId?: string, areaId?: string): string | undefined {
    if (areaId) {
      const a = this.getAreaById(areaId);
      if (a?.pincode) return a.pincode;
    }
    if (localityId) {
      const l = this.getLocalityById(localityId);
      if (l?.pincode) return l.pincode;
    }
    return undefined;
  }

  // ==========================================
  // SUPER ADMIN CRUD OPERATIONS
  // ==========================================

  // --- STATE CRUD ---
  public addState(data: Omit<State, 'id' | 'countryId' | 'createdAt' | 'updatedAt'> & { countryId?: string }): State {
    const id = `loc-state-${data.code.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now().toString(36)}`;
    const now = new Date().toISOString();
    const newState: State = {
      id,
      countryId: data.countryId || 'loc-country-in',
      name: data.name.trim(),
      code: data.code.trim().toUpperCase(),
      type: data.type || 'STATE',
      status: data.status || 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    };
    this.states.push(newState);
    this.save();
    return newState;
  }

  public updateState(id: string, updates: Partial<Omit<State, 'id' | 'countryId' | 'createdAt'>>): State {
    const index = this.states.findIndex(s => s.id === id);
    if (index === -1) throw new Error(`State with id ${id} not found`);
    this.states[index] = {
      ...this.states[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.states[index];
  }

  public toggleStateStatus(id: string): State {
    const s = this.getStateById(id);
    if (!s) throw new Error(`State ${id} not found`);
    return this.updateState(id, { status: s.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' });
  }

  // --- DISTRICT CRUD ---
  public addDistrict(data: Omit<DistrictLocation, 'id' | 'countryId' | 'createdAt' | 'updatedAt'> & { countryId?: string }): DistrictLocation {
    const state = this.getStateById(data.stateId);
    if (!state) throw new Error(`Parent State ${data.stateId} not found`);

    const id = `dist-${data.name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 4)}-${Date.now().toString(36)}`;
    const now = new Date().toISOString();
    const newDistrict: DistrictLocation = {
      id,
      countryId: data.countryId || state.countryId || 'loc-country-in',
      stateId: data.stateId,
      name: data.name.trim(),
      code: data.code ? data.code.trim().toUpperCase() : data.name.slice(0, 3).toUpperCase(),
      status: data.status || 'ACTIVE',
      activeAdminId: data.activeAdminId,
      activeAdminName: data.activeAdminName,
      createdAt: now,
      updatedAt: now,
    };
    this.districts.push(newDistrict);
    this.save();
    return newDistrict;
  }

  public updateDistrict(id: string, updates: Partial<Omit<DistrictLocation, 'id' | 'createdAt'>>): DistrictLocation {
    const index = this.districts.findIndex(d => d.id === id);
    if (index === -1) throw new Error(`District with id ${id} not found`);
    this.districts[index] = {
      ...this.districts[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.districts[index];
  }

  public toggleDistrictStatus(id: string): DistrictLocation {
    const d = this.getDistrictById(id);
    if (!d) throw new Error(`District ${id} not found`);
    return this.updateDistrict(id, { status: d.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' });
  }

  // --- LOCALITY CRUD ---
  public addLocality(data: Omit<Locality, 'id' | 'countryId' | 'stateId' | 'createdAt' | 'updatedAt'>): Locality {
    const district = this.getDistrictById(data.districtId);
    if (!district) throw new Error(`Parent District ${data.districtId} not found`);

    const id = `loc-${district.code.toLowerCase()}-${data.name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8)}-${Date.now().toString(36)}`;
    const now = new Date().toISOString();
    const newLocality: Locality = {
      id,
      countryId: district.countryId,
      stateId: district.stateId,
      districtId: data.districtId,
      name: data.name.trim(),
      type: data.type || 'LOCALITY',
      pincode: data.pincode ? data.pincode.trim() : undefined,
      status: data.status || 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    };
    this.localities.push(newLocality);
    this.save();
    return newLocality;
  }

  public updateLocality(id: string, updates: Partial<Omit<Locality, 'id' | 'countryId' | 'createdAt'>>): Locality {
    const index = this.localities.findIndex(l => l.id === id);
    if (index === -1) throw new Error(`Locality with id ${id} not found`);
    this.localities[index] = {
      ...this.localities[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.localities[index];
  }

  public toggleLocalityStatus(id: string): Locality {
    const l = this.getLocalityById(id);
    if (!l) throw new Error(`Locality ${id} not found`);
    return this.updateLocality(id, { status: l.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' });
  }

  // --- AREA CRUD ---
  public addArea(data: Omit<Area, 'id' | 'countryId' | 'stateId' | 'districtId' | 'createdAt' | 'updatedAt'>): Area {
    const locality = this.getLocalityById(data.localityId);
    if (!locality) throw new Error(`Parent Locality ${data.localityId} not found`);

    const id = `loc-area-${data.name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10)}-${Date.now().toString(36)}`;
    const now = new Date().toISOString();
    const newArea: Area = {
      id,
      countryId: locality.countryId,
      stateId: locality.stateId,
      districtId: locality.districtId,
      localityId: data.localityId,
      name: data.name.trim(),
      type: data.type || 'NEIGHBORHOOD',
      pincode: data.pincode ? data.pincode.trim() : locality.pincode,
      status: data.status || 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    };
    this.areas.push(newArea);
    this.save();
    return newArea;
  }

  public updateArea(id: string, updates: Partial<Omit<Area, 'id' | 'countryId' | 'createdAt'>>): Area {
    const index = this.areas.findIndex(a => a.id === id);
    if (index === -1) throw new Error(`Area with id ${id} not found`);
    this.areas[index] = {
      ...this.areas[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.areas[index];
  }

  public toggleAreaStatus(id: string): Area {
    const a = this.getAreaById(id);
    if (!a) throw new Error(`Area ${id} not found`);
    return this.updateArea(id, { status: a.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' });
  }

  public deleteState(id: string): void {
    this.states = this.states.filter(s => s.id !== id);
    this.save();
  }

  public deleteDistrict(id: string): void {
    this.districts = this.districts.filter(d => d.id !== id);
    this.save();
  }

  public deleteLocality(id: string): void {
    this.localities = this.localities.filter(l => l.id !== id);
    this.save();
  }

  public deleteArea(id: string): void {
    this.areas = this.areas.filter(a => a.id !== id);
    this.save();
  }

  // ==========================================
  // METRICS & STATS
  // ==========================================

  public getLocationStats(): LocationHierarchyStats {
    return {
      totalCountries: this.countries.length,
      totalStates: this.states.length,
      totalDistricts: this.districts.length,
      totalLocalities: this.localities.length,
      totalAreas: this.areas.length,
      activeStates: this.states.filter(s => s.status === 'ACTIVE').length,
      activeDistricts: this.districts.filter(d => d.status === 'ACTIVE').length,
      activeLocalities: this.localities.filter(l => l.status === 'ACTIVE').length,
      activeAreas: this.areas.filter(a => a.status === 'ACTIVE').length,
      totalLibraries: 22, // Dynamic mock fallback
      totalStudents: 1420,
      totalTeachers: 148,
    };
  }

  public getStateAndUtCounts(): { statesCount: number; utCount: number; totalCount: number } {
    const states = this.states.filter(s => s.type === 'STATE' && s.status === 'ACTIVE');
    const uts = this.states.filter(s => s.type === 'UT' && s.status === 'ACTIVE');
    return {
      statesCount: states.length || 28,
      utCount: uts.length || 8,
      totalCount: (states.length + uts.length) || 36,
    };
  }

  public getLocationHierarchyStats(): LocationHierarchyStats {
    return this.getLocationStats();
  }
}

export const locationService = new LocationService();
