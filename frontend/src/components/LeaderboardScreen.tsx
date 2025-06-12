// filepath: src/components/LeaderboardScreen.tsx
import React, { useEffect, useState } from 'react';
import { ArrowLeft, Crown, Trophy, Medal, Star, Zap } from 'lucide-react';
import { LeaderboardEntry, User } from '../App';

interface LeaderboardScreenProps {
  leaderboard: LeaderboardEntry[];
  currentUser: User | null;
  onBack: () => void;
}

const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ leaderboard, currentUser, onBack }) => {
  // Helper function to get the icon based on rank
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2: return <Trophy className="w-6 h-6 text-gray-300" />;
      case 3: return <Medal className="w-6 h-6 text-amber-600" />;
      default: return <Star className="w-5 h-5 text-cyan-400" />;
    }
  };

  // Helper function to get background color based on rank
  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'from-yellow-500/20 to-yellow-600/20 border-yellow-400/50';
      case 2: return 'from-gray-400/20 to-gray-500/20 border-gray-400/50';
      case 3: return 'from-amber-500/20 to-amber-600/20 border-amber-500/50';
      default: return 'from-cyan-500/10 to-purple-500/10 border-cyan-500/30';
    }
  };

  // Find the current user's rank in the leaderboard
  const currentUserRank = currentUser
    ? leaderboard.findIndex(entry => entry.username === currentUser.username) + 1
    : 0;

  // --- Standard responsive logic ---
  // This state is kept for potential future use but the layout is now handled by responsive classes
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 1024);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // JSX for the list of leaderboard entries. Reused in all views.
  const leaderboardListContent = (
    <div className="space-y-3">
      {leaderboard.length === 0 ? (
        <div className="text-center py-8">
          <Trophy className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">No scores yet. Be the first to set a record!</p>
        </div>
      ) : (
        leaderboard.map((entry, index) => {
          const rank = index + 1;
          const isCurrentUser = currentUser?.username === entry.username;
          return (
            <div
              key={`${entry.username}-${index}`}
              className={`p-3 sm:p-4 rounded-lg border backdrop-blur-sm transition-all duration-300 ${isCurrentUser
                  ? 'bg-gradient-to-r from-cyan-600/30 to-purple-600/30 border-cyan-400/50 shadow-cyan-400/20 shadow-lg scale-105'
                  : `bg-gradient-to-r ${getRankColor(rank)} hover:scale-105`
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10">{getRankIcon(rank)}</div>
                  <div className="font-semibold text-sm sm:text-base text-white">
                    {entry.username}
                    {isCurrentUser && <span className="ml-2 text-xs bg-cyan-500/30 text-cyan-200 px-2 py-1 rounded-full">You</span>}
                  </div>
                </div>
                <div className={`text-lg sm:text-xl font-bold ${rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-gray-300' : rank === 3 ? 'text-amber-500' : 'text-cyan-400'}`}>
                  {entry.score.toLocaleString()}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
  
  // --- UNIFIED & RESPONSIVE LAYOUT ---
  return (
    <div className="fixed inset-0 z-30 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-black p-4 overflow-y-auto">
        
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-20 pointer-events-none z-0">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-purple-500/10"></div>
            <div className="grid grid-cols-12 grid-rows-12 h-full w-full">{Array.from({ length: 144 }).map((_, i) => (<div key={i} className="border border-cyan-500/20 animate-pulse" style={{ animationDelay: `${(i * 50) % 3000}ms` }}></div>))}</div>
        </div>
        
        {/* Main Content Wrapper (Responsive) */}
        <div className="relative z-10 w-full flex flex-col items-center justify-center gap-6 max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl">
            
            {/* Main Panel */}
            <div className="bg-black/70 backdrop-blur-lg rounded-2xl border border-cyan-500/30 shadow-2xl w-full p-4 sm:p-6 flex flex-col max-h-[85vh]">
                <div className="text-center mb-4 sm:mb-6 flex-shrink-0">
                    <div className="flex items-center justify-center mb-4 relative">
                        <Zap className="w-10 h-10 text-cyan-400 animate-pulse" />
                        <Crown className="w-6 h-6 text-yellow-400 absolute -top-1 -right-1 animate-bounce" />
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">Leaderboard</h2>
                    <p className="text-gray-400 text-sm sm:text-base">Top runners in the neon city</p>
                </div>
                
                {/* Scrollable List Area */}
                <div className="flex-grow overflow-y-auto pr-2 min-h-0">
                    {leaderboardListContent}
                </div>
            </div>

            {/* UNIFIED Back Button */}
            <button 
                onClick={onBack} 
                className="w-full max-w-xs bg-black/60 px-4 py-3 rounded-lg border-2 border-cyan-400/30 text-cyan-300 font-semibold hover:bg-cyan-900/30 transition flex items-center justify-center gap-3 shadow-lg text-lg"
            >
                <ArrowLeft className="w-6 h-6" /> Back to Home
            </button>
        </div>
    </div>
  );
};

export default LeaderboardScreen;