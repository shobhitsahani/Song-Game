'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
  Bell,
  Checks,
  UserPlus,
  Trophy,
  ChatText,
  X,
  ArrowSquareOut,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import type { AppNotification } from '@song-game/types';

const NOTIFICATION_ICONS: Record<string, React.ElementType> = {
  FRIEND_REQUEST: UserPlus,
  FRIEND_ACCEPT: UserPlus,
  GAME_INVITE: Trophy,
  ACHIEVEMENT_UNLOCK: Trophy,
  SYSTEM: Bell,
  LEVEL_UP: Trophy,
  MATCH_START: ChatText,
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
              <Bell size={24} className="text-[var(--primary)]" /> Notifications
              {unreadCount > 0 && <Badge variant="destructive">{unreadCount}</Badge>}
            </h1>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="gap-1.5">
                <Checks size={18} /> Mark all read
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
                  className={`liquid-glass-surface rounded-2xl p-4 flex items-start gap-3 cursor-pointer border border-[var(--glass-border)] transition-colors ${!n.read ? 'bg-[var(--glass-bg)] shadow-[0_4px_20px_var(--glow)]' : 'opacity-75'}`}
                  onClick={() => !n.read && handleMarkRead(n.id)}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${n.read ? 'bg-[var(--secondary)] text-[var(--muted-foreground)]' : 'bg-[var(--primary)]/15 text-[var(--primary)]'}`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm ${!n.read ? 'font-semibold text-[var(--foreground)]' : 'text-[var(--muted-foreground)]'}`}>{n.title}</p>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-[var(--primary)] shrink-0" aria-label="Unread" />}
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{n.message}</p>
                    <p className="text-[11px] text-[var(--muted-foreground)]/60 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="shrink-0" onClick={(e) => { e.stopPropagation(); handleMarkRead(n.id); }}>
                    {n.read ? <ArrowSquareOut size={16} className="text-[var(--muted-foreground)]" /> : <X size={16} className="text-[var(--muted-foreground)]" />}
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
