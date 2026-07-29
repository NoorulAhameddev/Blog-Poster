"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import PostCard from "@/components/PostCard";
import Pagination from "@/components/Pagination";

interface User {
  id: string;
  email: string;
  display_name: string;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: "draft" | "published";
  created_at: string;
  author: {
    id: string;
    display_name: string;
  };
  _count?: {
    comments: number;
  };
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [filterStatus, setFilterStatus] = useState<"all" | "draft" | "published">("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMyPosts = useCallback(async (currentPage: number) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/posts?mine=true&page=${currentPage}&limit=10`);
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error?.message || "Failed to load articles.");
        return;
      }

      setPosts(data.data || []);
      setHasMore(data.hasMore || false);
      setTotal(data.total || 0);
    } catch {
      setError("Network error while loading your articles.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) {
          window.location.href = "/login";
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.data) {
          setUser(data.data);
          fetchMyPosts(1);
        }
      })
      .catch(() => {
        window.location.href = "/login";
      });
  }, [fetchMyPosts]);

  useEffect(() => {
    if (user) {
      fetchMyPosts(page);
    }
  }, [page, user, fetchMyPosts]);

  const filteredPosts = posts.filter((post) => {
    if (filterStatus === "all") return true;
    return post.status === filterStatus;
  });

  const draftsCount = posts.filter((p) => p.status === "draft").length;
  const publishedCount = posts.filter((p) => p.status === "published").length;

  if (!user && loading) {
    return (
      <div className="py-20 text-center text-[#8a8883] animate-hesitation font-serif italic">
        Loading workspace...
      </div>
    );
  }

  return (
    <div className="space-y-12 py-8 animate-fade-in-up">
      {/* User Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-8 bg-[#151516] border border-white/5 rounded-sm">
        <div className="space-y-2">
          <h1 className="text-3xl font-serif font-medium text-white">
            Workspace
          </h1>
          <p className="text-sm text-[#8a8883] font-mono tracking-wide">
            Author: <span className="font-semibold text-white">{user?.display_name}</span> ({user?.email})
          </p>
        </div>

        <Link
          href="/posts/new"
          className="inline-flex items-center justify-center px-5 py-2.5 bg-accent hover:bg-[#857766] text-[#0d0d0e] text-sm font-medium tracking-wide rounded-sm transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-accent"
        >
          New Draft
        </Link>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 bg-[#151516]/50 border border-white/5 rounded-sm">
          <span className="text-[11px] text-[#8a8883] uppercase font-mono tracking-widest">Total Articles</span>
          <p className="text-3xl font-serif text-white mt-2">{total}</p>
        </div>
        <div className="p-6 bg-[#151516]/50 border border-white/5 rounded-sm">
          <span className="text-[11px] text-[#8a8883] uppercase font-mono tracking-widest">Published</span>
          <p className="text-3xl font-serif text-white mt-2">{publishedCount}</p>
        </div>
        <div className="p-6 bg-[#151516]/50 border border-white/5 rounded-sm">
          <span className="text-[11px] text-[#8a8883] uppercase font-mono tracking-widest">Drafts</span>
          <p className="text-3xl font-serif text-[#c4c2bd] mt-2">{draftsCount}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="space-y-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setFilterStatus("all")}
              className={`px-1 pb-2 text-sm font-medium transition-colors border-b-2 ${
                filterStatus === "all"
                  ? "border-accent text-accent"
                  : "border-transparent text-[#8a8883] hover:text-white"
              }`}
            >
              All ({posts.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("published")}
              className={`px-1 pb-2 text-sm font-medium transition-colors border-b-2 ${
                filterStatus === "published"
                  ? "border-accent text-accent"
                  : "border-transparent text-[#8a8883] hover:text-white"
              }`}
            >
              Published ({publishedCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("draft")}
              className={`px-1 pb-2 text-sm font-medium transition-colors border-b-2 ${
                filterStatus === "draft"
                  ? "border-accent text-accent"
                  : "border-transparent text-[#8a8883] hover:text-white"
              }`}
            >
              Drafts ({draftsCount})
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-950/20 border-l-4 border-red-800 text-red-300 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col space-y-6">
            {[1, 2].map((n) => (
              <div key={n} className="h-48 bg-[#151516] border border-white/5 rounded-sm animate-pulse" />
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="p-16 text-center border border-white/5 rounded-sm bg-[#151516]/50">
            <p className="text-[#8a8883] text-base font-serif italic mb-6">No articles found in this view.</p>
            <Link
              href="/posts/new"
              className="inline-block px-5 py-2.5 border border-accent text-accent hover:bg-accent/10 text-sm font-medium rounded-sm transition-all"
            >
              Start Writing
            </Link>
          </div>
        ) : (
          <div className="flex flex-col space-y-6">
            {filteredPosts.map((post) => (
              <div key={post.id} className="relative group">
                <PostCard post={post} showStatus={true} />
                <div className="absolute top-6 right-6 flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link
                    href={`/posts/${post.slug}/edit`}
                    className="text-xs font-mono uppercase tracking-widest text-[#0d0d0e] hover:bg-[#857766] px-4 py-1.5 bg-accent rounded-sm shadow-sm transition-colors"
                  >
                    Edit
                  </Link>
                </div>
              </div>
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
      </div>
    </div>
  );
}
