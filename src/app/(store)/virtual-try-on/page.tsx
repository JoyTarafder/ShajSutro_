"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  UploadCloud,
  Camera,
  Shirt,
  User,
  ShoppingCart,
  Heart,
  Download,
  Eye,
  RotateCcw,
  Trash2,
  Check,
  CheckCircle2,
  Clock,
  ArrowRight,
  Loader2,
  AlertCircle,
  Search,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { notifyInfo, notifySuccess } from "@/lib/notify";
import { getApiBase } from "@/lib/apiBase";
import { products as fallbackProducts } from "@/data/products";
import { Product } from "@/types";

// ─── Garment Option ───────────────────────────────────────────────────────────

interface GarmentOption {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  fabric: string;
  colors: string[];
  sizes: string[];
}

interface TryOnHistoryItem {
  id: string;
  garmentId: string;
  garmentName: string;
  garmentPrice: number;
  garmentImg: string;
  resultUrl: string;
  timestamp: number;
}

// Helper to clean category name for Virtual Try-On filter tabs
function formatGarmentCategory(rawCat?: string): string {
  if (!rawCat) return "Womens";
  const lower = rawCat.toLowerCase();
  if (lower.includes("saree")) return "Saree";
  if (lower.includes("panjabi")) return "Panjabi";
  if (lower.includes("kurti")) return "Kurti";
  if (lower.includes("kid") || lower.includes("boy") || lower.includes("girl")) return "Kids";
  if (lower.includes("men")) return "Mens";
  if (lower.includes("women")) return "Womens";
  return rawCat.replace(/^./, (c) => c.toUpperCase());
}

// Initial garment list using real ShajSutro products
const INITIAL_GARMENTS: GarmentOption[] = fallbackProducts.map((p) => ({
  id: p.id,
  name: p.name,
  category: formatGarmentCategory(p.category),
  price: p.price,
  originalPrice: p.originalPrice,
  imageUrl: p.images?.[0] || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800",
  fabric: p.description ? p.description.slice(0, 45).replace(/\n/g, " ") + "..." : "Authentic ShajSutro Collection",
  colors: p.colors?.length ? p.colors : ["Original"],
  sizes: p.sizes?.length ? p.sizes : ["Regular"],
}));


