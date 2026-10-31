import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, BookMarked, ArrowRight, ShieldCheck, 
  Sparkles, ChevronLeft, ChevronRight, CheckCircle2, MapPin,
  Fingerprint, Award, FileCheck2, Lock, Activity
} from 'lucide-react';
import { HeroSlide } from '../../types/homepage';
import { homepageService } from '../../services/homepageService';
import { pinCodeService } from '../../services/pinCodeService';
import { LocationHierarchySelection } from '../../types/location';

interface HeroCarouselProps {
  autoRotateInterval?: number;
  onLocationResolved?: (loc: LocationHierarchySelection) => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  autoRotateInterval = 4500,
  onLocationResolved,
}) => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Hero Smart PIN Discovery State
  const [heroPin, setHeroPin] = useState('');
  const [isPinLoading, setIsPinLoading] = useState(false);
  const [heroPinError, setHeroPinError] = useState<string | null>(null);
  const [resolvedLocation, setResolvedLocation] = useState<{
    pincode: string;
    stateName?: string;
    districtName?: string;
    localityName?: string;
    districtId?: string;
    localityId?: string;
  } | null>(null);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useEffect(() => {
    homepageService.getHeroSlides().then((res) => {
      setSlides(res);
      setIsLoading(false);
    });
  }, []);

  const handleNext = useCallback(() => {
    if (slides.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const handlePrev = useCallback(() => {
    if (slides.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Auto rotation
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      handleNext();
    }, autoRotateInterval);

    return () => clearInterval(timer);
  }, [slides.length, isPaused, autoRotateInterval, handleNext]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrev();
    if (e.key === 'ArrowRight') handleNext();
  };

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) handleNext();
    if (diff < -50) handlePrev();
    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (isLoading || slides.length === 0) {
    return (
      <div className="w-full h-[480px] sm:h-[540px] bg-slate-900 animate-pulse flex items-center justify-center">
        <div className="text-slate-400 text-sm font-semibold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-brand-400 animate-spin" />
          <span>Loading ZYZU'S Experience...</span>
        </div>
      </div>
    );
  }

  const handleHeroPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHeroPinError(null);
    const cleanPin = heroPin.trim();

    if (!cleanPin || cleanPin.length !== 6 || !/^[1-9][0-9]{5}$/.test(cleanPin)) {
      setHeroPinError('Enter a valid 6-digit Indian PIN code.');
      return;
    }

    setIsPinLoading(true);
    try {
      const res = await pinCodeService.resolvePinCode(cleanPin);
      if (res.success) {
        setResolvedLocation({
          pincode: res.pincode,
          stateName: res.stateName,
          districtName: res.districtName,
          localityName: res.localityName,
          districtId: res.districtId,
          localityId: res.localityId,
        });
        if (onLocationResolved && res.districtId) {
          onLocationResolved({
            countryId: 'loc-country-in',
            stateId: res.stateId,
            districtId: res.districtId,
            localityId: res.localityId,
            areaId: res.areaId,
            stateName: res.stateName,
            districtName: res.districtName,
            localityName: res.localityName,
            areaName: res.areaName,
          });
        }
      } else {
        setHeroPinError(res.message || "We couldn't find this PIN code. Please check the PIN and try again.");
      }
    } catch {
      setHeroPinError('Location lookup is temporarily unavailable. Please try again.');
    } finally {
      setIsPinLoading(false);
    }
  };

  const currentSlide = slides[currentIndex];

  return (
    <div 
      className="relative w-full overflow-hidden bg-slate-950 text-white select-none border-b border-slate-800"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      tabIndex={0}
      role="region"
      aria-label="Homepage Hero Carousel"
    >
      {/* Background Image with Deep Contrast Overlay */}
      <div className="relative min-h-[500px] sm:min-h-[560px] lg:min-h-[600px] flex items-center">
        
        {/* Background Slide Image with Crossfade */}
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentIndex ? 'opacity-100 z-0' : 'opacity-0 pointer-events-none'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.altText}
              className="w-full h-full object-cover object-center"
            />
            {/* Multi-tier Gradient for 100% Guaranteed High-Contrast Typography */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/40 lg:bg-gradient-to-r lg:from-slate-950/95 lg:via-slate-950/80 lg:to-slate-950/30" />
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px] opacity-10" />
          </div>
        ))}

        {/* Ambient Subtle Tech Glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none z-10" />

        {/* Hero Content Container */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Headlines & CTAs (lg:col-span-8) */}
            <div className="lg:col-span-8 space-y-5 sm:space-y-6 text-left">
              
              {/* Trust Badge with Live Indicator */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-black shadow-lg">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span className="tracking-wide text-cyan-200">{currentSlide.badgeText}</span>
              </div>

              {/* Master Headline with Highlight */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.14]">
                {currentSlide.headline}{' '}
                <span className="bg-gradient-to-r from-amber-300 via-amber-200 to-cyan-300 bg-clip-text text-transparent drop-shadow-sm">
                  {currentSlide.highlightedText}
                </span>
              </h1>

              {/* High-Contrast Description */}
              <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-medium max-w-2xl drop-shadow-sm">
                {currentSlide.description}
              </p>

              {/* Tagline / Subtitle */}
              {currentSlide.tagline && (
                <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-300">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{currentSlide.tagline}</span>
                </div>
              )}

              {/* Dual Primary Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3.5 pt-2 sm:pt-4">
                <Link to={currentSlide.primaryCtaLink} className="w-full sm:w-auto">
                  <button
                    type="button"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 rounded-xl font-black text-sm sm:text-base bg-gradient-to-r from-brand-500 via-brand-600 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white shadow-xl shadow-brand-500/30 active:scale-95 transition-all cursor-pointer"
                  >
                    <GraduationCap className="w-5 h-5 text-amber-300 shrink-0" />
                    <span>{currentSlide.primaryCtaText}</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </button>
                </Link>

                {currentSlide.secondaryCtaText && (
                  <Link to={currentSlide.secondaryCtaLink || '/find-library'} className="w-full sm:w-auto">
                    <button
                      type="button"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3.5 rounded-xl font-bold text-sm sm:text-base bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-md shadow-lg active:scale-95 transition-all cursor-pointer"
                    >
                      <BookMarked className="w-5 h-5 text-cyan-300 shrink-0" />
                      <span>{currentSlide.secondaryCtaText}</span>
                    </button>
                  </Link>
                )}
              </div>

              {/* Smart PIN-code Quick Discovery Bar */}
              <div className="pt-2 max-w-xl">
                <form
                  onSubmit={handleHeroPinSubmit}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-1.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl"
                >
                  <div className="flex-1 flex items-center gap-2 px-3 py-1.5 text-white">
                    <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={heroPin}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setHeroPin(val);
                        setHeroPinError(null);
                      }}
                      placeholder="Enter 6-digit PIN code (e.g. 233304)"
                      className="w-full bg-transparent border-none text-xs sm:text-sm font-semibold text-white placeholder-slate-300 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isPinLoading}
                    className="px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isPinLoading ? 'Resolving...' : 'Explore Near Me'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
                {heroPinError && (
                  <p className="text-[11px] font-bold text-rose-300 mt-1.5 pl-2">{heroPinError}</p>
                )}
                {resolvedLocation && (
                  <div className="mt-2.5 p-3 rounded-xl bg-slate-900/95 border border-cyan-500/40 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs animate-fade-in shadow-xl">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="font-mono text-cyan-300 font-bold">📍 {resolvedLocation.pincode}:</span>
                      <span className="text-white font-medium">
                        {resolvedLocation.localityName ? `${resolvedLocation.localityName}, ` : ''}{resolvedLocation.districtName}, {resolvedLocation.stateName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        to={`/find-tutor?district=${resolvedLocation.districtId || ''}&locality=${resolvedLocation.localityId || ''}`}
                        className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold shadow-xs"
                      >
                        Find Home Tutors
                      </Link>
                      <Link
                        to={`/find-library?district=${resolvedLocation.districtId || ''}&locality=${resolvedLocation.localityId || ''}`}
                        className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-bold shadow-xs"
                      >
                        Find Libraries
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Trust Indicators Bar */}
              <div className="grid grid-cols-3 gap-2 sm:gap-6 pt-4 border-t border-white/15 text-xs text-slate-200">
                <div className="flex items-center gap-1.5 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="truncate">100% KYC Vetted</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="truncate">Admin Supervised</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="truncate">Instant Seat Booking</span>
                </div>
              </div>

            </div>

            {/* Right Column: Floating Stats Highlight Card (lg:col-span-4) */}
            <div className="lg:col-span-4 block mt-6 lg:mt-0">
              {currentSlide.floatingStats && (
                <div className="relative p-5 sm:p-6 rounded-3xl bg-white/[0.04] sm:bg-slate-950/25 backdrop-blur-2xl border border-white/15 hover:border-cyan-400/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-4 max-w-sm mx-auto lg:ml-auto overflow-hidden ring-1 ring-white/10 hover:ring-cyan-400/30 transition-all duration-500 group">
                  {/* Subtle Tech Cyber Circuit Glow */}
                  <div className="absolute -top-16 -right-16 w-36 h-36 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none group-hover:scale-150 transition-transform duration-700" />
                  <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none" />

                  {/* Futuristic Corner Tech Bracket Accents */}
                  <div className="absolute top-2 left-2 w-2.5 h-2.5 border-t border-l border-cyan-400/60 pointer-events-none" />
                  <div className="absolute top-2 right-2 w-2.5 h-2.5 border-t border-r border-cyan-400/60 pointer-events-none" />
                  <div className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b border-l border-cyan-400/60 pointer-events-none" />
                  <div className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b border-r border-cyan-400/60 pointer-events-none" />

                  {/* Card Header: Node ID & Live Telemetry Badge */}
                  <div className="relative z-10 flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shadow-xs">
                        <Fingerprint className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div>
                        <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-cyan-300 block">
                          {currentSlide.floatingStats.label}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400 block -mt-0.5">
                          SEC-NODE // DISTRICT AUTH
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-[10px] font-mono font-bold text-emerald-300 shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      <span>LIVE AUDITED</span>
                    </div>
                  </div>

                  {/* Big Futuristic Value & Subtext */}
                  <div className="relative z-10 space-y-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="text-3xl sm:text-4xl font-black text-white tracking-tight bg-gradient-to-r from-emerald-300 via-cyan-200 to-white bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(34,211,238,0.25)]">
                        {currentSlide.floatingStats.value}
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-white/10 text-cyan-200 border border-white/15">
                        UIDAI + DEGREE
                      </span>
                    </div>

                    {currentSlide.floatingStats.subtext && (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-100/90 pt-0.5">
                        <Award className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                        <span>{currentSlide.floatingStats.subtext}</span>
                      </div>
                    )}
                  </div>

                  {/* Micro Cybernetic Verification Telemetry Checklist */}
                  <div className="relative z-10 py-2.5 px-3 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5 text-[11px] text-slate-300 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5 text-[10px]">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        Masked Aadhaar Verification
                      </span>
                      <span className="text-[10px] text-emerald-300 font-bold">100% PASSED</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5 text-[10px]">
                        <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0" />
                        University Original Degree
                      </span>
                      <span className="text-[10px] text-cyan-300 font-bold">AUTHENTICATED</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5 text-[10px]">
                        <CheckCircle2 className="w-3 h-3 text-purple-400 shrink-0" />
                        District Admin Jurisdiction
                      </span>
                      <span className="text-[10px] text-purple-300 font-bold">SUPERVISED</span>
                    </div>
                  </div>

                  {/* Live Trust Rating Gauge & Seal */}
                  <div className="relative z-10 pt-2 border-t border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>INTEGRITY INDEX</span>
                      <span className="text-emerald-400 font-bold">99.8% VERIFIED</span>
                    </div>
                    {/* Glowing Trust Bar */}
                    <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-indigo-400 w-[99.8%] shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                        <span>★★★★★</span>
                        <span className="text-slate-300 ml-1 text-[10px] font-mono">GOVT / BOARD COMPLIANT</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-cyan-400 tracking-wider">
                        ZYZU'S
                      </span>
                    </div>
                  </div>

                </div>
              )}
            </div>

          </div>
        </div>

        {/* Carousel Previous & Next Controls */}
        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 border border-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-90 cursor-pointer"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 border border-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-90 cursor-pointer"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Slide Indicators / Dots */}
        {slides.length > 1 && (
          <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentIndex(i)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  i === currentIndex ? 'w-6 bg-amber-400' : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
