'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Play, User, Sparkle, CircleNotch, Sliders } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { AvatarPicker } from '@/components/avatar-picker';
import { GlassSurface } from '@/components/glass/glass-surface';
import { useSocket } from '@/providers/socket-provider';

const GENRE_CHIPS = ['Any Mixed', 'Pop Hits', 'Classic Rock', 'Hip-Hop', '2010s-2020s', 'TikTok Viral'];

export default function CreateRoomPage() {
  const router = useRouter();
  const { socket, connected, error } = useSocket();
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [rounds, setRounds] = useState(10);
  const [selectedGenre, setSelectedGenre] = useState('Any Mixed');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState('');
  const createTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (createTimeoutRef.current) clearTimeout(createTimeoutRef.current);
    };
  }, []);

  const handleCreate = useCallback(() => {
    if (!socket || !connected || creating) return;
    if (!name.trim() || !avatar) return;
    setCreating(true);
    setCreateError(null);

    socket.emit('room:create', { username: name.trim(), avatar });
    socket.once('room:joined', (room) => {
      try {
        localStorage.setItem('last_room_code', room.code);
      } catch {}
      router.push(`/room/${room.code}`);
    });

    createTimeoutRef.current = setTimeout(() => {
      setCreating(false);
      setCreateError('The server did not respond. Please try again.');
    }, 10000);
  }, [socket, connected, creating, name, avatar, router]);

  const filteredGenres = GENRE_CHIPS.filter((g) =>
    g.toLowerCase().includes(filterQuery.toLowerCase())
  );

  if (creating) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <GlassSurface variant="strong" radius="xl" className="p-8 text-center max-w-sm w-full">
          <CircleNotch size={40} className="text-[var(--primary)] animate-spin mx-auto mb-4" />
          <p className="text-[var(--foreground)] font-semibold text-lg font-display">
            Setting up your room...
          </p>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            Warming up audio tracks
          </p>
        </GlassSurface>
      </main>
    );
  }

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
              Create a Room
            </h1>
            <p className="text-[var(--muted-foreground)] text-sm">
              Tune your session and invite friends to compete.
            </p>
          </div>

          <div className="space-y-5">
            {/* Display Name Input */}
            <div>
              <label htmlFor="display-name" className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <User size={14} className="text-[var(--primary)]" /> Your Display Name
              </label>
              <Input
                id="display-name"
                placeholder="e.g. VinylJunkie"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={20}
                autoFocus
                className="text-center text-lg font-semibold h-12"
              />
            </div>

            {/* Avatar Selector */}
            <div>
              <label className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkle size={14} className="text-[var(--primary)]" /> Choose Avatar
              </label>
              <AvatarPicker value={avatar} onChange={setAvatar} />
            </div>

            {/* Genre Preference Chips */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders size={14} className="text-[var(--accent)]" /> Genre Preset
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search genres..."
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    className="text-xs py-1 px-2.5 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--ring)] w-28"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {filteredGenres.map((genre) => {
                  const active = selectedGenre === genre;
                  return (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => setSelectedGenre(genre)}
                      className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                        active
                          ? 'bg-[var(--primary)] text-[var(--primary-foreground)] border-transparent font-semibold shadow-sm'
                          : 'bg-[var(--glass-bg)] border-[var(--glass-border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                      }`}
                    >
                      {genre}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Round Length Slider */}
            <div>
              <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] mb-1">
                <span className="font-bold uppercase tracking-wider">Round Length</span>
                <span className="font-mono font-bold text-[var(--foreground)]">{rounds} tracks</span>
              </div>
              <Slider
                value={rounds}
                min={5}
                max={20}
                step={5}
                onChange={setRounds}
                aria-label="Round length in tracks"
              />
            </div>

            {/* Sticky Summary / Action CTA */}
            <div className="pt-2 border-t border-[var(--glass-border)]">
              <Button
                variant="primary"
                size="lg"
                className="w-full h-14 font-bold shadow-xl"
                disabled={!connected || !name.trim() || !avatar}
                onClick={handleCreate}
              >
                <Play size={20} weight="fill" /> Create Room ({rounds} rounds)
              </Button>

              {!connected && (
                <p className="text-xs text-[var(--muted-foreground)] text-center mt-2">
                  {error || 'Connecting to multiplayer server...'}
                </p>
              )}
              {createError && (
                <p className="text-xs text-[var(--destructive)] text-center mt-2 font-medium">
                  {createError}
                </p>
              )}
            </div>
          </div>
        </GlassSurface>
      </motion.div>
    </main>
  );
}
