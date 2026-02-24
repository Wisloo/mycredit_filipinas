"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-ph-blue-600 via-ph-blue-700 to-ph-blue-900 flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="w-16 h-16 mx-auto mb-6 bg-ph-red-500/20 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-ph-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h1 className="text-2xl font-extrabold text-white">Something went wrong</h1>
        <p className="text-ph-blue-200 mt-2">
          An unexpected error occurred. Please try again or contact support if the problem persists.
        </p>
        {process.env.NODE_ENV === "development" && error?.message && (
          <pre className="mt-4 p-3 bg-black/30 rounded-lg text-red-300 text-xs text-left overflow-auto max-h-40">
            {error.message}
          </pre>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <button
            onClick={reset}
            className="px-6 py-3 bg-ph-gold-500 text-ph-blue-900 font-bold rounded-xl hover:bg-ph-gold-400 transition-all duration-200 shadow-lg cursor-pointer"
          >
            Try Again
          </button>
          <a
            href="/"
            className="px-6 py-3 border-2 border-white/20 text-white font-medium rounded-xl hover:bg-white/10 transition-all duration-200"
          >
            Go to Homepage
          </a>
        </div>
      </div>
    </div>
  );
}
