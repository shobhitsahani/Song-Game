'use client';

import { motion } from 'framer-motion';
import { Music, Play, Plus, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-background to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(120,50,200,0.15),transparent_70%)]" />
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-purple-500/10"
            initial={{ x: Math.random() * 100 + '%', y: '110%', opacity: 0 }}
            animate={{
              y: '-10%',
              opacity: [0, 0.3, 0],
              x: `${Math.random() * 100}%`,
            }}
            transition={{
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 4,
              ease: 'linear',
            }}
          >
            <Music size={20 + Math.random() * 28} />
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6 md:mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Music className="w-3 h-3 md:w-4 md:h-4 text-purple-400" />
            <span className="text-[11px] md:text-sm text-purple-300">Multiplayer Music Trivia</span>
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold mb-4 md:mb-6 tracking-tight leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-gradient">Guess the Song</span>
            <br />
            <span>Win the Game</span>
          </motion.h1>

          <motion.p
            className="text-sm sm:text-base md:text-xl text-muted-foreground mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed px-2"
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
            transition={{ delay: 0.5 }}
          >
            <Link href="/create-room" className="w-full sm:w-auto">
              <Button size="xl" className="gap-2 group w-full sm:w-auto text-sm md:text-base">
                <Play className="w-4 h-4 md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
                Play Now
              </Button>
            </Link>
            <Link href="/create-room" className="w-full sm:w-auto">
              <Button size="xl" variant="outline" className="gap-2 w-full sm:w-auto text-sm md:text-base">
                <Plus className="w-4 h-4 md:w-5 md:h-5" />
                Create Room
              </Button>
            </Link>
            <Link href="/join-room" className="w-full sm:w-auto">
              <Button size="xl" variant="ghost" className="gap-2 w-full sm:w-auto text-sm md:text-base">
                <LogIn className="w-4 h-4 md:w-5 md:h-5" />
                Join Room
              </Button>
            </Link>
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
