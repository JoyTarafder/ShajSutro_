import React from "react";

export default function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-warm-50 animate-fade-in">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 sm:py-10">
        {/* Top greeting / header skeleton */}
        <div className="mb-5 sm:mb-6">
          <div className="h-3 w-24 bg-charcoal-200/60 rounded-full mb-2 animate-pulse" />
          <div className="h-8 w-48 bg-charcoal-200/80 rounded-xl animate-pulse" />
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar skeleton */}
          <aside className="lg:w-60 shrink-0 space-y-3">
            {/* Avatar Card */}
            <div className="bg-white rounded-2xl border border-charcoal-100 p-4 sm:p-5 flex flex-col items-center text-center gap-2.5 shadow-2xs">
              <div className="w-14 h-14 rounded-full bg-charcoal-200/70 animate-pulse shrink-0" />
              <div className="flex flex-col items-center gap-1.5 w-full mt-1">
                <div className="h-4 w-28 bg-charcoal-200/80 rounded-md animate-pulse" />
                <div className="h-3 w-36 bg-charcoal-150 rounded-md animate-pulse" />
              </div>
              <div className="h-5 w-16 bg-charcoal-100 rounded-full animate-pulse mt-1" />
            </div>

            {/* Navigation tabs */}
            <div className="bg-white rounded-2xl border border-charcoal-100 overflow-hidden shadow-2xs divide-y divide-charcoal-50">
              {[
                { w: "w-20", active: true },
                { w: "w-24", active: false },
                { w: "w-32", active: false },
                { w: "w-20", active: false },
                { w: "w-16", active: false },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-3 px-5 py-3.5 relative ${
                    item.active ? "bg-emerald-950/5" : ""
                  }`}
                >
                  {item.active && (
                    <span className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500/80 rounded-r-full" />
                  )}
                  <div className="w-4 h-4 rounded bg-charcoal-200/70 animate-pulse shrink-0" />
                  <div className={`h-3.5 ${item.w} bg-charcoal-200/70 rounded-md animate-pulse`} />
                </div>
              ))}
            </div>

            {/* Logout button skeleton */}
            <div className="w-full flex items-center gap-3 px-5 py-3.5 bg-white rounded-2xl border border-charcoal-100 shadow-2xs">
              <div className="w-4 h-4 rounded bg-rose-200/60 animate-pulse shrink-0" />
              <div className="h-3.5 w-16 bg-rose-200/60 rounded-md animate-pulse" />
            </div>
          </aside>

          {/* Main content skeleton */}
          <main className="flex-1 min-w-0 space-y-6">
            {/* Stats Cards Grid (5 cards) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {[
                { labelW: "w-16", valW: "w-10", isCoin: false },
                { labelW: "w-20", valW: "w-8", isCoin: false },
                { labelW: "w-14", valW: "w-8", isCoin: false },
                { labelW: "w-16", valW: "w-16", isCoin: false },
                { labelW: "w-20", valW: "w-14", isCoin: true },
              ].map((stat, i) => (
                <div
                  key={i}
                  className={`bg-white rounded-2xl border p-4 sm:p-5 flex flex-col justify-between shadow-2xs min-h-[116px] ${
                    stat.isCoin ? "border-amber-200/60" : "border-charcoal-100"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-8 h-8 rounded-xl border flex items-center justify-center ${
                        stat.isCoin
                          ? "bg-amber-50 border-amber-200/50"
                          : "bg-warm-50 border-charcoal-100"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded ${stat.isCoin ? "bg-amber-300/60" : "bg-charcoal-200/70"} animate-pulse`} />
                    </div>
                    {stat.isCoin && (
                      <div className="h-4 w-12 rounded-full bg-amber-100/70 border border-amber-200/50 animate-pulse" />
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <div className={`h-6 ${stat.valW} ${stat.isCoin ? "bg-amber-400/40" : "bg-charcoal-200/80"} rounded-md animate-pulse`} />
                    <div className={`h-3 ${stat.labelW} bg-charcoal-200/50 rounded-md animate-pulse`} />
                  </div>
                </div>
              ))}
            </div>

            {/* Member since banner skeleton */}
            <div className="bg-charcoal-950 rounded-2xl p-6 flex items-center justify-between shadow-xs">
              <div className="space-y-2">
                <div className="h-2.5 w-24 bg-charcoal-700/80 rounded-full animate-pulse" />
                <div className="h-4 w-32 bg-charcoal-600/80 rounded-md animate-pulse" />
              </div>
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                <div className="w-5 h-5 rounded-full bg-white/20 animate-pulse" />
              </div>
            </div>

            {/* Recent Orders section skeleton */}
            <div className="bg-white rounded-2xl border border-charcoal-100 overflow-hidden shadow-2xs">
              <div className="px-6 py-4 border-b border-charcoal-50 flex items-center justify-between">
                <div className="h-4 w-28 bg-charcoal-200/70 rounded-md animate-pulse" />
                <div className="h-3 w-20 bg-charcoal-200/50 rounded-full animate-pulse" />
              </div>
              <div className="divide-y divide-charcoal-50">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-charcoal-100 animate-pulse shrink-0" />
                      <div className="space-y-2">
                        <div className="h-4 w-36 sm:w-48 bg-charcoal-200/70 rounded-md animate-pulse" />
                        <div className="h-3 w-24 bg-charcoal-150 rounded-md animate-pulse" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-6 self-end sm:self-center">
                      <div className="h-6 w-20 rounded-full bg-charcoal-100 animate-pulse" />
                      <div className="h-5 w-16 bg-charcoal-200/70 rounded-md animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
