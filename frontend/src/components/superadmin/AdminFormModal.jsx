// src/components/superadmin/AdminFormModal.jsx
"use client";
import { useEffect, useState } from "react";
import Modal from "@/components/shared/ui/Modal";
import PasswordInput from "@/components/shared/ui/PasswordInput";

const labelClass = "mb-1.5 block text-sm font-medium text-gray-700";
const inputClass =
  "w-full rounded-md border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-colors focus:border-[#1BA3BA] focus:ring-1 focus:ring-[#1BA3BA]";

export default function AdminFormModal({ open, onClose, onSave, initialData = null }) {
  const isEdit = !!initialData;
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Isi form saat dibuka: data admin kalau edit, kosong kalau tambah baru
  useEffect(() => {
    if (open) {
      setName(initialData?.name ?? "");
      setRegion(initialData?.region ?? "");
      setEmail(initialData?.email ?? "");
      setPassword("");
      setError("");
      setSaving(false);
    }
  }, [open, initialData]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onSave({
        name: name.trim(),
        region: region.trim(),
        email: email.trim(),
        password,
      });
      onClose(); // hanya menutup kalau berhasil
    } catch (err) {
      setError(err.message || "Gagal menyimpan data");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit Akun Admin" : "Tambah Akun Admin"}>
      <form onSubmit={handleSubmit} autoComplete="off" className="flex flex-col gap-4">
        <div>
          <label className={labelClass}>Nama Polres</label>
          <input
            required
            name="nama-polres"
            autoComplete="off"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Mis. Polres Demak"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Wilayah</label>
          <input
            required
            name="wilayah"
            autoComplete="off"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="Mis. Kabupaten Demak"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input
            type="email"
            required
            name="admin-email"
            autoComplete="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Mis. polresdemak@gmail.com"
            className={inputClass}
          />
        </div>

        {/* Password hanya saat tambah baru: BE tidak menerima perubahan password lewat edit */}
        {!isEdit && (
          <div>
            <label className={labelClass}>Password</label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="************"
            />
            <p className="mt-1.5 text-xs text-gray-400">
              Minimal 8 karakter. Admin diminta menggantinya saat login pertama.
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-center text-xs text-red-600">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="mx-auto mt-3 rounded-md bg-[#0F5BBA] px-10 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#0c4a99] disabled:opacity-50"
        >
          {saving ? "Menyimpan..." : "Simpan"}
        </button>
      </form>
    </Modal>
  );
}