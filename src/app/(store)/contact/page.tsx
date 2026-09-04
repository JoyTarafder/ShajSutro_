"use client";

import { useState } from "react";
import FAQSection from "@/components/home/FAQSection";
import { getApiBase } from "@/lib/apiBase";
import Link from "next/link";
import {
  MapPin,
  Mail,
  PhoneCall,
  Clock,
  Sparkles,
  Package,
  Scissors,
  RotateCcw,
  Handshake,
  MessageCircle,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  Shirt,
} from "lucide-react";

const ATELIER_INFO = [
  {
    icon: <MapPin className="w-5 h-5 text-amber-300" />,
    title: "Flagship Atelier & Studio",
    subtitle: "আতেলিয়ে ও শোরুম",
    value: "Road 11, Block D, Banani",
    subValue: "Dhaka 1213, Bangladesh",
    timing: "Open 7 Days: 10:00 AM – 9:00 PM",
    badge: "In-Person Visit",
  },
  {
    icon: <Mail className="w-5 h-5 text-amber-300" />,
    title: "Direct Concierge Desk",
    subtitle: "ইমেইল ও সহায়তা",
    value: "shajsutro@gmail.com",
    subValue: "support@shajsutro.com",
    timing: "Average response: under 4 hours",
    badge: "24/7 Priority",
  },
  {
    icon: <PhoneCall className="w-5 h-5 text-amber-300" />,
    title: "Hotline & WhatsApp VIP",
    subtitle: "সরাসরি কল ও হোয়াটসঅ্যাপ",
    value: "+880 1700-000000",
    subValue: "+880 1800-000000",
    timing: "Daily: 9:00 AM – 10:00 PM BST",
    badge: "Instant Call",
  },
];

