// client/src/components/home/TopFundedCampaigns.jsx
"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

function formatCredits(n) {
  return n.toLocaleString("en-US");
}

function CampaignCard({ campaign, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const router = useRouter();
  
  const percent = Math.min(
    100,
    Math.round((campaign.raised / campaign.goal) * 100)
  );

  const daysLeft = Math.ceil((new Date(campaign.deadline) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group bg-[#1B1F2A] rounded-md overflow-hidden border border-white/5 hover:border-[#D8A13B]/40 transition-colors"
    >
      <div className="relative h-44 overflow-hidden cursor-pointer" onClick={() => router.push(`/campaigns/${campaign._id}`)}>
        <img
          src={campaign.imageUrl || `https://picsum.photos/seed/${campaign._id}/600/400`}
          alt={campaign.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = `https://picsum.photos/seed/${campaign._id}/600/400`;
          }}
        />
        <span
          className="absolute top-3 left-3 bg-[#F3EFE4] text-[#14171F] text-xs px-2 py-1 rounded-sm"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {campaign.category}
        </span>
        <div className="absolute top-3 right-3">
          <span className={`text-xs px-2 py-1 rounded-sm ${
            daysLeft > 0 
              ? 'bg-[#4FAE7C]/80 text-white' 
              : 'bg-[#E88A7E]/80 text-white'
          }`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {daysLeft > 0 ? `${daysLeft}d left` : 'Ended'}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3
          className="text-[#F3EFE4] text-lg mb-1 leading-snug line-clamp-1"
          style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
        >
          {campaign.title}
        </h3>
        <p className="text-[#9AA1AE] text-sm mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          by {campaign.creatorName}
        </p>

        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mb-2">
          <motion.div
            initial={{ width: "0%" }}
            animate={inView ? { width: `${percent}%` } : {}}
            transition={{ duration: 1, delay: 0.2 + index * 0.08, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-[#D8A13B] to-[#4FAE7C]"
          />
        </div>

        <div
          className="flex items-center justify-between text-sm"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          <span className="text-[#F3EFE4]">
            ${formatCredits(campaign.raised)}
          </span>
          <span className="text-[#9AA1AE]">{percent}% funded</span>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
          <span className="text-[#9AA1AE] text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {campaign.contributors || 0} supporters
          </span>
          <button
            onClick={() => router.push(`/campaigns/${campaign._id}`)}
            className="text-[#D8A13B] text-xs hover:text-[#c99530] transition-colors flex items-center gap-1"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            View Details →
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function TopFundedCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

  useEffect(() => {
    fetchTopCampaigns();
  }, []);

  const fetchTopCampaigns = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      // Get all approved campaigns
      const response = await fetch(`${SERVER_URL}/api/campaigns/approved`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch campaigns');
      }

      const data = await response.json();
      
      if (data.success) {
        // Sort by progress percentage (raised/goal) descending
        const sortedCampaigns = (data.campaigns || [])
          .filter(c => c.status === 'approved' && new Date(c.deadline) > new Date())
          .sort((a, b) => {
            const progressA = a.raised / a.goal;
            const progressB = b.raised / b.goal;
            return progressB - progressA;
          })
          .slice(0, 6); // Take top 6
        
        setCampaigns(sortedCampaigns);
      } else {
        setError(data.message || 'Failed to load campaigns');
      }
    } catch (error) {
      console.error('Error fetching top campaigns:', error);
      setError('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="bg-[#14171F] px-6 md:px-10 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <p className="text-[#D8A13B] text-xs tracking-[0.2em] mb-3" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                TOP FUNDED
              </p>
              <h2 className="text-3xl md:text-4xl text-[#F3EFE4]" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>
                Campaigns Closest to Their Goal
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-[#1B1F2A] rounded-md overflow-hidden border border-white/5 h-72 animate-pulse">
                <div className="h-44 bg-[#2A2F3A]"></div>
                <div className="p-5">
                  <div className="h-5 bg-[#2A2F3A] rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-[#2A2F3A] rounded w-1/2 mb-3"></div>
                  <div className="h-1.5 bg-[#2A2F3A] rounded w-full mb-2"></div>
                  <div className="flex justify-between">
                    <div className="h-3 bg-[#2A2F3A] rounded w-1/3"></div>
                    <div className="h-3 bg-[#2A2F3A] rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-[#14171F] px-6 md:px-10 py-20">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-[#E88A7E]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {error}
          </p>
        </div>
      </section>
    );
  }

  if (campaigns.length === 0) {
    return (
      <section className="bg-[#14171F] px-6 md:px-10 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <p className="text-[#D8A13B] text-xs tracking-[0.2em] mb-3" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                TOP FUNDED
              </p>
              <h2 className="text-3xl md:text-4xl text-[#F3EFE4]" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>
                Campaigns Closest to Their Goal
              </h2>
            </div>
          </div>
          <div className="text-center py-12 bg-[#1B1F2A] rounded-md border border-white/5">
            <p className="text-[#9AA1AE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              No active campaigns available right now.
            </p>
            <Link
              href="/campaigns"
              className="inline-block mt-4 text-[#D8A13B] hover:text-[#c99530] text-sm"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Browse all campaigns →
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#14171F] px-6 md:px-10 py-20">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <p
              className="text-[#D8A13B] text-xs tracking-[0.2em] mb-3"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              TOP FUNDED
            </p>
            <h2
              className="text-3xl md:text-4xl text-[#F3EFE4]"
              style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
            >
              Campaigns Closest to Their Goal
            </h2>
          </div>
          <Link
            href="/campaigns"
            className="text-[#D8A13B] hover:text-[#c99530] text-sm"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            View all campaigns →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign, index) => (
            <CampaignCard key={campaign._id} campaign={campaign} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}