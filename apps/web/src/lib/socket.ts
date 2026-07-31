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
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
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
    connectionPromise = new Promise((resolve) => {
      if (s.connected) {
        resolve(s);
        return;
      }
      s.once('connect', () => resolve(s));
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
