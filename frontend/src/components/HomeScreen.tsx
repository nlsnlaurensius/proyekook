import React, { useEffect, useRef, useState } from 'react';
import { Play, Settings, LogOut, Crown, ShoppingBag } from 'lucide-react';
import { Howl } from 'howler';
import homeMusicSrc from '../assets/sounds/home.mp3';
import coinImg from '../assets/coin.png';
import { getUserByUsername } from '../utils/api';

const walkFrames = Object.values(
  import.meta.glob('../assets/walk/*.png', { eager: true, as: 'url' })
).sort();

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
  onShop: () => void; // Tambahkan prop untuk Shop
}

const HomeScreen: React.FC<HomeScreenProps> = ({ user, onPlayNow, onSettings, onLeaderboard, onLogout, musicEnabled = true, musicVolume = 0.7, onShop }) => {
  const musicRef = useRef<Howl | null>(null);
  const [frame, setFrame] = useState(0);
  const [liveHighScore, setLiveHighScore] = useState<number | null>(null);

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

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(f => (f + 1) % walkFrames.length);
    }, 60); // lebih cepat
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!user || !user.username) return;
    let interval: ReturnType<typeof setInterval>;
    const fetchUserHighScore = async () => {
      try {
        const token = localStorage.getItem('neonRunnerToken') || undefined;
        const res = await getUserByUsername(user.username, token);
        const fetched = res?.data || res?.payload;
        if (fetched && typeof fetched.highScore === 'number' && fetched.highScore !== user.highScore) {
          setLiveHighScore(fetched.highScore);
        } else if (fetched && typeof fetched.highestScore === 'number' && fetched.highestScore !== user.highScore) {
          setLiveHighScore(fetched.highestScore);
        } else {
          setLiveHighScore(user.highScore);
        }
      } catch {
        setLiveHighScore(user.highScore);
      }
    };
    fetchUserHighScore();
    interval = setInterval(fetchUserHighScore, 2000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-purple-900 to-black relative overflow-hidden flex items-center justify-center">
      {/* Top left: user info (username + highscore in one box) */}
      <div className="absolute top-8 left-8 z-20 flex flex-col items-start gap-3">
        {user && (
          <div className="flex flex-col gap-2 bg-black/70 border-2 border-cyan-400/40 rounded-2xl px-6 py-4 shadow-xl min-w-[220px]">
            <span className="font-bold text-cyan-200 text-xl tracking-wide drop-shadow">{user.username}</span>
            <div className="flex items-center gap-2 mt-1">
              <Crown className="w-6 h-6 text-yellow-400" />
              <span className="text-yellow-300 font-bold text-lg">High Score: {liveHighScore !== null ? liveHighScore : user.highScore}</span>
            </div>
          </div>
        )}
        {/* Coin balance as a separate neon card below profile */}
        {user && (
          <div className="flex items-center gap-2 mt-2 bg-black/70 border-2 border-yellow-400/40 rounded-xl px-4 py-2 shadow-lg min-w-[120px]">
            <img src={coinImg} alt="Coin" className="w-6 h-6 drop-shadow-glow" />
            <span className="text-yellow-200 font-bold text-lg">{user.coin ?? 0}</span>
          </div>
        )}
      </div>
      {/* Top right: settings (animated gear) */}
      <div className="absolute top-8 right-8 z-20">
        <button onClick={onSettings} className="bg-black/60 p-4 rounded-full border border-cyan-400/30 shadow-lg hover:bg-cyan-900/30 transition">
          <Settings className="w-10 h-10 text-cyan-300 animate-spin-slow" style={{ animationDuration: '2.5s' }} />
        </button>
      </div>
      {/* Top center: Neon Runner title (lowered for better balance) */}
      <div className="absolute left-1/2" style={{ top: '72px', transform: 'translateX(-50%)' }}>
        <h1 className="text-6xl md:text-7xl font-extrabold text-cyan-300 drop-shadow-lg mb-4 neon-glow animate-pulse select-none">
          NEON RUNNER
        </h1>
      </div>
      {/* Right: Leaderboard and Shop vertically aligned, same size */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-8 z-20">
        <button onClick={onLeaderboard} className="flex flex-col items-center group bg-black/60 rounded-2xl border-2 border-yellow-400/30 shadow-xl hover:scale-105 transition w-44 h-40 justify-center">
          <Crown className="w-14 h-14 text-yellow-400 group-hover:scale-110 transition" />
          <span className="mt-2 text-yellow-200 font-bold text-lg drop-shadow">Leaderboard</span>
        </button>
        {user && (
          <button onClick={onShop} className="flex flex-col items-center group bg-black/60 rounded-2xl border-2 border-cyan-400/30 shadow-xl hover:scale-105 transition w-44 h-40 justify-center">
            <ShoppingBag className="w-14 h-14 text-cyan-300 group-hover:scale-110 transition" />
            <span className="mt-2 text-cyan-200 font-bold text-lg drop-shadow">Shop</span>
          </button>
        )}
      </div>
      {/* Bottom left: Logout button */}
      {user && (
        <div className="absolute bottom-8 left-8 z-20">
          <button onClick={onLogout} className="bg-black/60 px-8 py-4 rounded-xl border-2 border-red-400/30 text-red-300 font-semibold hover:bg-red-900/30 transition flex items-center gap-3 shadow-lg text-lg">
            <LogOut className="w-6 h-6" />
            Logout
          </button>
        </div>
      )}
      {/* Center: walk animation (no circle, larger) */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
        <div className="w-[420px] h-[420px] md:w-[520px] md:h-[520px] flex items-center justify-center">
          <img
            src={walkFrames[frame] as string}
            alt="Neon Runner Walk Animation"
            className="w-full h-full object-contain drop-shadow-glow"
            draggable={false}
          />
        </div>
        {/* Centered Play button below animation */}
        <button onClick={onPlayNow} className="mt-8 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 text-white font-extrabold text-4xl px-24 py-10 rounded-full shadow-2xl border-4 border-cyan-400/40 hover:scale-105 hover:shadow-cyan-400/40 transition-all duration-300 flex items-center gap-6 neon-glow focus:outline-none focus:ring-4 focus:ring-cyan-400/40">
          <span className="flex items-center gap-4">
            <Play className="w-12 h-12 animate-pulse" />
            PLAY
          </span>
        </button>
      </div>
      {/* Neon background grid and particles */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
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
    </div>
  );
};

export default HomeScreen;
