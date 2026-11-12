import { Navbar } from '@/components/landing/navbar';
import { HeroSection } from '@/components/landing/hero-section';
import { FeaturesSection } from '@/components/landing/features-section';
import { Footer } from '@/components/landing/footer';
import { MobileDockNav } from '@/components/fx/dock-nav';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen">
        <HeroSection />
        <FeaturesSection />
      </main>
      <Footer />
      <MobileDockNav />
    </>
  );
}
