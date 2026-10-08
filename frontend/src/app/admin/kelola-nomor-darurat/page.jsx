"use client";

import { useState, useEffect } from "react";
import Image from "next/image"; // Tambahkan import Image
import {
  Plus,
  Flame,
  HeartPulse,
  Shield,
  Fuel,
  Wrench,
  Phone,
} from "lucide-react";

import {
  getEmergencyApi,
  createEmergency,
  updateEmergency,
  deleteEmergency,
} from "@/lib/api";

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

const toDbCategory = (cat) => (cat ? cat.toLowerCase() : "");
const toUiCategory = (cat) =>
  CATEGORIES.find((c) => c.toLowerCase() === String(cat || "").toLowerCase()) || "";

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
  const [list, setList] = useState([]);
  const [mode, setMode] = useState(null); // null | "add" | "edit"
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentArea, setCurrentArea] = useState("");

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

useEffect(() => {
  fetchList();
}, []);

const fetchList = async () => {
  try {
    setLoading(true);
    setErrorMessage("");
    const res = await getEmergencyApi();
    setList(Array.isArray(res) ? res : res?.data || []);
  } catch (error) {
    console.error("Gagal mengambil nomor darurat:", error);
    setErrorMessage(error.message || "Gagal memuat data.");
    setList([]);
  } finally {
    setLoading(false);
  }
};

  const [confirmOpen, setConfirmOpen] = useState(false);
  // Kategori dipilih satu saja (tampilan checkbox, perilaku seperti radio)
  const pickCategory = (cat) =>
    setForm((f) => ({ ...f, category: f.category === cat ? "" : cat }));

  // ---------- Buka form ----------
  const openAdd = () => {
  setForm(emptyForm);
  setCurrentArea("");
  setSelectedId(null);
  setMode("add");
};

  const openEdit = (item) => {
  setForm({
    name: item.agency_name || "",
    phone: item.telephone || "",
    region: EMPTY_REGION, // picker dikosongkan, alamat lama tampil sebagai teks
    street: item.location || "",
    category: toUiCategory(item.category),
    lat: item.latitude ?? emptyForm.lat,
    lng: item.longitude ?? emptyForm.lng,
  });
  setCurrentArea(item.area || item.region || "");
  setSelectedId(item.id);
  setMode("edit");
};

  // ---------- Simpan & Hapus ----------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.category) {
    alert("Pilih salah satu kategori.");
    return;
  }

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

    await fetchList();
    setMode(null);
    setSelectedId(null);
  } catch (error) {
    console.error("Gagal menyimpan nomor darurat:", error);
    alert(`Gagal menyimpan: ${error.message}`);
  }
};

  const handleDelete = async () => {
  if (!selectedId) return;
  try {
    await deleteEmergency(selectedId);
    await fetchList();
    setMode(null);
    setSelectedId(null);
  } catch (error) {
    console.error("Gagal menghapus nomor darurat:", error);
    alert(`Gagal menghapus: ${error.message}`);
  }
};

  const inputClass =
  "w-full border border-slate-200 rounded-md px-3 py-2 text-xs md:text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#1a9fb8]";
  const labelClass = "block text-xs md:text-sm text-slate-600 font-medium mb-1.5";

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#eceef7] font-sans pb-10">
      <main className="w-[84%] mx-auto pt-5 space-y-4">
        {/* Judul */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
             {/* Ganti icon MapPin dengan Image at-icons_location.png */}
            <div className="w-17 h-17 relative shrink-0">
               <Image 
                 src="/icons_location.png" 
                 alt="Location Icon"
                 fill
                 className="object-contain"
               />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">Kelola Nomor Darurat</h1>
              <p className="text-xs md:text-sm text-slate-600 font-medium mt-0.5">
                Berisikan nomor, alamat, kategori, wilayah
              </p>
            </div>
          </div>
          <button
            onClick={openAdd}
            className="bg-[#1a9fb8] hover:bg-[#158aa0] transition text-white text-xs font-bold px-4 py-2 rounded-md flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah Nomor
          </button>
        </div>

        <div className={mode ? "grid grid-cols-1 lg:grid-cols-2 gap-5 items-start" : ""}>
          {/* Daftar Nomor Darurat */}
          <div className="space-y-3">
            {loading && <p className="text-xs text-slate-500">Memuat data...</p>}
            {errorMessage && <p className="text-xs text-red-500">{errorMessage}</p>}
            {!loading && !errorMessage && list.length === 0 && (
              <p className="text-xs text-slate-500">Belum ada data.</p>
            )}

            {list.map((item) => {
              const Icon = CATEGORY_ICON[toUiCategory(item.category)] || Phone;
              return (
                <div
                key={item.id}
                onClick={() => openEdit(item)}
                className={`bg-white rounded-md shadow flex items-center gap-3 px-3 py-3.5 cursor-pointer border-2 transition ${
                  selectedId === item.id ? "border-[#2563eb]" : "border-transparent hover:border-slate-200"
                }`}
              >
                  <div className="w-10 h-10 rounded-full bg-[#1a9fb8] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div div className="min-w-0">
                    <h3 className="text-xs md:text-sm font-bold text-slate-900 leading-tight">{item.agency_name}</h3>
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
              <h2 className="text-sm md:text-base font-bold text-slate-800">
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
                <label className={labelClass}>Provinsi, Kabupaten/Kota, Kecamatan</label>
                <RegionPicker
                  value={form.region}
                  onChange={(region) => setForm((f) => ({ ...f, region }))}
                />
                {mode === "edit" && currentArea && (
                  <p className="text-xs md:text-sm text-slate-600 mt-1.5">
                    Tersimpan: {currentArea} (pilih ulang hanya jika ingin mengubah)
                  </p>
                )}
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
                    <label key={cat} className="flex items-center justify-between text-xs md:text-sm text-slate-600 font-medium cursor-pointer">
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
                    className="flex-1 bg-[#d9444a] hover:bg-[#c23a40] transition text-white text-xs font-bold py-2 rounded-md"
                  >
                    Hapus
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 bg-[#fbbf24] hover:bg-[#f59e0b] transition text-slate-900 text-xs font-bold py-2 rounded-md"
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