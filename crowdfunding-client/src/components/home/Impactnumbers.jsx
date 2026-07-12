"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

const IMPACT_STATS = [
  { label: "credits raised all-time", value: 18400000, prefix: "৳" },
  { label: "campaigns successfully funded", value: 3820, prefix: "" },
  { label: "supporters contributed", value: 52100, prefix: "" },
  { label: "average approval time (hrs)", value: 36, prefix: "" },
];

function useCountUp(target, startWhenInView) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!startWhenInView) return;
    let frame;
    const duration = 1800;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [startWhenInView, target]);
  return value;
}

function StatBlock({ stat }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const count = useCountUp(stat.value, inView);

  return (
    <div ref={ref} className="text-center md:text-left">
      <div
        className="text-3xl md:text-4xl text-[#F3EFE4] tabular-nums mb-2"
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
      >
        {stat.prefix}
        {count.toLocaleString()}
      </div>
      <div
        className="text-xs md:text-sm uppercase tracking-wider text-[#9AA1AE]"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        {stat.label}
      </div>
    </div>
  );
}

export default function ImpactNumbers() {
  return (
    <section className="bg-[#14171F] px-6 md:px-10 py-20 border-y border-white/5">
      <div className="max-w-6xl mx-auto">
        <p
          className="text-[#D8A13B] text-xs tracking-[0.2em] mb-3 text-center md:text-left"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          SINCE LAUNCH
        </p>
        <h2
          className="text-3xl md:text-4xl text-[#F3EFE4] mb-14 text-center md:text-left"
          style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
        >
          Platform Impact in Numbers
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {IMPACT_STATS.map((stat) => (
            <StatBlock key={stat.label} stat={stat} />
          ))}
        </div>
      </div>
    </section>
  );
}