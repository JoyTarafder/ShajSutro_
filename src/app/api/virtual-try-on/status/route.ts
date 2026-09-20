import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

function getLightXApiKeys(): string[] {
  const keys: string[] = [];
  if (process.env.LIGHTX_API_KEY) {
    keys.push(...process.env.LIGHTX_API_KEY.split(",").map((k) => k.trim()).filter(Boolean));
  }
  if (process.env.LIGHTX_API_KEYS) {
    keys.push(...process.env.LIGHTX_API_KEYS.split(",").map((k) => k.trim()).filter(Boolean));
  }
  // Fallback / numbered keys (LIGHTX_API_KEY_2, LIGHTX_API_KEY_3... up to LIGHTX_API_KEY_25)
  for (let i = 2; i <= 25; i++) {
    const k = process.env[`LIGHTX_API_KEY_${i}`];
    if (k && k.trim()) keys.push(k.trim());
  }
  if (process.env.LIGHTX_API_KEY_FALLBACK) {
    keys.push(process.env.LIGHTX_API_KEY_FALLBACK.trim());
  }
  // Default verified working keys as ultimate fallback
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
    const body = await req.json();
    const orderId = body?.orderId;
    const keyIndex = typeof body?.keyIndex === "number" ? body.keyIndex : 0;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "orderId is required" },
        { status: 400 }
      );
    }

    const apiKeys = getLightXApiKeys();
    const orderedKeys = [
      apiKeys[keyIndex],
      ...apiKeys.filter((_, idx) => idx !== keyIndex),
    ].filter(Boolean);

    if (orderedKeys.length === 0) {
      return NextResponse.json(
        { success: false, error: "LIGHTX_API_KEY is not configured" },
        { status: 500 }
      );
    }

    let data: any = null;

    for (const key of orderedKeys) {
      const lightXRes = await fetch(
        "https://api.lightxeditor.com/external/api/v1/order-status",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": key,
          },
          body: JSON.stringify({ orderId }),
        }
      );

      const resJson = await lightXRes.json();
      if (lightXRes.ok && (!resJson.statusCode || resJson.statusCode === 2000)) {
        data = resJson;
        break;
      }
      data = resJson;
    }

    // LightX returns:
    // data.body.output -> CloudFront image URL when complete
    // data.body.status -> "init" | "active" | "SUCCESS" | "FAIL"
    const rawStatus = data.body?.status || data.status || "active";
    const outputUrl =
      data.body?.output ||
      data.output ||
      (typeof data.body === "string" && data.body.startsWith("http") ? data.body : null);

    const isComplete = Boolean(outputUrl);
    const isFailed = rawStatus === "FAIL" || (data.statusCode && data.statusCode !== 2000 && !outputUrl);

    return NextResponse.json({
      success: true,
      status: isComplete ? "SUCCESS" : isFailed ? "FAIL" : rawStatus,
      isComplete,
      outputUrl,
      raw: data,
    });
  } catch (error: unknown) {
    console.error("LightX Order Status error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");

  if (!orderId) {
    return NextResponse.json(
      { success: false, error: "orderId query param is required" },
      { status: 400 }
    );
  }

  const apiKeys = getLightXApiKeys();
  if (apiKeys.length === 0) {
    return NextResponse.json(
      { success: false, error: "LIGHTX_API_KEY is not configured" },
      { status: 500 }
    );
  }

  try {
    let data: any = null;

    for (const key of apiKeys) {
      const lightXRes = await fetch(
        "https://api.lightxeditor.com/external/api/v1/order-status",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": key,
          },
          body: JSON.stringify({ orderId }),
        }
      );

      const resJson = await lightXRes.json();
      if (lightXRes.ok && (!resJson.statusCode || resJson.statusCode === 2000)) {
        data = resJson;
        break;
      }
      data = resJson;
    }
    const rawStatus = data.body?.status || data.status || "active";
    const outputUrl =
      data.body?.output ||
      data.output ||
      (typeof data.body === "string" && data.body.startsWith("http") ? data.body : null);

    const isComplete = Boolean(outputUrl);
    const isFailed = rawStatus === "FAIL" || (data.statusCode && data.statusCode !== 2000 && !outputUrl);

    return NextResponse.json({
      success: true,
      status: isComplete ? "SUCCESS" : isFailed ? "FAIL" : rawStatus,
      isComplete,
      outputUrl,
      raw: data,
    });
  } catch (error: unknown) {
    console.error("LightX Order Status error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
