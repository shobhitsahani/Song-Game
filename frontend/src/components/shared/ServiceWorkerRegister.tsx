'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const register = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
          });
          if (registration.active) {
            registration.active.postMessage({ type: 'CLIENT_READY' });
          }
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  newWorker.postMessage({ type: 'SKIP_WAITING' });
                  window.location.reload();
                }
              });
            }
          });
        } catch (error) {
          console.warn('Service worker registration failed:', error);
        }
      };

      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'CLIENT_READY' });
      }

      if (document.readyState === 'complete') {
        register();
      } else {
        window.addEventListener('load', register);
      }

      return () => {
        window.removeEventListener('load', register);
      };
    }
  }, []);

  return null;
}
