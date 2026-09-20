import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

async function ensurePublicUrl(imageUrl: string): Promise<string> {
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  // If image is a Base64 Data URL, upload it to generate a public URL that LightX can fetch
  if (imageUrl.startsWith("data:")) {
    try {
      const matches = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (matches) {
        const mime = matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, "base64");
        const ext = mime.includes("png") ? "png" : mime.includes("webp") ? "webp" : "jpg";
        const blob = new Blob([buffer], { type: mime });

        // Primary Host: Uguu
        try {
          const form = new FormData();
          form.append("files[]", blob, `user_photo_${Date.now()}.${ext}`);
          const ugRes = await fetch("https://uguu.se/upload.php", {
            method: "POST",
            body: form,
          });

          if (ugRes.ok) {
            const ugData = await ugRes.json();
            const publicUrl = ugData.files?.[0]?.url;
            if (publicUrl && publicUrl.startsWith("http")) {
              console.log("Uploaded user image to public URL (Uguu):", publicUrl);
              return publicUrl;
            }
          }
        } catch (ugErr) {
          console.warn("Uguu upload failed, trying fallback host:", ugErr);
        }

        // Secondary Fallback Host: tmpfiles.org
        try {
          const tfForm = new FormData();
          tfForm.append("file", blob, `user_photo_${Date.now()}.${ext}`);
          const tfRes = await fetch("https://tmpfiles.org/api/v1/upload", {
            method: "POST",
            body: tfForm,
          });

          if (tfRes.ok) {
            const tfData = await tfRes.json();
            const rawUrl = tfData?.data?.url;
            if (rawUrl && typeof rawUrl === "string") {
              const directUrl = rawUrl.replace("tmpfiles.org/", "tmpfiles.org/dl/");
              console.log("Uploaded user image to public URL (tmpfiles):", directUrl);
              return directUrl;
            }
          }
        } catch (tfErr) {
          console.warn("tmpfiles upload failed:", tfErr);
        }
      }
    } catch (err) {
      console.warn("All public image upload attempts failed:", err);
    }
  }

  return imageUrl;
}

function toAbsoluteUrl(url: string, origin?: string): string {
  if (!url) return url;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  const base = origin || process.env.NEXT_PUBLIC_SITE_URL || "https://shajsutrov1.vercel.app";
  const cleanBase = base.replace(/\/$/, "");
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  return `${cleanBase}${cleanPath}`;
}

function getLightXApiKeys(): string[] {
  const keys: string[] = [];

  // 1. LIGHTX_API_KEY (supports single key or comma-separated list: key1,key2,key3)
  if (process.env.LIGHTX_API_KEY) {
    keys.push(...process.env.LIGHTX_API_KEY.split(",").map((k) => k.trim()).filter(Boolean));
  }

  // 2. LIGHTX_API_KEYS (comma-separated list)
  if (process.env.LIGHTX_API_KEYS) {
    keys.push(...process.env.LIGHTX_API_KEYS.split(",").map((k) => k.trim()).filter(Boolean));
  }

  // 3. Fallback / numbered keys (LIGHTX_API_KEY_2, LIGHTX_API_KEY_3... up to LIGHTX_API_KEY_25)
  for (let i = 2; i <= 25; i++) {
    const k = process.env[`LIGHTX_API_KEY_${i}`];
    if (k && k.trim()) keys.push(k.trim());
  }

  // 4. LIGHTX_API_KEY_FALLBACK
  if (process.env.LIGHTX_API_KEY_FALLBACK) {
    keys.push(process.env.LIGHTX_API_KEY_FALLBACK.trim());
  }

  // 5. Default verified working keys as ultimate fallback
  if (keys.length === 0) {
    keys.push(
      "e00f868dcf88453aac699bbff9b1fc8c_1b7edf220a3a47758027e793a4631ae3_andoraitools",
      "b43de4f8dff843889736883335544ae7_acbcb30563934b6d96dc9bfa3e1e127a_andoraitools"
    );
  }

  return Array.from(new Set(keys));
}

export async function POST(req: NextRequest) {
  try {
    const origin = req.nextUrl?.origin || "https://shajsutrov1.vercel.app";
    const body = await req.json();
    const { action, personImageUrl, garmentImageUrl } = body;

    // Fast-path: pre-upload only
    if (action === "uploadOnly") {
      if (!personImageUrl) {
        return NextResponse.json(
          { success: false, error: "personImageUrl required" },
          { status: 400 }
        );
      }
      const publicUrl = await ensurePublicUrl(toAbsoluteUrl(personImageUrl, origin));
      return NextResponse.json({
        success: true,
        publicUrl,
      });
    }

    if (!personImageUrl || !garmentImageUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "Both personImageUrl and garmentImageUrl are required",
        },
        { status: 400 }
      );
    }

    // Ensure URLs are absolute and publicly reachable by LightX AI servers
    const finalGarmentUrl = toAbsoluteUrl(garmentImageUrl, origin);
    const finalPersonUrl = await ensurePublicUrl(toAbsoluteUrl(personImageUrl, origin));

    const apiKeys = getLightXApiKeys();
    if (apiKeys.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "LIGHTX_API_KEY is not configured in environment variables.",
        },
        { status: 500 }
      );
    }

    let lastError: any = null;
    let successfulData: any = null;
    let usedKeyIndex = 0;

    // Auto-failover loop: If Key #1 runs out of credits or fails, automatically try Key #2, #3, etc.
    for (let i = 0; i < apiKeys.length; i++) {
      const currentKey = apiKeys[i];
      console.log(`[Virtual Try-On] Calling AI service with API Key #${i + 1} (ends in ...${currentKey.slice(-6)})`);

      try {
        const lightXRes = await fetch(
          "https://api.lightxeditor.com/external/api/v2/aivirtualtryon",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": currentKey,
            },
            body: JSON.stringify({
              imageUrl: finalPersonUrl,
              styleImageUrl: finalGarmentUrl,
            }),
          }
        );

        const data = await lightXRes.json();

        // If successful
        if (lightXRes.ok && (!data.statusCode || data.statusCode === 2000) && data.body?.orderId) {
          successfulData = data;
          usedKeyIndex = i;
          console.log(`[Virtual Try-On] Success with API Key #${i + 1}! OrderId:`, data.body.orderId);
          break;
        }

        // If key failed / out of credits
        console.warn(`[Virtual Try-On] API Key #${i + 1} failed or credits exhausted:`, data.message || data);
        lastError = data;

        if (i < apiKeys.length - 1) {
          console.log(`[Virtual Try-On] Auto-failover: Switching to next available API Key #${i + 2}...`);
        }
      } catch (err) {
        console.warn(`[Virtual Try-On] Error contacting API with Key #${i + 1}:`, err);
        lastError = err;
      }
    }

    if (!successfulData) {
      console.error("[Virtual Try-On] All configured API keys failed:", lastError);
      return NextResponse.json(
        {
          success: false,
          error: lastError?.message || "All configured API keys failed or ran out of credits.",
          raw: lastError,
          totalKeysAttempted: apiKeys.length,
        },
        { status: 500 }
      );
    }

    const orderId = successfulData.body?.orderId;

    return NextResponse.json({
      success: true,
      orderId,
      keyIndex: usedKeyIndex,
      uploadedPersonUrl: finalPersonUrl,
      status: successfulData.body?.status || "init",
      avgResponseTimeInSec: successfulData.body?.avgResponseTimeInSec || 30,
      data: successfulData,
    });
  } catch (error: unknown) {
    console.error("Virtual Try-On route error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
