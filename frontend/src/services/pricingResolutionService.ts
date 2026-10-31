// FOCUSPOINT Priority Pricing Resolution Engine
// Hierarchy: Individual Student > Individual Teacher > Individual Library > District > State > Pan-India

import { 
  AcademicProduct, 
  AcademicPricingRule, 
  PricingScope, 
  ResolvedPriceResult 
} from '../types/eligibilityAndPricing';
import { 
  INITIAL_ACADEMIC_PRODUCTS, 
  INITIAL_PRICING_RULES 
} from '../mock/data/eligibilityAndPricingData';

const PRODUCTS_STORAGE_KEY = 'focuspoint_academic_products';
const PRICING_RULES_STORAGE_KEY = 'focuspoint_academic_pricing_rules';

export interface StudentPricingContext {
  studentId: string;
  studentName?: string;
  teacherId?: string;
  libraryId?: string;
  localityId?: string;
  localityName?: string;
  districtId?: string;
  stateId?: string;
  couponCode?: string;
}

class PricingResolutionService {
  private products: AcademicProduct[] = [];
  private pricingRules: AcademicPricingRule[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    try {
      const savedProds = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      this.products = savedProds ? JSON.parse(savedProds) : [...INITIAL_ACADEMIC_PRODUCTS];

      const savedRules = localStorage.getItem(PRICING_RULES_STORAGE_KEY);
      if (savedRules) {
        const parsed: AcademicPricingRule[] = JSON.parse(savedRules);
        const map = new Map<string, AcademicPricingRule>();
        INITIAL_PRICING_RULES.forEach(r => map.set(r.id, r));
        parsed.forEach(r => {
          const initial = map.get(r.id);
          map.set(r.id, initial ? { ...initial, ...r } : r);
        });
        this.pricingRules = Array.from(map.values());
      } else {
        this.pricingRules = [...INITIAL_PRICING_RULES];
      }
    } catch {
      this.products = [...INITIAL_ACADEMIC_PRODUCTS];
      this.pricingRules = [...INITIAL_PRICING_RULES];
    }
  }

