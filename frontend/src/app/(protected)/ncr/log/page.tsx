"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/api";

type NCR = {
  ncrFormID: number;
  ncrFormNo?: string;
  ncrIssueDate?: string; // ISO
  ncrStage?: string;
  ncrStatusID: number; // 1=open, else closed
  prodID: number;
};

type PageData = {
  status: string;
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  items: NCR[];
};

export default function NcrLogPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(false);

  // keep last successful data to avoid table jumping between pages while loading
  const lastDataRef = useRef<PageData | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchPage = async () => {
      setLoading(true);
      try {
        const d = await api<PageData>(
          `/api/ncrForms?page=${page}&limit=${limit}`,
          { signal: controller.signal as any }
        );
        if (!controller.signal.aborted) {
          setData(d);
          lastDataRef.current = d;
        }
      } catch {
        /* noop */
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    fetchPage();
    return () => controller.abort();
  }, [page, limit]);

  const view = data ?? lastDataRef.current;

  const rangeLabel = useMemo(() => {
    if (!view) return "";
    const start = (view.currentPage - 1) * limit + 1;
    const end = Math.min(start + limit - 1, view.totalRecords);
    return `${start}-${end} of ${view.totalRecords}`;
  }, [view, limit]);

  const toLocalDate = (iso?: string) =>
    iso
      ? new Date(iso).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "2-digit",
        })
      : "";

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">NCR Log</h1>

        {/* Controls row (compact) */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600">Rows</label>
          <select
            className="h-8 rounded border px-2 text-sm"
            value={limit}
            onChange={(e) => {
              setPage(1);
              setLimit(Number(e.target.value));
            }}
          >
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table card */}
      <div className="overflow-hidden rounded-md border bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 sticky top-0">
              <tr className="text-left">
                <Th>NCR No</Th>
                <Th className="w-40">Issue Date</Th>
                <Th className="w-40">Stage</Th>
                <Th className="w-28">Status</Th>
              </tr>
            </thead>
            <tbody>
              {loading && !view ? (
                // Initial skeleton while nothing is loaded yet
                Array.from({ length: limit }).map((_, i) => (
                  <tr key={i} className="border-t">
                    <Td>
                      <Skeleton />
                    </Td>
                    <Td>
                      <Skeleton />
                    </Td>
                    <Td>
                      <Skeleton />
                    </Td>
                    <Td>
                      <Skeleton className="h-5 w-16" />
                    </Td>
                  </tr>
                ))
              ) : view?.items?.length ? (
                view.items.map((i) => {
                  const open = i.ncrStatusID === 1;
                  return (
                    <tr
                      key={i.ncrFormID}
                      className="border-t hover:bg-gray-50/60"
                    >
                      <Td className="whitespace-nowrap">
                        {i.ncrFormNo ?? i.ncrFormID}
                      </Td>
                      <Td className="whitespace-nowrap">
                        {toLocalDate(i.ncrIssueDate)}
                      </Td>
                      <Td className="truncate max-w-[18rem]">
                        {i.ncrStage || "-"}
                      </Td>
                      <Td>
                        <span
                          className={
                            "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium " +
                            (open
                              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                              : "bg-gray-100 text-gray-700 ring-1 ring-gray-200")
                          }
                        >
                          {open ? "Open" : "Closed"}
                        </span>
                      </Td>
                    </tr>
                  );
                })
              ) : (
                <tr className="border-t">
                  <td
                    className="p-3 text-center text-sm text-gray-500"
                    colSpan={4}
                  >
                    No NCRs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer w/ pager */}
        <div className="flex items-center justify-between gap-3 border-t px-3 py-2">
          <div className="text-xs text-gray-600">
            {view ? rangeLabel : "\u00A0"}
          </div>
          <Pager
            page={view?.currentPage || 1}
            totalPages={view?.totalPages || 1}
            disabled={loading}
            onChange={(p) => setPage(p)}
          />
        </div>
      </div>
    </div>
  );
}

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th className={`p-2 text-[13px] font-medium ${className}`}>{children}</th>
  );
}

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`p-2 align-middle ${className}`}>{children}</td>;
}

function Skeleton({ className = "h-4 w-24" }) {
  return <div className={`animate-pulse rounded bg-gray-100 ${className}`} />;
}

/** Compact pager similar to employee page: first/prev/next/last + jump */
function Pager({
  page,
  totalPages,
  onChange,
  disabled,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
  disabled?: boolean;
}) {
  const [gotoVal, setGotoVal] = useState(page.toString());

  useEffect(() => {
    setGotoVal(page.toString());
  }, [page]);

  const clamp = (n: number) => Math.max(1, Math.min(totalPages, n));

  return (
    <div className="flex items-center gap-1.5">
      <Btn
        onClick={() => onChange(1)}
        disabled={disabled || page <= 1}
        ariaLabel="First page"
      >
        «
      </Btn>
      <Btn
        onClick={() => onChange(page - 1)}
        disabled={disabled || page <= 1}
        ariaLabel="Previous page"
      >
        ‹
      </Btn>

      <div className="flex items-center gap-1 text-sm">
        <span className="text-xs text-gray-600">Page</span>
        <input
          className="h-8 w-14 rounded border px-2 text-sm"
          value={gotoVal}
          onChange={(e) => setGotoVal(e.target.value.replace(/\D/g, ""))}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const n = Number(gotoVal || "1");
              if (n) onChange(clamp(n));
            }
          }}
          disabled={disabled}
          inputMode="numeric"
        />
        <span className="text-xs text-gray-600">/ {totalPages}</span>
      </div>

      <Btn
        onClick={() => onChange(page + 1)}
        disabled={disabled || page >= totalPages}
        ariaLabel="Next page"
      >
        ›
      </Btn>
      <Btn
        onClick={() => onChange(totalPages)}
        disabled={disabled || page >= totalPages}
        ariaLabel="Last page"
      >
        »
      </Btn>
    </div>
  );
}

function Btn({
  children,
  onClick,
  disabled,
  ariaLabel,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
      className="h-8 min-w-8 rounded border px-2 text-sm disabled:opacity-50 hover:bg-gray-50"
    >
      {children}
    </button>
  );
}
