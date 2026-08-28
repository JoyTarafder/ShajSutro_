"use client";

import { useState } from "react";
import FAQSection from "@/components/home/FAQSection";
import { getApiBase } from "@/lib/apiBase";
import Link from "next/link";

const ATELIER_INFO = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
    title: "Flagship Atelier & Studio",
    subtitle: "আতেলিয়ে ও শোরুম",
    value: "Road 11, Block D, Banani",
    subValue: "Dhaka 1213, Bangladesh",
    timing: "Open 7 Days: 10:00 AM – 9:00 PM",
    badge: "In-Person Visit",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
    title: "Direct Concierge Desk",
    subtitle: "ইমেইল ও সহায়তা",
    value: "shajsutro@gmail.com",
    subValue: "support@shajsutro.com",
    timing: "Average response: under 4 hours",
    badge: "24/7 Priority",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
      </svg>
    ),
    title: "Hotline & WhatsApp VIP",
    subtitle: "সরাসরি কল ও হোয়াটসঅ্যাপ",
    value: "+880 1700-000000",
    subValue: "+880 1800-000000",
    timing: "Daily: 9:00 AM – 10:00 PM BST",
    badge: "Instant Call",
  },
];

const TOPICS = [
  { id: "general", label: "General Inquiry", icon: "✨" },
  { id: "order", label: "Order & Tracking", icon: "📦" },
  { id: "bespoke", label: "Bespoke & Sizing", icon: "👗" },
  { id: "returns", label: "Exchange & Returns", icon: "🔄" },
  { id: "collab", label: "Press & Wholesale", icon: "🤝" },
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
    <div className="min-h-screen bg-[#fafaf8] text-emerald-950 selection:bg-emerald-900 selection:text-emerald-50">
      {/* ─── 1. Haute-Couture Hero Header ─── */}
      <section className="relative min-h-[48vh] sm:min-h-[52vh] flex items-center justify-center overflow-hidden bg-emerald-950">
        {/* Background Ambient Glow & Vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950 via-emerald-950/80 to-emerald-950" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-8 py-16 text-center space-y-5">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-amber-300/30 bg-emerald-900/50 backdrop-blur-md shadow-lg">
            {/* <span className="w-2 h-2 rounded-full bg-amber-400" /> */}
            <span className="text-xs font-bold tracking-[0.2em] text-amber-200 uppercase">
              Client Relations &amp; Concierge
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-medium text-white tracking-tight leading-tight">
            Connect with the{" "}
            <span className="italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-emerald-100 to-amber-300">
              ShajSutro
            </span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-emerald-100/80 max-w-2xl mx-auto font-light leading-relaxed">
            Whether you require personalized styling advice, order assistance, or wish to schedule a private studio preview, our team is dedicated to your satisfaction.
          </p>
        </div>

        {/* Bottom soft fade */}
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#fafaf8] to-transparent z-10" />
      </section>

      {/* ─── 2. Luxury Contact Information Cards ─── */}
      <section className="relative z-20 -mt-8 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid md:grid-cols-3 gap-6">
          {ATELIER_INFO.map((info) => (
            <div
              key={info.title}
              className="bg-white/95 backdrop-blur-md rounded-3xl p-7 sm:p-8 border border-emerald-100 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-950 text-amber-300 flex items-center justify-center shadow-md group-hover:bg-emerald-900 transition-colors">
                    {info.icon}
                  </div>
                  <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100">
                    {info.badge}
                  </span>
                </div>

                <h3 className="text-base font-serif font-semibold text-emerald-950 mb-0.5">
                  {info.title}
                </h3>
                <p className="text-xs font-medium text-amber-800/80 mb-3">{info.subtitle}</p>

                <p className="text-sm font-semibold text-emerald-950">{info.value}</p>
                <p className="text-xs text-emerald-900/70 font-light">{info.subValue}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-emerald-50 flex items-center justify-between text-xs text-emerald-800/70">
                <span className="font-light">{info.timing}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 3. Main Form & Concierge Suite ─── */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left Side: Concierge Perks & Direct WhatsApp Assistant */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-800">
                  Dedicated Assistance
                </span>
                <h2 className="text-3xl sm:text-4xl font-serif text-emerald-950 font-normal leading-tight">
                  We are here to assist your journey.
                </h2>
                <p className="text-sm text-emerald-900/70 font-light leading-relaxed">
                  Every inquiry receives personalized attention from our senior wardrobe and client relations specialists.
                </p>
              </div>

              {/* Live WhatsApp / Chat VIP Card */}
              <div className="bg-gradient-to-br from-emerald-950 to-emerald-900 text-white rounded-3xl p-7 shadow-xl border border-emerald-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-200">
                      Live Concierge Active
                    </span>
                  </div>
                  <span className="text-xs text-emerald-300 font-light">Online Now</span>
                </div>

                <h3 className="text-lg font-serif font-medium text-white">
                  Need immediate styling or order help?
                </h3>
                <p className="text-xs sm:text-sm text-emerald-200/80 font-light leading-relaxed">
                  Connect directly with our master stylist via WhatsApp for instant size consultations, fabric questions, or bespoke fitting reservations.
                </p>

                <a
                  href="https://wa.me/8801700000000?text=Hello%20ShajSutro%20Team%2C%20I%20would%20like%20assistance%20with%20an%20order."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md active:scale-95"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                  <span>Chat on WhatsApp</span>
                </a>
              </div>

              {/* Atelier Experience Feature */}
              <div className="bg-white/80 rounded-3xl p-6 border border-emerald-100/80 shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
                    👗
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-emerald-950">Virtual Fitting Studio</h4>
                    <p className="text-xs text-emerald-800/60 font-light">Interactive apparel simulation</p>
                  </div>
                </div>
                <p className="text-xs text-emerald-900/70 font-light leading-relaxed">
                  Want to see how our silhouettes fit before placing an order? Explore our interactive try-on module.
                </p>
                <Link
                  href="/virtual-try-on"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-900 hover:text-emerald-950 underline pt-1"
                >
                  <span>Open Virtual Studio</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            </div>

            {/* Right Side: Haute-Couture Inquiry Form */}
            <div className="lg:col-span-7">
              <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 sm:p-10 border border-emerald-100/90 shadow-xl relative">
                {status === "success" ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-inner">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-800">
                      Inquiry Received
                    </span>
                    <h3 className="text-2xl font-serif font-medium text-emerald-950">
                      Thank you for contacting us.
                    </h3>
                    <p className="text-sm text-emerald-900/70 max-w-md font-light leading-relaxed">
                      Your message has been assigned to our concierge team. We will review your notes and respond promptly via email.
                    </p>
                    <div className="pt-4">
                      <button
                        type="button"
                        onClick={() => setStatus("idle")}
                        className="px-8 py-3 rounded-full bg-emerald-950 hover:bg-emerald-900 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md"
                      >
                        Send Another Inquiry
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-800 block mb-1">
                        Online Correspondence
                      </span>
                      <h3 className="text-2xl font-serif text-emerald-950 font-medium">
                        Dispatch a Message
                      </h3>
                      <p className="text-xs text-emerald-900/60 font-light mt-1">
                        Please fill in the details below. Required fields are marked with an asterisk (*).
                      </p>
                    </div>

                    {error && (
                      <div className="rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-xs font-medium text-rose-800 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                        <span>{error}</span>
                      </div>
                    )}

                    {/* Topic Selector Pills */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-emerald-950 mb-2.5">
                        Inquiry Topic *
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {TOPICS.map((t) => {
                          const isSelected = formData.topic === t.id;
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => setFormData({ ...formData, topic: t.id })}
                              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                                isSelected
                                  ? "bg-emerald-950 text-white border-emerald-950 shadow-xs font-bold ring-2 ring-emerald-950/10"
                                  : "bg-emerald-50/40 text-emerald-950 border-emerald-200/60 hover:bg-emerald-100/50 hover:border-emerald-300"
                              }`}
                            >
                              <span>{t.icon}</span>
                              <span>{t.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Name & Phone Grid */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-emerald-950 mb-1.5">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Ayesha Rahman"
                          className="w-full px-4 py-3 rounded-xl border border-emerald-200/80 bg-white text-xs font-medium text-emerald-950 placeholder-emerald-900/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-700 transition-all shadow-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-emerald-950 mb-1.5">
                          Contact Phone
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+880 1700-000000"
                          className="w-full px-4 py-3 rounded-xl border border-emerald-200/80 bg-white text-xs font-medium text-emerald-950 placeholder-emerald-900/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-700 transition-all shadow-xs"
                        />
                      </div>
                    </div>

                    {/* Email & Subject */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-emerald-950 mb-1.5">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="ayesha@example.com"
                          className="w-full px-4 py-3 rounded-xl border border-emerald-200/80 bg-white text-xs font-medium text-emerald-950 placeholder-emerald-900/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-700 transition-all shadow-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-emerald-950 mb-1.5">
                          Subject *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          placeholder="How can we assist you?"
                          className="w-full px-4 py-3 rounded-xl border border-emerald-200/80 bg-white text-xs font-medium text-emerald-950 placeholder-emerald-900/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-700 transition-all shadow-xs"
                        />
                      </div>
                    </div>

                    {/* Message Area */}
                    <div>
                      <label className="block text-xs font-semibold text-emerald-950 mb-1.5">
                        Detailed Message *
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Please write your inquiry, questions, or notes here..."
                        className="w-full px-4 py-3 rounded-xl border border-emerald-200/80 bg-white text-xs font-medium text-emerald-950 placeholder-emerald-900/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-700 transition-all shadow-xs resize-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="w-full py-4 px-8 bg-emerald-950 hover:bg-emerald-900 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-300 shadow-md hover:shadow-lg active:scale-98 flex items-center justify-center gap-2"
                    >
                      {status === "loading" ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          <span>Transmitting Message...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Message</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                          </svg>
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
      <div className="border-t border-emerald-100 bg-[#f4f8f5]">
        <FAQSection />
      </div>
    </div>
  );
}
