'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, ArrowRight, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface JoinRoomModalProps {
  open: boolean;
  onClose: () => void;
}

export function JoinRoomModal({ open, onClose }: JoinRoomModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<'code' | 'name'>('code');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');

  const handleCodeNext = useCallback(() => {
    if (code.trim().length >= 4) {
      setStep('name');
    }
  }, [code]);

  const handleJoin = useCallback(() => {
    if (code.trim().length >= 4) {
      const params = new URLSearchParams();
      if (name.trim()) params.set('name', name.trim());
      const qs = params.toString();
      router.push(`/room/${code.trim().toUpperCase()}${qs ? `?${qs}` : ''}`);
      onClose();
    }
  }, [code, name, router, onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Enter') {
        if (step === 'code') handleCodeNext();
        else handleJoin();
      }
    };
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, onClose, step, handleCodeNext, handleJoin]);

  useEffect(() => {
    if (!open) { setCode(''); setName(''); setStep('code'); }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative w-full max-w-md"
          >
            <div className="glass rounded-2xl p-8 border border-white/10">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {step === 'code' ? (
                <>
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-4">
                      <Copy className="w-8 h-8 text-purple-400" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Join a Room</h2>
                    <p className="text-muted-foreground text-sm">
                      Enter the room code to join a game.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <Input
                      placeholder="Enter room code..."
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      className="text-center text-2xl font-bold tracking-[0.25em] h-14"
                      maxLength={6}
                      autoFocus
                    />
                    <Button
                      className="w-full gap-2 h-12"
                      disabled={code.trim().length < 4}
                      onClick={handleCodeNext}
                    >
                      Next <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-4">
                      <User className="w-8 h-8 text-purple-400" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Your Name</h2>
                    <p className="text-muted-foreground text-sm">
                      Choose your display name for room <span className="font-bold text-foreground">{code}</span>
                    </p>
                  </div>
                  <div className="space-y-4">
                    <Input
                      placeholder="Your display name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      maxLength={20}
                      autoFocus
                      className="text-center text-lg h-12"
                    />
                    <div className="flex gap-2">
                      <Button variant="ghost" className="flex-1" onClick={() => setStep('code')}>
                        Back
                      </Button>
                      <Button className="flex-1 gap-2" onClick={handleJoin}>
                        Join Room <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
