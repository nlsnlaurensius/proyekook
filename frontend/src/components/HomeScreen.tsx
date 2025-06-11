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
  const [isPortrait, setIsPortrait] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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

  useEffect(() => {
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

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-purple-900 to-black relative overflow-hidden flex flex-col items-center justify-center px-0 py-0 sm:px-2 sm:py-2">
      {/* Overlay for portrait mode on mobile/tablet */}
      {isMobile && isPortrait && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/90 text-white text-center px-8">
          <div className="text-3xl font-bold mb-4">Putar perangkat Anda</div>
          <div className="text-lg mb-6">Untuk memainkan game ini, silakan ubah ke mode <span className='text-cyan-300 font-bold'>landscape</span> (horizontal).</div>
          <svg width="80" height="80" fill="none" viewBox="0 0 80 80" className="mx-auto mb-4 animate-bounce">
            <rect x="10" y="25" width="60" height="30" rx="8" fill="#23234d" stroke="#38bdf8" strokeWidth="4"/>
            <path d="M 40 10 Q 60 20 70 40" stroke="#38bdf8" strokeWidth="4" fill="none"/>
            <polygon points="70,40 65,38 67,44" fill="#38bdf8" />
          </svg>
          <div className="text-base text-gray-300">Game hanya dapat dimainkan dalam mode landscape.</div>
        </div>
      )}
      {/* Main content, scaled down on small landscape screens */}
      <div className={isMobile && !isPortrait ? 'scale-[0.7] origin-top w-full h-full mx-0 my-0' : ''}>
        {/* Top left: user info (username + highscore in one box) */}
        <div className="absolute top-1 left-1 z-20 flex flex-col items-start gap-1 max-w-[98vw]">
          {user && (
            <div className="flex flex-col gap-0.5 bg-black/70 border-2 border-cyan-400/40 rounded sm:rounded-xl px-2 py-1 sm:px-3 sm:py-2 shadow-xl min-w-[70px] sm:min-w-[120px]">
              <span className="font-bold text-cyan-200 text-xs sm:text-base tracking-wide drop-shadow">{user.username}</span>
              <div className="flex items-center gap-0.5 mt-0.5">
                <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                <span className="text-yellow-300 font-bold text-xs sm:text-sm">High Score: {liveHighScore !== null ? liveHighScore : user.highScore}</span>
              </div>
            </div>
          )}
          {/* Coin balance as a separate neon card below profile */}
          {user && (
            <div className="flex items-center gap-0.5 mt-0.5 bg-black/70 border-2 border-yellow-400/40 rounded sm:rounded-lg px-1 py-0.5 sm:px-2 sm:py-1 shadow-lg min-w-[40px] sm:min-w-[70px]">
              <img src={coinImg} alt="Coin" className="w-3 h-3 sm:w-4 sm:h-4 drop-shadow-glow" />
              <span className="text-yellow-200 font-bold text-xs sm:text-sm">{user.coin ?? 0}</span>
            </div>
          )}
        </div>
        {/* Top right: settings (animated gear) */}
        <div className="absolute top-1 right-1 z-20">
          <button onClick={onSettings} className="bg-black/60 p-1 sm:p-2 rounded-full border border-cyan-400/30 shadow-lg hover:bg-cyan-900/30 transition">
            <Settings className="w-4 h-4 sm:w-6 sm:h-6 text-cyan-300 animate-spin-slow" style={{ animationDuration: '2.5s' }} />
          </button>
        </div>
        {/* Top center: Neon Runner title (lowered for better balance) */}
        <div className="absolute left-1/2" style={{ top: '12px', transform: 'translateX(-50%)' }}>
          <h1 className="text-xs sm:text-xl md:text-6xl font-extrabold text-cyan-300 drop-shadow-lg mb-0.5 sm:mb-1 neon-glow animate-pulse select-none">
            NEON RUNNER
          </h1>
        </div>
        {/* Right: Leaderboard and Shop vertically aligned, same size */}
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 sm:gap-4 z-20">
          <button onClick={onLeaderboard} className="flex flex-col items-center group bg-black/60 rounded border-2 border-yellow-400/30 shadow-xl hover:scale-105 transition w-12 h-10 sm:w-24 sm:h-20 justify-center">
            <Crown className="w-4 h-4 sm:w-8 sm:h-8 text-yellow-400 group-hover:scale-110 transition" />
            <span className="mt-0.5 sm:mt-1 text-yellow-200 font-bold text-xs sm:text-base drop-shadow">Leaderboard</span>
          </button>
          {user && (
            <button onClick={onShop} className="flex flex-col items-center group bg-black/60 rounded border-2 border-cyan-400/30 shadow-xl hover:scale-105 transition w-12 h-10 sm:w-24 sm:h-20 justify-center">
              <ShoppingBag className="w-4 h-4 sm:w-8 sm:h-8 text-cyan-300 group-hover:scale-110 transition" />
              <span className="mt-0.5 sm:mt-1 text-cyan-200 font-bold text-xs sm:text-base drop-shadow">Shop</span>
            </button>
          )}
        </div>
        {/* Bottom left: Logout button */}
        {user && (
          <div className="absolute bottom-1 left-1 z-20 max-w-[98vw]">
            <button onClick={onLogout} className="bg-black/60 px-2 py-1 sm:px-4 sm:py-2 rounded border-2 border-red-400/30 text-red-300 font-semibold hover:bg-red-900/30 transition flex items-center gap-1 sm:gap-2 shadow-lg text-xs sm:text-base">
              <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
              Logout
            </button>
          </div>
        )}
        {/* Center: walk animation (no circle, larger) */}
        <div className="flex flex-col items-center justify-center w-full max-w-[80px] sm:max-w-xs mx-0 sm:mx-auto mt-0 sm:mt-2 md:mt-0">
          <div className="w-[16vw] h-[16vw] max-w-[40px] max-h-[40px] sm:w-[28vw] sm:h-[28vw] sm:max-w-[90px] sm:max-h-[90px] md:w-[520px] md:h-[520px] flex items-center justify-center">
            <img
              src={walkFrames[frame] as string}
              alt="Neon Runner Walk Animation"
              className="w-full h-full object-contain drop-shadow-glow"
              draggable={false}
            />
          </div>
          {/* Centered Play button below animation */}
          <button onClick={onPlayNow} className="mt-1 sm:mt-2 w-full max-w-[60px] sm:max-w-[120px] text-xs sm:text-base md:text-4xl px-1 py-0.5 sm:px-2 sm:py-1 md:px-24 md:py-10 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 text-white font-extrabold rounded-full shadow-2xl border-4 border-cyan-400/40 hover:scale-105 hover:shadow-cyan-400/40 transition-all duration-300 flex items-center gap-1 sm:gap-2 neon-glow focus:outline-none focus:ring-4 focus:ring-cyan-400/40">
            <span className="flex items-center gap-1 sm:gap-2">
              <Play className="w-3 h-3 sm:w-5 sm:h-5 animate-pulse" />
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
    </div>
  );
};

export default HomeScreen;
