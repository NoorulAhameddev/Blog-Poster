"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import CommentList from "@/components/CommentList";
import CommentForm from "@/components/CommentForm";
import Pagination from "@/components/Pagination";

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: string;
  created_at: string;
  updated_at: string;
  author_id: string;
  author: {
    id: string;
    display_name: string;
  };
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  author: {
    id: string;
    display_name: string;
  };
}

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [post, setPost] = useState<Post | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentPage, setCommentPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(true);

  // Sanitized HTML content
  const [renderedHtml, setRenderedHtml] = useState<string>("");

  useEffect(() => {
    // Check current user
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setCurrentUser(data?.data || null))
      .catch(() => setCurrentUser(null));
  }, []);

  const fetchPost = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    setError(null);

    try {
      const res = await fetch(`/api/posts/${slug}`);
      const data = await res.json().catch(() => null);

      if (res.status === 404) {
        setNotFound(true);
        return;
      }

      if (!res.ok) {
        setError(data?.error?.message || "Failed to load post.");
        return;
      }

      setPost(data.data);

      // Dynamically sanitize markdown to HTML
      if (data.data?.content) {
        const { parseAndSanitizeMarkdown } = await import("@/lib/markdown");
        const html = await parseAndSanitizeMarkdown(data.data.content);
        setRenderedHtml(html);
      }
    } catch {
      setError("Network error while loading post.");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  const fetchComments = useCallback(async (page: number) => {
    if (!slug) return;
    setCommentsLoading(true);
    try {
      const res = await fetch(`/api/posts/${slug}/comments?page=${page}&limit=10`);
      const data = await res.json().catch(() => null);
      if (res.ok && data?.data) {
        setComments(data.data);
        setHasMoreComments(data.hasMore || false);
      }
    } catch {
      // Error fetching comments
    } finally {
      setCommentsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    fetchPost();
    fetchComments(1);
  }, [slug, fetchPost, fetchComments]);

  useEffect(() => {
    if (commentPage > 1) {
      fetchComments(commentPage);
    }
  }, [commentPage, fetchComments]);

  const handleDeletePost = async () => {
    if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`/api/posts/${slug}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        const data = await res.json().catch(() => null);
        alert(data?.error?.message || "Failed to delete post.");
      }
    } catch {
      alert("Network error deleting post.");
    }
  };

  const handleCommentAdded = (newComment: Comment) => {
    setComments((prev) => [newComment, ...prev]);
  };

  const handleCommentDeleted = (deletedId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== deletedId));
  };

  if (notFound) {
    return (
      <div className="py-32 text-center space-y-6">
        <h1 className="text-5xl font-serif font-medium text-white">Not Found</h1>
        <p className="text-[#8a8883] italic font-serif">
          The requested article does not exist or you do not have permission to view it.
        </p>
        <Link
          href="/"
          className="inline-block mt-4 px-6 py-2.5 border border-white/10 hover:border-accent text-[#c4c2bd] hover:text-white font-mono uppercase tracking-widest text-xs rounded-sm transition-all"
        >
          Return Home
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-pulse py-16">
        <div className="h-12 bg-[#151516] border border-white/5 rounded-sm w-3/4" />
        <div className="h-4 bg-[#151516] border border-white/5 rounded-sm w-1/4" />
        <div className="h-96 bg-[#151516] border border-white/5 rounded-sm mt-12" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="p-4 bg-red-950/20 border-l-4 border-red-800 text-red-300 text-sm max-w-3xl mx-auto mt-12">
        {error || "An error occurred."}
      </div>
    );
  }

  const isOwner = currentUser?.id === post.author_id;
  const formattedDate = new Date(post.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="max-w-[700px] mx-auto space-y-12 py-12 animate-hesitation">
      {/* Header */}
      <header className="space-y-8 text-center pb-12 border-b border-white/10">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-3 text-xs font-mono uppercase tracking-widest text-foreground-muted">
            {post.status === "draft" && (
              <span className="font-bold text-orange-400 border border-orange-500/30 bg-orange-950/30 px-2 py-0.5 rounded-sm">
                DRAFT
              </span>
            )}
            <time dateTime={post.created_at}>{formattedDate}</time>
          </div>

          <h1 className="text-4xl md:text-5xl font-serif font-medium text-white leading-[1.15]">
            {post.title}
          </h1>

          <div className="flex items-center space-x-2 text-sm text-[#8a8883] italic font-serif">
            <span>Written by</span>
            <span className="font-medium text-[#c4c2bd] not-italic">{post.author.display_name}</span>
          </div>
        </div>

        {isOwner && (
          <div className="flex items-center justify-center space-x-4 pt-4">
            <Link
              href={`/posts/${post.slug}/edit`}
              className="px-4 py-2 text-[11px] font-mono uppercase tracking-widest text-white border border-white/10 hover:border-accent rounded-sm transition-colors"
            >
              Edit Post
            </Link>
            <button
              type="button"
              onClick={handleDeletePost}
              className="px-4 py-2 text-[11px] font-mono uppercase tracking-widest text-red-400 border border-red-900/50 hover:bg-red-950/30 rounded-sm transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </header>

      {/* Article Body */}
      <section className="py-4">
        <div
          className="prose max-w-none break-words"
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />
      </section>

      {/* Comments Section */}
      <section className="pt-16 border-t border-white/10 space-y-10">
        <h2 className="text-2xl font-serif font-medium text-white">Discussion</h2>

        <CommentForm
          postSlug={post.slug}
          isLoggedIn={!!currentUser}
          onCommentAdded={handleCommentAdded}
        />

        {commentsLoading ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-24 bg-[#151516] border border-white/5 rounded-sm" />
            <div className="h-24 bg-[#151516] border border-white/5 rounded-sm" />
          </div>
        ) : (
          <CommentList
            comments={comments}
            currentUserId={currentUser?.id}
            postAuthorId={post.author_id}
            onCommentDeleted={handleCommentDeleted}
          />
        )}

        {comments.length > 0 && (
          <Pagination
            page={commentPage}
            hasMore={hasMoreComments}
            onPageChange={(newPage) => setCommentPage(newPage)}
          />
        )}
      </section>
    </article>
  );
}
