import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
};

export default function Modal({ open, onClose, title, description, children, footer, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className={`relative z-10 w-full ${sizeMap[size]} animate-scale-in`}>
        <div className="card max-h-[90vh] overflow-y-auto">
          <div className="flex items-start justify-between border-b border-gray-100 p-5">
            <div>
              <h2 className="font-display text-lg font-bold text-gray-900">{title}</h2>
              {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
            </div>
            <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-5">{children}</div>
          {footer && <div className="flex justify-end gap-3 border-t border-gray-100 p-5">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
