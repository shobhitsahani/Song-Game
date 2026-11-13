'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { Check, Clock, Disc, Trophy, X } from '@phosphor-icons/react';
import { BorderBeam } from '@/components/magicui/border-beam';
import { NumberTicker } from '@/components/magicui/number-ticker';
import { GlassSurface } from '@/components/glass/glass-surface';
import { liquidSpring } from '@/lib/motion';
import { cn } from '@/lib/utils';

interface SampleQuestion {
  title: string;
  artist: string;
  options: { key: string; text: string; isCorrect: boolean }[];
  correctIndex: number;
}

const SAMPLE_QUESTIONS: SampleQuestion[] = [
  {
    title: 'Neon Midnight',
    artist: 'The Velvet Waves',
    options: [
      { key: 'A', text: 'Echoes in the Rain', isCorrect: false },
      { key: 'B', text: 'Neon Midnight', isCorrect: true },
      { key: 'C', text: 'Solar Flare', isCorrect: false },
      { key: 'D', text: 'Starlight Avenue', isCorrect: false },
    ],
    correctIndex: 1,
  },
  {
    title: 'Golden Hour Groove',
    artist: 'Sunset Boulevard',
    options: [
      { key: 'A', text: 'Golden Hour Groove', isCorrect: true },
      { key: 'B', text: 'Copper Skies', isCorrect: false },
      { key: 'C', text: 'City Lights', isCorrect: false },
      { key: 'D', text: 'Late Night Drift', isCorrect: false },
    ],
    correctIndex: 0,
  },
  {
    title: 'Velocity',
    artist: 'Pulse Engine',
    options: [
      { key: 'A', text: 'Overdrive', isCorrect: false },
      { key: 'B', text: 'Signal Lost', isCorrect: false },
      { key: 'C', text: 'Velocity', isCorrect: true },
      { key: 'D', text: 'Quantum Leap', isCorrect: false },
    ],
    correctIndex: 2,
  },
];

