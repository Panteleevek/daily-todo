import React, { useState } from 'react';

interface CheckboxProps {
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({ 
  label, 
  checked = false, 
  onChange,
  disabled = false 
}) => {
  const [isChecked, setIsChecked] = useState(checked);

  const handleChange = () => {
    if (disabled) return;
    
    const newValue = !isChecked;
    setIsChecked(newValue);
    onChange?.(newValue);
  };

  return (
    <div 
      className="flex items-center gap-3 p-2 active:bg-gray-100 rounded-lg touch-manipulation"
      onClick={handleChange}
    >
      <div className={`
        w-6 h-6 
        border-2 
        rounded 
        flex items-center justify-center
        transition-colors
        ${disabled 
          ? 'bg-gray-100 border-gray-300 cursor-not-allowed' 
          : isChecked 
            ? 'bg-blue-500 border-blue-500' 
            : 'bg-white border-gray-400 hover:border-blue-500'
        }
      `}>
        {isChecked && (
          <svg 
            className="w-4 h-4 text-white" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      
      <span className={`
        text-base
        ${disabled ? 'text-gray-400' : 'text-gray-800'}
        select-none
      `}>
        {label}
      </span>
    </div>
  );
};

export default Checkbox;