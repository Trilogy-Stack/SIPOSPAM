// src/components/superadmin/AdminTable.jsx
import { Mail, Pencil, Trash2 } from "lucide-react";

export default function AdminTable({ admins, onEdit, onDelete }) {
  return (
    <div className="flex flex-col gap-3">
      {admins.map((a) => (
        <div
          key={a.id}
          className="flex items-center justify-between rounded-lg border border-gray-100 bg-[#F8F8FA] px-6 py-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="min-w-0">
            <p className="truncate text-base font-semibold uppercase tracking-wide text-gray-900">
              {a.wilayah?.nama}
            </p>
            <p className="mt-1 flex items-center gap-2 text-sm text-gray-500">
              <Mail size={15} className="shrink-0" />
              <span className="truncate">{a.email}</span>
            </p>
          </div>
          <div className="ml-4 flex shrink-0 gap-2">
            <button
              onClick={() => onEdit(a)}
              aria-label={`Edit ${a.wilayah?.nama}`}
              title="Edit"
              className="flex h-9 w-9 items-center justify-center rounded-md bg-[#1BA3BA] text-white shadow-sm transition-colors hover:bg-[#158aa0]"
            >
              <Pencil size={17} />
            </button>
            <button
              onClick={() => onDelete(a)}
              aria-label={`Hapus ${a.wilayah?.nama}`}
              title="Hapus"
              className="flex h-9 w-9 items-center justify-center rounded-md bg-[#1BA3BA] text-white shadow-sm transition-colors hover:bg-red-600"
            >
              <Trash2 size={17} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}