import React, { useState, useEffect } from 'react';
import { Tag, CheckCircle2, AlertCircle, X, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { couponService, CopiedCouponInfo } from '../../services/couponService';
import { CouponValidationResult, OfferServiceType } from '../../types/homepage';

export interface CheckoutCouponSectionProps {
  originalAmount: number;
  serviceType?: OfferServiceType | string;
  productServiceType?: OfferServiceType | string;
  districtName?: string;
  districtId?: string;
  stateId?: string;
  studentId?: string;
  libraryId?: string;
  onCouponApplied: (result: CouponValidationResult) => void;
  onCouponRemoved: () => void;
  appliedCoupon?: CouponValidationResult | null;
  className?: string;
  theme?: 'dark' | 'light';
  offerDiscount?: number;
  otherDiscount?: number;
}

export const CheckoutCouponSection: React.FC<CheckoutCouponSectionProps> = ({
  originalAmount,
  serviceType,
  productServiceType,
  districtName,
  districtId,
  stateId,
  studentId,
  libraryId,
  onCouponApplied,
  onCouponRemoved,
  appliedCoupon = null,
  className = '',
  theme = 'light',
  offerDiscount = 0,
  otherDiscount = 0,
}) => {
  const [inputCode, setInputCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedCoupon, setCopiedCoupon] = useState<CopiedCouponInfo | null>(null);

  // Check for copied coupon from homepage on mount
  useEffect(() => {
    const lastCopied = couponService.getLastCopiedCoupon();
    if (lastCopied) {
      const code = typeof lastCopied === 'string' ? lastCopied : (lastCopied as any).code;
      if (!appliedCoupon || appliedCoupon.couponCode !== code) {
        setCopiedCoupon(typeof lastCopied === 'string' ? { code: lastCopied, copiedAt: Date.now() } : lastCopied);
      }
    }
  }, [appliedCoupon]);

  const handleApply = async (codeToApply?: string) => {
    const targetCode = (codeToApply || inputCode).trim().toUpperCase();
    if (!targetCode) {
      setErrorMessage('Please enter a coupon code.');
      return;
    }

    setIsValidating(true);
    setErrorMessage(null);

    try {
      const result = await couponService.validateCoupon({
        code: targetCode,
        couponCode: targetCode,
        amount: originalAmount,
        purchaseAmount: originalAmount,
        service: serviceType || productServiceType,
        productServiceType: productServiceType || serviceType,
        districtName,
        districtId,
        stateId,
        studentId,
        libraryId,
      });

      if (result.valid) {
        onCouponApplied(result);
        setInputCode('');
        setCopiedCoupon(null);
        couponService.clearLastCopiedCoupon();
      } else {
        setErrorMessage(result.message);
      }
    } catch {
      setErrorMessage('Coupon verification temporarily unavailable. Please retry.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemove = () => {
    onCouponRemoved();
    setInputCode('');
    setErrorMessage(null);
  };

  const isDark = theme === 'dark';

  // Calculate live breakdown
  const couponDisc = appliedCoupon ? appliedCoupon.calculatedDiscount : 0;
  const totalDiscounts = (offerDiscount || 0) + couponDisc + (otherDiscount || 0);
  const payable = Math.max(0, originalAmount - totalDiscounts);

  return (
    <div 
      className={`rounded-2xl border transition-all ${
        isDark 
          ? 'bg-slate-900/90 border-slate-800 text-slate-100' 
          : 'bg-slate-50/90 border-slate-200/90 text-slate-900'
      } p-4 sm:p-5 space-y-4 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
            isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-brand-50 text-brand-600 border border-brand-200'
          }`}>
            <Tag className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold tracking-tight">Have a coupon?</h4>
            <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Apply promo codes for instant educational fee concession
            </p>
          </div>
        </div>

        {appliedCoupon && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Applied
          </span>
        )}
      </div>

      {/* Suggested Copied Coupon Prompt (from Homepage Copy Journey) */}
      {!appliedCoupon && copiedCoupon && (
        <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs animate-in fade-in ${
          isDark 
            ? 'bg-indigo-950/40 border-indigo-500/30 text-indigo-200' 
            : 'bg-brand-50/70 border-brand-200 text-brand-900'
        }`}>
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="truncate">
              Copied code: <strong className="font-mono">{copiedCoupon.code}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleApply(copiedCoupon.code)}
            disabled={isValidating}
            className="px-2.5 py-1 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-bold text-[11px] shrink-0 transition-colors shadow-xs"
          >
            Apply Now
          </button>
        </div>
      )}

      {/* Applied State */}
      {appliedCoupon ? (
        <div className={`p-3.5 rounded-xl border space-y-3 ${
          isDark ? 'bg-emerald-950/30 border-emerald-500/40' : 'bg-emerald-50/70 border-emerald-300'
        }`}>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-sm text-emerald-600 dark:text-emerald-400 bg-white dark:bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-400/40">
                {appliedCoupon.couponCode}
              </span>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  ✓ {appliedCoupon.offerName || 'Promotional Concession'}
                </p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  You saved ₹{appliedCoupon.calculatedDiscount.toLocaleString('en-IN')}!
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemove}
              className="text-xs text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 font-semibold flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Remove Coupon
            </button>
          </div>
        </div>
      ) : (
        /* Input Form */
        <div className="space-y-2">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleApply();
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => {
                  setInputCode(e.target.value.toUpperCase());
                  setErrorMessage(null);
                }}
                placeholder="Enter coupon code (e.g. FOCUS100, SAIDPUR30)"
                disabled={isValidating}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs uppercase tracking-wider font-mono font-semibold border transition-all focus:outline-none ${
                  errorMessage 
                    ? 'border-rose-400 ring-2 ring-rose-400/20' 
                    : isDark 
                      ? 'bg-slate-950/80 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500' 
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-brand-500 ring-brand-500/10'
                }`}
                aria-label="Enter coupon code"
              />
            </div>
            <button
              type="submit"
              disabled={isValidating || !inputCode.trim()}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer ${
                isValidating || !inputCode.trim()
                  ? 'opacity-50 cursor-not-allowed bg-slate-300 dark:bg-slate-800 text-slate-500'
                  : 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-500/20'
              }`}
            >
              {isValidating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Checking...</span>
                </>
              ) : (
                <span>Apply</span>
              )}
            </button>
          </form>

          {/* Meaningful, Safe Error Message */}
          {errorMessage && (
            <div className="flex items-start gap-1.5 text-rose-600 dark:text-rose-400 text-xs font-medium p-2 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      )}

      {/* Real-time Pricing Summary Hierarchy */}
      <div className={`pt-3 border-t space-y-2 text-xs ${
        isDark ? 'border-slate-800 text-slate-300' : 'border-slate-200 text-slate-600'
      }`}>
        <div className="flex justify-between">
          <span>Original Amount</span>
          <span className="font-mono font-medium">₹{originalAmount.toLocaleString('en-IN')}</span>
        </div>

        {offerDiscount > 0 && (
          <div className="flex justify-between text-cyan-600 dark:text-cyan-400 font-medium">
            <span>Special Promotional Concession</span>
            <span className="font-mono">-₹{offerDiscount.toLocaleString('en-IN')}</span>
          </div>
        )}

        {appliedCoupon && couponDisc > 0 && (
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
            <span className="flex items-center gap-1">
              <Tag className="w-3 h-3" />
              Coupon Discount ({appliedCoupon.couponCode})
            </span>
            <span className="font-mono">-₹{couponDisc.toLocaleString('en-IN')}</span>
          </div>
        )}

        {otherDiscount > 0 && (
          <div className="flex justify-between text-indigo-600 dark:text-indigo-400 font-medium">
            <span>Scholarship / Regional Concession</span>
            <span className="font-mono">-₹{otherDiscount.toLocaleString('en-IN')}</span>
          </div>
        )}

        <div className={`pt-2 border-t flex justify-between items-baseline font-bold text-sm ${
          isDark ? 'border-slate-800 text-white' : 'border-slate-200 text-slate-950'
        }`}>
          <span>Payable Amount</span>
          <span className="text-base sm:text-lg font-mono font-black text-brand-600 dark:text-brand-400">
            ₹{payable.toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    </div>
  );
};
