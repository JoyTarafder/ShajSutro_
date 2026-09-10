"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function TrackRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = searchParams.toString();
    const target = params ? `/track-order?${params}` : "/track-order";
    router.replace(target);
  }, [router, searchParams]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-charcoal-500">
      <Loader2 className="w-8 h-8 animate-spin text-charcoal-900" />
      <p className="text-sm font-medium">Redirecting to Order Tracking...</p>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-charcoal-900" />
        </div>
      }
    >
      <TrackRedirect />
    </Suspense>
  );
}
