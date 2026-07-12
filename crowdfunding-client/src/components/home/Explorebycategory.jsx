"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";

const CATEGORIES = [
  { name: "Art", emoji: "🎨", count: 214 },
  { name: "Product", emoji: "🛠️", count: 341 },
  { name: "Cause", emoji: "🌱", count: 189 },
  { name: "Film", emoji: "🎬", count: 97 },
  { name: "Tech", emoji: "💻", count: 256 },
  { name: "Music", emoji: "🎵", count: 132 },
];

export default function ExploreByCategory() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

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
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.07 }}
            >
              <Link
                href={`/campaigns?category=${cat.name.toLowerCase()}`}
                className="group flex flex-col items-center justify-center text-center bg-[#14171F] border border-white/5 hover:border-[#D8A13B]/40 rounded-md py-8 px-4 transition-colors"
              >
                <span className="text-3xl mb-3">{cat.emoji}</span>
                <span
                  className="text-[#F3EFE4] text-sm mb-1"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500 }}
                >
                  {cat.name}
                </span>
                <span
                  className="text-[#9AA1AE] text-xs"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  {cat.count} campaigns
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}