  private saveData(): void {
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(this.products));
      localStorage.setItem(PRICING_RULES_STORAGE_KEY, JSON.stringify(this.pricingRules));
      this.notifyListeners();
    } catch (e) {
      console.error('Failed to persist pricing data', e);
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

  public getAllProducts(): AcademicProduct[] {
    return [...this.products];
  }

  public getProductById(id: string): AcademicProduct | undefined {
    return this.products.find(p => p.id === id);
  }

  public getAllPricingRules(): AcademicPricingRule[] {
    return [...this.pricingRules];
  }

  // Core Priority Resolver
  public resolveProductPrice(productId: string, context: StudentPricingContext): ResolvedPriceResult {
    const product = this.getProductById(productId);
    const basePrice = product ? product.basePrice : 499;
    const productName = product ? product.name : 'Mock Test Subscription';

    const now = new Date().toISOString().split('T')[0];

    // Filter active rules for this product
    const candidateRules = this.pricingRules.filter(r => 
      r.status === 'ACTIVE' &&
      r.productId === productId &&
      (!r.effectiveFrom || r.effectiveFrom <= now) &&
      (!r.effectiveUntil || r.effectiveUntil >= now)
    );

    // 1. Individual Student Scope
    if (context.studentId) {
      const studentRule = candidateRules.find(r => r.scope === 'STUDENT' && r.scopeId === context.studentId);
      if (studentRule) {
        return this.buildResult(productName, productId, basePrice, studentRule.price, 'STUDENT', studentRule.scopeName || 'Individual Student Scholar Pricing', studentRule.id, context.couponCode);
      }
    }

    // 2. Individual Teacher Scope
    if (context.teacherId) {
      const teacherRule = candidateRules.find(r => r.scope === 'TEACHER' && r.scopeId === context.teacherId);
      if (teacherRule) {
        return this.buildResult(productName, productId, basePrice, teacherRule.price, 'TEACHER', teacherRule.scopeName || 'Teacher-Referred Student Rate', teacherRule.id, context.couponCode);
      }
    }

    // 3. Individual Library Scope
    if (context.libraryId) {
      const libraryRule = candidateRules.find(r => r.scope === 'LIBRARY' && r.scopeId === context.libraryId);
      if (libraryRule) {
        return this.buildResult(productName, productId, basePrice, libraryRule.price, 'LIBRARY', libraryRule.scopeName || 'Partner Library Special Rate', libraryRule.id, context.couponCode);
      }
    }

    // 4. Locality / Study Cluster Scope (Hyper-local Precedence)
    if (context.localityId || context.localityName) {
      const localityRule = candidateRules.find(r => 
        r.scope === 'LOCALITY' && (
          (context.localityId && (r.scopeId === context.localityId || r.localityId === context.localityId)) ||
          (context.localityName && r.localityName && r.localityName.toLowerCase() === context.localityName.toLowerCase()) ||
          (context.localityName && r.scopeName && r.scopeName.toLowerCase().includes(context.localityName.toLowerCase()))
        )
      );
      if (localityRule) {
        return this.buildResult(productName, productId, basePrice, localityRule.price, 'LOCALITY', localityRule.scopeName || `${localityRule.localityName || 'Locality'} Cluster Rate`, localityRule.id, context.couponCode);
      }
    }

    // 5. District Scope
    if (context.districtId) {
      const districtRule = candidateRules.find(r => r.scope === 'DISTRICT' && (r.scopeId === context.districtId || r.districtId === context.districtId));
      if (districtRule) {
        return this.buildResult(productName, productId, basePrice, districtRule.price, 'DISTRICT', districtRule.scopeName || 'District Priority Rate', districtRule.id, context.couponCode);
      }
    }

    // 6. State Scope
    if (context.stateId) {
      const stateRule = candidateRules.find(r => r.scope === 'STATE' && (r.scopeId === context.stateId || r.stateId === context.stateId));
      if (stateRule) {
        return this.buildResult(productName, productId, basePrice, stateRule.price, 'STATE', stateRule.scopeName || 'State Concession Rate', stateRule.id, context.couponCode);
      }
    }

    // 7. Pan-India Fallback Scope
    const panIndiaRule = candidateRules.find(r => r.scope === 'PAN_INDIA');
    if (panIndiaRule) {
      return this.buildResult(productName, productId, basePrice, panIndiaRule.price, 'PAN_INDIA', 'Pan-India Standard Rate', panIndiaRule.id, context.couponCode);
    }

    // Default Fallback
    return this.buildResult(productName, productId, basePrice, basePrice, 'PAN_INDIA', 'Standard Base Rate', 'default-base', context.couponCode);
  }

  private buildResult(
    productName: string,
    productId: string,
    basePrice: number,
    finalPrice: number,
    appliedScope: PricingScope,
    appliedScopeName: string,
    pricingRuleId: string,
    couponCode?: string
  ): ResolvedPriceResult {
    const scopeDiscount = Math.max(0, basePrice - finalPrice);
    let couponDiscount = 0;
    const breakdown: string[] = [
      `Base Catalog Price: ₹${basePrice}`,
      `Scope Applied: ${appliedScope} (${appliedScopeName}) → ₹${finalPrice}`
    ];

    if (couponCode) {
      const cleanCode = couponCode.trim().toUpperCase();
      if (cleanCode === 'FOCUS50' || cleanCode === 'EXAM50') {
        couponDiscount = Math.round(finalPrice * 0.50);
        breakdown.push(`Coupon ${cleanCode} Applied: -₹${couponDiscount} (50% Off)`);
      } else if (cleanCode === 'STUDY100' || cleanCode === 'MOCK100' || cleanCode === 'FOCUS100') {
        couponDiscount = Math.min(finalPrice, 100);
        breakdown.push(`Coupon ${cleanCode} Applied: -₹${couponDiscount} Flat Off`);
      } else if (cleanCode === 'FOCUSFEST') {
        couponDiscount = Math.min(finalPrice, 200);
        breakdown.push(`Coupon ${cleanCode} Applied: -₹${couponDiscount} Flat Off`);
      } else if (cleanCode === 'SAIDPUR30' || cleanCode === 'FOCUS30' || cleanCode === 'RAHUL30') {
        couponDiscount = Math.round(finalPrice * 0.30);
        breakdown.push(`Coupon ${cleanCode} Applied: -₹${couponDiscount} (30% Off)`);
      } else if (cleanCode === 'SCHOLAR20') {
        couponDiscount = Math.round(finalPrice * 0.20);
        breakdown.push(`Coupon ${cleanCode} Applied: -₹${couponDiscount} (20% Off)`);
      }
    }

    const payableBeforeTax = Math.max(0, finalPrice - couponDiscount);
    const taxAmount = 0; // GST exempt for vocational test vouchers in this tier
    const payableTotal = payableBeforeTax + taxAmount;

    return {
      productId,
      productName,
      basePrice,
      finalPrice: payableBeforeTax,
      appliedScope,
      appliedScopeName,
      pricingRuleId,
      scopeDiscount,
      couponDiscount,
      couponCode,
      taxAmount,
      payableTotal,
      breakdown
    };
  }

  // Super Admin CRUD
  public saveProduct(product: Partial<AcademicProduct>): AcademicProduct {
    if (product.id) {
      const idx = this.products.findIndex(p => p.id === product.id);
      if (idx !== -1) {
        this.products[idx] = {
          ...this.products[idx],
          ...product,
          updatedAt: new Date().toISOString().split('T')[0]
        };
        this.saveData();
        return this.products[idx];
      }
    }

    const newProd: AcademicProduct = {
      id: `prod-${Date.now()}`,
      code: product.code || `PROD-${Date.now()}`,
      name: product.name || 'New Academic Product',
      type: product.type || 'MOCK_TEST_SUBSCRIPTION',
      examId: product.examId,
      examName: product.examName,
      targetClass: product.targetClass || 'ALL',
      targetStream: product.targetStream,
      featuresIncluded: product.featuresIncluded || ['MOCK_TESTS'],
      durationDays: product.durationDays || 30,
      basePrice: product.basePrice || 499,
      description: product.description || '',
      highlights: product.highlights || ['Verified FocusPoint Academic Access'],
      status: 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    this.products.push(newProd);
    this.saveData();
    return newProd;
  }

  public savePricingRule(rule: Partial<AcademicPricingRule>): AcademicPricingRule {
    if (rule.id) {
      const idx = this.pricingRules.findIndex(r => r.id === rule.id);
      if (idx !== -1) {
        this.pricingRules[idx] = {
          ...this.pricingRules[idx],
          ...rule,
          updatedAt: new Date().toISOString().split('T')[0]
        };
        this.saveData();
        return this.pricingRules[idx];
      }
    }

    const newRule: AcademicPricingRule = {
      id: `price-rule-${Date.now()}`,
      productId: rule.productId || 'prod-mock-tests-monthly',
      productName: rule.productName || 'Mock Test Pass',
      scope: rule.scope || 'PAN_INDIA',
      scopeId: rule.scopeId,
      scopeName: rule.scopeName,
      price: rule.price || 499,
      discountPercentage: rule.discountPercentage,
      effectiveFrom: rule.effectiveFrom || new Date().toISOString().split('T')[0],
      effectiveUntil: rule.effectiveUntil,
      status: 'ACTIVE',
      createdBy: 'Super Admin',
      updatedAt: new Date().toISOString().split('T')[0]
    };

    this.pricingRules.unshift(newRule);
    this.saveData();
    return newRule;
  }

  public deletePricingRule(id: string): boolean {
    const prevLen = this.pricingRules.length;
    this.pricingRules = this.pricingRules.filter(r => r.id !== id);
    if (this.pricingRules.length !== prevLen) {
      this.saveData();
      return true;
    }
    return false;
  }
}

export const pricingResolutionService = new PricingResolutionService();
