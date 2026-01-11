import React, { useState, useEffect, useRef } from 'react';

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value?: string | string[];
  placeholder?: string;
  onChange?: (value: string | string[]) => void;
  disabled?: boolean;
  multiple?: boolean;
  maxSelections?: number;
  truncatePlaceholder?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({ 
  options, 
  value, 
  placeholder = "Выберите...",
  onChange,
  disabled = false,
  multiple = false,
  maxSelections,
  truncatePlaceholder = true 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (dropdownRef.current && truncatePlaceholder) {
      const updateWidth = () => {
        setContainerWidth(dropdownRef.current?.offsetWidth || 0);
      };
      
      updateWidth();
      window.addEventListener('resize', updateWidth);
      
      return () => window.removeEventListener('resize', updateWidth);
    }
  }, [truncatePlaceholder]);

  const getSelectedValues = (): string[] => {
    if (multiple) {
      if (Array.isArray(value)) {
        return value;
      }
      return value ? [value] : [];
    } else {
      if (Array.isArray(value)) {
        return value.length > 0 ? [value[0]] : [];
      }
      return value ? [value] : [];
    }
  };

  const selectedValues = getSelectedValues();

  const isSelected = (optionValue: string) => {
    return selectedValues.includes(optionValue);
  };

  const truncateText = (text: string, maxWidth: number = 0): string => {
    if (!truncatePlaceholder || maxWidth === 0) return text;
    
    const approxCharWidth = 8; 
    const availableWidth = maxWidth - 100; 
    const maxChars = Math.floor(availableWidth / approxCharWidth);
    
    if (text.length > maxChars && maxChars > 10) {
      return text.substring(0, maxChars - 3) + '...';
    }
    
    return text;
  };

  const getButtonText = (): { displayText: string; fullText: string } => {
    if (multiple) {
      if (selectedValues.length === 0) {
        const displayText = truncateText(placeholder, containerWidth);
        return { displayText, fullText: placeholder };
      }
      
      if (selectedValues.length === 1) {
        const option = options.find(opt => opt.value === selectedValues[0]);
        const text = option?.label || placeholder;
        const displayText = truncateText(text, containerWidth);
        return { displayText, fullText: text };
      }
      
      const text = `Выбрано: ${selectedValues.length}`;
      const displayText = truncateText(text, containerWidth);
      return { displayText, fullText: text };
    } else {
      const option = options.find(opt => opt.value === selectedValues[0]);
      const text = option?.label || placeholder;
      const displayText = truncateText(text, containerWidth);
      return { displayText, fullText: text };
    }
  };

  const { displayText, fullText } = getButtonText();

  const handleSelect = (option: DropdownOption) => {
    if (disabled) return;

    if (multiple) {
      let newSelectedValues: string[];
      
      if (isSelected(option.value)) {
        newSelectedValues = selectedValues.filter(v => v !== option.value);
      } else {
        if (maxSelections && selectedValues.length >= maxSelections) {
          return;
        }
        newSelectedValues = [...selectedValues, option.value];
      }
      
      onChange?.(newSelectedValues);
    } else {
      onChange?.(option.value);
      setIsOpen(false);
    }
  };

  const removeValue = (valueToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!multiple) return;
    
    const newValues = selectedValues.filter(v => v !== valueToRemove);
    onChange?.(newValues);
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!multiple) return;
    
    onChange?.([]);
  };

  const filteredOptions = options

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
     
    }
  };

  const renderMultiSelected = () => {
    if (!multiple || selectedValues.length === 0) {
      return (
        <span className={`truncate ${selectedValues.length > 0 ? 'text-gray-800' : 'text-gray-500'}`}>
          {displayText}
          {displayText !== fullText && (
            <span className="hidden sm:inline"> — {fullText}</span>
          )}
        </span>
      );
    }

    return (
      <>
        {selectedValues.slice(0, 2).map(value => {
          const option = options.find(opt => opt.value === value);
          if (!option) return null;
          
          const truncatedLabel = truncateText(option.label, 100);
          return (
            <div 
              key={value}
              className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm flex-shrink-0"
              title={option.label}
            >
              <span className="truncate max-w-[80px]">{truncatedLabel}</span>
              <button
                type="button"
                onClick={(e) => removeValue(value, e)}
                className="hover:text-blue-900 flex-shrink-0"
              >
                ×
              </button>
            </div>
          );
        })}
        {selectedValues.length > 2 && (
          <span 
            className="text-blue-600 text-sm ml-1 flex-shrink-0"
            title={selectedValues.slice(2).map(v => 
              options.find(o => o.value === v)?.label
            ).filter(Boolean).join(', ')}
          >
            +{selectedValues.length - 2}
          </span>
        )}
      </>
    );
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div
        onClick={toggleDropdown}
        className={`
          w-full 
          min-h-[44px]
          px-4 py-2
          text-left 
          bg-white 
          border-2 
          rounded-lg 
          flex items-center justify-between
          transition-all
          active:scale-[0.98]
          group
          ${disabled 
            ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed' 
            : isOpen 
              ? 'border-blue-500 ring-2 ring-blue-200' 
              : 'border-gray-300 hover:border-blue-400'
          }
        `}
        title={fullText} 
      >
        <div className="flex flex-wrap items-center gap-1 flex-1 min-w-0 overflow-hidden">
          <span 
            ref={textRef}
            className={`
              truncate
              ${selectedValues.length > 0 ? 'text-gray-800' : 'text-gray-500'}
              ${!truncatePlaceholder ? 'whitespace-nowrap' : ''}
            `}
          >
            {renderMultiSelected()}
          </span>
        </div>
        
        <div className="flex items-center gap-2 ml-2 flex-shrink-0">
          {multiple && selectedValues.length > 0 && (
            <div
              onClick={clearAll}
              className="
                text-gray-400 
                hover:text-gray-600 
                p-1 
                rounded 
                hover:bg-gray-100
                transition-colors
              "
              title="Очистить все"
            >
              ×
            </div>
          )}
          
          <svg 
            className={`
              w-5 h-5 
              text-gray-400 
              transition-transform 
              flex-shrink-0
              ${isOpen ? 'rotate-180' : ''}
            `}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="
          absolute 
          z-50 
          w-full 
          mt-1 
          bg-white 
          border 
          border-gray-200 
          rounded-lg 
          shadow-lg 
          overflow-hidden
          max-h-60 
          overflow-y-auto
        ">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => {
              const selected = isSelected(option.value);
              return (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option)}
                  className={`
                    px-4 py-3 
                    cursor-pointer 
                    transition-colors
                    flex items-center gap-3
                    active:bg-gray-100
                    hover:bg-gray-50
                    min-h-[44px]
                    ${selected ? 'bg-blue-50 text-blue-600' : 'text-gray-800'}
                  `}
                  title={option.label}
                >
                  {multiple && (
                    <div className={`
                      w-5 h-5 
                      border-2 
                      rounded 
                      flex items-center justify-center
                      flex-shrink-0
                      ${selected 
                        ? 'bg-blue-500 border-blue-500' 
                        : 'border-gray-300'
                      }
                    `}>
                      {selected && (
                        <svg 
                          className="w-3 h-3 text-white" 
                          viewBox="0 0 20 20" 
                          fill="currentColor"
                        >
                          <path 
                            fillRule="evenodd" 
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                            clipRule="evenodd" 
                          />
                        </svg>
                      )}
                    </div>
                  )}
                  <span className="flex-1 truncate">{option.label}</span>
                  {!multiple && selected && (
                    <svg 
                      className="w-5 h-5 text-blue-500 flex-shrink-0" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  )}
                </div>
              );
            })
          ) : (
            <div className="px-4 py-3 text-gray-500 text-center min-h-[44px] flex items-center justify-center">
              Ничего не найдено
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dropdown;