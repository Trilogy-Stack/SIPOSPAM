"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Plus,
  X,
  Siren,
  Fuel,
  Wrench,
  Phone,
  Hospital,
  PhoneCall,
  ShieldAlert,
} from "lucide-react";

import {
  getEmergencyApi,
  createEmergency,
  updateEmergency,
  deleteEmergency,
} from "@/lib/api";

import RegionPicker, {
  EMPTY_REGION,
  formatRegion,
  regionToQueries,
  parseRegion
} from "@/components/admin/RegionPicker";
import MapPicker from "@/components/admin/MapPicker";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useAuth } from "@/hooks/useAuth";
import { getRegionScope } from "@/lib/regionScope";
import { useToast, ToastContainer } from "@/components/shared/ui/Toast";

const CATEGORIES = ["Bencana", "Medis", "Keamanan", "BBM", "Bengkel", "Lainnya"];

const CATEGORY_ICON = {
  Bencana: ShieldAlert,
  Medis: Hospital,
  Keamanan: Siren,
  BBM: Fuel,
  Bengkel: Wrench,
  Lainnya: PhoneCall
};

const toDbCategory = (cat) => (cat ? cat.toLowerCase() : "");
const toUiCategory = (cat) =>
  CATEGORIES.find((c) => c.toLowerCase() === String(cat || "").toLowerCase()) || "";

const emptyForm = {
  name: "",
  phone: "",
  region: EMPTY_REGION,
  street: "",
  category: "",
  lat: null,
  lng: null,
};

export default function KelolaNomorDaruratPage() {
  const [list, setList] = useState([]);
  const [mode, setMode] = useState(null); // null | "add" | "edit"
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentArea, setCurrentArea] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toasts, toast, dismiss } = useToast();

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const [pickedRegion, setPickedRegion] = useState(null);
  const focus = regionToQueries(pickedRegion);

const { profile } = useAuth();

