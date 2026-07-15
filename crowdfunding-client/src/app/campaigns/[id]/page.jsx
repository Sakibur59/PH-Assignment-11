// client/src/app/campaigns/[id]/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Heart,
  Share2,
  CheckCircle,
  AlertCircle,
  Loader,
  Award,
  User,
  Copy,
} from "lucide-react";
import Toast from "@/components/Toast";

export default function CampaignDetails() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id;

  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [userCredits, setUserCredits] = useState(0);
  const [contributions, setContributions] = useState([]);
  
  // Toast state
  const [toast, setToast] = useState({
    message: "",
    type: "success",
    visible: false,
  });

  const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

  useEffect(() => {
    fetchCampaignDetails();
    fetchUserCredits();
  }, [campaignId]);

  // Toast functions
  const showToast = (message, type = "success") => {
    setToast({ message, type, visible: true });
  };

  const hideToast = () => {
    setToast({ ...toast, visible: false });
  };

  // Fetch campaign details
  const fetchCampaignDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`${SERVER_URL}/api/campaigns/${campaignId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch campaign");
      }

      const data = await response.json();

      if (data.success) {
        setCampaign(data.campaign);
        fetchCampaignContributions(campaignId);
      } else {
        setError(data.message || "Campaign not found");
        showToast(data.message || "Campaign not found", "error");
      }
    } catch (error) {
      console.error("Error fetching campaign:", error);
      setError("Failed to load campaign details");
      showToast("Failed to load campaign details", "error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch contributions
  const fetchCampaignContributions = async (id) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${SERVER_URL}/api/campaigns/${id}/contributions`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setContributions(data.contributions || []);
        }
      }
    } catch (error) {
      console.error("Error fetching contributions:", error);
    }
  };

  // Fetch user credits
  const fetchUserCredits = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${SERVER_URL}/api/user/credits`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUserCredits(data.credits || 0);
        }
      }
    } catch (error) {
      console.error("Error fetching credits:", error);
    }
  };

  // Handle share
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("🔗 Campaign link copied to clipboard!", "share");
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        showToast("🔗 Campaign link copied to clipboard!", "share");
      } catch (err) {
        showToast("Failed to copy link. Please try again.", "error");
      }
      document.body.removeChild(textArea);
    }
  };

  // Handle contribute
  const handleContribute = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    setError("");

    try {
      const contributionAmount = parseFloat(amount);
      if (!contributionAmount || contributionAmount <= 0) {
        setError("Please enter a valid amount");
        setSubmitting(false);
        return;
      }

      if (contributionAmount > userCredits) {
        setError(`Insufficient credits. You have ${userCredits} credits.`);
        setSubmitting(false);
        return;
      }

      const token = localStorage.getItem("access_token");
      const response = await fetch(`${SERVER_URL}/api/campaigns/contribute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          campaignId,
          amount: contributionAmount,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("🎉 Contribution submitted successfully! Waiting for creator approval.");
        showToast("🎉 Contribution submitted successfully!", "success");
        setAmount("");
        fetchCampaignDetails();
        fetchUserCredits();
        fetchCampaignContributions(campaignId);
      } else {
        setError(data.message || "Failed to contribute");
        showToast(data.message || "Failed to contribute", "error");
      }
    } catch (error) {
      console.error("Error contributing:", error);
      setError("Failed to contribute. Please try again.");
      showToast("Failed to contribute. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper functions
  const calculateProgress = (raised, goal) => {
    if (!raised || !goal) return 0;
    return Math.min((raised / goal) * 100, 100);
  };

  const formatDate = (date) => {
    if (!date) return "No deadline";
    const d = new Date(date);
    const daysLeft = Math.ceil((d - new Date()) / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) return "Ended";
    if (daysLeft === 0) return "Today";
    if (daysLeft === 1) return "1 day left";
    return `${daysLeft} days left`;
  };

  const getCategoryColor = (category) => {
    const colors = {
      Technology: "bg-blue-500/10 text-blue-600 border-blue-200",
      Education: "bg-green-500/10 text-green-600 border-green-200",
      Environment: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
      Health: "bg-red-500/10 text-red-600 border-red-200",
      Arts: "bg-purple-500/10 text-purple-600 border-purple-200",
      Community: "bg-orange-500/10 text-orange-600 border-orange-200",
    };
    return colors[category] || "bg-gray-500/10 text-gray-600 border-gray-200";
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#D8A13B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#9AA1AE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Loading campaign details...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !campaign) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle size={48} className="text-[#E88A7E] mx-auto mb-4" />
          <p className="text-[#E88A7E] text-lg" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {error || "Campaign not found"}
          </p>
          <button
            onClick={() => router.back()}
            className="mt-4 bg-[#D8A13B] text-[#14171F] px-6 py-2 rounded-lg hover:bg-[#c99530] transition-colors"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const progress = calculateProgress(campaign.raised, campaign.goal);
  const daysLeft = formatDate(campaign.deadline);
  const isEnded = daysLeft === "Ended";

  return (
    <div className="min-h-[calc(100vh-200px)] bg-[#0B0D14] py-8">
      {/* Toast Notification */}
      {toast.visible && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#9AA1AE] hover:text-[#F3EFE4] transition-colors mb-6 group"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to Campaigns
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Campaign Details - Left */}
          <div className="lg:col-span-2">
            {/* Image */}
            <div className="relative h-80 rounded-xl overflow-hidden bg-[#14171F] border border-white/5">
              <img
                src={campaign.imageUrl || "https://picsum.photos/seed/" + campaign._id + "/800/400"}
                alt={campaign.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "https://picsum.photos/seed/" + campaign._id + "/800/400";
                }}
              />
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(campaign.category)}`}>
                  {campaign.category}
                </span>
              </div>
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  isEnded
                    ? "bg-[#E88A7E]/20 text-[#E88A7E] border border-[#E88A7E]"
                    : "bg-[#4FAE7C]/20 text-[#4FAE7C] border border-[#4FAE7C]"
                }`}>
                  {isEnded ? "Ended" : daysLeft}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="mt-6 bg-[#14171F] border border-white/5 rounded-xl p-6">
              <h1 className="text-3xl font-bold text-[#F3EFE4]" style={{ fontFamily: "'Fraunces', serif" }}>
                {campaign.title}
              </h1>

              <div className="flex items-center gap-3 mt-2">
                <User size={16} className="text-[#9AA1AE]" />
                <p className="text-[#9AA1AE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  by {campaign.creatorName}
                </p>
              </div>

              <div className="mt-6">
                <p className="text-[#9AA1AE] leading-relaxed" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {campaign.story}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/5">
                <div>
                  <p className="text-[#9AA1AE] text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Raised
                  </p>
                  <p className="text-2xl font-bold text-[#F3EFE4]" style={{ fontFamily: "'Fraunces', serif" }}>
                    ${campaign.raised || 0}
                  </p>
                </div>
                <div>
                  <p className="text-[#9AA1AE] text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Goal
                  </p>
                  <p className="text-2xl font-bold text-[#F3EFE4]" style={{ fontFamily: "'Fraunces', serif" }}>
                    ${campaign.goal}
                  </p>
                </div>
                <div>
                  <p className="text-[#9AA1AE] text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Supporters
                  </p>
                  <p className="text-2xl font-bold text-[#F3EFE4]" style={{ fontFamily: "'Fraunces', serif" }}>
                    {campaign.contributors || 0}
                  </p>
                </div>
              </div>

              {/* Progress */}
              <div className="mt-6">
                <div className="w-full bg-[#1B1F2A] rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#D8A13B] to-[#F3EFE4] h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-sm">
                  <span className="text-[#D8A13B]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {progress.toFixed(1)}% funded
                  </span>
                  <span className="text-[#9AA1AE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {campaign.minContribution ? `Min: $${campaign.minContribution}` : ""}
                  </span>
                </div>
              </div>

              {/* Reward Info */}
              {campaign.rewardInfo && (
                <div className="mt-6 p-4 bg-[#1B1F2A] rounded-lg border border-white/5">
                  <div className="flex items-center gap-2">
                    <Award size={18} className="text-[#D8A13B]" />
                    <h4 className="text-[#F3EFE4] font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      Reward
                    </h4>
                  </div>
                  <p className="text-[#9AA1AE] mt-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {campaign.rewardInfo}
                  </p>
                </div>
              )}
            </div>

            {/* Recent Contributors */}
            {contributions.length > 0 && (
              <div className="mt-6 bg-[#14171F] border border-white/5 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-[#F3EFE4] mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Recent Supporters
                </h3>
                <div className="space-y-3">
                  {contributions.slice(0, 5).map((contrib) => (
                    <div key={contrib._id} className="flex items-center justify-between p-3 bg-[#1B1F2A] rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#D8A13B]/20 flex items-center justify-center">
                          <span className="text-[#D8A13B] font-semibold text-sm">
                            {contrib.supporterName?.charAt(0) || "U"}
                          </span>
                        </div>
                        <div>
                          <p className="text-[#F3EFE4] text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                            {contrib.supporterName}
                          </p>
                          <p className="text-[#9AA1AE] text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                            {new Date(contrib.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div>
                        <span className="text-[#D8A13B] font-semibold" style={{ fontFamily: "'Fraunces', serif" }}>
                          ${contrib.amount}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Right */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              {/* Contribution Form */}
              <div className="bg-[#14171F] border border-white/5 rounded-xl p-6">
                <h3 className="text-xl font-bold text-[#F3EFE4] mb-2" style={{ fontFamily: "'Fraunces', serif" }}>
                  Support This Campaign
                </h3>
                <p className="text-[#9AA1AE] text-sm mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Your contribution helps bring this project to life
                </p>

                {/* User Credits */}
                <div className="bg-[#1B1F2A] rounded-lg p-3 mb-4 flex items-center justify-between">
                  <span className="text-[#9AA1AE] text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Your Balance
                  </span>
                  <span className="text-[#F3EFE4] font-semibold" style={{ fontFamily: "'Fraunces', serif" }}>
                    {userCredits} credits
                  </span>
                </div>

                {message && (
                  <div className="bg-[#4FAE7C]/20 border border-[#4FAE7C] text-[#4FAE7C] rounded-lg p-3 mb-4 text-sm flex items-start gap-2">
                    <CheckCircle size={18} className="flex-shrink-0 mt-0.5" />
                    <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{message}</span>
                  </div>
                )}

                {error && (
                  <div className="bg-[#E88A7E]/20 border border-[#E88A7E] text-[#E88A7E] rounded-lg p-3 mb-4 text-sm flex items-start gap-2">
                    <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                    <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{error}</span>
                  </div>
                )}

                <form onSubmit={handleContribute}>
                  <div className="mb-4">
                    <label className="block text-[#F3EFE4] text-sm mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      Contribution Amount ($)
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min={campaign.minContribution || 1}
                      step="0.01"
                      placeholder={`Min: $${campaign.minContribution || 1}`}
                      className="w-full bg-[#1B1F2A] border border-white/10 rounded-lg px-4 py-3 text-[#F3EFE4] focus:border-[#D8A13B] focus:outline-none transition-colors"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      required
                      disabled={isEnded}
                    />
                    {campaign.minContribution && (
                      <p className="text-xs text-[#9AA1AE] mt-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        Minimum contribution: ${campaign.minContribution}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || isEnded}
                    className="w-full bg-[#D8A13B] text-[#14171F] py-3 rounded-lg hover:bg-[#c99530] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {submitting ? (
                      <>
                        <Loader size={18} className="animate-spin" />
                        Processing...
                      </>
                    ) : isEnded ? (
                      "Campaign Ended"
                    ) : (
                      <>
                        <Heart size={18} />
                        Contribute Now
                      </>
                    )}
                  </button>
                </form>

                <p className="text-xs text-[#9AA1AE] mt-3 text-center" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Your contribution will be pending until approved by the creator.
                </p>
              </div>

              {/* Share */}
              <div className="mt-4 bg-[#14171F] border border-white/5 rounded-xl p-4">
                <button
                  onClick={handleShare}
                  className="w-full flex items-center justify-center gap-2 text-[#9AA1AE] hover:text-[#4A90D9] transition-colors group py-2"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  <Share2 size={18} className="group-hover:scale-110 transition-transform" />
                  <span>Share this campaign</span>
                  <Copy size={14} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}