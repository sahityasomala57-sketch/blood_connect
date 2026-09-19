import React, { useState, useEffect } from 'react';
import { 
  Droplet, 
  Bell, 
  Shield, 
  Building2, 
  HeartHandshake, 
  Activity, 
  RefreshCw, 
  Radio, 
  Sliders, 
  MapPin, 
  CheckCircle2, 
  AlertCircle,
  LogOut,
  Lock,
  ArrowUpRight,
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';
import { authService } from '../../services/auth';
import { centralStore } from '../../services/store';
import { User, Notification, SectorSessionToken } from '../../types';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const [user, setUser] = useState<User | null>(authService.getCurrentUser());
  const [sectorToken, setSectorToken] = useState<SectorSessionToken | null>(authService.getCurrentSectorToken());
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    const unsubAuth = authService.subscribe(u => setUser(u));
    const unsubToken = authService.subscribeToken(t => setSectorToken(t));

    const updateNotifs = () => {
      const all = centralStore.getNotifications(user?.role);
      setNotifications(all);
    };

    updateNotifs();
    const unsubStore = centralStore.subscribe(updateNotifs);

    return () => {
      unsubAuth();
      unsubToken();
      unsubStore();
    };
  }, [user?.role]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleResetData = () => {
    centralStore.resetToSeedData();
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 2500);
  };

  const markAllRead = () => {
    notifications.forEach(n => centralStore.markNotificationAsRead(n.id));
  };

  const handleExitSector = () => {
    const r = user?.role;
    authService.logoutSector();
    if (r === 'HOSPITAL') onNavigate('/hospital/login');
    else if (r === 'BLOOD_BANK') onNavigate('/blood-bank/login');
    else if (r === 'DONOR') onNavigate('/donor/login');
    else if (r === 'ADMIN') onNavigate('/admin/login');
    else onNavigate('/');
  };

  const isActive = (path: string) => currentView.includes(path);

  return (
    <header className="sticky top-0 z-50 bg-[#0B1F3A] text-white border-b border-[#123B63] shadow-md select-none">
      {/* Network Operational Pulse Bar (Hardware Telemetry) */}
      <div className="bg-[#071426] border-b border-[#0E2A4D] px-4 py-1.5 text-xs flex items-center justify-between text-slate-300">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-bold text-[#2E7D32]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2E7D32] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2E7D32]"></span>
            </span>
            NETWORK LIVE
          </span>
          <span className="hidden sm:inline text-[#123B63]">•</span>
          <span className="hidden sm:inline text-slate-300 text-[11px]">
            <strong className="text-white">47</strong> emergency units across cold chain
          </span>
          <span className="text-[10px] bg-[#123B63] text-blue-200 px-2 py-0.5 rounded font-mono">
            Encrypted Mesh
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetData}
            title="Reset store to initial demo seed state"
            className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white bg-[#123B63] hover:bg-[#1976D2] px-2.5 py-1 rounded border border-[#1E3A5F] transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${resetSuccess ? 'animate-spin text-[#2E7D32]' : ''}`} />
            <span className="hidden sm:inline">{resetSuccess ? 'Reset Complete!' : 'Reset Demo Seed'}</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => onNavigate('/')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#123B63] border border-[#1976D2] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <Droplet className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-white text-base sm:text-lg leading-tight">
                EVERY DROP
              </span>
              <span className="text-white font-bold text-[10px] uppercase tracking-widest bg-[#1976D2] px-2 py-0.5 rounded border border-[#1565C0]">
                DECISION
              </span>
            </div>
            <p className="text-[11px] text-slate-300 hidden sm:block">
              Smart Blood & Emergency Donor Network
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-[#08172c] p-1 rounded-xl border border-[#123B63]">
          {user ? (
            <button
              onClick={() => {
                if (user.role === 'HOSPITAL') onNavigate('/hospital/dashboard');
                else if (user.role === 'BLOOD_BANK') onNavigate('/blood-bank/dashboard');
                else if (user.role === 'DONOR') onNavigate('/donor/dashboard');
                else if (user.role === 'ADMIN') onNavigate('/admin/dashboard');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isActive('dashboard')
                  ? 'bg-[#1976D2] text-white shadow-sm' 
                  : 'text-slate-300 hover:text-white hover:bg-[#123B63]'
              }`}
            >
              Dashboard
            </button>
          ) : (
            <button
              onClick={() => onNavigate('/')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentView === '/' || currentView === '/login'
                  ? 'bg-[#1976D2] text-white shadow-sm' 
                  : 'text-slate-300 hover:text-white hover:bg-[#123B63]'
              }`}
            >
              Home
            </button>
          )}

          <button
            onClick={() => onNavigate('/simulation')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              isActive('simulation')
                ? 'bg-[#1976D2] text-white shadow-sm' 
                : 'text-slate-300 hover:text-white hover:bg-[#123B63]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-[#1976D2]" />
            Simulation
          </button>

          {/* Active Sector Workspace button */}
          {user && (
            <button
              onClick={() => {
                if (user.role === 'HOSPITAL') onNavigate('/hospital/dashboard');
                else if (user.role === 'BLOOD_BANK') onNavigate('/blood-bank/dashboard');
                else if (user.role === 'DONOR') onNavigate('/donor/dashboard');
                else if (user.role === 'ADMIN') onNavigate('/admin/dashboard');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isActive(user.role.toLowerCase().replace('_', ''))
                  ? 'bg-[#2E7D32] text-white shadow-sm'
                  : 'text-blue-100 bg-[#123B63] hover:bg-[#1976D2] border border-[#1976D2]/40'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Workspace</span>
            </button>
          )}
        </nav>

        {/* Right Controls: Notifications & Sector Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifDrawer(!showNotifDrawer)}
              className="p-2 rounded-xl bg-[#123B63] hover:bg-[#1976D2] border border-[#1E3A5F] text-slate-200 hover:text-white transition-colors relative cursor-pointer"
              title="Emergency Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C62828] text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Popover */}
            {showNotifDrawer && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#E2E8F0] rounded-2xl shadow-2xl p-4 z-50 text-[#172033]">
                <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-[#C62828]" />
                    <h3 className="text-sm font-bold text-[#0B1F3A]">Emergency Broadcasts</h3>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[11px] text-[#1976D2] hover:underline font-semibold cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="mt-3 max-h-72 overflow-y-auto space-y-2 pr-1">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-[#64748B] text-center py-4">No notifications yet.</p>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => {
                          centralStore.markNotificationAsRead(n.id);
                          if (n.link) onNavigate(n.link);
                          setShowNotifDrawer(false);
                        }}
                        className={`p-2.5 rounded-xl text-xs cursor-pointer transition-all border ${
                          n.isRead 
                            ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B]' 
                            : n.type === 'CRITICAL'
                            ? 'bg-[#FDECEC] border-[#C62828]/30 text-[#B71C1C]'
                            : 'bg-[#E3F2FD] border-[#1976D2]/30 text-[#0B1F3A]'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {n.type === 'CRITICAL' ? (
                            <AlertCircle className="w-4 h-4 text-[#C62828] shrink-0 mt-0.5" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-[#0B1F3A] truncate">{n.title}</p>
                            <p className="text-[11px] text-[#64748B] line-clamp-2 mt-0.5">{n.message}</p>
                            <span className="text-[10px] text-[#64748B] mt-1 block font-medium">
                              {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Sector Status Badge */}
          {user ? (
            <div className="flex items-center gap-2">
              <div 
                onClick={() => {
                  if (user.role === 'HOSPITAL') onNavigate('/hospital/dashboard');
                  else if (user.role === 'BLOOD_BANK') onNavigate('/blood-bank/dashboard');
                  else if (user.role === 'DONOR') onNavigate('/donor/dashboard');
                  else if (user.role === 'ADMIN') onNavigate('/admin/dashboard');
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer shadow-sm transition-all hover:scale-[1.02] bg-[#123B63] text-white ${
                  user.role === 'HOSPITAL' ? 'border-[#1976D2]' :
                  user.role === 'BLOOD_BANK' ? 'border-[#C62828]' :
                  user.role === 'DONOR' ? 'border-[#2E7D32]' : 'border-purple-400'
                }`}
                title="Open sector workspace"
              >
                {user.role === 'HOSPITAL' && <Building2 className="w-3.5 h-3.5 text-[#1976D2]" />}
                {user.role === 'BLOOD_BANK' && <Activity className="w-3.5 h-3.5 text-[#C62828]" />}
                {user.role === 'DONOR' && <HeartHandshake className="w-3.5 h-3.5 text-[#2E7D32]" />}
                {user.role === 'ADMIN' && <Shield className="w-3.5 h-3.5 text-purple-400" />}
                
                <div className="flex flex-col text-left leading-tight max-w-[110px] sm:max-w-[150px]">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-slate-300">
                    {user.role === 'HOSPITAL' ? 'Hospital' :
                     user.role === 'BLOOD_BANK' ? 'Blood Bank' :
                     user.role === 'DONOR' ? 'Donor' : 'Admin'}
                  </span>
                  <span className="truncate font-bold text-xs text-white">{user.name}</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-70 hidden sm:inline text-white" />
              </div>

              <button
                onClick={handleExitSector}
                title="Exit sector"
                className="p-2 rounded-xl bg-[#123B63] hover:bg-[#C62828] text-slate-200 hover:text-white border border-[#1E3A5F] transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onNavigate('/')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#C62828] hover:bg-[#B71C1C] border border-[#C62828]/60 shadow-sm transition-all cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-white" />
              <span>Login</span>
            </button>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-[#123B63] text-slate-200 border border-[#1E3A5F] cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#071426] border-b border-[#123B63] p-4 space-y-2">
          {!user ? (
            <button
              onClick={() => {
                onNavigate('/');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-[#FDECEC] font-bold bg-[#C62828]/20 hover:bg-[#C62828]/30 text-[#FF8A80]"
            >
              Sign In / Login
            </button>
          ) : (
            <button
              onClick={() => {
                if (user.role === 'HOSPITAL') onNavigate('/hospital/dashboard');
                else if (user.role === 'BLOOD_BANK') onNavigate('/blood-bank/dashboard');
                else if (user.role === 'DONOR') onNavigate('/donor/dashboard');
                else if (user.role === 'ADMIN') onNavigate('/admin/dashboard');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-[#123B63]"
            >
              My Dashboard
            </button>
          )}
          <button
            onClick={() => {
              onNavigate('/simulation');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-[#123B63]"
          >
            Emergency Simulation
          </button>
          <button
            onClick={() => {
              onNavigate('/simulation');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-[#123B63]"
          >
            Emergency Simulation
          </button>
        </div>
      )}
    </header>
  );
};
