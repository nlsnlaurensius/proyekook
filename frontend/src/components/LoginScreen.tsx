// filepath: d:\Documents\KULIAH\Semester4\Netlab\project\src\components\LoginScreen.tsx
import React, { useState } from 'react';
import { ArrowLeft, User, Mail, Lock, Zap } from 'lucide-react';
import { login as apiLogin, register as apiRegister } from '../utils/api';

interface LoginScreenProps {
  onLogin: (username: string) => void;
  onBack: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Regex validation
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/;
  // Password: min 6 chars, at least 1 uppercase, at least 1 special char/symbol
  const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{6,}$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!usernameRegex.test(username)) {
      setError('Username harus 3-20 karakter, hanya huruf, angka, dan _');
      return;
    }
    if (!isLogin && !emailRegex.test(email)) {
      setError('Email tidak valid');
      return;
    }
    if (!passwordRegex.test(password)) {
      setError('Password minimal 6 karakter, 1 huruf besar, dan 1 simbol unik');
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        const res = await apiLogin(username.trim(), password);
        // res: { token, user }
        localStorage.setItem('neonRunnerToken', res.token);
        localStorage.setItem('neonRunnerUser', JSON.stringify(res.user));
        onLogin(res.user.username);
      } else {
        await apiRegister(username.trim(), email.trim(), password);
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed');
    }
    setLoading(false);
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

        {/* Login form */}
        <div className="bg-black/70 backdrop-blur-lg rounded-2xl border border-cyan-500/30 p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Zap className="w-10 h-10 text-cyan-400 animate-pulse" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {isLogin ? 'Login' : 'Register'}
            </h2>
            <p className="text-gray-400">
              {isLogin ? 'Welcome back, runner!' : 'Join the neon resistance'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <User className="w-5 h-5 text-cyan-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-all duration-300"
                required
              />
            </div>

            {!isLogin && (
              <div className="relative">
                <Mail className="w-5 h-5 text-cyan-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-all duration-300"
                  required={!isLogin}
                />
              </div>
            )}

            <div className="relative">
              <Lock className="w-5 h-5 text-cyan-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-all duration-300"
                required
              />
            </div>

            {error && (
              <div className="text-red-400 text-center text-sm font-semibold">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 text-white font-bold py-3 rounded-lg hover:shadow-lg hover:shadow-cyan-400/30 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                isLogin ? 'Login' : 'Register'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </p>
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors duration-300"
            >
              {isLogin ? 'Register here' : 'Login here'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
