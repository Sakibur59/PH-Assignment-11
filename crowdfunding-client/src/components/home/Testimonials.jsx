"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

const TESTIMONIALS = [
  {
    id: 1,
    name: "Nusrat Jahan",
    role: "Backed 6 campaigns",
    photo: "https://i.pravatar.cc/150?img=47",
    quote:
      "I put credits into a rooftop farm project and actually got monthly photo updates as it grew. It didn't feel like donating into a void.",
  },
  {
    id: 2,
    name: "Rafiul Islam",
    role: "Creator, Modular Desk",
    photo: "https://i.pravatar.cc/150?img=12",
    quote:
      "Setting a goal and watching contributions come in from strangers who believed in the idea was honestly the best part of building this product.",
  },
  {
    id: 3,
    name: "Farzana Akter",
    role: "Backed 14 campaigns",
    photo: "https://i.pravatar.cc/150?img=32",
    quote:
      "The approval step before withdrawals actually matters to me. I know my credits aren't just disappearing into someone's pocket overnight.",
  },
  {
    id: 4,
    name: "Tanvir Ahmed",
    role: "Creator, Riverkeepers Documentary",
    photo: "https://i.pravatar.cc/150?img=15",
    quote:
      "We hit our goal in nine days. The progress bar on our campaign page kept our backers coming back just to watch the number climb.",
  },
  {
    id: 5,
    name: "Shirin Sultana",
    role: "Backed 3 campaigns",
    photo: "https://i.pravatar.cc/150?img=44",
    quote:
      "Simple to browse, simple to contribute. I found a ceramics studio campaign and funded it in under two minutes.",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-[#1B1F2A] px-6 md:px-10 py-20">
      <div className="max-w-5xl mx-auto">
        <p
          className="text-[#D8A13B] text-xs tracking-[0.2em] mb-3 text-center"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          FROM THE COMMUNITY
        </p>
        <h2
          className="text-3xl md:text-4xl text-[#F3EFE4] text-center mb-12"
          style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
        >
          People Who've Pledged &amp; Been Paid Out
        </h2>

        <Swiper
          modules={[Autoplay, Pagination]}
          slidesPerView={1}
          spaceBetween={24}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true, el: ".testimonial-pagination" }}
          breakpoints={{
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="pb-4"
        >
          {TESTIMONIALS.map((t) => (
            <SwiperSlide key={t.id} className="h-auto">
              <div className="bg-[#14171F] border border-white/5 rounded-md p-6 h-full flex flex-col">
                <p
                  className="text-[#F3EFE4]/90 text-sm leading-relaxed mb-6 flex-1"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  “{t.quote}”
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src={t.photo}
                    alt={t.name}
                    className="w-11 h-11 rounded-full object-cover border-2 border-[#D8A13B]/40"
                  />
                  <div>
                    <p
                      className="text-[#F3EFE4] text-sm"
                      style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500 }}
                    >
                      {t.name}
                    </p>
                    <p
                      className="text-[#9AA1AE] text-xs"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {t.role}
                    </p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="testimonial-pagination flex justify-center gap-2 mt-6" />
      </div>
    </section>
  );
}