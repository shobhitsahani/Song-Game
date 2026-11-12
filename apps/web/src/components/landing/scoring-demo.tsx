'use client';

import React, { useState, useEffect } from 'react';
import { Lightning, Clock, Trophy } from '@phosphor-icons/react';
import { calculatePoints } from '@song-game/shared';

export function ScoringDemo() {
  const [guessTime, setGuessTime] = useState(3.2);
  const [isInteracting, setIsInteracting] = useState(false);

  // Autoplay gentle breathing hint until user interacts
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

  const getTierLabel = (time: number) => {
    if (time <= 3) return { name: 'Blitz Bonus', color: 'text-amber-400 bg-amber-400/10 border-amber-400/30' };
    if (time <= 6) return { name: 'Fast Instinct', color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30' };
    if (time <= 15) return { name: 'Standard Clear', color: 'text-zinc-300 bg-zinc-800 border-zinc-700' };
    return { name: 'Time Expired', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
  };

  const tier = getTierLabel(guessTime);

  // SVG coordinate conversions
  // X: 50px (0s) to 450px (15s) => width = 400px
  // Y: 190px (0 pts) to 40px (1000 pts) => height = 150px
  const getX = (t: number) => 50 + (t / 15) * 400;
  const getY = (pts: number) => 190 - (pts / 1000) * 150;

  const currentX = getX(guessTime);
  const currentY = getY(points);

  return (
    <section className="relative py-16 sm:py-24 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column (5 of 12): Two short sentences */}
        <div className="lg:col-span-5 text-left">
          <h2 className="text-[clamp(28px,3vw,40px)] font-bold tracking-[-0.02em] text-[var(--foreground)] mb-4">
            Faster answers score more
          </h2>

          <div className="space-y-4 text-base sm:text-lg text-[var(--muted-foreground)] leading-relaxed">
            <p>
              Speed is your primary multiplier in every room. Every player hears the same 15-second clip, but only the quickest ears take maximum points.
            </p>
            <p>
              Answers locked within three seconds earn the full 1,000-point Blitz tier before instinct tiers decay.
            </p>
          </div>

          <div className="mt-8 flex items-center gap-3 text-xs font-mono text-[var(--muted-foreground)]">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface-1)] border border-[var(--border)]">
              <Lightning size={14} className="text-amber-400" weight="fill" /> &le; 3s = 1,000 pts
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface-1)] border border-[var(--border)]">
              <Clock size={14} className="text-cyan-400" weight="bold" /> &le; 6s = 700 pts
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface-1)] border border-[var(--border)]">
              &le; 15s = 500 pts
            </span>
          </div>
        </div>

        {/* Right Column (7 of 12): Interactive SVG curve + Draggable dot */}
        <div className="lg:col-span-7">
          <div className="card-surface p-6 sm:p-8">
            {/* Live readout badge */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-2">
                <Trophy size={20} className="text-[var(--primary)]" weight="duotone" />
                <span className="text-lg font-bold text-[var(--foreground)] font-mono tabular-nums">
                  Answer at {guessTime.toFixed(1)}s = {points.toLocaleString()} points
                </span>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${tier.color}`}>
                {tier.name}
              </span>
            </div>

            {/* SVG Graph */}
            <div className="relative w-full aspect-[500/220] select-none">
              <svg viewBox="0 0 500 220" className="w-full h-full overflow-visible">
                {/* Horizontal Grid lines */}
                <line x1="50" y1="40" x2="450" y2="40" stroke="var(--border)" strokeDasharray="3 3" />
                <text x="42" y="44" fill="var(--muted-foreground)" fontSize="11" textAnchor="end" fontFamily="monospace">1000</text>

                <line x1="50" y1="85" x2="450" y2="85" stroke="var(--border)" strokeDasharray="3 3" />
                <text x="42" y="89" fill="var(--muted-foreground)" fontSize="11" textAnchor="end" fontFamily="monospace">700</text>

                <line x1="50" y1="115" x2="450" y2="115" stroke="var(--border)" strokeDasharray="3 3" />
                <text x="42" y="119" fill="var(--muted-foreground)" fontSize="11" textAnchor="end" fontFamily="monospace">500</text>

                <line x1="50" y1="190" x2="450" y2="190" stroke="var(--border)" />
                <text x="42" y="194" fill="var(--muted-foreground)" fontSize="11" textAnchor="end" fontFamily="monospace">0</text>

                {/* Vertical time markers */}
                <text x="50" y="210" fill="var(--muted-foreground)" fontSize="11" textAnchor="middle" fontFamily="monospace">0s</text>
                <text x={getX(3)} y="210" fill="var(--muted-foreground)" fontSize="11" textAnchor="middle" fontFamily="monospace">3s</text>
                <text x={getX(6)} y="210" fill="var(--muted-foreground)" fontSize="11" textAnchor="middle" fontFamily="monospace">6s</text>
                <text x="450" y="210" fill="var(--muted-foreground)" fontSize="11" textAnchor="middle" fontFamily="monospace">15s</text>

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
                  stroke="var(--background)"
                  strokeWidth="2.5"
                  className="transition-all duration-100"
                />
              </svg>
            </div>

            {/* Interactive Timeline Scrubber Slider */}
            <div className="mt-6 pt-4 border-t border-[var(--border)]">
              <div className="flex items-center justify-between text-xs font-mono text-[var(--muted-foreground)] mb-2">
                <span>Drag to simulate response time:</span>
                <span className="font-bold text-[var(--foreground)]">{guessTime.toFixed(1)}s</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="15"
                step="0.1"
                value={guessTime}
                onChange={(e) => {
                  setIsInteracting(true);
                  setGuessTime(parseFloat(e.target.value));
                }}
                className="w-full accent-[var(--primary)] h-2 rounded-lg bg-[var(--surface-2)] cursor-pointer"
                aria-label="Simulated answer time scrubber"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
