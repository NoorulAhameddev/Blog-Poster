"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { postSchema } from "@/lib/validations";

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const originalSlug = params?.slug as string;

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [previewHtml, setPreviewHtml] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!originalSlug) return;

    fetch(`/api/posts/${originalSlug}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Post not found or unauthorized");
        }
        return res.json();
      })
      .then((data) => {
        if (data?.data) {
          setTitle(data.data.title);
          setSlug(data.data.slug);
          setContent(data.data.content);
          setStatus(data.data.status);
        }
      })
      .catch((err) => {
        setError(err.message || "Failed to load post");
      })
      .finally(() => setLoading(false));
  }, [originalSlug]);

  const handleTabSwitch = async (tab: "edit" | "preview") => {
    setActiveTab(tab);
    if (tab === "preview" && content) {
      const { parseAndSanitizeMarkdown } = await import("@/lib/markdown");
      const html = await parseAndSanitizeMarkdown(content);
      setPreviewHtml(html);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload = {
      title,
      slug: slug.trim() || originalSlug,
      content,
      status,
    };

    const validation = postSchema.safeParse(payload);
    if (!validation.success) {
      setError(validation.error.issues[0]?.message || "Invalid post input");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/posts/${originalSlug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error?.message || "Failed to update article.");
        return;
      }

      router.push(`/posts/${data.data.slug}`);
      router.refresh();
    } catch {
      setError("An unexpected network error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const res = await fetch(`/api/posts/${originalSlug}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        const data = await res.json().catch(() => null);
        setError(data?.error?.message || "Failed to delete post.");
      }
    } catch {
      setError("Failed to delete post.");
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center text-slate-400">
        Loading post details...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-white">Edit Article</h1>
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleDelete}
            className="text-xs text-red-400 hover:text-red-300 font-medium px-3 py-1.5 bg-red-950/50 border border-red-800 rounded-md"
          >
            Delete Article
          </button>
          <Link href={`/posts/${originalSlug}`} className="text-sm text-slate-400 hover:text-white">
            Cancel
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-950/60 border border-red-800 text-red-300 rounded-xl text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">
            Article Title *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={200}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-slate-300 mb-2">
              Slug *
            </label>
            <input
              id="slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-slate-300 mb-2">
              Publishing Status *
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as "draft" | "published")}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="draft">Draft (Visible only to you)</option>
              <option value="published">Published (Public)</option>
            </select>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between border-b border-slate-800 mb-3">
            <label htmlFor="content" className="block text-sm font-medium text-slate-300">
              Content (Markdown) *
            </label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => handleTabSwitch("edit")}
                className={`px-3 py-1 text-xs font-medium rounded-t-md transition-colors ${
                  activeTab === "edit"
                    ? "bg-slate-800 text-blue-400 border-t border-x border-slate-700"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Write
              </button>
              <button
                type="button"
                onClick={() => handleTabSwitch("preview")}
                className={`px-3 py-1 text-xs font-medium rounded-t-md transition-colors ${
                  activeTab === "preview"
                    ? "bg-slate-800 text-blue-400 border-t border-x border-slate-700"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Preview
              </button>
            </div>
          </div>

          {activeTab === "edit" ? (
            <textarea
              id="content"
              rows={14}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-4 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <div
              className="min-h-[22rem] p-4 bg-slate-900/60 border border-slate-800 rounded-lg prose max-w-none break-words"
              dangerouslySetInnerHTML={{ __html: previewHtml || "<p className='text-slate-500 italic'>Nothing to preview.</p>" }}
            />
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
          <Link
            href={`/posts/${originalSlug}`}
            className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting || !title || !content}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-lg disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {submitting ? "Saving Changes..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
