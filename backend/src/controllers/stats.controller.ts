import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import Product from "../models/Product";
import User from "../models/User";
import CacheService from "../services/cache.service";

// ─── GET /api/stats/hero  (public) ─────────────────────────────────────────────
export const getHeroStats = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const cacheKey = "stats:hero";
    const cached = await CacheService.get(cacheKey);

    if (cached) {
      res.status(200).json({
        success: true,
        data: cached,
        fromCache: true,
      });
      return;
    }

    const [productsCount, customersCount, ratingAgg] = await Promise.all([
      Product.countDocuments({ isVisible: true }),
      User.countDocuments({ role: "user", isBlocked: false }),
      Product.aggregate<{ avgRating: number }>([
        { $match: { isVisible: true } },
        { $group: { _id: null, avgRating: { $avg: "$rating" } } },
      ]),
    ]);

    const avgRating =
      ratingAgg.length > 0 && typeof ratingAgg[0]?.avgRating === "number"
        ? ratingAgg[0].avgRating
        : 0;

    const result = {
      productsCount,
      customersCount,
      avgRating,
    };

    // Cache hero stats for 5 minutes (300 seconds)
    await CacheService.set(cacheKey, result, 300);

    res.status(200).json({
      success: true,
      data: result,
    });
  }
);
