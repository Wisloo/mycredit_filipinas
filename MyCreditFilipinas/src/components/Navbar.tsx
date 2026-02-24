"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

interface NavbarProps {
  user?: { name: string; role: string } | null;
}

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const isActive = (path: string) =>
    pathname === path
      ? "bg-ph-blue-600 text-white"
      : "text-ph-blue-100 hover:bg-ph-blue-400 hover:text-white";

  return (
    <nav className="bg-ph-blue-500/95 backdrop-blur-md shadow-lg shadow-ph-blue-500/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link
              href={user ? (user.role === "user" ? "/dashboard" : "/admin") : "/"}
              className="text-white font-bold text-xl tracking-tight flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-ph-gold-500 rounded-lg flex items-center justify-center text-ph-blue-900 font-extrabold text-sm">
                MC
              </div>
              <span className="hidden sm:inline">MyCredit Filipinas</span>
            </Link>
          </div>

          {/* Desktop right side */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                <span className="text-ph-blue-200 text-sm">
                  Welcome, <strong className="text-white">{user.name}</strong>
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-ph-gold-500/90 text-ph-blue-900 uppercase tracking-wide">
                  {user.role}
                </span>
                <button
                  onClick={handleLogout}
                  className="ml-2 px-4 py-2 rounded-xl text-sm font-semibold bg-white/10 text-white hover:bg-white/20 border border-white/10 transition-all duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isActive("/login")}`}
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-5 py-2.5 rounded-xl text-sm font-bold bg-ph-gold-500 text-ph-blue-900 hover:bg-ph-gold-400 transition-all duration-200 shadow-lg shadow-ph-gold-500/30"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-white/80 hover:text-white focus:outline-none p-2 rounded-xl hover:bg-white/10 transition-all duration-200"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-ph-blue-600/95 backdrop-blur-md pb-4 px-4 space-y-2 border-t border-white/10">
          {user ? (
            <>
              <div className="text-ph-blue-200 text-sm py-3 border-b border-white/10 flex items-center gap-2">
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-xs font-bold text-white">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{user.name}</p>
                  <p className="text-xs uppercase text-ph-blue-300">{user.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-ph-red-300 hover:bg-white/5 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="block px-3 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:bg-white/5 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="block px-3 py-2.5 rounded-xl text-sm font-bold bg-ph-gold-500 text-ph-blue-900 hover:bg-ph-gold-400 text-center transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
