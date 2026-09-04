"use client";

import ProductCard from "@/components/product/ProductCard";
import { useCart } from "@/context/CartContext";
import { getApiBase } from "@/lib/apiBase";
import { notifyInfo } from "@/lib/notify";
import { Product } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ShoppingBag,
  Check,
  Minus,
  Plus,
  Trash2,
  ChevronLeft,
  Lock,
} from "lucide-react";

interface ApiProduct {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: { _id: string; name: string; slug: string } | string;
  images: string[];
  sizes: string[];
  colors: string[];
  badge?: "New" | "Sale" | "Best Seller";
  description: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  stock?: number;
  totalOrdered?: number;
  tags?: string[];
}

function mapProduct(p: ApiProduct): Product {
  const catSlug = typeof p.category === "object" ? p.category.slug : p.category;
  return {
    id: p._id,
    name: p.name,
    price: p.price,
    originalPrice: p.originalPrice,
    category: catSlug,
    images: p.images,
    sizes: p.sizes,
    colors: p.colors,
    badge: p.badge,
    description: p.description,
    rating: p.rating,
    reviews: p.reviews,
    inStock: p.inStock,
    stock: p.stock,
    totalOrdered: p.totalOrdered,
    tags: p.tags,
  };
}

export default function CartPage() {
  const router = useRouter();
  const { state, removeItem, updateQuantity, subtotal, totalItems } = useCart();
  const [suggested, setSuggested] = useState<Product[]>([]);

  const handleCheckoutClick = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      notifyInfo("Please log in to proceed to checkout.");
      router.push("/login?redirect=/checkout");
    } else {
      router.push("/checkout");
    }
  };

  useEffect(() => {
    fetch(`${getApiBase()}/api/products?badge=Best+Seller&limit=4`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setSuggested((j.data as ApiProduct[]).map(mapProduct));
      })
      .catch(() => {});
  }, []);

  const shipping = subtotal >= 1200 ? 0 : 9.99;
  const tax = 0;
  const total = subtotal + shipping;

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center py-28">
        <div className="w-20 h-20 rounded-full bg-charcoal-50 flex items-center justify-center mb-7">
          <ShoppingBag className="w-9 h-9 text-charcoal-300" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-semibold text-charcoal-950 mb-3">
          Your cart is empty
        </h1>
        <p className="text-charcoal-400 mb-9 max-w-sm font-light">
          Looks like you haven&apos;t added anything to your cart yet. Explore
          our collection to find something you love.
        </p>
        <Link href="/shop" className="btn-primary">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        <h1 className="text-3xl font-semibold text-charcoal-950 mb-2 tracking-tight">
          Shopping Cart
        </h1>
        <p className="text-charcoal-400 text-sm mb-12 font-light">
          {totalItems} {totalItems === 1 ? "item" : "items"}
        </p>

        <div className="grid lg:grid-cols-3 gap-14">
          <div className="lg:col-span-2">
            {subtotal < 1200 && (
              <div className="mb-7 p-5 bg-accent-50 rounded-2xl border border-accent-100">
                <div className="flex justify-between text-sm mb-2.5">
                  <span className="text-accent-700 font-medium">
                    Add <strong>৳{(1200 - subtotal).toFixed(2)}</strong> more
                    for free shipping
                  </span>
                  <span className="text-accent-500 text-xs font-light">
                    ৳{subtotal.toFixed(2)} / ৳1200
                  </span>
                </div>
                <div className="h-1.5 bg-accent-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent-600 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((subtotal / 1200) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}
            {subtotal >= 1200 && (
              <div className="mb-7 p-5 bg-green-50 rounded-2xl flex items-center gap-2.5">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-700 font-medium">
                  You qualify for free shipping!
                </span>
              </div>
            )}

            <div className="divide-y divide-charcoal-100">
              {state.items.map((item, index) => (
                <div
                  key={`${item.product.id}-${item.size}-${item.color}-${index}`}
                  className="py-7 flex gap-5"
                >
                  <Link
                    href={`/product/${item.product.id}`}
                    className="relative w-24 h-32 flex-shrink-0 rounded-2xl overflow-hidden bg-warm-50 shadow-soft"
                  >
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-4">
                      <div>
                        <Link
                          href={`/product/${item.product.id}`}
                          className="text-base font-medium text-charcoal-900 hover:text-charcoal-600 transition-colors duration-300 line-clamp-1"
                        >
                          {item.product.name}
                        </Link>
                        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5">
                          <span className="text-sm text-charcoal-400 font-light">
                            Size: {item.size}
                          </span>
                          <span className="text-sm text-charcoal-400 font-light">
                            Color: {item.color}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-base font-semibold text-charcoal-900">
                          ৳{(item.product.price * item.quantity).toFixed(2)}
                        </p>
                        {item.product.originalPrice &&
                          item.product.originalPrice > item.product.price && (
                            <p className="text-sm text-charcoal-300 line-through font-light">
                              ৳
                              {(
                                item.product.originalPrice * item.quantity
                              ).toFixed(2)}
                            </p>
                          )}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center border border-charcoal-200 rounded-lg">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.size,
                              item.color,
                              item.quantity - 1,
                            )
                          }
                          className="w-9 h-9 flex items-center justify-center text-charcoal-400 hover:text-charcoal-900 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-9 text-center text-sm font-medium text-charcoal-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.size,
                              item.color,
                              item.quantity + 1,
                            )
                          }
                          className="w-9 h-9 flex items-center justify-center text-charcoal-400 hover:text-charcoal-900 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() =>
                          removeItem(item.product.id, item.size, item.color)
                        }
                        className="text-sm text-charcoal-300 hover:text-red-500 transition-colors duration-300 flex items-center gap-1.5"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-7 pt-7 border-t border-charcoal-100">
              <Link
                href="/shop"
                className="btn-secondary text-sm inline-flex items-center gap-2 group"
              >
                <ChevronLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
                Continue Shopping
              </Link>
            </div>
          </div>

          <div>
            <div className="bg-warm-50 rounded-2xl p-7 sticky top-28 border border-warm-100">
              <h2 className="text-lg font-semibold text-charcoal-950 mb-7">
                Order Summary
              </h2>

              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-charcoal-500 font-light">
                    Subtotal ({totalItems} items)
                  </span>
                  <span className="font-medium text-charcoal-900">
                    ৳{subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500 font-light">Shipping</span>
                  <span className="font-medium text-charcoal-900">
                    {shipping === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      `৳${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-warm-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Promo code"
                    className="input-field flex-1 text-xs py-3 !bg-white"
                  />
                  <button className="px-5 py-3 text-xs font-medium border border-charcoal-200 rounded-xl hover:bg-white transition-all duration-300 whitespace-nowrap">
                    Apply
                  </button>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-warm-200 flex justify-between">
                <span className="text-base font-semibold text-charcoal-950">
                  Total
                </span>
                <span className="text-xl font-bold text-charcoal-950">
                  ৳{total.toFixed(2)}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCheckoutClick}
                className="btn-primary w-full text-center mt-6 block"
              >
                Proceed to Checkout
              </button>

              <div className="mt-5 flex items-center justify-center gap-2 text-xs text-charcoal-300">
                <Lock className="w-4 h-4" />
                <span className="font-light">
                  Secure SSL encrypted checkout
                </span>
              </div>
            </div>
          </div>
        </div>

        {suggested.length > 0 && (
          <div className="mt-24 pt-14 border-t border-charcoal-100">
            <span className="section-label">Recommended</span>
            <h2 className="section-title mb-10">You Might Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10 sm:gap-x-7">
              {suggested.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
