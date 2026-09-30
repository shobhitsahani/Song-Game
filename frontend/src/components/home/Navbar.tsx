'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AudioLines, Menu, X, Users, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/providers/UserProvider';
import { useNotificationStore } from '@/store/notifications';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Notifications } from '@/components/shared/Notifications';
import Link from 'next/link';
import { useSocket } from '@/hooks/useSocket';

export function Navbar() {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const { loadUnreadCount } = useNotificationStore();
  const { socket } = useSocket();

  useEffect(() => {
    if (user) loadUnreadCount();
  }, [user]);

  useEffect(() => {
    if (!socket) return;
    const handleNotification = (notification: any) => {
      useNotificationStore.getState().addNotification(notification);
    };
    socket.on('notification:new', handleNotification);
    return () => {
      socket.off('notification:new', handleNotification);
    };
  }, [socket]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-6 pt-3 sm:pt-4">
      <div className="glass rounded-2xl max-w-6xl mx-auto h-14 px-3 sm:px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-[linear-gradient(120deg,hsl(262_84%_66%),hsl(292_84%_61%)_50%,hsl(217_91%_60%))] flex items-center justify-center shadow-lg shadow-violet-600/30 group-hover:scale-105 transition-transform">
            <AudioLines className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-[linear-gradient(100deg,#c7d2fe,#d8b4fe_55%,#f0abfc)]">SongGame</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          <Link href="/create-room">
            <Button variant="ghost" size="sm">Create Room</Button>
          </Link>
          <Link href="/join-room">
            <Button variant="ghost" size="sm">Join Room</Button>
          </Link>
          {user && (
            <>
              <Link href="/friends">
                <Button variant="ghost" size="sm">
                  <Users className="w-4 h-4 mr-1" /> Friends
                </Button>
              </Link>
              <Link href="/leaderboard">
                <Button variant="ghost" size="sm">
                  <Trophy className="w-4 h-4 mr-1" /> Leaderboard
                </Button>
              </Link>
              <Link href="/daily">
                <Button variant="ghost" size="sm">Daily</Button>
              </Link>
            </>
          )}
          {user ? (
            <div className="flex items-center gap-2 ml-2">
              <Notifications />
              <div className="flex items-center gap-2 ml-2">
                <div className="flex items-center gap-2 rounded-full pl-1 pr-4 py-1 bg-white/[0.06] border border-white/[0.09] backdrop-blur-xl">
                  <Avatar className="w-8 h-8 ring-2 ring-gold/40">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.username[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{user.username}</span>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <button className="md:hidden rounded-lg p-1.5 -m-1.5 hover:bg-white/[0.06] transition-colors" onClick={() => setIsOpen(!isOpen)} aria-label={isOpen ? 'Close menu' : 'Open menu'} aria-expanded={isOpen}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass rounded-b-2xl mt-1 max-w-6xl mx-auto"
          >
            <div className="px-4 py-4 space-y-2">
              <Link href="/create-room" className="block"><Button variant="ghost" className="w-full justify-start">Create Room</Button></Link>
              <Link href="/join-room" className="block"><Button variant="ghost" className="w-full justify-start">Join Room</Button></Link>
              {user ? (
                <>
                  <Link href="/friends" className="block"><Button variant="ghost" className="w-full justify-start"><Users className="w-4 h-4 mr-2" />Friends</Button></Link>
                  <Link href="/leaderboard" className="block"><Button variant="ghost" className="w-full justify-start"><Trophy className="w-4 h-4 mr-2" />Leaderboard</Button></Link>
                  <Link href="/daily" className="block"><Button variant="ghost" className="w-full justify-start">Daily</Button></Link>
                </>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
