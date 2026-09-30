'use client';

import { useState } from 'react';
import type { CSSProperties, ComponentType, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  AudioLines,
  ArrowRight,
  ListMusic,
  Disc3,
  Crown,
  Zap,
  PartyPopper,
  Lock,
  Globe,
  Users,
  Clock,
  Repeat,
  SlidersHorizontal,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Navbar } from '@/components/home/Navbar';
import { Logo } from '@/components/shared/Logo';
import { RoomModeSwitch } from '@/components/shared/RoomModeSwitch';
import { cn } from '@/lib/utils';

type IconType = ComponentType<{ className?: string; style?: CSSProperties }>;

const gameModes = [
  { id: 'CLASSIC', label: 'Classic', desc: 'Guess the song from a short clip', icon: AudioLines, accent: '#a78bfa', soft: 'bg-amber-500/15 text-amber-400' },
  { id: 'ARTIST', label: 'Artist', desc: 'Name the performer behind the track', icon: Crown, accent: '#60a5fa', soft: 'bg-blue-500/15 text-blue-400' },
  { id: 'ALBUM', label: 'Album', desc: 'Spot the album from its cover art', icon: Disc3, accent: '#34d399', soft: 'bg-emerald-500/15 text-emerald-400' },
  { id: 'LYRICS', label: 'Lyrics', desc: 'Complete the missing line', icon: ListMusic, accent: '#facc15', soft: 'bg-yellow-500/15 text-yellow-400' },
  { id: 'GENRE', label: 'Genre', desc: 'Tag the song by its genre', icon: Zap, accent: '#f472b6', soft: 'bg-pink-500/15 text-pink-400' },
  { id: 'DECADE', label: 'Decade', desc: 'Pin which decade released it', icon: PartyPopper, accent: '#fb923c', soft: 'bg-orange-500/15 text-orange-400' },
] as const;

type GameModeOption = (typeof gameModes)[number];

const EQ_BARS = [0.38, 0.75, 0.5, 1, 0.62, 0.88, 0.42];

const containerV = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const itemV = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 220, damping: 22 } },
};

interface RoomConfig {
  name: string;
  mode: string;
  maxPlayers: number;
  rounds: number;
  guessTime: number;
  isPrivate: boolean;
}

function AmbientGlow() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <div className="absolute -top-44 left-1/2 -translate-x-1/2 w-[44rem] h-[24rem] rounded-full bg-gold/15 blur-[130px] animate-float-slow" />
      <div className="absolute top-1/3 -left-40 w-96 h-96 rounded-full bg-ember/10 blur-[120px]" />
      <div className="absolute bottom-0 -right-32 w-[30rem] h-[30rem] rounded-full bg-mint/10 blur-[120px] animate-float-slow" />
    </div>
  );
}

function ModeOption({
  mode,
  active,
  onSelect,
}: {
  mode: GameModeOption;
  active: boolean;
  onSelect: () => void;
}) {
  const Icon = mode.icon;
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 350, damping: 22 }}
      className={cn(
        'relative text-left rounded-2xl border p-4 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 ring-ring',
        active
          ? 'bg-card/80'
          : 'liquid-flat hover:border-white/20',
      )}
    >
      {active && (
        <span
          className="pointer-events-none absolute inset-0 rounded-2xl"
          aria-hidden="true"
          style={{ boxShadow: `0 0 0 1px ${mode.accent}, 0 14px 34px ${mode.accent}26` }}
        />
      )}
      {active && (
        <span className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/90 text-background">
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </span>
      )}
      <div
        className={cn(
          'flex h-11 w-11 items-center justify-center rounded-xl shrink-0',
          mode.soft,
          active && 'scale-110',
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-3">
        <h3 className="text-sm font-semibold leading-tight text-foreground">{mode.label}</h3>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{mode.desc}</p>
      </div>
    </motion.button>
  );
}

