import React, { useState, useEffect } from 'react';
import { Droplet, ShieldCheck } from 'lucide-react';
import { User } from '../../types';
import { Sidebar } from './Sidebar';
import { MinimalHeader } from './MinimalHeader';

export interface AuthenticatedLayoutProps {
  user: User | null;
  currentRoute: string;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}

export const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({
  user,
  currentRoute,
  onNavigate,
  children
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  // Close mobile drawer whenever route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [currentRoute]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-[#0B1F3A] antialiased">
      {/* 1. Left Sidebar Navigation (Fixed on desktop, drawer on mobile) */}
      <Sidebar
        user={user}
        currentRoute={currentRoute}
        onNavigate={onNavigate}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(prev => !prev)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* 2. Main Page Column */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ease-in-out ${
          isCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'
        }`}
      >
        {/* Minimal Header with Page Title and Notifications */}
        <MinimalHeader
          currentRoute={currentRoute}
          role={user?.role}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(prev => !prev)}
          onToggleMobileMenu={() => setIsMobileOpen(prev => !prev)}
          onNavigate={onNavigate}
        />

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>

        {/* Minimal Clean Healthcare Footer */}
        <footer className="border-t border-[#E2E8F0] bg-white py-5 text-xs text-[#64748B] mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-[#FDECEC] text-[#C62828] flex items-center justify-center border border-[#C62828]/20 shrink-0">
                <Droplet className="w-3 h-3 fill-current" />
              </div>
              <span className="font-extrabold text-[#0B1F3A] tracking-wider text-[11px]">
                EVERY DROP HAS A DECISION
              </span>
              <span className="text-[#94A3B8]">•</span>
              <span className="text-[#64748B] text-[11px] hidden md:inline">
                Smart Blood & Emergency Donor Network
              </span>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-[#64748B]">
              <span className="flex items-center gap-1.5 text-[#2E7D32] font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                Emergency Coordination Infrastructure
              </span>
              <span className="text-[#94A3B8] hidden sm:inline">•</span>
              <span className="font-mono text-[10px] text-[#94A3B8] hidden sm:inline">
                Release 2026.09
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
