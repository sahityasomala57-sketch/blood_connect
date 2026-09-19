import React, { useState } from 'react';
import { 
  Building2, 
  Lock, 
  Mail, 
  Phone, 
  MapPin, 
  FileBadge, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { authService } from '../services/auth';

interface HospitalAuthPageProps {
  onNavigate: (view: string) => void;
  initialMode?: 'login' | 'signup';
}

export const HospitalAuthPage: React.FC<HospitalAuthPageProps> = ({ onNavigate, initialMode = 'login' }) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [hospitalCode, setHospitalCode] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('Governorpet, Vijayawada');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDemoLogin = () => {
    authService.loginWithDemo('HOSPITAL');
    onNavigate('/hospital/dashboard');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isLogin) {
      if (!email || !password) {
        setError('Please enter your hospital email and password.');
        setLoading(false);
        return;
      }
      const res = authService.loginRole(email, password, 'HOSPITAL');
      setLoading(false);
      if (!res.success) {
        setError(res.error || 'Authentication failed');
      } else {
        onNavigate('/hospital/dashboard');
      }
    } else {
      if (!hospitalName || !email || !password || !hospitalCode || !phone) {
        setError('Please fill in all required hospital verification fields.');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        setLoading(false);
        return;
      }

      const res = authService.registerHospital({
        hospitalName,
        hospitalCode,
        email,
        phone,
        location,
        password
      });

      setLoading(false);
      if (!res.success) {
        setError(res.error || 'Registration failed');
      } else {
        onNavigate('/hospital/dashboard');
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
          <div className="w-14 h-14 rounded-2xl bg-[#E3F2FD] border border-[#1976D2]/30 text-[#1976D2] flex items-center justify-center mx-auto shadow-xs">
            <Building2 className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-[#0B1F3A]">
            Hospital Portal Authentication
          </h2>
          <p className="text-xs text-[#64748B]">
            Emergency trauma and surgical ward blood requisition system.
          </p>
        </div>

        {/* 1-Click Demo Login Banner */}
        <div className="mb-5 p-3.5 rounded-xl bg-[#E3F2FD] border border-[#1976D2]/30 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold text-[#1976D2] uppercase tracking-wider block">
              Evaluation Shortcut
            </span>
            <p className="text-[11px] text-[#172033]">
              City Care Hospital (Governorpet)
            </p>
          </div>
          <button
            type="button"
            onClick={handleDemoLogin}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#1976D2] hover:bg-[#1565C0] shadow-xs flex items-center gap-1.5 shrink-0"
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
                ? 'border-[#1976D2] text-[#1976D2]' 
                : 'border-transparent text-[#64748B] hover:text-[#0B1F3A]'
            }`}
          >
            Hospital Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`flex-1 pb-2.5 font-bold text-center transition-colors border-b-2 ${
              !isLogin 
                ? 'border-[#1976D2] text-[#1976D2]' 
                : 'border-transparent text-[#64748B] hover:text-[#0B1F3A]'
            }`}
          >
            Register New Hospital
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
                <label className="font-semibold text-[#0B1F3A] block mb-1">Hospital / Clinic Name</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={hospitalName}
                    onChange={e => setHospitalName(e.target.value)}
                    placeholder="e.g. Apex Multi-Specialty Hospital"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-[#172033] focus:outline-none focus:border-[#1976D2] focus:ring-1 focus:ring-[#1976D2]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#0B1F3A] block mb-1">Hospital ID / Medical License No.</label>
                <div className="relative">
                  <FileBadge className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={hospitalCode}
                    onChange={e => setHospitalCode(e.target.value)}
                    placeholder="e.g. HOSP-APEX-09"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-[#172033] focus:outline-none focus:border-[#1976D2] focus:ring-1 focus:ring-[#1976D2] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-[#0B1F3A] block mb-1">Direct Hotline Phone</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+91..."
                      className="w-full pl-9 pr-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-[#172033] focus:outline-none focus:border-[#1976D2] focus:ring-1 focus:ring-[#1976D2]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-[#0B1F3A] block mb-1">Facility Location</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      placeholder="e.g. Vijayawada"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-[#172033] focus:outline-none focus:border-[#1976D2] focus:ring-1 focus:ring-[#1976D2]"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="font-semibold text-[#0B1F3A] block mb-1">Hospital Official Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="trauma.desk@hospital.org"
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-[#172033] focus:outline-none focus:border-[#1976D2] focus:ring-1 focus:ring-[#1976D2]"
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
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-[#172033] focus:outline-none focus:border-[#1976D2] focus:ring-1 focus:ring-[#1976D2]"
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
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-[#172033] focus:outline-none focus:border-[#1976D2] focus:ring-1 focus:ring-[#1976D2]"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/30 transition-all flex items-center justify-center gap-2 mt-4"
          >
            {isLogin ? 'Sign In to Hospital Portal' : 'Complete Hospital Registration'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
