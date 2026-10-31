import { Library, LibrarySeat, LibraryShift } from '../../types';

function generateSeats(count: number, occupiedIndices: number[] = [], maintenanceIndices: number[] = [], libId = 'lib-focus-saidpur'): LibrarySeat[] {
  const seats: LibrarySeat[] = [];
  const totalOccupied = occupiedIndices.length;
  const mornCut = Math.floor(totalOccupied * 0.4);
  const aftCut = Math.floor(totalOccupied * 0.7);
  const eveCut = Math.floor(totalOccupied * 0.85);

  const morningOnlyIndices = occupiedIndices.slice(0, mornCut);
  const afternoonOnlyIndices = occupiedIndices.slice(mornCut, aftCut);
  const eveningOnlyIndices = occupiedIndices.slice(aftCut, eveCut);
  const fullDayIndices = occupiedIndices.slice(eveCut);

  for (let i = 1; i <= count; i++) {
    const seatNum = `Seat ${i.toString().padStart(2, '0')}`;
    let status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' = 'AVAILABLE';
    let assignedStudentName: string | undefined = undefined;

    const isMaint = maintenanceIndices.includes(i);
    const isFD = fullDayIndices.includes(i);
    const isMorn = isFD || morningOnlyIndices.includes(i);
    const isAft = isFD || afternoonOnlyIndices.includes(i);
    const isEve = isFD || eveningOnlyIndices.includes(i);

    if (isMaint) {
      status = 'MAINTENANCE';
    } else if (isFD) {
      status = 'OCCUPIED';
      assignedStudentName = `Student #${1000 + i} (Full Day)`;
    } else if (isMorn && !isAft && !isEve) {
      status = 'AVAILABLE';
      assignedStudentName = `Student #${1000 + i} (Morning)`;
    } else if (isAft && !isMorn && !isEve) {
      status = 'AVAILABLE';
      assignedStudentName = `Student #${1000 + i} (Afternoon)`;
    } else if (isEve && !isMorn && !isAft) {
      status = 'AVAILABLE';
      assignedStudentName = `Student #${1000 + i} (Evening)`;
    }

    seats.push({
      id: `seat-${libId}-${i}`,
      libraryId: libId,
      seatNumber: seatNum,
      status,
      assignedStudentName,
      shiftOccupancy: {
        morning: isMaint ? { isBooked: false } : {
          isBooked: isMorn,
          studentName: isMorn ? (isFD ? `Student #${1000 + i} (Full Day)` : `Student #${1000 + i} (Morning)`) : undefined,
          studentPhone: isMorn ? '9876543210' : undefined,
        },
        afternoon: isMaint ? { isBooked: false } : {
          isBooked: isAft,
          studentName: isAft ? (isFD ? `Student #${1000 + i} (Full Day)` : `Student #${1000 + i} (Afternoon)`) : undefined,
          studentPhone: isAft ? '9876543211' : undefined,
        },
        evening: isMaint ? { isBooked: false } : {
          isBooked: isEve,
          studentName: isEve ? (isFD ? `Student #${1000 + i} (Full Day)` : `Student #${1000 + i} (Evening)`) : undefined,
          studentPhone: isEve ? '9876543212' : undefined,
        },
        isFullDay: isFD,
      },
    });
  }
  return seats;
}

const defaultShifts: LibraryShift[] = [
  { id: 'sh-1', libraryId: 'lib-focus-saidpur', name: 'Morning Shift', startTime: '06:00 AM', endTime: '11:00 AM', monthlyPrice: 499, price: 499, isActive: true },
  { id: 'sh-2', libraryId: 'lib-focus-saidpur', name: 'Afternoon Shift', startTime: '11:00 AM', endTime: '04:00 PM', monthlyPrice: 499, price: 499, isActive: true },
  { id: 'sh-3', libraryId: 'lib-focus-saidpur', name: 'Evening Shift', startTime: '04:00 PM', endTime: '09:00 PM', monthlyPrice: 499, price: 499, isActive: true },
  { id: 'sh-4', libraryId: 'lib-focus-saidpur', name: 'Full Day 15-Hr Pass', startTime: '06:00 AM', endTime: '09:00 PM', monthlyPrice: 999, price: 999, isActive: true },
];

