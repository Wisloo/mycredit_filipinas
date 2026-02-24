"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

const TOTAL_STEPS = 5;

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Step 1: Personal Info
  const [personal, setPersonal] = useState({
    first_name: "",
    last_name: "",
    middle_name: "",
    suffix: "",
    email: "",
    birthdate: "",
    gender: "",
    facebook: "",
  });

  // Step 2: Contact & Address
  const [contact, setContact] = useState({
    contact_number: "",
    contact_type: "Personal",
    barangay: "",
    city: "",
    full_address_string: "",
    landmarks: "",
    address_type: "present",
    residence_type: "",
  });

  // Step 3: Employment & Education
  const [employment, setEmployment] = useState({
    occupation: "",
    employer_agency: "",
    previous_employer: "",
    educational_attainment: "",
    income: "",
  });

  // Step 4: Bank Account
  const [bank, setBank] = useState({
    bank_name: "",
    card_number: "",
    card_expiry_date: "",
  });

  // Step 5: Reference & Password
  const [reference, setReference] = useState({
    reference_name: "",
    reference_address: "",
    reference_contact: "",
    reference_type: "relative",
  });
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const updatePersonal = (f: string, v: string) => setPersonal((p) => ({ ...p, [f]: v }));
  const updateContact = (f: string, v: string) => setContact((p) => ({ ...p, [f]: v }));
  const updateEmployment = (f: string, v: string) => setEmployment((p) => ({ ...p, [f]: v }));
  const updateBank = (f: string, v: string) => setBank((p) => ({ ...p, [f]: v }));
  const updateReference = (f: string, v: string) => setReference((p) => ({ ...p, [f]: v }));

  const nextStep = () => {
    setError("");
    if (step === 1) {
      if (!personal.first_name || !personal.last_name || !personal.email) {
        setError("First name, last name, and email are required");
        return;
      }
      if (!personal.birthdate || !personal.gender) {
        setError("Date of birth and gender are required");
        return;
      }
    }
    if (step === 2) {
      if (!contact.contact_number) {
        setError("At least one contact number is required");
        return;
      }
    }
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const prevStep = () => {
    setError("");
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!reference.reference_name || !reference.reference_contact) {
      setError("At least one reference with name and contact is required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...personal,
          password,
          contact,
          employment,
          bank: bank.bank_name ? bank : null,
          reference,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Signup failed");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-ph-blue-500/20 focus:border-ph-blue-500 outline-none transition-all duration-200 text-gray-900 bg-gray-50/50 hover:bg-white";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              s === step
                ? "bg-ph-blue-500 text-white shadow-lg shadow-ph-blue-500/30"
                : s < step
                ? "bg-green-500 text-white"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            {s < step ? "✓" : s}
          </div>
          {s < TOTAL_STEPS && (
            <div className={`w-6 h-0.5 ${s < step ? "bg-green-400" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-900 mb-1">Personal Information</h3>
      <p className="text-xs text-gray-500 mb-4">Tell us about yourself</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>First Name *</label>
          <input type="text" required value={personal.first_name} onChange={(e) => updatePersonal("first_name", e.target.value)} className={inputClass} placeholder="Juan" />
        </div>
        <div>
          <label className={labelClass}>Last Name *</label>
          <input type="text" required value={personal.last_name} onChange={(e) => updatePersonal("last_name", e.target.value)} className={inputClass} placeholder="Dela Cruz" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Middle Name</label>
          <input type="text" value={personal.middle_name} onChange={(e) => updatePersonal("middle_name", e.target.value)} className={inputClass} placeholder="Santos" />
        </div>
        <div>
          <label className={labelClass}>Suffix</label>
          <input type="text" value={personal.suffix} onChange={(e) => updatePersonal("suffix", e.target.value)} className={inputClass} placeholder="Jr., Sr., III" />
        </div>
      </div>
      <div>
        <label className={labelClass}>Email Address *</label>
        <input type="email" required value={personal.email} onChange={(e) => updatePersonal("email", e.target.value)} className={inputClass} placeholder="juan@email.com" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Date of Birth *</label>
          <input type="date" required value={personal.birthdate} onChange={(e) => updatePersonal("birthdate", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Gender *</label>
          <select required value={personal.gender} onChange={(e) => updatePersonal("gender", e.target.value)} className={inputClass}>
            <option value="">Select...</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
      </div>
      <div>
        <label className={labelClass}>Facebook Profile</label>
        <input type="text" value={personal.facebook} onChange={(e) => updatePersonal("facebook", e.target.value)} className={inputClass} placeholder="facebook.com/juan.delacruz or username" />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-900 mb-1">Contact & Address</h3>
      <p className="text-xs text-gray-500 mb-4">How can we reach you?</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Contact Number *</label>
          <input type="text" required value={contact.contact_number} onChange={(e) => updateContact("contact_number", e.target.value)} className={inputClass} placeholder="09XX XXX XXXX" />
        </div>
        <div>
          <label className={labelClass}>Contact Type</label>
          <select value={contact.contact_type} onChange={(e) => updateContact("contact_type", e.target.value)} className={inputClass}>
            <option value="Mobile">Mobile</option>
            <option value="Home">Home</option>
            <option value="Work">Work</option>
          </select>
        </div>
      </div>
      <div>
        <label className={labelClass}>Full Address</label>
        <input type="text" value={contact.full_address_string} onChange={(e) => updateContact("full_address_string", e.target.value)} className={inputClass} placeholder="123 Rizal St., Purok 1, Brgy. San Jose, Quezon City" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Barangay</label>
          <input type="text" value={contact.barangay} onChange={(e) => updateContact("barangay", e.target.value)} className={inputClass} placeholder="Brgy. San Jose" />
        </div>
        <div>
          <label className={labelClass}>City / Municipality</label>
          <input type="text" value={contact.city} onChange={(e) => updateContact("city", e.target.value)} className={inputClass} placeholder="Quezon City" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Landmarks</label>
          <input type="text" value={contact.landmarks} onChange={(e) => updateContact("landmarks", e.target.value)} className={inputClass} placeholder="Near sari-sari store" />
        </div>
        <div>
          <label className={labelClass}>Residence Type</label>
          <select value={contact.residence_type} onChange={(e) => updateContact("residence_type", e.target.value)} className={inputClass}>
            <option value="">Select...</option>
            <option value="Owned">Owned</option>
            <option value="Rented">Rented</option>
            <option value="Family-owned">Family-owned</option>
            <option value="Company-provided">Company-provided</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-900 mb-1">Employment & Education</h3>
      <p className="text-xs text-gray-500 mb-4">Help us assess your profile</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Occupation</label>
          <input type="text" value={employment.occupation} onChange={(e) => updateEmployment("occupation", e.target.value)} className={inputClass} placeholder="Software Engineer" />
        </div>
        <div>
          <label className={labelClass}>Employer / Agency</label>
          <input type="text" value={employment.employer_agency} onChange={(e) => updateEmployment("employer_agency", e.target.value)} className={inputClass} placeholder="Company name" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Previous Employer</label>
          <input type="text" value={employment.previous_employer} onChange={(e) => updateEmployment("previous_employer", e.target.value)} className={inputClass} placeholder="Previous company" />
        </div>
        <div>
          <label className={labelClass}>Monthly Income (₱)</label>
          <input type="number" value={employment.income} onChange={(e) => updateEmployment("income", e.target.value)} className={inputClass} placeholder="25000" />
        </div>
      </div>
      <div>
        <label className={labelClass}>Educational Attainment</label>
        <select value={employment.educational_attainment} onChange={(e) => updateEmployment("educational_attainment", e.target.value)} className={inputClass}>
          <option value="">Select...</option>
          <option value="Elementary">Elementary</option>
          <option value="High School">High School</option>
          <option value="Vocational">Vocational</option>
          <option value="College">College</option>
          <option value="Post-Graduate">Post-Graduate</option>
        </select>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-900 mb-1">Bank Account</h3>
      <p className="text-xs text-gray-500 mb-4">For loan disbursement (optional)</p>
      <div>
        <label className={labelClass}>Bank Name</label>
        <select value={bank.bank_name} onChange={(e) => updateBank("bank_name", e.target.value)} className={inputClass}>
          <option value="">Select bank...</option>
          <option value="BDO">BDO</option>
          <option value="BPI">BPI</option>
          <option value="Metrobank">Metrobank</option>
          <option value="Landbank">Landbank</option>
          <option value="UnionBank">UnionBank</option>
          <option value="GCash">GCash</option>
          <option value="Maya">Maya</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div>
        <label className={labelClass}>Card / Account Number</label>
        <input type="text" value={bank.card_number} onChange={(e) => updateBank("card_number", e.target.value)} className={inputClass} placeholder="XXXX-XXXX-XXXX-XXXX" />
      </div>
      <div>
        <label className={labelClass}>Card Expiry Date</label>
        <input type="month" value={bank.card_expiry_date} onChange={(e) => updateBank("card_expiry_date", e.target.value)} className={inputClass} />
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-900 mb-1">Reference & Password</h3>
      <p className="text-xs text-gray-500 mb-4">Provide one reference and set your password</p>

      <div className="p-4 bg-gray-50 rounded-xl space-y-3 border border-gray-100">
        <p className="text-sm font-semibold text-gray-700">Character Reference *</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Full Name *</label>
            <input type="text" required value={reference.reference_name} onChange={(e) => updateReference("reference_name", e.target.value)} className={inputClass} placeholder="Full name" />
          </div>
          <div>
            <label className={labelClass}>Contact Number *</label>
            <input type="text" required value={reference.reference_contact} onChange={(e) => updateReference("reference_contact", e.target.value)} className={inputClass} placeholder="09XX XXX XXXX" />
          </div>
        </div>
        <div>
          <label className={labelClass}>Address</label>
          <input type="text" value={reference.reference_address} onChange={(e) => updateReference("reference_address", e.target.value)} className={inputClass} placeholder="Reference address" />
        </div>
        <div>
          <label className={labelClass}>Relationship</label>
          <select value={reference.reference_type} onChange={(e) => updateReference("reference_type", e.target.value)} className={inputClass}>
            <option value="personal">Personal</option>
            <option value="family">Family</option>
            <option value="work">Work</option>
            <option value="neighbor">Neighbor</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Password *</label>
          <div className="relative">
            <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass + " pr-12"} placeholder="Min 6 characters" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1" tabIndex={-1}>
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              )}
            </button>
          </div>
        </div>
        <div>
          <label className={labelClass}>Confirm Password *</label>
          <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputClass} placeholder="Re-enter password" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-ph-blue-600 via-ph-blue-700 to-ph-blue-900 flex flex-col relative overflow-hidden">
      {/* Decorative shapes */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-ph-gold-500/10 rounded-full blur-[100px] -translate-y-1/3 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-ph-red-500/8 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4" />
      <div className="absolute top-1/3 left-1/4 w-20 h-20 bg-ph-gold-500/10 rounded-full blur-xl animate-float" />
      <div className="absolute bottom-1/4 right-1/3 w-16 h-16 bg-white/5 rounded-full blur-lg animate-float-slow" />

      {/* Simple top nav */}
      <nav className="px-4 sm:px-6 lg:px-8 py-4 relative z-10">
        <Link href="/" className="text-white font-bold text-xl tracking-tight flex items-center gap-2">
          <div className="w-8 h-8 bg-ph-gold-500 rounded-lg flex items-center justify-center text-ph-blue-900 font-extrabold text-sm">MC</div>
          <span>MyCredit Filipinas</span>
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-lg animate-fade-in">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/20 p-8 border border-white/50">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-ph-blue-500 to-ph-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-ph-blue-500/30">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                </svg>
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900">
                Create Your Account
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Step {step} of {TOTAL_STEPS}
                {step === 1 && " — Personal Info"}
                {step === 2 && " — Contact & Address"}
                {step === 3 && " — Employment"}
                {step === 4 && " — Bank Account"}
                {step === 5 && " — Reference & Password"}
              </p>
            </div>

            {renderStepIndicator()}

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
                {error}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (step < TOTAL_STEPS) {
                  nextStep();
                } else {
                  handleSubmit(e);
                }
              }}
            >
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
              {step === 4 && renderStep4()}
              {step === 5 && renderStep5()}

              <div className="flex gap-3 mt-6">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    ← Back
                  </button>
                )}
                {step < TOTAL_STEPS ? (
                  <button
                    type="submit"
                    className="flex-1 py-3.5 bg-gradient-to-r from-ph-blue-500 to-ph-blue-600 text-white font-bold rounded-xl hover:from-ph-blue-600 hover:to-ph-blue-700 transition-all duration-200 shadow-lg shadow-ph-blue-500/25"
                  >
                    Continue →
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3.5 bg-gradient-to-r from-ph-red-500 to-ph-red-600 text-white font-bold rounded-xl hover:from-ph-red-600 hover:to-ph-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-ph-red-500/25 active:scale-[0.98]"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Creating Account...
                      </span>
                    ) : (
                      "Create Account"
                    )}
                  </button>
                )}
              </div>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-ph-blue-600 font-semibold hover:text-ph-blue-700 transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
