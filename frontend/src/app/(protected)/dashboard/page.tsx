"use client";

import "@/lib/chartjs";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { api } from "@/lib/api";

const Line = dynamic(() => import("react-chartjs-2").then((m) => m.Line), {
  ssr: false,
});
const Bar = dynamic(() => import("react-chartjs-2").then((m) => m.Bar), {
  ssr: false,
});
const Doughnut = dynamic(
  () => import("react-chartjs-2").then((m) => m.Doughnut),
  { ssr: false }
);

type OverviewResponse = {
  totals: { total: number; open: number; closed: number };
  stages: Record<string, number>;
  months: { labels: string[]; counts: number[] };
  suppliers: { label: string; value: number }[];
  recentOpen: any[];
};

function useThemeColors() {
  return useMemo(() => {
    if (typeof window === "undefined") {
      return {
        fg: "#0f172a",
        muted: "#64748b",
        grid: "#e2e8f0",
        chart: ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"],
      };
    }
    const s = getComputedStyle(document.documentElement);
    const hsl = (name: string) => {
      const v = s.getPropertyValue(name).trim();
      return v ? `hsl(${v})` : "";
    };
    const pick = (name: string, fb: string) => hsl(name) || fb;
    return {
      fg: pick("--foreground", "#0f172a"),
      muted: pick("--muted-foreground", "#64748b"),
      grid: pick("--border", "#e2e8f0"),
      chart: [
        pick("--chart-1", "#3b82f6"),
        pick("--chart-2", "#22c55e"),
        pick("--chart-3", "#f59e0b"),
        pick("--chart-4", "#ef4444"),
        pick("--chart-5", "#8b5cf6"),
      ],
    };
  }, []);
}

function withAlpha(hslColor: string, alpha = 0.15) {
  return hslColor.replace(
    /^hsl\((.*)\)$/,
    (_m, inner) => `hsla(${inner} / ${alpha})`
  );
}

/* ---------- Dashboard ---------- */

