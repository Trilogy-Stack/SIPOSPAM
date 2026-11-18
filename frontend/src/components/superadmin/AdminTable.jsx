import { Mail, Pencil, RotateCcw, Trash2 } from "lucide-react";

export default function AdminTable({ admins, onEdit, onDelete, onReactivate, onDeletePermanent, busyId }) {
  return (
    <div className="flex flex-col gap-3">
      {admins.map((a) => {
        const inactive = a.is_active === false;
        return (
          <div
            key={a.id}
            className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border px-3 py-3 sm:px-6 sm:py-4 shadow-sm transition-shadow hover:shadow-md ${ 
              inactive ? "border-gray-200 bg-gray-100/70" : "border-gray-100 bg-[#F8F8FA]"
            }`}
          >
            <div className="min-w-0 flex-1 basis-48">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <p className={`truncate text-base font-semibold uppercase tracking-wide ${
                    inactive ? "text-gray-400" : "text-gray-900"
                  }`}
                >
                  {a.name}
                </p>
                {a.region && (
                  <span className="shrink-0 rounded-full bg-[#1BA3BA]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#158aa0]">
                    {a.region}
                  </span>
                )}
                {inactive && (
                  <span className="shrink-0 rounded-full bg-gray-200 px-2.5 py-0.5 text-[11px] font-medium text-gray-600">
                    Nonaktif
                  </span>
                )}
              </div>
              <p
                className={`mt-1 flex items-center gap-2 text-sm ${
                  inactive ? "text-gray-400" : "text-gray-500"
                }`}
              >
                <Mail size={15} className="shrink-0" />
                <span className="truncate">{a.email}</span>
              </p>
            </div>

            <div className="flex shrink-0 gap-2">
              {inactive ? (
                <>
                  <button
                    onClick={() => onReactivate(a)}
                    disabled={busyId === a.id}
                    className="flex items-center gap-2 rounded-md border border-[#1BA3BA] px-3.5 py-2 text-sm font-medium text-[#1BA3BA] transition-colors hover:bg-[#1BA3BA] hover:text-white disabled:opacity-50"
                  >
                    <RotateCcw size={15} />
                    {busyId === a.id ? "Memproses..." : "Aktifkan kembali"}
                  </button>
                  <button
                    onClick={() => onDeletePermanent?.(a)}
                    aria-label={`Hapus permanen ${a.name}`}
                    title="Hapus permanen"
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-red-300 text-red-600 transition-colors hover:bg-red-600 hover:text-white"
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onEdit(a)}
                    aria-label={`Edit ${a.name}`}
                    title="Edit"
                    className="flex h-9 w-9 items-center justify-center rounded-md bg-[#1BA3BA] text-white shadow-sm transition-colors hover:bg-[#158aa0]"
                  >
                    <Pencil size={17} />
                  </button>
                  <button
                    onClick={() => onDelete(a)}
                    aria-label={`Nonaktifkan ${a.name}`}
                    title="Nonaktifkan"
                    className="flex h-9 w-9 items-center justify-center rounded-md bg-[#1BA3BA] text-white shadow-sm transition-colors hover:bg-red-600"
                  >
                    <Trash2 size={17} />
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}