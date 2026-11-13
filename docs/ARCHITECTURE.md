# SongGame System Architecture & Specifications

Comprehensive High-Level Design (HLD) and Low-Level Design (LLD) specification for SongGame — real-time multiplayer music trivia platform.

---

## 1. High-Level Design (HLD)

### 1.1 System Architecture

SongGame operates on a distributed real-time architecture composed of:
1. **Next.js 15 Web Client**: App Router, React 19, Motion, and WebGL shader runtime.
2. **Express & Socket.IO Gateway**: Handles real-time room synchronization, game lifecycle ticks, scoring calculations, and REST APIs.
3. **Data & State Tier**: PostgreSQL 16 (persistent user accounts, progression, friends, notifications) and Redis 7 (room caching, ephemeral rate limits, leaderboards).
4. **External Audio Services**: Deezer API and Apple Music / iTunes Search API for 30-second legal audio preview streams.

```mermaid
graph TD
    subgraph Client ["Client Tier (Browser)"]
        UI["Next.js 15 Web App<br/>(React 19 + Tailwind v4 + Motion)"]
        AudioSynth["Web Audio API<br/>(SFX Synthesizer)"]
        AudioPlayer["HTML5 Audio Element<br/>(30s Music Preview)"]
        SocketClient["Socket.IO Client<br/>(Transport: WebSocket / Polling)"]
    end

    subgraph CDN ["Edge & Reverse Proxy"]
        Vercel["Vercel Edge<br/>(apps/web Hosting)"]
        Nginx["Nginx / Render Gateway<br/>(SSL + Reverse Proxy)"]
    end

    subgraph Backend ["Backend Gateway (Node.js 22 + Express)"]
        ExpressApp["Express 4 REST Router<br/>(Port: 3001)"]
        SocketServer["Socket.IO 4 Engine<br/>(Ping: 10s / Timeout: 5s)"]
        GameEngine["Game State Machine<br/>(Rounds, Timers, Scoring)"]
        AudioService["Song & Audio Service<br/>(Track Fetch & Fallbacks)"]
    end

    subgraph DataStorage ["Data & Cache Tier"]
        Postgres[(PostgreSQL 16<br/>Prisma ORM)]
        RedisCache[(Redis 7<br/>Lobbies & Leaderboard Cache)]
    end

    subgraph ExternalServices ["External Audio Providers"]
        DeezerAPI["Deezer API<br/>(api.deezer.com / 30s MP3)"]
        AppleAPI["Apple Music / iTunes API<br/>(itunes.apple.com / 30s AAC)"]
    end

    UI --> SocketClient
    UI --> AudioSynth
    AudioPlayer -.->|Stream Preview Audio| DeezerAPI
    AudioPlayer -.->|Fallback Stream| AppleAPI
    
    UI -->|HTTPS| Vercel
    SocketClient -->|WSS / HTTPS| Nginx
    Nginx --> ExpressApp
    Nginx --> SocketServer

    SocketServer --> GameEngine
    ExpressApp --> Postgres
    GameEngine --> RedisCache
    GameEngine --> AudioService
    AudioService -->|Search & Metadata Query| DeezerAPI
    AudioService -->|Fallback Query| AppleAPI

    classDef client fill:#1e1e24,stroke:#f59e0b,stroke-width:2px,color:#fff;
    classDef server fill:#18181b,stroke:#3b82f6,stroke-width:2px,color:#fff;
    classDef storage fill:#18181b,stroke:#10b981,stroke-width:2px,color:#fff;
    classDef external fill:#18181b,stroke:#ec4899,stroke-width:2px,color:#fff;

    class UI,AudioSynth,AudioPlayer,SocketClient client;
    class ExpressApp,SocketServer,GameEngine,AudioService server;
    class Postgres,RedisCache storage;
    class DeezerAPI,AppleAPI external;
```

---

## 2. Low-Level Design (LLD)

### 2.1 Database Architecture (ERD)

The relational schema is managed using **Prisma 6.0** targeting PostgreSQL:

```mermaid
erDiagram
    USER ||--o{ REFRESH_TOKEN : owns
    USER ||--o{ FRIEND : initiates
    USER ||--o{ FRIEND : receives
    USER ||--o{ NOTIFICATION : receives

    USER {
        string id PK "UUID"
        string email UK "Unique, optional"
        string username UK "Unique player handle"
        string displayName "Display Name"
        string avatar "Avatar URL"
        string googleId UK "Google OAuth ID"
        boolean isGuest "Guest player flag"
        int xp "Total progression XP"
        int level "Player level (1-50+)"
        int wins "Game victories"
        int totalGames "Total games played"
        datetime createdAt
        datetime updatedAt
    }

    REFRESH_TOKEN {
        string id PK "UUID"
        string token UK "Hashed refresh token"
        string userId FK "Foreign Key to User"
        datetime expiresAt "Expiration timestamp"
        datetime createdAt
    }

    FRIEND {
        string id PK "UUID"
        string userId FK "User initiating connection"
        string friendId FK "Target user connection"
        enum status "PENDING | ACCEPTED | BLOCKED"
        datetime createdAt
    }

    NOTIFICATION {
        string id PK "UUID"
        string userId FK "Recipient User"
        enum type "FRIEND_REQUEST | FRIEND_ACCEPT | GAME_INVITE | ACHIEVEMENT_UNLOCK | LEVEL_UP | MATCH_START"
        string title "Notification Title"
        string message "Notification Body"
        json data "Contextual Metadata"
        boolean read "Read status flag"
        datetime createdAt
    }
```

---

