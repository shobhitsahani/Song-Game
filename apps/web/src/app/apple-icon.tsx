import { ImageResponse } from 'next/og';

export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0d0c11',
          borderRadius: '40px',
        }}
      >
        <svg
          width="130"
          height="130"
          viewBox="0 0 28 28"
          fill="none"
        >
          {/* Outer vinyl rim */}
          <circle cx="14" cy="14" r="12" stroke="#2b5cf6" strokeWidth="2.2" />
          {/* Subtle audio groove */}
          <circle cx="14" cy="14" r="8" stroke="#2b5cf6" strokeWidth="1.2" opacity="0.6" />
          {/* Dynamic 3-bar equalizer at vinyl center */}
          <line x1="10.5" y1="12" x2="10.5" y2="16" stroke="#2b5cf6" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="14" y1="8" x2="14" y2="20" stroke="#2b5cf6" strokeWidth="2.6" strokeLinecap="round" />
          <line x1="17.5" y1="11" x2="17.5" y2="17" stroke="#2b5cf6" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
