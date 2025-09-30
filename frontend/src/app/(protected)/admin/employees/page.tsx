"use client";

import React, { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Pagination from "@/components/ui/Pagination";
import { getMe, type Me } from "@/lib/auth";
import { email, set } from "zod";
import { redirect, useRouter } from "next/navigation";
import { notFound } from "next/navigation";

type Employee = {
  empID: number;
  empFirst: string | null;
  empLast: string | null;
  empEmail: string | null;
  empPhone?: string | null;
  empUsername?: string | null;
  posID: number;
  createdAt?: string;
  updatedAt?: string;
};

type Paged<T> =
  | {
      items: T[];
      page?: number;
      limit?: number;
      total?: number;
      pages?: number;
      totalRecords?: number;
    }
  | T[];

const DEFAULT_LIMIT = 10;

export default function EmployeesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Employee | null>(null);
  const [formErr, setFormErr] = useState<string | null>(null);
  const [form, setForm] = useState<{
    empFirst: string;
    empLast: string;
    empEmail: string;
    empPhone?: string;
    empUsername?: string;
    empPassword?: string;
    posID: number | "";
  }>({
    empFirst: "",
    empLast: "",
    empEmail: "",
    empPhone: "",
    empUsername: "",
    empPassword: "",
    posID: "" as any,
  });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [me, setMe] = useState<Me | null>(null);
  useEffect(() => {
    (async () => setMe(await getMe()))();
  }, []);
  const role = (me?.Position?.posDescription ?? "").toLowerCase();

  useEffect(() => {
    if (me && !isAdmin()) {
      router.replace("/unauthorized");
    }
  }, [me]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await api<Paged<Employee>>(
          `/api/employees?page=${page}&limit=${limit}`
        );
        if (Array.isArray(data)) {
          setEmployees(data);
          setTotalRecords(data.length);
        } else {
          const items = data.items ?? [];
          setEmployees(items);
          const total =
            (data as any).total ?? (data as any).totalRecords ?? items.length;
          setTotalRecords(typeof total === "number" ? total : items.length);
        }
      } catch (e) {
        console.error("Failed to load employees", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [page, limit]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((totalRecords || 0) / (limit || 1))),
    [totalRecords, limit]
  );

  async function reload() {
    try {
      const data = await api<Paged<Employee>>(
        `/api/employees?page=${page}&limit=${limit}`
      );
      if (Array.isArray(data)) {
        setEmployees(data);
        setTotalRecords(data.length);
      } else {
        const items = data.items ?? [];
        setEmployees(items);
        const total =
          (data as any).total ?? (data as any).totalRecords ?? items.length;
        setTotalRecords(typeof total === "number" ? total : items.length);
      }
    } catch (e) {
      console.error("Failed to reload employees", e);
    }
  }

  if (!me) {
    return <div>Loading...</div>;
  }

  if (!isAdmin()) {
    redirect("/forbidden");
  }

  function openCreate() {
    setEditItem(null);
    setForm({
      empFirst: "",
      empLast: "",
      empEmail: "",
      empPhone: "",
      empUsername: "",
      empPassword: "",
      posID: "" as any,
    });
    setFormErr(null);
    setModalOpen(true);
  }

  function openEdit(item: Employee) {
    setEditItem(item);
    setForm({
      empFirst: item.empFirst ?? "",
      empLast: item.empLast ?? "",
      empEmail: item.empEmail ?? "",
      empPhone: item.empPhone ?? "",
      empUsername: item.empUsername ?? "",
      empPassword: "",
      posID: item.posID ?? ("" as any),
    });
    setFormErr(null);
    setModalOpen(true);
  }

  function validate(): string | null {
    if (!form.empFirst?.trim() || !form.empLast?.trim()) {
      return "First and Last name are required.";
    }
    if (!form.empEmail?.trim()) {
      return "Email is required.";
    }
    if (!form.posID || Number.isNaN(Number(form.posID))) {
      return "Position (posID) is required.";
    }
    if (!editItem && !form.empPassword?.trim()) {
      return "Password is required when creating an employee.";
    }
    return null;
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setFormErr(null);
    const err = validate();
    if (err) {
      setFormErr(err);
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        empFirst: form.empFirst.trim(),
        empLast: form.empLast.trim(),
        empEmail: form.empEmail.trim(),
        empPhone: form.empPhone?.trim() || null,
        empUsername: form.empUsername?.trim() || null,
        posID: Number(form.posID),
      };
      if ((editItem && form.empPassword?.trim()) || !editItem) {
        payload.empPassword = form.empPassword;
      }

      if (editItem) {
        await api<Employee>(`/api/employees/${editItem.empID}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await api<Employee>(`/api/employees`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      await reload();
      setModalOpen(false);
    } catch (err: any) {
      setFormErr(err?.message || "Failed to save employee.");
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
      await api(`/api/employees/${deleteId}`, {
        method: "DELETE",
      });
      // if the last row on the page was deleted, go back a page
      if (EmployeesPage.length - 1 <= 0 && page > 1) {
        setPage((p) => Math.max(1, p - 1));
      } else {
        await reload();
      }
    } catch (e) {
      console.error("Delete failed", e);
      alert("Failed to delete employee.");
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
      setDeleteId(null);
    }
  }

  function formatPhoneNumber(phoneNumberString?: string) {
    var cleaned = ("" + phoneNumberString).replace(/\D/g, "");
    var match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return "(" + match[1] + ") " + match[2] + "-" + match[3];
    }
    return null;
  }

  function isAdmin() {
    return role === "administrator";
  }

  const fullName = (e: Employee) =>
    [e.empFirst, e.empLast].filter(Boolean).join(" ") || "—";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Employees</h1>
        <button
          className="bg-black text-white text-sm px-3 py-1.5 rounded"
          onClick={openCreate}
        >
          + New Employee
        </button>
      </div>

      <p className="text-sm text-gray-600">
        Manage employees (name, contact, username, position). Password is only
        required when creating, and is never shown.
      </p>

      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Username</th>
              <th className="p-2 text-left">Phone</th>
              <th className="p-2 text-left">posID</th>
              <th className="p-2 text-left w-40">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="p-3">
                  Loading…
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-3">
                  No employees.
                </td>
              </tr>
            ) : (
              employees.map((e) => (
                <tr key={e.empID} className="border-t">
                  <td className="p-2">{e.empID}</td>
                  <td className="p-2">{fullName(e)}</td>
                  <td className="p-2">{e.empEmail || "—"}</td>
                  <td className="p-2">{e.empUsername || "—"}</td>
                  <td className="p-2">
                    {e.empPhone ? formatPhoneNumber(e.empPhone) || "—" : "—"}
                  </td>
                  <td className="p-2">{e.posID}</td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <button
                        className="px-2 py-1 border rounded hover:bg-gray-50"
                        onClick={() => openEdit(e)}
                      >
                        Edit
                      </button>
                      <button
                        className="px-2 py-1 border rounded hover:bg-red-50 text-red-600"
                        onClick={() => askDelete(e.empID)}
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
        title={editItem ? "Edit Employee" : "New Employee"}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                First Name <span className="text-red-600">*</span>
              </label>
              <input
                className="w-full border rounded px-2 py-1"
                value={form.empFirst}
                onChange={(e) =>
                  setForm((f) => ({ ...f, empFirst: e.target.value }))
                }
                placeholder="e.g., Alice"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Last Name <span className="text-red-600">*</span>
              </label>
              <input
                className="w-full border rounded px-2 py-1"
                value={form.empLast}
                onChange={(e) =>
                  setForm((f) => ({ ...f, empLast: e.target.value }))
                }
                placeholder="e.g., Doe"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Email <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                className="w-full border rounded px-2 py-1"
                value={form.empEmail}
                onChange={(e) =>
                  setForm((f) => ({ ...f, empEmail: e.target.value }))
                }
                placeholder="alice@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Username
              </label>
              <input
                className="w-full border rounded px-2 py-1"
                value={form.empUsername ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, empUsername: e.target.value }))
                }
                placeholder="alice.doe"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Phone</label>
              <input
                className="w-full border rounded px-2 py-1"
                value={form.empPhone ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, empPhone: e.target.value }))
                }
                placeholder="555-123-4567"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Position ID (posID) <span className="text-red-600">*</span>
              </label>
              <input
                className="w-full border rounded px-2 py-1"
                value={form.posID}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    posID: Number(e.target.value) || "",
                  }))
                }
                placeholder="e.g., 1"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              {editItem ? "New Password (optional)" : "Password *"}
            </label>
            <input
              type="password"
              className="w-full border rounded px-2 py-1"
              value={form.empPassword ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, empPassword: e.target.value }))
              }
              placeholder={
                editItem ? "Leave blank to keep current password" : ""
              }
              required={!editItem}
            />
            {editItem && (
              <p className="text-xs text-gray-500 mt-1">
                Leave blank to keep the current password.
              </p>
            )}
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
        title="Delete employee?"
        message="This will permanently remove the employee."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
