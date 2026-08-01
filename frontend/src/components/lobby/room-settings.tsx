'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Save, RotateCcw, Globe, Lock, Users, Clock, ListOrdered, Music, Gamepad2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { GameSettings, GAME_MODES } from '@/types';

interface RoomSettingsPanelProps {
  settings: GameSettings;
  onUpdate: (settings: Partial<GameSettings>) => void;
  isHost: boolean;
}

const DIFFICULTIES = [
  { value: 'easy', label: 'Easy', color: 'text-green-400' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-400' },
  { value: 'hard', label: 'Hard', color: 'text-red-400' },
];

const CATEGORIES = [
  { value: 'any', label: 'Any', icon: '🎲' },
  { value: 'pop', label: 'Pop', icon: '🎵' },
  { value: 'rock', label: 'Rock', icon: '🎸' },
  { value: 'hip-hop', label: 'Hip Hop', icon: '🎤' },
  { value: 'trending-english', label: 'Trending English', icon: '🔥' },
  { value: 'trending-india', label: 'Trending India', icon: '📈' },
  { value: 'hits-2020s', label: '2020s Popular Songs', icon: '✨' },
  { value: 'hits-2015', label: '2015 Popular Songs', icon: '🕺' },
  { value: 'hits-2010-26', label: '2010-26 Popular', icon: '🕰️' },
  { value: 'tiktok', label: 'TikTok Popular Songs', icon: '📱' },
];

export function RoomSettingsPanel({ settings, onUpdate, isHost }: RoomSettingsPanelProps) {
  const [localSettings, setLocalSettings] = useState<GameSettings>({ ...settings });
  const [isChanged, setIsChanged] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');

  const handleChange = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
    setIsChanged(true);
  };

  const handleSave = () => {
    onUpdate(localSettings);
    setIsChanged(false);
  };

  const handleReset = () => {
    setLocalSettings({ ...settings });
    setIsChanged(false);
  };

  if (!isHost) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-4"
      >
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-semibold">Room Settings</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-secondary/30 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">Mode</p>
            <p className="text-sm font-semibold mt-1 capitalize">
              {GAME_MODES.find((m) => m.mode === localSettings.mode)?.label || localSettings.mode}
            </p>
          </div>
          <div className="bg-secondary/30 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">Rounds</p>
            <p className="text-sm font-semibold mt-1">{localSettings.rounds}</p>
          </div>
          <div className="bg-secondary/30 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">Guess Time</p>
            <p className="text-sm font-semibold mt-1">{localSettings.guessTime}s</p>
          </div>
          <div className="bg-secondary/30 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">Category</p>
            <p className="text-sm font-semibold mt-1 capitalize">{localSettings.category || 'Any'}</p>
          </div>
          <div className="bg-secondary/30 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">Difficulty</p>
            <p className="text-sm font-semibold mt-1 capitalize">{localSettings.difficulty}</p>
          </div>
          <div className="bg-secondary/30 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">Max Players</p>
            <p className="text-sm font-semibold mt-1">{localSettings.maxPlayers}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-semibold">Room Settings</h3>
        </div>
        <AnimatePresence>
          {isChanged && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex gap-1"
            >
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleReset}>
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
              <Button size="sm" className="h-7 gap-1 text-xs" onClick={handleSave}>
                <Save className="w-3.5 h-3.5" /> Save
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1 custom-scroll">
        <div>
          <label className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <Gamepad2 className="w-3.5 h-3.5" /> Game Mode
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {GAME_MODES.map((gm) => (
              <button
                key={gm.mode}
                onClick={() => handleChange('mode', gm.mode)}
                className={`text-left px-2.5 py-2 rounded-lg text-xs transition-all ${
                  localSettings.mode === gm.mode
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'bg-secondary/30 text-muted-foreground border border-transparent hover:bg-secondary/50'
                }`}
              >
                <span className="mr-1.5">{gm.icon}</span>
                {gm.label}
              </button>
            ))}
          </div>
        </div>

        <Separator className="opacity-30" />

        <div>
          <label className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <ListOrdered className="w-3.5 h-3.5" /> Number of Rounds
          </label>
          <div className="flex gap-1">
            {[3, 5, 10, 15, 20].map((n) => (
              <Button
                key={n}
                variant={localSettings.rounds === n ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleChange('rounds', n)}
                className="flex-1 text-xs h-8"
              >
                {n}
              </Button>
            ))}
          </div>
        </div>

        <Separator className="opacity-30" />

        <div>
          <label className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Guess Time
          </label>
          <div className="flex gap-1">
            {[20, 30].map((t) => (
              <Button
                key={t}
                variant={localSettings.guessTime === t ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleChange('guessTime', t)}
                className="flex-1 text-xs h-8"
              >
                {t}s
              </Button>
            ))}
          </div>
        </div>

        <Separator className="opacity-30" />

        <div>
          <label className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <Music className="w-3.5 h-3.5" /> Music Category
          </label>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleChange('category', cat.value)}
                className={`px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                  localSettings.category === cat.value
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'bg-secondary/30 text-muted-foreground border border-transparent hover:bg-secondary/50'
                }`}
              >
                <span className="mr-1">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <Separator className="opacity-30" />

        <div>
          <label className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Difficulty
          </label>
          <div className="flex gap-1">
            {DIFFICULTIES.map((d) => (
              <Button
                key={d.value}
                variant={localSettings.difficulty === d.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleChange('difficulty', d.value)}
                className="flex-1 text-xs h-8"
              >
                <span className={localSettings.difficulty === d.value ? '' : d.color}>{d.label}</span>
              </Button>
            ))}
          </div>
        </div>

        <Separator className="opacity-30" />

        <div>
          <label className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> Max Players
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={2}
              max={16}
              value={localSettings.maxPlayers}
              onChange={(e) => handleChange('maxPlayers', parseInt(e.target.value))}
              className="flex-1 h-2 rounded-full appearance-none bg-secondary cursor-pointer accent-purple-500"
            />
            <Badge variant="secondary" className="w-10 text-center justify-center">
              {localSettings.maxPlayers}
            </Badge>
          </div>
        </div>

        <Separator className="opacity-30" />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs text-muted-foreground flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" /> Public Room
            </label>
            <Switch
              checked={!localSettings.isPrivate}
              onCheckedChange={(checked) => handleChange('isPrivate', !checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-xs text-muted-foreground flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> Allow Spectators
            </label>
            <Switch
              checked={localSettings.allowSpectators}
              onCheckedChange={(checked) => handleChange('allowSpectators', checked)}
            />
          </div>

          {localSettings.isPrivate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-center gap-2"
            >
              <Lock className="w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Room password..."
                value={passwordValue}
                onChange={(e) => setPasswordValue(e.target.value)}
                className="h-8 text-xs flex-1"
                type="password"
              />
              {passwordValue && (
                <Button
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => {
                    handleChange('isPrivate', true);
                    setPasswordValue('');
                  }}
                >
                  Set
                </Button>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}


