"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";

const CATEGORY_EMOJIS = {
  "Technology": "💻",
  "Tech": "💻",
  "Education": "📚",
  "Environment": "🌱",
  "Health": "🏥",
  "Arts": "🎨",
  "Art": "🎨",
  "Community": "🤝",
  "Film": "🎬",
  "Music": "🎵",
  "Product": "🛠️",
  "Cause": "❤️",
  "Other": "📌"
};

const CATEGORY_COLORS = {
  "Technology": "border-blue-500/30 hover:border-blue-500",
  "Education": "border-green-500/30 hover:border-green-500",
  "Environment": "border-emerald-500/30 hover:border-emerald-500",
  "Health": "border-red-500/30 hover:border-red-500",
  "Arts": "border-purple-500/30 hover:border-purple-500",
  "Community": "border-orange-500/30 hover:border-orange-500",
  "Film": "border-pink-500/30 hover:border-pink-500",
  "Music": "border-indigo-500/30 hover:border-indigo-500",
  "Product": "border-cyan-500/30 hover:border-cyan-500",
  "Cause": "border-rose-500/30 hover:border-rose-500",
  "Other": "border-gray-500/30 hover:border-gray-500"
};

export default function ExploreByCategory() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

  useEffect(() => {
    fetchCategoryData();
  }, []);

  const fetchCategoryData = async () => {
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
        const campaigns = data.campaigns || [];
        
        // Count campaigns by category
        const categoryCount = {};
        campaigns.forEach(campaign => {
          const cat = campaign.category || 'Other';
          categoryCount[cat] = (categoryCount[cat] || 0) + 1;
        });

        // Convert to array and sort by count descending
        const categoryArray = Object.keys(categoryCount).map(name => ({
          name: name,
          count: categoryCount[name],
          emoji: CATEGORY_EMOJIS[name] || '📌',
          color: CATEGORY_COLORS[name] || 'border-gray-500/30 hover:border-gray-500'
        }));

        // Sort by count descending
        categoryArray.sort((a, b) => b.count - a.count);

        setCategories(categoryArray);
      } else {
        setError(data.message || 'Failed to load categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <section ref={ref} className="bg-[#1B1F2A] px-6 md:px-10 py-20">
        <div className="max-w-6xl mx-auto">
          <p className="text-[#D8A13B] text-xs tracking-[0.2em] mb-3" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            BROWSE
          </p>
          <h2 className="text-3xl md:text-4xl text-[#F3EFE4] mb-12" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>
            Explore by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-[#14171F] border border-white/5 rounded-md py-8 px-4 animate-pulse">
                <div className="w-12 h-12 bg-[#2A2F3A] rounded-full mx-auto mb-3"></div>
                <div className="h-4 bg-[#2A2F3A] rounded w-16 mx-auto mb-2"></div>
                <div className="h-3 bg-[#2A2F3A] rounded w-20 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section ref={ref} className="bg-[#1B1F2A] px-6 md:px-10 py-20">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-[#E88A7E]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {error}
          </p>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return (
      <section ref={ref} className="bg-[#1B1F2A] px-6 md:px-10 py-20">
        <div className="max-w-6xl mx-auto">
          <p className="text-[#D8A13B] text-xs tracking-[0.2em] mb-3" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            BROWSE
          </p>
          <h2 className="text-3xl md:text-4xl text-[#F3EFE4] mb-12" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>
            Explore by Category
          </h2>
          <div className="text-center py-12 bg-[#14171F] rounded-md border border-white/5">
            <p className="text-[#9AA1AE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              No categories available yet.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="bg-[#1B1F2A] px-6 md:px-10 py-20">
      <div className="max-w-6xl mx-auto">
        <p
          className="text-[#D8A13B] text-xs tracking-[0.2em] mb-3"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          BROWSE
        </p>
        <h2
          className="text-3xl md:text-4xl text-[#F3EFE4] mb-12"
          style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
        >
          Explore by Category
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.07 }}
            >
              <Link
                href={`/campaigns?category=${encodeURIComponent(cat.name)}`}
                className={`group flex flex-col items-center justify-center text-center bg-[#14171F] border ${cat.color} rounded-md py-8 px-4 transition-all hover:bg-[#D8A13B]/5`}
              >
                <span className="text-3xl mb-3 group-hover:scale-110 transition-transform">
                  {cat.emoji}
                </span>
                <span
                  className="text-[#F3EFE4] text-sm mb-1 group-hover:text-[#D8A13B] transition-colors"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500 }}
                >
                  {cat.name}
                </span>
                <span
                  className="text-[#9AA1AE] text-xs"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  {cat.count} campaign{cat.count !== 1 ? 's' : ''}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}