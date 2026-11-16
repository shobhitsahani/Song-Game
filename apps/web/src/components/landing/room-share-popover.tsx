'use client';

import React from 'react';
import {
  Stage,
  Avatar,
  Roll,
  type Act,
} from '../stageshow/kit';
import { Copy, Check, Users } from '@phosphor-icons/react';

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
  playersCount: 4,
};

const REST = {
  wide: { x: 380, y: 38 },
  compact: { x: 280, y: 38 },
};

async function script(a: Act<ShareState>) {
  // Calm opening beat
  await a.wait(700);

  // Cursor moves to copy button and clicks
  await a.move('copy-code');
  await a.wait(200);
  await a.click();
  await a.set({ copied: true });

  // Move cursor away so it does NOT obscure the button or text
  await a.wait(150);
  await a.move(REST.wide);
  await a.wait(400);

  // Jordan joins
  await a.set({ playersCount: 2 });
  await a.wait(600);

  // Sam joins
  await a.set({ playersCount: 3 });
  await a.wait(600);

  // Alex joins
  await a.set({ playersCount: 4 });
  await a.wait(3400);

  // Reset seam
  await a.set({ copied: false, playersCount: 1 });
  await a.wait(700);
}

export function RoomSharePopover() {
  return (
    <div id="final-cta-stageshow-container" className="w-full max-w-md mx-auto mb-8" aria-hidden="true">
      <Stage<ShareState>
        width={420}
        height={150}
        compact={{ below: 420, width: 320, height: 150 }}
        initial={initial}
        poster={poster}
        script={script}
        play="loop"
        cursor={{ at: REST, style: 'arrow', ripple: true }}
        className="look-songgame"
      >
        {(s) => (
          <div className="w-full h-full rounded-[var(--radius-card)] bg-[var(--surface-1)] border border-[var(--border)] p-3.5 shadow-md flex flex-col justify-between">
            {/* Popover Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-semibold text-[var(--foreground)] font-mono">
                  Room VR426D
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-[var(--radius-sm)] bg-[var(--surface-2)] text-[var(--muted-foreground)]">
                  Lobby
                </span>
              </div>

              <span className="text-xs font-sans text-[var(--muted-foreground)] flex items-center gap-1">
                <Users size={13} weight="bold" />
                <span className="font-mono tabular-nums">{s.playersCount}/4 players</span>
              </span>
            </div>

            {/* Share / Copy code row with real host */}
            <div className="flex items-center justify-between p-2 rounded-[var(--radius-control)] bg-[var(--surface-2)] border border-[var(--border)]">
              <span className="pl-2 text-xs font-sans text-[var(--muted-foreground)] tracking-tight truncate mr-2">
                https://songgame.app/room/VR426D
              </span>

              <span
                role="button"
                tabIndex={0}
                data-target="copy-code"
                data-copied={s.copied ? 'true' : undefined}
                className="ss-copy-btn"
              >
                {s.copied ? (
                  <>
                    <Check size={13} weight="bold" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} weight="bold" />
                    <span>Copy</span>
                  </>
                )}
              </span>
            </div>

            {/* Player presence in clean body font */}
            <div className="flex items-center justify-between pt-0.5">
              <div className="flex items-center -space-x-1.5">
                <Avatar name="YOU" size={22} tone="accent" ring="confirmed" />
                {s.playersCount >= 2 && (
                  <Avatar name="JD" size={22} tone="person" ring="confirmed" />
                )}
                {s.playersCount >= 3 && (
                  <Avatar name="SM" size={22} tone="person" ring="confirmed" />
                )}
                {s.playersCount >= 4 && (
                  <Avatar name="AX" size={22} tone="person" ring="confirmed" />
                )}
              </div>

              <span className="text-xs text-[var(--muted-foreground)] font-medium">
                <Roll>
                  {s.playersCount === 4
                    ? 'All 4 players joined · Starting'
                    : s.playersCount === 3
                      ? 'Sam joined the room'
                      : s.playersCount === 2
                        ? 'Jordan joined the room'
                        : 'Waiting for players...'}
                </Roll>
              </span>
            </div>
          </div>
        )}
      </Stage>
    </div>
  );
}