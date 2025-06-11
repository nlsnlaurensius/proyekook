import React, { useEffect, useState } from 'react';

// Vite way: import all walk frames dynamically
const walkFrames = Object.values(
  import.meta.glob('../assets/walk/*.png', { eager: true, as: 'url' })
).sort();

const NotFoundPage: React.FC = () => {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(f => (f + 1) % walkFrames.length);
    }, 60); // lebih cepat
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-black text-center p-8">
      <h1 className="text-6xl md:text-7xl font-extrabold text-cyan-300 drop-shadow-lg mb-4 neon-glow animate-pulse">
        404: Lost in Neon City
      </h1>
      <div className="w-96 h-96 flex items-center justify-center mb-2">
        <img
          src={walkFrames[frame] as string}
          alt="Neon Runner Walk Animation"
          className="w-full h-full object-contain drop-shadow-glow"
          draggable={false}
        />
      </div>
      <a
        href="/home"
        className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-lg shadow-lg hover:scale-105 hover:shadow-cyan-400/40 transition-all duration-300"
      >
        Back to Home
      </a>
    </div>
  );
};

export default NotFoundPage;
