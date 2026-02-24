import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-ph-blue-600 via-ph-blue-700 to-ph-blue-900 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-8xl font-extrabold text-white/10 select-none">404</div>
        <h1 className="text-2xl font-extrabold text-white mt-4">Page Not Found</h1>
        <p className="text-ph-blue-200 mt-2 max-w-md mx-auto">
          Sorry, the page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Link
            href="/"
            className="px-6 py-3 bg-ph-gold-500 text-ph-blue-900 font-bold rounded-xl hover:bg-ph-gold-400 transition-all duration-200 shadow-lg"
          >
            Go to Homepage
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 border-2 border-white/20 text-white font-medium rounded-xl hover:bg-white/10 transition-all duration-200"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
