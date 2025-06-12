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

  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/;
  const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{6,}$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!usernameRegex.test(username)) {
      setError('Username: 3-20 karakter (huruf, angka, atau _).');
      return;
    }
    if (!isLogin && !emailRegex.test(email)) {
      setError('Masukkan alamat email yang valid.');
      return;
    }
    if (!passwordRegex.test(password)) {
      setError('Password: min 6 karakter, 1 huruf besar, 1 simbol.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const res: any = await apiLogin(username.trim(), password);
        localStorage.setItem('neonRunnerToken', res.token);
        localStorage.setItem('neonRunnerUser', JSON.stringify(res.user));
        onLogin(res.user.username);
      } else {
        await apiRegister(username.trim(), email.trim(), password);
        setIsLogin(true);
        setError('Registrasi berhasil! Silakan login.');
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Terjadi kesalahan.';
      setError(`Error: ${message}`);
    }
    setLoading(false);
  };
  
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setUsername('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="fixed inset-0 z-30 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-black px-4 overflow-y-auto">
        
        <div className="absolute inset-0 opacity-20 pointer-events-none z-0">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-purple-500/10"></div>
            <div className="grid grid-cols-12 grid-rows-12 h-full w-full">{Array.from({ length: 144 }).map((_, i) => (<div key={i} className="border border-cyan-500/20 animate-pulse" style={{ animationDelay: `${(i * 50) % 3000}ms` }}></div>))}</div>
        </div>
        
        <div className="relative z-10 w-full flex flex-col items-center justify-center gap-6 max-w-sm sm:max-w-md">
            
            <div className="bg-black/70 backdrop-blur-lg rounded-2xl border border-cyan-500/30 p-6 sm:p-8 shadow-2xl w-full">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4"><Zap className="w-10 h-10 text-cyan-400 animate-pulse" /></div>
                <h2 className="text-3xl font-bold text-white mb-2">{isLogin ? 'Login' : 'Register'}</h2>
                <p className="text-gray-400">{isLogin ? 'Welcome back, runner!' : 'Join the neon resistance'}</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                    <User className="w-5 h-5 text-cyan-400 absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                    <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300" required />
                </div>
                
                {!isLogin && (
                    <div className="relative">
                        <Mail className="w-5 h-5 text-cyan-400 absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300" required={!isLogin} />
                    </div>
                )}
                
                <div className="relative">
                    <Lock className="w-5 h-5 text-cyan-400 absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300" required />
                </div>
                
                {error && <div className="text-red-400 text-center text-sm font-semibold p-3 bg-red-900/20 rounded-lg border border-red-500/30">{error}</div>}
                
                <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 text-white font-bold py-3 rounded-lg hover:shadow-lg hover:shadow-cyan-400/30 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">
                    {loading ? (<div className="flex items-center justify-center gap-2"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div><span>Processing...</span></div>) : (isLogin ? 'Login' : 'Register')}
                </button>
              </form>
              
              <div className="mt-6 text-center">
                <p className="text-gray-400">{isLogin ? "Don't have an account?" : "Already have an account?"}</p>
                <button onClick={toggleMode} className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors duration-300">{isLogin ? 'Register here' : 'Login here'}</button>
              </div>
            </div>

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

export default LoginScreen;