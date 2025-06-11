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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background grid and particles (match HomeScreen) */}
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

      <div className="relative z-10 w-full max-w-md">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-300 hover:text-cyan-400 mb-8 transition-colors duration-300"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </button>

        {/* Settings panel */}
        <div className="bg-black/70 backdrop-blur-lg rounded-2xl border border-cyan-500/30 p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <Zap className="w-10 h-10 text-cyan-400 animate-pulse" />
                <Volume2 className="w-6 h-6 text-purple-400 absolute -bottom-1 -right-1" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Sound Settings</h2>
            <p className="text-gray-400">Customize your audio experience</p>
          </div>

          <div className="space-y-8">
            {/* Master Sound Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {localSoundEnabled ? (
                  <Volume2 className="w-6 h-6 text-cyan-400" />
                ) : (
                  <VolumeX className="w-6 h-6 text-gray-400" />
                )}
                <span className="text-white font-semibold">Sound Enabled</span>
              </div>
              <button
                onClick={() => setLocalSoundEnabled(!localSoundEnabled)}
                className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${
                  localSoundEnabled 
                    ? 'bg-gradient-to-r from-cyan-600 to-purple-600' 
                    : 'bg-gray-600'
                }`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-transform duration-300 ${
                    localSoundEnabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                ></div>
              </button>
            </div>

            {/* Music Volume */}
            <div className={`space-y-4 ${!localSoundEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Music className="w-6 h-6 text-purple-400" />
                  <span className="text-white font-semibold">Music Volume</span>
                </div>
              </div>
              
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={localMusicVolume}
                  onChange={(e) => setLocalMusicVolume(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>0%</span>
                  <span className="text-purple-400 font-semibold">
                    {Math.round(localMusicVolume * 100)}%
                  </span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            {/* SFX Volume */}
            <div className={`space-y-4 ${!localSoundEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Zap className="w-6 h-6 text-cyan-400" />
                  <span className="text-white font-semibold">Sound Effects</span>
                </div>
              </div>
              
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={localSfxVolume}
                  onChange={(e) => setLocalSfxVolume(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>0%</span>
                  <span className="text-cyan-400 font-semibold">
                    {Math.round(localSfxVolume * 100)}%
                  </span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full mt-8 bg-gradient-to-r from-cyan-600 to-purple-600 text-white font-bold py-3 rounded-lg hover:shadow-lg hover:shadow-cyan-400/30 transition-all duration-300 transform hover:scale-105"
          >
            Save Settings
          </button>
        </div>
      </div>
      {/* Removed <style jsx> block that caused error */}
    </div>
  );
};

export default SoundSettings;
