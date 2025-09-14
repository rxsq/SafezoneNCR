"use client";

import Modal from "./Modal";

type ConfirmDialogProps = {
  open: boolean;
  title?: string;
  message?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  busy?: boolean;
};

export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  busy = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={busy ? () => {} : onCancel}
      title={title}
      footer={
        <div className="flex items-center justify-end gap-2">
          <button
            className="px-3 py-1.5 border rounded disabled:opacity-50"
            onClick={onCancel}
            disabled={busy}
          >
            {cancelText}
          </button>
          <button
            className="px-3 py-1.5 rounded bg-black text-white disabled:opacity-50"
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? "Working…" : confirmText}
          </button>
        </div>
      }
    >
      <div className="text-sm text-gray-700">{message}</div>
    </Modal>
  );
}
