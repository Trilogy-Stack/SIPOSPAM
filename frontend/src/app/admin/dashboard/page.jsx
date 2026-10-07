"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { getPospamsApi, getEmergencyApi } from "@/lib/api";
import { formatRegion } from "@/components/admin/RegionPicker";
import {
  MapPin,
  Phone,
  ChevronDown,
  Bath,
  Moon,
  Cross,
  ParkingCircle,
  Coffee,
  Check,
} from "lucide-react";

const CATEGORIES = ["Bencana", "Medis", "BBM", "Bengkel", "Keamanan"];
const DEFAULT_FACILITIES = ["Toilet", "Mushola", "Medis", "Parkir Area", "Rest Area"];
const FACILITY_ICON = {
  Toilet: Bath,
  Mushola: Moon,
  Medis: Cross,
  "Parkir Area": ParkingCircle,
  "Rest Area": Coffee,
};

// ---------- Normalisasi data backend ----------
const normalizePospam = (p) => ({
  id: p.id,
  name: p.name || p.nama_pos || "",
  coordinator: p.koor_name || p.nama_kordinator || "",
  phone: p.koor_phone || p.phone || p.no_hp || "",
  address:
    p.address ||
    p.alamat ||
    [p.street, formatRegion(p.location), p.area].filter(Boolean).join(", "),
  lat: p.latitude,
  lng: p.longitude,
  facilities: p.facility || [],
  photos: p.photo || [],
});

const normalizeEmergency = (e) => ({
  id: e.id,
  name: e.name || e.nama_instansi || "",
  phone: e.phone || e.no_hp || "",
  address:
    e.address ||
    e.alamat ||
    [e.street, formatRegion(e.region)].filter(Boolean).join(", "),
  category: e.category || "",
  lat: e.lat ?? e.latitude ?? null,
  lng: e.lng ?? e.longitude ?? null,
});

// ---------- Helper ----------
const toDMS = (deg, pos, neg) => {
  const abs = Math.abs(deg);
  const d = Math.floor(abs);
  const m = Math.floor((abs - d) * 60);
  const s = ((abs - d) * 60 - m) * 60;
  return `${d}°${String(m).padStart(2, "0")}'${s.toFixed(1)}"${deg >= 0 ? pos : neg}`;
};
const formatCoord = (lat, lng) =>
  lat == null || lng == null ? "-" : `${toDMS(lat, "N", "S")} ${toDMS(lng, "E", "W")}`;

