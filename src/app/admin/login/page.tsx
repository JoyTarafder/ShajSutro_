"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/context/AdminAuthContext";
import {
  BarChart3,
  Package,
  Users,
  ChevronRight,
  Lock,
  AlertCircle,
  Mail,
  EyeOff,
  Eye,
  Loader2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function AdminLoginPage() {
  const { login, token, isLoading } = useAdminAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [focused, setFocused] = useState<"email" | "password" | null>(null);

  useEffect(() => {
    if (!isLoading && token) {
      router.replace("/admin/dashboard");
    }
  }, [token, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#060608" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-violet-900/60">
            <span className="text-white text-sm font-black">SS</span>
          </div>
          <div className="w-6 h-6 border-2 border-white/10 border-t-violet-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(3deg); }
        }
        @keyframes float-med {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-12px) scale(1.02); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        @keyframes orb1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(40px, -30px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        @keyframes orb2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-30px, 40px) scale(1.05); }
          66% { transform: translate(20px, -20px) scale(1.1); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .orb-1 { animation: orb1 12s ease-in-out infinite; }
        .orb-2 { animation: orb2 15s ease-in-out infinite; }
        .orb-3 { animation: orb1 18s ease-in-out infinite reverse; }
        .float-card { animation: float-slow 6s ease-in-out infinite; }
        .float-card-2 { animation: float-med 8s ease-in-out infinite; }
        .shimmer-text {
          background: linear-gradient(90deg, #a78bfa 0%, #e879f9 25%, #c4b5fd 50%, #818cf8 75%, #a78bfa 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
        .slide-up-1 { animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both; }
        .slide-up-2 { animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both; }
        .slide-up-3 { animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both; }
        .slide-up-4 { animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both; }
        .slide-up-5 { animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both; }
        .fade-in { animation: fade-in 0.8s ease both; }
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.07);
        }
        .input-dark {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #f1f5f9;
          transition: all 0.2s ease;
        }
        .input-dark::placeholder { color: rgba(148, 163, 184, 0.4); }
        .input-dark:focus { background: rgba(255, 255, 255, 0.07); border-color: rgba(139, 92, 246, 0.6); box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.12), inset 0 1px 0 rgba(255,255,255,0.05); outline: none; }
        .input-dark:hover:not(:focus) { border-color: rgba(255, 255, 255, 0.14); }
        .noise-overlay {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          opacity: 0.025;
        }
        .btn-glow {
          box-shadow: 0 0 0 0 rgba(139, 92, 246, 0);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .btn-glow:hover:not(:disabled) {
          box-shadow: 0 8px 32px rgba(139, 92, 246, 0.45), 0 2px 8px rgba(139, 92, 246, 0.3);
          transform: translateY(-1px);
        }
        .btn-glow:active:not(:disabled) { transform: translateY(0); }
        .stat-card {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.07);
          transition: all 0.3s ease;
        }
        .stat-card:hover {
          background: rgba(255, 255, 255, 0.07);
          border-color: rgba(139, 92, 246, 0.2);
        }
        .feature-row {
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .feature-row:last-child { border-bottom: none; }
        .dot-grid {
          background-image: radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px);
          background-size: 24px 24px;
        }
      `}</style>

      <div
        className="min-h-screen flex relative overflow-hidden"
        style={{ background: "#060608" }}
      >
        {/* ── Ambient background orbs ── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="orb-1 absolute -top-48 -left-48 w-[700px] h-[700px] rounded-full opacity-[0.15]"
            style={{ background: "radial-gradient(circle at center, #7c3aed 0%, transparent 65%)" }}
          />
          <div
            className="orb-2 absolute -bottom-32 right-[30%] w-[500px] h-[500px] rounded-full opacity-[0.10]"
            style={{ background: "radial-gradient(circle at center, #4f46e5 0%, transparent 65%)" }}
          />
          <div
            className="orb-3 absolute top-1/3 left-1/2 w-[400px] h-[400px] rounded-full opacity-[0.06]"
            style={{ background: "radial-gradient(circle at center, #a855f7 0%, transparent 65%)" }}
          />
        </div>

        {/* Dot grid overlay */}
        <div className="absolute inset-0 dot-grid pointer-events-none opacity-30" />

        {/* Noise texture */}
        <div className="absolute inset-0 noise-overlay pointer-events-none" />

        {/* ── Left panel ── */}
        <div className="hidden lg:flex flex-col justify-between w-[52%] xl:w-[55%] p-12 xl:p-16 relative z-10">

          {/* Brand mark */}
          <div className="fade-in flex items-center gap-3.5">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-violet-900/60">
                <span className="text-white text-sm font-black tracking-tight">SS</span>
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#060608]" />
            </div>
            <div>
              <p className="text-white text-[15px] font-bold tracking-tight">ShajSutro</p>
              <p className="text-zinc-600 text-[10px] font-semibold tracking-[0.2em] uppercase">Admin Console</p>
            </div>
          </div>

          {/* Center hero content */}
          <div className="max-w-[500px]">
            <div className="slide-up-1 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-7" style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-violet-400 text-[11px] font-semibold tracking-widest uppercase">Secure Access Portal</span>
            </div>

            <h1 className="slide-up-2 text-5xl xl:text-6xl font-black leading-[1.05] tracking-tight mb-5">
              <span className="text-white block">Control your</span>
              <span className="shimmer-text block">store, your way.</span>
            </h1>

            <p className="slide-up-3 text-zinc-500 text-[15px] leading-relaxed mb-10 max-w-[400px]">
              A powerful admin suite giving you full visibility over every product, order, and customer — in real time.
            </p>

            {/* Feature list */}
            <div className="slide-up-4 rounded-2xl overflow-hidden glass-card">
              {[
                {
                  icon: <BarChart3 className="w-4 h-4" strokeWidth={1.75} />,
                  title: "Real-time Analytics",
                  desc: "Revenue, orders & traffic at a glance",
                  color: "#8b5cf6",
                  bg: "rgba(139,92,246,0.12)",
                },
                {
                  icon: <Package className="w-4 h-4" strokeWidth={1.75} />,
                  title: "Product Management",
                  desc: "Inventory, pricing & catalog control",
                  color: "#818cf8",
                  bg: "rgba(129,140,248,0.12)",
                },
                {
                  icon: <Users className="w-4 h-4" strokeWidth={1.75} />,
                  title: "User & Order Hub",
                  desc: "Customers, sessions & order tracking",
                  color: "#a78bfa",
                  bg: "rgba(167,139,250,0.12)",
                },
              ].map((feat) => (
                <div key={feat.title} className="feature-row flex items-center gap-4 px-5 py-4">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: feat.bg, color: feat.color }}>
                    {feat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-[13px] font-semibold leading-none mb-1">{feat.title}</p>
                    <p className="text-zinc-600 text-[11px] leading-none">{feat.desc}</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-700 flex-shrink-0" />
                </div>
              ))}
            </div>

            {/* Stats row */}
            <div className="slide-up-5 flex items-center gap-3 mt-5">
              {[
                { val: "100%", label: "Uptime" },
                { val: "256-bit", label: "Encryption" },
                { val: "24/7", label: "Monitoring" },
              ].map((s) => (
                <div key={s.label} className="stat-card flex-1 rounded-xl px-4 py-3 text-center">
                  <p className="text-white text-sm font-bold mb-0.5">{s.val}</p>
                  <p className="text-zinc-600 text-[10px] font-medium tracking-wide">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="fade-in text-zinc-700 text-xs">
            © {new Date().getFullYear()} ShajSutro. All rights reserved.
          </p>
        </div>

        {/* ── Right form panel ── */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
          {/* Vertical divider */}
          <div
            className="hidden lg:block absolute left-0 top-[10%] bottom-[10%] w-px"
            style={{ background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.07) 30%, rgba(255,255,255,0.07) 70%, transparent)" }}
          />

          <div className="w-full max-w-[400px]">
            {/* Mobile brand */}
            <div className="flex items-center gap-3 mb-10 lg:hidden slide-up-1">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-700 flex items-center justify-center shadow-md shadow-violet-900/50">
                  <span className="text-white text-xs font-black">SS</span>
                </div>
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#060608]" />
              </div>
              <div>
                <p className="text-white text-[14px] font-bold">ShajSutro Admin</p>
                <p className="text-zinc-600 text-[10px] font-semibold tracking-widest uppercase">Console</p>
              </div>
            </div>

            {/* Form card */}
            <div className="slide-up-2 glass-card rounded-3xl p-8">
              {/* Header */}
              <div className="mb-7">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-700 flex items-center justify-center shadow-md shadow-violet-900/50">
                    <Lock className="w-4 h-4 text-white" />
                  </div>
                  <div className="h-px flex-1" style={{ background: "linear-gradient(to right, rgba(139,92,246,0.4), transparent)" }} />
                </div>
                <h1 className="text-white text-2xl font-black tracking-tight leading-none mb-2">
                  Welcome back
                </h1>
                <p className="text-zinc-500 text-[13px] leading-relaxed">
                  Sign in to your admin account to continue.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Error */}
                {error && (
                  <div
                    className="flex items-start gap-3 rounded-xl px-4 py-3 slide-up-1"
                    style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)" }}
                  >
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-[13px] text-red-400 font-medium">{error}</p>
                  </div>
                )}

                {/* Email */}
                <div className="slide-up-3">
                  <label className="block text-[11px] font-bold text-zinc-500 mb-2 tracking-widest uppercase">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocused("email")}
                      onBlur={() => setFocused(null)}
                      placeholder="admin@shajsutro.com"
                      className="input-dark w-full pl-10 pr-4 py-3.5 rounded-xl text-[13px]"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="slide-up-4">
                  <label className="block text-[11px] font-bold text-zinc-500 mb-2 tracking-widest uppercase">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocused("password")}
                      onBlur={() => setFocused(null)}
                      placeholder="••••••••"
                      className="input-dark w-full pl-10 pr-12 py-3.5 rounded-xl text-[13px]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors duration-150"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <div className="slide-up-5 pt-1">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-glow w-full py-3.5 rounded-xl text-white text-[13px] font-bold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
                    style={{
                      background: submitting
                        ? "linear-gradient(135deg, #6d28d9, #4338ca)"
                        : "linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #4f46e5 100%)",
                    }}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Authenticating…
                      </>
                    ) : (
                      <>
                        Sign In to Console
                        <ArrowRight className="w-3.5 h-3.5 opacity-70" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 mt-6">
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-zinc-600" />
                  <span className="text-zinc-700 text-[10px] font-semibold tracking-wider uppercase">Secure</span>
                </div>
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
              </div>

              <p className="text-center text-zinc-700 text-[11px] mt-4 leading-relaxed">
                Admin access only — all sign-in attempts are logged<br />and monitored for security.
              </p>
            </div>

            {/* Version tag */}
            <div className="flex items-center justify-center gap-2 mt-5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-zinc-700 text-[10px] font-medium tracking-wide">Systems operational · v1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
