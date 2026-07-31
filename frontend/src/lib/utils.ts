import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatXp(xp: number): string {
  if (xp >= 1000000) return `${(xp / 1000000).toFixed(1)}M`;
  if (xp >= 1000) return `${(xp / 1000).toFixed(1)}K`;
  return xp.toString();
}

export function generateAvatarUrl(username: string): string {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(username)}`;
}

export function getLevelProgress(xp: number): { level: number; currentXp: number; nextLevelXp: number; progress: number } {
  const level = Math.floor(Math.sqrt(xp / 100)) + 1;
  const nextLevelXp = Math.pow(level, 2) * 100;
  const currentXp = xp - Math.pow(level - 1, 2) * 100;
  const progress = currentXp / (nextLevelXp - Math.pow(level - 1, 2) * 100);
  return { level, currentXp, nextLevelXp, progress: Math.min(progress, 1) };
}

export function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function getScoreEmoji(score: number): string {
  if (score >= 1000) return "🏆";
  if (score >= 700) return "⭐";
  if (score >= 500) return "👍";
  return "💪";
}

export function getScoreColor(score: number): string {
  if (score >= 1000) return "text-yellow-400";
  if (score >= 700) return "text-green-400";
  if (score >= 500) return "text-blue-400";
  return "text-gray-400";
}

export function getProgressColor(percentage: number): string {
  if (percentage >= 80) return "bg-green-500";
  if (percentage >= 60) return "bg-yellow-500";
  if (percentage >= 40) return "bg-orange-500";
  return "bg-red-500";
}
