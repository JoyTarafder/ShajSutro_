import { Response } from "express";
import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import PDFDocument from "pdfkit";
import Order from "../models/Order";
import Product from "../models/Product";
import PromoCode from "../models/PromoCode";
import User from "../models/User";
import { AppError } from "../middleware/error.middleware";
import { AuthRequest, IShippingAddress } from "../types";
import { sendOrderConfirmationEmail } from "../services/emailService";

interface FrontendOrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image: string;
}

// ─── POST /api/orders — place order ───────────────────────────────────────────

export const placeOrder = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const {
      shippingAddress,
      paymentMethod,
      txnId = "",
      items: frontendItems,
      promoCode = "",
      coinsToUse = 0,
    } = req.body as {
      shippingAddress: IShippingAddress;
      paymentMethod: "bkash" | "nagad" | "rocket" | "cod";
      txnId?: string;
      items: FrontendOrderItem[];
      promoCode?: string;
      coinsToUse?: number;
    };

    if (!shippingAddress) throw new AppError("Shipping address is required", 400);
    if (!shippingAddress.phone || !/^01[3-9]\d{8}$/.test(shippingAddress.phone.trim())) {
      throw new AppError("Phone number must be valid 11 digits (e.g. 017XXXXXXXX)", 400);
    }
    if (!paymentMethod)   throw new AppError("Payment method is required", 400);
    if (!frontendItems || frontendItems.length === 0) throw new AppError("Order must contain at least one item", 400);
    if (paymentMethod !== "cod" && !txnId.trim()) throw new AppError("Transaction ID is required for mobile payments", 400);

    // Build order items and strictly validate price & stock from database
    const orderItems = [];
    const stockOps: Promise<unknown>[] = [];
    for (const item of frontendItems) {
      if (!item) continue;
      const rawId = (item.productId ?? "").toString().trim();
      const itemName = item.name ?? "Product";

      const product = mongoose.isValidObjectId(rawId)
        ? await Product.findById(rawId)
        : (await Product.findOne({ slug: rawId.toLowerCase() })) ??
          (await Product.findOne({
            name: { $regex: `^${rawId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
          })) ??
          (await Product.findOne({
            name: { $regex: `^${itemName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
          }));

      if (!product) {
        throw new AppError(`Product "${itemName}" is invalid or no longer available`, 400);
      }

      if (!product.inStock || product.stock <= 0) {
        throw new AppError(`"${product.name}" is out of stock`, 400);
      }
      const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));
      if (product.stock > 0 && qty > product.stock) {
        throw new AppError(
          `Only ${product.stock} unit${product.stock !== 1 ? "s" : ""} of "${product.name}" available`,
          400
        );
      }

      // Strictly use verified price from MongoDB
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: qty,
        size: item.size || "",
        color: item.color || "",
        image: product.images && product.images[0] ? product.images[0] : "",
      });

      stockOps.push(
        Product.findByIdAndUpdate(product._id, {
          $inc: { stock: -qty, totalOrdered: qty },
        })
      );
    }

    if (orderItems.length === 0) {
      throw new AppError("No valid items in the order", 400);
    }

    const subtotal     = parseFloat(orderItems.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2));
    const shippingCost = subtotal >= 1200 ? 0 : 9.99;
    const tax          = 0;

    // Server-side promo code validation & discount calculation
    let calculatedDiscount = 0;
    let validatedPromoCode = "";

    const userEmail = (shippingAddress.email || req.user?.email || "").trim().toLowerCase();
    const userId = req.user?._id;

    if (promoCode && typeof promoCode === "string" && promoCode.trim()) {
      const codeUpper = promoCode.trim().toUpperCase();
      const promo = await PromoCode.findOne({ code: codeUpper, isActive: true });

      if (promo) {
        const isNotExpired = !promo.expiresAt || new Date() <= new Date(promo.expiresAt);
        const hasUsesLeft = promo.maxUses === null || promo.maxUses === undefined || promo.usedCount < promo.maxUses;
        const meetsMinAmount = subtotal >= (promo.minOrderAmount || 0);

        let isEligible = isNotExpired && hasUsesLeft && meetsMinAmount;

        // Check First Order Only limit
        if (isEligible && promo.isFirstOrderOnly) {
          const orderQueryConditions: any[] = [];
          if (userId) orderQueryConditions.push({ user: userId });
          if (userEmail) orderQueryConditions.push({ "shippingAddress.email": userEmail });

          if (orderQueryConditions.length > 0) {
            const previousOrders = await Order.countDocuments({
              $or: orderQueryConditions,
              status: { $nin: ["cancelled", "refunded"] },
            });
            if (previousOrders > 0) {
              isEligible = false;
            }
          }
        }

        // Check Per User Usage Limit
        const perUserLimit = promo.usageLimitPerUser !== undefined && promo.usageLimitPerUser !== null
          ? promo.usageLimitPerUser
          : (promo.isFirstOrderOnly ? 1 : null);

        if (isEligible && perUserLimit !== null && perUserLimit > 0) {
          let userUsedCount = 0;
          if (promo.usedByUsers && promo.usedByUsers.length > 0) {
            userUsedCount = promo.usedByUsers.filter((u) => {
              const idMatch = userId && u.userId && u.userId.toString() === userId.toString();
              const emailMatch = userEmail && u.email && u.email.toLowerCase() === userEmail;
              return idMatch || emailMatch;
            }).length;
          }

          const orderQueryConditions: any[] = [];
          if (userId) orderQueryConditions.push({ user: userId });
          if (userEmail) orderQueryConditions.push({ "shippingAddress.email": userEmail });

          if (orderQueryConditions.length > 0) {
            const ordersWithCode = await Order.countDocuments({
              $or: orderQueryConditions,
              promoCode: promo.code,
              status: { $nin: ["cancelled", "refunded"] },
            });
            userUsedCount = Math.max(userUsedCount, ordersWithCode);
          }

          if (userUsedCount >= perUserLimit) {
            isEligible = false;
          }
        }

        if (isEligible) {
          validatedPromoCode = codeUpper;
          if (promo.type === "percentage") {
            let disc = (subtotal * promo.value) / 100;
            if (promo.maxDiscountAmount && promo.maxDiscountAmount > 0) {
              disc = Math.min(disc, promo.maxDiscountAmount);
            }
            calculatedDiscount = parseFloat(disc.toFixed(2));
          } else {
            calculatedDiscount = parseFloat(Math.min(promo.value, subtotal).toFixed(2));
          }
        }
      }
    }

    const discountAmt = Math.min(calculatedDiscount, subtotal);

    // Server-side coin redemption calculation
    const requestedCoins = Math.max(0, Math.floor(Number(coinsToUse) || 0));
    let validCoinsUsed = 0;
    let coinDiscount = 0;

    if (requestedCoins > 0 && req.user?._id) {
      const currentUser = await User.findById(req.user._id);
      const availableCoins = currentUser?.coins || 0;
      if (requestedCoins > availableCoins) {
        throw new AppError(`You only have ${availableCoins} coins available.`, 400);
      }
      // Maximum coin discount cannot exceed remaining subtotal after promo discount
      const maxApplicableCoins = Math.max(0, Math.floor(subtotal - discountAmt));
      validCoinsUsed = Math.min(requestedCoins, maxApplicableCoins);
      coinDiscount = validCoinsUsed; // 1 Coin = 1 BDT
    }

    const total = parseFloat(Math.max(0, subtotal + shippingCost - discountAmt - coinDiscount).toFixed(2));
    const coinsEarned = Math.floor(total / 100); // 1 coin per 100 BDT spent

    const paymentStatus = paymentMethod === "cod" ? "pending_delivery" : "paid";

    const order = await Order.create({
      user: req.user?._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      txnId: txnId.trim(),
      paymentStatus,
      subtotal,
      shippingCost,
      tax,
      discount: discountAmt,
      promoCode: validatedPromoCode,
      coinsUsed: validCoinsUsed,
      coinDiscount,
      coinsEarned,
      total,
      status: "pending",
      statusHistory: [
        {
          status: "pending",
          updatedAt: new Date(),
          note: "Order submitted",
        },
      ],
    });

    // Update user's coin balance: credit coinsEarned and deduct validCoinsUsed
    if (req.user?._id) {
      const coinDelta = coinsEarned - validCoinsUsed;
      if (coinDelta !== 0) {
        await User.findByIdAndUpdate(req.user._id, {
          $inc: { coins: coinDelta },
        }).catch((err) => {
          console.error("Failed to update user coin balance:", err);
        });
      }
    }

    // Decrement stock and increment totalOrdered
    await Promise.all(stockOps);

    // Increment promo code usage count & record user usage if a valid promo code was applied
    if (validatedPromoCode) {
      await PromoCode.findOneAndUpdate(
        { code: validatedPromoCode },
        {
          $inc: { usedCount: 1 },
          $push: {
            usedByUsers: {
              userId: req.user?._id,
              email: userEmail,
              orderId: order._id,
              usedAt: new Date(),
            },
          },
        }
      ).catch((err) => {
        console.error("Failed to increment promo code usage count:", err);
      });
    }

    // Send Order Confirmation Email asynchronously
    const recipientEmail = shippingAddress.email || req.user?.email;
    if (recipientEmail) {
      sendOrderConfirmationEmail(recipientEmail, order).catch((err) => {
        console.error("Order confirmation email sending error:", err);
      });
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: order,
    });
  }
);

