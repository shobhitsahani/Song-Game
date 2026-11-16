'use client';

import React, { useState, useEffect } from 'react';
import { calculatePoints } from '@song-game/shared';
import { Container } from '@/components/ui/container';

export function ScoringDemo() {
  const [guessTime, setGuessTime] = useState(1.8);
  const [isInteracting, setIsInteracting] = useState(false);

  // Autoplay gentle hint until user interacts
  useEffect(() => {
    if (isInteracting) return;
    const interval = setInterval(() => {
      setGuessTime((prev) => {
        const next = prev >= 8 ? 1.5 : prev + 1.2;
        return Number(next.toFixed(1));
      });
    }, 2400);

    return () => clearInterval(interval);
  }, [isInteracting]);

  // Real points from game formula
  const points = calculatePoints(guessTime, 15);

  // SVG coordinate conversions
  // X: 50px (0s) to 450px (15s) => width = 400px
  // Y: 190px (0 pts) to 40px (1000 pts) => height = 150px
  const getX = (t: number) => 50 + (t / 15) * 400;
  const getY = (pts: number) => 190 - (pts / 1000) * 150;

  const currentX = getX(guessTime);
  const currentY = getY(points);

  return (
    <section className="relative landing-section scroll-mt-[88px]">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column (5 of 12) - Aligned to top */}
          <div className="lg:col-span-5 text-left flex flex-col justify-between">
            <div className="landing-heading-group">
              <h2 className="landing-h2">
                Faster answers score more
              </h2>
              <p className="landing-subline">
                Speed is your primary multiplier. Every player hears the same 15-second snippet, but the quickest ears take maximum points.
              </p>
            </div>

            <p className="text-[15px] sm:text-[16px] text-[var(--muted-foreground)] leading-relaxed">
              Answers locked within three seconds earn the full 1,000-point ceiling before instinct tiers step down.
            </p>

            {/* 3-column definition row: hairlines only, no boxes, values never wrap */}
            <div className="grid grid-cols-3 divide-x divide-[var(--border)] border-y border-[var(--border)] py-4 mt-8">
              <div className="pr-4">
                <span className="text-[28px] sm:text-[32px] font-bold font-sans text-[var(--foreground)] tabular-nums whitespace-nowrap block">
                  1,000
                </span>
                <span className="text-[13px] text-[var(--muted-foreground)] whitespace-nowrap block mt-1">
                  under 3s
                </span>
              </div>
              <div className="px-4">
                <span className="text-[28px] sm:text-[32px] font-bold font-sans text-[var(--foreground)] tabular-nums whitespace-nowrap block">
                  700
                </span>
                <span className="text-[13px] text-[var(--muted-foreground)] whitespace-nowrap block mt-1">
                  under 6s
                </span>
              </div>
              <div className="pl-4">
                <span className="text-[28px] sm:text-[32px] font-bold font-sans text-[var(--foreground)] tabular-nums whitespace-nowrap block">
                  500
                </span>
                <span className="text-[13px] text-[var(--muted-foreground)] whitespace-nowrap block mt-1">
                  under 15s
                </span>
              </div>
            </div>
          </div>

          {/* Right Column (7 of 12): Interactive SVG curve + Draggable scrubber */}
          <div className="lg:col-span-7">
            <div className="rounded-[var(--radius-card)] bg-[var(--surface-1)] border border-[var(--border)] p-6 sm:p-7 shadow-xs">
              {/* Live readout header */}
              <div className="flex items-baseline justify-between gap-3 mb-6 pb-4 border-b border-[var(--border)]">
                <div>
                  <span className="text-[13px] text-[var(--muted-foreground)] block">
                    Simulated outcome
                  </span>
                  <span className="text-[24px] font-bold font-sans text-[var(--foreground)] tabular-nums">
                    {points.toLocaleString()}{' '}
                    <span className="text-[14px] font-normal text-[var(--muted-foreground)]">points</span>
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[13px] text-[var(--muted-foreground)] block">
                    Response time
                  </span>
                  <span className="text-[28px] sm:text-[32px] font-bold font-mono text-[var(--primary)] tabular-nums">
                    {guessTime.toFixed(1)}s
                  </span>
                </div>
              </div>

              {/* Accessible live region for screen readers */}
              <div className="sr-only" aria-live="polite">
                {guessTime.toFixed(1)} seconds, {points} points
              </div>

              {/* SVG Graph */}
              <div className="relative w-full aspect-[500/220] select-none">
                <svg viewBox="0 0 500 220" className="w-full h-full overflow-visible" aria-hidden="true">
                  {/* Horizontal Grid lines */}
                  <line x1="50" y1="40" x2="450" y2="40" stroke="var(--border)" strokeDasharray="3 3" />
                  <text x="40" y="44" fill="var(--muted-foreground)" fontSize="12" textAnchor="end" fontFamily="var(--font-sans)">1,000</text>

                  <line x1="50" y1="85" x2="450" y2="85" stroke="var(--border)" strokeDasharray="3 3" />
                  <text x="40" y="89" fill="var(--muted-foreground)" fontSize="12" textAnchor="end" fontFamily="var(--font-sans)">700</text>

                  <line x1="50" y1="115" x2="450" y2="115" stroke="var(--border)" strokeDasharray="3 3" />
                  <text x="40" y="119" fill="var(--muted-foreground)" fontSize="12" textAnchor="end" fontFamily="var(--font-sans)">500</text>

                  <line x1="50" y1="190" x2="450" y2="190" stroke="var(--border)" />
                  <text x="40" y="194" fill="var(--muted-foreground)" fontSize="12" textAnchor="end" fontFamily="var(--font-sans)">0</text>

                  {/* Vertical time markers */}
                  <text x="50" y="210" fill="var(--muted-foreground)" fontSize="12" textAnchor="middle" fontFamily="var(--font-sans)">0s</text>
                  <text x={getX(3)} y="210" fill="var(--muted-foreground)" fontSize="12" textAnchor="middle" fontFamily="var(--font-sans)">3s</text>
                  <text x={getX(6)} y="210" fill="var(--muted-foreground)" fontSize="12" textAnchor="middle" fontFamily="var(--font-sans)">6s</text>
                  <text x="450" y="210" fill="var(--muted-foreground)" fontSize="12" textAnchor="middle" fontFamily="var(--font-sans)">15s</text>

                  {/* Stepped Score Curve */}
                  <path
                    d={`
                      M 50 ${getY(1000)}
                      L ${getX(3)} ${getY(1000)}
                      L ${getX(3)} ${getY(700)}
                      L ${getX(6)} ${getY(700)}
                      L ${getX(6)} ${getY(500)}
                      L 450 ${getY(500)}
                    `}
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  {/* Shaded Area Under Curve */}
                  <path
                    d={`
                      M 50 ${getY(1000)}
                      L ${getX(3)} ${getY(1000)}
                      L ${getX(3)} ${getY(700)}
                      L ${getX(6)} ${getY(700)}
                      L ${getX(6)} ${getY(500)}
                      L 450 ${getY(500)}
                      L 450 190
                      L 50 190
                      Z
                    `}
                    fill="var(--primary)"
                    fillOpacity="0.08"
                  />

                  {/* Current Time Indicator vertical line */}
                  <line
                    x1={currentX}
                    y1="30"
                    x2={currentX}
                    y2="190"
                    stroke="var(--foreground)"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                  />

                  {/* Current Dot */}
                  <circle
                    cx={currentX}
                    cy={currentY}
                    r="7"
                    fill="var(--primary)"
                    stroke="var(--surface-1)"
                    strokeWidth="2.5"
                    className="transition-all duration-100"
                  />
                </svg>
              </div>

              {/* Interactive Timeline Scrubber Slider */}
              <div className="mt-6 pt-4 border-t border-[var(--border)]">
                <div className="flex items-center justify-between text-[13px] text-[var(--muted-foreground)] mb-2.5">
                  <label htmlFor="scoring-slider" className="font-medium text-[var(--foreground)]">
                    Drag to test response time
                  </label>
                  <span className="font-bold text-[var(--foreground)] font-mono tabular-nums">
                    {guessTime.toFixed(1)}s
                  </span>
                </div>
                <input
                  id="scoring-slider"
                  type="range"
                  min="0.1"
                  max="15"
                  step="0.1"
                  value={guessTime}
                  aria-valuemin={0.1}
                  aria-valuemax={15}
                  aria-valuenow={guessTime}
                  aria-valuetext={`${guessTime.toFixed(1)} seconds, ${points} points`}
                  onChange={(e) => {
                    setIsInteracting(true);
                    setGuessTime(parseFloat(e.target.value));
                  }}
                  className="w-full accent-[var(--primary)] h-2 rounded-lg bg-[var(--surface-2)] cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                  aria-label="Simulated answer time scrubber"
                />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
