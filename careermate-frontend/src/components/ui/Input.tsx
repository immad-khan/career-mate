import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  labelClassName?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, labelClassName, error, helperText, leftIcon, rightIcon, rightElement, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className={cn("block text-sm font-medium text-gray-700 mb-1", labelClassName)}>
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full px-4 py-2.5 rounded-lg border transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent',
              'placeholder:text-gray-400',
              leftIcon && 'pl-10',
              (rightIcon || rightElement) && 'pr-10',
              error
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 hover:border-gray-400',
              className
            )}
            {...props}
          />
          {rightElement ? (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {rightElement}
            </div>
          ) : rightIcon ? (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
              {rightIcon}
            </div>
          ) : null}
        </div>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
