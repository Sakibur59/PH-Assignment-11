// client/src/app/dashboard/supporter/campaigns/[id]/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

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

  const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

  useEffect(() => {
    fetchCampaignDetails();
  }, [campaignId]);

  const fetchCampaignDetails = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${SERVER_URL}/api/campaigns/${campaignId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch campaign');
      }

      const data = await response.json();
      
      if (data.success) {
        setCampaign(data.campaign);
      } else {
        setError("Campaign not found");
      }
    } catch (error) {
      console.error('Error fetching campaign:', error);
      setError("Failed to load campaign");
    } finally {
      setLoading(false);
    }
  };

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

      const token = localStorage.getItem('access_token');
      const response = await fetch(`${SERVER_URL}/api/campaigns/contribute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          campaignId,
          amount: contributionAmount
        })
      });

      if (!response.ok) {
        throw new Error('Failed to contribute');
      }

      const data = await response.json();
      
      if (data.success) {
        setMessage("Contribution submitted successfully! Waiting for creator approval.");
        setAmount("");
        fetchCampaignDetails();
      } else {
        setError(data.message || "Failed to contribute");
      }
    } catch (error) {
      console.error('Error contributing:', error);
      setError("Failed to contribute");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-[#F3EFE4]">Loading campaign details...</div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="text-center py-12">
        <p className="text-[#E88A7E]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          {error || "Campaign not found"}
        </p>
        <button
          onClick={() => router.back()}
          className="mt-4 bg-[#D8A13B] text-[#14171F] px-4 py-2 rounded-sm hover:bg-[#c99530] transition-colors"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Go Back
        </button>
      </div>
    );
  }

  const progress = Math.min((campaign.raised / campaign.goal) * 100, 100);
  const daysLeft = Math.ceil((new Date(campaign.deadline) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-[#9AA1AE] hover:text-[#F3EFE4] transition-colors mb-6"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        <ArrowLeft size={16} />
        Back to Campaigns
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Campaign Details */}
        <div className="lg:col-span-2">
          <div className="bg-[#14171F] border border-white/5 rounded-lg overflow-hidden">
            <div 
              className="h-64 bg-cover bg-center"
              style={{ backgroundImage: `url(${campaign.imageUrl || '/placeholder-campaign.jpg'})` }}
            />
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs text-[#D8A13B] uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {campaign.category}
                </span>
                <span className="text-xs text-[#9AA1AE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  by {campaign.creatorName}
                </span>
              </div>
              
              <h2 className="text-2xl font-bold text-[#F3EFE4] mb-3" style={{ fontFamily: "'Fraunces', serif" }}>
                {campaign.title}
              </h2>
              
              <p className="text-[#9AA1AE] mb-6 leading-relaxed" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {campaign.story}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <p className="text-[#9AA1AE] text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Raised
                  </p>
                  <p className="text-[#F3EFE4] font-bold" style={{ fontFamily: "'Fraunces', serif" }}>
                    ${campaign.raised}
                  </p>
                </div>
                <div>
                  <p className="text-[#9AA1AE] text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Goal
                  </p>
                  <p className="text-[#F3EFE4] font-bold" style={{ fontFamily: "'Fraunces', serif" }}>
                    ${campaign.goal}
                  </p>
                </div>
                <div>
                  <p className="text-[#9AA1AE] text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Supporters
                  </p>
                  <p className="text-[#F3EFE4] font-bold" style={{ fontFamily: "'Fraunces', serif" }}>
                    {campaign.contributors || 0}
                  </p>
                </div>
                <div>
                  <p className="text-[#9AA1AE] text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Days Left
                  </p>
                  <p className="text-[#F3EFE4] font-bold" style={{ fontFamily: "'Fraunces', serif" }}>
                    {daysLeft > 0 ? daysLeft : 0}
                  </p>
                </div>
              </div>

              <div className="w-full h-2 bg-[#1B1F2A] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#D8A13B] rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-xs text-[#9AA1AE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {progress.toFixed(1)}% funded
                </span>
                <span className="text-xs text-[#9AA1AE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {campaign.minContribution ? `Min: $${campaign.minContribution}` : ''}
                </span>
              </div>

              {campaign.rewardInfo && (
                <div className="mt-6 p-4 bg-[#1B1F2A] rounded-lg">
                  <p className="text-[#9AA1AE] text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    <span className="text-[#D8A13B] font-semibold">Reward: </span>
                    {campaign.rewardInfo}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contribution Form */}
        <div className="lg:col-span-1">
          <div className="bg-[#14171F] border border-white/5 rounded-lg p-6 sticky top-24">
            <h3 className="text-lg font-semibold text-[#F3EFE4] mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Make a Contribution
            </h3>

            {message && (
              <div className="bg-[#4FAE7C]/20 border border-[#4FAE7C] text-[#4FAE7C] rounded-lg p-3 mb-4 text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {message}
              </div>
            )}

            {error && (
              <div className="bg-[#E88A7E]/20 border border-[#E88A7E] text-[#E88A7E] rounded-lg p-3 mb-4 text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {error}
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
                  placeholder="Enter amount"
                  className="w-full bg-[#1B1F2A] border border-white/10 rounded-sm px-4 py-2 text-[#F3EFE4] focus:border-[#D8A13B] focus:outline-none transition-colors"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  required
                />
                {campaign.minContribution && (
                  <p className="text-xs text-[#9AA1AE] mt-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Minimum contribution: ${campaign.minContribution}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting || daysLeft <= 0}
                className="w-full bg-[#D8A13B] text-[#14171F] py-3 rounded-sm hover:bg-[#c99530] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {submitting ? 'Processing...' : daysLeft <= 0 ? 'Campaign Ended' : 'Contribute Now'}
              </button>
            </form>

            <p className="text-xs text-[#9AA1AE] mt-3 text-center" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Your contribution will be pending until approved by the creator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}