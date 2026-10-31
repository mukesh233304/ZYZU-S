// FOCUSPOINT — Digital Learning Store
// Advanced MNC-Style EdTech Catalog, Dynamic Priority Pricing & Entitlement Fulfillment

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Tag, 
  CreditCard, 
  ArrowRight, 
  Zap, 
  Clock, 
  BookOpen, 
  Check, 
  Info,
  Calendar,
  Layers,
  Search,
  Receipt,
  GraduationCap,
  Target,
  FileText,
  X,
  Building2,
  RefreshCw
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { pricingResolutionService, StudentPricingContext } from '../../services/pricingResolutionService';
import { academicEntitlementService } from '../../services/academicEntitlementService';
import { AcademicProduct, ResolvedPriceResult, StudentSubscription } from '../../types/eligibilityAndPricing';
import { CheckoutCouponSection } from '../../components/checkout/CheckoutCouponSection';
import { CouponValidationResult, OfferServiceType } from '../../types/homepage';

export const DigitalLearningStore: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const studentId = user?.id || 'usr-student-aryan';
  const studentName = user?.name || 'Aryan Sharma';

  // Student pricing context
  const pricingContext: StudentPricingContext = useMemo(() => ({
    studentId,
    studentName,
    teacherId: (user as any)?.assignedTeacherId || 'usr-teacher-rajesh',
    libraryId: (user as any)?.libraryId || 'lib-saidpur-central',
    districtId: (user as any)?.districtId || 'dist-gzp',
    stateId: (user as any)?.stateId || 'loc-state-up'
  }), [studentId, studentName, user]);

  const [products, setProducts] = useState<AcademicProduct[]>([]);
  const [activeSubscriptions, setActiveSubscriptions] = useState<StudentSubscription[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Checkout & Details Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<AcademicProduct | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NETBANKING'>('UPI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseSuccessSub, setPurchaseSuccessSub] = useState<StudentSubscription | null>(null);

  // Load products and existing student subscriptions
  const refreshStore = () => {
    const allProds = pricingResolutionService.getAllProducts().filter(p => p.status === 'ACTIVE' || p.isActive !== false);
    setProducts(allProds);
    const subs = academicEntitlementService.getStudentSubscriptions(studentId);
    setActiveSubscriptions(subs.filter(s => s.status === 'ACTIVE'));
  };

  useEffect(() => {
    refreshStore();
    const unsubPrice = pricingResolutionService.subscribe(refreshStore);
    const unsubEntitle = academicEntitlementService.subscribe(refreshStore);
    return () => {
      unsubPrice();
      unsubEntitle();
    };
  }, [studentId]);

  // Resolved prices map for each product
  const resolvedPrices = useMemo(() => {
    const map = new Map<string, ResolvedPriceResult>();
    products.forEach(p => {
      const res = pricingResolutionService.resolveProductPrice(p.id, {
        ...pricingContext,
        couponCode: appliedCoupon || undefined
      });
      map.set(p.id, res);
    });
    return map;
  }, [products, pricingContext, appliedCoupon]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCategory = 
        selectedCategory === 'ALL' ||
        (selectedCategory === 'COMPLETE' && (p.type === 'COMPLETE_PACKAGE' || p.type === 'COMPLETE_EXAM_PACKAGE' || p.type === 'EXAM_PACKAGE')) ||
        (selectedCategory === 'MOCK' && p.type === 'MOCK_TEST_SUBSCRIPTION') ||
        (selectedCategory === 'STUDY' && p.type === 'STUDY_MATERIAL_SUBSCRIPTION') ||
        (selectedCategory === 'INTELLIGENCE' && (p.type === 'GROWING_INTELLIGENCE' || p.type === 'GROWING_INTELLIGENCE_SUBSCRIPTION' || p.type === 'MISTAKE_BOOK'));

      const query = searchQuery.trim().toLowerCase();
      const matchSearch = 
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        (p.targetAudience && p.targetAudience.toLowerCase().includes(query)) ||
        (p.targetClass && p.targetClass.toLowerCase().includes(query)) ||
        (p.examName && p.examName.toLowerCase().includes(query));

      return matchCategory && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Handle Checkout initiation
  const handleOpenCheckout = (product: AcademicProduct) => {
    setSelectedProduct(product);
    setAppliedCoupon(null);
    setPurchaseSuccessSub(null);
    setIsCheckoutOpen(true);
  };

  const mapProductTypeToService = (type: string): OfferServiceType => {
    if (type.includes('MOCK')) return 'mock_tests';
    if (type.includes('STUDY')) return 'study_materials';
    if (type.includes('LIBRARY')) return 'digital_library';
    if (type.includes('TUITION')) return 'home_tuition';
    if (type.includes('PACKAGE')) return 'complete_package';
    return 'subscription';
  };

  // Execute Purchase
  const handleConfirmPurchase = () => {
    if (!selectedProduct) return;
    const currentPrice = resolvedPrices.get(selectedProduct.id);
    if (!currentPrice) return;

    setIsProcessing(true);

    setTimeout(() => {
      const mockPaymentId = `pay_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      const result = academicEntitlementService.activatePurchase(
        studentId,
        studentName,
        currentPrice,
        mockPaymentId
      );

      setIsProcessing(false);

      if (result.success && result.subscription) {
        setPurchaseSuccessSub(result.subscription);
        showToast(`🎉 Subscription to ${selectedProduct.name} activated!`, 'success');
        refreshStore();
      } else {
        showToast(result.error || 'Failed to complete purchase', 'error');
      }
    }, 1200);
  };

  const getScopeBadge = (scope: string) => {
    switch (scope) {
      case 'STUDENT':
        return <span className="text-[11px] font-black px-3 py-1 rounded-full bg-emerald-950/90 text-emerald-200 border border-emerald-500/60 shadow-xs">Individual Scholar Rate</span>;
      case 'TEACHER':
        return <span className="text-[11px] font-black px-3 py-1 rounded-full bg-blue-950/90 text-blue-200 border border-blue-500/60 shadow-xs">Educator Referral Benefit</span>;
      case 'LIBRARY':
        return <span className="text-[11px] font-black px-3 py-1 rounded-full bg-purple-950/90 text-purple-200 border border-purple-500/60 shadow-xs">Partner Library Concession</span>;
      case 'DISTRICT':
        return <span className="text-[11px] font-black px-3 py-1 rounded-full bg-amber-950/90 text-amber-200 border border-amber-500/60 shadow-xs">District Priority Rate</span>;
      case 'STATE':
        return <span className="text-[11px] font-black px-3 py-1 rounded-full bg-cyan-950/90 text-cyan-200 border border-cyan-500/60 shadow-xs">State Quota Rate</span>;
      default:
        return <span className="text-[11px] font-black px-3 py-1 rounded-full bg-slate-800 text-slate-100 border border-slate-600 shadow-xs">Pan-India Standard</span>;
    }
  };

  const categories = [
    { id: 'ALL', label: 'All Resources', count: products.length, icon: Sparkles },
    { id: 'MOCK', label: 'Mock Tests', count: products.filter(p => p.type === 'MOCK_TEST_SUBSCRIPTION').length, icon: Target },
    { id: 'STUDY', label: 'Study Materials', count: products.filter(p => p.type === 'STUDY_MATERIAL_SUBSCRIPTION').length, icon: BookOpen },
    { id: 'COMPLETE', label: 'Exam Bundles', count: products.filter(p => p.type === 'COMPLETE_PACKAGE' || p.type === 'COMPLETE_EXAM_PACKAGE' || p.type === 'EXAM_PACKAGE').length, icon: Layers },
    { id: 'INTELLIGENCE', label: 'AI Growth & Mistake Book', count: products.filter(p => p.type === 'GROWING_INTELLIGENCE' || p.type === 'GROWING_INTELLIGENCE_SUBSCRIPTION' || p.type === 'MISTAKE_BOOK').length, icon: Zap },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Hero Header Banner — MNC EdTech Aesthetics */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 border-2 border-indigo-500/40 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl -z-10" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/80 border border-indigo-400/60 text-cyan-300 text-xs font-black uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              ZYZU'S Digital Learning Store
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight drop-shadow-sm">
              Digital Learning Store
            </h1>
            <p className="text-slate-200 text-xs sm:text-sm max-w-2xl leading-relaxed font-medium">
              Study smarter with curated learning resources, practice materials and exam preparation products.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button 
              type="button"
              onClick={() => navigate('/student/subscriptions')}
              className="px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-cyan-300 hover:text-white border-2 border-cyan-500/60 shadow-lg text-xs font-black flex items-center gap-2 transition-all cursor-pointer hover:border-cyan-400"
            >
              <Receipt className="w-4 h-4 text-cyan-400" />
              <span>My Subscriptions ({activeSubscriptions.length})</span>
            </button>
            <button 
              type="button"
              onClick={() => navigate('/student/mock-tests')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white text-xs font-black shadow-lg shadow-indigo-600/35 border border-indigo-400 flex items-center gap-2 transition-all cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Target className="w-4 h-4" />
              <span>Mock Test Center</span>
            </button>
          </div>
        </div>

        {/* Priority Scholar Status Strip */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center gap-3 text-xs text-slate-300">
          <span className="font-bold text-emerald-300 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Verified Concession Hierarchy:
          </span>
          <span className="bg-slate-900/95 px-3 py-1.5 rounded-xl border border-indigo-500/30 text-slate-300 shadow-inner">
            Student: <strong className="text-white font-black">{studentName}</strong>
          </span>
          <span className="bg-slate-900/95 px-3 py-1.5 rounded-xl border border-indigo-500/30 text-slate-300 shadow-inner">
            District: <strong className="text-white font-black">Ghazipur (UP)</strong>
          </span>
          <span className="bg-slate-900/95 px-3 py-1.5 rounded-xl border border-indigo-500/30 text-slate-300 shadow-inner">
            Library: <strong className="text-white font-black">Saidpur Central</strong>
          </span>
          <span className="text-amber-300 text-xs ml-auto font-bold bg-amber-950/60 px-3 py-1 rounded-lg border border-amber-500/40">
            *Highest eligible discount automatically applies at checkout
          </span>
        </div>
      </div>

      {/* Filter and Category Cards Bar */}
      <div className="space-y-4">
        {/* Category Navigation Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {categories.map(cat => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600 border-indigo-300 text-white shadow-xl shadow-indigo-600/30 scale-[1.02]'
                    : 'bg-slate-900/95 hover:bg-slate-850 border-slate-800 text-slate-100 hover:border-indigo-500/50 hover:shadow-lg'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-800 text-cyan-400 border border-slate-700'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-white text-indigo-900' : 'bg-slate-800 text-cyan-300 border border-slate-700'
                  }`}>
                    {cat.count}
                  </span>
                </div>
                <div className="font-black text-xs sm:text-sm tracking-tight truncate text-white">
                  {cat.label}
                </div>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="text-xs text-slate-300 font-medium">
            Showing <strong className="text-cyan-400 font-bold">{filteredProducts.length}</strong> learning products
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by exam, subject, or material..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-slate-900 border-2 border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Product Catalog Grid */}
      {filteredProducts.length === 0 ? (
        <div className="p-12 text-center border-dashed border-2 border-slate-800 bg-slate-950/60 rounded-3xl shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-indigo-950/80 border-2 border-indigo-500/40 text-cyan-400 mx-auto flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/10">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-white mb-2">No Products Match Your Search</h3>
          <p className="text-slate-300 text-xs sm:text-sm max-w-md mx-auto mb-6 font-medium">
            We couldn't find learning resources matching "{searchQuery}". Try searching for popular exams like "NEET", "JEE", or "UP Police".
          </p>
          <button 
            type="button"
            onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-black text-xs shadow-lg shadow-indigo-600/30 cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => {
            const pricing = resolvedPrices.get(product.id) || {
              basePrice: product.basePrice,
              payableTotal: product.basePrice,
              appliedScope: 'PAN_INDIA',
              appliedScopeName: 'Pan-India Standard',
              scopeDiscount: 0,
              couponDiscount: 0
            };

            // Check if student has active subscription
            const activeSub = activeSubscriptions.find(s => s.productId === product.id);

            return (
              <div 
                key={product.id}
                className={`relative flex flex-col justify-between overflow-hidden p-6 rounded-3xl border-2 transition-all duration-200 text-white ${
                  activeSub 
                    ? 'border-emerald-500/70 bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/40 shadow-2xl shadow-emerald-950/40' 
                    : 'border-slate-800 hover:border-indigo-500/60 bg-gradient-to-b from-slate-900 to-slate-950 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/15 group'
                }`}
              >
                <div className="space-y-4">
                  {/* Top Scope & Duration Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    {getScopeBadge(pricing.appliedScope)}
                    <span className="text-xs text-cyan-300 bg-slate-950/90 px-3 py-1 rounded-full border border-slate-700/80 flex items-center gap-1.5 font-mono font-bold shadow-inner">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      {product.durationDays} Days Pass
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-xl font-black text-white leading-snug tracking-tight group-hover:text-cyan-200 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-200 mt-2 line-clamp-2 leading-relaxed font-normal">
                      {product.description}
                    </p>
                  </div>

                  {/* Exam & Class Badges */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {product.examName && (
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-950/90 border border-indigo-400/50 text-indigo-200 text-[11px] font-black">
                        {product.examName}
                      </span>
                    )}
                    {product.targetAudience && (
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-[11px] font-bold">
                        {product.targetAudience}
                      </span>
                    )}
                    <span className="px-2.5 py-1 rounded-lg bg-amber-950/90 border border-amber-500/60 text-amber-200 text-[11px] font-black">
                      {pricing.payableTotal === 0 ? 'FREE PASS' : 'PREMIUM PASS'}
                    </span>
                  </div>

                  {/* Included Benefits List */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800/90 space-y-2">
                    <div className="text-[11px] font-black text-indigo-300 uppercase tracking-wider">
                      Included Learning Benefits:
                    </div>
                    <div className="space-y-1.5">
                      {product.featuresIncluded.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-100 font-medium">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="leading-snug">
                            {(feat === 'MOCK_TESTS' || feat === 'ALL_MOCK_TESTS') && 'Full-Length Timed Mock Tests with AIR Ranking'}
                            {feat === 'SUBJECT_MOCK_TESTS' && 'Subject & Chapter-Wise Practice Modules'}
                            {feat === 'STUDY_MATERIAL' && 'High-Yield Formula Vault & Concept Notes'}
                            {feat === 'GROWING_INTELLIGENCE' && 'Academic Growth Intelligence & Diagnostic Analytics'}
                            {feat === 'MISTAKE_BOOK' && 'Automated Personal Mistake Book & Re-practice'}
                            {feat === 'PERFORMANCE_ANALYTICS' && 'Pan-India Percentile & Accuracy Breakdown'}
                            {feat === 'GOVT_EXAMS' && 'Recruitment Exam Mock Test Series'}
                            {feat === 'ADMISSION_EXAMS' && 'School Entrance & Admission Exam Pass'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pricing & CTA Action Section */}
                <div className="mt-6 pt-4 border-t border-slate-800/90 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] text-slate-300 uppercase font-mono font-bold block">Effective Total</span>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-3xl font-black text-white font-mono tracking-tight">
                          ₹{pricing.payableTotal}
                        </span>
                        {pricing.scopeDiscount > 0 && (
                          <span className="text-sm line-through text-slate-400 font-mono font-medium">
                            ₹{pricing.basePrice}
                          </span>
                        )}
                      </div>
                    </div>

                    {pricing.scopeDiscount > 0 && (
                      <div className="text-right">
                        <span className="text-xs font-black text-emerald-200 bg-emerald-950 border-2 border-emerald-400 px-2.5 py-1 rounded-lg shadow-sm">
                          Save ₹{pricing.scopeDiscount}
                        </span>
                        <div className="text-[10px] text-emerald-300 font-medium mt-1">
                          {pricing.appliedScopeName}
                        </div>
                      </div>
                    )}
                  </div>

                  {activeSub ? (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs px-3.5 py-2.5 rounded-xl bg-emerald-950/90 border-2 border-emerald-500/60 text-emerald-200 font-bold shadow-inner">
                        <span className="flex items-center gap-1.5 font-black">
                          <Check className="w-4 h-4 text-emerald-300 stroke-[3]" />
                          Included in Subscription
                        </span>
                        <span className="text-[11px] font-mono text-emerald-300 font-bold">Valid till {activeSub.endDate}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2.5 pt-1">
                        <button
                          type="button"
                          onClick={() => navigate('/student/mock-tests')}
                          className="w-full py-2.5 px-3 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/25 border border-emerald-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <Target className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
                          <span>Open &amp; Practice</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenCheckout(product)}
                          className="w-full py-2.5 px-3 rounded-xl text-xs font-black bg-gradient-to-r from-amber-400 via-amber-300 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 shadow-lg shadow-amber-500/30 border border-amber-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
                          <span>Extend Early</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={() => handleOpenCheckout(product)}
                        className="w-full py-2.5 px-3 rounded-xl text-xs font-black bg-slate-800 hover:bg-slate-700 text-cyan-300 border-2 border-cyan-500/50 shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:border-cyan-400"
                      >
                        <span>View Details</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenCheckout(product)}
                        className="w-full py-2.5 px-3 rounded-xl text-xs font-black bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400 flex items-center justify-center gap-1.5 transition-all cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                        <span>Buy Pass</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Checkout & Detail Modal */}
      <Modal
        isOpen={isCheckoutOpen}
        onClose={() => {
          if (!isProcessing) setIsCheckoutOpen(false);
        }}
        title="Complete Your Academic Subscription"
      >
        {selectedProduct && (
          <div className="space-y-6">
            {purchaseSuccessSub ? (
              /* Success State */
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 text-emerald-400 flex items-center justify-center mx-auto animate-bounce shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">Subscription Active!</h3>
                  <p className="text-xs text-slate-200 mt-1 font-medium">
                    Your digital pass for <strong className="text-cyan-300 font-bold">{selectedProduct.name}</strong> has been provisioned.
                  </p>
                </div>

                <div className="bg-slate-900 border-2 border-indigo-500/30 rounded-2xl p-4 text-left space-y-2 text-xs shadow-inner">
                  <div className="flex justify-between text-slate-300 font-medium">
                    <span>Invoice Ref:</span>
                    <span className="font-mono text-cyan-300 font-bold">{purchaseSuccessSub.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between text-slate-300 font-medium">
                    <span>Valid Through:</span>
                    <span className="font-mono text-emerald-400 font-bold">{purchaseSuccessSub.endDate}</span>
                  </div>
                  <div className="flex justify-between text-slate-300 font-medium">
                    <span>Total Amount Paid:</span>
                    <span className="font-mono font-black text-white">₹{purchaseSuccessSub.finalPaidAmount}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCheckoutOpen(false);
                      navigate('/student/subscriptions');
                    }}
                    className="px-4 py-2.5 rounded-xl text-xs font-black bg-slate-800 hover:bg-slate-700 text-cyan-300 border-2 border-cyan-500/60 transition-all cursor-pointer"
                  >
                    View My Subscriptions
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCheckoutOpen(false);
                      navigate('/student/mock-tests');
                    }}
                    className="px-4 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Launch Mock Tests</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </button>
                </div>
              </div>
            ) : (
              /* Review & Pay State */
              <>
                {/* Product Summary */}
                <div className="p-4 rounded-2xl bg-slate-900 border-2 border-indigo-500/40 space-y-2 shadow-inner">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-indigo-300 font-black uppercase tracking-wider">
                      Selected Plan
                    </span>
                    <span className="text-xs text-cyan-300 font-mono font-bold">
                      {selectedProduct.durationDays} Days Pass
                    </span>
                  </div>
                  <h4 className="text-lg font-black text-white">{selectedProduct.name}</h4>
                  <p className="text-xs text-slate-200 leading-relaxed font-normal">{selectedProduct.description}</p>
                </div>

                {/* Reusable MNC Checkout Coupon Section */}
                <CheckoutCouponSection
                  theme="dark"
                  originalAmount={selectedProduct.basePrice}
                  productServiceType={mapProductTypeToService(selectedProduct.type)}
                  stateId={pricingContext.stateId}
                  districtId={pricingContext.districtId}
                  studentId={pricingContext.studentId}
                  onCouponApplied={(res: CouponValidationResult) => {
                    setAppliedCoupon(res.couponCode);
                    showToast(`✓ Coupon ${res.couponCode} applied: Save ₹${res.discountAmount}!`, 'success');
                  }}
                  onCouponRemoved={() => {
                    setAppliedCoupon(null);
                    showToast('Coupon removed.', 'info');
                  }}
                />

                {/* Price Breakdown */}
                {(() => {
                  const pricing = resolvedPrices.get(selectedProduct.id);
                  if (!pricing) return null;

                  return (
                    <div className="p-4 rounded-2xl bg-slate-950 border-2 border-slate-800 space-y-2.5 text-xs shadow-inner">
                      <div className="flex justify-between text-slate-300 font-medium">
                        <span>Base Catalog Price</span>
                        <span className="font-mono text-white font-bold">₹{pricing.basePrice}</span>
                      </div>

                      {pricing.scopeDiscount > 0 && (
                        <div className="flex justify-between text-emerald-400 font-bold">
                          <span>{pricing.appliedScopeName} Concession</span>
                          <span className="font-mono">-₹{pricing.scopeDiscount}</span>
                        </div>
                      )}

                      {pricing.couponDiscount > 0 && (
                        <div className="flex justify-between text-emerald-400 font-bold">
                          <span>Coupon Discount</span>
                          <span className="font-mono">-₹{pricing.couponDiscount}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-slate-300 font-medium">
                        <span>GST / Education Surcharge</span>
                        <span className="font-mono text-emerald-400 font-bold">Exempted</span>
                      </div>

                      <div className="border-t border-slate-800 pt-2 flex justify-between items-baseline text-sm font-black">
                        <span className="text-white">Payable Total</span>
                        <span className="text-2xl font-mono text-emerald-400">₹{pricing.payableTotal}</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Payment Method Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-200">Payment Channel</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'UPI', label: 'UPI / QR', icon: Zap },
                      { id: 'CARD', label: 'Debit / Card', icon: CreditCard },
                      { id: 'NETBANKING', label: 'Netbanking', icon: Building2 },
                    ].map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id as any)}
                        className={`p-2.5 rounded-xl border-2 text-center text-xs font-bold transition-all cursor-pointer ${
                          paymentMethod === m.id
                            ? 'bg-indigo-600/30 border-indigo-400 text-white shadow-md'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Confirm Action */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleConfirmPurchase}
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-black py-3.5 rounded-xl shadow-xl shadow-indigo-600/35 text-xs sm:text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isProcessing ? 'Activating Digital Pass...' : `Authorize & Activate (₹${resolvedPrices.get(selectedProduct.id)?.payableTotal || 0})`}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
