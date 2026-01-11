type Input = {
  onChange: (val: string) => void;
  placeholder?: string;
  value?: string;
  error?: boolean;
};
const Input = ({ onChange, value, placeholder = 'Введите...', error }: Input) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };
  
  return (
    <input
      type="text"
      className="w-full px-4 py-2 min-h-[44px] rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
      style={{ borderColor: error ? 'red' : '' }}
      value={value}
      placeholder={placeholder}
      onChange={handleChange}
    />
  );
};

export default Input;
