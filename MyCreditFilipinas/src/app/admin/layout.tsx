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

interface NotifCounts {
  pendingLoans: number;
  pendingPayments: number;
  overdueSchedules: number;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: string; id: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifs, setNotifs] = useState<NotifCounts>({
    pendingLoans: 0,
    pendingPayments: 0,
    overdueSchedules: 0,
  });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user && data.user.role !== "user") {
          setUser(data.user);
          // Fetch notification counts for badge display
          fetch("/api/admin/notifications")
            .then((r) => r.json())
            .then((n) => {
              if (n && typeof n.pendingLoans === "number") setNotifs(n);
            })
            .catch(() => {});
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

  const allSidebarLinks = [
    { href: "/admin", label: "Overview", icon: <IconDashboard />, roles: ["admin", "approver"] },
    { href: "/admin/users", label: "Users", icon: <IconUsers />, roles: ["admin"] },
    {
      href: "/admin/loans",
      label: "Loans",
      icon: <IconLoans />,
      roles: ["admin", "approver"],
      badge: notifs.pendingLoans > 0 ? notifs.pendingLoans : undefined,
    },
    {
      href: "/admin/payments",
      label: "Payments",
      icon: <IconPayments />,
      roles: ["admin", "approver"],
      badge: notifs.pendingPayments > 0 ? notifs.pendingPayments : undefined,
    },
    { href: "/admin/staff", label: "Staff", icon: <IconStaff />, roles: ["admin"] },
  ];

  const filteredLinks = allSidebarLinks.filter((l) =>
    l.roles.includes(user?.role || "")
  );

  return (
    <div className="min-h-screen bg-cream-100">
      <Navbar user={user} />
      <div className="flex">
        <Sidebar links={filteredLinks} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
          {children}
        </main>
      </div>
      {user && <MobileNav links={filteredLinks} user={user} />}
    </div>
  );
}
