// client/src/components/NotificationBell.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, X, CheckCircle, AlertCircle, Info, AlertTriangle, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch(`${SERVER_URL}/api/notifications/unread-count`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUnreadCount(data.count);
        }
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch(`${SERVER_URL}/api/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNotifications(data.notifications || []);
          setUnreadCount(0);
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDropdown = () => {
    if (!isOpen) {
      fetchNotifications();
    }
    setIsOpen(!isOpen);
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'success': return <CheckCircle size={16} className="text-[#4FAE7C]" />;
      case 'error': return <AlertCircle size={16} className="text-[#E88A7E]" />;
      case 'warning': return <AlertTriangle size={16} className="text-[#D8A13B]" />;
      default: return <Info size={16} className="text-[#4A90D9]" />;
    }
  };

  const getTimeAgo = (date) => {
    const diff = new Date() - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  // ★★★ Fix action route - convert /dashboard/creator/dashboard to /dashboard/creator ★★★
  const getFixedActionRoute = (route) => {
    if (!route) return null;
    // যদি route /dashboard/creator/dashboard হয়, তাহলে /dashboard/creator এ পরিবর্তন করুন
    if (route === '/dashboard/creator/dashboard') {
      return '/dashboard/creator';
    }
    return route;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={toggleDropdown}
        className="relative text-[#9AA1AE] hover:text-[#F3EFE4] transition-colors p-1"
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#E88A7E] text-white text-xs rounded-full flex items-center justify-center font-medium animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#14171F] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 max-h-[500px] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <h3 className="text-[#F3EFE4] font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Notifications
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#9AA1AE] hover:text-[#F3EFE4] transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-[#D8A13B] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell size={32} className="text-[#9AA1AE] mx-auto mb-2 opacity-30" />
                <p className="text-[#9AA1AE] text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  No notifications yet
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {notifications.map((notification) => {
                  const fixedRoute = getFixedActionRoute(notification.actionRoute);
                  return (
                    <div
                      key={notification._id}
                      className={`px-4 py-3 hover:bg-white/5 transition-colors ${
                        !notification.read ? 'bg-[#D8A13B]/5' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[#F3EFE4] text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[#9AA1AE] text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                              {getTimeAgo(notification.time)}
                            </span>
                            {fixedRoute && (
                              <Link
                                href={fixedRoute}
                                onClick={() => setIsOpen(false)}
                                className="text-[#D8A13B] text-xs hover:underline flex items-center gap-1"
                                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                              >
                                View <ExternalLink size={12} />
                              </Link>
                            )}
                          </div>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-[#D8A13B] flex-shrink-0 mt-1"></div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-white/5 bg-[#1B1F2A]">
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push('/notifications');
                }}
                className="w-full text-center text-[#9AA1AE] text-sm hover:text-[#F3EFE4] transition-colors"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                View All Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}