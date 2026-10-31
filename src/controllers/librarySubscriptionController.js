/**
 * FOCUSPOINT — Library Listing Subscription Controller
 */

const db = require('../db/database');
const librarySubscriptionService = require('../services/librarySubscriptionService');

function getUserDistrict(req) {
  if (req.user && req.user.districtId) {
    const dist = db.prepare('SELECT name FROM districts WHERE id = ?').get(req.user.districtId);
    return dist ? dist.name : null;
  }
  return req.user?.district || null;
}

exports.getPlans = (req, res) => {
  try {
    const plans = librarySubscriptionService.getPlans();
    return res.json({ success: true, plans });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.calculatePrice = (req, res) => {
  try {
    const { state, district, libraryId, libraryName, planId, couponCode } = req.body;
    const calculation = librarySubscriptionService.resolveSubscriptionPrice({
      state,
      district,
      libraryId,
      libraryName,
      planId,
      couponCode
    });
    return res.json({ success: true, ...calculation });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.createSubscription = (req, res) => {
  try {
    const ownerId = (req.user.id || req.user.userId);
    const {
      libraryId,
      libraryName,
      planId,
      state,
      district,
      couponCode,
      paymentMethod,
      transactionId,
      idempotencyKey,
      autoRenew,
      priceProtection,
      lockedPrice
    } = req.body;

    if (!libraryId) {
      return res.status(400).json({ success: false, message: 'libraryId is required' });
    }

    const subscription = librarySubscriptionService.createSubscription({
      libraryId,
      libraryName,
      ownerId,
      planId,
      state,
      district,
      couponCode,
      paymentMethod,
      transactionId,
      idempotencyKey,
      autoRenew,
      priceProtection,
      lockedPrice
    });

    return res.status(201).json({
      success: true,
      message: subscription.is_free ? 'Complimentary Free Subscription activated successfully!' : 'Listing Subscription activated successfully!',
      subscription
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMySubscription = (req, res) => {
  try {
    const ownerId = (req.user.id || req.user.userId);
    const sub = db.prepare(`
      SELECT s.*, l.name as library_name, l.address as library_address
      FROM library_subscriptions s
      JOIN libraries l ON s.library_id = l.id
      WHERE s.owner_id = ?
      ORDER BY s.created_at DESC
      LIMIT 1
    `).get(ownerId);

    if (!sub) {
      return res.status(404).json({ success: false, message: 'No subscription found for this library owner' });
    }

    const now = Date.now();
    const deadline = new Date(sub.cancellation_deadline).getTime();
    const isWithin24Hours = now <= deadline;
    const remainingMs = Math.max(0, deadline - now);

    return res.json({
      success: true,
      subscription: {
        ...sub,
        isWithin24Hours,
        remainingMs,
        remainingHours: Math.floor(remainingMs / (1000 * 60 * 60)),
        remainingMinutes: Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60))
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.requestCancellation = (req, res) => {
  try {
    const { subscriptionId, reasonText, reasonCategory } = req.body;
    if (!subscriptionId) {
      return res.status(400).json({ success: false, message: 'subscriptionId is required' });
    }

    const result = librarySubscriptionService.requestCancellation(
      subscriptionId,
      reasonText,
      reasonCategory,
      req.user.role,
      (req.user.id || req.user.userId)
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error,
        cancellationDeadline: result.cancellationDeadline,
        currentTime: result.currentTime
      });
    }

    return res.json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.renewSubscription = (req, res) => {
  try {
    const { subscriptionId, planId, paymentMethod, transactionId } = req.body;
    if (!subscriptionId) {
      return res.status(400).json({ success: false, message: 'subscriptionId is required' });
    }

    const subscription = librarySubscriptionService.renewSubscription(subscriptionId, planId, {
      paymentMethod,
      transactionId
    });

    return res.json({
      success: true,
      message: 'Subscription successfully renewed!',
      subscription
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.toggleAutoRenew = (req, res) => {
  try {
    const { subscriptionId, autoRenew } = req.body;
    if (!subscriptionId) {
      return res.status(400).json({ success: false, message: 'subscriptionId is required' });
    }

    const subscription = librarySubscriptionService.toggleAutoRenew(subscriptionId, (req.user.id || req.user.userId), autoRenew);
    return res.json({ success: true, subscription });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyPayments = (req, res) => {
  try {
    const ownerId = (req.user.id || req.user.userId);
    const payments = db.prepare(`
      SELECT p.*, s.plan_name, s.billing_cycle
      FROM library_subscription_payments p
      JOIN library_subscriptions s ON p.subscription_id = s.id
      WHERE p.owner_id = ?
      ORDER BY p.paid_at DESC
    `).all(ownerId);

    return res.json({ success: true, payments });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getInvoice = (req, res) => {
  try {
    const { invoiceNo } = req.params;
    const payment = db.prepare(`
      SELECT p.*, s.plan_name, s.billing_cycle, s.start_date, s.expiry_date,
             l.name as library_name, l.address as library_address,
             u.email as owner_email, u.mobile as owner_mobile,
             lop.owner_name
      FROM library_subscription_payments p
      JOIN library_subscriptions s ON p.subscription_id = s.id
      JOIN libraries l ON p.library_id = l.id
      JOIN users u ON p.owner_id = u.id
      LEFT JOIN library_owner_profiles lop ON u.id = lop.user_id
      WHERE p.invoice_no = ?
    `).get(invoiceNo);

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    return res.json({ success: true, invoice: payment });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// =========================================================
// ADMIN ENDPOINTS (District Admin & Super Admin)
// =========================================================

exports.getAdminRules = (req, res) => {
  try {
    const userDistrict = getUserDistrict(req);
    let query = 'SELECT * FROM library_subscription_pricing_rules';
    const params = [];

    if (req.user.role === 'DISTRICT_ADMIN') {
      // District Admin can see Pan-India, State, and their own District rules
      query += ` WHERE scope_type IN ('PAN_INDIA', 'STATE') OR (scope_type = 'DISTRICT' AND LOWER(TRIM(district)) = LOWER(TRIM(?)))`;
      params.push(userDistrict || '');
    } else if (req.query.district) {
      query += ` WHERE LOWER(TRIM(district)) = LOWER(TRIM(?))`;
      params.push(req.query.district);
    }

    query += ' ORDER BY id DESC';
    const rules = db.prepare(query).all(...params);
    return res.json({ success: true, rules });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.saveAdminRule = (req, res) => {
  try {
    const userDistrict = getUserDistrict(req);
    const rule = librarySubscriptionService.savePricingRule(
      { ...req.body, created_by: (req.user.id || req.user.userId) },
      req.user.role,
      userDistrict
    );
    return res.status(201).json({ success: true, rule });
  } catch (err) {
    const isSecurityError = err.message.includes('District Admins');
    const isValidationError = err.message.includes('cannot be negative');
    const status = isSecurityError ? 403 : (isValidationError ? 400 : 500);
    return res.status(status).json({ success: false, message: err.message });
  }
};

exports.deleteAdminRule = (req, res) => {
  try {
    const userDistrict = getUserDistrict(req);
    const result = librarySubscriptionService.deletePricingRule(req.params.id, req.user.role, userDistrict);
    return res.json(result);
  } catch (err) {
    const isSecurityError = err.message.includes('District Admins');
    const status = isSecurityError ? 403 : 400;
    return res.status(status).json({ success: false, message: err.message });
  }
};

exports.getAllSubscriptions = (req, res) => {
  try {
    const userDistrict = getUserDistrict(req);
    let query = `
      SELECT s.*, l.name as library_name, l.address as library_address, d.name as district_name, lop.owner_name
      FROM library_subscriptions s
      JOIN libraries l ON s.library_id = l.id
      JOIN districts d ON l.district_id = d.id
      JOIN users u ON s.owner_id = u.id
      LEFT JOIN library_owner_profiles lop ON u.id = lop.user_id
    `;
    const params = [];

    if (req.user.role === 'DISTRICT_ADMIN') {
      query += ` WHERE LOWER(TRIM(d.name)) = LOWER(TRIM(?))`;
      params.push(userDistrict || '');
    } else if (req.query.district) {
      query += ` WHERE LOWER(TRIM(d.name)) = LOWER(TRIM(?))`;
      params.push(req.query.district);
    }

    query += ' ORDER BY s.created_at DESC';
    const subscriptions = db.prepare(query).all(...params);
    return res.json({ success: true, subscriptions });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getCancellations = (req, res) => {
  try {
    const cancellations = db.prepare(`
      SELECT c.*, l.name as library_name, u.email as owner_email, s.plan_name, s.final_paid_amount
      FROM library_subscription_cancellations c
      JOIN libraries l ON c.library_id = l.id
      JOIN users u ON c.owner_id = u.id
      JOIN library_subscriptions s ON c.subscription_id = s.id
      ORDER BY c.requested_at DESC
    `).all();

    return res.json({ success: true, cancellations });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAdminAnalytics = (req, res) => {
  try {
    const userDistrict = getUserDistrict(req);
    const targetDistrict = req.user.role === 'DISTRICT_ADMIN' ? userDistrict : (req.query.district || null);
    const analytics = librarySubscriptionService.getAnalytics(targetDistrict);
    return res.json({ success: true, analytics });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
