import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPowerUps, getUserOwnedPowerUps } from '../utils/api';
import doublecoinIcon from '../assets/powerup/doublecoin.svg';
import doublexpIcon from '../assets/powerup/doublexp.svg';
import shieldIcon from '../assets/powerup/shield.svg';
import { ArrowLeft, Crown } from 'lucide-react';

const ICONS: Record<string, string> = {
  doublecoin: doublecoinIcon,
  doublexp: doublexpIcon,
  shield: shieldIcon,
};

interface PowerUp {
  id: number;
  name: string;
  description: string;
  price: number;
}

interface ShopProps {
  userCoin: number;
  onBuy: (powerUp: PowerUp, onBuySuccess: (powerUpId: number) => void) => void;
  shopSuccess?: string | null;
}

const Shop: React.FC<ShopProps> = ({ userCoin, onBuy, shopSuccess }) => {
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [userPowerUps, setUserPowerUps] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch all power ups
  useEffect(() => {
    const fetchPowerUps = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('neonRunnerToken') || undefined;
        const res = await getPowerUps(token);
        setPowerUps(res.data || res.payload || []);
      } catch (e: any) {
        setError('Failed to fetch power-up data.');
      }
      setLoading(false);
    };
    fetchPowerUps();
  }, []);

  // Poll user owned power ups every 2s
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    const fetchUserPowerUps = async () => {
      try {
        const userStr = localStorage.getItem('neonRunnerUser');
        const token = localStorage.getItem('neonRunnerToken') || undefined;
        if (!userStr) return;
        const user = JSON.parse(userStr);
        if (!user.id) return;
        const res = await getUserOwnedPowerUps(user.id, token);
        // Map: { powerUpId: quantity } sesuai DTO baru
        const map: Record<number, number> = {};
        (res.data || res.payload || []).forEach((upu: any) => {
          map[upu.powerUpId] = upu.quantity;
        });
        setUserPowerUps(map);
      } catch {}
    };
    fetchUserPowerUps();
    interval = setInterval(fetchUserPowerUps, 2000);
    return () => clearInterval(interval);
  }, []);

  // Optimistically update quantity after buy
  const handleBuy = (pu: PowerUp) => {
    onBuy(pu, (powerUpId: number) => {
      setUserPowerUps((prev) => ({
        ...prev,
        [powerUpId]: (prev[powerUpId] || 0) + 1,
      }));
    });
  };

  // Responsive mobile portrait UI
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
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-black relative overflow-hidden px-4 py-8 gap-8">
        <h1 className="text-3xl font-extrabold text-cyan-300 neon-glow drop-shadow-lg animate-pulse select-none mb-2">Power Up Shop</h1>
        <div className="w-full max-w-xs bg-black/70 backdrop-blur-lg rounded-2xl border border-cyan-500/30 p-4 shadow-2xl">
          <div className="space-y-3">
            {loading ? (
              <div className="text-center text-gray-400">Loading...</div>
            ) : error ? (
              <div className="text-center text-red-400">{error}</div>
            ) : powerUps.length === 0 ? (
              <div className="text-center text-gray-400">No power-ups available.</div>
            ) : (
              powerUps.map((pu) => {
                let icon = shieldIcon;
                if (pu.name.toLowerCase().includes('coin')) icon = doublecoinIcon;
                else if (pu.name.toLowerCase().includes('exp') || pu.name.toLowerCase().includes('xp')) icon = doublexpIcon;
                else if (pu.name.toLowerCase().includes('shield')) icon = shieldIcon;
                const ownedQty = userPowerUps[pu.id] || 0;
                return (
                  <div key={pu.id} className="flex items-center gap-4 bg-gray-900/70 rounded-lg p-4 border border-cyan-700/20">
                    <img src={icon} alt={pu.name} className="w-12 h-12 object-contain drop-shadow-lg" style={{ background: 'rgba(0,255,255,0.08)', borderRadius: 12 }} />
                    <div className="flex-1">
                      <div className="text-lg font-semibold text-white mb-1 flex items-center gap-2">{pu.name}</div>
                      <div className="text-gray-300 text-sm mb-2">{pu.description}</div>
                      <div className="text-yellow-400 font-bold">Price: {pu.price} <span className="text-xs font-normal text-gray-400">coins</span></div>
                    </div>
                    <button className={`px-3 py-2 rounded-lg font-bold transition-all ${userCoin >= pu.price ? 'bg-cyan-500 hover:bg-cyan-400 text-white' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`} disabled={userCoin < pu.price} onClick={() => handleBuy(pu)}>
                      Buy
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
        <button onClick={() => navigate('/home')} className="w-full max-w-xs bg-black/60 px-4 py-3 rounded-lg border-2 border-cyan-400/30 text-cyan-300 font-semibold hover:bg-cyan-900/30 transition flex items-center justify-center gap-3 shadow-lg text-lg mt-4">
          <ArrowLeft className="w-6 h-6" />
          Back to Home
        </button>
      </div>
    );
  }

  if (isMobile && !isPortrait) {
    // MOBILE LANDSCAPE UI (match leaderboard)
    return (
      <div className="fixed left-0 top-0 w-[100vw] h-[100vh] flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-black overflow-hidden">
        {/* Background grid & particles */}
        <div className="absolute inset-0 opacity-20 pointer-events-none z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-purple-500/10"></div>
          <div className="grid grid-cols-12 grid-rows-12 h-full w-full">{Array.from({ length: 144 }).map((_, i) => (<div key={i} className="border border-cyan-500/20 animate-pulse" style={{ animationDelay: `${(i * 50) % 3000}ms` }}></div>))}</div>
        </div>
        <div className="absolute inset-0 pointer-events-none z-0">{Array.from({ length: 20 }).map((_, i) => (<div key={i} className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-ping opacity-60" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 3}s`, animationDuration: `${2 + Math.random() * 2}s` }}></div>))}</div>
        {/* Main Content Wrapper (Responsive, match leaderboard) */}
        <div className="relative z-10 w-full flex flex-col items-center justify-center gap-6 max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl">
          <div className="bg-black/70 backdrop-blur-lg rounded-2xl border border-cyan-500/30 shadow-2xl w-full p-4 sm:p-6 flex flex-col max-h-[85vh]">
            <div className="text-center mb-4 sm:mb-6 flex-shrink-0">
              <h2 className="text-3xl sm:text-4xl font-bold text-cyan-400 mb-2">Power Up Shop</h2>
              <p className="text-gray-400 text-sm sm:text-base">Use your coins to buy power-ups that will help you in the game!</p>
            </div>
            <div className="flex-grow overflow-y-auto pr-2 min-h-0">
              <div className="space-y-3">
                {loading ? (
                  <div className="text-center text-gray-400">Loading...</div>
                ) : error ? (
                  <div className="text-center text-red-400">{error}</div>
                ) : powerUps.length === 0 ? (
                  <div className="text-center text-gray-400">No power-ups available.</div>
                ) : (
                  powerUps.map((pu) => {
                    let icon = shieldIcon;
                    if (pu.name.toLowerCase().includes('coin')) icon = doublecoinIcon;
                    else if (pu.name.toLowerCase().includes('exp') || pu.name.toLowerCase().includes('xp')) icon = doublexpIcon;
                    else if (pu.name.toLowerCase().includes('shield')) icon = shieldIcon;
                    const ownedQty = userPowerUps[pu.id] || 0;
                    return (
                      <div key={pu.id} className="flex items-center gap-4 bg-gray-900/70 rounded-lg p-4 border border-cyan-700/20">
                        <img src={icon} alt={pu.name} className="w-12 h-12 object-contain drop-shadow-lg" style={{ background: 'rgba(0,255,255,0.08)', borderRadius: 12 }} />
                        <div className="flex-1">
                          <div className="text-lg font-semibold text-white mb-1 flex items-center gap-2">{pu.name}</div>
                          <div className="text-gray-300 text-sm mb-2">{pu.description}</div>
                          <div className="text-yellow-400 font-bold">Price: {pu.price} <span className="text-xs font-normal text-gray-400">coins</span></div>
                        </div>
                        <button className={`px-3 py-2 rounded-lg font-bold transition-all ${userCoin >= pu.price ? 'bg-cyan-500 hover:bg-cyan-400 text-white' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`} disabled={userCoin < pu.price} onClick={() => handleBuy(pu)}>
                          Buy
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
          {/* UNIFIED Back Button */}
          <button onClick={() => navigate('/home')} className="w-full max-w-xs bg-black/60 px-4 py-3 rounded-lg border-2 border-cyan-400/30 text-cyan-300 font-semibold hover:bg-cyan-900/30 transition flex items-center justify-center gap-3 shadow-lg text-lg">
            <ArrowLeft className="w-6 h-6" /> Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-black relative overflow-hidden px-2 md:px-0">
      {/* Notifikasi sukses pembelian */}
      {shopSuccess && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-cyan-700 text-white px-6 py-3 rounded-xl shadow-lg text-lg animate-fade-in-out">
          {shopSuccess}
        </div>
      )}
      {/* Animated background grid and particles (match HomeScreen) */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-purple-500/10"></div>
        <div className="grid grid-cols-12 grid-rows-12 h-full w-full">{Array.from({ length: 144 }).map((_, i) => (<div key={i} className="border border-cyan-500/20 animate-pulse" style={{ animationDelay: `${(i * 50) % 3000}ms` }}></div>))}</div>
      </div>
      <div className="absolute inset-0 pointer-events-none">{Array.from({ length: 20 }).map((_, i) => (<div key={i} className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-ping opacity-60" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 3}s`, animationDuration: `${2 + Math.random() * 2}s` }}></div>))}</div>
      <div className="relative z-10 w-full max-w-2xl mx-auto">
        {/* UNIFIED Back to Home button */}
        <button onClick={() => navigate('/home')} className="w-full max-w-xs bg-black/60 px-4 py-3 rounded-lg border-2 border-cyan-400/30 text-cyan-300 font-semibold hover:bg-cyan-900/30 transition flex items-center justify-center gap-3 shadow-lg text-lg mb-4">
          <ArrowLeft className="w-6 h-6" />
          Back to Home
        </button>
        <div className="bg-black/80 p-4 md:p-6 rounded-2xl border border-cyan-500/30 w-full shadow-2xl mt-0">
          <h2 className="text-3xl font-bold text-cyan-400 mb-4 text-center">Power Up Shop</h2>
          <p className="text-gray-300 mb-6 text-center">Use your coins to buy power-ups that will help you in the game!</p>
          <div className="flex flex-col gap-6">
            {loading ? (
              <div className="text-center text-gray-400">Loading...</div>
            ) : error ? (
              <div className="text-center text-red-400">{error}</div>
            ) : powerUps.length === 0 ? (
              <div className="text-center text-gray-400">No power-ups available.</div>
            ) : (
              powerUps.map((pu) => {
                // Pilih icon sesuai nama power up
                let icon = shieldIcon;
                if (pu.name.toLowerCase().includes('coin')) icon = doublecoinIcon;
                else if (pu.name.toLowerCase().includes('exp') || pu.name.toLowerCase().includes('xp')) icon = doublexpIcon;
                else if (pu.name.toLowerCase().includes('shield')) icon = shieldIcon;
                const ownedQty = userPowerUps[pu.id] || 0;
                return (
                  <div key={pu.id} className="flex items-center gap-4 bg-gray-900/70 rounded-lg p-4 border border-cyan-700/20">
                    <div className="relative">
                      <img src={icon} alt={pu.name} className="w-16 h-16 object-contain drop-shadow-lg" style={{ background: 'rgba(0,255,255,0.08)', borderRadius: 12 }} />
                      <span className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 bg-cyan-600 text-white text-xs font-bold rounded-full px-2 py-0.5 border-2 border-white shadow-lg select-none" style={{ minWidth: 22, textAlign: 'center' }}>{ownedQty}</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-xl font-semibold text-white mb-1 flex items-center gap-2">{pu.name}</div>
                      <div className="text-gray-300 text-sm mb-2">{pu.description}</div>
                      <div className="text-yellow-400 font-bold">Price: {pu.price} <span className="text-xs font-normal text-gray-400">coins</span></div>
                    </div>
                    <button className={`px-4 py-2 rounded-lg font-bold transition-all ${userCoin >= pu.price ? 'bg-cyan-500 hover:bg-cyan-400 text-white' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`} disabled={userCoin < pu.price} onClick={() => handleBuy(pu)}>
                      Buy
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
