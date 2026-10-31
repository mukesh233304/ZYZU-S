import React from 'react';
import { Link } from 'react-router-dom';
import { BRAND_CONFIG } from '../../config/brand';

export interface BrandLogoProps {
  variant?: 'primary' | 'compact' | 'icon' | 'badge' | 'full';
  theme?: 'light' | 'dark' | 'auto';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  withLink?: boolean;
  className?: string;
  useFullImage?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'primary',
  theme = 'auto',
  size = 'md',
  showTagline = true,
  withLink = false,
  className = '',
  useFullImage = false
}) => {
  // Size metrics
  const sizeMap = {
    sm: {
      emblem: 'w-7 h-7',
      fullLogo: 'w-24 h-24',
      name: 'text-sm sm:text-base font-black tracking-tight',
      tagline: 'text-[8px] font-bold tracking-widest',
      gap: 'gap-2',
      badgePadding: 'px-2 py-0.5'
    },
    md: {
      emblem: 'w-9 h-9 sm:w-10 sm:h-10',
      fullLogo: 'w-32 h-32',
      name: 'text-base sm:text-lg lg:text-xl font-black tracking-tight',
      tagline: 'text-[9px] sm:text-[10px] font-bold tracking-widest',
      gap: 'gap-2.5',
      badgePadding: 'px-2.5 py-1'
    },
    lg: {
      emblem: 'w-12 h-12',
      fullLogo: 'w-40 h-40',
      name: 'text-xl sm:text-2xl font-black tracking-tight',
      tagline: 'text-[11px] sm:text-xs font-bold tracking-wider',
      gap: 'gap-3',
      badgePadding: 'px-3 py-1.5'
    },
    xl: {
      emblem: 'w-16 h-16',
      fullLogo: 'w-52 h-52',
      name: 'text-2xl sm:text-3xl font-black tracking-tight',
      tagline: 'text-xs sm:text-sm font-bold tracking-wider',
      gap: 'gap-4',
      badgePadding: 'px-4 py-2'
    }
  };

  const currentSize = sizeMap[size];

  // Theme text styling
  const nameColor =
    theme === 'dark'
      ? 'text-white'
      : theme === 'light'
      ? 'text-slate-950'
      : 'text-slate-900 dark:text-white';

  const tagColor =
    theme === 'dark'
      ? 'text-cyan-400'
      : theme === 'light'
      ? 'text-brand-600'
      : 'text-brand-600 dark:text-cyan-400';

  // Full official square brand asset (Z symbol + orange dot + ZYZU'S wordmark on blue gradient)
  if (variant === 'full' || useFullImage) {
    const fullLogoContent = (
      <div className={`flex flex-col items-center ${className}`}>
        <img
          src={BRAND_CONFIG.assets.logo512}
          alt="ZYZU'S — Tutors & Libraries"
          className={`${currentSize.fullLogo} rounded-2xl object-cover shadow-xl shadow-blue-500/25 border border-blue-400/30 select-none group-hover:scale-102 transition-transform`}
          loading="eager"
        />
        {showTagline && (
          <span className={`${currentSize.tagline} ${tagColor} uppercase tracking-wider font-extrabold mt-1.5`}>
            {BRAND_CONFIG.tagline}
          </span>
        )}
      </div>
    );

    return withLink ? (
      <Link to="/" className="inline-flex select-none group">
        {fullLogoContent}
      </Link>
    ) : (
      fullLogoContent
    );
  }

  // Official Brand Asset Emblem (Exact Z symbol + orange sphere on blue gradient)
  const emblemElement = (
    <div
      className={`${currentSize.emblem} rounded-xl overflow-hidden shadow-md shadow-brand-500/20 shrink-0 border border-blue-400/30 group-hover:scale-105 transition-transform bg-[#0a192f] flex items-center justify-center relative select-none`}
    >
      <img
        src={BRAND_CONFIG.assets.symbol192}
        alt="ZYZU'S Official Symbol"
        className="w-full h-full object-cover select-none pointer-events-none"
        loading="eager"
        onError={(e) => {
          const target = e.currentTarget as HTMLImageElement;
          if (target.src !== window.location.origin + BRAND_CONFIG.assets.logo192) {
            target.src = BRAND_CONFIG.assets.logo192;
          }
        }}
      />
    </div>
  );

  // Emblem-only view (e.g. compact mobile view / app icon)
  if (variant === 'icon') {
    return withLink ? <Link to="/" className="inline-flex select-none group">{emblemElement}</Link> : emblemElement;
  }

  const logoContent = (
    <div className={`flex items-center ${currentSize.gap} ${className}`}>
      {emblemElement}
      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-center gap-1">
          <span className={`${currentSize.name} ${nameColor} font-sans uppercase font-black`}>
            ZYZU<span className="text-orange-500 font-serif">'</span>S
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse inline-block" />
        </div>
        {(variant === 'primary' || showTagline) && (
          <span
            className={`${currentSize.tagline} ${tagColor} uppercase tracking-wider font-extrabold mt-0.5`}
          >
            {BRAND_CONFIG.tagline}
          </span>
        )}
      </div>
    </div>
  );

  if (withLink) {
    return (
      <Link to="/" className="inline-flex group select-none transition-opacity hover:opacity-95">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
};
