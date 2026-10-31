/**
 * FOCUSPOINT — Database Seeder for Pan-India Location Master & Advertisement Engine
 *
 * Seeds:
 * 1. Country: India (loc-country-in)
 * 2. All 28 States and 8 Union Territories of India (36 administrative divisions)
 * 3. Authoritative districts (including ALL 75 districts of Uttar Pradesh and key national districts)
 * 4. Sample Localities & Micro-Areas for cascading testing
 * 5. Production Advertisement Campaigns covering all service pages
 */

const INITIAL_COUNTRY = {
  id: 'loc-country-in',
  name: 'India',
  code: 'IND',
  currency: 'INR',
  phone_code: '+91',
  status: 'ACTIVE'
};

const INITIAL_STATES = [
  // 28 States
  { id: 'loc-state-ap', countryId: 'loc-country-in', name: 'Andhra Pradesh', code: 'AP', type: 'STATE', status: 'ACTIVE' },
  { id: 'loc-state-ar', countryId: 'loc-country-in', name: 'Arunachal Pradesh', code: 'AR', type: 'STATE', status: 'ACTIVE' },
  { id: 'loc-state-as', countryId: 'loc-country-in', name: 'Assam', code: 'AS', type: 'STATE', status: 'ACTIVE' },
  { id: 'loc-state-br', countryId: 'loc-country-in', name: 'Bihar', code: 'BR', type: 'STATE', status: 'ACTIVE' },
  { id: 'loc-state-cg', countryId: 'loc-country-in', name: 'Chhattisgarh', code: 'CG', type: 'STATE', status: 'ACTIVE' },
  { id: 'loc-state-ga', countryId: 'loc-country-in', name: 'Goa', code: 'GA', type: 'STATE', status: 'ACTIVE' },
  { id: 'loc-state-gj', countryId: 'loc-country-in', name: 'Gujarat', code: 'GJ', type: 'STATE', status: 'ACTIVE' },
  { id: 'loc-state-hr', countryId: 'loc-country-in', name: 'Haryana', code: 'HR', type: 'STATE', status: 'ACTIVE' },
  { id: 'loc-state-hp', countryId: 'loc-country-in', name: 'Himachal Pradesh', code: 'HP', type: 'STATE', status: 'ACTIVE' },
  { id: 'loc-state-jh', countryId: 'loc-country-in', name: 'Jharkhand', code: 'JH', type: 'STATE', status: 'ACTIVE' },
  { id: 'loc-state-ka', countryId: 'loc-country-in', name: 'Karnataka', code: 'KA', type: 'STATE', status: 'ACTIVE' },
  { id: 'loc-state-kl', countryId: 'loc-country-in', name: 'Kerala', code: 'KL', type: 'STATE', status: 'ACTIVE' },
  { id: 'loc-state-mp', countryId: 'loc-country-in', name: 'Madhya Pradesh', code: 'MP', type: 'STATE', status: 'ACTIVE' },
  { id: 'loc-state-mh', countryId: 'loc-country-in', name: 'Maharashtra', code: 'MH', type: 'STATE', status: 'ACTIVE' },
  { id: 'loc-state-mn', countryId: 'loc-country-in', name: 'Manipur', code: 'MN', type: 'STATE', status: 'ACTIVE' },
  { id: 'loc-state-ml', countryId: 'loc-country-in', name: 'Meghalaya', code: 'ML', type: 'STATE', status: 'ACTIVE' },
  { id: 'loc-state-mz', countryId: 'loc-country-in', name: 'Mizoram', code: 'MZ', type: 'STATE', status: 'ACTIVE' },
  { id: 'loc-state-nl', countryId: 'loc-country-in', name: 'Nagaland', code: 'NL', type: 'STATE', status: 'ACTIVE' },
  { id: 'loc-state-od', countryId: 'loc-country-in', name: 'Odisha', code: 'OD', type: 'STATE', status: 'ACTIVE' },
  { id: 'loc-state-pb', countryId: 'loc-country-in', name: 'Punjab', code: 'PB', type: 'STATE', status: 'ACTIVE' },
  { id: 'loc-state-rj', countryId: 'loc-country-in', name: 'Rajasthan', code: 'RJ', type: 'STATE', status: 'ACTIVE' },
  { id: 'loc-state-sk', countryId: 'loc-country-in', name: 'Sikkim', code: 'SK', type: 'STATE', status: 'ACTIVE' },
  { id: 'loc-state-tn', countryId: 'loc-country-in', name: 'Tamil Nadu', code: 'TN', type: 'STATE', status: 'ACTIVE' },
  { id: 'loc-state-ts', countryId: 'loc-country-in', name: 'Telangana', code: 'TS', type: 'STATE', status: 'ACTIVE' },
  { id: 'loc-state-tr', countryId: 'loc-country-in', name: 'Tripura', code: 'TR', type: 'STATE', status: 'ACTIVE' },
  { id: 'loc-state-up', countryId: 'loc-country-in', name: 'Uttar Pradesh', code: 'UP', type: 'STATE', status: 'ACTIVE' },
  { id: 'loc-state-uk', countryId: 'loc-country-in', name: 'Uttarakhand', code: 'UK', type: 'STATE', status: 'ACTIVE' },
  { id: 'loc-state-wb', countryId: 'loc-country-in', name: 'West Bengal', code: 'WB', type: 'STATE', status: 'ACTIVE' },

  // 8 Union Territories
  { id: 'loc-state-an', countryId: 'loc-country-in', name: 'Andaman and Nicobar Islands', code: 'AN', type: 'UT', status: 'ACTIVE' },
  { id: 'loc-state-ch', countryId: 'loc-country-in', name: 'Chandigarh', code: 'CH', type: 'UT', status: 'ACTIVE' },
  { id: 'loc-state-dn', countryId: 'loc-country-in', name: 'Dadra and Nagar Haveli and Daman and Diu', code: 'DN', type: 'UT', status: 'ACTIVE' },
  { id: 'loc-state-dl', countryId: 'loc-country-in', name: 'Delhi', code: 'DL', type: 'UT', status: 'ACTIVE' },
  { id: 'loc-state-jk', countryId: 'loc-country-in', name: 'Jammu and Kashmir', code: 'JK', type: 'UT', status: 'ACTIVE' },
  { id: 'loc-state-la', countryId: 'loc-country-in', name: 'Ladakh', code: 'LA', type: 'UT', status: 'ACTIVE' },
  { id: 'loc-state-ld', countryId: 'loc-country-in', name: 'Lakshadweep', code: 'LD', type: 'UT', status: 'ACTIVE' },
  { id: 'loc-state-py', countryId: 'loc-country-in', name: 'Puducherry', code: 'PY', type: 'UT', status: 'ACTIVE' }
];

