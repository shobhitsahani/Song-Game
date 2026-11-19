import { ImageResponse } from 'next/og';

export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
  const blue = '#004bb7';
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
        }}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
        >
          {/* Outer vinyl rim */}
          <circle cx="14" cy="14" r="12.5" stroke={blue} strokeWidth="1.75" />
          {/* Subtle audio groove */}
          <circle
            cx="14"
            cy="14"
            r="8.5"
            stroke={blue}
            strokeWidth="1"
            strokeDasharray="3 2"
            opacity="0.6"
          />
          {/* Dynamic 3-bar equalizer at vinyl center */}
          <line
            x1="11"
            y1="12"
            x2="11"
            y2="16"
            stroke={blue}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="14"
            y1="9"
            x2="14"
            y2="19"
            stroke={blue}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <line
            x1="17"
            y1="11"
            x2="17"
            y2="17"
            stroke={blue}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
