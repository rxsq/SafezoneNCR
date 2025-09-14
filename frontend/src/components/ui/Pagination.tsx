"use client";

type PaginationProps = {
  page: number; // 1-based
  pageSize: number; // items per page
  total: number; // total records
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  sizes?: number[]; // page size options
  className?: string;
};

export default function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  sizes = [10, 25, 50],
  className = "",
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil((total || 0) / (pageSize || 1)));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className={`flex items-center justify-between text-sm ${className}`}>
      <div>
        Page {page} of {totalPages} — {total} total
      </div>
      <div className="flex items-center gap-2">
        {onPageSizeChange && (
          <select
            className="border rounded px-2 py-1"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            {sizes.map((s) => (
              <option key={s} value={s}>
                {s} / page
              </option>
            ))}
          </select>
        )}
        <button
          className="px-2 py-1 border rounded disabled:opacity-50"
          onClick={() => onPageChange(page - 1)}
          disabled={!canPrev}
        >
          Prev
        </button>
        <button
          className="px-2 py-1 border rounded disabled:opacity-50"
          onClick={() => onPageChange(page + 1)}
          disabled={!canNext}
        >
          Next
        </button>
      </div>
    </div>
  );
}
