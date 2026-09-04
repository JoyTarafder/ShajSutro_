"use client";

import React from "react";

// ─────────────────────────────────────────────────────────────────────────────
// 1. DASHBOARD SKELETON
// ─────────────────────────────────────────────────────────────────────────────

export function DashboardSkeleton() {
  return (
    <div className="p-4 sm:p-8 space-y-7 animate-pulse">
      {/* 4 Stat Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-3xl p-4 sm:p-5 border flex items-center gap-4"
            style={{
              background: "rgba(15, 15, 25, 0.75)",
              borderColor: "rgba(255, 255, 255, 0.08)",
            }}
          >
            <div className="w-12 h-12 rounded-2xl bg-white/[0.06] shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-20 bg-white/[0.06] rounded-md" />
              <div className="h-7 w-32 bg-white/[0.09] rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* 2 Growth Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="rounded-2xl border p-5 flex items-center justify-between"
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              borderColor: "rgba(255, 255, 255, 0.07)",
            }}
          >
            <div className="space-y-2.5">
              <div className="h-3.5 w-36 bg-white/[0.06] rounded" />
              <div className="flex items-baseline gap-2">
                <div className="h-6 w-24 bg-white/[0.09] rounded" />
                <div className="h-3 w-16 bg-white/[0.04] rounded" />
              </div>
              <div className="h-3 w-28 bg-white/[0.04] rounded" />
            </div>
            <div className="h-8 w-16 rounded-xl bg-white/[0.06]" />
          </div>
        ))}
      </div>

      {/* Charts Skeleton Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Chart Box */}
        <div
          className="xl:col-span-2 rounded-3xl p-6 border space-y-5"
          style={{
            background: "rgba(15, 15, 25, 0.75)",
            borderColor: "rgba(255, 255, 255, 0.08)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="h-4 w-36 bg-white/[0.08] rounded-md" />
              <div className="h-3 w-24 bg-white/[0.04] rounded-md" />
            </div>
            <div className="w-8 h-8 rounded-xl bg-white/[0.06]" />
          </div>
          {/* Chart Graphic Placeholder */}
          <div className="h-[220px] rounded-2xl bg-white/[0.02] border border-white/5 flex items-end justify-between px-6 pb-4 pt-8 gap-3">
            {[40, 65, 30, 85, 55, 75, 95, 60, 80, 45, 70, 90].map((h, idx) => (
              <div
                key={idx}
                className="flex-1 bg-white/[0.04] rounded-t-lg transition-all"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>

        {/* Order Status Chart Box */}
        <div
          className="rounded-3xl p-6 border space-y-5"
          style={{
            background: "rgba(15, 15, 25, 0.75)",
            borderColor: "rgba(255, 255, 255, 0.08)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="h-4 w-32 bg-white/[0.08] rounded-md" />
              <div className="h-3 w-28 bg-white/[0.04] rounded-md" />
            </div>
            <div className="w-8 h-8 rounded-xl bg-white/[0.06]" />
          </div>
          {/* Donut Chart Placeholder */}
          <div className="h-[220px] flex flex-col items-center justify-center gap-3">
            <div className="w-36 h-36 rounded-full border-8 border-white/[0.06] border-t-white/[0.12] border-r-white/[0.1] flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-slate-950/60 flex flex-col items-center justify-center">
                <div className="h-5 w-8 bg-white/[0.08] rounded" />
                <div className="h-2 w-10 bg-white/[0.04] rounded mt-1" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Products & Low Stock Skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="rounded-3xl p-6 border space-y-4"
            style={{
              background: "rgba(15, 15, 25, 0.75)",
              borderColor: "rgba(255, 255, 255, 0.08)",
            }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="space-y-1.5">
                <div className="h-4 w-40 bg-white/[0.08] rounded-md" />
                <div className="h-3 w-28 bg-white/[0.04] rounded-md" />
              </div>
              <div className="w-8 h-8 rounded-xl bg-white/[0.06]" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((row) => (
                <div key={row} className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.06]" />
                    <div className="space-y-1.5">
                      <div className="h-3.5 w-32 bg-white/[0.08] rounded" />
                      <div className="h-3 w-20 bg-white/[0.04] rounded" />
                    </div>
                  </div>
                  <div className="h-5 w-16 bg-white/[0.06] rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. ORDERS TABLE SKELETON
// ─────────────────────────────────────────────────────────────────────────────

export function OrdersTableSkeleton({ rows = 7 }: { rows?: number }) {
  return (
    <div className="w-full animate-pulse overflow-hidden">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-white/5 bg-white/[0.02]">
            {["Order", "Customer", "Items", "Destination", "Total", "Payment", "Status", "Date", ""].map((h, i) => (
              <th key={i} className="px-5 py-4">
                <div className="h-3 w-16 bg-white/[0.05] rounded" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="h-16">
              {/* Order ID */}
              <td className="px-5 py-4">
                <div className="h-5 w-20 bg-white/[0.08] rounded-lg" />
              </td>
              {/* Customer */}
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/[0.06] shrink-0" />
                  <div className="space-y-1.5">
                    <div className="h-3.5 w-28 bg-white/[0.08] rounded" />
                    <div className="h-3 w-36 bg-white/[0.04] rounded" />
                  </div>
                </div>
              </td>
              {/* Items */}
              <td className="px-5 py-4">
                <div className="h-5 w-14 bg-white/[0.06] rounded-full" />
              </td>
              {/* Destination */}
              <td className="px-5 py-4">
                <div className="h-3.5 w-24 bg-white/[0.06] rounded" />
              </td>
              {/* Total */}
              <td className="px-5 py-4">
                <div className="h-4 w-16 bg-white/[0.09] rounded" />
              </td>
              {/* Payment */}
              <td className="px-5 py-4">
                <div className="h-5 w-16 bg-white/[0.06] rounded-full" />
              </td>
              {/* Status */}
              <td className="px-5 py-4">
                <div className="h-6 w-20 bg-white/[0.07] rounded-full" />
              </td>
              {/* Date */}
              <td className="px-5 py-4">
                <div className="h-3 w-20 bg-white/[0.05] rounded" />
              </td>
              {/* Action */}
              <td className="px-5 py-4 text-right">
                <div className="h-8 w-20 bg-white/[0.06] rounded-xl ml-auto" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. PRODUCTS TABLE SKELETON
// ─────────────────────────────────────────────────────────────────────────────

export function ProductsTableSkeleton({ rows = 7 }: { rows?: number }) {
  return (
    <div className="w-full animate-pulse overflow-hidden">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-white/10 bg-white/[0.04]">
            {["Product", "SKU", "Price", "Stock", "Featured", "Actions"].map((h, i) => (
              <th key={i} className="px-5 py-4">
                <div className="h-3 w-16 bg-white/[0.06] rounded" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="h-16">
              {/* Product with image */}
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.06] shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3.5 w-44 bg-white/[0.08] rounded" />
                    <div className="h-3 w-24 bg-white/[0.04] rounded" />
                  </div>
                </div>
              </td>
              {/* SKU */}
              <td className="px-5 py-3.5">
                <div className="h-4 w-16 bg-white/[0.06] rounded font-mono" />
              </td>
              {/* Price */}
              <td className="px-5 py-3.5">
                <div className="h-4 w-16 bg-white/[0.09] rounded" />
              </td>
              {/* Stock */}
              <td className="px-5 py-3.5">
                <div className="h-6 w-20 bg-white/[0.06] rounded-full" />
              </td>
              {/* Featured */}
              <td className="px-5 py-3.5">
                <div className="h-6 w-16 bg-white/[0.05] rounded-full" />
              </td>
              {/* Actions */}
              <td className="px-5 py-3.5 text-right">
                <div className="flex items-center gap-2 justify-end">
                  <div className="h-8 w-14 bg-white/[0.06] rounded-xl" />
                  <div className="h-8 w-14 bg-white/[0.06] rounded-xl" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. USERS TABLE SKELETON
// ─────────────────────────────────────────────────────────────────────────────

export function UsersTableSkeleton({ rows = 7 }: { rows?: number }) {
  return (
    <div className="w-full animate-pulse overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead className="bg-white/[0.02] border-b border-white/8 text-slate-400 uppercase font-bold tracking-wider text-[11px]">
          <tr>
            <th className="px-5 py-3.5">User</th>
            <th className="px-5 py-3.5">Role</th>
            <th className="px-5 py-3.5">Status</th>
            <th className="px-5 py-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="h-16">
              {/* User Avatar + Name & Email */}
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/[0.06] shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3.5 w-32 bg-white/[0.08] rounded" />
                    <div className="h-3 w-44 bg-white/[0.04] rounded" />
                  </div>
                </div>
              </td>
              {/* Role */}
              <td className="px-5 py-3.5">
                <div className="h-6 w-20 bg-white/[0.06] rounded-full" />
              </td>
              {/* Status */}
              <td className="px-5 py-3.5">
                <div className="h-6 w-16 bg-white/[0.06] rounded-full" />
              </td>
              {/* Actions */}
              <td className="px-5 py-3.5 text-right">
                <div className="flex items-center gap-2 justify-end">
                  <div className="h-7 w-16 bg-white/[0.06] rounded-xl" />
                  <div className="h-7 w-16 bg-white/[0.06] rounded-xl" />
                  <div className="h-7 w-16 bg-white/[0.06] rounded-xl" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
