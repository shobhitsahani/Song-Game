'use client';

import React from 'react';
import { Container } from '@/components/ui/container';
import {
  HowRoundWorksTile1,
  HowRoundWorksTile2,
  HowRoundWorksTile3,
} from './how-round-works-stageshow';

export function HowRoundWorks() {
  return (
    <section id="how" className="relative landing-section scroll-mt-[88px]">
      <Container>
        {/* Section heading: Fraunces display font, quiet editorial subtitle */}
        <div className="landing-heading-group">
          <h2 className="landing-h2">
            How a round works
          </h2>
          <p className="landing-subline">
            Ten clips per room. Three steps per track.
          </p>
        </div>

      {/* 3 columns joined by a clean top border */}
      <div
        tabIndex={0}
        role="region"
        aria-label="How a round works steps"
        className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 border-t border-[var(--border)] pt-10 focus:outline-none"
      >
        {/* Step 1: Hear the clip */}
        <div className="flex flex-col gap-3.5">
          <div className="flex items-baseline gap-3">
            <span className="text-3xl sm:text-4xl font-display font-medium text-[var(--muted-foreground)]">
              1
            </span>
            <h3 className="text-xl font-semibold text-[var(--foreground)]">
              Hear the clip
            </h3>
          </div>
          <p className="text-sm text-[var(--muted-foreground)] leading-relaxed min-h-[40px]">
            A 15-second snippet streams to everyone in the room at the same moment.
          </p>
          <div className="mt-2 w-full rounded-[var(--radius-card)] overflow-hidden border border-[var(--border)] bg-[var(--surface-1)] shadow-sm">
            <HowRoundWorksTile1 />
          </div>
        </div>

        {/* Step 2: Lock in your answer */}
        <div className="flex flex-col gap-3.5">
          <div className="flex items-baseline gap-3">
            <span className="text-3xl sm:text-4xl font-display font-medium text-[var(--muted-foreground)]">
              2
            </span>
            <h3 className="text-xl font-semibold text-[var(--foreground)]">
              Lock in your answer
            </h3>
          </div>
          <p className="text-sm text-[var(--muted-foreground)] leading-relaxed min-h-[40px]">
            Four choices. Tap your guess before the timer runs out. Faster answers score higher.
          </p>
          <div className="mt-2 w-full rounded-[var(--radius-card)] overflow-hidden border border-[var(--border)] bg-[var(--surface-1)] shadow-sm">
            <HowRoundWorksTile2 />
          </div>
        </div>

        {/* Step 3: Beat the room */}
        <div className="flex flex-col gap-3.5">
          <div className="flex items-baseline gap-3">
            <span className="text-3xl sm:text-4xl font-display font-medium text-[var(--muted-foreground)]">
              3
            </span>
            <h3 className="text-xl font-semibold text-[var(--foreground)]">
              Beat the room
            </h3>
          </div>
          <p className="text-sm text-[var(--muted-foreground)] leading-relaxed min-h-[40px]">
            Scores calculate on accuracy and speed. Standings update immediately after each track.
          </p>
          <div className="mt-2 w-full rounded-[var(--radius-card)] overflow-hidden border border-[var(--border)] bg-[var(--surface-1)] shadow-sm">
            <HowRoundWorksTile3 />
          </div>
        </div>
      </div>
      </Container>
    </section>
  );
}