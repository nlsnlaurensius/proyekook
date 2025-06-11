import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import HomeScreen from './components/HomeScreen';
import LoginScreen from './components/LoginScreen';
import GameScreen from './components/GameScreen';
import SoundSettings from './components/SoundSettings';
import LeaderboardScreen from './components/LeaderboardScreen';
import Shop from './components/Shop';
import NotFoundPage from './components/NotFoundPage';
import { login as apiLogin, getLeaderboard, getUserByUsername, buyPowerUp } from './utils/api';
import { playClick } from './utils/clickSound';

export type Screen = 'home' | 'login' | 'game' | 'settings' | 'leaderboard' | 'shop';

export interface User {
  username: string;
  highScore: number;
  id?: number;
  coin?: number; // Add coin field for coin balance
}

export interface LeaderboardEntry {
  username: string;
  score: number;
  rank?: number;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicVolume, setMusicVolume] = useState(0.7);
  const [sfxVolume, setSfxVolume] = useState(0.8);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [shopSuccess, setShopSuccess] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    // Load saved user data
    const savedUser = localStorage.getItem('neonRunnerUser');
    if (savedUser && savedUser !== 'undefined') {
      setUser(JSON.parse(savedUser));
    }
    // Load sound settings
    const savedSoundSettings = localStorage.getItem('neonRunnerSoundSettings');
    if (savedSoundSettings && savedSoundSettings !== 'undefined') {
      const settings = JSON.parse(savedSoundSettings);
      setSoundEnabled(settings.soundEnabled);
      setMusicVolume(settings.musicVolume);
      setSfxVolume(settings.sfxVolume);
    }
    // Fetch leaderboard from backend
    const fetchLeaderboard = async () => {
      try {
        const token = localStorage.getItem('neonRunnerToken') || undefined;
        const res = await getLeaderboard(token);
        const leaderboardData = res?.data || res?.payload || [];
        setLeaderboard(leaderboardData.map((entry: any, idx: number) => ({
          username: entry.username,
          score: entry.highestScore ?? entry.score ?? 0,
          rank: idx + 1,
        })));
      } catch (e) {
        // fallback: empty leaderboard
        setLeaderboard([]);
      }
    };
    fetchLeaderboard();
  }, []);

  useEffect(() => {
    function handleGlobalClick() {
      // Only play click if not in game screen
      if (!soundEnabled) return;
      playClick(sfxVolume);
    }
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [soundEnabled, sfxVolume]);

  const handleLogin = async (username: string, password?: string) => {
    try {
      let res;
      if (password) {
        res = await apiLogin(username, password);
      } else {
        res = await getUserByUsername(username);
      }
      // Debug: log the full response from backend
      console.log('Login response:', res);

      // Ambil user dari payload jika ada
      const rawUser = res?.user || res?.data || res?.payload;
      if (rawUser) {
        // Pastikan highScore selalu ada
        const bestScore = rawUser.highScore || rawUser.highestScore || rawUser.score || 0;
        const user = { ...rawUser, highScore: bestScore };
        const token = res?.token;
        if (token) localStorage.setItem('neonRunnerToken', token);
        localStorage.setItem('neonRunnerUser', JSON.stringify(user));
        setUser(user);
        navigate('/home');
      } else {
        alert('Login failed: User data not found.');
      }
    } catch (e: any) {
      alert(e.message || 'Login failed. Please try again.');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('neonRunnerUser');
    localStorage.removeItem('neonRunnerToken');
    navigate('/home');
  };

  const updateHighScore = async (score: number): Promise<void> => {
    // Update highScore di local state jika perlu
    if (user && score > user.highScore) {
      const updatedUser = { ...user, highScore: score };
      setUser(updatedUser);
      localStorage.setItem('neonRunnerUser', JSON.stringify(updatedUser));
    }
    // Jangan submit ke backend di sini! (Sudah dilakukan di GameScreen)
    // Refresh leaderboard setelah submit (opsional, bisa fetch ulang leaderboard jika ingin)
    try {
      const token = localStorage.getItem('neonRunnerToken') || undefined;
      const res = await getLeaderboard(token);
      const leaderboardData = res?.data || res?.payload || [];
      setLeaderboard(leaderboardData.map((entry: any, idx: number) => ({
        username: entry.username,
        score: entry.highestScore ?? entry.score ?? 0,
        rank: idx + 1,
      })));
    } catch (e) {}
  };

  const handlePlayNow = () => {
    if (user) {
      navigate('/game');
    } else {
      navigate('/login');
    }
  };

  // Handler untuk update sound settings dari GameScreen/PauseScreen
  const handleSoundSettingsChange = (enabled: boolean, music: number, sfx: number) => {
    setSoundEnabled(enabled);
    setMusicVolume(music);
    setSfxVolume(sfx);
    localStorage.setItem('neonRunnerSoundSettings', JSON.stringify({
      soundEnabled: enabled,
      musicVolume: music,
      sfxVolume: sfx
    }));
  };

  const saveSoundSettings = (enabled: boolean, music: number, sfx: number) => {
    setSoundEnabled(enabled);
    setMusicVolume(music);
    setSfxVolume(sfx);
    localStorage.setItem('neonRunnerSoundSettings', JSON.stringify({
      soundEnabled: enabled,
      musicVolume: music,
      sfxVolume: sfx
    }));
  };

  // Handler pembelian power up
  const handleBuyPowerUp = async (powerUp: any, onBuySuccess?: (powerUpId: number) => void) => {
    if (!user || !user.id) return;
    if ((user.coin || 0) < powerUp.price) {
      setShopSuccess('Not enough coins!');
      setTimeout(() => setShopSuccess(null), 2000);
      return;
    }
    try {
      const token = localStorage.getItem('neonRunnerToken') || undefined;
      await buyPowerUp(user.id, powerUp.id, token);
      // Ambil user terbaru dari backend setelah pembelian
      const res = await getUserByUsername(user.username, token);
      const updatedUser = { ...user, ...res.data, highScore: user.highScore };
      setUser(updatedUser);
      localStorage.setItem('neonRunnerUser', JSON.stringify(updatedUser));
      setShopSuccess(`Successfully purchased power-up: ${powerUp.name}`);
      if (onBuySuccess) onBuySuccess(powerUp.id); // Optimistically update UI
      setTimeout(() => setShopSuccess(null), 2000);
    } catch (e: any) {
      setShopSuccess(e.message || 'Failed to purchase power-up.');
      setTimeout(() => setShopSuccess(null), 2000);
    }
  };

  // Tambahkan polling coin user setiap 2 detik jika sudah login
  useEffect(() => {
    if (!user || !user.username) return;
    let interval: ReturnType<typeof setInterval>;
    const fetchUserCoin = async () => {
      try {
        const token = localStorage.getItem('neonRunnerToken') || undefined;
        const res = await getUserByUsername(user.username, token);
        if (res && (res.data || res.payload)) {
          const newUser = { ...user, ...(res.data || res.payload) };
          setUser(newUser);
          localStorage.setItem('neonRunnerUser', JSON.stringify(newUser));
        }
      } catch {}
    };
    fetchUserCoin();
    interval = setInterval(fetchUserCoin, 2000);
    return () => clearInterval(interval);
  }, [user?.username]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black">
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={
          <HomeScreen
            user={user}
            onPlayNow={handlePlayNow}
            onSettings={() => navigate('/settings')}
            onLeaderboard={() => navigate('/leaderboard')}
            onLogout={handleLogout}
            musicEnabled={soundEnabled}
            musicVolume={musicVolume}
            onShop={() => navigate('/shop')}
          />
        } />
        <Route path="/login" element={
          <LoginScreen
            onLogin={handleLogin}
            onBack={() => navigate('/home')}
          />
        } />
        <Route path="/game" element={
          user ? (
            <GameScreen
              user={user}
              onGameOver={async (score: number) => { await updateHighScore(score); }}
              onBack={() => navigate('/home')}
              soundEnabled={soundEnabled}
              sfxVolume={sfxVolume}
              musicVolume={musicVolume}
              onSoundSettingsChange={handleSoundSettingsChange}
            />
          ) : (
            <Navigate to="/home" replace />
          )
        } />
        <Route path="/settings" element={
          <SoundSettings
            soundEnabled={soundEnabled}
            musicVolume={musicVolume}
            sfxVolume={sfxVolume}
            onSave={saveSoundSettings}
            onBack={() => navigate('/home')}
          />
        } />
        <Route path="/leaderboard" element={
          <LeaderboardScreen
            leaderboard={leaderboard}
            currentUser={user}
            onBack={() => navigate('/home')}
          />
        } />
        <Route path="/shop" element={
          user ? (
            <Shop
              userCoin={user?.coin || 0}
              onBuy={handleBuyPowerUp}
              shopSuccess={shopSuccess}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        } />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default App;