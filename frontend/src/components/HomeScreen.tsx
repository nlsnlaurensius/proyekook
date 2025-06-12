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
  coin?: number;
}

interface HomeScreenProps {
  user: User | null;
  onPlayNow: (orientation: { isMobile: boolean; isPortrait: boolean }) => void;
  onSettings: () => void;
  onLeaderboard: () => void;
  onLogout: () => void;
  musicEnabled?: boolean;
  musicVolume?: number;
  onShop: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ user, onPlayNow, onSettings, onLeaderboard, onLogout, musicEnabled = true, musicVolume = 0.7, onShop }) => {
  const musicRef = useRef<any>(null);
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
    }, 60);
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
        if (fetched && typeof fetched.highScore === 'number') {
            setLiveHighScore(fetched.highScore);
        } else if (fetched && typeof fetched.highestScore === 'number') {
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
      setIsMobile(window.innerWidth <= 1024); 
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
    <div className={isMobile && !isPortrait ? "fixed left-0 top-0 w-[100vw] h-[100vh] bg-gradient-to-br from-gray-900 via-purple-900 to-black" : "min-h-screen w-full bg-gradient-to-br from-gray-900 via-purple-900 to-black relative overflow-hidden"}>
      <div className="absolute inset-0 opacity-20 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-purple-500/10"></div>
        <div className="grid grid-cols-12 grid-rows-12 h-full w-full">
            {Array.from({ length: 144 }).map((_, i) => (
                <div key={i} className="border border-cyan-500/20 animate-pulse" style={{ animationDelay: `${(i * 50) % 3000}ms` }}></div>
            ))}
        </div>
        {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-ping opacity-60" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 3}s`, animationDuration: `${2 + Math.random() * 2}s` }}></div>
        ))}
      </div>

      {isMobile && isPortrait ? (
       <div className="relative z-10 flex flex-col items-center justify-center min-h-screen w-full py-2 gap-3 sm:gap-6 max-w-full overflow-hidden">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-cyan-300 neon-glow drop-shadow-lg animate-pulse select-none mb-1 sm:mb-2">
          NEON RUNNER
        </h1>
        <img
          src={walkFrames[frame] as string}
          alt="Neon Runner Walk Animation"
          className="w-36 h-36 sm:w-48 sm:h-48 object-contain drop-shadow-glow mb-1 sm:mb-2"
          draggable={false}
        />
        <button
          onClick={() => onPlayNow({ isMobile, isPortrait })}
          className="w-full max-w-xs text-xl sm:text-2xl px-4 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 text-white font-extrabold rounded-xl sm:rounded-2xl shadow-2xl border-2 sm:border-4 border-cyan-400/40 hover:scale-105 hover:shadow-cyan-400/40 transition-all duration-300 flex items-center justify-center gap-2 sm:gap-4 neon-glow focus:outline-none focus:ring-2 sm:focus:ring-4 focus:ring-cyan-400/40 mb-2 sm:mb-4"
        >
          <Play className="w-7 h-7 sm:w-8 sm:h-8" />
          PLAY
        </button>
        <div className="flex w-full max-w-xs gap-2 sm:gap-4 mb-2 sm:mb-4">
          <button onClick={onLeaderboard} className={`${user ? 'flex-1' : 'w-full'} flex flex-col items-center bg-black/60 rounded-lg sm:rounded-xl border border-yellow-400/30 sm:border-2 shadow-xl hover:scale-105 transition py-2 sm:py-4`}>
            <Crown className="w-7 h-7 sm:w-8 sm:h-8 text-yellow-400 mb-0.5" />
            <span className="text-yellow-200 font-bold text-xs sm:text-base drop-shadow">Leaderboard</span>
          </button>
          
          {user && (
            <button onClick={onShop} className="flex-1 flex flex-col items-center bg-black/60 rounded-lg sm:rounded-xl border border-cyan-400/30 sm:border-2 shadow-xl hover:scale-105 transition py-2 sm:py-4">
              <ShoppingBag className="w-7 h-7 sm:w-8 sm:h-8 text-cyan-300 mb-0.5" />
              <span className="text-cyan-200 font-bold text-xs sm:text-base drop-shadow">Shop</span>
            </button>
          )}
        </div>
        <button onClick={onSettings} className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center bg-black/60 rounded-full border border-cyan-400/30 shadow-lg hover:bg-cyan-900/30 transition mb-2 sm:mb-4">
          <Settings className="w-7 h-7 sm:w-10 sm:h-10 text-cyan-300 animate-spin-slow" style={{ animationDuration: '2.5s' }} />
        </button>
        {user && (
          <div className="w-full max-w-xs flex flex-col items-center gap-1 sm:gap-2 bg-black/70 border border-cyan-400/40 sm:border-2 rounded-lg sm:rounded-xl px-2 sm:px-3 py-1 sm:py-2 shadow-xl">
            <span className="font-bold text-cyan-200 text-base sm:text-lg tracking-wide drop-shadow">{user.username}</span>
            <div className="flex items-center gap-1 sm:gap-2">
              <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
              <span className="text-yellow-300 font-bold text-xs sm:text-sm">High Score: {liveHighScore ?? user.highScore}</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 bg-black/70 border border-yellow-400/40 sm:border-2 rounded px-1 sm:px-2 py-0.5 sm:py-1 shadow-lg">
              <img src={coinImg} alt="Coin" className="w-4 h-4 sm:w-5 sm:h-5 drop-shadow-glow" />
              <span className="text-yellow-200 font-bold text-xs sm:text-sm">{user.coin ?? 0}</span>
            </div>
          </div>
        )}
        
        {user && (
          <button onClick={onLogout} className="w-full max-w-xs bg-black/60 px-2 sm:px-4 py-2 sm:py-3 rounded-md sm:rounded-lg border border-red-400/30 sm:border-2 text-red-300 font-semibold hover:bg-red-900/30 transition flex items-center justify-center gap-2 sm:gap-3 shadow-lg text-base sm:text-lg mt-2 sm:mt-4">
            <LogOut className="w-5 h-5 sm:w-6 sm:h-6" />
            Logout
          </button>
        )}
      </div>
      ) : isMobile && !isPortrait ? (
        <div className="fixed left-0 top-0 w-[100vw] h-[100vh] p-4 z-10"> 
        
          {user && (
            <div className="absolute top-4 left-4 z-20">
                <div className="flex flex-col gap-1 bg-black/70 border border-cyan-400/40 rounded-lg px-2 py-1 shadow min-w-[90px] max-w-[160px]">
                    <span className="font-bold text-cyan-200 text-base tracking-wide drop-shadow">{user.username}</span>
                    <div className="flex items-center gap-1 mt-0.5">
                        <Crown className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-300 font-bold text-xs flex flex-col">
                            High Score:
                            <span className="block text-yellow-100 text-sm leading-tight">{liveHighScore ?? user.highScore}</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-1 bg-black/70 border border-yellow-400/40 rounded px-2 py-0.5 shadow min-w-[40px] mt-1">
                        <img src={coinImg} alt="Coin" className="w-4 h-4 drop-shadow-glow" />
                        <span className="text-yellow-200 font-bold text-xs">{user.coin ?? 0}</span>
                    </div>
                    <button onClick={onLogout} className="mt-2 bg-black/60 px-2 py-1 rounded border border-red-400/30 text-red-300 font-semibold hover:bg-red-900/30 transition flex items-center gap-1 shadow text-xs w-full justify-center">
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </div>
          )}

          <div className="absolute top-4 right-4 z-20 flex flex-col justify-between items-end h-[calc(100%-2rem)]">
              <button onClick={onSettings} className="bg-black/60 p-2 rounded-full border border-cyan-400/30 shadow hover:bg-cyan-900/30 transition">
                  <Settings className="w-6 h-6 text-cyan-300 animate-spin-slow" style={{ animationDuration: '2.5s' }} />
              </button>
              
              <div className="flex flex-col items-end gap-2">
                  <button onClick={onLeaderboard} className="flex flex-col items-center group bg-black/60 rounded-lg border border-yellow-400/30 shadow hover:scale-105 transition w-20 h-16 justify-center">
                      <Crown className="w-7 h-7 text-yellow-400 group-hover:scale-110 transition" />
                      <span className="mt-1 text-yellow-200 font-bold text-[10px] drop-shadow">Leaderboard</span>
                  </button>
                  {user && (
                      <button onClick={onShop} className="flex flex-col items-center group bg-black/60 rounded-lg border border-cyan-400/30 shadow hover:scale-105 transition w-20 h-16 justify-center">
                          <ShoppingBag className="w-7 h-7 text-cyan-300 group-hover:scale-110 transition" />
                          <span className="mt-1 text-cyan-200 font-bold text-[10px] drop-shadow">Shop</span>
                      </button>
                  )}
              </div>
          </div>

          <div className="absolute inset-0 z-10 flex flex-col items-center justify-between h-full py-4 pointer-events-none">
              <h1 className="text-5xl font-extrabold text-cyan-300 drop-shadow-lg neon-glow animate-pulse select-none pointer-events-auto">
                  NEON RUNNER
              </h1>
              <img
                  src={walkFrames[frame] as string}
                  alt="Neon Runner Walk Animation"
                  className="h-[200px] w-auto object-contain drop-shadow-glow"
                  draggable={false}
              />
              <button
                  onClick={() => onPlayNow({ isMobile, isPortrait })}
                  className="text-xl px-8 py-3 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 text-white font-extrabold rounded-full shadow-xl border-2 border-cyan-400/40 hover:scale-105 hover:shadow-cyan-400/40 transition-all duration-300 flex items-center gap-2 neon-glow focus:outline-none focus:ring-2 focus:ring-cyan-400/40 pointer-events-auto"
              >
                  <Play className="w-6 h-6" />
                  PLAY
              </button>
          </div>
      </div>
      ) : (
        <div className={`w-full h-screen grid grid-cols-[1fr_auto_1fr] grid-rows-[auto_1fr_auto] p-4 sm:p-6 gap-4 ${isMobile && !isPortrait ? 'scale-[0.85] origin-top h-[117.6%]' : ''}`}> 
          <div className="col-start-1 row-start- flex flex-col items-start gap-2 z-20">
            {user && (
              <div className="flex flex-col gap-2 bg-black/70 border-2 border-cyan-400/40 rounded-xl px-3 py-2 shadow-xl min-w-[120px] sm:min-w-[220px]">
                <span className="font-bold text-cyan-200 text-base sm:text-xl tracking-wide drop-shadow">{user.username}</span>
                <div className="flex items-center gap-1 mt-0.5">
                  <Crown className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-400" />
                  <span className="text-yellow-300 font-bold text-sm sm:text-lg flex flex-col">
                    High Score:
                    <span className="block text-yellow-100 text-base sm:text-lg leading-tight">{liveHighScore ?? user.highScore}</span>
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-black/70 border-2 border-yellow-400/40 rounded-lg px-2 py-1 shadow-lg min-w-[70px] sm:min-w-[120px] mt-2">
                  <img src={coinImg} alt="Coin" className="w-4 h-4 sm:w-6 sm:h-6 drop-shadow-glow" />
                  <span className="text-yellow-200 font-bold text-sm sm:text-lg">{user.coin ?? 0}</span>
                </div>
                <button onClick={onLogout} className="mt-2 bg-black/60 px-4 py-2 sm:px-8 sm:py-4 rounded-lg sm:rounded-xl border-2 border-red-400/30 text-red-300 font-semibold hover:bg-red-900/30 transition flex items-center gap-2 sm:gap-3 shadow-lg text-base sm:text-lg w-full justify-center">
                  <LogOut className="w-4 h-4 sm:w-6 sm:h-6" />
                  Logout
                </button>
              </div>
            )}
          </div>

          <div className="col-start-2 row-start-1 flex justify-center items-start pt-2 z-20">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-cyan-300 drop-shadow-lg neon-glow animate-pulse select-none">
              NEON RUNNER
            </h1>
          </div>

          <div className="col-start-3 row-start-1 flex justify-end items-start z-20">
            <button onClick={onSettings} className="bg-black/60 p-2 sm:p-4 rounded-full border border-cyan-400/30 shadow-lg hover:bg-cyan-900/30 transition">
              <Settings className="w-6 h-6 sm:w-10 sm:h-10 text-cyan-300 animate-spin-slow" style={{ animationDuration: '2.5s' }} />
            </button>
          </div>

          <div className="col-start-3 row-start-2 flex flex-col items-center justify-center gap-4 sm:gap-8 z-20">
             <button onClick={onLeaderboard} className="flex flex-col items-center group bg-black/60 rounded-xl sm:rounded-2xl border-2 border-yellow-400/30 shadow-xl hover:scale-105 transition w-24 h-20 sm:w-44 sm:h-40 justify-center">
               <Crown className="w-8 h-8 sm:w-14 sm:h-14 text-yellow-400 group-hover:scale-110 transition" />
               <span className="mt-1 sm:mt-2 text-yellow-200 font-bold text-base sm:text-lg drop-shadow">Leaderboard</span>
             </button>
             {user && (
               <button onClick={onShop} className="flex flex-col items-center group bg-black/60 rounded-xl sm:rounded-2xl border-2 border-cyan-400/30 shadow-xl hover:scale-105 transition w-24 h-20 sm:w-44 sm:h-40 justify-center">
                 <ShoppingBag className="w-8 h-8 sm:w-14 sm:h-14 text-cyan-300 group-hover:scale-110 transition" />
                 <span className="mt-1 sm:mt-2 text-cyan-200 font-bold text-base sm:text-lg drop-shadow">Shop</span>
               </button>
             )}
          </div>

          <div className="col-start-2 row-start-2 flex flex-col items-center justify-center z-10 relative pb-16 sm:pb-24">
              <img
                src={walkFrames[frame] as string}
                alt="Neon Runner Walk Animation"
                className="w-auto h-auto max-h-[200px] sm:max-h-[280px] object-contain drop-shadow-glow"
                draggable={false}
              />
              <button
                onClick={() => onPlayNow({ isMobile, isPortrait })}
                className="absolute bottom-4 sm:bottom-8 text-2xl sm:text-3xl md:text-4xl px-12 py-3 sm:px-16 sm:py-4 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 text-white font-extrabold rounded-full shadow-2xl border-4 border-cyan-400/40 hover:scale-105 hover:shadow-cyan-400/40 transition-all duration-300 flex items-center gap-4 neon-glow focus:outline-none focus:ring-4 focus:ring-cyan-400/40"
              >
                <Play className="w-6 h-6 sm:w-8 sm:h-8" />
                PLAY
              </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeScreen;