// FOCUSPOINT Event Dispatcher Bus for User Activity & Search Detection
// Captures and broadcasts real-time student and educator interactions across search and onboarding flows

import { 
  UserSearchActivityEvent, 
  NotificationTriggerEvent, 
  AiNotificationServiceCategory, 
  SearchEventLocationPayload 
} from '../types/aiNotification';
import { aiNotificationAgentService } from './aiNotificationAgentService';

export class NotificationEventService {
  private static instance: NotificationEventService;

  public static getInstance(): NotificationEventService {
    if (!NotificationEventService.instance) {
      NotificationEventService.instance = new NotificationEventService();
    }
    return NotificationEventService.instance;
  }

  /**
   * Emits an activity search or application event into the AI Notification Engine
   */
  public async emitActivityEvent(params: {
    eventType: NotificationTriggerEvent;
    serviceType: AiNotificationServiceCategory;
    userId?: string;
    userName?: string;
    userPhone?: string;
    userRole?: string;
    location: SearchEventLocationPayload;
    query?: string;
    filters?: Record<string, any>;
  }): Promise<void> {
    const event: UserSearchActivityEvent = {
      eventId: `ev-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      eventType: params.eventType,
      userId: params.userId || 'guest-visitor',
      userName: params.userName || 'Student Learner',
      userPhone: params.userPhone,
      userRole: params.userRole || 'STUDENT',
      serviceType: params.serviceType,
      location: params.location,
      query: params.query,
      filters: params.filters,
      timestamp: new Date().toISOString()
    };

    // Pass asynchronously to the AI Notification Agent
    try {
      await aiNotificationAgentService.handleUserActivityEvent(event);
    } catch (err) {
      console.warn('AI Notification Event consumption non-blocking error:', err);
    }
  }

  /**
   * Helper: Dispatches library search event
   */
  public emitLibrarySearch(params: {
    districtName?: string;
    localityName?: string;
    stateName?: string;
    pincode?: string;
    query?: string;
    facilities?: string[];
    userId?: string;
    userName?: string;
    userPhone?: string;
  }) {
    return this.emitActivityEvent({
      eventType: 'LIBRARY_SEARCHED',
      serviceType: 'LIBRARY',
      userId: params.userId,
      userName: params.userName,
      userPhone: params.userPhone,
      location: {
        districtName: params.districtName,
        localityName: params.localityName,
        stateName: params.stateName,
        pincode: params.pincode
      },
      query: params.query,
      filters: {
        facilities: params.facilities
      }
    });
  }

  /**
   * Helper: Dispatches home tutor search event
   */
  public emitHomeTutorSearch(params: {
    districtName?: string;
    localityName?: string;
    stateName?: string;
    subject?: string;
    classLevel?: string;
    teachingMode?: string;
    query?: string;
    userId?: string;
    userName?: string;
    userPhone?: string;
  }) {
    return this.emitActivityEvent({
      eventType: 'HOME_TUTOR_SEARCHED',
      serviceType: 'HOME_TUITION',
      userId: params.userId,
      userName: params.userName,
      userPhone: params.userPhone,
      location: {
        districtName: params.districtName,
        localityName: params.localityName,
        stateName: params.stateName
      },
      query: params.query,
      filters: {
        subject: params.subject,
        classLevel: params.classLevel,
        teachingMode: params.teachingMode
      }
    });
  }

  /**
   * Helper: Dispatches teacher application event
   */
  public emitTeacherApplicationEvent(stage: 'STARTED' | 'SUBMITTED', params: {
    districtName?: string;
    localityName?: string;
    userId?: string;
    userName?: string;
    userPhone?: string;
    subjects?: string[];
  }) {
    return this.emitActivityEvent({
      eventType: stage === 'STARTED' ? 'TEACHER_APPLICATION_STARTED' : 'TEACHER_APPLICATION_SUBMITTED',
      serviceType: 'TEACHER_APPLICATION',
      userId: params.userId,
      userName: params.userName,
      userPhone: params.userPhone,
      location: {
        districtName: params.districtName,
        localityName: params.localityName
      },
      filters: {
        stage,
        subjects: params.subjects
      }
    });
  }

  /**
   * Helper: Dispatches library listing application event
   */
  public emitLibraryListingEvent(stage: 'STARTED' | 'SUBMITTED', params: {
    districtName?: string;
    localityName?: string;
    pincode?: string;
    userId?: string;
    userName?: string;
    userPhone?: string;
    totalSeats?: number;
  }) {
    return this.emitActivityEvent({
      eventType: stage === 'STARTED' ? 'LIBRARY_LISTING_STARTED' : 'LIBRARY_LISTING_SUBMITTED',
      serviceType: 'LIBRARY_LISTING',
      userId: params.userId,
      userName: params.userName,
      userPhone: params.userPhone,
      location: {
        districtName: params.districtName,
        localityName: params.localityName,
        pincode: params.pincode
      },
      filters: {
        stage,
        totalSeats: params.totalSeats
      }
    });
  }

  /**
   * Helper: Dispatches mock test search event
   */
  public emitMockTestSearch(params: {
    examCategory?: string;
    examId?: string;
    query?: string;
    districtName?: string;
    userId?: string;
    userName?: string;
    userPhone?: string;
  }) {
    return this.emitActivityEvent({
      eventType: 'MOCK_TEST_SEARCHED',
      serviceType: 'MOCK_TEST',
      userId: params.userId,
      userName: params.userName,
      userPhone: params.userPhone,
      location: {
        districtName: params.districtName || 'Pan-India'
      },
      query: params.query,
      filters: {
        examCategory: params.examCategory,
        examId: params.examId
      }
    });
  }

  /**
   * Helper: Dispatches study material search event
   */
  public emitStudyMaterialSearch(params: {
    classLevel?: string;
    subject?: string;
    format?: string;
    query?: string;
    districtName?: string;
    userId?: string;
    userName?: string;
    userPhone?: string;
  }) {
    return this.emitActivityEvent({
      eventType: 'STUDY_MATERIAL_SEARCHED',
      serviceType: 'STUDY_MATERIAL',
      userId: params.userId,
      userName: params.userName,
      userPhone: params.userPhone,
      location: {
        districtName: params.districtName || 'Pan-India'
      },
      query: params.query,
      filters: {
        classLevel: params.classLevel,
        subject: params.subject,
        format: params.format
      }
    });
  }
}

export const notificationEventService = NotificationEventService.getInstance();
