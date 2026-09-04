import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, Heart, Zap, Globe, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | ShajSutro (সাজসূত্র) — The Art of Artisanal Fashion",
  description:
    "Discover the heritage, artistry, and ethical craftsmanship behind ShajSutro. Where timeless Bengal handlooms meet contemporary haute couture.",
};

const PILLARS = [
  {
    number: "01",
    icon: <BookOpen className="w-6 h-6" strokeWidth={1.5} />,
    title: "Heritage Craftsmanship",
    subtitle: "ঐতিহ্য ও তাঁতশিল্প",
    description:
      "Every piece is rooted in the rich legacy of Bengal handloom weaving. We work directly with master artisans in Tangail, Narayanganj, and Sirajganj to preserve centuries-old jacquard, jamdani, and khadi techniques.",
  },
  {
    number: "02",
    icon: <Heart className="w-6 h-6" strokeWidth={1.5} />,
    title: "Radical Ethical Sourcing",
    subtitle: "ন্যায্য মজুরি ও স্বচ্ছতা",
    description:
      "No middlemen, no compromises. We ensure fair living wages, dignified working conditions, and complete price transparency from raw mulberry silk and organic combed cotton to final stitching.",
  },
  {
    number: "03",
    icon: <Zap className="w-6 h-6" strokeWidth={1.5} />,
    title: "Slow, Intentional Design",
    subtitle: "চিরন্তন আধুনিক শৈলী",
    description:
      "We design against fleeting micro-trends. Our garments feature sculpted silhouettes, reinforced seams, and timeless color palettes engineered to look stunning for decades.",
  },
  {
    number: "04",
    icon: <Globe className="w-6 h-6" strokeWidth={1.5} />,
    title: "Conscious Sustainability",
    subtitle: "পরিবেশবান্ধব উপাদান",
    description:
      "Zero-toxic azo-free organic plant dyes, recycled water closed-loop finishing, and zero-plastic biodegradable linen packaging that respects our planet with every unboxing.",
  },
];

const TIMELINE = [
  {
    year: "2024",
    title: "The Loom Discovery",
    desc: "A search across rural weaving clusters inspired the founding manifesto of ShajSutro — reimagining Bengal textile artistry into luxury pret-a-porter.",
  },
  {
    year: "2025",
    title: "Artisan Collective & Atelier",
    desc: "Established direct partnerships with over 50 traditional weaving families and launched our flagship atelier studio in Dhaka.",
  },
  {
    year: "2026",
    title: "Omnichannel Digital Luxury",
    desc: "Pioneered Next-Gen high speed digital storefront with AI Virtual Try-On, hyperlocal logistics, and sustainable cross-border delivery.",
  },
];

const PROCESS_STEPS = [
  {
    title: "Pure Fiber Selection",
    desc: "Hand-harvested mulberry silk, premium Egyptian cotton, and organic linen.",
    image: "https://images.unsplash.com/photo-1528458876861-544fd1761a91?w=800&q=80",
    step: "01",
  },
  {
    title: "Handloom Weaving & Block",
    desc: "Hand-spun warp and weft crafted on traditional wooden pit looms with botanical motifs.",
    image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80",
    step: "02",
  },
  {
    title: "Master Sartorial Tailoring",
    desc: "Precision single-needle pattern cutting, French seams, and horn button accents.",
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80",
    step: "03",
  },
];

