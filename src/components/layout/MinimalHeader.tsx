import React from 'react';
import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { UserRole } from '../../types';
import { NotificationBell } from './NotificationBell';

export interface MinimalHeaderProps {
  currentRoute: string;
  role?: UserRole;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onToggleMobileMenu: () => void;
  onNavigate: (path: string) => void;
}

const getPageTitle = (route: string, role?: UserRole): string => {
  // Hospital routes
  if (route.startsWith('/hospital/requests')) return 'Emergency Requests';
  if (route.startsWith('/hospital/create-request')) return 'Create Emergency Request';
  if (route.startsWith('/hospital/tracking')) return 'Request Tracking';
  if (route.startsWith('/hospital/availability')) return 'Blood Availability Search';
  if (route.startsWith('/hospital/notifications')) return 'Notifications & Alerts';
  if (route.startsWith('/hospital/profile')) return 'Hospital Profile';
  if (route.startsWith('/hospital')) return 'Hospital Dashboard';

  // Blood Bank routes
  if (route.startsWith('/blood-bank/requests')) return 'Emergency Requests';
  if (route.startsWith('/blood-bank/inventory')) return 'Blood Inventory';
  if (route.startsWith('/blood-bank/allocations')) return 'Unit Allocations';
  if (route.startsWith('/blood-bank/expiring')) return 'Expiring Units';
  if (route.startsWith('/blood-bank/availability')) return 'Blood Availability Overview';
  if (route.startsWith('/blood-bank/notifications')) return 'Notifications & Alerts';
  if (route.startsWith('/blood-bank/profile')) return 'Blood Bank Profile';
  if (route.startsWith('/blood-bank')) return 'Blood Bank Dashboard';

  // Donor routes
  if (route.startsWith('/donor/requests')) return 'Emergency Blood Requests';
  if (route.startsWith('/donor/availability')) return 'Update Availability';
  if (route.startsWith('/donor/eligibility')) return 'Donor Eligibility Status';
  if (route.startsWith('/donor/history')) return 'Donation History';
  if (route.startsWith('/donor/notifications')) return 'Notifications & Alerts';
  if (route.startsWith('/donor/profile')) return 'Donor Profile';
  if (route.startsWith('/donor')) return 'Donor Dashboard';

  // Admin routes
  if (route.startsWith('/admin/hospitals')) return 'Hospital Management';
  if (route.startsWith('/admin/blood-banks')) return 'Blood Bank Directory';
  if (route.startsWith('/admin/donors')) return 'Donor Registry';
  if (route.startsWith('/admin/requests')) return 'All Network Requests';
  if (route.startsWith('/admin/inventory')) return 'Global Blood Inventory';
  if (route.startsWith('/admin/allocations')) return 'Network Allocations';
  if (route.startsWith('/admin/analytics')) return 'System Analytics & Scarcity';
  if (route.startsWith('/admin/stats')) return 'Network Telemetry & Stats';
  if (route.startsWith('/admin/audit')) return 'Security & Audit Logs';
  if (route.startsWith('/admin/notifications')) return 'Broadcast Alerts';
  if (route.startsWith('/admin/profile')) return 'Admin Account';
  if (route.startsWith('/admin')) return 'Admin Dashboard';

  // Shared routes
  if (route === '/simulation') return 'Emergency Response Simulation';

  return 'Dashboard';
};

export const MinimalHeader: React.FC<MinimalHeaderProps> = ({
  currentRoute,
  role,
  isCollapsed,
  onToggleCollapse,
  onToggleMobileMenu,
  onNavigate
}) => {
  const pageTitle = getPageTitle(currentRoute, role);

  return (
    <header className="sticky top-0 z-30 h-14 bg-white border-b border-[#E2E8F0] px-4 sm:px-6 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Button */}
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 -ml-2 rounded-lg text-[#64748B] hover:text-[#0B1F3A] hover:bg-[#F1F5F9] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C62828]"
          aria-label="Open navigation menu"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Sidebar Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex p-1.5 rounded-lg text-[#94A3B8] hover:text-[#0B1F3A] hover:bg-[#F1F5F9] transition-colors focus:outline-none"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>

        {/* Dynamic Page Title */}
        <div className="flex items-center gap-2.5">
          <h1 className="text-base sm:text-lg font-bold text-[#0B1F3A] tracking-tight truncate">
            {pageTitle}
          </h1>
          {currentRoute.includes('requests') && (
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-[#C62828] border border-red-200">
              Live Feed
            </span>
          )}
        </div>
      </div>

      {/* Right Controls: Notification Bell Only */}
      <div className="flex items-center gap-2">
        <NotificationBell currentRole={role} onNavigate={onNavigate} />
      </div>
    </header>
  );
};
