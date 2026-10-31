import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  position?: 'left' | 'right';
  maxWidth?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  position = 'right',
  maxWidth = 'max-w-md',
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className={`fixed inset-y-0 ${position === 'right' ? 'right-0 pl-10' : 'left-0 pr-10'} max-w-full flex`}>
        <div className={`w-screen ${maxWidth} bg-white border-l border-slate-200 shadow-2xl flex flex-col`}>
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            {title && <h3 className="font-extrabold text-base text-slate-950">{title}</h3>}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-950 hover:bg-slate-100 transition-colors ml-auto cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
