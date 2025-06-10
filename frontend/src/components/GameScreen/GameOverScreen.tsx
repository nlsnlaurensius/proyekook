import React from 'react';

interface GameOverScreenProps {
  score: number;
  coinCount: number;
  onBack: () => void;
  onRestart: () => void;
  submitting: boolean;
  submitError: string | null;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({
  score,
  coinCount,
  onBack,
  onRestart,
  submitting,
  submitError,
}) => (
  <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px] flex items-center justify-center z-30">
    <div className="mx-auto w-full max-w-xs bg-gradient-to-br from-[#1a1a2e] via-[#23234d] to-[#0f3460] rounded-2xl shadow-2xl border-2 border-cyan-400/40 p-8 flex flex-col items-center gap-6 animate-fade-in">
      <h2 className="text-4xl font-extrabold text-cyan-300 drop-shadow-lg tracking-wider mb-2 neon-glow">GAME OVER</h2>
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
