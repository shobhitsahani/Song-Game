'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { ArrowRight, User, Sparkle } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AvatarPicker } from '@/components/avatar-picker';
import { GlassSurface } from '@/components/glass/glass-surface';

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
    try {
      localStorage.setItem('last_room_code', code.trim().toUpperCase());
    } catch {}
    router.push(`/room/${code.trim().toUpperCase()}?${params.toString()}`);
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 pt-20 pb-28">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-md w-full"
      >
        <GlassSurface variant="strong" radius="xl" className="p-6 sm:p-8 shadow-2xl backdrop-blur-2xl">
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-[var(--foreground)] mb-1">
              Join a Room
            </h1>
            <p className="text-[var(--muted-foreground)] text-sm">
              Enter your room code and choose your identity.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="join-code" className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2 block">
                Room Code
              </label>
              <Input
                id="join-code"
                placeholder="ABC123"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                className="text-center text-2xl font-mono font-bold tracking-[0.25em] h-14"
                maxLength={6}
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="join-name" className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <User size={14} className="text-[var(--primary)]" /> Display Name
              </label>
              <Input
                id="join-name"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                maxLength={20}
                className="text-center text-lg font-semibold h-12"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkle size={14} className="text-[var(--primary)]" /> Avatar
              </label>
              <AvatarPicker value={avatar} onChange={setAvatar} />
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full h-14 font-bold shadow-xl mt-2"
              disabled={!canJoin}
              onClick={handleJoin}
            >
              Join Room <ArrowRight size={20} weight="bold" />
            </Button>
          </div>
        </GlassSurface>
      </motion.div>
    </main>
  );
}
