"use client";

import { useEffect, useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import { motion, useInView } from "framer-motion";
import Link from "next/link";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const SLIDES = [
  {
    id: 1,
    eyebrow: "FOR SUPPORTERS",
    title: "Put Your Credits Behind Something Real",
    subtitle:
      "Browse live campaigns, see exactly how far each one is from its goal, and contribute credits to the ideas you believe in.",
    cta: { label: "Explore Campaigns", href: "/campaigns" },
  },
  {
    id: 2,
    eyebrow: "FOR CREATORS",
    title: "Turn a Pitch Into a Pledge Drive",
    subtitle:
      "Set a goal, tell your story, and watch contributions roll in from a community ready to back projects, causes, and products.",
    cta: { label: "Start a Campaign", href: "/dashboard" },
  },
  {
    id: 3,
    eyebrow: "HOW IT WORKS",
    title: "Every Withdrawal Is Reviewed, Every Credit Counted",
    subtitle:
      "Funds only move once the platform approves them — so supporters know their credits go where they were promised.",
    cta: { label: "See the Process", href: "/campaigns" },
  },
];

const STATS = [
  { label: "credits pledged this month", value: 248392, prefix: "৳" },
  { label: "campaigns currently live", value: 1204, prefix: "" },
  { label: "of withdrawals approved", value: 87, prefix: "", suffix: "%" },
];

const PINS = [
  { emoji: "🎨", label: "Art", rotate: -6 },
  { emoji: "🛠️", label: "Product", rotate: 4 },
  { emoji: "🌱", label: "Cause", rotate: -3 },
  { emoji: "🎬", label: "Film", rotate: 7 },
];

function useCountUp(target, startWhenInView) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!startWhenInView) return;
    let frame;
    const duration = 1600;
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

function PledgeMeter() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <div
      ref={ref}
      className="relative w-full bg-[#14171F] border-t border-white/10 px-6 md:px-10 pt-10 pb-6"
    >
      {/* pinned campaign chips */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {PINS.map((pin, i) => (
          <motion.div
            key={pin.label}
            initial={{ opacity: 0, y: -10, rotate: 0 }}
            animate={inView ? { opacity: 1, y: 0, rotate: pin.rotate } : {}}
            transition={{ delay: 0.15 * i, duration: 0.5 }}
            className="bg-[#F3EFE4] text-[#14171F] rounded-md px-3 py-1.5 shadow-lg flex items-center gap-2 text-sm"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <span>{pin.emoji}</span>
            <span className="font-medium">{pin.label}</span>
          </motion.div>
        ))}
      </div>

      {/* ruler-tick meter bar */}
      <div className="relative h-5 w-full bg-white/5 rounded-sm overflow-hidden mb-6">
        <motion.div
          initial={{ width: "0%" }}
          animate={inView ? { width: "68%" } : {}}
          transition={{ duration: 1.4, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-[#D8A13B] to-[#4FAE7C]"
        />
        <div className="absolute inset-0 flex">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 border-r border-[#14171F]/40 last:border-r-0"
            />
          ))}
        </div>
      </div>

      {/* stats ticker */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {STATS.map((stat) => {
          const count = useCountUp(stat.value, inView);
          return (
            <div key={stat.label}>
              <div
                className="text-2xl md:text-3xl text-[#F3EFE4] tabular-nums"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                {stat.prefix}
                {count.toLocaleString()}
                {stat.suffix || ""}
              </div>
              <div
                className="text-xs uppercase tracking-wider text-[#9AA1AE] mt-1"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function HeroSection() {
  return (
    <section className="relative w-full bg-[#14171F]">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        autoplay={{ delay: 5500, disableOnInteraction: false }}
        pagination={{ clickable: true, el: ".hero-pagination" }}
        loop
        className="w-full"
      >
        {SLIDES.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="min-h-[62vh] flex items-center px-6 md:px-10 py-20">
              <div className="max-w-2xl">
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-[#D8A13B] text-xs md:text-sm tracking-[0.2em] mb-4"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  {slide.eyebrow}
                </motion.p>
                <motion.h1
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                  className="text-4xl md:text-6xl leading-[1.08] text-[#F3EFE4] mb-6"
                  style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
                >
                  {slide.title}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  className="text-base md:text-lg text-[#9AA1AE] mb-9 max-w-xl"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {slide.subtitle}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.3 }}
                >
                  <Link
                    href={slide.cta.href}
                    className="inline-flex items-center gap-2 bg-[#D8A13B] text-[#14171F] px-7 py-3 rounded-sm font-medium hover:bg-[#c99530] transition-colors"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {slide.cta.label}
                    <span aria-hidden>→</span>
                  </Link>
                </motion.div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="hero-pagination flex justify-center gap-2 pb-6" />

      <PledgeMeter />
    </section>
  );
}