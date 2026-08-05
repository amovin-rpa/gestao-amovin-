// src/components/ui/Input.tsx

import { ChangeEvent, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  mask?: (value: string) => string;
  onMaskedChange?: (value: string) => void;
}

export const Input = ({
  label,
  error,
  mask,
  onMaskedChange,
  onChange,
  className = '',
  ...props
}: InputProps) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (mask) {
      value = mask(value);
      e.target.value = value;
    }
    if (onMaskedChange) {
      onMaskedChange(value);
    }
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-4 py-2.5 bg-white border rounded-lg
          text-sm text-[#1A1A1A]
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-[#C65A11]/30 focus:border-[#C65A11]
          ${error ? 'border-red-500 focus:ring-red-500/30' : 'border-gray-300'}
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${className}
        `}
        onChange={handleChange}
        {...props}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};
