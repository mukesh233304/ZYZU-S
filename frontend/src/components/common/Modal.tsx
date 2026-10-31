import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '5xl' | '6xl';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '5xl' | '6xl';
  variant?: 'default' | 'cyber' | 'dark';
  dialogClassName?: string;
  hideDefaultHeader?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'lg',
  size,
  variant = 'default',
  dialogClassName = '',
  hideDefaultHeader = false,
}) => {
  const modalWidth = size || maxWidth;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
  };

  const isCyber = variant === 'cyber' || variant === 'dark';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 text-center flex items-center justify-center">
        {/* Backdrop */}
        <div
          className={`fixed inset-0 transition-opacity ${
            isCyber ? 'bg-slate-950/80 backdrop-blur-md' : 'bg-slate-950/40 backdrop-blur-xs'
          }`}
          onClick={onClose}
        />

        {/* Modal Dialog */}
        <div
          className={`inline-block w-full ${widths[modalWidth]} my-8 text-left align-middle transition-all transform relative z-10 ${
            isCyber
              ? `bg-slate-950/95 border border-cyan-500/40 shadow-[0_0_60px_rgba(6,182,212,0.25)] rounded-3xl text-slate-100 overflow-hidden ${
                  title && !hideDefaultHeader ? 'p-0' : 'p-0'
                } ${dialogClassName}`
              : `bg-white border border-slate-200 shadow-2xl rounded-2xl p-6 text-slate-900 ${dialogClassName}`
          }`}
          role="dialog"
          aria-modal="true"
        >
          {!hideDefaultHeader && (title || !isCyber) && (
            <div
              className={`flex items-start justify-between ${
                isCyber
                  ? 'p-6 border-b border-cyan-500/20 bg-slate-900/60'
                  : 'mb-4'
              }`}
            >
              <div>
                {title && (
                  <h3
                    className={`text-lg font-black tracking-tight ${
                      isCyber ? 'text-white' : 'text-slate-950'
                    }`}
                  >
                    {title}
                  </h3>
                )}
                {description && (
                  <p
                    className={`text-xs font-medium mt-1 ${
                      isCyber ? 'text-slate-400' : 'text-slate-600'
                    }`}
                  >
                    {description}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isCyber
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                    : 'text-slate-500 hover:text-slate-950 hover:bg-slate-100'
                }`}
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
          <div className={isCyber && title && !hideDefaultHeader ? 'p-6' : isCyber ? 'p-0' : 'mt-2'}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
