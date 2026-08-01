'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Copy, ArrowRight, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AvatarPicker } from '@/components/avatar-picker';

export default function JoinRoomPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);

  const canJoin = code.trim().length >= 4 && name.trim().length > 0 && avatar;

  const handleJoin = () => {
    if (!canJoin) return;
    const params = new URLSearchParams({
      name: name.trim(),
      avatar,
    });
    router.push(`/room/${code.trim().toUpperCase()}?${params.toString()}`);
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
            <p className="text-muted-foreground">Enter the room code, then set your name and avatar.</p>
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

            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-purple-400" /> Your display name
              </p>
              <Input
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                maxLength={20}
                className="text-center text-lg h-12"
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" /> Choose your avatar
              </p>
              <AvatarPicker value={avatar} onChange={setAvatar} />
            </div>

            <Button
              className="w-full gap-2 h-12"
              disabled={!canJoin}
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
