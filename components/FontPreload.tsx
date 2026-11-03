'use client';

export default function FontPreload() {
  return (
    <link
      rel="preload"
      href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@400;500;600;700&family=Noto+Sans+JP:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Noto+Sans+Ethiopic:wght@400;500;600;700&display=swap"
      as="style"
      onLoad={(e) => {
        (e.target as HTMLLinkElement).rel = 'stylesheet';
      }}
    />
  );
}
