"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type NCR = {
  ncrFormID: number;
  ncrFormNo?: string;
  ncrIssueDate?: string;
  ncrStage?: string;   // "QUA" | "ENG" | "PUR" | "ARC"
  ncrStatusID: number; // 1 open, 2 closed
  prodID: number;
};

export default function DashboardPage() {
  const [items, setItems] = useState<NCR[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await api<{ items?: NCR[]; status?: string; totalRecords?: number }>("/api/ncrForms?limit=1000");
        const list = Array.isArray(data) ? (data as NCR[]) : data.items || [];
        setItems(list);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const total = items.length;
  const open = items.filter(i => i.ncrStatusID === 1).length;
  const closed = items.filter(i => i.ncrStatusID === 2).length;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      {loading ? <div>Loading...</div> : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <CardStat title="Total" value={total} />
            <CardStat title="Open" value={open} />
            <CardStat title="Closed" value={closed} />
          </div>

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
                  {items
                    .filter(i => i.ncrStatusID === 1)
                    .sort((a,b) => new Date(b.ncrIssueDate ?? 0).getTime() - new Date(a.ncrIssueDate ?? 0).getTime())
                    .slice(0, 5)
                    .map(i => (
                    <tr key={i.ncrFormID} className="border-t">
                      <td className="p-2">{i.ncrFormNo ?? i.ncrFormID}</td>
                      <td className="p-2">{(i.ncrIssueDate ?? "").slice(0,10)}</td>
                      <td className="p-2">{i.ncrStage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function CardStat({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white border rounded p-4">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}