// 75 Official Districts of Uttar Pradesh + Key National Districts
const INITIAL_DISTRICTS = [
  // Uttar Pradesh 75 Districts
  { name: 'Agra', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'AGR' },
  { name: 'Aligarh', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'ALI' },
  { name: 'Ambedkar Nagar', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'AMB' },
  { name: 'Amethi', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'AMT' },
  { name: 'Amroha (Jyotiba Phule Nagar)', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'AMR' },
  { name: 'Auraiya', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'AUR' },
  { name: 'Ayodhya (Faizabad)', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'AYD' },
  { name: 'Azamgarh', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'AZM' },
  { name: 'Baghpat', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'BGP' },
  { name: 'Bahraich', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'BHR' },
  { name: 'Ballia', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'BAL' },
  { name: 'Balrampur', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'BLP' },
  { name: 'Banda', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'BND' },
  { name: 'Barabanki', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'BBK' },
  { name: 'Bareilly', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'BLY' },
  { name: 'Basti', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'BST' },
  { name: 'Bhadohi (Sant Ravidas Nagar)', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'BHD' },
  { name: 'Bijnor', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'BJN' },
  { name: 'Budaun', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'BDN' },
  { name: 'Bulandshahr', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'BUL' },
  { name: 'Chandauli', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'CND' },
  { name: 'Chitrakoot', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'CKT' },
  { name: 'Deoria', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'DEO' },
  { name: 'Etah', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'ETH' },
  { name: 'Etawah', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'ETW' },
  { name: 'Farrukhabad', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'FRK' },
  { name: 'Fatehpur', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'FTP' },
  { name: 'Firozabad', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'FIZ' },
  { name: 'Gautam Buddha Nagar (Noida)', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'GBN' },
  { name: 'Ghaziabad', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'GZB' },
  { name: 'Ghazipur', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'GZP' },
  { name: 'Saidpur', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'SDP' },
  { name: 'Gonda', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'GND' },
  { name: 'Gorakhpur', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'GKP' },
  { name: 'Hamirpur', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'HMR' },
  { name: 'Hapur (Panchsheel Nagar)', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'HPR' },
  { name: 'Hardoi', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'HRD' },
  { name: 'Hathras (Mahamaya Nagar)', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'HTR' },
  { name: 'Jalaun (Orai)', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'JLN' },
  { name: 'Jaunpur', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'JNP' },
  { name: 'Jhansi', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'JHS' },
  { name: 'Kannauj', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'KNJ' },
  { name: 'Kanpur Dehat', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'KPD' },
  { name: 'Kanpur Nagar', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'KPN' },
  { name: 'Kasganj (Kanshiram Nagar)', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'KSG' },
  { name: 'Kaushambi', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'KSH' },
  { name: 'Kheri (Lakhimpur Kheri)', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'KHR' },
  { name: 'Kushinagar', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'KSHN' },
  { name: 'Lalitpur', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'LAL' },
  { name: 'Lucknow', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'LKO' },
  { name: 'Maharajganj', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'MHJ' },
  { name: 'Mahoba', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'MHB' },
  { name: 'Mainpuri', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'MNP' },
  { name: 'Mathura', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'MTH' },
  { name: 'Mau', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'MAU' },
  { name: 'Meerut', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'MRT' },
  { name: 'Mirzapur', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'MZP' },
  { name: 'Moradabad', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'MBD' },
  { name: 'Muzaffarnagar', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'MZF' },
  { name: 'Pilibhit', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'PLB' },
  { name: 'Pratapgarh', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'PRT' },
  { name: 'Prayagraj (Allahabad)', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'PRY' },
  { name: 'Raebareli', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'RBL' },
  { name: 'Rampur', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'RMP' },
  { name: 'Saharanpur', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'SHR' },
  { name: 'Sambhal (Bhim Nagar)', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'SMB' },
  { name: 'Sant Kabir Nagar', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'SKN' },
  { name: 'Shahjahanpur', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'SJP' },
  { name: 'Shamli (Prabuddh Nagar)', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'SML' },
  { name: 'Shravasti', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'SHV' },
  { name: 'Siddharthnagar', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'SDN' },
  { name: 'Sitapur', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'STP' },
  { name: 'Sonbhadra', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'SBD' },
  { name: 'Sultanpur', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'SLT' },
  { name: 'Unnao', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'UNO' },
  { name: 'Varanasi', state: 'Uttar Pradesh', stateId: 'loc-state-up', code: 'VNS' },

  // Bihar Key Districts
  { name: 'Patna', state: 'Bihar', stateId: 'loc-state-br', code: 'PAT' },
  { name: 'Gaya', state: 'Bihar', stateId: 'loc-state-br', code: 'GAY' },
  { name: 'Muzaffarpur', state: 'Bihar', stateId: 'loc-state-br', code: 'MUZ' },
  { name: 'Bhagalpur', state: 'Bihar', stateId: 'loc-state-br', code: 'BGP-BR' },
  { name: 'Darbhanga', state: 'Bihar', stateId: 'loc-state-br', code: 'DBG' },

  // Delhi Districts
  { name: 'New Delhi', state: 'Delhi', stateId: 'loc-state-dl', code: 'NDL' },
  { name: 'Central Delhi', state: 'Delhi', stateId: 'loc-state-dl', code: 'CDL' },
  { name: 'South Delhi', state: 'Delhi', stateId: 'loc-state-dl', code: 'SDL' },
  { name: 'North Delhi', state: 'Delhi', stateId: 'loc-state-dl', code: 'NDEL' },
  { name: 'West Delhi', state: 'Delhi', stateId: 'loc-state-dl', code: 'WDL' },

  // Maharashtra Key Districts
  { name: 'Mumbai City', state: 'Maharashtra', stateId: 'loc-state-mh', code: 'MUM' },
  { name: 'Pune', state: 'Maharashtra', stateId: 'loc-state-mh', code: 'PUN' },
  { name: 'Nagpur', state: 'Maharashtra', stateId: 'loc-state-mh', code: 'NAG' },

  // Rajasthan Key Districts
  { name: 'Jaipur', state: 'Rajasthan', stateId: 'loc-state-rj', code: 'JAI' },
  { name: 'Kota', state: 'Rajasthan', stateId: 'loc-state-rj', code: 'KOT' },

  // Karnataka Key Districts
  { name: 'Bengaluru Urban', state: 'Karnataka', stateId: 'loc-state-ka', code: 'BLR' },
  { name: 'Mysuru', state: 'Karnataka', stateId: 'loc-state-ka', code: 'MYS' },

  // Tamil Nadu Key Districts
  { name: 'Chennai', state: 'Tamil Nadu', stateId: 'loc-state-tn', code: 'CHE' },
  { name: 'Coimbatore', state: 'Tamil Nadu', stateId: 'loc-state-tn', code: 'CBE' },

  // West Bengal Key Districts
  { name: 'Kolkata', state: 'West Bengal', stateId: 'loc-state-wb', code: 'KOL' },
  { name: 'Howrah', state: 'West Bengal', stateId: 'loc-state-wb', code: 'HWH' },

  // Chandigarh
  { name: 'Chandigarh District', state: 'Chandigarh', stateId: 'loc-state-ch', code: 'CHD-D' }
];

