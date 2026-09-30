'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { AudioLines } from 'lucide-react';
import { cn } from '@/lib/utils';

type LogoSize = 'sm' | 'md' | 'lg' | 'xl';

const sizeStyles: Record<LogoSize, { box: string; icon: string; text: string }> = {
  sm: { box: 'w-9 h-9 rounded-xl', icon: 'w-4 h-4', text: 'text-lg' },
  md: { box: 'w-11 h-11 rounded-2xl', icon: 'w-5 h-5', text: 'text-xl' },
  lg: { box: 'w-14 h-14 rounded-2xl', icon: 'w-7 h-7', text: 'text-2xl' },
  xl: { box: 'w-16 h-16 rounded-[1.25rem]', icon: 'w-8 h-8', text: 'text-2xl' },
};

interface LogoProps {
  href?: string | null;
  size?: LogoSize;
  showWordmark?: boolean;
  glow?: boolean;
  className?: string;
}

export function Logo({ href = '/', size = 'md', showWordmark = true, glow = false, className }: LogoProps) {
  const s = sizeStyles[size];

  const mark = (
    <motion.span
      aria-hidden="true"
      whileHover={{ rotate: -6, scale: 1.06 }}
      transition={{ type: 'spring', stiffness: 320, damping: 16 }}
      className={cn(
        'inline-flex shrink-0 items-center justify-center',
        'bg-[linear-gradient(120deg,hsl(262_84%_66%),hsl(292_84%_61%)_50%,hsl(217_91%_60%))]',
        'shadow-lg shadow-violet-600/30',
        s.box,
        glow && 'ring-1 ring-violet-500/60 shadow-[0_0_36px_rgba(139,92,246,0.35)]',
      )}
    >
      <AudioLines className={cn('text-white drop-shadow-sm', s.icon)} />
    </motion.span>
  );

  const content = (
    <span className={cn('group inline-flex items-center gap-2.5', className)}>
      {mark}
      {showWordmark && (
        <span
          className={cn(
            'font-display font-bold tracking-tight bg-clip-text text-transparent',
            'bg-[linear-gradient(100deg,#c7d2fe,#d8b4fe_55%,#f0abfc)]',
            s.text,
          )}
        >
          SongGame
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link href={href} aria-label="SongGame — back to home" className="inline-flex items-center">
        {content}
      </Link>
    );
  }
  return <span className="inline-flex items-center">{content}</span>;
}
