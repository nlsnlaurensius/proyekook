import React, { useState, useEffect } from 'react';

interface PauseScreenProps {
  onResume: () => void;
  onBack: () => void;
  soundEnabled: boolean;
  sfxVolume: number;
  musicVolume: number;
  onSoundSettingsChange: (soundEnabled: boolean, musicVolume: number, sfxVolume: number) => void;
}

const PauseScreen: React.FC<PauseScreenProps> = ({
  onResume,
  onBack,
  soundEnabled,
  sfxVolume,
  musicVolume,
  onSoundSettingsChange,
}) => {
  // Local state for UI, but always sync with props
  const [localSoundEnabled, setLocalSoundEnabled] = useState(soundEnabled);
  const [localSfxVolume, setLocalSfxVolume] = useState(sfxVolume);
  const [localMusicVolume, setLocalMusicVolume] = useState(musicVolume);

  // Sync local state with props if props change (e.g. from other screens)
  useEffect(() => {
    setLocalSoundEnabled(soundEnabled);
  }, [soundEnabled]);
  useEffect(() => {
    setLocalSfxVolume(sfxVolume);
  }, [sfxVolume]);
  useEffect(() => {
    setLocalMusicVolume(musicVolume);
  }, [musicVolume]);

  // Handlers that update both local and global state
  const handleToggleSound = () => {
    setLocalSoundEnabled((prev) => {
      onSoundSettingsChange(!prev, localMusicVolume, localSfxVolume);
      return !prev;
    });
  };
  const handleSfxVolume = (v: number) => {
    setLocalSfxVolume(v);
    onSoundSettingsChange(localSoundEnabled, localMusicVolume, v);
  };
  const handleMusicVolume = (v: number) => {
    setLocalMusicVolume(v);
    onSoundSettingsChange(localSoundEnabled, v, localSfxVolume);
  };

  return (
    <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] flex items-center justify-center z-30">
      <div className="mx-auto w-full max-w-xs bg-gradient-to-br from-[#1a1a2e] via-[#23234d] to-[#0f3460] rounded-2xl shadow-2xl border-2 border-cyan-400/40 p-8 flex flex-col items-center gap-6 animate-fade-in">
        <h2 className="text-4xl font-extrabold text-cyan-300 drop-shadow-lg tracking-wider mb-2 neon-glow">PAUSED</h2>
        <button
          onClick={onResume}
          className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-lg shadow-md hover:shadow-cyan-400/40 hover:scale-105 transition-all duration-200 mb-2"
        >
          Resume
        </button>
        {/* Sound Settings */}
        <div className="w-full bg-black/40 rounded-lg p-4 border border-cyan-400/20 flex flex-col gap-4 mb-2">
          {/* Master Sound Switch */}
          <div className="mb-2 flex items-center justify-between">
            <span className="text-cyan-200 font-semibold">Sound</span>
            <button
              onClick={handleToggleSound}
              className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors duration-200 ${localSoundEnabled ? 'bg-cyan-400' : 'bg-gray-600'}`}
              aria-label="Toggle Sound"
            >
              <span
                className={`h-5 w-5 bg-white rounded-full shadow transform transition-transform duration-200 ${localSoundEnabled ? 'translate-x-5' : ''}`}
              />
            </button>
          </div>
          {/* SFX Volume */}
          <div className="flex items-center gap-3 justify-between">
            <span className="text-cyan-200 text-xs w-20">SFX Volume</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={localSfxVolume}
              onChange={e => handleSfxVolume(Number(e.target.value))}
              className="w-28 accent-cyan-400"
              disabled={!localSoundEnabled}
            />
            <span className="text-cyan-200 text-xs w-8 text-right">{Math.round(localSfxVolume * 100)}</span>
          </div>
          {/* Music Volume */}
          <div className="flex items-center gap-3 justify-between">
            <span className="text-purple-200 text-xs w-20">Music Volume</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={localMusicVolume}
              onChange={e => handleMusicVolume(Number(e.target.value))}
              className="w-28 accent-purple-400"
              disabled={!localSoundEnabled}
            />
            <span className="text-purple-200 text-xs w-8 text-right">{Math.round(localMusicVolume * 100)}</span>
          </div>
        </div>
        <button
          onClick={onBack}
          className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-lg shadow-md hover:shadow-cyan-400/40 hover:scale-105 transition-all duration-200"
        >
          Back to Menu
        </button>
      </div>
    </div>
  );
};

export default PauseScreen;
