import { NextRequest, NextResponse } from "next/server";

const LIGHTX_API_KEY = process.env.LIGHTX_API_KEY || "";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const orderId = body?.orderId;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "orderId is required" },
        { status: 400 }
      );
    }

    const lightXRes = await fetch(
      "https://api.lightxeditor.com/external/api/v1/order-status",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": LIGHTX_API_KEY,
        },
        body: JSON.stringify({ orderId }),
      }
    );

    const data = await lightXRes.json();

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

  try {
    const lightXRes = await fetch(
      "https://api.lightxeditor.com/external/api/v1/order-status",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": LIGHTX_API_KEY,
        },
        body: JSON.stringify({ orderId }),
      }
    );

    const data = await lightXRes.json();
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