export const MOCK_LIBRARIES: Library[] = [
  {
    id: 'lib-focus-saidpur',
    ownerId: 'usr-lib-suresh',
    ownerName: 'Suresh Chandra Yadav',
    name: 'FocusPoint Premier Study Library - Saidpur',
    description: 'Premier air-conditioned digital self-study library in Saidpur designed for civil services, JEE, NEET, and university students. Equipped with high-speed dual-band fiber Wi-Fi, comfortable ergonomic executive chairs, soundproof environment, and full generator power backup.',
    districtId: 'dist-gzp',
    districtName: 'Ghazipur',
    city: 'Saidpur',
    area: 'Saidpur Town',
    address: 'Near Old Tehsil Complex, Main Market Road, Saidpur',
    pincode: '233304',
    verificationStatus: 'APPROVED',
    totalSeats: 48,
    availableSeats: 16,
    monthlyStartingPrice: 499,
    facilities: ['Air Conditioned (AC)', 'High-Speed 5G Wi-Fi', '100% Power Backup (Inverter/Generator)', '24x7 CCTV Surveillance', 'RO Cold & Normal Drinking Water', 'Individual Charging Points at Every Desk', 'Ergonomic Cushion Study Chairs', 'Personal Storage Lockers'],
    timings: '06:30 AM – 10:30 PM (All 7 Days Open)',
    images: [
      'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&q=80&w=800',
    ],
    rating: 4.9,
    reviewsCount: 42,
    rules: [
      'Strict silence must be maintained in the study halls at all times.',
      'Mobile phones must remain on vibration or silent mode inside.',
      'Footwear rack is available at the entrance.',
      'Food and snacks are permitted only in the cafeteria / balcony lounge.'
    ],
    shifts: defaultShifts,
    seats: generateSeats(48, [1, 2, 4, 5, 8, 9, 10, 12, 14, 15, 18, 19, 21, 22, 25, 27, 28, 30, 31, 33, 35, 38, 40, 41, 42, 44, 45, 46, 47], [6, 17, 34]),
  },
  {
    id: 'lib-vidya-gzp',
    ownerId: 'usr-lib-ramesh',
    ownerName: 'Rameshwar Nath Rai',
    name: 'Vidya Jyoti Digital Library - Ghazipur City',
    description: 'Modern, peaceful study space in the heart of Ghazipur city near Gora Bazar. State-of-the-art facilities with individual cubicles, personal reading LED lights, and blazing fast internet.',
    districtId: 'dist-gzp',
    districtName: 'Ghazipur',
    city: 'Ghazipur',
    area: 'Gora Bazar',
    address: 'Opposite Government Polytechnic, Gora Bazar, Ghazipur',
    pincode: '233001',
    verificationStatus: 'APPROVED',
    totalSeats: 60,
    availableSeats: 22,
    monthlyStartingPrice: 550,
    facilities: ['Air Conditioned (AC)', 'High-Speed 5G Wi-Fi', '100% Power Backup (Inverter/Generator)', '24x7 CCTV Surveillance', 'RO Cold & Normal Drinking Water', 'Individual Charging Points at Every Desk', 'Reserved Bike & Cycle Parking'],
    timings: '07:00 AM – 10:00 PM',
    images: [
      'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=800',
    ],
    rating: 4.7,
    reviewsCount: 29,
    rules: [
      'Pin drop silence mandatory.',
      'ID cards must be carried daily.',
      'Desk sharing is strictly prohibited.'
    ],
    shifts: defaultShifts,
    seats: generateSeats(60, [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35, 37, 39, 41, 43, 45, 47, 49, 51, 53, 55], [10, 20]),
  },
  {
    id: 'lib-saraswati-zamania',
    ownerId: 'usr-lib-dinesh',
    ownerName: 'Dinesh Kumar Bind',
    name: 'Saraswati Abhyas Kendra & Library - Zamania',
    description: 'Clean and affordable self-study space designed for students preparing for UP Police, SSC GD, Railway, and State board examinations.',
    districtId: 'dist-gzp',
    districtName: 'Ghazipur',
    city: 'Ghazipur',
    area: 'Zamania',
    address: 'Near Zamania Railway Crossing, Station Road',
    pincode: '232329',
    verificationStatus: 'PENDING',
    totalSeats: 35,
    availableSeats: 28,
    monthlyStartingPrice: 399,
    facilities: ['Air Conditioned (AC)', 'High-Speed 5G Wi-Fi', '24x7 CCTV Surveillance', 'RO Cold & Normal Drinking Water', 'Individual Charging Points at Every Desk'],
    timings: '07:00 AM – 09:00 PM',
    images: [
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800',
    ],
    rating: 0,
    reviewsCount: 0,
    rules: ['Silence zone.', 'Entry through bio-metric log.'],
    shifts: defaultShifts,
    seats: generateSeats(35, [2, 4, 6, 8], [1]),
  },
  {
    id: 'lib-kashi-lanka',
    ownerId: 'usr-lib-varanasi-anand',
    ownerName: 'Anand Mohan Shukla',
    name: 'Kashi Scholars Digital Study Library - Lanka, Varanasi',
    description: 'Premier air-conditioned digital library located adjacent to BHU main gate in Lanka. Ideal for UPSC, UPPSC, NET, and medical research scholars with dual fiber optic Wi-Fi, ergonomic cushioned chairs, and 100% silent zones.',
    districtId: 'dist-vns',
    districtName: 'Varanasi',
    city: 'Varanasi',
    area: 'Lanka',
    address: 'Near Sankat Mochan Crossing, Lanka, Varanasi',
    pincode: '221005',
    verificationStatus: 'APPROVED',
    totalSeats: 64,
    availableSeats: 21,
    monthlyStartingPrice: 599,
    facilities: [
      'Air Conditioned (AC)',
      'High-Speed 5G Wi-Fi',
      '100% Power Backup (Inverter/Generator)',
      '24x7 CCTV Surveillance',
      'RO Cold & Normal Drinking Water',
      'Individual Charging Points at Every Desk',
      'Ergonomic Cushion Study Chairs',
      'Soundproof Pin-Drop Silence Zone',
      'Personal Storage Lockers'
    ],
    timings: '06:00 AM – 11:00 PM (All 7 Days Open)',
    images: [
      'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800'
    ],
    rating: 4.9,
    reviewsCount: 56,
    rules: [
      'Strict silence must be observed.',
      'Headphones mandatory for all audio lectures.',
      'Dedicated locker keys issued on monthly subscription.'
    ],
    shifts: defaultShifts,
    seats: generateSeats(64, [1, 2, 4, 7, 10, 12, 14, 18, 20, 22, 25, 29, 31, 35, 40, 42, 48, 50, 52, 55], [5, 16]),
  },
  {
    id: 'lib-bhu-vidyapeeth',
    ownerId: 'usr-lib-varanasi-manoj',
    ownerName: 'Manoj Kumar Gupta',
    name: 'Apex Aspirants Study Hub - BHU / Assi, Varanasi',
    description: 'Specialized round-the-clock preparation sanctuary for competitive exam students in Varanasi. High-speed 5G broadband, cafeteria discussion area, and biometric security.',
    districtId: 'dist-vns',
    districtName: 'Varanasi',
    city: 'Varanasi',
    area: 'BHU',
    address: 'Near Assi Ghat Crossing, BHU Road, Varanasi',
    pincode: '221005',
    verificationStatus: 'APPROVED',
    totalSeats: 50,
    availableSeats: 18,
    monthlyStartingPrice: 650,
    facilities: [
      'Air Conditioned (AC)',
      'High-Speed 5G Wi-Fi',
      '100% Power Backup (Inverter/Generator)',
      '24x7 CCTV Surveillance',
      'RO Cold & Normal Drinking Water',
      'Individual Charging Points at Every Desk',
      'Ergonomic Cushion Study Chairs',
      'Reserved Bike & Cycle Parking'
    ],
    timings: '06:30 AM – 10:30 PM',
    images: [
      'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800'
    ],
    rating: 4.8,
    reviewsCount: 39,
    rules: [
      'Discipline and quiet environment maintained by warden.',
      'Personal belongings must be stored in assigned lockers.'
    ],
    shifts: defaultShifts,
    seats: generateSeats(50, [2, 3, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35, 38, 41], [12]),
  }
];

