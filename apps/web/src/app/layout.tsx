import type { Metadata, Viewport } from 'next';
import { Inter, Unbounded, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { AmbientBackground } from '@/components/glass/ambient-background';
import { OfflineNotice } from '@/components/shared/offline-notice';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const unbounded = Unbounded({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://songgame.app'),
  title: {
    default: 'SongGame - Multiplayer Music Trivia',
    template: '%s | SongGame',
  },
  description: 'Real-time music trivia. Hear a 15-second clip, name it first, and race your friends in a live room.',
  keywords: ['music trivia', 'multiplayer game', 'song guessing', 'music quiz', 'party game'],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    siteName: 'SongGame',
    title: 'SongGame - Multiplayer Music Trivia',
    description: 'Real-time music trivia. Hear a 15-second clip, name it first, and race your friends in a live room.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SongGame - Multiplayer Music Trivia',
    description: 'Real-time music trivia. Hear a 15-second clip, name it first, and race your friends in a live room.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#121016',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="black" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var params = new URLSearchParams(window.location.search);
                  var t = params.get('theme') || localStorage.getItem('app-theme');
                  if (!t || (t !== 'black' && t !== 'rose' && t !== 'light')) {
                    t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'black' : 'light';
                  }
                  document.documentElement.setAttribute('data-theme', t);
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${unbounded.variable} ${jetbrainsMono.variable} font-sans antialiased text-[var(--foreground)] bg-[var(--background)] min-h-[100dvh] relative selection:bg-[var(--primary)] selection:text-[var(--primary-foreground)]`}
      >
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <AmbientBackground />
        <OfflineNotice />
        <Providers>
          <div id="main-content" tabIndex={-1} className="outline-none">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
