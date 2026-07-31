'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Play, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AvatarPicker } from '@/components/avatar-picker';
import { useSocket } from '@/providers/socket-provider';

export default function CreateRoomPage() {
  const router = useRouter();
  const { socket, connected } = useSocket();
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const handleCreate = useCallback(() => {
    if (!socket || !connected || creating) return;
    if (!name.trim() || !avatar) return;
    setCreating(true);

    socket.emit('room:create', { username: name.trim(), avatar });
    socket.once('room:joined', (room) => {
      router.push(`/room/${room.code}`);
    });
  }, [socket, connected, creating, name, avatar, router]);

  if (creating) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-purple-500 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Creating your room...</p>
        </div>
      </main>
    );
  }

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
              <User className="w-8 h-8 text-purple-400" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Create a Room</h1>
            <p className="text-muted-foreground text-sm">
              Enter your name, pick an avatar, and start a new game.
            </p>
          </div>

          <div className="space-y-6">
            <Input
              placeholder="Your display name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              autoFocus
              className="text-center text-lg h-12"
            />

            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" /> Choose your avatar
              </p>
              <AvatarPicker value={avatar} onChange={setAvatar} />
            </div>

            <Button
              className="w-full gap-2 h-12"
              disabled={!connected || !name.trim() || !avatar}
              onClick={handleCreate}
            >
              <Play className="w-4 h-4" /> Create Room
            </Button>
            {!connected && (
              <p className="text-xs text-muted-foreground text-center">
                Connecting to server...
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </main>
  );
}
