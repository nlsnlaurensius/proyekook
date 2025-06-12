// filepath: d:\Documents\KULIAH\Semester4\Netlab\project\src\components\SoundSettings.tsx
import React, { useState } from 'react';
import { ArrowLeft, Volume2, VolumeX, Music, Zap } from 'lucide-react';

interface SoundSettingsProps {
  soundEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
  onSave: (enabled: boolean, music: number, sfx: number) => void;
  onBack: () => void;
}

const SoundSettings: React.FC<SoundSettingsProps> = ({
  soundEnabled,
  musicVolume,
  sfxVolume,
  onSave,
  onBack
}) => {
  const [localSoundEnabled, setLocalSoundEnabled] = useState(soundEnabled);
  const [localMusicVolume, setLocalMusicVolume] = useState(musicVolume);
  const [localSfxVolume, setLocalSfxVolume] = useState(sfxVolume);

  const handleSave = () => {
    onSave(localSoundEnabled, localMusicVolume, localSfxVolume);
    onBack();
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
      <div className="fixed inset-0 z-30 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-black overflow-y-auto px-4 py-8 gap-8">
        <h1 className="text-3xl font-extrabold text-cyan-300 neon-glow drop-shadow-lg animate-pulse select-none mb-2">Sound Settings</h1>
        <div className="w-full max-w-xs bg-black/70 backdrop-blur-lg rounded-2xl border border-cyan-500/30 p-4 shadow-2xl">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <span className="text-white font-semibold">Sound Enabled</span>
              <button onClick={() => setLocalSoundEnabled(!localSoundEnabled)} className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${localSoundEnabled ? 'bg-gradient-to-r from-cyan-600 to-purple-600' : 'bg-gray-600'}`}>
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-transform duration-300 ${localSoundEnabled ? 'translate-x-7' : 'translate-x-1'}`}></div>
              </button>
            </div>
            <div className={`space-y-4 ${!localSoundEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="flex items-center justify-between">
                <span className="text-white font-semibold">Music Volume</span>
              </div>
              <div className="relative">
                <input type="range" min="0" max="1" step="0.1" value={localMusicVolume} onChange={e => setLocalMusicVolume(parseFloat(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider" />
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>0%</span>
                  <span className="text-purple-400 font-semibold">{Math.round(localMusicVolume * 100)}%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
            <div className={`space-y-4 ${!localSoundEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="flex items-center justify-between">
                <span className="text-white font-semibold">Sound Effects</span>
              </div>
              <div className="relative">
                <input type="range" min="0" max="1" step="0.1" value={localSfxVolume} onChange={e => setLocalSfxVolume(parseFloat(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider" />
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>0%</span>
                  <span className="text-cyan-400 font-semibold">{Math.round(localSfxVolume * 100)}%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
            <button onClick={handleSave} className="w-full mt-8 bg-gradient-to-r from-cyan-600 to-purple-600 text-white font-bold py-3 rounded-lg hover:shadow-lg hover:shadow-cyan-400/30 transition-all duration-300 transform hover:scale-105 text-lg">Save Settings</button>
          </div>
        </div>
        
      </div>
    );
  }

  if (isMobile && !isPortrait) {
    // MOBILE LANDSCAPE UI (match leaderboard)
    return (
      <div className="fixed left-0 top-0 w-[100vw] h-[100vh] z-30 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-black overflow-hidden">
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
              <h2 className="text-3xl sm:text-4xl font-bold text-cyan-400 mb-2">Sound Settings</h2>
              <p className="text-gray-400 text-sm sm:text-base">Customize your audio experience</p>
            </div>
            <div className="flex-grow overflow-y-auto pr-2 min-h-0">
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <span className="text-white font-semibold">Sound Enabled</span>
                  <button onClick={() => setLocalSoundEnabled(!localSoundEnabled)} className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${localSoundEnabled ? 'bg-gradient-to-r from-cyan-600 to-purple-600' : 'bg-gray-600'}`}> <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-transform duration-300 ${localSoundEnabled ? 'translate-x-7' : 'translate-x-1'}`}></div></button>
                </div>
                <div className={`space-y-4 ${!localSoundEnabled ? 'opacity-50 pointer-events-none' : ''}`}> {/* Music Volume */}
                  <div className="flex items-center justify-between"><span className="text-white font-semibold">Music Volume</span></div>
                  <div className="relative"><input type="range" min="0" max="1" step="0.1" value={localMusicVolume} onChange={e => setLocalMusicVolume(parseFloat(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider" /><div className="flex justify-between text-xs text-gray-400 mt-2"><span>0%</span><span className="text-purple-400 font-semibold">{Math.round(localMusicVolume * 100)}%</span><span>100%</span></div></div>
                </div>
                <div className={`space-y-4 ${!localSoundEnabled ? 'opacity-50 pointer-events-none' : ''}`}> {/* SFX Volume */}
                  <div className="flex items-center justify-between"><span className="text-white font-semibold">Sound Effects</span></div>
                  <div className="relative"><input type="range" min="0" max="1" step="0.1" value={localSfxVolume} onChange={e => setLocalSfxVolume(parseFloat(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider" /><div className="flex justify-between text-xs text-gray-400 mt-2"><span>0%</span><span className="text-cyan-400 font-semibold">{Math.round(localSfxVolume * 100)}%</span><span>100%</span></div></div>
                </div>
                <button onClick={handleSave} className="w-full mt-8 bg-gradient-to-r from-cyan-600 to-purple-600 text-white font-bold py-3 rounded-lg hover:shadow-lg hover:shadow-cyan-400/30 transition-all duration-300 transform hover:scale-105 text-lg">Save Settings</button>
              </div>
            </div>
          </div>
          {/* UNIFIED Back Button */}
          <button onClick={onBack} className="w-full max-w-xs bg-black/60 px-4 py-3 rounded-lg border-2 border-cyan-400/30 text-cyan-300 font-semibold hover:bg-cyan-900/30 transition flex items-center justify-center gap-3 shadow-lg text-lg">
            <ArrowLeft className="w-6 h-6" /> Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-2 md:p-4 overflow-y-auto">
      {/* Animated background grid and particles (match HomeScreen) */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-purple-500/10"></div>
        <div className="grid grid-cols-12 grid-rows-12 h-full w-full">{Array.from({ length: 144 }).map((_, i) => (<div key={i} className="border border-cyan-500/20 animate-pulse" style={{ animationDelay: `${(i * 50) % 3000}ms` }}></div>))}</div>
      </div>
      <div className="absolute inset-0 pointer-events-none">{Array.from({ length: 20 }).map((_, i) => (<div key={i} className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-ping opacity-60" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 3}s`, animationDuration: `${2 + Math.random() * 2}s` }}></div>))}</div>
      <div className="relative z-10 w-full max-w-md mx-auto">
        {/* UNIFIED Back to Home button */}
        <button onClick={onBack} className="w-full max-w-xs bg-black/60 px-4 py-3 rounded-lg border-2 border-cyan-400/30 text-cyan-300 font-semibold hover:bg-cyan-900/30 transition flex items-center justify-center gap-3 shadow-lg text-lg mb-4">
          <ArrowLeft className="w-6 h-6" />
          Back to Home
        </button>
        {/* Settings panel */}
        <div className="bg-black/70 backdrop-blur-lg rounded-2xl border border-cyan-500/30 p-4 md:p-8 shadow-2xl">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <span className="text-white font-semibold">Sound Enabled</span>
              <button onClick={() => setLocalSoundEnabled(!localSoundEnabled)} className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${localSoundEnabled ? 'bg-gradient-to-r from-cyan-600 to-purple-600' : 'bg-gray-600'}`}>
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-transform duration-300 ${localSoundEnabled ? 'translate-x-7' : 'translate-x-1'}`}></div>
              </button>
            </div>
            <div className={`space-y-4 ${!localSoundEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="flex items-center justify-between">
                <span className="text-white font-semibold">Music Volume</span>
              </div>
              <div className="relative">
                <input type="range" min="0" max="1" step="0.1" value={localMusicVolume} onChange={e => setLocalMusicVolume(parseFloat(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider" />
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>0%</span>
                  <span className="text-purple-400 font-semibold">{Math.round(localMusicVolume * 100)}%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
            <div className={`space-y-4 ${!localSoundEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="flex items-center justify-between">
                <span className="text-white font-semibold">Sound Effects</span>
              </div>
              <div className="relative">
                <input type="range" min="0" max="1" step="0.1" value={localSfxVolume} onChange={e => setLocalSfxVolume(parseFloat(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider" />
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>0%</span>
                  <span className="text-cyan-400 font-semibold">{Math.round(localSfxVolume * 100)}%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
            <button onClick={handleSave} className="w-full mt-8 bg-gradient-to-r from-cyan-600 to-purple-600 text-white font-bold py-3 rounded-lg hover:shadow-lg hover:shadow-cyan-400/30 transition-all duration-300 transform hover:scale-105 text-lg">Save Settings</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoundSettings;
