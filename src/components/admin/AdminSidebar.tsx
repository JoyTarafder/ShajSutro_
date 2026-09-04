"use client";

import { useAdminAuth } from "@/context/AdminAuthContext";
import Logo from "@/components/layout/Logo";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutGrid,
  Users,
  ShoppingBag,
  Ticket,
  ClipboardList,
  MessageSquare,
  FolderTree,
  Briefcase,
  Bell,
  Mail,
  FileText,
  User,
  ExternalLink,
  LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  {
    key: "dashboard",
    label: "Dashboard",
    href: "/admin/dashboard",
    iconColor: "text-indigo-400",
    iconBg: "bg-indigo-500/15 border-indigo-500/20",
    activeBg:
      "bg-gradient-to-r from-indigo-500/20 via-violet-500/10 to-transparent text-white font-bold",
    barGradient:
      "from-indigo-400 to-violet-500 shadow-[0_0_12px_rgba(99,102,241,0.8)]",
    icon: <LayoutGrid className="w-4 h-4" />,
  },
  {
    key: "users",
    label: "Users",
    href: "/admin/users",
    iconColor: "text-cyan-400",
    iconBg: "bg-cyan-500/15 border-cyan-500/20",
    activeBg:
      "bg-gradient-to-r from-cyan-500/20 via-blue-500/10 to-transparent text-white font-bold",
    barGradient:
      "from-cyan-400 to-blue-500 shadow-[0_0_12px_rgba(6,182,212,0.8)]",
    icon: <Users className="w-4 h-4" />,
  },
  {
    key: "products",
    label: "Products",
    href: "/admin/products",
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/15 border-emerald-500/20",
    activeBg:
      "bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-transparent text-white font-bold",
    barGradient:
      "from-emerald-400 to-teal-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]",
    icon: <ShoppingBag className="w-4 h-4" />,
  },
  {
    key: "promoCodes",
    label: "Promo Codes",
    href: "/admin/promo-codes",
    iconColor: "text-rose-400",
    iconBg: "bg-rose-500/15 border-rose-500/20",
    activeBg:
      "bg-gradient-to-r from-rose-500/20 via-pink-500/10 to-transparent text-white font-bold",
    barGradient:
      "from-rose-400 to-pink-500 shadow-[0_0_12px_rgba(244,63,94,0.8)]",
    icon: <Ticket className="w-4 h-4" />,
  },
  {
    key: "orders",
    label: "Orders",
    href: "/admin/orders",
    iconColor: "text-amber-400",
    iconBg: "bg-amber-500/15 border-amber-500/20",
    activeBg:
      "bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-transparent text-white font-bold",
    barGradient:
      "from-amber-400 to-orange-500 shadow-[0_0_12px_rgba(245,158,11,0.8)]",
    icon: <ClipboardList className="w-4 h-4" />,
  },
  {
    key: "messages",
    label: "Messages",
    href: "/admin/messages",
    iconColor: "text-purple-400",
    iconBg: "bg-purple-500/15 border-purple-500/20",
    activeBg:
      "bg-gradient-to-r from-purple-500/20 via-pink-500/10 to-transparent text-white font-bold",
    barGradient:
      "from-purple-400 to-pink-500 shadow-[0_0_12px_rgba(168,85,247,0.8)]",
    icon: <MessageSquare className="w-4 h-4" />,
  },
  {
    key: "categories",
    label: "Categories",
    href: "/admin/categories",
    iconColor: "text-fuchsia-400",
    iconBg: "bg-fuchsia-500/15 border-fuchsia-500/20",
    activeBg:
      "bg-gradient-to-r from-fuchsia-500/20 via-rose-500/10 to-transparent text-white font-bold",
    barGradient:
      "from-fuchsia-400 to-rose-500 shadow-[0_0_12px_rgba(217,70,239,0.8)]",
    icon: <FolderTree className="w-4 h-4" />,
  },
  {
    key: "jobs",
    label: "Jobs",
    href: "/admin/jobs",
    iconColor: "text-blue-400",
    iconBg: "bg-blue-500/15 border-blue-500/20",
    activeBg:
      "bg-gradient-to-r from-blue-500/20 via-indigo-500/10 to-transparent text-white font-bold",
    barGradient:
      "from-blue-400 to-cyan-500 shadow-[0_0_12px_rgba(59,130,246,0.8)]",
    icon: <Briefcase className="w-4 h-4" />,
  },
  {
    key: "notifications",
    label: "Notifications",
    href: "/admin/notifications",
    iconColor: "text-amber-400",
    iconBg: "bg-amber-500/15 border-amber-500/20",
    activeBg:
      "bg-gradient-to-r from-amber-500/20 via-rose-500/10 to-transparent text-white font-bold",
    barGradient:
      "from-amber-400 to-rose-500 shadow-[0_0_12px_rgba(245,158,11,0.8)]",
    icon: <Bell className="w-4 h-4" />,
  },
  {
    key: "subscribers",
    label: "Subscribers",
    href: "/admin/subscribers",
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/15 border-emerald-500/20",
    activeBg:
      "bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-transparent text-white font-bold",
    barGradient:
      "from-emerald-400 to-teal-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]",
    icon: <Mail className="w-4 h-4" />,
  },
];



