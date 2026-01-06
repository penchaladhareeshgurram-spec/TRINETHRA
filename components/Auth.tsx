
import React, { useState } from 'react';
import { registerUser, loginUser } from '../services/authService';
import { User } from '../types';
import { Icon } from './Icon';

interface AuthProps {
  onAuthSuccess: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [view, setView] = useState<'login' | 'signup'>('login');
  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    password: '',
    confirmPassword: '',
    bio: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (view === 'signup') {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match.');
        setLoading(false);
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters.');
        setLoading(false);
        return;
      }
    }

    // A shorter, quieter delay
    await new Promise(resolve => setTimeout(resolve, 600));

    if (view === 'login') {
      const user = loginUser(formData.username, formData.password);
      if (user) {
        onAuthSuccess(user);
      } else {
        setError('Access denied. Check your credentials.');
      }
    } else {
      if (!formData.displayName.trim()) {
        setError('Display name is required.');
        setLoading(false);
        return;
      }
      const user = registerUser(formData.username, formData.displayName, formData.password, formData.bio);
      if (user) {
        onAuthSuccess(user);
      } else {
        setError('Username is already taken.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#020617] relative">
      <div className="w-full max-w-[400px] relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
            TRINETHRA
          </h1>
          <p className="text-slate-500 text-xs font-medium tracking-widest uppercase">
            {view === 'login' ? 'Sign in to continue' : 'Create your vision account'}
          </p>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-3xl backdrop-blur-sm shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {view === 'signup' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider ml-1">Display Name</label>
                  <input
                    type="text"
                    name="displayName"
                    required
                    value={formData.displayName}
                    onChange={handleInputChange}
                    placeholder="Your name"
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 outline-none focus:border-violet-500/50 transition-colors text-sm text-white placeholder:text-slate-700"
                  />
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider ml-1">Username</label>
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Unique handle"
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 outline-none focus:border-violet-500/50 transition-colors text-sm text-white placeholder:text-slate-700"
              />
            </div>

            <div className="space-y-1.5 relative">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider ml-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 pr-12 outline-none focus:border-violet-500/50 transition-colors text-sm text-white placeholder:text-slate-700"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                >
                  <Icon name={showPassword ? 'eye-off' : 'eye'} size={16} />
                </button>
              </div>
            </div>

            {view === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider ml-1">Confirm Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 outline-none focus:border-violet-500/50 transition-colors text-sm text-white placeholder:text-slate-700"
                />
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-[11px] text-center font-medium animate-bubble-pop">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-bold py-3.5 rounded-xl mt-4 transition-all hover:bg-slate-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <span>{view === 'login' ? 'Log In' : 'Create Account'}</span>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => { setView(view === 'login' ? 'signup' : 'login'); setError(''); }}
              className="text-slate-400 hover:text-white transition-colors text-[11px] font-medium"
            >
              {view === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
            </button>
          </div>
        </div>

        <p className="text-center text-slate-600 text-[9px] mt-12 uppercase tracking-widest">
          TRINETHRA SECURE ACCESS
        </p>
      </div>
    </div>
  );
};
