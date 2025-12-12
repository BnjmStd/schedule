/**
 * ⌨️ Componente Input - Sistema de Horarios
 * 
 * Input reutilizable para formularios
 * Diseño pastel limpio
 */

import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            {label}
            {props.required && <span className="text-danger-500 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-3 py-2 rounded-lg border',
            'bg-white text-neutral-900 placeholder:text-neutral-400',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400',
            error 
              ? 'border-danger-300 focus:ring-danger-200 focus:border-danger-400' 
              : 'border-neutral-300',
            'disabled:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-danger-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-neutral-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
