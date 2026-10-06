// src/components/superadmin/AdminFormModal.jsx
"use client";
import { useState } from "react";
import Modal from "@/components/shared/ui/Modal";
import PasswordInput from "@/components/shared/ui/PasswordInput";

export default function AdminFormModal({ open, onClose, onSave }) {
  const [namaWilayah, setNamaWilayah] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    onSave({ nama_wilayah: namaWilayah, email, password });
    setNamaWilayah(""); setEmail(""); setPassword("");
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Tambah Akun Admin">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="block text-sm mb-1">Nama Wilayah</label>
          <input required value={namaWilayah} onChange={(e) => setNamaWilayah(e.target.value)}
            placeholder="POLRES DEMAK" className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="polresdemak@gmail.com" className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button type="submit" className="bg-blue-900 text-white rounded px-4 py-2 mt-2">
          Simpan
        </button>
      </form>
    </Modal>
  );
}