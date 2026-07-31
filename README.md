# Song Game

Multiplayer music trivia game with real-time rooms, multiple game modes, achievements, leaderboards, and social features.

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 15, React 19, Tailwind CSS | SSR, SPA, styling |
| Backend | Express 4, Socket.IO 4 | REST API, real-time game state |
| Database | PostgreSQL 16, Prisma 5 | Persistent storage, ORM |
| Cache | Redis 7, ioredis | Room state, leaderboards, matchmaking, pub/sub |
| Auth | JWT, Deezer OAuth | Authentication |
| Proxy | Nginx | Reverse proxy, SSL, caching, load balancing |
| Container | Docker, Docker Compose | Development and production deployments |

## Quick Start

### Prerequisites
- Node.js 20+
- Docker (for PostgreSQL and Redis)
- npm

### Development Setup

```bash
# 1. Start infrastructure
docker compose up -d postgres redis

# 2. Backend
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma db push
npm run dev

# 3. Frontend (new terminal)
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

### Environment Variables

#### Backend (`backend/.env`)
| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `REDIS_URL` | Redis connection string | Yes |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | Yes |
| `DEEZER_APP_ID` | Deezer OAuth app ID | Yes |
| `DEEZER_APP_SECRET` | Deezer OAuth secret | Yes |
| `DEEZER_REDIRECT_URI` | OAuth callback URL | Yes |
| `YOUTUBE_API_KEY` | YouTube Data API key | No |
| `FRONTEND_URL` | Frontend URL for CORS | Yes |
| `NODE_ENV` | Environment (development/production) | No |
| `LOG_LEVEL` | Logging verbosity (debug/info/warn/error) | No |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in ms | No |
| `RATE_LIMIT_MAX` | Max requests per window | No |
| `REDIS_PREFIX` | Redis key prefix for multi-tenancy | No |
| `CORS_ORIGIN` | CORS allowed origin | No |

#### Frontend (`frontend/.env.local`)
| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_BACKEND_URL` | Backend API URL | Yes |

## API Documentation

### REST Endpoints

Base URL: `http://localhost:4000/api`

#### Authentication
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/auth/deezer/login` | Deezer OAuth login | No |
| GET | `/auth/deezer/callback` | OAuth callback | No |
| GET | `/auth/me` | Current user profile | Cookie |
| POST | `/auth/logout` | Logout | No |

#### Users
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/users/profile` | Profile with achievements | Yes |
| GET | `/users/stats` | Detailed game statistics | Yes |
| GET | `/users/xp-history` | XP transaction history | Yes |
| GET | `/users/achievements` | All user achievements | Yes |

#### Games
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/games` | Recent games (paginated) | Yes |
| GET | `/games/:id` | Game details | Yes |

#### Friends
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/friends` | Friend list with online status | Yes |
| GET | `/friends/requests` | Pending friend requests | Yes |
| POST | `/friends/request/:id` | Send friend request | Yes |
| POST | `/friends/accept/:id` | Accept friend request | Yes |
| POST | `/friends/reject/:id` | Reject friend request | Yes |
| DELETE | `/friends/:id` | Remove friend | Yes |
| GET | `/friends/teammates` | Recent teammates | Yes |
| GET | `/friends/favorites` | Favorite players | Yes |
| POST | `/friends/favorites/:id` | Add favorite | Yes |
| DELETE | `/friends/favorites/:id` | Remove favorite | Yes |
| GET | `/friends/mutual/:userId` | Mutual friends | Yes |

#### Leaderboards
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/leaderboards/global` | Global leaderboard | No |
| GET | `/leaderboards/xp` | XP leaderboard | No |
| GET | `/leaderboards/wins` | Wins leaderboard | No |
| GET | `/leaderboards/accuracy` | Accuracy leaderboard | No |
| GET | `/leaderboards/friends` | Friends leaderboard | Yes |

#### Other
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/notifications` | Notifications (paginated) | Yes |
| GET | `/daily` | Daily challenge | Yes |
| GET | `/playlists` | User playlists | Yes |
| GET | `/achievements` | All achievements | Yes |
| GET | `/health` | Health check (DB + Redis) | No |

All API responses use the format:
```json
{
  "success": true,
  "data": { ... },
  "pagination": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 }
}
```

Error responses:
```json
{
  "success": false,
  "error": { "code": "ERROR_CODE", "message": "Human-readable message" }
}
```

## Socket Events

### Client -> Server
| Event | Payload | Description |
|-------|---------|-------------|
| `room:join` | `code: string` | Join or create room |
| `room:leave` | - | Leave current room |
| `room:ready` | - | Toggle ready state |
| `room:chat` | `message: string` | Send chat message |
| `room:update-settings` | `settings: Partial<GameSettings>` | Update room settings (host only) |
| `room:kick` | `playerId: string` | Kick player (host only) |
| `room:ban` | `playerId: string` | Ban player (host only) |
| `room:typing` | `isTyping: boolean` | Typing indicator |
| `room:password` | `password: string` | Submit room password |
| `room:invite` | `targetUserId: string` | Invite friend |
| `room:quick-match` | - | Join quick match queue |
| `room:random` | - | Join random public room |
| `game:start` | - | Start game (host only) |
| `game:guess` | `answer: string` | Submit answer |
| `player:reconnect` | `roomCode: string` | Reconnect to room |

