"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col items-center justify-center bg-white text-slate-900 p-6 text-center font-sans">
        <div className="max-w-md w-full space-y-4">
          <h2 className="text-2xl font-bold">Something went wrong!</h2>
          <p className="text-sm text-slate-500">
            {error?.message || "An unexpected application error occurred."}
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-all"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
