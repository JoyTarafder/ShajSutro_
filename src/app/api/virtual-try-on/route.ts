import { NextRequest, NextResponse } from "next/server";

const LIGHTX_API_KEY = process.env.LIGHTX_API_KEY || "";

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

        const form = new FormData();
        form.append("files[]", blob, `user_photo_${Date.now()}.${ext}`);

        // Primary Host: Uguu
        const ugRes = await fetch("https://uguu.se/upload.php", {
          method: "POST",
          body: form,
        });

        if (ugRes.ok) {
          const ugData = await ugRes.json();
          const publicUrl = ugData.files?.[0]?.url;
          if (publicUrl && publicUrl.startsWith("http")) {
            console.log("Uploaded user image to public URL for LightX:", publicUrl);
            return publicUrl;
          }
        }
      }
    } catch (err) {
      console.warn("Primary image upload failed, trying fallback:", err);
    }
  }

  return imageUrl;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, personImageUrl, garmentImageUrl } = body;

    // Action: Pre-upload image in background while user browses
    if (action === "uploadOnly") {
      if (!personImageUrl) {
        return NextResponse.json({ success: false, error: "personImageUrl required" }, { status: 400 });
      }
      const publicUrl = await ensurePublicUrl(personImageUrl);
      return NextResponse.json({ success: true, publicUrl });
    }

    if (!personImageUrl || !garmentImageUrl) {
      return NextResponse.json(
        { success: false, error: "Both person image and garment image are required" },
        { status: 400 }
      );
    }

    // Ensure the person photo is a public URL accessible by LightX servers
    const finalPersonUrl = await ensurePublicUrl(personImageUrl);

    console.log("Calling LightX with person URL:", finalPersonUrl.slice(0, 80));
    console.log("Calling LightX with garment URL:", garmentImageUrl);

    // Call LightX AI Virtual Try-On API
    const lightXRes = await fetch(
      "https://api.lightxeditor.com/external/api/v2/aivirtualtryon",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": LIGHTX_API_KEY,
        },
        body: JSON.stringify({
          imageUrl: finalPersonUrl,
          styleImageUrl: garmentImageUrl,
        }),
      }
    );

    const data = await lightXRes.json();

    if (!lightXRes.ok || (data.statusCode && data.statusCode !== 2000)) {
      console.error("LightX API rejected:", data);
      return NextResponse.json(
        {
          success: false,
          error: data.message || "LightX API rejected the request",
          details: data,
        },
        { status: lightXRes.status || 500 }
      );
    }

    const orderId = data.body?.orderId;

    return NextResponse.json({
      success: true,
      orderId,
      uploadedPersonUrl: finalPersonUrl,
      status: data.body?.status || "init",
      avgResponseTimeInSec: data.body?.avgResponseTimeInSec || 30,
      data,
    });
  } catch (error: unknown) {
    console.error("LightX Virtual Try-On route error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
