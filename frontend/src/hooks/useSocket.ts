'use client';

import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { getSocket, connectSocket } from '@/lib/socket';
import { useAuthStore } from '@/store/auth';

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    const s = connectSocket(token || undefined);
    setSocket(s);
    setConnected(s.connected);

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);

    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
    };
  }, [token]);

  return { socket, connected };
}
