"use client";

import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, ShoppingBag, ShoppingCart, Heart, User } from "lucide-react";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { totalItems, openCart } = useCart();
  const { favorites } = useFavorites();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(Boolean(token));
  }, [pathname]);

  // Hide on admin routes
  if (pathname.startsWith("/admin")) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-white/10 px-2 py-2.5 flex items-center justify-around shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      {/* Home */}
      <Link
        href="/"
        className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-2xl transition-all ${
          pathname === "/"
            ? "text-amber-400 font-black scale-105"
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        <Home
          className="w-5 h-5"
          strokeWidth={pathname === "/" ? 2.5 : 1.8}
        />
        <span className="text-[10px] font-bold tracking-tight">Home</span>
      </Link>

      {/* Shop */}
      <Link
        href="/shop"
        className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-2xl transition-all ${
          pathname.startsWith("/shop") || pathname.startsWith("/product")
            ? "text-amber-400 font-black scale-105"
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        <ShoppingBag
          className="w-5 h-5"
          strokeWidth={pathname.startsWith("/shop") ? 2.5 : 1.8}
        />
        <span className="text-[10px] font-bold tracking-tight">Shop</span>
      </Link>

      {/* Cart Drawer Trigger */}
      <button
        type="button"
        onClick={openCart}
        className="relative flex flex-col items-center gap-0.5 px-3 py-1 rounded-2xl text-slate-400 hover:text-amber-400 transition-all active:scale-95 cursor-pointer"
      >
        <div className="relative">
          <ShoppingCart className="w-5 h-5" strokeWidth={1.8} />
          {totalItems > 0 && (
            <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[9px] font-black flex items-center justify-center animate-bounce shadow-md">
              {totalItems}
            </span>
          )}
        </div>
        <span className="text-[10px] font-bold tracking-tight">Cart</span>
      </button>

      {/* Wishlist / Favorites */}
      <Link
        href="/favorites"
        className={`relative flex flex-col items-center gap-0.5 px-3 py-1 rounded-2xl transition-all ${
          pathname === "/favorites"
            ? "text-amber-400 font-black scale-105"
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        <div className="relative">
          <Heart
            className="w-5 h-5"
            strokeWidth={pathname === "/favorites" ? 2.5 : 1.8}
          />
          {favorites.size > 0 && (
            <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[8px] font-black flex items-center justify-center">
              {favorites.size}
            </span>
          )}
        </div>
        <span className="text-[10px] font-bold tracking-tight">Saved</span>
      </Link>

      {/* Account / Profile */}
      <Link
        href={isLoggedIn ? "/profile" : "/login"}
        className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-2xl transition-all ${
          pathname === "/profile" || pathname === "/login"
            ? "text-amber-400 font-black scale-105"
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        <User
          className="w-5 h-5"
          strokeWidth={pathname === "/profile" || pathname === "/login" ? 2.5 : 1.8}
        />
        <span className="text-[10px] font-bold tracking-tight">
          {isLoggedIn ? "Account" : "Sign In"}
        </span>
      </Link>
    </div>
  );
}
