import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, Tag, ArrowRight, Copy, Check, ChevronLeft, ChevronRight, 
  Clock, Flame, MapPin 
} from 'lucide-react';
import { HomepageOffer } from '../../types/homepage';
import { offerService } from '../../services/offerService';
import { couponService } from '../../services/couponService';
import { useToast } from '../../context/ToastContext';

interface LiveOfferBannerProps {
  districtName?: string;
  autoRotateInterval?: number;
}

export const LiveOfferBanner: React.FC<LiveOfferBannerProps> = ({
  districtName,
  autoRotateInterval = 4500,
}) => {
  const [offers, setOffers] = useState<HomepageOffer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Load active offers
  const loadOffers = useCallback(async () => {
    try {
      const active = await offerService.getActiveOffers({ districtName });
      setOffers(active);
      if (currentIndex >= active.length) {
        setCurrentIndex(0);
      }
    } catch {
      setOffers([]);
    } finally {
      setIsLoading(false);
    }
  }, [districtName, currentIndex]);

  useEffect(() => {
    loadOffers();
    return offerService.subscribe(loadOffers);
  }, [loadOffers]);

  // Auto rotation timer
  useEffect(() => {
    if (offers.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % offers.length);
    }, autoRotateInterval);

    return () => clearInterval(timer);
  }, [offers.length, isPaused, autoRotateInterval]);

  const handleNext = () => {
    if (offers.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % offers.length);
  };

  const handlePrev = () => {
    if (offers.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + offers.length) % offers.length);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrev();
    if (e.key === 'ArrowRight') handleNext();
  };

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) handleNext(); // swipe left -> next
    if (diff < -50) handlePrev(); // swipe right -> prev
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleCopyCoupon = async (code: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const res = await couponService.copyCoupon(code);
    if (res.success) {
      setCopiedCode(code);
      showToast(res.message, 'success');
      setTimeout(() => setCopiedCode(null), 2500);
    } else {
      showToast(res.message, 'error');
    }
  };

  // Graceful empty state: If no active offers, show nothing (zero fake offers)
  if (isLoading || offers.length === 0) {
    return null;
  }

  const currentOffer = offers[currentIndex] || offers[0];
  const discountLabel = currentOffer.discountType === 'PERCENTAGE' 
    ? `${currentOffer.discountValue}% OFF` 
    : `₹${currentOffer.discountValue} FLAT OFF`;

  return (
    <div 
      className="relative z-30 w-full bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white border-b border-indigo-500/20 shadow-lg overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      tabIndex={0}
      role="region"
      aria-label="Live Promotional Offers"
    >
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/4 w-72 h-16 bg-brand-500/15 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-72 h-16 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-4">
          
          {/* Left Column: Live Campaign Badge & Offer Headline */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            {/* Live Campaign Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-400/40 text-rose-300 text-[11px] font-black uppercase tracking-wider shrink-0 shadow-xs">
              <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>Live Campaign</span>
            </div>

            {/* Discount Badge */}
            <div className="px-3 py-1 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs sm:text-sm tracking-tight shadow-md shrink-0">
              {discountLabel}
            </div>

            {/* Title & Scope Note */}
            <div className="min-w-0 hidden lg:block">
              <h4 className="text-xs sm:text-sm font-extrabold text-white truncate flex items-center gap-1.5">
                <span>{currentOffer.title}</span>
                {currentOffer.scope !== 'PAN_INDIA' && (
                  <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-0.5">
                    <MapPin className="w-3 h-3 text-cyan-400" />
                    <span>{currentOffer.localityName || currentOffer.districtName || 'Regional'}</span>
                  </span>
                )}
              </h4>
              <p className="text-[11px] text-slate-300 font-medium truncate">
                {currentOffer.subtitle || "Limited period verified ZYZU'S promotional savings"}
              </p>
            </div>
          </div>

          {/* Middle/Right: Coupon Code Pill, Actions & Rotation Controls */}
          <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto justify-end">
            
            {/* Coupon Code Pill (if available) */}
            {currentOffer.couponCode && (
              <div className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 border border-dashed border-cyan-400/50 rounded-xl px-2.5 py-1 text-xs transition-colors">
                <Tag className="w-3 h-3 text-cyan-300 shrink-0" />
                <span className="font-mono font-bold text-cyan-200 tracking-wider text-[11px] sm:text-xs">
                  {currentOffer.couponCode}
                </span>
                <button
                  type="button"
                  onClick={(e) => handleCopyCoupon(currentOffer.couponCode!, e)}
                  title="Copy coupon code"
                  className="ml-1 p-1 rounded hover:bg-white/20 text-white font-bold text-[10px] flex items-center gap-0.5 cursor-pointer transition-transform active:scale-90"
                >
                  {copiedCode === currentOffer.couponCode ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-300">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-300" />
                      <span className="text-slate-300 hidden sm:inline">Copy</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Validity notice */}
            {currentOffer.endDate && (
              <div className="hidden xl:flex items-center gap-1 text-[11px] text-amber-300/90 font-medium">
                <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                <span>Valid till {currentOffer.endDate}</span>
              </div>
            )}

            {/* Primary Action CTA */}
            <Link to={currentOffer.ctaLink || '/find-library'}>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl font-black text-xs bg-gradient-to-r from-brand-500 to-indigo-500 hover:from-brand-600 hover:to-indigo-600 text-white shadow-md shadow-brand-500/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              >
                <span>{currentOffer.ctaText || 'Claim Offer'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>

            {/* Multi-Offer Controls: Arrows & Indicators */}
            {offers.length > 1 && (
              <div className="flex items-center gap-1 pl-1 border-l border-white/15">
                <button
                  type="button"
                  onClick={handlePrev}
                  title="Previous offer"
                  className="p-1 rounded-lg hover:bg-white/15 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  aria-label="Previous offer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Dots indicator */}
                <div className="flex items-center gap-1 px-1">
                  {offers.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCurrentIndex(i)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        i === currentIndex ? 'w-4 bg-amber-400' : 'w-1.5 bg-white/30 hover:bg-white/50'
                      }`}
                      aria-label={`Go to offer slide ${i + 1}`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  title="Next offer"
                  className="p-1 rounded-lg hover:bg-white/15 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  aria-label="Next offer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};
