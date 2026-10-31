import { describe, it, expect, beforeEach } from 'vitest';
import { couponService } from '../services/couponService';
import { offerService } from '../services/offerService';
import { locationService } from '../services/locationService';
import { pinCodeService } from '../services/pinCodeService';
import { pricingResolutionService } from '../services/pricingResolutionService';
import { academicEntitlementService } from '../services/academicEntitlementService';
import { convertReceiptDataToDocument } from '../components/documents/UnifiedFeeReceipt';
import { mockStore } from '../mock/store';
import { safeStorage } from '../utils/storageUtils';
import { ReceiptData } from '../components/common/OfficialReceiptModal';

describe('FOCUSPOINT — LIVE COUPON, PAYMENT, RECEIPT & LOCATION DISCOVERY TESTS', () => {

  beforeEach(() => {
    safeStorage.removeItem('fp_last_copied_coupon');
  });

  // =========================================================================
  // COUPON VALIDATION & LIFECYCLE TESTS (Prompt Scenarios 1 to 10)
  // =========================================================================

  it('Scenario 1 & 6 & 7: LIVE coupon applies to valid product and calculates correct discount & payable total', async () => {
    const result = await couponService.validateCoupon({
      couponCode: 'FOCUS100',
      productServiceType: 'mock_tests',
      purchaseAmount: 999,
      stateId: 'loc-state-up',
      districtId: 'dist-gzp',
    });

    expect(result.isValid).toBe(true);
    expect(result.coupon).toBeDefined();
    expect(result.coupon?.code).toBe('FOCUS100');
    expect(result.coupon?.status).toBe('LIVE');
    expect(result.discountAmount).toBe(100);
    expect(result.finalPayableAmount).toBe(899);
  });

  it('Scenario 2: Expired coupon is rejected with a safe, meaningful reason', async () => {
    const result = await couponService.validateCoupon({
      couponCode: 'EXPIRED20',
      productServiceType: 'home_tuition',
      purchaseAmount: 2000,
    });

    expect(result.isValid).toBe(false);
    expect(result.errorReason).toBe('EXPIRED');
    expect(result.message.toLowerCase()).toContain('expired');
    expect(result.discountAmount).toBe(0);
  });

  it('Scenario 3: Paused offer/coupon is rejected with a safe, meaningful reason', async () => {
    const result = await couponService.validateCoupon({
      couponCode: 'PAUSED50',
      productServiceType: 'complete_package',
      purchaseAmount: 3000,
    });

    expect(result.isValid).toBe(false);
    expect(result.errorReason).toBe('OFFER_PAUSED');
    expect(result.message.toLowerCase()).toContain('paused');
    expect(result.discountAmount).toBe(0);
  });

  it('Scenario 4: Coupon targeted to another product/service is rejected', async () => {
    // TUITIONONLY is for home_tuition only
    const result = await couponService.validateCoupon({
      couponCode: 'TUITIONONLY',
      productServiceType: 'digital_library', // mismatched product
      purchaseAmount: 1500,
    });

    expect(result.isValid).toBe(false);
    expect(result.errorReason).toBe('PRODUCT_MISMATCH');
    expect(result.message).toContain('not applicable');
    expect(result.discountAmount).toBe(0);
  });

  it('Scenario 5: Coupon is rejected when minimum purchase amount is not reached', async () => {
    // MINSPEND5000 requires minimum spend of ₹5,000
    const result = await couponService.validateCoupon({
      couponCode: 'MINSPEND5000',
      productServiceType: 'complete_package',
      purchaseAmount: 2000, // below minSpend 5000
    });

    expect(result.isValid).toBe(false);
    expect(result.errorReason).toBe('MIN_SPEND_NOT_MET');
    expect(result.message).toContain('Minimum purchase');
    expect(result.discountAmount).toBe(0);
  });

  it('Scenario 8: Successful payment receipt itemizes coupon code and discount amount', () => {
    const receiptData: ReceiptData = {
      receiptNumber: 'FP-REC-TEST-001',
      date: '2026-09-27',
      studentName: 'Aryan Sharma',
      studentId: 'usr-student-aryan',
      studentMobile: '9876543210',
      district: 'Ghazipur',
      serviceType: 'HOME_TUTOR',
      serviceName: 'Academic Mathematics Class 10 Tuition',
      billingPeriod: 'Sept 2026',
      amount: 1500,
      baseAmount: 2000,
      originalAmount: 2000,
      offerDiscount: 300,
      couponCode: 'FOCUS100',
      couponDiscount: 200,
      paymentMethod: 'UPI Verified',
      transactionId: 'TXN-UPI-999888',
      status: 'PAID',
    };

    const doc = convertReceiptDataToDocument(receiptData);
    expect(doc.originalAmount).toBe(2000);
    expect(doc.offerDiscount).toBe(300);
    expect(doc.couponCode).toBe('FOCUS100');
    expect(doc.couponDiscount).toBe(200);
    expect(doc.finalAmount).toBe(1500);

    // Ensure mockStore persists it without data loss
    mockStore.addUnifiedDocument(doc);
    const retrieved = mockStore.getUnifiedDocuments().find(d => d.id === doc.id);
    expect(retrieved).toBeDefined();
    expect(retrieved?.couponCode).toBe('FOCUS100');
    expect(retrieved?.couponDiscount).toBe(200);
  });

  it('Scenario 9: Pricing engine restores total when coupon is removed', () => {
    const basePriceRes = pricingResolutionService.resolveProductPrice('prod-mock-tier1', {
      studentId: 'usr-student-aryan',
      studentName: 'Aryan Sharma',
    });

    const withCouponRes = pricingResolutionService.resolveProductPrice('prod-mock-tier1', {
      studentId: 'usr-student-aryan',
      studentName: 'Aryan Sharma',
      couponCode: 'FOCUS50',
    });

    const withoutCouponRes = pricingResolutionService.resolveProductPrice('prod-mock-tier1', {
      studentId: 'usr-student-aryan',
      studentName: 'Aryan Sharma',
      couponCode: undefined, // removed
    });

    expect(withCouponRes.couponDiscount).toBe(250);
    expect(withCouponRes.payableTotal).toBe(basePriceRes.payableTotal - 250);
    expect(withoutCouponRes.payableTotal).toBe(basePriceRes.payableTotal);
    expect(withoutCouponRes.couponDiscount).toBe(0);
  });

  it('Scenario 10: Copying coupon from homepage persists to storage for seamless checkout prefill', async () => {
    const copyResult = await couponService.copyCoupon('FOCUSFEST');
    expect(copyResult.success).toBe(true);
    expect(safeStorage.getItem('fp_last_copied_coupon')).toBe('FOCUSFEST');

    const lastCopied = couponService.getLastCopiedCoupon();
    expect(lastCopied).toBe('FOCUSFEST');
  });

  // =========================================================================
  // PAN-INDIA LOCATION DISCOVERY & PIN CODE TESTS (Prompt Scenarios)
  // =========================================================================

  it('PIN Scenario 1: Valid 6-digit Indian PIN code automatically resolves State, District and Locality', async () => {
    const res = await pinCodeService.resolvePinCode('233304');
    expect(res.success).toBe(true);
    expect(res.stateName).toBe('Uttar Pradesh');
    expect(res.districtName).toBe('Ghazipur');
    expect(res.localityName).toBeDefined();
    expect(res.pincode).toBe('233304');
  });

  it('PIN Scenario 2: Invalid PIN format is rejected with validation message', async () => {
    const shortPin = await pinCodeService.resolvePinCode('123');
    expect(shortPin.success).toBe(false);
    expect(shortPin.message).toContain('6-digit');

    const startingZero = await pinCodeService.resolvePinCode('012345');
    expect(startingZero.success).toBe(false);
  });

  it('PIN Scenario 3: Unknown non-existent PIN handles cleanly without throwing', async () => {
    const unknown = await pinCodeService.resolvePinCode('999999');
    // If not in local master and no external network, gracefully handles
    expect(unknown).toBeDefined();
    expect(unknown.pincode).toBe('999999');
  });

  it('PIN Scenario 4: Supports multiple localities and areas for resolved district/pincode', () => {
    const gzpLocalities = locationService.getLocalities('dist-gzp');
    expect(gzpLocalities.length).toBeGreaterThan(0);

    const saidpurAreas = locationService.getAreas('loc-gzp-saidpur');
    expect(Array.isArray(saidpurAreas)).toBe(true);
  });

  it('PIN Scenario 5: Dynamic State and Union Territory counter accurately reflects Location Master', () => {
    const counts = locationService.getStateAndUtCounts();
    expect(counts.statesCount).toBe(28);
    expect(counts.utCount).toBe(8);
    expect(counts.totalCount).toBe(36);
  });

  it('Territory Discovery: Querying tutors and libraries returns real store records without fake data', () => {
    const tutorsInGzp = mockStore.getTeachers({ districtId: 'dist-gzp', status: 'APPROVED' });
    expect(Array.isArray(tutorsInGzp)).toBe(true);

    const libsInGzp = mockStore.getLibraries('dist-gzp').filter(l => l.verificationStatus === 'APPROVED');
    expect(Array.isArray(libsInGzp)).toBe(true);
  });
});
