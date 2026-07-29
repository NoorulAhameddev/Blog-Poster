"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { postSchema } from "@/lib/validations";

export default function NewPostPage() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [previewHtml, setPreviewHtml] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) {
          window.location.href = "/login";
        }
      })
      .catch(() => {
        window.location.href = "/login";
      })
      .finally(() => setCheckingAuth(false));
  }, []);

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
      slug: slug.trim() || undefined,
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
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error?.message || "Failed to create article.");
        return;
      }

      window.location.href = `/posts/${data.data.slug}`;
    } catch {
      setError("An unexpected network error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="py-20 text-center text-slate-400">
        Authenticating session...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-white">Create New Article</h1>
        <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white">
          Cancel
        </Link>
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
            placeholder="e.g. Building High Throughput Microservices in Rust"
            required
            maxLength={200}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-slate-300 mb-2">
              Custom Slug (Optional)
            </label>
            <input
              id="slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. building-high-throughput-microservices"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        {/* Content Tabs (Edit / Preview) */}
        <div>
          <div className="flex items-center justify-between border-b border-slate-800 mb-3">
            <label htmlFor="content" className="block text-sm font-medium text-slate-300">
              Content (Markdown Supported) *
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
              placeholder="Write your article in Markdown format..."
              required
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-4 text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            href="/dashboard"
            className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting || !title || !content}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-lg disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {submitting ? "Saving..." : status === "published" ? "Publish Article" : "Save Draft"}
          </button>
        </div>
      </form>
    </div>
  );
}
