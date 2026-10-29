"use client";
import { useCallback, useEffect, useState } from "react";
import { Plus, UserX } from "lucide-react";
import AdminTable from "@/components/superadmin/AdminTable";
import AdminFormModal from "@/components/superadmin/AdminFormModal";
import EmptyState from "@/components/superadmin/EmptyState";
import ConfirmDialog from "@/components/shared/ui/ConfirmDialog";
import { getAdminList, createAdmin, updateAdmin, deleteAdmin } from "@/lib/api";
import { useToast, ToastContainer } from "@/components/shared/ui/Toast";
import PasswordInput from "@/components/shared/ui/PasswordInput";

const norm = (s) => (s ?? "").trim().toLowerCase();

const byName = (a, b) =>
  (a.name ?? "").localeCompare(b.name ?? "", "id", { sensitivity: "base", numeric: true });

function friendlyError(err) {
  const msg = err?.message || "";
  const dup = /duplicate|unique/i.test(msg);
  if (/profiles_region/i.test(msg) || (dup && /region/i.test(msg))) {
    return "Wilayah ini sudah dipakai akun lain. Satu wilayah hanya boleh punya satu admin.";
  }
  if (/profiles_email/i.test(msg) || (dup && /email/i.test(msg))) {
    return "Email sudah terdaftar. Gunakan email lain.";
  }
  return msg || "Terjadi kesalahan";
}

function SectionDivider({ children }) {
  return (
    <div className="flex items-center gap-4" role="separator">
      <span className="h-px flex-1 bg-gray-200" />
      <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-gray-400">
        {children}
      </span>
      <span className="h-px flex-1 bg-gray-200" />
    </div>
  );
}

