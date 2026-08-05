// src/components/ui/Select.tsx

import { ChangeEvent, SelectHTMLAttributes } from 'react';

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Option[];
  placeholder?: string;
}

export const Select = ({
  label,
  error,
  options,
  placeholder,
  className = '',
  ...props
}: SelectProps) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
          {label}
        </label>
      )}
      <select
        className={`
          w-full px-4 py-2.5 bg-white border rounded-lg
          text-sm text-[#1A1A1A]
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-[#C65A11]/30 focus:border-[#C65A11]
          ${error ? 'border-red-500 focus:ring-red-500/30' : 'border-gray-300'}
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${className}
        `}
        {...props}
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};
