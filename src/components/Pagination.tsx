interface PaginationProps {
  page: number;
  hasMore: boolean;
  onPageChange: (newPage: number) => void;
}

export default function Pagination({
  page,
  hasMore,
  onPageChange,
}: PaginationProps) {
  return (
    <nav
      className="flex items-center justify-between pt-6 border-t border-white/5"
      aria-label="Pagination Navigation"
    >
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="px-5 py-2 text-xs font-mono uppercase tracking-widest rounded-sm border border-white/5 bg-[#151516] text-[#c4c2bd] hover:bg-[#1a1a1c] hover:text-white hover:border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-accent"
      >
        ← Previous
      </button>

      <span className="text-sm font-serif italic text-foreground-muted">
        Page <span className="text-white not-italic font-medium">{page}</span>
      </span>

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={!hasMore}
        className="px-5 py-2 text-xs font-mono uppercase tracking-widest rounded-sm border border-white/5 bg-[#151516] text-[#c4c2bd] hover:bg-[#1a1a1c] hover:text-white hover:border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-accent"
      >
        Next →
      </button>
    </nav>
  );
}
