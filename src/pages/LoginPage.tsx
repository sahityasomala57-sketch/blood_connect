import React, { useState, useEffect } from 'react';
import { 
  Droplet, 
  Eye, 
  EyeOff, 
  AlertCircle 
} from 'lucide-react';
import { authService, DEMO_ACCOUNTS } from '../services/auth';
import { UserRole } from '../types';

interface LoginPageProps {
  onNavigate: (view: string) => void;
  currentRoute?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, currentRoute = '/' }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Determine if a role is pre-targeted based on route
  const getPreselectedRole = (): UserRole | null => {
    if (currentRoute === '/hospital/login') return 'HOSPITAL';
    if (currentRoute === '/blood-bank/login') return 'BLOOD_BANK';
    if (currentRoute === '/donor/login') return 'DONOR';
    if (currentRoute === '/admin/login') return 'ADMIN';
    return null;
  };

  const preselectedRole = getPreselectedRole();

  // Populate credentials if a preselected role is provided
  useEffect(() => {
    if (preselectedRole) {
      const demo = DEMO_ACCOUNTS[preselectedRole];
      if (demo) {
        setEmail(demo.email);
        setPassword('demo123');
      }
    }
  }, [preselectedRole]);

  const handleRedirectForRole = (role: UserRole) => {
    if (role === 'HOSPITAL') onNavigate('/hospital/dashboard');
    else if (role === 'BLOOD_BANK') onNavigate('/blood-bank/dashboard');
    else if (role === 'DONOR') onNavigate('/donor/dashboard');
    else if (role === 'ADMIN') onNavigate('/admin/dashboard');
    else onNavigate('/');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const targetEmail = email.trim() || 'hospital1@demo.com';
    const targetPass = password || 'demo123';

    setLoading(true);

    try {
      if (preselectedRole) {
        const res = authService.loginRole(targetEmail, targetPass, preselectedRole);
        if (res.success && res.user) {
          handleRedirectForRole(res.user.role);
          return;
        }
      }

      const autoRes = authService.loginAuto(targetEmail, targetPass);
      if (autoRes.success && autoRes.user && autoRes.role) {
        handleRedirectForRole(autoRes.role);
      } else {
        setError(autoRes.error || 'Invalid credentials. Please check your email and password.');
      }
    } catch {
      setError('An error occurred during authentication. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Demo Login and Instant Authentication
  const handleDemoClick = (role: UserRole) => {
    setError('');
    const demo = DEMO_ACCOUNTS[role];
    setEmail(demo.email);
    setPassword('demo123');

    setLoading(true);
    setTimeout(() => {
      try {
        const user = authService.loginWithDemo(role);
        handleRedirectForRole(user.role);
      } catch {
        setError('Failed to login with demo account.');
        setLoading(false);
      }
    }, 120);
  };

  const handleRegisterClick = () => {
    if (currentRoute === '/hospital/login') {
      onNavigate('/hospital/signup');
    } else if (currentRoute === '/blood-bank/login') {
      onNavigate('/blood-bank/signup');
    } else if (currentRoute === '/donor/login') {
      onNavigate('/donor/signup');
    } else {
      setShowRegisterModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans">
      {/* Top Navigation Bar - Exact Reference 2 Image Match */}
      <header className="w-full bg-white border-b border-[#E2E8F0] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between">
          {/* Brand Mark Left */}
          <div 
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2 cursor-pointer select-none group"
            title="Every Drop Has A Decision - Home"
          >
            <Droplet className="w-6 h-6 text-[#D32F2F] stroke-[2.2] fill-none group-hover:scale-105 transition-transform" />
            <span className="font-extrabold text-[#0B1F3A] text-sm sm:text-base tracking-wider uppercase">
              EVERY DROP HAS A DECISION
            </span>
          </div>

          {/* Right Action Links */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={() => onNavigate('/')}
              className="text-sm font-medium text-[#0F172A] hover:text-[#D32F2F] transition-colors cursor-pointer"
            >
              Login
            </button>
            <button
              onClick={() => setShowRegisterModal(true)}
              className="text-sm font-semibold bg-[#D32F2F] hover:bg-[#C62828] text-white px-5 py-2 rounded-lg transition-all shadow-xs cursor-pointer active:scale-98"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Centered Login Card Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-14">
        <div className="w-full max-w-[440px] bg-white border border-[#E2E8F0] rounded-2xl p-7 sm:p-9 shadow-sm">
          {/* Card Top Droplet Icon - Outline Style */}
          <div className="flex justify-center mb-3">
            <Droplet className="w-9 h-9 text-[#D32F2F] stroke-[2.2] fill-none" />
          </div>

          {/* Card Heading */}
          <h1 className="text-2xl font-bold text-[#0F172A] text-center tracking-tight">
            Welcome Back
          </h1>
          <p className="text-sm text-[#64748B] text-center mt-1 mb-6">
            Sign in to your account
          </p>

          {/* Optional Pre-selected Sector Pill */}
          {preselectedRole && (
            <div className="mb-5 flex justify-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E3F2FD] text-[#1976D2] border border-[#1976D2]/20">
                {preselectedRole === 'HOSPITAL' && 'Hospital Sector Login'}
                {preselectedRole === 'BLOOD_BANK' && 'Blood Bank Sector Login'}
                {preselectedRole === 'DONOR' && 'Donor Sector Login'}
                {preselectedRole === 'ADMIN' && 'Admin Sector Login'}
              </span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-[#FDECEC] border border-[#D32F2F]/30 text-[#B71C1C] text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="leading-snug">{error}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label 
                htmlFor="login-email" 
                className="block text-xs font-semibold text-[#334155] mb-1.5"
              >
                Email
              </label>
              <input
                id="login-email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hospital1@demo.com"
                required
                autoComplete="username"
                className="w-full px-3.5 py-2.5 bg-white border border-[#CBD5E1] focus:border-[#D32F2F] focus:ring-1 focus:ring-[#D32F2F]/30 rounded-lg text-sm text-[#0F172A] placeholder-[#94A3B8] outline-none transition-all"
              />
            </div>

            {/* Password Field */}
            <div>
              <label 
                htmlFor="login-password" 
                className="block text-xs font-semibold text-[#334155] mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-[#CBD5E1] focus:border-[#D32F2F] focus:ring-1 focus:ring-[#D32F2F]/30 rounded-lg text-sm text-[#0F172A] placeholder-[#94A3B8] outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-2.5 text-[#94A3B8] hover:text-[#0F172A] transition-colors cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-[#D32F2F] hover:bg-[#C62828] text-white font-semibold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 active:scale-[0.99] mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Login</span>
              )}
            </button>
          </form>

          {/* Demo Header */}
          <div className="text-center text-xs text-[#64748B] my-5 select-none">
            Demo Accounts (Password: demo123)
          </div>

          {/* 4 Demo Account Buttons in 2x2 Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleDemoClick('HOSPITAL')}
              className="py-2.5 px-3 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg text-xs sm:text-sm font-medium text-[#1E293B] text-center transition-colors cursor-pointer shadow-2xs"
            >
              Hospital
            </button>

            <button
              type="button"
              onClick={() => handleDemoClick('BLOOD_BANK')}
              className="py-2.5 px-3 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg text-xs sm:text-sm font-medium text-[#1E293B] text-center transition-colors cursor-pointer shadow-2xs"
            >
              Blood Bank
            </button>

            <button
              type="button"
              onClick={() => handleDemoClick('DONOR')}
              className="py-2.5 px-3 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg text-xs sm:text-sm font-medium text-[#1E293B] text-center transition-colors cursor-pointer shadow-2xs"
            >
              Donor
            </button>

            <button
              type="button"
              onClick={() => handleDemoClick('ADMIN')}
              className="py-2.5 px-3 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg text-xs sm:text-sm font-medium text-[#1E293B] text-center transition-colors cursor-pointer shadow-2xs"
            >
              Admin
            </button>
          </div>

          {/* Footer Register Link */}
          <div className="mt-6 text-center text-xs text-[#64748B]">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={handleRegisterClick}
              className="text-[#D32F2F] font-semibold hover:underline cursor-pointer transition-colors"
            >
              Register
            </button>
          </div>
        </div>
      </main>

      {/* Registration Portal Selection Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-[#0F172A]">Create an Account</h3>
              <button 
                onClick={() => setShowRegisterModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-[#64748B]">Select your sector to begin registration:</p>
            <div className="space-y-2">
              <button 
                onClick={() => { setShowRegisterModal(false); onNavigate('/hospital/signup'); }}
                className="w-full text-left p-3 rounded-xl border border-[#E2E8F0] hover:border-[#1976D2] hover:bg-[#F0F7FF] text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>🏥 Hospital Facility</span>
                <span className="text-[#1976D2]">→</span>
              </button>
              <button 
                onClick={() => { setShowRegisterModal(false); onNavigate('/blood-bank/signup'); }}
                className="w-full text-left p-3 rounded-xl border border-[#E2E8F0] hover:border-[#C62828] hover:bg-[#FDF2F2] text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>🩸 Blood Bank Transfusion Facility</span>
                <span className="text-[#C62828]">→</span>
              </button>
              <button 
                onClick={() => { setShowRegisterModal(false); onNavigate('/donor/signup'); }}
                className="w-full text-left p-3 rounded-xl border border-[#E2E8F0] hover:border-[#2E7D32] hover:bg-[#F2F9F2] text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>❤️ Volunteer Donor</span>
                <span className="text-[#2E7D32]">→</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
