import React, { useState } from 'react';
import { Tag, Sparkles, CheckCircle2, ShieldCheck, ArrowRight, Info, AlertCircle, X, Calendar, Percent } from 'lucide-react';
import { ActiveOfferPricing } from '../../services/policyService';
import { Modal } from './Modal';

export interface OfferBadgeProps {
  pricing?: ActiveOfferPricing | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showDetailsModalOnClick?: boolean;
  className?: string;
  pulse?: boolean;
  showSavings?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

/**
 * High-visibility, professional EdTech Offer Badge.
 * Renders badges such as "🔥 30% OFF" or "🏷️ ₹200 OFF".
 * Clicking opens the complete Offer Details breakdown modal.
 */
export const OfferBadge: React.FC<OfferBadgeProps> = ({
  pricing,
  size = 'sm',
  showDetailsModalOnClick = true,
  className = '',
  pulse = true,
  showSavings = false,
  onClick,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!pricing || !pricing.hasOffer || !pricing.offer) {
    return null;
  }

  const { offer, badgeText, savingsText, validUntilFormatted, policySource, originalPrice, discountAmount, discountedPrice } = pricing;

  const sizeStyles = {
    xs: 'text-[10px] px-2 py-0.5 gap-1',
    sm: 'text-[11px] px-2.5 py-0.8 gap-1.5 font-extrabold',
    md: 'text-xs px-3 py-1 gap-1.5 font-black',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-black',
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      onClick(e);
    }
    if (showDetailsModalOnClick) {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        title="Click to view offer details and terms"
        className={`inline-flex items-center rounded-full transition-all duration-200 cursor-pointer select-none shadow-xs border ${
          sizeStyles[size]
        } ${
          offer.discountType === 'PERCENTAGE'
            ? 'bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-white border-rose-400/40 hover:brightness-105 active:scale-95 shadow-rose-500/20'
            : 'bg-gradient-to-r from-amber-600 to-brand-600 text-white border-amber-400/40 hover:brightness-105 active:scale-95 shadow-amber-500/20'
        } ${className}`}
      >
        <span className="tracking-tight">{badgeText}</span>
        {pulse && (
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
          </span>
        )}
        {showSavings && savingsText && (
          <span className="opacity-90 font-medium text-[10px] hidden sm:inline ml-0.5 border-l border-white/30 pl-1.5">
            {savingsText}
          </span>
        )}
      </button>

      {/* Interactive Offer Details Modal */}
      {showDetailsModalOnClick && (
        <OfferDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          pricing={pricing}
        />
      )}
    </>
  );
};

export interface OfferDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pricing: ActiveOfferPricing;
  onApply?: () => void;
}

