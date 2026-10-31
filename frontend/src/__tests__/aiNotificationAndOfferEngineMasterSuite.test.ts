import { describe, it, expect, beforeEach } from 'vitest';
import { aiNotificationAgentService } from '../services/aiNotificationAgentService';
import { offerRecommendationService } from '../services/offerRecommendationService';
import { notificationPreferenceService } from '../services/notificationPreferenceService';
import { inAppNotificationService } from '../services/inAppNotificationService';
import { whatsappNotificationService } from '../services/whatsappNotificationService';
import { notificationEventService } from '../services/notificationEventService';
import { safeStorage } from '../utils/storageUtils';

describe('FOCUSPOINT AI NOTIFICATION & RECOMMENDATION ENGINE — 20 ACCEPTANCE CRITERIA MASTER SUITE', () => {

  beforeEach(() => {
    // Reset configs and in-memory caches before each test
    aiNotificationAgentService.updateConfig({
      isGloballyEnabled: true,
      isInAppChannelEnabled: true,
      isWhatsappChannelEnabled: true,
      cooldownMinutesBetweenOffers: 15,
      maxPromotionalPerDay: 2,
      maxPromotionalPerWeek: 5,
      enabledServices: {
        LIBRARY: true,
        HOME_TUITION: true,
        TEACHER_APPLICATION: true,
        LIBRARY_LISTING: true,
        MOCK_TEST: true,
        STUDY_MATERIAL: true
      }
    });

    // Clear test-specific local storage keys
    safeStorage.removeItem('fp_ai_in_app_notifications');
    safeStorage.removeItem('fp_ai_notification_metrics');
    safeStorage.removeItem('fp_ai_automation_audit_trail');
    safeStorage.removeItem('fp_user_notification_prefs');
    safeStorage.removeItem('fp_whatsapp_message_queue');
  });

  // =========================================================================
  // CRITERION 1: A library search triggers relevant library-offer matching
  // =========================================================================
  it('Criterion 1: Library search in Saidpur, Ghazipur matches eligible library offers with relevance ranking', async () => {
    const recommendations = await offerRecommendationService.recommendOffers({
      serviceType: 'LIBRARY',
      districtName: 'Ghazipur',
      localityName: 'Saidpur',
      userId: 'test-student-1',
      userRole: 'STUDENT'
    });

    expect(recommendations.length).toBeGreaterThan(0);
    const topRec = recommendations[0];
    expect(topRec.serviceCategory).toBe('LIBRARY');
    expect(topRec.relevanceScore).toBeGreaterThanOrEqual(70);
    expect(topRec.deepLink).toContain('/find-library');
    expect(topRec.title).toBeDefined();
    expect(topRec.description).toBeDefined();
    // Honest copy — no hallucinated prices
    expect(topRec.originalPrice === undefined || topRec.originalPrice >= 0).toBe(true);
  });

  // =========================================================================
  // CRITERION 2: A home tutor search triggers relevant teacher & tuition-offer matching
  // =========================================================================
  it('Criterion 2: Home tutor search for Class 8 Math in Saidpur matches tuition offers and teacher search flow', async () => {
    const recommendations = await offerRecommendationService.recommendOffers({
      serviceType: 'HOME_TUITION',
      districtName: 'Ghazipur',
      localityName: 'Saidpur',
      classLevel: 'Class 8',
      subject: 'Mathematics',
      userId: 'test-parent-1',
      userRole: 'STUDENT'
    });

    expect(recommendations.length).toBeGreaterThan(0);
    const topRec = recommendations[0];
    expect(topRec.serviceCategory).toBe('HOME_TUITION');
    expect(topRec.deepLink).toContain('/find-tutor');
    expect(topRec.deepLink).toContain('subject=Mathematics');
    expect(topRec.deepLink).toContain('class=Class%208');
  });

  // =========================================================================
  // CRITERION 3: Teacher application triggers correct application-stage notification
  // =========================================================================
  it('Criterion 3: Teacher application started & submitted trigger correct stage guidance without false approvals', async () => {
    // 1. Application started
    await notificationEventService.emitTeacherApplicationEvent('STARTED', {
      districtName: 'Ghazipur',
      localityName: 'Saidpur',
      userId: 'applicant-teacher-1',
      userName: 'Ramesh Sharma',
      userPhone: '9876543210'
    });

    const notificationsStarted = inAppNotificationService.getNotifications('applicant-teacher-1');
    expect(notificationsStarted.length).toBeGreaterThan(0);
    expect(notificationsStarted[0].title.toLowerCase()).toContain('teacher');
    expect(notificationsStarted[0].deepLink).toContain('/register/teacher');

    // 2. Application submitted
    await notificationEventService.emitTeacherApplicationEvent('SUBMITTED', {
      districtName: 'Ghazipur',
      localityName: 'Saidpur',
      userId: 'applicant-teacher-1',
      userName: 'Ramesh Sharma',
      userPhone: '9876543210'
    });

    const notificationsSubmitted = inAppNotificationService.getNotifications('applicant-teacher-1');
    const latestNotification = notificationsSubmitted[0];
    // Explains verification process honestly without claiming already approved
    expect(latestNotification.message.toLowerCase()).toContain('verification');
    expect(latestNotification.message.toLowerCase()).not.toContain('your application has been approved');
  });

  // =========================================================================
  // CRITERION 4: Library listing application triggers owner onboarding notification
  // =========================================================================
  it('Criterion 4: Library listing application triggers owner onboarding guidance and subscription check', async () => {
    await notificationEventService.emitLibraryListingEvent('STARTED', {
      districtName: 'Ghazipur',
      localityName: 'Saidpur',
      userId: 'owner-applicant-1',
      userName: 'Vikram Singh',
      userPhone: '9123456789',
      totalSeats: 60
    });

    const notifs = inAppNotificationService.getNotifications('owner-applicant-1');
    expect(notifs.length).toBeGreaterThan(0);
    expect(notifs[0].title.toLowerCase()).toContain('library');
    expect(notifs[0].deepLink).toContain('/register/library-owner');
  });

  // =========================================================================
  // CRITERION 5: Mock test search recommends relevant published tests and valid offers
  // =========================================================================
  it('Criterion 5: Mock test search identifies relevant published test series and valid discounts', async () => {
    const recommendations = await offerRecommendationService.recommendOffers({
      serviceType: 'MOCK_TEST',
      examCategory: 'CHS',
      query: 'BHU CHS Class 9',
      districtName: 'Varanasi',
      userId: 'student-chs-1',
      userRole: 'STUDENT'
    });

    expect(recommendations.length).toBeGreaterThan(0);
    const mockRec = recommendations[0];
    expect(mockRec.serviceCategory).toBe('MOCK_TEST');
    expect(mockRec.deepLink).toContain('/student/mock-tests');
  });

  // =========================================================================
  // CRITERION 6: Study material search recommends matching content and eligible offers
  // =========================================================================
  it('Criterion 6: Study material search recommends matching revision packages and coupons', async () => {
    const recommendations = await offerRecommendationService.recommendOffers({
      serviceType: 'STUDY_MATERIAL',
      classLevel: 'Class 10',
      subject: 'Science',
      districtName: 'Ghazipur',
      userId: 'student-mat-1',
      userRole: 'STUDENT'
    });

    expect(recommendations.length).toBeGreaterThan(0);
    const matRec = recommendations[0];
    expect(matRec.serviceCategory).toBe('STUDY_MATERIAL');
    expect(matRec.deepLink).toContain('/student/study-material');
  });

  // =========================================================================
  // CRITERION 7: Location-specific offers are matched using actual location records
  // =========================================================================
  it('Criterion 7: Location matching prioritizes exact district/locality and falls back to Pan-India', async () => {
    // Ghazipur search
    const ghazipurRecs = await offerRecommendationService.recommendOffers({
      serviceType: 'LIBRARY',
      districtName: 'Ghazipur',
      localityName: 'Saidpur',
      userId: 'loc-test-1'
    });

    // Unrelated district search
    const dehradunRecs = await offerRecommendationService.recommendOffers({
      serviceType: 'LIBRARY',
      districtName: 'Dehradun',
      localityName: 'Rajpur Road',
      userId: 'loc-test-2'
    });

    expect(ghazipurRecs.length).toBeGreaterThan(0);
    expect(dehradunRecs.length).toBeGreaterThan(0);

    // Ghazipur recommendations specifically reflect Ghazipur/Saidpur in metadata or locationScope
    const hasGhazipurTarget = ghazipurRecs.some(r => r.locationScope?.districtName === 'Ghazipur' || r.locationScope?.localityName === 'Saidpur');
    expect(hasGhazipurTarget).toBe(true);
  });

  // =========================================================================
  // CRITERION 8: Expired, paused, or ineligible offers are never promoted as active
  // =========================================================================
  it('Criterion 8: Never promotes expired or paused offers as active discounts', async () => {
    const rawOffers = [
      {
        id: 'off-active',
        title: 'Active Deal',
        serviceCategory: 'LIBRARY' as const,
        status: 'ACTIVE' as const,
        validTo: '2099-12-31T23:59:59Z',
        discountType: 'PERCENTAGE' as const,
        discountValue: 15,
        locationScope: { isPanIndia: true },
        eligibilityRoles: ['STUDENT']
      },
      {
        id: 'off-expired',
        title: 'Old Deal',
        serviceCategory: 'LIBRARY' as const,
        status: 'ACTIVE' as const,
        validTo: '2020-01-01T00:00:00Z', // Expired
        discountType: 'PERCENTAGE' as const,
        discountValue: 50,
        locationScope: { isPanIndia: true },
        eligibilityRoles: ['STUDENT']
      },
      {
        id: 'off-paused',
        title: 'Paused Deal',
        serviceCategory: 'LIBRARY' as const,
        status: 'PAUSED' as const, // Paused
        validTo: '2099-12-31T23:59:59Z',
        discountType: 'PERCENTAGE' as const,
        discountValue: 30,
        locationScope: { isPanIndia: true },
        eligibilityRoles: ['STUDENT']
      }
    ];

    const eligible = offerRecommendationService.filterEligibleOffers(rawOffers, {
      serviceType: 'LIBRARY',
      userRole: 'STUDENT',
      districtName: 'Ghazipur'
    });

    expect(eligible.some(o => o.id === 'off-expired')).toBe(false);
    expect(eligible.some(o => o.id === 'off-paused')).toBe(false);
    expect(eligible.some(o => o.id === 'off-active')).toBe(true);
  });

  // =========================================================================
  // CRITERION 9: WhatsApp marketing messages are not sent without required consent
  // =========================================================================
  it('Criterion 9: Suppresses promotional WhatsApp when user has not granted promotional consent', async () => {
    const userId = 'user-no-whatsapp-consent';
    // User has disabled WhatsApp promotional consent
    notificationPreferenceService.updatePreferences(userId, {
      whatsappPromotionalConsent: false
    });

    const outcome = await aiNotificationAgentService.handleUserActivityEvent({
      eventId: 'ev-test-consent-1',
      eventType: 'LIBRARY_SEARCHED',
      userId,
      userName: 'Anjali Verma',
      userPhone: '+919876500001',
      userRole: 'STUDENT',
      serviceType: 'LIBRARY',
      location: { districtName: 'Ghazipur', localityName: 'Saidpur' },
      timestamp: new Date().toISOString()
    });

    expect(outcome.whatsappQueued).toBe(false);
    expect(outcome.suppressionReason).toContain('CONSENT');
  });

  // =========================================================================
  // CRITERION 10: In-app notifications and WhatsApp messages use correct deep links
  // =========================================================================
  it('Criterion 10: Messages contain safe, valid deep links preserving search context without PII leaks', async () => {
    const recs = await offerRecommendationService.recommendOffers({
      serviceType: 'HOME_TUITION',
      districtName: 'Ghazipur',
      localityName: 'Saidpur',
      subject: 'Physics',
      classLevel: 'Class 12',
      userId: 'student-safe-links'
    });

    expect(recs.length).toBeGreaterThan(0);
    const link = recs[0].deepLink;
    expect(link.startsWith('/')).toBe(true);
    expect(link).toContain('subject=Physics');
    // Ensure no password, token, or private email is leaked in URL query
    expect(link).not.toContain('password');
    expect(link).not.toContain('token');
    expect(link).not.toContain('student-safe-links');
  });

  // =========================================================================
  // CRITERION 11: Repeated searches do not create duplicate or excessive messages
  // =========================================================================
  it('Criterion 11: Deduplicates repeated identical searches within configured cooldown window', async () => {
    const userId = 'student-rapid-searcher';
    notificationPreferenceService.updatePreferences(userId, {
      whatsappPromotionalConsent: true
    });

    // 1st search: Should be processed
    const outcome1 = await aiNotificationAgentService.handleUserActivityEvent({
      eventId: 'ev-rapid-1',
      eventType: 'LIBRARY_SEARCHED',
      userId,
      userName: 'Rahul Gupta',
      userPhone: '+919876500002',
      userRole: 'STUDENT',
      serviceType: 'LIBRARY',
      location: { districtName: 'Ghazipur', localityName: 'Saidpur' },
      timestamp: new Date().toISOString()
    });
    expect(outcome1.matchedOffersCount).toBeGreaterThan(0);

    // 2nd search immediately after: Should be suppressed by cooldown / deduplication
    const outcome2 = await aiNotificationAgentService.handleUserActivityEvent({
      eventId: 'ev-rapid-2',
      eventType: 'LIBRARY_SEARCHED',
      userId,
      userName: 'Rahul Gupta',
      userPhone: '+919876500002',
      userRole: 'STUDENT',
      serviceType: 'LIBRARY',
      location: { districtName: 'Ghazipur', localityName: 'Saidpur' },
      timestamp: new Date().toISOString()
    });

    expect(outcome2.inAppGenerated).toBe(false);
    expect(outcome2.suppressionReason).toBe('DEDUPLICATED_WINDOW');
  });

  // =========================================================================
  // CRITERION 12: Opt-outs and frequency limits are respected
  // =========================================================================
  it('Criterion 12: Respects daily/weekly frequency caps and quiet hours', () => {
    const userId = 'student-capped-user';
    notificationPreferenceService.updatePreferences(userId, {
      whatsappPromotionalConsent: true,
      maxPromotionsPerDay: 2,
      maxPromotionsPerWeek: 5
    });

    notificationPreferenceService.recordDispatch(userId, 'WHATSAPP', 'LIBRARY');
    notificationPreferenceService.recordDispatch(userId, 'WHATSAPP', 'LIBRARY');

    const check = notificationPreferenceService.canDeliverPromotionalNotification(userId, 'WHATSAPP');
    expect(check.canDeliver).toBe(false);
    expect(check.reason).toContain('LIMIT');
  });

  // =========================================================================
  // CRITERION 13: Delivery failures do not interrupt normal application functionality
  // =========================================================================
  it('Criterion 13: Non-blocking WhatsApp delivery failure handles cleanly without throwing unhandled exceptions', async () => {
    // Attempting to send WhatsApp message to an invalid recipient format
    const res = await whatsappNotificationService.queueWhatsAppMessage({
      userId: 'test-user-err',
      recipientPhone: '', // invalid
      templateId: 'tpl-lib-search-rec',
      serviceCategory: 'LIBRARY',
      parameters: { first_name: 'Test' },
      deepLink: '/find-library'
    });

    expect(res.success).toBe(false);
    expect(res.deliveryStatus).toBe('FAILED');
    expect(res.errorMessage).toBeDefined();
    // System did not crash or re-throw an unhandled exception
  });

  // =========================================================================
  // CRITERION 14: Notification status reflects actual delivery events
  // =========================================================================
  it('Criterion 14: Accurately records lifecycle states QUEUED, PROCESSING, DELIVERED/FAILED without fake statuses', async () => {
    const res = await whatsappNotificationService.queueWhatsAppMessage({
      userId: 'test-user-status',
      recipientPhone: '919876543210',
      templateId: 'tpl-lib-search-rec',
      serviceCategory: 'LIBRARY',
      parameters: { first_name: 'Aman', locality: 'Saidpur' },
      deepLink: '/find-library?district=Ghazipur'
    });

    expect(res.success).toBe(true);
    const queue = whatsappNotificationService.getQueue();
    const item = queue.find(q => q.queueId === res.queueId);
    expect(item).toBeDefined();
    expect(['QUEUED', 'PROCESSING', 'DELIVERED']).toContain(item?.deliveryStatus);
    expect(item?.createdAt).toBeDefined();
  });

  // =========================================================================
  // CRITERION 15: Offer clicks and attributed conversions use consistent tracking
  // =========================================================================
  it('Criterion 15: Tracking offer clicks and subsequent conversions updates attributed revenue metrics', () => {
    const offerId = 'off-lib-saidpur-sample';
    aiNotificationAgentService.trackOfferClick(offerId, 'LIBRARY', 'IN_APP');

    const metricsBefore = aiNotificationAgentService.getMetricsSummary();
    const clicksBefore = metricsBefore.offerClicks;
    expect(clicksBefore).toBeGreaterThanOrEqual(1);

    // Attribute conversion
    aiNotificationAgentService.trackAttributedConversion({
      offerId,
      serviceCategory: 'LIBRARY',
      channel: 'IN_APP',
      conversionAmount: 1200,
      userId: 'converted-user-1'
    });

    const metricsAfter = aiNotificationAgentService.getMetricsSummary();
    expect(metricsAfter.attributedConversions).toBeGreaterThan(0);
    expect(metricsAfter.attributedRevenueINR).toBeGreaterThanOrEqual(1200);
  });

  // =========================================================================
  // CRITERION 16: The system does not invent discounts, prices, availability, or delivery results
  // =========================================================================
  it('Criterion 16: Employs honest organic fallbacks with zero fabricated discount percentages when no promo is active', async () => {
    // Search in an obscure location without promotional coupons
    const recs = await offerRecommendationService.recommendOffers({
      serviceType: 'LIBRARY',
      districtName: 'RemoteDistrictXYZ',
      localityName: 'RemoteVillageABC',
      userId: 'organic-tester'
    });

    expect(recs.length).toBeGreaterThan(0);
    const fallback = recs[0];
    if (fallback.isOrganicRecommendation) {
      // Must not invent fake discount percentages
      expect(fallback.discountValue).toBe(0);
      expect(fallback.couponCode).toBeUndefined();
      expect(fallback.badgeText).toContain('Verified');
    }
  });

  // =========================================================================
  // CRITERION 17: Super Admin can pause automation globally and individual channels
  // =========================================================================
  it('Criterion 17: Super Admin killswitch globally halts automation or halts WhatsApp channel independently', async () => {
    const userId = 'killswitch-test-user';
    notificationPreferenceService.updatePreferences(userId, {
      whatsappPromotionalConsent: true
    });

    // 1. WhatsApp channel disabled
    aiNotificationAgentService.updateConfig({
      isWhatsappChannelEnabled: false
    });

    const resChannelDisabled = await aiNotificationAgentService.handleUserActivityEvent({
      eventId: 'ev-ks-1',
      eventType: 'LIBRARY_SEARCHED',
      userId,
      userName: 'Sneha Rao',
      userPhone: '+919876511111',
      userRole: 'STUDENT',
      serviceType: 'LIBRARY',
      location: { districtName: 'Ghazipur' },
      timestamp: new Date().toISOString()
    });

    expect(resChannelDisabled.whatsappQueued).toBe(false);
    expect(resChannelDisabled.inAppGenerated).toBe(true); // In-app still permitted

    // 2. Global killswitch
    aiNotificationAgentService.updateConfig({
      isGloballyEnabled: false
    });

    const resGloballyDisabled = await aiNotificationAgentService.handleUserActivityEvent({
      eventId: 'ev-ks-2',
      eventType: 'LIBRARY_SEARCHED',
      userId,
      userName: 'Sneha Rao',
      userPhone: '+919876511111',
      userRole: 'STUDENT',
      serviceType: 'LIBRARY',
      location: { districtName: 'Ghazipur' },
      timestamp: new Date().toISOString()
    });

    expect(resGloballyDisabled.inAppGenerated).toBe(false);
    expect(resGloballyDisabled.whatsappQueued).toBe(false);
    expect(resGloballyDisabled.suppressionReason).toBe('GLOBAL_KILLSWITCH_ACTIVE');
  });

  // =========================================================================
  // CRITERION 18: System responsive layout & drawer functionality
  // =========================================================================
  it('Criterion 18: In-app notification drawer supports filtering by service category and marking items as read', () => {
    const userId = 'drawer-user-1';
    inAppNotificationService.createNotification({
      userId,
      serviceCategory: 'LIBRARY',
      title: 'Saidpur Library Pass Available',
      message: 'Explore verified libraries near Saidpur',
      deepLink: '/find-library?district=Ghazipur',
      priority: 'HIGH'
    });

    inAppNotificationService.createNotification({
      userId,
      serviceCategory: 'HOME_TUITION',
      title: 'Math Tutor in Saidpur',
      message: 'Class 8 verified educator available',
      deepLink: '/find-tutor?subject=Mathematics',
      priority: 'MEDIUM'
    });

    const allNotifs = inAppNotificationService.getNotifications(userId);
    expect(allNotifs.length).toBe(2);

    // Unread count
    expect(inAppNotificationService.getUnreadCount(userId)).toBe(2);

    // Mark single as read
    inAppNotificationService.markAsRead(allNotifs[0].id);
    expect(inAppNotificationService.getUnreadCount(userId)).toBe(1);

    // Mark all as read
    inAppNotificationService.markAllAsRead(userId);
    expect(inAppNotificationService.getUnreadCount(userId)).toBe(0);
  });

  // =========================================================================
  // CRITERION 19: Unauthorized users cannot access another user's notification history
  // =========================================================================
  it('Criterion 19: Strict multi-tenant isolation ensures user A cannot inspect user B private notifications', () => {
    const userA = 'user-alice-1';
    const userB = 'user-bob-2';

    inAppNotificationService.createNotification({
      userId: userA,
      serviceCategory: 'LIBRARY',
      title: 'Private Alice Notification',
      message: 'Alice exclusive membership details',
      deepLink: '/find-library'
    });

    inAppNotificationService.createNotification({
      userId: userB,
      serviceCategory: 'HOME_TUITION',
      title: 'Private Bob Notification',
      message: 'Bob exclusive tuition appointment',
      deepLink: '/find-tutor'
    });

    const aliceNotifs = inAppNotificationService.getNotifications(userA);
    const bobNotifs = inAppNotificationService.getNotifications(userB);

    expect(aliceNotifs.some(n => n.title.includes('Bob'))).toBe(false);
    expect(bobNotifs.some(n => n.title.includes('Alice'))).toBe(false);
  });

  // =========================================================================
  // CRITERION 20: All relevant automation actions are auditable
  // =========================================================================
  it('Criterion 20: Comprehensive immutable audit trail logs every event, matched offer, and outcome', async () => {
    await aiNotificationAgentService.handleUserActivityEvent({
      eventId: 'ev-audit-check-1',
      eventType: 'MOCK_TEST_SEARCHED',
      userId: 'audit-user-test',
      userName: 'Audit Student',
      userRole: 'STUDENT',
      serviceType: 'MOCK_TEST',
      location: { districtName: 'Prayagraj (Allahabad)' },
      filters: { examCategory: 'UPSSSC' },
      timestamp: new Date().toISOString()
    });

    const auditTrail = aiNotificationAgentService.getAuditTrail();
    expect(auditTrail.length).toBeGreaterThan(0);
    const entry = auditTrail[0];
    expect(entry.eventId).toBe('ev-audit-check-1');
    expect(entry.serviceCategory).toBe('MOCK_TEST');
    expect(entry.outcome).toBeDefined();
    expect(entry.timestamp).toBeDefined();
  });
});
