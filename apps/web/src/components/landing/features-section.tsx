'use client';

import { motion } from 'framer-motion';
import { Music, Users, Zap, Shield, Gamepad2, Globe, Sparkles, Clock, Trophy } from 'lucide-react';

const features = [
  {
    icon: Music,
    title: 'Multiple Game Modes',
    description: 'Classic, Artist, Album, Lyrics, Genre, Decade, Hardcore, and Survival modes.',
  },
  {
    icon: Users,
    title: 'Real-time Multiplayer',
    description: 'Play with friends in private rooms or matchmake with players worldwide.',
  },
  {
    icon: Zap,
    title: 'Fast-paced Rounds',
    description: 'Quick 15-second rounds keep the action intense and exciting.',
  },
  {
    icon: Shield,
    title: 'Fair Matchmaking',
    description: 'Skill-based matchmaking ensures balanced and competitive games.',
  },
  {
    icon: Gamepad2,
    title: 'Power-ups & Bonuses',
    description: 'Skip, reveal, and 50/50 power-ups add strategic depth.',
  },
  {
    icon: Globe,
    title: 'Global Leaderboards',
    description: 'Compete for top rankings on weekly, monthly, and all-time leaderboards.',
  },
  {
    icon: Sparkles,
    title: 'XP & Progression',
    description: 'Level up, unlock achievements, and earn titles as you play.',
  },
  {
    icon: Trophy,
    title: 'Daily Challenges',
    description: 'Complete daily challenges for bonus XP and exclusive rewards.',
  },
  {
    icon: Clock,
    title: 'Multiple Categories',
    description: 'Pop, Rock, Hip-Hop, Electronic, R&B, Country, Indie, and more.',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent pointer-events-none" />
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need for
            <span className="text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text"> Epic Game Nights</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Packed with features designed to deliver the ultimate music trivia experience.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="glass rounded-2xl p-6 glass-hover"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
