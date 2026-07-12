"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";

// TODO: replace with real API call, e.g. GET /api/campaigns/top-funded
const MOCK_CAMPAIGNS = [
  {
    id: "1",
    title: "Solar Lanterns for Off-Grid Villages",
    category: "Cause",
    cover: "https://picsum.photos/seed/solar/600/400",
    raised: 184500,
    goal: 200000,
  },
  {
    id: "2",
    title: "Handmade Ceramic Studio Expansion",
    category: "Art",
    cover: "https://picsum.photos/seed/ceramics/600/400",
    raised: 92300,
    goal: 120000,
  },
  {
    id: "3",
    title: "Open-Source Prosthetic Hand v3",
    category: "Product",
    cover: "https://picsum.photos/seed/prosthetic/600/400",
    raised: 341200,
    goal: 350000,
  },
  {
    id: "4",
    title: "Neighborhood Rooftop Farm",
    category: "Cause",
    cover: "https://picsum.photos/seed/rooftop/600/400",
    raised: 76800,
    goal: 100000,
  },
  {
    id: "5",
    title: "Short Documentary: Riverkeepers",
    category: "Film",
    cover: "https://picsum.photos/seed/river/600/400",
    raised: 58900,
    goal: 80000,
  },
  {
    id: "6",
    title: "Modular Desk for Small Apartments",
    category: "Product",
    cover: "https://picsum.photos/seed/desk/600/400",
    raised: 128400,
    goal: 150000,
  },
];

function formatCredits(n) {
  return n.toLocaleString("en-US");
}

function CampaignCard({ campaign, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const percent = Math.min(
    100,
    Math.round((campaign.raised / campaign.goal) * 100)
  );

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group bg-[#1B1F2A] rounded-md overflow-hidden border border-white/5 hover:border-[#D8A13B]/40 transition-colors"
    >
      <div className="relative h-44 overflow-hidden">
        <img
          src={campaign.cover}
          alt={campaign.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <span
          className="absolute top-3 left-3 bg-[#F3EFE4] text-[#14171F] text-xs px-2 py-1 rounded-sm"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {campaign.category}
        </span>
      </div>

      <div className="p-5">
        <h3
          className="text-[#F3EFE4] text-lg mb-3 leading-snug"
          style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
        >
          {campaign.title}
        </h3>

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
            ৳{formatCredits(campaign.raised)}
          </span>
          <span className="text-[#9AA1AE]">{percent}% funded</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function TopFundedCampaigns() {
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
          {MOCK_CAMPAIGNS.map((campaign, index) => (
            <CampaignCard key={campaign.id} campaign={campaign} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}