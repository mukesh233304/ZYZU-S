import { 
  Library, LibraryStudent, SeatStatus, LibraryBankAccount, 
  TeacherDocumentItem, AttendanceRecord, LibraryExpense, 
  LibrarySettlement, LibraryNotificationSettings 
} from '../types';
import { mockStore } from '../mock/store';

export const libraryService = {
  async getAllLibraries(districtId?: string): Promise<Library[]> {
    await new Promise(r => setTimeout(r, 200));
    return mockStore.getLibraries(districtId);
  },

  async getLibraryById(id: string): Promise<Library | undefined> {
    await new Promise(r => setTimeout(r, 150));
    return mockStore.getLibraryById(id);
  },

  async getLibrariesByOwner(ownerId: string): Promise<Library[]> {
    await new Promise(r => setTimeout(r, 150));
    return mockStore.getLibrariesByOwner(ownerId);
  },

  async getLibraryStudents(libraryId: string): Promise<LibraryStudent[]> {
    await new Promise(r => setTimeout(r, 150));
    return mockStore.getLibraryStudents(libraryId);
  },

  async updateStudentPhoto(studentIdOrRef: string, photoUrl: string): Promise<boolean> {
    await new Promise(r => setTimeout(r, 100));
    return mockStore.updateStudentPhoto(studentIdOrRef, photoUrl);
  },

  async getLibraryRevenue(libraryId: string) {
    await new Promise(r => setTimeout(r, 150));
    return mockStore.getLibraryRevenue(libraryId);
  },

  async getMonthlyRevenueHistory(libraryId: string) {
    await new Promise(r => setTimeout(r, 150));
    return mockStore.getMonthlyRevenueHistory(libraryId);
  },

  async getShiftRevenueBreakdown(libraryId: string) {
    await new Promise(r => setTimeout(r, 150));
    return mockStore.getShiftRevenueBreakdown(libraryId);
  },

  async getLibraryExpenses(libraryId: string): Promise<LibraryExpense[]> {
    await new Promise(r => setTimeout(r, 100));
    return mockStore.getLibraryExpenses(libraryId);
  },

  async addLibraryExpense(expenseData: Omit<LibraryExpense, 'id' | 'createdAt'>): Promise<LibraryExpense> {
    await new Promise(r => setTimeout(r, 150));
    return mockStore.addLibraryExpense(expenseData);
  },

  async deleteLibraryExpense(id: string): Promise<boolean> {
    await new Promise(r => setTimeout(r, 100));
    return mockStore.deleteLibraryExpense(id);
  },

  async getLibrarySettlements(libraryId: string): Promise<LibrarySettlement[]> {
    await new Promise(r => setTimeout(r, 100));
    return mockStore.getLibrarySettlements(libraryId);
  },

  async getNotificationSettings(libraryId: string): Promise<LibraryNotificationSettings> {
    await new Promise(r => setTimeout(r, 100));
    return mockStore.getLibraryNotificationSettings(libraryId);
  },

  async updateNotificationSettings(libraryId: string, settings: Partial<LibraryNotificationSettings>): Promise<LibraryNotificationSettings> {
    await new Promise(r => setTimeout(r, 100));
    return mockStore.updateLibraryNotificationSettings(libraryId, settings);
  },

  async updateBankDetails(libraryId: string, bankAccount: LibraryBankAccount): Promise<Library | null> {
    await new Promise(r => setTimeout(r, 250));
    return mockStore.updateLibraryBank(libraryId, bankAccount);
  },

  async uploadPremisesKyc(libraryId: string, category: string, docData: TeacherDocumentItem): Promise<Library | null> {
    await new Promise(r => setTimeout(r, 250));
    return mockStore.updateLibraryKyc(libraryId, category, docData);
  },

  async getAttendanceRecords(libraryId: string): Promise<AttendanceRecord[]> {
    await new Promise(r => setTimeout(r, 150));
    return mockStore.getLibraryAttendance(libraryId);
  },

  async logAttendance(record: any): Promise<AttendanceRecord> {
    await new Promise(r => setTimeout(r, 200));
    const attRec: AttendanceRecord = {
      id: `att-${Date.now()}`,
      userId: record.userId || `stu-${Date.now()}`,
      userName: record.userName || 'Library Student',
      role: 'student',
      type: 'library_checkin',
      referenceId: record.seatNumber || 'A-01',
      date: record.date || new Date().toISOString().split('T')[0],
      time: record.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: record.status || 'present',
      notes: record.notes || 'In-person desk check-in',
    };
    (attRec as any).libraryId = record.libraryId;
    return mockStore.addLibraryAttendance(attRec);
  },

  async checkoutStudentAttendance(recordId: string, checkoutTime?: string): Promise<AttendanceRecord | null> {
    await new Promise(r => setTimeout(r, 150));
    return mockStore.checkoutStudentAttendance(recordId, checkoutTime);
  },

  async recordFeePayment(libraryId: string, studentId: string, paymentData: any) {
    await new Promise(r => setTimeout(r, 250));
    return mockStore.recordStudentFeePayment(libraryId, studentId, paymentData);
  },

  async updateLibraryListing(libraryId: string, updates: Partial<Library>): Promise<Library | null> {
    await new Promise(r => setTimeout(r, 250));
    return mockStore.updateLibrary(libraryId, updates);
  },

  async addManualStudent(data: Omit<LibraryStudent, 'id' | 'referenceId' | 'isOnlineUser'>): Promise<LibraryStudent> {
    await new Promise(r => setTimeout(r, 300));
    const newStudent: LibraryStudent = {
      ...data,
      id: `lib-stu-${Date.now()}`,
      referenceId: `FP-MAN-${Math.floor(100 + Math.random() * 900)}`,
      isOnlineUser: false,
    };
    return mockStore.addLibraryStudent(newStudent);
  },

  async updateSeatStatus(libraryId: string, seatNumber: string, status: SeatStatus, studentName?: string, shiftNameOrId?: string, studentPhone?: string) {
    await new Promise(r => setTimeout(r, 200));
    return mockStore.updateSeatStatus(libraryId, seatNumber, status, studentName, shiftNameOrId, studentPhone);
  },

  async vacateSeat(libraryId: string, seatNumber: string, shiftNameOrId?: string) {
    await new Promise(r => setTimeout(r, 200));
    return mockStore.vacateSeat(libraryId, seatNumber, shiftNameOrId);
  },

  async createLibrary(data: any): Promise<Library> {
    return this.createLibraryListing(data);
  },

  async createLibraryListing(data: any): Promise<Library> {
    await new Promise(r => setTimeout(r, 300));
    const totalSeatsNum = Number(data.totalSeats) || 60;
    const newLib: Library = {
      id: `lib-${Date.now()}`,
      ownerId: data.ownerId,
      ownerName: data.ownerName || 'Study Library Owner',
      ownerPhone: data.ownerPhone || data.phone || '',
      name: data.name,
      description: data.description || 'Modern silent study facility with air-conditioned desks and high-speed Wi-Fi.',
      countryId: data.countryId || 'loc-country-in',
      stateId: data.stateId || 'loc-state-up',
      stateName: data.stateName || 'Uttar Pradesh',
      districtId: data.districtId || 'dist-gzp',
      districtName: data.districtName || data.district || 'Ghazipur',
      district: data.district || 'Ghazipur',
      localityId: data.localityId || 'loc-gzp-saidpur',
      localityName: data.localityName || data.city || data.area || 'Saidpur',
      areaId: data.areaId || 'loc-area-pankaj-talkies',
      areaName: data.areaName || data.area || 'Pankaj Talkies Area',
      city: data.city || data.area || 'Saidpur',
      area: data.area || 'City Center',
      address: data.address || '',
      pincode: data.pincode || '',
      verificationStatus: 'pending',
      totalSeats: totalSeatsNum,
      availableSeats: totalSeatsNum,
      monthlyStartingPrice: Number(data.monthlyFee) || 800,
      monthlyFee: Number(data.monthlyFee) || 800,
      hourlyRate: Number(data.hourlyRate) || 30,
      facilities: data.facilities && data.facilities.length > 0 ? data.facilities : ['Air Conditioned (AC)', 'High-Speed 5G Wi-Fi'],
      timings: data.timings || '06:00 AM – 11:00 PM',
      images: data.images && data.images.length > 0 ? data.images : [
        'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=800'
      ],
      rating: 0,
      reviewsCount: 0,
      rules: data.rules || ['Silence must be maintained.', 'No food inside reading hall.'],
      shifts: data.shifts && data.shifts.length > 0 ? data.shifts : [
        { id: 'sh-1', name: 'Morning Shift', startTime: '06:00 AM', endTime: '12:00 PM', price: Math.round((Number(data.monthlyFee) || 800) * 0.7) },
        { id: 'sh-2', name: 'Afternoon Shift', startTime: '12:00 PM', endTime: '06:00 PM', price: Math.round((Number(data.monthlyFee) || 800) * 0.7) },
        { id: 'sh-3', name: 'Evening Shift', startTime: '06:00 PM', endTime: '11:00 PM', price: Math.round((Number(data.monthlyFee) || 800) * 0.6) },
        { id: 'sh-4', name: 'Full Day (15 Hours)', startTime: '06:00 AM', endTime: '09:00 PM', price: Number(data.monthlyFee) || 800 },
      ],
      seats: Array.from({ length: totalSeatsNum }, (_, i) => ({
        id: `seat-${i + 1}`,
        seatNumber: `A-${(i + 1).toString().padStart(2, '0')}`,
        status: 'available' as const,
        shiftOccupancy: {
          morning: { isBooked: false },
          afternoon: { isBooked: false },
          evening: { isBooked: false },
          isFullDay: false
        }
      })),
      premisesKyc: {},
    };

    mockStore.addLibrary(newLib);
    return newLib;
  }
};