export default function DashboardPage() {
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const theme = useThemeColors();

  useEffect(() => {
    (async () => {
      try {
        const d = await api<OverviewResponse>("/api/analytics/overview");
        setData(d);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totals = data?.totals || { total: 0, open: 0, closed: 0 };
  const months = data?.months ?? { labels: [], counts: [] };

  // Derived KPIs
  const supplierCoverage = data?.suppliers?.length ?? 0;
  const momDelta = useMemo(() => {
    const arr = months.counts;
    if (!arr || arr.length < 2) return { pct: 0, up: false };
    const last = arr[arr.length - 1] || 0;
    const prev = arr[arr.length - 2] || 0;
    const pct =
      prev === 0 ? (last > 0 ? 100 : 0) : ((last - prev) / prev) * 100;
    return { pct, up: last >= prev };
  }, [months]);

  /* Charts */

  const lineData = useMemo(() => {
    const c = theme.chart[0];
    return {
      labels: months.labels,
      datasets: [
        {
          label: "Total NCRs",
          data: months.counts,
          borderColor: c,
          backgroundColor: withAlpha(c, 0.18),
          borderWidth: 2,
          pointRadius: 1.5,
          pointHoverRadius: 3,
          tension: 0.35,
          fill: true,
        },
      ],
    };
  }, [months, theme]);

  const lineOpts = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { intersect: false, mode: "index" as const },
      },
      scales: {
        x: {
          ticks: { color: theme.muted },
          grid: { color: withAlpha(theme.grid, 0.5) },
        },
        y: {
          beginAtZero: true,
          ticks: { color: theme.muted },
          grid: { color: withAlpha(theme.grid, 0.5) },
        },
      },
    }),
    [theme]
  );

  const stageData = useMemo(() => {
    const entries = Object.entries(data?.stages ?? {});
    const labels = entries.map(([k]) => k);
    const values = entries.map(([, v]) => v);
    const colors = labels.map((_, i) => theme.chart[i % theme.chart.length]);
    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: colors,
          borderColor: "#fff",
          borderWidth: 1,
        },
      ],
    };
  }, [data, theme]);

  const supplierBarData = useMemo(() => {
    const labels = (data?.suppliers ?? []).map((s) => s.label);
    const values = (data?.suppliers ?? []).map((s) => s.value);
    const colors = labels.map((_, i) => theme.chart[i % theme.chart.length]);
    return {
      labels,
      datasets: [
        {
          label: "NCRs",
          data: values,
          backgroundColor: colors,
          borderWidth: 0,
        },
      ],
    };
  }, [data, theme]);

  const barOpts = useMemo(
    () => ({
      indexAxis: "y" as const,
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { intersect: false, mode: "index" as const },
      },
      layout: { padding: { right: 6 } },
      scales: {
        x: {
          beginAtZero: true,
          ticks: { color: theme.muted },
          grid: { color: withAlpha(theme.grid, 0.5) },
        },
        y: { ticks: { color: theme.muted }, grid: { display: false } },
      },
    }),
    [theme]
  );

  return (
    <div className="space-y-4 2xl:space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Quality Dashboard</h1>
      </div>

      {/* KPI row (larger cards with tooltips) */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 2xl:gap-6">
        <CardStat
          title="Total NCRs"
          help="All NCRs in the system (any status)."
        >
          {loading ? "…" : totals.total}
        </CardStat>
        <CardStat title="Open" help="NCRs currently open (Status = Open).">
          {loading ? "…" : totals.open}
        </CardStat>
        <CardStat title="Closed" help="NCRs closed/verified (Status = Closed).">
          {loading ? "…" : totals.closed}
        </CardStat>
        <CardStat
          title="MoM Δ"
          help="Month-over-Month change in total NCRs: ((This month − Last month) / Last month) × 100."
        >
          {loading ? (
            "…"
          ) : (
            <span
              className={`inline-flex items-center gap-1 ${
                momDelta.up ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              <Arrow up={momDelta.up} />
              {Math.abs(momDelta.pct).toFixed(1)}%
            </span>
          )}
        </CardStat>
        <CardStat
          title="Top Suppliers Listed"
          help="Count of suppliers shown in the Top Suppliers chart (highest NCR counts)."
        >
          {loading ? "…" : supplierCoverage}
        </CardStat>
        <CardStat
          title="Open Rate"
          help="Open NCRs divided by total NCRs (Open ÷ Total)."
        >
          {loading
            ? "…"
            : `${
                totals.total
                  ? Math.round((totals.open / totals.total) * 100)
                  : 0
              }%`}
        </CardStat>
      </div>

      {/* Charts row (taller for desktop readability) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <ChartCard
          title="NCRs by Month (12 mo)"
          help="Total NCR volume per month (last 12 months)."
        >
          <div className="h-80 xl:h-72">
            <Line data={lineData} options={lineOpts} />
          </div>
        </ChartCard>

        <ChartCard
          title="Stage Mix"
          help="Proportion of NCRs at each stage (QUA/ENG/PUR/etc)."
        >
          <div className="h-80 xl:h-72">
            <Doughnut data={stageData} />
          </div>
        </ChartCard>

        <ChartCard
          title="Top Suppliers (by NCRs)"
          help="Suppliers with the most NCRs (descending)."
        >
          <div className="h-80 xl:h-72">
            <Bar data={supplierBarData} options={barOpts} />
          </div>
        </ChartCard>
      </div>

      <RecentOpen />
    </div>
  );
}

/* ---------- UI Bits (with tooltips) ---------- */

function CardStat({
  title,
  help,
  children,
}: {
  title: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border rounded px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>{title}</span>
        {help && (
          <span className="text-gray-400 cursor-help" title={help}>
            ⓘ
          </span>
        )}
      </div>
      <div className="text-2xl font-bold mt-1">{children}</div>
    </div>
  );
}

function ChartCard({
  title,
  help,
  children,
}: {
  title: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border rounded p-3 2xl:p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[13px] text-gray-700">{title}</div>
        {help && <HelpTooltip text={help} />}
      </div>
      {children}
    </div>
  );
}

function HelpTooltip({ text }: { text: string }) {
  return (
    <div className="relative group inline-flex">
      <button
        type="button"
        aria-label="Help"
        className="h-5 w-5 grid place-items-center rounded hover:bg-gray-100 text-gray-500"
        tabIndex={0}
      >
        <InfoIcon />
      </button>
      {/* Tooltip */}
      <div
        role="tooltip"
        className="pointer-events-none absolute right-0 top-full z-10 hidden w-64 whitespace-normal rounded border bg-white p-2 text-[12px] leading-snug text-gray-700 shadow group-hover:block group-focus-within:block"
      >
        {text}
      </div>
    </div>
  );
}

function InfoIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 15h-2v-6h2v6Zm0-8h-2V7h2v2Z" />
    </svg>
  );
}

function Arrow({ up }: { up: boolean }) {
  return up ? (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 5l7 7h-4v7h-6v-7H5z" />
    </svg>
  ) : (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 19l-7-7h4V5h6v7h4z" />
    </svg>
  );
}

/* ---------- Table ---------- */

function RecentOpen() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await api<{
          items?: any[];
          status?: string;
          totalRecords?: number;
        }>("/api/ncrForms?limit=1000");
        const list = Array.isArray(data) ? (data as any[]) : data.items || [];
        const sorted = list
          .filter((i) => Number(i.ncrStatusID) === 1)
          .sort(
            (a, b) =>
              new Date(b.ncrIssueDate ?? b.createdAt ?? 0).getTime() -
              new Date(a.ncrIssueDate ?? a.createdAt ?? 0).getTime()
          )
          .slice(0, 10);
        setRows(sorted);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="bg-white border rounded p-3 2xl:p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[13px] text-gray-700">Most Recent (Open)</div>
        <HelpTooltip text="The latest open NCRs by issue date." />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <Th>NCR No</Th>
              <Th>Issue Date</Th>
              <Th>Stage</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="p-2">
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-2">
                  No open items.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.ncrFormID} className="border-t hover:bg-gray-50">
                  <Td>{r.ncrFormNo ?? r.ncrFormID}</Td>
                  <Td>
                    {(r.ncrIssueDate ?? r.createdAt ?? "")
                      .toString()
                      .slice(0, 10)}
                  </Td>
                  <Td>{r.ncrStage}</Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="p-2 text-left font-medium">{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="p-2">{children}</td>;
}
