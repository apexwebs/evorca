import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  position?: 'right' | 'bottom';
}

export function Drawer({ isOpen, onClose, title, children, position = 'right' }: DrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        className="absolute inset-0 bg-on-surface/20 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div 
        className={`absolute ${position === 'right' ? 'inset-y-0 right-0 max-w-md w-full' : 'bottom-0 inset-x-0 h-auto max-h-[90vh] rounded-t-3xl'} bg-surface-container-lowest shadow-2xl flex flex-col transform transition-transform animate-in ${position === 'right' ? 'slide-in-from-right' : 'slide-in-from-bottom'} duration-300`}
      >
        <div className="flex items-center justify-between p-6 border-b border-outline-variant/10">
          <h2 className="text-xl font-headline font-bold text-primary tracking-tight">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-container-low text-on-surface-variant transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
