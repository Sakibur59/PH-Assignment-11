// client/src/app/dashboard/profile/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { 
  User, 
  Mail, 
  Shield, 
  Camera, 
  Save, 
  CheckCircle,
  AlertCircle,
  Loader,
  X
} from "lucide-react";
import Toast from "@/components/Toast";

export default function ProfilePage() {
  const { data: session, isPending, refetch } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    image: "",
    role: "",
    credits: 0,
    createdAt: ""
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    totalRaised: 0,
    totalContributions: 0,
    totalSpent: 0
  });

  const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";
  const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY || "";

  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || "",
        email: session.user.email || "",
        image: session.user.image || "",
        role: session.user.role || "supporter",
        credits: session.user.credits || 0,
        createdAt: session.user.createdAt || ""
      });
      if (session.user.image) {
        setImagePreview(session.user.image);
      }
      fetchUserStats(session.user.role, session.user.id);
    }
  }, [session]);

  const fetchUserStats = async (role, userId) => {
    try {
      const token = localStorage.getItem('access_token');
      
      if (role === 'creator') {
        const response = await fetch(`${SERVER_URL}/api/creator/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        if (data.success) {
          setStats({
            totalCampaigns: data.stats.totalCampaigns || 0,
            totalRaised: data.stats.totalRaised || 0,
            totalContributions: 0,
            totalSpent: 0
          });
        }
      } else if (role === 'supporter') {
        const response = await fetch(`${SERVER_URL}/api/supporter/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        if (data.success) {
          setStats({
            totalCampaigns: 0,
            totalRaised: 0,
            totalContributions: data.stats.totalContributions || 0,
            totalSpent: data.stats.totalAmount || 0
          });
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;

    setUploading(true);
    setMessage("");
    setMessageType("");

    try {
      const formDataImg = new FormData();
      formDataImg.append("image", file);

      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST",
        body: formDataImg
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned non-JSON response");
      }

      const data = await response.json();
      
      if (data.success) {
        const imageUrl = data.data.url;
        setFormData(prev => ({ ...prev, image: imageUrl }));
        setImagePreview(imageUrl);
        setMessage("Profile image uploaded successfully!");
        setMessageType("success");
        setTimeout(() => setMessage(""), 3000);
      } else {
        const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || 'User')}&background=D8A13B&color=fff&size=128`;
        setFormData(prev => ({ ...prev, image: fallbackUrl }));
        setImagePreview(fallbackUrl);
        setMessage("Using fallback image. Please try again.");
        setMessageType("warning");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || 'User')}&background=D8A13B&color=fff&size=128`;
      setFormData(prev => ({ ...prev, image: fallbackUrl }));
      setImagePreview(fallbackUrl);
      setMessage("Image upload failed. Using fallback image.");
      setMessageType("error");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setMessageType("");

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${SERVER_URL}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          image: formData.image
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage("Profile updated successfully!");
        setMessageType("success");
        await refetch();
        
        if (data.user) {
          setFormData(prev => ({
            ...prev,
            name: data.user.name,
            image: data.user.image || prev.image
          }));
          if (data.user.image) {
            setImagePreview(data.user.image);
          }
        }
        
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(data.message || "Failed to update profile");
        setMessageType("error");
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage("Failed to update profile");
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-[#F3EFE4]">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const user = session.user;
  const role = user.role || "supporter";

  return (
    <div>
      <h2 className="text-xl font-bold text-[#F3EFE4] mb-6" style={{ fontFamily: "'Fraunces', serif" }}>
        My Profile
      </h2>

      {message && (
        <div className={`p-4 rounded-lg mb-6 flex items-center gap-3 ${
          messageType === "success" 
            ? "bg-[#4FAE7C]/20 border border-[#4FAE7C] text-[#4FAE7C]" 
            : messageType === "warning"
            ? "bg-[#D8A13B]/20 border border-[#D8A13B] text-[#D8A13B]"
            : "bg-[#E88A7E]/20 border border-[#E88A7E] text-[#E88A7E]"
        }`}>
          {messageType === "success" ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{message}</span>
        </div>
      )}

      <div className="bg-[#14171F] border border-white/5 rounded-lg p-6 max-w-2xl">
        <form onSubmit={handleSubmit}>
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-[#1B1F2A] border-2 border-white/10 overflow-hidden">
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    onError={() => setImagePreview(null)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User size={40} className="text-[#9AA1AE]" />
                  </div>
                )}
              </div>
              <label 
                htmlFor="avatar-upload" 
                className="absolute bottom-0 right-0 bg-[#D8A13B] p-2 rounded-full cursor-pointer hover:bg-[#c99530] transition-colors"
              >
                <Camera size={16} className="text-[#14171F]" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      handleImageUpload(file);
                    }
                  }}
                />
              </label>
            </div>
            {uploading && (
              <div className="mt-2 text-[#D8A13B] text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Uploading...
              </div>
            )}
            <p className="text-[#9AA1AE] text-xs mt-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Click the camera icon to change profile picture
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[#F3EFE4] text-sm mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                className="w-full bg-[#1B1F2A] border border-white/10 rounded-sm px-4 py-2 text-[#F3EFE4] focus:border-[#D8A13B] focus:outline-none transition-colors"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                required
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="block text-[#F3EFE4] text-sm mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Email Address
              </label>
              <div className="flex items-center gap-2 bg-[#1B1F2A] border border-white/10 rounded-sm px-4 py-2 text-[#9AA1AE] cursor-not-allowed">
                <Mail size={16} />
                <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {formData.email || user.email}
                </span>
              </div>
              <p className="text-xs text-[#9AA1AE] mt-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Email cannot be changed
              </p>
            </div>

            <div>
              <label className="block text-[#F3EFE4] text-sm mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Role
              </label>
              <div className="flex items-center gap-2 bg-[#1B1F2A] border border-white/10 rounded-sm px-4 py-2 text-[#D8A13B] cursor-not-allowed">
                <Shield size={16} />
                <span className="capitalize" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {formData.role || user.role}
                </span>
              </div>
              <p className="text-xs text-[#9AA1AE] mt-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Role cannot be changed
              </p>
            </div>

            <div>
              <label className="block text-[#F3EFE4] text-sm mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Available Credits
              </label>
              <div className="flex items-center gap-2 bg-[#1B1F2A] border border-white/10 rounded-sm px-4 py-2 text-[#D8A13B] cursor-not-allowed">
                <span className="text-xl font-bold" style={{ fontFamily: "'Fraunces', serif" }}>
                  {formData.credits || 0}
                </span>
                <span className="text-[#9AA1AE] text-sm">credits</span>
              </div>
            </div>

            {/* Role Specific Stats */}
            <div className="border-t border-white/5 pt-4 mt-4">
              <h4 className="text-sm font-semibold text-[#F3EFE4] mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {role === 'creator' ? 'Creator Statistics' : role === 'admin' ? 'Admin Statistics' : 'Supporter Statistics'}
              </h4>
              
              {role === 'creator' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#1B1F2A] rounded-sm p-3">
                    <p className="text-[#9AA1AE] text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      Total Campaigns
                    </p>
                    <p className="text-[#F3EFE4] text-lg font-bold" style={{ fontFamily: "'Fraunces', serif" }}>
                      {stats.totalCampaigns}
                    </p>
                  </div>
                  <div className="bg-[#1B1F2A] rounded-sm p-3">
                    <p className="text-[#9AA1AE] text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      Total Raised
                    </p>
                    <p className="text-[#D8A13B] text-lg font-bold" style={{ fontFamily: "'Fraunces', serif" }}>
                      ${stats.totalRaised}
                    </p>
                  </div>
                </div>
              )}

              {role === 'supporter' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#1B1F2A] rounded-sm p-3">
                    <p className="text-[#9AA1AE] text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      Total Contributions
                    </p>
                    <p className="text-[#F3EFE4] text-lg font-bold" style={{ fontFamily: "'Fraunces', serif" }}>
                      {stats.totalContributions}
                    </p>
                  </div>
                  <div className="bg-[#1B1F2A] rounded-sm p-3">
                    <p className="text-[#9AA1AE] text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      Total Spent
                    </p>
                    <p className="text-[#D8A13B] text-lg font-bold" style={{ fontFamily: "'Fraunces', serif" }}>
                      ${stats.totalSpent}
                    </p>
                  </div>
                </div>
              )}

              {role === 'admin' && (
                <div className="bg-[#1B1F2A] rounded-sm p-3">
                  <p className="text-[#9AA1AE] text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Admin Privileges
                  </p>
                  <p className="text-[#D8A13B] text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    🔑 Full platform access
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={saving || uploading}
              className="flex-1 bg-[#D8A13B] text-[#14171F] py-2.5 rounded-sm hover:bg-[#c99530] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {saving ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2.5 bg-[#1B1F2A] text-[#9AA1AE] rounded-sm hover:text-[#F3EFE4] transition-colors"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}