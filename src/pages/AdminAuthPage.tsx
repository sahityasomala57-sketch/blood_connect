import React, { useState } from 'react';
import { 
  Shield, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { authService } from '../services/auth';

interface AdminAuthPageProps {
  onNavigate: (view: string) => void;
}

export const AdminAuthPage: React.FC<AdminAuthPageProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDemoLogin = () => {
    authService.loginWithDemo('ADMIN');
    onNavigate('/admin/dashboard');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please enter your administrator credentials.');
      setLoading(false);
      return;
    }

    const res = authService.loginRole(email, password, 'ADMIN');
    setLoading(false);
    if (!res.success) {
      setError(res.error || 'Authentication failed');
    } else {
      onNavigate('/admin/dashboard');
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 px-4 sm:px-6">
      <button
        onClick={() => onNavigate('/')}
        className="text-xs text-[#64748B] hover:text-[#0B1F3A] flex items-center gap-1.5 mb-4 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to login
      </button>

      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="text-center space-y-2 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#E3F2FD] border border-[#1976D2]/30 text-[#1976D2] flex items-center justify-center mx-auto shadow-xs">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-[#0B1F3A]">
            Admin Command Access
          </h2>
          <p className="text-xs text-[#64748B]">
            System root supervisor, security audit, and emergency governance.
          </p>
        </div>

        <div className="mb-5 p-3.5 rounded-xl bg-[#EEF2F6] border border-[#E2E8F0] flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold text-[#0B1F3A] uppercase tracking-wider block">
              Evaluation Shortcut
            </span>
            <p className="text-[11px] text-[#172033]">
              Network Command Director
            </p>
          </div>
          <button
            type="button"
            onClick={handleDemoLogin}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#0B1F3A] hover:bg-[#123B63] shadow-xs flex items-center gap-1.5 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            1-Click Demo
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-500/40 rounded-xl text-xs text-red-600 dark:text-red-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="font-semibold text-[#0B1F3A] block mb-1">Supervisor Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin.demo@example.com"
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-[#172033] focus:outline-none focus:border-[#1976D2] focus:ring-1 focus:ring-[#1976D2]"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-[#0B1F3A] block mb-1">Security Key / Password</label>
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-500/30 transition-all flex items-center justify-center gap-2 mt-4"
          >
            Authenticate Administrator
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
