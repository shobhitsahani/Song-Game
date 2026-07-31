'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Menu, X, User, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/providers/UserProvider';
import { useNotificationStore } from '@/store/notifications';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Notifications } from '@/components/shared/Notifications';
import Link from 'next/link';
import { useSocket } from '@/hooks/useSocket';

export function Navbar() {
  const { user, login } = useUser();
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
    return () => socket.off('notification:new', handleNotification);
  }, [socket]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
            <Music className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg">SongGame</span>
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
                <div className="flex items-center gap-2 glass rounded-full pl-1 pr-4 py-1">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.username[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{user.username}</span>
                </div>
              </div>
            </div>
          ) : (
            <Button onClick={login} className="gap-2 ml-2">
              <User className="w-4 h-4" />
              Sign in with Deezer
            </Button>
          )}
        </div>

        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/5 bg-background/95 backdrop-blur-xl"
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
              ) : (
                <Button onClick={login} className="w-full gap-2"><User className="w-4 h-4" />Sign in with Deezer</Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
