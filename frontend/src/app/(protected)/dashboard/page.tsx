"use client";

import "@/lib/chartjs";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { api } from "@/lib/api";

// Lazy-load chart components client-side
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

/** Pull theme colors from CSS vars (shadcn/ui compatible), with fallbacks */
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

/** Make a translucent version of an HSL color string: hsl(...) -> hsla(... / a) */
function withAlpha(hslColor: string, alpha = 0.15) {
  // Accepts either hsl(h s l) or hsl(h, s, l)
  return hslColor.replace(
    /^hsl\((.*)\)$/,
    (_m, inner) => `hsla(${inner} / ${alpha})`
  );
}

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

  // Line: NCRs by month (last 12) – single dataset from API
  const lineData = useMemo(() => {
    const labels = data?.months?.labels ?? [];
    const totals = data?.months?.counts ?? [];
    const c = theme.chart[0];
    return {
      labels,
      datasets: [
        {
          label: "Total",
          data: totals,
          borderColor: c,
          backgroundColor: withAlpha(c, 0.18),
          borderWidth: 2,
          pointRadius: 2,
          pointHoverRadius: 4,
          tension: 0.35,
          fill: true,
        },
      ],
    };
  }, [data, theme]);

  const lineOpts = useMemo(
    () => ({
      responsive: true,
      plugins: {
        legend: { position: "top" as const, labels: { color: theme.fg } },
        tooltip: { intersect: false, mode: "index" as const },
      },
      scales: {
        x: {
          ticks: { color: theme.muted },
          grid: { color: withAlpha(theme.grid, 0.6) },
        },
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1, color: theme.muted },
          grid: { color: withAlpha(theme.grid, 0.6) },
        },
      },
    }),
    [theme]
  );

  // Doughnut: Stage distribution
  const stageData = useMemo(() => {
    const entries = Object.entries(data?.stages ?? {});
    const labels = entries.map(([k]) => k);
    const values = entries.map(([, v]) => v);
    const colors = labels.map((_, i) => theme.chart[i % theme.chart.length]);
    return { labels, datasets: [{ data: values, backgroundColor: colors }] };
  }, [data, theme]);

  // Bar: Top suppliers
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
          borderWidth: 1,
        },
      ],
    };
  }, [data, theme]);

  const barOpts = useMemo(
    () => ({
      responsive: true,
      plugins: {
        legend: { display: false, labels: { color: theme.fg } },
        tooltip: { intersect: false, mode: "index" as const },
      },
      scales: {
        x: {
          ticks: { maxRotation: 45, minRotation: 45, color: theme.muted },
          grid: { color: withAlpha(theme.grid, 0.6) },
        },
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1, color: theme.muted },
          grid: { color: withAlpha(theme.grid, 0.6) },
        },
      },
    }),
    [theme]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Dashboard</h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <CardStat title="Total" value="…" />
          <CardStat title="Open" value="…" />
          <CardStat title="Closed" value="…" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <CardStat title="Total" value={totals.total} />
            <CardStat title="Open" value={totals.open} />
            <CardStat title="Closed" value={totals.closed} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <ChartCard title="NCRs by Month (Last 12)">
              <Line data={lineData} options={lineOpts} />
            </ChartCard>

            <ChartCard title="Stage Distribution">
              <Doughnut data={stageData} />
            </ChartCard>

            <ChartCard title="Top Suppliers (NCR count)">
              <Bar data={supplierBarData} options={barOpts} />
            </ChartCard>
          </div>

          <RecentOpen />
        </>
      )}
    </div>
  );
}

function CardStat({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="bg-white border rounded p-4">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border rounded p-4">
      <div className="text-sm text-gray-700 mb-3">{title}</div>
      <div className="h-64">{children}</div>
    </div>
  );
}

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
          .filter((i) => i.ncrStatusID === 1)
          .sort(
            (a, b) =>
              new Date(b.ncrIssueDate ?? 0).getTime() -
              new Date(a.ncrIssueDate ?? 0).getTime()
          )
          .slice(0, 5);
        setRows(sorted);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <h2 className="font-medium mb-2">Most Recent (Open)</h2>
      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-2 text-left">NCR No</th>
              <th className="p-2 text-left">Issue Date</th>
              <th className="p-2 text-left">Stage</th>
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
                <tr key={r.ncrFormID} className="border-t">
                  <td className="p-2">{r.ncrFormNo ?? r.ncrFormID}</td>
                  <td className="p-2">{(r.ncrIssueDate ?? "").slice(0, 10)}</td>
                  <td className="p-2">{r.ncrStage}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