const STATS = [
  { value: "50+", label: "Master Weaving Families", sub: "Empowered locally" },
  { value: "100%", label: "Artisanal Integrity", sub: "Hand-finished pieces" },
  { value: "64", label: "Districts Delivered", sub: "Pan-Bangladesh reach" },
  { value: "4.9/5", label: "Customer Love", sub: "Based on 1,200+ reviews" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#fafaf8] text-emerald-950 selection:bg-emerald-900 selection:text-emerald-50">
      {/* ─── 1. Cinematic Hero Banner ─── */}
      <section className="relative min-h-[75vh] flex items-center justify-center overflow-hidden bg-emerald-950">
        {/* Background Image with Vignette & Gradients */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1800&q=85"
            alt="ShajSutro Luxury Atelier"
            fill
            className="object-cover object-center opacity-30 scale-105 transition-transform duration-1000 ease-out"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/60 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/30 via-transparent to-black/70" />
        </div>

        {/* Floating Decorative Gold Grid & Blur Elements */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 py-20 text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-amber-300/30 bg-emerald-900/50 backdrop-blur-md shadow-lg">
            {/* <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" /> */}
            <span className="text-xs font-bold tracking-[0.2em] text-amber-200 uppercase">
              The Story of ShajSutro (সাজসূত্র)
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-medium tracking-tight text-white leading-[1.15]">
            Where Timeless Heritage Meets{" "}
            <span className="italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-emerald-100 to-amber-300">
              Modern Elegance
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-emerald-100/80 max-w-2xl mx-auto font-light leading-relaxed">
            Crafted for discerning souls. We breathe new life into Bengal&apos;s
            legendary weaving traditions through refined silhouettes, ethical
            integrity, and meticulous tailoring.
          </p>

          {/* Quick CTA Links */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/shop"
              className="px-8 py-3.5 rounded-full bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-lg hover:shadow-amber-400/20 active:scale-95"
            >
              Explore Collection
            </Link>
            <Link
              href="#manifesto"
              className="px-8 py-3.5 rounded-full border border-white/25 bg-white/5 hover:bg-white/15 text-white font-semibold text-xs uppercase tracking-widest backdrop-blur-sm transition-all duration-300"
            >
              Our Philosophy
            </Link>
          </div>
        </div>

        {/* Bottom subtle wave separator */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#fafaf8] to-transparent z-10" />
      </section>

      {/* ─── 2. Editorial Manifesto & Brand Story ─── */}
      <section id="manifesto" className="py-24 sm:py-32 relative">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Narrative */}
            <div className="lg:col-span-6 space-y-8">
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-800">
                  Our Genesis &amp; Manifesto
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-emerald-950 font-normal leading-tight">
                  Born from a rebellion against ephemeral fast fashion.
                </h2>
              </div>

              <div className="space-y-5 text-emerald-900/80 font-light text-base sm:text-lg leading-relaxed">
                <p>
                  In a world dominated by mass production and disposable clothing,
                  <strong> ShajSutro (সাজসূত্র)</strong> was founded with a singular conviction:
                  true luxury lies not in loud branding, but in the unseen intimacy
                  of a handwoven thread, the natural breathe of organic fiber, and
                  the soul of the artisan who shaped it.
                </p>
                <p>
                  The name <em>ShajSutro</em> translates to <em>&ldquo;The Artful Thread of Adornment&rdquo;</em>.
                  We celebrate Bengal&apos;s centuries-old legacy — once celebrated globally as the
                  capital of Muslin and Jamdani — reimagined for the international, contemporary wardrobe.
                </p>
                <p className="border-l-2 border-amber-500/60 pl-4 py-1 text-emerald-950 font-medium italic text-base">
                  &ldquo;We do not simply produce garments. We curate wearable art
                  destined to be cherished, worn effortlessly, and passed down through
                  generations.&rdquo;
                </p>
              </div>

              {/* Founder Signature Area */}
              <div className="pt-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-950 text-amber-300 font-serif font-bold text-lg flex items-center justify-center shadow-md">
                  শ
                </div>
                <div>
                  <h3 className="font-serif font-bold text-emerald-950 text-base">The ShajSutro Atelier Collective</h3>
                  <p className="text-xs text-emerald-800/70">Dhaka &amp; Tangail, Bangladesh</p>
                </div>
              </div>
            </div>

            {/* Right Multi-Image Editorial Grid with Glassmorphic Accent */}
            <div className="lg:col-span-6 relative">
              <div className="grid grid-cols-2 gap-4 sm:gap-6 relative">
                <div className="space-y-4 sm:space-y-6">
                  <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-xl border border-emerald-900/10 group">
                    <Image
                      src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80"
                      alt="Artisan loom detailing"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 768px) 50vw, 30vw"
                    />
                  </div>
                  <div className="relative aspect-square rounded-3xl overflow-hidden shadow-lg border border-emerald-900/10 group">
                    <Image
                      src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80"
                      alt="High fashion editorial model"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-6 pt-8 sm:pt-12">
                  <div className="relative aspect-square rounded-3xl overflow-hidden shadow-lg border border-emerald-900/10 group">
                    <Image
                      src="https://images.unsplash.com/photo-1544441893-675973e31985?w=800&q=80"
                      alt="Fabric texture and weave"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                  <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-xl border border-emerald-900/10 group">
                    <Image
                      src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80"
                      alt="ShajSutro Atelier Interior"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 768px) 50vw, 30vw"
                    />
                  </div>
                </div>

                {/* Floating Glass Pill Badge */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-emerald-950/85 text-white backdrop-blur-xl border border-amber-300/30 px-6 py-3.5 rounded-2xl shadow-2xl text-center">
                  <span className="block text-[11px] font-bold tracking-[0.2em] text-amber-300 uppercase">
                    100% Verified
                  </span>
                  <span className="text-sm font-serif font-medium">Handcrafted in Bangladesh</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. The 4 Pillars of Excellence ─── */}
      <section className="py-24 bg-gradient-to-b from-[#f2f7f4] via-[#ecf3ef] to-[#f2f7f4] border-y border-emerald-900/10 relative overflow-hidden">
        {/* Background Subtle Aesthetics */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-300/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-200/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-800">
              Our Core Tenets
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif text-emerald-950 font-normal">
              The Four Pillars of ShajSutro
            </h2>
            <p className="text-emerald-900/70 text-sm font-light">
              Every garment we release embodies a lifelong commitment to ethics,
              craft, and timeless sartorial grace.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {PILLARS.map((pillar) => (
              <div
                key={pillar.number}
                className="group relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-emerald-100 hover:border-emerald-300 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-950 text-amber-300 flex items-center justify-center shadow-md group-hover:bg-emerald-900 transition-colors">
                      {pillar.icon}
                    </div>
                    <span className="text-3xl font-serif font-light text-emerald-900/20 group-hover:text-emerald-900/40 transition-colors">
                      {pillar.number}
                    </span>
                  </div>

                  <h3 className="text-lg font-serif font-semibold text-emerald-950 mb-1">
                    {pillar.title}
                  </h3>
                  <p className="text-xs font-medium text-amber-800/80 mb-3 tracking-wide">
                    {pillar.subtitle}
                  </p>
                  <p className="text-xs sm:text-sm text-emerald-900/75 leading-relaxed font-light">
                    {pillar.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-emerald-50 flex items-center text-xs font-semibold text-emerald-950 group-hover:text-emerald-800">
                  <span>Learn more</span>
                  <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 4. Craftsmanship in Action (Process Gallery) ─── */}
      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="space-y-3 max-w-xl">
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-800">
                Behind the Weft &amp; Warp
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-emerald-950 font-normal leading-tight">
                Mastery in every single stitch.
              </h2>
            </div>
            <p className="text-emerald-900/70 text-sm max-w-sm font-light">
              From raw ethically harvested yarns to final single-needle hand
              finishing, explore the tactile stages of our creation process.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {PROCESS_STEPS.map((step) => (
              <div key={step.step} className="space-y-4 group">
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-md border border-emerald-900/10">
                  <Image
                    src={step.image}
                    alt={step.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md text-emerald-950 font-serif font-bold text-xs flex items-center justify-center shadow">
                    {step.step}
                  </div>
                  <div className="absolute bottom-5 left-5 right-5 text-white">
                    <h4 className="text-lg font-serif font-medium">{step.title}</h4>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-emerald-900/75 font-light leading-relaxed px-1">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 5. Timeline / Our Sartorial Odyssey ─── */}
      <section className="py-20 bg-emerald-950 text-white relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-amber-300">
              Evolution of the Brand
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-normal text-white">
              Our Sartorial Odyssey
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {TIMELINE.map((item, idx) => (
              <div
                key={item.year}
                className="relative bg-emerald-900/40 backdrop-blur-md rounded-3xl p-8 border border-emerald-800/60 shadow-xl space-y-4 hover:border-amber-300/40 transition-colors"
              >
                <div className="inline-block px-3 py-1 rounded-full bg-amber-400 text-emerald-950 font-serif font-bold text-xs shadow-sm">
                  {item.year}
                </div>
                <h4 className="text-xl font-serif font-medium text-white">{item.title}</h4>
                <p className="text-xs sm:text-sm text-emerald-200/80 font-light leading-relaxed">
                  {item.desc}
                </p>
                <span className="text-emerald-700 text-xs font-mono block pt-2">Phase 0{idx + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 6. Key Milestone Numbers ─── */}
      <section className="py-20 bg-white border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 divide-y lg:divide-y-0 lg:divide-x divide-emerald-100 text-center">
            {STATS.map((stat, i) => (
              <div key={stat.label} className={i > 0 ? "pt-6 lg:pt-0 lg:px-6" : "lg:pr-6"}>
                <p className="text-4xl sm:text-5xl font-serif font-normal text-emerald-950 tracking-tight">
                  {stat.value}
                </p>
                <p className="text-sm font-semibold text-emerald-900 mt-2">{stat.label}</p>
                <p className="text-xs text-emerald-800/60 font-light mt-0.5">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 7. Grand Call to Action / Invitation ─── */}
      <section className="py-24 sm:py-32 bg-[#fafaf8] relative">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 p-10 sm:p-16 text-center text-white shadow-2xl border border-emerald-800">
            {/* Background Decorative Rings */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-amber-300 block">
                Experience ShajSutro
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal leading-tight">
                Embrace the poetry of artful dressing.
              </h2>
              <p className="text-sm sm:text-base text-emerald-200/80 font-light leading-relaxed">
                Step into our virtual showroom or shop our latest handcrafted
                collection tailored for timeless elegance and lasting beauty.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/shop"
                  className="px-8 py-4 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs uppercase tracking-widest rounded-full transition-all duration-300 shadow-lg hover:shadow-amber-400/20 active:scale-95"
                >
                  Shop the Collection
                </Link>
                <Link
                  href="/virtual-try-on"
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold text-xs uppercase tracking-widest rounded-full backdrop-blur-sm transition-all duration-300"
                >
                  Try Virtual Studio ✨
                </Link>
                <Link
                  href="/contact"
                  className="px-8 py-4 text-emerald-200 hover:text-white font-semibold text-xs uppercase tracking-widest rounded-full transition-colors flex items-center justify-center"
                >
                  Visit Atelier &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
