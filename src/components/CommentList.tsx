"use client";

import { useState } from "react";

interface Comment {
  id: string;
  content: string;
  created_at: string | Date;
  author: {
    id: string;
    display_name: string;
  };
}

interface CommentListProps {
  comments: Comment[];
  currentUserId?: string;
  postAuthorId: string;
  onCommentDeleted: (deletedId: string) => void;
}

export default function CommentList({
  comments,
  currentUserId,
  postAuthorId,
  onCommentDeleted,
}: CommentListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    setDeletingId(commentId);
    setError(null);

    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error?.message || "Failed to delete comment");
        return;
      }

      onCommentDeleted(commentId);
    } catch {
      setError("An unexpected network error occurred.");
    } finally {
      setDeletingId(null);
    }
  };

  if (comments.length === 0) {
    return (
      <p className="text-slate-500 text-sm py-4 italic">
        No comments yet. Be the first to share your thoughts!
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 text-sm rounded-lg">
          {error}
        </div>
      )}

      {comments.map((comment) => {
        const canDelete =
          currentUserId &&
          (currentUserId === comment.author.id || currentUserId === postAuthorId);

        const formattedDate = new Date(comment.created_at).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        return (
          <div
            key={comment.id}
            className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-sm text-slate-200">
                  {comment.author.display_name}
                </span>
                {comment.author.id === postAuthorId && (
                  <span className="text-[10px] bg-blue-950 border border-blue-800 text-blue-400 px-2 py-0.5 rounded-full font-medium">
                    Author
                  </span>
                )}
                <span className="text-xs text-slate-500">• {formattedDate}</span>
              </div>

              {canDelete && (
                <button
                  type="button"
                  onClick={() => handleDelete(comment.id)}
                  disabled={deletingId === comment.id}
                  className="text-xs text-red-400 hover:text-red-300 focus:outline-none focus:underline disabled:opacity-50"
                >
                  {deletingId === comment.id ? "Deleting..." : "Delete"}
                </button>
              )}
            </div>

            <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
              {comment.content}
            </p>
          </div>
        );
      })}
    </div>
  );
}
