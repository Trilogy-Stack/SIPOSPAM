// src/app/superadmin/nomor-nasional/page.jsx
"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import NomorNasionalTable from "@/components/superadmin/NomorNasionalTable";
import NomorNasionalFormModal from "@/components/superadmin/NomorNasionalFormModal";
import Modal from "@/components/shared/ui/Modal";
import { mockNomorNasional } from "@/mocks/nomorNasional";

export default function NomorNasionalPage() {
  const [data, setData] = useState(mockNomorNasional);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

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

  // Klik ikon hapus: simpan dulu item-nya, hapus baru dijalankan setelah dikonfirmasi
  function requestDelete(id) {
    setDeleteTarget(data.find((d) => d.id === id) ?? null);
  }

  function confirmDelete() {
    if (deleteTarget) handleDelete(deleteTarget.id);
    setDeleteTarget(null);
  }

  return (
    <div className="min-h-screen bg-[#E9ECF6] px-6 py-6 font-poppins">
      <div className="mx-auto min-h-[600px] w-full max-w-7xl rounded-xl bg-white px-12 pb-10 pt-8 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Nomor Nasional</h1>
          <button
            onClick={() => { setEditData(null); setModalOpen(true); }}
            className="flex items-center gap-2 rounded-md bg-[#1BA3BA] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#158aa0]"
          >
            <Plus size={16} /> Tambah Nomor Nasional
          </button>
        </div>

        <div className="mb-6 mt-4 h-[3px] rounded bg-gray-300" />

        <NomorNasionalTable
          data={data}
          onEdit={(item) => { setEditData(item); setModalOpen(true); }}
          onDelete={requestDelete}
        />
      </div>

      <NomorNasionalFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        editData={editData}
      />

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Hapus Nomor Nasional"
      >
        <p className="mb-6 text-sm leading-relaxed text-gray-600">
          Yakin ingin menghapus nomor{" "}
          <span className="font-semibold text-gray-900">{deleteTarget?.nama}</span>
          {deleteTarget?.nomor ? ` (${deleteTarget.nomor})` : ""}? Tindakan ini
          tidak dapat dibatalkan.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setDeleteTarget(null)}
            className="rounded-md border border-gray-300 px-5 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            onClick={confirmDelete}
            className="rounded-md bg-red-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            Hapus
          </button>
        </div>
      </Modal>
    </div>
  );
}