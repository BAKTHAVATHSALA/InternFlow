import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../utils/cn';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

const Modal = ({
  open,
  onClose,
  title,
  children,
  className,
  panelClassName,
  showClose = true,
}) => {
  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4',
        className
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          'relative bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl',
          'max-h-[92vh] overflow-y-auto',
          'p-5 sm:p-6 safe-padding-x',
          panelClassName
        )}
      >
        {(title || showClose) && (
          <div className="flex items-start justify-between gap-3 mb-4">
            {title && (
              <h3 id="modal-title" className="text-sm font-bold text-slate-900 pr-2">
                {title}
              </h3>
            )}
            {showClose && (
              <button
                type="button"
                onClick={onClose}
                className="tap-target p-2 -mr-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 shrink-0"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export default Modal;
