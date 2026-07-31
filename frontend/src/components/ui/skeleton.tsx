'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rect' | 'card';
}

function Skeleton({ className, variant = 'text', ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-secondary',
        variant === 'circular' && 'rounded-full',
        variant === 'text' && 'h-4 w-full',
        variant === 'card' && 'h-48 w-full rounded-xl',
        variant === 'rect' && 'h-24 w-full rounded-lg',
        className,
      )}
      {...props}
    />
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" className="h-12 w-12" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="w-3/4" />
          <Skeleton variant="text" className="w-1/2" />
        </div>
      </div>
      <Skeleton variant="rect" className="mt-4" />
      <div className="mt-4 flex gap-2">
        <Skeleton variant="text" className="w-20" />
        <Skeleton variant="text" className="w-16" />
      </div>
    </div>
  );
}

function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton variant="circular" className="h-10 w-10" />
          <div className="flex-1 space-y-1.5">
            <Skeleton variant="text" className="w-2/3" />
            <Skeleton variant="text" className="w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="flex flex-col items-center space-y-4 p-6">
      <Skeleton variant="circular" className="h-24 w-24" />
      <Skeleton variant="text" className="w-1/2" />
      <Skeleton variant="text" className="w-1/3" />
      <Skeleton variant="rect" className="mt-2 h-2 w-full" />
    </div>
  );
}

function LeaderboardSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-lg bg-secondary/30 px-4 py-3"
        >
          <Skeleton variant="text" className="w-8" />
          <Skeleton variant="circular" className="h-10 w-10" />
          <div className="flex-1 space-y-1">
            <Skeleton variant="text" className="w-1/3" />
            <Skeleton variant="text" className="w-1/4" />
          </div>
          <Skeleton variant="text" className="w-16" />
        </div>
      ))}
    </div>
  );
}

export { Skeleton, CardSkeleton, ListSkeleton, ProfileSkeleton, LeaderboardSkeleton };
