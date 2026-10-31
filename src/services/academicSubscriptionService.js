const db = require('../db/database');
const crypto = require('crypto');

class AcademicSubscriptionService {
  /**
   * 6-Tier Priority Pricing Resolution Engine
   * Hierarchy: STUDENT (6) > TEACHER (5) > LIBRARY (4) > DISTRICT (3) > STATE (2) > PAN_INDIA (1)
   */
  resolvePrice(productId, studentId = null, districtId = null, state = null, libraryId = null, teacherId = null, couponCode = null) {
    // 1. Fetch all active pricing rules for this product ordered by priority descending
    const rules = db.prepare(`
      SELECT * FROM academic_pricing_rules
      WHERE product_id = ? AND is_active = 1
      ORDER BY priority DESC
    `).all(productId);

    // Default fallback base price
    let basePrice = 499;
    let resolvedRule = null;
    let appliedScope = 'PAN_INDIA';
    let discountAmount = 0;

    // Evaluate in order of priority
    for (const rule of rules) {
      if (rule.scope === 'STUDENT' && studentId && rule.target_id === studentId) {
        resolvedRule = rule;
        appliedScope = 'STUDENT';
        break;
      }
      if (rule.scope === 'TEACHER' && teacherId && rule.target_id === teacherId) {
        resolvedRule = rule;
        appliedScope = 'TEACHER';
        break;
      }
      if (rule.scope === 'LIBRARY' && libraryId && rule.target_id === libraryId) {
        resolvedRule = rule;
        appliedScope = 'LIBRARY';
        break;
      }
      if (rule.scope === 'DISTRICT' && districtId && String(rule.target_id) === String(districtId)) {
        resolvedRule = rule;
        appliedScope = 'DISTRICT';
        break;
      }
      if (rule.scope === 'STATE' && state && rule.target_id === state) {
        resolvedRule = rule;
        appliedScope = 'STATE';
        break;
      }
      if (rule.scope === 'PAN_INDIA') {
        resolvedRule = rule;
        appliedScope = 'PAN_INDIA';
        // continue in case a higher-priority match is found, but Pan-India is at bottom of sorted list
      }
    }

    if (resolvedRule) {
      basePrice = resolvedRule.base_price;
      if (resolvedRule.override_price !== null && resolvedRule.override_price !== undefined) {
        discountAmount = Math.max(0, basePrice - resolvedRule.override_price);
      } else if (resolvedRule.discount_percentage > 0) {
        discountAmount = Math.round((basePrice * resolvedRule.discount_percentage) / 100);
      }
    }

    let subtotal = Math.max(0, basePrice - discountAmount);

    // 2. Validate and apply coupon if provided
    let couponDiscount = 0;
    let couponValid = false;
    let couponError = null;

    if (couponCode) {
      const code = couponCode.trim().toUpperCase();
      if (code === 'FOCUS50') {
        if (subtotal >= 199) {
          couponDiscount = Math.min(500, Math.round(subtotal * 0.5));
          couponValid = true;
        } else {
          couponError = 'Coupon FOCUS50 requires minimum cart value of ₹199';
        }
      } else if (code === 'MOCK100') {
        if (subtotal >= 299) {
          couponDiscount = 100;
          couponValid = true;
        } else {
          couponError = 'Coupon MOCK100 requires minimum cart value of ₹299';
        }
      } else {
        couponError = 'Invalid or expired coupon code';
      }
    }

    const priceAfterCoupon = Math.max(0, subtotal - couponDiscount);
    // 18% GST standard calculation
    const taxAmount = Math.round(priceAfterCoupon * 0.18 * 100) / 100;
    const finalPrice = Math.round((priceAfterCoupon + taxAmount) * 100) / 100;

    return {
      productId,
      basePrice,
      scopeDiscount: discountAmount,
      appliedScope,
      subtotal,
      couponCode: couponValid ? couponCode.toUpperCase() : null,
      couponDiscount,
      couponValid,
      couponError,
      taxAmount,
      finalPrice
    };
  }