// ---------- Komponen kecil ----------
function MapEmbed({ lat, lng }) {
  if (lat == null || lng == null) {
    return (
      <div className="h-[180px] rounded-lg bg-slate-100 flex items-center justify-center text-xs text-slate-400">
        Lokasi belum diatur
      </div>
    );
  }
  return (
    <div className="h-[180px] rounded-lg overflow-hidden border border-slate-200">
      <iframe
        title="Peta lokasi"
        className="w-full h-full"
        loading="lazy"
        src={`https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
      />
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-1 text-xs text-slate-800">
      <span className="font-semibold">{label}</span>
      <span>: {children}</span>
    </div>
  );
}

function ListItem({ title, address, contact, selected, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`px-4 py-3 rounded-lg cursor-pointer transition shadow-sm ${
        selected ? "bg-[#1a9fb8] text-white" : "bg-[#a6e8fa] hover:bg-[#92e0f4] text-slate-900"
      }`}
    >
      <h3 className="font-bold text-xs md:text-sm mb-1">{title}</h3>
      <div className="text-xs space-y-1">
        <p className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span>{address || "-"}</span>
        </p>
        <p className="flex items-center gap-2">
          <Phone className="w-3.5 h-3.5 shrink-0" />
          <span>{contact || "-"}</span>
        </p>
      </div>
    </div>
  );
}

function PageSize({ value, onChange }) {
  return (
    <div className="flex items-center justify-center gap-2 text-xs text-slate-600">
      <span>Tampilkan data</span>
      <div className="relative inline-block">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-white border border-slate-400 rounded-full px-3 py-1 pr-6 text-xs text-slate-700 appearance-none focus:outline-none cursor-pointer"
        >
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
        </select>
        <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
      </div>
    </div>
  );
}

function EmptyDetail() {
  return (
    <div className="h-full min-h-[250px] flex flex-col items-center justify-center text-center gap-1">
      <p className="text-xs font-semibold text-slate-600">Tidak ada Detail Informasi Pengadu</p>
      <p className="text-xs text-slate-400">Pilih salah satu data pengaduan dari daftar</p>
    </div>
  );
}

// ---------- Halaman ----------
export default function AdminDashboardPage() {
  const [pospamList, setPospamList] = useState([]);
  const [emergencyList, setEmergencyList] = useState([]);
  const [loadingPospam, setLoadingPospam] = useState(true);
  const [loadingEmergency, setLoadingEmergency] = useState(true);

  const [selectedPospam, setSelectedPospam] = useState(null);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [pageSizePospam, setPageSizePospam] = useState("10");
  const [pageSizeEmergency, setPageSizeEmergency] = useState("10");
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  const todayFormatted = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const data = await getPospamsApi();
      const arr = Array.isArray(data) ? data : data.data || [];
      setPospamList(arr.map(normalizePospam));
    } catch (error) {
      console.error("Error fetching pospam:", error);
      setPospamList([]);
    } finally {
      setLoadingPospam(false);
    }

    try {
      const data = await getEmergencyApi();
      const arr = Array.isArray(data) ? data : data.data || [];
      setEmergencyList(arr.map(normalizeEmergency));
    } catch (error) {
      console.error("Error fetching emergency:", error);
      setEmergencyList([]);
    } finally {
      setLoadingEmergency(false);
    }
  }

  const filteredEmergency = emergencyList.filter((item) =>
    activeCategory ? item.category?.toLowerCase() === activeCategory.toLowerCase() : true
  );

  const otherFacilities = selectedPospam
    ? selectedPospam.facilities.filter((f) => !DEFAULT_FACILITIES.includes(f))
    : [];
  const defaultFacilities = selectedPospam
    ? selectedPospam.facilities.filter((f) => DEFAULT_FACILITIES.includes(f))
    : [];
  const photos = selectedPospam?.photos || [];
  const visiblePhotos = showAllPhotos ? photos : photos.slice(0, 4);

  const cardClass = "bg-white rounded-xl shadow-sm p-5 border border-slate-100";

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#eaedf6] font-sans pb-12">
      <main className="w-[84%] mx-auto pt-5 space-y-4">
        {/* Judul & Tanggal */}
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
      <Image 
        src="/icons_location.png" 
        alt="location icon" 
        width={70} 
        height={70} 
        className="shrink-0"
      />
    
    <div>
      <h1 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">
        Dashboard SIPOSPAM
      </h1>
      <p className="text-xs md:text-sm text-slate-600 font-medium mt-0.5">
        Daftar Pos Pengamanan pada wilayah Anda.
      </p>
    </div>
  </div>
  <div className="text-xs md:text-sm font-semibold text-slate-800 pt-1">
    {todayFormatted}
  </div>
</div>

        {/* Tombol Menu Utama */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Link
            href="/admin/kelola-pospam"
            className="bg-[#1b9fb8] hover:bg-[#158aa0] transition text-white py-10 md:py-12 rounded-xl font-bold text-xl md:text-2xl shadow-sm text-center flex items-center justify-center"
          >
            Kelola Pospam
          </Link>
          <Link
            href="/admin/kelola-nomor-darurat"
            className="bg-[#1b9fb8] hover:bg-[#158aa0] transition text-white py-10 md:py-12 rounded-xl font-bold text-xl md:text-2xl shadow-sm text-center flex items-center justify-center"
          >
            Kelola Nomor Darurat
          </Link>
        </div>

        {/* ===== Section POSPAM ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
          {/* Daftar Pospam */}
          <div className={`${cardClass} flex flex-col justify-between min-h-[420px]`}>
            <div>
              <h2 className="text-sm md:text-base font-bold text-slate-800 mb-4">
                Daftar Pospam ({pospamList.length})
              </h2>

              {loadingPospam ? (
                <p className="py-12 text-center text-xs text-slate-400">Memuat data POSPAM...</p>
              ) : pospamList.length === 0 ? (
                <p className="py-12 text-center text-xs text-slate-400">
                  Belum ada data POSPAM yang diinputkan.
                </p>
              ) : (
                <div className="space-y-3">
                  {pospamList.slice(0, Number(pageSizePospam)).map((item) => (
                    <ListItem
                      key={item.id}
                      title={item.name}
                      address={item.address}
                      contact={`${item.coordinator || "-"} ${item.phone || "-"}`}
                      selected={selectedPospam?.id === item.id}
                      onClick={() => {
                        setSelectedPospam(item);
                        setShowAllPhotos(false);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="pt-6">
              <PageSize value={pageSizePospam} onChange={setPageSizePospam} />
            </div>
          </div>

          {/* Detail Pospam */}
          <div className={cardClass}>
            {selectedPospam ? (
              <div className="space-y-4">
                <h2 className="text-sm md:text-base font-bold text-slate-800">
                  Detail Lokasi {selectedPospam.name}
                </h2>
                <MapEmbed lat={selectedPospam.lat} lng={selectedPospam.lng} />

                <h3 className="text-xs md:text-sm font-bold text-slate-900 pt-2">
                  Detail Informasi Pengadu
                </h3>
                <div className="space-y-1.5">
                  <Row label="Nama Kordinator">{selectedPospam.coordinator || "-"}</Row>
                  <Row label="Alamat">{selectedPospam.address || "-"}</Row>
                  <Row label="No Kontak">{selectedPospam.phone || "-"}</Row>
                  <Row label="Koordinat">{formatCoord(selectedPospam.lat, selectedPospam.lng)}</Row>
                  <Row label="Fasilitas">&nbsp;</Row>
                </div>

                {defaultFacilities.length > 0 && (
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs text-slate-800">
                    {defaultFacilities.map((f) => {
                      const Icon = FACILITY_ICON[f] || Check;
                      return (
                        <span key={f} className="flex items-center gap-2">
                          <Icon className="w-4 h-4 shrink-0 text-slate-600" />
                          {f}
                        </span>
                      );
                    })}
                  </div>
                )}

                {otherFacilities.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-800 mb-1">Fasilitas Lainnya:</p>
                    <ol className="grid grid-flow-col grid-rows-3 gap-x-6 text-xs text-slate-800 list-none">
                      {otherFacilities.map((f, i) => (
                        <li key={f}>
                          {i + 1}. {f}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {photos.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 pt-2">
                    {visiblePhotos.map((url, i) => {
                      const isLast = !showAllPhotos && i === 3 && photos.length > 4;
                      return (
                        <div key={url + i} className="relative h-16 rounded-lg overflow-hidden border border-slate-200">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          {isLast && (
                            <button
                              type="button"
                              onClick={() => setShowAllPhotos(true)}
                              className="absolute inset-0 bg-black/60 text-white text-[10px] font-semibold flex items-center justify-center text-center p-1"
                            >
                              Lihat Lainnya
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <EmptyDetail />
            )}
          </div>
        </div>

        {/* ===== Section NOMOR DARURAT ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
          {/* Daftar Nomor Darurat */}
          <div className={`${cardClass} flex flex-col justify-between min-h-[420px]`}>
            <div>
              <h2 className="text-sm md:text-base font-bold text-slate-800 mb-4">
                Daftar Nomor Darurat ({filteredEmergency.length})
              </h2>

              <div className="flex flex-wrap gap-2 mb-4">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition ${
                      activeCategory === cat
                        ? "bg-slate-700 text-white"
                        : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {loadingEmergency ? (
                <p className="py-12 text-center text-xs text-slate-400">
                  Memuat data Nomor Darurat...
                </p>
              ) : filteredEmergency.length === 0 ? (
                <p className="py-12 text-center text-xs text-slate-400">
                  Belum ada data Nomor Darurat yang diinputkan.
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredEmergency.slice(0, Number(pageSizeEmergency)).map((item) => (
                    <ListItem
                      key={item.id}
                      title={item.name}
                      address={item.address}
                      contact={item.phone}
                      selected={selectedEmergency?.id === item.id}
                      onClick={() => setSelectedEmergency(item)}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="pt-6">
              <PageSize value={pageSizeEmergency} onChange={setPageSizeEmergency} />
            </div>
          </div>

          {/* Detail Nomor Darurat */}
          <div className={cardClass}>
            {selectedEmergency ? (
              <div className="space-y-4">
                <h2 className="text-sm md:text-base font-bold text-slate-800">
                  Detail Lokasi {selectedEmergency.name}
                </h2>
                <MapEmbed lat={selectedEmergency.lat} lng={selectedEmergency.lng} />

                <h3 className="text-xs md:text-sm font-bold text-slate-900 pt-2">
                  Detail Instansi
                </h3>
                <div className="space-y-2">
                  <Row label="Nama Instansi">{selectedEmergency.name || "-"}</Row>
                  <Row label="Alamat">{selectedEmergency.address || "-"}</Row>
                  <Row label="Nomor">{selectedEmergency.phone || "-"}</Row>
                  <div className="grid grid-cols-[120px_1fr] gap-1 text-xs text-slate-800 items-center">
                    <span className="font-semibold">Kategori</span>
                    <span>
                      :{" "}
                      {selectedEmergency.category ? (
                        <span className="inline-block bg-slate-200 text-slate-700 font-medium rounded-full px-4 py-0.5 ml-1 text-xs">
                          {selectedEmergency.category}
                        </span>
                      ) : (
                        "-"
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyDetail />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}