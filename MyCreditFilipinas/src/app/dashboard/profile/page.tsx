"use client";

import { useEffect, useState, useCallback } from "react";

/* â”€â”€â”€â”€â”€ TypeScript Interfaces â”€â”€â”€â”€â”€ */
interface Contact {
  contact_number_id: number;
  contact_number: string;
  contact_type: "Personal" | "Work" | "Parent";
}
interface BankAccount {
  bank_account_id: number;
  bank_name: string;
  card_number: string | null;
  card_expiry_date: string | null;
}
interface Address {
  user_address_id: number;
  address_id: number;
  address_type: string;
  residence_type: string | null;
  is_primary: number;
  building_floor: string | null;
  lot: string | null;
  blk: string | null;
  purok: string | null;
  barangay: string;
  city: string;
  full_address_string: string | null;
  landmarks: string | null;
}
interface Reference {
  reference_id: number;
  reference_type: "relative" | "friend" | "work friend";
  name: string;
  address: string | null;
  contact_number: string | null;
}
interface Employment {
  occupation: string | null;
  employer_agency: string | null;
  previous_employer: string | null;
  educational_attainment: string | null;
  income: number | null;
}
interface FullProfile {
  user_id: number;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  suffix: string | null;
  gender: string | null;
  birthdate: string | null;
  facebook: string | null;
  email_address: string;
  created_at: string;
  profile: Employment | null;
  contacts: Contact[];
  bank_accounts: BankAccount[];
  addresses: Address[];
  references: Reference[];
}

/* â”€â”€â”€â”€â”€ Reusable Sub-components â”€â”€â”€â”€â”€ */
function Section({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h3 className="font-bold text-gray-900">{title}</h3>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50/80 rounded-xl p-4 hover:bg-gray-50 transition-colors">
      <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold mb-1">
        {label}
      </p>
      <p className="text-gray-900 font-semibold text-sm">{value}</p>
    </div>
  );
}

function Btn({
  children,
  onClick,
  variant = "primary",
  size = "sm",
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "danger" | "outline";
  size?: "xs" | "sm";
  disabled?: boolean;
}) {
  const cls =
    variant === "primary"
      ? "bg-ph-blue-600 text-white hover:bg-ph-blue-700"
      : variant === "danger"
      ? "bg-red-500 text-white hover:bg-red-600"
      : "border border-gray-300 text-gray-700 hover:bg-gray-50";
  const sz = size === "xs" ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-sm";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${cls} ${sz} rounded-lg font-medium transition-colors disabled:opacity-50`}
    >
      {children}
    </button>
  );
}

/* â”€â”€â”€â”€â”€ Modal Component â”€â”€â”€â”€â”€ */
function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">
            &times;
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-ph-blue-500 focus:border-transparent outline-none";

