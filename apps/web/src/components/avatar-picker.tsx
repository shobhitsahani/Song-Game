'use client';

import { Check } from '@phosphor-icons/react';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const ANIMALS = ['🦁', '🐯', '🐻', '🐼', '🐨', '🦊', '🐸', '🐵', '🦄', '🐙'];
const BACKGROUNDS = ['b6e3f4', 'ffd5dc', 'ffdfbf', 'd1f4d9', 'dbeafe', 'fde68a', 'ddd6fe', 'fecdd3', 'a7f3d0', 'fbcfe8'];

function animalAvatar(emoji: string, bg: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" rx="64" fill="#${bg}"/><text x="64" y="84" font-size="72" text-anchor="middle" dominant-baseline="middle">${emoji}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const AVATAR_OPTIONS = ANIMALS.map((emoji, i) => animalAvatar(emoji, BACKGROUNDS[i]));

interface AvatarPickerProps {
  value: string | null;
  onChange: (url: string) => void;
}

export function AvatarPicker({ value, onChange }: AvatarPickerProps) {
  return (
    <div className="grid grid-cols-5 gap-2.5">
      {AVATAR_OPTIONS.map((url, i) => {
        const selected = value === url;
        return (
          <button
            key={url}
            type="button"
            onClick={() => onChange(url)}
            className={cn(
              'relative rounded-full p-1 transition-transform duration-150 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
              selected
                ? 'bg-[var(--primary)]/20 ring-2 ring-[var(--primary)] shadow-md'
                : 'bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-[var(--card)]'
            )}
            aria-pressed={selected}
            aria-label={`Avatar ${i + 1}`}
          >
            <Avatar src={url} alt={`Avatar ${i + 1}`} fallback={String(i + 1)} className="w-12 h-12 rounded-full" />
            {selected && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center shadow-sm">
                <Check size={12} weight="bold" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
