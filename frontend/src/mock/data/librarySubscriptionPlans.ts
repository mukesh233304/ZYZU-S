import { 
  LibrarySubscriptionPlan, 
  LibrarySubscriptionPricingRule, 
  LibrarySubscription, 
  LibrarySubscriptionPaymentRecord 
} from '../../types/librarySubscriptionPricing';

export const MOCK_LIBRARY_SUBSCRIPTION_PLANS: LibrarySubscriptionPlan[] = [
  {
    id: 'lsp-monthly',
    name: 'Monthly Listing Plan',
    billingCycle: 'MONTHLY',
    durationMonths: 1,
    durationDays: 30,
    basePrice: 500,
    status: 'ACTIVE',
    isPopular: false,
    savingsPercent: 0,
    features: [
      'Pan-India Student Discovery & Map Search',
      'Instant Seat Booking & Desk Matrix',
      'Shift Management & Custom Slots',
      'Student Daily Attendance Tracking',
      'Monthly Revenue Statement & Invoices',
      'FocusPoint Verified Partner Badge'
    ],
    limits: {
      maxDesks: 60,
      maxShifts: 4,
      featuredListing: false
    },
    effectiveFrom: '2026-01-01'
  },
  {
    id: 'lsp-quarterly',
    name: 'Quarterly Growth Plan',
    billingCycle: 'QUARTERLY',
    durationMonths: 3,
    durationDays: 90,
    basePrice: 1299,
    status: 'ACTIVE',
    isPopular: false,
    savingsPercent: 15,
    features: [
      'Everything in Monthly Plan',
      'Priority Search Placement in District',
      'Automated SMS & WhatsApp Enquiry Alerts',
      'Advanced Attendance Analytics & Reports',
      'Up to 100 Desks & 6 Custom Shifts'
    ],
    limits: {
      maxDesks: 100,
      maxShifts: 6,
      featuredListing: false
    },
    effectiveFrom: '2026-01-01'
  },
  {
    id: 'lsp-half-yearly',
    name: 'Half-Yearly Pro Plan',
    billingCycle: 'HALF_YEARLY',
    durationMonths: 6,
    durationDays: 180,
    basePrice: 2399,
    status: 'ACTIVE',
    isPopular: false,
    savingsPercent: 20,
    features: [
      'Everything in Quarterly Plan',
      'Direct WhatsApp Enquiry Widget on Profile',
      'Zero Payment Gateway Processing Surcharge',
      'Priority Verification by District Admin',
      'Digital Student ID Card Generator'
    ],
    limits: {
      maxDesks: 150,
      maxShifts: 8,
      featuredListing: true
    },
    effectiveFrom: '2026-01-01'
  },
  {
    id: 'lsp-yearly',
    name: 'Yearly Listing Plan',
    billingCycle: 'YEARLY',
    durationMonths: 12,
    durationDays: 365,
    basePrice: 4499,
    status: 'ACTIVE',
    isPopular: true,
    savingsPercent: 25,
    features: [
      'Everything in Pro Plan',
      'Featured Library Banner on District Homepage',
      'Unlimited Desks & 24x7 Shift Support',
      'Free Promotional Social Media Campaign',
      'Dedicated District Coordinator Helpline',
      'Guaranteed Price Lock for 2 Full Renewal Cycles'
    ],
    limits: {
      maxDesks: 500,
      maxShifts: 12,
      featuredListing: true
    },
    effectiveFrom: '2026-01-01'
  }
];

