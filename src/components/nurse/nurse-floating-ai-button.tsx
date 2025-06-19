'use client';

import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingAIButtonProps {
  onClick: () => void;
  className?: string;
}

export function FloatingAIButton({
  onClick,
  className = '',
}: FloatingAIButtonProps) {
  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-14 h-14',
    large: 'w-16 h-16'
  };

  return (
    <div className={cn('fixed bottom-6 right-6 z-50', className)}>
      {/* Glow container */}
      <div className='relative inline-flex group items-center justify-center'>
        {/* Glow effect */}
        <div className='absolute -inset-0.5 bg-gradient-to-br from-emerald-300 via-cyan-300 to-sky-300 rounded-full blur-sm group-hover:opacity-100 group-hover:-inset-1.5 group-hover:blur-md transition-all duration-300 animate-tilt'></div>
        
        {/* Button */}
        <Button
          onClick={onClick}
          className={'w-12 h-12 sm:w-14 sm:h-14 relative z-10 rounded-full bg-gradient-to-br from-emerald-600 via-cyan-600 to-cyan-800 hover:opacity-80 shadow-lg hover:shadow-xl transition-all duration-300 border-0'}
        >
          <MessageCircle className='w-6 h-6 text-white' />
        </Button>
      </div>
    </div>
  );
}
