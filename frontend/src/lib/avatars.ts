export interface DicebearAvatar {
  id: string;
  url: string;
}

const ANIMALS = ['🦁', '🐯', '🐻', '🐼', '🐨', '🦊', '🐸', '🐵', '🦄', '🐙'];
const BACKGROUNDS = ['b6e3f4', 'ffd5dc', 'ffdfbf', 'd1f4d9', 'dbeafe', 'fde68a', 'ddd6fe', 'fecdd3', 'a7f3d0', 'fbcfe8'];

function animalAvatar(emoji: string, bg: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" rx="64" fill="#${bg}"/><text x="64" y="84" font-size="72" text-anchor="middle" dominant-baseline="middle">${emoji}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const DICEBEAR_AVATARS: DicebearAvatar[] = ANIMALS.map((emoji, i) => ({
  id: `animal-${i + 1}`,
  url: animalAvatar(emoji, BACKGROUNDS[i]),
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