export const MOCK_LIBRARY_SUBSCRIPTION_PRICING_RULES: LibrarySubscriptionPricingRule[] = [
  {
    id: 'ls-rule-pan-india',
    name: 'Pan-India Standard Listing Subscription',
    scope: 'PAN_INDIA',
    planId: 'lsp-monthly',
    price: 500,
    currency: 'INR',
    status: 'ACTIVE',
    effectiveFrom: '2026-01-01',
    priceProtection: 'NONE',
    refundPolicy: 'FULL_24H',
    gracePeriodDays: 7,
    updatedAt: '2026-01-01T00:00:00.000Z',
    updatedBy: 'Super Admin'
  },
  {
    id: 'ls-rule-state-up',
    name: 'Uttar Pradesh State Standard Override',
    scope: 'STATE',
    state: 'Uttar Pradesh',
    planId: 'lsp-monthly',
    price: 400,
    currency: 'INR',
    status: 'ACTIVE',
    effectiveFrom: '2026-01-01',
    priceProtection: 'NONE',
    refundPolicy: 'FULL_24H',
    gracePeriodDays: 7,
    updatedAt: '2026-01-01T00:00:00.000Z',
    updatedBy: 'Super Admin'
  },
  {
    id: 'ls-rule-dist-gzp',
    name: 'Ghazipur District Library Override',
    scope: 'DISTRICT',
    state: 'Uttar Pradesh',
    district: 'Ghazipur',
    planId: 'lsp-monthly',
    price: 300,
    currency: 'INR',
    status: 'ACTIVE',
    effectiveFrom: '2026-01-01',
    priceProtection: 'NONE',
    refundPolicy: 'FULL_24H',
    gracePeriodDays: 7,
    updatedAt: '2026-01-01T00:00:00.000Z',
    updatedBy: 'Super Admin'
  },
  {
    id: 'ls-rule-part-focus',
    name: 'FocusPoint Premier Study Library - Saidpur Individual Override',
    scope: 'PARTICULAR',
    state: 'Uttar Pradesh',
    district: 'Ghazipur',
    libraryId: 'lib-focus-saidpur',
    libraryName: 'FocusPoint Premier Study Library - Saidpur',
    planId: 'lsp-monthly',
    price: 200,
    currency: 'INR',
    status: 'ACTIVE',
    effectiveFrom: '2026-01-01',
    priceProtection: 'LOCKED',
    lockedCycles: 3,
    refundPolicy: 'FULL_24H',
    gracePeriodDays: 7,
    updatedAt: '2026-01-01T00:00:00.000Z',
    updatedBy: 'Super Admin'
  }
];

const now = new Date();
const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();
const twoHoursAgoPlus24h = new Date(new Date(twoHoursAgo).getTime() + 24 * 60 * 60 * 1000).toISOString();

const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString();
const fiveDaysAgoPlus24h = new Date(new Date(fiveDaysAgo).getTime() + 24 * 60 * 60 * 1000).toISOString();

const thirtyDaysLater = new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);
const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);

export const MOCK_LIBRARY_SUBSCRIPTIONS: LibrarySubscription[] = [
  {
    id: 'lsub-001',
    libraryId: 'lib-focus-saidpur',
    libraryName: 'FocusPoint Premier Study Library - Saidpur',
    ownerId: 'usr-lib-suresh',
    ownerName: 'Suresh Chandra Yadav',
    ownerEmail: 'suresh.library@focuspoint.internal',
    ownerMobile: '9415201122',
    state: 'Uttar Pradesh',
    district: 'Ghazipur',
    planId: 'lsp-monthly',
    planName: 'Monthly Listing Plan',
    billingCycle: 'MONTHLY',
    basePrice: 200,
    pricingRuleId: 'ls-rule-part-focus',
    pricingScope: 'PARTICULAR',
    offerDiscount: 0,
    couponDiscount: 0,
    finalPaidAmount: 200,
    isFree: false,
    status: 'ACTIVE',
    paymentId: 'PAY-LS-00192',
    paymentMethod: 'UPI_QR',
    startDate: fiveDaysAgo.substring(0, 10),
    expiryDate: thirtyDaysLater,
    renewalDate: thirtyDaysLater,
    activatedAt: fiveDaysAgo,
    autoRenew: true,
    cancellationDeadline: fiveDaysAgoPlus24h,
    priceProtection: 'LOCKED',
    lockedPrice: 200,
    invoiceNumber: 'INV-LS-2026-001',
    createdAt: fiveDaysAgo,
    updatedAt: fiveDaysAgo
  },
  {
    id: 'lsub-002',
    libraryId: 'lib-vidya-gzp',
    libraryName: 'Vidya Jyoti Digital Library - Ghazipur City',
    ownerId: 'usr-lib-ramesh',
    ownerName: 'Rameshwar Nath Rai',
    ownerEmail: 'rameshwar.rai@focuspoint.internal',
    ownerMobile: '9838012345',
    state: 'Uttar Pradesh',
    district: 'Ghazipur',
    planId: 'lsp-monthly',
    planName: 'Monthly Listing Plan',
    billingCycle: 'MONTHLY',
    basePrice: 300,
    pricingRuleId: 'ls-rule-dist-gzp',
    pricingScope: 'DISTRICT',
    offerDiscount: 0,
    couponDiscount: 0,
    finalPaidAmount: 300,
    isFree: false,
    status: 'ACTIVE',
    paymentId: 'PAY-LS-00288',
    paymentMethod: 'ONLINE_GATEWAY',
    startDate: now.toISOString().substring(0, 10),
    expiryDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
    renewalDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
    activatedAt: twoHoursAgo,
    autoRenew: true,
    cancellationDeadline: twoHoursAgoPlus24h, // Active cancellation window with ~22 hours left!
    priceProtection: 'NONE',
    invoiceNumber: 'INV-LS-2026-002',
    createdAt: twoHoursAgo,
    updatedAt: twoHoursAgo
  },
  {
    id: 'lsub-003',
    libraryId: 'lib-saraswati-zamania',
    libraryName: 'Saraswati Abhyas Kendra & Library - Zamania',
    ownerId: 'usr-lib-dinesh',
    ownerName: 'Dinesh Kumar Bind',
    ownerEmail: 'dinesh.bind@focuspoint.internal',
    ownerMobile: '9919234567',
    state: 'Uttar Pradesh',
    district: 'Ghazipur',
    planId: 'lsp-monthly',
    planName: 'Monthly Listing Plan',
    billingCycle: 'MONTHLY',
    basePrice: 300,
    pricingRuleId: 'ls-rule-dist-gzp',
    pricingScope: 'DISTRICT',
    offerDiscount: 0,
    couponDiscount: 0,
    finalPaidAmount: 300,
    isFree: false,
    status: 'GRACE_PERIOD',
    paymentId: 'PAY-LS-00085',
    paymentMethod: 'UPI_QR',
    startDate: '2026-08-15',
    expiryDate: twoDaysAgo,
    renewalDate: twoDaysAgo,
    activatedAt: '2026-08-15T10:00:00.000Z',
    autoRenew: false,
    cancellationDeadline: '2026-08-16T10:00:00.000Z',
    priceProtection: 'NONE',
    invoiceNumber: 'INV-LS-2026-000',
    createdAt: '2026-08-15T10:00:00.000Z',
    updatedAt: '2026-09-17T00:00:00.000Z'
  }
];

