import React, { useState } from 'react';
import { 
  HeartHandshake, 
  Lock, 
  Mail, 
  Phone, 
  MapPin, 
  Droplet, 
  User, 
  ArrowRight, 
  AlertCircle, 
  Sparkles,
  ArrowLeft,
  Activity
} from 'lucide-react';
import { authService } from '../services/auth';
import { BloodGroup, DonorAvailability } from '../types';

interface DonorAuthPageProps {
  onNavigate: (view: string) => void;
  initialMode?: 'login' | 'signup';
}

export const DonorAuthPage: React.FC<DonorAuthPageProps> = ({ onNavigate, initialMode = 'login' }) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O-');
  const [location, setLocation] = useState('Benz Circle, Vijayawada');
  const [availability, setAvailability] = useState<DonorAvailability>('AVAILABLE');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDemoLogin = () => {
    authService.loginWithDemo('DONOR');
    onNavigate('/donor/dashboard');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isLogin) {
      if (!email || !password) {
        setError('Please enter your donor email and password.');
        setLoading(false);
        return;
      }
      const res = authService.loginRole(email, password, 'DONOR');
      setLoading(false);
      if (!res.success) {
        setError(res.error || 'Authentication failed');
      } else {
        onNavigate('/donor/dashboard');
      }
    } else {
      if (!name || !email || !password || !phone) {
        setError('Please fill in all required donor registration fields.');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        setLoading(false);
        return;
      }

      const res = authService.registerDonor({
        name,
        email,
        phone,
        bloodGroup,
        location,
        availability,
        password
      });

      setLoading(false);
      if (!res.success) {
        setError(res.error || 'Registration failed');
      } else {
        onNavigate('/donor/dashboard');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 px-4 sm:px-6">
      {/* Back button */}
      <button
        onClick={() => onNavigate('/')}
        className="text-xs text-[#64748B] hover:text-[#0B1F3A] flex items-center gap-1.5 mb-4 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to login
      </button>

      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-xs">
        {/* Header Branding */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#E8F5E9] border border-[#2E7D32]/30 text-[#2E7D32] flex items-center justify-center mx-auto shadow-xs">
            <HeartHandshake className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Volunteer Donor Network
          </h2>
          <p className="text-xs text-[#64748B]">
            Rapid trauma matching and live emergency alert notifications.
          </p>
        </div>

        {/* 1-Click Demo Login Banner */}
        <div className="mb-5 p-3.5 rounded-xl bg-[#E8F5E9] border border-[#2E7D32]/30 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold text-[#2E7D32] uppercase tracking-wider block">
              Evaluation Shortcut
            </span>
            <p className="text-[11px] text-[#172033]">
              Suresh Varma (O- Universal Donor)
            </p>
          </div>
          <button
            type="button"
            onClick={handleDemoLogin}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#2E7D32] hover:bg-[#256629] shadow-xs flex items-center gap-1.5 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            1-Click Demo
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-[#E2E8F0] mb-5 text-xs">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`flex-1 pb-2.5 font-bold text-center transition-colors border-b-2 ${
              isLogin 
                ? 'border-[#2E7D32] text-[#2E7D32]' 
                : 'border-transparent text-[#64748B] hover:text-[#0B1F3A]'
            }`}
          >
            Donor Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`flex-1 pb-2.5 font-bold text-center transition-colors border-b-2 ${
              !isLogin 
                ? 'border-[#2E7D32] text-[#2E7D32]' 
                : 'border-transparent text-[#64748B] hover:text-[#0B1F3A]'
            }`}
          >
            Join as Volunteer Donor
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-500/40 rounded-xl text-xs text-red-600 dark:text-red-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {!isLogin && (
            <>
              <div>
                <label className="font-semibold text-[#0B1F3A] block mb-1">Full Legal Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Ramesh Chandra"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-[#172033] focus:outline-none focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-[#0B1F3A] block mb-1">Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={e => setBloodGroup(e.target.value as BloodGroup)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold focus:outline-none focus:border-emerald-500"
                  >
                    {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-[#0B1F3A] block mb-1">Initial Availability</label>
                  <select
                    value={availability}
                    onChange={e => setAvailability(e.target.value as DonorAvailability)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-emerald-500"
                  >
                    <option value="AVAILABLE">AVAILABLE (Active)</option>
                    <option value="TEMPORARILY_UNAVAILABLE">TEMP UNAVAILABLE</option>
                    <option value="OFFLINE">OFFLINE</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-[#0B1F3A] block mb-1">Mobile Contact Phone</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+91..."
                      className="w-full pl-9 pr-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-[#172033] focus:outline-none focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-[#0B1F3A] block mb-1">Location / Area</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      placeholder="e.g. Benz Circle, Vijayawada"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-[#172033] focus:outline-none focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32]"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="font-semibold text-[#0B1F3A] block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-[#172033] focus:outline-none focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32]"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-[#0B1F3A] block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-[#172033] focus:outline-none focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32]"
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="font-semibold text-[#0B1F3A] block mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-[#172033] focus:outline-none focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32]"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 mt-4"
          >
            {isLogin ? 'Sign In as Donor' : 'Register & Join Lifesaver Network'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
