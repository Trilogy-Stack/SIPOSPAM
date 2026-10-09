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
import { useAuth } from "@/hooks/useAuth";
import { getRegionScope } from "@/lib/regionScope";
import PhotoLightbox from "@/components/admin/PhotoLightbox";

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
  name: p.name || "",
  coordinator: p.koor_name || "",
  phone: p.koor_phone || "",
  address: [formatRegion(p.location), p.area].filter(Boolean).join(", "),
  lat: p.latitude ?? null,
  lng: p.longitude ?? null,
  facilities: Array.isArray(p.facility) ? p.facility : [],
  photos: Array.isArray(p.photo) ? p.photo : [],
});

const normalizeEmergency = (e) => ({
  id: e.id,
  name: e.agency_name || "",
  phone: e.telephone || "",
  address:
    e.address ||
    e.alamat ||
    [e.location, formatRegion(e.region), e.area].filter(Boolean).join(", "),
  category: e.category || "",
  icon: e.icon || "",
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
    <div className="grid grid-cols-[110px_1fr] md:grid-cols-[130px_1fr] gap-1 text-xs md:text-sm">
      <span className="font-semibold text-slate-800">{label}</span>
      <span className="text-slate-600 font-medium">: {children}</span>
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
    <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-center gap-1">
      <p className="text-xs md:text-sm font-semibold text-slate-600">Tidak ada Detail Informasi Pengadu</p>
      <p className="text-xs text-slate-400">Pilih salah satu data pengaduan dari daftar</p>
    </div>
  );
}
// ---------- Halaman ----------
export default function AdminDashboardPage() {
  const { profile } = useAuth();
  const [pospamList, setPospamList] = useState([]);
  const [emergencyList, setEmergencyList] = useState([]);
  const [loadingPospam, setLoadingPospam] = useState(true);
  const [loadingEmergency, setLoadingEmergency] = useState(true);

  const [selectedPospam, setSelectedPospam] = useState(null);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [pageSizePospam, setPageSizePospam] = useState("10");
  const [pageSizeEmergency, setPageSizeEmergency] = useState("10");
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const todayFormatted = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
  fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [profile?.role, profile?.region]);

async function fetchData() {
  const scope = getRegionScope(profile);
  if (!scope.ready) return;

  if (scope.blocked) {
    setPospamList([]);
    setEmergencyList([]);
    setLoadingPospam(false);
    setLoadingEmergency(false);
    return;
  }

  try {
    const data = await getPospamsApi(scope.params);
    const arr = Array.isArray(data) ? data : data.data || [];
    setPospamList(arr.map(normalizePospam));
  } catch (error) {
    console.error("Error fetching pospam:", error);
    setPospamList([]);
  } finally {
    setLoadingPospam(false);
  }

  try {
    const data = await getEmergencyApi(scope.params);
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
        width={68} 
        height={68} 
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
              <div className="space-y-3">
                <h2 className="text-sm md:text-base font-bold text-slate-800">
                  Detail Lokasi {selectedPospam.name}
                </h2>
                <MapEmbed lat={selectedPospam.lat} lng={selectedPospam.lng} />

                <h3 className="text-sm md:text-base font-bold text-slate-900 pt-1">Detail Informasi Pengadu</h3>
                <div className="space-y-1.5">
                  <Row label="Nama Kordinator">{selectedPospam.coordinator || "-"}</Row>
                  <Row label="Alamat">{selectedPospam.address || "-"}</Row>
                  <Row label="No Kontak">{selectedPospam.phone || "-"}</Row>
                  <Row label="Koordinat">{formatCoord(selectedPospam.lat, selectedPospam.lng)}</Row>
                  <Row label="Fasilitas">&nbsp;</Row>
                </div>

                {defaultFacilities.length > 0 && (
                  <div className="grid grid-flow-col grid-rows-3 auto-cols-fr gap-x-6 gap-y-2.5 text-xs md:text-sm text-slate-600 font-medium">
                    {defaultFacilities.map((f) => {
                      const Icon = FACILITY_ICON[f] || Check;
                      return (
                        <span key={f} className="flex items-center gap-2">
                          <Icon className="w-4 h-4 shrink-0" />
                          {f}
                        </span>
                      );
                    })}
                  </div>
                )}

                {otherFacilities.length > 0 && (
                  <div>
                    <p className="text-xs md:text-sm font-semibold text-slate-800 mb-1.5">Fasilitas Lainnya:</p>
                    <ol className="grid grid-flow-col grid-rows-3 gap-x-6 gap-y-1 text-xs md:text-sm text-slate-600 font-medium list-none">
                      {otherFacilities.map((f, i) => (
                        <li key={f}>
                          {i + 1}. {f}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {photos.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {photos.slice(0, 4).map((url, i) => {
                      const extra = photos.length - 4;
                      const showMore = i === 3 && extra > 0;
                      return (
                        <button
                          key={url + i}
                          type="button"
                          onClick={() => setLightboxIndex(i)}
                          title="Klik untuk melihat foto"
                          className="group relative aspect-square rounded-md overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#1a9fb8]"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={url}
                            alt={`Foto fasilitas ${i + 1}`}
                            className="w-full h-full object-cover transition group-hover:scale-105"
                          />
                          {showMore && (
                            <span className="absolute inset-0 bg-black/55 text-white text-sm md:text-base font-semibold flex items-center justify-center">
                              +{extra}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                <PhotoLightbox
                  photos={photos}
                  index={lightboxIndex}
                  onClose={() => setLightboxIndex(null)}
                  onChange={setLightboxIndex}
                />
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
              <div className="space-y-3">
                 <h2 className="text-sm md:text-base font-bold text-slate-800">
                  Detail Lokasi {selectedEmergency.name}
                </h2>
                <MapEmbed lat={selectedEmergency.lat} lng={selectedEmergency.lng} />

                <h3 className="text-sm md:text-base font-bold text-slate-900 pt-1">Detail Instansi</h3>
                <div className="space-y-2">
                  <Row label="Nama Instansi">{selectedEmergency.name || "-"}</Row>
                  <Row label="Alamat">{selectedEmergency.address || "-"}</Row>
                  <Row label="Nomor">{selectedEmergency.phone || "-"}</Row>
                   <div className="grid grid-cols-[110px_1fr] md:grid-cols-[130px_1fr] gap-1 text-xs md:text-sm items-center">
                      <span className="font-semibold text-slate-800">Kategori</span>
                      <span className="text-slate-600 font-medium">
                      :{" "}
                      {selectedEmergency.category ? (
                        <span className="inline-block bg-slate-200 text-slate-700 rounded-full px-5 py-1 ml-1">
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