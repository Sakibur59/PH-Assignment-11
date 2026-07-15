"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, CheckCircle, AlertCircle, Info, AlertTriangle, ExternalLink, ArrowLeft } from "lucide-react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/login');
        return;
      }

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
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'success': return <CheckCircle size={20} className="text-[#4FAE7C]" />;
      case 'error': return <AlertCircle size={20} className="text-[#E88A7E]" />;
      case 'warning': return <AlertTriangle size={20} className="text-[#D8A13B]" />;
      default: return <Info size={20} className="text-[#4A90D9]" />;
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

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#D8A13B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#9AA1AE]">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] bg-[#0B0D14] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="text-[#9AA1AE] hover:text-[#F3EFE4] transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-[#F3EFE4]" style={{ fontFamily: "'Fraunces', serif" }}>
            Notifications
          </h1>
          <span className="text-[#9AA1AE] text-sm ml-auto" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {notifications.length} notifications
          </span>
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="text-center py-12 bg-[#14171F] border border-white/5 rounded-xl">
            <Bell size={48} className="text-[#9AA1AE] mx-auto mb-3 opacity-30" />
            <p className="text-[#9AA1AE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              No notifications yet
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`bg-[#14171F] border border-white/5 rounded-xl p-4 hover:border-[#D8A13B]/30 transition-all ${
                  !notification.read ? 'border-[#D8A13B]/30 bg-[#D8A13B]/5' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-full bg-[#1B1F2A]">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#F3EFE4]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[#9AA1AE] text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        {getTimeAgo(notification.time)}
                      </span>
                      {notification.actionRoute && (
                        <Link
                          href={notification.actionRoute}
                          className="text-[#D8A13B] text-sm hover:underline flex items-center gap-1"
                          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                          View Details <ExternalLink size={14} />
                        </Link>
                      )}
                    </div>
                  </div>
                  {!notification.read && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#D8A13B] flex-shrink-0 mt-1"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}