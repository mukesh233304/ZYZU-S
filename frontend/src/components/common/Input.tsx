import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  icon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
  const effectiveLeftIcon = leftIcon || icon;

  const hasCustomBg = className.includes('bg-');
  const hasCustomText = className.includes('text-');
  const baseBg = hasCustomBg ? '' : 'bg-white';
  const baseText = hasCustomText ? '' : 'text-slate-900';

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          {label} {props.required && <span className="text-brand-600">*</span>}
        </label>
      )}
      <div className="relative">
        {effectiveLeftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            {effectiveLeftIcon}
          </div>
        )}
        <input
          id={inputId}
          className={`w-full rounded-lg ${baseBg} border ${
            error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-300 focus:border-brand-500 focus:ring-brand-500/20'
          } px-3.5 py-2.5 text-sm font-semibold ${baseText} placeholder-slate-400 transition-all focus:outline-none focus:ring-2 shadow-xs ${
            effectiveLeftIcon ? 'pl-10' : ''
          } ${rightIcon ? 'pr-10' : ''} ${className}`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-rose-500 font-bold">{error}</p>}
      {!error && helperText && <p className="mt-1.5 text-xs text-slate-500 font-medium">{helperText}</p>}
    </div>
  );
};
