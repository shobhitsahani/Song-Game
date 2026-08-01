'use client';

import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

let socket: Socket | null = null;
let connectionPromise: Promise<Socket> | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      timeout: 10000,
    });
  }
  return socket;
}

export function connectSocket(token?: string): Socket {
  if (connectionPromise) return socket!;

  const s = getSocket();
  if (token) {
    s.auth = { token };
  }
  if (!s.connected) {
    connectionPromise = new Promise((resolve, reject) => {
      if (s.connected) {
        resolve(s);
        return;
      }
      const onConnect = () => {
        cleanup();
        resolve(s);
      };
      const onError = (err: Error) => {
        cleanup();
        reject(err);
      };
      const cleanup = () => {
        s.off('connect', onConnect);
        s.off('connect_error', onError);
      };
      s.once('connect', onConnect);
      s.once('connect_error', onError);
      s.connect();
    });
  }
  return s;
}

export function disconnectSocket() {
  if (socket?.connected) {
    socket.disconnect();
  }
  connectionPromise = null;
}
