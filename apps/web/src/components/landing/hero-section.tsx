'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Music, Play, Users, Trophy, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { JoinRoomModal } from './join-room-modal';

export function HeroSection() {
  const [showJoinModal, setShowJoinModal] = useState(false);

  const stats = [
    { icon: Music, label: 'Songs', value: '10,000+' },
    { icon: Users, label: 'Players', value: '50,000+' },
    { icon: Trophy, label: 'Games Played', value: '1M+' },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-[128px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[128px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 mb-8">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300">Multiplayer Music Trivia Game</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            Guess the Song
            <br />
            <span className="text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
              Beat the Clock
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Challenge your friends in real-time music trivia. Listen to song clips,
            guess the title, and climb the leaderboard.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/room/create">
              <Button variant="gradient" size="xl" className="gap-2 text-base">
                <Play className="w-5 h-5 fill-current" /> Play Now
              </Button>
            </Link>
            <Button variant="glass" size="xl" className="gap-2 text-base" onClick={() => setShowJoinModal(true)}>
              <Users className="w-5 h-5" /> Join Room <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          <JoinRoomModal open={showJoinModal} onClose={() => setShowJoinModal(false)} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-20 grid grid-cols-3 gap-8 max-w-lg mx-auto"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <stat.icon className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