export default function KelolaAdminPage() {
  const [profiles, setProfiles] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); 

  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [deactivating, setDeactivating] = useState(false);
  const [deactivateError, setDeactivateError] = useState("");

  const [busyId, setBusyId] = useState(null); 
  const { toasts, toast, dismiss } = useToast();

  const [permTarget, setPermTarget] = useState(null);
  const [permDeleting, setPermDeleting] = useState(false);
  const [permError, setPermError] = useState("");
  const [permPassword, setPermPassword] = useState(""); 

  const admins = profiles.filter((p) => p.role !== "super_admin");
  const activeAdmins = admins.filter((a) => a.is_active !== false).sort(byName);
  const inactiveAdmins = admins.filter((a) => a.is_active === false).sort(byName);

  const loadProfiles = useCallback(async () => {
    setLoadError("");
    try {
      const data = await getAdminList();
      setProfiles(data ?? []);
    } catch (err) {
      setLoadError(err.message || "Gagal memuat data admin");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

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

  function closeDeactivate() {
    setDeactivateTarget(null);
    setDeactivateError("");
  }

  function findConflict(data, ignoreId) {
    const emailHit = profiles.find(
      (p) => p.id !== ignoreId && norm(p.email) === norm(data.email)
    );
    if (emailHit) {
      return emailHit.is_active === false
        ? `Email ini milik akun nonaktif "${emailHit.name}". Aktifkan kembali akun tersebut dari bagian "Akun nonaktif", atau gunakan email lain.`
        : `Email ini sudah dipakai akun "${emailHit.name}". Gunakan email lain.`;
    }
    const regionHit = profiles.find(
      (p) => p.id !== ignoreId && p.region && norm(p.region) === norm(data.region)
    );
    if (regionHit) {
      return regionHit.is_active === false
        ? `Wilayah "${regionHit.region}" masih dimiliki akun nonaktif "${regionHit.name}". Aktifkan kembali akun itu dari bagian "Akun nonaktif", atau ubah wilayahnya.`
        : `Wilayah "${regionHit.region}" sudah dipakai akun "${regionHit.name}". Satu wilayah hanya boleh punya satu admin.`;
    }
    return null;
  }

  async function handleSave(data) {
    const conflict = findConflict(data, editing?.id);
    if (conflict) throw new Error(conflict);

    try {
      if (editing) {
        const changes = {};
        if (data.name !== editing.name) changes.name = data.name;
        if (data.email !== editing.email) changes.email = data.email;
        if (data.region !== editing.region) changes.region = data.region;
        if (Object.keys(changes).length > 0) await updateAdmin(editing.id, changes);
      } else {
        await createAdmin({
          name: data.name,
          email: data.email,
          password: data.password,
          region: data.region,
        });
      }
    } catch (err) {
      throw new Error(friendlyError(err));
    }
    await loadProfiles();
    toast.success(
      editing
        ? `Akun "${data.name}" berhasil diperbarui.`
        : `Akun "${data.name}" berhasil ditambahkan.`
    );
  }

  async function handleConfirmDeactivate() {
    setDeactivating(true);
    setDeactivateError("");
    try {
      await updateAdmin(deactivateTarget.id, { is_active: false });
      toast.success(
        `Akun "${deactivateTarget.name}" dinonaktifkan. Bisa diaktifkan kembali dari bagian "Akun nonaktif" di bawah.`
      );
      closeDeactivate();
      await loadProfiles();
    } catch (err) {
      setDeactivateError(friendlyError(err));
    } finally {
      setDeactivating(false);
    }
  }

  async function handleReactivate(admin) {
    setBusyId(admin.id);
    try {
      await updateAdmin(admin.id, { is_active: true });
      await loadProfiles();
      toast.success(`Akun "${admin.name}" diaktifkan kembali.`);
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setBusyId(null);
    }
  }

  function closePerm() {
    if (permDeleting) return;
    setPermTarget(null);
    setPermError("");
    setPermPassword("");
  }

  async function handleConfirmPerm() {
    setPermDeleting(true);
    setPermError("");
    try {
      await deleteAdmin(permTarget.id, permPassword);
      toast.success(`Akun "${permTarget.name}" dihapus permanen.`);
      setPermTarget(null);
      setPermPassword("");
      await loadProfiles();
    } catch (err) {
      setPermError(friendlyError(err));
    } finally {
      setPermDeleting(false);
    }
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

        {loading ? (
          <p className="py-12 text-center text-sm text-gray-400">Memuat data admin...</p>
        ) : loadError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-6 text-center">
            <p className="text-sm text-red-600">{loadError}</p>
            <button
              onClick={() => { setLoading(true); loadProfiles(); }}
              className="mt-3 rounded-md border border-red-300 px-4 py-1.5 text-sm text-red-600 transition-colors hover:bg-red-100"
            >
              Coba lagi
            </button>
          </div>
        ) : admins.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col gap-6">
            {activeAdmins.length > 0 ? (
              <AdminTable
                admins={activeAdmins}
                onEdit={openEdit}
                onDelete={setDeactivateTarget}
                onReactivate={handleReactivate}
                busyId={busyId}
              />
            ) : (
              <EmptyState message="Tidak ada admin aktif" />
            )}

            {/* Akun nonaktif selalu tampil di bawah, dipisah garis + judul kecil */}
            {inactiveAdmins.length > 0 && (
              <>
                <SectionDivider>Akun nonaktif ({inactiveAdmins.length})</SectionDivider>
                <AdminTable
                  admins={inactiveAdmins}
                  onEdit={openEdit}
                  onDelete={setDeactivateTarget}
                  onReactivate={handleReactivate}
                  onDeletePermanent={setPermTarget} 
                  busyId={busyId}
                />
              </>
            )}
          </div>
        )}
      </div>

      <AdminFormModal
        open={modalOpen}
        onClose={closeForm}
        onSave={handleSave}
        initialData={editing}
      />

      <ConfirmDialog
        open={!!deactivateTarget}
        onClose={closeDeactivate}
        onConfirm={handleConfirmDeactivate}
        title="Nonaktifkan Akun Admin"
        icon={UserX}
        confirmLabel="Nonaktifkan"
        loading={deactivating}
        error={deactivateError}
      >
        <p>Akun admin</p>
        <p className="my-1 text-base font-semibold uppercase tracking-wide text-gray-900">
          {deactivateTarget?.name}
        </p>
        {deactivateTarget?.region && (
          <p className="text-xs text-gray-500">{deactivateTarget.region}</p>
        )}
        <p className="mt-3">akan dinonaktifkan dan tidak bisa login lagi.</p>
        <p className="mt-1 text-xs text-gray-400">
          Data pospam tetap tersimpan, dan akun bisa diaktifkan kembali kapan saja.
        </p>
      </ConfirmDialog>

      {/* konfirmasi hapus permanen (ketik nama polres) */}
            <ConfirmDialog
        open={!!permTarget}
        onClose={closePerm}
        onConfirm={handleConfirmPerm}
        title="Hapus Permanen Akun Admin"
        confirmLabel="Hapus permanen"
        loading={permDeleting}
        error={permError}
        confirmDisabled={!permPassword}
      >
        <p>Akun</p>
        <p className="my-1 text-base font-semibold uppercase tracking-wide text-gray-900">
          {permTarget?.name}
        </p>
        <p className="mt-2">
          beserta seluruh pospam dan nomor darurat wilayahnya akan dihapus permanen dan tidak
          bisa dikembalikan.
        </p>
        <p className="mt-3 text-xs text-gray-500">
          Masukkan password Anda sebagai superadmin untuk melanjutkan:
        </p>
        <div className="mt-2 text-left">
          <PasswordInput
            value={permPassword}
            onChange={(e) => setPermPassword(e.target.value)}
            autoComplete="new-password"
            placeholder="Password Superadmin"
          />
        </div>
      </ConfirmDialog>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}