"use client";

import ProductCard from "@/components/product/ProductCard";
import { products as fallbackProducts } from "@/data/products";
import { getApiBase } from "@/lib/apiBase";
import { Product, SortOption } from "@/types";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  Search,
  ChevronRight,
  Check,
  ChevronLeft,
  SearchX,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApiProduct {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category:
    | {
        _id: string;
        name: string;
        slug: string;
        parent?: { _id: string; name: string; slug: string } | string;
      }
    | string;
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

interface NavSubCategory {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  productCount?: number;
}

interface NavCategory {
  _id: string;
  name: string;
  slug: string;
  productCount: number;
  subcategories?: NavSubCategory[];
}

interface ShopProduct extends Product {
  parentCategorySlug?: string;
}

function mapProduct(p: ApiProduct): ShopProduct {
  let catSlug = "";
  let parentSlug: string | undefined = undefined;

  if (typeof p.category === "object" && p.category) {
    catSlug = p.category.slug || "";
    if (p.category.parent && typeof p.category.parent === "object") {
      parentSlug = p.category.parent.slug;
    }
  } else if (typeof p.category === "string") {
    catSlug = p.category;
  }

  return {
    id: p._id,
    name: p.name,
    price: p.price,
    originalPrice: p.originalPrice,
    category: catSlug,
    parentCategorySlug: parentSlug,
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

function getProductCategorySlugs(p: ShopProduct, cats: NavCategory[]) {
  const directSlug = (p.category || "").toLowerCase();
  let parentSlug = p.parentCategorySlug
    ? p.parentCategorySlug.toLowerCase()
    : undefined;

  if (!parentSlug) {
    for (const c of cats) {
      if (c.slug.toLowerCase() === directSlug) {
        break;
      }
      if (
        c.subcategories?.some(
          (s) =>
            s.slug.toLowerCase() === directSlug ||
            s._id === directSlug ||
            s.name.toLowerCase() === directSlug,
        )
      ) {
        parentSlug = c.slug.toLowerCase();
        break;
      }
    }
  }

  return { directSlug, parentSlug };
}

const SIZE_GROUPS = [
  { label: "Standard Sizes", sizes: ["XS", "S", "M", "L", "XL", "XXL"] },
  { label: "Numeric Sizes", sizes: ["38", "40", "42", "44"] },
  { label: "Kids Ages", sizes: ["4-6 Yrs", "6-8 Yrs", "8-10 Yrs", "10-12 Yrs"] },
];

const BADGE_OPTIONS: { id: "Sale" | "New" | "Best Seller"; label: string; icon: string }[] = [
  { id: "Sale", label: "On Sale", icon: "🏷️" },
  { id: "New", label: "New Arrivals", icon: "✨" },
  { id: "Best Seller", label: "Best Sellers", icon: "🔥" },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest First" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "popular", label: "Most Popular" },
];

const ITEMS_PER_PAGE = 9;

// ─── Page wrapper ─────────────────────────────────────────────────────────────

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-9 h-9 border-3 border-emerald-200 border-t-emerald-950 rounded-full animate-spin" />
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
  const searchQuery = searchParams.get("search") ?? searchParams.get("q") ?? "";

  // ── Data state ──
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<NavCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Derive max price from current products for the range slider
  const maxPrice = useMemo(() => {
    if (allProducts.length === 0) return 25000;
    const highest = Math.max(...allProducts.map((p) => p.price));
    return Math.max(5000, Math.ceil(highest / 1000) * 1000);
  }, [allProducts]);

  // ── Filter & Pagination state ──
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory ? [initialCategory] : [],
  );
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedBadges, setSelectedBadges] = useState<string[]>(
    initialBadge ? [initialBadge] : [],
  );
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 25000]);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // ── Accordion / UI expansion states ──
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    categories: true,
    price: true,
    sizes: true,
    availability: true,
    badges: true,
  });
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [categorySearch, setCategorySearch] = useState("");

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleCategoryExpand = (catId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCategories((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  // Reset filters when URL category/badge changes or allProducts load
  useEffect(() => {
    setSelectedCategories(initialCategory ? [initialCategory] : []);
    setSelectedBadges(initialBadge ? [initialBadge] : []);
    setSelectedSizes([]);
    setInStockOnly(false);
    setSortBy("newest");
    setCurrentPage(1);
    if (allProducts.length > 0) {
      const highest = Math.max(...allProducts.map((p) => p.price));
      const dynamicMax = Math.max(5000, Math.ceil(highest / 1000) * 1000);
      setPriceRange([0, dynamicMax]);
    }
  }, [initialCategory, initialBadge, searchQuery, allProducts]);

  // Reset to page 1 on filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategories, selectedSizes, selectedBadges, inStockOnly, priceRange, sortBy, searchQuery]);

  // Fetch categories for the filter panel
  useEffect(() => {
    fetch(`${getApiBase()}/api/categories`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success && Array.isArray(j.data)) {
          setCategories(j.data);
          // Expand categories by default
          const exp: Record<string, boolean> = {};
          j.data.forEach((c: NavCategory) => {
            exp[c._id] = true;
          });
          setExpandedCategories(exp);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch products
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "100" });
    if (initialBadge) params.set("badge", initialBadge);
    if (searchQuery) params.set("search", searchQuery);

    fetch(`${getApiBase()}/api/products?${params.toString()}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success && Array.isArray(j.data) && j.data.length > 0) {
          const prods = (j.data as ApiProduct[]).map(mapProduct);
          setAllProducts(prods);
          const highest = Math.max(...prods.map((p) => p.price));
          const dynamicMax = Math.max(5000, Math.ceil(highest / 1000) * 1000);
          setPriceRange([0, dynamicMax]);
        } else {
          setAllProducts(fallbackProducts);
          const highest = Math.max(...fallbackProducts.map((p) => p.price));
          const dynamicMax = Math.max(5000, Math.ceil(highest / 1000) * 1000);
          setPriceRange([0, dynamicMax]);
        }
      })
      .catch(() => {
        setAllProducts(fallbackProducts);
        const highest = Math.max(...fallbackProducts.map((p) => p.price));
        const dynamicMax = Math.max(5000, Math.ceil(highest / 1000) * 1000);
        setPriceRange([0, dynamicMax]);
      })
      .finally(() => setLoading(false));
  }, [initialBadge, searchQuery]);

  // ── Client-side filtering + sorting ──
  const filteredProducts = useMemo(() => {
    let list = [...allProducts];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.sku && p.sku.toLowerCase().includes(q)) ||
          p.category.toLowerCase().includes(q) ||
          (p.tags && p.tags.some((t) => t.toLowerCase().includes(q))),
      );
    }

    if (selectedCategories.length > 0) {
      const selectedLower = selectedCategories.map((c) => c.toLowerCase());
      list = list.filter((p) => {
        const { directSlug, parentSlug } = getProductCategorySlugs(
          p,
          categories,
        );
        return (
          selectedLower.includes(directSlug) ||
          (parentSlug ? selectedLower.includes(parentSlug) : false)
        );
      });
    }

    if (selectedSizes.length > 0) {
      list = list.filter((p) => p.sizes.some((s) => selectedSizes.includes(s)));
    }

    if (selectedBadges.length > 0) {
      list = list.filter((p) => p.badge && selectedBadges.includes(p.badge));
    }

    if (inStockOnly) {
      list = list.filter((p) => p.inStock);
    }

    list = list.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1],
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
  }, [
    allProducts,
    selectedCategories,
    selectedSizes,
    selectedBadges,
    inStockOnly,
    priceRange,
    sortBy,
    categories,
    searchQuery,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / ITEMS_PER_PAGE),
  );

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size],
    );
  };

  const toggleBadge = (badge: string) => {
    setSelectedBadges((prev) =>
      prev.includes(badge) ? prev.filter((b) => b !== badge) : [...prev, badge],
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
    setSelectedBadges([]);
    setInStockOnly(false);
    setPriceRange([0, maxPrice]);
    setSortBy("newest");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    Boolean(searchQuery) ||
    selectedCategories.length > 0 ||
    selectedSizes.length > 0 ||
    selectedBadges.length > 0 ||
    inStockOnly ||
    priceRange[0] > 0 ||
    priceRange[1] < maxPrice;

  const activeFiltersCount =
    (searchQuery ? 1 : 0) +
    selectedCategories.length +
    selectedSizes.length +
    selectedBadges.length +
    (inStockOnly ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < maxPrice ? 1 : 0);

  // Price presets helper
  const applyPricePreset = (min: number, max: number) => {
    setPriceRange([min, Math.min(max, maxPrice)]);
  };

  // Filtered categories by search
  const filteredNavCategories = useMemo(() => {
    if (!categorySearch.trim()) return categories;
    const q = categorySearch.toLowerCase().trim();
    return categories
      .map((cat) => {
        const matchesParent = cat.name.toLowerCase().includes(q);
        const matchingSubs = cat.subcategories?.filter((sub) =>
          sub.name.toLowerCase().includes(q),
        );
        if (matchesParent || (matchingSubs && matchingSubs.length > 0)) {
          return {
            ...cat,
            subcategories: matchingSubs || cat.subcategories,
          };
        }
        return null;
      })
      .filter(Boolean) as NavCategory[];
  }, [categories, categorySearch]);

  // ── Filter panel (shared desktop + mobile) ──
  const FiltersPanel = () => (
    <div className="space-y-6 select-none">
      {/* ─── Top Filter Header & Quick Reset ─── */}
      <div className="flex items-center justify-between pb-3 border-b border-emerald-100/70">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-950 text-white flex items-center justify-center shadow-xs">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-emerald-950 tracking-tight">Refine Products</h2>
            <p className="text-[11px] text-emerald-800/70">{filteredProducts.length} items available</p>
          </div>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-100/50 hover:bg-emerald-100 px-2.5 py-1 rounded-full transition-all flex items-center gap-1 active:scale-95"
          >
            <span>Reset</span>
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* ─── 1. Categories Accordion ─── */}
      {categories.length > 0 && !initialBadge && (
        <div className="border border-emerald-100/80 rounded-2xl bg-white/90 shadow-xs overflow-hidden transition-all">
          <button
            type="button"
            onClick={() => toggleSection("categories")}
            className="w-full px-4 py-3 flex items-center justify-between bg-emerald-50/40 hover:bg-emerald-50/70 transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-950">Categories</span>
              {selectedCategories.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-emerald-950 text-white text-[10px] flex items-center justify-center font-bold">
                  {selectedCategories.length}
                </span>
              )}
            </div>
            <ChevronDown
              className={`w-4 h-4 text-emerald-800/80 transform transition-transform duration-200 ${
                openSections.categories ? "rotate-180" : ""
              }`}
            />
          </button>

          {openSections.categories && (
            <div className="p-3.5 space-y-3">
              {categories.length > 3 && (
                <div className="relative mb-2">
                  <input
                    type="text"
                    placeholder="Search category..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    className="w-full text-xs pl-8 pr-7 py-1.5 rounded-xl border border-emerald-200/80 bg-white placeholder-emerald-800/40 text-emerald-950 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                  />
                  <Search className="w-3.5 h-3.5 text-emerald-700/60 absolute left-2.5 top-2.5" />
                  {categorySearch && (
                    <button
                      type="button"
                      onClick={() => setCategorySearch("")}
                      className="absolute right-2.5 top-2 text-emerald-800/60 hover:text-emerald-950"
                    >
                      ×
                    </button>
                  )}
                </div>
              )}

              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {filteredNavCategories.map((cat) => {
                  const isSelected = selectedCategories.includes(cat.slug);
                  const isExpanded = expandedCategories[cat._id] ?? true;
                  const hasSub = Boolean(cat.subcategories && cat.subcategories.length > 0);

                  const parentProductCount = allProducts.filter((p) => {
                    const { directSlug, parentSlug } = getProductCategorySlugs(p, categories);
                    return directSlug === cat.slug.toLowerCase() || parentSlug === cat.slug.toLowerCase();
                  }).length;

                  return (
                    <div key={cat._id} className="space-y-1">
                      <div
                        onClick={() => toggleCategory(cat.slug)}
                        className={`w-full flex items-center justify-between rounded-xl px-2.5 py-2 border transition-all duration-150 cursor-pointer ${
                          isSelected
                            ? "border-emerald-300 bg-emerald-50 text-emerald-950 font-semibold shadow-xs"
                            : "border-transparent text-emerald-900/80 hover:bg-emerald-50/50 hover:text-emerald-950"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {hasSub && (
                            <button
                              type="button"
                              onClick={(e) => toggleCategoryExpand(cat._id, e)}
                              className="p-1 -ml-1 text-emerald-800/70 hover:text-emerald-950 hover:bg-emerald-100/60 rounded-md transition-colors"
                              title={isExpanded ? "Collapse" : "Expand"}
                            >
                              <ChevronRight
                                className={`w-3.5 h-3.5 transform transition-transform duration-200 stroke-[2.5] ${
                                  isExpanded ? "rotate-90" : ""
                                }`}
                              />
                            </button>
                          )}

                          <span
                            className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                              isSelected
                                ? "bg-emerald-950 border-emerald-950 text-white shadow-xs"
                                : "border-emerald-200 bg-white"
                            }`}
                          >
                            {isSelected && (
                              <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                            )}
                          </span>

                          <span className="text-xs font-medium truncate">{cat.name}</span>
                        </div>

                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                            isSelected
                              ? "bg-emerald-950 text-white font-bold"
                              : "bg-emerald-100/50 text-emerald-800"
                          }`}
                        >
                          {parentProductCount}
                        </span>
                      </div>

                      {/* Subcategories */}
                      {hasSub && isExpanded && (
                        <div className="ml-5 pl-2.5 border-l-2 border-emerald-200/50 space-y-1 pt-0.5">
                          {cat.subcategories!.map((sub) => {
                            const isSubSelected = selectedCategories.includes(sub.slug);
                            const subProductCount = allProducts.filter((p) => {
                              const { directSlug } = getProductCategorySlugs(p, categories);
                              return directSlug === sub.slug.toLowerCase();
                            }).length;

                            return (
                              <button
                                key={sub._id}
                                type="button"
                                onClick={() => toggleCategory(sub.slug)}
                                className={`w-full flex items-center justify-between rounded-lg px-2 py-1.5 border transition-all duration-150 ${
                                  isSubSelected
                                    ? "border-emerald-300 bg-emerald-100/70 text-emerald-950 font-bold"
                                    : "border-transparent text-emerald-900/70 hover:bg-emerald-50 hover:text-emerald-950"
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span
                                    className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${
                                      isSubSelected
                                        ? "bg-emerald-950 border-emerald-950 text-white"
                                        : "border-emerald-200 bg-white"
                                    }`}
                                  >
                                    {isSubSelected && (
                                      <Check className="w-2 h-2 stroke-[3.5]" />
                                    )}
                                  </span>
                                  <span className="text-[11px] font-medium truncate">{sub.name}</span>
                                </div>
                                <span
                                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${
                                    isSubSelected
                                      ? "bg-emerald-950 text-white font-bold"
                                      : "bg-emerald-100/40 text-emerald-800"
                                  }`}
                                >
                                  {subProductCount}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── 2. Price Range Accordion ─── */}
      <div className="border border-emerald-100/80 rounded-2xl bg-white/90 shadow-xs overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => toggleSection("price")}
          className="w-full px-4 py-3 flex items-center justify-between bg-emerald-50/40 hover:bg-emerald-50/70 transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-950">Price Range</span>
            {(priceRange[0] > 0 || priceRange[1] < maxPrice) && (
              <span className="text-[10px] font-bold text-emerald-900 bg-emerald-200/70 px-2 py-0.5 rounded-full">
                ৳{priceRange[0]} - ৳{priceRange[1]}
              </span>
            )}
          </div>
          <ChevronDown
            className={`w-4 h-4 text-emerald-800/80 transform transition-transform duration-200 ${
              openSections.price ? "rotate-180" : ""
            }`}
          />
        </button>

        {openSections.price && (
          <div className="p-4 space-y-4">
            {/* Quick Price Preset Chips */}
            <div>
              <label className="block text-[11px] font-semibold text-emerald-900/60 uppercase tracking-wider mb-2">
                Quick Presets
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { label: "All Prices", min: 0, max: maxPrice },
                  { label: "< ৳1,000", min: 0, max: 1000 },
                  { label: "৳1k – ৳3k", min: 1000, max: 3000 },
                  { label: "৳3k – ৳7k", min: 3000, max: 7000 },
                  { label: "৳7,000+", min: 7000, max: maxPrice },
                ].map((preset) => {
                  const isActive = priceRange[0] === preset.min && priceRange[1] === preset.max;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => applyPricePreset(preset.min, preset.max)}
                      className={`text-xs py-1.5 px-2.5 rounded-xl border transition-all text-center truncate ${
                        isActive
                          ? "bg-emerald-950 text-white border-emerald-950 font-bold shadow-xs"
                          : "bg-emerald-50/40 text-emerald-950 border-emerald-200/60 hover:bg-emerald-100/50 hover:border-emerald-300 font-medium"
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Min / Max Inputs */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div>
                <label className="block text-[11px] text-emerald-900/70 font-semibold mb-1">
                  Min (৳)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-emerald-800/60 font-semibold">৳</span>
                  <input
                    type="number"
                    min={0}
                    max={priceRange[1]}
                    value={priceRange[0]}
                    onChange={(e) => setPriceMin(Number(e.target.value))}
                    className="w-full pl-7 pr-2.5 py-1.5 rounded-xl border border-emerald-200/80 bg-white text-xs font-semibold text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 shadow-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] text-emerald-900/70 font-semibold mb-1">
                  Max (৳)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-emerald-800/60 font-semibold">৳</span>
                  <input
                    type="number"
                    min={priceRange[0]}
                    max={maxPrice}
                    value={priceRange[1]}
                    onChange={(e) => setPriceMax(Number(e.target.value))}
                    className="w-full pl-7 pr-2.5 py-1.5 rounded-xl border border-emerald-200/80 bg-white text-xs font-semibold text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 shadow-xs"
                  />
                </div>
              </div>
            </div>

            {/* Slider with dynamic track coloring */}
            <div className="pt-2">
              <div className="relative h-6 flex items-center">
                {/* Visual Gradient Track */}
                <div className="absolute w-full h-1.5 bg-emerald-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-600 to-emerald-950 rounded-full"
                    style={{
                      marginLeft: `${(priceRange[0] / maxPrice) * 100}%`,
                      width: `${((priceRange[1] - priceRange[0]) / maxPrice) * 100}%`,
                    }}
                  />
                </div>
                <input
                  type="range"
                  min={0}
                  max={maxPrice}
                  step={100}
                  value={priceRange[0]}
                  onChange={(e) => setPriceMin(Number(e.target.value))}
                  className="absolute w-full accent-emerald-950 h-1.5 bg-transparent appearance-none cursor-pointer pointer-events-auto"
                />
                <input
                  type="range"
                  min={0}
                  max={maxPrice}
                  step={100}
                  value={priceRange[1]}
                  onChange={(e) => setPriceMax(Number(e.target.value))}
                  className="absolute w-full accent-emerald-950 h-1.5 bg-transparent appearance-none cursor-pointer pointer-events-auto"
                />
              </div>
              <div className="flex justify-between text-[11px] text-emerald-900/60 mt-1 font-semibold">
                <span>৳0</span>
                <span>৳{maxPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── 3. Sizes Accordion ─── */}
      <div className="border border-emerald-100/80 rounded-2xl bg-white/90 shadow-xs overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => toggleSection("sizes")}
          className="w-full px-4 py-3 flex items-center justify-between bg-emerald-50/40 hover:bg-emerald-50/70 transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-950">Sizes</span>
            {selectedSizes.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-emerald-950 text-white text-[10px] flex items-center justify-center font-bold">
                {selectedSizes.length}
              </span>
            )}
          </div>
          <ChevronDown
            className={`w-4 h-4 text-emerald-800/80 transform transition-transform duration-200 ${
              openSections.sizes ? "rotate-180" : ""
            }`}
          />
        </button>

        {openSections.sizes && (
          <div className="p-4 space-y-4">
            {SIZE_GROUPS.map((group) => (
              <div key={group.label} className="space-y-1.5">
                <label className="block text-[10px] font-bold text-emerald-900/50 uppercase tracking-wider">
                  {group.label}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {group.sizes.map((size) => {
                    const isSelected = selectedSizes.includes(size);
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleSize(size)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all active:scale-95 ${
                          isSelected
                            ? "bg-emerald-950 text-white border-emerald-950 shadow-xs font-bold ring-2 ring-emerald-950/20"
                            : "border-emerald-200/80 bg-white text-emerald-950 hover:border-emerald-400 hover:bg-emerald-50/60"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── 4. Special Offers & Badges ─── */}
      <div className="border border-emerald-100/80 rounded-2xl bg-white/90 shadow-xs overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => toggleSection("badges")}
          className="w-full px-4 py-3 flex items-center justify-between bg-emerald-50/40 hover:bg-emerald-50/70 transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-950">Collections & Deals</span>
            {selectedBadges.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-emerald-950 text-white text-[10px] flex items-center justify-center font-bold">
                {selectedBadges.length}
              </span>
            )}
          </div>
          <ChevronDown
            className={`w-4 h-4 text-emerald-800/80 transform transition-transform duration-200 ${
              openSections.badges ? "rotate-180" : ""
            }`}
          />
        </button>

        {openSections.badges && (
          <div className="p-3.5 space-y-2">
            {BADGE_OPTIONS.map((badge) => {
              const isSelected = selectedBadges.includes(badge.id);
              const count = allProducts.filter((p) => p.badge === badge.id).length;
              return (
                <button
                  key={badge.id}
                  type="button"
                  onClick={() => toggleBadge(badge.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-emerald-950 text-white border-emerald-950 shadow-xs"
                      : "bg-white border-emerald-200/70 text-emerald-950 hover:bg-emerald-50/60 hover:border-emerald-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{badge.icon}</span>
                    <span>{badge.label}</span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isSelected ? "bg-white/20 text-white" : "bg-emerald-100/60 text-emerald-900"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── 5. Availability Switch ─── */}
      <div className="border border-emerald-100/80 rounded-2xl bg-white/90 p-4 shadow-xs">
        <label className="flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <span className="text-xs font-bold text-emerald-950 block">In Stock Only</span>
              <span className="text-[10px] text-emerald-800/60 font-medium">Hide out-of-stock items</span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-10 h-5 bg-emerald-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-emerald-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-950 relative" />
        </label>
      </div>
    </div>
  );

  const getCategoryLabel = (slug: string) => {
    const parent = categories.find(
      (c) => c.slug.toLowerCase() === slug.toLowerCase(),
    );
    if (parent) return parent.name;
    for (const c of categories) {
      const sub = c.subcategories?.find(
        (s) => s.slug.toLowerCase() === slug.toLowerCase(),
      );
      if (sub) return `${c.name} › ${sub.name}`;
    }
    return slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const headingText = useMemo(() => {
    if (searchQuery) return `Search Results for "${searchQuery}"`;
    if (initialBadge) return initialBadge;
    if (!initialCategory) return "All Products";
    return getCategoryLabel(initialCategory);
  }, [searchQuery, initialBadge, initialCategory, categories]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5fff9] via-[#eef9f2] to-white relative overflow-x-clip">
      {/* Decorative organic glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-200/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[25%] right-[-10%] w-[40%] h-[40%] bg-teal-200/10 rounded-full blur-[100px] pointer-events-none" />

      {/* ─── Simplified Hero Section ─── */}
      <div className="relative overflow-hidden border-b border-emerald-100/50 bg-gradient-to-r from-emerald-50/70 via-emerald-100/40 to-teal-50/50 py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="max-w-2xl space-y-2 md:space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-white/70 px-3 py-1 text-xs font-semibold text-emerald-800 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Curated Collection
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-emerald-950 leading-tight">
                {headingText}
              </h1>
              <span className="text-xs font-semibold text-emerald-800 bg-white/80 border border-emerald-200 px-3 py-1 rounded-full shadow-xs">
                {loading
                  ? "Loading..."
                  : `${filteredProducts.length} ${filteredProducts.length === 1 ? "item" : "items"}`}
              </span>
            </div>
            <p className="text-emerald-900/70 text-xs sm:text-sm font-normal max-w-lg leading-relaxed">
              Explore ShajSutro&apos;s premium lineup of products designed to
              combine style, longevity, and exceptional quality checks.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="flex gap-8 items-start">
          {/* Glassmorphic Filters Sidebar (Desktop - Sticky on scroll) */}
          <aside className="hidden lg:block w-72 flex-shrink-0 self-start sticky top-24 z-20">
            <div className="bg-white/85 backdrop-blur-md border border-emerald-100/90 rounded-2xl p-4 shadow-sm max-h-[calc(100vh-7rem)] overflow-y-auto overscroll-contain custom-scrollbar">
              <FiltersPanel />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            {/* Sorting & mobile layout controls */}
            <div className="flex items-center justify-between gap-4 mb-6 bg-white/60 backdrop-blur-md border border-emerald-100/60 rounded-2xl p-3.5 sm:p-4 shadow-soft">
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(true)}
                className="flex lg:hidden items-center gap-2 text-xs sm:text-sm font-semibold text-emerald-950 border border-emerald-200/80 bg-white/90 px-4 py-2.5 rounded-xl hover:bg-white transition-all shadow-xs active:scale-95"
              >
                <SlidersHorizontal className="w-4 h-4 text-emerald-800" strokeWidth={1.5} />
                Filters
                {hasActiveFilters && (
                  <span className="w-5 h-5 rounded-full bg-emerald-950 text-white text-[11px] flex items-center justify-center font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              <div className="flex items-center gap-3 ml-auto">
                <label className="text-xs font-semibold uppercase tracking-wider text-emerald-900/70 hidden sm:block">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="text-xs sm:text-sm font-medium border border-emerald-200/80 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 bg-white text-emerald-950 shadow-xs cursor-pointer hover:border-emerald-300 transition-all"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filter Chips */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mb-6 animate-fade-in p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100/60">
                <span className="text-[11px] text-emerald-900/70 font-bold uppercase tracking-wider mr-1">
                  Active Filters:
                </span>
                {searchQuery && (
                  <Link
                    href={`/shop${initialCategory ? `?category=${initialCategory}` : ""}${initialBadge ? `${initialCategory ? "&" : "?"}badge=${initialBadge}` : ""}`}
                    className="group flex items-center gap-1.5 px-3 py-1 bg-emerald-950 text-white text-xs font-medium rounded-full transition-all duration-200 hover:bg-emerald-800 shadow-xs"
                  >
                    <span>Search: &ldquo;{searchQuery}&rdquo;</span>
                    <span className="bg-white/20 rounded-full p-0.5 group-hover:bg-white/30 transition-colors">
                      ✕
                    </span>
                  </Link>
                )}
                {selectedCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className="group flex items-center gap-1.5 px-3 py-1 bg-emerald-950 text-white text-xs font-medium rounded-full transition-all duration-200 hover:bg-emerald-800 shadow-xs"
                  >
                    <span>{getCategoryLabel(cat)}</span>
                    <span className="bg-white/20 rounded-full p-0.5 group-hover:bg-white/30 transition-colors">
                      ✕
                    </span>
                  </button>
                ))}
                {selectedSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className="group flex items-center gap-1.5 px-3 py-1 bg-emerald-950 text-white text-xs font-medium rounded-full transition-all duration-200 hover:bg-emerald-800 shadow-xs"
                  >
                    <span>Size: {size}</span>
                    <span className="bg-white/20 rounded-full p-0.5 group-hover:bg-white/30 transition-colors">
                      ✕
                    </span>
                  </button>
                ))}
                {selectedBadges.map((badge) => (
                  <button
                    key={badge}
                    type="button"
                    onClick={() => toggleBadge(badge)}
                    className="group flex items-center gap-1.5 px-3 py-1 bg-emerald-950 text-white text-xs font-medium rounded-full transition-all duration-200 hover:bg-emerald-800 shadow-xs"
                  >
                    <span>{badge}</span>
                    <span className="bg-white/20 rounded-full p-0.5 group-hover:bg-white/30 transition-colors">
                      ✕
                    </span>
                  </button>
                ))}
                {inStockOnly && (
                  <button
                    type="button"
                    onClick={() => setInStockOnly(false)}
                    className="group flex items-center gap-1.5 px-3 py-1 bg-emerald-950 text-white text-xs font-medium rounded-full transition-all duration-200 hover:bg-emerald-800 shadow-xs"
                  >
                    <span>In Stock Only</span>
                    <span className="bg-white/20 rounded-full p-0.5 group-hover:bg-white/30 transition-colors">
                      ✕
                    </span>
                  </button>
                )}
                {(priceRange[0] > 0 || priceRange[1] < maxPrice) && (
                  <button
                    type="button"
                    onClick={() => setPriceRange([0, maxPrice])}
                    className="group flex items-center gap-1.5 px-3 py-1 bg-emerald-950 text-white text-xs font-medium rounded-full transition-all duration-200 hover:bg-emerald-800 shadow-xs"
                  >
                    <span>
                      ৳{priceRange[0]} – ৳{priceRange[1]}
                    </span>
                    <span className="bg-white/20 rounded-full p-0.5 group-hover:bg-white/30 transition-colors">
                      ✕
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs text-emerald-800 hover:text-emerald-950 hover:underline font-bold ml-auto transition-all"
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
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white/60 backdrop-blur-md border border-emerald-100/60 rounded-3xl p-8 shadow-glass mt-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100/50 border border-emerald-200/60 flex items-center justify-center mb-6">
                  <SearchX className="w-7 h-7 text-emerald-800" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-emerald-950">
                  No products match your criteria
                </h3>
                <p className="text-emerald-900/70 mt-2 text-sm font-normal max-w-sm leading-relaxed">
                  Try adjusting the price range, unselecting size filters, or
                  exploring other categories.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-8 px-6 py-3 min-h-[44px] bg-emerald-950 text-white font-semibold text-sm rounded-xl hover:bg-emerald-800 transition-all shadow-sm active:scale-95"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-10 sm:gap-x-7">
                  {paginatedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* ─── Pagination Controls ─── */}
                {totalPages > 1 && (
                  <div className="mt-12 pt-6 border-t border-emerald-100/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-emerald-900/70 font-medium">
                      Showing{" "}
                      <span className="font-bold text-emerald-950">
                        {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                      </span>
                      –
                      <span className="font-bold text-emerald-950">
                        {Math.min(
                          currentPage * ITEMS_PER_PAGE,
                          filteredProducts.length,
                        )}
                      </span>{" "}
                      of{" "}
                      <span className="font-bold text-emerald-950">
                        {filteredProducts.length}
                      </span>{" "}
                      items
                    </p>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentPage((p) => Math.max(1, p - 1));
                          window.scrollTo({ top: 150, behavior: "smooth" });
                        }}
                        disabled={currentPage === 1}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-emerald-200/80 bg-white text-emerald-950 hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs flex items-center gap-1"
                        aria-label="Previous Page"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        Prev
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1,
                        ).map((pageNum) => (
                          <button
                            key={pageNum}
                            type="button"
                            onClick={() => {
                              setCurrentPage(pageNum);
                              window.scrollTo({ top: 150, behavior: "smooth" });
                            }}
                            className={`w-9 h-9 rounded-xl text-xs font-semibold transition-all flex items-center justify-center ${
                              currentPage === pageNum
                                ? "bg-emerald-950 text-white shadow-xs"
                                : "border border-emerald-200/80 bg-white text-emerald-950 hover:bg-emerald-50"
                            }`}
                            aria-label={`Go to page ${pageNum}`}
                            aria-current={
                              currentPage === pageNum ? "page" : undefined
                            }
                          >
                            {pageNum}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setCurrentPage((p) => Math.min(totalPages, p + 1));
                          window.scrollTo({ top: 150, behavior: "smooth" });
                        }}
                        disabled={currentPage === totalPages}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-emerald-200/80 bg-white text-emerald-950 hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs flex items-center gap-1"
                        aria-label="Next Page"
                      >
                        Next
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upgraded Mobile Drawer */}
      {isMobileFiltersOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-emerald-950/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileFiltersOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-[85vw] max-w-sm bg-gradient-to-b from-[#f5fff9] to-white flex flex-col shadow-2xl border-r border-emerald-100/50 animate-slide-in">
            <div className="flex items-center justify-between px-5 py-4 border-b border-emerald-100/50 bg-white/80 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-emerald-950 text-white flex items-center justify-center text-xs">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-sm font-bold text-emerald-950 uppercase tracking-wider">
                  Filters {hasActiveFilters ? `(${activeFiltersCount})` : ""}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(false)}
                className="p-1.5 text-emerald-800/70 hover:text-emerald-950 hover:bg-emerald-100/50 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 overscroll-contain">
              <FiltersPanel />
            </div>

            <div className="p-4 border-t border-emerald-100/60 bg-white/90 backdrop-blur-md">
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={clearFilters}
                  disabled={!hasActiveFilters}
                  className="flex-1 min-h-[44px] rounded-xl border border-emerald-200/80 bg-white text-emerald-950 hover:bg-emerald-50 py-2.5 text-xs font-bold uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="flex-2 min-h-[44px] rounded-xl bg-emerald-950 text-white hover:bg-emerald-800 py-2.5 text-xs font-bold uppercase tracking-wider transition-all shadow-sm active:scale-98 flex items-center justify-center gap-1.5"
                >
                  <span>Show Results</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-[11px]">
                    {filteredProducts.length}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
