import type { Metadata, Viewport } from 'next';
import { Inter, Unbounded, JetBrains_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { cookies } from 'next/headers';
import './globals.css';
import { Providers } from './providers';
import { AmbientBackground } from '@/components/glass/ambient-background';
import { OfflineNotice } from '@/components/shared/offline-notice';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'optional',
});

const unbounded = Unbounded({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'optional',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'optional',
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
  themeColor: '#f8fafc',
};

const THEME_COLORS: Record<string, string> = {
  black: '#121016',
  rose: '#241219',
  light: '#f8fafc',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get('song-game-theme-v2')?.value;
  const initialTheme = (themeCookie === 'black' || themeCookie === 'rose' || themeCookie === 'light') ? themeCookie : 'light';
  const initialThemeColor = THEME_COLORS[initialTheme] || THEME_COLORS.light;

  return (
    <html
      lang="en"
      data-theme={initialTheme}
      style={{ colorScheme: initialTheme === 'light' ? 'light' : 'dark' }}
      suppressHydrationWarning
    >
      <head>
        <meta name="theme-color" content={initialThemeColor} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var params = new URLSearchParams(window.location.search);
                  var t = params.get('theme') || localStorage.getItem('song-game-theme-v2');
                  if (!t || (t !== 'black' && t !== 'rose' && t !== 'light')) {
                    t = 'light';
                  }
                  document.documentElement.setAttribute('data-theme', t);
                  document.documentElement.style.colorScheme = (t === 'light' ? 'light' : 'dark');
                  var meta = document.querySelector('meta[name="theme-color"]');
                  var colors = { black: '#121016', rose: '#241219', light: '#f8fafc' };
                  if (meta) meta.setAttribute('content', colors[t] || '#f8fafc');
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
        <Analytics />
      </body>
    </html>
  );
}
