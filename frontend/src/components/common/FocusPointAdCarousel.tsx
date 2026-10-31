import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ChevronLeft, ChevronRight, ExternalLink, Sparkles, 
  Volume2, VolumeX, Play, Pause, ShieldCheck, Tag, ArrowRight 
} from 'lucide-react';
import { AdvertisementCampaign, AdTargetPage } from '../../types/advertisement';
import { advertisementService } from '../../services/advertisementService';

interface FocusPointAdCarouselProps {
  page: AdTargetPage;
  districtId?: string;
  stateId?: string;
  className?: string;
  fallbackContent?: React.ReactNode;
  autoPlayInterval?: number;
  showPlacementBadge?: boolean;
}

export const FocusPointAdCarousel: React.FC<FocusPointAdCarouselProps> = ({
  page,
  districtId,
  stateId,
  className = '',
  fallbackContent,
  autoPlayInterval = 6500,
  showPlacementBadge = true,
}) => {
  const [campaigns, setCampaigns] = useState<AdvertisementCampaign[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const recordedImpressions = useRef<Set<string>>(new Set());

  // Load eligible, unexpired campaigns for this page and location
  const loadCampaigns = useCallback(() => {
    const activeAds = advertisementService.getCampaignsForPage(page, { districtId, stateId });
    setCampaigns(activeAds);
    if (currentIndex >= activeAds.length) {
      setCurrentIndex(0);
    }
  }, [page, districtId, stateId, currentIndex]);

  useEffect(() => {
    loadCampaigns();
    return advertisementService.subscribe(loadCampaigns);
  }, [loadCampaigns]);

  // Record impression for current slide
  useEffect(() => {
    if (campaigns.length > 0 && campaigns[currentIndex]) {
      const currentAd = campaigns[currentIndex];
      if (!recordedImpressions.current.has(currentAd.id)) {
        advertisementService.recordImpression(currentAd.id);
        recordedImpressions.current.add(currentAd.id);
      }
    }
  }, [currentIndex, campaigns]);

  // Auto rotation timer
  useEffect(() => {
    if (campaigns.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % campaigns.length);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [campaigns.length, isPaused, autoPlayInterval]);

  // Handle Video Play Telemetry
  const handleVideoPlay = (adId: string) => {
    advertisementService.recordVideoPlay(adId);
  };

  // Navigation handlers
  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? campaigns.length - 1 : prev - 1));
  }, [campaigns.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % campaigns.length);
  }, [campaigns.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current) return;
      if (document.activeElement && containerRef.current.contains(document.activeElement)) {
        if (e.key === 'ArrowLeft') {
          handlePrev();
        } else if (e.key === 'ArrowRight') {
          handleNext();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext]);

  // Touch Swipe handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }

    setTouchStartX(null);
    setTouchEndX(null);
  };

  // Safe CTA Click Handler
  const handleCtaClick = (e: React.MouseEvent, ad: AdvertisementCampaign) => {
    e.stopPropagation();
    advertisementService.recordClick(ad.id);
    const safeUrl = advertisementService.sanitizeUrl(ad.destinationUrl);
    if (safeUrl.startsWith('http://') || safeUrl.startsWith('https://')) {
      window.open(safeUrl, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = safeUrl;
    }
  };

  // Fallback to normal page content or fallback prop if 0 campaigns
  if (!campaigns || campaigns.length === 0) {
    if (fallbackContent) {
      return <div className={`w-full ${className}`}>{fallbackContent}</div>;
    }
    return null;
  }

  const currentAd = campaigns[currentIndex];
  const mediaType = currentAd.mediaType || 'RICH_AD';

  return (
    <section 
      ref={containerRef}
      tabIndex={0}
      aria-label="Promotions and Featured Announcements"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/90 shadow-lg bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${className}`}
    >
      {/* Background Ambience Glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner Tag / Sponsor Pill */}
      {showPlacementBadge && (
        <div className="absolute top-3.5 left-4 sm:left-6 z-20 flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/80 text-[10px] sm:text-xs font-black tracking-wide text-brand-300 uppercase shadow-xs">
            <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
            <span>{currentAd.advertiserName || "ZYZU'S Special"}</span>
          </div>

          {currentAd.promotionalOffer && (
            <div className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] sm:text-xs font-bold">
              <Tag className="w-3 h-3 text-emerald-400" />
              <span>{currentAd.promotionalOffer}</span>
            </div>
          )}

          {currentAd.badgeText && (
            <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-200 text-[10px] font-bold">
              {currentAd.badgeText}
            </div>
          )}
        </div>
      )}

      {/* Carousel Slide Renderers by Media Type */}
      <div className="relative z-10 p-5 sm:p-7 md:p-8 min-h-[220px] sm:min-h-[250px] flex items-center">
        {/* FORMAT 1: TEXT ONLY */}
        {mediaType === 'TEXT_ONLY' && (
          <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-6 pt-5 sm:pt-4">
            <div className="max-w-3xl space-y-2.5">
              {currentAd.subheading && (
                <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-brand-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-brand-400" />
                  {currentAd.subheading}
                </p>
              )}
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-snug">
                {currentAd.headline}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                {currentAd.description}
              </p>
              {currentAd.supportingText && (
                <p className="text-[11px] font-semibold text-emerald-300/90 pt-1">
                  {currentAd.supportingText}
                </p>
              )}
            </div>
            <div className="shrink-0 flex items-center gap-3">
              <button
                type="button"
                onClick={(e) => handleCtaClick(e, currentAd)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-indigo-500/30 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <span>{currentAd.ctaText || 'Explore Now'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* FORMAT 2: IMAGE ONLY */}
        {mediaType === 'IMAGE_ONLY' && (
          <div 
            onClick={(e) => handleCtaClick(e, currentAd)}
            className="w-full rounded-xl overflow-hidden cursor-pointer group relative pt-4"
          >
            <img
              src={currentAd.imageUrl || '/assets/images/white_home_tuition_bg.jpg'}
              alt={currentAd.headline}
              className="w-full h-44 sm:h-56 md:h-64 object-cover rounded-xl border border-slate-700/60 shadow-md group-hover:scale-[1.01] transition-transform duration-300"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-end p-4">
              <span className="text-xs font-bold text-white flex items-center gap-1.5 bg-black/60 px-3 py-1.5 rounded-lg backdrop-blur-md">
                <span>{currentAd.ctaText || 'Learn More'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        )}

        {/* FORMAT 3: VIDEO ONLY */}
        {mediaType === 'VIDEO_ONLY' && (
          <div className="w-full rounded-xl overflow-hidden relative pt-4 flex flex-col items-center">
            <div className="relative w-full max-w-4xl h-48 sm:h-64 md:h-72 rounded-xl overflow-hidden bg-black/80 border border-slate-700">
              <video
                ref={videoRef}
                src={currentAd.videoUrl || 'https://assets.mixkit.co/videos/preview/mixkit-student-studying-in-a-library-4860-large.mp4'}
                autoPlay
                loop
                muted={isVideoMuted}
                playsInline
                onPlay={() => handleVideoPlay(currentAd.id)}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 right-3 z-20 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsVideoMuted(!isVideoMuted)}
                  className="p-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white backdrop-blur-md border border-slate-700 cursor-pointer"
                  title={isVideoMuted ? 'Unmute' : 'Mute'}
                >
                  {isVideoMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={(e) => handleCtaClick(e, currentAd)}
                  className="px-3.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <span>{currentAd.ctaText || 'View Details'}</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FORMAT 4: IMAGE + TEXT */}
        {mediaType === 'IMAGE_TEXT' && (
          <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-center pt-5 sm:pt-4">
            <div className="md:col-span-7 space-y-2.5">
              {currentAd.subheading && (
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-brand-400">
                  <ShieldCheck className="w-4 h-4 text-brand-400" />
                  <span>{currentAd.subheading}</span>
                </div>
              )}
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-snug">
                {currentAd.headline}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed line-clamp-3">
                {currentAd.description}
              </p>
              {currentAd.supportingText && (
                <p className="text-[11px] font-semibold text-emerald-300 flex items-center gap-1.5">
                  <span>⚡</span>
                  <span>{currentAd.supportingText}</span>
                </p>
              )}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={(e) => handleCtaClick(e, currentAd)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-indigo-500/30 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <span>{currentAd.ctaText || 'Explore Now'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="md:col-span-5 flex justify-center">
              <img
                src={currentAd.imageUrl || '/assets/images/white_home_tuition_bg.jpg'}
                alt={currentAd.headline}
                className="w-full max-h-48 sm:max-h-56 object-cover rounded-xl border border-slate-700/80 shadow-md"
                loading="lazy"
              />
            </div>
          </div>
        )}

        {/* FORMAT 5: VIDEO + TEXT */}
        {mediaType === 'VIDEO_TEXT' && (
          <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-center pt-5 sm:pt-4">
            <div className="md:col-span-7 space-y-2.5">
              {currentAd.subheading && (
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-brand-400">
                  <ShieldCheck className="w-4 h-4 text-brand-400" />
                  <span>{currentAd.subheading}</span>
                </div>
              )}
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-snug">
                {currentAd.headline}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed line-clamp-3">
                {currentAd.description}
              </p>
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={(e) => handleCtaClick(e, currentAd)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <span>{currentAd.ctaText || 'Start Watching'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="md:col-span-5 relative rounded-xl overflow-hidden border border-slate-700 bg-black aspect-video max-h-52">
              <video
                src={currentAd.videoUrl || 'https://assets.mixkit.co/videos/preview/mixkit-student-studying-in-a-library-4860-large.mp4'}
                autoPlay
                loop
                muted={isVideoMuted}
                playsInline
                onPlay={() => handleVideoPlay(currentAd.id)}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setIsVideoMuted(!isVideoMuted)}
                className="absolute bottom-2.5 right-2.5 p-1 rounded-full bg-slate-900/80 text-white border border-slate-700 cursor-pointer"
                title={isVideoMuted ? 'Unmute' : 'Mute'}
              >
                {isVideoMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        )}

        {/* FORMAT 6: RICH ADVERTISEMENT (DEFAULT & ALL-FEATURED) */}
        {mediaType === 'RICH_AD' && (
          <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-7 items-center pt-6 sm:pt-5">
            <div className="md:col-span-7 space-y-3">
              {/* Company Logo + Name Header */}
              {currentAd.companyLogoUrl && (
                <div className="flex items-center gap-2.5">
                  <img
                    src={currentAd.companyLogoUrl}
                    alt={currentAd.advertiserName || 'Company'}
                    className="w-7 h-7 rounded-lg object-contain bg-white/10 p-1 border border-white/20"
                  />
                  <span className="text-xs font-bold text-slate-300 tracking-wide uppercase">
                    {currentAd.advertiserName}
                  </span>
                </div>
              )}

              {currentAd.subheading && (
                <p className="text-xs font-extrabold uppercase tracking-wider text-brand-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
                  <span>{currentAd.subheading}</span>
                </p>
              )}

              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-snug">
                {currentAd.headline}
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed line-clamp-3">
                {currentAd.description}
              </p>

              {currentAd.supportingText && (
                <p className="text-[11px] font-semibold text-emerald-300 flex items-center gap-1.5">
                  <span>✨</span>
                  <span>{currentAd.supportingText}</span>
                </p>
              )}

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={(e) => handleCtaClick(e, currentAd)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-indigo-700 hover:from-brand-500 hover:to-indigo-600 text-white font-black text-xs sm:text-sm shadow-md hover:shadow-indigo-500/40 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <span>{currentAd.ctaText || 'Get Started'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                  <span>Verified Campaign</span>
                  <span>•</span>
                  <span>Pan-India Priority</span>
                </div>
              </div>
            </div>

            {/* Media Presentation */}
            <div className="md:col-span-5 flex justify-center">
              {currentAd.videoUrl ? (
                <div className="w-full relative rounded-xl overflow-hidden border border-slate-700 bg-black aspect-video max-h-52 shadow-md">
                  <video
                    src={currentAd.videoUrl}
                    autoPlay
                    loop
                    muted={isVideoMuted}
                    playsInline
                    onPlay={() => handleVideoPlay(currentAd.id)}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setIsVideoMuted(!isVideoMuted)}
                    className="absolute bottom-2.5 right-2.5 p-1 rounded-full bg-slate-900/80 text-white border border-slate-700 cursor-pointer"
                    title={isVideoMuted ? 'Unmute' : 'Mute'}
                  >
                    {isVideoMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ) : (
                <div className="w-full rounded-xl overflow-hidden border border-slate-700/80 shadow-md">
                  <img
                    src={currentAd.imageUrl || '/assets/images/white_home_tuition_bg.jpg'}
                    alt={currentAd.headline}
                    className="w-full h-44 sm:h-52 object-cover rounded-xl"
                    loading="lazy"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Carousel Navigation Arrows (Show only if > 1 campaign) */}
      {campaigns.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous advertisement"
            className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-20 p-1.5 sm:p-2 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white/90 hover:text-white backdrop-blur-md border border-slate-700/80 shadow-md cursor-pointer transition-all active:scale-90"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Next advertisement"
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-20 p-1.5 sm:p-2 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white/90 hover:text-white backdrop-blur-md border border-slate-700/80 shadow-md cursor-pointer transition-all active:scale-90"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </>
      )}

      {/* Bottom Pagination Indicators */}
      {campaigns.length > 1 && (
        <div className="absolute bottom-2.5 sm:bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
          {campaigns.map((ad, index) => (
            <button
              key={ad.id}
              type="button"
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                index === currentIndex 
                  ? 'w-7 sm:w-8 bg-brand-400' 
                  : 'w-2 bg-slate-600/80 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
};
