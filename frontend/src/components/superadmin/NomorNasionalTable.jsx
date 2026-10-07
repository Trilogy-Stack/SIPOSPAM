// src/components/superadmin/NomorNasionalTable.jsx
import { Pencil, Phone, Trash2 } from "lucide-react";

export default function NomorNasionalTable({ data, onEdit, onDelete }) {
  return (
    <div className="flex flex-col gap-4">
      {data.map((n) => (
        <div
          key={n.id}
          className="flex items-center justify-between rounded-lg bg-[#F8F8FA] px-8 py-4 shadow-md"
        >
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white shadow-sm">
              {n.logoUrl ? (
                <img src={n.logoUrl} alt={n.nama} className="h-10 w-10 object-contain" />
              ) : (
                <Phone size={22} className="text-gray-400" />
              )}
            </div>
            <div>
              <p className="text-2xl font-bold uppercase text-gray-900">{n.nama}</p>
              <p className="mt-1 flex items-center gap-2 text-sm text-gray-900">
                <Phone size={18} /> {n.nomor}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => onEdit(n)}
              aria-label={`Edit ${n.nama}`}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1BA3BA] text-white transition-colors hover:bg-[#158aa0]"
            >
              <Pencil size={20} />
            </button>
            <button
              onClick={() => onDelete(n.id)}
              aria-label={`Hapus ${n.nama}`}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1BA3BA] text-white transition-colors hover:bg-[#158aa0]"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}