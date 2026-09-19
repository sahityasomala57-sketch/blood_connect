import React from 'react';
import { 
  Building2, 
  Droplet, 
  Heart, 
  LayoutDashboard, 
  PlusCircle, 
  Clock, 
  Package, 
  ShieldAlert, 
  Bell, 
  User, 
  Compass, 
  LogOut 
} from 'lucide-react';
import { UserRole } from '../../types';

interface MobileNavProps {
  currentPath: string;
  currentRole?: UserRole;
  unreadNotificationsCount?: number;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentPath,
  currentRole,
  unreadNotificationsCount = 0,
  onNavigate,
  onLogout
}) => {
  // Only render mobile navigation when inside an authenticated sector or dashboard
  if (!currentRole) return null;

  const isActive = (path: string) => currentPath === path;

  // Hospital Navigation Tabs
  if (currentRole === 'HOSPITAL') {
    return (
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E2E8F0] shadow-lg px-2 py-1.5 flex items-center justify-around select-none">
        <button
          onClick={() => onNavigate('/hospital/dashboard')}
          className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
            isActive('/hospital/dashboard') ? 'text-[#1976D2]' : 'text-[#64748B] hover:text-[#0B1F3A]'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Dashboard</span>
        </button>

        <button
          onClick={() => onNavigate('/hospital/requests')}
          className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
            isActive('/hospital/requests') ? 'text-[#1976D2]' : 'text-[#64748B] hover:text-[#0B1F3A]'
          }`}
        >
          <Clock className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Requests</span>
        </button>

        {/* Center Prominent Create Request Action */}
        <button
          onClick={() => onNavigate('/hospital/create-request')}
          className="flex flex-col items-center justify-center -mt-5"
        >
          <div className="w-12 h-12 rounded-full bg-[#C62828] hover:bg-[#B71C1C] text-white flex items-center justify-center shadow-lg shadow-[#C62828]/30 active:scale-95 transition-transform">
            <PlusCircle className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold text-[#C62828] mt-0.5">Emergency</span>
        </button>

        <button
          onClick={() => onNavigate('/hospital/tracking')}
          className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
            isActive('/hospital/tracking') ? 'text-[#1976D2]' : 'text-[#64748B] hover:text-[#0B1F3A]'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Tracking</span>
        </button>

        <button
          onClick={() => onNavigate('/hospital/profile')}
          className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors relative ${
            isActive('/hospital/profile') ? 'text-[#1976D2]' : 'text-[#64748B] hover:text-[#0B1F3A]'
          }`}
        >
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-[#C62828]" />
          )}
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Profile</span>
        </button>
      </nav>
    );
  }

  // Blood Bank Navigation Tabs
  if (currentRole === 'BLOOD_BANK') {
    return (
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E2E8F0] shadow-lg px-2 py-1.5 flex items-center justify-around select-none">
        <button
          onClick={() => onNavigate('/blood-bank/dashboard')}
          className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
            isActive('/blood-bank/dashboard') ? 'text-[#C62828]' : 'text-[#64748B] hover:text-[#0B1F3A]'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Overview</span>
        </button>

        <button
          onClick={() => onNavigate('/blood-bank/requests')}
          className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors relative ${
            isActive('/blood-bank/requests') ? 'text-[#C62828]' : 'text-[#64748B] hover:text-[#0B1F3A]'
          }`}
        >
          <Droplet className="w-5 h-5 fill-current" />
          <span className="text-[10px] font-medium mt-1">Demands</span>
        </button>

        <button
          onClick={() => onNavigate('/blood-bank/inventory')}
          className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
            isActive('/blood-bank/inventory') ? 'text-[#C62828]' : 'text-[#64748B] hover:text-[#0B1F3A]'
          }`}
        >
          <Package className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Inventory</span>
        </button>

        <button
          onClick={() => onNavigate('/blood-bank/allocations')}
          className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
            isActive('/blood-bank/allocations') ? 'text-[#C62828]' : 'text-[#64748B] hover:text-[#0B1F3A]'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Allocations</span>
        </button>

        <button
          onClick={() => onNavigate('/blood-bank/profile')}
          className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
            isActive('/blood-bank/profile') ? 'text-[#C62828]' : 'text-[#64748B] hover:text-[#0B1F3A]'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Facility</span>
        </button>
      </nav>
    );
  }

  // Donor Navigation Tabs
  if (currentRole === 'DONOR') {
    return (
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E2E8F0] shadow-lg px-2 py-1.5 flex items-center justify-around select-none">
        <button
          onClick={() => onNavigate('/donor/dashboard')}
          className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
            isActive('/donor/dashboard') ? 'text-[#2E7D32]' : 'text-[#64748B] hover:text-[#0B1F3A]'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Status</span>
        </button>

        <button
          onClick={() => onNavigate('/donor/requests')}
          className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors relative ${
            isActive('/donor/requests') ? 'text-[#2E7D32]' : 'text-[#64748B] hover:text-[#0B1F3A]'
          }`}
        >
          <Heart className="w-5 h-5 fill-current" />
          <span className="text-[10px] font-medium mt-1">Alerts</span>
        </button>

        <button
          onClick={() => onNavigate('/donor/history')}
          className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
            isActive('/donor/history') ? 'text-[#2E7D32]' : 'text-[#64748B] hover:text-[#0B1F3A]'
          }`}
        >
          <Clock className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">History</span>
        </button>

        <button
          onClick={() => onNavigate('/donor/profile')}
          className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
            isActive('/donor/profile') ? 'text-[#2E7D32]' : 'text-[#64748B] hover:text-[#0B1F3A]'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Profile</span>
        </button>
      </nav>
    );
  }

  // Admin Navigation Tabs
  if (currentRole === 'ADMIN') {
    return (
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E2E8F0] shadow-lg px-2 py-1.5 flex items-center justify-around select-none">
        <button
          onClick={() => onNavigate('/admin/dashboard')}
          className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
            isActive('/admin/dashboard') ? 'text-[#0B1F3A] font-bold' : 'text-[#64748B]'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-1">Command</span>
        </button>

        <button
          onClick={() => onNavigate('/simulation')}
          className="flex flex-col items-center justify-center p-2 rounded-lg text-[#64748B]"
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px] mt-1">Simulate</span>
        </button>

        <button
          onClick={onLogout}
          className="flex flex-col items-center justify-center p-2 rounded-lg text-[#C62828]"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[10px] mt-1">Exit</span>
        </button>
      </nav>
    );
  }

  return null;
};