export default function AdminSidebar() {
  const pathname = usePathname();
  const { admin, logout, isMobileSidebarOpen, closeMobileSidebar } = useAdminAuth();
  const isProductsSection =
    pathname === "/admin/products" ||
    pathname.startsWith("/admin/products/") ||
    pathname === "/admin/promo-codes" ||
    pathname.startsWith("/admin/promo-codes/");
  const isJobsSection =
    pathname === "/admin/jobs" ||
    pathname.startsWith("/admin/jobs/") ||
    pathname === "/admin/applications" ||
    pathname.startsWith("/admin/applications/");

  const isRootAdmin = !admin?.adminRole || admin.adminRole === "root_admin";
  const permissions = admin?.permissions;

  const filteredNavItems = NAV_ITEMS.filter((item) => {
    if (isRootAdmin) return true;
    if (!permissions) return true;
    const key = item.key as keyof typeof permissions;
    return permissions[key] !== false;
  });

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 md:hidden transition-opacity"
          onClick={closeMobileSidebar}
        />
      )}

      <aside
        className={`fixed md:static top-0 bottom-0 left-0 z-50 w-72 md:w-64 h-screen flex flex-col flex-shrink-0 border-r border-slate-800/80 shadow-2xl transition-transform duration-300 ease-in-out ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
        style={{ background: "#09090b" }}
      >
      {/* Brand */}
      <div className="px-5 py-5 border-b border-white/10 relative overflow-hidden bg-gradient-to-r from-violet-950/30 via-slate-900 to-indigo-950/30 shrink-0 flex items-center justify-between">
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-3 group relative z-10"
        >
          <Logo size="sm" dark={false} />
        </Link>
        <span className="text-violet-400/90 text-[10px] font-extrabold tracking-[0.15em] uppercase px-2 py-0.5 rounded-md bg-white/5 border border-white/10 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
          {isRootAdmin ? "Root" : "Admin"}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 min-h-0 px-3.5 py-4 space-y-2 overflow-y-auto custom-scrollbar">
        <p className="px-3 mb-2.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-violet-400/80">
          Menu
        </p>
        <div className="space-y-1.5">
          {filteredNavItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <div key={item.href} className="space-y-1">
                <Link
                  href={item.href}
                  onClick={closeMobileSidebar}
                  aria-label={item.label}
                  className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 group ${
                    isActive
                      ? item.activeBg
                      : "text-slate-400 hover:text-white hover:bg-white/[0.06]"
                  }`}
                >
                  {/* Glowing vertical line for active route */}
                  {isActive && (
                    <span
                      className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-gradient-to-b ${item.barGradient}`}
                    />
                  )}

                  {/* Icon with colorful background badge */}
                  <div
                    className={`w-7 h-7 rounded-xl border flex items-center justify-center transition-all duration-200 ${
                      isActive
                        ? `${item.iconBg} ${item.iconColor} shadow-md shadow-black/20 ring-1 ring-white/10 scale-105`
                        : `${item.iconBg} ${item.iconColor} opacity-75 group-hover:opacity-100 group-hover:scale-105`
                    }`}
                  >
                    {item.icon}
                  </div>

                  <span
                    className={
                      isActive
                        ? "text-white font-bold"
                        : "group-hover:text-slate-200"
                    }
                  >
                    {item.label}
                  </span>
                </Link>

                {/* Jobs sub-section */}
                {item.href === "/admin/jobs" && isJobsSection && (
                  <Link
                    href="/admin/applications"
                    onClick={closeMobileSidebar}
                    aria-label="Job Applications"
                    className={`relative flex items-center gap-2.5 pl-11 pr-3 py-2 min-h-[40px] rounded-2xl text-sm font-semibold transition-all duration-200 ${
                      pathname === "/admin/applications" ||
                      pathname.startsWith("/admin/applications/")
                        ? "bg-teal-500/20 text-teal-300 font-bold border-l-2 border-teal-400"
                        : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="w-5 h-5 rounded-lg bg-teal-500/15 border border-teal-500/20 text-teal-400 flex items-center justify-center">
                      <FileText className="w-3 h-3" />
                    </div>
                    Applications
                  </Link>
                )}

              </div>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="px-3.5 py-4 border-t border-white/10 bg-[#09090b] shrink-0 flex-shrink-0 mt-auto">
        <p className="px-3 mb-3 text-[10px] font-extrabold uppercase tracking-[0.2em] text-violet-400/80">
          Account
        </p>
        <div className="space-y-1">
          <Link
            href="/admin/profile"
            onClick={closeMobileSidebar}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 ${
              pathname === "/admin/profile"
                ? "bg-violet-500/20 text-violet-300 border-l-2 border-violet-400"
                : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
            }`}
          >
            <div className="w-7 h-7 rounded-xl bg-violet-500/15 border border-violet-500/20 text-violet-400 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            Profile Settings
          </Link>
          <Link
            href="/"
            target="_blank"
            onClick={closeMobileSidebar}
            className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all duration-200"
          >
            <div className="w-7 h-7 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ExternalLink className="w-4 h-4" />
            </div>
            View Store
          </Link>
          <button
            onClick={() => {
              closeMobileSidebar();
              logout();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200"
          >
            <div className="w-7 h-7 rounded-xl bg-rose-500/15 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <LogOut className="w-4 h-4" />
            </div>
            Sign Out
          </button>
        </div>
      </div>
    </aside>
    </>
  );
}
