// src/components/superadmin/NomorNasionalFormModal.jsx
"use client";
import { useState, useEffect } from "react";
import Modal from "@/components/shared/ui/Modal";

export default function NomorNasionalFormModal({ open, onClose, onSave, editData }) {
  const [nama, setNama] = useState("");
  const [nomor, setNomor] = useState("");

  useEffect(() => {
    setNama(editData?.nama || "");
    setNomor(editData?.nomor || "");
  }, [editData, open]);

  function handleSubmit(e) {
    e.preventDefault();
    onSave({ id: editData?.id, nama, nomor });
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={editData ? "Edit Nomor" : "Tambah Nomor Nasional"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="block text-sm mb-1">Nama Instansi</label>
          <input required value={nama} onChange={(e) => setNama(e.target.value)}
            className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Nomor</label>
          <input required value={nomor} onChange={(e) => setNomor(e.target.value)}
            className="w-full border rounded px-3 py-2" />
        </div>
        <button type="submit" className="bg-blue-900 text-white rounded px-4 py-2 mt-2">Simpan</button>
      </form>
    </Modal>
  );
}