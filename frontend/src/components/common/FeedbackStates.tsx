import React from 'react';
import { AlertTriangle, Inbox, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export const LoadingSkeleton: React.FC<{ rows?: number }> = ({ rows = 4 }) => {
  return (
    <div className="w-full space-y-4 p-6 rounded-2xl bg-slate-100 border border-slate-200 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-200"></div>
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-slate-200 rounded w-1/3"></div>
          <div className="h-3 bg-slate-200 rounded w-1/4"></div>
        </div>
      </div>
      <div className="space-y-2.5 pt-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-4 bg-slate-200 rounded w-full"></div>
        ))}
      </div>
    </div>
  );
};

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode | React.ElementType;
  actionText?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionText,
  actionLabel,
  onAction,
}) => {
  const label = actionLabel || actionText;

  const renderIcon = () => {
    if (!icon) return <Inbox className="w-7 h-7" />;
    if (React.isValidElement(icon)) return icon;
    const IconComponent = icon as React.ElementType;
    return <IconComponent className="w-7 h-7" />;
  };

  return (
    <div className="py-12 px-4 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center max-w-lg mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 mb-4 shadow-sm">
        {renderIcon()}
      </div>
      <h3 className="text-base font-bold text-deep-navy-900 tracking-tight">{title}</h3>
      <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed">{description}</p>
      {label && onAction && (
        <Button size="sm" onClick={onAction} className="mt-5">
          {label}
        </Button>
      )}
    </div>
  );
};

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We could not fetch the required information. Please try again.',
  onRetry,
}) => {
  return (
    <div className="p-8 text-center rounded-2xl bg-rose-50 border border-rose-200 max-w-lg mx-auto my-6">
      <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
      <h3 className="text-base font-bold text-deep-navy-900">{title}</h3>
      <p className="text-xs text-rose-700 mt-1 mb-5">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          Try Again
        </Button>
      )}
    </div>
  );
};

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 text-center flex items-center justify-center">
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />
        <div className="inline-block w-full max-w-md p-6 my-8 text-left bg-white border border-slate-200 shadow-2xl rounded-2xl relative z-10">
          <h3 className="text-base font-bold text-deep-navy-900">{title}</h3>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">{description}</p>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" size="sm" onClick={onClose}>
              {cancelText}
            </Button>
            <Button
              variant={isDangerous ? 'danger' : 'primary'}
              size="sm"
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
