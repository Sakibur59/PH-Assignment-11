// client/src/components/Toast.jsx
"use client";

import { useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";

export default function Toast({ message, type, onClose }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  const configs = {
    success: {
      bg: "bg-[#4FAE7C]/20",
      border: "border-[#4FAE7C]",
      text: "text-[#4FAE7C]",
      icon: CheckCircle
    },
    error: {
      bg: "bg-[#E88A7E]/20",
      border: "border-[#E88A7E]",
      text: "text-[#E88A7E]",
      icon: XCircle
    },
    warning: {
      bg: "bg-[#D8A13B]/20",
      border: "border-[#D8A13B]",
      text: "text-[#D8A13B]",
      icon: AlertCircle
    }
  };

  const config = configs[type] || configs.success;
  const Icon = config.icon;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${config.bg} ${config.border} shadow-xl max-w-md`}>
        <Icon size={20} className={config.text} />
        <span className={`text-sm ${config.text}`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          {message}
        </span>
        <button
          onClick={onClose}
          className={`${config.text} hover:opacity-70 transition-opacity`}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}