// src/components/superadmin/NomorNasionalTable.jsx
"use client";
import { useState } from "react";
import { Pencil, Phone, Trash2 } from "lucide-react";

// Kotak ikon instansi; kalau gambar kosong atau gagal dimuat, tampil ikon telepon
function InstansiIcon({ src, alt }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
      {src && !failed ? (
        <img
          src={src}
          alt={alt}
          onError={() => setFailed(true)}
          className="h-8 w-8 object-contain"
        />
      ) : (
        <Phone size={20} className="text-gray-300" />
      )}
    </div>
  );
}

export default function NomorNasionalTable({ data, onEdit, onDelete }) {
  return (
    <div className="flex flex-col gap-3">
      {data.map((n) => (
        <div
          key={n.id}
          className="flex items-center justify-between rounded-lg border border-gray-100 bg-[#F8F8FA] px-6 py-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex min-w-0 items-center gap-4">
            <InstansiIcon src={n.logoUrl} alt={n.nama} />
            <div className="min-w-0">
              <p className="truncate text-base font-semibold uppercase tracking-wide text-gray-900">
                {n.nama}
              </p>
              <p className="mt-0.5 flex items-center gap-2 text-sm text-gray-500">
                <Phone size={15} className="shrink-0" />
                {n.nomor}
              </p>
            </div>
          </div>

          <div className="ml-4 flex shrink-0 gap-2">
            <button
              onClick={() => onEdit(n)}
              aria-label={`Edit ${n.nama}`}
              title="Edit"
              className="flex h-9 w-9 items-center justify-center rounded-md bg-[#1BA3BA] text-white shadow-sm transition-colors hover:bg-[#158aa0]"
            >
              <Pencil size={17} />
            </button>
            <button
              onClick={() => onDelete(n.id)}
              aria-label={`Hapus ${n.nama}`}
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