### Server -> Client
| Event | Payload | Description |
|-------|---------|-------------|
| `room:joined` | `room: RoomState` | Room state after join |
| `room:player-joined` | `player: PlayerSession` | New player joined |
| `room:player-left` | `playerId: string` | Player left |
| `room:player-ready` | `playerId, isReady` | Player ready toggle |
| `room:chat-message` | `message: ChatMessage` | New chat message |
| `room:settings-updated` | `settings: GameSettings` | Settings changed |
| `room:host-migrated` | `newHostId: string` | Host transferred |
| `room:player-kicked` | `playerId: string` | Player was kicked |
| `room:player-banned` | `playerId: string` | Player was banned |
| `room:typing` | `userId, username` | Someone is typing |
| `room:password-required` | - | Room needs password |
| `game:countdown` | `seconds: number` | Game start countdown |
| `game:round-start` | `round: RoundPayload` | New round started |
| `game:audio-play` | `url, duration` | Play audio clip |
| `game:guess-result` | `correct, points, answer` | Guess verdict |
| `game:round-end` | `results: Player[]` | Round results |
| `game:leaderboard` | `players: Player[]` | Current standings |
| `game:end` | `results: Player[]` | Game over |
| `friend:online` | `userId: string` | Friend came online |
| `friend:offline` | `userId: string` | Friend went offline |
| `notification:new` | `notification: Notification` | New notification |
| `xp:update` | `xp, level` | XP/level changed |
| `achievement:unlock` | `achievement: Achievement` | Achievement earned |

## Game Modes

| Mode | Description |
|------|-------------|
| CLASSIC | Guess the song title from audio clip |
| ARTIST | Guess the artist name |
| ALBUM | Guess the album title |
| LYRICS | Guess from lyric snippets |
| GENRE | Identify the music genre |
| DECADE | Guess the decade |
| HARDCORE | Shorter time, wrong answers penalize |
| SURVIVAL | Wrong answer = elimination |
| PARTY | Party-friendly, casual mode |
| CUSTOM | Customizable rules |

## Architecture

```
┌──────────┐    ┌──────────────┐    ┌────────────┐
│  Clients │───▶│   Nginx      │───▶│  Frontend  │
│  (HTTP/  │    │  (SSL, gzip, │    │  (Next.js) │
│  WS)     │    │   proxy)     │    └────────────┘
└──────────┘    └──────┬───────┘
                       │
              ┌────────┴────────┐
              │   /api/*        │
              │   /socket.io/*  │
              └────────┬────────┘
                       │
              ┌────────┴────────┐
              │    Backend      │
              │  (Express +     │
              │   Socket.IO)    │
              └───┬────┬───────┘
                  │    │
         ┌────────┘    └────────┐
         ▼                      ▼
   ┌──────────┐          ┌──────────┐
   │PostgreSQL│          │  Redis   │
   │  (Prisma)│          │ (Cache,  │
   │          │          │  Rooms,  │
   │          │          │  Pub/Sub)│
   └──────────┘          └──────────┘

Redis Usage:
  - Room State: songgame:room:{code} (TTL 2h)
  - Leaderboards: songgame:leaderboard:{type}
  - Matchmaking: matchmaking:queue, matchmaking:player:{id}
  - User Online: user:online:{id} (TTL 5min)
  - Game Cache: leaderboard:{type}, user:profile:{id}, user:stats:{id}
  - Distributed Locks: songgame:lock:{code} (TTL 5s)
  - Pub/Sub: songgame:{channel} (horizontal scaling)
```

## Deployment

### Production Build
```bash
# Build and start all services
docker compose up -d --build

# Or build individual services
docker compose build api frontend
docker compose up -d
```

### Scaling
- Multiple API instances behind Nginx (least_conn)
- Redis provides shared state across instances
- PostgreSQL connection pooling via `?connection_limit=10`
- Horizontal scaling: increase `upstream api_servers` in nginx.conf

## Testing

```bash
# Backend tests
cd backend
npm test                   # Run tests
npm run test:coverage      # With coverage
npm run test:watch         # Watch mode

# Frontend (Storybook)
cd frontend
npm run storybook
```

## CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/ci.yml`):
1. **Lint** - ESLint, TypeScript checks
2. **Security** - npm audit
3. **Test** - Vitest with PostgreSQL + Redis containers
4. **Build** - TypeScript compilation, Docker images
5. **Deploy** - (Manual) Push to production infrastructure

## Monitoring

- Health check: `GET /health` checks DB + Redis connectivity
- Structured JSON logging (use `LOG_LEVEL` env var)
- Request rate limiting (default: 100 req/min)
- Socket rate limiting (10 req/sec per socket)
- Graceful shutdown on SIGTERM/SIGINT

## Security

- HTTP security headers via Helmet (CSP, HSTS, X-Frame-Options, etc.)
- JWT authentication with httpOnly cookies
- Rate limiting on all API routes
- Socket authentication middleware
- Input validation and sanitization
- Cookie security (secure, httpOnly, sameSite)
- Nginx security headers + SSL/TLS
- CORS restricted to FRONTEND_URL
- Graceful error handling (no stack traces in production)