export function LiveRoundPreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [qIndex, setQIndex] = useState(0);
  const [phase, setPhase] = useState<'playing' | 'selected' | 'reveal'>('playing');
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isInView, setIsInView] = useState(true);
  const [isTabHidden, setIsTabHidden] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [score, setScore] = useState(1850);

  const currentQ = SAMPLE_QUESTIONS[qIndex];

  // Check reduced motion & tab visibility & inView
  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionQuery.matches);
    const motionHandler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    motionQuery.addEventListener('change', motionHandler);

    const handleVisibility = () => setIsTabHidden(document.hidden);
    document.addEventListener('visibilitychange', handleVisibility);

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.2 }
    );
    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      motionQuery.removeEventListener('change', motionHandler);
      document.removeEventListener('visibilitychange', handleVisibility);
      observer.disconnect();
    };
  }, []);

  const handleSelectOption = useCallback(
    (index: number) => {
      if (phase !== 'playing') return;
      setSelectedIdx(index);
      setPhase('selected');

      // Short delay then reveal
      setTimeout(() => {
        setPhase('reveal');
        if (currentQ.options[index]?.isCorrect) {
          setScore((prev) => prev + 1000);
        }
      }, 450);

      // Advance after reveal
      setTimeout(() => {
        setPhase('playing');
        setSelectedIdx(null);
        setTimeLeft(15);
        setQIndex((prev) => (prev + 1) % SAMPLE_QUESTIONS.length);
      }, 3500);
    },
    [phase, currentQ]
  );

  // Autoplay countdown loop
  useEffect(() => {
    if (prefersReducedMotion || isTabHidden || !isInView) return;

    if (phase === 'playing') {
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 12) {
            // Autoplay picks the correct answer around 3s into clip (12s left)
            handleSelectOption(currentQ.correctIndex);
            return prev;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [phase, prefersReducedMotion, isTabHidden, isInView, currentQ.correctIndex, handleSelectOption]);

  // Tonearm angle: resting is 0deg, drops to 18deg (outer groove), sweeps to 32deg (inner groove)
  const needleAngle = prefersReducedMotion
    ? 24
    : phase === 'playing'
    ? 18 + ((15 - timeLeft) / 15) * 14
    : 24;

  return (
    <div ref={containerRef} className="relative w-full max-w-lg lg:max-w-none mx-auto lg:mx-0">
      {/* Background Vinyl Disc peeking out behind card edge so refraction rim bends it */}
      <div
        aria-hidden="true"
        className="absolute -right-8 -top-8 sm:-right-6 sm:-top-6 w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] pointer-events-none select-none z-0 opacity-70"
      >
        <motion.svg
          viewBox="0 0 400 400"
          className="w-full h-full drop-shadow-xl"
          animate={
            prefersReducedMotion || phase === 'reveal' || !isInView || isTabHidden
              ? { rotate: 0 }
              : { rotate: 360 }
          }
          transition={{
            repeat: Infinity,
            duration: 3.4,
            ease: 'linear',
          }}
        >
          <circle cx="200" cy="200" r="195" fill="#0c0b10" stroke="#252430" strokeWidth="4" />
          <circle cx="200" cy="200" r="180" fill="none" stroke="#1c1a24" strokeWidth="1" strokeDasharray="6 3" />
          <circle cx="200" cy="200" r="165" fill="none" stroke="#16151e" strokeWidth="2" />
          <circle cx="200" cy="200" r="150" fill="none" stroke="#201e2a" strokeWidth="1" />
          <circle cx="200" cy="200" r="135" fill="none" stroke="#16151e" strokeWidth="2" />
          <circle cx="200" cy="200" r="120" fill="none" stroke="#1f1d29" strokeWidth="1" />
          <circle cx="200" cy="200" r="105" fill="none" stroke="#16151e" strokeWidth="2" />
          <circle cx="200" cy="200" r="90" fill="none" stroke="#201e2a" strokeWidth="1" />
          <circle cx="200" cy="200" r="70" fill="var(--primary)" />
          <circle cx="200" cy="200" r="18" fill="#0a0a0d" stroke="var(--primary-foreground)" strokeWidth="2" />
        </motion.svg>
      </div>

      <GlassSurface
        variant="strong"
        radius="2xl"
        refraction={false}
        specularRim={true}
        className="relative z-10 w-full p-5 sm:p-7 shadow-2xl backdrop-blur-2xl"
      >
        {/* Magic UI BorderBeam - at most one use on page */}
        <BorderBeam size={240} duration={14} colorFrom="var(--primary)" colorTo="var(--accent)" borderWidth={1.5} />

      {/* Top Header Row */}
      <div className="relative z-10 flex items-center justify-between pb-4 border-b border-[var(--glass-border)]/60 gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono font-bold tracking-wider text-[var(--foreground)] uppercase bg-[var(--surface-2)] px-2.5 py-1 rounded-full border border-[var(--glass-border)]">
            Room VR426D
          </span>
          <span className="hidden sm:inline-block text-xs text-[var(--muted-foreground)]">
            Round {qIndex + 1} of 10
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Avatar stack */}
          <div className="flex items-center -space-x-2">
            <div className="w-7 h-7 rounded-full bg-amber-500/20 border-2 border-[var(--card)] flex items-center justify-center text-xs font-bold text-amber-300">
              AX
            </div>
            <div className="w-7 h-7 rounded-full bg-cyan-500/20 border-2 border-[var(--card)] flex items-center justify-center text-xs font-bold text-cyan-300">
              JD
            </div>
            <div className="w-7 h-7 rounded-full bg-pink-500/20 border-2 border-[var(--card)] flex items-center justify-center text-xs font-bold text-pink-300">
              SM
            </div>
          </div>

          {/* Timer Pill */}
          <div
            className={cn(
              'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border transition-colors',
              timeLeft <= 5
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 animate-pulse'
                : 'bg-[var(--surface-2)] border-[var(--glass-border)] text-[var(--foreground)]'
            )}
          >
            <Clock size={14} weight="bold" />
            <span className="tabular-nums">{timeLeft}s</span>
          </div>
        </div>
      </div>

      {/* Centerpiece: Vinyl Disc & Tonearm overlapping top-right */}
      <div className="relative h-44 sm:h-52 my-3 overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--surface-2)] to-[var(--surface-1)] border border-[var(--border)] p-4 flex flex-col justify-between">
        {/* Large Vinyl Disc (SVG + Motion) positioned overlapping top-right */}
        <div
          aria-hidden="true"
          className="absolute -right-16 -top-12 sm:-right-10 sm:-top-8 w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] pointer-events-none select-none"
        >
          {/* Vinyl Disc Body with Grooves */}
          <motion.svg
            viewBox="0 0 400 400"
            className="w-full h-full drop-shadow-2xl"
            animate={
              prefersReducedMotion || phase === 'reveal' || !isInView || isTabHidden
                ? { rotate: 0 }
                : { rotate: 360 }
            }
            transition={{
              repeat: Infinity,
              duration: 2.8,
              ease: 'linear',
            }}
          >
            {/* Outer edge rim */}
            <circle cx="200" cy="200" r="195" fill="#0c0b10" stroke="#252430" strokeWidth="4" />
            {/* Concentric grooved rings */}
            <circle cx="200" cy="200" r="180" fill="none" stroke="#1c1a24" strokeWidth="1" strokeDasharray="6 3" />
            <circle cx="200" cy="200" r="165" fill="none" stroke="#16151e" strokeWidth="2" />
            <circle cx="200" cy="200" r="150" fill="none" stroke="#201e2a" strokeWidth="1" />
            <circle cx="200" cy="200" r="135" fill="none" stroke="#16151e" strokeWidth="2" />
            <circle cx="200" cy="200" r="120" fill="none" stroke="#1f1d29" strokeWidth="1" />
            <circle cx="200" cy="200" r="105" fill="none" stroke="#16151e" strokeWidth="2" />
            <circle cx="200" cy="200" r="90" fill="none" stroke="#201e2a" strokeWidth="1" />
            {/* Specular sheen gradient highlights */}
            <path
              d="M 200,5 A 195,195 0 0,1 338,62 L 200,200 Z"
              fill="white"
              fillOpacity="0.04"
            />
            <path
              d="M 200,395 A 195,195 0 0,1 62,338 L 200,200 Z"
              fill="white"
              fillOpacity="0.04"
            />
            {/* Center Label */}
            <circle cx="200" cy="200" r="70" fill="var(--primary)" />
            <circle cx="200" cy="200" r="62" fill="none" stroke="black" strokeOpacity="0.2" strokeWidth="1.5" />
            <circle cx="200" cy="200" r="18" fill="#0a0a0d" stroke="var(--primary-foreground)" strokeWidth="2" />
            <text
              x="200"
              y="175"
              textAnchor="middle"
              fill="var(--primary-foreground)"
              fontSize="12"
              fontWeight="bold"
              fontFamily="sans-serif"
              letterSpacing="2"
            >
              SONGGAME
            </text>
            <text
              x="200"
              y="235"
              textAnchor="middle"
              fill="var(--primary-foreground)"
              fontSize="10"
              fontFamily="sans-serif"
              opacity="0.8"
            >
              33 RPM · STEREO
            </text>
          </motion.svg>

          {/* Tonearm */}
          <motion.svg
            viewBox="0 0 200 300"
            className="absolute top-0 right-2 w-28 h-44 drop-shadow-xl origin-[85px_15px]"
            animate={{ rotate: needleAngle }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          >
            {/* Pivot Base */}
            <circle cx="85" cy="18" r="16" fill="#383642" stroke="#525060" strokeWidth="2" />
            <circle cx="85" cy="18" r="8" fill="#1e1c24" />
            {/* Arm Shaft */}
            <path
              d="M 85,26 L 82,160 L 68,220"
              fill="none"
              stroke="#a1a1aa"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Cartridge headshell */}
            <rect
              x="58"
              y="218"
              width="18"
              height="28"
              rx="3"
              fill="#d4d4d8"
              stroke="#52525b"
              strokeWidth="1.5"
              transform="rotate(12 67 232)"
            />
            {/* Stylus needle */}
            <circle cx="67" cy="246" r="2.5" fill="var(--primary)" />
          </motion.svg>
        </div>

        {/* Track Info (Fictional sample, labelled clearly) */}
        <div className="relative z-10 max-w-[65%]">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[var(--card)]/90 border border-[var(--border)] text-xs font-mono text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
            <Disc size={13} className="text-[var(--primary)]" weight="duotone" /> Sample Round
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-sans tracking-tight text-[var(--foreground)] truncate">
            {currentQ.title}
          </h2>
          <p className="text-sm text-[var(--muted-foreground)] truncate mt-0.5">
            {currentQ.artist}
          </p>
        </div>

        {/* Live Audio Waveform snippet */}
        <div className="relative z-10 flex items-center gap-1.5">
          <div className="flex items-center gap-1 h-5">
            {[40, 75, 100, 60, 90, 45, 80, 55, 95, 30].map((h, i) => (
              <motion.span
                key={i}
                className="w-1 h-4 bg-[var(--primary)] rounded-full origin-bottom"
                animate={
                  prefersReducedMotion || phase === 'reveal' || !isInView || isTabHidden
                    ? { scaleY: 0.25 }
                    : { scaleY: [0.25, Math.max(0.25, h / 100), 0.25] }
                }
                transition={{
                  repeat: Infinity,
                  duration: 0.8,
                  delay: i * 0.08,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
          <span className="text-xs font-mono text-[var(--muted-foreground)] ml-2">
            0:0{(15 - timeLeft).toString().padStart(2, '0')} / 0:15
          </span>
        </div>
      </div>

      {/* Answer Options Grid (4 glass buttons) */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3">
        {currentQ.options.map((opt, i) => {
          const isSelected = selectedIdx === i;
          const isCorrect = opt.isCorrect;
          const showReveal = phase === 'reveal';

          return (
            <motion.button
              key={opt.key}
              type="button"
              onClick={() => handleSelectOption(i)}
              className={cn(
                'group relative flex items-center justify-between p-3.5 rounded-xl border text-left transition-colors duration-[80ms] outline-none select-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] cursor-pointer',
                showReveal && isCorrect
                  ? 'border-emerald-500/80 bg-emerald-500/20 text-emerald-300 font-bold shadow-md shadow-emerald-500/20'
                  : showReveal && isSelected && !isCorrect
                  ? 'border-rose-500/80 bg-rose-500/20 text-rose-300 shadow-md shadow-rose-500/20'
                  : isSelected && phase === 'selected'
                  ? 'border-[var(--primary)] text-[var(--foreground)]'
                  : 'bg-[var(--surface-1)]/70 border-[var(--glass-border)] text-[var(--foreground)] hover:bg-[var(--surface-2)]/80 hover:border-[var(--glass-highlight)]'
              )}
            >
              {isSelected && (
                <motion.div
                  layoutId="previewAnswerLens"
                  transition={prefersReducedMotion ? { duration: 0.08 } : liquidSpring}
                  className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/[0.12] to-white/[0.04] dark:from-white/[0.08] dark:to-white/[0.02] border border-white/25 dark:border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_8px_rgba(0,0,0,0.2)] -z-10"
                />
              )}
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-2)] text-xs font-mono font-bold text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]">
                  {opt.key}
                </span>
                <span className="text-sm font-medium truncate">{opt.text}</span>
              </div>

              {showReveal && isCorrect && (
                <Check size={18} weight="bold" className="text-emerald-400 shrink-0 ml-2" />
              )}
              {showReveal && isSelected && !isCorrect && (
                <X size={18} weight="bold" className="text-rose-400 shrink-0 ml-2" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Live Round Points update row */}
      <div className="relative z-10 mt-4 pt-3 border-t border-[var(--glass-border)]/60 flex items-center justify-between text-xs text-[var(--muted-foreground)]">
        <div className="flex items-center gap-1.5 font-medium">
          <Trophy size={15} className="text-amber-400" weight="duotone" />
          <span>Your score:</span>
          <NumberTicker value={score} className="font-bold text-[var(--foreground)]" />
          {phase === 'reveal' && selectedIdx === currentQ.correctIndex && (
            <span className="text-emerald-400 font-bold font-mono text-xs ml-1 animate-in fade-in zoom-in-95">
              +1,000 (Blitz bonus)
            </span>
          )}
        </div>
        <span className="text-xs text-[var(--muted-foreground)]">Click any answer to test</span>
      </div>
    </GlassSurface>
    </div>
  );
}
