import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Song Game - Multiplayer Music Trivia',
    template: '%s | Song Game',
  },
  description: 'Challenge your friends in real-time music trivia. Listen to song clips, guess the title, and climb the leaderboard.',
  keywords: ['music trivia', 'multiplayer game', 'song guessing', 'party game', 'music quiz'],
  openGraph: {
    type: 'website',
    siteName: 'Song Game',
    title: 'Song Game - Multiplayer Music Trivia',
    description: 'Challenge your friends in real-time music trivia.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Song Game - Multiplayer Music Trivia',
    description: 'Challenge your friends in real-time music trivia.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0a1a',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
