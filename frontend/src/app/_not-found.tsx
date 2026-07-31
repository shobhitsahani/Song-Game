import { Navbar } from '@/components/home/Navbar';
import Link from 'next/link';
import { Home, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-20 md:pt-24 pb-16 md:pb-8 px-4 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-screen text-center">
        <h1 className="text-6xl md:text-8xl font-bold mb-4">404</h1>
        <h2 className="text-xl md:text-2xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-muted-foreground mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex gap-3">
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <Home className="w-4 h-4" />
              Home
            </Button>
          </Link>
          <Link href="/create-room">
            <Button className="gap-2">
              <Search className="w-4 h-4" />
              Create Room
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
