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
  coin?: number; 
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
  const [lastOrientation, setLastOrientation] = useState<{ isMobile: boolean; isPortrait: boolean } | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('neonRunnerUser');
    if (savedUser && savedUser !== 'undefined') {
      setUser(JSON.parse(savedUser));
    }
    const savedSoundSettings = localStorage.getItem('neonRunnerSoundSettings');
    if (savedSoundSettings && savedSoundSettings !== 'undefined') {
      const settings = JSON.parse(savedSoundSettings);
      setSoundEnabled(settings.soundEnabled);
      setMusicVolume(settings.musicVolume);
      setSfxVolume(settings.sfxVolume);
    }
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
        setLeaderboard([]);
      }
    };
    fetchLeaderboard();
  }, []);

  useEffect(() => {
    function handleGlobalClick() {
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
      console.log('Login response:', res);

      const rawUser = res?.user || res?.data || res?.payload;
      if (rawUser) {
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
    if (user && score > user.highScore) {
      const updatedUser = { ...user, highScore: score };
      setUser(updatedUser);
      localStorage.setItem('neonRunnerUser', JSON.stringify(updatedUser));
    }
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

  const handlePlayNow = (orientation?: { isMobile: boolean; isPortrait: boolean }) => {
    if (user) {
      if (orientation) setLastOrientation(orientation);
      navigate('/game', { state: orientation });
    } else {
      navigate('/login');
    }
  };

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
      const res = await getUserByUsername(user.username, token);
      const updatedUser = { ...user, ...res.data, highScore: user.highScore };
      setUser(updatedUser);
      localStorage.setItem('neonRunnerUser', JSON.stringify(updatedUser));
      setShopSuccess(`Successfully purchased power-up: ${powerUp.name}`);
      if (onBuySuccess) onBuySuccess(powerUp.id); 
      setTimeout(() => setShopSuccess(null), 2000);
    } catch (e: any) {
      setShopSuccess(e.message || 'Failed to purchase power-up.');
      setTimeout(() => setShopSuccess(null), 2000);
    }
  };

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
            onPlayNow={(orientation) => handlePlayNow(orientation)}
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
              orientationState={lastOrientation}
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
        <Route path="*" element={<NotFoundPage onBack={() => navigate('/home')} />} />
      </Routes>
    </div>
  );
}

export default App;