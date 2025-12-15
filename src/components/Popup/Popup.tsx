import Portal from '../Portal/Portal';

type Popup = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
};

const Popup = ({ isOpen, onClose, children, title = 'Модальное окно' }: Popup) => {
  const handleBackdropClick = <T extends HTMLElement>(e: React.MouseEvent<T>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }
  return (
    <Portal>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-2  bg-black/10 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleBackdropClick}
      >
        <div
          className="absolute bottom-[0px] min-w-[100%] bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-500">{title}</h2>

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
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    </Portal>
  );
};

export default Popup;
