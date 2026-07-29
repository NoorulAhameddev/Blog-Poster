"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  display_name: string;
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.data) {
          setUser(data.data);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/login");
      router.refresh();
    } catch {
      // Error handling
    }
  };

  const initial = user?.display_name ? user.display_name.charAt(0).toUpperCase() : "?";

  return (
    <header className="sticky top-0 z-50 bg-[#0d0d0e]/80 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/30">
      <nav
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between animate-fade-in-up"
        aria-label="Main Navigation"
      >
        <div className="flex items-center space-x-8">
          <Link
            href="/"
            className="flex items-center space-x-3 font-serif font-medium text-xl text-white tracking-tight focus:outline-none focus:ring-2 focus:ring-accent rounded-md"
          >
            <div className="w-8 h-8 rounded-sm bg-gradient-to-tr from-stone-600 to-stone-400 flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-black/20">
              E
            </div>
            <span className="text-white">
              Engineering<span className="text-accent italic">Blog</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-2">
            <Link
              href="/"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                pathname === "/"
                  ? "text-accent border-b-2 border-accent"
                  : "text-[#c4c2bd] hover:text-white"
              }`}
            >
              Feed
            </Link>

            {user && (
              <>
                <Link
                  href="/dashboard"
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    pathname === "/dashboard"
                      ? "text-accent border-b-2 border-accent"
                      : "text-[#c4c2bd] hover:text-white"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/posts/new"
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    pathname === "/posts/new"
                      ? "text-accent border-b-2 border-accent"
                      : "text-[#c4c2bd] hover:text-white"
                  }`}
                >
                  New Post
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-md">
                    <span className="text-sm text-[#c4c2bd] font-medium hidden sm:inline px-1">
                      {user.display_name}
                    </span>
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-stone-600 to-stone-400 flex items-center justify-center text-xs font-bold text-white">
                      {initial}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    type="button"
                    className="px-4 py-1.5 text-sm font-medium text-[#c4c2bd] hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/login"
                    className="px-4 py-1.5 text-sm font-medium text-[#c4c2bd] hover:text-white transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    className="px-5 py-2 text-sm font-medium text-[#0d0d0e] bg-accent hover:bg-[#857766] rounded-sm transition-all transform active:scale-95"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
