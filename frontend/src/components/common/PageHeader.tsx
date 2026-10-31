import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  path?: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  action?: React.ReactNode;
  actions?: React.ReactNode;
  dark?: boolean;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  subtitle,
  breadcrumbs,
  action,
  actions,
  dark,
}) => {
  const isDark = Boolean(dark);

  const displaySubtitle = subtitle || description;
  const displayAction = actions || action;

  return (
    <div className={`mb-6 pb-4 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className={`flex items-center gap-1.5 text-xs mb-2 font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            <Link to="/" className={isDark ? 'hover:text-cyan-400 text-slate-300 transition-colors' : 'hover:text-brand-600 text-slate-600 transition-colors'}>
              <Home className="w-3.5 h-3.5" />
            </Link>
            {breadcrumbs.map((b, idx) => {
              const linkTarget = b.href || b.path;
              return (
                <React.Fragment key={idx}>
                  <ChevronRight className={`w-3 h-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  {linkTarget ? (
                    <Link to={linkTarget} className={isDark ? 'hover:text-cyan-400 text-slate-300 font-bold transition-colors' : 'hover:text-brand-600 text-slate-700 font-bold transition-colors'}>
                      {b.label}
                    </Link>
                  ) : (
                    <span className={isDark ? 'text-white font-extrabold' : 'text-slate-950 font-black'}>{b.label}</span>
                  )}
                </React.Fragment>
              );
            })}
          </nav>
        )}
        <h1 className={`text-xl sm:text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-950'}`}>{title}</h1>
        {displaySubtitle && (
          <p className={`text-xs sm:text-sm font-semibold mt-1 leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{displaySubtitle}</p>
        )}
      </div>
      {displayAction && <div className="shrink-0">{displayAction}</div>}
    </div>
  );
};
