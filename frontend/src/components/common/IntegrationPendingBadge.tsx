import React from 'react';
import { AlertCircle, Clock } from 'lucide-react';

export interface IntegrationPendingBadgeProps {
  label?: string;
  subtext?: string;
  featureName?: string;
  className?: string;
}

export const IntegrationPendingBadge: React.FC<IntegrationPendingBadgeProps> = ({
  label,
  subtext,
  featureName,
  className = '',
}) => {
  const displayLabel = label || (featureName ? `${featureName} (Pending)` : 'Backend Integration Pending');
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-semibold ${className}`}
      title={subtext || 'This action operates in frontend-first simulation mode until InsForge/banking APIs are wired.'}
    >
      <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
      <span>{displayLabel}</span>
    </div>
  );
};
