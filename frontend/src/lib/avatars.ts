export const AVATAR_BASE = 'https://api.dicebear.com/7.x';

export interface DicebearAvatar {
  id: string;
  url: string;
}

export const DICEBEAR_AVATARS: DicebearAvatar[] = [
  'adventurer',
  'avataaars',
  'big-ears',
  'bottts',
  'croodles',
  'fun-emoji',
  'identicon',
  'lorelei',
  'micah',
  'miniavs',
  'open-peeps',
  'pixel-art',
].map((style) => ({
  id: style,
  url: `${AVATAR_BASE}/${style}/svg?seed=SongGame`,
}));

export const MAX_NAME_LENGTH = 20;

export interface RoomJoinProfile {
  name: string;
  avatar: string;
}

const PROFILE_KEY = 'sg-room-profile';

export function loadRoomJoinProfile(): RoomJoinProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.name === 'string' && typeof parsed?.avatar === 'string') {
      return { name: parsed.name, avatar: parsed.avatar };
    }
    return null;
  } catch {
    return null;
  }
}

export function saveRoomJoinProfile(profile: RoomJoinProfile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {}
}
