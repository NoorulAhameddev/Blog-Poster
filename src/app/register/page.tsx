"use client";

import { useState } from "react";
import Link from "next/link";
import { registerSchema } from "@/lib/validations";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload = {
      email,
      display_name: displayName,
      password,
    };

    const validation = registerSchema.safeParse(payload);
    if (!validation.success) {
      setError(validation.error.issues[0]?.message || "Invalid registration input");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error?.message || "Registration failed.");
        return;
      }

      window.location.href = "/dashboard";
    } catch {
      setError("An unexpected network error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-16 space-y-8 animate-fade-in-up">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-serif font-medium text-white">Create Account</h1>
        <p className="text-[#8a8883] text-lg font-serif italic">
          Join the engineering platform to author and publish technical articles.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-950/20 border-l-4 border-red-800 text-red-300 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[#151516] border border-white/5 p-8 rounded-sm space-y-6 shadow-xl">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[#c4c2bd] mb-2">
            Email Address *
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="developer@example.com"
            required
            autoComplete="email"
            className="w-full bg-[#0d0d0e] border border-white/10 rounded-sm p-3.5 text-sm text-white placeholder-[#8a8883] focus:outline-none focus:ring-2 focus:ring-accent transition-all"
          />
        </div>

        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-[#c4c2bd] mb-2">
            Display Name *
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Jane Doe"
            required
            autoComplete="name"
            maxLength={50}
            className="w-full bg-[#0d0d0e] border border-white/10 rounded-sm p-3.5 text-sm text-white placeholder-[#8a8883] focus:outline-none focus:ring-2 focus:ring-accent transition-all"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[#c4c2bd] mb-2">
            Password *
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="new-password"
            className="w-full bg-[#0d0d0e] border border-white/10 rounded-sm p-3.5 text-sm text-white placeholder-[#8a8883] focus:outline-none focus:ring-2 focus:ring-accent transition-all"
          />
          <p className="text-[11px] uppercase tracking-wide font-mono text-[#8a8883] mt-2">
            Min 8 chars, 1 letter, 1 number.
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting || !email || !displayName || !password}
          className="w-full py-3.5 bg-accent hover:bg-[#857766] text-[#0d0d0e] font-medium text-sm tracking-wide rounded-sm disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-accent shadow-md mt-2"
        >
          {submitting ? "Creating account..." : "Register Account"}
        </button>

        <p className="text-center text-sm text-[#8a8883] pt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-accent font-medium hover:text-[#c4b6a5] transition-colors">
            Log in here
          </Link>
        </p>
      </form>
    </div>
  );
}