export const MOCK_LIBRARY_SUBSCRIPTION_PAYMENTS: LibrarySubscriptionPaymentRecord[] = [
  {
    id: 'pay-ls-001',
    subscriptionId: 'lsub-001',
    libraryId: 'lib-focus-saidpur',
    libraryName: 'FocusPoint Premier Study Library - Saidpur',
    ownerName: 'Suresh Chandra Yadav',
    ownerEmail: 'suresh.library@focuspoint.internal',
    ownerMobile: '9415201122',
    state: 'Uttar Pradesh',
    district: 'Ghazipur',
    planId: 'lsp-monthly',
    planName: 'Monthly Listing Plan',
    billingCycle: 'MONTHLY',
    originalFee: 200,
    offerDiscount: 0,
    couponDiscount: 0,
    finalAmount: 200,
    currency: 'INR',
    paymentId: 'PAY-LS-00192',
    paymentMethod: 'UPI_QR',
    paymentStatus: 'PAID',
    subscriptionStatus: 'ACTIVE',
    invoiceNumber: 'INV-LS-2026-001',
    createdAt: fiveDaysAgo,
    confirmedAt: fiveDaysAgo
  },
  {
    id: 'pay-ls-002',
    subscriptionId: 'lsub-002',
    libraryId: 'lib-vidya-gzp',
    libraryName: 'Vidya Jyoti Digital Library - Ghazipur City',
    ownerName: 'Rameshwar Nath Rai',
    ownerEmail: 'rameshwar.rai@focuspoint.internal',
    ownerMobile: '9838012345',
    state: 'Uttar Pradesh',
    district: 'Ghazipur',
    planId: 'lsp-monthly',
    planName: 'Monthly Listing Plan',
    billingCycle: 'MONTHLY',
    originalFee: 300,
    offerDiscount: 0,
    couponDiscount: 0,
    finalAmount: 300,
    currency: 'INR',
    paymentId: 'PAY-LS-00288',
    paymentMethod: 'ONLINE_GATEWAY',
    paymentStatus: 'PAID',
    subscriptionStatus: 'ACTIVE',
    invoiceNumber: 'INV-LS-2026-002',
    createdAt: twoHoursAgo,
    confirmedAt: twoHoursAgo
  }
];
