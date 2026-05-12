import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  href?: string;
  variant?: 'default' | 'futuristic';
}

export default function Logo({ size = 'md', className, href = '/', variant = 'default' }: LogoProps) {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  if (variant === 'futuristic') {
    const boxSize = size === 'sm' ? 'w-6 h-6' : size === 'md' ? 'w-8 h-8' : 'w-12 h-12';
    const textSize = size === 'sm' ? 'text-sm' : size === 'md' ? 'text-lg' : 'text-2xl';
    const initialsSize = size === 'sm' ? 'text-[8px]' : size === 'md' ? 'text-xs' : 'text-base';

    return (
      <Link href={href} className={cn('flex items-center gap-2 font-bold group', className)}>
        <div className={cn(
          boxSize,
          'rounded-lg flex items-center justify-center text-primary font-bold transition-all duration-300 group-hover:scale-110 group-hover:rotate-6',
          'bg-white border border-primary shadow-sm'
        )}>
          <span className={initialsSize}>CM</span>
        </div>
        <span className={cn(textSize, 'uppercase tracking-[0.2em] text-primary')}>
          Career<span className="text-gray-900">Mate</span>
        </span>
      </Link>
    );
  }

  return (
    <Link href={href} className={cn('font-bold', sizeClasses[size], className)}>
      <span className="bg-linear-to-r from-green-700 to-green-500 bg-clip-text text-transparent">
        Career
      </span>
      <span className="text-gray-900">Mate</span>
    </Link>
  );
}
