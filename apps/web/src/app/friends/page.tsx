'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users, UserPlus, UserMinus, Check, X, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import type { Friend, FriendRequest } from '@song-game/types';

type Tab = 'friends' | 'requests' | 'search';

interface SearchUser {
  id: string;
  username: string;
  displayName: string | null;
  avatar: string | null;
  level: number;
}

export default function FriendsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [tab, setTab] = useState<Tab>('friends');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/');
      return;
    }
    if (isAuthenticated) {
      Promise.all([api.friends.list(), api.friends.requests()])
        .then(([f, r]) => {
          if (f.success) setFriends(f.data);
          if (r.success) setRequests(r.data);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSendRequest = async (userId: string) => {
    try {
      await api.friends.sendRequest(userId);
      toast.success('Friend request sent!');
    } catch {
      toast.error('Failed to send request');
    }
  };

  const handleAccept = async (id: string) => {
    try {
      await api.friends.acceptRequest(id);
      toast.success('Friend request accepted!');
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch {
      toast.error('Failed to accept request');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.friends.rejectRequest(id);
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch {
      toast.error('Failed to reject request');
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await api.friends.remove(id);
      setFriends((prev) => prev.filter((f) => f.id !== id));
      toast.success('Friend removed');
    } catch {
      toast.error('Failed to remove friend');
    }
  };

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/users/search?q=${encodeURIComponent(q)}`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) setSearchResults(data.data as SearchUser[]);
    } catch { /* ignore */ }
    setSearching(false);
  };

  if (authLoading || loading) {
    return (
      <main className="min-h-screen pt-24 pb-16 px-4 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-16">
      <div className="pt-24 px-4 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="w-6 h-6 text-purple-400" /> Friends</h1>
          </div>

          <div className="flex gap-2">
            {(['friends', 'requests', 'search'] as Tab[]).map((t) => (
              <Button key={t} variant={tab === t ? 'default' : 'ghost'} size="sm" onClick={() => setTab(t)}>
                {t === 'friends' && <Users className="w-4 h-4 mr-1" />}
                {t === 'requests' && <><Clock className="w-4 h-4 mr-1" /> Requests {requests.length > 0 && <Badge variant="destructive" size="sm" className="ml-1">{requests.length}</Badge>}</>}
                {t === 'search' && <UserPlus className="w-4 h-4 mr-1" />}
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Button>
            ))}
          </div>

          {tab === 'friends' && (
            <div className="space-y-3">
              {friends.length > 0 ? friends.map((friend) => (
                <div key={friend.id} className="glass rounded-xl p-4 flex items-center gap-3">
                  <Avatar src={friend.avatar} alt={friend.username} fallback={friend.username[0] ?? '?'} status={friend.isOnline ? 'online' : 'offline'} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{friend.username}</p>
                    <p className="text-xs text-muted-foreground">Level {friend.level} &middot; {friend.isOnline ? 'Online' : 'Offline'}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleRemove(friend.id)}><UserMinus className="w-4 h-4 text-red-400" /></Button>
                </div>
              )) : (
                <EmptyState icon={Users} title="No friends yet" description="Search for users to add friends." action={<Button variant="outline" onClick={() => setTab('search')}><UserPlus className="w-4 h-4 mr-1" /> Find Friends</Button>} />
              )}
            </div>
          )}

          {tab === 'requests' && (
            <div className="space-y-3">
              {requests.length > 0 ? requests.map((req) => (
                <div key={req.id} className="glass rounded-xl p-4 flex items-center gap-3">
                  <Avatar src={req.avatar} alt={req.username} fallback={req.username[0] ?? '?'} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{req.username}</p>
                    <p className="text-xs text-muted-foreground">Level {req.level}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="default" size="sm" onClick={() => handleAccept(req.id)}><Check className="w-4 h-4" /></Button>
                    <Button variant="destructive" size="sm" onClick={() => handleReject(req.id)}><X className="w-4 h-4" /></Button>
                  </div>
                </div>
              )) : (
                <EmptyState icon={Clock} title="No pending requests" description="Friend requests will appear here." />
              )}
            </div>
          )}

          {tab === 'search' && (
            <div className="space-y-4">
              <Input placeholder="Search users by username..." value={searchQuery} onChange={(e) => handleSearch(e.target.value)} />
              <div className="space-y-3">
                {searchResults.length > 0 ? searchResults.map((user) => (
                  <div key={user.id} className="glass rounded-xl p-4 flex items-center gap-3">
                    <Avatar src={user.avatar} alt={user.username} fallback={user.username[0] ?? '?'} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{user.username}</p>
                      <p className="text-xs text-muted-foreground">Level {user.level}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleSendRequest(user.id)}><UserPlus className="w-4 h-4 mr-1" /> Add</Button>
                  </div>
                )) : searchQuery && !searching ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No users found</p>
                ) : null}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
