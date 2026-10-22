"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Plus, Camera, Trash2, X } from "lucide-react";
import RegionPicker, {
  EMPTY_REGION,
  formatRegion,
  regionToQueries,
  parseRegion,
} from "@/components/admin/RegionPicker";
import MapPicker from "@/components/admin/MapPicker";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import {
  getPospamsApi,
  createPospam,
  updatePospam,
  deletePospam,
  uploadFotoPospam,
} from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useUnsavedChanges, UNSAVED_MESSAGE } from "@/hooks/useUnsavedChanges";
import { getRegionScope } from "@/lib/regionScope";
import { useToast, ToastContainer } from "@/components/shared/ui/Toast";

const DEFAULT_FACILITIES = ["Toilet", "Mushola", "Medis", "Parkir Area", "Rest Area"];

const emptyForm = {
  name: "",
  coordinator: "",
  coordinatorPhone: "",
  region: EMPTY_REGION,
  street: "",
  lat: null,
  lng: null,
};

const defaultOptions = DEFAULT_FACILITIES.map((name) => ({ name, custom: false }));

const buildOptions = (extra = []) => [
  ...defaultOptions,
  ...[...new Set(extra)]
    .filter((n) => !DEFAULT_FACILITIES.includes(n))
    .map((name) => ({ name, custom: true })),
];

const inputClass =
  "w-full border border-slate-200 rounded-md px-3 py-2 text-xs md:text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#1a9fb8]";
const labelClass = "block text-xs md:text-sm text-slate-600 font-medium mb-1.5";

