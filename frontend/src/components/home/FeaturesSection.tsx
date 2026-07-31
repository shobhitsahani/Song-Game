'use client';

import { motion } from 'framer-motion';
import { Music, Users, Zap, Trophy, Globe, Headphones } from 'lucide-react';

const features = [
  { icon: Music, title: 'Vast Music Library', description: 'Millions of songs from every genre and era' },
  { icon: Users, title: 'Multiplayer', description: 'Play with friends in real-time rooms' },
  { icon: Zap, title: 'Fast-Paced', description: '10-second clips, quick thinking required' },
  { icon: Trophy, title: 'Competitive', description: 'Rankings, achievements, and XP system' },
  { icon: Globe, title: 'Global', description: 'Challenge players from around the world' },
  { icon: Headphones, title: 'Deezer Integration', description: 'Login with Deezer — 30-sec song previews built in' },
];

export function FeaturesSection() {
  return (
    <section className="py-16 md:py-24 px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-purple-900/5 to-background" />
      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-10 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
            <span className="text-gradient">How It Works</span>
          </h2>
          <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Everything you need for the ultimate music trivia experience
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              className="glass rounded-xl p-4 md:p-6 glass-hover"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-3 md:mb-4">
                <feature.icon className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
              </div>
              <h3 className="text-base md:text-lg font-semibold mb-1 md:mb-2">{feature.title}</h3>
              <p className="text-xs md:text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
