'use client';

import React, { useState, useEffect } from 'react';

interface SimpleNumberInputProps {
  label: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  placeholder?: string;
  required?: boolean;
  min?: number;
  max?: number;
  error?: string;
  helperText?: string;
}

/**
 * Simple, controlled number input that preserves exact values
 * No complex transformations or automatic conversions
 */
export const SimpleNumberInput = ({
  label,
  value,
  onChange,
  placeholder = '',
  required = false,
  min,
  max,
  error,
  helperText,
}: SimpleNumberInputProps) => {
  const [inputValue, setInputValue] = useState<string>(
    value !== undefined && value !== null ? String(value) : ''
  );

  // Only update input when external value changes (for edit mode population)
  useEffect(() => {
    if (value !== undefined && value !== null) {
      setInputValue(String(value));
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    setInputValue(rawValue);

    // Parse and validate
    if (rawValue === '' || rawValue === '-') {
      onChange(undefined);
      return;
    }

    const numValue = Number(rawValue);

    // Validate min/max
    if (min !== undefined && numValue < min) {
      return; // Don't update if below min
    }
    if (max !== undefined && numValue > max) {
      return; // Don't update if above max
    }

    if (!isNaN(numValue)) {
      onChange(numValue);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="number"
        value={inputValue}
        onChange={handleChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={placeholder}
        min={min}
        max={max}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      {!error && helperText && <p className="text-gray-500 text-xs mt-1">{helperText}</p>}
    </div>
  );
};

