"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Heart, MessageCircle, Share2, Bookmark } from "lucide-react";
import { useState } from "react";

export default function QuotesSection() {
  const [liked, setLiked] = useState<{ [id: number]: boolean }>({});
  const [saved, setSaved] = useState<{ [id: number]: boolean }>({});

  const quotes = [
    { id: 1, text: "The very essence of education is to help the student understand the causes of fear.", author: "J. Krishnamurti" },
    { id: 2, text: "Every seed has that capability to bloom — it’s never the seed that fails, but the environment provided to it.", author: "Studio Perennis" },
    { id: 3, text: "Thought is not the enemy of feeling; it’s the lens that gives it direction.", author: "Studio Perennis" },
    { id: 4, text: "Silence is not the absence of sound, but the ending of noise within.", author: "Studio Perennis" },
    { id: 5, text: "Freedom is not found in choice, but in understanding the chooser.", author: "J. Krishnamurti" },
  ];

  const toggleInState = (setter: any, id: string) =>

setter((prev: any) => ({ ...prev, [id]: !prev[id] }));


  const handleShare = (text: string) => {
    if (navigator.share) {
      navigator.share({ text }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(text);
      alert("Quote copied to clipboard!");
    }
  };

  return (
    <section
      className="relative w-full bg-cover bg-center text-white py-24 overflow-hidden"
      style={{ backgroundImage: "url('/myfooter.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
      <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
        <h2 className="text-4xl md:text-5xl font-semibold mb-12 tracking-wide">
          Words That Think
        </h2>
        <Swiper
          modules={[Autoplay, EffectFade, Pagination, Navigation]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          loop={true}
          autoplay={{
            delay: 6000, // 6 seconds; adjust as needed!
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          pagination={{ clickable: true }}
          navigation={true}
          className="my-8"
          speed={1500} // fade transition duration in ms; adjust for extra smooth
        >
          {quotes.map(quote => (
            <SwiperSlide key={quote.id}>
              <div
                className="max-w-2xl mx-auto group relative bg-white/5 border border-white/10 rounded-2xl
                p-8 backdrop-blur-md shadow-xl hover:bg-white/10"
                style={{ minHeight: "220px" }}
              >
                <p className="text-lg md:text-xl leading-relaxed italic text-gray-200">
                  “{quote.text}”
                </p>
                <p className="mt-4 text-sm font-medium text-gray-400">
                  — {quote.author}
                </p>
                <div className="mt-6 flex items-center justify-between text-gray-400">
                  <div className="flex items-center space-x-4">
                    <button
                   onClick={() => toggleInState(setLiked, quote.id.toString())}  

                      className="flex items-center space-x-1 hover:text-[#00ADB5] transition"
                    >
                      <Heart
                        size={20}
                        className={`transition-transform duration-300 ${liked[quote.id] ? "fill-[#00ADB5] text-[#00ADB5] scale-110" : ""}`}
                      />
                      <span className="text-sm">{liked[quote.id] ? "Liked" : "Like"}</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-[#00ADB5] transition">
                      <MessageCircle size={20} />
                      <span className="text-sm">Comment</span>
                    </button>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleShare(quote.text)}
                      className="hover:text-[#00ADB5] transition"
                    >
                      <Share2 size={20} />
                    </button>
                    <button
                    onClick={() => toggleInState(setLiked, quote.id.toString())}  

                      className="hover:text-[#00ADB5] transition"
                    >
                      <Bookmark
                        size={20}
                        className={`transition-transform duration-300 ${saved[quote.id] ? "fill-[#00ADB5] text-[#00ADB5]" : ""}`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
