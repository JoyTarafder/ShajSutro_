"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Product, SortOption } from "@/types";
import ProductCard from "@/components/product/ProductCard";
import { getApiBase } from "@/lib/apiBase";
import { products as fallbackProducts } from "@/data/products";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApiProduct {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: { _id: string; name: string; slug: string } | string;
  images: string[];
  sizes: string[];
  colors: string[];
  badge?: "New" | "Sale" | "Best Seller";
  description: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  stock?: number;
  totalOrdered?: number;
  tags?: string[];
}

interface NavCategory {
  _id: string;
  name: string;
  slug: string;
  productCount: number;
}

function mapProduct(p: ApiProduct): Product {
  const catSlug =
    typeof p.category === "object" ? p.category.slug : p.category;
  return {
    id: p._id,
    name: p.name,
    price: p.price,
    originalPrice: p.originalPrice,
    category: catSlug,
    images: p.images,
    sizes: p.sizes,
    colors: p.colors,
    badge: p.badge,
    description: p.description,
    rating: p.rating,
    reviews: p.reviews,
    inStock: p.inStock,
    stock: p.stock,
    totalOrdered: p.totalOrdered,
    tags: p.tags,
  };
}

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Best Rated" },
  { value: "popular", label: "Most Popular" },
];

// ─── Page wrapper ─────────────────────────────────────────────────────────────

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-charcoal-200 border-t-charcoal-900 rounded-full animate-spin" />
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}

