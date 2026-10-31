// FOCUSPOINT Booking Service Abstraction Layer

import { LibraryBooking } from '../types';
import { mockStore } from '../mock/store';
import { notificationService } from './notificationService';

export const bookingService = {
  async getStudentBookings(studentId: string): Promise<LibraryBooking[]> {
    await new Promise(r => setTimeout(r, 150));
    return mockStore.getBookings(studentId);
  },

  async getLibraryBookings(libraryId: string): Promise<LibraryBooking[]> {
    await new Promise(r => setTimeout(r, 150));
    const all = mockStore.getBookings();
    return all.filter(b => b.libraryId === libraryId || !b.libraryId || b.libraryId === 'lib-gzp-01');
  },

  async updateBookingStatus(bookingId: string, status: any): Promise<LibraryBooking | undefined> {
    await new Promise(r => setTimeout(r, 200));
    const all = mockStore.getBookings();
    const b = all.find(x => x.id === bookingId);
    if (b) {
      b.status = status;
    }
    return b;
  },

  async updateBookingPhoto(bookingId: string, photoUrl: string): Promise<boolean> {
    await new Promise(r => setTimeout(r, 100));
    return mockStore.updateBookingPhoto(bookingId, photoUrl);
  },

  async createBooking(data: any): Promise<LibraryBooking> {
    await new Promise(r => setTimeout(r, 300));
    const newBooking: LibraryBooking = {
      ...data,
      id: `bk-${Date.now().toString().slice(-4)}`,
      status: data.status || 'CONFIRMED',
      bookingDate: new Date().toISOString(),
      studentId: data.studentId || data.userId,
      amount: data.amount || data.totalAmount,
      totalAmount: data.totalAmount || data.amount || 1200,
    };

    mockStore.addBooking(newBooking);

    // Automatically trigger WhatsApp confirmation to student / parent mobile
    try {
      const recipientPhone = data.studentMobile || data.studentPhone || data.parentPhone || '9876543210';
      const studentName = data.studentName || 'Student';
      await notificationService.sendWhatsAppBookingConfirmation({
        recipientPhone,
        recipientName: studentName,
        studentName,
        serviceType: 'LIBRARY',
        bookingRef: newBooking.id,
        facilityOrTeacherName: newBooking.libraryName || "ZYZU'S Study Library",
        amount: newBooking.totalAmount || newBooking.amount || 1200,
        transactionId: data.transactionId || `TXN-LIB-${Date.now().toString().slice(-6)}`,
        details: {
          seatNumber: newBooking.seatNumber,
          shiftName: newBooking.shiftName,
          shiftTimings: data.shiftTimings,
          startDate: newBooking.startDate,
          endDate: newBooking.endDate,
        },
      });
    } catch (waErr) {
      console.warn('Auto WhatsApp dispatch failed (booking preserved):', waErr);
    }

    return newBooking;
  }
};