### 2.2 Real-Time Game Lifecycle Sequence Flow

The core game loop handles room synchronization, question distribution, audio clip streaming, buzzer/guessing, speed-decay scoring, and leaderboard broadcasts:

```mermaid
sequenceDiagram
    autonumber
    actor Host as Host Player
    actor Player2 as Guest Player
    participant Gateway as Socket.IO Gateway
    participant GameEngine as Room Game Engine
    participant AudioSvc as Song Service
    participant External as Deezer / iTunes API

    Note over Host,Player2: Phase 1: Room Creation & Lobby Sync
    Host->>Gateway: emit("room:join", { code: "VR426D", username: "HostUser" })
    Gateway->>GameEngine: Register player as room host
    Gateway-->>Host: emit("room:joined", { room, player })
    
    Player2->>Gateway: emit("room:join", { code: "VR426D", username: "Alex" })
    Gateway->>GameEngine: Add player to room.players
    Gateway-->>Player2: emit("room:joined", { room, player })
    Gateway-->>Host: emit("room:player-joined", { player })

    Note over Host,Player2: Phase 2: Game Countdown & Question Distribution
    Host->>Gateway: emit("game:start", { code: "VR426D" })
    Gateway->>AudioSvc: fetchRandomTracks(genre, count)
    AudioSvc->>External: GET /chart or /search/track
    External-->>AudioSvc: Track list with 30s previewUrl
    AudioSvc-->>Gateway: Prepared rounds data
    
    Gateway-->>Host: emit("game:countdown", { seconds: 3 })
    Gateway-->>Player2: emit("game:countdown", { seconds: 3 })
    
    Note over Gateway: 3-second countdown elapses
    Gateway-->>Host: emit("game:round-start", { roundNumber: 1, duration: 15, previewUrl })
    Gateway-->>Player2: emit("game:round-start", { roundNumber: 1, duration: 15, previewUrl })

    Note over Host,Player2: Phase 3: Guess Submission & Score Calculation
    Player2->>Gateway: emit("game:guess", { code: "VR426D", guess: "Billie Jean", time: 2.1 })
    GameEngine->>GameEngine: normalizeString & checkAnswer (Fuzzy match >= 70%)
    GameEngine->>GameEngine: calculatePoints(time=2.1) -> 1000 pts
    Gateway-->>Player2: emit("game:guess-result", { correct: true, points: 1000 })
    Gateway-->>Host: emit("game:leaderboard", { scores: [...] })

    Note over Host,Player2: Phase 4: Round End & Victory Tally
    Gateway-->>Host: emit("game:round-end", { songTitle, artist, scores })
    Gateway-->>Player2: emit("game:round-end", { songTitle, artist, scores })
    Gateway-->>Host: emit("game:end", { winner, finalLeaderboard, xpGained })
    Gateway-->>Player2: emit("game:end", { winner, finalLeaderboard, xpGained })
```

---

### 2.3 Audio Fallback Pipeline

Song preview clips are fetched with automatic fault-tolerant fallback:

```mermaid
flowchart TD
    Req[Fetch Track List for Category] --> DeezerTry[Query Deezer API<br/>https://api.deezer.com]
    DeezerTry --> DeezerCheck{Deezer 200 OK &<br/>Preview URL valid?}
    DeezerCheck -- Yes --> NormalizeD[Normalize Track Metadata<br/>30s MP3 Stream]
    DeezerCheck -- No / Timeout --> AppleTry[Query Apple iTunes API<br/>https://itunes.apple.com/search]
    AppleTry --> AppleCheck{iTunes 200 OK &<br/>Preview URL valid?}
    AppleCheck -- Yes --> NormalizeA[Normalize Track Metadata<br/>30s AAC Stream]
    AppleCheck -- No --> FallbackStatic[Return Cached Safe Category Pool]
    NormalizeD --> Output[Assemble Round Questions]
    NormalizeA --> Output
    FallbackStatic --> Output
```

---

## 3. Scoring & Progression Mathematical Models

### 3.1 Speed-Decay Scoring Formula

Points awarded per correct answer are strictly tiered based on response elapsed time $t$ in seconds:

$$\text{Points}(t) = \begin{cases} 
1000 & \text{if } t \le 3.0\text{s} \quad \text{(Speed Bonus)} \\
700 & \text{if } 3.0\text{s} < t \le 6.0\text{s} \quad \text{(Fast Guess)} \\
500 & \text{if } 6.0\text{s} < t \le t_{\max} \quad \text{(Standard Correct)} \\
0 & \text{otherwise}
\end{cases}$$

### 3.2 Answer Normalization & Fuzzy Matching

Answers undergo regex sanitization:
1. Strip all non-alphanumeric characters: `/[^a-z0-9\s]/g`
2. Collapse whitespace: `/\s+/g`
3. Convert to lowercase and trim.
4. If exact match fails, word tokenization checks overlap:
   $$\text{Match Ratio} = \frac{|\text{Tokens}_{\text{guess}} \cap \text{Tokens}_{\text{correct}}|}{\min(|\text{Tokens}_{\text{guess}}|, |\text{Tokens}_{\text{correct}}|)} \ge 0.70$$

### 3.3 Level Threshold Progression

Levels $L \in [1, 50]$ are computed from total accumulated experience points ($\text{XP}$):

$$T = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500, \dots]$$

Level $L$ is the largest index $i$ such that $\text{XP} \ge T[i-1]$. Progression percentage is calculated as:

$$\text{Progress} = \frac{\text{XP} - T[L-1]}{T[L] - T[L-1]}$$
