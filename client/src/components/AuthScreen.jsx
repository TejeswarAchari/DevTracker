import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import api from '../utils/api';
import ForgotPassword from './ForgotPassword';

const AuthScreen = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#050505]">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyan-600/20 rounded-full blur-[120px] animate-pulse" />
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative z-10 w-full max-w-md p-8 bg-zinc-900/50 backdrop-blur-xl rounded-2xl border border-white/10"
        >
          <ForgotPassword onBack={() => setShowForgotPassword(false)} />
        </motion.div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Client-side validation
    if (isRegister && formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }
    
    if (isRegister && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      setError('Password must contain uppercase, lowercase, and a number');
      setLoading(false);
      return;
    }
    
    const endpoint = isRegister ? '/register' : '/login';
    
    try {
      const res = await api.post(endpoint, formData);
      localStorage.setItem('token', res.data.token);
      onLogin(); // Trigger parent refresh
    } catch (err) {
      const errorMsg = err.response?.data?.msg || err.response?.data?.errors?.[0]?.msg || 'Authentication failed. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#050505]">
      {/* Background Beams */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyan-600/20 rounded-full blur-[120px] animate-pulse" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 glass-panel rounded-3xl relative z-10 border border-white/10"
      >
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black text-white tracking-tighter mb-2">
            Dev<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">Tracker</span>
          </h1>
          <p className="text-zinc-500 text-sm">Log your learning. Visualize your growth.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors" size={18} />
            <input 
              className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-all"
              placeholder="Email address"
              type="email"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors" size={18} />
            <input 
              className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500 transition-all"
              placeholder={isRegister ? "Password (min 8 chars, uppercase, lowercase, number)" : "Password"}
              type="password"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              required
              minLength={isRegister ? 8 : undefined}
            />
          </div>

          <button 
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-bold shadow-lg shadow-violet-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95 mt-6"
          >
            {loading ? 'Processing...' : (isRegister ? 'Create Account' : 'Access Dashboard')}
            {!loading && <ArrowRight size={18} />}
          </button>

          {!isRegister && (
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="w-full text-center text-sm text-zinc-400 hover:text-cyan-400 transition-colors mt-3"
            >
              Forgot password?
            </button>
          )}
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-zinc-500 text-xs">
            {isRegister ? 'Already a member?' : 'New to DevTracker?'}
            <button 
              onClick={() => { setIsRegister(!isRegister); setError(''); }}
              className="ml-2 text-white font-bold hover:underline decoration-cyan-500 underline-offset-4"
            >
              {isRegister ? 'Login' : 'Register Now'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthScreen;