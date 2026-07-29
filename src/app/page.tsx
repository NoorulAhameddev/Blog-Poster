"use client";

import { useEffect, useState } from "react";
import PostCard from "@/components/PostCard";
import Pagination from "@/components/Pagination";

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: string;
  created_at: string;
  author: {
    id: string;
    display_name: string;
  };
  _count?: {
    comments: number;
  };
}

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts(page);
  }, [page]);

  const fetchPosts = async (currentPage: number) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/posts?page=${currentPage}&limit=10`);
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error?.message || "Failed to load posts.");
        return;
      }

      setPosts(data.data || []);
      setHasMore(data.hasMore || false);
      setTotal(data.total || 0);
    } catch {
      setError("Network error while loading posts.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-16 py-8 animate-hesitation">
      {/* Bespoke Hero Section */}
      <section className="relative text-left py-20 px-8 border border-white/5 bg-[#0b0c0d] rounded-sm overflow-hidden flex flex-col justify-center min-h-[400px]">
        {/* Subtle accent glow */}
        <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-gradient-to-bl from-[#9e8e7a]/5 to-transparent blur-[80px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-[#9e8e7a]/5 to-transparent blur-[80px] pointer-events-none rounded-full" />

        <div className="relative z-10 max-w-3xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="inline-flex items-center space-x-3 px-0 py-1 text-accent text-xs font-mono uppercase tracking-widest mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span>Premium Publishing Architecture</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-serif font-medium tracking-tight text-white leading-[1.1] mb-6">
            Architecting <br className="hidden md:block" />
            <span className="text-[#c4c2bd] italic">Secure Systems.</span>
          </h1>

          <p className="text-[#8a8883] text-lg sm:text-xl font-normal leading-relaxed max-w-xl">
            Deep technical writeups on modern Web API design, database integrity, microservice architectures, and robust security protocols.
          </p>
        </div>
      </section>

      {/* Main Articles Feed (Ledger Layout) */}
      <section className="space-y-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
        <div className="flex items-end justify-between pb-4 border-b border-white/10">
          <h2 className="text-3xl font-serif text-white tracking-tight">
            Latest Insights
          </h2>
          <span className="text-xs font-mono uppercase tracking-widest text-foreground-muted pb-1">
            {total} Article{total === 1 ? "" : "s"}
          </span>
        </div>

        {error && (
          <div className="p-5 bg-red-950/20 border-l-4 border-red-800 text-red-300 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col space-y-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-48 bg-[#151516] border border-white/5 rounded-sm animate-pulse"
              />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="p-16 text-center border border-white/5 rounded-sm bg-[#151516]/50">
            <p className="text-[#8a8883] text-base font-serif italic">No insights published yet.</p>
          </div>
        ) : (
          <div className="flex flex-col space-y-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        {!loading && posts.length > 0 && (
          <Pagination
            page={page}
            hasMore={hasMore}
            onPageChange={(newPage) => setPage(newPage)}
          />
        )}
      </section>
    </div>
  );
}
