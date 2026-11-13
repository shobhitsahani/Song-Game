# SongGame

> Real-time multiplayer music trivia battleground built with Next.js 15, React 19, Express, Socket.IO, and Turborepo.

[![Next.js](https://img.shields.io/badge/Next.js-15.1.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4.0-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4.21.0-grey?style=flat-square&logo=express)](https://expressjs.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8.0-010101?style=flat-square&logo=socketdotio)](https://socket.io/)
[![Prisma](https://img.shields.io/badge/Prisma-6.0.0-2d3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Turborepo](https://img.shields.io/badge/Turborepo-2.11.5-ef4444?style=flat-square&logo=turborepo)](https://turbo.build/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg?style=flat-square)](https://opensource.org/licenses/ISC)

---

## Table of Contents

- [1. Overview](#1-overview)
  - [Problem Solved](#problem-solved)
  - [Key Features](#key-features)
- [2. Visual Tour & Screenshots](#2-visual-tour--screenshots)
- [3. Tech Stack](#3-tech-stack)
- [4. High-Level Design (HLD)](#4-high-level-design-hld)
  - [Architecture Diagram](#architecture-diagram)
  - [Data & Request Flow](#data--request-flow)
- [5. Low-Level Design (LLD)](#5-low-level-design-lld)
  - [Repository & Monorepo Structure](#repository--monorepo-structure)
  - [Module Responsibilities](#module-responsibilities)
  - [Database Schema (Prisma)](#database-schema-prisma)
  - [REST API Endpoints](#rest-api-endpoints)
  - [WebSocket Contracts (Socket.IO)](#websocket-contracts-socketio)
  - [Game Lifecycle Sequence Flows](#game-lifecycle-sequence-flows)
  - [Audio Streaming & Fallback Engine](#audio-streaming--fallback-engine)
  - [Error Handling & Security](#error-handling--security)
- [6. Prerequisites](#6-prerequisites)
- [7. Getting Started](#7-getting-started)
  - [Clone Repository](#clone-repository)
  - [Install Dependencies](#install-dependencies)
  - [Environment Variables](#environment-variables)
  - [Database & Cache Setup](#database--cache-setup)
  - [Run in Development](#run-in-development)
  - [Build and Run in Production](#build-and-run-in-production)
  - [Lint & Typecheck](#lint--typecheck)
  - [Docker Instructions](#docker-instructions)
  - [Cross-Platform Commands (Windows / macOS / Linux)](#cross-platform-commands-windows--macos--linux)
- [8. Script Reference](#8-script-reference)
- [9. Deployment Guide](#9-deployment-guide)
  - [Render Deployment (API)](#render-deployment-api)
  - [Vercel Deployment (Web)](#vercel-deployment-web)
  - [Docker Production Deployment](#docker-production-deployment)
- [10. Troubleshooting](#10-troubleshooting)
- [11. Contributing & License](#11-contributing--license)

---

## 1. Overview

### Problem Solved
Traditional online music trivia games suffer from high latency, clunky user interfaces, single-player isolation, or reliance on expensive, proprietary music catalog subscriptions. 

**SongGame** provides a high-speed, tactile, multi-device music trivia battleground. Players join shared rooms using 6-character room codes, hear 15-second audio clips powered by legal public preview streams, and compete on instant speed-decay leaderboards with zero lag.

### Key Features
- **8 Distinct Game Modes**:
  - `CLASSIC`: Guess song title from 4 dynamic multiple-choice cards.
  - `ARTIST`: Identify the performing artist or band.
  - `ALBUM`: Match the preview to the correct album name and cover art.
  - `LYRICS`: Complete missing lyrics or identify matching tracks.
  - `GENRE`: Recognize musical genre categories.
  - `DECADE`: Pinpoint the release decade (70s, 80s, 90s, 2000s, 2010s, 2020s).
  - `HARDCORE`: 10-second compressed clips, strict 3-second buzzer countdowns, no hints.
  - `SURVIVAL`: Sudden-death knockout where a single wrong answer eliminates the player.
- **20+ Music Categories**: Curated collections including Pop, Rock, Hip-Hop, Electronic, R&B, Country, Indie, Jazz, Classical, Reggae, Metal, Latin, Hindi / Bollywood, Trending Global, Hits (2020s, 2015, 2010s), and TikTok Viral.
- **Speed-Bonus Scoring Formula**: Up to 1000 points for answers submitted within 3 seconds, 700 points for sub-6 seconds, and 500 points for remaining round time.
- **Synthesized Web Audio SFX**: Ultra-low-latency UI sound effects (ticks, correct buzzers, wrong buzzers, fanfare) generated on the fly via the browser's `AudioContext` — zero external audio assets to download.
- **Fault-Tolerant Audio Pipeline**: Primary preview streaming via the **Deezer API** (30s MP3), with transparent fallback to the **Apple Music / iTunes Search API** (30s AAC).
- **Liquid-Glass Design System**: Responsive CSS glassmorphism across 3 themes (`Vinyl Black`, `Rosewood`, and `Daylight`) with WebGL shader canvas background (`@paper-design/shaders-react`) and Phosphor duotone iconography.
- **Social & Progression**: Persistent XP calculation, 50-level milestone curve, friend lists, match invites, and global periodic leaderboards (weekly/monthly/all-time).

---

## 2. Visual Tour & Screenshots

| Vinyl Black Theme (Desktop) | Daylight Theme (Desktop) |
|:---:|:---:|
| ![Home Black Desktop](../docs/screenshots/home-black-desktop.png) | ![Home Light Desktop](../docs/screenshots/home-light-desktop.png) |

| Live Question with Timer | Instant Answer Feedback |
|:---:|:---:|
| ![Question Screen](../docs/screenshots/question-black-desktop.png) | ![Answer Feedback](../docs/screenshots/correct-black-desktop.png) |

| Final Round Results & Podium | Room Customization & Setup |
|:---:|:---:|
| ![Results Screen](../docs/screenshots/results-black-desktop.png) | ![Setup Screen](../docs/screenshots/setup-black-desktop.png) |

---

## 3. Tech Stack

| Layer | Technology | Purpose | Pinned Version |
|---|---|---|---|
| **Frontend Framework** | [Next.js](https://nextjs.org/) | React Server Components, App Router, static & standalone runner | `^15.1.0` |
| **Frontend Runtime** | [React](https://react.dev/) / [React DOM](https://react.dev/) | Core UI rendering engine | `^19.0.0` |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | Atomic styling and design token engine | `^4.0.0` |
| **Animations & Motion** | [Motion](https://motion.dev/) & [Framer Motion](https://www.framer.com/motion/) | Layout animations, page transitions, spring physics | `^14.12.0` / `^11.11.0` |
| **WebGL & 3D Shaders** | [@paper-design/shaders-react](https://paper.design/) & [Three.js](https://threejs.org/) | Ambient live canvas background shaders | `^0.0.82` / `^0.187.0` |
| **Iconography** | [@phosphor-icons/react](https://phosphoricons.com/) | Duotone UI icons across cards, buttons, badges | `^2.1.10` |
| **State Management** | [Zustand](https://zustand.docs.pmnd.rs/) | Client-side reactive game and session stores | `^5.0.0` |
| **UI Primitives** | [Radix UI](https://www.radix-ui.com/) | Accessible dialogs, tooltips, dropdowns, tabs, progress | `^1.1.0` - `^2.1.0` |
| **Notifications & Toasts** | [Sonner](https://sonner.emilkowal.ski/) | Liquid-glass toast notifications | `^1.7.0` |
| **Backend Framework** | [Express](https://expressjs.com/) | Node HTTP REST API, middleware, cookie parsing, security headers | `^4.21.0` |
| **Real-Time Gateway** | [Socket.IO](https://socket.io/) | Full-duplex WebSocket connection, heartbeat pings, room channels | `^4.8.0` |
| **Database ORM** | [Prisma](https://www.prisma.io/) | Schema modeling, migrations, type-safe PostgreSQL client | `^6.0.0` |
| **Primary Database** | [PostgreSQL](https://www.postgresql.org/) | Relational store for users, refresh tokens, friends, notifications | `16-alpine` |
| **In-Memory Cache** | [Redis](https://redis.io/) / [ioredis](https://github.com/redis/ioredis) | Lobby state, leaderboard caching, rate limit trackers | `7-alpine` / `^5.4.0` |
| **Monorepo Engine** | [Turborepo](https://turbo.build/) | Incremental multi-package task runner, caching, workspace links | `^2.11.5` |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | End-to-end type safety across packages and applications | `^5.6.0` |
| **Audio Providers** | Deezer API & Apple iTunes API | 30-second official streaming preview clips and track metadata | External Public APIs |
| **Containerization** | [Docker](https://www.docker.com/) & Docker Compose | Multi-stage Alpine containerization for API and web runner | Docker Compose `3.8` |

---

## 4. High-Level Design (HLD)

### Architecture Diagram

The system separates client rendering from stateful multiplayer synchronization. The Next.js frontend delivers static assets and UI state, while establishing a WebSocket connection to the Express backend.

```mermaid
graph TD
    subgraph Client ["Player Devices (Mobile & Desktop)"]
        Browser["Next.js Web Client<br/>(React 19, Motion, Tailwind v4)"]
        AudioCtx["Web Audio API<br/>(Synthesizer: SFX)"]
        AudioElem["HTML5 Audio Element<br/>(30s Stream)"]
    end

    subgraph CDN ["Edge Distribution"]
        VercelCDN["Vercel Edge Network<br/>(apps/web Hosting)"]
    end

    subgraph Gateway ["Real-Time & API Layer (Node.js 22)"]
        ExpressRouter["Express 4 REST Router<br/>(Port: 3001)"]
        SocketGateway["Socket.IO Server<br/>(Port: 3001)"]
        GameEngine["Game Room Engine<br/>(State Machine & Ticks)"]
        SongService["Audio Stream Selector<br/>(Deezer + Apple Fallback)"]
    end

    subgraph Persistence ["Persistence & Cache"]
        Postgres[(PostgreSQL 16<br/>Users, Tokens, Friends)]
        RedisCache[(Redis 7<br/>Lobby Cache & Leaderboards)]
    end

    subgraph ExternalAudio ["External Audio CDNs"]
        Deezer["Deezer API<br/>(30s MP3 Stream)"]
        iTunes["Apple Music / iTunes API<br/>(30s AAC Stream)"]
    end

    Browser -->|Static Pages & Hydration| VercelCDN
    Browser -->|HTTP REST: Auth, Users, Stats| ExpressRouter
    Browser -->|WebSocket: Room Sync, Guess, Scores| SocketGateway
    Browser --> AudioCtx
    AudioElem -.->|Stream Preview Audio| Deezer
    AudioElem -.->|Fallback Stream| iTunes

    SocketGateway --> GameEngine
    GameEngine --> SongService
    SongService -->|Fetch Track Metadata & Previews| Deezer
    SongService -.->|Fallback Query| iTunes

    ExpressRouter --> Postgres
    ExpressRouter --> RedisCache
    GameEngine --> RedisCache

    classDef client fill:#18181b,stroke:#f59e0b,stroke-width:2px,color:#fff;
    classDef server fill:#18181b,stroke:#3b82f6,stroke-width:2px,color:#fff;
    classDef storage fill:#18181b,stroke:#10b981,stroke-width:2px,color:#fff;
    classDef cdn fill:#18181b,stroke:#a855f7,stroke-width:2px,color:#fff;

    class Browser,AudioCtx,AudioElem client;
    class ExpressRouter,SocketGateway,GameEngine,SongService server;
    class Postgres,RedisCache storage;
    class VercelCDN,Deezer,iTunes cdn;
```

### Data & Request Flow
1. **Lobby Creation**: Host triggers `room:join` via WebSocket. The game engine generates a 6-character room code (`generateRoomCode()`), creates the lobby record, and joins the client socket to the room channel.
2. **Track Discovery**: When the host emits `game:start`, the API queries Deezer's chart or search API for the selected category. If Deezer fails or times out, it falls back to the Apple Music / iTunes API.
3. **Round Execution**: The server emits `game:round-start` with the 30-second audio stream URL, round counter, and 15-second duration. The client loads the audio element and counts down.
4. **Answer Submission**: The player clicks an answer card or inputs a guess. The client emits `game:guess` with the timestamp. The server verifies correctness via fuzzy matching (`checkAnswer`) and computes points using the speed-decay algorithm (`calculatePoints`).
5. **Leaderboard Broadcast**: Scores update in real time. After the final round, overall match standings and XP rewards are saved to PostgreSQL and broadcast via `game:end`.

---

## 5. Low-Level Design (LLD)

### Repository & Monorepo Structure

```
musicTrivia/
├── apps/
│   ├── api/                         # Backend Express + Socket.IO server
│   │   ├── prisma/
│   │   │   └── schema.prisma        # Database schema definitions
│   │   ├── src/
│   │   │   ├── config/              # env.ts, database.ts, redis.ts
│   │   │   ├── middleware/          # auth.ts, error.ts
│   │   │   ├── routes/              # auth, users, friends, leaderboard, health
│   │   │   ├── services/            # auth, friend, notification, song, deezer, itunes
│   │   │   ├── socket/              # Socket.IO connection & event handlers
│   │   │   └── index.ts             # Express & HTTP server bootstrap
│   │   └── package.json
│   └── web/                         # Frontend Next.js 15 application
│       ├── public/                  # Static assets and favicons
│       ├── src/
│       │   ├── app/                 # Next.js App Router (pages and layouts)
│       │   │   ├── achievements/    # Player badges & unlocks
│       │   │   ├── friends/         # Friend list and search
│       │   │   ├── leaderboard/     # Global & weekly rankings
│       │   │   ├── profile/         # User profile & stats
│       │   │   ├── room/            # Active game rooms & setup
│       │   │   ├── settings/        # Audio & theme preferences
│       │   │   └── page.tsx         # Homepage & room join modal
│       │   ├── components/          # React components
│       │   │   ├── game/            # GameScreen, AnswerOption, TimerRing
│       │   │   ├── glass/           # GlassPanel, GlassButton, GlassCard
│       │   │   ├── landing/         # HeroSection, Navbar, Footer, Features
│       │   │   └── ui/              # Radix UI wrappers & inputs
│       │   ├── lib/                 # sound-fx.ts, socket.ts, api.ts, motion.ts
│       │   ├── stores/              # Zustand game.ts and auth.ts stores
│       │   └── styles/              # Global Tailwind v4 CSS
│       └── package.json
├── packages/
│   ├── shared/                      # Scoring logic, room code gen, string normalizers
│   ├── socket/                      # Socket event constants and interfaces
│   ├── types/                       # Shared TypeScript interfaces (User, Room, etc.)
│   └── ui/                          # Shared React UI components
├── docker-compose.yml               # Local services (Postgres 16, Redis 7, API, Web)
├── Dockerfile                       # Multi-stage production Docker build
├── render.yaml                      # Render deployment specification for API
├── vercel.json                      # Vercel deployment specification for Web
├── turbo.json                       # Turborepo task pipeline configuration
├── TURBOREPO.md                     # Turborepo architecture guide
├── SOCKET_EVENTS.md                 # Real-time event protocol specification
└── package.json                     # Monorepo workspaces definition
```

### Module Responsibilities

| Package / Directory | Primary Responsibility |
|---|---|
| `apps/web` | Next.js 15 client handling page routing, WebGL shaders, Zustand stores, Web Audio SFX synthesis, and Socket.IO client connections. |
| `apps/api` | Express HTTP server and Socket.IO gateway. Orchestrates room timers, audio track fetching, game rules, and database CRUD. |
| `packages/shared` | Pure TypeScript domain helpers: `calculatePoints(time, maxTime)`, `checkAnswer(guess, correct)`, `generateRoomCode()`, `getLevel(xp)`, `getLevelProgress(xp)`. |
| `packages/socket` | Single source of truth for socket event names (`SOCKET_EVENTS`) and payloads across web and api. |
| `packages/types` | Shared contracts: `User`, `Room`, `Player`, `Round`, `GameMode`, `GameCategory`, `UserStats`. |
| `packages/ui` | Core button and primitives exported for multi-app monorepo sharing. |

### Database Schema (Prisma)

Managed via `apps/api/prisma/schema.prisma` targeting PostgreSQL:

```mermaid
erDiagram
    User ||--o{ RefreshToken : owns
    User ||--o{ Friend : initiates
    User ||--o{ Friend : receives
    User ||--o{ Notification : receives

    User {
        String id PK "UUID"
        String email UK "Unique, optional"
        String username UK "Unique player handle"
        String displayName "Display name"
        String avatar "Avatar URL"
        String googleId UK "Google OAuth ID"
        Boolean isGuest "Guest player flag"
        Int xp "Cumulative experience points"
        Int level "Player level (1-50)"
        Int wins "Total game wins"
        Int totalGames "Total matches played"
        DateTime createdAt
        DateTime updatedAt
    }

    RefreshToken {
        String id PK "UUID"
        String token UK "Hashed token"
        String userId FK "Foreign Key to User"
        DateTime expiresAt
        DateTime createdAt
    }

    Friend {
        String id PK "UUID"
        String userId FK "Initiating user"
        String friendId FK "Target user"
        Enum status "PENDING | ACCEPTED | BLOCKED"
        DateTime createdAt
    }

    Notification {
        String id PK "UUID"
        String userId FK "Target user"
        Enum type "FRIEND_REQUEST | FRIEND_ACCEPT | GAME_INVITE | ACHIEVEMENT_UNLOCK | LEVEL_UP | MATCH_START"
        String title "Title"
        String message "Body text"
        Json data "Contextual payload"
        Boolean read "Read status flag"
        DateTime createdAt
    }
```

### REST API Endpoints

The API router is served on `http://localhost:3001/api`:

| Method | Path | Auth Required | Description | Request Body / Query | Response Format |
|---|---|:---:|---|---|---|
| `GET` | `/health` | No | Liveness and uptime check | None | `{ success: true, data: { status, uptime } }` |
| `GET` | `/` | No | API service metadata | None | `{ name, status, socket, health }` |
| `POST` | `/auth/guest` | No | Generate ephemeral guest player session | None | `{ success: true, data: { user, tokens } }` |
| `POST` | `/auth/refresh` | No | Rotate expired access token | `{ refreshToken: string }` | `{ success: true, data: { tokens } }` |
| `POST` | `/auth/logout` | Optional | Clear session cookies and invalidate token | None | `{ success: true }` |
| `GET` | `/auth/google` | No | Initiate Google OAuth 2.0 flow | None | 302 Redirect to Google Accounts |
| `GET` | `/auth/google/callback` | No | OAuth callback handler | `?code=string` | Set auth cookies & redirect |
| `GET` | `/auth/me` | Yes (JWT) | Return current authenticated user profile | None | `{ success: true, data: SafeUser }` |
| `GET` | `/users/profile` | Yes (JWT) | Fetch profile details with level calculation | None | `{ success: true, data: SafeUser }` |
| `GET` | `/users/stats` | Yes (JWT) | Fetch win rates, XP, streak statistics | None | `{ success: true, data: UserStats }` |
| `GET` | `/users/search` | Yes (JWT) | Search users by username or display name | `?q=string` | `{ success: true, data: SafeUser[] }` |
| `GET` | `/friends` | Yes (JWT) | List accepted friends | None | `{ success: true, data: Friend[] }` |
| `GET` | `/friends/requests` | Yes (JWT) | List pending incoming friend requests | None | `{ success: true, data: FriendRequest[] }` |
| `POST` | `/friends/request/:id` | Yes (JWT) | Send friend request | None | `{ success: true }` |
| `POST` | `/friends/accept/:id` | Yes (JWT) | Accept pending friend request | None | `{ success: true }` |
| `POST` | `/friends/reject/:id` | Yes (JWT) | Decline friend request | None | `{ success: true }` |
| `DELETE`| `/friends/:id` | Yes (JWT) | Remove friend connection | None | `{ success: true }` |
| `GET` | `/leaderboard` | Yes (JWT) | Retrieve cached ranked players | `?period=weekly\|monthly\|all` | `{ success: true, data: LeaderboardEntry[] }` |
| `GET` | `/notifications` | Yes (JWT) | Retrieve recent notifications | None | `{ success: true, data: Notification[] }` |
| `GET` | `/notifications/unread-count`| Yes (JWT)| Count of unread notifications | None | `{ success: true, data: { count: number } }` |
| `POST` | `/notifications/:id/read` | Yes (JWT) | Mark notification as read | None | `{ success: true }` |
| `POST` | `/notifications/read-all` | Yes (JWT) | Mark all user notifications as read | None | `{ success: true }` |

### WebSocket Contracts (Socket.IO)

The real-time gateway runs on port 3001 using `@song-game/socket` event contracts:

| Event Constant | Direction | Payload Contract | Description |
|---|---|---|---|
| `room:join` | Client -> Server | `{ code: string, username: string, avatar?: string }` | Join or create room session |
| `room:leave` | Client -> Server | `{ code: string }` | Leave active room channel |
| `room:ready` | Client -> Server | `{ code: string, isReady: boolean }` | Toggle player readiness |
| `room:update-settings`| Client -> Server | `{ code: string, settings: Partial<RoomSettings> }` | Host updates game settings |
| `room:chat` | Client -> Server | `{ code: string, message: string }` | Send in-game chat message |
| `room:joined` | Server -> Client | `{ room: Room, player: Player }` | Confirm local join acknowledgment |
| `room:player-joined` | Server -> Room | `{ player: Player }` | Broadcast new player arrival |
| `room:player-left` | Server -> Room | `{ playerId: string, newHostId?: string }` | Broadcast player departure |
| `game:start` | Client -> Server | `{ code: string }` | Host initiates round sequence |
| `game:countdown` | Server -> Room | `{ seconds: number }` | 3-second pre-round countdown |
| `game:round-start` | Server -> Room | `{ roundNumber: number, duration: number, previewUrl: string, options: string[] }` | Starts audio playback & timer |
| `game:guess` | Client -> Server | `{ code: string, guess: string, time: number }` | Submit answer guess |
| `game:guess-result` | Server -> Client | `{ correct: boolean, points: number, correctTitle?: string }` | Real-time score feedback |
| `game:leaderboard` | Server -> Room | `{ scores: { playerId: string, score: number }[] }` | Live score broadcast |
| `game:round-end` | Server -> Room | `{ songTitle: string, artist: string, albumArt?: string, scores: Player[] }` | Reveal answer details |
| `game:end` | Server -> Room | `{ winner: Player, finalLeaderboard: Player[], xpGained: number }` | Final match conclusion |

### Game Lifecycle Sequence Flows

```mermaid
sequenceDiagram
    autonumber
    actor Host as Room Host
    actor Guest as Remote Player
    participant Server as Socket.IO Server
    participant Audio as Song Service

    Host->>Server: room:join { code: "VR426D", username: "HostUser" }
    Server-->>Host: room:joined { room, player }
    Guest->>Server: room:join { code: "VR426D", username: "PlayerTwo" }
    Server-->>Guest: room:joined { room, player }
    Server-->>Host: room:player-joined { player: PlayerTwo }

    Host->>Server: game:start { code: "VR426D" }
    Server->>Audio: fetchCategoryTracks("pop", 5)
    Audio-->>Server: [Tracks with 30s previewUrl]
    
    Server-->>Host: game:countdown { seconds: 3 }
    Server-->>Guest: game:countdown { seconds: 3 }

    Note over Host,Guest: Audio Previews stream directly to clients
    Server-->>Host: game:round-start { round: 1, duration: 15, previewUrl }
    Server-->>Guest: game:round-start { round: 1, duration: 15, previewUrl }

    Guest->>Server: game:guess { code: "VR426D", guess: "As It Was", time: 2.4 }
    Server->>Server: calculatePoints(2.4) -> 1000 pts
    Server-->>Guest: game:guess-result { correct: true, points: 1000 }
    Server-->>Host: game:leaderboard { scores }

    Server-->>Host: game:round-end { songTitle: "As It Was", artist: "Harry Styles" }
    Server-->>Guest: game:round-end { songTitle: "As It Was", artist: "Harry Styles" }
```

### Audio Streaming & Fallback Engine
The API utilizes a dual-provider music pipeline located in `apps/api/src/services/`:
1. **Deezer Service (`deezer.service.ts`)**: Queries `https://api.deezer.com/chart` and `https://api.deezer.com/search/track`. Deezer serves 30-second 128kbps MP3 preview streams.
2. **Apple Music / iTunes Service (`itunes.service.ts`)**: If Deezer encounters rate limits, network timeouts, or missing preview links, the query automatically delegates to `https://itunes.apple.com/search`, which serves 30-second 256kbps AAC audio streams.
3. **Web Audio Synthesizer (`apps/web/src/lib/sound-fx.ts`)**: Client interface sound effects (clicks, tick timers, correct chime, wrong buzzer, victory fanfare) are synthesized entirely client-side using native oscillators (`ctx.createOscillator()`) and gain envelopes.

### Error Handling & Security
- **Security Headers**: Express configures `helmet` with CSP exemptions for external audio CDN streaming (`api.deezer.com`, `audio-ssl.itunes.apple.com`).
- **Data Sanitization**: Answers are cleaned via `normalizeString` and HTML entities are escaped with `sanitizeHtml`.
- **CORS Protection**: Access restricted to `FRONTEND_URL` (`http://localhost:3000` or production Vercel domain) with credential forwarding.
- **Fail-Safe Startup**: If PostgreSQL or Redis are unreachable, the server logs a warning and proceeds in local guest mode, permitting room gameplay without a database connection.

---

## 6. Prerequisites

Ensure your host environment meets the following specifications before installing:

| Requirement | Exact Version | Verification Command |
|---|---|---|
| **Node.js** | `>= 20.0.0` (Node 22 LTS recommended) | `node --version` |
| **npm** | `>= 10.0.0` (`npm@11.9.0` pinned) | `npm --version` |
| **Docker Engine** | `>= 20.10.0` (Optional, for containers) | `docker --version` |
| **Docker Compose** | `>= 2.0.0` (Optional, for DB/Redis) | `docker compose version` |
| **PostgreSQL** | `16.x` (Optional if using Docker) | `psql --version` |
| **Redis** | `7.x` (Optional if using Docker) | `redis-cli --version` |

---

## 7. Getting Started

### Clone Repository

```bash
git clone https://github.com/shobhitsahani/music-trivia.git
cd music-trivia
```

### Install Dependencies

Install all monorepo dependencies:

```bash
npm install
```

---

### Environment Variables

#### Backend API (`apps/api/.env`)
Copy the example template:
```bash
cp apps/api/.env.example apps/api/.env
```

| Variable | Description | Where to Get | Default / Example Value |
|---|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | Local DB or cloud Postgres (Neon, Supabase) | `postgresql://songgame:songgame@localhost:5432/songgame?schema=public` |
| `REDIS_URL` | Redis connection URL | Local Redis instance or cloud provider | `redis://localhost:6379` |
| `JWT_SECRET` | Secret key for signing access tokens | Generate with `openssl rand -hex 32` | `change-me-to-a-secure-secret` |
| `JWT_REFRESH_SECRET` | Secret key for signing refresh tokens | Generate with `openssl rand -hex 32` | `change-me-to-another-secure-secret` |
| `GOOGLE_CLIENT_ID` | Google OAuth 2.0 Client ID | Google Cloud Console -> APIs -> Credentials | `""` (Optional) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 2.0 Client Secret | Google Cloud Console -> APIs -> Credentials | `""` (Optional) |
| `GOOGLE_CALLBACK_URL` | Google OAuth redirect URL | Matches redirect URL in Google Cloud | `http://localhost:3001/api/auth/google/callback` |
| `FRONTEND_URL` | Allowed CORS origin for Next.js app | Local dev or production domain | `http://localhost:3000` |
| `PORT` | API HTTP port | System port | `3001` |
| `NODE_ENV` | Application environment | Set `development` or `production` | `development` |

#### Frontend Web (`apps/web/.env.local`)
Create `apps/web/.env.local` (optional, sensible defaults already coded):

| Variable | Description | Default Value |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL for REST API calls | `http://localhost:3001/api` |
| `NEXT_PUBLIC_BACKEND_URL`| Base URL for Socket.IO connections | `http://localhost:3001` |
| `NEXT_STANDALONE` | Standalone Next.js container build flag | `1` (inside Docker only) |

---

### Database & Cache Setup

#### Option A: Run via Docker Compose (Recommended)
Launch PostgreSQL and Redis in the background:
```bash
docker compose up -d postgres redis
```

#### Option B: Use Existing Local / Remote Instances
If you already run Postgres and Redis locally, update `DATABASE_URL` and `REDIS_URL` in `apps/api/.env`.

#### Run Database Migrations
Generate the Prisma Client and sync the schema:
```bash
npm run db:generate
npm run db:push
```

---

### Run in Development

To start both the Next.js frontend (port 3000) and Express API (port 3001) concurrently with Turborepo:

```bash
npm run dev
```

To run services individually in separate terminals:
```bash
# Terminal 1: Backend API (port 3001)
npm run dev:api

# Terminal 2: Next.js Frontend (port 3000)
npm run dev:web
```

Once running:
- **Frontend**: Open [http://localhost:3000](http://localhost:3000) in your browser.
- **Backend API**: Accessible at [http://localhost:3001](http://localhost:3001) (Health check: [http://localhost:3001/api/health](http://localhost:3001/api/health)).

---

### Build and Run in Production

1. Compile all shared packages, database clients, and application bundles:
   ```bash
   npm run build
   ```

2. Start the production processes:
   ```bash
   # Start API server
   npm run start --workspace=apps-api

   # Start Next.js web server
   npm run start --workspace=apps-web
   ```

---

### Lint & Typecheck

Run static analysis across all monorepo workspaces:
```bash
npm run lint
npm run typecheck
```

---

### Docker Instructions

Run the complete multi-service stack (PostgreSQL, Redis, API, and Web) using Docker:

```bash
# Build images and start all containers in detached mode
docker compose up --build -d

# View container status
docker compose ps

# View live application logs
docker compose logs -f api web

# Stop all containers and clean up volumes
docker compose down
```

---

### Cross-Platform Commands (Windows / macOS / Linux)

| Task | Windows (PowerShell) | macOS / Linux (Bash / Zsh) |
|---|---|---|
| **Copy `.env.example`** | `Copy-Item apps/api/.env.example apps/api/.env` | `cp apps/api/.env.example apps/api/.env` |
| **Kill Port 3000** | `Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess \| Stop-Process -Force` | `lsof -ti :3000 \| xargs kill -9` |
| **Kill Port 3001** | `Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess \| Stop-Process -Force` | `lsof -ti :3001 \| xargs kill -9` |
| **Remove `.next` Cache** | `Remove-Item -Recurse -Force apps/web/.next` | `rm -rf apps/web/.next` |

---

## 8. Script Reference

| Command | Target Workspace | What It Does |
|---|---|---|
| `npm run dev` | All | Starts API and Web development servers concurrently via Turborepo (`concurrency=100`) |
| `npm run dev:api` | `apps-api` | Starts backend in watch mode using `tsx watch src/index.ts` |
| `npm run dev:web` | `apps-web` | Starts Next.js frontend with Turbopack on port 3000 |
| `npm run build` | All | Builds packages in dependency order (`types` -> `shared` -> `api`/`web`) |
| `npm run build:packages` | `packages/*` | Compiles only shared libraries (`@song-game/types`, `@song-game/shared`, etc.) |
| `npm run lint` | All | Executes ESLint on `apps/web` and TypeScript checks across packages |
| `npm run typecheck` | All | Runs `tsc --noEmit` across all workspaces |
| `npm run clean` | All | Deletes build artifacts (`dist`, `.next`, `.turbo`) |
| `npm run db:generate` | `apps-api` | Generates type-safe Prisma client code from `schema.prisma` |
| `npm run db:push` | `apps-api` | Pushes Prisma schema updates directly to the PostgreSQL database |
| `npm run db:migrate` | `apps-api` | Creates and executes Prisma migration files (`prisma migrate dev`) |

---

## 9. Deployment Guide

### Render Deployment (API)
The backend API is pre-configured for [Render](https://render.com) using [render.yaml](render.yaml):

1. Connect your repository to Render.
2. Render detects `render.yaml` as an Infrastructure-as-Code Blueprint.
3. Configuration settings applied:
   - **Service Name**: `song-game-api`
   - **Runtime**: `Node` (Free or Starter plan)
   - **Build Command**: `npm install --include=dev && npx turbo run db:generate build --filter=apps-api`
   - **Start Command**: `npm run start --workspace=apps-api`
   - **Health Check Path**: `/api/health`
4. Add environment variables: `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, and `FRONTEND_URL`.

### Vercel Deployment (Web)
The frontend Next.js app is configured for [Vercel](https://vercel.com) via [vercel.json](vercel.json):

1. Import the repository into Vercel.
2. Build & Output settings:
   - **Framework Preset**: `Next.js`
   - **Install Command**: `npm install`
   - **Build Command**: `npx turbo run build --filter=apps-web`
   - **Output Directory**: `apps/web/.next`
3. Configure Environment Variables:
   - `NEXT_PUBLIC_API_URL`: Your Render API URL (e.g., `https://song-game-api.onrender.com/api`)
   - `NEXT_PUBLIC_BACKEND_URL`: Your Render WebSocket URL (e.g., `https://song-game-api.onrender.com`)

### Docker Production Deployment
The multi-stage [Dockerfile](Dockerfile) employs Turborepo's `turbo prune` to build minimal self-contained containers:
```bash
docker build -t song-game:latest .
```

---

## 10. Troubleshooting

### 1. Port 3000 or 3001 Conflict (`EADDRINUSE`)
- **Symptom**: `Error: listen EADDRINUSE: address already in use :::3000` or `:::3001`.
- **Cause**: An orphaned Next.js process or previous Express server is holding the port.
- **Resolution**:
  - *Windows (PowerShell)*:
    ```powershell
    Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -ErrorAction SilentlyContinue | Stop-Process -Force
    Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess -ErrorAction SilentlyContinue | Stop-Process -Force
    ```
  - *macOS / Linux*:
    ```bash
    kill -9 $(lsof -ti :3000) 2>/dev/null || true
    kill -9 $(lsof -ti :3001) 2>/dev/null || true
    ```

### 2. Room Code Input Not Accepting Letters on Mobile
- **Symptom**: Virtual keyboard on mobile displays only numeric digits when trying to enter 6-character room codes (e.g., `VR426D`).
- **Cause**: Input components using `input-otp` default to `pattern="^\d+$"` and `inputMode="numeric"`.
- **Resolution**: Use the exported alphanumeric regex pattern:
  ```tsx
  import { REGEXP_ONLY_DIGITS_AND_CHARS } from '@/components/ui/input-otp';
  <InputOTP pattern={REGEXP_ONLY_DIGITS_AND_CHARS} inputMode="text" maxLength={6} ... />
  ```

### 3. PostgreSQL / Prisma Connection Failure (`P1001`)
- **Symptom**: `PrismaClientInitializationError: Can't reach database server at localhost:5432`.
- **Cause**: PostgreSQL container is stopped or `DATABASE_URL` is incorrect.
- **Resolution**:
  1. Confirm Postgres container status: `docker ps | grep postgres`.
  2. If stopped, start containers: `docker compose up -d postgres`.
  3. Validate connection string in `apps/api/.env`:
     `DATABASE_URL="postgresql://songgame:songgame@localhost:5432/songgame?schema=public"`

### 4. Direct `turbo` Command Fails with "No workspaces found"
- **Symptom**: Running `turbo run dev` from an outer parent folder fails to find packages.
- **Cause**: Turborepo configuration (`turbo.json`) and workspaces live inside `musicTrivia/`.
- **Resolution**: Always run `npm run <command>` from the project root or navigate into `musicTrivia/`.

### 5. Audio Playback Blocked by Browser Autoplay Policy
- **Symptom**: Music tracks do not play automatically upon round start; browser console displays `DOMException: play() failed because the user didn't interact with the document first`.
- **Cause**: Web browsers enforce strict user gesture requirements before enabling audio streams.
- **Resolution**: Ensure the player has interacted with the document (such as clicking the "Start Game", "Join Room", or "Ready" button) prior to the first round starting.

---

## 11. Contributing & License

### Contributing Workflow
1. **Fork** the repository and create your feature branch:
   ```bash
   git checkout -b feature/dynamic-genre-voting
   ```
2. **Commit** your changes following conventional commit syntax:
   ```bash
   git commit -m "feat(web): add voting tally ring to lobby component"
   ```
3. **Verify** code formatting, linting, and types:
   ```bash
   npm run lint
   npm run typecheck
   ```
4. **Push** to your fork and submit a Pull Request.

### Documentation References
- **Architecture & System Design**: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **Design Tokens & Theme System**: [DESIGN.md](DESIGN.md)
- **Product Requirements & Gameplay Rules**: [PRODUCT.md](PRODUCT.md)
- **Socket Events Catalog**: [SOCKET_EVENTS.md](SOCKET_EVENTS.md)

### License
This project is open-source software licensed under the **[ISC License](https://opensource.org/licenses/ISC)**.
