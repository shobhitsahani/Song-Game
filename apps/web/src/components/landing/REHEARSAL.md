# Stageshow Rehearsal Report: SongGame Landing Page Revamp

## 1. Overview & Gold Reference Mapping

| Section | Component | Gold Reference(s) | Role & Focal Object |
| :--- | :--- | :--- | :--- |
| **Navbar** | `Navbar` (`navbar.tsx`) | Floating Capsule Bar | Floating capsule shell (`sticky top-3 sm:top-4 z-40 max-w-[1200px] mx-auto rounded-full border bg-background/80 backdrop-blur-md`). 3-zone layout: vinyl/equalizer mark + Fraunces wordmark on left, 4 centered links (`How it works`, `Modes`, `Leaderboard`, `Achievements`) with 36px capsule indicators, right-side controls with 40px round theme menu (swatches for Vinyl, Rose, Daylight), ghost "Join room" trigger, and capsule "Play" button with play icon. |
| **Hero Section** | `HeroSection` (`hero-section.tsx`) | Editorial Liner Notes | 45/55 desktop two-column layout. Balanced Fraunces headline max 3 lines (`clamp(2.5rem, 4.5vw, 4.25rem)`), honest 18-word subhead, unified OTP input with attached Join button, and quiet inline resume banner with zero layout jump. |
| **Hero Room Demo** | `HeroStageshow` (`hero-stageshow.tsx`) | `hero-demo`, `table-edit` | **Browser-only faux UI (phone completely removed)**. Desktop native Window (`https://songgame.app/room/VR426D`). Left: turntable deck with spinning grooved vinyl, tone arm, audio equalizer, hidden title ("Playing Clip · Mystery Track", no spoilers), 2x2 answers A-D. Right: players rail (You, Jordan, Sam, Alex). 5-beat story: needle drops -> cursor moves to B -> B locks at ~1.8s -> B turns emerald green, `+1,000 pts` rolls to You, standings reorder to You #1 with 4,250 pts -> hold payoff. |
| **How a Round Works** | `HowRoundWorks` (`how-round-works.tsx`) | `liner-notes`, `bento` | 3 editorial columns with large Fraunces numerals 1, 2, 3 joined by a clean top border (no nested cards):<br>1. *Hear the clip*: vinyl turntable, countdown `0:03 / 0:15`, waveform equalizer.<br>2. *Lock in*: Option B selected & confirmed with green checkmark and `Response time: 1.8s`.<br>3. *Beat the room*: consistent tabular rank numerals `#1`, `#2`, `#3`, avatars, and live score roll to 4,250 pts. Colored status filler ("Audio Sync OK") removed. |
| **Eight Ways to Play** | `EightWaysToPlay` (`eight-ways-to-play.tsx`) | `tracklist`, `window-preview` | Uneven bento eliminated. Left: 8-track LP tracklist (01 Classic to 08 Genre) with real accessible `<Link href="/room/create?mode=...">`. Right: ONE Stageshow browser preview window crossfading rules and settings dynamically on hover/focus. |
| **Scoring Demo** | `ScoringDemo` (`scoring-demo.tsx`) | Real UI preserved | Heading balanced with `text-wrap: balance` (orphan "more" fixed). 3 tiers as a clean 3-column legend. "Blitz Bonus" colored pill removed. Chart text enlarged to 12px. Custom-styled slider with clear label and live readout. |
| **Leaderboard** | `LeaderboardStageshow` (`leaderboard-stageshow.tsx`) | `table-edit`, `segmented-control` | Window with SegmentedControl tabs (All Time / Weekly / Monthly). Consistent tabular rank numerals 1-5 (inconsistent crowns/medals removed), avatars, levels, wins, and rolling `<Count>` scores. "Example standings" caption with "See full leaderboard" link directly below. Equalized column height. |
| **Achievements** | `AchievementsStageshow` (`achievements-stageshow.tsx`) | `payout-flow` | Clear, un-ghosted unlock toast (`opacity-100`, solid surface) with XP bar filling to 100% and Level 15 roll. 6 real badges as clean rows without tinted square boxes or pill borders. "View all achievements" link directly below. |
| **Final CTA** | `FinalCTA` (`final-cta.tsx`) | `share`, `presence` | Full-width band (card-in-card removed). Balanced headline and sentence. Lobby popover with real production host `https://songgame.app/room/VR426D`, "Copied!" feedback, cursor moves off copy button to rest position, avatars joining, and status in body font. |

