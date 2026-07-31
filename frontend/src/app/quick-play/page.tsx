'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Swords, Loader2, Users, Clock, ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/home/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth';
import { useSocket } from '@/hooks/useSocket';

export default function QuickPlayPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { socket, connected } = useSocket();
  const [status, setStatus] = useState<'idle' | 'searching' | 'found'>('idle');
  const [queueSize, setQueueSize] = useState(0);
  const [searchTime, setSearchTime] = useState(0);

  useEffect(() => {
    if (!user) { router.push('/'); return; }
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    socket.on('room:joined', (data: { code: string }) => {
      setStatus('found');
      setTimeout(() => router.push(`/room/${data.code}`), 500);
    });

    socket.on('matchmaking:queued', (data: { position: number; queueSize: number }) => {
      setQueueSize(data.queueSize);
    });

    socket.on('error', (err: { message: string }) => {
      setStatus('idle');
    });

    return () => {
      socket.off('room:joined');
      socket.off('matchmaking:queued');
      socket.off('error');
    };
  }, [socket, router]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === 'searching') {
      timer = setInterval(() => setSearchTime(t => t + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [status]);

  const handleQuickMatch = useCallback(() => {
    if (!socket || !connected) return;
    setStatus('searching');
    setSearchTime(0);
    socket.emit('room:quick-match');
  }, [socket, connected]);

  const handleCancel = useCallback(() => {
    if (socket) socket.emit('matchmaking:leave');
    setStatus('idle');
    setSearchTime(0);
  }, [socket]);

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 px-4 max-w-md mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Button variant="ghost" className="mb-4" onClick={() => router.push('/')}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>

          <Card className="text-center py-12">
            <CardContent>
              {status === 'idle' && (
                <>
                  <Swords className="w-16 h-16 text-purple-400 mx-auto mb-6" />
                  <h1 className="text-3xl font-bold mb-2">Quick Match</h1>
                  <p className="text-muted-foreground mb-8">Find a game instantly</p>
                  <Button size="xl" className="w-full gap-2" onClick={handleQuickMatch} disabled={!connected}>
                    <Swords className="w-5 h-5" />
                    Find Match
                  </Button>
                </>
              )}

              {status === 'searching' && (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="w-16 h-16 mx-auto mb-6"
                  >
                    <Loader2 className="w-16 h-16 text-purple-400" />
                  </motion.div>
                  <h1 className="text-2xl font-bold mb-2">Searching...</h1>
                  <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mb-6">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{searchTime}s</span>
                    {queueSize > 0 && <span className="flex items-center gap-1"><Users className="w-4 h-4" />{queueSize} in queue</span>}
                  </div>
                  <Button variant="outline" className="w-full" onClick={handleCancel}>Cancel</Button>
                </>
              )}

              {status === 'found' && (
                <>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mb-6">
                    <Swords className="w-16 h-16 text-green-400 mx-auto" />
                  </motion.div>
                  <h1 className="text-2xl font-bold mb-2">Match Found!</h1>
                  <p className="text-muted-foreground">Joining game...</p>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
