import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export function PlayerAvatar({ src, name, size = 'md' }: { src?: string; name: string; size?: 'sm' | 'md' | 'lg' }) {
  const s = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10';
  return (<Avatar className={s}><AvatarImage src={src} /><AvatarFallback>{name[0]}</AvatarFallback></Avatar>);
}