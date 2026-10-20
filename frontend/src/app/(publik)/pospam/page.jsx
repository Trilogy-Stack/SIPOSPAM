"use client";

import { useState, useEffect } from "react";
import {
  MapPin,
  Phone,
  Locate,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  X,
  Cross,
  ParkingCircle,
  Check,
  Search,
  Park,
  Mosque,
  Toilet,
} from "lucide-react";
import { getPospamsApi } from "@/lib/api";
import OneTapCall from "../components/oneTapCall";
import dynamic from "next/dynamic";
import RegionSearch from "../components/regionSearch";

const PublikMap = dynamic(() => import("@/components/shared/map/PublikMap"), {
  ssr: false,
  loading: () => <p className="text-xs text-blue-600 p-4">Memuat peta...</p>,
});

const DEFAULT_FACILITIES = ["Toilet", "Mushola", "Medis", "Parkir Area", "Rest Area"];
const FACILITY_ICON = {
  Toilet: Toilet,
  Mushola: Mosque,
  Medis: Cross,
  "Parkir Area": ParkingCircle,
  "Rest Area": Park,
};

const formatWaNumber = (phone) => {
  if (!phone) return "";
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.slice(1);
  }
  return cleaned;
};

const parsePhotos = (photoData) => {
  if (!photoData) return [];
  if (Array.isArray(photoData)) return photoData;
  if (typeof photoData === "string") {
    try {
      const parsed = JSON.parse(photoData);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      if (photoData.includes(",")) {
        return photoData.split(",").map((s) => s.trim());
      }
      if (photoData.startsWith("http")) {
        return [photoData];
      }
    }
  }
  return [];
};

const normalizePospam = (p) => {
  const addressParts = [p.street, p.location, p.area].filter(Boolean);
  const fullAddress =
    p.address || p.alamat || (addressParts.length > 0 ? addressParts.join(", ") : "");

  return {
    id: p.id,
    name: p.name || p.nama_pos || "Pospam",
    region: p.region || "",
    coordinator: p.koor_name || p.nama_kordinator || "",
    phone: p.koor_phone || p.phone || p.no_hp || "",
    address: fullAddress,
    location: p.location || p.area || "",
    lat: p.latitude ?? p.lat ?? null,
    lng: p.longitude ?? p.lng ?? null,
    facilities: p.facility || p.facilities || [],
    photos: parsePhotos(p.photo || p.photos),
  };
};

