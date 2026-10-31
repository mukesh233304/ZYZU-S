import { SupportTicket } from '../../types';

export const MOCK_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: 'tkt-301',
    userId: 'usr-student-aryan',
    userName: 'Aryan Singh',
    userRole: 'STUDENT',
    category: 'Tutor Assignment',
    subject: 'Requesting extra Sunday revision session timing adjustment',
    description: 'Hello, could Dr. Rajesh Sharma and I reschedule our Sunday class from 5 PM to 10 AM due to school unit tests next Monday?',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    createdAt: '2026-09-04T12:00:00Z',
    updatedAt: '2026-09-04T15:30:00Z',
    responses: [
      {
        id: 'resp-1',
        senderId: 'usr-student-aryan',
        senderName: 'Aryan Singh',
        senderRole: 'STUDENT',
        message: 'Hello, could Dr. Rajesh Sharma and I reschedule our Sunday class from 5 PM to 10 AM due to school unit tests next Monday?',
        timestamp: '2026-09-04T12:00:00Z',
      },
      {
        id: 'resp-2',
        senderId: 'usr-admin-ghazipur',
        senderName: 'Manoj Kumar Rai (District Admin)',
        senderRole: 'DISTRICT_ADMIN',
        message: 'Hello Aryan, we have notified Dr. Rajesh Sharma. Since his Sunday morning 10 AM slot is available, he has agreed to conduct the 2-hour physics revision at 10 AM. We have updated your portal schedule.',
        timestamp: '2026-09-04T15:30:00Z',
      }
    ]
  },
  {
    id: 'tkt-302',
    userId: 'usr-lib-suresh',
    userName: 'Suresh Chandra Yadav',
    userRole: 'LIBRARY_OWNER',
    category: 'Technical',
    subject: 'Request for biometric scanner sync integration manual',
    description: 'We recently installed a second optical biometric scanner at our Saidpur library entrance. Need technical instructions on how to sync offline logs to the FocusPoint portal.',
    status: 'OPEN',
    priority: 'HIGH',
    createdAt: '2026-09-06T08:30:00Z',
    updatedAt: '2026-09-06T08:30:00Z',
    responses: []
  }
];
