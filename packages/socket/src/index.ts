export const SOCKET_EVENTS = {
  // Room events
  ROOM_JOIN: 'room:join',
  ROOM_LEAVE: 'room:leave',
  ROOM_READY: 'room:ready',
  ROOM_CHAT: 'room:chat',
  ROOM_UPDATE_SETTINGS: 'room:update-settings',
  ROOM_KICK: 'room:kick',
  ROOM_BAN: 'room:ban',
  ROOM_PASSWORD: 'room:password',
  ROOM_JOINED: 'room:joined',
  ROOM_PLAYER_JOINED: 'room:player-joined',
  ROOM_PLAYER_LEFT: 'room:player-left',
  ROOM_PLAYER_READY: 'room:player-ready',
  ROOM_CHAT_MESSAGE: 'room:chat-message',
  ROOM_SETTINGS_UPDATED: 'room:settings-updated',
  ROOM_HOST_MIGRATED: 'room:host-migrated',
  ROOM_KICKED: 'room:kicked',
  ROOM_PLAYER_KICKED: 'room:player-kicked',
  ROOM_PASSWORD_REQUIRED: 'room:password-required',

  // Game events
  GAME_START: 'game:start',
  GAME_GUESS: 'game:guess',
  GAME_COUNTDOWN: 'game:countdown',
  GAME_ROUND_START: 'game:round-start',
  GAME_AUDIO_PLAY: 'game:audio-play',
  GAME_TIMER_UPDATE: 'game:timer-update',
  GAME_GUESS_RESULT: 'game:guess-result',
  GAME_LEADERBOARD: 'game:leaderboard',
  GAME_ROUND_END: 'game:round-end',
  GAME_END: 'game:end',

  // Player events
  PLAYER_RECONNECT: 'player:reconnect',
  PLAYER_RECONNECTED: 'player:reconnected',

  // Friend events
  FRIEND_ONLINE: 'friend:online',
  FRIEND_OFFLINE: 'friend:offline',

  // Notification events
  NOTIFICATION_NEW: 'notification:new',

  // XP / Achievement events
  XP_UPDATE: 'xp:update',
  ACHIEVEMENT_UNLOCK: 'achievement:unlock',

  // Error events
  ERROR: 'error',
} as const;

export type SocketEvent = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];
