"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  middle_name: string;
  email_address: string;
  suffix: string;
  birthdate: string;
  gender: string;
  is_inactive: number;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(
    (u) =>
      `${u.first_name} ${u.last_name} ${u.email_address}`
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="text-gray-500 py-8 text-center">Loading users...</div>;
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Users</h1>
          <p className="text-gray-500 text-sm">{users.length} total borrowers</p>
        </div>
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ph-blue-500 focus:border-transparent outline-none text-sm w-full sm:w-64 text-gray-900"
        />
      </div>

      {/* Mobile: cards */}
      <div className="space-y-3 lg:hidden">
        {filtered.map((u) => (
          <div key={u.user_id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-ph-blue-100 text-ph-blue-700 rounded-full flex items-center justify-center font-semibold text-sm">
                {u.first_name.charAt(0)}{u.last_name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{u.first_name} {u.last_name}</p>
                <p className="text-sm text-gray-500">{u.email_address}</p>
              </div>
              <Link href={`/admin/users/${u.user_id}`} className="px-3 py-1.5 bg-ph-blue-500 text-white text-xs font-medium rounded-lg hover:bg-ph-blue-600">View</Link>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.is_inactive ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                {u.is_inactive ? "Inactive" : "Active"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-500 text-xs">Suffix</p>
                <p className="text-gray-700">{u.suffix || "—"}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Gender</p>
                <p className="text-gray-700">{u.gender || "—"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500 text-xs">Registered</p>
                <p className="text-gray-700">{u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden lg:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-500 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-500 uppercase">Suffix</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-500 uppercase">Gender</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-500 uppercase">Registered</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((u) => (
                <tr key={u.user_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{u.user_id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-ph-blue-100 text-ph-blue-700 rounded-full flex items-center justify-center font-semibold text-xs">
                        {u.first_name.charAt(0)}{u.last_name.charAt(0)}
                      </div>
                      <span className="text-gray-900 font-medium">{u.first_name} {u.last_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{u.email_address}</td>
                  <td className="px-4 py-3 text-gray-700">{u.suffix || "—"}</td>
                  <td className="px-4 py-3 text-center text-gray-700">{u.gender || "—"}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mr-2 ${u.is_inactive ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                      {u.is_inactive ? "Inactive" : "Active"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Link href={`/admin/users/${u.user_id}`} className="px-3 py-1.5 bg-ph-blue-500 text-white text-xs font-medium rounded-lg hover:bg-ph-blue-600 transition-colors">
                      View Profile
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-sm">No users match your search</div>
        )}
      </div>
    </div>
  );
}
