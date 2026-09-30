'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Shuffle, ArrowRight } from 'lucide-react';
import { DICEBEAR_AVATARS, MAX_NAME_LENGTH } from '@/lib/avatars';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PlayerProfileFormProps {
  initialName: string;
  initialAvatar: string;
  accountAvatar?: string;
  onSubmit: (name: string, avatar: string) => void;
  submitting?: boolean;
  submitLabel?: string;
}

export function PlayerProfileForm({
  initialName,
  initialAvatar,
  accountAvatar,
  onSubmit,
  submitting = false,
  submitLabel = 'Join Room',
}: PlayerProfileFormProps) {
  const [name, setName] = useState(initialName);
  const [avatar, setAvatar] = useState(initialAvatar);
  const [nameError, setNameError] = useState<string | null>(null);

  const hasAccountAvatar = !!accountAvatar && !DICEBEAR_AVATARS.some((a) => a.url === accountAvatar);
  const trimmedName = name.trim();

  const handleNameChange = (value: string) => {
    setName(value.slice(0, MAX_NAME_LENGTH));
    if (nameError && value.trim().length > 0) setNameError(null);
  };

  const handleSubmit = () => {
    const clean = trimmedName;
    if (clean.length < 1) {
      setNameError('Please enter a name');
      return;
    }
    if (clean.length > MAX_NAME_LENGTH) {
      setNameError(`Name must be ${MAX_NAME_LENGTH} characters or fewer`);
      return;
    }
    onSubmit(clean, avatar);
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="flex items-center gap-2 text-sm font-medium mb-2">
          <User className="w-4 h-4 text-gold" />
          Your Name
        </label>
        <input
          type="text"
          placeholder="Enter the name you want to use"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !submitting && handleSubmit()}
          maxLength={MAX_NAME_LENGTH}
          autoFocus
          autoComplete="off"
          spellCheck={false}
          className={cn(
            'w-full h-12 rounded-xl border bg-secondary/50 backdrop-blur-xl px-4 text-base ring-offset-background transition-all duration-300 placeholder:text-muted-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50',
            nameError ? 'border-destructive/50' : 'border-border focus-visible:ring-gold/50'
          )}
          aria-label="Your name"
        />
        <div className="flex items-center justify-between mt-1.5">
          <p className={cn('text-xs', nameError ? 'text-destructive' : 'text-muted-foreground')}>
            {nameError || 'This is how you will appear in the room'}
          </p>
          <span className="text-xs text-muted-foreground/50">{name.length}/{MAX_NAME_LENGTH}</span>
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-medium mb-2">
          <Shuffle className="w-4 h-4 text-gold" />
          Choose Your Avatar
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {hasAccountAvatar && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setAvatar(accountAvatar!)}
              className={cn(
                'relative aspect-square rounded-xl overflow-hidden transition-all duration-200 border-2',
                avatar === accountAvatar
                  ? 'border-gold ring-2 ring-gold/40 scale-105'
                  : 'border-white/10 hover:border-white/30'
              )}
              aria-pressed={avatar === accountAvatar}
              aria-label="Use your account avatar"
            >
              <Avatar className="w-full h-full rounded-none">
                <AvatarImage src={accountAvatar} />
                <AvatarFallback className="bg-gradient-to-br from-gold to-ember text-gold-foreground">
                  {initialName?.[0]?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
            </motion.button>
          )}
          {DICEBEAR_AVATARS.map((a) => (
            <motion.button
              key={a.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setAvatar(a.url)}
              className={cn(
                'relative aspect-square rounded-xl overflow-hidden transition-all duration-200 border-2 bg-secondary/30',
                avatar === a.url
                  ? 'border-gold ring-2 ring-gold/40 scale-105'
                  : 'border-white/10 hover:border-white/30'
              )}
              aria-pressed={avatar === a.url}
              aria-label={`Avatar ${a.id}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={a.url} alt={a.id} className="w-full h-full object-cover" />
            </motion.button>
          ))}
        </div>
      </div>

      <Button
        size="lg"
        className="w-full gap-2 h-12 text-base"
        disabled={!trimmedName || submitting}
        loading={submitting}
        onClick={handleSubmit}
      >
        {submitLabel}
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
