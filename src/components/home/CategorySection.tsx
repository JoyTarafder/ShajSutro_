"use client";

import { getApiBase } from "@/lib/apiBase";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  productCount: number;
}

export default function CategorySection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${getApiBase()}/api/categories`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setCategories(json.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-24 sm:py-28">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-7">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="rounded-[2rem] aspect-[3/4] bg-charcoal-50 border border-charcoal-100/50 animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) return null;

  // Visual helper to create an asymmetric, alternating magazine layout
  const getGridClasses = (index: number) => {
    const isWide = index === 0 || index === 3 || index === 6;
    if (isWide) {
      return "col-span-2 lg:col-span-2 aspect-[16/10] lg:aspect-auto lg:h-[450px]";
    }
    return "col-span-1 aspect-[3/4] lg:h-[450px]";
  };

  return (
    <section className="py-12 sm:py-16 bg-white relative">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-end justify-between mb-8 sm:mb-10">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-accent-600 mb-2 block">
              Gallery Showcase
            </span>
            <h2 className="section-title">Product Gallery</h2>
            <p className="section-subtitle sm:mt-2">
              Explore our high-fashion curated collections & lookbook gallery
            </p>
          </div>
          <Link
            href="/shop"
            className="hidden sm:flex items-center gap-2 text-sm font-semibold text-charcoal-500 hover:text-charcoal-950 transition-colors duration-300 group relative py-1"
          >
            <span>View all</span>
            <svg
              className="w-4 h-4 transition-transform duration-300 ease-premium group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M9 5l7 7-7 7"
              />
            </svg>
            <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-charcoal-950 transition-all duration-300 ease-premium group-hover:w-full" />
          </Link>
        </div>

        {/* High-fashion asymmetric grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-7 auto-rows-max">
          {categories.map((category, index) => {
            const gridClass = getGridClasses(index);
            const isShoesOrKids =
              category.slug === "kids" ||
              category.name.toLowerCase().includes("kid") ||
              category.image?.includes("1542291026");

            const categoryImage = isShoesOrKids
              ? "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=800"
              : category.image;

            return (
              <Link
                key={category._id}
                href={`/shop?category=${category.slug}`}
                className={`group relative overflow-hidden rounded-[2.2rem] bg-warm-50 shadow-soft border border-charcoal-100/40 transition-all duration-500 hover:shadow-soft-lg ${gridClass}`}
              >
                {categoryImage ? (
                  <Image
                    src={categoryImage}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-[1200ms] ease-premium group-hover:scale-[1.06]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-charcoal-100 to-warm-100" />
                )}
                {/* Beautiful deep gradient shade layer */}
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/70 via-charcoal-950/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />

                {/* Floating Glassmorphism Content Card */}
                <div className="absolute bottom-5 left-5 right-5 p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-soft flex flex-col justify-between transition-all duration-500 group-hover:bg-white/15">
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight leading-tight">
                      {category.name}
                    </h3>
                    <p className="text-xs text-white/70 mt-1 font-light tracking-wide uppercase">
                      {category.productCount} Items
                    </p>
                  </div>

                  {/* Shop now label reveals on hover */}
                  <div className="flex items-center gap-1.5 mt-4 text-white text-xs font-semibold opacity-0 h-0 group-hover:opacity-100 group-hover:h-auto transition-all duration-500 ease-premium transform translate-y-2 group-hover:translate-y-0">
                    <span>Shop now</span>
                    <svg
                      className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>

                {/* Luxurious minimalist numbering badge */}
                <div className="absolute top-5 right-5 w-8.5 h-8.5 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-105">
                  <span className="text-[10px] font-mono font-bold text-white tracking-wider">
                    0{index + 1}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
