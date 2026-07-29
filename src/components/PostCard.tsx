import Link from "next/link";

interface PostCardProps {
  post: {
    id: string;
    title: string;
    slug: string;
    content: string;
    status: string;
    created_at: string | Date;
    author: {
      id: string;
      display_name: string;
    };
    _count?: {
      comments: number;
    };
  };
  showStatus?: boolean;
}

export default function PostCard({ post, showStatus = false }: PostCardProps) {
  const formattedDate = new Date(post.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // Calculate estimated reading time
  const wordCount = post.content.trim().split(/\s+/).filter(Boolean).length;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  // Extract clean text snippet
  const snippet =
    post.content.replace(/[#*`_~\[\]()>-]/g, "").slice(0, 150) +
    (post.content.length > 150 ? "..." : "");

  // Generate initial badge
  const initial = post.author.display_name.charAt(0).toUpperCase();

  return (
    <article className="glass-panel glass-panel-hover rounded-md p-6 flex flex-col justify-between group animate-fade-in-up">
      <div>
        {/* Top Header metadata */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-sm bg-gradient-to-tr from-stone-600 to-stone-400 flex items-center justify-center text-xs font-bold text-white shadow-sm">
              {initial}
            </div>
            <span className="text-sm font-medium text-foreground">
              {post.author.display_name}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs text-foreground-muted font-mono tracking-wide uppercase">
              {readTimeMinutes} min read
            </span>
            {showStatus && (
              <span
                className={`text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-sm border ${
                  post.status === "published"
                    ? "bg-stone-900 border-stone-700 text-stone-300"
                    : "bg-orange-950/40 border-orange-500/30 text-orange-400"
                }`}
              >
                {post.status}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-serif font-medium text-white mb-3 group-hover:text-accent transition-colors leading-snug">
          <Link
            href={`/posts/${post.slug}`}
            className="focus:outline-none focus:ring-2 focus:ring-accent rounded-sm"
          >
            {post.title}
          </Link>
        </h2>

        {/* Snippet */}
        <p className="text-[#c4c2bd] text-[1.05rem] leading-relaxed mb-8 line-clamp-3">
          {snippet}
        </p>
      </div>

      {/* Footer bar */}
      <div className="flex items-center justify-between pt-5 border-t border-white/5 text-xs text-foreground-muted">
        <time dateTime={new Date(post.created_at).toISOString()} className="font-mono uppercase tracking-wide">
          {formattedDate}
        </time>

        <div className="flex items-center space-x-5">
          {typeof post._count?.comments === "number" && (
            <span className="flex items-center space-x-2 text-foreground-muted">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <span className="font-medium text-sm">{post._count.comments}</span>
            </span>
          )}
          <Link
            href={`/posts/${post.slug}`}
            className="inline-flex items-center space-x-2 font-medium text-accent hover:text-[#c4b6a5] transition-colors focus:outline-none uppercase tracking-wider text-[11px]"
          >
            <span>Read Article</span>
            <span className="transform group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
