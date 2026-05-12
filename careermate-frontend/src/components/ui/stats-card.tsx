import React from 'react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'purple' | 'blue' | 'green' | 'orange' | 'red';
  className?: string;
}

export default function StatsCard({
  title,
  value,
  icon,
  trend,
  color = 'purple',
  className,
}: StatsCardProps) {
  const colorClasses = {
    purple: 'bg-primary shadow-sm',
    blue: 'bg-primary shadow-sm',
    green: 'bg-primary shadow-sm',
    orange: 'bg-primary shadow-sm',
    red: 'bg-primary shadow-sm',
  };

  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-300',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p
              className={cn(
                'mt-2 text-sm font-medium',
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              )}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%{' '}
              <span className="text-gray-500 font-normal">vs last month</span>
            </p>
          )}
        </div>
        <div
          className={cn(
            'p-3 rounded-xl text-white',
            colorClasses[color]
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
