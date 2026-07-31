'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { UserPlus, Users, X, Check, UserMinus, MessageCircle, ArrowLeft, Search } from 'lucide-react';
import { Navbar } from '@/components/home/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { useFriendStore } from '@/store/friends';
import { useSocket } from '@/hooks/useSocket';
import { useAuthStore } from '@/store/auth';

export default function FriendsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { friends, requests, loading, loadFriends, loadRequests, sendRequest, acceptRequest, rejectRequest, removeFriend, setOnline } = useFriendStore();
  const { socket } = useSocket();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) { router.push('/'); return; }
    loadFriends();
    loadRequests();
  }, [user]);

  useEffect(() => {
    if (!socket) return;
    socket.on('friend:online', (userId: string) => setOnline(userId, true));
    socket.on('friend:offline', (userId: string) => setOnline(userId, false));
    return () => { socket.off('friend:online'); socket.off('friend:offline'); };
  }, [socket]);

  const filteredFriends = friends.filter(f =>
    f.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendRequest = async () => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    try {
      await sendRequest(trimmed);
      setSearchQuery('');
    } catch {}
  };

  const handleInvite = (friendId: string) => {
    socket?.emit('room:invite', friendId);
  };

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 px-4 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Button variant="ghost" className="mb-4" onClick={() => router.push('/')}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold">
                <span className="text-gradient">Friends</span>
              </h1>
              <p className="text-muted-foreground mt-1">
                {friends.length} friend{friends.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <Tabs defaultValue="list" className="w-full">
            <TabsList className="glass w-full justify-start mb-6">
              <TabsTrigger value="list">All Friends</TabsTrigger>
              <TabsTrigger value="online">Online</TabsTrigger>
              <TabsTrigger value="requests">
                Requests
                {requests.length > 0 && (
                  <Badge variant="destructive" size="sm" className="ml-2">{requests.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="add">Add Friend</TabsTrigger>
            </TabsList>

            <TabsContent value="list">
              {loading ? (
                <div className="space-y-3">
                  {[1,2,3,4,5].map(i => (
                    <Card key={i}>
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary animate-pulse" />
                        <div className="flex-1 h-4 bg-secondary animate-pulse rounded" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredFriends.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-1">No friends yet</h3>
                  <p className="text-muted-foreground text-sm mb-4">Search for users to add friends</p>
                  <Button onClick={() => document.querySelector('[data-value="add"]')?.dispatchEvent(new Event('click'))}>
                    <UserPlus className="w-4 h-4 mr-1" /> Add Friends
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredFriends.map(friend => (
                    <Card key={friend.id}>
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={friend.avatar} />
                            <AvatarFallback>{friend.username[0]}</AvatarFallback>
                          </Avatar>
                          <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-background ${
                            friend.isOnline ? 'bg-green-500' : 'bg-gray-500'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{friend.username}</p>
                          <p className="text-xs text-muted-foreground">
                            {friend.isOnline ? 'Online' : `Last seen ${friend.lastSeen ? new Date(friend.lastSeen).toLocaleDateString() : 'ago'}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button variant="ghost" size="icon" onClick={() => handleInvite(friend.userId)} title="Invite to game">
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => removeFriend(friend.userId)}>
                            <UserMinus className="w-4 h-4 text-red-400" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="online">
              <div className="space-y-2">
                {filteredFriends.filter(f => f.isOnline).length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No friends online</p>
                  </div>
                ) : (
                  filteredFriends.filter(f => f.isOnline).map(friend => (
                    <Card key={friend.id}>
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={friend.avatar} />
                            <AvatarFallback>{friend.username[0]}</AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-background bg-green-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{friend.username}</p>
                          <p className="text-xs text-green-400">Online</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleInvite(friend.userId)}>
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="requests">
              {requests.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No pending requests</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {requests.map(req => (
                    <Card key={req.id}>
                      <CardContent className="p-4 flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={req.avatar} />
                          <AvatarFallback>{req.username[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{req.username}</p>
                          <p className="text-xs text-muted-foreground">{new Date(req.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => acceptRequest(req.userId)}>
                            <Check className="w-4 h-4 mr-1" /> Accept
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => rejectRequest(req.userId)}>
                            <X className="w-4 h-4 mr-1" /> Reject
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="add">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter username or Deezer ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendRequest()}
                    />
                    <Button onClick={handleSendRequest} disabled={!searchQuery.trim()}>
                      <Search className="w-4 h-4 mr-1" /> Send Request
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </main>
  );
}