// Sample Localities
const INITIAL_LOCALITIES = [
  // Saidpur (Town, Ghazipur)
  { id: 'loc-up-ghz-saidpur', districtName: 'Ghazipur', name: 'Saidpur', type: 'TOWN', pincode: '233304', status: 'ACTIVE' },
  { id: 'loc-up-ghz-city', districtName: 'Ghazipur', name: 'Ghazipur City', type: 'CITY', pincode: '233001', status: 'ACTIVE' },
  { id: 'loc-up-ghz-sadat', districtName: 'Ghazipur', name: 'Sadat', type: 'TOWN', pincode: '233307', status: 'ACTIVE' },
  { id: 'loc-up-ghz-zamania', districtName: 'Ghazipur', name: 'Zamania', type: 'TOWN', pincode: '232329', status: 'ACTIVE' },
  { id: 'loc-up-ghz-mohammadabad', districtName: 'Ghazipur', name: 'Mohammadabad', type: 'TOWN', pincode: '233227', status: 'ACTIVE' },

  // Varanasi Localities
  { id: 'loc-up-vns-lanka', districtName: 'Varanasi', name: 'Lanka', type: 'URBAN_ZONE', pincode: '221005', status: 'ACTIVE' },
  { id: 'loc-up-vns-sigra', districtName: 'Varanasi', name: 'Sigra', type: 'URBAN_ZONE', pincode: '221010', status: 'ACTIVE' },
  { id: 'loc-up-vns-shivpur', districtName: 'Varanasi', name: 'Shivpur', type: 'URBAN_ZONE', pincode: '221003', status: 'ACTIVE' },

  // New Delhi Localities
  { id: 'loc-dl-cp', districtName: 'New Delhi', name: 'Connaught Place', type: 'URBAN_ZONE', pincode: '110001', status: 'ACTIVE' },
  { id: 'loc-dl-karolbagh', districtName: 'Central Delhi', name: 'Karol Bagh', type: 'URBAN_ZONE', pincode: '110005', status: 'ACTIVE' }
];

