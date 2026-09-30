import type { Metadata, Viewport } from 'next';
import { Unbounded, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const display = Unbounded({
  subsets: ['latin'],
  weight: ['500', '600', '800'],
  variable: '--font-display',
  display: 'swap',
});

const sans = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

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
  viewportFit: 'cover',
  themeColor: '#070610',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#f7a83a" />
        <meta name="msapplication-TileColor" content="#070610" />
      </head>
      <body className={`${sans.variable} ${display.variable} font-sans antialiased`}>
        <a href="#main-content" className="skip-link">Skip to content</a>
        <Providers>
          <div id="main-content">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
