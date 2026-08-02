import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Install: npm install clsx tailwind-merge
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Format date time
export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Get error message from API response
export function getErrorMessage(error: any): string {
  if (error.response?.data?.errors) {
    const errors = error.response.data.errors;
    if (typeof errors === 'object' && errors !== null) {
      const keys = Object.keys(errors);
      if (keys.length > 0) {
        const firstKey = keys[0];
        const firstVal = errors[firstKey];
        if (Array.isArray(firstVal) && firstVal.length > 0) {
          return firstVal[0];
        } else if (typeof firstVal === 'string') {
          return firstVal;
        } else if (firstVal && typeof firstVal === 'object') {
          const subKeys = Object.keys(firstVal);
          if (subKeys.length > 0) {
            const subVal = (firstVal as any)[subKeys[0]];
            if (Array.isArray(subVal) && subVal.length > 0) {
              return subVal[0];
            } else if (typeof subVal === 'string') {
              return subVal;
            }
          }
        }
      }
    } else if (typeof errors === 'string') {
      return errors;
    }
  }
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

// Get initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Validate email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
