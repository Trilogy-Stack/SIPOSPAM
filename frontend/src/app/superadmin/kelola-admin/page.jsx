// src/app/superadmin/kelola-admin/page.jsx
"use client";
import { useCallback, useEffect, useState } from "react";
import { Plus, UserX } from "lucide-react";
import AdminTable from "@/components/superadmin/AdminTable";
import AdminFormModal from "@/components/superadmin/AdminFormModal";
import EmptyState from "@/components/superadmin/EmptyState";
import ConfirmDialog from "@/components/shared/ui/ConfirmDialog";
import { getAdminList, createAdmin, updateAdmin } from "@/lib/api";

const norm = (s) => (s ?? "").trim().toLowerCase();

// Pesan error BE (terutama pelanggaran UNIQUE dari database) dibuat lebih jelas
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

// Pemisah bergaris dengan judul kecil di tengah
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
  const [profiles, setProfiles] = useState([]); // semua profil dari BE (aktif + nonaktif)
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // admin yang sedang diedit, null = tambah baru

  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [deactivating, setDeactivating] = useState(false);
  const [deactivateError, setDeactivateError] = useState("");

  const [busyId, setBusyId] = useState(null); // admin yang sedang diaktifkan kembali
  const [notice, setNotice] = useState(null); // { type: "success" | "error", text }

  // Turunan dari data BE
  const admins = profiles.filter((p) => p.role !== "super_admin");
  const activeAdmins = admins.filter((a) => a.is_active !== false);
  const inactiveAdmins = admins.filter((a) => a.is_active === false);

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

  // Notifikasi hilang sendiri setelah beberapa detik
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 4500);
    return () => clearTimeout(t);
  }, [notice]);

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

  // Cek bentrok email/wilayah di semua akun (termasuk nonaktif) sebelum ke BE
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

  // Dipanggil AdminFormModal. Kalau melempar error, modal tetap terbuka dan menampilkan pesannya.
  async function handleSave(data) {
    const conflict = findConflict(data, editing?.id);
    if (conflict) throw new Error(conflict);

    try {
      if (editing) {
        // Kirim hanya field yang berubah (hindari update email Auth yang tidak perlu)
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
  }

  // "Hapus" = soft delete: akun dinonaktifkan, datanya tidak dihapus dari database
  async function handleConfirmDeactivate() {
    setDeactivating(true);
    setDeactivateError("");
    try {
      await updateAdmin(deactivateTarget.id, { is_active: false });
      setNotice({
        type: "success",
        text: `Akun "${deactivateTarget.name}" dinonaktifkan. Bisa diaktifkan kembali dari bagian "Akun nonaktif" di bawah.`,
      });
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
      setNotice({ type: "success", text: `Akun "${admin.name}" diaktifkan kembali.` });
    } catch (err) {
      setNotice({ type: "error", text: friendlyError(err) });
    } finally {
      setBusyId(null);
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

        {notice && (
          <div
            className={`mb-4 rounded-md border px-4 py-2.5 text-sm ${
              notice.type === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-600"
            }`}
          >
            {notice.text}
          </div>
        )}

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
    </div>
  );
}