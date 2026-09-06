"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Droplets, Lock, Eye, EyeOff, Loader2, Mail, ShieldCheck, ArrowLeft } from "lucide-react";
import { createBrowserClient, isSupabaseConfigured } from "@/lib/supabase/browser";

const REQUEST_ACCESS_EMAIL = "drrmo@liloan.gov.ph";

const inputClass =
  "glass-input";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRequest, setShowRequest] = useState(false);
  const [request, setRequest] = useState({ name: "", role: "", area: "", contactEmail: "", reason: "" });
  const [requestSent, setRequestSent] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  const configured = isSupabaseConfigured();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!configured) {
      setError("Officials sign-in is not configured yet on this deployment.");
      return;
    }
    if (!email.trim() || !password) {
      setError("Enter both your official email and password.");
      return;
    }

    setLoading(true);
    const supabase = createBrowserClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);

    if (authError) {
      setError(
        authError.message === "Invalid login credentials"
          ? "Invalid email or password. This incident has been logged."
          : authError.message
      );
      return;
    }

    router.replace("/admin");
    router.refresh();
  };

  const handleRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setRequestError(null);
    const { name, role, area, contactEmail, reason } = request;
    if (!name.trim() || !role.trim() || !area.trim() || !contactEmail.trim() || !reason.trim()) {
      setRequestError("Please complete all fields so the DRRMO can process your request.");
      return;
    }

    const subject = `Officials Access Request - ${name.trim()}`;
    const body = [
      "Please grant me access to the Cotcot Flood Alert Officials Dashboard.",
      "",
      `Name: ${name.trim()}`,
      `Position / Role: ${role.trim()}`,
      `Barangay / Purok: ${area.trim()}`,
      `Contact email: ${contactEmail.trim()}`,
      `Reason: ${reason.trim()}`,
      "",
      "Submitted via the Cotcot Flood Alert web application.",
    ].join("\n");

    window.location.href = `mailto:${REQUEST_ACCESS_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setRequestSent(true);
    setRequest({ name: "", role: "", area: "", contactEmail: "", reason: "" });
  };

  return (
    <div className="sky-surface min-h-screen flex flex-col" data-sky="clouds">
      <div className="px-4 md:px-6 pt-4">
        <Link href="/" className="inline-flex items-center gap-1.5 glass-chip px-3 py-1.5 text-on-sky-dim hover:text-on-sky transition-colors font-label-md font-label-sm">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Dashboard
        </Link>
      </div>

      <main className="flex-1 w-full max-w-md mx-auto px-4 py-10 flex flex-col justify-center">
        <div className="glass-card p-8 rounded-3xl animate-fade-in">
          {/* Brand */}
          <div className="flex items-center gap-3 mb-1">
            <div className="w-11 h-11 rounded-2xl bg-glass text-accent-strong shadow-sm flex items-center justify-center">
              <Droplets className="w-6 h-6" />
            </div>
            <div className="leading-tight">
              <div className="text-on-sky font-semibold">Cotcot Flood Alert</div>
              <div className="text-on-sky-faint text-xs font-medium">Brgy. Cotcot, Liloan, Cebu</div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-6 mb-2">
            <span className="bg-accent-fill text-accent-strong px-3 py-1 rounded-full font-label-sm text-label-sm font-semibold uppercase tracking-wider inline-flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              Officials Secure Access
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-sky tracking-tight">Sign in to the Command Dashboard</h1>
          <p className="font-body-md text-body-md text-on-sky-dim mt-1">
            Restricted to accredited barangay and municipal personnel. Unauthorized access attempts are recorded.
          </p>

          {!configured && (
            <div className="mt-4 p-3 rounded-2xl bg-warning-fill text-warning font-body-md text-body-md">
              Supabase is not configured on this deployment. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local, then restart the server.
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-6 flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="official-email" className="font-label-md text-label-md text-on-sky-dim font-semibold">
                Official Email
              </label>
              <input
                id="official-email"
                type="email"
                autoComplete="username"
                placeholder="you@cotcot.gov.ph"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="official-password" className="font-label-md text-label-md text-on-sky-dim font-semibold">
                Password
              </label>
              <div className="relative">
                <input
                  id="official-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-on-sky-dim hover:text-on-sky hover:bg-glass transition-all"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-2xl bg-danger-fill text-danger font-body-md text-body-md">
                <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading} className="pill-btn pill-btn-primary justify-center w-full disabled:opacity-60">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying credentials...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-glass-border text-center">
            <button
              onClick={() => setShowRequest((v) => !v)}
              className="font-label-md text-label-md text-accent-strong font-semibold hover:underline inline-flex items-center gap-1.5"
            >
              <Mail className="w-4 h-4" />
              Not an accredited official? Request access
            </button>
            {showRequest && (
              <form onSubmit={handleRequest} className="mt-4 flex flex-col gap-3 text-left" noValidate>
                <input className={inputClass} placeholder="Full name" value={request.name}
                  onChange={(e) => setRequest({ ...request, name: e.target.value })} />
                <input className={inputClass} placeholder="Position / Role (e.g. BDRRMO Response Team)" value={request.role}
                  onChange={(e) => setRequest({ ...request, role: e.target.value })} />
                <input className={inputClass} placeholder="Barangay / Purok" value={request.area}
                  onChange={(e) => setRequest({ ...request, area: e.target.value })} />
                <input className={inputClass} type="email" placeholder="Your contact email" value={request.contactEmail}
                  onChange={(e) => setRequest({ ...request, contactEmail: e.target.value })} />
                <textarea className={`${inputClass} min-h-24 resize-none`} placeholder="Why do you need Officials access?" value={request.reason}
                  onChange={(e) => setRequest({ ...request, reason: e.target.value })} />

                {requestError && (
                  <div className="p-3 rounded-2xl bg-danger-fill text-danger font-body-md text-body-md">{requestError}</div>
                )}
                {requestSent && (
                  <div className="p-3 rounded-2xl bg-safe-fill text-safe font-body-md text-body-md">
                    Email draft opened for {REQUEST_ACCESS_EMAIL}, addressed to the Liloan DRRMO. Send it to complete your request.
                  </div>
                )}

                <button type="submit" className="glass-btn w-full">
                  <Mail className="w-4 h-4" />
                  Open Email Request
                </button>
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-on-sky-faint font-label-sm mt-6">
          Authorized disaster-response personnel only - Liloan Municipal DRRMO
        </p>
      </main>
    </div>
  );
}