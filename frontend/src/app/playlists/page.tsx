'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Music, Plus, ArrowLeft, Heart, Trash2 } from 'lucide-react';
import { Navbar } from '@/components/home/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function PlaylistsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push('/'); return; }
    api.playlists.list().then(setPlaylists).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  const handleToggleFavorite = async (playlistId: string) => {
    try {
      await api.playlists.toggleFavorite(playlistId);
      setPlaylists(prev => prev.map(p => p.id === playlistId ? { ...p, isFavorite: !p.isFavorite } : p));
    } catch {}
  };

  const handleRemove = async (playlistId: string) => {
    try {
      await api.playlists.remove(playlistId);
      setPlaylists(prev => prev.filter(p => p.id !== playlistId));
    } catch {}
  };

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 px-4 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <Button variant="ghost" className="mb-2" onClick={() => router.push('/')}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <h1 className="text-4xl font-bold">
                <span className="text-gradient">My Playlists</span>
              </h1>
              <p className="text-muted-foreground mt-1">{playlists.length} playlist{playlists.length !== 1 ? 's' : ''}</p>
            </div>
            <Link href="/playlists/add">
              <Button className="gap-2">
                <Plus className="w-4 h-4" /> Import Playlist
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1,2,3,4].map(i => (
                <Card key={i}>
                  <CardContent className="p-4 flex gap-4">
                    <div className="w-16 h-16 rounded-lg bg-secondary animate-pulse shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-secondary animate-pulse rounded w-3/4" />
                      <div className="h-3 bg-secondary animate-pulse rounded w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : playlists.length === 0 ? (
            <div className="text-center py-16">
              <Music className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No playlists yet</h3>
              <p className="text-muted-foreground mb-6">Import your Deezer playlists to use in games</p>
              <Link href="/playlists/add">
                <Button className="gap-2"><Plus className="w-4 h-4" /> Import from Deezer</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {playlists.map((pl, i) => (
                <motion.div key={pl.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card>
                    <CardContent className="p-4 flex gap-4">
                      <div className="w-16 h-16 rounded-lg bg-secondary shrink-0 overflow-hidden">
                        {pl.image ? <img src={pl.image} alt={pl.name} className="w-full h-full object-cover" /> : <Music className="w-8 h-8 text-muted-foreground m-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">{pl.name}</h3>
                        {pl.ownerName && <p className="text-xs text-muted-foreground">{pl.ownerName}</p>}
                        <p className="text-xs text-muted-foreground">{pl.trackCount || 0} tracks</p>
                        <div className="flex gap-2 mt-2">
                          <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => handleToggleFavorite(pl.id)}>
                            <Heart className={`w-3.5 h-3.5 ${pl.isFavorite ? 'fill-red-400 text-red-400' : ''}`} />
                          </Button>
                          <Button variant="ghost" size="icon" className="w-7 h-7 text-red-400" onClick={() => handleRemove(pl.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
