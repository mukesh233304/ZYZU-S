// FOCUSPOINT Central Academic Entitlement & Subscription Authority
// Evaluates access, enforces expiry locks (preserving historical data), and provisions entitlements

import { 
  StudentSubscription, 
  EntitlementFeature, 
  EntitlementEvaluationResult, 
  ExpiryNotification, 
  ResolvedPriceResult 
} from '../types/eligibilityAndPricing';
import { INITIAL_STUDENT_SUBSCRIPTIONS } from '../mock/data/eligibilityAndPricingData';
import { pricingResolutionService } from './pricingResolutionService';
import { mockStore } from '../mock/store';

const SUBSCRIPTIONS_STORAGE_KEY = 'focuspoint_student_subscriptions';

export interface AcademicBusinessMetrics {
  studyMaterial: {
    totalSold: number;
    revenue: number;
    activeEntitlements: number;
    expiredEntitlements: number;
  };
  mockTests: {
    totalSold: number;
    activeSubscriptions: number;
    expiredSubscriptions: number;
    renewals: number;
    revenue: number;
  };
  growingIntelligence: {
    activeSubscriptions: number;
    revenue: number;
  };
  mistakeBook: {
    activeSubscriptions: number;
    revenue: number;
  };
  completePackages: {
    active: number;
    revenue: number;
  };
  totalAcademicGrossRevenue: number;
}