// ─── GET /api/orders — user order history ─────────────────────────────────────

export const getMyOrders = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const page = Math.max(1, parseInt((req.query.page as string) ?? "1"));
    const limit = Math.min(20, parseInt((req.query.limit as string) ?? "10"));
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ user: req.user?._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments({ user: req.user?._id }),
    ]);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  }
);

// ─── GET /api/orders/:id — single order ───────────────────────────────────────

export const getOrder = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (!order) throw new AppError("Order not found", 404);

    // Allow access only to the owner or admin
    if (
      order.user._id.toString() !== req.user?._id.toString() &&
      req.user?.role !== "admin"
    ) {
      throw new AppError("Not authorized to view this order", 403);
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  }
);

// ─── GET /api/orders/:id/invoice — invoice PDF ────────────────────────────────

export const getOrderInvoice = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const order = await Order.findById(req.params.id).populate("user", "name email");
    if (!order) throw new AppError("Order not found", 404);

    // Only owner or admin
    if (
      order.user &&
      order.user._id &&
      order.user._id.toString() !== req.user?._id.toString() &&
      req.user?.role !== "admin"
    ) {
      throw new AppError("Not authorized to download this invoice", 403);
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${order._id.toString()}.pdf`
    );

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    // Header
    doc
      .fontSize(20)
      .text("ShajSutro", { align: "left" })
      .moveDown(0.5);
    doc
      .fontSize(10)
      .fillColor("#666666")
      .text(`Invoice ID: ${order._id.toString()}`)
      .text(`Date: ${new Date(order.createdAt ?? Date.now()).toLocaleString()}`)
      .moveDown();

    // Billing / Shipping
    const addr = order.shippingAddress as any;
    doc
      .fillColor("#000000")
      .fontSize(12)
      .text("Billing / Shipping To:", { underline: true })
      .moveDown(0.3);
    doc
      .fontSize(10)
      .text(`${addr.firstName ?? ""} ${addr.lastName ?? ""}`)
      .text(addr.address ?? "")
      .text(
        [addr.city, addr.state, addr.zip].filter(Boolean).join(", ")
      )
      .text(addr.country ?? "")
      .text(addr.phone ?? "")
      .moveDown();

    // Items table
    doc
      .fontSize(12)
      .text("Items", { underline: true })
      .moveDown(0.3);

    const items = order.items as any[];
    items.forEach((item) => {
      doc
        .fontSize(10)
        .text(
          `${item.name} (${item.size ?? ""} ${item.color ?? ""}) x${
            item.quantity
          }`,
          { continued: true }
        )
        .text(
          `  ৳${(item.price * item.quantity).toFixed(2)}`,
          { align: "right" }
        );
    });

    doc.moveDown();

    // Totals
    doc
      .fontSize(10)
      .text(`Subtotal: ৳${order.subtotal.toFixed(2)}`, { align: "right" });
    doc.text(
      `Shipping: ${order.shippingCost === 0 ? "Free" : `৳${order.shippingCost.toFixed(2)}`}`,
      { align: "right" }
    );
    if (order.discount && order.discount > 0) {
      doc.text(`Discount (Promo): -৳${order.discount.toFixed(2)}`, {
        align: "right",
      });
    }
    doc
      .fontSize(12)
      .text(`Total: ৳${order.total.toFixed(2)}`, {
        align: "right",
      })
      .moveDown();

    // Payment info
    doc
      .fontSize(10)
      .fillColor("#666666")
      .text(`Payment Method: ${order.paymentMethod.toUpperCase()}`);
    if (order.txnId) {
      doc.text(`TxnID: ${order.txnId}`);
    }
    doc.text(`Payment Status: ${order.paymentStatus}`);

    doc.end();
  }
);

// ─── PUT /api/orders/:id/cancel — cancel order ────────────────────────────────

export const cancelOrder = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const order = await Order.findById(req.params.id);
    if (!order) throw new AppError("Order not found", 404);

    if (order.user.toString() !== req.user?._id.toString()) {
      throw new AppError("Not authorized", 403);
    }

    if (order.status !== "pending") {
      throw new AppError(
        "Order can only be cancelled while status is Pending. Once confirmed, cancellation is disabled.",
        400
      );
    }

    order.status = "cancelled";
    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({
      status: "cancelled",
      updatedAt: new Date(),
      note: "Cancelled by customer",
    } as any);

    // Revert earned coins and refund used coins back to user
    if (order.user) {
      let refundDelta = 0;
      if (order.coinsUsed && order.coinsUsed > 0) {
        refundDelta += order.coinsUsed;
      }
      if (order.coinsEarned && order.coinsEarned > 0) {
        refundDelta -= order.coinsEarned;
      }
      if (refundDelta !== 0) {
        await User.findByIdAndUpdate(order.user, { $inc: { coins: refundDelta } }).catch((err) => {
          console.error("Failed to update user coins upon order cancellation:", err);
        });
      }
      order.coinsUsed = 0;
      order.coinsEarned = 0;
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order cancelled",
      data: order,
    });
  }
);

// ─── POST /api/orders/:id/exchange — request exchange/return ───────────────

export const requestExchange = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { reason, items } = req.body as {
      reason: string;
      items?: { name: string; size?: string; color?: string; quantity?: number }[];
    };

    if (!reason || !reason.trim()) {
      throw new AppError("Please provide a reason for exchange/return", 400);
    }

    const order = await Order.findById(req.params.id);
    if (!order) throw new AppError("Order not found", 404);

    if (order.user.toString() !== req.user?._id.toString()) {
      throw new AppError("Not authorized", 403);
    }

    if (order.status !== "delivered") {
      throw new AppError("Exchange or return can only be requested for delivered orders", 400);
    }

    order.exchangeRequest = {
      requestedAt: new Date(),
      status: "pending",
      reason: reason.trim(),
      items: items && items.length > 0 ? items.map(i => ({
        name: i.name,
        size: i.size || "",
        color: i.color || "",
        quantity: i.quantity || 1,
      })) : order.items.map(i => ({
        name: i.name,
        size: i.size || "",
        color: i.color || "",
        quantity: i.quantity,
      })),
      adminNote: "",
    };

    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({
      status: "pending",
      updatedAt: new Date(),
      note: `Exchange / Return requested: ${reason.trim()}`,
    } as any);

    await order.save();

    res.status(200).json({
      success: true,
      message: "Exchange request submitted successfully",
      data: order,
    });
  }
);

// ─── POST /api/orders/track — Public Order Tracking ───────────────────────────

export const trackOrder = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { orderId, query } = req.body as { orderId?: string; query?: string };
    const rawSearch = (orderId || query || "").trim();

    if (!rawSearch) {
      throw new AppError("Please enter a valid Order ID, Phone number, or Transaction ID", 400);
    }

    // Strip common prefixes like 'Order #', 'Order:', '#', 'REF:'
    const cleanSearch = rawSearch
      .replace(/^(order\s*#?|ref(erence)?\s*#?|#)/i, "")
      .trim();

    let order = null;

    // 1. Exact 24-character MongoDB ObjectId
    if (mongoose.isValidObjectId(cleanSearch)) {
      order = await Order.findById(cleanSearch);
    }

    // 2. Short Order ID match (hex suffix of _id, e.g. 8-char 'B716FDBA' or 6-12 chars)
    if (!order && /^[a-fA-F0-9]{6,24}$/.test(cleanSearch)) {
      const hexClean = cleanSearch.toLowerCase();
      order = await Order.findOne({
        $expr: {
          $regexMatch: {
            input: { $toString: "$_id" },
            regex: `${hexClean}$`,
            options: "i",
          },
        },
      }).sort({ createdAt: -1 });
    }

    // 3. Phone number match (supporting +88, 88, hyphens, spaces)
    if (!order) {
      const digitsOnly = cleanSearch.replace(/\D/g, "");
      let phoneCandidate = "";
      if (digitsOnly.length === 11 && digitsOnly.startsWith("01")) {
        phoneCandidate = digitsOnly;
      } else if (digitsOnly.length === 13 && digitsOnly.startsWith("8801")) {
        phoneCandidate = digitsOnly.slice(2);
      } else if (digitsOnly.length >= 10 && digitsOnly.length <= 15) {
        phoneCandidate = digitsOnly;
      }

      if (phoneCandidate) {
        order = await Order.findOne({
          $or: [
            { "shippingAddress.phone": phoneCandidate },
            { "shippingAddress.phone": { $regex: phoneCandidate.slice(-10) } },
          ],
        }).sort({ createdAt: -1 });
      }
    }

    // 4. Email address match
    if (!order && cleanSearch.includes("@")) {
      const escaped = cleanSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      order = await Order.findOne({
        "shippingAddress.email": { $regex: new RegExp(`^${escaped}$`, "i") },
      }).sort({ createdAt: -1 });
    }

    // 5. Transaction ID match (case-insensitive)
    if (!order && cleanSearch.length >= 4) {
      const escaped = cleanSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      order = await Order.findOne({
        txnId: { $regex: new RegExp(`^${escaped}$`, "i") },
      }).sort({ createdAt: -1 });
    }

    if (!order) {
      throw new AppError("No order found matching your search. Please verify your exact Order ID, Phone number, or Txn ID.", 404);
    }

    // Privacy-preserving response: Mask phone and address for public tracking queries
    const rawPhone = order.shippingAddress?.phone || "";
    const maskedPhone =
      rawPhone.length >= 7
        ? `${rawPhone.slice(0, 4)}****${rawPhone.slice(-3)}`
        : rawPhone
        ? "***"
        : "";

    const rawAddress = (order.shippingAddress?.address || "").trim();
    const maskedAddress =
      rawAddress.length > 10
        ? `*** ${rawAddress.slice(-10)}`
        : rawAddress
        ? `*** ${rawAddress}`
        : "";

    const statusHistory =
      Array.isArray(order.statusHistory) && order.statusHistory.length > 0
        ? order.statusHistory
        : [
            {
              status: order.status || "pending",
              updatedAt: order.createdAt || new Date(),
              note: "Order placed and received in our system.",
            },
          ];

    const sanitizedOrder = {
      _id: order._id,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      discount: order.discount,
      total: order.total,
      items: order.items,
      statusHistory,
      shippingAddress: {
        firstName: order.shippingAddress?.firstName || "Customer",
        lastName: (order.shippingAddress?.lastName || "").charAt(0) ? `${(order.shippingAddress?.lastName || "").charAt(0)}.` : "",
        address: maskedAddress,
        phone: maskedPhone,
        city: order.shippingAddress?.city || "",
        state: order.shippingAddress?.state || "",
        country: order.shippingAddress?.country || "Bangladesh",
      },
      createdAt: order.createdAt,
    };

    res.status(200).json({
      success: true,
      data: sanitizedOrder,
    });
  }
);
