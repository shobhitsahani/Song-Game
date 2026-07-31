'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Socket } from 'socket.io-client';
import { getSocket } from '@/lib/socket';
import { useAuthStore } from '@/store/auth';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  reconnecting: boolean;
}

const SocketContext = createContext<SocketContextType>({ socket: null, connected: false, reconnecting: false });

export function SocketProvider({ children }: { children: ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);

  useEffect(() => {
    const s = getSocket();
    if (token) s.auth = { token };
    if (!s.connected) s.connect();
    setSocket(s);

    const onConnect = () => { setConnected(true); setReconnecting(false); };
    const onDisconnect = () => setConnected(false);
    const onReconnect = () => { setConnected(true); setReconnecting(false); };
    const onReconnectAttempt = () => setReconnecting(true);
    const onReconnectError = () => setReconnecting(false);
    const onReconnectFailed = () => setReconnecting(false);

    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);
    s.on('reconnect', onReconnect);
    s.on('reconnect_attempt', onReconnectAttempt);
    s.on('reconnect_error', onReconnectError);
    s.on('reconnect_failed', onReconnectFailed);

    if (s.connected) setConnected(true);

    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
      s.off('reconnect', onReconnect);
      s.off('reconnect_attempt', onReconnectAttempt);
      s.off('reconnect_error', onReconnectError);
      s.off('reconnect_failed', onReconnectFailed);
    };
  }, [token]);

  return (
    <SocketContext.Provider value={{ socket, connected, reconnecting }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocketContext = () => useContext(SocketContext);
