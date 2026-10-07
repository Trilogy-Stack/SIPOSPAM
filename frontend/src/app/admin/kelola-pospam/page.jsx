"use client";

import { useState } from "react";
import { MapPin, Plus, Camera, Trash2, X } from "lucide-react";
import RegionPicker, { EMPTY_REGION, formatRegion } from "@/components/admin/RegionPicker";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

const DEFAULT_FACILITIES = ["Toilet", "Mushola", "Medis", "Parkir Area", "Rest Area"];

// TODO BACKEND: hapus dummy ini, ganti dengan data dari API (useEffect + getPospamsApi)
const DUMMY_POSPAM = [
  {
    id: 1,
    name: "Pospam Simpang Pasar Sapi",
    coordinator: "Andreas",
    coordinatorPhone: "0813-9111-4668",
    region: { province: "Jawa Tengah", city: "Kota Salatiga", district: "Sidorejo", postalCode: "50711" },
    street: "Simpang utama Pasar Sapi",
    lat: -7.3305,
    lng: 110.5084,
    photos: [], // array URL foto dari backend
    facilities: ["Toilet", "Mushola", "Rest Area", "Kursi Pijat"],
  },
];

const emptyForm = {
  name: "",
  coordinator: "",
  coordinatorPhone: "",
  region: EMPTY_REGION,
  street: "",
  lat: -7.3305,
  lng: 110.5084,
};



const defaultOptions = DEFAULT_FACILITIES.map((name) => ({ name, custom: false }));