// Sample Areas
const INITIAL_AREAS = [
  { id: 'area-saidpur-pankaj', localityId: 'loc-up-ghz-saidpur', name: 'Pankaj Talkies Area', landmark: 'Near Pankaj Cinema', pincode: '233304' },
  { id: 'area-saidpur-station', localityId: 'loc-up-ghz-saidpur', name: 'Station Road', landmark: 'Railway Station Gate 1', pincode: '233304' },
  { id: 'area-saidpur-market', localityId: 'loc-up-ghz-saidpur', name: 'Town Market', landmark: 'Main Chowk', pincode: '233304' },
  { id: 'area-ghz-lanka', localityId: 'loc-up-ghz-city', name: 'Lanka Ghazipur', landmark: 'Near Bus Depot', pincode: '233001' },
  { id: 'area-vns-bhu', localityId: 'loc-up-vns-lanka', name: 'BHU Main Gate Area', landmark: 'Opposite Lanka Police Station', pincode: '221005' },
  { id: 'area-vns-sigra-stadium', localityId: 'loc-up-vns-sigra', name: 'Dr. Sampurnanand Stadium Area', landmark: 'Sigra Stadium', pincode: '221010' }
];

// Default Campaigns
const DEFAULT_CAMPAIGNS = [
  {
    id: 'ad-tutor-fp-01',
    advertiser_name: 'FocusPoint Academic Network',
    campaign_name: 'District KYC Tutor Drive 2026',
    placement: 'FIND_TUTOR_HERO',
    target_pages: JSON.stringify(['FIND_TUTOR', 'ALL']),
    media_type: 'IMAGE_TEXT',
    headline: 'District Admin KYC Verified Home Tutors at Your Doorstep',
    subheading: '100% Aadhaar & University Degree Authenticated Educators',
    description: 'Personalized 1-on-1 home tuition for Class 1 to 12, CBSE, ICSE, and UP Board. Zero cold calling, zero middleman brokerage, and guaranteed free 1-time demo session.',
    image_url: '/assets/images/white_home_tuition_bg.jpg',
    destination_url: '/find-tutor',
    cta_text: 'Find Your Tutor',
    supporting_text: '⚡ Instant District Admin Matching in < 15 mins',
    badge_text: 'Verified Home Mentorship',
    promotional_offer: '100% Zero Brokerage',
    layout: 'split',
    status: 'LIVE',
    start_date: '2026-01-01',
    end_date: '2026-12-31',
    priority: 95,
    target_audience: 'Parents & Students Seeking 1-on-1 Tuition',
    impressions: 5420,
    clicks: 734,
    video_plays: 0
  },
  {
    id: 'ad-tutor-partner-02',
    advertiser_name: 'Kota EduPrep Partner Institute',
    campaign_name: 'NEET & IIT-JEE Foundation Spotlight',
    placement: 'FIND_TUTOR_HERO',
    target_pages: JSON.stringify(['FIND_TUTOR', 'MOCK_TESTS']),
    media_type: 'RICH_AD',
    headline: 'IIT-JEE & NEET Ranker Faculty for Home Mentorship',
    subheading: 'Master Complex Physics, Chemistry & Biology Concepts',
    description: 'Learn from ex-Kota faculty with personalized doubt clearance, weekly chapter tests, and curated DPP sheets delivered right to your home desk.',
    image_url: '/assets/images/study_library_bg.jpg',
    destination_url: '/find-tutor?subject=Physics&class=Class+11',
    cta_text: 'Book Trial Class',
    supporting_text: '🎯 Includes Free Kota Problem Sheets',
    badge_text: 'Top National Partner',
    promotional_offer: 'Free Diagnostic Kit',
    layout: 'card',
    status: 'LIVE',
    start_date: '2026-01-01',
    end_date: '2026-12-31',
    priority: 85,
    target_audience: 'Class 9-12 Science & Competitive Aspirants',
    impressions: 4120,
    clicks: 588,
    video_plays: 0
  },
  {
    id: 'ad-lib-fp-01',
    advertiser_name: 'Silent Study Hubs India',
    campaign_name: 'AC Cabin Self-Study Reservation Campaign',
    placement: 'FIND_LIBRARY_HERO',
    target_pages: JSON.stringify(['FIND_LIBRARY', 'ALL']),
    media_type: 'IMAGE_TEXT',
    headline: 'Reserved Air-Conditioned Desks with 5G Wi-Fi & Power Backup',
    subheading: 'Engineered for UPSC, UPPSC, SSC & High-Concentration Study',
    description: 'Select your preferred desk directly on a live visual seat map. Ergonomic cushion chairs, individual charging points, purified RO water, and pin-drop silence guarantee.',
    image_url: '/assets/images/study_library_bg.jpg',
    destination_url: '/find-library',
    cta_text: 'Reserve My Desk',
    supporting_text: '⚡ Morning (6AM-2PM) & Evening (2PM-10PM) Passes',
    badge_text: 'Digital AC Library Pass',
    promotional_offer: 'Save ₹200 on Monthly Pass',
    layout: 'split',
    status: 'LIVE',
    start_date: '2026-01-01',
    end_date: '2026-12-31',
    priority: 90,
    target_audience: 'Competitive Exam & College Students',
    impressions: 4890,
    clicks: 672,
    video_plays: 0
  },
  {
    id: 'ad-mock-fp-01',
    advertiser_name: 'FocusPoint Test Intelligence Studio',
    campaign_name: 'BHU CHS & Navodaya Entrance Mock Drive',
    placement: 'MOCK_TEST_HERO',
    target_pages: JSON.stringify(['MOCK_TESTS', 'ALL']),
    media_type: 'RICH_AD',
    headline: 'Real CBT Simulation with Personal Mistake Book Tracking',
    subheading: 'BHU CHS, JNVST Navodaya, NEET UG & UP Police 2026',
    description: 'Attempt full-length computerized tests modeled strictly on official examination patterns. Automatically bookmark your conceptual errors for targeted re-testing.',
    image_url: '/assets/images/white_home_tuition_bg.jpg',
    destination_url: '/mock-tests',
    cta_text: 'Attempt Free Mock Test',
    supporting_text: '📊 Instant All-India Rank & Sectional Percentiles',
    badge_text: 'Official CBT Pattern',
    promotional_offer: 'Free Diagnostic Mock',
    layout: 'full-width',
    status: 'LIVE',
    start_date: '2026-01-01',
    end_date: '2026-12-31',
    priority: 95,
    target_audience: 'All Competitive Exam Aspirants',
    impressions: 6310,
    clicks: 940,
    video_plays: 0
  },
  {
    id: 'ad-notes-partner-01',
    advertiser_name: 'National Exam Publishers & Topper Vault',
    campaign_name: 'Mind Maps & 10-Yr PYQ Series',
    placement: 'STUDY_MATERIAL_HERO',
    target_pages: JSON.stringify(['STUDY_MATERIALS', 'ALL']),
    media_type: 'IMAGE_TEXT',
    headline: 'Topper Handwritten Notes, Mind Maps & Solved Past 10-Year Papers',
    subheading: 'High-Resolution Chapter Summaries & Derivation Cheat Sheets',
    description: 'Quickly revise formulas, key chemical balances, and historical timelines. Printable PDF downloads available directly on your dashboard.',
    image_url: '/assets/images/study_library_bg.jpg',
    destination_url: '/study-materials',
    cta_text: 'Access Study Vault',
    supporting_text: '📑 Over 850+ NCERT-Mapped Chapter Documents',
    badge_text: 'Topper Handwritten Series',
    promotional_offer: 'Free Chapterwise Mind Maps',
    layout: 'split',
    status: 'LIVE',
    start_date: '2026-01-01',
    end_date: '2026-12-31',
    priority: 90,
    target_audience: 'Class 9 to 12 & Droppers',
    impressions: 5120,
    clicks: 795,
    video_plays: 0
  }
];

