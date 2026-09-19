import React from 'react';
import { 
  Droplet, 
  Home, 
  AlertTriangle, 
  PlusCircle, 
  Compass, 
  Activity, 
  Sliders, 
  Bell, 
  User as UserIcon, 
  LogOut, 
  Package, 
  Clock, 
  BarChart3, 
  Heart, 
  CheckCircle2, 
  History, 
  Building2, 
  ShieldCheck, 
  FileText, 
  TrendingUp, 
  ChevronLeft, 
  ChevronRight,
  X,
  Lock,
  Layers
} from 'lucide-react';
import { User, UserRole } from '../../types';
import { authService } from '../../services/auth';
import { centralStore } from '../../services/store';

export interface SidebarProps {
  user: User | null;
  currentRoute: string;
  onNavigate: (path: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenNotifications?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  badge?: string | number;
  badgeColor?: string;
  isEmergency?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  currentRoute,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  onOpenNotifications
}) => {
  const role: UserRole = user?.role || 'HOSPITAL';

  // Live request counts for badges
  const emergencyRequests = centralStore.getEmergencyRequests();
  const activeRequestsCount = emergencyRequests.filter(r => r.status !== 'FULFILLED' && r.status !== 'CANCELLED').length;
  const criticalRequestsCount = emergencyRequests.filter(r => r.urgency === 'CRITICAL' && r.status !== 'FULFILLED').length;

  // Build role-specific navigation items exactly as specified
  const getNavItems = (): NavItem[] => {
    switch (role) {
      case 'HOSPITAL':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/hospital/dashboard' },
          { 
            id: 'requests', 
            label: 'Emergency Requests', 
            icon: AlertTriangle, 
            path: '/hospital/requests',
            badge: activeRequestsCount > 0 ? activeRequestsCount : undefined,
            badgeColor: '#C62828',
            isEmergency: true
          },
          { id: 'create-request', label: 'Create Request', icon: PlusCircle, path: '/hospital/create-request' },
          { id: 'tracking', label: 'Request Tracking', icon: Compass, path: '/hospital/tracking' },
          { id: 'availability', label: 'Blood Availability', icon: Droplet, path: '/hospital/availability' },
          { id: 'simulation', label: 'Simulation', icon: Sliders, path: '/simulation' },
          { id: 'notifications', label: 'Notifications', icon: Bell, path: '/hospital/notifications' },
          { id: 'profile', label: 'Profile', icon: UserIcon, path: '/hospital/profile' }
        ];

      case 'BLOOD_BANK':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/blood-bank/dashboard' },
          { 
            id: 'requests', 
            label: 'Emergency Requests', 
            icon: AlertTriangle, 
            path: '/blood-bank/requests',
            badge: criticalRequestsCount > 0 ? criticalRequestsCount : undefined,
            badgeColor: '#C62828',
            isEmergency: true
          },
          { id: 'inventory', label: 'Inventory', icon: Droplet, path: '/blood-bank/inventory' },
          { id: 'allocations', label: 'Allocations', icon: Package, path: '/blood-bank/allocations' },
          { id: 'expiring', label: 'Expiring Units', icon: Clock, path: '/blood-bank/expiring' },
          { id: 'availability', label: 'Blood Availability', icon: BarChart3, path: '/blood-bank/availability' },
          { id: 'simulation', label: 'Simulation', icon: Sliders, path: '/simulation' },
          { id: 'notifications', label: 'Notifications', icon: Bell, path: '/blood-bank/notifications' },
          { id: 'profile', label: 'Profile', icon: UserIcon, path: '/blood-bank/profile' }
        ];

      case 'DONOR':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/donor/dashboard' },
          { 
            id: 'requests', 
            label: 'Emergency Requests', 
            icon: AlertTriangle, 
            path: '/donor/requests',
            badge: activeRequestsCount > 0 ? activeRequestsCount : undefined,
            badgeColor: '#C62828',
            isEmergency: true
          },
          { id: 'availability', label: 'Availability', icon: Heart, path: '/donor/availability' },
          { id: 'eligibility', label: 'Eligibility', icon: CheckCircle2, path: '/donor/eligibility' },
          { id: 'history', label: 'Donation History', icon: History, path: '/donor/history' },
          { id: 'simulation', label: 'Simulation', icon: Sliders, path: '/simulation' },
          { id: 'notifications', label: 'Notifications', icon: Bell, path: '/donor/notifications' },
          { id: 'profile', label: 'Profile', icon: UserIcon, path: '/donor/profile' }
        ];

      case 'ADMIN':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/admin/dashboard' },
          { id: 'hospitals', label: 'Hospitals', icon: Building2, path: '/admin/hospitals' },
          { id: 'blood-banks', label: 'Blood Banks', icon: Activity, path: '/admin/blood-banks' },
          { id: 'donors', label: 'Donors', icon: Heart, path: '/admin/donors' },
          { 
            id: 'requests', 
            label: 'Emergency Requests', 
            icon: AlertTriangle, 
            path: '/admin/requests',
            badge: activeRequestsCount > 0 ? activeRequestsCount : undefined,
            badgeColor: '#C62828',
            isEmergency: true
          },
          { id: 'inventory', label: 'Blood Inventory', icon: Droplet, path: '/admin/inventory' },
          { id: 'allocations', label: 'Allocations', icon: Package, path: '/admin/allocations' },
          { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
          { id: 'stats', label: 'Network Statistics', icon: TrendingUp, path: '/admin/stats' },
          { id: 'simulation', label: 'Simulation', icon: Sliders, path: '/simulation' },
          { id: 'audit', label: 'Audit Logs', icon: FileText, path: '/admin/audit' },
          { id: 'notifications', label: 'Notifications', icon: Bell, path: '/admin/notifications' },
          { id: 'profile', label: 'Profile', icon: UserIcon, path: '/admin/profile' }
        ];

      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const handleItemClick = (item: NavItem) => {
    if (item.id === 'notifications' && onOpenNotifications) {
      onOpenNotifications();
      if (isMobileOpen) onCloseMobile();
      return;
    }
    onNavigate(item.path);
    if (isMobileOpen) {
      onCloseMobile();
    }
  };

  const handleLogout = () => {
    authService.logout();
    onNavigate('/');
    if (isMobileOpen) onCloseMobile();
  };

  // Determine active item
  const isItemActive = (item: NavItem): boolean => {
    if (currentRoute === item.path) return true;
    if (item.id === 'dashboard') {
      return currentRoute.endsWith('/dashboard') || currentRoute === `/${role.toLowerCase().replace('_', '-')}`;
    }
    return currentRoute.includes(item.id);
  };

  // Role details format
  const getRoleHeader = () => {
    switch (role) {
      case 'HOSPITAL':
        return { icon: '🏥', label: 'Hospital Facility', entity: user?.name || 'City Care Hospital' };
      case 'BLOOD_BANK':
        return { icon: '🩸', label: 'Blood Bank', entity: user?.name || 'City Central Blood Bank' };
      case 'DONOR':
        return { icon: '❤️', label: 'Volunteer Donor', entity: user?.name || 'Suresh Varma' };
      case 'ADMIN':
        return { icon: '🔐', label: 'System Admin', entity: user?.name || 'Command Director' };
    }
  };

  const roleHeader = getRoleHeader();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0B1F3A] text-white border-r border-[#123B63] select-none">
      {/* 1. TOP BRANDING */}
      <div className="p-4 border-b border-[#123B63] flex items-center justify-between">
        <div 
          onClick={() => onNavigate('/')}
          className={`flex items-center gap-2.5 cursor-pointer group ${isCollapsed ? 'justify-center w-full' : ''}`}
          title="Every Drop Has A Decision"
        >
          <div className="w-8 h-8 rounded-lg bg-[#123B63] border border-[#1976D2] flex items-center justify-center text-[#C62828] group-hover:scale-105 transition-transform shrink-0">
            <Droplet className="w-4 h-4 fill-current" />
          </div>
          {!isCollapsed && (
            <div className="leading-tight min-w-0">
              <span className="font-extrabold text-white text-xs tracking-wider uppercase block truncate">
                EVERY DROP
              </span>
              <span className="text-[10px] text-blue-200 font-medium block truncate">
                HAS A DECISION
              </span>
            </div>
          )}
        </div>

        {/* Desktop Collapse Toggle Button */}
        {!isMobileOpen && (
          <button
            onClick={onToggleCollapse}
            className={`hidden lg:flex items-center justify-center w-7 h-7 rounded-lg bg-[#071426] hover:bg-[#123B63] text-slate-300 hover:text-white transition-colors cursor-pointer ${
              isCollapsed ? 'hidden' : ''
            }`}
            title="Collapse Sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Mobile Close Button */}
        {isMobileOpen && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#123B63] cursor-pointer"
            title="Close Menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 2. ROLE INDICATOR BADGE */}
      {!isCollapsed ? (
        <div className="px-4 py-3 border-b border-[#123B63]/60 bg-[#071426]/50">
          <div className="flex items-center gap-2">
            <span className="text-base leading-none">{roleHeader.icon}</span>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase font-bold text-blue-300 tracking-wider block truncate">
                {roleHeader.label}
              </span>
              <span className="text-xs font-semibold text-white block truncate">
                {roleHeader.entity}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-2.5 flex justify-center border-b border-[#123B63]/60 bg-[#071426]/50" title={`${roleHeader.label}: ${roleHeader.entity}`}>
          <span className="text-sm">{roleHeader.icon}</span>
        </div>
      )}

      {/* 3. NAVIGATION ITEMS LIST */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {navItems.map(item => {
          const active = isItemActive(item);
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer group text-left relative ${
                active
                  ? 'bg-[#1976D2] text-white shadow-sm shadow-[#1976D2]/30'
                  : 'text-slate-300 hover:text-white hover:bg-[#123B63]/70'
              } ${isCollapsed ? 'justify-center px-2' : ''}`}
            >
              <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                active ? 'text-white' : item.isEmergency ? 'text-[#C62828]' : 'text-slate-300'
              }`} />

              {!isCollapsed && (
                <span className="flex-1 truncate">{item.label}</span>
              )}

              {!isCollapsed && item.badge !== undefined && (
                <span 
                  className="px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white shrink-0 shadow-2xs"
                  style={{ backgroundColor: item.badgeColor || '#1976D2' }}
                >
                  {item.badge}
                </span>
              )}

              {/* Tooltip dot for collapsed items with badges */}
              {isCollapsed && item.badge !== undefined && (
                <span 
                  className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full ring-2 ring-[#0B1F3A]"
                  style={{ backgroundColor: item.badgeColor || '#C62828' }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* 4. BOTTOM PROFILE & LOGOUT SECTION */}
      <div className="p-3 border-t border-[#123B63] bg-[#071426]/60">
        {!isCollapsed ? (
          <div className="flex items-center justify-between gap-2">
            {/* Clickable Profile Info */}
            <div 
              onClick={() => {
                const profilePath = `/${role.toLowerCase().replace('_', '-')}/profile`;
                onNavigate(profilePath);
                if (isMobileOpen) onCloseMobile();
              }}
              className="flex items-center gap-2.5 min-w-0 flex-1 p-1 rounded-lg hover:bg-[#123B63] cursor-pointer transition-colors"
              title="View Profile Details"
            >
              <div className="w-8 h-8 rounded-lg bg-[#123B63] border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0">
                <UserIcon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1 leading-tight">
                <span className="text-xs font-bold text-white block truncate">
                  {user?.name || 'Authenticated User'}
                </span>
                <span className="text-[10px] text-slate-400 block truncate">
                  {user?.role}
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-[#123B63] hover:bg-[#C62828] text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => {
                const profilePath = `/${role.toLowerCase().replace('_', '-')}/profile`;
                onNavigate(profilePath);
              }}
              className="w-8 h-8 rounded-lg bg-[#123B63] hover:bg-[#1976D2] text-white flex items-center justify-center transition-colors cursor-pointer"
              title={`Profile: ${user?.name}`}
            >
              <UserIcon className="w-4 h-4" />
            </button>
            <button
              onClick={handleLogout}
              className="w-8 h-8 rounded-lg bg-[#123B63] hover:bg-[#C62828] text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside 
        className={`hidden lg:block fixed top-0 bottom-0 left-0 z-40 transition-all duration-200 ease-in-out ${
          isCollapsed ? 'w-[72px]' : 'w-[260px]'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Out Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop Overlay */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn"
            onClick={onCloseMobile}
          />
          {/* Drawer Panel */}
          <div className="relative w-[280px] max-w-[85vw] h-full shadow-2xl z-10 animate-slideRight">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
