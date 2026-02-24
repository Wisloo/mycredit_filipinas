"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

interface MobileNavProps {
  links: { href: string; label: string; icon: React.ReactNode }[];
  user: { name: string; role: string };
}

export default function MobileNav({ links, user }: MobileNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      {/* Bottom nav on mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200/80 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="flex justify-around py-1.5 px-2">
          {links.slice(0, 4).map((link) => {
            const active = link.href === "/admin" || link.href === "/dashboard"
              ? pathname === link.href
              : pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center px-3 py-1.5 rounded-xl transition-all duration-200 ${
                  active ? "text-ph-blue-600" : "text-gray-400"
                }`}
              >
                <span className={`w-5 h-5 mb-0.5 transition-transform duration-200 ${active ? "scale-110" : ""}`}>{link.icon}</span>
                <span className="text-xs font-medium">{link.label}</span>
                {active && <span className="w-4 h-0.5 bg-ph-blue-500 rounded-full mt-0.5" />}
              </Link>
            );
          })}
          <button
            onClick={() => setOpen(!open)}
            className="flex flex-col items-center px-3 py-1.5 text-gray-400"
          >
            <span className="w-5 h-5 mb-0.5">
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
            </span>
            <span className="text-xs font-medium">More</span>
          </button>
        </div>
      </div>

      {/* More menu drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full bg-white rounded-t-3xl p-5 pb-10 space-y-2 animate-slide-up shadow-2xl">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-3" />
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="font-bold text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500 uppercase font-medium">{user.role}</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {links.slice(4).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 text-gray-700 transition-colors"
              >
                <span className="w-5 h-5 text-gray-400">{link.icon}</span>
                <span className="text-sm font-medium">{link.label}</span>
              </Link>
            ))}
            <hr className="border-gray-100 my-2" />
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 p-3 rounded-xl hover:bg-red-50 text-red-500 w-full transition-colors"
            >
              <span className="w-5 h-5">
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
              </span>
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
