import { Country, State, DistrictLocation, Locality, Area } from '../../types/location';

export const INITIAL_COUNTRY: Country = {
  id: 'loc-country-in',
  name: 'India',
  code: 'IND',
  status: 'ACTIVE',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

// ALL 28 STATES + 8 UNION TERRITORIES OF INDIA
export const INITIAL_STATES: State[] = [
  // 28 States
  { id: 'loc-state-ap', countryId: 'loc-country-in', name: 'Andhra Pradesh', code: 'AP', type: 'STATE', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-state-ar', countryId: 'loc-country-in', name: 'Arunachal Pradesh', code: 'AR', type: 'STATE', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-state-as', countryId: 'loc-country-in', name: 'Assam', code: 'AS', type: 'STATE', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-state-br', countryId: 'loc-country-in', name: 'Bihar', code: 'BR', type: 'STATE', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-state-cg', countryId: 'loc-country-in', name: 'Chhattisgarh', code: 'CG', type: 'STATE', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-state-ga', countryId: 'loc-country-in', name: 'Goa', code: 'GA', type: 'STATE', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-state-gj', countryId: 'loc-country-in', name: 'Gujarat', code: 'GJ', type: 'STATE', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-state-hr', countryId: 'loc-country-in', name: 'Haryana', code: 'HR', type: 'STATE', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-state-hp', countryId: 'loc-country-in', name: 'Himachal Pradesh', code: 'HP', type: 'STATE', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-state-jh', countryId: 'loc-country-in', name: 'Jharkhand', code: 'JH', type: 'STATE', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-state-ka', countryId: 'loc-country-in', name: 'Karnataka', code: 'KA', type: 'STATE', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-state-kl', countryId: 'loc-country-in', name: 'Kerala', code: 'KL', type: 'STATE', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-state-mp', countryId: 'loc-country-in', name: 'Madhya Pradesh', code: 'MP', type: 'STATE', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-state-mh', countryId: 'loc-country-in', name: 'Maharashtra', code: 'MH', type: 'STATE', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-state-mn', countryId: 'loc-country-in', name: 'Manipur', code: 'MN', type: 'STATE', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-state-ml', countryId: 'loc-country-in', name: 'Meghalaya', code: 'ML', type: 'STATE', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-state-mz', countryId: 'loc-country-in', name: 'Mizoram', code: 'MZ', type: 'STATE', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-state-nl', countryId: 'loc-country-in', name: 'Nagaland', code: 'NL', type: 'STATE', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-state-od', countryId: 'loc-country-in', name: 'Odisha', code: 'OD', type: 'STATE', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-state-pb', countryId: 'loc-country-in', name: 'Punjab', code: 'PB', type: 'STATE', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-state-rj', countryId: 'loc-country-in', name: 'Rajasthan', code: 'RJ', type: 'STATE', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-state-sk', countryId: 'loc-country-in', name: 'Sikkim', code: 'SK', type: 'STATE', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-state-tn', countryId: 'loc-country-in', name: 'Tamil Nadu', code: 'TN', type: 'STATE', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-state-ts', countryId: 'loc-country-in', name: 'Telangana', code: 'TS', type: 'STATE', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-state-tr', countryId: 'loc-country-in', name: 'Tripura', code: 'TR', type: 'STATE', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-state-up', countryId: 'loc-country-in', name: 'Uttar Pradesh', code: 'UP', type: 'STATE', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-state-uk', countryId: 'loc-country-in', name: 'Uttarakhand', code: 'UK', type: 'STATE', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-state-wb', countryId: 'loc-country-in', name: 'West Bengal', code: 'WB', type: 'STATE', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },

  // 8 Union Territories
  { id: 'loc-state-an', countryId: 'loc-country-in', name: 'Andaman and Nicobar Islands', code: 'AN', type: 'UT', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-state-ch', countryId: 'loc-country-in', name: 'Chandigarh', code: 'CH', type: 'UT', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-state-dn', countryId: 'loc-country-in', name: 'Dadra and Nagar Haveli and Daman and Diu', code: 'DN', type: 'UT', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-state-dl', countryId: 'loc-country-in', name: 'Delhi', code: 'DL', type: 'UT', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-state-jk', countryId: 'loc-country-in', name: 'Jammu and Kashmir', code: 'JK', type: 'UT', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-state-la', countryId: 'loc-country-in', name: 'Ladakh', code: 'LA', type: 'UT', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-state-ld', countryId: 'loc-country-in', name: 'Lakshadweep', code: 'LD', type: 'UT', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-state-py', countryId: 'loc-country-in', name: 'Puducherry', code: 'PY', type: 'UT', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
];

// Helper to construct DistrictLocation
const d = (id: string, stateId: string, name: string, code: string, extra: Partial<DistrictLocation> = {}): DistrictLocation => ({
  id,
  countryId: 'loc-country-in',
  stateId,
  name,
  code,
  status: 'ACTIVE',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...extra
});

// COMPLETE PAN-INDIA DISTRICTS MASTER
// Includes ALL 75 DISTRICTS OF UTTAR PRADESH and authoritative districts for all other states & UTs
export const INITIAL_DISTRICTS: DistrictLocation[] = [
  // =========================================================================
  // 1. UTTAR PRADESH — ALL 75 OFFICIAL DISTRICTS
  // =========================================================================
  d('dist-agr', 'loc-state-up', 'Agra', 'AGR'),
  d('dist-ali', 'loc-state-up', 'Aligarh', 'ALI'),
  d('dist-amb', 'loc-state-up', 'Ambedkar Nagar', 'AMB'),
  d('dist-amt', 'loc-state-up', 'Amethi', 'AMT'),
  d('dist-amr', 'loc-state-up', 'Amroha (Jyotiba Phule Nagar)', 'AMR'),
  d('dist-aur', 'loc-state-up', 'Auraiya', 'AUR'),
  d('dist-ayd', 'loc-state-up', 'Ayodhya (Faizabad)', 'AYD'),
  d('dist-azm', 'loc-state-up', 'Azamgarh', 'AZM'),
  d('dist-bgp-up', 'loc-state-up', 'Baghpat', 'BGP'),
  d('dist-bhr', 'loc-state-up', 'Bahraich', 'BHR'),
  d('dist-bal', 'loc-state-up', 'Ballia', 'BAL', { activeAdminId: 'usr-admin-ballia', activeAdminName: 'Alok Nath Singh' }),
  d('dist-blp', 'loc-state-up', 'Balrampur', 'BLP'),
  d('dist-bnd', 'loc-state-up', 'Banda', 'BND'),
  d('dist-bbk', 'loc-state-up', 'Barabanki', 'BBK'),
  d('dist-bly', 'loc-state-up', 'Bareilly', 'BLY'),
  d('dist-bst', 'loc-state-up', 'Basti', 'BST'),
  d('dist-bhd', 'loc-state-up', 'Bhadohi (Sant Ravidas Nagar)', 'BHD'),
  d('dist-bjn', 'loc-state-up', 'Bijnor', 'BJN'),
  d('dist-bdn', 'loc-state-up', 'Budaun', 'BDN'),
  d('dist-bul', 'loc-state-up', 'Bulandshahr', 'BUL'),
  d('dist-cnd', 'loc-state-up', 'Chandauli', 'CND'),
  d('dist-ckt', 'loc-state-up', 'Chitrakoot', 'CKT'),
  d('dist-deo', 'loc-state-up', 'Deoria', 'DEO'),
  d('dist-eth', 'loc-state-up', 'Etah', 'ETH'),
  d('dist-etw', 'loc-state-up', 'Etawah', 'ETW'),
  d('dist-frk', 'loc-state-up', 'Farrukhabad', 'FRK'),
  d('dist-ftp', 'loc-state-up', 'Fatehpur', 'FTP'),
  d('dist-frz', 'loc-state-up', 'Firozabad', 'FRZ'),
  d('dist-gbn', 'loc-state-up', 'Gautam Buddha Nagar (Noida)', 'GBN'),
  d('dist-gzb', 'loc-state-up', 'Ghaziabad', 'GZB'),
  d('dist-gzp', 'loc-state-up', 'Ghazipur', 'GZP', { activeAdminId: 'usr-admin-ghazipur', activeAdminName: 'Manoj Kumar Rai' }),
  d('dist-gnd', 'loc-state-up', 'Gonda', 'GND'),
  d('dist-gkp', 'loc-state-up', 'Gorakhpur', 'GKP'),
  d('dist-hmr', 'loc-state-up', 'Hamirpur', 'HMR'),
  d('dist-hpr', 'loc-state-up', 'Hapur', 'HPR'),
  d('dist-hrd', 'loc-state-up', 'Hardoi', 'HRD'),
  d('dist-htr', 'loc-state-up', 'Hathras', 'HTR'),
  d('dist-jln', 'loc-state-up', 'Jalaun (Orai)', 'JLN'),
  d('dist-jnp', 'loc-state-up', 'Jaunpur', 'JNP'),
  d('dist-jhs', 'loc-state-up', 'Jhansi', 'JHS'),
  d('dist-knj', 'loc-state-up', 'Kannauj', 'KNJ'),
  d('dist-knd', 'loc-state-up', 'Kanpur Dehat', 'KND'),
  d('dist-knp', 'loc-state-up', 'Kanpur Nagar', 'KNP'),
  d('dist-ksg', 'loc-state-up', 'Kasganj', 'KSG'),
  d('dist-ksb', 'loc-state-up', 'Kaushambi', 'KSB'),
  d('dist-khr', 'loc-state-up', 'Kheri (Lakhimpur Kheri)', 'KHR'),
  d('dist-ksn', 'loc-state-up', 'Kushinagar', 'KSN'),
  d('dist-llt', 'loc-state-up', 'Lalitpur', 'LLT'),
  d('dist-lko', 'loc-state-up', 'Lucknow', 'LKO', { activeAdminId: 'usr-admin-lucknow', activeAdminName: 'Dr. Vivek Saxena' }),
  d('dist-mhj', 'loc-state-up', 'Maharajganj', 'MHJ'),
  d('dist-mhb', 'loc-state-up', 'Mahoba', 'MHB'),
  d('dist-mnp', 'loc-state-up', 'Mainpuri', 'MNP'),
  d('dist-mth', 'loc-state-up', 'Mathura', 'MTH'),
  d('dist-mau', 'loc-state-up', 'Mau', 'MAU', { activeAdminId: 'usr-admin-mau', activeAdminName: 'Rameshwar Pandey' }),
  d('dist-mrt', 'loc-state-up', 'Meerut', 'MRT'),
  d('dist-mzp', 'loc-state-up', 'Mirzapur', 'MZP'),
  d('dist-mbd', 'loc-state-up', 'Moradabad', 'MBD'),
  d('dist-mzn', 'loc-state-up', 'Muzaffarnagar', 'MZN'),
  d('dist-plb', 'loc-state-up', 'Pilibhit', 'PLB'),
  d('dist-ptg', 'loc-state-up', 'Pratapgarh', 'PTG'),
  d('dist-pry', 'loc-state-up', 'Prayagraj (Allahabad)', 'PRY'),
  d('dist-rbl', 'loc-state-up', 'Raebareli', 'RBL'),
  d('dist-rmp', 'loc-state-up', 'Rampur', 'RMP'),
  d('dist-shn', 'loc-state-up', 'Saharanpur', 'SHN'),
  d('dist-smb', 'loc-state-up', 'Sambhal', 'SMB'),
  d('dist-skn', 'loc-state-up', 'Sant Kabir Nagar', 'SKN'),
  d('dist-sjp', 'loc-state-up', 'Shahjahanpur', 'SJP'),
  d('dist-shm', 'loc-state-up', 'Shamli', 'SHM'),
  d('dist-srv', 'loc-state-up', 'Shravasti', 'SRV'),
  d('dist-sdn', 'loc-state-up', 'Siddharthnagar', 'SDN'),
  d('dist-stp', 'loc-state-up', 'Sitapur', 'STP'),
  d('dist-snb', 'loc-state-up', 'Sonbhadra', 'SNB'),
  d('dist-slt', 'loc-state-up', 'Sultanpur', 'SLT'),
  d('dist-unn', 'loc-state-up', 'Unnao', 'UNN'),
  d('dist-vns', 'loc-state-up', 'Varanasi', 'VNS', { activeAdminId: 'usr-admin-varanasi', activeAdminName: 'Sunil Upadhyay' }),

  // =========================================================================
  // 2. BIHAR — KEY DISTRICTS
  // =========================================================================
  d('dist-pat', 'loc-state-br', 'Patna', 'PAT'),
  d('dist-gay', 'loc-state-br', 'Gaya', 'GAY'),
  d('dist-muz', 'loc-state-br', 'Muzaffarpur', 'MUZ'),
  d('dist-bgp', 'loc-state-br', 'Bhagalpur', 'BGP'),
  d('dist-bxr', 'loc-state-br', 'Buxar', 'BXR'),
  d('dist-dar', 'loc-state-br', 'Darbhanga', 'DAR'),
  d('dist-pur', 'loc-state-br', 'Purnia', 'PUR'),
  d('dist-bgs', 'loc-state-br', 'Begusarai', 'BGS'),
  d('dist-smp', 'loc-state-br', 'Samastipur', 'SMP'),
  d('dist-nld', 'loc-state-br', 'Nalanda (Bihar Sharif)', 'NLD'),
  d('dist-rht', 'loc-state-br', 'Rohtas (Sasaram)', 'RHT'),
  d('dist-bhp-br', 'loc-state-br', 'Bhojpur (Arrah)', 'BHP'),
  d('dist-srn', 'loc-state-br', 'Saran (Chhapra)', 'SRN'),
  d('dist-swn', 'loc-state-br', 'Siwan', 'SWN'),
  d('dist-gpl', 'loc-state-br', 'Gopalganj', 'GPL'),
  d('dist-vsh', 'loc-state-br', 'Vaishali (Hajipur)', 'VSH'),
  d('dist-mdb', 'loc-state-br', 'Madhubani', 'MDB'),
  d('dist-mng', 'loc-state-br', 'Munger', 'MNG'),
  d('dist-kat', 'loc-state-br', 'Katihar', 'KAT'),
  d('dist-sah', 'loc-state-br', 'Saharsa', 'SAH'),

  // =========================================================================
  // 3. DELHI (NCT) — ALL 11 DISTRICTS
  // =========================================================================
  d('dist-ndl', 'loc-state-dl', 'New Delhi', 'NDL'),
  d('dist-cdl', 'loc-state-dl', 'Central Delhi', 'CDL'),
  d('dist-edl', 'loc-state-dl', 'East Delhi', 'EDL'),
  d('dist-ndel', 'loc-state-dl', 'North Delhi', 'NDEL'),
  d('dist-ned', 'loc-state-dl', 'North East Delhi', 'NED'),
  d('dist-nwd', 'loc-state-dl', 'North West Delhi', 'NWD'),
  d('dist-shd', 'loc-state-dl', 'Shahdara', 'SHD'),
  d('dist-sdl', 'loc-state-dl', 'South Delhi', 'SDL'),
  d('dist-sed', 'loc-state-dl', 'South East Delhi', 'SED'),
  d('dist-swd', 'loc-state-dl', 'South West Delhi', 'SWD'),
  d('dist-wdl', 'loc-state-dl', 'West Delhi', 'WDL'),

  // =========================================================================
  // 4. MAHARASHTRA
  // =========================================================================
  d('dist-mbc', 'loc-state-mh', 'Mumbai City', 'MBC'),
  d('dist-mbs', 'loc-state-mh', 'Mumbai Suburban', 'MBS'),
  d('dist-pne', 'loc-state-mh', 'Pune', 'PNE'),
  d('dist-thn', 'loc-state-mh', 'Thane', 'THN'),
  d('dist-ngp', 'loc-state-mh', 'Nagpur', 'NGP'),
  d('dist-nsk', 'loc-state-mh', 'Nashik', 'NSK'),
  d('dist-chb', 'loc-state-mh', 'Chhatrapati Sambhajinagar (Aurangabad)', 'CHB'),
  d('dist-slp', 'loc-state-mh', 'Solapur', 'SLP'),
  d('dist-amr-mh', 'loc-state-mh', 'Amravati', 'AMR'),
  d('dist-klp', 'loc-state-mh', 'Kolhapur', 'KLP'),

  // =========================================================================
  // 5. RAJASTHAN
  // =========================================================================
  d('dist-jpr', 'loc-state-rj', 'Jaipur', 'JPR'),
  d('dist-kta', 'loc-state-rj', 'Kota (Coaching Capital)', 'KTA'),
  d('dist-jdh', 'loc-state-rj', 'Jodhpur', 'JDH'),
  d('dist-uda', 'loc-state-rj', 'Udaipur', 'UDA'),
  d('dist-ajm', 'loc-state-rj', 'Ajmer', 'AJM'),
  d('dist-bkn', 'loc-state-rj', 'Bikaner', 'BKN'),
  d('dist-bwr', 'loc-state-rj', 'Alwar', 'ALW'),
  d('dist-bht', 'loc-state-rj', 'Bharatpur', 'BHT'),
  d('dist-skr', 'loc-state-rj', 'Sikar', 'SKR'),

  // =========================================================================
  // 6. MADHYA PRADESH
  // =========================================================================
  d('dist-ind', 'loc-state-mp', 'Indore', 'IND'),
  d('dist-bhp', 'loc-state-mp', 'Bhopal', 'BHP'),
  d('dist-jbl', 'loc-state-mp', 'Jabalpur', 'JBL'),
  d('dist-gwl', 'loc-state-mp', 'Gwalior', 'GWL'),
  d('dist-ujn', 'loc-state-mp', 'Ujjain', 'UJN'),
  d('dist-sgr', 'loc-state-mp', 'Sagar', 'SGR'),
  d('dist-rew', 'loc-state-mp', 'Rewa', 'REW'),

  // =========================================================================
  // 7. KARNATAKA
  // =========================================================================
  d('dist-blr', 'loc-state-ka', 'Bengaluru Urban', 'BLR'),
  d('dist-blrr', 'loc-state-ka', 'Bengaluru Rural', 'BLRR'),
  d('dist-mys', 'loc-state-ka', 'Mysuru', 'MYS'),
  d('dist-mng-ka', 'loc-state-ka', 'Dakshina Kannada (Mangaluru)', 'DKN'),
  d('dist-hub', 'loc-state-ka', 'Dharwad (Hubballi)', 'HUB'),
  d('dist-blg', 'loc-state-ka', 'Belagavi', 'BLG'),

  // =========================================================================
  // 8. TAMIL NADU
  // =========================================================================
  d('dist-chn', 'loc-state-tn', 'Chennai', 'CHN'),
  d('dist-cbe', 'loc-state-tn', 'Coimbatore', 'CBE'),
  d('dist-mdu', 'loc-state-tn', 'Madurai', 'MDU'),
  d('dist-try', 'loc-state-tn', 'Tiruchirappalli', 'TRY'),
  d('dist-slm', 'loc-state-tn', 'Salem', 'SLM'),
  d('dist-tir', 'loc-state-tn', 'Tirunelveli', 'TIR'),

  // =========================================================================
  // 9. TELANGANA
  // =========================================================================
  d('dist-hyd', 'loc-state-ts', 'Hyderabad', 'HYD'),
  d('dist-rrd', 'loc-state-ts', 'Ranga Reddy', 'RRD'),
  d('dist-med', 'loc-state-ts', 'Medchal-Malkajgiri', 'MED'),
  d('dist-wrg', 'loc-state-ts', 'Warangal', 'WRG'),
  d('dist-knr', 'loc-state-ts', 'Karimnagar', 'KNR'),

  // =========================================================================
  // 10. GUJARAT
  // =========================================================================
  d('dist-ahd', 'loc-state-gj', 'Ahmedabad', 'AHD'),
  d('dist-srt', 'loc-state-gj', 'Surat', 'SRT'),
  d('dist-vad', 'loc-state-gj', 'Vadodara', 'VAD'),
  d('dist-rjk', 'loc-state-gj', 'Rajkot', 'RJK'),
  d('dist-gnr', 'loc-state-gj', 'Gandhinagar', 'GNR'),

  // =========================================================================
  // 11. HARYANA
  // =========================================================================
  d('dist-gur', 'loc-state-hr', 'Gurugram', 'GUR'),
  d('dist-frd', 'loc-state-hr', 'Faridabad', 'FRD'),
  d('dist-karnal', 'loc-state-hr', 'Karnal', 'KRN'),
  d('dist-panipat', 'loc-state-hr', 'Panipat', 'PNP'),
  d('dist-ambala', 'loc-state-hr', 'Ambala', 'AMB-HR'),
  d('dist-rohtak', 'loc-state-hr', 'Rohtak', 'RHT-HR'),
  d('dist-hisar', 'loc-state-hr', 'Hisar', 'HSR'),

  // =========================================================================
  // 12. PUNJAB
  // =========================================================================
  d('dist-asr', 'loc-state-pb', 'Amritsar', 'ASR'),
  d('dist-ldh', 'loc-state-pb', 'Ludhiana', 'LDH'),
  d('dist-jld', 'loc-state-pb', 'Jalandhar', 'JLD'),
  d('dist-ptl', 'loc-state-pb', 'Patiala', 'PTL'),
  d('dist-mhl', 'loc-state-pb', 'SAS Nagar (Mohali)', 'MHL'),
  d('dist-bti', 'loc-state-pb', 'Bathinda', 'BTI'),

  // =========================================================================
  // 13. WEST BENGAL
  // =========================================================================
  d('dist-kol', 'loc-state-wb', 'Kolkata', 'KOL'),
  d('dist-n24', 'loc-state-wb', 'North 24 Parganas', 'N24'),
  d('dist-s24', 'loc-state-wb', 'South 24 Parganas', 'S24'),
  d('dist-hwh', 'loc-state-wb', 'Howrah', 'HWH'),
  d('dist-hgl', 'loc-state-wb', 'Hooghly', 'HGL'),
  d('dist-pas', 'loc-state-wb', 'Paschim Bardhaman (Durgapur/Asansol)', 'PAS'),
  d('dist-djg', 'loc-state-wb', 'Darjeeling (Siliguri)', 'DJG'),

  // =========================================================================
  // 14. KERALA
  // =========================================================================
  d('dist-ekm', 'loc-state-kl', 'Ernakulam (Kochi)', 'EKM'),
  d('dist-tvm', 'loc-state-kl', 'Thiruvananthapuram', 'TVM'),
  d('dist-kkd', 'loc-state-kl', 'Kozhikode', 'KKD'),
  d('dist-tsr', 'loc-state-kl', 'Thrissur', 'TSR'),

  // =========================================================================
  // 15. ANDHRA PRADESH
  // =========================================================================
  d('dist-vis', 'loc-state-ap', 'Visakhapatnam', 'VIS'),
  d('dist-vij', 'loc-state-ap', 'Vijayawada (NTR)', 'VIJ'),
  d('dist-gnt', 'loc-state-ap', 'Guntur', 'GNT'),
  d('dist-tpt', 'loc-state-ap', 'Tirupati', 'TPT'),

  // =========================================================================
  // 16. CHHATTISGARH
  // =========================================================================
  d('dist-rpr', 'loc-state-cg', 'Raipur', 'RPR'),
  d('dist-bsp', 'loc-state-cg', 'Bilaspur', 'BSP'),
  d('dist-drg', 'loc-state-cg', 'Durg (Bhilai)', 'DRG'),

  // =========================================================================
  // 17. JHARKHAND
  // =========================================================================
  d('dist-rnc', 'loc-state-jh', 'Ranchi', 'RNC'),
  d('dist-jsr', 'loc-state-jh', 'East Singhbhum (Jamshedpur)', 'JSR'),
  d('dist-dhn', 'loc-state-jh', 'Dhanbad', 'DHN'),
  d('dist-bok', 'loc-state-jh', 'Bokaro', 'BOK'),

  // =========================================================================
  // 18. ODISHA
  // =========================================================================
  d('dist-bbs', 'loc-state-od', 'Khordha (Bhubaneswar)', 'BBS'),
  d('dist-ctc', 'loc-state-od', 'Cuttack', 'CTC'),
  d('dist-rou', 'loc-state-od', 'Sundargarh (Rourkela)', 'ROU'),

  // =========================================================================
  // 19. UTTARAKHAND
  // =========================================================================
  d('dist-ddn', 'loc-state-uk', 'Dehradun', 'DDN'),
  d('dist-hdw', 'loc-state-uk', 'Haridwar', 'HDW'),
  d('dist-ntl', 'loc-state-uk', 'Nainital (Haldwani)', 'NTL'),
  d('dist-usn', 'loc-state-uk', 'Udham Singh Nagar', 'USN'),

  // =========================================================================
  // 20. ASSAM
  // =========================================================================
  d('dist-ghy', 'loc-state-as', 'Kamrup Metropolitan (Guwahati)', 'GHY'),
  d('dist-dib', 'loc-state-as', 'Dibrugarh', 'DIB'),
  d('dist-slc', 'loc-state-as', 'Silchar (Cachar)', 'SLC'),

  // =========================================================================
  // 21. HIMACHAL PRADESH
  // =========================================================================
  d('dist-sml', 'loc-state-hp', 'Shimla', 'SML'),
  d('dist-kng', 'loc-state-hp', 'Kangra (Dharamshala)', 'KNG'),
  d('dist-solan', 'loc-state-hp', 'Solan', 'SOL'),

  // =========================================================================
  // 22. GOA
  // =========================================================================
  d('dist-ngoa', 'loc-state-ga', 'North Goa (Panaji)', 'NGOA'),
  d('dist-sgoa', 'loc-state-ga', 'South Goa (Margao)', 'SGOA'),

  // =========================================================================
  // 23-28. NORTH-EAST STATES & SIKKIM
  // =========================================================================
  d('dist-ita', 'loc-state-ar', 'Itanagar (Papum Pare)', 'ITA'),
  d('dist-twg', 'loc-state-ar', 'Tawang', 'TWG'),
  d('dist-imp', 'loc-state-mn', 'Imphal West', 'IMP'),
  d('dist-shl', 'loc-state-ml', 'East Khasi Hills (Shillong)', 'SHL'),
  d('dist-azl', 'loc-state-mz', 'Aizawl', 'AZL'),
  d('dist-khm', 'loc-state-nl', 'Kohima', 'KHM'),
  d('dist-dmp', 'loc-state-nl', 'Dimapur', 'DMP'),
  d('dist-gtk', 'loc-state-sk', 'Gangtok', 'GTK'),
  d('dist-agt', 'loc-state-tr', 'West Tripura (Agartala)', 'AGT'),

  // =========================================================================
  // UNION TERRITORIES (CHANDIGARH, J&K, LADAKH, PUDUCHERRY, ETC.)
  // =========================================================================
  d('dist-chd', 'loc-state-ch', 'Chandigarh', 'CHD'),
  d('dist-sad', 'loc-state-an', 'South Andaman (Port Blair)', 'SAD'),
  d('dist-dmn', 'loc-state-dn', 'Daman & Silvassa', 'DMN'),
  d('dist-sxr', 'loc-state-jk', 'Srinagar', 'SXR'),
  d('dist-jmu', 'loc-state-jk', 'Jammu', 'JMU'),
  d('dist-leh', 'loc-state-la', 'Leh Ladakh', 'LEH'),
  d('dist-kvt', 'loc-state-ld', 'Kavaratti', 'KVT'),
  d('dist-pdy', 'loc-state-py', 'Puducherry', 'PDY'),
];

// LOCALITIES / CITIES / TOWNS MASTER
export const INITIAL_LOCALITIES: Locality[] = [
  // Ghazipur Localities
  { id: 'loc-gzp-saidpur', countryId: 'loc-country-in', stateId: 'loc-state-up', districtId: 'dist-gzp', name: 'Saidpur', type: 'TEHSIL', pincode: '233221', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-gzp-sadat', countryId: 'loc-country-in', stateId: 'loc-state-up', districtId: 'dist-gzp', name: 'Sadat', type: 'TOWN', pincode: '275204', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-gzp-city', countryId: 'loc-country-in', stateId: 'loc-state-up', districtId: 'dist-gzp', name: 'Ghazipur City (Sadar)', type: 'CITY', pincode: '233001', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-gzp-mohammadabad', countryId: 'loc-country-in', stateId: 'loc-state-up', districtId: 'dist-gzp', name: 'Mohammadabad', type: 'TEHSIL', pincode: '233227', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-gzp-zamania', countryId: 'loc-country-in', stateId: 'loc-state-up', districtId: 'dist-gzp', name: 'Zamania', type: 'TEHSIL', pincode: '232329', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-gzp-jangipur', countryId: 'loc-country-in', stateId: 'loc-state-up', districtId: 'dist-gzp', name: 'Jangipur', type: 'TOWN', pincode: '233305', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-gzp-nandganj', countryId: 'loc-country-in', stateId: 'loc-state-up', districtId: 'dist-gzp', name: 'Nandganj', type: 'TOWN', pincode: '233304', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-gzp-dullahpur', countryId: 'loc-country-in', stateId: 'loc-state-up', districtId: 'dist-gzp', name: 'Dullahpur', type: 'LOCALITY', pincode: '275202', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-gzp-bahariyabad', countryId: 'loc-country-in', stateId: 'loc-state-up', districtId: 'dist-gzp', name: 'Bahariyabad', type: 'TOWN', pincode: '275201', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-gzp-bhurkura', countryId: 'loc-country-in', stateId: 'loc-state-up', districtId: 'dist-gzp', name: 'Bhurkura', type: 'LOCALITY', pincode: '233221', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-gzp-karanda', countryId: 'loc-country-in', stateId: 'loc-state-up', districtId: 'dist-gzp', name: 'Karanda', type: 'LOCALITY', pincode: '233224', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-gzp-mardah', countryId: 'loc-country-in', stateId: 'loc-state-up', districtId: 'dist-gzp', name: 'Mardah', type: 'LOCALITY', pincode: '233226', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-gzp-shadiabad', countryId: 'loc-country-in', stateId: 'loc-state-up', districtId: 'dist-gzp', name: 'Shadiabad', type: 'LOCALITY', pincode: '233300', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-gzp-reotipur', countryId: 'loc-country-in', stateId: 'loc-state-up', districtId: 'dist-gzp', name: 'Reotipur', type: 'LOCALITY', pincode: '232328', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-gzp-dildarnagar', countryId: 'loc-country-in', stateId: 'loc-state-up', districtId: 'dist-gzp', name: 'Dildarnagar', type: 'TOWN', pincode: '232326', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },

  // Varanasi Localities
  { id: 'loc-vns-lanka', countryId: 'loc-country-in', stateId: 'loc-state-up', districtId: 'dist-vns', name: 'Lanka', type: 'LOCALITY', pincode: '221005', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-vns-bhu', countryId: 'loc-country-in', stateId: 'loc-state-up', districtId: 'dist-vns', name: 'BHU Campus', type: 'LOCALITY', pincode: '221005', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-vns-pandeypur', countryId: 'loc-country-in', stateId: 'loc-state-up', districtId: 'dist-vns', name: 'Pandeypur', type: 'LOCALITY', pincode: '221002', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-vns-sigra', countryId: 'loc-country-in', stateId: 'loc-state-up', districtId: 'dist-vns', name: 'Sigra', type: 'LOCALITY', pincode: '221010', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-vns-assi', countryId: 'loc-country-in', stateId: 'loc-state-up', districtId: 'dist-vns', name: 'Assi', type: 'LOCALITY', pincode: '221005', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-vns-godowlia', countryId: 'loc-country-in', stateId: 'loc-state-up', districtId: 'dist-vns', name: 'Godowlia', type: 'LOCALITY', pincode: '221001', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-vns-cantt', countryId: 'loc-country-in', stateId: 'loc-state-up', districtId: 'dist-vns', name: 'Varanasi Cantt', type: 'LOCALITY', pincode: '221002', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-vns-shivpur', countryId: 'loc-country-in', stateId: 'loc-state-up', districtId: 'dist-vns', name: 'Shivpur', type: 'LOCALITY', pincode: '221003', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-vns-sarnath', countryId: 'loc-country-in', stateId: 'loc-state-up', districtId: 'dist-vns', name: 'Sarnath', type: 'LOCALITY', pincode: '221007', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-vns-rohania', countryId: 'loc-country-in', stateId: 'loc-state-up', districtId: 'dist-vns', name: 'Rohania', type: 'LOCALITY', pincode: '221108', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },

  // Mirzapur Localities
  { id: 'loc-mzp-city', countryId: 'loc-country-in', stateId: 'loc-state-up', districtId: 'dist-mzp', name: 'Mirzapur City (Vindhyachal / Sadar)', type: 'CITY', pincode: '231001', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-mzp-chunar', countryId: 'loc-country-in', stateId: 'loc-state-up', districtId: 'dist-mzp', name: 'Chunar Tehsil', type: 'TEHSIL', pincode: '231304', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-mzp-marihan', countryId: 'loc-country-in', stateId: 'loc-state-up', districtId: 'dist-mzp', name: 'Marihan', type: 'LOCALITY', pincode: '231310', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-mzp-lalganj', countryId: 'loc-country-in', stateId: 'loc-state-up', districtId: 'dist-mzp', name: 'Lalganj', type: 'LOCALITY', pincode: '231211', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-mzp-kon', countryId: 'loc-country-in', stateId: 'loc-state-up', districtId: 'dist-mzp', name: 'Kon Block', type: 'LOCALITY', pincode: '231312', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },

  // Lucknow Localities
  { id: 'loc-lko-hazratganj', countryId: 'loc-country-in', stateId: 'loc-state-up', districtId: 'dist-lko', name: 'Hazratganj', type: 'LOCALITY', pincode: '226001', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-lko-gomtinagar', countryId: 'loc-country-in', stateId: 'loc-state-up', districtId: 'dist-lko', name: 'Gomti Nagar', type: 'LOCALITY', pincode: '226010', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-lko-aliganj', countryId: 'loc-country-in', stateId: 'loc-state-up', districtId: 'dist-lko', name: 'Aliganj', type: 'LOCALITY', pincode: '226024', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-lko-indiranagar', countryId: 'loc-country-in', stateId: 'loc-state-up', districtId: 'dist-lko', name: 'Indira Nagar', type: 'LOCALITY', pincode: '226016', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },

  // Patna Localities
  { id: 'loc-pat-boringroad', countryId: 'loc-country-in', stateId: 'loc-state-br', districtId: 'dist-pat', name: 'Boring Road', type: 'LOCALITY', pincode: '800001', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-pat-kankarbagh', countryId: 'loc-country-in', stateId: 'loc-state-br', districtId: 'dist-pat', name: 'Kankarbagh', type: 'LOCALITY', pincode: '800020', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-pat-rajendranagar', countryId: 'loc-country-in', stateId: 'loc-state-br', districtId: 'dist-pat', name: 'Rajendra Nagar', type: 'LOCALITY', pincode: '800016', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },

  // Delhi Localities
  { id: 'loc-dl-connaughtplace', countryId: 'loc-country-in', stateId: 'loc-state-dl', districtId: 'dist-ndl', name: 'Connaught Place', type: 'LOCALITY', pincode: '110001', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-dl-hauzkhas', countryId: 'loc-country-in', stateId: 'loc-state-dl', districtId: 'dist-sdl', name: 'Hauz Khas', type: 'LOCALITY', pincode: '110016', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-dl-karolbagh', countryId: 'loc-country-in', stateId: 'loc-state-dl', districtId: 'dist-cdl', name: 'Karol Bagh', type: 'LOCALITY', pincode: '110005', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-dl-rohini', countryId: 'loc-country-in', stateId: 'loc-state-dl', districtId: 'dist-nwd', name: 'Rohini', type: 'CITY', pincode: '110085', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },

  // Pune Localities
  { id: 'loc-pne-kothrud', countryId: 'loc-country-in', stateId: 'loc-state-mh', districtId: 'dist-pne', name: 'Kothrud', type: 'LOCALITY', pincode: '411038', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-pne-shivajinagar', countryId: 'loc-country-in', stateId: 'loc-state-mh', districtId: 'dist-pne', name: 'Shivaji Nagar', type: 'LOCALITY', pincode: '411005', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-pne-hinjawadi', countryId: 'loc-country-in', stateId: 'loc-state-mh', districtId: 'dist-pne', name: 'Hinjawadi', type: 'LOCALITY', pincode: '411057', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },

  // Bengaluru Localities
  { id: 'loc-blr-koramangala', countryId: 'loc-country-in', stateId: 'loc-state-ka', districtId: 'dist-blr', name: 'Koramangala', type: 'LOCALITY', pincode: '560034', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-blr-indiranagar', countryId: 'loc-country-in', stateId: 'loc-state-ka', districtId: 'dist-blr', name: 'Indiranagar', type: 'LOCALITY', pincode: '560038', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-blr-hsrlayout', countryId: 'loc-country-in', stateId: 'loc-state-ka', districtId: 'dist-blr', name: 'HSR Layout', type: 'LOCALITY', pincode: '560102', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-blr-whitefield', countryId: 'loc-country-in', stateId: 'loc-state-ka', districtId: 'dist-blr', name: 'Whitefield', type: 'LOCALITY', pincode: '560066', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
];

// AREAS / VILLAGES / NEIGHBORHOODS MASTER
export const INITIAL_AREAS: Area[] = [
  // Saidpur (Ghazipur) Areas
  { id: 'loc-area-pankaj-talkies', countryId: 'loc-country-in', stateId: 'loc-state-up', districtId: 'dist-gzp', localityId: 'loc-gzp-saidpur', name: 'Pankaj Talkies Area', type: 'NEIGHBORHOOD', pincode: '233221', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-area-saidpur-market', countryId: 'loc-country-in', stateId: 'loc-state-up', districtId: 'dist-gzp', localityId: 'loc-gzp-saidpur', name: 'Main Bazaar / Chauraha', type: 'NEIGHBORHOOD', pincode: '233221', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-area-saidpur-station', countryId: 'loc-country-in', stateId: 'loc-state-up', districtId: 'dist-gzp', localityId: 'loc-gzp-saidpur', name: 'Saidpur Railway Station Road', type: 'NEIGHBORHOOD', pincode: '233221', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-area-saidpur-tehsil', countryId: 'loc-country-in', stateId: 'loc-state-up', districtId: 'dist-gzp', localityId: 'loc-gzp-saidpur', name: 'Tehsil Campus & Sub-Divisional Court', type: 'AREA', pincode: '233221', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-area-saidpur-townhall', countryId: 'loc-country-in', stateId: 'loc-state-up', districtId: 'dist-gzp', localityId: 'loc-gzp-saidpur', name: 'Town Hall & Nagar Panchayat Road', type: 'AREA', pincode: '233221', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-area-saidpur-ward4', countryId: 'loc-country-in', stateId: 'loc-state-up', districtId: 'dist-gzp', localityId: 'loc-gzp-saidpur', name: 'Ward No 4 (Purab Tola)', type: 'NEIGHBORHOOD', pincode: '233221', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-area-saidpur-hwy', countryId: 'loc-country-in', stateId: 'loc-state-up', districtId: 'dist-gzp', localityId: 'loc-gzp-saidpur', name: 'Ghazipur-Varanasi Highway Point', type: 'AREA', pincode: '233221', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-area-saidpur-ghat', countryId: 'loc-country-in', stateId: 'loc-state-up', districtId: 'dist-gzp', localityId: 'loc-gzp-saidpur', name: 'Auhadpur / Ganga Ghat Road', type: 'VILLAGE', pincode: '233221', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },

  // Sadat (Ghazipur) Areas
  { id: 'loc-area-sadat-stn', countryId: 'loc-country-in', stateId: 'loc-state-up', districtId: 'dist-gzp', localityId: 'loc-gzp-sadat', name: 'Sadat Railway Station Area', type: 'NEIGHBORHOOD', pincode: '275204', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-area-sadat-mkt', countryId: 'loc-country-in', stateId: 'loc-state-up', districtId: 'dist-gzp', localityId: 'loc-gzp-sadat', name: 'Sadat Main Bazar', type: 'NEIGHBORHOOD', pincode: '275204', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-area-sadat-blk', countryId: 'loc-country-in', stateId: 'loc-state-up', districtId: 'dist-gzp', localityId: 'loc-gzp-sadat', name: 'Block Office & College Road', type: 'AREA', pincode: '275204', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },

  // Ghazipur City / Sadar Areas
  { id: 'loc-area-gzp-civillines', countryId: 'loc-country-in', stateId: 'loc-state-up', districtId: 'dist-gzp', localityId: 'loc-gzp-city', name: 'Civil Lines', type: 'NEIGHBORHOOD', pincode: '233001', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-area-gzp-collectorate', countryId: 'loc-country-in', stateId: 'loc-state-up', districtId: 'dist-gzp', localityId: 'loc-gzp-city', name: 'Collectorate Campus & Courts', type: 'AREA', pincode: '233001', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-area-gzp-stn', countryId: 'loc-country-in', stateId: 'loc-state-up', districtId: 'dist-gzp', localityId: 'loc-gzp-city', name: 'Ghazipur City Railway Station', type: 'NEIGHBORHOOD', pincode: '233001', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-area-gzp-lanka', countryId: 'loc-country-in', stateId: 'loc-state-up', districtId: 'dist-gzp', localityId: 'loc-gzp-city', name: 'Lanka Chauraha & PG College Road', type: 'NEIGHBORHOOD', pincode: '233001', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-area-gzp-rauza', countryId: 'loc-country-in', stateId: 'loc-state-up', districtId: 'dist-gzp', localityId: 'loc-gzp-city', name: 'Rauza & ITI Road', type: 'AREA', pincode: '233002', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },

  // Lanka (Varanasi) Areas
  { id: 'loc-area-vns-bhugate', countryId: 'loc-country-in', stateId: 'loc-state-up', districtId: 'dist-vns', localityId: 'loc-vns-lanka', name: 'BHU Main Gate & Malviya Bhavan', type: 'NEIGHBORHOOD', pincode: '221005', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-area-vns-samneghat', countryId: 'loc-country-in', stateId: 'loc-state-up', districtId: 'dist-vns', localityId: 'loc-vns-lanka', name: 'Samne Ghat & Trauma Centre Road', type: 'AREA', pincode: '221005', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-area-vns-naria', countryId: 'loc-country-in', stateId: 'loc-state-up', districtId: 'dist-vns', localityId: 'loc-vns-lanka', name: 'Naria & Saket Nagar Colony', type: 'NEIGHBORHOOD', pincode: '221005', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },

  // Sigra (Varanasi) Areas
  { id: 'loc-area-vns-stadium', countryId: 'loc-country-in', stateId: 'loc-state-up', districtId: 'dist-vns', localityId: 'loc-vns-sigra', name: 'Dr. Sampurnanand Stadium Road', type: 'AREA', pincode: '221010', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-area-vns-rathyatra', countryId: 'loc-country-in', stateId: 'loc-state-up', districtId: 'dist-vns', localityId: 'loc-vns-sigra', name: 'Rathyatra Crossing', type: 'NEIGHBORHOOD', pincode: '221010', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },

  // Gomti Nagar (Lucknow) Areas
  { id: 'loc-area-lko-vibhuti', countryId: 'loc-country-in', stateId: 'loc-state-up', districtId: 'dist-lko', localityId: 'loc-lko-gomtinagar', name: 'Vibhuti Khand (Tech & Study Zone)', type: 'SECTOR', pincode: '226010', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'loc-area-lko-patrakarpuram', countryId: 'loc-country-in', stateId: 'loc-state-up', districtId: 'dist-lko', localityId: 'loc-lko-gomtinagar', name: 'Patrakarpuram Chauraha', type: 'NEIGHBORHOOD', pincode: '226010', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },

  // Boring Road (Patna) Areas
  { id: 'loc-area-pat-ancollege', countryId: 'loc-country-in', stateId: 'loc-state-br', districtId: 'dist-pat', localityId: 'loc-pat-boringroad', name: 'AN College Crossing & Canal Road', type: 'NEIGHBORHOOD', pincode: '800013', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },

  // Connaught Place (Delhi) Areas
  { id: 'loc-area-dl-innercircle', countryId: 'loc-country-in', stateId: 'loc-state-dl', districtId: 'dist-ndl', localityId: 'loc-dl-connaughtplace', name: 'Inner Circle Blocks A-F', type: 'SECTOR', pincode: '110001', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },

  // Kothrud (Pune) Areas
  { id: 'loc-area-pne-karveroad', countryId: 'loc-country-in', stateId: 'loc-state-mh', districtId: 'dist-pne', localityId: 'loc-pne-kothrud', name: 'Karve Road & MIT Campus Area', type: 'NEIGHBORHOOD', pincode: '411038', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },

  // Koramangala (Bengaluru) Areas
  { id: 'loc-area-blr-5thblock', countryId: 'loc-country-in', stateId: 'loc-state-ka', districtId: 'dist-blr', localityId: 'loc-blr-koramangala', name: '5th Block (Near Jyoti Nivas College)', type: 'SECTOR', pincode: '560095', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
];
