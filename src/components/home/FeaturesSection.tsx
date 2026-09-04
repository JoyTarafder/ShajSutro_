"use client";

import { Truck, RotateCcw, ShieldCheck, Leaf } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Free Shipping",
    desc: "On orders over ৳1200",
    color: "from-accent-50/50 to-accent-100/30",
    glow: "rgba(90,127,160,0.08)",
  },
  {
    icon: RotateCcw,
    title: "Free Returns",
    desc: "30-day hassle-free returns",
    color: "from-warm-50/50 to-warm-100/30",
    glow: "rgba(184,157,126,0.08)",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    desc: "SSL encrypted checkout",
    color: "from-accent-50/30 to-warm-50/30",
    glow: "rgba(167,139,250,0.06)",
  },
  {
    icon: Leaf,
    title: "Sustainable Focus",
    desc: "Ethically produced clothes",
    color: "from-emerald-50/20 to-emerald-100/10",
    glow: "rgba(16,185,129,0.06)",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-10 sm:py-12 border-y border-charcoal-100 bg-white relative overflow-hidden">
      {/* Background ambient detail */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 bg-accent-100/20 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-warm-100/20 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {features.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.title}
                className="group relative flex flex-col items-center text-center p-6 sm:p-8 rounded-3xl bg-gradient-to-br border border-charcoal-100/60 shadow-soft transition-all duration-500 ease-premium hover:shadow-soft-lg hover:-translate-y-1 hover:border-charcoal-200"
                style={{
                  background: `linear-gradient(135deg, rgba(255,255,255,0.8), rgba(250,248,245,0.9))`,
                }}
              >
                {/* Highlight backdrop glow on hover */}
                <div
                  className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    boxShadow: `0 0 30px ${item.glow}`,
                  }}
                />

                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white border border-charcoal-100/80 flex items-center justify-center shadow-soft transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                    <IconComponent className="w-5.5 h-5.5 text-accent-600" />
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-200 opacity-50 transition-all duration-500 group-hover:scale-150 group-hover:bg-accent-500 group-hover:opacity-100" />
                </div>

                <div className="text-center">
                  <h3 className="text-base font-bold text-charcoal-900 tracking-tight text-center">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-charcoal-500 mt-1 font-light leading-relaxed text-center">
                    {item.desc}
                  </p>
                </div>

                {/* Decorative Card Index */}
                <div className="absolute top-4 right-6 text-[10px] font-mono text-charcoal-200 select-none opacity-50 group-hover:opacity-100 transition-opacity">
                  0{idx + 1}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
