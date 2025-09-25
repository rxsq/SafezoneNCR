"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";
import { api } from "@/lib/api";
import { getMe, type Me } from "@/lib/auth";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

/* =========================
   Backend Types (aligned to your API)
   ========================= */

type Product = { prodID: number; prodName?: string };

type QualityForm = {
  qualFormID: number;
  qualItemDesc: string;
  qualIssueDesc: string;
  qualItemID?: number;
  qualSalesOrderNo?: number;
  qualQtyReceived?: number;
  qualQtyDefective?: number;
  qualItemNonConforming?: number; // expect 0/1 but normalize anyway
  qualRepID?: number;
  qualDate: string; // YYYY-MM-DD
};

type EngineerForm = {
  engFormID: number;
  engRootCause?: string;
  engDisposition?: string;
  engOwnerID?: number;
  engDate?: string; // YYYY-MM-DD
};

type PurchasingForm = {
  purFormID: number;
  purDisposition?: string;
  purAction?: string;
  purOwnerID?: number;
  purDate?: string; // YYYY-MM-DD
};

type NCRForm = {
  ncrFormID: number;
  ncrFormNo?: string;
  ncrIssueDate: string; // YYYY-MM-DD
  prodID: number;
  qualFormID?: number | null;
  engFormID?: number | null;
  purFormID?: number | null;
  ncrStage: "QUA" | "ENG" | "PUR" | "CLO" | "ARC";
  ncrStatusID: 1 | 2; // 1=open 2=closed
};

const stageLabel: Record<NCRForm["ncrStage"], string> = {
  QUA: "Quality",
  ENG: "Engineering",
  PUR: "Purchasing",
  ARC: "Archived",
  CLO: "Closed",
};
const stageOrder: Array<"QUA" | "ENG" | "PUR" | "CLO"> = [
  "QUA",
  "ENG",
  "PUR",
  "CLO",
];
const stageIdx = (s: NCRForm["ncrStage"]) =>
  stageOrder.indexOf(normalizeStage(s));

function normalizeStage(s: NCRForm["ncrStage"]): "QUA" | "ENG" | "PUR" | "CLO" {
  return s === "ARC" ? "CLO" : s;
}

/* =========================
   Page
   ========================= */

