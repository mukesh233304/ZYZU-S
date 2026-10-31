// FOCUSPOINT Global System Constants

export const DISTRICTS = [
  { id: 'dist-gzp', name: 'Ghazipur', state: 'Uttar Pradesh', code: 'GZP' },
  { id: 'dist-vns', name: 'Varanasi', state: 'Uttar Pradesh', code: 'VNS' },
  { id: 'dist-mau', name: 'Mau', state: 'Uttar Pradesh', code: 'MAU' },
  { id: 'dist-bal', name: 'Ballia', state: 'Uttar Pradesh', code: 'BAL' },
  { id: 'dist-lko', name: 'Lucknow', state: 'Uttar Pradesh', code: 'LKO' },
  { id: 'dist-pry', name: 'Prayagraj', state: 'Uttar Pradesh', code: 'PRY' },
  { id: 'dist-gkp', name: 'Gorakhpur', state: 'Uttar Pradesh', code: 'GKP' },
  { id: 'dist-jnp', name: 'Jaunpur', state: 'Uttar Pradesh', code: 'JNP' },
  { id: 'dist-azm', name: 'Azamgarh', state: 'Uttar Pradesh', code: 'AZM' },
];

export const DISTRICT_AREAS: Record<string, string[]> = {
  'dist-gzp': [
    'Saidpur',
    'Ghazipur City',
    'Sadat',
    'Mohammadabad',
    'Zamania',
    'Jangipur',
    'Nandganj',
    'Dullahpur',
    'Bahariyabad',
    'Bhurkura',
    'Karanda',
    'Mardah',
    'Shadiabad',
    'Reotipur',
    'Dildarnagar',
  ],
  'dist-vns': [
    'Lanka',
    'BHU',
    'Pandeypur',
    'Sigra',
    'Assi',
    'Godowlia',
    'Cantt',
    'Shivpur',
    'Sarnath',
    'Orderly Bazar',
    'Durgakund',
    'Mahmoorganj',
    'Bhelupur',
    'Ramnagar',
    'Rohania',
  ],
  'dist-mau': [
    'Mau City',
    'Maunath Bhanjan',
    'Ghosi',
    'Madhuban',
    'Muhammadabad Gohna',
    'Kopaganj',
    'Doharighat',
    'Ranipur',
    'Chiraiya Kot',
  ],
  'dist-bal': [
    'Ballia City',
    'Rasra',
    'Bairia',
    'Bansdih',
    'Sikanderpur',
    'Belthara Road',
    'Phephna',
    'Chitbaragaon',
    'Sahatwar',
    'Maniyar',
  ],
  'dist-lko': [
    'Hazratganj',
    'Gomti Nagar',
    'Alambagh',
    'Indira Nagar',
    'Aliganj',
    'Mahanagar',
    'Jankipuram',
    'Ashiyana',
    'Vikas Nagar',
    'Charbagh',
    'Chowk',
  ],
  'dist-pry': [
    'Civil Lines',
    'Katra',
    'Allahpur',
    'Georgetown',
    'Tagore Town',
    'Naini',
    'Jhunsi',
    'Dhoomanganj',
    'Phaphamau',
    'Kareli',
    'Kalyani Devi',
  ],
  'dist-gkp': [
    'Golghar',
    'Gorakhnath',
    'Mohaddipur',
    'Civil Lines',
    'Medical College Road',
    'Rustampur',
    'Shahpur',
    'Asuran',
    'Taramandal',
    'Pipraich',
  ],
  'dist-jnp': [
    'Jaunpur City',
    'Shahganj',
    'Machhlishahr',
    'Mariahu',
    'Kerakat',
    'Badlapur',
    'Line Bazar',
    'Olandganj',
    'Zafrabad',
  ],
  'dist-azm': [
    'Azamgarh City',
    'Phoolpur',
    'Lalganj',
    'Sagri',
    'Mehnagar',
    'Burhanpur',
    'Nizamabad',
    'Sarai Mir',
    'Bilariyaganj',
    'Mubarakpur',
  ],
};

export const GHAZIPUR_AREAS = DISTRICT_AREAS['dist-gzp'];

/**
 * Returns the list of areas / localities for a given district ID or name.
 * Defaults to Ghazipur areas if not found or empty.
 */
