"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface UserDetail {
  user_id: number;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  suffix: string | null;
  gender: string | null;
  birthdate: string | null;
  facebook: string | null;
  email_address: string;
  is_inactive: number;
  created_at: string;
  profile: {
    occupation: string | null;
    employer_agency: string | null;
    previous_employer: string | null;
    educational_attainment: string | null;
    income: number | null;
  } | null;
  contacts: {
    contact_number_id: number;
    contact_number: string;
    contact_type: string;
  }[];
  bank_accounts: {
    bank_account_id: number;
    bank_name: string;
    card_number: string;
    card_expiry_date: string;
  }[];
  addresses: {
    user_address_id: number;
    address_type: string;
    residence_type: string;
    is_primary: number;
    full_address_string: string;
    barangay: string;
    city: string;
    landmarks: string;
  }[];
  references: {
    reference_id: number;
    reference_type: string;
    name: string;
    address: string;
    contact_number: string;
    verification_notes: string | null;
    verified_by: number | null;
  }[];
  loans: {
    loan_id: number;
    principal_amt: number;
    term_months: number;
    loan_status: string;
    current_balance: number;
    loan_type: string;
    loan_purpose: string;
    created_at: string;
  }[];
}

const statusColors: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-800",
  Approved: "bg-blue-100 text-blue-800",
  Active: "bg-green-100 text-green-800",
  Paid: "bg-gray-100 text-gray-800",
  Defaulted: "bg-red-100 text-red-800",
  Denied: "bg-red-100 text-red-800",
  Frozen: "bg-cyan-100 text-cyan-800",
};