// Helper to compress image in browser for fast upload & AI processing
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const maxDim = 1100;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function VirtualTryOnPage() {
  const { addItem, openCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  // All Website Products state
  const [garments, setGarments] = useState<GarmentOption[]>(INITIAL_GARMENTS);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // User uploaded photo
  const [uploadedPhotoBase64, setUploadedPhotoBase64] = useState<string | null>(null);
  const [uploadedPublicUrl, setUploadedPublicUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [isPreUploading, setIsPreUploading] = useState<boolean>(false);

  // Selected Garment
  const [selectedGarment, setSelectedGarment] = useState<GarmentOption>(INITIAL_GARMENTS[0]);

  // Stage View tab: "result" | "user_photo" | "garment"
  const [activeView, setActiveView] = useState<"result" | "user_photo" | "garment">("user_photo");

  // AI states
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [aiResultUrl, setAiResultUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quick Compare (Hold to view original photo)
  const [showOriginalComparison, setShowOriginalComparison] = useState<boolean>(false);

  // Recent Looks History in this session
  const [recentLooks, setRecentLooks] = useState<TryOnHistoryItem[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const elapsedTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ─── Fetch All Products from the Website Database ───────────────────────────
  useEffect(() => {
    setIsLoadingProducts(true);
    fetch("/api/products?limit=100")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const prods: GarmentOption[] = data.data
            .filter((p: { images?: string[]; inStock?: boolean }) => Array.isArray(p.images) && p.images.length > 0)
            .map((p: {
              _id?: string;
              id?: string;
              name: string;
              price: number;
              originalPrice?: number;
              category?: { name?: string; slug?: string } | string;
              images: string[];
              description?: string;
              colors?: string[];
              sizes?: string[];
            }) => {
              const catRaw = typeof p.category === "object" && p.category
                ? p.category.name || p.category.slug
                : p.category;
              const catClean = formatGarmentCategory(catRaw);

              return {
                id: p._id || p.id || `prod-${Math.random()}`,
                name: p.name,
                price: p.price,
                originalPrice: p.originalPrice,
                category: catClean,
                imageUrl: p.images[0],
                fabric: p.description ? p.description.slice(0, 45).replace(/\n/g, " ") + "..." : "Authentic ShajSutro Collection",
                colors: p.colors?.length ? p.colors : ["Original"],
                sizes: p.sizes?.length ? p.sizes : ["Regular"],
              };
            });

          if (prods.length > 0) {
            setGarments(prods);
            setSelectedGarment(prods[0]);
          }
        }
      })
      .catch((err) => {
        console.warn("API product fetch notice (using real pre-loaded catalog):", err);
      })
      .finally(() => setIsLoadingProducts(false));
  }, []);

  // Reset results when selected garment changes
  useEffect(() => {
    setAiResultUrl(null);
    setErrorMessage(null);
    if (uploadedPhotoBase64) {
      setActiveView("user_photo");
    }
  }, [selectedGarment, uploadedPhotoBase64]);

  // Clean timers on unmount
  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    };
  }, []);

  // Dynamically derive categories from all website products
  const categories = useMemo(() => {
    const cats = new Set<string>();
    garments.forEach((g) => {
      if (g.category) cats.add(g.category);
    });
    return ["All", ...Array.from(cats)];
  }, [garments]);

  // Filter garments by category and search
  const filteredGarments = useMemo(() => {
    let list = garments;
    if (activeCategory !== "All") {
      list = list.filter(
        (g) => g.category.toLowerCase() === activeCategory.toLowerCase()
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [garments, activeCategory, searchQuery]);

  // Progress message & dynamic percentage calculation (5% -> 98%)
  const progressStage = useMemo(() => {
    let pct = 5;
    if (elapsedSeconds <= 3) {
      pct = 5 + elapsedSeconds * 5; // 5% -> 20%
    } else if (elapsedSeconds <= 10) {
      pct = 20 + Math.round(((elapsedSeconds - 3) / 7) * 35); // 20% -> 55%
    } else if (elapsedSeconds <= 20) {
      pct = 55 + Math.round(((elapsedSeconds - 10) / 10) * 35); // 55% -> 90%
    } else {
      pct = Math.min(98, 90 + Math.round((elapsedSeconds - 20) * 0.8)); // 90% -> 98%
    }

    let text = "Analyzing body silhouette & posture...";
    let step = "1/3";
    if (pct >= 40 && pct < 75) {
      step = "2/3";
      text = `Draping ${selectedGarment.name} with AI neural lighting...`;
    } else if (pct >= 75) {
      step = "3/3";
      text = "Refining fabric textures, pleats & shadows...";
    }

    return { step, text, pct };
  }, [elapsedSeconds, selectedGarment.name]);

  // Handle user photo upload with instant compression & background pre-upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        notifyInfo("Please select an image file (JPG, PNG, or WEBP).");
        return;
      }
      setUploadedFileName(file.name);
      try {
        const compressedBase64 = await compressImage(file);
        setUploadedPhotoBase64(compressedBase64);
        setUploadedPublicUrl(null);
        setAiResultUrl(null);
        setErrorMessage(null);
        setActiveView("user_photo");
        notifySuccess("Photo loaded! Pre-optimizing for instant try-on... ✨");

        // Background Pre-Upload: convert to public URL while user selects outfit
        setIsPreUploading(true);
        fetch("/api/virtual-try-on", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "uploadOnly",
            personImageUrl: compressedBase64,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success && data.publicUrl) {
              setUploadedPublicUrl(data.publicUrl);
              console.log("Background pre-upload completed:", data.publicUrl);
            }
          })
          .catch((err) => console.warn("Background pre-upload error:", err))
          .finally(() => setIsPreUploading(false));
      } catch {
        notifyInfo("Failed to process image. Please try another photo.");
      }
    }
  };

  // Remove photo
  const handleRemovePhoto = () => {
    setUploadedPhotoBase64(null);
    setUploadedPublicUrl(null);
    setUploadedFileName("");
    setAiResultUrl(null);
    setActiveView("user_photo");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Cancel generation
  const handleCancelGeneration = () => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    setIsGenerating(false);
    setElapsedSeconds(0);
    notifyInfo("Try-On request cancelled.");
  };

  // Main Action: TRY ON
  const handleGenerateTryOn = async () => {
    if (!uploadedPhotoBase64) {
      notifyInfo("Please upload your photo first!");
      fileInputRef.current?.click();
      return;
    }

    if (isGenerating) return;

    setErrorMessage(null);
    setIsGenerating(true);
    setElapsedSeconds(0);

    elapsedTimerRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);

    try {
      // Use already pre-uploaded public URL if ready, otherwise base64
      const personPayload = uploadedPublicUrl || uploadedPhotoBase64;

      const res = await fetch("/api/virtual-try-on", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personImageUrl: personPayload,
          garmentImageUrl: selectedGarment.imageUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success || !data.orderId) {
        throw new Error(data.error || "AI Try-On service rejected the request");
      }

      if (data.uploadedPersonUrl && !uploadedPublicUrl) {
        setUploadedPublicUrl(data.uploadedPersonUrl);
      }

      const orderId = data.orderId;

      // Smart polling every 2.5s for fast response
      let attempts = 0;
      const maxAttempts = 45; // ~110s

      pollTimerRef.current = setInterval(async () => {
        attempts += 1;

        try {
          const statusRes = await fetch("/api/virtual-try-on/status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId, keyIndex: data.keyIndex }),
          });

          const statusData = await statusRes.json();

          // When AI finishes and outputs the image
          if (statusData.outputUrl) {
            if (pollTimerRef.current) clearInterval(pollTimerRef.current);
            if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
            setAiResultUrl(statusData.outputUrl);
            setIsGenerating(false);
            setActiveView("result");
            notifySuccess("Dress fitted onto your photo! ✨");

            // Save to recent looks history
            setRecentLooks((prev) => [
              {
                id: `look-${Date.now()}`,
                garmentId: selectedGarment.id,
                garmentName: selectedGarment.name,
                garmentPrice: selectedGarment.price,
                garmentImg: selectedGarment.imageUrl,
                resultUrl: statusData.outputUrl,
                timestamp: Date.now(),
              },
              ...prev.filter((item) => item.garmentId !== selectedGarment.id),
            ]);
            return;
          }

          if (statusData.status === "FAIL") {
            if (pollTimerRef.current) clearInterval(pollTimerRef.current);
            if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
            setIsGenerating(false);
            const failMsg = statusData.raw?.message || statusData.error || "AI could not process this photo. Please try a clearer front portrait.";
            setErrorMessage(failMsg);
            notifyInfo("Could not complete try-on. Please try again.");
            return;
          }

          if (attempts >= maxAttempts) {
            if (pollTimerRef.current) clearInterval(pollTimerRef.current);
            if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
            setIsGenerating(false);
            setErrorMessage("Request timed out. Please try again.");
            notifyInfo("Request timed out.");
          }
        } catch (pollErr) {
          console.warn("Polling error:", pollErr);
        }
      }, 2500);
    } catch (err: unknown) {
      console.error("Try-on initiation error:", err);
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
      setIsGenerating(false);
      setErrorMessage(err instanceof Error ? err.message : "Error connecting to AI Try-On service");
      notifyInfo("Could not initiate AI try-on.");
    }
  };

  // Add to cart
  const handleAddToCart = () => {
    const productPayload: Product = {
      id: selectedGarment.id,
      name: selectedGarment.name,
      price: selectedGarment.price,
      originalPrice: selectedGarment.originalPrice,
      category: selectedGarment.category,
      images: [selectedGarment.imageUrl],
      sizes: selectedGarment.sizes,
      colors: selectedGarment.colors,
      description: `${selectedGarment.fabric}. Verified in Virtual Try-On Studio.`,
      rating: 5.0,
      reviews: 32,
      inStock: true,
      tags: ["virtual-try-on", "ai-try-on", selectedGarment.category],
    };

    addItem(
      productPayload,
      selectedGarment.sizes[0] || "Regular",
      selectedGarment.colors[0] || "Default",
      1
    );
    notifySuccess(`Added ${selectedGarment.name} to your cart! 🛒`);
    openCart();
  };

  // Download AI Result Image
  const handleDownloadResult = () => {
    if (!aiResultUrl) return;
    const a = document.createElement("a");
    a.href = aiResultUrl;
    a.download = `shajsutro-tryon-${selectedGarment.name.toLowerCase().replace(/\s+/g, "-")}.png`;
    a.target = "_blank";
    a.click();
  };

  // Image to display in Preview Stage
  const stageImageSrc = useMemo(() => {
    if (showOriginalComparison && uploadedPhotoBase64) {
      return uploadedPhotoBase64;
    }
    if (activeView === "user_photo") {
      return uploadedPhotoBase64 || null;
    }
    if (activeView === "garment") {
      return selectedGarment.imageUrl;
    }
    // "result"
    return aiResultUrl || null;
  }, [activeView, aiResultUrl, uploadedPhotoBase64, selectedGarment, showOriginalComparison]);

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-900 selection:bg-amber-100 selection:text-amber-900 pb-28">
      {/* ─── Header ─── */}
      <div className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold uppercase tracking-wider mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin" style={{ animationDuration: "6s" }} />
              <span>AI Virtual Try-On Studio</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
              AI Virtual Try-On
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Upload your photo, select any outfit from the collection, and try it on instantly!
            </p>
          </div>

          <Link
            href="/shop"
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors"
          >
            <span>Browse Shop</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* ══════════════════════════════════════════════════════════════
              LEFT: PREVIEW STAGE (col-span-6)
              ══════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-6 flex flex-col gap-4 h-full min-h-full">
            <div className="relative bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm">
              {/* Top View Toggle Tabs */}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50/80 border-b border-slate-200">
                <div className="flex items-center gap-1 p-1 rounded-xl bg-white border border-slate-200 text-xs shadow-2xs">
                  {/* AI Result Tab */}
                  <button
                    type="button"
                    onClick={() => {
                      if (aiResultUrl) {
                        setActiveView("result");
                      } else if (!uploadedPhotoBase64) {
                        notifyInfo("Please upload your photo first!");
                        fileInputRef.current?.click();
                      } else {
                        notifyInfo("Click 'TRY ON' button to generate result!");
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-all font-medium cursor-pointer flex items-center gap-1.5 ${
                      activeView === "result"
                        ? "bg-slate-900 text-white font-semibold shadow-xs"
                        : aiResultUrl
                        ? "text-emerald-700 hover:text-slate-900"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Try-On Result</span>
                    {aiResultUrl && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                  </button>

                  {/* Your Photo Tab */}
                  <button
                    type="button"
                    onClick={() => setActiveView("user_photo")}
                    className={`px-3 py-1.5 rounded-lg transition-all font-medium cursor-pointer flex items-center gap-1.5 ${
                      activeView === "user_photo"
                        ? "bg-slate-900 text-white font-semibold shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Your Photo</span>
                  </button>

                  {/* Garment Tab */}
                  <button
                    type="button"
                    onClick={() => setActiveView("garment")}
                    className={`px-3 py-1.5 rounded-lg transition-all font-medium cursor-pointer flex items-center gap-1.5 ${
                      activeView === "garment"
                        ? "bg-slate-900 text-white font-semibold shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Shirt className="w-3.5 h-3.5" />
                    <span>Selected Dress</span>
                  </button>
                </div>

                <span className="text-[11px] font-mono text-slate-500 hidden sm:inline-block">
                  {aiResultUrl
                    ? "✓ AI Result Ready"
                    : uploadedPhotoBase64
                    ? (isPreUploading ? "Optimizing photo..." : "Photo Ready")
                    : "Upload Photo First"}
                </span>
              </div>

              {/* Viewport Area */}
              <div className="relative aspect-[3/4] w-full bg-slate-100 flex items-center justify-center overflow-hidden">
                {/* Generation Loading Overlay */}
                {isGenerating && (
                  <div className="absolute inset-0 z-30 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none">
                    <div className="relative w-20 h-20 mb-5">
                      <div className="absolute inset-0 rounded-full border-4 border-slate-200" />
                      <div className="absolute inset-0 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin" />
                      <div className="absolute inset-2 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700">
                        <Sparkles className="w-6 h-6 animate-pulse" />
                      </div>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
                      AI is Dressing Your Photo...
                    </h3>
                    <p className="text-xs text-emerald-700 font-semibold mb-1">
                      {progressStage.text}
                    </p>
                    <p className="text-[11px] text-slate-500 font-light mb-4">
                      Fitting &ldquo;{selectedGarment.name}&rdquo; • {elapsedSeconds}s elapsed
                    </p>

                    {/* Progress Bar & Live Percentage */}
                    <div className="w-64 space-y-1.5 mb-5">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 px-0.5">
                        <span className="text-emerald-700 font-bold">Step {progressStage.step}</span>
                        <span className="font-mono text-emerald-800 font-bold text-xs bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shadow-2xs">
                          {progressStage.pct}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden p-0.5 border border-slate-200">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 transition-all duration-500 rounded-full"
                          style={{ width: `${progressStage.pct}%` }}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleCancelGeneration}
                      className="px-4 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {/* Case 1: Active view is "result" but AI hasn't been generated yet */}
                {activeView === "result" && !aiResultUrl ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 mb-4 shadow-2xs">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <h4 className="text-sm font-semibold text-slate-900 mb-1">
                      No Try-On Generated Yet
                    </h4>
                    <p className="text-xs text-slate-500 max-w-xs font-light mb-5">
                      {uploadedPhotoBase64
                        ? "Click the button below to dress your photo with this outfit!"
                        : "Upload your photo first in Step 1 to generate your try-on look."}
                    </p>

                    <button
                      type="button"
                      disabled={isGenerating}
                      onClick={handleGenerateTryOn}
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>TRY ON</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : !stageImageSrc ? (
                  /* Case 2: No photo uploaded yet */
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center p-8 text-center cursor-pointer group"
                  >
                    <div className="w-20 h-20 rounded-2xl bg-white border-2 border-dashed border-slate-300 group-hover:border-emerald-500 group-hover:bg-emerald-50/40 flex items-center justify-center text-slate-400 group-hover:text-emerald-600 mb-4 transition-all shadow-2xs">
                      <UploadCloud className="w-8 h-8" />
                    </div>
                    <h4 className="text-sm font-semibold text-slate-900 mb-1">
                      No Photo Uploaded Yet
                    </h4>
                    <p className="text-xs text-slate-500 max-w-xs font-light mb-4">
                      Upload your portrait or full-body picture to see the try-on.
                    </p>
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold uppercase tracking-wider group-hover:bg-emerald-600 group-hover:text-white transition-all">
                      <Camera className="w-3.5 h-3.5" />
                      <span>Upload Photo</span>
                    </span>
                  </div>
                ) : (
                  /* Case 3: Display the image (AI Result, User Photo, or Garment) */
                  <Image
                    src={stageImageSrc}
                    alt={selectedGarment.name}
                    fill
                    unoptimized={true}
                    priority
                    className="object-cover object-top transition-all duration-300"
                  />
                )}

                {/* Floating Bottom Info Badge */}
                <div className="absolute bottom-4 left-4 z-10 px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-md max-w-[55%]">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {showOriginalComparison
                      ? "Original Photo (Hold/Toggle)"
                      : activeView === "result" && aiResultUrl
                      ? "AI Fitted Look"
                      : activeView === "user_photo"
                      ? (uploadedPhotoBase64 ? "Your Uploaded Photo" : "Upload Required")
                      : selectedGarment.name}
                  </p>
                  <p className="text-[10px] text-slate-500 font-light truncate">
                    {activeView === "result" && aiResultUrl
                      ? `${selectedGarment.name} • ৳${selectedGarment.price.toLocaleString()}`
                      : activeView === "user_photo"
                      ? (uploadedFileName || "Front Portrait")
                      : selectedGarment.fabric}
                  </p>
                </div>

                {/* Download Button on Bottom-Right */}
                {aiResultUrl && activeView === "result" && (
                  <button
                    type="button"
                    onClick={handleDownloadResult}
                    className="absolute bottom-4 right-4 z-10 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                )}

                {/* Compare Button on Top-Right when AI Result exists */}
                {aiResultUrl && activeView === "result" && (
                  <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5">
                    <button
                      type="button"
                      onMouseDown={() => setShowOriginalComparison(true)}
                      onMouseUp={() => setShowOriginalComparison(false)}
                      onTouchStart={() => setShowOriginalComparison(true)}
                      onTouchEnd={() => setShowOriginalComparison(false)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/90 hover:bg-white border border-slate-200 text-slate-700 text-xs font-semibold shadow-sm transition-all cursor-pointer select-none"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{showOriginalComparison ? "Showing Original" : "Hold: Compare"}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions (Add to Cart & Favorite) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between gap-3 shadow-xs !mt-auto h-[76px]">
              <div>
                <span className="text-xs text-slate-500 block">Selected Outfit:</span>
                <span className="text-xl sm:text-2xl font-bold font-serif text-slate-900">
                  ৳{selectedGarment.price.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    toggleFavorite(selectedGarment.id);
                    notifyInfo(
                      isFavorite(selectedGarment.id)
                        ? "Removed from favorites"
                        : "Saved to your favorites! ❤️"
                    );
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isFavorite(selectedGarment.id)
                      ? "bg-rose-50 border-rose-200 text-rose-600"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                  aria-label="Favorite outfit"
                >
                  <Heart
                    className="w-5 h-5"
                    fill={isFavorite(selectedGarment.id) ? "currentColor" : "none"}
                  />
                </button>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>ADD TO CART</span>
                </button>
              </div>
            </div>

            {/* Recent Generated Looks History (if any) */}
            {recentLooks.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Your Generated Looks ({recentLooks.length})</span>
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                  {recentLooks.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setAiResultUrl(item.resultUrl);
                        setActiveView("result");
                        const matched = garments.find((g) => g.id === item.garmentId);
                        if (matched) setSelectedGarment(matched);
                      }}
                      className={`relative w-14 h-18 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer ${
                        aiResultUrl === item.resultUrl
                          ? "border-emerald-600 ring-2 ring-emerald-600/30 scale-105 shadow-sm"
                          : "border-slate-200 opacity-80 hover:opacity-100"
                      }`}
                      title={item.garmentName}
                    >
                      <Image
                        src={item.resultUrl}
                        alt={item.garmentName}
                        fill
                        unoptimized={true}
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-center flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <p className="text-xs text-rose-700 font-medium">{errorMessage}</p>
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════════════
              RIGHT: 2-STEP SELECTION PANEL (col-span-6)
              ══════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-6 flex flex-col gap-4 h-full min-h-full">
            {/* ─── STEP 1: UPLOAD YOUR PHOTO ─── */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-600" />
                  <span>Step 1: Upload Your Photo</span>
                </h2>
                {uploadedPhotoBase64 && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </div>

              {uploadedPhotoBase64 ? (
                /* Photo Uploaded Preview Card */
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="w-16 h-16 rounded-xl overflow-hidden relative border border-slate-200 flex-shrink-0 shadow-2xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={uploadedPhotoBase64}
                      alt="Your uploaded photo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {uploadedFileName || "Your Uploaded Photo"}
                    </p>
                    <p className="text-[11px] text-emerald-700 font-medium mt-0.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{isPreUploading ? "Pre-optimizing cloud link..." : "Ready for AI Try-On"}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 border border-slate-200 transition-colors shadow-2xs cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Change</span>
                  </button>
                </div>
              ) : (
                /* Empty Upload Dropzone */
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-6 rounded-2xl border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/50 hover:bg-emerald-50/20 text-center cursor-pointer transition-all group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 group-hover:border-emerald-500 flex items-center justify-center text-slate-400 group-hover:text-emerald-600 mx-auto mb-2 transition-all shadow-2xs">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                    Click to Upload Your Photo
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 font-light">
                    Upload a clear front-facing portrait or full-body picture (JPG, PNG)
                  </p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>

            {/* ─── STEP 2: CHOOSE OUTFIT (ALL WEBSITE PRODUCTS) ─── */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-sm space-y-3 flex-1 flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Shirt className="w-4 h-4 text-emerald-600" />
                  <span>Step 2: Choose Outfit</span>
                  <span className="text-[11px] font-normal text-slate-400 lowercase">
                    ({filteredGarments.length} items)
                  </span>
                </h2>

                {/* Quick Search */}
                <div className="relative w-full sm:w-44">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search outfit..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Dynamic Category Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-[11px] transition-all cursor-pointer font-medium whitespace-nowrap ${
                      activeCategory.toLowerCase() === cat.toLowerCase()
                        ? "bg-slate-900 text-white shadow-2xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Garments Grid with Website Products */}
              <div className="grid grid-cols-3 gap-2.5 max-h-[420px] lg:max-h-[430px] flex-1 overflow-y-auto pr-1 scrollbar-thin">
                {isLoadingProducts ? (
                  Array.from({ length: 9 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-200 p-2 bg-white animate-pulse"
                    >
                      <div className="aspect-[3/4] rounded-lg bg-slate-100 mb-1.5" />
                      <div className="h-3 bg-slate-200 rounded w-4/5 mb-1.5" />
                      <div className="h-2.5 bg-slate-200 rounded w-1/2" />
                    </div>
                  ))
                ) : filteredGarments.length === 0 ? (
                  <div className="col-span-3 py-8 text-center text-xs text-slate-500">
                    No outfits found matching &ldquo;{searchQuery || activeCategory}&rdquo;.
                  </div>
                ) : (
                  filteredGarments.map((garment) => {
                    const isSel = selectedGarment.id === garment.id;
                    return (
                      <div
                        key={garment.id}
                        onClick={() => {
                          setSelectedGarment(garment);
                          if (uploadedPhotoBase64) {
                            setActiveView("user_photo");
                          } else {
                            setActiveView("garment");
                          }
                        }}
                        className={`group rounded-xl border p-2 cursor-pointer transition-all text-left ${
                          isSel
                            ? "bg-emerald-50/60 border-emerald-600 ring-2 ring-emerald-600/30 shadow-xs"
                            : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs"
                        }`}
                      >
                        <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-1.5 bg-slate-100">
                          <Image
                            src={garment.imageUrl}
                            alt={garment.name}
                            fill
                            unoptimized={true}
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                          {isSel && (
                            <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          )}
                        </div>
                        <h4 className="text-[11px] font-semibold text-slate-900 line-clamp-1" title={garment.name}>
                          {garment.name}
                        </h4>
                        <p className="text-[10px] text-emerald-700 font-bold font-serif">
                          ৳{garment.price.toLocaleString()}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* ─── PRIMARY TRIGGER: TRY ON ─── */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center shadow-xs !mt-auto h-[76px]">
              <button
                type="button"
                disabled={isGenerating}
                onClick={handleGenerateTryOn}
                className="w-full h-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md shadow-emerald-600/20 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>TRYING ON ({elapsedSeconds}s)...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-amber-300" />
                    <span>TRY ON</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
