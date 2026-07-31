'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, Trophy, UserPlus, Gamepad2, Zap, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotificationStore } from '@/store/notifications';
import { useAuthStore } from '@/providers/UserProvider';
import { useSocket } from '@/hooks/useSocket';
import { cn } from '@/lib/utils';
import type { Notification } from '@/types';

const notificationIcons: Record<Notification['type'], JSX.Element> = {
  FRIEND_REQUEST: <UserPlus className="w-4 h-4 text-blue-400" />,
  FRIEND_ACCEPT: <UserPlus className="w-4 h-4 text-green-400" />,
  GAME_INVITE: <Gamepad2 className="w-4 h-4 text-purple-400" />,
  ACHIEVEMENT_UNLOCK: <Trophy className="w-4 h-4 text-yellow-400" />,
  LEVEL_UP: <Zap className="w-4 h-4 text-orange-400" />,
  DAILY_CHALLENGE: <Calendar className="w-4 h-4 text-pink-400" />,
  MATCH_START: <Users className="w-4 h-4 text-indigo-400" />,
};

export function Notifications() {
  const { user } = useAuthStore();
  const { notifications, unreadCount, loadNotifications, loadUnreadCount, markRead, markAllRead, addNotification } = useNotificationStore();
  const { socket } = useSocket();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    loadNotifications();
    loadUnreadCount();
  }, [user]);

  useEffect(() => {
    if (!socket) return;
    const handler = (notification: Notification) => addNotification(notification);
    socket.on('notification:new', handler);
    return () => socket.off('notification:new', handler);
  }, [socket, addNotification]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleMarkAllRead = async () => {
    await markAllRead();
  };

  const handleMarkRead = async (id: string) => {
    await markRead(id);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <Button variant="ghost" size="icon" className="relative" onClick={() => setOpen(!open)} aria-label="Notifications" aria-haspopup="true" aria-expanded={open}>
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <motion.span
            className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute right-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-1rem)] overflow-hidden rounded-xl border border-white/10 bg-card shadow-xl"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <h3 className="font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
                  <Check className="w-3 h-3 mr-1" /> Mark all read
                </Button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                <AnimatePresence>
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={cn(
                        'border-b border-white/5 p-3 last:border-0 transition-colors',
                        !notification.read && 'bg-purple-500/5',
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
                          {notificationIcons[notification.type]}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{notification.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="shrink-0">
                            <div className="h-2 w-2 rounded-full bg-purple-500" />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
