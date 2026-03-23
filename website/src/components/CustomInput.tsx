'use client';

import React, { forwardRef } from 'react';

interface CustomInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  icon?: React.ReactNode;
  error?: string;
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
}

export const CustomInput = forwardRef<HTMLInputElement | HTMLTextAreaElement, CustomInputProps>(
  ({ label, placeholder, value, onChange, type = 'text', icon, error, disabled, multiline, rows }, ref) => {
    const inputStyles = `
      w-full px-4 py-3 rounded-lg border bg-white text-text-primary
      placeholder:text-text-tertiary transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
      disabled:bg-gray-100 disabled:cursor-not-allowed
      ${error ? 'border-error' : 'border-card-border'}
    `;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-text-secondary mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
              {icon}
            </div>
          )}
          {multiline ? (
            <textarea
              ref={ref as React.Ref<HTMLTextAreaElement>}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              disabled={disabled}
              rows={rows || 3}
              className={`${inputStyles} ${icon ? 'pl-10' : ''} resize-none`}
            />
          ) : (
            <input
              ref={ref as React.Ref<HTMLInputElement>}
              type={type}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              disabled={disabled}
              className={`${inputStyles} ${icon ? 'pl-10' : ''}`}
            />
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-error">{error}</p>
        )}
      </div>
    );
  }
);

CustomInput.displayName = 'CustomInput';