---

## 2. Slop & Vibe-Coded Anti-Pattern Audit

| Banned Anti-Pattern | Status | What Replaced It |
| :--- | :--- | :--- |
| **Monospace microcopy in colored text** ("Audio Sync OK", "Speed: 1.8s", "Blitz Bonus") | **ELIMINATED** | Replaced with clean body font (`font-sans`), tabular figures where appropriate, and real product copy. |
| **Pills on everything** (`rounded-full` on badges, windows, cards) | **ELIMINATED** | Interactive buttons use clean capsule `rounded-full` with flat accent and no glow. Static elements standardized to radius scale: 6px small, 10px control/field, 14px card/dialog. Arbitrary pill badges and chips eliminated. |
| **Cards inside cards inside cards** | **ELIMINATED** | Replaced with editorial rules, clean borders, and full-width section bands. |
| **Huge 5-line hero headline** | **ELIMINATED** | Balanced 2–3 line headline (`clamp(2.5rem, 4.5vw, 4.25rem)`), Fraunces weight 600, leading 1.05. |
| **Phone covering hero answers** | **ELIMINATED** | Phone satellite deleted. Hero is a 2-column browser window (65% room / 35% roster rail). |
| **Hero clip card spoiling the answer** | **ELIMINATED** | Displays "Playing Clip · Mystery Track", vinyl grooves, tone arm, and equalizer. Answer revealed only after lock-in. |
| **Invented host domains** (`songgame.io`) | **ELIMINATED** | All faux UI URLs use the real production domain `https://songgame.app/room/...`. |
| **Cursor obscuring buttons** | **ELIMINATED** | In Final CTA popover, cursor clicks Copy and moves away to rest coordinates during the hold frame. |
| **Inconsistent leaderboard ranks** | **ELIMINATED** | Clean tabular numerals 1, 2, 3, 4, 5 across all rows. |
| **Ghosted/unreadable achievement toast** | **ELIMINATED** | Solid, legible surface with clear XP meter and level roll payoff. |

---

## 3. Typography & Theme System

- **Display Typeface**: `Fraunces` via `next/font/google` (variable optical size `opsz` 9–144, weight 600) for authentic record-sleeve editorial authority.
- **Body & Numeric Typeface**: `Hanken_Grotesk` via `next/font/google` with native tabular numerals (`font-variant-numeric: tabular-nums`).
- **Surface Themes**:
  - **Daylight (`light`)**: Warm paper neutrals (`oklch(0.982 0.006 85)` background, `oklch(0.18 0.012 85)` ink, vinyl blue accent).
  - **Vinyl (`black`)**: Warm charcoal vinyl (`oklch(0.12 0.008 75)` background, amber neon accent).
  - **Rose (`rose`)**: Deep plum vinyl (`oklch(0.13 0.025 350)` background, vibrant rose accent).
- Full-page before/after screenshots verified across all 3 themes at 1440px and 390px in `/tmp/after_*`.

---

## 4. Verification & Gate Checks

- **TypeScript Typecheck**: `turbo run typecheck` passes with **0 errors** across all 6 workspace packages (`apps-web`, `apps-api`, `@song-game/shared`, `@song-game/socket`, `@song-game/types`, `@song-game/ui`).
- **ESLint Linting**: `turbo run lint` passes with **0 errors**.
- **Next.js Production Build**: `turbo run build` completes successfully (`6 successful, 6 total`, all static and dynamic routes compiled).
- **Reduced Motion**: All Stageshow components (`Stage`, `HeroStageshow`, `HowRoundWorks`, `LeaderboardStageshow`, `AchievementsStageshow`, `RoomSharePopover`) provide static `poster` states; when `prefers-reduced-motion` is active, loops and transitions immediately lock to the calm payoff frame.
- **Accessibility**: Real links, input OTP, buttons, and segmented controls retain full keyboard focus and screen reader labels. All presentation stages carry `aria-hidden="true"`.

---

## 5. What Was Not Checked

- Live audio streaming during trivia rounds (simulated strictly via SVG waveform/groove animation in faux UI).
- Real backend multiplayer WebSocket socket.io traffic during simulated stages (client-side deterministic scripts only).
