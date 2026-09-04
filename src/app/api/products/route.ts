import { NextResponse } from "next/server";
import { products } from "@/data/products";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  try {
    const res = await fetch(`${backendUrl}/api/products${url.search}`, {
      next: { revalidate: 30 },
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        return NextResponse.json(data);
      }
    }
  } catch {
    // Fallback directly to real ShajSutro products catalog
  }

  return NextResponse.json({
    success: true,
    data: products,
    pagination: {
      page: 1,
      limit: products.length,
      total: products.length,
      pages: 1,
    },
  });
}
