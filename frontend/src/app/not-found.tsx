import Link from 'next/link';
import { Music, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="mx-auto w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-6">
          <Music className="w-8 h-8 text-muted-foreground" />
        </div>
        <h1 className="text-6xl font-bold mb-2 text-gradient">404</h1>
        <p className="text-xl font-semibold mb-2">Page not found</p>
        <p className="text-muted-foreground mb-8">This track doesn&apos;t exist. Let&apos;s get you back to the music.</p>
        <Link href="/">
          <Button variant="gradient" size="lg" icon={<Home className="w-4 h-4" />}>Back to Home</Button>
        </Link>
      </div>
    </div>
  );
}
