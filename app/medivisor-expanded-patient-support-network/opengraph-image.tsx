import { ImageResponse } from 'next/og';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)',
          color: 'white',
          fontSize: 64,
          fontWeight: 'bold',
          textAlign: 'center',
          padding: '80px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 40,
          }}
        >
          <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="45" fill="white" fillOpacity="0.2" />
            <path
              d="M30 50 L45 65 L70 35"
              stroke="white"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div style={{ maxWidth: '90%', lineHeight: 1.2 }}>
          Medivisor Expanded Patient Support Network
        </div>
        <div style={{ fontSize: 32, marginTop: 24, opacity: 0.9 }}>
          Become a Health Ambassador
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
