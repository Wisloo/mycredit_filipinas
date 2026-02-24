"use client";

import { useEffect, useState, useCallback } from "react";

interface Staff {
  staff_id: number;
  full_name: string;
  role: string;
  username: string;
  is_inactive: number;
  created_at: string;
}

const roleColors: Record<string, string> = {
  Admin: "bg-purple-100 text-purple-800",
  Approver: "bg-blue-100 text-blue-800",
};

const statusColors: Record<number, string> = {
  0: "bg-green-100 text-green-800",
  1: "bg-red-100 text-red-800",
};

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [toggling, setToggling] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [form, setForm] = useState({
    full_name: "",
    username: "",
    password: "",
    role: "Approver",
  });

  const fetchStaff = useCallback(() => {
    fetch("/api/staff")
      .then((r) => r.json())
      .then((data) => setStaff(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  const filtered = staff.filter((s) => {
    const matchesSearch =
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.username.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole === "All" || s.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.full_name || !form.username || !form.password) {
      setError("All fields are required");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create staff");
        setCreating(false);
        return;
      }
      setShowModal(false);
      setForm({ full_name: "", username: "", password: "", role: "Approver" });
      setSuccess("Staff member created successfully!");
      fetchStaff();
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Network error");
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (s: Staff) => {
    const action = s.is_inactive ? "reactivate" : "deactivate";
    if (!confirm(`Are you sure you want to ${action} ${s.full_name}?`)) return;

    setToggling(s.staff_id);
    try {
      const res = await fetch("/api/staff", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staff_id: s.staff_id, action }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed");
        return;
      }
      setSuccess(`${s.full_name} ${action}d successfully!`);
      fetchStaff();
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      alert("Network error");
    } finally {
      setToggling(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-ph-blue-500" />
          <p className="text-gray-500">Loading staff...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Staff Management</h1>
          <p className="text-gray-500">{staff.length} team members</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setError(""); }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-ph-blue-500 to-ph-blue-600 text-white font-bold rounded-xl hover:from-ph-blue-600 hover:to-ph-blue-700 transition-all duration-200 shadow-lg shadow-ph-blue-500/25"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Staff
        </button>
      </div>

      {/* Success toast */}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 font-medium flex items-center gap-2">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {success}
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name or username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-ph-blue-500/20 focus:border-ph-blue-500 outline-none transition-all"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-ph-blue-500/20 focus:border-ph-blue-500 outline-none bg-white"
        >
          <option value="All">All Roles</option>
          <option value="Admin">Admin</option>
          <option value="Approver">Approver</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="text-4xl mb-3">👤</div>
          <p className="text-gray-500 font-medium">No staff members found</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filter</p>
        </div>
      ) : (
        <>
          {/* Mobile: cards */}
          <div className="space-y-3 lg:hidden">
            {filtered.map((s) => (
              <div key={s.staff_id} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-base ${s.is_inactive ? "bg-gray-100 text-gray-400" : "bg-purple-100 text-purple-700"}`}>
                    {s.full_name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-base ${s.is_inactive ? "text-gray-400 line-through" : "text-gray-900"}`}>{s.full_name}</p>
                    <p className="text-sm text-gray-500">@{s.username}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-sm font-semibold capitalize ${roleColors[s.role] || "bg-gray-100 text-gray-800"}`}>
                    {s.role}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-sm font-semibold ${statusColors[s.is_inactive] || "bg-gray-100 text-gray-800"}`}>
                      {s.is_inactive ? "Inactive" : "Active"}
                    </span>
                    <span className="text-sm text-gray-400">
                      {s.created_at ? new Date(s.created_at).toLocaleDateString() : "—"}
                    </span>
                  </div>
                  <button
                    onClick={() => handleToggle(s)}
                    disabled={toggling === s.staff_id}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
                      s.is_inactive
                        ? "bg-green-50 text-green-700 hover:bg-green-100"
                        : "bg-red-50 text-red-700 hover:bg-red-100"
                    }`}
                  >
                    {toggling === s.staff_id ? "..." : s.is_inactive ? "Reactivate" : "Deactivate"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden lg:block bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-5 py-3.5 text-left text-sm font-semibold text-gray-500 uppercase tracking-wide">ID</th>
                    <th className="px-5 py-3.5 text-left text-sm font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                    <th className="px-5 py-3.5 text-left text-sm font-semibold text-gray-500 uppercase tracking-wide">Username</th>
                    <th className="px-5 py-3.5 text-center text-sm font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                    <th className="px-5 py-3.5 text-center text-sm font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="px-5 py-3.5 text-left text-sm font-semibold text-gray-500 uppercase tracking-wide">Created</th>
                    <th className="px-5 py-3.5 text-center text-sm font-semibold text-gray-500 uppercase tracking-wide">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((s) => (
                    <tr key={s.staff_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-gray-900">{s.staff_id}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${s.is_inactive ? "bg-gray-100 text-gray-400" : "bg-purple-100 text-purple-700"}`}>
                            {s.full_name.charAt(0)}
                          </div>
                          <span className={`font-medium ${s.is_inactive ? "text-gray-400 line-through" : "text-gray-900"}`}>{s.full_name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-700">@{s.username}</td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-sm font-semibold capitalize ${roleColors[s.role] || "bg-gray-100 text-gray-800"}`}>
                          {s.role}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-sm font-semibold ${statusColors[s.is_inactive] || "bg-gray-100 text-gray-800"}`}>
                          {s.is_inactive ? "Inactive" : "Active"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-700">
                        {s.created_at ? new Date(s.created_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <button
                          onClick={() => handleToggle(s)}
                          disabled={toggling === s.staff_id}
                          className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
                            s.is_inactive
                              ? "bg-green-50 text-green-700 hover:bg-green-100"
                              : "bg-red-50 text-red-700 hover:bg-red-100"
                          }`}
                        >
                          {toggling === s.staff_id ? "..." : s.is_inactive ? "Reactivate" : "Deactivate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Create Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-lg text-gray-900">Add Staff Member</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name *</label>
                <input
                  type="text"
                  required
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-ph-blue-500/20 focus:border-ph-blue-500 outline-none transition-all"
                  placeholder="Juan Dela Cruz"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Username *</label>
                <input
                  type="text"
                  required
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-ph-blue-500/20 focus:border-ph-blue-500 outline-none transition-all"
                  placeholder="jdelacruz"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-ph-blue-500/20 focus:border-ph-blue-500 outline-none transition-all pr-12"
                    placeholder="Min 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Role *</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-ph-blue-500/20 focus:border-ph-blue-500 outline-none transition-all bg-white"
                >
                  <option value="Approver">Approver</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-3 bg-gradient-to-r from-ph-blue-500 to-ph-blue-600 text-white font-bold rounded-xl hover:from-ph-blue-600 hover:to-ph-blue-700 transition-all duration-200 disabled:opacity-50 shadow-lg shadow-ph-blue-500/25"
                >
                  {creating ? "Creating..." : "Create Staff"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
