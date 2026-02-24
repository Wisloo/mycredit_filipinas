"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Sidebar, {
  IconDashboard,
  IconLoans,
  IconPayments,
  IconUsers,
  IconStaff,
} from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";

const allSidebarLinks = [
  { href: "/admin", label: "Overview", icon: <IconDashboard />, roles: ["admin", "approver"] },
  { href: "/admin/users", label: "Users", icon: <IconUsers />, roles: ["admin"] },
  { href: "/admin/loans", label: "Loans", icon: <IconLoans />, roles: ["admin", "approver"] },
  { href: "/admin/payments", label: "Payments", icon: <IconPayments />, roles: ["admin", "approver"] },
  { href: "/admin/staff", label: "Staff", icon: <IconStaff />, roles: ["admin"] },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: string; id: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user && data.user.role !== "user") {
          setUser(data.user);
        } else {
          router.push("/login");
        }
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-100">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-ph-blue-500" />
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-100">
      <Navbar user={user} />
      <div className="flex">
        <Sidebar links={allSidebarLinks.filter(l => l.roles.includes(user?.role || ""))} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
          {children}
        </main>
      </div>
      {user && <MobileNav links={allSidebarLinks.filter(l => l.roles.includes(user?.role || ""))} user={user} />}
    </div>
  );
}
