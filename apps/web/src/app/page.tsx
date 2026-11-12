import { Navbar } from '@/components/landing/navbar';
import { HeroSection } from '@/components/landing/hero-section';
import { HowRoundWorks } from '@/components/landing/how-round-works';
import { EightWaysToPlay } from '@/components/landing/eight-ways-to-play';
import { ScoringDemo } from '@/components/landing/scoring-demo';
import { LeaderboardAchievementsSection } from '@/components/landing/leaderboard-achievements';
import { FinalCTA } from '@/components/landing/final-cta';
import { Footer } from '@/components/landing/footer';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen">
        <HeroSection />
        <HowRoundWorks />
        <EightWaysToPlay />
        <ScoringDemo />
        <LeaderboardAchievementsSection />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