// ─── Main content ─────────────────────────────────────────────────────────────

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") ?? "";
  const initialBadge = searchParams.get("badge") ?? "";

  // ── Filter state ──
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory ? [initialCategory] : []
  );
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // ── Data state ──
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<NavCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Reset filters when URL category/badge changes
  useEffect(() => {
    setSelectedCategories(initialCategory ? [initialCategory] : []);
    setSelectedSizes([]);
    setPriceRange([0, 5000]);
    setSortBy("newest");
  }, [initialCategory, initialBadge]);

  // Fetch categories for the filter panel
  useEffect(() => {
    fetch(`${getApiBase()}/api/categories`)
      .then((r) => r.json())
      .then((j) => { if (j.success) setCategories(j.data); })
      .catch(() => {});
  }, []);

  // Fetch products whenever the badge URL param changes (category filtering is client-side)
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "100" });
    if (initialBadge) params.set("badge", initialBadge);

    fetch(`${getApiBase()}/api/products?${params.toString()}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success && Array.isArray(j.data) && j.data.length > 0) {
          setAllProducts((j.data as ApiProduct[]).map(mapProduct));
        } else {
          setAllProducts(fallbackProducts);
        }
      })
      .catch(() => {
        setAllProducts(fallbackProducts);
      })
      .finally(() => setLoading(false));
  }, [initialBadge]);

  // ── Client-side filtering + sorting ──
  const filteredProducts = useMemo(() => {
    let list = [...allProducts];

    if (selectedCategories.length > 0) {
      list = list.filter((p) => selectedCategories.includes(p.category));
    }

    if (selectedSizes.length > 0) {
      list = list.filter((p) => p.sizes.some((s) => selectedSizes.includes(s)));
    }

    list = list.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    switch (sortBy) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      case "popular":
        list.sort((a, b) => (b.totalOrdered ?? 0) - (a.totalOrdered ?? 0));
        break;
    }

    return list;
  }, [allProducts, selectedCategories, selectedSizes, priceRange, sortBy]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const setPriceMin = (min: number) => {
    setPriceRange(([curMin, curMax]) => {
      const nextMin = Math.max(0, Math.min(min, curMax));
      return [nextMin, curMax];
    });
  };

  const setPriceMax = (max: number) => {
    setPriceRange(([curMin, curMax]) => {
      const nextMax = Math.min(maxPrice, Math.max(max, curMin));
      return [curMin, nextMax];
    });
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedSizes([]);
    setPriceRange([0, 5000]);
    setSortBy("newest");
  };

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedSizes.length > 0 ||
    priceRange[0] > 0 ||
    priceRange[1] < 5000;

  // Derive max price from current products for the range slider
  const maxPrice = useMemo(
    () => Math.max(5000, ...allProducts.map((p) => p.price)),
    [allProducts]
  );

  const activeFiltersCount =
    selectedCategories.length +
    selectedSizes.length +
    (priceRange[0] > 0 || priceRange[1] < maxPrice ? 1 : 0);

  // ── Filter panel (shared desktop + mobile) ──
  const FiltersPanel = () => (
    <div className="space-y-7">
      {categories.length > 0 && !initialBadge && (
        <div>
          <h2 className="text-xs font-bold text-emerald-950 mb-3.5 tracking-wider uppercase">
            Categories
          </h2>
          <div className="space-y-1.5">
            {categories.map((cat) => {
              const isSelected = selectedCategories.includes(cat.slug);
              return (
                <button
                  key={cat._id}
                  type="button"
                  onClick={() => toggleCategory(cat.slug)}
                  className={`w-full flex items-center justify-between rounded-xl px-3 py-2 border transition-all duration-200 ${
                    isSelected
                      ? "border-emerald-300 bg-emerald-500/10 text-emerald-950 font-semibold"
                      : "border-transparent text-emerald-900/70 hover:border-emerald-100 hover:bg-emerald-50/30"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        isSelected
                          ? "bg-emerald-600 border-emerald-600 shadow-xs"
                          : "border-emerald-200 bg-white"
                      }`}
                      aria-hidden="true"
                    >
                      {isSelected && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                    <span className="text-xs font-medium truncate">
                      {cat.name}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    isSelected ? "bg-emerald-600/15 text-emerald-900" : "bg-emerald-100/50 text-emerald-700"
                  }`}>
                    {cat.productCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xs font-bold text-emerald-950 mb-3.5 tracking-wider uppercase">
          Price Range
        </h2>
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div>
            <label className="block text-xs text-emerald-900/60 font-medium mb-1.5">
              Min Price (৳)
            </label>
            <input
              type="number"
              min={0}
              max={priceRange[1]}
              value={priceRange[0]}
              onChange={(e) => setPriceMin(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-emerald-200/80 bg-white text-xs text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all shadow-xs"
            />
          </div>
          <div>
            <label className="block text-xs text-emerald-900/60 font-medium mb-1.5">
              Max Price (৳)
            </label>
            <input
              type="number"
              min={priceRange[0]}
              max={maxPrice}
              value={priceRange[1]}
              onChange={(e) => setPriceMax(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-emerald-200/80 bg-white text-xs text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all shadow-xs"
            />
          </div>
        </div>

        <div className="relative h-6 flex items-center mt-2 mb-1">
          <input
            type="range"
            min={0}
            max={maxPrice}
            step={50}
            value={priceRange[0]}
            onChange={(e) => setPriceMin(Number(e.target.value))}
            className="absolute w-full accent-emerald-700 h-1 bg-emerald-200 rounded-lg appearance-none cursor-pointer"
          />
          <input
            type="range"
            min={0}
            max={maxPrice}
            step={50}
            value={priceRange[1]}
            onChange={(e) => setPriceMax(Number(e.target.value))}
            className="absolute w-full accent-emerald-700 h-1 bg-transparent appearance-none cursor-pointer"
          />
        </div>
        <div className="flex justify-between text-xs text-emerald-900/60 mt-2 font-medium">
          <span>৳0</span>
          <span>৳{maxPrice}</span>
        </div>
      </div>

      <div>
        <h2 className="text-xs font-bold text-emerald-950 mb-3.5 tracking-wider uppercase">
          Sizes
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {SIZES.map((size) => {
            const isSelected = selectedSizes.includes(size);
            return (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                  isSelected
                    ? "bg-emerald-950 text-white border-emerald-950 shadow-xs"
                    : "border-emerald-200/80 bg-white text-emerald-900/80 hover:border-emerald-300 hover:bg-emerald-50/50"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="w-full text-xs font-semibold text-emerald-800 hover:text-white hover:bg-emerald-800 border border-emerald-300 rounded-xl py-2.5 transition-all"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  const headingText = initialBadge
    ? initialBadge
    : initialCategory
    ? initialCategory.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    : "All Products";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5fff9] via-[#eef9f2] to-white relative overflow-hidden">
      {/* Decorative organic glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-200/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[25%] right-[-10%] w-[40%] h-[40%] bg-teal-200/10 rounded-full blur-[100px] pointer-events-none" />

      {/* ─── Hero Section ─── */}
      <div className="relative overflow-hidden border-b border-emerald-100/50 bg-gradient-to-r from-emerald-50/70 via-emerald-100/40 to-teal-50/50 py-8 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-2xl space-y-2 md:space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-white/70 px-3 py-1 text-xs font-semibold text-emerald-800 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Curated Collection
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-emerald-950 leading-tight">
              {headingText}
            </h1>
            <p className="text-emerald-900/70 text-xs sm:text-sm font-normal max-w-lg leading-relaxed">
              Explore ShajSutro&apos;s premium lineup of products designed to combine style, longevity, and exceptional quality checks.
            </p>
          </div>
          
          {/* Glassmorphic stat card */}
          <div className="hidden md:flex flex-shrink-0 bg-white/60 backdrop-blur-md border border-emerald-100 rounded-2xl p-5 md:w-72 flex-col gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-emerald-950">Quality Verified</p>
                <p className="text-xs text-emerald-900/60 leading-normal">100% genuine products</p>
              </div>
            </div>
            <div className="h-px bg-emerald-100" />
            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-900/60">Status:</span>
              <span className="font-semibold text-emerald-800 bg-emerald-100/60 px-2.5 py-0.5 rounded-full text-xs flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Active Store
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-900/60">Available:</span>
              <span className="font-semibold text-emerald-950">
                {loading ? "Counting..." : `${filteredProducts.length} items`}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="flex gap-8">
          {/* Glassmorphic Filters Sidebar (Desktop) */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-28 bg-white/70 backdrop-blur-md border border-emerald-100 rounded-2xl p-5 shadow-xs">
              <FiltersPanel />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            {/* Sorting & mobile layout controls */}
            <div className="flex items-center justify-between gap-4 mb-8 bg-white/40 backdrop-blur-md border border-emerald-100/50 rounded-2xl p-4 shadow-soft">
              <button
                onClick={() => setIsMobileFiltersOpen(true)}
                className="flex lg:hidden items-center gap-2 text-sm font-semibold text-emerald-950 border border-emerald-200/80 bg-white/70 px-5 py-2.5 rounded-full hover:bg-white transition-all duration-300 shadow-soft"
              >
                <svg className="w-4 h-4 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                </svg>
                Filters
                {hasActiveFilters && (
                  <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">
                    {Math.min(9, activeFiltersCount)}
                  </span>
                )}
              </button>

              <div className="flex items-center gap-3 ml-auto">
                <label className="text-xs font-semibold uppercase tracking-wider text-emerald-900/60 hidden sm:block">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="text-sm font-medium border border-emerald-100 rounded-full px-5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 bg-white text-emerald-950 shadow-soft cursor-pointer hover:border-emerald-300 transition-all"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Micro-animated Active Filter Chips */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mb-8 animate-fade-in">
                <span className="text-xs text-emerald-900/50 font-medium mr-1 uppercase tracking-wider">Active:</span>
                {selectedCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className="group flex items-center gap-2 px-4 py-2 bg-emerald-950 text-white text-xs font-medium rounded-full transition-all duration-300 hover:bg-emerald-800 hover:scale-105 active:scale-95 shadow-soft hover:shadow-soft-lg"
                  >
                    <span className="capitalize">{cat}</span>
                    <span className="bg-white/20 rounded-full p-0.5 group-hover:bg-white/30 transition-colors">
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </span>
                  </button>
                ))}
                {selectedSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => toggleSize(size)}
                    className="group flex items-center gap-2 px-4 py-2 bg-emerald-950 text-white text-xs font-medium rounded-full transition-all duration-300 hover:bg-emerald-800 hover:scale-105 active:scale-95 shadow-soft hover:shadow-soft-lg"
                  >
                    <span>{size}</span>
                    <span className="bg-white/20 rounded-full p-0.5 group-hover:bg-white/30 transition-colors">
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </span>
                  </button>
                ))}
                {(priceRange[0] > 0 || priceRange[1] < maxPrice) && (
                  <button
                    onClick={() => setPriceRange([0, maxPrice])}
                    className="group flex items-center gap-2 px-4 py-2 bg-emerald-950 text-white text-xs font-medium rounded-full transition-all duration-300 hover:bg-emerald-800 hover:scale-105 active:scale-95 shadow-soft hover:shadow-soft-lg"
                  >
                    <span>৳{priceRange[0]} – ৳{priceRange[1]}</span>
                    <span className="bg-white/20 rounded-full p-0.5 group-hover:bg-white/30 transition-colors">
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </span>
                  </button>
                )}
                
                <button 
                  onClick={clearFilters}
                  className="text-xs text-emerald-600 hover:text-emerald-800 hover:underline font-semibold ml-2 transition-all"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Products / Loading / Empty Grids */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-10 sm:gap-x-7">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-4">
                    <div className="aspect-[3/4] rounded-2xl bg-gradient-to-br from-emerald-100/40 to-emerald-50/20 animate-pulse border border-emerald-100/30" />
                    <div className="h-4 bg-emerald-100/40 rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-emerald-100/30 rounded animate-pulse w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white/40 backdrop-blur-md border border-emerald-100/40 rounded-3xl p-8 shadow-glass mt-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100/30 border border-emerald-200/50 flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-emerald-950">No products match your criteria</h3>
                <p className="text-emerald-900/50 mt-2 text-sm font-light max-w-sm leading-relaxed">Try resetting the price range, unselecting size filters, or exploring other categories.</p>
                <button onClick={clearFilters} className="btn-primary mt-8 px-8 py-3.5 text-sm shadow-soft hover:shadow-soft-lg transition-all transform active:scale-95">
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-10 sm:gap-x-7">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upgraded Mobile Drawer */}
      {isMobileFiltersOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-charcoal-950/20 backdrop-blur-sm"
            onClick={() => setIsMobileFiltersOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-80 bg-gradient-to-b from-[#f5fff9] to-white flex flex-col shadow-soft-xl border-r border-emerald-100/50 animate-slide-in">
            <div className="flex items-center justify-between px-7 py-6 border-b border-emerald-100/30">
              <h2 className="text-base font-semibold text-emerald-950 uppercase tracking-wider">Filters</h2>
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="p-2 text-emerald-400 hover:text-emerald-900 rounded-full transition-colors duration-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-7 py-7">
              <FiltersPanel />
            </div>
            <div className="px-7 py-5 border-t border-emerald-100/30 bg-white/40 backdrop-blur-md">
              <div className="flex gap-3">
                <button
                  onClick={clearFilters}
                  disabled={!hasActiveFilters}
                  className="btn-secondary flex-1 disabled:opacity-50 disabled:cursor-not-allowed text-xs uppercase tracking-wider font-bold border-emerald-200 py-3"
                >
                  Reset
                </button>
                <button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="btn-primary flex-1 text-xs uppercase tracking-wider font-bold py-3"
                >
                  Apply ({filteredProducts.length})
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
