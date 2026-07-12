"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const STEPS = [
  {
    n: "01",
    title: "Discover a campaign",
    text: "Browse live projects, causes, and products by category, or search for something specific you want to back.",
  },
  {
    n: "02",
    title: "Contribute credits",
    text: "Pledge any amount of platform credits toward a campaign's goal. Your contribution is added to the campaign instantly.",
  },
  {
    n: "03",
    title: "Track the progress",
    text: "Watch the funding bar move, get updates from the creator, and see the campaign either hit its goal or keep climbing.",
  },
  {
    n: "04",
    title: "Creator withdraws, once approved",
    text: "When a campaign is funded, the platform reviews and approves the withdrawal before funds reach the creator.",
  },
];

export default function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="bg-[#14171F] px-6 md:px-10 py-20">
      <div className="max-w-5xl mx-auto">
        <p
          className="text-[#D8A13B] text-xs tracking-[0.2em] mb-3"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          THE PROCESS
        </p>
        <h2
          className="text-3xl md:text-4xl text-[#F3EFE4] mb-14"
          style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
        >
          How It Works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-12">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="flex gap-5"
            >
              <span
                className="text-[#D8A13B]/70 text-3xl leading-none shrink-0"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                {step.n}
              </span>
              <div>
                <h3
                  className="text-[#F3EFE4] text-lg mb-2"
                  style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-[#9AA1AE] text-sm leading-relaxed"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {step.text}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}