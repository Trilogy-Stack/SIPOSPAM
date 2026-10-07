import { Mail, Pencil, Trash2 } from "lucide-react";

export default function AdminTable({ admins, onEdit, onDelete }) {
  return (
    <div className="flex flex-col gap-4">
      {admins.map((a) => (
        <div
          key={a.id}
          className="flex items-center justify-between rounded-lg bg-[#F8F8FA] px-8 py-4 shadow-md"
        >
          <div>
            <p className="text-2xl font-bold uppercase text-gray-900">{a.wilayah?.nama}</p>
            <p className="mt-1 flex items-center gap-2 text-sm text-gray-900">
              <Mail size={18} /> {a.email}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => onEdit(a)}
              aria-label={`Edit ${a.wilayah?.nama}`}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1BA3BA] text-white transition-colors hover:bg-[#158aa0]"
            >
              <Pencil size={20} />
            </button>
            <button
              onClick={() => onDelete(a)}
              aria-label={`Hapus ${a.wilayah?.nama}`}
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