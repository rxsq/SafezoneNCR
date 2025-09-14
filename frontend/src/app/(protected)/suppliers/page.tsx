"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Pagination from "@/components/ui/Pagination";
import { set } from "zod";

type Supplier = {
  supID: number;
  supName: string;
  supContactName: string;
  supContactEmail: string;
  supContactPhone: string;
  supAddress: string;
  supCity: string;
  supCountry: string;
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

export default function SuppliersPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);

  // Create/Edit modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Supplier | null>(null);
  const [form, setForm] = useState<Partial<Supplier>>({
    supName: "",
    supContactName: "",
    supContactEmail: "",
    supContactPhone: "",
    supAddress: "",
    supCity: "",
    supCountry: "",
  });
  const [formErr, setFormErr] = useState<string | null>(null);

  // Delete confirm state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch suppliers (paged)
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await api<Paged<Supplier>>(
          `/api/suppliers?page=${page}&limit=${limit}`
        );
        if (Array.isArray(data)) {
          setSuppliers(data);
          setTotalRecords(data.length);
        } else {
          setSuppliers(data.items ?? []);
          setTotalRecords(data.totalRecords ?? data.items?.length ?? 0);
        }
      } catch (e) {
        console.error("Failed to fetch suppliers", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [page, limit]);

  async function reload() {
    try {
      const data = await api<Paged<Supplier>>(
        `/api/suppliers?page=${page}&limit=${limit}`
      );
      if (Array.isArray(data)) {
        setSuppliers(data);
        setTotalRecords(data.length);
      } else {
        setSuppliers(data.items ?? []);
        setTotalRecords(data.totalRecords ?? data.items?.length ?? 0);
      }
    } catch (e) {
      console.error("Failed to reload suppliers", e);
    }
  }

  function openCreate() {
    setEditItem(null);
    setForm({
      supName: "",
      supContactName: "",
      supContactEmail: "",
      supContactPhone: "",
      supAddress: "",
      supCity: "",
      supCountry: "",
    });
    setFormErr(null);
    setModalOpen(true);
  }

  function openEdit(item: Supplier) {
    setEditItem(item);
    setForm({
      supName: item.supName,
      supContactName: item.supContactName,
      supContactEmail: item.supContactEmail,
      supContactPhone: item.supContactPhone,
      supAddress: item.supAddress,
      supCity: item.supCity,
      supCountry: item.supCountry,
    });
    setFormErr(null);
    setModalOpen(true);
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setFormErr(null);
    if (!form.supName || form.supName.trim() === "") {
      setFormErr("Supplier name is required");
      return;
    }
    if (!form.supContactEmail || form.supContactEmail.trim() === "") {
      setFormErr("Contact email is required");
      return;
    }
    if (!form.supContactPhone || form.supContactPhone.trim() === "") {
      setFormErr("Contact phone is required");
      return;
    }
    if (!form.supAddress || form.supAddress.trim() === "") {
      setFormErr("Address is required");
      return;
    }
    if (!form.supCity || form.supCity.trim() === "") {
      setFormErr("City is required");
      return;
    }
    if (!form.supCountry || form.supCountry.trim() === "") {
      setFormErr("Country is required");
      return;
    }

    setSaving(true);
    try {
      if (editItem) {
        await api<Supplier>(`/api/suppliers/${editItem.supID}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
      } else {
        await api<Supplier>(`/api/suppliers`, {
          method: "POST",
          body: JSON.stringify(form),
        });
      }
      await reload();
      setModalOpen(false);
    } catch (err: any) {
      setFormErr(err?.message || "Failed to save supplier");
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
      await api(`/api/suppliers/${deleteId}`, {
        method: "DELETE",
      });
      if (suppliers.length - 1 <= 0 && page > 1) {
        setPage((p) => Math.max(1, p - 1));
      } else {
        await reload();
      }
    } catch (e) {
      console.error("Delete failed", e);
      // basic feedback for now
      alert("Failed to delete supplier.");
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
      setDeleteId(null);
    }
  }

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((totalRecords || 0) / (limit || 1))),
    [totalRecords, limit]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Suppliers</h1>
        <button
          className="bg-black text-white text-sm px-3 py-1.5 rounded"
          onClick={openCreate}
        >
          + New Supplier
        </button>
      </div>

      <p className="text-sm text-gray-600">Manage suppliers</p>

      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">Nam</th>
              <th className="p-2 text-left">Contact Email</th>
              <th className="p-2 text-left">Contact Phone</th>
              <th className="p-2 text-left">Address</th>
              <th className="p-2 text-left">City</th>
              <th className="p-2 text-left">Country</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-3">
                  Loading…
                </td>
              </tr>
            ) : suppliers.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-3">
                  No suppliers.
                </td>
              </tr>
            ) : (
              suppliers.map((sup) => (
                <tr key={sup.supID} className="border-t">
                  <td className="p-2">{sup.supID}</td>
                  <td className="p-2">{sup.supName}</td>
                  <td className="p-2">{sup.supContactEmail}</td>
                  <td className="p-2">{sup.supContactPhone}</td>
                  <td className="p-2">{sup.supAddress}</td>
                  <td className="p-2">{sup.supCity}</td>
                  <td className="p-2">{sup.supCountry}</td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <button
                        className="px-2 py-1 border rounded hover:bg-gray-50"
                        onClick={() => openEdit(sup)}
                      >
                        Edit
                      </button>
                      <button
                        className="px-2 py-1 border rounded hover:bg-red-50 text-red-600"
                        onClick={() => askDelete(sup.supID)}
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
        title={editItem ? "Edit Supplier" : "New Supplier"}
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
              Supplier Name <span className="text-red-600">*</span>
            </label>
            <input
              className="w-full border rounded px-2 py-1"
              value={form.supName ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, supName: e.target.value }))
              }
              placeholder="e.g., Acme Components Ltd."
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Contact Name
              </label>
              <input
                className="w-full border rounded px-2 py-1"
                value={form.supContactName ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, supContactName: e.target.value }))
                }
                placeholder="e.g., Jane Doe"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Contact Email <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                className="w-full border rounded px-2 py-1"
                value={form.supContactEmail ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, supContactEmail: e.target.value }))
                }
                placeholder="e.g., jane@acme.com"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Contact Phone <span className="text-red-600">*</span>
              </label>
              <input
                type="tel"
                className="w-full border rounded px-2 py-1"
                value={form.supContactPhone ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, supContactPhone: e.target.value }))
                }
                placeholder="e.g., +1 (555) 123-4567"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Address <span className="text-red-600">*</span>
              </label>
              <input
                className="w-full border rounded px-2 py-1"
                value={form.supAddress ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, supAddress: e.target.value }))
                }
                placeholder="e.g., 123 Industrial Way"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                City <span className="text-red-600">*</span>
              </label>
              <input
                className="w-full border rounded px-2 py-1"
                value={form.supCity ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, supCity: e.target.value }))
                }
                placeholder="e.g., Toronto"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Country <span className="text-red-600">*</span>
              </label>
              <input
                className="w-full border rounded px-2 py-1"
                value={form.supCountry ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, supCountry: e.target.value }))
                }
                placeholder="e.g., Canada"
                required
              />
            </div>
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
        title="Delete supplier?"
        message="This will permanently remove the supplier."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