const TOPICS = [
  { id: "general", label: "General Inquiry", icon: Sparkles },
  { id: "order", label: "Order & Tracking", icon: Package },
  { id: "bespoke", label: "Bespoke & Sizing", icon: Scissors },
  { id: "returns", label: "Exchange & Returns", icon: RotateCcw },
  { id: "collab", label: "Press & Wholesale", icon: Handshake },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    topic: "general",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const res = await fetch(`${getApiBase()}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message ?? "Failed to send message");
      }
      setStatus("success");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        topic: "general",
      });
    } catch (err: unknown) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Failed to send message");
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf8] text-stone-900 selection:bg-emerald-900 selection:text-white">
      {/* ─── 1. Haute-Couture Hero Header ─── */}
      <section className="relative min-h-[44vh] sm:min-h-[48vh] flex items-center justify-center overflow-hidden bg-emerald-950">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950 via-emerald-950/85 to-emerald-950" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-8 py-14 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-300/30 bg-emerald-900/50 backdrop-blur-md shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-xs font-bold tracking-[0.2em] text-amber-200 uppercase">
              Client Relations &amp; Concierge
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-medium text-white tracking-tight leading-tight">
            Connect with{" "}
            <span className="italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-emerald-100 to-amber-300">
              ShajSutro
            </span>
          </h1>

          <p className="text-sm sm:text-base text-emerald-100/80 max-w-2xl mx-auto font-light leading-relaxed">
            Whether you require personalized styling advice, order assistance, or wish to schedule a private studio preview, our team is dedicated to your satisfaction.
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#fafaf8] to-transparent z-10" />
      </section>

      {/* ─── 2. Luxury Contact Information Cards ─── */}
      <section className="relative z-20 -mt-6 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid md:grid-cols-3 gap-6">
          {ATELIER_INFO.map((info) => (
            <div
              key={info.title}
              className="bg-white rounded-3xl p-7 sm:p-8 border border-stone-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-950 text-amber-300 flex items-center justify-center shadow-md group-hover:bg-emerald-900 transition-colors">
                    {info.icon}
                  </div>
                  <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                    {info.badge}
                  </span>
                </div>

                <h3 className="text-base font-serif font-semibold text-stone-900 mb-0.5">
                  {info.title}
                </h3>
                <p className="text-xs font-medium text-amber-800/80 mb-3">{info.subtitle}</p>

                <p className="text-sm font-semibold text-stone-900">{info.value}</p>
                <p className="text-xs text-stone-500 font-light">{info.subValue}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                <span className="font-light flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  <span>{info.timing}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 3. Main Form & Concierge Suite ─── */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            {/* Left Side: Concierge Perks & Direct WhatsApp Assistant */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-2.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Personal Concierge</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif text-stone-900 font-normal leading-snug">
                  We are here to assist your journey.
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
                  Every inquiry receives personalized attention from our senior wardrobe and client relations specialists.
                </p>
              </div>

              {/* Live WhatsApp / Chat VIP Card */}
              <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-stone-950 text-white rounded-3xl p-7 shadow-xl border border-emerald-800/50 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-200">
                      Live Stylist Active
                    </span>
                  </div>
                  <span className="text-xs text-emerald-300/80 font-light">Online Now</span>
                </div>

                <h3 className="text-lg font-serif font-medium text-white">
                  Need instant styling or sizing advice?
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100/70 font-light leading-relaxed">
                  Chat directly with our master tailor on WhatsApp for real-time sizing guidance, fabric close-ups, and priority assistance.
                </p>

                <a
                  href="https://wa.me/8801700000000?text=Hello%20ShajSutro%20Team%2C%20I%20would%20like%20assistance%20with%20an%20order."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md active:scale-95 group cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat on WhatsApp</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </a>
              </div>

              {/* Atelier Experience Feature */}
              <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center shadow-2xs">
                    <Shirt className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-stone-900">AI Virtual Try-On Studio</h4>
                    <p className="text-xs text-stone-500 font-light">Interactive apparel simulation with your photo</p>
                  </div>
                </div>
                <p className="text-xs text-stone-600 font-light leading-relaxed">
                  Want to see how our Jamdani, Panjabi, or Silk outfits look on you? Try them on virtually before placing an order.
                </p>
                <Link
                  href="/virtual-try-on"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-900 hover:text-emerald-950 uppercase tracking-wider group pt-1"
                >
                  <span>Open Try-On Studio</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>

            {/* Right Side: Haute-Couture Inquiry Form */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl p-7 sm:p-10 border border-stone-200/80 shadow-[0_15px_40px_rgba(0,0,0,0.04)]">
                {status === "success" ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-inner">
                      <CheckCircle2 className="w-8 h-8 text-emerald-700" />
                    </div>
                    <span className="text-xs font-bold tracking-[0.2em] text-emerald-800">
                      Inquiry Received
                    </span>
                    <h3 className="text-2xl font-serif font-medium text-stone-900">
                      Thank you for contacting us.
                    </h3>
                    <p className="text-sm text-stone-600 max-w-md font-light leading-relaxed">
                      Your message has been assigned to our concierge team. We will review your notes and respond promptly via email.
                    </p>
                    <div className="pt-4">
                      <button
                        type="button"
                        onClick={() => setStatus("idle")}
                        className="px-8 py-3 rounded-full bg-emerald-950 hover:bg-emerald-900 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
                      >
                        Send Another Inquiry
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-800 block mb-1">
                        Online Correspondence
                      </span>
                      <h3 className="text-2xl font-serif text-stone-900 font-medium">
                        Dispatch a Message
                      </h3>
                      <p className="text-xs text-stone-500 font-light mt-1">
                        Please fill in the details below. Required fields are marked with an asterisk (*).
                      </p>
                    </div>

                    {error && (
                      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-800 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    {/* Topic Selector Pills */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                        Inquiry Topic <span className="text-amber-600">*</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {TOPICS.map((t) => {
                          const isSelected = formData.topic === t.id;
                          const TopicIcon = t.icon;
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => setFormData({ ...formData, topic: t.id })}
                              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-emerald-950 text-amber-200 font-semibold shadow-xs"
                                  : "bg-stone-100 hover:bg-stone-200/80 text-stone-700 border border-stone-200/60"
                              }`}
                            >
                              <TopicIcon className="w-3.5 h-3.5" />
                              <span>{t.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Name & Phone Grid */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                          Full Name <span className="text-amber-600">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Ayesha Rahman"
                          className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50/50 text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/10 transition-all shadow-2xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                          Contact Phone
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+880 1700-000000"
                          className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50/50 text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/10 transition-all shadow-2xs"
                        />
                      </div>
                    </div>

                    {/* Email & Subject */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                          Email Address <span className="text-amber-600">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="ayesha@example.com"
                          className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50/50 text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/10 transition-all shadow-2xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                          Subject <span className="text-amber-600">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          placeholder="How can we assist you?"
                          className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50/50 text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/10 transition-all shadow-2xs"
                        />
                      </div>
                    </div>

                    {/* Message Area */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                        Detailed Message <span className="text-amber-600">*</span>
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Please write your inquiry, questions, or notes here..."
                        className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50/50 text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/10 transition-all shadow-2xs resize-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="w-full py-4 px-8 bg-emerald-950 hover:bg-emerald-900 text-white text-xs font-bold uppercase tracking-widest rounded-2xl transition-all shadow-md hover:shadow-lg active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-1"
                    >
                      {status === "loading" ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                          <span>Transmitting Message...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Message</span>
                          <Send className="w-4 h-4 text-amber-300" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. Integrated Luxury FAQ Section ─── */}
      <div className="border-t border-stone-200/80 bg-[#f4f8f5]">
        <FAQSection />
      </div>
    </div>
  );
}
