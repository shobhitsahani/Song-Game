'use client';
import { Music, Home, Plus, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/create-room', label: 'Create', icon: Plus },
  { href: '/join-room', label: 'Join', icon: Music },
  { href: '/profile', label: 'Profile', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden" aria-label="Mobile navigation">
      <div className="glass border-t border-white/10 pb-safe">
        <div className="flex items-center justify-around h-16">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <Link key={href} href={href} className={cn('flex flex-col items-center gap-0.5 px-3 py-1 transition-colors', isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground')} aria-label={label} aria-current={isActive ? 'page' : undefined}>
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
