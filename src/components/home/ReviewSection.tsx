"use client";

import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight, Star, Check, ShoppingBag } from "lucide-react";

interface Review {
  id: string;
  name: string;
  location: string;
  avatarBg: string;
  rating: number;
  date: string;
  product: string;
  title: string;
  comment: string;
  verified: boolean;
}

const REVIEWS: Review[] = [
  {
    id: "1",
    name: "Tahsin Ahmed",
    location: "Dhaka",
    avatarBg: "from-violet-600 to-indigo-600",
    rating: 5,
    date: "2 days ago",
    product: "Linen Oversized Shirt",
    title: "Unmatched Fabric Quality & Stitching",
    comment:
      "The fabric feels incredibly breathable and premium. The fitting is spot on—neither too loose nor tight. ShajSutro delivers true minimalist luxury!",
    verified: true,
  },
  {
    id: "2",
    name: "Farhana Rahman",
    location: "Chittagong",
    avatarBg: "from-emerald-600 to-teal-600",
    rating: 5,
    date: "4 days ago",
    product: "Minimal Cotton Chino",
    title: "Perfect Fit & Fast Delivery",
    comment:
      "Ordered on Tuesday and received it in 48 hours! Packaging was top-notch and the quality surpassed my expectations. Will order again soon.",
    verified: true,
  },
  {
    id: "3",
    name: "Nusrat Jahan",
    location: "Dhaka",
    avatarBg: "from-rose-600 to-pink-600",
    rating: 5,
    date: "1 week ago",
    product: "Relaxed Velvet Hoodie",
    title: "Minimalist Elegance At Its Best",
    comment:
      "Soft texture and high-grade stitching. It retains its shape even after washing. Highly recommended for minimalist wardrobe lovers!",
    verified: true,
  },
  {
    id: "4",
    name: "Sabbir Hossain",
    location: "Sylhet",
    avatarBg: "from-amber-600 to-orange-600",
    rating: 5,
    date: "1 week ago",
    product: "Classic Monochrome Tee",
    title: "Exceptional Value for Money",
    comment:
      "Great color accuracy and thick premium cotton thread. ShajSutro is definitely my new go-to store for quality fashion in Bangladesh.",
    verified: true,
  },
  {
    id: "5",
    name: "Sadia Islam",
    location: "Uttara, Dhaka",
    avatarBg: "from-blue-600 to-cyan-600",
    rating: 5,
    date: "2 weeks ago",
    product: "Tailored Linen Trousers",
    title: "Superb Craftsmanship & Fit",
    comment:
      "Very comfortable for all-day wear in hot weather. The sizing guide on the website was 100% accurate. 5 stars without hesitation!",
    verified: true,
  },
  {
    id: "6",
    name: "Tanvir Hasan",
    location: "Rajshahi",
    avatarBg: "from-purple-600 to-violet-600",
    rating: 5,
    date: "3 weeks ago",
    product: "Signature Denim Jacket",
    title: "Stunning Aesthetics & Quality",
    comment:
      "The finish and subtle details give it a luxury feel. Customer service was super responsive when I inquired about delivery status.",
    verified: true,
  },
];

