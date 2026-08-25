"use client";

import AdminAuthGuard from "@/components/admin/AdminAuthGuard";
import { useAdminAuth } from "@/context/AdminAuthContext";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: { _id: string; name: string } | string;
  images: string[];
  sizes: string[];
  colors: string[];
  badge?: string;
  inStock: boolean;
  isFeatured: boolean;
  isVisible: boolean;
  stock: number;
  totalOrdered: number;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
}

type ProductForm = {
  name: string;
  description: string;
  price: string;
  originalPrice: string;
  category: string;
  images: string;
  sizes: string;
  colors: string;
  badge: string;
  inStock: boolean;
  isFeatured: boolean;
  isVisible: boolean;
  stock: string;
};

const BADGE_STYLE: Record<string, string> = {
  Sale: "bg-rose-900/30 text-rose-400 border border-rose-500/30",
  New: "bg-blue-900/30 text-blue-400 border border-blue-500/30",
  "Best Seller":
    "bg-amber-900/30 text-amber-400 border border-amber-500/30 whitespace-nowrap",
  Hot: "bg-orange-900/30 text-orange-400 border border-orange-500/30",
};

const EMPTY_FORM: ProductForm = {
  name: "",
  description: "",
  price: "",
  originalPrice: "",
  category: "",
  images: "",
  sizes: "",
  colors: "",
  badge: "",
  inStock: true,
  isFeatured: false,
  isVisible: true,
  stock: "0",
};

// â”€â”€â”€ Toast â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function Toast({ msg, type }: { msg: string; type: "success" | "error" }) {
  return (
    <div
      className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-medium ${type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}
    >
      {type === "success" ? (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M5 13l4 4L19 7"
          />
        </svg>
      ) : (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      )}
      {msg}
    </div>
  );
}

