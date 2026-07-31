import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from './providers';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://songgame.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Song Game - Multiplayer Music Trivia',
    template: '%s | Song Game',
  },
  description: 'Challenge your friends in real-time music trivia. Listen to song clips, guess the title, and climb the leaderboard.',
  keywords: ['music trivia', 'multiplayer game', 'song guessing', 'party game', 'music quiz'],
  authors: [{ name: 'Song Game' }],
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    siteName: 'Song Game',
    title: 'Song Game - Multiplayer Music Trivia',
    description: 'Challenge your friends in real-time music trivia. Listen to song clips, guess the title, and climb the leaderboard.',
    url: siteUrl,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Song Game - Multiplayer Music Trivia',
    description: 'Challenge your friends in real-time music trivia. Listen to song clips, guess the title, and climb the leaderboard.',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Song Game',
  },
  applicationName: 'Song Game',
  category: 'game',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#0a0a1a',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#7c3aed" />
        <meta name="msapplication-TileColor" content="#0a0a1a" />
      </head>
      <body className="font-sans antialiased">
        <a href="#main-content" className="skip-link">Skip to content</a>
        <Providers>
          <div id="main-content">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
