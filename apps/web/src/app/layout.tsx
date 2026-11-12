import type { Metadata, Viewport } from 'next';
import { Inter, Unbounded, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { AmbientBackground } from '@/components/glass/ambient-background';

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
  title: {
    default: 'Song Game - Multiplayer Music Trivia',
    template: '%s | Song Game',
  },
  description: 'A late-night listening room for music fans. Real-time multiplayer trivia with tactile liquid glass and instant feedback.',
  keywords: ['music trivia', 'multiplayer game', 'song guessing', 'party game', 'music quiz', 'liquid glass'],
  openGraph: {
    type: 'website',
    siteName: 'Song Game',
    title: 'Song Game - Multiplayer Music Trivia',
    description: 'A late-night listening room for music fans. Real-time multiplayer trivia.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Song Game - Multiplayer Music Trivia',
    description: 'A late-night listening room for music fans.',
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
                  var t = localStorage.getItem('app-theme');
                  if (!t) {
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
