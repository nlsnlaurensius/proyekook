import React, { useEffect, useRef } from 'react';
import { Play, Settings, LogOut, Trophy, Zap, Crown } from 'lucide-react';
import { Howl } from 'howler';
import homeMusicSrc from '../assets/sounds/home.mp3';
import coinImg from '../assets/coin.png';

export interface User {
  username: string;
  highScore: number;
  coin?: number; // Add coin field for coin balance
}

interface HomeScreenProps {
  user: User | null;
  onPlayNow: () => void;
  onSettings: () => void;
  onLeaderboard: () => void;
  onLogout: () => void;
  // Add music control props
  musicEnabled?: boolean;
  musicVolume?: number;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ user, onPlayNow, onSettings, onLeaderboard, onLogout, musicEnabled = true, musicVolume = 0.7 }) => {
  const musicRef = useRef<Howl | null>(null);
  useEffect(() => {
    if (musicRef.current) {
      musicRef.current.unload();
    }
    musicRef.current = new Howl({
      src: [homeMusicSrc],
      loop: true,
      volume: musicEnabled ? musicVolume : 0,
      html5: true,
    });
    if (musicEnabled && musicRef.current) {
      musicRef.current.play();
    }
    return () => {
      musicRef.current?.stop();
      musicRef.current?.unload();
    };
  }, [musicEnabled, musicVolume]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-purple-500/10"></div>
        <div className="grid grid-cols-12 grid-rows-12 h-full w-full">
          {Array.from({ length: 144 }).map((_, i) => (
            <div
              key={i}
              className="border border-cyan-500/20 animate-pulse"
              style={{ animationDelay: `${(i * 50) % 3000}ms` }}
            ></div>
          ))}
        </div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-ping opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* Logo/Title */}
        <div className="mb-12">
          <div className="flex items-center justify-center mb-4">
            <Zap className="w-16 h-16 text-cyan-400 mr-4 animate-pulse" />
            <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              NEON
            </h1>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">RUNNER</h2>
          <p className="text-gray-300 text-lg">Escape the neon city in this endless cyberpunk adventure</p>
        </div>

        {/* User info */}
        {user && (
          <div className="mb-8 p-4 bg-black/50 rounded-lg border border-cyan-500/30 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-white">
              <span className="text-cyan-400">Welcome back, {user.username}</span>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400">Best: {user.highScore}</span>
              </div>
              {/* Coin balance cyberpunk badge */}
              {typeof user.coin === 'number' && (
                <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400/30 to-cyan-400/30 border border-yellow-400/40 px-4 py-2 rounded-full shadow-lg animate-pulse">
                  <img src={coinImg} alt="Coin" className="w-6 h-6 drop-shadow-glow animate-spin-slow" style={{ animationDuration: '2.5s' }} />
                  <span className="text-yellow-300 font-extrabold text-lg tracking-wider neon-glow">{user.coin}</span>
                  <span className="text-xs text-yellow-200 font-bold ml-1 tracking-widest">COINS</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Menu buttons */}
        <div className="space-y-4">
          <button
            onClick={onPlayNow}
            className="group w-full max-w-md mx-auto block px-8 py-4 bg-gradient-to-r from-cyan-600 to-purple-600 text-white font-bold text-xl rounded-lg shadow-lg border border-cyan-400/50 hover:shadow-cyan-400/50 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:border-cyan-400"
          >
            <div className="flex items-center justify-center gap-3">
              <Play className="w-6 h-6 group-hover:animate-pulse" />
              <span className="bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                {user ? 'PLAY NOW' : 'START GAME'}
              </span>
            </div>
          </button>

          <button
            onClick={onLeaderboard}
            className="group w-full max-w-md mx-auto block px-8 py-3 bg-black/50 text-white font-semibold rounded-lg border border-yellow-500/50 hover:border-yellow-400 hover:shadow-yellow-400/30 hover:shadow-lg transition-all duration-300 backdrop-blur-sm"
          >
            <div className="flex items-center justify-center gap-3">
              <Crown className="w-5 h-5 text-yellow-400 group-hover:animate-pulse" />
              <span>Leaderboard</span>
            </div>
          </button>

          <button
            onClick={onSettings}
            className="group w-full max-w-md mx-auto block px-8 py-3 bg-black/50 text-white font-semibold rounded-lg border border-purple-500/50 hover:border-purple-400 hover:shadow-purple-400/30 hover:shadow-lg transition-all duration-300 backdrop-blur-sm"
          >
            <div className="flex items-center justify-center gap-3">
              <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              <span>Sound Settings</span>
            </div>
          </button>

          {user && (
            <button
              onClick={onLogout}
              className="group w-full max-w-md mx-auto block px-8 py-3 bg-black/30 text-gray-300 font-semibold rounded-lg border border-gray-600/50 hover:border-red-400 hover:text-red-400 hover:shadow-red-400/20 hover:shadow-lg transition-all duration-300 backdrop-blur-sm"
            >
              <div className="flex items-center justify-center gap-3">
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </div>
            </button>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-12 p-6 bg-black/30 rounded-lg border border-gray-700/50 backdrop-blur-sm">
          <h3 className="text-cyan-400 font-bold mb-3">How to Play</h3>
          <div className="text-gray-300 text-sm space-y-2">
            <p><kbd className="px-2 py-1 bg-gray-800 rounded text-cyan-400">SPACE</kbd> or <kbd className="px-2 py-1 bg-gray-800 rounded text-cyan-400">↑</kbd> to Jump</p>
            <p><kbd className="px-2 py-1 bg-gray-800 rounded text-cyan-400">↓</kbd> to Duck</p>
            <p>Avoid obstacles and survive as long as possible!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
