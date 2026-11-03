import { ImageResponse } from 'next/og';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function TwitterImage() {
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
        <div style={{ maxWidth: '90%', lineHeight: 1.2 }}>
          Medivisor Expanded Patient Support Network
        </div>
        <div style={{ fontSize: 32, marginTop: 24, opacity: 0.9 }}>
          Become a Health Ambassador
        </div>
        <div
          style={{
            marginTop: 48,
            fontSize: 24,
            opacity: 0.8,
            border: '2px solid white',
            padding: '12px 24px',
            borderRadius: 8,
          }}
        >
          medivisorindiatreatment.com
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
