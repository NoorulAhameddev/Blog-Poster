"use client";

import { useState } from "react";
import Link from "next/link";
import { commentSchema } from "@/lib/validations";

interface CommentFormProps {
  postSlug: string;
  isLoggedIn: boolean;
  onCommentAdded: (newComment: any) => void;
}

export default function CommentForm({
  postSlug,
  isLoggedIn,
  onCommentAdded,
}: CommentFormProps) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isLoggedIn) {
    return (
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-center">
        <p className="text-sm text-slate-400">
          Want to join the conversation?{" "}
          <Link href="/login" className="text-blue-400 underline hover:text-blue-300">
            Log in
          </Link>{" "}
          or{" "}
          <Link href="/register" className="text-blue-400 underline hover:text-blue-300">
            Register
          </Link>{" "}
          to leave a comment.
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = commentSchema.safeParse({ content });
    if (!validation.success) {
      setError(validation.error.issues[0]?.message || "Invalid comment");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/posts/${postSlug}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error?.message || "Failed to post comment");
        return;
      }

      setContent("");
      onCommentAdded(data.data);
    } catch {
      setError("An unexpected network error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
      <h3 className="text-base font-semibold text-white">Add a Comment</h3>

      {error && (
        <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 text-sm rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="comment-text" className="sr-only">
          Comment content
        </label>
        <textarea
          id="comment-text"
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your thoughts on this article..."
          maxLength={2000}
          required
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-slate-500">{content.length}/2000 characters</span>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting || !content.trim()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {submitting ? "Posting..." : "Post Comment"}
        </button>
      </div>
    </form>
  );
}
