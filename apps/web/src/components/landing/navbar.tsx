'use client';

import Link from 'next/link';
import { Music, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 backdrop-blur-xl bg-background/80">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
            <Music className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg">Song Game</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/room/create">
            <Button variant="gradient" size="sm" className="gap-1.5">
              <Plus className="w-4 h-4" /> Create Room
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
