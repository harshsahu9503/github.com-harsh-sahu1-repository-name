/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Lock, 
  Mail, 
  Key, 
  AlertTriangle, 
  ShieldCheck, 
  ShieldAlert, 
  LogOut, 
  Clock,
  ChevronRight,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION = 60; // seconds

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [attempts, setAttempts] = useState(() => {
    const saved = localStorage.getItem('login_attempts');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(() => {
    const saved = localStorage.getItem('lockout_until');
    return saved ? parseInt(saved, 10) : null;
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem('login_attempts', attempts.toString());
  }, [attempts]);

  useEffect(() => {
    if (lockoutUntil) {
      localStorage.setItem('lockout_until', lockoutUntil.toString());
    } else {
      localStorage.removeItem('lockout_until');
    }
  }, [lockoutUntil]);

  // Lockout Timer Logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (lockoutUntil) {
      const calculateTimeLeft = () => {
        const now = Date.now();
        const diff = Math.ceil((lockoutUntil - now) / 1000);
        if (diff <= 0) {
          setLockoutUntil(null);
          setAttempts(0);
          setTimeLeft(0);
          setError(null);
        } else {
          setTimeLeft(diff);
        }
      };

      calculateTimeLeft();
      timer = setInterval(calculateTimeLeft, 1000);
    }

    return () => clearInterval(timer);
  }, [lockoutUntil]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (lockoutUntil && Date.now() < lockoutUntil) return;

    // Mock Credentials
    const MOCK_EMAIL = 'admin@example.com';
    const MOCK_PASSWORD = 'password123';

    if (email === MOCK_EMAIL && password === MOCK_PASSWORD) {
      setIsLoggedIn(true);
      setAttempts(0);
      setError(null);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= MAX_ATTEMPTS) {
        const until = Date.now() + LOCKOUT_DURATION * 1000;
        setLockoutUntil(until);
        setError(`Too many failed attempts. Account locked for ${LOCKOUT_DURATION} seconds.`);
      } else if (newAttempts === MAX_ATTEMPTS - 1) {
        setError('Warning: One more failed attempt will lock your account for security purposes.');
      } else {
        setError('Invalid email or password.');
      }
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setEmail('');
    setPassword('');
  };

  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-[#111] border border-white/10 rounded-2xl p-8 shadow-2xl"
        >
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
              <ShieldCheck className="w-10 h-10 text-emerald-500" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
              <p className="text-zinc-400">Secure session established for <span className="text-zinc-200 font-medium">{email}</span></p>
            </div>
            
            <div className="w-full grid grid-cols-2 gap-4 py-4">
              <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 text-left">
                <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1">Status</p>
                <p className="text-emerald-400 font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  Active
                </p>
              </div>
              <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 text-left">
                <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1">Security</p>
                <p className="text-zinc-200 font-medium">Encrypted</p>
              </div>
            </div>

            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-white text-black font-bold py-4 rounded-xl hover:bg-zinc-200 transition-colors group"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const isLocked = lockoutUntil !== null;
  const remainingAttempts = MAX_ATTEMPTS - attempts;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 font-sans selection:bg-emerald-500/30">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-500/5 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full relative"
      >
        {/* Header Section */}
        <div className="flex flex-col items-center mb-10 space-y-4">
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 backdrop-blur-sm">
            {isLocked ? (
              <ShieldAlert className="w-8 h-8 text-red-500 animate-pulse" />
            ) : (
              <Shield className="w-8 h-8 text-zinc-200" />
            )}
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight mb-1">Secure Login</h1>
            <p className="text-zinc-500 text-sm">Access the SecureGuard Dashboard</p>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-[#111] border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-md">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-widest text-zinc-500 font-bold ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-white transition-colors" />
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLocked}
                    placeholder="admin@example.com"
                    className="w-full bg-zinc-900/50 border border-white/5 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-white/20 focus:bg-zinc-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-widest text-zinc-500 font-bold ml-1">Password</label>
                <div className="relative group">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-white transition-colors" />
                  <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLocked}
                    placeholder="••••••••"
                    className="w-full bg-zinc-900/50 border border-white/5 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-white/20 focus:bg-zinc-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  />
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3"
                >
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm text-red-200 font-medium">{error}</p>
                    {isLocked && (
                      <div className="flex items-center gap-2 text-red-400 text-xs font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        Unlocking in {timeLeft}s
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              <button 
                type="submit"
                disabled={isLocked}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                  isLocked 
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                    : 'bg-white text-black hover:bg-zinc-200'
                }`}
              >
                {isLocked ? <Lock className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                {isLocked ? 'Account Locked' : 'Authorize Access'}
              </button>

              {!isLocked && attempts > 0 && (
                <div className="flex items-center justify-center gap-2">
                  <div className="flex gap-1">
                    {[...Array(MAX_ATTEMPTS)].map((_, i) => (
                      <div 
                        key={i}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          i < attempts ? 'bg-red-500' : 'bg-zinc-800'
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${
                    remainingAttempts === 1 ? 'text-red-500 animate-pulse' : 'text-zinc-500'
                  }`}>
                    {remainingAttempts} {remainingAttempts === 1 ? 'Attempt' : 'Attempts'} Remaining
                  </span>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer Info */}
        <p className="text-center mt-8 text-zinc-600 text-xs">
          Protected by SecureGuard™ Advanced Threat Detection
        </p>
      </motion.div>
    </div>
  );
}
