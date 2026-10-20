// src/components/superadmin/NomorNasionalFormModal.jsx
"use client";
import { useState, useEffect, useRef } from "react";
import Modal, { setUnsavedHandler } from "@/components/shared/ui/Modal";
import ConfirmDialog from "@/components/shared/ui/ConfirmDialog";
import ImageUploadInput from "@/components/shared/ui/ImageUploadInput";

const labelClass = "mb-1.5 block text-sm font-medium text-gray-700";
const inputClass =
  "w-full rounded-md border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-colors focus:border-[#1BA3BA] focus:ring-1 focus:ring-[#1BA3BA]";

export default function NomorNasionalFormModal({ open, onClose, onSave, editData }) {
  const [nama, setNama] = useState("");
  const [nomor, setNomor] = useState("");
  const [logoUrl, setLogoUrl] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const pendingRef = useRef(null); // aksi tertunda (mis. pindah menu) sampai pengguna memutuskan

  useEffect(() => {
    setNama(editData?.nama || "");
    setNomor(editData?.nomor || "");
    setLogoUrl(editData?.logoUrl || null);
    setLogoFile(null);
    setError("");
    setSaving(false);
    setConfirmOpen(false);
    pendingRef.current = null;
  }, [editData, open]);

  // Ada isian yang berubah dibanding saat dialog dibuka?
  const dirty =
    nama !== (editData?.nama || "") ||
    nomor !== (editData?.nomor || "") ||
    logoUrl !== (editData?.logoUrl || null) ||
    logoFile !== null;

  // Selama ada perubahan, daftarkan penjaga: klik menu navbar akan minta konfirmasi dulu
  useEffect(() => {
    if (!open || !dirty || saving) return;
    setUnsavedHandler((proceed) => {
      pendingRef.current = proceed;
      setConfirmOpen(true);
    });
    return () => setUnsavedHandler(null);
  }, [open, dirty, saving]);

  // Klik area luar / Batal / Esc
  function requestClose() {
    if (saving) return;
    if (dirty) {
      setConfirmOpen(true);
      return;
    }
    onClose();
  }

  function keepEditing() {
    pendingRef.current = null;
    setConfirmOpen(false);
  }

  function discardChanges() {
    const next = pendingRef.current;
    pendingRef.current = null;
    setConfirmOpen(false);
    onClose();
    next?.(); // lanjutkan pindah menu kalau sebelumnya ada yang tertunda
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onSave({
        id: editData?.id,
        nama: nama.trim(),
        nomor: nomor.trim(),
        logoUrl,
        logoFile,
      });
      onClose(); // hanya menutup kalau berhasil
    } catch (err) {
      setError(err.message || "Gagal menyimpan data");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Modal
        open={open}
        // Esc diabaikan selagi dialog konfirmasi terbuka
        onClose={confirmOpen ? undefined : requestClose}
        title={editData ? "Edit Nomor" : "Tambah Nomor Nasional"}
      >
        <form onSubmit={handleSubmit} autoComplete="off" className="flex flex-col gap-4">
          <div>
            <label className={labelClass}>Ikon Instansi</label>
            <ImageUploadInput
              value={logoUrl}
              onChange={(file, previewUrl) => { setLogoFile(file); setLogoUrl(previewUrl); }}
            />
            <p className="mt-1.5 text-xs text-gray-400">JPG, PNG, atau WebP, maksimal 3 MB.</p>
          </div>
          <div>
            <label className={labelClass}>Nama Instansi</label>
            <input
              required
              maxLength={150}
              autoComplete="off"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Mis. Layanan Polisi"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Nomor</label>
            <input
              required
              maxLength={25}
              inputMode="tel"
              autoComplete="off"
              value={nomor}
              onChange={(e) => setNomor(e.target.value)}
              placeholder="Mis. 110"
              className={inputClass}
            />
            <p className="mt-1.5 text-xs text-gray-400">
              Hanya angka, +, -, spasi, dan tanda kurung.
            </p>
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-center text-xs text-red-600">
              {error}
            </div>
          )}

          <div className="mt-3 flex justify-center gap-3">
            <button
              type="button"
              onClick={requestClose}
              disabled={saving}
              className="min-w-[120px] rounded-md border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="min-w-[120px] rounded-md bg-[#0F5BBA] px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#0c4a99] disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={open && confirmOpen}
        onClose={keepEditing}
        onConfirm={discardChanges}
        title="Buang perubahan?"
        confirmLabel="Buang perubahan"
        cancelLabel="Lanjut mengedit"
      >
        Perubahan yang belum disimpan akan hilang.
      </ConfirmDialog>
    </>
  );
}