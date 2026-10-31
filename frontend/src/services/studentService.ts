// FOCUSPOINT Student Service Abstraction Layer
// Designed for seamless transition to InsForge PostgreSQL BaaS

import { TutorRequest, User, Invoice, AttendanceRecord, LibraryBooking, TeacherAssignment, Teacher } from '../types';
import { mockStore } from '../mock/store';
import { safeStorage } from '../utils/storageUtils';
import { notificationService } from './notificationService';

export interface StudentDashboardSummary {
  activeTutor: {
    request: TutorRequest;
    teacherName: string;
    teacherDegree?: string;
    teacherAvatar?: string;
    subjects: string[];
    preferredDays?: string[];
    preferredTime?: string;
    monthlyFee: number;
    status: string;
  } | null;
  activeLibrarySeat: {
    booking: LibraryBooking;
    libraryName: string;
    seatNumber: string;
    shiftName: string;
    startDate: string;
    endDate: string;
    amount: number;
    status: string;
  } | null;
  attendance: {
    totalSessions: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    leaveCount: number;
    attendanceRate: number; // 0% if no records!
    hasRecords: boolean;
    recentRecords: AttendanceRecord[];
  };
  fees: {
    pendingInvoices: Invoice[];
    totalPendingFee: number;
    hasPendingFees: boolean;
    allInvoices: Invoice[];
  };
  tutorRequests: TutorRequest[];
  libraryBookings: LibraryBooking[];
}

export interface StudentNotificationPreferences {
  loginMobile: string;
  whatsappNumber: string;
  receiveWhatsapp: boolean;
  smsNotifications: boolean;
  emailInvoices: boolean;
  emailReceipts: boolean;
  bookingConfirmations: boolean;
  paymentReminders: boolean;
  attendanceAlerts: boolean;
  tutorUpdates: boolean;
  libraryRenewals: boolean;
  tuitionRenewals: boolean;
  importantAccountAlerts: boolean;
}

