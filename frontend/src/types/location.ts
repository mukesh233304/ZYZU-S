// PAN-INDIA LOCATION SYSTEM — HIERARCHICAL TYPE DEFINITIONS
// Hierarchy: COUNTRY -> STATE -> DISTRICT -> LOCALITY / CITY / TOWN -> AREA / VILLAGE / NEIGHBORHOOD

export type LocationStatus = 'ACTIVE' | 'INACTIVE';

export type StateType = 'STATE' | 'UT';

export type LocalityType = 'CITY' | 'TOWN' | 'LOCALITY' | 'TEHSIL';

export type AreaType = 'AREA' | 'VILLAGE' | 'NEIGHBORHOOD' | 'SECTOR';

export interface Country {
  id: string;
  name: string;
  code: string;
  status: LocationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface State {
  id: string;
  countryId: string;
  name: string;
  code: string;
  type: StateType;
  status: LocationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DistrictLocation {
  id: string;
  countryId: string;
  stateId: string;
  name: string;
  code: string;
  status: LocationStatus;
  activeAdminId?: string;
  activeAdminName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Locality {
  id: string;
  countryId: string;
  stateId: string;
  districtId: string;
  name: string;
  type: LocalityType;
  pincode?: string;
  status: LocationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Area {
  id: string;
  countryId: string;
  stateId: string;
  districtId: string;
  localityId: string;
  name: string;
  type: AreaType;
  pincode?: string;
  status: LocationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface LocationHierarchySelection {
  countryId?: string;
  stateId?: string;
  districtId?: string;
  localityId?: string;
  areaId?: string;
  stateName?: string;
  districtName?: string;
  localityName?: string;
  areaName?: string;
  pincode?: string;
}

export interface LocationFilterParams {
  countryId?: string;
  stateId?: string;
  districtId?: string;
  localityId?: string;
  areaId?: string;
  searchQuery?: string;
}

export interface LocationHierarchyStats {
  totalCountries?: number;
  totalStates: number;
  totalDistricts: number;
  totalLocalities: number;
  totalAreas: number;
  activeStates: number;
  activeDistricts: number;
  activeLocalities: number;
  activeAreas: number;
  totalLibraries: number;
  totalStudents: number;
  totalTeachers: number;
}

export interface PincodePostOffice {
  name: string;
  branchType?: string;
  deliveryStatus?: string;
  circle?: string;
  district: string;
  division?: string;
  region?: string;
  block?: string;
  state: string;
  pincode: string;
}

export interface PincodeLookupResult {
  success: boolean;
  pincode: string;
  state?: State;
  stateId?: string;
  stateName?: string;
  district?: DistrictLocation;
  districtId?: string;
  districtName?: string;
  localities: Locality[];
  suggestedLocality?: Locality;
  suggestedArea?: Area;
  postOffices?: PincodePostOffice[];
  message?: string;
  source: 'local_master' | 'india_post_api' | 'prefix_fallback' | 'none';
}

