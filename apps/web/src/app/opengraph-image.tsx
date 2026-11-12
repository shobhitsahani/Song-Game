import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'SongGame - Multiplayer Music Trivia';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '80px',
          background: 'radial-gradient(circle at 75% 50%, #2a1f10 0%, #0d0c11 100%)',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '640px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#000000',
                fontWeight: 'bold',
                fontSize: '24px',
              }}
            >
              ♫
            </div>
            <span style={{ fontSize: '36px', fontWeight: 'bold', letterSpacing: '-0.02em' }}>
              Song<span style={{ color: '#f59e0b' }}>Game</span>
            </span>
          </div>

          <h1
            style={{
              fontSize: '56px',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              marginBottom: '20px',
            }}
          >
            Name that track before the needle drops.
          </h1>

          <p style={{ fontSize: '24px', color: '#a1a1aa', lineHeight: 1.4 }}>
            Real-time music trivia. Hear a 15-second clip, name it first, and race your friends in a live room.
          </p>
        </div>

        {/* Vinyl Disc Visual */}
        <div
          style={{
            width: '380px',
            height: '380px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #f59e0b 0%, #d97706 20%, #18181b 21%, #09090b 100%)',
            border: '8px solid #27272a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: '#09090b',
              border: '4px solid #f59e0b',
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