export const studentService = {
  // Fetch real profile details
  async getProfile(studentId: string): Promise<User | undefined> {
    await new Promise(r => setTimeout(r, 100));
    return mockStore.getUserById(studentId);
  },

  // Update profile details
  async updateProfile(studentId: string, updates: Partial<User>): Promise<User | null> {
    await new Promise(r => setTimeout(r, 200));
    const updated = mockStore.updateUser(studentId, updates);
    if (updated) {
      // Sync active session if it matches current user
      try {
        const stored = safeStorage.getItem('fp_current_session_user');
        if (stored) {
          const current: User = JSON.parse(stored);
          if (current.id === studentId) {
            safeStorage.setItem('fp_current_session_user', JSON.stringify({ ...current, ...updates }));
          }
        }
      } catch (e) {
        console.warn('Session sync error');
      }
    }
    return updated;
  },

  // Update profile avatar image
  async updateProfilePhoto(studentId: string, photoUrl: string): Promise<User | null> {
    return this.updateProfile(studentId, { avatarUrl: photoUrl, avatar: photoUrl });
  },

  // DYNAMIC DASHBOARD DATA: strictly computes metrics from actual records
  async getDashboardData(studentId: string): Promise<StudentDashboardSummary> {
    await new Promise(r => setTimeout(r, 150));

    // 1. Tutor Requests & Active Teacher
    const tutorRequests = mockStore.getTutorRequests(undefined, studentId);
    const activeReq = tutorRequests.find(
      r => r.status === 'ACTIVE' || r.status === 'TEACHER_ALLOTTED'
    );
    let activeTutor = null;
    if (activeReq) {
      const teacher = activeReq.allottedTeacherId ? mockStore.getTeacherById(activeReq.allottedTeacherId) : null;
      activeTutor = {
        request: activeReq,
        teacherName: activeReq.allottedTeacherName || teacher?.name || 'Allotted Home Tutor',
        teacherDegree: teacher?.degree || teacher?.qualification || 'Post Graduate Educator',
        teacherAvatar: teacher?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
        subjects: activeReq.subjects || [],
        preferredDays: activeReq.preferredDays || [],
        preferredTime: activeReq.preferredTime,
        monthlyFee: activeReq.budgetMin || 3500,
        status: activeReq.status,
      };
    }

    // 2. Study Library Bookings
    const libraryBookings = mockStore.getBookings(studentId);
    const activeBooking = libraryBookings.find(
      b => b.status === 'ACTIVE' || b.status === 'CONFIRMED'
    );
    const activeLibrarySeat = activeBooking ? {
      booking: activeBooking,
      libraryName: activeBooking.libraryName,
      seatNumber: activeBooking.seatNumber,
      shiftName: activeBooking.shiftName || 'Standard Shift',
      startDate: activeBooking.startDate,
      endDate: activeBooking.endDate,
      amount: activeBooking.amount || activeBooking.totalAmount || 499,
      status: activeBooking.status,
    } : null;

    // 3. Attendance Records & Calculation (0% for fresh students)
    const attendanceRecords = mockStore.getAttendance(studentId);
    const totalSessions = attendanceRecords.length;
    const presentCount = attendanceRecords.filter(a => a.status === 'PRESENT').length;
    const absentCount = attendanceRecords.filter(a => a.status === 'ABSENT').length;
    const lateCount = attendanceRecords.filter(a => a.status === 'LATE').length;
    const leaveCount = attendanceRecords.filter(a => a.status === 'LEAVE').length;
    const attendanceRate = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0;

    // 4. Invoices & Pending Dues
    const allInvoices = mockStore.getInvoices(studentId);
    const pendingInvoices = allInvoices.filter(i => i.status === 'PENDING' || i.status === 'OVERDUE');
    const totalPendingFee = pendingInvoices.reduce((sum, inv) => sum + (inv.balanceAmount || inv.amount), 0);

    return {
      activeTutor,
      activeLibrarySeat,
      attendance: {
        totalSessions,
        presentCount,
        absentCount,
        lateCount,
        leaveCount,
        attendanceRate,
        hasRecords: totalSessions > 0,
        recentRecords: attendanceRecords.slice(0, 5),
      },
      fees: {
        pendingInvoices,
        totalPendingFee,
        hasPendingFees: pendingInvoices.length > 0,
        allInvoices,
      },
      tutorRequests,
      libraryBookings,
    };
  },

  // Attendance summary with breakdowns for Pie/Donut Chart
  async getAttendanceSummary(studentId: string) {
    await new Promise(r => setTimeout(r, 60));
    const all = mockStore.getAttendance(studentId);
    const total = all.length;
    const present = all.filter(r => {
      const s = (r.status || '').toUpperCase();
      return s === 'PRESENT' || s === 'CHECKED_IN' || s === 'CHECKED_OUT';
    }).length;
    const absent = all.filter(r => (r.status || '').toUpperCase() === 'ABSENT').length;
    const late = all.filter(r => (r.status || '').toUpperCase() === 'LATE').length;
    const leave = all.filter(r => (r.status || '').toUpperCase() === 'LEAVE').length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;

    return {
      total,
      present,
      absent,
      late,
      leave,
      rate,
      records: all,
    };
  },

  // Invoices & Payment
  async getInvoices(studentId: string): Promise<Invoice[]> {
    await new Promise(r => setTimeout(r, 100));
    return mockStore.getInvoices(studentId);
  },

  async payInvoice(invoiceId: string, paymentDetails?: { method?: string; transactionId?: string }): Promise<Invoice | null> {
    await new Promise(r => setTimeout(r, 400));
    const invoice = mockStore.getInvoiceById(invoiceId);
    if (!invoice) return null;

    const txnId = paymentDetails?.transactionId || `TXN-${Date.now().toString().slice(-8)}`;
    const updated: Invoice = {
      ...invoice,
      status: 'PAID',
      paidAmount: invoice.amount,
      balanceAmount: 0,
      paidDate: new Date().toISOString().split('T')[0],
      ...(paymentDetails ? { paymentMethod: paymentDetails.method, transactionId: txnId } : {}),
    } as any;

    mockStore.updateInvoice(invoiceId, updated);

    // Notify student
    mockStore.addNotification({
      id: `notif-${Date.now()}`,
      userId: invoice.userId,
      title: 'Fee Payment Successful',
      message: `Your payment of ₹${invoice.amount} for ${invoice.description} has been confirmed. Receipt generated.`,
      category: 'PAYMENT',
      isRead: false,
      link: '/student/fees',
      createdAt: new Date().toISOString(),
    });

    return updated;
  },

  // Tutor Requests
  async getTutorRequests(studentId: string): Promise<TutorRequest[]> {
    await new Promise(r => setTimeout(r, 100));
    return mockStore.getTutorRequests(undefined, studentId);
  },

  async submitTutorRequest(data: Omit<TutorRequest, 'id' | 'status' | 'submittedAt'> & { paymentStatus?: 'PAID' | 'PENDING' | 'FAILED'; paymentMethod?: string; paymentAmount?: number; transactionId?: string; paidDate?: string }): Promise<TutorRequest> {
    await new Promise(r => setTimeout(r, 350));
    const isPaid = data.paymentStatus === 'PAID';
    const hasTeacher = Boolean(data.preferredTeacherId);

    const newReq: TutorRequest = {
      ...data,
      id: `req-${Date.now().toString().slice(-4)}`,
      status: isPaid ? (hasTeacher ? 'TEACHER_ALLOTTED' : 'UNDER_REVIEW') : 'SUBMITTED',
      allottedTeacherId: isPaid && hasTeacher ? data.preferredTeacherId : undefined,
      allottedTeacherName: isPaid && hasTeacher ? data.preferredTeacherName : undefined,
      allotmentDate: isPaid && hasTeacher ? new Date().toISOString() : undefined,
      submittedAt: new Date().toISOString(),
    };

    mockStore.addTutorRequest(newReq);

    // If payment was made, generate official paid invoice and teacher assignment
    if (isPaid) {
      const paidAmount = data.paymentAmount || data.budgetMin || 3500;
      const txnId = data.transactionId || `TXN-${Date.now().toString().slice(-8)}`;
      const pMethod = data.paymentMethod || 'UPI QR Payment';

      // 1. Generate Paid Invoice
      mockStore.addInvoice({
        id: `inv-tut-${Date.now().toString().slice(-6)}`,
        invoiceNumber: `FP-INV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
        userId: data.studentId,
        userName: data.studentName,
        type: 'TUTOR_FEE',
        referenceId: newReq.id,
        description: `Monthly Home Tuition Fee - ${data.preferredTeacherName || 'Verified Home Tutor'} (${data.subjects.join(', ')})`,
        amount: paidAmount,
        paidAmount: paidAmount,
        balanceAmount: 0,
        dueDate: new Date().toISOString().split('T')[0],
        paidDate: new Date().toISOString().split('T')[0],
        status: 'PAID',
        paymentMethod: pMethod,
        transactionId: txnId,
      });

      // 2. Generate Active Teacher Assignment if teacher is preferred
      if (hasTeacher && data.preferredTeacherId) {
        const teacher = mockStore.getTeacherById(data.preferredTeacherId);
        mockStore.addTeacherAssignment({
          id: `asg-${Date.now().toString().slice(-4)}`,
          tutorRequestId: newReq.id,
          studentId: data.studentId,
          studentName: data.studentName,
          studentPhone: data.studentMobile || '9876543210',
          teacherId: data.preferredTeacherId,
          teacherName: data.preferredTeacherName || teacher?.name || 'Verified Educator',
          teacherPhone: teacher?.mobile || '9876543211',
          districtId: data.districtId || 'dist-gzp',
          district: data.districtName || 'Ghazipur',
          subjects: data.subjects,
          className: data.className || 'Class 10',
          grade: data.className || 'Class 10',
          schedule: `${(data.preferredDays || []).join(', ')} (${data.preferredTime || '05:00 PM'})`,
          monthlyFee: paidAmount,
          startDate: new Date().toISOString().split('T')[0],
          address: data.address,
          teachingMode: 'Home Tuition',
          status: 'ACTIVE',
        });
      }

      // 3. Create Confirmation Notification for Student
      mockStore.addNotification({
        id: `notif-${Date.now()}-paid`,
        userId: data.studentId,
        title: 'Home Tutor Booking & Payment Confirmed!',
        message: `Payment of ₹${paidAmount.toLocaleString()} received via ${pMethod}. ${data.preferredTeacherName ? `${data.preferredTeacherName} has been booked as your verified home tutor.` : 'Your priority tutor booking is confirmed.'}`,
        category: 'TUTOR',
        isRead: false,
        link: '/student/teacher',
        createdAt: new Date().toISOString(),
      });

      // 4. Dispatch Official Automatic WhatsApp Confirmation
      try {
        await notificationService.sendWhatsAppBookingConfirmation({
          recipientPhone: data.studentMobile || '9876543210',
          recipientName: data.studentName,
          studentName: data.studentName,
          serviceType: 'HOME_TUITION',
          bookingRef: newReq.id,
          facilityOrTeacherName: data.preferredTeacherName || "Verified ZYZU'S Educator",
          amount: paidAmount,
          transactionId: txnId,
          details: {
            subjects: data.subjects,
            className: data.className,
            schedule: `${(data.preferredDays || []).join(', ')} (${data.preferredTime || '05:00 PM'})`,
          },
        });
      } catch (waErr) {
        console.warn('Auto WhatsApp dispatch failed (tutor booking preserved):', waErr);
      }
    } else {
      // Create Notification for Student
      mockStore.addNotification({
        id: `notif-${Date.now()}-student`,
        userId: data.studentId,
        title: 'Tutor Request Received',
        message: `Your request for ${data.className} (${data.subjects.join(', ')}) in ${data.area} has been received.`,
        category: 'TUTOR',
        isRead: false,
        link: '/student/tutor-requests',
        createdAt: new Date().toISOString(),
      });
    }

    // Notify District Admin
    mockStore.addNotification({
      id: `notif-${Date.now()}-admin`,
      userId: 'usr-admin-ghazipur',
      title: isPaid ? 'New Paid Tutor Booking' : 'New Tutor Request',
      message: `${data.studentName} has ${isPaid ? 'booked & paid' : 'requested'} a ${data.className} home tutor (${data.preferredTeacherName || 'Open'}) in ${data.area}.`,
      category: 'ADMIN',
      isRead: false,
      link: '/district-admin/tutor-requests',
      createdAt: new Date().toISOString(),
    });

    return newReq;
  },

  // Student Bookings & Allotted Tutors
  async getStudentBookingsData(studentId: string) {
    await new Promise(r => setTimeout(r, 100));
    const tutorRequests = mockStore.getTutorRequests(undefined, studentId);
    const allAssignments = mockStore.getTeacherAssignments();
    const tutorAssignments = allAssignments.filter(a => a.studentId === studentId);
    const allBookings = mockStore.getBookings(studentId);
    const activeLibraryBookings = allBookings.filter(
      b => b.status === 'ACTIVE' || b.status === 'CONFIRMED' || b.status === 'PENDING' ||
           b.status === 'active' || b.status === 'confirmed' || b.status === 'pending'
    );
    const pastBookings = allBookings.filter(
      b => b.status === 'COMPLETED' || b.status === 'EXPIRED' || b.status === 'CANCELLED' ||
           b.status === 'completed' || b.status === 'expired' || b.status === 'cancelled'
    );

    return {
      tutorRequests,
      tutorAssignments,
      activeLibraryBookings,
      pastBookings,
      allBookings,
    };
  },

  // Get assigned teacher details for student
  async getAssignedTeacher(studentId: string): Promise<{ teacher: Teacher | undefined; request: TutorRequest } | null> {
    await new Promise(r => setTimeout(r, 100));
    const reqs = mockStore.getTutorRequests(undefined, studentId);
    const active = reqs.find(r => r.status === 'ACTIVE' || r.status === 'TEACHER_ALLOTTED');
    if (!active || !active.allottedTeacherId) return null;
    const teacher = mockStore.getTeacherById(active.allottedTeacherId);
    if (!teacher) return null;
    return { teacher, request: active };
  },

  // Notification Preferences
  getNotificationPreferences(studentId: string, defaultMobile = ''): StudentNotificationPreferences {
    try {
      const stored = localStorage.getItem(`fp_notif_prefs_${studentId}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not read notification preferences');
    }

    return {
      loginMobile: defaultMobile,
      whatsappNumber: defaultMobile,
      receiveWhatsapp: true,
      smsNotifications: true,
      emailInvoices: true,
      emailReceipts: true,
      bookingConfirmations: true,
      paymentReminders: true,
      attendanceAlerts: true,
      tutorUpdates: true,
      libraryRenewals: true,
      tuitionRenewals: true,
      importantAccountAlerts: true,
    };
  },

  saveNotificationPreferences(studentId: string, prefs: StudentNotificationPreferences): void {
    localStorage.setItem(`fp_notif_prefs_${studentId}`, JSON.stringify(prefs));
  },
};
