// src/components/ui/Button.tsx

import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

export const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
}: ButtonProps) => {
  const variants = {
    primary: 'bg-amovin-laranja hover:bg-[#A04A0E] text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    success: 'bg-amovin-verde hover:bg-[#388E3C] text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    outline: 'border-2 border-amovin-laranja text-amovin-laranja hover:bg-amovin-laranja hover:text-white',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        rounded-lg font-semibold transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-amovin-laranja focus:ring-offset-2
        ${className}
      `}
    >
      {children}
    </button>
  );
};