// â”€â”€â”€ Toggle Switch â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div
        onClick={onChange}
        className={`relative w-10 rounded-full transition-colors flex-shrink-0 ${checked ? "bg-violet-600" : "bg-gray-300"}`}
        style={{ height: "22px" }}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`}
        />
      </div>
      <span className="text-sm font-medium text-slate-300">{label}</span>
    </label>
  );
}

// â”€â”€â”€ Product Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function ProductModal({
  product,
  categories,
  categoriesLoading,
  defaultCategoryId,
  onClose,
  onSave,
}: {
  product: Product | null;
  categories: Category[];
  categoriesLoading: boolean;
  defaultCategoryId?: string;
  onClose: () => void;
  onSave: (data: Partial<Product>, id?: string) => Promise<void>;
}) {
  const [form, setForm] = useState<ProductForm>(() =>
    product
      ? {
          name: product.name,
          description: product.description,
          price: String(product.price),
          originalPrice: product.originalPrice
            ? String(product.originalPrice)
            : "",
          category:
            typeof product.category === "object"
              ? product.category._id
              : product.category,
          images: product.images.join(", "),
          sizes: product.sizes.join(", "),
          colors: product.colors.join(", "),
          badge: product.badge ?? "",
          inStock: product.inStock,
          isFeatured: product.isFeatured ?? false,
          isVisible: product.isVisible ?? true,
          stock: String(product.stock ?? 0),
        }
      : { ...EMPTY_FORM, category: defaultCategoryId ?? "" },
  );
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "pricing" | "media">("general");

  const set = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const toggleSizeTag = (size: string) => {
    const current = form.sizes.split(",").map((s) => s.trim()).filter(Boolean);
    const exists = current.includes(size);
    const updated = exists ? current.filter((s) => s !== size) : [...current, size];
    setForm((p) => ({ ...p, sizes: updated.join(", ") }));
  };

  const toggleColorTag = (color: string) => {
    const current = form.colors.split(",").map((c) => c.trim()).filter(Boolean);
    const exists = current.includes(color);
    const updated = exists ? current.filter((c) => c !== color) : [...current, color];
    setForm((p) => ({ ...p, colors: updated.join(", ") }));
  };

  const imageList = form.images
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const selectedCategoryName =
    categories.find((c) => c._id === form.category)?.name || "Select Category";

  const numPrice = Number(form.price) || 0;
  const numOrig = Number(form.originalPrice) || 0;
  const discountPercent =
    numOrig > numPrice && numPrice > 0
      ? Math.round(((numOrig - numPrice) / numOrig) * 100)
      : 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(
        {
          name: form.name,
          description: form.description,
          price: Number(form.price),
          originalPrice: form.originalPrice
            ? Number(form.originalPrice)
            : undefined,
          category: form.category,
          images: form.images
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          sizes: form.sizes
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          colors: form.colors
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          badge: (form.badge || "") as Product["badge"],
          inStock: form.inStock,
          isFeatured: form.isFeatured,
          isVisible: form.isVisible,
          stock: Number(form.stock) || 0,
        },
        product?._id,
      );
    } finally {
      setSaving(false);
    }
  };

  const presetSizes = ["S", "M", "L", "XL", "XXL", "Free Size"];
  const presetColors = ["Black", "White", "Red", "Navy Blue", "Emerald", "Pink", "Gold"];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 backdrop-blur-md transition-all animate-fade-in"
      style={{ background: "rgba(3, 7, 18, 0.82)" }}
    >
      <div
        className="rounded-3xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[94vh] overflow-hidden border border-white/10"
        style={{
          background: "linear-gradient(145deg, rgba(15, 23, 42, 0.98) 0%, rgba(3, 7, 18, 0.99) 100%)",
        }}
      >
        {/* Luxury Modal Header */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-white/8 bg-white/[0.01]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-violet-500/20 text-lg font-bold">
              {product ? "✏️" : "✨"}
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white tracking-wide">
                {product ? "Edit Product Details" : "Create New Product"}
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                {product
                  ? `Editing: ${product.name}`
                  : "Add a luxury product to your storefront catalog"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Tab Selectors for Mobile/Desktop */}
            <div className="hidden sm:flex items-center bg-white/[0.04] border border-white/8 p-1 rounded-2xl gap-1">
              <button
                type="button"
                onClick={() => setActiveTab("general")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "general"
                    ? "bg-violet-600 text-white shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                1. General Specs
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("pricing")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "pricing"
                    ? "bg-violet-600 text-white shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                2. Price & Stock
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("media")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "media"
                    ? "bg-violet-600 text-white shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                3. Media & Variants
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-2xl text-slate-400 hover:text-white bg-white/[0.04] hover:bg-rose-500/20 hover:border-rose-500/30 border border-white/8 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Form Body — 2 Column Split Grid */}
        <form id="product-form" onSubmit={submit} className="flex-1 overflow-y-auto p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Form Fields (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Basic Info Group */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <h3 className="text-xs font-extrabold text-violet-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>📦</span> Product Identity
                  </h3>
                  <span className="text-[11px] text-slate-500 font-medium">Required *</span>
                </div>

                <Field label="Product Name *">
                  <input
                    name="name"
                    required
                    value={form.name}
                    onChange={set}
                    placeholder="e.g. Premium Silk Saree - Royal Blue"
                    className="w-full px-4 py-3 rounded-2xl text-sm bg-slate-900/90 border border-white/10 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-all font-medium"
                  />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Category *">
                    <select
                      name="category"
                      required
                      value={form.category}
                      onChange={set}
                      disabled={categoriesLoading || categories.length === 0}
                      className="w-full px-4 py-3 rounded-2xl text-sm bg-slate-900 border border-white/10 text-slate-100 focus:outline-none focus:border-violet-500 disabled:opacity-60 font-medium cursor-pointer"
                    >
                      {categoriesLoading ? (
                        <option value="" className="bg-slate-900 text-slate-100">
                          Loading categories...
                        </option>
                      ) : categories.length === 0 ? (
                        <option value="" className="bg-slate-900 text-slate-100">
                          No categories found
                        </option>
                      ) : (
                        <>
                          <option value="" className="bg-slate-900 text-slate-100">
                            Select Category...
                          </option>
                          {categories.map((c) => (
                            <option key={c._id} value={c._id} className="bg-slate-900 text-slate-100">
                              {c.name}
                            </option>
                          ))}
                        </>
                      )}
                    </select>
                  </Field>

                  <Field label="Product Badge">
                    <select
                      name="badge"
                      value={form.badge}
                      onChange={set}
                      className="w-full px-4 py-3 rounded-2xl text-sm bg-slate-900 border border-white/10 text-slate-100 focus:outline-none focus:border-violet-500 font-medium cursor-pointer"
                    >
                      <option value="" className="bg-slate-900 text-slate-100">None (Regular)</option>
                      <option value="New" className="bg-slate-900 text-slate-100">🔥 New Arrival</option>
                      <option value="Sale" className="bg-slate-900 text-slate-100">🏷️ On Sale</option>
                      <option value="Best Seller" className="bg-slate-900 text-slate-100">⭐ Best Seller</option>
                    </select>
                  </Field>
                </div>

                <Field label="Product Description *">
                  <textarea
                    name="description"
                    required
                    rows={3}
                    value={form.description}
                    onChange={set}
                    placeholder="Write a compelling, elegant description highlighting fabric, design, and details..."
                    className="w-full px-4 py-3 rounded-2xl text-sm bg-slate-900/90 border border-white/10 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 resize-none font-medium leading-relaxed"
                  />
                </Field>
              </div>

              {/* Pricing & Stock Group */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <h3 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>💰</span> Pricing & Inventory
                  </h3>
                  {discountPercent > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                      {discountPercent}% OFF Calculated
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Selling Price (৳) *">
                    <input
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={form.price}
                      onChange={set}
                      placeholder="e.g. 2490"
                      className="w-full px-4 py-3 rounded-2xl text-sm bg-slate-900/90 border border-white/10 text-amber-400 font-extrabold focus:outline-none focus:border-amber-500"
                    />
                  </Field>

                  <Field label="Original Price (৳) [For Discount Slash]">
                    <input
                      name="originalPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.originalPrice}
                      onChange={set}
                      placeholder="e.g. 3200 (optional)"
                      className="w-full px-4 py-3 rounded-2xl text-sm bg-slate-900/90 border border-white/10 text-slate-300 font-medium focus:outline-none focus:border-violet-500 placeholder-slate-600"
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <Field label="Available Stock Qty">
                    <div className="flex items-center gap-2">
                      <input
                        name="stock"
                        type="number"
                        min="0"
                        step="1"
                        value={form.stock}
                        onChange={set}
                        placeholder="0"
                        className="w-full px-4 py-3 rounded-2xl text-sm bg-slate-900/90 border border-white/10 text-slate-100 font-bold focus:outline-none focus:border-violet-500"
                      />
                      <button
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, stock: String((Number(p.stock) || 0) + 10) }))}
                        className="px-3 py-3 rounded-2xl bg-white/[0.05] hover:bg-white/10 text-xs font-bold text-slate-300 border border-white/8 transition-colors whitespace-nowrap"
                      >
                        +10
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, stock: String((Number(p.stock) || 0) + 50) }))}
                        className="px-3 py-3 rounded-2xl bg-white/[0.05] hover:bg-white/10 text-xs font-bold text-slate-300 border border-white/8 transition-colors whitespace-nowrap"
                      >
                        +50
                      </button>
                    </div>
                  </Field>

                  {/* Badges / Visibility Toggles */}
                  <div className="flex flex-col justify-end gap-2">
                    <Toggle
                      checked={form.inStock}
                      onChange={() => setForm((p) => ({ ...p, inStock: !p.inStock }))}
                      label="In Stock Status"
                    />
                    <Toggle
                      checked={form.isFeatured}
                      onChange={() => setForm((p) => ({ ...p, isFeatured: !p.isFeatured }))}
                      label="Featured on Homepage"
                    />
                    <Toggle
                      checked={form.isVisible}
                      onChange={() => setForm((p) => ({ ...p, isVisible: !p.isVisible }))}
                      label="Visible in Catalog"
                    />
                  </div>
                </div>
              </div>

              {/* Sizes & Colors Quick Chips */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                <h3 className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-white/5">
                  <span>🎨</span> Variant Presets
                </h3>

                <div>
                  <Field label="Sizes (Comma Separated)">
                    <input
                      name="sizes"
                      value={form.sizes}
                      onChange={set}
                      placeholder="e.g. S, M, L, XL"
                      className="w-full px-4 py-3 rounded-2xl text-sm bg-slate-900/90 border border-white/10 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-medium mb-2"
                    />
                  </Field>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-400 mr-1">Quick Select:</span>
                    {presetSizes.map((s) => {
                      const active = form.sizes.split(",").map((x) => x.trim()).includes(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleSizeTag(s)}
                          className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all border ${
                            active
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm"
                              : "bg-white/[0.03] text-slate-400 border-white/8 hover:bg-white/[0.06]"
                          }`}
                        >
                          {active ? `✓ ${s}` : `+ ${s}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Field label="Colors (Comma Separated)">
                    <input
                      name="colors"
                      value={form.colors}
                      onChange={set}
                      placeholder="e.g. Black, White, Navy Blue"
                      className="w-full px-4 py-3 rounded-2xl text-sm bg-slate-900/90 border border-white/10 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-medium mb-2"
                    />
                  </Field>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-400 mr-1">Quick Select:</span>
                    {presetColors.map((c) => {
                      const active = form.colors.split(",").map((x) => x.trim()).includes(c);
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => toggleColorTag(c)}
                          className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all border ${
                            active
                              ? "bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm"
                              : "bg-white/[0.03] text-slate-400 border-white/8 hover:bg-white/[0.06]"
                          }`}
                        >
                          {active ? `✓ ${c}` : `+ ${c}`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Image URLs input */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <h3 className="text-xs font-extrabold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🖼️</span> Image URLs
                </h3>
                <Field label="Image Links (comma-separated URLs) *">
                  <textarea
                    name="images"
                    required
                    rows={2}
                    value={form.images}
                    onChange={set}
                    placeholder="https://images.unsplash.com/photo-1..., https://..."
                    className="w-full px-4 py-3 rounded-2xl text-xs font-mono bg-slate-900/90 border border-white/10 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
                  />
                </Field>
              </div>
            </div>

            {/* Right Column: Live Storefront Card Preview & Image Thumbnails (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Live Preview Header Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-white/[0.03] to-white/[0.01] border border-white/8 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-violet-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span>👁️</span> Live Storefront Card Preview
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Real-Time
                  </span>
                </div>

                {/* Mock Card Preview Container */}
                <div className="w-full bg-slate-900/90 border border-white/10 rounded-2xl overflow-hidden shadow-2xl group">
                  {/* Image aspect ratio container */}
                  <div className="relative aspect-[3/4] w-full bg-slate-950 flex items-center justify-center overflow-hidden">
                    {imageList.length > 0 ? (
                      <img
                        src={imageList[0]}
                        alt="Preview"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=60";
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-slate-600">
                        <span className="text-3xl">🖼️</span>
                        <span className="text-xs font-bold">No Image Provided</span>
                      </div>
                    )}

                    {/* Badge */}
                    {form.badge && (
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-500 text-slate-950 shadow-md">
                        {form.badge}
                      </span>
                    )}

                    {/* Out of stock overlay */}
                    {!form.inStock && (
                      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center">
                        <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Details */}
                  <div className="p-4 space-y-2 bg-slate-900/95">
                    <p className="text-[11px] font-bold text-violet-400 uppercase tracking-wider">
                      {selectedCategoryName}
                    </p>
                    <h4 className="text-sm font-bold text-white line-clamp-1">
                      {form.name || "Product Title Goes Here"}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {form.description || "Product description preview..."}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-base font-extrabold text-amber-400">
                          ৳{numPrice > 0 ? numPrice : "0.00"}
                        </span>
                        {numOrig > numPrice && (
                          <>
                            <span className="text-xs text-slate-500 line-through">
                              ৳{numOrig}
                            </span>
                            {discountPercent > 0 && (
                              <span className="text-[10px] font-bold text-rose-400 bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-500/30">
                                {discountPercent}% OFF
                              </span>
                            )}
                          </>
                        )}
                      </div>
                      {form.stock && (
                        <span className="text-[11px] font-bold text-slate-400">
                          Qty: {form.stock}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Thumbnails Gallery Preview */}
              {imageList.length > 0 && (
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                  <p className="text-xs font-bold text-slate-300">
                    Uploaded Images ({imageList.length})
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {imageList.map((url, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-slate-900"
                      >
                        <img
                          src={url}
                          alt={`Thumbnail ${idx}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&auto=format&fit=crop&q=60";
                          }}
                        />
                        {idx === 0 && (
                          <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-violet-600 text-white text-[9px] font-extrabold">
                            Main
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Modal Action Buttons Footer */}
        <div className="flex items-center justify-end gap-3 px-6 sm:px-8 py-4 border-t border-white/8 bg-slate-950">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 border border-white/10 rounded-2xl text-xs font-bold text-slate-300 hover:bg-white/[0.04] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="product-form"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-xs font-extrabold rounded-2xl shadow-lg shadow-violet-600/30 transition-all disabled:opacity-60"
          >
            {saving ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving Product...
              </>
            ) : (
              <>
                <span>✨</span> {product ? "Save Changes" : "Publish Product"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-400 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

// â”€â”€â”€ Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function ProductsContent() {
  const { apiFetch } = useAdminAuth();
  const searchParams = useSearchParams();
  const filterCategoryId = searchParams.get("category");
  const filterCategoryName = searchParams.get("categoryName");

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [modalProduct, setModalProduct] = useState<Product | null | "new">(
    null,
  );
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "12" });
      if (filterCategoryId) params.set("category", filterCategoryId);
      const res = await apiFetch<{
        success: boolean;
        data: Product[];
        pagination: { total: number; pages: number };
      }>(`/admin/products?${params.toString()}`);
      setProducts(res.data);
      setPagination({
        total: res.pagination.total,
        pages: res.pagination.pages,
      });
    } catch (e: unknown) {
      showToast(
        "error",
        e instanceof Error ? e.message : "Failed to load products",
      );
    } finally {
      setLoading(false);
    }
  }, [apiFetch, page, filterCategoryId]);

  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const res = await apiFetch<{ success: boolean; data: Category[] }>(
        "/categories",
      );
      let cats = res.data;
      // If filtering by a sub-category not in the root list, inject it from URL params
      if (
        filterCategoryId &&
        filterCategoryName &&
        !cats.find((c) => c._id === filterCategoryId)
      ) {
        cats = [
          ...cats,
          { _id: filterCategoryId, name: filterCategoryName, slug: "" },
        ];
      }
      setCategories(cats);
    } catch {
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  }, [apiFetch, filterCategoryId, filterCategoryName]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSave = async (data: Partial<Product>, id?: string) => {
    try {
      if (id) {
        await apiFetch(`/products/${id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
        showToast("success", "Product updated");
      } else {
        await apiFetch("/products", {
          method: "POST",
          body: JSON.stringify(data),
        });
        showToast("success", "Product created");
      }
      setModalProduct(null);
      fetchProducts();
    } catch (e: unknown) {
      showToast("error", e instanceof Error ? e.message : "Save failed");
      throw e;
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await apiFetch(`/products/${deleteId}`, { method: "DELETE" });
      showToast("success", "Product deleted");
      setDeleteId(null);
      fetchProducts();
    } catch (e: unknown) {
      showToast("error", e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const toggleVisibility = async (product: Product) => {
    try {
      await apiFetch(`/products/${product._id}`, {
        method: "PUT",
        body: JSON.stringify({ isVisible: !product.isVisible }),
      });
      setProducts((prev) =>
        prev.map((p) =>
          p._id === product._id ? { ...p, isVisible: !p.isVisible } : p,
        ),
      );
      showToast(
        "success",
        product.isVisible
          ? "Product hidden from store"
          : "Product visible on store",
      );
    } catch (e: unknown) {
      showToast("error", e instanceof Error ? e.message : "Update failed");
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6">
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      <div className="flex items-center justify-between gap-4">
        <div>
          {filterCategoryName && (
            <div className="flex items-center gap-2 mb-1">
              <a
                href="/admin/categories"
                className="text-xs text-slate-400 hover:text-slate-300 transition-colors"
              >
                Categories
              </a>
              <span className="text-slate-300 text-xs">&gt;</span>
              <span className="text-xs font-semibold text-violet-400">
                {filterCategoryName}
              </span>
            </div>
          )}
          <p className="text-sm text-slate-400 font-medium">
            {pagination.total} product{pagination.total !== 1 ? "s" : ""}
            {filterCategoryName ? ` in "${filterCategoryName}"` : " in store"}
          </p>
        </div>
        <button
          onClick={() => setModalProduct("new")}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-sm font-bold hover:from-violet-700 hover:to-indigo-700 transition-all hover:shadow-lg hover:shadow-violet-300/40 hover:-translate-y-0.5"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          Add Product
        </button>
      </div>

      <div
        className="rounded-2xl  overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-[2.5px] border-white/8 border-t-violet-500 rounded-full animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <svg
              className="w-12 h-12 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
              />
            </svg>
            <p className="text-sm font-medium">No products yet</p>
            <button
              onClick={() => setModalProduct("new")}
              className="mt-3 text-violet-400 text-sm hover:underline font-bold"
            >
              Add your first product -&gt;
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  {[
                    "Product",
                    "Category",
                    "Price",
                    "Badge",
                    "Stock Qty",
                    "Orders",
                    "Featured",
                    "Visible",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-[0.08em] px-5 py-4"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {products.map((p) => (
                  <tr
                    key={p._id}
                    className={`hover:bg-violet-50/20 transition-colors duration-100 group ${!p.isVisible ? "opacity-60" : ""}`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl overflow-hidden bg-white/[0.04] relative flex-shrink-0">
                          {p.images[0] ? (
                            <Image
                              src={p.images[0]}
                              alt={p.name}
                              fill
                              className="object-cover"
                              sizes="44px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 max-w-xs sm:max-w-sm">
                          <p className="text-sm font-semibold text-slate-100 line-clamp-1" title={p.name}>
                            {p.name}
                          </p>
                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mt-0.5" title={p.description}>
                            {p.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-400 font-medium capitalize">
                      {typeof p.category === "object"
                        ? p.category.name
                        : p.category}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="text-sm font-black text-slate-100">
                        ৳{p.price}
                      </span>
                      {p.originalPrice && p.originalPrice > p.price && (
                        <>
                          <span className="text-xs text-slate-500 line-through ml-1.5">
                            ৳{p.originalPrice}
                          </span>
                          <span className="ml-1.5 text-[10px] font-extrabold text-rose-400 bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-500/30">
                            {Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)}% OFF
                          </span>
                        </>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {p.badge ? (
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${BADGE_STYLE[p.badge] ?? "bg-white/[0.06] text-slate-300"}`}
                        >
                          {p.badge}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium text-slate-500 bg-white/[0.02] border border-white/5">
                          None
                        </span>
                      )}
                    </td>
                    {/* Stock Qty */}
                    <td className="px-5 py-4">
                      {(() => {
                        const qty = p.stock ?? 0;
                        if (!p.inStock)
                          return (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-rose-400 bg-rose-950/30 border border-rose-500/20">
                              Out of stock
                            </span>
                          );
                        if (qty === 0)
                          return (
                            <span className="text-xs text-slate-500">0</span>
                          );
                        const color =
                          qty <= 3
                            ? "text-rose-400 font-bold"
                            : qty <= 10
                              ? "text-amber-400 font-semibold"
                              : "text-emerald-400 font-semibold";
                        return (
                          <span className={`text-sm ${color}`}>{qty}</span>
                        );
                      })()}
                    </td>
                    {/* Total Ordered */}
                    <td className="px-5 py-4">
                      <span className="text-sm font-semibold text-slate-300">
                        {(p.totalOrdered ?? 0).toLocaleString()}
                      </span>
                    </td>
                    {/* Featured */}
                    <td className="px-5 py-4">
                      {p.isFeatured ? (
                        <span
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{
                            background: "rgba(251,191,36,0.12)",
                            color: "#fbbf24",
                            border: "1px solid rgba(251,191,36,0.2)",
                          }}
                        >
                          <svg
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          Featured
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium text-slate-500 bg-white/[0.03] border border-white/5">
                          Standard
                        </span>
                      )}
                    </td>
                    {/* Visibility toggle */}
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={p.isVisible}
                        onClick={() => toggleVisibility(p)}
                        title={
                          p.isVisible
                            ? "Click to hide from store"
                            : "Click to show on store"
                        }
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          p.isVisible
                            ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/30 hover:bg-emerald-900/50"
                            : "bg-white/[0.04] text-slate-400 border-white/10 hover:bg-white/[0.08]"
                        }`}
                      >
                        <span
                          className={`relative inline-block w-6 h-3.5 rounded-full transition-colors ${
                            p.isVisible ? "bg-emerald-500" : "bg-slate-700"
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-2.5 h-2.5 bg-white rounded-full transition-transform ${
                              p.isVisible ? "translate-x-2.5" : "translate-x-0"
                            }`}
                          />
                        </span>
                        <span>{p.isVisible ? "Visible" : "Hidden"}</span>
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => setModalProduct(p)}
                          aria-label={`Edit ${p.name}`}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-200 bg-white/[0.06] border border-white/10 rounded-xl hover:bg-white/[0.12] hover:text-white transition-all shadow-sm flex items-center gap-1"
                        >
                          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteId(p._id)}
                          aria-label={`Delete ${p.name}`}
                          className="px-3 py-1.5 text-xs font-semibold text-rose-400 bg-rose-950/30 border border-rose-500/20 rounded-xl hover:bg-rose-900/40 hover:text-rose-300 transition-all shadow-sm flex items-center gap-1"
                        >
                          <svg className="w-3.5 h-3.5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 bg-white/[0.01]">
            <p className="text-sm text-slate-500">
              Page <span className="font-bold text-slate-300">{page}</span> of{" "}
              {pagination.pages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-xs font-semibold border border-slate-800 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Previous
              </button>
              <button
                onClick={() =>
                  setPage((p) => Math.min(pagination.pages, p + 1))
                }
                disabled={page === pagination.pages}
                className="px-4 py-2 text-xs font-semibold border border-slate-800 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                Next
                <svg
                  className="w-3.5 h-3.5"
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
              </button>
            </div>
          </div>
        )}
      </div>

      {modalProduct !== null && (
        <ProductModal
          product={modalProduct === "new" ? null : modalProduct}
          defaultCategoryId={
            modalProduct === "new" ? (filterCategoryId ?? undefined) : undefined
          }
          categories={categories}
          categoriesLoading={categoriesLoading}
          onClose={() => setModalProduct(null)}
          onSave={handleSave}
        />
      )}

      {deleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm  p-4"
          style={{ background: "rgba(0,0,0,0.7)" }}
        >
          <div
            className="rounded-3xl shadow-2xl  w-full max-w-sm p-8"
            style={{
              background: "rgba(15,15,25,0.98)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div className="w-14 h-14 rounded-2xl bg-red-900/25 flex items-center justify-center mb-5">
              <svg
                className="w-7 h-7 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-2">
              Delete Product
            </h3>
            <p className="text-sm text-slate-500 mb-7">
              This will permanently remove the product from your store.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-5 py-3 border border-white/8 rounded-2xl text-sm font-semibold text-slate-300 hover:bg-white/[0.02]"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-5 py-3 bg-red-600 text-white rounded-2xl text-sm font-semibold hover:bg-red-700 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deleting && (
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <AdminAuthGuard>
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-[2.5px] border-white/8 border-t-violet-500 rounded-full animate-spin" />
          </div>
        }
      >
        <ProductsContent />
      </Suspense>
    </AdminAuthGuard>
  );
}
