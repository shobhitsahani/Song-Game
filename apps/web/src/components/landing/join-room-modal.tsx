'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, ArrowRight, X, User, Sparkle, Check, WarningCircle } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AvatarPicker } from '@/components/avatar-picker';
import { cn } from '@/lib/utils';

interface JoinRoomModalProps {
  open: boolean;
  onClose: () => void;
}

export function JoinRoomModal({ open, onClose }: JoinRoomModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<'code' | 'name'>('code');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const handleCodeNext = useCallback(() => {
    const trimmed = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (trimmed.length >= 4) {
      setCodeError(null);
      setStep('name');
    } else {
      setCodeError('Room code must be at least 4 characters');
    }
  }, [code]);

  const handleJoin = useCallback(() => {
    let hasError = false;
    const trimmedCode = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    if (trimmedCode.length < 4) {
      setCodeError('Room code must be at least 4 characters');
      hasError = true;
    } else {
      setCodeError(null);
    }
    
    if (!name.trim()) {
      setNameError('Please enter your display name');
      hasError = true;
    } else if (name.trim().length > 20) {
      setNameError('Name must be 20 characters or less');
      hasError = true;
    } else {
      setNameError(null);
    }
    
    if (!avatar) {
      hasError = true;
    }
    
    if (!hasError) {
      const params = new URLSearchParams({ name: name.trim(), avatar: avatar! });
      router.push(`/room/${trimmedCode}?${params.toString()}`);
      onClose();
    }
  }, [code, name, avatar, router, onClose]);

  // Format code as user types
  useEffect(() => {
    const formatted = code.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    if (formatted !== code) {
      setCode(formatted);
    }
  }, [code]);

  // Focus management
  useEffect(() => {
    if (open) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      setTimeout(() => {
        codeInputRef.current?.focus();
      }, 100);
    } else if (previousActiveElement.current) {
      previousActiveElement.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (step === 'name') {
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [step]);

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
    if (!open) {
      setCode('');
      setName('');
      setAvatar(null);
      setStep('code');
      setCodeError(null);
      setNameError(null);
    }
  }, [open]);

  const formattedCode = code.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);

  return (
<AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="relative w-full max-w-md"
          >
            {/* Modal Surface */}
            <div className="relative bg-background/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Progress Indicator */}
              <div className="px-6 py-4 border-b border-white/5">
                <div className="flex items-center justify-center gap-2">
                  {['code', 'name'].map((s, i) => (
                    <motion.div
                      key={s}
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.1, type: 'spring', stiffness: 300 }}
                      className="flex items-center gap-1.5"
                    >
                      <div
                        className={cn(
                          'w-2.5 h-2.5 rounded-full transition-all duration-300',
                          step === s
                            ? 'bg-primary shadow-[0_0_12px_var(--glow)]'
                            : i === 0
                            ? 'bg-success'
                            : 'bg-white/10'
                        )}
                      />
                      {i === 0 && (
                        <div
                          className={`h-0.5 w-12 rounded-full transition-all duration-300 ${
                            step === 'name'
                              ? 'bg-primary'
                              : 'bg-white/10'
                          }`}
                        />
                      )}
                    </motion.div>
                  ))}
                </div>
                <div className="flex justify-center gap-2 mt-2 text-xs font-medium">
                  <span className={cn('transition-colors duration-200', step === 'code' ? 'text-primary' : 'text-muted-foreground')}>Room Code</span>
                  <span className="text-muted-foreground/40">·</span>
                  <span className={cn('transition-colors duration-200', step === 'name' ? 'text-primary' : 'text-muted-foreground')}>Your Identity</span>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {step === 'code' ? (
                    <motion.div
                      key="code"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                    >
                      <div className="text-center mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-[var(--glass-border)] flex items-center justify-center mx-auto mb-4">
                          <Copy className="w-7 h-7 text-primary" />
                        </div>
                        <h2 id="modal-title" className="text-2xl font-bold mb-2">Enter Room Code</h2>
                        <p className="text-muted-foreground text-sm">Enter the 4-6 character code to join a game</p>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="room-code" className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                            <Copy className="w-4 h-4 text-primary" />
                            Room Code
                          </label>
                          <Input
                            ref={codeInputRef}
                            id="room-code"
                            placeholder="ABC123"
                            value={code}
                            onChange={(e) => {
                              setCode(e.target.value);
                              if (codeError) setCodeError(null);
                            }}
                            maxLength={6}
                            className={cn(
                              'text-center text-2xl font-mono tracking-widest h-14',
                              codeError && 'border-destructive/50 focus:ring-destructive/50'
                            )}
                            autoComplete="off"
                            autoCapitalize="characters"
                            spellCheck={false}
                            aria-describedby={codeError ? 'code-error' : 'code-hint'}
                            aria-invalid={codeError ? 'true' : 'false'}
                          />
{codeError ? (
                            <p id="code-error" className="text-xs text-destructive mt-1.5 flex items-center justify-center gap-1" role="alert">
                              <WarningCircle className="w-3.5 h-3.5 flex-shrink-0" />
                              {codeError}
                            </p>
                          ) : (
                            <p id="code-hint" className="text-xs text-muted-foreground text-center">
                              Room codes are 4-6 characters
                            </p>
                          )}
                        </div>
                        <Button
                          className={cn('w-full gap-2 h-12', formattedCode.length < 4 && 'opacity-50 cursor-not-allowed')}
                          disabled={formattedCode.length < 4}
                          onClick={handleCodeNext}
                        >
                          Next <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="name"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                    >
                      <div className="text-center mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-[var(--glass-border)] flex items-center justify-center mx-auto mb-4">
                          <User className="w-7 h-7 text-primary" />
                        </div>
                        <h2 id="modal-title" className="text-2xl font-bold mb-2">Your Identity</h2>
                        <p className="text-muted-foreground text-sm">
                          Set your name and avatar for room <span className="font-bold text-foreground">{formattedCode}</span>
                        </p>
                      </div>
                      <div className="space-y-5">
                        <div>
                          <label htmlFor="display-name" className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                            <User className="w-4 h-4 text-primary" />
                            Your display name
                          </label>
                          <Input
                            ref={nameInputRef}
                            id="display-name"
                            placeholder="Your display name"
                            value={name}
                            onChange={(e) => {
                              setName(e.target.value);
                              if (nameError) setNameError(null);
                            }}
                            maxLength={20}
                            className={cn('text-center text-lg h-12', nameError && 'border-destructive/50 focus:ring-destructive/50')}
                            autoComplete="name"
                            aria-describedby={nameError ? 'name-error' : undefined}
                            aria-invalid={nameError ? 'true' : 'false'}
                          />
                          {nameError && (
                            <p id="name-error" className="text-xs text-destructive mt-1.5 flex items-center justify-center gap-1" role="alert">
                              <WarningCircle className="w-3.5 h-3.5 flex-shrink-0" />
                              {nameError}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                            <Sparkle className="w-4 h-4 text-primary" />
                            Choose your avatar
                          </label>
                          <AvatarPicker value={avatar} onChange={setAvatar} />

                          {avatar && (
                            <p className="text-xs text-success mt-2 flex items-center justify-center gap-1">
                              <Check className="w-3 h-3" />
                              Avatar selected
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button variant="ghost" className="flex-1" onClick={() => setStep('code')}>
                            Back
                          </Button>
                          <Button
                            className={cn('flex-1 gap-2', !name.trim() || !avatar && 'opacity-50 cursor-not-allowed')}
                            disabled={!name.trim() || !avatar}
                            onClick={handleJoin}
                          >
                            Join Room <ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
