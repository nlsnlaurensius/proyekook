import React from 'react';

interface BackgroundProps {
  cityBg: string;
}

const Background: React.FC<BackgroundProps> = ({ cityBg }) => (
  <>
    {/* Cyberpunk city background (parallax) */}
    <div className="absolute inset-0 pointer-events-none z-0">
      {/* Layer 1: Siluet gedung jauh */}
      <svg width="100%" height="180" style={{ position: 'absolute', bottom: 32, left: 0 }}>
        <rect x="0" y="80" width="60" height="100" fill="#222a" />
        <rect x="70" y="60" width="50" height="120" fill="#223a" />
        <rect x="130" y="100" width="80" height="80" fill="#223a" />
        <rect x="220" y="90" width="40" height="90" fill="#223a" />
        <rect x="270" y="70" width="100" height="110" fill="#223a" />
        <rect x="380" y="110" width="60" height="70" fill="#223a" />
        <rect x="450" y="80" width="90" height="100" fill="#223a" />
        <rect x="550" y="60" width="60" height="120" fill="#223a" />
        <rect x="620" y="100" width="80" height="80" fill="#223a" />
        <rect x="710" y="90" width="40" height="90" fill="#223a" />
        <rect x="760" y="70" width="100" height="110" fill="#223a" />
      </svg>
      {/* Layer 2: Gedung lebih dekat, lampu neon */}
      <svg width="100%" height="120" style={{ position: 'absolute', bottom: 32, left: 0 }}>
        <rect x="30" y="60" width="40" height="60" fill="#0ff8" />
        <rect x="120" y="40" width="30" height="80" fill="#f0f8" />
        <rect x="200" y="70" width="60" height="50" fill="#0ff8" />
        <rect x="300" y="50" width="40" height="70" fill="#f0f8" />
        <rect x="400" y="60" width="50" height="60" fill="#0ff8" />
        <rect x="500" y="40" width="30" height="80" fill="#f0f8" />
        <rect x="600" y="70" width="60" height="50" fill="#0ff8" />
        <rect x="700" y="50" width="40" height="70" fill="#f0f8" />
      </svg>
      {/* Lampu neon di gedung */}
      <div className="absolute left-40 bottom-44 w-2 h-8 bg-cyan-400 rounded-full blur-sm animate-pulse" />
      <div className="absolute left-80 bottom-52 w-2 h-8 bg-pink-400 rounded-full blur-sm animate-pulse" />
      <div className="absolute left-[60%] bottom-40 w-2 h-8 bg-yellow-400 rounded-full blur-sm animate-pulse" />
    </div>
    {/* Background cyberpunk city image */}
    <img
      src={cityBg}
      alt="Cyberpunk City Background"
      className="absolute inset-0 w-full h-full object-cover z-0 select-none pointer-events-none"
      style={{
        minHeight: '100vh',
        minWidth: '100vw',
        objectFit: 'cover',
        filter: 'brightness(0.7) saturate(1.2) blur(0.5px)',
      }}
      draggable={false}
    />
  </>
);

export default Background;
