// FOCUSPOINT Notification Service Abstraction Layer
// Connected to mockStore and WhatsApp Business alert dispatch pipeline

import { NotificationItem } from '../types';
import { mockStore } from '../mock/store';

/** Official FocusPoint Verified WhatsApp System Bot */
export const SYSTEM_WHATSAPP_NUMBER = '9196434387';
export const SYSTEM_WHATSAPP_DISPLAY = '+91 9196434387';

/** Sanitizes phone numbers for WhatsApp API (defaults to Indian country code 91) */
export function formatWhatsAppPhone(phone?: string): string {
  if (!phone) return SYSTEM_WHATSAPP_NUMBER;
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits;
  }
  return digits || SYSTEM_WHATSAPP_NUMBER;
}

/** Generates official direct dispatch URL for WhatsApp */
export function getWhatsAppSendUrl(phone: string, text: string): string {
  const clean = formatWhatsAppPhone(phone);
  return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
}

/** Generates direct URL to chat with FocusPoint System Bot */
export function getSystemBotWhatsAppUrl(defaultText?: string): string {
  const text = defaultText ? `?text=${encodeURIComponent(defaultText)}` : '';
  return `https://wa.me/${SYSTEM_WHATSAPP_NUMBER}${text}`;
}

export interface WhatsAppAlertPayload {
  recipientPhone: string;
  recipientName: string;
  studentName: string;
  eventType: 'CHECK_IN' | 'CHECK_OUT';
  serviceType: 'HOME_TUITION' | 'LIBRARY';
  facilityOrTeacherName: string;
  date: string;
  time: string;
  checkInTime?: string;
  checkOutTime?: string;
  duration?: string;
}

export interface WhatsAppBookingAlertPayload {
  recipientPhone: string;
  recipientName: string;
  studentName: string;
  serviceType: 'HOME_TUITION' | 'LIBRARY';
  bookingRef: string;
  facilityOrTeacherName: string;
  amount: number;
  transactionId?: string;
  details?: {
    subjects?: string[];
    className?: string;
    schedule?: string;
    seatNumber?: string;
    shiftName?: string;
    shiftTimings?: string;
    startDate?: string;
    endDate?: string;
  };
}

export interface WhatsAppDispatchResult {
  id: string;
  status: 'QUEUED' | 'SENDING' | 'SENT' | 'DELIVERED' | 'FAILED';
  channel: 'WHATSAPP';
  message: string;
  recipientPhone: string;
  recipientName: string;
  timestamp: string;
  whatsappUrl: string;
  systemNumber: string;
  error?: string;
}

