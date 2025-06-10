import React, { useState, useEffect } from 'react';
import HomeScreen from './components/HomeScreen';
import LoginScreen from './components/LoginScreen';
import GameScreen from './components/GameScreen';
import SoundSettings from './components/SoundSettings';
import LeaderboardScreen from './components/LeaderboardScreen';
import { login as apiLogin, getLeaderboard, getUserByUsername } from './utils/api';
import { playClick } from './utils/clickSound';

export type Screen = 'home' | 'login' | 'game' | 'settings' | 'leaderboard';

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
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [user, setUser] = useState<User | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicVolume, setMusicVolume] = useState(0.7);
  const [sfxVolume, setSfxVolume] = useState(0.8);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

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
        setLeaderboard(leaderboardData.map((entry: any) => ({
          username: entry.username,
          score: entry.score,
          rank: entry.rank,
        })));
      } catch (e) {
        // fallback: empty leaderboard
        setLeaderboard([]);
      }
    };
    fetchLeaderboard();
  }, []);

  useEffect(() => {
    function handleGlobalClick(e: MouseEvent) {
      // Deteksi jika sedang di GameScreen dan bukan pause
      if (currentScreen === 'game') return;
      if (!soundEnabled) return;
      playClick(sfxVolume);
    }
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [currentScreen, soundEnabled, sfxVolume]);

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
        setCurrentScreen('home');
      } else {
        alert('Login gagal: Data user tidak ditemukan.');
      }
    } catch (e: any) {
      alert(e.message || 'Login failed');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('neonRunnerUser');
    localStorage.removeItem('neonRunnerToken');
    setCurrentScreen('home');
  };

  const updateHighScore = async (score: number, coinsCollected?: number): Promise<void> => {
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
      setLeaderboard(leaderboardData.map((entry: any) => ({
        username: entry.username,
        score: entry.score,
        rank: entry.rank,
      })));
    } catch (e) {}
  };

  const handlePlayNow = () => {
    if (user) {
      setCurrentScreen('game');
    } else {
      setCurrentScreen('login');
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

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return (
          <HomeScreen
            user={user}
            onPlayNow={handlePlayNow}
            onSettings={() => setCurrentScreen('settings')}
            onLeaderboard={() => setCurrentScreen('leaderboard')}
            onLogout={handleLogout}
            musicEnabled={soundEnabled}
            musicVolume={musicVolume}
          />
        );
      case 'login':
        return (
          <LoginScreen
            onLogin={handleLogin}
            onBack={() => setCurrentScreen('home')}
          />
        );
      case 'game':
        return (
          <GameScreen
            user={user!}
            onGameOver={async (score: number, coinsCollected: number) => { await updateHighScore(score, coinsCollected); }}
            onBack={() => setCurrentScreen('home')}
            soundEnabled={soundEnabled}
            sfxVolume={sfxVolume}
            musicVolume={musicVolume}
            onSoundSettingsChange={handleSoundSettingsChange}
          />
        );
      case 'settings':
        return (
          <SoundSettings
            soundEnabled={soundEnabled}
            musicVolume={musicVolume}
            sfxVolume={sfxVolume}
            onSave={saveSoundSettings}
            onBack={() => setCurrentScreen('home')}
          />
        );
      case 'leaderboard':
        return (
          <LeaderboardScreen
            leaderboard={leaderboard}
            currentUser={user}
            onBack={() => setCurrentScreen('home')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black">
      {renderScreen()}
    </div>
  );
}

export default App;