function Fader({
  label,
  icon,
  min,
  max,
  value,
  suffix,
  onChange,
}: {
  label: string;
  icon: IconType;
  min: number;
  max: number;
  value: number;
  suffix: string;
  onChange: (value: number) => void;
}) {
  const Icon = icon;
  const pct = Math.round(((value - min) / (max - min)) * 100);
  return (
    <div className="liquid-flat rounded-2xl px-4 py-4">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Icon className="h-4 w-4 text-gold" />
          {label}
        </span>
        <span className="font-mono text-2xl font-bold tabular-nums text-foreground">
          {value}
          <span className="ml-1 text-xs text-muted-foreground">{suffix}</span>
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="range-fader mt-3"
        style={{ '--fill': `${pct}%` } as CSSProperties}
        aria-label={label}
      />
      <div className="mt-1 flex items-center justify-between text-[10px] tabular-nums text-muted-foreground">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

function PreviewRow({
  icon,
  label,
  value,
  tint,
}: {
  icon: IconType;
  label: string;
  value: string;
  tint?: string;
}) {
  const Icon = icon;
  return (
    <div className="flex items-center justify-between">
      <span className="inline-flex items-center gap-2.5 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" style={tint ? { color: tint } : undefined} />
        {label}
      </span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

function RoomPreview({ config, mode }: { config: RoomConfig; mode: GameModeOption }) {
  const Icon = mode.icon;
  return (
    <div className="liquid overflow-hidden rounded-3xl">
      <span aria-hidden className="liquid-shine" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-gold/12 via-transparent to-ember/8" />

      <div className="relative px-6 pt-6 flex items-center justify-between">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-ember opacity-60 animate-pulse" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-ember" />
          </span>
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Live room</span>
        </span>
        <div className="flex items-end gap-[3px]" aria-hidden="true">
          {EQ_BARS.map((h, i) => (
            <motion.span
              key={i}
              className="w-[3px] rounded-full"
              style={{ height: `${Math.round(h * 30)}px`, background: mode.accent, transformOrigin: 'bottom' }}
              animate={{ scaleY: [0.25, 1, 0.45, 0.85, 0.3] }}
              transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.09, ease: 'easeInOut' }}
            />
          ))}
        </div>
      </div>

      <div className="relative px-6 pt-5">
        <div className="flex items-center gap-3">
          <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl shrink-0', mode.soft)}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Your session</p>
            <h2 className="text-xl font-bold leading-tight text-foreground">
              {config.name.trim() || 'Untitled Session'}
            </h2>
          </div>
        </div>

        <Separator className="my-5" />

        <dl className="space-y-3 text-sm">
          <PreviewRow icon={mode.icon} label="Mode" value={mode.label} tint={mode.accent} />
          <PreviewRow icon={Repeat} label="Rounds" value={`${config.rounds} rounds`} />
          <PreviewRow icon={Clock} label="Guess time" value={`${config.guessTime}s each`} />
          <PreviewRow icon={Users} label="Players" value={`up to ${config.maxPlayers}`} />
          <PreviewRow
            icon={config.isPrivate ? Lock : Globe}
            label="Visibility"
            value={config.isPrivate ? 'Private' : 'Public'}
          />
        </dl>

        <div className="mt-5 flex items-center gap-2">
          <span className="h-7 w-1 rounded-full bg-gradient-to-b from-gold to-ember" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            You are the host. You set the rules — your friends bring the noise.
          </p>
        </div>
      </div>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  icon,
}: {
  eyebrow: string;
  title: string;
  icon: IconType;
}) {
  const Icon = icon;
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/10 text-gold">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</p>
        <h2 className="text-lg font-semibold leading-tight text-foreground">{title}</h2>
      </div>
    </div>
  );
}

export default function CreateRoomPage() {
  const router = useRouter();
  const [config, setConfig] = useState<RoomConfig>({
    name: '',
    mode: 'CLASSIC',
    maxPlayers: 8,
    rounds: 10,
    guessTime: 20,
    isPrivate: false,
  });

  const update = (key: keyof RoomConfig, value: unknown) =>
    setConfig((prev) => ({ ...prev, [key]: value }));

  const activeMode =
    gameModes.find((m) => m.id === config.mode) ?? (gameModes[0] as GameModeOption);

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    router.push(
      `/room/CREATE?mode=${config.mode}&rounds=${config.rounds}&guessTime=${config.guessTime}&maxPlayers=${config.maxPlayers}&private=${config.isPrivate}&name=${encodeURIComponent(config.name)}`,
    );
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Navbar />

      <div className="relative pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <AmbientGlow />

        {/* Header */}
        <motion.div
          variants={containerV}
          initial="hidden"
          animate="visible"
          className="relative mb-10 text-center"
        >
          <motion.div variants={itemV} className="mb-7 flex justify-center">
            <RoomModeSwitch active="create" />
          </motion.div>
          <motion.div variants={itemV} className="mb-6 flex justify-center">
            <Logo size="lg" glow />
          </motion.div>
          <motion.div variants={itemV}>
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/10 px-4 py-1.5 text-sm text-gold">
              <AudioLines className="h-4 w-4" />
              Host a session
            </span>
          </motion.div>
          <motion.h1
            variants={itemV}
            className="mt-4 font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground"
          >
            Set the{' '}
            <span className="text-gradient animate-gradient-shift bg-[length:200%_200%]">Stage</span>
          </motion.h1>
          <motion.p
            variants={itemV}
            className="mt-4 max-w-2xl mx-auto text-sm sm:text-base md:text-lg leading-relaxed text-muted-foreground"
          >
            Tune the room, then share the invite. Everything you dial in shows up in the preview —
            made for your crowd.
          </motion.p>
        </motion.div>

        {/* Game mode showcase */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' }}
          aria-labelledby="game-mode"
          className="relative liquid rounded-2xl p-6 mb-6"
        >
          <SectionHeading eyebrow="Pick a lane" title="Game mode" icon={SlidersHorizontal} />
          <p className="mt-1.5 text-sm text-muted-foreground">Choose how your crowd plays.</p>
          <div className="mt-5 grid grid-cols-2 md:grid-cols-3 gap-4">
            {gameModes.map((mode) => (
              <ModeOption
                key={mode.id}
                mode={mode}
                active={config.mode === mode.id}
                onSelect={() => update('mode', mode.id)}
              />
            ))}
          </div>
        </motion.section>

        <div className="relative grid gap-6 lg:grid-cols-5 items-start">
          {/* Config console */}
          <form onSubmit={handleCreate} className="lg:col-span-3 space-y-6">
            <section aria-labelledby="room-name" className="liquid rounded-2xl p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/10 text-gold">
                  <AudioLines className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Identity</p>
                  <h2 id="room-name" className="text-lg font-semibold leading-tight text-foreground">
                    Room name
                  </h2>
                </div>
              </div>
              <Input
                label="Room name"
                placeholder="e.g. Friday Night Spins"
                icon={<AudioLines className="h-4 w-4" />}
                value={config.name}
                onChange={(e) => update('name', e.target.value)}
                maxLength={30}
              />
            </section>

            <section aria-labelledby="tune" className="liquid rounded-2xl p-6">
              <SectionHeading eyebrow="Set the tempo" title="Tune the session" icon={SlidersHorizontal} />
              <p className="mt-1.5 text-sm text-muted-foreground">Push the faders to match your night.</p>
              <div className="mt-5 space-y-3">
                <Fader
                  label="Rounds"
                  icon={Repeat}
                  min={3}
                  max={30}
                  value={config.rounds}
                  suffix="rounds"
                  onChange={(v) => update('rounds', v)}
                />
                <Fader
                  label="Guess time"
                  icon={Clock}
                  min={5}
                  max={60}
                  value={config.guessTime}
                  suffix="sec"
                  onChange={(v) => update('guessTime', v)}
                />
                <Fader
                  label="Max players"
                  icon={Users}
                  min={2}
                  max={20}
                  value={config.maxPlayers}
                  suffix="players"
                  onChange={(v) => update('maxPlayers', v)}
                />
              </div>
            </section>

            <section aria-labelledby="privacy" className="liquid rounded-2xl p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Visibility</p>
                  <h2 id="privacy" className="text-sm font-semibold leading-tight text-foreground flex items-center gap-1.5">
                    {config.isPrivate ? (
                      <Lock className="h-3.5 w-3.5 shrink-0 text-gold" />
                    ) : (
                      <Globe className="h-3.5 w-3.5 shrink-0 text-gold" />
                    )}
                    {config.isPrivate ? 'Private room' : 'Public room'}
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {config.isPrivate
                      ? 'Invite-only. Friends find you by code.'
                      : 'Anyone can drop in from the lobby.'}
                  </p>
                </div>
                <Switch
                  checked={config.isPrivate}
                  onCheckedChange={(v) => update('isPrivate', v === true)}
                  aria-label="Private room"
                />
              </div>
            </section>

            <Button
              variant="gradient"
              size="xl"
              fullWidth
              onClick={handleCreate}
              className="liquid-btn"
              icon={<ArrowRight className="h-5 w-5" />}
            >
              Create Room
            </Button>
          </form>

          {/* Live preview */}
          <div className="lg:col-span-2 lg:sticky lg:top-24 self-start">
            <RoomPreview config={config} mode={activeMode} />
          </div>
        </div>
      </div>
    </main>
  );
}