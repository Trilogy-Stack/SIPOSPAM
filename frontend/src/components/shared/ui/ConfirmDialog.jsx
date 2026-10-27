// src/components/shared/ui/ConfirmDialog.jsx
"use client";
// import { AlertTriangle } from "lucide-react";
import Modal from "./Modal";

// Dialog konfirmasi aksi berisiko (hapus / nonaktifkan). Semua isi rata tengah.
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  children,
  confirmLabel = "Ya, lanjutkan",
  cancelLabel = "Batal",
  loading = false,
  error = "",
  confirmDisabled = false,
  // icon: Icon = AlertTriangle,
}) {
  return (
    <Modal open={open} onClose={loading ? undefined : onClose} title={title}>
      <div className="flex flex-col items-center text-center">
        {/* <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500 ring-8 ring-red-50/60">
          <Icon size={22} />
        </span> */}

        <div className="text-sm leading-relaxed text-gray-600">{children}</div>

        {error && (
          <div className="mt-4 w-full rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-600">
            {error}
          </div>
        )}

        <div className="mt-6 flex w-full justify-flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="min-w-[120px] flex-1 rounded-md border border-gray-300 px-5 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading || confirmDisabled}
            className="min-w-[120px] flex-1 rounded-md bg-[#d9444a] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#c23a40] disabled:opacity-50"
          >
            {loading ? "Memproses..." : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}