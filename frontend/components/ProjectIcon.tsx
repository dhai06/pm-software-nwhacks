'use client';

import { Target } from 'lucide-react';

interface ProjectIconProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ProjectIcon({ size = 'md', className = '' }: ProjectIconProps) {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 28,
  };

  return (
    <div className={`${sizes[size]} rounded-lg bg-blue-500 flex items-center justify-center ${className}`}>
      <Target className="text-white" size={iconSizes[size]} />
    </div>
  );
}
