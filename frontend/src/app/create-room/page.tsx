'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Music, ArrowRight, Sparkles, ListMusic, Gamepad2, Zap, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Navbar } from '@/components/home/Navbar';

const gameModes = [
  { id: 'CLASSIC', label: 'Classic', desc: 'Guess the song title from a short clip', icon: Music, color: 'text-purple-400 bg-purple-500/10' },
  { id: 'ARTIST', label: 'Artist', desc: 'Name the artist performing the song', icon: Gamepad2, color: 'text-blue-400 bg-blue-500/10' },
  { id: 'ALBUM', label: 'Album', desc: 'Identify the album from the cover art', icon: ListMusic, color: 'text-green-400 bg-green-500/10' },
  { id: 'LYRICS', label: 'Lyrics', desc: 'Complete the missing lyrics', icon: Sparkles, color: 'text-yellow-400 bg-yellow-500/10' },
  { id: 'GENRE', label: 'Genre', desc: 'Classify the song by genre', icon: PartyPopper, color: 'text-pink-400 bg-pink-500/10' },
  { id: 'DECADE', label: 'Decade', desc: 'Guess which decade the song is from', icon: Zap, color: 'text-orange-400 bg-orange-500/10' },
];

interface RoomConfig {
  name: string;
  mode: string;
  maxPlayers: number;
  rounds: number;
  guessTime: number;
  isPrivate: boolean;
}

function FloatingNote() {
  return (
    <motion.div
      className="hidden md:block absolute text-purple-500/10"
      animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <Music className="w-16 h-16" />
    </motion.div>
  );
}

export default function CreateRoomPage() {
  const router = useRouter();
  const [config, setConfig] = useState<RoomConfig>({
    name: '', mode: 'CLASSIC', maxPlayers: 8, rounds: 10, guessTime: 20, isPrivate: false,
  });

  const update = (key: keyof RoomConfig, value: any) => setConfig(prev => ({ ...prev, [key]: value }));

  const handleCreate = () => {
    router.push(`/room/CREATE?mode=${config.mode}&rounds=${config.rounds}&guessTime=${config.guessTime}&maxPlayers=${config.maxPlayers}&private=${config.isPrivate}&name=${encodeURIComponent(config.name)}`);
  };

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-20 pb-20 px-4 max-w-2xl mx-auto relative">
        <FloatingNote />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="text-gradient">Create Room</span>
          </h1>
          <p className="text-muted-foreground">Set up your custom music trivia game</p>
        </motion.div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Room Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input label="Room Name" placeholder="My Awesome Game" value={config.name} onChange={e => update('name', e.target.value)} maxLength={30} />
              <div className="flex items-center gap-2">
                <Input label="Rounds" type="number" min={3} max={30} value={config.rounds} onChange={e => update('rounds', parseInt(e.target.value) || 10)} />
                <Input label="Guess Time (s)" type="number" min={5} max={60} value={config.guessTime} onChange={e => update('guessTime', parseInt(e.target.value) || 20)} />
              </div>
              <div className="flex items-center gap-2">
                <Input label="Max Players" type="number" min={2} max={20} value={config.maxPlayers} onChange={e => update('maxPlayers', parseInt(e.target.value) || 8)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Game Mode</CardTitle>
              <CardDescription>Choose how you want to play</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {gameModes.map((mode) => {
                  const Icon = mode.icon;
                  const isActive = config.mode === mode.id;
                  return (
                    <motion.button
                      key={mode.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => update('mode', mode.id)}
                      className={`relative rounded-xl p-4 text-left transition-all duration-200 ${isActive ? 'bg-primary/20 border-2 border-primary ring-1 ring-primary/50' : 'glass border border-white/5 hover:border-white/20'}`}
                      aria-pressed={isActive}
                    >
                      <div className={`w-10 h-10 rounded-lg ${mode.color} flex items-center justify-center mb-3`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-semibold text-sm mb-1">{mode.label}</h3>
                      <p className="text-xs text-muted-foreground">{mode.desc}</p>
                    </motion.button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Button variant="gradient" size="xl" fullWidth onClick={handleCreate} icon={<ArrowRight className="w-5 h-5" />}>
            Create Room
          </Button>
        </div>
      </div>
    </main>
  );
}
