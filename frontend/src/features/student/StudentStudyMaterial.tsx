// FOCUSPOINT Student Study Material Hub
// Class-scoped browsing, Category taxonomies, Quota meter, Coupon checkout, and Sample PDF preview

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, Download, Search, Sparkles, Filter, CheckCircle2, 
  AlertCircle, Lock, Tag, Clock, ArrowRight, FileText, Check, 
  ChevronRight, RefreshCw, Eye, ShieldCheck, Star, Layers, 
  HelpCircle, CreditCard, X, ShoppingBag, Percent, AlertTriangle,
  Play
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { studyMaterialService } from '../../services/studyMaterialService';
import { 
  STUDY_MATERIAL_CLASSES, 
  STUDY_MATERIAL_CATEGORIES, 
  STUDY_MATERIAL_SUBJECTS, 
  DIFFICULTY_LEVELS,
  DEFAULT_MONTHLY_DOWNLOAD_LIMIT 
} from '../../constants/studyMaterial';
import { 
  StudyMaterial, 
  StudyMaterialAccessEvaluation, 
  DownloadAllowance, 
  StudyMaterialPurchase, 
  StudyMaterialDownloadRecord, 
  StudyMaterialOffer 
} from '../../types/studyMaterial';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

export const StudentStudyMaterial: React.FC = () => {
  const { user } = useAuth();

  // Selected filters
  const [mainTrack, setMainTrack] = useState<'ALL' | 'ACADEMIC' | 'ENTRANCE' | 'GOVERNMENT'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedBoard, setSelectedBoard] = useState<string>('ALL');
  const [selectedExam, setSelectedExam] = useState<string>('ALL');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [selectedPaidFilter, setSelectedPaidFilter] = useState<'ALL' | 'FREE' | 'PAID' | 'OWNED'>('ALL');
  const [selectedSort, setSelectedSort] = useState<'RECOMMENDED' | 'POPULAR' | 'NEWEST' | 'RATING' | 'PRICE_LOW'>('RECOMMENDED');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'BROWSE' | 'MY_DOWNLOADS' | 'MY_PURCHASES'>('BROWSE');

  // Core data states
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [allowance, setAllowance] = useState<DownloadAllowance | null>(null);
  const [purchases, setPurchases] = useState<StudyMaterialPurchase[]>([]);
  const [downloads, setDownloads] = useState<StudyMaterialDownloadRecord[]>([]);
  const [offers, setOffers] = useState<StudyMaterialOffer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals state
  const [previewMaterial, setPreviewMaterial] = useState<StudyMaterial | null>(null);
  const [checkoutMaterial, setCheckoutMaterial] = useState<StudyMaterial | null>(null);
  const [couponCode, setCouponCode] = useState<string>('');
  const [couponValidation, setCouponValidation] = useState<{
    applied: boolean;
    discount: number;
    message: string;
    offer?: StudyMaterialOffer;
  }>({ applied: false, discount: 0, message: '' });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'UPI' | 'CARD' | 'NET_BANKING'>('UPI');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Student Profile Class
  const studentGrade = (user as any)?.grade || (user as any)?.currentClass || 'Class 10';
  const studentDistrict = (user as any)?.district || (user as any)?.districtName || 'Ghazipur';

  // Load Data
  const loadData = () => {
    setLoading(true);
    try {
      const allMaterials = studyMaterialService.getMaterials({ status: 'PUBLISHED' });
      setMaterials(allMaterials);

      if (user?.id) {
        const studentAllowance = studyMaterialService.getDownloadAllowance(user.id, studentDistrict, studentGrade);
        setAllowance(studentAllowance);

        const studentPurchases = studyMaterialService.getStudentPurchases(user.id);
        setPurchases(studentPurchases);

        const studentDownloads = studyMaterialService.getStudentDownloadHistory(user.id);
        setDownloads(studentDownloads);
      }

      const activeOffers = studyMaterialService.getOffers().filter(o => o.isActive);
      setOffers(activeOffers);
    } catch (e) {
      console.error('Failed to load study materials', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Dynamic filter application
  const filteredMaterials = useMemo(() => {
    const purchasedIds = new Set(purchases.map(p => p.materialId));

    let list = materials.filter(m => {
      // Main Track (Academic, Entrance, Government, or All)
      if (mainTrack === 'ACADEMIC') {
        const isExam = m.category === 'COMPETITIVE_EXAM' || m.category === 'GOVERNMENT_EXAM' || (m.tags && m.tags.some(t => t.toLowerCase().includes('police') || t.toLowerCase().includes('ssc') || t.toLowerCase().includes('jee') || t.toLowerCase().includes('neet') || t.toLowerCase().includes('chs')));
        if (isExam) return false;
      } else if (mainTrack === 'ENTRANCE') {
        const isEntrance = m.category === 'COMPETITIVE_EXAM' || (m.tags && m.tags.some(t => t.toLowerCase().includes('chs') || t.toLowerCase().includes('navodaya') || t.toLowerCase().includes('jee') || t.toLowerCase().includes('neet') || t.toLowerCase().includes('olympiad') || t.toLowerCase().includes('ntse') || t.toLowerCase().includes('cuet')));
        if (!isEntrance) return false;
      } else if (mainTrack === 'GOVERNMENT') {
        const isGov = m.category === 'GOVERNMENT_EXAM' || (m.tags && m.tags.some(t => t.toLowerCase().includes('police') || t.toLowerCase().includes('ssc') || t.toLowerCase().includes('railway') || t.toLowerCase().includes('upsssc') || t.toLowerCase().includes('defence') || t.toLowerCase().includes('nda') || t.toLowerCase().includes('pet')));
        if (!isGov) return false;
      }

      // Specific Exam Filter
      if (selectedExam !== 'ALL') {
        const q = selectedExam.toLowerCase();
        const matchesTag = m.tags && m.tags.some(t => t.toLowerCase().includes(q));
        const matchesTitle = m.title.toLowerCase().includes(q);
        const matchesPyq = m.pyqMetadata && m.pyqMetadata.examId.toLowerCase().includes(q);
        if (!matchesTag && !matchesTitle && !matchesPyq) return false;
      }

      // Board Filter
      if (selectedBoard !== 'ALL') {
        const b = selectedBoard.toLowerCase();
        const inTags = m.tags && m.tags.some(t => t.toLowerCase().includes(b));
        const inTitle = m.title.toLowerCase().includes(b);
        const inDesc = m.description.toLowerCase().includes(b);
        if (!inTags && !inTitle && !inDesc) return false;
      }

      // Category
      if (selectedCategory !== 'ALL' && m.category !== selectedCategory) return false;

      // Class Filter
      if (selectedClass === 'MY_CLASS') {
        const normStudent = studentGrade.toLowerCase().replace(/[^a-z0-9]/g, '');
        const normMat = m.targetClass.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (normMat !== 'all' && normStudent !== normMat && !normStudent.includes(normMat) && !normMat.includes(normStudent)) {
          return false;
        }
      } else if (selectedClass !== 'ALL') {
        const normTarget = selectedClass.toLowerCase().replace(/[^a-z0-9]/g, '');
        const normMat = m.targetClass.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (normMat !== 'all' && normTarget !== normMat && !normTarget.includes(normMat) && !normMat.includes(normTarget)) {
          return false;
        }
      }

      // Subject
      if (selectedSubject !== 'ALL' && m.subject.toLowerCase() !== selectedSubject.toLowerCase()) return false;

      // Paid/Free/Owned Filter
      if (selectedPaidFilter === 'FREE' && m.isPaid) return false;
      if (selectedPaidFilter === 'PAID' && !m.isPaid) return false;
      if (selectedPaidFilter === 'OWNED') {
        if (!purchasedIds.has(m.id)) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = m.title.toLowerCase().includes(q);
        const matchesDesc = m.description.toLowerCase().includes(q);
        const matchesSubj = m.subject.toLowerCase().includes(q);
        const matchesClass = m.targetClass.toLowerCase().includes(q);
        const matchesTags = m.tags.some(t => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesSubj && !matchesClass && !matchesTags) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    return list.sort((a, b) => {
      if (selectedSort === 'POPULAR') return (b.totalDownloads || 0) - (a.totalDownloads || 0);
      if (selectedSort === 'NEWEST') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (selectedSort === 'RATING') return (b.rating || 0) - (a.rating || 0);
      if (selectedSort === 'PRICE_LOW') return (a.basePrice || 0) - (b.basePrice || 0);
      return 0; // Default recommended
    });
  }, [materials, mainTrack, selectedCategory, selectedClass, selectedBoard, selectedExam, selectedSubject, selectedPaidFilter, selectedSort, searchQuery, studentGrade, purchases]);

  // Execute Download
  const handleDownload = (material: StudyMaterial) => {
    if (!user) {
      setFeedbackMessage({ type: 'error', text: 'Please sign in as a student to download study materials.' });
      return;
    }

    const evaluation = studyMaterialService.evaluateAccess({ material, student: user });
    if (!evaluation.canDownload) {
      if (evaluation.requiresPurchase) {
        setCheckoutMaterial(material);
        return;
      }
      setFeedbackMessage({ type: 'error', text: evaluation.message });
      return;
    }

    const res = studyMaterialService.downloadMaterial({
      materialId: material.id,
      student: user
    });

    if (res.success) {
      setAllowance(res.allowance);
      setDownloads(studyMaterialService.getStudentDownloadHistory(user.id));
      setMaterials(studyMaterialService.getMaterials({ status: 'PUBLISHED' }));
      setFeedbackMessage({
        type: 'success',
        text: `Download started! "${material.fileName}" is downloading. ${
          evaluation.hasPurchased 
            ? 'Purchased item (Unrestricted free re-download).' 
            : `Monthly Quota: ${res.allowance.remainingDownloads} remaining.`
        }`
      });
    } else {
      setFeedbackMessage({ type: 'error', text: res.error || 'Failed to download material.' });
    }
  };

  // Coupon handling in checkout modal
  const handleApplyCoupon = () => {
    if (!checkoutMaterial || !couponCode.trim() || !user) return;

    const res = studyMaterialService.validateCoupon(couponCode, checkoutMaterial.id, user);
    if (res.valid) {
      setCouponValidation({
        applied: true,
        discount: res.discountAmount,
        message: res.message,
        offer: res.offer
      });
    } else {
      setCouponValidation({
        applied: false,
        discount: 0,
        message: res.message
      });
    }
  };

  // Complete Purchase
  const handleCompletePurchase = () => {
    if (!checkoutMaterial || !user) return;
    setIsProcessingPayment(true);

    setTimeout(() => {
      try {
        const purchase = studyMaterialService.purchaseMaterial({
          materialId: checkoutMaterial.id,
          student: user,
          couponCode: couponValidation.applied ? couponCode : undefined,
          paymentMethod: selectedPaymentMethod,
          transactionReference: `FP-TXN-${Date.now().toString().slice(-8)}`
        });

        setIsProcessingPayment(false);
        setPaymentSuccess(true);
        setPurchases(studyMaterialService.getStudentPurchases(user.id));
        setAllowance(studyMaterialService.getDownloadAllowance(user.id, studentDistrict, studentGrade));
        setMaterials(studyMaterialService.getMaterials({ status: 'PUBLISHED' }));

        // Auto trigger download
        setTimeout(() => {
          studyMaterialService.downloadMaterial({
            materialId: checkoutMaterial.id,
            student: user
          });
        }, 600);
      } catch (err: any) {
        setIsProcessingPayment(false);
        setFeedbackMessage({ type: 'error', text: err.message || 'Payment failed. Please try again.' });
      }
    }, 900);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" /> ZYZU'S Curated Repository
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" /> Enrolled in {studentGrade}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                <ShieldCheck className="w-3.5 h-3.5" /> {studentDistrict} District
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Study Material & Board Exam Vault
            </h1>
            <p className="text-blue-200 text-sm sm:text-base leading-relaxed">
              Access curriculum-aligned NCERT solutions, handwritten topper notes, previous 10-year board papers, and competitive entrance preparation packs.
            </p>
          </div>

          {/* Live Monthly Download Limit Meter */}
          {allowance && (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl w-full md:w-80 shadow-lg text-white">
              <div className="flex items-center justify-between text-xs text-blue-200 font-medium mb-2">
                <span className="flex items-center gap-1">
                  <Download className="w-3.5 h-3.5 text-emerald-400" /> Monthly Free Limit
                </span>
                <span className="text-white font-semibold">{allowance.monthLabel}</span>
              </div>

              <div className="flex items-baseline justify-between mb-2">
                <div className="text-2xl font-black">
                  {allowance.usedDownloads} <span className="text-sm font-normal text-blue-200">/ {allowance.allowedMonthlyQuota} Used</span>
                </div>
                <div className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  allowance.remainingDownloads > 0 
                    ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-500/40' 
                    : 'bg-rose-500/30 text-rose-200 border border-rose-500/40'
                }`}>
                  {allowance.remainingDownloads} Downloads Left
                </div>
              </div>

              {/* Meter progress bar */}
              <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden mb-3">
                <div 
                  className={`h-full transition-all duration-500 ${
                    allowance.usedDownloads >= allowance.allowedMonthlyQuota 
                      ? 'bg-rose-500' 
                      : allowance.usedDownloads >= allowance.allowedMonthlyQuota * 0.7 
                      ? 'bg-amber-400' 
                      : 'bg-emerald-400'
                  }`}
                  style={{ width: `${Math.min(100, (allowance.usedDownloads / allowance.allowedMonthlyQuota) * 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-blue-200/80">
                <span>Resets on: <b className="text-white">{allowance.nextResetDate}</b></span>
                {allowance.bonusPaidDownloads > 0 && (
                  <span className="text-emerald-300 font-medium">+{allowance.bonusPaidDownloads} Paid Unlocked</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Available Offers strip */}
        {offers.length > 0 && (
          <div className="mt-6 pt-5 border-t border-white/10 flex items-center gap-3 overflow-x-auto text-xs">
            <span className="text-amber-300 font-semibold whitespace-nowrap flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" /> Active Offers:
            </span>
            {offers.map(off => (
              <button 
                key={off.id}
                onClick={() => {
                  setCouponCode(off.code);
                  setFeedbackMessage({ type: 'info', text: `Coupon code "${off.code}" copied! Apply it during checkout.` });
                }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-amber-200 whitespace-nowrap transition cursor-pointer"
              >
                <code className="font-bold text-amber-300 tracking-wider">{off.code}</code>
                <span>({off.title})</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Notification Toast */}
      {feedbackMessage && (
        <div className={`p-4 rounded-xl flex items-center justify-between text-sm transition shadow-sm ${
          feedbackMessage.type === 'success' 
            ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' 
            : feedbackMessage.type === 'error'
            ? 'bg-rose-50 text-rose-900 border border-rose-200'
            : 'bg-blue-50 text-blue-900 border border-blue-200'
        }`}>
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
            {feedbackMessage.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />}
            {feedbackMessage.type === 'info' && <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0" />}
            <span>{feedbackMessage.text}</span>
          </div>
          <button 
            onClick={() => setFeedbackMessage(null)}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('BROWSE')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
              activeTab === 'BROWSE'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Browse Vault ({materials.length})
            </span>
          </button>
          <button
            onClick={() => setActiveTab('MY_DOWNLOADS')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
              activeTab === 'MY_DOWNLOADS'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span className="flex items-center gap-2">
              <Download className="w-4 h-4" /> My Downloads ({downloads.length})
            </span>
          </button>
          <button
            onClick={() => setActiveTab('MY_PURCHASES')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
              activeTab === 'MY_PURCHASES'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" /> My Purchases ({purchases.length})
            </span>
          </button>
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={loadData}
          className="text-xs flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </Button>
      </div>

      {activeTab === 'BROWSE' && (
        <div className="space-y-6">
          {/* Main Track Tabs (Section 3: Academic, Entrance, Government, All) */}
          <div className="bg-slate-100/90 p-1.5 rounded-2xl flex flex-wrap gap-1.5 border border-slate-200">
            <button
              onClick={() => {
                setMainTrack('ALL');
                setSelectedExam('ALL');
              }}
              className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
                mainTrack === 'ALL'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>All Materials</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200/80 text-slate-700 font-bold">
                {materials.length}
              </span>
            </button>

            <button
              onClick={() => {
                setMainTrack('ACADEMIC');
                setSelectedExam('ALL');
              }}
              className={`flex-1 min-w-[160px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
                mainTrack === 'ACADEMIC'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Academic (Nursery - 12)</span>
            </button>

            <button
              onClick={() => {
                setMainTrack('ENTRANCE');
                setSelectedExam('ALL');
              }}
              className={`flex-1 min-w-[160px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
                mainTrack === 'ENTRANCE'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Entrance Exams (CHS, JEE, NEET)</span>
            </button>

            <button
              onClick={() => {
                setMainTrack('GOVERNMENT');
                setSelectedExam('ALL');
              }}
              className={`flex-1 min-w-[160px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
                mainTrack === 'GOVERNMENT'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Govt Exams (SSC, Police, RRB)</span>
            </button>
          </div>

          {/* Filter Toolbar */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Search Bar */}
              <div className="md:col-span-4 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search notes, chapters, topics, exams..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Class Filter */}
              <div className="md:col-span-2">
                <select
                  value={selectedClass}
                  onChange={e => setSelectedClass(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                >
                  <option value="ALL">All Classes</option>
                  <option value="MY_CLASS">★ Enrolled ({studentGrade})</option>
                  {STUDY_MATERIAL_CLASSES.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Board / Curriculum Filter */}
              <div className="md:col-span-2">
                <select
                  value={selectedBoard}
                  onChange={e => setSelectedBoard(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                >
                  <option value="ALL">All Boards</option>
                  <option value="CBSE">CBSE</option>
                  <option value="ICSE">ICSE</option>
                  <option value="UP Board">UP Board</option>
                  <option value="State Board">State Board</option>
                  <option value="NCERT">NCERT Aligned</option>
                </select>
              </div>

              {/* Subject Filter */}
              <div className="md:col-span-2">
                <select
                  value={selectedSubject}
                  onChange={e => setSelectedSubject(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                >
                  <option value="ALL">All Subjects</option>
                  {STUDY_MATERIAL_SUBJECTS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Pricing & Entitlement Filter */}
              <div className="md:col-span-2">
                <select
                  value={selectedPaidFilter}
                  onChange={e => setSelectedPaidFilter(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-medium"
                >
                  <option value="ALL">All Pricing</option>
                  <option value="FREE">FREE Material</option>
                  <option value="PAID">PAID / Premium</option>
                  <option value="OWNED">✓ Owned / Purchased</option>
                </select>
              </div>
            </div>

            {/* Entrance or Government Exam Quick Selector Strip */}
            {(mainTrack === 'ENTRANCE' || mainTrack === 'GOVERNMENT' || mainTrack === 'ALL') && (
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                <span className="text-slate-500 font-semibold whitespace-nowrap flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Exam Focus:
                </span>
                <button
                  onClick={() => setSelectedExam('ALL')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    selectedExam === 'ALL'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  All Exams
                </button>
                {(mainTrack === 'ENTRANCE' || mainTrack === 'ALL') && (
                  <>
                    <button
                      onClick={() => setSelectedExam('CHS')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                        selectedExam === 'CHS' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      CHS (Central Hindu School)
                    </button>
                    <button
                      onClick={() => setSelectedExam('Navodaya')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                        selectedExam === 'Navodaya' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      JNVST Navodaya
                    </button>
                    <button
                      onClick={() => setSelectedExam('JEE')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                        selectedExam === 'JEE' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      IIT-JEE (Main & Adv)
                    </button>
                    <button
                      onClick={() => setSelectedExam('NEET')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                        selectedExam === 'NEET' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      NEET UG
                    </button>
                    <button
                      onClick={() => setSelectedExam('Olympiad')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                        selectedExam === 'Olympiad' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Olympiad / NTSE
                    </button>
                  </>
                )}
                {(mainTrack === 'GOVERNMENT' || mainTrack === 'ALL') && (
                  <>
                    <button
                      onClick={() => setSelectedExam('Police')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                        selectedExam === 'Police' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      UP Police Constable/SI
                    </button>
                    <button
                      onClick={() => setSelectedExam('SSC')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                        selectedExam === 'SSC' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      SSC (CGL, CHSL, GD)
                    </button>
                    <button
                      onClick={() => setSelectedExam('Railway')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                        selectedExam === 'Railway' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Railway RRB NTPC / Group D
                    </button>
                    <button
                      onClick={() => setSelectedExam('PET')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                        selectedExam === 'PET' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      UPSSSC PET / Lekhpal
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Category Pills Slider */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-1">
                <button
                  onClick={() => setSelectedCategory('ALL')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                    selectedCategory === 'ALL'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All Types ({materials.length})
                </button>
                {STUDY_MATERIAL_CATEGORIES.map(cat => {
                  const count = materials.filter(m => m.category === cat.id).length;
                  if (count === 0) return null;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
                        selectedCategory === cat.id
                          ? 'bg-blue-600 text-white font-semibold shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        selectedCategory === cat.id ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-medium">Sort:</span>
                <select
                  value={selectedSort}
                  onChange={e => setSelectedSort(e.target.value as any)}
                  className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white font-semibold text-slate-700"
                >
                  <option value="RECOMMENDED">Recommended</option>
                  <option value="POPULAR">Most Downloaded</option>
                  <option value="NEWEST">Newest Additions</option>
                  <option value="RATING">Highest Rated</option>
                  <option value="PRICE_LOW">Price: Low to High</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Summary Bar */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1 flex-wrap gap-2">
            <span className="flex items-center gap-1.5">
              Showing <b>{filteredMaterials.length}</b> verified study materials in vault
              {selectedPaidFilter === 'OWNED' && <span className="font-bold text-emerald-600">(Showing Owned Only)</span>}
            </span>
            {(selectedClass !== 'ALL' || selectedBoard !== 'ALL' || selectedCategory !== 'ALL' || selectedSubject !== 'ALL' || selectedPaidFilter !== 'ALL' || selectedExam !== 'ALL' || searchQuery) && (
              <button
                onClick={() => {
                  setMainTrack('ALL');
                  setSelectedCategory('ALL');
                  setSelectedClass('ALL');
                  setSelectedBoard('ALL');
                  setSelectedExam('ALL');
                  setSelectedSubject('ALL');
                  setSelectedPaidFilter('ALL');
                  setSearchQuery('');
                }}
                className="text-blue-600 hover:text-blue-800 font-semibold underline text-xs"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Materials Grid */}
          {filteredMaterials.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No Study Materials Match</h3>
              <p className="text-xs text-slate-500">
                Try switching the category or resetting your filters to explore curriculum materials across all boards and exams.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setMainTrack('ALL');
                  setSelectedCategory('ALL');
                  setSelectedClass('ALL');
                  setSelectedBoard('ALL');
                  setSelectedExam('ALL');
                  setSelectedSubject('ALL');
                  setSelectedPaidFilter('ALL');
                  setSearchQuery('');
                }}
              >
                Reset All Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMaterials.map(material => {
                const evalResult = studyMaterialService.evaluateAccess({ material, student: user });
                const diffObj = DIFFICULTY_LEVELS.find(d => d.id === material.difficultyLevel);
                const hasPurchased = evalResult.hasPurchased || purchases.some(p => p.materialId === material.id);

                return (
                  <Card key={material.id} className="flex flex-col h-full overflow-hidden hover:shadow-lg transition-all duration-200 border-slate-200/90 rounded-2xl bg-white">
                    {/* Card Thumbnail / Header */}
                    <div className="relative h-44 bg-slate-100 overflow-hidden group">
                      {material.thumbnailUrl ? (
                        <img 
                          src={material.thumbnailUrl} 
                          alt={material.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-indigo-950 text-white">
                          <BookOpen className="w-12 h-12 opacity-40" />
                        </div>
                      )}

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-900/85 text-white backdrop-blur-md shadow-sm">
                          {material.targetClass}
                        </span>

                        {hasPurchased ? (
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-600 text-white shadow-sm flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> OWNED
                          </span>
                        ) : material.isPaid ? (
                          <div className="flex items-center gap-1">
                            {material.specialOfferPercentage ? (
                              <span className="px-2 py-0.5 rounded text-[10px] line-through bg-black/50 text-slate-300 backdrop-blur-xs">
                                ₹{material.basePrice}
                              </span>
                            ) : null}
                            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500 text-white shadow-sm flex items-center gap-1">
                              <Tag className="w-3 h-3" /> PAID • ₹{evalResult.price}
                            </span>
                          </div>
                        ) : (
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-600 text-white shadow-sm">
                            FREE
                          </span>
                        )}
                      </div>

                      {/* Difficulty Level & Subject Badges */}
                      <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px]">
                        <span className={`px-2 py-0.5 rounded font-semibold border backdrop-blur-md ${diffObj?.badgeColor || 'bg-white/90 text-slate-700'}`}>
                          {diffObj?.label || material.difficultyLevel}
                        </span>
                        <span className="px-2 py-0.5 rounded font-semibold bg-white/90 text-slate-800 backdrop-blur-md shadow-sm">
                          {material.subject}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span className="font-semibold text-slate-500">{material.academicSession}</span>
                          <span>•</span>
                          <span>{material.language}</span>
                        </div>

                        <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2 hover:text-blue-600 transition">
                          {material.title}
                        </h3>

                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {material.description}
                        </p>
                      </div>

                      {/* Meta Tags & Details */}
                      <div className="space-y-3 pt-3 border-t border-slate-100">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5 text-slate-400" /> {material.pageCount} Pages ({material.fileSize})
                          </span>
                          <span className="flex items-center gap-1 font-semibold text-amber-600">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {material.rating} ({material.reviewCount})
                          </span>
                        </div>

                        {/* Special offer banner if applicable */}
                        {material.isPaid && !hasPurchased && material.specialOfferLabel && (
                          <div className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold flex items-center justify-between">
                            <span>{material.specialOfferLabel}</span>
                            <span className="text-emerald-700 font-bold">Save {material.specialOfferPercentage}%</span>
                          </div>
                        )}

                        {/* Subject Tutor Lock Warning */}
                        {evalResult.isSubjectLocked && (
                          <div className="p-2.5 rounded-lg bg-purple-50 border border-purple-200 text-purple-800 text-[11px] flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <Lock className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                              <span>Enrolled ZYZU'S <b>{material.subject}</b> Home Tutor required to unlock.</span>
                            </div>
                            <a 
                              href="/student/tutor" 
                              className="text-purple-700 hover:text-purple-900 font-bold underline whitespace-nowrap text-[10px]"
                            >
                              Book Tutor &rarr;
                            </a>
                          </div>
                        )}

                        {/* Official PYQ Shift & Solved Badge */}
                        {material.pyqMetadata && (
                          <div className="p-2 rounded-xl bg-gradient-to-r from-indigo-50 to-cyan-50 border border-indigo-200/80 text-xs flex items-center justify-between">
                            <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                              {material.pyqMetadata.examId} {material.pyqMetadata.examYear} &bull; {material.pyqMetadata.shift}
                            </span>
                            {material.pyqMetadata.paperCode && (
                              <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded-md border border-indigo-200 text-indigo-700 font-bold shadow-xs">
                                Code: {material.pyqMetadata.paperCode}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Interactive CBT Launch Button if Available */}
                        {material.pyqMetadata?.isCbtAvailable && (
                          <Link to="/student/mock-tests" className="w-full block">
                            <button className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white shadow-md shadow-indigo-500/20 flex items-center justify-center gap-1.5 transition-all">
                              <Play className="w-3.5 h-3.5 fill-white" />
                              Attempt Live Interactive CBT Exam
                            </button>
                          </Link>
                        )}

                        {/* Action Buttons (Section 4 & 6: Never show Purchase for Owned; instead Owned -> Open Material) */}
                        <div className="flex items-center gap-2 pt-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPreviewMaterial(material)}
                            className="flex-1 text-xs flex items-center justify-center gap-1.5 min-h-[36px]"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" /> Preview
                          </Button>

                          {hasPurchased ? (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => {
                                handleDownload(material);
                                setFeedbackMessage({
                                  type: 'success',
                                  text: `Opening owned material: "${material.title}". Download started!`
                                });
                              }}
                              className="flex-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-1.5 shadow-sm min-h-[36px]"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                              <span>Owned → Open Material</span>
                            </Button>
                          ) : material.isPaid ? (
                            <Button
                              variant="primary"
                              size="sm"
                              disabled={evalResult.isSubjectLocked}
                              onClick={() => setCheckoutMaterial(material)}
                              className="flex-1 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center gap-1.5 min-h-[36px]"
                            >
                              <Lock className="w-3.5 h-3.5" /> Unlock • ₹{evalResult.price}
                            </Button>
                          ) : (
                            <Button
                              variant="primary"
                              size="sm"
                              disabled={evalResult.isSubjectLocked || (!allowance?.canDownloadFree && !evalResult.hasPurchased)}
                              onClick={() => handleDownload(material)}
                              className={`flex-1 text-xs font-bold flex items-center justify-center gap-1.5 min-h-[36px] ${
                                evalResult.isSubjectLocked
                                  ? 'bg-purple-100 text-purple-700 border border-purple-300 cursor-not-allowed'
                                  : !allowance?.canDownloadFree && !evalResult.hasPurchased
                                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                              }`}
                            >
                              {evalResult.isSubjectLocked ? (
                                <>
                                  <Lock className="w-3.5 h-3.5" /> Tutor Locked
                                </>
                              ) : (
                                <>
                                  <Download className="w-3.5 h-3.5" /> 
                                  {!allowance?.canDownloadFree ? 'Limit Reached' : 'Download Free'}
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MY DOWNLOADS TAB */}
      {activeTab === 'MY_DOWNLOADS' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Your Download History</h2>
            <p className="text-xs text-slate-500">
              Materials previously downloaded can be re-accessed at any time without consuming your monthly free limit.
            </p>

            {downloads.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <Download className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-semibold text-slate-600">No downloads recorded yet</p>
                <Button size="sm" onClick={() => setActiveTab('BROWSE')}>
                  Explore Study Materials
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 mt-4">
                {downloads.map(record => (
                  <div key={record.id} className="py-3.5 flex items-center justify-between gap-4 flex-wrap">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {record.targetClass}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700">
                          {record.subject}
                        </span>
                        {record.wasPaidDownload ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                            Purchased Item
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700">
                            Free Monthly Quota
                          </span>
                        )}
                      </div>
                      <h4 className="font-semibold text-sm text-slate-900">{record.materialTitle}</h4>
                      <p className="text-[11px] text-slate-400">
                        Downloaded on {new Date(record.downloadDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })} • Version {record.fileVersion}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const mat = materials.find(m => m.id === record.materialId);
                        if (mat) handleDownload(mat);
                      }}
                      className="text-xs flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-600" /> Re-Download
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MY PURCHASES TAB */}
      {activeTab === 'MY_PURCHASES' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Your Purchased Modules</h2>
            <p className="text-xs text-slate-500">
              Purchased premium test series and toppers digests are permanently linked to your ZYZU'S student account.
            </p>

            {purchases.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-semibold text-slate-600">No purchases found</p>
                <Button size="sm" onClick={() => setActiveTab('BROWSE')}>
                  Browse Premium Modules
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 mt-4">
                {purchases.map(p => (
                  <div key={p.id} className="py-4 flex items-center justify-between gap-4 flex-wrap">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          PAID ₹{p.finalAmountPaid}
                        </span>
                        {p.discountAmount > 0 && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700">
                            Saved ₹{p.discountAmount} {p.couponCode ? `(Code: ${p.couponCode})` : ''}
                          </span>
                        )}
                        <span className="text-slate-400 text-xs">• Txn Ref: {p.transactionReference}</span>
                      </div>
                      <h4 className="font-semibold text-sm text-slate-900">{p.materialTitle}</h4>
                      <p className="text-[11px] text-slate-400">
                        Purchased on {new Date(p.purchaseDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })} via {p.paymentMethod}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        const mat = materials.find(m => m.id === p.materialId);
                        if (mat) handleDownload(mat);
                      }}
                      className="text-xs bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Full PDF
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SAMPLE PREVIEW MODAL */}
      {previewMaterial && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Sample Preview</span>
                <h3 className="text-base font-bold text-slate-900">{previewMaterial.title}</h3>
              </div>
              <button 
                onClick={() => setPreviewMaterial(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* PDF Preview Frame / Notice */}
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
                  <FileText className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">
                  Displaying First {previewMaterial.previewPageCount || 3} Sample Pages
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  This preview gives you a glimpse into the typography, diagrams, and solution depth. Full document contains {previewMaterial.pageCount} pages.
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 shadow-sm font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Verified by {previewMaterial.verifiedBy || "ZYZU'S Academic Directorate"}
                </div>
              </div>

              {/* Version Details */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Document Information</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Class</span>
                    <span className="font-semibold text-slate-800">{previewMaterial.targetClass}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Subject</span>
                    <span className="font-semibold text-slate-800">{previewMaterial.subject}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Version</span>
                    <span className="font-semibold text-slate-800">{previewMaterial.currentVersion}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">File Size</span>
                    <span className="font-semibold text-slate-800">{previewMaterial.fileSize}</span>
                  </div>
                </div>
              </div>

              {/* Version History Log */}
              {previewMaterial.versionHistory && previewMaterial.versionHistory.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Version History</h4>
                  <div className="space-y-2">
                    {previewMaterial.versionHistory.map(ver => (
                      <div key={ver.versionId} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-800">{ver.versionNumber}</span>
                          <span className="text-slate-500 ml-2">{ver.changeLog}</span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {new Date(ver.uploadedAt).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setPreviewMaterial(null)}>
                Close Preview
              </Button>
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => {
                  const m = previewMaterial;
                  setPreviewMaterial(null);
                  handleDownload(m);
                }}
              >
                {previewMaterial.isPaid ? 'Proceed to Unlock' : 'Download Complete PDF'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CHECKOUT & COUPON MODAL */}
      {checkoutMaterial && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {paymentSuccess ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Purchase Successful!</h3>
                <p className="text-xs text-slate-600 max-w-xs mx-auto">
                  You have unlocked "{checkoutMaterial.title}". The PDF is now being downloaded to your device.
                </p>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    setPaymentSuccess(false);
                    setCheckoutMaterial(null);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Done
                </Button>
              </div>
            ) : (
              <>
                {/* Checkout Header */}
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Fast Checkout</span>
                    <h3 className="text-base font-bold text-slate-900">Unlock Study Material</h3>
                  </div>
                  <button 
                    onClick={() => {
                      setCheckoutMaterial(null);
                      setCouponValidation({ applied: false, discount: 0, message: '' });
                      setCouponCode('');
                    }}
                    className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Checkout Body */}
                <div className="p-6 space-y-5">
                  {/* Item Summary */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                      {checkoutMaterial.targetClass} • {checkoutMaterial.subject}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{checkoutMaterial.title}</h4>
                    <p className="text-xs text-slate-500">{checkoutMaterial.pageCount} Pages • Immediate High-Res PDF Access</p>
                  </div>

                  {/* Pricing Breakdown */}
                  {(() => {
                    const priceInfo = studyMaterialService.resolvePrice(checkoutMaterial, user);
                    const netAfterTier = priceInfo.effectivePrice;
                    const finalPayable = Math.max(0, netAfterTier - couponValidation.discount);

                    return (
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between text-slate-600">
                          <span>Base Price</span>
                          <span>₹{priceInfo.originalPrice}</span>
                        </div>
                        {priceInfo.discountFromBase > 0 && (
                          <div className="flex justify-between text-emerald-600 font-medium">
                            <span>Tier Offer ({priceInfo.tierApplied})</span>
                            <span>-₹{priceInfo.discountFromBase}</span>
                          </div>
                        )}
                        {couponValidation.applied && (
                          <div className="flex justify-between text-emerald-600 font-medium">
                            <span>Coupon Discount ({couponCode})</span>
                            <span>-₹{couponValidation.discount}</span>
                          </div>
                        )}
                        <div className="pt-2 border-t border-slate-200 flex justify-between font-extrabold text-sm text-slate-900">
                          <span>Total Amount to Pay</span>
                          <span className="text-blue-600 text-base">₹{finalPayable}</span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Coupon Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Apply Promo / District Coupon</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter coupon (e.g. EXAMBOOST50)"
                        value={couponCode}
                        onChange={e => setCouponCode(e.target.value.toUpperCase())}
                        className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 uppercase tracking-wider font-mono"
                      />
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={handleApplyCoupon}
                        className="text-xs"
                      >
                        Apply
                      </Button>
                    </div>
                    {couponValidation.message && (
                      <p className={`text-[11px] font-medium ${couponValidation.applied ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {couponValidation.message}
                      </p>
                    )}
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700">Payment Option</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedPaymentMethod('UPI')}
                        className={`p-3 rounded-xl border text-xs font-semibold transition flex flex-col items-center gap-1.5 ${
                          selectedPaymentMethod === 'UPI'
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        <span>UPI / QR</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedPaymentMethod('CARD')}
                        className={`p-3 rounded-xl border text-xs font-semibold transition flex flex-col items-center gap-1.5 ${
                          selectedPaymentMethod === 'CARD'
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <CreditCard className="w-4 h-4 text-slate-600" />
                        <span>Cards</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedPaymentMethod('NET_BANKING')}
                        className={`p-3 rounded-xl border text-xs font-semibold transition flex flex-col items-center gap-1.5 ${
                          selectedPaymentMethod === 'NET_BANKING'
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <Layers className="w-4 h-4 text-slate-600" />
                        <span>NetBanking</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Checkout Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 256-Bit SSL Encrypted
                  </span>
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={isProcessingPayment}
                    onClick={handleCompletePurchase}
                    className="bg-blue-600 hover:bg-blue-700 text-xs px-6 py-2.5"
                  >
                    {isProcessingPayment ? 'Processing...' : 'Pay & Download Instantly'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
