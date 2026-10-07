// src/app/superadmin/kelola-admin/page.jsx
"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import AdminTable from "@/components/superadmin/AdminTable";
import AdminFormModal from "@/components/superadmin/AdminFormModal";
import EmptyState from "@/components/superadmin/EmptyState";
import Modal from "@/components/shared/ui/Modal";
import { mockAdminList } from "@/mocks/admin";

export default function KelolaAdminPage() {
  const [admins, setAdmins] = useState(mockAdminList);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // admin yang sedang diedit, null = tambah baru
  const [deleteTarget, setDeleteTarget] = useState(null);

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(admin) {
    setEditing(admin);
    setModalOpen(true);
  }

  function closeForm() {
    setModalOpen(false);
    setEditing(null);
  }

  function handleSave(data) {
    // sementara pakai state lokal — nanti diganti createAdmin / updateAdmin dari api.js
    if (editing) {
      setAdmins((prev) =>
        prev.map((a) =>
          a.id === editing.id
            ? { ...a, email: data.email, wilayah: { ...a.wilayah, nama: data.nama_wilayah } }
            : a
        )
      );
    } else {
      setAdmins((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          email: data.email,
          aktif: true,
          wilayah: { id: "new", nama: data.nama_wilayah },
        },
      ]);
    }
  }

  function handleConfirmDelete() {
    // sementara hapus dari state lokal — nanti diganti deleteAdmin(id) dari api.js
    setAdmins((prev) => prev.filter((a) => a.id !== deleteTarget.id));
    setDeleteTarget(null);
  }

  return (
    <div className="min-h-screen bg-[#E9ECF6] px-6 py-6 font-poppins">
      <div className="mx-auto min-h-[600px] w-full max-w-7xl rounded-xl bg-white px-12 pb-10 pt-8 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Kelola Admin</h1>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 rounded-md bg-[#1BA3BA] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#158aa0]"
          >
            <Plus size={16} /> Tambah Admin
          </button>
        </div>

        <div className="mb-6 mt-4 h-[3px] rounded bg-gray-300" />

        {admins.length === 0 ? (
          <EmptyState />
        ) : (
          <AdminTable admins={admins} onEdit={openEdit} onDelete={setDeleteTarget} />
        )}
      </div>

      <AdminFormModal
        open={modalOpen}
        onClose={closeForm}
        onSave={handleSave}
        initialData={editing}
      />

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Hapus Akun Admin"
      >
        <p className="mb-6 text-sm leading-relaxed text-gray-600">
          Yakin ingin menghapus akun admin{" "}
          <span className="font-semibold text-gray-900">{deleteTarget?.wilayah?.nama}</span>?
          Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setDeleteTarget(null)}
            className="rounded-md border border-gray-300 px-5 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            onClick={handleConfirmDelete}
            className="rounded-md bg-red-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            Hapus
          </button>
        </div>
      </Modal>
    </div>
  );
}