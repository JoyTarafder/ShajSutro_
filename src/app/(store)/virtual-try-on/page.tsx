"use client";

import { useState } from "react";
import Link from "next/link";

export default function VirtualTryOnPage() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <div className="min-h-screen bg-[#071912] text-white relative overflow-hidden flex flex-col justify-between selection:bg-amber-400 selection:text-emerald-950">
      {/* ─── Ambient Glows & Tech Background ─── */}
      <div className="absolute -top-40 -left-40 w-[550px] h-[550px] bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-amber-400/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] bg-teal-500/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Decorative Subtle Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 py-20 sm:py-28 text-center flex flex-col items-center justify-center flex-1">
        {/* Floating Glowing Badge */}
        <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-amber-400/30 bg-emerald-900/40 backdrop-blur-xl shadow-2xl mb-8">
          {/* <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" /> */}
          <span className="text-xs font-bold tracking-[0.25em] text-amber-300 uppercase">
            Under Active Construction
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-medium text-white tracking-tight leading-[1.1] mb-6">
          AI Virtual Fitting Studio{" "}
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-emerald-200 to-amber-300 italic font-normal mt-2">
            Coming Very Soon
          </span>
        </h1>

        {/* Bengali Subtitle & Description */}
        <p className="text-base sm:text-xl text-emerald-200/90 max-w-2xl font-light leading-relaxed mb-4">
          সাজসূত্র এআই ভার্চুয়াল ট্রাই-অন — আপনার জন্য নিয়ে আসছে এক যুগান্তকারী অভিজ্ঞতা।
        </p>

        <p className="text-xs sm:text-sm text-emerald-300/70 max-w-xl font-light leading-relaxed mb-12">
          We are currently developing our next-generation neural fitting room with 3D garment simulation, precise drape rendering, and personalized body sizing.
        </p>

        {/* ─── 3 Feature Highlights (Under Development) ─── */}
        <div className="grid sm:grid-cols-3 gap-5 max-w-4xl w-full text-left mb-14">
          <div className="bg-emerald-900/20 backdrop-blur-md rounded-3xl p-6 border border-emerald-800/50 hover:border-amber-400/30 transition-all group">
            <div className="w-10 h-10 rounded-2xl bg-emerald-950/80 border border-emerald-700/50 flex items-center justify-center text-lg mb-4 group-hover:scale-110 transition-transform">
              🪄
            </div>
            <h3 className="text-sm font-serif font-semibold text-white mb-1">
              3D Neural Drape
            </h3>
            <p className="text-xs text-emerald-200/70 font-light leading-relaxed">
              Photorealistic physics simulation showing how silk, cotton, and muslin fall on your silhouette.
            </p>
          </div>

          <div className="bg-emerald-900/20 backdrop-blur-md rounded-3xl p-6 border border-emerald-800/50 hover:border-amber-400/30 transition-all group">
            <div className="w-10 h-10 rounded-2xl bg-emerald-950/80 border border-emerald-700/50 flex items-center justify-center text-lg mb-4 group-hover:scale-110 transition-transform">
              📐
            </div>
            <h3 className="text-sm font-serif font-semibold text-white mb-1">
              Exact Size Match
            </h3>
            <p className="text-xs text-emerald-200/70 font-light leading-relaxed">
              Tailored measurement recommendations based on shoulder, chest, and length analysis.
            </p>
          </div>

          <div className="bg-emerald-900/20 backdrop-blur-md rounded-3xl p-6 border border-emerald-800/50 hover:border-amber-400/30 transition-all group">
            <div className="w-10 h-10 rounded-2xl bg-emerald-950/80 border border-emerald-700/50 flex items-center justify-center text-lg mb-4 group-hover:scale-110 transition-transform">
              📸
            </div>
            <h3 className="text-sm font-serif font-semibold text-white mb-1">
              Live Mirror Try-On
            </h3>
            <p className="text-xs text-emerald-200/70 font-light leading-relaxed">
              Upload your photo or use camera preview to instantly see yourself in any ShajSutro attire.
            </p>
          </div>
        </div>

        {/* ─── Early Access Notification Form ─── */}
        <div className="w-full max-w-md bg-emerald-950/70 backdrop-blur-xl p-6 rounded-3xl border border-emerald-800/60 shadow-2xl mb-10">
          {subscribed ? (
            <div className="py-2 text-center space-y-2">
              <span className="text-2xl">✨</span>
              <p className="text-sm font-serif font-medium text-amber-200">
                You&apos;re on the VIP Early Access list!
              </p>
              <p className="text-xs text-emerald-300/70 font-light">
                We will notify you the moment the Virtual Try-On studio goes live.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-300/90 text-left">
                Get Notified on Launch
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  className="flex-1 px-4 py-3 rounded-2xl bg-emerald-900/50 border border-emerald-700/60 text-xs text-white placeholder-emerald-400/40 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all"
                />
                <button
                  type="submit"
                  className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 whitespace-nowrap"
                >
                  Notify Me
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ─── Navigation Buttons ─── */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/shop"
            className="px-8 py-3.5 rounded-full bg-emerald-800/60 hover:bg-emerald-700/80 border border-emerald-600/50 text-white font-semibold text-xs uppercase tracking-widest transition-all duration-300 shadow-md backdrop-blur-sm"
          >
            Explore Ready Collection &rarr;
          </Link>
          <Link
            href="/"
            className="px-8 py-3.5 rounded-full border border-white/20 hover:bg-white/10 text-emerald-200 font-semibold text-xs uppercase tracking-widest transition-all duration-300"
          >
            Back to Home
          </Link>
        </div>
      </div>

      {/* ─── Footer note ─── */}
      <div className="relative z-10 py-6 border-t border-emerald-900/40 text-center text-xs text-emerald-400/50 font-light">
        © 2026 ShajSutro Atelier. Crafted with intention for modern fashion.
      </div>
    </div>
  );
}
