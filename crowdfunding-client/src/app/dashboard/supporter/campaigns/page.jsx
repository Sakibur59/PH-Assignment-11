// client/src/app/dashboard/supporter/campaigns/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter } from "lucide-react";

export default function ExploreCampaigns() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.log('No token found');
        setLoading(false);
        return;
      }

      const response = await fetch(`${SERVER_URL}/api/campaigns/approved`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setCampaigns(data.campaigns || []);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (campaignId) => {
    router.push(`/dashboard/supporter/campaigns/${campaignId}`);
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          campaign.creatorName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "" || campaign.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'Technology', 'Education', 'Environment', 'Health', 'Arts', 'Community'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-[#F3EFE4]">Loading campaigns...</div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-[#F3EFE4] mb-6" style={{ fontFamily: "'Fraunces', serif" }}>
        Explore Campaigns
      </h2>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA1AE]" />
          <input
            type="text"
            placeholder="Search campaigns by title or creator..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1B1F2A] border border-white/10 rounded-sm px-10 py-2 text-[#F3EFE4] focus:border-[#D8A13B] focus:outline-none transition-colors"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-[#1B1F2A] border border-white/10 rounded-sm px-4 py-2 text-[#F3EFE4] focus:border-[#D8A13B] focus:outline-none transition-colors min-w-[150px]"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {categories.map(cat => (
            <option key={cat} value={cat === 'All' ? '' : cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Campaign Grid */}
      {filteredCampaigns.length === 0 ? (
        <div className="text-center py-12 bg-[#14171F] border border-white/5 rounded-lg">
          <Search size={48} className="text-[#9AA1AE] mx-auto mb-3" />
          <p className="text-[#9AA1AE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            No campaigns found matching your criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCampaigns.map((campaign) => {
            const progress = Math.min((campaign.raised / campaign.goal) * 100, 100);
            const daysLeft = Math.ceil((new Date(campaign.deadline) - new Date()) / (1000 * 60 * 60 * 24));
            
            return (
              <div key={campaign._id} className="bg-[#14171F] border border-white/5 rounded-lg overflow-hidden hover:border-[#D8A13B]/30 transition-all">
                <div 
                  className="h-48 bg-cover bg-center relative"
                  style={{ backgroundImage: `url(${campaign.imageUrl || '/placeholder-campaign.jpg'})` }}
                >
                  {daysLeft > 0 && (
                    <div className="absolute top-3 right-3 bg-[#14171F]/90 px-3 py-1 rounded-full">
                      <span className="text-xs text-[#D8A13B]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        {daysLeft} days left
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-[#D8A13B] uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {campaign.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-[#F3EFE4] mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {campaign.title}
                  </h3>
                  <p className="text-[#9AA1AE] text-sm mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    by {campaign.creatorName}
                  </p>
                  <p className="text-[#9AA1AE] text-sm mb-3 line-clamp-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {campaign.story}
                  </p>
                  <div className="w-full h-1.5 bg-[#1B1F2A] rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full bg-[#D8A13B] rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-[#F3EFE4]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      ${campaign.raised} raised
                    </span>
                    <span className="text-[#9AA1AE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      ${campaign.goal} goal
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#9AA1AE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {campaign.contributors || 0} supporters
                    </span>
                    <button
                      onClick={() => handleViewDetails(campaign._id)}
                      className="bg-[#D8A13B] text-[#14171F] px-4 py-2 rounded-sm hover:bg-[#c99530] transition-colors text-sm font-medium"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}