# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Music fans playing short rounds (3-10 min) on a phone or laptop, often competing with friends in real-time or solo.

## Product Purpose

A real-time multiplayer and solo music trivia game where players guess song titles, artists, and lyrics against the clock, compete on leaderboards, and experience music in a tactile, late-night listening room aesthetic.

## Positioning

The music game where music is the hero: tactile liquid-glass surfaces, instant feedback (<100ms), zero waiting on animations, and pure sonic focus.

## Operating Context

Quick play sessions during commutes, casual hangouts, party games with room codes, or competitive rounds on desktop and mobile browsers.

## Capabilities and Constraints

- Real-time multiplayer rooms with WebSockets and unique shareable room codes.
- Game modes: Classic, Artist, Album, Lyrics, Genre, Decade, Hardcore, Survival.
- Dynamic round lengths (5, 10, 15, 20 rounds) and guess time limits (10-30s).
- Audio previews streamed from music sources with volume and mute toggles.
- Preserve all existing game logic, scoring, socket protocol, and routes.

## Brand Commitments

- Register: consumer game
- Name: Song Game / Music Trivia
- Voice: warm, short, confident, plain.

## Product Principles

1. **Music is the hero**: Visuals and audio place the music front and center.
2. **Playful but not childish**: Sophisticated late-night listening lounge mood, not cartoonish or over-decorated.
3. **One primary action per screen**: Eliminate visual clutter; thumb-zone primary action.
4. **Instant feedback**: Responsive under 100ms; inputs lock and acknowledge instantly.
5. **Never make the player wait for an animation**: All transitions are snappy (<240ms) and skippable.

## Accessibility & Inclusion

- WCAG 2.2 AA compliant.
- Full keyboard support (1-4 / A-D hotkeys for trivia options).
- High-contrast fallbacks for liquid glass.
- Reduced motion overrides and respect for system preferences.
