'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Copy, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function JoinRoomPage() {
  const router = useRouter();
  const [code, setCode] = useState('');

  const handleJoin = () => {
    if (code.trim().length >= 4) {
      router.push(`/room/${code.trim().toUpperCase()}`);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="glass rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-4">
              <Copy className="w-8 h-8 text-purple-400" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Join a Room</h1>
            <p className="text-muted-foreground">Enter the room code to join a game.</p>
          </div>

          <div className="space-y-4">
            <Input
              placeholder="Enter room code..."
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              className="text-center text-2xl font-bold tracking-[0.25em] h-14"
              maxLength={6}
            />
            <Button
              className="w-full gap-2 h-12"
              disabled={code.trim().length < 4}
              onClick={handleJoin}
            >
              Join Room <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
