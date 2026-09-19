import React, { useState, useEffect, useRef } from 'react';
import { Bell, Radio, AlertCircle, CheckCircle2 } from 'lucide-react';
import { centralStore } from '../../services/store';
import { UserRole, Notification } from '../../types';

interface NotificationBellProps {
  currentRole?: UserRole;
  onNavigate?: (path: string) => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ currentRole, onNavigate }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateNotifs = () => {
      const all = centralStore.getNotifications(currentRole);
      setNotifications(all);
    };

    updateNotifs();
    const unsubscribe = centralStore.subscribe(updateNotifs);
    return unsubscribe;
  }, [currentRole]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllRead = () => {
    notifications.forEach(n => centralStore.markNotificationAsRead(n.id));
  };

  const handleNotificationClick = (n: Notification) => {
    centralStore.markNotificationAsRead(n.id);
    if (n.link && onNavigate) {
      onNavigate(n.link);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-[#64748B] hover:text-[#0B1F3A] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
        title="Emergency Notifications"
        aria-label="Emergency Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#C62828] text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#E2E8F0] rounded-2xl shadow-xl p-4 z-50 text-[#172033] animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#C62828] animate-pulse" />
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
              <p className="text-xs text-[#64748B] text-center py-5">No notifications yet.</p>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-2.5 rounded-xl text-xs cursor-pointer transition-all border ${
                    n.isRead 
                      ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B]' 
                      : n.type === 'CRITICAL'
                      ? 'bg-[#FDECEC] border-[#C62828]/30 text-[#B71C1C]'
                      : 'bg-[#E3F2FD] border-[#1976D2]/30 text-[#0B1F3A]'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {n.type === 'CRITICAL' ? (
                      <AlertCircle className="w-4 h-4 text-[#C62828] shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#0B1F3A] truncate">{n.title}</p>
                      <p className="text-[11px] text-[#64748B] line-clamp-2 mt-0.5">{n.message}</p>
                      <span className="text-[10px] text-[#94A3B8] mt-1 block font-medium">
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
  );
};
