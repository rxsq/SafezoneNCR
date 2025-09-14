"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Pagination from "@/components/ui/Pagination";

type Product = {
  prodID: number;
  prodName: string;
  prodCategory: string | null;
  supID: number;
  createdAt?: string;
  updatedAt?: string;
};

type Supplier = {
  supID: number;
  supName: string;
};

type Paged<T> =
  | {
      items: T[];
      page?: number;
      limit?: number;
      totalRecords?: number;
    }
  | T[];

const DEFAULT_LIMIT = 10;

export default function ProductsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  const [products, setProducts] = useState<Product[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // Create/Edit modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Product | null>(null);
  const [form, setForm] = useState<Partial<Product>>({
    prodName: "",
    prodCategory: "",
    supID: undefined as any,
  });
  const [formErr, setFormErr] = useState<string | null>(null);

  // Delete confirm state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch suppliers (once)
  useEffect(() => {
    (async () => {
      try {
        const data = await api<Paged<Supplier>>("/api/suppliers?limit=1000");
        const list = Array.isArray(data) ? data : data.items ?? [];
        setSuppliers(list);
      } catch (e) {
        console.error("Failed to load suppliers", e);
      }
    })();
  }, []);

  // Fetch products (paged)
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await api<Paged<Product>>(
          `/api/products?page=${page}&limit=${limit}`
        );
        if (Array.isArray(data)) {
          setProducts(data);
          setTotalRecords(data.length);
        } else {
          setProducts(data.items ?? []);
          setTotalRecords(data.totalRecords ?? data.items?.length ?? 0);
        }
      } catch (e) {
        console.error("Failed to load products", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [page, limit]);

  async function reload() {
    try {
      const data = await api<Paged<Product>>(
        `/api/products?page=${page}&limit=${limit}`
      );
      if (Array.isArray(data)) {
        setProducts(data);
        setTotalRecords(data.length);
      } else {
        setProducts(data.items ?? []);
        setTotalRecords(data.totalRecords ?? data.items?.length ?? 0);
      }
    } catch (e) {
      console.error("Failed to reload products", e);
    }
  }

  function openCreate() {
    setEditItem(null);
    setForm({ prodName: "", prodCategory: "", supID: undefined as any });
    setFormErr(null);
    setModalOpen(true);
  }

  function openEdit(item: Product) {
    setEditItem(item);
    setForm({
      prodName: item.prodName ?? "",
      prodCategory: item.prodCategory ?? "",
      supID: item.supID,
    });
    setFormErr(null);
    setModalOpen(true);
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setFormErr(null);
    if (!form.prodName || !form.supID) {
      setFormErr("Product Name and Supplier are required.");
      return;
    }
    setSaving(true);
    try {
      if (editItem) {
        await api<Product>(`/api/products/${editItem.prodID}`, {
          method: "PUT",
          body: JSON.stringify({
            prodName: form.prodName,
            prodCategory: form.prodCategory,
            supID: Number(form.supID),
          }),
        });
      } else {
        await api<Product>(`/api/products`, {
          method: "POST",
          body: JSON.stringify({
            prodName: form.prodName,
            prodCategory: form.prodCategory,
            supID: Number(form.supID),
          }),
        });
      }
      await reload();
      setModalOpen(false);
    } catch (err: any) {
      console.error(err);
      setFormErr(err?.message || "Failed to save product.");
    } finally {
      setSaving(false);
    }
  }

  function askDelete(id: number) {
    setDeleteId(id);
    setConfirmOpen(true);
  }

  async function doDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api(`/api/products/${deleteId}`, { method: "DELETE" });
      // If last row on page removed, move back a page if needed
      if (products.length - 1 <= 0 && page > 1) {
        setPage((p) => Math.max(1, p - 1));
      } else {
        await reload();
      }
    } catch (e) {
      console.error("Delete failed", e);
      // basic feedback:
      alert("Failed to delete product.");
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
      setDeleteId(null);
    }
  }

  const supplierName = (supID: number) =>
    suppliers.find((s) => s.supID === supID)?.supName ?? `#${supID}`;

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((totalRecords || 0) / (limit || 1))),
    [totalRecords, limit]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Products</h1>
        <button
          className="bg-black text-white text-sm px-3 py-1.5 rounded"
          onClick={openCreate}
        >
          + New Product
        </button>
      </div>

      <p className="text-sm text-gray-600">
        Manage products (name, category, supplier).
      </p>

      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Category</th>
              <th className="p-2 text-left">Supplier</th>
              <th className="p-2 text-left w-40">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-3">
                  Loading…
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-3">
                  No products.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.prodID} className="border-t">
                  <td className="p-2">{p.prodID}</td>
                  <td className="p-2">{p.prodName}</td>
                  <td className="p-2">{p.prodCategory ?? "—"}</td>
                  <td className="p-2">{supplierName(p.supID)}</td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <button
                        className="px-2 py-1 border rounded hover:bg-gray-50"
                        onClick={() => openEdit(p)}
                      >
                        Edit
                      </button>
                      <button
                        className="px-2 py-1 border rounded hover:bg-red-50 text-red-600"
                        onClick={() => askDelete(p.prodID)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        pageSize={limit}
        total={totalRecords}
        onPageChange={setPage}
        onPageSizeChange={setLimit}
        className="mt-2"
      />

      {/* Create/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? "Edit Product" : "New Product"}
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              className="px-3 py-1.5 border rounded"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </button>
            <button
              className="px-3 py-1.5 rounded bg-black text-white disabled:opacity-60"
              onClick={(e) => onSave(e as any)}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        }
      >
        {formErr && <div className="mb-3 text-sm text-red-600">{formErr}</div>}
        <form onSubmit={onSave} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Product Name <span className="text-red-600">*</span>
            </label>
            <input
              className="w-full border rounded px-2 py-1"
              value={form.prodName ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, prodName: e.target.value }))
              }
              placeholder="e.g., 10mm Bolt"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Category</label>
            <input
              className="w-full border rounded px-2 py-1"
              value={form.prodCategory ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, prodCategory: e.target.value }))
              }
              placeholder="e.g., Hardware"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Supplier <span className="text-red-600">*</span>
            </label>
            <select
              className="w-full border rounded px-2 py-1"
              value={form.supID ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, supID: Number(e.target.value) }))
              }
              required
            >
              <option value="" disabled>
                Select a supplier…
              </option>
              {suppliers.map((s) => (
                <option key={s.supID} value={s.supID}>
                  {s.supName}
                </option>
              ))}
            </select>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={confirmOpen}
        onCancel={() => {
          setConfirmOpen(false);
          setDeleteId(null);
        }}
        onConfirm={doDelete}
        busy={deleting}
        title="Delete product?"
        message="This will permanently remove the product."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