export default function KelolaPospamPage() {
  const { profile } = useAuth();
  const { toasts, toast, dismiss } = useToast();

  const [pospamList, setPospamList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [mode, setMode] = useState(null); // null | "add" | "edit"
  const [selectedId, setSelectedId] = useState(null);
  const [currentArea, setCurrentArea] = useState("");
  const [pickedRegion, setPickedRegion] = useState(null); // wilayah yang dipilih admin sendiri

  const [form, setForm] = useState(emptyForm);
  const [photos, setPhotos] = useState([]); // { url, file } | null
  const [facilityOptions, setFacilityOptions] = useState(defaultOptions);
  const [facilities, setFacilities] = useState([]);
  const [addingFacility, setAddingFacility] = useState(false);
  const [newFacility, setNewFacility] = useState("");
  const [facilityError, setFacilityError] = useState("");
  const [facilityToDelete, setFacilityToDelete] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [baseline, setBaseline] = useState("");

  const focus = regionToQueries(pickedRegion);
  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const allFacilityNames = pospamList.flatMap((p) => p.facility || []);

  // Jumlah pospam LAIN yang memakai fasilitas ini
  const facilityUsedByOthers = (name) =>
    pospamList.filter((p) => p.id !== selectedId && (p.facility || []).includes(name)).length;

  // ---------- Peringatan perubahan belum disimpan ----------
  const snapshot = () =>
    JSON.stringify({
      form,
      photos: photos.map((p) => (p ? (p.file ? `baru:${p.file.name}:${p.file.size}` : p.url) : null)),
      facilities,
    });
  const dirty = !!mode && !!baseline && snapshot() !== baseline;

  useUnsavedChanges(dirty);
  const confirmLeaveForm = () => !dirty || window.confirm(UNSAVED_MESSAGE);

  // Catat kondisi awal setiap form dibuka atau ditutup
  useEffect(() => {
    setBaseline(mode ? snapshot() : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, selectedId]);

  // ---------- Data ----------
  const fetchPospam = async () => {
    const scope = getRegionScope(profile);
    if (!scope.ready) return; // tunggu profil selesai dimuat

    if (scope.blocked) {
      setPospamList([]);
      setErrorMessage("Akun Anda belum memiliki wilayah. Hubungi super admin.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      const response = await getPospamsApi(scope.params);
      setPospamList(Array.isArray(response) ? response : response.data || []);
    } catch (error) {
      console.error("Gagal mengambil data Pospam:", error);
      setErrorMessage(error.message || "Gagal memuat data.");
      setPospamList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPospam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.role, profile?.region]);

  // ---------- Fasilitas ----------
  const toggleFacility = (name) =>
    setFacilities((prev) =>
      prev.includes(name) ? prev.filter((f) => f !== name) : [...prev, name]
    );

  const cancelAddFacility = () => {
    setAddingFacility(false);
    setNewFacility("");
    setFacilityError("");
    setFacilityToDelete(null);
  };

  const saveNewFacility = () => {
    const name = newFacility.trim();
    if (!name) return setFacilityError("Nama fasilitas tidak boleh kosong.");
    if (facilityOptions.some((o) => o.name.toLowerCase() === name.toLowerCase())) {
      return setFacilityError("Fasilitas sudah ada.");
    }
    setFacilityOptions((prev) => [...prev, { name, custom: true }]);
    setFacilities((prev) => [...prev, name]);
    cancelAddFacility();
  };

  const confirmRemoveFacility = async () => {
    const name = facilityToDelete;
    if (!name) return;
    setFacilityToDelete(null);
    setSaving(true);

    try {
      // Pospam lain yang memakai fasilitas ini ikut dibersihkan
      const affected = pospamList.filter(
        (p) => p.id !== selectedId && (p.facility || []).includes(name)
      );

      await Promise.all(
        affected.map((p) =>
          updatePospam(p.id, { facility: (p.facility || []).filter((f) => f !== name) })
        )
      );

      setFacilityOptions((prev) => prev.filter((o) => o.name !== name));
      setFacilities((prev) => prev.filter((f) => f !== name));
      if (affected.length) await fetchPospam();

      toast.success(
        affected.length
          ? `Fasilitas "${name}" dihapus dari ${affected.length} pospam lain.`
          : `Fasilitas "${name}" dihapus dari pilihan.`
      );
    } catch (error) {
      console.error("Gagal menghapus fasilitas:", error);
      toast.error(`Gagal menghapus fasilitas: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // ---------- Foto ----------
  const setPhoto = (index, file) => {
    if (!file) return;
    setPhotos((prev) =>
      prev.map((p, i) => (i === index ? { url: URL.createObjectURL(file), file } : p))
    );
  };
  const removePhoto = (index) =>
    setPhotos((prev) => prev.map((p, i) => (i === index ? null : p)));
  const addPhotoSlot = () => setPhotos((prev) => [...prev, null]);

  // ---------- Form ----------
  const closeForm = () => {
    setMode(null);
    setSelectedId(null);
  };

  const openAdd = () => {
    if (!confirmLeaveForm()) return;
    cancelAddFacility();
    setForm(emptyForm);
    setCurrentArea("");
    setPhotos([null]);
    setFacilities([]);
    setFacilityOptions(buildOptions(allFacilityNames));
    setSelectedId(null);
    setMode("add");
    setPickedRegion(null);
  };

  const openEdit = (item) => {
    if (!confirmLeaveForm()) return;
    cancelAddFacility();
    const itemFacilities = Array.isArray(item.facility) ? item.facility : [];

    setForm({
      name: item.name || "",
      coordinator: item.koor_name || "",
      coordinatorPhone: item.koor_phone || "",
      region: parseRegion(item.area),
      street: item.location || "",
      lat: item.latitude ?? null,
      lng: item.longitude ?? null,
    });
    setPickedRegion(null);
    setCurrentArea(item.area || item.region || "");
    setPhotos(Array.isArray(item.photo) ? item.photo.map((url) => ({ url, file: null })) : []);
    setFacilities(itemFacilities);
    setFacilityOptions(buildOptions([...allFacilityNames, ...itemFacilities]));
    setSelectedId(item.id);
    setMode("edit");
  };

  // ---------- Simpan & Hapus ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    if (form.coordinatorPhone.length < 10) {
      toast.warning("Nomor kontak kordinator minimal 10 angka.");
      return;
    }

    // Lokasi divalidasi sebelum upload foto agar tidak ada upload yang sia-sia
    if (form.lat == null || form.lng == null) {
      toast.warning("Tentukan lokasi pospam pada peta (klik peta atau geser pin).");
      return;
    }

    setSaving(true);
    try {
      const photo = await Promise.all(
        photos.filter(Boolean).map((p) => (p.file ? uploadFotoPospam(p.file) : p.url))
      );

      const areaStr = formatRegion(form.region);

      const payload = {
        name: form.name,
        koor_name: form.coordinator,
        koor_phone: form.coordinatorPhone,
        location: form.street,
        latitude: Number(form.lat),
        longitude: Number(form.lng),
        facility: facilities,
        photo,
        ...(areaStr ? { area: areaStr } : {}),
      };

      if (mode === "add") {
        // region wajib lolos validasi; untuk admin_wilayah akan ditimpa backend dari akun login
        await createPospam({ ...payload, region: areaStr || "-" });
      } else {
        await updatePospam(selectedId, payload); // region sengaja tidak dikirim
      }

      const wasAdd = mode === "add";
      await fetchPospam();
      closeForm();
      toast.success(wasAdd ? "Pospam berhasil ditambahkan." : "Pospam berhasil diperbarui.");
    } catch (error) {
      console.error("Gagal menyimpan Pospam:", error);
      toast.error(`Gagal menyimpan: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    setSaving(true);
    try {
      await deletePospam(selectedId);
      await fetchPospam();
      closeForm();
      toast.success("Pospam berhasil dihapus.");
    } catch (error) {
      console.error("Gagal menghapus Pospam:", error);
      toast.error(`Gagal menghapus: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const facilityDeleteMessage = () => {
    if (!facilityToDelete) return "";
    const used = facilityUsedByOthers(facilityToDelete);
    return used > 0
      ? `Fasilitas "${facilityToDelete}" dipakai ${used} pospam lain. Hapus dari semua pospam?`
      : `Hapus fasilitas "${facilityToDelete}" dari pilihan?`;
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#eceef7] font-sans pb-10">
      <main className="w-[calc(100%-3rem)] max-w-7xl mx-auto pt-5 space-y-4">
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
                Kelola Pospam
              </h1>
              <p className="text-xs md:text-sm text-slate-600 font-medium mt-0.5">
                Kelola data, lokasi, dan fasilitas Pos Pengamanan pada wilayah Anda.
              </p>
            </div>
          </div>
          <button
            onClick={openAdd}
            className="bg-[#1a9fb8] hover:bg-[#158aa0] transition text-white text-sm font-bold h-10 px-5 rounded flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Tambah Pospam
          </button>
        </div>

        <div className={mode ? "grid grid-cols-1 lg:grid-cols-2 gap-5 items-start" : ""}>
          {/* Daftar */}
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
            {!loading && !errorMessage && pospamList.length === 0 && (
              <div className="py-45 text-center">
                <p className="text-base md:text-lg font-semibold text-slate-600">
                  Belum ada data pospam
                </p>
                <p className="text-xs md:text-sm text-slate-500 mt-1">
                  Klik tombol "Tambah Pospam" untuk menambahkan data pertama.
                </p>
              </div>
            )}

            {pospamList.map((item, index) => (
              <div
                key={item.id}
                onClick={() => openEdit(item)}
                className={`bg-white rounded-md shadow flex overflow-hidden cursor-pointer border-2 transition ${
                  selectedId === item.id
                    ? "border-[#2563eb]"
                    : "border-transparent hover:border-slate-200"
                }`}
              >
                <div className="bg-[#1a9fb8] text-white font-bold text-sm w-12 flex items-center justify-center shrink-0">
                  {index + 1}
                </div>
                <div className="px-4 py-3.5 space-y-1.5">
                  <h3 className="text-sm md:text-base font-semibold text-slate-900">
                    {item.name}{" "}
                    <span className="text-xs font-normal text-slate-600">({item.koor_phone})</span>
                  </h3>
                  <p className="text-xs md:text-sm text-slate-700">
                    {item.location}
                    {item.area ? `, ${item.area}` : ""}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {(item.facility || []).map((f) => (
                      <span
                        key={f}
                        className="border border-slate-400 rounded px-2.5 py-0.5 text-[11px] md:text-xs text-slate-700"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
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
                  {mode === "add" ? "Tambah Pospam" : "Lihat & Edit Pospam"}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    if (saving || !confirmLeaveForm()) return;
                    cancelAddFacility();
                    closeForm();
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
                <label className={labelClass}>Nama Pos</label>
                <input
                  className={inputClass}
                  placeholder="Pospam Simpang Pasar Sapi"
                  value={form.name}
                  onChange={setField("name")}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Nama Kordinator</label>
                <input
                  className={inputClass}
                  placeholder="Andreas"
                  value={form.coordinator}
                  onChange={setField("coordinator")}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Nomor Kontak Kordinator</label>
                <input
                  className={inputClass}
                  inputMode="numeric"
                  maxLength={15}
                  pattern="[0-9]{10,15}"
                  title="Nomor harus 10 sampai 15 angka"
                  placeholder="085234817293"
                  value={form.coordinatorPhone}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      coordinatorPhone: e.target.value.replace(/\D/g, "").slice(0, 15),
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

              <div>
                <label className={labelClass}>Foto Fasilitas</label>
                <div className="flex flex-wrap gap-2">
                  {photos.map((p, i) =>
                    p ? (
                      <div
                        key={i}
                        className="relative w-[72px] h-[72px] rounded-md overflow-hidden border border-slate-200"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.url} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto(i)}
                          className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5"
                          title="Hapus foto"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label
                        key={i}
                        className="w-[72px] h-[72px] border border-dashed border-slate-400 rounded-md flex items-center justify-center cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5 text-slate-800" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => setPhoto(i, e.target.files?.[0])}
                        />
                      </label>
                    )
                  )}
                  <button
                    type="button"
                    onClick={addPhotoSlot}
                    className="w-[72px] h-[72px] border border-dashed border-slate-400 rounded-md flex items-center justify-center text-slate-800 text-sm"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-800">Fasilitas</label>
                  <button
                    type="button"
                    onClick={() => setAddingFacility(true)}
                    disabled={addingFacility}
                    className="bg-[#1a9fb8] hover:bg-[#158aa0] disabled:opacity-50 text-white text-xs font-bold px-4 py-1.5 rounded-md"
                  >
                    + Tambah
                  </button>
                </div>

                {addingFacility && (
                  <div className="mt-3 mb-3">
                    <div className="flex items-center gap-2">
                      <input
                        autoFocus
                        value={newFacility}
                        onChange={(e) => {
                          setNewFacility(e.target.value);
                          setFacilityError("");
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            saveNewFacility();
                          }
                          if (e.key === "Escape") cancelAddFacility();
                        }}
                        placeholder="Nama fasilitas baru"
                        className="flex-1 min-w-0 border border-[#1a9fb8] rounded-md px-3 py-2 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={cancelAddFacility}
                        className="bg-[#d9444a] hover:bg-[#c23a40] transition text-white text-xs font-bold px-5 py-2 rounded-md"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={saveNewFacility}
                        className="bg-[#fbbf24] hover:bg-[#f59e0b] transition text-slate-900 text-xs font-bold px-5 py-2 rounded-md"
                      >
                        Tambah
                      </button>
                    </div>
                    {facilityError && (
                      <p className="text-xs text-red-500 mt-1">{facilityError}</p>
                    )}
                  </div>
                )}

                <div className="space-y-3">
                  {facilityOptions.map(({ name, custom }) => {
                    const usedBy = custom ? facilityUsedByOthers(name) : 0;

                    return (
                      <div
                        key={name}
                        className="flex items-center justify-between text-xs md:text-sm text-slate-600 font-medium"
                      >
                        <div>
                          <span>{name}</span>
                          {usedBy > 0 && (
                            <p className="text-[11px] font-normal text-slate-400">
                              Dipakai {usedBy} pospam lain
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={facilities.includes(name)}
                            onChange={() => toggleFacility(name)}
                            className="w-4 h-4 rounded cursor-pointer accent-blue-700"
                          />
                          {custom ? (
                            <button
                              type="button"
                              onClick={() => setFacilityToDelete(name)}
                              className="w-7 h-7 flex items-center justify-center rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                              title="Hapus fasilitas"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span className="w-7" /> // agar checkbox tetap sejajar
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                {mode === "edit" && (
                  <button
                    type="button"
                    onClick={() => setConfirmOpen(true)}
                    disabled={saving}
                    className="flex-1 bg-[#d9444a] hover:bg-[#c23a40] text-white text-xs font-bold py-2.5 rounded-md disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Hapus
                  </button>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-[#fbbf24] hover:bg-[#f59e0b] text-slate-900 text-xs font-bold py-2.5 rounded-md disabled:opacity-60 disabled:cursor-not-allowed"
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

      <ConfirmDialog
        open={!!facilityToDelete}
        message={facilityDeleteMessage()}
        onCancel={() => setFacilityToDelete(null)}
        onConfirm={confirmRemoveFacility}
      />
    </div>
  );
}