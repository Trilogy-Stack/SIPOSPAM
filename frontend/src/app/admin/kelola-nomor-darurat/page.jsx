"use client";

import { useState } from "react";
import {
  MapPin,
  Plus,
  Flame,
  HeartPulse,
  Shield,
  Fuel,
  Wrench,
  Phone,
} from "lucide-react";

import RegionPicker, { EMPTY_REGION, formatRegion } from "@/components/admin/RegionPicker";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

const CATEGORIES = ["Bencana", "Medis", "Keamanan", "BBM", "Bengkel"];

const CATEGORY_ICON = {
  Bencana: Flame,
  Medis: HeartPulse,
  Keamanan: Shield,
  BBM: Fuel,
  Bengkel: Wrench,
};



const REGION_SIDOREJO = { province: "Jawa Tengah", city: "Kota Salatiga", district: "Sidorejo", postalCode: "50711" };
const REGION_SIDOMUKTI = { province: "Jawa Tengah", city: "Kota Salatiga", district: "Sidomukti", postalCode: "50721" };


// TODO BACKEND: hapus dummy ini, ganti dengan data dari API (useEffect + getEmergencyApi)
const DUMMY_EMERGENCY = [
  { id: 1, name: "Bengkel mobil M-tech", phone: "0813-9111-4668", region: REGION_SIDOREJO, street: "Simpang utama Pasar Sapi", category: "Bengkel", lat: -7.3305, lng: 110.5084 },
  { id: 2, name: "Polsek Sidorejo", phone: "0813-9111-4668", region: REGION_SIDOREJO, street: "Simpang utama Pasar Sapi", category: "Keamanan", lat: -7.3305, lng: 110.5084 },
  { id: 3, name: "Polsek Sidomukti", phone: "0813-9111-4668", region: REGION_SIDOMUKTI, street: "Simpang utama Pasar Sapi", category: "Keamanan", lat: -7.3305, lng: 110.5084 },
  { id: 4, name: "Pemadam Kebakaran", phone: "0813-9111-4668", region: REGION_SIDOREJO, street: "Simpang utama Pasar Sapi", category: "Bencana", lat: -7.3305, lng: 110.5084 },
  { id: 5, name: "RSP Ario Wirawan", phone: "0813-9111-4668", region: REGION_SIDOREJO, street: "Simpang utama Pasar Sapi", category: "Medis", lat: -7.3305, lng: 110.5084 },
  { id: 6, name: "SPBU 44.507.14", phone: "(021) 1500000", region: REGION_SIDOREJO, street: "Simpang utama Pasar Sapi", category: "BBM", lat: -7.3305, lng: 110.5084 },
];

const emptyForm = {
  name: "",
  phone: "",
  region: EMPTY_REGION,
  street: "",
  category: "",
  lat: -7.3305,
  lng: 110.5084,
};

export default function KelolaNomorDaruratPage() {
  const [list, setList] = useState(DUMMY_EMERGENCY);
  const [mode, setMode] = useState(null); // null | "add" | "edit"
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const [confirmOpen, setConfirmOpen] = useState(false);
  // Kategori dipilih satu saja (tampilan checkbox, perilaku seperti radio)
  const pickCategory = (cat) =>
    setForm((f) => ({ ...f, category: f.category === cat ? "" : cat }));

  // ---------- Buka form ----------
  const openAdd = () => {
    setForm(emptyForm);
    setSelectedId(null);
    setMode("add");
  };

  const openEdit = (item) => {
    // TODO BACKEND (opsional): ambil detail lengkap via getEmergencyByIdApi(item.id)
    setForm({
      name: item.name,
      phone: item.phone,
      region: item.region,
      street: item.street,
      category: item.category,
      lat: item.lat,
      lng: item.lng,
    });
    setSelectedId(item.id);
    setMode("edit");
  };

  // ---------- Simpan & Hapus ----------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (mode === "add") {
      // TODO BACKEND: await createEmergencyApi(form) lalu refetch daftar
      setList((prev) => [...prev, { id: Date.now(), ...form }]);
      setMode(null);
    } else {
      // TODO BACKEND: await updateEmergencyApi(selectedId, form) lalu refetch daftar
      setList((prev) => prev.map((x) => (x.id === selectedId ? { ...x, ...form } : x)));
    }
  };

    const handleDelete = async () => {
    // TODO BACKEND: await deleteEmergencyApi(selectedId) lalu refetch daftar
    setList((prev) => prev.filter((x) => x.id !== selectedId));
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
              <h1 className="text-lg font-bold text-slate-900 leading-tight">Kelola Nomor Darurat</h1>
              <p className="text-[11px] text-slate-800 font-semibold">
                Berisikan nomor, alamat, kategori, wilayah
              </p>
            </div>
          </div>
          <button
            onClick={openAdd}
            className="bg-[#1a9fb8] hover:bg-[#158aa0] transition text-white text-[11px] font-medium px-4 py-2 rounded-md flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah Nomor
          </button>
        </div>

        <div className={mode ? "grid grid-cols-1 lg:grid-cols-2 gap-5 items-start" : ""}>
          {/* Daftar Nomor Darurat */}
          <div className="space-y-3">
            {list.map((item) => {
              const Icon = CATEGORY_ICON[item.category] || Phone;
              return (
                <div
                  key={item.id}
                  onClick={() => openEdit(item)}
                  className={`bg-white rounded-md shadow flex items-center gap-3 px-3 py-3.5 cursor-pointer border-2 transition ${
                    selectedId === item.id ? "border-[#2563eb]" : "border-transparent hover:border-slate-200"
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-[#1a9fb8] flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-semibold text-slate-900 leading-tight">{item.name}</h3>
                    <p className="text-[10px] text-slate-700 mt-0.5">({item.phone})</p>
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
              <h2 className="text-[13px] font-semibold text-slate-800">
                {mode === "add" ? "Tambah Nomor Darurat" : "Lihat & Edit Nomor Darurat"}
              </h2>

              <div>
                <label className={labelClass}>Nama Instansi</label>
                <input className={inputClass} placeholder="Pemadam Kebakaran" value={form.name} onChange={setField("name")} required />
              </div>

              <div>
                <label className={labelClass}>Nomor</label>
                <input className={inputClass} placeholder="085234817293" value={form.phone} onChange={setField("phone")} required />
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

              {/* Kategori */}
              <div>
                <label className={`${labelClass} mb-2`}>Kategori</label>
                <div className="space-y-3">
                  {CATEGORIES.map((cat) => (
                    <label key={cat} className="flex items-center justify-between text-[11px] text-slate-800 cursor-pointer">
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
                    className="flex-1 bg-[#d9444a] hover:bg-[#c23a40] transition text-white text-[11px] font-semibold py-2 rounded-md"
                  >
                    Hapus
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 bg-[#fbbf24] hover:bg-[#f59e0b] transition text-slate-900 text-[11px] font-semibold py-2 rounded-md"
                >
                  Simpan
                </button>
                <ConfirmDialog
                    open={confirmOpen}
                    onCancel={() => setConfirmOpen(false)}
                    onConfirm={async () => {
                        setConfirmOpen(false);
                        await handleDelete();
                    }}
                    />
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}