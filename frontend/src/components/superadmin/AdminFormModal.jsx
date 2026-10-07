"use client";
import { useEffect, useState } from "react";
import Modal from "@/components/shared/ui/Modal";
import PasswordInput from "@/components/shared/ui/PasswordInput";

const inputClass =
  "w-full rounded border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-300 outline-none focus:border-[#1BA3BA]";

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
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-base text-gray-900">Nama Wilayah</label>
          <input
            required
            value={namaWilayah}
            onChange={(e) => setNamaWilayah(e.target.value)}
            placeholder="Mis. POLRES DEMAK"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-base text-gray-900">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Mis. polresdemak@gmail.com"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-base text-gray-900">Password</label>
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={!isEdit}
            placeholder={isEdit ? "Kosongkan jika tidak diubah" : "************"}
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