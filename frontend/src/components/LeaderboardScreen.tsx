// filepath: d:\Documents\KULIAH\Semester4\Netlab\project\src\components\LeaderboardScreen.tsx
import React from 'react';
import { ArrowLeft, Crown, Trophy, Medal, Star, Zap } from 'lucide-react';
import { LeaderboardEntry, User } from '../App';

interface LeaderboardScreenProps {
  leaderboard: LeaderboardEntry[];
  currentUser: User | null;
  onBack: () => void;
}

const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ leaderboard, currentUser, onBack }) => {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Trophy className="w-6 h-6 text-gray-300" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <Star className="w-5 h-5 text-cyan-400" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-500/20 to-yellow-600/20 border-yellow-400/50';
      case 2:
        return 'from-gray-400/20 to-gray-500/20 border-gray-400/50';
      case 3:
        return 'from-amber-500/20 to-amber-600/20 border-amber-500/50';
      default:
        return 'from-cyan-500/10 to-purple-500/10 border-cyan-500/30';
    }
  };


  const currentUserRank = currentUser 
    ? leaderboard.findIndex(entry => entry.username === currentUser.username) + 1
    : 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-black relative overflow-hidden px-2 md:px-0">
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

      <div className="relative z-10 w-full max-w-2xl mx-auto">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-300 hover:text-cyan-400 mb-8 transition-colors duration-300"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </button>

        {/* Leaderboard panel */}
        <div className="bg-black/70 backdrop-blur-lg rounded-2xl border border-cyan-500/30 p-4 md:p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <Zap className="w-10 h-10 text-cyan-400 animate-pulse" />
                <Crown className="w-6 h-6 text-yellow-400 absolute -top-1 -right-1 animate-bounce" />
              </div>
            </div>
            <h2 className="text-4xl font-bold text-white mb-2">Leaderboard</h2>
            <p className="text-gray-400">Top runners in the neon city</p>
          </div>

          {/* Current user stats */}
          {currentUser && (
            <div className="mb-6 p-4 bg-gradient-to-r from-cyan-600/20 to-purple-600/20 rounded-lg border border-cyan-400/30">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full flex items-center justify-center">
                    <span className="text-black font-bold text-sm">
                      {currentUser.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="font-semibold">{currentUser.username}</span>
                </div>
                <div className="text-right">
                  <div className="text-cyan-400 font-bold">{currentUser.highScore}</div>
                  <div className="text-xs text-gray-400">
                    {currentUserRank > 0 ? `Rank #${currentUserRank}` : 'Not ranked'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard entries */}
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
                    className={`p-4 rounded-lg border backdrop-blur-sm transition-all duration-300 hover:scale-105 ${
                      isCurrentUser 
                        ? 'bg-gradient-to-r from-cyan-600/30 to-purple-600/30 border-cyan-400/50 shadow-cyan-400/20 shadow-lg' 
                        : `bg-gradient-to-r ${getRankColor(rank)}`
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10">
                          {getRankIcon(rank)}
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${
                              rank === 1 ? 'text-yellow-400' :
                              rank === 2 ? 'text-gray-300' :
                              rank === 3 ? 'text-amber-500' :
                              'text-white'
                            }`}>
                              #{rank}
                            </span>
                            <span className={`font-semibold ${
                              isCurrentUser ? 'text-cyan-300' : 'text-white'
                            }`}>
                              {entry.username}
                              {isCurrentUser && (
                                <span className="ml-2 text-xs bg-cyan-500/30 px-2 py-1 rounded-full">
                                  You
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`text-xl font-bold ${
                          rank === 1 ? 'text-yellow-400' :
                          rank === 2 ? 'text-gray-300' :
                          rank === 3 ? 'text-amber-500' :
                          'text-cyan-400'
                        }`}>
                          {entry.score.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-400">points</div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer info */}
          <div className="mt-8 pt-6 border-t border-gray-700/50 text-center">
            <p className="text-gray-400 text-sm">
              Only your best score is shown. Keep playing to climb the ranks!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardScreen;
