"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { getMe, type Me } from "@/lib/auth";
import { getJson } from "@/lib/api";
import clsx from "clsx";
import {
  SearchableSelect,
  type Option,
} from "@/components/ui/SearchableSelect";

type Product = { prodID: number; prodName?: string; prodCode?: string };

type QualityForm = {
  qualFormID: number;
  qualItemDesc: string;
  qualIssueDesc: string;
  qualItemID?: number;
  qualSalesOrderNo?: number;
  qualQtyReceived?: number;
  qualQtyDefective?: number;
  qualItemNonConforming?: number; // 0/1
  qualRepID?: number;
  qualDate: string; // YYYY-MM-DD
};

type NCRForm = {
  ncrFormID: number;
  ncrFormNo?: string;
  ncrIssueDate: string; // YYYY-MM-DD
  prodID: number;
  qualFormID: number;
  engFormID?: number;
  purFormID?: number;
  ncrStage: "QUA" | "ENG" | "PUR" | "ARC";
  ncrStatusID: 1 | 2; // 1=open 2=closed
};

export default function NcrNewPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  useEffect(() => {
    (async () => setMe(await getMe()))();
  }, []);
  const repId = me?.empID ?? undefined;
  const role = (me?.Position?.posDescription ?? "").toLowerCase();
  const canEditEngineering = /engineer|quality manager|chief/.test(role);
  const canEditPurchasing = /operations|purchasing|manager/.test(role);

  /* Products (from /api/products/options) */
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setLoadingProducts(true);
        setProductsError(null);
        const list = await getJson<Product[]>(
          "/api/products/options?fields=prodID,prodName&limit=2000",
          { signal: controller.signal }
        );
        // list may be undefined if the request was aborted—don’t flip to error UI
        if (Array.isArray(list)) setProducts(list);
      } catch (e: any) {
        setProducts([]);
        // Only show error if it wasn't an abort (api() already suppresses aborts too)
        if (e?.name !== "AbortError")
          setProductsError("Failed to load products.");
      } finally {
        setLoadingProducts(false);
      }
    })();
    return () => controller.abort();
  }, []);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [prodID, setProdID] = useState<number | null>(null);

  const [qualItemDesc, setQualItemDesc] = useState("");
  const [qualIssueDesc, setQualIssueDesc] = useState("");
  const [qualSalesOrderNo, setQualSalesOrderNo] = useState<string>("");
  const [qualQtyReceived, setQualQtyReceived] = useState<string>("");
  const [qualQtyDefective, setQualQtyDefective] = useState<string>("");
  const [qualItemNonConforming, setQualItemNonConforming] = useState<
    0 | 1 | ""
  >("");
  const [qualDate, setQualDate] = useState<string>(today);

  // future steps (display only)
  const [engDisposition, setEngDisposition] = useState("");
  const [engRootCause, setEngRootCause] = useState("");
  const [purDisposition, setPurDisposition] = useState("");
  const [purAction, setPurAction] = useState("");

  /* UX */
  const [submitted, setSubmitted] = useState(false); // <-- controls error visibility
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const productLabel = (p: Product) =>
    p.prodName || p.prodCode || `#${p.prodID}`;

  const productOptions: Option[] = products.map((p) => ({
    value: p.prodID,
    label: p.prodName || `#${p.prodID}`,
  }));

  /* Silent completeness checks (for gating only; no error UI until submit) */
  const qualityComplete = useMemo(() => {
    if (!prodID) return false;
    if (!qualItemDesc.trim()) return false;
    if (!qualIssueDesc.trim()) return false;
    if (!qualDate) return false;
    if (qualQtyReceived && isNaN(Number(qualQtyReceived))) return false;
    if (qualQtyDefective && isNaN(Number(qualQtyDefective))) return false;
    if (qualItemNonConforming === "") return false;
    return true;
  }, [
    prodID,
    qualItemDesc,
    qualIssueDesc,
    qualDate,
    qualQtyReceived,
    qualQtyDefective,
    qualItemNonConforming,
  ]);

  const engineeringComplete = !!engDisposition.trim() && !!engRootCause.trim();

  /* Submission-time validation only */
  function validateOnSubmit(): Record<string, string> {
    const e: Record<string, string> = {};
    if (!prodID) e.prodID = "Product is required.";
    if (!qualItemDesc.trim()) e.qualItemDesc = "Item description is required.";
    if (!qualIssueDesc.trim())
      e.qualIssueDesc = "Issue/defect description is required.";
    if (!qualDate) e.qualDate = "Issue date is required.";
    if (qualQtyReceived && isNaN(Number(qualQtyReceived)))
      e.qualQtyReceived = "Quantity received must be a number.";
    if (qualQtyDefective && isNaN(Number(qualQtyDefective)))
      e.qualQtyDefective = "Quantity defective must be a number.";
    if (qualItemNonConforming === "")
      e.qualItemNonConforming =
        "Please indicate if the item is marked nonconforming.";
    return e;
  }

  /* Submit (creates QualityForm then NCRForm) */
  const handleSubmit = async () => {
    setSubmitted(true); // show errors now
    const e = validateOnSubmit();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    try {
      // 1) Create QualityForm
      const qBody: Partial<QualityForm> = {
        qualItemDesc,
        qualIssueDesc,
        qualItemID: prodID ?? undefined,
        qualSalesOrderNo: qualSalesOrderNo
          ? Number(qualSalesOrderNo)
          : undefined,
        qualQtyReceived: qualQtyReceived ? Number(qualQtyReceived) : undefined,
        qualQtyDefective: qualQtyDefective
          ? Number(qualQtyDefective)
          : undefined,
        qualItemNonConforming:
          qualItemNonConforming === ""
            ? undefined
            : Number(qualItemNonConforming),
        qualRepID: repId,
        qualDate, // YYYY-MM-DD
      };

      const quality = await api<QualityForm>("/api/qualityForms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(qBody),
      });

      // 2) Create NCRForm linked to QualityForm
      const ncrBody: Partial<NCRForm> = {
        ncrIssueDate: qualDate,
        prodID: prodID ?? 0,
        qualFormID: quality.qualFormID,
        ncrStage: "QUA",
        ncrStatusID: 1, // open
      };

      await api<NCRForm>("/api/ncrForms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ncrBody),
      });

      router.replace("/ncr/log");
    } catch {
      setErrors({ _root: "Failed to create NCR. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Stepper */}
      <Stepper
        steps={[
          { label: "Quality", active: true, ready: qualityComplete },
          {
            label: "Engineering",
            active: canEditEngineering && qualityComplete,
            ready: engineeringComplete,
            hint: !qualityComplete
              ? "Complete Quality first"
              : !canEditEngineering
              ? "Insufficient role"
              : undefined,
          },
          {
            label: "Purchasing",
            active: canEditPurchasing && qualityComplete && engineeringComplete,
            ready: false,
            hint: !qualityComplete
              ? "Complete Quality first"
              : !engineeringComplete
              ? "Complete Engineering"
              : !canEditPurchasing
              ? "Insufficient role"
              : undefined,
          },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Create NCR</h1>
        <div className="text-xs text-gray-600">
          Stage: <Pill>Quality</Pill>
        </div>
      </div>

      {/* Meta */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Field label="NCR No." hint="Assigned on create" readOnly>
            <input className="input" placeholder="Auto" readOnly />
          </Field>
          <Field
            label="Issue Date"
            required
            error={submitted ? errors.qualDate : undefined}
          >
            <input
              className={inputCls(submitted && !!errors.qualDate)}
              type="date"
              value={qualDate}
              onChange={(e) => setQualDate(e.target.value)}
            />
          </Field>
          <Field label="Representative">
            <input
              className="input"
              value={
                me ? `${me.empFirst} ${me.empLast}`.replace(/\s+\.$/, "") : ""
              }
              readOnly
            />
          </Field>
          <Field label="Rep ID">
            <input className="input" value={repId ?? ""} readOnly />
          </Field>
        </div>
      </Card>

      {/* Quality */}
      <Card title="Quality">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field
            label="Product"
            required
            error={submitted ? errors.prodID : undefined}
          >
            <SearchableSelect
              options={productOptions}
              value={prodID ?? null}
              onChange={(v) => setProdID(typeof v === "number" ? v : Number(v))}
              loading={loadingProducts}
              error={productsError}
              placeholder="Search products…"
            />
          </Field>

          <Field label="Sales Order #">
            <input
              className="input"
              inputMode="numeric"
              value={qualSalesOrderNo}
              onChange={(e) =>
                setQualSalesOrderNo(e.target.value.replace(/\D/g, ""))
              }
              placeholder="e.g. 23456"
            />
          </Field>

          <Field
            label="Item Marked Nonconforming"
            required
            error={submitted ? errors.qualItemNonConforming : undefined}
          >
            <div className="flex gap-3 items-center h-9">
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="radio"
                  name="nonconforming"
                  checked={qualItemNonConforming === 1}
                  onChange={() => setQualItemNonConforming(1)}
                />
                Yes
              </label>
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="radio"
                  name="nonconforming"
                  checked={qualItemNonConforming === 0}
                  onChange={() => setQualItemNonConforming(0)}
                />
                No
              </label>
            </div>
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field
            label="Quantity Received"
            error={submitted ? errors.qualQtyReceived : undefined}
          >
            <input
              className={inputCls(submitted && !!errors.qualQtyReceived)}
              inputMode="numeric"
              value={qualQtyReceived}
              onChange={(e) =>
                setQualQtyReceived(e.target.value.replace(/\D/g, ""))
              }
              placeholder="e.g. 100"
            />
          </Field>
          <Field
            label="Quantity Defective"
            error={submitted ? errors.qualQtyDefective : undefined}
          >
            <input
              className={inputCls(submitted && !!errors.qualQtyDefective)}
              inputMode="numeric"
              value={qualQtyDefective}
              onChange={(e) =>
                setQualQtyDefective(e.target.value.replace(/\D/g, ""))
              }
              placeholder="e.g. 5"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field
            label="Description of Item (incl. SAP #)"
            required
            error={submitted ? errors.qualItemDesc : undefined}
          >
            <textarea
              className={inputCls(submitted && !!errors.qualItemDesc, true)}
              value={qualItemDesc}
              onChange={(e) => setQualItemDesc(e.target.value)}
              placeholder="Provide a detailed item description"
            />
          </Field>
          <Field
            label="Description of Defect"
            required
            error={submitted ? errors.qualIssueDesc : undefined}
          >
            <textarea
              className={inputCls(submitted && !!errors.qualIssueDesc, true)}
              value={qualIssueDesc}
              onChange={(e) => setQualIssueDesc(e.target.value)}
              placeholder="Describe the defect in detail"
            />
          </Field>
        </div>
      </Card>

      {/* Engineering (preview only) */}
      <Card
        title="Engineering"
        disabled={!canEditEngineering || !qualityComplete}
        hint={
          !qualityComplete
            ? "Complete the Quality section to unlock Engineering."
            : !canEditEngineering
            ? "Your role does not allow editing Engineering."
            : undefined
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field
            label="Disposition"
            readOnly={!canEditEngineering || !qualityComplete}
          >
            <input
              className="input"
              value={engDisposition}
              onChange={(e) => setEngDisposition(e.target.value)}
              placeholder="Use As Is / Repair / Rework / Scrap"
              readOnly={!canEditEngineering || !qualityComplete}
            />
          </Field>
          <Field
            label="Root Cause"
            readOnly={!canEditEngineering || !qualityComplete}
          >
            <input
              className="input"
              value={engRootCause}
              onChange={(e) => setEngRootCause(e.target.value)}
              placeholder="Short root cause summary"
              readOnly={!canEditEngineering || !qualityComplete}
            />
          </Field>
        </div>
      </Card>

      {/* Purchasing (preview only) */}
      <Card
        title="Purchasing"
        disabled={
          !canEditPurchasing || !qualityComplete || !engineeringComplete
        }
        hint={
          !qualityComplete
            ? "Complete Quality first."
            : !engineeringComplete
            ? "Complete Engineering to unlock Purchasing."
            : !canEditPurchasing
            ? "Your role does not allow editing Purchasing."
            : undefined
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field
            label="Disposition"
            readOnly={!canEditPurchasing || !engineeringComplete}
          >
            <input
              className="input"
              value={purDisposition}
              onChange={(e) => setPurDisposition(e.target.value)}
              placeholder="Return to Supplier / Rework / Scrap / Defer"
              readOnly={!canEditPurchasing || !engineeringComplete}
            />
          </Field>
          <Field
            label="Action"
            readOnly={!canEditPurchasing || !engineeringComplete}
          >
            <input
              className="input"
              value={purAction}
              onChange={(e) => setPurAction(e.target.value)}
              placeholder="e.g. Issue credit"
              readOnly={!canEditPurchasing || !engineeringComplete}
            />
          </Field>
        </div>
      </Card>

      {/* Submission errors (only after submit) */}
      {submitted && errors._root && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errors._root}
        </div>
      )}

      {/* Sticky action bar */}
      <div className="sticky bottom-0 z-10 -mx-6 border-t bg-white/95 px-6 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => router.replace("/ncr/log")}
            className="h-9 rounded border px-3 text-sm hover:bg-gray-50"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className={clsx(
              "h-9 rounded bg-gray-900 px-4 text-sm text-white hover:bg-black",
              submitting && "opacity-60"
            )}
            disabled={submitting}
          >
            {submitting ? "Creating…" : "Create NCR"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Stepper({
  steps,
}: {
  steps: { label: string; active: boolean; ready?: boolean; hint?: string }[];
}) {
  return (
    <div className="flex items-center gap-3 text-xs">
      {steps.map((s, i) => (
        <div key={s.label} className="flex items-center gap-2">
          <div
            className={clsx(
              "inline-flex h-5 w-5 items-center justify-center rounded-full border text-[11px]",
              s.ready
                ? "bg-emerald-600 border-emerald-600 text-white"
                : s.active
                ? "bg-gray-900 border-gray-900 text-white"
                : "bg-gray-100 border-gray-200 text-gray-500"
            )}
            title={s.hint}
          >
            {i + 1}
          </div>
          <span
            className={clsx(
              s.ready
                ? "text-emerald-700"
                : s.active
                ? "text-gray-800"
                : "text-gray-500"
            )}
            title={s.hint}
          >
            {s.label}
          </span>
          {i < steps.length - 1 && (
            <div className="mx-1 h-px w-6 bg-gray-200" />
          )}
        </div>
      ))}
    </div>
  );
}

function Card({
  title,
  hint,
  disabled,
  children,
}: {
  title?: string;
  hint?: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={clsx(
        "relative rounded-md border bg-white p-3",
        disabled && "opacity-60"
      )}
      aria-disabled={disabled ? true : undefined}
    >
      {(title || hint) && (
        <div className="mb-2 flex items-center justify-between">
          {title && <div className="text-sm font-semibold">{title}</div>}
          {hint && <div className="text-[11px] text-gray-500">{hint}</div>}
        </div>
      )}
      {disabled && (
        <div className="pointer-events-none absolute inset-0 rounded-md ring-1 ring-inset ring-gray-200" />
      )}
      {children}
    </div>
  );
}

function Field({
  label,
  hint,
  required,
  readOnly,
  error,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  readOnly?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1 flex items-center gap-2">
        <span className="text-xs font-medium text-gray-700">
          {label} {required && <span className="text-red-600">*</span>}
        </span>
        {hint && <span className="text-[11px] text-gray-500">{hint}</span>}
      </div>
      <div className={clsx(readOnly && "pointer-events-none opacity-75")}>
        {children}
      </div>
      {error && <div className="mt-1 text-[11px] text-red-600">{error}</div>}
    </label>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-sky-50 text-sky-700 ring-1 ring-sky-200">
      {children}
    </span>
  );
}

/* -------- Searchable Product Combobox (no libs) -------- */

function ProductCombobox({
  products,
  loading,
  error,
  value,
  onChange,
}: {
  products: Product[];
  loading: boolean;
  error: string | null;
  value: number | null;
  onChange: (id: number | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const selected =
    value != null ? products.find((p) => p.prodID === value) : undefined;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => (p.prodName || "").toLowerCase().includes(q));
  }, [products, query]);

  const openList = () => setOpen(true);
  const closeList = () => {
    setOpen(false);
    setActiveIndex(-1);
  };

  const select = (p: Product | null) => {
    onChange(p ? p.prodID : null);
    setQuery(p ? p.prodName ?? String(p.prodID) : "");
    closeList();
  };

  // keep input text in sync with selection on first mount/changes
  useEffect(() => {
    if (selected && !query)
      setQuery(selected.prodName ?? String(selected.prodID));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.prodID]);

  return (
    <div className="relative">
      <div className="flex items-center">
        <input
          ref={inputRef}
          className="input pr-8"
          placeholder={loading ? "Loading products…" : "Search products…"}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => openList()}
          onKeyDown={(e) => {
            if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp"))
              setOpen(true);
            if (!open) return;

            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIndex((i) => Math.max(i - 1, 0));
            } else if (e.key === "Enter") {
              e.preventDefault();
              const p = filtered[activeIndex];
              if (p) select(p);
            } else if (e.key === "Escape") {
              closeList();
            }
          }}
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls="product-combobox-list"
          role="combobox"
        />
        {selected && (
          <button
            type="button"
            className="ml-[-28px] h-6 w-6 rounded text-gray-500 hover:bg-gray-100"
            aria-label="Clear selection"
            onClick={() => {
              setQuery("");
              onChange(null);
              setOpen(true);
              inputRef.current?.focus();
            }}
          >
            ×
          </button>
        )}
      </div>

      {open && (
        <div className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-md border bg-white shadow">
          {error ? (
            <div className="p-2 text-sm text-red-600">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="p-2 text-sm text-gray-500">No matches</div>
          ) : (
            <ul
              id="product-combobox-list"
              role="listbox"
              className="divide-y divide-gray-50"
            >
              {filtered.map((p, idx) => {
                const active = idx === activeIndex;
                const selectedItem = value === p.prodID;
                return (
                  <li
                    key={p.prodID}
                    role="option"
                    aria-selected={selectedItem}
                    className={clsx(
                      "cursor-pointer px-2 py-1.5 text-sm",
                      active ? "bg-gray-100" : "hover:bg-gray-50"
                    )}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => select(p)}
                    title={p.prodName}
                  >
                    {p.prodName || `#${p.prodID}`}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------------- Small style helpers ---------------- */

function inputCls(hasError = false, isTextarea = false) {
  return clsx(
    "w-full rounded border px-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 bg-white",
    isTextarea ? "py-2 min-h-[84px]" : "h-9",
    hasError ? "border-red-300" : "border-gray-300"
  );
}