function seedLocationAndAds(db) {
  try {
    const seedTx = db.transaction(() => {
      // 1. Seed Country
      db.prepare(`
        INSERT INTO countries (id, name, code, currency, phone_code, status)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          name=excluded.name,
          code=excluded.code,
          status=excluded.status
      `).run(
        INITIAL_COUNTRY.id,
        INITIAL_COUNTRY.name,
        INITIAL_COUNTRY.code,
        INITIAL_COUNTRY.currency,
        INITIAL_COUNTRY.phone_code,
        INITIAL_COUNTRY.status
      );

      // 2. Seed States & Union Territories
      const insertState = db.prepare(`
        INSERT INTO states_ut (id, country_id, name, code, type, status)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          name=excluded.name,
          code=excluded.code,
          type=excluded.type,
          status=excluded.status
      `);

      for (const st of INITIAL_STATES) {
        insertState.run(st.id, st.countryId, st.name, st.code, st.type, st.status);
      }

      // 3. Seed Districts & Link to state_id
      const insertDistrict = db.prepare(`
        INSERT INTO districts (name, state, code, is_active, state_id, country_id, status)
        VALUES (?, ?, ?, 1, ?, 'loc-country-in', 'ACTIVE')
        ON CONFLICT(name) DO UPDATE SET
          state=excluded.state,
          code=excluded.code,
          state_id=excluded.state_id,
          status='ACTIVE'
      `);

      for (const d of INITIAL_DISTRICTS) {
        insertDistrict.run(d.name, d.state, d.code, d.stateId);
      }

      // 4. Seed Localities
      const getDistByName = db.prepare('SELECT id FROM districts WHERE name = ? LIMIT 1');
      const insertLocality = db.prepare(`
        INSERT INTO localities (id, district_id, name, type, pincode, status)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          district_id=excluded.district_id,
          name=excluded.name,
          type=excluded.type,
          pincode=excluded.pincode,
          status=excluded.status
      `);

      for (const loc of INITIAL_LOCALITIES) {
        const dist = getDistByName.get(loc.districtName);
        if (dist) {
          insertLocality.run(loc.id, dist.id, loc.name, loc.type, loc.pincode, loc.status);
        }
      }

      // 5. Seed Areas
      const insertArea = db.prepare(`
        INSERT INTO areas (id, locality_id, name, landmark, pincode, status)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          locality_id=excluded.locality_id,
          name=excluded.name,
          landmark=excluded.landmark,
          pincode=excluded.pincode,
          status=excluded.status
      `);

      for (const a of INITIAL_AREAS) {
        insertArea.run(a.id, a.localityId, a.name, a.landmark, a.pincode, 'ACTIVE');
      }

      // 6. Seed Default Advertisement Campaigns
      const insertAd = db.prepare(`
        INSERT INTO advertisement_campaigns (
          id, advertiser_name, campaign_name, placement, target_pages, media_type,
          headline, subheading, description, image_url, destination_url, cta_text,
          supporting_text, badge_text, promotional_offer, layout, status, start_date,
          end_date, priority, target_audience, impressions, clicks, video_plays
        ) VALUES (
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?
        )
        ON CONFLICT(id) DO NOTHING
      `);

      for (const ad of DEFAULT_CAMPAIGNS) {
        insertAd.run(
          ad.id,
          ad.advertiser_name,
          ad.campaign_name,
          ad.placement,
          ad.target_pages,
          ad.media_type,
          ad.headline,
          ad.subheading,
          ad.description,
          ad.image_url,
          ad.destination_url,
          ad.cta_text,
          ad.supporting_text,
          ad.badge_text,
          ad.promotional_offer,
          ad.layout,
          ad.status,
          ad.start_date,
          ad.end_date,
          ad.priority,
          ad.target_audience,
          ad.impressions,
          ad.clicks,
          ad.video_plays
        );
      }
    });

    seedTx();
  } catch (err) {
    console.error('Error seeding location and advertisement data:', err);
  }
}

module.exports = {
  seedLocationAndAds,
  INITIAL_COUNTRY,
  INITIAL_STATES,
  INITIAL_DISTRICTS,
  INITIAL_LOCALITIES,
  INITIAL_AREAS,
  DEFAULT_CAMPAIGNS
};