export default function NcrNewOrEditPage() {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const q = useSearchParams();
  const idFromQuery = q.get("id");
  const idParam = params?.id ?? idFromQuery ?? null; // null => create mode
  const editing = !!idParam;

  /* Auth / Role */
  const [me, setMe] = useState<Me | null>(null);
  useEffect(() => {
    (async () => setMe(await getMe()))();
  }, []);
  const repId = me?.empID ?? undefined;
  const role = (me?.Position?.posDescription ?? "").toLowerCase();

  // ===== Testing bypasses: unlock UI & saving across stages =====
  const testingBypass = true; // TODO: set false later
  const canEditEngineering = true; // TODO: put real role check later
  const canEditPurchasing = true; // TODO: put real role check later

  /* Products */
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setLoadingProducts(true);
        setProductsError(null);
        const list = await api<Product[]>(
          "/api/products/options?fields=prodID,prodName&limit=2000",
          { signal: controller.signal as any }
        );
        setProducts(Array.isArray(list) ? list : []);
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          setProducts([]);
          setProductsError("Failed to load products.");
        }
      } finally {
        setLoadingProducts(false);
      }
    })();
    return () => controller.abort();
  }, []);

  /* If editing: load NCR, then linked forms in separate effects */
  const [ncr, setNcr] = useState<NCRForm | null>(null);
  const [qualityExisting, setQualityExisting] = useState<QualityForm | null>(
    null
  );
  const [engExisting, setEngExisting] = useState<EngineerForm | null>(null);
  const [purExisting, setPurExisting] = useState<PurchasingForm | null>(null);
  const [loadingRecord, setLoadingRecord] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load NCR
  useEffect(() => {
    if (!editing) return;
    const controller = new AbortController();
    (async () => {
      try {
        setLoadingRecord(true);
        setLoadError(null);
        const n = await api<NCRForm | null>(`/api/ncrForms/${idParam}`, {
          signal: controller.signal as any,
        });
        if (!n || controller.signal.aborted) return;
        setNcr(n);
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          setLoadError(e?.message || "Failed to load NCR record.");
        }
      } finally {
        if (!controller.signal.aborted) setLoadingRecord(false);
      }
    })();
    return () => controller.abort();
  }, [editing, idParam]);

  // Load linked Quality
  useEffect(() => {
    if (!editing || !ncr?.qualFormID) return;
    const controller = new AbortController();
    (async () => {
      try {
        const qf = await api<QualityForm | null>(
          `/api/qualityForms/${ncr.qualFormID}`,
          { signal: controller.signal as any }
        );
        if (!controller.signal.aborted && qf) setQualityExisting(qf);
      } catch {}
    })();
    return () => controller.abort();
  }, [editing, ncr?.qualFormID]);

  // Load linked Engineering
  useEffect(() => {
    if (!editing || !ncr?.engFormID) return;
    const controller = new AbortController();
    (async () => {
      try {
        const ef = await api<EngineerForm | null>(
          `/api/engineerForms/${ncr.engFormID}`,
          { signal: controller.signal as any }
        );
        if (!controller.signal.aborted && ef) setEngExisting(ef);
      } catch {}
    })();
    return () => controller.abort();
  }, [editing, ncr?.engFormID]);

  // Load linked Purchasing
  useEffect(() => {
    if (!editing || !ncr?.purFormID) return;
    const controller = new AbortController();
    (async () => {
      try {
        const pf = await api<PurchasingForm | null>(
          `/api/purchasingForms/${ncr.purFormID}`,
          { signal: controller.signal as any }
        );
        if (!controller.signal.aborted && pf) setPurExisting(pf);
      } catch {}
    })();
    return () => controller.abort();
  }, [editing, ncr?.purFormID]);

  /* --------- Form state (Quality + Engineering + Purchasing) --------- */

  // meta
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const currentStage = ncr ? normalizeStage(ncr.ncrStage) : "QUA";

  // quality
  const [prodID, setProdID] = useState<number | null>(null);
  const [qualDate, setQualDate] = useState<string>(today);
  const [qualItemDesc, setQualItemDesc] = useState("");
  const [qualIssueDesc, setQualIssueDesc] = useState("");
  const [qualSalesOrderNo, setQualSalesOrderNo] = useState<string>("");
  const [qualQtyReceived, setQualQtyReceived] = useState<string>("");
  const [qualQtyDefective, setQualQtyDefective] = useState<string>("");
  const [qualItemNonConforming, setQualItemNonConforming] = useState<
    0 | 1 | ""
  >("");

  // engineering preview/edit
  const [engDisposition, setEngDisposition] = useState("");
  const [engRootCause, setEngRootCause] = useState("");

  // purchasing preview/edit
  const [purDisposition, setPurDisposition] = useState("");
  const [purAction, setPurAction] = useState("");

  // Per-section seeding flags
  const seededMetaRef = useRef(false);
  const seededQualRef = useRef(false);
  const seededEngRef = useRef(false);
  const seededPurRef = useRef(false);

  // Seed meta (from NCR) once
  useEffect(() => {
    if (!editing || !ncr || seededMetaRef.current) return;
    setProdID(ncr.prodID ?? null);
    setQualDate(ncr.ncrIssueDate ?? today);
    seededMetaRef.current = true;
  }, [editing, ncr, today]);

  // Seed Quality once when qualityExisting arrives
  useEffect(() => {
    if (!editing || !qualityExisting || seededQualRef.current) return;
    setQualItemDesc(qualityExisting.qualItemDesc ?? "");
    setQualIssueDesc(qualityExisting.qualIssueDesc ?? "");
    setQualSalesOrderNo(
      qualityExisting.qualSalesOrderNo != null
        ? String(qualityExisting.qualSalesOrderNo)
        : ""
    );
    setQualQtyReceived(
      qualityExisting.qualQtyReceived != null
        ? String(qualityExisting.qualQtyReceived)
        : ""
    );
    setQualQtyDefective(
      qualityExisting.qualQtyDefective != null
        ? String(qualityExisting.qualQtyDefective)
        : ""
    );
    // Normalize nonconforming value to 0/1/""
    const raw = Number(qualityExisting.qualItemNonConforming ?? "");
    setQualItemNonConforming(raw === 0 ? 0 : raw === 1 ? 1 : raw > 1 ? 1 : "");
    seededQualRef.current = true;
  }, [editing, qualityExisting]);

  // Seed Engineering once
  useEffect(() => {
    if (!editing || !engExisting || seededEngRef.current) return;
    setEngDisposition(engExisting.engDisposition ?? "");
    setEngRootCause(engExisting.engRootCause ?? "");
    seededEngRef.current = true;
  }, [editing, engExisting]);

  // Seed Purchasing once
  useEffect(() => {
    if (!editing || !purExisting || seededPurRef.current) return;
    setPurDisposition(purExisting.purDisposition ?? "");
    setPurAction(purExisting.purAction ?? "");
    seededPurRef.current = true;
  }, [editing, purExisting]);

  /* ---- Derived completeness (gating only, not shown until submit) ---- */

  const qualityComplete = useMemo(() => {
    if (!prodID) return false;
    if (!qualItemDesc.trim()) return false;
    if (!qualIssueDesc.trim()) return false;
    if (!qualDate) return false;
    if (qualItemNonConforming === "") return false;
    if (qualQtyReceived && isNaN(Number(qualQtyReceived))) return false;
    if (qualQtyDefective && isNaN(Number(qualQtyDefective))) return false;
    return true;
  }, [
    prodID,
    qualItemDesc,
    qualIssueDesc,
    qualDate,
    qualItemNonConforming,
    qualQtyReceived,
    qualQtyDefective,
  ]);

  const engineeringComplete = !!engDisposition.trim() && !!engRootCause.trim();

  /* ---- Submit-time validation ---- */

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function validateOnSubmit(activeStage: NCRForm["ncrStage"]) {
    if (testingBypass) return {}; // no gating while you test
    const e: Record<string, string> = {};

    if (activeStage === "QUA") {
      if (!prodID) e.prodID = "Product is required.";
      if (!qualItemDesc.trim())
        e.qualItemDesc = "Item description is required.";
      if (!qualIssueDesc.trim())
        e.qualIssueDesc = "Issue/defect description is required.";
      if (!qualDate) e.qualDate = "Issue date is required.";
      if (qualItemNonConforming === "")
        e.qualItemNonConforming =
          "Please indicate if the item is marked nonconforming.";
      if (qualQtyReceived && isNaN(Number(qualQtyReceived)))
        e.qualQtyReceived = "Quantity received must be a number.";
      if (qualQtyDefective && isNaN(Number(qualQtyDefective)))
        e.qualQtyDefective = "Quantity defective must be a number.";
    }

    if (activeStage === "ENG") {
      if (!canEditEngineering)
        e._role = "You do not have permission to edit Engineering.";
      if (!qualityComplete) e._flow = "Complete Quality first.";
      if (!engDisposition.trim()) e.engDisposition = "Disposition is required.";
      if (!engRootCause.trim()) e.engRootCause = "Root cause is required.";
    }

    if (activeStage === "PUR") {
      if (!canEditPurchasing)
        e._role = "You do not have permission to edit Purchasing.";
      if (!qualityComplete) e._flow = "Complete Quality first.";
      if (!engineeringComplete) e._flow2 = "Complete Engineering first.";
      if (!purDisposition.trim()) e.purDisposition = "Disposition is required.";
      if (!purAction.trim()) e.purAction = "Action is required.";
    }

    return e;
  }

  /* ---- Submit handler (create or edit) ---- */

  async function handleSubmit() {
    // If creating, you always start at QUA. If editing, use the record's stage.
    const activeStage: NCRForm["ncrStage"] = editing ? currentStage : "QUA";

    setSubmitted(true);
    const e = validateOnSubmit(activeStage);
    setErrors(e);
    if (Object.keys(e).length > 0) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    try {
      /* ========================
       CREATE FLOW (QUA -> NCR)
       ======================== */
      if (!editing) {
        const qBody: Partial<QualityForm> = {
          qualItemDesc,
          qualIssueDesc,
          qualItemID: prodID ?? undefined,
          qualSalesOrderNo: qualSalesOrderNo
            ? Number(qualSalesOrderNo)
            : undefined,
          qualQtyReceived: qualQtyReceived
            ? Number(qualQtyReceived)
            : undefined,
          qualQtyDefective: qualQtyDefective
            ? Number(qualQtyDefective)
            : undefined,
          qualItemNonConforming:
            qualItemNonConforming === ""
              ? undefined
              : Number(qualItemNonConforming),
          qualRepID: repId,
          qualDate,
        };

        const quality = await api<QualityForm>("/api/qualityForms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(qBody),
        });

        const ncrBody: Partial<NCRForm> = {
          ncrIssueDate: qualDate,
          prodID: prodID ?? 0,
          qualFormID: quality.qualFormID,
          ncrStage: "QUA",
          ncrStatusID: 1,
        };

        await api<NCRForm>("/api/ncrForms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(ncrBody),
        });

        router.replace("/ncr/log");
        return;
      }

      /* ========================
       EDIT FLOW (stage-specific)
       ======================== */
      // ---- QUA ----
      if (currentStage === "QUA") {
        const qPatch: Partial<QualityForm> = {
          qualItemDesc,
          qualIssueDesc,
          qualItemID: prodID ?? undefined,
          qualSalesOrderNo: qualSalesOrderNo
            ? Number(qualSalesOrderNo)
            : undefined,
          qualQtyReceived: qualQtyReceived
            ? Number(qualQtyReceived)
            : undefined,
          qualQtyDefective: qualQtyDefective
            ? Number(qualQtyDefective)
            : undefined,
          qualItemNonConforming:
            qualItemNonConforming === ""
              ? undefined
              : Number(qualItemNonConforming),
          qualRepID: repId,
          qualDate,
        };

        if (ncr?.qualFormID) {
          // Update existing quality form
          await api(`/api/qualityForms/${ncr.qualFormID}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(qPatch),
          });
        } else {
          // Create new quality form and link it to the NCR
          const qNew = await api<QualityForm>("/api/qualityForms", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(qPatch),
          });
          await api(`/api/ncrForms/${ncr!.ncrFormID}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ qualFormID: qNew.qualFormID }),
          });
          setNcr((prev) =>
            prev ? { ...prev, qualFormID: qNew.qualFormID } : prev
          );
        }

        // (Optional) auto-advance to ENG after Quality save:
        // await advanceStage("ENG");
        // return;
      }

      // ---- ENG ----
      if (currentStage === "ENG") {
        if (!canEditEngineering) throw new Error("Not allowed");

        const engPatch: Partial<EngineerForm> = {
          engDisposition,
          engRootCause,
          engOwnerID: repId,
          engDate: today,
        };

        if (ncr?.engFormID) {
          // Update existing engineering form
          await api(`/api/engineerForms/${ncr.engFormID}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(engPatch),
          });
        } else {
          // Create new engineering form and link it to the NCR
          const eng = await api<EngineerForm>("/api/engineerForms", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(engPatch),
          });
          await api(`/api/ncrForms/${ncr!.ncrFormID}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ engFormID: eng.engFormID }),
          });
          setNcr((prev) =>
            prev ? { ...prev, engFormID: eng.engFormID } : prev
          );
        }

        // ✅ After Engineering save, advance to Purchasing
        await advanceStage("PUR");
        setErrors({});
        return; // stay on page and let UI show Purchasing
      }

      // ---- PUR ----
      if (currentStage === "PUR") {
        if (!canEditPurchasing) throw new Error("Not allowed");
        if (!ncr?.engFormID) throw new Error("Complete Engineering first");

        const purPatch: Partial<PurchasingForm> = {
          purDisposition,
          purAction,
          purOwnerID: repId,
          purDate: today,
        };

        if (ncr?.purFormID) {
          await api(`/api/purchasingForms/${ncr.purFormID}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(purPatch),
          });
        } else {
          const pur = await api<PurchasingForm>("/api/purchasingForms", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(purPatch),
          });
          await api(`/api/ncrForms/${ncr!.ncrFormID}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ purFormID: pur.purFormID }),
          });
          setNcr((prev) =>
            prev ? { ...prev, purFormID: pur.purFormID } : prev
          );
        }

        await closeNcr();

        // Done — back to the log (or stay if you prefer)
        router.replace("/ncr/log");
        return;
      }
    } catch (err: any) {
      setErrors({ _root: err?.message || "Failed to save. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  async function closeNcr() {
    if (!ncr) return;
    await api(`/api/ncrForms/${ncr.ncrFormID}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ncrStatusID: 2, ncrStage: "CLO" }),
    });
    setNcr((prev) =>
      prev ? { ...prev, ncrStatusID: 2 as 2, ncrStage: "CLO" } : prev
    );
  }

  async function advanceStage(stage: NCRForm["ncrStage"]) {
    if (!ncr) return;
    await api(`/api/ncrForms/${ncr.ncrFormID}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ncrStage: stage }),
    });
    // keep the UI in sync without refetching
    setNcr((prev) => (prev ? { ...prev, ncrStage: stage } : prev));

    // optionally scroll to the next section
    requestAnimationFrame(() =>
      document
        .getElementById(`section-${stage.toLowerCase()}`)
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
    );
  }

  /* =========================
     Render
     ========================= */

  const headerStage = stageLabel[ncr?.ncrStage ?? "QUA"]; // ARC will show “Closed”

  // UI locks (bypassed while testing)
  const roQuality = editing && currentStage !== "QUA" && !testingBypass;
  const roEng = currentStage !== "ENG" && !testingBypass;
  const roPur = currentStage !== "PUR" && !testingBypass;

  return (
    <div className="space-y-4">
      {loadError && (
        <div className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {loadError}
        </div>
      )}

      {/* Stepper */}
      <Stepper
        steps={[
          {
            label: "Quality",
            active: currentStage === "QUA",
            ready: editing ? stageIdx(currentStage) > stageIdx("QUA") : false,
          },
          {
            label: "Engineering",
            active: currentStage === "ENG",
            ready: editing ? stageIdx(currentStage) > stageIdx("ENG") : false,
          },
          {
            label: "Purchasing",
            active: currentStage === "PUR",
            ready: editing ? stageIdx(currentStage) > stageIdx("PUR") : false,
          },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">
          {editing ? "Edit NCR" : "Create NCR"}
        </h1>
        <div className="text-xs text-gray-600">
          Stage: <Pill>{headerStage}</Pill>
        </div>
      </div>

      {/* Meta */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Field label="NCR No." hint="Assigned on create" readOnly>
            <input
              className="input"
              placeholder={
                editing
                  ? ncr?.ncrFormNo || String(ncr?.ncrFormID || "")
                  : "Auto"
              }
              readOnly
            />
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
              readOnly={roQuality}
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
      <Card title="Quality" disabled={roQuality}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field
            label="Product"
            required
            error={submitted ? errors.prodID : undefined}
          >
            <SearchableSelect
              value={prodID}
              options={products.map((p) => ({
                value: p.prodID,
                label: p.prodName ?? `#${p.prodID}`,
              }))}
              loading={loadingProducts}
              error={productsError}
              onChange={(v) => setProdID(v == null ? null : Number(v))}
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
              readOnly={roQuality}
            />
          </Field>

          <Field
            label="Item Marked Nonconforming"
            required
            error={submitted ? errors.qualItemNonConforming : undefined}
          >
            <div
              className={clsx(
                "flex gap-3 items-center h-9",
                roQuality && "opacity-60"
              )}
            >
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="radio"
                  name="nonconforming"
                  checked={qualItemNonConforming === 1}
                  onChange={() => setQualItemNonConforming(1)}
                  disabled={roQuality}
                />
                Yes
              </label>
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="radio"
                  name="nonconforming"
                  checked={qualItemNonConforming === 0}
                  onChange={() => setQualItemNonConforming(0)}
                  disabled={roQuality}
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
              readOnly={roQuality}
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
              readOnly={roQuality}
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
              readOnly={roQuality}
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
              readOnly={roQuality}
            />
          </Field>
        </div>
      </Card>

      {/* Engineering */}
      <Card title="Engineering" disabled={roEng}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field
            label="Disposition"
            error={submitted ? errors.engDisposition : undefined}
          >
            <input
              className={inputCls(submitted && !!errors.engDisposition)}
              value={engDisposition}
              onChange={(e) => setEngDisposition(e.target.value)}
              placeholder="Use As Is / Repair / Rework / Scrap"
              readOnly={roEng || !canEditEngineering}
            />
          </Field>
          <Field
            label="Root Cause"
            error={submitted ? errors.engRootCause : undefined}
          >
            <input
              className={inputCls(submitted && !!errors.engRootCause)}
              value={engRootCause}
              onChange={(e) => setEngRootCause(e.target.value)}
              placeholder="Short root cause summary"
              readOnly={roEng || !canEditEngineering}
            />
          </Field>
        </div>
      </Card>

      {/* Purchasing */}
      <Card title="Purchasing" disabled={roPur}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field
            label="Disposition"
            error={submitted ? errors.purDisposition : undefined}
          >
            <input
              className={inputCls(submitted && !!errors.purDisposition)}
              value={purDisposition}
              onChange={(e) => setPurDisposition(e.target.value)}
              placeholder="Return to Supplier / Rework / Scrap / Defer"
              readOnly={roPur || !canEditPurchasing}
            />
          </Field>
          <Field
            label="Action"
            error={submitted ? errors.purAction : undefined}
          >
            <input
              className={inputCls(submitted && !!errors.purAction)}
              value={purAction}
              onChange={(e) => setPurAction(e.target.value)}
              placeholder="e.g. Issue credit"
              readOnly={roPur || !canEditPurchasing}
            />
          </Field>
        </div>
      </Card>

      {/* Submission errors */}
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
            {submitting ? "Saving…" : editing ? "Save Changes" : "Create NCR"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================
   UI bits
   ========================= */

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

function inputCls(hasError = false, isTextarea = false) {
  return clsx(
    "w-full rounded border px-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 bg-white",
    isTextarea ? "py-2 min-h-[84px]" : "h-9",
    hasError ? "border-red-300" : "border-gray-300"
  );
}
