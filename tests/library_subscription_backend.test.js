import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import db from '../src/db/database';
import runSeed from '../src/scripts/seed';

describe('FOCUSPOINT Phase 5: Library Listing Subscription Backend Acceptance Test Suite', () => {
  let superAdminToken;
  let districtAdminToken;
  let libraryOwnerToken;
  let libraryOwnerUserId;
  let libraryId;
  let ghazipurDistrictId;

  beforeAll(async () => {
    // 1. Clean subscription tables and seed fresh test rules
    db.prepare('DELETE FROM library_subscription_cancellations').run();
    db.prepare('DELETE FROM library_subscription_payments').run();
    db.prepare('DELETE FROM library_subscriptions').run();
    db.prepare('DELETE FROM library_subscription_pricing_rules').run();
    db.prepare('DELETE FROM library_subscription_plans').run();
    runSeed({ seedDemo: true });

    const gzp = db.prepare('SELECT id FROM districts WHERE code = ?').get('GZP');
    ghazipurDistrictId = gzp ? gzp.id : 1;

    // Login Super Admin
    const saLogin = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'superadmin@focuspoint.internal', password: 'SuperAdmin@FocusPoint2026!' });
    superAdminToken = saLogin.body.token;

    // Login District Admin for Ghazipur
    const daLogin = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'admin.ghazipur@focuspoint.internal', password: 'Password@123' });
    districtAdminToken = daLogin.body.token;

    // Login Library Owner
    const loLogin = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'owner.library@focuspoint.internal', password: 'Password@123' });
    libraryOwnerToken = loLogin.body.token;
    libraryOwnerUserId = loLogin.body.user.id;

    // Find or create a test library for this owner
    let lib = db.prepare('SELECT id FROM libraries WHERE owner_id = ?').get(libraryOwnerUserId);
    if (!lib) {
      const res = db.prepare(`
        INSERT INTO libraries (owner_id, district_id, name, address, total_seats, status)
        VALUES (?, ?, 'FocusPoint Central Reading Hall', 'Main Road, Saidpur', 50, 'ACTIVE')
      `).run(libraryOwnerUserId, ghazipurDistrictId);
      libraryId = res.lastInsertRowid;
    } else {
      libraryId = lib.id;
    }
  });

  // TEST 1 — FREE PAN-INDIA / FREE DISTRICT SUBSCRIPTION
  describe('TEST 1 — FREE SUBSCRIPTION REGISTRATION (Section 62 - Test 1)', () => {
    it('bypasses payment when fee is ₹0 and activates subscription directly', async () => {
      // Super Admin creates a free campaign rule for Varanasi
      await request(app)
        .post('/api/library-subscriptions/admin/rules')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          id: 'rule-test-varanasi-free',
          name: 'Varanasi Free Launch Tier',
          scope_type: 'DISTRICT',
          district: 'Varanasi',
          state: 'Uttar Pradesh',
          price: 0,
          refund_policy: 'FULL_24H',
          status: 'ACTIVE',
          effective_from: '2026-01-01'
        });

      // Calculate price for a Varanasi library
      const calcRes = await request(app)
        .post('/api/library-subscriptions/calculate-price')
        .send({
          state: 'Uttar Pradesh',
          district: 'Varanasi',
          libraryName: 'Kashi Study Circle'
        });

      expect(calcRes.status).toBe(200);
      expect(calcRes.body.applicablePrice).toBe(0);
      expect(calcRes.body.isFree).toBe(true);
      expect(calcRes.body.paymentRequired).toBe(false);
      expect(calcRes.body.finalPayableAmount).toBe(0);

      // Create subscription directly without payment gateway
      const createRes = await request(app)
        .post('/api/library-subscriptions/create')
        .set('Authorization', `Bearer ${libraryOwnerToken}`)
        .send({
          libraryId,
          libraryName: 'Kashi Study Circle',
          state: 'Uttar Pradesh',
          district: 'Varanasi',
          planId: 'plan-lib-monthly'
        });

      expect(createRes.status).toBe(201);
      expect(createRes.body.success).toBe(true);
      expect(createRes.body.subscription.status).toBe('ACTIVE');
      expect(createRes.body.subscription.is_free).toBe(1);
      expect(createRes.body.subscription.final_paid_amount).toBe(0);
      expect(createRes.body.subscription.payment_method).toBe('ZERO_PAYMENT');
    });
  });

  // TEST 2 — PAID PAN-INDIA
  describe('TEST 2 — PAID PAN-INDIA STANDARD (Section 62 - Test 2)', () => {
    it('applies standard Pan-India fee (₹500/mo) when no local override exists', async () => {
      const res = await request(app)
        .post('/api/library-subscriptions/calculate-price')
        .send({
          state: 'Maharashtra',
          district: 'Pune',
          libraryName: 'Pune IT Reading Room',
          planId: 'plan-lib-monthly'
        });

      expect(res.status).toBe(200);
      expect(res.body.applicablePrice).toBe(500);
      expect(res.body.pricingScope).toBe('PAN_INDIA');
      expect(res.body.isFree).toBe(false);
      expect(res.body.paymentRequired).toBe(true);
      expect(res.body.finalPayableAmount).toBe(500);
      expect(res.body.hierarchyBreakdown.panIndiaDefault.fee).toBe(500);
    });
  });

  // TEST 3 — STATE OVERRIDE
  describe('TEST 3 — STATE OVERRIDE (Section 62 - Test 3)', () => {
    it('applies State override fee (₹400/mo) for UP library without district override', async () => {
      const res = await request(app)
        .post('/api/library-subscriptions/calculate-price')
        .send({
          state: 'Uttar Pradesh',
          district: 'Prayagraj', // No specific override rule seeded for Prayagraj
          libraryName: 'Prayagraj Civil Study Hub',
          planId: 'plan-lib-monthly'
        });

      expect(res.status).toBe(200);
      expect(res.body.applicablePrice).toBe(400);
      expect(res.body.pricingScope).toBe('STATE');
      expect(res.body.finalPayableAmount).toBe(400);
      expect(res.body.hierarchyBreakdown.stateOverride.fee).toBe(400);
    });
  });

  // TEST 4 — DISTRICT OVERRIDE
  describe('TEST 4 — DISTRICT OVERRIDE (Section 62 - Test 4)', () => {
    it('applies District override fee (₹300/mo) for Ghazipur library', async () => {
      const res = await request(app)
        .post('/api/library-subscriptions/calculate-price')
        .send({
          state: 'Uttar Pradesh',
          district: 'Ghazipur',
          libraryName: 'General Ghazipur Library',
          planId: 'plan-lib-monthly'
        });

      expect(res.status).toBe(200);
      expect(res.body.applicablePrice).toBe(300);
      expect(res.body.pricingScope).toBe('DISTRICT');
      expect(res.body.finalPayableAmount).toBe(300);
      expect(res.body.hierarchyBreakdown.districtOverride.fee).toBe(300);
    });
  });

  // TEST 5 — PARTICULAR LIBRARY OVERRIDE
  describe('TEST 5 — PARTICULAR LIBRARY OVERRIDE (Section 62 - Test 5)', () => {
    it('applies Particular Library override fee (₹200/mo) with highest priority', async () => {
      const res = await request(app)
        .post('/api/library-subscriptions/calculate-price')
        .send({
          state: 'Uttar Pradesh',
          district: 'Ghazipur',
          libraryName: 'FocusPoint Premier Study Library',
          libraryId: 'lib-vidya-gzp',
          planId: 'plan-lib-monthly'
        });

      expect(res.status).toBe(200);
      expect(res.body.applicablePrice).toBe(200);
      expect(res.body.pricingScope).toBe('PARTICULAR');
      expect(res.body.finalPayableAmount).toBe(200);
      expect(res.body.hierarchyBreakdown.particularOverride.fee).toBe(200);
    });
  });

  // TEST 6A, 6B, 6C — DISTRICT ADMIN PERMISSION BOUNDARY
  describe('TEST 6 — DISTRICT ADMIN SECURITY BOUNDARIES (Section 62 - Test 6 & 13)', () => {
    it('TEST 6A: Strictly rejects District Admin modifying rules in other districts', async () => {
      const res = await request(app)
        .post('/api/library-subscriptions/admin/rules')
        .set('Authorization', `Bearer ${districtAdminToken}`)
        .send({
          id: 'rule-illegal-cross-district',
          name: 'Illegal Cross District Rule',
          scope_type: 'DISTRICT',
          district: 'Varanasi', // Assigned district is Ghazipur
          state: 'Uttar Pradesh',
          price: 250
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('District Admins can only configure pricing for their assigned district');
    });

    it('TEST 6B: Strictly rejects District Admin creating Pan-India or State rules', async () => {
      const res = await request(app)
        .post('/api/library-subscriptions/admin/rules')
        .set('Authorization', `Bearer ${districtAdminToken}`)
        .send({
          id: 'rule-illegal-pan-india',
          name: 'Illegal Pan-India Rule',
          scope_type: 'PAN_INDIA',
          price: 150
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('District Admins cannot configure Pan-India or State');
    });

    it('TEST 6C: Allows District Admin to configure pricing rules for assigned district (Ghazipur)', async () => {
      const res = await request(app)
        .post('/api/library-subscriptions/admin/rules')
        .set('Authorization', `Bearer ${districtAdminToken}`)
        .send({
          id: 'rule-valid-gzp-update',
          name: 'Ghazipur Valid District Promotional Fee',
          scope_type: 'DISTRICT',
          district: 'Ghazipur',
          state: 'Uttar Pradesh',
          price: 280,
          status: 'ACTIVE',
          effective_from: '2026-01-01'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.rule.price).toBe(280);
      expect(res.body.rule.district).toBe('Ghazipur');
    });
  });

  // TEST 7 — 24-HOUR CANCELLATION WITHIN WINDOW
  describe('TEST 7 — 24-HOUR CANCELLATION SUCCESS (Section 62 - Test 7 & 8)', () => {
    it('cancels subscription and processes refund within 24 hours of activation', async () => {
      // 1. Create active paid subscription
      const subRes = await request(app)
        .post('/api/library-subscriptions/create')
        .set('Authorization', `Bearer ${libraryOwnerToken}`)
        .send({
          libraryId,
          libraryName: 'Active Cancellation Test Space',
          state: 'Uttar Pradesh',
          district: 'Ghazipur',
          planId: 'plan-lib-monthly',
          paymentMethod: 'UPI_QR',
          transactionId: `TXN-CANC-TEST-${Date.now()}`
        });

      expect(subRes.status).toBe(201);
      const sub = subRes.body.subscription;
      expect(sub.status).toBe('ACTIVE');

      // 2. Request cancellation within 24 hours
      const cancelRes = await request(app)
        .post('/api/library-subscriptions/cancel')
        .set('Authorization', `Bearer ${libraryOwnerToken}`)
        .send({
          subscriptionId: sub.id,
          reasonText: 'Owner decided to close temporary reading facility',
          reasonCategory: 'CLOSED_LIBRARY'
        });

      expect(cancelRes.status).toBe(200);
      expect(cancelRes.body.success).toBe(true);
      expect(cancelRes.body.refundAmount).toBeGreaterThan(0);
      expect(cancelRes.body.cancellationRequest.isWithin24Hours).toBe(true);

      // 3. Verify status in database
      const row = db.prepare('SELECT status FROM library_subscriptions WHERE id = ?').get(sub.id);
      expect(row.status).toBe('CANCELLED');
    });
  });

  // TEST 8 — CANCELLATION PAST 24 HOURS REJECTED
  describe('TEST 8 — PAST 24-HOUR CANCELLATION REJECTION (Section 62 - Test 9)', () => {
    it('strictly rejects cancellation requested after 24-hour server deadline', async () => {
      // 1. Create active subscription
      const subRes = await request(app)
        .post('/api/library-subscriptions/create')
        .set('Authorization', `Bearer ${libraryOwnerToken}`)
        .send({
          libraryId,
          libraryName: 'Expired Window Library',
          state: 'Uttar Pradesh',
          district: 'Ghazipur',
          planId: 'plan-lib-monthly',
          paymentMethod: 'UPI_QR',
          transactionId: `TXN-PAST24-${Date.now()}`
        });

      const subId = subRes.body.subscription.id;

      // 2. Backdate activated_at and cancellation_deadline by 48 hours directly in DB
      const pastActivated = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
      const pastDeadline = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      db.prepare('UPDATE library_subscriptions SET activated_at = ?, cancellation_deadline = ? WHERE id = ?')
        .run(pastActivated, pastDeadline, subId);

      // 3. Attempt cancellation
      const cancelRes = await request(app)
        .post('/api/library-subscriptions/cancel')
        .set('Authorization', `Bearer ${libraryOwnerToken}`)
        .send({
          subscriptionId: subId,
          reasonText: 'Late cancellation attempt',
          reasonCategory: 'OTHER'
        });

      expect(cancelRes.status).toBe(400);
      expect(cancelRes.body.success).toBe(false);
      expect(cancelRes.body.message).toContain('Cancellation window expired');

      // 4. Verify subscription remains ACTIVE
      const rechecked = db.prepare('SELECT status FROM library_subscriptions WHERE id = ?').get(subId);
      expect(rechecked.status).toBe('ACTIVE');
    });
  });

  // TEST 9 — AUTO-RENEWAL TOGGLE & MANUAL RENEWAL
  describe('TEST 9 — AUTO-RENEWAL & MANUAL RENEWAL (Section 62 - Test 9 & 24)', () => {
    it('toggles auto-renew setting and extends validity on manual renewal', async () => {
      const subRes = await request(app)
        .post('/api/library-subscriptions/create')
        .set('Authorization', `Bearer ${libraryOwnerToken}`)
        .send({
          libraryId,
          libraryName: 'Auto Renew Library',
          state: 'Uttar Pradesh',
          district: 'Ghazipur',
          planId: 'plan-lib-monthly',
          paymentMethod: 'ONLINE_GATEWAY',
          transactionId: `TXN-RENEW-INIT-${Date.now()}`
        });

      const subId = subRes.body.subscription.id;

      // Toggle auto-renew off
      const toggleRes = await request(app)
        .patch('/api/library-subscriptions/auto-renew')
        .set('Authorization', `Bearer ${libraryOwnerToken}`)
        .send({ subscriptionId: subId, autoRenew: false });

      expect(toggleRes.status).toBe(200);
      expect(toggleRes.body.subscription.auto_renew).toBe(0);

      // Manual renewal
      const renewRes = await request(app)
        .post('/api/library-subscriptions/renew')
        .set('Authorization', `Bearer ${libraryOwnerToken}`)
        .send({
          subscriptionId: subId,
          planId: 'plan-lib-monthly',
          paymentMethod: 'UPI_QR',
          transactionId: `TXN-RENEW-MANUAL-${Date.now()}`
        });

      expect(renewRes.status).toBe(200);
      expect(renewRes.body.success).toBe(true);
      expect(renewRes.body.subscription.status).toBe('ACTIVE');
    });
  });

  // TEST 10 — MULTI-DURATION PLANS
  describe('TEST 10 — MULTI-DURATION DURATION SCALING (Section 62 - Test 10 & 11)', () => {
    it('calculates duration discounts correctly (Quarterly -15%, Half-Yearly -20%, Yearly -25%)', async () => {
      // Pan-India Monthly (500)
      const mRes = await request(app)
        .post('/api/library-subscriptions/calculate-price')
        .send({ state: 'Punjab', district: 'Ludhiana', planId: 'plan-lib-monthly' });
      expect(mRes.body.finalPayableAmount).toBe(500);

      // Quarterly (3 * 500 = 1500; 15% = 225; Payable = 1275)
      const qRes = await request(app)
        .post('/api/library-subscriptions/calculate-price')
        .send({ state: 'Punjab', district: 'Ludhiana', planId: 'plan-lib-quarterly' });
      expect(qRes.body.offerDiscount).toBe(225);
      expect(qRes.body.finalPayableAmount).toBe(1275);

      // Half-Yearly (6 * 500 = 3000; 20% = 600; Payable = 2400)
      const hRes = await request(app)
        .post('/api/library-subscriptions/calculate-price')
        .send({ state: 'Punjab', district: 'Ludhiana', planId: 'plan-lib-half-yearly' });
      expect(hRes.body.offerDiscount).toBe(600);
      expect(hRes.body.finalPayableAmount).toBe(2400);

      // Yearly (12 * 500 = 6000; 25% = 1500; Payable = 4500)
      const yRes = await request(app)
        .post('/api/library-subscriptions/calculate-price')
        .send({ state: 'Punjab', district: 'Ludhiana', planId: 'plan-lib-yearly' });
      expect(yRes.body.offerDiscount).toBe(1500);
      expect(yRes.body.finalPayableAmount).toBe(4500);
    });
  });

  // TEST 11 — PRICE PROTECTION ON RENEWAL
  describe('TEST 11 — HISTORICAL PRICE PROTECTION (Section 62 - Test 10 & 34)', () => {
    it('protects subscription pricing upon renewal despite subsequent price increases', async () => {
      // 1. Create subscription at base Ghazipur price (assume 280 from earlier test)
      const subRes = await request(app)
        .post('/api/library-subscriptions/create')
        .set('Authorization', `Bearer ${libraryOwnerToken}`)
        .send({
          libraryId,
          libraryName: 'Locked Price Study Hall',
          state: 'Uttar Pradesh',
          district: 'Ghazipur',
          planId: 'plan-lib-monthly',
          paymentMethod: 'UPI_QR',
          transactionId: `TXN-PROT-ORIG-${Date.now()}`
        });

      const sub = subRes.body.subscription;
      const lockedPrice = sub.price_locked;

      // 2. Super Admin drastically increases Ghazipur rule price to ₹600
      await request(app)
        .post('/api/library-subscriptions/admin/rules')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          id: 'rule-valid-gzp-update',
          name: 'Ghazipur Post-Launch Increased Price',
          scope_type: 'DISTRICT',
          district: 'Ghazipur',
          state: 'Uttar Pradesh',
          price: 600,
          status: 'ACTIVE',
          effective_from: '2026-01-01'
        });

      // 3. New calculation returns ₹600
      const newCalc = await request(app)
        .post('/api/library-subscriptions/calculate-price')
        .send({ state: 'Uttar Pradesh', district: 'Ghazipur', planId: 'plan-lib-monthly' });
      expect(newCalc.body.finalPayableAmount).toBe(600);

      // 4. Renewal of existing subscription honors lockedPrice
      const renewRes = await request(app)
        .post('/api/library-subscriptions/renew')
        .set('Authorization', `Bearer ${libraryOwnerToken}`)
        .send({
          subscriptionId: sub.id,
          planId: 'plan-lib-monthly',
          paymentMethod: 'UPI_QR',
          transactionId: `TXN-PROT-RENEW-${Date.now()}`
        });

      expect(renewRes.body.subscription.final_paid_amount).toBe(lockedPrice);
    });
  });

  // TEST 12 — COUPON CODES
  describe('TEST 12 — COUPON ENGINE (Section 62 - Test 12)', () => {
    it('applies LIBRARY50 (flat ₹50 off) and WELCOMEFREE (100% off)', async () => {
      // Flat ₹50 off on Pan-India Monthly (₹500 -> ₹450)
      const c50 = await request(app)
        .post('/api/library-subscriptions/calculate-price')
        .send({ state: 'Goa', district: 'North Goa', planId: 'plan-lib-monthly', couponCode: 'LIBRARY50' });

      expect(c50.body.couponDiscount).toBe(50);
      expect(c50.body.finalPayableAmount).toBe(450);

      // 100% off on Pan-India Monthly (₹500 -> ₹0)
      const cFree = await request(app)
        .post('/api/library-subscriptions/calculate-price')
        .send({ state: 'Goa', district: 'North Goa', planId: 'plan-lib-monthly', couponCode: 'WELCOMEFREE' });

      expect(cFree.body.couponDiscount).toBe(500);
      expect(cFree.body.finalPayableAmount).toBe(0);
      expect(cFree.body.isFree).toBe(true);
      expect(cFree.body.paymentRequired).toBe(false);
    });
  });

  // TEST 13 — PRICE TAMPERING PROTECTION
  describe('TEST 13 — PRICE TAMPERING PROTECTION (Section 62 - Test 14)', () => {
    it('enforces server-calculated fee even if client submits manipulated price in body', async () => {
      const subRes = await request(app)
        .post('/api/library-subscriptions/create')
        .set('Authorization', `Bearer ${libraryOwnerToken}`)
        .send({
          libraryId,
          libraryName: 'Tamper Attempt Space',
          state: 'Uttar Pradesh',
          district: 'Ghazipur',
          planId: 'plan-lib-monthly',
          price: 1, // Client tries to pay ₹1 instead of ₹600
          finalPaidAmount: 1,
          paymentMethod: 'UPI_QR',
          transactionId: `TXN-TAMPER-${Date.now()}`
        });

      expect(subRes.status).toBe(201);
      // Backend must have ignored price: 1 and enforced the server calculated price (600)
      expect(subRes.body.subscription.final_paid_amount).toBe(600);
    });
  });

  // TEST 14 — DUPLICATE PAYMENT & IDEMPOTENCY
  describe('TEST 14 — DUPLICATE PAYMENT PROTECTION (Section 62 - Test 15)', () => {
    it('returns existing subscription when identical transaction ID is submitted', async () => {
      const txn = `TXN-IDEMP-${Date.now()}`;

      const res1 = await request(app)
        .post('/api/library-subscriptions/create')
        .set('Authorization', `Bearer ${libraryOwnerToken}`)
        .send({
          libraryId,
          libraryName: 'Idempotency Library',
          state: 'Uttar Pradesh',
          district: 'Ghazipur',
          planId: 'plan-lib-monthly',
          paymentMethod: 'UPI_QR',
          transactionId: txn
        });

      const res2 = await request(app)
        .post('/api/library-subscriptions/create')
        .set('Authorization', `Bearer ${libraryOwnerToken}`)
        .send({
          libraryId,
          libraryName: 'Idempotency Library',
          state: 'Uttar Pradesh',
          district: 'Ghazipur',
          planId: 'plan-lib-monthly',
          paymentMethod: 'UPI_QR',
          transactionId: txn
        });

      expect(res1.body.subscription.id).toBe(res2.body.subscription.id);
    });
  });

  // TEST 15 — NEGATIVE PRICE VALIDATION
  describe('TEST 15 — NEGATIVE PRICE REJECTION (Section 62 - Test 14)', () => {
    it('rejects pricing rules configured with negative price', async () => {
      const res = await request(app)
        .post('/api/library-subscriptions/admin/rules')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          id: 'rule-invalid-negative',
          name: 'Invalid Negative Rule',
          scope_type: 'DISTRICT',
          district: 'Ghazipur',
          state: 'Uttar Pradesh',
          price: -200
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Subscription fee cannot be negative');
    });
  });
});
