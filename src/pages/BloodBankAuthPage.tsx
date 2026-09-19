import React, { useState } from 'react';
import { 
  Activity, 
  Lock, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  ArrowRight, 
  AlertCircle, 
  Sparkles,
  ArrowLeft,
  PackageCheck
} from 'lucide-react';
import { authService } from '../services/auth';

interface BloodBankAuthPageProps {
  onNavigate: (view: string) => void;
  initialMode?: 'login' | 'signup';
}

export const BloodBankAuthPage: React.FC<BloodBankAuthPageProps> = ({ onNavigate, initialMode = 'login' }) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [bloodBankName, setBloodBankName] = useState('');
  const [registrationId, setRegistrationId] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('Old Government Hospital Road, Vijayawada');
  const [capacity, setCapacity] = useState(500);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDemoLogin = () => {
    authService.loginWithDemo('BLOOD_BANK');
    onNavigate('/blood-bank/dashboard');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isLogin) {
      if (!email || !password) {
        setError('Please enter your blood bank email and password.');
        setLoading(false);
        return;
      }
      const res = authService.loginRole(email, password, 'BLOOD_BANK');
      setLoading(false);
      if (!res.success) {
        setError(res.error || 'Authentication failed');
      } else {
        onNavigate('/blood-bank/dashboard');
      }
    } else {
      if (!bloodBankName || !email || !password || !registrationId || !phone) {
        setError('Please fill in all required blood bank regulatory fields.');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        setLoading(false);
        return;
      }

      const res = authService.registerBloodBank({
        bloodBankName,
        registrationId,
        email,
        phone,
        location,
        capacity,
        password
      });

      setLoading(false);
      if (!res.success) {
        setError(res.error || 'Registration failed');
      } else {
        onNavigate('/blood-bank/dashboard');
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
          <div className="w-14 h-14 rounded-2xl bg-[#FDECEC] border border-[#C62828]/30 text-[#C62828] flex items-center justify-center mx-auto shadow-xs">
            <Activity className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Blood Bank Portal Authentication
          </h2>
          <p className="text-xs text-[#64748B]">
            Cold storage depository & emergency cross-match allocation desk.
          </p>
        </div>

        {/* 1-Click Demo Login Banner */}
        <div className="mb-5 p-3.5 rounded-xl bg-[#FDECEC] border border-[#C62828]/30 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold text-[#C62828] uppercase tracking-wider block">
              Evaluation Shortcut
            </span>
            <p className="text-[11px] text-[#172033]">
              City Central Blood Bank (6 units O-)
            </p>
          </div>
          <button
            type="button"
            onClick={handleDemoLogin}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#C62828] hover:bg-[#B71C1C] shadow-xs flex items-center gap-1.5 shrink-0"
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
                ? 'border-[#C62828] text-[#C62828]' 
                : 'border-transparent text-[#64748B] hover:text-[#0B1F3A]'
            }`}
          >
            Blood Bank Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`flex-1 pb-2.5 font-bold text-center transition-colors border-b-2 ${
              !isLogin 
                ? 'border-[#C62828] text-[#C62828]' 
                : 'border-transparent text-[#64748B] hover:text-[#0B1F3A]'
            }`}
          >
            Register Blood Bank
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
                <label className="font-semibold text-[#0B1F3A] block mb-1">Blood Bank Facility Name</label>
                <div className="relative">
                  <Activity className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={bloodBankName}
                    onChange={e => setBloodBankName(e.target.value)}
                    placeholder="e.g. Red Cross Regional Transfusion Center"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-[#172033] focus:outline-none focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#0B1F3A] block mb-1">State Blood Bank Registration ID</label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={registrationId}
                    onChange={e => setRegistrationId(e.target.value)}
                    placeholder="e.g. BB-REG-991"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-[#172033] focus:outline-none focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-[#0B1F3A] block mb-1">Dispatch Hotline Phone</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+91..."
                      className="w-full pl-9 pr-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-[#172033] focus:outline-none focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-[#0B1F3A] block mb-1">Vault Storage Capacity (Units)</label>
                  <div className="relative">
                    <PackageCheck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min={50}
                      max={5000}
                      required
                      value={capacity}
                      onChange={e => setCapacity(parseInt(e.target.value) || 400)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-[#172033] focus:outline-none focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#0B1F3A] block mb-1">Depository Physical Address</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="e.g. Gandhinagar, Vijayawada"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-[#172033] focus:outline-none focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828]"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="font-semibold text-[#0B1F3A] block mb-1">Authorized Official Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="dispatch@bloodbank.org"
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-[#172033] focus:outline-none focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828]"
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
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-[#172033] focus:outline-none focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828]"
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
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-[#172033] focus:outline-none focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828]"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-500/30 transition-all flex items-center justify-center gap-2 mt-4"
          >
            {isLogin ? 'Sign In to Blood Bank Operations' : 'Complete Blood Bank Registration'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