export const OfferDetailsModal: React.FC<OfferDetailsModalProps> = ({
  isOpen,
  onClose,
  pricing,
  onApply,
}) => {
  const { offer, badgeText, validUntilFormatted, policySource } = pricing;
  if (!offer) return null;

  // Use pricing values or realistic defaults if called without amount
  const origPrice = pricing.originalPrice > 0 ? pricing.originalPrice : (offer.serviceType === 'LIBRARY' ? 1000 : 3000);
  const discountAmt = pricing.discountAmount > 0 
    ? pricing.discountAmount 
    : (offer.discountType === 'PERCENTAGE' 
        ? Math.round((origPrice * offer.discountValue) / 100) 
        : Math.min(origPrice, offer.discountValue));
  const finalPayable = Math.max(0, origPrice - discountAmt);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title="Offer & Discount Details"
    >
      <div className="space-y-4 text-left">
        {/* Banner Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-amber-500 text-white space-y-2 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-xs font-black tracking-wider uppercase">
              {policySource === 'CUSTOM_OVERRIDE'
                ? '⭐ Verified Particular Offer'
                : '🏛️ Ghazipur District Common Offer'}
            </span>
            <span className="text-xl font-black">{badgeText}</span>
          </div>
          <h3 className="font-extrabold text-lg text-white leading-snug">{offer.title}</h3>
          <p className="text-xs text-white/90 font-medium leading-relaxed">{offer.description}</p>
          
          <div className="flex items-center gap-2 pt-1 text-[11px] font-bold text-white/95">
            <Tag className="w-3.5 h-3.5" />
            <span>Coupon Code: <code className="bg-white/25 px-2 py-0.5 rounded tracking-wider font-mono">{offer.code || offer.id}</code></span>
          </div>
        </div>

        {/* Real-time Calculation Breakdown Box */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
          <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px] flex items-center justify-between border-b border-slate-200 pb-2">
            <span>Price Calculation Breakdown</span>
            <span className="text-emerald-700 font-bold">Guaranteed Consistent</span>
          </h4>

          <div className="flex items-center justify-between text-slate-600 font-medium">
            <span>Original Fee / Subscription:</span>
            <span className="font-bold text-slate-950 text-sm line-through">₹{origPrice.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between text-rose-700 font-bold">
            <span className="flex items-center gap-1.5">
              <span>Offer Discount ({pricing.discountLabel || `${offer.discountValue}% OFF`}):</span>
            </span>
            <span className="font-black text-sm">-₹{discountAmt.toLocaleString()}</span>
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-slate-950 font-black">
            <span className="text-sm">You Pay:</span>
            <span className="text-emerald-700 text-lg font-black">₹{finalPayable.toLocaleString()}</span>
          </div>
        </div>

        {/* Validity & Terms */}
        <div className="space-y-2.5 text-xs text-slate-600">
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-semibold">
            <Calendar className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Offer Valid Until: <strong>{validUntilFormatted}</strong></span>
          </div>

          <div className="space-y-1.5 p-3 rounded-lg bg-slate-50 border border-slate-200">
            <h5 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-brand-600" />
              Terms & Conditions
            </h5>
            <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
              {offer.termsConditions || 'This offer is issued and authorized directly by the District Administrator. It applies automatically to eligible reservations and cannot be clubbed with unverified coupons.'}
            </p>
            {offer.maxDiscount && offer.maxDiscount > 0 && (
              <p className="text-[11px] text-slate-500 font-medium">
                • Maximum discount cap: ₹{offer.maxDiscount.toLocaleString()}
              </p>
            )}
            {(offer.minimumAmount || offer.minSpend) ? (
              <p className="text-[11px] text-slate-500 font-medium">
                • Minimum booking amount: ₹{(offer.minimumAmount || offer.minSpend || 0).toLocaleString()}
              </p>
            ) : null}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
          {onApply && (
            <button
              type="button"
              onClick={() => { onApply(); onClose(); }}
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all flex items-center gap-1.5"
            >
              <span>Apply Offer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export interface OfferPriceDisplayProps {
  originalPrice?: number;
  discountedPrice?: number;
  pricing?: ActiveOfferPricing | null;
  unit?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
}

/**
 * Consistent strikethrough price formatter.
 * Renders:
 *   ~~₹1,000~~  ₹700 / mo
 *   🔥 30% OFF
 */
export const OfferPriceDisplay: React.FC<OfferPriceDisplayProps> = ({
  originalPrice,
  discountedPrice,
  pricing,
  unit = '',
  className = '',
  size = 'md',
  showBadge = true,
}) => {
  const effOriginal = originalPrice ?? pricing?.originalPrice ?? 0;
  const hasDiscount = Boolean(pricing?.hasOffer && pricing.discountAmount > 0);
  const finalPrice = hasDiscount 
    ? (pricing?.discountedPrice ?? effOriginal) 
    : (discountedPrice !== undefined && discountedPrice < effOriginal ? discountedPrice : effOriginal);
  const showStrikethrough = hasDiscount || (discountedPrice !== undefined && discountedPrice < effOriginal);

  const priceSizes = {
    sm: 'text-sm font-black',
    md: 'text-base font-black',
    lg: 'text-xl sm:text-2xl font-black',
  };

  return (
    <div className={`inline-flex flex-col ${className}`}>
      <div className="flex items-baseline gap-1.5 flex-wrap">
        {showStrikethrough && (
          <span className="text-xs sm:text-sm font-bold text-slate-400 line-through decoration-rose-500/70">
            ₹{effOriginal.toLocaleString()}
          </span>
        )}
        <span className={`${priceSizes[size]} text-slate-950 tracking-tight`}>
          ₹{finalPrice.toLocaleString()}
          {unit && <span className="text-xs font-semibold text-slate-500 ml-0.5">{unit}</span>}
        </span>
      </div>

      {showBadge && pricing && pricing.hasOffer && (
        <div className="pt-0.5">
          <OfferBadge pricing={pricing} size="xs" />
        </div>
      )}
    </div>
  );
};
