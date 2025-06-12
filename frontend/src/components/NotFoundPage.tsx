import React, { useEffect, useState } from 'react';

const walkFrames = Object.values(
  import.meta.glob('../assets/walk/*.png', { eager: true, as: 'url' })
).sort();

interface NotFoundPageProps {
  onBack: () => void;
}

const NotFoundPage: React.FC<NotFoundPageProps> = ({ onBack }) => {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(f => (f + 1) % walkFrames.length);
    }, 60);
    return () => clearInterval(interval);
  }, []);

  const [isPortrait, setIsPortrait] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    function handleResize() {
      const portrait = window.innerHeight > window.innerWidth;
      setIsPortrait(portrait);
      setIsMobile(window.innerWidth <= 900);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  if (isMobile && isPortrait) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-black text-center p-8 gap-8">
        <h1 className="text-4xl font-extrabold text-cyan-300 neon-glow drop-shadow-lg animate-pulse select-none mb-2">
          404: Lost in Neon City
        </h1>
        <div className="w-32 h-32 flex items-center justify-center mb-2 mx-auto">
          <img
            src={walkFrames[frame] as string}
            alt="Neon Runner Walk Animation"
            className="w-full h-full object-contain drop-shadow-glow"
            draggable={false}
          />
        </div>
        <a
          href="/home"
          className="w-full max-w-xs bg-black/60 px-4 py-3 rounded-lg border-2 border-cyan-400/30 text-cyan-300 font-semibold hover:bg-cyan-900/30 transition flex items-center justify-center gap-3 shadow-lg text-lg mt-4"
        >
          Back to Home
        </a>
      </div>
    );
  }

  if (isMobile && !isPortrait) {
    return (
      <div className="fixed left-0 top-0 w-[100vw] h-[100vh] flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-black overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-purple-500/10"></div>
          <div className="grid grid-cols-12 grid-rows-12 h-full w-full">
            {Array.from({ length: 144 }).map((_, i) => (
              <div key={i} className="border border-cyan-500/20 animate-pulse" style={{ animationDelay: `${(i * 50) % 3000}ms` }}></div>
            ))}
          </div>
        </div>
        <div className="absolute inset-0 pointer-events-none z-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-ping opacity-60" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 3}s`, animationDuration: `${2 + Math.random() * 2}s` }}></div>
          ))}
        </div>
        <div className="relative z-10 w-full max-w-lg flex flex-col items-center justify-center mx-auto gap-4 px-2 py-4 text-center">
          <h1 className="text-3xl font-extrabold text-cyan-300 neon-glow drop-shadow-lg animate-pulse select-none mb-1">404: Lost in Neon City</h1>
          <div className="w-24 h-24 flex items-center justify-center mb-2 mx-auto">
            <img src={walkFrames[frame] as string} alt="Neon Runner Walk Animation" className="w-full h-full object-contain drop-shadow-glow" draggable={false} />
          </div>
          <a href="/home" className="w-full max-w-xs bg-black/60 px-4 py-3 rounded-lg border-2 border-cyan-400/30 text-cyan-300 font-semibold hover:bg-cyan-900/30 transition flex items-center justify-center gap-3 shadow-lg text-lg mt-2">
            Back to Home
          </a>
        </div>
      </div>
    );
  }

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
