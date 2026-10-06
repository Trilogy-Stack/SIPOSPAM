// src/app/superadmin/nomor-nasional/page.jsx
"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import NomorNasionalTable from "@/components/superadmin/NomorNasionalTable";
import NomorNasionalFormModal from "@/components/superadmin/NomorNasionalFormModal";
import { mockNomorNasional } from "@/mocks/nomorNasional";

export default function NomorNasionalPage() {
  const [data, setData] = useState(mockNomorNasional);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  function handleSave(item) {
    if (item.id) {
      setData((prev) => prev.map((d) => (d.id === item.id ? { ...d, ...item } : d)));
    } else {
      setData((prev) => [...prev, { ...item, id: String(prev.length + 1), urutan: prev.length + 1, aktif: true }]);
    }
  }

  function handleDelete(id) {
    setData((prev) => prev.filter((d) => d.id !== id));
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Nomor Nasional</h1>
        <button
          onClick={() => { setEditData(null); setModalOpen(true); }}
          className="flex items-center gap-1 bg-blue-900 text-white rounded px-3 py-2 text-sm"
        >
          <Plus size={16} /> Tambah
        </button>
      </div>

      <NomorNasionalTable
        data={data}
        onEdit={(item) => { setEditData(item); setModalOpen(true); }}
        onDelete={handleDelete}
      />

      <NomorNasionalFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        editData={editData}
      />
    </div>
  );
}