import React, { useEffect } from 'react';
import Portal from '../Portal/Portal';

type Modal = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  showCloseButton?: boolean;
  buttonText: string
  onClick: () => void;
};

const Modal = ({
  isOpen,
  onClose,
  children,
  title = 'Модальное окно',
  showCloseButton = true,
  buttonText = 'Принять',
  onClick,
}: Modal) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = <T extends HTMLElement>(e: React.MouseEvent<T>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <div
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300 "
        onClick={handleBackdropClick}
      >
        <div
          className="relative bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-500">{title}</h2>
            {showCloseButton && (
                <svg
                  className="w-5 h-5 text-gray-300 cursor-pointer"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                    onClick={onClose}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
            )}
          </div>
          <div className="p-6">{children}</div>
          <div className="flex justify-center gap-3 p-3 border-t border-gray-200">
            <div
              onClick={onClick}
              className="w-[100%] px-5 text-sm h-[42px] flex justify-center items-center font-medium text-white bg-blue-500 rounded-lg "
            >
              {buttonText}
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default Modal;
