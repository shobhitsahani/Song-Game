'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Socket } from 'socket.io-client';
import { getSocket } from '@/lib/socket';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  reconnecting: boolean;
  error: string | null;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false,
  reconnecting: false,
  error: null,
});

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket] = useState<Socket | null>(() => getSocket());
  const [connected, setConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!socket) return;

    const onConnect = () => {
      setConnected(true);
      setReconnecting(false);
      setError(null);
    };
    const onDisconnect = () => setConnected(false);
    const onReconnect = () => {
      setConnected(true);
      setReconnecting(false);
      setError(null);
    };
    const onReconnectAttempt = () => setReconnecting(true);
    const onReconnectError = () => setReconnecting(false);
    const onReconnectFailed = () => setReconnecting(false);
    const onConnectError = () => {
      setReconnecting(false);
      const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
      const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
      setError(
        isLocal
          ? 'Cannot reach the game server. Make sure the API is running on port 3001.'
          : 'Cannot connect to the game server. Check that NEXT_PUBLIC_BACKEND_URL is set to your deployed API URL.'
      );
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('reconnect', onReconnect);
    socket.on('reconnect_attempt', onReconnectAttempt);
    socket.on('reconnect_error', onReconnectError);
    socket.on('reconnect_failed', onReconnectFailed);
    socket.on('connect_error', onConnectError);

    if (!socket.connected) {
      socket.connect();
    } else {
      setConnected(true);
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('reconnect', onReconnect);
      socket.off('reconnect_attempt', onReconnectAttempt);
      socket.off('reconnect_error', onReconnectError);
      socket.off('reconnect_failed', onReconnectFailed);
      socket.off('connect_error', onConnectError);
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket, connected, reconnecting, error }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
