'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Bell, CheckCheck, UserPlus, Trophy, MessageSquare, X, ExternalLink, type LucideIcon } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import type { AppNotification } from '@song-game/types';

const NOTIFICATION_ICONS: Record<string, LucideIcon> = {
  FRIEND_REQUEST: UserPlus,
  FRIEND_ACCEPT: UserPlus,
  GAME_INVITE: Trophy,
  ACHIEVEMENT_UNLOCK: Trophy,
  LEVEL_UP: Trophy,
  MATCH_START: MessageSquare,
};

export default function NotificationsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/');
      return;
    }
    if (isAuthenticated) {
      api.notifications.list()
        .then((res) => { if (res.success) setNotifications(res.data); })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isAuthenticated, authLoading, router]);

  const handleMarkRead = async (id: string) => {
    try {
      await api.notifications.markRead(id);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    } catch { /* ignore */ }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch { /* ignore */ }
  };

  if (authLoading || loading) {
    return (
      <main className="min-h-screen pt-24 pb-16 px-4 max-w-3xl mx-auto">
        <Skeleton className="h-10 w-56 mb-8" />
        <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      </main>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <main className="min-h-screen pb-16">
      <div className="pt-24 px-4 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Bell className="w-6 h-6 text-purple-400" /> Notifications
              {unreadCount > 0 && <Badge variant="destructive">{unreadCount}</Badge>}
            </h1>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="gap-1">
                <CheckCheck className="w-4 h-4" /> Mark all read
              </Button>
            )}
          </div>

          <div className="space-y-2">
            {notifications.length > 0 ? notifications.map((n) => {
              const Icon = NOTIFICATION_ICONS[n.type] || Bell;
              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`glass rounded-xl p-4 flex items-start gap-3 cursor-pointer ${!n.read ? 'border-l-2 border-purple-500' : ''}`}
                  onClick={() => !n.read && handleMarkRead(n.id)}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${n.read ? 'bg-muted text-muted-foreground' : 'bg-purple-500/10 text-purple-400'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!n.read ? 'font-semibold' : ''}`}>{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="shrink-0" onClick={(e) => { e.stopPropagation(); handleMarkRead(n.id); }}>
                    {n.read ? <ExternalLink className="w-4 h-4 text-muted-foreground" /> : <X className="w-4 h-4 text-muted-foreground" />}
                  </Button>
                </motion.div>
              );
            }) : (
              <EmptyState icon={Bell} title="No notifications" description="You're all caught up!" />
            )}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