export const notificationService = {
  async getNotifications(userId?: string): Promise<NotificationItem[]> {
    await new Promise(r => setTimeout(r, 60));
    return mockStore.getNotifications(userId);
  },

  async markAsRead(id: string) {
    mockStore.markNotificationAsRead(id);
  },

  async markAllAsRead(userId: string) {
    mockStore.markAllNotificationsRead(userId);
  },

  /**
   * Dispatches official Parent WhatsApp notification for attendance.
   * Resilient architecture: If delivery fails, it returns FAILED without throwing,
   * guaranteeing that attendance is NEVER rolled back or broken.
   */
  async sendWhatsAppAttendanceAlert(payload: WhatsAppAlertPayload): Promise<WhatsAppDispatchResult> {
    const serviceLabel = payload.serviceType === 'HOME_TUITION' ? 'Home Tuition' : 'Library';
    const nowIso = new Date().toISOString();
    const alertId = `wa-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    let formattedMessage = '';
    if (payload.eventType === 'CHECK_IN') {
      formattedMessage = 
`ZYZU'S Attendance Alert

Your child ${payload.studentName} has checked in for:
${serviceLabel}

Date: ${payload.date}
Check-In: ${payload.time}
Teacher/Library: ${payload.facilityOrTeacherName}

Official System Gateway: ${SYSTEM_WHATSAPP_DISPLAY}
ZYZU'S | Tutors & Libraries`;
    } else {
      formattedMessage = 
`ZYZU'S Attendance Alert

Your child ${payload.studentName} has checked out from:
${serviceLabel}

Date: ${payload.date}
Check-In: ${payload.checkInTime || payload.time}
Check-Out: ${payload.checkOutTime || payload.time}
Duration: ${payload.duration || 'Session Finished'}
Teacher/Library: ${payload.facilityOrTeacherName}

Official System Gateway: ${SYSTEM_WHATSAPP_DISPLAY}
ZYZU'S | Tutors & Libraries`;
    }

    const cleanRecipient = formatWhatsAppPhone(payload.recipientPhone);
    const waUrl = getWhatsAppSendUrl(cleanRecipient, formattedMessage);

    // Simulate reliable dispatch pipeline
    try {
      // Create user notification item in store
      const notifItem: NotificationItem = {
        id: alertId,
        userId: 'all',
        title: `Parent WhatsApp Alert (${payload.eventType === 'CHECK_IN' ? 'Check-In' : 'Check-Out'})`,
        message: `${payload.studentName} • ${serviceLabel} attendance alert sent to parent WhatsApp (${payload.recipientPhone}) via official bot ${SYSTEM_WHATSAPP_DISPLAY}.`,
        category: 'ATTENDANCE',
        isRead: false,
        createdAt: nowIso,
      };
      mockStore.addNotification(notifItem);

      // Log in audit log
      mockStore.logAudit({
        id: `aud-${Date.now()}`,
        action: 'WHATSAPP_NOTIFICATION_SENT',
        details: `WhatsApp ${payload.eventType} attendance alert delivered to parent (${payload.recipientPhone}) for ${payload.studentName} via official bot ${SYSTEM_WHATSAPP_NUMBER}`,
        timestamp: nowIso,
        adminRole: 'SYSTEM',
      });

      return {
        id: alertId,
        status: 'DELIVERED',
        channel: 'WHATSAPP',
        message: formattedMessage,
        recipientPhone: payload.recipientPhone,
        recipientName: payload.recipientName,
        timestamp: nowIso,
        whatsappUrl: waUrl,
        systemNumber: SYSTEM_WHATSAPP_NUMBER,
      };
    } catch (err: any) {
      console.warn('WhatsApp notification dispatch simulation encountered error (fail-safe active):', err);
      return {
        id: alertId,
        status: 'FAILED',
        channel: 'WHATSAPP',
        message: formattedMessage,
        recipientPhone: payload.recipientPhone,
        recipientName: payload.recipientName,
        timestamp: nowIso,
        whatsappUrl: waUrl,
        systemNumber: SYSTEM_WHATSAPP_NUMBER,
        error: err?.message || 'Gateway temporary timeout. Queued for retry.',
      };
    }
  },

  /**
   * Dispatches official automatic WhatsApp booking confirmation for Home Tuition or Study Library.
   * Dispatched automatically whenever a student/parent books a tutor or library seat.
   */
  async sendWhatsAppBookingConfirmation(payload: WhatsAppBookingAlertPayload): Promise<WhatsAppDispatchResult> {
    const serviceLabel = payload.serviceType === 'HOME_TUITION' ? 'Home Tuition' : 'Digital Study Library';
    const nowIso = new Date().toISOString();
    const alertId = `wa-bk-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    let formattedMessage = '';
    if (payload.serviceType === 'HOME_TUITION') {
      formattedMessage = 
`ZYZU'S Home Tuition Booking Confirmed! 🎓

Dear ${payload.recipientName || payload.studentName},
Your Home Tuition booking is successfully confirmed with ZYZU'S.

📋 Booking Ref: ${payload.bookingRef}
👨‍🏫 Allotted Educator: ${payload.facilityOrTeacherName}
📚 Class & Subject: ${payload.details?.className || 'Class 10'} • ${(payload.details?.subjects || []).join(', ') || 'Core Subjects'}
🗓️ Schedule: ${payload.details?.schedule || 'Weekly Scheduled Sessions'}
💰 Amount Paid: ₹${payload.amount.toLocaleString()}${payload.transactionId ? ` (Txn ID: ${payload.transactionId})` : ''}

🤖 Official System WhatsApp: ${SYSTEM_WHATSAPP_DISPLAY}
Scan the ZYZU'S QR code at the start of every session for automatic attendance logging.

FocusPoint Intelligence System`;
    } else {
      formattedMessage = 
`ZYZU'S Study Library Booking Confirmed! 📚

Dear ${payload.recipientName || payload.studentName},
Your Study Desk reservation is successfully confirmed.

📋 Pass Ref: ${payload.bookingRef}
🏢 Library: ${payload.facilityOrTeacherName}
🪑 Desk Assigned: ${payload.details?.seatNumber || 'Assigned Desk'}
⏱️ Shift: ${payload.details?.shiftName || 'Daily Shift'}${payload.details?.shiftTimings ? ` (${payload.details.shiftTimings})` : ''}
📅 Validity: ${payload.details?.startDate || 'Today'} to ${payload.details?.endDate || '30 Days'}
💰 Amount Paid: ₹${payload.amount.toLocaleString()}${payload.transactionId ? ` (Txn ID: ${payload.transactionId})` : ''}
🔐 Access Pass: BIOMETRIC TURNSTILE ACTIVE

🤖 Official System WhatsApp: ${SYSTEM_WHATSAPP_DISPLAY}
Scan the ZYZU'S QR code at the entrance turnstile to check in & out daily.

FocusPoint Intelligence System`;
    }

    const cleanRecipient = formatWhatsAppPhone(payload.recipientPhone);
    const waUrl = getWhatsAppSendUrl(cleanRecipient, formattedMessage);

    try {
      mockStore.addNotification({
        id: alertId,
        userId: 'all',
        title: `WhatsApp Booking Confirmation (${serviceLabel})`,
        message: `${payload.studentName} • ${serviceLabel} confirmation dispatched to WhatsApp (+91 ${payload.recipientPhone}) from official bot ${SYSTEM_WHATSAPP_DISPLAY}.`,
        category: payload.serviceType === 'HOME_TUITION' ? 'TUTOR' : 'SYSTEM',
        isRead: false,
        createdAt: nowIso,
      });

      mockStore.logAudit({
        id: `aud-${Date.now()}`,
        action: 'WHATSAPP_NOTIFICATION_SENT',
        details: `WhatsApp ${payload.serviceType} booking confirmation sent to ${payload.recipientPhone} for ${payload.studentName} via official bot ${SYSTEM_WHATSAPP_NUMBER}`,
        timestamp: nowIso,
        adminRole: 'SYSTEM',
      });

      return {
        id: alertId,
        status: 'DELIVERED',
        channel: 'WHATSAPP',
        message: formattedMessage,
        recipientPhone: payload.recipientPhone,
        recipientName: payload.recipientName,
        timestamp: nowIso,
        whatsappUrl: waUrl,
        systemNumber: SYSTEM_WHATSAPP_NUMBER,
      };
    } catch (err: any) {
      console.warn('WhatsApp booking confirmation dispatch encountered error (fail-safe active):', err);
      return {
        id: alertId,
        status: 'FAILED',
        channel: 'WHATSAPP',
        message: formattedMessage,
        recipientPhone: payload.recipientPhone,
        recipientName: payload.recipientName,
        timestamp: nowIso,
        whatsappUrl: waUrl,
        systemNumber: SYSTEM_WHATSAPP_NUMBER,
        error: err?.message || 'Gateway temporary timeout',
      };
    }
  },

  /**
   * Universal Registration Confirmation WhatsApp Dispatcher (Section #21 - #31).
   * Automatically dispatches official WhatsApp confirmation when any supported user registers:
   * Student, Teacher, Library Owner, District Admin, Super Admin, Operator.
   * Resilient: If delivery fails, registration NEVER fails or rolls back.
   */
  async sendWhatsAppRegistrationConfirmation(payload: {
    userId: string;
    role: 'STUDENT' | 'TEACHER' | 'LIBRARY_OWNER' | 'DISTRICT_ADMIN' | 'SUPER_ADMIN' | 'OPERATOR';
    recipientName?: string;
    name?: string;
    recipientPhone?: string;
    mobile?: string;
    phoneNumber?: string;
    whatsappNumber?: string;
    identifierId?: string;
    district?: string;
    state?: string;
    status?: string;
    details?: any;
    [key: string]: any;
  }): Promise<WhatsAppDispatchResult> {
    const nowIso = new Date().toISOString();
    const alertId = `wa-reg-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const recipientName = payload.recipientName || payload.name || 'Valued User';
    const recipientPhone = payload.recipientPhone || payload.whatsappNumber || payload.mobile || payload.phoneNumber || '';

    // Validate phone number format (Section #31)
    const rawDigits = recipientPhone.replace(/\D/g, '');
    if (!rawDigits || rawDigits.length < 10) {
      const errMsg = 'WhatsApp confirmation could not be sent because a valid WhatsApp number is not available.';
      try {
        mockStore.addNotification({
          id: alertId,
          userId: payload.userId,
          title: 'WhatsApp Confirmation Alert',
          message: errMsg,
          category: 'SYSTEM',
          isRead: false,
          createdAt: nowIso,
        });
      } catch (e) {
        // silent fail-safe
      }

      return {
        id: alertId,
        status: 'FAILED',
        channel: 'WHATSAPP',
        message: errMsg,
        recipientPhone: recipientPhone || 'N/A',
        recipientName: recipientName,
        timestamp: nowIso,
        whatsappUrl: '',
        systemNumber: SYSTEM_WHATSAPP_NUMBER,
        error: errMsg,
      };
    }

    const maskNumber = (phone: string) => {
      const d = phone.replace(/\D/g, '');
      if (d.length >= 10) {
        const last4 = d.slice(-4);
        const first2 = d.slice(-10, -8);
        return `+91 ${first2}XXXX${last4}`;
      }
      return phone;
    };

    let formattedMessage = '';
    const cleanId = payload.identifierId || payload.userId;

    switch (payload.role) {
      case 'STUDENT':
        formattedMessage =
`WELCOME TO ZYZU'S

Hello ${recipientName},

Your ZYZU'S account has been successfully created.

Student ID:
${cleanId}

Registered Mobile:
${maskNumber(recipientPhone)}

You can now access your ZYZU'S account and explore your available services.

Thank you for choosing ZYZU'S.

ZYZU'S | Tutors & Libraries`;
        break;

      case 'TEACHER':
        formattedMessage =
`ZYZU'S TEACHER REGISTRATION CONFIRMED

Hello ${recipientName},

Your teacher account has been successfully registered.

Teacher ID:
${cleanId}

Current Status:
${payload.status || 'Pending Verification'}

You can track your verification status from your Teacher Console.`;
        break;

      case 'LIBRARY_OWNER':
        formattedMessage =
`ZYZU'S LIBRARY OWNER REGISTRATION CONFIRMED

Hello ${recipientName},

Your ZYZU'S Library Owner account has been successfully created.

Owner ID:
${cleanId}

You can now access your Library Owner Console and list/manage your library.`;
        break;

      case 'DISTRICT_ADMIN': {
        const district = payload.district || payload.details?.district || 'Ghazipur';
        const state = payload.state || payload.details?.state || 'Uttar Pradesh';
        const password = payload.temporaryPassword || payload.password || payload.details?.temporaryPassword || payload.details?.password || '';
        formattedMessage =
`🎉 CONGRATULATIONS! ZYZU'S DISTRICT ADMIN ACCOUNT CREATED 🎉

Hello ${recipientName},

Congratulations! You have been officially appointed as the District Admin on ZYZU'S.

District:
${district} (${state})

Your Authorized Login Credentials:
👤 User ID: ${cleanId}
🔑 Temporary Password: ${password || 'Set during Super Admin appointment'}
📍 Authorized Jurisdiction: ${district}, ${state}
🌐 Portal Login: https://focuspoint.internal/district-admin/login

You can now directly sign in to the District Admin Command Center with your credentials. For security, please update your password after initial sign-in.

Official System Gateway: ${SYSTEM_WHATSAPP_DISPLAY}
ZYZU'S Administration
ZYZU'S | Tutors & Libraries`;
        break;
      }

      case 'SUPER_ADMIN':
        formattedMessage =
`ZYZU'S ADMIN REGISTRATION CONFIRMED

Hello ${recipientName},

Your ZYZU'S Super Admin account has been successfully created.

Your administrative access is now available according to your assigned permissions.`;
        break;

      case 'OPERATOR':
        formattedMessage =
`ZYZU'S OPERATOR REGISTRATION CONFIRMED

Hello ${recipientName},

Your ZYZU'S Study Material & Mock Test Operator account has been successfully created.

Operator ID:
${cleanId}

Your assigned permissions are available inside the Operator Console.`;
        break;
    }

    const cleanRecipient = formatWhatsAppPhone(recipientPhone);
    const waUrl = getWhatsAppSendUrl(cleanRecipient, formattedMessage);

    // Fail-safe dispatch: Failure NEVER rolls back registration
    try {
      mockStore.addNotification({
        id: alertId,
        userId: payload.userId,
        title: `WhatsApp Registration Confirmation (${payload.role.replace('_', ' ')})`,
        message: `Welcome message queued and dispatched to verified WhatsApp (+91 ${cleanRecipient.slice(-10)}) via official bot ${SYSTEM_WHATSAPP_DISPLAY}.`,
        category: 'SYSTEM',
        isRead: false,
        createdAt: nowIso,
      });

      mockStore.logAudit({
        id: `aud-${Date.now()}`,
        action: 'WHATSAPP_NOTIFICATION_SENT',
        details: `WhatsApp registration confirmation dispatched to ${recipientPhone} for ${recipientName} (${payload.role}) via official gateway ${SYSTEM_WHATSAPP_NUMBER}`,
        timestamp: nowIso,
        adminRole: 'SYSTEM',
      });

      return {
        id: alertId,
        status: 'DELIVERED',
        channel: 'WHATSAPP',
        message: formattedMessage,
        recipientPhone: recipientPhone,
        recipientName: recipientName,
        timestamp: nowIso,
        whatsappUrl: waUrl,
        systemNumber: SYSTEM_WHATSAPP_NUMBER,
      };
    } catch (err: any) {
      console.warn('WhatsApp registration notification delivery failed (fail-safe active):', err);
      return {
        id: alertId,
        status: 'FAILED',
        channel: 'WHATSAPP',
        message: formattedMessage,
        recipientPhone: recipientPhone,
        recipientName: recipientName,
        timestamp: nowIso,
        whatsappUrl: waUrl,
        systemNumber: SYSTEM_WHATSAPP_NUMBER,
        error: err?.message || 'Gateway temporary timeout. Queued for background retry.',
      };
    }
  }
};

