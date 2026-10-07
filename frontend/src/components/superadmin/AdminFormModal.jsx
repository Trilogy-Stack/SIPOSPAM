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
  const [namaWilayah, setNamaWilayah] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Isi form saat dibuka: data admin kalau edit, kosong kalau tambah baru
  useEffect(() => {
    if (open) {
      setNamaWilayah(initialData?.wilayah?.nama ?? "");
      setEmail(initialData?.email ?? "");
      setPassword("");
    }
  }, [open, initialData]);

  function handleSubmit(e) {
    e.preventDefault();
    onSave({ nama_wilayah: namaWilayah, email, password });
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit Akun Admin" : "Tambah Akun Admin"}>
      <form onSubmit={handleSubmit} autoComplete="off" className="flex flex-col gap-4">
        <div>
          <label className={labelClass}>Nama Wilayah</label>
          <input
            required
            name="nama-wilayah"
            autoComplete="off"
            value={namaWilayah}
            onChange={(e) => setNamaWilayah(e.target.value)}
            placeholder="Mis. POLRES DEMAK"
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
        <div>
          <label className={labelClass}>Password</label>
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={!isEdit}
            autoComplete="new-password"
            placeholder={isEdit ? "Kosongkan jika tidak diubah" : "************"}
          />
        </div>
        <button
          type="submit"
          className="mx-auto mt-3 rounded-md bg-[#0F5BBA] px-10 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#0c4a99]"
        >
          Simpan
        </button>
      </form>
    </Modal>
  );
}