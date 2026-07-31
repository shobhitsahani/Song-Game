'use client';
import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShow(true), 3000);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => { setDeferredPrompt(null); setShow(false); });
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed bottom-20 md:bottom-4 left-4 right-4 z-50 max-w-sm mx-auto">
          <div className="glass rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
              <Download className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Install Song Game</p>
              <p className="text-xs text-muted-foreground truncate">Add to home screen for the best experience</p>
            </div>
            <Button size="sm" variant="gradient" onClick={install}>Install</Button>
            <button onClick={() => setShow(false)} className="p-1 text-muted-foreground hover:text-foreground" aria-label="Dismiss"><X className="w-4 h-4" /></button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
