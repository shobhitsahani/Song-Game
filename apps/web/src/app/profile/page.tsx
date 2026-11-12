'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
  Trophy,
  GameController,
  Target,
  Fire,
  Star,
  MusicNotes,
  SignOut,
  SpeakerHigh,
  DeviceMobile,
  Cube,
  EyeSlash,
} from '@phosphor-icons/react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { formatXp } from '@/lib/utils';
import { getLevelProgress } from '@song-game/shared';
import type { UserStats } from '@song-game/types';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { GlassSurface } from '@/components/glass/glass-surface';
import { ThemeSwitcher } from '@/components/glass/theme-switcher';
import { soundFx } from '@/lib/sound-fx';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuthStore();
  const [data, setData] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);

  // Settings states
  const [soundEnabled, setSoundEnabled] = useState(soundFx.isEnabled());
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [lowPower3D, setLowPower3D] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHapticsEnabled(localStorage.getItem('haptics-enabled') !== 'false');
      setLowPower3D(localStorage.getItem('low-power-3d') === 'true');
      setReducedMotion(localStorage.getItem('reduced-motion-override') === 'true');
    }

    if (isAuthenticated) {
      setLoading(true);
      api.users
        .stats()
        .then((res) => {
          if (res.success) setData(res.data);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isAuthenticated]);

  const toggleSound = (val: boolean) => {
    setSoundEnabled(val);
    soundFx.setEnabled(val);
  };

  const toggleHaptics = (val: boolean) => {
    setHapticsEnabled(val);
    localStorage.setItem('haptics-enabled', val ? 'true' : 'false');
    if (val && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(25);
    }
  };

  const toggleLowPower = (val: boolean) => {
    setLowPower3D(val);
    localStorage.setItem('low-power-3d', val ? 'true' : 'false');
  };

  const toggleReducedMotion = (val: boolean) => {
    setReducedMotion(val);
    localStorage.setItem('reduced-motion-override', val ? 'true' : 'false');
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (authLoading || loading) {
    return (
      <main className="min-h-screen pt-24 pb-28 px-4 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-48 mb-8 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded-2xl md:col-span-1" />
          <Skeleton className="h-64 rounded-2xl md:col-span-2" />
        </div>
      </main>
    );
  }

  const stats = data;
  const levelInfo = stats ? getLevelProgress(stats.xp) : null;
  const xpToNext = levelInfo?.nextLevelXP || 1000;
  const xpInLevel = levelInfo?.currentXP || 0;
  const level = stats?.level ?? levelInfo?.level ?? 1;

  return (
    <main className="min-h-screen pb-28 pt-24 px-4 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {/* User Card */}
        <GlassSurface variant="strong" radius="xl" className="p-6 md:p-8 shadow-2xl backdrop-blur-2xl">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar
              src={user?.avatar}
              alt={user?.username || 'Guest'}
              fallback={user?.username?.[0] ?? '?'}
              size="xl"
              className="w-20 h-20 sm:w-24 sm:h-24 ring-2 ring-[var(--glass-border)]"
            />
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-[var(--foreground)] tracking-tight">
                {user?.displayName || user?.username || 'Music Guest'}
              </h1>
              <p className="text-sm font-mono text-[var(--muted-foreground)] mt-0.5">
                @{user?.username || 'guest'}
              </p>

              <div className="mt-4 space-y-2 max-w-md">
                <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] font-semibold">
                  <span className="flex items-center gap-1.5 text-[var(--foreground)]">
                    <Star size={16} weight="fill" className="text-amber-400" /> Level {level}
                  </span>
                  <span className="font-mono">
                    {formatXp(xpInLevel)} / {formatXp(xpToNext)} XP
                  </span>
                </div>
                <Progress value={(xpInLevel / xpToNext) * 100} className="h-2.5" />
              </div>

              <div className="flex flex-wrap gap-2 mt-5 justify-center sm:justify-start">
                <Badge variant="default" className="gap-1.5 py-1 px-3">
                  <Trophy size={14} weight="fill" className="text-amber-400" /> {stats?.wins ?? 0} Wins
                </Badge>
                <Badge variant="default" className="gap-1.5 py-1 px-3">
                  <GameController size={14} weight="duotone" className="text-[var(--primary)]" />{' '}
                  {stats?.totalGames ?? 0} Games
                </Badge>
                <Badge variant="default" className="gap-1.5 py-1 px-3">
                  <MusicNotes size={14} weight="duotone" className="text-[var(--accent)]" />{' '}
                  {stats?.correctAnswers ?? 0} Guesses
                </Badge>
              </div>

              {isAuthenticated && (
                <div className="mt-6">
                  <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1.5 text-xs text-[var(--destructive)]">
                    <SignOut size={16} /> Sign Out
                  </Button>
                </div>
              )}
            </div>
          </div>
        </GlassSurface>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {[
            { icon: Trophy, label: 'Total Wins', value: stats?.wins ?? 0, color: 'text-amber-400' },
            { icon: GameController, label: 'Played', value: stats?.totalGames ?? 0, color: 'text-[var(--primary)]' },
            {
              icon: Target,
              label: 'Win Rate',
              value: stats?.totalGames ? `${Math.round((stats.wins / stats.totalGames) * 100)}%` : '0%',
              color: 'text-[var(--success)]',
            },
            { icon: Fire, label: 'Best Streak', value: stats?.longestStreak ?? 0, color: 'text-amber-500' },
          ].map((s) => (
            <GlassSurface key={s.label} variant="regular" radius="lg" className="p-4 text-center">
              <s.icon size={26} weight="duotone" className={`mx-auto mb-2 ${s.color}`} />
              <p className="text-2xl font-black font-mono tabular-nums text-[var(--foreground)]">{s.value}</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{s.label}</p>
            </GlassSurface>
          ))}
        </div>

        {/* Settings & Accessibility Preferences */}
        <GlassSurface variant="regular" radius="xl" className="p-6 md:p-8 space-y-6">
          <div>
            <h2 className="text-lg font-bold font-display text-[var(--foreground)] tracking-tight mb-1">
              Settings & Preferences
            </h2>
            <p className="text-xs text-[var(--muted-foreground)]">
              Customize theme, audio synthesis, motion, and hardware performance.
            </p>
          </div>

          <div className="divide-y divide-[var(--glass-border)]">
            {/* Theme switcher */}
            <div className="py-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">Theme</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Vinyl (black), Rose (dark berry), or Daylight (light)
                </p>
              </div>
              <ThemeSwitcher />
            </div>

            {/* UI Sounds Toggle */}
            <div className="py-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                  <SpeakerHigh size={16} className="text-[var(--primary)]" /> UI Synthesizer Sounds
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Chimes on correct answers and clock ticks (off by default)
                </p>
              </div>
              <Switch checked={soundEnabled} onCheckedChange={toggleSound} aria-label="Toggle UI sounds" />
            </div>

            {/* Haptics */}
            <div className="py-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                  <DeviceMobile size={16} className="text-[var(--accent)]" /> Mobile Haptics
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Subtle vibration pulse on answer taps and round ends
                </p>
              </div>
              <Switch checked={hapticsEnabled} onCheckedChange={toggleHaptics} aria-label="Toggle haptics" />
            </div>

            {/* 3D Low Power */}
            <div className="py-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                  <Cube size={16} className="text-amber-400" /> Low Power 3D Mode
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Fall back to 2D CSS vinyl for battery and older devices
                </p>
              </div>
              <Switch checked={lowPower3D} onCheckedChange={toggleLowPower} aria-label="Toggle 3D low power mode" />
            </div>

            {/* Reduced Motion Override */}
            <div className="py-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                  <EyeSlash size={16} className="text-[var(--muted-foreground)]" /> Reduced Motion Override
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Disable vinyl spinning, orb drift, and shake animations
                </p>
              </div>
              <Switch checked={reducedMotion} onCheckedChange={toggleReducedMotion} aria-label="Toggle reduced motion override" />
            </div>
          </div>
        </GlassSurface>
      </motion.div>
    </main>
  );
}
