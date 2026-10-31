import { NotificationItem } from '../../types';

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    userId: 'usr-student-aryan',
    title: 'Tutor Allotment Confirmed',
    message: 'Ghazipur District Admin has allotted Dr. Rajesh Sharma for your Class 11 Physics & Mathematics tuition request.',
    category: 'APPROVAL',
    isRead: false,
    link: '/student/tutor',
    createdAt: '2026-08-20T14:35:00Z',
  },
  {
    id: 'notif-2',
    userId: 'usr-student-aryan',
    title: 'Library Seat Booking Active',
    message: 'Your seat (Seat 03 - Morning Shift) at FocusPoint Premier Study Library - Saidpur is active.',
    category: 'BOOKING',
    isRead: true,
    link: '/student/bookings',
    createdAt: '2026-08-30T10:31:00Z',
  },
  {
    id: 'notif-3',
    userId: 'usr-admin-ghazipur',
    title: 'New Tutor Request Received',
    message: 'Sneha Kumari from Mohammadabad has submitted a new Class 12 Chemistry/Biology tutor request.',
    category: 'ADMIN',
    isRead: false,
    link: '/district-admin/tutor-requests',
    createdAt: '2026-09-05T09:32:00Z',
  },
  {
    id: 'notif-4',
    userId: 'usr-admin-ghazipur',
    title: 'New Teacher Verification Pending',
    message: 'Vikramaditya Pandey has submitted verification documents for approval in Saidpur block.',
    category: 'APPROVAL',
    isRead: false,
    link: '/district-admin/teacher-approvals',
    createdAt: '2026-08-28T10:16:00Z',
  },
  {
    id: 'notif-5',
    userId: 'usr-super-admin',
    title: 'Monthly Revenue Milestone',
    message: 'Total tuition matching and library bookings across 5 districts reached ₹4.2 Lakhs this month.',
    category: 'SYSTEM',
    isRead: true,
    link: '/super-admin/dashboard',
    createdAt: '2026-09-01T00:00:00Z',
  }
];
