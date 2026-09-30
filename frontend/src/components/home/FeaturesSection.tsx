'use client';

import { motion } from 'framer-motion';
import { AudioLines, Users, Zap, Trophy, Globe, Headphones } from 'lucide-react';

const features = [
  { icon: AudioLines, title: 'Vast Music Library', description: 'Millions of songs from every genre and era', tile: 'from-gold/20 to-gold/5 text-gold' },
  { icon: Users, title: 'Multiplayer', description: 'Play with friends in real-time rooms', tile: 'from-ember/20 to-ember/5 text-ember' },
  { icon: Zap, title: 'Fast-Paced', description: '10-second clips, quick thinking required', tile: 'from-indigo-500/20 to-indigo-500/5 text-indigo-300' },
  { icon: Trophy, title: 'Competitive', description: 'Rankings, achievements, and XP system', tile: 'from-cyan-500/20 to-cyan-500/5 text-cyan-300' },
  { icon: Globe, title: 'Global', description: 'Challenge players from around the world', tile: 'from-emerald-500/20 to-emerald-500/5 text-emerald-300' },
  { icon: Headphones, title: 'Deezer Integration', description: 'Login with Deezer — 30-sec song previews built in', tile: 'from-rose-500/20 to-rose-500/5 text-rose-300' },
];

export function FeaturesSection() {
  return (
    <section className="py-16 md:py-28 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/[0.12] to-transparent pointer-events-none" />
      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-12 md:mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-block text-xs md:text-sm font-semibold tracking-widest uppercase text-violet-200/80 mb-3">
            Everything You Need
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4 tracking-tight">
            <span className="text-gradient">How It Works</span>
          </h2>
          <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Everything you need for the ultimate music trivia experience
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -6 }}
              className="glass-card glass-hover p-5 md:p-7 group"
            >
              <div className={`w-11 h-11 md:w-13 md:h-13 rounded-xl bg-gradient-to-br ${feature.tile} flex items-center justify-center mb-4 ring-1 ring-inset ring-white/[0.08] group-hover:scale-105 transition-transform`}>
                <feature.icon className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h3 className="text-base md:text-lg font-semibold mb-1.5 tracking-tight">{feature.title}</h3>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
