// src/app/superadmin/kelola-admin/page.jsx
"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import AdminTable from "@/components/superadmin/AdminTable";
import AdminFormModal from "@/components/superadmin/AdminFormModal";
import EmptyState from "@/components/superadmin/EmptyState";
import { mockAdminList } from "@/mocks/admin";

export default function KelolaAdminPage() {
  const [admins, setAdmins] = useState(mockAdminList);
  const [modalOpen, setModalOpen] = useState(false);

  function handleSave(data) {
    // sementara tambah ke state lokal — nanti diganti createAdmin(data) dari api.js
    setAdmins((prev) => [
      ...prev,
      { id: String(prev.length + 1), email: data.email, aktif: true, wilayah: { id: "new", nama: data.nama_wilayah } },
    ]);
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Kelola Admin</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1 bg-blue-900 text-white rounded px-3 py-2 text-sm"
        >
          <Plus size={16} /> Tambah Admin
        </button>
      </div>

      {admins.length === 0 ? <EmptyState /> : <AdminTable admins={admins} />}

      <AdminFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} />
    </div>
  );
}