// src/components/superadmin/NomorNasionalFormModal.jsx
"use client";
import { useState, useEffect } from "react";
import Modal from "@/components/shared/ui/Modal";
import ImageUploadInput from "@/components/shared/ui/ImageUploadInput";

const inputClass =
  "w-full rounded border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-300 outline-none focus:border-[#1BA3BA]";

export default function NomorNasionalFormModal({ open, onClose, onSave, editData }) {
  const [nama, setNama] = useState("");
  const [nomor, setNomor] = useState("");
  const [logoUrl, setLogoUrl] = useState(null);
  const [logoFile, setLogoFile] = useState(null);

  useEffect(() => {
    setNama(editData?.nama || "");
    setNomor(editData?.nomor || "");
    setLogoUrl(editData?.logoUrl || null);
    setLogoFile(null);
  }, [editData, open]);

  function handleSubmit(e) {
    e.preventDefault();
    onSave({ id: editData?.id, nama, nomor, logoUrl, logoFile });
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={editData ? "Edit Nomor" : "Tambah Nomor Nasional"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-base text-gray-900">Ikon Instansi</label>
          <ImageUploadInput
            value={logoUrl}
            onChange={(file, previewUrl) => { setLogoFile(file); setLogoUrl(previewUrl); }}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-base text-gray-900">Nama Instansi</label>
          <input
            required
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Mis. Kepolisian"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-base text-gray-900">Nomor</label>
          <input
            required
            value={nomor}
            onChange={(e) => setNomor(e.target.value)}
            placeholder="Mis. 110"
            className={inputClass}
          />
        </div>
        <button
          type="submit"
          className="mx-auto mt-2 rounded bg-[#0F5BBA] px-10 py-2.5 text-base font-medium text-white transition-colors hover:bg-[#0c4a99]"
        >
          Simpan
        </button>
      </form>
    </Modal>
  );
}