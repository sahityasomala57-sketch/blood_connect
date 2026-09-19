import React from 'react';
import { ShieldAlert, LogIn, Sparkles, ArrowLeft } from 'lucide-react';
import { UserRole } from '../../types';
import { authService } from '../../services/auth';

interface RoleAccessGuardProps {
  requiredRole: UserRole;
  currentRole?: UserRole;
  onNavigate: (view: string) => void;
  children: React.ReactNode;
}

export const RoleAccessGuard: React.FC<RoleAccessGuardProps> = ({
  requiredRole,
  currentRole,
  onNavigate,
  children
}) => {
  const isAuthorized = currentRole === requiredRole || currentRole === 'ADMIN';

  if (isAuthorized) {
    return <>{children}</>;
  }

  const roleConfig: Record<UserRole, { name: string; sector: string; loginRoute: string; dashboardRoute: string; color: string }> = {
    HOSPITAL: {
      name: 'Hospital Facility',
      sector: 'Sector 01: Clinical Triage',
      loginRoute: '/hospital/login',
      dashboardRoute: '/hospital/dashboard',
      color: '#1976D2'
    },
    BLOOD_BANK: {
      name: 'Blood Bank Facility',
      sector: 'Sector 02: Transfusion Authority',
      loginRoute: '/blood-bank/login',
      dashboardRoute: '/blood-bank/dashboard',
      color: '#C62828'
    },
    DONOR: {
      name: 'Registered Volunteer Donor',
      sector: 'Sector 03: Community Network',
      loginRoute: '/donor/login',
      dashboardRoute: '/donor/dashboard',
      color: '#2E7D32'
    },
    ADMIN: {
      name: 'System Administrator',
      sector: 'Sector 00: Command Center',
      loginRoute: '/admin/login',
      dashboardRoute: '/admin/dashboard',
      color: '#0B1F3A'
    }
  };

  const target = roleConfig[requiredRole];

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-8 shadow-md text-center space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-[#FFF8E1] border border-[#F9A825]/30 text-[#F9A825] flex items-center justify-center mx-auto shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#F9A825] bg-[#FFF8E1] px-3 py-1 rounded-full border border-[#F9A825]/30">
            Sector Authorization Required
          </span>
          <h2 className="text-xl font-black text-[#0B1F3A]">
            {target.sector} Access Restricted
          </h2>
          <p className="text-xs text-[#64748B] max-w-md mx-auto leading-relaxed">
            You are attempting to access a role-protected workspace without active authentication in <strong>{target.name}</strong>. Current session: <strong className="text-[#0B1F3A]">{currentRole ? currentRole.replace('_', ' ') : 'GUEST'}</strong>.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onNavigate(target.loginRoute)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0B1F3A] hover:bg-[#123B63] shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Login to {target.name}</span>
          </button>

          <button
            onClick={() => {
              authService.loginWithDemo(requiredRole);
              onNavigate(target.dashboardRoute);
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-[#1976D2] bg-[#E3F2FD] hover:bg-[#BBDEFB] border border-[#1976D2]/30 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>1-Click Verified Demo Access</span>
          </button>
        </div>

        <div className="pt-3 border-t border-[#E2E8F0]">
          <button
            onClick={() => onNavigate('/')}
            className="text-xs text-[#64748B] hover:text-[#0B1F3A] inline-flex items-center gap-1 cursor-pointer font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </button>
        </div>
      </div>
    </div>
  );
};
