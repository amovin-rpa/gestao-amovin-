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
    <div className="space