function Section({
  title,
  icon,
  children,
  empty,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
  empty?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <span>{icon}</span> {title}
        </h3>
      </div>
      <div className="p-6">
        {empty ? (
          <p className="text-sm text-gray-400 text-center py-4">
            No data available
          </p>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">
        {label}
      </p>
      <p className="text-sm text-gray-900">{value || "—"}</p>
    </div>
  );
}

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    fetch(`/api/users/${params.id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch");
        return r.json();
      })
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setUser(data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-ph-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="text-center py-20">
        <p className="text-5xl mb-4">😕</p>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          User not found
        </h2>
        <p className="text-sm text-gray-500 mb-4">{error}</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-ph-blue-500 text-white text-sm rounded-lg hover:bg-ph-blue-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  const fullName = [user.first_name, user.middle_name, user.last_name, user.suffix]
    .filter(Boolean)
    .join(" ");

  const handleToggleStatus = async () => {
    if (!user) return;
    const action = user.is_inactive ? "reactivate" : "deactivate";
    const confirmMsg = user.is_inactive
      ? "Are you sure you want to reactivate this user?"
      : "Are you sure you want to deactivate this user? They will no longer be able to log in.";
    if (!confirm(confirmMsg)) return;

    setToggling(true);
    try {
      const res = await fetch(`/api/users/${user.user_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to update user status");
        return;
      }
      setUser({ ...user, is_inactive: data.is_inactive });
    } catch {
      alert("Network error");
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-sm text-ph-blue-500 hover:text-ph-blue-700 font-medium mb-3 flex items-center gap-1"
        >
          ← Back to Users
        </button>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-ph-blue-500 to-ph-blue-700 text-white rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg">
              {user.first_name.charAt(0)}
              {user.last_name.charAt(0)}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">{fullName}</h1>
              <p className="text-sm text-gray-500">{user.email_address}</p>
              <div className="flex items-center gap-3 mt-1">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    user.is_inactive
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {user.is_inactive ? "Inactive" : "Active"}
                </span>
                <span className="text-xs text-gray-400">
                  ID: {user.user_id}
                </span>
                <span className="text-xs text-gray-400">
                  Joined:{" "}
                  {user.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : "—"}
                </span>
              </div>
            </div>
            <button
              onClick={handleToggleStatus}
              disabled={toggling}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors disabled:opacity-50 ${
                user.is_inactive
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "bg-red-500 text-white hover:bg-red-600"
              }`}
            >
              {toggling
                ? "Updating..."
                : user.is_inactive
                ? "Reactivate User"
                : "Deactivate User"}
            </button>
          </div>
        </div>
      </div>

      {/* Personal Info + Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Section title="Personal Information" icon="👤">
          <div className="grid grid-cols-2 gap-4">
            <InfoRow label="First Name" value={user.first_name} />
            <InfoRow label="Middle Name" value={user.middle_name} />
            <InfoRow label="Last Name" value={user.last_name} />
            <InfoRow label="Suffix" value={user.suffix} />
            <InfoRow label="Gender" value={user.gender} />
            <InfoRow
              label="Birthdate"
              value={
                user.birthdate
                  ? new Date(user.birthdate).toLocaleDateString()
                  : null
              }
            />
            <InfoRow label="Facebook" value={user.facebook} />
            <InfoRow label="Email" value={user.email_address} />
          </div>
        </Section>

        <Section
          title="Employment & Education"
          icon="💼"
          empty={!user.profile}
        >
          {user.profile && (
            <div className="grid grid-cols-2 gap-4">
              <InfoRow label="Occupation" value={user.profile.occupation} />
              <InfoRow
                label="Employer / Agency"
                value={user.profile.employer_agency}
              />
              <InfoRow
                label="Previous Employer"
                value={user.profile.previous_employer}
              />
              <InfoRow
                label="Education"
                value={user.profile.educational_attainment}
              />
              <InfoRow
                label="Monthly Income"
                value={
                  user.profile.income != null
                    ? `₱${Number(user.profile.income).toLocaleString()}`
                    : null
                }
              />
            </div>
          )}
        </Section>
      </div>

      {/* Contact Numbers + Bank Accounts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Section
          title="Contact Numbers"
          icon="📱"
          empty={user.contacts.length === 0}
        >
          <div className="space-y-3">
            {user.contacts.map((c) => (
              <div
                key={c.contact_number_id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {c.contact_number}
                  </p>
                  <p className="text-xs text-gray-500">{c.contact_type}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="Bank Accounts"
          icon="🏦"
          empty={user.bank_accounts.length === 0}
        >
          <div className="space-y-3">
            {user.bank_accounts.map((b) => (
              <div
                key={b.bank_account_id}
                className="p-3 bg-gray-50 rounded-xl"
              >
                <p className="text-sm font-medium text-gray-900">
                  {b.bank_name}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Card: ••••{" "}
                  {b.card_number ? b.card_number.slice(-4) : "N/A"}
                </p>
                {b.card_expiry_date && (
                  <p className="text-xs text-gray-500">
                    Expires:{" "}
                    {new Date(b.card_expiry_date).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* Addresses */}
      <div className="mb-4">
        <Section
          title="Addresses"
          icon="📍"
          empty={user.addresses.length === 0}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {user.addresses.map((a) => (
              <div
                key={a.user_address_id}
                className="p-4 bg-gray-50 rounded-xl border border-gray-100"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 text-xs font-medium bg-ph-blue-100 text-ph-blue-700 rounded-full capitalize">
                    {a.address_type?.replace("_", " ")}
                  </span>
                  {a.is_primary ? (
                    <span className="px-2 py-0.5 text-xs font-medium bg-ph-gold-100 text-ph-gold-700 rounded-full">
                      Primary
                    </span>
                  ) : null}
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {a.full_address_string || `${a.barangay}, ${a.city}`}
                </p>
                {a.residence_type && (
                  <p className="text-xs text-gray-500 mt-1">
                    {a.residence_type}
                  </p>
                )}
                {a.landmarks && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    Landmarks: {a.landmarks}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* References */}
      <div className="mb-4">
        <Section
          title="References"
          icon="👥"
          empty={user.references.length === 0}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {user.references.map((r) => (
              <div
                key={r.reference_id}
                className="p-4 bg-gray-50 rounded-xl border border-gray-100"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full capitalize">
                    {r.reference_type}
                  </span>
                  {r.verified_by && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-sm font-bold text-gray-900">{r.name}</p>
                <p className="text-xs text-gray-600 mt-1">{r.address}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  📞 {r.contact_number}
                </p>
                {r.verification_notes && (
                  <p className="text-xs text-gray-400 mt-1 italic">
                    Notes: {r.verification_notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* Loan History */}
      <div className="mb-4">
        <Section
          title="Loan History"
          icon="📋"
          empty={user.loans.length === 0}
        >
          <div className="space-y-3">
            {user.loans.map((l) => (
              <Link
                key={l.loan_id}
                href={`/admin/loans/${l.loan_id}`}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-ph-blue-300 hover:bg-ph-blue-50/50 transition-colors group"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-ph-blue-700">
                    Loan #{l.loan_id} — {l.loan_type}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {l.loan_purpose} · ₱
                    {Number(l.principal_amt).toLocaleString()} ·{" "}
                    {l.term_months} months
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      statusColors[l.loan_status] ||
                      "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {l.loan_status}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(l.created_at).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
