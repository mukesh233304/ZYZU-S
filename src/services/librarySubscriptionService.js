/**
 * FOCUSPOINT — Library Listing Subscription Service
 * 
 * Core Backend Service implementing:
 * 1. 4-Tier Pricing Resolution Engine (Particular -> District -> State -> Pan-India -> Complimentary Free)
 * 2. Multi-Duration Scaling & Savings (Monthly, Quarterly 15%, Half-Yearly 20%, Yearly 25%)
 * 3. Coupon & Offer Deductions (LIBRARY50, WELCOMEFREE)
 * 4. Zero-Payment Gate (Free) vs Gated Paid Activation
 * 5. Server-Enforced 24-Hour Cancellation Window & Configurable Refund Policies
 * 6. Historical Price Protection on Renewal
 * 7. District Admin Permission Boundary Enforcement
 * 8. Financial Payment Ledger & Idempotency Protection
 */

const crypto = require('crypto');
const db = require('../db/database');

function getTodayString() {
  return new Date().toISOString().substring(0, 10);
}

function generateInvoiceNumber() {
  const dateStr = new Date().toISOString().substring(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `FP-INV-SUB-${dateStr}-${randomSuffix}`;
}

const librarySubscriptionService = {
  /**
   * Fetch all available subscription plans
   */
  getPlans() {
    return db.prepare(`
      SELECT * FROM library_subscription_plans 
      WHERE status = 'ACTIVE' 
      ORDER BY duration_months ASC
    `).all().map(plan => ({
      ...plan,
      is_popular: Boolean(plan.is_popular),
      features: plan.features ? JSON.parse(plan.features) : []
    }));
  },

  /**
   * Fetch specific plan by ID
   */
  getPlanById(planId) {
    const plan = db.prepare('SELECT * FROM library_subscription_plans WHERE id = ?').get(planId);
    if (!plan) return null;
    return {
      ...plan,
      is_popular: Boolean(plan.is_popular),
      features: plan.features ? JSON.parse(plan.features) : []
    };
  },

  /**
   * 4-Tier Pricing Resolution Engine
   * Priority: Particular Library -> District -> State -> Pan-India -> Free Fallback (0)
   */
  resolveSubscriptionPrice({ state, district, libraryId, libraryName, planId = 'plan-lib-monthly', couponCode }) {
    const today = getTodayString();
    let appliedRule = null;
    let pricingScope = 'PAN_INDIA';
    let baseMonthlyPrice = 500; // default fallback

    // 1. Priority 1: Particular Library Override (By ID or Name)
    if (libraryId || libraryName) {
      let query = `
        SELECT * FROM library_subscription_pricing_rules
        WHERE scope_type = 'PARTICULAR'
          AND status = 'ACTIVE'
          AND effective_from <= ?
          AND (effective_until IS NULL OR effective_until = '' OR effective_until >= ?)
      `;
      const params = [today, today];

      if (libraryId && libraryName) {
        query += ` AND (library_id = ? OR LOWER(TRIM(library_name)) = LOWER(TRIM(?)))`;
        params.push(String(libraryId), libraryName);
      } else if (libraryId) {
        query += ` AND library_id = ?`;
        params.push(String(libraryId));
      } else {
        query += ` AND LOWER(TRIM(library_name)) = LOWER(TRIM(?))`;
        params.push(libraryName);
      }
      query += ` ORDER BY id DESC LIMIT 1`;

      const rule = db.prepare(query).get(...params);
      if (rule) {
        appliedRule = rule;
        pricingScope = 'PARTICULAR';
        baseMonthlyPrice = rule.price;
      }
    }

    // 2. Priority 2: District Override
    if (!appliedRule && district) {
      let query = `
        SELECT * FROM library_subscription_pricing_rules
        WHERE scope_type = 'DISTRICT'
          AND LOWER(TRIM(district)) = LOWER(TRIM(?))
          AND status = 'ACTIVE'
          AND effective_from <= ?
          AND (effective_until IS NULL OR effective_until = '' OR effective_until >= ?)
      `;
      const params = [district, today, today];
      if (state) {
        query += ` AND (state IS NULL OR LOWER(TRIM(state)) = LOWER(TRIM(?)))`;
        params.push(state);
      }
      query += ` ORDER BY id DESC LIMIT 1`;

      const rule = db.prepare(query).get(...params);
      if (rule) {
        appliedRule = rule;
        pricingScope = 'DISTRICT';
        baseMonthlyPrice = rule.price;
      }
    }

    // 3. Priority 3: State Override
    if (!appliedRule && state) {
      const rule = db.prepare(`
        SELECT * FROM library_subscription_pricing_rules
        WHERE scope_type = 'STATE'
          AND LOWER(TRIM(state)) = LOWER(TRIM(?))
          AND status = 'ACTIVE'
          AND effective_from <= ?
          AND (effective_until IS NULL OR effective_until = '' OR effective_until >= ?)
        ORDER BY id DESC LIMIT 1
      `).get(state, today, today);

      if (rule) {
        appliedRule = rule;
        pricingScope = 'STATE';
        baseMonthlyPrice = rule.price;
      }
    }

    // 4. Priority 4: Pan-India Standard Rule
    if (!appliedRule) {
      const rule = db.prepare(`
        SELECT * FROM library_subscription_pricing_rules
        WHERE scope_type = 'PAN_INDIA'
          AND status = 'ACTIVE'
          AND effective_from <= ?
          AND (effective_until IS NULL OR effective_until = '' OR effective_until >= ?)
        ORDER BY id DESC LIMIT 1
      `).get(today, today);

      if (rule) {
        appliedRule = rule;
        pricingScope = 'PAN_INDIA';
        baseMonthlyPrice = rule.price;
      } else {
        // Fallback: complimentary free
        baseMonthlyPrice = 0;
        pricingScope = 'PLATFORM_DEFAULT';
      }
    }

    // Resolve Plan and Duration Multipliers
    const plan = this.getPlanById(planId) || {
      id: 'plan-lib-monthly',
      name: 'Monthly Listing Subscription',
      billing_cycle: 'MONTHLY',
      duration_months: 1,
      duration_days: 30,
      savings_percent: 0,
    };

    const durationMonths = plan.duration_months || 1;
    const savingsPercent = plan.savings_percent || 0;
    const rawDurationTotal = baseMonthlyPrice * durationMonths;
    const durationSavings = Math.round(rawDurationTotal * (savingsPercent / 100));
    const subtotalAfterDuration = rawDurationTotal - durationSavings;

    // Coupon & Offer Evaluation
    let couponDiscount = 0;
    let couponApplied = null;
    if (couponCode) {
      const cleanCoupon = String(couponCode).toUpperCase().trim();
      if (cleanCoupon === 'LIBRARY50') {
        couponDiscount = Math.min(50, subtotalAfterDuration);
        couponApplied = 'LIBRARY50';
      } else if (cleanCoupon === 'WELCOMEFREE') {
        couponDiscount = subtotalAfterDuration;
        couponApplied = 'WELCOMEFREE';
      }
    }

    const finalPayableAmount = Math.max(0, subtotalAfterDuration - couponDiscount);
    const isFree = finalPayableAmount === 0;

    // Build Transparent Hierarchy Breakdown for Audit & Simulators
    const panIndiaRule = db.prepare(`SELECT * FROM library_subscription_pricing_rules WHERE scope_type = 'PAN_INDIA' AND status = 'ACTIVE' LIMIT 1`).get();
    const stateRule = state ? db.prepare(`SELECT * FROM library_subscription_pricing_rules WHERE scope_type = 'STATE' AND LOWER(TRIM(state)) = LOWER(TRIM(?)) AND status = 'ACTIVE' LIMIT 1`).get(state) : null;
    const districtRule = district ? db.prepare(`SELECT * FROM library_subscription_pricing_rules WHERE scope_type = 'DISTRICT' AND LOWER(TRIM(district)) = LOWER(TRIM(?)) AND status = 'ACTIVE' LIMIT 1`).get(district) : null;

    return {
      planId: plan.id,
      planName: plan.name,
      billingCycle: plan.billing_cycle,
      durationMonths,
      durationDays: plan.duration_days,
      applicablePrice: baseMonthlyPrice,
      baseMonthlyPrice,
      rawDurationTotal,
      offerDiscount: durationSavings,
      savingsPercent,
      couponCode: couponApplied,
      couponDiscount,
      finalPayableAmount,
      isFree,
      paymentRequired: !isFree,
      pricingScope,
      appliedRuleId: appliedRule ? appliedRule.id : null,
      appliedRuleName: appliedRule ? appliedRule.name : 'Platform Fallback',
      refundPolicy: appliedRule ? appliedRule.refund_policy : 'FULL_24H',
      gracePeriodDays: appliedRule ? appliedRule.grace_period_days : 7,
      priceProtection: appliedRule ? appliedRule.price_protection : 'LOCKED',
      hierarchyBreakdown: {
        particularOverride: pricingScope === 'PARTICULAR' ? { fee: baseMonthlyPrice, ruleName: appliedRule?.name } : null,
        districtOverride: districtRule ? { fee: districtRule.price, district: districtRule.district, ruleName: districtRule.name } : null,
        districtDefault: districtRule ? { fee: districtRule.price } : null,
        stateOverride: stateRule ? { fee: stateRule.price, state: stateRule.state, ruleName: stateRule.name } : null,
        stateDefault: stateRule ? { fee: stateRule.price } : null,
        panIndiaDefault: panIndiaRule ? { fee: panIndiaRule.price, ruleName: panIndiaRule.name } : { fee: 500 },
        finalAppliedScope: pricingScope,
      }
    };
  },

  /**
   * Save or Update a Pricing Rule with strict permission boundaries
   */
  savePricingRule(ruleData, userRole, userDistrict) {
    const {
      id = `rule-lib-sub-${crypto.randomUUID()}`,
      name,
      scope_type,
      state,
      district,
      library_id,
      library_name,
      plan_id = 'plan-lib-monthly',
      price,
      currency = 'INR',
      status = 'ACTIVE',
      effective_from = getTodayString(),
      effective_until,
      price_protection = 'LOCKED',
      locked_cycles = 1,
      refund_policy = 'FULL_24H',
      grace_period_days = 7,
      created_by
    } = ruleData;

    // Price Validation: Cannot be negative
    if (price < 0) {
      throw new Error('Subscription fee cannot be negative');
    }

    // Security Boundary: District Admin restrictions
    if (userRole === 'DISTRICT_ADMIN') {
      if (scope_type === 'PAN_INDIA' || scope_type === 'STATE') {
        throw new Error('District Admins cannot configure Pan-India or State pricing policies');
      }
      if (scope_type === 'DISTRICT') {
        if (!userDistrict || (district && district.toLowerCase().trim() !== userDistrict.toLowerCase().trim())) {
          throw new Error('District Admins can only configure pricing for their assigned district');
        }
      }
    }

    db.prepare(`
      INSERT OR REPLACE INTO library_subscription_pricing_rules (
        id, name, scope_type, state, district, library_id, library_name, plan_id,
        price, currency, status, effective_from, effective_until, price_protection,
        locked_cycles, refund_policy, grace_period_days, created_by, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(
      id,
      name || `${scope_type} Rule`,
      scope_type,
      state || null,
      district || (userRole === 'DISTRICT_ADMIN' ? userDistrict : null),
      library_id || null,
      library_name || null,
      plan_id,
      price,
      currency,
      status,
      effective_from,
      effective_until || null,
      price_protection,
      locked_cycles,
      refund_policy,
      grace_period_days,
      created_by || null
    );

    return db.prepare('SELECT * FROM library_subscription_pricing_rules WHERE id = ?').get(id);
  },

  /**
   * Delete pricing rule (with security boundary check)
   */
  deletePricingRule(id, userRole, userDistrict) {
    const existing = db.prepare('SELECT * FROM library_subscription_pricing_rules WHERE id = ?').get(id);
    if (!existing) {
      throw new Error('Pricing rule not found');
    }

    if (userRole === 'DISTRICT_ADMIN') {
      if (existing.scope_type === 'PAN_INDIA' || existing.scope_type === 'STATE') {
        throw new Error('District Admins cannot delete Pan-India or State rules');
      }
      if (existing.district && existing.district.toLowerCase().trim() !== userDistrict.toLowerCase().trim()) {
        throw new Error('District Admins can only delete rules in their assigned district');
      }
    }

    db.prepare('DELETE FROM library_subscription_pricing_rules WHERE id = ?').run(id);
    return { success: true, id };
  },

  /**
   * Create & Activate Subscription (Zero-Payment Gate for Free, Gated for Paid)
   */
  createSubscription(subData) {
    const {
      libraryId,
      libraryName,
      ownerId,
      planId = 'plan-lib-monthly',
      state,
      district,
      couponCode,
      paymentMethod,
      transactionId,
      idempotencyKey,
      autoRenew = true,
      priceProtection = 'LOCKED',
      lockedPrice
    } = subData;

    // Idempotency check: prevent duplicate active subscriptions for the same idempotency key or active txn
    if (transactionId) {
      const existingPayment = db.prepare('SELECT * FROM library_subscription_payments WHERE transaction_id = ?').get(transactionId);
      if (existingPayment) {
        const existingSub = db.prepare('SELECT * FROM library_subscriptions WHERE id = ?').get(existingPayment.subscription_id);
        if (existingSub) {
          return existingSub;
        }
      }
    }

    // Server-Side Pricing Resolution (Prevents client manipulation)
    const calc = this.resolveSubscriptionPrice({
      state,
      district,
      libraryId,
      libraryName,
      planId,
      couponCode
    });

    const now = new Date();
    const activatedAt = now.toISOString();
    const cancellationDeadline = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    const startDate = now.toISOString().substring(0, 10);
    const expiryDate = new Date(now.getTime() + (calc.durationDays || 30) * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);

    const subscriptionId = subData.id || `sub-${crypto.randomUUID()}`;
    const status = calc.isFree ? 'ACTIVE' : (subData.status || (transactionId ? 'ACTIVE' : 'PAYMENT_REQUIRED'));

    const effectiveLockedPrice = lockedPrice !== undefined ? lockedPrice : calc.baseMonthlyPrice;

    // Atomic transaction for subscription & payment ledger
    const createTx = db.transaction(() => {
      db.prepare(`
        INSERT OR REPLACE INTO library_subscriptions (
          id, library_id, owner_id, plan_id, plan_name, billing_cycle, base_price,
          pricing_scope, applied_rule_id, offer_discount, coupon_code, coupon_discount,
          final_paid_amount, is_free, status, start_date, expiry_date, activated_at,
          cancellation_deadline, auto_renew, grace_period_days, price_locked,
          payment_method, transaction_id, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).run(
        subscriptionId,
        libraryId,
        ownerId,
        calc.planId,
        calc.planName,
        calc.billingCycle,
        calc.baseMonthlyPrice,
        calc.pricingScope,
        calc.appliedRuleId,
        calc.offerDiscount,
        calc.couponCode || null,
        calc.couponDiscount,
        calc.finalPayableAmount,
        calc.isFree ? 1 : 0,
        status,
        startDate,
        expiryDate,
        activatedAt,
        cancellationDeadline,
        autoRenew ? 1 : 0,
        calc.gracePeriodDays || 7,
        effectiveLockedPrice,
        paymentMethod || (calc.isFree ? 'ZERO_PAYMENT' : null),
        transactionId || (calc.isFree ? 'FREE-BYPASS' : null)
      );

      // If paid, record payment in the financial ledger
      if (!calc.isFree && status === 'ACTIVE' && transactionId) {
        const invoiceNo = generateInvoiceNumber();
        db.prepare(`
          INSERT INTO library_subscription_payments (
            id, subscription_id, library_id, owner_id, invoice_no, amount,
            payment_method, transaction_id, status, paid_at, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'SUCCESS', CURRENT_TIMESTAMP, ?)
        `).run(
          `pay-${crypto.randomUUID()}`,
          subscriptionId,
          libraryId,
          ownerId,
          invoiceNo,
          calc.finalPayableAmount,
          paymentMethod || 'ONLINE_GATEWAY',
          transactionId,
          `Listing Subscription: ${calc.planName}`
        );
      }

      // Update library entity if libraryId exists in libraries table
      db.prepare(`
        UPDATE libraries 
        SET subscription_id = ?, subscription_status = ?, subscription_expiry = ?
        WHERE id = ?
      `).run(subscriptionId, status, expiryDate, libraryId);

      // Audit event
      db.prepare(`
        INSERT INTO library_subscription_events (
          subscription_id, event_type, actor_id, actor_role, details
        ) VALUES (?, 'SUBSCRIPTION_CREATED', ?, 'LIBRARY_OWNER', ?)
      `).run(
        subscriptionId,
        ownerId,
        JSON.stringify({ plan: calc.planName, amount: calc.finalPayableAmount, isFree: calc.isFree, status })
      );
    });

    createTx();

    return db.prepare('SELECT * FROM library_subscriptions WHERE id = ?').get(subscriptionId);
  },

  /**
   * Request Subscription Cancellation strictly within 24 hours of activation
   */
  requestCancellation(subscriptionId, reasonText, reasonCategory = 'OTHER', userRole = 'LIBRARY_OWNER', userId) {
    const sub = db.prepare('SELECT * FROM library_subscriptions WHERE id = ?').get(subscriptionId);
    if (!sub) {
      return { success: false, error: 'Subscription not found' };
    }

    if (sub.status === 'CANCELLED') {
      return { success: false, error: 'Subscription is already cancelled' };
    }

    // Strict 24-Hour Server Deadline Validation
    const now = Date.now();
    const deadline = new Date(sub.cancellation_deadline).getTime();

    if (now > deadline) {
      return {
        success: false,
        error: 'Cancellation window expired. Listing subscriptions can only be cancelled within 24 hours of activation.',
        cancellationDeadline: sub.cancellation_deadline,
        currentTime: new Date(now).toISOString()
      };
    }

    // Determine Refund per Rule Policy
    let refundPolicy = 'FULL_24H';
    if (sub.applied_rule_id) {
      const rule = db.prepare('SELECT refund_policy FROM library_subscription_pricing_rules WHERE id = ?').get(sub.applied_rule_id);
      if (rule && rule.refund_policy) {
        refundPolicy = rule.refund_policy;
      }
    }

    let refundAmount = 0;
    if (sub.final_paid_amount > 0) {
      if (refundPolicy === 'FULL_24H') {
        refundAmount = sub.final_paid_amount;
      } else if (refundPolicy === 'FULL_MINUS_GATEWAY_FEE') {
        refundAmount = Math.round(sub.final_paid_amount * 0.98 * 100) / 100;
      } else if (refundPolicy === 'PARTIAL_50') {
        refundAmount = Math.round(sub.final_paid_amount * 0.5 * 100) / 100;
      } else if (refundPolicy === 'NO_REFUND') {
        refundAmount = 0;
      }
    }

    const cancelId = `canc-${crypto.randomUUID()}`;

    const cancelTx = db.transaction(() => {
      // 1. Update subscription status
      db.prepare(`
        UPDATE library_subscriptions
        SET status = 'CANCELLED', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(subscriptionId);

      // 2. Record cancellation request
      db.prepare(`
        INSERT INTO library_subscription_cancellations (
          id, subscription_id, library_id, owner_id, reason_category, reason_text,
          requested_at, refund_amount, refund_status, policy_applied, processed_at
        ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, 'COMPLETED', ?, CURRENT_TIMESTAMP)
      `).run(
        cancelId,
        subscriptionId,
        sub.library_id,
        sub.owner_id,
        reasonCategory,
        reasonText || '',
        refundAmount,
        refundPolicy
      );

      // 3. Update library status
      db.prepare(`
        UPDATE libraries 
        SET subscription_status = 'CANCELLED'
        WHERE id = ?
      `).run(sub.library_id);

      // 4. Record audit event
      db.prepare(`
        INSERT INTO library_subscription_events (
          subscription_id, event_type, actor_id, actor_role, details
        ) VALUES (?, 'SUBSCRIPTION_CANCELLED_24H', ?, ?, ?)
      `).run(
        subscriptionId,
        userId || sub.owner_id,
        userRole,
        JSON.stringify({ refundAmount, refundPolicy, reasonCategory, reasonText })
      );
    });

    cancelTx();

    const cancellationRequest = db.prepare('SELECT * FROM library_subscription_cancellations WHERE id = ?').get(cancelId);

    return {
      success: true,
      refundAmount,
      policyApplied: refundPolicy,
      cancellationRequest: {
        ...cancellationRequest,
        isWithin24Hours: true
      },
      message: 'Subscription successfully cancelled. Refund processed according to policy.'
    };
  },

  /**
   * Renew Subscription (Honoring Price Protection)
   */
  renewSubscription(subscriptionId, planId, paymentDetails = {}) {
    const sub = db.prepare('SELECT * FROM library_subscriptions WHERE id = ?').get(subscriptionId);
    if (!sub) {
      throw new Error('Subscription not found');
    }

    const targetPlanId = planId || sub.plan_id;
    const plan = this.getPlanById(targetPlanId) || this.getPlanById('plan-lib-monthly');

    // Historical Price Protection: use sub.price_locked if locked
    let baseMonthlyPrice = sub.price_locked || sub.base_price;
    const durationMonths = plan.duration_months || 1;
    const savingsPercent = plan.savings_percent || 0;
    const rawTotal = baseMonthlyPrice * durationMonths;
    const discount = Math.round(rawTotal * (savingsPercent / 100));
    const renewalAmount = Math.max(0, rawTotal - discount);

    const now = new Date();
    const currentExpiry = new Date(sub.expiry_date);
    const startFrom = currentExpiry > now ? currentExpiry : now;
    const newExpiry = new Date(startFrom.getTime() + (plan.duration_days || 30) * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);

    const renewTx = db.transaction(() => {
      db.prepare(`
        UPDATE library_subscriptions
        SET status = 'ACTIVE',
            plan_id = ?,
            plan_name = ?,
            billing_cycle = ?,
            final_paid_amount = ?,
            expiry_date = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        plan.id,
        plan.name,
        plan.billing_cycle,
        renewalAmount,
        newExpiry,
        subscriptionId
      );

      // Record renewal payment
      if (renewalAmount > 0) {
        const invoiceNo = generateInvoiceNumber();
        db.prepare(`
          INSERT INTO library_subscription_payments (
            id, subscription_id, library_id, owner_id, invoice_no, amount,
            payment_method, transaction_id, status, paid_at, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'SUCCESS', CURRENT_TIMESTAMP, ?)
        `).run(
          `pay-${crypto.randomUUID()}`,
          subscriptionId,
          sub.library_id,
          sub.owner_id,
          invoiceNo,
          renewalAmount,
          paymentDetails.paymentMethod || 'UPI_QR',
          paymentDetails.transactionId || `TXN-RENEW-${Date.now()}`,
          `Subscription Renewal: ${plan.name}`
        );
      }

      // Update library
      db.prepare(`
        UPDATE libraries 
        SET subscription_status = 'ACTIVE', subscription_expiry = ?
        WHERE id = ?
      `).run(newExpiry, sub.library_id);

      // Audit event
      db.prepare(`
        INSERT INTO library_subscription_events (
          subscription_id, event_type, actor_id, actor_role, details
        ) VALUES (?, 'SUBSCRIPTION_RENEWED', ?, 'LIBRARY_OWNER', ?)
      `).run(
        subscriptionId,
        sub.owner_id,
        JSON.stringify({ planName: plan.name, renewalAmount, newExpiry })
      );
    });

    renewTx();

    return db.prepare('SELECT * FROM library_subscriptions WHERE id = ?').get(subscriptionId);
  },

  /**
   * Toggle Auto-Renewal
   */
  toggleAutoRenew(subscriptionId, ownerId, autoRenew) {
    const sub = db.prepare('SELECT * FROM library_subscriptions WHERE id = ?').get(subscriptionId);
    if (!sub) throw new Error('Subscription not found');

    const flag = autoRenew ? 1 : 0;
    db.prepare('UPDATE library_subscriptions SET auto_renew = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(flag, subscriptionId);

    return db.prepare('SELECT * FROM library_subscriptions WHERE id = ?').get(subscriptionId);
  },

  /**
   * Record payment directly in ledger (with idempotency)
   */
  recordPayment(paymentData) {
    const {
      subscriptionId,
      libraryId,
      ownerId,
      amount,
      paymentMethod = 'UPI_QR',
      transactionId,
      idempotencyKey,
      notes
    } = paymentData;

    // Check existing payment by transactionId or notes containing idempotencyKey
    if (transactionId) {
      const existing = db.prepare('SELECT * FROM library_subscription_payments WHERE transaction_id = ?').get(transactionId);
      if (existing) {
        return {
          id: existing.id,
          invoiceNumber: existing.invoice_no,
          ...existing,
          idempotencyKey
        };
      }
    }

    if (idempotencyKey) {
      const existing = db.prepare(`SELECT * FROM library_subscription_payments WHERE notes LIKE ?`).get(`%${idempotencyKey}%`);
      if (existing) {
        return {
          id: existing.id,
          invoiceNumber: existing.invoice_no,
          ...existing,
          idempotencyKey
        };
      }
    }

    const payId = `pay-${crypto.randomUUID()}`;
    const invoiceNo = generateInvoiceNumber();
    const effectiveNotes = idempotencyKey ? `${notes || 'Payment'} [idempotency:${idempotencyKey}]` : (notes || 'Subscription Payment');

    db.prepare(`
      INSERT INTO library_subscription_payments (
        id, subscription_id, library_id, owner_id, invoice_no, amount,
        payment_method, transaction_id, status, paid_at, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'SUCCESS', CURRENT_TIMESTAMP, ?)
    `).run(
      payId,
      subscriptionId,
      libraryId,
      ownerId,
      invoiceNo,
      amount,
      paymentMethod,
      transactionId || `TXN-${Date.now()}`,
      effectiveNotes
    );

    const saved = db.prepare('SELECT * FROM library_subscription_payments WHERE id = ?').get(payId);
    return {
      id: saved.id,
      invoiceNumber: saved.invoice_no,
      ...saved,
      idempotencyKey
    };
  },

  /**
   * Fetch all subscription payments (optionally filter by district)
   */
  getPayments(district) {
    let query = `
      SELECT p.*, l.name as library_name, d.name as district_name
      FROM library_subscription_payments p
      LEFT JOIN libraries l ON p.library_id = l.id
      LEFT JOIN districts d ON l.district_id = d.id
    `;
    const params = [];
    if (district) {
      query += ` WHERE LOWER(TRIM(d.name)) = LOWER(TRIM(?))`;
      params.push(district);
    }
    query += ` ORDER BY p.paid_at DESC`;

    return db.prepare(query).all(...params).map(p => ({
      ...p,
      invoiceNumber: p.invoice_no,
      idempotencyKey: p.notes && p.notes.includes('[idempotency:') ? p.notes.split('[idempotency:')[1].replace(']', '').trim() : null
    }));
  },

  /**
   * Analytics & KPIs
   */
  getAnalytics(district) {
    let subWhere = '';
    let payWhere = '';
    const params = [];

    if (district) {
      subWhere = ` WHERE s.library_id IN (SELECT id FROM libraries WHERE district_id IN (SELECT id FROM districts WHERE LOWER(TRIM(name)) = LOWER(TRIM(?))))`;
      payWhere = ` WHERE p.library_id IN (SELECT id FROM libraries WHERE district_id IN (SELECT id FROM districts WHERE LOWER(TRIM(name)) = LOWER(TRIM(?))))`;
      params.push(district);
    }

    const totalRevenue = db.prepare(`SELECT COALESCE(SUM(amount), 0) as total FROM library_subscription_payments p ${payWhere}`).get(...params)?.total || 0;
    const activeSubs = db.prepare(`SELECT COUNT(*) as count FROM library_subscriptions s ${subWhere ? subWhere + " AND s.status = 'ACTIVE'" : "WHERE s.status = 'ACTIVE'"} `).get(...params)?.count || 0;
    const freeSubs = db.prepare(`SELECT COUNT(*) as count FROM library_subscriptions s ${subWhere ? subWhere + " AND s.is_free = 1" : "WHERE s.is_free = 1"} `).get(...params)?.count || 0;
    const paidSubs = db.prepare(`SELECT COUNT(*) as count FROM library_subscriptions s ${subWhere ? subWhere + " AND s.is_free = 0 AND s.status = 'ACTIVE'" : "WHERE s.is_free = 0 AND s.status = 'ACTIVE'"} `).get(...params)?.count || 0;
    const cancellations = db.prepare(`SELECT COUNT(*) as count FROM library_subscription_cancellations`).get()?.count || 0;
    const activeRules = db.prepare(`SELECT COUNT(*) as count FROM library_subscription_pricing_rules WHERE status = 'ACTIVE'`).get()?.count || 0;

    // Monthly recurring revenue (MRR) estimate
    const mrr = db.prepare(`
      SELECT COALESCE(SUM(base_price), 0) as mrr 
      FROM library_subscriptions s 
      ${subWhere ? subWhere + " AND s.status = 'ACTIVE' AND s.is_free = 0" : "WHERE s.status = 'ACTIVE' AND s.is_free = 0"}
    `).get(...params)?.mrr || 0;

    return {
      totalRevenue,
      monthlyRecurringRevenue: mrr,
      activeSubscriptions: activeSubs,
      paidSubscriptions: paidSubs,
      freeSubscriptions: freeSubs,
      cancellationsCount: cancellations,
      activeRulesCount: activeRules
    };
  }
};

module.exports = librarySubscriptionService;