  /**
   * Purchase or provision an academic pass
   */
  purchaseSubscription(studentId, data) {
    const {
      productId,
      productTitle,
      productType,
      examId,
      source = 'DIRECT_PURCHASE',
      couponCode,
      districtId,
      state
    } = data;

    if (!studentId || !productId || !productTitle) {
      throw new Error('Missing required subscription fields (studentId, productId, productTitle)');
    }

    // Resolve price securely on server side (prevent frontend price tampering)
    const pricing = this.resolvePrice(productId, studentId, districtId, state, null, null, couponCode);

    const subscriptionId = `sub-${crypto.randomUUID()}`;
    const orderId = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Validity: 365 days for annual pass, 30 days for monthly
    const now = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(now.getDate() + 365);

    const features = JSON.stringify([
      'Full Mock Tests & Previous Year Papers (PYQ)',
      'AI-Powered Subject & Weakness Intelligence',
      'Personal Mistake Book with Unlimited Retries',
      'Detailed Video Solutions & Formula Sheets'
    ]);

    db.prepare(`
      INSERT INTO academic_subscriptions
      (id, student_id, product_type, product_id, product_title, exam_id, base_price, discount_amount, coupon_code, tax_amount, final_price, source, status, features, started_at, expires_at, order_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?, CURRENT_TIMESTAMP, ?, ?)
    `).run(
      subscriptionId,
      studentId,
      productType || 'EXAM_PASS',
      productId,
      productTitle,
      examId || null,
      pricing.basePrice,
      pricing.scopeDiscount + pricing.couponDiscount,
      pricing.couponCode,
      pricing.taxAmount,
      pricing.finalPrice,
      source,
      features,
      expiryDate.toISOString(),
      orderId
    );

    return {
      success: true,
      subscriptionId,
      orderId,
      status: 'ACTIVE',
      finalPrice: pricing.finalPrice,
      expiresAt: expiryDate.toISOString(),
      message: 'Subscription successfully activated.'
    };
  }

  /**
   * Get student's active passes and entitlement status
   */
  getStudentSubscriptions(studentId) {
    const subs = db.prepare(`
      SELECT asub.*, ge.title as exam_title
      FROM academic_subscriptions asub
      LEFT JOIN government_exams ge ON asub.exam_id = ge.id
      WHERE asub.student_id = ?
      ORDER BY asub.created_at DESC
    `).all(studentId);

    const now = new Date();

    return subs.map(s => {
      const expiry = new Date(s.expires_at);
      const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

      let currentStatus = s.status;
      if (diffDays <= 0) {
        currentStatus = 'EXPIRED';
      } else if (diffDays <= 7 && currentStatus === 'ACTIVE') {
        currentStatus = 'EXPIRING_SOON';
      }

      return {
        ...s,
        status: currentStatus,
        daysRemaining: Math.max(0, diffDays),
        features: JSON.parse(s.features || '[]')
      };
    });
  }

  /**
   * Central Entitlement Evaluation
   * Non-destructive policy: historical records remain viewable even after expiration!
   */
  checkEntitlement(studentId, feature) {
    const activePass = db.prepare(`
      SELECT * FROM academic_subscriptions 
      WHERE student_id = ? AND expires_at > CURRENT_TIMESTAMP AND status != 'CANCELLED'
      LIMIT 1
    `).get(studentId);

    const hasActiveSubscription = Boolean(activePass);

    // If historical data check, always permit
    if (feature === 'VIEW_HISTORY' || feature === 'VIEW_MISTAKE_ARCHIVE') {
      return { allowed: true, reason: 'Historical data is permanently accessible.' };
    }

    if (!hasActiveSubscription) {
      return {
        allowed: false,
        requiresSubscription: true,
        reason: 'Active academic subscription pass required to attempt new mock tests or launch live practice.'
      };
    }

    return { allowed: true, pass: activePass };
  }
}

module.exports = new AcademicSubscriptionService();
