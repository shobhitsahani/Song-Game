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
          fontSize: 90,
          background: '#0d0c11',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#f59e0b',
          borderRadius: '40px',
          border: '6px solid #f59e0b',
        }}
      >
        ♫
      </div>
    ),
    {
      ...size,
    }
  );
}
