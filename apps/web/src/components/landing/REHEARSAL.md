# Stageshow Rehearsal Report: SongGame Landing Page

## 1. Overview & Gold Reference Mapping

| Section | Component | Closest Gold Example(s) | Role & Focal Object |
| :--- | :--- | :--- | :--- |
| **Hero Demo** | `HeroStageshow` (`hero-stageshow.tsx`) | `hero-demo`, `presence`, `device-pair` | Realistic live game window: 15s timer countdown, vinyl disc spinning, 4 multiple-choice answers. Cursor selects Option B ("Neon Midnight"), locks in, rolls `+1,000 pts`, standings reorder to place YOU at #1 with 4,250 pts. Satellite phone notification ("Jordan joined your room"). |
| **How a Round Works** | `HowRoundWorksTile1-3` (`how-round-works-stageshow.tsx`) | `bento`, `dark-bento`, `ai-cards`, `choreography` | 3 sequential tiles with `play="once"` on viewport entry:<br>1. *Hear the clip*: vinyl turntable and streaming progress bar.<br>2. *Lock in*: Option B pressed with speed chip (1.8s) and score chip (`+1,000 pts`).<br>3. *Beat the room*: climbing rank chip (▲1) and live score count roll to 4,250 pts. |
| **Game Modes** | `EightWaysToPlay` (`eight-ways-to-play.tsx`) | `many-of-one`, `staggered-bento` | Mini faux UI per mode (Classic 4-bar choices, Survival hearts/elimination, Hardcore 10s blitz countdown, Lyrics blank phrase, Decade vinyl chips, Artist avatar badge, Album 2x2 artwork grid, Genre tag chips). Stills with hover accent. |
| **Speed Scoring** | `ScoringDemo` (`scoring-demo.tsx`) | Real UI preserved | Kept the real interactive response-time slider and point formula untouched. No faux UI substituted. |
| **Leaderboard** | `LeaderboardStageshow` (`leaderboard-stageshow.tsx`) | `table-edit`, `choreography` | Leaderboard window with All Time / Weekly / Monthly tabs. Authed cursor switches tabs, rows reorder, and scores roll dynamically via `<Count>`. Real "See full leaderboard" link kept intact. |
| **Achievements** | `AchievementsStageshow` (`achievements-stageshow.tsx`) | `payout-flow` | Generous payoff unlock toast: "Achievement Unlocked: First Win (+50 XP)", XP progress bar fills from 450 to 500, Level 15 badge roll with ample rest hold. Real badge list preserved. |
| **Final CTA** | `RoomSharePopover` (`room-share-popover.tsx`) | `share`, `presence` | Popover illustrating Room `VR426D` creation, copy button click animation ("Copied!"), and facepile player presence (YOU, JD, SM, AX joining). Real Play / Join room action buttons untouched. |

---

## 2. What Changed vs. Original

1. **Theme & Token Architecture**:
   - Mapped all Stageshow CSS tokens (`--ss-*`) to SongGame design system variables (`--primary`, `--surface-1/2`, `--border`, `--foreground`, etc.) in `songgame-look.css`.
   - All faux UI surfaces reactively switch live across Daylight (`light`), Vinyl Dark (`black`), and Rose (`rose`) themes.
2. **Hero Interactive-to-Authored Transition**:
   - Replaced static/mock stateful card ("click any answer to test") with a deterministic, authored Stageshow animation sequence simulating realistic multi-player gameplay.
3. **Preservation of Real Controls**:
   - Navigation links, join room code input, scoring response-time simulation slider, full leaderboard link, create-room mode links, and final CTA buttons remain genuine accessible interactive controls in the DOM.
4. **Banned Patterns Eliminated**:
   - Removed all sparkles, purple gradients, and generic letter-in-colored-square placeholders.
   - Used fictional song and artist names (*Neon Midnight* by *The Velvet Waves*, Room `VR426D`), abstract artwork, and deterministic values matching game rules (15s timer, 1,000 / 700 / 500 pts).

---

## 3. Rehearsal Gate Verification (`film.mjs --gate`)

Headless Chromium rehearsal runs passed with **0 never-intentional lines**:
- **Hero Stage**:
  - Cleared framing, crop, and layout checks.
  - Satellite phone positioned within stage gutters (`right: 18px; bottom: -40px`) with `overflow: hidden` on stage.
  - Option button grid gap adjusted to 10px (`tight control` gate check >= 8px satisfied).
  - Outcome: `rehearsal passed`.
- **How a Round Works Tiles (Stages 1–3)**:
  - Bounding geometry and scale factor 1:1 verified.
  - Corrected half-pixel glyph on checkmark icon (16px even-in-even box).
  - Outcome: `rehearsal passed`.
- **Leaderboard Stage**:
  - Tab switching motion, cursor coordinates, and `<Count>` number transitions verified.
  - Corrected medal icon sizes to 16px.
  - Outcome: `rehearsal passed`.
- **Achievements Stage**:
  - Toast slide-in and XP bar progress fill verified with generous payoff hold.
  - Outcome: `rehearsal passed`.
- **Final CTA Popover**:
  - Corrected text alignment of room code and share link (both aligned at 16px left inset).
  - Outcome: `rehearsal passed`.

---

## 4. Accessibility, Performance & Motion Constraints

- **Accessibility**: All faux UI stages wrapped in `aria-hidden="true"`, with `pointer-events: none` on presentation layers. Native buttons and links inside cards retain proper keyboard focus, labels, and `href` routes.
- **Prefers-Reduced-Motion**: Every `<Stage>` provides a complete `poster` state. When reduced motion is preferred, animations do not play and the calm poster frame is rendered immediately.
- **Hydration & Determinism**: All stage scripts use static deterministic seeds (zero `Math.random()`, zero unseeded `Date.now()` during SSR).
- **Responsive**: Compact stage configurations (`compact={{ below: ... }}`) provided for mobile column widths (280–350px).

---

## 5. What Was Not Checked

- Live audio streaming (explicitly forbidden and isolated in faux UI).
- Real backend WebSocket/socket.io connectivity for faux stages (simulated locally via authored scripts).
- WebGL or GPU acceleration variations on low-end hardware.