useEffect(() => {
  fetchList();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [profile?.role, profile?.region]);

const fetchList = async () => {
  const scope = getRegionScope(profile);
  if (!scope.ready) return;

  if (scope.blocked) {
    setList([]);
    setErrorMessage("Akun Anda belum memiliki wilayah. Hubungi super admin.");
    setLoading(false);
    return;
  }

  try {
    setLoading(true);
    setErrorMessage("");
    const res = await getEmergencyApi(scope.params);
    setList(Array.isArray(res) ? res : res?.data || []);
  } catch (error) {
    console.error("Gagal mengambil nomor darurat:", error);
    setErrorMessage(error.message || "Gagal memuat data.");
    setList([]);
  } finally {
    setLoading(false);
  }
};

  // Kategori dipilih satu saja (tampilan checkbox, perilaku seperti radio)
  const pickCategory = (cat) =>
    setForm((f) => ({ ...f, category: f.category === cat ? "" : cat }));

  // ---------- Buka form ----------
  const openAdd = () => {
    setForm(emptyForm);
    setCurrentArea("");
    setSelectedId(null);
    setMode("add");
    setPickedRegion(null);
  };

  const openEdit = (item) => {
    setForm({
      name: item.agency_name || "",
      phone: item.telephone || "",
      region: parseRegion(item.area), // terisi dari wilayah yang tersimpan
      street: item.location || "",
      category: toUiCategory(item.category),
      lat: item.latitude ?? null,
      lng: item.longitude ?? null,
    });
    setCurrentArea(item.area || item.region || "");
    setSelectedId(item.id);
    setMode("edit");
    setPickedRegion(null);
  };

  // ---------- Simpan & Hapus ----------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) return;

    if (!form.category) {
      toast.warning("Pilih salah satu kategori.");
      return;
    }

    if (form.phone.length < 10) {
      toast.warning("Nomor minimal 10 angka.");
      return;
    }

    if (form.lat == null || form.lng == null) {
      toast.warning("Tentukan lokasi pada peta (klik peta atau geser pin).");
      return;
    }

    setSaving(true);
    try {
      const areaStr = formatRegion(form.region); // kosong jika belum dipilih

      const payload = {
        agency_name: form.name,
        telephone: form.phone,
        category: toDbCategory(form.category),
        location: form.street,
        latitude: Number(form.lat),
        longitude: Number(form.lng),
        ...(areaStr ? { area: areaStr } : {}),
      };

      if (mode === "add") {
        // region wajib lolos validasi. Admin wilayah akan ditimpa BE dari akun login.
        await createEmergency({
          ...payload,
          region: form.region?.city || areaStr || "-", // ⚠️ lihat catatan region di bawah
        });
      } else {
        await updateEmergency(selectedId, payload); // region sengaja tidak dikirim
      }

      const wasAdd = mode === "add";
      await fetchList();
      setMode(null);
      setSelectedId(null);
      toast.success(
        wasAdd ? "Nomor darurat berhasil ditambahkan." : "Nomor darurat berhasil diperbarui."
      );
    } catch (error) {
      console.error("Gagal menyimpan nomor darurat:", error);
      toast.error(`Gagal menyimpan: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    setSaving(true);
    try {
      await deleteEmergency(selectedId);
      await fetchList();
      setMode(null);
      setSelectedId(null);
      toast.success("Nomor darurat berhasil dihapus.");
    } catch (error) {
      console.error("Gagal menghapus nomor darurat:", error);
      toast.error(`Gagal menghapus: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full border border-slate-200 rounded-md px-3 py-2 text-xs md:text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#1a9fb8]";
  const labelClass = "block text-xs md:text-sm text-slate-600 font-medium mb-1.5";

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#eceef7] font-sans pb-10">
      <main className="w-[calc(100%-3rem)] max-w-7xl mx-auto pt-5 space-y-4">
        {/* Judul */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-17 h-17 relative shrink-0">
              <Image
                src="/icons_location.png"
                alt="Location Icon"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">
                Kelola Nomor Darurat
              </h1>
              <p className="text-xs md:text-sm text-slate-600 font-medium mt-0.5">
                Berisikan nomor, alamat, kategori, wilayah
              </p>
            </div>
          </div>
          <button
            onClick={openAdd}
            className="bg-[#1a9fb8] hover:bg-[#158aa0] transition text-white text-sm font-bold h-10 px-5 rounded flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Tambah Nomor
          </button>
        </div>

        <div className={mode ? "grid grid-cols-1 lg:grid-cols-2 gap-5 items-start" : ""}>
          {/* Daftar Nomor Darurat */}
          <div className="space-y-3">
            {loading && (
              <div className="py-45 text-center">
                <p className="text-sm md:text-base text-slate-500">Memuat data...</p>
              </div>
            )}
            {errorMessage && (
              <div className="py-45 text-center">
                <p className="text-sm md:text-base text-red-500">{errorMessage}</p>
              </div>
            )}
            {!loading && !errorMessage && list.length === 0 && (
                <div className="py-45 text-center">
                  <p className="text-base md:text-lg font-semibold text-slate-600">Belum ada data nomor darurat</p>
                  <p className="text-xs md:text-sm text-slate-500 mt-1">
                    Klik tombol "Tambah Nomor" untuk menambahkan data pertama.
                  </p>
                </div>
              )}

            {list.map((item) => {
              const Icon = CATEGORY_ICON[toUiCategory(item.category)] || Phone;
              return (
                <div
                  key={item.id}
                  onClick={() => openEdit(item)}
                  className={`bg-white rounded-md shadow flex items-center gap-3 px-3 py-3.5 cursor-pointer border-2 transition ${
                    selectedId === item.id
                      ? "border-[#2563eb]"
                      : "border-transparent hover:border-slate-200"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-[#1a9fb8] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs md:text-sm font-bold text-slate-900 leading-tight">
                      {item.agency_name}
                    </h3>
                    <p className="text-xs text-slate-700 mt-0.5">({item.telephone})</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Form Tambah / Lihat & Edit */}
          {mode && (
            <form
              onSubmit={handleSubmit}
              className={`bg-white rounded-md p-5 space-y-4 ${
                mode === "edit" ? "border border-slate-400 shadow-sm" : "shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm md:text-base font-bold text-slate-800">
                                {mode === "add" ? "Tambah Nomor Darurat" : "Lihat & Edit Nomor Darurat"}
                              </h2>
                <button
                  type="button"
                  onClick={() => {
                    if (saving) return;
                    setMode(null);
                    setSelectedId(null);
                  }}
                  disabled={saving}
                  aria-label="Tutup form"
                  title="Tutup"
                  className="-mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div>
                <label className={labelClass}>Nama Instansi</label>
                <input
                  className={inputClass}
                  placeholder="Pemadam Kebakaran"
                  value={form.name}
                  onChange={setField("name")}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Nomor</label>
                <input
                  className={inputClass}
                  inputMode="numeric"
                  maxLength={15}
                  pattern="[0-9]{10,15}"
                  title="Nomor harus 10 sampai 15 angka"
                  placeholder="085234817293"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      phone: e.target.value.replace(/\D/g, "").slice(0, 15),
                    }))
                  }
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Kabupaten/Kota, Kecamatan</label>
                  <RegionPicker
                    required={mode === "add" || !currentArea}
                    value={form.region}
                    onChange={(region) => {
                      setForm((f) => ({ ...f, region }));
                      setPickedRegion(region);
                    }}
                  />
                  {mode === "edit" && currentArea && !formatRegion(form.region) && (
                    <p className="text-xs md:text-sm text-slate-600 mt-1.5">
                      Tersimpan: {currentArea} (pilih ulang hanya jika ingin mengubah)
                    </p>
                  )}
              </div>

              <div>
                <label className={labelClass}>Nama Jalan / Titik KM / Patokan</label>
                <input
                  className={inputClass}
                  placeholder="Simpang utama Pasar Sapi"
                  value={form.street}
                  onChange={setField("street")}
                  required
                />
              </div>

              {/* Peta */}
              <div>
                <label className={labelClass}>Titik Lokasi di Peta</label>
                <MapPicker
                  lat={form.lat}
                  lng={form.lng}
                  onChange={({ lat, lng }) => setForm((f) => ({ ...f, lat, lng }))}
                  onAddress={(street) => setForm((f) => ({ ...f, street }))}
                  focusQuery={focus.main}
                  focusFallback={focus.fallback}
                />
              </div>

              {/* Kategori */}
              <div>
                <label className={labelClass}>Kategori</label>
                <div className="space-y-3 mt-2">
                  {CATEGORIES.map((cat) => (
                    <label
                      key={cat}
                      className="flex items-center justify-between text-xs md:text-sm text-slate-600 font-medium cursor-pointer"
                    >
                      <span>{cat}</span>
                      <input
                        type="checkbox"
                        checked={form.category === cat}
                        onChange={() => pickCategory(cat)}
                        className="w-4 h-4 rounded cursor-pointer accent-blue-700"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Tombol aksi */}
              <div className="flex gap-3 pt-6">
                {mode === "edit" && (
                  <button
                    type="button"
                    onClick={() => setConfirmOpen(true)}
                    disabled={saving}
                    className="flex-1 bg-[#d9444a] hover:bg-[#c23a40] transition text-white text-xs font-bold py-2.5 rounded-md disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Hapus
                  </button>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-[#fbbf24] hover:bg-[#f59e0b] transition text-slate-900 text-xs font-bold py-2.5 rounded-md disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      <ConfirmDialog
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={async () => {
          setConfirmOpen(false);
          await handleDelete();
        }}
      />
    </div>
  );
}