function calculateHaversine(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDistance(km) {
  if (km == null) return null;
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

export default function PospamPage() {
  const [region, setRegion] = useState("");
  const [availableRegions, setAvailableRegions] = useState([]);
  const [allPospams, setAllPospams] = useState([]);
  const [pospams, setPospams] = useState([]);
  const [userCoords, setUserCoords] = useState(null);
  const [isLoadingLoc, setIsLoadingLoc] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    photos: [],
    currentIndex: 0,
  });

  const filterAndSortPospams = (dataList, selectedRegion, coords) => {
    if (!selectedRegion && !coords) {
      setPospams([]);
      return;
    }

    let filtered = [...dataList];

    if (selectedRegion) {
      const target = selectedRegion.toLowerCase().trim();
      filtered = filtered.filter((item) => {
        const reg = (item.region || "").toLowerCase().trim();
        const addr = (item.address || "").toLowerCase().trim();
        const loc = (item.location || "").toLowerCase().trim();

        return (
          reg === target ||
          reg.includes(target) ||
          addr.includes(target) ||
          loc.includes(target)
        );
      });
    }

    if (coords) {
      filtered = filtered
        .map((item) => ({
          ...item,
          distance: calculateHaversine(coords.lat, coords.lng, item.lat, item.lng),
        }))
        .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
    } else {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    setPospams(filtered);
  };

  const fetchData = async () => {
    try {
      const res = await getPospamsApi({ limit: 1000 });
      const rawArr = Array.isArray(res) ? res : res.data || [];
      const normalized = rawArr.map(normalizePospam);

      const regionsList = Array.from(
        new Set(
          normalized
            .map((item) => item.region)
            .filter((reg) => reg && reg.trim() !== "" && reg !== "-")
        )
      ).sort();
      setAvailableRegions(regionsList);

      setAllPospams(normalized);
      filterAndSortPospams(normalized, region, userCoords);
    } catch (err) {
      console.error("Gagal ambil data pospam:", err);
      setPospams([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterAndSortPospams(allPospams, region, userCoords);
  }, [region, userCoords]);

  const handleAktifkanLokasi = () => {
    if (!navigator.geolocation) {
      alert("Browser Anda tidak mendukung Geolocation");
      return;
    }

    setIsLoadingLoc(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };

        let detectedRegion = "";
        let minDistance = Infinity;

        allPospams.forEach((item) => {
          if (item.lat != null && item.lng != null) {
            const dist = calculateHaversine(coords.lat, coords.lng, item.lat, item.lng);
            if (dist !== null && dist < minDistance) {
              minDistance = dist;
              detectedRegion = item.region;
            }
          }
        });

        if (detectedRegion) {
          setRegion(detectedRegion);
        }

        setUserCoords(coords);
        setIsLoadingLoc(false);
      },
      () => {
        alert("Gagal mendapatkan lokasi. Pastikan GPS aktif.");
        setIsLoadingLoc(false);
      }
    );
  };

  const handleResetLokasi = () => {
    setUserCoords(null);
    setRegion("");
  };

  const handlePrevPhoto = () => {
    setPreviewModal((prev) => ({
      ...prev,
      currentIndex:
        (prev.currentIndex - 1 + prev.photos.length) % prev.photos.length,
    }));
  };

  const handleNextPhoto = () => {
    setPreviewModal((prev) => ({
      ...prev,
      currentIndex: (prev.currentIndex + 1) % prev.photos.length,
    }));
  };

  return (
    <div className="w-full pb-24 text-slate-800">
      {/* GRID RESPONGIF: 1 Kolom di HP, 12 Kolom Split-Screen di Tablet & Laptop */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* ================================================================= */}
        {/* KOLOM KIRI (PETA): Tampil Sticky di Layar Tablet/Laptop           */}
        {/* ================================================================= */}
        <div className="md:col-span-6 lg:col-span-7 md:sticky md:top-6 order-1 md:order-1">
          <div className="w-full h-72 md:h-[calc(100vh-7rem)] bg-blue-100 rounded-2xl overflow-hidden relative isolate flex items-center justify-center border border-blue-200 shadow-sm">
            <PublikMap pospams={pospams.length ? pospams : allPospams} userCoords={userCoords} />
          </div>
        </div>

        {/* ================================================================= */}
        {/* KOLOM KANAN: Filter, Tombol GPS & Daftar Pospam                    */}
        {/* ================================================================= */}
        <div className="md:col-span-6 lg:col-span-5 space-y-4 order-2 md:order-2">
          
          {/* Filter Region Search */}
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">
              Pospam Terdekat
            </label>
            <RegionSearch
              value={region}
              onChange={setRegion}
              options={availableRegions}
              placeholder="Cari Daerah / Kota"
            />
          </div>

          {/* Tombol Aktifkan Lokasi */}
          <button
            onClick={handleAktifkanLokasi}
            disabled={isLoadingLoc}
            className={`w-full text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition active:scale-98 ${
              userCoords
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            <Locate className="w-4 h-4" />
            {isLoadingLoc
              ? "Mendeteksi Lokasi..."
              : userCoords
              ? "Perbarui Lokasi Saya"
              : "Aktifkan Lokasi"}
          </button>

          {/* BADGE KOORDINAT + TOMBOL RESET (X) */}
          {userCoords && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between shadow-sm animate-in fade-in duration-200">
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-xs">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Lokasi Anda Berhasil Terdeteksi</span>
                </div>
                <p className="text-[11px] font-mono text-emerald-600 mt-0.5">
                  Lat: <span className="font-bold">{userCoords.lat.toFixed(6)}</span> | Lng:{" "}
                  <span className="font-bold">{userCoords.lng.toFixed(6)}</span>
                </p>
              </div>

              <button
                onClick={handleResetLokasi}
                title="Hapus filter lokasi"
                className="bg-emerald-200/80 hover:bg-emerald-300 text-emerald-800 p-1.5 rounded-full transition shrink-0 ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Daftar Pospam */}
          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-sm text-slate-800">Daftar Pospam</h3>

            {/* PESAN STATE KOSONG */}
            {pospams.length === 0 ? (
              <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-8 text-center my-4 space-y-2">
                <Search className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-medium text-slate-500 max-w-[220px] mx-auto leading-relaxed">
                  Cari berdasarkan wilayah atau aktifkan lokasi Anda
                </p>
              </div>
            ) : (
              pospams.map((item) => {
                const isExpanded = expandedId === item.id;

                const availableDefaultFacilities = item.facilities.filter((f) =>
                  DEFAULT_FACILITIES.includes(f)
                );
                const otherFacilities = item.facilities.filter(
                  (f) => !DEFAULT_FACILITIES.includes(f)
                );

                return (
                  <div
                    key={item.id}
                    className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm transition-all"
                  >
                    <div
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="cursor-pointer select-none space-y-2"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-slate-900 text-base">{item.name}</h4>
                          {item.distance != null && (
                            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full inline-block mt-1">
                              ± {formatDistance(item.distance)} dari posisi Anda
                            </span>
                          )}
                        </div>
                        <div className="text-slate-400 pt-1">
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </div>

                      {!isExpanded && availableDefaultFacilities.length > 0 && (
                        <div className="flex items-center gap-2 pt-1">
                          {availableDefaultFacilities.map((fac) => {
                            const IconComp = FACILITY_ICON[fac] || Check;
                            return (
                              <div
                                key={fac}
                                title={fac}
                                className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-600"
                              >
                                <IconComp className="w-4 h-4" />
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div
                      inert={!isExpanded ? "" : undefined}
                      className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out motion-reduce:transition-none ${
                        isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="space-y-3 pt-3 border-t border-slate-100 mt-3">
                          <div className="space-y-1.5 text-xs text-slate-600">
                            <p className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                              {item.address || "Alamat belum diatur"}
                            </p>
                            <p className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                              {item.phone || "-"} {item.coordinator ? `(${item.coordinator})` : ""}
                            </p>
                          </div>

                          {availableDefaultFacilities.length > 0 && (
                            <div className="text-xs space-y-1.5 pt-1">
                              <span className="font-semibold text-slate-700">Fasilitas Utama:</span>
                              <div className="grid grid-cols-2 gap-2 text-slate-700 text-xs">
                                {availableDefaultFacilities.map((fac) => {
                                  const IconComp = FACILITY_ICON[fac] || Check;
                                  return (
                                    <div key={fac} className="flex items-center gap-2">
                                      <div className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 text-slate-600 shrink-0">
                                        <IconComp className="w-3.5 h-3.5" />
                                      </div>
                                      <span>{fac}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {otherFacilities.length > 0 && (
                            <div className="text-xs space-y-1 pt-1">
                              <span className="font-semibold text-slate-700">Fasilitas Lainnya:</span>
                              <div className="grid grid-cols-2 gap-1 text-slate-500 text-[11px]">
                                {otherFacilities.map((f, i) => (
                                  <div key={i}>{f}</div>
                                ))}
                              </div>
                            </div>
                          )}

                          {item.photos && item.photos.length > 0 && (
                            <div className="pt-2 space-y-1.5">
                              <span className="font-semibold text-slate-700 text-xs block">
                                Foto Lokasi:
                              </span>
                              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                                {item.photos.map((url, idx) => (
                                  <div
                                    key={idx}
                                    onClick={() =>
                                      setPreviewModal({
                                        isOpen: true,
                                        photos: item.photos,
                                        currentIndex: idx,
                                      })
                                    }
                                    className="w-20 h-20 shrink-0 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer hover:opacity-90 active:scale-95 transition"
                                  >
                                    <img
                                      src={url}
                                      alt={`Foto ${item.name} ${idx + 1}`}
                                      loading="lazy"
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex gap-2 pt-2">
                            <a
                              href={`https://wa.me/${formatWaNumber(item.phone)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex-1 py-2 border border-emerald-500 text-emerald-600 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 hover:bg-emerald-50"
                            >
                              <img src="/icons/whatsapp-icon.png" alt="" className="w-4 h-4 object-contain" /> Kirim WhatsApp
                            </a>
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${item.lat},${item.lng}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex-1 py-2 border border-blue-500 text-blue-600 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 hover:bg-blue-50"
                            >
                              <img src="/icons/google-maps.png" alt="" className="w-4 h-4 object-contain" /> Google Maps
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* MODAL LIGHTBOX SLIDER FOTO */}
      {previewModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-in fade-in duration-150">
          <div className="relative max-w-sm w-full flex flex-col items-center">
            <button
              onClick={() =>
                setPreviewModal({ isOpen: false, photos: [], currentIndex: 0 })
              }
              className="absolute -top-10 right-0 text-white bg-slate-800/80 p-2 rounded-full hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative w-full flex items-center justify-center">
              <img
                src={previewModal.photos[previewModal.currentIndex]}
                alt="Preview Foto Pospam"
                className="max-w-full max-h-[75vh] rounded-2xl object-contain shadow-2xl border border-slate-700"
              />

              {previewModal.photos.length > 1 && (
                <>
                  <button
                    onClick={handlePrevPhoto}
                    className="absolute left-2 text-white bg-black/60 p-2 rounded-full hover:bg-black/80 transition"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={handleNextPhoto}
                    className="absolute right-2 text-white bg-black/60 p-2 rounded-full hover:bg-black/80 transition"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {previewModal.photos.length > 1 && (
              <span className="text-white text-xs mt-3 bg-slate-800/80 px-3 py-1 rounded-full">
                {previewModal.currentIndex + 1} / {previewModal.photos.length}
              </span>
            )}
          </div>
        </div>
      )}

      <OneTapCall />
    </div>
  );
}