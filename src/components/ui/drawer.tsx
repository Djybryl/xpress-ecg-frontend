import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  position?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  position = 'right',
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className,
}: DrawerProps) {
  // Close on escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when drawer is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const sizeClasses = {
    sm: 'w-80',
    md: 'w-96',
    lg: 'w-[480px]',
    xl: 'w-[600px]',
  };

  const positionClasses = {
    left: 'left-0',
    right: 'right-0',
  };

  const animationClasses = {
    left: isOpen ? 'translate-x-0' : '-translate-x-full',
    right: isOpen ? 'translate-x-0' : 'translate-x-full',
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={closeOnOverlayClick ? onClose : undefined}
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed top-0 bottom-0 z-50 bg-white dark:bg-gray-900 shadow-2xl transition-transform duration-300 ease-in-out flex flex-col',
          sizeClasses[size],
          positionClasses[position],
          animationClasses[position],
          className
        )}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between p-4 border-b dark:border-gray-700 flex-shrink-0">
            <div>
              {title && (
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </>
  );
}

