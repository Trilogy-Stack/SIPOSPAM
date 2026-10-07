"use client";

export default function ConfirmDialog({
  open,
  message = "Apakah anda yakin ingin menghapus data ini?",
  onCancel,
  onConfirm,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-md shadow-lg px-10 py-8 text-center max-w-sm w-full">
        <p className="text-base font-medium text-slate-900 leading-snug">{message}</p>
        <div className="flex justify-center gap-4 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="bg-[#1a9fb8] hover:bg-[#158aa0] transition text-white text-xs font-medium px-6 py-1.5 rounded"
          >
            Tidak
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="bg-[#1a9fb8] hover:bg-[#158aa0] transition text-white text-xs font-medium px-7 py-1.5 rounded"
          >
            Ya
          </button>
        </div>
      </div>
    </div>
  );
}