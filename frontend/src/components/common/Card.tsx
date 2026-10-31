import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hoverable = false, ...props }) => {
  return (
    <div
      className={cn(
        'rounded-2xl bg-white border border-slate-200/90 p-5 shadow-sm text-slate-900',
        hoverable && 'hover:shadow-md hover:border-brand-400/60 transition-all',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  change?: string;
  isPositive?: boolean;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  change,
  isPositive = true,
  className = '',
}) => {
  const displayTrend = trend || (change ? { value: change, isPositive } : undefined);

  return (
    <div className={cn('rounded-2xl bg-white border border-slate-200/90 p-5 flex items-start justify-between relative overflow-hidden group hover:border-brand-300 hover:shadow-md transition-all text-slate-900', className)}>
      <div className="space-y-2">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</p>
        <p className="text-2xl lg:text-3xl font-black text-slate-950 tracking-tight">{value}</p>
        {subtitle && <p className="text-xs text-slate-600 font-medium">{subtitle}</p>}
        {displayTrend && (
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <span className={displayTrend.isPositive ? 'text-emerald-600' : 'text-rose-600'}>
              {displayTrend.isPositive ? '↑' : '↓'} {displayTrend.value}
            </span>
            <span className="text-slate-500 font-normal">vs last month</span>
          </div>
        )}
      </div>
      <div className="p-3 rounded-xl bg-brand-50 text-brand-600 border border-brand-100 group-hover:scale-110 group-hover:bg-brand-100 transition-all">
        {icon}
      </div>
    </div>
  );
};
