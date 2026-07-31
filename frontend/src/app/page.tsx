import { Suspense, lazy } from 'react';
import type { Metadata } from 'next';
import { Navbar } from '@/components/home/Navbar';
import { HeroSection } from '@/components/home/HeroSection';

const FeaturesSection = lazy(() => import('@/components/home/FeaturesSection').then(m => ({ default: m.FeaturesSection })));

export const metadata: Metadata = {
  title: 'Multiplayer Music Trivia Game',
  description: 'Challenge your friends in real-time music trivia. Listen to song clips, guess the title, and climb the leaderboard.',
  openGraph: {
    title: 'Song Game - Multiplayer Music Trivia',
    description: 'Challenge your friends in real-time music trivia. Listen to song clips, guess the title, and climb the leaderboard.',
  },
};

function FeaturesFallback() {
  return <div className="py-24 px-4" aria-hidden="true" />;
}

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <Suspense fallback={<FeaturesFallback />}>
        <FeaturesSection />
      </Suspense>
    </main>
  );
}
