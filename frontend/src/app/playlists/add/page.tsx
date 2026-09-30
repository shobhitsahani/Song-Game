'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Search, AudioLines, ArrowLeft, LoaderCircle } from 'lucide-react';
import { Navbar } from '@/components/home/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function AddPlaylistPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [importing, setImporting] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { router.push('/'); return; }
  }, [user]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const data = await api.playlists.search(query.trim());
      setResults(data);
    } catch { toast.error('Search failed'); }
    finally { setSearching(false); }
  };

  const handleImport = async (playlistId: string) => {
    setImporting(playlistId);
    try {
      await api.playlists.import(playlistId);
      toast.success('Playlist imported!');
      router.push('/playlists');
    } catch { toast.error('Import failed'); }
    finally { setImporting(null); }
  };

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 px-4 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Button variant="ghost" className="mb-4" onClick={() => router.push('/playlists')}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Playlists
          </Button>
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-gradient">Import Playlist</span>
          </h1>
          <p className="text-muted-foreground mb-8">Search Deezer playlists to import</p>

          <div className="flex gap-2 mb-8">
            <Input
              placeholder="Search for a playlist..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={!query.trim() || searching}>
              {searching ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search
            </Button>
          </div>

          {searching && (
            <div className="text-center py-12">
              <LoaderCircle className="w-8 h-8 animate-spin text-violet-400 mx-auto" />
              <p className="text-muted-foreground mt-2">Searching...</p>
            </div>
          )}

          {!searching && results.length === 0 && query && (
            <div className="text-center py-12">
              <AudioLines className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No playlists found. Try a different search.</p>
            </div>
          )}

          <div className="space-y-3">
            {results.map((pl, i) => (
              <motion.div key={pl.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-lg bg-secondary shrink-0 overflow-hidden">
                      {pl.image ? <img src={pl.image} alt={pl.name} className="w-full h-full object-cover" /> : <AudioLines className="w-6 h-6 text-muted-foreground m-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{pl.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {pl.ownerName} &middot; {pl.trackCount || 0} tracks
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleImport(pl.id)}
                      loading={importing === pl.id}
                      disabled={importing !== null}
                    >
                      Import
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
