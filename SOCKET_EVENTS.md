# Socket.IO Events

## Connection

Clients authenticate via the `auth.token` or `query.token` handshake parameter (JWT).

```ts
const socket = io(SOCKET_URL, {
  auth: { token: 'jwt-token-here' },
});
```

---

## Client → Server Events

### Room Events

| Event | Payload | Description |
|-------|---------|-------------|
| `room:join` | `code: string, opts?: { username?: string; avatar?: string }` | Join an existing room by 6-character code, or create one with `'CREATE'`. `opts` overrides the player's display name and avatar for this room |
| `room:leave` | — | Leave the current room |
| `room:ready` | — | Toggle ready state |
| `room:chat` | `message: string` | Send a chat message (max 200 chars) |
| `room:update-settings` | `settings: Partial<GameSettings>` | Host updates room configuration |
| `room:kick` | `playerId: string` | Host kicks a player |
| `room:ban` | `playerId: string` | Host bans a player from the room |
| `room:typing` | `isTyping: boolean` | Typing indicator |
| `room:password` | `password: string` | Submit room password for protected rooms |
| `player:reconnect` | `roomCode: string` | Reconnect to a room after disconnect |

### Game Events

| Event | Payload | Description |
|-------|---------|-------------|
| `game:start` | — | Host starts the game |
| `game:guess` | `answer: string` | Submit an answer for the current round |

### Friend Events

| Event | Payload | Description |
|-------|---------|-------------|
| `friend:request` | `userId: string` | Send friend request |
| `friend:accept` | `userId: string` | Accept friend request |
| `friend:reject` | `userId: string` | Reject friend request |
| `friend:remove` | `userId: string` | Remove friend |

### Matchmaking Events

| Event | Payload | Description |
|-------|---------|-------------|
| `matchmaking:join` | `data: { mode, category, difficulty }` | Join matchmaking queue |
| `matchmaking:leave` | — | Leave matchmaking queue |

---

## Server → Client Events

### Room Events

| Event | Payload | Description |
|-------|---------|-------------|
| `room:joined` | `RoomState` | Full room state after joining |
| `room:player-joined` | `PlayerSession` | A player joined the room |
| `room:spectator-joined` | `PlayerSession` | A spectator joined the room |
| `room:player-left` | `playerId: string` | A player left the room |
| `room:player-ready` | `(playerId: string, isReady: boolean)` | Player ready state changed |
| `room:chat-message` | `ChatMessage` | New chat message |
| `room:chat-history` | `ChatMessage[]` | Last 30 chat messages sent on join/reconnect |
| `room:settings-updated` | `GameSettings` | Room settings changed |
| `room:host-migrated` | `newHostId: string` | Host transferred to another player |
| `room:kicked` | — | You were kicked from the room |
| `room:player-kicked` | `playerId: string` | A player was kicked |
| `room:player-banned` | `playerId: string` | A player was banned |
| `room:typing` | `(userId: string, username: string)` | Someone is typing |
| `room:password-required` | — | Room requires a password |
| `room:password-correct` | — | Password accepted |

### Game Events

| Event | Payload | Description |
|-------|---------|-------------|
| `game:mode-info` | `(mode: GameMode, info: { survival, hardcore, rounds, guessTime })` | Game mode details before start |
| `game:countdown` | `seconds: number` | Countdown before game/round starts |
| `game:round-start` | `RoundPayload` | New round data (varies by mode) |
| `game:audio-play` | `(url: string, duration: number)` | Audio clip to play |
| `game:guess-result` | `(correct: boolean, points: number, answer: string)` | Result of your guess |
| `game:round-end` | `PlayerSession[]` | Round results sorted by score |
| `game:leaderboard` | `PlayerSession[]` | Updated live leaderboard |
| `game:end` | `PlayerSession[]` | Final game results |

### Social Events

| Event | Payload | Description |
|-------|---------|-------------|
| `friend:online` | `userId: string` | Friend came online |
| `friend:offline` | `userId: string` | Friend went offline |
| `notification:new` | `Notification` | New notification |
| `xp:update` | `(xp: number, level: number)` | XP and level updated |
| `achievement:unlock` | `Achievement` | New achievement unlocked |
| `leaderboard:update` | `leaderboard: any` | Leaderboard updated |
| `player:reconnected` | `playerId: string` | Player reconnected to room |

### Error Events

| Event | Payload | Description |
|-------|---------|-------------|
| `error` | `message: string` | Error message |

---

## Data Types

### `RoomState`
```ts
{
  code: string;
  host: PlayerSession | null;
  players: PlayerSession[];
  spectators: PlayerSession[];
  settings: GameSettings;
  status: 'WAITING' | 'PLAYING' | 'FINISHED';
  mode: GameMode;
  playerCount: number;
  maxPlayers: number;
}
```

### `PlayerSession`
```ts
{
  id: string;
  userId?: string;
  username: string;
  avatar: string;
  score: number;
  correctAnswers: number;
  totalAnswers: number;
  avgResponseTime: number;
  rank: number;
  isHost: boolean;
  isReady: boolean;
  isSpectator: boolean;
  isAlive: boolean;
}
```

### `GameSettings`
```ts
{
  rounds: number;           // 3-20
  guessTime: number;        // 10-30s
  category: string;         // pop, rock, hip-hop, etc.
  difficulty: string;       // easy, medium, hard
  isPrivate: boolean;
  maxPlayers: number;       // 2-10
  allowSpectators: boolean;
  mode: GameMode;
  playlist?: string;        // optional Spotify playlist ID
}
```

### `GameMode`
```ts
type GameMode = 'CLASSIC' | 'ARTIST' | 'ALBUM' | 'LYRICS' | 'GENRE' | 'DECADE' | 'HARDCORE' | 'SURVIVAL' | 'PARTY' | 'CUSTOM';
```

### `RoundPayload` (varies by mode)
```ts
{
  roundNumber: number;
  totalRounds: number;
  mode: GameMode;
  duration: number;
  // Mode-specific fields:
  songTitle?: string;   // GENRE, DECADE modes
  artist?: string;      // ARTIST, ALBUM, LYRICS, GENRE, DECADE modes
  album?: string;       // ALBUM mode
  albumArt?: string;    // present in most modes
  lyrics?: string;      // LYRICS mode
}
```

### `ChatMessage`
```ts
{
  id: string;
  userId?: string;
  username: string;
  message: string;
  timestamp: number;
}
```

## Scoring

| Response Time | Points |
|---------------|--------|
| 1–3 seconds | 1000 |
| 4–6 seconds | 700 |
| 7–10 seconds | 500 |
| Wrong/Timeout | 0 |

**Hardcore Mode:** correct answers ×1.5, wrong answers −200
**Survival Mode:** wrong answer = elimination

## Room Lifecycle

1. Client sends `room:join` with `'CREATE'` to create a new room
2. Server generates a 6-character alphanumeric room code
3. Other clients join via `room:join` with the room code
4. Host configures settings via `room:update-settings`
5. Host sends `game:start`
6. Game loops through rounds (countdown → round start → guesses → round end)
7. Game ends → results persisted → XP/achievements awarded
8. Room auto-deleted after 60 seconds in FINISHED state
