'use client';

import { motion } from 'motion/react';
import {
  MusicNotes,
  UsersThree,
  Lightning,
  GameController,
  GlobeHemisphereWest,
  Headphones,
} from '@phosphor-icons/react';
import { SpotlightCard } from '@/components/fx/spotlight-card';

const features = [
  {
    icon: MusicNotes,
    title: 'Vast Music Library',
    description: 'Millions of licensed tracks spanning pop, rock, hip-hop, and timeless decades.',
  },
  {
    icon: UsersThree,
    title: 'Real-time Multiplayer',
    description: 'Create private rooms with custom codes or challenge friends in fast-sync lobbies.',
  },
  {
    icon: Lightning,
    title: 'Fast-paced Rounds',
    description: '15-second clips keep adrenaline high. Speed bonuses reward quick instincts.',
  },
  {
    icon: GameController,
    title: '8 Distinct Game Modes',
    description: 'Classic, Artist, Album, Lyrics, Genre, Decade, Hardcore, and Survival elimination.',
  },
  {
    icon: GlobeHemisphereWest,
    title: 'Global Leaderboards',
    description: 'Track accuracy, personal streaks, and compete against players across the globe.',
  },
  {
    icon: Headphones,
    title: 'Late-Night Lounge Mood',
    description: 'Tactile liquid-glass chrome, ambient living backgrounds, and pure audio clarity.',
  },
];

export function FeaturesSection() {
  return (
    <section className="relative py-20 px-4 max-w-6xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-[var(--foreground)] mb-3">
          Built for real music fans.
        </h2>
        <p className="text-base sm:text-lg text-[var(--muted-foreground)]">
          Everything designed around the groove: instant touch targets, zero waiting on animations, and pure audio focus.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((feature, i) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.35 }}
            >
              <SpotlightCard className="h-full flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center mb-4 border border-[var(--primary)]/20">
                    <Icon size={22} weight="duotone" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-[var(--foreground)] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </SpotlightCard>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
