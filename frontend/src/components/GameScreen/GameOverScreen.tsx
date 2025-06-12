import React from 'react';

interface GameOverScreenProps {
  score: number;
  coinCount: number;
  onBack: () => void;
  onRestart: () => void;
  submitting: boolean;
  submitError: string | null;
  isHighScore?: boolean; // NEW PROP
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({
  score,
  coinCount,
  onBack,
  onRestart,
  submitting,
  submitError,
  isHighScore = false, // default false
}) => (
  <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px] flex items-center justify-center z-50">
    <div className="mx-auto w-full max-w-xs bg-gradient-to-br from-[#1a1a2e] via-[#23234d] to-[#0f3460] rounded-2xl shadow-2xl border-2 border-cyan-400/40 p-8 flex flex-col items-center gap-6 animate-fade-in">
      <h2 className="text-4xl font-extrabold text-cyan-300 drop-shadow-lg tracking-wider mb-2 neon-glow">GAME OVER</h2>
      {isHighScore && (
        <div className="w-full flex flex-col items-center mb-2 animate-pulse">
          <span className="text-2xl font-extrabold text-yellow-300 neon-glow drop-shadow-lg mb-1">NEW HIGH SCORE!</span>
          <span className="text-lg text-cyan-200 font-semibold">You set a new record!</span>
          <div className="w-16 h-1 bg-gradient-to-r from-yellow-400 via-cyan-400 to-purple-400 rounded-full mt-2 animate-glow" />
        </div>
      )}
      <div className="text-white text-lg font-semibold mb-2">Score: <span className="text-cyan-400">{score}</span></div>
      <div className="text-yellow-300 text-lg font-semibold mb-2">Coins: <span className="text-yellow-400">{coinCount}</span></div>
      <button
        onClick={onBack}
        className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-lg shadow-md hover:shadow-cyan-400/40 hover:scale-105 transition-all duration-200 mb-2"
      >
        Back to Menu
      </button>
      <button
        onClick={onRestart}
        className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-lg shadow-md hover:shadow-cyan-400/40 hover:scale-105 transition-all duration-200"
      >
        Play Again
      </button>
      {submitting && <div className="text-cyan-300 text-sm mt-2">Submitting score...</div>}
      {submitError && <div className="text-red-400 text-sm mt-2">{submitError}</div>}
    </div>
  </div>
);

export default GameOverScreen;
