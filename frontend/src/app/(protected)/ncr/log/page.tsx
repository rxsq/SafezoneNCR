"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type NCR = {
  ncrFormID: number;
  ncrFormNo?: string;
  ncrIssueDate?: string;
  ncrStage?: string;
  ncrStatusID: number;
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
  const [data, setData] = useState<PageData | null>(null);
  const limit = 10;

  useEffect(() => {
    (async () => {
      const d = await api<PageData>(`/api/ncrForms?page=${page}&limit=${limit}`);
      setData(d);
    })();
  }, [page]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">NCR Log</h1>
      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-2 text-left">NCR No</th>
              <th className="p-2 text-left">Issue Date</th>
              <th className="p-2 text-left">Stage</th>
              <th className="p-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {data?.items?.map((i) => (
              <tr key={i.ncrFormID} className="border-t">
                <td className="p-2">{i.ncrFormNo ?? i.ncrFormID}</td>
                <td className="p-2">{(i.ncrIssueDate ?? "").slice(0,10)}</td>
                <td className="p-2">{i.ncrStage}</td>
                <td className="p-2">{i.ncrStatusID === 1 ? "Open" : "Closed"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pager
        page={data?.currentPage || 1}
        totalPages={data?.totalPages || 1}
        onChange={setPage}
      />
    </div>
  );
}

function Pager({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p:number) => void }) {
  return (
    <div className="flex items-center gap-2">
      <button
        className="px-3 py-1 border rounded disabled:opacity-50"
        onClick={() => onChange(1)}
        disabled={page <= 1}
      >
        First
      </button>
      <button
        className="px-3 py-1 border rounded disabled:opacity-50"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
      >
        Prev
      </button>
      <div className="text-sm">Page {page} / {totalPages}</div>
      <button
        className="px-3 py-1 border rounded disabled:opacity-50"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
      >
        Next
      </button>
      <button
        className="px-3 py-1 border rounded disabled:opacity-50"
        onClick={() => onChange(totalPages)}
        disabled={page >= totalPages}
      >
        Last
      </button>
    </div>
  );
}
