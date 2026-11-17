'use client';

import React from 'react';
import {
  Stage,
  Avatar,
  type Act,
} from '../stageshow/kit';
import { Copy, Check, Users } from '@phosphor-icons/react';
import { SITE_HOST, SITE_ORIGIN } from '@/lib/site';

interface ShareState {
  copied: boolean;
  playersCount: number;
}

const initial: ShareState = {
  copied: false,
  playersCount: 1,
};

const poster: ShareState = {
  copied: true,
  playersCount: 3,
};

const REST = {
  wide: { x: 380, y: 135 },
  compact: { x: 280, y: 135 },
};

async function script(a: Act<ShareState>) {
  // Calm opening beat
  await a.wait(700);

  // Cursor moves to copy button and clicks
  await a.move('copy-code');
  await a.wait(200);
  await a.click();
  await a.set({ copied: true });

  // Move cursor away to empty rest corner so it does NOT obscure text
  await a.wait(150);
  await a.move(REST.wide);
  await a.wait(350);

  // Jordan joins (2/4)
  await a.set({ playersCount: 2 });
  await a.wait(700);

  // Sam joins (3/4)
  await a.set({ playersCount: 3 });
  await a.wait(3400);

  // Reset seam
  await a.set(initial);
  await a.wait(700);
}

export function RoomSharePopover() {
  return (
    <div id="final-cta-stageshow-container" className="w-full max-w-[440px] xl:-mr-10 select-none" aria-hidden="true">
      <Stage<ShareState>
        width={440}
        height={210}
        compact={{ below: 440, width: 340, height: 210 }}
        initial={initial}
        poster={poster}
        script={script}
        play="loop"
        cursor={{ at: REST, style: 'arrow', ripple: true, idle: 300 }}
        className="look-songgame"
      >
        {(s) => (
          <div className="w-full h-full rounded-[var(--radius-card)] bg-[var(--surface-1)] border border-[var(--border)] p-4 shadow-lg flex flex-col justify-between" data-crop="true">
            {/* Header: Room VR426D and player count (No pills!) */}
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-[14px] font-bold text-[var(--foreground)] font-mono">
                  Room VR426D
                </span>
              </div>

              <span className="text-[13px] font-sans text-[var(--muted-foreground)] flex items-center gap-1.5 font-medium">
                <Users size={15} weight="bold" />
                <span className="font-mono tabular-nums text-[var(--foreground)]">{s.playersCount}/4 players</span>
              </span>
            </div>

            {/* Share / Copy code row with real host */}
            <div className="flex items-center justify-between p-2 px-3 rounded-[var(--radius-control)] bg-[var(--surface-2)] border border-[var(--border)]">
              <span className="text-[13px] font-sans text-[var(--foreground)] tracking-tight truncate mr-2 font-medium" title={`${SITE_ORIGIN}/room/VR426D`}>
                {`${SITE_HOST}/room/VR426D`}
              </span>

              <span
                data-target="copy-code"
                data-copied={s.copied ? 'true' : undefined}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] bg-[var(--surface-3)] hover:bg-[var(--surface-1)] text-[13px] font-semibold text-[var(--foreground)] border border-[var(--border)] transition-colors shrink-0"
              >
                {s.copied ? (
                  <>
                    <Check size={14} weight="bold" className="text-emerald-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} weight="bold" />
                    <span>Copy</span>
                  </>
                )}
              </span>
            </div>

            {/* Player list with names (no focus ring look) */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <Avatar name="YOU" size={24} tone="accent" />
                  <span className="text-[13px] font-semibold text-[var(--foreground)]">You</span>
                </div>

                {s.playersCount >= 2 && (
                  <div className="flex items-center gap-1.5 ml-2">
                    <Avatar name="JD" size={24} tone="person" />
                    <span className="text-[13px] font-medium text-[var(--foreground)]">Jordan</span>
                  </div>
                )}

                {s.playersCount >= 3 && (
                  <div className="flex items-center gap-1.5 ml-2">
                    <Avatar name="SM" size={24} tone="person" />
                    <span className="text-[13px] font-medium text-[var(--foreground)]">Sam</span>
                  </div>
                )}
              </div>

              <span className="text-[13px] text-[var(--muted-foreground)] font-normal ml-auto">
                {s.playersCount >= 3 ? 'Starting soon...' : 'Waiting for players'}
              </span>
            </div>
          </div>
        )}
      </Stage>
    </div>
  );
}
