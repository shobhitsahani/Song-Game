'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
  Play,
  User,
  Sparkle,
  CircleNotch,
  Sliders,
  MagnifyingGlass,
  CalendarBlank,
  Gauge,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { AvatarPicker } from '@/components/avatar-picker';
import { GlassSurface } from '@/components/glass/glass-surface';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import { useSocket } from '@/providers/socket-provider';

const ALL_GENRES = [
  'Any Mixed',
  'Pop Hits',
  'Classic Rock',
  'Hip-Hop',
  'R&B / Soul',
  'Indie / Alternative',
  'Electronic / Dance',
  '2010s-2020s',
  'TikTok Viral',
  '80s Synthwave',
  '90s Grunge',
  'Jazz & Chill',
];

const DECADES = ['All Time', '80s', '90s', '2000s', '2010s', '2020s'];
const DIFFICULTIES = ['Normal', 'Hardcore', 'Survival'];

export default function CreateRoomPage() {
  const router = useRouter();
  const { socket, connected } = useSocket();
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [rounds, setRounds] = useState(10);
  const [selectedGenre, setSelectedGenre] = useState('Any Mixed');
  const [selectedDecade, setSelectedDecade] = useState('All Time');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Normal');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [openCommand, setOpenCommand] = useState(false);
  const createTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpenCommand((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
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
    <main className="min-h-screen flex items-center justify-center p-4 pt-20 pb-32">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-xl w-full"
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

          <div className="space-y-6">
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

            {/* Genre Preference with Command Search Shortcut */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders size={14} className="text-[var(--accent)]" /> Genre Preset
                </label>
                <button
                  type="button"
                  onClick={() => setOpenCommand(true)}
                  className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] bg-[var(--glass-bg)] border border-[var(--glass-border)] px-2.5 py-1 rounded-xl transition-colors"
                >
                  <MagnifyingGlass size={12} />
                  <span>Search</span>
                  <kbd className="font-mono text-[10px] bg-[var(--secondary)] px-1.5 py-0.5 rounded border border-[var(--glass-border)]">
                    Cmd+K
                  </kbd>
                </button>
              </div>

              <ToggleGroup
                type="single"
                value={selectedGenre}
                onValueChange={(val) => val && setSelectedGenre(val)}
                className="justify-start gap-1.5"
                spacing="compact"
              >
                {ALL_GENRES.slice(0, 6).map((genre) => (
                  <ToggleGroupItem
                    key={genre}
                    value={genre}
                    size="sm"
                    className="text-xs rounded-xl h-8 px-3"
                  >
                    {genre}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            {/* Decade Selection */}
            <div>
              <label className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CalendarBlank size={14} className="text-[var(--primary)]" /> Era / Decade
              </label>
              <ToggleGroup
                type="single"
                value={selectedDecade}
                onValueChange={(val) => val && setSelectedDecade(val)}
                className="justify-start gap-1.5"
                spacing="compact"
              >
                {DECADES.map((decade) => (
                  <ToggleGroupItem
                    key={decade}
                    value={decade}
                    size="sm"
                    className="text-xs rounded-xl h-8 px-3"
                  >
                    {decade}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            {/* Difficulty Mode */}
            <div>
              <label className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Gauge size={14} className="text-[var(--destructive)]" /> Difficulty
              </label>
              <ToggleGroup
                type="single"
                value={selectedDifficulty}
                onValueChange={(val) => val && setSelectedDifficulty(val)}
                className="justify-start gap-1.5"
                spacing="compact"
              >
                {DIFFICULTIES.map((diff) => (
                  <ToggleGroupItem
                    key={diff}
                    value={diff}
                    size="sm"
                    className="text-xs rounded-xl h-8 px-3"
                  >
                    {diff}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
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
          </div>
        </GlassSurface>

        {/* Sticky Bottom CTA Summary Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-30 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] pointer-events-none">
          <div className="max-w-xl mx-auto pointer-events-auto">
            <GlassSurface
              variant="strong"
              radius="xl"
              className="p-3 sm:p-4 shadow-2xl backdrop-blur-2xl border border-[var(--glass-border)] flex flex-col sm:flex-row items-center justify-between gap-3"
            >
              <div className="text-center sm:text-left text-xs">
                <div className="font-bold text-[var(--foreground)] flex items-center gap-1.5 justify-center sm:justify-start">
                  <span>{selectedGenre}</span>
                  <span className="text-[var(--muted-foreground)]">•</span>
                  <span>{selectedDecade}</span>
                  <span className="text-[var(--muted-foreground)]">•</span>
                  <span>{selectedDifficulty}</span>
                </div>
                <div className="text-[var(--muted-foreground)] text-[11px]">
                  {rounds} tracks • Ready to play
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto min-w-[200px] h-12 font-bold shadow-xl shrink-0"
                disabled={!connected || !name.trim() || !avatar}
                onClick={handleCreate}
              >
                <Play size={18} weight="fill" /> Start Round
              </Button>
            </GlassSurface>
            {createError && (
              <p className="text-xs text-[var(--destructive)] text-center mt-2 font-medium">
                {createError}
              </p>
            )}
          </div>
        </div>

        {/* Genre & Artist Command Palette (Cmd+K) */}
        <CommandDialog open={openCommand} onOpenChange={setOpenCommand}>
          <CommandInput placeholder="Search genres or music eras..." />
          <CommandList>
            <CommandEmpty>No matching genres found.</CommandEmpty>
            <CommandGroup heading="Genres">
              {ALL_GENRES.map((g) => (
                <CommandItem
                  key={g}
                  onSelect={() => {
                    setSelectedGenre(g);
                    setOpenCommand(false);
                  }}
                >
                  <Sliders className="mr-2 h-4 w-4 text-[var(--accent)]" />
                  <span>{g}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Eras & Decades">
              {DECADES.map((d) => (
                <CommandItem
                  key={d}
                  onSelect={() => {
                    setSelectedDecade(d);
                    setOpenCommand(false);
                  }}
                >
                  <CalendarBlank className="mr-2 h-4 w-4 text-[var(--primary)]" />
                  <span>{d}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </motion.div>
    </main>
  );
}
