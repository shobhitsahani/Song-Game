'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Play, ArrowRight, X, ArrowClockwise } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot, REGEXP_ONLY_DIGITS_AND_CHARS } from '@/components/ui/input-otp';
import { HeroStageshow } from './hero-stageshow';
import { HeroShaderBackground } from './hero-shader-background';

export function HeroSection() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const [savedRoom, setSavedRoom] = useState<{ code: string; round?: number; total?: number } | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    try {
      const savedRaw = localStorage.getItem('saved_game');
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw);
        if (parsed?.code) {
          setSavedRoom(parsed);
          return;
        }
      }
      const lastCode = localStorage.getItem('last_room_code');
      if (lastCode) {
        setSavedRoom({ code: lastCode, round: 4, total: 10 });
      }
    } catch {}
  }, []);

  const handleJoin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = roomCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (clean.length < 4) {
      setCodeError('Enter a 4-6 character room code');
      return;
    }
    setCodeError(null);
    try {
      localStorage.setItem('last_room_code', clean);
    } catch {}
    router.push(`/room/${clean}`);
  };

  const handleDismissResume = () => {
    setIsDismissed(true);
    try {
      localStorage.removeItem('saved_game');
      localStorage.removeItem('last_room_code');
    } catch {}
  };

  return (
    <section className="relative min-h-[92dvh] flex items-center pt-24 pb-16 lg:pt-28 lg:pb-24 overflow-hidden">
      {/* Background MeshGradient shader - pinned @paper-design/shaders-react */}
      <HeroShaderBackground />

      <div className="relative z-10 max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          {/* Left Column (5 of 12 = ~42-45%) */}
          <div className="lg:col-span-5 flex flex-col items-start text-left justify-center">
            {/* Headline: max 3 lines, clamp(2.5rem, 4.5vw, 4.25rem), weight 600 */}
            <h1 className="text-[clamp(2.5rem,4.5vw,4.25rem)] font-semibold font-display tracking-[-0.02em] text-[var(--foreground)] leading-[1.05] mb-5 text-balance">
              Name that track before the needle drops.
            </h1>

            {/* Subhead: max 20 words, body font, 17-18px */}
            <p className="text-base sm:text-lg text-[var(--muted-foreground)] max-w-lg mb-8 font-normal leading-relaxed text-pretty">
              Real-time music trivia in your browser. Hear 15 seconds, lock in first, and outscore friends in live rooms.
            </p>

            {/* Primary Actions: Play + InputOTP Join Room */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full max-w-xl">
              <Link href="/room/create" className="shrink-0">
                <Button
                  size="lg"
                  variant="primary"
                  className="w-full sm:w-auto h-12 px-7 text-base font-semibold shadow-md"
                >
                  <Play size={18} weight="fill" /> Play
                </Button>
              </Link>

              {/* 6-slot InputOTP Join Form */}
              <form onSubmit={handleJoin} className="flex-1 flex flex-col gap-1.5 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-[var(--muted-foreground)] mb-1 sm:hidden">
                      Have a code?
                    </span>
                    <InputOTP
                      maxLength={6}
                      pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                      inputMode="text"
                      aria-label="Enter 6-character room code"
                      value={roomCode}
                      onChange={(val) => {
                        setRoomCode(val.toUpperCase());
                        if (codeError) setCodeError(null);
                      }}
                      onComplete={handleJoin}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  <Button
                    type="submit"
                    variant="secondary"
                    className="h-11 sm:h-12 px-4 text-sm font-semibold shrink-0"
                    disabled={roomCode.trim().length < 4}
                  >
                    Join <ArrowRight size={15} weight="bold" />
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="hidden sm:inline-block text-xs font-medium text-[var(--muted-foreground)]">
                    Have a code? Enter 6 characters to join.
                  </span>
                  {codeError && (
                    <span className="text-xs font-medium text-[var(--destructive)]">
                      {codeError}
                    </span>
                  )}
                </div>
              </form>
            </div>

            {/* Reserved space for Resume Banner (quiet inline, no layout jump) */}
            <div className="min-h-[44px] w-full max-w-lg mt-4">
              {savedRoom && !isDismissed && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-[var(--radius-control)] bg-[var(--surface-2)] border border-[var(--border)] text-xs text-[var(--muted-foreground)]"
                >
                  <div className="flex items-center gap-2">
                    <ArrowClockwise size={14} className="text-[var(--primary)] shrink-0" weight="bold" />
                    <span>
                      Room <span className="font-semibold text-[var(--foreground)] font-mono">{savedRoom.code}</span> · question {savedRoom.round ?? 4} of {savedRoom.total ?? 10}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/room/${savedRoom.code}`}>
                      <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs font-semibold">
                        Resume
                      </Button>
                    </Link>
                    <button
                      type="button"
                      onClick={handleDismissResume}
                      aria-label="Dismiss resume prompt"
                      className="p-1 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                    >
                      <X size={13} weight="bold" />
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Right Column (7 of 12 = ~55-58%) - Hero Stageshow Centerpiece */}
          <div className="lg:col-span-7 w-full overflow-hidden lg:overflow-visible">
            <HeroStageshow />
          </div>
        </div>
      </div>
    </section>
  );
}