export default function KelolaPospamPage() {
  const [pospamList, setPospamList] = useState(DUMMY_POSPAM);
  const [mode, setMode] = useState(null); // null | "add" | "edit"
  const [selectedId, setSelectedId] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [photos, setPhotos] = useState([]); // { url, file } | null
  const [facilityOptions, setFacilityOptions] = useState(defaultOptions);
  const [facilities, setFacilities] = useState([]);
  const [addingFacility, setAddingFacility] = useState(false);
  const [newFacility, setNewFacility] = useState("");
  const [facilityError, setFacilityError] = useState("");

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const [confirmOpen, setConfirmOpen] = useState(false);

  // ---------- Buka form ----------
  const openAdd = () => {
    cancelAddFacility();
    setForm(emptyForm);
    setPhotos([null, null, null]);
    setFacilities([]);
    setFacilityOptions(defaultOptions);
    setSelectedId(null);
    setMode("add");
  };

  const openEdit = (item) => {
    // TODO BACKEND (opsional): ambil detail lengkap via getPospamByIdApi(item.id)
    cancelAddFacility();
    setForm({
      name: item.name,
      coordinator: item.coordinator,
      coordinatorPhone: item.coordinatorPhone,
      region: item.region,
      street: item.street,
      lat: item.lat,
      lng: item.lng,
    });
    setPhotos((item.photos || []).map((url) => ({ url, file: null })));
    setFacilities(item.facilities);
    setFacilityOptions([
      ...defaultOptions,
      ...item.facilities
        .filter((f) => !DEFAULT_FACILITIES.includes(f))
        .map((name) => ({ name, custom: true })),
    ]);
    setSelectedId(item.id);
    setMode("edit");
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

  // ---------- Fasilitas ----------
  const toggleFacility = (name) =>
    setFacilities((prev) =>
      prev.includes(name) ? prev.filter((f) => f !== name) : [...prev, name]
    );

    const cancelAddFacility = () => {
    setAddingFacility(false);
    setNewFacility("");
    setFacilityError("");
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

  const removeFacilityOption = (name) => {
    setFacilityOptions((prev) => prev.filter((o) => o.name !== name));
    setFacilities((prev) => prev.filter((f) => f !== name));
  };

  // ---------- Simpan & Hapus ----------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      facilities,
      photos: photos.filter(Boolean),
    };

    if (mode === "add") {
      // TODO BACKEND: await createPospamApi(formData) lalu refetch daftar
      setPospamList((prev) => [
        ...prev,
        { id: Date.now(), ...payload, photos: payload.photos.map((p) => p.url) },
      ]);
      setMode(null);
    } else {
      // TODO BACKEND: await updatePospamApi(selectedId, formData) lalu refetch daftar
      setPospamList((prev) =>
        prev.map((p) =>
          p.id === selectedId
            ? { ...p, ...payload, photos: payload.photos.map((x) => x.url) }
            : p
        )
      );
    }
  };

  const handleDelete = async () => {
  // TODO BACKEND: await deletePospamApi(selectedId) lalu refetch daftar
  setPospamList((prev) => prev.filter((p) => p.id !== selectedId));
  setSelectedId(null);
  setMode(null);
};

  const inputClass =
    "w-full border border-slate-200 rounded-md px-3 py-2 text-[11px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#1a9fb8]";
  const labelClass = "block text-[12px] font-medium text-slate-800 mb-1.5";

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#eceef7] font-sans pb-10">
      <main className="max-w-6xl mx-auto px-6 pt-6 space-y-5">
        {/* Judul */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <MapPin className="w-9 h-9 text-slate-600 mt-0.5" />
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">Kelola Pospam</h1>
              <p className="text-[11px] text-slate-800 font-semibold">
                Kelola data, lokasi, dan fasilitas Pos Pengamanan pada wilayah Anda.
              </p>
            </div>
          </div>
          <button
            onClick={openAdd}
            className="bg-[#1a9fb8] hover:bg-[#158aa0] transition text-white text-[11px] font-medium px-4 py-2 rounded-md flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah Pospam
          </button>
        </div>

        <div className={mode ? "grid grid-cols-1 lg:grid-cols-2 gap-5 items-start" : ""}>
          {/* Daftar Pospam */}
          <div className="space-y-3">
            {pospamList.map((item, index) => (
              <div
                key={item.id}
                onClick={() => openEdit(item)}
                className={`bg-white rounded-md shadow flex overflow-hidden cursor-pointer border-2 transition ${
                  selectedId === item.id ? "border-[#2563eb]" : "border-transparent hover:border-slate-200"
                }`}
              >
                <div className="bg-[#1a9fb8] text-white font-bold text-xs w-10 flex items-center justify-center shrink-0">
                  {index + 1}
                </div>
                <div className="px-3 py-3 space-y-1">
                  <h3 className="text-[13px] font-semibold text-slate-900">
                    {item.name}{" "}
                    <span className="text-[10px] font-normal text-slate-600">
                      ({item.coordinatorPhone})
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-700">
                    {item.street}, {formatRegion(item.region)}
                    </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.facilities.map((f) => (
                      <span
                        key={f}
                        className="border border-slate-400 rounded px-2 py-0.5 text-[9px] text-slate-700"
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
              <h2 className="text-[13px] font-semibold text-slate-800">
                {mode === "add" ? "Tambah Pospam" : "Lihat & Edit Pospam"}
              </h2>

              <div>
                <label className={labelClass}>Nama Pos</label>
                <input className={inputClass} placeholder="Pospam Simpang Pasar Sapi" value={form.name} onChange={setField("name")} required />
              </div>

              <div>
                <label className={labelClass}>Nama Kordinator</label>
                <input className={inputClass} placeholder="Andreas" value={form.coordinator} onChange={setField("coordinator")} required />
              </div>

              <div>
                <label className={labelClass}>Nomor Kontak Kordinator</label>
                <input className={inputClass} placeholder="085234817293" value={form.coordinatorPhone} onChange={setField("coordinatorPhone")} required />
              </div>

              <div>
                <label className={labelClass}>Provinsi, Kabupaten/Kota, Kecamatan, Kode Pos</label>
                <RegionPicker
                    value={form.region}
                    onChange={(region) => setForm((f) => ({ ...f, region }))}
                />
                </div>

              <div>
                <label className={labelClass}>Nama Jalan / Titik KM / Patokan</label>
                <input className={inputClass} placeholder="Simpang utama Pasar Sapi" value={form.street} onChange={setField("street")} required />
              </div>

              {/* Peta */}
              <div className="rounded-md overflow-hidden border border-slate-200 h-[150px]">
                {/* TODO: ganti dengan map picker (Leaflet / Google Maps API) agar pin bisa digeser dan lat/lng tersimpan */}
                <iframe
                  title="Peta lokasi"
                  className="w-full h-full"
                  loading="lazy"
                  src={`https://maps.google.com/maps?q=${form.lat},${form.lng}&z=15&output=embed`}
                />
              </div>

              {/* Foto Fasilitas */}
              <div>
                <label className={labelClass}>Foto Fasilitas</label>
                <div className="flex flex-wrap gap-2">
                  {photos.map((p, i) =>
                    p ? (
                      <div key={i} className="relative w-[72px] h-[72px] rounded-md overflow-hidden border border-slate-200">
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

              {/* Fasilitas */}
                <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-[12px] font-medium text-slate-800">
                    Fasilitas
                    </label>

                    <button
                    type="button"
                    onClick={() => setAddingFacility(true)}
                    disabled={addingFacility}
                    className="bg-[#1a9fb8] hover:bg-[#158aa0] disabled:opacity-50 text-white text-[10px] font-medium px-4 py-1.5 rounded-md"
                    >
                    + Tambah
                    </button>
                </div>

                {/* Form tambah fasilitas - hanya muncul SATU kali */}
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

                            if (e.key === "Escape") {
                            cancelAddFacility();
                            }
                        }}
                        placeholder="Nama fasilitas baru"
                        className="flex-1 min-w-0 border border-[#1a9fb8] rounded-md px-3 py-2 text-[11px] text-slate-700 placeholder:text-slate-400 focus:outline-none"
                        />

                        <button
                        type="button"
                        onClick={cancelAddFacility}
                        className="bg-[#d9444a] hover:bg-[#c23a40] transition text-white text-[10px] font-semibold px-5 py-2 rounded-md"
                        >
                        Batal
                        </button>

                        <button
                        type="button"
                        onClick={saveNewFacility}
                        className="bg-[#fbbf24] hover:bg-[#f59e0b] transition text-slate-900 text-[10px] font-semibold px-5 py-2 rounded-md"
                        >
                        Tambah
                        </button>
                    </div>

                    {facilityError && (
                        <p className="text-[10px] text-red-500 mt-1">
                        {facilityError}
                        </p>
                    )}
                    </div>
                )}

                {/* Daftar fasilitas */}
                <div className="space-y-3">
                {facilityOptions.map(({ name, custom }) => (
                    <div
                    key={name}
                    className="flex items-center justify-between text-[11px] text-slate-800"
                    >
                    <span>{name}</span>

                    <div className="flex items-center gap-2">
                        <input
                        type="checkbox"
                        checked={facilities.includes(name)}
                        onChange={() => toggleFacility(name)}
                        className="w-4 h-4 rounded cursor-pointer accent-blue-700"
                        />

                        {custom && (
                        <button
                            type="button"
                            onClick={() => removeFacilityOption(name)}
                            className="text-red-500 hover:text-red-700"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        )}
                    </div>
                    </div>
                ))}
                </div>

                {/* Tombol Hapus & Simpan */}
                <div className="flex gap-3 mt-8">
                <button
                    type="button"
                    onClick={() => setConfirmOpen(true)}
                    className="flex-1 bg-[#d9444a] hover:bg-[#c23a40] text-white text-[11px] font-semibold py-2.5 rounded-md"
                >
                    Hapus
                </button>

                <button
                    type="submit"
                    className="flex-1 bg-[#fbbf24] hover:bg-[#f59e0b] text-slate-900 text-[11px] font-semibold py-2.5 rounded-md"
                >
                    Simpan
                </button>
                </div>
                </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}