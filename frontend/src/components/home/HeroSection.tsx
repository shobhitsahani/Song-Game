'use client';

import { motion } from 'framer-motion';
import { Play, LogIn, Zap, Users, Sparkles, AudioLines } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function AnimatedEqualizer() {
  const bars = [0.45, 0.8, 0.55, 0.95, 0.65, 0.85, 0.5, 0.75];
  return (
    <div className="flex items-end gap-[3px] h-4" aria-hidden="true">
      {bars.map((h, i) => (
        <span
          key={i}
          className="w-[3px] rounded-full bg-gradient-to-t from-violet-500 via-fuchsia-400 to-indigo-400 animate-eq"
          style={{
            height: `${h * 16}px`,
            animationDelay: `${i * 0.11}s`,
            animationDuration: `${0.8 + (i % 4) * 0.18}s`,
          }}
        />
      ))}
    </div>
  );
}

const heroNotes = ['♪', '♫', '♩', '♬', '♪', '♫', '♩'];

export function HeroSection() {
  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
      {/* Ambient aurora glows */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950/35 via-transparent to-background" />
      <div className="absolute left-1/2 top-1/3 -translate-x-1/2 w-[720px] h-[720px] rounded-full bg-[radial-gradient(circle,hsl(262_84%_66%/0.16),transparent_65%)] blur-3xl pointer-events-none" />
      <div className="absolute right-[6%] top-[18%] w-[420px] h-[420px] rounded-full bg-[radial-gradient(circle,hsl(7_74%_55%/0.11),transparent_65%)] blur-3xl pointer-events-none" />
      <div className="absolute left-[4%] bottom-[12%] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,hsl(217_91%_60%/0.08),transparent_65%)] blur-3xl pointer-events-none" />

      {/* Floating music notes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {heroNotes.map((n, i) => (
          <motion.span
            key={i}
            className="absolute text-white/[0.08] text-3xl select-none"
            initial={{ y: '110%', x: `${8 + i * 13}%`, opacity: 0 }}
            animate={{ y: '-12%', x: `${8 + i * 12}%`, opacity: [0, 0.6, 0], rotate: [0, 24, -12, 0] }}
            transition={{ duration: 9 + i * 1.6, repeat: Infinity, delay: i * 1.1, ease: 'linear' }}
          >
            {n}
          </motion.span>
        ))}
      </div>

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <motion.div
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-400" />
            </span>
            <span className="text-xs sm:text-sm font-medium text-violet-200">Multiplayer Music Trivia</span>
            <AnimatedEqualizer />
          </motion.div>

          <motion.h1
            className="text-5xl sm:text-6xl md:text-7xl lg:text-[88px] font-bold mb-6 tracking-tight leading-[1.05]"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.7 }}
          >
            <span className="text-gradient">Name That Tune,</span>
            <br />
            <span className="text-gradient-primary">Claim the Crown</span>
          </motion.h1>

          <motion.p
            className="text-sm sm:text-base md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed px-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Challenge your friends in real-time music trivia. Listen to song clips, 
            guess the title, and climb the leaderboard.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <Link href="/create-room" className="w-full sm:w-auto">
              <Button size="xl" variant="gradient" className="gap-2 w-full sm:w-auto">
                <Play className="w-5 h-5" /> Play Now
              </Button>
            </Link>
            <Link href="/join-room" className="w-full sm:w-auto">
              <Button size="xl" variant="glass" className="gap-2 w-full sm:w-auto">
                <LogIn className="w-5 h-5" /> Join Room
              </Button>
            </Link>
            <Link href="/quick-play" className="w-full sm:w-auto">
              <Button size="xl" variant="outline" className="gap-2 w-full sm:w-auto">
                <Zap className="w-5 h-5" /> Quick Match
              </Button>
            </Link>
          </motion.div>

          <motion.div
            className="mt-12 flex items-center justify-center gap-7 md:gap-10 text-muted-foreground flex-wrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <span className="flex items-center gap-2 text-xs sm:text-sm">
              <Users className="w-4 h-4 text-gold" /> Play With Friends
            </span>
            <span className="flex items-center gap-2 text-xs sm:text-sm">
              <AudioLines className="w-4 h-4 text-ember" /> 8 Game Modes
            </span>
            <span className="flex items-center gap-2 text-xs sm:text-sm">
              <Sparkles className="w-4 h-4 text-mint" /> Daily Challenges
            </span>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{ delay: 1, duration: 2, repeat: Infinity }}
      >
        <div className="w-5 h-8 md:w-6 md:h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1">
          <div className="w-1 h-2.5 md:w-1.5 md:h-3 rounded-full bg-white/40" />
        </div>
      </motion.div>
    </section>
  );
}
