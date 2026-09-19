import React, { useState } from 'react';
import { 
  Building2, 
  Activity, 
  HeartHandshake, 
  Shield, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  MapPin, 
  Droplet, 
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { authService } from '../services/auth';
import { UserRole, BloodGroup } from '../types';

interface AuthPageProps {
  onNavigate: (view: string) => void;
  initialRole?: UserRole;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onNavigate, initialRole = 'HOSPITAL' }) => {
  const [activeRole, setActiveRole] = useState<UserRole>(initialRole);
  const [isLoginMode, setIsLoginMode] = useState<boolean>(true);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [orgId, setOrgId] = useState('');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O-');
  const [error, setError] = useState('');

  const handleDemoLogin = (role: UserRole) => {
    authService.loginWithDemo(role);
    if (role === 'HOSPITAL') onNavigate('hospital');
    else if (role === 'BLOOD_BANK') onNavigate('bloodbank');
    else if (role === 'DONOR') onNavigate('donor');
    else if (role === 'ADMIN') onNavigate('admin');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLoginMode) {
      if (!email || !password) {
        setError('Please enter both email and password.');
        return;
      }
      authService.login(email, activeRole);
    } else {
      if (!name || !email || !password) {
        setError('Please fill in all required fields.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      authService.signup({
        name,
        email,
        role: activeRole,
        entityId: `custom-${Date.now()}`
      });
    }

    if (activeRole === 'HOSPITAL') onNavigate('hospital');
    else if (activeRole === 'BLOOD_BANK') onNavigate('bloodbank');
    else if (activeRole === 'DONOR') onNavigate('donor');
    else if (activeRole === 'ADMIN') onNavigate('admin');
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4 sm:px-6">
      <div className="bg-[#0D152D] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-red-600/20 text-red-400 flex items-center justify-center mx-auto border border-red-500/30">
            <Droplet className="w-6 h-6 fill-current" />
          </div>
          <h2 className="text-2xl font-black text-white">Welcome to Every Drop</h2>
          <p className="text-xs text-slate-400">
            Choose your role to access the emergency blood network.
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-4 gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => { setActiveRole('HOSPITAL'); setError(''); }}
            className={`py-2 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
              activeRole === 'HOSPITAL' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Hospital</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveRole('BLOOD_BANK'); setError(''); }}
            className={`py-2 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
              activeRole === 'BLOOD_BANK' 
                ? 'bg-red-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Blood Bank</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveRole('DONOR'); setError(''); }}
            className={`py-2 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
              activeRole === 'DONOR' 
                ? 'bg-emerald-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Donor</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveRole('ADMIN'); setError(''); }}
            className={`py-2 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
              activeRole === 'ADMIN' 
                ? 'bg-purple-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>

        {/* 1-Click Instant Demo Login Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800/80 to-slate-900 border border-slate-700/80 flex items-center justify-between gap-3 shadow-md">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold uppercase font-mono">
                Judge / Evaluation Mode
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Skip registration and enter as verified demo <strong>{activeRole.replace('_', ' ')}</strong>.
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleDemoLogin(activeRole)}
            className="px-3 py-2 rounded-xl text-xs font-bold text-white bg-slate-700 hover:bg-slate-600 border border-slate-600 shrink-0 flex items-center gap-1.5 shadow"
          >
            Instant Demo Login
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Form Mode Toggle */}
        <div className="flex items-center justify-center gap-4 mb-4 border-b border-slate-800 pb-3 text-xs">
          <button
            type="button"
            onClick={() => { setIsLoginMode(true); setError(''); }}
            className={`font-bold transition-colors ${isLoginMode ? 'text-white border-b-2 border-red-500 pb-1' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Sign In with Email
          </button>
          <button
            type="button"
            onClick={() => { setIsLoginMode(false); setError(''); }}
            className={`font-bold transition-colors ${!isLoginMode ? 'text-white border-b-2 border-red-500 pb-1' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Create New Account
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-xs text-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {!isLoginMode && (
            <>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  {activeRole === 'HOSPITAL' ? 'Hospital Name' :
                   activeRole === 'BLOOD_BANK' ? 'Blood Bank Name' :
                   activeRole === 'DONOR' ? 'Full Name' : 'Admin Name'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Apex Health Center"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {activeRole === 'DONOR' && (
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Blood Group
                  </label>
                  <select
                    value={bloodGroup}
                    onChange={e => setBloodGroup(e.target.value as BloodGroup)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-bold focus:outline-none focus:border-blue-500"
                  >
                    {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              )}

              {(activeRole === 'HOSPITAL' || activeRole === 'BLOOD_BANK') && (
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    {activeRole === 'HOSPITAL' ? 'Hospital ID / License' : 'Registration ID'}
                  </label>
                  <input
                    type="text"
                    value={orgId}
                    onChange={e => setOrgId(e.target.value)}
                    placeholder="e.g. REG-88410"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Phone</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+91..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Location</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      placeholder="e.g. Vijayawada"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your.email@domain.com"
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {!isLoginMode && (
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 shadow-lg shadow-red-950/40 transition-all mt-4 flex items-center justify-center gap-2"
          >
            {isLoginMode ? 'Sign In to Network' : 'Complete Registration'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
