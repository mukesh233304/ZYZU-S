import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Sparkles, ExternalLink, ShieldCheck, 
  GraduationCap, BookMarked, Award 
} from 'lucide-react';
import { Button } from '../common/Button';
import { AdPlacement, AdvertisementCampaign } from '../../types/advertisement';
import { advertisementService } from '../../services/advertisementService';

interface HomepageAdBannerProps {
  placement: AdPlacement;
  fallbackTitle?: string;
  fallbackDescription?: string;
}

export const HomepageAdBanner: React.FC<HomepageAdBannerProps> = ({
  placement,
  fallbackTitle,
  fallbackDescription
}) => {
  const navigate = useNavigate();
  const [ad, setAd] = useState<AdvertisementCampaign | null>(null);

  useEffect(() => {
    const loadAd = () => {
      const active = advertisementService.getActiveCampaign(placement);
      setAd(active);
      if (active) {
        advertisementService.recordImpression(active.id);
      }
    };
    loadAd();
    return advertisementService.subscribe(loadAd);
  }, [placement]);

  if (!ad) return null;

  const handleCtaClick = () => {
    advertisementService.recordClick(ad.id);
    const dest = ad.destinationUrl;
    if (dest.startsWith('http://') || dest.startsWith('https://')) {
      window.open(dest, '_blank', 'noopener,noreferrer');
    } else {
      navigate(dest);
    }
  };

  const isExternal = ad.destinationUrl.startsWith('http://') || ad.destinationUrl.startsWith('https://');

  // Render Full-Width Image Banner
  if (ad.layout === 'full-width') {
    return (
      <div 
        onClick={handleCtaClick}
        className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-slate-900 shadow-xl overflow-hidden mb-8 relative group cursor-pointer"
      >
        <img 
          src={ad.imageUrl} 
          alt={ad.headline} 
          className="w-full h-56 sm:h-72 lg:h-80 object-cover group-hover:scale-102 transition-transform duration-500" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex flex-col justify-end p-6 sm:p-8 text-white">
          {ad.badgeText && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/80 text-white text-[11px] font-black uppercase tracking-wider mb-2 w-fit">
              <Sparkles className="w-3.5 h-3.5" />
              {ad.badgeText}
            </span>
          )}
          <h4 className="text-xl sm:text-3xl font-black text-white">{ad.headline}</h4>
          <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-2xl line-clamp-2">{ad.description}</p>
          <div className="pt-4 flex items-center gap-3">
            <Button size="sm" className="font-bold shadow-md shadow-brand-500/25" rightIcon={<ArrowRight className="w-4 h-4" />}>
              {ad.ctaText || 'Learn More'}
            </Button>
            {ad.supportingText && (
              <span className="text-xs text-amber-300 font-bold hidden sm:inline-block">
                {ad.supportingText}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render Standard Split Layout (Default MNC Standard)
  return (
    <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white shadow-lg overflow-hidden mb-6 grid grid-cols-1 lg:grid-cols-12 transition-all hover:shadow-xl">
      <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-center space-y-3.5">
        {ad.badgeText && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-black uppercase tracking-wider shadow-xs w-fit">
            {placement === 'MENTORSHIP_SLOT' ? (
              <GraduationCap className="w-3.5 h-3.5 text-brand-600 shrink-0" />
            ) : (
              <BookMarked className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            )}
            <span>{ad.badgeText}</span>
          </div>
        )}

        <div>
          <h4 className="text-xl sm:text-2xl font-black text-slate-950 leading-tight">
            {ad.headline}
          </h4>
          {ad.subheading && (
            <p className="text-xs sm:text-sm font-bold text-brand-700 mt-0.5">
              {ad.subheading}
            </p>
          )}
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
          {ad.description}
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button 
            size="sm" 
            onClick={handleCtaClick}
            rightIcon={isExternal ? <ExternalLink className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />} 
            className="shadow-md shadow-brand-500/25 font-bold"
          >
            {ad.ctaText || 'Learn More'}
          </Button>

          {ad.supportingText && (
            <span className="text-xs text-slate-600 font-bold hidden sm:inline-block">
              {ad.supportingText}
            </span>
          )}
        </div>
      </div>

      <div className="lg:col-span-5 h-48 lg:h-auto relative overflow-hidden bg-slate-100 min-h-[220px]">
        <img 
          src={ad.imageUrl} 
          alt={ad.headline} 
          className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent lg:block hidden w-16" />
      </div>
    </div>
  );
};
