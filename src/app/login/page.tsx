"use client";

import { useState } from "react";
import Link from "next/link";
import { loginSchema } from "@/lib/validations";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      setError(validation.error.issues[0]?.message || "Invalid credentials input");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error?.message || "Login failed.");
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
    <div className="max-w-md mx-auto py-20 space-y-8 animate-fade-in-up">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-serif font-medium text-white">Welcome Back</h1>
        <p className="text-[#8a8883] text-lg font-serif italic">
          Sign in to manage your engineering articles.
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
            autoComplete="current-password"
            className="w-full bg-[#0d0d0e] border border-white/10 rounded-sm p-3.5 text-sm text-white placeholder-[#8a8883] focus:outline-none focus:ring-2 focus:ring-accent transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={submitting || !email || !password}
          className="w-full py-3.5 bg-accent hover:bg-[#857766] text-[#0d0d0e] font-medium text-sm tracking-wide rounded-sm disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-accent shadow-md mt-2"
        >
          {submitting ? "Signing in..." : "Sign In"}
        </button>

        <p className="text-center text-sm text-[#8a8883] pt-4">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-accent font-medium hover:text-[#c4b6a5] transition-colors">
            Register here
          </Link>
        </p>
      </form>
    </div>
  );
}
