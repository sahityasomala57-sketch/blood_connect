import React from 'react';
import { 
  Building2, 
  Activity, 
  HeartHandshake, 
  Shield, 
  ArrowRight, 
  Droplet, 
  UserPlus, 
  LogIn, 
  CheckCircle2, 
  Zap,
  Sparkles
} from 'lucide-react';
import { authService } from '../services/auth';

interface PortalSelectPageProps {
  onNavigate: (view: string) => void;
}

export const PortalSelectPage: React.FC<PortalSelectPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FDECEC] border border-[#C62828]/30 text-[#C62828] text-xs font-bold">
          <Droplet className="w-3.5 h-3.5 fill-current" />
          ROLE-SPECIFIC ACCESS GATEWAY
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0B1F3A]">
          Welcome to Every Drop
        </h1>
        <p className="text-sm text-[#64748B] max-w-xl mx-auto">
          Choose your role to access your dedicated emergency blood network portal with strict role-based controls and separate authentication.
        </p>
      </div>

      {/* 3 Main Role Portals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Hospital Portal Card */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-[#E3F2FD] border border-[#1976D2]/30 text-[#1976D2] flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <Building2 className="w-7 h-7" />
            </div>

            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-black text-[#0B1F3A]">HOSPITAL</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#E3F2FD] text-[#1976D2] font-bold">
                TRAUMA CLINIC
              </span>
            </div>

            <p className="text-xs text-[#64748B] leading-relaxed mb-4">
              Create and manage emergency blood requests with instant multi-factor allocation scoring and real-time transit tracking.
            </p>

            <ul className="text-xs text-[#64748B] space-y-1.5 mb-6">
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#1976D2]" /> Hospital ID Verification</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> 8-Stage Smart Matching</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Patient OR Demands</li>
            </ul>
          </div>

          <div className="space-y-2 pt-2 border-t border-[#E2E8F0]">
            <button
              onClick={() => onNavigate('auth-hospital-login')}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-[#1976D2] hover:bg-[#1565C0] shadow-xs flex items-center justify-center gap-2 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Hospital Login
            </button>
            <button
              onClick={() => onNavigate('auth-hospital-signup')}
              className="w-full py-2.5 rounded-xl text-xs font-semibold text-[#0B1F3A] bg-[#EEF2F6] hover:bg-[#E2E8F0] border border-[#E2E8F0] flex items-center justify-center gap-2 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Register Hospital
            </button>
          </div>
        </div>

        {/* 2. Blood Bank Portal Card */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-[#FDECEC] border border-[#C62828]/30 text-[#C62828] flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <Activity className="w-7 h-7" />
            </div>

            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-black text-[#0B1F3A]">BLOOD BANK</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FDECEC] text-[#C62828] font-bold">
                COLD STORAGE
              </span>
            </div>

            <p className="text-xs text-[#64748B] leading-relaxed mb-4">
              Manage cold storage inventory, verify emergency compatibility, and confirm immediate allocation reservations.
            </p>

            <ul className="text-xs text-[#64748B] space-y-1.5 mb-6">
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#C62828]" /> License Reg ID Control</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#C62828]" /> Real-time Shared Requests</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#C62828]" /> Save Every Drop (Expiry &lt;4d)</li>
            </ul>
          </div>

          <div className="space-y-2 pt-2 border-t border-[#E2E8F0]">
            <button
              onClick={() => onNavigate('auth-bloodbank-login')}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-[#C62828] hover:bg-[#B71C1C] shadow-xs flex items-center justify-center gap-2 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Blood Bank Login
            </button>
            <button
              onClick={() => onNavigate('auth-bloodbank-signup')}
              className="w-full py-2.5 rounded-xl text-xs font-semibold text-[#0B1F3A] bg-[#EEF2F6] hover:bg-[#E2E8F0] border border-[#E2E8F0] flex items-center justify-center gap-2 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Register Blood Bank
            </button>
          </div>
        </div>

        {/* 3. Donor Portal Card */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-[#E8F5E9] border border-[#2E7D32]/30 text-[#2E7D32] flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <HeartHandshake className="w-7 h-7" />
            </div>

            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-black text-[#0B1F3A]">DONOR</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#E8F5E9] text-[#2E7D32] font-bold">
                VOLUNTEER
              </span>
            </div>

            <p className="text-xs text-[#64748B] leading-relaxed mb-4">
              Respond to compatible emergency requests near you, control your live availability state, and track your lifesaving record.
            </p>

            <ul className="text-xs text-[#64748B] space-y-1.5 mb-6">
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32]" /> ABO/Rh Target Matching</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32]" /> 3-State Availability Control</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32]" /> Emergency Commitment Dispatch</li>
            </ul>
          </div>

          <div className="space-y-2 pt-2 border-t border-[#E2E8F0]">
            <button
              onClick={() => onNavigate('auth-donor-login')}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-[#2E7D32] hover:bg-[#256629] shadow-xs flex items-center justify-center gap-2 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Donor Login
            </button>
            <button
              onClick={() => onNavigate('auth-donor-signup')}
              className="w-full py-2.5 rounded-xl text-xs font-semibold text-[#0B1F3A] bg-[#EEF2F6] hover:bg-[#E2E8F0] border border-[#E2E8F0] flex items-center justify-center gap-2 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Join as Donor
            </button>
          </div>
        </div>
      </div>

      {/* Admin Portal Banner */}
      <div className="bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Admin Command Center</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Complete network visibility, scarcity monitors, audit logs, and system operations.</p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('auth-admin-login')}
          className="px-4 py-2 rounded-xl text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-500/30 transition-colors flex items-center gap-2"
        >
          Admin Login
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Instant 1-Click Evaluation Strip for Judges */}
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span><strong>Judge Fast Access:</strong> Want to bypass forms? Switch accounts with 1 click:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => { authService.loginWithDemo('HOSPITAL'); onNavigate('hospital'); }}
            className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-colors"
          >
            Demo Hospital
          </button>
          <button
            onClick={() => { authService.loginWithDemo('BLOOD_BANK'); onNavigate('bloodbank'); }}
            className="px-2.5 py-1 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-500 transition-colors"
          >
            Demo Blood Bank
          </button>
          <button
            onClick={() => { authService.loginWithDemo('DONOR'); onNavigate('donor'); }}
            className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-500 transition-colors"
          >
            Demo Donor
          </button>
          <button
            onClick={() => { authService.loginWithDemo('ADMIN'); onNavigate('admin'); }}
            className="px-2.5 py-1 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-500 transition-colors"
          >
            Demo Admin
          </button>
        </div>
      </div>
    </div>
  );
};
