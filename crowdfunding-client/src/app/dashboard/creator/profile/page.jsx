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
  Loader
} from "lucide-react";

export default function CreatorProfile() {
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
    role: ""
  });
  const [imagePreview, setImagePreview] = useState(null);

  const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || "",
        email: session.user.email || "",
        image: session.user.image || "",
        role: session.user.role || "creator"
      });
      if (session.user.image) {
        setImagePreview(session.user.image);
      }
    }
  }, [session]);

  const handleImageUpload = async (file) => {
    if (!file) return;

    setLoading(true);
    try {
      // Try to upload to ImgBB
      const formDataImg = new FormData();
      formDataImg.append("image", file);

      const response = await fetch("https://api.imgbb.com/1/upload?key=YOUR_IMGBB_API_KEY", {
        method: "POST",
        body: formDataImg
      });

      const data = await response.json();
      
      if (data.success) {
        setFormData(prev => ({ ...prev, image: data.data.url }));
        setImagePreview(data.data.url);
        setMessage("Image uploaded successfully!");
        setMessageType("success");
        setTimeout(() => setMessage(""), 3000);
      } else {
        // Fallback: use local preview
        const localUrl = URL.createObjectURL(file);
        setImagePreview(localUrl);
        setFormData(prev => ({ ...prev, image: localUrl }));
      }
    } catch (error) {
      console.error("Image upload error:", error);
      // Fallback: use local preview
      const localUrl = URL.createObjectURL(file);
      setImagePreview(localUrl);
      setFormData(prev => ({ ...prev, image: localUrl }));
    } finally {
      setLoading(false);
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
        
        // Refetch session to update the UI
        await refetch();
        
        // Update local state with new data
        if (data.user) {
          setFormData({
            ...formData,
            name: data.user.name,
            image: data.user.image || formData.image
          });
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

  return (
    <div>
      <h2 className="text-xl font-bold text-[#F3EFE4] mb-6" style={{ fontFamily: "'Fraunces', serif" }}>
        My Profile
      </h2>

      {message && (
        <div className={`p-4 rounded-lg mb-6 flex items-center gap-3 ${
          messageType === "success" 
            ? "bg-[#4FAE7C]/20 border border-[#4FAE7C] text-[#4FAE7C]" 
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
                    onError={() => {
                      // If image fails to load, show default avatar
                      setImagePreview(null);
                    }}
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
            {loading && (
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

            {/* Creator Specific Stats */}
            <div className="border-t border-white/5 pt-4 mt-4">
              <h4 className="text-sm font-semibold text-[#F3EFE4] mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Creator Statistics
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#1B1F2A] rounded-sm p-3">
                  <p className="text-[#9AA1AE] text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Total Campaigns
                  </p>
                  <p className="text-[#F3EFE4] text-lg font-bold" style={{ fontFamily: "'Fraunces', serif" }}>
                    0
                  </p>
                </div>
                <div className="bg-[#1B1F2A] rounded-sm p-3">
                  <p className="text-[#9AA1AE] text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Total Raised
                  </p>
                  <p className="text-[#D8A13B] text-lg font-bold" style={{ fontFamily: "'Fraunces', serif" }}>
                    $0
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={saving || loading}
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