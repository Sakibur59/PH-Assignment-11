// client/src/app/dashboard/creator/add-campaign/page.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

export default function AddCampaign() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    story: "",
    category: "",
    goal: "",
    minContribution: "",
    deadline: "",
    rewardInfo: "",
    imageUrl: ""
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

  const categories = ["Technology", "Education", "Environment", "Health", "Arts", "Community"];

  const handleImageUpload = async (file) => {
    if (!file) return;

    setUploading(true);
    try {
      // Try to upload to ImgBB (optional)
      const formDataImg = new FormData();
      formDataImg.append("image", file);

      const response = await fetch("https://api.imgbb.com/1/upload?key=YOUR_IMGBB_API_KEY", {
        method: "POST",
        body: formDataImg
      });

      const data = await response.json();
      
      if (data.success) {
        setFormData(prev => ({ ...prev, imageUrl: data.data.url }));
        setImagePreview(URL.createObjectURL(file));
        setMessage("Image uploaded successfully!");
        setMessageType("success");
      } else {
        // Fallback: use local preview
        setFormData(prev => ({ ...prev, imageUrl: URL.createObjectURL(file) }));
        setImagePreview(URL.createObjectURL(file));
      }
    } catch (error) {
      console.error("Image upload error:", error);
      // Fallback: use local preview
      setFormData(prev => ({ ...prev, imageUrl: URL.createObjectURL(file) }));
      setImagePreview(URL.createObjectURL(file));
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setMessageType("");

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${SERVER_URL}/api/creator/campaign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage("Campaign created successfully! Waiting for admin approval.");
        setMessageType("success");
        // Reset form
        setFormData({
          title: "",
          story: "",
          category: "",
          goal: "",
          minContribution: "",
          deadline: "",
          rewardInfo: "",
          imageUrl: ""
        });
        setImagePreview(null);
        
        setTimeout(() => {
          router.push("/dashboard/creator/my-campaigns");
        }, 2000);
      } else {
        setMessage(data.message || "Failed to create campaign");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
      setMessage("Failed to create campaign");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-[#F3EFE4] mb-6" style={{ fontFamily: "'Fraunces', serif" }}>
        Add New Campaign
      </h2>

      {message && (
        <div className={`p-4 rounded-lg mb-6 ${
          messageType === "success" 
            ? "bg-[#4FAE7C]/20 border border-[#4FAE7C] text-[#4FAE7C]" 
            : "bg-[#E88A7E]/20 border border-[#E88A7E] text-[#E88A7E]"
        }`}>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[#14171F] border border-white/5 rounded-lg p-6 max-w-2xl">
        <div className="space-y-4">
          <div>
            <label className="block text-[#F3EFE4] text-sm mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Campaign Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title || ""}
              onChange={handleChange}
              className="w-full bg-[#1B1F2A] border border-white/10 rounded-sm px-4 py-2 text-[#F3EFE4] focus:border-[#D8A13B] focus:outline-none transition-colors"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              required
              placeholder="Help us build a solar-powered water pump"
            />
          </div>

          <div>
            <label className="block text-[#F3EFE4] text-sm mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Campaign Story *
            </label>
            <textarea
              rows="5"
              name="story"
              value={formData.story || ""}
              onChange={handleChange}
              className="w-full bg-[#1B1F2A] border border-white/10 rounded-sm px-4 py-2 text-[#F3EFE4] focus:border-[#D8A13B] focus:outline-none transition-colors"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              required
              placeholder="Detailed description of your campaign..."
            />
          </div>

          <div>
            <label className="block text-[#F3EFE4] text-sm mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Category *
            </label>
            <select
              name="category"
              value={formData.category || ""}
              onChange={handleChange}
              className="w-full bg-[#1B1F2A] border border-white/10 rounded-sm px-4 py-2 text-[#F3EFE4] focus:border-[#D8A13B] focus:outline-none transition-colors"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              required
            >
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[#F3EFE4] text-sm mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Funding Goal ($) *
              </label>
              <input
                type="number"
                name="goal"
                value={formData.goal || ""}
                onChange={handleChange}
                className="w-full bg-[#1B1F2A] border border-white/10 rounded-sm px-4 py-2 text-[#F3EFE4] focus:border-[#D8A13B] focus:outline-none transition-colors"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                required
                min="1"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-[#F3EFE4] text-sm mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Minimum Contribution ($) *
              </label>
              <input
                type="number"
                name="minContribution"
                value={formData.minContribution || ""}
                onChange={handleChange}
                className="w-full bg-[#1B1F2A] border border-white/10 rounded-sm px-4 py-2 text-[#F3EFE4] focus:border-[#D8A13B] focus:outline-none transition-colors"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                required
                min="1"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#F3EFE4] text-sm mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Deadline *
            </label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline || ""}
              onChange={handleChange}
              className="w-full bg-[#1B1F2A] border border-white/10 rounded-sm px-4 py-2 text-[#F3EFE4] focus:border-[#D8A13B] focus:outline-none transition-colors"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              required
            />
          </div>

          <div>
            <label className="block text-[#F3EFE4] text-sm mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Reward Info
            </label>
            <input
              type="text"
              name="rewardInfo"
              value={formData.rewardInfo || ""}
              onChange={handleChange}
              className="w-full bg-[#1B1F2A] border border-white/10 rounded-sm px-4 py-2 text-[#F3EFE4] focus:border-[#D8A13B] focus:outline-none transition-colors"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              placeholder="What supporters will receive"
            />
          </div>

          <div>
            <label className="block text-[#F3EFE4] text-sm mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Campaign Image
            </label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      handleImageUpload(file);
                    }
                  }}
                  className="w-full bg-[#1B1F2A] border border-white/10 rounded-sm px-4 py-2 text-[#9AA1AE] focus:border-[#D8A13B] focus:outline-none transition-colors"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                />
              </div>
              {uploading && <span className="text-[#D8A13B]">Uploading...</span>}
            </div>
            {imagePreview && (
              <div className="mt-2 relative inline-block">
                <img src={imagePreview} alt="Preview" className="h-32 w-auto rounded-sm object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setFormData(prev => ({ ...prev, imageUrl: "" }));
                  }}
                  className="absolute -top-2 -right-2 bg-[#E88A7E] rounded-full p-1 hover:bg-[#d47a6e] transition-colors"
                >
                  <X size={14} className="text-white" />
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || uploading}
            className="w-full bg-[#D8A13B] text-[#14171F] py-3 rounded-sm hover:bg-[#c99530] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {loading ? 'Creating Campaign...' : 'Add Campaign'}
          </button>
        </div>
      </form>
    </div>
  );
}