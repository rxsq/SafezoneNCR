"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const router = useRouter();
  const passwordRef = useRef<HTMLInputElement>(null);

  function validate(): string | null {
    if (!username.trim()) return "Please enter your username or email.";
    if (!password) return "Please enter your password.";
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validation = validate();
    if (validation) {
      setError(validation);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await login(username.trim(), password);
      router.replace("/dashboard");
    } catch (err: any) {
      setError(
        err?.message || "Sign-in failed. Check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const el = passwordRef.current;
    if (!el) return;
    const handle = (e: KeyboardEvent) =>
      setCapsLock(e.getModifierState?.("CapsLock") ?? false);
    el.addEventListener("keydown", handle);
    el.addEventListener("keyup", handle);
    return () => {
      el.removeEventListener("keydown", handle);
      el.removeEventListener("keyup", handle);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-6 text-center">
          <div
            className="mx-auto h-12 w-12 rounded-full bg-gray-900 flex items-center justify-center text-white text-lg font-bold"
            aria-hidden
          >
            S
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-gray-900">
            SafezoneNCR
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Sign in to access your dashboard
          </p>
        </div>

        {/* Card */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="p-6">
            {error && (
              <div
                role="alert"
                className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <form onSubmit={onSubmit} noValidate className="space-y-4">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-800"
                >
                  Username or Email
                </label>
                <input
                  id="username"
                  name="username"
                  inputMode="email"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="you@company.com"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-800"
                  >
                    Password
                  </label>
                  <a
                    href="/forgot-password"
                    className="text-xs text-gray-600 hover:underline"
                    onClick={(e) => {
                      if (loading) e.preventDefault();
                    }}
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="mt-1 relative">
                  <input
                    ref={passwordRef}
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 pr-10 text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-500 hover:text-gray-800 focus:outline-none"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {capsLock && (
                  <p className="mt-1 text-xs text-amber-700">
                    Caps Lock is on.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-gray-900 text-white px-3 py-2 text-sm font-medium hover:bg-black focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 disabled:opacity-60"
              >
                {loading && <Spinner />}
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 text-xs text-gray-500 flex items-center justify-between">
            <span>© {new Date().getFullYear()} SafezoneNCR</span>
            <div className="space-x-4">
              <a className="hover:underline" href="/legal/privacy">
                Privacy
              </a>
              <a className="hover:underline" href="/legal/terms">
                Terms
              </a>
              <a className="hover:underline" href="/support">
                Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** --- Small inline icons/components --- */
function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden>
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path
        className="opacity-75"
        d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
        fill="currentColor"
      />
    </svg>
  );
}
function EyeIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function EyeOffIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10.6 5.2A9.9 9.9 0 0 1 12 5c6.5 0 10 7 10 7a18.3 18.3 0 0 1-4.3 5.2M6.5 6.5A18 18 0 0 0 2 12s3.5 7 10 7c1.6 0 3-.3 4.3-.8"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
