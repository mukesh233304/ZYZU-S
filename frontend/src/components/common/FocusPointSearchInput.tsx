import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

export interface FocusPointSearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  loading?: boolean;
  className?: string;
  containerClassName?: string;
  sizeVariant?: 'sm' | 'md' | 'lg';
  id?: string;
  label?: string;
}

export const FocusPointSearchInput = forwardRef<HTMLInputElement, FocusPointSearchInputProps>(({
  value,
  onChange,
  onClear,
  onSearch,
  placeholder = 'Search by keyword, name, ID...',
  loading = false,
  className = '',
  containerClassName = '',
  sizeVariant = 'md',
  id,
  label,
  disabled = false,
  autoComplete = 'off',
  ...rest
}, ref) => {
  const internalInputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => internalInputRef.current as HTMLInputElement);

  const inputId = id || `fp-search-${Math.random().toString(36).substring(2, 9)}`;

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange('');
    if (onClear) onClear();
    if (internalInputRef.current) {
      internalInputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape' && value) {
      e.preventDefault();
      onChange('');
      if (onClear) onClear();
    } else if (e.key === 'Enter' && onSearch) {
      e.preventDefault();
      onSearch(value);
    }
  };

  const sizeClasses = {
    sm: 'py-2 pl-10 pr-9 text-xs',
    md: 'py-2.5 pl-11 pr-10 text-sm',
    lg: 'py-3.5 pl-12 pr-11 text-base',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label htmlFor={inputId} className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}
      <div className="relative flex items-center w-full group">
        {/* Dedicated Fixed Icon Slot with zero overlap */}
        <div 
          className="absolute inset-y-0 left-0 pl-3.5 flex items-center justify-center pointer-events-none text-slate-400 group-focus-within:text-royal-blue-600 transition-colors z-10"
          aria-hidden="true"
        >
          <Search className={iconSizes[sizeVariant]} />
        </div>

        {/* Input Field with explicit left padding preventing icon collision */}
        <input
          ref={internalInputRef}
          id={inputId}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`w-full rounded-xl bg-white border border-slate-300 text-slate-900 font-semibold placeholder:text-slate-400 placeholder:font-normal shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-royal-blue-500 focus:border-royal-blue-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed ${sizeClasses[sizeVariant]} ${className}`}
          {...rest}
        />

        {/* Right Action Container: Loading Spinner or Clear Button */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1">
          {loading && (
            <div className="flex items-center text-royal-blue-600 animate-spin" aria-label="Searching...">
              <Loader2 className={iconSizes[sizeVariant]} />
            </div>
          )}

          {!loading && value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-royal-blue-500 transition-colors cursor-pointer"
              title="Clear search"
              aria-label="Clear search input"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

FocusPointSearchInput.displayName = 'FocusPointSearchInput';
