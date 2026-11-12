'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Play, ArrowRight, X, ArrowClockwise } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot, REGEXP_ONLY_DIGITS_AND_CHARS } from '@/components/ui/input-otp';
import { LiveRoundPreview } from './live-round-preview';
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column (6 of 12) */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            {/* Headline: clamp(40px, 5.2vw, 76px), weight 600-700, letter-spacing 0 to -0.01em */}
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="text-[clamp(40px,5.2vw,76px)] font-bold font-display tracking-[-0.01em] text-[var(--foreground)] leading-[1.06] mb-5"
            >
              Name that track before the needle drops.
            </motion.h1>

            {/* Subhead: max 20 words, body font, 18px */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="text-base sm:text-lg text-[var(--muted-foreground)] max-w-lg mb-8 font-normal leading-relaxed"
            >
              Real-time music trivia. Hear a 15-second clip, name it first, and race your friends in a live room.
            </motion.p>

            {/* Primary Actions: Play + 6-slot InputOTP Join Room */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full max-w-xl"
            >
              <Link href="/room/create" className="shrink-0">
                <Button
                  size="lg"
                  variant="primary"
                  className="w-full sm:w-auto h-12 px-7 text-base font-bold shadow-xl rounded-xl"
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
                    variant="glass"
                    className="h-11 sm:h-12 px-3.5 sm:px-4 text-sm font-semibold rounded-xl shrink-0"
                    disabled={roomCode.trim().length < 4}
                  >
                    Join <ArrowRight size={16} weight="bold" />
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="hidden sm:inline-block text-xs font-medium text-[var(--muted-foreground)]">
                    Have a code? Enter 6 characters to join.
                  </span>
                  {codeError && (
                    <span className="text-xs font-medium text-rose-400">
                      {codeError}
                    </span>
                  )}
                </div>
              </form>
            </motion.div>

            {/* Reserved space for Resume Banner */}
            <div className="min-h-[48px] w-full max-w-lg mt-5">
              {savedRoom && !isDismissed && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl liquid-glass-surface bg-[var(--surface-1)]/90 border border-[var(--glass-border)] shadow-md"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <ArrowClockwise size={16} className="text-[var(--primary)] shrink-0" weight="bold" />
                    <span className="text-[var(--foreground)] font-semibold font-mono">
                      Room {savedRoom.code}
                    </span>
                    <span className="text-[var(--muted-foreground)]">
                      · question {savedRoom.round ?? 4} of {savedRoom.total ?? 10}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/room/${savedRoom.code}`}>
                      <Button size="sm" variant="glass" className="h-7 px-3 text-xs font-semibold rounded-lg">
                        Resume
                      </Button>
                    </Link>
                    <button
                      type="button"
                      onClick={handleDismissResume}
                      aria-label="Dismiss resume prompt"
                      className="p-1 rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                    >
                      <X size={14} weight="bold" />
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Right Column (6 of 12) - LiveRoundPreview Centerpiece */}
          <div className="lg:col-span-6 w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <LiveRoundPreview />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