export default function ReviewSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [visibleCards, setVisibleCards] = useState(3);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const totalSlides = REVIEWS.length;

  // Handle window resize safely on client
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setVisibleCards(3);
      } else if (window.innerWidth >= 640) {
        setVisibleCards(2);
      } else {
        setVisibleCards(1);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto slide every 5 seconds (5000ms)
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, 5000);

    return () => clearInterval(timer);
  }, [isPaused, totalSlides]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      handleNext();
    }
    if (touchStartX.current - touchEndX.current < -50) {
      handlePrev();
    }
  };

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-white via-[#FAFAFA] to-[#F5F5F3] text-charcoal-900 relative overflow-hidden border-t border-charcoal-100">
      {/* Soft warm light ambient glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-accent-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-warm-400/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Decorative light grid backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(0,0,0,0.02)_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 z-10">
        {/* Header with Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent-100/70 border border-accent-200/60 mb-3.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-600 animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-accent-700">
                Customer Voices
              </span>
            </div>

            <h2 className="text-3xl sm:text-4.5xl font-bold tracking-tight text-charcoal-950">
              What Our Community Says
            </h2>
            <p className="text-charcoal-500 text-sm font-light mt-2 max-w-md">
              Real feedback from verified buyers across Bangladesh.
            </p>
          </div>

          {/* Carousel Navigation Arrows & Auto-Timer Status */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                aria-label="Previous Review"
                className="w-11 h-11 rounded-2xl bg-white border border-charcoal-200/80 hover:bg-charcoal-950 hover:text-white text-charcoal-800 flex items-center justify-center transition-all duration-300 active:scale-95 shadow-soft hover:shadow-soft-md"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={handleNext}
                aria-label="Next Review"
                className="w-11 h-11 rounded-2xl bg-white border border-charcoal-200/80 hover:bg-charcoal-950 hover:text-white text-charcoal-800 flex items-center justify-center transition-all duration-300 active:scale-95 shadow-soft hover:shadow-soft-md"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Container with requested spacing (-ml-[VALUE] on Content, pl-[VALUE] on Item) */}
        <div
          className="overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* CarouselContent: Negative left margin spacing (-ml-4 sm:-ml-6) */}
          <div
            className="flex transition-transform duration-700 ease-out -ml-4 sm:-ml-6"
            style={{
              transform: `translateX(-${currentIndex * (100 / visibleCards)}%)`,
            }}
          >
            {REVIEWS.map((review) => (
              /* CarouselItem: Left padding spacing (pl-4 sm:pl-6) */
              <div
                key={review.id}
                className="w-full sm:w-1/2 lg:w-1/3 flex-shrink-0 pl-4 sm:pl-6"
              >
                <div className="h-full p-7 rounded-3xl bg-white border border-charcoal-200/70 hover:border-charcoal-300 transition-all duration-500 flex flex-col justify-between group shadow-soft hover:shadow-soft-xl">
                  <div>
                    {/* Header: Star Rating & Verified Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1 text-amber-500">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 fill-amber-500 text-amber-500"
                          />
                        ))}
                      </div>

                      {review.verified && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                          <Check className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2.5} />
                          Verified Buyer
                        </span>
                      )}
                    </div>

                    {/* Review Title & Text */}
                    <h3 className="text-base font-bold text-charcoal-950 mb-2 group-hover:text-accent-600 transition-colors">
                      {review.title}
                    </h3>
                    <p className="text-charcoal-600 text-xs sm:text-sm font-light leading-relaxed mb-6">
                      &quot;{review.comment}&quot;
                    </p>
                  </div>

                  <div>
                    {/* Purchased Item Tag */}
                    <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-charcoal-50 border border-charcoal-100 text-xs font-medium text-charcoal-700">
                      <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />
                      <span>{review.product}</span>
                    </div>

                    {/* User Profile Footer */}
                    <div className="flex items-center gap-3 pt-4 border-t border-charcoal-100">
                      <div
                        className={`w-10 h-10 rounded-full bg-gradient-to-br ${review.avatarBg} text-white font-bold text-xs flex items-center justify-center shadow-md shrink-0`}
                      >
                        {review.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-charcoal-950 truncate">
                          {review.name}
                        </p>
                        <p className="text-[11px] text-charcoal-400 font-light flex items-center gap-2">
                          <span>{review.location}</span>
                          <span>•</span>
                          <span>{review.date}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Indicator Dots */}
        <div className="flex items-center justify-center gap-1 mt-10">
          {REVIEWS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className="p-2 min-w-[28px] min-h-[28px] flex items-center justify-center transition-all duration-300 focus:outline-none"
            >
              <span
                className={`h-2 rounded-full transition-all duration-300 block ${
                  currentIndex === idx
                    ? "w-8 bg-charcoal-950"
                    : "w-2 bg-charcoal-200 hover:bg-charcoal-400"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