export function getAreasForDistrict(districtIdOrName?: string): string[] {
  if (!districtIdOrName) return DISTRICT_AREAS['dist-gzp'];
  
  // Try direct match by id (e.g. 'dist-gzp' or 'dist-vns')
  if (DISTRICT_AREAS[districtIdOrName]) {
    return DISTRICT_AREAS[districtIdOrName];
  }
  
  // Try match by district name (e.g. 'Ghazipur', 'Varanasi')
  const matchedDistrict = DISTRICTS.find(
    d => d.name.toLowerCase() === districtIdOrName.toLowerCase() ||
         d.id.toLowerCase() === districtIdOrName.toLowerCase() ||
         d.code.toLowerCase() === districtIdOrName.toLowerCase()
  );
  
  if (matchedDistrict && DISTRICT_AREAS[matchedDistrict.id]) {
    return DISTRICT_AREAS[matchedDistrict.id];
  }
  
  return DISTRICT_AREAS['dist-gzp'];
}


export const CLASSES = [
  'Nursery', 'LKG', 'UKG',
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
  'Class 11 (Science)', 'Class 11 (Commerce)', 'Class 11 (Arts)',
  'Class 12 (Science)', 'Class 12 (Commerce)', 'Class 12 (Arts)',
  'JEE / NEET Foundation', 'Competitive Exams (CUET/SSC/Police)',
];

export const SUBJECTS = [
  'All Subjects',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English Language & Literature',
  'Hindi',
  'Social Science (History, Civics, Geography)',
  'Computer Science / IT',
  'Accountancy',
  'Economics',
  'Business Studies',
  'Sanskrit',
  'Science (Combined 6-10)',
];

export const BOARDS = ['CBSE', 'UP Board (Hindi Medium)', 'UP Board (English Medium)', 'ICSE / ISC', 'Other State Board'];

export const LIBRARY_FACILITIES = [
  { id: 'all', label: 'All Facility', icon: 'Sparkles' },
  { id: 'ac', label: 'Air Conditioned (AC)', icon: 'Wind' },
  { id: 'wifi', label: 'High-Speed 5G Wi-Fi', icon: 'Wifi' },
  { id: 'power_backup', label: '100% Power Backup (Inverter/Generator)', icon: 'Zap' },
  { id: 'cctv', label: '24x7 CCTV Surveillance', icon: 'Shield' },
  { id: 'ro_water', label: 'RO Cold & Normal Drinking Water', icon: 'Droplets' },
  { id: 'charging', label: 'Individual Charging Points at Every Desk', icon: 'BatteryCharging' },
  { id: 'chairs', label: 'Ergonomic Cushion Study Chairs', icon: 'Armchair' },
  { id: 'parking', label: 'Reserved Bike & Cycle Parking', icon: 'Car' },
  { id: 'quiet_zone', label: 'Soundproof Pin-Drop Silence Zone', icon: 'VolumeX' },
  { id: 'locker', label: 'Personal Storage Lockers', icon: 'Lock' },
];

export const TEACHING_MODES = [
  { value: 'OFFLINE_HOME', label: '1-on-1 Offline Home Tuition (At Student Home)' },
  { value: 'ONLINE', label: 'Live Interactive Online Classes' },
  { value: 'BOTH', label: 'Both Home Tuition & Online' },
];

export const SHIFT_TEMPLATES = [
  { name: 'Morning Shift', startTime: '07:00 AM', endTime: '12:00 PM', defaultPrice: 499 },
  { name: 'Afternoon Shift', startTime: '12:00 PM', endTime: '05:00 PM', defaultPrice: 499 },
  { name: 'Evening Shift', startTime: '05:00 PM', endTime: '10:00 PM', defaultPrice: 499 },
  { name: 'Full Day Pass', startTime: '07:00 AM', endTime: '10:00 PM', defaultPrice: 999 },
];

export const SHIFTS = SHIFT_TEMPLATES;

export const FACILITIES: string[] = [
  'Air Conditioned (AC)',
  'High-Speed 5G Wi-Fi',
  '100% Power Backup (Inverter/Generator)',
  '24x7 CCTV Surveillance',
  'RO Cold & Normal Drinking Water',
  'Individual Charging Points at Every Desk',
  'Ergonomic Cushion Study Chairs',
  'Reserved Bike & Cycle Parking',
  'Soundproof Pin-Drop Silence Zone',
  'Personal Storage Lockers',
  'Newspaper & Monthly Magazine Stand',
  'Separate Discussion / Lunch Room'
];