class AcademicEntitlementService {
  private subscriptions: StudentSubscription[] = [];
  private processedPaymentIds: Set<string> = new Set();
  private listeners: (() => void)[] = [];

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    try {
      const saved = localStorage.getItem(SUBSCRIPTIONS_STORAGE_KEY);
      this.subscriptions = saved ? JSON.parse(saved) : [...INITIAL_STUDENT_SUBSCRIPTIONS];
    } catch {
      this.subscriptions = [...INITIAL_STUDENT_SUBSCRIPTIONS];
    }
  }

  private saveData(): void {
    try {
      localStorage.setItem(SUBSCRIPTIONS_STORAGE_KEY, JSON.stringify(this.subscriptions));
      this.notifyListeners();
    } catch (e) {
      console.error('Failed to persist subscriptions', e);
    }
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(cb => cb());
  }

  // Get all subscriptions for student
  public getStudentSubscriptions(studentId: string): StudentSubscription[] {
    const today = new Date().toISOString().split('T')[0];
    return this.subscriptions
      .filter(s => s.studentId === studentId)
      .map(s => {
        // Dynamic status check based on date
        if (s.status === 'ACTIVE' && s.endDate < today) {
          return { ...s, status: 'EXPIRED' as const };
        }
        return s;
      });
  }

  // Central Access Authority: Does Student X have access to Feature Y?
  public evaluateAccess(
    studentId: string, 
    feature: EntitlementFeature, 
    examId?: string
  ): EntitlementEvaluationResult {
    const studentSubs = this.getStudentSubscriptions(studentId);
    const today = new Date().toISOString().split('T')[0];

    // Find any matching active subscription
    const activeSub = studentSubs.find(s => {
      if (s.status !== 'ACTIVE' || s.endDate < today) return false;
      if (!s.features.includes(feature)) return false;

      // If exam specific, check exam match or 'ALL'
      if (examId && s.examId && s.examId !== 'ALL' && s.examId !== examId) {
        return false;
      }
      return true;
    });

    if (activeSub) {
      const end = new Date(activeSub.endDate).getTime();
      const now = new Date(today).getTime();
      const daysRemaining = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));

      return {
        hasAccess: true,
        accessState: 'AVAILABLE',
        reason: `Active entitlement via ${activeSub.productName} (${daysRemaining} days remaining).`,
        matchingSubscription: activeSub,
        daysRemaining,
        isExpiringSoon: daysRemaining <= 7
      };
    }

    // Check if previously subscribed but now expired
    const expiredSub = studentSubs.find(s => {
      if (!s.features.includes(feature)) return false;
      if (examId && s.examId && s.examId !== 'ALL' && s.examId !== examId) return false;
      return s.status === 'EXPIRED' || s.endDate < today;
    });

    if (expiredSub) {
      return {
        hasAccess: false,
        accessState: 'EXPIRED',
        reason: `Subscription for ${expiredSub.productName} expired on ${expiredSub.endDate}. Historical records preserved. Please renew to resume live access.`,
        matchingSubscription: expiredSub,
        daysRemaining: 0,
        isExpiringSoon: false
      };
    }

    return {
      hasAccess: false,
      accessState: 'ELIGIBLE_SUBSCRIPTION_REQUIRED',
      reason: 'Paid subscription required to access this feature.',
      daysRemaining: 0,
      isExpiringSoon: false
    };
  }

  // Expiry Notifications for Student (7 days, 3 days, 1 day, expired)
  public getExpiryNotifications(studentId: string): ExpiryNotification[] {
    const studentSubs = this.getStudentSubscriptions(studentId);
    const today = new Date().toISOString().split('T')[0];
    const notifications: ExpiryNotification[] = [];

    studentSubs.forEach(sub => {
      const end = new Date(sub.endDate).getTime();
      const now = new Date(today).getTime();
      const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) {
        notifications.push({
          id: `notif-exp-${sub.id}`,
          studentId,
          subscriptionId: sub.id,
          productName: sub.productName,
          type: 'EXPIRED',
          message: `Your ${sub.productName} has expired. Renew now to continue uninterrupted preparation.`,
          daysRemaining: 0,
          timestamp: sub.endDate,
          isRead: false
        });
      } else if (diffDays === 1) {
        notifications.push({
          id: `notif-1d-${sub.id}`,
          studentId,
          subscriptionId: sub.id,
          productName: sub.productName,
          type: '1_DAY',
          message: `Your ${sub.productName} expires tomorrow.`,
          daysRemaining: 1,
          timestamp: today,
          isRead: false
        });
      } else if (diffDays <= 3) {
        notifications.push({
          id: `notif-3d-${sub.id}`,
          studentId,
          subscriptionId: sub.id,
          productName: sub.productName,
          type: '3_DAYS',
          message: `Your ${sub.productName} expires in ${diffDays} days.`,
          daysRemaining: diffDays,
          timestamp: today,
          isRead: false
        });
      } else if (diffDays <= 7) {
        notifications.push({
          id: `notif-7d-${sub.id}`,
          studentId,
          subscriptionId: sub.id,
          productName: sub.productName,
          type: '7_DAYS',
          message: `Your ${sub.productName} expires in ${diffDays} days.`,
          daysRemaining: diffDays,
          timestamp: today,
          isRead: false
        });
      }
    });

    return notifications;
  }

  // Idempotent Purchase / Subscription Activation
  public activatePurchase(
    studentId: string,
    studentName: string,
    pricingResult: ResolvedPriceResult,
    paymentId: string
  ): { success: boolean; subscription?: StudentSubscription; error?: string } {
    // Idempotency check: prevent double subscription creation on re-attempts
    if (this.processedPaymentIds.has(paymentId)) {
      const existing = this.subscriptions.find(s => s.paymentId === paymentId);
      return { success: true, subscription: existing };
    }

    const product = pricingResolutionService.getProductById(pricingResult.productId);
    if (!product) {
      return { success: false, error: 'Invalid product selected.' };
    }

    const startDate = new Date().toISOString().split('T')[0];
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + (product.durationDays || 30));
    const endDate = expiryDate.toISOString().split('T')[0];

    const newSub: StudentSubscription = {
      id: `sub-${Date.now()}`,
      studentId,
      studentName,
      productId: product.id,
      productName: product.name,
      productType: product.type,
      examId: product.examId,
      examName: product.examName,
      source: 'DIRECT_PURCHASE',
      startDate,
      endDate,
      status: 'ACTIVE',
      features: [...product.featuresIncluded],
      pricingRuleId: pricingResult.pricingRuleId,
      pricingScope: pricingResult.appliedScope,
      originalPrice: pricingResult.basePrice,
      discount: pricingResult.scopeDiscount + (pricingResult.couponDiscount || 0),
      finalPaidAmount: pricingResult.payableTotal,
      paymentId,
      invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    (newSub as any).couponCode = pricingResult.couponCode;
    (newSub as any).couponDiscount = pricingResult.couponDiscount;
    (newSub as any).scopeDiscount = pricingResult.scopeDiscount;

    this.processedPaymentIds.add(paymentId);
    this.subscriptions.unshift(newSub);
    this.saveData();

    // Auto-generate and persist Official Fee Receipt in Document Center
    try {
      const cleanId = newSub.id.replace(/^sub-/, '');
      const docNumber = `FP-SUB-${cleanId.toUpperCase()}`;
      const couponDisc = pricingResult.couponDiscount || 0;
      const generalDisc = Math.max(0, (newSub.discount || 0) - couponDisc);

      const receiptDoc: any = {
        id: `doc-${docNumber}`,
        documentNumber: docNumber,
        title: `Subscription Fee Receipt — ${product.name}`,
        category: 'SUBSCRIPTION',
        documentType: 'PAYMENT_INVOICE',
        recipientId: studentId,
        recipientName: studentName,
        recipientRole: 'STUDENT',
        district: 'Uttar Pradesh',
        state: 'Uttar Pradesh',
        authorizedBy: 'FocusPoint Digital Learning & Exam Center',
        authorizedRole: 'SUPER_ADMIN',
        qrVerificationUrl: `https://focuspoint.org.in/verify/doc/${docNumber}`,
        qrVerificationHash: `SHA256-SUB-${cleanId}-VERIFIED`,
        version: 1,
        isCurrent: true,
        issueDate: startDate,
        validUntil: endDate,
        status: 'READY',
        paymentStatus: 'PAID',
        amount: pricingResult.payableTotal,
        originalAmount: pricingResult.basePrice,
        couponCode: pricingResult.couponCode,
        couponDiscount: couponDisc,
        offerDiscount: generalDisc,
        currency: 'INR',
        paymentMethod: 'Online Prepaid (Instant Clearing)',
        paymentId: paymentId,
        transactionId: paymentId,
        transactionRef: `UPI/FP/SUB/${cleanId}`,
        billingPeriod: `${startDate} to ${endDate}`,
        lineItems: [
          { label: `Digital Learning Subscription: ${product.name}`, amount: pricingResult.basePrice },
          ...(generalDisc > 0 ? [{ label: 'Scholar / Priority Quota Concession', amount: -generalDisc, isDeduction: true }] : []),
          ...(couponDisc > 0 ? [{ label: `Promo Coupon Applied (${pricingResult.couponCode})`, amount: -couponDisc, isDeduction: true }] : []),
          { label: 'Educational GST (Exempted Under Indian Education Norms)', amount: 0 },
          { label: 'Reconciled Settlement in Full (Zero Dues)', amount: pricingResult.payableTotal, isHighlight: true }
        ],
        metadata: {
          invoiceNumber: newSub.invoiceNumber,
          planName: product.name,
          couponCode: pricingResult.couponCode,
          couponDiscount: couponDisc,
          originalAmount: pricingResult.basePrice,
          finalAmount: pricingResult.payableTotal,
        },
        auditTrail: [{ action: 'GENERATED', timestamp: new Date().toISOString(), performedBy: 'Subscription Gateway', performedByRole: 'SYSTEM' }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      mockStore.addUnifiedDocument(receiptDoc);
    } catch (e) {
      console.error('Failed to auto-archive subscription receipt document', e);
    }

    return { success: true, subscription: newSub };
  }

  // Super Admin: Provision Library Subscription Entitlement (30-day seat booking)
  public provisionLibraryEntitlement(
    studentId: string,
    studentName: string,
    libraryId: string,
    libraryName: string,
    planFeatures: EntitlementFeature[] = ['STUDY_MATERIAL', 'PERFORMANCE_ANALYTICS']
  ): StudentSubscription {
    const startDate = new Date().toISOString().split('T')[0];
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);
    const endDate = expiry.toISOString().split('T')[0];

    const libSub: StudentSubscription = {
      id: `sub-lib-${Date.now()}`,
      studentId,
      studentName,
      productId: 'prod-lib-app-entitlement',
      productName: `Library App Access (${libraryName})`,
      productType: 'STUDY_MATERIAL_SUBSCRIPTION',
      source: 'LIBRARY_BOOKING',
      libraryId,
      libraryName,
      startDate,
      endDate,
      status: 'ACTIVE',
      features: planFeatures,
      originalPrice: 499,
      discount: 499,
      finalPaidAmount: 0,
      invoiceNumber: `INV-LIB-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.subscriptions.unshift(libSub);
    this.saveData();
    return libSub;
  }

  // Super Admin Business Intelligence Metrics
  public getAcademicBusinessMetrics(): AcademicBusinessMetrics {
    const today = new Date().toISOString().split('T')[0];

    let studyMatSold = 0;
    let studyMatRev = 0;
    let studyMatActive = 0;
    let studyMatExpired = 0;

    let mockSold = 0;
    let mockRev = 0;
    let mockActive = 0;
    let mockExpired = 0;
    let mockRenewals = 0;

    let growthActive = 0;
    let growthRev = 0;

    let mistakeActive = 0;
    let mistakeRev = 0;

    let bundleActive = 0;
    let bundleRev = 0;

    this.subscriptions.forEach(s => {
      const isActive = s.status === 'ACTIVE' && s.endDate >= today;

      if (s.productType === 'STUDY_MATERIAL_SUBSCRIPTION') {
        studyMatSold++;
        studyMatRev += s.finalPaidAmount;
        if (isActive) studyMatActive++; else studyMatExpired++;
      } else if (s.productType === 'MOCK_TEST_SUBSCRIPTION') {
        mockSold++;
        mockRev += s.finalPaidAmount;
        if (isActive) mockActive++; else mockExpired++;
        if (s.finalPaidAmount > 0 && s.source === 'DIRECT_PURCHASE') mockRenewals++;
      } else if (s.productType === 'GROWING_INTELLIGENCE') {
        if (isActive) growthActive++;
        growthRev += s.finalPaidAmount;
      } else if (s.productType === 'MISTAKE_BOOK') {
        if (isActive) mistakeActive++;
        mistakeRev += s.finalPaidAmount;
      } else if (s.productType === 'COMPLETE_PACKAGE' || s.productType === 'EXAM_PACKAGE') {
        if (isActive) bundleActive++;
        bundleRev += s.finalPaidAmount;
      }
    });

    return {
      studyMaterial: {
        totalSold: studyMatSold,
        revenue: studyMatRev,
        activeEntitlements: studyMatActive,
        expiredEntitlements: studyMatExpired
      },
      mockTests: {
        totalSold: mockSold,
        revenue: mockRev,
        activeSubscriptions: mockActive,
        expiredSubscriptions: mockExpired,
        renewals: mockRenewals
      },
      growingIntelligence: {
        activeSubscriptions: growthActive,
        revenue: growthRev
      },
      mistakeBook: {
        activeSubscriptions: mistakeActive,
        revenue: mistakeRev
      },
      completePackages: {
        active: bundleActive,
        revenue: bundleRev
      },
      totalAcademicGrossRevenue: studyMatRev + mockRev + growthRev + mistakeRev + bundleRev
    };
  }

  public getBusinessMetrics(): AcademicBusinessMetrics {
    return this.getAcademicBusinessMetrics();
  }

  public getAllSubscriptions(): StudentSubscription[] {
    return [...this.subscriptions];
  }
}

export const academicEntitlementService = new AcademicEntitlementService();
