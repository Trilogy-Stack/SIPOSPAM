"use client";
import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import NomorNasionalTable from "@/components/superadmin/NomorNasionalTable";
import NomorNasionalFormModal from "@/components/superadmin/NomorNasionalFormModal";
import EmptyState from "@/components/superadmin/EmptyState";
import ConfirmDialog from "@/components/shared/ui/ConfirmDialog";
import {
  getNomorNasionalAll,
  createNomorNasional,
  updateNomorNasional,
  deleteNomorNasional,
} from "@/lib/api";
import { uploadNomorIcon } from "@/lib/uploadIcon";
import { useToast, ToastContainer } from "@/components/shared/ui/Toast";

const fromApi = (r) => ({
  id: r.id,
  nama: r.agency_name,
  nomor: r.telephone,
  logoUrl: r.icon,
});

export default function NomorNasionalPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const { toasts, toast, dismiss } = useToast(); 

  const load = useCallback(async () => {
    setLoadError("");
    try {
      const rows = await getNomorNasionalAll();
      setData((rows ?? []).map(fromApi));
    } catch (err) {
      setLoadError(err.message || "Gagal memuat nomor nasional");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openAdd() {
    setEditData(null);
    setModalOpen(true);
  }

  function openEdit(item) {
    setEditData(item);
    setModalOpen(true);
  }

  function closeForm() {
    setModalOpen(false);
  }

  function closeDelete() {
    setDeleteTarget(null);
    setDeleteError("");
  }

  async function handleSave(item) {
    const iconUrl = item.logoFile ? await uploadNomorIcon(item.logoFile) : null;

    if (item.id) {
      const lama = data.find((d) => d.id === item.id);
      const changes = {};
      if (item.nama !== lama?.nama) changes.agency_name = item.nama;
      if (item.nomor !== lama?.nomor) changes.telephone = item.nomor;
      if (iconUrl) changes.icon = iconUrl;
      if (Object.keys(changes).length > 0) await updateNomorNasional(item.id, changes);
    } else {
      await createNomorNasional({
        agency_name: item.nama,
        telephone: item.nomor,
        ...(iconUrl ? { icon: iconUrl } : {}),
      });
    }

    await load();
    toast.success( 
      item.id ? `Nomor "${item.nama}" diperbarui.` : `Nomor "${item.nama}" ditambahkan.`
    );
  }

  async function handleConfirmDelete() {
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteNomorNasional(deleteTarget.id);
      toast.success(`Nomor "${deleteTarget.nama}" dihapus.`);
      closeDelete();
      await load();
    } catch (err) {
      setDeleteError(err.message || "Gagal menghapus nomor");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#E9ECF6] px-6 py-6 font-poppins">
      <div className="mx-auto min-h-[600px] w-full max-w-7xl rounded-xl bg-white px-12 pb-10 pt-8 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Nomor Nasional</h1>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 rounded-md bg-[#1BA3BA] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#158aa0]"
          >
            <Plus size={16} /> Tambah Nomor Nasional
          </button>
        </div>

        <div className="mb-6 mt-4 h-[3px] rounded bg-gray-300" />

        {loading ? (
          <p className="py-12 text-center text-sm text-gray-400">Memuat nomor nasional...</p>
        ) : loadError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-6 text-center">
            <p className="text-sm text-red-600">{loadError}</p>
            <button
              onClick={() => { setLoading(true); load(); }}
              className="mt-3 rounded-md border border-red-300 px-4 py-1.5 text-sm text-red-600 transition-colors hover:bg-red-100"
            >
              Coba lagi
            </button>
          </div>
        ) : data.length === 0 ? (
          <EmptyState message="Belum ada nomor nasional" />
        ) : (
          <NomorNasionalTable
            data={data}
            onEdit={openEdit}
            onDelete={(id) => setDeleteTarget(data.find((d) => d.id === id) ?? null)}
          />
        )}
      </div>

      <NomorNasionalFormModal
        open={modalOpen}
        onClose={closeForm}
        onSave={handleSave}
        editData={editData}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={closeDelete}
        onConfirm={handleConfirmDelete}
        title="Hapus Nomor Nasional"
        confirmLabel="Hapus"
        loading={deleting}
        error={deleteError}
      >
        <p>Yakin ingin menghapus nomor</p>
        <p className="my-1 text-base font-semibold uppercase tracking-wide text-gray-900">
          {deleteTarget?.nama}
        </p>
        {deleteTarget?.nomor && <p className="text-xs text-gray-500">{deleteTarget.nomor}</p>}
        <p className="mt-3 text-xs text-gray-400">Tindakan ini tidak dapat dibatalkan.</p>
      </ConfirmDialog>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />{/* ← diubah (ditambahkan) */}
    </div>
  );
}