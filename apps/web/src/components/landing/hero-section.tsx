'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Play, ArrowRight, X, ArrowClockwise } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
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
    <section className="relative min-h-[90dvh] flex items-center pt-[132px] pb-[clamp(80px,9vw,128px)] overflow-hidden">
      {/* Background MeshGradient shader - pinned @paper-design/shaders-react */}
      <HeroShaderBackground />

      <Container className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column (5 of 12 = ~42-45%) - Width 480-520px */}
          <div className="lg:col-span-5 w-full max-w-[500px] flex flex-col items-start text-left justify-center">
            {/* Headline: max 3 lines, clamp(2.5rem, 4.6vw, 4rem), line-height 1.05 */}
            <h1 className="text-[clamp(2.5rem,4.6vw,4rem)] font-semibold font-display tracking-[-0.02em] text-[var(--foreground)] leading-[1.05] mb-5 text-balance">
              Name that track before the&nbsp;needle&nbsp;drops.
            </h1>

            {/* Subhead: max 44ch, body font, 17-18px */}
            <p className="text-[17px] sm:text-[18px] text-[var(--muted-foreground)] max-w-[44ch] mb-7 font-normal leading-relaxed text-pretty">
              Real-time music trivia in your browser. Hear 15 seconds, lock in first, and outscore friends in live rooms.
            </p>

            {/* Play button alone on its row */}
            <div className="mb-6">
              <Link href="/room/create">
                <Button
                  size="md"
                  variant="primary"
                  className="h-11 px-7 text-base font-semibold shadow-xs"
                >
                  <Play size={18} weight="fill" /> Play
                </Button>
              </Link>
            </div>

            {/* Quiet row: Have a code? label + 6-slot InputOTP Join Form */}
            <div className="w-full flex flex-col gap-2">
              <span className="text-xs font-medium text-[var(--muted-foreground)]">
                Have a code?
              </span>
              <form onSubmit={handleJoin} className="flex items-center gap-2">
                <InputOTP
                  maxLength={6}
                  pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                  inputMode="text"
                  autoComplete="off"
                  aria-label="Room code, 6 characters"
                  value={roomCode}
                  onChange={(val) => {
                    setRoomCode(val.toUpperCase());
                    if (codeError) setCodeError(null);
                  }}
                  onComplete={handleJoin}
                >
                  <InputOTPGroup className="gap-1.5">
                    <InputOTPSlot index={0} className="w-10 h-10 sm:w-11 sm:h-11 rounded-[10px] text-[20px] font-mono tabular-nums font-semibold" />
                    <InputOTPSlot index={1} className="w-10 h-10 sm:w-11 sm:h-11 rounded-[10px] text-[20px] font-mono tabular-nums font-semibold" />
                    <InputOTPSlot index={2} className="w-10 h-10 sm:w-11 sm:h-11 rounded-[10px] text-[20px] font-mono tabular-nums font-semibold" />
                    <InputOTPSlot index={3} className="w-10 h-10 sm:w-11 sm:h-11 rounded-[10px] text-[20px] font-mono tabular-nums font-semibold" />
                    <InputOTPSlot index={4} className="w-10 h-10 sm:w-11 sm:h-11 rounded-[10px] text-[20px] font-mono tabular-nums font-semibold" />
                    <InputOTPSlot index={5} className="w-10 h-10 sm:w-11 sm:h-11 rounded-[10px] text-[20px] font-mono tabular-nums font-semibold" />
                  </InputOTPGroup>
                </InputOTP>

                <Button
                  type="submit"
                  variant="secondary"
                  size="sm"
                  className="h-10 sm:h-11 px-4 text-sm font-semibold shrink-0"
                  disabled={roomCode.trim().length !== 6}
                >
                  Join <ArrowRight size={15} weight="bold" />
                </Button>
              </form>
              {codeError && (
                <span className="text-xs font-medium text-[var(--destructive)]">
                  {codeError}
                </span>
              )}
            </div>

            {/* Reserved space for Resume Banner (fixed height slot, no layout shift) */}
            <div className="h-[62px] w-full mt-4 flex items-center">
              {savedRoom && !isDismissed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15 }}
                  className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-[var(--radius-control)] bg-[var(--surface-2)] border border-[var(--border)] text-xs text-[var(--muted-foreground)]"
                >
                  <div className="flex items-center gap-2 min-w-0 truncate">
                    <ArrowClockwise size={14} className="text-[var(--primary)] shrink-0" weight="bold" />
                    <span className="truncate">
                      Room <span className="font-semibold text-[var(--foreground)] font-mono">{savedRoom.code}</span> · question {savedRoom.round ?? 4} of {savedRoom.total ?? 10}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/room/${savedRoom.code}`}>
                      <Button size="sm" variant="secondary" className="h-7 px-3 text-xs font-semibold">
                        Resume
                      </Button>
                    </Link>
                    <button
                      type="button"
                      onClick={handleDismissResume}
                      aria-label="Dismiss resume prompt"
                      className="p-1 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                    >
                      <X size={14} weight="bold" />
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Right Column (7 of 12 = ~55-58%) - Hero Stageshow Centerpiece */}
          <div className="lg:col-span-7 w-full overflow-hidden xl:overflow-visible xl:-mr-[max(0px,calc((100vw-1200px)/2))]">
            <HeroStageshow />
          </div>
        </div>
      </Container>
    </section>
  );
}