/* â”€â”€â”€â”€â”€ Main Component â”€â”€â”€â”€â”€ */
export default function ProfilePage() {
  const [data, setData] = useState<FullProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState({ type: "", text: "" });
  const [showPwCurrent, setShowPwCurrent] = useState(false);
  const [showPwNew, setShowPwNew] = useState(false);

  // Modal states
  const [editBasicOpen, setEditBasicOpen] = useState(false);
  const [editEmploymentOpen, setEditEmploymentOpen] = useState(false);
  const [contactModal, setContactModal] = useState<Contact | true | null>(null);
  const [bankModal, setBankModal] = useState<BankAccount | true | null>(null);
  const [addressModal, setAddressModal] = useState<Address | true | null>(null);
  const [referenceModal, setReferenceModal] = useState<Reference | true | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/profile");
      if (!res.ok) throw new Error();
      setData(await res.json());
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const flash = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(""), 3000);
  };

  /* â”€â”€ Password change handler â”€â”€ */
  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg({ type: "", text: "" });
    if (!pwForm.current || !pwForm.newPw) {
      setPwMsg({ type: "error", text: "All fields are required" });
      return;
    }
    if (pwForm.newPw.length < 6) {
      setPwMsg({ type: "error", text: "New password must be at least 6 characters" });
      return;
    }
    if (pwForm.newPw !== pwForm.confirm) {
      setPwMsg({ type: "error", text: "New passwords do not match" });
      return;
    }
    setPwLoading(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_password: pwForm.current, new_password: pwForm.newPw }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwMsg({ type: "error", text: data.error || "Failed to change password" });
        return;
      }
      setPwMsg({ type: "success", text: "Password changed successfully!" });
      setPwForm({ current: "", newPw: "", confirm: "" });
      setTimeout(() => setPwMsg({ type: "", text: "" }), 4000);
    } catch {
      setPwMsg({ type: "error", text: "Network error" });
    } finally {
      setPwLoading(false);
    }
  }

  /* â”€â”€ API helpers â”€â”€ */
  async function updateBasicAndEmployment(body: Record<string, unknown>) {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      flash("Profile updated successfully");
      fetchProfile();
    } catch {
      flash("Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  async function subResourceAction(
    section: string,
    action: string,
    resourceData: Record<string, unknown>
  ) {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, action, data: resourceData }),
      });
      if (!res.ok) throw new Error();
      flash(
        action === "delete"
          ? "Deleted successfully"
          : action === "add"
          ? "Added successfully"
          : "Updated successfully"
      );
      fetchProfile();
    } catch {
      flash("Operation failed");
    } finally {
      setSaving(false);
    }
  }

  /* â”€â”€ Loading / Error â”€â”€ */
  if (loading) {
    return (
      <div className="text-gray-500 py-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ph-blue-500 mx-auto mb-3" />
        Loading profile...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <p className="text-gray-600 font-medium">Could not load profile</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">My Profile</h1>
        <p className="text-gray-500 text-sm">Manage your personal information</p>
      </div>

      {/* Flash message */}
      {msg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
          {msg}
        </div>
      )}

      {/* â•â•â•â•â•â•â•â• Profile Header â•â•â•â•â•â•â•â• */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-ph-blue-600 via-ph-blue-700 to-ph-blue-800 px-6 py-10 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDJ2LTJoMzR6bTAtMzBWMkgyVjBoMzRWNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl font-extrabold border border-white/20 shadow-lg">
              {data.first_name.charAt(0)}
              {data.last_name.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-extrabold">
                {data.first_name} {data.middle_name ? data.middle_name + " " : ""}
                {data.last_name} {data.suffix || ""}
              </h2>
              <p className="text-ph-blue-200 text-sm mt-0.5">{data.email_address}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium border border-white/10">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                Active Member
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* â•â•â•â•â•â•â•â• Basic Information â•â•â•â•â•â•â•â• */}
      <Section
        title="Basic Information"
        action={<Btn onClick={() => setEditBasicOpen(true)}>Edit</Btn>}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="First Name" value={data.first_name} />
          <Field label="Middle Name" value={data.middle_name || "â€”"} />
          <Field label="Last Name" value={data.last_name} />
          <Field label="Suffix" value={data.suffix || "â€”"} />
          <Field label="Gender" value={data.gender || "â€”"} />
          <Field
            label="Date of Birth"
            value={data.birthdate ? new Date(data.birthdate).toLocaleDateString() : "â€”"}
          />
          <Field label="Facebook" value={data.facebook || "â€”"} />
          <Field
            label="Member Since"
            value={data.created_at ? new Date(data.created_at).toLocaleDateString() : "â€”"}
          />
        </div>
      </Section>

      {/* â•â•â•â•â•â•â•â• Contact Numbers â•â•â•â•â•â•â•â• */}
      <Section
        title="Contact Numbers"
        action={<Btn onClick={() => setContactModal(true)}>+ Add</Btn>}
      >
        {data.contacts.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">
            No contact numbers added yet
          </p>
        ) : (
          <div className="space-y-3">
            {data.contacts.map((c) => (
              <div
                key={c.contact_number_id}
                className="flex items-center justify-between bg-gray-50 rounded-xl p-4"
              >
                <div>
                  <p className="text-gray-900 font-semibold text-sm">{c.contact_number}</p>
                  <p className="text-xs text-gray-500">{c.contact_type}</p>
                </div>
                <div className="flex gap-2">
                  <Btn size="xs" variant="outline" onClick={() => setContactModal(c)}>
                    Edit
                  </Btn>
                  <Btn
                    size="xs"
                    variant="danger"
                    onClick={() =>
                      subResourceAction("contacts", "delete", {
                        contact_number_id: c.contact_number_id,
                      })
                    }
                  >
                    Delete
                  </Btn>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* â•â•â•â•â•â•â•â• Addresses â•â•â•â•â•â•â•â• */}
      <Section
        title="Addresses"
        action={<Btn onClick={() => setAddressModal(true)}>+ Add</Btn>}
      >
        {data.addresses.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">No addresses added yet</p>
        ) : (
          <div className="space-y-3">
            {data.addresses.map((a) => (
              <div
                key={a.user_address_id}
                className="flex items-start justify-between bg-gray-50 rounded-xl p-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-ph-blue-100 text-ph-blue-700 capitalize">
                      {a.address_type?.replace("_", " ")}
                    </span>
                    {a.residence_type && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        {a.residence_type}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-900 font-semibold text-sm mt-1">
                    {a.full_address_string || [a.lot, a.blk, a.purok, a.barangay, a.city].filter(Boolean).join(", ")}
                  </p>
                  {a.landmarks && (
                    <p className="text-xs text-gray-500 mt-0.5">Landmarks: {a.landmarks}</p>
                  )}
                </div>
                <div className="flex gap-2 ml-3">
                  <Btn size="xs" variant="outline" onClick={() => setAddressModal(a)}>
                    Edit
                  </Btn>
                  <Btn
                    size="xs"
                    variant="danger"
                    onClick={() =>
                      subResourceAction("addresses", "delete", {
                        user_address_id: a.user_address_id,
                      })
                    }
                  >
                    Delete
                  </Btn>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* â•â•â•â•â•â•â•â• Employment & Education â•â•â•â•â•â•â•â• */}
      <Section
        title="Employment & Education"
        action={<Btn onClick={() => setEditEmploymentOpen(true)}>Edit</Btn>}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Occupation" value={data.profile?.occupation || "â€”"} />
          <Field label="Current Employer" value={data.profile?.employer_agency || "â€”"} />
          <Field label="Previous Employer" value={data.profile?.previous_employer || "â€”"} />
          <Field
            label="Educational Attainment"
            value={data.profile?.educational_attainment || "â€”"}
          />
          <Field
            label="Monthly Income"
            value={
              data.profile?.income
                ? `â‚±${Number(data.profile.income).toLocaleString()}`
                : "â€”"
            }
          />
        </div>
      </Section>

      {/* â•â•â•â•â•â•â•â• Bank Accounts â•â•â•â•â•â•â•â• */}
      <Section
        title="Bank Accounts"
        action={<Btn onClick={() => setBankModal(true)}>+ Add</Btn>}
      >
        {data.bank_accounts.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">No bank accounts added yet</p>
        ) : (
          <div className="space-y-3">
            {data.bank_accounts.map((b) => (
              <div
                key={b.bank_account_id}
                className="flex items-center justify-between bg-gray-50 rounded-xl p-4"
              >
                <div>
                  <p className="text-gray-900 font-semibold text-sm">{b.bank_name}</p>
                  <p className="text-xs text-gray-500">
                    {b.card_number
                      ? `**** **** **** ${b.card_number.slice(-4)}`
                      : "No card number"}
                    {b.card_expiry_date &&
                      ` Â· Exp: ${new Date(b.card_expiry_date).toLocaleDateString("en-US", {
                        month: "2-digit",
                        year: "2-digit",
                      })}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Btn size="xs" variant="outline" onClick={() => setBankModal(b)}>
                    Edit
                  </Btn>
                  <Btn
                    size="xs"
                    variant="danger"
                    onClick={() =>
                      subResourceAction("banks", "delete", {
                        bank_account_id: b.bank_account_id,
                      })
                    }
                  >
                    Delete
                  </Btn>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* â•â•â•â•â•â•â•â• References â•â•â•â•â•â•â•â• */}
      <Section
        title="References"
        action={<Btn onClick={() => setReferenceModal(true)}>+ Add</Btn>}
      >
        {data.references.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">No references added yet</p>
        ) : (
          <div className="space-y-3">
            {data.references.map((r) => (
              <div
                key={r.reference_id}
                className="flex items-start justify-between bg-gray-50 rounded-xl p-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 capitalize">
                      {r.reference_type}
                    </span>
                  </div>
                  <p className="text-gray-900 font-semibold text-sm">{r.name}</p>
                  {r.contact_number && (
                    <p className="text-xs text-gray-500">{r.contact_number}</p>
                  )}
                  {r.address && (
                    <p className="text-xs text-gray-500">{r.address}</p>
                  )}
                </div>
                <div className="flex gap-2 ml-3">
                  <Btn size="xs" variant="outline" onClick={() => setReferenceModal(r)}>
                    Edit
                  </Btn>
                  <Btn
                    size="xs"
                    variant="danger"
                    onClick={() =>
                      subResourceAction("references", "delete", {
                        reference_id: r.reference_id,
                      })
                    }
                  >
                    Delete
                  </Btn>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* â•â•â•â•â•â•â•â• Change Password â•â•â•â•â•â•â•â• */}
      <Section title="Change Password">
        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          {pwMsg.text && (
            <div className={`p-3 rounded-xl text-sm font-medium ${pwMsg.type === "error" ? "bg-red-50 border border-red-200 text-red-700" : "bg-green-50 border border-green-200 text-green-700"}`}>
              {pwMsg.text}
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Current Password</label>
            <div className="relative">
              <input
                type={showPwCurrent ? "text" : "password"}
                value={pwForm.current}
                onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
                className={inputCls + " pr-12"}
                placeholder="Enter your current password"
              />
              <button type="button" onClick={() => setShowPwCurrent(!showPwCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
                {showPwCurrent ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                )}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Password</label>
            <div className="relative">
              <input
                type={showPwNew ? "text" : "password"}
                value={pwForm.newPw}
                onChange={(e) => setPwForm({ ...pwForm, newPw: e.target.value })}
                className={inputCls + " pr-12"}
                placeholder="Min 6 characters"
              />
              <button type="button" onClick={() => setShowPwNew(!showPwNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
                {showPwNew ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                )}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm New Password</label>
            <input
              type="password"
              value={pwForm.confirm}
              onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
              className={inputCls}
              placeholder="Re-enter new password"
            />
          </div>
          <button
            type="submit"
            disabled={pwLoading}
            className="px-6 py-2.5 bg-gradient-to-r from-ph-blue-500 to-ph-blue-600 text-white font-bold rounded-xl hover:from-ph-blue-600 hover:to-ph-blue-700 transition-all duration-200 disabled:opacity-50 shadow-md shadow-ph-blue-500/20"
          >
            {pwLoading ? "Changing..." : "Change Password"}
          </button>
        </form>
      </Section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {/* MODALS                                */}
      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}

      {/* â”€â”€ Edit Basic Info Modal â”€â”€ */}
      <EditBasicModal
        open={editBasicOpen}
        onClose={() => setEditBasicOpen(false)}
        profile={data}
        onSave={(basic) => {
          updateBasicAndEmployment({ basic });
          setEditBasicOpen(false);
        }}
        saving={saving}
      />

      {/* â”€â”€ Edit Employment Modal â”€â”€ */}
      <EditEmploymentModal
        open={editEmploymentOpen}
        onClose={() => setEditEmploymentOpen(false)}
        profile={data.profile}
        onSave={(employment) => {
          updateBasicAndEmployment({ employment });
          setEditEmploymentOpen(false);
        }}
        saving={saving}
      />

      {/* â”€â”€ Contact Modal â”€â”€ */}
      <ContactModal
        item={contactModal}
        onClose={() => setContactModal(null)}
        onSave={(d, isEdit) => {
          subResourceAction("contacts", isEdit ? "update" : "add", d);
          setContactModal(null);
        }}
        saving={saving}
      />

      {/* â”€â”€ Bank Modal â”€â”€ */}
      <BankModal
        item={bankModal}
        onClose={() => setBankModal(null)}
        onSave={(d, isEdit) => {
          subResourceAction("banks", isEdit ? "update" : "add", d);
          setBankModal(null);
        }}
        saving={saving}
      />

      {/* â”€â”€ Address Modal â”€â”€ */}
      <AddressModal
        item={addressModal}
        onClose={() => setAddressModal(null)}
        onSave={(d, isEdit) => {
          subResourceAction("addresses", isEdit ? "update" : "add", d);
          setAddressModal(null);
        }}
        saving={saving}
      />

      {/* â”€â”€ Reference Modal â”€â”€ */}
      <ReferenceModal
        item={referenceModal}
        onClose={() => setReferenceModal(null)}
        onSave={(d, isEdit) => {
          subResourceAction("references", isEdit ? "update" : "add", d);
          setReferenceModal(null);
        }}
        saving={saving}
      />
    </div>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
/* Modal Forms                                           */
/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function EditBasicModal({
  open,
  onClose,
  profile,
  onSave,
  saving,
}: {
  open: boolean;
  onClose: () => void;
  profile: FullProfile;
  onSave: (d: Record<string, unknown>) => void;
  saving: boolean;
}) {
  const [form, setForm] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    suffix: "",
    gender: "",
    birthdate: "",
    facebook: "",
  });

  useEffect(() => {
    if (open && profile) {
      setForm({
        first_name: profile.first_name || "",
        middle_name: profile.middle_name || "",
        last_name: profile.last_name || "",
        suffix: profile.suffix || "",
        gender: profile.gender || "",
        birthdate: profile.birthdate ? profile.birthdate.split("T")[0] : "",
        facebook: profile.facebook || "",
      });
    }
  }, [open, profile]);

  return (
    <Modal open={open} onClose={onClose} title="Edit Basic Information">
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField label="First Name">
            <input
              className={inputCls}
              value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            />
          </FormField>
          <FormField label="Middle Name">
            <input
              className={inputCls}
              value={form.middle_name}
              onChange={(e) => setForm({ ...form, middle_name: e.target.value })}
            />
          </FormField>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField label="Last Name">
            <input
              className={inputCls}
              value={form.last_name}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            />
          </FormField>
          <FormField label="Suffix">
            <input
              className={inputCls}
              placeholder="Jr, Sr, III..."
              value={form.suffix}
              onChange={(e) => setForm({ ...form, suffix: e.target.value })}
            />
          </FormField>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField label="Gender">
            <select
              className={inputCls}
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
            >
              <option value="">Select...</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </FormField>
          <FormField label="Date of Birth">
            <input
              type="date"
              className={inputCls}
              value={form.birthdate}
              onChange={(e) => setForm({ ...form, birthdate: e.target.value })}
            />
          </FormField>
        </div>
        <FormField label="Facebook Profile URL">
          <input
            className={inputCls}
            placeholder="https://facebook.com/..."
            value={form.facebook}
            onChange={(e) => setForm({ ...form, facebook: e.target.value })}
          />
        </FormField>
        <div className="flex justify-end gap-3 pt-2">
          <Btn variant="outline" onClick={onClose}>
            Cancel
          </Btn>
          <Btn disabled={saving || !form.first_name || !form.last_name} onClick={() => onSave(form)}>
            {saving ? "Saving..." : "Save Changes"}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}

function EditEmploymentModal({
  open,
  onClose,
  profile,
  onSave,
  saving,
}: {
  open: boolean;
  onClose: () => void;
  profile: Employment | null;
  onSave: (d: Record<string, unknown>) => void;
  saving: boolean;
}) {
  const [form, setForm] = useState({
    occupation: "",
    employer_agency: "",
    previous_employer: "",
    educational_attainment: "",
    income: "",
  });

  useEffect(() => {
    if (open) {
      setForm({
        occupation: profile?.occupation || "",
        employer_agency: profile?.employer_agency || "",
        previous_employer: profile?.previous_employer || "",
        educational_attainment: profile?.educational_attainment || "",
        income: profile?.income ? String(profile.income) : "",
      });
    }
  }, [open, profile]);

  return (
    <Modal open={open} onClose={onClose} title="Edit Employment & Education">
      <div className="space-y-4">
        <FormField label="Occupation">
          <input
            className={inputCls}
            value={form.occupation}
            onChange={(e) => setForm({ ...form, occupation: e.target.value })}
          />
        </FormField>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField label="Current Employer">
            <input
              className={inputCls}
              value={form.employer_agency}
              onChange={(e) => setForm({ ...form, employer_agency: e.target.value })}
            />
          </FormField>
          <FormField label="Previous Employer">
            <input
              className={inputCls}
              value={form.previous_employer}
              onChange={(e) => setForm({ ...form, previous_employer: e.target.value })}
            />
          </FormField>
        </div>
        <FormField label="Educational Attainment">
          <select
            className={inputCls}
            value={form.educational_attainment}
            onChange={(e) => setForm({ ...form, educational_attainment: e.target.value })}
          >
            <option value="">Select...</option>
            <option value="Elementary">Elementary</option>
            <option value="High School">High School</option>
            <option value="Senior High School">Senior High School</option>
            <option value="Vocational">Vocational</option>
            <option value="College Undergraduate">College Undergraduate</option>
            <option value="College Graduate">College Graduate</option>
            <option value="Post Graduate">Post Graduate</option>
          </select>
        </FormField>
        <FormField label="Monthly Income (â‚±)">
          <input
            type="number"
            className={inputCls}
            value={form.income}
            onChange={(e) => setForm({ ...form, income: e.target.value })}
          />
        </FormField>
        <div className="flex justify-end gap-3 pt-2">
          <Btn variant="outline" onClick={onClose}>
            Cancel
          </Btn>
          <Btn
            disabled={saving}
            onClick={() =>
              onSave({ ...form, income: form.income ? Number(form.income) : null })
            }
          >
            {saving ? "Saving..." : "Save Changes"}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}

function ContactModal({
  item,
  onClose,
  onSave,
  saving,
}: {
  item: Contact | true | null;
  onClose: () => void;
  onSave: (d: Record<string, unknown>, isEdit: boolean) => void;
  saving: boolean;
}) {
  const isEdit = item !== null && item !== true;
  const [form, setForm] = useState({ contact_number: "", contact_type: "Personal" });

  useEffect(() => {
    if (item && item !== true) {
      setForm({
        contact_number: item.contact_number,
        contact_type: item.contact_type,
      });
    } else {
      setForm({ contact_number: "", contact_type: "Personal" });
    }
  }, [item]);

  return (
    <Modal open={!!item} onClose={onClose} title={isEdit ? "Edit Contact" : "Add Contact"}>
      <div className="space-y-4">
        <FormField label="Phone Number">
          <input
            className={inputCls}
            placeholder="09XX XXX XXXX"
            value={form.contact_number}
            onChange={(e) => setForm({ ...form, contact_number: e.target.value })}
          />
        </FormField>
        <FormField label="Type">
          <select
            className={inputCls}
            value={form.contact_type}
            onChange={(e) => setForm({ ...form, contact_type: e.target.value })}
          >
            <option value="Personal">Personal</option>
            <option value="Work">Work</option>
            <option value="Parent">Parent</option>
          </select>
        </FormField>
        <div className="flex justify-end gap-3 pt-2">
          <Btn variant="outline" onClick={onClose}>
            Cancel
          </Btn>
          <Btn
            disabled={saving || !form.contact_number}
            onClick={() =>
              onSave(
                isEdit
                  ? { ...form, contact_number_id: (item as Contact).contact_number_id }
                  : form,
                isEdit
              )
            }
          >
            {saving ? "Saving..." : isEdit ? "Update" : "Add"}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}

function BankModal({
  item,
  onClose,
  onSave,
  saving,
}: {
  item: BankAccount | true | null;
  onClose: () => void;
  onSave: (d: Record<string, unknown>, isEdit: boolean) => void;
  saving: boolean;
}) {
  const isEdit = item !== null && item !== true;
  const [form, setForm] = useState({
    bank_name: "",
    card_number: "",
    card_expiry_date: "",
  });

  useEffect(() => {
    if (item && item !== true) {
      setForm({
        bank_name: item.bank_name,
        card_number: item.card_number || "",
        card_expiry_date: item.card_expiry_date
          ? item.card_expiry_date.split("T")[0]
          : "",
      });
    } else {
      setForm({ bank_name: "", card_number: "", card_expiry_date: "" });
    }
  }, [item]);

  return (
    <Modal open={!!item} onClose={onClose} title={isEdit ? "Edit Bank Account" : "Add Bank Account"}>
      <div className="space-y-4">
        <FormField label="Bank Name">
          <input
            className={inputCls}
            placeholder="e.g. BDO, BPI, GCash..."
            value={form.bank_name}
            onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
          />
        </FormField>
        <FormField label="Card / Account Number">
          <input
            className={inputCls}
            placeholder="Card or account number"
            maxLength={16}
            value={form.card_number}
            onChange={(e) => setForm({ ...form, card_number: e.target.value })}
          />
        </FormField>
        <FormField label="Card Expiry Date">
          <input
            type="date"
            className={inputCls}
            value={form.card_expiry_date}
            onChange={(e) => setForm({ ...form, card_expiry_date: e.target.value })}
          />
        </FormField>
        <div className="flex justify-end gap-3 pt-2">
          <Btn variant="outline" onClick={onClose}>
            Cancel
          </Btn>
          <Btn
            disabled={saving || !form.bank_name}
            onClick={() =>
              onSave(
                isEdit
                  ? { ...form, bank_account_id: (item as BankAccount).bank_account_id }
                  : form,
                isEdit
              )
            }
          >
            {saving ? "Saving..." : isEdit ? "Update" : "Add"}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}

function AddressModal({
  item,
  onClose,
  onSave,
  saving,
}: {
  item: Address | true | null;
  onClose: () => void;
  onSave: (d: Record<string, unknown>, isEdit: boolean) => void;
  saving: boolean;
}) {
  const isEdit = item !== null && item !== true;
  const [form, setForm] = useState({
    address_type: "present",
    residence_type: "",
    building_floor: "",
    lot: "",
    blk: "",
    purok: "",
    barangay: "",
    city: "",
    landmarks: "",
  });

  useEffect(() => {
    if (item && item !== true) {
      setForm({
        address_type: item.address_type || "present",
        residence_type: item.residence_type || "",
        building_floor: item.building_floor || "",
        lot: item.lot || "",
        blk: item.blk || "",
        purok: item.purok || "",
        barangay: item.barangay || "",
        city: item.city || "",
        landmarks: item.landmarks || "",
      });
    } else {
      setForm({
        address_type: "present",
        residence_type: "",
        building_floor: "",
        lot: "",
        blk: "",
        purok: "",
        barangay: "",
        city: "",
        landmarks: "",
      });
    }
  }, [item]);

  return (
    <Modal open={!!item} onClose={onClose} title={isEdit ? "Edit Address" : "Add Address"}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField label="Address Type">
            <select
              className={inputCls}
              value={form.address_type}
              onChange={(e) => setForm({ ...form, address_type: e.target.value })}
            >
              <option value="birth_place">Birth Place</option>
              <option value="present">Present Address</option>
              <option value="other">Other</option>
            </select>
          </FormField>
          <FormField label="Residence Type">
            <select
              className={inputCls}
              value={form.residence_type}
              onChange={(e) => setForm({ ...form, residence_type: e.target.value })}
            >
              <option value="">Select...</option>
              <option value="Owned(personal)">Owned (Personal)</option>
              <option value="Owned but living with parents/relatives">
                Owned (Living with parents/relatives)
              </option>
              <option value="Rented">Rented</option>
              <option value="Rented but living with parents/relatives">
                Rented (Living with parents/relatives)
              </option>
            </select>
          </FormField>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FormField label="Building / Floor">
            <input
              className={inputCls}
              value={form.building_floor}
              onChange={(e) => setForm({ ...form, building_floor: e.target.value })}
            />
          </FormField>
          <FormField label="Lot">
            <input
              className={inputCls}
              value={form.lot}
              onChange={(e) => setForm({ ...form, lot: e.target.value })}
            />
          </FormField>
          <FormField label="Block">
            <input
              className={inputCls}
              value={form.blk}
              onChange={(e) => setForm({ ...form, blk: e.target.value })}
            />
          </FormField>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FormField label="Purok">
            <input
              className={inputCls}
              value={form.purok}
              onChange={(e) => setForm({ ...form, purok: e.target.value })}
            />
          </FormField>
          <FormField label="Barangay *">
            <input
              className={inputCls}
              value={form.barangay}
              onChange={(e) => setForm({ ...form, barangay: e.target.value })}
            />
          </FormField>
          <FormField label="City *">
            <input
              className={inputCls}
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
          </FormField>
        </div>
        <FormField label="Landmarks">
          <input
            className={inputCls}
            placeholder="Near mall, beside church..."
            value={form.landmarks}
            onChange={(e) => setForm({ ...form, landmarks: e.target.value })}
          />
        </FormField>
        <div className="flex justify-end gap-3 pt-2">
          <Btn variant="outline" onClick={onClose}>
            Cancel
          </Btn>
          <Btn
            disabled={saving || !form.barangay || !form.city}
            onClick={() =>
              onSave(
                isEdit
                  ? {
                      ...form,
                      user_address_id: (item as Address).user_address_id,
                      address_id: (item as Address).address_id,
                    }
                  : form,
                isEdit
              )
            }
          >
            {saving ? "Saving..." : isEdit ? "Update" : "Add"}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}

function ReferenceModal({
  item,
  onClose,
  onSave,
  saving,
}: {
  item: Reference | true | null;
  onClose: () => void;
  onSave: (d: Record<string, unknown>, isEdit: boolean) => void;
  saving: boolean;
}) {
  const isEdit = item !== null && item !== true;
  const [form, setForm] = useState({
    reference_type: "relative" as string,
    name: "",
    address: "",
    contact_number: "",
  });

  useEffect(() => {
    if (item && item !== true) {
      setForm({
        reference_type: item.reference_type,
        name: item.name,
        address: item.address || "",
        contact_number: item.contact_number || "",
      });
    } else {
      setForm({ reference_type: "relative", name: "", address: "", contact_number: "" });
    }
  }, [item]);

  return (
    <Modal open={!!item} onClose={onClose} title={isEdit ? "Edit Reference" : "Add Reference"}>
      <div className="space-y-4">
        <FormField label="Relationship">
          <select
            className={inputCls}
            value={form.reference_type}
            onChange={(e) => setForm({ ...form, reference_type: e.target.value })}
          >
            <option value="relative">Relative</option>
            <option value="friend">Friend</option>
            <option value="work friend">Work Friend</option>
          </select>
        </FormField>
        <FormField label="Full Name *">
          <input
            className={inputCls}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </FormField>
        <FormField label="Contact Number">
          <input
            className={inputCls}
            placeholder="09XX XXX XXXX"
            value={form.contact_number}
            onChange={(e) => setForm({ ...form, contact_number: e.target.value })}
          />
        </FormField>
        <FormField label="Address">
          <input
            className={inputCls}
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </FormField>
        <div className="flex justify-end gap-3 pt-2">
          <Btn variant="outline" onClick={onClose}>
            Cancel
          </Btn>
          <Btn
            disabled={saving || !form.name}
            onClick={() =>
              onSave(
                isEdit
                  ? { ...form, reference_id: (item as Reference).reference_id }
                  : form,
                isEdit
              )
            }
          >
            {saving ? "Saving..." : isEdit ? "Update" : "Add"}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}
