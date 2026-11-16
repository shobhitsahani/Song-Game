'use client';

import React from 'react';
import { motion } from 'motion/react';
import {
  HowRoundWorksTile1,
  HowRoundWorksTile2,
  HowRoundWorksTile3,
} from './how-round-works-stageshow';

export function HowRoundWorks() {
  return (
    <section className="relative py-16 sm:py-24 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section heading: left-aligned, h2 clamp(28px, 3vw, 40px), letter-spacing -0.02em, body font */}
      <div className="mb-10 text-left">
        <h2 className="text-[clamp(28px,3vw,40px)] font-bold tracking-[-0.02em] text-[var(--foreground)]">
          How a round works
        </h2>
        <p className="text-base sm:text-lg text-[var(--muted-foreground)] mt-2 max-w-xl">
          Three steps. Zero waiting. Every round is designed for fast instincts and live competition.
        </p>
      </div>

      {/* Horizontal strip of three real UI fragments */}
      <div
        tabIndex={0}
        role="region"
        aria-label="How a round works steps"
        className="flex md:grid md:grid-cols-3 gap-6 overflow-x-auto pb-4 md:pb-0 snap-x snap-mandatory scrollbar-hide focus:outline-none"
      >
        {/* Step 1: Hear the clip */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.24 }}
          className="min-w-[280px] sm:min-w-[320px] md:min-w-0 flex-1 snap-start flex flex-col justify-between card-surface p-6"
        >
          <HowRoundWorksTile1 />

          <div>
            <h3 className="text-xl font-semibold text-[var(--foreground)]">
              Hear the clip
            </h3>
            <p className="text-sm text-[var(--muted-foreground)] mt-1.5 leading-relaxed">
              A 15-second song snippet streams instantly to everyone in the room at once.
            </p>
          </div>
        </motion.div>

        {/* Step 2: Lock in your answer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.24, delay: 0.05 }}
          className="min-w-[280px] sm:min-w-[320px] md:min-w-0 flex-1 snap-start flex flex-col justify-between card-surface p-6"
        >
          <HowRoundWorksTile2 />

          <div>
            <h3 className="text-xl font-semibold text-[var(--foreground)]">
              Lock in your answer
            </h3>
            <p className="text-sm text-[var(--muted-foreground)] mt-1.5 leading-relaxed">
              Tap fast. Answers lock immediately with zero animation delay so every millisecond counts.
            </p>
          </div>
        </motion.div>

        {/* Step 3: Beat the room */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.24, delay: 0.1 }}
          className="min-w-[280px] sm:min-w-[320px] md:min-w-0 flex-1 snap-start flex flex-col justify-between card-surface p-6"
        >
          <HowRoundWorksTile3 />

          <div>
            <h3 className="text-xl font-semibold text-[var(--foreground)]">
              Beat the room
            </h3>
            <p className="text-sm text-[var(--muted-foreground)] mt-1.5 leading-relaxed">
              Scores calculate on exact response time. The fastest correct ears climb to the top of the room.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
