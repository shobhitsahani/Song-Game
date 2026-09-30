'use client';

import { useState, memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { GameMode, Round } from '@/types';

interface AnswerInputProps {
  mode: GameMode;
  onSubmit: (answer: string) => void;
  disabled?: boolean;
  guessResult: any;
  currentRound: Round | null;
}

export const AnswerInput = memo(function AnswerInput({ mode, onSubmit, disabled, guessResult, currentRound }: AnswerInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = useCallback(() => {
    if (input.trim()) {
      onSubmit(input.trim());
      setInput('');
    }
  }, [input, onSubmit]);

  const getPlaceholder = () => {
    switch (mode) {
      case 'ARTIST': return 'Type the artist name…';
      case 'ALBUM': return 'Type the album name…';
      case 'GENRE': return 'Type the genre…';
      case 'DECADE': return 'Type the decade…';
      case 'LYRICS': return 'Type the missing lyric…';
      default: return 'Type the song title…';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-2 w-full max-w-2xl mx-auto"
    >
      <Input
        placeholder={getPlaceholder()}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        disabled={disabled}
        className="flex-1 h-12 text-lg"
        autoFocus
      />
      <Button
        size="lg"
        onClick={handleSubmit}
        disabled={disabled || !input.trim()}
        className="h-12 px-6"
      >
        <Send className="w-5 h-5" />
      </Button>
    </motion.div>
  );
});
